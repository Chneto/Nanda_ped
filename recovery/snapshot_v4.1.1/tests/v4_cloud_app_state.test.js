import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { PediatricStore, MACRO_GROUPS } from '../js/store.js';
import {
  loadUserState,
  saveUserState,
  _setCloudStateClientForTesting,
  _resetCloudStateForTesting
} from '../js/cloudState.js';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

class SnapshotSupabaseMock {
  rows = new Map();

  from(tableName) {
    assert.equal(tableName, 'user_app_state');
    const filters = [];
    let operation = 'select';
    let payload = null;
    const builder = {
      select: () => builder,
      insert: (record) => { operation = 'insert'; payload = record; return builder; },
      update: (record) => { operation = 'update'; payload = record; return builder; },
      eq: (column, value) => { filters.push([column, value]); return builder; },
      maybeSingle: async () => {
        const userFilter = filters.find(([column]) => column === 'user_id');
        const revisionFilter = filters.find(([column]) => column === 'revision');
        const userId = userFilter?.[1];

        if (operation === 'insert') {
          if (this.rows.has(payload.user_id)) {
            return { data: null, error: { code: '23505', message: 'duplicate key' } };
          }
          this.rows.set(payload.user_id, { ...payload });
          return { data: { revision: payload.revision, updated_at: payload.updated_at }, error: null };
        }

        const current = this.rows.get(userId);
        if (!current) return { data: null, error: null };
        if (operation === 'update') {
          if (revisionFilter && current.revision !== revisionFilter[1]) return { data: null, error: null };
          const updated = { ...current, ...payload };
          this.rows.set(userId, updated);
          return { data: { revision: updated.revision, updated_at: updated.updated_at }, error: null };
        }
        return { data: { state: current.state, revision: current.revision, updated_at: current.updated_at }, error: null };
      }
    };
    return builder;
  }
}

describe('V4_Cloud per-user app state and expense editing', () => {
  let previousStorage;

  beforeEach(() => {
    previousStorage = globalThis.localStorage;
    globalThis.localStorage = new MemoryStorage();
    _resetCloudStateForTesting();
  });

  afterEach(() => {
    _resetCloudStateForTesting();
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  });

  test('local account scopes restore one account without exposing its records to another', async () => {
    const store = new PediatricStore();
    store.data.expenses.push({ id: 'legacy-local', description: 'Local antigo', amount: 15, date: '2026-10-01' });
    store.save();

    await store.switchUserScope('user-a', { adoptCurrent: true });
    store.data.expenses.push({ id: 'private-a', description: 'Conta A', amount: 25, date: '2026-10-02' });
    store.save();

    await store.switchUserScope(null);
    assert.deepEqual(store.data.expenses.map(item => item.id), ['legacy-local']);
    await store.switchUserScope('user-b', { adoptCurrent: false });
    assert.deepEqual(store.data.expenses, []);

    await store.switchUserScope(null);
    await store.switchUserScope('user-a', { adoptCurrent: false });
    assert.deepEqual(store.data.expenses.map(item => item.id), ['legacy-local', 'private-a']);
  });

  test('custom expenses use their selected macro-group and generate UUID identifiers', () => {
    const store = new PediatricStore();
    const category = store.addCategory({ name: 'Fisioterapia Respiratória', macroGroup: 'Saúde & Autocuidado' });
    assert.ok(category);
    assert.match(category.id, /^[0-9a-f]{8}-[0-9a-f-]{27}$/i);

    store.saveExpense({ description: 'Sessão respiratória', amount: 180, date: '2026-10-03', category: category.name });
    assert.equal(store.data.expenses[0].macro_group, 'Saúde & Autocuidado');
    assert.equal(store.addCategory({ name: 'remédios', macroGroup: 'Saúde & Autocuidado' }), null);
  });

  test('renaming a custom category updates existing expenses without mutating shared taxonomy', () => {
    const store = new PediatricStore();
    const category = store.addCategory({ name: 'Pilates', macroGroup: 'Saúde & Autocuidado' });
    store.saveExpense({ description: 'Mensalidade', amount: 120, date: '2026-10-03', category: 'Pilates' });

    const updated = store.updateCustomCategory(category.id, {
      name: 'Pilates Terapêutico',
      macroGroup: 'Formação & Carreira'
    });
    assert.equal(updated.updated, true);
    assert.equal(store.data.expenses[0].category, 'Pilates Terapêutico');
    assert.equal(store.data.expenses[0].macro_group, 'Formação & Carreira');
    assert.equal(MACRO_GROUPS[4].categories.includes('Pilates'), false);

    const inUse = store.deleteCustomCategory('Pilates Terapêutico');
    assert.equal(inUse.deleted, false);
    assert.equal(inUse.inUse, true);
  });

  test('editing a single expense preserves installment identity and changes its classification', () => {
    const store = new PediatricStore();
    store.saveExpense({
      description: 'Notebook', amount: 1200, date: '2026-10-01', category: 'Estudo',
      isInstallment: true, totalInstallments: 3
    });
    const expense = store.data.expenses[1];
    const groupId = expense.installment_group_id;
    const edited = store.updateExpense(expense.id, {
      description: 'Notebook clínica', amount: 405, date: '2026-11-02', category: 'Cursos'
    });
    assert.equal(edited.installment_group_id, groupId);
    assert.equal(edited.current_installment, 2);
    assert.equal(edited.amount, 405);
    assert.equal(edited.macro_group, 'Formação & Carreira');
  });

  test('cloud snapshot is private, versioned, and rejects stale writes', async () => {
    const client = new SnapshotSupabaseMock();
    _setCloudStateClientForTesting(client);
    const initial = await saveUserState('user-a', {
      doctorName: 'Dra. A',
      doctorPhoto: 'data:image/png;base64,large-photo',
      expenses: [{ id: 'expense-a', amount: 100 }]
    });
    assert.equal(initial.saved, true);
    assert.equal(initial.revision, 1);

    const loaded = await loadUserState('user-a');
    assert.equal(loaded.state.doctorPhoto, null);
    assert.equal(loaded.state.creator, 'FChNeto');
    assert.equal((await loadUserState('user-b')).state, null);

    const updated = await saveUserState('user-a', { doctorName: 'Dra. A atualizada' }, 1);
    assert.equal(updated.saved, true);
    assert.equal(updated.revision, 2);

    const stale = await saveUserState('user-a', { doctorName: 'Valor antigo' }, 1);
    assert.equal(stale.saved, false);
    assert.equal(stale.conflict, true);
    assert.equal(stale.revision, 2);
  });
});

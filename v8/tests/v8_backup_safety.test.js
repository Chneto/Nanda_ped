/**
 * Finanças Pediatria /v8/ - Segurança da restauração de backup (pré-visualização, retorno para Desfazer)
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PediatricStorage, BACKUP_MAX_BYTES } from '../js/storage.js';
import { PediatricStore } from '../js/store.js';

const backupJson = (extra = {}) => JSON.stringify({
  version: '7.0.0',
  exportedAt: '2026-10-01T12:00:00.000Z',
  shifts: [{ id: 's1', hospital: 'Maternidade Principal', net_value: 2000, date: '2026-09-10' }],
  expenses: [
    { id: 'e1', description: 'Feira', category: 'Mercantil', amount: 100, date: '2026-09-11' },
    { id: 'e2', description: 'Luz', category: 'Energia', amount: 150, date: '2026-09-12' }
  ],
  ...extra
});

const makeStore = () => { const s = new PediatricStore({ saveSync() {}, saveAsync: async () => true }); s.init(); return s; };

describe('v8 - Restauração de backup segura', () => {
  it('previewBackup conta plantões/despesas e lê data/versão sem alterar o estado atual', () => {
    const storage = new PediatricStorage();
    const store = makeStore();
    store.addShift({ hospital: 'Atual', net_value: 500, date: '2026-11-01' });
    const before = JSON.stringify(store.data);

    const p = storage.previewBackup(backupJson());
    assert.equal(p.success, true);
    assert.equal(p.countShifts, 1);
    assert.equal(p.countExpenses, 2);
    assert.equal(p.exportedAt, '2026-10-01T12:00:00.000Z');
    assert.equal(p.version, '7.0.0');
    assert.equal(JSON.stringify(store.data), before, 'a pré-visualização não toca no estado');
  });

  it('previewBackup rejeita arquivo inválido, grande demais, nulo e array', () => {
    const storage = new PediatricStorage();
    assert.equal(storage.previewBackup('{ não é json').success, false);
    assert.match(storage.previewBackup('{ não é json').error, /malformado/);
    assert.equal(storage.previewBackup('x'.repeat(BACKUP_MAX_BYTES + 1)).success, false);
    assert.equal(storage.previewBackup(null).success, false);
    assert.equal(storage.previewBackup('null').success, false);
    assert.equal(storage.previewBackup('[1,2,3]').success, false);
    assert.equal(storage.previewBackup(undefined).success, false);
  });

  it('importBackup devolve o estado anterior (base do botão Desfazer) e o rollback restaura os dados', () => {
    const storage = new PediatricStorage();
    const store = makeStore();
    store.addShift({ hospital: 'Atual', net_value: 500, date: '2026-11-01' });
    const beforeShifts = store.data.shifts.map(s => s.id);

    const res = storage.importBackup(backupJson(), store);
    assert.equal(res.success, true);
    assert.deepEqual(store.data.shifts.map(s => s.id), ['s1'], 'dados substituídos pelo backup');
    assert.ok(res.previousState && Array.isArray(res.previousState.shifts));
    assert.deepEqual(res.previousState.shifts.map(s => s.id), beforeShifts);

    // Desfazer: reaplica o estado anterior
    store.init(res.previousState);
    assert.deepEqual(store.data.shifts.map(s => s.id), beforeShifts, 'Desfazer devolve os plantões anteriores');
    assert.equal(store.data.expenses.length, 0);
  });

  it('importBackup inválido não altera os dados e não devolve previousState', () => {
    const storage = new PediatricStorage();
    const store = makeStore();
    store.addShift({ hospital: 'Atual', net_value: 500, date: '2026-11-01' });
    const res = storage.importBackup('{ quebrado', store);
    assert.equal(res.success, false);
    assert.equal(res.previousState, undefined);
    assert.equal(store.data.shifts.length, 1);
  });
});
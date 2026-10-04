/**
 * v4_cloud_sync.test.js
 * Test Suite for Milestone M4: Bidirectional Sync Engine, IndexedDB & Offline Queue
 * 
 * Verifies:
 * 1. Canonical Author & Sync State Machine (APP_CREATOR = 'FChNeto')
 * 2. RFC 4122 UUID v4 Generation & Uniqueness
 * 3. Offline Mutation Queue Insertion & Coalescing (UUIDs, timestamps, actions: insert, update, delete)
 * 4. Push Queue Draining & Idempotent Upsert to Supabase
 * 5. Pull Remote Updates & Delta Synchronization (updated_at > lastSyncTime)
 * 6. Last-Write-Wins (LWW) Conflict Resolution (Local vs Remote, Tombstone Resolution)
 * 7. Auto-Sync Timers, Online Event Trigger, and Concurrency Barrier
 * 8. Real-World Hospital Basement Workflow (Modo Local) to Reconnection E2E Scenario
 * 9. Local Database Stats & Full JSON Backup Roundtrip
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  APP_CREATOR as DB_CREATOR,
  DB_NAME,
  DB_VERSION,
  STORES,
  SYNC_STATUS,
  QUEUE_ACTION,
  QUEUE_STATUS,
  generateUUID,
  isInMemoryActive,
  setForceInMemory,
  __resetInMemoryDB,
  localGet,
  localGetAll,
  localGetByMonth,
  localPut,
  localDelete,
  localHardDelete,
  localBatchPut,
  localClear,
  getPendingSyncItems,
  markSynced,
  incrementSyncAttempts,
  clearSyncQueue,
  exportAllLocalData,
  importAllLocalData,
  getDatabaseStats
} from '../js/db.js';

import {
  APP_CREATOR as SYNC_CREATOR,
  SYNC_STATUS_EVENT,
  SYNC_STORAGE_KEYS,
  SYNC_TABLES,
  onSyncStatusChange,
  notifySyncStatus,
  getSyncStatus,
  getLastSyncTime,
  setLastSyncTime,
  pushPendingQueue,
  pullRemoteUpdates,
  syncNow,
  startAutoSync,
  stopAutoSync,
  _setSupabaseForTesting,
  _setDbForTesting,
  _isSyncingNow,
  _resetSyncForTesting
} from '../js/sync.js';

export const APP_CREATOR = 'FChNeto';

// ============================================================================
// MOCK SUPABASE CLIENT FOR NODE HEADLESS RUNNER
// ============================================================================

class MockSupabaseClient {
  constructor(userId = 'user-a-test-id') {
    this.currentUser = { id: userId, email: 'medica@example.com' };
    this.remoteTables = {
      profiles: new Map(),
      shifts: new Map(),
      expenses: new Map(),
      custom_categories: new Map()
    };
    this.isOfflineFallback = false;
  }

  auth = {
    getUser: async () => ({
      data: { user: this.currentUser },
      error: null
    })
  };

  from(tableName) {
    if (!this.remoteTables[tableName]) {
      this.remoteTables[tableName] = new Map();
    }
    const table = this.remoteTables[tableName];
    let filters = [];
    let isUpsert = false;
    let isUpdate = false;
    let isDelete = false;
    let updatePayload = null;
    let upsertPayload = null;

    const builder = {
      select: () => builder,
      eq: (col, val) => {
        filters.push((row) => String(row[col]) === String(val));
        return builder;
      },
      gt: (col, val) => {
        filters.push((row) => String(row[col]) > String(val));
        return builder;
      },
      upsert: (payload) => {
        isUpsert = true;
        upsertPayload = Array.isArray(payload) ? payload : [payload];
        upsertPayload.forEach(p => {
          table.set(String(p.id), { ...p });
        });
        return Promise.resolve({ data: upsertPayload, error: null });
      },
      update: (payload) => {
        isUpdate = true;
        updatePayload = payload;
        return builder;
      },
      delete: () => {
        isDelete = true;
        return builder;
      },
      then: (resolve) => {
        if (isUpdate) {
          let updatedCount = 0;
          for (const [id, row] of table.entries()) {
            if (filters.every(f => f(row))) {
              table.set(id, { ...row, ...updatePayload });
              updatedCount++;
            }
          }
          resolve({ data: [{ count: updatedCount }], error: null });
          return;
        }

        if (isDelete) {
          for (const [id, row] of table.entries()) {
            if (filters.every(f => f(row))) {
              table.delete(id);
            }
          }
          resolve({ data: [], error: null });
          return;
        }

        let results = Array.from(table.values());
        for (const filter of filters) {
          results = results.filter(filter);
        }
        resolve({ data: results.map(r => JSON.parse(JSON.stringify(r))), error: null });
      }
    };

    return builder;
  }
}

// ============================================================================
// SUÍTE DE TESTES DE SINCRONIZAÇÃO E INDEXEDDB
// ============================================================================

describe('Finanças Pediatria V4_Cloud — Bidirectional Sync Engine & IndexedDB Suite', () => {
  let mockSupabase;

  beforeEach(() => {
    setForceInMemory(true);
    __resetInMemoryDB();
    _resetSyncForTesting();
    mockSupabase = new MockSupabaseClient();
    _setSupabaseForTesting(mockSupabase);
  });

  afterEach(() => {
    _resetSyncForTesting();
    __resetInMemoryDB();
  });

  // --------------------------------------------------------------------------
  // 1. Identidade Canônica & Assinatura Imutável
  // --------------------------------------------------------------------------
  describe('1. Identidade Canônica & Assinatura do Criador', () => {
    test('APP_CREATOR é estritamente FChNeto em db.js e sync.js', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(DB_CREATOR, 'FChNeto');
      assert.equal(SYNC_CREATOR, 'FChNeto');
      assert.equal(DB_NAME, 'v4_pediatric_cloud_db');
      assert.equal(DB_VERSION, 1);
    });

    test('Estrutura de STORES define exatamente os 5 stores canônicos', () => {
      assert.equal(STORES.PROFILES, 'profiles');
      assert.equal(STORES.SHIFTS, 'shifts');
      assert.equal(STORES.EXPENSES, 'expenses');
      assert.equal(STORES.CUSTOM_CATEGORIES, 'custom_categories');
      assert.equal(STORES.SYNC_QUEUE, 'sync_queue');
      assert.equal(Object.keys(STORES).length, 5);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Geração e Validação de UUIDs RFC 4122 v4
  // --------------------------------------------------------------------------
  describe('2. Geração de UUIDs RFC 4122 v4', () => {
    test('UUID gerado atende ao formato RFC 4122 v4 com 36 caracteres', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      for (let i = 0; i < 50; i++) {
        const id = generateUUID();
        assert.ok(uuidRegex.test(id), `UUID inválido gerado: ${id}`);
      }
    });

    test('Gera 500 UUIDs sem nenhuma colisão', () => {
      const ids = new Set();
      for (let i = 0; i < 500; i++) {
        const id = generateUUID();
        assert.ok(!ids.has(id), `Colisão detectada para UUID: ${id}`);
        ids.add(id);
      }
      assert.equal(ids.size, 500);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Fila Offline: Mutações, Coalescência e Soft-Delete
  // --------------------------------------------------------------------------
  describe('3. Fila Offline de Mutações (sync_queue) & Coalescência', () => {
    test('localPut com markDirty=true insere registro local e enfileira na sync_queue', async () => {
      const shift = {
        hospital: 'Maternidade Principal',
        date: '2026-03-10',
        net_value: 1500
      };

      const saved = await localPut(STORES.SHIFTS, shift, true);
      assert.ok(saved.id);
      assert.equal(saved.sync_status, SYNC_STATUS.PENDING);
      assert.equal(saved.month, '2026-03');

      const queue = await getPendingSyncItems();
      assert.equal(queue.length, 1);
      assert.equal(queue[0].store, STORES.SHIFTS);
      assert.equal(queue[0].action, QUEUE_ACTION.INSERT);
      assert.equal(queue[0].entityId, saved.id);
      assert.equal(queue[0].data.hospital, 'Maternidade Principal');
    });

    test('Coalescência na fila: múltiplas edições locais atualizam o mesmo item da fila sem duplicar', async () => {
      const id = generateUUID();
      await localPut(STORES.SHIFTS, { id, hospital: 'Maternidade Principal', net_value: 1000 }, true);

      let queue = await getPendingSyncItems();
      assert.equal(queue.length, 1);
      assert.equal(queue[0].data.net_value, 1000);

      // Edita pela 2ª vez antes da sincronização
      await localPut(STORES.SHIFTS, { id, hospital: 'Maternidade Principal', net_value: 1200 }, true);
      queue = await getPendingSyncItems();
      assert.equal(queue.length, 1, 'Não deve criar segundo item na fila para o mesmo entityId');
      assert.equal(queue[0].data.net_value, 1200);

      // Edita pela 3ª vez
      await localPut(STORES.SHIFTS, { id, hospital: 'Maternidade Principal Sala 2', net_value: 1500 }, true);
      queue = await getPendingSyncItems();
      assert.equal(queue.length, 1);
      assert.equal(queue[0].data.net_value, 1500);
      assert.equal(queue[0].data.hospital, 'Maternidade Principal Sala 2');
    });

    test('Item criado offline e excluído antes do sync é purgado localmente sem gerar requisição', async () => {
      const id = generateUUID();
      await localPut(STORES.EXPENSES, { id, description: 'Livro Errado', amount: 90 }, true);

      assert.equal((await getPendingSyncItems()).length, 1);
      assert.ok(await localGet(STORES.EXPENSES, id));

      // Deleta antes de sincronizar
      await localDelete(STORES.EXPENSES, id, true);

      // Não deve restar nem na fila nem no store de despesas
      assert.equal((await getPendingSyncItems()).length, 0);
      assert.equal(await localGet(STORES.EXPENSES, id), null);
    });

    test('Exclusão de item já sincronizado gera tombstone soft-delete e ação delete na fila', async () => {
      const id = generateUUID();
      // Gravado com markDirty=false (simulando vindo da nuvem)
      await localPut(STORES.SHIFTS, { id, hospital: 'Maternidade Secundária', net_value: 1400, sync_status: SYNC_STATUS.SYNCED }, false);
      assert.equal((await getPendingSyncItems()).length, 0);

      // Médica exclui o plantão
      await localDelete(STORES.SHIFTS, id, true);

      // Fila deve ter 1 ação delete
      const queue = await getPendingSyncItems();
      assert.equal(queue.length, 1);
      assert.equal(queue[0].action, QUEUE_ACTION.DELETE);
      assert.equal(queue[0].entityId, id);

      // localGet padrão exclui soft-deleted, mas includeDeleted=true encontra com tombstone
      assert.equal(await localGet(STORES.SHIFTS, id), null);
      const tombstone = await localGet(STORES.SHIFTS, id, { includeDeleted: true });
      assert.ok(tombstone !== null);
      assert.ok(tombstone.deleted_at);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Fase de PUSH: Drenagem e Envio ao Supabase
  // --------------------------------------------------------------------------
  describe('4. Fase de PUSH (Envio ao Supabase)', () => {
    test('pushPendingQueue drena fila FIFO e atualiza status para synced', async () => {
      const shiftId = generateUUID();
      await localPut(STORES.SHIFTS, {
        id: shiftId,
        hospital: 'Maternidade Principal',
        date: '2026-03-12',
        net_value: 2000
      }, true);

      assert.equal((await getPendingSyncItems()).length, 1);

      const pushRes = await pushPendingQueue();
      assert.equal(pushRes.pushed, 1);
      assert.equal(pushRes.errors.length, 0);

      // Fila drenada
      assert.equal((await getPendingSyncItems()).length, 0);

      // Localmente marcado como synced
      const local = await localGet(STORES.SHIFTS, shiftId);
      assert.equal(local.sync_status, SYNC_STATUS.SYNCED);

      // No Supabase, o registro existe com user_id
      const remote = await mockSupabase.from('shifts').select('*').eq('id', shiftId);
      assert.equal(remote.data.length, 1);
      assert.equal(remote.data[0].hospital, 'Maternidade Principal');
      assert.equal(remote.data[0].user_id, 'user-a-test-id');
    });

    test('Push de exclusão envia tombstone deleted_at ao Supabase', async () => {
      const expId = generateUUID();
      await mockSupabase.from('expenses').upsert({
        id: expId,
        user_id: 'user-a-test-id',
        description: 'Livro',
        amount: 200,
        sync_status: 'synced',
        updated_at: '2026-03-01T10:00:00Z'
      });

      await localPut(STORES.EXPENSES, { id: expId, description: 'Livro', amount: 200, sync_status: SYNC_STATUS.SYNCED }, false);

      // Deleta localmente
      await localDelete(STORES.EXPENSES, expId, true);

      const pushRes = await pushPendingQueue();
      assert.equal(pushRes.pushed, 1);

      // Supabase possui tombstone
      const checkRemote = await mockSupabase.from('expenses').select('*').eq('id', expId);
      assert.equal(checkRemote.data.length, 1);
      assert.ok(checkRemote.data[0].deleted_at);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Fase de PULL: Coleta Incremental e Atualização Local
  // --------------------------------------------------------------------------
  describe('5. Fase de PULL (Coleta Incremental do Supabase)', () => {
    test('Puxa novo registro remoto e insere no IndexedDB local', async () => {
      const shiftId = generateUUID();
      await mockSupabase.from('shifts').upsert({
        id: shiftId,
        user_id: 'user-a-test-id',
        hospital: 'Maternidade Secundária',
        date: '2026-03-20',
        net_value: 1800,
        sync_status: 'synced',
        updated_at: '2026-03-20T08:00:00Z'
      });

      assert.equal(await localGet(STORES.SHIFTS, shiftId), null);

      const pullRes = await pullRemoteUpdates();
      assert.equal(pullRes.pulled, 1);

      const local = await localGet(STORES.SHIFTS, shiftId);
      assert.ok(local !== null);
      assert.equal(local.hospital, 'Maternidade Secundária');
      assert.equal(local.sync_status, SYNC_STATUS.SYNCED);
    });

    test('PULL ignora registros remotos que já vêm com deleted_at se não existirem localmente', async () => {
      const shiftId = generateUUID();
      await mockSupabase.from('shifts').upsert({
        id: shiftId,
        user_id: 'user-a-test-id',
        hospital: 'Deletado',
        deleted_at: '2026-03-20T08:00:00Z',
        updated_at: '2026-03-20T08:00:00Z'
      });

      const pullRes = await pullRemoteUpdates();
      assert.equal(pullRes.pulled, 0);
      assert.equal(await localGet(STORES.SHIFTS, shiftId, { includeDeleted: true }), null);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Resolução de Conflitos Last-Write-Wins (LWW)
  // --------------------------------------------------------------------------
  describe('6. Resolução de Conflitos Last-Write-Wins (LWW)', () => {
    test('LWW Caso 1: Servidor remoto mais recente vence', async () => {
      const shiftId = generateUUID();

      // Local antigo (10:00)
      await localPut(STORES.SHIFTS, {
        id: shiftId,
        hospital: 'Hospital Antigo Local',
        updated_at: '2026-03-25T10:00:00Z'
      }, false);

      // Remoto recente (10:30)
      await mockSupabase.from('shifts').upsert({
        id: shiftId,
        user_id: 'user-a-test-id',
        hospital: 'Hospital Novo Remoto',
        updated_at: '2026-03-25T10:30:00Z'
      });

      await pullRemoteUpdates();

      const resolved = await localGet(STORES.SHIFTS, shiftId);
      assert.equal(resolved.hospital, 'Hospital Novo Remoto');
    });

    test('LWW Caso 2: Edição local mais recente vence', async () => {
      const shiftId = generateUUID();

      // Remoto antigo (11:00)
      await mockSupabase.from('shifts').upsert({
        id: shiftId,
        user_id: 'user-a-test-id',
        hospital: 'Hospital Remoto Antigo',
        updated_at: '2026-03-25T11:00:00Z'
      });

      // Local mais recente (11:15)
      await localPut(STORES.SHIFTS, {
        id: shiftId,
        hospital: 'Hospital Local Recente (Médica)',
        updated_at: '2026-03-25T11:15:00Z'
      }, false);

      await pullRemoteUpdates();

      const resolved = await localGet(STORES.SHIFTS, shiftId);
      assert.equal(resolved.hospital, 'Hospital Local Recente (Médica)');
    });

    test('LWW Caso 3: Soft-delete remoto mais recente remove registro local', async () => {
      const expId = generateUUID();

      await localPut(STORES.EXPENSES, {
        id: expId,
        description: 'Livro de Plantão',
        updated_at: '2026-03-25T09:00:00Z'
      }, false);

      await mockSupabase.from('expenses').upsert({
        id: expId,
        user_id: 'user-a-test-id',
        description: 'Livro de Plantão',
        updated_at: '2026-03-25T09:30:00Z',
        deleted_at: '2026-03-25T09:30:00Z'
      });

      await pullRemoteUpdates();

      const localAfter = await localGet(STORES.EXPENSES, expId);
      assert.equal(localAfter, null);
    });

    test('LWW Caso 4: Edição local após soft-delete remoto ressuscita registro legitimamente', async () => {
      const expId = generateUUID();

      // Local editado às 10:00
      await localPut(STORES.EXPENSES, {
        id: expId,
        description: 'Livro Reativado',
        updated_at: '2026-03-25T10:00:00Z'
      }, false);

      // Remoto tinha sido deletado às 09:00
      await mockSupabase.from('expenses').upsert({
        id: expId,
        user_id: 'user-a-test-id',
        description: 'Livro Antigo',
        updated_at: '2026-03-25T09:00:00Z',
        deleted_at: '2026-03-25T09:00:00Z'
      });

      await pullRemoteUpdates();

      const localAfter = await localGet(STORES.EXPENSES, expId);
      assert.ok(localAfter !== null);
      assert.equal(localAfter.description, 'Livro Reativado');
      assert.equal(localAfter.sync_status, SYNC_STATUS.PENDING);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Orquestração syncNow & Notificações de Status
  // --------------------------------------------------------------------------
  describe('7. Orquestração syncNow & Notificações de Status', () => {
    test('syncNow transita status de idle -> syncing -> idle', async () => {
      const statuses = [];
      onSyncStatusChange((st) => statuses.push(st));

      const res = await syncNow();
      assert.equal(res.status, undefined);
      assert.ok(statuses.includes('syncing'));
      assert.equal(statuses[statuses.length - 1], 'idle');
    });

    test('syncNow impede concorrência duplicada (reentrância bloqueada)', async () => {
      const p1 = syncNow();
      const p2 = syncNow();
      const [res1, res2] = await Promise.all([p1, p2]);

      // Um deve rodar com sucesso e o outro relatar already_syncing
      const statuses = [res1.status, res2.status];
      assert.ok(statuses.includes('already_syncing'));
    });

    test('startAutoSync e stopAutoSync gerenciam temporizadores sem vazamento', () => {
      startAutoSync(1000);
      assert.doesNotThrow(() => stopAutoSync());
    });
  });

  // --------------------------------------------------------------------------
  // 8. Cenário Real Clínico — "Subsolo da Maternidade Principal para o Hall Conectado"
  // --------------------------------------------------------------------------
  describe('8. Cenário Real Clínico: Subsolo para Hall Conectado', () => {
    test('Transição offline para online sincroniza todas as mutações sem perda de dados', async () => {
      // 1. Médica entra no subsolo sem sinal da Maternidade Principal
      // Registra 2 plantões e 1 despesa
      const s1 = await localPut(STORES.SHIFTS, {
        hospital: 'Maternidade Principal',
        date: '2026-03-26',
        net_value: 1600
      }, true);

      const s2 = await localPut(STORES.SHIFTS, {
        hospital: 'Maternidade Principal',
        date: '2026-03-26',
        net_value: 1600
      }, true);

      const e1 = await localPut(STORES.EXPENSES, {
        description: 'Lanches Noturnos Plantão',
        amount: 38.50,
        category: 'Lanches'
      }, true);

      // Fila possui 3 itens pendentes
      const queueBefore = await getPendingSyncItems();
      assert.equal(queueBefore.length, 3);

      // 2. Médica sobe para a recepção do hospital e reconecta ao Wi-Fi
      const syncResult = await syncNow();
      assert.equal(syncResult.pushed, 3);
      assert.equal(syncResult.errors.length, 0);

      // 3. Fila local fica completamente limpa
      const queueAfter = await getPendingSyncItems();
      assert.equal(queueAfter.length, 0);

      // 4. Supabase reflete os registros com o user_id da Médica
      const remoteShifts = await mockSupabase.from('shifts').select('*').eq('user_id', 'user-a-test-id');
      assert.equal(remoteShifts.data.length, 2);

      const remoteExpenses = await mockSupabase.from('expenses').select('*').eq('user_id', 'user-a-test-id');
      assert.equal(remoteExpenses.data.length, 1);
      assert.equal(remoteExpenses.data[0].description, 'Lanches Noturnos Plantão');
    });
  });

  // --------------------------------------------------------------------------
  // 9. Estatísticas do Banco Local & Backup JSON
  // --------------------------------------------------------------------------
  describe('9. Estatísticas do Banco Local & Backup JSON', () => {
    test('getDatabaseStats retorna contagens exatas de todos os stores', async () => {
      await localPut(STORES.PROFILES, { id: 'prof-1', doctor_name: 'Médica' }, false);
      await localPut(STORES.SHIFTS, { hospital: 'Maternidade Principal', net_value: 1200 }, true);
      await localPut(STORES.EXPENSES, { description: 'Uber', amount: 35 }, true);

      const stats = await getDatabaseStats();
      assert.equal(stats.profilesCount, 1);
      assert.equal(stats.shiftsCount, 1);
      assert.equal(stats.expensesCount, 1);
      assert.equal(stats.pendingSyncCount, 2);
    });

    test('exportAllLocalData e importAllLocalData executam roundtrip íntegro com APP_CREATOR', async () => {
      await localPut(STORES.PROFILES, { id: 'p1', doctor_name: 'Médica' }, false);
      await localPut(STORES.SHIFTS, { id: 's1', hospital: 'Maternidade Principal', net_value: 2000 }, false);
      await localPut(STORES.EXPENSES, { id: 'e1', description: 'Café', amount: 12 }, false);

      const dump = await exportAllLocalData();
      assert.equal(dump.app_creator, 'FChNeto');
      assert.equal(dump.data.shifts.length, 1);
      assert.equal(dump.data.expenses.length, 1);

      // Limpa banco local
      __resetInMemoryDB();
      assert.equal((await localGetAll(STORES.SHIFTS)).length, 0);

      // Importa backup
      const impRes = await importAllLocalData(dump, true);
      assert.equal(impRes.errors.length, 0);
      assert.equal(impRes.imported, 3);

      const restoredShifts = await localGetAll(STORES.SHIFTS);
      assert.equal(restoredShifts.length, 1);
      assert.equal(restoredShifts[0].hospital, 'Maternidade Principal');
    });

    test('localGetByMonth busca registros com base no mês do plantão/despesa', async () => {
      await localPut(STORES.SHIFTS, { date: '2026-04-10', net_value: 1000 }, false);
      await localPut(STORES.SHIFTS, { date: '2026-04-20', net_value: 1200 }, false);
      await localPut(STORES.SHIFTS, { date: '2026-05-05', net_value: 1500 }, false);

      const aprilShifts = await localGetByMonth(STORES.SHIFTS, '2026-04');
      assert.equal(aprilShifts.length, 2);

      const mayShifts = await localGetByMonth(STORES.SHIFTS, '2026-05');
      assert.equal(mayShifts.length, 1);
    });
  });

});

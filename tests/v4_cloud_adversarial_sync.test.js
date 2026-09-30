/**
 * v4_cloud_adversarial_sync.test.js
 * Empirical Adversarial Challenger Test Suite for Milestone M6 Phase 2 Tier 5
 * Focus: Storage, Sync, Concurrency, Network Flapping & Quota Poisoning
 * 
 * Adversarial Target Verification:
 * 1. High-Concurrency Mutation Stress:
 *    - 100+ rapid concurrent shift additions via Promise.all
 *    - 100+ rapid concurrent expense additions via Promise.all
 *    - 50 concurrent updates targeting the same entity (coalescing & zero lost updates)
 *    - Interleaved concurrent CRUD operations with 0 state corruption and 0 unhandled rejections
 *    - Database stats consistency under concurrent load
 * 2. Offline Sync Poisoning & Corrupted Payloads:
 *    - Injection of unknown/unauthorized tables into sync_queue (graceful skip & mark synced)
 *    - Injection of null/undefined/empty data payloads (graceful error capture, zero engine crashes)
 *    - Injection of illegal actions (e.g., DROP TABLE, invalid strings)
 *    - Injection of corrupted timestamps, NaN values, Infinity values
 *    - Max attempts boundary (attempts >= MAX_SYNC_ATTEMPTS transitions to 'failed')
 *    - Corrupted JSON backup import rejection without unhandled exceptions
 * 3. Network Flapping & Race Conditions:
 *    - Rapid online/offline toggling while mutations and sync are actively in flight
 *    - Concurrent syncNow reentrancy lock (blocking double-sync with 'already_syncing')
 *    - Exception recovery guarantee (ensuring _isSyncing lock is released in finally)
 *    - Network packet duplication and idempotent upsert verification
 *    - Listener fault isolation (broken subscriber callback does not crash sync engine)
 * 4. Storage Quota & Tombstone Coalescing:
 *    - High-volume soft delete stress (100 records soft-deleted concurrently)
 *    - LWW Tombstone vs Newer Create race: newer local create survives older remote tombstone
 *    - LWW Newer Remote Create vs Older Local Tombstone: newer remote create resurrects entity
 *    - Ephemeral offline create-then-delete: purged locally with zero network traffic
 *    - Re-creation of soft-deleted entity restores active status without ghost tombstones
 *    - Store isolation under clearing operations
 *    - Large-payload memory resilience (50KB clinical handover strings roundtripped safely)
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

export const APP_CREATOR = 'FChNeto';

import {
  APP_CREATOR as DB_CREATOR,
  DB_NAME,
  DB_VERSION,
  STORES,
  SYNC_STATUS,
  QUEUE_ACTION,
  QUEUE_STATUS,
  MAX_SYNC_ATTEMPTS,
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

import {
  APP_CREATOR as CONFIG_CREATOR,
  STORAGE_KEYS,
  isOfflineMode,
  setOfflineMode,
  isGuestMode,
  setGuestMode
} from '../js/config.js';

// ============================================================================
// ADVERSARIAL MOCK SUPABASE CLIENT
// ============================================================================

class AdversarialMockSupabaseClient {
  constructor(userId = 'dra-fernanda-uid') {
    this.currentUser = { id: userId, email: 'dra.fernanda@pediatria.med.br' };
    this.remoteTables = {
      profiles: new Map(),
      shifts: new Map(),
      expenses: new Map(),
      custom_categories: new Map()
    };
    this.isOfflineFallback = false;
    this.upsertCallCount = 0;
    this.shouldFailUpsert = false;
    this.upsertFailureError = null;
    this.upsertDelayMs = 0;
    this.simulateNetworkCut = false;
  }

  auth = {
    getUser: async () => {
      if (this.simulateNetworkCut) {
        throw new Error('fetch failed: network timeout reaching auth server');
      }
      return {
        data: { user: this.currentUser },
        error: null
      };
    }
  };

  from(tableName) {
    if (!this.remoteTables[tableName]) {
      this.remoteTables[tableName] = new Map();
    }
    const table = this.remoteTables[tableName];
    let filters = [];
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
      upsert: (payload, options = {}) => {
        this.upsertCallCount++;

        if (this.shouldFailUpsert) {
          const err = this.upsertFailureError || new Error('Network error: connection reset by peer');
          return Promise.resolve({ data: null, error: err });
        }

        upsertPayload = Array.isArray(payload) ? payload : [payload];

        const executeUpsert = () => {
          for (const item of upsertPayload) {
            if (!item || !item.id) {
              return {
                data: null,
                error: new Error('Postgres error: column "id" violates not-null constraint')
              };
            }
            table.set(String(item.id), { ...item });
          }
          return { data: upsertPayload, error: null };
        };

        if (this.upsertDelayMs > 0) {
          return new Promise((resolve) => {
            setTimeout(() => resolve(executeUpsert()), this.upsertDelayMs);
          });
        }

        return Promise.resolve(executeUpsert());
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
        if (this.simulateNetworkCut) {
          resolve({ data: null, error: new Error('fetch failed: network unavailable') });
          return;
        }

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
// MAIN ADVERSARIAL SUITE
// ============================================================================

describe('Finanças Pediatria V4_Cloud — Tier 5 Adversarial Hardening Suite', () => {
  let mockSupabase;

  beforeEach(() => {
    setForceInMemory(true);
    __resetInMemoryDB();
    _resetSyncForTesting();
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.clear();
      } catch (e) {}
    }
    setOfflineMode(false);
    setGuestMode(false);

    mockSupabase = new AdversarialMockSupabaseClient();
    _setSupabaseForTesting(mockSupabase);
  });

  afterEach(() => {
    _resetSyncForTesting();
    __resetInMemoryDB();
    setOfflineMode(false);
    setGuestMode(false);
  });

  // ==========================================================================
  // SECTION 1: CANONICAL INVARIANTS & IDENTITY
  // ==========================================================================
  describe('1. Invariantes Canônicos & Identidade do Criador', () => {
    test('APP_CREATOR é estritamente "FChNeto" em todos os módulos de storage e sync', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(DB_CREATOR, 'FChNeto');
      assert.equal(SYNC_CREATOR, 'FChNeto');
      assert.equal(CONFIG_CREATOR, 'FChNeto');
    });

    test('Estrutura de STORES define exatamente os 5 stores canônicos e tabelas sincronizadas', () => {
      assert.deepEqual(Object.values(STORES).sort(), [
        'custom_categories',
        'expenses',
        'profiles',
        'shifts',
        'sync_queue'
      ].sort());

      assert.deepEqual(SYNC_TABLES.sort(), [
        'custom_categories',
        'expenses',
        'profiles',
        'shifts'
      ].sort());
    });
  });

  // ==========================================================================
  // SECTION 2: ADVERSARIAL TARGET 1 — HIGH-CONCURRENCY MUTATION STRESS
  // ==========================================================================
  describe('2. Adversarial Target 1: Concorrência Extrema (100+ Mutações Simultâneas)', () => {
    test('100 inserções simultâneas de plantões via Promise.all: zero perdas de atualização', async () => {
      const hospitalList = ['Maternidade Araken', 'Maternidade Leide Morais', 'MEJEC'];
      const promises = [];

      for (let i = 0; i < 100; i++) {
        const shiftData = {
          hospital: hospitalList[i % 3],
          date: `2026-04-${String((i % 28) + 1).padStart(2, '0')}`,
          net_value: 1000 + i * 10,
          gross_value: 1200 + i * 10
        };
        promises.push(localPut(STORES.SHIFTS, shiftData, true));
      }

      const results = await Promise.all(promises);
      assert.equal(results.length, 100);

      // Verifica unicidade dos IDs gerados
      const ids = new Set(results.map(r => r.id));
      assert.equal(ids.size, 100, 'Todos os 100 plantões devem possuir UUIDs distintos');

      // Verifica integridade da persistência local
      const storedShifts = await localGetAll(STORES.SHIFTS);
      assert.equal(storedShifts.length, 100, 'IndexedDB deve conter exatamente 100 plantões');

      // Verifica que a fila de sincronização possui 100 itens pendentes
      const queue = await getPendingSyncItems();
      assert.equal(queue.length, 100, 'sync_queue deve registrar todos os 100 inserts');
    });

    test('100 inserções simultâneas de despesas via Promise.all: zero perdas e soma monetária exata', async () => {
      const categories = ['Lanches', 'Combustível', 'Refeição', 'Uber', 'Mercantil'];
      const promises = [];
      let expectedTotalAmount = 0;

      for (let i = 0; i < 100; i++) {
        const amount = 25.50 + i;
        expectedTotalAmount += amount;
        const expData = {
          description: `Despesa Concorrente #${i}`,
          amount,
          category: categories[i % categories.length],
          date: '2026-04-15'
        };
        promises.push(localPut(STORES.EXPENSES, expData, true));
      }

      const results = await Promise.all(promises);
      assert.equal(results.length, 100);

      const storedExpenses = await localGetAll(STORES.EXPENSES);
      assert.equal(storedExpenses.length, 100);

      const actualSum = storedExpenses.reduce((sum, item) => sum + item.amount, 0);
      assert.ok(Math.abs(actualSum - expectedTotalAmount) < 0.001, 'Soma total das despesas deve bater perfeitamente');
    });

    test('50 atualizações concorrentes sobre a mesma entidade: coalescência perfeita na fila', async () => {
      const shiftId = generateUUID();
      // Criação inicial
      await localPut(STORES.SHIFTS, {
        id: shiftId,
        hospital: 'Maternidade Araken',
        net_value: 1000,
        notes: 'Versão 0'
      }, true);

      // Dispara 50 atualizações quase instantâneas
      const updatePromises = [];
      for (let i = 1; i <= 50; i++) {
        updatePromises.push(
          localPut(STORES.SHIFTS, {
            id: shiftId,
            hospital: 'Maternidade Araken',
            net_value: 1000 + i,
            notes: `Versão Concorrente ${i}`
          }, true)
        );
      }

      await Promise.all(updatePromises);

      // Verifica que na base de dados existe apenas 1 registro com o ID alvo
      const finalShift = await localGet(STORES.SHIFTS, shiftId);
      assert.ok(finalShift !== null);
      assert.ok(finalShift.net_value >= 1001 && finalShift.net_value <= 1050);

      // Verifica coalescência na fila: DEVE existir exatamente 1 item pendente para este entityId
      const queue = await getPendingSyncItems();
      const entityQueueItems = queue.filter(q => q.entityId === shiftId);
      assert.equal(entityQueueItems.length, 1, 'Coalescência deve colapsar 50 edições para exatamente 1 item pendente');
      assert.equal(entityQueueItems[0].data.id, shiftId);
    });

    test('150 operações CRUD mistas e concorrentes: zero unhandled promise rejections e integridade do banco', async () => {
      const ops = [];

      // 50 novos plantões
      for (let i = 0; i < 50; i++) {
        ops.push(localPut(STORES.SHIFTS, { hospital: `Hospital #${i}`, net_value: 1500 }, true));
      }

      // 50 novas despesas
      for (let i = 0; i < 50; i++) {
        ops.push(localPut(STORES.EXPENSES, { description: `Item #${i}`, amount: 50 }, true));
      }

      // 50 leituras concorrentes em paralelo
      for (let i = 0; i < 50; i++) {
        ops.push(localGetAll(STORES.SHIFTS));
      }

      // Executa tudo concorrentemente
      const results = await Promise.all(ops);
      assert.equal(results.length, 150);

      const stats = await getDatabaseStats();
      assert.equal(stats.shiftsCount, 50);
      assert.equal(stats.expensesCount, 50);
      assert.equal(stats.pendingSyncCount, 100);
    });
  });

  // ==========================================================================
  // SECTION 3: ADVERSARIAL TARGET 2 — OFFLINE SYNC POISONING & CORRUPTED PAYLOADS
  // ==========================================================================
  describe('3. Adversarial Target 2: Envenenamento de Fila & Cargas Corrompidas', () => {
    test('Item na fila com store desconhecida/maliciosa é ignorado com segurança sem quebrar o motor', async () => {
      const maliciousQueueItem = {
        id: generateUUID(),
        store: 'malicious_system_privileges',
        action: 'insert',
        entityId: generateUUID(),
        data: { attack: 'sql_inject_or_privilege_escalation' },
        timestamp: new Date().toISOString(),
        attempts: 0,
        status: QUEUE_STATUS.PENDING
      };

      await localPut(STORES.SYNC_QUEUE, maliciousQueueItem, false);
      assert.equal((await getPendingSyncItems()).length, 1);

      // Executa push
      const pushRes = await pushPendingQueue();
      assert.equal(pushRes.pushed, 0);
      assert.equal(pushRes.errors.length, 0);

      // O item malicioso foi marcado como sincronizado/descartado e a fila esvaziou
      const remainingQueue = await getPendingSyncItems();
      assert.equal(remainingQueue.length, 0);
    });

    test('Item na fila com data = null é tratado defensivamente sem disparar exceção não capturada', async () => {
      const poisonedItem = {
        id: generateUUID(),
        store: STORES.SHIFTS,
        action: 'insert',
        entityId: generateUUID(),
        data: null, // Carga nula envenenada
        timestamp: new Date().toISOString(),
        attempts: 0,
        status: QUEUE_STATUS.PENDING
      };

      await localPut(STORES.SYNC_QUEUE, poisonedItem, false);

      // pushPendingQueue não deve quebrar
      const pushRes = await pushPendingQueue();
      assert.ok(pushRes !== null);
      assert.equal(typeof pushRes.pushed, 'number');
      // O mock supabase recusa item sem ID com erro, capturado e registrado em errors
      assert.ok(pushRes.errors.length >= 1);
    });

    test('Item na fila com ação inválida (DROP TABLE / desconhecida) não causa execução destrutiva', async () => {
      const invalidActionItem = {
        id: generateUUID(),
        store: STORES.EXPENSES,
        action: 'DROP TABLE public.expenses;',
        entityId: generateUUID(),
        data: { description: 'Exploit attempt' },
        timestamp: new Date().toISOString(),
        attempts: 0,
        status: QUEUE_STATUS.PENDING
      };

      await localPut(STORES.SYNC_QUEUE, invalidActionItem, false);

      const pushRes = await pushPendingQueue();
      assert.equal(pushRes.pushed, 0);
      // Nenhuma alteração executada nas tabelas remotas
      assert.equal(mockSupabase.remoteTables.expenses.size, 0);
    });

    test('Valores numéricos e datas corrompidos (NaN, Infinity, data inválida) não quebram o ciclo syncNow', async () => {
      const corruptShift = {
        id: generateUUID(),
        hospital: 'Maternidade Araken',
        date: 'DATA_COMPLETAMENTE_INVALIDA_2026',
        net_value: NaN,
        gross_value: Infinity,
        updated_at: 'NOT_AN_ISO_DATE'
      };

      await localPut(STORES.SHIFTS, corruptShift, true);

      // syncNow deve concluir sem lançar exceções para fora da Promise
      const syncRes = await syncNow();
      assert.ok(syncRes !== null);
      assert.equal(typeof syncRes.pushed, 'number');
      assert.equal(typeof syncRes.pulled, 'number');
    });

    test('incrementSyncAttempts atinge limite MAX_SYNC_ATTEMPTS (5) e transita item para status "failed"', async () => {
      const queueId = generateUUID();
      await localPut(STORES.SYNC_QUEUE, {
        id: queueId,
        store: STORES.SHIFTS,
        action: 'insert',
        entityId: generateUUID(),
        data: { hospital: 'Araken' },
        attempts: 0,
        status: QUEUE_STATUS.PENDING
      }, false);

      for (let i = 1; i <= MAX_SYNC_ATTEMPTS; i++) {
        const item = await incrementSyncAttempts(queueId, `Falha de rede simulada #${i}`);
        assert.equal(item.attempts, i);
        if (i < MAX_SYNC_ATTEMPTS) {
          assert.equal(item.status, QUEUE_STATUS.PENDING);
        } else {
          assert.equal(item.status, QUEUE_STATUS.FAILED);
        }
      }

      // Itens 'failed' deixam de ser retornados por getPendingSyncItems
      const pending = await getPendingSyncItems();
      assert.equal(pending.length, 0);
    });

    test('importAllLocalData rejeita payloads nulos ou malformados com erro claro e sem crash', async () => {
      await assert.rejects(
        async () => importAllLocalData(null),
        /Formato de backup inválido/
      );

      await assert.rejects(
        async () => importAllLocalData({ invalid_key: 123 }),
        /Formato de backup inválido/
      );

      // Import com dados vazios mas estruturados deve executar pacificamente
      const res = await importAllLocalData({
        app_creator: 'FChNeto',
        data: {}
      }, true);
      assert.equal(res.imported, 0);
      assert.equal(res.errors.length, 0);
    });
  });

  // ==========================================================================
  // SECTION 4: ADVERSARIAL TARGET 3 — NETWORK FLAPPING & RACE CONDITIONS
  // ==========================================================================
  describe('4. Adversarial Target 3: Flapping de Rede & Condições de Corrida', () => {
    test('Alternância rápida de modo online/offline durante mutações em voo preserva integridade', async () => {
      for (let i = 0; i < 20; i++) {
        // Alterna status de conectividade
        setOfflineMode(i % 2 === 0);

        // Insere registro
        await localPut(STORES.SHIFTS, {
          hospital: `Hospital Flapping #${i}`,
          net_value: 1200 + i
        }, true);

        // Tenta syncNow em meio ao flapping
        const res = await syncNow();
        if (isOfflineMode()) {
          assert.equal(res.status, 'offline');
          assert.equal(res.pushed, 0);
        }
      }

      // Garante inserção offline no final do flapping para testar a recuperação
      setOfflineMode(true);
      await localPut(STORES.SHIFTS, {
        hospital: 'Hospital Pós-Flapping',
        net_value: 2000
      }, true);

      const pendingBefore = await getPendingSyncItems();
      assert.ok(pendingBefore.length >= 1);

      // Restabelece rede estável
      setOfflineMode(false);
      const recoverySync = await syncNow();
      assert.ok(recoverySync.pushed >= 1);

      // Fila completamente drenada
      const pendingAfter = await getPendingSyncItems();
      assert.equal(pendingAfter.length, 0);

      // Todos os 21 plantões devem constar intactos no banco local
      const totalShifts = await localGetAll(STORES.SHIFTS);
      assert.equal(totalShifts.length, 21);
    });

    test('Barreira de reentrância syncNow(): chamadas simultâneas retornam already_syncing sem colisão', async () => {
      // Configura atraso de 40ms na chamada ao Supabase para simular tempo de trânsito WAN
      mockSupabase.upsertDelayMs = 40;

      await localPut(STORES.SHIFTS, { hospital: 'Araken', net_value: 1500 }, true);

      // Dispara 3 syncs simultâneos
      const p1 = syncNow();
      const p2 = syncNow();
      const p3 = syncNow();

      const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

      const statuses = [r1.status, r2.status, r3.status];
      // Exatamente um deve rodar (status = undefined) e os demais 'already_syncing'
      const executingCount = statuses.filter(s => s === undefined).length;
      const rejectedCount = statuses.filter(s => s === 'already_syncing').length;

      assert.equal(executingCount, 1, 'Apenas uma sincronização deve estar em execução');
      assert.equal(rejectedCount, 2, 'As demais requisições concorrentes devem receber already_syncing');
      assert.equal(_isSyncingNow(), false, 'Ao final, o lock _isSyncing DEVE estar desbloqueado');
    });

    test('Falha crítica de rede no push libera garantidamente o lock _isSyncing no bloco finally', async () => {
      mockSupabase.shouldFailUpsert = true;
      mockSupabase.upsertFailureError = new Error('Network timeout: socket closed unexpectedly');

      await localPut(STORES.SHIFTS, { hospital: 'Araken', net_value: 1500 }, true);

      const res = await syncNow();
      assert.ok(res.errors.length >= 1);
      assert.equal(getSyncStatus(), 'error');
      assert.equal(_isSyncingNow(), false, 'Lock _isSyncing DEVE ser falso mesmo após erro crítico');

      // Corrige a falha de rede e confirma que o próximo syncNow pode rodar sem ficar travado
      mockSupabase.shouldFailUpsert = false;
      const resAfter = await syncNow();
      assert.equal(resAfter.status, undefined);
      assert.equal(getSyncStatus(), 'idle');
    });

    test('Idempotência de upsert sob duplicação de pacotes de rede (retransmissão idêntica)', async () => {
      const shiftId = generateUUID();
      const shiftPayload = {
        id: shiftId,
        hospital: 'Maternidade Araken',
        date: '2026-04-10',
        net_value: 2000
      };

      await localPut(STORES.SHIFTS, shiftPayload, true);

      // 1ª Sincronização
      const sync1 = await syncNow();
      assert.equal(sync1.pushed, 1);

      // Simula retransmissão de pacote duplicado reinserindo na fila com mesmo ID
      await localPut(STORES.SYNC_QUEUE, {
        id: generateUUID(),
        store: STORES.SHIFTS,
        action: 'insert',
        entityId: shiftId,
        data: { ...shiftPayload },
        timestamp: new Date().toISOString(),
        status: QUEUE_STATUS.PENDING
      }, false);

      // 2ª Sincronização
      const sync2 = await syncNow();
      assert.equal(sync2.pushed, 1);

      // No Supabase, o registro continua sendo exatamente 1
      assert.equal(mockSupabase.remoteTables.shifts.size, 1);
      const remoteRecord = mockSupabase.remoteTables.shifts.get(shiftId);
      assert.equal(remoteRecord.net_value, 2000);
      assert.equal(remoteRecord.user_id, 'dra-fernanda-uid');
    });

    test('Isolamento de falhas em listeners: callback com throw não quebra o ciclo syncNow nem outros ouvintes', async () => {
      let normalListenerCalled = false;

      // Listener envenenado que dispara exceção
      const unsubBroken = onSyncStatusChange(() => {
        throw new Error('Callback envenenado de componente visual terceiro!');
      });

      // Listener normal saudável
      const unsubHealthy = onSyncStatusChange(() => {
        normalListenerCalled = true;
      });

      // syncNow deve rodar completamente
      await assert.doesNotReject(async () => {
        await syncNow();
      });

      assert.equal(normalListenerCalled, true, 'Ouvinte saudável deve ter sido notificado');

      unsubBroken();
      unsubHealthy();
    });
  });

  // ==========================================================================
  // SECTION 5: ADVERSARIAL TARGET 4 — STORAGE QUOTA & TOMBSTONE COALESCING
  // ==========================================================================
  describe('5. Adversarial Target 4: Quota de Armazenamento & Coalescência de Tombstones', () => {
    test('100 exclusões soft-delete concorrentes: queries padrão retornam 0 e tombstones retêm deleted_at', async () => {
      const ids = [];
      for (let i = 0; i < 100; i++) {
        const id = generateUUID();
        ids.push(id);
        // Inserção como já sincronizado para gerar tombstone no delete
        await localPut(STORES.SHIFTS, { id, hospital: `Hospital #${i}`, sync_status: SYNC_STATUS.SYNCED }, false);
      }

      assert.equal((await localGetAll(STORES.SHIFTS)).length, 100);

      // Deleta os 100 concorrentemente
      await Promise.all(ids.map(id => localDelete(STORES.SHIFTS, id, true)));

      // Busca padrão (sem deletados) retorna 0
      const activeShifts = await localGetAll(STORES.SHIFTS);
      assert.equal(activeShifts.length, 0);

      // Busca com includeDeleted = true retorna todos os 100 com timestamp de deleção
      const tombstones = await localGetAll(STORES.SHIFTS, { includeDeleted: true });
      assert.equal(tombstones.length, 100);
      for (const t of tombstones) {
        assert.ok(t.deleted_at !== undefined && t.deleted_at !== null);
      }
    });

    test('LWW Tombstone Race: Tombstone remoto mais antigo NÃO sobrescreve criação local mais recente', async () => {
      const shiftId = generateUUID();

      // 1. Criação local recente às 12:00
      await localPut(STORES.SHIFTS, {
        id: shiftId,
        hospital: 'Hospital Araken Criado Recentemente',
        updated_at: '2026-04-01T12:00:00.000Z'
      }, false);

      // 2. Chega tombstone remoto obsoleto com deleted_at às 11:00
      await mockSupabase.from('shifts').upsert({
        id: shiftId,
        user_id: 'dra-fernanda-uid',
        hospital: 'Hospital Araken',
        updated_at: '2026-04-01T11:00:00.000Z',
        deleted_at: '2026-04-01T11:00:00.000Z'
      });

      await pullRemoteUpdates();

      // O registro local recente DEVE sobreviver
      const surviving = await localGet(STORES.SHIFTS, shiftId);
      assert.ok(surviving !== null, 'Registro local mais recente não pode ser deletado por tombstone obsoleto');
      assert.equal(surviving.hospital, 'Hospital Araken Criado Recentemente');
      assert.equal(surviving.sync_status, SYNC_STATUS.PENDING);
    });

    test('LWW Ressurreição: Criação remota mais recente sobrescreve tombstone local antigo', async () => {
      const expId = generateUUID();

      // 1. Médica deletou despesa localmente às 08:00
      await localPut(STORES.EXPENSES, {
        id: expId,
        description: 'Livro de Medicina',
        updated_at: '2026-04-01T08:00:00.000Z',
        deleted_at: '2026-04-01T08:00:00.000Z'
      }, false);

      // 2. Outro dispositivo (ou web) recriou a despesa às 09:30
      await mockSupabase.from('expenses').upsert({
        id: expId,
        user_id: 'dra-fernanda-uid',
        description: 'Livro de Medicina 2ª Edição',
        amount: 250,
        updated_at: '2026-04-01T09:30:00.000Z'
      });

      await pullRemoteUpdates();

      // O registro deve reaparecer ativo localmente
      const active = await localGet(STORES.EXPENSES, expId);
      assert.ok(active !== null);
      assert.equal(active.description, 'Livro de Medicina 2ª Edição');
      assert.equal(active.amount, 250);
      assert.equal(active.deleted_at, undefined);
    });

    test('Item criado offline e excluído antes do sync é purgado localmente com ZERO tráfego de rede', async () => {
      const id = generateUUID();
      await localPut(STORES.SHIFTS, { id, hospital: 'Araken Sala 3', net_value: 1800 }, true);

      assert.equal((await getPendingSyncItems()).length, 1);

      // Deleta antes de qualquer sync
      await localDelete(STORES.SHIFTS, id, true);

      // Fila deve estar zerada e item fisicamente inexistente
      assert.equal((await getPendingSyncItems()).length, 0);
      assert.equal(await localGet(STORES.SHIFTS, id, { includeDeleted: true }), null);

      // Executa syncNow: nada é enviado
      const res = await syncNow();
      assert.equal(res.pushed, 0);
      assert.equal(mockSupabase.upsertCallCount, 0);
    });

    test('Re-criação de registro previamente soft-deleted restaura status ativo e limpa deleted_at', async () => {
      const id = generateUUID();
      // Criado e deletado
      await localPut(STORES.EXPENSES, { id, description: 'Estetoscópio', amount: 800, sync_status: SYNC_STATUS.SYNCED }, false);
      await localDelete(STORES.EXPENSES, id, false);

      assert.equal(await localGet(STORES.EXPENSES, id), null);

      // Re-inserção do mesmo ID
      await localPut(STORES.EXPENSES, { id, description: 'Estetoscópio Littmann Black', amount: 950 }, true);

      const resurrected = await localGet(STORES.EXPENSES, id);
      assert.ok(resurrected !== null);
      assert.equal(resurrected.description, 'Estetoscópio Littmann Black');
      assert.equal(resurrected.deleted_at, undefined);
    });

    test('Isolamento de stores: localClear em SHIFTS não afeta EXPENSES nem PROFILES', async () => {
      await localPut(STORES.PROFILES, { id: 'prof-1', doctor_name: 'Dra. Fernanda Ch.' }, false);
      await localPut(STORES.SHIFTS, { id: 's-1', hospital: 'Araken', net_value: 1200 }, false);
      await localPut(STORES.EXPENSES, { id: 'e-1', description: 'Café', amount: 15 }, false);

      await localClear(STORES.SHIFTS);

      assert.equal((await localGetAll(STORES.SHIFTS)).length, 0);
      assert.equal((await localGetAll(STORES.EXPENSES)).length, 1);
      assert.equal((await localGetAll(STORES.PROFILES)).length, 1);
    });

    test('Resiliência a grandes payloads (50KB de notas clínicas de passagem de plantão)', async () => {
      const largeClinicalNotes = 'Paciente RN prematuro em fototerapia intensiva. '.repeat(1000); // ~50KB
      assert.ok(largeClinicalNotes.length > 40000);

      const shiftWithBigNotes = {
        hospital: 'Maternidade Araken UTI Neonatal',
        date: '2026-04-20',
        net_value: 2200,
        notes: largeClinicalNotes
      };

      const saved = await localPut(STORES.SHIFTS, shiftWithBigNotes, true);
      assert.ok(saved.id);

      // Exporta e importa backup contendo a carga grande
      const backup = await exportAllLocalData();
      assert.equal(backup.app_creator, 'FChNeto');

      __resetInMemoryDB();
      const importRes = await importAllLocalData(backup, true);
      assert.equal(importRes.errors.length, 0);

      const restored = await localGet(STORES.SHIFTS, saved.id);
      assert.ok(restored !== null);
      assert.equal(restored.notes.length, largeClinicalNotes.length);
      assert.equal(restored.notes, largeClinicalNotes);
    });
  });

});

/**
 * Finanças Pediatria V4_Cloud - Legacy normalized row-sync engine
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 * 
 * Invariantes de Engenharia:
 * 0. Compatibility engine retained for older callers/tests; the active app uses cloudState.js.
 * 1. Local-First: Persistência local imediata em IndexedDB com replicação assíncrona.
 * 2. Last-Write-Wins (LWW): Resolução determinística de conflitos baseada em updated_at UTC.
 * 3. Tombstone Soft-Delete: Propagação de exclusões com deleted_at sem ressuscitação indesejada.
 * 4. Fila FIFO: Preservação estrita da ordem causal das mutações offline.
 * 5. Resiliência Hospitalar: Modo offline transparente com auto-flush ao reconectar.
 */

import { APP_CREATOR, isOfflineMode, isGuestMode } from './config.js';
import { getSupabase } from './supabaseClient.js';
import {
  localGet,
  localGetAll,
  localPut,
  localDelete,
  getPendingSyncItems,
  markSynced
} from './db.js';

export { APP_CREATOR };

// ============================================================================
// CONSTANTES & CONFIGURAÇÕES DE SINCRONIZAÇÃO
// ============================================================================

export const SYNC_STATUS_EVENT = 'v6_sync_status';
export const SYNC_STATUS_EVENT_LEGACY = 'v4_cloud_sync_status';

export const SYNC_STORAGE_KEYS = {
  LAST_SYNC_TIME: 'v6_last_sync_time',
  LAST_SYNC_STATUS: 'v6_last_sync_status',
  LAST_SYNC_ERROR: 'v6_last_sync_error',
  LAST_SYNC_TIME_LEGACY: 'v4_cloud_last_sync_time',
  LAST_SYNC_STATUS_LEGACY: 'v4_cloud_last_sync_status',
  LAST_SYNC_ERROR_LEGACY: 'v4_cloud_last_sync_error'
};

export const SYNC_TABLES = ['profiles', 'shifts', 'expenses', 'custom_categories'];

// ============================================================================
// ESTADO INTERNO DO MOTOR DE SINCRONIZAÇÃO
// ============================================================================

let _isSyncing = false;
let _autoSyncTimer = null;
let _onlineListenerAttached = false;
let _visibilityListenerAttached = false;
let _currentStatus = 'idle'; // 'idle' | 'syncing' | 'offline' | 'error'
const _statusListeners = new Set();

// Hooks para testes automatizados
let _customSupabaseClient = null;
let _customDb = null;

// ============================================================================
// NOTIFICAÇÃO E GESTÃO DE ESTADOS
// ============================================================================

/**
 * Registra um ouvinte para alterações de status de sincronização.
 * @param {Function} callback - (status: 'idle'|'syncing'|'offline'|'error', details: object) => void
 * @returns {Function} Função de cancelamento da inscrição (unsubscribe)
 */
export function onSyncStatusChange(callback) {
  if (typeof callback === 'function') {
    _statusListeners.add(callback);
    try {
      callback(_currentStatus, { timestamp: new Date().toISOString() });
    } catch (e) {}
  }
  return () => {
    _statusListeners.delete(callback);
  };
}

/**
 * Notifica a alteração de status através de callbacks e evento DOM CustomEvent
 * @param {'idle'|'syncing'|'offline'|'error'} status 
 * @param {object} [details={}] 
 */
export function notifySyncStatus(status, details = {}) {
  _currentStatus = status;

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNC_STATUS, status);
    } catch (e) {}
  }

  const payload = {
    status,
    details,
    timestamp: new Date().toISOString(),
    creator: APP_CREATOR
  };

  _statusListeners.forEach((fn) => {
    try {
      fn(status, payload);
    } catch (err) {
      console.error('[SyncEngine] Erro no listener de status:', err);
    }
  });

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(SYNC_STATUS_EVENT, { detail: payload }));
      window.dispatchEvent(new CustomEvent(SYNC_STATUS_EVENT_LEGACY, { detail: payload }));
    } catch (e) {}
  }
}

/**
 * Retorna o status atual do motor de sincronização
 * @returns {'idle'|'syncing'|'offline'|'error'}
 */
export function getSyncStatus() {
  return _currentStatus;
}

/**
 * Obtém a data/hora da última sincronização bem-sucedida
 * @returns {string|null} ISO 8601 string ou null
 */
export function getLastSyncTime() {
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(SYNC_STORAGE_KEYS.LAST_SYNC_TIME);
    } catch (e) {}
  }
  return null;
}

/**
 * Grava a data/hora da última sincronização bem-sucedida
 * @param {string} isoString 
 */
export function setLastSyncTime(isoString) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNC_TIME, isoString);
    } catch (e) {}
  }
}

// ============================================================================
// RESOLUÇÃO DE DEPENDÊNCIAS (PRODUÇÃO & TESTES)
// ============================================================================

function getActiveSupabase() {
  if (_customSupabaseClient) return _customSupabaseClient;
  return getSupabase();
}

function getActiveDb() {
  if (_customDb) return _customDb;
  return {
    localGet,
    localGetAll,
    localPut,
    localDelete,
    getPendingSyncItems,
    markSynced
  };
}

// ============================================================================
// FASE 1: PUSH (ENVIAR ALTERAÇÕES LOCAIS PARA O SUPABASE)
// ============================================================================

/**
 * Processa a fila de sincronização pendente, aplicando inserções, atualizações
 * e exclusões de forma ordenada (FIFO) no Supabase.
 * 
 * @returns {Promise<{ pushed: number, errors: any[] }>}
 */
export async function pushPendingQueue() {
  const db = getActiveDb();
  const supabase = getActiveSupabase();

  if (!supabase || supabase.isOfflineFallback || isOfflineMode() || isGuestMode()) {
    return { pushed: 0, errors: [] };
  }

  let user = null;
  try {
    const userRes = await supabase.auth.getUser();
    user = userRes.data?.user;
  } catch (e) {
    return { pushed: 0, errors: [e] };
  }

  if (!user || !user.id) {
    return { pushed: 0, errors: [new Error('Usuário não autenticado')] };
  }

  const pendingItems = await db.getPendingSyncItems();
  if (!Array.isArray(pendingItems) || pendingItems.length === 0) {
    return { pushed: 0, errors: [] };
  }

  pendingItems.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  let pushed = 0;
  const errors = [];

  for (const item of pendingItems) {
    const { id: queueId, store: tableName, action, data } = item;

    if (!SYNC_TABLES.includes(tableName)) {
      await db.markSynced(queueId);
      continue;
    }

    try {
      if (action === 'insert' || action === 'update') {
        const payload = { ...data };

        if (tableName !== 'profiles') {
          payload.user_id = user.id;
        } else {
          payload.id = user.id;
        }

        payload.sync_status = 'synced';
        payload.updated_at = payload.updated_at || new Date().toISOString();

        delete payload._localOnly;

        const { error: upsertErr } = await supabase
          .from(tableName)
          .upsert(payload, { onConflict: 'id' });

        if (upsertErr) {
          throw upsertErr;
        }

        await db.localPut(tableName, payload, false);
        await db.markSynced(queueId);
        pushed++;
      } else if (action === 'delete') {
        const recordId = data.id || item.entityId;

        if (tableName === 'shifts' || tableName === 'expenses' || tableName === 'custom_categories') {
          const { error: updateErr } = await supabase
            .from(tableName)
            .update({
              deleted_at: item.timestamp || new Date().toISOString(),
              sync_status: 'synced'
            })
            .eq('id', recordId)
            .eq('user_id', user.id);

          if (updateErr) {
            throw updateErr;
          }
        } else {
          const { error: delErr } = await supabase
            .from(tableName)
            .delete()
            .eq('id', recordId);

          if (delErr) {
            throw delErr;
          }
        }

        await db.markSynced(queueId);
        await db.localDelete(tableName, recordId, false);
        pushed++;
      }
    } catch (opErr) {
      console.warn(`[SyncEngine] Falha ao sincronizar item da fila (${tableName} - ${action}):`, opErr.message);
      errors.push({ itemId: queueId, table: tableName, error: opErr.message });
      if (opErr.message?.includes('network') || opErr.message?.includes('fetch') || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        break;
      }
    }
  }

  return { pushed, errors };
}

// ============================================================================
// FASE 2: PULL (PUXAR ATUALIZAÇÕES REMOTAS & RESOLVER CONFLITOS LWW)
// ============================================================================

/**
 * Puxa alterações remotas do Supabase ocorridas desde lastSyncTime e resolve
 * conflitos através da regra Last-Write-Wins (LWW) baseada em updated_at.
 * 
 * @returns {Promise<{ pulled: number, errors: any[] }>}
 */
export async function pullRemoteUpdates() {
  const db = getActiveDb();
  const supabase = getActiveSupabase();

  if (!supabase || supabase.isOfflineFallback || isOfflineMode() || isGuestMode()) {
    return { pulled: 0, errors: [] };
  }

  let user = null;
  try {
    const userRes = await supabase.auth.getUser();
    user = userRes.data?.user;
  } catch (e) {
    return { pulled: 0, errors: [e] };
  }

  if (!user || !user.id) {
    return { pulled: 0, errors: [new Error('Usuário não autenticado')] };
  }

  const lastSyncTime = getLastSyncTime();
  let pulled = 0;
  const errors = [];

  for (const tableName of SYNC_TABLES) {
    try {
      let query = supabase.from(tableName).select('*');

      if (tableName === 'profiles') {
        query = query.eq('id', user.id);
      } else {
        query = query.eq('user_id', user.id);
      }

      if (lastSyncTime) {
        query = query.gt('updated_at', lastSyncTime);
      }

      const { data: remoteRecords, error: fetchErr } = await query;
      if (fetchErr) {
        throw fetchErr;
      }

      if (!Array.isArray(remoteRecords) || remoteRecords.length === 0) {
        continue;
      }

      for (const remoteRecord of remoteRecords) {
        const localRecord = await db.localGet(tableName, remoteRecord.id);

        if (!localRecord) {
          if (remoteRecord.deleted_at) {
            continue;
          }
          await db.localPut(tableName, { ...remoteRecord, sync_status: 'synced' }, false);
          pulled++;
        } else {
          const remoteUpdatedAt = new Date(remoteRecord.updated_at || 0).getTime();
          const localUpdatedAt = new Date(localRecord.updated_at || 0).getTime();

          if (remoteRecord.deleted_at) {
            const remoteDeletedAt = new Date(remoteRecord.deleted_at).getTime();
            if (remoteDeletedAt >= localUpdatedAt) {
              await db.localDelete(tableName, remoteRecord.id, false);
              pulled++;
            } else {
              await db.localPut(tableName, { ...localRecord, sync_status: 'pending' }, true);
            }
            continue;
          }

          if (remoteUpdatedAt >= localUpdatedAt) {
            await db.localPut(tableName, { ...remoteRecord, sync_status: 'synced' }, false);
            pulled++;
          } else {
            // Local wins LWW
          }
        }
      }
    } catch (pullErr) {
      console.warn(`[SyncEngine] Erro ao puxar tabela ${tableName}:`, pullErr.message);
      errors.push({ table: tableName, error: pullErr.message });
    }
  }

  return { pulled, errors };
}

// ============================================================================
// ORQUESTRADOR CENTRAL: syncNow()
// ============================================================================

/**
 * Dispara uma rodada completa de sincronização bidirecional:
 * 1. Push: Envia pendências locais para o Supabase
 * 2. Pull: Puxa alterações remotas com resolução LWW
 * 3. Atualiza timestamp de última sincronização
 * 
 * @returns {Promise<{ pushed: number, pulled: number, errors: any[] }>}
 */
export async function syncNow() {
  if (_isSyncing) {
    return { pushed: 0, pulled: 0, status: 'already_syncing', errors: [] };
  }

  if (isOfflineMode() || isGuestMode()) {
    notifySyncStatus('offline', { reason: 'offline_or_guest' });
    return { pushed: 0, pulled: 0, status: 'offline', errors: [] };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    notifySyncStatus('offline', { reason: 'network_offline' });
    return { pushed: 0, pulled: 0, status: 'offline', errors: [] };
  }

  _isSyncing = true;
  notifySyncStatus('syncing', { phase: 'start' });

  const result = { pushed: 0, pulled: 0, errors: [] };

  try {
    const pushRes = await pushPendingQueue();
    result.pushed = pushRes.pushed;
    if (pushRes.errors?.length) {
      result.errors.push(...pushRes.errors);
    }

    const pullRes = await pullRemoteUpdates();
    result.pulled = pullRes.pulled;
    if (pullRes.errors?.length) {
      result.errors.push(...pullRes.errors);
    }

    if (result.errors.length === 0) {
      const nowIso = new Date().toISOString();
      setLastSyncTime(nowIso);
      notifySyncStatus('idle', { lastSyncTime: nowIso, ...result });
    } else {
      notifySyncStatus('error', { errors: result.errors, ...result });
    }
  } catch (err) {
    console.error('[SyncEngine] Falha crítica no ciclo syncNow:', err);
    result.errors.push(err.message || err);
    notifySyncStatus('error', { error: err.message || String(err) });
  } finally {
    _isSyncing = false;
  }

  return result;
}

// ============================================================================
// TEMPORIZADOR E GATILHOS DE AUTO-SINCRONIZAÇÃO
// ============================================================================

function _handleOnline() {
  syncNow().catch((e) => console.warn('[SyncEngine] Auto-sync online falhou:', e));
}

function _handleVisibilityChange() {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    syncNow().catch((e) => console.warn('[SyncEngine] Auto-sync visibility falhou:', e));
  }
}

/**
 * Inicia o temporizador de auto-sincronização periódica e registra
 * os ouvintes de rede 'online' e visibilidade 'visibilitychange'.
 * 
 * @param {number} [intervalMs=30000] Intervalo em milissegundos (padrão: 30s)
 */
export function startAutoSync(intervalMs = 30000) {
  stopAutoSync();

  _autoSyncTimer = setInterval(() => {
    syncNow().catch((e) => console.warn('[SyncEngine] Auto-sync periódico falhou:', e));
  }, intervalMs);

  if (typeof window !== 'undefined' && !_onlineListenerAttached) {
    window.addEventListener('online', _handleOnline);
    _onlineListenerAttached = true;
  }

  if (typeof document !== 'undefined' && !_visibilityListenerAttached) {
    document.addEventListener('visibilitychange', _handleVisibilityChange);
    _visibilityListenerAttached = true;
  }
}

/**
 * Interrompe a auto-sincronização periódica e desconecta os ouvintes de eventos.
 */
export function stopAutoSync() {
  if (_autoSyncTimer) {
    clearInterval(_autoSyncTimer);
    _autoSyncTimer = null;
  }

  if (typeof window !== 'undefined' && _onlineListenerAttached) {
    window.removeEventListener('online', _handleOnline);
    _onlineListenerAttached = false;
  }

  if (typeof document !== 'undefined' && _visibilityListenerAttached) {
    document.removeEventListener('visibilitychange', _handleVisibilityChange);
    _visibilityListenerAttached = false;
  }
}

// ============================================================================
// HOOKS EXCLUSIVOS PARA TESTES AUTOMATIZADOS (NODE.JS & CI)
// ============================================================================

export function _setSupabaseForTesting(client) {
  _customSupabaseClient = client;
}

export function _setDbForTesting(mockDb) {
  _customDb = mockDb;
}

export function _isSyncingNow() {
  return _isSyncing;
}

export function _resetSyncForTesting() {
  stopAutoSync();
  _isSyncing = false;
  _customSupabaseClient = null;
  _customDb = null;
  _currentStatus = 'idle';
  _statusListeners.clear();
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(SYNC_STORAGE_KEYS.LAST_SYNC_TIME);
      localStorage.removeItem(SYNC_STORAGE_KEYS.LAST_SYNC_STATUS);
      localStorage.removeItem(SYNC_STORAGE_KEYS.LAST_SYNC_ERROR);
    } catch (e) {}
  }
}

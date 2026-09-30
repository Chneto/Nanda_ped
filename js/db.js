/**
 * Finanças Pediatria V4_Cloud - Motor IndexedDB Local-First
 * Aplicação: Finanças Pediatria V4_Cloud (Dra. Fernanda Ch.)
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 * 
 * Invariantes & Princípios Arquiteturais:
 * 1. 0ms Latency: Operações locais são resolvidas imediatamente no IndexedDB.
 * 2. Persistência Tripla iOS WebKit: navigator.storage.persist() + IndexedDB permanente.
 * 3. Event-Sourced Sync Queue: Todas as mutações locais são enfileiradas em 'sync_queue'
 *    para sincronização em segundo plano com o Supabase via LWW (Last-Write-Wins).
 * 4. Chaves Primárias UUID: crypto.randomUUID() padrão RFC 4122 v4.
 * 5. Adaptabilidade Headless: Fallback em memória transparente quando executado no Node.js
 *    sem navegador ou jsdom, mantendo 100% de compatibilidade com a suíte de testes.
 * 6. Blindagem Contra Regressões: Não quebra nenhum dos testes canônicos existentes.
 */

// ============================================================================
// 1. CONSTANTES CANÔNICAS & CONFIGURAÇÕES
// ============================================================================
export const APP_CREATOR = 'FChNeto';
export const DB_NAME = 'v4_pediatric_cloud_db';
export const DB_VERSION = 1;

/**
 * Nomes Canônicos dos Object Stores (Tabelas Locais)
 */
export const STORES = Object.freeze({
  PROFILES: 'profiles',
  SHIFTS: 'shifts',
  EXPENSES: 'expenses',
  CUSTOM_CATEGORIES: 'custom_categories',
  SYNC_QUEUE: 'sync_queue'
});

/**
 * Status de Sincronização de Entidades
 */
export const SYNC_STATUS = Object.freeze({
  SYNCED: 'synced',
  PENDING: 'pending',
  CONFLICT: 'conflict'
});

/**
 * Ações Suportadas na Fila de Sincronização
 */
export const QUEUE_ACTION = Object.freeze({
  INSERT: 'insert',
  UPDATE: 'update',
  DELETE: 'delete'
});

/**
 * Status do Item na Fila de Sincronização
 */
export const QUEUE_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  FAILED: 'failed'
});

export const MAX_SYNC_ATTEMPTS = 5;

// ============================================================================
// 2. UTILITÁRIOS: GERAÇÃO DE UUID & AMBIENTE
// ============================================================================

/**
 * Gera um UUID v4 canônico compatível com RFC 4122.
 * Utiliza crypto.randomUUID() nativo do navegador/Node.js com fallback seguro.
 * 
 * @returns {string}
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Detecta se o ambiente suporta IndexedDB nativamente.
 * @returns {boolean}
 */
export function isIndexedDBAvailable() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

// Controle de modo de teste em memória
let _forceInMemory = false;

/**
 * Força o uso do mock em memória (útil para testes unitários ou ambientes controlados).
 * @param {boolean} value
 */
export function setForceInMemory(value) {
  _forceInMemory = Boolean(value);
  if (_forceInMemory) {
    _dbPromise = null;
  }
}

/**
 * Retorna se o motor em memória está atualmente ativo.
 * @returns {boolean}
 */
export function isInMemoryActive() {
  return _forceInMemory || !isIndexedDBAvailable();
}

// ============================================================================
// 3. MOTOR MOCK EM MEMÓRIA (NODE.JS HEADLESS TEST RUNNER)
// ============================================================================

class InMemoryDatabaseEngine {
  constructor() {
    this.stores = new Map();
    this.reset();
  }

  reset() {
    this.stores.clear();
    Object.values(STORES).forEach((name) => {
      this.stores.set(name, new Map());
    });
  }

  _getStore(name) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }
    return this.stores.get(name);
  }

  async get(storeName, id) {
    const store = this._getStore(storeName);
    const item = store.get(id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async getAll(storeName, options = {}) {
    const store = this._getStore(storeName);
    const { includeDeleted = false, filter = null, indexName = null, query = null } = options;
    const results = [];

    for (const item of store.values()) {
      if (!includeDeleted && item.deleted_at) {
        continue;
      }
      if (indexName && query !== null && query !== undefined) {
        if (item[indexName] !== query) {
          continue;
        }
      }
      if (typeof filter === 'function' && !filter(item)) {
        continue;
      }
      results.push(JSON.parse(JSON.stringify(item)));
    }

    return results;
  }

  async put(storeName, record) {
    const store = this._getStore(storeName);
    const cloned = JSON.parse(JSON.stringify(record));
    store.set(cloned.id, cloned);
    return cloned;
  }

  async delete(storeName, id) {
    const store = this._getStore(storeName);
    return store.delete(id);
  }

  async clear(storeName) {
    const store = this._getStore(storeName);
    store.clear();
    return true;
  }

  async count(storeName, includeDeleted = false) {
    const items = await this.getAll(storeName, { includeDeleted });
    return items.length;
  }
}

const _memoryEngine = new InMemoryDatabaseEngine();

/**
 * Reseta o banco em memória (utilizado nas suítes de testes para isolamento).
 */
export function __resetInMemoryDB() {
  _memoryEngine.reset();
}

// ============================================================================
// 4. INICIALIZAÇÃO DO INDEXEDDB & PERSISTÊNCIA IOS
// ============================================================================

let _dbPromise = null;

/**
 * Solicita persistência de dados no iOS Safari / WebKit contra purgas automáticas.
 * @returns {Promise<boolean>}
 */
export async function initStoragePersistence() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        return await navigator.storage.persist();
      }
      return true;
    } catch (err) {
      console.warn('[V4_Cloud DB] Erro ao solicitar storage.persist():', err);
      return false;
    }
  }
  return false;
}

/**
 * Abre e retorna a conexão singleton com o banco de dados IndexedDB.
 * Em ambiente Node.js, retorna o wrapper do motor em memória.
 * 
 * @returns {Promise<IDBDatabase|InMemoryDatabaseEngine>}
 */
export function openDatabase() {
  if (isInMemoryActive()) {
    return Promise.resolve(_memoryEngine);
  }

  if (_dbPromise) {
    return _dbPromise;
  }

  _dbPromise = new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Store: profiles
        if (!db.objectStoreNames.contains(STORES.PROFILES)) {
          const profileStore = db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
          profileStore.createIndex('user_id', 'id', { unique: false });
          profileStore.createIndex('updated_at', 'updated_at', { unique: false });
        }

        // 2. Store: shifts
        if (!db.objectStoreNames.contains(STORES.SHIFTS)) {
          const shiftStore = db.createObjectStore(STORES.SHIFTS, { keyPath: 'id' });
          shiftStore.createIndex('user_id', 'user_id', { unique: false });
          shiftStore.createIndex('date', 'date', { unique: false });
          shiftStore.createIndex('month', 'month', { unique: false });
          shiftStore.createIndex('installment1_date', 'installment1_date', { unique: false });
          shiftStore.createIndex('installment2_date', 'installment2_date', { unique: false });
          shiftStore.createIndex('status', 'status', { unique: false });
          shiftStore.createIndex('sync_status', 'sync_status', { unique: false });
          shiftStore.createIndex('updated_at', 'updated_at', { unique: false });
          shiftStore.createIndex('deleted_at', 'deleted_at', { unique: false });
        }

        // 3. Store: expenses
        if (!db.objectStoreNames.contains(STORES.EXPENSES)) {
          const expStore = db.createObjectStore(STORES.EXPENSES, { keyPath: 'id' });
          expStore.createIndex('user_id', 'user_id', { unique: false });
          expStore.createIndex('date', 'date', { unique: false });
          expStore.createIndex('month', 'month', { unique: false });
          expStore.createIndex('category', 'category', { unique: false });
          expStore.createIndex('macro_group', 'macro_group', { unique: false });
          expStore.createIndex('installment_group_id', 'installment_group_id', { unique: false });
          expStore.createIndex('sync_status', 'sync_status', { unique: false });
          expStore.createIndex('updated_at', 'updated_at', { unique: false });
          expStore.createIndex('deleted_at', 'deleted_at', { unique: false });
        }

        // 4. Store: custom_categories
        if (!db.objectStoreNames.contains(STORES.CUSTOM_CATEGORIES)) {
          const catStore = db.createObjectStore(STORES.CUSTOM_CATEGORIES, { keyPath: 'id' });
          catStore.createIndex('user_id', 'user_id', { unique: false });
          catStore.createIndex('name', 'name', { unique: false });
          catStore.createIndex('macro_group', 'macro_group', { unique: false });
          catStore.createIndex('updated_at', 'updated_at', { unique: false });
          catStore.createIndex('deleted_at', 'deleted_at', { unique: false });
        }

        // 5. Store: sync_queue
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('store', 'store', { unique: false });
          queueStore.createIndex('status', 'status', { unique: false });
          queueStore.createIndex('attempts', 'attempts', { unique: false });
          queueStore.createIndex('entityId', 'entityId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;

        db.onversionchange = () => {
          db.close();
          _dbPromise = null;
        };

        initStoragePersistence().catch(() => {});

        resolve(db);
      };

      request.onerror = () => {
        _dbPromise = null;
        reject(request.error || new Error('Falha ao abrir IndexedDB'));
      };

      request.onblocked = () => {
        console.warn('[V4_Cloud DB] Abertura do IndexedDB bloqueada por outra conexão.');
      };
    } catch (err) {
      _dbPromise = null;
      reject(err);
    }
  });

  return _dbPromise;
}

// ============================================================================
// 5. OPERAÇÕES CRUD ASSÍNCRONAS COM WRAPPERS PROMISE
// ============================================================================

/**
 * Busca um registro pelo ID primário.
 * 
 * @param {string} storeName Nome do object store
 * @param {string} id UUID do registro
 * @param {object} [options] Opções de busca
 * @param {boolean} [options.includeDeleted=false] Se deve retornar registros marcados como deletados
 * @returns {Promise<any|null>}
 */
export async function localGet(storeName, id, options = {}) {
  const { includeDeleted = false } = options;

  if (isInMemoryActive()) {
    const item = await _memoryEngine.get(storeName, id);
    if (!item) return null;
    if (!includeDeleted && item.deleted_at) return null;
    return item;
  }

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);

      req.onsuccess = () => {
        const record = req.result || null;
        if (!record) {
          resolve(null);
          return;
        }
        if (!includeDeleted && record.deleted_at) {
          resolve(null);
          return;
        }
        resolve(record);
      };

      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Busca todos os registros de um store, aplicando filtros e exclusão de soft-deleted.
 * 
 * @param {string} storeName Nome do object store
 * @param {object|Function} [options] Opções de busca ou função de filtro
 * @returns {Promise<any[]>}
 */
export async function localGetAll(storeName, options = {}) {
  const opts = typeof options === 'function' ? { filter: options } : options;
  const { includeDeleted = false, filter = null, indexName = null, query = null } = opts;

  if (isInMemoryActive()) {
    return _memoryEngine.getAll(storeName, { includeDeleted, filter, indexName, query });
  }

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      let req;

      if (indexName && query !== null && query !== undefined && store.indexNames.contains(indexName)) {
        const idx = store.index(indexName);
        req = idx.getAll(query);
      } else {
        req = store.getAll();
      }

      req.onsuccess = () => {
        const records = req.result || [];
        const filtered = [];

        for (const record of records) {
          if (!includeDeleted && record.deleted_at) {
            continue;
          }
          if (typeof filter === 'function' && !filter(record)) {
            continue;
          }
          filtered.push(record);
        }

        resolve(filtered);
      };

      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Busca registros pelo mês de competência/data (YYYY-MM).
 * 
 * @param {string} storeName Nome do store (shifts ou expenses)
 * @param {string} month String YYYY-MM
 * @returns {Promise<any[]>}
 */
export async function localGetByMonth(storeName, month) {
  if (!month) return [];
  return localGetAll(storeName, {
    indexName: 'month',
    query: month,
    filter: (r) => r.month === month || (r.date && r.date.startsWith(month))
  });
}

/**
 * Salva ou atualiza um registro no banco local e enfileira na sync_queue se markDirty = true.
 * Garante atomicidade transacional entre o store de dados e o sync_queue.
 * 
 * @param {string} storeName Nome do object store
 * @param {object} record Registro a ser gravado
 * @param {boolean} [markDirty=true] Se true, enfileira mutação na sync_queue
 * @returns {Promise<any>} Registro salvo
 */
export async function localPut(storeName, record, markDirty = true) {
  if (!record || typeof record !== 'object') {
    throw new Error(`[localPut] Registro inválido para store "${storeName}".`);
  }

  const now = new Date().toISOString();
  const clean = { ...record };

  // Garante ID primário UUID
  if (!clean.id) {
    clean.id = generateUUID();
  }

  // Preenche created_at e updated_at
  if (!clean.created_at) {
    clean.created_at = now;
  }
  if (markDirty || !clean.updated_at) {
    clean.updated_at = now;
  }

  // Derivação automática do campo month para shifts e expenses
  if ((storeName === STORES.SHIFTS || storeName === STORES.EXPENSES) && clean.date && !clean.month) {
    clean.month = clean.date.substring(0, 7);
  }

  // Define sync_status se markDirty ativo
  if (markDirty) {
    clean.sync_status = SYNC_STATUS.PENDING;
  } else if (!clean.sync_status) {
    clean.sync_status = SYNC_STATUS.SYNCED;
  }

  // Execução no motor em memória
  if (isInMemoryActive()) {
    const existing = await _memoryEngine.get(storeName, clean.id);
    const action = existing ? QUEUE_ACTION.UPDATE : QUEUE_ACTION.INSERT;

    await _memoryEngine.put(storeName, clean);

    if (storeName !== STORES.SYNC_QUEUE && markDirty) {
      // Coalescência inteligente na fila
      const queueItems = await _memoryEngine.getAll(STORES.SYNC_QUEUE, {
        filter: (q) => q.entityId === clean.id && q.status === QUEUE_STATUS.PENDING
      });

      if (queueItems.length > 0) {
        const existingQueueItem = queueItems[0];
        existingQueueItem.data = { ...clean };
        existingQueueItem.timestamp = now;
        await _memoryEngine.put(STORES.SYNC_QUEUE, existingQueueItem);
      } else {
        const queueItem = {
          id: generateUUID(),
          store: storeName,
          action,
          entityId: clean.id,
          data: { ...clean },
          timestamp: now,
          attempts: 0,
          lastAttemptAt: null,
          lastError: null,
          status: QUEUE_STATUS.PENDING
        };
        await _memoryEngine.put(STORES.SYNC_QUEUE, queueItem);
      }
    }

    return clean;
  }

  // Execução no IndexedDB Nativo
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    try {
      const storesNeeded = (storeName !== STORES.SYNC_QUEUE && markDirty)
        ? [storeName, STORES.SYNC_QUEUE]
        : [storeName];

      const tx = db.transaction(storesNeeded, 'readwrite');
      const dataStore = tx.objectStore(storeName);

      if (storeName === STORES.SYNC_QUEUE || !markDirty) {
        const putReq = dataStore.put(clean);
        putReq.onsuccess = () => resolve(clean);
        putReq.onerror = () => reject(putReq.error);
        return;
      }

      const getReq = dataStore.get(clean.id);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        const action = existing ? QUEUE_ACTION.UPDATE : QUEUE_ACTION.INSERT;

        dataStore.put(clean);

        const queueStore = tx.objectStore(STORES.SYNC_QUEUE);
        const queueIdx = queueStore.index('entityId');
        const queueReq = queueIdx.getAll(clean.id);

        queueReq.onsuccess = () => {
          const pendingItems = (queueReq.result || []).filter((q) => q.status === QUEUE_STATUS.PENDING);

          if (pendingItems.length > 0) {
            const qItem = pendingItems[0];
            qItem.data = { ...clean };
            qItem.timestamp = now;
            queueStore.put(qItem);
          } else {
            const qItem = {
              id: generateUUID(),
              store: storeName,
              action,
              entityId: clean.id,
              data: { ...clean },
              timestamp: now,
              attempts: 0,
              lastAttemptAt: null,
              lastError: null,
              status: QUEUE_STATUS.PENDING
            };
            queueStore.put(qItem);
          }
        };
      };

      tx.oncomplete = () => resolve(clean);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error(`Transação abortada em localPut (${storeName})`));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Remove um registro. Se markDirty = true, executa soft-delete e enfileira na sync_queue.
 * Se o item foi criado localmente e nunca sincronizado, remove completamente sem gerar tráfego de rede.
 * 
 * @param {string} storeName Nome do object store
 * @param {string} id UUID do registro
 * @param {boolean} [markDirty=true] Se true, propaga deleção para a fila de sincronização
 * @returns {Promise<boolean>}
 */
export async function localDelete(storeName, id, markDirty = true) {
  if (!id) return false;

  const now = new Date().toISOString();

  // Execução no motor em memória
  if (isInMemoryActive()) {
    const existing = await _memoryEngine.get(storeName, id);
    if (!existing) return false;

    if (!markDirty) {
      return _memoryEngine.delete(storeName, id);
    }

    // Verifica se existia um insert pendente que nunca foi para a nuvem
    const pendingInserts = await _memoryEngine.getAll(STORES.SYNC_QUEUE, {
      filter: (q) => q.entityId === id && q.action === QUEUE_ACTION.INSERT && q.status === QUEUE_STATUS.PENDING
    });

    if (pendingInserts.length > 0) {
      // O item nunca foi enviado para o Supabase: remove da fila e apaga fisicamente
      for (const p of pendingInserts) {
        await _memoryEngine.delete(STORES.SYNC_QUEUE, p.id);
      }
      return _memoryEngine.delete(storeName, id);
    }

    // Soft-delete e enfileira 'delete'
    existing.deleted_at = now;
    existing.updated_at = now;
    existing.sync_status = SYNC_STATUS.PENDING;
    await _memoryEngine.put(storeName, existing);

    const queueItem = {
      id: generateUUID(),
      store: storeName,
      action: QUEUE_ACTION.DELETE,
      entityId: id,
      data: { id, user_id: existing.user_id, deleted_at: now },
      timestamp: now,
      attempts: 0,
      lastAttemptAt: null,
      lastError: null,
      status: QUEUE_STATUS.PENDING
    };
    await _memoryEngine.put(STORES.SYNC_QUEUE, queueItem);
    return true;
  }

  // Execução no IndexedDB Nativo
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    try {
      if (!markDirty) {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
        return;
      }

      const tx = db.transaction([storeName, STORES.SYNC_QUEUE], 'readwrite');
      const dataStore = tx.objectStore(storeName);
      const queueStore = tx.objectStore(STORES.SYNC_QUEUE);

      const getReq = dataStore.get(id);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (!existing) {
          resolve(false);
          return;
        }

        const queueIdx = queueStore.index('entityId');
        const queueReq = queueIdx.getAll(id);

        queueReq.onsuccess = () => {
          const pendingItems = (queueReq.result || []).filter((q) => q.status === QUEUE_STATUS.PENDING);
          const hasPendingInsert = pendingItems.some((q) => q.action === QUEUE_ACTION.INSERT);

          if (hasPendingInsert) {
            pendingItems.forEach((q) => queueStore.delete(q.id));
            dataStore.delete(id);
          } else {
            existing.deleted_at = now;
            existing.updated_at = now;
            existing.sync_status = SYNC_STATUS.PENDING;
            dataStore.put(existing);

            const qItem = {
              id: generateUUID(),
              store: storeName,
              action: QUEUE_ACTION.DELETE,
              entityId: id,
              data: { id, user_id: existing.user_id, deleted_at: now },
              timestamp: now,
              attempts: 0,
              lastAttemptAt: null,
              lastError: null,
              status: QUEUE_STATUS.PENDING
            };
            queueStore.put(qItem);
          }
        };
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error(`Transação abortada em localDelete (${storeName})`));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Realiza deleção física incondicional (hard delete) sem registrar tombstone ou fila.
 * Utilizado para purga definitiva e testes.
 * 
 * @param {string} storeName 
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
export async function localHardDelete(storeName, id) {
  return localDelete(storeName, id, false);
}

/**
 * Insere múltiplos registros em lote dentro de uma única transação rápida.
 * Utilizado primariamente pelo motor de sincronização para hidratar dados da nuvem (markDirty=false).
 * 
 * @param {string} storeName Nome do object store
 * @param {any[]} records Lista de registros
 * @param {boolean} [markDirty=false] Se true, enfileira na sync_queue
 * @returns {Promise<number>} Quantidade gravada com sucesso
 */
export async function localBatchPut(storeName, records, markDirty = false) {
  if (!Array.isArray(records) || records.length === 0) {
    return 0;
  }

  if (isInMemoryActive()) {
    for (const record of records) {
      await localPut(storeName, record, markDirty);
    }
    return records.length;
  }

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    try {
      const storesNeeded = markDirty ? [storeName, STORES.SYNC_QUEUE] : [storeName];
      const tx = db.transaction(storesNeeded, 'readwrite');
      const store = tx.objectStore(storeName);

      for (const rec of records) {
        const clean = { ...rec };
        if (!clean.id) clean.id = generateUUID();
        if ((storeName === STORES.SHIFTS || storeName === STORES.EXPENSES) && clean.date && !clean.month) {
          clean.month = clean.date.substring(0, 7);
        }
        if (!markDirty && !clean.sync_status) {
          clean.sync_status = SYNC_STATUS.SYNCED;
        }
        store.put(clean);
      }

      tx.oncomplete = () => resolve(records.length);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error(`BatchPut abortado em ${storeName}`));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Limpa todos os registros de um store específico.
 * 
 * @param {string} storeName 
 * @returns {Promise<boolean>}
 */
export async function localClear(storeName) {
  if (isInMemoryActive()) {
    return _memoryEngine.clear(storeName);
  }

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

// ============================================================================
// 6. GERENCIAMENTO DA FILA DE SINCRONIZAÇÃO (SYNC_QUEUE)
// ============================================================================

/**
 * Retorna todos os itens pendentes na fila de sincronização, ordenados cronologicamente.
 * 
 * @returns {Promise<any[]>}
 */
export async function getPendingSyncItems() {
  const items = await localGetAll(STORES.SYNC_QUEUE, {
    includeDeleted: true,
    filter: (q) => q.status === QUEUE_STATUS.PENDING
  });

  return items.sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
}

/**
 * Marca um item da fila como sincronizado com sucesso.
 * Opcionalmente atualiza o registro alvo para sync_status = 'synced'.
 * 
 * @param {string} syncId UUID do item na sync_queue
 * @param {string} [entityStore] Nome do store da entidade
 * @param {string} [entityId] UUID da entidade alvo
 * @returns {Promise<void>}
 */
export async function markSynced(syncId, entityStore, entityId) {
  if (!syncId) return;

  await localHardDelete(STORES.SYNC_QUEUE, syncId);

  if (entityStore && entityId && Object.values(STORES).includes(entityStore)) {
    const item = await localGet(entityStore, entityId, { includeDeleted: true });
    if (item && item.sync_status !== SYNC_STATUS.SYNCED) {
      item.sync_status = SYNC_STATUS.SYNCED;
      await localPut(entityStore, item, false);
    }
  }
}

/**
 * Registra uma tentativa com falha na fila de sincronização.
 * Incrementa attempts e, se atingir MAX_SYNC_ATTEMPTS, marca como 'failed'.
 * 
 * @param {string} syncId UUID do item na sync_queue
 * @param {string} errorMessage Descrição do erro
 * @returns {Promise<any|null>}
 */
export async function incrementSyncAttempts(syncId, errorMessage) {
  if (!syncId) return null;

  const item = await localGet(STORES.SYNC_QUEUE, syncId, { includeDeleted: true });
  if (!item) return null;

  item.attempts = (item.attempts || 0) + 1;
  item.lastAttemptAt = new Date().toISOString();
  item.lastError = String(errorMessage || 'Erro de sincronização');

  if (item.attempts >= MAX_SYNC_ATTEMPTS) {
    item.status = QUEUE_STATUS.FAILED;
  }

  await localPut(STORES.SYNC_QUEUE, item, false);
  return item;
}

/**
 * Limpa toda a fila de sincronização.
 * @returns {Promise<boolean>}
 */
export async function clearSyncQueue() {
  return localClear(STORES.SYNC_QUEUE);
}

// ============================================================================
// 7. BACKUP, EXPORTAÇÃO E IMPORTAÇÃO ("SALVAR NO MEU IPHONE")
// ============================================================================

/**
 * Exporta todo o estado do IndexedDB local em formato JSON.
 * Ideal para backup manual em 1 toque ("Salvar no Meu iPhone") via Web Share API.
 * 
 * @returns {Promise<object>} Dump completo estruturado
 */
export async function exportAllLocalData() {
  const [profiles, shifts, expenses, customCategories, syncQueue] = await Promise.all([
    localGetAll(STORES.PROFILES, { includeDeleted: true }),
    localGetAll(STORES.SHIFTS, { includeDeleted: true }),
    localGetAll(STORES.EXPENSES, { includeDeleted: true }),
    localGetAll(STORES.CUSTOM_CATEGORIES, { includeDeleted: true }),
    localGetAll(STORES.SYNC_QUEUE, { includeDeleted: true })
  ]);

  return {
    app_creator: APP_CREATOR,
    app_version: '4.0.0',
    db_name: DB_NAME,
    db_version: DB_VERSION,
    exported_at: new Date().toISOString(),
    data: {
      profiles,
      shifts,
      expenses,
      custom_categories: customCategories,
      sync_queue: syncQueue
    }
  };
}

/**
 * Importa um dump JSON completo para o banco local.
 * 
 * @param {object} dump Objeto JSON exportado
 * @param {boolean} [clearExisting=true] Se true, limpa os stores antes da importação
 * @returns {Promise<{ imported: number, errors: string[] }>}
 */
export async function importAllLocalData(dump, clearExisting = true) {
  if (!dump || typeof dump !== 'object' || !dump.data) {
    throw new Error('[importAllLocalData] Formato de backup inválido.');
  }

  const errors = [];
  let totalImported = 0;

  try {
    if (clearExisting) {
      await Promise.all([
        localClear(STORES.PROFILES),
        localClear(STORES.SHIFTS),
        localClear(STORES.EXPENSES),
        localClear(STORES.CUSTOM_CATEGORIES),
        localClear(STORES.SYNC_QUEUE)
      ]);
    }

    const { profiles = [], shifts = [], expenses = [], custom_categories = [], sync_queue = [] } = dump.data;

    totalImported += await localBatchPut(STORES.PROFILES, profiles, false);
    totalImported += await localBatchPut(STORES.SHIFTS, shifts, false);
    totalImported += await localBatchPut(STORES.EXPENSES, expenses, false);
    totalImported += await localBatchPut(STORES.CUSTOM_CATEGORIES, custom_categories, false);
    totalImported += await localBatchPut(STORES.SYNC_QUEUE, sync_queue, false);
  } catch (err) {
    errors.push(err.message || String(err));
  }

  return {
    imported: totalImported,
    errors
  };
}

/**
 * Retorna contagens de registros e estatísticas do banco de dados local.
 * 
 * @returns {Promise<Record<string, number>>}
 */
export async function getDatabaseStats() {
  const [profiles, shifts, expenses, customCategories, pendingQueue] = await Promise.all([
    localGetAll(STORES.PROFILES),
    localGetAll(STORES.SHIFTS),
    localGetAll(STORES.EXPENSES),
    localGetAll(STORES.CUSTOM_CATEGORIES),
    getPendingSyncItems()
  ]);

  return {
    profilesCount: profiles.length,
    shiftsCount: shifts.length,
    expensesCount: expenses.length,
    customCategoriesCount: customCategories.length,
    pendingSyncCount: pendingQueue.length
  };
}

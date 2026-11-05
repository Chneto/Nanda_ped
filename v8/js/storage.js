/**
 * Finanças Pediatria /v8/ - Motor de Persistência Tripla & Segurança de Dados
 * Standalone Local-First • Safari WebKit Quota Shield • Migração Retrocompatível
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 * 
 * Invariantes de Persistência:
 * 1. Write-Through Síncrono no localStorage (0ms, imune a suspensão de processo do iOS)
 * 2. IndexedDB Assíncrono Durável (v8_pediatric_db) para retenção de longo prazo
 * 3. Quota Shield: Proteção contra QuotaExceededError (5MB do Safari) isolando doctorPhoto pesada
 * 4. Web Share API para salvar diretamente no app "Arquivos" ou iCloud Drive do iPhone
 * 5. Motor Universal de Migração de Backups JSON de versões legadas (v2 a v7)
 */

import { APP_CREATOR, APP_VERSION, createCanonicalShift, createCanonicalExpense, getCategoryKey, normalizeCategoryName, DEFAULT_CATEGORIES, DEFAULT_INCOME_SOURCES, DEFAULT_HOSPITALS, getMacroGroupForCategory } from './store.js';

export const STORAGE_KEY = 'financas_pediatria_v8';
export const DB_NAME = 'v8_pediatric_db';
export const DB_STORE = 'app_state';
export const BACKUP_MAX_BYTES = 10 * 1024 * 1024; // 10 Megabytes

/**
 * Driver IndexedDB com conexão singleton reutilizável
 */
export const IndexedDBDriver = {
  dbPromise: null,

  getDB() {
    if (this.dbPromise) return this.dbPromise;
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB não suportado no ambiente'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(DB_STORE)) {
            db.createObjectStore(DB_STORE);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });

    return this.dbPromise;
  },

  async set(key, value) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDBDriver] Falha na gravação:', err);
      return false;
    }
  },

  async get(key) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDBDriver] Falha na leitura:', err);
      return null;
    }
  }
};

/**
 * Gerenciador de Persistência Tripla para a Versão /v8/
 */
export class PediatricStorage {
  constructor(storageKey = STORAGE_KEY) {
    this.storageKey = storageKey;
  }

  /**
   * Leitura síncrona do localStorage para renderização em 0ms
   */
  loadSync() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (err) {
      console.warn('[PediatricStorage] Erro ao ler localStorage:', err);
    }
    return null;
  }

  /**
   * Gravação síncrona Write-Through com Quota Shield para Safari iOS
   */
  saveSync(state) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      // Clona o estado superficialmente
      const persistable = { ...state };

      // Quota Shield: Se a foto de perfil for pesada (> 30KB), remove da cópia do localStorage
      // A foto completa permanece salva no IndexedDB
      if (typeof persistable.doctorPhoto === 'string' && persistable.doctorPhoto.length > 30000) {
        persistable.doctorPhoto = null;
      }

      window.localStorage.setItem(this.storageKey, JSON.stringify(persistable));
      return true;
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        console.warn('[PediatricStorage] QuotaExceededError capturado! Aplicando salvamento de emergência...');
        try {
          // Salva apenas os dados essenciais sem foto nem lixeira
          const emergencyState = { ...state, doctorPhoto: null, trash: { shifts: [], expenses: [] } };
          window.localStorage.setItem(this.storageKey, JSON.stringify(emergencyState));
          return true;
        } catch (subErr) {
          console.error('[PediatricStorage] Falha no salvamento de emergência:', subErr);
        }
      }
      return false;
    }
  }

  /**
   * Gravação assíncrona durável no IndexedDB (armazena estado completo, inclusive fotos)
   */
  async saveAsync(state) {
    return IndexedDBDriver.set('current_state', state);
  }

  /**
   * Leitura assíncrona do IndexedDB (usada para recuperação caso o localStorage tenha sido purgado pelo Safari)
   */
  async loadAsync() {
    return IndexedDBDriver.get('current_state');
  }

  /**
   * Solicita persistência permanente de dados ao Safari/WebKit
   */
  async requestPersistence() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persist();
        return isPersisted;
      } catch (err) {
        return false;
      }
    }
    return false;
  }

  /**
   * Exporta arquivo JSON de backup acionando a Web Share API do iOS
   * Permite salvar no app "Arquivos" ou no iCloud Drive com fallback para download tradicional
   */
  async exportBackup(data) {
    const exportPayload = {
      app: 'Finanças Pediatria',
      version: APP_VERSION,
      author: APP_CREATOR,
      exportedAt: new Date().toISOString(),
      ...data
    };

    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const dateTag = new Date().toISOString().slice(0, 10);
    const fileName = `financas_pediatria_v8_backup_${dateTag}.json`;

    // 1. Tenta Web Share API nativa do iOS (salvar no app Arquivos / iCloud)
    if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
      try {
        const file = new File([jsonStr], fileName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Backup Finanças Pediatria',
            text: 'Cópia de segurança médica protegida',
            files: [file]
          });
          return { success: true, method: 'share', fileName };
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[PediatricStorage] Web Share API falhou, usando download direto:', err);
        }
      }
    }

    // 2. Fallback de download clássico em navegador
    if (typeof document !== 'undefined') {
      try {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return { success: true, method: 'download', fileName };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    return { success: false, error: 'Ambiente não suporta exportação de arquivo' };
  }

  /**
   * Motor Universal de Migração e Importação de Backups Legados (v2 a v7) para a Versão /v8/
   */
  importBackup(jsonString, store) {
    if (typeof jsonString !== 'string') {
      return { success: false, error: 'Conteúdo de arquivo inválido' };
    }

    // Validação estrita de tamanho (máximo 10MB)
    if (jsonString.length > BACKUP_MAX_BYTES) {
      return { success: false, error: 'Arquivo excede o limite máximo de segurança de 10MB' };
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      return { success: false, error: 'Arquivo JSON malformado ou corrompido' };
    }

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Estrutura de dados inválida' };
    }

    // Snapshot pré-importação para rollback caso ocorra erro inesperado
    const previousState = JSON.parse(JSON.stringify(store.data));

    try {
      const migrated = this.migrateLegacyData(parsed);
      store.init(migrated);
      store.save();

      return {
        success: true,
        countShifts: (store.data.shifts || []).length,
        countExpenses: (store.data.expenses || []).length,
        migratedFrom: parsed.version || 'v2-v5 legado'
      };
    } catch (err) {
      console.error('[PediatricStorage] Erro durante a importação. Revertendo:', err);
      store.init(previousState);
      store.save();
      return { success: false, error: `Falha na migração de dados: ${err.message}` };
    }
  }

  /**
   * Normalização e migração polimórfica de esquemas legados (v2 a v7)
   */
  migrateLegacyData(raw) {
    const migrated = {
      version: APP_VERSION,
      creator: APP_CREATOR,
      doctorName: String(raw.doctorName || raw.doctor_name || 'Médica').trim() || 'Médica',
      doctorRole: String(raw.doctorRole || raw.doctor_role || 'Pediatra (R3)').trim(),
      doctorCrm: String(raw.doctorCrm || raw.doctor_crm || '').trim(),
      doctorPhoto: raw.doctorPhoto || raw.doctor_photo || null,
      residencySalary: raw.residencySalary || raw.fixedSalary || {
        value: 0.00,
        dayOfMonth: 5,
        description: 'Bolsa Residência Médica (Pediatria)',
        active: false
      },
      shifts: [],
      expenses: [],
      incomeSources: [],
      categories: [],
      customCategories: [],
      hospitals: [],
      preferences: {
        regime: raw.preferences?.regime || 'caixa',
        theme: raw.preferences?.theme || 'light',
        activeMonth: raw.preferences?.activeMonth || new Date().toISOString().slice(0, 7)
      },
      trash: {
        shifts: [],
        expenses: []
      },
      lastUpdated: new Date().toISOString()
    };

    // 1. Normalização de Categorias
    const rawCategories = Array.isArray(raw.categories) ? raw.categories : [];
    const rawCustomCategories = Array.isArray(raw.customCategories) ? raw.customCategories : [];
    const combinedCategories = [...rawCategories, ...rawCustomCategories];

    const categoryMap = new Map();
    // Inicia com as 23 canônicas
    for (const defCat of DEFAULT_CATEGORIES) {
      categoryMap.set(getCategoryKey(defCat.name), { ...defCat });
    }

    // Mescla categorias customizadas ou renomeadas do backup
    for (const cat of combinedCategories) {
      if (!cat || !cat.name) continue;
      const cleanName = normalizeCategoryName(cat.name);
      const key = getCategoryKey(cleanName);
      const existing = categoryMap.get(key);

      if (existing) {
        existing.icon = cat.icon || existing.icon;
        existing.color = cat.color || existing.color;
        if (cat.default_payment_type) existing.default_payment_type = cat.default_payment_type;
        if (cat.default_amount !== undefined) existing.default_amount = cat.default_amount;
        if (cat.monthly_budget_cap !== undefined) existing.monthly_budget_cap = cat.monthly_budget_cap;
      } else {
        const mg = cat.macro_group || cat.macroGroup || getMacroGroupForCategory(cleanName).name;
        categoryMap.set(key, {
          id: cat.id || `cat_${key}`,
          name: cleanName,
          macro_group: mg,
          macroGroup: mg,
          default_payment_type: cat.default_payment_type || 'a_vista',
          default_amount: cat.default_amount || null,
          monthly_budget_cap: cat.monthly_budget_cap || null,
          icon: cat.icon || 'tag',
          color: cat.color || '#7E57C2',
          isDefault: false,
          isCustom: true,
          active: cat.active !== false
        });
      }
    }

    migrated.categories = Array.from(categoryMap.values());
    migrated.customCategories = migrated.categories.filter(c => c.isCustom);

    // 2. Normalização de Fontes de Renda e Hospitais
    const sourceMap = new Map();
    for (const defSrc of DEFAULT_INCOME_SOURCES) {
      sourceMap.set(getCategoryKey(defSrc.name), { ...defSrc });
    }

    // Se o backup já tinha incomeSources estruturadas (v8 ou v7 evoluído)
    if (Array.isArray(raw.incomeSources)) {
      for (const src of raw.incomeSources) {
        if (!src || !src.name) continue;
        const cleanName = normalizeCategoryName(src.name);
        const key = getCategoryKey(cleanName);
        sourceMap.set(key, {
          id: src.id || `src_${key}`,
          name: cleanName,
          type: src.type || 'plantao',
          typeLabel: src.typeLabel || 'Plantão',
          paymentRule: src.paymentRule || {
            type: 'parturition_75_60_25_90',
            splits: [{ percentage: 75, lagMonths: 2 }, { percentage: 25, lagMonths: 3 }]
          },
          defaultAmount: src.defaultAmount || 0,
          icon: src.icon || 'hospital',
          color: src.color || '#7E57C2',
          isDefault: Boolean(src.isDefault),
          active: src.active !== false
        });
      }
    }

    // Se o backup veio de versões antigas (v2..v5) que usavam array de strings hospitals
    if (Array.isArray(raw.hospitals)) {
      for (const h of raw.hospitals) {
        if (typeof h !== 'string' || !h.trim()) continue;
        const cleanName = normalizeCategoryName(h);
        const key = getCategoryKey(cleanName);
        if (!sourceMap.has(key)) {
          sourceMap.set(key, {
            id: `src_${key}`,
            name: cleanName,
            type: 'plantao',
            typeLabel: 'Plantão em Sala de Parto',
            paymentRule: {
              type: 'parturition_75_60_25_90',
              label: 'Sala de Parto (75% D+60 / 25% D+90)',
              splits: [{ percentage: 75, lagMonths: 2 }, { percentage: 25, lagMonths: 3 }]
            },
            defaultAmount: 2000.00,
            icon: 'hospital',
            color: '#7E57C2',
            isDefault: false,
            active: true
          });
        }
      }
    }

    migrated.incomeSources = Array.from(sourceMap.values());
    migrated.hospitals = Array.from(new Set([...DEFAULT_HOSPITALS, ...migrated.incomeSources.map(s => s.name)]));

    // 3. Normalização e Higienização de Shifts
    if (Array.isArray(raw.shifts)) {
      migrated.shifts = raw.shifts.map(s => {
        const hospName = normalizeCategoryName(s.source_name_snapshot || s.hospital || 'Maternidade Principal');
        const matched = sourceMap.get(getCategoryKey(hospName));
        return createCanonicalShift({
          ...s,
          source_id: matched?.id || s.source_id,
          source_name_snapshot: hospName,
          payment_rule_snapshot: matched?.paymentRule || s.payment_rule_snapshot
        });
      });
    }

    // 4. Normalização e Higienização de Expenses
    if (Array.isArray(raw.expenses)) {
      migrated.expenses = raw.expenses.map(e => {
        const catName = normalizeCategoryName(e.category_name_snapshot || e.category || 'Outros');
        const matched = categoryMap.get(getCategoryKey(catName));
        return createCanonicalExpense({
          ...e,
          category_id: matched?.id || e.category_id,
          category_name_snapshot: catName,
          macro_group: matched?.macro_group || e.macro_group || getMacroGroupForCategory(catName).name,
          macro_group_snapshot: matched?.macro_group || e.macro_group_snapshot || getMacroGroupForCategory(catName).name
        });
      });
    }

    return migrated;
  }
}

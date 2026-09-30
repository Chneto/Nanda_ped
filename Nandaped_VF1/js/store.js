/**
 * Finanças Pediatria V4_Cloud - Core Domain & Financial Calculation Engine
 * Dedicated for Dra. Fernanda Ch. (Pediatria & Neonatologia)
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 * 
 * Invariants:
 * 1. APP_CREATOR = 'FChNeto' is immutable across code, state, and exports.
 * 2. Shifts follow 75% D+60 / 25% D+90 with cent-perfect precision and month-end clamping.
 * 3. 22 canonical categories mapped to 6 intelligent macro-groups.
 * 4. Installments (2x-24x) allocate remainder cents to installment 1.
 * 5. Strict calculation of Regime de Caixa vs Regime de Competência.
 */

export const APP_CREATOR = 'FChNeto';
export const APP_VERSION = '4.0.0';
export const STORAGE_KEY = 'v4_cloud_pediatric_store';
export const DB_NAME = 'v4_pediatric_cloud_db';
export const DB_STORE = 'app_state';

// ============================================================================
// 1. CANONICAL CATEGORIES & MACRO-GROUPS TAXONOMY
// ============================================================================

export const CANONICAL_CATEGORIES = [
  'Passagens',
  'Mercantil',
  'Academia',
  'Estudo',
  'Cursos',
  'Presentes',
  'Aluguel',
  'Energia',
  'Internet',
  'Combustível',
  'Qualificação/Congresso/Pós',
  'Fisioterapia',
  'Água',
  'Lanches',
  'Doação',
  'Refeição',
  'Beleza/Salão',
  'Uber',
  'Remédios',
  'Compras Parceladas',
  'Saídas',
  'Delivery',
  'Produtos de beleza'
];

export const DEFAULT_CATEGORIES = [
  { id: 'cat_passagens', name: 'Passagens', icon: 'flight', color: '#7E57C2' },
  { id: 'cat_mercantil', name: 'Mercantil', icon: 'cart', color: '#26A69A' },
  { id: 'cat_academia', name: 'Academia', icon: 'fitness', color: '#EC407A' },
  { id: 'cat_estudo', name: 'Estudo', icon: 'study', color: '#42A5F5' },
  { id: 'cat_cursos', name: 'Cursos', icon: 'course', color: '#5C6BC0' },
  { id: 'cat_presentes', name: 'Presentes', icon: 'gift', color: '#AB47BC' },
  { id: 'cat_aluguel', name: 'Aluguel', icon: 'home', color: '#EF5350' },
  { id: 'cat_energia', name: 'Energia', icon: 'bolt', color: '#FFA726' },
  { id: 'cat_internet', name: 'Internet', icon: 'wifi', color: '#29B6F6' },
  { id: 'cat_combustivel', name: 'Combustível', icon: 'fuel', color: '#FF7043' },
  { id: 'cat_qualificacao', name: 'Qualificação/Congresso/Pós', icon: 'qualification', color: '#8E24AA' },
  { id: 'cat_fisioterapia', name: 'Fisioterapia', icon: 'fisioterapia', color: '#F06292' },
  { id: 'cat_agua', name: 'Água', icon: 'water', color: '#26C6DA' },
  { id: 'cat_lanches', name: 'Lanches', icon: 'snack', color: '#FFCA28' },
  { id: 'cat_doacao', name: 'Doação', icon: 'donation', color: '#E91E63' },
  { id: 'cat_refeicao', name: 'Refeição', icon: 'meal', color: '#FF8A65' },
  { id: 'cat_beleza_salao', name: 'Beleza/Salão', icon: 'beauty', color: '#D81B60' },
  { id: 'cat_uber', name: 'Uber', icon: 'car', color: '#78909C' },
  { id: 'cat_remedios', name: 'Remédios', icon: 'meds', color: '#66BB6A' },
  { id: 'cat_compras_parceladas', name: 'Compras Parceladas', icon: 'credit_card', color: '#8D6E63' },
  { id: 'cat_saidas', name: 'Saídas', icon: 'outing', color: '#9C27B0' },
  { id: 'cat_delivery', name: 'Delivery', icon: 'delivery', color: '#FF5722' },
  { id: 'cat_produtos_beleza', name: 'Produtos de beleza', icon: 'sparkles', color: '#F48FB1' }
];

export const MACRO_GROUPS = [
  {
    id: 'macro_alimentacao',
    name: 'Alimentação',
    aliases: ['Alimentação & Mercado', 'Alimentacao'],
    icon: 'meal',
    color: '#FF7043',
    bgColor: '#FBE9E7',
    categories: ['Mercantil', 'Refeição', 'Lanches', 'Delivery']
  },
  {
    id: 'macro_transporte',
    name: 'Transporte & Mobilidade',
    aliases: ['Transporte & Logística', 'Transporte'],
    icon: 'car',
    color: '#42A5F5',
    bgColor: '#E3F2FD',
    categories: ['Combustível', 'Uber', 'Passagens']
  },
  {
    id: 'macro_moradia',
    name: 'Moradia & Contas',
    aliases: ['Moradia'],
    icon: 'home',
    color: '#26A69A',
    bgColor: '#E0F2F1',
    categories: ['Aluguel', 'Energia', 'Água', 'Internet']
  },
  {
    id: 'macro_formacao',
    name: 'Formação & Carreira',
    aliases: ['Educação & Carreira', 'Formação', 'Educacao'],
    icon: 'qualification',
    color: '#7E57C2',
    bgColor: '#EDE7F6',
    categories: ['Estudo', 'Cursos', 'Qualificação/Congresso/Pós']
  },
  {
    id: 'macro_saude_beleza',
    name: 'Saúde & Autocuidado',
    aliases: ['Saúde & Bem-Estar', 'Saúde', 'Saude'],
    icon: 'sparkles',
    color: '#EC407A',
    bgColor: '#FCE4EC',
    categories: ['Remédios', 'Academia', 'Fisioterapia', 'Beleza/Salão', 'Produtos de beleza']
  },
  {
    id: 'macro_lazer_outros',
    name: 'Pessoal, Lazer & Outros',
    aliases: ['Estilo de Vida & Outros', 'Lazer & Outros', 'Outros'],
    icon: 'gift',
    color: '#AB47BC',
    bgColor: '#F3E5F5',
    categories: ['Presentes', 'Saídas', 'Compras Parceladas', 'Doação']
  }
];

export const MACRO_GROUPS_RECORD = {
  'Alimentação': ['Mercantil', 'Refeição', 'Lanches', 'Delivery'],
  'Transporte & Mobilidade': ['Combustível', 'Uber', 'Passagens'],
  'Moradia & Contas': ['Aluguel', 'Energia', 'Água', 'Internet'],
  'Formação & Carreira': ['Estudo', 'Cursos', 'Qualificação/Congresso/Pós'],
  'Saúde & Autocuidado': ['Remédios', 'Academia', 'Fisioterapia', 'Beleza/Salão', 'Produtos de beleza'],
  'Pessoal, Lazer & Outros': ['Presentes', 'Saídas', 'Compras Parceladas', 'Doação']
};

export const DEFAULT_HOSPITALS = [
  'Maternidade Araken',
  'Maternidade Leide Morais',
  'MEJEC',
  'Hospital da Criança',
  'Hospital Mater Dei',
  'Hospital Promater'
];

// ============================================================================
// 2. DATE & MATHEMATICAL HELPERS
// ============================================================================

export function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addMonthsToDateString(dateStr, monthsToAdd) {
  if (!dateStr || typeof dateStr !== 'string') return getLocalDateString();
  const parts = dateStr.split('-');
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  month += monthsToAdd;
  year += Math.floor(month / 12);
  month = ((month % 12) + 12) % 12;

  const maxDays = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, maxDays);

  const mm = String(month + 1).padStart(2, '0');
  const dd = String(safeDay).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function formatCurrency(val) {
  const num = typeof val === 'number' && !isNaN(val) ? val : 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDateBR(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '--/--/----';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatMonthYear(monthStr) {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const year = parts[0];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mIndex = parseInt(parts[1], 10) - 1;
  return `${monthNames[mIndex] || parts[1]} de ${year}`;
}

export function getMacroGroupForCategory(categoryName, customCategories = []) {
  if (!categoryName) return MACRO_GROUPS[5];
  const trimmed = categoryName.trim().toLowerCase();

  // 1. Check custom categories
  if (Array.isArray(customCategories)) {
    const custom = customCategories.find(c => (c.name || '').toLowerCase() === trimmed);
    if (custom && (custom.macro_group || custom.macroGroup)) {
      const macroGroupName = custom.macro_group || custom.macroGroup;
      const match = MACRO_GROUPS.find(g => 
        g.name.toLowerCase() === macroGroupName.toLowerCase() ||
        g.id.toLowerCase() === macroGroupName.toLowerCase() ||
        (g.aliases && g.aliases.some(a => a.toLowerCase() === macroGroupName.toLowerCase()))
      );
      if (match) return match;
    }
  }

  // 2. Backward compatibility alias for Cosméticos
  if (trimmed === 'cosméticos' || trimmed === 'cosmeticos') {
    return MACRO_GROUPS.find(g => g.id === 'macro_saude_beleza') || MACRO_GROUPS[4];
  }

  // 3. Check canonical macro-groups
  for (const group of MACRO_GROUPS) {
    if (group.categories.some(c => c.toLowerCase() === trimmed)) {
      return group;
    }
  }

  // Fallback: Pessoal, Lazer & Outros
  return MACRO_GROUPS[5];
}

// ============================================================================
// 3. CORE DOMAIN CALCULATION ENGINES
// ============================================================================

/**
 * Calculates 75% D+60 and 25% D+90 shift installments with cent integrity
 * and calendar month-end clamping.
 */
export function calculateShiftInstallments(netValue, shiftDateStr) {
  const net = Math.round((parseFloat(netValue) || 0) * 100) / 100;
  const workedDate = shiftDateStr || getLocalDateString();

  const val75 = Math.round(net * 0.75 * 100) / 100;
  const val25 = Math.round((net - val75) * 100) / 100;

  const d60 = addMonthsToDateString(workedDate, 2);
  const d90 = addMonthsToDateString(workedDate, 3);

  return {
    installment1: {
      percentage: 75,
      value: val75,
      date: d60,
      expectedDate: d60,
      status: 'pending',
      paidDate: null
    },
    installment2: {
      percentage: 25,
      value: val25,
      date: d90,
      expectedDate: d90,
      status: 'pending',
      paidDate: null
    }
  };
}

/**
 * Generates 2x to 24x installment purchases, adding remainder cents
 * to installment 1 and projecting monthly dates.
 */
export function generateExpenseInstallments(expenseData, totalInstallments = 1) {
  const totalInst = Math.max(1, Math.min(24, parseInt(totalInstallments, 10) || 1));
  const rawVal = parseFloat(expenseData.amount ?? expenseData.value) || 0;
  const totalVal = Math.round(rawVal * 100) / 100;
  const baseDate = expenseData.date || getLocalDateString();
  const parentGroupId = expenseData.installment_group_id || expenseData.groupId || `exp_grp_${Date.now()}`;
  const category = expenseData.category || 'Outros';
  const macro = getMacroGroupForCategory(category).name;

  if (totalInst === 1) {
    return [{
      ...expenseData,
      id: expenseData.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      description: expenseData.description || 'Despesa',
      amount: totalVal,
      value: totalVal,
      date: baseDate,
      category,
      macro_group: macro,
      total_installments: 1,
      totalInstallments: 1,
      current_installment: 1,
      installmentNumber: 1,
      isInstallment: false,
      installment_group_id: null,
      createdAt: expenseData.createdAt || new Date().toISOString()
    }];
  }

  const partVal = Math.floor((totalVal / totalInst) * 100) / 100;
  const firstPartVal = Math.round((totalVal - (partVal * (totalInst - 1))) * 100) / 100;
  const installments = [];

  for (let i = 1; i <= totalInst; i++) {
    const instVal = (i === 1) ? firstPartVal : partVal;
    const instDate = addMonthsToDateString(baseDate, i - 1);

    installments.push({
      ...expenseData,
      id: `exp_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      description: `${expenseData.description || 'Despesa'} (${i}/${totalInst})`,
      amount: instVal,
      value: instVal,
      date: instDate,
      category,
      macro_group: macro,
      total_installments: totalInst,
      totalInstallments: totalInst,
      current_installment: i,
      installmentNumber: i,
      isInstallment: true,
      installment_group_id: parentGroupId,
      groupId: parentGroupId,
      createdAt: expenseData.createdAt || new Date().toISOString()
    });
  }

  return installments;
}

// ============================================================================
// 4. INDEXEDDB LOCAL-FIRST MANAGER
// ============================================================================

export const IndexedDBManager = {
  dbPromise: null,

  getDB() {
    if (this.dbPromise) return this.dbPromise;
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB não suportado'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  },

  async getAppState() {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const req = store.get('current_state');
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  },

  async saveAppState(data) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const req = store.put({ id: 'current_state', data, updatedAt: new Date().toISOString() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return false;
    }
  },

  async clearAppState() {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const req = store.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return false;
    }
  }
};

// ============================================================================
// 5. PEDIATRIC STORE CLASS
// ============================================================================

export class PediatricStore {
  constructor() {
    this.listeners = [];
    this.data = this.getDefaultState();
    this.initPersistence();
  }

  getDefaultState() {
    return {
      creator: APP_CREATOR,
      version: APP_VERSION,
      doctorName: 'Dra. Fernanda Ch.',
      crm: 'CRM/RN 12345',
      specialty: 'Pediatria (R3)',
      doctorPhoto: null,
      residencySalary: {
        value: 4106.09,
        active: true,
        dayOfMonth: 5
      },
      hospitals: [...DEFAULT_HOSPITALS],
      categories: [...DEFAULT_CATEGORIES],
      customCategories: [],
      shifts: [],
      expenses: [],
      preferences: {
        theme: 'light',
        regime: 'caixa',
        activeMonth: getLocalDateString().slice(0, 7),
        chartViewMode: 'macro'
      }
    };
  }

  async initPersistence() {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      try { await navigator.storage.persist(); } catch {}
    }

    this.loadFromLocalStorage();

    if (typeof window !== 'undefined') {
      try {
        const idbData = await IndexedDBManager.getAppState();
        if (idbData && idbData.version) {
          this.data = { ...this.data, ...idbData, creator: APP_CREATOR };
          this.notify();
        }
      } catch {}
    }
  }

  loadFromLocalStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.data = {
            ...this.data,
            ...parsed,
            creator: APP_CREATOR,
            preferences: {
              ...this.data.preferences,
              ...(parsed.preferences || {})
            }
          };
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar store do localStorage:', e);
    }
  }

  save() {
    this.data.creator = APP_CREATOR;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('Falha ao salvar no localStorage:', e);
      }
    }

    if (typeof window !== 'undefined') {
      IndexedDBManager.saveAppState(this.data).catch(() => {});
    }

    this.notify();
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.data); } catch (e) { console.error('Erro em listener da store:', e); }
    });
  }

  // --------------------------------------------------------------------------
  // SHIFTS CRUD (PLANTÕES)
  // --------------------------------------------------------------------------
  saveShift(shift) {
    const id = shift.id || `shift_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const rawNet = parseFloat(shift.netValue ?? shift.net_value) || 0;
    const rawGross = parseFloat(shift.grossValue ?? shift.gross_value) || 0;
    const net = Math.round((rawNet > 0 ? rawNet : rawGross) * 100) / 100;
    const gross = Math.round((rawGross > 0 ? rawGross : net) * 100) / 100;
    const workedDate = shift.date || getLocalDateString();

    const installments = calculateShiftInstallments(net, workedDate);

    const shiftData = {
      id,
      user_id: shift.user_id || null,
      hospital: shift.hospital || 'Maternidade Araken',
      date: workedDate,
      shiftType: shift.shiftType || '12h Noturno',
      grossValue: gross,
      gross_value: gross,
      netValue: net,
      net_value: net,
      notes: shift.notes || '',
      installment1_date: shift.installment1_date || installments.installment1.date,
      installment1_value: shift.installment1_value || installments.installment1.value,
      installment2_date: shift.installment2_date || installments.installment2.date,
      installment2_value: shift.installment2_value || installments.installment2.value,
      installment1: {
        ...installments.installment1,
        ...(shift.installment1 || {})
      },
      installment2: {
        ...installments.installment2,
        ...(shift.installment2 || {})
      },
      status: shift.status || 'confirmed',
      sync_status: shift.sync_status || 'synced',
      createdAt: shift.createdAt || shift.created_at || new Date().toISOString()
    };

    const idx = this.data.shifts.findIndex(s => s.id === shiftData.id);
    if (idx >= 0) {
      this.data.shifts[idx] = shiftData;
    } else {
      this.data.shifts.push(shiftData);
    }

    if (shiftData.hospital && !this.data.hospitals.includes(shiftData.hospital)) {
      this.data.hospitals.push(shiftData.hospital);
    }

    this.save();
    return shiftData;
  }

  deleteShift(id) {
    this.data.shifts = this.data.shifts.filter(s => s.id !== id);
    this.save();
  }

  toggleShiftInstallment(shiftId, installmentNum) {
    const shift = this.data.shifts.find(s => s.id === shiftId);
    if (!shift) return null;

    const instKey = (installmentNum === 1) ? 'installment1' : 'installment2';
    const inst = shift[instKey];
    if (!inst) return null;

    if (inst.status === 'received') {
      inst.status = 'pending';
      inst.paidDate = null;
    } else {
      inst.status = 'received';
      inst.paidDate = getLocalDateString();
    }

    this.save();
    return shift;
  }

  // --------------------------------------------------------------------------
  // EXPENSES CRUD (DESPESAS)
  // --------------------------------------------------------------------------
  saveExpense(expense) {
    const isInst = Boolean(
      (expense.isInstallment || expense.total_installments > 1 || expense.totalInstallments > 1) &&
      (expense.totalInstallments > 1 || expense.total_installments > 1)
    );
    const totalInst = isInst ? parseInt(expense.totalInstallments || expense.total_installments, 10) : 1;

    if (isInst && totalInst > 1) {
      const generated = generateExpenseInstallments(expense, totalInst);
      generated.forEach(item => this.data.expenses.push(item));
    } else {
      const single = generateExpenseInstallments(expense, 1)[0];
      const idx = this.data.expenses.findIndex(e => e.id === single.id);
      if (idx >= 0) {
        this.data.expenses[idx] = single;
      } else {
        this.data.expenses.push(single);
      }
    }

    this.save();
  }

  deleteExpense(id) {
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
  }

  // --------------------------------------------------------------------------
  // CATEGORIES & CUSTOM CATEGORIES MANAGEMENT
  // --------------------------------------------------------------------------
  addCategory({ name, macroGroup = 'Pessoal, Lazer & Outros', icon = 'tag', color = '#EC407A' }) {
    if (!name || typeof name !== 'string' || !name.trim()) return null;
    const trimmedName = name.trim();

    if (!Array.isArray(this.data.customCategories)) {
      this.data.customCategories = [];
    }
    if (!Array.isArray(this.data.categories)) {
      this.data.categories = [...DEFAULT_CATEGORIES];
    }

    const existingCustom = this.data.customCategories.find(c => (c.name || '').toLowerCase() === trimmedName.toLowerCase());
    if (existingCustom) return existingCustom;

    const id = `cat_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCat = {
      id,
      name: trimmedName,
      macro_group: macroGroup,
      macroGroup: macroGroup,
      icon: icon || 'tag',
      color: color || '#EC407A',
      isCustom: true
    };

    this.data.customCategories.push(newCat);
    this.data.categories.push(newCat);

    const targetMacro = MACRO_GROUPS.find(m => m.name === macroGroup || m.id === macroGroup || (m.aliases && m.aliases.includes(macroGroup)));
    if (targetMacro && !targetMacro.categories.includes(trimmedName)) {
      targetMacro.categories.push(trimmedName);
    }

    this.save();
    return newCat;
  }

  deleteCustomCategory(categoryName) {
    if (!categoryName) return;
    const trimmed = categoryName.trim().toLowerCase();
    if (Array.isArray(this.data.customCategories)) {
      this.data.customCategories = this.data.customCategories.filter(c => (c.name || '').toLowerCase() !== trimmed);
    }
    if (Array.isArray(this.data.categories)) {
      this.data.categories = this.data.categories.filter(c => (c.name || '').toLowerCase() !== trimmed);
    }
    MACRO_GROUPS.forEach(m => {
      m.categories = m.categories.filter(c => c.toLowerCase() !== trimmed);
    });
    this.save();
  }

  getAllCategories() {
    const custom = Array.isArray(this.data.customCategories) ? this.data.customCategories : [];
    const defaults = Array.isArray(this.data.categories) ? this.data.categories : DEFAULT_CATEGORIES;
    const map = new Map();
    defaults.forEach(c => map.set(c.name.toLowerCase(), c));
    custom.forEach(c => map.set(c.name.toLowerCase(), c));
    return Array.from(map.values());
  }

  // --------------------------------------------------------------------------
  // PROFILE & RESIDENCY SALARY
  // --------------------------------------------------------------------------
  updateResidencySalary({ value, active = true, dayOfMonth = 5 }) {
    this.data.residencySalary = {
      value: parseFloat(value) || 0,
      active: Boolean(active),
      dayOfMonth: parseInt(dayOfMonth, 10) || 5
    };
    this.save();
  }

  updateDoctorProfile({ doctorName, crm, specialty, doctorPhoto, salaryValue }) {
    if (typeof doctorName === 'string') this.data.doctorName = doctorName;
    if (typeof crm === 'string') this.data.crm = crm;
    if (typeof specialty === 'string') this.data.specialty = specialty;
    if (doctorPhoto !== undefined) this.data.doctorPhoto = doctorPhoto;
    if (salaryValue !== undefined) {
      this.data.residencySalary.value = parseFloat(salaryValue) || 0;
    }
    this.save();
  }

  // --------------------------------------------------------------------------
  // FINANCIAL REPORTS & SUMMARY
  // --------------------------------------------------------------------------
  getMonthlySummary(yearOrMonthStr, monthNum, regime = 'caixa') {
    let monthStr = '';
    let selectedRegime = regime;

    if (typeof yearOrMonthStr === 'string' && yearOrMonthStr.includes('-')) {
      monthStr = yearOrMonthStr.slice(0, 7);
      if (typeof monthNum === 'string') {
        selectedRegime = monthNum;
      }
    } else {
      const y = parseInt(yearOrMonthStr, 10);
      const m = String(monthNum).padStart(2, '0');
      monthStr = `${y}-${m}`;
    }

    return this.getMonthSummary(monthStr, selectedRegime);
  }

  getMonthSummary(monthStr, regime = 'caixa') {
    const isCaixa = regime === 'caixa';
    let residencyIncome = 0;
    if (this.data.residencySalary.active) {
      residencyIncome = this.data.residencySalary.value;
    }

    let shiftIncome = 0;
    let shiftsInScope = 0;
    let shiftsReceivedValue = 0;
    let shiftsPendingValue = 0;

    if (isCaixa) {
      // Regime de Caixa: Installments whose expected date falls in the month
      this.data.shifts.forEach(s => {
        let countedInMonth = false;
        const d1 = s.installment1?.expectedDate || s.installment1_date;
        const v1 = s.installment1?.value ?? s.installment1_value ?? 0;
        if (d1 && d1.startsWith(monthStr)) {
          shiftIncome += v1;
          countedInMonth = true;
          if (s.installment1?.status === 'received') {
            shiftsReceivedValue += v1;
          } else {
            shiftsPendingValue += v1;
          }
        }

        const d2 = s.installment2?.expectedDate || s.installment2_date;
        const v2 = s.installment2?.value ?? s.installment2_value ?? 0;
        if (d2 && d2.startsWith(monthStr)) {
          shiftIncome += v2;
          countedInMonth = true;
          if (s.installment2?.status === 'received') {
            shiftsReceivedValue += v2;
          } else {
            shiftsPendingValue += v2;
          }
        }

        if (countedInMonth) shiftsInScope++;
      });
    } else {
      // Regime de Competência: Shifts worked in the month
      this.data.shifts.forEach(s => {
        if (s.date && s.date.startsWith(monthStr)) {
          const net = s.netValue ?? s.net_value ?? 0;
          shiftIncome += net;
          shiftsInScope++;
          const paidTotal = (s.installment1?.status === 'received' ? (s.installment1.value ?? 0) : 0) +
                            (s.installment2?.status === 'received' ? (s.installment2.value ?? 0) : 0);
          shiftsReceivedValue += paidTotal;
          shiftsPendingValue += Math.max(0, net - paidTotal);
        }
      });
    }

    const totalIncome = Math.round((residencyIncome + shiftIncome) * 100) / 100;

    // Expenses in month
    const monthExpenses = this.data.expenses.filter(e => e.date && e.date.startsWith(monthStr));
    const totalExpenses = Math.round(monthExpenses.reduce((sum, e) => sum + (e.amount ?? e.value ?? 0), 0) * 100) / 100;
    const balance = Math.round((totalIncome - totalExpenses) * 100) / 100;

    // Category breakdown (Object.create(null) prevents prototype property collision)
    const categoryMap = Object.create(null);
    monthExpenses.forEach(e => {
      const cat = e.category || 'Outros';
      categoryMap[cat] = (categoryMap[cat] || 0) + (e.amount ?? e.value ?? 0);
    });

    const categoryBreakdown = Object.keys(categoryMap).map(catName => {
      const val = Math.round(categoryMap[catName] * 100) / 100;
      const catDef = this.data.categories.find(c => c.name === catName) || { icon: 'tag', color: '#AB47BC' };
      return {
        category: catName,
        value: val,
        percentage: totalExpenses > 0 ? (val / totalExpenses) * 100 : 0,
        icon: catDef.icon,
        color: catDef.color
      };
    }).sort((a, b) => b.value - a.value);

    // Macro-Group breakdown (Object.create(null) prevents prototype property collision)
    const macroMap = Object.create(null);
    MACRO_GROUPS.forEach(g => {
      macroMap[g.id] = {
        id: g.id,
        name: g.name,
        icon: g.icon,
        color: g.color,
        bgColor: g.bgColor,
        value: 0,
        count: 0
      };
    });

    monthExpenses.forEach(e => {
      const mg = getMacroGroupForCategory(e.category, this.data.customCategories);
      if (macroMap[mg.id]) {
        macroMap[mg.id].value += (e.amount ?? e.value ?? 0);
        macroMap[mg.id].count += 1;
      }
    });

    const macroBreakdown = Object.values(macroMap)
      .filter(m => m.value > 0)
      .map(m => ({
        ...m,
        value: Math.round(m.value * 100) / 100,
        percentage: totalExpenses > 0 ? (m.value / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    // Production worked this month
    let workedThisMonthTotal = 0;
    this.data.shifts.forEach(s => {
      if (s.date && s.date.startsWith(monthStr)) {
        workedThisMonthTotal += (s.netValue ?? s.net_value ?? 0);
      }
    });

    return {
      month: monthStr,
      regime,
      residencyIncome,
      shiftIncome,
      totalIncome,
      totalExpenses,
      balance,
      shiftsCount: shiftsInScope,
      shiftsReceivedValue,
      shiftsPendingValue,
      expensesCount: monthExpenses.length,
      categoryBreakdown,
      macroBreakdown,
      workedThisMonthTotal
    };
  }

  getForecast6Months(startMonthStr) {
    const baseMonth = startMonthStr || getLocalDateString().slice(0, 7);
    const result = [];
    for (let i = 0; i < 6; i++) {
      const m = addMonthsToDateString(`${baseMonth}-01`, i).slice(0, 7);
      const summ = this.getMonthSummary(m, 'caixa');
      result.push({
        month: m,
        label: formatMonthYear(m).split(' de ')[0],
        income: summ.totalIncome,
        expenses: summ.totalExpenses,
        balance: summ.balance
      });
    }
    return result;
  }

  // --------------------------------------------------------------------------
  // RESET DATA & BACKUP
  // --------------------------------------------------------------------------
  resetData(mode = 'transactions_only') {
    if (mode === 'transactions_only') {
      this.data.shifts = [];
      this.data.expenses = [];
    } else if (mode === 'full_factory') {
      this.data = this.getDefaultState();
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      IndexedDBManager.clearAppState().catch(() => {});
    }
    this.save();
    return true;
  }

  exportBackupJsonString() {
    const payload = {
      ...this.data,
      creator: APP_CREATOR,
      version: APP_VERSION,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(payload, null, 2);
  }

  importBackupFromFile(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Arquivo JSON inválido' };
      }

      this.data = {
        ...this.getDefaultState(),
        ...parsed,
        creator: APP_CREATOR,
        version: APP_VERSION,
        shifts: Array.isArray(parsed.shifts) ? parsed.shifts : [],
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        hospitals: Array.isArray(parsed.hospitals) && parsed.hospitals.length > 0 ? parsed.hospitals : [...DEFAULT_HOSPITALS],
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : [...DEFAULT_CATEGORIES]
      };

      this.save();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

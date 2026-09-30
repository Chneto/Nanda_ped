/**
 * Finanças Pediatria v4.0 - Core Storage & Financial Engine
 * Design System & Arquitetura "Silk & Rose Gold"
 * Persistência Tripla para iOS Safari (IndexedDB + LocalStorage + Storage Persistence API)
 * Regras Pediátricas Canônicas: Bolsa Residência + Plantões Sala de Parto (75% D+60 / 25% D+90)
 * Categorização Inteligente em 6 Macro-Grupos de Despesas (Nubank/Revolut-inspired)
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */

export const APP_CREATOR = 'FChNeto';
export const APP_VERSION = '4.0.0';
export const STORAGE_KEY = 'financas_pediatria_v4';
export const DB_NAME = 'v4_pediatric_db';
export const DB_STORE = 'app_state';

// 23 Categorias Canônicas Pediátricas (incluindo as 22 obrigatórias)
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
  { id: 'cat_cosmeticos', name: 'Cosméticos', icon: 'cosmetics', color: '#F06292' },
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

// 6 Macro-Grupos Inteligentes para Finanças Médicas
export const MACRO_GROUPS = [
  {
    id: 'macro_alimentacao',
    name: 'Alimentação',
    icon: 'meal',
    color: '#FF7043',
    bgColor: '#FBE9E7',
    categories: ['Mercantil', 'Refeição', 'Lanches', 'Delivery']
  },
  {
    id: 'macro_transporte',
    name: 'Transporte & Mobilidade',
    icon: 'car',
    color: '#42A5F5',
    bgColor: '#E3F2FD',
    categories: ['Combustível', 'Uber', 'Passagens']
  },
  {
    id: 'macro_moradia',
    name: 'Moradia & Contas',
    icon: 'home',
    color: '#26A69A',
    bgColor: '#E0F2F1',
    categories: ['Aluguel', 'Energia', 'Água', 'Internet']
  },
  {
    id: 'macro_formacao',
    name: 'Formação & Carreira',
    icon: 'qualification',
    color: '#7E57C2',
    bgColor: '#EDE7F6',
    categories: ['Estudo', 'Cursos', 'Qualificação/Congresso/Pós']
  },
  {
    id: 'macro_saude_beleza',
    name: 'Saúde & Autocuidado',
    icon: 'sparkles',
    color: '#EC407A',
    bgColor: '#FCE4EC',
    categories: ['Remédios', 'Academia', 'Cosméticos', 'Beleza/Salão', 'Produtos de beleza']
  },
  {
    id: 'macro_lazer_outros',
    name: 'Pessoal, Lazer & Outros',
    icon: 'gift',
    color: '#AB47BC',
    bgColor: '#F3E5F5',
    categories: ['Presentes', 'Saídas', 'Compras Parceladas', 'Doação']
  }
];

export const DEFAULT_HOSPITALS = [
  'Maternidade Araken',
  'Maternidade Leide Morais',
  'MEJEC',
  'Hospital da Criança',
  'Hospital Mater Dei',
  'Hospital Promater'
];

/**
 * Retorna o Macro-Grupo correspondente a uma categoria
 */
export function getMacroGroupForCategory(categoryName) {
  if (!categoryName) return MACRO_GROUPS[5];
  for (const group of MACRO_GROUPS) {
    if (group.categories.some(c => c.toLowerCase() === categoryName.trim().toLowerCase())) {
      return group;
    }
  }
  return MACRO_GROUPS[5]; // Pessoal, Lazer & Outros como fallback
}

/**
 * Utilitário de manipulação de datas no fuso horário local
 */
export function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adiciona meses preservando limites de mês (ex: 31 de agosto + 2 meses = 31 de outubro)
 */
export function addMonthsToDateString(dateStr, monthsToAdd) {
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

/**
 * IndexedDB Driver nativo para iOS / Safari PWA v4
 */
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      return false;
    }
  }
};

/**
 * PediatricStore v4.0 - Gerenciador de Estado e Regras de Negócio
 */
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
      shifts: [],
      expenses: [],
      preferences: {
        theme: 'light',
        regime: 'caixa',
        activeMonth: getLocalDateString().slice(0, 7),
        chartViewMode: 'macro' // 'macro' | 'detailed'
      }
    };
  }

  async initPersistence() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        await navigator.storage.persist();
      } catch (err) {
        // silencioso
      }
    }

    // 1. Carrega do localStorage síncrono
    this.loadFromLocalStorage();

    // 2. Carrega do IndexedDB assíncrono (resiliente a limpezas do Safari)
    if (typeof window !== 'undefined') {
      try {
        const idbData = await IndexedDBManager.getAppState();
        if (idbData && idbData.version) {
          // Mescla com segurança
          this.data = { ...this.data, ...idbData };
          this.notify();
        }
      } catch (err) {
        // Usa localStorage como fallback seguro
      }
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
            creator: APP_CREATOR, // Imutável
            preferences: {
              ...this.data.preferences,
              ...(parsed.preferences || {})
            }
          };
        }
      }
    } catch (e) {
      console.warn('Erro ao ler localStorage v4:', e);
    }
  }

  save() {
    // 1. LocalStorage síncrono
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('Falha ao gravar localStorage v4:', e);
      }
    }

    // 2. IndexedDB assíncrono
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
      try {
        fn(this.data);
      } catch (e) {
        console.error('Erro no listener da store:', e);
      }
    });
  }

  // -------------------------------------------------------------
  // OPERAÇÕES DE PLANTÕES (75% D+60 / 25% D+90)
  // -------------------------------------------------------------
  saveShift(shift) {
    if (!shift.id) {
      shift.id = 'shift_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }

    const net = parseFloat(shift.netValue) || 0;
    const gross = parseFloat(shift.grossValue) || net;

    // Divisão com precisão de centavos: 75% D+60 e 25% D+90
    const val75 = Math.round(net * 0.75 * 100) / 100;
    const val25 = Math.round((net - val75) * 100) / 100;

    const workedDate = shift.date || getLocalDateString();
    const expectedD60 = addMonthsToDateString(workedDate, 2);
    const expectedD90 = addMonthsToDateString(workedDate, 3);

    const shiftData = {
      id: shift.id,
      hospital: shift.hospital || 'Maternidade Araken',
      date: workedDate,
      shiftType: shift.shiftType || '12h Noturno',
      grossValue: gross,
      netValue: net,
      notes: shift.notes || '',
      installment1: {
        percentage: 75,
        value: val75,
        expectedDate: shift.installment1?.expectedDate || expectedD60,
        status: shift.installment1?.status || 'pending',
        paidDate: shift.installment1?.paidDate || null
      },
      installment2: {
        percentage: 25,
        value: val25,
        expectedDate: shift.installment2?.expectedDate || expectedD90,
        status: shift.installment2?.status || 'pending',
        paidDate: shift.installment2?.paidDate || null
      },
      createdAt: shift.createdAt || new Date().toISOString()
    };

    const idx = this.data.shifts.findIndex(s => s.id === shiftData.id);
    if (idx >= 0) {
      this.data.shifts[idx] = shiftData;
    } else {
      this.data.shifts.push(shiftData);
    }

    // Registra o hospital se for novo
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

    const instKey = installmentNum === 1 ? 'installment1' : 'installment2';
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

  // -------------------------------------------------------------
  // OPERAÇÕES DE DESPESAS COM PARCELAMENTO
  // -------------------------------------------------------------
  saveExpense(expense) {
    const isInst = Boolean(expense.isInstallment && expense.totalInstallments > 1);
    const totalInst = isInst ? parseInt(expense.totalInstallments, 10) : 1;
    const totalVal = parseFloat(expense.value) || 0;
    const baseDate = expense.date || getLocalDateString();

    const parentGroupId = 'exp_group_' + Date.now();

    if (isInst && totalInst > 1) {
      const partVal = Math.floor((totalVal / totalInst) * 100) / 100;
      const firstPartVal = Math.round((totalVal - (partVal * (totalInst - 1))) * 100) / 100;

      for (let i = 1; i <= totalInst; i++) {
        const instVal = i === 1 ? firstPartVal : partVal;
        const instDate = addMonthsToDateString(baseDate, i - 1);

        const expItem = {
          id: `exp_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          groupId: parentGroupId,
          category: expense.category || 'Outros',
          description: `${expense.description} (${i}/${totalInst})`,
          value: instVal,
          date: instDate,
          isInstallment: true,
          installmentNumber: i,
          totalInstallments: totalInst,
          createdAt: new Date().toISOString()
        };
        this.data.expenses.push(expItem);
      }
    } else {
      const singleExp = {
        id: expense.id || 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        category: expense.category || 'Outros',
        description: expense.description || 'Despesa',
        value: totalVal,
        date: baseDate,
        isInstallment: false,
        createdAt: expense.createdAt || new Date().toISOString()
      };

      const idx = this.data.expenses.findIndex(e => e.id === singleExp.id);
      if (idx >= 0) {
        this.data.expenses[idx] = singleExp;
      } else {
        this.data.expenses.push(singleExp);
      }
    }

    this.save();
  }

  deleteExpense(id) {
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
  }

  // -------------------------------------------------------------
  // BOLSA RESIDÊNCIA E PERFIL MÉDICO
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // ZERAR DADOS (FORMATAR) COM SEGURANÇA EM 2 ETAPAS
  // -------------------------------------------------------------
  /**
   * Executa a formatação dos dados.
   * @param {'transactions_only' | 'full_factory'} mode
   */
  resetData(mode = 'transactions_only') {
    if (mode === 'transactions_only') {
      this.data.shifts = [];
      this.data.expenses = [];
    } else if (mode === 'full_factory') {
      const pristine = this.getDefaultState();
      this.data = pristine;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      IndexedDBManager.clearAppState().catch(() => {});
    }
    this.save();
    return true;
  }

  // -------------------------------------------------------------
  // RELATÓRIOS FINANCEIROS E MACRO-GRUPOS
  // -------------------------------------------------------------
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
      // Regime de Caixa: Parcelas cujo expectedDate coincide com o mês
      this.data.shifts.forEach(s => {
        let countedInMonth = false;
        if (s.installment1 && s.installment1.expectedDate.startsWith(monthStr)) {
          shiftIncome += s.installment1.value;
          countedInMonth = true;
          if (s.installment1.status === 'received') {
            shiftsReceivedValue += s.installment1.value;
          } else {
            shiftsPendingValue += s.installment1.value;
          }
        }
        if (s.installment2 && s.installment2.expectedDate.startsWith(monthStr)) {
          shiftIncome += s.installment2.value;
          countedInMonth = true;
          if (s.installment2.status === 'received') {
            shiftsReceivedValue += s.installment2.value;
          } else {
            shiftsPendingValue += s.installment2.value;
          }
        }
        if (countedInMonth) {
          shiftsInScope++;
        }
      });
    } else {
      // Regime de Competência: Plantões trabalhados no mês
      this.data.shifts.forEach(s => {
        if (s.date.startsWith(monthStr)) {
          shiftIncome += s.netValue;
          shiftsInScope++;
          const paidTotal = (s.installment1?.status === 'received' ? s.installment1.value : 0) +
                            (s.installment2?.status === 'received' ? s.installment2.value : 0);
          shiftsReceivedValue += paidTotal;
          shiftsPendingValue += (s.netValue - paidTotal);
        }
      });
    }

    const totalIncome = residencyIncome + shiftIncome;

    // Despesas do mês
    const monthExpenses = this.data.expenses.filter(e => e.date.startsWith(monthStr));
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.value, 0);
    const balance = totalIncome - totalExpenses;

    // Breakdown por Categoria Específica
    const categoryMap = {};
    monthExpenses.forEach(e => {
      const cat = e.category || 'Outros';
      categoryMap[cat] = (categoryMap[cat] || 0) + e.value;
    });

    const categoryBreakdown = Object.keys(categoryMap).map(catName => {
      const val = categoryMap[catName];
      const catDef = this.data.categories.find(c => c.name === catName) || {
        icon: 'tag',
        color: '#AB47BC'
      };
      return {
        category: catName,
        value: val,
        percentage: totalExpenses > 0 ? (val / totalExpenses) * 100 : 0,
        icon: catDef.icon,
        color: catDef.color
      };
    }).sort((a, b) => b.value - a.value);

    // Breakdown por 6 Macro-Grupos
    const macroMap = {};
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
      const mg = getMacroGroupForCategory(e.category);
      if (macroMap[mg.id]) {
        macroMap[mg.id].value += e.value;
        macroMap[mg.id].count += 1;
      }
    });

    const macroBreakdown = Object.values(macroMap)
      .filter(m => m.value > 0)
      .map(m => ({
        ...m,
        percentage: totalExpenses > 0 ? (m.value / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    // Comparativo Caixa Real vs Produção Represada
    // Produção do mês trabalhada aguardando D+60 e D+90
    let workedThisMonthTotal = 0;
    this.data.shifts.forEach(s => {
      if (s.date.startsWith(monthStr)) {
        workedThisMonthTotal += s.netValue;
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
    const result = [];
    for (let i = 0; i < 6; i++) {
      const m = addMonthsToDateString(`${startMonthStr}-01`, i).slice(0, 7);
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

  // -------------------------------------------------------------
  // BACKUP E RESTAURAÇÃO
  // -------------------------------------------------------------
  exportBackupJsonString() {
    const payload = {
      ...this.data,
      exportedAt: new Date().toISOString(),
      creator: APP_CREATOR,
      version: APP_VERSION
    };
    return JSON.stringify(payload, null, 2);
  }

  async exportBackupToFile(filenamePrefix = 'financas_pediatria_v4_backup') {
    const jsonStr = this.exportBackupJsonString();
    const dateStr = getLocalDateString();
    const fileName = `${filenamePrefix}_${dateStr}.json`;

    // No iOS Safari moderno, tenta a Web Share API se suportar arquivos
    if (typeof navigator !== 'undefined' && navigator.canShare && typeof File !== 'undefined') {
      try {
        const file = new File([jsonStr], fileName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Finanças Pediatria - Cópia de Segurança',
            text: 'Backup completo do aplicativo Finanças Pediatria Dra. Fernanda Ch.'
          });
          return { success: true, method: 'share' };
        }
      } catch (err) {
        // Fallback para download clássico
      }
    }

    // Fallback de download universal em Blob
    if (typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 300);
      return { success: true, method: 'download' };
    }

    return { success: false, error: 'Ambiente não suporta download' };
  }

  importBackupFromFile(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Arquivo inválido' };
      }

      this.data = {
        ...this.getDefaultState(),
        ...parsed,
        creator: APP_CREATOR, // Imutável
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

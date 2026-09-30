/**
 * Finanças Pediatria v5.0 - Core Financial Engine & Store
 * Design System "Silk & Rose Gold"
 * Persistência Tripla para iOS Safari (IndexedDB + LocalStorage + Storage Persistence API)
 * Regras Canônicas Pediátricas: Residência Médica + Plantões Sala de Parto (75% D+60 / 25% D+90)
 * 6 Macro-Grupos Inteligentes de Despesas (com as 22 categorias canônicas)
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */

export const APP_CREATOR = 'FChNeto';
export const APP_VERSION = '5.0.0';
export const STORAGE_KEY = 'financas_pediatria_v5';
export const DB_NAME = 'v5_pediatric_db';
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
  return MACRO_GROUPS[5];
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
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export class PediatricStore {
  constructor() {
    this.listeners = [];
    this.db = null;
    this.data = this.getDefaultState();
    this.init();
  }

  getDefaultState() {
    return {
      creator: APP_CREATOR,
      version: APP_VERSION,
      doctorName: 'Dra. Fernanda Ch.',
      doctorCRM: 'CRM/RN',
      doctorSpecialty: 'Pediatria & Sala de Parto',
      doctorPhoto: null,
      residencySalary: {
        value: 4106.00,
        dayOfMonth: 5,
        active: true
      },
      shifts: [],
      expenses: [],
      categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
      hospitals: [...DEFAULT_HOSPITALS],
      preferences: {
        theme: 'light',
        regime: 'caixa', // 'caixa' | 'competencia'
        currentMonth: getLocalDateString().substring(0, 7)
      }
    };
  }

  init() {
    this.loadFromLocalStorage();
    this.initIndexedDB();
    this.requestPersistentStorage();
  }

  loadFromLocalStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      
      // Tenta chave v5
      let raw = localStorage.getItem(STORAGE_KEY);
      
      // Fallback para migração automática v4 / v2
      if (!raw) {
        raw = localStorage.getItem('financas_pediatria_v4') || localStorage.getItem('financas_pediatria_v2');
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.getDefaultState(),
          ...parsed,
          creator: APP_CREATOR,
          version: APP_VERSION,
          residencySalary: {
            ...this.getDefaultState().residencySalary,
            ...(parsed.residencySalary || {})
          },
          preferences: {
            ...this.getDefaultState().preferences,
            ...(parsed.preferences || {})
          }
        };

        // Garante que todas as categorias canônicas estão presentes
        const currentCatNames = (this.data.categories || []).map(c => c.name);
        DEFAULT_CATEGORIES.forEach(defCat => {
          if (!currentCatNames.includes(defCat.name)) {
            this.data.categories.push({ ...defCat });
          }
        });
      }
    } catch (e) {
      console.warn('Erro ao carregar do localStorage:', e);
    }
  }

  async initIndexedDB() {
    if (typeof indexedDB === 'undefined') return;
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.loadFromIndexedDB();
      };
      request.onerror = (e) => {
        console.warn('IndexedDB erro ao abrir:', e);
      };
    } catch (err) {
      console.warn('IndexedDB não suportado no contexto:', err);
    }
  }

  loadFromIndexedDB() {
    if (!this.db) return;
    try {
      const tx = this.db.transaction([DB_STORE], 'readonly');
      const store = tx.objectStore(DB_STORE);
      const req = store.get('root_state');
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          // Se localStorage estiver vazio, recupera do IndexedDB
          if (!this.data.shifts.length && !this.data.expenses.length && req.result.data.shifts) {
            this.data = { ...this.getDefaultState(), ...req.result.data };
            this.saveToLocalStorage();
            this.notify();
          }
        }
      };
    } catch (e) {
      console.warn('Erro ao ler do IndexedDB:', e);
    }
  }

  async requestPersistentStorage() {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        if (isPersisted) {
          console.log('Persistência tripla de armazenamento iOS ativada.');
        }
      }
    } catch (e) {
      // Silencioso em ambientes restritos
    }
  }

  save() {
    this.saveToLocalStorage();
    this.saveToIndexedDB();
    this.notify();
  }

  saveToLocalStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Erro ao gravar no localStorage:', e);
    }
  }

  saveToIndexedDB() {
    if (!this.db) return;
    try {
      const tx = this.db.transaction([DB_STORE], 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.put({ id: 'root_state', data: this.data, updatedAt: Date.now() });
    } catch (e) {
      console.warn('Erro ao gravar no IndexedDB:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.data); } catch (e) { console.error(e); }
    });
  }

  /**
   * Salva um Plantão Médico com regra canônica de Sala de Parto (75% D+60 / 25% D+90)
   */
  saveShift(shift) {
    const shiftDate = shift.date || getLocalDateString();
    const netValue = parseFloat(shift.value) || 0;
    const hospital = (shift.hospital || 'Maternidade Araken').trim();
    const shiftType = shift.shiftType || 'Sala de Parto';

    const val75 = Math.round(netValue * 0.75 * 100) / 100;
    const val25 = Math.round((netValue - val75) * 100) / 100;

    const targetMonthD60 = addMonthsToDateString(shiftDate, 2).substring(0, 7);
    const targetMonthD90 = addMonthsToDateString(shiftDate, 3).substring(0, 7);

    const newShift = {
      id: shift.id || generateId('shift'),
      hospital,
      date: shiftDate,
      shiftType,
      totalNetValue: netValue,
      notes: shift.notes || '',
      installments: [
        {
          num: 1,
          percentage: 75,
          value: val75,
          targetMonth: targetMonthD60,
          status: 'pending' // 'pending' | 'received'
        },
        {
          num: 2,
          percentage: 25,
          value: val25,
          targetMonth: targetMonthD90,
          status: 'pending'
        }
      ],
      createdAt: Date.now()
    };

    if (shift.id) {
      const idx = this.data.shifts.findIndex(s => s.id === shift.id);
      if (idx !== -1) {
        this.data.shifts[idx] = newShift;
      } else {
        this.data.shifts.unshift(newShift);
      }
    } else {
      this.data.shifts.unshift(newShift);
    }

    if (!this.data.hospitals.includes(hospital)) {
      this.data.hospitals.push(hospital);
    }

    this.save();
    return newShift;
  }

  toggleShiftInstallment(shiftId, installmentNum) {
    const shift = this.data.shifts.find(s => s.id === shiftId);
    if (!shift) return;
    const inst = shift.installments.find(i => i.num === installmentNum);
    if (!inst) return;

    inst.status = inst.status === 'received' ? 'pending' : 'received';
    this.save();
  }

  deleteShift(shiftId) {
    this.data.shifts = this.data.shifts.filter(s => s.id !== shiftId);
    this.save();
  }

  /**
   * Salva uma Despesa (à vista ou compra parcelada no tempo)
   */
  saveExpense(expense) {
    const totalVal = parseFloat(expense.value) || 0;
    const baseDate = expense.date || getLocalDateString();
    const isInstallment = !!expense.isInstallment && parseInt(expense.totalInstallments, 10) > 1;
    const totalInst = isInstallment ? parseInt(expense.totalInstallments, 10) : 1;
    const desc = (expense.description || 'Despesa').trim();
    const cat = expense.category || 'Mercantil';
    const mg = getMacroGroupForCategory(cat);

    if (!isInstallment) {
      const newExp = {
        id: expense.id || generateId('exp'),
        description: desc,
        category: cat,
        macroGroupId: mg.id,
        value: totalVal,
        date: baseDate,
        isInstallment: false,
        installmentIndex: 1,
        totalInstallments: 1,
        createdAt: Date.now()
      };

      if (expense.id) {
        const idx = this.data.expenses.findIndex(e => e.id === expense.id);
        if (idx !== -1) {
          this.data.expenses[idx] = newExp;
        } else {
          this.data.expenses.unshift(newExp);
        }
      } else {
        this.data.expenses.unshift(newExp);
      }
    } else {
      const groupId = generateId('exp_group');
      const baseInstVal = Math.floor((totalVal / totalInst) * 100) / 100;
      const firstInstVal = Math.round((totalVal - (baseInstVal * (totalInst - 1))) * 100) / 100;

      for (let i = 1; i <= totalInst; i++) {
        const instVal = i === 1 ? firstInstVal : baseInstVal;
        const instDate = addMonthsToDateString(baseDate, i - 1);

        this.data.expenses.unshift({
          id: generateId('exp'),
          groupId,
          description: `${desc} (${i}/${totalInst})`,
          rawDescription: desc,
          category: cat,
          macroGroupId: mg.id,
          value: instVal,
          date: instDate,
          isInstallment: true,
          installmentIndex: i,
          totalInstallments: totalInst,
          createdAt: Date.now()
        });
      }
    }

    this.save();
  }

  deleteExpense(expenseId) {
    const exp = this.data.expenses.find(e => e.id === expenseId);
    if (exp && exp.groupId) {
      this.data.expenses = this.data.expenses.filter(e => e.groupId !== exp.groupId);
    } else {
      this.data.expenses = this.data.expenses.filter(e => e.id !== expenseId);
    }
    this.save();
  }

  updateResidencySalary(salaryData) {
    this.data.residencySalary = {
      value: parseFloat(salaryData.value) || 0,
      dayOfMonth: parseInt(salaryData.dayOfMonth, 10) || 5,
      active: salaryData.active !== false
    };
    this.save();
  }

  updateDoctorProfile(profile) {
    if (profile.name) this.data.doctorName = profile.name.trim();
    if (profile.crm) this.data.doctorCRM = profile.crm.trim();
    if (profile.specialty) this.data.doctorSpecialty = profile.specialty.trim();
    if (typeof profile.photo !== 'undefined') this.data.doctorPhoto = profile.photo;
    this.save();
  }

  /**
   * Resumo Mensal Completo: Regime de Caixa vs Regime de Competência
   */
  getMonthlySummary(yearMonthStr) {
    const ym = yearMonthStr || this.data.preferences.currentMonth || getLocalDateString().substring(0, 7);

    // 1. Despesas do Mês
    const monthExpenses = this.data.expenses.filter(e => e.date && e.date.startsWith(ym));
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.value, 0);

    // 2. Bolsa Residência
    const salaryVal = this.data.residencySalary.active ? this.data.residencySalary.value : 0;

    // 3. Regime de Caixa (Entradas que vencem neste mês: Bolsa + Parcelas D+60 e D+90)
    let shiftInflowExpected = 0;
    let shiftInflowReceived = 0;
    let shiftInflowPending = 0;

    this.data.shifts.forEach(shift => {
      shift.installments.forEach(inst => {
        if (inst.targetMonth === ym) {
          shiftInflowExpected += inst.value;
          if (inst.status === 'received') {
            shiftInflowReceived += inst.value;
          } else {
            shiftInflowPending += inst.value;
          }
        }
      });
    });

    const totalCashInflow = salaryVal + shiftInflowExpected;
    const netCashBalance = totalCashInflow - totalExpenses;
    const realizedCashInflow = salaryVal + shiftInflowReceived;
    const realizedCashBalance = realizedCashInflow - totalExpenses;

    // 4. Regime de Competência (Produção médica trabalhada no mês)
    const monthWorkedShifts = this.data.shifts.filter(s => s.date && s.date.startsWith(ym));
    const totalWorkedProduction = monthWorkedShifts.reduce((sum, s) => sum + s.totalNetValue, 0);
    const totalAccrualIncome = salaryVal + totalWorkedProduction;
    const netAccrualBalance = totalAccrualIncome - totalExpenses;

    return {
      yearMonth: ym,
      // Caixa
      salaryVal,
      shiftInflowExpected,
      shiftInflowReceived,
      shiftInflowPending,
      totalCashInflow,
      totalExpenses,
      netCashBalance,
      realizedCashInflow,
      realizedCashBalance,
      // Competência
      totalWorkedProduction,
      workedShiftsCount: monthWorkedShifts.length,
      totalAccrualIncome,
      netAccrualBalance,
      // Despesas
      expensesList: monthExpenses
    };
  }

  /**
   * Resumo por Macro-Grupos
   */
  getMacroGroupSummary(yearMonthStr) {
    const ym = yearMonthStr || this.data.preferences.currentMonth || getLocalDateString().substring(0, 7);
    const monthExpenses = this.data.expenses.filter(e => e.date && e.date.startsWith(ym));
    const totalExp = monthExpenses.reduce((sum, e) => sum + e.value, 0);

    return MACRO_GROUPS.map(group => {
      const groupExp = monthExpenses.filter(e => {
        if (e.macroGroupId) return e.macroGroupId === group.id;
        const cat = e.category || '';
        return group.categories.some(c => c.toLowerCase() === cat.toLowerCase());
      });
      const val = groupExp.reduce((sum, e) => sum + e.value, 0);
      const pct = totalExp > 0 ? (val / totalExp) * 100 : 0;

      return {
        ...group,
        totalValue: val,
        percentage: pct,
        count: groupExp.length,
        items: groupExp
      };
    });
  }

  /**
   * Resumo por Categorias Individuais
   */
  getCategorySummary(yearMonthStr) {
    const ym = yearMonthStr || this.data.preferences.currentMonth || getLocalDateString().substring(0, 7);
    const monthExpenses = this.data.expenses.filter(e => e.date && e.date.startsWith(ym));
    const totalExp = monthExpenses.reduce((sum, e) => sum + e.value, 0);

    const catMap = {};
    monthExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.value;
    });

    return Object.entries(catMap)
      .map(([name, val]) => {
        const catDef = this.data.categories.find(c => c.name === name) || { icon: 'tag', color: '#EC407A' };
        return {
          name,
          value: val,
          percentage: totalExp > 0 ? (val / totalExp) * 100 : 0,
          icon: catDef.icon,
          color: catDef.color
        };
      })
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Previsão de Fluxo de Caixa para 6 Meses
   */
  get6MonthForecast(startYearMonthStr) {
    const startYm = startYearMonthStr || getLocalDateString().substring(0, 7);
    const startDate = `${startYm}-01`;
    const forecast = [];

    for (let i = 0; i < 6; i++) {
      const ym = addMonthsToDateString(startDate, i).substring(0, 7);
      const summary = this.getMonthlySummary(ym);
      forecast.push({
        yearMonth: ym,
        monthLabel: this.formatMonthLabel(ym),
        inflow: summary.totalCashInflow,
        expenses: summary.totalExpenses,
        netBalance: summary.netCashBalance,
        salaryVal: summary.salaryVal,
        shiftInflow: summary.shiftInflowExpected
      });
    }

    return forecast;
  }

  formatMonthLabel(yearMonthStr) {
    const [year, month] = yearMonthStr.split('-');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const idx = parseInt(month, 10) - 1;
    return `${monthNames[idx]}/${year.substring(2)}`;
  }

  exportBackup() {
    const payload = {
      exportDate: new Date().toISOString(),
      creator: APP_CREATOR,
      version: APP_VERSION,
      data: this.data
    };
    return JSON.stringify(payload, null, 2);
  }

  importBackupFromFile(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      const dataToRestore = parsed.data || parsed;
      if (!dataToRestore || typeof dataToRestore !== 'object') {
        throw new Error('Formato JSON inválido.');
      }

      this.data = {
        ...this.getDefaultState(),
        ...dataToRestore,
        creator: APP_CREATOR,
        version: APP_VERSION
      };

      this.save();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Zerar dados em 2 etapas com backup automático de segurança
   */
  resetAllData(options = { keepProfile: true, downloadBackup: true }) {
    if (options.downloadBackup) {
      this.triggerDirectBackupDownload();
    }

    const savedDoctorName = this.data.doctorName;
    const savedCRM = this.data.doctorCRM;
    const savedSpecialty = this.data.doctorSpecialty;
    const savedPhoto = this.data.doctorPhoto;

    this.data = this.getDefaultState();

    if (options.keepProfile) {
      this.data.doctorName = savedDoctorName;
      this.data.doctorCRM = savedCRM;
      this.data.doctorSpecialty = savedSpecialty;
      this.data.doctorPhoto = savedPhoto;
    }

    this.save();
  }

  triggerDirectBackupDownload() {
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;
      const json = this.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_seguranca_pediatria_${getLocalDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Backup download prevented:', e);
    }
  }
}

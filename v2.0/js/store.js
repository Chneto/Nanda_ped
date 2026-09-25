/**
 * Finanças Pediatria v2.0 - Core Storage & Financial Engine
 * Arquitetura de Persistência Tripla para iOS (IndexedDB + LocalStorage + Storage Persistence API)
 * Regras Pediátricas: Salário Residência + Plantões Sala de Parto (75% D+60 / 25% D+90)
 * Criado por: FChNeto (APP_CREATOR)
 */

export const APP_CREATOR = 'FChNeto';
export const APP_VERSION = '2.0.0';
export const STORAGE_KEY = 'financas_pediatria_v2';
export const DB_NAME = 'v2_pediatric_db';
export const DB_STORE = 'app_state';

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

export const DEFAULT_HOSPITALS = [
  'Maternidade Araken',
  'Maternidade Leide Morais',
  'MEJEC',
  'Hospital da Criança',
  'Hospital Mater Dei',
  'Hospital Promater'
];

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
 * IndexedDB Driver nativo para iOS / Safari PWA
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
          db.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
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
      return null;
    }
  }
};

/**
 * Estado Inicial Padrão
 */
export function getInitialData() {
  const today = getLocalDateString();
  const currentMonth = today.slice(0, 7);

  return {
    version: APP_VERSION,
    creator: APP_CREATOR,
    doctorName: 'Dra. Fernanda Ch.',
    residencySalary: {
      value: 4106.09,
      dayOfMonth: 5,
      description: 'Bolsa Residência Médica (Pediatria)',
      active: true
    },
    shifts: [],
    expenses: [],
    categories: [...DEFAULT_CATEGORIES],
    hospitals: [...DEFAULT_HOSPITALS],
    preferences: {
      regime: 'caixa',
      theme: 'light',
      activeMonth: currentMonth
    },
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Store Principal Reativa de Finanças Pediatria
 */
export class PediatricStore {
  constructor() {
    this.data = this.loadSync();
    this.listeners = new Set();
    this.initAsyncPersistence();
  }

  /**
   * Carga síncrona inicial do LocalStorage para render imediato (sem lag)
   */
  loadSync() {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return this.sanitizeData(parsed);
          }
        }
      } catch (e) {
        console.warn('Erro ao ler localStorage:', e);
      }
    }
    return getInitialData();
  }

  /**
   * Sanitiza os dados garantindo todas as propriedades necessárias
   */
  sanitizeData(loaded) {
    const initial = getInitialData();
    return {
      version: APP_VERSION,
      creator: APP_CREATOR,
      doctorName: loaded.doctorName || initial.doctorName,
      residencySalary: {
        ...initial.residencySalary,
        ...(loaded.residencySalary || {})
      },
      shifts: Array.isArray(loaded.shifts) ? loaded.shifts : [],
      expenses: Array.isArray(loaded.expenses) ? loaded.expenses : [],
      categories: Array.isArray(loaded.categories) && loaded.categories.length > 0 ? loaded.categories : initial.categories,
      hospitals: Array.isArray(loaded.hospitals) && loaded.hospitals.length > 0 ? loaded.hospitals : initial.hospitals,
      preferences: {
        ...initial.preferences,
        ...(loaded.preferences || {})
      },
      lastUpdated: loaded.lastUpdated || new Date().toISOString()
    };
  }

  /**
   * Hidratação assíncrona do IndexedDB e solicitação de persistência do iOS
   */
  async initAsyncPersistence() {
    if (typeof window === 'undefined') return;

    // 1. Solicita proteção de persistência permanente ao iOS WebKit
    if (navigator.storage && navigator.storage.persist) {
      try {
        await navigator.storage.persist();
      } catch (err) {
        // Ignora silenciosamente
      }
    }

    // 2. Consulta IndexedDB para restauração contra purgas do Safari
    try {
      const dbData = await IndexedDBManager.get('current_state');
      if (dbData && typeof dbData === 'object') {
        const localShiftsCount = (this.data.shifts || []).length;
        const localExpensesCount = (this.data.expenses || []).length;
        const dbShiftsCount = (dbData.shifts || []).length;
        const dbExpensesCount = (dbData.expenses || []).length;

        // Se o IndexedDB tiver dados e o localStorage estiver zerado/incompleto, restaura!
        if ((dbShiftsCount > localShiftsCount) || (dbExpensesCount > localExpensesCount)) {
          this.data = this.sanitizeData(dbData);
          this.saveSync();
          this.notify();
        }
      } else {
        // Inicializa o IndexedDB com os dados atuais
        IndexedDBManager.set('current_state', this.data).catch(() => {});
      }
    } catch (err) {
      // Falha do IndexedDB tratada com fallback do localStorage
    }
  }

  /**
   * Salva nos 2 níveis (LocalStorage síncrono + IndexedDB assíncrono)
   */
  save() {
    this.data.lastUpdated = new Date().toISOString();
    this.saveSync();
    IndexedDBManager.set('current_state', this.data).catch(() => {});
    this.notify();
  }

  saveSync() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (err) {
        console.error('Falha ao salvar no localStorage:', err);
      }
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.data);
      } catch (err) {
        console.error('Erro em listener da store:', err);
      }
    }
  }

  // ---------------------------------------------------------------
  // GESTÃO DE GANHOS (RESIDÊNCIA & PLANTÕES EM SALA DE PARTO)
  // ---------------------------------------------------------------

  updateResidencySalary({ value, dayOfMonth, description, active }) {
    if (value !== undefined) this.data.residencySalary.value = parseFloat(value) || 0;
    if (dayOfMonth !== undefined) this.data.residencySalary.dayOfMonth = parseInt(dayOfMonth, 10) || 5;
    if (description !== undefined) this.data.residencySalary.description = description;
    if (active !== undefined) this.data.residencySalary.active = Boolean(active);
    this.save();
  }

  /**
   * Cadastra ou atualiza um plantão em Sala de Parto
   * Aplica rigorosamente a regra médica: 75% em 2 meses (D+60) e 25% no 3º mês (D+90)
   */
  saveShift({
    id = null,
    hospital,
    date,
    shiftType = '12h Noturno',
    grossValue = 0,
    netValue = 0,
    notes = ''
  }) {
    const gross = parseFloat(grossValue) || 0;
    const net = parseFloat(netValue) || gross;
    const shiftDate = date || getLocalDateString();

    const expectedDate75 = addMonthsToDateString(shiftDate, 2); // D+60 (2 meses)
    const expectedDate25 = addMonthsToDateString(shiftDate, 3); // D+90 (3 meses)

    const val75 = Math.round((net * 0.75) * 100) / 100;
    const val25 = Math.round((net - val75) * 100) / 100;

    const existingIndex = id ? this.data.shifts.findIndex(s => s.id === id) : -1;
    const existing = existingIndex >= 0 ? this.data.shifts[existingIndex] : null;

    const shiftRecord = {
      id: id || `sh_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      hospital: hospital.trim(),
      date: shiftDate,
      shiftType,
      grossValue: gross,
      netValue: net,
      notes: notes.trim(),
      installment1: {
        percentage: 75,
        value: val75,
        expectedDate: expectedDate75,
        status: existing?.installment1?.status || 'pending',
        paidDate: existing?.installment1?.paidDate || null
      },
      installment2: {
        percentage: 25,
        value: val25,
        expectedDate: expectedDate25,
        status: existing?.installment2?.status || 'pending',
        paidDate: existing?.installment2?.paidDate || null
      },
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.data.shifts[existingIndex] = shiftRecord;
    } else {
      this.data.shifts.unshift(shiftRecord);
    }

    if (hospital.trim() && !this.data.hospitals.includes(hospital.trim())) {
      this.data.hospitals.push(hospital.trim());
    }

    this.save();
    return shiftRecord;
  }

  deleteShift(id) {
    this.data.shifts = this.data.shifts.filter(s => s.id !== id);
    this.save();
  }

  toggleShiftInstallment(shiftId, installmentNum) {
    const shift = this.data.shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const inst = installmentNum === 1 ? shift.installment1 : shift.installment2;
    if (!inst) return;

    if (inst.status === 'received') {
      inst.status = 'pending';
      inst.paidDate = null;
    } else {
      inst.status = 'received';
      inst.paidDate = getLocalDateString();
    }
    this.save();
  }

  // ---------------------------------------------------------------
  // GESTÃO DE DESPESAS (COM SUPORTE A COMPRAS PARCELADAS)
  // ---------------------------------------------------------------

  /**
   * Adiciona ou edita uma despesa.
   * Se totalInstallments > 1, gera e distribui automaticamente as parcelas futuras!
   */
  saveExpense({
    id = null,
    category,
    description,
    value,
    date,
    isInstallment = false,
    totalInstallments = 1
  }) {
    const numInstallments = isInstallment ? Math.max(1, parseInt(totalInstallments, 10) || 1) : 1;
    const totalVal = parseFloat(value) || 0;
    const baseDate = date || getLocalDateString();
    const catName = category.trim();
    const desc = description.trim() || catName;

    // Se é uma edição de despesa simples existente
    if (id) {
      const idx = this.data.expenses.findIndex(e => e.id === id);
      if (idx >= 0) {
        this.data.expenses[idx] = {
          ...this.data.expenses[idx],
          category: catName,
          description: desc,
          value: totalVal,
          date: baseDate
        };
        this.save();
        return;
      }
    }

    // Se for uma nova compra parcelada (> 1 parcela)
    if (numInstallments > 1) {
      const parentId = `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const installmentValue = Math.round((totalVal / numInstallments) * 100) / 100;
      let diff = Math.round((totalVal - (installmentValue * numInstallments)) * 100) / 100;

      for (let i = 1; i <= numInstallments; i++) {
        const instDate = addMonthsToDateString(baseDate, i - 1);
        const thisValue = i === 1 ? installmentValue + diff : installmentValue;

        this.data.expenses.push({
          id: `exp_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
          parentExpenseId: parentId,
          category: catName,
          description: `${desc} (${i}/${numInstallments})`,
          value: thisValue,
          date: instDate,
          isInstallment: true,
          installmentNumber: i,
          totalInstallments: numInstallments,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Despesa à vista / normal
      this.data.expenses.unshift({
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        parentExpenseId: null,
        category: catName,
        description: desc,
        value: totalVal,
        date: baseDate,
        isInstallment: false,
        installmentNumber: 1,
        totalInstallments: 1,
        createdAt: new Date().toISOString()
      });
    }

    this.save();
  }

  deleteExpense(id) {
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
  }

  addCustomCategory({ name, icon = 'tag', color = '#b80f55' }) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = this.data.categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;

    this.data.categories.push({
      id: `cat_${Date.now()}`,
      name: trimmed,
      icon,
      color
    });
    this.save();
  }

  // ---------------------------------------------------------------
  // RELATÓRIOS: REGIME DE CAIXA VS REGIME DE COMPETÊNCIA
  // ---------------------------------------------------------------

  /**
   * Calcula o resumo financeiro consolidado de um mês específico
   * @param {string} targetMonth YYYY-MM
   * @param {string} regime 'caixa' ou 'competencia'
   */
  getMonthSummary(targetMonth, regime = 'caixa') {
    // 1. Salário da Residência (entra em todo mês no Regime de Caixa e Competência se ativo)
    const residencyIncome = this.data.residencySalary.active ? (this.data.residencySalary.value || 0) : 0;

    // 2. Plantões
    let shiftInflowRealized = 0;
    let shiftInflowPending = 0;
    let shiftsInScope = [];

    if (regime === 'caixa') {
      // Regime de Caixa: busca parcelas com expectedDate caindo no targetMonth
      this.data.shifts.forEach(shift => {
        let matched = false;
        // Parcela 1 (75%)
        if (shift.installment1 && shift.installment1.expectedDate.startsWith(targetMonth)) {
          matched = true;
          if (shift.installment1.status === 'received') {
            shiftInflowRealized += shift.installment1.value;
          } else {
            shiftInflowPending += shift.installment1.value;
          }
        }
        // Parcela 2 (25%)
        if (shift.installment2 && shift.installment2.expectedDate.startsWith(targetMonth)) {
          matched = true;
          if (shift.installment2.status === 'received') {
            shiftInflowRealized += shift.installment2.value;
          } else {
            shiftInflowPending += shift.installment2.value;
          }
        }
        if (matched) shiftsInScope.push(shift);
      });
    } else {
      // Regime de Competência: busca plantões trabalhados no targetMonth
      this.data.shifts.forEach(shift => {
        if (shift.date.startsWith(targetMonth)) {
          shiftsInScope.push(shift);
          shiftInflowRealized += shift.netValue;
        }
      });
    }

    const totalIncome = residencyIncome + shiftInflowRealized + shiftInflowPending;

    // 3. Despesas do Mês
    const monthExpenses = this.data.expenses.filter(e => e.date.startsWith(targetMonth));
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.value || 0), 0);

    // 4. Saldo Líquido
    const balance = totalIncome - totalExpenses;

    // 5. Agrupamento por Categoria para gráfico de rosca
    const categoryTotals = {};
    monthExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.value;
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([catName, val]) => {
        const catInfo = this.data.categories.find(c => c.name === catName) || { icon: 'tag', color: '#7e4a8a' };
        return {
          category: catName,
          value: val,
          percentage: totalExpenses > 0 ? (val / totalExpenses) * 100 : 0,
          icon: catInfo.icon,
          color: catInfo.color
        };
      })
      .sort((a, b) => b.value - a.value);

    return {
      targetMonth,
      regime,
      residencyIncome,
      shiftInflowRealized,
      shiftInflowPending,
      totalIncome,
      totalExpenses,
      balance,
      shiftsCount: shiftsInScope.length,
      expensesCount: monthExpenses.length,
      categoryBreakdown
    };
  }

  /**
   * Previsão de Fluxo de Caixa para os próximos 6 meses (Regime de Caixa)
   */
  getForecast6Months(startMonth) {
    const forecast = [];
    for (let i = 0; i < 6; i++) {
      const parts = startMonth.split('-');
      let y = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10) - 1 + i;
      y += Math.floor(m / 12);
      m = ((m % 12) + 12) % 12;
      const monthStr = `${y}-${String(m + 1).padStart(2, '0')}`;

      const summary = this.getMonthSummary(monthStr, 'caixa');
      forecast.push({
        month: monthStr,
        label: formatMonthYear(monthStr).split(' de ')[0], // ex: "Novembro"
        income: summary.totalIncome,
        expenses: summary.totalExpenses,
        balance: summary.balance
      });
    }
    return forecast;
  }

  // ---------------------------------------------------------------
  // BACKUP, EXPORTAÇÃO E RESTAURAÇÃO PARA O IPHONE
  // ---------------------------------------------------------------

  /**
   * Exporta arquivo JSON de backup e aciona o compartilhamento/download nativo do iOS
   */
  async exportBackupToFile() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const dateTag = getLocalDateString();
    const fileName = `financas_pediatria_backup_${dateTag}.json`;

    // 1. Tenta Web Share API nativa do iOS (salvar direto no app "Arquivos" / iCloud)
    if (typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const file = new File([jsonStr], fileName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Backup Finanças Pediatria',
            text: 'Cópia de segurança dos plantões e despesas',
            files: [file]
          });
          return { success: true, method: 'share' };
        }
      } catch (err) {
        // Fallback para download clássico
      }
    }

    // 2. Fallback de download direto
    if (typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, method: 'download' };
    }

    return { success: false };
  }

  /**
   * Restaura o estado a partir de um arquivo JSON
   */
  importBackupFromFile(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Formato JSON inválido');
      }
      this.data = this.sanitizeData(parsed);
      this.save();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

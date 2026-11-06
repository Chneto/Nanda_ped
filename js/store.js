/**
 * Finanças Pediatria /v8/ - Motor Canônico de Domínio Financeiro Pediátrico
 * Standalone Local-First • 100% Offline • Sem Dependências de Nuvem
 * 
 * Invariantes Invioláveis:
 * 1. Autor Canônico e Imutável: APP_CREATOR = 'FChNeto'
 * 2. Plantões em Sala de Parto: 75% D+60 e 25% D+90 com resíduo exato de centavo e clamp de fim de mês
 * 3. Compras Parceladas (2x a 24x) com absorção do centavo na 1ª parcela
 * 4. Regime de Caixa vs. Regime de Competência
 * 5. As 23 Categorias Canônicas em 6 Macro-Grupos
 * 6. Gestão 100% Dinâmica de Fontes de Renda e Categorias com Soft-Archive e Double Snapshotting
 */

export const APP_CREATOR = 'FChNeto';
export const APP_VERSION = '8.0.0';

// =========================================================================
// 1. CONSTANTES DE TAXONOMIA E CATÁLOGOS PADRÃO DE FÁBRICA
// =========================================================================

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

export const MACRO_GROUPS = [
  {
    id: 'macro_alimentacao',
    name: 'Alimentação',
    color: '#FF7043',
    icon: 'meal',
    categories: ['Mercantil', 'Refeição', 'Lanches', 'Delivery']
  },
  {
    id: 'macro_transporte',
    name: 'Transporte & Mobilidade',
    color: '#7E57C2',
    icon: 'car',
    categories: ['Combustível', 'Uber', 'Passagens']
  },
  {
    id: 'macro_moradia',
    name: 'Moradia & Contas',
    color: '#26A69A',
    icon: 'home',
    categories: ['Aluguel', 'Energia', 'Água', 'Internet']
  },
  {
    id: 'macro_formacao',
    name: 'Formação & Carreira',
    color: '#42A5F5',
    icon: 'study',
    categories: ['Estudo', 'Cursos', 'Qualificação/Congresso/Pós']
  },
  {
    id: 'macro_saude',
    name: 'Saúde & Autocuidado',
    color: '#EC407A',
    icon: 'meds',
    categories: ['Remédios', 'Academia', 'Fisioterapia', 'Beleza/Salão', 'Produtos de beleza']
  },
  {
    id: 'macro_lazer_outros',
    name: 'Pessoal, Lazer & Outros',
    color: '#AB47BC',
    icon: 'gift',
    categories: ['Presentes', 'Saídas', 'Compras Parceladas', 'Doação']
  }
];

export const DEFAULT_CATEGORIES = [
  { id: 'cat_passagens', name: 'Passagens', icon: 'flight', color: '#7E57C2', macro_group: 'Transporte & Mobilidade', macroGroup: 'Transporte & Mobilidade', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_mercantil', name: 'Mercantil', icon: 'cart', color: '#26A69A', macro_group: 'Alimentação', macroGroup: 'Alimentação', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_academia', name: 'Academia', icon: 'fitness', color: '#EC407A', macro_group: 'Saúde & Autocuidado', macroGroup: 'Saúde & Autocuidado', default_payment_type: 'fixa_mensal', default_amount: 150.00, monthly_budget_cap: 200.00, isDefault: true, active: true },
  { id: 'cat_estudo', name: 'Estudo', icon: 'study', color: '#42A5F5', macro_group: 'Formação & Carreira', macroGroup: 'Formação & Carreira', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_cursos', name: 'Cursos', icon: 'course', color: '#5C6BC0', macro_group: 'Formação & Carreira', macroGroup: 'Formação & Carreira', default_payment_type: 'parcelado', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_presentes', name: 'Presentes', icon: 'gift', color: '#AB47BC', macro_group: 'Pessoal, Lazer & Outros', macroGroup: 'Pessoal, Lazer & Outros', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_aluguel', name: 'Aluguel', icon: 'home', color: '#EF5350', macro_group: 'Moradia & Contas', macroGroup: 'Moradia & Contas', default_payment_type: 'fixa_mensal', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_energia', name: 'Energia', icon: 'bolt', color: '#FFA726', macro_group: 'Moradia & Contas', macroGroup: 'Moradia & Contas', default_payment_type: 'fixa_mensal', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_internet', name: 'Internet', icon: 'wifi', color: '#29B6F6', macro_group: 'Moradia & Contas', macroGroup: 'Moradia & Contas', default_payment_type: 'fixa_mensal', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_combustivel', name: 'Combustível', icon: 'fuel', color: '#FF7043', macro_group: 'Transporte & Mobilidade', macroGroup: 'Transporte & Mobilidade', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_qualificacao', name: 'Qualificação/Congresso/Pós', icon: 'qualification', color: '#8E24AA', macro_group: 'Formação & Carreira', macroGroup: 'Formação & Carreira', default_payment_type: 'parcelado', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_fisioterapia', name: 'Fisioterapia', icon: 'fisioterapia', color: '#F06292', macro_group: 'Saúde & Autocuidado', macroGroup: 'Saúde & Autocuidado', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_agua', name: 'Água', icon: 'water', color: '#26C6DA', macro_group: 'Moradia & Contas', macroGroup: 'Moradia & Contas', default_payment_type: 'fixa_mensal', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_lanches', name: 'Lanches', icon: 'snack', color: '#FFCA28', macro_group: 'Alimentação', macroGroup: 'Alimentação', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_doacao', name: 'Doação', icon: 'donation', color: '#E91E63', macro_group: 'Pessoal, Lazer & Outros', macroGroup: 'Pessoal, Lazer & Outros', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_refeicao', name: 'Refeição', icon: 'meal', color: '#FF8A65', macro_group: 'Alimentação', macroGroup: 'Alimentação', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_beleza_salao', name: 'Beleza/Salão', icon: 'beauty', color: '#D81B60', macro_group: 'Saúde & Autocuidado', macroGroup: 'Saúde & Autocuidado', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_uber', name: 'Uber', icon: 'car', color: '#78909C', macro_group: 'Transporte & Mobilidade', macroGroup: 'Transporte & Mobilidade', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_remedios', name: 'Remédios', icon: 'meds', color: '#66BB6A', macro_group: 'Saúde & Autocuidado', macroGroup: 'Saúde & Autocuidado', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_compras_parceladas', name: 'Compras Parceladas', icon: 'credit_card', color: '#8D6E63', macro_group: 'Pessoal, Lazer & Outros', macroGroup: 'Pessoal, Lazer & Outros', default_payment_type: 'parcelado', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_saidas', name: 'Saídas', icon: 'outing', color: '#9C27B0', macro_group: 'Pessoal, Lazer & Outros', macroGroup: 'Pessoal, Lazer & Outros', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_delivery', name: 'Delivery', icon: 'delivery', color: '#FF5722', macro_group: 'Alimentação', macroGroup: 'Alimentação', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true },
  { id: 'cat_produtos_beleza', name: 'Produtos de beleza', icon: 'sparkles', color: '#F48FB1', macro_group: 'Saúde & Autocuidado', macroGroup: 'Saúde & Autocuidado', default_payment_type: 'a_vista', default_amount: null, monthly_budget_cap: null, isDefault: true, active: true }
];

export const DEFAULT_INCOME_SOURCES = [
  {
    id: 'src_maternidade_principal',
    name: 'Maternidade Principal',
    type: 'plantao',
    typeLabel: 'Plantão em Sala de Parto',
    paymentRule: {
      type: 'parturition_75_60_25_90',
      label: 'Sala de Parto (75% D+60 / 25% D+90)',
      splits: [
        { percentage: 75, lagMonths: 2 },
        { percentage: 25, lagMonths: 3 }
      ]
    },
    defaultAmount: 2000.00,
    icon: 'hospital',
    color: '#7E57C2',
    isDefault: true,
    active: true
  },
  {
    id: 'src_maternidade_secundaria',
    name: 'Maternidade Secundária',
    type: 'plantao',
    typeLabel: 'Plantão em Sala de Parto',
    paymentRule: {
      type: 'parturition_75_60_25_90',
      label: 'Sala de Parto (75% D+60 / 25% D+90)',
      splits: [
        { percentage: 75, lagMonths: 2 },
        { percentage: 25, lagMonths: 3 }
      ]
    },
    defaultAmount: 1800.00,
    icon: 'hospital',
    color: '#5C6BC0',
    isDefault: true,
    active: true
  },
  {
    id: 'src_hospital_pediatrico',
    name: 'Hospital Pediátrico',
    type: 'plantao',
    typeLabel: 'Plantão Pediátrico Geral',
    paymentRule: {
      type: 'd30_100',
      label: 'D+30 (100% no mês seguinte)',
      splits: [
        { percentage: 100, lagMonths: 1 }
      ]
    },
    defaultAmount: 1500.00,
    icon: 'stethoscope',
    color: '#26A69A',
    isDefault: true,
    active: true
  },
  {
    id: 'src_bolsa_residencia',
    name: 'Bolsa de Residência Médica',
    type: 'salario_fixo',
    typeLabel: 'Salário Fixo / Bolsa',
    paymentRule: {
      type: 'd0_100',
      label: 'Mensal Fixo (Dia 5 Útil)',
      splits: [
        { percentage: 100, lagMonths: 0, fixedDay: 5 }
      ]
    },
    defaultAmount: 4106.09,
    icon: 'money_bag',
    color: '#42A5F5',
    isDefault: true,
    active: true
  },
  {
    id: 'src_consultorio_puericultura',
    name: 'Consultório de Puericultura',
    type: 'consulta_puericultura',
    typeLabel: 'Consulta Pediátrica Particular',
    paymentRule: {
      type: 'd0_100',
      label: 'À Vista no Ato (D+0)',
      splits: [
        { percentage: 100, lagMonths: 0 }
      ]
    },
    defaultAmount: 350.00,
    icon: 'baby',
    color: '#EC407A',
    isDefault: true,
    active: true
  }
];

export const DEFAULT_HOSPITALS = [
  'Maternidade Principal',
  'Maternidade Secundária',
  'Hospital Pediátrico',
  'Hospital Geral',
  'Unidade de Saúde'
];

// =========================================================================
// 2. FUNÇÕES DE FORMATAÇÃO E NORMALIZAÇÃO DE DADOS
// =========================================================================

export function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeCategoryName(name) {
  if (typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
}

export function getCategoryKey(name) {
  const normalized = normalizeCategoryName(name);
  if (!normalized) return '';
  return normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function formatCurrency(val) {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDateBR(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '--/--/----';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatMonthYear(monthStr) {
  if (!monthStr || typeof monthStr !== 'string') return '';
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
 * Adiciona meses a uma data com clamp estrito de fim de mês.
 * Previne transbordamento involuntário (ex: 31/03 + 2 meses = 31/05; 31/03 + 3 meses = 30/06).
 */
export function addMonthsToDateString(dateStr, monthsToAdd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) {
    dateStr = getLocalDateString();
  }
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10) - 1;
  const originalDay = parseInt(dayStr, 10);

  const totalMonths = m + monthsToAdd;
  y += Math.floor(totalMonths / 12);
  m = ((totalMonths % 12) + 12) % 12;

  // Último dia do mês destino (ano bissexto respeitado em fevereiro)
  const maxDays = new Date(y, m + 1, 0).getDate();
  const safeDay = Math.min(originalDay, maxDays);

  const mm = String(m + 1).padStart(2, '0');
  const dd = String(safeDay).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

export function generateEntityId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// =========================================================================
// 3. RESOLUÇÃO DE MACRO-GRUPOS E TAXONOMIA
// =========================================================================

export function getMacroGroupForCategory(categoryName, customCategories = []) {
  const key = getCategoryKey(categoryName);

  // 1. Procura nas categorias customizadas ativas
  const custom = customCategories.find(c => getCategoryKey(c.name) === key);
  if (custom && custom.macro_group) {
    const mg = MACRO_GROUPS.find(m => m.name === custom.macro_group);
    if (mg) return mg;
  }

  // 2. Procura nos 6 Macro-Grupos padrão
  for (const mg of MACRO_GROUPS) {
    if (mg.categories.some(c => getCategoryKey(c) === key)) {
      return mg;
    }
  }

  // 3. Fallback seguro e canônico
  return MACRO_GROUPS[5]; // Pessoal, Lazer & Outros
}

// =========================================================================
// 4. CÁLCULO DE PARCELAS DE RENDIMENTOS MÉDICOS E PLANTÕES
// =========================================================================

/**
 * Calcula parcelas de recebimento médico de acordo com a regra da fonte.
 * Garante soma exata de centavos e ajuste de datas no fechamento de mês.
 */
export function calculateIncomeInstallments(netValue, shiftDateStr, paymentRule = null) {
  const net = Math.round((parseFloat(netValue) || 0) * 100) / 100;
  const workedDate = /^\d{4}-\d{2}-\d{2}$/.test(String(shiftDateStr)) ? shiftDateStr : getLocalDateString();

  const splits = paymentRule?.splits && paymentRule.splits.length > 0
    ? paymentRule.splits
    : [
        { percentage: 75, lagMonths: 2 },
        { percentage: 25, lagMonths: 3 }
      ];

  let allocated = 0;
  return splits.map((s, idx) => {
    const isLast = idx === splits.length - 1;
    let val;
    if (isLast) {
      val = Math.round((net - allocated) * 100) / 100;
    } else {
      val = Math.round((net * (s.percentage / 100)) * 100) / 100;
      allocated += val;
    }

    const expectedDate = addMonthsToDateString(workedDate, s.lagMonths);
    return {
      installmentNumber: idx + 1,
      percentage: s.percentage,
      value: val,
      date: expectedDate,
      expectedDate: expectedDate,
      status: 'pending',
      paidDate: null
    };
  });
}

/**
 * Wrapper retrocompatível para plantão de sala de parto (75% D+60 e 25% D+90).
 * Retorna { installment1, installment2 } para 100% de compatibilidade com suítes de testes.
 */
export function calculateShiftInstallments(netValue, shiftDateStr) {
  const installments = calculateIncomeInstallments(netValue, shiftDateStr, {
    type: 'parturition_75_60_25_90',
    splits: [
      { percentage: 75, lagMonths: 2 },
      { percentage: 25, lagMonths: 3 }
    ]
  });

  return {
    installment1: installments[0],
    installment2: installments[1]
  };
}

// =========================================================================
// 5. CRIAÇÃO DE ENTIDADES CANÔNICAS (COM ALIASES RETROCOMPATÍVEIS)
// =========================================================================

export function createCanonicalShift(data = {}) {
  const net = Math.round((parseFloat(data.net_value ?? data.netValue) || 0) * 100) / 100;
  const gross = Math.round((parseFloat(data.gross_value ?? data.grossValue) || net) * 100) / 100;
  const workedDate = data.date || getLocalDateString();
  const sourceName = data.source_name_snapshot || data.hospital || 'Maternidade Principal';
  const sourceId = data.source_id || `src_${getCategoryKey(sourceName)}`;

  const rule = data.payment_rule_snapshot || {
    type: 'parturition_75_60_25_90',
    label: 'Sala de Parto (75% D+60 / 25% D+90)',
    splits: [
      { percentage: 75, lagMonths: 2 },
      { percentage: 25, lagMonths: 3 }
    ]
  };

  let installments = Array.isArray(data.installments) && data.installments.length > 0
    ? data.installments
    : calculateIncomeInstallments(net, workedDate, rule);

  // Preserva estados de pagamento legados
  if (data.installment1 && installments[0]) {
    installments[0].status = data.installment1.status || installments[0].status;
    installments[0].paidDate = data.installment1.paidDate || installments[0].paidDate;
  }
  if (data.installment2 && installments[1]) {
    installments[1].status = data.installment2.status || installments[1].status;
    installments[1].paidDate = data.installment2.paidDate || installments[1].paidDate;
  }

  const shift = {
    id: data.id || generateEntityId('shift'),
    source_id: sourceId,
    source_name_snapshot: sourceName,
    date: workedDate,
    shiftType: data.shiftType || 'Sala de Parto',
    gross_value: gross,
    net_value: net,
    payment_rule_snapshot: rule,
    installments,
    notes: data.notes || '',
    created_at: data.created_at || new Date().toISOString()
  };

  // Getters & Setters não-enumeráveis para retrocompatibilidade total
  Object.defineProperties(shift, {
    hospital: {
      get() { return this.source_name_snapshot; },
      set(val) { this.source_name_snapshot = val; },
      enumerable: true
    },
    netValue: {
      get() { return this.net_value; },
      set(val) { this.net_value = val; },
      enumerable: true
    },
    grossValue: {
      get() { return this.gross_value; },
      set(val) { this.gross_value = val; },
      enumerable: true
    },
    installment1: {
      get() { return this.installments[0] || null; },
      set(val) { if (this.installments[0]) Object.assign(this.installments[0], val); },
      enumerable: true
    },
    installment2: {
      get() { return this.installments[1] || null; },
      set(val) { if (this.installments[1]) Object.assign(this.installments[1], val); },
      enumerable: true
    },
    installment1_date: {
      get() { return this.installments[0]?.date || ''; },
      enumerable: false
    },
    installment1_value: {
      get() { return this.installments[0]?.value || 0; },
      enumerable: false
    },
    installment2_date: {
      get() { return this.installments[1]?.date || ''; },
      enumerable: false
    },
    installment2_value: {
      get() { return this.installments[1]?.value || 0; },
      enumerable: false
    }
  });

  return shift;
}

export function createCanonicalExpense(data = {}) {
  const amt = Math.round((parseFloat(data.amount ?? data.value) || 0) * 100) / 100;
  const catName = data.category_name_snapshot || data.category || 'Outros';
  const catId = data.category_id || data.categoryId || `cat_${getCategoryKey(catName)}`;
  const macro = data.macro_group_snapshot || data.macro_group || data.macroGroup || 'Pessoal, Lazer & Outros';

  const expense = {
    id: data.id || generateEntityId('exp'),
    description: data.description || 'Despesa',
    amount: amt,
    date: data.date || getLocalDateString(),
    category_id: catId,
    category_name_snapshot: catName,
    macro_group: macro,
    macro_group_snapshot: macro,
    total_installments: data.total_installments ?? data.totalInstallments ?? 1,
    current_installment: data.current_installment ?? data.currentInstallment ?? 1,
    is_installment: Boolean(data.is_installment ?? data.isInstallment ?? (data.total_installments > 1 || data.totalInstallments > 1)),
    installment_group_id: data.installment_group_id || data.groupId || null,
    created_at: data.created_at || new Date().toISOString()
  };

  // Aliases camelCase para retrocompatibilidade
  Object.defineProperties(expense, {
    value: {
      get() { return this.amount; },
      set(val) { this.amount = val; },
      enumerable: true
    },
    category: {
      get() { return this.category_name_snapshot; },
      set(val) { this.category_name_snapshot = val; },
      enumerable: true
    },
    categoryId: {
      get() { return this.category_id; },
      set(val) { this.category_id = val; },
      enumerable: true
    },
    macroGroup: {
      get() { return this.macro_group; },
      set(val) { this.macro_group = val; },
      enumerable: true
    },
    totalInstallments: {
      get() { return this.total_installments; },
      set(val) { this.total_installments = val; },
      enumerable: true
    },
    currentInstallment: {
      get() { return this.current_installment; },
      set(val) { this.current_installment = val; },
      enumerable: true
    },
    isInstallment: {
      get() { return this.is_installment; },
      set(val) { this.is_installment = val; },
      enumerable: true
    }
  });

  return expense;
}

// =========================================================================
// 6. GERAÇÃO DE COMPRAS PARCELADAS (2x a 24x) COM CENTAVO NA 1ª PARCELA
// =========================================================================

export function generateExpenseInstallments(expenseData, totalInstallments = 1, availableCategories = []) {
  const count = Math.max(1, Math.min(24, parseInt(totalInstallments || expenseData.total_installments || expenseData.totalInstallments, 10) || 1));
  const totalVal = Math.round((parseFloat(expenseData.amount ?? expenseData.value) || 0) * 100) / 100;
  const baseDate = expenseData.date || getLocalDateString();
  const parentGroupId = expenseData.installment_group_id || expenseData.groupId || generateEntityId('grp');

  const catName = expenseData.category || expenseData.category_name_snapshot || 'Outros';
  const matchedCat = availableCategories.find(c => getCategoryKey(c.name) === getCategoryKey(catName) || c.id === expenseData.category_id);
  const resolvedCatId = matchedCat?.id || expenseData.category_id || `cat_${getCategoryKey(catName)}`;
  const macro = matchedCat?.macro_group || getMacroGroupForCategory(catName, availableCategories).name;

  if (count === 1) {
    return [createCanonicalExpense({
      ...expenseData,
      amount: totalVal,
      date: baseDate,
      category: catName,
      category_id: resolvedCatId,
      category_name_snapshot: catName,
      macro_group: macro,
      macro_group_snapshot: macro,
      total_installments: 1,
      current_installment: 1,
      is_installment: false,
      installment_group_id: null
    })];
  }

  const partVal = Math.floor((totalVal / count) * 100) / 100;
  const firstPartVal = Math.round((totalVal - (partVal * (count - 1))) * 100) / 100;
  const installments = [];

  for (let i = 1; i <= count; i++) {
    const instVal = (i === 1) ? firstPartVal : partVal;
    const instDate = addMonthsToDateString(baseDate, i - 1);

    installments.push(createCanonicalExpense({
      ...expenseData,
      id: i === 1 && expenseData.id ? expenseData.id : generateEntityId('exp'),
      description: `${expenseData.description || 'Despesa'} (${i}/${count})`,
      amount: instVal,
      date: instDate,
      category: catName,
      category_id: resolvedCatId,
      category_name_snapshot: catName,
      macro_group: macro,
      macro_group_snapshot: macro,
      total_installments: count,
      current_installment: i,
      is_installment: true,
      installment_group_id: parentGroupId
    }));
  }

  return installments;
}

// =========================================================================
// 7. CLASSE PRINCIPAL: PEDIATRIC STORE
// =========================================================================

export function getInitialData() {
  const today = getLocalDateString();
  const currentMonth = today.slice(0, 7);

  return {
    version: APP_VERSION,
    creator: APP_CREATOR,
    doctorName: 'Médica',
    doctorRole: 'Pediatra (R3)',
    doctorCrm: '',
    doctorPhoto: null,
    residencySalary: {
      value: 0.00,
      dayOfMonth: 5,
      description: 'Bolsa Residência Médica (Pediatria)',
      active: false
    },
    shifts: [],
    expenses: [],
    incomeSources: DEFAULT_INCOME_SOURCES.map(s => ({ ...s, paymentRule: { ...s.paymentRule, splits: s.paymentRule.splits.map(sp => ({ ...sp })) } })),
    categories: DEFAULT_CATEGORIES.map(c => ({ ...c })),
    customCategories: [],
    hospitals: [...DEFAULT_HOSPITALS],
    preferences: {
      regime: 'caixa',
      theme: 'light',
      activeMonth: currentMonth
    },
    trash: {
      shifts: [],
      expenses: []
    },
    lastUpdated: new Date().toISOString()
  };
}

export class PediatricStore {
  constructor(storage = null) {
    this.storage = storage;
    this.listeners = new Set();
    this.data = getInitialData();
  }

  init(data = null) {
    if (data && typeof data === 'object') {
      this.data = this.sanitizeStoreState(data);
    }
    this.notify();
    return this;
  }

  sanitizeStoreState(raw) {
    const initial = getInitialData();
    const data = { ...initial, ...raw };

    data.creator = APP_CREATOR;
    data.version = APP_VERSION;

    // Normaliza Categorias
    const catList = Array.isArray(data.categories) && data.categories.length > 0
      ? data.categories
      : DEFAULT_CATEGORIES.map(c => ({ ...c }));
    data.categories = catList.map(c => ({
      ...c,
      name: normalizeCategoryName(c.name || 'Sem Nome'),
      macro_group: c.macro_group || c.macroGroup || 'Pessoal, Lazer & Outros',
      active: c.active !== false
    }));

    // Normaliza Fontes de Renda
    if (!Array.isArray(data.incomeSources) || data.incomeSources.length === 0) {
      data.incomeSources = DEFAULT_INCOME_SOURCES.map(s => ({ ...s }));
    } else {
      data.incomeSources = data.incomeSources.map(s => ({
        ...s,
        name: normalizeCategoryName(s.name || 'Fonte de Renda'),
        active: s.active !== false
      }));
    }

    // Normaliza Hospitais para compatibilidade
    const sourceNames = data.incomeSources.map(s => s.name);
    data.hospitals = Array.from(new Set([...DEFAULT_HOSPITALS, ...sourceNames]));

    // Normaliza Shifts
    data.shifts = (data.shifts || []).map(s => createCanonicalShift(s));

    // Normaliza Expenses
    data.expenses = (data.expenses || []).map(e => createCanonicalExpense(e));

    // Normaliza Trash
    data.trash = data.trash || { shifts: [], expenses: [] };
    data.trash.shifts = (data.trash.shifts || []).map(s => createCanonicalShift(s));
    data.trash.expenses = (data.trash.expenses || []).map(e => createCanonicalExpense(e));

    return data;
  }

  save() {
    this.data.lastUpdated = new Date().toISOString();
    if (this.storage && typeof this.storage.saveSync === 'function') {
      this.storage.saveSync(this.data);
      if (typeof this.storage.saveAsync === 'function') {
        this.storage.saveAsync(this.data);
      }
    }
    this.notify();
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    return () => {};
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.data);
      } catch (err) {
        console.error('Erro em listener do PediatricStore:', err);
      }
    }
  }

  // -----------------------------------------------------------------------
  // PERFIL DA MÉDICA
  // -----------------------------------------------------------------------

  getProfile() {
    return {
      doctorName: this.data.doctorName || 'Médica',
      doctorRole: this.data.doctorRole || 'Pediatra (R3)',
      doctorCrm: this.data.doctorCrm || '',
      doctorPhoto: this.data.doctorPhoto || null,
      residencySalary: { ...(this.data.residencySalary || {}) }
    };
  }

  updateProfile(changes = {}) {
    if (changes.doctorName !== undefined) this.data.doctorName = String(changes.doctorName || '').trim() || 'Médica';
    if (changes.doctorRole !== undefined) this.data.doctorRole = String(changes.doctorRole || '').trim() || 'Pediatra (R3)';
    if (changes.doctorCrm !== undefined) this.data.doctorCrm = String(changes.doctorCrm || '').trim();
    if (changes.doctorPhoto !== undefined) this.data.doctorPhoto = changes.doctorPhoto;
    if (changes.residencySalary) {
      this.data.residencySalary = {
        ...this.data.residencySalary,
        ...changes.residencySalary,
        value: Math.max(0, Math.round((parseFloat(changes.residencySalary.value) || 0) * 100) / 100)
      };
    }
    this.save();
    return this.getProfile();
  }

  // -----------------------------------------------------------------------
  // PLANTÕES E GANHOS MÉDICOS (CRUD)
  // -----------------------------------------------------------------------

  addShift(shiftData) {
    const net = Math.round((parseFloat(shiftData.net_value ?? shiftData.netValue) || 0) * 100) / 100;
    if (net <= 0) return null;

    const sourceName = normalizeCategoryName(shiftData.source_name_snapshot || shiftData.hospital || 'Maternidade Principal');
    const matchedSource = this.getActiveIncomeSources().find(s => getCategoryKey(s.name) === getCategoryKey(sourceName));
    const rule = matchedSource?.paymentRule || shiftData.payment_rule_snapshot || {
      type: 'parturition_75_60_25_90',
      label: 'Sala de Parto (75% D+60 / 25% D+90)',
      splits: [
        { percentage: 75, lagMonths: 2 },
        { percentage: 25, lagMonths: 3 }
      ]
    };

    const newShift = createCanonicalShift({
      ...shiftData,
      source_id: matchedSource?.id || shiftData.source_id,
      source_name_snapshot: sourceName,
      payment_rule_snapshot: rule
    });

    this.data.shifts.unshift(newShift);
    this.save();
    return newShift;
  }

  updateShift(shiftId, changes = {}) {
    const shift = this.data.shifts.find(s => s.id === shiftId);
    if (!shift) return { updated: false, error: 'Plantão não encontrado' };

    const oldNet = shift.net_value;
    const oldDate = shift.date;

    if (changes.hospital || changes.source_name_snapshot) {
      const nextName = normalizeCategoryName(changes.source_name_snapshot || changes.hospital);
      shift.source_name_snapshot = nextName;
      const matched = this.getActiveIncomeSources().find(s => getCategoryKey(s.name) === getCategoryKey(nextName));
      if (matched) {
        shift.source_id = matched.id;
        if (!changes.payment_rule_snapshot) {
          shift.payment_rule_snapshot = matched.paymentRule;
        }
      }
    }

    if (changes.shiftType !== undefined) shift.shiftType = changes.shiftType;
    if (changes.notes !== undefined) shift.notes = String(changes.notes || '');

    if (changes.net_value !== undefined || changes.netValue !== undefined) {
      shift.net_value = Math.max(0, Math.round((parseFloat(changes.net_value ?? changes.netValue) || 0) * 100) / 100);
    }
    if (changes.gross_value !== undefined || changes.grossValue !== undefined) {
      shift.gross_value = Math.max(0, Math.round((parseFloat(changes.gross_value ?? changes.grossValue) || shift.net_value) * 100) / 100);
    }
    if (changes.date) {
      shift.date = changes.date;
    }
    if (changes.payment_rule_snapshot) {
      shift.payment_rule_snapshot = changes.payment_rule_snapshot;
    }

    // Recalcula parcelas se data, valor líquido ou regra de pagamento mudaram
    const netChanged = shift.net_value !== oldNet;
    const dateChanged = shift.date !== oldDate;
    const ruleChanged = Boolean(changes.payment_rule_snapshot);

    if (netChanged || dateChanged || ruleChanged) {
      const prevStatuses = (shift.installments || []).map(i => ({ status: i.status, paidDate: i.paidDate }));
      shift.installments = calculateIncomeInstallments(shift.net_value, shift.date, shift.payment_rule_snapshot);
      // Preserva status anterior se compatível
      shift.installments.forEach((inst, idx) => {
        if (prevStatuses[idx]) {
          inst.status = prevStatuses[idx].status;
          inst.paidDate = prevStatuses[idx].paidDate;
        }
      });
    }

    this.save();
    return { updated: true, shift };
  }

  deleteShift(shiftId) {
    const idx = this.data.shifts.findIndex(s => s.id === shiftId);
    if (idx === -1) return null;

    const [deleted] = this.data.shifts.splice(idx, 1);
    this.data.trash.shifts.unshift(deleted);
    this.save();
    return deleted;
  }

  restoreShift(shift) {
    if (!shift || !shift.id) return false;
    // Remove do trash se estiver lá
    this.data.trash.shifts = this.data.trash.shifts.filter(s => s.id !== shift.id);
    // Adiciona de volta se não estiver na lista
    if (!this.data.shifts.some(s => s.id === shift.id)) {
      this.data.shifts.unshift(createCanonicalShift(shift));
      this.save();
      return true;
    }
    return false;
  }

  toggleShiftInstallment(shiftId, installmentNum = 1) {
    const shift = this.data.shifts.find(s => s.id === shiftId);
    if (!shift || !shift.installments) return null;

    const idx = installmentNum - 1;
    const inst = shift.installments[idx];
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

  // -----------------------------------------------------------------------
  // DESPESAS E COMPRAS PARCELADAS (CRUD)
  // -----------------------------------------------------------------------

  addExpense(expenseData) {
    const amt = Math.round((parseFloat(expenseData.amount ?? expenseData.value) || 0) * 100) / 100;
    if (amt <= 0) return null;

    const totalInstallments = Math.max(1, Math.min(24, parseInt(expenseData.total_installments ?? expenseData.totalInstallments, 10) || 1));
    const generated = generateExpenseInstallments(expenseData, totalInstallments, this.getActiveCategories());

    for (const exp of generated) {
      this.data.expenses.unshift(exp);
    }

    this.save();
    return generated.length === 1 ? generated[0] : generated;
  }

  updateExpense(expenseId, changes = {}) {
    const exp = this.data.expenses.find(e => e.id === expenseId);
    if (!exp) return { updated: false, error: 'Despesa não encontrada' };

    if (changes.description !== undefined) exp.description = String(changes.description || '').trim() || 'Despesa';
    if (changes.amount !== undefined || changes.value !== undefined) {
      exp.amount = Math.max(0, Math.round((parseFloat(changes.amount ?? changes.value) || 0) * 100) / 100);
    }
    if (changes.date) exp.date = changes.date;

    if (changes.category || changes.category_name_snapshot) {
      const nextCatName = normalizeCategoryName(changes.category || changes.category_name_snapshot);
      exp.category_name_snapshot = nextCatName;
      const matched = this.getActiveCategories().find(c => getCategoryKey(c.name) === getCategoryKey(nextCatName));
      if (matched) {
        exp.category_id = matched.id;
        exp.macro_group = matched.macro_group;
        exp.macro_group_snapshot = matched.macro_group;
      } else {
        const macro = getMacroGroupForCategory(nextCatName, this.getActiveCategories()).name;
        exp.macro_group = macro;
        exp.macro_group_snapshot = macro;
      }
    }

    this.save();
    return { updated: true, expense: exp };
  }

  deleteExpense(expenseId) {
    const idx = this.data.expenses.findIndex(e => e.id === expenseId);
    if (idx === -1) return null;

    const [deleted] = this.data.expenses.splice(idx, 1);
    this.data.trash.expenses.unshift(deleted);
    this.save();
    return deleted;
  }

  restoreExpense(expense) {
    if (!expense || !expense.id) return false;
    this.data.trash.expenses = this.data.trash.expenses.filter(e => e.id !== expense.id);
    if (!this.data.expenses.some(e => e.id === expense.id)) {
      this.data.expenses.unshift(createCanonicalExpense(expense));
      this.save();
      return true;
    }
    return false;
  }

  // -----------------------------------------------------------------------
  // GESTÃO DINÂMICA DE FONTES DE RENDA (HOSPITAIS / CONSULTÓRIOS)
  // -----------------------------------------------------------------------

  getAllIncomeSources() {
    return this.data.incomeSources || [];
  }

  getActiveIncomeSources() {
    return (this.data.incomeSources || []).filter(s => s.active !== false);
  }

  addIncomeSource({ name, type = 'plantao', paymentRule = null, defaultAmount = 0, icon = 'hospital', color = '#7E57C2' }) {
    const trimmed = normalizeCategoryName(name);
    if (!trimmed) return null;
    const key = getCategoryKey(trimmed);

    if (this.getAllIncomeSources().some(s => getCategoryKey(s.name) === key)) {
      return null; // Bloqueia duplicação
    }

    const rule = paymentRule || {
      type: 'parturition_75_60_25_90',
      label: 'Sala de Parto (75% D+60 / 25% D+90)',
      splits: [
        { percentage: 75, lagMonths: 2 },
        { percentage: 25, lagMonths: 3 }
      ]
    };

    const newSource = {
      id: generateEntityId('src'),
      name: trimmed,
      type,
      typeLabel: type === 'salario_fixo' ? 'Salário Fixo / Bolsa' : type === 'consulta_puericultura' ? 'Consulta Pediátrica' : 'Plantão Médico',
      paymentRule: rule,
      defaultAmount: Math.max(0, Math.round(Number(defaultAmount || 0) * 100) / 100),
      icon: icon || 'hospital',
      color: color || '#7E57C2',
      isDefault: false,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.incomeSources.push(newSource);
    if (!this.data.hospitals.includes(trimmed)) {
      this.data.hospitals.push(trimmed);
    }
    this.save();
    return newSource;
  }

  updateIncomeSource(sourceId, changes = {}) {
    const source = (this.data.incomeSources || []).find(s => s.id === sourceId);
    if (!source) return { updated: false, error: 'Fonte de renda não encontrada' };

    if (changes.name) {
      const nextName = normalizeCategoryName(changes.name);
      const nextKey = getCategoryKey(nextName);
      const duplicate = (this.data.incomeSources || []).find(s => s.id !== sourceId && getCategoryKey(s.name) === nextKey);
      if (duplicate) return { updated: false, error: 'Já existe uma fonte com esse nome' };
      source.name = nextName;
      if (!this.data.hospitals.includes(nextName)) {
        this.data.hospitals.push(nextName);
      }
    }

    if (changes.type) source.type = changes.type;
    if (changes.paymentRule) source.paymentRule = changes.paymentRule;
    if (changes.defaultAmount !== undefined) source.defaultAmount = Math.max(0, Math.round(Number(changes.defaultAmount) * 100) / 100);
    if (changes.icon) source.icon = changes.icon;
    if (changes.color) source.color = changes.color;
    source.updatedAt = new Date().toISOString();

    this.save();
    return { updated: true, source };
  }

  deleteIncomeSource(sourceId, { forceArchive = false } = {}) {
    const source = (this.data.incomeSources || []).find(s => s.id === sourceId);
    if (!source) return { deleted: false, inUse: false };

    const inUse = (this.data.shifts || []).some(s => s.source_id === sourceId || getCategoryKey(s.source_name_snapshot) === getCategoryKey(source.name));

    if (inUse && !forceArchive) {
      return { deleted: false, inUse: true };
    }

    if (inUse && forceArchive) {
      source.active = false;
      this.save();
      return { deleted: true, archived: true };
    }

    this.data.incomeSources = this.data.incomeSources.filter(s => s.id !== sourceId);
    this.save();
    return { deleted: true, inUse: false };
  }

  restoreDefaultIncomeSources({ preserveCustom = true } = {}) {
    const defaults = DEFAULT_INCOME_SOURCES.map(s => ({ ...s, paymentRule: { ...s.paymentRule, splits: s.paymentRule.splits.map(sp => ({ ...sp })) } }));
    const custom = preserveCustom
      ? (this.data.incomeSources || []).filter(s => !s.isDefault)
      : [];
    this.data.incomeSources = [...defaults, ...custom];
    this.data.hospitals = Array.from(new Set([...DEFAULT_HOSPITALS, ...this.data.incomeSources.map(s => s.name)]));
    this.save();
    return { restored: true, countDefaults: defaults.length, countPreserved: custom.length };
  }

  // -----------------------------------------------------------------------
  // GESTÃO DINÂMICA DE CATEGORIAS DE DESPESAS (COM AS 23 CANÔNICAS)
  // -----------------------------------------------------------------------

  getAllCategories() {
    return this.data.categories || [];
  }

  getActiveCategories() {
    return (this.data.categories || []).filter(c => c.active !== false);
  }

  addCategory({ name, macro_group, default_payment_type = 'a_vista', default_amount = null, monthly_budget_cap = null, icon = 'tag', color = '#7E57C2' }) {
    const trimmed = normalizeCategoryName(name);
    if (!trimmed) return null;
    const key = getCategoryKey(trimmed);

    if (this.getAllCategories().some(c => getCategoryKey(c.name) === key)) {
      return null;
    }

    const mg = macro_group || getMacroGroupForCategory(trimmed).name;

    const newCategory = {
      id: generateEntityId('cat'),
      name: trimmed,
      macro_group: mg,
      macroGroup: mg,
      default_payment_type,
      default_amount: default_amount !== null ? Math.max(0, Math.round(Number(default_amount) * 100) / 100) : null,
      monthly_budget_cap: monthly_budget_cap !== null ? Math.max(0, Math.round(Number(monthly_budget_cap) * 100) / 100) : null,
      icon: icon || 'tag',
      color: color || '#7E57C2',
      isDefault: false,
      isCustom: true,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.categories.push(newCategory);
    if (!this.data.customCategories) this.data.customCategories = [];
    this.data.customCategories.push(newCategory);

    this.save();
    return newCategory;
  }

  updateCategory(categoryId, changes = {}) {
    const category = (this.data.categories || []).find(c => c.id === categoryId);
    if (!category) return { updated: false, error: 'Categoria não encontrada' };

    const oldName = category.name;
    const oldKey = getCategoryKey(oldName);

    if (changes.name) {
      const nextName = normalizeCategoryName(changes.name);
      const nextKey = getCategoryKey(nextName);
      const duplicate = (this.data.categories || []).find(c => c.id !== categoryId && getCategoryKey(c.name) === nextKey);
      if (duplicate) return { updated: false, error: 'Já existe uma categoria com esse nome' };
      category.name = nextName;
    }

    if (changes.macro_group || changes.macroGroup) {
      const nextMg = changes.macro_group || changes.macroGroup;
      category.macro_group = nextMg;
      category.macroGroup = nextMg;
    }

    if (changes.default_payment_type !== undefined) category.default_payment_type = changes.default_payment_type;
    if (changes.default_amount !== undefined) {
      category.default_amount = changes.default_amount !== null ? Math.max(0, Math.round(Number(changes.default_amount) * 100) / 100) : null;
    }
    if (changes.monthly_budget_cap !== undefined) {
      category.monthly_budget_cap = changes.monthly_budget_cap !== null ? Math.max(0, Math.round(Number(changes.monthly_budget_cap) * 100) / 100) : null;
    }
    if (changes.icon) category.icon = changes.icon;
    if (changes.color) category.color = changes.color;
    category.updatedAt = new Date().toISOString();

    // Cascata declarativa opcional para atualizar despesas existentes
    if (changes.cascadeUpdateExpenses && changes.name) {
      for (const exp of this.data.expenses) {
        if (exp.category_id === categoryId || getCategoryKey(exp.category_name_snapshot) === oldKey) {
          exp.category_name_snapshot = category.name;
          exp.macro_group = category.macro_group;
          exp.macro_group_snapshot = category.macro_group;
        }
      }
    }

    this.save();
    return { updated: true, category };
  }

  deleteCustomCategory(categoryId, { forceArchive = false } = {}) {
    const category = (this.data.categories || []).find(c => c.id === categoryId);
    if (!category) return { deleted: false, inUse: false };

    const inUse = (this.data.expenses || []).some(e => e.category_id === categoryId || getCategoryKey(e.category_name_snapshot) === getCategoryKey(category.name));

    if (inUse && !forceArchive) {
      return { deleted: false, inUse: true };
    }

    if (inUse && forceArchive) {
      category.active = false;
      this.save();
      return { deleted: true, archived: true };
    }

    this.data.categories = this.data.categories.filter(c => c.id !== categoryId);
    if (Array.isArray(this.data.customCategories)) {
      this.data.customCategories = this.data.customCategories.filter(c => c.id !== categoryId);
    }
    this.save();
    return { deleted: true, inUse: false };
  }

  restoreDefaultCategories({ preserveCustom = true } = {}) {
    const defaults = DEFAULT_CATEGORIES.map(c => ({
      ...c,
      default_payment_type: c.default_payment_type || 'a_vista',
      monthly_budget_cap: c.monthly_budget_cap || null,
      default_amount: c.default_amount || null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const canonicalKeys = new Set(CANONICAL_CATEGORIES.map(c => getCategoryKey(c)));
    const custom = preserveCustom && Array.isArray(this.data.categories)
      ? this.data.categories.filter(c => !canonicalKeys.has(getCategoryKey(c.name)) && c.isCustom)
      : [];

    this.data.categories = [...defaults, ...custom];
    this.data.customCategories = custom;
    this.save();
    return {
      restored: true,
      defaultCount: defaults.length,
      preservedCustomCount: custom.length
    };
  }

  // -----------------------------------------------------------------------
  // RELATÓRIOS FINANCEIROS: CAIXA VS COMPETÊNCIA E FLUXO DE 6 MESES
  // -----------------------------------------------------------------------

  getMonthSummary(targetMonth = getLocalDateString().slice(0, 7), regime = 'caixa') {
    const monthStr = targetMonth.slice(0, 7);
    const isCaixa = regime === 'caixa';

    // 1. Bolsa Residência Fixa
    const salary = this.data.residencySalary;
    const residencyIncome = (salary && salary.active) ? (parseFloat(salary.value) || 0) : 0;

    // 2. Plantões e Ganhos Médicos
    let shiftInflowRealized = 0;
    let shiftInflowPending = 0;
    let shiftProductionTotal = 0;
    const shiftsInScope = [];

    for (const shift of this.data.shifts) {
      if (isCaixa) {
        // Regime de Caixa: vencimento das parcelas no mês selecionado
        for (const inst of shift.installments || []) {
          if (inst.date && inst.date.startsWith(monthStr)) {
            shiftsInScope.push(shift);
            if (inst.status === 'received') {
              shiftInflowRealized += inst.value;
            } else {
              shiftInflowPending += inst.value;
            }
          }
        }
      } else {
        // Regime de Competência: mês em que o trabalho foi realizado
        if (shift.date && shift.date.startsWith(monthStr)) {
          shiftsInScope.push(shift);
          shiftProductionTotal += shift.net_value;
        }
      }
    }

    const totalIncome = isCaixa
      ? Math.round((residencyIncome + shiftInflowRealized + shiftInflowPending) * 100) / 100
      : Math.round((residencyIncome + shiftProductionTotal) * 100) / 100;

    // 3. Despesas do Mês
    const monthExpenses = (this.data.expenses || []).filter(e => e.date && e.date.startsWith(monthStr));
    const totalExpenses = Math.round(monthExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) * 100) / 100;

    // 4. Saldo Projetado
    const balance = Math.round((totalIncome - totalExpenses) * 100) / 100;

    // 5. Breakdown por Categoria
    const categoryTotals = {};
    for (const exp of monthExpenses) {
      const catName = exp.category_name_snapshot || 'Outros';
      categoryTotals[catName] = (categoryTotals[catName] || 0) + exp.amount;
    }

    const categoryBreakdown = Object.entries(categoryTotals).map(([name, amount]) => {
      const matched = this.getAllCategories().find(c => getCategoryKey(c.name) === getCategoryKey(name));
      return {
        name,
        amount: Math.round(amount * 100) / 100,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 1000) / 10 : 0,
        color: matched?.color || '#7E57C2',
        icon: matched?.icon || 'tag',
        macro_group: matched?.macro_group || getMacroGroupForCategory(name).name
      };
    }).sort((a, b) => b.amount - a.amount);

    // 6. Breakdown por Macro-Grupo
    const macroTotals = {};
    for (const exp of monthExpenses) {
      const mgName = exp.macro_group_snapshot || getMacroGroupForCategory(exp.category_name_snapshot).name;
      macroTotals[mgName] = (macroTotals[mgName] || 0) + exp.amount;
    }

    const macroGroupBreakdown = MACRO_GROUPS.map(mg => {
      const amt = macroTotals[mg.name] || 0;
      return {
        id: mg.id,
        name: mg.name,
        color: mg.color,
        icon: mg.icon,
        amount: Math.round(amt * 100) / 100,
        percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 1000) / 10 : 0
      };
    }).filter(mg => mg.amount > 0).sort((a, b) => b.amount - a.amount);

    return {
      targetMonth: monthStr,
      regime,
      residencyIncome,
      shiftInflowRealized: Math.round(shiftInflowRealized * 100) / 100,
      shiftInflowPending: Math.round(shiftInflowPending * 100) / 100,
      shiftProductionTotal: Math.round(shiftProductionTotal * 100) / 100,
      totalIncome,
      totalExpenses,
      balance,
      shiftsCount: Array.from(new Set(shiftsInScope.map(s => s.id))).length,
      expensesCount: monthExpenses.length,
      categoryBreakdown,
      macroGroupBreakdown
    };
  }

  getForecast6Months(startMonth = getLocalDateString().slice(0, 7)) {
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
        label: formatMonthYear(monthStr).split(' de ')[0],
        income: summary.totalIncome,
        expenses: summary.totalExpenses,
        balance: summary.balance
      });
    }
    return forecast;
  }

  // -----------------------------------------------------------------------
  // ZERAR DADOS COM SEGURANÇA
  // -----------------------------------------------------------------------

  resetAllData({ createBackup = true } = {}) {
    let backupJson = null;
    if (createBackup) {
      backupJson = JSON.stringify(this.data);
    }

    const defaults = getInitialData();
    this.data.shifts = [];
    this.data.expenses = [];
    this.data.trash = { shifts: [], expenses: [] };
    this.data.residencySalary = defaults.residencySalary;
    this.data.categories = defaults.categories;
    this.data.incomeSources = defaults.incomeSources;
    this.data.hospitals = defaults.hospitals;

    this.save();
    return { reset: true, backup: backupJson };
  }
}

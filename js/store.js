/**
 * Finanças Pediatria - Data Store & Calculation Engine
 * Criado por FChNeto
 */

export const APP_CREATOR = Object.freeze({
  name: "FChNeto",
  signature: "Criado por FChNeto",
  role: "Criador e Desenvolvedor",
  app: "Finanças Pediatria",
  immutable: true
});

export const DEFAULT_DOCTOR_NAME = "Dra. Pediatra";
export const DEFAULT_DOCTOR_TITLE = "Pediatria & Neonatologia 🩺✨";

export const EXPENSE_CATEGORIES_PF = [
  "Lazer",
  "Educação",
  "Alimentação",
  "Transporte",
  "Presentes",
  "Lar",
  "Beleza",
  "Saúde",
  "Viagens",
  "Outros (Pessoal)"
];

export const EXPENSE_CATEGORIES_PJ = [
  "Consultório/Sublocação",
  "CRM/RQE/SBP",
  "Congresso & Atualização",
  "Brinquedos/Materiais Lúdicos",
  "Combustível/Plantão",
  "Impostos & Contabilidade",
  "Outros (PJ)"
];

export const EXPENSE_CATEGORIES = [
  "Consultório/Sublocação",
  "CRM/RQE/SBP",
  "Congresso & Atualização",
  "Brinquedos/Materiais Lúdicos",
  "Combustível/Plantão",
  "Lazer",
  "Educação",
  "Alimentação",
  "Transporte",
  "Presentes",
  "Lar",
  "Beleza",
  "Saúde",
  "Viagens",
  "Impostos & Contabilidade",
  "Outros"
];

export function getCategoryScope(category, customCategories = null) {
  if (!category || typeof category !== "string") return "pf";
  const trimmed = category.trim();

  const customs = customCategories || (typeof window !== "undefined" && window.pediatricStoreInstance ? window.pediatricStoreInstance.getCustomExpenseCategories() : null);
  if (Array.isArray(customs)) {
    const found = customs.find(c => {
      const cName = typeof c === "string" ? c : (c.name || "");
      return cName.toLowerCase() === trimmed.toLowerCase();
    });
    if (found) {
      return typeof found === "object" && found.scope ? found.scope : "pf";
    }
  }

  if (EXPENSE_CATEGORIES_PF.includes(trimmed)) return "pf";
  if (EXPENSE_CATEGORIES_PJ.includes(trimmed)) return "pj";

  const lower = trimmed.toLowerCase();
  if (
    lower.includes("pj") ||
    lower.includes("crm") ||
    lower.includes("sbp") ||
    lower.includes("rqe") ||
    lower.includes("contador") ||
    lower.includes("contabil") ||
    lower.includes("consultório") ||
    lower.includes("consultorio") ||
    lower.includes("subloca") ||
    lower.includes("plantão") ||
    lower.includes("plantao") ||
    lower.includes("imposto") ||
    lower.includes("congresso") ||
    lower.includes("lúdico") ||
    lower.includes("ludico")
  ) {
    return "pj";
  }

  return "pf";
}

export const CATEGORY_COLORS = {
  "Consultório/Sublocação": "#EC407A",
  "CRM/RQE/SBP": "#26A69A",
  "Congresso & Atualização": "#AB47BC",
  "Brinquedos/Materiais Lúdicos": "#FF7043",
  "Combustível/Plantão": "#CE93D8",
  "Lazer": "#FF4081",
  "Educação": "#7C4DFF",
  "Alimentação": "#FF5252",
  "Transporte": "#448AFF",
  "Presentes": "#E040FB",
  "Lar": "#FFAB40",
  "Beleza": "#F06292",
  "Saúde": "#00BFA5",
  "Viagens": "#00E5FF",
  "Impostos & Contabilidade": "#7E57C2",
  "Contador": "#7E57C2",
  "Mercantil/Mercado": "#FF5252",
  "Lanches": "#FF7043",
  "Outros (Pessoal)": "#9C27B0",
  "Outros (PJ)": "#607D8B",
  "Outros": "#7A7E91"
};

export const CATEGORY_ICONS = {
  "Consultório/Sublocação": "domain",
  "CRM/RQE/SBP": "verified",
  "Congresso & Atualização": "school",
  "Brinquedos/Materiais Lúdicos": "toys",
  "Combustível/Plantão": "local_gas_station",
  "Lazer": "attractions",
  "Educação": "school",
  "Alimentação": "restaurant",
  "Transporte": "directions_car",
  "Presentes": "card_giftcard",
  "Lar": "home",
  "Beleza": "spa",
  "Saúde": "health_and_safety",
  "Viagens": "flight",
  "Impostos & Contabilidade": "calculate",
  "Contador": "calculate",
  "Mercantil/Mercado": "shopping_cart",
  "Lanches": "restaurant",
  "Outros (Pessoal)": "receipt_long",
  "Outros (PJ)": "business",
  "Outros": "receipt_long"
};

export const DEFAULT_WORK_LOCATIONS = [
  "Maternidade Araken",
  "Maternidade Leide Morais",
  "MEJEC",
  "Hospital Infantil Sabará",
  "Maternidade Pro Matre",
  "Hospital Infantil São Lucas",
  "PS Infantil Menino Jesus",
  "Maternidade Santa Joana",
  "Do meu Coração"
];

export const SHIFT_HOSPITAL_SUGGESTIONS = DEFAULT_WORK_LOCATIONS;

export const DEFAULT_WORK_TYPES = [
  "Plantão em Maternidade",
  "Plantão em Hospital",
  "Serviço Público",
  "Clínica",
  "Consultório Particular",
  "Home Care / Domiciliar",
  "Telemedicina",
  "Sobreaviso"
];

export const SHIFT_TYPES = [
  { id: "12h Diurno", label: "12h Diurno", icon: "wb_sunny", hours: 12 },
  { id: "12h Noturno", label: "12h Noturno", icon: "bedtime", hours: 12 },
  { id: "24h Completo", label: "24h Completo", icon: "timelapse", hours: 24 },
  { id: "6h Ambulatório/PS", label: "6h Ambulatório/PS", icon: "schedule", hours: 6 },
  { id: "Sobreaviso", label: "Sobreaviso", icon: "ring_volume", hours: 12 }
];

export const TAX_REGIMES = [
  { id: "pj_simples", label: "PJ Simples Nacional (6%)", name: "Simples Nacional (6%)", rate: 0.06, percentage: 6, description: "Anexo III (~6%)" },
  { id: "pj_presumido", label: "PJ Lucro Presumido (15%)", name: "Lucro Presumido (15%)", rate: 0.15, percentage: 15, description: "Retenção Hospital (~15%)" },
  { id: "pf_rpa", label: "RPA / Pessoa Física (27.5%)", name: "RPA / PF (27.5%)", rate: 0.275, percentage: 27.5, description: "IRRF 27.5% + ISS/INSS" },
  { id: "isento", label: "Direto / Cooperativa (0%)", name: "Direto / Isento (0%)", rate: 0.0, percentage: 0, description: "Sem retenção (100% Líquido)" },
  { id: "custom", label: "Personalizado", name: "Personalizado", rate: null, percentage: null, description: "Alíquota configurada manualmente" }
];

export const CLINICAL_SECTORS = [
  "UTI Neonatal",
  "PS Infantil",
  "Enfermaria Pediátrica",
  "Sala de Parto / Reanimação",
  "Alojamento Conjunto",
  "Ambulatório / Consultório",
  "Outro Setor"
];

/**
 * Calculates hourly rate (R$/h) for a medical shift.
 * @param {number} netValue
 * @param {string} shiftType
 * @returns {number}
 */
export function calculateHourlyRate(netValue, shiftType) {
  const numVal = Number(netValue) || 0;
  if (numVal <= 0) return 0;
  let hours = 12;
  const found = SHIFT_TYPES.find(t => t.id === shiftType);
  if (found && found.hours) {
    hours = found.hours;
  } else if (typeof shiftType === "string") {
    if (shiftType.includes("24h")) hours = 24;
    else if (shiftType.includes("6h")) hours = 6;
    else if (shiftType.toLowerCase().includes("sobreaviso")) hours = 12;
  }
  return hours > 0 ? Math.round(numVal / hours) : 0;
}

export const STORAGE_KEY = "pediatric_chic_finances_v2";

/**
 * Robust date math: Adds months to a YYYY-MM-DD string, clamping days to month-end if needed.
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {number} months
 * @returns {string} 'YYYY-MM-DD'
 */
export function addMonths(dateStr, months) {
  if (!dateStr || typeof dateStr !== "string") {
    throw new Error("Invalid date string provided to addMonths");
  }
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    throw new Error(`Invalid date format '${dateStr}', expected YYYY-MM-DD`);
  }
  const [year, month, day] = parts;
  const targetYear = year + Math.floor((month - 1 + months) / 12);
  const targetMonth = ((month - 1 + months) % 12 + 12) % 12 + 1; // 1-12
  // Days in target month
  const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
  const targetDay = Math.min(day, daysInTargetMonth);

  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
}

/**
 * Calculates the expected payment date based on shiftDate and lag in months (or custom date).
 * @param {string} shiftDate 'YYYY-MM-DD'
 * @param {number} lagMonths
 * @param {string|null} customPaymentDate 'YYYY-MM-DD'
 * @returns {string} 'YYYY-MM-DD'
 */
export function calculateExpectedPaymentDate(shiftDate, lagMonths = 3, customPaymentDate = null) {
  if (customPaymentDate && typeof customPaymentDate === "string" && customPaymentDate.trim() !== "") {
    return customPaymentDate.trim();
  }
  const lag = Number(lagMonths) || 3;
  return addMonths(shiftDate, lag);
}

/**
 * Calculates installments according to pediatric rule:
 * 80% in 60 days (D+60), remaining 20% in 30 days after that (D+90). Total 100% in 90 days.
 * @param {string} shiftDate 'YYYY-MM-DD'
 * @param {number} netValue
 * @param {string|null} customPaymentDate
 * @returns {Array<{number: number, percent: number, dueDate: string, value: number, status: string, paidDate: string|null}>}
 */
export function calculateShiftInstallments(shiftDate, netValue, customPaymentDate = null) {
  const numNet = Number(netValue) || 0;
  if (customPaymentDate && typeof customPaymentDate === "string" && customPaymentDate.trim() !== "") {
    return [
      {
        number: 1,
        percent: 100,
        dueDate: customPaymentDate.trim(),
        value: numNet,
        status: "pending",
        paidDate: null
      }
    ];
  }
  const d60 = addMonths(shiftDate, 2);
  const d90 = addMonths(shiftDate, 3);
  const part1 = Math.round(numNet * 0.80 * 100) / 100;
  const part2 = Math.round((numNet - part1) * 100) / 100;

  return [
    {
      number: 1,
      percent: 80,
      dueDate: d60,
      value: part1,
      status: "pending",
      paidDate: null
    },
    {
      number: 2,
      percent: 20,
      dueDate: d90,
      value: part2,
      status: "pending",
      paidDate: null
    }
  ];
}

/**
 * Formats a Date object to YYYY-MM-DD in local time
 * @param {Date|string} referenceDate
 * @returns {string} YYYY-MM-DD
 */
export function getLocalDateString(referenceDate = new Date()) {
  if (referenceDate instanceof Date) {
    const y = referenceDate.getFullYear();
    const m = String(referenceDate.getMonth() + 1).padStart(2, "0");
    const d = String(referenceDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(referenceDate).slice(0, 10);
}

/**
 * Evaluates the status of a shift based on current reference date.
 * If status is 'received', it stays received.
 * If current date > expectedPaymentDate and status is not received, it is "delayed" (Atrasado).
 * @param {object} shift
 * @param {Date|string} referenceDate
 * @returns {{status: 'pending'|'received'|'delayed', label: string, delayDays: number, isDelayed: boolean}}
 */
export function evaluateShiftStatus(shift, referenceDate = new Date()) {
  const refDateStr = getLocalDateString(referenceDate);

  // If this item is a specific installment (e.g. from cash flow radar)
  if (shift.isInstallment) {
    if (shift.installmentStatus === "received" || shift.status === "received") {
      const paidLabel = shift.paidDate ? `Recebido em ${formatDateBR(shift.paidDate)}` : "Recebido";
      return {
        status: "received",
        label: paidLabel,
        delayDays: 0,
        isDelayed: false
      };
    }
    const dueDateStr = shift.installmentDueDate || shift.expectedPaymentDate;
    if (refDateStr > dueDateStr) {
      const [y1, m1, d1] = refDateStr.split("-").map(Number);
      const [y2, m2, d2] = dueDateStr.split("-").map(Number);
      const utc1 = Date.UTC(y1, m1 - 1, d1);
      const utc2 = Date.UTC(y2, m2 - 1, d2);
      const delayDays = Math.max(1, Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24)));
      return {
        status: "delayed",
        label: `Atrasado (+${delayDays}d)`,
        delayDays,
        isDelayed: true
      };
    }
    const percent = shift.installmentPercent || (shift.installmentNumber === 1 ? 80 : 20);
    const daysLabel = shift.installmentNumber === 1 ? '60 dias' : '90 dias';
    return {
      status: "pending",
      label: `Previsão: ${formatDateBR(dueDateStr)} (${percent}% em ${daysLabel})`,
      delayDays: 0,
      isDelayed: false
    };
  }

  // Full shift evaluation
  if (shift.status === "received" || shift.isPaid === true) {
    const paidLabel = shift.paidDate ? `Recebido em ${formatDateBR(shift.paidDate)}` : "Recebido";
    return {
      status: "received",
      label: paidLabel,
      delayDays: 0,
      isDelayed: false
    };
  }

  // Check if shift has split installments with pending delay
  if (shift.splitPayment && Array.isArray(shift.installments) && shift.installments.length > 0) {
    const allRecv = shift.installments.every(i => i.status === "received");
    if (allRecv) {
      const paidLabel = shift.paidDate ? `Recebido em ${formatDateBR(shift.paidDate)}` : "Recebido";
      return { status: "received", label: paidLabel, delayDays: 0, isDelayed: false };
    }

    // Find earliest overdue pending installment
    const overdueInst = shift.installments.find(i => i.status !== "received" && refDateStr > i.dueDate);
    if (overdueInst) {
      const [y1, m1, d1] = refDateStr.split("-").map(Number);
      const [y2, m2, d2] = overdueInst.dueDate.split("-").map(Number);
      const utc1 = Date.UTC(y1, m1 - 1, d1);
      const utc2 = Date.UTC(y2, m2 - 1, d2);
      const delayDays = Math.max(1, Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24)));
      return {
        status: "delayed",
        label: `Atrasado (+${delayDays}d)`,
        delayDays,
        isDelayed: true
      };
    }

    const anyRecv = shift.installments.some(i => i.status === "received");
    if (anyRecv) {
      const pendingInst = shift.installments.find(i => i.status !== "received");
      return {
        status: "partial",
        label: pendingInst ? `Parcial (restante em ${formatDateBR(pendingInst.dueDate)})` : "Parcial",
        delayDays: 0,
        isDelayed: false
      };
    }

    return {
      status: "pending",
      label: `Previsão: 80% D+60 • 20% D+90`,
      delayDays: 0,
      isDelayed: false
    };
  }

  const expectedStr = shift.expectedPaymentDate;
  if (refDateStr > expectedStr) {
    const [y1, m1, d1] = refDateStr.split("-").map(Number);
    const [y2, m2, d2] = expectedStr.split("-").map(Number);
    const utc1 = Date.UTC(y1, m1 - 1, d1);
    const utc2 = Date.UTC(y2, m2 - 1, d2);
    const delayDays = Math.max(1, Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24)));
    return {
      status: "delayed",
      label: `Atrasado (+${delayDays}d)`,
      delayDays,
      isDelayed: true
    };
  }

  const lagMonths = shift.paymentLagMonths || 3;
  return {
    status: "pending",
    label: `Previsão: ${formatDateBR(expectedStr)} (D+${lagMonths * 30})`,
    delayDays: 0,
    isDelayed: false
  };
}

/**
 * Helper to format date YYYY-MM-DD to DD/MM/YYYY or DD de Mês
 */
export function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function formatMonthYear(monthStr) {
  // '2026-09' -> 'Setembro 2026'
  const [year, month] = monthStr.split("-").map(Number);
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return `${monthNames[month - 1]} ${year}`;
}

export function formatCurrency(val) {
  const num = Number(val) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Clean initial data for a real user starting fresh.
 */
export function getInitialData() {
  return {
    doctorName: DEFAULT_DOCTOR_NAME,
    doctorTitle: DEFAULT_DOCTOR_TITLE,
    doctorCrm: "CRM-SP • Pediatria",
    monthlyBudgetLimit: 10000,
    monthlyIncomeGoal: 25000,
    workLocations: [...DEFAULT_WORK_LOCATIONS],
    workTypes: [...DEFAULT_WORK_TYPES],
    activeWorkTypes: ["Plantão em Maternidade", "Plantão em Hospital", "Serviço Público"],
    customExpenseCategories: [],
    defaultTaxRate: 15,
    fixedSalaries: [],
    shifts: [],
    expenses: [],
    trash: []
  };
}

/**
 * Demonstration sample data for exploration and automated tests.
 */
export function getDemoData() {
  return {
    doctorName: "Dra. Fernanda Ch.",
    doctorTitle: "Pediatria & Neonatologia 🩺✨",
    doctorCrm: "CRM-SP 214.890 • RQE 98.412",
    monthlyBudgetLimit: 12000,
    monthlyIncomeGoal: 25000,
    workLocations: [...DEFAULT_WORK_LOCATIONS],
    workTypes: [...DEFAULT_WORK_TYPES],
    activeWorkTypes: ["Plantão em Maternidade", "Plantão em Hospital", "Serviço Público"],
    customExpenseCategories: [
      { id: "cat_demo_1", name: "Contador", scope: "pj", color: "#7E57C2", icon: "calculate" },
      { id: "cat_demo_2", name: "Mercantil/Mercado", scope: "pf", color: "#FF5252", icon: "restaurant" }
    ],
    defaultTaxRate: 15,
    trash: [],
    fixedSalaries: [
      { id: "s1", description: "Pediatra Consultório", value: 8500, dayOfMonth: 5 }
    ],
    shifts: [
      {
        id: "sh1",
        hospital: "Do meu Coração",
        shiftDate: "2026-06-10",
        shiftType: "12h Noturno",
        sector: "UTI Neonatal",
        grossValue: 2200,
        netValue: 1950,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Escala fixa semanal UTI Neonatal",
        paymentLagMonths: 3, // Padrão D+90
        expectedPaymentDate: "2026-09-10", // Calculado automaticamente
        status: "pending", // "pending" | "received" | "delayed"
        paidDate: null
      },
      {
        id: "sh2",
        hospital: "Hospital Infantil Sabará",
        shiftDate: "2026-06-15",
        shiftType: "12h Diurno",
        sector: "PS Infantil",
        grossValue: 3800,
        netValue: 3230,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Plantão pronto-socorro infantil",
        paymentLagMonths: 3,
        expectedPaymentDate: "2026-09-15",
        status: "pending",
        paidDate: null
      },
      {
        id: "sh3",
        hospital: "Maternidade Pro Matre",
        shiftDate: "2026-05-20",
        shiftType: "24h Completo",
        sector: "Sala de Parto / Reanimação",
        grossValue: 5200,
        netValue: 4420,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Reanimação neonatal e sala de parto",
        paymentLagMonths: 3,
        expectedPaymentDate: "2026-08-20",
        status: "received",
        paidDate: "2026-08-20"
      },
      {
        id: "sh4",
        hospital: "Hospital Infantil São Lucas",
        shiftDate: "2026-07-08",
        shiftType: "12h Diurno",
        sector: "Enfermaria Pediátrica",
        grossValue: 3400,
        netValue: 2890,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Evolução clínica leitos pediátricos",
        paymentLagMonths: 3,
        expectedPaymentDate: "2026-10-08",
        status: "pending",
        paidDate: null
      },
      {
        id: "sh5",
        hospital: "PS Infantil Menino Jesus",
        shiftDate: "2026-07-22",
        shiftType: "12h Noturno",
        sector: "PS Infantil",
        grossValue: 2950,
        netValue: 2500,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Emergências pediátricas",
        paymentLagMonths: 2,
        expectedPaymentDate: "2026-09-22",
        status: "pending",
        paidDate: null
      },
      {
        id: "sh6",
        hospital: "Maternidade Santa Joana",
        shiftDate: "2026-08-05",
        shiftType: "12h Diurno",
        sector: "Alojamento Conjunto",
        grossValue: 3600,
        netValue: 3060,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Triagem e alta neonatal",
        paymentLagMonths: 3,
        expectedPaymentDate: "2026-11-05",
        status: "pending",
        paidDate: null
      },
      {
        id: "sh7",
        hospital: "Hospital Infantil Sabará",
        shiftDate: "2026-09-02",
        shiftType: "12h Diurno",
        sector: "UTI Neonatal",
        grossValue: 3800,
        netValue: 3230,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Plantão diurno UTI",
        paymentLagMonths: 3,
        expectedPaymentDate: "2026-12-02",
        status: "pending",
        paidDate: null
      },
      {
        id: "sh8",
        hospital: "Do meu Coração",
        shiftDate: "2026-09-08",
        shiftType: "12h Noturno",
        sector: "PS Infantil",
        grossValue: 2400,
        netValue: 2040,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Plantão noturno PS",
        paymentLagMonths: 1,
        expectedPaymentDate: "2026-10-08",
        status: "pending",
        paidDate: null
      }
    ],
    expenses: [
      {
        id: "e1",
        description: "Anuidade CRM / SBP",
        category: "CRM/RQE/SBP",
        type: "fixed",
        value: 380,
        dueDate: "2026-06-15",
        isPaid: true
      },
      {
        id: "e2",
        description: "Aluguel Consultório Sublocação",
        category: "Consultório/Sublocação",
        type: "fixed",
        value: 2400,
        dueDate: "2026-09-10",
        isPaid: true
      },
      {
        id: "e3",
        description: "Anuidade CRM-SP (Parcela 09)",
        category: "CRM/RQE/SBP",
        type: "fixed",
        value: 380,
        dueDate: "2026-09-15",
        isPaid: true
      },
      {
        id: "e4",
        description: "Brinquedos, Adesivos & Mimos",
        category: "Brinquedos/Materiais Lúdicos",
        type: "variable",
        value: 290,
        dueDate: "2026-09-18",
        isPaid: false
      },
      {
        id: "e5",
        description: "Combustível & Estacionamento Plantões",
        category: "Combustível/Plantão",
        type: "variable",
        value: 460,
        dueDate: "2026-09-25",
        isPaid: false
      },
      {
        id: "e6",
        description: "Inscrição Congresso Pediatria SBP",
        category: "Congresso & Atualização",
        type: "variable",
        value: 850,
        dueDate: "2026-09-28",
        isPaid: false
      },
      {
        id: "e7",
        description: "Seguro RC Profissional Pediatria",
        category: "Outros",
        type: "fixed",
        value: 320,
        dueDate: "2026-09-05",
        isPaid: true
      }
    ]
  };
}

/**
 * Storage Manager Class
 */
export class PediatricStore {
  constructor(storageKey = STORAGE_KEY, initialData = null) {
    this.storageKey = storageKey;
    this.data = this.load(initialData);
  }

  load(fallbackData = null) {
    if (typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.shifts) && Array.isArray(parsed.expenses)) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn("Could not read localStorage:", err);
      }
    }
    return fallbackData || getInitialData();
  }

  save() {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      } catch (err) {
        console.error("Could not write to localStorage:", err);
      }
    }
  }

  resetToDefault() {
    this.data = getInitialData();
    this.save();
    return this.data;
  }

  loadDemoData() {
    this.data = getDemoData();
    this.save();
    return this.data;
  }

  // --- Shifts Operations ---

  addShift(shift) {
    const lagMonths = Number(shift.paymentLagMonths) || 3;
    const expectedPaymentDate = calculateExpectedPaymentDate(
      shift.shiftDate,
      lagMonths,
      shift.customPaymentDate
    );

    const grossValue = Number(shift.grossValue) || 0;
    const taxRegime = shift.taxRegime || "Simples Nacional (6%)";
    const regLower = String(taxRegime).toLowerCase();
    let defaultRate = 0.15;
    if (regLower.includes("simples")) defaultRate = 0.06;
    else if (regLower.includes("isento") || regLower.includes("direto")) defaultRate = 0.0;
    else if (regLower.includes("rpa") || regLower.includes("física")) defaultRate = 0.275;

    let taxRateVal = shift.taxRate !== undefined ? Number(shift.taxRate) : defaultRate;
    const effectiveDecimalRate = taxRateVal > 1 ? (taxRateVal / 100) : taxRateVal;
    const defaultNet = grossValue * (1 - effectiveDecimalRate);
    const netValue = shift.netValue !== undefined ? Number(shift.netValue) : defaultNet;

    // Pediatric standard formula: 80% in 60 days (D+60) and 20% in 90 days (D+90)
    const isSplit = shift.splitPayment !== false && !shift.customPaymentDate && (!shift.paymentLagMonths || Number(shift.paymentLagMonths) === 3);
    const installments = isSplit
      ? calculateShiftInstallments(shift.shiftDate, netValue, shift.customPaymentDate)
      : (shift.installments || null);

    const newShift = {
      id: shift.id || "sh_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      hospital: shift.hospital.trim(),
      shiftDate: shift.shiftDate,
      shiftType: shift.shiftType || "12h Diurno",
      workType: shift.workType || "Plantão em Maternidade",
      sector: shift.sector || "UTI Neonatal",
      grossValue,
      netValue,
      taxRegime,
      taxRate: taxRateVal,
      notes: shift.notes ? String(shift.notes).trim() : "",
      paymentLagMonths: lagMonths,
      customPaymentDate: shift.customPaymentDate || null,
      expectedPaymentDate,
      splitPayment: isSplit,
      installments,
      status: shift.status || "pending",
      paidDate: shift.paidDate || null
    };

    this.data.shifts.unshift(newShift);
    this.save();
    return newShift;
  }

  updateShift(id, updates) {
    const index = this.data.shifts.findIndex(s => s.id === id);
    if (index === -1) return null;

    const current = this.data.shifts[index];
    const lagMonths = updates.paymentLagMonths !== undefined
      ? Number(updates.paymentLagMonths)
      : current.paymentLagMonths;

    const shiftDate = updates.shiftDate || current.shiftDate;
    const customDate = updates.customPaymentDate !== undefined
      ? updates.customPaymentDate
      : current.customPaymentDate;

    const expectedPaymentDate = calculateExpectedPaymentDate(shiftDate, lagMonths, customDate);
    const netValue = updates.netValue !== undefined ? Number(updates.netValue) : current.netValue;

    const isSplit = updates.splitPayment !== undefined
      ? Boolean(updates.splitPayment)
      : (current.splitPayment !== false && !customDate && (!lagMonths || Number(lagMonths) === 3));

    const installments = isSplit
      ? calculateShiftInstallments(shiftDate, netValue, customDate)
      : (updates.installments || null);

    this.data.shifts[index] = {
      ...current,
      ...updates,
      netValue,
      paymentLagMonths: lagMonths,
      customPaymentDate: customDate,
      expectedPaymentDate,
      splitPayment: isSplit,
      installments: updates.installments || installments
    };

    this.save();
    return this.data.shifts[index];
  }

  deleteShift(id) {
    const shift = this.data.shifts.find(s => s.id === id);
    if (!shift) return false;

    if (!Array.isArray(this.data.trash)) this.data.trash = [];
    this.saveBackup();
    this.data.trash.unshift({
      id: "trash_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      originalId: shift.id,
      itemType: "shift",
      item: JSON.parse(JSON.stringify(shift)),
      deletedAt: new Date().toISOString(),
      label: `Plantão: ${shift.hospital} (${formatDateBR(shift.shiftDate)}) - ${formatCurrency(shift.netValue)}`
    });
    if (this.data.trash.length > 50) this.data.trash.pop();

    this.data.shifts = this.data.shifts.filter(s => s.id !== id);
    this.save();
    return true;
  }

  markShiftAsReceived(id, paidDate = null) {
    const shift = this.data.shifts.find(s => s.id === id);
    if (!shift) return null;

    let dateToday = paidDate || getLocalDateString(new Date());
    shift.status = "received";
    shift.paidDate = dateToday;
    if (Array.isArray(shift.installments)) {
      shift.installments.forEach(inst => {
        inst.status = "received";
        inst.paidDate = inst.paidDate || dateToday;
      });
    }
    this.save();
    return shift;
  }

  toggleShiftInstallment(shiftId, installmentNumber, paidDate = null) {
    const shift = this.data.shifts.find(s => s.id === shiftId);
    if (!shift || !Array.isArray(shift.installments)) return null;

    const inst = shift.installments.find(i => i.number === installmentNumber);
    if (!inst) return null;

    const dateToday = paidDate || getLocalDateString(new Date());
    if (inst.status === "received") {
      inst.status = "pending";
      inst.paidDate = null;
    } else {
      inst.status = "received";
      inst.paidDate = dateToday;
    }

    const allReceived = shift.installments.every(i => i.status === "received");
    const anyReceived = shift.installments.some(i => i.status === "received");
    if (allReceived) {
      shift.status = "received";
      shift.paidDate = dateToday;
    } else if (anyReceived) {
      shift.status = "partial";
      shift.paidDate = null;
    } else {
      shift.status = "pending";
      shift.paidDate = null;
    }

    this.save();
    return shift;
  }

  unmarkShiftAsReceived(id) {
    const shift = this.data.shifts.find(s => s.id === id);
    if (!shift) return null;

    shift.status = "pending";
    shift.paidDate = null;
    if (Array.isArray(shift.installments)) {
      shift.installments.forEach(inst => {
        inst.status = "pending";
        inst.paidDate = null;
      });
    }
    this.save();
    return shift;
  }

  // --- Expenses Operations ---

  addExpense(expense) {
    const category = (expense.category || "Outros").trim();
    const scope = expense.scope || this.getCategoryScope(category);

    // Auto-register custom category if not in standard PF or PJ list
    if (category && !EXPENSE_CATEGORIES_PF.includes(category) && !EXPENSE_CATEGORIES_PJ.includes(category) && category !== "Outros") {
      this.addExpenseCategory({ name: category, scope });
    }

    const newExpense = {
      id: expense.id || "e_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      description: expense.description.trim(),
      category,
      scope, // "pf" (vida pessoal) | "pj" (trabalho/consultório)
      type: expense.type || "variable", // "fixed" | "variable"
      value: Number(expense.value) || 0,
      dueDate: expense.dueDate,
      isPaid: Boolean(expense.isPaid)
    };

    this.data.expenses.unshift(newExpense);
    this.save();
    return newExpense;
  }

  updateExpense(id, updates) {
    const index = this.data.expenses.findIndex(e => e.id === id);
    if (index === -1) return null;

    const cat = updates.category !== undefined ? String(updates.category).trim() : this.data.expenses[index].category;
    const scope = updates.scope !== undefined ? updates.scope : (this.data.expenses[index].scope || this.getCategoryScope(cat));

    // Auto-register custom category if not in standard PF or PJ list
    if (cat && !EXPENSE_CATEGORIES_PF.includes(cat) && !EXPENSE_CATEGORIES_PJ.includes(cat) && cat !== "Outros") {
      this.addExpenseCategory({ name: cat, scope });
    }

    this.data.expenses[index] = {
      ...this.data.expenses[index],
      ...updates,
      category: cat,
      scope,
      value: updates.value !== undefined ? Number(updates.value) : this.data.expenses[index].value
    };

    this.save();
    return this.data.expenses[index];
  }

  deleteExpense(id) {
    const expense = this.data.expenses.find(e => e.id === id);
    if (!expense) return false;

    if (!Array.isArray(this.data.trash)) this.data.trash = [];
    this.saveBackup();
    this.data.trash.unshift({
      id: "trash_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      originalId: expense.id,
      itemType: "expense",
      item: JSON.parse(JSON.stringify(expense)),
      deletedAt: new Date().toISOString(),
      label: `Despesa: ${expense.description} (${formatDateBR(expense.dueDate)}) - ${formatCurrency(expense.value)}`
    });
    if (this.data.trash.length > 50) this.data.trash.pop();

    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
    return true;
  }

  // --- Trash, History & Safety Database Operations ---

  getTrash() {
    return Array.isArray(this.data.trash) ? this.data.trash : [];
  }

  restoreFromTrash(trashId) {
    if (!Array.isArray(this.data.trash) || this.data.trash.length === 0) return null;
    const index = this.data.trash.findIndex(t => t.id === trashId || t.originalId === trashId);
    if (index === -1) return null;

    const entry = this.data.trash.splice(index, 1)[0];
    if (entry.itemType === "shift") {
      this.data.shifts.unshift(entry.item);
    } else if (entry.itemType === "expense") {
      this.data.expenses.unshift(entry.item);
    } else if (entry.itemType === "salary") {
      this.data.fixedSalaries.push(entry.item);
    }
    this.save();
    return entry.item;
  }

  undoLastDelete() {
    if (!Array.isArray(this.data.trash) || this.data.trash.length === 0) return null;
    return this.restoreFromTrash(this.data.trash[0].id);
  }

  emptyTrash() {
    this.data.trash = [];
    this.save();
    return true;
  }

  saveBackup() {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(this.storageKey + "_backup", JSON.stringify(this.data));
      } catch (e) {}
    }
  }

  restoreBackup() {
    if (typeof localStorage !== "undefined") {
      try {
        const backupStr = localStorage.getItem(this.storageKey + "_backup");
        if (backupStr) {
          const parsed = JSON.parse(backupStr);
          if (parsed && Array.isArray(parsed.shifts)) {
            this.data = parsed;
            this.save();
            return true;
          }
        }
      } catch (e) {}
    }
    return false;
  }

  // --- Work Locations Operations ---

  getWorkLocations() {
    const custom = Array.isArray(this.data.workLocations) ? this.data.workLocations : [];
    return Array.from(new Set([...DEFAULT_WORK_LOCATIONS, ...custom]));
  }

  addWorkLocation(name) {
    if (!name || typeof name !== "string" || !name.trim()) return null;
    const trimmed = name.trim();
    if (!Array.isArray(this.data.workLocations)) {
      this.data.workLocations = [...DEFAULT_WORK_LOCATIONS];
    }
    if (!this.data.workLocations.includes(trimmed)) {
      this.data.workLocations.push(trimmed);
      this.save();
    }
    return trimmed;
  }

  deleteWorkLocation(name) {
    if (!Array.isArray(this.data.workLocations)) return false;
    this.data.workLocations = this.data.workLocations.filter(loc => loc !== name);
    this.save();
    return true;
  }

  // --- Work Types Operations ---

  getWorkTypes() {
    const custom = Array.isArray(this.data.workTypes) ? this.data.workTypes : [];
    return Array.from(new Set([...DEFAULT_WORK_TYPES, ...custom]));
  }

  getActiveWorkTypes() {
    if (Array.isArray(this.data.activeWorkTypes) && this.data.activeWorkTypes.length > 0) {
      return this.data.activeWorkTypes;
    }
    return ["Plantão em Maternidade", "Plantão em Hospital", "Serviço Público"];
  }

  toggleActiveWorkType(type) {
    if (!Array.isArray(this.data.activeWorkTypes)) {
      this.data.activeWorkTypes = ["Plantão em Maternidade", "Plantão em Hospital", "Serviço Público"];
    }
    const idx = this.data.activeWorkTypes.indexOf(type);
    if (idx > -1) {
      this.data.activeWorkTypes.splice(idx, 1);
    } else {
      this.data.activeWorkTypes.push(type);
    }
    this.save();
    return this.data.activeWorkTypes;
  }

  // --- Expense Categories Operations ---

  getCustomExpenseCategories() {
    return Array.isArray(this.data.customExpenseCategories) ? this.data.customExpenseCategories : [];
  }

  getExpenseCategories(scope = null) {
    const customs = this.getCustomExpenseCategories();
    let baseList = [];
    if (scope === "pf") {
      baseList = [...EXPENSE_CATEGORIES_PF];
      customs.forEach(c => {
        if (c.scope === "pf" && !baseList.includes(c.name)) baseList.push(c.name);
      });
    } else if (scope === "pj") {
      baseList = [...EXPENSE_CATEGORIES_PJ];
      customs.forEach(c => {
        if (c.scope === "pj" && !baseList.includes(c.name)) baseList.push(c.name);
      });
    } else {
      baseList = [...EXPENSE_CATEGORIES];
      customs.forEach(c => {
        if (!baseList.includes(c.name)) baseList.push(c.name);
      });
    }
    return baseList;
  }

  addExpenseCategory(catOrName, maybeScope = "pf", maybeColor = null, maybeIcon = null) {
    let name = "";
    let scope = "pf";
    let color = null;
    let icon = null;

    if (typeof catOrName === "object" && catOrName !== null) {
      name = catOrName.name || "";
      scope = catOrName.scope || "pf";
      color = catOrName.color || null;
      icon = catOrName.icon || null;
    } else if (typeof catOrName === "string") {
      name = catOrName;
      scope = maybeScope || "pf";
      color = maybeColor;
      icon = maybeIcon;
    }

    if (!name || typeof name !== "string" || !name.trim()) return null;
    const trimmedName = name.trim();
    const normalizedScope = String(scope).toLowerCase() === "pj" ? "pj" : "pf";

    if (!Array.isArray(this.data.customExpenseCategories)) {
      this.data.customExpenseCategories = [];
    }

    const existing = this.data.customExpenseCategories.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      existing.scope = normalizedScope;
      if (color) existing.color = color;
      if (icon) existing.icon = icon;
      this.save();
      return existing;
    }

    const newCategory = {
      id: "cat_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      name: trimmedName,
      scope: normalizedScope,
      color: color || (normalizedScope === "pj" ? "#006A62" : "#B80F55"),
      icon: icon || (normalizedScope === "pj" ? "business" : "sell")
    };

    this.data.customExpenseCategories.push(newCategory);
    this.save();
    return newCategory;
  }

  updateExpenseCategory(idOrName, updates) {
    if (!idOrName || !updates) return null;
    if (!Array.isArray(this.data.customExpenseCategories)) {
      this.data.customExpenseCategories = [];
    }
    let target = this.data.customExpenseCategories.find(
      c => c.id === idOrName || c.name.toLowerCase() === String(idOrName).toLowerCase()
    );

    // If target not yet in custom categories (e.g. was standard), register it as custom
    if (!target) {
      const scope = updates.scope || this.getCategoryScope(idOrName);
      target = this.addExpenseCategory({ name: String(idOrName).trim(), scope });
    }
    if (!target) return null;

    const oldName = target.name;
    if (updates.name && typeof updates.name === "string" && updates.name.trim()) {
      target.name = updates.name.trim();
    }
    if (updates.scope) {
      target.scope = String(updates.scope).toLowerCase() === "pj" ? "pj" : "pf";
    }
    if (updates.color) target.color = updates.color;
    if (updates.icon) target.icon = updates.icon;

    // Cascade rename to existing expenses
    if (Array.isArray(this.data.expenses) && oldName !== target.name) {
      this.data.expenses.forEach(exp => {
        if (exp.category && exp.category.toLowerCase() === oldName.toLowerCase()) {
          exp.category = target.name;
          if (updates.scope) exp.scope = target.scope;
        }
      });
    }

    this.save();
    return target;
  }

  deleteExpenseCategory(idOrName) {
    if (!Array.isArray(this.data.customExpenseCategories) || !idOrName) return false;
    const initialLen = this.data.customExpenseCategories.length;
    this.data.customExpenseCategories = this.data.customExpenseCategories.filter(
      c => c.id !== idOrName && c.name.toLowerCase() !== String(idOrName).toLowerCase()
    );
    const removed = this.data.customExpenseCategories.length < initialLen;
    if (removed) {
      this.save();
    }
    return removed;
  }

  getCategoryScope(category) {
    if (!category) return "pf";
    const customs = this.getCustomExpenseCategories();
    const found = customs.find(c => c.name.toLowerCase() === String(category).trim().toLowerCase());
    if (found) return found.scope;
    return getCategoryScope(category, customs);
  }

  getCategoryColor(category) {
    if (!category) return "#7A7E91";
    if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
    const customs = this.getCustomExpenseCategories();
    const found = customs.find(c => c.name.toLowerCase() === String(category).trim().toLowerCase());
    if (found && found.color) return found.color;
    const lower = String(category).toLowerCase();
    if (lower.includes("mercado") || lower.includes("mercantil") || lower.includes("compras") || lower.includes("supermercado")) return "#FF5252";
    if (lower.includes("lanche") || lower.includes("comida") || lower.includes("restaurante")) return "#FF7043";
    if (lower.includes("contador") || lower.includes("contabil")) return "#7E57C2";
    if (lower.includes("farmacia") || lower.includes("farmácia") || lower.includes("remédio") || lower.includes("medicamento")) return "#00BFA5";
    if (lower.includes("carro") || lower.includes("uber") || lower.includes("combustivel") || lower.includes("combustível")) return "#448AFF";
    if (lower.includes("consultorio") || lower.includes("consultório") || lower.includes("sublocacao") || lower.includes("aluguel")) return "#EC407A";
    const palette = ["#B80F55", "#7E4A8A", "#006A62", "#EC407A", "#26A69A", "#AB47BC", "#FF7043", "#7C4DFF"];
    let hash = 0;
    for (let i = 0; i < category.length; i++) hash = (hash << 5) - hash + category.charCodeAt(i);
    return palette[Math.abs(hash) % palette.length];
  }

  getCategoryIcon(category) {
    if (!category) return "receipt_long";
    if (CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];
    const customs = this.getCustomExpenseCategories();
    const found = customs.find(c => c.name.toLowerCase() === String(category).trim().toLowerCase());
    if (found && found.icon) return found.icon;
    const lower = String(category).toLowerCase();
    if (lower.includes("mercado") || lower.includes("mercantil") || lower.includes("compras") || lower.includes("supermercado")) return "shopping_cart";
    if (lower.includes("lanche") || lower.includes("comida") || lower.includes("restaurante") || lower.includes("alimentacao") || lower.includes("alimentação")) return "restaurant";
    if (lower.includes("contador") || lower.includes("contabil") || lower.includes("imposto")) return "calculate";
    if (lower.includes("farmacia") || lower.includes("farmácia") || lower.includes("remédio") || lower.includes("medicamento")) return "medication";
    if (lower.includes("carro") || lower.includes("uber") || lower.includes("combustivel") || lower.includes("combustível")) return "directions_car";
    if (lower.includes("consultorio") || lower.includes("consultório") || lower.includes("clinica") || lower.includes("clínica")) return "domain";
    if (lower.includes("viagem") || lower.includes("passagem") || lower.includes("hotel")) return "flight";
    if (lower.includes("educacao") || lower.includes("educação") || lower.includes("curso") || lower.includes("congresso")) return "school";
    if (lower.includes("lazer") || lower.includes("cinema") || lower.includes("show")) return "attractions";
    if (lower.includes("presente")) return "card_giftcard";
    if (lower.includes("beleza") || lower.includes("cabelo") || lower.includes("estetica")) return "spa";
    return this.getCategoryScope(category) === "pj" ? "business" : "sell";
  }

  toggleExpensePaid(id) {
    const expense = this.data.expenses.find(e => e.id === id);
    if (!expense) return null;

    expense.isPaid = !expense.isPaid;
    this.save();
    return expense;
  }

  // --- Fixed Salaries Operations ---

  addFixedSalary(salary) {
    const newSalary = {
      id: salary.id || "s_" + Date.now(),
      description: salary.description.trim(),
      value: Number(salary.value) || 0,
      dayOfMonth: Number(salary.dayOfMonth) || 5
    };
    this.data.fixedSalaries.push(newSalary);
    this.save();
    return newSalary;
  }

  updateFixedSalary(id, updates) {
    const index = this.data.fixedSalaries.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.data.fixedSalaries[index] = {
      ...this.data.fixedSalaries[index],
      ...updates
    };
    this.save();
    return this.data.fixedSalaries[index];
  }

  deleteFixedSalary(id) {
    const salary = this.data.fixedSalaries.find(s => s.id === id);
    if (!salary) return false;

    if (!Array.isArray(this.data.trash)) this.data.trash = [];
    this.saveBackup();
    this.data.trash.unshift({
      id: "trash_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      originalId: salary.id,
      itemType: "salary",
      item: JSON.parse(JSON.stringify(salary)),
      deletedAt: new Date().toISOString(),
      label: `Salário: ${salary.description} - ${formatCurrency(salary.value)}`
    });
    if (this.data.trash.length > 50) this.data.trash.pop();

    this.data.fixedSalaries = this.data.fixedSalaries.filter(s => s.id !== id);
    this.save();
    return true;
  }

  upsertFixedSalary(salary) {
    if (salary.id) {
      const existing = this.data.fixedSalaries.find(s => s.id === salary.id);
      if (existing) {
        return this.updateFixedSalary(salary.id, salary);
      }
    }
    if (this.data.fixedSalaries.length >= 1) {
      return this.updateFixedSalary(this.data.fixedSalaries[0].id, salary);
    }
    return this.addFixedSalary(salary);
  }

  // --- Calculations Engine ---

  /**
   * Comprehensive financial summary for a selected month (YYYY-MM).
   * Calculates both [Regime de Caixa] and [Regime de Competência].
   * @param {string} monthStr 'YYYY-MM'
   * @param {Date|string} referenceDate (default: current system date)
   */
  getMonthlyReport(monthStr, referenceDate = new Date()) {
    const refDate = referenceDate instanceof Date
      ? referenceDate
      : new Date(String(referenceDate) + "T00:00:00");

    // Fixed Salaries
    const fixedSalariesTotal = this.data.fixedSalaries.reduce((acc, s) => acc + (Number(s.value) || 0), 0);

    // Evaluated Shifts
    const evaluatedShifts = this.data.shifts.map(s => {
      const evaluation = evaluateShiftStatus(s, refDate);
      return {
        ...s,
        currentStatus: evaluation.status,
        statusLabel: evaluation.label,
        delayDays: evaluation.delayDays,
        isDelayed: evaluation.isDelayed
      };
    });

    // 1. REGIME DE CAIXA
    // Inflow: Fixed salary for this month + shifts realized in cash during this month.
    // If a shift uses the 80/20 formula, installments are attributed to D+60 and D+90 respectively!
    const cashShifts = [];
    let cashShiftsTotalNet = 0;
    let cashShiftsReceivedNet = 0;
    let cashShiftsPendingNet = 0;
    let cashShiftsDelayedNet = 0;
    const refDateStr = getLocalDateString(refDate);

    evaluatedShifts.forEach(s => {
      if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
        s.installments.forEach(inst => {
          const instCashMonth = (inst.status === "received" && inst.paidDate)
            ? inst.paidDate.slice(0, 7)
            : inst.dueDate.slice(0, 7);

          if (instCashMonth === monthStr) {
            const isInstDelayed = inst.status !== "received" && refDateStr > inst.dueDate;
            const instVal = Number(inst.value) || 0;
            cashShiftsTotalNet += instVal;
            if (inst.status === "received") {
              cashShiftsReceivedNet += instVal;
            } else if (isInstDelayed) {
              cashShiftsDelayedNet += instVal;
              cashShiftsPendingNet += instVal;
            } else {
              cashShiftsPendingNet += instVal;
            }
            cashShifts.push({
              ...s,
              isInstallment: true,
              installmentNumber: inst.number,
              installmentPercent: inst.percent,
              installmentValue: instVal,
              installmentDueDate: inst.dueDate,
              installmentStatus: inst.status,
              isDelayed: isInstDelayed,
              netValue: instVal
            });
          }
        });
      } else {
        const cashMonth = (s.currentStatus === "received" && s.paidDate)
          ? s.paidDate.slice(0, 7)
          : s.expectedPaymentDate.slice(0, 7);

        if (cashMonth === monthStr) {
          const sVal = Number(s.netValue) || 0;
          cashShiftsTotalNet += sVal;
          if (s.currentStatus === "received") {
            cashShiftsReceivedNet += sVal;
          } else if (s.currentStatus === "delayed") {
            cashShiftsDelayedNet += sVal;
            cashShiftsPendingNet += sVal;
          } else {
            cashShiftsPendingNet += sVal;
          }
          cashShifts.push(s);
        }
      }
    });

    const cashTotalInflow = fixedSalariesTotal + cashShiftsTotalNet;
    const cashRealizedInflow = fixedSalariesTotal + cashShiftsReceivedNet;

    // Expenses in Cash: due in this month
    const cashExpenses = this.data.expenses.filter(e => e.dueDate.startsWith(monthStr));
    const cashExpensesTotal = cashExpenses.reduce((acc, e) => acc + (Number(e.value) || 0), 0);
    const cashExpensesPaid = cashExpenses
      .filter(e => e.isPaid)
      .reduce((acc, e) => acc + (Number(e.value) || 0), 0);
    const cashExpensesPending = cashExpenses
      .filter(e => !e.isPaid)
      .reduce((acc, e) => acc + (Number(e.value) || 0), 0);

    const cashNetBalance = cashTotalInflow - cashExpensesTotal;
    const cashRealizedNetBalance = cashRealizedInflow - cashExpensesPaid;

    // 2. REGIME DE COMPETÊNCIA
    // Production: Fixed salary + shifts worked in this month (shiftDate starts with monthStr)
    const accrualShifts = evaluatedShifts.filter(s => s.shiftDate.startsWith(monthStr));
    const accrualGrossProduction = accrualShifts.reduce((acc, s) => acc + (Number(s.grossValue) || 0), 0);
    const accrualNetProduction = accrualShifts.reduce((acc, s) => acc + (Number(s.netValue) || 0), 0);
    const accrualTotalProductionNet = fixedSalariesTotal + accrualNetProduction;
    const accrualTotalProductionGross = fixedSalariesTotal + accrualGrossProduction;

    // Accrual Expenses: attributed to this month
    const accrualExpensesTotal = cashExpensesTotal;
    const accrualNetBalance = accrualTotalProductionNet - accrualExpensesTotal;

    // Expense breakdown by category for this month
    const expensesByCategory = {};
    const availableCategories = this.getExpenseCategories();
    availableCategories.forEach(cat => {
      expensesByCategory[cat] = 0;
    });
    cashExpenses.forEach(e => {
      const cat = e.category || "Outros";
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (Number(e.value) || 0);
    });

    let cashExpensesPF = 0;
    let cashExpensesPJ = 0;
    cashExpenses.forEach(e => {
      const scope = e.scope || this.getCategoryScope(e.category);
      if (scope === "pf") cashExpensesPF += (Number(e.value) || 0);
      else cashExpensesPJ += (Number(e.value) || 0);
    });

    const categoryBreakdown = Object.entries(expensesByCategory).map(([category, amount]) => {
      const percentage = cashExpensesTotal > 0 ? (amount / cashExpensesTotal) * 100 : 0;
      const scope = this.getCategoryScope(category);
      return {
        category,
        scope,
        amount,
        percentage: Number(percentage.toFixed(1)),
        color: this.getCategoryColor(category),
        icon: this.getCategoryIcon(category)
      };
    }).filter(c => c.amount > 0);

    // Goals & Workload Metrics
    const monthlyIncomeGoal = Number(this.data.monthlyIncomeGoal) || 25000;
    const goalProgressPercent = monthlyIncomeGoal > 0
      ? Number(((cashTotalInflow / monthlyIncomeGoal) * 100).toFixed(1))
      : 0;
    const remainingToGoal = Math.max(0, monthlyIncomeGoal - cashTotalInflow);
    const approxShiftsToGoal = Math.max(0, Math.ceil(remainingToGoal / 2800));

    const totalHoursWorked = accrualShifts.reduce((acc, s) => {
      const typeObj = SHIFT_TYPES.find(t => t.id === s.shiftType);
      return acc + ((typeObj && typeObj.hours) ? typeObj.hours : 12);
    }, 0);
    const averageHourlyRate = totalHoursWorked > 0 ? (accrualNetProduction / totalHoursWorked) : 0;

    return {
      monthStr,
      referenceDate: refDate,
      fixedSalariesTotal,
      caixa: {
        totalInflow: cashTotalInflow,
        realizedInflow: cashRealizedInflow,
        shiftsTotalNet: cashShiftsTotalNet,
        shiftsReceivedNet: cashShiftsReceivedNet,
        shiftsPendingNet: cashShiftsPendingNet,
        shiftsDelayedNet: cashShiftsDelayedNet,
        shiftsList: cashShifts,
        expensesTotal: cashExpensesTotal,
        expensesPaid: cashExpensesPaid,
        expensesPending: cashExpensesPending,
        netBalance: cashNetBalance,
        realizedNetBalance: cashRealizedNetBalance
      },
      competencia: {
        totalProductionGross: accrualTotalProductionGross,
        totalProductionNet: accrualTotalProductionNet,
        shiftsGrossProduction: accrualGrossProduction,
        shiftsNetProduction: accrualNetProduction,
        shiftsCount: accrualShifts.length,
        shiftsList: accrualShifts,
        expensesTotal: accrualExpensesTotal,
        netBalance: accrualNetBalance
      },
      goals: {
        target: monthlyIncomeGoal,
        achieved: cashTotalInflow,
        percent: goalProgressPercent,
        remaining: remainingToGoal,
        approxShiftsNeeded: approxShiftsToGoal
      },
      workload: {
        totalHours: totalHoursWorked,
        averageHourlyRate: Math.round(averageHourlyRate)
      },
      expenses: {
        list: cashExpenses,
        total: cashExpensesTotal,
        paid: cashExpensesPaid,
        pending: cashExpensesPending,
        totalPF: cashExpensesPF,
        totalPJ: cashExpensesPJ,
        pfPercent: cashExpensesTotal > 0 ? Number(((cashExpensesPF / cashExpensesTotal) * 100).toFixed(1)) : 0,
        pjPercent: cashExpensesTotal > 0 ? Number(((cashExpensesPJ / cashExpensesTotal) * 100).toFixed(1)) : 0,
        categoryBreakdown,
        budgetLimit: this.data.monthlyBudgetLimit || 12000,
        budgetUsagePercent: cashExpensesTotal > 0
          ? Number(((cashExpensesTotal / (this.data.monthlyBudgetLimit || 12000)) * 100).toFixed(1))
          : 0
      }
    };
  }

  /**
   * Forecast for the next N months (default: 4 months) starting from startMonthStr.
   * Visualizes expected cash inflow from shifts and salaries.
   * @param {string} startMonthStr 'YYYY-MM'
   * @param {number} monthCount
   * @returns {Array<{monthStr: string, label: string, shiftInflow: number, salaryInflow: number, totalInflow: number, receivedAmount: number, pendingAmount: number}>}
   */
  getShiftInflowForecast(startMonthStr, monthCount = 4) {
    const result = [];
    const [startYear, startMonth] = startMonthStr.split("-").map(Number);

    for (let i = 0; i < monthCount; i++) {
      const targetYear = startYear + Math.floor((startMonth - 1 + i) / 12);
      const targetMonth = ((startMonth - 1 + i) % 12) + 1;
      const mStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

      const fixedSalary = this.data.fixedSalaries.reduce((acc, s) => acc + (Number(s.value) || 0), 0);

      // Shifts whose expectedPaymentDate is in mStr
      let shiftInflow = 0;
      let receivedAmount = 0;
      let pendingAmount = 0;

      this.data.shifts.forEach(s => {
        if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
          s.installments.forEach(inst => {
            const payMonth = (inst.status === "received" && inst.paidDate)
              ? inst.paidDate.slice(0, 7)
              : inst.dueDate.slice(0, 7);

            if (payMonth === mStr) {
              const val = Number(inst.value) || 0;
              shiftInflow += val;
              if (inst.status === "received") {
                receivedAmount += val;
              } else {
                pendingAmount += val;
              }
            }
          });
        } else {
          const payMonth = (s.status === "received" && s.paidDate)
            ? s.paidDate.slice(0, 7)
            : s.expectedPaymentDate.slice(0, 7);

          if (payMonth === mStr) {
            const val = Number(s.netValue) || 0;
            shiftInflow += val;
            if (s.status === "received") {
              receivedAmount += val;
            } else {
              pendingAmount += val;
            }
          }
        }
      });

      const monthNamesShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      result.push({
        monthStr: mStr,
        label: `${monthNamesShort[targetMonth - 1]}/${String(targetYear).slice(2)}`,
        fullLabel: `${monthNamesShort[targetMonth - 1]} ${targetYear}`,
        shiftInflow,
        salaryInflow: fixedSalary,
        totalInflow: shiftInflow + fixedSalary,
        receivedAmount,
        pendingAmount
      });
    }

    return result;
  }

  /**
   * Summary of all pending shifts grouped by D+30, D+60, D+90, and delayed.
   */
  getLiquidityRadarSummary(referenceDate = new Date()) {
    const refDate = referenceDate instanceof Date
      ? referenceDate
      : new Date(String(referenceDate) + "T00:00:00");
    const refDateStr = getLocalDateString(refDate);

    let totalPending = 0;
    let totalDelayed = 0;
    let countPending = 0;
    let countDelayed = 0;
    let d30Sum = 0;
    let d60Sum = 0;
    let d90Sum = 0;

    this.data.shifts.forEach(s => {
      if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
        s.installments.forEach(inst => {
          const val = Number(inst.value) || 0;
          if (inst.status !== "received") {
            if (refDateStr > inst.dueDate) {
              totalDelayed += val;
              countDelayed++;
            } else {
              totalPending += val;
              countPending++;
              if (inst.percent === 80) d60Sum += val;
              else d90Sum += val;
            }
          }
        });
      } else {
        const ev = evaluateShiftStatus(s, refDate);
        if (ev.status === "delayed") {
          totalDelayed += Number(s.netValue) || 0;
          countDelayed++;
        } else if (ev.status === "pending") {
          const val = Number(s.netValue) || 0;
          totalPending += val;
          countPending++;
          if (s.paymentLagMonths === 1) d30Sum += val;
          else if (s.paymentLagMonths === 2) d60Sum += val;
          else d90Sum += val;
        }
      }
    });

    return {
      totalPending,
      totalDelayed,
      countPending,
      countDelayed,
      d30Sum,
      d60Sum,
      d90Sum,
      totalToReceive: totalPending + totalDelayed,
      totalCount: countPending + countDelayed
    };
  }

  /**
   * Calculates Month-over-Month (MoM) expense variation comparing current month to previous month.
   * @param {string} monthStr 'YYYY-MM'
   * @param {string|null} scopeFilter 'pf' | 'pj' | 'fixa' | 'variavel' | null
   * @returns {object}
   */
  getMonthOverMonthExpenseVariation(monthStr, scopeFilter = null) {
    const [y, m] = monthStr.split("-").map(Number);
    const prevMonthDate = new Date(y, m - 2, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonthNum = prevMonthDate.getMonth() + 1;
    const prevMonthStr = `${prevYear}-${String(prevMonthNum).padStart(2, "0")}`;

    let currentExpenses = this.data.expenses.filter(e => e.dueDate.startsWith(monthStr));
    let prevExpenses = this.data.expenses.filter(e => e.dueDate.startsWith(prevMonthStr));

    if (scopeFilter && scopeFilter !== "all") {
      if (scopeFilter === "pf" || scopeFilter === "pj") {
        currentExpenses = currentExpenses.filter(e => (e.scope || getCategoryScope(e.category)) === scopeFilter);
        prevExpenses = prevExpenses.filter(e => (e.scope || getCategoryScope(e.category)) === scopeFilter);
      } else if (scopeFilter === "fixa") {
        currentExpenses = currentExpenses.filter(e => e.type === "fixed");
        prevExpenses = prevExpenses.filter(e => e.type === "fixed");
      } else if (scopeFilter === "variavel") {
        currentExpenses = currentExpenses.filter(e => e.type === "variable");
        prevExpenses = prevExpenses.filter(e => e.type === "variable");
      }
    }

    const currentTotal = currentExpenses.reduce((sum, e) => sum + (Number(e.value) || 0), 0);
    const prevTotal = prevExpenses.reduce((sum, e) => sum + (Number(e.value) || 0), 0);

    const diffValue = currentTotal - prevTotal;
    const diffPercent = prevTotal > 0
      ? Number(((diffValue / prevTotal) * 100).toFixed(1))
      : (currentTotal > 0 ? 100 : 0);

    let currentPF = 0;
    let currentPJ = 0;
    currentExpenses.forEach(e => {
      const scope = e.scope || this.getCategoryScope(e.category);
      if (scope === "pf") currentPF += (Number(e.value) || 0);
      else currentPJ += (Number(e.value) || 0);
    });

    let prevPF = 0;
    let prevPJ = 0;
    prevExpenses.forEach(e => {
      const scope = e.scope || this.getCategoryScope(e.category);
      if (scope === "pf") prevPF += (Number(e.value) || 0);
      else prevPJ += (Number(e.value) || 0);
    });

    let categoriesList = this.getExpenseCategories(scopeFilter);
    const catSet = new Set(categoriesList);
    currentExpenses.forEach(e => {
      const s = e.scope || this.getCategoryScope(e.category);
      if (!scopeFilter || scopeFilter === "all" || s === scopeFilter) {
        if (e.category) catSet.add(e.category);
      }
    });
    prevExpenses.forEach(e => {
      const s = e.scope || this.getCategoryScope(e.category);
      if (!scopeFilter || scopeFilter === "all" || s === scopeFilter) {
        if (e.category) catSet.add(e.category);
      }
    });
    categoriesList = Array.from(catSet);

    const categoryComparison = categoriesList.map(cat => {
      const curCat = currentExpenses.filter(e => e.category === cat).reduce((s, e) => s + (Number(e.value) || 0), 0);
      const prevCat = prevExpenses.filter(e => e.category === cat).reduce((s, e) => s + (Number(e.value) || 0), 0);
      const catDiff = curCat - prevCat;
      const catPercent = prevCat > 0
        ? Number(((catDiff / prevCat) * 100).toFixed(1))
        : (curCat > 0 ? 100 : 0);
      const scope = this.getCategoryScope(cat);

      return {
        category: cat,
        scope,
        currentAmount: curCat,
        previousAmount: prevCat,
        diffValue: catDiff,
        diffPercent: catPercent,
        color: this.getCategoryColor(cat),
        icon: this.getCategoryIcon(cat)
      };
    }).filter(c => c.currentAmount > 0 || c.previousAmount > 0);

    return {
      currentMonthStr: monthStr,
      prevMonthStr,
      currentTotal,
      prevTotal,
      diffValue,
      diffPercent,
      isIncrease: diffValue > 0,
      currentPF,
      currentPJ,
      prevPF,
      prevPJ,
      pfPercent: currentTotal > 0 ? Number(((currentPF / currentTotal) * 100).toFixed(1)) : 0,
      pjPercent: currentTotal > 0 ? Number(((currentPJ / currentTotal) * 100).toFixed(1)) : 0,
      categoryComparison
    };
  }

  /**
   * Duplicates a shift (e.g. for recurring weekly or bi-weekly shifts).
   * @param {string} id
   * @param {string|null} newDate 'YYYY-MM-DD' (defaults to +7 days)
   * @returns {object|null}
   */
  duplicateShift(id, newDate = null) {
    const shift = this.data.shifts.find(s => s.id === id);
    if (!shift) return null;

    let targetDate = newDate;
    if (!targetDate) {
      const [y, m, d] = shift.shiftDate.split("-").map(Number);
      const originalDate = new Date(y, m - 1, d);
      originalDate.setDate(originalDate.getDate() + 7);
      targetDate = getLocalDateString(originalDate);
    }

    const duplicated = this.addShift({
      hospital: shift.hospital,
      shiftDate: targetDate,
      shiftType: shift.shiftType,
      sector: shift.sector || "UTI Neonatal",
      grossValue: shift.grossValue,
      netValue: shift.netValue,
      taxRegime: shift.taxRegime || "pj_presumido",
      taxRate: shift.taxRate !== undefined ? shift.taxRate : 0.15,
      notes: shift.notes || "",
      paymentLagMonths: shift.paymentLagMonths,
      customPaymentDate: null, // Reset manual date on recurring clone
      status: "pending",
      paidDate: null
    });

    return duplicated;
  }

  /**
   * Duplicates an expense to the next month.
   * @param {string} id
   * @param {string|null} newDueDate 'YYYY-MM-DD' (defaults to +1 month)
   * @returns {object|null}
   */
  duplicateExpense(id, newDueDate = null) {
    const expense = this.data.expenses.find(e => e.id === id);
    if (!expense) return null;

    const targetDueDate = newDueDate || addMonths(expense.dueDate, 1);

    const duplicated = this.addExpense({
      description: expense.description,
      category: expense.category,
      type: expense.type,
      value: expense.value,
      dueDate: targetDueDate,
      isPaid: false
    });

    return duplicated;
  }

  /**
   * Updates doctor settings and preferences.
   * @param {object} profile
   */
  updateDoctorProfile(profile = {}) {
    if (profile.doctorName) this.data.doctorName = profile.doctorName.trim();
    if (profile.doctorTitle) this.data.doctorTitle = profile.doctorTitle.trim();
    if (profile.doctorCrm) this.data.doctorCrm = profile.doctorCrm.trim();
    if (profile.monthlyBudgetLimit !== undefined) {
      this.data.monthlyBudgetLimit = Number(profile.monthlyBudgetLimit) || 12000;
    }
    if (profile.monthlyIncomeGoal !== undefined) {
      this.data.monthlyIncomeGoal = Number(profile.monthlyIncomeGoal) || 25000;
    }
    this.save();
    return this.data;
  }

  /**
   * Hospital analytics: profitability (R$/h), volume, and payment delay rate
   */
  getHospitalAnalytics() {
    const map = {};
    this.data.shifts.forEach(s => {
      if (!map[s.hospital]) {
        map[s.hospital] = {
          hospital: s.hospital,
          totalGross: 0,
          totalNet: 0,
          totalHours: 0,
          shiftCount: 0,
          receivedCount: 0,
          delayedCount: 0,
          pendingCount: 0
        };
      }
      const entry = map[s.hospital];
      entry.totalGross += (Number(s.grossValue) || 0);
      entry.totalNet += (Number(s.netValue) || 0);

      let hours = 12;
      const foundType = SHIFT_TYPES.find(t => t.id === s.shiftType);
      if (foundType && foundType.hours) {
        hours = foundType.hours;
      } else if (typeof s.shiftType === "string") {
        if (s.shiftType.includes("24h")) hours = 24;
        else if (s.shiftType.includes("6h")) hours = 6;
      }
      entry.totalHours += hours;
      entry.shiftCount += 1;

      const ev = evaluateShiftStatus(s, new Date());
      const isLate = (s.paidDate && s.paidDate > s.expectedPaymentDate) || ev.status === "delayed";
      if (s.isPaid || ev.status === "received") entry.receivedCount++;
      if (isLate) entry.delayedCount++;
      else if (!s.isPaid) entry.pendingCount++;
    });

    return Object.values(map).map(h => {
      const avgRate = h.totalHours > 0 ? Math.round(h.totalNet / h.totalHours) : 0;
      const punctuality = h.shiftCount > 0 ? Math.round(((h.shiftCount - h.delayedCount) / h.shiftCount) * 100) : 100;
      return {
        ...h,
        averageHourlyRate: avgRate,
        hourlyRate: avgRate,
        shiftsCount: h.shiftCount,
        punctualityRate: punctuality,
        onTimeRate: punctuality
      };
    }).sort((a, b) => b.averageHourlyRate - a.averageHourlyRate);
  }

  /**
   * Medical Tax Engine: Computes savings of PJ (Simples Nacional ~6%) vs RPA / Autônomo (~27.5% + ISS/INSS)
   * and recommends pro-labore minimum for Fator R (28%).
   * @param {string} monthStr 'YYYY-MM'
   * @returns {object}
   */
  getTaxSavingsSummary(monthStr = null) {
    const mStr = monthStr || getLocalDateString(new Date()).slice(0, 7);
    const report = this.getMonthlyReport(mStr);
    const grossTotal = report.competencia.totalProductionGross;
    const shiftsGross = report.competencia.shiftsGrossProduction;

    // Simples Nacional Anexo III (~6%)
    const simplesRate = 0.06;
    const pjTaxSimples = grossTotal * simplesRate;

    // RPA / Pessoa Física: IRRF 27.5% + ISS/INSS (~27.5% base)
    const rpaRate = 0.275;
    const pfTaxRPA = grossTotal * rpaRate;
    const roundedSimples = Math.round(pjTaxSimples);
    const roundedRPA = Math.round(pfTaxRPA);
    const monthlySavings = Math.max(0, roundedRPA - roundedSimples);
    const annualProjectedSavings = monthlySavings * 12;
    const recommendedProLabore = Math.round(grossTotal * 0.28);

    return {
      monthStr: mStr,
      grossTotal,
      shiftsGross,
      pjTaxSimples: roundedSimples,
      pfTaxRPA: roundedRPA,
      monthlySavings,
      annualProjectedSavings,
      simplesRatePercent: 6,
      rpaRatePercent: 27.5,
      recommendedProLabore,
      savingsPercent: grossTotal > 0 ? Number(((monthlySavings / grossTotal) * 100).toFixed(1)) : 0
    };
  }

  /**
   * Doctor Wellbeing & Shift Fatigue Tracker (inspired by Flo Health, Whitebook & CFM sleep safety)
   * Evaluates consecutive shifts, total hours, and rest balance.
   * @param {string} monthStr 'YYYY-MM'
   * @returns {object}
   */
  getDoctorWellbeingMetrics(monthStr = null) {
    const mStr = monthStr || getLocalDateString(new Date()).slice(0, 7);
    const workedShifts = this.data.shifts
      .filter(s => s.shiftDate.startsWith(mStr))
      .sort((a, b) => a.shiftDate.localeCompare(b.shiftDate));

    let nightShiftsCount = 0;
    let shifts24hCount = 0;
    let totalHours = 0;

    workedShifts.forEach(s => {
      const typeStr = (s.shiftType || "").toLowerCase();
      if (typeStr.includes("noturno")) nightShiftsCount++;
      if (typeStr.includes("24h")) shifts24hCount++;

      const found = SHIFT_TYPES.find(t => t.id === s.shiftType);
      totalHours += (found && found.hours) ? found.hours : (typeStr.includes("24h") ? 24 : 12);
    });

    // Calculate consecutive worked days and consecutive night shifts
    let maxConsecutiveDays = 0;
    let currentConsecutive = 0;
    let consecutiveNightShifts = 0;
    let maxConsecutiveNights = 0;

    for (let i = 0; i < workedShifts.length; i++) {
      const isNight = (workedShifts[i].shiftType || "").toLowerCase().includes("noturno");
      if (i === 0) {
        currentConsecutive = 1;
        consecutiveNightShifts = isNight ? 1 : 0;
      } else {
        const prevDate = new Date(workedShifts[i - 1].shiftDate + "T12:00:00");
        const currDate = new Date(workedShifts[i].shiftDate + "T12:00:00");
        const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
        const prevWasNight = (workedShifts[i - 1].shiftType || "").toLowerCase().includes("noturno");

        if (diffDays === 1) {
          currentConsecutive++;
          if (isNight) {
            consecutiveNightShifts = prevWasNight ? (consecutiveNightShifts + 1) : 1;
          } else {
            consecutiveNightShifts = 0;
          }
        } else if (diffDays === 0) {
          // Multiple shifts on the same day
          if (isNight && !prevWasNight) {
            consecutiveNightShifts = Math.max(1, consecutiveNightShifts);
          }
        } else {
          // diffDays > 1 (rest day in between)
          currentConsecutive = 1;
          consecutiveNightShifts = isNight ? 1 : 0;
        }
      }
      if (currentConsecutive > maxConsecutiveDays) maxConsecutiveDays = currentConsecutive;
      if (consecutiveNightShifts > maxConsecutiveNights) maxConsecutiveNights = consecutiveNightShifts;
    }

    let fatigueLevel = "low";
    let statusBadge = "Ritmo Saudável 🌿";
    let message = "Sua escala está equilibrada. Parabéns por priorizar seu descanso!";

    if (maxConsecutiveNights >= 2 || shifts24hCount >= 3 || totalHours > 60) {
      fatigueLevel = "high";
      statusBadge = "Alerta de Fadiga ⚠️";
      message = "Detectamos múltiplos plantões noturnos ou carga elevada. Lembre-se de reservar momentos de sono reparador e hidratação.";
    } else if (nightShiftsCount >= 4 || totalHours >= 48 || maxConsecutiveDays >= 3) {
      fatigueLevel = "moderate";
      statusBadge = "Atenção ao Descanso 🌸";
      message = "Ritmo moderado a intenso. Aproveite os dias de folga para relaxar e praticar autocuidado.";
    }

    return {
      monthStr: mStr,
      totalShifts: workedShifts.length,
      totalHours,
      nightShiftsCount,
      shifts24hCount,
      maxConsecutiveDays,
      maxConsecutiveNights,
      fatigueLevel,
      statusBadge,
      message,
      averageWeeklyHours: Number((totalHours / 4.3).toFixed(1))
    };
  }

  /**
   * Generates CSV string formatted with UTF-8 BOM for Microsoft Excel compatibility
   * @param {string|null} monthStr
   * @param {object} options { onlyMonth: boolean }
   */
  generateCSV(monthStr = null, options = {}) {
    const mStr = monthStr || getLocalDateString(new Date()).slice(0, 7);
    const report = this.getMonthlyReport(mStr);
    const lines = [];

    // Header metadata
    lines.push(`"EXTRATO FINANCEIRO & PRODUCAO MEDICA - FINANÇAS PEDIATRIA"`);
    lines.push(`"Desenvolvedor:";"${APP_CREATOR.signature}"`);
    lines.push(`"Medica:";"${this.data.doctorName}"`);
    lines.push(`"Especialidade:";"${this.data.doctorTitle}"`);
    lines.push(`"CRM / Registro:";"${this.data.doctorCrm || 'CRM-SP'}"`);
    lines.push(`"Mes de Referencia:";"${formatMonthYear(mStr)}"`);
    lines.push("");

    // Financial Summary (Cleaned semicolons inside quotes)
    lines.push(`"RESUMO FINANCEIRO (REGIME DE CAIXA D+60 / D+90)"`);
    lines.push(`"Total Entradas em Caixa (R$)";"${report.caixa.totalInflow.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Entradas Efetivamente Recebidas (R$)";"${report.caixa.realizedInflow.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Despesas do Mes (R$)";"${report.expenses.total.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Saldo Liquido Previsto (R$)";"${report.caixa.netBalance.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Producao Efetiva Trabalhada (Competencia R$)";"${report.competencia.totalProductionNet.toFixed(2).replace('.', ',')}"`);
    lines.push("");

    const targetShifts = options.onlyMonth
      ? this.data.shifts.filter(s => {
          if (s.shiftDate.startsWith(mStr)) return true;
          if (s.expectedPaymentDate && s.expectedPaymentDate.startsWith(mStr)) return true;
          if (s.paidDate && s.paidDate.startsWith(mStr)) return true;
          if (s.splitPayment && Array.isArray(s.installments)) {
            return s.installments.some(inst =>
              inst.dueDate.startsWith(mStr) || (inst.paidDate && inst.paidDate.startsWith(mStr))
            );
          }
          return false;
        })
      : this.data.shifts;

    const targetExpenses = options.onlyMonth
      ? this.data.expenses.filter(e => e.dueDate.startsWith(mStr))
      : this.data.expenses;

    // Shifts
    lines.push(`"PLANTOES E ESCALAS"`);
    lines.push(`"Data Trabalhada";"Hospital";"Setor";"Escala";"Bruto (R$)";"Liquido (R$)";"Prazo";"Data Vencimento Prevista";"Status";"Data Pagamento";"Observacoes"`);
    const refDate = options.referenceDate || new Date();
    targetShifts.forEach(s => {
      const ev = evaluateShiftStatus(s, refDate);
      let statusLabel = ev.status === 'received' ? 'Recebido' : ev.status === 'delayed' ? 'Em Atraso' : ev.status === 'partial' ? 'Parcial' : 'Pendente';
      let dueLabel = formatDateBR(s.expectedPaymentDate);
      if (s.splitPayment && Array.isArray(s.installments) && options.onlyMonth) {
        const instInMonth = s.installments.find(i => i.dueDate.startsWith(mStr));
        if (instInMonth) {
          const instEv = evaluateShiftStatus({
            ...s,
            isInstallment: true,
            installmentDueDate: instInMonth.dueDate,
            installmentStatus: instInMonth.status,
            paidDate: instInMonth.paidDate
          }, refDate);
          dueLabel = `${formatDateBR(instInMonth.dueDate)} (${instInMonth.percent}%)`;
          statusLabel = instEv.status === 'received' ? 'Recebido' : instEv.status === 'delayed' ? 'Em Atraso' : 'Pendente';
        }
      }
      lines.push([
        `"${formatDateBR(s.shiftDate)}"`,
        `"${s.hospital}"`,
        `"${s.sector || 'UTI Neonatal'}"`,
        `"${s.shiftType}"`,
        `"${Number(s.grossValue || 0).toFixed(2).replace('.', ',')}"`,
        `"${Number(s.netValue || 0).toFixed(2).replace('.', ',')}"`,
        `"${s.splitPayment ? 'D+60 (80%) / D+90 (20%)' : `D+${(s.paymentLagMonths || 3) * 30}`}"`,
        `"${dueLabel}"`,
        `"${statusLabel}"`,
        `"${s.paidDate ? formatDateBR(s.paidDate) : '-'}"`,
        `"${(s.notes || '').replace(/"/g, '""')}"`
      ].join(";"));
    });
    lines.push("");

    // Expenses
    lines.push(`"DESPESAS E CUSTOS OPERACIONAIS"`);
    lines.push(`"Descricao";"Categoria";"Tipo";"Valor (R$)";"Vencimento";"Status"`);
    targetExpenses.forEach(e => {
      lines.push([
        `"${e.description}"`,
        `"${e.category}"`,
        `"${e.type === 'fixed' ? 'Fixa' : 'Variavel'}"`,
        `"${Number(e.value || 0).toFixed(2).replace('.', ',')}"`,
        `"${formatDateBR(e.dueDate)}"`,
        `"${e.isPaid ? 'Paga' : 'A Pagar'}"`
      ].join(";"));
    });

    return "\uFEFF" + lines.join("\r\n");
  }

  /**
   * Returns list of intelligent notifications for the doctor.
   * @param {Date|string} referenceDate
   * @param {string} currentMonthStr 'YYYY-MM'
   */
  getNotifications(referenceDate = new Date(), currentMonthStr = "2026-09") {
    const refDateStr = getLocalDateString(referenceDate);
    const notifications = [];

    // 1. Check Delayed Shifts & Split Installments
    this.data.shifts.forEach(s => {
      if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
        s.installments.forEach(inst => {
          if (inst.status !== "received" && refDateStr > inst.dueDate) {
            const [y1, m1, d1] = refDateStr.split("-").map(Number);
            const [y2, m2, d2] = inst.dueDate.split("-").map(Number);
            const utc1 = Date.UTC(y1, m1 - 1, d1);
            const utc2 = Date.UTC(y2, m2 - 1, d2);
            const delayDays = Math.max(1, Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24)));
            notifications.push({
              id: `delayed_${s.id}_inst_${inst.number}`,
              type: "delayed_shift",
              priority: "high",
              icon: "warning",
              color: "#FF7043",
              title: `Repasse Atrasado: ${s.hospital} (${inst.number}ª Parcela - ${inst.percent}%)`,
              message: `O valor de ${formatCurrency(inst.value)} venceu em ${formatDateBR(inst.dueDate)} (Atrasado +${delayDays}d).`,
              actionLabel: "Cobrar Faturamento",
              data: { ...s, installment: inst }
            });
          }
        });
      } else {
        const ev = evaluateShiftStatus(s, referenceDate);
        if (ev.status === "delayed") {
          notifications.push({
            id: `delayed_${s.id}`,
            type: "delayed_shift",
            priority: "high",
            icon: "warning",
            color: "#FF7043",
            title: `Repasse Atrasado: ${s.hospital}`,
            message: `O valor de ${formatCurrency(s.netValue)} venceu em ${formatDateBR(s.expectedPaymentDate)} (${ev.label}).`,
            actionLabel: "Cobrar Faturamento",
            data: s
          });
        }
      }
    });

    // 2. Check Shifts Depositing This Week
    const [ry, rm, rd] = refDateStr.split("-").map(Number);
    const in7Days = new Date(ry, rm - 1, rd + 7);
    const in7DaysStr = getLocalDateString(in7Days);

    this.data.shifts.forEach(s => {
      if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
        s.installments.forEach(inst => {
          if (inst.status === "pending" && inst.dueDate >= refDateStr && inst.dueDate <= in7DaysStr) {
            notifications.push({
              id: `upcoming_${s.id}_inst_${inst.number}`,
              type: "upcoming_shift",
              priority: "normal",
              icon: "schedule",
              color: "#7e4a8a",
              title: `Previsão de Depósito: ${s.hospital} (${inst.number}ª Parcela - ${inst.percent}%)`,
              message: `${formatCurrency(inst.value)} com depósito previsto para ${formatDateBR(inst.dueDate)}.`,
              actionLabel: "Ver Detalhes",
              data: { ...s, installment: inst }
            });
          }
        });
      } else {
        if (s.status === "pending" && s.expectedPaymentDate >= refDateStr && s.expectedPaymentDate <= in7DaysStr) {
          notifications.push({
            id: `upcoming_${s.id}`,
            type: "upcoming_shift",
            priority: "normal",
            icon: "schedule",
            color: "#7e4a8a",
            title: `Previsão de Depósito: ${s.hospital}`,
            message: `${formatCurrency(s.netValue)} com depósito previsto para ${formatDateBR(s.expectedPaymentDate)}.`,
            actionLabel: "Ver Detalhes",
            data: s
          });
        }
      }
    });

    // 3. Check Monthly Budget Status
    const report = this.getMonthlyReport(currentMonthStr, referenceDate);
    if (report.expenses.budgetUsagePercent >= 80) {
      notifications.push({
        id: `budget_${currentMonthStr}`,
        type: "budget_alert",
        priority: report.expenses.budgetUsagePercent >= 100 ? "high" : "normal",
        icon: "pie_chart",
        color: report.expenses.budgetUsagePercent >= 100 ? "#ba1a1a" : "#FF7043",
        title: `Teto de Gastos (${report.expenses.budgetUsagePercent}%)`,
        message: `Você utilizou ${formatCurrency(report.expenses.total)} de ${formatCurrency(report.expenses.budgetLimit)} estipulado.`,
        actionLabel: "Ver Despesas",
        data: report.expenses
      });
    }

    return notifications;
  }
}

// Global instance for convenience
if (typeof window !== "undefined") {
  window.PediatricStore = PediatricStore;
  window.pediatricStoreInstance = new PediatricStore();
}

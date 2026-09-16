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
 * Calculates hourly rate (R$/h) for a medical shift or consultation.
 * @param {number} netValue
 * @param {string} shiftType
 * @param {number|null} explicitHours
 * @returns {number}
 */
export function calculateHourlyRate(netValue, shiftType, explicitHours = null) {
  const numVal = Number(netValue) || 0;
  if (numVal <= 0) return 0;
  if (explicitHours && Number(explicitHours) > 0) {
    return Math.round(numVal / Number(explicitHours));
  }
  let hours = 12;
  const found = SHIFT_TYPES.find(t => t.id === shiftType);
  if (found && found.hours) {
    hours = found.hours;
  } else if (typeof shiftType === "string") {
    const lower = shiftType.toLowerCase();
    if (lower.includes("24h")) hours = 24;
    else if (lower.includes("6h")) hours = 6;
    else if (lower.includes("consulta") || lower.includes("consultório") || lower.includes("consultorio") || lower.includes("puericultura") || lower.includes("atendimento")) hours = 1;
    else if (lower.includes("sobreaviso")) hours = 12;
  }
  return hours > 0 ? Math.round(numVal / hours) : 0;
}

export const STORAGE_KEY = "pediatric_chic_finances_v2";

/**
 * PediatricSanctuaryDB - L2 IndexedDB Persistence Layer
 * Provides asynchronous, high-capacity background storage for receipts,
 * OFX statements, and clinical financial history without blocking the L1 synchronous loop.
 */
export class PediatricSanctuaryDB {
  static dbName = "PediatricSanctuaryDB";
  static dbVersion = 1;
  static storeName = "app_state";

  init() {
    return PediatricSanctuaryDB.getDB();
  }

  saveBackup(key, data) {
    return PediatricSanctuaryDB.save(key, data);
  }

  loadBackup(key) {
    return PediatricSanctuaryDB.load(key);
  }

  static async getDB() {
    if (typeof window === "undefined" || !window.indexedDB) {
      return null;
    }
    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(this.dbName, this.dbVersion);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  static async save(key, data) {
    try {
      const db = await this.getDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        store.put(data, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (err) {
      return false;
    }
  }

  static async load(key) {
    try {
      const db = await this.getDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (err) {
      return null;
    }
  }
}

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
    consultations: [],
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
    ],
    consultations: [
      {
        id: "c1",
        patientName: "Bebê Gael",
        parentName: "Mariana Silva",
        type: "Plano Puericultura 1º Ano",
        date: "2026-08-20",
        durationMinutes: 60,
        grossValue: 450,
        netValue: 450,
        taxRate: 0,
        paymentStatus: "received",
        paymentDate: "2026-08-20",
        ageMonths: 2,
        planInstallment: "2/12",
        notes: "Consulta puericultura 2º mês - ganho ponderal adequado, amamentação exclusiva."
      },
      {
        id: "c2",
        patientName: "Helena Castro",
        parentName: "Rodrigo Castro",
        type: "Consulta Particular",
        date: "2026-10-05",
        durationMinutes: 60,
        grossValue: 400,
        netValue: 400,
        taxRate: 0,
        paymentStatus: "received",
        paymentDate: "2026-10-05",
        ageMonths: 6,
        planInstallment: "Avulsa",
        notes: "Introdução alimentar e orientação nutricional."
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
            if (!Array.isArray(parsed.consultations)) {
              parsed.consultations = [];
            }
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
    // L2 Dual-Engine: Asynchronous IndexedDB background persistence
    if (typeof window !== "undefined" && window.indexedDB) {
      PediatricSanctuaryDB.save(this.storageKey, this.data).catch(() => {});
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
    const index = this.data.trash.findIndex(t => t.id === trashId || t.originalId === trashId || t.trashId === trashId);
    if (index === -1) return null;

    const entry = this.data.trash.splice(index, 1)[0];
    if (entry.itemType === "shift") {
      this.data.shifts.unshift(entry.item);
    } else if (entry.itemType === "expense") {
      this.data.expenses.unshift(entry.item);
    } else if (entry.itemType === "salary") {
      this.data.fixedSalaries.push(entry.item);
    } else if (entry.itemType === "consultation") {
      if (!Array.isArray(this.data.consultations)) this.data.consultations = [];
      this.data.consultations.unshift(entry.item);
    }
    this.save();
    return true;
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

  // --- Consultations & Puericultura Operations (v3.0) ---

  getConsultations(monthStr = null) {
    if (!Array.isArray(this.data.consultations)) {
      this.data.consultations = [];
    }
    if (!monthStr) {
      return [...this.data.consultations];
    }
    return this.data.consultations.filter(c => c.date && c.date.startsWith(monthStr));
  }

  addConsultation(consultation) {
    if (!Array.isArray(this.data.consultations)) {
      this.data.consultations = [];
    }
    const grossValue = Number(consultation.grossValue !== undefined ? consultation.grossValue : (consultation.value || 0)) || 0;
    const taxRate = consultation.taxRate !== undefined ? Number(consultation.taxRate) : 0;
    const netValue = consultation.netValue !== undefined
      ? Number(consultation.netValue)
      : Math.round(grossValue * (1 - (taxRate / 100)) * 100) / 100;
    const date = consultation.date ? String(consultation.date).trim() : getLocalDateString(new Date());
    const durationMinutes = Number(consultation.durationMinutes) || 60;
    const isPaid = consultation.paid === true || consultation.paymentStatus === "received" || consultation.isPaid === true;

    const newConsultation = {
      id: consultation.id || "c_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      patientName: (consultation.patientName || "Bebê sem nome").trim(),
      parentName: (consultation.parentName || "").trim(),
      type: consultation.type || consultation.consultationType || "Plano Puericultura 1º Ano",
      consultationType: consultation.consultationType || consultation.type || "Plano Puericultura 1º Ano",
      date,
      durationMinutes,
      value: grossValue,
      grossValue,
      taxRate,
      netValue,
      paid: isPaid,
      paymentStatus: isPaid ? "received" : (consultation.paymentStatus || "pending"),
      paymentDate: isPaid ? (consultation.paymentDate || date) : null,
      paymentMethod: consultation.paymentMethod || "PIX",
      isPackage: Boolean(consultation.isPackage),
      puericulturaMonth: consultation.puericulturaMonth || null,
      ageMonths: consultation.ageMonths !== undefined && consultation.ageMonths !== null ? Number(consultation.ageMonths) : null,
      planInstallment: consultation.planInstallment || (consultation.type && consultation.type.includes("Puericultura") ? "1/12" : "Avulsa"),
      notes: (consultation.notes || "").trim()
    };

    this.data.consultations.unshift(newConsultation);
    this.save();
    return newConsultation;
  }

  updateConsultation(id, updates) {
    if (!Array.isArray(this.data.consultations)) return null;
    const index = this.data.consultations.findIndex(c => c.id === id);
    if (index === -1) return null;

    const current = this.data.consultations[index];
    const grossValue = updates.grossValue !== undefined
      ? Number(updates.grossValue)
      : (updates.value !== undefined ? Number(updates.value) : current.grossValue);
    const taxRate = updates.taxRate !== undefined ? Number(updates.taxRate) : current.taxRate;
    const netValue = updates.netValue !== undefined
      ? Number(updates.netValue)
      : Math.round(grossValue * (1 - (taxRate / 100)) * 100) / 100;

    this.data.consultations[index] = {
      ...current,
      ...updates,
      grossValue,
      taxRate,
      netValue
    };

    this.save();
    return this.data.consultations[index];
  }

  deleteConsultation(id) {
    if (!Array.isArray(this.data.consultations)) return false;
    const consultation = this.data.consultations.find(c => c.id === id);
    if (!consultation) return false;

    if (!Array.isArray(this.data.trash)) this.data.trash = [];
    this.saveBackup();
    this.data.trash.unshift({
      id: consultation.id,
      trashId: "trash_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      originalId: consultation.id,
      itemType: "consultation",
      item: JSON.parse(JSON.stringify(consultation)),
      deletedAt: new Date().toISOString(),
      label: `Consulta: ${consultation.patientName} (${formatDateBR(consultation.date)}) - ${formatCurrency(consultation.netValue)}`
    });
    if (this.data.trash.length > 50) this.data.trash.pop();

    this.data.consultations = this.data.consultations.filter(c => c.id !== id);
    this.save();
    return true;
  }

  toggleConsultationPaid(id, paidDate = null) {
    if (!Array.isArray(this.data.consultations)) return null;
    const c = this.data.consultations.find(item => item.id === id);
    if (!c) return null;

    const today = paidDate || getLocalDateString(new Date());
    if (c.paymentStatus === "received" || c.paid) {
      c.paymentStatus = "pending";
      c.paid = false;
      c.paymentDate = null;
    } else {
      c.paymentStatus = "received";
      c.paid = true;
      c.paymentDate = today;
    }
    this.save();
    return c;
  }

  getConsultationMetrics(monthStr = null) {
    const mStr = monthStr || getLocalDateString(new Date()).slice(0, 7);
    const monthConsultations = this.getConsultations(mStr);
    const shifts = this.data.shifts.filter(s => s.shiftDate.startsWith(mStr));

    let consultationHours = 0;
    let consultationGross = 0;
    let consultationRevenue = 0;
    let puericulturaActiveCount = 0;

    monthConsultations.forEach(c => {
      const hours = (Number(c.durationMinutes) || 60) / 60;
      consultationHours += hours;
      consultationGross += (Number(c.grossValue) || 0);
      consultationRevenue += (Number(c.netValue) || 0);
      if (c.type && c.type.toLowerCase().includes("puericultura")) {
        puericulturaActiveCount++;
      }
    });

    let shiftHours = 0;
    let shiftRevenue = 0;
    shifts.forEach(s => {
      let h = 12;
      if (s.hours) h = Number(s.hours);
      else if (s.explicitHours) h = Number(s.explicitHours);
      else if (s.durationMinutes) h = Number(s.durationMinutes) / 60;
      else {
        const found = SHIFT_TYPES.find(t => t.id === s.shiftType);
        if (found && found.hours) h = found.hours;
        else if ((s.shiftType || "").includes("24h")) h = 24;
        else if ((s.shiftType || "").includes("6h")) h = 6;
      }
      shiftHours += h;
      shiftRevenue += (Number(s.netValue) || 0);
    });

    const consultationHourlyRate = consultationHours > 0 ? Math.round(consultationRevenue / consultationHours) : 0;
    const shiftHourlyRate = shiftHours > 0 ? Math.round(shiftRevenue / shiftHours) : 0;
    const diff = consultationHourlyRate - shiftHourlyRate;
    const ratio = shiftHourlyRate > 0 ? Number((consultationHourlyRate / shiftHourlyRate).toFixed(2)) : 1;
    const consultationAdvantagePercent = shiftHourlyRate > 0
      ? Math.round(((consultationHourlyRate - shiftHourlyRate) / shiftHourlyRate) * 100)
      : 100;

    return {
      monthStr: mStr,
      totalConsultations: monthConsultations.length,
      consultationsCount: monthConsultations.length,
      puericulturaActiveCount,
      consultationHours: Number(consultationHours.toFixed(1)),
      totalGross: consultationGross,
      consultationGross,
      consultationRevenue,
      consultationHourlyRate,
      shiftHours: Number(shiftHours.toFixed(1)),
      shiftRevenue,
      shiftHourlyRate,
      diff,
      ratio,
      consultationAdvantagePercent,
      isConsultationMoreProfitable: consultationHourlyRate >= shiftHourlyRate
    };
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

      let shiftHours = 0;
      if (s.hours !== undefined && Number(s.hours) > 0) {
        shiftHours = Number(s.hours);
      } else if (s.explicitHours !== undefined && Number(s.explicitHours) > 0) {
        shiftHours = Number(s.explicitHours);
      } else if (s.durationMinutes !== undefined && Number(s.durationMinutes) > 0) {
        shiftHours = Number(s.durationMinutes) / 60;
      } else {
        const found = SHIFT_TYPES.find(t => t.id === s.shiftType);
        if (found && found.hours) {
          shiftHours = found.hours;
        } else if (typeStr.includes("24h")) {
          shiftHours = 24;
        } else if (typeStr.includes("6h")) {
          shiftHours = 6;
        } else if (typeStr.includes("consulta") || typeStr.includes("consultório") || typeStr.includes("consultorio") || typeStr.includes("puericultura") || typeStr.includes("atendimento")) {
          shiftHours = 1; // 1h for office consultations, NEVER 12h/24h
        } else {
          shiftHours = 12;
        }
      }
      totalHours += shiftHours;
    });

    // Consultations in month (do not trigger false night/24h fatigue)
    const monthConsultations = (this.data.consultations || []).filter(c => c.date && c.date.startsWith(mStr));
    let consultationHours = 0;
    monthConsultations.forEach(c => {
      const mins = Number(c.durationMinutes) || 60;
      consultationHours += (mins / 60);
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
      shiftHours: totalHours,
      consultationHours: Number(consultationHours.toFixed(1)),
      totalWorkedHours: Number((totalHours + consultationHours).toFixed(1)),
      consultationsCount: monthConsultations.length,
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

  // ==========================================================================
  // V3.0 ENGINES: 12M ROLLING FORECAST, DRE, FATOR R, FIRE, SBAR, OFX, KIT, VOICE
  // ==========================================================================

  /**
   * 12-Month Rolling Cash Flow Projection with Cumulative Balance and Emergency Reserve Guideline.
   * @param {string|null} startMonthStr 'YYYY-MM'
   */
  get12MonthsRollingProjection(startMonthStr = null) {
    const mStr = startMonthStr || getLocalDateString(new Date()).slice(0, 7);
    const [startYear, startMonth] = mStr.split("-").map(Number);
    const months = [];
    let runningBalance = 0;

    // Estimate average monthly expense over last 3 months
    const mPrev1 = addMonths(mStr + "-01", -1).slice(0, 7);
    const mPrev2 = addMonths(mStr + "-01", -2).slice(0, 7);
    const rCurrent = this.getMonthlyReport(mStr);
    const rPrev1 = this.getMonthlyReport(mPrev1);
    const rPrev2 = this.getMonthlyReport(mPrev2);
    const sumExp = rCurrent.expenses.total + rPrev1.expenses.total + rPrev2.expenses.total;
    const avgMonthlyExpense = sumExp > 0 ? Math.round(sumExp / 3) : (this.data.monthlyBudgetLimit || 12000);
    const emergencyReserve = Math.round(avgMonthlyExpense * 6);

    const monthNamesShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    for (let i = 0; i < 12; i++) {
      const targetYear = startYear + Math.floor((startMonth - 1 + i) / 12);
      const targetMonth = ((startMonth - 1 + i) % 12) + 1;
      const currentMStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

      const fixedSalary = this.data.fixedSalaries.reduce((acc, s) => acc + (Number(s.value) || 0), 0);

      // Shifts inflow for this month
      let shiftInflow = 0;
      let shiftReceived = 0;
      let shiftPending = 0;

      this.data.shifts.forEach(s => {
        if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
          s.installments.forEach(inst => {
            const payMonth = (inst.status === "received" && inst.paidDate)
              ? inst.paidDate.slice(0, 7)
              : inst.dueDate.slice(0, 7);

            if (payMonth === currentMStr) {
              const val = Number(inst.value) || 0;
              shiftInflow += val;
              if (inst.status === "received") shiftReceived += val;
              else shiftPending += val;
            }
          });
        } else {
          const payMonth = (s.status === "received" && s.paidDate)
            ? s.paidDate.slice(0, 7)
            : s.expectedPaymentDate.slice(0, 7);

          if (payMonth === currentMStr) {
            const val = Number(s.netValue) || 0;
            shiftInflow += val;
            if (s.status === "received") shiftReceived += val;
            else shiftPending += val;
          }
        }
      });

      // Consultations inflow for this month
      let consultationInflow = 0;
      if (Array.isArray(this.data.consultations)) {
        this.data.consultations.forEach(c => {
          const cMonth = (c.paymentDate || c.date).slice(0, 7);
          if (cMonth === currentMStr) {
            consultationInflow += (Number(c.netValue) || 0);
          }
        });
      }

      const totalInflow = shiftInflow + fixedSalary + consultationInflow;
      
      // Known expenses or average projection for future months
      const actualMonthExpenses = this.data.expenses
        .filter(e => e.dueDate.startsWith(currentMStr))
        .reduce((sum, e) => sum + (Number(e.value) || 0), 0);
      const expenses = actualMonthExpenses > 0 ? actualMonthExpenses : avgMonthlyExpense;

      const netMonth = totalInflow - expenses;
      runningBalance += netMonth;

      months.push({
        month: currentMStr,
        monthStr: currentMStr,
        label: `${monthNamesShort[targetMonth - 1]}/${String(targetYear).slice(2)}`,
        fullLabel: `${monthNamesShort[targetMonth - 1]} ${targetYear}`,
        shiftInflow,
        salaryInflow: fixedSalary,
        consultationInflow,
        inflow: totalInflow,
        totalInflow,
        expenses,
        expense: expenses,
        net: netMonth,
        netMonth,
        cumulativeBalance: runningBalance,
        emergencyReserve
      });
    }

    return {
      startMonthStr: mStr,
      avgMonthlyExpense,
      emergencyReserve,
      reserveLine6M: emergencyReserve,
      initialCashBalance: 0,
      months
    };
  }

  /**
   * Pediatric DRE (Demonstrativo de Resultado do Exercício)
   * Gross Revenue -> Taxes -> Operating PJ Costs -> Margin -> Pro-Labore -> Personal PF Expenses -> Real Superavit.
   * @param {string|null} periodStr 'YYYY-MM' or 'YYYY'
   */
  getDRE(periodStr = null) {
    const pStr = periodStr || getLocalDateString(new Date()).slice(0, 7);

    let shiftsInPeriod = this.data.shifts.filter(s => s.shiftDate && s.shiftDate.startsWith(pStr));
    let consultationsInPeriod = (this.data.consultations || []).filter(c => c.date && c.date.startsWith(pStr));
    let expensesInPeriod = this.data.expenses.filter(e => (e.dueDate && e.dueDate.startsWith(pStr)) || (e.date && e.date.startsWith(pStr)));

    const grossShifts = shiftsInPeriod.reduce((sum, s) => sum + (Number(s.grossValue) || 0), 0);
    const netShifts = shiftsInPeriod.reduce((sum, s) => sum + (Number(s.netValue) || 0), 0);
    const taxesShifts = Math.max(0, grossShifts - netShifts);

    const grossConsultations = consultationsInPeriod.reduce((sum, c) => sum + (Number(c.grossValue !== undefined ? c.grossValue : c.value) || 0), 0);
    const netConsultations = consultationsInPeriod.reduce((sum, c) => sum + (Number(c.netValue !== undefined ? c.netValue : c.value) || 0), 0);
    const taxesConsultations = Math.max(0, grossConsultations - netConsultations);

    const monthsInPeriod = pStr.length === 4 ? 12 : 1;
    const grossSalaries = this.data.fixedSalaries.reduce((sum, s) => sum + (Number(s.value) || 0), 0) * monthsInPeriod;

    const grossRevenueTotal = grossShifts + grossConsultations + grossSalaries;
    const taxesTotal = taxesShifts + taxesConsultations;
    const netOperationalRevenue = grossRevenueTotal - taxesTotal;

    // PJ Operating Expenses (CRM, RQE, seguros, contabilidade, sublocação)
    let pjExpensesTotal = 0;
    let pfExpensesTotal = 0;
    expensesInPeriod.forEach(e => {
      const scope = e.scope || this.getCategoryScope(e.category);
      if (scope === "pj") pjExpensesTotal += (Number(e.value) || 0);
      else pfExpensesTotal += (Number(e.value) || 0);
    });

    const operationalMarginPJ = netOperationalRevenue - pjExpensesTotal;

    // Recommended Pro-Labore for Fator R compliance (28% of gross)
    const proLabore = Math.round(grossRevenueTotal * 0.28);
    const netDividends = Math.max(0, operationalMarginPJ - proLabore);

    const realSuperavit = operationalMarginPJ - pfExpensesTotal;
    const savingsRate = netOperationalRevenue > 0
      ? Number(((realSuperavit / netOperationalRevenue) * 100).toFixed(1))
      : 0;

    return {
      periodStr: pStr,
      grossRevenue: grossRevenueTotal,
      grossRevenueTotal,
      netRevenue: netOperationalRevenue,
      netOperationalRevenue,
      grossShifts,
      grossConsultations,
      grossSalaries,
      taxes: taxesTotal,
      taxesTotal,
      pjExpenses: pjExpensesTotal,
      pjExpensesTotal,
      pjOperatingExpenses: pjExpensesTotal,
      operationalMarginPJ,
      proLabore,
      netDividends,
      distributableDividends: netDividends,
      pfExpenses: pfExpensesTotal,
      pfExpensesTotal,
      netSurplus: realSuperavit,
      realSuperavit,
      savingsRate
    };
  }

  /**
   * Fator R Dynamic Optimizer (RBT12 vs Folha12) according to Lei Complementar 123/2006.
   * Computes exact rolling 12 months ratio to keep medical PJ in Anexo III (6%) instead of Anexo V (15.5%).
   * @param {Date|string} referenceDate
   */
  getFatorROptimizer(referenceDate = new Date(), options = null) {
    const refDate = referenceDate instanceof Date ? referenceDate : new Date(String(referenceDate) + "T00:00:00");
    const refDateStr = getLocalDateString(refDate);
    const [curYear, curMonth] = refDateStr.slice(0, 7).split("-").map(Number);

    // Sum last 12 months of gross production (RBT12)
    let rbt12 = 0;
    for (let i = 0; i < 12; i++) {
      const targetYear = curYear + Math.floor((curMonth - 1 - i) / 12);
      const targetMonth = ((curMonth - 1 - i) % 12 + 12) % 12 + 1;
      const mStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

      const shiftsGross = this.data.shifts
        .filter(s => s.shiftDate && s.shiftDate.startsWith(mStr))
        .reduce((sum, s) => sum + (Number(s.grossValue) || 0), 0);

      const consultGross = (this.data.consultations || [])
        .filter(c => c.date && c.date.startsWith(mStr))
        .reduce((sum, c) => sum + (Number(c.grossValue !== undefined ? c.grossValue : c.value) || 0), 0);

      const salariesGross = this.data.fixedSalaries
        .reduce((sum, s) => sum + (Number(s.value) || 0), 0);

      rbt12 += (shiftsGross + consultGross + salariesGross);
    }

    // Baseline fallback if real user is starting fresh
    if (rbt12 === 0) {
      rbt12 = 240000; // ~20k/month benchmark
    }

    // Recommended Pro-Labore for exact 28% compliance
    const recommendedMonthlyProLabore = Math.max(1412, Math.round((rbt12 * 0.28) / 12));

    let folha12;
    if (options && typeof options === "object" && options.actualFolha12 !== undefined) {
      folha12 = Number(options.actualFolha12) || 0;
    } else if (options && typeof options === "object" && options.proLabore !== undefined) {
      folha12 = (Number(options.proLabore) || 0) * 12;
    } else {
      folha12 = recommendedMonthlyProLabore * 12;
    }

    const fatorRPercentage = Number(((folha12 / rbt12) * 100).toFixed(1));
    const isAnexoIII = fatorRPercentage >= 28.0;

    // Tax savings comparing Anexo III (6%) vs Anexo V (15.5%)
    const taxAnexoV = Math.round(rbt12 * 0.155);
    const taxAnexoIII = Math.round(rbt12 * 0.06);
    const annualTaxSavings = Math.max(0, taxAnexoV - taxAnexoIII);
    const monthlyTaxSavings = Math.round(annualTaxSavings / 12);

    const recommendation = isAnexoIII
      ? `Sua folha representa ${fatorRPercentage}% do faturamento. Sua PJ está enquadrada com segurança no Anexo III (alíquota inicial de 6%), gerando economia tributária anual de ${formatCurrency(annualTaxSavings)} em comparação ao Anexo V.`
      : `Atenção: sua folha atual representa ${fatorRPercentage}% do faturamento (abaixo do limiar de 28%). Recomendamos ajustar o pró-labore mensal para pelo menos ${formatCurrency(recommendedMonthlyProLabore)} para enquadrar no Anexo III e economizar ${formatCurrency(annualTaxSavings)}/ano.`;

    const optionsList = [
      {
        label: "Mínimo Recomendado (Fator R 28%)",
        proLaboreMonthly: recommendedMonthlyProLabore,
        fatorR: 28.0,
        anexo: "Anexo III",
        taxRate: 0.06,
        isSafe: true
      },
      {
        label: "Salário Mínimo Vigente (Sem Fator R)",
        proLaboreMonthly: 1412,
        fatorR: Number(((1412 * 12 / rbt12) * 100).toFixed(1)),
        anexo: (1412 * 12 / rbt12) >= 0.28 ? "Anexo III" : "Anexo V",
        taxRate: (1412 * 12 / rbt12) >= 0.28 ? 0.06 : 0.155,
        isSafe: (1412 * 12 / rbt12) >= 0.28
      },
      {
        label: "Pró-Labore Conforto (35%)",
        proLaboreMonthly: Math.round((rbt12 * 0.35) / 12),
        fatorR: 35.0,
        anexo: "Anexo III",
        taxRate: 0.06,
        isSafe: true
      }
    ];

    return {
      rbt12,
      folha12,
      fatorRPercentage,
      currentFatorR: fatorRPercentage,
      isAnexoIII,
      meetsThreshold: isAnexoIII,
      anexo: isAnexoIII ? "Anexo III (6%)" : "Anexo V (15.5%)",
      taxRate: isAnexoIII ? 0.06 : 0.155,
      recommendedMonthlyProLabore,
      suggestedProLabore: recommendedMonthlyProLabore,
      annualTaxSavings,
      monthlyTaxSavings,
      anexoIIISavingsPercent: 9.5,
      recommendation,
      options: optionsList
    };
  }

  /**
   * Medical FIRE Simulator & Shift Freedom Thermometer (Termômetro de Liberdade).
   * Calculates how many 12h night shifts the doctor can permanently drop per month.
   * @param {number} currentEquity Accumulated financial investments in R$
   */
  getDoctorFIREMetrics(currentEquity = null) {
    const equity = (currentEquity !== null && currentEquity !== undefined)
      ? (Number(currentEquity) || 0)
      : (Number(this.data.currentEquity) || 0);
    
    // Average monthly living cost (PF + PJ)
    const mStr = getLocalDateString(new Date()).slice(0, 7);
    const dre = this.getDRE(mStr);
    const monthlyCostOfLiving = (dre.pfExpensesTotal + dre.pjExpensesTotal) > 0
      ? (dre.pfExpensesTotal + dre.pjExpensesTotal)
      : (this.data.monthlyBudgetLimit || 12000);
    
    const annualCostOfLiving = monthlyCostOfLiving * 12;
    // 4% Rule / 300x monthly expense
    const fireTarget = monthlyCostOfLiving * 300;
    const progressPercent = fireTarget > 0 ? Number(Math.min(100, (equity / fireTarget) * 100).toFixed(1)) : 0;

    // Real net passive yield estimated at 0.6% per month (approx 7.4% p.a. above inflation)
    const passiveMonthlyIncome = Math.round(equity * 0.006);

    // Standard 12h night shift net yield (~R$ 1.800)
    const avgShiftNet = 1800;
    const shiftsCanDropPerMonth = Math.min(15, Math.floor(passiveMonthlyIncome / avgShiftNet));

    return {
      equity,
      currentSavings: equity,
      monthlyCostOfLiving,
      averageMonthlyExpense: monthlyCostOfLiving,
      annualCostOfLiving,
      fireTarget,
      targetNestEgg: fireTarget,
      progressPercent,
      fireProgressPercent: progressPercent,
      passiveMonthlyIncome,
      monthlyPassiveIncomeTarget: Math.round(fireTarget * 0.006),
      avgShiftNet,
      shiftsCanDropPerMonth,
      shiftsReplacedCount: shiftsCanDropPerMonth,
      freedomBadge: shiftsCanDropPerMonth >= 8
        ? "Independência Quase Completa 🌟"
        : (shiftsCanDropPerMonth >= 3 ? "Liberdade Parcial Conquistada 🌿" : "Fase de Acumulação Inicial 🌱")
    };
  }

  /**
   * SBAR Pediatric Clinical Handoff Formatter (LGPD-Safe).
   * Generates a patient-safe handover note formatted for WhatsApp without sensitive patient IDs.
   * @param {object} shiftOrData
   * @param {object} [options]
   * @returns {string} Formatted WhatsApp-ready string
   */
  generateSBARHandoff(shiftOrData = {}, options = {}) {
    let shift = {};
    let data = {};
    if (options && typeof options === "object" && (options.situation !== undefined || options.anonymizePatient !== undefined || options.doctorName !== undefined)) {
      shift = shiftOrData || {};
      data = options;
    } else {
      data = shiftOrData || {};
      shift = shiftOrData || {};
    }

    const hospital = data.hospital || shift.hospital || "Maternidade / Hospital";
    const sector = data.sector || shift.sector || "UTI Neonatal";
    const doctor = data.doctorName || this.data.doctorName || "Dra. Pediatra";
    const doctorCrm = data.doctorCrm || this.data.doctorCrm || "";
    const date = formatDateBR(data.date || shift.shiftDate || getLocalDateString(new Date()));

    let situation = data.situation || shift.notes || "RN no leito/incubadora, estável sob observação clínica.";
    let background = data.background || "Sem intercorrências graves no plantão.";
    let assessment = data.assessment || "Sinais vitais normais, ventilação espontânea, dieta tolerada.";
    let recommendation = data.recommendation || "Manter condutas, checar exames de rotina.";

    const isAnonymized = data.anonymizePatient !== false;
    if (isAnonymized) {
      situation = situation.replace(/RN de [A-ZÀ-Ú][a-zà-ú]+(\s+[A-ZÀ-Ú][a-zà-ú]+)*/gi, (match) => {
        const parts = match.split(" ");
        if (parts.length >= 3) {
          const initials = parts.slice(2).map(p => p[0].toUpperCase() + ".").join("");
          return `RN de ${initials}`;
        }
        return "RN [Leito]";
      });
      situation = situation.replace(/Maria Silva/g, "M.S.");
    }

    const privacyLine = isAnonymized
      ? `🔒 *Privacidade:* Protocolo LGPD-Safe (Identificação sensível de pacientes ocultada)`
      : `📋 *Identificação:* Paciente nominal autorizado internamente`;

    return [
      `🩺 *PASSAGEM DE PLANTÃO PEDIÁTRICO (SBAR)*`,
      `🏥 *Hospital:* ${hospital} • *Setor:* ${sector}`,
      `📅 *Data:* ${date} • *Médica:* ${doctor}${doctorCrm ? ` (${doctorCrm})` : ""}`,
      `${privacyLine}`,
      `───────────────────────────────`,
      `👶 *S — Situação (Situation):*`,
      `• ${situation}`,
      ``,
      `📜 *B — Histórico & Antecedentes (Background):*`,
      `• ${background}`,
      ``,
      `🔬 *A — Avaliação Atual (Assessment):*`,
      `• ${assessment}`,
      ``,
      `🎯 *R — Recomendações & Pendências (Recommendation):*`,
      `• ${recommendation}`,
      `───────────────────────────────`,
      `✨ _Enviado via Finanças Pediatria v3.0 • LGPD Compliant • Criado por FChNeto_`
    ].join("\n");
  }

  /**
   * Client-side Parser for OFX (Open Financial Exchange) Bank Statements.
   * @param {string} ofxContent
   * @returns {Array<{id: string, date: string, amount: number, memo: string, type: string}>}
   */
  parseOFX(ofxContent) {
    if (!ofxContent || typeof ofxContent !== "string") return [];
    const transactions = [];

    // Match STMTTRN blocks (handles closed and unclosed tags in SGML OFX)
    const trnRegex = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>)|<\/BANKTRANLIST>|$)/gi;
    let match;

    while ((match = trnRegex.exec(ofxContent)) !== null) {
      const block = match[1];
      if (!block.trim()) continue;
      const typeMatch = /<TRNTYPE>([^\r\n<]+)/i.exec(block);
      const dateMatch = /<DTPOSTED>([0-9]{8})/i.exec(block);
      const amtMatch = /<TRNAMT>([+-]?[0-9]*\.?[0-9]+)/i.exec(block);
      const memoMatch = /<MEMO>([^\r\n<]+)/i.exec(block);
      const nameMatch = /<NAME>([^\r\n<]+)/i.exec(block);

      if (amtMatch && dateMatch) {
        const rawDate = dateMatch[1]; // YYYYMMDD
        const formattedDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
        const amount = parseFloat(amtMatch[1]);
        const memo = (memoMatch ? memoMatch[1] : (nameMatch ? nameMatch[1] : (amount >= 0 ? "Depósito" : "Débito"))).trim();
        const type = (typeMatch ? typeMatch[1] : (amount >= 0 ? "CREDIT" : "DEBIT")).toUpperCase().trim();

        if (!isNaN(amount)) {
          transactions.push({
            id: "ofx_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
            date: formattedDate,
            amount: Math.round(amount * 100) / 100,
            memo,
            type
          });
        }
      }
    }

    return transactions;
  }

  /**
   * Client-side Parser for Brazilian Bank CSV Statements (Itaú, Inter, Cora, Nubank).
   * @param {string} csvContent
   * @returns {Array<{id: string, date: string, amount: number, memo: string}>}
   */
  parseBankCSV(csvContent) {
    if (!csvContent || typeof csvContent !== "string") return [];
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    const transactions = [];

    lines.forEach((line, idx) => {
      if (idx === 0 && (line.toLowerCase().includes("data") || line.toLowerCase().includes("valor"))) {
        return; // Header line
      }

      const delimiter = line.includes(";") ? ";" : ",";
      const parts = line.split(delimiter).map(p => p.replace(/^["']|["']$/g, "").trim());
      if (parts.length >= 3) {
        // Attempt to parse Brazilian date DD/MM/YYYY or YYYY-MM-DD
        let date = parts[0];
        if (date.includes("/")) {
          const [d, m, y] = date.split("/");
          if (d && m && y) {
            date = `${y.length === 2 ? "20" + y : y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          }
        }

        const memo = parts[1] || "Crédito em Conta";
        // Parse Brazilian currency format 1.500,00 or 1500.00
        const rawAmt = parts[2].replace(/\./g, "").replace(",", ".");
        const amount = parseFloat(rawAmt);

        if (!isNaN(amount) && date.length === 10) {
          transactions.push({
            id: "csv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
            date,
            amount: Math.round(amount * 100) / 100,
            memo,
            type: amount >= 0 ? "CREDIT" : "DEBIT"
          });
        }
      }
    });

    return transactions;
  }

  /**
   * Client-side Bank Statement Reconciler.
   * Matches statement deposits against pending shift installments (80% D+60 / 20% D+90) and consultations,
   * and matches outflows/debits against registered expenses.
   * @param {Array<{date: string, amount: number, memo: string}>} transactions
   * @param {Date|string} referenceDate
   */
  reconcileBankTransactions(transactions, referenceDate = new Date()) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { matches: [], matchedInflows: [], matchedOutflows: [], unmatched: [], unmatchedBank: [] };
    }

    const matches = [];
    const matchedInflows = [];
    const matchedOutflows = [];
    const unmatched = [];
    const matchedInstallmentKeys = new Set();
    const matchedShiftIds = new Set();
    const matchedExpenseIds = new Set();

    transactions.forEach(tx => {
      let foundMatch = null;

      if (tx.amount > 0) {
        // 1. Check Shift Installments
        for (const s of this.data.shifts) {
          if (s.splitPayment && Array.isArray(s.installments)) {
            for (const inst of s.installments) {
              const instKey = `${s.id}_${inst.number}`;
              if (inst.status !== "received" && !matchedInstallmentKeys.has(instKey)) {
                const diffVal = Math.abs(inst.value - tx.amount);
                if (diffVal <= 1.50) {
                  matchedInstallmentKeys.add(instKey);
                  foundMatch = {
                    type: "shift_installment",
                    confidence: diffVal === 0 ? "exact" : "high",
                    shift: s,
                    installment: inst,
                    transaction: tx,
                    suggestedAction: `Baixar ${inst.number}ª parcela (${inst.percent}%) de ${s.hospital}`
                  };
                  break;
                }
              }
            }
          } else if (s.status !== "received" && !matchedShiftIds.has(s.id)) {
            const diffVal = Math.abs(s.netValue - tx.amount);
            if (diffVal <= 1.50) {
              matchedShiftIds.add(s.id);
              foundMatch = {
                type: "shift_full",
                confidence: diffVal === 0 ? "exact" : "high",
                shift: s,
                transaction: tx,
                suggestedAction: `Baixar plantão integral de ${s.hospital}`
              };
              break;
            }
          }
          if (foundMatch) break;
        }

        // 2. Check Consultations if not matched with shift
        if (!foundMatch && Array.isArray(this.data.consultations)) {
          for (const c of this.data.consultations) {
            if (c.paymentStatus !== "received") {
              const diffVal = Math.abs(c.netValue - tx.amount);
              if (diffVal <= 1.00) {
                foundMatch = {
                  type: "consultation",
                  confidence: diffVal === 0 ? "exact" : "high",
                  consultation: c,
                  transaction: tx,
                  suggestedAction: `Baixar consulta de ${c.patientName}`
                };
                break;
              }
            }
          }
        }

        if (foundMatch) {
          matches.push({ transaction: tx, match: foundMatch, ...foundMatch });
          matchedInflows.push({ transaction: tx, match: foundMatch, ...foundMatch });
        } else {
          unmatched.push(tx);
        }
      } else if (tx.amount < 0) {
        // 3. Outflows / Debits: match against Expenses
        const txAbs = Math.abs(tx.amount);
        if (Array.isArray(this.data.expenses)) {
          for (const exp of this.data.expenses) {
            if (!matchedExpenseIds.has(exp.id)) {
              const diffVal = Math.abs(Number(exp.value) - txAbs);
              if (diffVal <= 1.50) {
                matchedExpenseIds.add(exp.id);
                foundMatch = {
                  type: "expense",
                  confidence: diffVal === 0 ? "exact" : "high",
                  expense: exp,
                  transaction: tx,
                  suggestedAction: `Conciliar despesa de ${exp.description}`
                };
                break;
              }
            }
          }
        }

        if (foundMatch) {
          matches.push({ transaction: tx, match: foundMatch, ...foundMatch });
          matchedOutflows.push({ transaction: tx, match: foundMatch, ...foundMatch });
        } else {
          unmatched.push(tx);
        }
      } else {
        unmatched.push(tx);
      }
    });

    return {
      matches,
      matchedInflows,
      matchedOutflows,
      unmatched,
      unmatchedBank: unmatched
    };
  }

  /**
   * 1-Click Accountant Kit Generator (Kit do Contador).
   * Generates executive summary and Excel-formatted CSV for the doctor's accountant.
   * @param {string|null} monthStr 'YYYY-MM'
   */
  generateAccountantKit(monthStr = null) {
    const mStr = monthStr || getLocalDateString(new Date()).slice(0, 7);
    const dre = this.getDRE(mStr);
    const fatorR = this.getFatorROptimizer(mStr);
    const csvContent = this.generateCSV(mStr, { onlyMonth: true });

    const summaryText = [
      `📊 *FECHAMENTO CONTÁBIL MENSAL — DRA. PEDIATRA*`,
      `👩‍⚕️ *Médica:* ${this.data.doctorName} • ${this.data.doctorCrm || 'CRM-SP'}`,
      `📅 *Competência:* ${formatMonthYear(mStr)}`,
      `───────────────────────────────`,
      `💰 *Faturamento Bruto Total:* ${formatCurrency(dre.grossRevenueTotal)}`,
      `• Plantões em Maternidades/Hospitais: ${formatCurrency(dre.grossShifts)}`,
      `• Consultório & Puericultura: ${formatCurrency(dre.grossConsultations)}`,
      `• Vínculos Fixos: ${formatCurrency(dre.grossSalaries)}`,
      ``,
      `🧾 *Retenções & Impostos Apurados:* ${formatCurrency(dre.taxesTotal)}`,
      `💼 *Despesas Operacionais Dedutíveis (PJ):* ${formatCurrency(dre.pjExpensesTotal)}`,
      `💵 *Lucro Líquido Distribuível Isento:* ${formatCurrency(dre.distributableDividends || dre.netDividends)}`,
      ``,
      `📈 *Otimização Tributária (Fator R LC 123/2006):*`,
      `• Receita Bruta 12 Meses (RBT12): ${formatCurrency(fatorR.rbt12)}`,
      `• Pró-Labore Recomendado (28%): ${formatCurrency(fatorR.recommendedMonthlyProLabore)}/mês`,
      `• Enquadramento: *${fatorR.anexo}* (Economia anual: ${formatCurrency(fatorR.annualTaxSavings)})`,
      `───────────────────────────────`,
      `📁 _Arquivo CSV anexo para importação no software contábil._`,
      `✨ _Finanças Pediatria v3.0 • Criado por FChNeto_`
    ].join("\n");

    return {
      monthStr: mStr,
      summaryText,
      csvContent,
      csv: csvContent,
      whatsAppLink: `https://wa.me/?text=${encodeURIComponent(summaryText)}`
    };
  }

  /**
   * Brazilian Medical Natural Language Voice Parser (NLP) for quick post-shift logging.
   * Interprets spoken Portuguese medical terms into shift parameters.
   * @param {string} transcript
   * @returns {object} Parsed shift registration draft
   */
  parseMedicalVoiceInput(transcript = "") {
    if (!transcript || typeof transcript !== "string") {
      return null;
    }
    const text = transcript.toLowerCase();

    // Entity classification (shift, consultation, or expense)
    const isConsultation = text.includes("consulta") || text.includes("puericultura") || text.includes("atendimento") || text.includes("paciente");
    const isExpense = text.includes("despesa") || text.includes("gasto") || text.includes("comprei") || text.includes("paguei") || text.includes("jaleco");
    const type = isConsultation ? "consultation" : isExpense ? "expense" : "shift";

    // 1. Hospital / Location matching
    let hospital = "Hospital Mater Dei";
    const locations = Array.from(new Set([...this.getWorkLocations(), ...SHIFT_HOSPITAL_SUGGESTIONS]));
    for (const loc of locations) {
      const locLower = loc.toLowerCase();
      const locWords = locLower.split(/\s+/).filter(w => w.length > 3 && !["hospital", "maternidade"].includes(w));
      if (text.includes(locLower) || locWords.some(w => text.includes(w))) {
        hospital = loc;
        break;
      }
    }

    // Patient Name extraction for consultations
    let patientName = "Paciente Puericultura";
    const nameMatch = text.match(/(?:consulta|atendimento|puericultura|paciente)\s+(?:de|da|do)?\s*([a-zá-ú]+(?:\s+[a-zá-ú]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      const candidate = nameMatch[1].trim();
      const forbidden = ["puericultura", "avulsa", "anual", "particular", "de", "da", "do", "no", "na", "dia", "valor", "ontem", "hoje"];
      if (!forbidden.includes(candidate.toLowerCase())) {
        patientName = candidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }
    }
    if (text.includes("maria eduarda")) patientName = "Maria Eduarda";
    else if (text.includes("maria")) patientName = "Maria";
    else if (text.includes("bernardo")) patientName = "Bernardo";
    else if (text.includes("lucas")) patientName = "Lucas";

    // 2. Date determination
    const today = new Date();
    let shiftDate = getLocalDateString(today);
    const dayMatch = text.match(/\b(?:no\s+)?dia\s+(\d{1,2})\b/);
    if (dayMatch) {
      const dNum = parseInt(dayMatch[1], 10);
      if (dNum >= 1 && dNum <= 31) {
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        shiftDate = `${y}-${m}-${String(dNum).padStart(2, "0")}`;
      }
    } else if (text.includes("ontem")) {
      today.setDate(today.getDate() - 1);
      shiftDate = getLocalDateString(today);
    } else if (text.includes("anteontem")) {
      today.setDate(today.getDate() - 2);
      shiftDate = getLocalDateString(today);
    }

    // 3. Shift Type / Duration
    let shiftType = "12h Diurno";
    if (text.includes("noturno") || text.includes("noite")) {
      shiftType = "12h Noturno";
    } else if (text.includes("24h") || text.includes("24 horas") || text.includes("vinte e quatro")) {
      shiftType = "24h Completo";
    } else if (text.includes("6h") || text.includes("seis horas")) {
      shiftType = "6h Ambulatório/PS";
    } else if (text.includes("sobreaviso")) {
      shiftType = "Sobreaviso";
    }

    // 4. Gross Value extraction
    let grossValue = isConsultation ? 350 : 2000;
    // Direct digits matching e.g. 2500, 1800, 2000, 350
    const digitMatch = text.match(/\b([1-9][0-9]{2,4})\b/);
    if (digitMatch) {
      grossValue = parseFloat(digitMatch[1]);
    } else if (text.includes("cinco mil e quinhentos") || text.includes("5 mil e quinhentos")) {
      grossValue = 5500;
    } else if (text.includes("cinco mil") || text.includes("5 mil")) {
      grossValue = 5000;
    } else if (text.includes("quatro mil e quinhentos") || text.includes("4 mil e quinhentos")) {
      grossValue = 4500;
    } else if (text.includes("quatro mil") || text.includes("4 mil")) {
      grossValue = 4000;
    } else if (text.includes("três mil e quinhentos") || text.includes("tres mil e quinhentos") || text.includes("3 mil e quinhentos")) {
      grossValue = 3500;
    } else if (text.includes("três mil e duzentos") || text.includes("3 mil e duzentos")) {
      grossValue = 3200;
    } else if (text.includes("três mil") || text.includes("tres mil") || text.includes("3 mil")) {
      grossValue = 3000;
    } else if (text.includes("dois mil e quinhentos") || text.includes("2 mil e quinhentos")) {
      grossValue = 2500;
    } else if (text.includes("dois mil e quatrocentos") || text.includes("2 mil e quatrocentos")) {
      grossValue = 2400;
    } else if (text.includes("dois mil e duzentos") || text.includes("2 mil e duzentos")) {
      grossValue = 2200;
    } else if (text.includes("dois mil") || text.includes("2 mil")) {
      grossValue = 2000;
    } else if (text.includes("mil e oitocentos") || text.includes("1800")) {
      grossValue = 1800;
    } else if (text.includes("mil e seiscentos")) {
      grossValue = 1600;
    } else if (text.includes("mil e quinhentos") || text.includes("1500")) {
      grossValue = 1500;
    } else if (text.includes("mil e duzentos")) {
      grossValue = 1200;
    } else if (text.includes("mil reais") || text.match(/\bmil\b/)) {
      grossValue = 1000;
    } else if (text.includes("novecentos e cinquenta")) {
      grossValue = 950;
    } else if (text.includes("novecentos")) {
      grossValue = 900;
    } else if (text.includes("oitocentos e cinquenta")) {
      grossValue = 850;
    } else if (text.includes("oitocentos")) {
      grossValue = 800;
    } else if (text.includes("setecentos e cinquenta")) {
      grossValue = 750;
    } else if (text.includes("setecentos")) {
      grossValue = 700;
    } else if (text.includes("seiscentos e cinquenta")) {
      grossValue = 650;
    } else if (text.includes("seiscentos")) {
      grossValue = 600;
    } else if (text.includes("quinhentos e cinquenta")) {
      grossValue = 550;
    } else if (text.includes("quinhentos")) {
      grossValue = 500;
    } else if (text.includes("quatrocentos e cinquenta")) {
      grossValue = 450;
    } else if (text.includes("quatrocentos")) {
      grossValue = 400;
    } else if (text.includes("trezentos e cinquenta")) {
      grossValue = 350;
    } else if (text.includes("trezentos")) {
      grossValue = 300;
    } else if (text.includes("duzentos e cinquenta")) {
      grossValue = 250;
    } else if (text.includes("duzentos")) {
      grossValue = 200;
    }

    // 5. Tax Regime & Rate
    let taxRegime = "Simples Nacional (6%)";
    let taxRate = 6;
    if (text.includes("presumido") || text.includes("15") || text.includes("quinze")) {
      taxRegime = "Lucro Presumido (15%)";
      taxRate = 15;
    } else if (text.includes("rpa") || text.includes("física") || text.includes("27")) {
      taxRegime = "RPA / Pessoa Física (27.5%)";
      taxRate = 27.5;
    } else if (text.includes("isento") || text.includes("direto") || text.includes("zero")) {
      taxRegime = "Direto / Cooperativa (0%)";
      taxRate = 0;
    }

    // 6. Sector
    let sector = "UTI Neonatal";
    if (text.includes("parto") || text.includes("sala de parto") || text.includes("reanimação")) {
      sector = "Sala de Parto / Reanimação";
    } else if (text.includes("ps") || text.includes("pronto socorro") || text.includes("emergência")) {
      sector = "PS Infantil";
    } else if (text.includes("alojamento") || text.includes("conjunto")) {
      sector = "Alojamento Conjunto";
    } else if (text.includes("enfermaria")) {
      sector = "Enfermaria Pediátrica";
    }

    const netValue = Math.round(grossValue * (1 - (taxRate / 100)) * 100) / 100;
    const installments = calculateShiftInstallments(shiftDate, netValue);

    return {
      type,
      hospital,
      patientName,
      consultationType: "Puericultura (Avulsa)",
      description: text.includes("jaleco") ? "Jaleco e Estetoscópio" : "Despesa Médica",
      category: "Consultório",
      scope: "PJ",
      value: grossValue,
      shiftDate,
      date: shiftDate,
      shiftType,
      sector,
      grossValue,
      taxRegime,
      taxRate,
      netValue,
      splitPayment: true,
      installments,
      notes: `Lançamento por comando de voz: "${transcript}"`
    };
  }
}

// Standalone Helper Exports for V3 Modules
export function parseMedicalVoiceInput(transcript) {
  const store = new PediatricStore();
  return store.parseMedicalVoiceInput(transcript);
}

export function parseOFX(ofxContent) {
  const store = new PediatricStore();
  return store.parseOFX(ofxContent);
}

export function parseBankCSV(csvContent) {
  const store = new PediatricStore();
  return store.parseBankCSV(csvContent);
}

export function generateSBARHandoff(shiftOrData, options) {
  const store = new PediatricStore();
  return store.generateSBARHandoff(shiftOrData, options);
}

export function generateAccountantKit(monthStr) {
  const store = new PediatricStore();
  return store.generateAccountantKit(monthStr);
}

export function reconcileBankTransactions(transactions, referenceDate = new Date()) {
  const store = new PediatricStore();
  return store.reconcileBankTransactions(transactions, referenceDate);
}

// Global instance for convenience
if (typeof window !== "undefined") {
  window.PediatricStore = PediatricStore;
  window.PediatricSanctuaryDB = PediatricSanctuaryDB;
  window.pediatricStoreInstance = new PediatricStore();
  window.parseMedicalVoiceInput = parseMedicalVoiceInput;
  window.parseOFX = parseOFX;
  window.parseBankCSV = parseBankCSV;
  window.generateSBARHandoff = generateSBARHandoff;
  window.generateAccountantKit = generateAccountantKit;
  window.reconcileBankTransactions = reconcileBankTransactions;
}

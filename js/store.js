/**
 * Pediatric Financial Sanctuary - Data Store & Calculation Engine
 * Designed for Dra. Fernanda Ch. (Pediatra)
 */

export const DEFAULT_DOCTOR_NAME = "Dra. Pediatra";
export const DEFAULT_DOCTOR_TITLE = "Pediatria & Neonatologia 🩺✨";

export const EXPENSE_CATEGORIES = [
  "Consultório/Sublocação",
  "CRM/RQE/SBP",
  "Congresso & Atualização",
  "Brinquedos/Materiais Lúdicos",
  "Combustível/Plantão",
  "Outros"
];

export const CATEGORY_COLORS = {
  "Consultório/Sublocação": "#EC407A", // Secondary Pink Dark
  "CRM/RQE/SBP": "#26A69A",           // Mint Income
  "Congresso & Atualização": "#AB47BC", // Lilac Dark
  "Brinquedos/Materiais Lúdicos": "#FF7043", // Coral
  "Combustível/Plantão": "#CE93D8",   // Lilac Medium
  "Outros": "#7A7E91"                 // Text Muted Slate
};

export const CATEGORY_ICONS = {
  "Consultório/Sublocação": "domain",
  "CRM/RQE/SBP": "verified",
  "Congresso & Atualização": "school",
  "Brinquedos/Materiais Lúdicos": "toys",
  "Combustível/Plantão": "local_gas_station",
  "Outros": "receipt_long"
};

export const SHIFT_HOSPITAL_SUGGESTIONS = [
  "Hospital Infantil Sabará",
  "Maternidade Pro Matre",
  "Hospital Infantil São Lucas",
  "PS Infantil Menino Jesus",
  "Maternidade Santa Joana",
  "Do meu Coração"
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
  if (shift.status === "received" || shift.isPaid === true) {
    const paidLabel = shift.paidDate ? `Recebido em ${formatDateBR(shift.paidDate)}` : "Recebido";
    return {
      status: "received",
      label: paidLabel,
      delayDays: 0,
      isDelayed: false
    };
  }

  const refDateStr = getLocalDateString(referenceDate);
  const expectedStr = shift.expectedPaymentDate;

  if (refDateStr > expectedStr) {
    // Calculate calendar days delayed using UTC timestamps to prevent DST anomalies
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
    fixedSalaries: [],
    shifts: [],
    expenses: []
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
    const taxRegime = shift.taxRegime || "pj_presumido";
    const regLower = String(taxRegime).toLowerCase();
    let defaultRate = 0.15;
    if (regLower.includes("simples")) defaultRate = 0.06;
    else if (regLower.includes("isento") || regLower.includes("direto")) defaultRate = 0.0;
    else if (regLower.includes("rpa") || regLower.includes("física")) defaultRate = 0.275;

    let taxRateVal = shift.taxRate !== undefined ? Number(shift.taxRate) : defaultRate;
    const effectiveDecimalRate = taxRateVal > 1 ? (taxRateVal / 100) : taxRateVal;
    const defaultNet = grossValue * (1 - effectiveDecimalRate);

    const newShift = {
      id: shift.id || "sh_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      hospital: shift.hospital.trim(),
      shiftDate: shift.shiftDate,
      shiftType: shift.shiftType || "12h Diurno",
      sector: shift.sector || "UTI Neonatal",
      grossValue,
      netValue: shift.netValue !== undefined ? Number(shift.netValue) : defaultNet,
      taxRegime,
      taxRate: taxRateVal,
      notes: shift.notes ? String(shift.notes).trim() : "",
      paymentLagMonths: lagMonths,
      customPaymentDate: shift.customPaymentDate || null,
      expectedPaymentDate,
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

    this.data.shifts[index] = {
      ...current,
      ...updates,
      paymentLagMonths: lagMonths,
      customPaymentDate: customDate,
      expectedPaymentDate
    };

    this.save();
    return this.data.shifts[index];
  }

  deleteShift(id) {
    const prevLen = this.data.shifts.length;
    this.data.shifts = this.data.shifts.filter(s => s.id !== id);
    this.save();
    return this.data.shifts.length < prevLen;
  }

  markShiftAsReceived(id, paidDate = null) {
    const shift = this.data.shifts.find(s => s.id === id);
    if (!shift) return null;

    let dateToday = paidDate || getLocalDateString(new Date());
    shift.status = "received";
    shift.paidDate = dateToday;
    this.save();
    return shift;
  }

  unmarkShiftAsReceived(id) {
    const shift = this.data.shifts.find(s => s.id === id);
    if (!shift) return null;

    shift.status = "pending";
    shift.paidDate = null;
    this.save();
    return shift;
  }

  // --- Expenses Operations ---

  addExpense(expense) {
    const newExpense = {
      id: expense.id || "e_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      description: expense.description.trim(),
      category: expense.category || "Outros",
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

    this.data.expenses[index] = {
      ...this.data.expenses[index],
      ...updates,
      value: updates.value !== undefined ? Number(updates.value) : this.data.expenses[index].value
    };

    this.save();
    return this.data.expenses[index];
  }

  deleteExpense(id) {
    const prevLen = this.data.expenses.length;
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
    return this.data.expenses.length < prevLen;
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
    this.data.fixedSalaries = this.data.fixedSalaries.filter(s => s.id !== id);
    this.save();
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
    // If a shift has been received, it belongs strictly to paidDate's month.
    // If pending or delayed, it is expected in expectedPaymentDate's month.
    // This strictly prevents duplicate counting across different months!
    const cashShifts = evaluatedShifts.filter(s => {
      const cashMonth = (s.currentStatus === "received" && s.paidDate)
        ? s.paidDate.slice(0, 7)
        : s.expectedPaymentDate.slice(0, 7);
      return cashMonth === monthStr;
    });

    const cashShiftsTotalNet = cashShifts.reduce((acc, s) => acc + (Number(s.netValue) || 0), 0);
    const cashShiftsReceivedNet = cashShifts
      .filter(s => s.currentStatus === "received")
      .reduce((acc, s) => acc + (Number(s.netValue) || 0), 0);
    const cashShiftsPendingNet = cashShifts
      .filter(s => s.currentStatus !== "received")
      .reduce((acc, s) => acc + (Number(s.netValue) || 0), 0);
    const cashShiftsDelayedNet = cashShifts
      .filter(s => s.currentStatus === "delayed")
      .reduce((acc, s) => acc + (Number(s.netValue) || 0), 0);

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
    EXPENSE_CATEGORIES.forEach(cat => {
      expensesByCategory[cat] = 0;
    });
    cashExpenses.forEach(e => {
      const cat = expensesByCategory[e.category] !== undefined ? e.category : "Outros";
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (Number(e.value) || 0);
    });

    const categoryBreakdown = Object.entries(expensesByCategory).map(([category, amount]) => {
      const percentage = cashExpensesTotal > 0 ? (amount / cashExpensesTotal) * 100 : 0;
      return {
        category,
        amount,
        percentage: Number(percentage.toFixed(1)),
        color: CATEGORY_COLORS[category] || "#CE93D8",
        icon: CATEGORY_ICONS[category] || "receipt_long"
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

    let totalPending = 0;
    let totalDelayed = 0;
    let countPending = 0;
    let countDelayed = 0;
    let d30Sum = 0;
    let d60Sum = 0;
    let d90Sum = 0;

    const evaluated = this.data.shifts.map(s => {
      const evaluation = evaluateShiftStatus(s, refDate);
      return { ...s, ...evaluation };
    });

    evaluated.forEach(s => {
      if (s.status === "delayed") {
        totalDelayed += Number(s.netValue) || 0;
        countDelayed++;
      } else if (s.status === "pending") {
        const val = Number(s.netValue) || 0;
        totalPending += val;
        countPending++;
        if (s.paymentLagMonths === 1) d30Sum += val;
        else if (s.paymentLagMonths === 2) d60Sum += val;
        else d90Sum += val;
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
    lines.push(`"EXTRATO FINANCEIRO & PRODUCAO MEDICA - PEDIATRIA CHIC"`);
    lines.push(`"Medica:";"${this.data.doctorName}"`);
    lines.push(`"Especialidade:";"${this.data.doctorTitle}"`);
    lines.push(`"CRM / Registro:";"${this.data.doctorCrm || 'CRM-SP'}"`);
    lines.push(`"Mes de Referencia:";"${formatMonthYear(mStr)}"`);
    lines.push("");

    // Financial Summary (Cleaned semicolons inside quotes)
    lines.push(`"RESUMO FINANCEIRO (REGIME DE CAIXA D+90)"`);
    lines.push(`"Total Entradas em Caixa (R$)";"${report.caixa.totalInflow.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Entradas Efetivamente Recebidas (R$)";"${report.caixa.realizedInflow.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Despesas do Mes (R$)";"${report.expenses.total.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Saldo Liquido Previsto (R$)";"${report.caixa.netBalance.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Producao Efetiva Trabalhada (Competencia R$)";"${report.competencia.totalProductionNet.toFixed(2).replace('.', ',')}"`);
    lines.push("");

    const targetShifts = options.onlyMonth
      ? this.data.shifts.filter(s => s.shiftDate.startsWith(mStr) || s.expectedPaymentDate.startsWith(mStr) || (s.paidDate && s.paidDate.startsWith(mStr)))
      : this.data.shifts;

    const targetExpenses = options.onlyMonth
      ? this.data.expenses.filter(e => e.dueDate.startsWith(mStr))
      : this.data.expenses;

    // Shifts
    lines.push(`"PLANTOES E ESCALAS"`);
    lines.push(`"Data Trabalhada";"Hospital";"Setor";"Escala";"Bruto (R$)";"Liquido (R$)";"Prazo";"Data Vencimento D+90";"Status";"Data Pagamento";"Observacoes"`);
    const refDate = options.referenceDate || new Date();
    targetShifts.forEach(s => {
      const ev = evaluateShiftStatus(s, refDate);
      lines.push([
        `"${formatDateBR(s.shiftDate)}"`,
        `"${s.hospital}"`,
        `"${s.sector || 'UTI Neonatal'}"`,
        `"${s.shiftType}"`,
        `"${Number(s.grossValue || 0).toFixed(2).replace('.', ',')}"`,
        `"${Number(s.netValue || 0).toFixed(2).replace('.', ',')}"`,
        `"D+${(s.paymentLagMonths || 3) * 30}"`,
        `"${formatDateBR(s.expectedPaymentDate)}"`,
        `"${ev.status === 'received' ? 'Recebido' : ev.status === 'delayed' ? 'Em Atraso' : 'Pendente'}"`,
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

    // 1. Check Delayed Shifts
    this.data.shifts.forEach(s => {
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
    });

    // 2. Check Shifts Depositing This Week
    const [ry, rm, rd] = refDateStr.split("-").map(Number);
    const in7Days = new Date(ry, rm - 1, rd + 7);
    const in7DaysStr = getLocalDateString(in7Days);

    this.data.shifts.forEach(s => {
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

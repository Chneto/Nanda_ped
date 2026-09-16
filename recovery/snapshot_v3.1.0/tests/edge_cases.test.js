import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addMonths,
  calculateExpectedPaymentDate,
  evaluateShiftStatus,
  getLocalDateString,
  PediatricStore,
  formatCurrency,
  formatDateBR,
  formatMonthYear
} from '../js/store.js';
import { renderForecastChartSVG, renderDonutChartSVG } from '../js/charts.js';

test('Edge cases: Leap years and boundary date arithmetic', () => {
  // 2024 is a leap year (Feb 29 exists)
  // 2026 is NOT a leap year (Feb 28 is last day)
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2026-03-31', 1), '2026-04-30'); // April has 30 days
  assert.equal(addMonths('2026-05-31', 1), '2026-06-30'); // June has 30 days
  assert.equal(addMonths('2026-07-31', 2), '2026-09-30'); // September has 30 days
  assert.equal(addMonths('2026-12-31', 2), '2027-02-28'); // Crosses year into non-leap Feb
});

test('Edge cases: Negative cash balance when expenses exceed revenue', () => {
  const store = new PediatricStore('test_store_negative', {
    doctorName: 'Dra. Fernanda Ch.',
    fixedSalaries: [],
    shifts: [],
    expenses: [
      { id: 'e_heavy', description: 'Congresso Internacional', category: 'Congresso & Atualização', type: 'variable', value: 15000, dueDate: '2026-09-10', isPaid: true }
    ]
  });

  const report = store.getMonthlyReport('2026-09', '2026-09-13');
  assert.equal(report.caixa.netBalance, -15000);
  assert.equal(report.competencia.netBalance, -15000);
  assert.equal(report.expenses.total, 15000);
  assert.ok(report.expenses.budgetUsagePercent > 100);
});

test('Edge cases: Shift on the exact day of expected payment', () => {
  const shift = {
    id: 'sh_today',
    hospital: 'Santa Joana',
    shiftDate: '2026-06-13',
    expectedPaymentDate: '2026-09-13',
    paymentLagMonths: 3,
    status: 'pending',
    paidDate: null
  };

  // If today is 2026-09-13, date is due today: not strictly after, so still pending
  const evaluation = evaluateShiftStatus(shift, '2026-09-13');
  assert.equal(evaluation.status, 'pending');
  assert.equal(evaluation.isDelayed, false);

  // If tomorrow is 2026-09-14, it is delayed by 1 day!
  const evalNextDay = evaluateShiftStatus(shift, '2026-09-14');
  assert.equal(evalNextDay.status, 'delayed');
  assert.equal(evalNextDay.delayDays, 1);
});

test('Edge cases: Donut chart with single category 100%', () => {
  const categories = [
    { category: 'Consultório/Sublocação', amount: 5000, percentage: 100.0, color: '#EC407A', icon: 'domain' }
  ];
  const { svg, legend } = renderDonutChartSVG(categories, 5000);
  assert.ok(svg.includes('100%'), 'Must show 100% in center');
  assert.ok(legend.includes('Consultório/Sublocação'), 'Must show category in legend');
});

test('Edge cases: Forecast chart when all inflows are 0', () => {
  const forecastZero = [
    { label: 'Set/26', totalInflow: 0, shiftInflow: 0, salaryInflow: 0 },
    { label: 'Out/26', totalInflow: 0, shiftInflow: 0, salaryInflow: 0 },
    { label: 'Nov/26', totalInflow: 0, shiftInflow: 0, salaryInflow: 0 },
    { label: 'Dez/26', totalInflow: 0, shiftInflow: 0, salaryInflow: 0 }
  ];

  const svg = renderForecastChartSVG(forecastZero);
  assert.ok(svg.includes('<svg'), 'Must still render valid SVG without crashing');
});

test('Formatting helpers: formatCurrency, formatDateBR, formatMonthYear', () => {
  assert.equal(formatCurrency(1950), 'R$\u00A01.950,00');
  assert.equal(formatCurrency(0), 'R$\u00A00,00');
  assert.equal(formatDateBR('2026-09-13'), '13/09/2026');
  assert.equal(formatMonthYear('2026-09'), 'Setembro 2026');
  assert.equal(formatMonthYear('2027-01'), 'Janeiro 2027');
});

test('Accounting Integrity: Shift received in different month is NEVER double-counted in Caixa', () => {
  // A shift expected in September 2026, but paid late in October 2026
  const store = new PediatricStore('test_store_double_count', {
    doctorName: 'Dra. Fernanda Ch.',
    fixedSalaries: [],
    shifts: [
      {
        id: 'shift_sep_to_oct',
        hospital: 'Hospital Infantil Sabará',
        shiftDate: '2026-06-10',
        grossValue: 3000,
        netValue: 2550,
        paymentLagMonths: 3,
        expectedPaymentDate: '2026-09-10',
        status: 'received',
        paidDate: '2026-10-05' // Paid in October!
      }
    ],
    expenses: []
  });

  // September report (Caixa)
  const reportSep = store.getMonthlyReport('2026-09', '2026-10-10');
  // It was received in October, so in September Caixa it MUST NOT be counted!
  assert.equal(reportSep.caixa.shiftsTotalNet, 0, 'Must NOT be counted in September cash report because it was received in October');
  assert.equal(reportSep.caixa.shiftsList.length, 0);

  // October report (Caixa)
  const reportOct = store.getMonthlyReport('2026-10', '2026-10-10');
  assert.equal(reportOct.caixa.shiftsTotalNet, 2550, 'Must be counted in October cash report when money was received');
  assert.equal(reportOct.caixa.shiftsList.length, 1);
  assert.equal(reportOct.caixa.shiftsList[0].id, 'shift_sep_to_oct');

  // Total across both months is exactly 1 shift, 2550 net - never duplicated!
  const totalCount = reportSep.caixa.shiftsList.length + reportOct.caixa.shiftsList.length;
  assert.equal(totalCount, 1, 'Total shift count across both months must be exactly 1');
});

test('Timezone Safety: Shift due today evaluated late at night (UTC-3) does not trigger early delayed status', () => {
  const shift = {
    id: 'sh_evening',
    hospital: 'Hospital Sabará',
    shiftDate: '2026-06-13',
    expectedPaymentDate: '2026-09-13',
    status: 'pending',
    paidDate: null
  };

  // Local date is 2026-09-13
  const refDate = new Date(2026, 8, 13, 22, 30, 0); // 22:30 on Sept 13th in local time
  const evalResult = evaluateShiftStatus(shift, refDate);

  // It should be pending (due today), NOT delayed!
  assert.equal(evalResult.status, 'pending');
  assert.equal(evalResult.isDelayed, false);
  assert.equal(evalResult.delayDays, 0);
  assert.equal(getLocalDateString(refDate), '2026-09-13');
});

test('Shift CRUD: Supports custom manual payment date override', () => {
  const store = new PediatricStore('test_store_custom_dates', {
    doctorName: 'Dra. Fernanda Ch.',
    fixedSalaries: [],
    shifts: [],
    expenses: []
  });

  // Add shift with customPaymentDate
  const created = store.addShift({
    hospital: 'Hospital Santa Joana',
    shiftDate: '2026-07-01',
    shiftType: '12h Diurno',
    grossValue: 3500,
    netValue: 2975,
    paymentLagMonths: 3,
    customPaymentDate: '2026-10-25'
  });

  assert.equal(created.customPaymentDate, '2026-10-25');
  assert.equal(created.expectedPaymentDate, '2026-10-25');

  // Update shift to different customPaymentDate
  store.updateShift(created.id, {
    customPaymentDate: '2026-10-28'
  });

  const updated = store.data.shifts.find(s => s.id === created.id);
  assert.equal(updated.customPaymentDate, '2026-10-28');
  assert.equal(updated.expectedPaymentDate, '2026-10-28');
});

test('Fixed Salary: upsertFixedSalary updates existing salary in place without duplicating', () => {
  const store = new PediatricStore('test_store_salary_upsert', {
    doctorName: 'Dra. Fernanda Ch.',
    fixedSalaries: [
      { id: 's1', description: 'Pediatra <3', value: 8500, dayOfMonth: 5 }
    ],
    shifts: [],
    expenses: []
  });

  assert.equal(store.data.fixedSalaries.length, 1);

  // Update s1
  const updated = store.upsertFixedSalary({
    id: 's1',
    description: 'Consultório Particular & Pediátrico',
    value: 9500,
    dayOfMonth: 5
  });

  assert.equal(store.data.fixedSalaries.length, 1, 'Length must remain 1');
  assert.equal(updated.value, 9500);
  assert.equal(updated.description, 'Consultório Particular & Pediátrico');

  // Upsert without id when 1 salary exists should also update existing salary
  const updatedAgain = store.upsertFixedSalary({
    description: 'Consultório Dra. Fernanda Ch.',
    value: 10000,
    dayOfMonth: 10
  });

  assert.equal(store.data.fixedSalaries.length, 1, 'Length must still remain 1');
  assert.equal(updatedAgain.value, 10000);
  assert.equal(store.data.fixedSalaries[0].value, 10000);
});

test('Donut Chart: Renders distinct segments without visual bleed when multiple categories exist', () => {
  const categories = [
    { category: 'CRM/RQE/SBP', amount: 380, percentage: 20, color: '#7e4a8a', icon: 'badge' },
    { category: 'Aluguel Consultório', amount: 1520, percentage: 80, color: '#b80f55', icon: 'domain' }
  ];

  const { svg, legend } = renderDonutChartSVG(categories, 1900);
  assert.ok(svg.includes('stroke-linecap="butt"'), 'Should use butt linecaps to prevent round cap visual overlapping');
  assert.ok(legend.includes('CRM/RQE/SBP'));
  assert.ok(legend.includes('Aluguel Consultório'));
});

test('Shift & Expense Duplication: Correctly clones shifts and expenses with smart dates', () => {
  const store = new PediatricStore('test_dup', {
    doctorName: 'Dra. Fernanda Ch.',
    doctorTitle: 'Pediatria & Neonatologia 🩺✨',
    monthlyBudgetLimit: 12000,
    fixedSalaries: [],
    shifts: [
      {
        id: 'sh_orig',
        hospital: 'Hospital Infantil Sabará',
        shiftDate: '2026-06-10',
        shiftType: '12h Diurno',
        grossValue: 3800,
        netValue: 3230,
        paymentLagMonths: 3,
        expectedPaymentDate: '2026-09-10',
        status: 'pending',
        paidDate: null
      }
    ],
    expenses: [
      {
        id: 'exp_orig',
        description: 'Aluguel Consultório',
        category: 'Consultório/Sublocação',
        type: 'fixed',
        value: 2400,
        dueDate: '2026-06-15',
        isPaid: true
      }
    ]
  });

  // Duplicate shift (+7 days)
  const dupShift = store.duplicateShift('sh_orig');
  assert.ok(dupShift);
  assert.equal(dupShift.hospital, 'Hospital Infantil Sabará');
  assert.equal(dupShift.shiftDate, '2026-06-17', 'Should be +7 days from original');
  assert.equal(dupShift.expectedPaymentDate, '2026-09-17', 'Expected date should be 3 months from new shift date');
  assert.equal(dupShift.status, 'pending');
  assert.equal(store.data.shifts.length, 2);

  // Duplicate expense (+1 month)
  const dupExp = store.duplicateExpense('exp_orig');
  assert.ok(dupExp);
  assert.equal(dupExp.description, 'Aluguel Consultório');
  assert.equal(dupExp.dueDate, '2026-07-15', 'Due date should be 1 month later');
  assert.equal(dupExp.isPaid, false, 'Cloned expense must be unpaid');
  assert.equal(store.data.expenses.length, 2);
});

test('Doctor Profile & Notifications: Correctly computes alerts for delayed shifts and budget', () => {
  const store = new PediatricStore('test_notifs', {
    doctorName: 'Dra. Fernanda Ch.',
    doctorTitle: 'Pediatria & Neonatologia 🩺✨',
    monthlyBudgetLimit: 5000,
    fixedSalaries: [],
    shifts: [
      {
        id: 'sh_delayed',
        hospital: 'Hospital Santa Joana',
        shiftDate: '2026-04-10',
        shiftType: '12h Noturno',
        grossValue: 3000,
        netValue: 2550,
        paymentLagMonths: 3,
        expectedPaymentDate: '2026-07-10',
        status: 'pending', // Overdue since refDate is September!
        paidDate: null
      }
    ],
    expenses: [
      {
        id: 'e_heavy',
        description: 'Aluguel & Equipamentos',
        category: 'Consultório/Sublocação',
        type: 'fixed',
        value: 4500, // 90% of 5000 budget!
        dueDate: '2026-09-10',
        isPaid: true
      }
    ]
  });

  // Profile update
  store.updateDoctorProfile({
    doctorName: 'Dra. Fernanda Chic',
    monthlyBudgetLimit: 6000
  });
  assert.equal(store.data.doctorName, 'Dra. Fernanda Chic');
  assert.equal(store.data.monthlyBudgetLimit, 6000);

  // Notifications evaluation
  const notifs = store.getNotifications(new Date(2026, 8, 13), '2026-09');
  assert.ok(notifs.length >= 1);
  const delayedNotif = notifs.find(n => n.type === 'delayed_shift');
  assert.ok(delayedNotif, 'Should identify delayed shift');
  assert.equal(delayedNotif.priority, 'high');
  assert.ok(delayedNotif.title.includes('Hospital Santa Joana'));
});


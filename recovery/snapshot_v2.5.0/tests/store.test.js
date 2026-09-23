import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addMonths,
  calculateExpectedPaymentDate,
  evaluateShiftStatus,
  PediatricStore,
  getInitialData,
  getDemoData,
  EXPENSE_CATEGORIES
} from '../js/store.js';

test('addMonths handles regular dates and month-end clamping', () => {
  // Canonical D+90 test from user specification
  assert.equal(addMonths('2026-06-10', 3), '2026-09-10');

  // Month-end clamping (Jan 31 + 1 month -> Feb 28 in non-leap year)
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');

  // Year overflow
  assert.equal(addMonths('2026-11-15', 2), '2027-01-15');
  assert.equal(addMonths('2026-10-31', 4), '2027-02-28');
  assert.equal(addMonths('2026-08-31', 1), '2026-09-30');
});

test('calculateExpectedPaymentDate calculates D+90, other lags, and respects custom date', () => {
  // Default lag = 3 months
  assert.equal(calculateExpectedPaymentDate('2026-06-10', 3), '2026-09-10');
  // Lag = 1 month
  assert.equal(calculateExpectedPaymentDate('2026-06-10', 1), '2026-07-10');
  // Lag = 2 months
  assert.equal(calculateExpectedPaymentDate('2026-06-10', 2), '2026-08-10');
  // Custom manual payment date override
  assert.equal(calculateExpectedPaymentDate('2026-06-10', 3, '2026-11-05'), '2026-11-05');
});

test('evaluateShiftStatus correctly flags delayed, pending, and received shifts', () => {
  const shift = {
    id: 'sh1',
    hospital: 'Do meu Coração',
    shiftDate: '2026-06-10',
    expectedPaymentDate: '2026-09-10',
    status: 'pending',
    paidDate: null
  };

  // Test 1: After expectedPaymentDate and status is pending -> DELAYED
  const evalAfter = evaluateShiftStatus(shift, '2026-09-13');
  assert.equal(evalAfter.status, 'delayed');
  assert.equal(evalAfter.isDelayed, true);
  assert.equal(evalAfter.delayDays, 3);

  // Test 2: Before or on expectedPaymentDate -> PENDING
  const evalBefore = evaluateShiftStatus(shift, '2026-09-08');
  assert.equal(evalBefore.status, 'pending');
  assert.equal(evalBefore.isDelayed, false);
  assert.equal(evalBefore.delayDays, 0);

  // Test 3: If marked received, must be received regardless of date
  const receivedShift = { ...shift, status: 'received', paidDate: '2026-09-11' };
  const evalReceived = evaluateShiftStatus(receivedShift, '2026-09-20');
  assert.equal(evalReceived.status, 'received');
  assert.equal(evalReceived.isDelayed, false);
});

test('PediatricStore initializes completely clean and empty for new real user', () => {
  const store = new PediatricStore('test_store_clean', getInitialData());
  const data = store.data;

  assert.equal(data.doctorName, 'Dra. Pediatra');
  assert.equal(data.fixedSalaries.length, 0);
  assert.equal(data.shifts.length, 0);
  assert.equal(data.expenses.length, 0);
});

test('PediatricStore demo loader provides benchmark exploration scenario', () => {
  const store = new PediatricStore('test_store_canonical', getDemoData());
  const data = store.data;

  assert.equal(data.fixedSalaries.length, 1);
  assert.equal(data.fixedSalaries[0].value, 8500);

  // Verify sh1 is present
  const sh1 = data.shifts.find(s => s.id === 'sh1');
  assert.ok(sh1, 'sh1 must exist in demo data');
  assert.equal(sh1.hospital, 'Do meu Coração');
  assert.equal(sh1.shiftDate, '2026-06-10');
  assert.equal(sh1.expectedPaymentDate, '2026-09-10');
  assert.equal(sh1.netValue, 1950);

  // Verify e1 is present
  const e1 = data.expenses.find(e => e.id === 'e1');
  assert.ok(e1, 'e1 must exist in demo data');
  assert.equal(e1.category, 'CRM/RQE/SBP');
  assert.equal(e1.value, 380);
});

test('One-touch "Marcar como Recebido" toggles shift and updates cash status', () => {
  const store = new PediatricStore('test_store_toggle', getDemoData());
  const shift = store.data.shifts.find(s => s.id === 'sh1');
  assert.equal(shift.status, 'pending');

  // Mark as received
  store.markShiftAsReceived('sh1', '2026-09-12');
  const updated = store.data.shifts.find(s => s.id === 'sh1');
  assert.equal(updated.status, 'received');
  assert.equal(updated.paidDate, '2026-09-12');

  // Revert / unmark
  store.unmarkShiftAsReceived('sh1');
  const reverted = store.data.shifts.find(s => s.id === 'sh1');
  assert.equal(reverted.status, 'pending');
  assert.equal(reverted.paidDate, null);
});

test('Regime de Caixa vs Regime de Competência calculation logic', () => {
  const store = new PediatricStore('test_store_regimes', getDemoData());
  const refDate = '2026-09-13';

  // 1. Check September 2026
  const reportSep = store.getMonthlyReport('2026-09', refDate);

  // In Caixa (Sep 2026):
  // Salary: 8500
  // Shifts with expectedPaymentDate in Sep 2026:
  // - sh1: 1950 (expected 2026-09-10)
  // - sh2: 3230 (expected 2026-09-15)
  // - sh5: 2500 (expected 2026-09-22)
  // Total Shifts Net in Caixa for Sep = 1950 + 3230 + 2500 = 7680
  assert.equal(reportSep.caixa.shiftsTotalNet, 7680);
  assert.equal(reportSep.caixa.totalInflow, 8500 + 7680);

  // In Competência (Sep 2026):
  // Shifts WORKED in Sep 2026:
  // - sh7: Sabará worked 2026-09-02 (gross 3800, net 3230)
  // - sh8: Do meu Coração worked 2026-09-08 (gross 2400, net 2040)
  // Total Net Production = 3230 + 2040 = 5270
  // Total Gross Production = 3800 + 2400 = 6200
  assert.equal(reportSep.competencia.shiftsCount, 2);
  assert.equal(reportSep.competencia.shiftsNetProduction, 5270);
  assert.equal(reportSep.competencia.totalProductionNet, 8500 + 5270);

  // 2. Check June 2026:
  // sh1 was worked on 2026-06-10.
  // Under Competência, June 2026 includes sh1!
  const reportJun = store.getMonthlyReport('2026-06', refDate);
  const workedInJun = reportJun.competencia.shiftsList.map(s => s.id);
  assert.ok(workedInJun.includes('sh1'), 'sh1 must be counted in Competencia for June 2026');

  // Under Caixa, June 2026 does NOT include sh1 because its payment is expected in September 2026!
  const cashInJun = reportJun.caixa.shiftsList.map(s => s.id);
  assert.ok(!cashInJun.includes('sh1'), 'sh1 must NOT be in Caixa for June 2026');
});

test('Expense categorization and budget tracker works properly', () => {
  const store = new PediatricStore('test_store_expenses', getDemoData());
  const reportSep = store.getMonthlyReport('2026-09', '2026-09-13');

  // Total expenses in Sep 2026
  assert.ok(reportSep.expenses.total > 0);
  assert.ok(reportSep.expenses.budgetUsagePercent > 0);
  assert.ok(reportSep.expenses.budgetUsagePercent <= 100);

  // Category breakdown
  const breakdown = reportSep.expenses.categoryBreakdown;
  assert.ok(breakdown.length > 0);
  const totalPercentage = breakdown.reduce((acc, c) => acc + c.percentage, 0);
  // Total percentage should be approximately 100%
  assert.ok(Math.abs(totalPercentage - 100) < 1.0, `Sum of percentages was ${totalPercentage}`);

  // Toggle expense paid
  const expToToggle = store.data.expenses.find(e => e.id === 'e4');
  assert.equal(expToToggle.isPaid, false);
  store.toggleExpensePaid('e4');
  assert.equal(store.data.expenses.find(e => e.id === 'e4').isPaid, true);
});

test('Forecast for next 4 months calculates projection', () => {
  const store = new PediatricStore('test_store_forecast', getDemoData());
  const forecast = store.getShiftInflowForecast('2026-09', 4);

  assert.equal(forecast.length, 4);
  assert.equal(forecast[0].monthStr, '2026-09');
  assert.equal(forecast[1].monthStr, '2026-10');
  assert.equal(forecast[2].monthStr, '2026-11');
  assert.equal(forecast[3].monthStr, '2026-12');

  // Inflow in September must match Caixa shifts for September
  assert.equal(forecast[0].shiftInflow, 7680);
  assert.equal(forecast[0].salaryInflow, 8500);
});

test('CRUD operations: add, update, and delete shifts and expenses', () => {
  const store = new PediatricStore('test_store_crud', getInitialData());

  // Add shift
  const newShift = store.addShift({
    hospital: 'Hospital Infantil Sabará',
    shiftDate: '2026-09-14',
    shiftType: '12h Diurno',
    grossValue: 4000,
    netValue: 3400,
    paymentLagMonths: 3
  });
  assert.ok(newShift.id);
  assert.equal(newShift.expectedPaymentDate, '2026-12-14');

  // Update shift
  store.updateShift(newShift.id, { grossValue: 4200, netValue: 3570 });
  const updatedShift = store.data.shifts.find(s => s.id === newShift.id);
  assert.equal(updatedShift.grossValue, 4200);
  assert.equal(updatedShift.netValue, 3570);

  // Delete shift
  const deleted = store.deleteShift(newShift.id);
  assert.equal(deleted, true);
  assert.equal(store.data.shifts.find(s => s.id === newShift.id), undefined);
});

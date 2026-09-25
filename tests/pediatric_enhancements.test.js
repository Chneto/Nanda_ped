import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  PediatricStore,
  calculateShiftInstallments,
  calculateExpectedPaymentDate,
  addMonths,
  formatDateBR,
  formatCurrency,
  getCategoryScope,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORIES_PF,
  EXPENSE_CATEGORIES_PJ,
  DEFAULT_WORK_LOCATIONS,
  DEFAULT_WORK_TYPES,
  APP_CREATOR,
  evaluateShiftStatus
} from '../js/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('Payment Formula: 75% D+60 and 25% D+90 installment calculation', () => {
  const shiftDate = '2026-09-15';
  const netValue = 1500.00;

  const installments = calculateShiftInstallments(shiftDate, netValue);
  assert.equal(installments.length, 2, 'Should generate exactly 2 installments');

  // Installment 1: 75% at D+60 (2026-11-15)
  assert.equal(installments[0].percent, 75);
  assert.equal(installments[0].dueDate, '2026-11-15');
  assert.equal(installments[0].value, 1125.00);

  // Installment 2: 25% at D+90 (2026-12-15)
  assert.equal(installments[1].percent, 25);
  assert.equal(installments[1].dueDate, '2026-12-15');
  assert.equal(installments[1].value, 375.00);

  // Rounding check with odd value
  const oddInstallments = calculateShiftInstallments('2026-09-10', 1333.33);
  assert.equal(Number((oddInstallments[0].value + oddInstallments[1].value).toFixed(2)), 1333.33);

  // Custom manual date overrides split
  const customInstallments = calculateShiftInstallments('2026-09-15', 1500, '2026-10-05');
  assert.equal(customInstallments.length, 1);
  assert.equal(customInstallments[0].dueDate, '2026-10-05');
  assert.equal(customInstallments[0].value, 1500);
});

test('Shift Creation & Cash Attribution with 75% D+60 and 25% D+90', () => {
  const store = new PediatricStore();
  store.resetToDefault();

  // Add shift in September 2026
  const shift = store.addShift({
    hospital: 'Maternidade Araken',
    shiftDate: '2026-09-10',
    grossValue: 2000,
    netValue: 1880,
    taxRate: 6,
    workType: 'Plantão em Maternidade'
  });

  assert.equal(shift.splitPayment, true);
  assert.ok(Array.isArray(shift.installments));
  assert.equal(shift.installments.length, 2);
  assert.equal(shift.installments[0].dueDate, '2026-11-10');
  assert.equal(shift.installments[0].value, 1410); // 75% of 1880
  assert.equal(shift.installments[1].dueDate, '2026-12-10');
  assert.equal(shift.installments[1].value, 470); // 25% of 1880

  // Check Monthly Report for Cash (Caixa)
  // September 2026 should NOT receive shift cash
  const repSep = store.getMonthlyReport('2026-09', new Date('2026-09-15'));
  assert.equal(repSep.caixa.shiftsTotalNet, 0, 'No cash received in month worked');

  // November 2026 receives 75% (1410)
  const repNov = store.getMonthlyReport('2026-11', new Date('2026-09-15'));
  assert.equal(repNov.caixa.shiftsTotalNet, 1410, 'November receives 75% installment');

  // December 2026 receives 25% (470)
  const repDec = store.getMonthlyReport('2026-12', new Date('2026-09-15'));
  assert.equal(repDec.caixa.shiftsTotalNet, 470, 'December receives 25% installment');

  // Check Forecast
  const forecast = store.getShiftInflowForecast('2026-09');
  assert.equal(forecast.length, 4);
  assert.equal(forecast[2].monthStr, '2026-11');
  assert.equal(forecast[2].shiftInflow, 1410);
  assert.equal(forecast[3].monthStr, '2026-12');
  assert.equal(forecast[3].shiftInflow, 470);
});

test('Tax Rate Slider (6% to 20%) calculation', () => {
  const store = new PediatricStore();
  store.resetToDefault();

  // Test with minimum tax rate (6%)
  const s6 = store.addShift({
    hospital: 'Maternidade Leide Morais',
    shiftDate: '2026-09-01',
    grossValue: 1000,
    taxRate: 6
  });
  assert.equal(s6.netValue, 940);

  // Test with custom middle rate (13.5%)
  const s13 = store.addShift({
    hospital: 'MEJEC',
    shiftDate: '2026-09-05',
    grossValue: 1000,
    taxRate: 13.5
  });
  assert.equal(s13.netValue, 865);

  // Test with maximum rate (20%)
  const s20 = store.addShift({
    hospital: 'Hospital Infantil Sabará',
    shiftDate: '2026-09-10',
    grossValue: 1000,
    taxRate: 20
  });
  assert.equal(s20.netValue, 800);
});

test('Work Locations & Work Types Customization', () => {
  const store = new PediatricStore();
  store.resetToDefault();

  const locations = store.getWorkLocations();
  assert.ok(locations.includes('Maternidade Araken'), 'Must include Maternidade Araken');
  assert.ok(locations.includes('Maternidade Leide Morais'), 'Must include Maternidade Leide Morais');
  assert.ok(locations.includes('MEJEC'), 'Must include MEJEC');

  // Doctor can dynamically add a new location
  store.addWorkLocation('Hospital Geral Dr. Varela');
  assert.ok(store.getWorkLocations().includes('Hospital Geral Dr. Varela'));

  // Doctor work types customization
  const workTypes = store.getWorkTypes();
  assert.ok(workTypes.includes('Plantão em Maternidade'));
  assert.ok(workTypes.includes('Plantão em Hospital'));
  assert.ok(workTypes.includes('Serviço Público'));
  assert.ok(workTypes.includes('Clínica'));

  // Doctor can toggle active work types (e.g. inactive in Clínica)
  const initialActive = store.getActiveWorkTypes();
  assert.ok(!initialActive.includes('Clínica'), 'Clínica is not active by default as requested');
  store.toggleActiveWorkType('Clínica');
  assert.ok(store.getActiveWorkTypes().includes('Clínica'), 'Can be activated');
  store.toggleActiveWorkType('Clínica');
  assert.ok(!store.getActiveWorkTypes().includes('Clínica'), 'Can be deactivated');
});

test('Expense Categories & PF vs PJ Management', () => {
  const store = new PediatricStore();
  store.resetToDefault();

  // Check required PF categories
  const requiredPF = ['Lazer', 'Educação', 'Alimentação', 'Transporte', 'Presentes', 'Lar', 'Beleza', 'Saúde', 'Viagens'];
  requiredPF.forEach(cat => {
    assert.ok(EXPENSE_CATEGORIES_PF.includes(cat), `Must include PF category: ${cat}`);
    assert.equal(getCategoryScope(cat), 'pf', `${cat} must be categorized as pf`);
  });

  // Check PJ categories
  assert.ok(EXPENSE_CATEGORIES_PJ.includes('Consultório/Sublocação'));
  assert.ok(EXPENSE_CATEGORIES_PJ.includes('CRM/RQE/SBP'));
  assert.equal(getCategoryScope('Consultório/Sublocação'), 'pj');

  // Add mixed PF and PJ expenses
  store.addExpense({
    description: 'Jantar em família',
    category: 'Alimentação',
    value: 300,
    dueDate: '2026-09-05',
    scope: 'pf'
  });

  store.addExpense({
    description: 'Anuidade CRM',
    category: 'CRM/RQE/SBP',
    value: 800,
    dueDate: '2026-09-10',
    scope: 'pj'
  });

  // Previous month expense for MoM comparison
  store.addExpense({
    description: 'Supermercado',
    category: 'Alimentação',
    value: 200,
    dueDate: '2026-08-15',
    scope: 'pf'
  });

  const mom = store.getMonthOverMonthExpenseVariation('2026-09');
  assert.equal(mom.currentTotal, 1100);
  assert.equal(mom.prevTotal, 200);
  assert.equal(mom.currentPF, 300);
  assert.equal(mom.currentPJ, 800);
  assert.equal(mom.diffValue, 900);
  assert.equal(mom.isIncrease, true);

  const foodCat = mom.categoryComparison.find(c => c.category === 'Alimentação');
  assert.ok(foodCat);
  assert.equal(foodCat.currentAmount, 300);
  assert.equal(foodCat.previousAmount, 200);
  assert.equal(foodCat.diffValue, 100);
  assert.equal(foodCat.diffPercent, 50.0);
});

test('Freedom to modify and customize expense categories (Contador, Mercantil/Mercado, Lanches, etc.)', () => {
  const store = new PediatricStore('test_store_custom_cats');
  store.resetToDefault();

  // Initially empty custom categories
  assert.equal(store.getCustomExpenseCategories().length, 0);

  // 1. Doctor adds new custom categories
  const cat1 = store.addExpenseCategory({ name: 'Contador', scope: 'pj' });
  assert.ok(cat1);
  assert.equal(cat1.name, 'Contador');
  assert.equal(cat1.scope, 'pj');

  const cat2 = store.addExpenseCategory('Mercantil/Mercado', 'pf');
  assert.ok(cat2);
  assert.equal(cat2.name, 'Mercantil/Mercado');
  assert.equal(cat2.scope, 'pf');

  const cat3 = store.addExpenseCategory('Lanches');
  assert.ok(cat3);
  assert.equal(cat3.name, 'Lanches');
  assert.equal(cat3.scope, 'pf'); // default scope is pf

  assert.equal(store.getCustomExpenseCategories().length, 3);

  // 2. Duplicate prevention (case-insensitive)
  const duplicate = store.addExpenseCategory('contador', 'pj');
  assert.equal(store.getCustomExpenseCategories().length, 3);
  assert.equal(duplicate.name, 'Contador');

  // 3. Querying categories by scope
  const pjCategories = store.getExpenseCategories('pj');
  assert.ok(pjCategories.includes('Contador'), 'Must include Contador in PJ');
  assert.ok(pjCategories.includes('Consultório/Sublocação'), 'Must include default PJ');
  assert.ok(!pjCategories.includes('Mercantil/Mercado'), 'Must NOT include PF in PJ');

  const pfCategories = store.getExpenseCategories('pf');
  assert.ok(pfCategories.includes('Mercantil/Mercado'), 'Must include Mercantil/Mercado in PF');
  assert.ok(pfCategories.includes('Lanches'), 'Must include Lanches in PF');
  assert.ok(!pfCategories.includes('Contador'), 'Must NOT include PJ in PF');

  const allCategories = store.getExpenseCategories();
  assert.ok(allCategories.includes('Contador'));
  assert.ok(allCategories.includes('Mercantil/Mercado'));
  assert.ok(allCategories.includes('Lanches'));

  // 4. Scope resolution helper
  assert.equal(store.getCategoryScope('Contador'), 'pj');
  assert.equal(store.getCategoryScope('Mercantil/Mercado'), 'pf');
  assert.equal(store.getCategoryScope('Lanches'), 'pf');
  assert.equal(getCategoryScope('Contador'), 'pj');
  assert.equal(getCategoryScope('Mercantil/Mercado'), 'pf');

  // 5. Registering expenses with custom categories
  const exp1 = store.addExpense({
    description: 'Honorários contábeis PJ',
    category: 'Contador',
    value: 650,
    dueDate: '2026-09-10'
  });
  assert.equal(exp1.scope, 'pj', 'Contador expense must automatically have scope pj');

  const exp2 = store.addExpense({
    description: 'Compras semanais mercado',
    category: 'Mercantil/Mercado',
    value: 420,
    dueDate: '2026-09-12'
  });
  assert.equal(exp2.scope, 'pf', 'Mercantil expense must have scope pf');

  const exp3 = store.addExpense({
    description: 'Café e lanche do plantão',
    category: 'Lanches',
    value: 85,
    dueDate: '2026-09-15'
  });
  assert.equal(exp3.scope, 'pf', 'Lanches expense must have scope pf');

  // 6. Monthly Report includes custom categories in categoryBreakdown
  const report = store.getMonthlyReport('2026-09');
  assert.equal(report.expenses.total, 650 + 420 + 85);
  const contadorItem = report.expenses.categoryBreakdown.find(b => b.category === 'Contador');
  assert.ok(contadorItem, 'Contador must exist in report category breakdown');
  assert.equal(contadorItem.amount, 650);
  assert.equal(contadorItem.scope, 'pj');

  const mercadoItem = report.expenses.categoryBreakdown.find(b => b.category === 'Mercantil/Mercado');
  assert.ok(mercadoItem, 'Mercantil/Mercado must exist in report category breakdown');
  assert.equal(mercadoItem.amount, 420);
  assert.equal(mercadoItem.scope, 'pf');

  // 7. Month-Over-Month variation with custom categories
  store.addExpense({
    description: 'Honorários mês anterior',
    category: 'Contador',
    value: 600,
    dueDate: '2026-08-10',
    scope: 'pj'
  });

  const mom = store.getMonthOverMonthExpenseVariation('2026-09', 'pj');
  const contadorMoM = mom.categoryComparison.find(c => c.category === 'Contador');
  assert.ok(contadorMoM, 'Contador must exist in MoM category comparison');
  assert.equal(contadorMoM.currentAmount, 650);
  assert.equal(contadorMoM.previousAmount, 600);
  assert.equal(contadorMoM.diffValue, 50);

  // 8. Updating custom category cascades to existing expenses
  const updated = store.updateExpenseCategory('Contador', { name: 'Contabilidade & BPO', scope: 'pj' });
  assert.ok(updated);
  assert.equal(updated.name, 'Contabilidade & BPO');
  assert.ok(store.getExpenseCategories('pj').includes('Contabilidade & BPO'));
  assert.ok(!store.getExpenseCategories('pj').includes('Contador'));

  const reloadedExp1 = store.data.expenses.find(e => e.id === exp1.id);
  assert.equal(reloadedExp1.category, 'Contabilidade & BPO', 'Existing expense category must cascade update');

  // 9. Deleting custom category
  const deleted = store.deleteExpenseCategory('Lanches');
  assert.ok(deleted);
  assert.ok(!store.getExpenseCategories('pf').includes('Lanches'));

  // 10. Edge cases: empty/null handling
  assert.equal(store.addExpenseCategory(''), null);
  assert.equal(store.addExpenseCategory(null), null);
  assert.equal(store.deleteExpenseCategory('Inexistente'), false);
});

test('Trash & Undo Recovery mechanism in PediatricStore', () => {
  const store = new PediatricStore();
  store.resetToDefault();

  const shift = store.addShift({
    hospital: 'MEJEC',
    shiftDate: '2026-09-20',
    grossValue: 1200,
    netValue: 1128
  });

  const expense = store.addExpense({
    description: 'Passagem aérea congresso',
    category: 'Viagens',
    value: 1500,
    dueDate: '2026-09-25'
  });

  assert.equal(store.data.shifts.length, 1);
  assert.equal(store.data.expenses.length, 1);
  assert.equal(store.getTrash().length, 0);

  // Delete shift
  store.deleteShift(shift.id);
  assert.equal(store.data.shifts.length, 0);
  assert.equal(store.getTrash().length, 1);
  assert.equal(store.getTrash()[0].itemType, 'shift');

  // Undo delete
  const restoredShift = store.undoLastDelete();
  assert.ok(restoredShift);
  assert.equal(store.data.shifts.length, 1);
  assert.equal(store.data.shifts[0].id, shift.id);
  assert.equal(store.getTrash().length, 0);

  // Delete expense
  store.deleteExpense(expense.id);
  assert.equal(store.data.expenses.length, 0);
  assert.equal(store.getTrash().length, 1);
  assert.equal(store.getTrash()[0].itemType, 'expense');

  // Restore by trash ID
  const trashEntry = store.getTrash()[0];
  const restoredExp = store.restoreFromTrash(trashEntry.id);
  assert.ok(restoredExp);
  assert.equal(store.data.expenses.length, 1);
  assert.equal(store.data.expenses[0].id, expense.id);
});

test('Safe Area & Top Margin Protection', () => {
  const css = fs.readFileSync(path.join(rootDir, 'css', 'styles.css'), 'utf8').replace(/\r\n/g, '\n');
  assert.ok(css.includes('--safe-top: max(env(safe-area-inset-top, 0px), 52px);'), 'Must enforce minimum 52px safe-top');
  assert.ok(css.includes('.glass-header {\n  padding-top: var(--safe-top) !important;'), 'Glass header must enforce safe-top with !important');

  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert.ok(html.includes('pt-safe') && html.includes('glass-header') && html.includes('pb-2.5'), 'Header must have pt-safe and pb-2.5');
  assert.ok(!html.includes('glass-header px-4 py-2'), 'py-2 must be removed so safe area is preserved');
  assert.ok(html.includes('id="baby-reaction-overlay"'), 'Must have baby-reaction-overlay element');
});

test('App Brand & Immutable Creator Signature (FChNeto)', () => {
  assert.equal(APP_CREATOR.name, 'FChNeto');
  assert.equal(APP_CREATOR.signature, 'Criado por FChNeto');
  assert.equal(APP_CREATOR.app, 'Finanças Pediatria');

  const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.name, 'Finanças Pediatria');
  assert.equal(manifest.short_name, 'Finanças Pediatria');
  assert.ok(manifest.description.includes('FChNeto'));

  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert.ok(html.includes('<title>Finanças Pediatria</title>'));
  assert.ok(html.includes('Finanças Pediatria'));
});

test('D+60 Scoped CSV Export includes D+60 installment in target month with delay evaluation', () => {
  const store = new PediatricStore();
  store.resetToDefault();

  // Shift worked in September, 80% due in November (D+60), 20% due in December (D+90)
  store.addShift({
    hospital: 'Maternidade Araken',
    shiftDate: '2026-09-10',
    grossValue: 1200,
    netValue: 1128,
    splitPayment: true
  });

  // Export CSV for November 2026 (onlyMonth: true) evaluated on November 15 (5 days after D+60 due date)
  const csvNov = store.generateCSV('2026-11', {
    onlyMonth: true,
    referenceDate: new Date('2026-11-15T12:00:00')
  });

  assert.ok(csvNov.includes('Maternidade Araken'), 'Must include September shift in November CSV because of D+60 installment');
  assert.ok(csvNov.includes('(75%)'), 'Must specify 75% installment in November');
  assert.ok(csvNov.includes('Em Atraso'), 'Must flag D+60 installment as Em Atraso on Nov 15 since it was due Nov 10');

  // Toggle installment 1 as received on November 12
  const shift = store.data.shifts[0];
  store.toggleShiftInstallment(shift.id, 1, '2026-11-12');

  const csvNovPaid = store.generateCSV('2026-11', {
    onlyMonth: true,
    referenceDate: new Date('2026-11-15T12:00:00')
  });
  assert.ok(csvNovPaid.includes('Recebido'), 'Must show Recebido when installment is paid');
});

test('evaluateShiftStatus handles installment items accurately', () => {
  // Overdue installment
  const overdueInst = {
    isInstallment: true,
    installmentNumber: 1,
    installmentPercent: 80,
    installmentDueDate: '2026-11-10',
    installmentStatus: 'pending'
  };
  const evDelayed = evaluateShiftStatus(overdueInst, new Date('2026-11-15T12:00:00'));
  assert.equal(evDelayed.status, 'delayed');
  assert.equal(evDelayed.isDelayed, true);
  assert.equal(evDelayed.delayDays, 5);
  assert.equal(evDelayed.label, 'Atrasado (+5d)');

  // Paid installment
  const paidInst = {
    isInstallment: true,
    installmentNumber: 1,
    installmentPercent: 80,
    installmentDueDate: '2026-11-10',
    installmentStatus: 'received',
    paidDate: '2026-11-12'
  };
  const evPaid = evaluateShiftStatus(paidInst, new Date('2026-11-15T12:00:00'));
  assert.equal(evPaid.status, 'received');
  assert.equal(evPaid.isDelayed, false);
  assert.ok(evPaid.label.includes('12/11/2026'));
});

test('Fixed Salary deletion to trash and 1-tap recovery', () => {
  const store = new PediatricStore();
  store.resetToDefault();

  const salary = store.upsertFixedSalary({
    description: 'Cargo UTI Neonatal Concursada',
    value: 8500,
    payDay: 5
  });

  assert.equal(store.data.fixedSalaries.length, 1);
  assert.equal(store.getTrash().length, 0);

  // Delete salary
  const deleted = store.deleteFixedSalary(salary.id);
  assert.equal(deleted, true);
  assert.equal(store.data.fixedSalaries.length, 0);
  assert.equal(store.getTrash().length, 1);
  assert.equal(store.getTrash()[0].itemType, 'salary');

  // Undo last delete
  const restored = store.undoLastDelete();
  assert.ok(restored);
  assert.equal(store.data.fixedSalaries.length, 1);
  assert.equal(store.data.fixedSalaries[0].id, salary.id);
  assert.equal(store.getTrash().length, 0);

  // Delete again and restore by trash ID
  store.deleteFixedSalary(salary.id);
  assert.equal(store.data.fixedSalaries.length, 0);
  const trashEntry = store.getTrash()[0];
  const restoredById = store.restoreFromTrash(trashEntry.id);
  assert.ok(restoredById);
  assert.equal(store.data.fixedSalaries.length, 1);
  assert.equal(store.data.fixedSalaries[0].id, salary.id);
});


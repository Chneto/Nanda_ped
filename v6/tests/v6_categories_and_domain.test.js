/**
 * v6_categories_and_domain.test.js
 * Test Suite: 23 Canonical Categories, Customization & Core Financial Domain Engine for v6
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  APP_CREATOR,
  APP_VERSION,
  CANONICAL_CATEGORIES,
  DEFAULT_CATEGORIES,
  MACRO_GROUPS,
  MACRO_GROUPS_RECORD,
  normalizeCategoryName,
  getCategoryKey,
  getMacroGroupForCategory,
  calculateShiftInstallments,
  addMonthsToDateString,
  generateExpenseInstallments,
  PediatricStore
} from '../js/store.js';

describe('Finanças Pediatria v6 - Categories & Domain Engine Suite', () => {

  let store;

  beforeEach(() => {
    store = new PediatricStore();
    store.data = store.getDefaultState();
  });

  describe('1. Taxonomy & 23 Canonical Categories Verification', () => {

    test('All 23 canonical categories are present in CANONICAL_CATEGORIES list', () => {
      assert.equal(CANONICAL_CATEGORIES.length, 23, 'Must contain exactly 23 canonical categories');

      const expectedCategories = [
        'Passagens', 'Mercantil', 'Academia', 'Estudo', 'Cursos',
        'Presentes', 'Aluguel', 'Energia', 'Internet', 'Combustível',
        'Qualificação/Congresso/Pós', 'Fisioterapia', 'Água', 'Lanches',
        'Doação', 'Refeição', 'Beleza/Salão', 'Uber', 'Remédios',
        'Compras Parceladas', 'Saídas', 'Delivery', 'Produtos de beleza'
      ];

      for (const cat of expectedCategories) {
        assert.ok(
          CANONICAL_CATEGORIES.includes(cat),
          `Canonical category "${cat}" must exist in CANONICAL_CATEGORIES`
        );
      }
    });

    test('All 23 canonical categories exist in DEFAULT_CATEGORIES with valid metadata', () => {
      assert.equal(DEFAULT_CATEGORIES.length, 23);

      for (const def of DEFAULT_CATEGORIES) {
        assert.ok(def.id, `Category ${def.name} must have an ID`);
        assert.ok(def.name, 'Category must have a name');
        assert.ok(def.icon, `Category ${def.name} must have an icon`);
        assert.ok(def.color, `Category ${def.name} must have a color`);
        assert.ok(def.macroGroup || def.macro_group, `Category ${def.name} must have a macroGroup`);
        assert.equal(def.isDefault, true, `Category ${def.name} must be marked isDefault: true`);
      }
    });

    test('The 6 Macro-Groups are defined with color, icon and valid category mappings', () => {
      assert.equal(MACRO_GROUPS.length, 6, 'Must define exactly 6 Macro-Groups');

      const expectedMacroIds = [
        'macro_alimentacao',
        'macro_transporte',
        'macro_moradia',
        'macro_formacao',
        'macro_saude_beleza',
        'macro_lazer_outros'
      ];

      for (const id of expectedMacroIds) {
        const found = MACRO_GROUPS.find(g => g.id === id);
        assert.ok(found, `Macro-Group ${id} must exist`);
        assert.ok(found.name, `Macro-Group ${id} must have a name`);
        assert.ok(found.categories.length > 0, `Macro-Group ${id} must have categories`);
      }
    });

    test('getMacroGroupForCategory resolves canonical and alias categories accurately', () => {
      // Direct canonical categories
      assert.equal(getMacroGroupForCategory('Aluguel').name, 'Moradia & Contas');
      assert.equal(getMacroGroupForCategory('Mercantil').name, 'Alimentação');
      assert.equal(getMacroGroupForCategory('Combustível').name, 'Transporte & Mobilidade');
      assert.equal(getMacroGroupForCategory('Estudo').name, 'Formação & Carreira');
      assert.equal(getMacroGroupForCategory('Remédios').name, 'Saúde & Autocuidado');
      assert.equal(getMacroGroupForCategory('Presentes').name, 'Pessoal, Lazer & Outros');

      // Aliases and case insensitivity
      assert.equal(getMacroGroupForCategory('aluguel').name, 'Moradia & Contas');
      assert.equal(getMacroGroupForCategory('  mercantil  ').name, 'Alimentação');
      assert.equal(getMacroGroupForCategory('combustivel').name, 'Transporte & Mobilidade');
      assert.equal(getMacroGroupForCategory('cosméticos').name, 'Saúde & Autocuidado');
      assert.equal(getMacroGroupForCategory('Desconhecida').name, 'Pessoal, Lazer & Outros');
    });
  });

  describe('2. Category Normalization, Customization & Historical Cascade', () => {

    test('normalizeCategoryName and getCategoryKey handle accents, spaces, and case', () => {
      assert.equal(normalizeCategoryName('  Mercantil   do Bairro  '), 'Mercantil do Bairro');
      assert.equal(getCategoryKey('  Qualificação/Congresso/Pós  '), 'qualificacao/congresso/pos');
      assert.equal(getCategoryKey('Água Mineral'), 'agua mineral');
      assert.equal(getCategoryKey('SAÚDAS'), 'saudas');
    });

    test('addCategory creates custom category and blocks duplicates', () => {
      const newCat = store.addCategory({
        name: 'Livros Médicos',
        macroGroup: 'Formação & Carreira',
        icon: 'book',
        color: '#3F51B5'
      });

      assert.ok(newCat);
      assert.equal(newCat.name, 'Livros Médicos');
      assert.equal(newCat.macroGroup, 'Formação & Carreira');
      assert.equal(newCat.isCustom, true);

      // Attempt duplicate with different casing/accents
      const duplicate = store.addCategory({
        name: '  livros medicos  ',
        macroGroup: 'Pessoal, Lazer & Outros'
      });
      assert.equal(duplicate, null, 'Duplicate category addition must return null');

      // Attempt duplicate of an existing canonical category
      const canonicalDup = store.addCategory({
        name: 'aluguel',
        macroGroup: 'Moradia & Contas'
      });
      assert.equal(canonicalDup, null, 'Duplicate of canonical category must return null');
    });

    test('updateCategory renames category and reclassifies existing expenses', () => {
      // 1. Create expenses under 'Passagens'
      store.saveExpense({
        description: 'Voo Congresso SP',
        amount: 850.00,
        date: '2026-05-10',
        category: 'Passagens'
      });

      store.saveExpense({
        description: 'Voo Retorno',
        amount: 720.00,
        date: '2026-05-15',
        category: 'Passagens'
      });

      assert.equal(store.data.expenses.length, 2);
      assert.equal(store.data.expenses[0].category, 'Passagens');
      assert.equal(store.data.expenses[0].macro_group, 'Transporte & Mobilidade');

      // 2. Update category 'Passagens' to 'Viagens & Passagens' under 'Pessoal, Lazer & Outros'
      const passagensDef = store.getAllCategories().find(c => c.name === 'Passagens');
      assert.ok(passagensDef);

      const result = store.updateCategory(passagensDef.id, {
        name: 'Viagens & Passagens',
        macroGroup: 'Pessoal, Lazer & Outros',
        icon: 'flight',
        color: '#9C27B0'
      });

      assert.equal(result.updated, true);
      assert.equal(result.category.name, 'Viagens & Passagens');

      // 3. Verify historical expenses cascade
      assert.equal(store.data.expenses[0].category, 'Viagens & Passagens');
      assert.equal(store.data.expenses[0].macro_group, 'Pessoal, Lazer & Outros');
      assert.equal(store.data.expenses[0].categoryId, passagensDef.id);

      assert.equal(store.data.expenses[1].category, 'Viagens & Passagens');
      assert.equal(store.data.expenses[1].macro_group, 'Pessoal, Lazer & Outros');
    });

    test('deleteCustomCategory protects categories currently in use by expenses', () => {
      const custom = store.addCategory({
        name: 'Brinquedoteca',
        macroGroup: 'Pessoal, Lazer & Outros'
      });

      // Add expense with custom category
      store.saveExpense({
        description: 'Jogos educativos',
        amount: 150.00,
        date: '2026-04-10',
        category: 'Brinquedoteca'
      });

      // Attempt to delete category in use
      const resInUse = store.deleteCustomCategory(custom.id);
      assert.equal(resInUse.deleted, false);
      assert.equal(resInUse.inUse, true);

      // Delete the expense first
      store.data.expenses = [];

      // Now delete should succeed
      const resSuccess = store.deleteCustomCategory(custom.id);
      assert.equal(resSuccess.deleted, true);
      assert.equal(resSuccess.inUse, false);
    });
  });

  describe('3. Core Financial Business Rules & Calculations', () => {

    test('Parturition shifts strictly apply 75% D+60 (2 months) and 25% D+90 (3 months)', () => {
      const workedDate = '2026-03-15';
      const netValue = 2400.00;

      const installments = calculateShiftInstallments(netValue, workedDate);

      // Installment 1: 75% at D+60 (May 2026)
      assert.equal(installments.installment1.value, 1800.00);
      assert.equal(installments.installment1.date, '2026-05-15');
      assert.equal(installments.installment1.status, 'pending');

      // Installment 2: 25% at D+90 (June 2026)
      assert.equal(installments.installment2.value, 600.00);
      assert.equal(installments.installment2.date, '2026-06-15');
      assert.equal(installments.installment2.status, 'pending');

      // Total sum exactness
      assert.equal(
        installments.installment1.value + installments.installment2.value,
        netValue
      );
    });

    test('Parturition shifts preserve cent precision without floating-point drift', () => {
      const netValue = 1833.33;
      const installments = calculateShiftInstallments(netValue, '2026-01-10');

      // 75% of 1833.33 = 1374.9975 -> 1375.00
      // 25% remainder = 1833.33 - 1375.00 = 458.33
      assert.equal(installments.installment1.value, 1375.00);
      assert.equal(installments.installment2.value, 458.33);
      assert.equal(
        Math.round((installments.installment1.value + installments.installment2.value) * 100) / 100,
        netValue
      );
    });

    test('addMonthsToDateString correctly clamps month-end dates', () => {
      // Jan 31 + 1 month = Feb 28 (non-leap)
      assert.equal(addMonthsToDateString('2026-01-31', 1), '2026-02-28');

      // March 31 + 2 months = May 31
      assert.equal(addMonthsToDateString('2026-03-31', 2), '2026-05-31');

      // March 31 + 3 months = June 30 (June has 30 days)
      assert.equal(addMonthsToDateString('2026-03-31', 3), '2026-06-30');

      // August 31 + 1 month = Sept 30
      assert.equal(addMonthsToDateString('2026-08-31', 1), '2026-09-30');
    });

    test('Installment purchases (2x-24x) distribute across months with remainder on 1st installment', () => {
      const expense = {
        description: 'Estetoscópio Littmann',
        amount: 1000.00,
        date: '2026-04-10',
        category: 'Estudo'
      };

      const installments = generateExpenseInstallments(expense, 3);
      assert.equal(installments.length, 3);

      // 1000 / 3 = 333.3333...
      // Installment 1 gets remainder: 333.34
      // Installment 2 & 3 get: 333.33
      assert.equal(installments[0].amount, 333.34);
      assert.equal(installments[0].date, '2026-04-10');
      assert.equal(installments[0].current_installment, 1);
      assert.equal(installments[0].installmentNumber, 1);
      assert.equal(installments[0].total_installments, 3);

      assert.equal(installments[1].amount, 333.33);
      assert.equal(installments[1].date, '2026-05-10');
      assert.equal(installments[1].current_installment, 2);
      assert.equal(installments[1].installmentNumber, 2);

      assert.equal(installments[2].amount, 333.33);
      assert.equal(installments[2].date, '2026-06-10');
      assert.equal(installments[2].current_installment, 3);
      assert.equal(installments[2].installmentNumber, 3);

      const totalSum = installments.reduce((sum, i) => sum + i.amount, 0);
      assert.equal(Math.round(totalSum * 100) / 100, 1000.00);
    });

    test('Regime de Caixa vs Regime de Competência reports behave accurately', () => {
      // Set residency salary R$ 4.000,00
      store.updateResidencySalary({ value: 4000.00, active: true });

      // Save a shift worked in March 2026 (R$ 2.000,00)
      // D+60 (75% = R$ 1.500) arrives in May 2026
      // D+90 (25% = R$ 500) arrives in June 2026
      store.saveShift({
        hospital: 'Maternidade Principal',
        date: '2026-03-15',
        netValue: 2000.00
      });

      // Save expense in March 2026 (R$ 500,00) and May 2026 (R$ 1.200,00)
      store.saveExpense({
        description: 'Mercado Março',
        amount: 500.00,
        date: '2026-03-10',
        category: 'Mercantil'
      });

      store.saveExpense({
        description: 'Aluguel Maio',
        amount: 1200.00,
        date: '2026-05-05',
        category: 'Aluguel'
      });

      // 1. Competence in March: Salary (4000) + Worked shift (2000) - Expense (500) = Balance 5500
      const compMarch = store.getMonthSummary('2026-03', 'competencia');
      assert.equal(compMarch.residencyIncome, 4000.00);
      assert.equal(compMarch.shiftIncome, 2000.00);
      assert.equal(compMarch.totalIncome, 6000.00);
      assert.equal(compMarch.totalExpenses, 500.00);
      assert.equal(compMarch.balance, 5500.00);

      // 2. Cash in March: Salary (4000) + Shift cash in March (0) - Expense (500) = Balance 3500
      const cashMarch = store.getMonthSummary('2026-03', 'caixa');
      assert.equal(cashMarch.residencyIncome, 4000.00);
      assert.equal(cashMarch.shiftIncome, 0.00);
      assert.equal(cashMarch.totalIncome, 4000.00);
      assert.equal(cashMarch.totalExpenses, 500.00);
      assert.equal(cashMarch.balance, 3500.00);

      // 3. Cash in May: Salary (4000) + D+60 (1500) - Expense (1200) = Balance 4300
      const cashMay = store.getMonthSummary('2026-05', 'caixa');
      assert.equal(cashMay.residencyIncome, 4000.00);
      assert.equal(cashMay.shiftIncome, 1500.00);
      assert.equal(cashMay.totalIncome, 5500.00);
      assert.equal(cashMay.totalExpenses, 1200.00);
      assert.equal(cashMay.balance, 4300.00);
    });

    test('Toggling shift installment status marks payment and updates received totals', () => {
      const shift = store.saveShift({
        hospital: 'Hospital Pediátrico',
        date: '2026-01-10',
        netValue: 1000.00
      });

      // Initial pending status for D+60 (March)
      let summaryBefore = store.getMonthSummary('2026-03', 'caixa');
      assert.equal(summaryBefore.shiftsReceivedValue, 0);
      assert.equal(summaryBefore.shiftsPendingValue, 750.00);

      // Toggle installment 1 as received
      store.toggleShiftInstallment(shift.id, 1);

      let summaryAfter = store.getMonthSummary('2026-03', 'caixa');
      assert.equal(summaryAfter.shiftsReceivedValue, 750.00);
      assert.equal(summaryAfter.shiftsPendingValue, 0.00);
    });

    test('Macro-group breakdown and percentages in monthly summary', () => {
      store.saveExpense({
        description: 'Supermercado',
        amount: 600.00,
        date: '2026-04-05',
        category: 'Mercantil'
      });

      store.saveExpense({
        description: 'Aluguel',
        amount: 1400.00,
        date: '2026-04-05',
        category: 'Aluguel'
      });

      const summary = store.getMonthSummary('2026-04', 'caixa');
      assert.equal(summary.totalExpenses, 2000.00);
      assert.equal(summary.macroBreakdown.length, 2);

      const moradia = summary.macroBreakdown.find(m => m.name === 'Moradia & Contas');
      assert.ok(moradia);
      assert.equal(moradia.value, 1400.00);
      assert.equal(moradia.percentage, 70.0);

      const alimentacao = summary.macroBreakdown.find(m => m.name === 'Alimentação');
      assert.ok(alimentacao);
      assert.equal(alimentacao.value, 600.00);
      assert.equal(alimentacao.percentage, 30.0);
    });

    test('generateExpenseInstallments assigns valid category_id and categoryId', () => {
      const singleInstallment = generateExpenseInstallments({
        description: 'Livro de Neonatologia',
        amount: 250.00,
        category: 'Estudo',
        date: '2026-03-15',
        installmentsCount: 1
      }, store.data.categories);

      assert.equal(singleInstallment.length, 1);
      assert.equal(singleInstallment[0].category, 'Estudo');
      assert.equal(singleInstallment[0].category_id, 'cat_estudo');
      assert.equal(singleInstallment[0].categoryId, 'cat_estudo');

      const multiInstallment = generateExpenseInstallments({
        description: 'Estetoscópio Master',
        amount: 600.00,
        category: 'Remédios',
        date: '2026-03-15',
        installmentsCount: 3
      }, store.data.categories);

      assert.equal(multiInstallment.length, 3);
      for (const inst of multiInstallment) {
        assert.equal(inst.category, 'Remédios');
        assert.equal(inst.category_id, 'cat_remedios');
        assert.equal(inst.categoryId, 'cat_remedios');
      }
    });

    test('Domain input validation handles non-finite or negative values safely', () => {
      // saveShift validation returns null on negative or non-finite
      assert.equal(store.saveShift({ hospital: 'Hospital A', date: '2026-05-10', netValue: -500 }), null);
      assert.equal(store.saveShift({ hospital: 'Hospital A', date: '2026-05-10', netValue: NaN }), null);

      // saveExpense validation returns null on zero, negative or non-finite
      assert.equal(store.saveExpense({ description: 'Teste', amount: 0, date: '2026-05-10', category: 'Passagens' }), null);
      assert.equal(store.saveExpense({ description: 'Teste', amount: -100, date: '2026-05-10', category: 'Passagens' }), null);
      assert.equal(store.saveExpense({ description: 'Teste', amount: NaN, date: '2026-05-10', category: 'Passagens' }), null);
    });

    test('importBackupFromFile enforces 10MB limit and supports rollback', () => {
      // Create initial state
      store.saveShift({ hospital: 'Hospital Baseline', date: '2026-01-01', netValue: 2000 });
      assert.equal(store.data.shifts.length, 1);

      // 1. Oversized string (> 10MB)
      const hugeString = 'a'.repeat(11 * 1024 * 1024);
      const oversizeRes = store.importBackupFromFile(hugeString);
      assert.equal(oversizeRes.success, false);
      assert.ok(oversizeRes.error.includes('10MB'));

      // 2. Valid backup import
      const validBackup = {
        version: '6.0.0',
        creator: 'FChNeto',
        shifts: [
          { id: 'imp-s1', hospital: 'Hospital Importado', date: '2026-02-01', netValue: 3500 }
        ],
        expenses: [
          { id: 'imp-e1', description: 'Despesa Importada', amount: 120, date: '2026-02-05', category: 'Lanches' }
        ]
      };
      const validJson = JSON.stringify(validBackup);

      const importRes = store.importBackupFromFile(validJson);
      assert.equal(importRes.success, true);
      assert.equal(store.data.shifts.length, 1);
      assert.equal(store.data.shifts[0].hospital, 'Hospital Importado');

      // 3. Rollback import to previous baseline
      const rollbackRes = store.rollbackImport();
      assert.equal(rollbackRes.success, true);
      assert.equal(store.data.shifts.length, 1);
      assert.equal(store.data.shifts[0].hospital, 'Hospital Baseline');
    });
  });

  describe('4. Canonical Creator & Version Integrity', () => {
    test('Immutable creator FChNeto is preserved in store and defaults', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(APP_VERSION, '6.0.0');
      assert.equal(store.data.creator, 'FChNeto');
    });
  });
});

/**
 * v7_categories_and_domain.test.js
 * Test Suite: 23 Canonical Categories, Customization & Core Financial Domain Engine for v7
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
  createCanonicalExpense,
  PediatricStore
} from '../js/store.js';

describe('Finanças Pediatria v7 - Categories & Domain Engine Suite', () => {

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
      assert.equal(getMacroGroupForCategory('remedios').name, 'Saúde & Autocuidado');
      assert.equal(getMacroGroupForCategory('REMEDIOS').name, 'Saúde & Autocuidado');
    });

    test('normalizeCategoryName and getCategoryKey handle accents, spaces, and case', () => {
      assert.equal(normalizeCategoryName('  Remédios  '), 'Remédios');
      assert.equal(getCategoryKey('  Remédios  '), 'remedios');
      assert.equal(getCategoryKey('ÁGUA'), 'agua');
      assert.equal(getCategoryKey('Fisioterapia'), 'fisioterapia');
      assert.equal(getCategoryKey('Combustível'), 'combustivel');
    });
  });

  describe('2. Custom Category Management & Renaming', () => {

    test('Account can rename a default category and maintain stable category_id', () => {
      const passagensDef = store.getAllCategories().find(c => c.name === 'Passagens');
      assert.ok(passagensDef);

      const result = store.updateCategory(passagensDef.id, {
        name: 'Passagens & Voos',
        macroGroup: 'Transporte & Mobilidade'
      });

      assert.equal(result.updated, true);
      assert.equal(result.category.id, passagensDef.id);
      assert.equal(result.category.name, 'Passagens & Voos');

      const found = store.getAllCategories().find(c => c.id === passagensDef.id);
      assert.equal(found.name, 'Passagens & Voos');
    });

    test('Renaming category updates existing expense records retaining stable category_id', () => {
      const passagensDef = store.getAllCategories().find(c => c.name === 'Passagens');
      assert.ok(passagensDef);

      store.saveExpense({
        description: 'Passagem Aérea',
        amount: 800,
        date: '2026-04-01',
        category: 'Passagens',
        category_id: passagensDef.id
      });

      assert.equal(store.data.expenses[0].category, 'Passagens');

      store.updateCategory(passagensDef.id, {
        name: 'Voos Regionais'
      });

      assert.equal(store.data.expenses[0].category, 'Voos Regionais');
      assert.equal(store.data.expenses[0].category_id, passagensDef.id);
    });

    test('Prevents duplicate category names ignoring case and accents', () => {
      const added = store.addCategory({
        name: 'Supermercado Especial',
        macroGroup: 'Alimentação'
      });
      assert.ok(added);

      const duplicate = store.addCategory({
        name: 'supermercado especial',
        macroGroup: 'Alimentação'
      });
      assert.equal(duplicate, null);

      const accentDuplicate = store.addCategory({
        name: 'Supermercado  Especial',
        macroGroup: 'Alimentação'
      });
      assert.equal(accentDuplicate, null);
    });
  });

  describe('3. Core Financial Logic & Canonical Expense Model', () => {

    test('createCanonicalExpense produces canonical entity with backwards-compat getters', () => {
      const exp = createCanonicalExpense({
        id: 'exp-123',
        description: 'Livro Pediátrico',
        amount: 300,
        date: '2026-03-15',
        category_id: 'cat_estudo',
        category: 'Estudo',
        current_installment: 1,
        total_installments: 3
      });

      // Canonical snake_case properties
      assert.equal(exp.category_id, 'cat_estudo');
      assert.equal(exp.current_installment, 1);
      assert.equal(exp.total_installments, 3);

      // Backwards-compatibility camelCase getters
      assert.equal(exp.categoryId, 'cat_estudo');
      assert.equal(exp.currentInstallment, 1);
      assert.equal(exp.totalInstallments, 3);
    });

    test('Plantões Sala de Parto: 75% D+60 e 25% D+90 with cent remainder distribution', () => {
      const installments = calculateShiftInstallments(1000.00, '2026-01-31');

      // D+60: 2026-01-31 + 2 months = 2026-03-31
      assert.equal(installments.installment1.percentage, 75);
      assert.equal(installments.installment1.value, 750.00);
      assert.equal(installments.installment1.date, '2026-03-31');

      // D+90: 2026-01-31 + 3 months = 2026-04-30
      assert.equal(installments.installment2.percentage, 25);
      assert.equal(installments.installment2.value, 250.00);
      assert.equal(installments.installment2.date, '2026-04-30');

      // Cent remainder precision test
      const oddShift = calculateShiftInstallments(1000.01, '2026-01-15');
      const totalOdd = Math.round((oddShift.installment1.value + oddShift.installment2.value) * 100) / 100;
      assert.equal(totalOdd, 1000.01);
    });

    test('Cash Regime vs Competence Regime calculations', () => {
      // Salary: 4000
      store.data.residencySalary = { value: 4000.00, active: true };

      // Shift in January: 2000 (D+60 = March: 1500, D+90 = April: 500)
      store.saveShift({
        hospital: 'Maternidade Principal',
        date: '2026-01-15',
        netValue: 2000.00
      });

      // Shift in March: 2000 (Competence March: 2000, D+60 = May: 1500, D+90 = June: 500)
      store.saveShift({
        hospital: 'Hospital Pediátrico',
        date: '2026-03-10',
        netValue: 2000.00
      });

      // Expense in March: 1200
      store.saveExpense({
        description: 'Congresso',
        amount: 1200.00,
        date: '2026-03-20',
        category: 'Qualificação/Congresso/Pós'
      });

      // 1. Regime de Competência para Março/2026:
      // Salário (4000) + Produção trabalhada em Março (2000) - Despesas (1200) = 4800
      const compMarch = store.getMonthSummary('2026-03', 'competencia');
      assert.equal(compMarch.residencyIncome, 4000.00);
      assert.equal(compMarch.shiftIncome, 2000.00);
      assert.equal(compMarch.totalIncome, 6000.00);
      assert.equal(compMarch.totalExpenses, 1200.00);
      assert.equal(compMarch.balance, 4800.00);

      // 2. Regime de Caixa para Março/2026:
      // Salário (4000) + D+60 do plantão de Janeiro (1500) - Despesas (1200) = 4300
      const cashMarch = store.getMonthSummary('2026-03', 'caixa');
      assert.equal(cashMarch.residencyIncome, 4000.00);
      assert.equal(cashMarch.shiftIncome, 1500.00);
      assert.equal(cashMarch.totalIncome, 5500.00);
      assert.equal(cashMarch.totalExpenses, 1200.00);
      assert.equal(cashMarch.balance, 4300.00);
      assert.equal(cashMarch.totalExpenses, 1200.00);
      assert.equal(cashMarch.balance, 4300.00);
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
      assert.equal(store.saveShift({ hospital: 'Hospital A', date: '2026-05-10', netValue: -500 }), null);
      assert.equal(store.saveShift({ hospital: 'Hospital A', date: '2026-05-10', netValue: NaN }), null);

      assert.equal(store.saveExpense({ description: 'Teste', amount: 0, date: '2026-05-10', category: 'Passagens' }), null);
      assert.equal(store.saveExpense({ description: 'Teste', amount: -100, date: '2026-05-10', category: 'Passagens' }), null);
      assert.equal(store.saveExpense({ description: 'Teste', amount: NaN, date: '2026-05-10', category: 'Passagens' }), null);
    });

    test('importBackupFromFile enforces 10MB limit and supports rollback', () => {
      store.saveShift({ hospital: 'Hospital Baseline', date: '2026-01-01', netValue: 2000 });
      assert.equal(store.data.shifts.length, 1);

      // Oversized string (> 10MB)
      const hugeString = 'a'.repeat(11 * 1024 * 1024);
      const oversizeRes = store.importBackupFromFile(hugeString);
      assert.equal(oversizeRes.success, false);
      assert.ok(oversizeRes.error.includes('10MB'));

      // Valid backup import
      const validBackup = {
        version: '7.0.0',
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

      // Rollback import to previous baseline
      const rollbackRes = store.rollbackImport();
      assert.equal(rollbackRes.success, true);
      assert.equal(store.data.shifts.length, 1);
      assert.equal(store.data.shifts[0].hospital, 'Hospital Baseline');
    });
  });

  describe('4. Canonical Creator & Version Integrity', () => {
    test('Immutable creator FChNeto is preserved in store and defaults', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(APP_VERSION, '7.0.0');
      assert.equal(store.data.creator, 'FChNeto');
    });
  });
});

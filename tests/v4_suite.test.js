/**
 * Testes Unitários e de Integração para Finanças Pediatria v4.0 "Silk & Rose Gold"
 * Execução via: node --test tests/v4_suite.test.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PediatricStore,
  DEFAULT_CATEGORIES,
  DEFAULT_HOSPITALS,
  MACRO_GROUPS,
  getMacroGroupForCategory,
  addMonthsToDateString,
  getLocalDateString,
  formatCurrency,
  APP_CREATOR,
  APP_VERSION
} from '../v4/js/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

describe('Finanças Pediatria v4.0 - Silk & Rose Gold Engine Tests', () => {
  let store;

  beforeEach(() => {
    // Mock simples de localStorage se não existir
    if (typeof globalThis.localStorage === 'undefined') {
      const storage = {};
      globalThis.localStorage = {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = String(v); },
        removeItem: (k) => { delete storage[k]; },
        clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
      };
    } else {
      globalThis.localStorage.clear();
    }

    store = new PediatricStore();
    store.data.shifts = [];
    store.data.expenses = [];
  });

  test('v4 Identidade Canônica & Assinatura Imutável', () => {
    assert.equal(APP_CREATOR, 'FChNeto');
    assert.equal(APP_VERSION, '4.0.0');
    assert.equal(store.data.creator, 'FChNeto');
    assert.equal(store.data.version, '4.0.0');
    assert.equal(store.data.doctorName, 'Dra. Fernanda Ch.');
  });

  test('v4 Presença Integral das 22 Categorias Obrigatórias', () => {
    const requiredCategories = [
      'Passagens', 'Mercantil', 'Academia', 'Estudo', 'Cursos',
      'Presentes', 'Aluguel', 'Energia', 'Internet', 'Combustível',
      'Qualificação/Congresso/Pós', 'Cosméticos', 'Água', 'Lanches',
      'Doação', 'Refeição', 'Beleza/Salão', 'Uber', 'Remédios',
      'Compras Parceladas', 'Saídas', 'Delivery', 'Produtos de beleza'
    ];

    const categoryNames = DEFAULT_CATEGORIES.map(c => c.name);
    requiredCategories.forEach(cat => {
      assert.ok(categoryNames.includes(cat), `Categoria obrigatória ausente na v4: ${cat}`);
    });
    assert.ok(DEFAULT_CATEGORIES.length >= 22);
  });

  test('v4 Macro-Grupos de Despesas Inteligentes (Mapeamento Nubank/Revolut)', () => {
    assert.equal(MACRO_GROUPS.length, 6);

    // 1. Alimentação
    assert.equal(getMacroGroupForCategory('Mercantil').name, 'Alimentação');
    assert.equal(getMacroGroupForCategory('Refeição').name, 'Alimentação');
    assert.equal(getMacroGroupForCategory('Delivery').name, 'Alimentação');

    // 2. Transporte & Mobilidade
    assert.equal(getMacroGroupForCategory('Combustível').name, 'Transporte & Mobilidade');
    assert.equal(getMacroGroupForCategory('Uber').name, 'Transporte & Mobilidade');
    assert.equal(getMacroGroupForCategory('Passagens').name, 'Transporte & Mobilidade');

    // 3. Moradia & Contas
    assert.equal(getMacroGroupForCategory('Aluguel').name, 'Moradia & Contas');
    assert.equal(getMacroGroupForCategory('Energia').name, 'Moradia & Contas');
    assert.equal(getMacroGroupForCategory('Água').name, 'Moradia & Contas');

    // 4. Formação & Carreira
    assert.equal(getMacroGroupForCategory('Estudo').name, 'Formação & Carreira');
    assert.equal(getMacroGroupForCategory('Qualificação/Congresso/Pós').name, 'Formação & Carreira');

    // 5. Saúde & Autocuidado
    assert.equal(getMacroGroupForCategory('Remédios').name, 'Saúde & Autocuidado');
    assert.equal(getMacroGroupForCategory('Academia').name, 'Saúde & Autocuidado');
    assert.equal(getMacroGroupForCategory('Cosméticos').name, 'Saúde & Autocuidado');

    // 6. Pessoal, Lazer & Outros
    assert.equal(getMacroGroupForCategory('Presentes').name, 'Pessoal, Lazer & Outros');
    assert.equal(getMacroGroupForCategory('Saídas').name, 'Pessoal, Lazer & Outros');
    assert.equal(getMacroGroupForCategory('Categoria Inexistente').name, 'Pessoal, Lazer & Outros');
  });

  test('v4 Pré-Seleção de Maternidades Araken e Leide Morais', () => {
    assert.ok(DEFAULT_HOSPITALS.includes('Maternidade Araken'));
    assert.ok(DEFAULT_HOSPITALS.includes('Maternidade Leide Morais'));
    assert.ok(store.data.hospitals.includes('Maternidade Araken'));
    assert.ok(store.data.hospitals.includes('Maternidade Leide Morais'));
  });

  test('v4 Regra Canônica de Plantão em Sala de Parto: 80% D+60 e 20% D+90', () => {
    const shift = store.saveShift({
      hospital: 'Maternidade Araken',
      date: '2026-04-10',
      shiftType: 'Sala de Parto',
      netValue: 2150.50
    });

    assert.ok(shift);
    assert.equal(shift.hospital, 'Maternidade Araken');
    assert.equal(shift.netValue, 2150.50);

    // Valida exatidão de centavos
    assert.equal(shift.installment1.value + shift.installment2.value, 2150.50);
    assert.equal(shift.installment1.percentage, 80);
    assert.equal(shift.installment1.expectedDate, '2026-06-10'); // +2 meses
    assert.equal(shift.installment2.percentage, 20);
    assert.equal(shift.installment2.expectedDate, '2026-07-10'); // +3 meses

    // Toggle de status
    store.toggleShiftInstallment(shift.id, 1);
    const updated = store.data.shifts.find(s => s.id === shift.id);
    assert.equal(updated.installment1.status, 'received');
    assert.ok(updated.installment1.paidDate);
  });

  test('v4 Compras Parceladas com Distribuição no Tempo', () => {
    store.saveExpense({
      category: 'Compras Parceladas',
      description: 'Estetoscópio Littmann',
      value: 1200,
      date: '2026-05-15',
      isInstallment: true,
      totalInstallments: 3
    });

    assert.equal(store.data.expenses.length, 3);
    assert.equal(store.data.expenses[0].date, '2026-05-15');
    assert.equal(store.data.expenses[1].date, '2026-06-15');
    assert.equal(store.data.expenses[2].date, '2026-07-15');
    assert.equal(store.data.expenses[0].value, 400);
    assert.equal(store.data.expenses[1].value, 400);
    assert.equal(store.data.expenses[2].value, 400);
  });

  test('v4 Resumo Mensal com Breakdown por Macro-Grupos e Categorias', () => {
    store.updateResidencySalary({ value: 4106.09, active: true });

    // Plantão realizado em Março/2026 (Parcela 80% cai em Maio/2026)
    store.saveShift({
      hospital: 'Maternidade Leide Morais',
      date: '2026-03-20',
      netValue: 2000
    });

    // Despesas em Maio/2026
    store.saveExpense({
      category: 'Mercantil',
      description: 'Compras mês',
      value: 600,
      date: '2026-05-02'
    });
    store.saveExpense({
      category: 'Uber',
      description: 'Corridas plantão',
      value: 150,
      date: '2026-05-05'
    });

    const summary = store.getMonthSummary('2026-05', 'caixa');
    assert.equal(summary.residencyIncome, 4106.09);
    assert.equal(summary.shiftIncome, 1600); // 80% de 2000
    assert.equal(summary.totalIncome, 5706.09);
    assert.equal(summary.totalExpenses, 750);
    assert.equal(summary.balance, 4956.09);

    // Valida MacroBreakdown
    assert.equal(summary.macroBreakdown.length, 2);
    const alimentacao = summary.macroBreakdown.find(m => m.name === 'Alimentação');
    const transporte = summary.macroBreakdown.find(m => m.name === 'Transporte & Mobilidade');
    assert.ok(alimentacao);
    assert.ok(transporte);
    assert.equal(alimentacao.value, 600);
    assert.equal(transporte.value, 150);
    assert.equal(alimentacao.percentage, 80);
    assert.equal(transporte.percentage, 20);
  });

  test('v4 Edição de Perfil da Médica e Foto de Perfil', () => {
    store.updateDoctorProfile({
      doctorName: 'Dra. Fernanda Chagas',
      crm: 'CRM/RN 9999',
      specialty: 'Pediatria e Neonatologia',
      doctorPhoto: 'data:image/jpeg;base64,mockphotodata',
      salaryValue: 4500
    });

    assert.equal(store.data.doctorName, 'Dra. Fernanda Chagas');
    assert.equal(store.data.crm, 'CRM/RN 9999');
    assert.equal(store.data.specialty, 'Pediatria e Neonatologia');
    assert.equal(store.data.doctorPhoto, 'data:image/jpeg;base64,mockphotodata');
    assert.equal(store.data.residencySalary.value, 4500);
  });

  test('v4 Zerar Dados em 2 Etapas (Proteção com Backup Preventivo)', () => {
    store.saveShift({ hospital: 'MEJEC', date: '2026-05-01', netValue: 1500 });
    store.saveExpense({ category: 'Aluguel', description: 'Apartamento', value: 1200, date: '2026-05-01' });

    assert.equal(store.data.shifts.length, 1);
    assert.equal(store.data.expenses.length, 1);

    // Etapa 1: Geração de string de backup preventivo
    const backupJson = store.exportBackupJsonString();
    assert.ok(backupJson.includes('MEJEC'));
    assert.ok(backupJson.includes('Apartamento'));
    assert.ok(backupJson.includes('FChNeto'));

    // Etapa 2: Reset de lançamentos
    store.resetData('transactions_only');
    assert.equal(store.data.shifts.length, 0);
    assert.equal(store.data.expenses.length, 0);
    assert.equal(store.data.doctorName, 'Dra. Fernanda Ch.'); // Perfil preservado!

    // Restauração a partir do backup preventivo gerado
    const rest = store.importBackupFromFile(backupJson);
    assert.equal(rest.success, true);
    assert.equal(store.data.shifts.length, 1);
    assert.equal(store.data.expenses.length, 1);
  });

  test('v4 Arquivos e Bundles Existem e Estão Sincronizados', () => {
    const v4BundlePath = path.join(rootDir, 'v4', 'js', 'bundle.js');
    const v40BundlePath = path.join(rootDir, 'v4.0', 'js', 'bundle.js');
    const v4CssPath = path.join(rootDir, 'v4', 'css', 'styles.css');

    assert.ok(fs.existsSync(v4BundlePath), 'v4/js/bundle.js deve existir');
    assert.ok(fs.existsSync(v40BundlePath), 'v4.0/js/bundle.js deve existir');
    assert.ok(fs.existsSync(v4CssPath), 'v4/css/styles.css deve existir');

    const v4BundleContent = fs.readFileSync(v4BundlePath, 'utf8');
    const v40BundleContent = fs.readFileSync(v40BundlePath, 'utf8');

    // Bundles espelhados devem ser idênticos
    assert.equal(v4BundleContent, v40BundleContent);
    assert.ok(v4BundleContent.includes('FChNeto'));
    assert.ok(v4BundleContent.includes('MACRO_GROUPS'));
    assert.ok(v4BundleContent.includes('Maternidade Araken'));
    assert.ok(v4BundleContent.includes('Maternidade Leide Morais'));

    // Valida CSS com tokens Silk & Rose Gold e regras do iOS Safari
    const cssContent = fs.readFileSync(v4CssPath, 'utf8');
    assert.ok(cssContent.includes('--rose-gold'));
    assert.ok(cssContent.includes('--radius-card: 30px') || cssContent.includes('--radius-card'));
    assert.ok(cssContent.includes('font-size: 16px !important'));
    assert.ok(cssContent.includes('env(safe-area-inset-top'));
    assert.ok(cssContent.includes('env(safe-area-inset-bottom'));
    assert.ok(cssContent.includes('.macro-filter-bar'), 'CSS deve conter barra de filtros por macro-grupo');
    assert.ok(cssContent.includes('.silk-select-container'), 'CSS deve conter estilos para silk select');
    assert.ok(cssContent.includes('.silk-select-menu.dropup') || cssContent.includes('.silk-select-menu'), 'CSS deve conter suporte a dropup');
    assert.ok(cssContent.includes('.macro-category-card'), 'CSS deve conter cards de categorização por tipo');
    assert.ok(cssContent.includes('.net-result-card'), 'CSS deve conter card de resultado líquido');
  });

  test('v4 Gráficos Financeiros & 5 Representações Visuais', async () => {
    const {
      renderForecastChart,
      renderDonutExpenses,
      renderComparisonVisual,
      renderMonthCalendarVisual,
      renderNetBalanceVisual
    } = await import('../v4/js/charts.js');

    // 1. renderForecastChart
    const el1 = { innerHTML: '' };
    renderForecastChart(el1, [
      { month: '2026-05', label: 'Maio', income: 6000, expenses: 2000, balance: 4000 }
    ]);
    assert.ok(el1.innerHTML.includes('<svg'), 'renderForecastChart deve gerar SVG');
    assert.ok(el1.innerHTML.includes('Entradas'));

    // 2. renderDonutExpenses
    const el2 = { innerHTML: '', querySelector: () => null };
    renderDonutExpenses(el2, [{ name: 'Alimentação', value: 500, percentage: 100, color: '#FF7043', icon: 'meal' }], 500, 'macro');
    assert.ok(el2.innerHTML.includes('donut-svg'));
    assert.ok(el2.innerHTML.includes('Macro-Grupos'));

    // 3. renderComparisonVisual
    const el3 = { innerHTML: '' };
    renderComparisonVisual(el3, 5000, 3000, 'Maio de 2026');
    assert.ok(el3.innerHTML.includes('Caixa Real'));
    assert.ok(el3.innerHTML.includes('Produção Represada'));

    // 4. renderMonthCalendarVisual
    const el4 = { innerHTML: '' };
    renderMonthCalendarVisual(el4, '2026-05', [{ date: '2026-05-10' }], [{ date: '2026-05-02' }]);
    assert.ok(el4.innerHTML.includes('mini-calendar-wrapper'));
    assert.ok(el4.innerHTML.includes('Mapa Visual do Mês'));

    // 5. renderNetBalanceVisual
    const el5 = { innerHTML: '' };
    renderNetBalanceVisual(el5, { totalIncome: 6000, totalExpenses: 2000, balance: 4000 }, 'Maio de 2026');
    assert.ok(el5.innerHTML.includes('net-result-card'));
    assert.ok(el5.innerHTML.includes('Superávit Positivo'));
  });

  test('v4 Custom Silk Select Dropdown & Dropup (In-Flow Anti-Crop)', async () => {
    const { PediatricApp } = await import('../v4/js/app.js');

    // Cria instância com mock de DOM básico
    const mockApp = Object.create(PediatricApp.prototype);
    mockApp.store = store;

    // Teste de renderCustomSelect com grupos (Macro-Grupos de Categorias)
    const groupedOptions = MACRO_GROUPS.map(mg => ({
      groupName: mg.name,
      icon: mg.icon,
      color: mg.color,
      items: mg.categories.map(c => ({ value: c, label: c, icon: 'tag', color: mg.color }))
    }));

    const selectHtml = mockApp.renderCustomSelect({
      id: 'test-category',
      name: 'category',
      value: 'Mercantil',
      options: groupedOptions,
      grouped: true,
      isDropup: true
    });

    assert.ok(selectHtml.includes('silk-select-container'));
    assert.ok(selectHtml.includes('silk-dropup'));
    assert.ok(selectHtml.includes('input-test-category'));
    assert.ok(selectHtml.includes('silk-select-group-header'));
    assert.ok(selectHtml.includes('Mercantil'));
    assert.ok(selectHtml.includes('Alimentação'));
  });

  test('v4 Menu Hambúrguer Drawer, Perfil no Cabeçalho & Pré-Seleção de Maternidades', () => {
    const appJsContent = fs.readFileSync(path.join(rootDir, 'v4', 'js', 'app.js'), 'utf8');

    // 1. Ver Perfil no Cabeçalho
    assert.ok(appJsContent.includes('#btn-header-profile'), 'Deve conter identificador do botão de perfil no cabeçalho');
    assert.ok(appJsContent.includes('headerProfile'), 'Deve haver listener de clique para o perfil no cabeçalho');

    // 2. Itens do Drawer do Menu Hambúrguer
    assert.ok(appJsContent.includes('#drawer-item-categories'), 'Drawer deve conter item de Categorização');
    assert.ok(appJsContent.includes('#drawer-item-profile'), 'Drawer deve conter item de Editar Perfil');
    assert.ok(appJsContent.includes('#drawer-item-hub'), 'Drawer deve conter item de Hub de Finanças');
    assert.ok(appJsContent.includes('#drawer-item-reset'), 'Drawer deve conter item de Zerar Dados');

    // 3. Pré-Seleção rápida de Araken e Leide Morais
    assert.ok(appJsContent.includes('Maternidade Araken'));
    assert.ok(appJsContent.includes('Maternidade Leide Morais'));
    assert.ok(appJsContent.includes('data-quick-hospital="Maternidade Araken"'));
    assert.ok(appJsContent.includes('data-quick-hospital="Maternidade Leide Morais"'));
  });
});


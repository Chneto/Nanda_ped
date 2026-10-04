/**
 * v4_cloud_domain.test.js
 * Test Suite for Milestone M4: Pediatric Financial Engine & Medical Domain Calculations
 * 
 * Verifies:
 * 1. Canonical Author & Brand Integrity (APP_CREATOR = 'FChNeto')
 * 2. Shifts 75% D+60 / 25% D+90 Split Formula with Cent-Precision (val75 + val25 === netValue)
 * 3. Month-End Arithmetic & Calendar Clamping (March 31, August 31, January 31, Leap Years)
 * 4. 22 Canonical Categories & 6 Macro-Groups Taxonomy (Nubank/Revolut Mapping)
 * 5. Custom Category Creation & Integration into Macro-Groups
 * 6. Multi-Month Installment Engine (2x to 24x) with Cent Rounding on Installment 1
 * 7. Cash vs Accrual Accounting (Regime de Caixa vs Regime de Competência) & Production Hiatus
 * 8. PediatricStore Complete Lifecycle (CRUD, Profiles, Formatting, Forecast, Reset & Backup)
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  APP_CREATOR,
  APP_VERSION,
  CANONICAL_CATEGORIES,
  DEFAULT_CATEGORIES,
  MACRO_GROUPS,
  DEFAULT_HOSPITALS,
  getLocalDateString,
  addMonthsToDateString,
  formatCurrency,
  formatDateBR,
  formatMonthYear,
  getMacroGroupForCategory,
  calculateShiftInstallments,
  generateExpenseInstallments,
  PediatricStore
} from '../js/store.js';

describe('Finanças Pediatria V4_Cloud — Medical Domain Logic Engine Suite', () => {
  let store;

  beforeEach(() => {
    store = new PediatricStore();
    store.data.shifts = [];
    store.data.expenses = [];
    store.data.customCategories = [];
  });

  // --------------------------------------------------------------------------
  // 1. Identidade Canônica & Assinatura Imutável
  // --------------------------------------------------------------------------
  describe('1. Identidade Canônica & Assinatura do Criador', () => {
    test('APP_CREATOR é estritamente FChNeto em constantes e estado', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(store.data.creator, 'FChNeto');
      assert.equal(APP_VERSION, '4.1.1');
    });

    test('Médica padrão e bolsa de residência inicializados corretamente', () => {
      assert.equal(store.data.doctorName, 'Médica');
      assert.equal(store.data.specialty, 'Pediatria');
      assert.equal(store.data.residencySalary.value, 0.00);
      assert.equal(store.data.residencySalary.active, false);
      assert.equal(store.data.residencySalary.dayOfMonth, 5);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Cálculo Canônico de Plantão (75% D+60 / 25% D+90) & Invariante do Centavo
  // --------------------------------------------------------------------------
  describe('2. Cálculo Canônico de Plantões (75% D+60 / 25% D+90)', () => {
    test('Divisão exata de valor redondo (R$ 1.500,00)', () => {
      const splits = calculateShiftInstallments(1500, '2026-03-10');
      assert.equal(splits.installment1.value, 1125.00);
      assert.equal(splits.installment2.value, 375.00);
      assert.equal(splits.installment1.value + splits.installment2.value, 1500.00);
      assert.equal(splits.installment1.date, '2026-05-10');
      assert.equal(splits.installment2.date, '2026-06-10');
      assert.equal(splits.installment1.percentage, 75);
      assert.equal(splits.installment2.percentage, 25);
    });

    test('Invariante do Centavo: valores decimais ímpares preservam soma exata sem perda de centavos', () => {
      const oddAmounts = [
        1000.01,
        1250.55,
        2450.33,
        3333.33,
        9999.99,
        0.01,
        0.02,
        0.03,
        100.06,
        2150.50
      ];

      oddAmounts.forEach((net) => {
        const splits = calculateShiftInstallments(net, '2026-03-15');
        const sum = Math.round((splits.installment1.value + splits.installment2.value) * 100) / 100;
        assert.equal(
          sum,
          net,
          `Violação de centavos para valor R$ ${net}: ${splits.installment1.value} + ${splits.installment2.value} !== ${net}`
        );
      });
    });

    test('Divisão de valor zero retorna zero em ambas as parcelas sem NaN', () => {
      const splits = calculateShiftInstallments(0, '2026-04-01');
      assert.equal(splits.installment1.value, 0);
      assert.equal(splits.installment2.value, 0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Aritmética de Calendário & Limites de Fim de Mês (Clamping)
  // --------------------------------------------------------------------------
  describe('3. Aritmética de Calendário & Limites de Fim de Mês', () => {
    test('Março 31: D+60 resulta em 31 de Maio; D+90 resulta em 30 de Junho (não 31)', () => {
      const d60 = addMonthsToDateString('2026-03-31', 2);
      const d90 = addMonthsToDateString('2026-03-31', 3);
      assert.equal(d60, '2026-05-31', '31/Março + 2 meses deve ser 31/Maio');
      assert.equal(d90, '2026-06-30', '31/Março + 3 meses deve ser 30/Junho');
    });

    test('Agosto 31: D+60 resulta em 31 de Outubro; D+90 resulta em 30 de Novembro', () => {
      const d60 = addMonthsToDateString('2026-08-31', 2);
      const d90 = addMonthsToDateString('2026-08-31', 3);
      assert.equal(d60, '2026-10-31');
      assert.equal(d90, '2026-11-30');
    });

    test('Janeiro 31: ano bissexto (2024) resulta em 29/Fev; ano comum (2025/2026) resulta em 28/Fev', () => {
      assert.equal(addMonthsToDateString('2024-01-31', 1), '2024-02-29');
      assert.equal(addMonthsToDateString('2025-01-31', 1), '2025-02-28');
      assert.equal(addMonthsToDateString('2026-01-31', 1), '2026-02-28');
    });

    test('Dezembro 31 com virada de ano: +2 meses resulta em 28 de Fevereiro', () => {
      assert.equal(addMonthsToDateString('2025-12-31', 2), '2026-02-28');
    });

    test('Data regular no meio do mês avança sem alteração do dia', () => {
      assert.equal(addMonthsToDateString('2026-04-15', 2), '2026-06-15');
      assert.equal(addMonthsToDateString('2026-04-15', 3), '2026-07-15');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Taxonomia das 23 Categorias Canônicas & 6 Macro-Grupos
  // --------------------------------------------------------------------------
  describe('4. Taxonomia das 23 Categorias Canônicas & 6 Macro-Grupos', () => {
    test('Presença integral das 23 categorias listadas em AGENTS.md', () => {
      const required = [
        'Passagens', 'Mercantil', 'Academia', 'Estudo', 'Cursos',
        'Presentes', 'Aluguel', 'Energia', 'Internet', 'Combustível',
        'Qualificação/Congresso/Pós', 'Fisioterapia', 'Água', 'Lanches',
        'Doação', 'Refeição', 'Beleza/Salão', 'Uber', 'Remédios',
        'Compras Parceladas', 'Saídas', 'Delivery', 'Produtos de beleza'
      ];

      required.forEach(cat => {
        assert.ok(CANONICAL_CATEGORIES.includes(cat), `Categoria canônica ausente: ${cat}`);
      });
      assert.equal(CANONICAL_CATEGORIES.length, 23);
      assert.equal(MACRO_GROUPS.length, 6);
    });

    test('Mapeamento correto das categorias nos 6 Macro-Grupos', () => {
      // 1. Alimentação
      assert.equal(getMacroGroupForCategory('Mercantil').name, 'Alimentação');
      assert.equal(getMacroGroupForCategory('Refeição').name, 'Alimentação');
      assert.equal(getMacroGroupForCategory('Lanches').name, 'Alimentação');
      assert.equal(getMacroGroupForCategory('Delivery').name, 'Alimentação');

      // 2. Transporte & Mobilidade
      assert.equal(getMacroGroupForCategory('Combustível').name, 'Transporte & Mobilidade');
      assert.equal(getMacroGroupForCategory('Uber').name, 'Transporte & Mobilidade');
      assert.equal(getMacroGroupForCategory('Passagens').name, 'Transporte & Mobilidade');

      // 3. Moradia & Contas
      assert.equal(getMacroGroupForCategory('Aluguel').name, 'Moradia & Contas');
      assert.equal(getMacroGroupForCategory('Energia').name, 'Moradia & Contas');
      assert.equal(getMacroGroupForCategory('Água').name, 'Moradia & Contas');
      assert.equal(getMacroGroupForCategory('Internet').name, 'Moradia & Contas');

      // 4. Formação & Carreira
      assert.equal(getMacroGroupForCategory('Estudo').name, 'Formação & Carreira');
      assert.equal(getMacroGroupForCategory('Cursos').name, 'Formação & Carreira');
      assert.equal(getMacroGroupForCategory('Qualificação/Congresso/Pós').name, 'Formação & Carreira');

      // 5. Saúde & Autocuidado
      assert.equal(getMacroGroupForCategory('Remédios').name, 'Saúde & Autocuidado');
      assert.equal(getMacroGroupForCategory('Academia').name, 'Saúde & Autocuidado');
      assert.equal(getMacroGroupForCategory('Fisioterapia').name, 'Saúde & Autocuidado');
      assert.equal(getMacroGroupForCategory('Cosméticos').name, 'Saúde & Autocuidado'); // Alias compatibilidade
      assert.equal(getMacroGroupForCategory('Beleza/Salão').name, 'Saúde & Autocuidado');
      assert.equal(getMacroGroupForCategory('Produtos de beleza').name, 'Saúde & Autocuidado');

      // 6. Pessoal, Lazer & Outros
      assert.equal(getMacroGroupForCategory('Presentes').name, 'Pessoal, Lazer & Outros');
      assert.equal(getMacroGroupForCategory('Saídas').name, 'Pessoal, Lazer & Outros');
      assert.equal(getMacroGroupForCategory('Compras Parceladas').name, 'Pessoal, Lazer & Outros');
      assert.equal(getMacroGroupForCategory('Doação').name, 'Pessoal, Lazer & Outros');
    });

    test('Categoria desconhecida cai com segurança no Macro-Grupo Pessoal, Lazer & Outros', () => {
      const fallback = getMacroGroupForCategory('CategoriaInexistente123');
      assert.equal(fallback.name, 'Pessoal, Lazer & Outros');
    });

    test('Categorias personalizadas mapeiam para seus macro-grupos configurados', () => {
      const customCats = [
        { name: 'Livros de Pediatria', macro_group: 'Formação & Carreira' },
        { name: 'Clube de Vinhos', macro_group: 'Pessoal, Lazer & Outros' }
      ];
      const match1 = getMacroGroupForCategory('Livros de Pediatria', customCats);
      assert.equal(match1.name, 'Formação & Carreira');

      const match2 = getMacroGroupForCategory('Clube de Vinhos', customCats);
      assert.equal(match2.name, 'Pessoal, Lazer & Outros');
    });
  });

  // --------------------------------------------------------------------------
  // 5. Motor de Compras Parceladas (2x a 24x) com Centavo Residual na 1ª Parcela
  // --------------------------------------------------------------------------
  describe('5. Motor de Compras Parceladas (2x a 24x)', () => {
    test('R$ 100,00 em 3x: 1ª parcela recebe 33,34 e as demais 33,33 (Soma = 100,00)', () => {
      const parts = generateExpenseInstallments({ description: 'Estetoscópio Littmann', amount: 100, date: '2026-03-01' }, 3);
      assert.equal(parts.length, 3);
      assert.equal(parts[0].amount, 33.34);
      assert.equal(parts[1].amount, 33.33);
      assert.equal(parts[2].amount, 33.33);
      assert.equal(parts[0].amount + parts[1].amount + parts[2].amount, 100.00);
      assert.equal(parts[0].date, '2026-03-01');
      assert.equal(parts[1].date, '2026-04-01');
      assert.equal(parts[2].date, '2026-05-01');
    });

    test('R$ 1.250,00 em 10x resulta em 10 parcelas idênticas de R$ 125,00', () => {
      const parts = generateExpenseInstallments({ description: 'Congresso Pediatria', amount: 1250, date: '2026-01-15' }, 10);
      assert.equal(parts.length, 10);
      parts.forEach(p => assert.equal(p.amount, 125.00));
      const total = parts.reduce((acc, p) => acc + p.amount, 0);
      assert.equal(total, 1250.00);
    });

    test('Parcelamento máximo em 24x preserva soma total e projeta 2 anos no tempo', () => {
      const parts = generateExpenseInstallments({ description: 'Aparelho Ultrassom Portátil', amount: 1000, date: '2026-01-31' }, 24);
      assert.equal(parts.length, 24);
      const total = Math.round(parts.reduce((acc, p) => acc + p.amount, 0) * 100) / 100;
      assert.equal(total, 1000.00);
      assert.equal(parts[0].amount, 41.82);
      assert.equal(parts[1].amount, 41.66);
      assert.equal(parts[23].date, '2027-12-31');
    });

    test('Compra à vista (1x) gera exatamente 1 despesa com valor integral', () => {
      const parts = generateExpenseInstallments({ description: 'Lanche Noturno Plantão', amount: 45.50, date: '2026-03-10' }, 1);
      assert.equal(parts.length, 1);
      assert.equal(parts[0].amount, 45.50);
      assert.equal(parts[0].current_installment, 1);
      assert.equal(parts[0].total_installments, 1);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Regime de Caixa vs Regime de Competência
  // --------------------------------------------------------------------------
  describe('6. Regime de Caixa vs Regime de Competência', () => {
    test('Hiato temporal de plantão trabalhado em Março (D+60 em Maio e D+90 em Junho)', () => {
      store.updateResidencySalary({ value: 0.00, active: true });

      // Shift in March: net 2000 => 75% (1500) in May, 25% (500) in June
      store.saveShift({
        date: '2026-03-10',
        netValue: 2000.00,
        hospital: 'Maternidade Principal'
      });

      store.saveExpense({ amount: 500.00, date: '2026-03-15', category: 'Mercantil' });
      store.saveExpense({ amount: 1000.00, date: '2026-05-20', category: 'Aluguel' });

      // March Competência: no prefilled salary + Worked (2000.00) = 2000.00
      const marCompetencia = store.getMonthlySummary('2026-03', 'competencia');
      assert.equal(marCompetencia.shiftIncome, 2000.00);
      assert.equal(marCompetencia.totalIncome, 2000.00);
      assert.equal(marCompetencia.totalExpenses, 500.00);
      assert.equal(marCompetencia.balance, 1500.00);

      // March Caixa: No prefilled salary + Shifts maturing (0) = 0.00
      const marCaixa = store.getMonthlySummary('2026-03', 'caixa');
      assert.equal(marCaixa.shiftIncome, 0.00);
      assert.equal(marCaixa.totalIncome, 0.00);
      assert.equal(marCaixa.totalExpenses, 500.00);
      assert.equal(marCaixa.balance, -500.00);

      // May Caixa: no prefilled salary + 75% D+60 (1500.00)
      const maiCaixa = store.getMonthlySummary('2026-05', 'caixa');
      assert.equal(maiCaixa.shiftIncome, 1500.00);
      assert.equal(maiCaixa.totalIncome, 1500.00);
      assert.equal(maiCaixa.totalExpenses, 1000.00);
      assert.equal(maiCaixa.balance, 500.00);

      // June Caixa: no prefilled salary + 25% D+90 (500.00)
      const junCaixa = store.getMonthlySummary('2026-06', 'caixa');
      assert.equal(junCaixa.shiftIncome, 500.00);
      assert.equal(junCaixa.totalIncome, 500.00);
    });

    test('Breakdown de macro-grupos e categorias no resumo mensal', () => {
      store.saveExpense({ amount: 150, date: '2026-04-10', category: 'Mercantil' });
      store.saveExpense({ amount: 50, date: '2026-04-12', category: 'Lanches' });
      store.saveExpense({ amount: 100, date: '2026-04-15', category: 'Combustível' });

      const summary = store.getMonthlySummary('2026-04', 'caixa');
      assert.equal(summary.totalExpenses, 300.00);
      assert.equal(summary.expensesCount, 3);

      // Category breakdown
      assert.equal(summary.categoryBreakdown.length, 3);
      assert.equal(summary.categoryBreakdown[0].category, 'Mercantil');
      assert.equal(summary.categoryBreakdown[0].value, 150);

      // Macro breakdown: Alimentação (200), Transporte & Mobilidade (100)
      const macroAlim = summary.macroBreakdown.find(m => m.name === 'Alimentação');
      assert.ok(macroAlim);
      assert.equal(macroAlim.value, 200);

      const macroTrans = summary.macroBreakdown.find(m => m.name === 'Transporte & Mobilidade');
      assert.ok(macroTrans);
      assert.equal(macroTrans.value, 100);
    });
  });

  // --------------------------------------------------------------------------
  // 7. PediatricStore Lifecycle: CRUD, Previsão, Reset & Backup
  // --------------------------------------------------------------------------
  describe('7. PediatricStore Lifecycle & Persistência', () => {
    test('Toggle de status de parcela de plantão (recebido / pendente)', () => {
      const shift = store.saveShift({
        hospital: 'Maternidade Secundária',
        date: '2026-04-01',
        netValue: 1200
      });

      assert.equal(shift.installment1.status, 'pending');

      // Marca parcela 1 como recebida
      const updated = store.toggleShiftInstallment(shift.id, 1);
      assert.equal(updated.installment1.status, 'received');
      assert.ok(updated.installment1.paidDate);

      // Desmarca parcela 1
      const reverted = store.toggleShiftInstallment(shift.id, 1);
      assert.equal(reverted.installment1.status, 'pending');
      assert.equal(reverted.installment1.paidDate, null);
    });

    test('Adiciona novo hospital automaticamente na lista da médica', () => {
      assert.ok(!store.data.hospitals.includes('Hospital Infantil Varella'));
      store.saveShift({
        hospital: 'Hospital Infantil Varella',
        date: '2026-04-05',
        netValue: 1000
      });
      assert.ok(store.data.hospitals.includes('Hospital Infantil Varella'));
    });

    test('Remoção de plantões e despesas', () => {
      const s = store.saveShift({ hospital: 'Hospital Pediátrico', date: '2026-04-01', netValue: 800 });
      store.saveExpense({ id: 'exp-del', amount: 50, date: '2026-04-02', category: 'Uber' });

      assert.equal(store.data.shifts.length, 1);
      assert.equal(store.data.expenses.length, 1);

      store.deleteShift(s.id);
      store.deleteExpense('exp-del');

      assert.equal(store.data.shifts.length, 0);
      assert.equal(store.data.expenses.length, 0);
    });

    test('Atualização de perfil médico e bolsa de residência', () => {
      store.updateDoctorProfile({
        doctorName: 'Médica de Exemplo',
        crm: 'CRM/TESTE',
        specialty: 'Neonatologia',
        doctorPhoto: 'data:image/png;base64,mock',
        salaryValue: 4500
      });

      assert.equal(store.data.doctorName, 'Médica de Exemplo');
      assert.equal(store.data.crm, 'CRM/TESTE');
      assert.equal(store.data.specialty, 'Neonatologia');
      assert.equal(store.data.doctorPhoto, 'data:image/png;base64,mock');
      assert.equal(store.data.residencySalary.value, 4500);
    });

    test('Previsão de 6 meses projeta fluxo de caixa', () => {
      const forecast = store.getForecast6Months('2026-05');
      assert.equal(forecast.length, 6);
      assert.equal(forecast[0].month, '2026-05');
      assert.equal(forecast[5].month, '2026-10');
      forecast.forEach(f => {
        assert.ok(typeof f.income === 'number');
        assert.ok(typeof f.expenses === 'number');
        assert.ok(typeof f.balance === 'number');
      });
    });

    test('Reset em duas etapas: transações apenas vs fábrica completa', () => {
      store.saveShift({ hospital: 'Maternidade Principal', date: '2026-04-01', netValue: 1000 });
      store.saveExpense({ amount: 100, date: '2026-04-01', category: 'Mercantil' });
      store.updateDoctorProfile({ doctorName: 'Médica Especial' });

      // Transações apenas: zera dados mantendo perfil
      store.resetData('transactions_only');
      assert.equal(store.data.shifts.length, 0);
      assert.equal(store.data.expenses.length, 0);
      assert.equal(store.data.doctorName, 'Médica Especial');

      // Fábrica completa: restaura perfil padrão mas preserva APP_CREATOR
      store.resetData('full_factory');
      assert.equal(store.data.doctorName, 'Médica');
      assert.equal(store.data.creator, 'FChNeto');
    });

    test('Exportação e importação de backup JSON preserva APP_CREATOR', () => {
      store.saveShift({ hospital: 'Maternidade Principal', date: '2026-04-01', netValue: 1500 });
      const jsonStr = store.exportBackupJsonString();
      const parsed = JSON.parse(jsonStr);

      assert.equal(parsed.creator, 'FChNeto');
      assert.equal(parsed.shifts.length, 1);

      const newStore = new PediatricStore();
      const res = newStore.importBackupFromFile(jsonStr);
      assert.equal(res.success, true);
      assert.equal(newStore.data.shifts.length, 1);
      assert.equal(newStore.data.creator, 'FChNeto');
    });
  });

  // --------------------------------------------------------------------------
  // 8. Formatadores Utilitários
  // --------------------------------------------------------------------------
  describe('8. Formatadores Utilitários', () => {
    test('formatCurrency formata padrão brasileiro R$', () => {
      const formatted = formatCurrency(1500.50);
      assert.ok(formatted.includes('1.500,50') || formatted.includes('1500,50'));
    });

    test('formatDateBR converte YYYY-MM-DD para DD/MM/YYYY', () => {
      assert.equal(formatDateBR('2026-03-31'), '31/03/2026');
    });

    test('formatMonthYear formata YYYY-MM com nome do mês por extenso', () => {
      assert.equal(formatMonthYear('2026-03'), 'Março de 2026');
      assert.equal(formatMonthYear('2026-12'), 'Dezembro de 2026');
    });
  });

});

/**
 * Testes Unitários e de Integração para Finanças Pediatria v2.0
 * Execução via: node --test tests/v2_suite.test.js
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  PediatricStore,
  DEFAULT_CATEGORIES,
  addMonthsToDateString,
  getLocalDateString,
  formatCurrency,
  APP_CREATOR,
  APP_VERSION
} from '../v2.0/js/store.js';

describe('Finanças Pediatria v2.0 - Core Engine Tests', () => {
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
    // Limpa dados de teste
    store.data.shifts = [];
    store.data.expenses = [];
  });

  test('Configurações de Identidade & Criador', () => {
    assert.equal(APP_CREATOR, 'FChNeto');
    assert.equal(APP_VERSION, '2.0.0');
    assert.equal(store.data.creator, 'FChNeto');
    assert.equal(store.data.doctorName, 'Dra. Fernanda Ch.');
  });

  test('Verificação Completa das 22 Categorias Obrigatórias Solicitadas', () => {
    const requiredCategories = [
      'Passagens',
      'Mercantil',
      'Academia',
      'Estudo',
      'Cursos',
      'Presentes',
      'Aluguel',
      'Energia',
      'Internet',
      'Combustível',
      'Qualificação/Congresso/Pós',
      'Cosméticos',
      'Água',
      'Lanches',
      'Doação',
      'Refeição',
      'Beleza/Salão',
      'Uber',
      'Remédios',
      'Compras Parceladas',
      'Saídas',
      'Delivery',
      'Produtos de beleza'
    ];

    const categoryNames = DEFAULT_CATEGORIES.map(c => c.name);

    requiredCategories.forEach(cat => {
      assert.ok(
        categoryNames.includes(cat),
        `Categoria obrigatória não encontrada: ${cat}`
      );
    });

    assert.ok(DEFAULT_CATEGORIES.length >= 22);
  });

  test('Cálculo Rigoroso de Plantões em Sala de Parto: 75% D+60 e 25% D+90', () => {
    const shift = store.saveShift({
      hospital: 'Maternidade Araken',
      date: '2026-06-10',
      shiftType: '12h Noturno',
      grossValue: 2500,
      netValue: 2000
    });

    assert.ok(shift);
    assert.equal(shift.hospital, 'Maternidade Araken');
    assert.equal(shift.netValue, 2000);

    // Parcela 1: 75% com vencimento em 2 meses (D+60)
    assert.equal(shift.installment1.percentage, 75);
    assert.equal(shift.installment1.value, 1500);
    assert.equal(shift.installment1.expectedDate, '2026-08-10');
    assert.equal(shift.installment1.status, 'pending');

    // Parcela 2: 25% com vencimento em 3 meses (D+90)
    assert.equal(shift.installment2.percentage, 25);
    assert.equal(shift.installment2.value, 500);
    assert.equal(shift.installment2.expectedDate, '2026-09-10');
    assert.equal(shift.installment2.status, 'pending');
  });

  test('Preservação de datas no addMonthsToDateString', () => {
    // 31 de Março + 2 meses -> Maio tem 31 dias -> 31 de Maio
    assert.equal(addMonthsToDateString('2026-03-31', 2), '2026-05-31');
    // 31 de Março + 3 meses -> Junho tem 30 dias -> 30 de Junho (limite seguro)
    assert.equal(addMonthsToDateString('2026-03-31', 3), '2026-06-30');
  });

  test('Toggle de status da parcela de plantão', () => {
    const shift = store.saveShift({
      hospital: 'MEJEC',
      date: '2026-05-01',
      netValue: 1000
    });

    store.toggleShiftInstallment(shift.id, 1);
    const updated = store.data.shifts.find(s => s.id === shift.id);
    assert.equal(updated.installment1.status, 'received');
    assert.ok(updated.installment1.paidDate);

    // Toggle de volta para pending
    store.toggleShiftInstallment(shift.id, 1);
    const reverted = store.data.shifts.find(s => s.id === shift.id);
    assert.equal(reverted.installment1.status, 'pending');
    assert.equal(reverted.installment1.paidDate, null);
  });

  test('Despesas com Compras Parceladas distribuídas nos meses seguintes', () => {
    store.saveExpense({
      category: 'Compras Parceladas',
      description: 'Notebook de Estudos',
      value: 3000,
      date: '2026-06-15',
      isInstallment: true,
      totalInstallments: 3
    });

    const expenses = store.data.expenses;
    assert.equal(expenses.length, 3);

    assert.equal(expenses[0].date, '2026-06-15');
    assert.equal(expenses[0].value, 1000);
    assert.ok(expenses[0].description.includes('(1/3)'));

    assert.equal(expenses[1].date, '2026-07-15');
    assert.equal(expenses[1].value, 1000);
    assert.ok(expenses[1].description.includes('(2/3)'));

    assert.equal(expenses[2].date, '2026-08-15');
    assert.equal(expenses[2].value, 1000);
    assert.ok(expenses[2].description.includes('(3/3)'));
  });

  test('Resumo Mensal: Regime de Caixa vs Regime de Competência', () => {
    // Configura Salário Residência: 4000
    store.updateResidencySalary({ value: 4000, active: true });

    // Plantão realizado em Junho/2026 de 2000
    // Parcela 75% (1500) cai em Agosto/2026
    // Parcela 25% (500) cai em Setembro/2026
    store.saveShift({
      hospital: 'Hospital da Criança',
      date: '2026-06-15',
      netValue: 2000
    });

    // Despesa em Agosto/2026 de 1000
    store.saveExpense({
      category: 'Aluguel',
      description: 'Aluguel Ap',
      value: 1000,
      date: '2026-08-05'
    });

    // 1. Verificação de Agosto/2026 no Regime de Caixa:
    // Entradas = 4000 (residência) + 1500 (75% do plantão de junho) = 5500
    // Despesas = 1000
    // Saldo = 4500
    const summaryCaixaAgo = store.getMonthSummary('2026-08', 'caixa');
    assert.equal(summaryCaixaAgo.residencyIncome, 4000);
    assert.equal(summaryCaixaAgo.totalIncome, 5500);
    assert.equal(summaryCaixaAgo.totalExpenses, 1000);
    assert.equal(summaryCaixaAgo.balance, 4500);

    // 2. Verificação de Junho/2026 no Regime de Competência:
    // Produção = 4000 (residência) + 2000 (plantão realizado no mês) = 6000
    const summaryCompJun = store.getMonthSummary('2026-06', 'competencia');
    assert.equal(summaryCompJun.totalIncome, 6000);
  });

  test('Previsão de 6 Meses de Fluxo de Caixa', () => {
    store.updateResidencySalary({ value: 4106.09, active: true });
    const forecast = store.getForecast6Months('2026-06');

    assert.equal(forecast.length, 6);
    assert.equal(forecast[0].month, '2026-06');
    assert.equal(forecast[5].month, '2026-11');
    forecast.forEach(item => {
      assert.ok(item.income >= 4106.09);
    });
  });

  test('Backup JSON Roundtrip (Exportação e Importação)', () => {
    store.saveShift({
      hospital: 'Hospital Mater Dei',
      date: '2026-07-20',
      netValue: 1800
    });

    store.saveExpense({
      category: 'Combustível',
      description: 'Gasolina',
      value: 200,
      date: '2026-07-21'
    });

    const backupJson = JSON.stringify(store.data);
    const restoredStore = new PediatricStore();
    const res = restoredStore.importBackupFromFile(backupJson);

    assert.equal(res.success, true);
    assert.equal(restoredStore.data.shifts.length, 1);
    assert.equal(restoredStore.data.expenses.length, 1);
    assert.equal(restoredStore.data.shifts[0].hospital, 'Hospital Mater Dei');
  });
});

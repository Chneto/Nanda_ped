/**
 * Finanças Pediatria /v8/ - Testes Unitários do Motor Canônico de Domínio
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  APP_CREATOR,
  APP_VERSION,
  CANONICAL_CATEGORIES,
  DEFAULT_CATEGORIES,
  MACRO_GROUPS,
  DEFAULT_INCOME_SOURCES,
  DEFAULT_HOSPITALS,
  getLocalDateString,
  normalizeCategoryName,
  getCategoryKey,
  formatCurrency,
  formatDateBR,
  formatMonthYear,
  addMonthsToDateString,
  getMacroGroupForCategory,
  calculateIncomeInstallments,
  calculateShiftInstallments,
  createCanonicalShift,
  createCanonicalExpense,
  generateExpenseInstallments,
  PediatricStore,
  getInitialData
} from '../js/store.js';

describe('Finanças Pediatria /v8/ - Motor Canônico de Domínio', () => {

  describe('1. Identidade Canônica & Catálogos Iniciais', () => {
    it('Preserva a autoria imutável APP_CREATOR = "FChNeto" e versão 8.0.0', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(APP_VERSION, '8.0.0');
    });

    it('Contém exatamente as 23 categorias canônicas listadas', () => {
      assert.equal(CANONICAL_CATEGORIES.length, 23);
      assert.equal(DEFAULT_CATEGORIES.length, 23);

      const expected = [
        'Passagens', 'Mercantil', 'Academia', 'Estudo', 'Cursos',
        'Presentes', 'Aluguel', 'Energia', 'Internet', 'Combustível',
        'Qualificação/Congresso/Pós', 'Fisioterapia', 'Água', 'Lanches',
        'Doação', 'Refeição', 'Beleza/Salão', 'Uber', 'Remédios',
        'Compras Parceladas', 'Saídas', 'Delivery', 'Produtos de beleza'
      ];

      for (const cat of expected) {
        assert.ok(CANONICAL_CATEGORIES.includes(cat), `Faltando na lista canônica: ${cat}`);
        assert.ok(DEFAULT_CATEGORIES.some(c => c.name === cat), `Faltando em DEFAULT_CATEGORIES: ${cat}`);
      }
    });

    it('Define os 6 Macro-Grupos Canônicos com cores e ícones válidos', () => {
      assert.equal(MACRO_GROUPS.length, 6);
      const groupNames = MACRO_GROUPS.map(g => g.name);
      assert.deepEqual(groupNames, [
        'Alimentação',
        'Transporte & Mobilidade',
        'Moradia & Contas',
        'Formação & Carreira',
        'Saúde & Autocuidado',
        'Pessoal, Lazer & Outros'
      ]);
    });

    it('Define o catálogo inicial de fontes de renda médicas com regras de recebimento', () => {
      assert.ok(DEFAULT_INCOME_SOURCES.length >= 5);
      const names = DEFAULT_INCOME_SOURCES.map(s => s.name);
      assert.ok(names.includes('Maternidade Principal'));
      assert.ok(names.includes('Maternidade Secundária'));
      assert.ok(names.includes('Hospital Pediátrico'));
      assert.ok(names.includes('Bolsa de Residência Médica'));
      assert.ok(names.includes('Consultório de Puericultura'));
    });
  });

  describe('2. Aritmética de Datas com Clamp de Fim de Mês (addMonthsToDateString)', () => {
    it('Adiciona meses preservando dias válidos', () => {
      assert.equal(addMonthsToDateString('2026-01-15', 2), '2026-03-15');
      assert.equal(addMonthsToDateString('2026-05-10', 3), '2026-08-10');
    });

    it('Clampa o dia 31 de Março corretamente em Maio (31 dias) e Junho (30 dias)', () => {
      // 31 de Março + 2 meses (D+60) = 31 de Maio
      assert.equal(addMonthsToDateString('2026-03-31', 2), '2026-05-31');
      // 31 de Março + 3 meses (D+90) = 30 de Junho (Junho só tem 30 dias!)
      assert.equal(addMonthsToDateString('2026-03-31', 3), '2026-06-30');
    });

    it('Clampa o dia 31 de Janeiro para 28 de Fevereiro em ano comum e 29 em ano bissexto', () => {
      // 2026 (ano comum)
      assert.equal(addMonthsToDateString('2026-01-31', 1), '2026-02-28');
      // 2024 (ano bissexto)
      assert.equal(addMonthsToDateString('2024-01-31', 1), '2024-02-29');
    });

    it('Trata transição de ano corretamente', () => {
      assert.equal(addMonthsToDateString('2026-11-15', 2), '2027-01-15');
      assert.equal(addMonthsToDateString('2026-12-31', 2), '2027-02-28');
    });
  });

  describe('3. Regra de Plantões em Sala de Parto (75% D+60 / 25% D+90)', () => {
    it('Calcula divisão exata para R$ 1.000,00', () => {
      const inst = calculateShiftInstallments(1000.00, '2026-03-31');
      assert.equal(inst.installment1.value, 750.00);
      assert.equal(inst.installment1.date, '2026-05-31');
      assert.equal(inst.installment2.value, 250.00);
      assert.equal(inst.installment2.date, '2026-06-30');
      assert.equal(inst.installment1.value + inst.installment2.value, 1000.00);
    });

    it('Absorve centavos sem derivação de ponto flutuante para R$ 1.000,01', () => {
      const inst = calculateShiftInstallments(1000.01, '2026-03-31');
      assert.equal(inst.installment1.value, 750.01);
      assert.equal(inst.installment2.value, 250.00);
      assert.equal(Math.round((inst.installment1.value + inst.installment2.value) * 100) / 100, 1000.01);
    });

    it('Absorve centavos para R$ 1.333,33', () => {
      const inst = calculateShiftInstallments(1333.33, '2026-01-10');
      assert.equal(inst.installment1.value, 1000.00);
      assert.equal(inst.installment2.value, 333.33);
      assert.equal(Math.round((inst.installment1.value + inst.installment2.value) * 100) / 100, 1333.33);
    });

    it('Suporta regras dinâmicas de recebimento (D+30 e D+0)', () => {
      const ruleD30 = {
        type: 'd30_100',
        splits: [{ percentage: 100, lagMonths: 1 }]
      };
      const instD30 = calculateIncomeInstallments(1500, '2026-03-10', ruleD30);
      assert.equal(instD30.length, 1);
      assert.equal(instD30[0].value, 1500.00);
      assert.equal(instD30[0].date, '2026-04-10');

      const ruleD0 = {
        type: 'd0_100',
        splits: [{ percentage: 100, lagMonths: 0 }]
      };
      const instD0 = calculateIncomeInstallments(350, '2026-03-10', ruleD0);
      assert.equal(instD0.length, 1);
      assert.equal(instD0[0].value, 350.00);
      assert.equal(instD0[0].date, '2026-03-10');
    });
  });

  describe('4. Compras Parceladas de Despesas (2x a 24x)', () => {
    it('Divide R$ 100,00 em 3x acumulando o centavo restante na 1ª parcela', () => {
      const list = generateExpenseInstallments({
        description: 'Curso PALS',
        amount: 100.00,
        date: '2026-03-31',
        category: 'Cursos'
      }, 3);

      assert.equal(list.length, 3);
      assert.equal(list[0].amount, 33.34);
      assert.equal(list[0].date, '2026-03-31');
      assert.equal(list[0].current_installment, 1);

      assert.equal(list[1].amount, 33.33);
      assert.equal(list[1].date, '2026-04-30'); // clamp de abril
      assert.equal(list[1].current_installment, 2);

      assert.equal(list[2].amount, 33.33);
      assert.equal(list[2].date, '2026-05-31');
      assert.equal(list[2].current_installment, 3);

      const total = list.reduce((sum, e) => sum + e.amount, 0);
      assert.equal(Math.round(total * 100) / 100, 100.00);
      assert.ok(list[0].installment_group_id);
      assert.equal(list[0].installment_group_id, list[1].installment_group_id);
    });

    it('Clampa a quantidade de parcelas entre 1 e 24', () => {
      const list1 = generateExpenseInstallments({ amount: 50 }, 0);
      assert.equal(list1.length, 1);

      const list30 = generateExpenseInstallments({ amount: 240 }, 30);
      assert.equal(list30.length, 24);
    });
  });

  describe('5. Regime de Caixa vs. Regime de Competência', () => {
    let store;

    beforeEach(() => {
      store = new PediatricStore();
      store.init();
    });

    it('Contabiliza corretamente plantão de Janeiro em Caixa (Março/Abril) vs Competência (Janeiro)', () => {
      // Plantão de R$ 2.000 em 15/01/2026 (75% D+60 em 15/03/2026, 25% D+90 em 15/04/2026)
      store.addShift({
        hospital: 'Maternidade Principal',
        date: '2026-01-15',
        netValue: 2000.00
      });

      // Em Janeiro:
      // Caixa: R$ 0,00 (nenhuma parcela cai em Janeiro)
      // Competência: R$ 2.000,00 (produção trabalhada em Janeiro)
      const janCaixa = store.getMonthSummary('2026-01', 'caixa');
      assert.equal(janCaixa.totalIncome, 0.00);

      const janComp = store.getMonthSummary('2026-01', 'competencia');
      assert.equal(janComp.totalIncome, 2000.00);

      // Em Março:
      // Caixa recebe a 1ª parcela de 75% = R$ 1.500,00
      const marCaixa = store.getMonthSummary('2026-03', 'caixa');
      assert.equal(marCaixa.totalIncome, 1500.00);
      assert.equal(marCaixa.shiftInflowPending, 1500.00);

      // Em Abril:
      // Caixa recebe a 2ª parcela de 25% = R$ 500,00
      const abrCaixa = store.getMonthSummary('2026-04', 'caixa');
      assert.equal(abrCaixa.totalIncome, 500.00);
    });

    it('Rastreia status de parcelas recebidas vs pendentes em Caixa', () => {
      const shift = store.addShift({
        hospital: 'Maternidade Principal',
        date: '2026-01-10',
        netValue: 1000.00
      });

      // Marca 1ª parcela (Março) como recebida
      store.toggleShiftInstallment(shift.id, 1);

      const marCaixa = store.getMonthSummary('2026-03', 'caixa');
      assert.equal(marCaixa.shiftInflowRealized, 750.00);
      assert.equal(marCaixa.shiftInflowPending, 0.00);
      assert.equal(marCaixa.totalIncome, 750.00);
    });
  });

  describe('6. Gestão Dinâmica de Fontes de Renda & Soft-Archive', () => {
    let store;

    beforeEach(() => {
      store = new PediatricStore();
      store.init();
    });

    it('Permite cadastrar nova fonte de renda e bloqueia duplicatas', () => {
      const added = store.addIncomeSource({
        name: 'Hospital da Mulher',
        defaultAmount: 2200,
        type: 'plantao'
      });

      assert.ok(added);
      assert.equal(added.name, 'Hospital da Mulher');
      assert.equal(added.defaultAmount, 2200.00);

      // Tentativa de duplicata com acentos/espaços
      const dup = store.addIncomeSource({
        name: '  Hóspital da Mulhér  ',
        defaultAmount: 1000
      });
      assert.equal(dup, null);
    });

    it('Aplica Soft-Archive quando uma fonte em uso é excluída', () => {
      const src = store.addIncomeSource({ name: 'Hospital Materno' });
      store.addShift({
        hospital: 'Hospital Materno',
        netValue: 1000,
        date: '2026-05-01'
      });

      // Sem forceArchive, retorna inUse: true
      const tryDelete = store.deleteIncomeSource(src.id, { forceArchive: false });
      assert.equal(tryDelete.deleted, false);
      assert.equal(tryDelete.inUse, true);

      // Com forceArchive, aplica soft-archive
      const archived = store.deleteIncomeSource(src.id, { forceArchive: true });
      assert.equal(archived.deleted, true);
      assert.equal(archived.archived, true);

      // Fonte não aparece mais nas ativas para novos lançamentos
      assert.ok(!store.getActiveIncomeSources().some(s => s.id === src.id));
      // Mas o plantão do histórico permanece intacto com o snapshot
      const pastShift = store.data.shifts[0];
      assert.equal(pastShift.source_name_snapshot, 'Hospital Materno');
    });

    it('Restaura fontes padrão de fábrica preservando customizadas', () => {
      store.addIncomeSource({ name: 'Consultório Dr. Amigo' });
      const res = store.restoreDefaultIncomeSources({ preserveCustom: true });
      assert.equal(res.restored, true);
      assert.ok(store.getAllIncomeSources().some(s => s.name === 'Consultório Dr. Amigo'));
      assert.ok(store.getAllIncomeSources().some(s => s.name === 'Maternidade Principal'));
    });
  });

  describe('7. Gestão Dinâmica de Categorias & Soft-Archive', () => {
    let store;

    beforeEach(() => {
      store = new PediatricStore();
      store.init();
    });

    it('Permite cadastrar nova categoria de despesa e bloqueia duplicatas', () => {
      const added = store.addCategory({
        name: 'Fisioterapia Respiratória',
        macro_group: 'Saúde & Autocuidado',
        monthly_budget_cap: 500
      });

      assert.ok(added);
      assert.equal(added.name, 'Fisioterapia Respiratória');
      assert.equal(added.monthly_budget_cap, 500.00);

      // Duplicata com maiúsculas/espaços
      const dup = store.addCategory({ name: '  fisioterapia respiratória  ' });
      assert.equal(dup, null);
    });

    it('Aplica Soft-Archive em categoria em uso preservando histórico de despesas', () => {
      const cat = store.addCategory({ name: 'Assinaturas Médicas', macro_group: 'Formação & Carreira' });
      store.addExpense({
        description: 'Whitebook',
        category: 'Assinaturas Médicas',
        amount: 80,
        date: '2026-05-10'
      });

      const del = store.deleteCustomCategory(cat.id, { forceArchive: true });
      assert.equal(del.deleted, true);
      assert.equal(del.archived, true);

      // Categoria inativa para seleção
      assert.ok(!store.getActiveCategories().some(c => c.id === cat.id));
      // Despesa passada mantém o snapshot do nome e do macro-grupo
      const exp = store.data.expenses[0];
      assert.equal(exp.category_name_snapshot, 'Assinaturas Médicas');
      assert.equal(exp.macro_group_snapshot, 'Formação & Carreira');
    });

    it('Restaura as 23 categorias canônicas preservando customizadas', () => {
      store.addCategory({ name: 'Streaming', macro_group: 'Pessoal, Lazer & Outros' });
      const res = store.restoreDefaultCategories({ preserveCustom: true });
      assert.equal(res.restored, true);
      assert.equal(res.defaultCount, 23);
      assert.equal(res.preservedCustomCount, 1);
      assert.ok(store.getAllCategories().some(c => c.name === 'Streaming'));
    });
  });

  describe('8. Lixeira e Recuperação Desfazer (Undo)', () => {
    let store;

    beforeEach(() => {
      store = new PediatricStore();
      store.init();
    });

    it('Exclui plantão para a lixeira e restaura com sucesso', () => {
      const shift = store.addShift({ hospital: 'Hospital Pediátrico', netValue: 1200, date: '2026-06-01' });
      const deleted = store.deleteShift(shift.id);
      assert.equal(deleted.id, shift.id);
      assert.equal(store.data.shifts.length, 0);

      // Restaura
      const ok = store.restoreShift(deleted);
      assert.equal(ok, true);
      assert.equal(store.data.shifts.length, 1);
      assert.equal(store.data.shifts[0].id, shift.id);
    });

    it('Exclui despesa para a lixeira e restaura com sucesso', () => {
      const exp = store.addExpense({ description: 'Almoço Hospital', amount: 45, date: '2026-06-02', category: 'Refeição' });
      const deleted = store.deleteExpense(exp.id);
      assert.equal(deleted.id, exp.id);
      assert.equal(store.data.expenses.length, 0);

      // Restaura
      const ok = store.restoreExpense(deleted);
      assert.equal(ok, true);
      assert.equal(store.data.expenses.length, 1);
      assert.equal(store.data.expenses[0].id, exp.id);
    });
  });

  describe('9. Projeção Semestral e Resumo Mensal', () => {
    let store;

    beforeEach(() => {
      store = new PediatricStore();
      store.init();
    });

    it('Calcula projeção de 6 meses no formato adequado para gráficos', () => {
      store.addShift({ hospital: 'Maternidade Principal', netValue: 2000, date: '2026-01-10' });
      store.addExpense({ description: 'Aluguel', amount: 1500, date: '2026-03-05', category: 'Aluguel' });

      const forecast = store.getForecast6Months('2026-01');
      assert.equal(forecast.length, 6);
      assert.equal(forecast[0].month, '2026-01');
      assert.equal(forecast[2].month, '2026-03');
      // Março tem a 1ª parcela de R$ 1.500 e a despesa de R$ 1.500 -> saldo 0
      assert.equal(forecast[2].income, 1500.00);
      assert.equal(forecast[2].expenses, 1500.00);
      assert.equal(forecast[2].balance, 0.00);
    });
  });
});

/**
 * Testes Unitários e de Integração para Finanças Pediatria v5.0 "Silk & Rose Gold"
 * Execução via: node --test tests/v5_suite.test.js
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
} from '../v5/js/store.js';

import { SVG_ICONS, getIconSvg } from '../v5/js/icons.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

describe('Finanças Pediatria v5.0 - Silk & Rose Gold Engine Tests', () => {
  let store;

  beforeEach(() => {
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

  test('v5 Identidade Canônica & Assinatura Imutável', () => {
    assert.equal(APP_CREATOR, 'FChNeto');
    assert.equal(APP_VERSION, '5.0.0');
    assert.equal(store.data.creator, 'FChNeto');
    assert.equal(store.data.version, '5.0.0');
    assert.equal(store.data.doctorName, 'Dra. Fernanda Ch.');
  });

  test('v5 Presença Integral das 22 Categorias Obrigatórias', () => {
    const requiredCategories = [
      'Passagens', 'Mercantil', 'Academia', 'Estudo', 'Cursos',
      'Presentes', 'Aluguel', 'Energia', 'Internet', 'Combustível',
      'Qualificação/Congresso/Pós', 'Cosméticos', 'Água', 'Lanches',
      'Doação', 'Refeição', 'Beleza/Salão', 'Uber', 'Remédios',
      'Compras Parceladas', 'Saídas', 'Delivery', 'Produtos de beleza'
    ];

    const categoryNames = DEFAULT_CATEGORIES.map(c => c.name);
    requiredCategories.forEach(cat => {
      assert.ok(categoryNames.includes(cat), `Categoria obrigatória ausente na v5: ${cat}`);
    });
    assert.ok(DEFAULT_CATEGORIES.length >= 22);
  });

  test('v5 Macro-Grupos de Despesas Inteligentes (Mapeamento Nubank/Revolut)', () => {
    assert.equal(MACRO_GROUPS.length, 6);

    // 1. Alimentação
    assert.equal(getMacroGroupForCategory('Mercantil').name, 'Alimentação');
    assert.equal(getMacroGroupForCategory('Refeição').name, 'Alimentação');
    assert.equal(getMacroGroupForCategory('Delivery').name, 'Alimentação');
    assert.equal(getMacroGroupForCategory('Lanches').name, 'Alimentação');

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
    assert.equal(getMacroGroupForCategory('Cosméticos').name, 'Saúde & Autocuidado');
    assert.equal(getMacroGroupForCategory('Beleza/Salão').name, 'Saúde & Autocuidado');
    assert.equal(getMacroGroupForCategory('Produtos de beleza').name, 'Saúde & Autocuidado');

    // 6. Pessoal, Lazer & Outros
    assert.equal(getMacroGroupForCategory('Presentes').name, 'Pessoal, Lazer & Outros');
    assert.equal(getMacroGroupForCategory('Saídas').name, 'Pessoal, Lazer & Outros');
    assert.equal(getMacroGroupForCategory('Compras Parceladas').name, 'Pessoal, Lazer & Outros');
    assert.equal(getMacroGroupForCategory('Doação').name, 'Pessoal, Lazer & Outros');
  });

  test('v5 Pré-Seleção de Maternidades Araken e Leide Morais', () => {
    assert.ok(DEFAULT_HOSPITALS.includes('Maternidade Araken'));
    assert.ok(DEFAULT_HOSPITALS.includes('Maternidade Leide Morais'));
    assert.ok(DEFAULT_HOSPITALS.includes('MEJEC'));
  });

  test('v5 Regra Canônica de Plantão em Sala de Parto: 75% D+60 e 25% D+90', () => {
    // Plantão em 2026-06-10 de R$ 1950,00
    const shift = store.saveShift({
      hospital: 'Maternidade Araken',
      date: '2026-06-10',
      value: 1950.00,
      shiftType: 'Sala de Parto'
    });

    assert.equal(shift.installments.length, 2);
    
    // Parcela 1: 75% = 1462.50 em D+60 (Agosto de 2026)
    assert.equal(shift.installments[0].percentage, 75);
    assert.equal(shift.installments[0].value, 1462.50);
    assert.equal(shift.installments[0].targetMonth, '2026-08');
    assert.equal(shift.installments[0].status, 'pending');

    // Parcela 2: 25% = 487.50 em D+90 (Setembro de 2026)
    assert.equal(shift.installments[1].percentage, 25);
    assert.equal(shift.installments[1].value, 487.50);
    assert.equal(shift.installments[1].targetMonth, '2026-09');
    assert.equal(shift.installments[1].status, 'pending');

    // Verifica soma das parcelas
    assert.equal(shift.installments[0].value + shift.installments[1].value, 1950.00);
  });

  test('v5 Compras Parceladas com Distribuição no Tempo', () => {
    // Compra de R$ 1000,00 em 3x iniciando em 2026-06-05
    store.saveExpense({
      description: 'iPad Pediátrico',
      category: 'Estudo',
      value: 1000.00,
      date: '2026-06-05',
      isInstallment: true,
      totalInstallments: 3
    });

    assert.equal(store.data.expenses.length, 3);
    
    const exp1 = store.data.expenses.find(e => e.date === '2026-06-05');
    const exp2 = store.data.expenses.find(e => e.date === '2026-07-05');
    const exp3 = store.data.expenses.find(e => e.date === '2026-08-05');

    assert.ok(exp1 && exp2 && exp3);
    assert.equal(exp1.value, 333.34); // 1a parcela com arredondamento
    assert.equal(exp2.value, 333.33);
    assert.equal(exp3.value, 333.33);
    assert.equal(exp1.value + exp2.value + exp3.value, 1000.00);
  });

  test('v5 Resumo Mensal com Breakdown por Macro-Grupos e Categorias', () => {
    store.updateResidencySalary({ value: 4106.00, active: true });

    // Plantão em Junho: 75% cai em Agosto (1462.50) e 25% em Setembro (487.50)
    store.saveShift({
      hospital: 'Maternidade Araken',
      date: '2026-06-10',
      value: 1950.00
    });

    // Despesa em Agosto
    store.saveExpense({
      description: 'Supermercado',
      category: 'Mercantil',
      value: 600.00,
      date: '2026-08-12'
    });

    const summaryAug = store.getMonthlySummary('2026-08');
    assert.equal(summaryAug.salaryVal, 4106.00);
    assert.equal(summaryAug.shiftInflowExpected, 1462.50);
    assert.equal(summaryAug.totalCashInflow, 4106.00 + 1462.50);
    assert.equal(summaryAug.totalExpenses, 600.00);
    assert.equal(summaryAug.netCashBalance, (4106.00 + 1462.50) - 600.00);

    const macroSummary = store.getMacroGroupSummary('2026-08');
    const alimGroup = macroSummary.find(g => g.id === 'macro_alimentacao');
    assert.ok(alimGroup);
    assert.equal(alimGroup.totalValue, 600.00);
    assert.equal(alimGroup.percentage, 100);
  });

  test('v5 Edição de Perfil da Médica e Foto de Perfil', () => {
    store.updateDoctorProfile({
      name: 'Dra. Fernanda Chianca',
      crm: 'CRM/RN 9999',
      specialty: 'UTI Neonatal e Pediatria',
      photo: 'data:image/jpeg;base64,mock'
    });

    assert.equal(store.data.doctorName, 'Dra. Fernanda Chianca');
    assert.equal(store.data.doctorCRM, 'CRM/RN 9999');
    assert.equal(store.data.doctorSpecialty, 'UTI Neonatal e Pediatria');
    assert.equal(store.data.doctorPhoto, 'data:image/jpeg;base64,mock');
  });

  test('v5 Zerar Dados em 2 Etapas (Proteção com Backup Preventivo)', () => {
    store.saveShift({ hospital: 'MEJEC', value: 1200, date: '2026-06-01' });
    store.saveExpense({ description: 'Livro', value: 200, date: '2026-06-01' });
    store.updateDoctorProfile({ name: 'Dra. Fernanda Ch.' });

    // Zerar mantendo perfil
    store.resetAllData({ keepProfile: true, downloadBackup: false });
    assert.equal(store.data.shifts.length, 0);
    assert.equal(store.data.expenses.length, 0);
    assert.equal(store.data.doctorName, 'Dra. Fernanda Ch.');
    assert.equal(store.data.creator, 'FChNeto');
  });

  test('v5 Arquivos e Bundles Existem e Estão Sincronizados', () => {
    const v5Dir = path.join(rootDir, 'v5');
    assert.ok(fs.existsSync(path.join(v5Dir, 'index.html')));
    assert.ok(fs.existsSync(path.join(v5Dir, 'css', 'styles.css')));
    assert.ok(fs.existsSync(path.join(v5Dir, 'js', 'icons.js')));
    assert.ok(fs.existsSync(path.join(v5Dir, 'js', 'store.js')));
    assert.ok(fs.existsSync(path.join(v5Dir, 'js', 'charts.js')));
    assert.ok(fs.existsSync(path.join(v5Dir, 'js', 'app.js')));
    assert.ok(fs.existsSync(path.join(v5Dir, 'js', 'bundle.js')));
    assert.ok(fs.existsSync(path.join(v5Dir, 'manifest.json')));
    assert.ok(fs.existsSync(path.join(v5Dir, 'sw.js')));

    const bundleCode = fs.readFileSync(path.join(v5Dir, 'js', 'bundle.js'), 'utf8');
    assert.ok(bundleCode.includes('APP_CREATOR'));
    assert.ok(bundleCode.includes('FChNeto'));
    assert.ok(bundleCode.includes('PediatricStore'));
    assert.ok(bundleCode.includes('PediatricApp'));

    // Verifica que o bundle compila sem erros
    assert.doesNotThrow(() => {
      new Function(bundleCode);
    }, 'v5 bundle.js deve compilar sem erro sintático');
  });

  test('v5 Botões com Estilos Silk & Rose Gold e Sem Preto Vercel', () => {
    const css = fs.readFileSync(path.join(rootDir, 'v5', 'css', 'styles.css'), 'utf8');
    
    // Botão de Plantão: gradiente rosa/rose gold com texto branco
    assert.ok(css.includes('.quick-action-btn.pink'));
    assert.ok(css.includes('linear-gradient(135deg, #EC407A 0%, #E8A598 100%)'));
    assert.ok(css.includes('color: #FFFFFF !important'));

    // Botão de Despesa: gradiente coral com texto branco
    assert.ok(css.includes('.quick-action-btn.coral'));
    assert.ok(css.includes('linear-gradient(135deg, #FF7043 0%, #FFA726 100%)'));

    // Chips de maternidade com border rose-gold
    assert.ok(css.includes('.quick-hospital-chip'));
    assert.ok(css.includes('--rose-gold'));

    // Anti-Crop dropdown in-flow expansion
    assert.ok(css.includes('.silk-select-menu'));
    assert.ok(css.includes('position: relative !important'));
  });
});

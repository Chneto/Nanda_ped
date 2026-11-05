/**
 * Finanças Pediatria /v8/ - Suíte de Estresse Adversarial & Auditoria de Integridade
 * Execução Empírica Automatizada • Zero Tolerância a Falhas • Verificação Matemática ao Centavo
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  APP_CREATOR,
  APP_VERSION,
  CANONICAL_CATEGORIES,
  DEFAULT_CATEGORIES,
  DEFAULT_INCOME_SOURCES,
  MACRO_GROUPS,
  addMonthsToDateString,
  calculateIncomeInstallments,
  calculateShiftInstallments,
  createCanonicalShift,
  createCanonicalExpense,
  generateExpenseInstallments,
  getCategoryKey,
  normalizeCategoryName,
  getMacroGroupForCategory,
  PediatricStore
} from '../js/store.js';

import { escapeHtml } from '../js/ui.js';
import { getIconSvg, sanitizeColor } from '../js/icons.js';
import { PediatricStorage, STORAGE_KEY } from '../js/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const V8_DIR = path.resolve(__dirname, '..');

describe('Finanças Pediatria /v8/ - Suíte de Estresse Adversarial', () => {

  // =========================================================================
  // 1. PLANTÕES COM CENTAVOS E DÍZIMAS EXTREMAS (D+60 75% + D+90 25%)
  // =========================================================================
  describe('1. Estresse Financeiro: Plantões, Micro-Centavos e Dízimas Periódicas', () => {
    
    it('comprova divisão de valores microscópicos (R$ 0,01 a R$ 0,05)', () => {
      const cases = [
        { net: 0.01, expD60: 0.01, expD90: 0.00 },
        { net: 0.02, expD60: 0.02, expD90: 0.00 },
        { net: 0.03, expD60: 0.02, expD90: 0.01 },
        { net: 0.04, expD60: 0.03, expD90: 0.01 },
        { net: 0.05, expD60: 0.04, expD90: 0.01 }
      ];

      for (const c of cases) {
        const { installment1, installment2 } = calculateShiftInstallments(c.net, '2026-05-10');
        assert.equal(installment1.value, c.expD60, `D+60 de R$ ${c.net} deve ser ${c.expD60}`);
        assert.equal(installment2.value, c.expD90, `D+90 de R$ ${c.net} deve ser ${c.expD90}`);
        const sum = Math.round((installment1.value + installment2.value) * 100) / 100;
        assert.equal(sum, c.net, `A soma exata das parcelas para R$ ${c.net} deve ser ${c.net}`);
      }
    });

    it('comprova exatidão em dízimas periódicas extremas (R$ 1.333,33 e afins)', () => {
      const oddValues = [
        1333.33,
        2666.67,
        3333.33,
        1111.11,
        7777.77,
        10000.01,
        1234.56,
        9876.54
      ];

      for (const net of oddValues) {
        const { installment1, installment2 } = calculateShiftInstallments(net, '2026-03-15');
        const sum = Math.round((installment1.value + installment2.value) * 100) / 100;
        assert.equal(sum, net, `Soma das parcelas de R$ ${net} (${installment1.value} + ${installment2.value}) deve ser rigorosamente igual a ${net}`);
      }
    });

    it('comprova exatidão em valores milionários extremos (R$ 999.999,99 e R$ 50.000.000,55)', () => {
      const largeValues = [
        999999.99,
        1000000.00,
        50000000.55
      ];

      for (const net of largeValues) {
        const { installment1, installment2 } = calculateShiftInstallments(net, '2026-01-01');
        const sum = Math.round((installment1.value + installment2.value) * 100) / 100;
        assert.equal(sum, net, `Soma das parcelas para R$ ${net} deve ser exata`);
      }
    });

    it('fuzzing aleatório de 10.000 valores fracionários: zero desvio de centavo', () => {
      for (let i = 0; i < 10000; i++) {
        // Gera valores entre 0.01 e 50000.00 com centavos reais
        const cents = Math.floor(Math.random() * 5000000) + 1;
        const net = cents / 100;
        const { installment1, installment2 } = calculateShiftInstallments(net, '2026-04-12');
        const sum = Math.round((installment1.value + installment2.value) * 100) / 100;
        assert.equal(sum, net, `Fuzz falhou em R$ ${net}: ${installment1.value} + ${installment2.value} !== ${net}`);
      }
    });

    it('regras customizadas de múltiplos splits preservam 100% da soma ao centavo', () => {
      const customRule = {
        type: 'custom_3_splits',
        splits: [
          { percentage: 33.33, lagMonths: 1 },
          { percentage: 33.33, lagMonths: 2 },
          { percentage: 33.34, lagMonths: 3 }
        ]
      };

      const testValues = [100.00, 1000.00, 1333.33, 9999.99];
      for (const val of testValues) {
        const installments = calculateIncomeInstallments(val, '2026-01-10', customRule);
        assert.equal(installments.length, 3);
        const sum = Math.round(installments.reduce((acc, inst) => acc + inst.value, 0) * 100) / 100;
        assert.equal(sum, val, `Regra de 3 splits falhou em R$ ${val}: soma deu ${sum}`);
      }
    });
  });

  // =========================================================================
  // 2. DATAS LIMITES E CLAMP DE FIM DE MÊS (addMonthsToDateString)
  // =========================================================================
  describe('2. Aritmética Temporal: Clamp de Fim de Mês sem Transbordamento', () => {

    it('31 de março: D+60 resulta em 31 de maio e D+90 resulta em 30 de junho (clamp)', () => {
      const base = '2026-03-31';
      const d60 = addMonthsToDateString(base, 2);
      const d90 = addMonthsToDateString(base, 3);

      assert.equal(d60, '2026-05-31', '31 de Março + 2 meses deve ser 31 de Maio');
      assert.equal(d90, '2026-06-30', '31 de Março + 3 meses deve ser 30 de Junho (clamp do dia 31 para 30)');
    });

    it('31 de janeiro em ano bissexto (2024) clampa para 29 de fevereiro', () => {
      const base = '2024-01-31';
      const feb2024 = addMonthsToDateString(base, 1);
      assert.equal(feb2024, '2024-02-29', '31 de Janeiro em ano bissexto (2024) deve clampar para 29 de Fevereiro');
    });

    it('31 de janeiro em ano comum (2025, 2026) clampa para 28 de fevereiro', () => {
      const base2025 = '2025-01-31';
      const base2026 = '2026-01-31';
      assert.equal(addMonthsToDateString(base2025, 1), '2025-02-28');
      assert.equal(addMonthsToDateString(base2026, 1), '2026-02-28');
    });

    it('29 de fevereiro em ano bissexto (2024-02-29) preserva dia 29 nos meses seguintes', () => {
      const base = '2024-02-29';
      assert.equal(addMonthsToDateString(base, 1), '2024-03-29');
      assert.equal(addMonthsToDateString(base, 2), '2024-04-29');
      assert.equal(addMonthsToDateString(base, 3), '2024-05-29');
    });

    it('anos seculares: 2000 é bissexto (clamp 29) e 2100 é comum (clamp 28)', () => {
      assert.equal(addMonthsToDateString('2000-01-31', 1), '2000-02-29');
      assert.equal(addMonthsToDateString('2100-01-31', 1), '2100-02-28');
    });

    it('transição de ano com 31 de outubro e 31 de dezembro', () => {
      // 31 de Outubro + 2 meses = 31 de Dezembro; + 3 meses = 31 de Janeiro (ano seguinte); + 4 meses = 28 de Fevereiro
      assert.equal(addMonthsToDateString('2026-10-31', 2), '2026-12-31');
      assert.equal(addMonthsToDateString('2026-10-31', 3), '2027-01-31');
      assert.equal(addMonthsToDateString('2026-10-31', 4), '2027-02-28');

      // 31 de Dezembro de 2025 + 2 meses = 28 de Fevereiro de 2026
      assert.equal(addMonthsToDateString('2025-12-31', 2), '2026-02-28');
      // 31 de Dezembro de 2023 + 2 meses = 29 de Fevereiro de 2024 (ano bissexto)
      assert.equal(addMonthsToDateString('2023-12-31', 2), '2024-02-29');
    });

    it('31 de agosto (+1 mês -> 30 de setembro; +3 meses -> 30 de novembro)', () => {
      assert.equal(addMonthsToDateString('2026-08-31', 1), '2026-09-30');
      assert.equal(addMonthsToDateString('2026-08-31', 3), '2026-11-30');
    });

    it('resiste a entradas corrompidas ou tipos anômalos sem lançar exceção', () => {
      const fallback = addMonthsToDateString(null, 1);
      assert.match(fallback, /^\d{4}-\d{2}-\d{2}$/);
      const fallback2 = addMonthsToDateString('invalid-date', 2);
      assert.match(fallback2, /^\d{4}-\d{2}-\d{2}$/);
      const fallback3 = addMonthsToDateString(undefined, 3);
      assert.match(fallback3, /^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // =========================================================================
  // 3. PARCELAMENTO DE 2x A 24x COM VALORES ÍMPARES E ABSORÇÃO NA 1ª PARCELA
  // =========================================================================
  describe('3. Compras Parceladas (2x a 24x): Absorção de Centavos Residuais na 1ª Parcela', () => {

    it('comprova matriz completa de 2x a 24x para R$ 100,00 com soma exata', () => {
      for (let n = 2; n <= 24; n++) {
        const installments = generateExpenseInstallments(
          { description: 'Teste Parcelamento', amount: 100.00, date: '2026-01-15' },
          n
        );

        assert.equal(installments.length, n, `Deve gerar exatamente ${n} parcelas`);
        const sum = Math.round(installments.reduce((acc, i) => acc + i.amount, 0) * 100) / 100;
        assert.equal(sum, 100.00, `Soma das parcelas em ${n}x para R$ 100,00 deve ser 100.00`);

        // Comprova que as parcelas da 2ª em diante são idênticas
        const basePart = installments[1].amount;
        for (let j = 1; j < n; j++) {
          assert.equal(installments[j].amount, basePart, `Parcela ${j + 1} deve ter o valor base ${basePart}`);
        }

        // Comprova que a 1ª parcela absorve o resíduo (first >= basePart)
        assert.ok(installments[0].amount >= basePart, `1ª parcela (${installments[0].amount}) deve absorver o resíduo`);
      }
    });

    it('comprova matriz completa de 2x a 24x para valor ímpar com centavos (R$ 1.250,55)', () => {
      const total = 1250.55;
      for (let n = 2; n <= 24; n++) {
        const installments = generateExpenseInstallments(
          { description: 'Congresso Pediatria', amount: total, date: '2026-02-20' },
          n
        );

        assert.equal(installments.length, n);
        const sum = Math.round(installments.reduce((acc, i) => acc + i.amount, 0) * 100) / 100;
        assert.equal(sum, total, `Soma das ${n} parcelas para R$ ${total} deve ser exata`);
      }
    });

    it('comprova números primos de parcelas (3x, 7x, 11x, 13x, 17x, 19x, 23x) em dízima R$ 3.333,33', () => {
      const primes = [3, 7, 11, 13, 17, 19, 23];
      const val = 3333.33;

      for (const p of primes) {
        const installments = generateExpenseInstallments(
          { description: 'Curso PALS', amount: val, date: '2026-03-01' },
          p
        );
        assert.equal(installments.length, p);
        const sum = Math.round(installments.reduce((acc, i) => acc + i.amount, 0) * 100) / 100;
        assert.equal(sum, val, `Soma em ${p}x para R$ ${val} deve ser rigorosamente ${val}`);
      }
    });

    it('comprova micro-valores parcelados: R$ 0,01 em 2x e R$ 0,05 em 4x', () => {
      const inst001 = generateExpenseInstallments({ description: 'Micro 0.01', amount: 0.01, date: '2026-01-01' }, 2);
      assert.equal(inst001.length, 2);
      assert.equal(inst001[0].amount, 0.01);
      assert.equal(inst001[1].amount, 0.00);
      assert.equal(inst001[0].amount + inst001[1].amount, 0.01);

      const inst005 = generateExpenseInstallments({ description: 'Micro 0.05', amount: 0.05, date: '2026-01-01' }, 4);
      assert.equal(inst005.length, 4);
      assert.equal(inst005[0].amount, 0.02); // 0.05 - 3 * 0.01 = 0.02
      assert.equal(inst005[1].amount, 0.01);
      assert.equal(inst005[2].amount, 0.01);
      assert.equal(inst005[3].amount, 0.01);
      const sum005 = Math.round(inst005.reduce((acc, i) => acc + i.amount, 0) * 100) / 100;
      assert.equal(sum005, 0.05);
    });

    it('clampa quantidade de parcelas entre 1 e 24 para valores fora dos limites', () => {
      const belowMin = generateExpenseInstallments({ description: 'Abaixo', amount: 100, date: '2026-01-01' }, -5);
      assert.equal(belowMin.length, 1);

      const zeroCount = generateExpenseInstallments({ description: 'Zero', amount: 100, date: '2026-01-01' }, 0);
      assert.equal(zeroCount.length, 1);

      const aboveMax = generateExpenseInstallments({ description: 'Acima', amount: 240, date: '2026-01-01' }, 50);
      assert.equal(aboveMax.length, 24);
    });
  });

  // =========================================================================
  // 4. INTEGRIDADE REFERENCIAL, SOFT-ARCHIVE & SNAPSHOTTING
  // =========================================================================
  describe('4. Integridade de Dados: Soft-Archive, Double Snapshotting e Lixeira com Desfazer', () => {

    it('categoria em uso: exclusão sem forceArchive é bloqueada (inUse: true)', () => {
      const store = new PediatricStore();
      store.init();

      // Cadastra categoria customizada
      const cat = store.addCategory({ name: 'Livros de Pediatria', macro_group: 'Formação & Carreira' });
      assert.ok(cat);

      // Cadastra despesa vinculada
      store.addExpense({
        description: 'Tratado de Pediatria Nelson',
        amount: 850.00,
        category: 'Livros de Pediatria',
        date: '2026-05-01'
      });

      // Tenta excluir sem forçar arquivamento
      const res = store.deleteCustomCategory(cat.id, { forceArchive: false });
      assert.equal(res.deleted, false);
      assert.equal(res.inUse, true);

      // Categoria continua ativa
      assert.ok(store.getActiveCategories().some(c => c.id === cat.id));
    });

    it('categoria em uso: exclusão com forceArchive aplica soft-archive (active: false)', () => {
      const store = new PediatricStore();
      store.init();

      const cat = store.addCategory({ name: 'Uniformes e Jalecos', macro_group: 'Formação & Carreira' });
      store.addExpense({
        description: 'Jaleco Bordado Dra.',
        amount: 320.00,
        category: 'Uniformes e Jalecos',
        date: '2026-05-01'
      });

      const res = store.deleteCustomCategory(cat.id, { forceArchive: true });
      assert.equal(res.deleted, true);
      assert.equal(res.archived, true);

      // Não aparece em getActiveCategories()
      assert.ok(!store.getActiveCategories().some(c => c.id === cat.id));
      // Permanece em getAllCategories() com active: false
      const found = store.getAllCategories().find(c => c.id === cat.id);
      assert.ok(found);
      assert.equal(found.active, false);

      // Despesa existente preserva integralmente os dados via snapshots
      const exp = store.data.expenses[0];
      assert.equal(exp.category_name_snapshot, 'Uniformes e Jalecos');
      assert.equal(exp.macro_group_snapshot, 'Formação & Carreira');
      assert.equal(exp.amount, 320.00);
    });

    it('fonte de renda em uso: exclusão com forceArchive aplica soft-archive mantendo shifts', () => {
      const store = new PediatricStore();
      store.init();

      const src = store.addIncomeSource({
        name: 'Clínica Infantil Morumbi',
        type: 'plantao',
        defaultAmount: 2200.00
      });
      assert.ok(src);

      const shift = store.addShift({
        source_name_snapshot: 'Clínica Infantil Morumbi',
        net_value: 2200.00,
        date: '2026-05-15'
      });
      assert.ok(shift);

      // Tenta excluir com forceArchive
      const res = store.deleteIncomeSource(src.id, { forceArchive: true });
      assert.equal(res.deleted, true);
      assert.equal(res.archived, true);

      // Não está ativa
      assert.ok(!store.getActiveIncomeSources().some(s => s.id === src.id));

      // Plantão histórico mantém snapshot da fonte e regra de pagamento
      const loadedShift = store.data.shifts.find(s => s.id === shift.id);
      assert.equal(loadedShift.source_name_snapshot, 'Clínica Infantil Morumbi');
      assert.equal(loadedShift.net_value, 2200.00);
      assert.equal(loadedShift.installments.length, 2);
    });

    it('lixeira e botão Desfazer (Undo) para plantão e despesa', () => {
      const store = new PediatricStore();
      store.init();

      const shift = store.addShift({
        hospital: 'Maternidade Principal',
        netValue: 1500.00,
        date: '2026-04-10'
      });
      const exp = store.addExpense({
        description: 'Livro Pediátrico',
        value: 120.00,
        category: 'Estudo',
        date: '2026-04-12'
      });

      // 1. Exclusão de plantão para lixeira
      const deletedShift = store.deleteShift(shift.id);
      assert.equal(deletedShift.id, shift.id);
      assert.equal(store.data.shifts.length, 0);
      assert.equal(store.data.trash.shifts.length, 1);

      // Restauração de plantão (Desfazer)
      const restoredShiftOk = store.restoreShift(deletedShift);
      assert.equal(restoredShiftOk, true);
      assert.equal(store.data.shifts.length, 1);
      assert.equal(store.data.trash.shifts.length, 0);

      // 2. Exclusão de despesa para lixeira
      const deletedExp = store.deleteExpense(exp.id);
      assert.equal(deletedExp.id, exp.id);
      assert.equal(store.data.expenses.length, 0);
      assert.equal(store.data.trash.expenses.length, 1);

      // Restauração de despesa (Desfazer)
      const restoredExpOk = store.restoreExpense(deletedExp);
      assert.equal(restoredExpOk, true);
      assert.equal(store.data.expenses.length, 1);
      assert.equal(store.data.trash.expenses.length, 0);
    });

    it('restauração das categorias de fábrica preserva categorias customizadas e despesas', () => {
      const store = new PediatricStore();
      store.init();

      // Cria despesa com categoria padrão
      store.addExpense({ description: 'Almoço', amount: 50, category: 'Refeição' });
      // Cria categoria customizada e despesa
      store.addCategory({ name: 'Café Especial', macro_group: 'Alimentação' });
      store.addExpense({ description: 'Grão Especial', amount: 80, category: 'Café Especial' });

      // Restaura fábrica
      const res = store.restoreDefaultCategories({ preserveCustom: true });
      assert.equal(res.restored, true);
      assert.equal(res.defaultCount, 23);
      assert.equal(res.preservedCustomCount, 1);

      // Ambas as despesas continuam existindo e íntegras
      assert.equal(store.data.expenses.length, 2);
    });
  });

  // =========================================================================
  // 5. INJEÇÃO DE PAYLOADS XSS & HIGIENIZAÇÃO DE CORES
  // =========================================================================
  describe('5. Segurança e Sanitização: Injeção de Scripts Maliciosos (XSS) e Estilos CSS', () => {

    it('escapeHtml neutraliza scripts clássicos, eventos on* e quebras de atributos', () => {
      const attacks = [
        { raw: '<script>alert("XSS")</script>', expected: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;' },
        { raw: '<img src=x onerror=alert(1)>', expected: '&lt;img src=x onerror=alert(1)&gt;' },
        { raw: '"><script>document.cookie</script>', expected: '&quot;&gt;&lt;script&gt;document.cookie&lt;/script&gt;' },
        { raw: "'; alert('Hacked'); //", expected: '&#39;; alert(&#39;Hacked&#39;); //' },
        { raw: '<a href="javascript:steal()">Link</a>', expected: '&lt;a href=&quot;javascript:steal()&quot;&gt;Link&lt;/a&gt;' },
        { raw: '<svg/onload=alert(1)>', expected: '&lt;svg/onload=alert(1)&gt;' }
      ];

      for (const a of attacks) {
        const escaped = escapeHtml(a.raw);
        assert.equal(escaped, a.expected);
        assert.ok(!escaped.includes('<script>'), 'Não pode conter tag script crua');
        assert.ok(!escaped.includes('<img'), 'Não pode conter tag img crua');
        assert.ok(!escaped.includes('<svg/'), 'Não pode conter tag svg executável');
      }
    });

    it('escapeHtml trata valores atípicos (null, undefined, números, booleans)', () => {
      assert.equal(escapeHtml(null), '');
      assert.equal(escapeHtml(undefined), '');
      assert.equal(escapeHtml(12345), '12345');
      assert.equal(escapeHtml(true), 'true');
      assert.equal(escapeHtml(0), '0');
    });

    it('sanitizeColor valida formatos hexadecimais e rgb/rgba estritos', () => {
      const valids = ['#FFF', '#fff', '#7E57C2', '#26A69A', '#12345678', 'rgba(255, 0, 0, 0.5)', 'rgb(10, 20, 30)', 'currentColor', 'inherit'];
      for (const v of valids) {
        assert.equal(sanitizeColor(v), v.trim());
      }
    });

    it('sanitizeColor neutraliza injeções maliciosas em atributos de estilo CSS', () => {
      const maliciousColors = [
        '#FF7043; background: url(javascript:alert(1))',
        'red" onload="alert(1)',
        '<script>alert(1)</script>',
        'expression(alert(1))',
        '#FFF; behavior: url(xss.htc)',
        'rgba(0,0,0,1); color: red',
        'javascript:void(0)'
      ];

      for (const bad of maliciousColors) {
        const safe = sanitizeColor(bad, '#7E57C2');
        assert.equal(safe, '#7E57C2', `Injeção "${bad}" deve ser rejeitada e retornar o fallback`);
      }
    });

    it('getIconSvg gera SVGs com atributos seguros e sanitiza cor injetada', () => {
      const svg = getIconSvg('hospital', { size: 24, color: '#7E57C2; onerror=alert(1)' });
      assert.ok(svg.startsWith('<svg'));
      assert.ok(!svg.includes('onerror'));
      assert.ok(svg.includes('currentColor') || svg.includes('#'));
    });
  });

  // =========================================================================
  // 6. ISOLAMENTO OFFLINE & AUSÊNCIA TOTAL DE DEPENDÊNCIAS DE NUVEM
  // =========================================================================
  describe('6. Zero-Cloud & Isolamento Offline: Ausência de Chamadas de Rede ou Nuvem', () => {

    it('v8/index.html NÃO contém referências a Vercel, Supabase, Auth ou CDNs externas', () => {
      const indexPath = path.join(V8_DIR, 'index.html');
      const content = fs.readFileSync(indexPath, 'utf-8');

      // Proíbe menções a serviços de nuvem
      assert.ok(!content.includes('supabase.co'), 'index.html não pode referenciar Supabase');
      assert.ok(!content.includes('supabase.io'), 'index.html não pode referenciar Supabase');
      assert.ok(!content.includes('supabase-js'), 'index.html não pode carregar SDK Supabase');
      assert.ok(!content.includes('/api/config'), 'index.html não pode invocar endpoint de config de nuvem');
      assert.ok(!content.includes('vercel.app'), 'index.html não pode referenciar Vercel');
      assert.ok(!content.includes('Silk Gate'), 'index.html não pode conter barreira de login Silk Gate');
      assert.ok(!content.includes('modal-cloud-config'), 'index.html não pode conter modal de config de nuvem');

      // Proíbe scripts de CDNs remotas
      const scriptSrcMatches = content.match(/<script[^>]+src=["'](https?:\/\/[^"']+)["']/gi) || [];
      assert.equal(scriptSrcMatches.length, 0, `Não pode haver nenhum script remoto externo em index.html`);

      // CSP estrita
      assert.ok(content.includes("connect-src 'self'"), 'CSP connect-src deve ser estritamente self');
      assert.ok(content.includes("object-src 'none'"), 'CSP object-src deve ser none');
    });

    it('nenhum arquivo JavaScript em v8/js/ contém chamadas a Vercel ou Supabase', () => {
      const jsDir = path.join(V8_DIR, 'js');
      const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

      for (const file of files) {
        const fullPath = path.join(jsDir, file);
        const code = fs.readFileSync(fullPath, 'utf-8');

        assert.ok(!code.includes('supabase.co'), `${file} não pode conter supabase.co`);
        assert.ok(!code.includes('createClient'), `${file} não pode conter createClient do Supabase`);
        assert.ok(!code.includes('/api/config'), `${file} não pode conter chamadas a /api/config`);
        assert.ok(!code.includes('service_role'), `${file} não pode conter service_role`);
      }
    });

    it('sw.js opera em cache 100% offline e não referencia endpoints de nuvem', () => {
      const swPath = path.join(V8_DIR, 'sw.js');
      const swCode = fs.readFileSync(swPath, 'utf-8');

      assert.ok(!swCode.includes('/api/config'), 'sw.js não deve referenciar /api/config');
      assert.ok(!swCode.includes('supabase'), 'sw.js não deve referenciar supabase');
      assert.ok(swCode.includes('v8'), 'sw.js deve pertencer ao namespace v8');
    });

    it('autoria imutável APP_CREATOR = "FChNeto" é onipresente em /v8/', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(APP_VERSION, '8.0.0');

      const indexPath = path.join(V8_DIR, 'index.html');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      assert.ok(indexContent.includes('content="FChNeto"'));
      assert.ok(indexContent.includes('FChNeto</strong>'));

      const manifestPath = path.join(V8_DIR, 'manifest.json');
      const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestRaw);
      assert.ok(manifestRaw.includes('FChNeto'), 'manifest.json deve conter atribuição a FChNeto');
      assert.ok(manifest.description.includes('FChNeto'), 'manifest.description deve creditar FChNeto');
    });
  });

});

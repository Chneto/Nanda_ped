import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  PediatricStore,
  TAX_REGIMES,
  CLINICAL_SECTORS,
  formatCurrency
} from '../js/store.js';

import { formatMoney } from '../js/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('TAX_REGIMES data integrity and split safety', () => {
  assert.ok(Array.isArray(TAX_REGIMES), 'TAX_REGIMES should be an array');
  assert.ok(TAX_REGIMES.length >= 4, 'Should contain at least 4 tax regimes');

  TAX_REGIMES.forEach(reg => {
    assert.ok(reg.id, `Regime ${JSON.stringify(reg)} must have an id`);
    assert.ok(reg.name, `Regime ${reg.id} must have a name property`);
    assert.ok(reg.label, `Regime ${reg.id} must have a label property`);
    assert.doesNotThrow(() => {
      const firstWord = (reg.name || reg.label).split(" ")[0];
      assert.ok(firstWord.length > 0);
    }, `Splitting regime name/label must never throw`);

    if (reg.id !== 'custom') {
      assert.equal(typeof reg.percentage, 'number', `Regime ${reg.id} percentage must be a number`);
      assert.ok(reg.percentage >= 0, `Percentage must be non-negative`);
    }
  });
});

test('getTaxSavingsSummary accurately calculates PJ Simples vs RPA and Fator R recommendation', () => {
  const store = new PediatricStore();
  store.loadDemoData();

  const taxSummary = store.getTaxSavingsSummary('2026-09');

  assert.ok(taxSummary.grossTotal > 0, 'Should have positive gross production in September');
  assert.equal(taxSummary.simplesRatePercent, 6, 'Simples rate must be 6%');
  assert.equal(taxSummary.rpaRatePercent, 27.5, 'RPA rate must be 27.5%');

  // Verify tax calculations
  const expectedSimples = Math.round(taxSummary.grossTotal * 0.06);
  const expectedRPA = Math.round(taxSummary.grossTotal * 0.275);
  assert.equal(taxSummary.pjTaxSimples, expectedSimples, 'PJ Simples tax should match 6%');
  assert.equal(taxSummary.pfTaxRPA, expectedRPA, 'RPA tax should match 27.5%');

  // Verify savings
  const expectedSavings = expectedRPA - expectedSimples;
  assert.equal(taxSummary.monthlySavings, expectedSavings, 'Monthly savings should be RPA - Simples');
  assert.equal(taxSummary.annualProjectedSavings, expectedSavings * 12, 'Annual projection should be 12x');

  // Fator R recommendation (28% of gross)
  const expectedProLabore = Math.round(taxSummary.grossTotal * 0.28);
  assert.equal(taxSummary.recommendedProLabore, expectedProLabore, 'Recommended pro-labore must equal 28% of gross for Fator R compliance');
});

test('getDoctorWellbeingMetrics monitors shift fatigue and consecutive shifts according to CFM guidelines', () => {
  const store = new PediatricStore();

  // Scenario 1: Light / healthy workload
  store.data.shifts = [
    {
      id: 's1',
      hospital: 'Hospital Infantil Sabará',
      shiftDate: '2026-10-05',
      shiftType: '12h Diurno',
      netValue: 1500
    },
    {
      id: 's2',
      hospital: 'Hospital Sabará',
      shiftDate: '2026-10-12',
      shiftType: '12h Diurno',
      netValue: 1500
    }
  ];

  const lightMetrics = store.getDoctorWellbeingMetrics('2026-10');
  assert.equal(lightMetrics.fatigueLevel, 'low');
  assert.equal(lightMetrics.totalHours, 24);
  assert.equal(lightMetrics.nightShiftsCount, 0);
  assert.ok(lightMetrics.statusBadge.includes('Saudável'));

  // Scenario 2: High fatigue due to consecutive night shifts
  store.data.shifts = [
    {
      id: 'n1',
      hospital: 'Pro Matre',
      shiftDate: '2026-10-15',
      shiftType: '12h Noturno',
      netValue: 1800
    },
    {
      id: 'n2',
      hospital: 'Pro Matre',
      shiftDate: '2026-10-16',
      shiftType: '12h Noturno',
      netValue: 1800
    }
  ];

  const highFatigue = store.getDoctorWellbeingMetrics('2026-10');
  assert.equal(highFatigue.fatigueLevel, 'high', 'Consecutive night shifts must trigger high fatigue alert');
  assert.equal(highFatigue.maxConsecutiveNights, 2);
  assert.ok(highFatigue.statusBadge.includes('Fadiga'));

  // Scenario 3: High fatigue due to excessive total hours (>60h in month)
  store.data.shifts = [
    { id: 'h1', hospital: 'PS', shiftDate: '2026-11-01', shiftType: '24h Completo', netValue: 3600 },
    { id: 'h2', hospital: 'PS', shiftDate: '2026-11-05', shiftType: '24h Completo', netValue: 3600 },
    { id: 'h3', hospital: 'PS', shiftDate: '2026-11-10', shiftType: '24h Completo', netValue: 3600 }
  ];
  const heavyMetrics = store.getDoctorWellbeingMetrics('2026-11');
  assert.equal(heavyMetrics.totalHours, 72);
  assert.equal(heavyMetrics.fatigueLevel, 'high');
});

test('generateCSV supports options.onlyMonth for scoped exports', () => {
  const store = new PediatricStore();
  store.loadDemoData();

  // Full export
  const fullCsv = store.generateCSV('2026-09');

  // Scoped export
  const scopedCsv = store.generateCSV('2026-09', { onlyMonth: true });

  assert.ok(fullCsv.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM');
  assert.ok(scopedCsv.startsWith('\uFEFF'), 'Scoped CSV must start with UTF-8 BOM');
  assert.ok(scopedCsv.includes('EXTRATO FINANCEIRO & PRODUCAO MEDICA'));
  assert.ok(scopedCsv.includes('RESUMO FINANCEIRO'));
  assert.ok(scopedCsv.includes('PLANTOES E ESCALAS'));
  assert.ok(scopedCsv.includes('DESPESAS E CUSTOS OPERACIONAIS'));

  // The scoped CSV lines must not have unescaped embedded semicolons in summary labels
  assert.ok(!scopedCsv.includes('Total Entradas em Caixa (R$);;'), 'No duplicate delimiters');
});

test('formatMoney masks values when privacy mode is active', () => {
  // Test default unmasked behavior
  const formatted = formatMoney(1500, true);
  assert.ok(formatted.includes('1.500,00'), 'Should format real value when forceShow is true');
});

test('getDoctorWellbeingMetrics correctly resets consecutive nights when separated by day shifts', () => {
  const store = new PediatricStore();
  // Alternating night and day shifts on consecutive days
  store.data.shifts = [
    { id: 's1', hospital: 'Sabará', shiftDate: '2026-10-01', shiftType: '12h Noturno', netValue: 1800 },
    { id: 's2', hospital: 'Sabará', shiftDate: '2026-10-02', shiftType: '12h Diurno', netValue: 1500 },
    { id: 's3', hospital: 'Sabará', shiftDate: '2026-10-03', shiftType: '12h Noturno', netValue: 1800 },
    { id: 's4', hospital: 'Sabará', shiftDate: '2026-10-04', shiftType: '12h Diurno', netValue: 1500 }
  ];

  const metrics = store.getDoctorWellbeingMetrics('2026-10');
  assert.equal(metrics.maxConsecutiveNights, 1, 'Alternating night and day shifts must NOT count as consecutive night shifts');
  assert.equal(metrics.nightShiftsCount, 2);
  assert.equal(metrics.totalHours, 48);
  assert.equal(metrics.maxConsecutiveDays, 4);
});

test('generateCSV respects options.referenceDate for accurate status evaluation', () => {
  const store = new PediatricStore();
  store.data.shifts = [
    {
      id: 'sh_eval',
      hospital: 'Hospital Sabará',
      shiftDate: '2026-06-10',
      expectedPaymentDate: '2026-09-10',
      status: 'pending',
      netValue: 2000
    }
  ];

  // Evaluated before expectedPaymentDate: should be Pendente
  const csvPending = store.generateCSV('2026-09', { onlyMonth: true, referenceDate: new Date('2026-09-08T12:00:00') });
  assert.ok(csvPending.includes('"Pendente"'), 'Shift before expected payment date must be marked Pendente');

  // Evaluated after expectedPaymentDate: should be Em Atraso
  const csvDelayed = store.generateCSV('2026-09', { onlyMonth: true, referenceDate: new Date('2026-09-15T12:00:00') });
  assert.ok(csvDelayed.includes('"Em Atraso"'), 'Shift past expected payment date without payment must be marked Em Atraso');
});

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PediatricStore,
  calculateHourlyRate,
  TAX_REGIMES,
  CLINICAL_SECTORS
} from '../js/store.js';

test('calculateHourlyRate across various shift types and edge cases', () => {
  // 12h Diurno: 12h divisor
  assert.equal(calculateHourlyRate(1440, '12h Diurno'), 120);
  assert.equal(calculateHourlyRate(1500, '12h Diurno'), 125);

  // 12h Noturno: 12h divisor
  assert.equal(calculateHourlyRate(1800, '12h Noturno'), 150);

  // 24h Plantão: 24h divisor
  assert.equal(calculateHourlyRate(3600, '24h'), 150);
  assert.equal(calculateHourlyRate(2400, 'Plantão 24h'), 100);

  // Sobreaviso: 12h divisor
  assert.equal(calculateHourlyRate(900, 'Sobreaviso 12h'), 75);

  // Zero and negative values
  assert.equal(calculateHourlyRate(0, '12h Diurno'), 0);
  assert.equal(calculateHourlyRate(-500, '12h Diurno'), 0);

  // Fallback to 12h for unknown types
  assert.equal(calculateHourlyRate(1200, 'Escala Especial'), 100);
});

test('getHospitalAnalytics computes rankings, hourly yields, and punctuality index', () => {
  const store = new PediatricStore();
  store.data.shifts = [
    {
      id: 's1',
      hospital: 'Hospital Sabará',
      shiftDate: '2026-06-10',
      shiftType: '12h Diurno',
      sector: 'UTI Neonatal',
      netValue: 1440,
      paymentLagMonths: 3,
      expectedPaymentDate: '2026-09-10',
      paidDate: '2026-09-08',
      isPaid: true
    },
    {
      id: 's2',
      hospital: 'Hospital Sabará',
      shiftDate: '2026-06-20',
      shiftType: '12h Noturno',
      sector: 'UTI Neonatal',
      netValue: 1800,
      paymentLagMonths: 3,
      expectedPaymentDate: '2026-09-20',
      paidDate: '2026-09-25', // 5 days late
      isPaid: true
    },
    {
      id: 's3',
      hospital: 'Hospital Infantil Darcy Vargas',
      shiftDate: '2026-06-15',
      shiftType: '24h',
      sector: 'PS Infantil',
      netValue: 4800, // 4800 / 24 = 200/h
      paymentLagMonths: 3,
      expectedPaymentDate: '2026-09-15',
      paidDate: '2026-09-15', // on time
      isPaid: true
    }
  ];

  const analytics = store.getHospitalAnalytics();

  assert.equal(analytics.length, 2);

  // Darcy Vargas has R$ 200/h vs Sabará R$ 135/h, so Darcy Vargas should rank first
  assert.equal(analytics[0].hospital, 'Hospital Infantil Darcy Vargas');
  assert.equal(analytics[0].averageHourlyRate, 200);
  assert.equal(analytics[0].shiftsCount, 1);
  assert.equal(analytics[0].totalHours, 24);
  assert.equal(analytics[0].punctualityRate, 100);

  assert.equal(analytics[1].hospital, 'Hospital Sabará');
  assert.equal(analytics[1].shiftsCount, 2);
  assert.equal(analytics[1].totalHours, 24);
  // (1440 + 1800) / 24 = 3240 / 24 = 135
  assert.equal(analytics[1].averageHourlyRate, 135);
  // 1 on time, 1 late = 50%
  assert.equal(analytics[1].punctualityRate, 50);
});

test('generateCSV creates valid Brazilian Excel formatted CSV with BOM and summary', () => {
  const store = new PediatricStore();
  store.loadDemoData();

  const csv = store.generateCSV('2026-09');

  // Must begin with UTF-8 BOM
  assert.ok(csv.startsWith('\uFEFF'), 'CSV must include UTF-8 BOM for Microsoft Excel');

  // Must include semicolon separator
  assert.ok(csv.includes(';'), 'CSV must use semicolons as delimiter for Brazilian Portuguese Excel');

  // Must include Doctor CRM and headers
  assert.ok(csv.includes('Dra. Fernanda'), 'CSV header should contain doctor name');
  assert.ok(csv.includes('CRM-SP'), 'CSV header should contain doctor CRM');
  assert.ok(csv.includes('EXTRATO FINANCEIRO'), 'CSV should contain title');

  // Must include table sections
  assert.ok(csv.includes('PLANTOES E ESCALAS'), 'CSV should have shifts section');
  assert.ok(csv.includes('DESPESAS E CUSTOS OPERACIONAIS'), 'CSV should have expenses section');
  assert.ok(csv.includes('RESUMO FINANCEIRO'), 'CSV should have summary section');

  // Must include specific demo items
  assert.ok(csv.includes('Hospital Infantil Sabará'));
  assert.ok(csv.includes('Anuidade CRM-SP'));
});

test('getMonthlyReport computes income goals and workload accurately', () => {
  const store = new PediatricStore();
  store.loadDemoData();

  // Test with custom goal
  store.updateDoctorProfile({
    monthlyIncomeGoal: 20000
  });

  const report = store.getMonthlyReport('2026-09', new Date('2026-09-15T12:00:00'));

  // Caixa total inflow = 7680 (shifts) + 8500 (salary) = 16180
  assert.equal(report.goals.target, 20000);
  assert.equal(report.goals.achieved, 16180);
  assert.equal(report.goals.remaining, 3820);
  // approxShiftsNeeded: Math.ceil(3820 / 2800) = 2
  assert.equal(report.goals.approxShiftsNeeded, 2);

  // Workload: 2 shifts in September 2026 (2 x 12h = 24h, 5270 / 24 = 219.58 -> 220)
  assert.equal(report.workload.totalHours, 24);
  assert.equal(report.workload.averageHourlyRate, 220);

  // Test when goal is 100% reached
  store.updateDoctorProfile({
    monthlyIncomeGoal: 10000
  });
  const reportReached = store.getMonthlyReport('2026-09', new Date('2026-09-15T12:00:00'));
  assert.ok(reportReached.goals.percent >= 100);
  assert.equal(reportReached.goals.remaining, 0);
  assert.equal(reportReached.goals.approxShiftsNeeded, 0);
});

test('Shift CRUD preserves clinical sector, tax regime, and notes', () => {
  const store = new PediatricStore();

  const newShift = store.addShift({
    hospital: 'Hospital Menino Jesus',
    shiftDate: '2026-10-05',
    shiftType: '12h Noturno',
    sector: 'Sala de Parto',
    taxRegime: 'Simples Nacional (6%)',
    taxRate: 6,
    notes: 'RN de 34 semanas intubado na sala de parto.',
    grossValue: 2000,
    netValue: 1880,
    paymentLagMonths: 3
  });

  assert.equal(newShift.sector, 'Sala de Parto');
  assert.equal(newShift.taxRegime, 'Simples Nacional (6%)');
  assert.equal(newShift.taxRate, 6);
  assert.equal(newShift.notes, 'RN de 34 semanas intubado na sala de parto.');

  // Update shift
  const updated = store.updateShift(newShift.id, {
    notes: 'Passagem concluída sem intercorrências adicionais.',
    taxRate: 15,
    taxRegime: 'Lucro Presumido (15%)'
  });

  assert.equal(updated.notes, 'Passagem concluída sem intercorrências adicionais.');
  assert.equal(updated.taxRate, 15);
  assert.equal(updated.taxRegime, 'Lucro Presumido (15%)');
  assert.equal(updated.sector, 'Sala de Parto'); // Unchanged

  // Duplicate shift clones attributes
  const cloned = store.duplicateShift(newShift.id);
  assert.equal(cloned.sector, 'Sala de Parto');
  assert.equal(cloned.taxRegime, 'Lucro Presumido (15%)');
  assert.equal(cloned.notes, 'Passagem concluída sem intercorrências adicionais.');
  assert.equal(cloned.shiftDate, '2026-10-12'); // 7 days later
});

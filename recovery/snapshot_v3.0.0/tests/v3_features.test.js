import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  PediatricStore,
  formatCurrency,
  formatDateBR,
  formatMonthYear,
  addMonths,
  calculateHourlyRate,
  APP_CREATOR,
  parseMedicalVoiceInput,
  generateSBARHandoff,
  parseOFX,
  parseBankCSV,
  reconcileBankTransactions,
  generateAccountantKit,
  PediatricSanctuaryDB
} from '../js/store.js';

import {
  renderForecast12MSVG
} from '../js/charts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('V3 Feature 1: Consultations & Puericultura Module CRUD and Metrics', (t) => {
  const store = new PediatricStore();
  store.data.consultations = []; // Start clean

  // Add Consultation
  const cons1 = store.addConsultation({
    patientName: "Bernardo (Mãe: Juliana)",
    consultationType: "Pacote Puericultura Anual",
    puericulturaMonth: "1º mês (RN)",
    isPackage: true,
    date: "2026-09-10",
    durationMinutes: 60,
    value: 450,
    paymentMethod: "PIX",
    paid: true,
    notes: "RN a termo, ganho ponderal satisfatório."
  });

  assert.ok(cons1.id, "Consultation must receive a unique ID");
  assert.strictEqual(cons1.patientName, "Bernardo (Mãe: Juliana)");
  assert.strictEqual(cons1.value, 450);
  assert.strictEqual(cons1.paid, true);

  // Add Second Consultation (Unpaid)
  const cons2 = store.addConsultation({
    patientName: "Alice (Mãe: Fernanda)",
    consultationType: "Primeira Consulta",
    date: "2026-09-15",
    durationMinutes: 45,
    value: 350,
    paymentMethod: "Cartão Débito",
    paid: false
  });

  // Query Consultations for month
  const sepConsultations = store.getConsultations("2026-09");
  assert.strictEqual(sepConsultations.length, 2);

  // Toggle paid
  const toggled = store.toggleConsultationPaid(cons2.id);
  assert.strictEqual(toggled.paid, true);

  // Metrics: Consultório vs Plantão comparison
  store.data.shifts = [
    {
      id: "shift-test-1",
      hospital: "Hospital Mater Dei",
      shiftDate: "2026-09-05",
      shiftType: "12h Diurno",
      grossValue: 1800,
      netValue: 1692,
      splitPayment: false,
      expectedPaymentDate: "2026-11-05"
    }
  ];

  const metrics = store.getConsultationMetrics("2026-09");
  assert.strictEqual(metrics.totalConsultations, 2);
  assert.strictEqual(metrics.totalGross, 800);
  assert.ok(metrics.consultationHourlyRate > 400, "Consultation hourly rate should be accurately calculated (> 400/h)");
  assert.strictEqual(metrics.shiftHourlyRate, 141);
  assert.ok(metrics.consultationAdvantagePercent > 100, "Advantage % should reflect the higher hourly yield of office consultations");

  // Delete Consultation (moves to trash)
  const deleted = store.deleteConsultation(cons1.id);
  assert.strictEqual(deleted, true);
  assert.strictEqual(store.getConsultations("2026-09").length, 1);
  assert.ok(store.data.trash.some(item => item.id === cons1.id && item.itemType === "consultation"));

  // Restore from trash
  const restored = store.restoreFromTrash(cons1.id);
  assert.strictEqual(restored, true);
  assert.strictEqual(store.getConsultations("2026-09").length, 2);
});

test('V3 Feature 2: CFM Shift Fatigue Bug Fix - Duration and Consultations Safety', (t) => {
  const store = new PediatricStore();

  store.data.shifts = [
    {
      id: "s-fatigue-1",
      hospital: "Mater Dei",
      shiftDate: "2026-09-01",
      shiftType: "6h Ambulatório/PS",
      grossValue: 900,
      netValue: 846,
      explicitHours: 6
    },
    {
      id: "s-fatigue-2",
      hospital: "Mater Dei",
      shiftDate: "2026-09-02",
      shiftType: "12h Noturno",
      grossValue: 1800,
      netValue: 1692
    }
  ];

  store.data.consultations = [
    {
      id: "c-fatigue-1",
      patientName: "Lucas",
      consultationType: "Puericultura (Avulsa)",
      date: "2026-09-03",
      durationMinutes: 60,
      value: 350
    }
  ];

  const wb = store.getDoctorWellbeingMetrics("2026-09");
  // Total worked hours: 6h (shift 1) + 12h (shift 2) + 1h (consultation) = 19h
  assert.strictEqual(wb.totalWorkedHours, 19, "Total worked hours must accurately sum 6h + 12h + 1h without false 12h/24h fallbacks");
  assert.strictEqual(wb.shiftHours, 18, "Hospital shift hours equal 18h");
  assert.strictEqual(wb.consultationHours, 1, "Consultation hours accurately equals 1h");
  assert.strictEqual(wb.shifts24hCount, 0, "No 24h shifts were performed");
  assert.strictEqual(wb.nightShiftsCount, 1, "Exactly one 12h night shift performed");
  assert.strictEqual(wb.fatigueLevel, "low", "19 hours in a month represents low fatigue level");
});

test('V3 Feature 3: 12-Month Rolling Cash Flow Forecast & Scrubber Data', (t) => {
  const store = new PediatricStore();
  store.loadDemoData();

  const projection = store.get12MonthsRollingProjection("2026-09", 12);
  assert.strictEqual(projection.months.length, 12, "Must project exactly 12 continuous rolling months");
  assert.strictEqual(projection.months[0].month, "2026-09");
  assert.ok(projection.reserveLine6M > 0, "6-month emergency reserve line must be positive");

  // Verify cumulative calculation
  let runningSum = projection.initialCashBalance || 0;
  projection.months.forEach(m => {
    runningSum += m.net;
    assert.strictEqual(m.cumulativeBalance, runningSum, "Cumulative balance must match running sum of net cash flows");
    assert.ok(typeof m.inflow === "number" && typeof m.expense === "number");
  });

  // Verify SVG generation with interactive hooks
  const svg = renderForecast12MSVG(projection);
  assert.ok(svg.includes("<svg"), "Must render valid SVG markup");
  assert.ok(svg.includes("forecast-12m-chart"), "Must include chart CSS class");
  assert.ok(svg.includes("Reserva Segura (6M)"), "Must include 6M reserve legend");
  assert.ok(svg.includes("Saldo Acumulado"), "Must include cumulative curve legend");
});

test('V3 Feature 4: DRE (Demonstrativo de Resultado do Exercício) & Fator R Dynamic Optimizer', (t) => {
  const store = new PediatricStore();
  store.loadDemoData();

  const dre = store.getDRE("2026-09");
  assert.ok(dre.grossRevenue > 0, "Gross revenue must be positive");
  assert.ok(dre.netRevenue <= dre.grossRevenue, "Net revenue must be <= gross revenue");
  assert.ok(typeof dre.proLabore === "number", "Pró-labore must be a number");
  assert.ok(typeof dre.netSurplus === "number", "Net surplus must be a number");

  const opt = store.getFatorROptimizer("2026-09");
  assert.ok(opt.rbt12 > 0, "RBT12 must be positive");
  assert.ok(opt.folha12 >= 0, "Folha12 must be non-negative");
  assert.ok(opt.currentFatorR >= 0, "Current Fator R ratio must be non-negative");
  assert.ok(opt.suggestedProLabore > 0, "Suggested Pró-labore for 28% threshold must be positive");
  assert.ok(opt.annualTaxSavings >= 0, "Projected annual savings from Anexo III vs V must be non-negative");
  assert.ok(opt.recommendation.length > 10, "Must provide human-readable medical tax guidance");
});

test('V3 Feature 5: SBAR Clinical Handover with LGPD Anonymization', (t) => {
  const shift = {
    hospital: "Maternidade Araken",
    sector: "UTI Neonatal",
    shiftDate: "2026-09-12",
    shiftType: "12h Noturno",
    notes: "Plantão com 4 RNs prematuros extremos em ventilação."
  };

  const fullSbar = generateSBARHandoff(shift, {
    situation: "Leito 04: RN de Maria Silva, IG 28s, PN 980g.",
    background: "Parto de emergência por descolamento prematuro de placenta. Fez 2 doses de surfactante.",
    assessment: "Estável em VAFO, parâmetros em desmame. Gasometria com pH 7.32, pCO2 42.",
    recommendation: "Manter vigilância hemodinâmica, colher hemograma e PCR às 06h.",
    anonymizePatient: false,
    doctorName: "Dra. Fernanda Pediatra",
    doctorCrm: "CRM-SP 123456"
  });

  assert.ok(fullSbar.includes("SBAR"), "Must include SBAR header");
  assert.ok(fullSbar.includes("Situação") || fullSbar.includes("Situation"), "Must include Situation section");
  assert.ok(fullSbar.includes("Background") || fullSbar.includes("Histórico"), "Must include Background section");
  assert.ok(fullSbar.includes("Avaliação") || fullSbar.includes("Assessment"), "Must include Assessment section");
  assert.ok(fullSbar.includes("Recomenda") || fullSbar.includes("Recommendation"), "Must include Recommendation section");
  assert.ok(fullSbar.includes("Maria Silva"), "Non-anonymized output must retain patient info");

  // LGPD Anonymized test
  const lgpdSbar = generateSBARHandoff(shift, {
    situation: "Leito 04: RN de Maria Silva, IG 28s, PN 980g.",
    background: "Parto de emergência.",
    assessment: "Estável.",
    recommendation: "Rotina.",
    anonymizePatient: true,
    doctorName: "Dra. Fernanda Pediatra",
    doctorCrm: "CRM-SP 123456"
  });

  assert.ok(!lgpdSbar.includes("Maria Silva"), "LGPD mode must sanitize full patient names");
  assert.ok(lgpdSbar.includes("LGPD"), "Must note LGPD protection in footer");
});

test('V3 Feature 6: Bank Statement Parser (OFX & CSV) and Reconciliation Engine', (t) => {
  const sampleOFX = `
OFXHEADER:100
DATA:OFXSGML
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>CREDIT
            <DTPOSTED>20260915120000[-03:EST]
            <TRNAMT>1692.00
            <FITID>TX1001
            <MEMO>TED 001 MATER DEI REPASSE
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>DEBIT
            <DTPOSTED>20260918120000[-03:EST]
            <TRNAMT>-320.00
            <FITID>TX1002
            <MEMO>PAGTO CRM SP ANUIDADE
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>
  `;

  const txs = parseOFX(sampleOFX);
  assert.strictEqual(txs.length, 2, "OFX parser must extract exactly 2 transactions");
  assert.strictEqual(txs[0].amount, 1692.00);
  assert.strictEqual(txs[0].type, "CREDIT");
  assert.strictEqual(txs[1].amount, -320.00);
  assert.strictEqual(txs[1].type, "DEBIT");

  const sampleCSV = `Data;Descricao;Valor
15/09/2026;TED MATER DEI;1692,00
18/09/2026;CRM CONSELHO;-320,00`;

  const csvTxs = parseBankCSV(sampleCSV);
  assert.strictEqual(csvTxs.length, 2, "CSV parser must extract 2 transactions");
  assert.strictEqual(csvTxs[0].amount, 1692.00);
  assert.strictEqual(csvTxs[1].amount, -320.00);

  // Reconciliation against shifts
  const store = new PediatricStore();
  store.data.shifts = [
    {
      id: "shift-rec-1",
      hospital: "Mater Dei",
      shiftDate: "2026-07-15",
      shiftType: "12h Diurno",
      grossValue: 1800,
      netValue: 1692,
      splitPayment: false,
      expectedPaymentDate: "2026-09-15",
      status: "pending"
    }
  ];
  store.data.expenses = [
    {
      id: "exp-rec-1",
      description: "Anuidade CRM SP",
      category: "CRM / CFM / Sociedades",
      value: 320,
      date: "2026-09-18",
      scope: "PJ"
    }
  ];

  const recResult = store.reconcileBankTransactions(txs, "2026-09");
  assert.ok(recResult.matches.length >= 1, "Must match transactions");
  assert.ok(recResult.matchedInflows.length >= 1, "Must match Mater Dei shift repayment");
  assert.strictEqual(recResult.matchedInflows[0].shift.id, "shift-rec-1");
  assert.ok(recResult.matchedOutflows.length >= 1, "Must match CRM expense");
  assert.strictEqual(recResult.matchedOutflows[0].expense.id, "exp-rec-1");
});

test('V3 Feature 7: Kit do Contador em 1 Toque Generation', (t) => {
  const store = new PediatricStore();
  store.loadDemoData();

  const kit = store.generateAccountantKit("2026-09");
  assert.ok(kit.summaryText.includes("FECHAMENTO CONTÁBIL") || kit.summaryText.includes("Faturamento Bruto"), "Summary text must contain title or gross revenue");
  assert.ok(kit.summaryText.includes("Fator R"), "Summary text must include Fator R section");
  assert.ok(kit.summaryText.includes(APP_CREATOR.name), "Summary text must maintain immutable signature");
  assert.ok(kit.csvContent.includes("\uFEFF"), "CSV content must include UTF-8 BOM for Brazilian Excel");
  assert.ok(kit.whatsAppLink.startsWith("https://"), "Must generate valid WhatsApp direct link");
});

test('V3 Feature 8: Doctor FIRE Simulator Metrics', (t) => {
  const store = new PediatricStore();
  store.loadDemoData();

  const fire = store.getDoctorFIREMetrics();
  assert.ok(fire.targetNestEgg > 0, "FIRE target nest egg must be positive (25x annual expenses)");
  assert.ok(fire.monthlyPassiveIncomeTarget > 0, "Monthly passive income target must be positive");
  assert.ok(typeof fire.shiftsReplacedCount === "number", "Shifts replaced count must be calculated");
  assert.ok(fire.fireProgressPercent >= 0, "FIRE progress percentage must be valid");
});

test('V3 Feature 9: Brazilian Medical NLP Voice Parser', (t) => {
  const store = new PediatricStore();

  // Test shift transcript
  const shiftRes = store.parseMedicalVoiceInput("Plantão 12h no Mater Dei no dia 15 valor dois mil reais");
  assert.ok(shiftRes, "NLP should parse valid transcript");
  assert.strictEqual(shiftRes.hospital, "Hospital Mater Dei");
  assert.strictEqual(shiftRes.grossValue, 2000);
  assert.strictEqual(shiftRes.shiftType, "12h Diurno");

  // Test consultation transcript
  const consRes = parseMedicalVoiceInput("Consulta de puericultura da Maria Eduarda trezentos e cinquenta");
  assert.ok(consRes, "NLP helper should parse consultation");
  assert.ok(consRes.patientName || consRes.hospital, "Should identify entity name");

  // Empty or invalid input
  const nullRes = parseMedicalVoiceInput("");
  assert.strictEqual(nullRes, null, "Empty input should return null safely");
});

test('V3 Feature 10: iOS Safari Auto-Zoom Shielding & Viewport Protection', (t) => {
  const css = fs.readFileSync(path.join(rootDir, 'css', 'styles.css'), 'utf8');
  assert.ok(css.includes('font-size: 16px !important'), "CSS must enforce 16px font-size on inputs to prevent iOS auto-zoom");

  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert.ok(html.includes('interactive-widget=resizes-content'), "Viewport meta must include interactive-widget=resizes-content");
  assert.ok(html.includes('btn-theme-toggle'), "Header must include dark mode toggle button");
  assert.ok(html.includes('spotlight-overlay'), "HTML must include spotlight search modal overlay");
});

test('V3 Feature 11: L2 Dual-Engine Storage Helper (PediatricSanctuaryDB)', (t) => {
  assert.strictEqual(typeof PediatricSanctuaryDB, "function", "PediatricSanctuaryDB class must be defined and exported");
  const db = new PediatricSanctuaryDB();
  assert.ok(typeof db.init === "function");
  assert.ok(typeof db.saveBackup === "function");
  assert.ok(typeof db.loadBackup === "function");
});

test('V3 Feature 12: Immutable App Creator Signature & Version Integrity', (t) => {
  assert.strictEqual(APP_CREATOR.name, "FChNeto", "Creator name must strictly remain FChNeto");
  assert.strictEqual(APP_CREATOR.signature, "Criado por FChNeto", "Creator signature must strictly remain Criado por FChNeto");
});

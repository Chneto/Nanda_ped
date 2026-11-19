/**
 * Finanças Pediatria /v8/ - UI: Relatório mensal (resumo, plantões, despesas, tetos) em tela, CSV e impressão/PDF
 * Funções puras (dados, CSV, HTML) + métodos instalados em PediatricUI.prototype por js/ui.js
 * Tudo é gerado localmente no aparelho: nenhum dado sai do iPhone.
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { formatCurrency, formatDateBR, formatMonthYear, getLocalDateString, APP_CREATOR } from '../store.js';
import { escapeHtml } from './helpers.js';
import { budgetStatusText } from './budget.js';

const STATUS_PARCELA = { received: 'Recebido', pending: 'Pendente' };

/** Monta os dados do relatório de um mês (sem DOM). */
export function buildMonthlyReport(store, month, now = new Date()) {
  const monthStr = String(month).slice(0, 7);
  const caixa = store.getMonthSummary(monthStr, 'caixa');
  const competencia = store.getMonthSummary(monthStr, 'competencia');
  const round2 = (n) => Math.round(n * 100) / 100;

  // Plantões que importam para o mês: trabalhados nele OU com parcela vencendo nele
  const shifts = (store.data.shifts || [])
    .map((s) => {
      const installments = (s.installments || []).map((i, idx) => ({
        number: idx + 1,
        percentage: i.percentage,
        date: i.date,
        value: round2(parseFloat(i.value) || 0),
        status: i.status === 'received' ? 'received' : 'pending',
        paidDate: i.paidDate || null,
        dueThisMonth: Boolean(i.date && i.date.startsWith(monthStr))
      }));
      return {
        id: s.id,
        date: s.date,
        hospital: s.source_name_snapshot || '',
        type: s.shiftType || 'Sala de Parto',
        net: round2(parseFloat(s.net_value) || 0),
        workedThisMonth: Boolean(s.date && s.date.startsWith(monthStr)),
        installments
      };
    })
    .filter((s) => s.workedThisMonth || s.installments.some((i) => i.dueThisMonth))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const expenses = (store.data.expenses || [])
    .filter((e) => e.date && e.date.startsWith(monthStr))
    .map((e) => ({
      date: e.date,
      description: e.description || '',
      category: e.category_name_snapshot || '',
      macro: e.macro_group_snapshot || e.macro_group || '',
      amount: round2(parseFloat(e.amount) || 0),
      parcel: (e.total_installments || 1) > 1 ? `${e.current_installment || 1}/${e.total_installments}` : ''
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || a.description.localeCompare(b.description, 'pt-BR'));

  return {
    month: monthStr,
    monthLabel: formatMonthYear(monthStr),
    generatedAt: getLocalDateString(now),
    doctorName: store.data.doctorName || 'Médica',
    doctorRole: store.data.doctorRole || '',
    summary: {
      residency: caixa.residencyIncome,
      receivedCash: caixa.shiftInflowRealized,
      pendingCash: caixa.shiftInflowPending,
      incomeCash: caixa.totalIncome,
      production: competencia.shiftProductionTotal,
      incomeAccrual: competencia.totalIncome,
      expenses: caixa.totalExpenses,
      balanceCash: caixa.balance,
      balanceAccrual: competencia.balance
    },
    shifts,
    expenses,
    byMacro: caixa.macroGroupBreakdown.map((m) => ({ name: m.name, amount: m.amount, pct: m.percentage })),
    byCategory: caixa.categoryBreakdown.map((c) => ({ name: c.name, macro: c.macro_group, amount: c.amount, pct: c.percentage })),
    budgets: store.getBudgetStatus(monthStr)
  };
}

export function reportFileName(report, ext = 'csv') {
  return `relatorio_financas_pediatria_${report.month}.${ext}`;
}

// ---------------------------------------------------------------------------
// CSV (planilha): separador ";" e vírgula decimal, como o Excel/Numbers em pt-BR esperam
// ---------------------------------------------------------------------------

const csvNumber = (n) => (Number.isFinite(Number(n)) ? String(Math.round(Number(n) * 100) / 100).replace('.', ',') : '');

/** Texto de usuário em CSV: aspas quando preciso + proteção contra injeção de fórmulas em planilhas */
export function csvText(value) {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // =, +, -, @ no início viram texto (evita execução como fórmula)
  if (/[;"\n\r]/.test(s) || s !== s.trim()) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function reportToCsv(report) {
  const n = csvNumber;
  const t = csvText;
  const d = (s) => (s ? formatDateBR(s) : '');
  const rows = [];
  const add = (...cells) => rows.push(cells.join(';'));
  const blank = () => rows.push('');
  const s = report.summary;

  add(t('Relatório mensal - Finanças Pediatria'), t(report.monthLabel));
  add(t('Gerado em'), d(report.generatedAt));
  add(t('Profissional'), t(report.doctorName), t(report.doctorRole));
  blank();

  add(t('RESUMO'));
  add(t('Bolsa de residência'), n(s.residency));
  add(t('Recebido neste mês (caixa)'), n(s.receivedCash));
  add(t('A receber neste mês (caixa)'), n(s.pendingCash));
  add(t('Entradas - regime de caixa'), n(s.incomeCash));
  add(t('Produção do mês (plantões trabalhados)'), n(s.production));
  add(t('Entradas - regime de competência'), n(s.incomeAccrual));
  add(t('Despesas do mês'), n(s.expenses));
  add(t('Saldo - regime de caixa'), n(s.balanceCash));
  add(t('Saldo - regime de competência'), n(s.balanceAccrual));
  blank();

  add(t('PLANTÕES E PARCELAS'));
  add(...['Data do plantão', 'Hospital', 'Tipo', 'Líquido', 'Parcela', 'Vencimento', 'Valor da parcela', 'Situação', 'Recebido em', 'Vence neste mês'].map(t));
  for (const sh of report.shifts) {
    for (const i of sh.installments) {
      add(d(sh.date), t(sh.hospital), t(sh.type), n(sh.net), t(`${i.number}ª (${i.percentage}%)`), d(i.date), n(i.value), t(STATUS_PARCELA[i.status]), d(i.paidDate), t(i.dueThisMonth ? 'Sim' : 'Não'));
    }
  }
  blank();

  add(t('DESPESAS'));
  add(...['Data', 'Descrição', 'Categoria', 'Grupo', 'Valor', 'Parcela'].map(t));
  for (const e of report.expenses) add(d(e.date), t(e.description), t(e.category), t(e.macro), n(e.amount), t(e.parcel));
  add(t('Total'), '', '', '', n(s.expenses), '');
  blank();

  add(t('DESPESAS POR GRUPO'));
  add(...['Grupo', 'Valor', '% do total'].map(t));
  for (const m of report.byMacro) add(t(m.name), n(m.amount), n(m.pct));
  blank();

  add(t('DESPESAS POR CATEGORIA'));
  add(...['Categoria', 'Grupo', 'Valor', '% do total'].map(t));
  for (const c of report.byCategory) add(t(c.name), t(c.macro), n(c.amount), n(c.pct));
  blank();

  add(t('TETOS MENSAIS'));
  add(...['Categoria', 'Teto', 'Gasto', 'Restante', '% do teto', 'Situação'].map(t));
  for (const b of report.budgets) add(t(b.name), n(b.cap), n(b.spent), n(b.remaining), n(b.pct), t(budgetStatusText(b.status)));

  return rows.join('\r\n') + '\r\n';
}

// ---------------------------------------------------------------------------
// HTML (pré-visualização na tela e impressão/PDF)
// ---------------------------------------------------------------------------

const money = (v) => escapeHtml(formatCurrency(v));
const pct = (v) => `${String(Math.round(v * 10) / 10).replace('.', ',')}%`;

function table(caption, headers, rowsHtml, { numericCols = [] } = {}) {
  const th = headers.map((h, i) => `<th scope="col"${numericCols.includes(i) ? ' class="num"' : ''}>${escapeHtml(h)}</th>`).join('');
  return `
    <div class="report-table-wrap" role="region" aria-label="${escapeHtml(caption)}" tabindex="0">
      <table class="report-table">
        <caption>${escapeHtml(caption)}</caption>
        <thead><tr>${th}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

export function renderReportHtml(report) {
  const s = report.summary;
  const kpi = (label, value, cls = '') => `<div class="report-kpi ${cls}"><dt>${escapeHtml(label)}</dt><dd>${money(value)}</dd></div>`;
  const balanceCls = (v) => (v < 0 ? 'neg' : 'pos');

  const shiftRows = report.shifts.flatMap((sh) => sh.installments.map((i, idx) => `
    <tr class="${i.dueThisMonth ? 'due' : ''}">
      <td>${idx === 0 ? escapeHtml(formatDateBR(sh.date)) : ''}</td>
      <td>${idx === 0 ? escapeHtml(sh.hospital) : ''}</td>
      <td class="num">${idx === 0 ? money(sh.net) : ''}</td>
      <td>${i.number}ª (${i.percentage}%)</td>
      <td>${escapeHtml(formatDateBR(i.date))}${i.dueThisMonth ? ' <span class="report-tag">neste mês</span>' : ''}</td>
      <td class="num">${money(i.value)}</td>
      <td>${STATUS_PARCELA[i.status]}${i.status === 'received' && i.paidDate ? ` em ${escapeHtml(formatDateBR(i.paidDate))}` : ''}</td>
    </tr>`)).join('');

  const expenseRows = report.expenses.map((e) => `
    <tr>
      <td>${escapeHtml(formatDateBR(e.date))}</td>
      <td>${escapeHtml(e.description)}${e.parcel ? ` <span class="report-tag">${escapeHtml(e.parcel)}</span>` : ''}</td>
      <td>${escapeHtml(e.category)}</td>
      <td class="num">${money(e.amount)}</td>
    </tr>`).join('') + `
    <tr class="total"><th scope="row" colspan="3">Total de despesas</th><td class="num">${money(s.expenses)}</td></tr>`;

  const macroRows = report.byMacro.map((m) => `<tr><td>${escapeHtml(m.name)}</td><td class="num">${money(m.amount)}</td><td class="num">${pct(m.pct)}</td></tr>`).join('');
  const categoryRows = report.byCategory.map((c) => `<tr><td>${escapeHtml(c.name)}</td><td class="num">${money(c.amount)}</td><td class="num">${pct(c.pct)}</td></tr>`).join('');
  const budgetRows = report.budgets.map((b) => `
    <tr>
      <td>${escapeHtml(b.name)}</td>
      <td class="num">${money(b.cap)}</td>
      <td class="num">${money(b.spent)}</td>
      <td class="num">${pct(b.pct)}</td>
      <td><span class="report-status ${b.status}">${budgetStatusText(b.status)}</span></td>
    </tr>`).join('');

  return `
    <article class="report-doc" aria-label="Relatório de ${escapeHtml(report.monthLabel)}">
      <header class="report-header">
        <h2 class="report-title">Relatório mensal</h2>
        <p class="report-sub">${escapeHtml(report.monthLabel)} • ${escapeHtml(report.doctorName)}${report.doctorRole ? ` (${escapeHtml(report.doctorRole)})` : ''}</p>
        <p class="report-meta">Gerado em ${escapeHtml(formatDateBR(report.generatedAt))}, localmente neste aparelho.</p>
      </header>

      <section class="report-section">
        <h3>Resumo</h3>
        <dl class="report-kpis">
          ${kpi('Bolsa de residência', s.residency)}
          ${kpi('Recebido neste mês (caixa)', s.receivedCash)}
          ${kpi('A receber neste mês (caixa)', s.pendingCash)}
          ${kpi('Entradas (caixa)', s.incomeCash)}
          ${kpi('Produção do mês (competência)', s.production)}
          ${kpi('Despesas do mês', s.expenses)}
          ${kpi('Saldo (caixa)', s.balanceCash, balanceCls(s.balanceCash))}
          ${kpi('Saldo (competência)', s.balanceAccrual, balanceCls(s.balanceAccrual))}
        </dl>
      </section>

      <section class="report-section">
        <h3>Plantões e parcelas</h3>
        ${report.shifts.length
          ? table('Plantões e parcelas do mês', ['Data', 'Hospital', 'Líquido', 'Parcela', 'Vencimento', 'Valor', 'Situação'], shiftRows, { numericCols: [2, 5] })
          : '<p class="report-empty">Nenhum plantão trabalhado ou com parcela neste mês.</p>'}
      </section>

      <section class="report-section">
        <h3>Despesas</h3>
        ${report.expenses.length
          ? table('Despesas do mês', ['Data', 'Descrição', 'Categoria', 'Valor'], expenseRows, { numericCols: [3] })
          : '<p class="report-empty">Nenhuma despesa neste mês.</p>'}
      </section>

      ${report.byMacro.length ? `
      <section class="report-section">
        <h3>Despesas por grupo</h3>
        ${table('Despesas por grupo', ['Grupo', 'Valor', '% do total'], macroRows, { numericCols: [1, 2] })}
        ${table('Despesas por categoria', ['Categoria', 'Valor', '% do total'], categoryRows, { numericCols: [1, 2] })}
      </section>` : ''}

      ${report.budgets.length ? `
      <section class="report-section">
        <h3>Tetos mensais</h3>
        ${table('Tetos mensais por categoria', ['Categoria', 'Teto', 'Gasto', '% do teto', 'Situação'], budgetRows, { numericCols: [1, 2, 3] })}
      </section>` : ''}

      <footer class="report-footer">Finanças Pediatria • criado por ${escapeHtml(APP_CREATOR)}</footer>
    </article>`;
}

// ---------------------------------------------------------------------------
// Métodos de UI
// ---------------------------------------------------------------------------

export class ReportMethods {
  openReportModal() {
    const body = document.getElementById('report-body');
    const titleEl = document.getElementById('modal-report-title');
    if (!body) return;
    this.closeAllModals();
    const month = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    this._report = buildMonthlyReport(this.store, month);
    if (titleEl) titleEl.textContent = `Relatório de ${this._report.monthLabel}`;
    body.innerHTML = renderReportHtml(this._report);
    this.openModal('#modal-report');
  }

  /** Salva a planilha (CSV): compartilhamento nativo no iPhone (Arquivos/iCloud) ou download */
  async exportReportCsv() {
    if (!this._report) return;
    const csv = '﻿' + reportToCsv(this._report); // BOM para o Excel reconhecer acentos (UTF-8)
    const res = await this.storage.saveTextFile(reportFileName(this._report, 'csv'), csv, 'text/csv;charset=utf-8', `Relatório ${this._report.monthLabel}`);
    if (res.success) this.showToast(`Planilha salva (${res.method === 'share' ? 'iCloud/Arquivos' : 'Download'})!`);
    else if (!res.cancelled) this.showToast(`Falha ao salvar a planilha: ${res.error}`, 'error');
  }

  /** Imprime o relatório (no iPhone: Imprimir > Salvar como PDF em Arquivos) */
  printReport() {
    if (!this._report) return;
    let root = document.getElementById('report-print-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'report-print-root';
      document.body.appendChild(root);
    }
    root.innerHTML = renderReportHtml(this._report);
    const cleanup = () => { root.innerHTML = ''; window.removeEventListener('afterprint', cleanup); };
    window.addEventListener('afterprint', cleanup);
    try {
      window.print();
    } catch (err) {
      cleanup();
      this.showToast('Não foi possível abrir a impressão neste navegador. Use a planilha (CSV).', 'error');
    }
  }
}

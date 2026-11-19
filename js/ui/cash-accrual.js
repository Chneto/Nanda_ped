/**
 * Finanças Pediatria /v8/ - UI: Gráfico Caixa × Competência (dinheiro que cai × produção do mês)
 * Funções puras (SVG/HTML) + método instalado em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { formatCurrency, formatDateBR, formatMonthYear, getLocalDateString } from '../store.js';
import { escapeHtml } from './helpers.js';

/** "R$ 2,5 mil" / "R$ 800" para os rótulos do eixo */
export function compactBRL(value) {
  const v = Math.abs(Number(value) || 0);
  if (v >= 1000) {
    const k = Math.round((v / 1000) * 10) / 10;
    return `R$ ${String(k).replace('.', ',')} mil`;
  }
  return `R$ ${Math.round(v)}`;
}

/** Teto "redondo" do eixo (1, 2, 2,5, 5 × 10^n) */
export function niceCeil(value) {
  if (!(value > 0)) return 1000;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const f = value / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

/** Frase-resumo do mês ativo comparando produção e caixa */
export function describeCashVsAccrual(point, fmt = formatCurrency) {
  if (!point) return '';
  const month = formatMonthYear(point.month);
  const cash = fmt(point.cash);
  const accrual = fmt(point.accrual);
  if (Math.abs(point.gap) < 0.005) return `Em ${month}, o que você produziu e o que caiu na conta são iguais: ${cash}.`;
  if (point.gap > 0) return `Em ${month} você produziu ${accrual}, mas só ${cash} cai na conta: ${fmt(point.gap)} ainda estão a caminho.`;
  return `Em ${month} entram ${cash} na conta, mais do que a produção de ${accrual}: ${fmt(Math.abs(point.gap))} vêm de plantões de meses anteriores.`;
}

/** Frase sobre as parcelas ainda não recebidas (vazia quando não há nada a receber) */
export function describePipeline(p, fmt = formatCurrency) {
  if (!p || p.count === 0) return '';
  const parcelas = (n) => `${n} ${n === 1 ? 'parcela' : 'parcelas'}`;
  let text = `Total a receber de plantões: ${fmt(p.total)} em ${parcelas(p.count)}`;
  if (p.nextDate) text += `, a próxima em ${formatDateBR(p.nextDate)}`;
  text += '.';
  if (p.overdueCount > 0) text += ` Em atraso: ${fmt(p.overdueTotal)} (${parcelas(p.overdueCount)}).`;
  return text;
}

/** SVG de barras agrupadas: Caixa (cheia) × Competência (hachurada), mês ativo destacado */
export function renderCashAccrualSvg(series) {
  const W = 340, H = 190, left = 62, right = 8, top = 12, bottom = 28;
  const plotW = W - left - right, plotH = H - top - bottom;
  const max = niceCeil(Math.max(...series.map(s => Math.max(s.cash, s.accrual)), 0));
  const y = (v) => top + plotH - (v / max) * plotH;
  const groupW = plotW / series.length;
  const barW = Math.min(18, (groupW - 8) / 2);

  const ticks = [0, max / 2, max].map(v => `
    <line class="cac-grid" x1="${left}" x2="${W - right}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"></line>
    <text class="cac-axis" x="${left - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${escapeHtml(v === 0 ? 'R$ 0' : compactBRL(v))}</text>`).join('');

  const groups = series.map((s, i) => {
    const gx = left + i * groupW;
    const cx = gx + groupW / 2;
    const h1 = Math.max(s.cash > 0 ? 2 : 0, plotH - (y(s.cash) - top));
    const h2 = Math.max(s.accrual > 0 ? 2 : 0, plotH - (y(s.accrual) - top));
    return `
      <g class="cac-group${s.isActive ? ' active' : ''}">
        ${s.isActive ? `<rect class="cac-active-bg" x="${gx.toFixed(1)}" y="${top}" width="${groupW.toFixed(1)}" height="${plotH}" rx="6"></rect>` : ''}
        <rect class="cac-bar cash" x="${(cx - barW - 1.5).toFixed(1)}" y="${y(s.cash).toFixed(1)}" width="${barW.toFixed(1)}" height="${h1.toFixed(1)}" rx="3"></rect>
        <rect class="cac-bar accrual" x="${(cx + 1.5).toFixed(1)}" y="${y(s.accrual).toFixed(1)}" width="${barW.toFixed(1)}" height="${h2.toFixed(1)}" rx="3"></rect>
        <text class="cac-label${s.isActive ? ' active' : ''}" x="${cx.toFixed(1)}" y="${H - 8}" text-anchor="middle">${escapeHtml(s.label.slice(0, 3))}</text>
      </g>`;
  }).join('');

  return `
    <svg class="cac-svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="cac-title cac-desc" focusable="false">
      <title id="cac-title">Caixa e competência dos próximos meses</title>
      <desc id="cac-desc">${escapeHtml(series.map(s => `${formatMonthYear(s.month)}: caixa ${formatCurrency(s.cash)}, competência ${formatCurrency(s.accrual)}`).join('. '))}.</desc>
      <defs>
        <pattern id="cac-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect class="cac-hatch-bg" width="6" height="6"></rect>
          <line class="cac-hatch-line" x1="0" y1="0" x2="0" y2="6" stroke-width="3"></line>
        </pattern>
      </defs>
      ${ticks}
      ${groups}
    </svg>`;
}

/** Cartão completo: frase, gráfico, legenda e tabela de valores (alternativa textual do gráfico) */
export function renderCashAccrualHtml(series, pipeline) {
  const active = series.find(s => s.isActive);
  const sign = (g) => (g > 0 ? '+' : g < 0 ? '−' : '');
  const rows = series.map(s => `
    <tr class="${s.isActive ? 'active' : ''}"${s.isActive ? ' aria-current="date"' : ''}>
      <th scope="row">${escapeHtml(s.label.slice(0, 3))}${s.isActive ? ' <span class="cac-now">atual</span>' : ''}</th>
      <td class="num">${escapeHtml(formatCurrency(s.cash))}</td>
      <td class="num">${escapeHtml(formatCurrency(s.accrual))}</td>
      <td class="num gap ${s.gap > 0 ? 'pos' : s.gap < 0 ? 'neg' : ''}">${sign(s.gap)}${escapeHtml(formatCurrency(Math.abs(s.gap)))}</td>
    </tr>`).join('');
  const pipe = describePipeline(pipeline);

  return `
    <figure class="cac-figure">
      <figcaption class="cac-lead">${escapeHtml(describeCashVsAccrual(active))}</figcaption>
      ${renderCashAccrualSvg(series)}
      <div class="cac-legend" aria-hidden="true">
        <span class="cac-legend-item"><span class="cac-swatch cash"></span> Caixa (cai na conta)</span>
        <span class="cac-legend-item"><span class="cac-swatch accrual"></span> Competência (produção)</span>
      </div>
      <div class="report-table-wrap" role="region" aria-label="Valores de caixa e competência por mês" tabindex="0">
        <table class="report-table cac-table">
          <caption>Valores por mês</caption>
          <thead><tr><th scope="col">Mês</th><th scope="col" class="num">Caixa</th><th scope="col" class="num">Competência</th><th scope="col" class="num">Diferença</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${pipe ? `<p class="cac-pipeline${pipeline.overdueCount > 0 ? ' overdue' : ''}">${escapeHtml(pipe)}</p>` : ''}
    </figure>`;
}

export class CashAccrualMethods {
  renderCashAccrualCard() {
    const el = document.getElementById('home-cashaccrual-container');
    if (!el) return;
    const month = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    el.innerHTML = renderCashAccrualHtml(this.store.getCashVsAccrualSeries(month), this.store.getReceivablesPipeline());
  }
}

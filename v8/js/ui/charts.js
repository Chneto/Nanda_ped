/**
 * Finanças Pediatria /v8/ - UI: Gráficos SVG nativos (100% offline)
 * Métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { formatCurrency } from '../store.js';
import { sanitizeColor } from '../icons.js';
import { escapeHtml } from './helpers.js';

export class ChartMethods {
  // =========================================================================
  // GRÁFICOS SVG NATIVOS (100% OFFLINE, ZERO LIBS)
  // =========================================================================

  renderForecastChart(forecast) {
    if (!forecast || forecast.length === 0) return '<p>Sem dados para projeção</p>';

    const maxVal = Math.max(...forecast.map(f => Math.max(f.income, f.expenses)), 1000);
    const height = 120;

    const bars = forecast.map(f => {
      const incH = Math.max(4, Math.round((f.income / maxVal) * height));
      const expH = Math.max(4, Math.round((f.expenses / maxVal) * height));

      return `
        <div class="forecast-col">
          <div class="forecast-bars-wrap">
            <div class="f-bar income" style="height: ${incH}px;" title="Entradas: ${formatCurrency(f.income)}"></div>
            <div class="f-bar expense" style="height: ${expH}px;" title="Saídas: ${formatCurrency(f.expenses)}"></div>
          </div>
          <span class="forecast-col-label">${escapeHtml(f.label)}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="forecast-chart-container">
        <div class="forecast-chart-grid">${bars}</div>
        <div class="forecast-legend">
          <span class="f-legend-item"><span class="dot mint"></span> Entradas</span>
          <span class="f-legend-item"><span class="dot coral"></span> Despesas</span>
        </div>
      </div>
    `;
  }


  renderDonutChart(categories, total) {
    if (!categories || categories.length === 0 || total <= 0) {
      return `
        <div class="donut-empty-wrap" style="text-align: center; padding: 20px; color: var(--text-muted);">
          <p>Nenhuma despesa para exibir no gráfico neste mês.</p>
        </div>
      `;
    }

    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPercentage = 0;
    const segments = categories.slice(0, 6).map(c => {
      const p = c.amount / total;
      const strokeDashoffset = circumference * (1 - p);
      const rotation = accumulatedPercentage * 360;
      accumulatedPercentage += p;

      return `
        <circle 
          cx="${size / 2}" 
          cy="${size / 2}" 
          r="${radius}" 
          fill="none" 
          stroke="${sanitizeColor(c.color)}" 
          stroke-width="${strokeWidth}" 
          stroke-dasharray="${circumference}" 
          stroke-dashoffset="${strokeDashoffset}" 
          transform="rotate(${rotation - 90} ${size / 2} ${size / 2})"
        />
      `;
    }).join('');

    const legend = categories.slice(0, 5).map(c => `
      <div class="donut-legend-row">
        <span class="donut-dot" style="background: ${sanitizeColor(c.color)};"></span>
        <span class="donut-cat-name">${escapeHtml(c.name)}</span>
        <strong class="donut-cat-pct">${c.percentage}%</strong>
      </div>
    `).join('');

    return `
      <div class="donut-chart-flex">
        <div class="donut-svg-wrap">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="rgba(200,200,200,0.15)" stroke-width="${strokeWidth}" />
            ${segments}
          </svg>
          <div class="donut-center-text">
            <span>Total</span>
            <strong>${formatCurrency(total)}</strong>
          </div>
        </div>
        <div class="donut-legend-wrap">
          ${legend}
        </div>
      </div>
    `;
  }
}

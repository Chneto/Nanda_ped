/**
 * Finanças Pediatria v2.0 - SVG Charts Engine
 * Renderização leve, responsiva e pura em SVG (sem dependências externas)
 * Criado por: FChNeto
 */

import { formatCurrency } from './store.js';
import { getIconSvg } from './icons.js';

/**
 * Renderiza o gráfico de previsão de 6 meses (Fluxo de Caixa)
 * @param {HTMLElement|string} container 
 * @param {Array<{month: string, label: string, income: number, expenses: number, balance: number}>} forecastData 
 */
export function renderForecastChart(container, forecastData = []) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  if (!forecastData || forecastData.length === 0) {
    el.innerHTML = `
      <div class="empty-chart-state">
        ${getIconSvg('chart', { size: 36, color: '#CE93D8' })}
        <p>Sem dados de projeção para exibir</p>
      </div>
    `;
    return;
  }

  const width = 420;
  const height = 180;
  const padding = { top: 25, right: 15, bottom: 30, left: 15 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Encontra o valor máximo para escala
  let maxVal = 1000;
  forecastData.forEach(d => {
    if (d.income > maxVal) maxVal = d.income;
    if (d.expenses > maxVal) maxVal = d.expenses;
  });
  // Adiciona margem de 15% ao topo
  maxVal *= 1.15;

  const colWidth = chartW / forecastData.length;
  const barWidth = Math.min(16, colWidth * 0.35);

  let barsSvg = '';
  let labelsSvg = '';
  let gridSvg = '';

  // Linhas sutis de grade horizontal
  for (let i = 1; i <= 3; i++) {
    const y = padding.top + (chartH * (i / 4));
    gridSvg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="3,3" />`;
  }

  forecastData.forEach((item, idx) => {
    const cx = padding.left + (idx * colWidth) + (colWidth / 2);
    const incomeH = maxVal > 0 ? (item.income / maxVal) * chartH : 0;
    const expenseH = maxVal > 0 ? (item.expenses / maxVal) * chartH : 0;

    const incomeY = padding.top + chartH - incomeH;
    const expenseY = padding.top + chartH - expenseH;

    const incomeX = cx - barWidth - 1;
    const expenseX = cx + 1;

    // Barra de Ganho (Verde Menta Suave)
    barsSvg += `
      <g class="chart-group" data-label="${item.label}">
        <rect x="${incomeX}" y="${incomeY}" width="${barWidth}" height="${incomeH}" rx="4" fill="var(--mint-income, #26A69A)" opacity="0.9">
          <title>${item.label}: Ganho ${formatCurrency(item.income)}</title>
        </rect>
        <rect x="${expenseX}" y="${expenseY}" width="${barWidth}" height="${expenseH}" rx="4" fill="var(--coral-expense, #FF7043)" opacity="0.9">
          <title>${item.label}: Gasto ${formatCurrency(item.expenses)}</title>
        </rect>
      </g>
    `;

    // Rótulo do Mês abreviado
    const shortLabel = item.label.slice(0, 3);
    labelsSvg += `
      <text x="${cx}" y="${height - 8}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-muted, #7A7E91)">
        ${shortLabel}
      </text>
    `;
  });

  const svgHtml = `
    <div class="chart-wrapper">
      <div class="chart-header-legend">
        <span class="legend-item"><span class="legend-dot mint"></span> Entradas (Salário + Plantões D+60/D+90)</span>
        <span class="legend-item"><span class="legend-dot coral"></span> Despesas</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="clean-svg-chart" preserveAspectRatio="xMidYMid meet">
        ${gridSvg}
        ${barsSvg}
        ${labelsSvg}
      </svg>
    </div>
  `;

  el.innerHTML = svgHtml;
}

/**
 * Renderiza o gráfico de rosca das Despesas com porcentagem e legenda detalhada
 * @param {HTMLElement|string} container 
 * @param {Array<{category: string, value: number, percentage: number, icon: string, color: string}>} breakdown 
 * @param {number} totalExpenses 
 */
export function renderDonutExpenses(container, breakdown = [], totalExpenses = 0) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  if (!breakdown || breakdown.length === 0 || totalExpenses <= 0) {
    el.innerHTML = `
      <div class="empty-donut-state">
        <div class="empty-icon-circle">
          ${getIconSvg('cart', { size: 30, color: '#AB47BC' })}
        </div>
        <p class="empty-text">Nenhuma despesa computada neste mês</p>
        <span class="empty-sub">Toque no botão "+" para registrar suas despesas</span>
      </div>
    `;
    return;
  }

  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercent = 0;
  let slicesSvg = '';

  breakdown.forEach((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);

    slicesSvg += `
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        fill="transparent"
        stroke="${item.color || '#AB47BC'}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
        stroke-dashoffset="${strokeDashoffset}"
        transform="rotate(-90 ${center} ${center})"
        class="donut-segment"
      >
        <title>${item.category}: ${formatCurrency(item.value)} (${item.percentage.toFixed(1)}%)</title>
      </circle>
    `;
    accumulatedPercent += item.percentage;
  });

  // Legenda com as top categorias
  let legendHtml = '<div class="donut-legend-list">';
  breakdown.forEach(item => {
    legendHtml += `
      <div class="donut-legend-row">
        <div class="donut-cat-badge" style="background-color: ${item.color}18; color: ${item.color};">
          ${getIconSvg(item.icon, { size: 16, color: item.color })}
        </div>
        <div class="donut-cat-info">
          <span class="donut-cat-name">${item.category}</span>
          <span class="donut-cat-pct">${item.percentage.toFixed(1)}%</span>
        </div>
        <div class="donut-cat-val">${formatCurrency(item.value)}</div>
      </div>
    `;
  });
  legendHtml += '</div>';

  const donutSvg = `
    <div class="donut-container">
      <div class="donut-visual-box">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="donut-svg">
          <circle
            cx="${center}"
            cy="${center}"
            r="${radius}"
            fill="transparent"
            stroke="var(--border-subtle, rgba(0,0,0,0.06))"
            stroke-width="${strokeWidth}"
          />
          ${slicesSvg}
        </svg>
        <div class="donut-center-label">
          <span class="center-title">Total</span>
          <span class="center-value">${formatCurrency(totalExpenses)}</span>
        </div>
      </div>
      ${legendHtml}
    </div>
  `;

  el.innerHTML = donutSvg;
}

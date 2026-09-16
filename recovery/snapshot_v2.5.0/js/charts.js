/**
 * Pediatric Financial Sanctuary - Pure Vanilla SVG Chart Generator
 * 100% Dependency-free, accessible, responsive SVG graphics.
 */

import { formatCurrency } from './store.js';

/**
 * Generates an SVG Bar/Line combo chart showing cash inflow forecast for the next 4 months.
 * @param {Array<{label: string, shiftInflow: number, salaryInflow: number, totalInflow: number, receivedAmount: number, pendingAmount: number}>} forecastData
 * @param {object} options
 * @returns {string} SVG HTML string
 */
export function renderForecastChartSVG(forecastData, options = {}) {
  if (!forecastData || forecastData.length === 0) {
    return `
      <div class="flex flex-col items-center justify-center p-6 text-on-surface-variant text-center">
        <span class="material-symbols-outlined text-[32px] text-primary/40 mb-1">query_stats</span>
        <p class="font-body-sm text-body-sm">Sem previsões de plantões para os próximos meses.</p>
      </div>
    `;
  }

  const width = 360;
  const height = 180;
  const padLeft = 32;
  const padRight = 20;
  const padTop = 32;
  const padBottom = 35;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  // Find maximum inflow to scale Y axis
  const maxVal = Math.max(...forecastData.map(d => d.totalInflow), 10000);
  const niceMax = Math.ceil(maxVal / 2000) * 2000;

  const colWidth = chartWidth / forecastData.length;
  const barWidth = 24;

  // Calculate points for trend line and bars
  const points = forecastData.map((d, i) => {
    const x = padLeft + i * colWidth + colWidth / 2;
    const barHeight = (d.totalInflow / niceMax) * chartHeight;
    const y = padTop + chartHeight - barHeight;
    return { x, y, barHeight, data: d };
  });

  // Build SVG path for trend line
  let linePathD = "";
  let areaPathD = `M ${points[0].x} ${padTop + chartHeight} L ${points[0].x} ${points[0].y}`;

  points.forEach((pt, i) => {
    if (i === 0) {
      linePathD = `M ${pt.x} ${pt.y}`;
    } else {
      const prev = points[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      linePathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
      areaPathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }
  });

  const lastPt = points[points.length - 1];
  areaPathD += ` L ${lastPt.x} ${padTop + chartHeight} Z`;

  // Grid lines
  const gridSteps = [0, 0.5, 1];
  const gridLines = gridSteps.map(step => {
    const y = padTop + chartHeight - step * chartHeight;
    const val = Math.round(step * niceMax / 1000);
    return `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3 3" />
      <text x="${padLeft - 6}" y="${y + 3}" fill="currentColor" fill-opacity="0.45" font-size="9" font-family="Manrope" text-anchor="end">${val}k</text>
    `;
  }).join("");

  // Bars and data labels
  const barsMarkup = points.map((pt, i) => {
    const isCurrent = i === 0;
    const barX = pt.x - barWidth / 2;
    const valK = (pt.data.totalInflow / 1000).toFixed(1).replace(".", ",") + "k";

    return `
      <g class="chart-col group cursor-pointer" data-index="${i}" data-label="${pt.data.label}" data-val="${pt.data.totalInflow}">
        <!-- Touch/Click hit area -->
        <rect x="${pt.x - colWidth / 2}" y="${padTop}" width="${colWidth}" height="${chartHeight + padBottom}" fill="transparent" />

        <!-- Bar background track -->
        <rect x="${barX}" y="${padTop}" width="${barWidth}" height="${chartHeight}" rx="12" fill="#ebedff" fill-opacity="0.45" />

        <!-- Actual Bar with gradient -->
        <rect class="transition-all duration-300 group-hover:brightness-110" x="${barX}" y="${pt.y}" width="${barWidth}" height="${Math.max(pt.barHeight, 4)}" rx="12" fill="url(#barGradient)" />

        <!-- Top Inflow Value Label -->
        <text x="${pt.x}" y="${Math.max(pt.y - 8, 14)}" fill="${isCurrent ? '#EC407A' : '#7e4a8a'}" font-size="10" font-family="Manrope" font-weight="700" text-anchor="middle">
          R$ ${valK}
        </text>

        <!-- X Axis Label -->
        <text x="${pt.x}" y="${height - 10}" fill="${isCurrent ? '#EC407A' : '#4d444d'}" font-size="11" font-family="Manrope" font-weight="${isCurrent ? '700' : '500'}" text-anchor="middle">
          ${pt.data.label}
        </text>
      </g>
    `;
  }).join("");

  // Nodes on trend line
  const dotsMarkup = points.map(pt => `
    <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#ffffff" stroke="#EC407A" stroke-width="2.5" />
  `).join("");

  return `
    <div class="relative w-full overflow-hidden">
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none" aria-label="Previsão de Recebimentos em 4 Meses">
        <defs>
          <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#EC407A" />
            <stop offset="60%" stop-color="#F48FB1" />
            <stop offset="100%" stop-color="#CE93D8" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#EC407A" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#EC407A" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        ${gridLines}

        <!-- Trend Line Area -->
        <path d="${areaPathD}" fill="url(#areaGradient)" />

        <!-- Trend Line Stroke -->
        <path d="${linePathD}" fill="none" stroke="#EC407A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" />

        <!-- Bars & Labels -->
        ${barsMarkup}

        <!-- Nodes -->
        ${dotsMarkup}
      </svg>
    </div>
  `;
}

/**
 * Generates an SVG Donut chart showing expense distribution by category.
 * @param {Array<{category: string, amount: number, percentage: number, color: string, icon: string}>} categoriesData
 * @param {number} totalExpenses
 * @returns {{svg: string, legend: string}}
 */
export function renderDonutChartSVG(categoriesData, totalExpenses) {
  if (!categoriesData || categoriesData.length === 0 || totalExpenses <= 0) {
    const emptySvg = `
      <div class="relative w-32 h-32 flex items-center justify-center">
        <svg class="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#ebedff" stroke-width="12" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
          <span class="material-symbols-outlined text-primary text-[20px]">spa</span>
          <span class="font-label-sm text-[10px] text-on-surface-variant leading-tight">Sem gastos</span>
        </div>
      </div>
    `;
    const emptyLegend = `
      <div class="flex flex-col items-center justify-center p-3 text-center text-on-surface-variant font-body-sm text-body-sm">
        Nenhuma despesa registrada para este mês.
      </div>
    `;
    return { svg: emptySvg, legend: emptyLegend };
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ≈ 238.76

  let cumulativeOffset = 0;
  const sorted = [...categoriesData].sort((a, b) => b.amount - a.amount);
  const primaryCategory = sorted[0];

  const circlesMarkup = sorted.map(item => {
    const rawDash = (item.amount / totalExpenses) * circumference;
    const gap = sorted.length > 1 ? 1.5 : 0;
    const dashLength = Math.max(0, rawDash - gap);
    const strokeOffset = -cumulativeOffset;
    cumulativeOffset += rawDash;

    return `
      <circle
        cx="50"
        cy="50"
        r="${radius}"
        fill="none"
        stroke="${item.color}"
        stroke-width="12"
        stroke-dasharray="${dashLength.toFixed(1)} ${circumference.toFixed(1)}"
        stroke-dashoffset="${strokeOffset.toFixed(1)}"
        stroke-linecap="butt"
        class="transition-all duration-500 hover:stroke-[14] cursor-pointer"
        data-category="${item.category}"
        data-amount="${item.amount}"
      />
    `;
  }).join("");

  const svg = `
    <div class="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <!-- Background Track -->
        <circle cx="50" cy="50" r="${radius}" fill="none" stroke="#ebedff" stroke-width="12" />
        <!-- Segment Arcs -->
        ${circlesMarkup}
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span class="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">
          ${primaryCategory.percentage}%
        </span>
        <span class="font-label-sm text-[11px] text-on-surface-variant truncate max-w-[70px] mt-0.5">
          ${primaryCategory.category.split('/')[0]}
        </span>
      </div>
    </div>
  `;

  const legend = `
    <div class="flex flex-col gap-2 min-w-0 flex-1">
      ${sorted.map(item => `
        <div class="flex items-center justify-between gap-2 text-on-surface group">
          <div class="flex items-center gap-2 truncate min-w-0">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${item.color};"></span>
            <span class="font-body-sm text-body-sm truncate" title="${item.category}">${item.category}</span>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <span class="font-label-sm text-label-sm text-on-surface font-semibold">${item.percentage}%</span>
            <span class="font-label-sm text-[11px] text-on-surface-variant hidden sm:inline">(${formatCurrency(item.amount)})</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  return { svg, legend };
}

/**
 * Generates an SVG bar chart comparing expenses between current and previous month.
 * @param {object} momData result of store.getMonthOverMonthExpenseVariation(monthStr)
 * @returns {string} SVG HTML string
 */
export function renderMonthOverMonthChartSVG(momData) {
  if (!momData || (!momData.currentTotal && !momData.prevTotal)) {
    return `
      <div class="p-4 text-center text-on-surface-variant text-[12px]">
        Dados insuficientes para comparação mês a mês.
      </div>
    `;
  }

  const max = Math.max(momData.currentTotal, momData.prevTotal, 1000);
  const curH = Math.max(8, Math.round((momData.currentTotal / max) * 100));
  const prevH = Math.max(8, Math.round((momData.prevTotal / max) * 100));

  const diffBadge = momData.isIncrease
    ? `<span class="text-error font-bold text-[11px] flex items-center gap-0.5">▲ +${momData.diffPercent}% (+${formatCurrency(momData.diffValue)})</span>`
    : `<span class="text-tertiary font-bold text-[11px] flex items-center gap-0.5">▼ ${momData.diffPercent}% (${formatCurrency(momData.diffValue)})</span>`;

  return `
    <div class="flex flex-col gap-3 p-4 bg-surface-container-low rounded-2xl">
      <div class="flex items-center justify-between">
        <span class="text-[12px] font-bold text-on-surface">Evolução Mês a Mês</span>
        ${diffBadge}
      </div>
      <div class="flex items-end justify-around h-32 pt-4 px-4 border-b border-outline-variant/30">
        <!-- Mês Anterior -->
        <div class="flex flex-col items-center gap-1.5 flex-1 max-w-[80px]">
          <span class="text-[10px] font-bold text-on-surface-variant">${formatCurrency(momData.prevTotal)}</span>
          <div class="w-12 bg-surface-container-high rounded-t-xl transition-all duration-500" style="height: ${prevH}px;"></div>
          <span class="text-[11px] font-semibold text-on-surface-variant">${momData.prevMonthStr.slice(5)}/${momData.prevMonthStr.slice(2, 4)}</span>
        </div>
        <!-- Mês Atual -->
        <div class="flex flex-col items-center gap-1.5 flex-1 max-w-[80px]">
          <span class="text-[10px] font-bold text-secondary">${formatCurrency(momData.currentTotal)}</span>
          <div class="w-12 bg-gradient-to-t from-secondary to-primary rounded-t-xl transition-all duration-500 shadow-sm" style="height: ${curH}px;"></div>
          <span class="text-[11px] font-bold text-secondary">${momData.currentMonthStr.slice(5)}/${momData.currentMonthStr.slice(2, 4)}</span>
        </div>
      </div>
      <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 px-1">
        <span>Pessoal (PF): <strong class="text-on-surface font-semibold">${momData.pfPercent}%</strong> (${formatCurrency(momData.currentPF)})</span>
        <span>PJ (Trabalho): <strong class="text-on-surface font-semibold">${momData.pjPercent}%</strong> (${formatCurrency(momData.currentPJ)})</span>
      </div>
    </div>
  `;
}

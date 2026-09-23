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

  const isDark = typeof document !== 'undefined' && (
    (document.documentElement && document.documentElement.getAttribute('data-theme') === 'dark') ||
    (document.body && document.body.classList && document.body.classList.contains('dark'))
  );

  // Grid lines
  const gridSteps = [0, 0.5, 1];
  const gridLines = gridSteps.map(step => {
    const y = padTop + chartHeight - step * chartHeight;
    const val = Math.round(step * niceMax / 1000);
    return `
      <line class="chart-grid-line" x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="${isDark ? 'rgba(206,147,216,0.2)' : 'currentColor'}" stroke-opacity="${isDark ? '1' : '0.08'}" stroke-dasharray="3 3" />
      <text class="chart-grid-label" x="${padLeft - 6}" y="${y + 3}" fill="${isDark ? '#D8B4E2' : 'currentColor'}" fill-opacity="${isDark ? '0.85' : '0.45'}" font-size="9" font-family="Manrope" text-anchor="end">${val}k</text>
    `;
  }).join("");

  // Bars and data labels
  const barsMarkup = points.map((pt, i) => {
    const isCurrent = i === 0;
    const barX = pt.x - barWidth / 2;
    const valK = (pt.data.totalInflow / 1000).toFixed(1).replace(".", ",") + "k";
    const valColor = isDark ? (isCurrent ? '#FF69B4' : '#F48FB1') : (isCurrent ? '#EC407A' : '#7e4a8a');
    const labelColor = isDark ? (isCurrent ? '#FF69B4' : '#E8CEEE') : (isCurrent ? '#EC407A' : '#4d444d');
    const trackColor = isDark ? '#2B1838' : '#ebedff';
    const trackOpacity = isDark ? '0.6' : '0.45';

    return `
      <g class="chart-col group cursor-pointer" data-index="${i}" data-label="${pt.data.label}" data-val="${pt.data.totalInflow}">
        <!-- Touch/Click hit area -->
        <rect x="${pt.x - colWidth / 2}" y="${padTop}" width="${colWidth}" height="${chartHeight + padBottom}" fill="transparent" />

        <!-- Bar background track -->
        <rect class="chart-bar-track" x="${barX}" y="${padTop}" width="${barWidth}" height="${chartHeight}" rx="12" fill="${trackColor}" fill-opacity="${trackOpacity}" />

        <!-- Actual Bar with gradient -->
        <rect class="transition-all duration-300 group-hover:brightness-110" x="${barX}" y="${pt.y}" width="${barWidth}" height="${Math.max(pt.barHeight, 4)}" rx="12" fill="url(#barGradient)" />

        <!-- Top Inflow Value Label -->
        <text class="chart-bar-value" x="${pt.x}" y="${Math.max(pt.y - 8, 14)}" fill="${valColor}" font-size="10" font-family="Manrope" font-weight="700" text-anchor="middle">
          R$ ${valK}
        </text>

        <!-- X Axis Label -->
        <text class="chart-axis-label" x="${pt.x}" y="${height - 10}" fill="${labelColor}" font-size="11" font-family="Manrope" font-weight="${isCurrent ? '700' : '600'}" text-anchor="middle">
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

/**
 * Generates an expandable 12-Month Rolling Cash Flow Chart with Interactive Scrubber,
 * Cumulative Balance Curve, and Emergency Reserve safety threshold.
 * @param {object|Array} projectionData result of store.get12MonthsRollingProjection() or months array
 * @param {object} options
 * @returns {string} HTML markup with SVG and interactive scrubber
 */
export function renderForecast12MSVG(projectionData, options = {}) {
  const dataList = Array.isArray(projectionData) ? projectionData : (projectionData && projectionData.months ? projectionData.months : []);
  const emergencyReserve = (projectionData && projectionData.emergencyReserve) ? projectionData.emergencyReserve : 60000;

  if (!dataList || dataList.length === 0) {
    return `
      <div class="p-6 text-center text-on-surface-variant text-[13px]">
        Sem dados de projeção para os próximos 12 meses.
      </div>
    `;
  }

  const width = 740;
  const height = 210;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 32;
  const padBottom = 35;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const maxInflow = Math.max(...dataList.map(d => Number(d.totalInflow) || 0), 15000);
  const maxBalance = Math.max(...dataList.map(d => Number(d.cumulativeBalance) || 0), emergencyReserve, 10000);
  const maxY = Math.max(maxInflow, maxBalance, emergencyReserve * 1.15);
  const niceMax = Math.ceil(maxY / 5000) * 5000;

  const colWidth = chartWidth / dataList.length;
  const barWidth = 20;

  // Points for bars and cumulative balance line
  const points = dataList.map((d, i) => {
    const x = padLeft + i * colWidth + colWidth / 2;
    const inflow = Number(d.totalInflow) || 0;
    const balance = Number(d.cumulativeBalance) || 0;
    const barHeight = Math.max(4, (inflow / niceMax) * chartHeight);
    const yBar = padTop + chartHeight - barHeight;
    const yBalance = padTop + chartHeight - Math.max(0, (balance / niceMax) * chartHeight);
    return { x, yBar, barHeight, yBalance, data: d, inflow, balance };
  });

  // Trend line for cumulative balance
  let linePathD = "";
  let areaPathD = `M ${points[0].x} ${padTop + chartHeight} L ${points[0].x} ${points[0].yBalance}`;

  points.forEach((pt, i) => {
    if (i === 0) {
      linePathD = `M ${pt.x} ${pt.yBalance}`;
    } else {
      const prev = points[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.yBalance;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.yBalance;
      linePathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.yBalance}`;
      areaPathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.yBalance}`;
    }
  });

  const lastPt = points[points.length - 1];
  areaPathD += ` L ${lastPt.x} ${padTop + chartHeight} Z`;

  const isDark12M = typeof document !== 'undefined' && (
    (document.documentElement && document.documentElement.getAttribute('data-theme') === 'dark') ||
    (document.body && document.body.classList && document.body.classList.contains('dark'))
  );

  // Horizontal Emergency Reserve guideline
  const yEmergency = padTop + chartHeight - (emergencyReserve / niceMax) * chartHeight;
  const emergencyK = Math.round(emergencyReserve / 1000);

  // Y Grid
  const gridSteps = [0, 0.5, 1];
  const gridLines = gridSteps.map(step => {
    const y = padTop + chartHeight - step * chartHeight;
    const valK = Math.round((step * niceMax) / 1000);
    return `
      <line class="chart-grid-line" x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="${isDark12M ? 'rgba(206,147,216,0.2)' : 'currentColor'}" stroke-opacity="${isDark12M ? '1' : '0.08'}" stroke-dasharray="3 3" />
      <text class="chart-grid-label" x="${padLeft - 6}" y="${y + 3}" fill="${isDark12M ? '#D8B4E2' : 'currentColor'}" fill-opacity="${isDark12M ? '0.85' : '0.45'}" font-size="9" font-family="Manrope" text-anchor="end">${valK}k</text>
    `;
  }).join("");

  // Bars and touch scrubber hit zones
  const barsMarkup = points.map((pt, i) => {
    const isCurrent = i === 0;
    const barX = pt.x - barWidth / 2;
    const inflowK = (pt.inflow / 1000).toFixed(1).replace(".", ",") + "k";
    const valColor = isDark12M ? (isCurrent ? '#FF69B4' : '#F48FB1') : (isCurrent ? '#EC407A' : '#7e4a8a');
    const labelColor = isDark12M ? (isCurrent ? '#FF69B4' : '#E8CEEE') : (isCurrent ? '#EC407A' : '#4d444d');
    const trackColor = isDark12M ? '#2B1838' : '#ebedff';
    const trackOpacity = isDark12M ? '0.55' : '0.35';

    return `
      <g class="scrubber-column group cursor-pointer"
         data-index="${i}"
         data-month="${pt.data.fullLabel || pt.data.label}"
         data-inflow="${pt.inflow}"
         data-balance="${pt.balance}"
         data-x="${pt.x}"
         data-y="${pt.yBalance}">
        
        <!-- Touch scrubber hit area -->
        <rect x="${pt.x - colWidth / 2}" y="${padTop}" width="${colWidth}" height="${chartHeight + padBottom}" fill="transparent" />

        <!-- Bar background track -->
        <rect class="chart-bar-track" x="${barX}" y="${padTop}" width="${barWidth}" height="${chartHeight}" rx="10" fill="${trackColor}" fill-opacity="${trackOpacity}" />

        <!-- Actual Inflow Bar -->
        <rect class="transition-all duration-300 group-hover:brightness-110" x="${barX}" y="${pt.yBar}" width="${barWidth}" height="${pt.barHeight}" rx="10" fill="url(#barGradient12M)" />

        <!-- Value Label -->
        <text class="chart-bar-value" x="${pt.x}" y="${Math.max(pt.yBar - 6, 14)}" fill="${valColor}" font-size="9" font-family="Manrope" font-weight="700" text-anchor="middle">
          ${inflowK}
        </text>

        <!-- X Axis Month Label -->
        <text class="chart-axis-label" x="${pt.x}" y="${height - 10}" fill="${labelColor}" font-size="10" font-family="Manrope" font-weight="${isCurrent ? '700' : '600'}" text-anchor="middle">
          ${pt.data.label}
        </text>
      </g>
    `;
  }).join("");

  // Balance Dots
  const dotsMarkup = points.map(pt => `
    <circle cx="${pt.x}" cy="${pt.yBalance}" r="3.5" fill="${isDark12M ? '#1F1228' : '#ffffff'}" stroke="${isDark12M ? '#FF69B4' : '#7e4a8a'}" stroke-width="2" class="pointer-events-none" />
  `).join("");

  return `
    <div class="forecast-12m-wrapper relative w-full flex flex-col gap-2">
      <!-- Interactive Scrubber Tooltip Container (Dynamic) -->
      <div id="scrubber-tooltip" class="hidden absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-surface-container-highest/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-[11px] font-bold text-on-surface pointer-events-none border border-secondary/20 flex items-center gap-2 transition-all">
        <span id="scrubber-tooltip-month" class="text-secondary">Setembro 2026</span>
        <span>•</span>
        <span>Entradas: <strong id="scrubber-tooltip-inflow" class="text-mint-income">R$ 0</strong></span>
        <span>•</span>
        <span>Saldo: <strong id="scrubber-tooltip-balance" class="text-primary">R$ 0</strong></span>
      </div>

      <!-- Horizontal Scrollable Canvas -->
      <div class="forecast-12m-scroll relative w-full overflow-x-auto select-none pt-2">
        <svg viewBox="0 0 ${width} ${height}" class="forecast-12m-chart w-[740px] h-[210px] overflow-visible" aria-label="Projeção Rolante de Fluxo de Caixa 12 Meses">
          <defs>
            <linearGradient id="barGradient12M" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#EC407A" />
              <stop offset="60%" stop-color="#F48FB1" />
              <stop offset="100%" stop-color="#CE93D8" />
            </linearGradient>
            <linearGradient id="balanceAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#7e4a8a" stop-opacity="0.16" />
              <stop offset="100%" stop-color="#7e4a8a" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Grid Lines -->
          ${gridLines}

          <!-- Emergency Reserve Threshold Guideline -->
          <line x1="${padLeft}" y1="${yEmergency}" x2="${width - padRight}" y2="${yEmergency}" stroke="#FF7043" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.85" />
          <text x="${width - padRight - 4}" y="${Math.max(yEmergency - 5, 12)}" fill="#FF7043" font-size="9" font-family="Manrope" font-weight="700" text-anchor="end">
            🛡️ Reserva Segura (6M) (${emergencyK}k)
          </text>

          <!-- Cumulative Balance Area -->
          <path d="${areaPathD}" fill="url(#balanceAreaGradient)" />

          <!-- Cumulative Balance Line -->
          <path d="${linePathD}" fill="none" stroke="#7e4a8a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Bars & Scrubber Zones -->
          ${barsMarkup}

          <!-- Balance Nodes -->
          ${dotsMarkup}

          <!-- Scrubber Touch Guide Line (Controlled via JS) -->
          <line id="scrubber-guide" class="scrubber-guide-line hidden" x1="0" y1="${padTop}" x2="0" y2="${padTop + chartHeight}" />
        </svg>
      </div>

      <!-- Scrubber Footer Hint & Legend -->
      <div class="flex items-center justify-between px-2 text-[11px] text-on-surface-variant">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-secondary to-primary inline-block"></span>
          <span>Entradas</span>
          <span class="w-3 h-0.5 bg-[#7e4a8a] inline-block ml-2"></span>
          <span>Saldo Acumulado</span>
        </span>
        <span class="text-[10px] text-secondary font-medium">↔ Deslize para navegar pelos 12 meses</span>
      </div>
    </div>
  `;
}

if (typeof window !== "undefined") {
  window.renderForecastChartSVG = renderForecastChartSVG;
  window.renderDonutChartSVG = renderDonutChartSVG;
  window.renderMonthOverMonthChartSVG = renderMonthOverMonthChartSVG;
  window.renderForecast12MSVG = renderForecast12MSVG;
}


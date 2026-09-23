/**
 * Finanças Pediatria v4.0 - SVG Charts Engine "Silk & Rose Gold"
 * Renderização leve, responsiva e pura em SVG (sem dependências externas)
 * Suporte a Macro-Grupos de Despesas, Sparklines e Mini-Calendário Visual
 * Criado por: FChNeto (APP_CREATOR)
 */

import { formatCurrency, formatDateBR, getMacroGroupForCategory } from './store.js';
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
        ${getIconSvg('chart', { size: 36, color: '#E8A598' })}
        <p>Sem dados de projeção para exibir</p>
      </div>
    `;
    return;
  }

  const width = 420;
  const height = 190;
  const padding = { top: 25, right: 18, bottom: 32, left: 18 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  let maxVal = 1000;
  forecastData.forEach(d => {
    if (d.income > maxVal) maxVal = d.income;
    if (d.expenses > maxVal) maxVal = d.expenses;
  });
  maxVal *= 1.15; // Margem superior

  const colWidth = chartW / forecastData.length;
  const barWidth = Math.min(18, colWidth * 0.36);

  let barsSvg = '';
  let labelsSvg = '';
  let gridSvg = '';

  // Linhas sutis de grade
  for (let i = 1; i <= 3; i++) {
    const y = padding.top + (chartH * (i / 4));
    gridSvg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.05" stroke-dasharray="4,4" />`;
  }

  forecastData.forEach((item, idx) => {
    const cx = padding.left + (idx * colWidth) + (colWidth / 2);
    const incomeH = maxVal > 0 ? (item.income / maxVal) * chartH : 0;
    const expenseH = maxVal > 0 ? (item.expenses / maxVal) * chartH : 0;

    const incomeY = padding.top + chartH - incomeH;
    const expenseY = padding.top + chartH - expenseH;

    const incomeX = cx - barWidth - 1.5;
    const expenseX = cx + 1.5;

    barsSvg += `
      <g class="chart-group" data-label="${item.label}">
        <!-- Barra de Entradas (Menta Suave) -->
        <rect x="${incomeX}" y="${incomeY}" width="${barWidth}" height="${incomeH}" rx="6" fill="url(#mintGrad)" opacity="0.95">
          <title>${item.label}: Entradas ${formatCurrency(item.income)}</title>
        </rect>
        <!-- Barra de Despesas (Coral / Rose Gold) -->
        <rect x="${expenseX}" y="${expenseY}" width="${barWidth}" height="${expenseH}" rx="6" fill="url(#coralGrad)" opacity="0.95">
          <title>${item.label}: Gastos ${formatCurrency(item.expenses)}</title>
        </rect>
      </g>
    `;

    const shortLabel = item.label.slice(0, 3);
    labelsSvg += `
      <text x="${cx}" y="${height - 10}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-muted, #8C8494)">
        ${shortLabel}
      </text>
    `;
  });

  const svgHtml = `
    <div class="chart-wrapper">
      <div class="chart-header-legend">
        <span class="legend-item"><span class="legend-dot mint"></span> Entradas (Residência + D+60/D+90)</span>
        <span class="legend-item"><span class="legend-dot coral"></span> Despesas</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="clean-svg-chart" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="mintGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#26A69A" />
            <stop offset="100%" stop-color="#00897B" />
          </linearGradient>
          <linearGradient id="coralGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FF7043" />
            <stop offset="100%" stop-color="#E8A598" />
          </linearGradient>
        </defs>
        ${gridSvg}
        ${barsSvg}
        ${labelsSvg}
      </svg>
    </div>
  `;

  el.innerHTML = svgHtml;
}

/**
 * Renderiza o gráfico de rosca das Despesas com alternador Macro-Grupo vs Detalhado
 * @param {HTMLElement|string} container 
 * @param {Array<Object>} breakdown 
 * @param {number} totalExpenses 
 * @param {'macro'|'detailed'} viewMode 
 * @param {Function} onToggleMode 
 */
export function renderDonutExpenses(container, breakdown = [], totalExpenses = 0, viewMode = 'macro', onToggleMode = null) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  if (!breakdown || breakdown.length === 0 || totalExpenses <= 0) {
    el.innerHTML = `
      <div class="empty-donut-state">
        <div class="empty-icon-circle">
          ${getIconSvg('cart', { size: 32, color: '#E8A598' })}
        </div>
        <p class="empty-text">Nenhuma despesa computada neste mês</p>
        <span class="empty-sub">Toque no botão "+ Nova Despesa" para registrar</span>
      </div>
    `;
    return;
  }

  const size = 190;
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
        stroke="${item.color || '#E8A598'}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
        stroke-dashoffset="${strokeDashoffset}"
        transform="rotate(-90 ${center} ${center})"
        class="donut-segment"
      >
        <title>${item.name || item.category}: ${formatCurrency(item.value)} (${item.percentage.toFixed(1)}%)</title>
      </circle>
    `;
    accumulatedPercent += item.percentage;
  });

  // Legenda com as categorias / macro-grupos
  let legendHtml = '<div class="donut-legend-list">';
  breakdown.forEach(item => {
    const title = item.name || item.category;
    legendHtml += `
      <div class="donut-legend-row">
        <div class="donut-cat-badge" style="background-color: ${item.color}15; color: ${item.color};">
          ${getIconSvg(item.icon, { size: 16, color: item.color })}
        </div>
        <div class="donut-cat-info">
          <span class="donut-cat-name">${title}</span>
          <div class="donut-mini-bar-track">
            <div class="donut-mini-bar-fill" style="width: ${item.percentage.toFixed(1)}%; background: ${item.color};"></div>
          </div>
          <span class="donut-cat-pct">${item.percentage.toFixed(1)}%</span>
        </div>
        <div class="donut-cat-val">${formatCurrency(item.value)}</div>
      </div>
    `;
  });
  legendHtml += '</div>';

  const modeToggleHtml = `
    <div class="chart-mode-pill-container">
      <div class="chart-mode-pill">
        <button class="mode-btn ${viewMode === 'macro' ? 'active' : ''}" id="btn-chart-mode-macro">
          Macro-Grupos
        </button>
        <button class="mode-btn ${viewMode === 'detailed' ? 'active' : ''}" id="btn-chart-mode-detailed">
          Detalhada
        </button>
      </div>
    </div>
  `;

  const donutSvg = `
    <div class="donut-container">
      ${modeToggleHtml}
      <div class="donut-visual-box">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="donut-svg">
          <circle
            cx="${center}"
            cy="${center}"
            r="${radius}"
            fill="transparent"
            stroke="var(--border-subtle, rgba(232, 165, 152, 0.15))"
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

  // Vincula botões de alternância
  const btnMacro = el.querySelector('#btn-chart-mode-macro');
  const btnDet = el.querySelector('#btn-chart-mode-detailed');
  if (btnMacro && onToggleMode) {
    btnMacro.onclick = () => onToggleMode('macro');
  }
  if (btnDet && onToggleMode) {
    btnDet.onclick = () => onToggleMode('detailed');
  }
}

/**
 * Renderiza o Comparativo Visual: Caixa Real vs Produção Represada
 * @param {HTMLElement|string} container 
 * @param {number} caixaReal 
 * @param {number} producaoRepresada 
 * @param {string} monthLabel 
 */
export function renderComparisonVisual(container, caixaReal = 0, producaoRepresada = 0, monthLabel = '') {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const total = Math.max(caixaReal + producaoRepresada, 1);
  const pctCaixa = (caixaReal / total) * 100;
  const pctRepresada = (producaoRepresada / total) * 100;

  el.innerHTML = `
    <div class="comparison-card">
      <div class="comparison-header">
        <div class="comp-col">
          <span class="comp-badge mint">Caixa Real (No Bolso)</span>
          <strong class="comp-val mint">${formatCurrency(caixaReal)}</strong>
          <span class="comp-sub">Residência + Parcelas D+60/D+90 do mês</span>
        </div>
        <div class="comp-col">
          <span class="comp-badge rose">Produção Represada</span>
          <strong class="comp-val rose">${formatCurrency(producaoRepresada)}</strong>
          <span class="comp-sub">Trabalhado no mês aguardando crédito</span>
        </div>
      </div>

      <!-- Barra Comparativa Dupla Estilizada -->
      <div class="comparison-bar-track">
        <div class="comp-bar-fill mint" style="width: ${pctCaixa}%;" title="Caixa Real: ${pctCaixa.toFixed(0)}%"></div>
        <div class="comp-bar-fill rose" style="width: ${pctRepresada}%;" title="Produção Represada: ${pctRepresada.toFixed(0)}%"></div>
      </div>
      <div class="comparison-legend-row">
        <span>${pctCaixa.toFixed(0)}% Disponível Agora</span>
        <span>${pctRepresada.toFixed(0)}% A Receber em 60/90 Dias</span>
      </div>
    </div>
  `;
}

/**
 * Renderiza o Mini-Calendário Visual do Mês
 * @param {HTMLElement|string} container 
 * @param {string} yearMonthStr (ex: '2026-06')
 * @param {Array<Object>} shifts 
 * @param {Array<Object>} expenses 
 */
export function renderMonthCalendarVisual(container, yearMonthStr, shifts = [], expenses = []) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const parts = yearMonthStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Dom
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Mapeia dias trabalhados (plantão trabalhado neste dia)
  const workedShiftsMap = {};
  // Mapeia parcelas caindo neste dia (D+60 ou D+90)
  const incomingCreditsMap = {};
  // Mapeia despesas neste dia
  const expensesMap = {};

  shifts.forEach(s => {
    if (s.date && s.date.startsWith(yearMonthStr)) {
      const d = parseInt(s.date.split('-')[2], 10);
      workedShiftsMap[d] = (workedShiftsMap[d] || []).concat(s);
    }
    if (s.installment1?.expectedDate && s.installment1.expectedDate.startsWith(yearMonthStr)) {
      const d = parseInt(s.installment1.expectedDate.split('-')[2], 10);
      incomingCreditsMap[d] = (incomingCreditsMap[d] || []).concat({ ...s, instNum: 1, val: s.installment1.value });
    }
    if (s.installment2?.expectedDate && s.installment2.expectedDate.startsWith(yearMonthStr)) {
      const d = parseInt(s.installment2.expectedDate.split('-')[2], 10);
      incomingCreditsMap[d] = (incomingCreditsMap[d] || []).concat({ ...s, instNum: 2, val: s.installment2.value });
    }
  });

  expenses.forEach(e => {
    if (e.date && e.date.startsWith(yearMonthStr)) {
      const d = parseInt(e.date.split('-')[2], 10);
      expensesMap[d] = (expensesMap[d] || []).concat(e);
    }
  });

  const weekHeaders = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  let daysHtml = '';

  // Espaços vazios antes do 1º dia
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysHtml += `<div class="cal-day empty"></div>`;
  }

  // Dias do mês
  for (let d = 1; d <= totalDays; d++) {
    const hasWorked = workedShiftsMap[d] && workedShiftsMap[d].length > 0;
    const hasCredit = incomingCreditsMap[d] && incomingCreditsMap[d].length > 0;
    const hasExpense = expensesMap[d] && expensesMap[d].length > 0;

    let markersHtml = '';
    if (hasWorked) {
      markersHtml += `<span class="marker worked" title="${workedShiftsMap[d].length} plantão(ões) trabalhado(s)"></span>`;
    }
    if (hasCredit) {
      markersHtml += `<span class="marker credit" title="Crédito D+60/D+90 previsto"></span>`;
    }
    if (hasExpense) {
      markersHtml += `<span class="marker expense" title="Despesa(s) registrada(s)"></span>`;
    }

    const isToday = new Date().toISOString().slice(0, 10) === `${yearMonthStr}-${String(d).padStart(2, '0')}`;

    daysHtml += `
      <div class="cal-day ${isToday ? 'today' : ''} ${hasWorked ? 'has-shift' : ''}">
        <span class="day-num">${d}</span>
        <div class="day-markers">
          ${markersHtml}
        </div>
      </div>
    `;
  }

  el.innerHTML = `
    <div class="mini-calendar-wrapper">
      <div class="cal-header">
        <span class="cal-title">${getIconSvg('calendar', { size: 16, color: '#EC407A' })} Mapa Visual do Mês</span>
      </div>
      <div class="cal-grid">
        ${weekHeaders.map(h => `<div class="cal-day-header">${h}</div>`).join('')}
        ${daysHtml}
      </div>
      <div class="cal-legend">
        <span class="cal-leg-item"><span class="marker worked"></span> Plantão Trabalhado</span>
        <span class="cal-leg-item"><span class="marker credit"></span> Depósito D+60 / D+90</span>
        <span class="cal-leg-item"><span class="marker expense"></span> Despesa</span>
      </div>
    </div>
  `;
}

/**
 * Renderiza o Balanço Líquido e Taxa de Poupança/Comprometimento
 * @param {HTMLElement|string} container
 * @param {Object} summary
 * @param {string} monthLabel
 */
export function renderNetBalanceVisual(container, summary, monthLabel = '') {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const income = summary?.totalIncome || 0;
  const expense = summary?.totalExpenses || 0;
  const balance = summary?.balance ?? (income - expense);
  const isSurplus = balance >= 0;

  const expensePct = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : (expense > 0 ? 100 : 0);
  const savePct = income > 0 && isSurplus ? Math.max(0, Math.round((balance / income) * 100)) : 0;

  el.innerHTML = `
    <div class="net-result-card">
      <div class="net-result-header">
        <div>
          <span class="net-result-label">Resultado Líquido de ${monthLabel || 'Mês'}</span>
          <h3 class="net-result-value ${isSurplus ? 'surplus' : 'deficit'}">
            ${formatCurrency(balance)}
          </h3>
        </div>
        <span class="net-result-badge ${isSurplus ? 'surplus' : 'deficit'}">
          ${isSurplus ? '✨ Superávit Positivo' : '⚠️ Déficit de Caixa'}
        </span>
      </div>

      <div class="net-result-progress-box">
        <div class="net-result-bar-labels">
          <span>Gastos: ${expensePct}% da Renda</span>
          <span>Poupança Líquida: ${savePct}%</span>
        </div>
        <div class="net-result-bar-track">
          <div class="net-result-bar-expense" style="width: ${expensePct}%;"></div>
          <div class="net-result-bar-savings" style="width: ${savePct}%;"></div>
        </div>
      </div>

      <div class="net-result-meta-row">
        <span>Total Entradas: <strong>${formatCurrency(income)}</strong></span>
        <span>Total Saídas: <strong>${formatCurrency(expense)}</strong></span>
      </div>
    </div>
  `;
}


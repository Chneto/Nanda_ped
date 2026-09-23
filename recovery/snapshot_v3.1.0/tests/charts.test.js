import test from 'node:test';
import assert from 'node:assert/strict';
import { renderForecastChartSVG, renderDonutChartSVG } from '../js/charts.js';

test('renderForecastChartSVG generates valid SVG markup with 4 months', () => {
  const forecastData = [
    { label: 'Set/26', totalInflow: 16180, shiftInflow: 7680, salaryInflow: 8500 },
    { label: 'Out/26', totalInflow: 13430, shiftInflow: 4930, salaryInflow: 8500 },
    { label: 'Nov/26', totalInflow: 11560, shiftInflow: 3060, salaryInflow: 8500 },
    { label: 'Dez/26', totalInflow: 11730, shiftInflow: 3230, salaryInflow: 8500 }
  ];

  const svg = renderForecastChartSVG(forecastData);
  assert.ok(svg.includes('<svg'), 'Must contain svg opening tag');
  assert.ok(svg.includes('</svg>'), 'Must contain svg closing tag');
  assert.ok(svg.includes('Set/26'), 'Must render month label Set/26');
  assert.ok(svg.includes('Dez/26'), 'Must render month label Dez/26');
  assert.ok(svg.includes('barGradient'), 'Must define barGradient');
});

test('renderDonutChartSVG generates valid donut arcs and legend', () => {
  const categories = [
    { category: 'Consultório/Sublocação', amount: 2400, percentage: 50.0, color: '#EC407A', icon: 'domain' },
    { category: 'CRM/RQE/SBP', amount: 380, percentage: 7.9, color: '#26A69A', icon: 'verified' },
    { category: 'Congresso & Atualização', amount: 850, percentage: 17.7, color: '#AB47BC', icon: 'school' },
    { category: 'Combustível/Plantão', amount: 460, percentage: 9.6, color: '#CE93D8', icon: 'local_gas_station' },
    { category: 'Brinquedos/Materiais Lúdicos', amount: 290, percentage: 6.0, color: '#FF7043', icon: 'toys' },
    { category: 'Outros', amount: 320, percentage: 6.7, color: '#7A7E91', icon: 'receipt_long' }
  ];
  const total = 4800;

  const result = renderDonutChartSVG(categories, total);
  assert.ok(result.svg.includes('<svg'), 'Donut must contain SVG tag');
  assert.ok(result.svg.includes('stroke-dasharray'), 'Donut must use stroke-dasharray');
  assert.ok(result.legend.includes('Consultório/Sublocação'), 'Legend must display categories');
  assert.ok(result.legend.includes('50%'), 'Legend must display calculated percentage');
});

test('renderDonutChartSVG handles empty state gracefully', () => {
  const result = renderDonutChartSVG([], 0);
  assert.ok(result.svg.includes('Sem gastos'), 'Must show gentle empty state');
  assert.ok(result.legend.includes('Nenhuma despesa'), 'Must show empty legend text');
});

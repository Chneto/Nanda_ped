/**
 * Finanças Pediatria v2.0 - Unified Standalone Bundle
 * Self-contained for zero-CORS file:// protocol and offline execution
 */
(function() {
  'use strict';

  // --- ICONS SYSTEM ---
  /**
 * Finanças Pediatria v2.0 - Sistema de Ícones SVG Puros
 * 100% Offline, Zero-CORS, imune a falhas de CDN ou ligaturas de fontes no iOS Safari.
 * Criado por: FChNeto
 */

const SVG_ICONS = {
  stethoscope: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3"/><path d="M9 12.5v3.5a4 4 0 0 0 8 0v-2"/><circle cx="17" cy="12" r="2"/><circle cx="4.5" cy="3" r="1.5"/><circle cx="13.5" cy="3" r="1.5"/></svg>',
  baby: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.5 1.5.5 2 0"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.8.6 5.3 1.7"/><path d="M12 3a2 2 0 0 1 2 2v1"/></svg>',
  payments: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  receipt: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/></svg>',
  trending_up: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  pie_chart: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
  add: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  delete: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  download: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  dark_mode: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  light_mode: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  chevron_left: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  chevron_right: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  arrow_forward: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0"/><path d="M2 9.5h20"/><circle cx="16" cy="14" r="1.5"/></svg>',
  hospital: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 10h6"/><path d="M12 7v6"/></svg>',
  credit_card: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  home: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  flight: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  fitness: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v14"/><path d="M18 5v14"/><path d="M2 9v6"/><path d="M22 9v6"/><path d="M6 12h12"/></svg>',
  study: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>',
  course: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>',
  gift: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
  fuel: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M15 10h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9l-3-3"/><rect x="6" y="6" width="6" height="5"/></svg>',
  qualification: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
  cosmetics: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-4-7-4 7"/><path d="M15 4v16"/><path d="M8 14v6"/><path d="M5 18h6"/></svg>',
  water: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  snack: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
  donation: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  meal: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20"/><path d="M18 8h-4a4 4 0 0 1-4-4V2"/><path d="M6 2v20"/><path d="M6 7h4"/></svg>',
  beauty: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
  car: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
  meds: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>',
  outing: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8Z"/></svg>',
  delivery: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="2.5"/><circle cx="5.5" cy="17.5" r="2.5"/><path d="M12 17.5V14H6.5a2.5 2.5 0 0 1-2.5-2.5V8a1 1 0 0 1 1-1h7v10.5"/><path d="M12 8h4.5l3.5 4v5.5h-1.5"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M3 5h4"/></svg>',
  tag: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',

  // Aliases de conveniência
  moon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  save_iphone: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M9 10l3 3 3-3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
  mint_income: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2m0 8v2"/></svg>',
  coral_expense: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8l4 4-4 4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  pie: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>'
};

/**
 * Retorna o markup SVG nativo com classes e cores
 */
function getIconSvg(name, options = {}) {
  const size = typeof options === 'number' ? options : (options?.size || 20);
  const color = options?.color || 'currentColor';
  const extraClass = options?.className || options?.extraClass || '';

  const rawSvg = SVG_ICONS[name] || SVG_ICONS.tag;
  return rawSvg
    .replace(/width="[^"]*"/, `width="${size}"`)
    .replace(/height="[^"]*"/, `height="${size}"`)
    .replace('<svg ', `<svg class="${extraClass}" style="${color !== 'currentColor' ? `color: ${color}; stroke: ${color};` : ''}" `);
}

/**
 * Legado / compatibilidade com getIcon
 */
function getIcon(name, extraClass = "", size = 20) {
  return getIconSvg(name, { extraClass, size });
}


  // Fallback global de ícones para o escopo do window
  if (typeof window !== 'undefined') {
    window.getIconSvg = getIconSvg;
    window.getIcon = getIcon;
  }

  // --- STORE ENGINE ---
  /**
 * Finanças Pediatria v2.0 - Core Storage & Financial Engine
 * Arquitetura de Persistência Tripla para iOS (IndexedDB + LocalStorage + Storage Persistence API)
 * Regras Pediátricas: Salário Residência + Plantões Sala de Parto (75% D+60 / 25% D+90)
 * Criado por: FChNeto (APP_CREATOR)
 */

const APP_CREATOR = 'FChNeto';
const APP_VERSION = '2.0.0';
const STORAGE_KEY = 'financas_pediatria_v2';
const DB_NAME = 'v2_pediatric_db';
const DB_STORE = 'app_state';

const DEFAULT_CATEGORIES = [
  { id: 'cat_passagens', name: 'Passagens', icon: 'flight', color: '#7E57C2' },
  { id: 'cat_mercantil', name: 'Mercantil', icon: 'cart', color: '#26A69A' },
  { id: 'cat_academia', name: 'Academia', icon: 'fitness', color: '#EC407A' },
  { id: 'cat_estudo', name: 'Estudo', icon: 'study', color: '#42A5F5' },
  { id: 'cat_cursos', name: 'Cursos', icon: 'course', color: '#5C6BC0' },
  { id: 'cat_presentes', name: 'Presentes', icon: 'gift', color: '#AB47BC' },
  { id: 'cat_aluguel', name: 'Aluguel', icon: 'home', color: '#EF5350' },
  { id: 'cat_energia', name: 'Energia', icon: 'bolt', color: '#FFA726' },
  { id: 'cat_internet', name: 'Internet', icon: 'wifi', color: '#29B6F6' },
  { id: 'cat_combustivel', name: 'Combustível', icon: 'fuel', color: '#FF7043' },
  { id: 'cat_qualificacao', name: 'Qualificação/Congresso/Pós', icon: 'qualification', color: '#8E24AA' },
  { id: 'cat_cosmeticos', name: 'Cosméticos', icon: 'cosmetics', color: '#F06292' },
  { id: 'cat_agua', name: 'Água', icon: 'water', color: '#26C6DA' },
  { id: 'cat_lanches', name: 'Lanches', icon: 'snack', color: '#FFCA28' },
  { id: 'cat_doacao', name: 'Doação', icon: 'donation', color: '#E91E63' },
  { id: 'cat_refeicao', name: 'Refeição', icon: 'meal', color: '#FF8A65' },
  { id: 'cat_beleza_salao', name: 'Beleza/Salão', icon: 'beauty', color: '#D81B60' },
  { id: 'cat_uber', name: 'Uber', icon: 'car', color: '#78909C' },
  { id: 'cat_remedios', name: 'Remédios', icon: 'meds', color: '#66BB6A' },
  { id: 'cat_compras_parceladas', name: 'Compras Parceladas', icon: 'credit_card', color: '#8D6E63' },
  { id: 'cat_saidas', name: 'Saídas', icon: 'outing', color: '#9C27B0' },
  { id: 'cat_delivery', name: 'Delivery', icon: 'delivery', color: '#FF5722' },
  { id: 'cat_produtos_beleza', name: 'Produtos de beleza', icon: 'sparkles', color: '#F48FB1' }
];

const DEFAULT_HOSPITALS = [
  'Maternidade Araken',
  'Maternidade Leide Morais',
  'MEJEC',
  'Hospital da Criança',
  'Hospital Mater Dei',
  'Hospital Promater'
];

/**
 * Utilitário de manipulação de datas no fuso horário local
 */
function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adiciona meses preservando limites de mês (ex: 31 de agosto + 2 meses = 31 de outubro)
 */
function addMonthsToDateString(dateStr, monthsToAdd) {
  const parts = dateStr.split('-');
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  month += monthsToAdd;
  year += Math.floor(month / 12);
  month = ((month % 12) + 12) % 12;

  const maxDays = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, maxDays);

  const mm = String(month + 1).padStart(2, '0');
  const dd = String(safeDay).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function formatCurrency(val) {
  const num = typeof val === 'number' && !isNaN(val) ? val : 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateBR(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '--/--/----';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatMonthYear(monthStr) {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const year = parts[0];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mIndex = parseInt(parts[1], 10) - 1;
  return `${monthNames[mIndex] || parts[1]} de ${year}`;
}

/**
 * IndexedDB Driver nativo para iOS / Safari PWA
 */
const IndexedDBManager = {
  dbPromise: null,

  getDB() {
    if (this.dbPromise) return this.dbPromise;
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB não suportado'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return this.dbPromise;
  },

  async set(key, value) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      return false;
    }
  },

  async get(key) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      return null;
    }
  }
};

/**
 * Estado Inicial Padrão
 */
function getInitialData() {
  const today = getLocalDateString();
  const currentMonth = today.slice(0, 7);

  return {
    version: APP_VERSION,
    creator: APP_CREATOR,
    doctorName: 'Dra. Fernanda Ch.',
    residencySalary: {
      value: 4106.09,
      dayOfMonth: 5,
      description: 'Bolsa Residência Médica (Pediatria)',
      active: true
    },
    shifts: [],
    expenses: [],
    categories: [...DEFAULT_CATEGORIES],
    hospitals: [...DEFAULT_HOSPITALS],
    preferences: {
      regime: 'caixa',
      theme: 'light',
      activeMonth: currentMonth
    },
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Store Principal Reativa de Finanças Pediatria
 */
class PediatricStore {
  constructor() {
    this.data = this.loadSync();
    this.listeners = new Set();
    this.initAsyncPersistence();
  }

  /**
   * Carga síncrona inicial do LocalStorage para render imediato (sem lag)
   */
  loadSync() {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return this.sanitizeData(parsed);
          }
        }
      } catch (e) {
        console.warn('Erro ao ler localStorage:', e);
      }
    }
    return getInitialData();
  }

  /**
   * Sanitiza os dados garantindo todas as propriedades necessárias
   */
  sanitizeData(loaded) {
    const initial = getInitialData();
    return {
      version: APP_VERSION,
      creator: APP_CREATOR,
      doctorName: loaded.doctorName || initial.doctorName,
      residencySalary: {
        ...initial.residencySalary,
        ...(loaded.residencySalary || {})
      },
      shifts: Array.isArray(loaded.shifts) ? loaded.shifts : [],
      expenses: Array.isArray(loaded.expenses) ? loaded.expenses : [],
      categories: Array.isArray(loaded.categories) && loaded.categories.length > 0 ? loaded.categories : initial.categories,
      hospitals: Array.isArray(loaded.hospitals) && loaded.hospitals.length > 0 ? loaded.hospitals : initial.hospitals,
      preferences: {
        ...initial.preferences,
        ...(loaded.preferences || {})
      },
      lastUpdated: loaded.lastUpdated || new Date().toISOString()
    };
  }

  /**
   * Hidratação assíncrona do IndexedDB e solicitação de persistência do iOS
   */
  async initAsyncPersistence() {
    if (typeof window === 'undefined') return;

    // 1. Solicita proteção de persistência permanente ao iOS WebKit
    if (navigator.storage && navigator.storage.persist) {
      try {
        await navigator.storage.persist();
      } catch (err) {
        // Ignora silenciosamente
      }
    }

    // 2. Consulta IndexedDB para restauração contra purgas do Safari
    try {
      const dbData = await IndexedDBManager.get('current_state');
      if (dbData && typeof dbData === 'object') {
        const localShiftsCount = (this.data.shifts || []).length;
        const localExpensesCount = (this.data.expenses || []).length;
        const dbShiftsCount = (dbData.shifts || []).length;
        const dbExpensesCount = (dbData.expenses || []).length;

        // Se o IndexedDB tiver dados e o localStorage estiver zerado/incompleto, restaura!
        if ((dbShiftsCount > localShiftsCount) || (dbExpensesCount > localExpensesCount)) {
          this.data = this.sanitizeData(dbData);
          this.saveSync();
          this.notify();
        }
      } else {
        // Inicializa o IndexedDB com os dados atuais
        IndexedDBManager.set('current_state', this.data).catch(() => {});
      }
    } catch (err) {
      // Falha do IndexedDB tratada com fallback do localStorage
    }
  }

  /**
   * Salva nos 2 níveis (LocalStorage síncrono + IndexedDB assíncrono)
   */
  save() {
    this.data.lastUpdated = new Date().toISOString();
    this.saveSync();
    IndexedDBManager.set('current_state', this.data).catch(() => {});
    this.notify();
  }

  saveSync() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (err) {
        console.error('Falha ao salvar no localStorage:', err);
      }
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.data);
      } catch (err) {
        console.error('Erro em listener da store:', err);
      }
    }
  }

  // ---------------------------------------------------------------
  // GESTÃO DE GANHOS (RESIDÊNCIA & PLANTÕES EM SALA DE PARTO)
  // ---------------------------------------------------------------

  updateResidencySalary({ value, dayOfMonth, description, active }) {
    if (value !== undefined) this.data.residencySalary.value = parseFloat(value) || 0;
    if (dayOfMonth !== undefined) this.data.residencySalary.dayOfMonth = parseInt(dayOfMonth, 10) || 5;
    if (description !== undefined) this.data.residencySalary.description = description;
    if (active !== undefined) this.data.residencySalary.active = Boolean(active);
    this.save();
  }

  /**
   * Cadastra ou atualiza um plantão em Sala de Parto
   * Aplica rigorosamente a regra médica: 75% em 2 meses (D+60) e 25% no 3º mês (D+90)
   */
  saveShift({
    id = null,
    hospital,
    date,
    shiftType = '12h Noturno',
    grossValue = 0,
    netValue = 0,
    notes = ''
  }) {
    const gross = parseFloat(grossValue) || 0;
    const net = parseFloat(netValue) || gross;
    const shiftDate = date || getLocalDateString();

    const expectedDate75 = addMonthsToDateString(shiftDate, 2); // D+60 (2 meses)
    const expectedDate25 = addMonthsToDateString(shiftDate, 3); // D+90 (3 meses)

    const val75 = Math.round((net * 0.75) * 100) / 100;
    const val25 = Math.round((net - val75) * 100) / 100;

    const existingIndex = id ? this.data.shifts.findIndex(s => s.id === id) : -1;
    const existing = existingIndex >= 0 ? this.data.shifts[existingIndex] : null;

    const shiftRecord = {
      id: id || `sh_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      hospital: hospital.trim(),
      date: shiftDate,
      shiftType,
      grossValue: gross,
      netValue: net,
      notes: notes.trim(),
      installment1: {
        percentage: 75,
        value: val75,
        expectedDate: expectedDate75,
        status: existing?.installment1?.status || 'pending',
        paidDate: existing?.installment1?.paidDate || null
      },
      installment2: {
        percentage: 25,
        value: val25,
        expectedDate: expectedDate25,
        status: existing?.installment2?.status || 'pending',
        paidDate: existing?.installment2?.paidDate || null
      },
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.data.shifts[existingIndex] = shiftRecord;
    } else {
      this.data.shifts.unshift(shiftRecord);
    }

    if (hospital.trim() && !this.data.hospitals.includes(hospital.trim())) {
      this.data.hospitals.push(hospital.trim());
    }

    this.save();
    return shiftRecord;
  }

  deleteShift(id) {
    this.data.shifts = this.data.shifts.filter(s => s.id !== id);
    this.save();
  }

  toggleShiftInstallment(shiftId, installmentNum) {
    const shift = this.data.shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const inst = installmentNum === 1 ? shift.installment1 : shift.installment2;
    if (!inst) return;

    if (inst.status === 'received') {
      inst.status = 'pending';
      inst.paidDate = null;
    } else {
      inst.status = 'received';
      inst.paidDate = getLocalDateString();
    }
    this.save();
  }

  // ---------------------------------------------------------------
  // GESTÃO DE DESPESAS (COM SUPORTE A COMPRAS PARCELADAS)
  // ---------------------------------------------------------------

  /**
   * Adiciona ou edita uma despesa.
   * Se totalInstallments > 1, gera e distribui automaticamente as parcelas futuras!
   */
  saveExpense({
    id = null,
    category,
    description,
    value,
    date,
    isInstallment = false,
    totalInstallments = 1
  }) {
    const numInstallments = isInstallment ? Math.max(1, parseInt(totalInstallments, 10) || 1) : 1;
    const totalVal = parseFloat(value) || 0;
    const baseDate = date || getLocalDateString();
    const catName = category.trim();
    const desc = description.trim() || catName;

    // Se é uma edição de despesa simples existente
    if (id) {
      const idx = this.data.expenses.findIndex(e => e.id === id);
      if (idx >= 0) {
        this.data.expenses[idx] = {
          ...this.data.expenses[idx],
          category: catName,
          description: desc,
          value: totalVal,
          date: baseDate
        };
        this.save();
        return;
      }
    }

    // Se for uma nova compra parcelada (> 1 parcela)
    if (numInstallments > 1) {
      const parentId = `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const installmentValue = Math.round((totalVal / numInstallments) * 100) / 100;
      let diff = Math.round((totalVal - (installmentValue * numInstallments)) * 100) / 100;

      for (let i = 1; i <= numInstallments; i++) {
        const instDate = addMonthsToDateString(baseDate, i - 1);
        const thisValue = i === 1 ? installmentValue + diff : installmentValue;

        this.data.expenses.push({
          id: `exp_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`,
          parentExpenseId: parentId,
          category: catName,
          description: `${desc} (${i}/${numInstallments})`,
          value: thisValue,
          date: instDate,
          isInstallment: true,
          installmentNumber: i,
          totalInstallments: numInstallments,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Despesa à vista / normal
      this.data.expenses.unshift({
        id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        parentExpenseId: null,
        category: catName,
        description: desc,
        value: totalVal,
        date: baseDate,
        isInstallment: false,
        installmentNumber: 1,
        totalInstallments: 1,
        createdAt: new Date().toISOString()
      });
    }

    this.save();
  }

  deleteExpense(id) {
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
  }

  addCustomCategory({ name, icon = 'tag', color = '#b80f55' }) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = this.data.categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;

    this.data.categories.push({
      id: `cat_${Date.now()}`,
      name: trimmed,
      icon,
      color
    });
    this.save();
  }

  // ---------------------------------------------------------------
  // RELATÓRIOS: REGIME DE CAIXA VS REGIME DE COMPETÊNCIA
  // ---------------------------------------------------------------

  /**
   * Calcula o resumo financeiro consolidado de um mês específico
   * @param {string} targetMonth YYYY-MM
   * @param {string} regime 'caixa' ou 'competencia'
   */
  getMonthSummary(targetMonth, regime = 'caixa') {
    // 1. Salário da Residência (entra em todo mês no Regime de Caixa e Competência se ativo)
    const residencyIncome = this.data.residencySalary.active ? (this.data.residencySalary.value || 0) : 0;

    // 2. Plantões
    let shiftInflowRealized = 0;
    let shiftInflowPending = 0;
    let shiftsInScope = [];

    if (regime === 'caixa') {
      // Regime de Caixa: busca parcelas com expectedDate caindo no targetMonth
      this.data.shifts.forEach(shift => {
        let matched = false;
        // Parcela 1 (75%)
        if (shift.installment1 && shift.installment1.expectedDate.startsWith(targetMonth)) {
          matched = true;
          if (shift.installment1.status === 'received') {
            shiftInflowRealized += shift.installment1.value;
          } else {
            shiftInflowPending += shift.installment1.value;
          }
        }
        // Parcela 2 (25%)
        if (shift.installment2 && shift.installment2.expectedDate.startsWith(targetMonth)) {
          matched = true;
          if (shift.installment2.status === 'received') {
            shiftInflowRealized += shift.installment2.value;
          } else {
            shiftInflowPending += shift.installment2.value;
          }
        }
        if (matched) shiftsInScope.push(shift);
      });
    } else {
      // Regime de Competência: busca plantões trabalhados no targetMonth
      this.data.shifts.forEach(shift => {
        if (shift.date.startsWith(targetMonth)) {
          shiftsInScope.push(shift);
          shiftInflowRealized += shift.netValue;
        }
      });
    }

    const totalIncome = residencyIncome + shiftInflowRealized + shiftInflowPending;

    // 3. Despesas do Mês
    const monthExpenses = this.data.expenses.filter(e => e.date.startsWith(targetMonth));
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.value || 0), 0);

    // 4. Saldo Líquido
    const balance = totalIncome - totalExpenses;

    // 5. Agrupamento por Categoria para gráfico de rosca
    const categoryTotals = {};
    monthExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.value;
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([catName, val]) => {
        const catInfo = this.data.categories.find(c => c.name === catName) || { icon: 'tag', color: '#7e4a8a' };
        return {
          category: catName,
          value: val,
          percentage: totalExpenses > 0 ? (val / totalExpenses) * 100 : 0,
          icon: catInfo.icon,
          color: catInfo.color
        };
      })
      .sort((a, b) => b.value - a.value);

    return {
      targetMonth,
      regime,
      residencyIncome,
      shiftInflowRealized,
      shiftInflowPending,
      totalIncome,
      totalExpenses,
      balance,
      shiftsCount: shiftsInScope.length,
      expensesCount: monthExpenses.length,
      categoryBreakdown
    };
  }

  /**
   * Previsão de Fluxo de Caixa para os próximos 6 meses (Regime de Caixa)
   */
  getForecast6Months(startMonth) {
    const forecast = [];
    for (let i = 0; i < 6; i++) {
      const parts = startMonth.split('-');
      let y = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10) - 1 + i;
      y += Math.floor(m / 12);
      m = ((m % 12) + 12) % 12;
      const monthStr = `${y}-${String(m + 1).padStart(2, '0')}`;

      const summary = this.getMonthSummary(monthStr, 'caixa');
      forecast.push({
        month: monthStr,
        label: formatMonthYear(monthStr).split(' de ')[0], // ex: "Novembro"
        income: summary.totalIncome,
        expenses: summary.totalExpenses,
        balance: summary.balance
      });
    }
    return forecast;
  }

  // ---------------------------------------------------------------
  // BACKUP, EXPORTAÇÃO E RESTAURAÇÃO PARA O IPHONE
  // ---------------------------------------------------------------

  /**
   * Exporta arquivo JSON de backup e aciona o compartilhamento/download nativo do iOS
   */
  async exportBackupToFile() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const dateTag = getLocalDateString();
    const fileName = `financas_pediatria_backup_${dateTag}.json`;

    // 1. Tenta Web Share API nativa do iOS (salvar direto no app "Arquivos" / iCloud)
    if (typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const file = new File([jsonStr], fileName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Backup Finanças Pediatria',
            text: 'Cópia de segurança dos plantões e despesas',
            files: [file]
          });
          return { success: true, method: 'share' };
        }
      } catch (err) {
        // Fallback para download clássico
      }
    }

    // 2. Fallback de download direto
    if (typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, method: 'download' };
    }

    return { success: false };
  }

  /**
   * Restaura o estado a partir de um arquivo JSON
   */
  importBackupFromFile(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Formato JSON inválido');
      }
      this.data = this.sanitizeData(parsed);
      this.save();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}


  // --- CHARTS ENGINE ---
  /**
 * Finanças Pediatria v2.0 - SVG Charts Engine
 * Renderização leve, responsiva e pura em SVG (sem dependências externas)
 * Criado por: FChNeto
 */




/**
 * Renderiza o gráfico de previsão de 6 meses (Fluxo de Caixa)
 * @param {HTMLElement|string} container 
 * @param {Array<{month: string, label: string, income: number, expenses: number, balance: number}>} forecastData 
 */
function renderForecastChart(container, forecastData = []) {
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
function renderDonutExpenses(container, breakdown = [], totalExpenses = 0) {
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


  // --- APPLICATION LOGIC ---
  /**
 * Finanças Pediatria v2.0 - Application Controller (SPA)
 * Interface Mobile-First limpa, intuitiva e sem poluição visual
 * Criado por: FChNeto
 */





class PediatricApp {
  constructor() {
    this.store = new PediatricStore();
    this.currentTab = 'home'; // 'home' | 'income' | 'expenses'
    this.activeModalTab = 'shift'; // 'shift' | 'expense' | 'salary'

    this.initDOM();
    this.bindEvents();
    this.applyTheme(this.store.data.preferences.theme || 'light');
    this.render();

    // Inscrição para re-render reativo em qualquer alteração
    this.store.subscribe(() => this.render());

    // Proteção de ciclo de vida do iOS WebKit
    this.bindLifecycleEvents();
  }

  initDOM() {
    this.appEl = document.getElementById('app-container');
    if (!this.appEl) {
      console.error('Container #app-container não encontrado');
    }
  }

  bindLifecycleEvents() {
    // Salva imediatamente quando o usuário minimiza ou sai do app no iPhone
    const persistHandler = () => {
      this.store.save();
    };
    window.addEventListener('pagehide', persistHandler);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        persistHandler();
      }
    });
    window.addEventListener('beforeunload', persistHandler);
  }

  bindEvents() {
    // Delegação de cliques para botões principais
    document.addEventListener('click', (e) => {
      // 1. Navegação de Abas
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        this.switchTab(tab);
        return;
      }

      // 2. Botão Flutuante (+)
      const fabBtn = e.target.closest('#fab-add-btn');
      if (fabBtn) {
        this.openModal();
        return;
      }

      // 3. Fechar Modal (clique no overlay ou botão fechar)
      const closeOverlay = e.target.closest('.modal-overlay');
      if (closeOverlay && e.target === closeOverlay) {
        this.closeModal();
        return;
      }

      // 4. Abas do Modal
      const modalTabBtn = e.target.closest('[data-modal-tab]');
      if (modalTabBtn) {
        const mTab = modalTabBtn.getAttribute('data-modal-tab');
        this.switchModalTab(mTab);
        return;
      }

      // 5. Seletor de Regime (Caixa vs Competência)
      const regimeBtn = e.target.closest('[data-regime]');
      if (regimeBtn) {
        const reg = regimeBtn.getAttribute('data-regime');
        this.store.data.preferences.regime = reg;
        this.store.save();
        return;
      }

      // 6. Navegação de Mês
      const prevMonthBtn = e.target.closest('#btn-prev-month');
      if (prevMonthBtn) {
        this.navigateMonth(-1);
        return;
      }
      const nextMonthBtn = e.target.closest('#btn-next-month');
      if (nextMonthBtn) {
        this.navigateMonth(1);
        return;
      }

      // 7. Toggle Tema Escuro/Claro
      const themeBtn = e.target.closest('#btn-theme-toggle');
      if (themeBtn) {
        const nextTheme = this.store.data.preferences.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(nextTheme);
        this.store.data.preferences.theme = nextTheme;
        this.store.save();
        return;
      }

      // 8. Botão Backup "Salvar no Meu iPhone"
      const backupBtn = e.target.closest('#btn-backup-iphone');
      if (backupBtn) {
        this.handleExportBackup();
        return;
      }

      // 9. Botão Restaurar Backup
      const restoreBtn = e.target.closest('#btn-restore-backup');
      if (restoreBtn) {
        const fileInput = document.getElementById('backup-file-input');
        if (fileInput) fileInput.click();
        return;
      }

      // 10. Toggle de Parcela de Plantão (Recebido / Pendente)
      const toggleInstBtn = e.target.closest('[data-toggle-installment]');
      if (toggleInstBtn) {
        const shiftId = toggleInstBtn.getAttribute('data-shift-id');
        const instNum = parseInt(toggleInstBtn.getAttribute('data-inst-num'), 10);
        this.store.toggleShiftInstallment(shiftId, instNum);
        this.showToast('Status do plantão atualizado! ✨');
        return;
      }

      // 11. Excluir Plantão
      const delShiftBtn = e.target.closest('[data-delete-shift]');
      if (delShiftBtn) {
        const shiftId = delShiftBtn.getAttribute('data-delete-shift');
        if (confirm('Deseja realmente excluir este plantão?')) {
          this.store.deleteShift(shiftId);
          this.showToast('Plantão removido.');
        }
        return;
      }

      // 12. Excluir Despesa
      const delExpBtn = e.target.closest('[data-delete-expense]');
      if (delExpBtn) {
        const expId = delExpBtn.getAttribute('data-delete-expense');
        if (confirm('Deseja excluir este lançamento de despesa?')) {
          this.store.deleteExpense(expId);
          this.showToast('Despesa removida.');
        }
        return;
      }
    });

    // Listener para o input de arquivo de restauração
    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'backup-file-input') {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const res = this.store.importBackupFromFile(event.target.result);
            if (res.success) {
              this.showToast('Dados restaurados com sucesso! 🌸');
            } else {
              alert('Erro ao restaurar arquivo: ' + res.error);
            }
          };
          reader.readAsText(file);
        }
        e.target.value = ''; // Limpa o input
      }
    });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateMonth(delta) {
    const cur = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const parts = cur.split('-');
    let y = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10) - 1 + delta;
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    const newMonth = `${y}-${String(m + 1).padStart(2, '0')}`;
    this.store.data.preferences.activeMonth = newMonth;
    this.store.save();
  }

  openModal(tab = 'shift') {
    this.activeModalTab = tab;
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.add('open');
      this.renderModalContent();
    }
  }

  closeModal() {
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.remove('open');
    }
  }

  switchModalTab(tab) {
    this.activeModalTab = tab;
    this.renderModalContent();
  }

  showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span>🌸</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  async handleExportBackup() {
    const res = await this.store.exportBackupToFile();
    if (res.success) {
      this.showToast('Cópia de segurança gerada com sucesso! 📱');
    }
  }

  // -------------------------------------------------------------
  // RENDERIZAÇÃO PRINCIPAL
  // -------------------------------------------------------------
  render() {
    if (!this.appEl) return;

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const currentRegime = this.store.data.preferences.regime || 'caixa';
    const summary = this.store.getMonthSummary(currentMonth, currentRegime);

    let contentHtml = '';

    if (this.currentTab === 'home') {
      contentHtml = this.renderHomeTab(summary, currentMonth, currentRegime);
    } else if (this.currentTab === 'income') {
      contentHtml = this.renderIncomeTab(summary, currentMonth);
    } else if (this.currentTab === 'expenses') {
      contentHtml = this.renderExpensesTab(summary, currentMonth);
    }

    this.appEl.innerHTML = `
      <!-- Cabeçalho Minimalista -->
      <header class="app-header">
        <div class="doctor-greeting">
          <div class="avatar-badge">
            ${getIconSvg('stethoscope', { size: 24, color: '#D81B60' })}
          </div>
          <div class="greeting-text">
            <h1>${this.store.data.doctorName}</h1>
            <p>Controle Financeiro Pediátrico</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn" id="btn-backup-iphone" title="Salvar no Meu iPhone">
            ${getIconSvg('save_iphone', { size: 20, color: 'currentColor' })}
          </button>
          <button class="icon-btn" id="btn-theme-toggle" title="Alternar Tema">
            ${getIconSvg('moon', { size: 20, color: 'currentColor' })}
          </button>
          <button class="icon-btn" id="btn-restore-backup" title="Restaurar Backup">
            ${getIconSvg('refresh', { size: 20, color: 'currentColor' })}
          </button>
          <input type="file" id="backup-file-input" accept=".json" style="display: none;" />
        </div>
      </header>

      <!-- Barra de Navegação de Mês -->
      <div class="month-selector-bar">
        <button class="nav-month-btn" id="btn-prev-month" title="Mês Anterior">
          ${getIconSvg('chevron_left', { size: 20, color: 'currentColor' })}
        </button>
        <div class="current-month-label">
          ${getIconSvg('calendar', { size: 18, color: '#AB47BC' })}
          <span>${formatMonthYear(currentMonth)}</span>
        </div>
        <button class="nav-month-btn" id="btn-next-month" title="Próximo Mês">
          ${getIconSvg('chevron_right', { size: 20, color: 'currentColor' })}
        </button>
      </div>

      <!-- Toggle Regime Caixa vs Competência -->
      <div class="regime-toggle-pill">
        <button class="regime-btn ${currentRegime === 'caixa' ? 'active' : ''}" data-regime="caixa">
          Regime de Caixa (Depósito D+60/D+90)
        </button>
        <button class="regime-btn ${currentRegime === 'competencia' ? 'active' : ''}" data-regime="competencia">
          Regime de Competência (Produção)
        </button>
      </div>

      <!-- Conteúdo da Aba Atual -->
      <main id="main-content">
        ${contentHtml}
      </main>

      <!-- Barra de Navegação Inferior -->
      <nav class="bottom-nav">
        <button class="nav-tab-btn ${this.currentTab === 'home' ? 'active' : ''}" data-tab="home">
          ${getIconSvg('home', { size: 22 })}
          <span>Início</span>
        </button>

        <button class="floating-add-btn" id="fab-add-btn" title="Novo Lançamento">
          ${getIconSvg('add', { size: 28, color: '#FFFFFF' })}
        </button>

        <button class="nav-tab-btn ${this.currentTab === 'income' ? 'active' : ''}" data-tab="income">
          ${getIconSvg('stethoscope', { size: 22 })}
          <span>Ganhos</span>
        </button>

        <button class="nav-tab-btn ${this.currentTab === 'expenses' ? 'active' : ''}" data-tab="expenses">
          ${getIconSvg('cart', { size: 22 })}
          <span>Despesas</span>
        </button>
      </nav>

      <!-- Modal Bottom Sheet -->
      <div class="modal-overlay" id="action-modal">
        <div class="modal-sheet">
          <div class="modal-drag-indicator"></div>
          <div class="modal-header-tabs">
            <button class="modal-tab-btn ${this.activeModalTab === 'shift' ? 'active' : ''}" data-modal-tab="shift">
              Plantão Médico
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'expense' ? 'active' : ''}" data-modal-tab="expense">
              Despesa
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'salary' ? 'active' : ''}" data-modal-tab="salary">
              Bolsa Residência
            </button>
          </div>
          <div id="modal-body-content"></div>
        </div>
      </div>
    `;

    // Renderiza gráficos após a injeção do HTML
    if (this.currentTab === 'home') {
      const forecast = this.store.getForecast6Months(currentMonth);
      renderForecastChart('forecast-chart-container', forecast);
      renderDonutExpenses('donut-chart-container', summary.categoryBreakdown, summary.totalExpenses);
    }
  }

  // -------------------------------------------------------------
  // ABA: INÍCIO (DASHBOARD)
  // -------------------------------------------------------------
  renderHomeTab(summary, currentMonth, currentRegime) {
    const isCaixa = currentRegime === 'caixa';

    return `
      <!-- Hero Card de Saldo -->
      <section class="hero-balance-card">
        <div class="balance-title">
          <span>${isCaixa ? 'Saldo Projetado de Caixa' : 'Produção Líquida do Mês'}</span>
          <span>${formatMonthYear(currentMonth).split(' de ')[0]}</span>
        </div>
        <div class="balance-value">${formatCurrency(summary.balance)}</div>
        <div class="balance-stats-row">
          <div class="stat-item">
            <div class="stat-icon">
              ${getIconSvg('mint_income', { size: 20, color: '#FFFFFF' })}
            </div>
            <div class="stat-info">
              <span>Total Entradas</span>
              <strong>${formatCurrency(summary.totalIncome)}</strong>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              ${getIconSvg('coral_expense', { size: 20, color: '#FFFFFF' })}
            </div>
            <div class="stat-info">
              <span>Total Despesas</span>
              <strong>${formatCurrency(summary.totalExpenses)}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Banner de Dica de Persistência no iPhone -->
      <div class="card-section" style="padding: 12px 16px; margin-bottom: 14px;">
        <div class="ios-backup-banner" style="margin-bottom: 0;">
          <div class="banner-text">
            <h4>Proteção Total no iPhone 📱</h4>
            <p>Seus dados estão protegidos no aparelho. Faça backup para o iCloud a qualquer momento.</p>
          </div>
          <button class="banner-action-btn" id="btn-backup-iphone">Salvar</button>
        </div>
      </div>

      <!-- Gráfico de Previsão de 6 Meses -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('chart', { size: 20, color: '#AB47BC' })}
            Previsão dos Próximos 6 Meses
          </h2>
        </div>
        <div id="forecast-chart-container"></div>
      </section>

      <!-- Gráfico de Rosca de Despesas por Categoria -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('pie', { size: 20, color: '#EC407A' })}
            Distribuição de Gastos
          </h2>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
            ${summary.expensesCount} lançamentos
          </span>
        </div>
        <div id="donut-chart-container"></div>
      </section>
    `;
  }

  // -------------------------------------------------------------
  // ABA: GANHOS (RESIDÊNCIA & PLANTÕES EM SALA DE PARTO)
  // -------------------------------------------------------------
  renderIncomeTab(summary, currentMonth) {
    const salary = this.store.data.residencySalary;
    const isCaixa = this.store.data.preferences.regime === 'caixa';

    // Lista de plantões relevantes para o mês
    let relevantShifts = [];
    if (isCaixa) {
      // Plantões que têm parcela caindo neste mês
      relevantShifts = this.store.data.shifts.filter(s =>
        (s.installment1 && s.installment1.expectedDate.startsWith(currentMonth)) ||
        (s.installment2 && s.installment2.expectedDate.startsWith(currentMonth))
      );
    } else {
      // Plantões trabalhados neste mês
      relevantShifts = this.store.data.shifts.filter(s => s.date.startsWith(currentMonth));
    }

    let shiftsHtml = '';
    if (relevantShifts.length === 0) {
      shiftsHtml = `
        <div class="empty-donut-state">
          <div class="empty-icon-circle">
            ${getIconSvg('stethoscope', { size: 28, color: '#AB47BC' })}
          </div>
          <p class="empty-text">Nenhum plantão para este mês</p>
          <span class="empty-sub">Toque em "+" para cadastrar seus plantões de Sala de Parto</span>
        </div>
      `;
    } else {
      shiftsHtml = relevantShifts.map(s => {
        const isInst1ThisMonth = s.installment1?.expectedDate.startsWith(currentMonth);
        const isInst2ThisMonth = s.installment2?.expectedDate.startsWith(currentMonth);

        return `
          <div class="shift-item-card">
            <div class="shift-card-top">
              <div>
                <h3 class="shift-hospital">${s.hospital}</h3>
                <span class="shift-date-badge">Trabalhado em: ${formatDateBR(s.date)}</span>
              </div>
              <button class="expense-del-btn" data-delete-shift="${s.id}" title="Excluir Plantão">
                ${getIconSvg('delete', { size: 18, color: 'currentColor' })}
              </button>
            </div>

            <div class="shift-values-line">
              <span class="shift-type-pill">${s.shiftType}</span>
              <span class="shift-net-val">${formatCurrency(s.netValue)}</span>
            </div>

            <!-- As 2 Parcelas Pediátricas: D+60 e D+90 -->
            <div class="installments-timeline">
              <div class="installment-box" style="${isInst1ThisMonth ? 'border-left: 2px solid var(--mint-income); padding-left: 4px;' : ''}">
                <div class="inst-header">
                  <span>75% (D+60)</span>
                  <span>${formatDateBR(s.installment1?.expectedDate)}</span>
                </div>
                <div class="inst-val">${formatCurrency(s.installment1?.value)}</div>
                <button
                  class="inst-status-tag ${s.installment1?.status === 'received' ? 'received' : 'pending'}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="1"
                >
                  ${s.installment1?.status === 'received' ? '✓ Recebido' : '⏳ Pendente'}
                </button>
              </div>

              <div class="installment-box" style="${isInst2ThisMonth ? 'border-left: 2px solid var(--mint-income); padding-left: 4px;' : ''}">
                <div class="inst-header">
                  <span>25% (D+90)</span>
                  <span>${formatDateBR(s.installment2?.expectedDate)}</span>
                </div>
                <div class="inst-val">${formatCurrency(s.installment2?.value)}</div>
                <button
                  class="inst-status-tag ${s.installment2?.status === 'received' ? 'received' : 'pending'}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="2"
                >
                  ${s.installment2?.status === 'received' ? '✓ Recebido' : '⏳ Pendente'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <!-- Card do Salário Fixo da Residência -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('hospital', { size: 20, color: '#D81B60' })}
            Bolsa Residência Médica
          </h2>
          <button class="section-action-btn" id="btn-edit-salary">Ajustar</button>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${salary.description} (Dia ${salary.dayOfMonth})</span>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--mint-income);">
              ${formatCurrency(salary.value)}
            </div>
          </div>
          <span style="font-size: 0.75rem; background: var(--mint-income-light); color: var(--mint-income); padding: 4px 10px; border-radius: var(--radius-pill); font-weight: 700;">
            Fixo Mensal
          </span>
        </div>
      </section>

      <!-- Lista de Plantões em Sala de Parto -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('stethoscope', { size: 20, color: '#AB47BC' })}
            Plantões em Sala de Parto
          </h2>
          <button class="section-action-btn" id="btn-add-shift-quick">+ Novo Plantão</button>
        </div>
        <div style="margin-bottom: 12px; font-size: 0.78rem; color: var(--text-muted);">
          Regra Pediátrica: <strong>75% pago em 2 meses (D+60)</strong> e <strong>25% no 3º mês (D+90)</strong>.
        </div>
        ${shiftsHtml}
      </section>
    `;
  }

  // -------------------------------------------------------------
  // ABA: DESPESAS (COM TODAS AS 22 CATEGORIAS & PARCELAMENTOS)
  // -------------------------------------------------------------
  renderExpensesTab(summary, currentMonth) {
    const monthExpenses = this.store.data.expenses
      .filter(e => e.date.startsWith(currentMonth))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    let expensesHtml = '';
    if (monthExpenses.length === 0) {
      expensesHtml = `
        <div class="empty-donut-state">
          <div class="empty-icon-circle">
            ${getIconSvg('cart', { size: 28, color: '#AB47BC' })}
          </div>
          <p class="empty-text">Nenhuma despesa para este mês</p>
          <span class="empty-sub">Toque em "+" para lançar despesas à vista ou parceladas</span>
        </div>
      `;
    } else {
      expensesHtml = monthExpenses.map(e => {
        const catInfo = this.store.data.categories.find(c => c.name === e.category) || { icon: 'tag', color: '#AB47BC' };

        return `
          <div class="expense-item-row">
            <div class="expense-left">
              <div class="expense-icon-badge" style="background: ${catInfo.color}15; color: ${catInfo.color};">
                ${getIconSvg(catInfo.icon, { size: 20, color: catInfo.color })}
              </div>
              <div class="expense-texts">
                <span class="expense-desc">${e.description}</span>
                <span class="expense-cat-date">${e.category} • ${formatDateBR(e.date)}</span>
              </div>
            </div>
            <div class="expense-right">
              <span class="expense-val">${formatCurrency(e.value)}</span>
              <button class="expense-del-btn" data-delete-expense="${e.id}" title="Excluir Despesa">
                ${getIconSvg('delete', { size: 16, color: 'currentColor' })}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <!-- Resumo de Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('cart', { size: 20, color: '#F4511E' })}
            Total de Despesas do Mês
          </h2>
          <button class="section-action-btn" id="btn-add-expense-quick">+ Nova Despesa</button>
        </div>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--coral-expense); margin-bottom: 4px;">
          ${formatCurrency(summary.totalExpenses)}
        </div>
        <span style="font-size: 0.78rem; color: var(--text-muted);">
          Inclui custos fixos, gastos diários e compras parceladas vigentes
        </span>
      </section>

      <!-- Lista Detalhada de Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>Lançamentos de ${formatMonthYear(currentMonth).split(' de ')[0]}</h2>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
            ${monthExpenses.length} itens
          </span>
        </div>
        <div class="expenses-list">
          ${expensesHtml}
        </div>
      </section>
    `;
  }

  // -------------------------------------------------------------
  // FORMULÁRIOS DO MODAL
  // -------------------------------------------------------------
  renderModalContent() {
    const body = document.getElementById('modal-body-content');
    if (!body) return;

    // Atualiza a aba ativa no cabeçalho do modal
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-modal-tab') === this.activeModalTab);
    });

    if (this.activeModalTab === 'shift') {
      const today = getLocalDateString();
      const hospitalOptions = this.store.data.hospitals.map(h => `<option value="${h}">${h}</option>`).join('');

      body.innerHTML = `
        <form id="form-new-shift">
          <div class="form-group">
            <label>Hospital / Local</label>
            <input list="hospitals-list" name="hospital" class="form-input" placeholder="Ex: Maternidade Araken" required />
            <datalist id="hospitals-list">
              ${hospitalOptions}
            </datalist>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Data do Plantão</label>
              <input type="date" name="date" class="form-input" value="${today}" required />
            </div>
            <div class="form-group">
              <label>Tipo de Plantão</label>
              <select name="shiftType" class="form-select">
                <option value="12h Noturno">12h Noturno</option>
                <option value="12h Diurno">12h Diurno</option>
                <option value="24h">24h</option>
                <option value="Sala de Parto">Sala de Parto</option>
                <option value="Sobreaviso">Sobreaviso</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor Líquido (R$)</label>
              <input type="number" step="0.01" name="netValue" class="form-input" placeholder="Ex: 2100.00" required />
            </div>
            <div class="form-group">
              <label>Valor Bruto (R$)</label>
              <input type="number" step="0.01" name="grossValue" class="form-input" placeholder="Opcional" />
            </div>
          </div>

          <div style="background: var(--lilac-light); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--lilac-dark); margin-bottom: 12px;">
            ✨ O sistema dividirá automaticamente este plantão em: <strong>75% em 2 meses</strong> e <strong>25% em 3 meses</strong>.
          </div>

          <button type="submit" class="submit-btn">Salvar Plantão</button>
        </form>
      `;

      const form = document.getElementById('form-new-shift');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const hospital = fd.get('hospital');
        const date = fd.get('date');
        const shiftType = fd.get('shiftType');
        const netValue = parseFloat(fd.get('netValue')) || 0;
        const grossValue = parseFloat(fd.get('grossValue')) || netValue;

        this.store.saveShift({
          hospital,
          date,
          shiftType,
          netValue,
          grossValue
        });

        this.closeModal();
        this.showToast(`Plantão no ${hospital} registrado com sucesso! 🌸`);
      };

    } else if (this.activeModalTab === 'expense') {
      const today = getLocalDateString();
      const catOptions = this.store.data.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

      body.innerHTML = `
        <form id="form-new-expense">
          <div class="form-group">
            <label>Categoria</label>
            <select name="category" class="form-select" required>
              ${catOptions}
            </select>
          </div>

          <div class="form-group">
            <label>Descrição do Gasto</label>
            <input type="text" name="description" class="form-input" placeholder="Ex: Supermercado, Aluguel, Farmácia..." required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor Total (R$)</label>
              <input type="number" step="0.01" name="value" class="form-input" placeholder="Ex: 350.00" required />
            </div>
            <div class="form-group">
              <label>Data</label>
              <input type="date" name="date" class="form-input" value="${today}" required />
            </div>
          </div>

          <div class="form-group" style="margin-top: 4px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="check-is-installment" name="isInstallment" style="width: 18px; height: 18px;" />
              <span>Compra Parcelada no Cartão?</span>
            </label>
          </div>

          <div class="form-group" id="group-installments-count" style="display: none;">
            <label>Quantidade de Parcelas</label>
            <select name="totalInstallments" class="form-select">
              <option value="2">2x</option>
              <option value="3">3x</option>
              <option value="4">4x</option>
              <option value="5">5x</option>
              <option value="6">6x</option>
              <option value="8">8x</option>
              <option value="10">10x</option>
              <option value="12">12x</option>
              <option value="18">18x</option>
              <option value="24">24x</option>
            </select>
          </div>

          <button type="submit" class="submit-btn">Salvar Despesa</button>
        </form>
      `;

      const checkInst = document.getElementById('check-is-installment');
      const groupCount = document.getElementById('group-installments-count');
      checkInst.onchange = () => {
        groupCount.style.display = checkInst.checked ? 'flex' : 'none';
      };

      const form = document.getElementById('form-new-expense');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const category = fd.get('category');
        const description = fd.get('description');
        const value = parseFloat(fd.get('value')) || 0;
        const date = fd.get('date');
        const isInstallment = checkInst.checked;
        const totalInstallments = isInstallment ? parseInt(fd.get('totalInstallments'), 10) : 1;

        this.store.saveExpense({
          category,
          description,
          value,
          date,
          isInstallment,
          totalInstallments
        });

        this.closeModal();
        this.showToast('Despesa computada com sucesso! 🌸');
      };

    } else if (this.activeModalTab === 'salary') {
      const sal = this.store.data.residencySalary;

      body.innerHTML = `
        <form id="form-edit-salary">
          <div class="form-group">
            <label>Descrição do Salário / Bolsa</label>
            <input type="text" name="description" class="form-input" value="${sal.description}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valor Mensal (R$)</label>
              <input type="number" step="0.01" name="value" class="form-input" value="${sal.value}" required />
            </div>
            <div class="form-group">
              <label>Dia do Depósito</label>
              <input type="number" min="1" max="31" name="dayOfMonth" class="form-input" value="${sal.dayOfMonth}" required />
            </div>
          </div>

          <button type="submit" class="submit-btn">Atualizar Bolsa Residência</button>
        </form>
      `;

      const form = document.getElementById('form-edit-salary');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const description = fd.get('description');
        const value = parseFloat(fd.get('value')) || 0;
        const dayOfMonth = parseInt(fd.get('dayOfMonth'), 10) || 5;

        this.store.updateResidencySalary({
          description,
          value,
          dayOfMonth,
          active: true
        });

        this.closeModal();
        this.showToast('Bolsa da Residência atualizada! 🌸');
      };
    }
  }
}

// Inicia aplicação com verificação segura de readyState para módulos diferidos
function initApp() {
  if (window.pediatricApp) return;
  window.pediatricApp = new PediatricApp();

  // Configuração rápida de atalhos para abrir modais específicos
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-edit-salary')) {
      window.pediatricApp.openModal('salary');
    }
    if (e.target.closest('#btn-add-shift-quick')) {
      window.pediatricApp.openModal('shift');
    }
    if (e.target.closest('#btn-add-expense-quick')) {
      window.pediatricApp.openModal('expense');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


})();

/**
 * Finanças Pediatria v4.0 - Silk & Rose Gold Standalone Bundle
 * Self-contained for zero-CORS file:// protocol and offline execution
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */
(function() {
  'use strict';

  // --- ICONS SYSTEM ---
  /**
 * Finanças Pediatria v4.0 - Sistema de Ícones SVG Puros "Silk & Rose Gold"
 * 100% Offline, Zero-CORS, imune a falhas de CDN ou ligaturas de fontes no iOS Safari.
 * Criado por: FChNeto (APP_CREATOR)
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
  chevron_down: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  chevron_up: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
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

  // Novos Ícones Especialmente Refinados para a v4
  menu: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="16" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  format: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  analytics: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="2" r="2"/><circle cx="6" cy="11" r="2"/></svg>',
  camera: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  shield_check: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
  heart_pulse: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-3 3 6 1.5-3h5.28"/></svg>',

  // Aliases de conveniência
  moon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  save_iphone: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="M9 10l3 3 3-3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>',
  mint_income: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2m0 8v2"/></svg>',
  coral_expense: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8l4 4-4 4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  pie: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
  layers: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  filter: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>'
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
 * Finanças Pediatria v4.0 - Core Storage & Financial Engine
 * Design System & Arquitetura "Silk & Rose Gold"
 * Persistência Tripla para iOS Safari (IndexedDB + LocalStorage + Storage Persistence API)
 * Regras Pediátricas Canônicas: Bolsa Residência + Plantões Sala de Parto (75% D+60 / 25% D+90)
 * Categorização Inteligente em 6 Macro-Grupos de Despesas (Nubank/Revolut-inspired)
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */

const APP_CREATOR = 'FChNeto';
const APP_VERSION = '4.0.0';
const STORAGE_KEY = 'financas_pediatria_v4';
const DB_NAME = 'v4_pediatric_db';
const DB_STORE = 'app_state';

// 23 Categorias Canônicas Pediátricas (incluindo as 22 obrigatórias)
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

// 6 Macro-Grupos Inteligentes para Finanças Médicas
const MACRO_GROUPS = [
  {
    id: 'macro_alimentacao',
    name: 'Alimentação',
    icon: 'meal',
    color: '#FF7043',
    bgColor: '#FBE9E7',
    categories: ['Mercantil', 'Refeição', 'Lanches', 'Delivery']
  },
  {
    id: 'macro_transporte',
    name: 'Transporte & Mobilidade',
    icon: 'car',
    color: '#42A5F5',
    bgColor: '#E3F2FD',
    categories: ['Combustível', 'Uber', 'Passagens']
  },
  {
    id: 'macro_moradia',
    name: 'Moradia & Contas',
    icon: 'home',
    color: '#26A69A',
    bgColor: '#E0F2F1',
    categories: ['Aluguel', 'Energia', 'Água', 'Internet']
  },
  {
    id: 'macro_formacao',
    name: 'Formação & Carreira',
    icon: 'qualification',
    color: '#7E57C2',
    bgColor: '#EDE7F6',
    categories: ['Estudo', 'Cursos', 'Qualificação/Congresso/Pós']
  },
  {
    id: 'macro_saude_beleza',
    name: 'Saúde & Autocuidado',
    icon: 'sparkles',
    color: '#EC407A',
    bgColor: '#FCE4EC',
    categories: ['Remédios', 'Academia', 'Cosméticos', 'Beleza/Salão', 'Produtos de beleza']
  },
  {
    id: 'macro_lazer_outros',
    name: 'Pessoal, Lazer & Outros',
    icon: 'gift',
    color: '#AB47BC',
    bgColor: '#F3E5F5',
    categories: ['Presentes', 'Saídas', 'Compras Parceladas', 'Doação']
  }
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
 * Retorna o Macro-Grupo correspondente a uma categoria
 */
function getMacroGroupForCategory(categoryName) {
  if (!categoryName) return MACRO_GROUPS[5];
  for (const group of MACRO_GROUPS) {
    if (group.categories.some(c => c.toLowerCase() === categoryName.trim().toLowerCase())) {
      return group;
    }
  }
  return MACRO_GROUPS[5]; // Pessoal, Lazer & Outros como fallback
}

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
 * IndexedDB Driver nativo para iOS / Safari PWA v4
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
          db.createObjectStore(DB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  },

  async getAppState() {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const req = store.get('current_state');
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return null;
    }
  },

  async saveAppState(data) {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const req = store.put({ id: 'current_state', data, updatedAt: new Date().toISOString() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return false;
    }
  },

  async clearAppState() {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const req = store.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return false;
    }
  }
};

/**
 * PediatricStore v4.0 - Gerenciador de Estado e Regras de Negócio
 */
class PediatricStore {
  constructor() {
    this.listeners = [];
    this.data = this.getDefaultState();

    this.initPersistence();
  }

  getDefaultState() {
    return {
      creator: APP_CREATOR,
      version: APP_VERSION,
      doctorName: 'Dra. Fernanda Ch.',
      crm: 'CRM/RN 12345',
      specialty: 'Pediatria (R3)',
      doctorPhoto: null,
      residencySalary: {
        value: 4106.09,
        active: true,
        dayOfMonth: 5
      },
      hospitals: [...DEFAULT_HOSPITALS],
      categories: [...DEFAULT_CATEGORIES],
      shifts: [],
      expenses: [],
      preferences: {
        theme: 'light',
        regime: 'caixa',
        activeMonth: getLocalDateString().slice(0, 7),
        chartViewMode: 'macro' // 'macro' | 'detailed'
      }
    };
  }

  async initPersistence() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        await navigator.storage.persist();
      } catch (err) {
        // silencioso
      }
    }

    // 1. Carrega do localStorage síncrono
    this.loadFromLocalStorage();

    // 2. Carrega do IndexedDB assíncrono (resiliente a limpezas do Safari)
    if (typeof window !== 'undefined') {
      try {
        const idbData = await IndexedDBManager.getAppState();
        if (idbData && idbData.version) {
          // Mescla com segurança
          this.data = { ...this.data, ...idbData };
          this.notify();
        }
      } catch (err) {
        // Usa localStorage como fallback seguro
      }
    }
  }

  loadFromLocalStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.data = {
            ...this.data,
            ...parsed,
            creator: APP_CREATOR, // Imutável
            preferences: {
              ...this.data.preferences,
              ...(parsed.preferences || {})
            }
          };
        }
      }
    } catch (e) {
      console.warn('Erro ao ler localStorage v4:', e);
    }
  }

  save() {
    // 1. LocalStorage síncrono
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.warn('Falha ao gravar localStorage v4:', e);
      }
    }

    // 2. IndexedDB assíncrono
    if (typeof window !== 'undefined') {
      IndexedDBManager.saveAppState(this.data).catch(() => {});
    }

    this.notify();
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.data);
      } catch (e) {
        console.error('Erro no listener da store:', e);
      }
    });
  }

  // -------------------------------------------------------------
  // OPERAÇÕES DE PLANTÕES (75% D+60 / 25% D+90)
  // -------------------------------------------------------------
  saveShift(shift) {
    if (!shift.id) {
      shift.id = 'shift_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }

    const net = parseFloat(shift.netValue) || 0;
    const gross = parseFloat(shift.grossValue) || net;

    // Divisão com precisão de centavos: 75% D+60 e 25% D+90
    const val75 = Math.round(net * 0.75 * 100) / 100;
    const val25 = Math.round((net - val75) * 100) / 100;

    const workedDate = shift.date || getLocalDateString();
    const expectedD60 = addMonthsToDateString(workedDate, 2);
    const expectedD90 = addMonthsToDateString(workedDate, 3);

    const shiftData = {
      id: shift.id,
      hospital: shift.hospital || 'Maternidade Araken',
      date: workedDate,
      shiftType: shift.shiftType || '12h Noturno',
      grossValue: gross,
      netValue: net,
      notes: shift.notes || '',
      installment1: {
        percentage: 75,
        value: val75,
        expectedDate: shift.installment1?.expectedDate || expectedD60,
        status: shift.installment1?.status || 'pending',
        paidDate: shift.installment1?.paidDate || null
      },
      installment2: {
        percentage: 25,
        value: val25,
        expectedDate: shift.installment2?.expectedDate || expectedD90,
        status: shift.installment2?.status || 'pending',
        paidDate: shift.installment2?.paidDate || null
      },
      createdAt: shift.createdAt || new Date().toISOString()
    };

    const idx = this.data.shifts.findIndex(s => s.id === shiftData.id);
    if (idx >= 0) {
      this.data.shifts[idx] = shiftData;
    } else {
      this.data.shifts.push(shiftData);
    }

    // Registra o hospital se for novo
    if (shiftData.hospital && !this.data.hospitals.includes(shiftData.hospital)) {
      this.data.hospitals.push(shiftData.hospital);
    }

    this.save();
    return shiftData;
  }

  deleteShift(id) {
    this.data.shifts = this.data.shifts.filter(s => s.id !== id);
    this.save();
  }

  toggleShiftInstallment(shiftId, installmentNum) {
    const shift = this.data.shifts.find(s => s.id === shiftId);
    if (!shift) return null;

    const instKey = installmentNum === 1 ? 'installment1' : 'installment2';
    const inst = shift[instKey];
    if (!inst) return null;

    if (inst.status === 'received') {
      inst.status = 'pending';
      inst.paidDate = null;
    } else {
      inst.status = 'received';
      inst.paidDate = getLocalDateString();
    }

    this.save();
    return shift;
  }

  // -------------------------------------------------------------
  // OPERAÇÕES DE DESPESAS COM PARCELAMENTO
  // -------------------------------------------------------------
  saveExpense(expense) {
    const isInst = Boolean(expense.isInstallment && expense.totalInstallments > 1);
    const totalInst = isInst ? parseInt(expense.totalInstallments, 10) : 1;
    const totalVal = parseFloat(expense.value) || 0;
    const baseDate = expense.date || getLocalDateString();

    const parentGroupId = 'exp_group_' + Date.now();

    if (isInst && totalInst > 1) {
      const partVal = Math.floor((totalVal / totalInst) * 100) / 100;
      const firstPartVal = Math.round((totalVal - (partVal * (totalInst - 1))) * 100) / 100;

      for (let i = 1; i <= totalInst; i++) {
        const instVal = i === 1 ? firstPartVal : partVal;
        const instDate = addMonthsToDateString(baseDate, i - 1);

        const expItem = {
          id: `exp_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          groupId: parentGroupId,
          category: expense.category || 'Outros',
          description: `${expense.description} (${i}/${totalInst})`,
          value: instVal,
          date: instDate,
          isInstallment: true,
          installmentNumber: i,
          totalInstallments: totalInst,
          createdAt: new Date().toISOString()
        };
        this.data.expenses.push(expItem);
      }
    } else {
      const singleExp = {
        id: expense.id || 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        category: expense.category || 'Outros',
        description: expense.description || 'Despesa',
        value: totalVal,
        date: baseDate,
        isInstallment: false,
        createdAt: expense.createdAt || new Date().toISOString()
      };

      const idx = this.data.expenses.findIndex(e => e.id === singleExp.id);
      if (idx >= 0) {
        this.data.expenses[idx] = singleExp;
      } else {
        this.data.expenses.push(singleExp);
      }
    }

    this.save();
  }

  deleteExpense(id) {
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
  }

  // -------------------------------------------------------------
  // BOLSA RESIDÊNCIA E PERFIL MÉDICO
  // -------------------------------------------------------------
  updateResidencySalary({ value, active = true, dayOfMonth = 5 }) {
    this.data.residencySalary = {
      value: parseFloat(value) || 0,
      active: Boolean(active),
      dayOfMonth: parseInt(dayOfMonth, 10) || 5
    };
    this.save();
  }

  updateDoctorProfile({ doctorName, crm, specialty, doctorPhoto, salaryValue }) {
    if (typeof doctorName === 'string') this.data.doctorName = doctorName;
    if (typeof crm === 'string') this.data.crm = crm;
    if (typeof specialty === 'string') this.data.specialty = specialty;
    if (doctorPhoto !== undefined) this.data.doctorPhoto = doctorPhoto;
    if (salaryValue !== undefined) {
      this.data.residencySalary.value = parseFloat(salaryValue) || 0;
    }
    this.save();
  }

  // -------------------------------------------------------------
  // ZERAR DADOS (FORMATAR) COM SEGURANÇA EM 2 ETAPAS
  // -------------------------------------------------------------
  /**
   * Executa a formatação dos dados.
   * @param {'transactions_only' | 'full_factory'} mode
   */
  resetData(mode = 'transactions_only') {
    if (mode === 'transactions_only') {
      this.data.shifts = [];
      this.data.expenses = [];
    } else if (mode === 'full_factory') {
      const pristine = this.getDefaultState();
      this.data = pristine;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      IndexedDBManager.clearAppState().catch(() => {});
    }
    this.save();
    return true;
  }

  // -------------------------------------------------------------
  // RELATÓRIOS FINANCEIROS E MACRO-GRUPOS
  // -------------------------------------------------------------
  getMonthSummary(monthStr, regime = 'caixa') {
    const isCaixa = regime === 'caixa';
    let residencyIncome = 0;
    if (this.data.residencySalary.active) {
      residencyIncome = this.data.residencySalary.value;
    }

    let shiftIncome = 0;
    let shiftsInScope = 0;
    let shiftsReceivedValue = 0;
    let shiftsPendingValue = 0;

    if (isCaixa) {
      // Regime de Caixa: Parcelas cujo expectedDate coincide com o mês
      this.data.shifts.forEach(s => {
        let countedInMonth = false;
        if (s.installment1 && s.installment1.expectedDate.startsWith(monthStr)) {
          shiftIncome += s.installment1.value;
          countedInMonth = true;
          if (s.installment1.status === 'received') {
            shiftsReceivedValue += s.installment1.value;
          } else {
            shiftsPendingValue += s.installment1.value;
          }
        }
        if (s.installment2 && s.installment2.expectedDate.startsWith(monthStr)) {
          shiftIncome += s.installment2.value;
          countedInMonth = true;
          if (s.installment2.status === 'received') {
            shiftsReceivedValue += s.installment2.value;
          } else {
            shiftsPendingValue += s.installment2.value;
          }
        }
        if (countedInMonth) {
          shiftsInScope++;
        }
      });
    } else {
      // Regime de Competência: Plantões trabalhados no mês
      this.data.shifts.forEach(s => {
        if (s.date.startsWith(monthStr)) {
          shiftIncome += s.netValue;
          shiftsInScope++;
          const paidTotal = (s.installment1?.status === 'received' ? s.installment1.value : 0) +
                            (s.installment2?.status === 'received' ? s.installment2.value : 0);
          shiftsReceivedValue += paidTotal;
          shiftsPendingValue += (s.netValue - paidTotal);
        }
      });
    }

    const totalIncome = residencyIncome + shiftIncome;

    // Despesas do mês
    const monthExpenses = this.data.expenses.filter(e => e.date.startsWith(monthStr));
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.value, 0);
    const balance = totalIncome - totalExpenses;

    // Breakdown por Categoria Específica
    const categoryMap = {};
    monthExpenses.forEach(e => {
      const cat = e.category || 'Outros';
      categoryMap[cat] = (categoryMap[cat] || 0) + e.value;
    });

    const categoryBreakdown = Object.keys(categoryMap).map(catName => {
      const val = categoryMap[catName];
      const catDef = this.data.categories.find(c => c.name === catName) || {
        icon: 'tag',
        color: '#AB47BC'
      };
      return {
        category: catName,
        value: val,
        percentage: totalExpenses > 0 ? (val / totalExpenses) * 100 : 0,
        icon: catDef.icon,
        color: catDef.color
      };
    }).sort((a, b) => b.value - a.value);

    // Breakdown por 6 Macro-Grupos
    const macroMap = {};
    MACRO_GROUPS.forEach(g => {
      macroMap[g.id] = {
        id: g.id,
        name: g.name,
        icon: g.icon,
        color: g.color,
        bgColor: g.bgColor,
        value: 0,
        count: 0
      };
    });

    monthExpenses.forEach(e => {
      const mg = getMacroGroupForCategory(e.category);
      if (macroMap[mg.id]) {
        macroMap[mg.id].value += e.value;
        macroMap[mg.id].count += 1;
      }
    });

    const macroBreakdown = Object.values(macroMap)
      .filter(m => m.value > 0)
      .map(m => ({
        ...m,
        percentage: totalExpenses > 0 ? (m.value / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    // Comparativo Caixa Real vs Produção Represada
    // Produção do mês trabalhada aguardando D+60 e D+90
    let workedThisMonthTotal = 0;
    this.data.shifts.forEach(s => {
      if (s.date.startsWith(monthStr)) {
        workedThisMonthTotal += s.netValue;
      }
    });

    return {
      month: monthStr,
      regime,
      residencyIncome,
      shiftIncome,
      totalIncome,
      totalExpenses,
      balance,
      shiftsCount: shiftsInScope,
      shiftsReceivedValue,
      shiftsPendingValue,
      expensesCount: monthExpenses.length,
      categoryBreakdown,
      macroBreakdown,
      workedThisMonthTotal
    };
  }

  getForecast6Months(startMonthStr) {
    const result = [];
    for (let i = 0; i < 6; i++) {
      const m = addMonthsToDateString(`${startMonthStr}-01`, i).slice(0, 7);
      const summ = this.getMonthSummary(m, 'caixa');
      result.push({
        month: m,
        label: formatMonthYear(m).split(' de ')[0],
        income: summ.totalIncome,
        expenses: summ.totalExpenses,
        balance: summ.balance
      });
    }
    return result;
  }

  // -------------------------------------------------------------
  // BACKUP E RESTAURAÇÃO
  // -------------------------------------------------------------
  exportBackupJsonString() {
    const payload = {
      ...this.data,
      exportedAt: new Date().toISOString(),
      creator: APP_CREATOR,
      version: APP_VERSION
    };
    return JSON.stringify(payload, null, 2);
  }

  async exportBackupToFile(filenamePrefix = 'financas_pediatria_v4_backup') {
    const jsonStr = this.exportBackupJsonString();
    const dateStr = getLocalDateString();
    const fileName = `${filenamePrefix}_${dateStr}.json`;

    // No iOS Safari moderno, tenta a Web Share API se suportar arquivos
    if (typeof navigator !== 'undefined' && navigator.canShare && typeof File !== 'undefined') {
      try {
        const file = new File([jsonStr], fileName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Finanças Pediatria - Cópia de Segurança',
            text: 'Backup completo do aplicativo Finanças Pediatria Dra. Fernanda Ch.'
          });
          return { success: true, method: 'share' };
        }
      } catch (err) {
        // Fallback para download clássico
      }
    }

    // Fallback de download universal em Blob
    if (typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 300);
      return { success: true, method: 'download' };
    }

    return { success: false, error: 'Ambiente não suporta download' };
  }

  importBackupFromFile(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Arquivo inválido' };
      }

      this.data = {
        ...this.getDefaultState(),
        ...parsed,
        creator: APP_CREATOR, // Imutável
        version: APP_VERSION,
        shifts: Array.isArray(parsed.shifts) ? parsed.shifts : [],
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        hospitals: Array.isArray(parsed.hospitals) && parsed.hospitals.length > 0 ? parsed.hospitals : [...DEFAULT_HOSPITALS],
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : [...DEFAULT_CATEGORIES]
      };

      this.save();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}


  // --- CHARTS ENGINE ---
  /**
 * Finanças Pediatria v4.0 - SVG Charts Engine "Silk & Rose Gold"
 * Renderização leve, responsiva e pura em SVG (sem dependências externas)
 * Suporte a Macro-Grupos de Despesas, Sparklines e Mini-Calendário Visual
 * Criado por: FChNeto (APP_CREATOR)
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
function renderDonutExpenses(container, breakdown = [], totalExpenses = 0, viewMode = 'macro', onToggleMode = null) {
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
function renderComparisonVisual(container, caixaReal = 0, producaoRepresada = 0, monthLabel = '') {
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
function renderMonthCalendarVisual(container, yearMonthStr, shifts = [], expenses = []) {
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
function renderNetBalanceVisual(container, summary, monthLabel = '') {
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



  // --- APPLICATION LOGIC ---
  /**
 * Finanças Pediatria v4.0 - Application Controller (SPA)
 * Design System "Silk & Rose Gold"
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */






class PediatricApp {
  constructor() {
    this.store = new PediatricStore();
    this.currentTab = 'home'; // 'home' | 'income' | 'expenses'
    this.activeModalTab = 'shift'; // 'shift' | 'expense' | 'salary'
    this.prefilledHospital = '';
    this.activeExpenseFilter = 'all'; // 'all' | macro group id


    this.initDOM();
    this.bindEvents();
    this.applyTheme(this.store.data.preferences.theme || 'light');
    this.render();

    // Re-renderização reativa em alterações da store
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
    document.addEventListener('click', (e) => {
      // 1. Navegação de Abas Inferiores
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        this.switchTab(tab);
        return;
      }

      // 2. Botão Flutuante Central (+)
      const fabBtn = e.target.closest('#fab-add-btn');
      if (fabBtn) {
        this.openModal('shift');
        return;
      }

      // 3. Botões de Lançamento Rápido Direto
      const quickAddExpense = e.target.closest('#btn-quick-add-expense') || e.target.closest('#btn-add-expense-quick');
      if (quickAddExpense) {
        this.openModal('expense');
        return;
      }

      const quickAddShift = e.target.closest('#btn-quick-add-shift') || e.target.closest('#btn-add-shift-quick');
      if (quickAddShift) {
        this.openModal('shift');
        return;
      }

      // 4. Chips de Pré-Seleção de Maternidades (Araken & Leide Morais)
      const hospChip = e.target.closest('[data-quick-hospital]');
      if (hospChip) {
        const hospName = hospChip.getAttribute('data-quick-hospital');
        this.openModalWithHospital(hospName);
        return;
      }

      // 5. Menu Hambúrguer Drawer
      const burgerBtn = e.target.closest('#btn-hamburger-menu');
      if (burgerBtn) {
        this.openDrawer();
        return;
      }

      const closeDrawerBtn = e.target.closest('#btn-close-drawer') || (e.target.classList.contains('drawer-overlay') && e.target);
      if (closeDrawerBtn) {
        this.closeDrawer();
        return;
      }

      // Perfil no Cabeçalho (Avatar e Saudação Médica)
      const headerProfile = e.target.closest('#btn-header-profile');
      if (headerProfile) {
        this.openProfileModal();
        return;
      }

      // 6. Itens do Drawer
      const drawerItemProfile = e.target.closest('#drawer-item-profile');
      if (drawerItemProfile) {
        this.closeDrawer();
        this.openProfileModal();
        return;
      }

      const drawerItemCategories = e.target.closest('#drawer-item-categories');
      if (drawerItemCategories) {
        this.closeDrawer();
        this.openCategoriesModal();
        return;
      }

      const drawerItemHub = e.target.closest('#drawer-item-hub');
      if (drawerItemHub) {
        this.closeDrawer();
        this.openHubModal();
        return;
      }

      const drawerItemReset = e.target.closest('#drawer-item-reset');
      if (drawerItemReset) {
        this.closeDrawer();
        this.handleTwoStageDataReset();
        return;
      }

      const drawerItemTheme = e.target.closest('#drawer-item-theme');
      if (drawerItemTheme) {
        this.toggleTheme();
        return;
      }

      const drawerItemBackup = e.target.closest('#drawer-item-backup');
      if (drawerItemBackup) {
        this.handleExportBackup();
        return;
      }

      const drawerItemRestore = e.target.closest('#drawer-item-restore');
      if (drawerItemRestore) {
        const fileInput = document.getElementById('backup-file-input');
        if (fileInput) fileInput.click();
        return;
      }

      // Filtro de Macro-Grupos na Aba de Despesas
      const macroFilterBtn = e.target.closest('[data-macro-filter]');
      if (macroFilterBtn) {
        const filterId = macroFilterBtn.getAttribute('data-macro-filter');
        this.activeExpenseFilter = filterId;
        this.render();
        return;
      }

      // Silk Select: Toggle do Menu Dropdown / Dropup
      const selectTrigger = e.target.closest('.silk-select-trigger');
      if (selectTrigger) {
        const container = selectTrigger.closest('.silk-select-container');
        const menu = container ? container.querySelector('.silk-select-menu') : null;
        if (menu) {
          const wasOpen = menu.classList.contains('open');
          document.querySelectorAll('.silk-select-menu.open').forEach(m => m.classList.remove('open'));
          document.querySelectorAll('.silk-select-trigger.open').forEach(t => t.classList.remove('open'));
          if (!wasOpen) {
            menu.classList.add('open');
            selectTrigger.classList.add('open');
          }
        }
        return;
      }

      // Silk Select: Seleção de Item
      const selectItem = e.target.closest('.silk-select-item');
      if (selectItem) {
        const val = selectItem.getAttribute('data-value');
        const label = selectItem.getAttribute('data-label') || val;
        const icon = selectItem.getAttribute('data-icon') || '';
        const color = selectItem.getAttribute('data-color') || '';
        const container = selectItem.closest('.silk-select-container');
        if (container) {
          const input = container.querySelector('input[type="hidden"]');
          if (input) input.value = val;
          const labelSpan = container.querySelector('.trigger-label');
          if (labelSpan) labelSpan.textContent = label;
          const iconSpan = container.querySelector('.trigger-icon');
          if (iconSpan && icon) {
            iconSpan.innerHTML = getIconSvg(icon, { size: 16, color: color || '#EC407A' });
            if (color) iconSpan.style.backgroundColor = `${color}15`;
          }
          container.querySelectorAll('.silk-select-item').forEach(i => i.classList.remove('selected'));
          selectItem.classList.add('selected');

          const menu = container.querySelector('.silk-select-menu');
          if (menu) menu.classList.remove('open');
          const trig = container.querySelector('.silk-select-trigger');
          if (trig) trig.classList.remove('open');
        }
        return;
      }

      // Acordeão de Subcategorias no Modal de Categorização
      const macroCardHeader = e.target.closest('.macro-category-header');
      if (macroCardHeader) {
        const card = macroCardHeader.closest('.macro-category-card');
        if (card) {
          const list = card.querySelector('.macro-subcat-list');
          if (list) list.classList.toggle('open');
        }
        return;
      }

      // Botão "Filtrar no Extrato" vindo do Modal de Categorização
      const btnFilterMacroFromModal = e.target.closest('[data-filter-macro-from-modal]');
      if (btnFilterMacroFromModal) {
        const macroId = btnFilterMacroFromModal.getAttribute('data-filter-macro-from-modal');
        this.activeExpenseFilter = macroId;
        this.closeModal();
        this.switchTab('expenses');
        return;
      }

      // Clicou fora de qualquer Silk Select: fecha menus
      if (!e.target.closest('.silk-select-container')) {
        document.querySelectorAll('.silk-select-menu.open').forEach(m => m.classList.remove('open'));
        document.querySelectorAll('.silk-select-trigger.open').forEach(t => t.classList.remove('open'));
      }

      // 7. Fechar Modais (Overlay ou Botão Fechar)
      const closeOverlay = e.target.closest('.modal-overlay');
      if (closeOverlay && (e.target === closeOverlay || e.target.closest('.btn-modal-close'))) {
        this.closeModal();
        return;
      }

      // 8. Abas do Modal
      const modalTabBtn = e.target.closest('[data-modal-tab]');
      if (modalTabBtn) {
        const mTab = modalTabBtn.getAttribute('data-modal-tab');
        this.switchModalTab(mTab);
        return;
      }

      // 9. Pills de Hospital dentro do Modal
      const modalHospPill = e.target.closest('[data-modal-hosp]');
      if (modalHospPill) {
        const val = modalHospPill.getAttribute('data-modal-hosp');
        const input = document.getElementById('shift-hospital-input');
        if (input) {
          input.value = val;
          document.querySelectorAll('.modal-hosp-pill').forEach(p => p.classList.remove('selected'));
          modalHospPill.classList.add('selected');
        }
        return;
      }

      // 10. Seletor de Regime (Caixa vs Competência)
      const regimeBtn = e.target.closest('[data-regime]');
      if (regimeBtn) {
        const reg = regimeBtn.getAttribute('data-regime');
        this.store.data.preferences.regime = reg;
        this.store.save();
        return;
      }

      // 11. Navegação de Mês
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

      // 12. Toggle de Parcela de Plantão (Recebido / Pendente)
      const toggleInstBtn = e.target.closest('[data-toggle-installment]');
      if (toggleInstBtn) {
        const shiftId = toggleInstBtn.getAttribute('data-shift-id');
        const instNum = parseInt(toggleInstBtn.getAttribute('data-inst-num'), 10);
        this.store.toggleShiftInstallment(shiftId, instNum);
        this.showToast('Status da parcela atualizado com sucesso! ✨');
        return;
      }

      // 13. Excluir Plantão
      const delShiftBtn = e.target.closest('[data-delete-shift]');
      if (delShiftBtn) {
        const shiftId = delShiftBtn.getAttribute('data-delete-shift');
        if (confirm('Deseja realmente remover este plantão?')) {
          this.store.deleteShift(shiftId);
          this.showToast('Plantão removido.');
        }
        return;
      }

      // 14. Excluir Despesa
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
              this.showToast('Dados restaurados com perfeição! 🌸');
            } else {
              alert('Erro ao restaurar arquivo: ' + res.error);
            }
          };
          reader.readAsText(file);
        }
        e.target.value = '';
      }
    });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const nextTheme = this.store.data.preferences.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    this.store.data.preferences.theme = nextTheme;
    this.store.save();
    this.showToast(nextTheme === 'dark' ? 'Modo Escuro ativado 🌙' : 'Modo Claro ativado ☀️');
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

  openDrawer() {
    const drawer = document.getElementById('hamburger-drawer');
    if (drawer) drawer.classList.add('open');
  }

  closeDrawer() {
    const drawer = document.getElementById('hamburger-drawer');
    if (drawer) drawer.classList.remove('open');
  }

  openModal(tab = 'shift') {
    this.activeModalTab = tab;
    this.prefilledHospital = '';
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.add('open');
      this.renderModalContent();
    }
  }

  openModalWithHospital(hospitalName) {
    this.activeModalTab = 'shift';
    this.prefilledHospital = hospitalName;
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.add('open');
      this.renderModalContent();
    }
  }

  closeModal() {
    const modal = document.getElementById('action-modal');
    if (modal) modal.classList.remove('open');
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
      this.showToast('Cópia de segurança salva com sucesso! 📱');
    }
  }

  // -------------------------------------------------------------
  // ZERAR DADOS (FORMATAR) COM SEGURANÇA EM 2 ETAPAS
  // -------------------------------------------------------------
  async handleTwoStageDataReset() {
    // Etapa 1: Download automático imediato do backup preventivo
    await this.store.exportBackupToFile('financas_pediatria_backup_preventivo');
    this.showToast('Backup preventivo salvo com segurança! 💾');

    // Etapa 2: Modal de confirmação segura
    this.openResetConfirmModal();
  }

  openResetConfirmModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;
    modal.classList.add('open');

    const body = document.getElementById('modal-body-content');
    const tabs = document.querySelector('.modal-header-tabs');
    if (tabs) tabs.style.display = 'none';

    body.innerHTML = `
      <div style="text-align: center; padding: 10px 0;">
        <div style="width: 56px; height: 56px; border-radius: var(--radius-pill); background: var(--coral-expense-light); color: var(--coral-expense); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          ${getIconSvg('trash', { size: 30, color: 'currentColor' })}
        </div>
        <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; margin-bottom: 6px;">
          Zerar Dados da Aplicação
        </h3>
        <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 18px;">
          Seu arquivo de backup preventivo já foi gerado e baixado. Escolha abaixo como deseja proceder:
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="drawer-menu-item" id="btn-reset-transactions" style="justify-content: center; background: #FFF3E0; border-color: #FFE082; color: #E65100;">
            Zerar Apenas Lançamentos (Mantém Perfil)
          </button>
          <button class="drawer-menu-item danger" id="btn-reset-factory" style="justify-content: center;">
            Reset de Fábrica Total (Limpar Tudo)
          </button>
          <button class="submit-btn" id="btn-reset-cancel" style="background: var(--bg-card-subtle); color: var(--text-main); box-shadow: none; border: 1px solid var(--silk-border);">
            Cancelar
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-reset-transactions').onclick = () => {
      this.store.resetData('transactions_only');
      this.closeModal();
      this.showToast('Lançamentos zerados com sucesso! ✨');
    };

    document.getElementById('btn-reset-factory').onclick = () => {
      this.store.resetData('full_factory');
      this.closeModal();
      this.showToast('Aplicação restaurada ao estado original de fábrica! 🌸');
    };

    document.getElementById('btn-reset-cancel').onclick = () => {
      this.closeModal();
    };
  }

  // -------------------------------------------------------------
  // MODAL DE PERFIL MÉDICO
  // -------------------------------------------------------------
  openProfileModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;
    modal.classList.add('open');

    const body = document.getElementById('modal-body-content');
    const tabs = document.querySelector('.modal-header-tabs');
    if (tabs) tabs.style.display = 'none';

    const p = this.store.data;
    const salary = p.residencySalary?.value || 4106.09;

    body.innerHTML = `
      <div style="padding: 6px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800;">
            Perfil da Médica Pediatra
          </h3>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 20 })}
          </button>
        </div>

        <form id="form-edit-profile">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 18px;">
            <div class="avatar-badge" style="width: 64px; height: 64px;">
              ${p.doctorPhoto ? `<img src="${p.doctorPhoto}" class="avatar-img" id="profile-preview-img" />` : getIconSvg('stethoscope', { size: 30, color: '#EC407A' })}
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 4px;">Foto de Perfil</label>
              <input type="file" id="input-doctor-photo" accept="image/*" style="font-size: 0.8rem;" />
            </div>
          </div>

          <div class="form-group">
            <label>Nome Completo da Médica</label>
            <input type="text" name="doctorName" class="form-input" value="${p.doctorName || 'Dra. Fernanda Ch.'}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>CRM / UF</label>
              <input type="text" name="crm" class="form-input" value="${p.crm || 'CRM/RN 12345'}" />
            </div>
            <div class="form-group">
              <label>Especialidade / Ano</label>
              <input type="text" name="specialty" class="form-input" value="${p.specialty || 'Pediatria (R3)'}" />
            </div>
          </div>

          <div class="form-group">
            <label>Bolsa Residência Mensal Líquida (R$)</label>
            <input type="number" step="0.01" name="salaryValue" class="form-input" value="${salary}" required />
          </div>

          <button type="submit" class="submit-btn">Salvar Perfil</button>
        </form>
      </div>
    `;

    // Processamento de Foto com compressão suave via Canvas
    let photoBase64 = p.doctorPhoto;
    const photoInput = document.getElementById('input-doctor-photo');
    if (photoInput) {
      photoInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const maxDim = 240;
              let w = img.width;
              let h = img.height;
              if (w > h && w > maxDim) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else if (h > maxDim) {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, w, h);
              photoBase64 = canvas.toDataURL('image/jpeg', 0.85);

              // Atualiza o preview
              const preview = document.getElementById('profile-preview-img');
              if (preview) {
                preview.src = photoBase64;
              }
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      };
    }

    const form = document.getElementById('form-edit-profile');
    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      this.store.updateDoctorProfile({
        doctorName: fd.get('doctorName'),
        crm: fd.get('crm'),
        specialty: fd.get('specialty'),
        doctorPhoto: photoBase64,
        salaryValue: fd.get('salaryValue')
      });
      this.closeModal();
      this.showToast('Perfil atualizado com sucesso! 🩺✨');
    };
  }

  // -------------------------------------------------------------
  // MODAL DE CATEGORIZAÇÃO DAS DESPESAS POR TIPO (MACRO-GRUPOS)
  // -------------------------------------------------------------
  openCategoriesModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;
    modal.classList.add('open');

    const body = document.getElementById('modal-body-content');
    const tabs = document.querySelector('.modal-header-tabs');
    if (tabs) tabs.style.display = 'none';

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const summary = this.store.getMonthSummary(currentMonth, 'caixa');
    const monthExpenses = this.store.data.expenses.filter(e => e.date.startsWith(currentMonth));

    let macroCardsHtml = '';
    MACRO_GROUPS.forEach(mg => {
      const groupExpenses = monthExpenses.filter(e => {
        const g = getMacroGroupForCategory(e.category);
        return g.id === mg.id;
      });
      const groupTotal = groupExpenses.reduce((s, e) => s + e.value, 0);
      const groupPct = summary.totalExpenses > 0 ? (groupTotal / summary.totalExpenses) * 100 : 0;

      // Subcategorias dentro deste grupo
      const subcatMap = {};
      groupExpenses.forEach(e => {
        subcatMap[e.category] = (subcatMap[e.category] || 0) + e.value;
      });
      const subcatRows = Object.keys(subcatMap).map(cName => `
        <div class="macro-subcat-item">
          <span>${cName}</span>
          <strong>${formatCurrency(subcatMap[cName])}</strong>
        </div>
      `).join('');

      macroCardsHtml += `
        <div class="macro-category-card">
          <div class="macro-category-header" title="Toque para ver detalhes">
            <div class="macro-category-left">
              <div class="macro-category-icon" style="background: ${mg.bgColor}; color: ${mg.color};">
                ${getIconSvg(mg.icon, { size: 22, color: mg.color })}
              </div>
              <div class="macro-category-info">
                <h4>${mg.name}</h4>
                <span>${groupExpenses.length} ${groupExpenses.length === 1 ? 'gasto' : 'gastos'} computados</span>
              </div>
            </div>
            <div class="macro-category-right">
              <span class="macro-category-val">${formatCurrency(groupTotal)}</span>
              <span class="macro-category-pct">${groupPct.toFixed(1)}% do orçamento</span>
            </div>
          </div>

          <div class="macro-progress-track">
            <div class="macro-progress-fill" style="width: ${groupPct.toFixed(1)}%; background: ${mg.color};"></div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
            <button class="section-action-btn" data-filter-macro-from-modal="${mg.id}" style="font-size: 0.72rem; padding: 4px 10px;">
              Filtrar no Extrato
            </button>
            <span style="font-size: 0.72rem; color: var(--text-muted); cursor: pointer;">
              ${Object.keys(subcatMap).length > 0 ? 'Ver subcategorias ▼' : 'Sem despesas neste grupo'}
            </span>
          </div>

          ${Object.keys(subcatMap).length > 0 ? `
            <div class="macro-subcat-list">
              ${subcatRows}
            </div>
          ` : ''}
        </div>
      `;
    });

    body.innerHTML = `
      <div style="padding: 6px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.18rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              ${getIconSvg('layers', { size: 22, color: '#EC407A' })}
              Categorização de Gastos por Tipo
            </h3>
            <p style="font-size: 0.78rem; color: var(--text-muted);">
              Macro-Grupos inspirados em bancos digitais (${formatMonthYear(currentMonth).split(' de ')[0]})
            </p>
          </div>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 20 })}
          </button>
        </div>

        <div style="margin-bottom: 14px; background: var(--hero-gradient); border: 1px solid var(--rose-gold); border-radius: var(--radius-md); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Total Despesas</span>
            <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: var(--coral-expense);">
              ${formatCurrency(summary.totalExpenses)}
            </div>
          </div>
          <button class="section-action-btn" id="btn-modal-goto-expenses" style="background: var(--bg-card); color: var(--primary-pink); border-color: var(--rose-gold);">
            + Nova Despesa
          </button>
        </div>

        <div class="macro-cards-container">
          ${macroCardsHtml}
        </div>
      </div>
    `;

    const btnGoExp = document.getElementById('btn-modal-goto-expenses');
    if (btnGoExp) {
      btnGoExp.onclick = () => {
        this.openModal('expense');
      };
    }
  }

  // -------------------------------------------------------------
  // MODAL HUB DE FINANÇAS VISUAL (5 REPRESENTAÇÕES VISUAIS)
  // -------------------------------------------------------------
  openHubModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;
    modal.classList.add('open');

    const body = document.getElementById('modal-body-content');
    const tabs = document.querySelector('.modal-header-tabs');
    if (tabs) tabs.style.display = 'none';

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const summary = this.store.getMonthSummary(currentMonth, 'caixa');

    body.innerHTML = `
      <div style="padding: 6px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.18rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              ${getIconSvg('analytics', { size: 22, color: '#EC407A' })}
              Hub de Finanças Visual
            </h3>
            <p style="font-size: 0.78rem; color: var(--text-muted);">
              Gráficos completos e representações visuais de ${formatMonthYear(currentMonth).split(' de ')[0]}
            </p>
          </div>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 20 })}
          </button>
        </div>

        <!-- 1. Balanço Líquido e Taxa de Poupança -->
        <div style="margin-bottom: 18px;">
          <div id="hub-net-balance-container"></div>
        </div>

        <!-- 2. Comparativo Caixa Real vs Produção Represada -->
        <div style="margin-bottom: 18px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
            Comparativo de Liquidez
          </h4>
          <div id="hub-comparison-container"></div>
        </div>

        <!-- 3. Distribuição de Gastos Donut -->
        <div style="margin-bottom: 18px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
            Distribuição de Gastos
          </h4>
          <div id="hub-donut-container"></div>
        </div>

        <!-- 4. Mini-Calendário Visual do Mês -->
        <div style="margin-bottom: 18px;">
          <div id="hub-calendar-container"></div>
        </div>

        <!-- 5. Previsão de 6 Meses -->
        <div>
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
            Projeção de 6 Meses de Fluxo
          </h4>
          <div id="hub-forecast-container"></div>
        </div>
      </div>
    `;

    renderNetBalanceVisual('hub-net-balance-container', summary, formatMonthYear(currentMonth));
    renderComparisonVisual('hub-comparison-container', summary.totalIncome, summary.workedThisMonthTotal, formatMonthYear(currentMonth));
    
    const chartViewMode = this.store.data.preferences.chartViewMode || 'macro';
    const donutData = chartViewMode === 'macro' ? summary.macroBreakdown : summary.categoryBreakdown;
    renderDonutExpenses(
      'hub-donut-container',
      donutData,
      summary.totalExpenses,
      chartViewMode,
      (newMode) => {
        this.store.data.preferences.chartViewMode = newMode;
        this.store.save();
        this.openHubModal();
      }
    );

    renderMonthCalendarVisual('hub-calendar-container', currentMonth, this.store.data.shifts, this.store.data.expenses);
    const forecast = this.store.getForecast6Months(currentMonth);
    renderForecastChart('hub-forecast-container', forecast);
  }

  // -------------------------------------------------------------
  // RENDERIZAÇÃO PRINCIPAL DO APP
  // -------------------------------------------------------------
  render() {
    if (!this.appEl) return;

    const currentMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const currentRegime = this.store.data.preferences.regime || 'caixa';
    const chartViewMode = this.store.data.preferences.chartViewMode || 'macro';
    const summary = this.store.getMonthSummary(currentMonth, currentRegime);

    let contentHtml = '';
    if (this.currentTab === 'home') {
      contentHtml = this.renderHomeTab(summary, currentMonth, currentRegime);
    } else if (this.currentTab === 'income') {
      contentHtml = this.renderIncomeTab(summary, currentMonth);
    } else if (this.currentTab === 'expenses') {
      contentHtml = this.renderExpensesTab(summary, currentMonth);
    }

    const doctorPhoto = this.store.data.doctorPhoto;

    this.appEl.innerHTML = `
      <!-- Cabeçalho Editorial com Foto e Menu Hambúrguer -->
      <header class="app-header">
        <div class="doctor-greeting" id="btn-header-profile" title="Ver Perfil">
          <div class="avatar-badge">
            ${doctorPhoto ? `<img src="${doctorPhoto}" class="avatar-img" />` : getIconSvg('stethoscope', { size: 24, color: '#EC407A' })}
          </div>
          <div class="greeting-text">
            <h1>${this.store.data.doctorName}</h1>
            <p>${this.store.data.specialty || 'Pediatria'}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn hamburger-btn" id="btn-hamburger-menu" title="Menu Principal">
            ${getIconSvg('menu', { size: 22 })}
          </button>
        </div>
      </header>

      <!-- Barra de Navegação de Mês -->
      <div class="month-selector-bar">
        <button class="nav-month-btn" id="btn-prev-month" title="Mês Anterior">
          ${getIconSvg('chevron_left', { size: 20, color: 'currentColor' })}
        </button>
        <div class="current-month-label">
          ${getIconSvg('calendar', { size: 18, color: '#EC407A' })}
          <span>${formatMonthYear(currentMonth)}</span>
        </div>
        <button class="nav-month-btn" id="btn-next-month" title="Próximo Mês">
          ${getIconSvg('chevron_right', { size: 20, color: 'currentColor' })}
        </button>
      </div>

      <!-- Seletor de Regime Caixa vs Competência -->
      <div class="regime-toggle-pill">
        <button class="regime-btn ${currentRegime === 'caixa' ? 'active' : ''}" data-regime="caixa">
          Regime de Caixa (Depósitos D+60/D+90)
        </button>
        <button class="regime-btn ${currentRegime === 'competencia' ? 'active' : ''}" data-regime="competencia">
          Regime de Competência (Produção)
        </button>
      </div>

      <!-- Barra de Pré-Seleção Rápida de Maternidades (Araken & Leide Morais) -->
      <div class="quick-hospitals-bar">
        <button class="quick-hospital-chip highlight" data-quick-hospital="Maternidade Araken">
          ${getIconSvg('hospital', { size: 16, color: '#EC407A' })}
          + Araken
        </button>
        <button class="quick-hospital-chip highlight" data-quick-hospital="Maternidade Leide Morais">
          ${getIconSvg('hospital', { size: 16, color: '#EC407A' })}
          + Leide Morais
        </button>
        <button class="quick-hospital-chip" data-quick-hospital="MEJEC">
          + MEJEC
        </button>
        <button class="quick-hospital-chip" data-quick-hospital="Hospital da Criança">
          + Hosp. Criança
        </button>
      </div>

      <!-- Botões de Ação Rápida Direta -->
      <div class="quick-actions-row">
        <button class="quick-action-btn coral" id="btn-quick-add-expense">
          ${getIconSvg('cart', { size: 18, color: '#FF7043' })}
          + Nova Despesa
        </button>
        <button class="quick-action-btn pink" id="btn-quick-add-shift">
          ${getIconSvg('stethoscope', { size: 18, color: '#EC407A' })}
          + Novo Plantão
        </button>
      </div>

      <!-- Conteúdo da Aba Atual -->
      <main id="main-content">
        ${contentHtml}
      </main>

      <!-- Barra de Navegação Inferior Fixa -->
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

      <!-- Drawer Lateral do Menu Hambúrguer -->
      <div class="drawer-overlay" id="hamburger-drawer">
        <div class="drawer-panel">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Menu</span>
            <button class="icon-btn" id="btn-close-drawer">
              ${getIconSvg('close', { size: 20 })}
            </button>
          </div>

          <div class="drawer-profile-card">
            <div class="avatar-badge" style="width: 52px; height: 52px;">
              ${doctorPhoto ? `<img src="${doctorPhoto}" class="avatar-img" />` : getIconSvg('stethoscope', { size: 26, color: '#EC407A' })}
            </div>
            <div>
              <strong style="font-family: var(--font-heading); font-size: 1.05rem; display: block; color: var(--text-main);">
                ${this.store.data.doctorName}
              </strong>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${this.store.data.crm || 'Médica Pediatra'}</span>
            </div>
          </div>

          <div class="drawer-menu-list">
            <button class="drawer-menu-item" id="drawer-item-profile">
              ${getIconSvg('user', { size: 20, color: '#EC407A' })}
              <div style="display: flex; flex-direction: column; text-align: left; gap: 2px;">
                <span>Editar Perfil Médico</span>
                <small style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">CRM, Especialidade e Bolsa</small>
              </div>
              <div style="margin-left: auto; color: var(--text-muted);">
                ${getIconSvg('chevron_right', { size: 16 })}
              </div>
            </button>

            <button class="drawer-menu-item" id="drawer-item-categories">
              ${getIconSvg('layers', { size: 20, color: '#FF7043' })}
              <div style="display: flex; flex-direction: column; text-align: left; gap: 2px;">
                <span>Categorização por Tipo</span>
                <small style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">6 Macro-Grupos (Alimentação, etc.)</small>
              </div>
              <div style="margin-left: auto; color: var(--text-muted);">
                ${getIconSvg('chevron_right', { size: 16 })}
              </div>
            </button>

            <button class="drawer-menu-item" id="drawer-item-hub">
              ${getIconSvg('analytics', { size: 20, color: '#26A69A' })}
              <div style="display: flex; flex-direction: column; text-align: left; gap: 2px;">
                <span>Hub de Finanças Visual</span>
                <small style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">5 Representações gráficas ricas</small>
              </div>
              <div style="margin-left: auto; color: var(--text-muted);">
                ${getIconSvg('chevron_right', { size: 16 })}
              </div>
            </button>

            <button class="drawer-menu-item" id="drawer-item-theme">
              ${getIconSvg('dark_mode', { size: 20, color: '#AB47BC' })}
              <span>Alternar Tema Claro / Escuro</span>
            </button>

            <button class="drawer-menu-item" id="drawer-item-backup">
              ${getIconSvg('save_iphone', { size: 20, color: '#FF7043' })}
              <span>Salvar Backup no iPhone</span>
            </button>

            <button class="drawer-menu-item" id="drawer-item-restore">
              ${getIconSvg('refresh', { size: 20, color: '#42A5F5' })}
              <span>Restaurar Arquivo de Backup</span>
            </button>

            <button class="drawer-menu-item danger" id="drawer-item-reset">
              ${getIconSvg('trash', { size: 20, color: '#F4511E' })}
              <span>Zerar Dados (Formatar)</span>
            </button>
          </div>

          <div class="drawer-creator-badge">
            <p>Finanças Pediatria <strong>v${APP_VERSION}</strong></p>
            <p>Criado com carinho por <strong>${APP_CREATOR}</strong></p>
          </div>
        </div>
      </div>

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

      <!-- Input Oculto de Arquivo de Backup -->
      <input type="file" id="backup-file-input" accept=".json" style="display: none;" />
    `;

    // Renderiza gráficos da aba Início
    if (this.currentTab === 'home') {
      const forecast = this.store.getForecast6Months(currentMonth);
      renderForecastChart('forecast-chart-container', forecast);

      // Renderiza Donut com o modo ativo (Macro vs Detalhado)
      const donutData = chartViewMode === 'macro' ? summary.macroBreakdown : summary.categoryBreakdown;
      renderDonutExpenses(
        'donut-chart-container',
        donutData,
        summary.totalExpenses,
        chartViewMode,
        (newMode) => {
          this.store.data.preferences.chartViewMode = newMode;
          this.store.save();
        }
      );

      // Renderiza Comparativo Caixa Real vs Produção Represada
      renderComparisonVisual(
        'comparison-chart-container',
        summary.totalIncome,
        summary.workedThisMonthTotal,
        formatMonthYear(currentMonth)
      );
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
            <div class="stat-icon mint">
              ${getIconSvg('mint_income', { size: 20, color: '#FFFFFF' })}
            </div>
            <div class="stat-info">
              <span>Total Entradas</span>
              <strong>${formatCurrency(summary.totalIncome)}</strong>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon coral">
              ${getIconSvg('coral_expense', { size: 20, color: '#FFFFFF' })}
            </div>
            <div class="stat-info">
              <span>Total Despesas</span>
              <strong>${formatCurrency(summary.totalExpenses)}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Gráfico de Previsão de 6 Meses -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('chart', { size: 20, color: '#EC407A' })}
            Previsão dos Próximos 6 Meses
          </h2>
        </div>
        <div id="forecast-chart-container"></div>
      </section>

      <!-- Gráfico de Rosca de Despesas com Macro-Grupos -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('pie', { size: 20, color: '#FF7043' })}
            Distribuição de Gastos
          </h2>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
            ${summary.expensesCount} lançamentos
          </span>
        </div>
        <div id="donut-chart-container"></div>
      </section>

      <!-- Comparativo Caixa Real vs Produção Represada -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('analytics', { size: 20, color: '#26A69A' })}
            Caixa Real vs Produção em Aberto
          </h2>
        </div>
        <div id="comparison-chart-container"></div>
      </section>
    `;
  }

  // -------------------------------------------------------------
  // ABA: GANHOS (RESIDÊNCIA & PLANTÕES EM SALA DE PARTO)
  // -------------------------------------------------------------
  renderIncomeTab(summary, currentMonth) {
    const salary = this.store.data.residencySalary;
    const isCaixa = this.store.data.preferences.regime === 'caixa';

    let relevantShifts = [];
    if (isCaixa) {
      relevantShifts = this.store.data.shifts.filter(s =>
        (s.installment1 && s.installment1.expectedDate.startsWith(currentMonth)) ||
        (s.installment2 && s.installment2.expectedDate.startsWith(currentMonth))
      );
    } else {
      relevantShifts = this.store.data.shifts.filter(s => s.date.startsWith(currentMonth));
    }

    let shiftsHtml = '';
    if (relevantShifts.length === 0) {
      shiftsHtml = `
        <div class="empty-donut-state">
          <div class="empty-icon-circle">
            ${getIconSvg('stethoscope', { size: 28, color: '#EC407A' })}
          </div>
          <p class="empty-text">Nenhum plantão registrado para este mês</p>
          <span class="empty-sub">Toque em "+ Novo Plantão" para lançar</span>
        </div>
      `;
    } else {
      shiftsHtml = relevantShifts.map(s => {
        const isInst1ThisMonth = s.installment1?.expectedDate.startsWith(currentMonth);
        const isInst2ThisMonth = s.installment2?.expectedDate.startsWith(currentMonth);

        return `
          <div class="shift-item-card">
            <div class="shift-header-row">
              <div>
                <h3 class="shift-hospital">${s.hospital}</h3>
                <span style="font-size: 0.76rem; color: var(--text-muted);">${formatDateBR(s.date)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="shift-type-badge">${s.shiftType}</span>
                <button class="expense-del-btn" data-delete-shift="${s.id}" title="Excluir Plantão">
                  ${getIconSvg('delete', { size: 16, color: 'currentColor' })}
                </button>
              </div>
            </div>

            <div class="shift-dates-row">
              <span>Valor Líquido: <strong>${formatCurrency(s.netValue)}</strong></span>
              ${s.grossValue && s.grossValue !== s.netValue ? `<span>Bruto: ${formatCurrency(s.grossValue)}</span>` : ''}
            </div>

            <div class="shift-installments-box">
              <div class="installment-col">
                <span class="inst-title">75% em D+60 (${formatDateBR(s.installment1.expectedDate)})</span>
                <strong class="inst-val">${formatCurrency(s.installment1.value)}</strong>
                <button
                  class="inst-status-btn ${s.installment1.status}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="1"
                >
                  ${s.installment1.status === 'received' ? getIconSvg('check', { size: 14 }) + ' Recebido' : 'Pendente (D+60)'}
                </button>
              </div>

              <div class="installment-col">
                <span class="inst-title">25% em D+90 (${formatDateBR(s.installment2.expectedDate)})</span>
                <strong class="inst-val">${formatCurrency(s.installment2.value)}</strong>
                <button
                  class="inst-status-btn ${s.installment2.status}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="2"
                >
                  ${s.installment2.status === 'received' ? getIconSvg('check', { size: 14 }) + ' Recebido' : 'Pendente (D+90)'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <!-- Card da Bolsa Residência -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('wallet', { size: 20, color: '#26A69A' })}
            Bolsa Residência Fixa
          </h2>
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--mint-income);">
            ${salary.active ? 'Ativa' : 'Inativa'}
          </span>
        </div>
        <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
          <span style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--mint-income);">
            ${formatCurrency(salary.value)}
          </span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">/ mês</span>
        </div>
        <span style="font-size: 0.78rem; color: var(--text-muted);">
          Creditada mensalmente todo dia ${salary.dayOfMonth || 5} sem impostos retidos
        </span>
      </section>

      <!-- Lista de Plantões do Mês -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('hospital', { size: 20, color: '#EC407A' })}
            Plantões em Sala de Parto
          </h2>
          <button class="section-action-btn" id="btn-add-shift-quick">+ Novo Plantão</button>
        </div>
        ${shiftsHtml}
      </section>
    `;
  }

  // -------------------------------------------------------------
  // ABA: DESPESAS (COM TODAS AS CATEGORIAS & SPARKLINES)
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // ABA: DESPESAS (COM TODAS AS CATEGORIAS, FILTROS & SPARKLINES)
  // -------------------------------------------------------------
  renderExpensesTab(summary, currentMonth) {
    const allMonthExpenses = this.store.data.expenses
      .filter(e => e.date.startsWith(currentMonth))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filtro por Macro-Grupo ativo
    const activeFilter = this.activeExpenseFilter || 'all';
    const monthExpenses = activeFilter === 'all'
      ? allMonthExpenses
      : allMonthExpenses.filter(e => getMacroGroupForCategory(e.category).id === activeFilter);

    const filteredTotal = monthExpenses.reduce((s, e) => s + e.value, 0);

    // Barra de Filtros por Macro-Grupo (Estilo Apps Bancários)
    const filterPillsHtml = `
      <div class="macro-filter-bar">
        <button class="macro-filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-macro-filter="all">
          <span>Todas</span>
          <span class="pill-count">${allMonthExpenses.length}</span>
        </button>
        ${MACRO_GROUPS.map(mg => {
          const count = allMonthExpenses.filter(e => getMacroGroupForCategory(e.category).id === mg.id).length;
          return `
            <button class="macro-filter-pill ${activeFilter === mg.id ? 'active' : ''}" data-macro-filter="${mg.id}">
              ${getIconSvg(mg.icon, { size: 14, color: mg.color })}
              <span>${mg.name}</span>
              ${count > 0 ? `<span class="pill-count">${count}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;

    let expensesHtml = '';
    if (monthExpenses.length === 0) {
      expensesHtml = `
        <div class="empty-donut-state">
          <div class="empty-icon-circle">
            ${getIconSvg('cart', { size: 28, color: '#FF7043' })}
          </div>
          <p class="empty-text">Nenhuma despesa encontrada ${activeFilter !== 'all' ? 'neste macro-grupo' : 'para este mês'}</p>
          <span class="empty-sub">Toque em "+ Nova Despesa" para cadastrar</span>
        </div>
      `;
    } else {
      expensesHtml = monthExpenses.map(e => {
        const catInfo = this.store.data.categories.find(c => c.name === e.category) || { icon: 'tag', color: '#AB47BC' };
        const macro = getMacroGroupForCategory(e.category);
        const pctOfTotal = summary.totalExpenses > 0 ? (e.value / summary.totalExpenses) * 100 : 0;

        return `
          <div class="expense-item-row">
            <div class="expense-item-main">
              <div class="expense-left">
                <div class="expense-icon-badge" style="background: ${catInfo.color}15; color: ${catInfo.color};">
                  ${getIconSvg(catInfo.icon, { size: 20, color: catInfo.color })}
                </div>
                <div class="expense-texts">
                  <span class="expense-desc">${e.description}</span>
                  <div class="expense-meta">
                    <span class="expense-macro-tag" style="background: ${macro.bgColor}; color: ${macro.color};">
                      ${macro.name}
                    </span>
                    <span>${e.category} • ${formatDateBR(e.date)}</span>
                  </div>
                </div>
              </div>
              <div class="expense-right">
                <span class="expense-val">${formatCurrency(e.value)}</span>
                <button class="expense-del-btn" data-delete-expense="${e.id}" title="Excluir Despesa">
                  ${getIconSvg('delete', { size: 16, color: 'currentColor' })}
                </button>
              </div>
            </div>

            <!-- Mini Sparkline do Impacto no Orçamento do Mês -->
            <div class="expense-sparkline-box">
              <div class="sparkline-track">
                <div class="sparkline-fill" style="width: ${pctOfTotal.toFixed(1)}%; background: ${catInfo.color};"></div>
              </div>
              <span class="sparkline-pct">${pctOfTotal.toFixed(1)}% do mês</span>
            </div>
          </div>
        `;
      }).join('');
    }

    const activeMacroObj = MACRO_GROUPS.find(m => m.id === activeFilter);
    const filterTitle = activeFilter === 'all' ? 'Lançamentos' : `Gastos em ${activeMacroObj.name}`;

    return `
      <!-- Resumo de Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>
            ${getIconSvg('cart', { size: 20, color: '#FF7043' })}
            Total de Despesas
          </h2>
          <button class="section-action-btn" id="btn-add-expense-quick">+ Nova Despesa</button>
        </div>
        <div style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; color: var(--coral-expense); margin-bottom: 4px;">
          ${formatCurrency(activeFilter === 'all' ? summary.totalExpenses : filteredTotal)}
        </div>
        <span style="font-size: 0.78rem; color: var(--text-muted);">
          ${activeFilter === 'all' ? 'Despesas do mês incluindo compras parceladas vigentes' : `Filtrado por ${activeMacroObj.name} (${monthExpenses.length} itens)`}
        </span>
      </section>

      <!-- Barra de Filtros Estilo Apps Bancários -->
      <section class="card-section" style="padding-bottom: 8px;">
        <div class="section-header" style="margin-bottom: 8px;">
          <h3 style="font-size: 0.86rem; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            ${getIconSvg('filter', { size: 16, color: '#EC407A' })}
            Filtrar por Macro-Grupo
          </h3>
          ${activeFilter !== 'all' ? `
            <button class="section-action-btn" data-macro-filter="all" style="font-size: 0.72rem; padding: 4px 8px;">
              Limpar Filtro
            </button>
          ` : ''}
        </div>
        ${filterPillsHtml}
      </section>

      <!-- Lista Detalhada de Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>${filterTitle} (${formatMonthYear(currentMonth).split(' de ')[0]})</h2>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700;">
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
  // SISTEMA SILK SELECT: RENDERIZADOR DE DROPDOWN & DROPUP
  // -------------------------------------------------------------
  renderCustomSelect({ id, name, value, options, isDropup = false, grouped = false, placeholder = 'Selecione...' }) {
    let selectedOption = null;
    if (grouped) {
      for (const grp of options) {
        const found = grp.items.find(i => i.value === value);
        if (found) { selectedOption = found; break; }
      }
    } else {
      selectedOption = options.find(i => i.value === value);
    }

    const currentLabel = selectedOption ? selectedOption.label : placeholder;
    const currentIcon = selectedOption ? (selectedOption.icon || 'tag') : 'tag';
    const currentColor = selectedOption ? (selectedOption.color || '#EC407A') : '#EC407A';

    let menuContent = '';
    if (grouped) {
      menuContent = options.map(grp => `
        <div class="silk-select-group-header" style="color: ${grp.color};">
          ${getIconSvg(grp.icon, { size: 14, color: grp.color })}
          <span>${grp.groupName}</span>
        </div>
        ${grp.items.map(item => `
          <div class="silk-select-item ${item.value === value ? 'selected' : ''}" data-value="${item.value}" data-label="${item.label}" data-icon="${item.icon}" data-color="${item.color}">
            <div class="silk-select-item-left">
              <span class="silk-select-badge" style="background: ${item.color}15; color: ${item.color};">
                ${getIconSvg(item.icon, { size: 14, color: item.color })}
              </span>
              <span>${item.label}</span>
            </div>
            ${item.value === value ? getIconSvg('check', { size: 14, color: '#EC407A' }) : ''}
          </div>
        `).join('')}
      `).join('');
    } else {
      menuContent = options.map(item => `
        <div class="silk-select-item ${item.value === value ? 'selected' : ''}" data-value="${item.value}" data-label="${item.label}" data-icon="${item.icon || 'tag'}" data-color="${item.color || '#EC407A'}">
          <div class="silk-select-item-left">
            ${item.icon ? `
              <span class="silk-select-badge" style="background: ${item.color || '#EC407A'}15; color: ${item.color || '#EC407A'};">
                ${getIconSvg(item.icon, { size: 14, color: item.color || '#EC407A' })}
              </span>
            ` : ''}
            <span>${item.label}</span>
          </div>
          ${item.value === value ? getIconSvg('check', { size: 14, color: '#EC407A' }) : ''}
        </div>
      `).join('');
    }

    return `
      <div class="silk-select-container ${isDropup ? 'silk-dropup' : ''}" id="container-select-${id}">
        <input type="hidden" name="${name}" id="input-${id}" value="${value}" />
        <div class="silk-select-trigger" data-silk-select="${id}" tabindex="0">
          <div class="trigger-content">
            <span class="trigger-icon" style="background: ${currentColor}15; color: ${currentColor};">
              ${getIconSvg(currentIcon, { size: 16, color: currentColor })}
            </span>
            <span class="trigger-label">${currentLabel}</span>
          </div>
          <span class="trigger-arrow">
            ${getIconSvg('chevron_down', { size: 18 })}
          </span>
        </div>
        <div class="silk-select-menu ${isDropup ? 'dropup' : ''}" id="menu-${id}">
          ${menuContent}
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // FORMULÁRIOS DO MODAL (IN-FLOW EXPANSION ANTI-CROP)
  // -------------------------------------------------------------
  renderModalContent() {
    const body = document.getElementById('modal-body-content');
    const tabs = document.querySelector('.modal-header-tabs');
    if (tabs) tabs.style.display = 'flex';
    if (!body) return;

    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-modal-tab') === this.activeModalTab);
    });

    if (this.activeModalTab === 'shift') {
      const today = getLocalDateString();
      const defaultHospital = this.prefilledHospital || 'Maternidade Araken';

      const shiftTypeOptions = [
        { value: 'Sala de Parto', label: 'Sala de Parto (D+60 75% / D+90 25%)', icon: 'baby', color: '#EC407A' },
        { value: '12h Noturno', label: '12h Noturno (Plantão Noturno)', icon: 'moon', color: '#AB47BC' },
        { value: '12h Diurno', label: '12h Diurno (Plantão Diurno)', icon: 'sun', color: '#FFA726' },
        { value: '24h', label: '24h (Plantão 24 Horas)', icon: 'hospital', color: '#26A69A' },
        { value: 'Sobreaviso', label: 'Sobreaviso (Disponibilidade Médica)', icon: 'stethoscope', color: '#42A5F5' }
      ];

      const customShiftTypeSelect = this.renderCustomSelect({
        id: 'shift-type',
        name: 'shiftType',
        value: 'Sala de Parto',
        options: shiftTypeOptions,
        isDropup: false
      });

      body.innerHTML = `
        <form id="form-new-shift">
          <div class="form-group">
            <label>Hospital / Maternidade</label>
            <input type="text" id="shift-hospital-input" name="hospital" class="form-input" value="${defaultHospital}" placeholder="Ex: Maternidade Araken" required />
            <div class="modal-hospital-pills">
              <button type="button" class="modal-hosp-pill ${defaultHospital === 'Maternidade Araken' ? 'selected' : ''}" data-modal-hosp="Maternidade Araken">Araken</button>
              <button type="button" class="modal-hosp-pill ${defaultHospital === 'Maternidade Leide Morais' ? 'selected' : ''}" data-modal-hosp="Maternidade Leide Morais">Leide Morais</button>
              <button type="button" class="modal-hosp-pill ${defaultHospital === 'MEJEC' ? 'selected' : ''}" data-modal-hosp="MEJEC">MEJEC</button>
              <button type="button" class="modal-hosp-pill ${defaultHospital === 'Hospital da Criança' ? 'selected' : ''}" data-modal-hosp="Hospital da Criança">Hosp. Criança</button>
              <button type="button" class="modal-hosp-pill ${defaultHospital === 'Hospital Mater Dei' ? 'selected' : ''}" data-modal-hosp="Hospital Mater Dei">Mater Dei</button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Data do Plantão</label>
              <input type="date" name="date" class="form-input" value="${today}" required />
            </div>
            <div class="form-group">
              <label>Tipo de Plantão</label>
              ${customShiftTypeSelect}
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

          <div style="background: var(--lilac-light); padding: 12px 14px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--lilac-accent); margin-bottom: 14px; border: 1px solid rgba(171, 71, 188, 0.2);">
            ✨ Divisão automática do plantão médico: <strong>75% em 2 meses (D+60)</strong> e <strong>25% em 3 meses (D+90)</strong>.
          </div>

          <button type="submit" class="submit-btn">Salvar Plantão</button>
        </form>
      `;

      const form = document.getElementById('form-new-shift');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const net = parseFloat(fd.get('netValue')) || 0;
        const gross = parseFloat(fd.get('grossValue')) || net;
        const shiftType = fd.get('shiftType') || document.getElementById('input-shift-type')?.value || 'Sala de Parto';

        this.store.saveShift({
          hospital: fd.get('hospital'),
          date: fd.get('date'),
          shiftType,
          netValue: net,
          grossValue: gross
        });

        this.closeModal();
        this.showToast('Plantão registrado com sucesso! 🩺✨');
      };
    } else if (this.activeModalTab === 'expense') {
      const today = getLocalDateString();

      // Opções agrupadas pelos 6 Macro-Grupos com ícones e cores
      const groupedCategoryOptions = MACRO_GROUPS.map(mg => {
        const catItems = mg.categories.map(cName => {
          const cDef = this.store.data.categories.find(c => c.name === cName) || { icon: 'tag', color: mg.color };
          return {
            value: cName,
            label: cName,
            icon: cDef.icon || 'tag',
            color: cDef.color || mg.color
          };
        });
        return {
          groupName: mg.name,
          icon: mg.icon,
          color: mg.color,
          items: catItems
        };
      });

      const customCategorySelect = this.renderCustomSelect({
        id: 'expense-category',
        name: 'category',
        value: 'Mercantil',
        options: groupedCategoryOptions,
        grouped: true,
        isDropup: true // Dropup no formulário para ergonomia anti-crop
      });

      const installmentOptions = [
        { value: '2', label: '2x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '3', label: '3x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '4', label: '4x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '5', label: '5x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '6', label: '6x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '10', label: '10x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '12', label: '12x Parcelas', icon: 'credit_card', color: '#8D6E63' },
        { value: '24', label: '24x Parcelas', icon: 'credit_card', color: '#8D6E63' }
      ];

      const customInstallmentSelect = this.renderCustomSelect({
        id: 'expense-installments',
        name: 'totalInstallments',
        value: '3',
        options: installmentOptions,
        isDropup: true
      });

      body.innerHTML = `
        <form id="form-new-expense">
          <div class="form-group">
            <label>Descrição do Gasto</label>
            <input type="text" name="description" class="form-input" placeholder="Ex: Supermercado, Aluguel, Farmácia" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoria (por Macro-Grupo)</label>
              ${customCategorySelect}
            </div>
            <div class="form-group">
              <label>Valor (R$)</label>
              <input type="number" step="0.01" name="value" class="form-input" placeholder="Ex: 150.00" required />
            </div>
          </div>

          <div class="form-group">
            <label>Data</label>
            <input type="date" name="date" class="form-input" value="${today}" required />
          </div>

          <div style="background: var(--bg-card-subtle); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--silk-border); margin-bottom: 14px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; font-weight: 700; cursor: pointer;">
              <input type="checkbox" id="check-is-installment" name="isInstallment" style="width: 18px; height: 18px; accent-color: var(--primary-pink);" />
              Compra Parcelada no Cartão
            </label>

            <div id="installment-fields" style="display: none; margin-top: 10px;">
              <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 4px;">
                Número de Parcelas
              </label>
              ${customInstallmentSelect}
            </div>
          </div>

          <button type="submit" class="submit-btn">Salvar Despesa</button>
        </form>
      `;

      const checkInst = document.getElementById('check-is-installment');
      const instFields = document.getElementById('installment-fields');
      checkInst.onchange = () => {
        instFields.style.display = checkInst.checked ? 'block' : 'none';
      };

      const form = document.getElementById('form-new-expense');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const isInst = checkInst.checked;
        const totalInstVal = fd.get('totalInstallments') || document.getElementById('input-expense-installments')?.value || '2';
        const totalInst = isInst ? parseInt(totalInstVal, 10) : 1;
        const categoryVal = fd.get('category') || document.getElementById('input-expense-category')?.value || 'Mercantil';

        this.store.saveExpense({
          description: fd.get('description'),
          category: categoryVal,
          value: parseFloat(fd.get('value')) || 0,
          date: fd.get('date'),
          isInstallment: isInst,
          totalInstallments: totalInst
        });

        this.closeModal();
        this.showToast('Despesa cadastrada! 🌸');
      };
    } else if (this.activeModalTab === 'salary') {
      const curSal = this.store.data.residencySalary;

      const activeStatusOptions = [
        { value: 'true', label: 'Bolsa Ativa', icon: 'check', color: '#26A69A' },
        { value: 'false', label: 'Pausada', icon: 'close', color: '#FF7043' }
      ];

      const customActiveSelect = this.renderCustomSelect({
        id: 'salary-active',
        name: 'active',
        value: curSal.active ? 'true' : 'false',
        options: activeStatusOptions
      });

      body.innerHTML = `
        <form id="form-salary">
          <div class="form-group">
            <label>Valor Mensal Líquido da Bolsa (R$)</label>
            <input type="number" step="0.01" name="value" class="form-input" value="${curSal.value}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Dia de Pagamento no Mês</label>
              <input type="number" min="1" max="31" name="dayOfMonth" class="form-input" value="${curSal.dayOfMonth || 5}" required />
            </div>
            <div class="form-group">
              <label>Status</label>
              ${customActiveSelect}
            </div>
          </div>

          <button type="submit" class="submit-btn">Atualizar Bolsa</button>
        </form>
      `;

      const form = document.getElementById('form-salary');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const activeVal = fd.get('active') || document.getElementById('input-salary-active')?.value || 'true';
        this.store.updateResidencySalary({
          value: fd.get('value'),
          dayOfMonth: fd.get('dayOfMonth'),
          active: activeVal === 'true'
        });

        this.closeModal();
        this.showToast('Bolsa residência atualizada! 🩺');
      };
    }
  }
}

// Inicialização automática no navegador
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new PediatricApp();
  });
}

})();

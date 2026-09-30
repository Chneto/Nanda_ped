/**
 * Finanças Pediatria v5.0 - Silk & Rose Gold Standalone Bundle
 * Self-contained for zero-CORS file:// protocol and offline execution
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */
(function() {
  'use strict';

  // --- ICONS SYSTEM ---
  /**
 * Finanças Pediatria v5.0 - Sistema de Ícones SVG Puros "Silk & Rose Gold"
 * 100% Offline, Zero-CORS, imune a falhas de CDN ou ligaturas de fontes no iOS Safari.
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
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
  delete: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
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
  menu: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="16" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>',
  user: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  format: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  analytics: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><circle cx="18" cy="7" r="2"/><circle cx="12" cy="2" r="2"/><circle cx="6" cy="11" r="2"/></svg>',
  camera: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  shield_check: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
  heart_pulse: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-3 3 6 1.5-3h5.28"/></svg>',
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
 * Finanças Pediatria v5.0 - Core Financial Engine & Store
 * Design System "Silk & Rose Gold"
 * Persistência Tripla para iOS Safari (IndexedDB + LocalStorage + Storage Persistence API)
 * Regras Canônicas Pediátricas: Residência Médica + Plantões Sala de Parto (75% D+60 / 25% D+90)
 * 6 Macro-Grupos Inteligentes de Despesas (com as 22 categorias canônicas)
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */

const APP_CREATOR = 'FChNeto';
const APP_VERSION = '5.0.0';
const STORAGE_KEY = 'financas_pediatria_v5';
const DB_NAME = 'v5_pediatric_db';
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
  return MACRO_GROUPS[5];
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
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

class PediatricStore {
  constructor() {
    this.listeners = [];
    this.db = null;
    this.data = this.getDefaultState();
    this.init();
  }

  getDefaultState() {
    return {
      creator: APP_CREATOR,
      version: APP_VERSION,
      doctorName: 'Dra. Fernanda Ch.',
      doctorCRM: 'CRM/RN',
      doctorSpecialty: 'Pediatria & Sala de Parto',
      doctorPhoto: null,
      residencySalary: {
        value: 4106.00,
        dayOfMonth: 5,
        active: true
      },
      shifts: [],
      expenses: [],
      categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
      hospitals: [...DEFAULT_HOSPITALS],
      preferences: {
        theme: 'light',
        regime: 'caixa', // 'caixa' | 'competencia'
        currentMonth: getLocalDateString().substring(0, 7)
      }
    };
  }

  init() {
    this.loadFromLocalStorage();
    this.initIndexedDB();
    this.requestPersistentStorage();
  }

  loadFromLocalStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      
      // Tenta chave v5
      let raw = localStorage.getItem(STORAGE_KEY);
      
      // Fallback para migração automática v4 / v2
      if (!raw) {
        raw = localStorage.getItem('financas_pediatria_v4') || localStorage.getItem('financas_pediatria_v2');
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.getDefaultState(),
          ...parsed,
          creator: APP_CREATOR,
          version: APP_VERSION,
          residencySalary: {
            ...this.getDefaultState().residencySalary,
            ...(parsed.residencySalary || {})
          },
          preferences: {
            ...this.getDefaultState().preferences,
            ...(parsed.preferences || {})
          }
        };

        // Garante que todas as categorias canônicas estão presentes
        const currentCatNames = (this.data.categories || []).map(c => c.name);
        DEFAULT_CATEGORIES.forEach(defCat => {
          if (!currentCatNames.includes(defCat.name)) {
            this.data.categories.push({ ...defCat });
          }
        });
      }
    } catch (e) {
      console.warn('Erro ao carregar do localStorage:', e);
    }
  }

  async initIndexedDB() {
    if (typeof indexedDB === 'undefined') return;
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.loadFromIndexedDB();
      };
      request.onerror = (e) => {
        console.warn('IndexedDB erro ao abrir:', e);
      };
    } catch (err) {
      console.warn('IndexedDB não suportado no contexto:', err);
    }
  }

  loadFromIndexedDB() {
    if (!this.db) return;
    try {
      const tx = this.db.transaction([DB_STORE], 'readonly');
      const store = tx.objectStore(DB_STORE);
      const req = store.get('root_state');
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          // Se localStorage estiver vazio, recupera do IndexedDB
          if (!this.data.shifts.length && !this.data.expenses.length && req.result.data.shifts) {
            this.data = { ...this.getDefaultState(), ...req.result.data };
            this.saveToLocalStorage();
            this.notify();
          }
        }
      };
    } catch (e) {
      console.warn('Erro ao ler do IndexedDB:', e);
    }
  }

  async requestPersistentStorage() {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        if (isPersisted) {
          console.log('Persistência tripla de armazenamento iOS ativada.');
        }
      }
    } catch (e) {
      // Silencioso em ambientes restritos
    }
  }

  save() {
    this.saveToLocalStorage();
    this.saveToIndexedDB();
    this.notify();
  }

  saveToLocalStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Erro ao gravar no localStorage:', e);
    }
  }

  saveToIndexedDB() {
    if (!this.db) return;
    try {
      const tx = this.db.transaction([DB_STORE], 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.put({ id: 'root_state', data: this.data, updatedAt: Date.now() });
    } catch (e) {
      console.warn('Erro ao gravar no IndexedDB:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.data); } catch (e) { console.error(e); }
    });
  }

  /**
   * Salva um Plantão Médico com regra canônica de Sala de Parto (75% D+60 / 25% D+90)
   */
  saveShift(shift) {
    const shiftDate = shift.date || getLocalDateString();
    const netValue = parseFloat(shift.value) || 0;
    const hospital = (shift.hospital || 'Maternidade Araken').trim();
    const shiftType = shift.shiftType || 'Sala de Parto';

    const val75 = Math.round(netValue * 0.75 * 100) / 100;
    const val25 = Math.round((netValue - val75) * 100) / 100;

    const targetMonthD60 = addMonthsToDateString(shiftDate, 2).substring(0, 7);
    const targetMonthD90 = addMonthsToDateString(shiftDate, 3).substring(0, 7);

    const newShift = {
      id: shift.id || generateId('shift'),
      hospital,
      date: shiftDate,
      shiftType,
      totalNetValue: netValue,
      notes: shift.notes || '',
      installments: [
        {
          num: 1,
          percentage: 75,
          value: val75,
          targetMonth: targetMonthD60,
          status: 'pending' // 'pending' | 'received'
        },
        {
          num: 2,
          percentage: 25,
          value: val25,
          targetMonth: targetMonthD90,
          status: 'pending'
        }
      ],
      createdAt: Date.now()
    };

    if (shift.id) {
      const idx = this.data.shifts.findIndex(s => s.id === shift.id);
      if (idx !== -1) {
        this.data.shifts[idx] = newShift;
      } else {
        this.data.shifts.unshift(newShift);
      }
    } else {
      this.data.shifts.unshift(newShift);
    }

    if (!this.data.hospitals.includes(hospital)) {
      this.data.hospitals.push(hospital);
    }

    this.save();
    return newShift;
  }

  toggleShiftInstallment(shiftId, installmentNum) {
    const shift = this.data.shifts.find(s => s.id === shiftId);
    if (!shift) return;
    const inst = shift.installments.find(i => i.num === installmentNum);
    if (!inst) return;

    inst.status = inst.status === 'received' ? 'pending' : 'received';
    this.save();
  }

  deleteShift(shiftId) {
    this.data.shifts = this.data.shifts.filter(s => s.id !== shiftId);
    this.save();
  }

  /**
   * Salva uma Despesa (à vista ou compra parcelada no tempo)
   */
  saveExpense(expense) {
    const totalVal = parseFloat(expense.value) || 0;
    const baseDate = expense.date || getLocalDateString();
    const isInstallment = !!expense.isInstallment && parseInt(expense.totalInstallments, 10) > 1;
    const totalInst = isInstallment ? parseInt(expense.totalInstallments, 10) : 1;
    const desc = (expense.description || 'Despesa').trim();
    const cat = expense.category || 'Mercantil';
    const mg = getMacroGroupForCategory(cat);

    if (!isInstallment) {
      const newExp = {
        id: expense.id || generateId('exp'),
        description: desc,
        category: cat,
        macroGroupId: mg.id,
        value: totalVal,
        date: baseDate,
        isInstallment: false,
        installmentIndex: 1,
        totalInstallments: 1,
        createdAt: Date.now()
      };

      if (expense.id) {
        const idx = this.data.expenses.findIndex(e => e.id === expense.id);
        if (idx !== -1) {
          this.data.expenses[idx] = newExp;
        } else {
          this.data.expenses.unshift(newExp);
        }
      } else {
        this.data.expenses.unshift(newExp);
      }
    } else {
      const groupId = generateId('exp_group');
      const baseInstVal = Math.floor((totalVal / totalInst) * 100) / 100;
      const firstInstVal = Math.round((totalVal - (baseInstVal * (totalInst - 1))) * 100) / 100;

      for (let i = 1; i <= totalInst; i++) {
        const instVal = i === 1 ? firstInstVal : baseInstVal;
        const instDate = addMonthsToDateString(baseDate, i - 1);

        this.data.expenses.unshift({
          id: generateId('exp'),
          groupId,
          description: `${desc} (${i}/${totalInst})`,
          rawDescription: desc,
          category: cat,
          macroGroupId: mg.id,
          value: instVal,
          date: instDate,
          isInstallment: true,
          installmentIndex: i,
          totalInstallments: totalInst,
          createdAt: Date.now()
        });
      }
    }

    this.save();
  }

  deleteExpense(expenseId) {
    const exp = this.data.expenses.find(e => e.id === expenseId);
    if (exp && exp.groupId) {
      this.data.expenses = this.data.expenses.filter(e => e.groupId !== exp.groupId);
    } else {
      this.data.expenses = this.data.expenses.filter(e => e.id !== expenseId);
    }
    this.save();
  }

  updateResidencySalary(salaryData) {
    this.data.residencySalary = {
      value: parseFloat(salaryData.value) || 0,
      dayOfMonth: parseInt(salaryData.dayOfMonth, 10) || 5,
      active: salaryData.active !== false
    };
    this.save();
  }

  updateDoctorProfile(profile) {
    if (profile.name) this.data.doctorName = profile.name.trim();
    if (profile.crm) this.data.doctorCRM = profile.crm.trim();
    if (profile.specialty) this.data.doctorSpecialty = profile.specialty.trim();
    if (typeof profile.photo !== 'undefined') this.data.doctorPhoto = profile.photo;
    this.save();
  }

  /**
   * Resumo Mensal Completo: Regime de Caixa vs Regime de Competência
   */
  getMonthlySummary(yearMonthStr) {
    const ym = yearMonthStr || this.data.preferences.currentMonth || getLocalDateString().substring(0, 7);

    // 1. Despesas do Mês
    const monthExpenses = this.data.expenses.filter(e => e.date && e.date.startsWith(ym));
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.value, 0);

    // 2. Bolsa Residência
    const salaryVal = this.data.residencySalary.active ? this.data.residencySalary.value : 0;

    // 3. Regime de Caixa (Entradas que vencem neste mês: Bolsa + Parcelas D+60 e D+90)
    let shiftInflowExpected = 0;
    let shiftInflowReceived = 0;
    let shiftInflowPending = 0;

    this.data.shifts.forEach(shift => {
      shift.installments.forEach(inst => {
        if (inst.targetMonth === ym) {
          shiftInflowExpected += inst.value;
          if (inst.status === 'received') {
            shiftInflowReceived += inst.value;
          } else {
            shiftInflowPending += inst.value;
          }
        }
      });
    });

    const totalCashInflow = salaryVal + shiftInflowExpected;
    const netCashBalance = totalCashInflow - totalExpenses;
    const realizedCashInflow = salaryVal + shiftInflowReceived;
    const realizedCashBalance = realizedCashInflow - totalExpenses;

    // 4. Regime de Competência (Produção médica trabalhada no mês)
    const monthWorkedShifts = this.data.shifts.filter(s => s.date && s.date.startsWith(ym));
    const totalWorkedProduction = monthWorkedShifts.reduce((sum, s) => sum + s.totalNetValue, 0);
    const totalAccrualIncome = salaryVal + totalWorkedProduction;
    const netAccrualBalance = totalAccrualIncome - totalExpenses;

    return {
      yearMonth: ym,
      // Caixa
      salaryVal,
      shiftInflowExpected,
      shiftInflowReceived,
      shiftInflowPending,
      totalCashInflow,
      totalExpenses,
      netCashBalance,
      realizedCashInflow,
      realizedCashBalance,
      // Competência
      totalWorkedProduction,
      workedShiftsCount: monthWorkedShifts.length,
      totalAccrualIncome,
      netAccrualBalance,
      // Despesas
      expensesList: monthExpenses
    };
  }

  /**
   * Resumo por Macro-Grupos
   */
  getMacroGroupSummary(yearMonthStr) {
    const ym = yearMonthStr || this.data.preferences.currentMonth || getLocalDateString().substring(0, 7);
    const monthExpenses = this.data.expenses.filter(e => e.date && e.date.startsWith(ym));
    const totalExp = monthExpenses.reduce((sum, e) => sum + e.value, 0);

    return MACRO_GROUPS.map(group => {
      const groupExp = monthExpenses.filter(e => {
        if (e.macroGroupId) return e.macroGroupId === group.id;
        const cat = e.category || '';
        return group.categories.some(c => c.toLowerCase() === cat.toLowerCase());
      });
      const val = groupExp.reduce((sum, e) => sum + e.value, 0);
      const pct = totalExp > 0 ? (val / totalExp) * 100 : 0;

      return {
        ...group,
        totalValue: val,
        percentage: pct,
        count: groupExp.length,
        items: groupExp
      };
    });
  }

  /**
   * Resumo por Categorias Individuais
   */
  getCategorySummary(yearMonthStr) {
    const ym = yearMonthStr || this.data.preferences.currentMonth || getLocalDateString().substring(0, 7);
    const monthExpenses = this.data.expenses.filter(e => e.date && e.date.startsWith(ym));
    const totalExp = monthExpenses.reduce((sum, e) => sum + e.value, 0);

    const catMap = {};
    monthExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.value;
    });

    return Object.entries(catMap)
      .map(([name, val]) => {
        const catDef = this.data.categories.find(c => c.name === name) || { icon: 'tag', color: '#EC407A' };
        return {
          name,
          value: val,
          percentage: totalExp > 0 ? (val / totalExp) * 100 : 0,
          icon: catDef.icon,
          color: catDef.color
        };
      })
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Previsão de Fluxo de Caixa para 6 Meses
   */
  get6MonthForecast(startYearMonthStr) {
    const startYm = startYearMonthStr || getLocalDateString().substring(0, 7);
    const startDate = `${startYm}-01`;
    const forecast = [];

    for (let i = 0; i < 6; i++) {
      const ym = addMonthsToDateString(startDate, i).substring(0, 7);
      const summary = this.getMonthlySummary(ym);
      forecast.push({
        yearMonth: ym,
        monthLabel: this.formatMonthLabel(ym),
        inflow: summary.totalCashInflow,
        expenses: summary.totalExpenses,
        netBalance: summary.netCashBalance,
        salaryVal: summary.salaryVal,
        shiftInflow: summary.shiftInflowExpected
      });
    }

    return forecast;
  }

  formatMonthLabel(yearMonthStr) {
    const [year, month] = yearMonthStr.split('-');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const idx = parseInt(month, 10) - 1;
    return `${monthNames[idx]}/${year.substring(2)}`;
  }

  exportBackup() {
    const payload = {
      exportDate: new Date().toISOString(),
      creator: APP_CREATOR,
      version: APP_VERSION,
      data: this.data
    };
    return JSON.stringify(payload, null, 2);
  }

  importBackupFromFile(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      const dataToRestore = parsed.data || parsed;
      if (!dataToRestore || typeof dataToRestore !== 'object') {
        throw new Error('Formato JSON inválido.');
      }

      this.data = {
        ...this.getDefaultState(),
        ...dataToRestore,
        creator: APP_CREATOR,
        version: APP_VERSION
      };

      this.save();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Zerar dados em 2 etapas com backup automático de segurança
   */
  resetAllData(options = { keepProfile: true, downloadBackup: true }) {
    if (options.downloadBackup) {
      this.triggerDirectBackupDownload();
    }

    const savedDoctorName = this.data.doctorName;
    const savedCRM = this.data.doctorCRM;
    const savedSpecialty = this.data.doctorSpecialty;
    const savedPhoto = this.data.doctorPhoto;

    this.data = this.getDefaultState();

    if (options.keepProfile) {
      this.data.doctorName = savedDoctorName;
      this.data.doctorCRM = savedCRM;
      this.data.doctorSpecialty = savedSpecialty;
      this.data.doctorPhoto = savedPhoto;
    }

    this.save();
  }

  triggerDirectBackupDownload() {
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;
      const json = this.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_seguranca_pediatria_${getLocalDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Backup download prevented:', e);
    }
  }
}


  // --- CHARTS ENGINE ---
  /**
 * Finanças Pediatria v5.0 - SVG Charts Engine "Silk & Rose Gold"
 * Renderização leve, responsiva e pura em SVG (Zero dependências externas)
 * Suporte a Macro-Grupos de Despesas, Rosca Inteligente, Comparativo e Calendário
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */




/**
 * Renderiza o gráfico de previsão de 6 meses (Fluxo de Caixa)
 */
function renderForecastChart(container, forecastData = []) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  if (!forecastData || forecastData.length === 0) {
    el.innerHTML = `
      <div class="empty-chart-state" style="padding: 24px; text-align: center; color: var(--text-muted);">
        ${getIconSvg('chart', { size: 36, color: '#E8A598' })}
        <p style="margin-top: 8px; font-size: 0.88rem; font-weight: 600;">Sem dados de projeção para exibir</p>
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
    const inc = d.inflow || d.income || 0;
    const exp = d.expenses || 0;
    if (inc > maxVal) maxVal = inc;
    if (exp > maxVal) maxVal = exp;
  });
  maxVal *= 1.15; // Margem superior

  const colWidth = chartW / forecastData.length;
  const barWidth = Math.min(18, colWidth * 0.36);

  let barsSvg = '';
  let labelsSvg = '';
  let gridSvg = '';

  for (let i = 1; i <= 3; i++) {
    const y = padding.top + (chartH * (i / 4));
    gridSvg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="4,4" />`;
  }

  forecastData.forEach((item, idx) => {
    const inc = item.inflow || item.income || 0;
    const exp = item.expenses || 0;
    const cx = padding.left + (idx * colWidth) + (colWidth / 2);
    const incomeH = maxVal > 0 ? (inc / maxVal) * chartH : 0;
    const expenseH = maxVal > 0 ? (exp / maxVal) * chartH : 0;

    const incomeY = padding.top + chartH - incomeH;
    const expenseY = padding.top + chartH - expenseH;

    const incomeX = cx - barWidth - 1.5;
    const expenseX = cx + 1.5;

    const lbl = item.monthLabel || item.label || '';

    barsSvg += `
      <g class="chart-group">
        <rect x="${incomeX}" y="${incomeY}" width="${barWidth}" height="${incomeH}" rx="6" fill="url(#mintGrad)" opacity="0.95">
          <title>${lbl}: Entradas ${formatCurrency(inc)}</title>
        </rect>
        <rect x="${expenseX}" y="${expenseY}" width="${barWidth}" height="${expenseH}" rx="6" fill="url(#coralGrad)" opacity="0.95">
          <title>${lbl}: Despesas ${formatCurrency(exp)}</title>
        </rect>
      </g>
    `;

    const shortLabel = lbl.slice(0, 3);
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
      <svg viewBox="0 0 ${width} ${height}" class="clean-svg-chart" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto;">
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
    const val = item.totalValue || item.value || 0;
    const pct = item.percentage || 0;
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
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
        <title>${item.name || item.category}: ${formatCurrency(val)} (${pct.toFixed(1)}%)</title>
      </circle>
    `;
    accumulatedPercent += pct;
  });

  // Legenda com as categorias / macro-grupos
  let legendHtml = '<div class="donut-legend-list">';
  breakdown.forEach(item => {
    const title = item.name || item.category;
    const val = item.totalValue || item.value || 0;
    const pct = item.percentage || 0;
    legendHtml += `
      <div class="donut-legend-row">
        <div class="donut-cat-badge" style="background-color: ${item.color}15; color: ${item.color};">
          ${getIconSvg(item.icon, { size: 16, color: item.color })}
        </div>
        <div class="donut-cat-info">
          <span class="donut-cat-name">${title}</span>
          <div class="donut-mini-bar-track">
            <div class="donut-mini-bar-fill" style="width: ${pct.toFixed(1)}%; background: ${item.color};"></div>
          </div>
          <span class="donut-cat-pct">${pct.toFixed(1)}%</span>
        </div>
        <div class="donut-cat-val">${formatCurrency(val)}</div>
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
 */
function renderMonthCalendarVisual(container, yearMonthStr, shifts = [], expenses = []) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const parts = yearMonthStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const workedShiftsMap = {};
  const incomingCreditsMap = {};
  const expensesMap = {};

  shifts.forEach(s => {
    if (s.date && s.date.startsWith(yearMonthStr)) {
      const d = parseInt(s.date.split('-')[2], 10);
      workedShiftsMap[d] = (workedShiftsMap[d] || []).concat(s);
    }
    (s.installments || []).forEach(inst => {
      if (inst.targetMonth === yearMonthStr) {
        const d = 10; // Dia padrão de fechamento de plantão
        incomingCreditsMap[d] = (incomingCreditsMap[d] || []).concat({ ...s, instNum: inst.num, val: inst.value });
      }
    });
  });

  expenses.forEach(e => {
    if (e.date && e.date.startsWith(yearMonthStr)) {
      const d = parseInt(e.date.split('-')[2], 10);
      expensesMap[d] = (expensesMap[d] || []).concat(e);
    }
  });

  const weekHeaders = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  let daysHtml = '';

  for (let i = 0; i < firstDayOfWeek; i++) {
    daysHtml += `<div class="cal-day empty"></div>`;
  }

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
      markersHtml += `<span class="marker expense" title="Despesa registrada"></span>`;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const isToday = todayStr === `${yearMonthStr}-${String(d).padStart(2, '0')}`;

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
 * Renderiza o Balanço Líquido e Taxa de Poupança
 */
function renderNetBalanceVisual(container, summary, monthLabel = '') {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const income = summary?.totalCashInflow || summary?.totalIncome || 0;
  const expense = summary?.totalExpenses || 0;
  const balance = summary?.netCashBalance ?? (income - expense);
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
 * Finanças Pediatria v5.0 - Application Controller (SPA)
 * Design System "Silk & Rose Gold"
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */







class PediatricApp {
  constructor() {
    this.store = new PediatricStore();
    this.currentTab = 'home'; // 'home' | 'income' | 'expenses'
    this.activeModalTab = 'shift'; // 'shift' | 'expense' | 'salary'
    this.prefilledHospital = '';
    this.activeExpenseFilter = 'all'; // 'all' | macro group id
    this.donutViewMode = 'macro'; // 'macro' | 'detailed'

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
      console.warn('Container #app-container não encontrado, buscando body');
      this.appEl = document.body;
    }
  }

  bindLifecycleEvents() {
    const persistHandler = () => {
      this.store.save();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', persistHandler);
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          persistHandler();
        }
      });
      window.addEventListener('beforeunload', persistHandler);
    }
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
      }
    });
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  }

  navigateMonth(direction) {
    const cur = this.store.data.preferences.currentMonth || getLocalDateString().substring(0, 7);
    const newMonth = addMonthsToDateString(`${cur}-01`, direction).substring(0, 7);
    this.store.data.preferences.currentMonth = newMonth;
    this.store.save();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const cur = this.store.data.preferences.theme || 'light';
    const next = cur === 'light' ? 'dark' : 'light';
    this.store.data.preferences.theme = next;
    this.applyTheme(next);
    this.store.save();
    this.showToast(next === 'dark' ? 'Modo Veludo Escuro Ativado 🌙' : 'Modo Silk Claro Ativado ☀️');
  }

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  openDrawer() {
    const drawer = document.getElementById('drawer-menu');
    if (drawer) drawer.classList.add('open');
  }

  closeDrawer() {
    const drawer = document.getElementById('drawer-menu');
    if (drawer) drawer.classList.remove('open');
  }

  openModal(tab = 'shift') {
    this.activeModalTab = tab;
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.add('open');
      this.renderModalContent();
    }
  }

  openModalWithHospital(hospitalName) {
    this.prefilledHospital = hospitalName;
    this.activeModalTab = 'shift';
    const modal = document.getElementById('action-modal');
    if (modal) {
      modal.classList.add('open');
      this.renderModalContent();
    }
  }

  closeModal() {
    const modal = document.getElementById('action-modal');
    if (modal) modal.classList.remove('open');
    this.prefilledHospital = '';
  }

  switchModalTab(tab) {
    this.activeModalTab = tab;
    this.renderModalContent();
  }

  handleExportBackup() {
    const jsonStr = this.store.exportBackup();
    if (navigator.share) {
      const file = new File([jsonStr], `backup_financas_pediatria_${getLocalDateString()}.json`, { type: 'application/json' });
      navigator.share({
        title: 'Backup Finanças Pediatria Dra. Fernanda Ch.',
        files: [file]
      }).catch(() => {
        this.store.triggerDirectBackupDownload();
      });
    } else {
      this.store.triggerDirectBackupDownload();
    }
    this.showToast('Backup gerado e salvo com sucesso! 📦');
  }

  handleTwoStageDataReset() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;

    modal.classList.add('open');
    const body = modal.querySelector('.modal-card-body');
    const header = modal.querySelector('.modal-tabs-header');
    if (header) header.style.display = 'none';

    body.innerHTML = `
      <div style="text-align: center; padding: 10px 0;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: #FFEBEE; color: #D32F2F; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
          ${getIconSvg('trash', { size: 30, color: '#D32F2F' })}
        </div>
        <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
          Zerar Dados do Aplicativo
        </h3>
        <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 18px;">
          Um <strong>backup preventivo (.json)</strong> será baixado automaticamente para o seu dispositivo antes de qualquer exclusão.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="drawer-menu-item" id="btn-reset-transactions" style="justify-content: center; background: #FFF3E0; border-color: #FFE082; color: #E65100;">
            ${getIconSvg('receipt', { size: 18, color: '#E65100' })} Limpar Apenas Lançamentos (Mantém Perfil)
          </button>
          <button class="drawer-menu-item danger" id="btn-reset-factory" style="justify-content: center;">
            ${getIconSvg('trash', { size: 18, color: '#D32F2F' })} Restauração de Fábrica Total
          </button>
          <button class="submit-btn" id="btn-reset-cancel" style="background: var(--bg-card-subtle); color: var(--text-main); box-shadow: none; border: 1px solid var(--silk-border);">
            Cancelar
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-reset-transactions').onclick = () => {
      this.store.resetAllData({ keepProfile: true, downloadBackup: true });
      this.closeModal();
      this.showToast('Lançamentos zerados. Perfil da médica preservado! 🩺✨');
    };

    document.getElementById('btn-reset-factory').onclick = () => {
      this.store.resetAllData({ keepProfile: false, downloadBackup: true });
      this.closeModal();
      this.showToast('Aplicativo restaurado ao estado inicial com sucesso! 🌸');
    };

    document.getElementById('btn-reset-cancel').onclick = () => {
      this.closeModal();
    };
  }

  openProfileModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;

    modal.classList.add('open');
    const header = modal.querySelector('.modal-tabs-header');
    if (header) header.style.display = 'none';

    const body = modal.querySelector('.modal-card-body');
    const doc = this.store.data;

    body.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            ${getIconSvg('user', { size: 22, color: '#EC407A' })} Perfil da Médica Pediatra
          </h3>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 22 })}
          </button>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;">
          <div class="avatar-badge" style="width: 80px; height: 80px; border-width: 3px; margin-bottom: 10px;">
            ${doc.doctorPhoto ? `<img src="${doc.doctorPhoto}" class="avatar-img" />` : getIconSvg('stethoscope', { size: 38, color: '#EC407A' })}
          </div>
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--primary-pink); cursor: pointer; display: flex; align-items: center; gap: 6px;">
            ${getIconSvg('camera', { size: 16, color: '#EC407A' })} Alterar Foto de Perfil
            <input type="file" id="doctor-photo-input" accept="image/*" style="display: none;" />
          </label>
        </div>

        <form id="form-doctor-profile">
          <div class="form-group">
            <label>Nome Completo da Médica</label>
            <input type="text" name="name" class="form-input" value="${doc.doctorName || 'Dra. Fernanda Ch.'}" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Registro Profissional (CRM)</label>
              <input type="text" name="crm" class="form-input" value="${doc.doctorCRM || 'CRM/RN'}" required />
            </div>
            <div class="form-group">
              <label>Especialidade</label>
              <input type="text" name="specialty" class="form-input" value="${doc.doctorSpecialty || 'Pediatria & Sala de Parto'}" required />
            </div>
          </div>

          <button type="submit" class="submit-btn">Salvar Perfil</button>
        </form>
      </div>
    `;

    // Processamento de Foto com Compressão via Canvas
    const photoInput = document.getElementById('doctor-photo-input');
    if (photoInput) {
      photoInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const maxSize = 200;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > maxSize) {
                  height *= maxSize / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width *= maxSize / height;
                  height = maxSize;
                }
              }

              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);

              const compressedData = canvas.toDataURL('image/jpeg', 0.82);
              this.store.updateDoctorProfile({ photo: compressedData });
              this.openProfileModal();
              this.showToast('Foto de perfil atualizada! 🌸');
            };
            img.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      };
    }

    const form = document.getElementById('form-doctor-profile');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        this.store.updateDoctorProfile({
          name: fd.get('name'),
          crm: fd.get('crm'),
          specialty: fd.get('specialty')
        });
        this.closeModal();
        this.showToast('Perfil da médica salvo com sucesso! 🩺✨');
      };
    }
  }

  openCategoriesModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;

    modal.classList.add('open');
    const header = modal.querySelector('.modal-tabs-header');
    if (header) header.style.display = 'none';

    const body = modal.querySelector('.modal-card-body');

    let groupsHtml = '';
    MACRO_GROUPS.forEach(mg => {
      let subcatsHtml = '';
      mg.categories.forEach(cName => {
        const catDef = this.store.data.categories.find(c => c.name === cName) || { icon: 'tag', color: mg.color };
        subcatsHtml += `
          <div class="macro-subcat-item">
            <span class="macro-subcat-icon" style="background: ${catDef.color}15; color: ${catDef.color};">
              ${getIconSvg(catDef.icon || 'tag', { size: 14, color: catDef.color })}
            </span>
            <span class="macro-subcat-name">${cName}</span>
          </div>
        `;
      });

      groupsHtml += `
        <div class="macro-category-card" style="border-left: 4px solid ${mg.color}; margin-bottom: 12px; background: var(--bg-card-subtle); border-radius: var(--radius-sm); padding: 12px 14px; border-top: 1px solid var(--silk-border); border-right: 1px solid var(--silk-border); border-bottom: 1px solid var(--silk-border);">
          <div class="macro-category-header" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; border-radius: var(--radius-pill); background: ${mg.color}18; color: ${mg.color}; display: flex; align-items: center; justify-content: center;">
                ${getIconSvg(mg.icon, { size: 18, color: mg.color })}
              </div>
              <div>
                <h4 style="font-family: var(--font-heading); font-size: 0.94rem; font-weight: 700; color: var(--text-main); margin: 0;">${mg.name}</h4>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 500;">${mg.categories.length} Categorias Pediátricas</span>
              </div>
            </div>
            <button class="section-action-btn" data-filter-macro-from-modal="${mg.id}" style="font-size: 0.72rem; padding: 4px 10px;">
              Ver Extrato
            </button>
          </div>
          <div class="macro-subcat-list" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--silk-border);">
            ${subcatsHtml}
          </div>
        </div>
      `;
    });

    body.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0;">
              Macro-Grupos de Despesas
            </h3>
            <p style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
              Organização inspirada no Nubank & Revolut com as 22 categorias obrigatórias
            </p>
          </div>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 22 })}
          </button>
        </div>

        <div style="max-height: 60vh; overflow-y: auto; padding-right: 4px;">
          ${groupsHtml}
        </div>
      </div>
    `;
  }

  openHubModal() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;

    modal.classList.add('open');
    const header = modal.querySelector('.modal-tabs-header');
    if (header) header.style.display = 'none';

    const body = modal.querySelector('.modal-card-body');
    const currentMonth = this.store.data.preferences.currentMonth || getLocalDateString().substring(0, 7);
    const summary = this.store.getMonthlySummary(currentMonth);

    body.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            ${getIconSvg('calendar', { size: 22, color: '#EC407A' })} Calendário & Previsão Mensal
          </h3>
          <button class="btn-modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--text-muted);">
            ${getIconSvg('close', { size: 22 })}
          </button>
        </div>

        <div id="hub-calendar-container" style="margin-bottom: 16px;"></div>

        <div id="hub-net-result-container"></div>
      </div>
    `;

    renderMonthCalendarVisual('hub-calendar-container', currentMonth, this.store.data.shifts, this.store.data.expenses);
    renderNetBalanceVisual('hub-net-result-container', summary, this.store.formatMonthLabel(currentMonth));
  }

  renderCustomSelect({ id, name, value = '', options = [], grouped = false, isDropup = false }) {
    let triggerLabel = 'Selecione...';
    let triggerIcon = '';
    let triggerColor = '#EC407A';

    let itemsHtml = '';
    if (!grouped) {
      options.forEach(opt => {
        const isSelected = String(opt.value) === String(value);
        if (isSelected) {
          triggerLabel = opt.label;
          triggerIcon = opt.icon || '';
          triggerColor = opt.color || '#EC407A';
        }
        itemsHtml += `
          <div class="silk-select-item ${isSelected ? 'selected' : ''}" data-value="${opt.value}" data-label="${opt.label}" data-icon="${opt.icon || ''}" data-color="${opt.color || ''}">
            ${opt.icon ? `<span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: ${opt.color || '#EC407A'}18; color: ${opt.color || '#EC407A'};">${getIconSvg(opt.icon, { size: 14, color: opt.color || '#EC407A' })}</span>` : ''}
            <span>${opt.label}</span>
          </div>
        `;
      });
    } else {
      options.forEach(group => {
        itemsHtml += `
          <div class="silk-select-group-header" style="color: ${group.color || '#EC407A'};">
            ${group.icon ? getIconSvg(group.icon, { size: 14, color: group.color }) : ''}
            <span>${group.groupName}</span>
          </div>
        `;
        group.items.forEach(opt => {
          const isSelected = String(opt.value) === String(value);
          if (isSelected) {
            triggerLabel = opt.label;
            triggerIcon = opt.icon || '';
            triggerColor = opt.color || '#EC407A';
          }
          itemsHtml += `
            <div class="silk-select-item ${isSelected ? 'selected' : ''}" data-value="${opt.value}" data-label="${opt.label}" data-icon="${opt.icon || ''}" data-color="${opt.color || ''}" style="padding-left: 20px;">
              ${opt.icon ? `<span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: ${opt.color || '#EC407A'}15; color: ${opt.color || '#EC407A'};">${getIconSvg(opt.icon, { size: 12, color: opt.color || '#EC407A' })}</span>` : ''}
              <span>${opt.label}</span>
            </div>
          `;
        });
      });
    }

    return `
      <div class="silk-select-container ${isDropup ? 'is-dropup' : ''}" id="container-select-${id}">
        <input type="hidden" name="${name}" id="input-${id}" value="${value}" />
        <div class="silk-select-trigger" id="trigger-select-${id}">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="trigger-icon" style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: ${triggerColor}18; color: ${triggerColor};">
              ${triggerIcon ? getIconSvg(triggerIcon, { size: 14, color: triggerColor }) : ''}
            </span>
            <span class="trigger-label">${triggerLabel}</span>
          </div>
          ${getIconSvg('chevron_down', { size: 16, color: '#A59BAE' })}
        </div>
        <div class="silk-select-menu" id="menu-select-${id}">
          ${itemsHtml}
        </div>
      </div>
    `;
  }

  render() {
    if (!this.appEl) return;

    const currentMonth = this.store.data.preferences.currentMonth || getLocalDateString().substring(0, 7);
    const summary = this.store.getMonthlySummary(currentMonth);
    const doc = this.store.data;
    const isCaixa = (doc.preferences.regime || 'caixa') === 'caixa';

    // 1. Cabeçalho com Saudação, Foto e Menu Hambúrguer
    const headerHtml = `
      <header class="app-header">
        <div class="doctor-greeting" id="btn-header-profile" title="Ver Perfil">
          <div class="avatar-badge">
            ${doc.doctorPhoto ? `<img src="${doc.doctorPhoto}" class="avatar-img" />` : getIconSvg('stethoscope', { size: 24, color: '#EC407A' })}
          </div>
          <div class="greeting-text">
            <h1>${doc.doctorName || 'Dra. Fernanda Ch.'}</h1>
            <p>${doc.doctorSpecialty || 'Pediatria & Sala de Parto'} • ${doc.doctorCRM || 'CRM/RN'}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn hamburger-btn" id="btn-hamburger-menu" title="Menu Principal">
            ${getIconSvg('menu', { size: 22, color: '#EC407A' })}
          </button>
        </div>
      </header>
    `;

    // 2. Barra de Navegação de Mês
    const monthBarHtml = `
      <div class="month-selector-bar">
        <button class="nav-month-btn" id="btn-prev-month" title="Mês Anterior">
          ${getIconSvg('chevron_left', { size: 20 })}
        </button>
        <div class="month-label-display">
          <span class="month-title">${this.store.formatMonthLabel(currentMonth)}</span>
          <span class="month-year-badge">${isCaixa ? 'Regime de Caixa' : 'Regime de Competência'}</span>
        </div>
        <button class="nav-month-btn" id="btn-next-month" title="Próximo Mês">
          ${getIconSvg('chevron_right', { size: 20 })}
        </button>
      </div>
    `;

    // 3. Seletor de Regime
    const regimeToggleHtml = `
      <div class="regime-toggle-wrapper">
        <button class="regime-btn ${isCaixa ? 'active' : ''}" data-regime="caixa">
          ${getIconSvg('wallet', { size: 16 })} Regime de Caixa (Entradas Reais)
        </button>
        <button class="regime-btn ${!isCaixa ? 'active' : ''}" data-regime="competencia">
          ${getIconSvg('stethoscope', { size: 16 })} Competência (Produção)
        </button>
      </div>
    `;

    // 4. Chips de Maternidade (Acesso Rápido)
    const quickHospitalsHtml = `
      <div class="quick-hospitals-bar">
        <button class="quick-hospital-chip highlight" data-quick-hospital="Maternidade Araken">
          ${getIconSvg('hospital', { size: 15, color: '#EC407A' })}
          + Araken
        </button>
        <button class="quick-hospital-chip highlight" data-quick-hospital="Maternidade Leide Morais">
          ${getIconSvg('hospital', { size: 15, color: '#EC407A' })}
          + Leide Morais
        </button>
        <button class="quick-hospital-chip" data-quick-hospital="MEJEC">
          + MEJEC
        </button>
        <button class="quick-hospital-chip" data-quick-hospital="Hospital da Criança">
          + Hosp. da Criança
        </button>
      </div>
    `;

    // 5. Botões de Lançamento Rápido Direto
    const quickActionsRowHtml = `
      <div class="quick-actions-row">
        <button class="quick-action-btn coral" id="btn-quick-add-expense">
          ${getIconSvg('cart', { size: 18, color: '#FFFFFF' })}
          + Nova Despesa
        </button>
        <button class="quick-action-btn pink" id="btn-quick-add-shift">
          ${getIconSvg('stethoscope', { size: 18, color: '#FFFFFF' })}
          + Novo Plantão
        </button>
      </div>
    `;

    // 6. Conteúdo Dinâmico das Abas
    let tabContentHtml = '';
    if (this.currentTab === 'home') {
      tabContentHtml = this.renderHomeTab(summary, currentMonth, isCaixa);
    } else if (this.currentTab === 'income') {
      tabContentHtml = this.renderIncomeTab(summary, currentMonth, isCaixa);
    } else if (this.currentTab === 'expenses') {
      tabContentHtml = this.renderExpensesTab(summary, currentMonth);
    }

    // 7. Barra Inferior de Navegação Fixa
    const bottomNavHtml = `
      <nav class="bottom-nav-bar">
        <button class="nav-tab-btn ${this.currentTab === 'home' ? 'active' : ''}" data-tab="home">
          ${getIconSvg('home', { size: 22, color: this.currentTab === 'home' ? '#EC407A' : '#7E7485' })}
          <span>Início</span>
        </button>
        <button class="nav-tab-btn ${this.currentTab === 'income' ? 'active' : ''}" data-tab="income">
          ${getIconSvg('payments', { size: 22, color: this.currentTab === 'income' ? '#EC407A' : '#7E7485' })}
          <span>Ganhos</span>
        </button>
        <button class="floating-add-btn" id="fab-add-btn" title="Novo Lançamento">
          ${getIconSvg('add', { size: 28, color: '#FFFFFF' })}
        </button>
        <button class="nav-tab-btn ${this.currentTab === 'expenses' ? 'active' : ''}" data-tab="expenses">
          ${getIconSvg('receipt', { size: 22, color: this.currentTab === 'expenses' ? '#EC407A' : '#7E7485' })}
          <span>Despesas</span>
        </button>
        <button class="nav-tab-btn" id="btn-nav-hub" onclick="window.app.openHubModal()">
          ${getIconSvg('calendar', { size: 22, color: '#7E7485' })}
          <span>Agenda</span>
        </button>
      </nav>
    `;

    // 8. Drawer Lateral Hambúrguer
    const drawerHtml = `
      <div class="drawer-overlay" id="drawer-menu">
        <div class="drawer-card">
          <div class="drawer-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="avatar-badge" style="width: 42px; height: 42px;">
                ${doc.doctorPhoto ? `<img src="${doc.doctorPhoto}" class="avatar-img" />` : getIconSvg('stethoscope', { size: 22, color: '#EC407A' })}
              </div>
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin: 0;">${doc.doctorName}</h3>
                <span style="font-size: 0.74rem; color: var(--text-muted);">${doc.doctorSpecialty}</span>
              </div>
            </div>
            <button class="icon-btn" id="btn-close-drawer">
              ${getIconSvg('close', { size: 20 })}
            </button>
          </div>

          <div class="drawer-menu-list">
            <button class="drawer-menu-item" id="drawer-item-profile">
              ${getIconSvg('user', { size: 18, color: '#EC407A' })} Editar Perfil da Médica
            </button>
            <button class="drawer-menu-item" id="drawer-item-categories">
              ${getIconSvg('tag', { size: 18, color: '#AB47BC' })} 6 Macro-Grupos de Despesas
            </button>
            <button class="drawer-menu-item" id="drawer-item-hub">
              ${getIconSvg('calendar', { size: 18, color: '#26A69A' })} Calendário & Previsão de Caixa
            </button>
            <button class="drawer-menu-item" id="drawer-item-theme">
              ${getIconSvg(doc.preferences.theme === 'dark' ? 'sun' : 'moon', { size: 18, color: '#FFA726' })}
              ${doc.preferences.theme === 'dark' ? 'Modo Claro (Silk)' : 'Modo Escuro (Veludo)'}
            </button>
            
            <div style="height: 1px; background: var(--silk-border); margin: 8px 0;"></div>

            <button class="drawer-menu-item" id="drawer-item-backup">
              ${getIconSvg('download', { size: 18, color: '#42A5F5' })} Fazer Backup ("Salvar no iPhone")
            </button>
            <button class="drawer-menu-item" id="drawer-item-restore">
              ${getIconSvg('upload', { size: 18, color: '#7E57C2' })} Restaurar Arquivo de Backup
            </button>
            <input type="file" id="backup-file-input" accept=".json,application/json" style="display: none;" />

            <div style="height: 1px; background: var(--silk-border); margin: 8px 0;"></div>

            <button class="drawer-menu-item danger" id="drawer-item-reset">
              ${getIconSvg('trash', { size: 18, color: '#D32F2F' })} Zerar Dados (Com Backup Prévio)
            </button>
          </div>

          <div class="drawer-footer">
            <p>Finanças Pediatria v${APP_VERSION} • Silk & Rose Gold</p>
            <p>Desenvolvido com carinho por <span class="creator-tag">${APP_CREATOR}</span></p>
          </div>
        </div>
      </div>
    `;

    // 9. Modal Central Unificado
    const modalHtml = `
      <div class="modal-overlay" id="action-modal">
        <div class="modal-card">
          <div class="modal-handle-bar"></div>
          <div class="modal-tabs-header">
            <button class="modal-tab-btn ${this.activeModalTab === 'shift' ? 'active' : ''}" data-modal-tab="shift">
              Plantão Médico
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'expense' ? 'active' : ''}" data-modal-tab="expense">
              Nova Despesa
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'salary' ? 'active' : ''}" data-modal-tab="salary">
              Bolsa Residência
            </button>
          </div>
          <div class="modal-card-body">
            <!-- Conteúdo injetado via renderModalContent -->
          </div>
        </div>
      </div>
    `;

    this.appEl.innerHTML = `
      ${headerHtml}
      ${monthBarHtml}
      ${regimeToggleHtml}
      ${quickHospitalsHtml}
      ${quickActionsRowHtml}
      <main class="app-main-content">
        ${tabContentHtml}
      </main>
      ${bottomNavHtml}
      ${drawerHtml}
      ${modalHtml}
    `;

    // Executa renderização dos gráficos após montar o DOM
    this.postRenderCharts(summary, currentMonth);
  }

  renderHomeTab(summary, currentMonth, isCaixa) {
    const heroValue = isCaixa ? summary.netCashBalance : summary.netAccrualBalance;
    const heroInflow = isCaixa ? summary.totalCashInflow : summary.totalAccrualIncome;
    const heroExpenses = summary.totalExpenses;

    return `
      <!-- Hero Balance Card -->
      <section class="hero-balance-card">
        <span class="hero-balance-tag">
          ${getIconSvg('sparkles', { size: 14, color: '#EC407A' })}
          ${isCaixa ? 'Saldo Líquido em Caixa (Mês)' : 'Produção Líquida (Competência)'}
        </span>
        <div class="hero-main-value">
          ${formatCurrency(heroValue)}
        </div>
        <div class="hero-sub-stats">
          <div class="hero-stat-box">
            <span class="hero-stat-label">
              ${getIconSvg('trending_up', { size: 14, color: '#00897B' })}
              ${isCaixa ? 'Entradas (Bolsa + D+60/90)' : 'Produção do Mês'}
            </span>
            <span class="hero-stat-val mint">${formatCurrency(heroInflow)}</span>
          </div>
          <div class="hero-stat-box">
            <span class="hero-stat-label">
              ${getIconSvg('receipt', { size: 14, color: '#F4511E' })}
              Despesas do Mês
            </span>
            <span class="hero-stat-val coral">${formatCurrency(heroExpenses)}</span>
          </div>
        </div>
      </section>

      <!-- Gráfico de Rosca das Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('pie_chart', { size: 18, color: '#EC407A' })} Despesas por Macro-Grupos</h2>
          <button class="section-action-btn" onclick="window.app.switchTab('expenses')">Ver Todas</button>
        </div>
        <div id="home-donut-chart-container"></div>
      </section>

      <!-- Gráfico de Previsão de 6 Meses -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('trending_up', { size: 18, color: '#26A69A' })} Previsão de Fluxo de Caixa (6 Meses)</h2>
        </div>
        <div id="home-forecast-chart-container"></div>
      </section>

      <!-- Comparativo Caixa Real vs Produção Represada -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('wallet', { size: 18, color: '#AB47BC' })} Caixa Disponível vs Represado</h2>
        </div>
        <div id="home-comparison-container"></div>
      </section>
    `;
  }

  renderIncomeTab(summary, currentMonth, isCaixa) {
    const salary = this.store.data.residencySalary;
    
    // Plantões relevantes para o mês
    let relevantShifts = [];
    if (isCaixa) {
      relevantShifts = this.store.data.shifts.filter(s =>
        s.installments.some(inst => inst.targetMonth === currentMonth)
      );
    } else {
      relevantShifts = this.store.data.shifts.filter(s => s.date.startsWith(currentMonth));
    }

    let shiftsHtml = '';
    if (relevantShifts.length === 0) {
      shiftsHtml = `
        <div class="empty-chart-state" style="padding: 24px; text-align: center; color: var(--text-muted);">
          ${getIconSvg('stethoscope', { size: 34, color: '#E8A598' })}
          <p class="empty-text" style="font-weight: 700; margin-top: 8px;">Nenhum plantão registrado para este mês</p>
          <span class="empty-sub" style="font-size: 0.78rem;">Toque em "+ Novo Plantão" para lançar</span>
        </div>
      `;
    } else {
      shiftsHtml = relevantShifts.map(s => {
        const inst1 = s.installments.find(i => i.num === 1);
        const inst2 = s.installments.find(i => i.num === 2);

        return `
          <div class="shift-item-card">
            <div class="shift-header-row">
              <div>
                <h3 class="shift-hospital">${s.hospital}</h3>
                <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 500;">Plantão trabalhado em ${formatDateBR(s.date)}</span>
              </div>
              <div style="text-align: right; display: flex; align-items: center; gap: 8px;">
                <span class="shift-type-badge">${s.shiftType}</span>
                <button class="expense-del-btn" data-delete-shift="${s.id}" title="Excluir Plantão">
                  ${getIconSvg('trash', { size: 16 })}
                </button>
              </div>
            </div>

            <div class="shift-dates-row">
              <span>Produção Líquida Total: <strong>${formatCurrency(s.totalNetValue)}</strong></span>
            </div>

            <div class="shift-installments-box">
              <!-- Parcela 1: 75% em D+60 -->
              <div class="inst-pill">
                <div class="inst-pill-top">
                  <span>1ª Parcela (75%)</span>
                  <span>Previsto: ${inst1.targetMonth}</span>
                </div>
                <div class="inst-val">${formatCurrency(inst1.value)}</div>
                <button
                  class="inst-status-btn ${inst1.status}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="1"
                >
                  ${inst1.status === 'received' ? '✓ Recebido' : '⏳ Pendente (D+60)'}
                </button>
              </div>

              <!-- Parcela 2: 25% em D+90 -->
              <div class="inst-pill">
                <div class="inst-pill-top">
                  <span>2ª Parcela (25%)</span>
                  <span>Previsto: ${inst2.targetMonth}</span>
                </div>
                <div class="inst-val">${formatCurrency(inst2.value)}</div>
                <button
                  class="inst-status-btn ${inst2.status}"
                  data-toggle-installment
                  data-shift-id="${s.id}"
                  data-inst-num="2"
                >
                  ${inst2.status === 'received' ? '✓ Recebido' : '⏳ Pendente (D+90)'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <!-- Card da Bolsa Residência -->
      <section class="card-section" style="background: var(--hero-gradient); border-color: var(--rose-gold);">
        <div class="section-header">
          <h2>${getIconSvg('payments', { size: 18, color: '#EC407A' })} Bolsa Residência Médica</h2>
          <button class="section-action-btn" onclick="window.app.openModal('salary')">Editar</button>
        </div>
        <div style="display: flex; align-items: baseline; justify-content: space-between;">
          <div>
            <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--text-main);">
              ${salary.active ? formatCurrency(salary.value) : 'Pausada'}
            </div>
            <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
              ${salary.active ? `Crédito regular todo dia ${salary.dayOfMonth || 5} do mês` : 'Bolsa temporariamente inativa'}
            </span>
          </div>
          <span class="shift-type-badge" style="background: #E8F5E9; color: #2E7D32;">
            ${salary.active ? 'Ativa' : 'Inativa'}
          </span>
        </div>
      </section>

      <!-- Lista de Plantões do Mês -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('stethoscope', { size: 18, color: '#EC407A' })} Plantões em Sala de Parto</h2>
          <button class="section-action-btn" id="btn-add-shift-quick">+ Novo Plantão</button>
        </div>
        ${shiftsHtml}
      </section>
    `;
  }

  renderExpensesTab(summary, currentMonth) {
    const expenses = summary.expensesList || [];
    
    // Filtro por Macro-Grupo se selecionado
    let filteredExpenses = expenses;
    if (this.activeExpenseFilter !== 'all') {
      filteredExpenses = expenses.filter(e => e.macroGroupId === this.activeExpenseFilter);
    }

    let expListHtml = '';
    if (filteredExpenses.length === 0) {
      expListHtml = `
        <div class="empty-chart-state" style="padding: 24px; text-align: center; color: var(--text-muted);">
          ${getIconSvg('cart', { size: 34, color: '#E8A598' })}
          <p class="empty-text" style="font-weight: 700; margin-top: 8px;">Nenhuma despesa para exibir neste filtro</p>
          <span class="empty-sub" style="font-size: 0.78rem;">Toque em "+ Nova Despesa" para registrar</span>
        </div>
      `;
    } else {
      expListHtml = filteredExpenses.map(e => {
        const catDef = this.store.data.categories.find(c => c.name === e.category) || { icon: 'tag', color: '#FF7043' };
        return `
          <div class="expense-item-row">
            <div class="expense-left">
              <div class="expense-icon-badge" style="background-color: ${catDef.color}15; color: ${catDef.color};">
                ${getIconSvg(catDef.icon, { size: 18, color: catDef.color })}
              </div>
              <div>
                <h4 class="expense-desc">${e.description}</h4>
                <span class="expense-cat-sub">${e.category} • ${formatDateBR(e.date)}</span>
              </div>
            </div>
            <div class="expense-right">
              <div class="expense-val">- ${formatCurrency(e.value)}</div>
              <button class="expense-del-btn" data-delete-expense="${e.id}" title="Excluir Despesa">
                ${getIconSvg('trash', { size: 16 })}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Filtros de Macro-Grupos
    const filterChipsHtml = `
      <div class="quick-hospitals-bar" style="margin: 0 0 14px 0;">
        <button class="quick-hospital-chip ${this.activeExpenseFilter === 'all' ? 'highlight' : ''}" data-macro-filter="all">
          Todos (${expenses.length})
        </button>
        ${MACRO_GROUPS.map(mg => {
          const count = expenses.filter(e => e.macroGroupId === mg.id).length;
          return `
            <button class="quick-hospital-chip ${this.activeExpenseFilter === mg.id ? 'highlight' : ''}" data-macro-filter="${mg.id}">
              ${getIconSvg(mg.icon, { size: 14, color: mg.color })}
              ${mg.name} (${count})
            </button>
          `;
        }).join('')}
      </div>
    `;

    return `
      <!-- Rosca de Despesas da Aba -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('pie_chart', { size: 18, color: '#FF7043' })} Distribuição de Gastos</h2>
          <button class="section-action-btn" id="btn-add-expense-quick">+ Nova Despesa</button>
        </div>
        <div id="expenses-tab-donut-container"></div>
      </section>

      <!-- Lista e Filtro de Despesas -->
      <section class="card-section">
        <div class="section-header">
          <h2>${getIconSvg('receipt', { size: 18, color: '#EC407A' })} Extrato de Gastos</h2>
          <button class="section-action-btn" data-macro-filter="all" style="font-size: 0.72rem; padding: 4px 8px;">Limpar Filtro</button>
        </div>
        ${filterChipsHtml}
        <div class="expenses-list-box">
          ${expListHtml}
        </div>
      </section>
    `;
  }

  postRenderCharts(summary, currentMonth) {
    if (this.currentTab === 'home') {
      const breakdown = this.donutViewMode === 'macro'
        ? this.store.getMacroGroupSummary(currentMonth)
        : this.store.getCategorySummary(currentMonth);

      renderDonutExpenses('home-donut-chart-container', breakdown, summary.totalExpenses, this.donutViewMode, (newMode) => {
        this.donutViewMode = newMode;
        this.render();
      });

      const forecast = this.store.get6MonthForecast(currentMonth);
      renderForecastChart('home-forecast-chart-container', forecast);

      const isCaixa = (this.store.data.preferences.regime || 'caixa') === 'caixa';
      const caixaReal = summary.totalCashInflow;
      const producaoRepresada = Math.max(0, summary.totalWorkedProduction - summary.shiftInflowExpected);
      renderComparisonVisual('home-comparison-container', caixaReal, producaoRepresada, this.store.formatMonthLabel(currentMonth));
    } else if (this.currentTab === 'expenses') {
      const breakdown = this.donutViewMode === 'macro'
        ? this.store.getMacroGroupSummary(currentMonth)
        : this.store.getCategorySummary(currentMonth);

      renderDonutExpenses('expenses-tab-donut-container', breakdown, summary.totalExpenses, this.donutViewMode, (newMode) => {
        this.donutViewMode = newMode;
        this.render();
      });
    }
  }

  renderModalContent() {
    const modal = document.getElementById('action-modal');
    if (!modal) return;
    const body = modal.querySelector('.modal-card-body');
    const header = modal.querySelector('.modal-tabs-header');
    if (header) header.style.display = 'flex';

    if (this.activeModalTab === 'shift') {
      const today = getLocalDateString();
      const defaultHospital = this.prefilledHospital || 'Maternidade Araken';

      const shiftTypeOptions = [
        { value: 'Sala de Parto', label: 'Sala de Parto (Padrão Pediátrico)', icon: 'baby', color: '#EC407A' },
        { value: '12h Noturno', label: '12h Noturno (Plantão Noturno)', icon: 'moon', color: '#AB47BC' },
        { value: '12h Diurno', label: '12h Diurno (Plantão Diurno)', icon: 'sun', color: '#FFA726' },
        { value: '24h', label: '24h (Plantão 24 Horas)', icon: 'hospital', color: '#26A69A' },
        { value: 'UTI Neonatal', label: 'UTI Neonatal', icon: 'stethoscope', color: '#42A5F5' }
      ];

      const customShiftTypeSelect = this.renderCustomSelect({
        id: 'shift-type',
        name: 'shiftType',
        value: 'Sala de Parto',
        options: shiftTypeOptions,
        isDropup: true
      });

      body.innerHTML = `
        <form id="form-new-shift">
          <div class="form-group">
            <label>Maternidade / Hospital</label>
            <input type="text" id="shift-hospital-input" name="hospital" class="form-input" value="${defaultHospital}" placeholder="Ex: Maternidade Araken" required />
            <div style="display: flex; gap: 6px; margin-top: 6px; overflow-x: auto; padding-bottom: 2px;">
              ${DEFAULT_HOSPITALS.map(h => `
                <button type="button" class="quick-hospital-chip modal-hosp-pill ${h === defaultHospital ? 'selected' : ''}" data-modal-hosp="${h}" style="font-size: 0.74rem; padding: 4px 10px;">
                  ${h}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Data do Plantão</label>
              <input type="date" name="date" class="form-input" value="${today}" required />
            </div>
            <div class="form-group">
              <label>Valor Líquido Total (R$)</label>
              <input type="number" step="0.01" name="value" class="form-input" placeholder="Ex: 1950.00" required />
            </div>
          </div>

          <div class="form-group">
            <label>Tipo de Plantão</label>
            ${customShiftTypeSelect}
          </div>

          <div style="background: var(--bg-card-subtle); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--silk-border); margin-bottom: 14px; font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
            ✨ Divisão automática do plantão médico: <strong>75% em 2 meses (D+60)</strong> e <strong>25% em 3 meses (D+90)</strong>.
          </div>

          <button type="submit" class="submit-btn">Salvar Plantão</button>
        </form>
      `;

      const form = document.getElementById('form-new-shift');
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const shiftType = fd.get('shiftType') || document.getElementById('input-shift-type')?.value || 'Sala de Parto';

        this.store.saveShift({
          hospital: fd.get('hospital'),
          date: fd.get('date'),
          value: parseFloat(fd.get('value')) || 0,
          shiftType
        });

        this.closeModal();
        this.showToast('Plantão registrado com sucesso! 🩺✨');
      };
    } else if (this.activeModalTab === 'expense') {
      const today = getLocalDateString();

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
        isDropup: true
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

// Inicialização resiliente e autônoma no navegador
function initPediatricApp() {
  if (typeof window !== 'undefined' && !window.app) {
    window.app = new PediatricApp();
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPediatricApp);
  } else {
    initPediatricApp();
  }
  window.addEventListener('load', initPediatricApp);
}


  // Auto-inicialização imediata e segura
  if (typeof window !== 'undefined') {
    if (!window.app && typeof PediatricApp !== 'undefined') {
      try {
        window.app = new PediatricApp();
      } catch (e) {
        console.warn('Auto-init PediatricApp:', e);
      }
    }
  }
})();

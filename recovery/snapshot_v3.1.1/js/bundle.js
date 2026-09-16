/**
 * Finanças Pediatria - Unified Standalone Bundle
 * Self-contained for zero-CORS file:// protocol and offline execution
 */
(function() {
  'use strict';

  // --- ICONS SYSTEM ---
  /**
 * Finanças Pediatria - Vector Icon System & Fallback Engine
 * Provides pixel-perfect SVG fallbacks for Material Symbols Outlined,
 * ensuring icons never degrade to raw text ligatures even if Google Fonts CDN fails,
 * network is offline, or CORS restricts external fonts.
 */

const ICON_PATHS = {
  // Navigation & Core App
  vital_signs: "M10.5 15H8l-1.5 4.5L4 12H1v-2h4l1.5 4.5L8 5h2.5l2 6.5 1.5-3 2 4.5H23v2h-7l-1.5-3.5-2 4z",
  calendar_month: "M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z",
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  account_balance_wallet: "M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  insights: "M21 18.25l-5.75-5.75-3.5 3.5L3.5 7.75l1.41-1.41 6.84 6.84 3.5-3.5 7.16 7.16-1.41 1.41zM16 6h5v5h-2V9.41l-3.5 3.5-1.41-1.41L17.59 8H16V6z",

  // Header & Controls
  notifications: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z",
  notifications_active: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6zM7.58 4.08L6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2c.15-2.65 1.51-4.97 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43c2.03 1.45 3.39 3.77 3.54 6.42z",
  desktop_windows: "M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z",
  smartphone: "M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z",
  chevron_left: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z",
  chevron_right: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  calendar_today: "M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z",
  expand_more: "M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z",
  favorite: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",

  // Pediatric & Medical Icons
  meeting_room: "M19 19V4h-4V3H5v16H3v2h12V6h2v15h4v-2h-2zm-6 0H7V5h6v14zm-3-8h2v2h-2z",
  medical_services: "M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8-2h4v2h-4V4zm8 16H4V8h16v12zm-9-3h2v-2h2v-2h-2v-2h-2v2H9v2h2v2z",
  local_hospital: "M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z",
  stethoscope: "M19 8c-.55 0-1 .45-1 1v4c0 2.76-2.24 5-5 5s-5-2.24-5-5V9c0-.55-.45-1-1-1s-1 .45-1 1v4c0 3.52 2.61 6.44 6 6.93V21h-2c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-2v-2.07c3.39-.49 6-3.41 6-6.93V9c0-.55-.45-1-1-1zm-9-5c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1V3zm10 0c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1V3z",
  child_care: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5zm4 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM7 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z",
  spa: "M12 2C8.5 5 4 9 4 14c0 4.4 3.6 8 8 8s8-3.6 8-8c0-5-4.5-9-8-12zm0 18c-3.3 0-6-2.7-6-6 0-3.3 2.9-6.3 6-9 3.1 2.7 6 5.7 6 9 0 3.3-2.7 6-6 6z",
  auto_awesome: "M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z",
  verified: "M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z",

  // Shift Types & Schedules
  wb_sunny: "M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-1 4h2v2.95h-2v-2.95zm-7.45-.96l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z",
  bedtime: "M12.3 2a10 10 0 0 0-1.9 19.8 10 10 0 0 0 10.6-12.7A10 10 0 0 1 12.3 2z",
  timelapse: "M16.24 7.76A6 6 0 1 0 19 12h-7V5a5.97 5.97 0 0 0-4.24 2.76l8.48 8.48zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z",
  ring_volume: "M23.71 16.67C20.66 13.78 16.54 12 12 12S3.34 13.78.29 16.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.33-.16.56-.5.56-.9v-3.1c1.45-.48 3-.73 4.6-.73s3.15.25 4.6.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.67 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.27-.11-.52-.29-.7zM21.16 6.26l-1.41-1.41-3.56 3.55 1.41 1.41s3.45-3.52 3.56-3.55zM13 2h-2v5h2V2zM6.4 9.81L7.81 8.4 4.26 4.84 2.84 6.26c.11.03 3.56 3.55 3.56 3.55z",
  schedule: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  event_available: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM10.56 16.09l-3.21-3.2 1.41-1.41 1.8 1.79 4.39-4.39 1.41 1.41-5.8 5.8z",
  event_upcoming: "M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13zm-7-9.5h-2v5h5v-2h-3z",
  edit_calendar: "M12 18h2v-2h-2v2zm4 0h2v-2h-2v2zm-8-4h2v-2H8v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm-8-4h2V8H8v2zm4 0h2V8h-2v2zm4 0h2V8h-2v2zm3-6h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V6h14v14z",

  // Finance & Expense Categories
  receipt_long: "M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM19 19c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14zM9 7h6v2H9V7zm7 4H9v-2h7v2zm-2 4H9v-2h5v2z",
  receipt: "M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z",
  domain: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
  school: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
  toys: "M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12H12zm0 0c0 3-2.5 5.5-5.5 5.5S1 15 1 12h11zm0 0c-3 0-5.5-2.5-5.5-5.5S9 1 12 1v11zm0 0c3 0 5.5 2.5 5.5 5.5S15 23 12 23V12z",
  local_gas_station: "M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z",
  pie_chart: "M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2 0v8.99H22c-.47-4.74-4.24-8.52-9-8.99zm0 11.01V22c4.76-.46 8.53-4.25 9-8.99H13z",
  stacked_line_chart: "M2 19.5l6-5.5 4 4 8.5-9.5H18V6h5v5h-2.5V8.5L12 16.5l-4-4-5.5 5z",

  // Actions, UI Feedback & Modals
  warning: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  search_off: "M15.5 14l5 4.99L19 20.49l-5-4.99v-.79l-.27-.28c-.89.77-2.02 1.27-3.23 1.27-2.76 0-5-2.24-5-5 0-1.21.5-2.34 1.27-3.23L1.39 4.22l1.41-1.41 18.38 18.38-1.41 1.41-4.27-4.27v-.33zM9.5 14.5c1.93 0 3.5-1.57 3.5-3.5 0-.58-.15-1.12-.41-1.6l-4.69 4.69c.48.26 1.02.41 1.6.41zM6.5 9.5c0-.58.15-1.12.41-1.6L4.69 5.68C4.26 6.78 4 7.99 4 9.5c0 3.04 2.46 5.5 5.5 5.5 1.51 0 2.72-.26 3.82-.69L11.1 12.09c-.48.26-1.02.41-1.6.41-1.93 0-3.5-1.57-3.5-3.5zM12 4.5c2.76 0 5 2.24 5 5 0 .86-.23 1.67-.62 2.38l1.47 1.47C18.57 12.19 19 10.9 19 9.5c0-3.87-3.13-7-7-7-1.4 0-2.69.43-3.85 1.15l1.47 1.47c.71-.39 1.52-.62 2.38-.62z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  check_circle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  file_download: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  forward_to_inbox: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h8v-2H4V8l8 5 8-5v5h2V6c0-1.1-.9-2-2-2zm-8 7L4 6h16l-8 5zm7 4l4 4-4 4v-3h-4v-2h4v-3z",
  content_copy: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
  restart_alt: "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
  tune: "M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z",
  undo: "M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z",
  rule: "M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z",
  save: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z",
  assignment: "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  chat: "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z",
  info: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  work: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z",
  more_vert: "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  help: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z",

  // Modern Medical & Financial App Icons
  calendar_view_month: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 11h4V6h-4v5zm6 0h4V6h-4v5zm6 0h4V6h-4v5zM4 18h4v-5H4v5zm6 0h4v-5h-4v5zm6 0h4v-5h-4v5z",
  view_list: "M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z",
  format_list_bulleted: "M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",
  print: "M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z",
  trending_up: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  percent: "M7.5 11C9.43 11 11 9.43 11 7.5S9.43 4 7.5 4 4 5.57 4 7.5 5.57 11 7.5 11zm0-5C8.33 6 9 6.67 9 7.5S8.33 9 7.5 9 6 8.33 6 7.5 6.67 6 7.5 6zm9 7c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3.79-13.71L5.29 19.29l1.41 1.41L21.71 5.71l-1.42-1.42z",
  calculate: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 2h5v2h-5V5zm-7 0h5v2H6V5zm0 4h5v2H6V9zm7 0h5v2h-5V9zm-7 4h5v2H6v-2zm7 0h5v2h-5v-2zm-7 4h5v2H6v-2zm7 0h5v2h-5v-2z",
  flag: "M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z",
  speed: "M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.43zM10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z",
  table_chart: "M10 10.02h5V21h-5zM17 21h3c1.1 0 2-.9 2-2v-9h-5v11zm3-18H5c-1.1 0-2 .9-2 2v3h19V5c0-1.1-.9-2-2-2zM3 19c0 1.1.9 2 2 2h3V10.02H3V19z",
  filter_list: "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z",
  share: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z",
  savings: "M19.83 7.5l-2.27-2.27c.07-.42.18-.81.33-1.17l-.92-.39C16.63 4.4 16.34 5 16.1 5.66L15 4.56c-.39-.39-1.02-.39-1.41 0L12 6.15 10.41 4.56c-.39-.39-1.02-.39-1.41 0L7.41 6.15C6.54 5.28 5.37 4.8 4.14 4.8H3v2h1.14c.73 0 1.43.29 1.95.81L7.5 9.02c-1.56 1.15-2.5 3.01-2.5 5.08 0 3.31 2.69 6 6 6h1v-2h-1c-2.21 0-4-1.79-4-4 0-1.39.71-2.61 1.79-3.33L10.5 12h3l.71-1.23C15.29 11.49 16 12.71 16 14.1c0 2.21-1.79 4-4 4h-1v2h1c3.31 0 6-2.69 6-6 0-1.35-.45-2.6-1.21-3.61l1.62-1.62.42.97.92-.39c-.27-.64-.52-1.35-.74-2.05h.82v-2h-.82z",
  play_circle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z",
  delete_sweep: "M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zm2-8h6v8H5v-8zm5-6H6L5 5H2v2h12V5h-3z",

  // Privacy, Clinical Notes, Fatigue & Shift Swap
  visibility: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  visibility_off: "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z",
  sticky_note_2: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10l6-6V5c0-1.1-.9-2-2-2zm-7 11H7v-2h5v2zm5-4H7V8h10v2zm-3 9v-4h4l-4 4z",
  swap_horiz: "M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z",
  self_improvement: "M12 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm8.5 14.5c-.83 0-1.5-.67-1.5-1.5 0-.25.07-.48.18-.68l-3.08-3.09c-.43-.43-1.02-.69-1.63-.73L13.5 12.3V9.67c1.33-.42 2.37-1.46 2.79-2.79l-1.9-.63c-.27.81-.98 1.43-1.89 1.43-.91 0-1.62-.62-1.89-1.43l-1.9.63c.42 1.33 1.46 2.37 2.79 2.79v2.63l-.9.2c-.61.04-1.2.3-1.63.73l-3.08 3.09c.11.2.18.43.18.68 0 .83-.67 1.5-1.5 1.5S3 18.17 3 17.34c0-.6.36-1.11.87-1.35l3.52-3.52c.7-.7 1.63-1.11 2.61-1.17V9.75c-1.78-.58-3.13-2.09-3.48-3.98l1.97-.35c.24 1.3 1.25 2.33 2.51 2.58v3.3l1 1v3.72l3.41 3.41c.24.24.57.37.91.37.7 0 1.28-.58 1.28-1.28 0-.34-.13-.67-.37-.91L16.29 15H17.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z",
  bed: "M20 9.557V3h-2v2H6V3H4v6.557C2.814 10.153 2 11.379 2 12.786V19h2v-2h16v2h2v-6.214c0-1.407-.814-2.633-2-3.229zM18 7H6V9h12V7zm2 8H4v-2.214c0-.85.69-1.54 1.54-1.54h12.92c.85 0 1.54.69 1.54 1.54V15z",
  health_and_safety: "M10.5 13H8v-3h2.5V7.5h3V10H16v3h-2.5v2.5h-3V13zM12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z",
  favorite_border: "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z",
  content_paste: "M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z",
  apple: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.66-.82 1.11-1.96.99-3.1-.99.04-2.19.66-2.89 1.48-.61.71-1.14 1.87-1 2.98 1.11.09 2.24-.55 2.9-1.36z",

  // New Category & Feature Icons
  attractions: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  restaurant: "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z",
  directions_car: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z",
  card_giftcard: "M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76V14h2V8.76L15.38 12 17 10.83 14.92 8H20v6z",
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  flight: "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
  restore_from_trash: "M19 4h-3.5l-1-1h-5l-1 1H5v2h14zM6 7v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zm8 7v4h-4v-4H8l4-4 4 4h-2z",
  celebration: "M2 22l14-5-9-9zM14.59 2.41c-.78-.78-2.05-.78-2.83 0l-1.06 1.06 3.89 3.89 1.06-1.06c.78-.78.78-2.05 0-2.83zM21.5 11.5l-1.06-1.06-3.89 3.89 1.06 1.06c.78.78 2.05.78 2.83 0l1.06-1.06c.78-.78.78-2.05 0-2.83z",
  baby_changing_station: "M14 6.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm5 1.5h-5.46l-1.08-2.15C12.13 5.3 11.4 5 10.63 5c-.75 0-1.46.29-1.98.81L5.59 8.87C5.22 9.24 5 9.75 5 10.28V15h2v-4.14l2.25-2.25L10 13v7h2v-7.86l-1.12-3.37 1.12-1.12V10h7V8z",
  person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  business: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
  mic: "M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z",
  dark_mode: "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z",
  light_mode: "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z",
  account_balance: "M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z",
  send: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
  upload_file: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z",
  vibration: "M0 15h2V9H0v6zm3 2h2V7H3v10zm19-8v6h2V9h-2zm-3 8h2V7h-2v10zM16.5 3h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM16 19H8V5h8v14z",
  contact_phone: "M22 3H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zM8 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H2v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1zm3.85-4l1.4-1.4c.15-.15.39-.15.54 0l1.66 1.66c.15.15.15.39 0 .54l-1.04 1.04c-.3.3-.77.34-1.11.11-1.33-.92-2.39-1.98-3.31-3.31-.23-.34-.19-.81.11-1.11l1.04-1.04c.15-.15.39-.15.54 0l1.66 1.66c.15.15.15.39 0 .54L17.85 14z",
  local_fire_department: "M12 12.9a3.1 3.1 0 0 0-3.1 3.1c0 1.71 1.39 3.1 3.1 3.1s3.1-1.39 3.1-3.1c0-1.71-1.39-3.1-3.1-3.1zm4.9-3.95C16.2 7.78 14.88 7 13.5 7c-.28 0-.55.03-.82.08-.94.18-1.75.72-2.26 1.48C9.5 9.87 9.17 11.23 9.4 12.6c.07.41-.21.78-.62.82-.41.04-.76-.23-.83-.64-.32-1.89.14-3.79 1.25-5.22.75-.98 1.83-1.68 3.06-1.99.39-.1.79-.15 1.19-.15 2.14 0 4.13 1.13 5.17 2.97.19.34.07.78-.27.97-.35.2-.79.08-.98-.26zM19.48 12.35c-.11-.3-.43-.48-.74-.42-.32.06-.55.33-.53.65.23 2.9-1.28 5.62-3.87 6.94-2.58 1.31-5.71.97-7.94-.87-2.22-1.83-3.14-4.85-2.31-7.65.83-2.8 3.25-4.81 6.16-5.12.32-.03.56-.31.53-.63-.03-.32-.3-.56-.63-.53C6.73 5.09 3.96 7.4 3.01 10.6c-.95 3.2.1 6.64 2.64 8.73s6.1 2.49 9.04.99c2.95-1.5 4.67-4.6 4.41-7.91-.02-.35-.29-.68-.62-.68z",
  child_friendly: "M19 13h-4.18C14.4 11.84 13.3 11 12 11c-.48 0-.93.12-1.34.32L9.42 8.74c.94-.47 2-.74 3.12-.74 1.76 0 3.37.66 4.6 1.74l1.42-1.42C16.89 6.83 14.84 6 12.54 6c-1.66 0-3.2.56-4.45 1.5l-.94-.94c-.39-.39-1.02-.39-1.41 0l-1.42 1.42c-.39.39-.39 1.02 0 1.41l.94.94C4.19 11.58 3.5 13.2 3.5 15c0 3.59 2.91 6.5 6.5 6.5 2.76 0 5.12-1.72 6.07-4.17.65.11 1.28.17 1.93.17 1.66 0 3-1.34 3-3s-1.34-3-3-3zm-9 6.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z",

  // Hamburger, Legal & Profile Photo Icons
  menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  photo_camera: "M12 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-1.8V6h-2.2L14.4 4H9.6L8.2 6H6v4.2c-1.2.9-2 2.3-2 3.8 0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5 0-1.5-.8-2.9-2-3.8zM12 19c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z",
  camera_alt: "M12 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-1.8V6h-2.2L14.4 4H9.6L8.2 6H6v4.2c-1.2.9-2 2.3-2 3.8 0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5 0-1.5-.8-2.9-2-3.8zM12 19c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z",
  policy: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  gavel: "M1 21h12v2H1zM5.245 8.07l2.83-2.827 8.99 8.99-2.83 2.828zM12.317 1l5.657 5.656-2.83 2.83-5.656-5.658zM3.83 9.485l2.83-2.828 5.656 5.656-2.828 2.83z",
  verified_user: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
  security: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
  lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
  repeat: "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
};

/**
 * Returns clean inline SVG markup for a given icon.
 * @param {string} name Material icon name
 * @param {string} extraClasses CSS classes (e.g. 'w-5 h-5 text-primary')
 * @param {string} extraStyles Optional inline CSS styles
 * @returns {string} SVG HTML string
 */
function getSvgIcon(name, extraClasses = "", extraStyles = "") {
  const path = ICON_PATHS[name] || ICON_PATHS.info || "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z";
  return `<svg class="app-icon ${extraClasses}" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="${extraStyles}" aria-hidden="true" data-icon="${name}"><path d="${path}"/></svg>`;
}

/**
 * Generates an icon element wrapper with both Material Symbols classes and inline SVG fallback.
 * @param {string} name
 * @param {string} extraClasses
 * @param {string} extraStyles
 * @returns {string}
 */
function renderIcon(name, extraClasses = "", extraStyles = "") {
  const cleanName = (name || "info").trim();
  const path = ICON_PATHS[cleanName] || ICON_PATHS.info || "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z";
  const styleAttr = extraStyles ? ` style="${extraStyles}"` : "";
  const classAttr = extraClasses ? ` ${extraClasses}` : "";
  const svg = `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" class="inline-block shrink-0 pointer-events-none" aria-hidden="true"><path d="${path}"/></svg>`;
  return `<span class="material-symbols-outlined${classAttr}" data-icon="${cleanName}"${styleAttr} aria-hidden="true">${svg}</span>`;
}

/**
 * Scans a DOM subtree and enhances any raw-text .material-symbols-outlined elements
 * with robust SVG content, preventing raw ligature text blowouts.
 * @param {HTMLElement|Document} root
 */
function enhanceIcons(root = document) {
  if (!root || !root.querySelectorAll) return;
  const icons = root.querySelectorAll(".material-symbols-outlined");
  icons.forEach(el => {
    // If element already has an SVG child, make sure it has proper data attribute
    if (el.querySelector("svg")) {
      return;
    }
    const rawText = (el.getAttribute("data-icon") || el.textContent || "").trim();
    if (rawText) {
      const path = ICON_PATHS[rawText] || ICON_PATHS.info || "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z";
      el.setAttribute("data-icon", rawText);
      el.innerHTML = `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" class="inline-block shrink-0 pointer-events-none" aria-hidden="true"><path d="${path}"/></svg>`;
    }
  });
}

/**
 * Initializes the global icon fallback system with a MutationObserver to ensure
 * dynamic views or asynchronously inserted nodes are instantly safe from text blowouts.
 */
function initIconSystem() {
  if (typeof document === "undefined") return;

  // 1. Initial pass on existing DOM
  if (document.body) {
    enhanceIcons(document.body);
  }

  // 2. MutationObserver for dynamically added nodes
  if (typeof MutationObserver !== "undefined" && document.body) {
    const observer = new MutationObserver((mutations) => {
      let needsEnhance = false;
      for (const m of mutations) {
        if (m.type === "childList" && m.addedNodes.length > 0) {
          needsEnhance = true;
          break;
        }
      }
      if (needsEnhance && document.body) {
        enhanceIcons(document.body);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

if (typeof window !== "undefined") {
  window.ICON_PATHS = ICON_PATHS;
  window.getSvgIcon = getSvgIcon;
  window.renderIcon = renderIcon;
  window.enhanceIcons = enhanceIcons;
  window.initIconSystem = initIconSystem;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initIconSystem();
      });
    } else {
      initIconSystem();
    }
  }
}


  // --- STORE ENGINE ---
  /**
 * Finanças Pediatria - Data Store & Calculation Engine
 * Criado por FChNeto
 */

const APP_CREATOR = Object.freeze({
  name: "FChNeto",
  signature: "Criado por FChNeto",
  role: "Criador e Desenvolvedor",
  app: "Finanças Pediatria",
  immutable: true
});

const DEFAULT_DOCTOR_NAME = "Dra. Pediatra";
const DEFAULT_DOCTOR_TITLE = "Pediatria & Neonatologia 🩺✨";

const EXPENSE_CATEGORIES_PF = [
  "Lazer",
  "Educação",
  "Alimentação",
  "Transporte",
  "Presentes",
  "Lar",
  "Beleza",
  "Saúde",
  "Viagens",
  "Outros (Pessoal)"
];

const EXPENSE_CATEGORIES_PJ = [
  "Consultório/Sublocação",
  "CRM/RQE/SBP",
  "Congresso & Atualização",
  "Brinquedos/Materiais Lúdicos",
  "Combustível/Plantão",
  "Impostos & Contabilidade",
  "Outros (PJ)"
];

const EXPENSE_CATEGORIES = [
  "Consultório/Sublocação",
  "CRM/RQE/SBP",
  "Congresso & Atualização",
  "Brinquedos/Materiais Lúdicos",
  "Combustível/Plantão",
  "Lazer",
  "Educação",
  "Alimentação",
  "Transporte",
  "Presentes",
  "Lar",
  "Beleza",
  "Saúde",
  "Viagens",
  "Impostos & Contabilidade",
  "Outros"
];

function getCategoryScope(category, customCategories = null) {
  if (!category || typeof category !== "string") return "pf";
  const trimmed = category.trim();

  const customs = customCategories || (typeof window !== "undefined" && window.pediatricStoreInstance ? window.pediatricStoreInstance.getCustomExpenseCategories() : null);
  if (Array.isArray(customs)) {
    const found = customs.find(c => {
      const cName = typeof c === "string" ? c : (c.name || "");
      return cName.toLowerCase() === trimmed.toLowerCase();
    });
    if (found) {
      return typeof found === "object" && found.scope ? found.scope : "pf";
    }
  }

  if (EXPENSE_CATEGORIES_PF.includes(trimmed)) return "pf";
  if (EXPENSE_CATEGORIES_PJ.includes(trimmed)) return "pj";

  const lower = trimmed.toLowerCase();
  if (
    lower.includes("pj") ||
    lower.includes("crm") ||
    lower.includes("sbp") ||
    lower.includes("rqe") ||
    lower.includes("contador") ||
    lower.includes("contabil") ||
    lower.includes("consultório") ||
    lower.includes("consultorio") ||
    lower.includes("subloca") ||
    lower.includes("plantão") ||
    lower.includes("plantao") ||
    lower.includes("imposto") ||
    lower.includes("congresso") ||
    lower.includes("lúdico") ||
    lower.includes("ludico")
  ) {
    return "pj";
  }

  return "pf";
}

const CATEGORY_COLORS = {
  "Consultório/Sublocação": "#EC407A",
  "CRM/RQE/SBP": "#26A69A",
  "Congresso & Atualização": "#AB47BC",
  "Brinquedos/Materiais Lúdicos": "#FF7043",
  "Combustível/Plantão": "#CE93D8",
  "Lazer": "#FF4081",
  "Educação": "#7C4DFF",
  "Alimentação": "#FF5252",
  "Transporte": "#448AFF",
  "Presentes": "#E040FB",
  "Lar": "#FFAB40",
  "Beleza": "#F06292",
  "Saúde": "#00BFA5",
  "Viagens": "#00E5FF",
  "Impostos & Contabilidade": "#7E57C2",
  "Contador": "#7E57C2",
  "Mercantil/Mercado": "#FF5252",
  "Lanches": "#FF7043",
  "Outros (Pessoal)": "#9C27B0",
  "Outros (PJ)": "#607D8B",
  "Outros": "#7A7E91"
};

const CATEGORY_ICONS = {
  "Consultório/Sublocação": "domain",
  "CRM/RQE/SBP": "verified",
  "Congresso & Atualização": "school",
  "Brinquedos/Materiais Lúdicos": "toys",
  "Combustível/Plantão": "local_gas_station",
  "Lazer": "attractions",
  "Educação": "school",
  "Alimentação": "restaurant",
  "Transporte": "directions_car",
  "Presentes": "card_giftcard",
  "Lar": "home",
  "Beleza": "spa",
  "Saúde": "health_and_safety",
  "Viagens": "flight",
  "Impostos & Contabilidade": "calculate",
  "Contador": "calculate",
  "Mercantil/Mercado": "shopping_cart",
  "Lanches": "restaurant",
  "Outros (Pessoal)": "receipt_long",
  "Outros (PJ)": "business",
  "Outros": "receipt_long"
};

const DEFAULT_WORK_LOCATIONS = [
  "Maternidade Araken",
  "Maternidade Leide Morais",
  "MEJEC",
  "Hospital Infantil Sabará",
  "Maternidade Pro Matre",
  "Hospital Infantil São Lucas",
  "PS Infantil Menino Jesus",
  "Maternidade Santa Joana",
  "Do meu Coração"
];

const SHIFT_HOSPITAL_SUGGESTIONS = DEFAULT_WORK_LOCATIONS;

const DEFAULT_WORK_TYPES = [
  "Plantão em Maternidade",
  "Plantão em Hospital",
  "Serviço Público",
  "Clínica",
  "Consultório Particular",
  "Home Care / Domiciliar",
  "Telemedicina",
  "Sobreaviso"
];

const SHIFT_TYPES = [
  { id: "12h Diurno", label: "12h Diurno", icon: "wb_sunny", hours: 12 },
  { id: "12h Noturno", label: "12h Noturno", icon: "bedtime", hours: 12 },
  { id: "24h Completo", label: "24h Completo", icon: "timelapse", hours: 24 },
  { id: "6h Ambulatório/PS", label: "6h Ambulatório/PS", icon: "schedule", hours: 6 },
  { id: "Sobreaviso", label: "Sobreaviso", icon: "ring_volume", hours: 12 }
];

const TAX_REGIMES = [
  { id: "pj_simples", label: "PJ Simples Nacional (6%)", name: "Simples Nacional (6%)", rate: 0.06, percentage: 6, description: "Anexo III (~6%)" },
  { id: "pj_presumido", label: "PJ Lucro Presumido (15%)", name: "Lucro Presumido (15%)", rate: 0.15, percentage: 15, description: "Retenção Hospital (~15%)" },
  { id: "pf_rpa", label: "RPA / Pessoa Física (27.5%)", name: "RPA / PF (27.5%)", rate: 0.275, percentage: 27.5, description: "IRRF 27.5% + ISS/INSS" },
  { id: "isento", label: "Direto / Cooperativa (0%)", name: "Direto / Isento (0%)", rate: 0.0, percentage: 0, description: "Sem retenção (100% Líquido)" },
  { id: "custom", label: "Personalizado", name: "Personalizado", rate: null, percentage: null, description: "Alíquota configurada manualmente" }
];

const CLINICAL_SECTORS = [
  "UTI Neonatal",
  "PS Infantil",
  "Enfermaria Pediátrica",
  "Sala de Parto / Reanimação",
  "Alojamento Conjunto",
  "Ambulatório / Consultório",
  "Outro Setor"
];

/**
 * Calculates hourly rate (R$/h) for a medical shift or consultation.
 * @param {number} netValue
 * @param {string} shiftType
 * @param {number|null} explicitHours
 * @returns {number}
 */
function calculateHourlyRate(netValue, shiftType, explicitHours = null) {
  const numVal = Number(netValue) || 0;
  if (numVal <= 0) return 0;
  if (explicitHours && Number(explicitHours) > 0) {
    return Math.round(numVal / Number(explicitHours));
  }
  let hours = 12;
  const found = SHIFT_TYPES.find(t => t.id === shiftType);
  if (found && found.hours) {
    hours = found.hours;
  } else if (typeof shiftType === "string") {
    const lower = shiftType.toLowerCase();
    if (lower.includes("24h")) hours = 24;
    else if (lower.includes("6h")) hours = 6;
    else if (lower.includes("consulta") || lower.includes("consultório") || lower.includes("consultorio") || lower.includes("puericultura") || lower.includes("atendimento")) hours = 1;
    else if (lower.includes("sobreaviso")) hours = 12;
  }
  return hours > 0 ? Math.round(numVal / hours) : 0;
}

const STORAGE_KEY = "pediatric_chic_finances_v2";

/**
 * PediatricSanctuaryDB - L2 IndexedDB Persistence Layer
 * Provides asynchronous, high-capacity background storage for receipts,
 * OFX statements, and clinical financial history without blocking the L1 synchronous loop.
 */
class PediatricSanctuaryDB {
  static dbName = "PediatricSanctuaryDB";
  static dbVersion = 1;
  static storeName = "app_state";

  init() {
    return PediatricSanctuaryDB.getDB();
  }

  saveBackup(key, data) {
    return PediatricSanctuaryDB.save(key, data);
  }

  loadBackup(key) {
    return PediatricSanctuaryDB.load(key);
  }

  static async getDB() {
    if (typeof window === "undefined" || !window.indexedDB) {
      return null;
    }
    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(this.dbName, this.dbVersion);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  static async save(key, data) {
    try {
      const db = await this.getDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        store.put(data, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (err) {
      return false;
    }
  }

  static async load(key) {
    try {
      const db = await this.getDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (err) {
      return null;
    }
  }
}

/**
 * Robust date math: Adds months to a YYYY-MM-DD string, clamping days to month-end if needed.
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {number} months
 * @returns {string} 'YYYY-MM-DD'
 */
function addMonths(dateStr, months) {
  if (!dateStr || typeof dateStr !== "string") {
    throw new Error("Invalid date string provided to addMonths");
  }
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    throw new Error(`Invalid date format '${dateStr}', expected YYYY-MM-DD`);
  }
  const [year, month, day] = parts;
  const targetYear = year + Math.floor((month - 1 + months) / 12);
  const targetMonth = ((month - 1 + months) % 12 + 12) % 12 + 1; // 1-12
  // Days in target month
  const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
  const targetDay = Math.min(day, daysInTargetMonth);

  return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
}

/**
 * Calculates the expected payment date based on shiftDate and lag in months (or custom date).
 * @param {string} shiftDate 'YYYY-MM-DD'
 * @param {number} lagMonths
 * @param {string|null} customPaymentDate 'YYYY-MM-DD'
 * @returns {string} 'YYYY-MM-DD'
 */
function calculateExpectedPaymentDate(shiftDate, lagMonths = 3, customPaymentDate = null) {
  if (customPaymentDate && typeof customPaymentDate === "string" && customPaymentDate.trim() !== "") {
    return customPaymentDate.trim();
  }
  const lag = Number(lagMonths) || 3;
  return addMonths(shiftDate, lag);
}

/**
 * Calculates installments according to pediatric rule:
 * 80% in 60 days (D+60), remaining 20% in 30 days after that (D+90). Total 100% in 90 days.
 * @param {string} shiftDate 'YYYY-MM-DD'
 * @param {number} netValue
 * @param {string|null} customPaymentDate
 * @returns {Array<{number: number, percent: number, dueDate: string, value: number, status: string, paidDate: string|null}>}
 */
function calculateShiftInstallments(shiftDate, netValue, customPaymentDate = null) {
  const numNet = Number(netValue) || 0;
  if (customPaymentDate && typeof customPaymentDate === "string" && customPaymentDate.trim() !== "") {
    return [
      {
        number: 1,
        percent: 100,
        dueDate: customPaymentDate.trim(),
        value: numNet,
        status: "pending",
        paidDate: null
      }
    ];
  }
  const d60 = addMonths(shiftDate, 2);
  const d90 = addMonths(shiftDate, 3);
  const part1 = Math.round(numNet * 0.80 * 100) / 100;
  const part2 = Math.round((numNet - part1) * 100) / 100;

  return [
    {
      number: 1,
      percent: 80,
      dueDate: d60,
      value: part1,
      status: "pending",
      paidDate: null
    },
    {
      number: 2,
      percent: 20,
      dueDate: d90,
      value: part2,
      status: "pending",
      paidDate: null
    }
  ];
}

/**
 * Formats a Date object to YYYY-MM-DD in local time
 * @param {Date|string} referenceDate
 * @returns {string} YYYY-MM-DD
 */
function getLocalDateString(referenceDate = new Date()) {
  if (referenceDate instanceof Date) {
    const y = referenceDate.getFullYear();
    const m = String(referenceDate.getMonth() + 1).padStart(2, "0");
    const d = String(referenceDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(referenceDate).slice(0, 10);
}

/**
 * Evaluates the status of a shift based on current reference date.
 * If status is 'received', it stays received.
 * If current date > expectedPaymentDate and status is not received, it is "delayed" (Atrasado).
 * @param {object} shift
 * @param {Date|string} referenceDate
 * @returns {{status: 'pending'|'received'|'delayed', label: string, delayDays: number, isDelayed: boolean}}
 */
function evaluateShiftStatus(shift, referenceDate = new Date()) {
  const refDateStr = getLocalDateString(referenceDate);

  // If this item is a specific installment (e.g. from cash flow radar)
  if (shift.isInstallment) {
    if (shift.installmentStatus === "received" || shift.status === "received") {
      const paidLabel = shift.paidDate ? `Recebido em ${formatDateBR(shift.paidDate)}` : "Recebido";
      return {
        status: "received",
        label: paidLabel,
        delayDays: 0,
        isDelayed: false
      };
    }
    const dueDateStr = shift.installmentDueDate || shift.expectedPaymentDate;
    if (refDateStr > dueDateStr) {
      const [y1, m1, d1] = refDateStr.split("-").map(Number);
      const [y2, m2, d2] = dueDateStr.split("-").map(Number);
      const utc1 = Date.UTC(y1, m1 - 1, d1);
      const utc2 = Date.UTC(y2, m2 - 1, d2);
      const delayDays = Math.max(1, Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24)));
      return {
        status: "delayed",
        label: `Atrasado (+${delayDays}d)`,
        delayDays,
        isDelayed: true
      };
    }
    const percent = shift.installmentPercent || (shift.installmentNumber === 1 ? 80 : 20);
    const daysLabel = shift.installmentNumber === 1 ? '60 dias' : '90 dias';
    return {
      status: "pending",
      label: `Previsão: ${formatDateBR(dueDateStr)} (${percent}% em ${daysLabel})`,
      delayDays: 0,
      isDelayed: false
    };
  }

  // Full shift evaluation
  if (shift.status === "received" || shift.isPaid === true) {
    const paidLabel = shift.paidDate ? `Recebido em ${formatDateBR(shift.paidDate)}` : "Recebido";
    return {
      status: "received",
      label: paidLabel,
      delayDays: 0,
      isDelayed: false
    };
  }

  // Check if shift has split installments with pending delay
  if (shift.splitPayment && Array.isArray(shift.installments) && shift.installments.length > 0) {
    const allRecv = shift.installments.every(i => i.status === "received");
    if (allRecv) {
      const paidLabel = shift.paidDate ? `Recebido em ${formatDateBR(shift.paidDate)}` : "Recebido";
      return { status: "received", label: paidLabel, delayDays: 0, isDelayed: false };
    }

    // Find earliest overdue pending installment
    const overdueInst = shift.installments.find(i => i.status !== "received" && refDateStr > i.dueDate);
    if (overdueInst) {
      const [y1, m1, d1] = refDateStr.split("-").map(Number);
      const [y2, m2, d2] = overdueInst.dueDate.split("-").map(Number);
      const utc1 = Date.UTC(y1, m1 - 1, d1);
      const utc2 = Date.UTC(y2, m2 - 1, d2);
      const delayDays = Math.max(1, Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24)));
      return {
        status: "delayed",
        label: `Atrasado (+${delayDays}d)`,
        delayDays,
        isDelayed: true
      };
    }

    const anyRecv = shift.installments.some(i => i.status === "received");
    if (anyRecv) {
      const pendingInst = shift.installments.find(i => i.status !== "received");
      return {
        status: "partial",
        label: pendingInst ? `Parcial (restante em ${formatDateBR(pendingInst.dueDate)})` : "Parcial",
        delayDays: 0,
        isDelayed: false
      };
    }

    return {
      status: "pending",
      label: `Previsão: 80% D+60 • 20% D+90`,
      delayDays: 0,
      isDelayed: false
    };
  }

  const expectedStr = shift.expectedPaymentDate;
  if (refDateStr > expectedStr) {
    const [y1, m1, d1] = refDateStr.split("-").map(Number);
    const [y2, m2, d2] = expectedStr.split("-").map(Number);
    const utc1 = Date.UTC(y1, m1 - 1, d1);
    const utc2 = Date.UTC(y2, m2 - 1, d2);
    const delayDays = Math.max(1, Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24)));
    return {
      status: "delayed",
      label: `Atrasado (+${delayDays}d)`,
      delayDays,
      isDelayed: true
    };
  }

  const lagMonths = shift.paymentLagMonths || 3;
  return {
    status: "pending",
    label: `Previsão: ${formatDateBR(expectedStr)} (D+${lagMonths * 30})`,
    delayDays: 0,
    isDelayed: false
  };
}

/**
 * Helper to format date YYYY-MM-DD to DD/MM/YYYY or DD de Mês
 */
function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatMonthYear(monthStr) {
  // '2026-09' -> 'Setembro 2026'
  const [year, month] = monthStr.split("-").map(Number);
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return `${monthNames[month - 1]} ${year}`;
}

function formatCurrency(val) {
  const num = Number(val) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Clean initial data for a real user starting fresh.
 */
function getInitialData() {
  return {
    doctorName: DEFAULT_DOCTOR_NAME,
    doctorTitle: DEFAULT_DOCTOR_TITLE,
    doctorCrm: "CRM-SP • Pediatria",
    doctorPhoto: null,
    monthlyBudgetLimit: 10000,
    monthlyIncomeGoal: 25000,
    workLocations: [...DEFAULT_WORK_LOCATIONS],
    workTypes: [...DEFAULT_WORK_TYPES],
    activeWorkTypes: ["Plantão em Maternidade", "Plantão em Hospital", "Serviço Público"],
    customExpenseCategories: [],
    defaultTaxRate: 15,
    fixedSalaries: [],
    shifts: [],
    expenses: [],
    consultations: [],
    trash: []
  };
}

/**
 * Demonstration sample data for exploration and automated tests.
 */
function getDemoData() {
  return {
    doctorName: "Dra. Fernanda Ch.",
    doctorTitle: "Pediatria & Neonatologia 🩺✨",
    doctorCrm: "CRM-SP 214.890 • RQE 98.412",
    doctorPhoto: null,
    monthlyBudgetLimit: 12000,
    monthlyIncomeGoal: 25000,
    workLocations: [...DEFAULT_WORK_LOCATIONS],
    workTypes: [...DEFAULT_WORK_TYPES],
    activeWorkTypes: ["Plantão em Maternidade", "Plantão em Hospital", "Serviço Público"],
    customExpenseCategories: [
      { id: "cat_demo_1", name: "Contador", scope: "pj", color: "#7E57C2", icon: "calculate" },
      { id: "cat_demo_2", name: "Mercantil/Mercado", scope: "pf", color: "#FF5252", icon: "restaurant" }
    ],
    defaultTaxRate: 15,
    trash: [],
    fixedSalaries: [
      { id: "s1", description: "Pediatra Consultório", value: 8500, dayOfMonth: 5 }
    ],
    shifts: [
      {
        id: "sh1",
        hospital: "Do meu Coração",
        shiftDate: "2026-06-10",
        shiftType: "12h Noturno",
        sector: "UTI Neonatal",
        grossValue: 2200,
        netValue: 1950,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Escala fixa semanal UTI Neonatal",
        paymentLagMonths: 3, // Padrão D+90
        expectedPaymentDate: "2026-09-10", // Calculado automaticamente
        status: "pending", // "pending" | "received" | "delayed"
        paidDate: null
      },
      {
        id: "sh2",
        hospital: "Hospital Infantil Sabará",
        shiftDate: "2026-06-15",
        shiftType: "12h Diurno",
        sector: "PS Infantil",
        grossValue: 3800,
        netValue: 3230,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Plantão pronto-socorro infantil",
        paymentLagMonths: 3,
        expectedPaymentDate: "2026-09-15",
        status: "pending",
        paidDate: null
      },
      {
        id: "sh3",
        hospital: "Maternidade Pro Matre",
        shiftDate: "2026-05-20",
        shiftType: "24h Completo",
        sector: "Sala de Parto / Reanimação",
        grossValue: 5200,
        netValue: 4420,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Reanimação neonatal e sala de parto",
        paymentLagMonths: 3,
        expectedPaymentDate: "2026-08-20",
        status: "received",
        paidDate: "2026-08-20"
      },
      {
        id: "sh4",
        hospital: "Hospital Infantil São Lucas",
        shiftDate: "2026-07-08",
        shiftType: "12h Diurno",
        sector: "Enfermaria Pediátrica",
        grossValue: 3400,
        netValue: 2890,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Evolução clínica leitos pediátricos",
        paymentLagMonths: 3,
        expectedPaymentDate: "2026-10-08",
        status: "pending",
        paidDate: null
      },
      {
        id: "sh5",
        hospital: "PS Infantil Menino Jesus",
        shiftDate: "2026-07-22",
        shiftType: "12h Noturno",
        sector: "PS Infantil",
        grossValue: 2950,
        netValue: 2500,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Emergências pediátricas",
        paymentLagMonths: 2,
        expectedPaymentDate: "2026-09-22",
        status: "pending",
        paidDate: null
      },
      {
        id: "sh6",
        hospital: "Maternidade Santa Joana",
        shiftDate: "2026-08-05",
        shiftType: "12h Diurno",
        sector: "Alojamento Conjunto",
        grossValue: 3600,
        netValue: 3060,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Triagem e alta neonatal",
        paymentLagMonths: 3,
        expectedPaymentDate: "2026-11-05",
        status: "pending",
        paidDate: null
      },
      {
        id: "sh7",
        hospital: "Hospital Infantil Sabará",
        shiftDate: "2026-09-02",
        shiftType: "12h Diurno",
        sector: "UTI Neonatal",
        grossValue: 3800,
        netValue: 3230,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Plantão diurno UTI",
        paymentLagMonths: 3,
        expectedPaymentDate: "2026-12-02",
        status: "pending",
        paidDate: null
      },
      {
        id: "sh8",
        hospital: "Do meu Coração",
        shiftDate: "2026-09-08",
        shiftType: "12h Noturno",
        sector: "PS Infantil",
        grossValue: 2400,
        netValue: 2040,
        taxRegime: "pj_presumido",
        taxRate: 0.15,
        notes: "Plantão noturno PS",
        paymentLagMonths: 1,
        expectedPaymentDate: "2026-10-08",
        status: "pending",
        paidDate: null
      }
    ],
    expenses: [
      {
        id: "e1",
        description: "Anuidade CRM / SBP",
        category: "CRM/RQE/SBP",
        type: "fixed",
        value: 380,
        dueDate: "2026-06-15",
        isPaid: true
      },
      {
        id: "e2",
        description: "Aluguel Consultório Sublocação",
        category: "Consultório/Sublocação",
        type: "fixed",
        value: 2400,
        dueDate: "2026-09-10",
        isPaid: true
      },
      {
        id: "e3",
        description: "Anuidade CRM-SP (Parcela 09)",
        category: "CRM/RQE/SBP",
        type: "fixed",
        value: 380,
        dueDate: "2026-09-15",
        isPaid: true
      },
      {
        id: "e4",
        description: "Brinquedos, Adesivos & Mimos",
        category: "Brinquedos/Materiais Lúdicos",
        type: "variable",
        value: 290,
        dueDate: "2026-09-18",
        isPaid: false
      },
      {
        id: "e5",
        description: "Combustível & Estacionamento Plantões",
        category: "Combustível/Plantão",
        type: "variable",
        value: 460,
        dueDate: "2026-09-25",
        isPaid: false
      },
      {
        id: "e6",
        description: "Inscrição Congresso Pediatria SBP",
        category: "Congresso & Atualização",
        type: "variable",
        value: 850,
        dueDate: "2026-09-28",
        isPaid: false
      },
      {
        id: "e7",
        description: "Seguro RC Profissional Pediatria",
        category: "Outros",
        type: "fixed",
        value: 320,
        dueDate: "2026-09-05",
        isPaid: true
      }
    ],
    consultations: [
      {
        id: "c1",
        patientName: "Bebê Gael",
        parentName: "Mariana Silva",
        type: "Plano Puericultura 1º Ano",
        date: "2026-08-20",
        durationMinutes: 60,
        grossValue: 450,
        netValue: 450,
        taxRate: 0,
        paymentStatus: "received",
        paymentDate: "2026-08-20",
        ageMonths: 2,
        planInstallment: "2/12",
        notes: "Consulta puericultura 2º mês - ganho ponderal adequado, amamentação exclusiva."
      },
      {
        id: "c2",
        patientName: "Helena Castro",
        parentName: "Rodrigo Castro",
        type: "Consulta Particular",
        date: "2026-10-05",
        durationMinutes: 60,
        grossValue: 400,
        netValue: 400,
        taxRate: 0,
        paymentStatus: "received",
        paymentDate: "2026-10-05",
        ageMonths: 6,
        planInstallment: "Avulsa",
        notes: "Introdução alimentar e orientação nutricional."
      }
    ]
  };
}

/**
 * Storage Manager Class
 */
class PediatricStore {
  constructor(storageKey = STORAGE_KEY, initialData = null) {
    this.storageKey = storageKey;
    this.data = this.load(initialData);
  }

  load(fallbackData = null) {
    if (typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.shifts) && Array.isArray(parsed.expenses)) {
            if (!Array.isArray(parsed.consultations)) {
              parsed.consultations = [];
            }
            return parsed;
          }
        }
      } catch (err) {
        console.warn("Could not read localStorage:", err);
      }
    }
    return fallbackData || getInitialData();
  }

  save() {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      } catch (err) {
        console.error("Could not write to localStorage:", err);
      }
    }
    // L2 Dual-Engine: Asynchronous IndexedDB background persistence
    if (typeof window !== "undefined" && window.indexedDB) {
      PediatricSanctuaryDB.save(this.storageKey, this.data).catch(() => {});
    }
  }

  resetToDefault() {
    this.data = getInitialData();
    this.save();
    return this.data;
  }

  loadDemoData() {
    this.data = getDemoData();
    this.save();
    return this.data;
  }

  // --- Shifts Operations ---

  addShift(shift) {
    const lagMonths = Number(shift.paymentLagMonths) || 3;
    const expectedPaymentDate = calculateExpectedPaymentDate(
      shift.shiftDate,
      lagMonths,
      shift.customPaymentDate
    );

    const grossValue = Number(shift.grossValue) || 0;
    const taxRegime = shift.taxRegime || "Simples Nacional (6%)";
    const regLower = String(taxRegime).toLowerCase();
    let defaultRate = 0.15;
    if (regLower.includes("simples")) defaultRate = 0.06;
    else if (regLower.includes("isento") || regLower.includes("direto")) defaultRate = 0.0;
    else if (regLower.includes("rpa") || regLower.includes("física")) defaultRate = 0.275;

    let taxRateVal = shift.taxRate !== undefined ? Number(shift.taxRate) : defaultRate;
    const effectiveDecimalRate = taxRateVal > 1 ? (taxRateVal / 100) : taxRateVal;
    const defaultNet = grossValue * (1 - effectiveDecimalRate);
    const netValue = shift.netValue !== undefined ? Number(shift.netValue) : defaultNet;

    // Pediatric standard formula: 80% in 60 days (D+60) and 20% in 90 days (D+90)
    const isSplit = shift.splitPayment !== false && !shift.customPaymentDate && (!shift.paymentLagMonths || Number(shift.paymentLagMonths) === 3);
    const installments = isSplit
      ? calculateShiftInstallments(shift.shiftDate, netValue, shift.customPaymentDate)
      : (shift.installments || null);

    const newShift = {
      id: shift.id || "sh_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      hospital: shift.hospital.trim(),
      shiftDate: shift.shiftDate,
      shiftType: shift.shiftType || "12h Diurno",
      workType: shift.workType || "Plantão em Maternidade",
      sector: shift.sector || "UTI Neonatal",
      grossValue,
      netValue,
      taxRegime,
      taxRate: taxRateVal,
      notes: shift.notes ? String(shift.notes).trim() : "",
      paymentLagMonths: lagMonths,
      customPaymentDate: shift.customPaymentDate || null,
      expectedPaymentDate,
      splitPayment: isSplit,
      installments,
      status: shift.status || "pending",
      paidDate: shift.paidDate || null
    };

    this.data.shifts.unshift(newShift);
    this.save();
    return newShift;
  }

  updateShift(id, updates) {
    const index = this.data.shifts.findIndex(s => s.id === id);
    if (index === -1) return null;

    const current = this.data.shifts[index];
    const lagMonths = updates.paymentLagMonths !== undefined
      ? Number(updates.paymentLagMonths)
      : current.paymentLagMonths;

    const shiftDate = updates.shiftDate || current.shiftDate;
    const customDate = updates.customPaymentDate !== undefined
      ? updates.customPaymentDate
      : current.customPaymentDate;

    const expectedPaymentDate = calculateExpectedPaymentDate(shiftDate, lagMonths, customDate);
    const netValue = updates.netValue !== undefined ? Number(updates.netValue) : current.netValue;

    const isSplit = updates.splitPayment !== undefined
      ? Boolean(updates.splitPayment)
      : (current.splitPayment !== false && !customDate && (!lagMonths || Number(lagMonths) === 3));

    const installments = isSplit
      ? calculateShiftInstallments(shiftDate, netValue, customDate)
      : (updates.installments || null);

    this.data.shifts[index] = {
      ...current,
      ...updates,
      netValue,
      paymentLagMonths: lagMonths,
      customPaymentDate: customDate,
      expectedPaymentDate,
      splitPayment: isSplit,
      installments: updates.installments || installments
    };

    this.save();
    return this.data.shifts[index];
  }

  deleteShift(id) {
    const shift = this.data.shifts.find(s => s.id === id);
    if (!shift) return false;

    if (!Array.isArray(this.data.trash)) this.data.trash = [];
    this.saveBackup();
    this.data.trash.unshift({
      id: "trash_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      originalId: shift.id,
      itemType: "shift",
      item: JSON.parse(JSON.stringify(shift)),
      deletedAt: new Date().toISOString(),
      label: `Plantão: ${shift.hospital} (${formatDateBR(shift.shiftDate)}) - ${formatCurrency(shift.netValue)}`
    });
    if (this.data.trash.length > 50) this.data.trash.pop();

    this.data.shifts = this.data.shifts.filter(s => s.id !== id);
    this.save();
    return true;
  }

  markShiftAsReceived(id, paidDate = null) {
    const shift = this.data.shifts.find(s => s.id === id);
    if (!shift) return null;

    let dateToday = paidDate || getLocalDateString(new Date());
    shift.status = "received";
    shift.paidDate = dateToday;
    if (Array.isArray(shift.installments)) {
      shift.installments.forEach(inst => {
        inst.status = "received";
        inst.paidDate = inst.paidDate || dateToday;
      });
    }
    this.save();
    return shift;
  }

  toggleShiftInstallment(shiftId, installmentNumber, paidDate = null) {
    const shift = this.data.shifts.find(s => s.id === shiftId);
    if (!shift || !Array.isArray(shift.installments)) return null;

    const inst = shift.installments.find(i => i.number === installmentNumber);
    if (!inst) return null;

    const dateToday = paidDate || getLocalDateString(new Date());
    if (inst.status === "received") {
      inst.status = "pending";
      inst.paidDate = null;
    } else {
      inst.status = "received";
      inst.paidDate = dateToday;
    }

    const allReceived = shift.installments.every(i => i.status === "received");
    const anyReceived = shift.installments.some(i => i.status === "received");
    if (allReceived) {
      shift.status = "received";
      shift.paidDate = dateToday;
    } else if (anyReceived) {
      shift.status = "partial";
      shift.paidDate = null;
    } else {
      shift.status = "pending";
      shift.paidDate = null;
    }

    this.save();
    return shift;
  }

  unmarkShiftAsReceived(id) {
    const shift = this.data.shifts.find(s => s.id === id);
    if (!shift) return null;

    shift.status = "pending";
    shift.paidDate = null;
    if (Array.isArray(shift.installments)) {
      shift.installments.forEach(inst => {
        inst.status = "pending";
        inst.paidDate = null;
      });
    }
    this.save();
    return shift;
  }

  // --- Expenses Operations ---

  addExpense(expense) {
    const category = (expense.category || "Outros").trim();
    const scope = expense.scope || this.getCategoryScope(category);

    // Auto-register custom category if not in standard PF or PJ list
    if (category && !EXPENSE_CATEGORIES_PF.includes(category) && !EXPENSE_CATEGORIES_PJ.includes(category) && category !== "Outros") {
      this.addExpenseCategory({ name: category, scope });
    }

    const newExpense = {
      id: expense.id || "e_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      description: expense.description.trim(),
      category,
      scope, // "pf" (vida pessoal) | "pj" (trabalho/consultório)
      type: expense.type || "variable", // "fixed" | "variable"
      value: Number(expense.value) || 0,
      dueDate: expense.dueDate,
      isPaid: Boolean(expense.isPaid)
    };

    this.data.expenses.unshift(newExpense);
    this.save();
    return newExpense;
  }

  updateExpense(id, updates) {
    const index = this.data.expenses.findIndex(e => e.id === id);
    if (index === -1) return null;

    const cat = updates.category !== undefined ? String(updates.category).trim() : this.data.expenses[index].category;
    const scope = updates.scope !== undefined ? updates.scope : (this.data.expenses[index].scope || this.getCategoryScope(cat));

    // Auto-register custom category if not in standard PF or PJ list
    if (cat && !EXPENSE_CATEGORIES_PF.includes(cat) && !EXPENSE_CATEGORIES_PJ.includes(cat) && cat !== "Outros") {
      this.addExpenseCategory({ name: cat, scope });
    }

    this.data.expenses[index] = {
      ...this.data.expenses[index],
      ...updates,
      category: cat,
      scope,
      value: updates.value !== undefined ? Number(updates.value) : this.data.expenses[index].value
    };

    this.save();
    return this.data.expenses[index];
  }

  deleteExpense(id) {
    const expense = this.data.expenses.find(e => e.id === id);
    if (!expense) return false;

    if (!Array.isArray(this.data.trash)) this.data.trash = [];
    this.saveBackup();
    this.data.trash.unshift({
      id: "trash_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      originalId: expense.id,
      itemType: "expense",
      item: JSON.parse(JSON.stringify(expense)),
      deletedAt: new Date().toISOString(),
      label: `Despesa: ${expense.description} (${formatDateBR(expense.dueDate)}) - ${formatCurrency(expense.value)}`
    });
    if (this.data.trash.length > 50) this.data.trash.pop();

    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
    return true;
  }

  // --- Trash, History & Safety Database Operations ---

  getTrash() {
    return Array.isArray(this.data.trash) ? this.data.trash : [];
  }

  restoreFromTrash(trashId) {
    if (!Array.isArray(this.data.trash) || this.data.trash.length === 0) return null;
    const index = this.data.trash.findIndex(t => t.id === trashId || t.originalId === trashId || t.trashId === trashId);
    if (index === -1) return null;

    const entry = this.data.trash.splice(index, 1)[0];
    if (entry.itemType === "shift") {
      this.data.shifts.unshift(entry.item);
    } else if (entry.itemType === "expense") {
      this.data.expenses.unshift(entry.item);
    } else if (entry.itemType === "salary") {
      this.data.fixedSalaries.push(entry.item);
    } else if (entry.itemType === "consultation") {
      if (!Array.isArray(this.data.consultations)) this.data.consultations = [];
      this.data.consultations.unshift(entry.item);
    }
    this.save();
    return true;
  }

  undoLastDelete() {
    if (!Array.isArray(this.data.trash) || this.data.trash.length === 0) return null;
    return this.restoreFromTrash(this.data.trash[0].id);
  }

  emptyTrash() {
    this.data.trash = [];
    this.save();
    return true;
  }

  saveBackup() {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(this.storageKey + "_backup", JSON.stringify(this.data));
      } catch (e) {}
    }
  }

  restoreBackup() {
    if (typeof localStorage !== "undefined") {
      try {
        const backupStr = localStorage.getItem(this.storageKey + "_backup");
        if (backupStr) {
          const parsed = JSON.parse(backupStr);
          if (parsed && Array.isArray(parsed.shifts)) {
            this.data = parsed;
            this.save();
            return true;
          }
        }
      } catch (e) {}
    }
    return false;
  }

  // --- Work Locations Operations ---

  getWorkLocations() {
    const custom = Array.isArray(this.data.workLocations) ? this.data.workLocations : [];
    return Array.from(new Set([...DEFAULT_WORK_LOCATIONS, ...custom]));
  }

  addWorkLocation(name) {
    if (!name || typeof name !== "string" || !name.trim()) return null;
    const trimmed = name.trim();
    if (!Array.isArray(this.data.workLocations)) {
      this.data.workLocations = [...DEFAULT_WORK_LOCATIONS];
    }
    if (!this.data.workLocations.includes(trimmed)) {
      this.data.workLocations.push(trimmed);
      this.save();
    }
    return trimmed;
  }

  deleteWorkLocation(name) {
    if (!Array.isArray(this.data.workLocations)) return false;
    this.data.workLocations = this.data.workLocations.filter(loc => loc !== name);
    this.save();
    return true;
  }

  // --- Work Types Operations ---

  getWorkTypes() {
    const custom = Array.isArray(this.data.workTypes) ? this.data.workTypes : [];
    return Array.from(new Set([...DEFAULT_WORK_TYPES, ...custom]));
  }

  getActiveWorkTypes() {
    if (Array.isArray(this.data.activeWorkTypes) && this.data.activeWorkTypes.length > 0) {
      return this.data.activeWorkTypes;
    }
    return ["Plantão em Maternidade", "Plantão em Hospital", "Serviço Público"];
  }

  toggleActiveWorkType(type) {
    if (!Array.isArray(this.data.activeWorkTypes)) {
      this.data.activeWorkTypes = ["Plantão em Maternidade", "Plantão em Hospital", "Serviço Público"];
    }
    const idx = this.data.activeWorkTypes.indexOf(type);
    if (idx > -1) {
      this.data.activeWorkTypes.splice(idx, 1);
    } else {
      this.data.activeWorkTypes.push(type);
    }
    this.save();
    return this.data.activeWorkTypes;
  }

  // --- Expense Categories Operations ---

  getCustomExpenseCategories() {
    return Array.isArray(this.data.customExpenseCategories) ? this.data.customExpenseCategories : [];
  }

  getExpenseCategories(scope = null) {
    const customs = this.getCustomExpenseCategories();
    let baseList = [];
    if (scope === "pf") {
      baseList = [...EXPENSE_CATEGORIES_PF];
      customs.forEach(c => {
        if (c.scope === "pf" && !baseList.includes(c.name)) baseList.push(c.name);
      });
    } else if (scope === "pj") {
      baseList = [...EXPENSE_CATEGORIES_PJ];
      customs.forEach(c => {
        if (c.scope === "pj" && !baseList.includes(c.name)) baseList.push(c.name);
      });
    } else {
      baseList = [...EXPENSE_CATEGORIES];
      customs.forEach(c => {
        if (!baseList.includes(c.name)) baseList.push(c.name);
      });
    }
    return baseList;
  }

  addExpenseCategory(catOrName, maybeScope = "pf", maybeColor = null, maybeIcon = null) {
    let name = "";
    let scope = "pf";
    let color = null;
    let icon = null;

    if (typeof catOrName === "object" && catOrName !== null) {
      name = catOrName.name || "";
      scope = catOrName.scope || "pf";
      color = catOrName.color || null;
      icon = catOrName.icon || null;
    } else if (typeof catOrName === "string") {
      name = catOrName;
      scope = maybeScope || "pf";
      color = maybeColor;
      icon = maybeIcon;
    }

    if (!name || typeof name !== "string" || !name.trim()) return null;
    const trimmedName = name.trim();
    const normalizedScope = String(scope).toLowerCase() === "pj" ? "pj" : "pf";

    if (!Array.isArray(this.data.customExpenseCategories)) {
      this.data.customExpenseCategories = [];
    }

    const existing = this.data.customExpenseCategories.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      existing.scope = normalizedScope;
      if (color) existing.color = color;
      if (icon) existing.icon = icon;
      this.save();
      return existing;
    }

    const newCategory = {
      id: "cat_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      name: trimmedName,
      scope: normalizedScope,
      color: color || (normalizedScope === "pj" ? "#006A62" : "#B80F55"),
      icon: icon || (normalizedScope === "pj" ? "business" : "sell")
    };

    this.data.customExpenseCategories.push(newCategory);
    this.save();
    return newCategory;
  }

  updateExpenseCategory(idOrName, updates) {
    if (!idOrName || !updates) return null;
    if (!Array.isArray(this.data.customExpenseCategories)) {
      this.data.customExpenseCategories = [];
    }
    let target = this.data.customExpenseCategories.find(
      c => c.id === idOrName || c.name.toLowerCase() === String(idOrName).toLowerCase()
    );

    // If target not yet in custom categories (e.g. was standard), register it as custom
    if (!target) {
      const scope = updates.scope || this.getCategoryScope(idOrName);
      target = this.addExpenseCategory({ name: String(idOrName).trim(), scope });
    }
    if (!target) return null;

    const oldName = target.name;
    if (updates.name && typeof updates.name === "string" && updates.name.trim()) {
      target.name = updates.name.trim();
    }
    if (updates.scope) {
      target.scope = String(updates.scope).toLowerCase() === "pj" ? "pj" : "pf";
    }
    if (updates.color) target.color = updates.color;
    if (updates.icon) target.icon = updates.icon;

    // Cascade rename to existing expenses
    if (Array.isArray(this.data.expenses) && oldName !== target.name) {
      this.data.expenses.forEach(exp => {
        if (exp.category && exp.category.toLowerCase() === oldName.toLowerCase()) {
          exp.category = target.name;
          if (updates.scope) exp.scope = target.scope;
        }
      });
    }

    this.save();
    return target;
  }

  deleteExpenseCategory(idOrName) {
    if (!Array.isArray(this.data.customExpenseCategories) || !idOrName) return false;
    const initialLen = this.data.customExpenseCategories.length;
    this.data.customExpenseCategories = this.data.customExpenseCategories.filter(
      c => c.id !== idOrName && c.name.toLowerCase() !== String(idOrName).toLowerCase()
    );
    const removed = this.data.customExpenseCategories.length < initialLen;
    if (removed) {
      this.save();
    }
    return removed;
  }

  getCategoryScope(category) {
    if (!category) return "pf";
    const customs = this.getCustomExpenseCategories();
    const found = customs.find(c => c.name.toLowerCase() === String(category).trim().toLowerCase());
    if (found) return found.scope;
    return getCategoryScope(category, customs);
  }

  getCategoryColor(category) {
    if (!category) return "#7A7E91";
    if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
    const customs = this.getCustomExpenseCategories();
    const found = customs.find(c => c.name.toLowerCase() === String(category).trim().toLowerCase());
    if (found && found.color) return found.color;
    const lower = String(category).toLowerCase();
    if (lower.includes("mercado") || lower.includes("mercantil") || lower.includes("compras") || lower.includes("supermercado")) return "#FF5252";
    if (lower.includes("lanche") || lower.includes("comida") || lower.includes("restaurante")) return "#FF7043";
    if (lower.includes("contador") || lower.includes("contabil")) return "#7E57C2";
    if (lower.includes("farmacia") || lower.includes("farmácia") || lower.includes("remédio") || lower.includes("medicamento")) return "#00BFA5";
    if (lower.includes("carro") || lower.includes("uber") || lower.includes("combustivel") || lower.includes("combustível")) return "#448AFF";
    if (lower.includes("consultorio") || lower.includes("consultório") || lower.includes("sublocacao") || lower.includes("aluguel")) return "#EC407A";
    const palette = ["#B80F55", "#7E4A8A", "#006A62", "#EC407A", "#26A69A", "#AB47BC", "#FF7043", "#7C4DFF"];
    let hash = 0;
    for (let i = 0; i < category.length; i++) hash = (hash << 5) - hash + category.charCodeAt(i);
    return palette[Math.abs(hash) % palette.length];
  }

  getCategoryIcon(category) {
    if (!category) return "receipt_long";
    if (CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];
    const customs = this.getCustomExpenseCategories();
    const found = customs.find(c => c.name.toLowerCase() === String(category).trim().toLowerCase());
    if (found && found.icon) return found.icon;
    const lower = String(category).toLowerCase();
    if (lower.includes("mercado") || lower.includes("mercantil") || lower.includes("compras") || lower.includes("supermercado")) return "shopping_cart";
    if (lower.includes("lanche") || lower.includes("comida") || lower.includes("restaurante") || lower.includes("alimentacao") || lower.includes("alimentação")) return "restaurant";
    if (lower.includes("contador") || lower.includes("contabil") || lower.includes("imposto")) return "calculate";
    if (lower.includes("farmacia") || lower.includes("farmácia") || lower.includes("remédio") || lower.includes("medicamento")) return "medication";
    if (lower.includes("carro") || lower.includes("uber") || lower.includes("combustivel") || lower.includes("combustível")) return "directions_car";
    if (lower.includes("consultorio") || lower.includes("consultório") || lower.includes("clinica") || lower.includes("clínica")) return "domain";
    if (lower.includes("viagem") || lower.includes("passagem") || lower.includes("hotel")) return "flight";
    if (lower.includes("educacao") || lower.includes("educação") || lower.includes("curso") || lower.includes("congresso")) return "school";
    if (lower.includes("lazer") || lower.includes("cinema") || lower.includes("show")) return "attractions";
    if (lower.includes("presente")) return "card_giftcard";
    if (lower.includes("beleza") || lower.includes("cabelo") || lower.includes("estetica")) return "spa";
    return this.getCategoryScope(category) === "pj" ? "business" : "sell";
  }

  toggleExpensePaid(id) {
    const expense = this.data.expenses.find(e => e.id === id);
    if (!expense) return null;

    expense.isPaid = !expense.isPaid;
    this.save();
    return expense;
  }

  // --- Fixed Salaries Operations ---

  addFixedSalary(salary) {
    const newSalary = {
      id: salary.id || "s_" + Date.now(),
      description: salary.description.trim(),
      value: Number(salary.value) || 0,
      dayOfMonth: Number(salary.dayOfMonth) || 5
    };
    this.data.fixedSalaries.push(newSalary);
    this.save();
    return newSalary;
  }

  updateFixedSalary(id, updates) {
    const index = this.data.fixedSalaries.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.data.fixedSalaries[index] = {
      ...this.data.fixedSalaries[index],
      ...updates
    };
    this.save();
    return this.data.fixedSalaries[index];
  }

  deleteFixedSalary(id) {
    const salary = this.data.fixedSalaries.find(s => s.id === id);
    if (!salary) return false;

    if (!Array.isArray(this.data.trash)) this.data.trash = [];
    this.saveBackup();
    this.data.trash.unshift({
      id: "trash_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      originalId: salary.id,
      itemType: "salary",
      item: JSON.parse(JSON.stringify(salary)),
      deletedAt: new Date().toISOString(),
      label: `Salário: ${salary.description} - ${formatCurrency(salary.value)}`
    });
    if (this.data.trash.length > 50) this.data.trash.pop();

    this.data.fixedSalaries = this.data.fixedSalaries.filter(s => s.id !== id);
    this.save();
    return true;
  }

  upsertFixedSalary(salary) {
    if (salary.id) {
      const existing = this.data.fixedSalaries.find(s => s.id === salary.id);
      if (existing) {
        return this.updateFixedSalary(salary.id, salary);
      }
    }
    if (this.data.fixedSalaries.length >= 1) {
      return this.updateFixedSalary(this.data.fixedSalaries[0].id, salary);
    }
    return this.addFixedSalary(salary);
  }

  // --- Consultations & Puericultura Operations (v3.0) ---

  getConsultations(monthStr = null) {
    if (!Array.isArray(this.data.consultations)) {
      this.data.consultations = [];
    }
    if (!monthStr) {
      return [...this.data.consultations];
    }
    return this.data.consultations.filter(c => c.date && c.date.startsWith(monthStr));
  }

  addConsultation(consultation) {
    if (!Array.isArray(this.data.consultations)) {
      this.data.consultations = [];
    }
    const grossValue = Number(consultation.grossValue !== undefined ? consultation.grossValue : (consultation.value || 0)) || 0;
    const taxRate = consultation.taxRate !== undefined ? Number(consultation.taxRate) : 0;
    const netValue = consultation.netValue !== undefined
      ? Number(consultation.netValue)
      : Math.round(grossValue * (1 - (taxRate / 100)) * 100) / 100;
    const date = consultation.date ? String(consultation.date).trim() : getLocalDateString(new Date());
    const durationMinutes = Number(consultation.durationMinutes) || 60;
    const isPaid = consultation.paid === true || consultation.paymentStatus === "received" || consultation.isPaid === true;

    const newConsultation = {
      id: consultation.id || "c_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      patientName: (consultation.patientName || "Bebê sem nome").trim(),
      parentName: (consultation.parentName || "").trim(),
      type: consultation.type || consultation.consultationType || "Plano Puericultura 1º Ano",
      consultationType: consultation.consultationType || consultation.type || "Plano Puericultura 1º Ano",
      date,
      durationMinutes,
      value: grossValue,
      grossValue,
      taxRate,
      netValue,
      paid: isPaid,
      paymentStatus: isPaid ? "received" : (consultation.paymentStatus || "pending"),
      paymentDate: isPaid ? (consultation.paymentDate || date) : null,
      paymentMethod: consultation.paymentMethod || "PIX",
      isPackage: Boolean(consultation.isPackage),
      puericulturaMonth: consultation.puericulturaMonth || null,
      ageMonths: consultation.ageMonths !== undefined && consultation.ageMonths !== null ? Number(consultation.ageMonths) : null,
      planInstallment: consultation.planInstallment || (consultation.type && consultation.type.includes("Puericultura") ? "1/12" : "Avulsa"),
      notes: (consultation.notes || "").trim()
    };

    this.data.consultations.unshift(newConsultation);
    this.save();
    return newConsultation;
  }

  updateConsultation(id, updates) {
    if (!Array.isArray(this.data.consultations)) return null;
    const index = this.data.consultations.findIndex(c => c.id === id);
    if (index === -1) return null;

    const current = this.data.consultations[index];
    const grossValue = updates.grossValue !== undefined
      ? Number(updates.grossValue)
      : (updates.value !== undefined ? Number(updates.value) : current.grossValue);
    const taxRate = updates.taxRate !== undefined ? Number(updates.taxRate) : current.taxRate;
    const netValue = updates.netValue !== undefined
      ? Number(updates.netValue)
      : Math.round(grossValue * (1 - (taxRate / 100)) * 100) / 100;

    this.data.consultations[index] = {
      ...current,
      ...updates,
      grossValue,
      taxRate,
      netValue
    };

    this.save();
    return this.data.consultations[index];
  }

  deleteConsultation(id) {
    if (!Array.isArray(this.data.consultations)) return false;
    const consultation = this.data.consultations.find(c => c.id === id);
    if (!consultation) return false;

    if (!Array.isArray(this.data.trash)) this.data.trash = [];
    this.saveBackup();
    this.data.trash.unshift({
      id: consultation.id,
      trashId: "trash_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      originalId: consultation.id,
      itemType: "consultation",
      item: JSON.parse(JSON.stringify(consultation)),
      deletedAt: new Date().toISOString(),
      label: `Consulta: ${consultation.patientName} (${formatDateBR(consultation.date)}) - ${formatCurrency(consultation.netValue)}`
    });
    if (this.data.trash.length > 50) this.data.trash.pop();

    this.data.consultations = this.data.consultations.filter(c => c.id !== id);
    this.save();
    return true;
  }

  toggleConsultationPaid(id, paidDate = null) {
    if (!Array.isArray(this.data.consultations)) return null;
    const c = this.data.consultations.find(item => item.id === id);
    if (!c) return null;

    const today = paidDate || getLocalDateString(new Date());
    if (c.paymentStatus === "received" || c.paid) {
      c.paymentStatus = "pending";
      c.paid = false;
      c.paymentDate = null;
    } else {
      c.paymentStatus = "received";
      c.paid = true;
      c.paymentDate = today;
    }
    this.save();
    return c;
  }

  getConsultationMetrics(monthStr = null) {
    const mStr = monthStr || getLocalDateString(new Date()).slice(0, 7);
    const monthConsultations = this.getConsultations(mStr);
    const shifts = this.data.shifts.filter(s => s.shiftDate.startsWith(mStr));

    let consultationHours = 0;
    let consultationGross = 0;
    let consultationRevenue = 0;
    let puericulturaActiveCount = 0;

    monthConsultations.forEach(c => {
      const hours = (Number(c.durationMinutes) || 60) / 60;
      consultationHours += hours;
      consultationGross += (Number(c.grossValue) || 0);
      consultationRevenue += (Number(c.netValue) || 0);
      if (c.type && c.type.toLowerCase().includes("puericultura")) {
        puericulturaActiveCount++;
      }
    });

    let shiftHours = 0;
    let shiftRevenue = 0;
    shifts.forEach(s => {
      let h = 12;
      if (s.hours) h = Number(s.hours);
      else if (s.explicitHours) h = Number(s.explicitHours);
      else if (s.durationMinutes) h = Number(s.durationMinutes) / 60;
      else {
        const found = SHIFT_TYPES.find(t => t.id === s.shiftType);
        if (found && found.hours) h = found.hours;
        else if ((s.shiftType || "").includes("24h")) h = 24;
        else if ((s.shiftType || "").includes("6h")) h = 6;
      }
      shiftHours += h;
      shiftRevenue += (Number(s.netValue) || 0);
    });

    const consultationHourlyRate = consultationHours > 0 ? Math.round(consultationRevenue / consultationHours) : 0;
    const shiftHourlyRate = shiftHours > 0 ? Math.round(shiftRevenue / shiftHours) : 0;
    const diff = consultationHourlyRate - shiftHourlyRate;
    const ratio = shiftHourlyRate > 0 ? Number((consultationHourlyRate / shiftHourlyRate).toFixed(2)) : 1;
    const consultationAdvantagePercent = shiftHourlyRate > 0
      ? Math.round(((consultationHourlyRate - shiftHourlyRate) / shiftHourlyRate) * 100)
      : 100;

    return {
      monthStr: mStr,
      totalConsultations: monthConsultations.length,
      consultationsCount: monthConsultations.length,
      puericulturaActiveCount,
      consultationHours: Number(consultationHours.toFixed(1)),
      totalGross: consultationGross,
      consultationGross,
      consultationRevenue,
      consultationHourlyRate,
      shiftHours: Number(shiftHours.toFixed(1)),
      shiftRevenue,
      shiftHourlyRate,
      diff,
      ratio,
      consultationAdvantagePercent,
      isConsultationMoreProfitable: consultationHourlyRate >= shiftHourlyRate
    };
  }

  // --- Calculations Engine ---

  /**
   * Comprehensive financial summary for a selected month (YYYY-MM).
   * Calculates both [Regime de Caixa] and [Regime de Competência].
   * @param {string} monthStr 'YYYY-MM'
   * @param {Date|string} referenceDate (default: current system date)
   */
  getMonthlyReport(monthStr, referenceDate = new Date()) {
    const refDate = referenceDate instanceof Date
      ? referenceDate
      : new Date(String(referenceDate) + "T00:00:00");

    // Fixed Salaries
    const fixedSalariesTotal = this.data.fixedSalaries.reduce((acc, s) => acc + (Number(s.value) || 0), 0);

    // Evaluated Shifts
    const evaluatedShifts = this.data.shifts.map(s => {
      const evaluation = evaluateShiftStatus(s, refDate);
      return {
        ...s,
        currentStatus: evaluation.status,
        statusLabel: evaluation.label,
        delayDays: evaluation.delayDays,
        isDelayed: evaluation.isDelayed
      };
    });

    // 1. REGIME DE CAIXA
    // Inflow: Fixed salary for this month + shifts realized in cash during this month.
    // If a shift uses the 80/20 formula, installments are attributed to D+60 and D+90 respectively!
    const cashShifts = [];
    let cashShiftsTotalNet = 0;
    let cashShiftsReceivedNet = 0;
    let cashShiftsPendingNet = 0;
    let cashShiftsDelayedNet = 0;
    const refDateStr = getLocalDateString(refDate);

    evaluatedShifts.forEach(s => {
      if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
        s.installments.forEach(inst => {
          const instCashMonth = (inst.status === "received" && inst.paidDate)
            ? inst.paidDate.slice(0, 7)
            : inst.dueDate.slice(0, 7);

          if (instCashMonth === monthStr) {
            const isInstDelayed = inst.status !== "received" && refDateStr > inst.dueDate;
            const instVal = Number(inst.value) || 0;
            cashShiftsTotalNet += instVal;
            if (inst.status === "received") {
              cashShiftsReceivedNet += instVal;
            } else if (isInstDelayed) {
              cashShiftsDelayedNet += instVal;
              cashShiftsPendingNet += instVal;
            } else {
              cashShiftsPendingNet += instVal;
            }
            cashShifts.push({
              ...s,
              isInstallment: true,
              installmentNumber: inst.number,
              installmentPercent: inst.percent,
              installmentValue: instVal,
              installmentDueDate: inst.dueDate,
              installmentStatus: inst.status,
              isDelayed: isInstDelayed,
              netValue: instVal
            });
          }
        });
      } else {
        const cashMonth = (s.currentStatus === "received" && s.paidDate)
          ? s.paidDate.slice(0, 7)
          : s.expectedPaymentDate.slice(0, 7);

        if (cashMonth === monthStr) {
          const sVal = Number(s.netValue) || 0;
          cashShiftsTotalNet += sVal;
          if (s.currentStatus === "received") {
            cashShiftsReceivedNet += sVal;
          } else if (s.currentStatus === "delayed") {
            cashShiftsDelayedNet += sVal;
            cashShiftsPendingNet += sVal;
          } else {
            cashShiftsPendingNet += sVal;
          }
          cashShifts.push(s);
        }
      }
    });

    const cashTotalInflow = fixedSalariesTotal + cashShiftsTotalNet;
    const cashRealizedInflow = fixedSalariesTotal + cashShiftsReceivedNet;

    // Expenses in Cash: due in this month
    const cashExpenses = this.data.expenses.filter(e => e.dueDate.startsWith(monthStr));
    const cashExpensesTotal = cashExpenses.reduce((acc, e) => acc + (Number(e.value) || 0), 0);
    const cashExpensesPaid = cashExpenses
      .filter(e => e.isPaid)
      .reduce((acc, e) => acc + (Number(e.value) || 0), 0);
    const cashExpensesPending = cashExpenses
      .filter(e => !e.isPaid)
      .reduce((acc, e) => acc + (Number(e.value) || 0), 0);

    const cashNetBalance = cashTotalInflow - cashExpensesTotal;
    const cashRealizedNetBalance = cashRealizedInflow - cashExpensesPaid;

    // 2. REGIME DE COMPETÊNCIA
    // Production: Fixed salary + shifts worked in this month (shiftDate starts with monthStr)
    const accrualShifts = evaluatedShifts.filter(s => s.shiftDate.startsWith(monthStr));
    const accrualGrossProduction = accrualShifts.reduce((acc, s) => acc + (Number(s.grossValue) || 0), 0);
    const accrualNetProduction = accrualShifts.reduce((acc, s) => acc + (Number(s.netValue) || 0), 0);
    const accrualTotalProductionNet = fixedSalariesTotal + accrualNetProduction;
    const accrualTotalProductionGross = fixedSalariesTotal + accrualGrossProduction;

    // Accrual Expenses: attributed to this month
    const accrualExpensesTotal = cashExpensesTotal;
    const accrualNetBalance = accrualTotalProductionNet - accrualExpensesTotal;

    // Expense breakdown by category for this month
    const expensesByCategory = {};
    const availableCategories = this.getExpenseCategories();
    availableCategories.forEach(cat => {
      expensesByCategory[cat] = 0;
    });
    cashExpenses.forEach(e => {
      const cat = e.category || "Outros";
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (Number(e.value) || 0);
    });

    let cashExpensesPF = 0;
    let cashExpensesPJ = 0;
    cashExpenses.forEach(e => {
      const scope = e.scope || this.getCategoryScope(e.category);
      if (scope === "pf") cashExpensesPF += (Number(e.value) || 0);
      else cashExpensesPJ += (Number(e.value) || 0);
    });

    const categoryBreakdown = Object.entries(expensesByCategory).map(([category, amount]) => {
      const percentage = cashExpensesTotal > 0 ? (amount / cashExpensesTotal) * 100 : 0;
      const scope = this.getCategoryScope(category);
      return {
        category,
        scope,
        amount,
        percentage: Number(percentage.toFixed(1)),
        color: this.getCategoryColor(category),
        icon: this.getCategoryIcon(category)
      };
    }).filter(c => c.amount > 0);

    // Goals & Workload Metrics
    const monthlyIncomeGoal = Number(this.data.monthlyIncomeGoal) || 25000;
    const goalProgressPercent = monthlyIncomeGoal > 0
      ? Number(((cashTotalInflow / monthlyIncomeGoal) * 100).toFixed(1))
      : 0;
    const remainingToGoal = Math.max(0, monthlyIncomeGoal - cashTotalInflow);
    const approxShiftsToGoal = Math.max(0, Math.ceil(remainingToGoal / 2800));

    const totalHoursWorked = accrualShifts.reduce((acc, s) => {
      const typeObj = SHIFT_TYPES.find(t => t.id === s.shiftType);
      return acc + ((typeObj && typeObj.hours) ? typeObj.hours : 12);
    }, 0);
    const averageHourlyRate = totalHoursWorked > 0 ? (accrualNetProduction / totalHoursWorked) : 0;

    return {
      monthStr,
      referenceDate: refDate,
      fixedSalariesTotal,
      caixa: {
        totalInflow: cashTotalInflow,
        realizedInflow: cashRealizedInflow,
        shiftsTotalNet: cashShiftsTotalNet,
        shiftsReceivedNet: cashShiftsReceivedNet,
        shiftsPendingNet: cashShiftsPendingNet,
        shiftsDelayedNet: cashShiftsDelayedNet,
        shiftsList: cashShifts,
        expensesTotal: cashExpensesTotal,
        expensesPaid: cashExpensesPaid,
        expensesPending: cashExpensesPending,
        netBalance: cashNetBalance,
        realizedNetBalance: cashRealizedNetBalance
      },
      competencia: {
        totalProductionGross: accrualTotalProductionGross,
        totalProductionNet: accrualTotalProductionNet,
        shiftsGrossProduction: accrualGrossProduction,
        shiftsNetProduction: accrualNetProduction,
        shiftsCount: accrualShifts.length,
        shiftsList: accrualShifts,
        expensesTotal: accrualExpensesTotal,
        netBalance: accrualNetBalance
      },
      goals: {
        target: monthlyIncomeGoal,
        achieved: cashTotalInflow,
        percent: goalProgressPercent,
        remaining: remainingToGoal,
        approxShiftsNeeded: approxShiftsToGoal
      },
      workload: {
        totalHours: totalHoursWorked,
        averageHourlyRate: Math.round(averageHourlyRate)
      },
      expenses: {
        list: cashExpenses,
        total: cashExpensesTotal,
        paid: cashExpensesPaid,
        pending: cashExpensesPending,
        totalPF: cashExpensesPF,
        totalPJ: cashExpensesPJ,
        pfPercent: cashExpensesTotal > 0 ? Number(((cashExpensesPF / cashExpensesTotal) * 100).toFixed(1)) : 0,
        pjPercent: cashExpensesTotal > 0 ? Number(((cashExpensesPJ / cashExpensesTotal) * 100).toFixed(1)) : 0,
        categoryBreakdown,
        budgetLimit: this.data.monthlyBudgetLimit || 12000,
        budgetUsagePercent: cashExpensesTotal > 0
          ? Number(((cashExpensesTotal / (this.data.monthlyBudgetLimit || 12000)) * 100).toFixed(1))
          : 0
      }
    };
  }

  /**
   * Forecast for the next N months (default: 4 months) starting from startMonthStr.
   * Visualizes expected cash inflow from shifts and salaries.
   * @param {string} startMonthStr 'YYYY-MM'
   * @param {number} monthCount
   * @returns {Array<{monthStr: string, label: string, shiftInflow: number, salaryInflow: number, totalInflow: number, receivedAmount: number, pendingAmount: number}>}
   */
  getShiftInflowForecast(startMonthStr, monthCount = 4) {
    const result = [];
    const [startYear, startMonth] = startMonthStr.split("-").map(Number);

    for (let i = 0; i < monthCount; i++) {
      const targetYear = startYear + Math.floor((startMonth - 1 + i) / 12);
      const targetMonth = ((startMonth - 1 + i) % 12) + 1;
      const mStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

      const fixedSalary = this.data.fixedSalaries.reduce((acc, s) => acc + (Number(s.value) || 0), 0);

      // Shifts whose expectedPaymentDate is in mStr
      let shiftInflow = 0;
      let receivedAmount = 0;
      let pendingAmount = 0;

      this.data.shifts.forEach(s => {
        if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
          s.installments.forEach(inst => {
            const payMonth = (inst.status === "received" && inst.paidDate)
              ? inst.paidDate.slice(0, 7)
              : inst.dueDate.slice(0, 7);

            if (payMonth === mStr) {
              const val = Number(inst.value) || 0;
              shiftInflow += val;
              if (inst.status === "received") {
                receivedAmount += val;
              } else {
                pendingAmount += val;
              }
            }
          });
        } else {
          const payMonth = (s.status === "received" && s.paidDate)
            ? s.paidDate.slice(0, 7)
            : s.expectedPaymentDate.slice(0, 7);

          if (payMonth === mStr) {
            const val = Number(s.netValue) || 0;
            shiftInflow += val;
            if (s.status === "received") {
              receivedAmount += val;
            } else {
              pendingAmount += val;
            }
          }
        }
      });

      const monthNamesShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      result.push({
        monthStr: mStr,
        label: `${monthNamesShort[targetMonth - 1]}/${String(targetYear).slice(2)}`,
        fullLabel: `${monthNamesShort[targetMonth - 1]} ${targetYear}`,
        shiftInflow,
        salaryInflow: fixedSalary,
        totalInflow: shiftInflow + fixedSalary,
        receivedAmount,
        pendingAmount
      });
    }

    return result;
  }

  /**
   * Summary of all pending shifts grouped by D+30, D+60, D+90, and delayed.
   */
  getLiquidityRadarSummary(referenceDate = new Date()) {
    const refDate = referenceDate instanceof Date
      ? referenceDate
      : new Date(String(referenceDate) + "T00:00:00");
    const refDateStr = getLocalDateString(refDate);

    let totalPending = 0;
    let totalDelayed = 0;
    let countPending = 0;
    let countDelayed = 0;
    let d30Sum = 0;
    let d60Sum = 0;
    let d90Sum = 0;

    this.data.shifts.forEach(s => {
      if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
        s.installments.forEach(inst => {
          const val = Number(inst.value) || 0;
          if (inst.status !== "received") {
            if (refDateStr > inst.dueDate) {
              totalDelayed += val;
              countDelayed++;
            } else {
              totalPending += val;
              countPending++;
              if (inst.percent === 80) d60Sum += val;
              else d90Sum += val;
            }
          }
        });
      } else {
        const ev = evaluateShiftStatus(s, refDate);
        if (ev.status === "delayed") {
          totalDelayed += Number(s.netValue) || 0;
          countDelayed++;
        } else if (ev.status === "pending") {
          const val = Number(s.netValue) || 0;
          totalPending += val;
          countPending++;
          if (s.paymentLagMonths === 1) d30Sum += val;
          else if (s.paymentLagMonths === 2) d60Sum += val;
          else d90Sum += val;
        }
      }
    });

    return {
      totalPending,
      totalDelayed,
      countPending,
      countDelayed,
      d30Sum,
      d60Sum,
      d90Sum,
      totalToReceive: totalPending + totalDelayed,
      totalCount: countPending + countDelayed
    };
  }

  /**
   * Calculates Month-over-Month (MoM) expense variation comparing current month to previous month.
   * @param {string} monthStr 'YYYY-MM'
   * @param {string|null} scopeFilter 'pf' | 'pj' | 'fixa' | 'variavel' | null
   * @returns {object}
   */
  getMonthOverMonthExpenseVariation(monthStr, scopeFilter = null) {
    const [y, m] = monthStr.split("-").map(Number);
    const prevMonthDate = new Date(y, m - 2, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonthNum = prevMonthDate.getMonth() + 1;
    const prevMonthStr = `${prevYear}-${String(prevMonthNum).padStart(2, "0")}`;

    let currentExpenses = this.data.expenses.filter(e => e.dueDate.startsWith(monthStr));
    let prevExpenses = this.data.expenses.filter(e => e.dueDate.startsWith(prevMonthStr));

    if (scopeFilter && scopeFilter !== "all") {
      if (scopeFilter === "pf" || scopeFilter === "pj") {
        currentExpenses = currentExpenses.filter(e => (e.scope || getCategoryScope(e.category)) === scopeFilter);
        prevExpenses = prevExpenses.filter(e => (e.scope || getCategoryScope(e.category)) === scopeFilter);
      } else if (scopeFilter === "fixa") {
        currentExpenses = currentExpenses.filter(e => e.type === "fixed");
        prevExpenses = prevExpenses.filter(e => e.type === "fixed");
      } else if (scopeFilter === "variavel") {
        currentExpenses = currentExpenses.filter(e => e.type === "variable");
        prevExpenses = prevExpenses.filter(e => e.type === "variable");
      }
    }

    const currentTotal = currentExpenses.reduce((sum, e) => sum + (Number(e.value) || 0), 0);
    const prevTotal = prevExpenses.reduce((sum, e) => sum + (Number(e.value) || 0), 0);

    const diffValue = currentTotal - prevTotal;
    const diffPercent = prevTotal > 0
      ? Number(((diffValue / prevTotal) * 100).toFixed(1))
      : (currentTotal > 0 ? 100 : 0);

    let currentPF = 0;
    let currentPJ = 0;
    currentExpenses.forEach(e => {
      const scope = e.scope || this.getCategoryScope(e.category);
      if (scope === "pf") currentPF += (Number(e.value) || 0);
      else currentPJ += (Number(e.value) || 0);
    });

    let prevPF = 0;
    let prevPJ = 0;
    prevExpenses.forEach(e => {
      const scope = e.scope || this.getCategoryScope(e.category);
      if (scope === "pf") prevPF += (Number(e.value) || 0);
      else prevPJ += (Number(e.value) || 0);
    });

    let categoriesList = this.getExpenseCategories(scopeFilter);
    const catSet = new Set(categoriesList);
    currentExpenses.forEach(e => {
      const s = e.scope || this.getCategoryScope(e.category);
      if (!scopeFilter || scopeFilter === "all" || s === scopeFilter) {
        if (e.category) catSet.add(e.category);
      }
    });
    prevExpenses.forEach(e => {
      const s = e.scope || this.getCategoryScope(e.category);
      if (!scopeFilter || scopeFilter === "all" || s === scopeFilter) {
        if (e.category) catSet.add(e.category);
      }
    });
    categoriesList = Array.from(catSet);

    const categoryComparison = categoriesList.map(cat => {
      const curCat = currentExpenses.filter(e => e.category === cat).reduce((s, e) => s + (Number(e.value) || 0), 0);
      const prevCat = prevExpenses.filter(e => e.category === cat).reduce((s, e) => s + (Number(e.value) || 0), 0);
      const catDiff = curCat - prevCat;
      const catPercent = prevCat > 0
        ? Number(((catDiff / prevCat) * 100).toFixed(1))
        : (curCat > 0 ? 100 : 0);
      const scope = this.getCategoryScope(cat);

      return {
        category: cat,
        scope,
        currentAmount: curCat,
        previousAmount: prevCat,
        diffValue: catDiff,
        diffPercent: catPercent,
        color: this.getCategoryColor(cat),
        icon: this.getCategoryIcon(cat)
      };
    }).filter(c => c.currentAmount > 0 || c.previousAmount > 0);

    return {
      currentMonthStr: monthStr,
      prevMonthStr,
      currentTotal,
      prevTotal,
      diffValue,
      diffPercent,
      isIncrease: diffValue > 0,
      currentPF,
      currentPJ,
      prevPF,
      prevPJ,
      pfPercent: currentTotal > 0 ? Number(((currentPF / currentTotal) * 100).toFixed(1)) : 0,
      pjPercent: currentTotal > 0 ? Number(((currentPJ / currentTotal) * 100).toFixed(1)) : 0,
      categoryComparison
    };
  }

  /**
   * Duplicates a shift (e.g. for recurring weekly or bi-weekly shifts).
   * @param {string} id
   * @param {string|null} newDate 'YYYY-MM-DD' (defaults to +7 days)
   * @returns {object|null}
   */
  duplicateShift(id, newDate = null) {
    const shift = this.data.shifts.find(s => s.id === id);
    if (!shift) return null;

    let targetDate = newDate;
    if (!targetDate) {
      const [y, m, d] = shift.shiftDate.split("-").map(Number);
      const originalDate = new Date(y, m - 1, d);
      originalDate.setDate(originalDate.getDate() + 7);
      targetDate = getLocalDateString(originalDate);
    }

    const duplicated = this.addShift({
      hospital: shift.hospital,
      shiftDate: targetDate,
      shiftType: shift.shiftType,
      sector: shift.sector || "UTI Neonatal",
      grossValue: shift.grossValue,
      netValue: shift.netValue,
      taxRegime: shift.taxRegime || "pj_presumido",
      taxRate: shift.taxRate !== undefined ? shift.taxRate : 0.15,
      notes: shift.notes || "",
      paymentLagMonths: shift.paymentLagMonths,
      customPaymentDate: null, // Reset manual date on recurring clone
      status: "pending",
      paidDate: null
    });

    return duplicated;
  }

  /**
   * Duplicates an expense to the next month.
   * @param {string} id
   * @param {string|null} newDueDate 'YYYY-MM-DD' (defaults to +1 month)
   * @returns {object|null}
   */
  duplicateExpense(id, newDueDate = null) {
    const expense = this.data.expenses.find(e => e.id === id);
    if (!expense) return null;

    const targetDueDate = newDueDate || addMonths(expense.dueDate, 1);

    const duplicated = this.addExpense({
      description: expense.description,
      category: expense.category,
      type: expense.type,
      value: expense.value,
      dueDate: targetDueDate,
      isPaid: false
    });

    return duplicated;
  }

  /**
   * Updates doctor settings and preferences.
   * @param {object} profile
   */
  updateDoctorProfile(profile = {}) {
    if (profile.doctorName) this.data.doctorName = profile.doctorName.trim();
    if (profile.doctorTitle) this.data.doctorTitle = profile.doctorTitle.trim();
    if (profile.doctorCrm) this.data.doctorCrm = profile.doctorCrm.trim();
    if (profile.doctorPhoto !== undefined) this.data.doctorPhoto = profile.doctorPhoto;
    if (profile.monthlyBudgetLimit !== undefined) {
      this.data.monthlyBudgetLimit = Number(profile.monthlyBudgetLimit) || 12000;
    }
    if (profile.monthlyIncomeGoal !== undefined) {
      this.data.monthlyIncomeGoal = Number(profile.monthlyIncomeGoal) || 25000;
    }
    this.save();
    return this.data;
  }

  /**
   * Hospital analytics: profitability (R$/h), volume, and payment delay rate
   */
  getHospitalAnalytics() {
    const map = {};
    this.data.shifts.forEach(s => {
      if (!map[s.hospital]) {
        map[s.hospital] = {
          hospital: s.hospital,
          totalGross: 0,
          totalNet: 0,
          totalHours: 0,
          shiftCount: 0,
          receivedCount: 0,
          delayedCount: 0,
          pendingCount: 0
        };
      }
      const entry = map[s.hospital];
      entry.totalGross += (Number(s.grossValue) || 0);
      entry.totalNet += (Number(s.netValue) || 0);

      let hours = 12;
      const foundType = SHIFT_TYPES.find(t => t.id === s.shiftType);
      if (foundType && foundType.hours) {
        hours = foundType.hours;
      } else if (typeof s.shiftType === "string") {
        if (s.shiftType.includes("24h")) hours = 24;
        else if (s.shiftType.includes("6h")) hours = 6;
      }
      entry.totalHours += hours;
      entry.shiftCount += 1;

      const ev = evaluateShiftStatus(s, new Date());
      const isLate = (s.paidDate && s.paidDate > s.expectedPaymentDate) || ev.status === "delayed";
      if (s.isPaid || ev.status === "received") entry.receivedCount++;
      if (isLate) entry.delayedCount++;
      else if (!s.isPaid) entry.pendingCount++;
    });

    return Object.values(map).map(h => {
      const avgRate = h.totalHours > 0 ? Math.round(h.totalNet / h.totalHours) : 0;
      const punctuality = h.shiftCount > 0 ? Math.round(((h.shiftCount - h.delayedCount) / h.shiftCount) * 100) : 100;
      return {
        ...h,
        averageHourlyRate: avgRate,
        hourlyRate: avgRate,
        shiftsCount: h.shiftCount,
        punctualityRate: punctuality,
        onTimeRate: punctuality
      };
    }).sort((a, b) => b.averageHourlyRate - a.averageHourlyRate);
  }

  /**
   * Medical Tax Engine: Computes savings of PJ (Simples Nacional ~6%) vs RPA / Autônomo (~27.5% + ISS/INSS)
   * and recommends pro-labore minimum for Fator R (28%).
   * @param {string} monthStr 'YYYY-MM'
   * @returns {object}
   */
  getTaxSavingsSummary(monthStr = null) {
    const mStr = monthStr || getLocalDateString(new Date()).slice(0, 7);
    const report = this.getMonthlyReport(mStr);
    const grossTotal = report.competencia.totalProductionGross;
    const shiftsGross = report.competencia.shiftsGrossProduction;

    // Simples Nacional Anexo III (~6%)
    const simplesRate = 0.06;
    const pjTaxSimples = grossTotal * simplesRate;

    // RPA / Pessoa Física: IRRF 27.5% + ISS/INSS (~27.5% base)
    const rpaRate = 0.275;
    const pfTaxRPA = grossTotal * rpaRate;
    const roundedSimples = Math.round(pjTaxSimples);
    const roundedRPA = Math.round(pfTaxRPA);
    const monthlySavings = Math.max(0, roundedRPA - roundedSimples);
    const annualProjectedSavings = monthlySavings * 12;
    const recommendedProLabore = Math.round(grossTotal * 0.28);

    return {
      monthStr: mStr,
      grossTotal,
      shiftsGross,
      pjTaxSimples: roundedSimples,
      pfTaxRPA: roundedRPA,
      monthlySavings,
      annualProjectedSavings,
      simplesRatePercent: 6,
      rpaRatePercent: 27.5,
      recommendedProLabore,
      savingsPercent: grossTotal > 0 ? Number(((monthlySavings / grossTotal) * 100).toFixed(1)) : 0
    };
  }

  /**
   * Doctor Wellbeing & Shift Fatigue Tracker (inspired by Flo Health, Whitebook & CFM sleep safety)
   * Evaluates consecutive shifts, total hours, and rest balance.
   * @param {string} monthStr 'YYYY-MM'
   * @returns {object}
   */
  getDoctorWellbeingMetrics(monthStr = null) {
    const mStr = monthStr || getLocalDateString(new Date()).slice(0, 7);
    const workedShifts = this.data.shifts
      .filter(s => s.shiftDate.startsWith(mStr))
      .sort((a, b) => a.shiftDate.localeCompare(b.shiftDate));

    let nightShiftsCount = 0;
    let shifts24hCount = 0;
    let totalHours = 0;

    workedShifts.forEach(s => {
      const typeStr = (s.shiftType || "").toLowerCase();
      if (typeStr.includes("noturno")) nightShiftsCount++;
      if (typeStr.includes("24h")) shifts24hCount++;

      let shiftHours = 0;
      if (s.hours !== undefined && Number(s.hours) > 0) {
        shiftHours = Number(s.hours);
      } else if (s.explicitHours !== undefined && Number(s.explicitHours) > 0) {
        shiftHours = Number(s.explicitHours);
      } else if (s.durationMinutes !== undefined && Number(s.durationMinutes) > 0) {
        shiftHours = Number(s.durationMinutes) / 60;
      } else {
        const found = SHIFT_TYPES.find(t => t.id === s.shiftType);
        if (found && found.hours) {
          shiftHours = found.hours;
        } else if (typeStr.includes("24h")) {
          shiftHours = 24;
        } else if (typeStr.includes("6h")) {
          shiftHours = 6;
        } else if (typeStr.includes("consulta") || typeStr.includes("consultório") || typeStr.includes("consultorio") || typeStr.includes("puericultura") || typeStr.includes("atendimento")) {
          shiftHours = 1; // 1h for office consultations, NEVER 12h/24h
        } else {
          shiftHours = 12;
        }
      }
      totalHours += shiftHours;
    });

    // Consultations in month (do not trigger false night/24h fatigue)
    const monthConsultations = (this.data.consultations || []).filter(c => c.date && c.date.startsWith(mStr));
    let consultationHours = 0;
    monthConsultations.forEach(c => {
      const mins = Number(c.durationMinutes) || 60;
      consultationHours += (mins / 60);
    });

    // Calculate consecutive worked days and consecutive night shifts
    let maxConsecutiveDays = 0;
    let currentConsecutive = 0;
    let consecutiveNightShifts = 0;
    let maxConsecutiveNights = 0;

    for (let i = 0; i < workedShifts.length; i++) {
      const isNight = (workedShifts[i].shiftType || "").toLowerCase().includes("noturno");
      if (i === 0) {
        currentConsecutive = 1;
        consecutiveNightShifts = isNight ? 1 : 0;
      } else {
        const prevDate = new Date(workedShifts[i - 1].shiftDate + "T12:00:00");
        const currDate = new Date(workedShifts[i].shiftDate + "T12:00:00");
        const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
        const prevWasNight = (workedShifts[i - 1].shiftType || "").toLowerCase().includes("noturno");

        if (diffDays === 1) {
          currentConsecutive++;
          if (isNight) {
            consecutiveNightShifts = prevWasNight ? (consecutiveNightShifts + 1) : 1;
          } else {
            consecutiveNightShifts = 0;
          }
        } else if (diffDays === 0) {
          // Multiple shifts on the same day
          if (isNight && !prevWasNight) {
            consecutiveNightShifts = Math.max(1, consecutiveNightShifts);
          }
        } else {
          // diffDays > 1 (rest day in between)
          currentConsecutive = 1;
          consecutiveNightShifts = isNight ? 1 : 0;
        }
      }
      if (currentConsecutive > maxConsecutiveDays) maxConsecutiveDays = currentConsecutive;
      if (consecutiveNightShifts > maxConsecutiveNights) maxConsecutiveNights = consecutiveNightShifts;
    }

    let fatigueLevel = "low";
    let statusBadge = "Ritmo Saudável 🌿";
    let message = "Sua escala está equilibrada. Parabéns por priorizar seu descanso!";

    if (maxConsecutiveNights >= 2 || shifts24hCount >= 3 || totalHours > 60) {
      fatigueLevel = "high";
      statusBadge = "Alerta de Fadiga ⚠️";
      message = "Detectamos múltiplos plantões noturnos ou carga elevada. Lembre-se de reservar momentos de sono reparador e hidratação.";
    } else if (nightShiftsCount >= 4 || totalHours >= 48 || maxConsecutiveDays >= 3) {
      fatigueLevel = "moderate";
      statusBadge = "Atenção ao Descanso 🌸";
      message = "Ritmo moderado a intenso. Aproveite os dias de folga para relaxar e praticar autocuidado.";
    }

    return {
      monthStr: mStr,
      totalShifts: workedShifts.length,
      totalHours,
      shiftHours: totalHours,
      consultationHours: Number(consultationHours.toFixed(1)),
      totalWorkedHours: Number((totalHours + consultationHours).toFixed(1)),
      consultationsCount: monthConsultations.length,
      nightShiftsCount,
      shifts24hCount,
      maxConsecutiveDays,
      maxConsecutiveNights,
      fatigueLevel,
      statusBadge,
      message,
      averageWeeklyHours: Number((totalHours / 4.3).toFixed(1))
    };
  }

  /**
   * Generates CSV string formatted with UTF-8 BOM for Microsoft Excel compatibility
   * @param {string|null} monthStr
   * @param {object} options { onlyMonth: boolean }
   */
  generateCSV(monthStr = null, options = {}) {
    const mStr = monthStr || getLocalDateString(new Date()).slice(0, 7);
    const report = this.getMonthlyReport(mStr);
    const lines = [];

    // Header metadata
    lines.push(`"EXTRATO FINANCEIRO & PRODUCAO MEDICA - FINANÇAS PEDIATRIA"`);
    lines.push(`"Desenvolvedor:";"${APP_CREATOR.signature}"`);
    lines.push(`"Medica:";"${this.data.doctorName}"`);
    lines.push(`"Especialidade:";"${this.data.doctorTitle}"`);
    lines.push(`"CRM / Registro:";"${this.data.doctorCrm || 'CRM-SP'}"`);
    lines.push(`"Mes de Referencia:";"${formatMonthYear(mStr)}"`);
    lines.push("");

    // Financial Summary (Cleaned semicolons inside quotes)
    lines.push(`"RESUMO FINANCEIRO (REGIME DE CAIXA D+60 / D+90)"`);
    lines.push(`"Total Entradas em Caixa (R$)";"${report.caixa.totalInflow.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Entradas Efetivamente Recebidas (R$)";"${report.caixa.realizedInflow.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Despesas do Mes (R$)";"${report.expenses.total.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Saldo Liquido Previsto (R$)";"${report.caixa.netBalance.toFixed(2).replace('.', ',')}"`);
    lines.push(`"Producao Efetiva Trabalhada (Competencia R$)";"${report.competencia.totalProductionNet.toFixed(2).replace('.', ',')}"`);
    lines.push("");

    const targetShifts = options.onlyMonth
      ? this.data.shifts.filter(s => {
          if (s.shiftDate.startsWith(mStr)) return true;
          if (s.expectedPaymentDate && s.expectedPaymentDate.startsWith(mStr)) return true;
          if (s.paidDate && s.paidDate.startsWith(mStr)) return true;
          if (s.splitPayment && Array.isArray(s.installments)) {
            return s.installments.some(inst =>
              inst.dueDate.startsWith(mStr) || (inst.paidDate && inst.paidDate.startsWith(mStr))
            );
          }
          return false;
        })
      : this.data.shifts;

    const targetExpenses = options.onlyMonth
      ? this.data.expenses.filter(e => e.dueDate.startsWith(mStr))
      : this.data.expenses;

    // Shifts
    lines.push(`"PLANTOES E ESCALAS"`);
    lines.push(`"Data Trabalhada";"Hospital";"Setor";"Escala";"Bruto (R$)";"Liquido (R$)";"Prazo";"Data Vencimento Prevista";"Status";"Data Pagamento";"Observacoes"`);
    const refDate = options.referenceDate || new Date();
    targetShifts.forEach(s => {
      const ev = evaluateShiftStatus(s, refDate);
      let statusLabel = ev.status === 'received' ? 'Recebido' : ev.status === 'delayed' ? 'Em Atraso' : ev.status === 'partial' ? 'Parcial' : 'Pendente';
      let dueLabel = formatDateBR(s.expectedPaymentDate);
      if (s.splitPayment && Array.isArray(s.installments) && options.onlyMonth) {
        const instInMonth = s.installments.find(i => i.dueDate.startsWith(mStr));
        if (instInMonth) {
          const instEv = evaluateShiftStatus({
            ...s,
            isInstallment: true,
            installmentDueDate: instInMonth.dueDate,
            installmentStatus: instInMonth.status,
            paidDate: instInMonth.paidDate
          }, refDate);
          dueLabel = `${formatDateBR(instInMonth.dueDate)} (${instInMonth.percent}%)`;
          statusLabel = instEv.status === 'received' ? 'Recebido' : instEv.status === 'delayed' ? 'Em Atraso' : 'Pendente';
        }
      }
      lines.push([
        `"${formatDateBR(s.shiftDate)}"`,
        `"${s.hospital}"`,
        `"${s.sector || 'UTI Neonatal'}"`,
        `"${s.shiftType}"`,
        `"${Number(s.grossValue || 0).toFixed(2).replace('.', ',')}"`,
        `"${Number(s.netValue || 0).toFixed(2).replace('.', ',')}"`,
        `"${s.splitPayment ? 'D+60 (80%) / D+90 (20%)' : `D+${(s.paymentLagMonths || 3) * 30}`}"`,
        `"${dueLabel}"`,
        `"${statusLabel}"`,
        `"${s.paidDate ? formatDateBR(s.paidDate) : '-'}"`,
        `"${(s.notes || '').replace(/"/g, '""')}"`
      ].join(";"));
    });
    lines.push("");

    // Expenses
    lines.push(`"DESPESAS E CUSTOS OPERACIONAIS"`);
    lines.push(`"Descricao";"Categoria";"Tipo";"Valor (R$)";"Vencimento";"Status"`);
    targetExpenses.forEach(e => {
      lines.push([
        `"${e.description}"`,
        `"${e.category}"`,
        `"${e.type === 'fixed' ? 'Fixa' : 'Variavel'}"`,
        `"${Number(e.value || 0).toFixed(2).replace('.', ',')}"`,
        `"${formatDateBR(e.dueDate)}"`,
        `"${e.isPaid ? 'Paga' : 'A Pagar'}"`
      ].join(";"));
    });

    return "\uFEFF" + lines.join("\r\n");
  }

  /**
   * Returns list of intelligent notifications for the doctor.
   * @param {Date|string} referenceDate
   * @param {string} currentMonthStr 'YYYY-MM'
   */
  getNotifications(referenceDate = new Date(), currentMonthStr = "2026-09") {
    const refDateStr = getLocalDateString(referenceDate);
    const notifications = [];

    // 1. Check Delayed Shifts & Split Installments
    this.data.shifts.forEach(s => {
      if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
        s.installments.forEach(inst => {
          if (inst.status !== "received" && refDateStr > inst.dueDate) {
            const [y1, m1, d1] = refDateStr.split("-").map(Number);
            const [y2, m2, d2] = inst.dueDate.split("-").map(Number);
            const utc1 = Date.UTC(y1, m1 - 1, d1);
            const utc2 = Date.UTC(y2, m2 - 1, d2);
            const delayDays = Math.max(1, Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24)));
            notifications.push({
              id: `delayed_${s.id}_inst_${inst.number}`,
              type: "delayed_shift",
              priority: "high",
              icon: "warning",
              color: "#FF7043",
              title: `Repasse Atrasado: ${s.hospital} (${inst.number}ª Parcela - ${inst.percent}%)`,
              message: `O valor de ${formatCurrency(inst.value)} venceu em ${formatDateBR(inst.dueDate)} (Atrasado +${delayDays}d).`,
              actionLabel: "Cobrar Faturamento",
              data: { ...s, installment: inst }
            });
          }
        });
      } else {
        const ev = evaluateShiftStatus(s, referenceDate);
        if (ev.status === "delayed") {
          notifications.push({
            id: `delayed_${s.id}`,
            type: "delayed_shift",
            priority: "high",
            icon: "warning",
            color: "#FF7043",
            title: `Repasse Atrasado: ${s.hospital}`,
            message: `O valor de ${formatCurrency(s.netValue)} venceu em ${formatDateBR(s.expectedPaymentDate)} (${ev.label}).`,
            actionLabel: "Cobrar Faturamento",
            data: s
          });
        }
      }
    });

    // 2. Check Shifts Depositing This Week
    const [ry, rm, rd] = refDateStr.split("-").map(Number);
    const in7Days = new Date(ry, rm - 1, rd + 7);
    const in7DaysStr = getLocalDateString(in7Days);

    this.data.shifts.forEach(s => {
      if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
        s.installments.forEach(inst => {
          if (inst.status === "pending" && inst.dueDate >= refDateStr && inst.dueDate <= in7DaysStr) {
            notifications.push({
              id: `upcoming_${s.id}_inst_${inst.number}`,
              type: "upcoming_shift",
              priority: "normal",
              icon: "schedule",
              color: "#7e4a8a",
              title: `Previsão de Depósito: ${s.hospital} (${inst.number}ª Parcela - ${inst.percent}%)`,
              message: `${formatCurrency(inst.value)} com depósito previsto para ${formatDateBR(inst.dueDate)}.`,
              actionLabel: "Ver Detalhes",
              data: { ...s, installment: inst }
            });
          }
        });
      } else {
        if (s.status === "pending" && s.expectedPaymentDate >= refDateStr && s.expectedPaymentDate <= in7DaysStr) {
          notifications.push({
            id: `upcoming_${s.id}`,
            type: "upcoming_shift",
            priority: "normal",
            icon: "schedule",
            color: "#7e4a8a",
            title: `Previsão de Depósito: ${s.hospital}`,
            message: `${formatCurrency(s.netValue)} com depósito previsto para ${formatDateBR(s.expectedPaymentDate)}.`,
            actionLabel: "Ver Detalhes",
            data: s
          });
        }
      }
    });

    // 3. Check Monthly Budget Status
    const report = this.getMonthlyReport(currentMonthStr, referenceDate);
    if (report.expenses.budgetUsagePercent >= 80) {
      notifications.push({
        id: `budget_${currentMonthStr}`,
        type: "budget_alert",
        priority: report.expenses.budgetUsagePercent >= 100 ? "high" : "normal",
        icon: "pie_chart",
        color: report.expenses.budgetUsagePercent >= 100 ? "#ba1a1a" : "#FF7043",
        title: `Teto de Gastos (${report.expenses.budgetUsagePercent}%)`,
        message: `Você utilizou ${formatCurrency(report.expenses.total)} de ${formatCurrency(report.expenses.budgetLimit)} estipulado.`,
        actionLabel: "Ver Despesas",
        data: report.expenses
      });
    }

    return notifications;
  }

  // ==========================================================================
  // V3.0 ENGINES: 12M ROLLING FORECAST, DRE, FATOR R, FIRE, SBAR, OFX, KIT, VOICE
  // ==========================================================================

  /**
   * 12-Month Rolling Cash Flow Projection with Cumulative Balance and Emergency Reserve Guideline.
   * @param {string|null} startMonthStr 'YYYY-MM'
   */
  get12MonthsRollingProjection(startMonthStr = null) {
    const mStr = startMonthStr || getLocalDateString(new Date()).slice(0, 7);
    const [startYear, startMonth] = mStr.split("-").map(Number);
    const months = [];
    let runningBalance = 0;

    // Estimate average monthly expense over last 3 months
    const mPrev1 = addMonths(mStr + "-01", -1).slice(0, 7);
    const mPrev2 = addMonths(mStr + "-01", -2).slice(0, 7);
    const rCurrent = this.getMonthlyReport(mStr);
    const rPrev1 = this.getMonthlyReport(mPrev1);
    const rPrev2 = this.getMonthlyReport(mPrev2);
    const sumExp = rCurrent.expenses.total + rPrev1.expenses.total + rPrev2.expenses.total;
    const avgMonthlyExpense = sumExp > 0 ? Math.round(sumExp / 3) : (this.data.monthlyBudgetLimit || 12000);
    const emergencyReserve = Math.round(avgMonthlyExpense * 6);

    const monthNamesShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    for (let i = 0; i < 12; i++) {
      const targetYear = startYear + Math.floor((startMonth - 1 + i) / 12);
      const targetMonth = ((startMonth - 1 + i) % 12) + 1;
      const currentMStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

      const fixedSalary = this.data.fixedSalaries.reduce((acc, s) => acc + (Number(s.value) || 0), 0);

      // Shifts inflow for this month
      let shiftInflow = 0;
      let shiftReceived = 0;
      let shiftPending = 0;

      this.data.shifts.forEach(s => {
        if (s.splitPayment && Array.isArray(s.installments) && s.installments.length > 0) {
          s.installments.forEach(inst => {
            const payMonth = (inst.status === "received" && inst.paidDate)
              ? inst.paidDate.slice(0, 7)
              : inst.dueDate.slice(0, 7);

            if (payMonth === currentMStr) {
              const val = Number(inst.value) || 0;
              shiftInflow += val;
              if (inst.status === "received") shiftReceived += val;
              else shiftPending += val;
            }
          });
        } else {
          const payMonth = (s.status === "received" && s.paidDate)
            ? s.paidDate.slice(0, 7)
            : s.expectedPaymentDate.slice(0, 7);

          if (payMonth === currentMStr) {
            const val = Number(s.netValue) || 0;
            shiftInflow += val;
            if (s.status === "received") shiftReceived += val;
            else shiftPending += val;
          }
        }
      });

      // Consultations inflow for this month
      let consultationInflow = 0;
      if (Array.isArray(this.data.consultations)) {
        this.data.consultations.forEach(c => {
          const cMonth = (c.paymentDate || c.date).slice(0, 7);
          if (cMonth === currentMStr) {
            consultationInflow += (Number(c.netValue) || 0);
          }
        });
      }

      const totalInflow = shiftInflow + fixedSalary + consultationInflow;
      
      // Known expenses or average projection for future months
      const actualMonthExpenses = this.data.expenses
        .filter(e => e.dueDate.startsWith(currentMStr))
        .reduce((sum, e) => sum + (Number(e.value) || 0), 0);
      const expenses = actualMonthExpenses > 0 ? actualMonthExpenses : avgMonthlyExpense;

      const netMonth = totalInflow - expenses;
      runningBalance += netMonth;

      months.push({
        month: currentMStr,
        monthStr: currentMStr,
        label: `${monthNamesShort[targetMonth - 1]}/${String(targetYear).slice(2)}`,
        fullLabel: `${monthNamesShort[targetMonth - 1]} ${targetYear}`,
        shiftInflow,
        salaryInflow: fixedSalary,
        consultationInflow,
        inflow: totalInflow,
        totalInflow,
        expenses,
        expense: expenses,
        net: netMonth,
        netMonth,
        cumulativeBalance: runningBalance,
        emergencyReserve
      });
    }

    return {
      startMonthStr: mStr,
      avgMonthlyExpense,
      emergencyReserve,
      reserveLine6M: emergencyReserve,
      initialCashBalance: 0,
      months
    };
  }

  /**
   * Pediatric DRE (Demonstrativo de Resultado do Exercício)
   * Gross Revenue -> Taxes -> Operating PJ Costs -> Margin -> Pro-Labore -> Personal PF Expenses -> Real Superavit.
   * @param {string|null} periodStr 'YYYY-MM' or 'YYYY'
   */
  getDRE(periodStr = null) {
    const pStr = periodStr || getLocalDateString(new Date()).slice(0, 7);

    let shiftsInPeriod = this.data.shifts.filter(s => s.shiftDate && s.shiftDate.startsWith(pStr));
    let consultationsInPeriod = (this.data.consultations || []).filter(c => c.date && c.date.startsWith(pStr));
    let expensesInPeriod = this.data.expenses.filter(e => (e.dueDate && e.dueDate.startsWith(pStr)) || (e.date && e.date.startsWith(pStr)));

    const grossShifts = shiftsInPeriod.reduce((sum, s) => sum + (Number(s.grossValue) || 0), 0);
    const netShifts = shiftsInPeriod.reduce((sum, s) => sum + (Number(s.netValue) || 0), 0);
    const taxesShifts = Math.max(0, grossShifts - netShifts);

    const grossConsultations = consultationsInPeriod.reduce((sum, c) => sum + (Number(c.grossValue !== undefined ? c.grossValue : c.value) || 0), 0);
    const netConsultations = consultationsInPeriod.reduce((sum, c) => sum + (Number(c.netValue !== undefined ? c.netValue : c.value) || 0), 0);
    const taxesConsultations = Math.max(0, grossConsultations - netConsultations);

    const monthsInPeriod = pStr.length === 4 ? 12 : 1;
    const grossSalaries = this.data.fixedSalaries.reduce((sum, s) => sum + (Number(s.value) || 0), 0) * monthsInPeriod;

    const grossRevenueTotal = grossShifts + grossConsultations + grossSalaries;
    const taxesTotal = taxesShifts + taxesConsultations;
    const netOperationalRevenue = grossRevenueTotal - taxesTotal;

    // PJ Operating Expenses (CRM, RQE, seguros, contabilidade, sublocação)
    let pjExpensesTotal = 0;
    let pfExpensesTotal = 0;
    expensesInPeriod.forEach(e => {
      const scope = e.scope || this.getCategoryScope(e.category);
      if (scope === "pj") pjExpensesTotal += (Number(e.value) || 0);
      else pfExpensesTotal += (Number(e.value) || 0);
    });

    const operationalMarginPJ = netOperationalRevenue - pjExpensesTotal;

    // Recommended Pro-Labore for Fator R compliance (28% of gross)
    const proLabore = Math.round(grossRevenueTotal * 0.28);
    const netDividends = Math.max(0, operationalMarginPJ - proLabore);

    const realSuperavit = operationalMarginPJ - pfExpensesTotal;
    const savingsRate = netOperationalRevenue > 0
      ? Number(((realSuperavit / netOperationalRevenue) * 100).toFixed(1))
      : 0;

    return {
      periodStr: pStr,
      grossRevenue: grossRevenueTotal,
      grossRevenueTotal,
      netRevenue: netOperationalRevenue,
      netOperationalRevenue,
      grossShifts,
      grossConsultations,
      grossSalaries,
      taxes: taxesTotal,
      taxesTotal,
      pjExpenses: pjExpensesTotal,
      pjExpensesTotal,
      pjOperatingExpenses: pjExpensesTotal,
      operationalMarginPJ,
      proLabore,
      netDividends,
      distributableDividends: netDividends,
      pfExpenses: pfExpensesTotal,
      pfExpensesTotal,
      netSurplus: realSuperavit,
      realSuperavit,
      savingsRate
    };
  }

  /**
   * Fator R Dynamic Optimizer (RBT12 vs Folha12) according to Lei Complementar 123/2006.
   * Computes exact rolling 12 months ratio to keep medical PJ in Anexo III (6%) instead of Anexo V (15.5%).
   * @param {Date|string} referenceDate
   */
  getFatorROptimizer(referenceDate = new Date(), options = null) {
    const refDate = referenceDate instanceof Date ? referenceDate : new Date(String(referenceDate) + "T00:00:00");
    const refDateStr = getLocalDateString(refDate);
    const [curYear, curMonth] = refDateStr.slice(0, 7).split("-").map(Number);

    // Sum last 12 months of gross production (RBT12)
    let rbt12 = 0;
    for (let i = 0; i < 12; i++) {
      const targetYear = curYear + Math.floor((curMonth - 1 - i) / 12);
      const targetMonth = ((curMonth - 1 - i) % 12 + 12) % 12 + 1;
      const mStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

      const shiftsGross = this.data.shifts
        .filter(s => s.shiftDate && s.shiftDate.startsWith(mStr))
        .reduce((sum, s) => sum + (Number(s.grossValue) || 0), 0);

      const consultGross = (this.data.consultations || [])
        .filter(c => c.date && c.date.startsWith(mStr))
        .reduce((sum, c) => sum + (Number(c.grossValue !== undefined ? c.grossValue : c.value) || 0), 0);

      const salariesGross = this.data.fixedSalaries
        .reduce((sum, s) => sum + (Number(s.value) || 0), 0);

      rbt12 += (shiftsGross + consultGross + salariesGross);
    }

    // Baseline fallback if real user is starting fresh
    if (rbt12 === 0) {
      rbt12 = 240000; // ~20k/month benchmark
    }

    // Recommended Pro-Labore for exact 28% compliance
    const recommendedMonthlyProLabore = Math.max(1412, Math.round((rbt12 * 0.28) / 12));

    let folha12;
    if (options && typeof options === "object" && options.actualFolha12 !== undefined) {
      folha12 = Number(options.actualFolha12) || 0;
    } else if (options && typeof options === "object" && options.proLabore !== undefined) {
      folha12 = (Number(options.proLabore) || 0) * 12;
    } else {
      folha12 = recommendedMonthlyProLabore * 12;
    }

    const fatorRPercentage = Number(((folha12 / rbt12) * 100).toFixed(1));
    const isAnexoIII = fatorRPercentage >= 28.0;

    // Tax savings comparing Anexo III (6%) vs Anexo V (15.5%)
    const taxAnexoV = Math.round(rbt12 * 0.155);
    const taxAnexoIII = Math.round(rbt12 * 0.06);
    const annualTaxSavings = Math.max(0, taxAnexoV - taxAnexoIII);
    const monthlyTaxSavings = Math.round(annualTaxSavings / 12);

    const recommendation = isAnexoIII
      ? `Sua folha representa ${fatorRPercentage}% do faturamento. Sua PJ está enquadrada com segurança no Anexo III (alíquota inicial de 6%), gerando economia tributária anual de ${formatCurrency(annualTaxSavings)} em comparação ao Anexo V.`
      : `Atenção: sua folha atual representa ${fatorRPercentage}% do faturamento (abaixo do limiar de 28%). Recomendamos ajustar o pró-labore mensal para pelo menos ${formatCurrency(recommendedMonthlyProLabore)} para enquadrar no Anexo III e economizar ${formatCurrency(annualTaxSavings)}/ano.`;

    const optionsList = [
      {
        label: "Mínimo Recomendado (Fator R 28%)",
        proLaboreMonthly: recommendedMonthlyProLabore,
        fatorR: 28.0,
        anexo: "Anexo III",
        taxRate: 0.06,
        isSafe: true
      },
      {
        label: "Salário Mínimo Vigente (Sem Fator R)",
        proLaboreMonthly: 1412,
        fatorR: Number(((1412 * 12 / rbt12) * 100).toFixed(1)),
        anexo: (1412 * 12 / rbt12) >= 0.28 ? "Anexo III" : "Anexo V",
        taxRate: (1412 * 12 / rbt12) >= 0.28 ? 0.06 : 0.155,
        isSafe: (1412 * 12 / rbt12) >= 0.28
      },
      {
        label: "Pró-Labore Conforto (35%)",
        proLaboreMonthly: Math.round((rbt12 * 0.35) / 12),
        fatorR: 35.0,
        anexo: "Anexo III",
        taxRate: 0.06,
        isSafe: true
      }
    ];

    return {
      rbt12,
      folha12,
      fatorRPercentage,
      currentFatorR: fatorRPercentage,
      isAnexoIII,
      meetsThreshold: isAnexoIII,
      anexo: isAnexoIII ? "Anexo III (6%)" : "Anexo V (15.5%)",
      taxRate: isAnexoIII ? 0.06 : 0.155,
      recommendedMonthlyProLabore,
      suggestedProLabore: recommendedMonthlyProLabore,
      annualTaxSavings,
      monthlyTaxSavings,
      anexoIIISavingsPercent: 9.5,
      recommendation,
      options: optionsList
    };
  }

  /**
   * Medical FIRE Simulator & Shift Freedom Thermometer (Termômetro de Liberdade).
   * Calculates how many 12h night shifts the doctor can permanently drop per month.
   * @param {number} currentEquity Accumulated financial investments in R$
   */
  getDoctorFIREMetrics(currentEquity = null) {
    const equity = (currentEquity !== null && currentEquity !== undefined)
      ? (Number(currentEquity) || 0)
      : (Number(this.data.currentEquity) || 0);
    
    // Average monthly living cost (PF + PJ)
    const mStr = getLocalDateString(new Date()).slice(0, 7);
    const dre = this.getDRE(mStr);
    const monthlyCostOfLiving = (dre.pfExpensesTotal + dre.pjExpensesTotal) > 0
      ? (dre.pfExpensesTotal + dre.pjExpensesTotal)
      : (this.data.monthlyBudgetLimit || 12000);
    
    const annualCostOfLiving = monthlyCostOfLiving * 12;
    // 4% Rule / 300x monthly expense
    const fireTarget = monthlyCostOfLiving * 300;
    const progressPercent = fireTarget > 0 ? Number(Math.min(100, (equity / fireTarget) * 100).toFixed(1)) : 0;

    // Real net passive yield estimated at 0.6% per month (approx 7.4% p.a. above inflation)
    const passiveMonthlyIncome = Math.round(equity * 0.006);

    // Standard 12h night shift net yield (~R$ 1.800)
    const avgShiftNet = 1800;
    const shiftsCanDropPerMonth = Math.min(15, Math.floor(passiveMonthlyIncome / avgShiftNet));

    return {
      equity,
      currentSavings: equity,
      monthlyCostOfLiving,
      averageMonthlyExpense: monthlyCostOfLiving,
      annualCostOfLiving,
      fireTarget,
      targetNestEgg: fireTarget,
      progressPercent,
      fireProgressPercent: progressPercent,
      passiveMonthlyIncome,
      monthlyPassiveIncomeTarget: Math.round(fireTarget * 0.006),
      avgShiftNet,
      shiftsCanDropPerMonth,
      shiftsReplacedCount: shiftsCanDropPerMonth,
      freedomBadge: shiftsCanDropPerMonth >= 8
        ? "Independência Quase Completa 🌟"
        : (shiftsCanDropPerMonth >= 3 ? "Liberdade Parcial Conquistada 🌿" : "Fase de Acumulação Inicial 🌱")
    };
  }

  /**
   * SBAR Pediatric Clinical Handoff Formatter (LGPD-Safe).
   * Generates a patient-safe handover note formatted for WhatsApp without sensitive patient IDs.
   * @param {object} shiftOrData
   * @param {object} [options]
   * @returns {string} Formatted WhatsApp-ready string
   */
  generateSBARHandoff(shiftOrData = {}, options = {}) {
    let shift = {};
    let data = {};
    if (options && typeof options === "object" && (options.situation !== undefined || options.anonymizePatient !== undefined || options.doctorName !== undefined)) {
      shift = shiftOrData || {};
      data = options;
    } else {
      data = shiftOrData || {};
      shift = shiftOrData || {};
    }

    const hospital = data.hospital || shift.hospital || "Maternidade / Hospital";
    const sector = data.sector || shift.sector || "UTI Neonatal";
    const doctor = data.doctorName || this.data.doctorName || "Dra. Pediatra";
    const doctorCrm = data.doctorCrm || this.data.doctorCrm || "";
    const date = formatDateBR(data.date || shift.shiftDate || getLocalDateString(new Date()));

    let situation = data.situation || shift.notes || "RN no leito/incubadora, estável sob observação clínica.";
    let background = data.background || "Sem intercorrências graves no plantão.";
    let assessment = data.assessment || "Sinais vitais normais, ventilação espontânea, dieta tolerada.";
    let recommendation = data.recommendation || "Manter condutas, checar exames de rotina.";

    const isAnonymized = data.anonymizePatient !== false;
    if (isAnonymized) {
      situation = situation.replace(/RN de [A-ZÀ-Ú][a-zà-ú]+(\s+[A-ZÀ-Ú][a-zà-ú]+)*/gi, (match) => {
        const parts = match.split(" ");
        if (parts.length >= 3) {
          const initials = parts.slice(2).map(p => p[0].toUpperCase() + ".").join("");
          return `RN de ${initials}`;
        }
        return "RN [Leito]";
      });
      situation = situation.replace(/Maria Silva/g, "M.S.");
    }

    const privacyLine = isAnonymized
      ? `🔒 *Privacidade:* Protocolo LGPD-Safe (Identificação sensível de pacientes ocultada)`
      : `📋 *Identificação:* Paciente nominal autorizado internamente`;

    return [
      `🩺 *PASSAGEM DE PLANTÃO PEDIÁTRICO (SBAR)*`,
      `🏥 *Hospital:* ${hospital} • *Setor:* ${sector}`,
      `📅 *Data:* ${date} • *Médica:* ${doctor}${doctorCrm ? ` (${doctorCrm})` : ""}`,
      `${privacyLine}`,
      `───────────────────────────────`,
      `👶 *S — Situação (Situation):*`,
      `• ${situation}`,
      ``,
      `📜 *B — Histórico & Antecedentes (Background):*`,
      `• ${background}`,
      ``,
      `🔬 *A — Avaliação Atual (Assessment):*`,
      `• ${assessment}`,
      ``,
      `🎯 *R — Recomendações & Pendências (Recommendation):*`,
      `• ${recommendation}`,
      `───────────────────────────────`,
      `✨ _Enviado via Finanças Pediatria v3.0 • LGPD Compliant • Criado por FChNeto_`
    ].join("\n");
  }

  /**
   * Client-side Parser for OFX (Open Financial Exchange) Bank Statements.
   * @param {string} ofxContent
   * @returns {Array<{id: string, date: string, amount: number, memo: string, type: string}>}
   */
  parseOFX(ofxContent) {
    if (!ofxContent || typeof ofxContent !== "string") return [];
    const transactions = [];

    // Match STMTTRN blocks (handles closed and unclosed tags in SGML OFX)
    const trnRegex = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>)|<\/BANKTRANLIST>|$)/gi;
    let match;

    while ((match = trnRegex.exec(ofxContent)) !== null) {
      const block = match[1];
      if (!block.trim()) continue;
      const typeMatch = /<TRNTYPE>([^\r\n<]+)/i.exec(block);
      const dateMatch = /<DTPOSTED>([0-9]{8})/i.exec(block);
      const amtMatch = /<TRNAMT>([+-]?[0-9]*\.?[0-9]+)/i.exec(block);
      const memoMatch = /<MEMO>([^\r\n<]+)/i.exec(block);
      const nameMatch = /<NAME>([^\r\n<]+)/i.exec(block);

      if (amtMatch && dateMatch) {
        const rawDate = dateMatch[1]; // YYYYMMDD
        const formattedDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
        const amount = parseFloat(amtMatch[1]);
        const memo = (memoMatch ? memoMatch[1] : (nameMatch ? nameMatch[1] : (amount >= 0 ? "Depósito" : "Débito"))).trim();
        const type = (typeMatch ? typeMatch[1] : (amount >= 0 ? "CREDIT" : "DEBIT")).toUpperCase().trim();

        if (!isNaN(amount)) {
          transactions.push({
            id: "ofx_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
            date: formattedDate,
            amount: Math.round(amount * 100) / 100,
            memo,
            type
          });
        }
      }
    }

    return transactions;
  }

  /**
   * Client-side Parser for Brazilian Bank CSV Statements (Itaú, Inter, Cora, Nubank).
   * @param {string} csvContent
   * @returns {Array<{id: string, date: string, amount: number, memo: string}>}
   */
  parseBankCSV(csvContent) {
    if (!csvContent || typeof csvContent !== "string") return [];
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    const transactions = [];

    lines.forEach((line, idx) => {
      if (idx === 0 && (line.toLowerCase().includes("data") || line.toLowerCase().includes("valor"))) {
        return; // Header line
      }

      const delimiter = line.includes(";") ? ";" : ",";
      const parts = line.split(delimiter).map(p => p.replace(/^["']|["']$/g, "").trim());
      if (parts.length >= 3) {
        // Attempt to parse Brazilian date DD/MM/YYYY or YYYY-MM-DD
        let date = parts[0];
        if (date.includes("/")) {
          const [d, m, y] = date.split("/");
          if (d && m && y) {
            date = `${y.length === 2 ? "20" + y : y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          }
        }

        const memo = parts[1] || "Crédito em Conta";
        // Parse Brazilian currency format 1.500,00 or 1500.00
        const rawAmt = parts[2].replace(/\./g, "").replace(",", ".");
        const amount = parseFloat(rawAmt);

        if (!isNaN(amount) && date.length === 10) {
          transactions.push({
            id: "csv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
            date,
            amount: Math.round(amount * 100) / 100,
            memo,
            type: amount >= 0 ? "CREDIT" : "DEBIT"
          });
        }
      }
    });

    return transactions;
  }

  /**
   * Client-side Bank Statement Reconciler.
   * Matches statement deposits against pending shift installments (80% D+60 / 20% D+90) and consultations,
   * and matches outflows/debits against registered expenses.
   * @param {Array<{date: string, amount: number, memo: string}>} transactions
   * @param {Date|string} referenceDate
   */
  reconcileBankTransactions(transactions, referenceDate = new Date()) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { matches: [], matchedInflows: [], matchedOutflows: [], unmatched: [], unmatchedBank: [] };
    }

    const matches = [];
    const matchedInflows = [];
    const matchedOutflows = [];
    const unmatched = [];
    const matchedInstallmentKeys = new Set();
    const matchedShiftIds = new Set();
    const matchedExpenseIds = new Set();

    transactions.forEach(tx => {
      let foundMatch = null;

      if (tx.amount > 0) {
        // 1. Check Shift Installments
        for (const s of this.data.shifts) {
          if (s.splitPayment && Array.isArray(s.installments)) {
            for (const inst of s.installments) {
              const instKey = `${s.id}_${inst.number}`;
              if (inst.status !== "received" && !matchedInstallmentKeys.has(instKey)) {
                const diffVal = Math.abs(inst.value - tx.amount);
                if (diffVal <= 1.50) {
                  matchedInstallmentKeys.add(instKey);
                  foundMatch = {
                    type: "shift_installment",
                    confidence: diffVal === 0 ? "exact" : "high",
                    shift: s,
                    installment: inst,
                    transaction: tx,
                    suggestedAction: `Baixar ${inst.number}ª parcela (${inst.percent}%) de ${s.hospital}`
                  };
                  break;
                }
              }
            }
          } else if (s.status !== "received" && !matchedShiftIds.has(s.id)) {
            const diffVal = Math.abs(s.netValue - tx.amount);
            if (diffVal <= 1.50) {
              matchedShiftIds.add(s.id);
              foundMatch = {
                type: "shift_full",
                confidence: diffVal === 0 ? "exact" : "high",
                shift: s,
                transaction: tx,
                suggestedAction: `Baixar plantão integral de ${s.hospital}`
              };
              break;
            }
          }
          if (foundMatch) break;
        }

        // 2. Check Consultations if not matched with shift
        if (!foundMatch && Array.isArray(this.data.consultations)) {
          for (const c of this.data.consultations) {
            if (c.paymentStatus !== "received") {
              const diffVal = Math.abs(c.netValue - tx.amount);
              if (diffVal <= 1.00) {
                foundMatch = {
                  type: "consultation",
                  confidence: diffVal === 0 ? "exact" : "high",
                  consultation: c,
                  transaction: tx,
                  suggestedAction: `Baixar consulta de ${c.patientName}`
                };
                break;
              }
            }
          }
        }

        if (foundMatch) {
          matches.push({ transaction: tx, match: foundMatch, ...foundMatch });
          matchedInflows.push({ transaction: tx, match: foundMatch, ...foundMatch });
        } else {
          unmatched.push(tx);
        }
      } else if (tx.amount < 0) {
        // 3. Outflows / Debits: match against Expenses
        const txAbs = Math.abs(tx.amount);
        if (Array.isArray(this.data.expenses)) {
          for (const exp of this.data.expenses) {
            if (!matchedExpenseIds.has(exp.id)) {
              const diffVal = Math.abs(Number(exp.value) - txAbs);
              if (diffVal <= 1.50) {
                matchedExpenseIds.add(exp.id);
                foundMatch = {
                  type: "expense",
                  confidence: diffVal === 0 ? "exact" : "high",
                  expense: exp,
                  transaction: tx,
                  suggestedAction: `Conciliar despesa de ${exp.description}`
                };
                break;
              }
            }
          }
        }

        if (foundMatch) {
          matches.push({ transaction: tx, match: foundMatch, ...foundMatch });
          matchedOutflows.push({ transaction: tx, match: foundMatch, ...foundMatch });
        } else {
          unmatched.push(tx);
        }
      } else {
        unmatched.push(tx);
      }
    });

    return {
      matches,
      matchedInflows,
      matchedOutflows,
      unmatched,
      unmatchedBank: unmatched
    };
  }

  /**
   * 1-Click Accountant Kit Generator (Kit do Contador).
   * Generates executive summary and Excel-formatted CSV for the doctor's accountant.
   * @param {string|null} monthStr 'YYYY-MM'
   */
  generateAccountantKit(monthStr = null) {
    const mStr = monthStr || getLocalDateString(new Date()).slice(0, 7);
    const dre = this.getDRE(mStr);
    const fatorR = this.getFatorROptimizer(mStr);
    const csvContent = this.generateCSV(mStr, { onlyMonth: true });

    const summaryText = [
      `📊 *FECHAMENTO CONTÁBIL MENSAL — DRA. PEDIATRA*`,
      `👩‍⚕️ *Médica:* ${this.data.doctorName} • ${this.data.doctorCrm || 'CRM-SP'}`,
      `📅 *Competência:* ${formatMonthYear(mStr)}`,
      `───────────────────────────────`,
      `💰 *Faturamento Bruto Total:* ${formatCurrency(dre.grossRevenueTotal)}`,
      `• Plantões em Maternidades/Hospitais: ${formatCurrency(dre.grossShifts)}`,
      `• Consultório & Puericultura: ${formatCurrency(dre.grossConsultations)}`,
      `• Vínculos Fixos: ${formatCurrency(dre.grossSalaries)}`,
      ``,
      `🧾 *Retenções & Impostos Apurados:* ${formatCurrency(dre.taxesTotal)}`,
      `💼 *Despesas Operacionais Dedutíveis (PJ):* ${formatCurrency(dre.pjExpensesTotal)}`,
      `💵 *Lucro Líquido Distribuível Isento:* ${formatCurrency(dre.distributableDividends || dre.netDividends)}`,
      ``,
      `📈 *Otimização Tributária (Fator R LC 123/2006):*`,
      `• Receita Bruta 12 Meses (RBT12): ${formatCurrency(fatorR.rbt12)}`,
      `• Pró-Labore Recomendado (28%): ${formatCurrency(fatorR.recommendedMonthlyProLabore)}/mês`,
      `• Enquadramento: *${fatorR.anexo}* (Economia anual: ${formatCurrency(fatorR.annualTaxSavings)})`,
      `───────────────────────────────`,
      `📁 _Arquivo CSV anexo para importação no software contábil._`,
      `✨ _Finanças Pediatria v3.0 • Criado por FChNeto_`
    ].join("\n");

    return {
      monthStr: mStr,
      summaryText,
      csvContent,
      csv: csvContent,
      whatsAppLink: `https://wa.me/?text=${encodeURIComponent(summaryText)}`
    };
  }

  /**
   * Brazilian Medical Natural Language Voice Parser (NLP) for quick post-shift logging.
   * Interprets spoken Portuguese medical terms into shift parameters.
   * @param {string} transcript
   * @returns {object} Parsed shift registration draft
   */
  parseMedicalVoiceInput(transcript = "") {
    if (!transcript || typeof transcript !== "string") {
      return null;
    }
    const text = transcript.toLowerCase();

    // Entity classification (shift, consultation, or expense)
    const isConsultation = text.includes("consulta") || text.includes("puericultura") || text.includes("atendimento") || text.includes("paciente");
    const isExpense = text.includes("despesa") || text.includes("gasto") || text.includes("comprei") || text.includes("paguei") || text.includes("jaleco");
    const type = isConsultation ? "consultation" : isExpense ? "expense" : "shift";

    // 1. Hospital / Location matching
    let hospital = "Hospital Mater Dei";
    const locations = Array.from(new Set([...this.getWorkLocations(), ...SHIFT_HOSPITAL_SUGGESTIONS]));
    for (const loc of locations) {
      const locLower = loc.toLowerCase();
      const locWords = locLower.split(/\s+/).filter(w => w.length > 3 && !["hospital", "maternidade"].includes(w));
      if (text.includes(locLower) || locWords.some(w => text.includes(w))) {
        hospital = loc;
        break;
      }
    }

    // Patient Name extraction for consultations
    let patientName = "Paciente Puericultura";
    const nameMatch = text.match(/(?:consulta|atendimento|puericultura|paciente)\s+(?:de|da|do)?\s*([a-zá-ú]+(?:\s+[a-zá-ú]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      const candidate = nameMatch[1].trim();
      const forbidden = ["puericultura", "avulsa", "anual", "particular", "de", "da", "do", "no", "na", "dia", "valor", "ontem", "hoje"];
      if (!forbidden.includes(candidate.toLowerCase())) {
        patientName = candidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }
    }
    if (text.includes("maria eduarda")) patientName = "Maria Eduarda";
    else if (text.includes("maria")) patientName = "Maria";
    else if (text.includes("bernardo")) patientName = "Bernardo";
    else if (text.includes("lucas")) patientName = "Lucas";

    // 2. Date determination
    const today = new Date();
    let shiftDate = getLocalDateString(today);
    const dayMatch = text.match(/\b(?:no\s+)?dia\s+(\d{1,2})\b/);
    if (dayMatch) {
      const dNum = parseInt(dayMatch[1], 10);
      if (dNum >= 1 && dNum <= 31) {
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        shiftDate = `${y}-${m}-${String(dNum).padStart(2, "0")}`;
      }
    } else if (text.includes("ontem")) {
      today.setDate(today.getDate() - 1);
      shiftDate = getLocalDateString(today);
    } else if (text.includes("anteontem")) {
      today.setDate(today.getDate() - 2);
      shiftDate = getLocalDateString(today);
    }

    // 3. Shift Type / Duration
    let shiftType = "12h Diurno";
    if (text.includes("noturno") || text.includes("noite")) {
      shiftType = "12h Noturno";
    } else if (text.includes("24h") || text.includes("24 horas") || text.includes("vinte e quatro")) {
      shiftType = "24h Completo";
    } else if (text.includes("6h") || text.includes("seis horas")) {
      shiftType = "6h Ambulatório/PS";
    } else if (text.includes("sobreaviso")) {
      shiftType = "Sobreaviso";
    }

    // 4. Gross Value extraction
    let grossValue = isConsultation ? 350 : 2000;
    // Direct digits matching e.g. 2500, 1800, 2000, 350
    const digitMatch = text.match(/\b([1-9][0-9]{2,4})\b/);
    if (digitMatch) {
      grossValue = parseFloat(digitMatch[1]);
    } else if (text.includes("cinco mil e quinhentos") || text.includes("5 mil e quinhentos")) {
      grossValue = 5500;
    } else if (text.includes("cinco mil") || text.includes("5 mil")) {
      grossValue = 5000;
    } else if (text.includes("quatro mil e quinhentos") || text.includes("4 mil e quinhentos")) {
      grossValue = 4500;
    } else if (text.includes("quatro mil") || text.includes("4 mil")) {
      grossValue = 4000;
    } else if (text.includes("três mil e quinhentos") || text.includes("tres mil e quinhentos") || text.includes("3 mil e quinhentos")) {
      grossValue = 3500;
    } else if (text.includes("três mil e duzentos") || text.includes("3 mil e duzentos")) {
      grossValue = 3200;
    } else if (text.includes("três mil") || text.includes("tres mil") || text.includes("3 mil")) {
      grossValue = 3000;
    } else if (text.includes("dois mil e quinhentos") || text.includes("2 mil e quinhentos")) {
      grossValue = 2500;
    } else if (text.includes("dois mil e quatrocentos") || text.includes("2 mil e quatrocentos")) {
      grossValue = 2400;
    } else if (text.includes("dois mil e duzentos") || text.includes("2 mil e duzentos")) {
      grossValue = 2200;
    } else if (text.includes("dois mil") || text.includes("2 mil")) {
      grossValue = 2000;
    } else if (text.includes("mil e oitocentos") || text.includes("1800")) {
      grossValue = 1800;
    } else if (text.includes("mil e seiscentos")) {
      grossValue = 1600;
    } else if (text.includes("mil e quinhentos") || text.includes("1500")) {
      grossValue = 1500;
    } else if (text.includes("mil e duzentos")) {
      grossValue = 1200;
    } else if (text.includes("mil reais") || text.match(/\bmil\b/)) {
      grossValue = 1000;
    } else if (text.includes("novecentos e cinquenta")) {
      grossValue = 950;
    } else if (text.includes("novecentos")) {
      grossValue = 900;
    } else if (text.includes("oitocentos e cinquenta")) {
      grossValue = 850;
    } else if (text.includes("oitocentos")) {
      grossValue = 800;
    } else if (text.includes("setecentos e cinquenta")) {
      grossValue = 750;
    } else if (text.includes("setecentos")) {
      grossValue = 700;
    } else if (text.includes("seiscentos e cinquenta")) {
      grossValue = 650;
    } else if (text.includes("seiscentos")) {
      grossValue = 600;
    } else if (text.includes("quinhentos e cinquenta")) {
      grossValue = 550;
    } else if (text.includes("quinhentos")) {
      grossValue = 500;
    } else if (text.includes("quatrocentos e cinquenta")) {
      grossValue = 450;
    } else if (text.includes("quatrocentos")) {
      grossValue = 400;
    } else if (text.includes("trezentos e cinquenta")) {
      grossValue = 350;
    } else if (text.includes("trezentos")) {
      grossValue = 300;
    } else if (text.includes("duzentos e cinquenta")) {
      grossValue = 250;
    } else if (text.includes("duzentos")) {
      grossValue = 200;
    }

    // 5. Tax Regime & Rate
    let taxRegime = "Simples Nacional (6%)";
    let taxRate = 6;
    if (text.includes("presumido") || text.includes("15") || text.includes("quinze")) {
      taxRegime = "Lucro Presumido (15%)";
      taxRate = 15;
    } else if (text.includes("rpa") || text.includes("física") || text.includes("27")) {
      taxRegime = "RPA / Pessoa Física (27.5%)";
      taxRate = 27.5;
    } else if (text.includes("isento") || text.includes("direto") || text.includes("zero")) {
      taxRegime = "Direto / Cooperativa (0%)";
      taxRate = 0;
    }

    // 6. Sector
    let sector = "UTI Neonatal";
    if (text.includes("parto") || text.includes("sala de parto") || text.includes("reanimação")) {
      sector = "Sala de Parto / Reanimação";
    } else if (text.includes("ps") || text.includes("pronto socorro") || text.includes("emergência")) {
      sector = "PS Infantil";
    } else if (text.includes("alojamento") || text.includes("conjunto")) {
      sector = "Alojamento Conjunto";
    } else if (text.includes("enfermaria")) {
      sector = "Enfermaria Pediátrica";
    }

    const netValue = Math.round(grossValue * (1 - (taxRate / 100)) * 100) / 100;
    const installments = calculateShiftInstallments(shiftDate, netValue);

    return {
      type,
      hospital,
      patientName,
      consultationType: "Puericultura (Avulsa)",
      description: text.includes("jaleco") ? "Jaleco e Estetoscópio" : "Despesa Médica",
      category: "Consultório",
      scope: "PJ",
      value: grossValue,
      shiftDate,
      date: shiftDate,
      shiftType,
      sector,
      grossValue,
      taxRegime,
      taxRate,
      netValue,
      splitPayment: true,
      installments,
      notes: `Lançamento por comando de voz: "${transcript}"`
    };
  }
}

// Standalone Helper Exports for V3 Modules
function parseMedicalVoiceInput(transcript) {
  const store = new PediatricStore();
  return store.parseMedicalVoiceInput(transcript);
}

function parseOFX(ofxContent) {
  const store = new PediatricStore();
  return store.parseOFX(ofxContent);
}

function parseBankCSV(csvContent) {
  const store = new PediatricStore();
  return store.parseBankCSV(csvContent);
}

function generateSBARHandoff(shiftOrData, options) {
  const store = new PediatricStore();
  return store.generateSBARHandoff(shiftOrData, options);
}

function generateAccountantKit(monthStr) {
  const store = new PediatricStore();
  return store.generateAccountantKit(monthStr);
}

function reconcileBankTransactions(transactions, referenceDate = new Date()) {
  const store = new PediatricStore();
  return store.reconcileBankTransactions(transactions, referenceDate);
}

// Global instance for convenience
if (typeof window !== "undefined") {
  window.PediatricStore = PediatricStore;
  window.PediatricSanctuaryDB = PediatricSanctuaryDB;
  window.pediatricStoreInstance = new PediatricStore();
  window.parseMedicalVoiceInput = parseMedicalVoiceInput;
  window.parseOFX = parseOFX;
  window.parseBankCSV = parseBankCSV;
  window.generateSBARHandoff = generateSBARHandoff;
  window.generateAccountantKit = generateAccountantKit;
  window.reconcileBankTransactions = reconcileBankTransactions;
}


  // --- CHARTS ENGINE ---
  /**
 * Pediatric Financial Sanctuary - Pure Vanilla SVG Chart Generator
 * 100% Dependency-free, accessible, responsive SVG graphics.
 */



/**
 * Generates an SVG Bar/Line combo chart showing cash inflow forecast for the next 4 months.
 * @param {Array<{label: string, shiftInflow: number, salaryInflow: number, totalInflow: number, receivedAmount: number, pendingAmount: number}>} forecastData
 * @param {object} options
 * @returns {string} SVG HTML string
 */
function renderForecastChartSVG(forecastData, options = {}) {
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
function renderDonutChartSVG(categoriesData, totalExpenses) {
  const isDark = typeof document !== 'undefined' && (
    (document.documentElement && document.documentElement.getAttribute('data-theme') === 'dark') ||
    (document.body && document.body.classList && document.body.classList.contains('dark'))
  );
  const trackStroke = isDark ? '#2B1838' : '#ebedff';

  if (!categoriesData || categoriesData.length === 0 || totalExpenses <= 0) {
    const emptySvg = `
      <div class="relative w-32 h-32 flex items-center justify-center">
        <svg class="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="${trackStroke}" stroke-width="12" />
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
        <circle cx="50" cy="50" r="${radius}" fill="none" stroke="${trackStroke}" stroke-width="12" />
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
function renderMonthOverMonthChartSVG(momData) {
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
function renderForecast12MSVG(projectionData, options = {}) {
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

  const balanceLineColor = isDark12M ? '#FF69B4' : '#7e4a8a';

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
              <stop offset="0%" stop-color="${balanceLineColor}" stop-opacity="${isDark12M ? '0.24' : '0.16'}" />
              <stop offset="100%" stop-color="${balanceLineColor}" stop-opacity="0.0" />
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
          <path d="${linePathD}" fill="none" stroke="${balanceLineColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

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
          <span class="w-3 h-0.5 inline-block ml-2" style="background-color: ${balanceLineColor};"></span>
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



  // --- APPLICATION LOGIC ---
  /**
 * Finanças Pediatria - Single Page Application Engine
 * Mobile-First Clinical & Financial Control Architecture for Pediatricians
 */







// Application State
class AppState {
  constructor() {
    this.store = new PediatricStore();
    // Reference date based on current context: September 2026
    this.referenceDate = new Date();
    // Default active month: current month YYYY-MM
    this.activeMonth = "2026-09";
    this.activeTab = "inicio"; // "inicio" | "plantoes" | "despesas" | "relatorios"
    this.currentRegime = "caixa"; // "caixa" | "competencia"
    this.shiftScope = "all"; // "all" | "month"
    this.shiftFilter = "all"; // "all" | "pending" | "received" | "delayed"
    this.shiftViewMode = "list"; // "list" | "calendar"
    this.shiftSectorFilter = "all";
    this.calendarSelectedDate = null;
    this.shiftSearchQuery = "";
    this.expenseFilter = "all"; // "all" | "fixa" | "variavel"
    this.expenseScopeFilter = "all"; // "all" | "pf" | "pj"
    this.activeModalTab = "plantao"; // "plantao" | "salario" | "despesa"
    this.editingItem = null; // { type: 'shift'|'expense', id: '...' }
    this.isExpandedView = false;
    this.billingTone = "gentil"; // "gentil" | "formal"
    this.privacyMode = false;
    try {
      if (typeof localStorage !== "undefined") {
        this.privacyMode = localStorage.getItem("pediatric_privacy_mode") === "true";
      }
    } catch (e) {}
  }
}

const state = new AppState();

// DOM Cache
const dom = {};

function initDOM() {
  dom.mainContent = document.getElementById("main-content");
  dom.monthDisplay = document.getElementById("current-month-display");
  dom.btnPrevMonth = document.getElementById("btn-prev-month");
  dom.btnNextMonth = document.getElementById("btn-next-month");
  dom.btnOpenMonthPicker = document.getElementById("btn-open-month-picker");
  dom.navTabs = document.querySelectorAll(".nav-tab");
  dom.fabBtn = document.getElementById("fab-add");
  dom.bottomSheet = document.getElementById("bottom-sheet");
  dom.modalOverlay = document.getElementById("modal-overlay");
  dom.dialogOverlay = document.getElementById("dialog-overlay");
  dom.dialogContainer = document.getElementById("dialog-container");
  dom.sheetCloseBtn = document.getElementById("btn-close-sheet");
  dom.toast = document.getElementById("toast");
  dom.toastMsg = document.getElementById("toast-message");
  dom.deviceFrame = document.querySelector(".device-frame");
  dom.btnToggleFrame = document.getElementById("btn-toggle-frame");
  dom.btnNotifications = document.getElementById("btn-notifications");
  dom.notifBadge = document.getElementById("notif-badge");
  dom.btnProfile = document.getElementById("btn-profile");
  dom.btnInstallApp = document.getElementById("btn-install-app");
  dom.btnTogglePrivacy = document.getElementById("btn-toggle-privacy");
  dom.headerActiveTab = document.getElementById("header-active-tab");
  dom.headerDoctorTitle = document.getElementById("header-doctor-title");
  dom.babyOverlay = document.getElementById("baby-reaction-overlay");
  dom.babyContent = document.getElementById("baby-reaction-content");
  dom.btnThemeToggle = document.getElementById("btn-theme-toggle");
  dom.btnSpotlight = document.getElementById("btn-spotlight");
  dom.spotlightOverlay = document.getElementById("spotlight-overlay");
  dom.spotlightInput = document.getElementById("spotlight-input");
  dom.btnCloseSpotlight = document.getElementById("btn-close-spotlight");
  dom.spotlightResults = document.getElementById("spotlight-results");
  dom.btnHamburger = document.getElementById("btn-hamburger");
  dom.hamburgerDrawer = document.getElementById("hamburger-drawer");
  dom.hamburgerDrawerOverlay = document.getElementById("hamburger-drawer-overlay");
  dom.btnCloseDrawer = document.getElementById("btn-close-drawer");
  dom.hamburgerNotifBadge = document.getElementById("hamburger-notif-badge");
  dom.btnDrawerUploadPhoto = document.getElementById("btn-drawer-upload-photo");
  dom.inputDoctorPhoto = document.getElementById("input-doctor-photo");
  dom.btnDrawerRemovePhoto = document.getElementById("btn-drawer-remove-photo");
  dom.btnDrawerEditProfile = document.getElementById("btn-drawer-edit-profile");
  dom.btnDrawerLegal = document.getElementById("btn-drawer-legal");
  dom.particlesContainer = document.getElementById("pediatric-particles-container");
}

/**
 * Format currency with Privacy Mode (Modo Sigilo) support
 * @param {number} value
 * @param {boolean} forceShow
 * @returns {string}
 */
function formatMoney(value, forceShow = false) {
  if (state.privacyMode && !forceShow) {
    return "R$ ••••••";
  }
  return formatCurrency(value);
}

function triggerHaptic(duration = 12) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(duration);
      return;
    }
  } catch (e) {}

  // Hybrid tactile fallback for iOS Safari via Web Audio API micro-pulse
  try {
    if (typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!window.__pediatricHapticCtx) {
          window.__pediatricHapticCtx = new AudioCtx();
        }
        if (window.__pediatricHapticCtx.state === "suspended") {
          window.__pediatricHapticCtx.resume().catch(() => {});
        }
        const ctx = window.__pediatricHapticCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.035);
      }
    }
  } catch (e) {}
}

/**
 * Toggles Privacy Mode (Modo Sigilo)
 */
function togglePrivacyMode() {
  state.privacyMode = !state.privacyMode;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("pediatric_privacy_mode", String(state.privacyMode));
    }
  } catch (e) {}

  if (typeof document !== "undefined" && document.body) {
    if (state.privacyMode) {
      document.body.classList.add("privacy-active");
    } else {
      document.body.classList.remove("privacy-active");
    }
  }

  updatePrivacyButtonUI();
  triggerHaptic(14);
  showToast(
    state.privacyMode ? "Modo Sigilo ativado! Valores protegidos 🔒" : "Modo Sigilo desativado. Valores visíveis 👁️",
    state.privacyMode ? "visibility_off" : "visibility"
  );
  renderCurrentView();
}

function updatePrivacyButtonUI() {
  if (!dom.btnTogglePrivacy) return;
  const iconSpan = dom.btnTogglePrivacy.querySelector(".material-symbols-outlined");
  const iconName = state.privacyMode ? "visibility_off" : "visibility";
  if (iconSpan) {
    iconSpan.setAttribute("data-icon", iconName);
    iconSpan.innerHTML = renderIcon(iconName);
  }
  dom.btnTogglePrivacy.title = state.privacyMode ? "Desativar Modo Sigilo (Exibir Valores)" : "Ativar Modo Sigilo (Ocultar Valores)";
}

/**
 * Dark Mode Engine: "Plantão Noturno / UTI Neonatal"
 */
function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement || document.body;
  if (!root) return;
  if (theme === "dark") {
    if (root.setAttribute) root.setAttribute("data-theme", "dark");
    if (root.classList && root.classList.add) root.classList.add("dark");
    if (document.body && document.body.classList && document.body.classList.add) document.body.classList.add("dark");
  } else {
    if (root.removeAttribute) root.removeAttribute("data-theme");
    if (root.classList && root.classList.remove) root.classList.remove("dark");
    if (document.body && document.body.classList && document.body.classList.remove) document.body.classList.remove("dark");
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("pediatric_theme_v3", theme);
    }
  } catch (e) {}

  if (dom.btnThemeToggle) {
    const isDark = theme === "dark";
    dom.btnThemeToggle.title = isDark ? "Alternar para Modo Diurno (Claro)" : "Plantão Noturno (Modo Escuro)";
    const iconSpan = dom.btnThemeToggle.querySelector ? dom.btnThemeToggle.querySelector(".material-symbols-outlined") : null;
    if (iconSpan) {
      const iconName = isDark ? "light_mode" : "dark_mode";
      if (iconSpan.setAttribute) iconSpan.setAttribute("data-icon", iconName);
      iconSpan.innerHTML = renderIcon(iconName);
    }
  }

  // Dynamic re-render so SVG charts, badges and layout tokens adapt instantly
  if (dom.mainContent && state.activeTab && typeof renderCurrentView === "function") {
    try {
      renderCurrentView();
    } catch (err) {}
  }
}

function initThemeSystem() {
  let savedTheme = "light";
  try {
    if (typeof localStorage !== "undefined") {
      savedTheme = localStorage.getItem("pediatric_theme_v3");
      if (!savedTheme && typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        savedTheme = "dark";
      }
    }
  } catch (e) {}

  applyTheme(savedTheme || "light");

  if (dom.btnThemeToggle && dom.btnThemeToggle.addEventListener) {
    dom.btnThemeToggle.addEventListener("click", () => {
      const isCurrentlyDark = (document.documentElement && document.documentElement.getAttribute && document.documentElement.getAttribute("data-theme") === "dark") || (document.body && document.body.classList && document.body.classList.contains && document.body.classList.contains("dark"));
      const nextTheme = isCurrentlyDark ? "light" : "dark";
      applyTheme(nextTheme);
      triggerHaptic(14);
      showToast(
        nextTheme === "dark" ? "Plantão Noturno ativado! Conforto na UTI Neonatal 🌙" : "Modo Diurno ativado! ☀️",
        nextTheme === "dark" ? "dark_mode" : "light_mode"
      );
    });
  }
}

/**
 * Spotlight Universal Search (Cmd+K / Ctrl+K)
 */
function openSpotlightSearch() {
  if (!dom.spotlightOverlay) dom.spotlightOverlay = document.getElementById("spotlight-overlay");
  if (!dom.spotlightInput) dom.spotlightInput = document.getElementById("spotlight-input");
  if (!dom.spotlightResults) dom.spotlightResults = document.getElementById("spotlight-results");

  if (!dom.spotlightOverlay) return;
  dom.spotlightOverlay.classList.add("open", "active");
  if (dom.spotlightInput) {
    dom.spotlightInput.value = "";
    setTimeout(() => dom.spotlightInput.focus(), 50);
  }
  renderSpotlightResults("");
}

function closeSpotlightSearch() {
  if (!dom.spotlightOverlay) dom.spotlightOverlay = document.getElementById("spotlight-overlay");
  if (dom.spotlightOverlay) {
    dom.spotlightOverlay.classList.remove("open", "active");
  }
}

function renderSpotlightResults(query = "") {
  if (!dom.spotlightResults) dom.spotlightResults = document.getElementById("spotlight-results");
  if (!dom.spotlightResults) return;

  const q = (query || "").trim().toLowerCase();
  const shifts = state.store.data.shifts || [];
  const consultations = state.store.getConsultations ? state.store.getConsultations() : (state.store.data.consultations || []);
  const expenses = state.store.data.expenses || [];

  const actions = [
    { title: "Novo Plantão", desc: "Cadastrar escala hospitalar", icon: "add_circle", action: () => { closeSpotlightSearch(); openBottomSheet("plantao"); } },
    { title: "Nova Consulta / Puericultura", desc: "Cadastrar atendimento de consultório", icon: "child_friendly", action: () => { closeSpotlightSearch(); openBottomSheet("consultorio"); } },
    { title: "Nova Despesa", desc: "Registrar custo fixo ou variável", icon: "receipt_long", action: () => { closeSpotlightSearch(); openBottomSheet("despesa"); } },
    { title: "Passagem de Plantão SBAR", desc: "Relatório clínico LGPD para WhatsApp", icon: "swap_horiz", action: () => { closeSpotlightSearch(); openSBARDialog(); } },
    { title: "DRE & Otimizador Fator R", desc: "Demonstrativo contábil e simulação 28%", icon: "calculate", action: () => { closeSpotlightSearch(); openDREDialog(); } },
    { title: "Conciliação Bancária", desc: "Importar extrato OFX ou CSV do banco", icon: "upload_file", action: () => { closeSpotlightSearch(); openReconciliationDialog(); } },
    { title: "Kit do Contador", desc: "Relatório mensal e CSV para contabilidade", icon: "contact_phone", action: () => { closeSpotlightSearch(); openAccountantKitDialog(); } },
    { title: "Simulador FIRE Pediatra", desc: "Termômetro de independência de plantões", icon: "local_fire_department", action: () => { closeSpotlightSearch(); openFIREDialog(); } },
    { title: "Alternar Modo Noturno (UTI)", desc: "Trocar entre modo claro e escuro", icon: "dark_mode", action: () => { closeSpotlightSearch(); dom.btnThemeToggle?.click(); } },
    { title: "Modo Sigilo (Privacidade)", desc: "Ocultar ou exibir valores monetários", icon: "visibility", action: () => { closeSpotlightSearch(); togglePrivacyMode(); } }
  ];

  let filteredActions = actions;
  let filteredShifts = [];
  let filteredConsultations = [];
  let filteredExpenses = [];

  if (q) {
    filteredActions = actions.filter(a => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
    filteredShifts = shifts.filter(s =>
      (s.hospital && s.hospital.toLowerCase().includes(q)) ||
      (s.sector && s.sector.toLowerCase().includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q)) ||
      (s.shiftDate && s.shiftDate.includes(q))
    ).slice(0, 5);

    filteredConsultations = consultations.filter(c =>
      (c.patientName && c.patientName.toLowerCase().includes(q)) ||
      (c.consultationType && c.consultationType.toLowerCase().includes(q)) ||
      (c.type && c.type.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q)) ||
      (c.date && c.date.includes(q))
    ).slice(0, 5);

    filteredExpenses = expenses.filter(e =>
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q)) ||
      (e.dueDate && e.dueDate.includes(q)) ||
      (e.date && e.date.includes(q))
    ).slice(0, 5);
  } else {
    filteredShifts = shifts.slice(-3).reverse();
    filteredConsultations = consultations.slice(-3).reverse();
  }

  let html = "";

  if (filteredActions.length > 0) {
    html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-2 py-1 tracking-wider">Ações e Módulos</div>`;
    filteredActions.forEach((act, idx) => {
      html += `
        <div class="spotlight-item p-2.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-container active:scale-98 transition-all" data-action-idx="${idx}">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
            ${renderIcon(act.icon, "text-[18px]")}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-[13px] font-bold text-on-surface truncate">${act.title}</h4>
            <p class="text-[11px] text-on-surface-variant truncate">${act.desc}</p>
          </div>
          <span class="text-[11px] text-primary font-bold">Abrir ➔</span>
        </div>
      `;
    });
  }

  if (filteredShifts.length > 0) {
    html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-2 py-1 mt-2 tracking-wider">Plantões</div>`;
    filteredShifts.forEach(s => {
      html += `
        <div class="spotlight-item p-2.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-container active:scale-98 transition-all" data-type="shift" data-id="${s.id}">
          <div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            ${renderIcon("stethoscope", "text-[18px]")}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-[13px] font-bold text-on-surface truncate">${s.hospital} (${s.sector || 'Neo'})</h4>
            <p class="text-[11px] text-on-surface-variant truncate">${formatDateBR(s.shiftDate)} • ${formatCurrency(s.netValue)}</p>
          </div>
          <span class="text-[11px] text-secondary font-bold">Ver</span>
        </div>
      `;
    });
  }

  if (filteredConsultations.length > 0) {
    html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-2 py-1 mt-2 tracking-wider">Consultório & Puericultura</div>`;
    filteredConsultations.forEach(c => {
      html += `
        <div class="spotlight-item p-2.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-container active:scale-98 transition-all" data-type="consultation" data-id="${c.id}">
          <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
            ${renderIcon("child_friendly", "text-[18px]")}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-[13px] font-bold text-on-surface truncate">${c.patientName}</h4>
            <p class="text-[11px] text-on-surface-variant truncate">${c.consultationType || c.type || "Consulta"} • ${formatDateBR(c.date)} • ${formatCurrency(c.value !== undefined ? c.value : (c.grossValue || 0))}</p>
          </div>
          <span class="text-[11px] text-tertiary font-bold">Editar</span>
        </div>
      `;
    });
  }

  if (filteredExpenses.length > 0) {
    html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-2 py-1 mt-2 tracking-wider">Despesas</div>`;
    filteredExpenses.forEach(e => {
      html += `
        <div class="spotlight-item p-2.5 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-container active:scale-98 transition-all" data-type="expense" data-id="${e.id}">
          <div class="w-8 h-8 rounded-full bg-coral-expense-bg text-coral-expense flex items-center justify-center shrink-0">
            ${renderIcon("receipt_long", "text-[18px]")}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-[13px] font-bold text-on-surface truncate">${e.description}</h4>
            <p class="text-[11px] text-on-surface-variant truncate">${e.category} • ${formatDateBR(e.dueDate || e.date)} • ${formatCurrency(e.value)}</p>
          </div>
          <span class="text-[11px] text-error font-bold">Ver</span>
        </div>
      `;
    });
  }

  if (!html) {
    html = `<div class="p-6 text-center text-on-surface-variant text-[13px]">Nenhum resultado encontrado para "${query}".</div>`;
  }

  dom.spotlightResults.innerHTML = html;
  if (typeof enhanceIcons === "function") enhanceIcons(dom.spotlightResults);

  dom.spotlightResults.querySelectorAll(".spotlight-item").forEach(item => {
    item.addEventListener("click", () => {
      const actIdx = item.getAttribute("data-action-idx");
      if (actIdx !== null && filteredActions[actIdx]) {
        filteredActions[actIdx].action();
        return;
      }
      const type = item.getAttribute("data-type");
      const id = item.getAttribute("data-id");
      closeSpotlightSearch();
      if (type === "shift") {
        const targetShift = shifts.find(s => s.id === id);
        if (targetShift) openBottomSheet("plantao", targetShift);
      } else if (type === "consultation") {
        const targetCons = consultations.find(c => c.id === id);
        if (targetCons) openBottomSheet("consultorio", targetCons);
      } else if (type === "expense") {
        const targetExp = expenses.find(e => e.id === id);
        if (targetExp) openBottomSheet("despesa", targetExp);
      }
    });
  });
}

function initSpotlightSearch() {
  if (dom.btnSpotlight) {
    dom.btnSpotlight.addEventListener("click", openSpotlightSearch);
  }
  if (dom.btnCloseSpotlight) {
    dom.btnCloseSpotlight.addEventListener("click", closeSpotlightSearch);
  }
  if (dom.spotlightOverlay) {
    dom.spotlightOverlay.addEventListener("click", (e) => {
      if (e.target === dom.spotlightOverlay) closeSpotlightSearch();
    });
  }
  if (dom.spotlightInput) {
    dom.spotlightInput.addEventListener("input", (e) => {
      renderSpotlightResults(e.target.value);
    });
    dom.spotlightInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const firstItem = dom.spotlightResults?.querySelector(".spotlight-item");
        if (firstItem) firstItem.click();
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (dom.spotlightOverlay && (dom.spotlightOverlay.classList.contains("active") || dom.spotlightOverlay.classList.contains("open"))) {
        closeSpotlightSearch();
      } else {
        openSpotlightSearch();
      }
    } else if (e.key === "Escape" && dom.spotlightOverlay && (dom.spotlightOverlay.classList.contains("active") || dom.spotlightOverlay.classList.contains("open"))) {
      closeSpotlightSearch();
    }
  });
}

/**
 * Voice Recognition & NLP Assistant
 */
function startVoiceLogging() {
  const SpeechRecognition = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  if (SpeechRecognition) {
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      showToast("Ouvindo... Fale o plantão, consulta ou despesa 🎙️", "mic");
      triggerHaptic(20);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processVoiceTranscript(transcript);
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        promptVoiceManualFallback();
      };

      recognition.start();
      return;
    } catch (e) {
      console.warn("Error starting speech recognition:", e);
    }
  }

  promptVoiceManualFallback();
}

function promptVoiceManualFallback() {
  const html = `
    <div class="p-5 flex flex-col gap-3">
      <div class="flex items-center gap-2 pb-1 border-b border-outline-variant/20">
        <span class="material-symbols-outlined text-secondary text-[22px]" data-icon="mic"></span>
        <h3 class="font-headline text-[17px] font-bold text-on-surface">Lançamento por Voz ou Texto</h3>
      </div>
      <p class="text-[12px] text-on-surface-variant">
        O assistente de NLP Médico reconhece termos como: <em>"Plantão 12h sábado no Mater Dei 1800"</em>, <em>"Consulta puericultura Maria 350"</em> ou <em>"Despesa jaleco 250"</em>.
      </p>
      <textarea
        id="input-voice-text-fallback"
        rows="3"
        class="w-full p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary transition-all resize-none"
        placeholder="Digite ou cole aqui a frase..."
      ></textarea>
      <div class="flex items-center justify-end gap-2 pt-1">
        <button type="button" class="px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant font-bold text-[12px]" id="btn-cancel-voice">Cancelar</button>
        <button type="button" id="btn-submit-voice-text" class="px-5 py-2 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[12px] shadow-sm active:scale-95">Processar Frase</button>
      </div>
    </div>
  `;
  openDialog(html);

  const btnCancel = document.getElementById("btn-cancel-voice");
  if (btnCancel) btnCancel.addEventListener("click", closeDialog);

  const btnSubmit = document.getElementById("btn-submit-voice-text");
  const inputEl = document.getElementById("input-voice-text-fallback");
  if (btnSubmit && inputEl) {
    btnSubmit.addEventListener("click", () => {
      const text = inputEl.value.trim();
      if (text) {
        closeDialog();
        processVoiceTranscript(text);
      }
    });
  }
}

function processVoiceTranscript(transcript) {
  const parsed = parseMedicalVoiceInput(transcript);
  if (!parsed || !parsed.type) {
    showToast("Não foi possível identificar o lançamento. Tente novamente.", "warning");
    return;
  }

  triggerHaptic(25);
  if (parsed.type === "shift") {
    openBottomSheet("plantao", {
      hospital: parsed.hospital || "Hospital Mater Dei",
      shiftType: parsed.shiftType || "12h Diurno",
      sector: parsed.sector || "UTI Neonatal",
      shiftDate: parsed.shiftDate || getLocalDateString(state.referenceDate || new Date()),
      grossValue: parsed.grossValue || 1500,
      taxRegime: parsed.taxRegime || "Simples Nacional (6%)",
      taxRate: parsed.taxRate !== undefined ? parsed.taxRate : 6,
      netValue: parsed.netValue !== undefined ? parsed.netValue : (parsed.grossValue ? parsed.grossValue * 0.94 : 1410),
      notes: parsed.notes || ""
    });
    showToast(`Plantão identificado: ${parsed.hospital || 'Plantão'}! 🎙️✨`);
  } else if (parsed.type === "consultation") {
    openBottomSheet("consultorio", {
      patientName: parsed.patientName || "Paciente Puericultura",
      consultationType: parsed.consultationType || "Puericultura (Avulsa)",
      value: parsed.value || 350,
      grossValue: parsed.grossValue || parsed.value || 350,
      date: parsed.date || getLocalDateString(state.referenceDate || new Date()),
      paid: true,
      notes: parsed.notes || ""
    });
    showToast(`Consulta identificada: ${parsed.patientName || 'Puericultura'}! 🎙️✨`);
  } else if (parsed.type === "expense") {
    openBottomSheet("despesa", {
      description: parsed.description || "Despesa Médica",
      category: parsed.category || "Consultório",
      value: parsed.value || 100,
      dueDate: parsed.date || parsed.shiftDate || getLocalDateString(state.referenceDate || new Date()),
      date: parsed.date || getLocalDateString(state.referenceDate || new Date()),
      scope: parsed.scope || "PJ",
      notes: parsed.notes || ""
    });
    showToast(`Despesa identificada: ${parsed.description}! 🎙️✨`);
  }
}

/**
 * Passagem de Plantão SBAR (LGPD-Safe)
 */
function openSBARDialog(shiftId = null) {
  const shifts = state.store.data.shifts || [];
  let currentShift = shiftId ? shifts.find(s => s.id === shiftId) : (shifts[0] || null);

  const doc = state.store.data;
  const doctorName = doc.doctorName || "Dra. Pediatra";
  const doctorCrm = doc.doctorCrm || "CRM-SP";

  const renderSbarContent = (shift) => {
    const defaultData = {
      hospital: shift ? shift.hospital : "UTI Neonatal",
      date: shift ? formatDateBR(shift.shiftDate) : formatDateBR(getLocalDateString(new Date())),
      sector: shift ? (shift.sector || "UTI Neonatal") : "UTI Neonatal",
      shiftType: shift ? shift.shiftType : "12h Noturno"
    };

    return `
      <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
              ${renderIcon("swap_horiz", "text-[18px]")}
            </div>
            <div>
              <h3 class="font-headline text-[16px] font-bold text-on-surface">Passagem de Plantão SBAR</h3>
              <span class="text-[11px] text-primary font-semibold">${defaultData.hospital} • ${defaultData.sector}</span>
            </div>
          </div>
          <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-sbar">
            ${renderIcon("close", "text-[18px]")}
          </button>
        </div>

        <div class="flex flex-col gap-2.5">
          <div>
            <label class="text-[11px] font-bold text-on-surface block mb-0.5">S - Situação (Leito / Idade / Motivo)</label>
            <textarea id="sbar-s" rows="2" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-[12px] text-on-surface focus:outline-none focus:border-secondary resize-none" placeholder="Ex: Leito 03: RN de Maria, IG 32s, PN 1450g. Em CPAP nasal."></textarea>
          </div>

          <div>
            <label class="text-[11px] font-bold text-on-surface block mb-0.5">B - Background (Histórico Relevante)</label>
            <textarea id="sbar-b" rows="2" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-[12px] text-on-surface focus:outline-none focus:border-secondary resize-none" placeholder="Ex: Parto cesárea por DHEG materna. Fez surfactante na sala de parto."></textarea>
          </div>

          <div>
            <label class="text-[11px] font-bold text-on-surface block mb-0.5">A - Avaliação (Quadro Clínico Atual)</label>
            <textarea id="sbar-a" rows="2" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-[12px] text-on-surface focus:outline-none focus:border-secondary resize-none" placeholder="Ex: Estável, afebril, boa perfusão periférica. Gasometria com acidose respiratória leve compensada."></textarea>
          </div>

          <div>
            <label class="text-[11px] font-bold text-on-surface block mb-0.5">R - Recomendação (Condutas & Pendências)</label>
            <textarea id="sbar-r" rows="2" class="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-[12px] text-on-surface focus:outline-none focus:border-secondary resize-none" placeholder="Ex: Repetir gaso às 22h. Se mantiver desconforto, aumentar PEEP. Manter NPT em bomba."></textarea>
          </div>

          <label class="flex items-center gap-2 cursor-pointer select-none text-[11px] text-on-surface-variant pt-1">
            <input type="checkbox" id="sbar-lgpd" checked class="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary" />
            <span>Blindagem LGPD Ativa (Garantir anonimização de dados sensíveis)</span>
          </label>
        </div>

        <div class="pt-2 border-t border-outline-variant/20 flex flex-col gap-2">
          <div class="grid grid-cols-2 gap-2">
            <button type="button" id="btn-copy-sbar" class="h-10 rounded-full bg-surface-container text-on-surface font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              ${renderIcon("content_copy", "text-[16px]")}
              <span>Copiar Texto</span>
            </button>
            <button type="button" id="btn-send-whatsapp-sbar" class="h-10 rounded-full bg-[#25D366] text-white font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
              ${renderIcon("send", "text-[16px]")}
              <span>Enviar WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    `;
  };

  openDialog(renderSbarContent(currentShift));

  const btnClose = document.getElementById("btn-close-sbar");
  if (btnClose) btnClose.addEventListener("click", closeDialog);

  const getFullSbarText = () => {
    const s = document.getElementById("sbar-s")?.value.trim() || "Estável";
    const b = document.getElementById("sbar-b")?.value.trim() || "Sem intercorrências prévias";
    const a = document.getElementById("sbar-a")?.value.trim() || "Boa evolução clínica";
    const r = document.getElementById("sbar-r")?.value.trim() || "Seguir rotina da unidade";
    const isLgpd = document.getElementById("sbar-lgpd")?.checked;

    return generateSBARHandoff(currentShift, {
      situation: s,
      background: b,
      assessment: a,
      recommendation: r,
      anonymizePatient: isLgpd,
      doctorName,
      doctorCrm
    });
  };

  const btnCopy = document.getElementById("btn-copy-sbar");
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const text = getFullSbarText();
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
      triggerHaptic(15);
      showToast("Passagem SBAR copiada para o WhatsApp! 📋✨");
    });
  }

  const btnSend = document.getElementById("btn-send-whatsapp-sbar");
  if (btnSend) {
    btnSend.addEventListener("click", () => {
      const text = getFullSbarText();
      triggerHaptic(15);
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    });
  }
}

/**
 * DRE & Otimizador Fator R Dialog
 */
function openDREDialog(targetMonth = state.activeMonth) {
  const dre = state.store.getDRE(targetMonth);
  const opt = state.store.getFatorROptimizer(targetMonth);

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("calculate", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">DRE & Otimizador Fator R</h3>
            <span class="text-[11px] text-primary font-semibold">${formatMonthYear(targetMonth)}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dre">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <div class="p-3.5 rounded-2xl bg-surface-container-low flex flex-col gap-2">
        <span class="text-[11px] font-bold text-on-surface uppercase tracking-wider">Demonstrativo do Resultado (DRE)</span>
        <div class="flex justify-between text-[12px] font-semibold py-1 border-b border-outline-variant/10">
          <span>(+) Faturamento Bruto (PJ + Consultório)</span>
          <span class="font-display font-bold text-primary ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.grossRevenueTotal || dre.grossRevenue)}</span>
        </div>
        <div class="flex justify-between text-[12px] text-error font-medium py-1 border-b border-outline-variant/10">
          <span>(-) Impostos Médicos (Simples / Carnê-Leão)</span>
          <span class="font-display font-bold ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.taxesTotal !== undefined ? dre.taxesTotal : dre.taxes)}</span>
        </div>
        <div class="flex justify-between text-[12px] font-bold text-on-surface py-1 border-b border-outline-variant/10">
          <span>(=) Receita Operacional Líquida</span>
          <span class="font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.netOperationalRevenue !== undefined ? dre.netOperationalRevenue : dre.netRevenue)}</span>
        </div>
        <div class="flex justify-between text-[12px] text-on-surface-variant py-1 border-b border-outline-variant/10">
          <span>(-) Custos Operacionais PJ (CRM, Deslocamento)</span>
          <span class="font-display font-medium text-error ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.pjExpensesTotal !== undefined ? dre.pjExpensesTotal : dre.pjOperatingExpenses)}</span>
        </div>
        <div class="flex justify-between text-[12px] text-primary font-semibold py-1 border-b border-outline-variant/10">
          <span>(-) Pró-Labore da Médica (Fator R 28%)</span>
          <span class="font-display font-bold ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.proLabore)}</span>
        </div>
        <div class="flex justify-between text-[12px] text-on-surface-variant py-1 border-b border-outline-variant/10">
          <span>(-) Despesas Pessoais PF (Vida, Família)</span>
          <span class="font-display font-medium text-error ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.pfExpensesTotal !== undefined ? dre.pfExpensesTotal : dre.pfExpenses)}</span>
        </div>
        <div class="flex justify-between text-[13px] font-extrabold text-tertiary pt-1.5">
          <span>(=) Superávit Mensal (Poupança Real)</span>
          <span class="font-display text-[15px] ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(dre.realSuperavit !== undefined ? dre.realSuperavit : dre.netSurplus)}</span>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-secondary-fixed/20 border border-secondary/20 flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-bold text-secondary flex items-center gap-1">
            ${renderIcon("account_balance", "text-[16px]")}
            Fator R Dinâmico (Alíquota 6% no Simples)
          </span>
          <span id="dre-fator-r-badge" class="px-2 py-0.5 rounded-full ${opt.meetsThreshold || opt.isAnexoIII ? 'bg-tertiary-fixed text-tertiary' : 'bg-secondary-fixed text-secondary'} text-[11px] font-bold">
            ${opt.currentFatorR}% atual
          </span>
        </div>
        <p id="dre-fator-r-rec" class="text-[11px] text-on-surface-variant leading-snug">
          ${opt.recommendation}
        </p>

        <div class="p-2.5 rounded-xl bg-white flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-[10px] text-on-surface-variant uppercase">Pró-Labore Recomendado</span>
            <span class="text-[16px] font-bold text-secondary font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(opt.suggestedProLabore)}/mês</span>
          </div>
          <div class="flex flex-col text-right">
            <span class="text-[10px] text-on-surface-variant uppercase">Economia Anual Estimada</span>
            <span class="text-[16px] font-bold text-tertiary font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(opt.annualTaxSavings)}</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-secondary/10 text-[11px]">
          <span class="text-on-surface-variant">Simular Pró-Labore (R$/mês):</span>
          <input
            type="number"
            id="input-sim-prolabore"
            class="w-24 px-2 py-1 rounded-lg bg-white border border-outline-variant/30 text-right font-bold text-secondary focus:outline-none"
            value="${opt.suggestedProLabore}"
            step="100"
          />
        </div>
      </div>
    </div>
  `;

  openDialog(html);
  const btnClose = document.getElementById("btn-close-dre");
  if (btnClose) btnClose.addEventListener("click", closeDialog);

  const inputSim = document.getElementById("input-sim-prolabore");
  const badgeEl = document.getElementById("dre-fator-r-badge");
  const recEl = document.getElementById("dre-fator-r-rec");
  if (inputSim && badgeEl && recEl) {
    inputSim.addEventListener("input", () => {
      const simVal = parseFloat(inputSim.value) || 0;
      const simOpt = state.store.getFatorROptimizer(targetMonth, { proLabore: simVal });
      badgeEl.textContent = `${simOpt.currentFatorR}% simulado`;
      badgeEl.className = `px-2 py-0.5 rounded-full ${simOpt.meetsThreshold || simOpt.isAnexoIII ? 'bg-tertiary-fixed text-tertiary' : 'bg-secondary-fixed text-secondary'} text-[11px] font-bold`;
      recEl.textContent = simOpt.recommendation;
    });
  }
}

/**
 * Conciliação Bancária Dialog (OFX / CSV)
 */
function openReconciliationDialog() {
  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("upload_file", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Conciliação Bancária</h3>
            <span class="text-[11px] text-primary font-semibold">Extrato OFX ou CSV (Nubank, Santander, etc.)</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-reconcile">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <div class="border-2 border-dashed border-outline-variant/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center bg-surface-container-low/40 cursor-pointer hover:bg-surface-container-low transition-all" id="reconcile-dropzone">
        <span class="material-symbols-outlined text-[32px] text-secondary" data-icon="cloud_upload"></span>
        <div class="flex flex-col">
          <span class="text-[13px] font-bold text-on-surface">Selecione ou Arraste o Extrato Bancário</span>
          <span class="text-[11px] text-on-surface-variant">Formatos suportados: .ofx e .csv</span>
        </div>
        <input type="file" id="input-reconcile-file" accept=".ofx,.csv" class="hidden" />
      </div>

      <div id="reconciliation-results" class="flex flex-col gap-2">
        <!-- Reconciled items rendered here -->
      </div>
    </div>
  `;

  openDialog(html);
  const btnClose = document.getElementById("btn-close-reconcile");
  if (btnClose) btnClose.addEventListener("click", closeDialog);

  const dropzone = document.getElementById("reconcile-dropzone");
  const fileInput = document.getElementById("input-reconcile-file");
  const resultsContainer = document.getElementById("reconciliation-results");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("border-secondary"); });
    dropzone.addEventListener("dragleave", () => { dropzone.classList.remove("border-secondary"); });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("border-secondary");
      if (e.dataTransfer?.files?.[0]) processExtractFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", (e) => {
      if (e.target.files?.[0]) processExtractFile(e.target.files[0]);
    });
  }

  function processExtractFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      let txs = [];
      if (file.name.toLowerCase().endsWith(".ofx")) {
        txs = parseOFX(content);
      } else {
        txs = parseBankCSV(content);
      }

      if (!txs || txs.length === 0) {
        showToast("Nenhuma transação encontrada no arquivo.", "warning");
        return;
      }

      const rec = state.store.reconcileBankTransactions(txs, state.activeMonth);
      renderReconciliationMatches(rec);
    };
    reader.readAsText(file);
  }

  function renderReconciliationMatches(rec) {
    if (!resultsContainer) return;
    const { matchedInflows, matchedOutflows } = rec;

    let html = `
      <div class="p-3 rounded-xl bg-tertiary-fixed/30 flex items-center justify-between">
        <span class="text-[12px] font-bold text-tertiary">
          ${matchedInflows.length} repasse(s) e ${matchedOutflows.length} despesa(s) identificados!
        </span>
        <button type="button" id="btn-confirm-all-reconciled" class="px-3 py-1 rounded-full bg-tertiary text-white text-[11px] font-bold active:scale-95 cursor-pointer">
          Conciliar Todos
        </button>
      </div>
    `;

    if (matchedInflows.length > 0) {
      html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-1 mt-2 tracking-wider">Entradas & Repasses Hospitalares</div>`;
      matchedInflows.forEach((m, idx) => {
        const txDate = m.bankTx?.date || m.transaction?.date || "";
        const txMemo = m.bankTx?.memo || m.transaction?.memo || "Depósito";
        let title = "";
        let amount = m.expectedAmount || (m.transaction ? m.transaction.amount : 0);

        if (m.type === "shift_installment" && m.shift) {
          title = `${m.shift.hospital} — ${m.installment?.number}ª parcela (${m.installment?.percent}%)`;
        } else if (m.type === "shift_full" && m.shift) {
          title = `${m.shift.hospital} — Quitação Integral`;
        } else if (m.type === "consultation" && m.consultation) {
          title = `Consulta: ${m.consultation.patientName}`;
        } else {
          title = m.suggestedAction || "Entrada Conciliada";
        }

        html += `
          <div class="p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-2">
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-[12px] font-bold text-on-surface truncate">${title}</span>
              <span class="text-[11px] text-on-surface-variant truncate">${formatDateBR(txDate)} • ${txMemo}</span>
            </div>
            <div class="text-right flex items-center gap-2 shrink-0">
              <span class="text-[13px] font-bold text-tertiary">${formatCurrency(amount)}</span>
              <button type="button" class="btn-confirm-single-rec px-2.5 py-1 rounded-full bg-secondary-fixed text-secondary text-[11px] font-bold active:scale-95 cursor-pointer" data-inflow-idx="${idx}">
                Confirmar
              </button>
            </div>
          </div>
        `;
      });
    }

    if (matchedOutflows.length > 0) {
      html += `<div class="text-[10px] font-bold text-on-surface-variant/60 uppercase px-1 mt-2 tracking-wider">Saídas & Despesas Operacionais</div>`;
      matchedOutflows.forEach((m, idx) => {
        const txDate = m.bankTx?.date || m.transaction?.date || "";
        const txMemo = m.bankTx?.memo || m.transaction?.memo || "Pagamento";
        const title = m.expense ? `${m.expense.description} (${m.expense.category})` : (m.suggestedAction || "Despesa");
        const amount = m.expectedAmount || (m.expense ? m.expense.value : (m.transaction ? Math.abs(m.transaction.amount) : 0));

        html += `
          <div class="p-3 rounded-xl bg-surface-container-low flex items-center justify-between gap-2">
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-[12px] font-bold text-on-surface truncate">${title}</span>
              <span class="text-[11px] text-on-surface-variant truncate">${formatDateBR(txDate)} • ${txMemo}</span>
            </div>
            <div class="text-right flex items-center gap-2 shrink-0">
              <span class="text-[13px] font-bold text-error">${formatCurrency(amount)}</span>
              <button type="button" class="btn-confirm-outflow-rec px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-[11px] font-bold active:scale-95 cursor-pointer" data-outflow-idx="${idx}">
                Confirmar
              </button>
            </div>
          </div>
        `;
      });
    }

    resultsContainer.innerHTML = html;
    if (typeof enhanceIcons === "function") enhanceIcons(resultsContainer);

    document.querySelectorAll(".btn-confirm-single-rec").forEach(b => {
      b.addEventListener("click", () => {
        const idx = parseInt(b.getAttribute("data-inflow-idx"), 10);
        const m = matchedInflows[idx];
        if (!m) return;
        const txDate = m.bankTx?.date || m.transaction?.date || null;

        if (m.type === "shift_installment" && m.shift && m.installment) {
          state.store.toggleShiftInstallment(m.shift.id, m.installment.number, txDate);
        } else if (m.type === "shift_full" && m.shift) {
          state.store.markShiftAsReceived(m.shift.id, txDate);
        } else if (m.type === "consultation" && m.consultation) {
          state.store.toggleConsultationPaid(m.consultation.id, txDate);
        } else if (m.shift) {
          state.store.markShiftAsReceived(m.shift.id, txDate);
        }

        b.textContent = "Confirmado ✓";
        b.disabled = true;
        b.classList.remove("bg-secondary-fixed", "text-secondary");
        b.classList.add("bg-tertiary-fixed", "text-tertiary");
        showToast("Repasse conciliado com sucesso! 🌸");
        renderCurrentView();
      });
    });

    document.querySelectorAll(".btn-confirm-outflow-rec").forEach(b => {
      b.addEventListener("click", () => {
        const idx = parseInt(b.getAttribute("data-outflow-idx"), 10);
        const m = matchedOutflows[idx];
        if (!m) return;

        if (m.expense) {
          state.store.updateExpense(m.expense.id, { isPaid: true });
        }

        b.textContent = "Baixado ✓";
        b.disabled = true;
        b.classList.remove("bg-primary-fixed", "text-primary");
        b.classList.add("bg-tertiary-fixed", "text-tertiary");
        showToast("Despesa conciliada e baixada! 🌸");
        renderCurrentView();
      });
    });

    const btnAll = document.getElementById("btn-confirm-all-reconciled");
    if (btnAll) {
      btnAll.addEventListener("click", () => {
        matchedInflows.forEach(m => {
          const txDate = m.bankTx?.date || m.transaction?.date || null;
          if (m.type === "shift_installment" && m.shift && m.installment) {
            state.store.toggleShiftInstallment(m.shift.id, m.installment.number, txDate);
          } else if (m.type === "shift_full" && m.shift) {
            state.store.markShiftAsReceived(m.shift.id, txDate);
          } else if (m.type === "consultation" && m.consultation) {
            state.store.toggleConsultationPaid(m.consultation.id, txDate);
          } else if (m.shift) {
            state.store.markShiftAsReceived(m.shift.id, txDate);
          }
        });

        matchedOutflows.forEach(m => {
          if (m.expense) {
            state.store.updateExpense(m.expense.id, { isPaid: true });
          }
        });

        showToast("Todos os repasses e despesas foram conciliados! 🌸");
        closeDialog();
        renderCurrentView();
      });
    }
  }
}

/**
 * Kit do Contador Dialog
 */
function openAccountantKitDialog(targetMonth = state.activeMonth) {
  const kit = generateAccountantKit(targetMonth);

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("contact_phone", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Kit do Contador em 1 Toque</h3>
            <span class="text-[11px] text-primary font-semibold">${formatMonthYear(targetMonth)}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-accountant">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <p class="text-[12px] text-on-surface-variant leading-relaxed">
        Envie os dados contábeis consolidados com relatório executivo, resumo do Fator R e arquivo CSV compatível com Excel:
      </p>

      <pre class="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-[11px] text-on-surface whitespace-pre-wrap font-mono max-h-[220px] overflow-y-auto">${kit.summaryText}</pre>

      <div class="grid grid-cols-2 gap-2 pt-1">
        <button type="button" id="btn-download-accountant-csv" class="h-10 rounded-full bg-surface-container text-on-surface font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all">
          ${renderIcon("download", "text-[16px]")}
          <span>Baixar CSV</span>
        </button>
        <button type="button" id="btn-whatsapp-accountant" class="h-10 rounded-full bg-[#25D366] text-white font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm">
          ${renderIcon("send", "text-[16px]")}
          <span>WhatsApp Contador</span>
        </button>
      </div>
    </div>
  `;

  openDialog(html);
  const btnClose = document.getElementById("btn-close-accountant");
  if (btnClose) btnClose.addEventListener("click", closeDialog);

  const btnDl = document.getElementById("btn-download-accountant-csv");
  if (btnDl) {
    btnDl.addEventListener("click", () => {
      const csvData = kit.csvContent || kit.csv || "";
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_contabil_${targetMonth}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("CSV para contabilidade baixado! 📄");
    });
  }


  const btnWa = document.getElementById("btn-whatsapp-accountant");
  if (btnWa) {
    btnWa.addEventListener("click", () => {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(kit.summaryText)}`;
      window.open(url, "_blank");
    });
  }
}

/**
 * Simulador FIRE Pediatra Dialog
 */
function openFIREDialog() {
  const fire = state.store.getDoctorFIREMetrics();

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("local_fire_department", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Simulador FIRE Pediatra</h3>
            <span class="text-[11px] text-primary font-semibold">Liberdade & Independência de Plantões</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-fire">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-gradient-to-br from-secondary-fixed/30 to-primary-fixed/30 flex flex-col gap-2">
        <span class="text-[11px] font-bold text-secondary uppercase tracking-wider">Patrimônio FIRE Necessário (Regra dos 4%)</span>
        <span class="text-[28px] font-display font-bold text-on-surface ${state.privacyMode ? 'privacy-masked-text' : ''}">
          ${formatMoney(fire.targetNestEgg)}
        </span>
        <span class="text-[11px] text-on-surface-variant">Gera <strong>${formatMoney(fire.monthlyPassiveIncomeTarget)}/mês</strong> perpétuos sem necessidade de dar plantões.</span>
      </div>

      <div class="p-3.5 rounded-2xl bg-surface-container-low flex flex-col gap-2">
        <label class="text-[11px] font-bold text-on-surface flex items-center justify-between">
          <span>Seu Patrimônio Investido Atual (R$):</span>
          <span class="text-[10px] text-secondary font-semibold">Simulação Interativa</span>
        </label>
        <div class="relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-on-surface-variant">R$</span>
          <input
            type="number"
            id="input-fire-equity"
            value="${state.store.data.currentEquity || (fire.currentSavings > 0 ? fire.currentSavings : '')}"
            placeholder="Ex: 150000"
            class="w-full h-11 pl-10 pr-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-[14px] font-bold text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-center">
        <div class="p-3 rounded-xl bg-surface-container-low flex flex-col">
          <span class="text-[10px] text-on-surface-variant uppercase font-bold">Custo de Vida Médio</span>
          <span class="text-[16px] font-bold text-on-surface mt-0.5 ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(fire.averageMonthlyExpense)}/mês</span>
        </div>
        <div class="p-3 rounded-xl bg-surface-container-low flex flex-col">
          <span class="text-[10px] text-on-surface-variant uppercase font-bold">Patrimônio Atual</span>
          <span id="fire-accumulated-display" class="text-[16px] font-bold text-tertiary mt-0.5 ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(fire.currentSavings)}</span>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-surface-container-low flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-bold text-on-surface">Termômetro de Independência:</span>
          <span id="fire-shifts-count" class="text-[11px] font-bold text-secondary">${fire.shiftsReplacedCount} plantões eliminados!</span>
        </div>
        <div class="w-full h-3 rounded-full bg-surface-container overflow-hidden">
          <div id="fire-thermo-bar" class="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-300" style="width: ${Math.min(100, (fire.currentSavings / (fire.targetNestEgg || 1)) * 100)}%;"></div>
        </div>
        <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
          <span>Renda passiva gerada: <strong id="fire-passive-income" class="text-tertiary">${formatMoney(fire.passiveMonthlyIncome)}/mês</strong></span>
          <span id="fire-badge" class="px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary font-bold text-[10px]">${fire.freedomBadge}</span>
        </div>
        <p class="text-[11px] text-on-surface-variant leading-snug">
          Cada R$ 1.800 de renda passiva mensal gerada pela sua carteira elimina <strong>1 plantão noturno de 12h</strong> para sempre da sua escala!
        </p>
      </div>
    </div>
  `;

  openDialog(html);
  const btnClose = document.getElementById("btn-close-fire");
  if (btnClose) btnClose.addEventListener("click", closeDialog);

  const inputEq = document.getElementById("input-fire-equity");
  if (inputEq) {
    inputEq.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value) || 0;
      state.store.data.currentEquity = val;
      state.store.save();
      const updated = state.store.getDoctorFIREMetrics(val);

      const elAccum = document.getElementById("fire-accumulated-display");
      const elShifts = document.getElementById("fire-shifts-count");
      const elBar = document.getElementById("fire-thermo-bar");
      const elPassive = document.getElementById("fire-passive-income");
      const elBadge = document.getElementById("fire-badge");

      if (elAccum) elAccum.textContent = formatMoney(updated.currentSavings);
      if (elShifts) elShifts.textContent = `${updated.shiftsReplacedCount} plantões eliminados!`;
      if (elBar) elBar.style.width = `${Math.min(100, (updated.currentSavings / (updated.targetNestEgg || 1)) * 100)}%`;
      if (elPassive) elPassive.textContent = `${formatMoney(updated.passiveMonthlyIncome)}/mês`;
      if (elBadge) elBadge.textContent = updated.freedomBadge;

      triggerHaptic(8);
    });
  }
}

/**
 * Clinical Onboarding Wizard (3 Passos)
 */
function checkOnboarding() {
  if (typeof window === "undefined" || typeof document === "undefined" || !document.body) return;
  if (typeof process !== "undefined" && process.env && (process.env.NODE_TEST_CONTEXT || process.env.NODE_ENV === "test")) return;
  const profile = state.store.data.drProfile || {};
  const shifts = state.store.data.shifts || [];
  if (!profile.completedOnboarding && shifts.length === 0) {
    setTimeout(() => {
      if (typeof document !== "undefined" && document.body && dom.dialogContainer) {
        openOnboardingDialog();
      }
    }, 400);
  }
}

function openOnboardingDialog() {
  let step = 1;
  const renderStep = () => {
    if (step === 1) {
      return `
        <div class="dialog-card-content p-5 flex flex-col gap-3.5 max-h-[90vh] overflow-y-auto overscroll-contain">
          <div class="w-12 h-12 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center mx-auto">
            ${renderIcon("person", "text-[24px]")}
          </div>
          <div class="text-center">
            <h3 class="font-headline text-[18px] font-bold text-on-surface">Bem-vinda ao seu Espaço 🌸</h3>
            <p class="text-[12px] text-on-surface-variant mt-1">Personalize seu Finanças Pediatria v3.0 em 3 passos rápidos.</p>
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <label class="text-[11px] font-bold text-on-surface">Seu Nome / Como prefere ser chamada:</label>
            <input type="text" id="onboarding-name" value="${state.store.data.doctorName || 'Dra. Fernanda'}" class="w-full h-11 px-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary" />
            <label class="text-[11px] font-bold text-on-surface mt-1">CRM e Especialidade:</label>
            <input type="text" id="onboarding-crm" value="${state.store.data.doctorCrm || 'CRM 123456-SP'}" class="w-full h-11 px-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary" />
          </div>
          <button type="button" id="btn-next-step" class="w-full h-11 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] mt-2 active:scale-95 transition-all">Próximo Passo ➔</button>
        </div>
      `;
    } else if (step === 2) {
      return `
        <div class="dialog-card-content p-5 flex flex-col gap-3.5 max-h-[90vh] overflow-y-auto overscroll-contain pb-8">
          <div class="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto">
            ${renderIcon("local_hospital", "text-[24px]")}
          </div>
          <div class="text-center">
            <h3 class="font-headline text-[18px] font-bold text-on-surface">Seus Hospitais & Regras 🏥</h3>
            <p class="text-[12px] text-on-surface-variant mt-1">Onde você realiza seus plantões habituais?</p>
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <label class="text-[11px] font-bold text-on-surface">Hospital Principal:</label>
            <input type="text" id="onboarding-hospital" value="Hospital Mater Dei" class="w-full h-11 px-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary" />
            <label class="text-[11px] font-bold text-on-surface mt-1">Regime Tributário Predominante:</label>
            ${renderCustomSelectHTML({
              id: 'onboarding-tax',
              value: '6',
              options: [
                { value: '6', label: 'PJ Simples Nacional (6% com Fator R)' },
                { value: '11.33', label: 'PJ Lucro Presumido (~11.33%)' },
                { value: '13.33', label: 'PJ Lucro Presumido (~13.33%)' },
                { value: '15.5', label: 'PJ Simples Anexo V (15.5%)' },
                { value: '16.33', label: 'PJ Lucro Presumido (~16.33%)' },
                { value: '27.5', label: 'Carnê-Leão PF / RPA (27.5%)' }
              ],
              icon: 'tune'
            })}
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <button type="button" id="btn-prev-step" class="h-11 rounded-full bg-surface-container text-on-surface font-bold text-[13px]">Voltar</button>
            <button type="button" id="btn-next-step" class="h-11 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] active:scale-95">Próximo ➔</button>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="dialog-card-content p-5 flex flex-col gap-3.5 max-h-[90vh] overflow-y-auto overscroll-contain">
          <div class="w-12 h-12 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center mx-auto">
            ${renderIcon("flag", "text-[24px]")}
          </div>
          <div class="text-center">
            <h3 class="font-headline text-[18px] font-bold text-on-surface">Sua Meta & Bem-Estar 🎯</h3>
            <p class="text-[12px] text-on-surface-variant mt-1">Defina sua meta de renda e limite de fadiga CFM.</p>
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <label class="text-[11px] font-bold text-on-surface">Meta Mensal de Faturamento (R$):</label>
            <input type="number" id="onboarding-goal" value="20000" class="w-full h-11 px-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary font-bold" />
            <label class="text-[11px] font-bold text-on-surface mt-1">Limite Máximo de Horas/Semana (CFM):</label>
            <input type="number" id="onboarding-fatigue" value="48" class="w-full h-11 px-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary font-bold" />
          </div>
          <button type="button" id="btn-finish-onboarding" class="w-full h-11 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] mt-2 active:scale-95 transition-all">Começar a Usar o App 🚀</button>
        </div>
      `;
    }
  };

  const updateDialog = () => {
    openDialog(renderStep());
    if (dom.dialogContainer) {
      attachCustomSelectEvents(dom.dialogContainer);
    }
    const btnNext = document.getElementById("btn-next-step");
    const btnPrev = document.getElementById("btn-prev-step");
    const btnFinish = document.getElementById("btn-finish-onboarding");

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        if (step === 1) {
          const name = document.getElementById("onboarding-name")?.value;
          const crm = document.getElementById("onboarding-crm")?.value;
          if (name) state.store.data.doctorName = name;
          if (crm) state.store.data.doctorCrm = crm;
        } else if (step === 2) {
          const hosp = document.getElementById("onboarding-hospital")?.value;
          const tax = parseFloat(document.getElementById("onboarding-tax")?.value);
          if (hosp && hosp.trim()) state.store.addWorkLocation(hosp.trim());
          if (!isNaN(tax)) state.store.data.defaultTaxRate = tax;
        }
        step++;
        updateDialog();
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        step--;
        updateDialog();
      });
    }

    if (btnFinish) {
      btnFinish.addEventListener("click", () => {
        const goal = parseFloat(document.getElementById("onboarding-goal")?.value) || 20000;
        const fatigue = parseInt(document.getElementById("onboarding-fatigue")?.value, 10) || 48;
        state.store.data.monthlyIncomeGoal = goal;
        if (!state.store.data.drProfile) state.store.data.drProfile = {};
        state.store.data.drProfile.completedOnboarding = true;
        state.store.data.drProfile.maxWeeklyHours = fatigue;
        state.store.save();
        closeDialog();
        showToast("Configurações iniciais salvas! Bem-vinda! 🌸", "verified");
        renderCurrentView();
      });
    }
  };

  updateDialog();
}

/**
 * Render Consultation Card
 */
function renderConsultationCard(c) {
  const hourly = Math.round(c.value / ((c.durationMinutes || 60) / 60));

  return `
    <article class="card-floating p-4 flex flex-col justify-between transition-all" data-consultation-id="${c.id}">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full ${c.paid ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-primary'} flex items-center justify-center shrink-0">
            ${renderIcon(c.isPackage || c.consultationType?.includes("Puericultura") ? "child_friendly" : "stethoscope", "text-[20px]")}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h2 class="text-[15px] font-bold text-on-surface truncate">${c.patientName}</h2>
              <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-[10px] font-bold">${c.consultationType}</span>
              ${c.puericulturaMonth ? `<span class="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">${c.puericulturaMonth}</span>` : ''}
            </div>
            <p class="text-[12px] text-on-surface-variant truncate">
              ${formatDateBR(c.date)} • ${c.durationMinutes || 60}min • ${c.paymentMethod || 'PIX'}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button type="button" class="btn-toggle-consultation-paid w-7 h-7 rounded-full ${c.paid ? 'text-tertiary' : 'text-on-surface-variant'} hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${c.id}" title="${c.paid ? 'Marcar como Pendente' : 'Marcar como Recebido'}">
            ${renderIcon(c.paid ? "check_circle" : "radio_button_unchecked", "text-[16px]")}
          </button>
          <button type="button" class="btn-edit-consultation w-7 h-7 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${c.id}" title="Editar">
            ${renderIcon("edit", "text-[15px]")}
          </button>
          <button type="button" class="btn-delete-consultation w-7 h-7 rounded-full text-error/70 hover:bg-error-container/40 flex items-center justify-center active:scale-90" data-id="${c.id}" title="Excluir">
            ${renderIcon("delete", "text-[15px]")}
          </button>
        </div>
      </div>
      <div class="my-2 p-2.5 rounded-[16px] bg-surface-container-low/60 flex items-center justify-between">
        <div>
          <span class="text-[10px] text-on-surface-variant block">Honorários</span>
          <span class="text-[16px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(c.value)}</span>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-on-surface-variant block">Rendimento/Hora</span>
          <span class="badge-rate-mint text-[11px] font-bold">
            R$ ${hourly}/h
          </span>
        </div>
      </div>
      ${c.notes ? `<p class="text-[11px] text-on-surface-variant italic truncate">${c.notes}</p>` : ''}
    </article>
  `;
}


/**
 * Toast notification manager with optional 1-tap Undo callback
 */
function showToast(message, icon = "favorite", undoCallback = null) {
  if (!dom.toast || !dom.toastMsg) return;
  dom.toastMsg.textContent = message;

  const oldUndo = dom.toast.querySelector(".toast-undo-btn");
  if (oldUndo) oldUndo.remove();

  if (undoCallback && typeof undoCallback === "function") {
    const undoBtn = document.createElement("button");
    undoBtn.type = "button";
    undoBtn.className = "toast-undo-btn ml-2.5 px-2.5 py-0.5 rounded-full bg-white/25 hover:bg-white/40 text-white font-bold text-[11px] underline cursor-pointer transition-all active:scale-95";
    undoBtn.textContent = "Desfazer";
    undoBtn.onclick = (e) => {
      e.stopPropagation();
      undoCallback();
      dom.toast.classList.remove("show");
    };
    dom.toast.appendChild(undoBtn);
  }

  const iconSpan = dom.toast.querySelector(".material-symbols-outlined");
  if (iconSpan) {
    iconSpan.setAttribute("data-icon", icon);
    if (typeof enhanceIcons === "function") {
      enhanceIcons(dom.toast);
    }
  }

  dom.toast.classList.add("show");
  if (dom.toastTimeout) clearTimeout(dom.toastTimeout);
  dom.toastTimeout = setTimeout(() => {
    dom.toast.classList.remove("show");
    const u = dom.toast.querySelector(".toast-undo-btn");
    if (u) u.remove();
  }, undoCallback ? 5500 : 3200);
}

/**
 * Pediatric Microinteractions & Floating Particles Engine
 * Emits delicate hearts, butterflies, sparkles, and baby smiles
 * @param {number|null} x
 * @param {number|null} y
 * @param {number} count
 * @param {'hearts'|'butterflies'|'mixed'} type
 */
function spawnPediatricParticles(x = null, y = null, count = 8, type = 'mixed') {
  if (typeof document === 'undefined') return;
  const container = (dom && dom.particlesContainer) || document.getElementById('pediatric-particles-container') || (document.body && document.body.appendChild ? document.body : null);
  if (!container) return;

  // Support invocation with event as first argument: spawnPediatricParticles(e, 'hearts')
  let resolvedX = null;
  let resolvedY = null;
  if (x && typeof x === 'object') {
    if ('clientX' in x || 'pageX' in x) {
      resolvedX = x.clientX || x.pageX || null;
      resolvedY = x.clientY || x.pageY || null;
    }
    if (typeof y === 'string') {
      type = y;
    }
  } else if (typeof x === 'number') {
    resolvedX = x;
    resolvedY = typeof y === 'number' ? y : null;
  }

  const defaultX = typeof window !== 'undefined' ? window.innerWidth / 2 : 200;
  const defaultY = typeof window !== 'undefined' ? window.innerHeight * 0.55 : 300;
  const startX = (resolvedX !== null && !isNaN(resolvedX)) ? resolvedX : defaultX;
  const startY = (resolvedY !== null && !isNaN(resolvedY)) ? resolvedY : defaultY;

  const emojiMap = {
    hearts: ['💖', '💕', '💗', '🌸', '✨', '💐'],
    butterflies: ['🦋', '🌸', '✨', '💕', '🌷'],
    mixed: ['💖', '💕', '🦋', '✨', '🌸', '🍼', '🩺']
  };
  const list = emojiMap[type] || emojiMap.mixed;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const symbol = list[Math.floor(Math.random() * list.length)];
    p.textContent = symbol;
    const isButterfly = symbol === '🦋' || type === 'butterflies';
    p.className = `pediatric-particle ${isButterfly ? 'butterfly' : ''}`;

    const dx = (Math.random() - 0.5) * 140;
    const rot = (Math.random() - 0.5) * 50;
    const delay = Math.random() * 0.2;
    const fontSize = 16 + Math.floor(Math.random() * 12);

    p.style.setProperty('--drift-x', `${dx}px`);
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--rot-mid', `${rot * 0.6}deg`);
    p.style.setProperty('--rot-high', `${rot * 1.2}deg`);
    p.style.setProperty('--rot-end', `${rot * 1.5}deg`);
    p.style.setProperty('--rot', `${rot}deg`);
    p.style.left = `${startX + (Math.random() - 0.5) * 30}px`;
    p.style.top = `${startY + (Math.random() - 0.5) * 20}px`;
    p.style.fontSize = `${fontSize}px`;
    p.style.animationDelay = `${delay}s`;

    container.appendChild(p);
    setTimeout(() => {
      if (p.parentNode) p.parentNode.removeChild(p);
    }, 2200);
  }
}

/**
 * Delightful pediatric visual reaction for entries and management:
 * Always positive, sweet, encouraging, and delicate (baby smiling, hearts, butterflies & sparkles).
 * @param {object} params { type: 'income'|'expense', title: string, message: string, amount: number }
 */
function showBabyReaction({ type = 'income', title = '', message = '', amount = null } = {}) {
  if (!dom.babyOverlay || !dom.babyContent) return;

  const isIncome = type === 'income';
  const defaultTitle = isIncome ? 'Uhull! Entrada Registrada! 👶💖' : 'Cuidado & Organização! 🍼✨';
  const defaultMsg = isIncome
    ? 'Bebê sorridente com corações! Seu faturamento crescendo com saúde, amor e dedicação.'
    : 'Tudo anotado e sob controle! Suas finanças protegidas com carinho pediátrico.';

  const formattedAmount = amount !== null ? formatCurrency(amount) : '';

  dom.babyContent.innerHTML = `
    <!-- Floating Hearts, Butterflies & Sparkles -->
    ${isIncome ? `
      <span class="floating-heart text-[22px]" style="left: 10%; top: 15%; animation-delay: 0s;">💖</span>
      <span class="floating-heart text-[26px]" style="left: 75%; top: 12%; animation-delay: 0.4s;">💕</span>
      <span class="floating-heart text-[18px]" style="left: 45%; top: 8%; animation-delay: 0.8s;">✨</span>
      <span class="floating-heart text-[20px]" style="left: 85%; top: 35%; animation-delay: 1.2s;">👶</span>
    ` : `
      <span class="floating-heart text-[22px]" style="left: 12%; top: 20%; animation-delay: 0s;">🦋</span>
      <span class="floating-heart text-[24px]" style="left: 78%; top: 15%; animation-delay: 0.4s;">🌸</span>
      <span class="floating-heart text-[18px]" style="left: 48%; top: 8%; animation-delay: 0.8s;">✨</span>
      <span class="floating-heart text-[20px]" style="left: 82%; top: 32%; animation-delay: 1.2s;">🍼</span>
    `}

    <div class="w-20 h-20 mx-auto rounded-full overflow-hidden shadow-sm border-2 ${isIncome ? 'border-primary-pink' : 'border-lilac-medium'} baby-joy-bounce relative mb-2.5 bg-primary-fixed flex items-center justify-center">
      <img
        src="./assets/images/baby_happy.jpg"
        alt="Bebê fofo"
        class="w-full h-full object-cover"
        onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.classList.remove('hidden');"
      />
      <div class="w-full h-full hidden flex items-center justify-center text-[36px]">
        ${isIncome ? '👶💖' : '🍼🌸'}
      </div>
    </div>

    <h3 class="font-headline text-[15.5px] font-bold ${isIncome ? 'text-secondary' : 'text-primary'} mb-1">
      ${title || defaultTitle}
    </h3>

    ${formattedAmount ? `
      <div class="text-[16px] font-extrabold text-on-surface font-display mb-1">
        ${formattedAmount}
      </div>
    ` : ''}

    <p class="text-[11.5px] text-on-surface-variant leading-relaxed mb-3 px-2">
      ${message || defaultMsg}
    </p>

    <button
      type="button"
      id="btn-close-baby-reaction"
      class="h-9 px-5 rounded-full bg-gradient-to-r ${isIncome ? 'from-secondary to-primary' : 'from-primary to-secondary'} text-white font-bold text-[12px] shadow-xs transition-all active:scale-95 mx-auto cursor-pointer"
    >
      Continuar ✨
    </button>
  `;

  dom.babyOverlay.classList.add("active");
  triggerHaptic(18);
  spawnPediatricParticles(null, null, isIncome ? 10 : 8, isIncome ? 'hearts' : 'butterflies');

  const closeReaction = () => {
    if (dom.babyOverlay) dom.babyOverlay.classList.remove("active");
  };

  const closeBtn = document.getElementById("btn-close-baby-reaction");
  if (closeBtn) closeBtn.onclick = closeReaction;
  dom.babyOverlay.onclick = (e) => {
    if (e.target === dom.babyOverlay) closeReaction();
  };

  if (dom.babyTimeout) clearTimeout(dom.babyTimeout);
  dom.babyTimeout = setTimeout(closeReaction, 2400);
}

/**
 * Doctor Profile Photo Management
 */
function getDoctorPhoto() {
  if (state.store && state.store.data && state.store.data.doctorPhoto) {
    return state.store.data.doctorPhoto;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('financas_ped_doctor_photo') || null;
    }
  } catch (e) {}
  return null;
}

function setDoctorPhoto(photoBase64) {
  if (photoBase64) {
    if (state.store && typeof state.store.updateDoctorProfile === 'function') {
      state.store.updateDoctorProfile({ doctorPhoto: photoBase64 });
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('financas_ped_doctor_photo', photoBase64);
      }
    } catch (e) {}
  } else {
    if (state.store && typeof state.store.updateDoctorProfile === 'function') {
      state.store.updateDoctorProfile({ doctorPhoto: null });
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('financas_ped_doctor_photo');
      }
    } catch (e) {}
  }
  updateAllDoctorAvatars();
}

function updateAllDoctorAvatars() {
  const photo = getDoctorPhoto();
  const docName = (state.store && state.store.data && state.store.data.doctorName) || 'Dra. Nanda';
  const initials = docName.replace(/^(dra?\.\s*)/i, '').trim().slice(0, 2).toUpperCase() || 'DR';

  // Header Avatar
  const headerImg = document.getElementById('header-avatar-img');
  const headerInitials = document.getElementById('header-avatar-initials');
  const headerName = document.getElementById('header-doctor-name');

  if (headerName) {
    headerName.textContent = docName.length > 16 ? docName.slice(0, 15) + '...' : docName;
  }

  if (headerImg && headerInitials) {
    if (photo) {
      headerImg.src = photo;
      headerImg.classList.remove('hidden');
      headerInitials.classList.add('hidden');
    } else {
      headerImg.src = '';
      headerImg.classList.add('hidden');
      headerInitials.textContent = initials;
      headerInitials.classList.remove('hidden');
    }
  }

  // Drawer Avatar
  const drawerImg = document.getElementById('drawer-avatar-img');
  const drawerInitials = document.getElementById('drawer-avatar-initials');
  const drawerName = document.getElementById('drawer-doctor-name');
  const drawerCrm = document.getElementById('drawer-doctor-crm');
  const btnRemovePhoto = document.getElementById('btn-drawer-remove-photo');

  if (drawerName) drawerName.textContent = docName;
  if (drawerCrm) drawerCrm.textContent = (state.store && state.store.data && state.store.data.doctorCrm) || 'CRM-SP • Pediatria';

  if (drawerImg && drawerInitials) {
    if (photo) {
      drawerImg.src = photo;
      drawerImg.classList.remove('hidden');
      drawerInitials.classList.add('hidden');
      if (btnRemovePhoto) btnRemovePhoto.classList.remove('hidden');
    } else {
      drawerImg.src = '';
      drawerImg.classList.add('hidden');
      drawerInitials.textContent = initials;
      drawerInitials.classList.remove('hidden');
      if (btnRemovePhoto) btnRemovePhoto.classList.add('hidden');
    }
  }

  // Profile Dialog Avatar (if open)
  const modalImg = document.getElementById('profile-modal-avatar-img');
  const modalInitials = document.getElementById('profile-modal-avatar-initials');
  const btnModalRemove = document.getElementById('btn-profile-modal-remove-photo');
  if (modalImg && modalInitials) {
    if (photo) {
      modalImg.src = photo;
      modalImg.classList.remove('hidden');
      modalInitials.classList.add('hidden');
      if (btnModalRemove) btnModalRemove.classList.remove('hidden');
    } else {
      modalImg.src = '';
      modalImg.classList.add('hidden');
      modalInitials.textContent = initials;
      modalInitials.classList.remove('hidden');
      if (btnModalRemove) btnModalRemove.classList.add('hidden');
    }
  }
}

function handleDoctorPhotoFileSelect(file) {
  if (!file) return;
  if (!file.type || !file.type.startsWith('image/')) {
    showToast('Por favor, selecione um arquivo de imagem válido (JPG ou PNG).', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const rawDataUrl = e.target.result;
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 280;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setDoctorPhoto(compressed);
        showToast('Foto da médica atualizada com sucesso! 🌸✨', 'success');
        spawnPediatricParticles(null, null, 10, 'hearts');
      };
      img.onerror = () => {
        setDoctorPhoto(rawDataUrl);
        showToast('Foto da médica atualizada com sucesso! 🌸✨', 'success');
      };
      img.src = rawDataUrl;
    } catch (err) {
      setDoctorPhoto(rawDataUrl);
      showToast('Foto da médica atualizada com sucesso! 🌸✨', 'success');
    }
  };
  reader.readAsDataURL(file);
}

/**
 * Hamburger Drawer Controllers
 */
function openHamburgerDrawer() {
  if (dom.hamburgerDrawerOverlay) dom.hamburgerDrawerOverlay.classList.add("active");
  if (dom.hamburgerDrawer) dom.hamburgerDrawer.classList.add("active");
  if (typeof document !== "undefined" && document.body && document.body.style) {
    document.body.style.overflow = "hidden";
  }
  updateAllDoctorAvatars();
}

function closeHamburgerDrawer() {
  if (dom.hamburgerDrawerOverlay) dom.hamburgerDrawerOverlay.classList.remove("active");
  if (dom.hamburgerDrawer) dom.hamburgerDrawer.classList.remove("active");
  if (typeof document !== "undefined" && document.body && document.body.style) {
    document.body.style.overflow = "";
  }
}

/**
 * Brazilian Legal & Medical Compliance Documentation Modal
 * Covers LGPD (Lei 13.709/18), CFM Res. 2.217/18, CFM Res. 2.147/16, CF/88, LAI, CC/02
 */
function openLegalComplianceModal() {
  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto manrope-font text-on-surface">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center">
            ${renderIcon('shield', 'text-[22px]')}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Segurança Jurídica & Compliance</h3>
            <span class="text-[11px] text-primary font-semibold">LGPD • CFM • Ética & Blindagem Profissional</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container cursor-pointer" id="btn-close-dialog">
          ${renderIcon('close', 'text-[18px]')}
        </button>
      </div>

      <!-- Compliance Badge -->
      <div class="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          ${renderIcon('verified_user', 'text-[20px]')}
        </div>
        <div>
          <h4 class="text-[13px] font-bold text-emerald-900 dark:text-emerald-300">Arquitetura 100% Local-First & Zero Cloud Leak</h4>
          <p class="text-[11px] text-emerald-700 dark:text-emerald-400/90 leading-tight">
            Seus dados financeiros e clínicos nunca saem do seu dispositivo. Sem servidores remotos, sem rastreadores.
          </p>
        </div>
      </div>

      <!-- Legal Accordion / Cards -->
      <div class="flex flex-col gap-3">
        <!-- 1. LGPD -->
        <div class="p-3.5 rounded-2xl bg-surface-container-low border border-purple-100/70 dark:border-purple-900/30">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-secondary">${renderIcon('policy', 'text-[18px]')}</span>
            <h4 class="text-[13px] font-bold text-on-surface">1. Lei Geral de Proteção de Dados (Lei 13.709/2018)</h4>
          </div>
          <ul class="text-[11.5px] text-on-surface-variant space-y-1.5 pl-1 leading-relaxed">
            <li><strong>• Art. 7º e 11 (Dados Sensíveis de Saúde):</strong> O aplicativo não transmite prontuários ou diagnósticos nominais para nuvens públicas.</li>
            <li><strong>• Anonimização e Pseudonimização Nativa:</strong> Ferramentas como SBAR utilizam apenas iniciais de leito e paciente, garantindo conformidade com a LGPD e evitando quebra de sigilo por vazamentos externos.</li>
            <li><strong>• Autodeterminação Informativa:</strong> Você possui controle irrestrito: exporte todos os dados em JSON/CSV e exclua a qualquer momento com 1 toque.</li>
          </ul>
        </div>

        <!-- 2. CFM & Ética Médica -->
        <div class="p-3.5 rounded-2xl bg-surface-container-low border border-purple-100/70 dark:border-purple-900/30">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-secondary">${renderIcon('gavel', 'text-[18px]')}</span>
            <h4 class="text-[13px] font-bold text-on-surface">2. Código de Ética Médica (Resolução CFM nº 2.217/2018)</h4>
          </div>
          <ul class="text-[11.5px] text-on-surface-variant space-y-1.5 pl-1 leading-relaxed">
            <li><strong>• Artigos 73 a 79 (Sigilo Profissional Absoluto):</strong> Vedada a revelação de fato obtido em razão da profissão médica. O app conta com o exclusivo <em>Modo Sigilo</em> para ocultar valores ao lado de colegas ou em ambiente público.</li>
            <li><strong>• Art. 58 (Honorários Justos e Glosas):</strong> Registro individualizado e transparente de plantões, consultas de puericultura e valores glosados para subsidiar contestações ético-administrativas.</li>
          </ul>
        </div>

        <!-- 3. Prevenção de Fadiga & Condições de Trabalho -->
        <div class="p-3.5 rounded-2xl bg-surface-container-low border border-purple-100/70 dark:border-purple-900/30">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-secondary">${renderIcon('vital_signs', 'text-[18px]')}</span>
            <h4 class="text-[13px] font-bold text-on-surface">3. Resolução CFM nº 2.147/2016 & Prevenção de Sobrecarga</h4>
          </div>
          <p class="text-[11.5px] text-on-surface-variant leading-relaxed pl-1">
            Reconhecimento das diretrizes de responsabilidade médica e fadiga profissional. O app monitora a densidade de plantões consecutivos (12h/24h) com alertas de saturação, apoiando a saúde ocupacional da pediatra e a segurança do paciente neonatal.
          </p>
        </div>

        <!-- 4. Constituição Federal & Código Civil -->
        <div class="p-3.5 rounded-2xl bg-surface-container-low border border-purple-100/70 dark:border-purple-900/30">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-secondary">${renderIcon('lock', 'text-[18px]')}</span>
            <h4 class="text-[13px] font-bold text-on-surface">4. CF/88 (Art. 5º, X e XII) & Blindagem Fiscal (CC/02)</h4>
          </div>
          <p class="text-[11.5px] text-on-surface-variant leading-relaxed pl-1">
            Garantia constitucional de inviolabilidade da intimidade e do sigilo fiscal. Os relatórios gerados (DRE Pediátrico e Kit do Contador) organizam com precisão as deduções legais do Livro Caixa e apuração do Fator R (28%), blindando a profissional contra autuações tributárias da Receita Federal.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-purple-100 dark:border-purple-900/40">
        <button
          type="button"
          id="btn-close-legal"
          class="h-10 px-5 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-[12.5px] font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
        >
          Entendido & Em Conformidade ✨
        </button>
      </div>
    </div>
  `;

  openDialog(html);

  document.getElementById("btn-close-legal")?.addEventListener("click", () => {
    closeDialog();
  });
  document.getElementById("btn-close-dialog")?.addEventListener("click", () => {
    closeDialog();
  });
}

/**
 * Render Custom Rounded Modern Select Component (Stitch Chic & Pediatric Sanctuary)
 * Renders a stylish rounded button trigger, floating popover with options,
 * and maintains a hidden native <select> for 100% backward compatibility with forms & tests.
 * @param {object} options
 * @returns {string} HTML markup
 */
function renderCustomSelectHTML({ id, name, value, options = [], icon = null, extraClass = "" } = {}) {
  let selectedLabel = "";
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      if (String(opt.value) === String(value)) selectedLabel = opt.label;
      return { value: String(opt.value), label: String(opt.label), icon: opt.icon || null };
    }
    const strVal = String(opt);
    if (strVal === String(value)) selectedLabel = strVal;
    return { value: strVal, label: strVal, icon: null };
  });

  if (!selectedLabel && normalizedOptions.length > 0) {
    selectedLabel = normalizedOptions[0].label;
  }

  return `
    <div class="custom-select-container ${extraClass}" data-select-id="${id}">
      <select id="${id}" name="${name || id}" class="hidden" tabindex="-1" aria-hidden="true">
        ${normalizedOptions.map(opt => `
          <option value="${opt.value}" ${opt.value === String(value) ? 'selected' : ''}>${opt.label}</option>
        `).join("")}
      </select>
      <button
        type="button"
        class="custom-select-trigger"
        id="${id}-trigger"
        aria-haspopup="listbox"
        aria-expanded="false"
      >
        <div class="flex items-center gap-2 min-w-0 flex-1">
          ${icon ? `<span class="custom-select-lead-icon text-secondary text-[16px]">${renderIcon(icon, 'text-[16px]')}</span>` : ''}
          <span class="custom-select-display-label truncate text-[12.5px] font-semibold text-on-surface" id="${id}-label">
            ${selectedLabel}
          </span>
        </div>
        <span class="custom-select-chevron text-secondary text-[18px] transition-transform duration-200">
          ${renderIcon('expand_more', 'text-[18px]')}
        </span>
      </button>
      <div class="custom-select-popover custom-select-menu hidden" id="${id}-popover" role="listbox">
        <div class="custom-select-list custom-select-menu-list no-scrollbar">
          ${normalizedOptions.map(opt => {
            const isSelected = opt.value === String(value);
            return `
              <div
                class="custom-select-item ${isSelected ? 'active' : ''}"
                role="option"
                data-value="${opt.value}"
                data-label="${opt.label}"
              >
                <div class="flex items-center gap-2 truncate">
                  ${opt.icon ? `<span class="text-secondary text-[15px]">${renderIcon(opt.icon, 'text-[15px]')}</span>` : ''}
                  <span class="truncate">${opt.label}</span>
                </div>
                ${isSelected ? `<span class="text-secondary text-[16px] font-bold shrink-0">${renderIcon('check', 'text-[16px]')}</span>` : ''}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

/**
 * Attach interaction events to all custom select components in a container
 * @param {HTMLElement|Document} root
 */
function attachCustomSelectEvents(root = document) {
  if (!root || !root.querySelectorAll) return;
  const containers = root.querySelectorAll(".custom-select-container");

  containers.forEach(container => {
    if (container.dataset.customSelectInitialized === "true") return;
    container.dataset.customSelectInitialized = "true";

    const selectId = container.getAttribute("data-select-id");
    const nativeSelect = container.querySelector("select");
    const trigger = container.querySelector(".custom-select-trigger");
    const popover = container.querySelector(".custom-select-popover");
    const labelEl = container.querySelector(".custom-select-display-label");
    const chevron = container.querySelector(".custom-select-chevron");

    if (!trigger || !popover || !nativeSelect) return;

    // Toggle popover
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isClosed = popover.classList.contains("hidden");

      // Close all other open popovers
      document.querySelectorAll(".custom-select-popover:not(.hidden)").forEach(p => {
        if (p !== popover) {
          p.classList.add("hidden");
          p.classList.remove("dropup");
          const parent = p.closest(".custom-select-container");
          if (parent) {
            parent.querySelector(".custom-select-trigger")?.classList.remove("active");
            parent.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
            const c = parent.querySelector(".custom-select-chevron");
            if (c) c.style.transform = "";
          }
        }
      });

      if (isClosed) {
        // Smart proximity & dropup detection
        if (typeof window !== "undefined" && trigger.getBoundingClientRect) {
          const triggerRect = trigger.getBoundingClientRect();
          const vh = window.innerHeight || 800;
          const spaceBelowViewport = vh - triggerRect.bottom;
          const spaceAboveViewport = triggerRect.top;

          // Check if inside a dialog/card or bottom-sheet
          const scrollParent = container.closest(".dialog-box, .dialog-card, .bottom-sheet, [role='dialog']");
          const isInsideDialog = Boolean(container.closest(".dialog-box, .dialog-card"));
          let shouldDropUp = false;

          if (!isInsideDialog) {
            if (scrollParent && scrollParent.getBoundingClientRect) {
              const parentRect = scrollParent.getBoundingClientRect();
              const spaceBelowParent = parentRect.bottom - triggerRect.bottom;
              const spaceAboveParent = triggerRect.top - parentRect.top;

              if (spaceBelowParent < 210 && spaceAboveParent > spaceBelowParent) {
                shouldDropUp = true;
              } else if (spaceBelowViewport < 230 && spaceAboveViewport > spaceBelowViewport) {
                shouldDropUp = true;
              }
            } else {
              if (spaceBelowViewport < 230 && spaceAboveViewport > spaceBelowViewport) {
                shouldDropUp = true;
              }
            }
          }

          if (shouldDropUp) {
            popover.classList.add("dropup");
          } else {
            popover.classList.remove("dropup");
          }
        }

        popover.classList.remove("hidden");
        trigger.classList.add("active");
        trigger.setAttribute("aria-expanded", "true");
        if (chevron) chevron.style.transform = "rotate(180deg)";

        // Ensure popover and buttons are fully visible within modal scroll container
        if (typeof setTimeout !== "undefined") {
          setTimeout(() => {
            if (!popover.classList.contains("hidden")) {
              const card = container.closest(".dialog-card, .dialog-box, .dialog-card-content");
              if (card && card.scrollTo) {
                const targetScroll = container.offsetTop + popover.offsetHeight;
                if (card.scrollTop + card.clientHeight < targetScroll + 60) {
                  card.scrollTo({ top: targetScroll + 60 - card.clientHeight, behavior: "smooth" });
                }
              } else if (popover.scrollIntoView) {
                popover.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
              }
            }
          }, 40);
        }
      } else {
        popover.classList.add("hidden");
        popover.classList.remove("dropup");
        trigger.classList.remove("active");
        trigger.setAttribute("aria-expanded", "false");
        if (chevron) chevron.style.transform = "";
      }
    });

    // Option selection
    const items = popover.querySelectorAll(".custom-select-item");
    items.forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const val = item.getAttribute("data-value");
        const lbl = item.getAttribute("data-label");

        // Update native select
        nativeSelect.value = val;
        nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
        nativeSelect.dispatchEvent(new Event("input", { bubbles: true }));

        // Update UI
        if (labelEl) labelEl.textContent = lbl;
        items.forEach(i => {
          i.classList.remove("active");
          const oldCheck = i.querySelector(".shrink-0");
          if (oldCheck) oldCheck.remove();
        });
        item.classList.add("active");
        const checkSpan = document.createElement("span");
        checkSpan.className = "text-secondary text-[16px] font-bold shrink-0";
        checkSpan.innerHTML = renderIcon('check', 'text-[16px]');
        item.appendChild(checkSpan);

        // Close popover
        popover.classList.add("hidden");
        popover.classList.remove("dropup");
        trigger.classList.remove("active");
        trigger.setAttribute("aria-expanded", "false");
        if (chevron) chevron.style.transform = "";
      });
    });

    // Sync if native select changed programmatically
    nativeSelect.addEventListener("change", () => {
      const selectedOption = nativeSelect.options[nativeSelect.selectedIndex];
      if (selectedOption) {
        if (labelEl) labelEl.textContent = selectedOption.text;
        items.forEach(i => {
          const isSel = i.getAttribute("data-value") === nativeSelect.value;
          i.classList.toggle("active", isSel);
        });
      }
    });
  });
}

// Global click-outside and keydown listener for custom selects
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    if (!e.target.closest || !e.target.closest(".custom-select-container")) {
      document.querySelectorAll(".custom-select-popover:not(.hidden)").forEach(p => {
        p.classList.add("hidden");
        p.classList.remove("dropup");
        const parent = p.closest(".custom-select-container");
        if (parent) {
          parent.querySelector(".custom-select-trigger")?.classList.remove("active");
          parent.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
          const chevron = parent.querySelector(".custom-select-chevron");
          if (chevron) chevron.style.transform = "";
        }
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".custom-select-popover:not(.hidden)").forEach(p => {
        p.classList.add("hidden");
        p.classList.remove("dropup");
        const parent = p.closest(".custom-select-container");
        if (parent) {
          parent.querySelector(".custom-select-trigger")?.classList.remove("active");
          parent.querySelector(".custom-select-trigger")?.setAttribute("aria-expanded", "false");
          const chevron = parent.querySelector(".custom-select-chevron");
          if (chevron) chevron.style.transform = "";
        }
      });
    }
  });
}

/**
 * Dialog Modal Controllers (iOS Style)
 */
function openDialog(html) {
  if (!dom.dialogContainer || !dom.dialogOverlay || typeof document === "undefined" || !document.body) return;
  dom.dialogContainer.innerHTML = html;
  if (typeof enhanceIcons === "function") {
    enhanceIcons(dom.dialogContainer);
  }
  if (typeof attachCustomSelectEvents === "function") {
    attachCustomSelectEvents(dom.dialogContainer);
  }
  dom.dialogOverlay.classList.add("active");
  dom.dialogContainer.classList.add("active");
  dom.dialogContainer.scrollTop = 0;
  if (document.body && document.body.style) document.body.style.overflow = "hidden";
}

function closeDialog() {
  if (!dom.dialogContainer || !dom.dialogOverlay) return;
  dom.dialogOverlay.classList.remove("active");
  dom.dialogContainer.classList.remove("active");
  if (typeof document !== "undefined" && document.body && document.body.style) document.body.style.overflow = "";
}

/**
 * iOS-styled confirmation dialog replacing native window.confirm()
 */
function showConfirmDialog({ title, message, icon = "warning", confirmText = "Confirmar", cancelText = "Cancelar", isDanger = false, onConfirm }) {
  const html = `
    <div class="p-6 flex flex-col gap-4 text-center">
      <div class="w-14 h-14 rounded-full ${isDanger ? 'bg-error-container text-error' : 'bg-primary-fixed text-primary'} mx-auto flex items-center justify-center shadow-inner">
        <span class="material-symbols-outlined text-[28px]">${icon}</span>
      </div>
      <div class="flex flex-col gap-1">
        <h3 class="font-headline text-[18px] font-bold text-on-surface">${title}</h3>
        <p class="text-[13px] text-on-surface-variant leading-relaxed">${message}</p>
      </div>
      <div class="grid grid-cols-2 gap-2.5 pt-2">
        <button
          type="button"
          id="btn-dialog-cancel"
          class="h-11 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-bold text-[13px] transition-all active:scale-95"
        >
          ${cancelText}
        </button>
        <button
          type="button"
          id="btn-dialog-confirm"
          class="h-11 rounded-full ${isDanger ? 'bg-error text-white shadow-[0_4px_14px_rgba(186,26,26,0.3)]' : 'bg-gradient-to-r from-secondary to-primary text-white shadow-sm'} font-bold text-[13px] transition-all active:scale-95"
        >
          ${confirmText}
        </button>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-dialog-cancel")?.addEventListener("click", closeDialog);
  document.getElementById("btn-dialog-confirm")?.addEventListener("click", () => {
    closeDialog();
    if (typeof onConfirm === "function") onConfirm();
  });
}

/**
 * Interactive Modal to Create or Edit Expense Category (PF / PJ)
 */
function openCategoryModal({ mode = "add", initialData = null, onSave, onCancel } = {}) {
  const isEdit = mode === "edit";
  const initName = initialData && initialData.name ? initialData.name : "";
  const initScope = initialData && initialData.scope ? initialData.scope : "pf";

  const html = `
    <div class="p-5 flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center font-bold">
            ${renderIcon('category', 'text-[22px]')}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">
              ${isEdit ? 'Editar Categoria' : 'Nova Categoria de Despesa'}
            </h3>
            <span class="text-[11px] text-on-surface-variant font-medium">
              ${isEdit ? 'Atualize o nome ou escopo da categoria' : 'Ex: Contador, Mercantil/Mercado, Lanches...'}
            </span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container cursor-pointer" id="btn-close-cat-modal">
          ${renderIcon('close', 'text-[18px]')}
        </button>
      </div>

      <form id="form-category-modal" class="flex flex-col gap-3.5">
        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface-variant">Nome da Categoria</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
            ${renderIcon('label', 'text-[18px] text-secondary')}
            <input
              type="text"
              id="input-modal-cat-name"
              class="w-full bg-transparent text-[13px] font-semibold text-on-surface focus:outline-none placeholder:text-outline"
              placeholder="Ex: Contador, Mercantil/Mercado, Lanches..."
              value="${initName}"
              required
              autofocus
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Escopo da Despesa</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="modal-cat-scope-btn py-2 px-3 rounded-2xl text-[12px] font-bold text-center transition-all cursor-pointer ${initScope === 'pf' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-scope="pf"
            >
              ${renderIcon('person', 'text-[15px] inline mr-1')} Pessoa Física (PF)
            </button>
            <button
              type="button"
              class="modal-cat-scope-btn py-2 px-3 rounded-2xl text-[12px] font-bold text-center transition-all cursor-pointer ${initScope === 'pj' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-scope="pj"
            >
              ${renderIcon('business', 'text-[15px] inline mr-1')} Pessoa Jurídica (PJ)
            </button>
          </div>
          <input type="hidden" id="input-modal-cat-scope" value="${initScope}" />
        </div>

        <div class="grid grid-cols-2 gap-2.5 pt-2 border-t border-purple-100">
          <button
            type="button"
            id="btn-cancel-cat-modal"
            class="h-11 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-bold text-[13px] transition-all active:scale-95 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="h-11 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            ${renderIcon('check', 'text-[18px]')}
            <span>${isEdit ? 'Salvar Alteração' : 'Criar Categoria'}</span>
          </button>
        </div>
      </form>
    </div>
  `;

  openDialog(html);

  setTimeout(() => {
    document.getElementById("input-modal-cat-name")?.focus();
  }, 80);

  const scopeBtns = document.querySelectorAll(".modal-cat-scope-btn");
  scopeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const scope = btn.getAttribute("data-scope");
      const hiddenInput = document.getElementById("input-modal-cat-scope");
      if (hiddenInput) hiddenInput.value = scope;
      scopeBtns.forEach(b => {
        b.classList.remove("bg-secondary", "text-white", "shadow-sm");
        b.classList.add("bg-surface-container-low", "text-on-surface-variant");
      });
      btn.classList.add("bg-secondary", "text-white", "shadow-sm");
      btn.classList.remove("bg-surface-container-low", "text-on-surface-variant");
    });
  });

  const handleClose = () => {
    closeDialog();
    if (typeof onCancel === "function") onCancel();
  };

  document.getElementById("btn-close-cat-modal")?.addEventListener("click", handleClose);
  document.getElementById("btn-cancel-cat-modal")?.addEventListener("click", handleClose);

  document.getElementById("form-category-modal")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("input-modal-cat-name")?.value.trim();
    const scope = document.getElementById("input-modal-cat-scope")?.value || "pf";
    if (!name) {
      showToast("Informe o nome da categoria.", "warning");
      return;
    }
    closeDialog();
    if (typeof onSave === "function") {
      onSave({ id: initialData?.id, name, scope });
    }
  });
}

/**
 * Quick Category Switcher Dialog for Expenses (1-tap modification from Expense Card)
 */
function openQuickCategoryChangeDialog(expense) {
  const currentCategory = expense.category;
  const categoriesPF = state.store.getExpenseCategories ? state.store.getExpenseCategories("pf") : EXPENSE_CATEGORIES_PF;
  const categoriesPJ = state.store.getExpenseCategories ? state.store.getExpenseCategories("pj") : EXPENSE_CATEGORIES_PJ;

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto font-body">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center font-bold">
            ${renderIcon('category', 'text-[22px]')}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Modificar Categoria</h3>
            <p class="text-[11px] text-on-surface-variant font-medium truncate max-w-[220px]">
              ${expense.description} • Atual: <span class="font-bold text-secondary">${currentCategory}</span>
            </p>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container cursor-pointer" id="btn-close-quick-cat">
          ${renderIcon('close', 'text-[18px]')}
        </button>
      </div>

      <!-- Direct Entry / Free Text Input -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] font-bold text-on-surface-variant">Digite qualquer categoria que desejar:</label>
        <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 border border-transparent focus-within:border-secondary focus-within:bg-white transition-all shadow-xs">
          ${renderIcon('edit_note', 'text-[20px] text-secondary')}
          <input
            type="text"
            id="input-quick-custom-cat"
            class="w-full bg-transparent text-[13px] font-semibold text-on-surface focus:outline-none placeholder:text-outline"
            placeholder="Ex: Contador, Mercantil/Mercado, Lanches..."
            value=""
            autofocus
          />
          <button
            type="button"
            id="btn-apply-quick-custom-cat"
            class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-[11px] font-bold shrink-0 shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      </div>

      <!-- Quick Category Selectors PF & PJ -->
      <div class="flex flex-col gap-2.5 pt-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-secondary uppercase tracking-wider">🌸 Pessoa Física (Pessoal)</span>
        </div>
        <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
          ${categoriesPF.map(cat => `
            <button
              type="button"
              class="quick-select-cat-btn px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${currentCategory === cat ? 'bg-secondary text-white shadow-xs font-black' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-category="${cat}"
              data-scope="pf"
            >
              ${cat}
            </button>
          `).join("")}
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-[11px] font-bold text-tertiary uppercase tracking-wider">🩺 Pessoa Jurídica (Trabalho)</span>
        </div>
        <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
          ${categoriesPJ.map(cat => `
            <button
              type="button"
              class="quick-select-cat-btn px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${currentCategory === cat ? 'bg-tertiary text-white shadow-xs font-black' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-category="${cat}"
              data-scope="pj"
            >
              ${cat}
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  openDialog(html);

  setTimeout(() => {
    document.getElementById("input-quick-custom-cat")?.focus();
  }, 80);

  const applyCategoryChange = (newCat, scope = null) => {
    const trimmed = newCat.trim();
    if (!trimmed) {
      showToast("Informe o nome da categoria.", "warning");
      return;
    }
    const resolvedScope = scope || (state.store.getCategoryScope ? state.store.getCategoryScope(trimmed) : "pf");
    state.store.updateExpense(expense.id, {
      category: trimmed,
      scope: resolvedScope
    });
    closeDialog();
    renderCurrentView();
    showToast(`Categoria alterada para '${trimmed}'! ✨`);
  };

  document.getElementById("btn-close-quick-cat")?.addEventListener("click", closeDialog);

  document.querySelectorAll(".quick-select-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-category");
      const scope = btn.getAttribute("data-scope");
      applyCategoryChange(cat, scope);
    });
  });

  const handleApplyInput = () => {
    const customVal = document.getElementById("input-quick-custom-cat")?.value;
    if (customVal && customVal.trim()) {
      applyCategoryChange(customVal.trim());
    } else {
      showToast("Digite o nome da categoria.", "warning");
    }
  };

  document.getElementById("btn-apply-quick-custom-cat")?.addEventListener("click", handleApplyInput);

  document.getElementById("input-quick-custom-cat")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyInput();
    }
  });
}

/**
 * Quick Month Picker Dialog
 */
function openQuickMonthPickerDialog() {
  const months = [
    { num: "01", name: "Janeiro", short: "Jan" },
    { num: "02", name: "Fevereiro", short: "Fev" },
    { num: "03", name: "Março", short: "Mar" },
    { num: "04", name: "Abril", short: "Abr" },
    { num: "05", name: "Maio", short: "Mai" },
    { num: "06", name: "Junho", short: "Jun" },
    { num: "07", name: "Julho", short: "Jul" },
    { num: "08", name: "Agosto", short: "Ago" },
    { num: "09", name: "Setembro", short: "Set" },
    { num: "10", name: "Outubro", short: "Out" },
    { num: "11", name: "Novembro", short: "Nov" },
    { num: "12", name: "Dezembro", short: "Dez" }
  ];
  const [currentYear] = state.activeMonth.split("-");

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[80vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
          <h3 class="font-headline text-[17px] font-bold text-on-surface">Selecionar Mês</h3>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="flex items-center justify-center gap-4 py-1">
        <button type="button" class="p-1 rounded-full text-on-surface-variant hover:text-primary active:scale-90" id="btn-year-prev">
          <span class="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <span class="font-headline text-[18px] font-bold text-primary" id="picker-year-label">${currentYear}</span>
        <button type="button" class="p-1 rounded-full text-on-surface-variant hover:text-primary active:scale-90" id="btn-year-next">
          <span class="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2 pt-1">
        ${months.map(m => {
          const mStr = `${currentYear}-${m.num}`;
          const isSelected = mStr === state.activeMonth;
          return `
            <button
              type="button"
              class="month-cell p-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${isSelected ? 'bg-gradient-to-tr from-secondary to-primary text-white shadow-md font-bold' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}"
              data-month="${mStr}"
            >
              <span class="text-[14px] font-bold">${m.short}</span>
              <span class="text-[10px] ${isSelected ? 'text-white/90' : 'text-on-surface-variant'}">${m.name}</span>
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  let selectedYear = parseInt(currentYear, 10);
  const updateYearGrid = (newYear) => {
    selectedYear = newYear;
    document.getElementById("picker-year-label").textContent = selectedYear;
    document.querySelectorAll(".month-cell").forEach((cell, idx) => {
      const mNum = months[idx].num;
      const mStr = `${selectedYear}-${mNum}`;
      cell.setAttribute("data-month", mStr);
      const isSelected = mStr === state.activeMonth;
      if (isSelected) {
        cell.className = "month-cell p-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 bg-gradient-to-tr from-secondary to-primary text-white shadow-md font-bold";
      } else {
        cell.className = "month-cell p-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 bg-surface-container-low text-on-surface hover:bg-surface-container";
      }
    });
  };

  document.getElementById("btn-year-prev")?.addEventListener("click", () => updateYearGrid(selectedYear - 1));
  document.getElementById("btn-year-next")?.addEventListener("click", () => updateYearGrid(selectedYear + 1));

  document.querySelectorAll(".month-cell").forEach(cell => {
    cell.addEventListener("click", () => {
      state.activeMonth = cell.getAttribute("data-month");
      state.calendarSelectedDate = null;
      closeDialog();
      renderCurrentView();
      showToast(`Visualizando ${formatMonthYear(state.activeMonth)} 🌸`);
    });
  });
}

/**
 * Hospital Delay Notification Dialog (WhatsApp & E-mail Ready with Tone Selector)
 */
function openHospitalDelayDialog(shiftId) {
  const shift = state.store.data.shifts.find(s => s.id === shiftId);
  if (!shift) return;

  const ev = evaluateShiftStatus(shift, state.referenceDate);
  const doctorName = state.store.data.doctorName || "Dra. Pediatra";
  const doctorCrm = state.store.data.doctorCrm || "CRM-SP";

  const getMessage = (tone) => {
    if (tone === "formal") {
      return `À Equipe de Faturamento / Financeiro - ${shift.hospital}\n\nPrezados(as),\n\nVenho por meio desta solicitar a regularização do repasse de honorários médicos referentes ao plantão realizado em ${formatDateBR(shift.shiftDate)} (${shift.shiftType} - ${shift.sector || 'Pediatria'}), prestado pela ${doctorName} (${doctorCrm}).\n\n- Valor Líquido devido: ${formatCurrency(shift.netValue)}\n- Vencimento programado: ${formatDateBR(shift.expectedPaymentDate)} (D+${(shift.paymentLagMonths || 3) * 30})\n- Atraso acumulado: ${ev.delayDays} dia(s)\n\nSolicito a gentileza de envio do comprovante de liquidação ou confirmação do lote bancário.\n\nAtenciosamente,\n${doctorName}`;
    }
    return `Olá, prezada equipe de faturamento do ${shift.hospital}! 🩺✨\n\nSou a ${doctorName}. Gostaria de verificar a previsão de liberação do repasse referente ao plantão que realizei em ${formatDateBR(shift.shiftDate)} (${shift.shiftType} - ${shift.sector || 'Pediatria'}), no valor líquido de ${formatCurrency(shift.netValue)}.\n\nA previsão contratual de depósito era para ${formatDateBR(shift.expectedPaymentDate)} (D+${(shift.paymentLagMonths || 3) * 30}), constando atualmente com ${ev.delayDays} dia(s) além da data estimada.\n\nPoderiam, por gentileza, me passar uma previsão de liberação bancária?\n\nMuito obrigada pela atenção e carinho!\nAtenciosamente,\n${doctorName}`;
  };

  let currentTone = state.billingTone || "gentil";
  let messageText = getMessage(currentTone);

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-coral-expense/20 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center">
            ${renderIcon("forward_to_inbox", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Cobrança de Repasse</h3>
            <span class="text-[11px] text-coral-expense font-semibold">${shift.hospital} • ${ev.label}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <div class="p-3 rounded-2xl bg-coral-expense-bg/60 border border-coral-expense/20 text-[12px] flex flex-col gap-1 text-on-surface">
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Valor Pendente:</span>
          <strong class="text-coral-expense font-bold">${formatCurrency(shift.netValue)}</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Data do Plantão:</span>
          <span>${formatDateBR(shift.shiftDate)} (${shift.sector || 'Pediatria'})</span>
        </div>
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Vencimento D+${(shift.paymentLagMonths || 3) * 30}:</span>
          <span class="text-error font-semibold">${formatDateBR(shift.expectedPaymentDate)} (${ev.delayDays}d atraso)</span>
        </div>
      </div>

      <!-- Tone selector -->
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold text-on-surface-variant">Tom da Mensagem:</span>
        <div class="bg-surface-container-low p-1 rounded-full flex items-center text-[11px] font-bold">
          <button
            type="button"
            id="btn-tone-gentil"
            class="px-3 py-1 rounded-full transition-all ${currentTone === 'gentil' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
          >
            Gentil 🌸
          </button>
          <button
            type="button"
            id="btn-tone-formal"
            class="px-3 py-1 rounded-full transition-all ${currentTone === 'formal' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
          >
            Formal 📋
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <textarea
          id="textarea-billing-msg"
          rows="6"
          class="w-full p-3 rounded-2xl bg-surface-container-low text-on-surface text-[12px] leading-relaxed focus:outline-none border border-purple-100 font-body"
          readonly
        >${messageText}</textarea>
      </div>

      <div class="flex flex-col gap-2 pt-1">
        <button
          type="button"
          id="btn-copy-billing-msg"
          class="h-11 w-full rounded-full bg-surface-container-high text-primary hover:bg-primary hover:text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          ${renderIcon("content_copy", "text-[18px]")}
          <span>Copiar Mensagem 📋</span>
        </button>

        <a
          href="https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}"
          target="_blank"
          rel="noopener"
          id="btn-whatsapp-billing"
          class="h-11 w-full rounded-full bg-[#25D366] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_14px_rgba(37,211,102,0.35)]"
        >
          ${renderIcon("chat", "text-[18px]")}
          <span>Enviar via WhatsApp 💬</span>
        </a>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  const updateToneUI = (tone) => {
    currentTone = tone;
    state.billingTone = tone;
    messageText = getMessage(tone);
    const textarea = document.getElementById("textarea-billing-msg");
    if (textarea) textarea.value = messageText;
    const waLink = document.getElementById("btn-whatsapp-billing");
    if (waLink) waLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

    const btnGentil = document.getElementById("btn-tone-gentil");
    const btnFormal = document.getElementById("btn-tone-formal");
    if (btnGentil && btnFormal) {
      btnGentil.className = `px-3 py-1 rounded-full transition-all ${tone === 'gentil' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}`;
      btnFormal.className = `px-3 py-1 rounded-full transition-all ${tone === 'formal' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}`;
    }
  };

  document.getElementById("btn-tone-gentil")?.addEventListener("click", () => updateToneUI("gentil"));
  document.getElementById("btn-tone-formal")?.addEventListener("click", () => updateToneUI("formal"));

  document.getElementById("btn-copy-billing-msg")?.addEventListener("click", () => {
    copyToClipboard(messageText, "Mensagem de cobrança copiada! 📋");
  });
}

/**
 * Universal Clipboard Copy Helper with ExecCommand Fallback
 */
function copyToClipboard(text, successMessage = "Copiado com sucesso! 📋") {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  if (typeof document === "undefined") return;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    showToast(successMessage);
  } catch (e) {
    showToast("Texto pronto para cópia.");
  }
  document.body.removeChild(ta);
}

/**
 * Shift Swap & Handover Dialog (WhatsApp pre-formatted message for medical groups)
 */
function openShiftSwapDialog(shiftId) {
  const shift = state.store.data.shifts.find(s => s.id === shiftId);
  if (!shift) return;

  const doc = state.store.data;
  const doctorName = doc.doctorName || "Dra. Pediatra";
  const doctorCrm = doc.doctorCrm || "CRM-SP";

  const getSwapMessage = (mode) => {
    if (mode === "passagem") {
      return `🩺 *Passagem de Plantão Clínico - Pediatria & Neo*\n` +
        `🏥 *Hospital:* ${shift.hospital} (${shift.sector || 'Pediatria'})\n` +
        `📅 *Data da Escala:* ${formatDateBR(shift.shiftDate)} • ${shift.shiftType}\n` +
        `👩‍⚕️ *Médica Responsável:* ${doctorName} (${doctorCrm})\n\n` +
        `📋 *Notas & Intercorrências:* ${shift.notes || 'Plantão sem intercorrências graves no setor.'}\n\n` +
        `✨ Passagem realizada com sucesso. Boa escala a todos!`;
    }
    return `🩺 *Troca de Plantão / Repasse de Escala Pediátrica*\n\n` +
      `Olá, colegas! Preciso passar/permutar o plantão abaixo:\n` +
      `🏥 *Hospital:* ${shift.hospital}\n` +
      `📍 *Setor:* ${shift.sector || 'UTI Neonatal / Pediatria'}\n` +
      `📅 *Data:* ${formatDateBR(shift.shiftDate)}\n` +
      `⏰ *Horário:* ${shift.shiftType}\n` +
      `💰 *Valor Líquido:* ${formatCurrency(shift.netValue)}\n` +
      (shift.notes ? `📝 *Obs:* ${shift.notes}\n` : '') +
      `\nAlguém com disponibilidade para assumir ou trocar data?\n` +
      `Agradeço muito! 🙏\n${doctorName} (${doctorCrm})`;
  };

  let currentMode = "troca"; // "troca" | "passagem"
  let messageText = getSwapMessage(currentMode);

  const html = `
    <div class="p-5 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("swap_horiz", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Troca & Passagem de Plantão</h3>
            <span class="text-[11px] text-primary font-semibold">${shift.hospital} • ${formatDateBR(shift.shiftDate)}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <!-- Mode Selector (Troca de Plantão vs Passagem Clínica) -->
      <div class="bg-surface-container-low p-1 rounded-full flex items-center text-[11px] font-bold">
        <button
          type="button"
          id="btn-mode-swap"
          class="flex-1 py-1.5 px-3 rounded-full text-center transition-all ${currentMode === 'troca' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
        >
          Troca no WhatsApp 💬
        </button>
        <button
          type="button"
          id="btn-mode-handover"
          class="flex-1 py-1.5 px-3 rounded-full text-center transition-all ${currentMode === 'passagem' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
        >
          Passagem Clínica 📋
        </button>
      </div>

      <div class="p-3 rounded-2xl bg-surface-container-low/70 border border-purple-100 text-[12px] flex flex-col gap-1 text-on-surface">
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Instituição & Setor:</span>
          <strong class="font-bold">${shift.hospital} (${shift.sector || 'Pediatria'})</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Data & Horário:</span>
          <span>${formatDateBR(shift.shiftDate)} • ${shift.shiftType}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-on-surface-variant">Remuneração Líquida:</span>
          <strong class="text-primary font-bold">${formatCurrency(shift.netValue)}</strong>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <textarea
          id="textarea-swap-msg"
          rows="6"
          class="w-full p-3 rounded-2xl bg-surface-container-low text-on-surface text-[12px] leading-relaxed focus:outline-none border border-purple-100 font-body"
          readonly
        >${messageText}</textarea>
      </div>

      <div class="flex flex-col gap-2 pt-1">
        <button
          type="button"
          id="btn-copy-swap-msg"
          class="h-11 w-full rounded-full bg-surface-container-high text-primary hover:bg-primary hover:text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          ${renderIcon("content_copy", "text-[18px]")}
          <span>Copiar Mensagem 📋</span>
        </button>

        <a
          href="https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}"
          target="_blank"
          rel="noopener"
          id="btn-whatsapp-swap"
          class="h-11 w-full rounded-full bg-[#25D366] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_14px_rgba(37,211,102,0.35)]"
        >
          ${renderIcon("chat", "text-[18px]")}
          <span>Compartilhar no WhatsApp 💬</span>
        </a>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  const updateModeUI = (mode) => {
    currentMode = mode;
    messageText = getSwapMessage(mode);
    const textarea = document.getElementById("textarea-swap-msg");
    if (textarea) textarea.value = messageText;
    const waLink = document.getElementById("btn-whatsapp-swap");
    if (waLink) waLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

    const btnSwap = document.getElementById("btn-mode-swap");
    const btnHandover = document.getElementById("btn-mode-handover");
    if (btnSwap && btnHandover) {
      btnSwap.className = `flex-1 py-1.5 px-3 rounded-full text-center transition-all ${mode === 'troca' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}`;
      btnHandover.className = `flex-1 py-1.5 px-3 rounded-full text-center transition-all ${mode === 'passagem' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}`;
    }
  };

  document.getElementById("btn-mode-swap")?.addEventListener("click", () => updateModeUI("troca"));
  document.getElementById("btn-mode-handover")?.addEventListener("click", () => updateModeUI("passagem"));

  document.getElementById("btn-copy-swap-msg")?.addEventListener("click", () => {
    copyToClipboard(messageText, "Mensagem copiada para o WhatsApp! 📋");
  });
}

/**
 * Shift Voucher / Receipt Dialog with Hourly Rate & Clinical Sector
 */
function openShiftVoucherDialog(shiftId) {
  const shift = state.store.data.shifts.find(s => s.id === shiftId);
  if (!shift) return;

  const gross = Number(shift.grossValue) || 0;
  const net = Number(shift.netValue) || (gross * 0.85);
  const tax = gross - net;
  const isPaid = shift.status === "received";
  const hourlyRate = calculateHourlyRate(net, shift.shiftType);

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            ${renderIcon("receipt_long", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Comprovante de Plantão</h3>
            <span class="text-[11px] text-primary font-semibold">Conciliação Médica Pediátrica</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <!-- Receipt Paper Style -->
      <div class="relative bg-surface-container-low/90 p-4 rounded-3xl border border-purple-100 flex flex-col gap-3 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-primary">Finanças Pediatria • Recibo</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isPaid ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-on-primary-fixed'}">
            ${isPaid ? 'COMPENSADO EM CONTA' : 'AGUARDANDO DEPÓSITO'}
          </span>
        </div>

        <div class="flex flex-col border-b border-dashed border-purple-200 pb-3">
          <div class="flex items-center justify-between">
            <span class="font-headline text-[18px] font-bold text-on-surface">${shift.hospital}</span>
            <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
              ${shift.sector || 'UTI Neonatal'}
            </span>
          </div>
          <span class="text-[12px] text-on-surface-variant mt-0.5">${shift.shiftType} • Realizado em ${formatDateBR(shift.shiftDate)}</span>
        </div>

        <div class="flex flex-col gap-2 text-[12px]">
          <div class="flex justify-between text-on-surface-variant">
            <span>Honorários Brutos:</span>
            <span class="font-semibold text-on-surface">${formatCurrency(gross)}</span>
          </div>
          <div class="flex justify-between text-on-surface-variant">
            <span>Retenção Tributária:</span>
            <span class="font-semibold text-coral-expense">- ${formatCurrency(tax)}</span>
          </div>
          <div class="flex justify-between text-on-surface-variant">
            <span>Rentabilidade por Hora:</span>
            <span class="font-bold text-primary">${formatCurrency(hourlyRate)}/h</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-purple-200 text-[14px] font-bold">
            <span class="text-on-surface">Líquido Creditado:</span>
            <span class="text-tertiary font-bold">${formatCurrency(net)}</span>
          </div>
        </div>

        ${shift.notes ? `
          <div class="p-2.5 rounded-xl bg-white/70 border border-purple-100 text-[11px] text-on-surface-variant">
            <strong class="text-on-surface">Observações:</strong> ${shift.notes}
          </div>
        ` : ''}

        <div class="mt-1 pt-2 border-t border-dashed border-purple-200 flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>Data de Pagamento:</span>
          <span class="font-bold text-on-surface">
            ${shift.paidDate ? formatDateBR(shift.paidDate) : `Previsão: ${formatDateBR(shift.expectedPaymentDate)} (D+${(shift.paymentLagMonths || 3) * 30})`}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          id="btn-dialog-print"
          class="h-11 rounded-full bg-surface-container-high text-primary hover:bg-primary hover:text-white font-bold text-[12px] flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
        >
          ${renderIcon("print", "text-[16px]")}
          <span>Imprimir Recibo</span>
        </button>
        <button
          type="button"
          id="btn-dialog-done"
          class="h-11 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          ${renderIcon("check", "text-[18px]")}
          <span>Concluir</span>
        </button>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);
  document.getElementById("btn-dialog-done")?.addEventListener("click", closeDialog);
  document.getElementById("btn-dialog-print")?.addEventListener("click", () => window.print());
}

/**
 * Printable Medical Statement (Extrato Médico Timbrado)
 */
function openPrintableStatementDialog() {
  const report = state.store.getMonthlyReport(state.activeMonth, state.referenceDate);
  const doc = state.store.data;

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3 no-print">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            ${renderIcon("print", "text-[18px]")}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Extrato Financeiro Médico</h3>
            <span class="text-[11px] text-primary font-semibold">${formatMonthYear(state.activeMonth)}</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon("close", "text-[18px]")}
        </button>
      </div>

      <!-- Printable Document Paper -->
      <div class="bg-white p-5 rounded-2xl border border-purple-100 flex flex-col gap-3.5 shadow-sm text-on-surface text-[12px]">
        <div class="border-b-2 border-primary/20 pb-3 flex justify-between items-start">
          <div class="flex flex-col">
            <h2 class="font-headline text-[18px] font-bold text-primary">${doc.doctorName}</h2>
            <span class="text-[12px] text-on-surface-variant font-medium">${doc.doctorTitle}</span>
            <span class="text-[11px] text-primary font-semibold">${doc.doctorCrm || 'CRM-SP • Pediatria'}</span>
          </div>
          <div class="text-right flex flex-col">
            <span class="text-[11px] font-bold uppercase tracking-wider text-secondary">Demonstrativo Mensal</span>
            <span class="text-[13px] font-bold text-on-surface">${formatMonthYear(state.activeMonth)}</span>
            <span class="text-[10px] text-on-surface-variant">Emitido em ${formatDateBR(getLocalDateString(new Date()))}</span>
          </div>
        </div>

        <!-- Summary KPI Grid -->
        <div class="grid grid-cols-3 gap-2 p-3 bg-surface-container-low rounded-xl text-center">
          <div>
            <span class="text-[10px] text-on-surface-variant block uppercase font-bold">Caixa (D+90)</span>
            <span class="text-[14px] font-bold text-secondary font-display">${formatCurrency(report.caixa.totalInflow)}</span>
          </div>
          <div>
            <span class="text-[10px] text-on-surface-variant block uppercase font-bold">Despesas</span>
            <span class="text-[14px] font-bold text-error font-display">${formatCurrency(report.expenses.total)}</span>
          </div>
          <div>
            <span class="text-[10px] text-on-surface-variant block uppercase font-bold">Saldo Líquido</span>
            <span class="text-[14px] font-bold text-tertiary font-display">${formatCurrency(report.caixa.netBalance)}</span>
          </div>
        </div>

        <!-- Shifts Table -->
        <div class="flex flex-col gap-1">
          <span class="text-[12px] font-bold text-primary">Plantões do Período (${report.caixa.shiftsList.length} repasses previstos)</span>
          <div class="border border-purple-100 rounded-xl overflow-hidden">
            <table class="w-full text-left text-[11px]">
              <thead class="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th class="p-2">Data</th>
                  <th class="p-2">Hospital</th>
                  <th class="p-2">Setor</th>
                  <th class="p-2 text-right">Líquido</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-purple-50">
                ${report.caixa.shiftsList.length > 0 ? report.caixa.shiftsList.map(s => `
                  <tr>
                    <td class="p-2">${formatDateBR(s.shiftDate)}</td>
                    <td class="p-2 font-medium">${s.hospital}</td>
                    <td class="p-2 text-on-surface-variant">${s.sector || 'UTI'}</td>
                    <td class="p-2 text-right font-bold text-on-surface">${formatCurrency(s.netValue)}</td>
                  </tr>
                `).join("") : `
                  <tr><td colspan="4" class="p-3 text-center text-on-surface-variant">Sem plantões no período</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Expenses Table -->
        <div class="flex flex-col gap-1">
          <span class="text-[12px] font-bold text-primary">Despesas Operacionais (${report.expenses.list.length} itens)</span>
          <div class="border border-purple-100 rounded-xl overflow-hidden">
            <table class="w-full text-left text-[11px]">
              <thead class="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th class="p-2">Descrição</th>
                  <th class="p-2">Categoria</th>
                  <th class="p-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-purple-50">
                ${report.expenses.list.length > 0 ? report.expenses.list.map(e => `
                  <tr>
                    <td class="p-2 font-medium">${e.description}</td>
                    <td class="p-2 text-on-surface-variant">${e.category}</td>
                    <td class="p-2 text-right font-bold text-error">${formatCurrency(e.value)}</td>
                  </tr>
                `).join("") : `
                  <tr><td colspan="3" class="p-3 text-center text-on-surface-variant">Sem despesas no período</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-2.5 pt-1 no-print">
        <button
          type="button"
          id="btn-print-statement"
          class="h-11 rounded-full bg-secondary text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          ${renderIcon("print", "text-[18px]")}
          <span>Imprimir Extrato 🖨️</span>
        </button>
        <button
          type="button"
          id="btn-export-statement-csv"
          class="h-11 rounded-full bg-primary-fixed text-primary hover:bg-primary hover:text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          ${renderIcon("table_chart", "text-[18px]")}
          <span>Exportar CSV 📊</span>
        </button>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);
  document.getElementById("btn-print-statement")?.addEventListener("click", () => window.print());
  document.getElementById("btn-export-statement-csv")?.addEventListener("click", () => {
    exportDataCSV(state.activeMonth, true);
  });
}

/**
 * Doctor Profile & Goals Dialog
 */
function openDoctorProfileDialog() {
  const storeData = state.store.data;
  const initials = (storeData.doctorName || 'Dra').replace(/^(dra?\.\s*)/i, '').trim().slice(0, 2).toUpperCase() || 'DR';
  const allWorkTypes = state.store.getWorkTypes();
  const activeWorkTypes = state.store.getActiveWorkTypes();
  const workLocations = state.store.getWorkLocations();
  const customCategories = state.store.getCustomExpenseCategories ? state.store.getCustomExpenseCategories() : [];

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-3">
        <div class="flex items-center gap-3">
          <div class="relative group">
            <div class="w-12 h-12 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-[14px] overflow-hidden border-2 border-secondary/40 shadow-xs" id="profile-modal-avatar-container">
              <span id="profile-modal-avatar-initials" class="${getDoctorPhoto() ? 'hidden' : ''}">${initials}</span>
              <img id="profile-modal-avatar-img" src="${getDoctorPhoto() || ''}" alt="Foto da médica" class="w-full h-full object-cover ${getDoctorPhoto() ? '' : 'hidden'}" />
            </div>
            <button
              type="button"
              id="btn-profile-modal-upload"
              class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 active:scale-95 transition-all"
              title="Alterar foto da médica"
            >
              ${renderIcon('photo_camera', 'text-[11px]')}
            </button>
            <input type="file" id="input-profile-modal-photo" accept="image/*" class="hidden" />
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Perfil da Médica & Configurações</h3>
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-primary font-semibold">Atuação, Metas & Segurança</span>
              <button type="button" id="btn-profile-modal-remove-photo" class="text-[10px] text-error hover:underline cursor-pointer ${getDoctorPhoto() ? '' : 'hidden'}">
                Remover foto
              </button>
            </div>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container cursor-pointer" id="btn-close-dialog">
          ${renderIcon('close', 'text-[18px]')}
        </button>
      </div>

      <form id="form-profile" class="flex flex-col gap-3.5">
        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface-variant">Seu Nome / Como prefere ser chamada</label>
          <input
            type="text"
            id="input-doc-name"
            class="h-11 px-3.5 rounded-2xl bg-surface-container-low text-on-surface text-[13px] font-medium focus:outline-none border border-transparent focus:border-primary"
            placeholder="Ex: Dra. Ana Silva"
            value="${storeData.doctorName}"
            required
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface-variant">Especialidade / Título Profissional</label>
          <input
            type="text"
            id="input-doc-title"
            class="h-11 px-3.5 rounded-2xl bg-surface-container-low text-on-surface text-[13px] font-medium focus:outline-none border border-transparent focus:border-primary"
            placeholder="Ex: Pediatria & Neonatologia 🩺✨"
            value="${storeData.doctorTitle}"
            required
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface-variant">CRM / Registro Profissional</label>
          <input
            type="text"
            id="input-doc-crm"
            class="h-11 px-3.5 rounded-2xl bg-surface-container-low text-on-surface text-[13px] font-medium focus:outline-none border border-transparent focus:border-primary"
            placeholder="Ex: CRM-SP 214.890 • RQE 98.412"
            value="${storeData.doctorCrm || 'CRM-SP • Pediatria'}"
          />
        </div>

        <!-- Tipos de Atuação da Médica (Personalização - ex: ainda não atua em clínica) -->
        <div class="flex flex-col gap-1.5 p-3 rounded-2xl bg-surface-container-low border border-purple-100">
          <div class="flex items-center justify-between">
            <label class="text-[12px] font-bold text-on-surface flex items-center gap-1">
              ${renderIcon('work', 'text-[15px] text-secondary')}
              <span>Tipos de Atuação Pediátrica</span>
            </label>
            <span class="text-[10px] text-on-surface-variant">Selecione suas áreas ativas</span>
          </div>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">
            Se você ainda não atua em clínica ou consultório, mantenha apenas as áreas em que atende hoje:
          </p>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${allWorkTypes.map(type => {
              const isActive = activeWorkTypes.includes(type);
              return `
                <button
                  type="button"
                  class="btn-toggle-work-type px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${isActive ? 'bg-secondary text-white shadow-sm' : 'bg-white text-on-surface-variant border border-outline-variant/40'}"
                  data-work-type="${type}"
                >
                  ${type} ${isActive ? '✓' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Locais de Trabalho Pré-determinados -->
        <div class="flex flex-col gap-1.5 p-3 rounded-2xl bg-surface-container-low border border-purple-100">
          <div class="flex items-center justify-between">
            <label class="text-[12px] font-bold text-on-surface flex items-center gap-1">
              ${renderIcon('local_hospital', 'text-[15px] text-primary')}
              <span>Locais de Trabalho & Maternidades</span>
            </label>
            <button type="button" id="btn-add-profile-location" class="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
              ${renderIcon('add', 'text-[13px]')} + Novo Local
            </button>
          </div>
          <div class="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto" id="profile-locations-container">
            ${workLocations.map(loc => `
              <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-on-surface border border-outline-variant/40 flex items-center gap-1">
                ${loc}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Categorias de Despesas Personalizadas (PF & PJ) -->
        <div class="flex flex-col gap-2 p-3 rounded-2xl bg-surface-container-low border border-purple-100">
          <div class="flex items-center justify-between">
            <label class="text-[12px] font-bold text-on-surface flex items-center gap-1">
              ${renderIcon('category', 'text-[15px] text-secondary')}
              <span>Categorias de Despesas Personalizadas</span>
            </label>
            <button type="button" id="btn-add-profile-category" class="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
              ${renderIcon('add', 'text-[13px]')} + Nova Categoria
            </button>
          </div>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">
            Adicione ou edite suas próprias categorias (ex: Contador, Mercantil/Mercado, Lanches):
          </p>
          <div class="flex flex-col gap-1.5 pt-0.5 max-h-36 overflow-y-auto no-scrollbar" id="profile-custom-categories-container">
            ${customCategories.length === 0 ? `
              <div class="text-[11px] text-on-surface-variant/70 italic py-2 px-3 rounded-xl bg-white/70 border border-purple-100/60 text-center">
                Nenhuma categoria personalizada criada ainda.<br />
                <span class="text-primary font-semibold">Toque em "+ Nova Categoria" acima para acrescentar.</span>
              </div>
            ` : customCategories.map(cat => `
              <div class="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-outline-variant/30 text-[12px] shadow-2xs">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${cat.scope === 'pj' ? 'bg-mint-income-bg text-mint-income' : 'bg-lilac-light text-lilac-dark'}">
                    ${cat.scope === 'pj' ? 'PJ' : 'PF'}
                  </span>
                  <span class="font-bold text-on-surface text-[12px]">${cat.name}</span>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    class="btn-edit-profile-category p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                    data-cat-id="${cat.id}"
                    data-cat-name="${cat.name}"
                    data-cat-scope="${cat.scope}"
                    title="Editar categoria"
                  >
                    ${renderIcon('edit', 'text-[14px]')}
                  </button>
                  <button
                    type="button"
                    class="btn-delete-profile-category p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors cursor-pointer"
                    data-cat-id="${cat.id}"
                    data-cat-name="${cat.name}"
                    title="Excluir categoria"
                  >
                    ${renderIcon('delete', 'text-[14px]')}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-[12px] font-bold text-on-surface-variant">Meta Mensal (R$)</label>
            <input
              type="number"
              step="500"
              id="input-doc-goal"
              class="h-11 px-3.5 rounded-2xl bg-surface-container-low text-on-surface text-[14px] font-bold focus:outline-none border border-transparent focus:border-primary font-display"
              value="${storeData.monthlyIncomeGoal || 25000}"
              required
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-[12px] font-bold text-on-surface-variant">Teto de Gastos (R$)</label>
            <input
              type="number"
              step="100"
              id="input-doc-budget"
              class="h-11 px-3.5 rounded-2xl bg-surface-container-low text-on-surface text-[14px] font-bold focus:outline-none border border-transparent focus:border-primary font-display"
              value="${storeData.monthlyBudgetLimit || 10000}"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          class="h-11 w-full rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all mt-1"
        >
          ${renderIcon('save', 'text-[18px]')}
          <span>Salvar Meu Perfil</span>
        </button>
      </form>

      <!-- Safety, Trash & Recovery Hub -->
      <div class="pt-2 border-t border-purple-100 flex flex-col gap-2">
        <button
          type="button"
          id="btn-dialog-open-trash"
          class="h-10 w-full rounded-full bg-purple-50 hover:bg-purple-100 text-secondary font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-sm border border-secondary/20"
        >
          ${renderIcon('restore_from_trash', 'text-[16px]')}
          <span>Lixeira & Restauração de Dados em 1 Toque</span>
        </button>

        <button
          type="button"
          id="btn-dialog-install-pwa"
          class="h-10 w-full rounded-full bg-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary-fixed/80 font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          ${renderIcon('smartphone', 'text-[16px]')}
          <span>Como Instalar no iPhone / Android 📲</span>
        </button>

        <button
          type="button"
          id="btn-dialog-load-demo"
          class="h-10 w-full rounded-full bg-primary-fixed/60 hover:bg-primary-fixed text-primary font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors"
        >
          ${renderIcon('play_circle', 'text-[16px]')}
          <span>Carregar Dados de Exemplo (Demonstração)</span>
        </button>

        <button
          type="button"
          id="btn-dialog-reset"
          class="h-10 w-full rounded-full bg-error-container/40 hover:bg-error-container text-error font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors"
        >
          ${renderIcon('delete_sweep', 'text-[16px]')}
          <span>Limpar Todos os Meus Dados</span>
        </button>
      </div>

      <!-- Immutable Creator Signature Badge -->
      <div class="p-3 rounded-2xl bg-gradient-to-r from-secondary-fixed/40 to-primary-fixed/40 border border-purple-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-[20px]">🩺💖</span>
          <div class="flex flex-col">
            <span class="text-[12px] font-bold text-on-surface">${APP_CREATOR.signature}</span>
            <span class="text-[10px] text-on-surface-variant font-medium">Finanças Pediatria • Tecnologia & Cuidado</span>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded-full bg-secondary text-white text-[10px] font-bold">Oficial</span>
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  document.getElementById("btn-dialog-open-trash")?.addEventListener("click", () => {
    closeDialog();
    openTrashDialog();
  });

  document.querySelectorAll(".btn-toggle-work-type").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-work-type");
      const activeList = state.store.toggleActiveWorkType(type);
      const isActive = activeList.includes(type);
      if (isActive) {
        btn.className = "btn-toggle-work-type px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 bg-secondary text-white shadow-sm";
        btn.innerHTML = `${type} ✓`;
        showToast(`Atuação em '${type}' ativada!`);
      } else {
        btn.className = "btn-toggle-work-type px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-95 bg-white text-on-surface-variant border border-outline-variant/40";
        btn.innerHTML = type;
        showToast(`Atuação em '${type}' desativada.`);
      }
    });
  });

  document.getElementById("btn-add-profile-location")?.addEventListener("click", () => {
    const locName = prompt("Digite o nome da maternidade ou local de trabalho:");
    if (locName && locName.trim()) {
      state.store.addWorkLocation(locName.trim());
      showToast(`Local '${locName.trim()}' adicionado! 🏥`);
      openDoctorProfileDialog();
    }
  });

  document.getElementById("btn-add-profile-category")?.addEventListener("click", () => {
    openCategoryModal({
      mode: "add",
      onSave: ({ name, scope }) => {
        state.store.addExpenseCategory({ name, scope });
        showToast(`Categoria '${name}' adicionada com sucesso! ✨`);
        openDoctorProfileDialog();
      },
      onCancel: () => {
        openDoctorProfileDialog();
      }
    });
  });

  document.querySelectorAll(".btn-edit-profile-category").forEach(btn => {
    btn.addEventListener("click", () => {
      const catId = btn.getAttribute("data-cat-id");
      const catName = btn.getAttribute("data-cat-name");
      const catScope = btn.getAttribute("data-cat-scope");
      openCategoryModal({
        mode: "edit",
        initialData: { id: catId, name: catName, scope: catScope },
        onSave: ({ id, name, scope }) => {
          state.store.updateExpenseCategory(id, { name, scope });
          showToast(`Categoria atualizada para '${name}'! ✨`);
          openDoctorProfileDialog();
        },
        onCancel: () => {
          openDoctorProfileDialog();
        }
      });
    });
  });

  document.querySelectorAll(".btn-delete-profile-category").forEach(btn => {
    btn.addEventListener("click", () => {
      const catId = btn.getAttribute("data-cat-id");
      const catName = btn.getAttribute("data-cat-name");
      showConfirmDialog({
        title: "Excluir Categoria?",
        message: `Deseja remover a categoria '${catName}'? Suas despesas existentes continuarão registradas.`,
        isDanger: true,
        confirmText: "Excluir",
        onConfirm: () => {
          state.store.deleteExpenseCategory(catId);
          showToast(`Categoria '${catName}' removida.`);
          openDoctorProfileDialog();
        }
      });
    });
  });

  document.getElementById("btn-dialog-install-pwa")?.addEventListener("click", () => {
    closeDialog();
    openPwaInstallDialog();
  });

  document.getElementById("btn-dialog-load-demo")?.addEventListener("click", () => {
    state.store.loadDemoData();
    closeDialog();
    renderCurrentView();
    showToast("Exemplo demonstrativo carregado com sucesso! 🌸");
  });

  document.getElementById("btn-profile-modal-upload")?.addEventListener("click", () => {
    document.getElementById("input-profile-modal-photo")?.click();
  });

  document.getElementById("input-profile-modal-photo")?.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleDoctorPhotoFileSelect(e.target.files[0]);
    }
  });

  document.getElementById("btn-profile-modal-remove-photo")?.addEventListener("click", () => {
    setDoctorPhoto(null);
    showToast("Foto da médica removida", "info");
  });

  document.getElementById("form-profile")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const doctorName = document.getElementById("input-doc-name").value.trim();
    const doctorTitle = document.getElementById("input-doc-title").value.trim();
    const doctorCrm = document.getElementById("input-doc-crm").value.trim();
    const monthlyIncomeGoal = parseFloat(document.getElementById("input-doc-goal").value) || 25000;
    const monthlyBudgetLimit = parseFloat(document.getElementById("input-doc-budget").value) || 10000;

    state.store.updateDoctorProfile({ doctorName, doctorTitle, doctorCrm, monthlyIncomeGoal, monthlyBudgetLimit });
    updateAllDoctorAvatars();
    closeDialog();
    renderCurrentView();
    showToast("Perfil e metas atualizados com carinho! 🌸");
  });

  document.getElementById("btn-dialog-reset")?.addEventListener("click", () => {
    showConfirmDialog({
      title: "Limpar Todos os Dados?",
      message: "Isso removerá todas as suas escalas e despesas cadastradas para começar do zero.",
      isDanger: true,
      confirmText: "Sim, Limpar Tudo",
      onConfirm: () => {
        state.store.resetToDefault();
        showToast("Dados limpos com sucesso! 🌸");
        renderCurrentView();
      }
    });
  });
}

/**
 * Trash & Safety Data Recovery Dialog (Lixeira & Histórico)
 */
function openTrashDialog() {
  const trashItems = state.store.getTrash();

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon('restore_from_trash', 'text-[20px]')}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Lixeira & Restauração</h3>
            <span class="text-[11px] text-primary font-semibold">Recupere plantões e despesas com 1 toque</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${renderIcon('close', 'text-[18px]')}
        </button>
      </div>

      <!-- Quick Backup & Safety Controls -->
      <div class="p-3 bg-surface-container-low rounded-2xl flex items-center justify-between gap-2 border border-purple-100">
        <div class="flex flex-col">
          <span class="text-[12px] font-bold text-on-surface">Backup de Segurança</span>
          <span class="text-[10px] text-on-surface-variant">Proteja seus dados localmente no aparelho</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" id="btn-save-backup-now" class="px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all">
            Salvar Cópia
          </button>
          <button type="button" id="btn-restore-backup-now" class="px-2.5 py-1 rounded-full bg-white text-secondary border border-secondary/30 text-[11px] font-bold active:scale-95 transition-all">
            Restaurar
          </button>
        </div>
      </div>

      <!-- Trash Items List -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[12px] font-bold text-on-surface-variant">Itens Excluídos Recentemente (${trashItems.length})</span>
          ${trashItems.length > 0 ? `
            <button type="button" id="btn-empty-trash" class="text-[11px] font-bold text-error hover:underline">
              Esvaziar Lixeira
            </button>
          ` : ''}
        </div>

        ${trashItems.length === 0 ? `
          <div class="py-8 px-4 text-center rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/50 flex flex-col items-center gap-2">
            ${renderIcon('delete_sweep', 'text-[32px] text-outline')}
            <span class="text-[13px] font-semibold text-on-surface">Sua lixeira está vazia!</span>
            <span class="text-[11px] text-on-surface-variant">Quando você excluir algum plantão ou despesa, ele ficará guardado aqui para restauração imediata.</span>
          </div>
        ` : `
          <div class="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
            ${trashItems.map(item => `
              <div class="p-3 rounded-2xl bg-surface-container-low border border-purple-100 flex items-center justify-between gap-2 shadow-sm">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-full ${item.itemType === 'shift' ? 'bg-secondary-fixed text-secondary' : 'bg-primary-fixed text-primary'} flex items-center justify-center shrink-0">
                    ${renderIcon(item.itemType === 'shift' ? 'stethoscope' : 'receipt', 'text-[16px]')}
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-[12px] font-bold text-on-surface truncate">${item.label || (item.itemType === 'shift' ? item.item.hospital : item.item.description)}</span>
                    <span class="text-[10px] text-on-surface-variant">Excluído em ${new Date(item.deletedAt).toLocaleDateString('pt-BR')} às ${new Date(item.deletedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn-restore-item shrink-0 px-3 py-1.5 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all flex items-center gap-1"
                  data-trash-id="${item.id}"
                >
                  ${renderIcon('restore_from_trash', 'text-[14px]')}
                  <span>Restaurar</span>
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  document.querySelectorAll(".btn-restore-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const trashId = btn.getAttribute("data-trash-id");
      const restored = state.store.restoreFromTrash(trashId);
      if (restored) {
        showToast("Item restaurado com sucesso! 🌸", "restore_from_trash");
        closeDialog();
        renderCurrentView();
      }
    });
  });

  document.getElementById("btn-empty-trash")?.addEventListener("click", () => {
    showConfirmDialog({
      title: "Esvaziar Lixeira?",
      message: "Tem certeza de que deseja esvaziar permanentemente todos os itens da lixeira?",
      isDanger: true,
      confirmText: "Sim, Esvaziar",
      onConfirm: () => {
        state.store.emptyTrash();
        showToast("Lixeira esvaziada! 🗑️");
        closeDialog();
      }
    });
  });

  document.getElementById("btn-save-backup-now")?.addEventListener("click", () => {
    state.store.saveBackup();
    showToast("Backup local salvo no aparelho com sucesso! 🛡️");
  });

  document.getElementById("btn-restore-backup-now")?.addEventListener("click", () => {
    showConfirmDialog({
      title: "Restaurar Cópia de Segurança?",
      message: "Deseja restaurar a última cópia salva do seu banco de dados local?",
      confirmText: "Sim, Restaurar",
      onConfirm: () => {
        const ok = state.store.restoreBackup();
        if (ok) {
          showToast("Cópia de segurança restaurada! 🌸");
          closeDialog();
          renderCurrentView();
        } else {
          showToast("Nenhum backup encontrado.", "warning");
        }
      }
    });
  });
}

/**
 * PWA Installation Guide Dialog (iOS & Android)
 */
function openPwaInstallDialog() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${typeof renderIcon === 'function' ? renderIcon('smartphone', 'text-[20px]') : '<span class="material-symbols-outlined text-[20px]">smartphone</span>'}
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Instalar no Dispositivo</h3>
            <span class="text-[11px] text-primary font-semibold">Acesso Rápido & Tela Cheia</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          ${typeof renderIcon === 'function' ? renderIcon('close', 'text-[18px]') : '<span class="material-symbols-outlined text-[18px]">close</span>'}
        </button>
      </div>

      <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-secondary-fixed/40 to-primary-fixed/40 rounded-2xl border border-purple-100">
        <img src="./assets/icons/icon-192.png" alt="Finanças Pediatria" class="w-12 h-12 rounded-2xl shadow-sm border border-white" />
        <div class="flex flex-col">
          <span class="font-headline text-[14px] font-bold text-on-surface">Finanças Pediatria</span>
          <span class="text-[11px] text-on-surface-variant">Funciona como App Nativo • 100% Seguro</span>
        </div>
      </div>

      <!-- iOS Instructions -->
      <div class="p-3.5 rounded-2xl bg-surface-container-low border border-purple-100 flex flex-col gap-2.5">
        <div class="flex items-center gap-1.5 text-secondary font-bold text-[13px]">
          <span>${typeof renderIcon === 'function' ? renderIcon('apple', 'text-[16px]') : '🍎'}</span>
          <span>No iPhone ou iPad (Safari):</span>
        </div>
        <ol class="text-[12px] text-on-surface-variant flex flex-col gap-2 pl-1 leading-relaxed">
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-secondary/10 text-secondary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima <code>⎋</code>) na barra inferior do Safari.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-secondary/10 text-secondary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> <code>➕</code>.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-secondary/10 text-secondary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Toque em <strong>"Adicionar"</strong> no canto superior direito. Pronto!</span>
          </li>
        </ol>
      </div>

      <!-- Android Instructions -->
      <div class="p-3.5 rounded-2xl bg-surface-container-low border border-purple-100 flex flex-col gap-2.5">
        <div class="flex items-center gap-1.5 text-tertiary font-bold text-[13px]">
          <span>🤖</span>
          <span>No Android (Google Chrome):</span>
        </div>
        <ol class="text-[12px] text-on-surface-variant flex flex-col gap-2 pl-1 leading-relaxed">
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-tertiary/10 text-tertiary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Toque no menu de <strong>três pontinhos</strong> <code>⋮</code> no canto superior do navegador.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-tertiary/10 text-tertiary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
          </li>
        </ol>
      </div>

      <button
        type="button"
        id="btn-close-install-modal"
        class="h-11 w-full rounded-full bg-gradient-to-r from-secondary to-primary text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
      >
        ${typeof renderIcon === 'function' ? renderIcon('check', 'text-[18px]') : '<span class="material-symbols-outlined text-[18px]">check</span>'}
        <span>Entendi</span>
      </button>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);
  document.getElementById("btn-close-install-modal")?.addEventListener("click", closeDialog);
}

/**
 * Notifications & Alerts Dialog
 */
function openNotificationsDialog() {
  const notifs = state.store.getNotifications(state.referenceDate, state.activeMonth);

  const html = `
    <div class="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-purple-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            <span class="material-symbols-outlined text-[18px]">notifications_active</span>
          </div>
          <div>
            <h3 class="font-headline text-[16px] font-bold text-on-surface">Avisos & Lembretes</h3>
            <span class="text-[11px] text-on-surface-variant">${notifs.length} alerta(s) ativo(s)</span>
          </div>
        </div>
        <button type="button" class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container" id="btn-close-dialog">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div class="flex flex-col gap-2.5">
        ${notifs.length > 0 ? notifs.map(n => `
          <div class="p-3.5 rounded-2xl bg-surface-container-low border border-purple-100 flex flex-col gap-2">
            <div class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[20px] shrink-0" style="color: ${n.color};">${n.icon}</span>
              <div class="flex flex-col min-w-0">
                <span class="text-[13px] font-bold text-on-surface">${n.title}</span>
                <p class="text-[12px] text-on-surface-variant leading-snug mt-0.5">${n.message}</p>
              </div>
            </div>
            <button
              type="button"
              class="btn-notif-action self-end px-3 py-1 rounded-full text-[11px] font-bold bg-white text-secondary shadow-sm hover:bg-secondary hover:text-white transition-all active:scale-95"
              data-type="${n.type}"
              data-id="${n.data?.id || ''}"
            >
              ${n.actionLabel} →
            </button>
          </div>
        `).join("") : `
          <div class="p-8 text-center text-on-surface-variant flex flex-col items-center">
            <span class="material-symbols-outlined text-[36px] text-tertiary mb-2">check_circle</span>
            <p class="text-[14px] font-bold text-on-surface">Tudo em dia!</p>
            <p class="text-[12px] text-on-surface-variant mt-1">Nenhum repasse atrasado ou alerta para este período.</p>
          </div>
        `}
      </div>
    </div>
  `;
  openDialog(html);

  document.getElementById("btn-close-dialog")?.addEventListener("click", closeDialog);

  document.querySelectorAll(".btn-notif-action").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");
      const id = btn.getAttribute("data-id");
      closeDialog();

      if (type === "delayed_shift") {
        openHospitalDelayDialog(id);
      } else if (type === "upcoming_shift") {
        switchTab("plantoes");
      } else if (type === "budget_alert") {
        switchTab("despesas");
      }
    });
  });
}

/**
 * Navigation and Routing
 */
function switchTab(tabId) {
  state.activeTab = tabId;

  // Update nav icons and active states
  dom.navTabs.forEach(tab => {
    const target = tab.getAttribute("data-tab");
    if (target === tabId) {
      tab.classList.add("text-secondary", "font-bold");
      tab.classList.remove("text-on-surface-variant");
      const icon = tab.querySelector(".material-symbols-outlined");
      if (icon) icon.style.fontVariationSettings = "'FILL' 1";
    } else {
      tab.classList.remove("text-secondary", "font-bold");
      tab.classList.add("text-on-surface-variant");
      const icon = tab.querySelector(".material-symbols-outlined");
      if (icon) icon.style.fontVariationSettings = "'FILL' 0";
    }
  });

  renderCurrentView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Month Navigation
 */
function changeMonth(delta) {
  state.activeMonth = addMonths(state.activeMonth + "-01", delta).slice(0, 7);
  state.calendarSelectedDate = null;
  updateMonthHeader();
  renderCurrentView();
}

function updateMonthHeader() {
  if (dom.monthDisplay) {
    dom.monthDisplay.textContent = formatMonthYear(state.activeMonth);
  }
  if (dom.headerActiveTab) {
    const tabLabels = {
      inicio: "Início",
      plantoes: "Plantões",
      despesas: "Despesas",
      relatorios: "Relatórios"
    };
    dom.headerActiveTab.textContent = tabLabels[state.activeTab] || "Início";
  }
  if (dom.headerDoctorTitle) {
    dom.headerDoctorTitle.textContent = state.store.data.doctorTitle;
  }
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const notifs = state.store.getNotifications(state.referenceDate, state.activeMonth);
  const count = notifs.length;
  if (dom.notifBadge) {
    if (count > 0) {
      dom.notifBadge.textContent = count;
      dom.notifBadge.classList.remove("hidden");
    } else {
      dom.notifBadge.classList.add("hidden");
    }
  }
  const drawerBadge = document.getElementById("hamburger-notif-badge");
  if (drawerBadge) {
    if (count > 0) {
      drawerBadge.textContent = count;
      drawerBadge.classList.remove("hidden");
    } else {
      drawerBadge.classList.add("hidden");
    }
  }
}

// ----------------------------------------------------
// VIEW RENDERERS
// ----------------------------------------------------

function renderCurrentView() {
  updateMonthHeader();
  updateAllDoctorAvatars();
  switch (state.activeTab) {
    case "inicio":
      renderDashboardView();
      break;
    case "plantoes":
      renderShiftsView();
      break;
    case "despesas":
      renderExpensesView();
      break;
    case "relatorios":
      renderReportsView();
      break;
    default:
      renderDashboardView();
  }
  if (typeof enhanceIcons === "function" && dom.mainContent) {
    enhanceIcons(dom.mainContent);
  }
}

/**
 * View 1: Início (Dashboard Geral)
 */
function renderDashboardView() {
  const report = state.store.getMonthlyReport(state.activeMonth, state.referenceDate);
  const forecast = state.store.getShiftInflowForecast(state.activeMonth, 4);
  const wellbeing = state.store.getDoctorWellbeingMetrics(state.activeMonth);
  const isCaixa = state.currentRegime === "caixa";

  // Balance values depending on active regime
  const mainBalance = isCaixa ? report.caixa.netBalance : report.competencia.netBalance;
  const balanceTitle = isCaixa ? "Saldo Líquido Previsto (Caixa)" : "Produção Líquida (Competência)";
  const balanceExplanation = isCaixa
    ? "Salário do mês + plantões com depósito previsto para este mês - despesas."
    : "Produção de plantões realizados neste mês trabalhado + salário - despesas.";

  const donutData = renderDonutChartSVG(report.expenses.categoryBreakdown, report.expenses.total);
  const consMetrics = state.store.getConsultationMetrics(state.activeMonth);

  // Filter 3 radar items for dashboard
  const radarShifts = report.caixa.shiftsList.slice(0, 3);

  const html = `
    <div class="flex flex-col w-full gap-4 pb-28 pt-2">
      <!-- 1. Saudação & Status Médico -->
      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5">
              <h1 class="font-headline text-[22px] font-bold text-on-surface truncate">Olá, ${state.store.data.doctorName}</h1>
              <span class="text-base select-none">🩺✨</span>
            </div>
            <p class="font-body-sm text-[13px] text-on-surface-variant truncate">${state.store.data.doctorTitle}</p>
          </div>
          <div class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed shadow-sm">
            ${renderIcon("spa", "text-[15px]")}
            <span class="text-[11px] font-bold">Plantão: Ativa</span>
          </div>
        </div>
      </section>

      <!-- 2. Hero Card: Saldo Líquido com Toggle Animado -->
      <section class="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-secondary via-secondary-container to-primary text-white p-5 shadow-[0_12px_28px_rgba(184,15,85,0.22)]">
        <!-- SVG Watermark -->
        <svg class="absolute -right-8 -top-8 w-44 h-44 text-white/10 pointer-events-none" fill="currentColor" viewBox="0 0 100 100">
          <path d="M50 15 C35 0, 10 15, 25 45 C35 65, 50 85, 50 85 C50 85, 65 65, 75 45 C90 15, 65 0, 50 15 Z" opacity="0.4"></path>
        </svg>

        <div class="relative z-10 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-[12px] font-bold uppercase tracking-wider text-white/85 flex items-center gap-1.5">
              ${renderIcon("account_balance_wallet", "text-[16px]")}
              ${isCaixa ? 'Saldo em Caixa (D+90)' : 'Produção do Mês (Competência)'}
            </span>
            ${renderIcon("auto_awesome", "text-[20px] text-white/70")}
          </div>

          <div class="flex flex-col">
            ${isCaixa ? `
              <div class="flex flex-col">
                <span class="text-[11px] font-semibold text-white/80 uppercase tracking-wide">Saldo Realizado em Conta</span>
                <span class="text-[34px] font-bold tracking-tight font-display text-white transition-transform ${state.privacyMode ? 'privacy-masked-text' : ''}" id="hero-realized-balance">
                  ${formatMoney(report.caixa.realizedNetBalance)}
                </span>
                <div class="flex items-center gap-2 mt-1">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                    ${renderIcon("verified", "text-[14px]")}
                    ${formatMoney(report.caixa.realizedInflow)} recebidos
                  </span>
                  <span class="text-[12px] text-white/85">Previsto final: <strong class="text-white">${formatMoney(report.caixa.netBalance)}</strong></span>
                </div>
              </div>
            ` : `
              <div class="flex flex-col">
                <span class="text-[11px] font-semibold text-white/80 uppercase tracking-wide">Produção Líquida Efetiva</span>
                <span class="text-[34px] font-bold tracking-tight font-display text-white ${state.privacyMode ? 'privacy-masked-text' : ''}">
                  ${formatMoney(report.competencia.netBalance)}
                </span>
                <div class="flex items-center gap-2 mt-1">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                    ${renderIcon("local_hospital", "text-[14px]")}
                    ${report.competencia.shiftsCount} plantões trabalhados
                  </span>
                  <span class="text-[12px] text-white/85">Bruto: <strong class="text-white">${formatMoney(report.competencia.totalProductionGross)}</strong></span>
                </div>
              </div>
            `}
            <p class="text-[11px] text-white/75 mt-2 leading-snug">${balanceExplanation}</p>
          </div>

          <!-- Toggle: Regime de Caixa vs Regime de Competência -->
          <div class="mt-2 pt-3 border-t border-white/20 flex items-center justify-between">
            <span class="text-[11px] font-medium text-white/90">Modo de Visualização:</span>
            <div class="bg-black/25 p-1 rounded-full flex items-center" role="group">
              <button
                type="button"
                id="btn-regime-caixa"
                class="px-3 py-1 rounded-full text-[12px] font-bold transition-all ${isCaixa ? 'bg-white text-secondary shadow-sm' : 'text-white/80 hover:text-white'}"
              >
                Regime Caixa
              </button>
              <button
                type="button"
                id="btn-regime-competencia"
                class="px-3 py-1 rounded-full text-[12px] font-bold transition-all ${!isCaixa ? 'bg-white text-secondary shadow-sm' : 'text-white/80 hover:text-white'}"
              >
                Competência
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 2.3. Quick Actions Hub (Atalhos Clínicos & Contábeis) -->
      <section class="grid grid-cols-4 gap-2">
        <button type="button" class="btn-quick-consultation p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center">
            ${renderIcon("child_friendly", "text-[18px]")}
          </div>
          <span class="text-[10px] font-bold text-on-surface leading-tight">Consultório</span>
        </button>
        <button type="button" class="btn-quick-sbar p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("swap_horiz", "text-[18px]")}
          </div>
          <span class="text-[10px] font-bold text-on-surface leading-tight">SBAR</span>
        </button>
        <button type="button" class="btn-quick-dre p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            ${renderIcon("calculate", "text-[18px]")}
          </div>
          <span class="text-[10px] font-bold text-on-surface leading-tight">DRE / Fator R</span>
        </button>
        <button type="button" class="btn-quick-reconcile p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center">
            ${renderIcon("upload_file", "text-[18px]")}
          </div>
          <span class="text-[10px] font-bold text-on-surface leading-tight">Conciliação</span>
        </button>
      </section>

      <!-- 2.4. Consultório vs Plantão (Rendimento Horário) -->
      <section class="card-floating p-4 flex flex-col gap-2.5 bg-gradient-to-br from-white to-tertiary-fixed/20 border border-teal-50">
        <div class="flex items-center justify-between border-b border-teal-100 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center">
              ${renderIcon("child_friendly", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Consultório vs Plantão</h2>
              <span class="text-[11px] text-tertiary font-semibold">Comparativo de Rendimento por Hora</span>
            </div>
          </div>
          <button type="button" class="btn-quick-consultation text-[11px] font-bold text-tertiary hover:underline flex items-center gap-1">
            ${renderIcon("add", "text-[14px]")}
            <span>+ Consulta</span>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2 text-center pt-1">
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col">
            <span class="text-[10px] text-on-surface-variant font-bold uppercase">Consultório (Particular)</span>
            <span class="text-[18px] font-bold text-tertiary font-display mt-0.5">R$ ${consMetrics.consultationHourlyRate}/h</span>
            <span class="text-[9px] text-on-surface-variant">${consMetrics.totalConsultations} atendimentos</span>
          </div>
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col">
            <span class="text-[10px] text-on-surface-variant font-bold uppercase">Plantões Hospitalares</span>
            <span class="text-[18px] font-bold text-primary font-display mt-0.5">R$ ${consMetrics.shiftHourlyRate}/h</span>
            <span class="text-[9px] text-on-surface-variant">Média em hospitais</span>
          </div>
        </div>

        <div class="p-2.5 rounded-xl bg-tertiary-fixed/30 text-[11px] text-on-surface-variant flex items-center justify-between">
          <span>Vantagem do Consultório:</span>
          <strong class="text-tertiary text-[12px] font-bold">${consMetrics.consultationAdvantagePercent >= 0 ? '+' : ''}${consMetrics.consultationAdvantagePercent}% por hora</strong>
        </div>
      </section>

      <!-- 2.5. Meta de Faturamento Mensal (Termômetro Pediátrico) -->
      <section class="card-floating p-4 flex flex-col gap-2.5 bg-white border border-purple-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
              ${renderIcon("flag", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Meta de Faturamento do Mês</h2>
              <span class="text-[11px] text-on-surface-variant">${formatMonthYear(state.activeMonth)}</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full ${report.goals.percent >= 100 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'} text-[11px] font-bold">
            ${report.goals.percent}% atingida
          </span>
        </div>

        <div class="flex items-baseline justify-between pt-0.5">
          <div class="flex items-baseline gap-1">
            <span class="text-[24px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(report.goals.achieved)}</span>
            <span class="text-[12px] text-on-surface-variant">/ ${formatMoney(report.goals.target)}</span>
          </div>
          <button type="button" id="btn-edit-monthly-goal" class="text-[11px] font-bold text-secondary hover:underline flex items-center gap-0.5">
            ${renderIcon("edit", "text-[12px]")}
            <span>Ajustar Meta</span>
          </button>
        </div>

        <!-- Progress bar with gradient -->
        <div class="relative w-full h-3 rounded-full bg-surface-container overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-secondary via-secondary-container to-primary transition-all duration-700"
            style="width: ${Math.min(report.goals.percent, 100)}%;"
          ></div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5">
          ${report.goals.remaining > 0 ? `
            <span>Faltam <strong class="text-secondary font-bold">${formatMoney(report.goals.remaining)}</strong> (~${report.goals.approxShiftsNeeded} plantão(ões) de 12h)</span>
          ` : `
            <span class="text-tertiary font-bold flex items-center gap-1">
              ${renderIcon("check_circle", "text-[14px]")}
              Parabéns, Doutora! Meta do mês superada! 💖🎉
            </span>
          `}
          <span class="font-semibold text-primary">🩺 Cuidado & Equilíbrio</span>
        </div>
      </section>

      <!-- 2.7. Termômetro de Bem-Estar & Saúde Médica (Flo Health / CFM) -->
      <section class="card-floating p-4 flex flex-col gap-2.5 bg-white border border-purple-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full ${wellbeing.fatigueLevel === 'high' ? 'bg-error-container text-error' : wellbeing.fatigueLevel === 'moderate' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'} flex items-center justify-center">
              ${renderIcon(wellbeing.fatigueLevel === 'high' ? 'health_and_safety' : 'favorite_border', 'text-[18px]')}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Ritmo de Plantões & Descanso</h2>
              <span class="text-[11px] text-on-surface-variant">Diretrizes CFM & Cuidado Pessoal</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full ${wellbeing.fatigueLevel === 'high' ? 'bg-error-container text-error' : wellbeing.fatigueLevel === 'moderate' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'} text-[11px] font-bold">
            ${wellbeing.statusBadge}
          </span>
        </div>
        <p class="text-[12px] text-on-surface-variant leading-relaxed">
          ${wellbeing.message}
        </p>
        <div class="flex items-center gap-3 pt-1 border-t border-purple-50 text-[11px] text-on-surface-variant font-medium">
          <span class="flex items-center gap-1">
            ${renderIcon("schedule", "text-[13px] text-primary")}
            <strong>${wellbeing.totalHours}h</strong> trabalhadas
          </span>
          <span>•</span>
          <span class="flex items-center gap-1">
            ${renderIcon("bedtime", "text-[13px] text-secondary")}
            <strong>${wellbeing.nightShiftsCount}</strong> noturno(s)
          </span>
          <span>•</span>
          <span class="flex items-center gap-1">
            ${renderIcon("speed", "text-[13px] text-tertiary")}
            <strong>~${wellbeing.averageWeeklyHours}h</strong>/sem
          </span>
        </div>
      </section>

      <!-- 3. Carrossel Horizontal de Métricas Operacionais -->
      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <h2 class="text-[17px] font-bold text-on-surface">Resumo Operacional</h2>
          <span class="text-[11px] font-semibold text-on-surface-variant">Deslize para ver</span>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar snap-x snap-mandatory">
          <!-- Card 1: Consultório Fixo (Click to Edit) -->
          <div
            id="card-fixed-salary"
            class="min-w-[195px] snap-start bg-white p-4 rounded-[20px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col justify-between cursor-pointer hover:shadow-md active:scale-95 transition-all group"
            title="Clique para editar salário fixo"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                ${renderIcon("meeting_room", "text-[18px]")}
              </div>
              <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold flex items-center gap-0.5">
                <span>${report.fixedSalariesTotal > 0 ? 'Configurado' : '+ Adicionar'}</span>
                ${renderIcon("edit", "text-[11px]")}
              </span>
            </div>
            <div>
              <span class="text-[12px] text-on-surface-variant block">Salário Consultório</span>
              <span class="text-[18px] font-bold text-on-surface mt-0.5 block ${state.privacyMode ? 'privacy-masked-text' : ''}">${report.fixedSalariesTotal > 0 ? formatMoney(report.fixedSalariesTotal) : 'R$ 0,00'}</span>
              <span class="text-[10px] text-primary font-semibold mt-0.5 block">${report.fixedSalariesTotal > 0 ? 'Toque para ajustar' : 'Toque para cadastrar'}</span>
            </div>
          </div>

          <!-- Card 2: Plantões no Mês (Caixa vs Competência) -->
          <div class="min-w-[195px] snap-start bg-white p-4 rounded-[20px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                ${renderIcon("medical_services", "text-[18px]")}
              </div>
              <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                ${isCaixa ? `${report.caixa.shiftsList.length} repasses` : `${report.competencia.shiftsCount} escalas`}
              </span>
            </div>
            <div>
              <span class="text-[12px] text-on-surface-variant block">
                ${isCaixa ? 'Plantões Previstos no Caixa' : 'Plantões Produzidos'}
              </span>
              <span class="text-[18px] font-bold text-on-surface mt-0.5 block ${state.privacyMode ? 'privacy-masked-text' : ''}">
                ${formatMoney(isCaixa ? report.caixa.shiftsTotalNet : report.competencia.shiftsNetProduction)}
              </span>
              ${isCaixa ? `
                <span class="text-[11px] text-tertiary font-bold mt-0.5 block">
                  ${formatMoney(report.caixa.shiftsReceivedNet)} em conta
                </span>
              ` : `
                <span class="text-[11px] text-on-surface-variant font-medium mt-0.5 block">
                  Bruto: ${formatMoney(report.competencia.shiftsGrossProduction)}
                </span>
              `}
            </div>
          </div>

          <!-- Card 3: Despesas Totais -->
          <div class="min-w-[195px] snap-start bg-white p-4 rounded-[20px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-full bg-error-container flex items-center justify-center text-error">
                ${renderIcon("receipt_long", "text-[18px]")}
              </div>
              <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold">
                ${report.expenses.list.length} despesas
              </span>
            </div>
            <div>
              <span class="text-[12px] text-on-surface-variant block">Despesas no Mês</span>
              <span class="text-[18px] font-bold text-error mt-0.5 block ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(report.expenses.total)}</span>
              <span class="text-[11px] text-on-surface-variant font-medium mt-0.5 block">
                ${formatMoney(report.expenses.paid)} já pagas
              </span>
            </div>
          </div>

          <!-- Card 4: Rentabilidade por Hora & Carga Horária -->
          <div class="min-w-[195px] snap-start bg-white p-4 rounded-[20px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div class="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                ${renderIcon("speed", "text-[18px]")}
              </div>
              <span class="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                ${report.workload.totalHours}h no mês
              </span>
            </div>
            <div>
              <span class="text-[12px] text-on-surface-variant block">Rentabilidade Média</span>
              <span class="text-[18px] font-bold text-primary mt-0.5 block">
                ${report.workload.averageHourlyRate > 0 ? `R$ ${report.workload.averageHourlyRate}/h` : 'R$ 0/h'}
              </span>
              <span class="text-[10px] text-tertiary font-bold mt-0.5 block">
                ${report.workload.totalHours > 0 ? 'Ritmo equilibrado 🌿' : 'Sem plantões no mês'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Delayed Shifts Alert Banner (if any delayed shifts exist) -->
      ${state.store.getLiquidityRadarSummary(state.referenceDate).countDelayed > 0 ? `
        <div class="bg-coral-expense-bg border border-coral-expense/30 rounded-[20px] p-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-coral-expense text-white flex items-center justify-center shrink-0">
              ${renderIcon("warning", "text-[18px]")}
            </div>
            <div class="min-w-0">
              <span class="text-[12px] font-bold text-coral-expense block">Atenção aos Repasses em Atraso</span>
              <span class="text-[11px] text-on-surface-variant truncate block">
                ${state.store.getLiquidityRadarSummary(state.referenceDate).countDelayed} plantão(ões) com repasse vencido além do prazo D+90.
              </span>
            </div>
          </div>
          <button type="button" class="btn-filter-delayed shrink-0 px-3 py-1.5 rounded-full bg-coral-expense text-white text-[11px] font-bold active:scale-95 transition-all shadow-sm">
            Cobrar
          </button>
        </div>
      ` : ''}

      <!-- 4. Gráfico SVG: Previsão de Entradas dos Próximos 4 Meses -->
      <section class="bg-white p-4 rounded-[24px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[17px] font-bold text-on-surface">Previsão dos Próximos 4 Meses</h2>
            <p class="text-[12px] text-on-surface-variant">Entrada prevista de plantões e consultório (D+90)</p>
          </div>
          <div class="w-8 h-8 rounded-full bg-primary-fixed/50 flex items-center justify-center text-primary">
            ${renderIcon("stacked_line_chart", "text-[18px]")}
          </div>
        </div>
        ${renderForecastChartSVG(forecast)}
      </section>

      <!-- 5. Radar de Plantões com Botão 1-Touch -->
      <section class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-[17px] font-bold text-on-surface">Radar de Recebimentos</h2>
            <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">D+90</span>
          </div>
          <button type="button" class="text-[13px] font-bold text-secondary hover:underline" id="btn-see-all-shifts">
            Ver todos (${state.store.data.shifts.length})
          </button>
        </div>

        <div class="flex flex-col gap-2.5">
          ${radarShifts.length > 0 ? radarShifts.map(s => renderShiftCard(s, true)).join("") : `
            <div class="bg-white p-6 rounded-[24px] text-center text-on-surface-variant shadow-sm flex flex-col items-center">
              ${typeof renderIcon === 'function' ? renderIcon('event_available', 'text-[32px] text-primary/40') : '<span class="material-symbols-outlined text-[32px] text-primary/40">event_available</span>'}
              <p class="text-[13px] font-semibold mt-1">Nenhum repasse previsto para ${formatMonthYear(state.activeMonth)}.</p>
              <button type="button" class="btn-dashboard-add-shift mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-secondary to-primary text-white text-[12px] font-bold shadow-sm hover:opacity-95 transition-all active:scale-95 flex items-center gap-1.5">
                ${typeof renderIcon === 'function' ? renderIcon('add', 'text-[16px]') : '+'}
                <span>Cadastrar Meu Primeiro Plantão</span>
              </button>
            </div>
          `}
        </div>
      </section>

      <!-- 6. Donut SVG: Divisão de Despesas por Categoria -->
      <section class="bg-white p-4 rounded-[24px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[17px] font-bold text-on-surface">Divisão de Despesas</h2>
            <p class="text-[12px] text-on-surface-variant">Custos da carreira pediátrica em ${formatMonthYear(state.activeMonth)}</p>
          </div>
          <button type="button" class="text-[12px] font-bold text-primary hover:underline" id="btn-see-all-expenses">
            Ver detalhes
          </button>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-4 pt-1">
          ${donutData.svg}
          ${donutData.legend}
        </div>
      </section>

      <!-- 7. Banner Motivacional Pediátrico -->
      <div class="bg-surface-container-low rounded-[20px] p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
          ${renderIcon("verified", "text-[22px]")}
        </div>
        <div class="flex flex-col">
          <span class="text-[14px] text-on-surface font-bold">Planejamento Pediátrico em Dia!</span>
          <span class="text-[12px] text-on-surface-variant">Seus repasses D+90 estão organizados com precisão.</span>
        </div>
      </div>

      <!-- Creator Signature Footer -->
      <div class="text-center py-2 text-[11px] text-on-surface-variant font-medium">
        Finanças Pediatria • ${APP_CREATOR.signature} 🩺💖
      </div>
    </div>
  `;

  dom.mainContent.innerHTML = html;
  attachDashboardEvents();
}

/**
 * View 2: Gestão de Plantões
 */
function renderShiftsView() {
  const radar = state.store.getLiquidityRadarSummary(state.referenceDate);
  const shifts = state.store.data.shifts;

  // Evaluate each shift
  const evaluatedShifts = shifts.map(s => {
    const ev = evaluateShiftStatus(s, state.referenceDate);
    return { ...s, ...ev };
  });

  // Scope: "month" (activeMonth) vs "all"
  const isScopeMonth = state.shiftScope === "month";
  const isCaixa = state.currentRegime === "caixa";

  let scopedShifts = evaluatedShifts;
  if (isScopeMonth) {
    if (isCaixa && state.shiftViewMode !== "calendar") {
      scopedShifts = scopedShifts.filter(s => {
        const cashMonth = (s.status === "received" && s.paidDate)
          ? s.paidDate.slice(0, 7)
          : s.expectedPaymentDate.slice(0, 7);
        return cashMonth === state.activeMonth;
      });
    } else {
      scopedShifts = scopedShifts.filter(s => s.shiftDate.startsWith(state.activeMonth));
    }
  }

  // Apply sector filter if specified
  if (state.shiftSectorFilter && state.shiftSectorFilter !== "all") {
    scopedShifts = scopedShifts.filter(s => (s.sector || "UTI Neonatal") === state.shiftSectorFilter);
  }

  // Apply status filter
  let filtered = scopedShifts;
  if (state.shiftFilter !== "all") {
    filtered = filtered.filter(s => s.status === state.shiftFilter);
  }

  // Apply search
  if (state.shiftSearchQuery.trim()) {
    const q = state.shiftSearchQuery.toLowerCase();
    filtered = filtered.filter(s =>
      s.hospital.toLowerCase().includes(q) ||
      s.shiftType.toLowerCase().includes(q) ||
      (s.sector && s.sector.toLowerCase().includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q)) ||
      s.shiftDate.includes(q)
    );
  }

  const countAll = scopedShifts.length;
  const countPending = scopedShifts.filter(s => s.status === "pending").length;
  const countReceived = scopedShifts.filter(s => s.status === "received").length;
  const countDelayed = scopedShifts.filter(s => s.status === "delayed").length;

  const totalScopedNet = scopedShifts.reduce((acc, s) => acc + (Number(s.netValue) || 0), 0);
  const totalScopedReceived = scopedShifts.filter(s => s.status === "received").reduce((acc, s) => acc + (Number(s.netValue) || 0), 0);
  const totalScopedPending = totalScopedNet - totalScopedReceived;

  const html = `
    <div class="flex flex-col w-full gap-4 pb-28 pt-2">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-headline text-[22px] font-bold text-on-surface tracking-tight">Radar de Plantões</h1>
            <span class="text-secondary text-lg">🩺</span>
          </div>
          <p class="text-[12px] text-on-surface-variant mt-0.5">
            Acompanhe seus repasses e previsões D+30, D+60 e D+90
          </p>
        </div>
        <button
          type="button"
          class="pill-btn px-3 py-1.5 bg-gradient-to-r from-secondary to-primary text-white text-[12px] font-bold shadow-sm flex items-center gap-1 active:scale-95"
          id="btn-new-shift-top"
        >
          ${renderIcon("add", "text-[16px]")}
          Novo Plantão
        </button>
      </div>

      <!-- Scope Selector (All vs Active Month) -->
      <div class="flex items-center justify-between bg-surface-container-low p-1 rounded-full text-[12px] font-bold">
        <button
          type="button"
          class="scope-pill flex-1 py-1.5 px-3 rounded-full text-center transition-all ${!isScopeMonth ? 'bg-white text-secondary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-scope="all"
        >
          Todos os Plantões (${evaluatedShifts.length})
        </button>
        <button
          type="button"
          class="scope-pill flex-1 py-1.5 px-3 rounded-full text-center transition-all ${isScopeMonth ? 'bg-white text-secondary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-scope="month"
        >
          ${formatMonthYear(state.activeMonth)}
        </button>
      </div>

      <!-- View Controls Bar: View Mode Switcher (List vs Calendar) & Sector Filter -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1 bg-surface-container-low p-1 rounded-full text-[11px] font-bold">
          <button
            type="button"
            id="btn-view-mode-list"
            class="flex items-center gap-1 px-3 py-1 rounded-full transition-all ${state.shiftViewMode === 'list' ? 'bg-white text-secondary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            ${renderIcon("format_list_bulleted", "text-[14px]")}
            <span>Lista</span>
          </button>
          <button
            type="button"
            id="btn-view-mode-calendar"
            class="flex items-center gap-1 px-3 py-1 rounded-full transition-all ${state.shiftViewMode === 'calendar' ? 'bg-white text-secondary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          >
            ${renderIcon("calendar_view_month", "text-[14px]")}
            <span>Calendário</span>
          </button>
        </div>

        <div class="flex items-center gap-1 min-w-[145px]">
          ${renderCustomSelectHTML({
            id: 'select-shift-sector',
            value: state.shiftSectorFilter,
            options: [
              { value: 'all', label: 'Todos os Setores' },
              ...CLINICAL_SECTORS.map(sec => ({ value: sec, label: sec }))
            ],
            icon: 'stethoscope',
            extraClass: 'min-w-[145px]'
          })}
        </div>
      </div>

      ${state.shiftViewMode === "calendar" ? `
        <!-- Modo Calendário Interativo -->
        ${renderShiftCalendarView(filtered, scopedShifts)}
      ` : `
        <!-- Modo Lista Convencional -->
        ${isScopeMonth ? `
          <!-- Month Regime Toggle -->
          <div class="flex items-center justify-between px-1">
            <span class="text-[11px] font-semibold text-on-surface-variant">Modo do Mês:</span>
            <div class="bg-surface-container p-0.5 rounded-full flex items-center text-[11px] font-bold">
              <button
                type="button"
                id="btn-shifts-caixa"
                class="px-2.5 py-1 rounded-full transition-all ${isCaixa ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
              >
                Caixa (Depósito D+90)
              </button>
              <button
                type="button"
                id="btn-shifts-competencia"
                class="px-2.5 py-1 rounded-full transition-all ${!isCaixa ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-variant'}"
              >
                Competência (Trabalhados)
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Search Input -->
        <div class="relative w-full">
          ${renderIcon("search", "absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 text-[20px] pointer-events-none")}
          <input
            type="text"
            id="shift-search-input"
            class="w-full h-11 pl-11 pr-4 bg-white text-on-surface placeholder:text-outline text-[13px] rounded-full shadow-[0_4px_16px_rgba(126,74,138,0.06)] border border-transparent focus:border-primary focus:outline-none transition-all"
            placeholder="Buscar por hospital, setor, nota ou data..."
            value="${state.shiftSearchQuery}"
          />
          ${state.shiftSearchQuery ? `
            <button id="btn-clear-search" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-[18px]">
              ${renderIcon("close", "text-[18px]")}
            </button>
          ` : ''}
        </div>

        <!-- Liquidity Radar Card -->
        <div class="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-white via-[#fbf8fd] to-primary-fixed/30 p-4 shadow-[0_10px_28px_rgba(126,74,138,0.09)] border border-purple-50">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <span class="inline-flex w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
              <span class="text-[11px] font-bold text-primary uppercase tracking-wider">
                ${isScopeMonth ? `Plantões de ${formatMonthYear(state.activeMonth)}` : 'Radar de Liquidez D+90'}
              </span>
            </div>
            <span class="text-[11px] font-semibold text-on-surface-variant bg-surface-container-highest/60 px-2.5 py-0.5 rounded-full">
              ${countAll} repasse(s)
            </span>
          </div>

          <div class="flex flex-col">
            <span class="text-[12px] text-on-surface-variant">
              ${isScopeMonth ? (isCaixa ? 'Total Previsto em Conta no Mês' : 'Produção Líquida do Mês') : 'Total Geral a Receber'}
            </span>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="text-[28px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">
                ${formatMoney(isScopeMonth ? totalScopedNet : radar.totalToReceive)}
              </span>
            </div>
            ${isScopeMonth && isCaixa ? `
              <div class="flex items-center gap-2 mt-1 text-[11px]">
                <span class="font-bold text-tertiary">${formatMoney(totalScopedReceived)} recebidos</span>
                <span class="text-on-surface-variant">•</span>
                <span class="font-bold text-secondary">${formatMoney(totalScopedPending)} a receber</span>
              </div>
            ` : `
              <p class="text-[11px] text-on-surface-variant/80 mt-0.5 flex items-center gap-1">
                ${renderIcon("calendar_today", "text-[14px] text-tertiary")}
                Valores calculados com base no ciclo hospitalar de D+90
              </p>
            `}
          </div>

          ${!isScopeMonth ? `
            <!-- Micro-Timeline Bar -->
            <div class="mt-3 pt-2 border-t border-purple-100 flex flex-col gap-1.5">
              <div class="flex justify-between items-center text-[10px] text-on-surface-variant font-bold">
                <span>D+30: ${formatMoney(radar.d30Sum)}</span>
                <span>D+60: ${formatMoney(radar.d60Sum)}</span>
                <span>D+90+: ${formatMoney(radar.d90Sum)}</span>
              </div>
              <div class="w-full bg-surface-container rounded-full h-2 overflow-hidden flex">
                <div class="bg-tertiary" style="width: ${radar.totalToReceive > 0 ? (radar.d30Sum / radar.totalToReceive * 100) : 33}%;"></div>
                <div class="bg-primary" style="width: ${radar.totalToReceive > 0 ? (radar.d60Sum / radar.totalToReceive * 100) : 33}%;"></div>
                <div class="bg-secondary" style="width: ${radar.totalToReceive > 0 ? (radar.d90Sum / radar.totalToReceive * 100) : 34}%;"></div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Quick Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto py-1 -mx-4 px-4 no-scrollbar">
          <button
            type="button"
            class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.shiftFilter === 'all' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant'}"
            data-filter="all"
          >
            Todos (${countAll})
          </button>
          <button
            type="button"
            class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.shiftFilter === 'pending' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant'}"
            data-filter="pending"
          >
            A Receber (${countPending})
          </button>
          <button
            type="button"
            class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.shiftFilter === 'delayed' ? 'bg-error text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant'}"
            data-filter="delayed"
          >
            Em Atraso (${countDelayed})
          </button>
          <button
            type="button"
            class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.shiftFilter === 'received' ? 'bg-tertiary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant'}"
            data-filter="received"
          >
            Recebidos (${countReceived})
          </button>
        </div>

        <!-- Shift Cards Feed -->
        <div class="flex flex-col gap-3 pt-1">
          ${filtered.length > 0 ? filtered.map(s => renderShiftCard(s, false)).join("") : `
            <div class="bg-white p-8 rounded-[24px] text-center text-on-surface-variant shadow-sm flex flex-col items-center">
              ${renderIcon("search_off", "text-[36px] text-primary/40 mb-2")}
              <p class="text-[14px] font-bold text-on-surface">Nenhum plantão encontrado</p>
              <p class="text-[12px] text-on-surface-variant mt-1">Tente alternar os filtros ou cadastrar uma nova escala.</p>
            </div>
          `}
        </div>
      `}

      <!-- Consultations & Puericultura Section -->
      <section class="flex flex-col gap-2.5 mt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center">
              ${renderIcon("child_friendly", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[16px] font-bold text-on-surface">Consultório & Puericultura</h2>
              <span class="text-[11px] text-on-surface-variant">${state.store.getConsultations(state.activeMonth).length} atendimentos em ${formatMonthYear(state.activeMonth)}</span>
            </div>
          </div>
          <button type="button" class="btn-new-consultation-top px-3 py-1.5 rounded-full bg-tertiary text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1">
            ${renderIcon("add", "text-[14px]")}
            <span>Nova Consulta</span>
          </button>
        </div>

        <div class="flex flex-col gap-2.5">
          ${state.store.getConsultations(state.activeMonth).length > 0 ? state.store.getConsultations(state.activeMonth).map(c => renderConsultationCard(c)).join("") : `
            <div class="p-5 rounded-2xl bg-surface-container-low text-center text-on-surface-variant text-[12px]">
              Nenhum atendimento de consultório registrado neste mês.
              <button type="button" class="btn-new-consultation-top block mx-auto mt-2 text-tertiary font-bold hover:underline">
                + Cadastrar Consulta ou Puericultura
              </button>
            </div>
          `}
        </div>
      </section>

      <!-- Creator Signature Footer -->
      <div class="text-center py-2 text-[11px] text-on-surface-variant font-medium">
        Finanças Pediatria • ${APP_CREATOR.signature} 🩺💖
      </div>
    </div>
  `;

  dom.mainContent.innerHTML = html;
  attachShiftsEvents();
}

/**
 * Renders the Interactive Monthly Calendar Grid for Medical Shifts
 */
function renderShiftCalendarView(filteredShifts, scopedShifts) {
  const [yearStr, monthStr] = state.activeMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayStr = getLocalDateString(state.referenceDate || new Date());

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  let gridHtml = `
    <div class="bg-white p-4 rounded-[24px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] border border-purple-50 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
            ${renderIcon("calendar_month", "text-[18px]")}
          </div>
          <div>
            <h2 class="text-[15px] font-bold text-on-surface capitalize">${formatMonthYear(state.activeMonth)}</h2>
            <p class="text-[11px] text-on-surface-variant">Toque no dia para ver plantões ou agendar</p>
          </div>
        </div>
        <button type="button" class="btn-quick-month-picker text-[11px] font-bold text-primary bg-primary-fixed/50 hover:bg-primary-fixed px-3 py-1 rounded-full transition-colors">
          Mudar Mês
        </button>
      </div>

      <!-- Weekday Headers -->
      <div class="calendar-grid text-center text-[11px] font-bold text-on-surface-variant/80 border-b border-purple-100 pb-1">
        ${daysOfWeek.map(d => `<span class="py-1">${d}</span>`).join("")}
      </div>

      <!-- Days Grid -->
      <div class="calendar-grid">
  `;

  // Leading empty cells
  for (let i = 0; i < firstDayIndex; i++) {
    gridHtml += `<div class="min-h-[52px] p-1 rounded-xl bg-surface-container-low/20 opacity-30"></div>`;
  }

  // Month days
  for (let day = 1; day <= totalDays; day++) {
    const dayPad = String(day).padStart(2, "0");
    const dateStr = `${yearStr}-${monthStr}-${dayPad}`;
    const isToday = dateStr === todayStr;
    const isSelected = state.calendarSelectedDate === dateStr;
    const dayShifts = filteredShifts.filter(s => s.shiftDate === dateStr);
    const hasShifts = dayShifts.length > 0;

    let cellClass = "calendar-day-cell";
    if (isToday) cellClass += " today";
    if (isSelected) cellClass += " selected";
    if (hasShifts) cellClass += " has-shift";

    gridHtml += `
      <div class="${cellClass}" data-date="${dateStr}" role="button" tabindex="0">
        <span class="day-num text-[11px] font-bold leading-none ${isToday ? 'text-primary' : isSelected ? 'text-secondary' : 'text-on-surface'}">
          ${day}
        </span>
        <div class="flex flex-col gap-0.5 w-full mt-1">
          ${dayShifts.slice(0, 2).map(s => {
            const ev = evaluateShiftStatus(s, state.referenceDate);
            const isDel = ev.status === "delayed";
            const isRec = ev.status === "received";
            const dotColor = isDel ? 'bg-error' : (isRec ? 'bg-tertiary' : 'bg-primary');
            const icon = s.shiftType.includes("Noturno") ? "🌙" : s.shiftType.includes("24h") ? "⏱️" : s.shiftType.includes("Sobreaviso") ? "📞" : "☀️";
            return `
              <div class="calendar-shift-badge truncate flex items-center gap-0.5" title="${s.hospital} (${s.shiftType})">
                <span class="w-1.5 h-1.5 rounded-full ${dotColor} shrink-0"></span>
                <span class="text-[9px] truncate">${icon} ${s.hospital.split(" ")[0]}</span>
              </div>
            `;
          }).join("")}
          ${dayShifts.length > 2 ? `
            <span class="text-[8px] font-bold text-secondary text-center">+${dayShifts.length - 2} mais</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  gridHtml += `
      </div>
    </div>
  `;

  // Selected date detail or all shifts
  const selectedDate = state.calendarSelectedDate;
  const activeDateShifts = selectedDate
    ? filteredShifts.filter(s => s.shiftDate === selectedDate)
    : [];

  gridHtml += `
    <div class="flex flex-col gap-3 mt-1">
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-1.5">
          <span class="font-headline text-[15px] font-bold text-on-surface">
            ${selectedDate ? `Plantões em ${formatDateBR(selectedDate)}` : `Plantões de ${formatMonthYear(state.activeMonth)}`}
          </span>
          ${selectedDate ? `
            <span class="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
              ${activeDateShifts.length}
            </span>
          ` : ''}
        </div>

        ${selectedDate ? `
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-clear-calendar-selection"
              class="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface text-[11px] font-bold transition-colors"
            >
              Ver Mês Todo
            </button>
            <button
              type="button"
              id="btn-add-shift-on-day"
              data-date="${selectedDate}"
              class="px-3 py-1 rounded-full bg-secondary text-white text-[11px] font-bold shadow-sm active:scale-95 flex items-center gap-1"
            >
              ${renderIcon("add", "text-[14px]")}
              <span>Novo Neste Dia</span>
            </button>
          </div>
        ` : `
          <span class="text-[11px] text-on-surface-variant">Toque em um dia para filtrar</span>
        `}
      </div>

      <div class="flex flex-col gap-2.5">
        ${selectedDate ? (
          activeDateShifts.length > 0
            ? activeDateShifts.map(s => renderShiftCard(s, false)).join("")
            : `
              <div class="bg-white p-6 rounded-[20px] text-center text-on-surface-variant shadow-sm flex flex-col items-center gap-2">
                <span class="text-2xl">🩺</span>
                <p class="text-[13px] font-bold text-on-surface">Sem escala em ${formatDateBR(selectedDate)}</p>
                <p class="text-[11px] text-on-surface-variant">Deseja cadastrar um plantão ou sobreaviso para este dia?</p>
                <button
                  type="button"
                  id="btn-calendar-empty-add"
                  data-date="${selectedDate}"
                  class="mt-1 px-4 py-1.5 rounded-full bg-primary-fixed text-primary font-bold text-[12px] active:scale-95"
                >
                  + Cadastrar Plantão
                </button>
              </div>
            `
        ) : (
          filteredShifts.length > 0
            ? filteredShifts.map(s => renderShiftCard(s, false)).join("")
            : `
              <div class="bg-white p-6 rounded-[20px] text-center text-on-surface-variant shadow-sm">
                <p class="text-[13px] font-bold text-on-surface">Nenhum plantão neste filtro</p>
              </div>
            `
        )}
      </div>
    </div>
  `;

  return gridHtml;
}

/**
 * Renders an individual Shift card with 1-touch confirmation and actions
 */
function renderShiftCard(shift, isCompact = false) {
  const isInstallment = Boolean(shift.isInstallment);
  const ev = evaluateShiftStatus(shift, state.referenceDate);
  const isDelayed = ev.status === "delayed";
  const isReceived = ev.status === "received" || (isInstallment && shift.installmentStatus === "received");

  let statusBadgeClass = "badge-pending";
  let statusIcon = "schedule";
  if (isDelayed) {
    statusBadgeClass = "badge-delayed";
    statusIcon = "warning";
  } else if (isReceived) {
    statusBadgeClass = "badge-received";
    statusIcon = "check_circle";
  } else if (ev.status === "partial") {
    statusBadgeClass = "badge-pending";
    statusIcon = "payments";
  }

  const hourlyRate = calculateHourlyRate(shift.netValue, shift.shiftType);

  return `
    <article class="card-floating p-4 flex flex-col justify-between transition-all" data-shift-id="${shift.id}">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full ${isDelayed ? 'bg-error-container text-error' : isReceived ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-primary'} flex items-center justify-center shrink-0">
            ${renderIcon(
              shift.shiftType.includes("Noturno") ? "bedtime" : shift.shiftType.includes("24h") ? "timelapse" : "child_care",
              "text-[20px]"
            )}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h2 class="text-[15px] font-bold text-on-surface truncate">${shift.hospital}</h2>
              ${shift.sector ? `<span class="px-2 py-0.5 rounded-full bg-primary-fixed/60 text-primary text-[10px] font-bold">${shift.sector}</span>` : ''}
              ${isInstallment ? `
                <span class="px-2 py-0.5 rounded-full ${shift.installmentNumber === 1 ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-primary-fixed text-on-primary-fixed'} text-[10px] font-extrabold shadow-xs">
                  ${shift.installmentNumber}ª Parcela (${shift.installmentPercent}%)
                </span>
              ` : ''}
            </div>
            <p class="text-[12px] text-on-surface-variant truncate">
              ${formatDateBR(shift.shiftDate)} • ${shift.shiftType}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button type="button" class="btn-shift-swap w-7 h-7 rounded-full text-secondary hover:bg-secondary-fixed/50 flex items-center justify-center active:scale-90" data-id="${shift.id}" title="Troca de Plantão & Passagem no WhatsApp">
            ${renderIcon("swap_horiz", "text-[16px]")}
          </button>
          <button type="button" class="btn-duplicate-shift w-7 h-7 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${shift.id}" title="Duplicar para a próxima semana">
            ${renderIcon("content_copy", "text-[15px]")}
          </button>
          <button type="button" class="btn-edit-shift w-7 h-7 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${shift.id}" title="Editar">
            ${renderIcon("edit", "text-[15px]")}
          </button>
          <button type="button" class="btn-delete-shift w-7 h-7 rounded-full text-error/70 hover:bg-error-container/40 flex items-center justify-center active:scale-90" data-id="${shift.id}" title="Excluir">
            ${renderIcon("delete", "text-[15px]")}
          </button>
        </div>
      </div>

      <!-- Financial Information Row -->
      <div class="my-3 p-3 rounded-[16px] ${isDelayed ? 'bg-error-container/20' : 'bg-surface-container-low/60'} flex items-center justify-between">
        <div>
          <span class="text-[11px] text-on-surface-variant block">${isInstallment ? `Valor da ${shift.installmentNumber}ª Parcela (${shift.installmentPercent}%)` : 'Valor Líquido'}</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-[16px] font-bold ${isDelayed ? 'text-error' : 'text-on-surface'} ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(shift.netValue)}</span>
            ${hourlyRate > 0 && !isInstallment ? `
              <span class="${hourlyRate >= 150 ? 'badge-rate-gold' : 'badge-rate-mint'}">
                R$ ${hourlyRate}/h
              </span>
            ` : ''}
          </div>
        </div>
        <div class="text-right">
          <span class="text-[11px] text-outline block">${isInstallment ? 'Vencimento Previsto' : 'Valor Bruto'}</span>
          <span class="text-[13px] text-on-surface-variant font-medium ${state.privacyMode ? 'privacy-masked-text' : ''}">
            ${isInstallment ? formatDateBR(shift.installmentDueDate) : formatMoney(shift.grossValue)}
          </span>
        </div>
      </div>

      ${shift.notes ? `
        <div class="mb-2.5 px-2.5 py-1.5 rounded-xl bg-surface-container-low/50 text-[11px] text-on-surface-variant flex items-center gap-1.5">
          ${renderIcon("sticky_note_2", "text-[14px] text-secondary shrink-0")}
          <span class="truncate italic">${shift.notes}</span>
        </div>
      ` : ''}

      <!-- Detailed 80% D+60 and 20% D+90 Installment Pills (for full shift cards) -->
      ${!isInstallment && shift.splitPayment && Array.isArray(shift.installments) && shift.installments.length === 2 ? `
        <div class="mb-3 p-2.5 rounded-2xl bg-surface-container-low border border-purple-100 flex flex-col gap-1.5 text-[11px]">
          <div class="flex items-center justify-between text-[10px] text-on-surface-variant font-bold pb-0.5">
            <span class="flex items-center gap-1 text-primary">
              ${renderIcon("payments", "text-[14px]")} Repasses do Plantão (80% D+60 / 20% D+90)
            </span>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            ${shift.installments.map(inst => `
              <div class="bg-white p-2 rounded-xl border border-purple-50 shadow-2xs flex flex-col justify-between gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-on-surface text-[10px]">${inst.number}ª Parc. (${inst.percent}%)</span>
                  <span class="w-2 h-2 rounded-full ${inst.status === 'received' ? 'bg-tertiary' : 'bg-secondary'}"></span>
                </div>
                <span class="font-extrabold text-on-surface text-[12px] font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(inst.value)}</span>
                <span class="text-[9px] text-on-surface-variant">${formatDateBR(inst.dueDate)}</span>
                <button
                  type="button"
                  class="btn-toggle-shift w-full py-1 mt-0.5 rounded-full text-[10px] font-bold transition-all active:scale-95 ${inst.status === 'received' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary text-white shadow-2xs'}"
                  data-id="${shift.id}"
                  data-action="toggle-installment"
                  data-installment-number="${inst.number}"
                >
                  ${inst.status === 'received' ? '✓ Recebido' : 'Receber'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Status Badge & 1-Touch Action Button -->
      <div class="flex items-center justify-between gap-2 pt-0.5">
        <span class="badge-status ${statusBadgeClass}">
          ${renderIcon(statusIcon, "text-[14px]")}
          ${ev.label}
        </span>

        <div class="flex items-center gap-1.5">
          ${isInstallment ? `
            <button
              type="button"
              class="btn-toggle-shift inline-flex items-center gap-1 ${isReceived ? 'bg-surface-container-highest text-on-surface-variant' : 'bg-tertiary text-white'} px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm active:scale-95 transition-all shrink-0"
              data-id="${shift.id}"
              data-action="toggle-installment"
              data-installment-number="${shift.installmentNumber}"
            >
              ${renderIcon(isReceived ? "undo" : "check", "text-[15px]")}
              ${isReceived ? 'Desfazer' : `Receber ${shift.installmentNumber}ª Parc.`}
            </button>
          ` : isReceived ? `
            <button
              type="button"
              class="btn-view-voucher inline-flex items-center gap-1 bg-surface-container-low text-primary hover:bg-primary hover:text-white px-2.5 py-1.5 rounded-full text-[11px] font-bold active:scale-95 transition-all"
              data-id="${shift.id}"
              title="Ver recibo e comprovante de conciliação"
            >
              ${renderIcon("receipt_long", "text-[14px]")}
              Comprovante
            </button>
            <button
              type="button"
              class="btn-toggle-shift inline-flex items-center gap-1 bg-surface-container-highest text-on-surface-variant hover:text-error px-2.5 py-1.5 rounded-full text-[11px] font-bold active:scale-95 transition-all"
              data-id="${shift.id}"
              data-action="unmark"
              title="Marcar novamente como pendente"
            >
              ${renderIcon("undo", "text-[14px]")}
              Desfazer
            </button>
          ` : `
            <button
              type="button"
              class="btn-toggle-shift inline-flex items-center gap-1 bg-tertiary hover:bg-tertiary/90 text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-[0_4px_12px_rgba(0,106,98,0.25)] active:scale-95 transition-all shrink-0"
              data-id="${shift.id}"
              data-action="receive"
            >
              ${renderIcon("check", "text-[15px]")}
              Marcar como Recebido
            </button>
          `}
        </div>
      </div>

      ${isDelayed ? `
        <div class="mt-2.5 pt-2 border-t border-error/15 flex items-center justify-between gap-2">
          <button
            type="button"
            class="btn-notify-delay w-full py-2 rounded-full bg-secondary-container/20 hover:bg-secondary-container/30 text-secondary font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors active:scale-98"
            data-id="${shift.id}"
            data-hospital="${shift.hospital}"
          >
            ${renderIcon("forward_to_inbox", "text-[15px]")}
            <span>Cobrar Repasse / Notificar Setor</span>
          </button>
        </div>
      ` : ''}
    </article>
  `;
}

/**
 * View 3: Controle de Despesas
 */
function renderExpensesView() {
  const report = state.store.getMonthlyReport(state.activeMonth, state.referenceDate);
  const expenses = report.expenses.list;
  const budget = report.expenses.budgetLimit;
  const spent = report.expenses.total;
  const usagePercent = report.expenses.budgetUsagePercent;
  const remaining = Math.max(0, budget - spent);
  const momData = state.store.getMonthOverMonthExpenseVariation(state.activeMonth, state.expenseFilter);

  // Apply scope and cost type filter
  let filtered = expenses;
  if (state.expenseFilter === "fixa") {
    filtered = filtered.filter(e => e.type === "fixed");
  } else if (state.expenseFilter === "variavel") {
    filtered = filtered.filter(e => e.type === "variable");
  } else if (state.expenseFilter === "pf") {
    filtered = filtered.filter(e => (e.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(e.category) : getCategoryScope(e.category))) === "pf");
  } else if (state.expenseFilter === "pj") {
    filtered = filtered.filter(e => (e.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(e.category) : getCategoryScope(e.category))) === "pj");
  }

  // Monthly category distribution for active filter
  const filteredSpent = filtered.reduce((acc, e) => acc + (Number(e.value) || 0), 0);
  const catMap = {};
  filtered.forEach(e => {
    catMap[e.category] = (catMap[e.category] || 0) + (Number(e.value) || 0);
  });
  const filteredCategoryData = Object.entries(catMap).map(([category, amount]) => {
    const pct = filteredSpent > 0 ? Math.round((amount / filteredSpent) * 100) : 0;
    return {
      category,
      amount,
      percentage: pct,
      color: state.store.getCategoryColor ? state.store.getCategoryColor(category) : (CATEGORY_COLORS[category] || "#7A7E91"),
      icon: state.store.getCategoryIcon ? state.store.getCategoryIcon(category) : (CATEGORY_ICONS[category] || "receipt_long")
    };
  }).sort((a, b) => b.amount - a.amount);
  const donutMonthly = renderDonutChartSVG(filteredCategoryData, filteredSpent);

  const countAll = expenses.length;
  const countPF = expenses.filter(e => (e.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(e.category) : getCategoryScope(e.category))) === "pf").length;
  const countPJ = expenses.filter(e => (e.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(e.category) : getCategoryScope(e.category))) === "pj").length;
  const countFixas = expenses.filter(e => e.type === "fixed").length;
  const countVars = expenses.filter(e => e.type === "variable").length;

  const html = `
    <div class="flex flex-col w-full gap-4 pb-28 pt-2">
      <!-- Subheader & Quick Action -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <h1 class="font-headline text-[22px] font-bold text-on-surface">Despesas & Vida Financeira</h1>
            <span class="text-[20px]">🧾</span>
          </div>
          <p class="text-[12px] text-on-surface-variant">Gestão integrada: Pessoa Física (PF) e Pessoa Jurídica (PJ)</p>
        </div>
        <button
          type="button"
          class="pill-btn px-3.5 py-2 rounded-full bg-gradient-to-r from-secondary to-primary text-white text-[12px] font-bold shadow-md active:scale-95 transition-all flex items-center gap-1"
          id="btn-new-expense-top"
        >
          ${renderIcon("add", "text-[16px]")}
          Nova Despesa
        </button>
      </div>

      <!-- Scope & Cost Type Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        <button
          type="button"
          class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.expenseFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'}"
          data-filter="all"
        >
          Todas (${countAll})
        </button>
        <button
          type="button"
          class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.expenseFilter === 'pf' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'}"
          data-filter="pf"
        >
          Pessoal (PF) (${countPF})
        </button>
        <button
          type="button"
          class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.expenseFilter === 'pj' ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'}"
          data-filter="pj"
        >
          Trabalho (PJ) (${countPJ})
        </button>
        <button
          type="button"
          class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.expenseFilter === 'fixa' ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'}"
          data-filter="fixa"
        >
          Fixas (${countFixas})
        </button>
        <button
          type="button"
          class="filter-pill whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${state.expenseFilter === 'variavel' ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'}"
          data-filter="variavel"
        >
          Variáveis (${countVars})
        </button>
      </div>

      <!-- Budget Tracker Card (Teto de Gastos com Linha de 80%) -->
      <div class="relative overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(171,71,188,0.08)]">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-fixed/60 flex items-center justify-center text-primary">
              ${renderIcon("pie_chart", "text-[18px]")}
            </div>
            <span class="text-[15px] font-bold text-on-surface">Teto de Gastos de ${formatMonthYear(state.activeMonth)}</span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
            ${usagePercent}% utilizado
          </span>
        </div>

        <div class="flex items-baseline gap-1.5 pt-1">
          <span class="text-[26px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(spent)}</span>
          <span class="text-[12px] text-on-surface-variant">/ ${formatMoney(budget)} estipulado</span>
        </div>

        <!-- Custom Progress Bar with 80% Threshold Mark -->
        <div class="relative w-full h-3 rounded-full bg-surface-container overflow-visible my-3">
          <div
            class="h-full rounded-full bg-gradient-to-r from-secondary-container via-primary-container to-primary transition-all duration-500"
            style="width: ${Math.min(usagePercent, 100)}%;"
          ></div>
          <div class="absolute top-0 bottom-0 left-[80%] w-0.5 bg-outline/60 z-10 flex flex-col items-center">
            <span class="absolute -top-3.5 text-[9px] font-bold text-on-surface-variant tracking-tighter">80%</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full ${usagePercent > 80 ? 'bg-error' : 'bg-tertiary'}"></div>
          <p class="text-[12px] text-on-surface-variant">
            ${usagePercent > 80
              ? `Atenção: Você atingiu <span class="font-bold text-error">${usagePercent}%</span> do teto mensal.`
              : `Você ainda pode utilizar <span class="font-bold text-tertiary">${formatMoney(remaining)}</span> com tranquilidade.`
            }
          </p>
        </div>
      </div>

      <!-- Gráfico Mensal de Despesas (Donut SVG com Legenda) -->
      <section class="bg-white p-4 rounded-[24px] shadow-[0_8px_24px_rgba(171,71,188,0.06)] flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
              ${renderIcon("donut_large", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Gráfico Mensal de Despesas</h2>
              <p class="text-[11px] text-on-surface-variant">Distribuição por categoria em ${formatMonthYear(state.activeMonth)}</p>
            </div>
          </div>
          <span class="text-[13px] font-extrabold text-secondary font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">
            ${formatMoney(filteredSpent)}
          </span>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-4 pt-1">
          ${donutMonthly.svg}
          ${donutMonthly.legend}
        </div>
      </section>

      <!-- Month-over-Month Evolution Chart (Evolução Mês a Mês & PF vs PJ) -->
      ${renderMonthOverMonthChartSVG(momData)}

      <!-- Category Breakdown Grid (Quantidade Gasta em Cada Categoria & Alteração Mês a Mês) -->
      ${momData && momData.categoryComparison && momData.categoryComparison.length > 0 ? `
        <div class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between px-1">
            <span class="font-headline text-[15px] font-bold text-on-surface">Gastos por Categoria (${momData.categoryComparison.length})</span>
            <span class="text-[11px] text-on-surface-variant">Variação vs Mês Anterior</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${momData.categoryComparison.map(c => `
              <div class="p-3 bg-white rounded-2xl border border-purple-50 shadow-sm flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background-color: ${c.color}20; color: ${c.color};">
                    ${renderIcon(c.icon, "text-[18px]")}
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-[13px] font-bold text-on-surface truncate">${c.category}</span>
                    <div class="flex items-center gap-1.5 text-[10px]">
                      <span class="px-1.5 py-0.2 rounded-full font-bold ${c.scope === 'pj' ? 'bg-mint-income-bg text-mint-income' : 'bg-lilac-light text-lilac-dark'}">${c.scope.toUpperCase()}</span>
                      <span class="text-on-surface-variant">Anterior: ${formatMoney(c.previousAmount)}</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end shrink-0">
                  <span class="text-[14px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(c.currentAmount)}</span>
                  <span class="text-[10px] font-bold ${c.diffValue > 0 ? 'text-error' : c.diffValue < 0 ? 'text-tertiary' : 'text-outline'}">
                    ${c.diffValue > 0 ? `▲ +${c.diffPercent}%` : c.diffValue < 0 ? `▼ ${c.diffPercent}%` : '0%'}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Expense List -->
      <div class="flex flex-col gap-2.5">
        ${filtered.length > 0 ? filtered.map(e => renderExpenseCard(e)).join("") : `
          <div class="bg-white p-8 rounded-[24px] text-center text-on-surface-variant shadow-sm flex flex-col items-center">
            ${renderIcon("receipt", "text-[36px] text-primary/40 mb-2")}
            <p class="text-[14px] font-bold text-on-surface">Nenhuma despesa para este filtro</p>
            <p class="text-[12px] text-on-surface-variant mt-1">Cadastre uma nova despesa usando o botão acima.</p>
          </div>
        `}
      </div>

      <!-- Export & Statement Action Card -->
      <div class="rounded-[20px] bg-surface-container-low p-4 flex items-center justify-between shadow-sm mt-2">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
            ${renderIcon("assignment", "text-[20px]")}
          </div>
          <div class="flex flex-col">
            <span class="text-[13px] font-bold text-on-surface">Fechamento Pediátrico</span>
            <span class="text-[11px] text-on-surface-variant">Exportar ou Imprimir ${formatMonthYear(state.activeMonth)}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="btn-open-printable-statement px-3 py-1.5 rounded-full bg-white text-primary hover:text-secondary text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1" title="Extrato para Impressão">
            ${renderIcon("print", "text-[15px]")}
            <span>Imprimir</span>
          </button>
          <button type="button" class="btn-export-csv px-3 py-1.5 rounded-full bg-primary text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1" title="Exportar CSV">
            ${renderIcon("table_chart", "text-[15px]")}
            <span>Excel</span>
          </button>
        </div>
      </div>

      <!-- Creator Signature Footer -->
      <div class="text-center py-2 text-[11px] text-on-surface-variant font-medium">
        Finanças Pediatria • ${APP_CREATOR.signature} 🩺💖
      </div>
    </div>
  `;

  dom.mainContent.innerHTML = html;
  attachExpensesEvents();
}

/**
 * Renders an individual Expense card with 1-touch toggle and action menu
 */
function renderExpenseCard(expense) {
  const color = state.store.getCategoryColor ? state.store.getCategoryColor(expense.category) : (CATEGORY_COLORS[expense.category] || "#CE93D8");
  const icon = state.store.getCategoryIcon ? state.store.getCategoryIcon(expense.category) : (CATEGORY_ICONS[expense.category] || "receipt_long");
  const scope = expense.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(expense.category) : getCategoryScope(expense.category));

  // Calculate due status
  const refDate = state.referenceDate ? getLocalDateString(state.referenceDate) : getLocalDateString(new Date());
  const isOverdue = !expense.isPaid && expense.dueDate && expense.dueDate < refDate;
  const isDueToday = !expense.isPaid && expense.dueDate && expense.dueDate === refDate;

  let dueBadgeText = `Vence ${formatDateBR(expense.dueDate)}`;
  let dueBadgeClass = "text-on-surface-variant";
  if (expense.isPaid) {
    dueBadgeText = `Vencimento ${formatDateBR(expense.dueDate)}`;
  } else if (isDueToday) {
    dueBadgeText = `Vence hoje! ⚠️`;
    dueBadgeClass = "text-secondary font-bold";
  } else if (isOverdue) {
    const diffDays = Math.max(1, Math.round((new Date(refDate + 'T12:00:00') - new Date(expense.dueDate + 'T12:00:00')) / (1000 * 60 * 60 * 24)));
    dueBadgeText = `Vencida há ${diffDays}d 🚨`;
    dueBadgeClass = "text-error font-bold";
  }

  return `
    <div class="card-floating p-3.5 flex items-center justify-between" data-expense-id="${expense.id}">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background-color: ${color}20; color: ${color};">
          ${renderIcon(icon, "text-[20px]")}
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[14px] font-semibold text-on-surface truncate">${expense.description}</span>
            <span class="px-1.5 py-0.2 rounded-full font-bold text-[9px] ${scope === 'pj' ? 'bg-mint-income-bg text-mint-income' : 'bg-lilac-light text-lilac-dark'}">${scope.toUpperCase()}</span>
            <button
              type="button"
              class="btn-card-category-quick inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style="background-color: ${color}15; color: ${color}; border: 1px solid ${color}35;"
              data-id="${expense.id}"
              data-category="${expense.category}"
              title="Toque para mudar a categoria (Ex: Contador, Mercado, Lanches...)"
            >
              ${renderIcon(icon, 'text-[11px]')}
              <span>${expense.category}</span>
              ${renderIcon('arrow_drop_down', 'text-[12px] -ml-1 opacity-70')}
            </button>
          </div>
          <div class="flex items-center gap-2 mt-0.5 text-[11px] ${dueBadgeClass}">
            <span class="capitalize text-on-surface-variant">${expense.type === 'fixed' ? 'Fixa' : 'Variável'}</span>
            <span class="text-on-surface-variant">•</span>
            <span>${dueBadgeText}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end shrink-0 ml-3">
        <span class="text-[14px] font-bold ${isOverdue ? 'text-error' : 'text-on-surface'} ${state.privacyMode ? 'privacy-masked-text' : ''}">- ${formatMoney(expense.value)}</span>
        <button
          type="button"
          class="btn-toggle-expense-paid mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all active:scale-95 ${expense.isPaid ? 'bg-tertiary-fixed text-on-tertiary-fixed' : (isOverdue ? 'bg-error-container text-error' : 'bg-primary-fixed text-on-primary-fixed')}"
          data-id="${expense.id}"
        >
          ${expense.isPaid ? 'Pago ✓' : (isOverdue ? 'Em Atraso' : 'A pagar')}
        </button>
      </div>

      <div class="flex items-center gap-0.5 ml-2">
        <button type="button" class="btn-duplicate-expense w-7 h-7 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${expense.id}" title="Duplicar para o próximo mês">
          ${renderIcon("content_copy", "text-[15px]")}
        </button>
        <button type="button" class="btn-edit-expense w-7 h-7 rounded-full text-on-surface-variant hover:bg-surface-container flex items-center justify-center active:scale-90" data-id="${expense.id}" title="Editar">
          ${renderIcon("edit", "text-[15px]")}
        </button>
        <button type="button" class="btn-delete-expense w-7 h-7 rounded-full text-error/60 hover:bg-error-container/40 flex items-center justify-center active:scale-90" data-id="${expense.id}" title="Excluir">
          ${renderIcon("delete", "text-[15px]")}
        </button>
      </div>
    </div>
  `;
}

/**
 * View 4: Relatórios & Comparativo Contábil
 */
function renderReportsView() {
  const report = state.store.getMonthlyReport(state.activeMonth, state.referenceDate);
  const hospitalAnalytics = state.store.getHospitalAnalytics();
  const taxSim = state.store.getTaxSavingsSummary(state.activeMonth);
  const wellbeing = state.store.getDoctorWellbeingMetrics(state.activeMonth);

  const html = `
    <div class="flex flex-col w-full gap-4 pb-28 pt-2">
      <!-- Header with Printable Statement Action -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-headline text-[22px] font-bold text-on-surface">Inteligência Financeira</h1>
          <p class="text-[12px] text-on-surface-variant">Análise contábil, tributária e ritmo de vida</p>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="btn-open-printable-statement px-3 py-1.5 rounded-full bg-primary text-white text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1"
            title="Abrir Extrato Completo para Impressão ou PDF"
          >
            ${renderIcon("print", "text-[15px]")}
            <span>Extrato</span>
          </button>
        </div>
      </div>

      <!-- Projeção Financeira de 12 Meses com Scrubber Interativo -->
      <section class="card-floating p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-purple-100 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
              ${renderIcon("timeline", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Projeção de Caixa 12 Meses (Rolling)</h2>
              <span class="text-[11px] text-on-surface-variant">Fluxo acumulado & Reserva de Emergência</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary text-[10px] font-bold">
            Interativo
          </span>
        </div>

        <div id="forecast-12m-chart-container" class="w-full overflow-x-auto">
          ${renderForecast12MSVG(state.store.get12MonthsRollingProjection(state.activeMonth), { privacyMode: state.privacyMode })}
        </div>

        <!-- Interactive Scrubber Control -->
        <div class="flex flex-col gap-1.5 pt-2 border-t border-purple-50">
          <div class="flex items-center justify-between text-[11px] font-bold text-on-surface">
            <span>Navegar pelos 12 meses:</span>
            <span id="scrubber-month-label" class="text-secondary font-display">${formatMonthYear(state.store.get12MonthsRollingProjection(state.activeMonth).months[0]?.month || state.activeMonth)}</span>
          </div>
          <input
            type="range"
            id="forecast-scrubber-slider"
            min="0"
            max="11"
            value="0"
            class="w-full h-2 rounded-lg bg-surface-container accent-secondary cursor-pointer"
          />
          <div id="scrubber-detail-card" class="p-3 rounded-2xl bg-surface-container-low flex flex-col gap-1 mt-1 text-[11px]">
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant">Entradas Projetadas:</span>
              <strong id="scrubber-inflows" class="text-tertiary font-display font-bold ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(state.store.get12MonthsRollingProjection(state.activeMonth).months[0]?.inflow || 0)}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-on-surface-variant">Despesas Projetadas:</span>
              <strong id="scrubber-expenses" class="text-error font-display font-bold ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(state.store.get12MonthsRollingProjection(state.activeMonth).months[0]?.expense || 0)}</strong>
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-outline-variant/10">
              <span class="font-bold text-on-surface">Saldo Acumulado em Caixa:</span>
              <strong id="scrubber-balance" class="text-secondary font-display text-[13px] font-bold ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(state.store.get12MonthsRollingProjection(state.activeMonth).months[0]?.cumulativeBalance || 0)}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Botões de Ação Executiva: DRE, Kit Contador e FIRE -->
      <section class="grid grid-cols-3 gap-2">
        <button type="button" class="btn-open-dre-reports p-3 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            ${renderIcon("calculate", "text-[18px]")}
          </div>
          <span class="text-[11px] font-bold text-on-surface leading-tight">DRE & Fator R</span>
        </button>
        <button type="button" class="btn-open-accountant-reports p-3 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
            ${renderIcon("contact_phone", "text-[18px]")}
          </div>
          <span class="text-[11px] font-bold text-on-surface leading-tight">Kit Contador</span>
        </button>
        <button type="button" class="btn-open-fire-reports p-3 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all hover:bg-surface-container shadow-xs">
          <div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center">
            ${renderIcon("local_fire_department", "text-[18px]")}
          </div>
          <span class="text-[11px] font-bold text-on-surface leading-tight">Simulador FIRE</span>
        </button>
      </section>

      <!-- Simulador Tributário Médico (PJ Simples Nacional vs RPA) -->
      <div class="card-floating p-4 flex flex-col gap-3 bg-gradient-to-br from-white via-surface-container-lowest to-secondary-fixed/20 border border-purple-50">
        <div class="flex items-center justify-between border-b border-purple-100 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
              ${renderIcon("account_balance", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Simulador Tributário Médico</h2>
              <span class="text-[11px] text-secondary font-semibold">PJ Simples Nacional vs RPA (Pessoa Física)</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
            Economia de ${taxSim.savingsPercent}%
          </span>
        </div>

        <div class="flex flex-col gap-2 pt-1">
          <div class="grid grid-cols-2 gap-2 text-center">
            <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col">
              <span class="text-[10px] text-on-surface-variant font-bold uppercase">PJ Simples (~6%)</span>
              <span class="text-[16px] font-bold text-tertiary font-display mt-0.5 ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(taxSim.pjTaxSimples)}</span>
              <span class="text-[9px] text-on-surface-variant">Anexo III (Fator R)</span>
            </div>
            <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col">
              <span class="text-[10px] text-on-surface-variant font-bold uppercase">RPA / PF (~27.5%)</span>
              <span class="text-[16px] font-bold text-error font-display mt-0.5 ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(taxSim.pfTaxRPA)}</span>
              <span class="text-[9px] text-on-surface-variant">Carnê-Leão + IRRF</span>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-secondary-fixed/30 border border-secondary/20 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[11px] font-bold text-secondary uppercase">Economia Mensal Estimada</span>
              <span class="text-[20px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(taxSim.monthlySavings)}</span>
            </div>
            <div class="text-right flex flex-col">
              <span class="text-[10px] text-on-surface-variant">Projeção 12 Meses</span>
              <span class="text-[15px] font-bold text-secondary font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(taxSim.annualProjectedSavings)}</span>
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-purple-50/80 text-[11px] text-on-surface-variant flex items-start gap-2">
            ${renderIcon("lightbulb", "text-[16px] text-primary shrink-0 mt-0.5")}
            <div>
              <strong class="text-primary">Estratégia Fator R (28%):</strong> Mantenha seu pró-labore em aprox. <strong>${formatMoney(taxSim.recommendedProLabore)}</strong>/mês para garantir a tributação médica reduzida de 6% no Simples.
            </div>
          </div>
        </div>
      </div>

      <!-- Comparativo Caixa vs Competência Card -->
      <div class="card-floating p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-purple-100 pb-2">
          <h2 class="text-[15px] font-bold text-on-surface">Comparativo Contábil</h2>
          <span class="text-[11px] font-semibold text-primary">${formatMonthYear(state.activeMonth)}</span>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-1">
          <!-- Regime de Caixa Column -->
          <div class="p-3 rounded-2xl bg-surface-container-low flex flex-col gap-1">
            <span class="text-[11px] font-bold text-secondary uppercase">Regime de Caixa</span>
            <span class="text-[18px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(report.caixa.netBalance)}</span>
            <span class="text-[10px] text-on-surface-variant leading-tight mt-1">
              Entradas em conta menos despesas pagas/vencidas neste mês.
            </span>
          </div>

          <!-- Regime de Competência Column -->
          <div class="p-3 rounded-2xl bg-primary-fixed/30 flex flex-col gap-1">
            <span class="text-[11px] font-bold text-primary uppercase">Competência</span>
            <span class="text-[18px] font-bold text-on-surface font-display ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(report.competencia.netBalance)}</span>
            <span class="text-[10px] text-on-surface-variant leading-tight mt-1">
              Produção real de plantões trabalhados neste mês menos despesas.
            </span>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-purple-50 text-[11px] text-on-surface-variant flex items-start gap-2 mt-1">
          ${renderIcon("info", "text-[16px] text-primary shrink-0")}
          <span>
            A regra de <strong>D+90</strong> faz com que o trabalho de 3 meses atrás compense no caixa deste mês. Use a Competência para avaliar seu ritmo de trabalho e o Caixa para honrar seus compromissos.
          </span>
        </div>
      </div>

      <!-- Termômetro de Bem-Estar e Descanso (CFM & Flo Health) -->
      <div class="card-floating p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-purple-100 pb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full ${wellbeing.fatigueLevel === 'high' ? 'bg-error-container text-error' : wellbeing.fatigueLevel === 'moderate' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'} flex items-center justify-center">
              ${renderIcon(wellbeing.fatigueLevel === 'high' ? 'health_and_safety' : 'self_improvement', 'text-[18px]')}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Termômetro de Bem-Estar</h2>
              <span class="text-[11px] text-on-surface-variant">Monitoramento de Fadiga & Recuperação</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full ${wellbeing.fatigueLevel === 'high' ? 'bg-error-container text-error' : wellbeing.fatigueLevel === 'moderate' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'} text-[11px] font-bold">
            ${wellbeing.statusBadge}
          </span>
        </div>

        <p class="text-[12px] text-on-surface-variant leading-relaxed">
          ${wellbeing.message}
        </p>

        <div class="grid grid-cols-3 gap-2 pt-1 text-center">
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col items-center">
            <span class="text-[10px] text-on-surface-variant">Noites Trabalhadas</span>
            <span class="text-[16px] font-bold text-on-surface mt-0.5">${wellbeing.nightShiftsCount}</span>
            <span class="text-[9px] text-secondary">plantões noturnos</span>
          </div>
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col items-center">
            <span class="text-[10px] text-on-surface-variant">Plantões 24h</span>
            <span class="text-[16px] font-bold text-on-surface mt-0.5">${wellbeing.shifts24hCount}</span>
            <span class="text-[9px] text-tertiary">escalas duplas</span>
          </div>
          <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col items-center">
            <span class="text-[10px] text-on-surface-variant">Consecutivos Máx</span>
            <span class="text-[16px] font-bold text-on-surface mt-0.5">${wellbeing.maxConsecutiveDays}d</span>
            <span class="text-[9px] text-primary">dias seguidos</span>
          </div>
        </div>
      </div>

      <!-- Carga Horária & Rentabilidade Média -->
      <div class="card-floating p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
              ${renderIcon("speed", "text-[18px]")}
            </div>
            <div>
              <h2 class="text-[15px] font-bold text-on-surface">Carga Horária & Produtividade</h2>
              <span class="text-[11px] text-on-surface-variant">${formatMonthYear(state.activeMonth)}</span>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
            ${report.workload.totalHours}h dedicadas
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2 pt-1 text-center">
          <div class="p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center">
            <span class="text-[10px] text-on-surface-variant font-medium">Escalas</span>
            <span class="text-[16px] font-bold text-on-surface mt-0.5">${report.competencia.shiftsCount}</span>
            <span class="text-[9px] text-secondary font-semibold">plantões</span>
          </div>
          <div class="p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center">
            <span class="text-[10px] text-on-surface-variant font-medium">Rentabilidade</span>
            <span class="text-[16px] font-bold text-primary mt-0.5">R$ ${report.workload.averageHourlyRate}</span>
            <span class="text-[9px] text-primary font-semibold">por hora</span>
          </div>
          <div class="p-2.5 rounded-2xl bg-surface-container-low flex flex-col items-center justify-center">
            <span class="text-[10px] text-on-surface-variant font-medium">Média Semanal</span>
            <span class="text-[16px] font-bold text-on-surface mt-0.5">${Math.round(report.workload.totalHours / 4.3)}h</span>
            <span class="text-[9px] text-tertiary font-semibold">por semana</span>
          </div>
        </div>
      </div>

      <!-- Ranking e Indicadores por Hospital -->
      <div class="card-floating p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <h2 class="text-[15px] font-bold text-on-surface">Analytics por Instituição</h2>
            <span class="text-secondary text-sm">🏥</span>
          </div>
          <span class="text-[11px] text-on-surface-variant">${hospitalAnalytics.length} hospitais</span>
        </div>

        <div class="flex flex-col gap-3 pt-1">
          ${hospitalAnalytics.length > 0 ? hospitalAnalytics.map(h => `
            <div class="p-3 rounded-2xl bg-surface-container-low/60 flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                  <span class="font-bold text-[13px] text-on-surface truncate">${h.hospital}</span>
                </div>
                <span class="font-bold text-[13px] text-primary ${state.privacyMode ? 'privacy-masked-text' : ''}">${formatMoney(h.totalNet)}</span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5 border-t border-purple-100/60">
                <span class="flex items-center gap-1">
                  ${renderIcon("schedule", "text-[13px] text-tertiary")}
                  ${h.shiftsCount} plantões (${h.totalHours}h)
                </span>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${h.averageHourlyRate >= 150 ? 'badge-rate-gold' : 'badge-rate-mint'}">
                    R$ ${h.averageHourlyRate}/h
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold text-on-surface">
                    ${h.punctualityRate}% pontual
                  </span>
                </div>
              </div>
            </div>
          `).join("") : `
            <p class="text-[12px] text-on-surface-variant text-center py-2">Nenhum plantão cadastrado para gerar estatísticas.</p>
          `}
        </div>
      </div>

      <!-- Gerenciamento e Exportação de Dados -->
      <div class="rounded-[24px] bg-white p-4 shadow-sm flex flex-col gap-3">
        <div>
          <h3 class="text-[14px] font-bold text-on-surface">Central de Relatórios & Backup</h3>
          <p class="text-[11px] text-on-surface-variant mt-0.5">Exporte seus extratos ou gerencie o armazenamento local seguro.</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn-open-printable-statement p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95">
            ${renderIcon("print", "text-[16px] text-primary")}
            <span>Extrato Impresso</span>
          </button>
          <button type="button" class="btn-export-csv p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95">
            ${renderIcon("table_chart", "text-[16px] text-tertiary")}
            <span>Planilha Excel (.CSV)</span>
          </button>
          <button type="button" class="btn-export-json p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95">
            ${renderIcon("file_download", "text-[16px] text-secondary")}
            <span>Download JSON</span>
          </button>
          <button type="button" class="btn-load-demo p-2.5 rounded-2xl bg-primary-fixed hover:bg-primary-fixed/80 text-primary text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95">
            ${renderIcon("play_circle", "text-[16px]")}
            <span>Carregar Exemplo</span>
          </button>
        </div>
        <div class="pt-1">
          <button type="button" class="btn-reset-data w-full py-2 rounded-full bg-error-container/40 text-error hover:bg-error-container/60 text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1">
            ${renderIcon("delete_sweep", "text-[15px]")}
            <span>Limpar Todos os Dados</span>
          </button>
        </div>
      </div>

      <!-- Creator Signature Footer -->
      <div class="text-center py-2 text-[11px] text-on-surface-variant font-medium">
        Finanças Pediatria • ${APP_CREATOR.signature} 🩺💖
      </div>
    </div>
  `;

  dom.mainContent.innerHTML = html;
  attachReportsEvents();
}

// ----------------------------------------------------
// EVENT HANDLERS & INTERACTIONS
// ----------------------------------------------------

function attachDashboardEvents() {
  const btnCaixa = document.getElementById("btn-regime-caixa");
  const btnComp = document.getElementById("btn-regime-competencia");
  if (btnCaixa && btnComp) {
    btnCaixa.addEventListener("click", () => {
      state.currentRegime = "caixa";
      renderDashboardView();
    });
    btnComp.addEventListener("click", () => {
      state.currentRegime = "competencia";
      renderDashboardView();
    });
  }

  const btnEditGoal = document.getElementById("btn-edit-monthly-goal");
  if (btnEditGoal) {
    btnEditGoal.addEventListener("click", () => {
      openDoctorProfileDialog();
    });
  }

  const btnSeeShifts = document.getElementById("btn-see-all-shifts");
  if (btnSeeShifts) {
    btnSeeShifts.addEventListener("click", () => switchTab("plantoes"));
  }

  const btnSeeExpenses = document.getElementById("btn-see-all-expenses");
  if (btnSeeExpenses) {
    btnSeeExpenses.addEventListener("click", () => switchTab("despesas"));
  }

  const cardSalary = document.getElementById("card-fixed-salary");
  if (cardSalary) {
    cardSalary.addEventListener("click", () => {
      openBottomSheet("salario", state.store.data.fixedSalaries[0] || null);
    });
  }

  const btnFilterDelayed = document.querySelector(".btn-filter-delayed");
  if (btnFilterDelayed) {
    btnFilterDelayed.addEventListener("click", () => {
      state.shiftFilter = "delayed";
      state.shiftScope = "all";
      switchTab("plantoes");
    });
  }

  const btnDashAdd = document.querySelector(".btn-dashboard-add-shift");
  if (btnDashAdd) {
    btnDashAdd.addEventListener("click", () => openBottomSheet("plantao"));
  }

  // Quick Action Buttons
  document.querySelectorAll(".btn-quick-consultation").forEach(b => {
    b.addEventListener("click", () => openBottomSheet("consultorio"));
  });
  document.querySelectorAll(".btn-quick-sbar").forEach(b => {
    b.addEventListener("click", () => openSBARDialog());
  });
  document.querySelectorAll(".btn-quick-dre").forEach(b => {
    b.addEventListener("click", () => openDREDialog());
  });
  document.querySelectorAll(".btn-quick-reconcile").forEach(b => {
    b.addEventListener("click", () => openReconciliationDialog());
  });

  attachCardActionEvents();
}

function attachShiftsEvents() {
  document.querySelectorAll(".btn-new-consultation-top").forEach(b => {
    b.addEventListener("click", () => openBottomSheet("consultorio"));
  });
  const searchInput = document.getElementById("shift-search-input");
  const clearBtn = document.getElementById("btn-clear-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.shiftSearchQuery = e.target.value;
      renderShiftsView();
      // Keep focus
      const input = document.getElementById("shift-search-input");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.shiftSearchQuery = "";
      renderShiftsView();
    });
  }

  // Scope switcher (all vs month)
  document.querySelectorAll(".scope-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      state.shiftScope = btn.getAttribute("data-scope");
      renderShiftsView();
    });
  });

  // View mode switcher (List vs Calendar)
  const btnViewList = document.getElementById("btn-view-mode-list");
  const btnViewCal = document.getElementById("btn-view-mode-calendar");
  if (btnViewList) {
    btnViewList.addEventListener("click", () => {
      state.shiftViewMode = "list";
      renderShiftsView();
    });
  }
  if (btnViewCal) {
    btnViewCal.addEventListener("click", () => {
      state.shiftViewMode = "calendar";
      renderShiftsView();
    });
  }

  // Initialize custom rounded selects in shifts view (e.g. sector filter)
  attachCustomSelectEvents(dom.mainContent);

  // Sector filter select
  const sectorSelect = document.getElementById("select-shift-sector");
  if (sectorSelect) {
    sectorSelect.addEventListener("change", (e) => {
      state.shiftSectorFilter = e.target.value;
      renderShiftsView();
    });
  }

  // Shifts regime buttons
  const btnShiftsCaixa = document.getElementById("btn-shifts-caixa");
  const btnShiftsComp = document.getElementById("btn-shifts-competencia");
  if (btnShiftsCaixa) {
    btnShiftsCaixa.addEventListener("click", () => {
      state.currentRegime = "caixa";
      renderShiftsView();
    });
  }
  if (btnShiftsComp) {
    btnShiftsComp.addEventListener("click", () => {
      state.currentRegime = "competencia";
      renderShiftsView();
    });
  }

  const filterBtns = document.querySelectorAll(".filter-pill");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.shiftFilter = btn.getAttribute("data-filter");
      renderShiftsView();
    });
  });

  // Calendar day cells click
  // Calendar day cells click & keyboard support
  document.querySelectorAll(".calendar-day-cell").forEach(cell => {
    cell.addEventListener("click", () => {
      const dateStr = cell.getAttribute("data-date");
      if (dateStr) {
        state.calendarSelectedDate = (state.calendarSelectedDate === dateStr) ? null : dateStr;
        renderShiftsView();
      }
    });

    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cell.click();
      }
    });
  });

  // Calendar "Ver Mês Todo"
  const btnClearCal = document.getElementById("btn-clear-calendar-selection");
  if (btnClearCal) {
    btnClearCal.addEventListener("click", () => {
      state.calendarSelectedDate = null;
      renderShiftsView();
    });
  }

  // Calendar "Mudar Mês" button
  document.querySelectorAll(".btn-quick-month-picker").forEach(btn => {
    btn.addEventListener("click", openQuickMonthPickerDialog);
  });

  // Calendar "Novo Neste Dia"
  const btnAddOnDay = document.getElementById("btn-add-shift-on-day");
  if (btnAddOnDay) {
    btnAddOnDay.addEventListener("click", () => {
      const targetDate = btnAddOnDay.getAttribute("data-date") || state.calendarSelectedDate;
      openBottomSheet("plantao", targetDate ? { shiftDate: targetDate } : null);
    });
  }

  const btnCalEmptyAdd = document.getElementById("btn-calendar-empty-add");
  if (btnCalEmptyAdd) {
    btnCalEmptyAdd.addEventListener("click", () => {
      const targetDate = btnCalEmptyAdd.getAttribute("data-date") || state.calendarSelectedDate;
      openBottomSheet("plantao", targetDate ? { shiftDate: targetDate } : null);
    });
  }

  const btnNewTop = document.getElementById("btn-new-shift-top");
  if (btnNewTop) {
    btnNewTop.addEventListener("click", () => openBottomSheet("plantao"));
  }

  attachCardActionEvents();
}

function attachExpensesEvents() {
  const filterBtns = document.querySelectorAll(".filter-pill");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.expenseFilter = btn.getAttribute("data-filter");
      renderExpensesView();
    });
  });

  const btnNewTop = document.getElementById("btn-new-expense-top");
  if (btnNewTop) {
    btnNewTop.addEventListener("click", () => openBottomSheet("despesa"));
  }

  const exportBtns = document.querySelectorAll(".btn-export-json");
  exportBtns.forEach(btn => btn.addEventListener("click", exportDataJSON));

  const exportCsvBtns = document.querySelectorAll(".btn-export-csv");
  exportCsvBtns.forEach(btn => btn.addEventListener("click", () => exportDataCSV()));

  const statementBtns = document.querySelectorAll(".btn-open-printable-statement");
  statementBtns.forEach(btn => btn.addEventListener("click", openPrintableStatementDialog));

  attachCardActionEvents();
}

function attachReportsEvents() {
  const btnReset = document.querySelector(".btn-reset-data");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      showConfirmDialog({
        title: "Limpar Todos os Dados?",
        message: "Deseja limpar todos os plantões e despesas cadastrados para começar do zero?",
        confirmText: "Sim, Limpar Tudo",
        isDanger: true,
        onConfirm: () => {
          state.store.resetToDefault();
          showToast("Dados limpos com sucesso! 🌸");
          renderCurrentView();
        }
      });
    });
  }

  const btnLoadDemo = document.querySelector(".btn-load-demo");
  if (btnLoadDemo) {
    btnLoadDemo.addEventListener("click", () => {
      state.store.loadDemoData();
      showToast("Exemplo demonstrativo carregado com sucesso! 🌸");
      renderCurrentView();
    });
  }

  const exportBtns = document.querySelectorAll(".btn-export-json");
  exportBtns.forEach(btn => btn.addEventListener("click", exportDataJSON));

  const exportCsvBtns = document.querySelectorAll(".btn-export-csv");
  exportCsvBtns.forEach(btn => btn.addEventListener("click", () => exportDataCSV()));

  const statementBtns = document.querySelectorAll(".btn-open-printable-statement");
  statementBtns.forEach(btn => btn.addEventListener("click", openPrintableStatementDialog));

  // Executive Action Buttons in Reports
  document.querySelectorAll(".btn-open-dre-reports").forEach(b => b.addEventListener("click", () => openDREDialog()));
  document.querySelectorAll(".btn-open-accountant-reports").forEach(b => b.addEventListener("click", () => openAccountantKitDialog()));
  document.querySelectorAll(".btn-open-fire-reports").forEach(b => b.addEventListener("click", () => openFIREDialog()));

  // 12M Rolling Forecast Scrubber & Interactive Chart
  const scrubberSlider = document.getElementById("forecast-scrubber-slider");
  const proj12M = state.store.get12MonthsRollingProjection(state.activeMonth);
  const labelMonth = document.getElementById("scrubber-month-label");
  const labelInflows = document.getElementById("scrubber-inflows");
  const labelExpenses = document.getElementById("scrubber-expenses");
  const labelBalance = document.getElementById("scrubber-balance");
  const scrubberGuide = document.getElementById("scrubber-guide");
  const scrubberTooltip = document.getElementById("scrubber-tooltip");
  const tooltipMonth = document.getElementById("scrubber-tooltip-month");
  const tooltipInflow = document.getElementById("scrubber-tooltip-inflow");
  const tooltipBalance = document.getElementById("scrubber-tooltip-balance");

  const updateScrubber = (idx, triggerHapticFeedback = true) => {
    const mData = proj12M.months[idx];
    if (!mData) return;

    if (labelMonth) labelMonth.textContent = formatMonthYear(mData.month);
    if (labelInflows) labelInflows.textContent = formatMoney(mData.inflow);
    if (labelExpenses) labelExpenses.textContent = formatMoney(mData.expense);
    if (labelBalance) labelBalance.textContent = formatMoney(mData.cumulativeBalance);

    if (scrubberSlider && String(scrubberSlider.value) !== String(idx)) {
      scrubberSlider.value = idx;
    }

    const col = document.querySelector(`.scrubber-column[data-index="${idx}"]`);
    if (col) {
      const colX = parseFloat(col.getAttribute("data-x")) || 0;
      if (scrubberGuide) {
        scrubberGuide.setAttribute("x1", colX);
        scrubberGuide.setAttribute("x2", colX);
        scrubberGuide.classList.remove("hidden");
      }
    }

    if (scrubberTooltip) {
      if (tooltipMonth) tooltipMonth.textContent = mData.fullLabel || formatMonthYear(mData.month);
      if (tooltipInflow) tooltipInflow.textContent = formatMoney(mData.inflow);
      if (tooltipBalance) tooltipBalance.textContent = formatMoney(mData.cumulativeBalance);
      scrubberTooltip.classList.remove("hidden");
    }

    if (triggerHapticFeedback) triggerHaptic(8);
  };

  if (scrubberSlider) {
    scrubberSlider.addEventListener("input", (e) => {
      const idx = parseInt(e.target.value, 10) || 0;
      updateScrubber(idx);
    });
  }

  document.querySelectorAll(".scrubber-column").forEach(col => {
    const handleColSelect = () => {
      const idx = parseInt(col.getAttribute("data-index"), 10) || 0;
      updateScrubber(idx);
    };
    col.addEventListener("pointerdown", handleColSelect);
    col.addEventListener("pointerenter", handleColSelect);
  });
}

function attachCardActionEvents() {
  // Consultations actions: toggle paid, edit, delete
  document.querySelectorAll(".btn-toggle-consultation-paid").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const updated = state.store.toggleConsultationPaid(id);
      if (updated) {
        if (updated.paid) {
          spawnPediatricParticles(e, 'butterflies');
        }
        showToast(updated.paid ? "Consulta marcada como recebida! 🩺✨" : "Consulta marcada como pendente.", "check_circle");
        renderCurrentView();
      }
    });
  });

  document.querySelectorAll(".btn-edit-consultation").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const c = state.store.getConsultations().find(item => item.id === id);
      if (c) openBottomSheet("consultorio", c);
    });
  });

  document.querySelectorAll(".btn-delete-consultation").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      showConfirmDialog({
        title: "Excluir Consulta?",
        message: "Deseja mover este atendimento para a lixeira?",
        confirmText: "Sim, Excluir",
        isDanger: true,
        onConfirm: () => {
          state.store.deleteConsultation(id);
          showToast("Consulta movida para a lixeira. 🗑️");
          renderCurrentView();
        }
      });
    });
  });

  // Shift Swap & Handover via WhatsApp
  document.querySelectorAll(".btn-shift-swap").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      openShiftSwapDialog(id);
    });
  });

  // 1-Touch Shift Toggle (Receive / Unmark)
  document.querySelectorAll(".btn-toggle-shift").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");

      if (action === "toggle-installment") {
        const instNum = parseInt(btn.getAttribute("data-installment-number"), 10) || 1;
        const updated = state.store.toggleShiftInstallment(id, instNum);
        if (updated) {
          const inst = Array.isArray(updated.installments) ? updated.installments.find(i => i.number === instNum) : null;
          if (inst && inst.status === "received") {
            showToast(`${instNum}ª parcela de ${formatMoney(inst.value)} confirmada em conta! 💖`, "check_circle");
            showBabyReaction({
              type: 'income',
              title: `${instNum}ª Parcela Confirmada! 👶💖`,
              message: `Recebimento de ${formatCurrency(inst.value)} (${inst.percent}%) do plantão no ${updated.hospital} creditado em conta!`,
              amount: inst.value
            });
          } else {
            showToast("Parcela marcada como pendente.", "schedule");
          }
        }
      } else if (action === "receive") {
        const updated = state.store.markShiftAsReceived(id);
        if (updated) {
          showToast(`Repasse de ${formatMoney(updated.netValue)} confirmado em conta! 💖`, "check_circle");
          showBabyReaction({
            type: 'income',
            title: 'Repasse Confirmado! 👶💖',
            message: `Repasse integral do plantão no ${updated.hospital} registrado em conta!`,
            amount: updated.netValue
          });
        }
      } else {
        state.store.unmarkShiftAsReceived(id);
        showToast("Plantão marcado como pendente.", "schedule");
      }
      renderCurrentView();
    });
  });

  // Duplicate Shift (1-Touch)
  document.querySelectorAll(".btn-duplicate-shift").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const duplicated = state.store.duplicateShift(id);
      if (duplicated) {
        showToast(`Escala duplicada para ${formatDateBR(duplicated.shiftDate)}! 🌸`);
        renderCurrentView();
      }
    });
  });

  // View Shift Voucher / Receipt
  document.querySelectorAll(".btn-view-voucher").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      openShiftVoucherDialog(id);
    });
  });

  // Edit Shift
  document.querySelectorAll(".btn-edit-shift").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const shift = state.store.data.shifts.find(s => s.id === id);
      if (shift) {
        state.editingItem = { type: "shift", data: shift };
        openBottomSheet("plantao", shift);
      }
    });
  });

  // Delete Shift with iOS styled dialog
  document.querySelectorAll(".btn-delete-shift").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const shift = state.store.data.shifts.find(s => s.id === id);
      showConfirmDialog({
        title: "Excluir Plantão?",
        message: `Deseja mover o plantão de ${shift ? shift.hospital : 'hospital'} (${shift ? formatDateBR(shift.shiftDate) : ''}) para a lixeira?`,
        confirmText: "Sim, Excluir",
        isDanger: true,
        onConfirm: () => {
          state.store.deleteShift(id);
          showToast("Plantão movido para a lixeira.", "delete", () => {
            state.store.undoLastDelete();
            renderCurrentView();
            showToast("Plantão restaurado! 🌸", "restore_from_trash");
          });
          renderCurrentView();
        }
      });
    });
  });

  // Notify Delay (WhatsApp & Direct Hospital Modal)
  document.querySelectorAll(".btn-notify-delay").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      if (id) {
        openHospitalDelayDialog(id);
      } else {
        const hospital = btn.getAttribute("data-hospital");
        const found = state.store.data.shifts.find(s => s.hospital === hospital && s.status === "delayed");
        if (found) {
          openHospitalDelayDialog(found.id);
        } else {
          showToast(`Cobrança encaminhada ao faturamento do ${hospital}! 📩`);
        }
      }
    });
  });

  // 1-Touch Expense Toggle (Paid / Pending)
  document.querySelectorAll(".btn-toggle-expense-paid").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const expense = state.store.toggleExpensePaid(id);
      if (expense) {
        showToast(expense.isPaid ? "Despesa marcada como paga! ✓" : "Despesa marcada como a pagar.", "receipt");
      }
      renderCurrentView();
    });
  });

  // Duplicate Expense to Next Month
  document.querySelectorAll(".btn-duplicate-expense").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const duplicated = state.store.duplicateExpense(id);
      if (duplicated) {
        showToast(`Despesa duplicada para ${formatDateBR(duplicated.dueDate)}! 🧾`);
        renderCurrentView();
      }
    });
  });

  // Quick Modify Expense Category (1-Tap from Card)
  document.querySelectorAll(".btn-card-category-quick").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const expense = state.store.data.expenses.find(x => x.id === id);
      if (expense) {
        openQuickCategoryChangeDialog(expense);
      }
    });
  });

  // Edit Expense
  document.querySelectorAll(".btn-edit-expense").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const expense = state.store.data.expenses.find(x => x.id === id);
      if (expense) {
        state.editingItem = { type: "despesa", data: expense };
        openBottomSheet("despesa", expense);
      }
    });
  });

  // Delete Expense with iOS styled dialog
  document.querySelectorAll(".btn-delete-expense").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const exp = state.store.data.expenses.find(x => x.id === id);
      showConfirmDialog({
        title: "Excluir Despesa?",
        message: `Deseja mover a despesa '${exp ? exp.description : ''}' (${exp ? formatMoney(exp.value) : ''}) para a lixeira?`,
        confirmText: "Sim, Excluir",
        isDanger: true,
        onConfirm: () => {
          state.store.deleteExpense(id);
          showToast("Despesa movida para a lixeira.", "delete", () => {
            state.store.undoLastDelete();
            renderCurrentView();
            showToast("Despesa restaurada! 🌸", "restore_from_trash");
          });
          renderCurrentView();
        }
      });
    });
  });
}

function exportDataJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.store.data, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `pediatria_financeiro_${state.activeMonth}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Relatório exportado em JSON! 📁");
}

function exportDataCSV(monthStr = null, onlyCurrentMonth = false) {
  const targetMonth = monthStr || state.activeMonth;
  const csvContent = state.store.generateCSV(targetMonth, { onlyMonth: onlyCurrentMonth });
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", `extrato_pediatrico_${targetMonth}${onlyCurrentMonth ? '_mensal' : ''}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
  showToast("Planilha CSV exportada com sucesso! 📊");
}

// ----------------------------------------------------
// BOTTOM SHEET MODAL (NOVO LANÇAMENTO)
// ----------------------------------------------------

function openBottomSheet(tab = "plantao", editData = null) {
  state.activeModalTab = tab;
  state.editingItem = editData ? { type: tab, data: editData } : null;

  renderBottomSheetContent();
  dom.bottomSheet.classList.add("active");
  dom.modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeBottomSheet() {
  dom.bottomSheet.classList.remove("active");
  dom.modalOverlay.classList.remove("active");
  dom.bottomSheet.style.transform = "";
  dom.bottomSheet.style.transition = "";
  document.body.style.overflow = "";
  state.editingItem = null;
}

function renderBottomSheetContent() {
  const isEditing = Boolean(state.editingItem && state.editingItem.data && state.editingItem.data.id);
  const editData = state.editingItem ? state.editingItem.data : null;

  const html = `
    <div class="px-5 pt-1 pb-8 flex flex-col">
      <!-- Drag Handle -->
      <div class="sheet-handle"></div>

      <!-- Header Section -->
      <div class="flex items-center justify-between pb-3">
        <div class="flex items-center gap-2">
          <h2 class="font-headline text-[20px] font-bold text-on-surface">
            ${isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <span class="text-secondary">✨</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-voice-log-sheet"
            class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center hover:bg-secondary-fixed/80 active:scale-95 transition-all shadow-xs"
            title="Lançamento Rápido por Voz (NLP Médico)"
          >
            <span class="material-symbols-outlined text-[18px]">mic</span>
          </button>
          <button
            type="button"
            id="btn-close-sheet"
            class="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container active:scale-95 transition-transform"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      <!-- Category Segmented Control Switcher -->
      <div class="bg-surface-container-low p-1 rounded-full flex items-center gap-1 mb-4 overflow-x-auto">
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'plantao' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="plantao"
        >
          <span class="material-symbols-outlined text-[15px]">stethoscope</span>
          <span>Plantão</span>
        </button>
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'consultorio' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="consultorio"
        >
          <span class="material-symbols-outlined text-[15px]">child_friendly</span>
          <span>Consultório</span>
        </button>
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'salario' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="salario"
        >
          <span class="material-symbols-outlined text-[15px]">work</span>
          <span>Salário</span>
        </button>
        <button
          type="button"
          class="modal-tab-btn flex-1 py-2 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${state.activeModalTab === 'despesa' ? 'bg-gradient-to-r from-secondary-container via-secondary to-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}"
          data-tab="despesa"
        >
          <span class="material-symbols-outlined text-[15px]">receipt_long</span>
          <span>Despesa</span>
        </button>
      </div>

      <!-- Form Container -->
      <div id="modal-form-container">
        ${state.activeModalTab === "plantao" ? renderShiftForm(editData) : state.activeModalTab === "consultorio" ? renderConsultationForm(editData) : state.activeModalTab === "salario" ? renderSalaryForm(editData) : renderExpenseForm(editData)}
      </div>
    </div>
  `;

  dom.bottomSheet.innerHTML = html;
  if (typeof enhanceIcons === "function" && dom.bottomSheet) {
    enhanceIcons(dom.bottomSheet);
  }
  attachBottomSheetFormEvents();
}

/**
 * Form: Cadastrar / Editar Plantão
 */
function renderShiftForm(data = null) {
  const isEdit = Boolean(data && data.id);
  const hospital = data ? (data.hospital || "") : "";
  const shiftDate = data ? (data.shiftDate || getLocalDateString(state.referenceDate || new Date())) : getLocalDateString(state.referenceDate || new Date());
  const shiftType = data ? (data.shiftType || "12h Diurno") : "12h Diurno";
  const sector = data ? (data.sector || "UTI Neonatal") : "UTI Neonatal";
  const workLocations = state.store.getWorkLocations();
  const allWorkTypes = state.store.getWorkTypes();
  const activeWorkTypes = state.store.getActiveWorkTypes();
  const workType = data ? (data.workType || "Plantão em Maternidade") : (activeWorkTypes[0] || "Plantão em Maternidade");
  const taxRegime = data ? (data.taxRegime || "Simples Nacional (6%)") : "Simples Nacional (6%)";
  const taxRate = (data && data.taxRate !== undefined) ? data.taxRate : 6;
  const notes = data ? (data.notes || "") : "";
  const grossVal = data ? (data.grossValue || "") : "";
  const netVal = data ? (data.netValue || "") : "";
  const lagMonths = data ? (data.paymentLagMonths || 3) : 3;
  const customDate = data ? (data.customPaymentDate || "") : "";
  const hasCustomDate = Boolean(customDate);
  const expectedDate = calculateExpectedPaymentDate(shiftDate, lagMonths, customDate);

  return `
    <form id="form-shift" class="flex flex-col gap-4">
      <!-- Hospital / Maternidade (Stitch Rounded Custom Picker) -->
      <div class="flex flex-col gap-1.5 relative" id="hospital-selector-container">
        <label class="text-[12px] font-bold text-on-surface-variant flex items-center justify-between">
          <span>Hospital ou Maternidade</span>
          <span class="text-secondary text-[11px] flex items-center gap-0.5">
            ${renderIcon('auto_awesome', 'text-[13px]')} Locais Cadastrados
          </span>
        </label>

        <!-- Interactive Trigger Box -->
        <button
          type="button"
          id="btn-hospital-picker-trigger"
          class="hospital-picker-trigger category-picker-trigger h-11 px-3.5 rounded-2xl bg-surface-container-low border border-purple-100/50 dark:border-purple-900/30 flex items-center justify-between gap-2 shadow-xs cursor-pointer text-left w-full hover:border-secondary transition-all"
        >
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-secondary/15 text-secondary">
              ${renderIcon('local_hospital', 'text-[14px]')}
            </div>
            <span id="hospital-display-text" class="text-[13px] font-bold text-on-surface truncate">
              ${hospital || 'Selecione ou busque o hospital...'}
            </span>
          </div>
          <div class="flex items-center gap-1 shrink-0 text-on-surface-variant">
            <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase bg-secondary-fixed text-secondary">LOCAL</span>
            <span id="hospital-chevron-icon" class="text-secondary transition-transform duration-200">${renderIcon('expand_more', 'text-[18px]')}</span>
          </div>
        </button>

        <!-- Native hidden input to preserve complete form serialization & test compatibility -->
        <input
          type="text"
          id="input-shift-hospital"
          class="hidden"
          value="${hospital}"
          required
        />

        <!-- Custom Hospital Dropdown Popover Menu -->
        <div id="hospital-picker-menu" class="hospital-menu-popover category-menu-popover hidden absolute top-[calc(100%+6px)] inset-x-0 z-[85] bg-white dark:bg-[#1F1228] rounded-[20px] border border-purple-100 dark:border-purple-900/40 shadow-xl overflow-hidden flex flex-col">
          <!-- Live Search & Add -->
          <div class="p-2 border-b border-purple-100 dark:border-purple-900/30 bg-surface-container-low/50">
            <div class="h-9 bg-white dark:bg-[#241430] rounded-xl px-2.5 flex items-center gap-1.5 border border-purple-100 dark:border-purple-900/40 focus-within:border-secondary transition-all">
              ${renderIcon('search', 'text-[16px] text-secondary')}
              <input
                type="text"
                id="input-hospital-search"
                placeholder="Buscar ou digitar novo hospital..."
                class="w-full bg-transparent text-[12px] font-semibold text-on-surface focus:outline-none placeholder:text-on-surface-variant/50"
              />
              <button type="button" id="btn-clear-hospital-search" class="text-on-surface-variant/50 hover:text-on-surface hidden cursor-pointer">
                ${renderIcon('close', 'text-[14px]')}
              </button>
            </div>
            <button
              type="button"
              id="btn-use-typed-hospital"
              class="hidden mt-1.5 w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              ${renderIcon('add_circle', 'text-[14px]')}
              <span id="text-use-typed-hospital">Usar novo local</span>
            </button>
          </div>

          <!-- List of Hospitals -->
          <div class="hospital-menu-list category-menu-list no-scrollbar max-h-48 overflow-y-auto p-1.5" id="hospital-menu-items-list"></div>
        </div>
        <!-- Quick pills with default & custom locations -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 -mx-1 px-1 no-scrollbar">
          ${workLocations.map(h => `
            <button
              type="button"
              class="quick-hospital-pill py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${hospital === h ? 'bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-hospital="${h}"
            >
              ${h.length > 20 ? h.slice(0, 18) + '...' : h}
            </button>
          `).join("")}
          <button
            type="button"
            class="quick-add-hospital-pill py-1 px-2.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-primary-fixed/50 text-primary hover:bg-primary-fixed flex items-center gap-0.5 transition-all active:scale-95"
          >
            ${renderIcon('add', 'text-[13px]')} Outro Local
          </button>
        </div>
      </div>

      <!-- Tipo de Atuação & Setor Clínico -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Atuação Pediátrica</label>
          ${renderCustomSelectHTML({
            id: 'input-shift-work-type',
            value: workType,
            options: allWorkTypes,
            icon: 'work'
          })}
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Setor Clínico</label>
          ${renderCustomSelectHTML({
            id: 'input-shift-sector',
            value: sector,
            options: CLINICAL_SECTORS,
            icon: 'stethoscope'
          })}
        </div>
      </div>

      <!-- Tipo de Escala & Data Trabalhada -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Tipo de Escala</label>
          ${renderCustomSelectHTML({
            id: 'input-shift-type',
            value: shiftType,
            options: SHIFT_TYPES.map(t => ({ value: t.id, label: t.label })),
            icon: 'schedule'
          })}
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Data Trabalhada</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm">
            ${renderIcon('calendar_today', 'text-[18px] text-primary')}
            <input
              type="date"
              id="input-shift-date"
              class="w-full bg-transparent text-[12px] text-on-surface focus:outline-none font-medium"
              value="${shiftDate}"
              required
            />
          </div>
        </div>
      </div>

      <!-- Alíquota de Imposto: Slider Estilo Volume (6% a 20%) -->
      <div class="flex flex-col gap-2 p-3 bg-surface-container-low rounded-2xl border border-purple-100 shadow-sm">
        <div class="flex items-center justify-between">
          <label class="text-[12px] font-bold text-on-surface flex items-center gap-1">
            ${renderIcon("tune", "text-[16px] text-secondary")}
            <span>Alíquota de Imposto (6% a 20%)</span>
          </label>
          <span id="label-tax-slider-display" class="text-[14px] font-extrabold text-secondary font-display">${Number(taxRate).toFixed(1)}%</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold text-outline">6%</span>
          <input
            type="range"
            min="6"
            max="20"
            step="0.5"
            id="input-shift-tax-slider"
            class="tax-slider w-full cursor-pointer"
            value="${taxRate}"
          />
          <span class="text-[10px] font-bold text-outline">20%</span>
        </div>
        <div class="flex items-center justify-between text-[10px] text-on-surface-variant">
          <span>Simples Nacional (6%)</span>
          <span>Intermediário (13%)</span>
          <span>Presumido (20%)</span>
        </div>
      </div>
      <input type="hidden" id="input-shift-tax-regime" value="${taxRegime}" />
      <input type="hidden" id="input-shift-tax-rate" value="${taxRate}" />

      <!-- Gross vs Net Values (Valor informado livremente pela médica) -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1 bg-surface-container-low p-3 rounded-2xl shadow-sm">
          <span class="text-[11px] font-semibold text-on-surface-variant">Valor Bruto (R$)</span>
          <input
            type="number"
            step="0.01"
            id="input-shift-gross"
            class="w-full bg-transparent text-[18px] font-bold text-on-surface focus:outline-none font-display"
            placeholder="0.00"
            value="${grossVal}"
            required
          />
          <span class="text-[10px] text-outline">Valor do plantão informado</span>
        </div>

        <div class="flex flex-col gap-1 bg-surface-container p-3 rounded-2xl shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold text-tertiary">Valor Líquido (R$)</span>
            <span id="badge-live-hourly-rate" class="badge-rate-mint text-[9px] px-1.5 py-0.2">R$/h</span>
          </div>
          <input
            type="number"
            step="0.01"
            id="input-shift-net"
            class="w-full bg-transparent text-[18px] font-bold text-tertiary focus:outline-none font-display"
            placeholder="0.00"
            value="${netVal}"
            required
          />
          <span id="label-tax-deduction-amount" class="text-[10px] text-on-surface-variant">Líquido em conta</span>
        </div>
      </div>

      <!-- Previsão das Parcelas (80% D+60 e 20% D+90) -->
      <div class="bg-gradient-to-br from-primary-fixed/40 via-surface-container-low to-secondary-fixed/40 p-3.5 rounded-2xl shadow-[0_4px_16px_rgba(126,74,138,0.06)] flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-primary flex items-center gap-1">
            ${renderIcon("payments", "text-[16px]")} Previsão das Parcelas (Regra Pediátrica):
          </span>
          <span class="text-[10px] text-on-surface-variant font-semibold">80% D+60 • 20% D+90</span>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-0.5">
          <div class="bg-white/90 p-2.5 rounded-xl flex flex-col border border-purple-100 shadow-sm">
            <span class="text-[10px] font-bold text-on-surface-variant">1ª Parcela (80% em 60 dias)</span>
            <span class="text-[14px] font-extrabold text-secondary font-display" id="label-install-1-val">R$ 0,00</span>
            <span class="text-[10px] text-on-surface-variant truncate" id="label-install-1-date">Previsão: --/--/----</span>
          </div>
          <div class="bg-white/90 p-2.5 rounded-xl flex flex-col border border-purple-100 shadow-sm">
            <span class="text-[10px] font-bold text-on-surface-variant">2ª Parcela (20% em 90 dias)</span>
            <span class="text-[14px] font-extrabold text-primary font-display" id="label-install-2-val">R$ 0,00</span>
            <span class="text-[10px] text-on-surface-variant truncate" id="label-install-2-date">Previsão: --/--/----</span>
          </div>
        </div>
        <div class="text-[10px] text-on-surface-variant flex items-center justify-between pt-0.5 px-0.5">
          <span>100% recebido em 90 dias no Regime de Caixa</span>
          <span class="font-bold text-secondary" id="label-expected-date">${formatDateBR(expectedDate)}</span>
        </div>
      </div>

      <!-- Prazo Manual ou D+X Alternativo -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label class="text-[12px] font-bold text-on-surface-variant">Regra Especial de Prazo</label>
          <button
            type="button"
            id="btn-toggle-custom-date"
            class="text-[11px] font-bold text-secondary hover:underline flex items-center gap-0.5"
          >
            ${renderIcon("tune", "text-[14px]")}
            <span>${hasCustomDate ? 'Usar Regra 80/20 Padrão' : 'Data Manual Específica'}</span>
          </button>
        </div>

        <div id="custom-date-container" class="${hasCustomDate ? '' : 'hidden'} mt-1 flex flex-col gap-1">
          <label class="text-[11px] font-semibold text-secondary flex items-center gap-1">
            ${renderIcon("calendar_month", "text-[14px]")}
            Data Fixa Manual de Repasse (Substitui D+60/D+90):
          </label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm border border-secondary/30">
            ${renderIcon("edit_calendar", "text-[18px] text-secondary")}
            <input
              type="date"
              id="input-shift-custom-date"
              class="w-full bg-transparent text-[13px] text-on-surface focus:outline-none font-medium"
              value="${customDate}"
            />
          </div>
        </div>
        <input type="hidden" id="input-shift-lag" value="${lagMonths}" />
      </div>

      <!-- Clinical Notes & Handover -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant flex items-center justify-between">
          <span>Observações Clínicas & Passagem de Plantão</span>
          <span class="text-[10px] text-outline">Opcional</span>
        </label>
        <textarea
          id="input-shift-notes"
          rows="2"
          class="w-full bg-surface-container-low rounded-2xl p-3 text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:bg-white border border-transparent focus:border-primary transition-all resize-none shadow-sm"
          placeholder="Ex: Leito 4 intubado, passagem tranquila. Faturamento confirmou repasse para dia 15."
        >${notes}</textarea>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="h-12 w-full rounded-full bg-gradient-to-r from-secondary-container via-secondary to-primary text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(253,78,135,0.35)] active:scale-[0.98] transition-all"
      >
        <span>${isEdit ? 'Salvar Alterações' : 'Salvar Plantão no Radar'}</span>
        ${renderIcon("check", "text-[18px]")}
      </button>
    </form>
  `;
}

/**
 * Form: Cadastrar / Editar Atendimento de Consultório & Puericultura
 */
function renderConsultationForm(data = null) {
  const isEdit = Boolean(data && data.id);
  const patientName = data ? (data.patientName || "") : "";
  const consultationType = data ? (data.consultationType || "Puericultura (Avulsa)") : "Puericultura (Avulsa)";
  const puericulturaMonth = data ? (data.puericulturaMonth || "1º mês (RN)") : "1º mês (RN)";
  const dateVal = data ? (data.date || getLocalDateString(state.referenceDate || new Date())) : getLocalDateString(state.referenceDate || new Date());
  const valueVal = data ? (data.value || 350) : 350;
  const durationVal = data ? (data.durationMinutes || 60) : 60;
  const paymentMethodVal = data ? (data.paymentMethod || "PIX") : "PIX";
  const paidVal = data ? Boolean(data.paid) : true;
  const notesVal = data ? (data.notes || "") : "";
  const hourlyYield = Math.round(valueVal / (durationVal / 60));

  return `
    <form id="form-consultation" class="flex flex-col gap-3.5">
      <input type="hidden" id="input-consultation-id" value="${isEdit ? data.id : ''}" />

      <!-- Patient Name -->
      <div class="flex flex-col gap-1">
        <label for="input-consultation-patient" class="text-[12px] font-bold text-on-surface flex items-center justify-between">
          <span>Nome da Criança / Mãe</span>
          <span class="text-[10px] text-secondary font-semibold">Obrigatório</span>
        </label>
        <div class="relative">
          <input
            type="text"
            id="input-consultation-patient"
            required
            placeholder="Ex: Bernardo (Mãe: Juliana)"
            value="${patientName}"
            class="w-full h-11 px-3.5 pl-10 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[14px] text-on-surface focus:outline-none focus:border-secondary transition-all"
          />
          <span class="absolute left-3 top-3 material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
        </div>
      </div>

      <!-- Consultation Type & Puericultura Month -->
      <div class="grid grid-cols-2 gap-2.5">
        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface">Tipo de Atendimento</label>
          ${renderCustomSelectHTML({
            id: 'input-consultation-type',
            value: consultationType,
            options: [
              "Puericultura (Avulsa)",
              "Pacote Puericultura Anual",
              "Primeira Consulta",
              "Retorno",
              "Telemedicina",
              "Emergência Domiciliar"
            ],
            icon: 'medical_services'
          })}
        </div>

        <div class="flex flex-col gap-1" id="container-puericultura-month">
          <label class="text-[12px] font-bold text-on-surface">Mês Puericultura</label>
          ${renderCustomSelectHTML({
            id: 'input-consultation-puericultura-month',
            value: puericulturaMonth,
            options: [
              "1º mês (RN)",
              "2º mês",
              "3º mês",
              "4º mês",
              "5º mês",
              "6º mês",
              "9º mês",
              "12º mês (1 ano)",
              "Acompanhamento Trimestral"
            ],
            icon: 'child_care'
          })}
        </div>
      </div>

      <!-- Date & Duration -->
      <div class="grid grid-cols-2 gap-2.5">
        <div class="flex flex-col gap-1">
          <label for="input-consultation-date" class="text-[12px] font-bold text-on-surface">Data da Consulta</label>
          <input
            type="date"
            id="input-consultation-date"
            required
            value="${dateVal}"
            class="w-full h-11 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary transition-all"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface">Duração</label>
          ${renderCustomSelectHTML({
            id: 'input-consultation-duration',
            value: durationVal,
            options: [
              { value: "30", label: "30 minutos" },
              { value: "45", label: "45 minutos" },
              { value: "60", label: "60 minutos (1h)" },
              { value: "90", label: "90 minutos (1h30)" },
              { value: "120", label: "120 minutos (2h)" }
            ],
            icon: 'timer'
          })}
        </div>
      </div>

      <!-- Value & Payment Method -->
      <div class="grid grid-cols-2 gap-2.5">
        <div class="flex flex-col gap-1">
          <label for="input-consultation-value" class="text-[12px] font-bold text-on-surface">Honorário (R$)</label>
          <input
            type="number"
            step="0.01"
            id="input-consultation-value"
            required
            value="${valueVal}"
            class="w-full h-11 px-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[14px] font-bold text-on-surface focus:outline-none focus:border-secondary transition-all"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-on-surface">Forma de Pagamento</label>
          ${renderCustomSelectHTML({
            id: 'input-consultation-payment-method',
            value: paymentMethodVal,
            options: [
              "PIX",
              "Cartão Débito",
              "Cartão Crédito",
              "Dinheiro",
              "Convênio/Reembolso"
            ],
            icon: 'payments'
          })}
        </div>
      </div>

      <!-- Live Hourly Rate Badge & Paid Status Toggle -->
      <div class="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-[11px] text-on-surface-variant font-medium">Rendimento Horário Estimado:</span>
          <span class="text-[16px] font-bold text-secondary font-display" id="label-live-consultation-hourly">
            R$ ${hourlyYield}/h
          </span>
        </div>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="input-consultation-paid"
            class="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary"
            ${paidVal ? "checked" : ""}
          />
          <span class="text-[12px] font-bold text-on-surface">Recebido</span>
        </label>
      </div>

      <!-- Notes -->
      <div class="flex flex-col gap-1">
        <label for="input-consultation-notes" class="text-[12px] font-bold text-on-surface">Evolução / Observações Clínicas</label>
        <textarea
          id="input-consultation-notes"
          rows="2"
          placeholder="Ex: Ganho ponderal adequado (+30g/dia), vacinas em dia, amamentação exclusiva."
          class="w-full p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:border-secondary transition-all resize-none"
        >${notesVal}</textarea>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full h-12 rounded-full bg-gradient-to-r from-secondary-container via-secondary to-primary text-white font-bold text-[14px] shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 mt-1"
      >
        <span class="material-symbols-outlined text-[18px]">check</span>
        <span>${isEdit ? 'Salvar Alterações' : 'Salvar Atendimento Pediátrico'}</span>
      </button>
    </form>
  `;
}

/**
 * Form: Cadastrar / Editar Salário Fixo
 */
function renderSalaryForm(data = null) {
  const existingSalary = data || (state.store.data.fixedSalaries && state.store.data.fixedSalaries[0]) || null;
  const isEdit = Boolean(existingSalary);
  const salaryId = existingSalary ? existingSalary.id : "";
  const desc = existingSalary ? existingSalary.description : "";
  const val = existingSalary ? existingSalary.value : "";
  const day = existingSalary ? existingSalary.dayOfMonth : 5;

  return `
    <form id="form-salary" class="flex flex-col gap-4">
      <input type="hidden" id="input-salary-id" value="${salaryId}" />
      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant">Descrição do Cargo / Vínculo</label>
        <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm">
          ${renderIcon('work', 'text-[20px] text-primary')}
          <input
            type="text"
            id="input-salary-desc"
            class="w-full bg-transparent text-[14px] text-on-surface focus:outline-none"
            placeholder="Ex: Consultório Particular / Vínculo Fixo"
            value="${desc}"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Valor Mensal (R$)</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-1 shadow-sm">
            <span class="text-[13px] font-bold text-on-surface">R$</span>
            <input
              type="number"
              step="0.01"
              id="input-salary-value"
              class="w-full bg-transparent text-[16px] font-bold text-on-surface focus:outline-none"
              placeholder="0.00"
              value="${val}"
              required
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Dia do Pagamento</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm">
            ${renderIcon('calendar_month', 'text-[18px] text-tertiary')}
            <input
              type="number"
              min="1"
              max="31"
              id="input-salary-day"
              class="w-full bg-transparent text-[15px] font-bold text-on-surface focus:outline-none"
              value="${day}"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        class="h-12 w-full rounded-full bg-gradient-to-r from-secondary-container via-secondary to-primary text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(253,78,135,0.35)] active:scale-[0.98] transition-all mt-2"
      >
        <span>${isEdit ? 'Atualizar Salário Fixo' : 'Salvar Salário Fixo'}</span>
        ${renderIcon('check', 'text-[18px]')}
      </button>
    </form>
  `;
}

/**
 * Form: Cadastrar Despesa Pediátrica (PF vs PJ)
 */
function renderExpenseForm(data = null) {
  const isEdit = Boolean(data);
  const desc = data ? data.description : "";
  const categoriesPF = state.store.getExpenseCategories ? state.store.getExpenseCategories("pf") : EXPENSE_CATEGORIES_PF;
  const categoriesPJ = state.store.getExpenseCategories ? state.store.getExpenseCategories("pj") : EXPENSE_CATEGORIES_PJ;
  const category = data ? data.category : (categoriesPF[0] || "Alimentação");
  const type = data ? data.type : "fixed";
  const val = data ? data.value : "";
  const dueDate = data ? data.dueDate : `${state.activeMonth}-10`;
  const isPaid = data ? data.isPaid : false;
  const scope = data ? (data.scope || (state.store.getCategoryScope ? state.store.getCategoryScope(category) : getCategoryScope(category))) : (state.store.getCategoryScope ? state.store.getCategoryScope(category) : getCategoryScope(category));
  const scopeCategories = scope === "pj" ? categoriesPJ : categoriesPF;
  const categoryColor = state.store.getCategoryColor ? state.store.getCategoryColor(category) : "#B80F55";
  const categoryIcon = state.store.getCategoryIcon ? state.store.getCategoryIcon(category) : "receipt_long";

  return `
    <form id="form-expense" class="flex flex-col gap-4 font-body">
      <!-- Âmbito da Despesa: PF (Vida Pessoal) vs PJ (Trabalho/Clínica) -->
      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant">Âmbito da Vida Financeira</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="expense-scope-btn py-2 px-3 rounded-2xl text-[12px] font-bold text-center transition-all cursor-pointer ${scope === 'pf' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
            data-scope="pf"
          >
            ${renderIcon('person', 'text-[15px] inline mr-1')} Pessoa Física (PF)
          </button>
          <button
            type="button"
            class="expense-scope-btn py-2 px-3 rounded-2xl text-[12px] font-bold text-center transition-all cursor-pointer ${scope === 'pj' ? 'bg-secondary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
            data-scope="pj"
          >
            ${renderIcon('business', 'text-[15px] inline mr-1')} Pessoa Jurídica (PJ)
          </button>
        </div>
        <input type="hidden" id="input-expense-scope" value="${scope}" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[12px] font-bold text-on-surface-variant">Descrição da Despesa</label>
        <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-2 shadow-sm border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
          ${renderIcon('receipt', 'text-[20px] text-secondary')}
          <input
            type="text"
            id="input-expense-desc"
            class="w-full bg-transparent text-[14px] font-medium text-on-surface focus:outline-none"
            placeholder="Ex: Alimentação, Lazer, CRM, Sublocação..."
            value="${desc}"
            required
          />
        </div>
      </div>

      <!-- Categoria da Despesa com Custom Dropdown, Direct Typing & Quick Pills -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <label class="text-[12px] font-bold text-on-surface-variant flex items-center gap-1.5">
            ${renderIcon('category', 'text-[15px] text-secondary')}
            <span>Categoria da Despesa</span>
          </label>
          <button
            type="button"
            id="btn-quick-add-category"
            class="text-[11px] font-bold text-primary hover:text-secondary flex items-center gap-0.5 transition-all py-0.5 px-2 rounded-full hover:bg-primary-fixed/30 active:scale-95 cursor-pointer"
          >
            ${renderIcon('add', 'text-[13px]')} + Nova Categoria
          </button>
        </div>

        <!-- Quick Category Pills per scope (1-tap selection) -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 -mx-1 px-1 no-scrollbar" id="quick-category-pills-container">
          ${scopeCategories.map(c => `
            <button
              type="button"
              class="quick-category-pill py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${category === c ? 'bg-secondary text-white shadow-sm font-bold' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
              data-category="${c}"
            >
              ${c}
            </button>
          `).join("")}
          <button
            type="button"
            id="btn-pill-add-category"
            class="py-1 px-2.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-primary-fixed/50 text-primary hover:bg-primary-fixed flex items-center gap-0.5 transition-all active:scale-95 cursor-pointer"
          >
            ${renderIcon('add', 'text-[13px]')} Outra Categoria
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Chic Custom Category Selector & Direct Input -->
          <div class="flex flex-col gap-1 relative" id="category-selector-container">
            <label class="text-[11px] font-bold text-on-surface-variant flex items-center justify-between">
              <span>Selecionar ou Digitar</span>
              <span class="text-[10px] text-secondary font-medium" id="category-scope-label">${scope === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}</span>
            </label>

            <!-- Interactive Trigger Box -->
            <button
              type="button"
              id="btn-category-picker-trigger"
              class="category-picker-trigger h-11 px-3 flex items-center justify-between gap-2 shadow-xs cursor-pointer text-left w-full"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" id="category-display-icon-bg" style="background-color: ${categoryColor}25; color: ${categoryColor};">
                  <span id="category-display-icon">${renderIcon(categoryIcon, 'text-[14px]')}</span>
                </div>
                <span id="category-display-text" class="text-[13px] font-bold text-on-surface truncate">${category}</span>
              </div>
              <div class="flex items-center gap-1 shrink-0 text-on-surface-variant">
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${scope === 'pj' ? 'bg-mint-income-bg text-mint-income' : 'bg-lilac-light text-lilac-dark'}" id="category-display-badge">${scope.toUpperCase()}</span>
                <span id="category-chevron-icon" class="transition-transform duration-200">${renderIcon('expand_more', 'text-[18px] text-secondary')}</span>
              </div>
            </button>

            <!-- Native select (kept in DOM for accessibility, form serialization & backward compatibility) -->
            <select id="input-expense-category" class="hidden">
              <optgroup label="🌸 Pessoa Física (Vida Pessoal)">
                ${categoriesPF.map(c => `<option value="${c}" ${category === c ? 'selected' : ''}>${c}</option>`).join("")}
              </optgroup>
              <optgroup label="🩺 Pessoa Jurídica (Trabalho & Clínica)">
                ${categoriesPJ.map(c => `<option value="${c}" ${category === c ? 'selected' : ''}>${c}</option>`).join("")}
              </optgroup>
              ${!categoriesPF.includes(category) && !categoriesPJ.includes(category) ? `<option value="${category}" selected>${category}</option>` : ''}
              <option value="__new__" class="font-bold text-primary">+ Nova Categoria...</option>
            </select>

            <!-- Custom Category Dropdown Popover Menu (100% styled with Manrope & Stitch tokens) -->
            <div id="category-picker-menu" class="category-menu-popover hidden">
              <!-- Live Search & Direct Category Creator Input -->
              <div class="p-2 border-b border-purple-100 bg-surface-container-low/50">
                <div class="h-9 bg-white rounded-xl px-2.5 flex items-center gap-1.5 border border-purple-100 focus-within:border-secondary transition-all">
                  ${renderIcon('search', 'text-[16px] text-secondary')}
                  <input
                    type="text"
                    id="input-category-search"
                    placeholder="Digite qualquer categoria (ex: Contador, Lanches...)"
                    class="w-full bg-transparent text-[12px] font-semibold text-on-surface focus:outline-none placeholder:text-on-surface-variant/50"
                  />
                  <button type="button" id="btn-clear-cat-search" class="text-on-surface-variant/50 hover:text-on-surface hidden cursor-pointer">
                    ${renderIcon('close', 'text-[14px]')}
                  </button>
                </div>
                <!-- Dynamic "Use/Create Typed Category" button -->
                <button
                  type="button"
                  id="btn-use-typed-category"
                  class="hidden mt-1.5 w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  ${renderIcon('add_circle', 'text-[14px]')}
                  <span id="text-use-typed-category">Usar nova categoria</span>
                </button>
              </div>

              <!-- Scope filter toggle within menu -->
              <div class="flex items-center gap-1 p-1.5 border-b border-purple-50 bg-white text-[10.5px]">
                <button type="button" class="cat-menu-scope-tab flex-1 py-1 rounded-lg font-bold text-center transition-all bg-secondary text-white cursor-pointer" data-scope="all">Todas</button>
                <button type="button" class="cat-menu-scope-tab flex-1 py-1 rounded-lg font-bold text-center transition-all bg-surface-container-low text-on-surface-variant cursor-pointer" data-scope="pf">🌸 Pessoal</button>
                <button type="button" class="cat-menu-scope-tab flex-1 py-1 rounded-lg font-bold text-center transition-all bg-surface-container-low text-on-surface-variant cursor-pointer" data-scope="pj">🩺 Trabalho</button>
              </div>

              <!-- Category Items Scrollable List -->
              <div class="category-menu-list no-scrollbar" id="category-menu-items-list"></div>

              <!-- Footer Add Action -->
              <div class="p-2 border-t border-purple-100 bg-surface-container-low/40 flex items-center justify-between">
                <button
                  type="button"
                  id="btn-menu-add-category"
                  class="w-full py-1.5 px-2 rounded-xl text-primary hover:bg-primary-fixed/30 text-[11.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  ${renderIcon('add', 'text-[14px]')}
                  <span>+ Criar Categoria Personalizada</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Tipo: Fixa vs Variável -->
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-bold text-on-surface-variant">Tipo de Despesa</label>
            ${renderCustomSelectHTML({
              id: 'input-expense-type',
              value: type,
              options: [
                { value: 'fixed', label: 'Fixa (Recorrente)' },
                { value: 'variable', label: 'Variável (Avulsa)' }
              ],
              icon: 'repeat'
            })}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Valor -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Valor (R$)</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3.5 flex items-center gap-1 shadow-sm border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
            <span class="text-[13px] font-bold text-on-surface">R$</span>
            <input
              type="number"
              step="0.01"
              id="input-expense-value"
              class="w-full bg-transparent text-[16px] font-bold text-on-surface focus:outline-none font-display"
              placeholder="0.00"
              value="${val}"
              required
            />
          </div>
        </div>

        <!-- Data de Vencimento -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-on-surface-variant">Data de Vencimento</label>
          <div class="h-11 bg-surface-container-low rounded-2xl px-3 flex items-center gap-2 shadow-sm border border-transparent focus-within:border-primary focus-within:bg-white transition-all">
            ${renderIcon('calendar_today', 'text-[18px] text-primary')}
            <input
              type="date"
              id="input-expense-duedate"
              class="w-full bg-transparent text-[13px] text-on-surface focus:outline-none font-medium"
              value="${dueDate}"
              required
            />
          </div>
        </div>
      </div>

      <!-- Status inicial -->
      <div class="flex items-center gap-2 pt-1">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="input-expense-paid"
            class="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
            ${isPaid ? 'checked' : ''}
          />
          <span class="text-[13px] text-on-surface font-medium">Esta despesa já foi paga</span>
        </label>
      </div>

      <button
        type="submit"
        class="h-12 w-full rounded-full bg-gradient-to-r from-secondary-container via-secondary to-primary text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(253,78,135,0.35)] active:scale-[0.98] transition-all mt-2 cursor-pointer"
      >
        <span>${isEdit ? 'Atualizar Despesa' : 'Registrar Despesa'}</span>
        ${renderIcon('check', 'text-[18px]')}
      </button>
    </form>
  `;
}

function attachBottomSheetFormEvents() {
  const btnClose = document.getElementById("btn-close-sheet");
  if (btnClose) {
    btnClose.addEventListener("click", closeBottomSheet);
  }

  // Modal switcher buttons
  const modalTabBtns = document.querySelectorAll(".modal-tab-btn");
  modalTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      state.activeModalTab = tab;
      state.editingItem = null;
      renderBottomSheetContent();
    });
  });

  // Initialize all custom rounded dropdowns in bottom sheet
  attachCustomSelectEvents(dom.bottomSheet || document);

  // Shift form live recalculations, quick pills, tax slider, and custom date toggle
  const formShift = document.getElementById("form-shift");
  if (formShift) {
    const inputGross = document.getElementById("input-shift-gross");
    const inputNet = document.getElementById("input-shift-net");
    const inputDate = document.getElementById("input-shift-date");
    const inputType = document.getElementById("input-shift-type");
    const inputWorkType = document.getElementById("input-shift-work-type");
    const inputLag = document.getElementById("input-shift-lag");
    const inputCustomDate = document.getElementById("input-shift-custom-date");
    const btnToggleCustom = document.getElementById("btn-toggle-custom-date");
    const customDateContainer = document.getElementById("custom-date-container");
    const labelExpected = document.getElementById("label-expected-date");
    const inputTaxSlider = document.getElementById("input-shift-tax-slider");
    const inputTaxRate = document.getElementById("input-shift-tax-rate");
    const labelTaxSliderDisplay = document.getElementById("label-tax-slider-display");
    const labelDeduction = document.getElementById("label-tax-deduction-amount");
    const badgeHourly = document.getElementById("badge-live-hourly-rate");

    const updateInstallmentsPreview = () => {
      const net = parseFloat(inputNet ? inputNet.value : 0) || 0;
      const dateVal = (inputDate && inputDate.value) ? inputDate.value : getLocalDateString(state.referenceDate || new Date());
      const isCustomActive = customDateContainer && !customDateContainer.classList.contains("hidden");
      const customDateVal = (isCustomActive && inputCustomDate && inputCustomDate.value) ? inputCustomDate.value : null;

      const installments = calculateShiftInstallments(dateVal, net, customDateVal);
      const labelInst1Val = document.getElementById("label-install-1-val");
      const labelInst1Date = document.getElementById("label-install-1-date");
      const labelInst2Val = document.getElementById("label-install-2-val");
      const labelInst2Date = document.getElementById("label-install-2-date");

      if (installments && installments.length >= 2) {
        if (labelInst1Val) labelInst1Val.textContent = formatCurrency(installments[0].value);
        if (labelInst1Date) labelInst1Date.textContent = `Previsão: ${formatDateBR(installments[0].dueDate)}`;
        if (labelInst2Val) labelInst2Val.textContent = formatCurrency(installments[1].value);
        if (labelInst2Date) labelInst2Date.textContent = `Previsão: ${formatDateBR(installments[1].dueDate)}`;
      } else if (installments && installments.length === 1) {
        if (labelInst1Val) labelInst1Val.textContent = formatCurrency(installments[0].value);
        if (labelInst1Date) labelInst1Date.textContent = `Previsão: ${formatDateBR(installments[0].dueDate)}`;
        if (labelInst2Val) labelInst2Val.textContent = "R$ 0,00";
        if (labelInst2Date) labelInst2Date.textContent = "Data única manual";
      }

      const lagVal = Number(inputLag ? inputLag.value : 3) || 3;
      const expected = calculateExpectedPaymentDate(dateVal, lagVal, customDateVal);
      if (labelExpected) {
        labelExpected.textContent = customDateVal
          ? `${formatDateBR(expected)} (Manual)`
          : formatDateBR(expected);
      }
      updateHourlyRateBadge();
    };

    const updateHourlyRateBadge = () => {
      if (!badgeHourly || !inputNet || !inputType) return;
      const net = parseFloat(inputNet.value) || 0;
      const rate = calculateHourlyRate(net, inputType.value);
      badgeHourly.textContent = rate > 0 ? `R$ ${rate}/h` : 'R$/h';
      badgeHourly.className = rate >= 150 ? 'badge-rate-gold text-[9px] px-1.5 py-0.2' : 'badge-rate-mint text-[9px] px-1.5 py-0.2';
    };

    const recalcFromGross = () => {
      if (!inputGross || !inputNet) return;
      const gross = parseFloat(inputGross.value) || 0;
      const taxRate = parseFloat(inputTaxRate ? inputTaxRate.value : 6) || 0;
      const net = gross * (1 - taxRate / 100);
      inputNet.value = net > 0 ? net.toFixed(2) : "";
      const deduction = gross - net;
      if (labelDeduction) {
        labelDeduction.textContent = deduction > 0
          ? `Dedução: ${formatCurrency(deduction)} (${taxRate.toFixed(1)}%)`
          : 'Líquido em conta';
      }
      updateHourlyRateBadge();
      updateInstallmentsPreview();
    };

    const recalcFromNet = () => {
      if (!inputGross || !inputNet) return;
      const net = parseFloat(inputNet.value) || 0;
      const taxRate = parseFloat(inputTaxRate ? inputTaxRate.value : 6) || 0;
      if (taxRate < 100) {
        const gross = net / (1 - taxRate / 100);
        inputGross.value = gross > 0 ? gross.toFixed(2) : "";
        const deduction = gross - net;
        if (labelDeduction) {
          labelDeduction.textContent = deduction > 0
            ? `Dedução: ${formatCurrency(deduction)} (${taxRate.toFixed(1)}%)`
            : 'Líquido em conta';
        }
      }
      updateHourlyRateBadge();
      updateInstallmentsPreview();
    };

    // Initial badge and installments update
    updateHourlyRateBadge();
    updateInstallmentsPreview();

    // Tax slider volume control
    if (inputTaxSlider) {
      inputTaxSlider.addEventListener("input", () => {
        const rate = parseFloat(inputTaxSlider.value) || 6;
        if (inputTaxRate) inputTaxRate.value = rate;
        if (labelTaxSliderDisplay) labelTaxSliderDisplay.textContent = `${rate.toFixed(1)}%`;
        recalcFromGross();
      });
    }

    if (btnToggleCustom && customDateContainer) {
      btnToggleCustom.addEventListener("click", () => {
        const isHidden = customDateContainer.classList.contains("hidden");
        if (isHidden) {
          customDateContainer.classList.remove("hidden");
          btnToggleCustom.innerHTML = `${renderIcon("rule", "text-[14px]")} <span>Usar Regra 80/20 Padrão</span>`;
          if (inputCustomDate && !inputCustomDate.value) {
            inputCustomDate.value = calculateExpectedPaymentDate(inputDate.value || getLocalDateString(new Date()), 3);
          }
        } else {
          customDateContainer.classList.add("hidden");
          btnToggleCustom.innerHTML = `${renderIcon("tune", "text-[14px]")} <span>Data Manual Específica</span>`;
          if (inputCustomDate) inputCustomDate.value = "";
        }
        updateInstallmentsPreview();
      });
    }

    if (inputCustomDate) {
      inputCustomDate.addEventListener("change", updateInstallmentsPreview);
    }

    if (inputGross) {
      inputGross.addEventListener("input", recalcFromGross);
    }

    if (inputNet) {
      inputNet.addEventListener("input", recalcFromNet);
    }

    if (inputType) {
      inputType.addEventListener("change", updateHourlyRateBadge);
    }

    if (inputDate) inputDate.addEventListener("change", updateInstallmentsPreview);

    // Stitch Rounded Hospital Picker Interactions
    const inputHosp = document.getElementById("input-shift-hospital");
    const hospTrigger = document.getElementById("btn-hospital-picker-trigger");
    const hospMenu = document.getElementById("hospital-picker-menu");
    const hospSearchInput = document.getElementById("input-hospital-search");
    const btnClearHospSearch = document.getElementById("btn-clear-hospital-search");
    const btnUseTypedHosp = document.getElementById("btn-use-typed-hospital");
    const textUseTypedHosp = document.getElementById("text-use-typed-hospital");
    const hospDispText = document.getElementById("hospital-display-text");
    const hospChevron = document.getElementById("hospital-chevron-icon");

    const closeHospPicker = () => {
      if (hospMenu) {
        hospMenu.classList.add("hidden");
        hospMenu.classList.remove("dropup");
      }
      if (hospTrigger) hospTrigger.classList.remove("active");
      if (hospChevron) hospChevron.style.transform = "";
    };

    const openHospPicker = () => {
      if (!hospMenu) return;
      if (typeof window !== "undefined" && hospTrigger && hospTrigger.getBoundingClientRect) {
        const triggerRect = hospTrigger.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const spaceBelowViewport = vh - triggerRect.bottom;
        const spaceAboveViewport = triggerRect.top;
        const scrollParent = hospTrigger.closest(".bottom-sheet, .dialog-box, [role='dialog']");
        let shouldDropUp = false;
        if (scrollParent && scrollParent.getBoundingClientRect) {
          const parentRect = scrollParent.getBoundingClientRect();
          const spaceBelowParent = parentRect.bottom - triggerRect.bottom;
          const spaceAboveParent = triggerRect.top - parentRect.top;
          if (spaceBelowParent < 220 && spaceAboveParent > spaceBelowParent) {
            shouldDropUp = true;
          } else if (spaceBelowViewport < 240 && spaceAboveViewport > spaceBelowViewport) {
            shouldDropUp = true;
          }
        } else if (spaceBelowViewport < 240 && spaceAboveViewport > spaceBelowViewport) {
          shouldDropUp = true;
        }
        hospMenu.classList.toggle("dropup", shouldDropUp);
      }
      hospMenu.classList.remove("hidden");
      if (hospTrigger) hospTrigger.classList.add("active");
      if (hospChevron) hospChevron.style.transform = "rotate(180deg)";
      renderHospitalList(hospSearchInput ? hospSearchInput.value : "");
      setTimeout(() => {
        hospSearchInput?.focus();
        if (hospMenu && hospMenu.scrollIntoView) {
          hospMenu.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }, 60);
    };

    const setChosenHospital = (name) => {
      if (!name) return;
      const clean = name.trim();
      if (!clean) return;
      if (inputHosp) {
        inputHosp.value = clean;
        inputHosp.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (hospDispText) hospDispText.textContent = clean;

      // Update pills
      document.querySelectorAll(".quick-hospital-pill").forEach(p => {
        const isMatch = p.getAttribute("data-hospital") === clean;
        p.classList.toggle("bg-secondary-fixed", isMatch);
        p.classList.toggle("text-on-secondary-fixed-variant", isMatch);
        p.classList.toggle("shadow-sm", isMatch);
        p.classList.toggle("bg-surface-container-low", !isMatch);
        p.classList.toggle("text-on-surface-variant", !isMatch);
      });

      closeHospPicker();
      spawnPediatricParticles(null, null, 4, 'hearts');
    };

    const renderHospitalList = (query = "") => {
      const listEl = document.getElementById("hospital-menu-items-list");
      if (!listEl) return;
      const q = query.trim().toLowerCase();
      const current = (inputHosp ? inputHosp.value : "").toLowerCase();
      let locations = state.store.getWorkLocations ? state.store.getWorkLocations() : [];

      if (q) {
        locations = locations.filter(l => l.toLowerCase().includes(q));
      }

      if (btnUseTypedHosp && textUseTypedHosp) {
        const exact = locations.some(l => l.toLowerCase() === q);
        if (q && !exact) {
          textUseTypedHosp.textContent = `Usar "${query.trim()}" (Adicionar local)`;
          btnUseTypedHosp.classList.remove("hidden");
        } else {
          btnUseTypedHosp.classList.add("hidden");
        }
      }

      if (locations.length === 0) {
        listEl.innerHTML = `
          <div class="p-3 text-center text-[12px] text-on-surface-variant italic">
            Nenhum local encontrado. Toque no botão acima para cadastrar.
          </div>
        `;
        return;
      }

      listEl.innerHTML = locations.map(loc => {
        const isSel = loc.toLowerCase() === current;
        return `
          <div class="custom-select-item hospital-menu-item flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors ${isSel ? 'active' : ''}" data-hospital="${loc}">
            <div class="flex items-center gap-2 truncate">
              <span class="text-secondary text-[15px]">${renderIcon('local_hospital', 'text-[15px]')}</span>
              <span class="text-[12.5px] font-semibold text-on-surface truncate">${loc}</span>
            </div>
            ${isSel ? `<span class="text-secondary font-bold shrink-0">${renderIcon('check', 'text-[15px]')}</span>` : ''}
          </div>
        `;
      }).join("");

      listEl.querySelectorAll(".hospital-menu-item").forEach(item => {
        item.addEventListener("click", () => {
          setChosenHospital(item.getAttribute("data-hospital"));
        });
      });
    };

    if (hospTrigger) {
      hospTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isClosed = hospMenu && hospMenu.classList.contains("hidden");
        if (isClosed) openHospPicker();
        else closeHospPicker();
      });
    }

    if (hospSearchInput) {
      hospSearchInput.addEventListener("input", (e) => {
        const val = e.target.value;
        if (btnClearHospSearch) btnClearHospSearch.classList.toggle("hidden", !val);
        renderHospitalList(val);
      });
    }

    if (btnClearHospSearch) {
      btnClearHospSearch.addEventListener("click", () => {
        if (hospSearchInput) hospSearchInput.value = "";
        btnClearHospSearch.classList.add("hidden");
        renderHospitalList("");
        hospSearchInput?.focus();
      });
    }

    if (btnUseTypedHosp) {
      btnUseTypedHosp.addEventListener("click", () => {
        const val = hospSearchInput ? hospSearchInput.value.trim() : "";
        if (val) {
          state.store.addWorkLocation(val);
          setChosenHospital(val);
        }
      });
    }

    // Quick hospital pills
    document.querySelectorAll(".quick-hospital-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const hosp = pill.getAttribute("data-hospital");
        setChosenHospital(hosp);
      });
    });

    // Quick add custom hospital without wiping form inputs
    const btnAddHospPill = document.querySelector(".quick-add-hospital-pill");
    if (btnAddHospPill) {
      btnAddHospPill.addEventListener("click", () => {
        const name = prompt("Digite o nome da maternidade ou local de trabalho:");
        if (name && name.trim()) {
          const cleanName = name.trim();
          state.store.addWorkLocation(cleanName);
          setChosenHospital(cleanName);

          // Dynamically insert new active pill before the "+ Outro Local" button
          const newPill = document.createElement("button");
          newPill.type = "button";
          newPill.className = "quick-hospital-pill py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm";
          newPill.setAttribute("data-hospital", cleanName);
          newPill.textContent = cleanName.length > 20 ? cleanName.slice(0, 18) + '...' : cleanName;
          newPill.addEventListener("click", () => {
            setChosenHospital(cleanName);
          });

          if (btnAddHospPill.parentNode) {
            btnAddHospPill.parentNode.insertBefore(newPill, btnAddHospPill);
          }
          showToast(`Local "${cleanName}" cadastrado com sucesso! 🏥`);
        }
      });
    }

    formShift.addEventListener("submit", (e) => {
      e.preventDefault();
      const hospital = document.getElementById("input-shift-hospital").value.trim();
      const shiftDate = document.getElementById("input-shift-date").value;
      const shiftType = document.getElementById("input-shift-type").value;
      const workType = document.getElementById("input-shift-work-type")?.value || "Plantão em Maternidade";
      const sector = document.getElementById("input-shift-sector")?.value || "UTI Neonatal";
      const taxRate = parseFloat(document.getElementById("input-shift-tax-rate")?.value) || 6;
      const taxRegime = `${taxRate}% Personalizado`;
      const notes = document.getElementById("input-shift-notes")?.value.trim() || "";
      const grossValue = parseFloat(document.getElementById("input-shift-gross").value) || 0;
      const netValue = parseFloat(document.getElementById("input-shift-net").value) || (grossValue * (1 - taxRate / 100));
      const paymentLagMonths = 3;
      const isCustomActive = customDateContainer && !customDateContainer.classList.contains("hidden");
      const customPaymentDate = (isCustomActive && inputCustomDate && inputCustomDate.value) ? inputCustomDate.value : null;

      if (!hospital || !shiftDate) {
        showToast("Por favor, preencha o hospital e a data do plantão.", "warning");
        return;
      }

      const shiftPayload = {
        hospital,
        shiftDate,
        shiftType,
        workType,
        sector,
        taxRegime,
        taxRate,
        notes,
        grossValue,
        netValue,
        paymentLagMonths,
        customPaymentDate,
        splitPayment: !customPaymentDate
      };

      const isEdit = Boolean(state.editingItem && (state.editingItem.type === "shift" || state.editingItem.type === "plantao") && state.editingItem.data && state.editingItem.data.id);

      if (isEdit) {
        state.store.updateShift(state.editingItem.data.id, shiftPayload);
        showToast(`Plantão do ${hospital} atualizado! 🌸`);
      } else {
        state.store.addShift(shiftPayload);
        showToast(`Plantão do ${hospital} salvo no radar! 🌸`);
      }

      closeBottomSheet();
      renderCurrentView();

      // Pediatric visual reaction: baby smiling + hearts
      showBabyReaction({
        type: 'income',
        title: isEdit ? 'Plantão Atualizado! 👶💖' : 'Plantão Salvo no Radar! 👶💖',
        message: 'Previsão de recebimento calculada: 80% em 60 dias (D+60) e 20% em 90 dias (D+90)!',
        amount: netValue
      });
    });
  }

  // Voice Recognition Button in bottom sheet header
  const btnVoiceSheet = document.getElementById("btn-voice-log-sheet");
  if (btnVoiceSheet) {
    btnVoiceSheet.addEventListener("click", () => {
      startVoiceLogging();
    });
  }

  // Consultation Form submit & live hourly recalculation
  const formConsultation = document.getElementById("form-consultation");
  if (formConsultation) {
    const inputVal = document.getElementById("input-consultation-value");
    const inputDur = document.getElementById("input-consultation-duration");
    const labelHourly = document.getElementById("label-live-consultation-hourly");

    const updateHourly = () => {
      const v = parseFloat(inputVal?.value || 0) || 0;
      const d = parseInt(inputDur?.value || 60, 10) || 60;
      const rate = Math.round(v / (d / 60));
      if (labelHourly) labelHourly.textContent = `R$ ${rate}/h`;
    };

    if (inputVal) inputVal.addEventListener("input", updateHourly);
    if (inputDur) inputDur.addEventListener("change", updateHourly);

    formConsultation.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("input-consultation-id")?.value;
      const patientName = document.getElementById("input-consultation-patient").value.trim();
      const consultationType = document.getElementById("input-consultation-type").value;
      const puericulturaMonth = document.getElementById("input-consultation-puericultura-month").value;
      const date = document.getElementById("input-consultation-date").value;
      const durationMinutes = parseInt(document.getElementById("input-consultation-duration").value, 10) || 60;
      const value = parseFloat(document.getElementById("input-consultation-value").value) || 0;
      const paymentMethod = document.getElementById("input-consultation-payment-method").value;
      const paid = document.getElementById("input-consultation-paid").checked;
      const notes = document.getElementById("input-consultation-notes").value.trim();
      const isPackage = consultationType === "Pacote Puericultura Anual";

      if (!patientName || !date || value <= 0) {
        showToast("Preencha o nome do paciente, data e valor válido.", "warning");
        return;
      }

      const payload = {
        patientName,
        consultationType,
        puericulturaMonth,
        isPackage,
        date,
        durationMinutes,
        value,
        paymentMethod,
        paid,
        notes
      };

      if (id) {
        state.store.updateConsultation(id, payload);
        showToast(`Atendimento de ${patientName} atualizado! 🩺`);
      } else {
        state.store.addConsultation(payload);
        showToast(`Consulta de ${patientName} salva! 🩺`);
      }

      closeBottomSheet();
      renderCurrentView();

      showBabyReaction({
        type: 'income',
        title: id ? 'Consulta Atualizada! 👶🩺' : 'Consulta Registrada! 👶🩺',
        message: `Honorário de R$ ${value.toFixed(2)} registrado com sucesso!`,
        amount: value
      });
    });
  }

  // Salary form submit (upserts existing salary avoiding duplicates)
  const formSalary = document.getElementById("form-salary");
  if (formSalary) {
    formSalary.addEventListener("submit", (e) => {
      e.preventDefault();
      const salaryId = document.getElementById("input-salary-id")?.value;
      const description = document.getElementById("input-salary-desc").value.trim();
      const value = parseFloat(document.getElementById("input-salary-value").value) || 0;
      const dayOfMonth = parseInt(document.getElementById("input-salary-day").value, 10) || 5;

      if (!description || value <= 0) {
        showToast("Preencha a descrição e um valor válido.", "warning");
        return;
      }

      state.store.upsertFixedSalary({ id: salaryId || undefined, description, value, dayOfMonth });
      showToast(`Salário fixo '${description}' salvo com sucesso! 💼`);
      closeBottomSheet();
      renderCurrentView();

      showBabyReaction({
        type: 'income',
        title: 'Salário Fixo Salvo! 👶💖',
        message: 'Renda fixa mensal contabilizada no seu planejamento financeiro.',
        amount: value
      });
    });
  }

  // Expense form submit & PF/PJ scope toggles & custom categories
  const formExpense = document.getElementById("form-expense");
  if (formExpense) {
    const inputScope = document.getElementById("input-expense-scope");
    const inputCat = document.getElementById("input-expense-category");
    const pickerTrigger = document.getElementById("btn-category-picker-trigger");
    const pickerMenu = document.getElementById("category-picker-menu");
    const catSearchInput = document.getElementById("input-category-search");
    const btnClearSearch = document.getElementById("btn-clear-cat-search");
    const btnUseTyped = document.getElementById("btn-use-typed-category");
    const textUseTyped = document.getElementById("text-use-typed-category");
    let activeMenuScope = "all";

    const closeCategoryPicker = () => {
      if (pickerMenu) {
        pickerMenu.classList.add("hidden");
        pickerMenu.classList.remove("dropup");
      }
      if (pickerTrigger) pickerTrigger.classList.remove("active");
    };

    const openCategoryPicker = () => {
      if (!pickerMenu) return;
      if (typeof window !== "undefined" && pickerTrigger && pickerTrigger.getBoundingClientRect) {
        const triggerRect = pickerTrigger.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const spaceBelowViewport = vh - triggerRect.bottom;
        const spaceAboveViewport = triggerRect.top;
        const scrollParent = pickerTrigger.closest(".bottom-sheet, .dialog-box, [role='dialog']");
        let shouldDropUp = false;
        if (scrollParent && scrollParent.getBoundingClientRect) {
          const parentRect = scrollParent.getBoundingClientRect();
          const spaceBelowParent = parentRect.bottom - triggerRect.bottom;
          const spaceAboveParent = triggerRect.top - parentRect.top;
          if (spaceBelowParent < 220 && spaceAboveParent > spaceBelowParent) {
            shouldDropUp = true;
          } else if (spaceBelowViewport < 240 && spaceAboveViewport > spaceBelowViewport) {
            shouldDropUp = true;
          }
        } else if (spaceBelowViewport < 240 && spaceAboveViewport > spaceBelowViewport) {
          shouldDropUp = true;
        }
        pickerMenu.classList.toggle("dropup", shouldDropUp);
      }
      pickerMenu.classList.remove("hidden");
      if (pickerTrigger) pickerTrigger.classList.add("active");
      renderCategoryList(catSearchInput ? catSearchInput.value : "", activeMenuScope);
      setTimeout(() => {
        catSearchInput?.focus();
        if (pickerMenu && pickerMenu.scrollIntoView) {
          pickerMenu.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }, 60);
    };

    const setSelectedCategory = (chosenCat) => {
      if (!chosenCat) return;
      const trimmed = chosenCat.trim();
      if (!trimmed || trimmed === "__new__") return;
      const catScope = state.store.getCategoryScope ? state.store.getCategoryScope(trimmed) : getCategoryScope(trimmed);
      const catColor = state.store.getCategoryColor ? state.store.getCategoryColor(trimmed) : "#B80F55";
      const catIcon = state.store.getCategoryIcon ? state.store.getCategoryIcon(trimmed) : "receipt_long";

      // Ensure option exists in native select for form serialization
      if (inputCat) {
        let opt = Array.from(inputCat.options).find(o => o.value.toLowerCase() === trimmed.toLowerCase());
        if (!opt) {
          opt = new Option(trimmed, trimmed, true, true);
          inputCat.add(opt);
        }
        inputCat.value = opt.value;
      }

      // Update trigger display
      const dispText = document.getElementById("category-display-text");
      const dispIcon = document.getElementById("category-display-icon");
      const dispIconBg = document.getElementById("category-display-icon-bg");
      const dispBadge = document.getElementById("category-display-badge");
      const scopeLabel = document.getElementById("category-scope-label");

      if (dispText) dispText.textContent = trimmed;
      if (dispIcon) dispIcon.innerHTML = renderIcon(catIcon, 'text-[14px]');
      if (dispIconBg) {
        dispIconBg.style.backgroundColor = catColor + '25';
        dispIconBg.style.color = catColor;
      }
      if (dispBadge) {
        dispBadge.textContent = catScope.toUpperCase();
        dispBadge.className = `text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${catScope === 'pj' ? 'bg-mint-income-bg text-mint-income' : 'bg-lilac-light text-lilac-dark'}`;
      }
      if (scopeLabel) {
        scopeLabel.textContent = catScope === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física';
      }

      // Auto-sync scope hidden input and scope buttons
      if (inputScope) inputScope.value = catScope;
      document.querySelectorAll(".expense-scope-btn").forEach(b => {
        const s = b.getAttribute("data-scope");
        if (s === catScope) {
          b.classList.add("bg-secondary", "text-white", "shadow-sm");
          b.classList.remove("bg-surface-container-low", "text-on-surface-variant");
        } else {
          b.classList.remove("bg-secondary", "text-white", "shadow-sm");
          b.classList.add("bg-surface-container-low", "text-on-surface-variant");
        }
      });

      refreshQuickPills(catScope, trimmed);
      closeCategoryPicker();
    };

    const renderCategoryList = (query = "", filterScope = "all") => {
      const listEl = document.getElementById("category-menu-items-list");
      if (!listEl) return;
      const currentVal = (inputCat ? inputCat.value : "").toLowerCase();
      const pfList = state.store.getExpenseCategories ? state.store.getExpenseCategories("pf") : EXPENSE_CATEGORIES_PF;
      const pjList = state.store.getExpenseCategories ? state.store.getExpenseCategories("pj") : EXPENSE_CATEGORIES_PJ;

      let items = [];
      if (filterScope === "pf" || filterScope === "all") {
        pfList.forEach(name => items.push({ name, scope: "pf" }));
      }
      if (filterScope === "pj" || filterScope === "all") {
        pjList.forEach(name => {
          if (!items.find(i => i.name.toLowerCase() === name.toLowerCase())) {
            items.push({ name, scope: "pj" });
          }
        });
      }

      const q = query.trim().toLowerCase();
      if (q) {
        items = items.filter(i => i.name.toLowerCase().includes(q));
      }

      // Update button to use typed category
      if (btnUseTyped && textUseTyped) {
        const exactMatch = items.some(i => i.name.toLowerCase() === q);
        if (q && !exactMatch) {
          textUseTyped.textContent = `Usar categoria "${query.trim()}" (Criar nova)`;
          btnUseTyped.classList.remove("hidden");
        } else {
          btnUseTyped.classList.add("hidden");
        }
      }

      if (items.length === 0) {
        listEl.innerHTML = `
          <div class="py-4 px-3 text-center text-[12px] text-on-surface-variant">
            Nenhuma categoria padrão com "<span class="font-bold text-secondary">${query}</span>".<br/>
            <span class="text-primary font-semibold">Clique no botão acima para criar e usar "${query}"! ✨</span>
          </div>
        `;
        return;
      }

      listEl.innerHTML = items.map(i => {
        const isSelected = currentVal === i.name.toLowerCase();
        const color = state.store.getCategoryColor ? state.store.getCategoryColor(i.name) : "#B80F55";
        const icon = state.store.getCategoryIcon ? state.store.getCategoryIcon(i.name) : "receipt_long";
        return `
          <div
            class="category-menu-item ${isSelected ? 'active' : ''}"
            data-category="${i.name}"
            data-scope="${i.scope}"
          >
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="background-color: ${color}20; color: ${color};">
                ${renderIcon(icon, 'text-[14px]')}
              </div>
              <span class="font-bold text-[12.5px] truncate">${i.name}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${i.scope === 'pj' ? 'bg-mint-income-bg text-mint-income' : 'bg-lilac-light text-lilac-dark'}">${i.scope.toUpperCase()}</span>
              ${isSelected ? renderIcon('check', 'text-[16px] text-secondary') : ''}
            </div>
          </div>
        `;
      }).join("");

      listEl.querySelectorAll(".category-menu-item").forEach(item => {
        item.addEventListener("click", () => {
          const chosen = item.getAttribute("data-category");
          setSelectedCategory(chosen);
        });
      });
    };

    const attachPillEvents = () => {
      document.querySelectorAll(".quick-category-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          const chosenCat = pill.getAttribute("data-category");
          setSelectedCategory(chosenCat);
        });
      });

      document.getElementById("btn-pill-add-category")?.addEventListener("click", triggerAddCategoryFlow);
    };

    const refreshQuickPills = (targetScope, activeCategory) => {
      const pillsContainer = document.getElementById("quick-category-pills-container");
      if (!pillsContainer) return;
      const currentCat = activeCategory || (inputCat ? inputCat.value : "");
      const categories = state.store.getExpenseCategories ? state.store.getExpenseCategories(targetScope) : (targetScope === "pj" ? EXPENSE_CATEGORIES_PJ : EXPENSE_CATEGORIES_PF);

      pillsContainer.innerHTML = `
        ${categories.map(c => `
          <button
            type="button"
            class="quick-category-pill py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${currentCat === c ? 'bg-secondary text-white shadow-sm font-bold' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}"
            data-category="${c}"
          >
            ${c}
          </button>
        `).join("")}
        <button
          type="button"
          id="btn-pill-add-category"
          class="py-1 px-2.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-primary-fixed/50 text-primary hover:bg-primary-fixed flex items-center gap-0.5 transition-all active:scale-95 cursor-pointer"
        >
          ${renderIcon('add', 'text-[13px]')} Outra Categoria
        </button>
      `;

      attachPillEvents();
    };

    const triggerAddCategoryFlow = () => {
      const curScope = inputScope ? inputScope.value : "pf";
      openCategoryModal({
        mode: "add",
        initialData: { scope: curScope },
        onSave: ({ name, scope }) => {
          state.store.addExpenseCategory({ name, scope });
          setSelectedCategory(name);
          showToast(`Categoria '${name}' adicionada com sucesso! ✨`);
        },
        onCancel: () => {}
      });
    };

    // Category Trigger Toggle
    pickerTrigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (pickerMenu && !pickerMenu.classList.contains("hidden")) {
        closeCategoryPicker();
      } else {
        openCategoryPicker();
      }
    });

    // Close when clicking outside category selector
    document.addEventListener("click", (e) => {
      const selectorContainer = document.getElementById("category-selector-container");
      if (selectorContainer && !selectorContainer.contains(e.target)) {
        closeCategoryPicker();
      }
    });

    // Live search input
    catSearchInput?.addEventListener("input", () => {
      const q = catSearchInput.value;
      if (btnClearSearch) {
        if (q.trim()) btnClearSearch.classList.remove("hidden");
        else btnClearSearch.classList.add("hidden");
      }
      renderCategoryList(q, activeMenuScope);
    });

    btnClearSearch?.addEventListener("click", () => {
      if (catSearchInput) {
        catSearchInput.value = "";
        catSearchInput.focus();
      }
      btnClearSearch.classList.add("hidden");
      renderCategoryList("", activeMenuScope);
    });

    btnUseTyped?.addEventListener("click", () => {
      const q = catSearchInput ? catSearchInput.value.trim() : "";
      if (q) {
        const curScope = inputScope ? inputScope.value : "pf";
        const detectedScope = state.store.getCategoryScope ? state.store.getCategoryScope(q) : curScope;
        state.store.addExpenseCategory({ name: q, scope: detectedScope });
        setSelectedCategory(q);
        showToast(`Categoria '${q}' criada e selecionada! ✨`);
      }
    });

    catSearchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const q = catSearchInput.value.trim();
        if (q) {
          const curScope = inputScope ? inputScope.value : "pf";
          const detectedScope = state.store.getCategoryScope ? state.store.getCategoryScope(q) : curScope;
          state.store.addExpenseCategory({ name: q, scope: detectedScope });
          setSelectedCategory(q);
          showToast(`Categoria '${q}' selecionada! ✨`);
        }
      }
    });

    // Scope tabs inside menu
    document.querySelectorAll(".cat-menu-scope-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.stopPropagation();
        activeMenuScope = tab.getAttribute("data-scope") || "all";
        document.querySelectorAll(".cat-menu-scope-tab").forEach(t => {
          t.classList.remove("bg-secondary", "text-white");
          t.classList.add("bg-surface-container-low", "text-on-surface-variant");
        });
        tab.classList.add("bg-secondary", "text-white");
        tab.classList.remove("bg-surface-container-low", "text-on-surface-variant");
        renderCategoryList(catSearchInput ? catSearchInput.value : "", activeMenuScope);
      });
    });

    document.getElementById("btn-menu-add-category")?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeCategoryPicker();
      triggerAddCategoryFlow();
    });

    attachPillEvents();
    document.getElementById("btn-quick-add-category")?.addEventListener("click", triggerAddCategoryFlow);

    // Scope buttons
    document.querySelectorAll(".expense-scope-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const scope = btn.getAttribute("data-scope");
        if (inputScope) inputScope.value = scope;
        document.querySelectorAll(".expense-scope-btn").forEach(b => {
          b.classList.remove("bg-secondary", "text-white", "shadow-sm");
          b.classList.add("bg-surface-container-low", "text-on-surface-variant");
        });
        btn.classList.add("bg-secondary", "text-white", "shadow-sm");
        btn.classList.remove("bg-surface-container-low", "text-on-surface-variant");

        // Update scope label
        const scopeLabel = document.getElementById("category-scope-label");
        if (scopeLabel) {
          scopeLabel.textContent = scope === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física';
        }

        // Auto align category if current is in other scope
        const currentCat = inputCat ? inputCat.value : "";
        const currentCatScope = state.store.getCategoryScope ? state.store.getCategoryScope(currentCat) : getCategoryScope(currentCat);
        let nextCat = currentCat;
        if (currentCatScope !== scope) {
          const scopeList = state.store.getExpenseCategories ? state.store.getExpenseCategories(scope) : (scope === "pj" ? EXPENSE_CATEGORIES_PJ : EXPENSE_CATEGORIES_PF);
          nextCat = scopeList[0] || (scope === "pj" ? "Consultório/Sublocação" : "Alimentação");
          setSelectedCategory(nextCat);
        } else {
          refreshQuickPills(scope, currentCat);
        }
      });
    });

    // Auto sync scope if user chooses category from another optgroup in native select
    if (inputCat) {
      inputCat.addEventListener("change", () => {
        const cat = inputCat.value;
        if (cat === "__new__") {
          triggerAddCategoryFlow();
          return;
        }
        setSelectedCategory(cat);
      });
    }

    formExpense.addEventListener("submit", (e) => {
      e.preventDefault();
      const description = document.getElementById("input-expense-desc").value.trim();
      let category = document.getElementById("input-expense-category").value;
      const type = document.getElementById("input-expense-type").value;
      const scope = document.getElementById("input-expense-scope")?.value || (state.store.getCategoryScope ? state.store.getCategoryScope(category) : getCategoryScope(category));
      const value = parseFloat(document.getElementById("input-expense-value").value) || 0;
      const dueDate = document.getElementById("input-expense-duedate").value;
      const isPaid = document.getElementById("input-expense-paid").checked;

      // If user typed a category into search input but didn't click apply
      const pendingTyped = catSearchInput ? catSearchInput.value.trim() : "";
      if (pendingTyped && (!category || category === "__new__" || category === "Alimentação" || category === "Lazer")) {
        category = pendingTyped;
        state.store.addExpenseCategory({ name: category, scope });
      }

      if (!description || value <= 0 || !dueDate) {
        showToast("Preencha todos os campos obrigatórios da despesa.", "warning");
        return;
      }

      if (category === "__new__" || !category) {
        showToast("Selecione ou crie uma categoria válida.", "warning");
        return;
      }

      const isEdit = Boolean(state.editingItem && (state.editingItem.type === "despesa" || state.editingItem.type === "expense") && state.editingItem.data && state.editingItem.data.id);

      if (isEdit) {
        state.store.updateExpense(state.editingItem.data.id, {
          description,
          category,
          type,
          scope,
          value,
          dueDate,
          isPaid
        });
        showToast(`Despesa '${description}' atualizada! 🧾`);
      } else {
        state.store.addExpense({
          description,
          category,
          type,
          scope,
          value,
          dueDate,
          isPaid
        });
        showToast(`Despesa '${description}' registrada com sucesso! 🧾`);
      }

      closeBottomSheet();
      renderCurrentView();

      // Pediatric visual reaction: subtle, delicate & caring feedback
      showBabyReaction({
        type: 'expense',
        title: isEdit ? 'Despesa Atualizada! 🍼✨' : 'Despesa Registrada! 🍼✨',
        message: 'Tudo anotado e sob controle! Suas finanças protegidas com carinho pediátrico.',
        amount: value
      });
    });
  }
}

function initTouchGestures() {
  const sheet = dom.bottomSheet;
  if (!sheet) return;

  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  sheet.addEventListener("touchstart", (e) => {
    const handle = e.target.closest(".sheet-handle");
    if (handle || sheet.scrollTop <= 0) {
      startY = e.touches[0].clientY;
      isDragging = true;
    }
  }, { passive: true });

  sheet.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY > 0) {
      sheet.style.transform = `translate(-50%, ${deltaY}px)`;
      sheet.style.transition = "none";
    }
  }, { passive: true });

  sheet.addEventListener("touchend", () => {
    if (!isDragging) return;
    isDragging = false;
    const deltaY = currentY - startY;
    sheet.style.transition = "";
    if (deltaY > 120) {
      sheet.style.transform = "";
      closeBottomSheet();
    } else {
      sheet.style.transform = "";
    }
    startY = 0;
    currentY = 0;
  });
}

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------

function initApp() {
  try {
    initDOM();
    if (typeof initIconSystem === "function") {
      initIconSystem();
    }
    initTouchGestures();
    initThemeSystem();
    initSpotlightSearch();
    checkOnboarding();

    // Privacy Mode (Modo Sigilo) setup & event
    if (state.privacyMode && typeof document !== "undefined" && document.body) {
      document.body.classList.add("privacy-active");
    }
    updatePrivacyButtonUI();

    if (dom.btnTogglePrivacy) {
      dom.btnTogglePrivacy.addEventListener("click", togglePrivacyMode);
    }

    // Navigation tab clicks
    dom.navTabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const tabId = tab.getAttribute("data-tab");
        switchTab(tabId);
      });
    });

    // Month navigation
    if (dom.btnPrevMonth) dom.btnPrevMonth.addEventListener("click", () => changeMonth(-1));
    if (dom.btnNextMonth) dom.btnNextMonth.addEventListener("click", () => changeMonth(1));

    // Quick Month Picker Modal
    if (dom.btnOpenMonthPicker) {
      dom.btnOpenMonthPicker.addEventListener("click", openQuickMonthPickerDialog);
    }

    // Notifications Bell Dialog
    if (dom.btnNotifications) {
      dom.btnNotifications.addEventListener("click", () => {
        closeHamburgerDrawer();
        openNotificationsDialog();
      });
    }

    // Doctor Profile & Goals Dialog
    if (dom.btnProfile) {
      dom.btnProfile.addEventListener("click", openDoctorProfileDialog);
    }

    // Install App Dialog (PWA)
    if (dom.btnInstallApp) {
      dom.btnInstallApp.addEventListener("click", () => {
        closeHamburgerDrawer();
        openPwaInstallDialog();
      });
    }

    // Hamburger Menu & Lateral Drawer
    if (dom.btnHamburger) {
      dom.btnHamburger.addEventListener("click", openHamburgerDrawer);
    }
    if (dom.btnCloseDrawer) {
      dom.btnCloseDrawer.addEventListener("click", closeHamburgerDrawer);
    }
    if (dom.hamburgerDrawerOverlay) {
      dom.hamburgerDrawerOverlay.addEventListener("click", closeHamburgerDrawer);
    }

    // Drawer Doctor Photo
    if (dom.btnDrawerUploadPhoto) {
      dom.btnDrawerUploadPhoto.addEventListener("click", () => {
        dom.inputDoctorPhoto?.click();
      });
    }
    if (dom.inputDoctorPhoto) {
      dom.inputDoctorPhoto.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          handleDoctorPhotoFileSelect(e.target.files[0]);
        }
      });
    }
    if (dom.btnDrawerRemovePhoto) {
      dom.btnDrawerRemovePhoto.addEventListener("click", () => {
        setDoctorPhoto(null);
        showToast("Foto da médica removida", "info");
      });
    }
    if (dom.btnDrawerEditProfile) {
      dom.btnDrawerEditProfile.addEventListener("click", () => {
        closeHamburgerDrawer();
        openDoctorProfileDialog();
      });
    }
    if (dom.btnDrawerLegal) {
      dom.btnDrawerLegal.addEventListener("click", () => {
        closeHamburgerDrawer();
        openLegalComplianceModal();
      });
    }

    // Drawer Shortcuts
    document.getElementById("drawer-shortcut-dre")?.addEventListener("click", () => {
      closeHamburgerDrawer();
      openDREDialog();
    });
    document.getElementById("drawer-shortcut-reconcile")?.addEventListener("click", () => {
      closeHamburgerDrawer();
      openReconciliationDialog();
    });
    document.getElementById("drawer-shortcut-contador")?.addEventListener("click", () => {
      closeHamburgerDrawer();
      openAccountantKitDialog();
    });
    document.getElementById("drawer-shortcut-sbar")?.addEventListener("click", () => {
      closeHamburgerDrawer();
      openSBARDialog();
    });
    document.getElementById("drawer-shortcut-fire")?.addEventListener("click", () => {
      closeHamburgerDrawer();
      openFIREDialog();
    });
    document.getElementById("drawer-shortcut-trash")?.addEventListener("click", () => {
      closeHamburgerDrawer();
      openTrashDialog();
    });

    // Dialog overlay dismiss
    if (dom.dialogOverlay) {
      dom.dialogOverlay.addEventListener("click", closeDialog);
    }

    // FAB Modal
    if (dom.fabBtn) {
      dom.fabBtn.addEventListener("click", (e) => {
        spawnPediatricParticles(e, 'hearts');
        openBottomSheet("plantao");
      });
    }

    // Light dismiss on bottom sheet overlay click
    if (dom.modalOverlay) {
      dom.modalOverlay.addEventListener("click", closeBottomSheet);
    }

    // Keyboard Escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (dom.hamburgerDrawer && dom.hamburgerDrawer.classList.contains("active")) {
          closeHamburgerDrawer();
        } else if (dom.spotlightOverlay && dom.spotlightOverlay.classList.contains("active")) {
          closeSpotlightSearch();
        } else if (dom.dialogContainer && dom.dialogContainer.classList.contains("active")) {
          closeDialog();
        } else if (dom.bottomSheet && dom.bottomSheet.classList.contains("active")) {
          closeBottomSheet();
        }
      }
    });

    // Frame width toggle (Mobile preview vs Expanded)
    if (dom.btnToggleFrame) {
      dom.btnToggleFrame.addEventListener("click", () => {
        state.isExpandedView = !state.isExpandedView;
        if (state.isExpandedView) {
          dom.deviceFrame.classList.add("expanded");
          dom.btnToggleFrame.innerHTML = renderIcon("smartphone", "text-[18px]");
          dom.btnToggleFrame.title = "Visualizar no formato iPhone 16 Plus (430px)";
        } else {
          dom.deviceFrame.classList.remove("expanded");
          dom.btnToggleFrame.innerHTML = renderIcon("desktop_windows", "text-[18px]");
          dom.btnToggleFrame.title = "Expandir tela para desktop";
        }
        if (typeof enhanceIcons === "function") {
          enhanceIcons(dom.btnToggleFrame);
        }
      });
    }

    // Initial render
    renderCurrentView();
    updateAllDoctorAvatars();
  } catch (err) {
    console.error("Critical error starting Finanças Pediatria:", err);
    if (dom.mainContent) {
      dom.mainContent.innerHTML = `
        <div class="p-6 bg-red-50 text-red-700 rounded-2xl m-4 border border-red-200">
          <h2 class="font-bold text-lg mb-2">Erro ao carregar o aplicativo</h2>
          <p class="text-sm mb-4">${err.message || err}</p>
          <button onclick="location.reload()" class="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Recarregar</button>
        </div>
      `;
    }
  }
}

// Robust Application Bootstrapping
function bootApp() {
  if (typeof window === "undefined") return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initApp();
      if (typeof enhanceIcons === "function") enhanceIcons(document.body);
    });
  } else {
    initApp();
    if (typeof enhanceIcons === "function") enhanceIcons(document.body);
  }
}

if (typeof window !== "undefined") {
  try {
    Object.defineProperty(window, "APP_CREATOR", {
      value: APP_CREATOR,
      writable: false,
      configurable: false
    });
  } catch (e) {}

  bootApp();
  window.pediatricApp = {
    state,
    openBottomSheet,
    closeBottomSheet,
    openDialog,
    closeDialog,
    openTrashDialog,
    openDoctorProfileDialog,
    openCategoryModal,
    showBabyReaction,
    showToast,
    switchTab,
    initApp,
    renderCurrentView,
    bootApp,
    applyTheme,
    openSpotlightSearch,
    closeSpotlightSearch,
    startVoiceLogging,
    openSBARDialog,
    openDREDialog,
    openReconciliationDialog,
    openAccountantKitDialog,
    openFIREDialog,
    openOnboardingDialog,
    openHamburgerDrawer,
    closeHamburgerDrawer,
    openLegalComplianceModal,
    spawnPediatricParticles,
    getDoctorPhoto,
    setDoctorPhoto,
    updateAllDoctorAvatars,
    renderCustomSelectHTML,
    attachCustomSelectEvents
  };
}

})();

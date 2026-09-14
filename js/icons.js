/**
 * Pediatric Chic - Vector Icon System & Fallback Engine
 * Provides pixel-perfect SVG fallbacks for Material Symbols Outlined,
 * ensuring icons never degrade to raw text ligatures even if Google Fonts CDN fails,
 * network is offline, or CORS restricts external fonts.
 */

export const ICON_PATHS = {
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
  apple: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.66-.82 1.11-1.96.99-3.1-.99.04-2.19.66-2.89 1.48-.61.71-1.14 1.87-1 2.98 1.11.09 2.24-.55 2.9-1.36z"
};

/**
 * Returns clean inline SVG markup for a given icon.
 * @param {string} name Material icon name
 * @param {string} extraClasses CSS classes (e.g. 'w-5 h-5 text-primary')
 * @param {string} extraStyles Optional inline CSS styles
 * @returns {string} SVG HTML string
 */
export function getSvgIcon(name, extraClasses = "", extraStyles = "") {
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
export function renderIcon(name, extraClasses = "", extraStyles = "") {
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
export function enhanceIcons(root = document) {
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
export function initIconSystem() {
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

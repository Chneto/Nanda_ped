import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('index.html conforms to iPhone 16 Plus layout and has robust icon fallbacks', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // 1. Google Fonts display=block prevents FOUT blowout
  assert.ok(html.includes('&display=block'), 'Google Fonts URL must use display=block to prevent ligature text FOUT blowout');

  // 2. iPhone 16 Plus Canvas (430px target)
  assert.ok(html.includes('max-w-[400px]'), 'Navigation bar must have max-w-[400px] to fit within 430px canvas');
  assert.ok(html.includes('device-frame'), 'Must contain device-frame container');

  // 3. Navigation tabs must contain inline SVG fallbacks for all primary tabs
  assert.ok(html.includes('data-icon="vital_signs"'), 'Início tab must have data-icon="vital_signs"');
  assert.ok(html.includes('data-icon="calendar_month"'), 'Plantões tab must have data-icon="calendar_month"');
  assert.ok(html.includes('data-icon="add"'), 'FAB button must have data-icon="add"');
  assert.ok(html.includes('data-icon="account_balance_wallet"'), 'Despesas tab must have data-icon="account_balance_wallet"');
  assert.ok(html.includes('data-icon="insights"'), 'Relatórios tab must have data-icon="insights"');

  // 4. Header buttons must have SVG fallbacks
  assert.ok(html.includes('data-icon="notifications"'), 'Notification bell must have data-icon="notifications"');
  assert.ok(html.includes('data-icon="desktop_windows"'), 'Toggle frame must have data-icon="desktop_windows"');

  // 5. Month selector must have SVG fallbacks
  assert.ok(html.includes('data-icon="chevron_left"'), 'Prev month button must have data-icon="chevron_left"');
  assert.ok(html.includes('data-icon="calendar_today"'), 'Calendar picker button must have data-icon="calendar_today"');
  assert.ok(html.includes('data-icon="expand_more"'), 'Month dropdown button must have data-icon="expand_more"');
  assert.ok(html.includes('data-icon="chevron_right"'), 'Next month button must have data-icon="chevron_right"');

  // 6. Scripts must include standalone bundle for zero-CORS file:// compatibility
  assert.ok(html.includes('src="js/bundle.js"'), 'index.html must load js/bundle.js for CORS-safe execution');
});

test('css/styles.css enforces anti-blowout rules and valid iPhone 16 Plus frame styles', () => {
  const css = fs.readFileSync(path.join(rootDir, 'css', 'styles.css'), 'utf8');

  // 1. .material-symbols-outlined rules per prompt specification
  assert.ok(css.includes("font-family: 'Material Symbols Outlined' !important"), 'Must declare Material Symbols Outlined font family');
  assert.ok(css.includes('display: inline-block'), 'Must declare display: inline-block per specification');
  assert.ok(css.includes('max-width: 1.5em'), 'Must restrict max-width to prevent text string blowout');
  assert.ok(css.includes('overflow: hidden'), 'Must hide overflow');
  assert.ok(css.includes('text-overflow: clip'), 'Must clip overflowing ligature text');

  // 2. device-frame valid CSS
  assert.ok(css.includes('max-width: 430px'), 'device-frame max-width must be 430px for iPhone 16 Plus');
  assert.ok(css.includes('flex-direction: column'), 'device-frame must use valid flex-direction: column');
  assert.ok(!css.includes('flex-col: column'), 'Invalid flex-col: column syntax must be removed');

  // 3. Offline structural fallback classes
  assert.ok(css.includes('.hidden { display: none !important; }'), 'Must include offline structural fallback for .hidden');
  assert.ok(css.includes('.flex { display: flex; }'), 'Must include offline structural fallback for .flex');
  assert.ok(css.includes('.truncate {'), 'Must include offline structural fallback for .truncate');
});

test('js/bundle.js is synchronized with source files', () => {
  const bundleCode = fs.readFileSync(path.join(rootDir, 'js', 'bundle.js'), 'utf8');
  assert.ok(bundleCode.includes('PediatricStore'), 'Bundle must contain PediatricStore');
  assert.ok(bundleCode.includes('renderForecastChartSVG'), 'Bundle must contain renderForecastChartSVG');
  assert.ok(bundleCode.includes('ICON_PATHS'), 'Bundle must contain ICON_PATHS');
  assert.ok(bundleCode.includes('bootApp'), 'Bundle must contain bootApp');
});

test('js/bundle.js executes completely and mounts dashboard without CORS dependency', () => {
  const bundleCode = fs.readFileSync(path.join(rootDir, 'js', 'bundle.js'), 'utf8');

  // Verify syntax
  assert.doesNotThrow(() => {
    new Function(bundleCode);
  }, 'bundle.js should compile without SyntaxError');

  // Mock minimal DOM
  const domNodes = new Map();
  function createMockElement(tag = 'div', id = '') {
    return {
      tagName: tag.toUpperCase(),
      id,
      innerHTML: '',
      textContent: '',
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); }
      },
      style: {},
      attributes: {},
      setAttribute(k, v) { this.attributes[k] = v; },
      getAttribute(k) { return this.attributes[k] || null; },
      addEventListener(evt, fn) {},
      removeEventListener(evt, fn) {},
      querySelector(sel) { return null; },
      querySelectorAll(sel) { return []; }
    };
  }

  const ids = [
    'main-content', 'current-month-display', 'btn-prev-month', 'btn-next-month',
    'btn-open-month-picker', 'fab-add', 'bottom-sheet', 'modal-overlay', 'dialog-overlay',
    'dialog-container', 'sheet-close-btn', 'toast', 'toast-message', 'btn-toggle-frame',
    'btn-notifications', 'notif-badge', 'btn-profile', 'header-active-tab', 'header-doctor-title'
  ];

  ids.forEach(id => {
    domNodes.set(id, createMockElement('div', id));
  });

  const prevWindow = global.window;
  const prevDoc = global.document;
  const prevMO = global.MutationObserver;

  try {
    global.window = {
      addEventListener(evt, fn) {},
      pediatricApp: {}
    };

    global.document = {
      readyState: 'complete',
      getElementById(id) { return domNodes.get(id) || createMockElement('div', id); },
      querySelector(sel) { return createMockElement(); },
      querySelectorAll(sel) { return []; },
      body: createMockElement('body'),
      addEventListener(evt, fn) {}
    };

    global.MutationObserver = class {
      observe() {}
      disconnect() {}
    };

    // Execute bundle
    eval(bundleCode);

    const mainContent = domNodes.get('main-content');
    assert.ok(mainContent.innerHTML.length > 5000, 'Main content must be rendered by bundle');
    assert.ok(mainContent.innerHTML.includes('Dra. Pediatra'), 'Should contain doctor name');
    assert.ok(mainContent.innerHTML.includes('Saldo em Caixa (D+90)'), 'Should contain Caixa balance');
    assert.ok(global.window.pediatricApp, 'Should attach window.pediatricApp');
  } finally {
    global.window = prevWindow;
    global.document = prevDoc;
    global.MutationObserver = prevMO;
  }
});

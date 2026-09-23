import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('CSS Anti-Crop & Modal Scroll Safeguards', () => {
  const css = fs.readFileSync(path.join(rootDir, 'css', 'styles.css'), 'utf8');

  // 1. .dialog-box and .dialog-card must have scrollable overflow and 90vh max-height
  assert.ok(css.includes('.dialog-box') && css.includes('.dialog-card'), 'CSS must define .dialog-box and .dialog-card');
  assert.ok(css.includes('max-height: 90vh'), 'Dialog must have max-height: 90vh');
  assert.ok(css.includes('-webkit-overflow-scrolling: touch'), 'Dialog and lists must support iOS momentum scrolling');

  // Ensure .dialog-box does NOT have overflow: hidden
  const dialogBoxMatch = css.match(/\.dialog-box[\s\S]*?\{([\s\S]*?)\}/);
  assert.ok(dialogBoxMatch, 'Must find .dialog-box definition');
  const dialogBoxRules = dialogBoxMatch[1];
  assert.ok(dialogBoxRules.includes('overflow-y: auto'), 'dialog-box must have overflow-y: auto');
  assert.ok(!dialogBoxRules.includes('overflow: hidden'), 'dialog-box must NOT have overflow: hidden');

  // 2. .custom-select-menu and .custom-select-popover max-height: 220px and internal scrolling
  assert.ok(css.includes('.custom-select-popover') && css.includes('.custom-select-menu'), 'CSS must style both .custom-select-popover and .custom-select-menu');
  assert.ok(css.includes('max-height: 220px'), 'Custom select popovers must enforce max-height: 220px');
  assert.ok(css.includes('.custom-select-list') && css.includes('.custom-select-menu-list'), 'CSS must style .custom-select-list and .custom-select-menu-list');

  // 3. Dropup support for custom select, category picker, and hospital picker
  assert.ok(css.includes('.custom-select-popover.dropup') || css.includes('.custom-select-menu.dropup'), 'CSS must support dropup for custom select');
  assert.ok(css.includes('.hospital-menu-popover.dropup'), 'CSS must support dropup for hospital picker');
  assert.ok(css.includes('.category-menu-popover.dropup'), 'CSS must support dropup for category picker');
  assert.ok(css.includes('@keyframes categoryMenuPopUp'), 'CSS must define dropup animation keyframes');

  // 4. Dark mode includes .custom-select-menu and .dialog-card
  assert.ok(css.includes('.dark .custom-select-menu'), 'Dark mode must support .custom-select-menu');
  assert.ok(css.includes('.dark .dialog-card') || css.includes('[data-theme="dark"] .dialog-card'), 'Dark mode must support .dialog-card');
});

test('JS Custom Select Architecture & Onboarding Anti-Crop Integration', () => {
  const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf8');

  // 1. renderCustomSelectHTML includes custom-select-menu classes
  assert.ok(appJs.includes('custom-select-menu'), 'renderCustomSelectHTML must output custom-select-menu class');
  assert.ok(appJs.includes('custom-select-menu-list'), 'renderCustomSelectHTML must output custom-select-menu-list class');

  // 2. attachCustomSelectEvents includes smart dropup detection and scrollIntoView
  assert.ok(appJs.includes('shouldDropUp') || appJs.includes('dropup'), 'attachCustomSelectEvents must implement smart dropup logic');
  assert.ok(appJs.includes('scrollIntoView'), 'attachCustomSelectEvents must scroll popover into view');
  assert.ok(appJs.includes('Escape'), 'Custom select must close on Escape key');

  // 3. openDialog automatically attaches custom select events
  assert.ok(appJs.includes('attachCustomSelectEvents(dom.dialogContainer)'), 'openDialog must automatically bind custom select events');

  // 4. openOnboardingDialog tax options include comprehensive pediatric rates
  assert.ok(appJs.includes('PJ Simples Nacional (6% com Fator R)'), 'Onboarding must have Simples Nacional 6%');
  assert.ok(appJs.includes('11.33'), 'Onboarding must have Lucro Presumido 11.33%');
  assert.ok(appJs.includes('13.33'), 'Onboarding must have Lucro Presumido 13.33%');
  assert.ok(appJs.includes('15.5'), 'Onboarding must have Simples Anexo V 15.5%');
  assert.ok(appJs.includes('16.33'), 'Onboarding must have Lucro Presumido 16.33%');
  assert.ok(appJs.includes('Carnê-Leão PF / RPA (27.5%)'), 'Onboarding must have Carnê-Leão PF 27.5%');

  // 5. Onboarding dialog steps use scrollable dialog-card-content
  assert.ok(appJs.includes('dialog-card-content'), 'Onboarding modal steps must use dialog-card-content');
  assert.ok(appJs.includes('max-h-[90vh] overflow-y-auto'), 'Onboarding modal steps must allow vertical scrolling');
});

test('Audit: All Modals and Dropdowns Have Scroll Protections', () => {
  const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // 1. index.html dialog-container has dialog-card
  assert.ok(indexHtml.includes('id="dialog-container"') && indexHtml.includes('dialog-card'), 'index.html must have dialog-card on #dialog-container');

  // 2. Shifts view sector filter
  assert.ok(appJs.includes("id: 'select-shift-sector'"), 'Sector filter must be present');

  // 3. Bottom-sheet forms (Plantão, Consulta, Despesa)
  assert.ok(appJs.includes("id: 'input-shift-work-type'"), 'Shift work-type custom select present');
  assert.ok(appJs.includes("id: 'input-shift-sector'"), 'Shift sector custom select present');
  assert.ok(appJs.includes("id: 'input-shift-type'"), 'Shift type custom select present');
  assert.ok(appJs.includes("id: 'input-consultation-type'"), 'Consultation type custom select present');
  assert.ok(appJs.includes("id: 'input-consultation-puericultura-month'"), 'Puericultura month custom select present');
  assert.ok(appJs.includes("id: 'input-consultation-duration'"), 'Duration custom select present');
  assert.ok(appJs.includes("id: 'input-consultation-payment-method'"), 'Payment method custom select present');
  assert.ok(appJs.includes("id: 'input-expense-type'"), 'Expense type custom select present');

  // 4. Hospital & Category Pickers have dropup handling
  assert.ok(appJs.includes('hospital-menu-popover'), 'Hospital picker popover present');
  assert.ok(appJs.includes('category-menu-popover'), 'Category picker popover present');
});

test('Modal In-Flow Expansion & Non-Clipping Guarantees', () => {
  const css = fs.readFileSync(path.join(rootDir, 'css', 'styles.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf8');

  // 1. .dialog-card .custom-select-popover must be position: relative !important
  assert.ok(
    css.includes('.dialog-card .custom-select-popover') &&
    css.includes('position: relative !important'),
    'Modal custom selects must expand in-flow using position: relative'
  );

  // 2. Custom select list must allow scroll chaining (overscroll-behavior: auto)
  assert.ok(
    css.includes('overscroll-behavior: auto'),
    'Custom select list must have overscroll-behavior: auto to prevent trapping parent scroll'
  );

  // 3. JS must recognize isInsideDialog to disable dropup
  assert.ok(
    appJs.includes('isInsideDialog'),
    'app.js must detect if select is inside dialog'
  );

  // 4. Onboarding Step 2 has ample padding pb-8
  assert.ok(
    appJs.includes('dialog-card-content') && appJs.includes('pb-8'),
    'Onboarding Step 2 must provide pb-8 bottom clearance'
  );
});


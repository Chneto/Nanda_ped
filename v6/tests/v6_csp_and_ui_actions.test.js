/**
 * v6_csp_and_ui_actions.test.js
 * Test Suite: CSP Strictness & UI Action Delegation in Finanças Pediatria v6
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v6Dir = path.resolve(__dirname, '..');

export const APP_CREATOR = 'FChNeto';

describe('Finanças Pediatria v6 - CSP & Event Delegation Suite', () => {

  test('v6 vercel.json enforces strict CSP without unsafe-inline in script-src', () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(v6Dir, 'vercel.json'), 'utf-8'));
    assert.ok(vercelConfig.headers, 'vercel.json must define headers');

    const globalHeaders = vercelConfig.headers.find(h => h.source === '/(.*)');
    assert.ok(globalHeaders, 'Global header rule /(.*) must exist');

    const cspHeader = globalHeaders.headers.find(h => h.key === 'Content-Security-Policy');
    assert.ok(cspHeader, 'Content-Security-Policy header must exist');

    const cspValue = cspHeader.value;
    assert.ok(!cspValue.includes("script-src 'unsafe-inline'"), "script-src must NOT contain 'unsafe-inline'");
    assert.ok(!cspValue.includes("script-src * 'unsafe-inline'"), "script-src must NOT contain wildcard with 'unsafe-inline'");
    assert.ok(cspValue.includes("object-src 'none'"), "object-src must be 'none'");
    assert.ok(cspValue.includes("base-uri 'self'"), "base-uri must be 'self'");
  });

  test('v6 index.html contains zero inline event handler attributes (on* pattern)', () => {
    const htmlContent = fs.readFileSync(path.join(v6Dir, 'index.html'), 'utf-8');
    
    // Regex looking for inline HTML event attributes like onclick=, onsubmit=, onchange=, etc.
    const inlineEventRegex = /\s(on[a-z]{3,20})\s*=/gi;
    const matches = [];
    let match;
    while ((match = inlineEventRegex.exec(htmlContent)) !== null) {
      matches.push(match[1]);
    }

    assert.equal(matches.length, 0, `index.html must not contain inline event attributes. Found: ${matches.join(', ')}`);
  });

  test('v6 JS files contain zero inline HTML event attributes in template strings', () => {
    const jsFiles = ['ui.js', 'app.js', 'store.js', 'config.js', 'cloudState.js', 'db.js', 'supabaseClient.js', 'sync.js'];
    
    for (const file of jsFiles) {
      const filePath = path.join(v6Dir, 'js', file);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Look specifically for inline event attributes rendered into HTML template strings (e.g. onclick="...", onchange="...")
      const templateEventRegex = /<[a-z0-9-]+\s+[^>]*\b(on[a-z]{3,15})\s*=\s*["'][^"']*["']/gi;
      const matches = [];
      let match;
      while ((match = templateEventRegex.exec(content)) !== null) {
        matches.push(match[0]);
      }

      assert.equal(matches.length, 0, `${file} must not render inline on* attributes in HTML templates. Found: ${matches.join(' | ')}`);
    }
  });

  test('UI includes delegated data-action and data-open-modal triggers for all 4 entry points', () => {
    const uiContent = fs.readFileSync(path.join(v6Dir, 'js', 'ui.js'), 'utf-8');
    
    // 1. Quick add shift button
    assert.ok(
      uiContent.includes('data-open-shift-modal') || uiContent.includes('data-action="open-shift-modal"'),
      'Quick add shift must have data attribute trigger'
    );

    // 2. Quick add expense button
    assert.ok(
      uiContent.includes('data-open-expense-modal') || uiContent.includes('data-action="open-expense-modal"'),
      'Quick add expense must have data attribute trigger'
    );

    // 3. Tab income new shift button (+ Plantão)
    assert.ok(
      uiContent.includes('data-action="open-shift-modal"') || uiContent.includes('data-open-modal="#modal-shift"'),
      'Income view + Plantão button must use delegated data trigger'
    );

    // 4. Tab expenses new expense button (+ Despesa)
    assert.ok(
      uiContent.includes('data-action="open-expense-modal"') || uiContent.includes('data-open-modal="#modal-expense"'),
      'Expenses view + Despesa button must use delegated data trigger'
    );
  });

  test('PediatricUI bindGlobalEvents handles data-open-modal and action attributes', async () => {
    const { PediatricUI } = await import('../js/ui.js');
    const { PediatricStore } = await import('../js/store.js');

    const store = new PediatricStore();
    const ui = new PediatricUI(store);

    assert.equal(typeof ui.openModal, 'function', 'ui.openModal must be a function');
    assert.equal(typeof ui.closeModal, 'function', 'ui.closeModal must be a function');
  });

  test('UI source implements modal keyboard focus trap and Escape listener', () => {
    const uiContent = fs.readFileSync(path.join(v6Dir, 'js', 'ui.js'), 'utf-8');
    assert.ok(uiContent.includes("e.key === 'Escape'"), 'UI must handle Escape key for modal dismissal');
    assert.ok(uiContent.includes("e.key === 'Tab'"), 'UI must handle Tab key for modal focus trapping');
    assert.ok(uiContent.includes('e.shiftKey'), 'UI must handle Shift+Tab reverse cycling');
  });

  test('Canonical creator signature FChNeto is preserved in UI', async () => {
    const { APP_CREATOR: uiCreator, APP_VERSION } = await import('../js/ui.js');
    assert.equal(uiCreator, 'FChNeto', 'Creator signature must be immutable FChNeto');
    assert.equal(APP_VERSION, '6.0.0', 'Version must be 6.0.0');
  });
});

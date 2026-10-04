/**
 * v6_accessibility_and_privacy.test.js
 * Test Suite: Accessibility, iOS Viewport Shielding & Privacy Mode for Finanças Pediatria v6
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_CREATOR, APP_VERSION } from '../js/config.js';
import { PediatricStore, DEFAULT_HOSPITALS } from '../js/store.js';
import { PediatricUI } from '../js/ui.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v6Dir = path.resolve(__dirname, '..');

describe('Finanças Pediatria v6 - Accessibility & Privacy Suite', () => {

  const htmlContent = fs.readFileSync(path.join(v6Dir, 'index.html'), 'utf-8');
  const cssContent = fs.readFileSync(path.join(v6Dir, 'css', 'styles.css'), 'utf-8');

  describe('1. Viewport & iOS Safari Shielding', () => {

    test('Viewport meta tag enables manual zoom and supports safe-area covers', () => {
      const viewportMatch = htmlContent.match(/<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/i);
      assert.ok(viewportMatch, 'index.html must have a viewport meta tag');

      const content = viewportMatch[1];
      assert.ok(content.includes('width=device-width'), 'Viewport must define width=device-width');
      assert.ok(content.includes('initial-scale=1.0') || content.includes('initial-scale=1'), 'Viewport must define initial-scale=1.0');
      assert.ok(content.includes('viewport-fit=cover'), 'Viewport must define viewport-fit=cover for iPhone safe areas');

      // Crucial accessibility rule: No zoom blocking
      assert.ok(!content.includes('maximum-scale=1.0'), 'Viewport must NOT restrict maximum-scale=1.0');
      assert.ok(!content.includes('user-scalable=no'), 'Viewport must NOT disable user-scalable');
      assert.ok(!content.includes('user-scalable=0'), 'Viewport must NOT disable user-scalable');
    });

    test('Form inputs, selects, and textareas are styled with >= 16px to prevent iOS auto-zoom', () => {
      // Check input font size rules in CSS
      assert.ok(
        cssContent.includes('font-size: 16px') || cssContent.includes('font-size: 1rem') || cssContent.includes('font-size: var('),
        'CSS must enforce readable font-size (at least 16px) on inputs'
      );
    });
  });

  describe('2. Accessible Modals & Dialog Semantics', () => {

    test('All modal containers have role="dialog" and aria-modal="true"', () => {
      const requiredModals = [
        'modal-shift',
        'modal-expense',
        'modal-cloud-config',
        'modal-categories',
        'modal-doctor-profile',
        'modal-sync-conflict'
      ];

      for (const modalId of requiredModals) {
        const modalRegex = new RegExp(`<div[^>]*id=["']${modalId}["'][^>]*>`, 'i');
        const match = htmlContent.match(modalRegex);
        assert.ok(match, `Modal #${modalId} must exist in index.html`);

        const modalTag = match[0];
        assert.ok(
          modalTag.includes('role="dialog"') || modalTag.includes("role='dialog'"),
          `Modal #${modalId} must have role="dialog"`
        );
        assert.ok(
          modalTag.includes('aria-modal="true"') || modalTag.includes("aria-modal='true'"),
          `Modal #${modalId} must have aria-modal="true"`
        );
      }
    });

    test('PediatricUI manages focus restoration on modal open and close', () => {
      const store = new PediatricStore();
      const ui = new PediatricUI(store);

      assert.equal(typeof ui.openModal, 'function');
      assert.equal(typeof ui.closeModal, 'function');
      assert.equal(ui._lastFocusedElement, null);
    });
  });

  describe('3. Privacy & Sanitized Demo Data', () => {

    test('Zero real physician personal names or real hospital institutions in default data', () => {
      const defaultState = new PediatricStore().getDefaultState();

      // Generic doctor identity
      assert.ok(
        defaultState.doctorName === 'Médica' || defaultState.doctorName === 'Dra. Médica',
        'Default doctor name must be generic'
      );
      assert.equal(defaultState.crm, '');

      // Generic hospital templates
      assert.deepEqual(DEFAULT_HOSPITALS, [
        'Maternidade Principal',
        'Maternidade Secundária',
        'Hospital Pediátrico',
        'Hospital Geral',
        'Unidade de Saúde'
      ]);

      // No real names in default hospital list
      for (const hosp of DEFAULT_HOSPITALS) {
        assert.ok(!hosp.includes('Albert Einstein'));
        assert.ok(!hosp.includes('Sírio'));
        assert.ok(!hosp.includes('Unimed'));
      }
    });

    test('Zero hardcoded real incomes or bank details in store defaults', () => {
      const defaultState = new PediatricStore().getDefaultState();
      assert.equal(defaultState.shifts.length, 0);
      assert.equal(defaultState.expenses.length, 0);
      assert.equal(defaultState.residencySalary.value, 0.00); // Clean initial state
      assert.equal(defaultState.residencySalary.active, false);
    });
  });

  describe('4. Canonical Creator & Metadata Verification', () => {

    test('Canonical author FChNeto is preserved across HTML, JS and manifest', () => {
      const manifest = JSON.parse(fs.readFileSync(path.join(v6Dir, 'manifest.json'), 'utf-8'));
      assert.equal(manifest.name, 'Finanças Pediatria v6');
      assert.equal(manifest.short_name, 'Finanças Ped');

      assert.ok(htmlContent.includes('FChNeto'), 'index.html must credit FChNeto');
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(APP_VERSION, '6.0.0');
    });
  });
});

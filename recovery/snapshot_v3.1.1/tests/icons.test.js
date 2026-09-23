import test from 'node:test';
import assert from 'node:assert/strict';
import { ICON_PATHS, getSvgIcon, renderIcon, enhanceIcons } from '../js/icons.js';

test('ICON_PATHS contains all required medical, navigation, and finance icons', () => {
  const requiredIcons = [
    'vital_signs',
    'calendar_month',
    'add',
    'account_balance_wallet',
    'insights',
    'notifications',
    'desktop_windows',
    'smartphone',
    'chevron_left',
    'chevron_right',
    'calendar_today',
    'expand_more',
    'favorite',
    'meeting_room',
    'medical_services',
    'receipt_long',
    'warning',
    'stacked_line_chart',
    'verified',
    'spa',
    'local_hospital',
    'search',
    'search_off',
    'close',
    'check',
    'check_circle',
    'delete',
    'edit'
  ];

  for (const name of requiredIcons) {
    assert.ok(ICON_PATHS[name], `Icon "${name}" should be defined in ICON_PATHS`);
    assert.ok(ICON_PATHS[name].startsWith('M'), `Icon "${name}" SVG path should start with 'M' command`);
  }
});

test('getSvgIcon generates valid accessible SVG markup', () => {
  const svg = getSvgIcon('vital_signs', 'w-6 h-6 text-primary', 'margin-right: 4px;');
  assert.ok(svg.includes('<svg'), 'Should contain opening <svg>');
  assert.ok(svg.includes('viewBox="0 0 24 24"'), 'Should have standard 24x24 viewBox');
  assert.ok(svg.includes('fill="currentColor"'), 'Should inherit currentColor');
  assert.ok(svg.includes('w-6 h-6 text-primary'), 'Should include custom classes');
  assert.ok(svg.includes('style="margin-right: 4px;"'), 'Should include inline styles');
  assert.ok(svg.includes('aria-hidden="true"'), 'Should be accessible');
  assert.ok(svg.includes(ICON_PATHS.vital_signs), 'Should embed path data');
});

test('renderIcon generates robust Material Symbols span with inline SVG fallback', () => {
  const iconMarkup = renderIcon('account_balance_wallet', 'text-[22px]', 'color: #F48FB1;');
  assert.ok(iconMarkup.includes('class="material-symbols-outlined text-[22px]"'));
  assert.ok(iconMarkup.includes('data-icon="account_balance_wallet"'));
  assert.ok(iconMarkup.includes('<svg'));
  assert.ok(iconMarkup.includes(ICON_PATHS.account_balance_wallet));
});

test('enhanceIcons replaces raw text ligatures with SVG fallbacks without double-processing', () => {
  class MockElement {
    constructor(text, iconAttr) {
      this.textContent = text;
      this.innerHTML = text;
      this.attrs = { class: 'material-symbols-outlined' };
      if (iconAttr) this.attrs['data-icon'] = iconAttr;
    }
    getAttribute(k) { return this.attrs[k] || null; }
    setAttribute(k, v) { this.attrs[k] = v; }
    querySelector(sel) { return this.innerHTML.includes('<svg') ? {} : null; }
  }

  const el1 = new MockElement('calendar_month');
  const el2 = new MockElement('', 'insights');
  const elAlreadySvg = new MockElement('<svg><path/></svg>', 'notifications');

  const root = {
    querySelectorAll(sel) {
      if (sel === '.material-symbols-outlined') {
        return [el1, el2, elAlreadySvg];
      }
      return [];
    }
  };

  enhanceIcons(root);

  assert.ok(el1.innerHTML.includes('<svg'), 'el1 text should be converted to SVG');
  assert.ok(el1.innerHTML.includes(ICON_PATHS.calendar_month), 'el1 should have calendar_month path');
  assert.equal(el1.getAttribute('data-icon'), 'calendar_month');

  assert.ok(el2.innerHTML.includes('<svg'), 'el2 data-icon should be converted to SVG');
  assert.ok(el2.innerHTML.includes(ICON_PATHS.insights), 'el2 should have insights path');

  assert.equal(elAlreadySvg.innerHTML, '<svg><path/></svg>', 'Already-SVG element should remain unchanged');
});

test('renderIcon and enhanceIcons provide graceful fallback for unknown icons without text blowout', () => {
  const iconMarkup = renderIcon('non_existent_icon_xyz');
  assert.ok(iconMarkup.includes('<svg'), 'renderIcon should produce SVG even for unknown icons');
  assert.ok(iconMarkup.includes(ICON_PATHS.info), 'renderIcon should fall back to info icon');

  class MockElement {
    constructor(text) {
      this.textContent = text;
      this.innerHTML = text;
      this.attrs = { class: 'material-symbols-outlined' };
    }
    getAttribute(k) { return this.attrs[k] || null; }
    setAttribute(k, v) { this.attrs[k] = v; }
    querySelector(sel) { return this.innerHTML.includes('<svg') ? {} : null; }
  }

  const elUnknown = new MockElement('completely_unknown_medical_symbol');
  const root = {
    querySelectorAll(sel) {
      if (sel === '.material-symbols-outlined') return [elUnknown];
      return [];
    }
  };

  enhanceIcons(root);
  assert.ok(elUnknown.innerHTML.includes('<svg'), 'Unknown icon should be replaced by fallback SVG');
  assert.ok(elUnknown.innerHTML.includes(ICON_PATHS.info), 'Unknown icon should have info fallback path');
});


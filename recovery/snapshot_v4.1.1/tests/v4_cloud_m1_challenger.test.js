/**
 * v4_cloud_m1_challenger.test.js
 * Empirical Challenger Test Suite for Milestone M1 (V4_Cloud Scaffolding & Config)
 * 
 * Conducts adversarial stress-testing and empirical verification across:
 * 1. config.js: Rapid transitions, URL fuzzing, corrupted storage, null/undefined inputs, fallback precedence
 * 2. styles.css: iPhone 16 Plus safe areas, anti-zoom 16px !important, and in-flow expansion anti-crop rules
 * 3. sw.js: Offline caching, cache-first static assets, network bypass for API/auth, offline SPA fallback
 * 4. Canonical Author Invariant: APP_CREATOR = 'FChNeto'
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  APP_CREATOR,
  STORAGE_KEYS,
  isValidSupabaseUrl,
  isValidSupabaseAnonKey,
  getConfig,
  saveConfig,
  clearConfig,
  isOfflineMode,
  setOfflineMode,
  isGuestMode,
  setGuestMode
} from '../js/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v4Root = path.resolve(__dirname, '..');

// Helper to mock localStorage
class MockLocalStorage {
  constructor(shouldThrow = false) {
    this.store = new Map();
    this.shouldThrow = shouldThrow;
  }
  getItem(key) {
    if (this.shouldThrow) throw new Error('QuotaExceededError or SecurityError in private browsing');
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    if (this.shouldThrow) throw new Error('QuotaExceededError: storage quota exceeded');
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    if (this.shouldThrow) throw new Error('SecurityError: storage disabled');
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

describe('M1 Empirical Challenge Suite — V4_Cloud Architecture', () => {

  describe('1. Adversarial Challenge on config.js Validators & Storage', () => {
    
    test('isValidSupabaseUrl rejects null, undefined, non-strings, and malformed types', () => {
      const invalidTypes = [null, undefined, 0, 123, true, false, {}, [], () => {}, NaN, Symbol('test')];
      for (const val of invalidTypes) {
        assert.equal(isValidSupabaseUrl(val), false, `Should reject ${typeof val}: ${String(val)}`);
      }
    });

    test('isValidSupabaseUrl rejects empty strings, non-HTTPS protocols, and malformed URLs', () => {
      const badUrls = [
        '',
        '   ',
        'http://xyz.supabase.co',
        'ftp://files.supabase.co',
        'javascript:alert(1)',
        'data:text/html,<h1>bad</h1>',
        'https://',
        'https://a.b', // hostname length <= 3
        'not a url at all',
        '//xyz.supabase.co',
        'https://xyz.supabase.co:invalid-port'
      ];
      for (const url of badUrls) {
        assert.equal(isValidSupabaseUrl(url), false, `Should reject invalid URL: ${url}`);
      }
    });

    test('isValidSupabaseUrl accepts valid HTTPS URLs with proper trimming', () => {
      const validUrls = [
        'https://abcdefghijklmnop.supabase.co',
        'https://my-custom-domain.org/supabase',
        '  https://trimmed.supabase.co  ',
        'https://sub.sub2.example.com:8443/rest'
      ];
      for (const url of validUrls) {
        assert.equal(isValidSupabaseUrl(url), true, `Should accept valid URL: ${url}`);
      }
    });

    test('isValidSupabaseAnonKey rejects invalid types, short keys, and service_role tokens', () => {
      const badKeys = [
        null,
        undefined,
        12345678901234567890,
        {},
        [],
        '',
        '   ',
        'short_key_under_20c', // length 19
        'service_role_key_that_is_at_least_20_characters_long', // contains service_role
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role.signature' // JWT with service_role
      ];
      for (const key of badKeys) {
        assert.equal(isValidSupabaseAnonKey(key), false, `Should reject key: ${String(key)}`);
      }
    });

    test('isValidSupabaseAnonKey accepts valid 20+ chars anon keys and JWTs', () => {
      const goodKeys = [
        '12345678901234567890', // exactly 20 chars
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.secret_signature',
        '  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.secret_signature  '
      ];
      for (const key of goodKeys) {
        assert.equal(isValidSupabaseAnonKey(key), true, `Should accept anon key: ${key}`);
      }
    });

    test('getConfig survives missing window and missing localStorage gracefully', () => {
      const savedLocalStorage = globalThis.localStorage;
      const savedWindow = globalThis.window;
      try {
        delete globalThis.localStorage;
        delete globalThis.window;

        const cfg = getConfig();
        assert.deepEqual(cfg, {
          supabaseUrl: null,
          supabaseAnonKey: null,
          isConfigured: false
        });
      } finally {
        globalThis.localStorage = savedLocalStorage;
        globalThis.window = savedWindow;
      }
    });

    test('getConfig handles corrupted localStorage throwing SecurityError/QuotaExceededError without crashing', () => {
      const savedLocalStorage = globalThis.localStorage;
      try {
        globalThis.localStorage = new MockLocalStorage(true); // throws on every access
        const cfg = getConfig();
        assert.equal(cfg.isConfigured, false);
        assert.equal(cfg.supabaseUrl, null);
        assert.equal(cfg.supabaseAnonKey, null);
      } finally {
        globalThis.localStorage = savedLocalStorage;
      }
    });

    test('saveConfig rejects invalid inputs and returns false without persisting', () => {
      const mockStorage = new MockLocalStorage();
      const savedLocalStorage = globalThis.localStorage;
      try {
        globalThis.localStorage = mockStorage;
        const res1 = saveConfig('http://insecure.supabase.co', '12345678901234567890');
        assert.equal(res1, false);
        assert.equal(mockStorage.getItem(STORAGE_KEYS.SUPABASE_URL), null);

        const res2 = saveConfig('https://valid.supabase.co', 'short_key');
        assert.equal(res2, false);
        assert.equal(mockStorage.getItem(STORAGE_KEYS.SUPABASE_URL), null);

        const res3 = saveConfig(null, null);
        assert.equal(res3, false);
      } finally {
        globalThis.localStorage = savedLocalStorage;
      }
    });

    test('saveConfig and getConfig roundtrip with proper precedence (localStorage over window.__ENV__)', () => {
      const mockStorage = new MockLocalStorage();
      const savedLocalStorage = globalThis.localStorage;
      const savedWindow = globalThis.window;
      try {
        globalThis.localStorage = mockStorage;
        globalThis.window = {
          __ENV__: {
            SUPABASE_URL: 'https://env-project.supabase.co',
            SUPABASE_ANON_KEY: 'env-anon-key-that-is-at-least-20-chars'
          },
          dispatchEvent: () => {}
        };

        // 1. Initial state: reads from window.__ENV__
        let cfg = getConfig();
        assert.equal(cfg.supabaseUrl, 'https://env-project.supabase.co');
        assert.equal(cfg.isConfigured, true);

        // 2. Local storage takes precedence when saved
        const saveRes = saveConfig('https://custom-project.supabase.co', 'custom-anon-key-20chars-long');
        assert.equal(saveRes, true);

        cfg = getConfig();
        assert.equal(cfg.supabaseUrl, 'https://custom-project.supabase.co');
        assert.equal(cfg.supabaseAnonKey, 'custom-anon-key-20chars-long');
        assert.equal(cfg.isConfigured, true);

        // 3. Clear config falls back to window.__ENV__
        clearConfig();
        cfg = getConfig();
        assert.equal(cfg.supabaseUrl, 'https://env-project.supabase.co');
      } finally {
        globalThis.localStorage = savedLocalStorage;
        globalThis.window = savedWindow;
      }
    });

    test('Rapid state transitions for Offline and Guest modes maintain deterministic state', () => {
      const mockStorage = new MockLocalStorage();
      const savedLocalStorage = globalThis.localStorage;
      const savedWindow = globalThis.window;
      try {
        globalThis.localStorage = mockStorage;
        let eventFired = false;
        globalThis.window = {
          dispatchEvent: (event) => {
            if (event.type === 'v4_cloud_offline_mode_changed') eventFired = true;
          },
          CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } }
        };

        // Rapid 100 toggles
        for (let i = 0; i < 100; i++) {
          setOfflineMode(i % 2 === 0);
          assert.equal(isOfflineMode(), i % 2 === 0);
        }

        // Guest mode activates offline mode
        setOfflineMode(false);
        assert.equal(isOfflineMode(), false);
        setGuestMode(true);
        assert.equal(isGuestMode(), true);
        assert.equal(isOfflineMode(), true); // Guest mode implies offline/local mode

        // Turn off guest mode and offline mode
        setGuestMode(false);
        assert.equal(isGuestMode(), false);
        setOfflineMode(false);
        assert.equal(isOfflineMode(), false);
      } finally {
        globalThis.localStorage = savedLocalStorage;
        globalThis.window = savedWindow;
      }
    });
  });

  describe('2. Adversarial Challenge on css/styles.css Mobile Ergonomics', () => {
    const cssPath = path.resolve(v4Root, 'css', 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    test('iPhone 16 Plus safe areas are defined with standard pixel fallbacks', () => {
      assert.match(cssContent, /--safe-top:\s*env\(safe-area-inset-top,\s*44px\);/, 'Must define --safe-top with 44px fallback');
      assert.match(cssContent, /--safe-bottom:\s*env\(safe-area-inset-bottom,\s*34px\);/, 'Must define --safe-bottom with 34px fallback');
    });

    test('#app-container strictly protects safe areas and limits canvas width to 480px', () => {
      const containerMatch = cssContent.match(/#app-container\s*\{([^}]+)\}/);
      assert.ok(containerMatch, '#app-container rule must exist');
      const body = containerMatch[1];
      assert.match(body, /max-width:\s*480px;/, 'iPhone 16 Plus max-width must be 480px');
      assert.match(body, /padding-top:\s*var\(--safe-top\);/, 'Top padding must respect --safe-top');
      assert.match(body, /padding-bottom:\s*calc\(var\(--safe-bottom\)\s*\+\s*90px\);/, 'Bottom padding must clear bottom navigation bar');
    });

    test('Anti-zoom invariant: inputs, selects, textareas enforce font-size: 16px !important', () => {
      const antiZoomRegex = /(input|select|textarea)[^{]*\{[^}]*font-size:\s*16px\s*!important/i;
      assert.ok(antiZoomRegex.test(cssContent), 'Must enforce font-size: 16px !important on form controls to prevent iOS Safari auto-zoom');
    });

    test('No input, select, or textarea rule specifies a font size less than 16px', () => {
      const rules = cssContent.split('}');
      for (const rule of rules) {
        const parts = rule.split('{');
        if (parts.length === 2) {
          const selector = parts[0].trim();
          const declarations = parts[1].trim();
          if (/(input|select|textarea)/i.test(selector)) {
            const fontMatch = declarations.match(/font-size:\s*([^;]+);/i);
            if (fontMatch) {
              const val = fontMatch[1].trim();
              if (val.includes('px')) {
                const px = parseInt(val, 10);
                assert.ok(px >= 16, `Selector "${selector}" has font-size: ${val}, which violates >=16px anti-zoom invariant!`);
              }
            }
          }
        }
      }
    });

    test('In-flow expansion anti-crop rules strictly configured for modals and dropdown menus', () => {
      const sheetMatch = cssContent.match(/\.modal-sheet\s*\{([^}]+)\}/);
      assert.ok(sheetMatch, '.modal-sheet rule must exist');
      assert.match(sheetMatch[1], /position:\s*relative\s*!important/, '.modal-sheet must have position: relative !important');
      assert.match(sheetMatch[1], /overflow-y:\s*auto/, '.modal-sheet must have overflow-y: auto for natural scroll');
      assert.match(sheetMatch[1], /-webkit-overflow-scrolling:\s*touch/, '.modal-sheet must enable iOS smooth inertial scroll');

      const selectMenuMatch = cssContent.match(/\.silk-select-menu\s*\{([^}]+)\}/);
      assert.ok(selectMenuMatch, '.silk-select-menu rule must exist');
      assert.match(selectMenuMatch[1], /position:\s*relative\s*!important/, '.silk-select-menu must have position: relative !important');
    });

    test('Bottom navigation bar and floating components respect safe-area bottom', () => {
      const bottomNavMatch = cssContent.match(/\.bottom-nav-bar\s*\{([^}]+)\}/);
      assert.ok(bottomNavMatch, '.bottom-nav-bar rule must exist');
      assert.match(bottomNavMatch[1], /padding-bottom:\s*var\(--safe-bottom\);/, 'Bottom nav bar must pad for safe-bottom');
      assert.match(bottomNavMatch[1], /height:\s*calc\(var\(--safe-bottom\)\s*\+\s*68px\);/, 'Bottom nav bar height must include safe-bottom');
    });
  });

  describe('3. Adversarial Challenge on sw.js Service Worker & Offline Caching', () => {
    const swPath = path.resolve(v4Root, 'sw.js');
    assert.ok(fs.existsSync(swPath), 'sw.js must exist on disk');
    const swContent = fs.readFileSync(swPath, 'utf8');

    test('All STATIC_ASSETS registered in sw.js actually exist on disk and are non-empty', () => {
      const assetsMatch = swContent.match(/const\s+STATIC_ASSETS\s*=\s*\[([\s\S]*?)\];/);
      assert.ok(assetsMatch, 'STATIC_ASSETS array must be defined in sw.js');

      const assets = assetsMatch[1]
        .split(',')
        .map(s => s.replace(/['"\s]/g, ''))
        .filter(s => s.length > 0 && s !== './');

      assert.ok(assets.length >= 7, 'At least 7 static shell assets must be registered');

      for (const asset of assets) {
        const cleanPath = asset.replace(/^\.\//, '');
        const fullPath = path.resolve(v4Root, cleanPath);
        assert.ok(fs.existsSync(fullPath), `Asset "${asset}" from sw.js STATIC_ASSETS must exist at ${fullPath}`);
        const stat = fs.statSync(fullPath);
        assert.ok(stat.size > 0, `Asset "${asset}" must not be 0 bytes (size=${stat.size})`);
      }
    });

    test('Fetch handler strictly ignores cross-origin requests (Supabase, Google OAuth, CDNs)', () => {
      assert.match(swContent, /url\.origin\s*!==\s*self\.location\.origin/, 'Service Worker must strictly bypass cross-origin requests');
    });

    test('Fetch handler strictly ignores non-GET requests (POST, PUT, DELETE)', () => {
      assert.match(swContent, /event\.request\.method\s*!==\s*['"]GET['"]/, 'Service Worker must ignore non-GET requests');
    });

    test('Service Worker implements cache-first resolution for same-origin static assets', () => {
      assert.match(swContent, /caches\.match\(event\.request\)/, 'Must query cache for matching request');
      assert.match(swContent, /return\s+cachedResponse\s*\|\|\s*fetchPromise/, 'Must return cachedResponse first for 0ms latency, falling back to fetchPromise');
    });

    test('Service Worker navigation requests fall back to ./index.html when offline', () => {
      assert.match(swContent, /event\.request\.mode\s*===\s*['"]navigate['"]/, 'Must inspect navigate mode on network failure');
      assert.match(swContent, /caches\.match\(['"]\.\/index\.html['"]\)/, 'Must fallback to cached index.html when offline navigation fails');
    });
  });

  describe('4. Canonical Author Invariant Verification', () => {
    test('config.js exports canonical APP_CREATOR = "FChNeto"', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
    });

    test('sw.js mentions creator FChNeto in header', () => {
      const swContent = fs.readFileSync(path.resolve(v4Root, 'sw.js'), 'utf8');
      assert.match(swContent, /FChNeto/);
    });

    test('package.json lists author as "FChNeto"', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(v4Root, 'package.json'), 'utf8'));
      assert.equal(pkg.author, 'FChNeto');
    });

    test('index.html displays FChNeto in footers and noscript', () => {
      const htmlContent = fs.readFileSync(path.resolve(v4Root, 'index.html'), 'utf8');
      const matches = htmlContent.match(/FChNeto/g);
      assert.ok(matches && matches.length >= 2, 'index.html must reference FChNeto at least twice in credits and noscript');
    });
  });

});

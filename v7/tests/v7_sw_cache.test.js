/**
 * v7_sw_cache.test.js
 * Test Suite: Service Worker Offline Caching & Bypass Logic for Finanças Pediatria v7
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v7Dir = path.resolve(__dirname, '..');

describe('Finanças Pediatria v7 - Service Worker Cache Suite', () => {

  const swContent = fs.readFileSync(path.join(v7Dir, 'sw.js'), 'utf-8');

  test('Service worker defines unique v7 cache namespace', () => {
    assert.ok(swContent.includes('CACHE_NAME'), 'Must declare CACHE_NAME');
    assert.ok(
      swContent.includes('financas-pediatria-v7') || swContent.includes('v7-static'),
      'Cache name must be scoped to v7'
    );
  });

  test('STATIC_ASSETS lists all essential application shell files without legacy bloat', () => {
    const essentialAssets = [
      './index.html',
      './manifest.json',
      './css/styles.css',
      './js/config.js',
      './js/app.js',
      './js/cloudState.js',
      './js/icons.js',
      './js/store.js',
      './js/supabaseClient.js',
      './js/pwa.js',
      './js/ui.js'
    ];

    for (const asset of essentialAssets) {
      assert.ok(
        swContent.includes(asset),
        `STATIC_ASSETS in sw.js must include ${asset}`
      );
    }

    // Dead-weight legacy engines must NOT be in v7 static cache
    assert.ok(!swContent.includes('db.js'), 'sw.js must NOT include legacy db.js');
    assert.ok(!swContent.includes('sync.js'), 'sw.js must NOT include legacy sync.js');
  });

  test('All assets in STATIC_ASSETS actually exist on disk', () => {
    const match = swContent.match(/STATIC_ASSETS\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(match, 'STATIC_ASSETS array definition must be found');

    const assetPaths = match[1]
      .split(',')
      .map(s => s.trim().replace(/['"]/g, ''))
      .filter(Boolean);

    for (const rel of assetPaths) {
      if (rel === './' || rel === '/') continue;
      const cleanRel = rel.replace(/^\.\//, '');
      const filePath = path.join(v7Dir, cleanRel);
      assert.ok(
        fs.existsSync(filePath),
        `Asset declared in sw.js does not exist on disk: ${cleanRel} (checked ${filePath})`
      );
    }
  });

  test('/api/config is strictly excluded from caching (uses cache: no-store)', () => {
    assert.ok(
      swContent.includes('/api/config'),
      'sw.js must contain explicit handling for /api/config'
    );
    assert.ok(
      swContent.includes("no-store"),
      'Fetch handler for /api/config must enforce no-store'
    );
  });

  test('Cross-origin requests (Supabase, Google Auth, etc.) are ignored by SW', () => {
    assert.ok(
      swContent.includes('url.origin !== self.location.origin'),
      'sw.js must ignore cross-origin requests to prevent intercepting Supabase / Auth APIs'
    );
  });

  test('Activation event cleans up older cache namespaces', () => {
    assert.ok(
      swContent.includes("caches.delete"),
      'sw.js activate handler must purge obsolete cache entries'
    );
    assert.ok(
      swContent.includes("clients.claim()"),
      'sw.js must call clients.claim() to take control immediately'
    );
  });
});

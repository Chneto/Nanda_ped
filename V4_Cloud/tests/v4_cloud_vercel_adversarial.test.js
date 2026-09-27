/**
 * v4_cloud_vercel_adversarial.test.js
 * Adversarial Stress-Test Suite for V4_Cloud Vercel Configuration
 * 
 * Verifies:
 * 1. Deep path routing and edge cases (UUIDs, multi-level paths, unicode, special chars)
 * 2. Static asset shielding across all modern web asset extensions (lowercase, uppercase, compound)
 * 3. Dot-in-path boundary conditions and SPA rewrite isolation
 * 4. CSP injection attack surface audit (eval, object-src, base-uri, frame hijacking, exfiltration)
 * 5. Cache-control matrix and stale asset revalidation
 * 6. Canonical Author invariant: APP_CREATOR = 'FChNeto'
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vercelPath = path.resolve(__dirname, '..', 'vercel.json');

// Helpers for routing and headers simulation
function resolveRewrite(pathname, config) {
  for (const entry of config.rewrites) {
    const reg = new RegExp('^' + entry.source + '$');
    if (reg.test(pathname)) {
      return entry.destination;
    }
  }
  return null;
}

function resolveEffectiveHeaders(pathname, config) {
  const result = {};
  for (const entry of config.headers) {
    const reg = new RegExp('^' + entry.source + '$');
    if (reg.test(pathname)) {
      for (const h of entry.headers) {
        result[h.key] = h.value;
      }
    }
  }
  return result;
}

function parseCsp(cspString) {
  const directives = {};
  const tokens = cspString.split(';').map(t => t.trim()).filter(Boolean);
  for (const token of tokens) {
    const parts = token.split(/\s+/);
    const directiveName = parts[0];
    const directiveValues = parts.slice(1);
    directives[directiveName] = directiveValues;
  }
  return directives;
}

describe('V4_Cloud Vercel Adversarial & Stress-Test Suite', () => {
  const raw = fs.readFileSync(vercelPath, 'utf8');
  const vercelConfig = JSON.parse(raw);

  describe('1. Adversarial Routing — Deep Paths & Parameterized Routes', () => {
    const validClientPaths = [
      '/',
      '/dashboard',
      '/shifts',
      '/shifts/new',
      '/shifts/edit/123e4567-e89b-12d3-a456-426614174000',
      '/shifts/maternidade-araken/2026/09',
      '/shifts/leide-morais/plantoes/detalhes',
      '/expenses',
      '/expenses/2026/09',
      '/expenses/macro/alimentacao',
      '/expenses/parceladas/item-42/parcela-3',
      '/auth/callback',
      '/auth/callback/google',
      '/silk-gate',
      '/settings/credentials',
      '/profile/edit',
      '/dre/2026',
      '/offline',
      '/backup/restore',
      '/a/b/c/d/e/f/g/h/i/j/k/l',
      '/shifts/status_pending',
      '/expenses/filter_pj-vs-pf'
    ];

    for (const route of validClientPaths) {
      test(`Client route "${route}" MUST rewrite to /index.html`, () => {
        const dest = resolveRewrite(route, vercelConfig);
        assert.equal(dest, '/index.html', `Expected route ${route} to rewrite to /index.html`);
      });
    }

    const specialCharacterPaths = [
      '/shifts/%20new',
      '/expenses/macro-grupo/sa%C3%BAde',
      '/shifts/hospital-araken-sala-de-parto',
      '/expenses/categoria_qualificacao_pos',
      '/user-12345/dashboard'
    ];

    for (const route of specialCharacterPaths) {
      test(`Special character path "${route}" MUST rewrite to /index.html`, () => {
        const dest = resolveRewrite(route, vercelConfig);
        assert.equal(dest, '/index.html', `Expected special character route ${route} to rewrite to /index.html`);
      });
    }
  });

  describe('2. Adversarial Routing — Static Asset Shielding & 404 Integrity', () => {
    const staticAssetPaths = [
      // Standard application assets
      '/css/styles.css',
      '/css/components.css',
      '/js/app.js',
      '/js/config.js',
      '/js/store.js',
      '/js/icons.js',
      '/js/supabaseClient.js',
      '/js/db.js',
      '/js/sync.js',
      '/js/ui.js',
      '/sw.js',
      '/manifest.json',
      '/favicon.ico',
      // Asset folder items
      '/assets/icons/favicon.png',
      '/assets/icons/apple-touch-icon.png',
      '/assets/icons/icon-192.png',
      '/assets/icons/icon-512.png',
      '/assets/icons/heart.svg',
      '/assets/images/dra_fernanda.png',
      // Web standards file extensions
      '/fonts/plus-jakarta-sans.woff2',
      '/fonts/bricolage.woff',
      '/fonts/custom.ttf',
      '/images/avatar.jpg',
      '/images/background.jpeg',
      '/images/banner.webp',
      '/images/graphic.svg',
      '/robots.txt',
      '/sitemap.xml',
      '/data/export.json',
      '/documents/manual.pdf',
      '/audio/notification.mp3',
      '/video/onboarding.mp4',
      // Uppercase extensions (case-insensitivity test)
      '/images/AVATAR.PNG',
      '/images/LOGO.JPG',
      '/css/STYLES.CSS',
      '/js/BUNDLE.JS',
      '/fonts/FONT.WOFF2',
      // Compound / Minified extensions
      '/js/vendor.min.js',
      '/css/bootstrap.min.css',
      '/bundle.esm.js',
      // Protected prefix directories even without extensions
      '/assets/',
      '/assets/subfolder/file',
      '/css/',
      '/css/themes/rose-gold',
      '/js/',
      '/js/modules/calculator'
    ];

    for (const asset of staticAssetPaths) {
      test(`Static asset "${asset}" MUST NOT rewrite to /index.html (prevents masked 200s)`, () => {
        const dest = resolveRewrite(asset, vercelConfig);
        assert.equal(dest, null, `Expected static asset ${asset} NOT to be rewritten`);
      });
    }
  });

  describe('3. Dot-in-Path Boundary & Route Edge Cases Analysis', () => {
    test('Paths with dot file extensions are classified as static assets (not rewritten)', () => {
      const extensionPaths = [
        '/report.pdf',
        '/backup.sql',
        '/data.csv',
        '/archive.zip',
        '/script.py',
        '/config.env'
      ];
      for (const p of extensionPaths) {
        assert.equal(resolveRewrite(p, vercelConfig), null, `File with extension ${p} should not rewrite`);
      }
    });

    test('Clean client routes without dot extensions cleanly rewrite', () => {
      const cleanPaths = [
        '/dra-fernanda',
        '/v4-cloud',
        '/maternidade-araken',
        '/d60-75-percent',
        '/d90-25-percent'
      ];
      for (const p of cleanPaths) {
        assert.equal(resolveRewrite(p, vercelConfig), '/index.html', `Clean route ${p} must rewrite`);
      }
    });
  });

  describe('4. Adversarial CSP & Injection Attack Vector Defense Audit', () => {
    const globalRule = vercelConfig.headers.find(h => h.source === '/(.*)');
    const cspHeader = globalRule.headers.find(h => h.key === 'Content-Security-Policy');
    const csp = parseCsp(cspHeader.value);

    test('ATTACK VECTOR: eval() and code generation via string MUST be blocked (no unsafe-eval)', () => {
      assert.ok(!csp['script-src'].includes("'unsafe-eval'"), "CSP MUST NOT contain 'unsafe-eval'!");
    });

    test('ATTACK VECTOR: Malicious object/embed/flash injection MUST be blocked (object-src none)', () => {
      assert.deepEqual(csp['object-src'], ["'none'"], "object-src MUST be strictly 'none'");
    });

    test('ATTACK VECTOR: Base URI Hijacking MUST be blocked (base-uri self)', () => {
      assert.deepEqual(csp['base-uri'], ["'self'"], "base-uri MUST be strictly 'self'");
    });

    test('ATTACK VECTOR: Data exfiltration via fetch/XHR/WebSocket restricted to authorized endpoints', () => {
      const allowedConnect = csp['connect-src'];
      assert.ok(allowedConnect.includes("'self'"));
      assert.ok(allowedConnect.includes('https://*.supabase.co'));
      assert.ok(allowedConnect.includes('wss://*.supabase.co'));
      assert.ok(allowedConnect.includes('https://accounts.google.com'));

      // Ensure no wildcards that allow arbitrary exfiltration
      assert.ok(!allowedConnect.includes('*'), 'connect-src must not contain unconstrained wildcard');
      assert.ok(!allowedConnect.includes('https:'), 'connect-src must not allow all https destinations');
      assert.ok(!allowedConnect.includes('http:'), 'connect-src must not allow insecure http');
    });

    test('ATTACK VECTOR: Unauthorized iframe framing MUST be blocked', () => {
      // X-Frame-Options DENY
      const xfo = globalRule.headers.find(h => h.key === 'X-Frame-Options');
      assert.equal(xfo?.value, 'DENY', 'X-Frame-Options must be DENY to prevent clickjacking');

      // frame-src restricted only to self and accounts.google.com
      const allowedFrames = csp['frame-src'];
      assert.ok(allowedFrames.includes("'self'"));
      assert.ok(allowedFrames.includes('https://accounts.google.com'));
      assert.equal(allowedFrames.length, 2, 'frame-src should only permit self and Google OAuth');
    });

    test('ATTACK VECTOR: Cross-origin token leakage prevented via Referrer-Policy', () => {
      const refPolicy = globalRule.headers.find(h => h.key === 'Referrer-Policy');
      assert.equal(refPolicy?.value, 'strict-origin-when-cross-origin');
    });

    test('ATTACK VECTOR: SSL stripping prevented via Strict-Transport-Security (2 years preload)', () => {
      const hsts = globalRule.headers.find(h => h.key === 'Strict-Transport-Security');
      assert.equal(hsts?.value, 'max-age=63072000; includeSubDomains; preload');
    });

    test('ATTACK VECTOR: Eavesdropping sensors disabled via Permissions-Policy', () => {
      const permPolicy = globalRule.headers.find(h => h.key === 'Permissions-Policy');
      assert.equal(permPolicy?.value, 'camera=(), microphone=(), geolocation=()');
    });
  });

  describe('5. Caching & PWA Cache Poisoning Prevention', () => {
    test('Dynamic app shell (/index.html) must ALWAYS revalidate', () => {
      const headers = resolveEffectiveHeaders('/index.html', vercelConfig);
      assert.equal(headers['Cache-Control'], 'public, max-age=0, must-revalidate');
    });

    test('Service Worker (/sw.js) must ALWAYS revalidate to prevent stale worker lock-in', () => {
      const headers = resolveEffectiveHeaders('/sw.js', vercelConfig);
      assert.equal(headers['Cache-Control'], 'public, max-age=0, must-revalidate');
      assert.equal(headers['Service-Worker-Allowed'], '/');
    });

    test('Static versioned assets retain 1-year immutable caching', () => {
      const cssHeaders = resolveEffectiveHeaders('/css/styles.css', vercelConfig);
      assert.equal(cssHeaders['Cache-Control'], 'public, max-age=31536000, immutable');

      const jsHeaders = resolveEffectiveHeaders('/js/config.js', vercelConfig);
      assert.equal(jsHeaders['Cache-Control'], 'public, max-age=31536000, immutable');

      const assetHeaders = resolveEffectiveHeaders('/assets/icons/favicon.png', vercelConfig);
      assert.equal(assetHeaders['Cache-Control'], 'public, max-age=31536000, immutable');
    });
  });

  describe('6. Canonical Author & Metadata Verification', () => {
    test('Canonical author FChNeto is preserved in package.json and HTML metadata', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
      assert.equal(pkg.author, 'FChNeto');

      const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
      assert.ok(html.includes('content="FChNeto"'));
      assert.ok(html.includes('FChNeto'));
    });
  });
});

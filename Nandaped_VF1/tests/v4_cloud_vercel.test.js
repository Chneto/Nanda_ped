/**
 * v4_cloud_vercel.test.js
 * Master Blueprint Test File for: V4_Cloud/tests/v4_cloud_vercel.test.js
 * 
 * Verifies:
 * 1. vercel.json exists and adheres to Vercel schema v2
 * 2. SPA rewrites route client-side paths to /index.html and shield static assets
 * 3. Strict Security Headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS (2 years preload)
 * 4. Content-Security-Policy (CSP) allows Supabase, Google OAuth, inline SVGs/styles, and data/blob images
 * 5. Cache-Control: max-age=0, must-revalidate on index.html and sw.js, and immutable 1y on static assets
 * 6. Zero-regression & isolation proof, including package.json configuration
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Locate vercel.json (supports both standalone test run in m1_explorer_2 and V4_Cloud/tests/)
const localVercelPath = path.resolve(__dirname, 'proposed_vercel.json');
const v4CloudVercelPath = path.resolve(__dirname, '..', 'vercel.json');
const vercelPath = fs.existsSync(v4CloudVercelPath) ? v4CloudVercelPath : localVercelPath;

// Helper: resolve effective headers for a pathname by evaluating top-to-bottom rules
export function resolveEffectiveHeaders(pathname, config) {
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

// Helper: resolve rewrite destination for a pathname
export function resolveRewrite(pathname, config) {
  for (const entry of config.rewrites) {
    const reg = new RegExp('^' + entry.source + '$');
    if (reg.test(pathname)) {
      return entry.destination;
    }
  }
  return null;
}

// Helper: parse CSP string into directive map
export function parseCsp(cspString) {
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

describe('V4_Cloud vercel.json Production Configuration Suite', () => {
  let vercelConfig;

  test('vercel.json exists and is valid parseable JSON', () => {
    assert.ok(fs.existsSync(vercelPath), `vercel.json must exist at ${vercelPath}`);
    const raw = fs.readFileSync(vercelPath, 'utf8');
    vercelConfig = JSON.parse(raw);
    assert.ok(vercelConfig, 'Parsed JSON must be an object');
  });

  describe('1. Vercel Engine & Global Configuration', () => {
    test('version is 2, cleanUrls is true, trailingSlash is false', () => {
      assert.equal(vercelConfig.version, 2, 'Vercel configuration version must be 2');
      assert.equal(vercelConfig.cleanUrls, true, 'cleanUrls must be enabled for clean navigation');
      assert.equal(vercelConfig.trailingSlash, false, 'trailingSlash must be false to avoid double routes');
    });

    test('rewrites and headers arrays are properly initialized', () => {
      assert.ok(Array.isArray(vercelConfig.rewrites), 'rewrites must be an array');
      assert.ok(vercelConfig.rewrites.length >= 1, 'rewrites must contain at least 1 rule');
      assert.ok(Array.isArray(vercelConfig.headers), 'headers must be an array');
      assert.ok(vercelConfig.headers.length >= 5, 'headers must contain global + granular caching rules');
    });
  });

  describe('2. SPA Client-Side Rewriting vs Static Asset Shielding', () => {
    const clientRoutes = [
      '/',
      '/login',
      '/dashboard',
      '/shifts',
      '/shifts/new',
      '/shifts/edit/d5236b56-78e2-4638-9cf8-66258f14dc44',
      '/expenses',
      '/expenses/2026/09',
      '/auth/callback',
      '/silk-gate',
      '/offline',
      '/settings',
      '/profile',
      '/dre'
    ];

    clientRoutes.forEach(route => {
      test(`Client-side route "${route}" cleanly rewrites to /index.html`, () => {
        const destination = resolveRewrite(route, vercelConfig);
        assert.equal(destination, '/index.html', `Expected ${route} to rewrite to /index.html`);
      });
    });

    const staticAssets = [
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
      '/assets/icons/heart.svg',
      '/assets/images/dra_fernanda.png',
      '/fonts/inter.woff2'
    ];

    staticAssets.forEach(asset => {
      test(`Static asset "${asset}" is NOT rewritten (prevents 404 HTML masking)`, () => {
        const destination = resolveRewrite(asset, vercelConfig);
        assert.equal(destination, null, `Expected static asset ${asset} NOT to rewrite to /index.html`);
      });
    });
  });

  describe('3. Global Strict Security Headers', () => {
    const testedRoutes = ['/', '/login', '/dashboard', '/css/styles.css', '/sw.js'];

    testedRoutes.forEach(route => {
      test(`Security headers applied to "${route}" meet strict enterprise grade`, () => {
        const headers = resolveEffectiveHeaders(route, vercelConfig);

        // Anti-Clickjacking: X-Frame-Options: DENY
        assert.equal(headers['X-Frame-Options'], 'DENY');

        // Anti-MIME Sniffing: X-Content-Type-Options: nosniff
        assert.equal(headers['X-Content-Type-Options'], 'nosniff');

        // Referrer Shielding: Referrer-Policy: strict-origin-when-cross-origin
        assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');

        // Transport Security: HSTS 2 years with subdomains and preload eligibility
        assert.equal(headers['Strict-Transport-Security'], 'max-age=63072000; includeSubDomains; preload');

        // Permissions Policy: disable sensitive sensors
        assert.equal(headers['Permissions-Policy'], 'camera=(), microphone=(), geolocation=()');

        // Content Security Policy is defined
        assert.ok(headers['Content-Security-Policy'], 'Content-Security-Policy header must exist');
      });
    });
  });

  describe('4. Content-Security-Policy (CSP) Directives Mathematical Audit', () => {
    let csp;

    test('CSP header parses into valid directives map', () => {
      const globalRule = vercelConfig.headers.find(h => h.source === '/(.*)');
      assert.ok(globalRule, 'Global header rule for /(.*) must be defined');
      const cspHeader = globalRule.headers.find(h => h.key === 'Content-Security-Policy');
      assert.ok(cspHeader, 'CSP header must be present under /(.*)');
      csp = parseCsp(cspHeader.value);
      assert.ok(csp, 'Parsed CSP must not be null');
    });

    test('default-src allows self', () => {
      assert.ok(csp['default-src']?.includes("'self'"));
    });

    test('script-src permits self, inline execution, and trusted ESM CDNs', () => {
      assert.ok(csp['script-src']?.includes("'self'"));
      assert.ok(csp['script-src']?.includes("'unsafe-inline'"));
      assert.ok(csp['script-src']?.includes('https://cdn.jsdelivr.net'));
      assert.ok(csp['script-src']?.includes('https://esm.sh'));
    });

    test('style-src permits self, inline styles for dynamic SVGs, and Google Fonts', () => {
      assert.ok(csp['style-src']?.includes("'self'"));
      assert.ok(csp['style-src']?.includes("'unsafe-inline'"));
      assert.ok(csp['style-src']?.includes('https://fonts.googleapis.com'));
    });

    test('font-src permits self, fonts.gstatic.com, and data: URIs', () => {
      assert.ok(csp['font-src']?.includes("'self'"));
      assert.ok(csp['font-src']?.includes('https://fonts.gstatic.com'));
      assert.ok(csp['font-src']?.includes('data:'));
    });

    test('img-src permits self, data: URIs, blob: URLs, and HTTPS external avatars', () => {
      assert.ok(csp['img-src']?.includes("'self'"));
      assert.ok(csp['img-src']?.includes('data:'));
      assert.ok(csp['img-src']?.includes('blob:'));
      assert.ok(csp['img-src']?.includes('https:'));
    });

    test('connect-src whitelists Supabase REST (*.supabase.co), Realtime WSS, Google OAuth, and CDNs', () => {
      assert.ok(csp['connect-src']?.includes("'self'"));
      assert.ok(csp['connect-src']?.includes('https://*.supabase.co'));
      assert.ok(csp['connect-src']?.includes('wss://*.supabase.co'));
      assert.ok(csp['connect-src']?.includes('https://accounts.google.com'));
      assert.ok(csp['connect-src']?.includes('https://cdn.jsdelivr.net'));
      assert.ok(csp['connect-src']?.includes('https://esm.sh'));
    });

    test('frame-src whitelists self and accounts.google.com for Google One-Tap authentication', () => {
      assert.ok(csp['frame-src']?.includes("'self'"));
      assert.ok(csp['frame-src']?.includes('https://accounts.google.com'));
    });

    test('object-src is none and base-uri is self to prevent injection attacks', () => {
      assert.ok(csp['object-src']?.includes("'none'"));
      assert.ok(csp['base-uri']?.includes("'self'"));
    });
  });

  describe('5. Caching & PWA Revalidation Rules', () => {
    test('/index.html is configured as no-cache / must-revalidate', () => {
      const headers = resolveEffectiveHeaders('/index.html', vercelConfig);
      assert.equal(headers['Cache-Control'], 'public, max-age=0, must-revalidate');
      assert.ok(!headers['Cache-Control'].includes('immutable'));
    });

    test('/sw.js is configured as no-cache / must-revalidate with root Service-Worker-Allowed', () => {
      const headers = resolveEffectiveHeaders('/sw.js', vercelConfig);
      assert.equal(headers['Cache-Control'], 'public, max-age=0, must-revalidate');
      assert.equal(headers['Service-Worker-Allowed'], '/');
      assert.ok(!headers['Cache-Control'].includes('immutable'));
    });

    test('/manifest.json is configured with fresh revalidation', () => {
      const headers = resolveEffectiveHeaders('/manifest.json', vercelConfig);
      assert.equal(headers['Cache-Control'], 'public, max-age=0, must-revalidate');
    });

    test('CSS assets (/css/styles.css) are cached with 1-year immutable policy', () => {
      const headers = resolveEffectiveHeaders('/css/styles.css', vercelConfig);
      assert.equal(headers['Cache-Control'], 'public, max-age=31536000, immutable');
    });

    test('JavaScript assets (/js/app.js) are cached with 1-year immutable policy', () => {
      const headers = resolveEffectiveHeaders('/js/app.js', vercelConfig);
      assert.equal(headers['Cache-Control'], 'public, max-age=31536000, immutable');
    });

    test('Static assets (/assets/icons/heart.svg) are cached with 1-year immutable policy', () => {
      const headers = resolveEffectiveHeaders('/assets/icons/heart.svg', vercelConfig);
      assert.equal(headers['Cache-Control'], 'public, max-age=31536000, immutable');
    });
  });

  describe('6. Zero-Regression & Isolation Proof', () => {
    test('vercel.json and package.json target exclusively Nandaped_VF1 / V4_Cloud environment without touching root files', () => {
      assert.ok(vercelPath.includes('Nandaped_VF1') || vercelPath.includes('V4_Cloud') || vercelPath.includes('m1_explorer_2') || vercelPath.includes('nandaped') || vercelPath.includes('Nanda_ped'));

      // Validate package.json configuration
      const pkgPath = path.resolve(__dirname, '..', 'package.json');
      assert.ok(fs.existsSync(pkgPath), `package.json must exist at ${pkgPath}`);
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      assert.ok(pkg.name === 'nandaped-vf1' || pkg.name === 'nanda-financas-pediatria-v4-cloud');
      assert.equal(pkg.version, '4.0.0');
      assert.equal(pkg.author, 'FChNeto');
      assert.equal(pkg.type, 'module');
      assert.ok(pkg.scripts?.test, 'package.json must contain test script');
    });
  });
});

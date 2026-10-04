/**
 * v6_runtime_config_and_auth.test.js
 * Test Suite: Public Runtime Config & Auth Security for Finanças Pediatria v6
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import apiConfigHandler from '../api/config.js';
import {
  APP_CREATOR,
  APP_VERSION,
  STORAGE_KEYS,
  parseJwtPayload,
  isServiceRoleKey,
  normalizeSupabaseUrl,
  isValidSupabaseUrl,
  isValidSupabaseAnonKey,
  getConfig,
  getSystemDiagnostics
} from '../js/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v6Dir = path.resolve(__dirname, '..');

// Helper to create valid fake JWT
function makeFakeJwt(role = 'anon') {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ role, exp: 9999999999, iss: 'supabase' })).toString('base64url');
  const sig = 'fakesignature1234567890';
  return `${header}.${payload}.${sig}`;
}

describe('Finanças Pediatria v6 - Runtime Config & Auth Security Suite', () => {

  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('1. Serverless API Endpoint (/api/config)', () => {

    function createMockRes() {
      const res = {
        statusCode: 200,
        headers: {},
        body: null,
        setHeader(name, value) {
          this.headers[name.toLowerCase()] = value;
          return this;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        }
      };
      return res;
    }

    test('Rejects non-GET HTTP methods with 405 Method Not Allowed', () => {
      const methods = ['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
      for (const method of methods) {
        const req = { method };
        const res = createMockRes();
        apiConfigHandler(req, res);
        assert.equal(res.statusCode, 405);
        assert.equal(res.body.configured, false);
        assert.equal(res.headers['allow'], 'GET');
      }
    });

    test('Enforces no-store Cache-Control header to prevent stale credential caching', () => {
      const req = { method: 'GET' };
      const res = createMockRes();
      apiConfigHandler(req, res);
      assert.equal(res.headers['cache-control'], 'no-store, max-age=0');
      assert.ok(res.headers['content-type'].includes('application/json'));
    });

    test('Returns configured: false when environment variables are missing', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;
      delete process.env.SUPABASE_PUBLISHABLE_KEY;

      const req = { method: 'GET' };
      const res = createMockRes();
      apiConfigHandler(req, res);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { configured: false });
    });

    test('Rejects non-HTTPS Supabase URLs', () => {
      process.env.SUPABASE_URL = 'http://xyz.supabase.co';
      process.env.SUPABASE_ANON_KEY = makeFakeJwt('anon');

      const req = { method: 'GET' };
      const res = createMockRes();
      apiConfigHandler(req, res);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { configured: false });
    });

    test('Rejects service_role keys in environment variables', () => {
      process.env.SUPABASE_URL = 'https://pediatric-db.supabase.co';
      process.env.SUPABASE_ANON_KEY = makeFakeJwt('service_role');

      const req = { method: 'GET' };
      const res = createMockRes();
      apiConfigHandler(req, res);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { configured: false });
    });

    test('Rejects keys with lexical service_role or admin substrings', () => {
      process.env.SUPABASE_URL = 'https://pediatric-db.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'sb_secret_service_role_master_key_1234567890';

      const req = { method: 'GET' };
      const res = createMockRes();
      apiConfigHandler(req, res);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { configured: false });
    });

    test('Successfully exposes valid HTTPS URL and anon key', () => {
      const anonToken = makeFakeJwt('anon');
      process.env.SUPABASE_URL = 'https://pediatric-db.supabase.co/';
      process.env.SUPABASE_ANON_KEY = anonToken;

      const req = { method: 'GET' };
      const res = createMockRes();
      apiConfigHandler(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.configured, true);
      assert.equal(res.body.SUPABASE_URL, 'https://pediatric-db.supabase.co');
      assert.equal(res.body.SUPABASE_ANON_KEY, anonToken);
    });

    test('Supports sb_publishable_ standard modern keys', () => {
      process.env.SUPABASE_URL = 'https://pediatric-db.supabase.co';
      process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_abcdef1234567890';

      const req = { method: 'GET' };
      const res = createMockRes();
      apiConfigHandler(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.configured, true);
      assert.equal(res.body.SUPABASE_ANON_KEY, 'sb_publishable_abcdef1234567890');
    });
  });

  describe('2. Client Config Validation & JWT Inspection (js/config.js)', () => {

    test('parseJwtPayload decodes valid JWT and handles edge cases', () => {
      const jwt = makeFakeJwt('anon');
      const payload = parseJwtPayload(jwt);
      assert.ok(payload);
      assert.equal(payload.role, 'anon');

      assert.equal(parseJwtPayload(''), null);
      assert.equal(parseJwtPayload(null), null);
      assert.equal(parseJwtPayload('not.a.jwt'), null);
      assert.equal(parseJwtPayload('invalid_token'), null);
    });

    test('isServiceRoleKey accurately identifies and rejects privileged keys', () => {
      // Lexical matches
      assert.equal(isServiceRoleKey('service_role_key_secret_1234567890'), true);
      assert.equal(isServiceRoleKey('SUPABASE_ADMIN_KEY_1234567890'), true);
      assert.equal(isServiceRoleKey('secret-key-production'), true);

      // JWT payload matches
      assert.equal(isServiceRoleKey(makeFakeJwt('service_role')), true);
      assert.equal(isServiceRoleKey(makeFakeJwt('supabase_admin')), true);
      assert.equal(isServiceRoleKey(makeFakeJwt('postgres')), true);

      // Safe anon keys
      assert.equal(isServiceRoleKey(makeFakeJwt('anon')), false);
      assert.equal(isServiceRoleKey('sb_publishable_safekey1234567890'), false);
    });

    test('normalizeSupabaseUrl handles dashboard links and trailing slashes', () => {
      assert.equal(
        normalizeSupabaseUrl('https://supabase.com/dashboard/project/abcdefghij'),
        'https://abcdefghij.supabase.co'
      );
      assert.equal(
        normalizeSupabaseUrl('https://app.supabase.com/dashboard/project/abcdefghij/'),
        'https://abcdefghij.supabase.co'
      );
      assert.equal(
        normalizeSupabaseUrl('https://abcdefghij.supabase.co///'),
        'https://abcdefghij.supabase.co'
      );
      assert.equal(normalizeSupabaseUrl(''), '');
      assert.equal(normalizeSupabaseUrl(null), '');
    });

    test('isValidSupabaseUrl enforces HTTPS and rejects dangerous schemes', () => {
      assert.equal(isValidSupabaseUrl('https://pediatric.supabase.co'), true);
      assert.equal(isValidSupabaseUrl('https://supabase.com/dashboard/project/abcdef'), true);

      assert.equal(isValidSupabaseUrl('http://pediatric.supabase.co'), false);
      assert.equal(isValidSupabaseUrl('javascript:alert(1)'), false);
      assert.equal(isValidSupabaseUrl('ftp://server.local'), false);
      assert.equal(isValidSupabaseUrl('data:text/plain;base64,abc'), false);
      assert.equal(isValidSupabaseUrl(''), false);
      assert.equal(isValidSupabaseUrl(null), false);
    });

    test('isValidSupabaseAnonKey validates minimum length and blocks service roles', () => {
      assert.equal(isValidSupabaseAnonKey(makeFakeJwt('anon')), true);
      assert.equal(isValidSupabaseAnonKey('sb_publishable_long_safe_key_12345'), true);

      assert.equal(isValidSupabaseAnonKey('short'), false);
      assert.equal(isValidSupabaseAnonKey(makeFakeJwt('service_role')), false);
      assert.equal(isValidSupabaseAnonKey('service_role_secret_key_1234567890'), false);
      assert.equal(isValidSupabaseAnonKey(''), false);
      assert.equal(isValidSupabaseAnonKey(null), false);
    });

    test('STORAGE_KEYS uses v6 namespace with legacy fallbacks', () => {
      assert.equal(STORAGE_KEYS.SUPABASE_URL, 'v6_supabase_url');
      assert.equal(STORAGE_KEYS.SUPABASE_ANON_KEY, 'v6_supabase_anon_key');
      assert.equal(STORAGE_KEYS.OFFLINE_MODE, 'v6_offline_mode');
      assert.equal(STORAGE_KEYS.GUEST_MODE, 'nanda_v6_guest_mode');
      assert.equal(STORAGE_KEYS.ACTIVE_CLOUD_USER, 'v6_active_user_id');

      assert.equal(STORAGE_KEYS.SUPABASE_URL_LEGACY, 'v4_cloud_supabase_url');
      assert.equal(STORAGE_KEYS.GUEST_MODE_LEGACY, 'nanda_v4_guest_mode');
    });

    test('getSystemDiagnostics returns safe diagnostics without exposing tokens', () => {
      const diag = getSystemDiagnostics();
      assert.ok(diag);
      assert.equal(diag.appVersion, APP_VERSION);
      assert.equal(diag.appCreator, APP_CREATOR);
      assert.equal(typeof diag.configured, 'boolean');
      assert.equal(typeof diag.hasSupabaseUrl, 'boolean');
      assert.equal(typeof diag.hasAnonKey, 'boolean');
      assert.equal(typeof diag.isLocalConfig, 'boolean');
      assert.equal(diag.isServiceRoleBlocked, true);
      assert.equal(diag.expectedMigrationVersion, '005');
      assert.ok(Array.isArray(diag.authProviders));
      assert.ok(diag.authProviders.includes('google'));
      assert.ok(diag.authProviders.includes('magic_link'));
      assert.ok(diag.authProviders.includes('password'));

      // Ensure raw tokens are not included
      const diagStr = JSON.stringify(diag);
      assert.ok(!diagStr.includes('eyJhbGciOi'));
      assert.ok(!diagStr.includes('sb_publishable_'));
    });

    test('getConfig blocks localStorage fallback when server explicitly returns unconfigured', async () => {
      const { loadRuntimeConfig } = await import('../js/config.js');

      // Mock window and localStorage
      const mockStorage = new Map();
      mockStorage.set('v6_supabase_url', 'https://stale-project.supabase.co');
      mockStorage.set('v6_supabase_anon_key', makeFakeJwt('anon'));

      const origWindow = globalThis.window;
      const origFetch = globalThis.fetch;
      const origLocalStorage = globalThis.localStorage;

      globalThis.localStorage = {
        getItem: (k) => mockStorage.get(k) || null,
        setItem: (k, v) => mockStorage.set(k, v),
        removeItem: (k) => mockStorage.delete(k)
      };

      globalThis.fetch = async () => ({
        ok: true,
        json: async () => ({ configured: false })
      });

      globalThis.window = {
        location: { origin: 'https://test-pediatria.vercel.app', pathname: '/' },
        dispatchEvent: () => {}
      };

      try {
        const conf = await loadRuntimeConfig();
        assert.equal(conf.isConfigured, false);
        assert.equal(conf.runtimeUnconfigured, true);
        assert.equal(conf.supabaseUrl, null);
        assert.equal(conf.supabaseAnonKey, null);
      } finally {
        globalThis.window = origWindow;
        globalThis.fetch = origFetch;
        globalThis.localStorage = origLocalStorage;
      }
    });

    test('getAuthRedirectUrl preserves subdirectory paths on GitHub Pages and custom deployments', async () => {
      const { getAuthRedirectUrl } = await import('../js/supabaseClient.js');

      const origWindow = globalThis.window;

      // Scenario 1: GitHub Pages subdirectory with trailing slash
      globalThis.window = {
        location: {
          origin: 'https://drnanda.github.io',
          pathname: '/Nanda_ped/v6/',
          search: '',
          hash: ''
        }
      };
      assert.equal(getAuthRedirectUrl(), 'https://drnanda.github.io/Nanda_ped/v6/');

      // Scenario 2: GitHub Pages subdirectory with index.html
      globalThis.window = {
        location: {
          origin: 'https://drnanda.github.io',
          pathname: '/Nanda_ped/v6/index.html',
          search: '',
          hash: ''
        }
      };
      assert.equal(getAuthRedirectUrl(), 'https://drnanda.github.io/Nanda_ped/v6/');

      // Scenario 3: Root domain (Vercel)
      globalThis.window = {
        location: {
          origin: 'https://financas-pediatria.vercel.app',
          pathname: '/',
          search: '',
          hash: ''
        }
      };
      assert.equal(getAuthRedirectUrl(), 'https://financas-pediatria.vercel.app/');

      // Scenario 4: Custom path
      globalThis.window = {
        location: {
          origin: 'https://my-app.com',
          pathname: '/app',
          search: '',
          hash: ''
        }
      };
      assert.equal(getAuthRedirectUrl(), 'https://my-app.com/app');

      // Scenario 5: Headless / window undefined fallback
      delete globalThis.window;
      assert.equal(getAuthRedirectUrl(), 'http://localhost');

      globalThis.window = origWindow;
    });
  });

  describe('3. Static Code Security & Hardcoded Secrets Scan', () => {

    test('Zero hardcoded production secrets across all v6 source files', () => {
      const filesToScan = [
        'js/config.js',
        'js/app.js',
        'js/store.js',
        'js/db.js',
        'js/sync.js',
        'js/supabaseClient.js',
        'js/ui.js',
        'api/config.js',
        'index.html',
        'sw.js'
      ];

      for (const relPath of filesToScan) {
        const fullPath = path.join(v6Dir, relPath);
        if (!fs.existsSync(fullPath)) continue;

        const content = fs.readFileSync(fullPath, 'utf-8');

        // Check for real Supabase URLs (excluding example/test domains)
        const realSupabaseMatch = content.match(/https:\/\/[a-z0-9]{20}\.supabase\.co/gi);
        assert.equal(
          realSupabaseMatch,
          null,
          `File ${relPath} must not contain live Supabase project endpoints. Found: ${realSupabaseMatch}`
        );

        // Check for hardcoded service_role keys
        const hardcodedServiceMatch = content.match(/eyJhbGciOi[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g);
        if (hardcodedServiceMatch) {
          for (const token of hardcodedServiceMatch) {
            const payload = parseJwtPayload(token);
            if (payload) {
              assert.notEqual(payload.role, 'service_role', `File ${relPath} contains a service_role token!`);
              assert.notEqual(payload.role, 'supabase_admin', `File ${relPath} contains an admin token!`);
            }
          }
        }
      }
    });

    test('Canonical author FChNeto is preserved in config.js', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(APP_VERSION, '6.0.0');
    });
  });
});

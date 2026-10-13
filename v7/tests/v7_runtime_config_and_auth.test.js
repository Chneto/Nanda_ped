/**
 * v7_runtime_config_and_auth.test.js
 * Test Suite: Public Runtime Config & Auth Security for Finanças Pediatria v7
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
import { getAuthRedirectUrl } from '../js/supabaseClient.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v7Dir = path.resolve(__dirname, '..');

// Helper to create valid fake JWT
function makeFakeJwt(role = 'anon') {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ role, exp: 9999999999, iss: 'supabase' })).toString('base64url');
  const sig = 'fakesignature1234567890';
  return `${header}.${payload}.${sig}`;
}

describe('Finanças Pediatria v7 - Runtime Config & Auth Security Suite', () => {

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

    test('Rejects invalid non-HTTPS Supabase URLs', () => {
      process.env.SUPABASE_URL = 'http://insecure-site.com';
      process.env.SUPABASE_ANON_KEY = makeFakeJwt('anon');

      const req = { method: 'GET' };
      const res = createMockRes();
      apiConfigHandler(req, res);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { configured: false });
    });

    test('Strictly rejects service_role or admin secret keys from ever being exposed', () => {
      process.env.SUPABASE_URL = 'https://valid-project.supabase.co';
      process.env.SUPABASE_ANON_KEY = makeFakeJwt('service_role');

      const req = { method: 'GET' };
      const res = createMockRes();
      apiConfigHandler(req, res);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { configured: false });
    });

    test('Returns valid public configuration when environment variables are healthy', () => {
      process.env.SUPABASE_URL = 'https://healthy-proj.supabase.co';
      const fakeAnon = makeFakeJwt('anon');
      process.env.SUPABASE_ANON_KEY = fakeAnon;

      const req = { method: 'GET' };
      const res = createMockRes();
      apiConfigHandler(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.configured, true);
      assert.equal(res.body.SUPABASE_URL, 'https://healthy-proj.supabase.co');
      assert.equal(res.body.SUPABASE_ANON_KEY, fakeAnon);
      assert.equal(res.body.version, '7.0.0');
    });
  });

  describe('2. Client-side Config & Diagnostic Engine', () => {

    test('v7 storage keys use isolated v7_ namespaces', () => {
      assert.equal(STORAGE_KEYS.SUPABASE_URL, 'v7_supabase_url');
      assert.equal(STORAGE_KEYS.SUPABASE_ANON_KEY, 'v7_supabase_anon_key');
      assert.equal(STORAGE_KEYS.OFFLINE_MODE, 'v7_offline_mode');
      assert.equal(STORAGE_KEYS.DATA, 'v7_pediatric_data');
      assert.equal(STORAGE_KEYS.CLOUD_REVISION, 'v7_cloud_revision');
    });

    test('parseJwtPayload correctly decodes base64url JWT payload', () => {
      const token = makeFakeJwt('anon');
      const payload = parseJwtPayload(token);
      assert.ok(payload);
      assert.equal(payload.role, 'anon');
      assert.equal(payload.iss, 'supabase');
    });

    test('isServiceRoleKey detects privileged tokens and rejects them', () => {
      const anonToken = makeFakeJwt('anon');
      const serviceToken = makeFakeJwt('service_role');
      const adminToken = makeFakeJwt('supabase_admin');

      assert.equal(isServiceRoleKey(anonToken), false);
      assert.equal(isServiceRoleKey(serviceToken), true);
      assert.equal(isServiceRoleKey(adminToken), true);
    });

    test('isValidSupabaseUrl and normalizeSupabaseUrl behave safely', () => {
      assert.equal(isValidSupabaseUrl('https://abc123xyz.supabase.co'), true);
      assert.equal(isValidSupabaseUrl('http://abc123xyz.supabase.co'), false);
      assert.equal(isValidSupabaseUrl('not-a-url'), false);

      assert.equal(normalizeSupabaseUrl('https://myproj.supabase.co/'), 'https://myproj.supabase.co');
    });

    test('getSystemDiagnostics returns expected diagnostic structure with version 006', async () => {
      const diagnostics = await getSystemDiagnostics();
      assert.ok(diagnostics);
      assert.equal(diagnostics.appCreator, 'FChNeto');
      assert.equal(diagnostics.appVersion, '7.0.0');
      assert.equal(diagnostics.expectedMigrationVersion, '006');
      assert.ok('configured' in diagnostics);
      assert.ok('storageAvailable' in diagnostics);
      assert.ok('authProviders' in diagnostics);
    });

    test('App UI wires real-time diagnostic panel in modal-cloud-config', () => {
      const htmlContent = fs.readFileSync(path.join(v7Dir, 'index.html'), 'utf-8');
      assert.ok(htmlContent.includes('id="cloud-diagnostics-panel"'), 'Modal must have cloud-diagnostics-panel');
      assert.ok(htmlContent.includes('id="btn-refresh-diagnostics"'), 'Modal must have refresh diagnostics button');

      const appJs = fs.readFileSync(path.join(v7Dir, 'js', 'app.js'), 'utf-8');
      assert.ok(appJs.includes('renderDiagnostics'), 'app.js must define renderDiagnostics');
      assert.ok(appJs.includes('getSystemDiagnostics'), 'app.js must call getSystemDiagnostics');
    });

    test('getAuthRedirectUrl preserves origin and subpaths properly', () => {
      const origWindow = globalThis.window;

      // Scenario 1: Root Vercel deployment
      globalThis.window = {
        location: {
          origin: 'https://nandaped.vercel.app',
          pathname: '/',
          search: '',
          hash: ''
        }
      };
      assert.equal(getAuthRedirectUrl(), 'https://nandaped.vercel.app/');

      // Scenario 2: GitHub Pages subpath deployment (/Nanda_ped/)
      globalThis.window = {
        location: {
          origin: 'https://chneto.github.io',
          pathname: '/Nanda_ped/',
          search: '',
          hash: ''
        }
      };
      assert.equal(getAuthRedirectUrl(), 'https://chneto.github.io/Nanda_ped/');

      // Scenario 3: Deep nested page with index.html
      globalThis.window = {
        location: {
          origin: 'https://example.com',
          pathname: '/v7/index.html',
          search: '?foo=bar',
          hash: '#section'
        }
      };
      assert.equal(getAuthRedirectUrl(), 'https://example.com/v7/');

      globalThis.window = origWindow;
    });
  });

  describe('3. Static Code Security & Hardcoded Secrets Scan', () => {

    test('Zero hardcoded production secrets across all v7 source files', () => {
      const filesToScan = [
        'js/config.js',
        'js/app.js',
        'js/store.js',
        'js/supabaseClient.js',
        'js/ui.js',
        'api/config.js',
        'index.html',
        'sw.js'
      ];

      for (const relPath of filesToScan) {
        const fullPath = path.join(v7Dir, relPath);
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
      assert.equal(APP_VERSION, '7.0.0');
    });
  });
});

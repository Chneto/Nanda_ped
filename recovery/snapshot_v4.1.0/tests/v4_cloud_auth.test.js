/**
 * v4_cloud_auth.test.js
 * Test Suite for Milestone M3: Silk Gate Auth & Offline Resilience Engine
 * 
 * Verifies:
 * 1. Canonical Author & Brand Integrity (APP_CREATOR = 'FChNeto')
 * 2. URL & Key Validation with Strict Rejection of service_role Keys (String & JWT Payload)
 * 3. Credential Management Lifecycle (saveConfig, getConfig, clearConfig, Precedence, Events)
 * 4. Offline / Guest Mode State Machine (nanda_v4_guest_mode = 'true', IndexedDB local-first, event dispatch)
 * 5. Supabase Reachability Probe (Ping, latency calculation, 401 unauthorized, timeout handling)
 * 6. Supabase Client Integration & Auth API (Google OAuth, Magic Link, signOut, getSession, URL hash cleanup, ensureProfile)
 * 7. Degraded Offline Mock Contracts & Zero-Crash Guarantees
 * 8. Silk Gate DOM & CSS Architecture Verification (Exact copy strings, inline SVGs, in-flow expansion)
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v4Root = path.resolve(__dirname, '..');

import {
  APP_CREATOR,
  STORAGE_KEYS,
  isValidSupabaseUrl,
  isValidSupabaseAnonKey,
  isServiceRoleKey,
  parseJwtPayload,
  getConfig,
  saveConfig,
  clearConfig,
  isOfflineMode,
  setOfflineMode,
  isGuestMode,
  setGuestMode,
  testSupabaseReachability
} from '../js/config.js';

import {
  initSupabase,
  initSupabaseAsync,
  getSupabase,
  signInWithGoogle,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
  signOut,
  getSession,
  parseOAuthHash,
  clearOAuthHashFromUrl,
  ensureProfile,
  onAuthStateChange,
  createDegradedClient,
  assertNotServiceRoleKey,
  base64Decode,
  isOfflineFallbackActive,
  isClientConfigured,
  _setCreateClientForTesting,
  _resetClientForTesting
} from '../js/supabaseClient.js';

// ============================================================================
// MOCKS & TEST UTILITIES
// ============================================================================

class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(String(key)) ? this.store.get(String(key)) : null;
  }
  setItem(key, value) {
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    this.store.delete(String(key));
  }
  clear() {
    this.store.clear();
  }
}

function createSampleJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'test_signature_long_enough_1234567890';
  return `${header}.${body}.${signature}`;
}

// ============================================================================
// TEST SUITE: SILK GATE AUTH & OFFLINE RESILIENCE ENGINE
// ============================================================================

describe('Finanças Pediatria V4_Cloud — Silk Gate Auth & Offline Resilience Engine', () => {
  let savedLocalStorage;
  let savedWindow;
  let mockStorage;
  let dispatchedEvents;

  beforeEach(() => {
    savedLocalStorage = globalThis.localStorage;
    savedWindow = globalThis.window;
    mockStorage = new MockLocalStorage();
    dispatchedEvents = [];

    globalThis.localStorage = mockStorage;
    globalThis.window = {
      localStorage: mockStorage,
      location: {
        origin: 'https://financas-pediatria.vercel.app',
        pathname: '/',
        search: '',
        hash: ''
      },
      history: {
        replaceState: (state, title, url) => {
          globalThis.window.location.hash = '';
          globalThis.window.lastReplacedUrl = url;
        }
      },
      dispatchEvent: (event) => {
        dispatchedEvents.push(event);
      },
      CustomEvent: class CustomEvent {
        constructor(type, init) {
          this.type = type;
          this.detail = init?.detail;
        }
      }
    };

    _resetClientForTesting();
  });

  afterEach(() => {
    _resetClientForTesting();
    globalThis.localStorage = savedLocalStorage;
    globalThis.window = savedWindow;
  });

  // --------------------------------------------------------------------------
  // 1. CANONICAL AUTHOR & BRAND INTEGRITY
  // --------------------------------------------------------------------------
  describe('1. Canonical Author & Configuration Constants', () => {
    test('Canonic author APP_CREATOR is strictly FChNeto', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
    });

    test('STORAGE_KEYS contains mandatory keys including canonical nanda_v4_guest_mode', () => {
      assert.ok(STORAGE_KEYS.SUPABASE_URL, 'SUPABASE_URL storage key must exist');
      assert.ok(STORAGE_KEYS.SUPABASE_ANON_KEY, 'SUPABASE_ANON_KEY storage key must exist');
      assert.ok(STORAGE_KEYS.OFFLINE_MODE, 'OFFLINE_MODE storage key must exist');
      assert.ok(STORAGE_KEYS.OFFLINE_MODE_LEGACY, 'OFFLINE_MODE_LEGACY storage key must exist');
      assert.equal(STORAGE_KEYS.GUEST_MODE, 'nanda_v4_guest_mode', 'Primary guest mode key must be nanda_v4_guest_mode');
      assert.equal(STORAGE_KEYS.GUEST_MODE_LEGACY, 'v4_cloud_guest_mode', 'Legacy guest mode key must be v4_cloud_guest_mode');
    });

    test('Unconfigured state returns null credentials and isConfigured === false', () => {
      const cfg = getConfig();
      assert.equal(cfg.supabaseUrl, null);
      assert.equal(cfg.supabaseAnonKey, null);
      assert.equal(cfg.isConfigured, false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. URL & ANON KEY VALIDATION & STRICT SERVICE_ROLE REJECTION
  // --------------------------------------------------------------------------
  describe('2. Key Validation & Strict Rejection of service_role Keys', () => {
    test('isValidSupabaseUrl accepts legitimate HTTPS Supabase domains and rejects non-HTTPS', () => {
      assert.equal(isValidSupabaseUrl('https://example.supabase.co'), true);
      assert.equal(isValidSupabaseUrl('https://example-project.supabase.co'), true);
      assert.equal(isValidSupabaseUrl('https://custom-gateway.hospital.med.br/supabase'), true);

      // Rejections
      assert.equal(isValidSupabaseUrl('http://insecure.supabase.co'), false, 'HTTP must be rejected');
      assert.equal(isValidSupabaseUrl('ftp://supabase.co'), false);
      assert.equal(isValidSupabaseUrl('not-a-url'), false);
      assert.equal(isValidSupabaseUrl(''), false);
      assert.equal(isValidSupabaseUrl(null), false);
      assert.equal(isValidSupabaseUrl(undefined), false);
    });

    test('Rejects keys shorter than 20 characters', () => {
      assert.equal(isValidSupabaseAnonKey('short_key_19chars!!'), false);
      assert.equal(isValidSupabaseAnonKey(''), false);
      assert.equal(isValidSupabaseAnonKey(null), false);
    });

    test('Rejects plain text keys containing service_role or admin substrings', () => {
      assert.equal(isServiceRoleKey('service_role_key_long_enough_for_length_check'), true);
      assert.equal(isValidSupabaseAnonKey('service_role_key_long_enough_for_length_check'), false);
      assert.equal(isServiceRoleKey('supabase_admin_secret_token_12345'), true);
      assert.equal(isValidSupabaseAnonKey('supabase_admin_secret_token_12345'), false);
    });

    test('Rejects JWT keys with service_role in decoded payload even without literal substring in signature', () => {
      const serviceRoleToken = createSampleJwt({
        iss: 'supabase',
        ref: 'test-project',
        role: 'service_role',
        iat: 1710000000,
        exp: 2020000000
      });

      assert.equal(isServiceRoleKey(serviceRoleToken), true, 'Must detect service_role inside JWT payload');
      assert.equal(isValidSupabaseAnonKey(serviceRoleToken), false, 'Must reject service_role JWT as anon key');
    });

    test('Rejects JWT keys with supabase_admin or postgres administrative roles', () => {
      const adminToken = createSampleJwt({ role: 'supabase_admin', iss: 'supabase' });
      const postgresToken = createSampleJwt({ role: 'postgres', iss: 'supabase' });
      const superuserToken = createSampleJwt({ role: 'superuser', iss: 'supabase' });

      assert.equal(isServiceRoleKey(adminToken), true);
      assert.equal(isValidSupabaseAnonKey(adminToken), false);
      assert.equal(isServiceRoleKey(postgresToken), true);
      assert.equal(isValidSupabaseAnonKey(postgresToken), false);
      assert.equal(isServiceRoleKey(superuserToken), true);
      assert.equal(isValidSupabaseAnonKey(superuserToken), false);
    });

    test('Accepts valid Supabase Anon JWT keys with role === "anon"', () => {
      const validAnonJwt = createSampleJwt({
        iss: 'supabase',
        ref: 'test-project',
        role: 'anon',
        iat: 1710000000,
        exp: 2020000000
      });

      assert.equal(isServiceRoleKey(validAnonJwt), false, 'Anon role must not be classified as service_role');
      assert.equal(isValidSupabaseAnonKey(validAnonJwt), true, 'Valid anon JWT must be accepted');
    });

    test('assertNotServiceRoleKey throws fatal error for forbidden keys and passes for safe keys', () => {
      assert.throws(() => {
        assertNotServiceRoleKey('my_service_role_secret_key_12345');
      }, /Security Violation/);

      const serviceRoleJwt = createSampleJwt({ role: 'service_role' });
      assert.throws(() => {
        assertNotServiceRoleKey(serviceRoleJwt);
      }, /Security Violation/);

      const safeAnonJwt = createSampleJwt({ role: 'anon' });
      assert.doesNotThrow(() => {
        assertNotServiceRoleKey(safeAnonJwt);
      });
    });

    test('parseJwtPayload returns null on corrupted or malformed tokens', () => {
      assert.equal(parseJwtPayload('not.a.valid.jwt.string'), null);
      assert.equal(parseJwtPayload('single-part-token'), null);
      assert.equal(parseJwtPayload('part1.invalidbase64!@#$.part3'), null);
      assert.equal(parseJwtPayload(null), null);
    });

    test('parseJwtPayload correctly decodes unpadded base64url JWT tokens', () => {
      // Create various payloads that produce unpadded base64url strings with length % 4 !== 0
      const testCases = [
        { role: 'anon', iss: 'supabase' },
        { role: 'service_role', desc: 'test-admin' },
        { sub: '1234567890', name: 'Médica', iat: 1516239022 },
        { a: 'b' },
        { foo: 'bar', baz: [1, 2, 3] }
      ];

      for (const payload of testCases) {
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const body = Buffer.from(JSON.stringify(payload)).toString('base64url'); // base64url omits '='
        const token = `${header}.${body}.signature1234567890`;

        const parsed = parseJwtPayload(token);
        assert.ok(parsed, `Payload ${JSON.stringify(payload)} must decode successfully`);
        assert.deepEqual(parsed, payload);
      }
    });

    test('base64Decode utility safely decodes standard and URL-safe base64 strings', () => {
      const original = 'Médica — Finanças Pediatria';
      const encoded = Buffer.from(original).toString('base64url');
      assert.equal(base64Decode(encoded), original);
      assert.equal(base64Decode(''), '');
      assert.equal(base64Decode(null), '');
    });
  });

  // --------------------------------------------------------------------------
  // 3. CREDENTIAL STORAGE & LIFECYCLE
  // --------------------------------------------------------------------------
  describe('3. Credential Storage, Precedence & Event Notification', () => {
    const validUrl = 'https://dr-Profissional-cloud.supabase.co';
    const validAnonKey = createSampleJwt({ role: 'anon', ref: 'nanda-project' });

    test('saveConfig persists valid URL and Anon Key and dispatches v4_cloud_config_updated', () => {
      const result = saveConfig(validUrl, validAnonKey);
      assert.equal(result, true);

      assert.equal(mockStorage.getItem(STORAGE_KEYS.SUPABASE_URL), validUrl);
      assert.equal(mockStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY), validAnonKey);

      const cfg = getConfig();
      assert.equal(cfg.supabaseUrl, validUrl);
      assert.equal(cfg.supabaseAnonKey, validAnonKey);
      assert.equal(cfg.isConfigured, true);

      // Verify custom event
      assert.equal(dispatchedEvents.length, 1);
      assert.equal(dispatchedEvents[0].type, 'v4_cloud_config_updated');
      assert.equal(dispatchedEvents[0].detail.isConfigured, true);
    });

    test('saveConfig categorically rejects service_role keys without saving to localStorage', () => {
      const serviceRoleKey = createSampleJwt({ role: 'service_role' });
      const result = saveConfig(validUrl, serviceRoleKey);

      assert.equal(result, false, 'saveConfig must fail when service_role key is supplied');
      assert.equal(mockStorage.getItem(STORAGE_KEYS.SUPABASE_URL), null);
      assert.equal(mockStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY), null);
      assert.equal(getConfig().isConfigured, false);
    });

    test('clearConfig clears localStorage and emits config update event with isConfigured === false', () => {
      saveConfig(validUrl, validAnonKey);
      assert.equal(getConfig().isConfigured, true);

      clearConfig();
      assert.equal(mockStorage.getItem(STORAGE_KEYS.SUPABASE_URL), null);
      assert.equal(mockStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY), null);

      const cfg = getConfig();
      assert.equal(cfg.isConfigured, false);

      const lastEvent = dispatchedEvents[dispatchedEvents.length - 1];
      assert.equal(lastEvent.type, 'v4_cloud_config_updated');
      assert.equal(lastEvent.detail.isConfigured, false);
    });
  });

  // --------------------------------------------------------------------------
  // 4. OFFLINE & GUEST MODE STATE MACHINE
  // --------------------------------------------------------------------------
  describe('4. Offline / Guest Mode State Machine ("Modo Local / Convidada")', () => {
    test('Initial guest mode state is false', () => {
      assert.equal(isGuestMode(), false);
      assert.equal(isOfflineMode(), false);
    });

    test('Entering guest mode sets nanda_v4_guest_mode = "true" in localStorage', () => {
      setGuestMode(true);

      // Invariant: Storage must record nanda_v4_guest_mode = 'true'
      assert.equal(mockStorage.getItem('nanda_v4_guest_mode'), 'true');
      assert.equal(isGuestMode(), true);
    });

    test('Guest mode automatically activates offline mode to prevent cloud network stalls', () => {
      setOfflineMode(false);
      assert.equal(isOfflineMode(), false);

      setGuestMode(true);
      assert.equal(isGuestMode(), true);
      assert.equal(isOfflineMode(), true, 'Guest mode must activate offline mode');
    });

    test('Dual-write backward compatibility: writes both nanda_v4_guest_mode and v4_cloud_guest_mode', () => {
      setGuestMode(true);
      assert.equal(mockStorage.getItem('nanda_v4_guest_mode'), 'true');
      assert.equal(mockStorage.getItem('v4_cloud_guest_mode'), 'true');

      setGuestMode(false);
      assert.equal(mockStorage.getItem('nanda_v4_guest_mode'), 'false');
      assert.equal(mockStorage.getItem('v4_cloud_guest_mode'), 'false');
    });

    test('isGuestMode recognizes legacy v4_cloud_guest_mode = "true" key for backward compatibility', () => {
      mockStorage.setItem('v4_cloud_guest_mode', 'true');
      assert.equal(isGuestMode(), true);
    });

    test('Exiting guest mode clears guest state, deactivates offline mode, and emits v4_cloud_guest_mode_changed', () => {
      setGuestMode(true);
      assert.equal(isGuestMode(), true);
      assert.equal(isOfflineMode(), true);

      dispatchedEvents = [];
      setGuestMode(false);
      assert.equal(isGuestMode(), false);
      assert.equal(isOfflineMode(), false, 'Exiting guest mode must reset offline mode to false');
      assert.equal(mockStorage.getItem(STORAGE_KEYS.OFFLINE_MODE), 'false');

      const guestEvent = dispatchedEvents.find(e => e.type === 'v4_cloud_guest_mode_changed');
      assert.ok(guestEvent, 'Must emit v4_cloud_guest_mode_changed event');
      assert.equal(guestEvent.detail.isGuest, false);
    });

    test('State machine transition: setGuestMode(false) -> isOfflineMode() === false restores online state', () => {
      setGuestMode(true);
      assert.equal(isGuestMode(), true);
      assert.equal(isOfflineMode(), true);

      setGuestMode(false);
      assert.equal(isGuestMode(), false);
      assert.equal(isOfflineMode(), false, 'isOfflineMode must return false after setGuestMode(false)');
      assert.equal(mockStorage.getItem(STORAGE_KEYS.OFFLINE_MODE), 'false');
    });

    test('setOfflineMode independently controls forced hospital offline mode', () => {
      setGuestMode(false);
      dispatchedEvents = [];
      setOfflineMode(true);
      assert.equal(isOfflineMode(), true);
      assert.equal(isGuestMode(), false, 'Offline mode alone does not mean guest mode');

      const offlineEvent = dispatchedEvents.find(e => e.type === 'v4_cloud_offline_mode_changed');
      assert.ok(offlineEvent);
      assert.equal(offlineEvent.detail.isOffline, true);

      setOfflineMode(false);
      assert.equal(isOfflineMode(), false);
    });
  });

  // --------------------------------------------------------------------------
  // 5. SUPABASE REACHABILITY PROBE (CONNECTION TESTING)
  // --------------------------------------------------------------------------
  describe('5. Reachability Probe & Connection Testing Logic', () => {
    const validUrl = 'https://xyzcompany.supabase.co';
    const validAnon = createSampleJwt({ role: 'anon' });

    test('testSupabaseReachability rejects invalid URLs prior to any network call', async () => {
      const result = await testSupabaseReachability('http://insecure.supabase.co', validAnon);
      assert.equal(result.ok, false);
      assert.match(result.message, /URL inválida/i);
    });

    test('testSupabaseReachability immediately aborts and flags service_role keys', async () => {
      const serviceRoleKey = createSampleJwt({ role: 'service_role' });
      const result = await testSupabaseReachability(validUrl, serviceRoleKey);

      assert.equal(result.ok, false);
      assert.equal(result.isServiceRole, true);
      assert.match(result.message, /service_role detectada/i);
    });

    test('testSupabaseReachability reports successful connection on HTTP 200 with latency', async () => {
      const savedFetch = globalThis.fetch;
      try {
        globalThis.fetch = async (url, options) => {
          assert.match(url, /\/rest\/v1\//);
          assert.equal(options.headers.apikey, validAnon);
          return {
            ok: true,
            status: 200
          };
        };

        const result = await testSupabaseReachability(validUrl, validAnon, 3000);
        assert.equal(result.ok, true);
        assert.equal(result.status, 200);
        assert.ok(typeof result.latencyMs === 'number');
        assert.match(result.message, /sucesso/i);
      } finally {
        globalThis.fetch = savedFetch;
      }
    });

    test('testSupabaseReachability handles 401 unauthorized gracefully with specific guidance', async () => {
      const savedFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () => ({
          ok: false,
          status: 401
        });

        const result = await testSupabaseReachability(validUrl, validAnon, 3000);
        assert.equal(result.ok, false);
        assert.equal(result.status, 401);
        assert.match(result.message, /401/);
      } finally {
        globalThis.fetch = savedFetch;
      }
    });

    test('testSupabaseReachability handles network abort/timeout gracefully', async () => {
      const savedFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          throw err;
        };

        const result = await testSupabaseReachability(validUrl, validAnon, 100);
        assert.equal(result.ok, false);
        assert.match(result.message, /limite de conexão excedido/i);
      } finally {
        globalThis.fetch = savedFetch;
      }
    });
  });

  // --------------------------------------------------------------------------
  // 6. SUPABASE CLIENT & AUTH API INTEGRATION
  // --------------------------------------------------------------------------
  describe('6. Supabase Client Wrapper & Auth Flows', () => {
    const validUrl = 'https://pediatria-cloud.supabase.co';
    const validAnon = createSampleJwt({ role: 'anon', ref: 'pediatria' });

    test('initSupabase with mock creator returns active Supabase client and sets isOfflineFallback === false', () => {
      let createdClient = null;
      _setCreateClientForTesting((url, key, options) => {
        createdClient = {
          url,
          key,
          options,
          auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            signInWithOAuth: async (opts) => ({ data: { provider: opts.provider }, error: null }),
            signInWithOtp: async (opts) => ({ data: { user: null }, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
          },
          from: () => ({
            select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) })
          })
        };
        return createdClient;
      });

      const client = initSupabase(validUrl, validAnon);
      assert.ok(client);
      assert.equal(client.isOfflineFallback, false);
      assert.equal(isOfflineFallbackActive(), false);
      assert.equal(client.url, validUrl);
    });

    test('signInWithGoogle initiates OAuth with provider google and correct options', async () => {
      let oauthCalledWith = null;
      _setCreateClientForTesting((url, key) => ({
        auth: {
          signInWithOAuth: async (options) => {
            oauthCalledWith = options;
            return { data: { url: 'https://accounts.google.com/o/oauth2' }, error: null };
          },
          getSession: async () => ({ data: { session: null }, error: null })
        }
      }));

      initSupabase(validUrl, validAnon);
      const res = await signInWithGoogle();
      assert.ok(res.data);
      assert.equal(res.error, null);
      assert.equal(oauthCalledWith.provider, 'google');
      assert.equal(oauthCalledWith.options.redirectTo, 'https://financas-pediatria.vercel.app');
    });

    test('signInWithMagicLink validates email and triggers signInWithOtp', async () => {
      let otpCalledWith = null;
      _setCreateClientForTesting(() => ({
        auth: {
          signInWithOtp: async (options) => {
            otpCalledWith = options;
            return { data: {}, error: null };
          },
          getSession: async () => ({ data: { session: null }, error: null })
        }
      }));

      initSupabase(validUrl, validAnon);

      // Rejects invalid email
      const invalidRes = await signInWithMagicLink('not-an-email');
      assert.equal(invalidRes.data, null);
      assert.match(invalidRes.error.message, /e-mail válido/i);

      // Accepts valid doctor email
      const validRes = await signInWithMagicLink('medica@example.com');
      assert.ok(validRes.data);
      assert.equal(validRes.error, null);
      assert.equal(otpCalledWith.email, 'medica@example.com');
      assert.equal(otpCalledWith.options.emailRedirectTo, 'https://financas-pediatria.vercel.app');
    });

    test('signInWithPassword validates email and password constraints and triggers signInWithPassword', async () => {
      let passwordCalledWith = null;
      _setCreateClientForTesting(() => ({
        auth: {
          signInWithPassword: async (options) => {
            passwordCalledWith = options;
            return { data: { session: { user: { email: options.email } } }, error: null };
          },
          getSession: async () => ({ data: { session: null }, error: null })
        }
      }));

      initSupabase(validUrl, validAnon);

      // Rejects invalid email
      const invalidEmail = await signInWithPassword('not-an-email', '123456');
      assert.equal(invalidEmail.data, null);
      assert.match(invalidEmail.error.message, /e-mail válido/i);

      // Rejects short password (< 6 chars)
      const invalidPass = await signInWithPassword('medica@example.com', '12345');
      assert.equal(invalidPass.data, null);
      assert.match(invalidPass.error.message, /6 caracteres/i);

      // Accepts valid credentials
      const validRes = await signInWithPassword('medica@example.com', 'segredo123');
      assert.ok(validRes.data?.session);
      assert.equal(validRes.error, null);
      assert.equal(passwordCalledWith.email, 'medica@example.com');
      assert.equal(passwordCalledWith.password, 'segredo123');
    });

    test('signUpWithPassword validates input and passes doctor metadata to signUp', async () => {
      let signUpCalledWith = null;
      _setCreateClientForTesting(() => ({
        auth: {
          signUp: async (options) => {
            signUpCalledWith = options;
            return { data: { user: { id: 'new-user', email: options.email }, session: { access_token: 'tok' } }, error: null };
          },
          getSession: async () => ({ data: { session: null }, error: null })
        }
      }));

      initSupabase(validUrl, validAnon);

      // Rejects invalid input
      const invalidRes = await signUpWithPassword('invalid', '123');
      assert.equal(invalidRes.data, null);

      // Accepts valid registration
      const validRes = await signUpWithPassword('medica@example.com', 'senhaForte2026', 'Médica');
      assert.ok(validRes.data?.user);
      assert.equal(validRes.error, null);
      assert.equal(signUpCalledWith.email, 'medica@example.com');
      assert.equal(signUpCalledWith.password, 'senhaForte2026');
      assert.equal(signUpCalledWith.options.emailRedirectTo, 'https://financas-pediatria.vercel.app');
      assert.equal(signUpCalledWith.options.data.full_name, 'Médica');
    });

    test('signOut terminates session and cleans up guest and offline mode from localStorage', async () => {
      let signOutCalled = false;
      _setCreateClientForTesting(() => ({
        auth: {
          signOut: async () => {
            signOutCalled = true;
            return { error: null };
          },
          getSession: async () => ({ data: { session: null }, error: null })
        }
      }));

      initSupabase(validUrl, validAnon);
      setGuestMode(true);
      assert.equal(isGuestMode(), true);
      assert.equal(isOfflineMode(), true);

      const res = await signOut();
      assert.equal(res.error, null);
      assert.equal(signOutCalled, true);
      assert.equal(mockStorage.getItem('nanda_v4_guest_mode'), null);
      assert.equal(mockStorage.getItem(STORAGE_KEYS.OFFLINE_MODE), null);
      assert.equal(mockStorage.getItem(STORAGE_KEYS.OFFLINE_MODE_LEGACY), null);
      assert.equal(isGuestMode(), false);
      assert.equal(isOfflineMode(), false);
    });

    test('State machine transition: signOut() after guest mode allows signInWithGoogle() without offline error', async () => {
      let oauthCalledWith = null;
      _setCreateClientForTesting((url, key) => ({
        auth: {
          signInWithOAuth: async (options) => {
            oauthCalledWith = options;
            return { data: { url: 'https://accounts.google.com/o/oauth2' }, error: null };
          },
          signOut: async () => ({ error: null }),
          getSession: async () => ({ data: { session: null }, error: null })
        }
      }));

      // 1. Doctor enters Modo Hospital (Guest Mode) with zero signal
      saveConfig(validUrl, validAnon);
      setGuestMode(true);
      assert.equal(isGuestMode(), true);
      assert.equal(isOfflineMode(), true);

      // 2. Doctor finishes hospital duty and exits/signs out to connect with cloud
      const signOutRes = await signOut();
      assert.equal(signOutRes.error, null);
      assert.equal(isGuestMode(), false, 'Guest mode must be inactive');
      assert.equal(isOfflineMode(), false, 'Offline mode must be inactive');
      assert.equal(mockStorage.getItem(STORAGE_KEYS.OFFLINE_MODE), null, 'OFFLINE_MODE must be removed');
      assert.equal(mockStorage.getItem(STORAGE_KEYS.OFFLINE_MODE_LEGACY), null, 'OFFLINE_MODE_LEGACY must be removed');

      // 3. Doctor clicks "Entrar com Google" — must connect smoothly without offline error
      const googleRes = await signInWithGoogle();
      assert.ok(googleRes.data, 'signInWithGoogle must succeed after signing out of guest mode');
      assert.equal(googleRes.error, null, 'Must NOT fail with offline fallback error');
      assert.equal(oauthCalledWith?.provider, 'google');
      assert.equal(oauthCalledWith?.options?.redirectTo, 'https://financas-pediatria.vercel.app');
    });

    test('parseOAuthHash extracts access_token and refresh_token, or OAuth errors', () => {
      const hashWithTokens = '#access_token=token123&refresh_token=refresh456&expires_in=3600&token_type=bearer&type=recovery';
      const parsed = parseOAuthHash(hashWithTokens);
      assert.ok(parsed.isSuccess);
      assert.equal(parsed.accessToken, 'token123');
      assert.equal(parsed.refreshToken, 'refresh456');
      assert.equal(parsed.expiresIn, 3600);

      const hashWithError = '#error=access_denied&error_description=User%20denied%20consent';
      const parsedError = parseOAuthHash(hashWithError);
      assert.ok(parsedError.isError);
      assert.equal(parsedError.error, 'access_denied');
      assert.equal(parsedError.errorDescription, 'User denied consent');

      assert.equal(parseOAuthHash(''), null);
      assert.equal(parseOAuthHash('#without_equal_sign'), null);
    });

    test('clearOAuthHashFromUrl replaces browser history URL without exposing token fragments', () => {
      globalThis.window.location.hash = '#access_token=secret_token_12345';
      clearOAuthHashFromUrl();
      assert.equal(globalThis.window.location.hash, '');
      assert.equal(globalThis.window.lastReplacedUrl, '/');
    });

    test('ensureProfile verifies existing profile or upserts standard pediatric doctor profile', async () => {
      let upsertedData = null;
      let queriedTable = null;

      _setCreateClientForTesting(() => ({
        from: (table) => {
          queriedTable = table;
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }) // Profile not yet in DB
              })
            }),
            upsert: (payload, opts) => {
              upsertedData = payload;
              return {
                select: () => ({
                  single: async () => ({ data: payload, error: null })
                })
              };
            }
          };
        },
        auth: { getSession: async () => ({ data: { session: null }, error: null }) }
      }));

      initSupabase(validUrl, validAnon);

      const user = {
        id: 'user-pediatra-uuid-1234',
        user_metadata: {
          full_name: 'Médica',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      };

      const res = await ensureProfile(user);
      assert.equal(queriedTable, 'profiles');
      assert.ok(res.created);
      assert.equal(upsertedData.id, 'user-pediatra-uuid-1234');
      assert.equal(upsertedData.doctor_name, 'Médica');
      assert.equal(upsertedData.specialty, 'Pediatria');
      assert.equal(upsertedData.residency_salary, 0.00);
    });

    test('auth listener returns before profile queries and app callbacks run', async () => {
      let lowLevelListener;
      let queryStarted = false;
      let appCallbackStarted = false;
      const user = { id: 'listener-user', user_metadata: {} };

      _setCreateClientForTesting(() => ({
        auth: {
          onAuthStateChange: (listener) => {
            lowLevelListener = listener;
            return { data: { subscription: { unsubscribe: () => {} } } };
          },
          getSession: async () => ({ data: { session: null }, error: null })
        },
        from: () => {
          queryStarted = true;
          return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: user.id }, error: null }) }) }) };
        }
      }));

      initSupabase(validUrl, validAnon);
      onAuthStateChange(() => { appCallbackStarted = true; });

      const callbackReturn = lowLevelListener('SIGNED_IN', { user });
      assert.equal(callbackReturn, undefined, 'Supabase listener must not return an async operation');
      assert.equal(queryStarted, false, 'No database query may run while the auth listener is executing');
      assert.equal(appCallbackStarted, false, 'App callback must be deferred out of the auth listener');

      await new Promise(resolve => setTimeout(resolve, 25));
      assert.equal(queryStarted, true, 'Profile verification should run after the auth lock is released');
      assert.equal(appCallbackStarted, true, 'Deferred app callback should eventually receive the auth event');
    });
  });

  // --------------------------------------------------------------------------
  // 7. DEGRADED OFFLINE MOCK CONTRACTS
  // --------------------------------------------------------------------------
  describe('7. Degraded Offline Mock Contracts & Zero-Crash Guarantees', () => {
    test('createDegradedClient returns resilient mock with isOfflineFallback === true', async () => {
      const client = createDegradedClient();
      assert.equal(client.isOfflineFallback, true);
      assert.equal(client.isDegraded, true);

      // Queries do not throw
      const q = client.from('shifts').select('*').eq('hospital', 'Maternidade Principal');
      assert.ok(q);

      // getSession returns null when guest mode is false
      setGuestMode(false);
      const sessionRes = await client.auth.getSession();
      assert.equal(sessionRes.data.session, null);
    });

    test('createDegradedClient returns offline doctor session when guest mode is active', async () => {
      setGuestMode(true);
      const client = createDegradedClient();

      const sessionRes = await client.auth.getSession();
      assert.ok(sessionRes.data.session);
      assert.equal(sessionRes.data.session.user.id, 'guest-doctor-offline');
      assert.match(sessionRes.data.session.user.user_metadata.name, /Médica \(Modo Local\)/);
    });

    test('Calling cloud methods in degraded offline client fails gracefully with friendly errors', async () => {
      const client = createDegradedClient();
      const googleRes = await client.auth.signInWithOAuth({ provider: 'google' });
      assert.equal(googleRes.data, null);
      assert.match(googleRes.error.message, /Modo Offline/);

      const magicRes = await client.auth.signInWithOtp({ email: 'test@hospital.com' });
      assert.equal(magicRes.data, null);
      assert.match(magicRes.error.message, /Modo Offline/);
    });
  });

  // --------------------------------------------------------------------------
  // 8. SILK GATE DOM & CSS ARCHITECTURE VERIFICATION
  // --------------------------------------------------------------------------
  describe('8. Silk Gate DOM & CSS Architecture Verification', () => {
    const htmlContent = fs.readFileSync(path.resolve(v4Root, 'index.html'), 'utf8');
    const cssContent = fs.readFileSync(path.resolve(v4Root, 'css', 'styles.css'), 'utf8');

    test('index.html contains all mandatory Silk Gate DOM element IDs', () => {
      const requiredIds = [
        'silk-gate-screen',
        'btn-gate-gear',
        'btn-google-auth',
        'form-magic-link',
        'input-magic-email',
        'btn-magic-link',
        'btn-guest-mode',
        'btn-open-cloud-config',
        'modal-cloud-config',
        'input-supabase-url',
        'input-supabase-anon',
        'btn-toggle-anon-visibility',
        'btn-test-connection',
        'btn-clear-cloud-config',
        'btn-save-cloud-config'
      ];

      for (const id of requiredIds) {
        assert.match(htmlContent, new RegExp(`id=["']${id}["']`), `index.html must contain ID #${id}`);
      }
    });

    test('index.html features exact canonical text strings', () => {
      assert.match(htmlContent, /Seu santuário financeiro pediátrico/);
      assert.match(htmlContent, /ou acesse sem senha com Magic Link/);
      assert.match(htmlContent, /Enviar Link Mágico/);
      assert.match(htmlContent, /Continuar sem login \/ Modo Hospital/);
      assert.match(htmlContent, /Criado com dedicação por <strong>FChNeto<\/strong>/);
    });

    test('index.html uses pure inline SVGs exclusively without CDN font ligatures', () => {
      assert.match(htmlContent, /class=["'][^"']*google-logo-svg/);
      assert.match(htmlContent, /class=["'][^"']*silk-stethoscope-icon/);
      assert.doesNotThrow(() => {
        // No unescaped material symbol ligatures in Silk Gate
        const silkGateMatch = htmlContent.match(/<section id="silk-gate-screen"[\s\S]*?<\/section>/);
        assert.ok(silkGateMatch);
        assert.ok(!silkGateMatch[0].includes('material-symbols-outlined'));
      });
    });

    test('styles.css contains essential Silk Gate styling rules and gear button', () => {
      assert.match(cssContent, /\.silk-gate-card\s*\{[^}]*position:\s*relative/);
      assert.match(cssContent, /\.silk-gate-gear-btn/);
      assert.match(cssContent, /@keyframes\s+silkSpin/);
      assert.match(cssContent, /\.silk-feedback-box/);
    });
  });
});

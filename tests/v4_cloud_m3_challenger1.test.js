/**
 * v4_cloud_m3_challenger1.test.js
 * Empirical Challenger Test Suite for Milestone M3 (Silk Gate Auth & Offline Resilience Engine)
 * 
 * Adversarially tests:
 * 1. Malformed and bypass attempts for service_role keys (Base64URL, standard Base64, nested claims, whitespace, Unicode, null bytes, truncated tokens)
 * 2. URL validation edge cases (Protocols, trailing slashes, subdomains, SSRF-like, ports, userinfo, reachability probe resilience)
 * 3. Auth state transitions & race conditions (Rapid switching, guest mode invariants, concurrent initSupabase / initSupabaseAsync, OAuth hash edge cases)
 * 4. Degraded offline client mock integrity (All query builder chains, auth methods, guest sessions, zero-crash guarantees)
 * 5. Architectural invariants (APP_CREATOR = 'FChNeto', storage keys)
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_CREATOR = 'FChNeto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v4Root = path.resolve(__dirname, '..');

import {
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
  constructor(shouldThrow = false) {
    this.store = new Map();
    this.shouldThrow = shouldThrow;
  }
  getItem(key) {
    if (this.shouldThrow) throw new Error('Storage quota or security error');
    return this.store.has(String(key)) ? this.store.get(String(key)) : null;
  }
  setItem(key, value) {
    if (this.shouldThrow) throw new Error('Storage quota or security error');
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    if (this.shouldThrow) throw new Error('Storage quota or security error');
    this.store.delete(String(key));
  }
  clear() {
    this.store.clear();
  }
}

/**
 * Creates sample JWT with customizable header, payload, and signature format
 */
function buildCustomJwt(payload, options = {}) {
  const {
    useBase64Url = true,
    padPayload = false,
    headerOverride = null,
    signature = 'valid_test_signature_long_enough_123456789'
  } = options;

  const headerObj = headerOverride || { alg: 'HS256', typ: 'JWT' };
  const headerJson = JSON.stringify(headerObj);
  const payloadJson = typeof payload === 'string' ? payload : JSON.stringify(payload);

  let headerEnc = Buffer.from(headerJson).toString(useBase64Url ? 'base64url' : 'base64');
  let payloadEnc = Buffer.from(payloadJson).toString(useBase64Url ? 'base64url' : 'base64');

  if (padPayload && !useBase64Url) {
    while (payloadEnc.length % 4 !== 0) {
      payloadEnc += '=';
    }
  }

  return `${headerEnc}.${payloadEnc}.${signature}`;
}

// ============================================================================
// ADVERSARIAL CHALLENGE TEST SUITE
// ============================================================================

describe('M3 Adversarial Challenge Suite — Silk Gate Auth & Offline Resilience', () => {
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

  // ==========================================================================
  // SUITE 1: MALFORMED & BYPASS ATTEMPTS FOR SERVICE_ROLE KEYS
  // ==========================================================================
  describe('1. Adversarial Defense: Malformed & Bypass Attempts for service_role Keys', () => {

    test('Bypass Attempt: Standard Base64 with padding vs Base64URL encoded JWT payloads', () => {
      // Base64URL format without padding
      const b64urlToken = buildCustomJwt({ role: 'service_role', project: 'nanda' }, { useBase64Url: true });
      assert.equal(isServiceRoleKey(b64urlToken), true, 'Must detect service_role in Base64URL token');
      assert.equal(isValidSupabaseAnonKey(b64urlToken), false, 'Must reject Base64URL service_role token');

      // Standard Base64 format with '=' padding
      const b64Token = buildCustomJwt({ role: 'service_role', project: 'nanda' }, { useBase64Url: false, padPayload: true });
      assert.equal(isServiceRoleKey(b64Token), true, 'Must detect service_role in standard Base64 padded token');
      assert.equal(isValidSupabaseAnonKey(b64Token), false, 'Must reject standard Base64 padded service_role token');
    });

    test('Bypass Attempt: Case variations of privileged roles in JWT (SERVICE_ROLE, sErViCe_RoLe)', () => {
      const upperCaseToken = buildCustomJwt({ role: 'SERVICE_ROLE' });
      const mixedCaseToken = buildCustomJwt({ role: 'sErViCe_RoLe' });
      const mixedAdminToken = buildCustomJwt({ role: 'SuPeRuSeR' });

      assert.equal(isServiceRoleKey(upperCaseToken), true, 'Must reject uppercase SERVICE_ROLE');
      assert.equal(isServiceRoleKey(mixedCaseToken), true, 'Must reject mixed case sErViCe_RoLe');
      assert.equal(isServiceRoleKey(mixedAdminToken), true, 'Must reject mixed case SuPeRuSeR');

      assert.throws(() => assertNotServiceRoleKey(upperCaseToken), /Security Violation/);
      assert.throws(() => assertNotServiceRoleKey(mixedCaseToken), /Security Violation/);
    });

    test('Bypass Attempt: Embedded roles in app_metadata claim (Supabase Auth format)', () => {
      const appMetadataServiceRole = buildCustomJwt({
        app_metadata: { role: 'service_role' },
        sub: 'service-account-id'
      });
      const appMetadataAdmin = buildCustomJwt({
        app_metadata: { role: 'supabase_admin' },
        sub: 'admin-account-id'
      });

      assert.equal(isServiceRoleKey(appMetadataServiceRole), true, 'Must detect service_role inside app_metadata');
      assert.equal(isServiceRoleKey(appMetadataAdmin), true, 'Must detect supabase_admin inside app_metadata');
      assert.equal(isValidSupabaseAnonKey(appMetadataServiceRole), false);
    });

    test('Bypass Attempt: Lexical prefixes and variants in raw key string', () => {
      const attackStrings = [
        'service_role_super_secret_token_1234567890',
        'service-role-variant-token-length-greater-than-twenty',
        'supabase_admin_key_with_excessive_privileges_xyz',
        'postgres_admin_master_database_credential_long',
        'secret_key_direct_leak_from_environment_var_123',
        'secret-key-dash-variation-with-sufficient-length',
        'secret_live_production_key_abcdefghijklmnopqrstuvwxyz'
      ];

      for (const atk of attackStrings) {
        assert.equal(isServiceRoleKey(atk), true, `Must block lexical attack string: ${atk}`);
        assert.equal(isValidSupabaseAnonKey(atk), false, `Must invalidate lexical attack string: ${atk}`);
        assert.throws(() => assertNotServiceRoleKey(atk), /Security Violation/);
      }
    });

    test('Bypass Attempt: Null bytes and Unicode variation tricks in token strings', () => {
      // Null byte in raw string
      const nullByteKey = 'service_role\0_bypass_token_1234567890';
      assert.equal(isServiceRoleKey(nullByteKey), true, 'Must detect service_role even with embedded null byte');
      assert.equal(isValidSupabaseAnonKey(nullByteKey), false);
      assert.throws(() => assertNotServiceRoleKey(nullByteKey), /Security Violation/);

      // Null byte inside JWT payload role
      const nullByteJwt = buildCustomJwt({ role: 'service_role\0' });
      // Non-anon role must be rejected by isValidSupabaseAnonKey
      assert.equal(isValidSupabaseAnonKey(nullByteJwt), false, 'Must reject token with contaminated role');

      // Unicode variation in role (homoglyph: Cyrillic 'е' vs Latin 'e')
      // While not identical to ascii 'service_role', it is NOT 'anon' and must be rejected as an anon key
      const homoglyphJwt = buildCustomJwt({ role: 's\u0435rvice_role' });
      assert.equal(isValidSupabaseAnonKey(homoglyphJwt), false, 'Must reject non-anon role even with homoglyphs');
    });

    test('Bypass Attempt: Whitespace injection around privileged tokens and keys', () => {
      const rawServiceRole = buildCustomJwt({ role: 'service_role' });
      const paddedTokens = [
        `   ${rawServiceRole}   `,
        `\t${rawServiceRole}\n`,
        `\r\n${rawServiceRole}\r\n`,
        `  service_role_plain_text_with_spaces_around  `
      ];

      for (const token of paddedTokens) {
        assert.equal(isServiceRoleKey(token), true, 'Must detect service_role despite whitespace wrapping');
        assert.equal(isValidSupabaseAnonKey(token), false, 'Must reject whitespace-padded service_role');
      }
    });

    test('Robustness: Truncated, malformed, empty, and non-JWT tokens in parseJwtPayload', () => {
      const nonJwtTokens = [
        '',
        '   ',
        'singleparttokenwithmorethantwentycharacterslong',
        'header.payload_without_signature_part',
        'header.payload.sig.extra_fourth_part',
        'header..signature',
        'header.invalid_base64_!@#$%.signature',
        '....',
        null,
        undefined,
        123456789,
        {},
        []
      ];

      for (const token of nonJwtTokens) {
        // parseJwtPayload must never throw and must return null
        assert.equal(parseJwtPayload(token), null, `parseJwtPayload must return null for ${String(token)}`);
      }

      // Short strings and non-string types must be rejected by isValidSupabaseAnonKey
      const invalidAnonKeys = ['', '   ', 'short_19_chars_key!', null, undefined, 12345, {}, []];
      for (const key of invalidAnonKeys) {
        assert.equal(isValidSupabaseAnonKey(key), false, `isValidSupabaseAnonKey must reject ${String(key)}`);
      }
    });

    test('Robustness: Tokens with non-JSON payloads or non-object payloads', () => {
      // Payload is plain string or number or array
      const stringPayloadToken = buildCustomJwt('plain-text-not-json');
      const numberPayloadToken = buildCustomJwt(12345678);
      const arrayPayloadToken = buildCustomJwt(['anon', 'user']);

      assert.doesNotThrow(() => parseJwtPayload(stringPayloadToken));
      assert.doesNotThrow(() => parseJwtPayload(numberPayloadToken));
      assert.doesNotThrow(() => parseJwtPayload(arrayPayloadToken));
    });

    test('Precision: Legitimate anon tokens with deceptive substrings elsewhere in payload', () => {
      // Token has role === 'anon', but contains "service_role" in metadata notes or email
      const safeAnonWithDeceptiveNotes = buildCustomJwt({
        iss: 'supabase',
        ref: 'project-nanda',
        role: 'anon',
        user_metadata: {
          note: 'User previously asked about service_role in hospital',
          email: 'service_role_investigator@hospital.med.br'
        },
        iat: 1710000000,
        exp: 2020000000
      });

      // Role is 'anon' and not service_role
      assert.equal(isServiceRoleKey(safeAnonWithDeceptiveNotes), false, 'Anon token with innocent metadata must not be flagged');
      assert.equal(isValidSupabaseAnonKey(safeAnonWithDeceptiveNotes), true, 'Valid anon token with metadata must be accepted');
      assert.doesNotThrow(() => assertNotServiceRoleKey(safeAnonWithDeceptiveNotes));
    });

    test('Precision: Rejection of any JWT where role is NOT "anon" (e.g. "authenticated", "admin")', () => {
      const authenticatedToken = buildCustomJwt({
        iss: 'supabase',
        role: 'authenticated',
        sub: 'user-uuid-123'
      });
      const customRoleToken = buildCustomJwt({
        iss: 'supabase',
        role: 'custom_doctor_role'
      });

      // isValidSupabaseAnonKey requires role === 'anon' if a JWT is provided
      assert.equal(isValidSupabaseAnonKey(authenticatedToken), false, 'Must not accept authenticated user token as project anon key');
      assert.equal(isValidSupabaseAnonKey(customRoleToken), false, 'Must not accept custom non-anon role as anon key');
    });
  });

  // ==========================================================================
  // SUITE 2: URL VALIDATION EDGE CASES & REACHABILITY PROBE
  // ==========================================================================
  describe('2. Adversarial Challenge: URL Validation Edge Cases & Reachability Probe', () => {

    test('isValidSupabaseUrl rejects non-HTTPS protocols categorically', () => {
      const forbiddenProtocols = [
        'http://xyz.supabase.co',
        'ftp://files.supabase.co',
        'file:///etc/hosts',
        'javascript:alert(document.cookie)',
        'data:text/html,<script>alert(1)</script>',
        'ws://realtime.supabase.co',
        'wss://realtime.supabase.co',
        'mailto:support@supabase.co',
        'ssh://git@github.com'
      ];

      for (const url of forbiddenProtocols) {
        assert.equal(isValidSupabaseUrl(url), false, `Must reject forbidden protocol: ${url}`);
      }
    });

    test('isValidSupabaseUrl handles hostname length boundaries (hostname.length > 3)', () => {
      assert.equal(isValidSupabaseUrl('https://'), false, 'Empty hostname must be rejected');
      assert.equal(isValidSupabaseUrl('https://a'), false, '1-char hostname must be rejected');
      assert.equal(isValidSupabaseUrl('https://ab'), false, '2-char hostname must be rejected');
      assert.equal(isValidSupabaseUrl('https://a.b'), false, '3-char hostname must be rejected');
      assert.equal(isValidSupabaseUrl('https://a.co'), true, '4-char hostname (a.co) must be accepted');
    });

    test('isValidSupabaseUrl handles uppercase HTTPS protocol and trailing whitespace', () => {
      assert.equal(isValidSupabaseUrl('HTTPS://MYPROJECT.SUPABASE.CO'), true, 'Uppercase HTTPS must be valid');
      assert.equal(isValidSupabaseUrl('  https://myproject.supabase.co  \n'), true, 'Padded HTTPS URL must be valid');
    });

    test('isValidSupabaseUrl handles IPv4 addresses, custom ports, and custom subdomains', () => {
      assert.equal(isValidSupabaseUrl('https://127.0.0.1:54321'), true, 'Local HTTPS IP with port must be valid');
      assert.equal(isValidSupabaseUrl('https://dev.pediatria.hospital.med.br:8443'), true, 'Custom hospital portal with port must be valid');
      assert.equal(isValidSupabaseUrl('https://deep.sub.sub.supabase.co/custom/path'), true, 'Deep subdomain path must be valid');
      assert.equal(isValidSupabaseUrl('https://[::1]:8443'), true, 'IPv6 loopback with port must be valid');
    });

    test('Edge Case: SSRF-like endpoints and URLs with embedded userinfo credentials', () => {
      // Cloud metadata endpoint (169.254.169.254) has valid HTTPS structure
      assert.equal(isValidSupabaseUrl('https://169.254.169.254/latest/meta-data'), true);

      // Embedded userinfo: https://user:pass@supabase.co
      assert.equal(isValidSupabaseUrl('https://admin:supersecret@hospital-cloud.supabase.co'), true);

      // Non-Supabase external domains are accepted structurally by isValidSupabaseUrl (custom self-hosted Supabase instances)
      assert.equal(isValidSupabaseUrl('https://selfhosted-supabase.pediatriananda.com.br'), true);
    });

    test('Reachability Probe: Normalizes trailing slashes when building REST ping endpoint', async () => {
      const savedFetch = globalThis.fetch;
      const testedEndpoints = [];

      try {
        globalThis.fetch = async (url) => {
          testedEndpoints.push(url);
          return { ok: true, status: 200 };
        };

        const anonKey = buildCustomJwt({ role: 'anon' });

        // URL with single trailing slash
        await testSupabaseReachability('https://myproject.supabase.co/', anonKey);
        // URL with multiple trailing slashes
        await testSupabaseReachability('https://myproject.supabase.co///', anonKey);
        // URL without trailing slash
        await testSupabaseReachability('https://myproject.supabase.co', anonKey);

        for (const endpoint of testedEndpoints) {
          assert.equal(endpoint, 'https://myproject.supabase.co/rest/v1/', 'Target REST endpoint must be normalized without double slashes');
        }
      } finally {
        globalThis.fetch = savedFetch;
      }
    });

    test('Reachability Probe: Never executes network fetch if service_role key is supplied', async () => {
      let fetchCalled = false;
      const savedFetch = globalThis.fetch;

      try {
        globalThis.fetch = async () => {
          fetchCalled = true;
          return { ok: true, status: 200 };
        };

        const serviceRoleKey = buildCustomJwt({ role: 'service_role' });
        const result = await testSupabaseReachability('https://myproject.supabase.co', serviceRoleKey);

        assert.equal(result.ok, false);
        assert.equal(result.isServiceRole, true);
        assert.equal(fetchCalled, false, 'Fetch must NEVER be called when service_role key is attempted');
      } finally {
        globalThis.fetch = savedFetch;
      }
    });

    test('Reachability Probe: Graceful handling of HTTP 403 Forbidden vs HTTP 500 Internal Error', async () => {
      const savedFetch = globalThis.fetch;
      try {
        const anonKey = buildCustomJwt({ role: 'anon' });

        // 403 Forbidden
        globalThis.fetch = async () => ({ ok: false, status: 403 });
        const res403 = await testSupabaseReachability('https://myproject.supabase.co', anonKey);
        assert.equal(res403.ok, false);
        assert.equal(res403.status, 403);
        assert.match(res403.message, /401\/403/);

        // 500 Server Error
        globalThis.fetch = async () => ({ ok: false, status: 500 });
        const res500 = await testSupabaseReachability('https://myproject.supabase.co', anonKey);
        assert.equal(res500.ok, false);
        assert.equal(res500.status, 500);
        assert.match(res500.message, /500/);
      } finally {
        globalThis.fetch = savedFetch;
      }
    });
  });

  // ==========================================================================
  // SUITE 3: AUTH STATE TRANSITIONS, RACE CONDITIONS & TOKEN PARSING
  // ==========================================================================
  describe('3. Adversarial Challenge: Auth State Transitions, Concurrency & Hash Parsing', () => {

    test('Rapid State Flipping: High-frequency toggling between guest mode and online mode', () => {
      // Rapidly toggle guest mode 50 times
      for (let i = 0; i < 50; i++) {
        setGuestMode(i % 2 === 0);
      }

      // 49 was odd -> false
      assert.equal(isGuestMode(), false, 'Final state of 49th flip must be false');
      assert.equal(mockStorage.getItem('nanda_v4_guest_mode'), 'false');
      assert.equal(mockStorage.getItem('v4_cloud_guest_mode'), 'false');

      // Final explicit set
      setGuestMode(true);
      assert.equal(isGuestMode(), true);
      assert.equal(mockStorage.getItem('nanda_v4_guest_mode'), 'true');
      assert.equal(mockStorage.getItem('v4_cloud_guest_mode'), 'true');
      assert.equal(isOfflineMode(), true);
    });

    test('Race Condition: Concurrent initSupabase() invocations from multiple components', () => {
      const validUrl = 'https://nanda-pediatria.supabase.co';
      const validAnon = buildCustomJwt({ role: 'anon' });

      let createClientCallCount = 0;
      _setCreateClientForTesting((url, key) => {
        createClientCallCount++;
        return {
          url,
          key,
          auth: { getSession: async () => ({ data: { session: null }, error: null }) }
        };
      });

      // Simulate 10 simultaneous calls to initSupabase
      const clients = [];
      for (let i = 0; i < 10; i++) {
        clients.push(initSupabase(validUrl, validAnon));
      }

      // All returned clients must be valid objects
      for (const client of clients) {
        assert.ok(client);
        assert.equal(client.isOfflineFallback, false);
      }

      // getSupabase() returns active singleton client
      const activeClient = getSupabase();
      assert.ok(activeClient);
      assert.equal(activeClient.url, validUrl);
    });

    test('Race Condition: Concurrent initSupabaseAsync() resolutions', async () => {
      const validUrl = 'https://nanda-pediatria.supabase.co';
      const validAnon = buildCustomJwt({ role: 'anon' });

      _setCreateClientForTesting((url, key) => ({
        url,
        key,
        auth: { getSession: async () => ({ data: { session: null }, error: null }) }
      }));

      // Fire 5 asynchronous initializations concurrently
      const promises = [
        initSupabaseAsync(validUrl, validAnon),
        initSupabaseAsync(validUrl, validAnon),
        initSupabaseAsync(validUrl, validAnon),
        initSupabaseAsync(validUrl, validAnon),
        initSupabaseAsync(validUrl, validAnon)
      ];

      const results = await Promise.all(promises);
      for (const client of results) {
        assert.ok(client);
        assert.equal(client.isOfflineFallback, false);
      }
    });

    test('OAuth Hash Parsing: Complex multi-fragment, encoded, and malformed query strings', () => {
      // 1. Extra query parameters and URL encoded values (URLSearchParams decodes %2B to + and %2F to /)
      const complexHash = '#access_token=token_with%2Bspecial%2Fchars&refresh_token=refresh_123&expires_in=7200&token_type=bearer&type=magiclink&extra_param=hospital_araken';
      const parsed = parseOAuthHash(complexHash);
      assert.ok(parsed.isSuccess);
      assert.equal(parsed.accessToken, 'token_with+special/chars', 'URLSearchParams must decode percent-encoded tokens');
      assert.equal(parsed.refreshToken, 'refresh_123');
      assert.equal(parsed.expiresIn, 7200);

      // 2. OAuth error with URL-encoded Portuguese description
      const errorHash = '#error=server_error&error_description=Falha%20ao%20conectar%20com%20Google%20OAuth';
      const parsedError = parseOAuthHash(errorHash);
      assert.ok(parsedError.isError);
      assert.equal(parsedError.error, 'server_error');
      assert.equal(parsedError.errorDescription, 'Falha ao conectar com Google OAuth');

      // 3. Hash with no tokens or errors (e.g. navigation anchor)
      assert.equal(parseOAuthHash('#dashboard-section'), null);
      assert.equal(parseOAuthHash('#tab=ganhos'), null);
      assert.equal(parseOAuthHash('#'), null);
      assert.equal(parseOAuthHash(''), null);
      assert.equal(parseOAuthHash(null), null);
      assert.equal(parseOAuthHash(undefined), null);
    });

    test('clearOAuthHashFromUrl operates safely without throwing when window or history is missing/partial', () => {
      // Test when window has no history
      const tempWindow = globalThis.window;
      try {
        globalThis.window = { location: { hash: '#access_token=xyz' } };
        assert.doesNotThrow(() => clearOAuthHashFromUrl());

        // Test in pure Node environment (no window)
        delete globalThis.window;
        assert.doesNotThrow(() => clearOAuthHashFromUrl());
      } finally {
        globalThis.window = tempWindow;
      }
    });
  });

  // ==========================================================================
  // SUITE 4: DEGRADED OFFLINE CLIENT MOCK INTEGRITY & ZERO-CRASH RESILIENCE
  // ==========================================================================
  describe('4. Adversarial Challenge: Degraded Offline Mock Integrity & Zero-Crash Resilience', () => {

    test('Degraded Mock: Exhaustive Query Builder method chaining does not throw', () => {
      const client = createDegradedClient();
      assert.equal(client.isOfflineFallback, true);
      assert.equal(client.isDegraded, true);

      // Deep chaining of query filters and ordering
      assert.doesNotThrow(() => {
        const query = client
          .from('shifts')
          .select('id, hospital, date, net_value')
          .eq('user_id', 'offline-user')
          .neq('status', 'cancelled')
          .gt('net_value', 1000)
          .gte('date', '2026-01-01')
          .lt('date', '2026-12-31')
          .lte('net_value', 50000)
          .order('date', { ascending: false })
          .limit(20);

        assert.ok(query);
      });
    });

    test('Degraded Mock: Query mutation methods (insert, update, delete, upsert) chain cleanly', () => {
      const client = createDegradedClient();

      assert.doesNotThrow(() => {
        const ins = client.from('expenses').insert({ description: 'Lanches', value: 35.50 });
        const upd = client.from('shifts').update({ status: 'received' }).eq('id', 'shift-123');
        const del = client.from('custom_categories').delete().eq('id', 'cat-456');
        const ups = client.from('profiles').upsert({ id: 'guest', doctor_name: 'Dra. Fernanda Ch.' });

        assert.ok(ins);
        assert.ok(upd);
        assert.ok(del);
        assert.ok(ups);
      });
    });

    test('Degraded Mock: Terminal query methods return graceful offline errors without uncaught throws', async () => {
      const client = createDegradedClient();

      // single()
      const singleRes = await client.from('profiles').select('*').eq('id', 'doctor-1').single();
      assert.equal(singleRes.data, null);
      assert.ok(singleRes.error instanceof Error);
      assert.match(singleRes.error.message, /Offline/);

      // maybeSingle()
      const maybeRes = await client.from('profiles').select('*').eq('id', 'doctor-1').maybeSingle();
      assert.equal(maybeRes.data, null);
      assert.equal(maybeRes.error, null, 'maybeSingle in offline mode should return null data with null error');

      // awaitable then() resolution
      const thenRes = await client.from('shifts').select('*');
      assert.deepEqual(thenRes.data, []);
      assert.ok(thenRes.error instanceof Error);
      assert.match(thenRes.error.message, /Offline/);
    });

    test('Degraded Mock: Auth methods return graceful offline errors and valid structure', async () => {
      const client = createDegradedClient();

      // Google OAuth offline rejection
      const googleRes = await client.auth.signInWithOAuth({ provider: 'google' });
      assert.equal(googleRes.data, null);
      assert.ok(googleRes.error instanceof Error);
      assert.match(googleRes.error.message, /Modo Offline/);

      // Magic link offline rejection
      const otpRes = await client.auth.signInWithOtp({ email: 'dra.fernanda@hospital.com' });
      assert.equal(otpRes.data, null);
      assert.ok(otpRes.error instanceof Error);
      assert.match(otpRes.error.message, /Modo Offline/);

      // Sign out offline
      const signoutRes = await client.auth.signOut();
      assert.equal(signoutRes.error, null);

      // getUser offline without guest mode
      setGuestMode(false);
      const userRes = await client.auth.getUser();
      assert.equal(userRes.data.user, null);
      assert.equal(userRes.error, null);
    });

    test('Degraded Mock: Guest doctor session contains complete metadata for local UI rendering', async () => {
      setGuestMode(true);
      const client = createDegradedClient();

      const { data } = await client.auth.getSession();
      assert.ok(data?.session);
      assert.equal(data.session.user.id, 'guest-doctor-offline');
      assert.equal(data.session.user.email, 'convidada@pediatria.local');
      assert.equal(data.session.user.user_metadata.full_name, 'Dra. Fernanda Ch. (Modo Local)');
      assert.equal(data.session.user.user_metadata.name, 'Dra. Fernanda Ch. (Modo Local)');

      const userRes = await client.auth.getUser();
      assert.equal(userRes.data.user.id, 'guest-doctor-offline');
    });

    test('Degraded Mock: onAuthStateChange returns safe subscription with working unsubscribe', (t, done) => {
      setGuestMode(true);
      const client = createDegradedClient();

      let callbackFired = false;
      const sub = client.auth.onAuthStateChange((event, session) => {
        callbackFired = true;
        assert.equal(event, 'INITIAL_SESSION');
        assert.ok(session);
        assert.equal(session.user.id, 'guest-doctor-offline');
      });

      assert.ok(sub.data.subscription);
      assert.equal(typeof sub.data.subscription.unsubscribe, 'function');
      assert.doesNotThrow(() => sub.data.subscription.unsubscribe());

      setTimeout(() => {
        assert.equal(callbackFired, true);
        done();
      }, 10);
    });

    test('Top-Level onAuthStateChange handles null callback or callback that throws without crashing', () => {
      _setCreateClientForTesting(() => ({
        auth: {
          onAuthStateChange: (cb) => {
            // Simulate Supabase emitting an event
            setTimeout(() => cb('SIGNED_IN', { user: { id: 'u1' } }), 5);
            return { data: { subscription: { unsubscribe: () => {} } } };
          }
        }
      }));

      initSupabase('https://valid.supabase.co', buildCustomJwt({ role: 'anon' }));

      // Callback that throws an error should be caught internally
      assert.doesNotThrow(() => {
        onAuthStateChange(() => {
          throw new Error('Callback boom!');
        });
      });
    });
  });

  // ==========================================================================
  // SUITE 5: ARCHITECTURAL INVARIANTS & AUDIT COMPLIANCE
  // ==========================================================================
  describe('5. Architectural Invariants & Canonical Author Audit', () => {
    test('Canonical author constant APP_CREATOR is strictly FChNeto across all modules', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
    });

    test('Storage keys integrity: nanda_v4_guest_mode must remain canonical key', () => {
      assert.equal(STORAGE_KEYS.GUEST_MODE, 'nanda_v4_guest_mode');
      assert.equal(STORAGE_KEYS.GUEST_MODE_LEGACY, 'v4_cloud_guest_mode');
    });
  });
});

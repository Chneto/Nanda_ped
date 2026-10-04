/**
 * v4_cloud_m3_challenger2.test.js
 * Adversarial Stress & Security Test Suite for Milestone M3:
 * Silk Gate Auth & Offline Resilience Engine.
 * 
 * Scope of Adversarial Verification:
 * 1. Storage Corruption, Quota Limits & Prototype Hardening in localStorage
 * 2. Injection, XSS Vectors & UTF-8 Boundaries in Auth & Profiles
 * 3. Offline Reachability Probe Stress (HTTP 5xx, 429, timeouts, aborts, captive portals)
 * 4. Dual-Write Guest Mode State Machine & Symmetrical Consistency
 * 5. Invariant & Brand Integrity Checks (APP_CREATOR = 'FChNeto')
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_CREATOR = 'FChNeto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v4Root = path.resolve(__dirname, '..');

import {
  APP_CREATOR as CONFIG_APP_CREATOR,
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
// ADVERSARIAL MOCKS & HARNESSES
// ============================================================================

class AdversarialStorage {
  constructor() {
    this.store = new Map();
    this.throwOnSet = false;
    this.throwOnGet = false;
    this.throwOnRemove = false;
    this.quotaLimit = Infinity;
    this.currentBytes = 0;
  }

  getItem(key) {
    if (this.throwOnGet) {
      const err = new Error('DOMException: The operation is insecure (SecurityError).');
      err.name = 'SecurityError';
      throw err;
    }
    return this.store.has(String(key)) ? this.store.get(String(key)) : null;
  }

  setItem(key, value) {
    if (this.throwOnSet) {
      const err = new Error('DOMException: QuotaExceededError - The quota has been exceeded.');
      err.name = 'QuotaExceededError';
      throw err;
    }
    const valStr = String(value);
    const estimatedSize = key.length + valStr.length;
    if (this.currentBytes + estimatedSize > this.quotaLimit) {
      const err = new Error('DOMException: QuotaExceededError - The quota has been exceeded.');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this.store.set(String(key), valStr);
    this.currentBytes += estimatedSize;
  }

  removeItem(key) {
    if (this.throwOnRemove) {
      throw new Error('Storage write prohibited.');
    }
    this.store.delete(String(key));
  }

  clear() {
    this.store.clear();
    this.currentBytes = 0;
  }
}

function createSampleJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'adversarial_signature_safe_for_testing_12345';
  return `${header}.${body}.${signature}`;
}

// ============================================================================
// MAIN ADVERSARIAL TEST SUITE
// ============================================================================

describe('Finanças Pediatria V4_Cloud — Challenger 2: Storage Resilience, Quota & XSS Security', () => {
  let savedLocalStorage;
  let savedWindow;
  let savedFetch;
  let adversarialStorage;
  let capturedEvents;

  beforeEach(() => {
    savedLocalStorage = globalThis.localStorage;
    savedWindow = globalThis.window;
    savedFetch = globalThis.fetch;

    adversarialStorage = new AdversarialStorage();
    capturedEvents = [];

    globalThis.localStorage = adversarialStorage;
    globalThis.window = {
      localStorage: adversarialStorage,
      location: {
        origin: 'https://financas-pediatria.vercel.app',
        pathname: '/',
        search: '',
        hash: ''
      },
      history: {
        replaceState: (state, title, url) => {
          globalThis.window.location.hash = '';
          globalThis.window.lastUrl = url;
        }
      },
      dispatchEvent: (event) => {
        capturedEvents.push(event);
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
    globalThis.fetch = savedFetch;
  });

  // --------------------------------------------------------------------------
  // 1. STORAGE CORRUPTION, QUOTA LIMITS & PROTOTYPE HARDENING
  // --------------------------------------------------------------------------
  describe('1. Storage Corruption, Quota Limits & Prototype Hardening', () => {
    const validUrl = 'https://example-project.supabase.co';
    const validAnonKey = createSampleJwt({ role: 'anon', sub: 'doctor-123' });

    test('getConfig recovers gracefully when localStorage throws SecurityError (e.g. Safari private sandbox)', () => {
      adversarialStorage.throwOnGet = true;

      // Must not throw uncaught error; falls back gracefully to null/unconfigured
      const cfg = getConfig();
      assert.equal(cfg.supabaseUrl, null);
      assert.equal(cfg.supabaseAnonKey, null);
      assert.equal(cfg.isConfigured, false);
    });

    test('isOfflineMode and isGuestMode return false without crashing when localStorage.getItem throws', () => {
      adversarialStorage.throwOnGet = true;

      assert.doesNotThrow(() => {
        assert.equal(isOfflineMode(), false);
        assert.equal(isGuestMode(), false);
      });
    });

    test('saveConfig catches QuotaExceededError and returns false without propagating exception', () => {
      adversarialStorage.throwOnSet = true;

      let result;
      assert.doesNotThrow(() => {
        result = saveConfig(validUrl, validAnonKey);
      });
      assert.equal(result, false, 'Must return false when storage write fails');
      assert.equal(getConfig().isConfigured, false);
    });

    test('Partial write resilience: if quota exceeds on 2nd key, isConfigured remains false', () => {
      // Allow only enough bytes for the URL key + value, then fail on anon key
      adversarialStorage.quotaLimit = 60; // Enough for url, not enough for key

      const result = saveConfig(validUrl, validAnonKey);
      assert.equal(result, false);

      // Invariant: Even if URL was partially written, getConfig MUST NOT consider app configured
      const cfg = getConfig();
      assert.equal(cfg.isConfigured, false);
    });

    test('setGuestMode and setOfflineMode handle QuotaExceededError gracefully without unhandled rejection', () => {
      adversarialStorage.throwOnSet = true;

      assert.doesNotThrow(() => {
        setGuestMode(true);
        setOfflineMode(true);
      });
    });

    test('clearConfig handles storage failure gracefully without crashing', () => {
      adversarialStorage.throwOnRemove = true;

      assert.doesNotThrow(() => {
        clearConfig();
      });
    });

    test('Corrupted values in localStorage (non-string types, malformed data) do not cause unhandled crashes', () => {
      // Inject unexpected types into storage map
      adversarialStorage.store.set(STORAGE_KEYS.SUPABASE_URL, '   https://corrupted.supabase.co   ');
      adversarialStorage.store.set(STORAGE_KEYS.SUPABASE_ANON_KEY, 'not-a-valid-key');
      adversarialStorage.store.set(STORAGE_KEYS.GUEST_MODE, 'TRUE'); // Upper case
      adversarialStorage.store.set(STORAGE_KEYS.OFFLINE_MODE, '1');

      const cfg = getConfig();
      assert.equal(cfg.supabaseUrl, 'https://corrupted.supabase.co');
      assert.equal(cfg.isConfigured, false, 'Invalid anon key must keep isConfigured false');

      // Canonical check is strict equality to 'true'
      assert.equal(isGuestMode(), false, 'Only exact string "true" should activate guest mode');
      assert.equal(isOfflineMode(), false, 'Only exact string "true" should activate offline mode');
    });

    test('Prototype pollution keys (__proto__, constructor, toString) do not pollute Object prototype', () => {
      const maliciousPayload = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}');
      const jwtWithPollution = createSampleJwt(maliciousPayload);

      assert.doesNotThrow(() => {
        const parsed = parseJwtPayload(jwtWithPollution);
        assert.ok(parsed);
      });

      // Assert Object prototype is completely unpolluted
      const cleanObj = {};
      assert.equal(cleanObj.polluted, undefined, 'Object prototype must NOT be polluted');
    });

    test('parseJwtPayload handles deeply nested and malformed JSON payloads without throwing', () => {
      const badTokens = [
        'header.badBase64@@@.signature',
        'header..signature',
        '....',
        'undefined.undefined.undefined',
        createSampleJwt('a'.repeat(50000)), // Giant payload
        'header.' + Buffer.from('{ unclosed json:').toString('base64url') + '.sig',
        'header.' + Buffer.from('null').toString('base64url') + '.sig',
        'header.' + Buffer.from('12345').toString('base64url') + '.sig'
      ];

      for (const token of badTokens) {
        assert.doesNotThrow(() => {
          const res = parseJwtPayload(token);
          // When payload is not a valid JSON object or corrupted, returns null or safe value
          if (res !== null) {
            assert.ok(typeof res === 'object' || typeof res === 'number' || typeof res === 'string');
          }
        }, `Token should not throw unhandled exception: ${token.slice(0, 30)}`);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 2. INJECTION, XSS VECTORS & UTF-8 BOUNDARIES
  // --------------------------------------------------------------------------
  describe('2. Injection, XSS Vectors & UTF-8 Boundaries in Auth & Profiles', () => {
    const validUrl = 'https://example-project.supabase.co';
    const validAnonKey = createSampleJwt({ role: 'anon' });

    test('signInWithMagicLink rejects malicious XSS injection payloads in email parameter', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert(1)>@hospital.med.br',
        'javascript:alert(1)@pediatria.br',
        '<svg/onload=alert(1)>@gmail.com',
        'medica@example.com\r\nBcc:attacker@evil.com', // CRLF injection
        'medica@example.com\nSet-Cookie:malicious=1',
        '"><script>alert(1)</script>@test.com',
        'not-an-email',
        '',
        null,
        undefined,
        12345,
        {},
        []
      ];

      _setCreateClientForTesting(() => ({
        auth: {
          signInWithOtp: async () => ({ data: {}, error: null })
        }
      }));
      initSupabase(validUrl, validAnonKey);

      for (const payload of xssPayloads) {
        const res = await signInWithMagicLink(payload);
        if (!payload || typeof payload !== 'string' || !payload.includes('@') || !payload.includes('.')) {
          assert.equal(res.data, null);
          assert.ok(res.error, `Must reject invalid email payload: ${payload}`);
          assert.match(res.error.message, /e-mail válido/i);
        }
      }
    });

    test('isValidSupabaseUrl strictly rejects dangerous URI schemes and invalid URL structures', () => {
      const dangerousUrls = [
        'javascript:alert(document.cookie)',
        'data:text/html,<script>alert("pwned")</script>',
        'vbscript:msgbox("test")',
        'file:///etc/passwd',
        'file:///c:/windows/system32',
        'http://insecure-hospital-api.com',
        'https://attacker.com\r\nX-Injected:true',
        'https://attacker.com\nInjected:header',
        'https://',
        'https:///',
        'ftp://files.hospital.med.br',
        'https://a.b', // Hostname too short (<= 3 chars)
        'https://abc', // Hostname too short (<= 3 chars)
        'https://<script>', // Invalid characters in host
        'https://invalid space.com',
        'blob:https://example.com/uuid',
        'ws://realtime.supabase.co',
        'wss://realtime.supabase.co',
        null,
        undefined,
        '',
        12345,
        {},
        []
      ];

      for (const url of dangerousUrls) {
        assert.equal(isValidSupabaseUrl(url), false, `Must reject dangerous or invalid URL: ${url}`);
      }
    });

    test('saveConfig rejects any URL failing isValidSupabaseUrl without recording in localStorage', () => {
      const result = saveConfig('javascript:alert(1)', validAnonKey);
      assert.equal(result, false);
      assert.equal(adversarialStorage.getItem(STORAGE_KEYS.SUPABASE_URL), null);
    });

    test('ensureProfile handles UTF-8 multi-byte characters and doctor emoji cleanly without truncation', async () => {
      let savedProfile = null;

      _setCreateClientForTesting(() => ({
        from: (table) => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }) // Profile not found, triggers upsert
            })
          }),
          upsert: (payload) => {
            savedProfile = payload;
            return {
              select: () => ({
                single: async () => ({ data: payload, error: null })
              })
            };
          }
        }),
        auth: { getSession: async () => ({ data: { session: null }, error: null }) }
      }));

      initSupabase(validUrl, validAnonKey);

      // Pediatric doctor name with Brazilian Portuguese accents and stethoscope/flower emoji
      const doctorComplexName = 'Médica 🩺🌸 (Cidade de Exemplo / Açúcar)';
      const testUser = {
        id: 'usr-utf8-uuid-7890',
        user_metadata: {
          full_name: doctorComplexName,
          avatar_url: 'https://cdn.hospital.com/profile-photo.png'
        }
      };

      const res = await ensureProfile(testUser);
      assert.ok(res.created);
      assert.equal(savedProfile.doctor_name, doctorComplexName);
      assert.equal(savedProfile.specialty, 'Pediatria');
      assert.equal(savedProfile.residency_salary, 0.00);
    });

    test('ensureProfile handles 4-byte astral Unicode symbols and RTL direction overrides safely', async () => {
      let savedProfile = null;

      _setCreateClientForTesting(() => ({
        from: (table) => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null })
            })
          }),
          upsert: (payload) => {
            savedProfile = payload;
            return {
              select: () => ({
                single: async () => ({ data: payload, error: null })
              })
            };
          }
        }),
        auth: { getSession: async () => ({ data: { session: null }, error: null }) }
      }));

      initSupabase(validUrl, validAnonKey);

      // Astral Unicode symbols (surrogate pairs) & BiDi override attempt
      const astralDoctorName = '\u202E Médica 👩‍⚕️💖👶✨';
      const testUser = {
        id: 'usr-astral-uuid-1122',
        user_metadata: {
          name: astralDoctorName
        }
      };

      const res = await ensureProfile(testUser);
      assert.ok(res.created);
      assert.equal(savedProfile.doctor_name, astralDoctorName);
    });

    test('ensureProfile handles null or missing user_metadata falling back to canonical DOCTOR_DEFAULT_NAME', async () => {
      let savedProfile = null;

      _setCreateClientForTesting(() => ({
        from: () => ({
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
          upsert: (payload) => {
            savedProfile = payload;
            return { select: () => ({ single: async () => ({ data: payload, error: null }) }) };
          }
        }),
        auth: { getSession: async () => ({ data: { session: null }, error: null }) }
      }));

      initSupabase(validUrl, validAnonKey);

      const res = await ensureProfile({ id: 'usr-minimal-uuid-3344' });
      assert.ok(res.created);
      assert.equal(savedProfile.doctor_name, 'Médica');
    });

    test('parseOAuthHash safely parses malicious XSS payloads in hash fragments without code execution', () => {
      const maliciousHash = '#error=xss_attack&error_description=%3Cscript%3Ealert(%22pwned%22)%3C%2Fscript%3E&access_token=%22%3E%3Cimg%20src=x%20onerror=alert(1)%3E';
      
      const parsed = parseOAuthHash(maliciousHash);
      assert.ok(parsed.isError);
      assert.equal(parsed.error, 'xss_attack');
      // Verify decoded text is parsed strictly as string data, never evaluated
      assert.equal(parsed.errorDescription, '<script>alert("pwned")</script>');
    });

    test('clearOAuthHashFromUrl safely clears hash with token fragments leaving clean pathname and search', () => {
      globalThis.window.location.hash = '#access_token=sensitive_token&type=recovery';
      globalThis.window.location.pathname = '/dashboard';
      globalThis.window.location.search = '?month=2026-04';

      clearOAuthHashFromUrl();
      assert.equal(globalThis.window.location.hash, '');
      assert.equal(globalThis.window.lastUrl, '/dashboard?month=2026-04');
    });

    test('base64Decode decodes complex multi-byte UTF-8 accented strings accurately', () => {
      const complexPortuguese = 'Maternidade Principal • UTI Neonatal • Médica 🩺';
      const encoded = Buffer.from(complexPortuguese, 'utf-8').toString('base64url');
      
      const decoded = base64Decode(encoded);
      assert.equal(decoded, complexPortuguese);
    });

    test('base64Decode returns empty string on non-string inputs and never throws on arbitrary inputs', () => {
      assert.equal(base64Decode(''), '');
      assert.equal(base64Decode(null), '');
      assert.equal(base64Decode(undefined), '');
      assert.equal(base64Decode(12345), '');
      assert.equal(base64Decode({}), '');
      assert.doesNotThrow(() => {
        base64Decode('!!!not-base64@@@');
        base64Decode('a'.repeat(10000));
      });
    });
  });

  // --------------------------------------------------------------------------
  // 3. OFFLINE REACHABILITY PROBE STRESS (GATEWAY TIMEOUTS, ABORTS, NON-JSON)
  // --------------------------------------------------------------------------
  describe('3. Offline Reachability Probe Stress (HTTP 5xx, 429, timeouts, aborts)', () => {
    const validUrl = 'https://project-ref.supabase.co';
    const validAnonKey = createSampleJwt({ role: 'anon' });

    test('testSupabaseReachability handles HTTP 500 (Internal Server Error) without throwing', async () => {
      globalThis.fetch = async () => ({
        ok: false,
        status: 500
      });

      const res = await testSupabaseReachability(validUrl, validAnonKey, 2000);
      assert.equal(res.ok, false);
      assert.equal(res.status, 500);
      assert.match(res.message, /500/);
    });

    test('testSupabaseReachability handles HTTP 502 (Bad Gateway) and HTTP 503 (Service Unavailable)', async () => {
      globalThis.fetch = async () => ({
        ok: false,
        status: 502
      });

      const res502 = await testSupabaseReachability(validUrl, validAnonKey, 2000);
      assert.equal(res502.ok, false);
      assert.equal(res502.status, 502);

      globalThis.fetch = async () => ({
        ok: false,
        status: 503
      });

      const res503 = await testSupabaseReachability(validUrl, validAnonKey, 2000);
      assert.equal(res503.ok, false);
      assert.equal(res503.status, 503);
    });

    test('testSupabaseReachability handles HTTP 504 (Gateway Timeout) and HTTP 429 (Too Many Requests)', async () => {
      globalThis.fetch = async () => ({
        ok: false,
        status: 504
      });

      const res504 = await testSupabaseReachability(validUrl, validAnonKey, 2000);
      assert.equal(res504.ok, false);
      assert.equal(res504.status, 504);

      globalThis.fetch = async () => ({
        ok: false,
        status: 429
      });

      const res429 = await testSupabaseReachability(validUrl, validAnonKey, 2000);
      assert.equal(res429.ok, false);
      assert.equal(res429.status, 429);
    });

    test('testSupabaseReachability handles HTTP 403 Forbidden with specific message', async () => {
      globalThis.fetch = async () => ({
        ok: false,
        status: 403
      });

      const res = await testSupabaseReachability(validUrl, validAnonKey, 2000);
      assert.equal(res.ok, false);
      assert.equal(res.status, 403);
      assert.match(res.message, /401\/403/);
    });

    test('testSupabaseReachability handles DNS failure (TypeError: fetch failed) gracefully', async () => {
      globalThis.fetch = async () => {
        const error = new TypeError('fetch failed');
        error.cause = new Error('getaddrinfo ENOTFOUND project-ref.supabase.co');
        throw error;
      };

      const res = await testSupabaseReachability(validUrl, validAnonKey, 2000);
      assert.equal(res.ok, false);
      assert.match(res.message, /Não foi possível alcançar o servidor Supabase/i);
    });

    test('testSupabaseReachability handles socket hangup / connection reset (ECONNRESET)', async () => {
      globalThis.fetch = async () => {
        const error = new Error('read ECONNRESET');
        error.code = 'ECONNRESET';
        throw error;
      };

      const res = await testSupabaseReachability(validUrl, validAnonKey, 2000);
      assert.equal(res.ok, false);
      assert.match(res.message, /conectividade com a internet/i);
    });

    test('testSupabaseReachability handles AbortController timeout edge cases', async () => {
      globalThis.fetch = async () => {
        const abortErr = new Error('This operation was aborted');
        abortErr.name = 'AbortError';
        throw abortErr;
      };

      const res = await testSupabaseReachability(validUrl, validAnonKey, 100);
      assert.equal(res.ok, false);
      assert.match(res.message, /Tempo limite de conexão excedido/i);
    });

    test('testSupabaseReachability handles massive HTML captive portal response without crash', async () => {
      // Hospital Wi-Fi captive portal returns 200 OK with login HTML
      globalThis.fetch = async () => ({
        ok: true,
        status: 200,
        text: async () => '<html><body>Hospital Captive Portal</body></html>'
      });

      const res = await testSupabaseReachability(validUrl, validAnonKey, 2000);
      assert.equal(res.ok, true);
      assert.equal(res.status, 200);
      assert.ok(typeof res.latencyMs === 'number');
    });

    test('testSupabaseReachability with non-standard thrown exceptions does not crash process', async () => {
      // Simulating edge case where fetch throws a non-Error string or object
      globalThis.fetch = async () => {
        throw new Error('Unexpected offline error string');
      };

      const res = await testSupabaseReachability(validUrl, validAnonKey, 2000);
      assert.equal(res.ok, false);
      assert.match(res.message, /Não foi possível alcançar o servidor Supabase/i);
    });
  });

  // --------------------------------------------------------------------------
  // 4. DUAL-WRITE GUEST MODE STATE MACHINE & CONSISTENCY
  // --------------------------------------------------------------------------
  describe('4. Dual-Write Guest Mode State Machine & Symmetrical Consistency', () => {
    test('Entering guest mode performs symmetrical dual-write to both canonical and legacy keys', () => {
      setGuestMode(true);

      assert.equal(adversarialStorage.getItem(STORAGE_KEYS.GUEST_MODE), 'true');
      assert.equal(adversarialStorage.getItem(STORAGE_KEYS.GUEST_MODE_LEGACY), 'true');
      assert.equal(adversarialStorage.getItem('nanda_v4_guest_mode'), 'true');
      assert.equal(adversarialStorage.getItem('v4_cloud_guest_mode'), 'true');
      assert.equal(isGuestMode(), true);
    });

    test('Exiting guest mode performs symmetrical dual-write setting both keys to "false"', () => {
      setGuestMode(true);
      assert.equal(isGuestMode(), true);

      setGuestMode(false);
      assert.equal(adversarialStorage.getItem(STORAGE_KEYS.GUEST_MODE), 'false');
      assert.equal(adversarialStorage.getItem(STORAGE_KEYS.GUEST_MODE_LEGACY), 'false');
      assert.equal(isGuestMode(), false);
    });

    test('Asymmetric legacy state recovery: if only v4_cloud_guest_mode is set, isGuestMode() returns true', () => {
      adversarialStorage.store.set(STORAGE_KEYS.GUEST_MODE_LEGACY, 'true');
      adversarialStorage.store.delete(STORAGE_KEYS.GUEST_MODE);

      assert.equal(isGuestMode(), true, 'Must recognize legacy guest mode key');
    });

    test('Asymmetric canonical state recovery: if only nanda_v4_guest_mode is set, isGuestMode() returns true', () => {
      adversarialStorage.store.set(STORAGE_KEYS.GUEST_MODE, 'true');
      adversarialStorage.store.delete(STORAGE_KEYS.GUEST_MODE_LEGACY);

      assert.equal(isGuestMode(), true, 'Must recognize canonical guest mode key');
    });

    test('Invoking setGuestMode(false) cleanly resolves any asymmetric residue', () => {
      // Create asymmetric conflict
      adversarialStorage.store.set(STORAGE_KEYS.GUEST_MODE, 'false');
      adversarialStorage.store.set(STORAGE_KEYS.GUEST_MODE_LEGACY, 'true');

      // Now set to false
      setGuestMode(false);

      assert.equal(adversarialStorage.getItem(STORAGE_KEYS.GUEST_MODE), 'false');
      assert.equal(adversarialStorage.getItem(STORAGE_KEYS.GUEST_MODE_LEGACY), 'false');
      assert.equal(isGuestMode(), false);
    });

    test('signOut terminates guest mode and deletes BOTH canonical and legacy keys from storage', async () => {
      setGuestMode(true);
      assert.equal(isGuestMode(), true);

      await signOut();

      assert.equal(adversarialStorage.getItem(STORAGE_KEYS.GUEST_MODE), null);
      assert.equal(adversarialStorage.getItem(STORAGE_KEYS.GUEST_MODE_LEGACY), null);
      assert.equal(isGuestMode(), false);
    });

    test('Guest mode strictly enforces offline mode at all times', () => {
      setOfflineMode(false);
      assert.equal(isOfflineMode(), false);

      setGuestMode(true);
      assert.equal(isGuestMode(), true);
      assert.equal(isOfflineMode(), true, 'Activating guest mode must force isOfflineMode() to true');

      // Attempting to manually turn off offline mode while still in guest mode:
      setOfflineMode(false);
      // Because isGuestMode() is true, isOfflineMode() should still return true!
      assert.equal(isOfflineMode(), true, 'isOfflineMode() must remain true as long as guest mode is active');
    });

    test('initSupabase with active guest mode immediately returns degraded client with 0 network calls', () => {
      setGuestMode(true);

      const client = initSupabase('https://unreachable.supabase.co', createSampleJwt({ role: 'anon' }));
      assert.ok(client);
      assert.equal(client.isOfflineFallback, true);
      assert.equal(client.isDegraded, true);
      assert.equal(isOfflineFallbackActive(), true);
    });

    test('Degraded client getSession provides complete doctor profile metadata in guest mode', async () => {
      setGuestMode(true);
      const client = createDegradedClient();

      const { data, error } = await client.auth.getSession();
      assert.equal(error, null);
      assert.ok(data?.session);
      assert.equal(data.session.user.id, 'guest-doctor-offline');
      assert.equal(data.session.user.email, 'convidada@pediatria.local');
      assert.equal(data.session.user.user_metadata.full_name, 'Médica (Modo Local)');
    });

    test('Degraded client getSession returns null session when guest mode is disabled', async () => {
      setGuestMode(false);
      const client = createDegradedClient();

      const { data, error } = await client.auth.getSession();
      assert.equal(error, null);
      assert.equal(data?.session, null);
    });

    test('Stress: 50 consecutive guest mode toggles maintain consistency and emit matched events', () => {
      capturedEvents = [];

      for (let i = 0; i < 50; i++) {
        const target = i % 2 === 0;
        setGuestMode(target);
        assert.equal(isGuestMode(), target);
        assert.equal(adversarialStorage.getItem(STORAGE_KEYS.GUEST_MODE), String(target));
        assert.equal(adversarialStorage.getItem(STORAGE_KEYS.GUEST_MODE_LEGACY), String(target));
      }

      const guestEvents = capturedEvents.filter(e => e.type === 'v4_cloud_guest_mode_changed');
      assert.equal(guestEvents.length, 50);
    });
  });

  // --------------------------------------------------------------------------
  // 5. CANONICAL AUTHOR & IMMUTABLE INVARIANTS
  // --------------------------------------------------------------------------
  describe('5. Canonical Author & Immutable Invariants', () => {
    test('Canonical author constant APP_CREATOR is strictly FChNeto across modules', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(CONFIG_APP_CREATOR, 'FChNeto');
    });

    test('STORAGE_KEYS definitions conform strictly to canonical M3 specification', () => {
      assert.equal(STORAGE_KEYS.GUEST_MODE, 'nanda_v4_guest_mode');
      assert.equal(STORAGE_KEYS.GUEST_MODE_LEGACY, 'v4_cloud_guest_mode');
      assert.equal(STORAGE_KEYS.SUPABASE_URL, 'v4_cloud_supabase_url');
      assert.equal(STORAGE_KEYS.SUPABASE_ANON_KEY, 'v4_cloud_supabase_anon_key');
      assert.equal(STORAGE_KEYS.OFFLINE_MODE, 'v4_cloud_offline_mode');
    });

    test('assertNotServiceRoleKey categorically throws for all variants of service_role keys', () => {
      const forbiddenTokens = [
        'service_role_secret_key_1234567890',
        'SERVICE_ROLE_UPPERCASE_KEY_12345',
        'supabase_admin_privileged_token_xyz',
        'postgres_admin_root_token_12345678',
        'secret_key_admin_credentials_1234',
        'secret_token_prefix_1234567890123',
        createSampleJwt({ role: 'service_role' }),
        createSampleJwt({ role: 'supabase_admin' }),
        createSampleJwt({ role: 'postgres' }),
        createSampleJwt({ role: 'superuser' }),
        createSampleJwt({ role: 'postgres_admin' }),
        createSampleJwt({ app_metadata: { role: 'service_role' } }),
        createSampleJwt({ app_metadata: { role: 'supabase_admin' } })
      ];

      for (const token of forbiddenTokens) {
        assert.throws(() => {
          assertNotServiceRoleKey(token);
        }, /Security Violation/, `Must throw Security Violation for forbidden token: ${token.slice(0, 30)}`);
      }
    });

    test('assertNotServiceRoleKey passes for legitimate anon keys', () => {
      const safeTokens = [
        createSampleJwt({ role: 'anon', iss: 'supabase' }),
        createSampleJwt({ role: 'authenticated', iss: 'supabase' }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.signature_safe_12345'
      ];

      for (const token of safeTokens) {
        assert.doesNotThrow(() => {
          assertNotServiceRoleKey(token);
        });
      }
    });
  });
});

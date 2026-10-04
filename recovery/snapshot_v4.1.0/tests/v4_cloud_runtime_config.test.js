import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/config.js';
import { loadRuntimeConfig, STORAGE_KEYS } from '../js/config.js';

function makeResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

async function invoke(method, env) {
  const oldUrl = process.env.SUPABASE_URL;
  const oldAnon = process.env.SUPABASE_ANON_KEY;
  const oldPublishable = process.env.SUPABASE_PUBLISHABLE_KEY;
  try {
    if ('SUPABASE_URL' in env) process.env.SUPABASE_URL = env.SUPABASE_URL;
    else delete process.env.SUPABASE_URL;
    if ('SUPABASE_ANON_KEY' in env) process.env.SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
    else delete process.env.SUPABASE_ANON_KEY;
    if ('SUPABASE_PUBLISHABLE_KEY' in env) process.env.SUPABASE_PUBLISHABLE_KEY = env.SUPABASE_PUBLISHABLE_KEY;
    else delete process.env.SUPABASE_PUBLISHABLE_KEY;
    const response = makeResponse();
    handler({ method }, response);
    return response;
  } finally {
    if (oldUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = oldUrl;
    if (oldAnon === undefined) delete process.env.SUPABASE_ANON_KEY;
    else process.env.SUPABASE_ANON_KEY = oldAnon;
    if (oldPublishable === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
    else process.env.SUPABASE_PUBLISHABLE_KEY = oldPublishable;
  }
}

function makeAnonJwt() {
  const payload = Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url');
  return `header.${payload}.signature`;
}

describe('V4_Cloud Vercel runtime Supabase configuration endpoint', () => {
  test('returns only HTTPS project URL and a public anon key', async () => {
    const response = await invoke('GET', {
      SUPABASE_URL: 'https://sample-project.supabase.co/',
      SUPABASE_ANON_KEY: makeAnonJwt()
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.configured, true);
    assert.equal(response.body.SUPABASE_URL, 'https://sample-project.supabase.co');
    assert.equal(response.body.SUPABASE_ANON_KEY, makeAnonJwt());
    assert.deepEqual(Object.keys(response.body).sort(), ['SUPABASE_ANON_KEY', 'SUPABASE_URL', 'configured']);
    assert.equal(response.headers['Cache-Control'], 'no-store, max-age=0');
  });

  test('never returns service-role keys or non-HTTPS URLs', async () => {
    const serviceKey = await invoke('GET', {
      SUPABASE_URL: 'https://sample-project.supabase.co',
      SUPABASE_ANON_KEY: 'service_role_secret_value_that_must_never_be_exposed'
    });
    assert.equal(serviceKey.body.configured, false);
    assert.equal('SUPABASE_ANON_KEY' in serviceKey.body, false);

    const insecureUrl = await invoke('GET', {
      SUPABASE_URL: 'http://sample-project.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_key'
    });
    assert.equal(insecureUrl.body.configured, false);
  });

  test('rejects methods other than GET', async () => {
    const response = await invoke('POST', {});
    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, 'GET');
  });

  test('browser always fetches runtime config from the deployment root and prefers it to stale local values', async () => {
    const oldWindow = globalThis.window;
    const oldStorage = globalThis.localStorage;
    const oldFetch = globalThis.fetch;
    const key = makeAnonJwt();
    const values = new Map([
      [STORAGE_KEYS.SUPABASE_URL, 'https://old-project.supabase.co'],
      [STORAGE_KEYS.SUPABASE_ANON_KEY, makeAnonJwt()]
    ]);
    globalThis.window = { location: { origin: 'https://app.example.com', href: 'https://app.example.com/expenses/current' } };
    globalThis.localStorage = {
      getItem: name => values.get(name) || null,
      setItem: (name, value) => values.set(name, String(value)),
      removeItem: name => values.delete(name)
    };
    let requestedUrl = null;
    globalThis.fetch = async url => {
      requestedUrl = String(url);
      return {
        ok: true,
        json: async () => ({
          configured: true,
          SUPABASE_URL: 'https://current-project.supabase.co',
          SUPABASE_ANON_KEY: key
        })
      };
    };

    try {
      const config = await loadRuntimeConfig();
      assert.equal(requestedUrl, 'https://app.example.com/api/config');
      assert.equal(config.supabaseUrl, 'https://current-project.supabase.co');
      assert.equal(config.supabaseAnonKey, key);
      assert.equal(config.isConfigured, true);
    } finally {
      globalThis.window = oldWindow;
      globalThis.localStorage = oldStorage;
      globalThis.fetch = oldFetch;
    }
  });
});

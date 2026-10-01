/**
 * Finanças Pediatria V4_Cloud - Cliente Supabase & Motor de Autenticação Resiliente
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 * 
 * Invariantes de Engenharia:
 * 1. Zero Service Role: Bloqueio imediato e fatal de qualquer chave com privilégios de serviço.
 * 2. Carregamento ESM Híbrido: Compatível com script global, importação dinâmica de CDN e fallback offline.
 * 3. Resiliência Hospitalar: Modo offline degradado transparente, sem crashes na ausência de rede.
 * 4. Higienização de URL: Sanitização de hash tokens pós-OAuth para proteção contra vazamento.
 * 5. Auto-Provisionamento de Perfil: Garante a existência do registro médico em public.profiles.
 */

import { getConfig, isOfflineMode, setOfflineMode, isGuestMode, setGuestMode, APP_CREATOR, STORAGE_KEYS, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from './config.js';

export { APP_CREATOR };

// ============================================================================
// 1. ESTADO INTERNO DO MÓDULO
// ============================================================================
let _supabaseClient = null;
let _customCreateClientFn = null;
let _isInitializing = false;
let _initPromise = null;
let _sdkLoadFailed = false;

// ============================================================================
// 2. UTILITÁRIOS DE SEGURANÇA E DECODIFICAÇÃO
// ============================================================================

/**
 * Decodifica Base64 / Base64Url de forma agnóstica a browser e Node.js
 * @param {string} str 
 * @returns {string}
 */
export function base64Decode(str) {
  if (!str || typeof str !== 'string') return '';
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  
  if (typeof Buffer !== 'undefined') {
    try {
      return Buffer.from(b64, 'base64').toString('utf8');
    } catch {
      return '';
    }
  }
  if (typeof atob === 'function') {
    try {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * Validação rigorosa contra chaves service_role no frontend.
 * Dispara exceção fatal se uma chave administrativa for identificada.
 * 
 * @param {string} key - Chave do Supabase
 * @throws {Error} se a chave for identificada como service_role
 * @returns {boolean} true se segura
 */
export function assertNotServiceRoleKey(key) {
  if (!key || typeof key !== 'string') return true;

  const lower = key.toLowerCase();

  // 1. Verificação léxica de substrings de risco
  if (
    lower.includes('service_role') || 
    lower.includes('service-role') || 
    lower.includes('supabase_admin') ||
    lower.includes('postgres_admin') ||
    lower.includes('secret_key') ||
    lower.includes('secret-key') ||
    lower.startsWith('secret_')
  ) {
    console.error('[V4_Cloud Security Alert] VIOLAÇÃO CRÍTICA DE SEGURANÇA: Chave service_role detectada lexicalmente!');
    throw new Error('[SupabaseClient Security Violation] Uso de service_role key é estritamente proibido no frontend! Use exclusivamente a chave pública anon.');
  }

  // 2. Inspeção profunda do Payload JWT
  const parts = key.split('.');
  if (parts.length === 3) {
    try {
      const decodedPayload = base64Decode(parts[1]);
      if (decodedPayload) {
        const payload = JSON.parse(decodedPayload);
        const forbiddenRoles = ['service_role', 'supabase_admin', 'postgres', 'superuser', 'postgres_admin'];
        const role = (payload.role || payload.app_metadata?.role || '') + '';
        if (role && forbiddenRoles.includes(role.toLowerCase())) {
          console.error('[V4_Cloud Security Alert] VIOLAÇÃO CRÍTICA DE SEGURANÇA: Chave com role service_role detectada no payload JWT!');
          throw new Error('[SupabaseClient Security Violation] Uso de service_role key é estritamente proibido no frontend! Use exclusivamente a chave pública anon.');
        }
      }
    } catch (e) {
      if (e.message.includes('service_role')) {
        throw e;
      }
      // Se não for JSON válido, continua a validação
    }
  }

  return true;
}

// ============================================================================
// 3. MOCK / CLIENTE OFFLINE DEGRADADO
// ============================================================================

/**
 * Cria uma instância do cliente Supabase offline degradado.
 * Implementa as interfaces principais de Auth e Query Builder sem gerar falhas de execução.
 * 
 * @returns {object} Cliente Supabase Mock para Modo Hospitalar / Offline
 */
export function createDegradedClient() {
  const degradedAuth = {
    getSession: async () => {
      if (isGuestMode()) {
        return {
          data: {
            session: {
              user: {
                id: 'guest-doctor-offline',
                email: 'convidada@pediatria.local',
                user_metadata: {
                  full_name: 'Dra. Fernanda Ch. (Modo Local)',
                  name: 'Dra. Fernanda Ch. (Modo Local)'
                }
              }
            }
          },
          error: null
        };
      }
      return { data: { session: null }, error: null };
    },

    getUser: async () => {
      const sessionResult = await degradedAuth.getSession();
      return {
        data: { user: sessionResult.data?.session?.user || null },
        error: null
      };
    },

    signInWithOAuth: async () => {
      const config = getConfig();
      const isUnconfigured = !config.supabaseUrl || !config.supabaseAnonKey;
      const msg = isUnconfigured
        ? 'Modo Offline: Supabase não configurado. Por favor, configure a URL do Projeto e a Chave Pública Anon (⚙️) antes de conectar via Google.'
        : 'Modo Offline: Autenticação via Google indisponível sem conexão à internet.';
      const err = new Error(msg);
      if (isUnconfigured) err.isNotConfigured = true;
      return { data: null, error: err };
    },

    signInWithOtp: async () => {
      const config = getConfig();
      const isUnconfigured = !config.supabaseUrl || !config.supabaseAnonKey;
      const msg = isUnconfigured
        ? 'Modo Offline: Supabase não configurado. Por favor, configure a URL do Projeto e a Chave Pública Anon (⚙️) antes de enviar o Link Mágico.'
        : 'Modo Offline: Envio de Link Mágico indisponível sem conexão à internet.';
      const err = new Error(msg);
      if (isUnconfigured) err.isNotConfigured = true;
      return { data: null, error: err };
    },

    signInWithPassword: async () => {
      const config = getConfig();
      const isUnconfigured = !config.supabaseUrl || !config.supabaseAnonKey;
      const msg = isUnconfigured
        ? 'Modo Offline: Supabase não configurado. Por favor, configure a URL do Projeto e a Chave Pública Anon (⚙️) antes de conectar com e-mail e senha.'
        : 'Modo Offline: Login por e-mail e senha indisponível sem conexão à internet.';
      const err = new Error(msg);
      if (isUnconfigured) err.isNotConfigured = true;
      return { data: null, error: err };
    },

    signUp: async () => {
      const config = getConfig();
      const isUnconfigured = !config.supabaseUrl || !config.supabaseAnonKey;
      const msg = isUnconfigured
        ? 'Modo Offline: Supabase não configurado. Por favor, configure a URL do Projeto e a Chave Pública Anon (⚙️) antes de cadastrar.'
        : 'Modo Offline: Cadastro por e-mail e senha indisponível sem conexão à internet.';
      const err = new Error(msg);
      if (isUnconfigured) err.isNotConfigured = true;
      return { data: null, error: err };
    },

    signOut: async () => {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEYS.GUEST_MODE);
          localStorage.removeItem(STORAGE_KEYS.GUEST_MODE_LEGACY);
        } catch (e) {}
      }
      return { error: null };
    },

    onAuthStateChange: (callback) => {
      if (typeof callback === 'function') {
        setTimeout(async () => {
          const { data } = await degradedAuth.getSession();
          callback('INITIAL_SESSION', data?.session || null);
        }, 0);
      }
      return {
        data: {
          subscription: {
            id: 'degraded-sub',
            unsubscribe: () => {}
          }
        }
      };
    }
  };

  const createQueryBuilder = (tableName) => {
    const builder = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      upsert: () => builder,
      eq: () => builder,
      neq: () => builder,
      gt: () => builder,
      gte: () => builder,
      lt: () => builder,
      lte: () => builder,
      order: () => builder,
      limit: () => builder,
      single: async () => ({
        data: null,
        error: new Error(`[Offline] Consulta a tabela "${tableName}" indisponível em modo offline.`)
      }),
      maybeSingle: async () => ({
        data: null,
        error: null
      }),
      then: (resolve) => {
        resolve({
          data: [],
          error: new Error(`[Offline] Operação na tabela "${tableName}" indisponível em modo offline.`)
        });
      }
    };
    return builder;
  };

  return {
    isOfflineFallback: true,
    isDegraded: true,
    auth: degradedAuth,
    from: createQueryBuilder
  };
}

// ============================================================================
// 4. RESOLUÇÃO E CARREGAMENTO DO SDK SUPABASE
// ============================================================================

/**
 * Obtém a função createClient disponível no ambiente
 * @returns {Promise<Function|null>}
 */
async function resolveCreateClientFunction() {
  // 1. Hook de testes automatizados (injeção mock)
  if (_customCreateClientFn) {
    return _customCreateClientFn;
  }

  // 2. Global scope (window.supabase ou globalThis.supabase via script tag)
  if (typeof window !== 'undefined' && window.supabase?.createClient) {
    return window.supabase.createClient;
  }
  if (typeof globalThis !== 'undefined' && globalThis.supabase?.createClient) {
    return globalThis.supabase.createClient;
  }

  // 3. Importação dinâmica ESM do CDN oficial
  if (typeof window !== 'undefined' && !_sdkLoadFailed) {
    try {
      const cdnUrl = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
      const module = await import(cdnUrl);
      const createFn = module.createClient || module.default?.createClient;
      if (typeof createFn === 'function') {
        return createFn;
      }
    } catch (err) {
      _sdkLoadFailed = true;
      console.warn('[SupabaseClient] Falha ao importar SDK via CDN ESM (offline ou bloqueado):', err.message);
    }
  }

  return null;
}

// ============================================================================
// 5. INICIALIZAÇÃO DO CLIENTE SUPABASE
// ============================================================================

/**
 * Inicializa o cliente Supabase utilizando credenciais explícitas ou de config.js.
 * Operação síncrona com fallback resiliente imediato caso o SDK ainda esteja carregando.
 * 
 * @param {string} [customUrl] - URL opcional do Supabase
 * @param {string} [customKey] - Chave Pública Anon opcional
 * @returns {object} Instância do cliente Supabase ou Mock degradado
 */
export function initSupabase(customUrl, customKey) {
  // 1. Se credenciais não forem passadas, lê de config.js
  const config = getConfig();
  const url = customUrl || config.supabaseUrl;
  const key = customKey || config.supabaseAnonKey;

  // 2. Verificação de Modo Offline Forçado
  if (isOfflineMode()) {
    _supabaseClient = createDegradedClient();
    return _supabaseClient;
  }

  // 3. Validação de Credenciais
  if (!url || !key) {
    _supabaseClient = createDegradedClient();
    return _supabaseClient;
  }

  // 4. Barreira de Segurança contra service_role
  assertNotServiceRoleKey(key);

  // 5. Tentativa síncrona com SDK já em memória
  let createClientFn = null;
  if (_customCreateClientFn) {
    createClientFn = _customCreateClientFn;
  } else if (typeof window !== 'undefined' && window.supabase?.createClient) {
    createClientFn = window.supabase.createClient;
  } else if (typeof globalThis !== 'undefined' && globalThis.supabase?.createClient) {
    createClientFn = globalThis.supabase.createClient;
  }

  if (createClientFn) {
    try {
      _supabaseClient = createClientFn(url, key, {
        auth: {
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
          storageKey: 'v4_cloud_auth_token'
        }
      });
      _supabaseClient.isOfflineFallback = false;
      return _supabaseClient;
    } catch (err) {
      console.error('[SupabaseClient] Erro ao instanciar cliente Supabase com SDK:', err);
    }
  }

  // 6. Caso o SDK dependa de importação assíncrona ESM, inicializa background load
  // e provê cliente degradado imediato para evitar null pointers
  if (!_supabaseClient) {
    _supabaseClient = createDegradedClient();
    
    // Inicia carregamento assíncrono em background
    initSupabaseAsync(url, key).catch((e) => {
      console.warn('[SupabaseClient] Falha no bootstrap assíncrono:', e.message);
    });
  }

  return _supabaseClient;
}

/**
 * Inicialização assíncrona completa do Supabase garantindo o carregamento do ESM
 * 
 * @param {string} [customUrl] 
 * @param {string} [customKey] 
 * @returns {Promise<object>}
 */
export async function initSupabaseAsync(customUrl, customKey) {
  const config = getConfig();
  const url = customUrl || config.supabaseUrl;
  const key = customKey || config.supabaseAnonKey;

  if (isOfflineMode() || !url || !key) {
    _supabaseClient = createDegradedClient();
    return _supabaseClient;
  }

  assertNotServiceRoleKey(key);

  const createClientFn = await resolveCreateClientFunction();
  if (createClientFn) {
    try {
      _supabaseClient = createClientFn(url, key, {
        auth: {
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
          storageKey: 'v4_cloud_auth_token'
        }
      });
      _supabaseClient.isOfflineFallback = false;
      return _supabaseClient;
    } catch (err) {
      console.error('[SupabaseClient] Erro ao criar cliente no initSupabaseAsync:', err);
    }
  }

  _supabaseClient = createDegradedClient();
  return _supabaseClient;
}

/**
 * Retorna o cliente Supabase ativo ou inicializa um novo sob demanda
 * @returns {object}
 */
export function getSupabase() {
  if (!_supabaseClient || (_supabaseClient.isOfflineFallback && !isOfflineMode())) {
    return initSupabase();
  }
  return _supabaseClient;
}

// ============================================================================
// 6. MÉTODOS DE AUTENTICAÇÃO (AUTH API)
// ============================================================================

/**
 * Autenticação via Google OAuth com 1-toque
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function signInWithGoogle() {
  if (isGuestMode() || isOfflineMode()) {
    setOfflineMode(false);
    setGuestMode(false);
  }

  let client = getSupabase();
  if (!client || client.isOfflineFallback) {
    try {
      client = await initSupabaseAsync();
    } catch (e) {}
  }

  if (!client || client.isOfflineFallback) {
    if (DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_ANON_KEY) {
      try {
        client = await initSupabaseAsync(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
      } catch (e) {}
    }
  }

  if (!client || client.isOfflineFallback) {
    const config = getConfig();
    const isUnconfigured = !config.supabaseUrl || !config.supabaseAnonKey;
    const msg = isUnconfigured
      ? 'Modo Offline: Supabase não configurado. Por favor, configure a URL do Projeto e a Chave Pública Anon (⚙️) antes de conectar via Google.'
      : 'Modo Offline: Autenticação via Google indisponível sem conexão à internet.';
    const error = new Error(msg);
    if (isUnconfigured) error.isNotConfigured = true;
    console.warn('[SupabaseClient]', error.message);
    return { data: null, error };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const error = new Error('Modo Offline: Não é possível conectar via Google sem conexão à internet.');
    console.warn('[SupabaseClient]', error.message);
    return { data: null, error };
  }

  const origin = (typeof window !== 'undefined' && window.location?.origin)
    ? window.location.origin
    : 'http://localhost';

  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      console.error('[SupabaseClient] Erro no Google OAuth:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.error('[SupabaseClient] Exceção no signInWithGoogle:', err);
    return { data: null, error: err };
  }
}

/**
 * Autenticação via Magic Link sem senha por e-mail
 * @param {string} email - E-mail da médica
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function signInWithMagicLink(email) {
  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return {
      data: null,
      error: new Error('Por favor, informe um e-mail válido para receber o Link Mágico.')
    };
  }

  if (isGuestMode() || isOfflineMode()) {
    setOfflineMode(false);
    setGuestMode(false);
  }

  let client = getSupabase();
  if (!client || client.isOfflineFallback) {
    try {
      client = await initSupabaseAsync();
    } catch (e) {}
  }

  if (!client || client.isOfflineFallback) {
    if (DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_ANON_KEY) {
      try {
        client = await initSupabaseAsync(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
      } catch (e) {}
    }
  }

  if (!client || client.isOfflineFallback) {
    const config = getConfig();
    const isUnconfigured = !config.supabaseUrl || !config.supabaseAnonKey;
    const msg = isUnconfigured
      ? 'Modo Offline: Supabase não configurado. Por favor, configure a URL do Projeto e a Chave Pública Anon (⚙️) antes de enviar o Link Mágico.'
      : 'Modo Offline: Envio de Link Mágico indisponível sem conexão à internet.';
    const error = new Error(msg);
    if (isUnconfigured) error.isNotConfigured = true;
    console.warn('[SupabaseClient]', error.message);
    return { data: null, error };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const error = new Error('Modo Offline: Envio de Link Mágico indisponível sem conexão à internet.');
    console.warn('[SupabaseClient]', error.message);
    return { data: null, error };
  }

  const origin = (typeof window !== 'undefined' && window.location?.origin)
    ? window.location.origin
    : 'http://localhost';

  try {
    const { data, error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: origin
      }
    });

    if (error) {
      console.error('[SupabaseClient] Erro no signInWithOtp:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.error('[SupabaseClient] Exceção no signInWithMagicLink:', err);
    return { data: null, error: err };
  }
}

/**
 * Realiza autenticação direta por e-mail e senha
 * @param {string} email - Endereço de e-mail
 * @param {string} password - Senha (mínimo 6 caracteres)
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function signInWithPassword(email, password) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    const error = new Error('Por favor, informe um endereço de e-mail válido.');
    return { data: null, error };
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    const error = new Error('A senha deve conter no mínimo 6 caracteres.');
    return { data: null, error };
  }

  if (isGuestMode() || isOfflineMode()) {
    setOfflineMode(false);
    setGuestMode(false);
  }

  let client = getSupabase();
  if (!client || client.isOfflineFallback) {
    try {
      client = await initSupabaseAsync();
    } catch (e) {}
  }

  if (!client || client.isOfflineFallback) {
    if (DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_ANON_KEY) {
      try {
        client = await initSupabaseAsync(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
      } catch (e) {}
    }
  }

  if (!client || client.isOfflineFallback) {
    const config = getConfig();
    const isUnconfigured = !config.supabaseUrl || !config.supabaseAnonKey;
    const msg = isUnconfigured
      ? 'Modo Offline: Supabase não configurado. Por favor, configure a URL do Projeto e a Chave Pública Anon (⚙️) antes de conectar com e-mail e senha.'
      : 'Modo Offline: Login indisponível sem conexão à internet.';
    const error = new Error(msg);
    if (isUnconfigured) error.isNotConfigured = true;
    console.warn('[SupabaseClient]', error.message);
    return { data: null, error };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const error = new Error('Modo Offline: Login indisponível sem conexão à internet.');
    console.warn('[SupabaseClient]', error.message);
    return { data: null, error };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      console.error('[SupabaseClient] Erro no signInWithPassword:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.error('[SupabaseClient] Exceção no signInWithPassword:', err);
    return { data: null, error: err };
  }
}

/**
 * Cadastra uma nova conta de médica diretamente com e-mail e senha
 * @param {string} email - Endereço de e-mail
 * @param {string} password - Senha (mínimo 6 caracteres)
 * @param {string} [doctorName='Dra. Fernanda Ch.'] - Nome completo da médica
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function signUpWithPassword(email, password, doctorName = 'Dra. Fernanda Ch.') {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    const error = new Error('Por favor, informe um endereço de e-mail válido.');
    return { data: null, error };
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    const error = new Error('A senha deve conter no mínimo 6 caracteres.');
    return { data: null, error };
  }

  if (isGuestMode() || isOfflineMode()) {
    setOfflineMode(false);
    setGuestMode(false);
  }

  let client = getSupabase();
  if (!client || client.isOfflineFallback) {
    try {
      client = await initSupabaseAsync();
    } catch (e) {}
  }

  if (!client || client.isOfflineFallback) {
    if (DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_ANON_KEY) {
      try {
        client = await initSupabaseAsync(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
      } catch (e) {}
    }
  }

  if (!client || client.isOfflineFallback) {
    const config = getConfig();
    const isUnconfigured = !config.supabaseUrl || !config.supabaseAnonKey;
    const msg = isUnconfigured
      ? 'Modo Offline: Supabase não configurado. Por favor, configure a URL do Projeto e a Chave Pública Anon (⚙️) antes de cadastrar.'
      : 'Modo Offline: Cadastro indisponível sem conexão à internet.';
    const error = new Error(msg);
    if (isUnconfigured) error.isNotConfigured = true;
    console.warn('[SupabaseClient]', error.message);
    return { data: null, error };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const error = new Error('Modo Offline: Cadastro indisponível sem conexão à internet.');
    console.warn('[SupabaseClient]', error.message);
    return { data: null, error };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: doctorName || 'Dra. Fernanda Ch.',
          name: doctorName || 'Dra. Fernanda Ch.'
        }
      }
    });

    if (error) {
      console.error('[SupabaseClient] Erro no signUp:', error.message);
    }
    return { data, error };
  } catch (err) {
    console.error('[SupabaseClient] Exceção no signUpWithPassword:', err);
    return { data: null, error: err };
  }
}

/**
 * Desconecta a sessão atual e limpa estado local
 * @returns {Promise<{ error: object|null }>}
 */
export async function signOut() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEYS.GUEST_MODE);
      localStorage.removeItem(STORAGE_KEYS.GUEST_MODE_LEGACY);
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_MODE);
      if (STORAGE_KEYS.OFFLINE_MODE_LEGACY) {
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_MODE_LEGACY);
      }
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('v4_cloud_guest_mode_changed', {
        detail: { isGuest: false }
      }));
      window.dispatchEvent(new CustomEvent('v4_cloud_offline_mode_changed', {
        detail: { isOffline: false }
      }));
    } catch (e) {}
  }

  const client = _supabaseClient;
  if (!client || client.isOfflineFallback) {
    if (!isOfflineMode()) {
      initSupabase();
    }
    return { error: null };
  }

  try {
    const { error } = await client.auth.signOut();
    if (error) {
      console.warn('[SupabaseClient] Erro ao deslogar:', error.message);
    }
    if (!isOfflineMode()) {
      initSupabase();
    }
    return { error };
  } catch (err) {
    console.warn('[SupabaseClient] Exceção ao deslogar:', err);
    if (!isOfflineMode()) {
      initSupabase();
    }
    return { error: err };
  }
}

/**
 * Obtém a sessão ativa de autenticação
 * @returns {Promise<object|null>}
 */
export async function getSession() {
  const client = getSupabase();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.warn('[SupabaseClient] Erro ao recuperar sessão:', error.message);
      return null;
    }
    return data?.session || null;
  } catch (err) {
    console.warn('[SupabaseClient] Exceção no getSession:', err);
    return null;
  }
}

// ============================================================================
// 7. HIGIENIZAÇÃO DE HASH OAUTH E AUTO-CRIAÇÃO DE PERFIL MÉDICO
// ============================================================================

/**
 * Faz o parsing de fragmentos de hash (#access_token=...) retornados de redirecionamentos OAuth
 * @param {string} [hashString] - Hash opcional para testes
 * @returns {object|null}
 */
export function parseOAuthHash(hashString) {
  let hash = hashString;
  if (!hash && typeof window !== 'undefined') {
    hash = window.location?.hash || '';
    if (!hash && window.location?.search && (window.location.search.includes('code=') || window.location.search.includes('error='))) {
      hash = window.location.search;
    }
  }
  if (!hash || typeof hash !== 'string' || !hash.includes('=')) {
    return null;
  }

  const cleanHash = (hash.startsWith('#') || hash.startsWith('?')) ? hash.substring(1) : hash;
  const params = new URLSearchParams(cleanHash);

  const error = params.get('error');
  const errorDescription = params.get('error_description');
  if (error || errorDescription) {
    return {
      isError: true,
      error,
      errorDescription: decodeURIComponent(errorDescription || error || 'Erro de autenticação OAuth')
    };
  }

  const accessToken = params.get('access_token');
  if (accessToken) {
    return {
      isSuccess: true,
      accessToken,
      refreshToken: params.get('refresh_token'),
      expiresIn: params.get('expires_in') ? parseInt(params.get('expires_in'), 10) : null,
      tokenType: params.get('token_type'),
      type: params.get('type')
    };
  }

  const code = params.get('code');
  if (code) {
    return {
      isSuccess: true,
      code,
      type: 'pkce'
    };
  }

  return null;
}

/**
 * Remove fragmentos de token e parâmetros OAuth (?code=, ?error=) da URL via history.replaceState
 */
export function clearOAuthHashFromUrl() {
  if (typeof window !== 'undefined' && window.history?.replaceState && window.location) {
    const hash = window.location.hash || '';
    let search = window.location.search || '';
    let searchModified = false;

    if (search) {
      try {
        const cleanSearch = search.startsWith('?') ? search.substring(1) : search;
        const params = new URLSearchParams(cleanSearch);
        const paramsToRemove = ['code', 'error', 'error_description', 'error_code', 'state'];
        for (const p of paramsToRemove) {
          if (params.has(p)) {
            params.delete(p);
            searchModified = true;
          }
        }
        if (searchModified) {
          const newSearchStr = params.toString();
          search = newSearchStr ? `?${newSearchStr}` : '';
          window.location.search = search;
        }
      } catch (e) {}
    }

    if (hash.includes('access_token') || hash.includes('error') || hash.includes('type=recovery') || searchModified) {
      window.location.hash = '';
      const cleanUrl = (window.location.pathname || '/') + search;
      window.history.replaceState(null, '', cleanUrl);
    }
  }
}

/**
 * Processa explicitamente o retorno de autenticação OAuth / PKCE se presente na URL
 * @returns {Promise<{ session?: object, error?: object } | null>}
 */
export async function processOAuthCallback() {
  if (typeof window === 'undefined') return null;

  const searchParams = new URLSearchParams(window.location?.search || '');
  const rawHash = window.location?.hash ? (window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash) : '';
  const hashParams = new URLSearchParams(rawHash);

  // 1. Tratamento de erro retornado pelo provedor OAuth
  const error = searchParams.get('error') || hashParams.get('error');
  const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
  if (error || errorDescription) {
    clearOAuthHashFromUrl();
    const errMsg = decodeURIComponent(errorDescription || error || 'Falha na autenticação OAuth.');
    return { error: new Error(errMsg) };
  }

  // 2. Extrai parâmetro code do PKCE e realiza troca explícita pela sessão
  const code = searchParams.get('code');
  if (code) {
    let client = getSupabase();
    if (!client || client.isOfflineFallback) {
      try {
        client = await initSupabaseAsync();
      } catch (e) {}
    }

    if (client && !client.isOfflineFallback && client.auth?.exchangeCodeForSession) {
      try {
        const { data, error: exError } = await client.auth.exchangeCodeForSession(code);
        clearOAuthHashFromUrl();
        if (exError) {
          console.warn('[SupabaseClient] Erro no exchangeCodeForSession:', exError.message);
          return { error: exError };
        }
        if (data?.session) {
          if (data.session.user) {
            try {
              await ensureProfile(data.session.user);
            } catch (pErr) {}
          }
          return { session: data.session };
        }
      } catch (err) {
        clearOAuthHashFromUrl();
        console.warn('[SupabaseClient] Exceção no exchangeCodeForSession:', err);
        return { error: err };
      }
    }
  }

  // 3. Se houver tokens no hash (#access_token=)
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  if (accessToken && refreshToken) {
    let client = getSupabase();
    if (client && !client.isOfflineFallback && client.auth?.setSession) {
      try {
        const { data, error: setErr } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        clearOAuthHashFromUrl();
        if (setErr) {
          return { error: setErr };
        }
        if (data?.session) {
          return { session: data.session };
        }
      } catch (err) {
        clearOAuthHashFromUrl();
        return { error: err };
      }
    }
  }

  return null;
}

/**
 * Garante a existência do registro da médica em public.profiles.
 * Caso não exista, realiza o provisionamento inicial com dados canônicos.
 * 
 * @param {object} user - Objeto de usuário Supabase
 * @returns {Promise<{ data: object|null, error: object|null, created: boolean }>}
 */
export async function ensureProfile(user) {
  if (!user || !user.id) {
    return { data: null, error: new Error('Usuário inválido para assegurar perfil.'), created: false };
  }

  const client = getSupabase();
  if (!client || client.isOfflineFallback) {
    return { data: null, error: new Error('Cliente offline: impossível sincronizar perfil.'), created: false };
  }

  try {
    // 1. Consulta se o perfil já foi criado pelo trigger handle_new_user
    const { data: existing } = await client
      .from('profiles')
      .select('id, doctor_name, photo_url, residency_salary')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) {
      return { data: existing, error: null, created: false };
    }

    // 2. Perfil ausente: provê dados padrão seguros da Dra. Fernanda Ch.
    const meta = user.user_metadata || {};
    const doctorName = meta.full_name || meta.name || 'Dra. Fernanda Ch.';
    const photoUrl = meta.avatar_url || meta.picture || null;

    const profilePayload = {
      id: user.id,
      doctor_name: doctorName,
      crm: null,
      rqe: null,
      specialty: 'Pediatria',
      photo_url: photoUrl,
      residency_salary: 4106.09,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: inserted, error: insertErr } = await client
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select()
      .single();

    if (insertErr) {
      console.warn('[SupabaseClient] Aviso na criação de perfil (trigger pode ter provisionado simultaneamente):', insertErr.message);
      return { data: profilePayload, error: insertErr, created: false };
    }

    console.info('[SupabaseClient] Perfil médico garantido para:', doctorName);
    return { data: inserted || profilePayload, error: null, created: true };
  } catch (err) {
    console.warn('[SupabaseClient] Exceção ao assegurar perfil médico:', err);
    return { data: null, error: err, created: false };
  }
}

/**
 * Inscreve um callback para ouvir mudanças no estado de autenticação.
 * Higieniza fragmentos de token na URL e auto-cria o perfil no login.
 * 
 * @param {Function} callback - (event: string, session: object|null) => void
 * @returns {{ data: { subscription: object }, unsubscribe: Function }}
 */
export function onAuthStateChange(callback) {
  const client = getSupabase();
  if (!client) {
    const noopSub = { id: 'noop', unsubscribe: () => {} };
    return { data: { subscription: noopSub }, unsubscribe: () => {} };
  }

  // Avalia fragmentos de hash imediatamente
  const hashData = parseOAuthHash();
  if (hashData?.isError && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('v4_cloud_auth_error', { detail: hashData }));
  }

  const result = client.auth.onAuthStateChange(async (event, session) => {
    // 1. Em eventos de login ou sessão inicial válida, limpa a hash para segurança
    if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session)) {
      clearOAuthHashFromUrl();

      // 2. Assegura perfil no banco
      if (session?.user) {
        try {
          await ensureProfile(session.user);
        } catch (e) {
          console.warn('[SupabaseClient] Falha silenciosa no ensureProfile:', e);
        }
      }
    }

    // 3. Encaminha para o callback registrado
    if (typeof callback === 'function') {
      try {
        callback(event, session);
      } catch (cbErr) {
        console.error('[SupabaseClient] Erro no callback de onAuthStateChange:', cbErr);
      }
    }
  });

  const subscription = result?.data?.subscription || result?.subscription || { unsubscribe: () => {} };

  return {
    data: { subscription },
    unsubscribe: () => {
      if (typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    }
  };
}

// ============================================================================
// 8. OUVINTES DE EVENTOS GLOBAIS DE CONFIGURAÇÃO
// ============================================================================

if (typeof window !== 'undefined') {
  // Re-inicializa cliente quando a médica salva novas credenciais no modal
  window.addEventListener('v4_cloud_config_updated', (event) => {
    const { supabaseUrl, supabaseAnonKey, isConfigured } = event.detail || {};
    if (isConfigured) {
      initSupabase(supabaseUrl, supabaseAnonKey);
    } else {
      _supabaseClient = createDegradedClient();
    }
  });

  // Reage à alteração de modo offline
  window.addEventListener('v4_cloud_offline_mode_changed', (event) => {
    const { isOffline } = event.detail || {};
    if (isOffline) {
      _supabaseClient = createDegradedClient();
    } else {
      initSupabase();
    }
  });
}

// ============================================================================
// 9. STATUS E HOOKS PARA TESTES AUTOMATIZADOS
// ============================================================================

/**
 * Informa se o cliente ativo está rodando em modo offline degradado
 * @returns {boolean}
 */
export function isOfflineFallbackActive() {
  return Boolean(_supabaseClient?.isOfflineFallback);
}

/**
 * Informa se há credenciais válidas configuradas
 * @returns {boolean}
 */
export function isClientConfigured() {
  return getConfig().isConfigured && !isOfflineFallbackActive();
}

/**
 * Hook exclusivo para testes automatizados: injeta função createClient mock
 * @param {Function|null} fn 
 */
export function _setCreateClientForTesting(fn) {
  _customCreateClientFn = fn;
}

/**
 * Hook exclusivo para testes automatizados: reseta o estado do cliente
 */
export function _resetClientForTesting() {
  _supabaseClient = null;
  _customCreateClientFn = null;
  _isInitializing = false;
  _initPromise = null;
  _sdkLoadFailed = false;
}

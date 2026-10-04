/**
 * Finanças Pediatria V4_Cloud - Módulo Canônico de Configuração e Credenciais
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 * 
 * Invariantes de Segurança & Resiliência Hospitalar:
 * 1. Zero Segredos Hardcoded: Nenhuma chave Supabase (nem pública, nem de serviço)
 *    deve estar gravada estaticamente neste código.
 * 2. Suporte Dinâmico: Lê variáveis injetadas em runtime (window.__ENV__) com fallback
 *    para credenciais salvas com segurança no localStorage.
 * 3. Modo Offline/Hospitalar & Convidada: Permite alternar instantaneamente para uso local
 *    sem rede, com armazenamento canônico em 'nanda_v4_guest_mode' = 'true'.
 * 4. Rejeição Estrita de Chaves Privilegiadas (service_role): Inspeção textual e decodificação
 *    de payload JWT para barrar completamente chaves de serviço no frontend.
 */

// ============================================================================
// 1. CONSTANTES CANÔNICAS IMUTÁVEIS
// ============================================================================
export const APP_CREATOR = 'FChNeto';
export const APP_VERSION = '4.0.0';
export const APP_NAME = 'Finanças Pediatria V4_Cloud';
export const DOCTOR_DEFAULT_NAME = 'Médica';

// Chaves canônicas de armazenamento no localStorage
export const STORAGE_KEYS = {
  SUPABASE_URL: 'v4_cloud_supabase_url',
  SUPABASE_ANON_KEY: 'v4_cloud_supabase_anon_key',
  OFFLINE_MODE: 'v4_cloud_offline_mode',
  OFFLINE_MODE_LEGACY: 'v4_cloud_offline_mode_legacy',
  GUEST_MODE: 'nanda_v4_guest_mode',            // Chave Canônica M3 (ORIGINAL_REQUEST / Prompt)
  GUEST_MODE_LEGACY: 'v4_cloud_guest_mode',     // Compatibilidade retroativa M1/M2
  ACTIVE_THEME: 'v4_cloud_theme'
};

// ============================================================================
// 2. DECODIFICAÇÃO DE JWT & INSPEÇÃO DE CHAVES PRIVILEGIADAS
// ============================================================================

/**
 * Decodifica o payload de um token JWT sem dependências externas.
 * Suporta ambientes de navegador (atob) e Node.js (Buffer).
 * 
 * @param {string} token 
 * @returns {Record<string, any>|null}
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    
    // Ambiente Node.js (se Buffer estiver disponível)
    if (typeof Buffer !== 'undefined') {
      const jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(jsonStr);
    }
    
    // Ambiente Navegador
    if (typeof atob === 'function') {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      return JSON.parse(jsonStr);
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Verifica se a chave fornecida é uma chave de serviço (service_role)
 * ou chave com privilégios administrativos indevidos para o cliente.
 * 
 * @param {string} key 
 * @returns {boolean} Retorna true se for uma chave service_role (proibida)
 */
export function isServiceRoleKey(key) {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();

  // 1. Verificação léxica de substrings de risco administrativo
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('service_role') || 
    lower.includes('service-role') || 
    lower.includes('supabase_admin') ||
    lower.includes('postgres_admin') ||
    lower.includes('secret_key') ||
    lower.includes('secret-key') ||
    lower.startsWith('secret_')
  ) {
    return true;
  }

  // 2. Inspeção detalhada do payload JWT
  const payload = parseJwtPayload(trimmed);
  if (payload) {
    const forbiddenRoles = ['service_role', 'supabase_admin', 'postgres', 'superuser', 'postgres_admin'];
    const role = (payload.role || payload.app_metadata?.role || '') + '';
    if (role && forbiddenRoles.includes(role.toLowerCase())) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// 3. VALIDADORES DE ENTRADA DE CREDENCIAIS
// ============================================================================

/**
 * Valida se uma URL tem estrutura plausível para o Supabase (HTTPS válido)
 * @param {string} url 
 * @returns {boolean}
 */
export function isValidSupabaseUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' && parsed.hostname.length > 3;
  } catch {
    return false;
  }
}

/**
 * Valida se uma chave Anon possui formato básico de token ou JWT público.
 * Rejeita categoricamente qualquer chave que contenha ou represente 'service_role'.
 * 
 * @param {string} key 
 * @returns {boolean}
 */
export function isValidSupabaseAnonKey(key) {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  
  // Requisito mínimo de tamanho e rejeição estrita de service_role
  if (trimmed.length < 20) return false;
  if (isServiceRoleKey(trimmed)) return false;

  // Se for JWT, verifica claims
  const parts = trimmed.split('.');
  if (parts.length === 3) {
    const payload = parseJwtPayload(trimmed);
    if (payload) {
      if (payload.role && payload.role !== 'anon') {
        return false;
      }
    }
  }

  return true;
}

// ============================================================================
// 4. STORE DE CONFIGURAÇÃO (GET / SAVE / CLEAR)
// ============================================================================

/**
 * Obtém a configuração ativa do Supabase.
 * Ordem de Precedência:
 * 1. Variáveis injetadas no ambiente (window.__ENV__ providas pela Vercel / script)
 * 2. Valores customizados armazenados no localStorage do navegador
 * 3. Fallback seguro: null (Zero Hardcoded Secrets)
 * 
 * @returns {{ supabaseUrl: string|null, supabaseAnonKey: string|null, isConfigured: boolean }}
 */
export function getConfig() {
  // 1. Injeção de Runtime (se houver)
  const envUrl = (typeof window !== 'undefined' && window.__ENV__?.SUPABASE_URL) ? window.__ENV__.SUPABASE_URL.trim() : null;
  const envKey = (typeof window !== 'undefined' && window.__ENV__?.SUPABASE_ANON_KEY) ? window.__ENV__.SUPABASE_ANON_KEY.trim() : null;

  // 2. LocalStorage persistido
  let localUrl = null;
  let localKey = null;

  if (typeof localStorage !== 'undefined') {
    try {
      localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL);
      localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_ANON_KEY);
      if (localUrl) localUrl = localUrl.trim();
      if (localKey) localKey = localKey.trim();
    } catch (e) {
      console.warn('[Config] Erro ao acessar localStorage:', e);
    }
  }

  const supabaseUrl = localUrl || envUrl || null;
  const supabaseAnonKey = localKey || envKey || null;

  const isConfigured = Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    isValidSupabaseUrl(supabaseUrl) && 
    isValidSupabaseAnonKey(supabaseAnonKey)
  );

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured
  };
}

/**
 * Grava as credenciais do Supabase no localStorage de forma segura
 * e emite um evento global 'v4_cloud_config_updated'.
 * 
 * @param {string} supabaseUrl - URL do projeto Supabase
 * @param {string} supabaseAnonKey - Chave Pública Anon
 * @returns {boolean} Retorna true se gravado com sucesso, false se inválido
 */
export function saveConfig(supabaseUrl, supabaseAnonKey) {
  if (!isValidSupabaseUrl(supabaseUrl)) {
    console.error('[Config] URL do Supabase inválida:', supabaseUrl);
    return false;
  }

  if (isServiceRoleKey(supabaseAnonKey)) {
    console.error('[Config] REJEITADO: Tentativa de configurar chave service_role! Utilize apenas a anon key.');
    return false;
  }

  if (!isValidSupabaseAnonKey(supabaseAnonKey)) {
    console.error('[Config] Chave Anon do Supabase inválida.');
    return false;
  }

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, supabaseUrl.trim());
      localStorage.setItem(STORAGE_KEYS.SUPABASE_ANON_KEY, supabaseAnonKey.trim());

      // Notifica componentes e o cliente Supabase sobre a nova configuração
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('v4_cloud_config_updated', {
          detail: getConfig()
        }));
      }

      return true;
    } catch (e) {
      console.error('[Config] Falha ao gravar no localStorage:', e);
      return false;
    }
  }

  return false;
}

/**
 * Remove credenciais do Supabase do localStorage
 */
export function clearConfig() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_ANON_KEY);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('v4_cloud_config_updated', {
          detail: getConfig()
        }));
      }
    } catch (e) {
      console.warn('[Config] Erro ao limpar credenciais:', e);
    }
  }
}

// ============================================================================
// 5. MODO OFFLINE / HOSPITALAR E MODO CONVIDADA
// ============================================================================

/**
 * Verifica se a aplicação está em modo offline/local forçado
 * @returns {boolean}
 */
export function isOfflineMode() {
  if (typeof localStorage === 'undefined') return false;
  try {
    const isOffline = localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE) === 'true';
    const isOfflineLegacy = STORAGE_KEYS.OFFLINE_MODE_LEGACY ? localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE_LEGACY) === 'true' : false;
    const isGuest = isGuestMode();
    return isOffline || isOfflineLegacy || isGuest;
  } catch {
    return false;
  }
}

/**
 * Ativa ou desativa o modo offline forçado
 * @param {boolean} enabled 
 */
export function setOfflineMode(enabled) {
  if (typeof localStorage !== 'undefined') {
    try {
      const valStr = String(Boolean(enabled));
      localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, valStr);
      if (STORAGE_KEYS.OFFLINE_MODE_LEGACY) {
        localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE_LEGACY, valStr);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('v4_cloud_offline_mode_changed', {
          detail: { isOffline: Boolean(enabled) }
        }));
      }
    } catch (e) {
      console.warn('[Config] Erro ao definir modo offline:', e);
    }
  }
}

/**
 * Verifica se a médica ingressou via "Modo Convidada / Local" (sem login).
 * Checa a chave canônica 'nanda_v4_guest_mode' e o fallback 'v4_cloud_guest_mode'.
 * @returns {boolean}
 */
export function isGuestMode() {
  if (typeof localStorage === 'undefined') return false;
  try {
    const canonical = localStorage.getItem(STORAGE_KEYS.GUEST_MODE) === 'true';
    const legacy = localStorage.getItem(STORAGE_KEYS.GUEST_MODE_LEGACY) === 'true';
    return canonical || legacy;
  } catch {
    return false;
  }
}

/**
 * Define o status do Modo Convidada / Local.
 * Persiste 'nanda_v4_guest_mode' = 'true' e sincroniza chave legado para compatibilidade.
 * Ativa automaticamente o modo offline para suspender requisições remotas desnecessárias.
 * 
 * @param {boolean} enabled 
 */
export function setGuestMode(enabled) {
  if (typeof localStorage !== 'undefined') {
    try {
      const valStr = String(Boolean(enabled));
      // Gravação dupla para robustez total
      localStorage.setItem(STORAGE_KEYS.GUEST_MODE, valStr);
      localStorage.setItem(STORAGE_KEYS.GUEST_MODE_LEGACY, valStr);

      if (enabled) {
        setOfflineMode(true);
      } else {
        setOfflineMode(false);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('v4_cloud_guest_mode_changed', {
          detail: { isGuest: Boolean(enabled) }
        }));
      }
    } catch (e) {
      console.warn('[Config] Erro ao definir modo convidada:', e);
    }
  }
}

// ============================================================================
// 6. TESTE DE CONECTIVIDADE E ALCANCE (REACHABILITY PROBE)
// ============================================================================

/**
 * Testa o alcance do endpoint Supabase sem persistir credenciais.
 * Verifica formatação, bloqueia service_role e realiza ping REST.
 * 
 * @param {string} url - URL do projeto Supabase
 * @param {string} anonKey - Chave Pública Anon
 * @param {number} [timeoutMs=6000] - Timeout em milissegundos
 * @returns {Promise<{ ok: boolean, status?: number, latencyMs?: number, message: string, isServiceRole?: boolean }>}
 */
export async function testSupabaseReachability(url, anonKey, timeoutMs = 6000) {
  // 1. Validação de formato da URL
  if (!isValidSupabaseUrl(url)) {
    return {
      ok: false,
      message: 'URL inválida. Deve iniciar com https:// e apontar para um domínio Supabase plausível.'
    };
  }

  // 2. Barreira de segurança para service_role
  if (isServiceRoleKey(anonKey)) {
    return {
      ok: false,
      isServiceRole: true,
      message: 'Chave service_role detectada! Esta é uma chave de administração confidencial e seu uso no aplicativo é estritamente proibido.'
    };
  }

  // 3. Validação de formato da Anon Key
  if (!isValidSupabaseAnonKey(anonKey)) {
    return {
      ok: false,
      message: 'Chave Anon pública inválida ou malformada (mínimo de 20 caracteres).'
    };
  }

  // 4. Verificação de ambiente com fetch
  if (typeof fetch !== 'function') {
    return {
      ok: true,
      message: 'Credenciais válidas sintaticamente (ambiente sem fetch nativo).'
    };
  }

  // 5. Teste de alcance de rede via REST OpenAPI Ping
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const targetEndpoint = `${cleanUrl}/rest/v1/`;

  const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  const start = (typeof performance !== 'undefined') ? performance.now() : Date.now();

  try {
    const response = await fetch(targetEndpoint, {
      method: 'GET',
      headers: {
        'apikey': anonKey.trim(),
        'Authorization': `Bearer ${anonKey.trim()}`
      },
      signal: controller?.signal
    });

    if (timeoutId) clearTimeout(timeoutId);
    const end = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const latencyMs = Math.round(end - start);

    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        latencyMs,
        message: `Conexão estabelecida com sucesso! Servidor Supabase online (${latencyMs}ms).`
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        status: response.status,
        latencyMs,
        message: 'Servidor Supabase alcançado, mas a chave Anon informada não foi autorizada (erro 401/403).'
      };
    }

    return {
      ok: false,
      status: response.status,
      latencyMs,
      message: `Servidor retornou status HTTP inesperado: ${response.status}.`
    };
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    
    const isAbort = error.name === 'AbortError' || error.message?.includes('aborted');
    if (isAbort) {
      return {
        ok: false,
        message: `Tempo limite de conexão excedido (${timeoutMs / 1000}s). Verifique sua internet hospitalar.`
      };
    }

    return {
      ok: false,
      message: 'Não foi possível alcançar o servidor Supabase. Verifique a URL e a conectividade com a internet.'
    };
  }
}

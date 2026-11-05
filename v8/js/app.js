/**
 * Finanças Pediatria /v8/ - Bootstrap Modular Standalone
 * 100% Offline • Sem Dependências de Nuvem • Abertura Instantânea em 0ms
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { APP_CREATOR, APP_VERSION, PediatricStore } from './store.js';
import { PediatricStorage } from './storage.js';
import { PediatricUI } from './ui.js';

export { APP_CREATOR, APP_VERSION };

export class PediatricApp {
  constructor() {
    this.creator = APP_CREATOR;
    this.version = APP_VERSION;
    this.storage = new PediatricStorage();
    this.store = new PediatricStore(this.storage);
    this.ui = null;
  }

  async start() {
    // 1. Carregamento síncrono instantâneo (0ms de rede)
    const cachedState = this.storage.loadSync();
    if (cachedState) {
      this.store.init(cachedState);
    } else {
      this.store.init();
    }

    // 2. Inicialização da Interface
    this.ui = new PediatricUI(this.store, this.storage);
    this.store.subscribe(() => this.ui.render());
    this.ui.init();

    // 3. Aplica tema salvo
    const theme = this.store.data.preferences?.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    // 4. Listeners de ciclo de vida do iOS WebKit para persistência infalível
    window.addEventListener('pagehide', () => {
      this.store.save();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.store.save();
      }
    });

    // 5. Reconciliação assíncrona em segundo plano e blindagem de cota
    try {
      this.storage.requestPersistence();

      // Se o localStorage estava vazio (ex: Safari limpou cache após 7 dias), recupera do IndexedDB
      if (!cachedState) {
        const idbState = await this.storage.loadAsync();
        if (idbState && (idbState.shifts?.length > 0 || idbState.expenses?.length > 0)) {
          this.store.init(idbState);
          this.store.save();
          this.ui.render();
          console.log('[PediatricApp] Estado recuperado com sucesso do IndexedDB durável.');
        }
      }
    } catch (err) {
      console.warn('[PediatricApp] Erro na reconciliação assíncrona:', err);
    }

    // 6. Registro de Service Worker para PWA Offline (em conformidade com CSP estrita sem scripts inline)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      try {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.debug('[ServiceWorker] Registro offline:', err?.message || err);
        });
      } catch (swErr) {
        // Ignora erros de registro em ambientes sem suporte
      }
    }

    // Registra instância global para diagnósticos e testes de integração
    if (typeof window !== 'undefined') {
      window.v8App = this;
    }

    return this;
  }
}

// Inicialização automática quando carregado no navegador
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const app = new PediatricApp();
      app.start();
    });
  } else {
    const app = new PediatricApp();
    app.start();
  }
}

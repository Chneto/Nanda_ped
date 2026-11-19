/**
 * Finanças Pediatria /v8/ - Bootstrap Modular Standalone
 * 100% Offline • Sem Dependências de Nuvem • Abertura Instantânea em 0ms
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { APP_CREATOR, APP_VERSION, PediatricStore } from './store.js';
import { PediatricStorage, isBackupStale } from './storage.js';
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

      // Recupera do IndexedDB se o localStorage estava vazio (Safari purgou) OU se o IndexedDB
      // tem dados mais recentes que o localStorage (purga parcial / gravação interrompida)
      const idbState = await this.storage.loadAsync();
      const idbTime = Date.parse(idbState?.lastUpdated || '') || 0;
      const lsTime = Date.parse(cachedState?.lastUpdated || '') || 0;
      const idbHasData = idbState && (idbState.shifts?.length > 0 || idbState.expenses?.length > 0);
      if (idbHasData && (!cachedState || idbTime > lsTime)) {
        this.store.init(idbState);
        this.store.save();
        this.ui.render();
        console.log('[PediatricApp] Estado recuperado com sucesso do IndexedDB durável.');
      }
    } catch (err) {
      console.warn('[PediatricApp] Erro na reconciliação assíncrona:', err);
    }

    // 5b. Lembrete discreto de backup (Safari pode purgar dados locais)
    try {
      if (isBackupStale(this.store.data)) {
        this.ui.showToast('Faz tempo sem backup. Menu → Salvar no iPhone protege seus dados.');
      }
    } catch (e) { /* lembrete é opcional */ }

    // 6. Registro de Service Worker para PWA Offline (em conformidade com CSP estrita sem scripts inline)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      try {
        // Aviso de nova versão: só quando já havia um SW controlando (não na 1ª instalação)
        const hadController = Boolean(navigator.serviceWorker.controller);
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (hadController) {
            this.ui.showToast('Nova versão instalada. Feche e reabra o app para atualizar.');
          }
        });
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

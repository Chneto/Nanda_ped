/**
 * Finanças Pediatria V4_Cloud - Aplicação Principal (SPA Bootstrap & Lifecycle)
 * Design System: "Silk & Rose Gold" para Dra. Fernanda Ch.
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 * 
 * Invariantes & Responsabilidades:
 * 1. Inicialização e orquestração do Store, UI Controller, Supabase Auth e Sync Engine.
 * 2. Roteamento Silk Gate vs App Shell:
 *    - Se autenticado ou em Modo Convidada -> Exibe App Shell, oculta Silk Gate.
 *    - Se deslogado -> Exibe Silk Gate, oculta App Shell.
 * 3. Integração com Google OAuth 1-toque e Magic Link sem senha.
 * 4. Exportação em 1 toque ("Salvar no Meu iPhone") via Web Share API nativa com fallback.
 * 5. Restauração de backup JSON com validação de autoria FChNeto.
 * 6. Proteção de ciclo de vida do iOS WebKit (visibilitychange, pagehide).
 * 7. Registro resiliente do Service Worker PWA.
 */

export const APP_CREATOR = 'FChNeto';
export const APP_VERSION = '4.0.0';

import {
  getConfig,
  saveConfig,
  clearConfig,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  isOfflineMode,
  setOfflineMode,
  isGuestMode,
  setGuestMode,
  testSupabaseReachability,
  isValidSupabaseUrl,
  isValidSupabaseAnonKey,
  isServiceRoleKey
} from './config.js';

import { PediatricStore, getLocalDateString } from './store.js';
import { PediatricUI } from './ui.js';

import {
  initSupabase,
  getSupabase,
  signInWithGoogle,
  signInWithMagicLink,
  signOut,
  getSession,
  onAuthStateChange
} from './supabaseClient.js';

import {
  syncNow,
  startAutoSync,
  stopAutoSync,
  onSyncStatusChange
} from './sync.js';

// ============================================================================
// CLASSE PRINCIPAL: PediatricApp
// ============================================================================

export class PediatricApp {
  constructor() {
    this.store = new PediatricStore();
    this.ui = new PediatricUI(this.store);
    this.currentSession = null;
    this.isInitialized = false;

    if (typeof window !== 'undefined') {
      window.v4App = this;
    }
  }

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Inicializa o cliente Supabase com credenciais ativas (se houver)
    const config = getConfig();
    if (config.isConfigured) {
      initSupabase(config.supabaseUrl, config.supabaseAnonKey);
    } else {
      initSupabase(); // Inicializa fallback degradado offline
    }

    // 2. Escuta mudanças no estado de autenticação do Supabase
    onAuthStateChange(async (event, session) => {
      this.currentSession = session;
      this.routeAuthView(session);

      if (session && session.user) {
        const meta = session.user.user_metadata || {};
        if (meta.full_name || meta.name) {
          this.store.data.doctorName = meta.full_name || meta.name;
        }
        if (meta.avatar_url && !this.store.data.doctorPhoto) {
          this.store.data.doctorPhoto = meta.avatar_url;
        }
        this.store.save();
        this.ui.render();
      }
    });

    // 3. Verifica sessão atual ou se usuário ativou Modo Convidada / Local
    try {
      const session = await getSession();
      this.currentSession = session;
      this.routeAuthView(session);
    } catch {
      this.routeAuthView(null);
    }

    // 4. Vincula eventos DOM de autenticação, navegação e modais
    this.bindSilkGateEvents();
    this.bindAppHeaderAndDrawerEvents();
    this.bindMonthNavigationEvents();
    this.bindCloudConfigEvents();
    this.bindNetworkAndSyncEvents();
    this.bindWebKitLifecycleEvents();

    // 5. Inicia motor de sincronização automática se estiver online
    startAutoSync(60000);

    // 6. Atualiza badge de sincronização inicial
    if (isGuestMode()) {
      this.ui.updateSyncBadge('guest');
    } else if (isOfflineMode()) {
      this.ui.updateSyncBadge('offline');
    } else {
      this.ui.updateSyncBadge('idle');
    }

    // 7. Renderiza dados iniciais na interface
    this.ui.render();

    // 8. Registra o Service Worker para cache PWA offline
    this.registerServiceWorker();
  }

  routeAuthView(session) {
    const silkGate = document.getElementById('silk-gate-screen');
    const appShell = document.getElementById('main-app-screen');
    const isGuest = isGuestMode();

    if (session || isGuest) {
      if (silkGate) silkGate.classList.add('hidden');
      if (appShell) appShell.classList.remove('hidden');

      if (isGuest) {
        this.ui.updateSyncBadge('guest');
      }
    } else {
      if (silkGate) silkGate.classList.remove('hidden');
      if (appShell) appShell.classList.add('hidden');
    }
  }

  bindSilkGateEvents() {
    const btnGoogle = document.getElementById('btn-google-auth');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', async () => {
        const label = document.getElementById('label-google-auth');
        if (label) label.textContent = 'Conectando ao Google...';

        try {
          const { error } = await signInWithGoogle();
          if (error) {
            this.ui.showToast(`Falha no login com Google: ${error.message}`, 'error');
            if (label) label.textContent = 'Entrar com Google';
            if (error.isNotConfigured) {
              this.openCloudConfigModal();
            }
          }
        } catch (err) {
          this.ui.showToast('Erro inesperado ao conectar ao Google.', 'error');
          if (label) label.textContent = 'Entrar com Google';
        }
      });
    }

    const formMagic = document.getElementById('form-magic-link');
    if (formMagic) {
      formMagic.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('input-magic-email');
        const feedback = document.getElementById('magic-link-feedback');
        const label = document.getElementById('label-magic-link');
        const email = emailInput?.value?.trim();

        if (!email || !email.includes('@')) {
          if (feedback) {
            feedback.textContent = 'Por favor, insira um e-mail válido.';
            feedback.className = 'silk-feedback-message error';
            feedback.classList.remove('hidden');
          }
          return;
        }

        if (label) label.textContent = 'Enviando...';

        try {
          const { error } = await signInWithMagicLink(email);
          if (error) {
            if (feedback) {
              feedback.textContent = `Erro ao enviar link: ${error.message}`;
              feedback.className = 'silk-feedback-message error';
              feedback.classList.remove('hidden');
            }
            if (label) label.textContent = 'Enviar Link Mágico';
            if (error.isNotConfigured) {
              this.openCloudConfigModal();
            }
          } else {
            if (feedback) {
              feedback.textContent = '✨ Link mágico enviado com sucesso! Verifique sua caixa de entrada.';
              feedback.className = 'silk-feedback-message success';
              feedback.classList.remove('hidden');
            }
            if (label) label.textContent = 'Link Enviado!';
            this.ui.showToast('Link de acesso sem senha enviado! 💌', 'success');
          }
        } catch (err) {
          if (feedback) {
            feedback.textContent = 'Erro ao processar solicitação de link mágico.';
            feedback.className = 'silk-feedback-message error';
            feedback.classList.remove('hidden');
          }
          if (label) label.textContent = 'Enviar Link Mágico';
        }
      });
    }

    const btnEnterDirect = document.getElementById('btn-enter-direct');
    if (btnEnterDirect) {
      btnEnterDirect.addEventListener('click', () => {
        setGuestMode(true);
        this.routeAuthView(null);
        this.ui.showToast('Bem-vinda, Dra. Fernanda! Santuário financeiro ativo. 🩺🌸', 'success');
        this.ui.render();
        try {
          syncNow().catch(e => console.log('[Sync Background]', e.message));
        } catch (e) {}
      });
    }

    const btnGuest = document.getElementById('btn-guest-mode');
    if (btnGuest) {
      btnGuest.addEventListener('click', () => {
        setGuestMode(true);
        this.routeAuthView(null);
        this.ui.showToast('Bem-vinda, Dra. Fernanda! Modo Hospital ativo. 🩺🌸', 'success');
        this.ui.render();
      });
    }

    const btnGear = document.getElementById('btn-gate-gear');
    const btnOpenConfig = document.getElementById('btn-open-cloud-config');
    [btnGear, btnOpenConfig].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.openCloudConfigModal();
        });
      }
    });
  }

  bindAppHeaderAndDrawerEvents() {
    const btnMenu = document.getElementById('btn-header-menu');
    const drawer = document.getElementById('drawer-menu');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');

    if (btnMenu && drawer) {
      btnMenu.addEventListener('click', () => {
        drawer.classList.remove('hidden');
      });
    }

    if (btnCloseDrawer && drawer) {
      btnCloseDrawer.addEventListener('click', () => {
        drawer.classList.add('hidden');
      });
    }

    if (drawer) {
      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) {
          drawer.classList.add('hidden');
        }
      });
    }

    const btnProfile = document.getElementById('btn-header-profile');
    if (btnProfile) {
      btnProfile.addEventListener('click', () => {
        this.ui.openModal('#modal-doctor-profile');
      });
    }

    const btnHeaderConfig = document.getElementById('btn-header-config');
    if (btnHeaderConfig) {
      btnHeaderConfig.addEventListener('click', () => {
        this.openCloudConfigModal();
      });
    }

    const itemProfile = document.getElementById('drawer-item-profile');
    if (itemProfile) {
      itemProfile.addEventListener('click', () => {
        if (drawer) drawer.classList.add('hidden');
        this.ui.openModal('#modal-doctor-profile');
      });
    }

    const itemCategories = document.getElementById('drawer-item-categories');
    if (itemCategories) {
      itemCategories.addEventListener('click', () => {
        if (drawer) drawer.classList.add('hidden');
        this.ui.openModal('#modal-categories');
      });
    }

    const itemHub = document.getElementById('drawer-item-hub');
    if (itemHub) {
      itemHub.addEventListener('click', () => {
        if (drawer) drawer.classList.add('hidden');
        this.ui.openModal('#modal-hub');
      });
    }

    const itemSync = document.getElementById('drawer-item-sync');
    if (itemSync) {
      itemSync.addEventListener('click', async () => {
        if (drawer) drawer.classList.add('hidden');
        this.ui.showToast('Sincronizando com a nuvem...', 'info');
        try {
          const res = await syncNow();
          this.ui.showToast(`Sincronização concluída! (${res.pushed || 0} enviados, ${res.pulled || 0} recebidos) ✨`, 'success');
          this.ui.render();
        } catch (err) {
          this.ui.showToast('Falha na sincronização. Tentaremos novamente em breve.', 'warning');
        }
      });
    }

    const itemCloud = document.getElementById('drawer-item-cloud');
    if (itemCloud) {
      itemCloud.addEventListener('click', () => {
        if (drawer) drawer.classList.add('hidden');
        this.openCloudConfigModal();
      });
    }

    const itemTheme = document.getElementById('drawer-item-theme');
    if (itemTheme) {
      itemTheme.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    const itemBackup = document.getElementById('drawer-item-backup');
    if (itemBackup) {
      itemBackup.addEventListener('click', () => {
        if (drawer) drawer.classList.add('hidden');
        this.exportBackupToPhone();
      });
    }

    const itemRestore = document.getElementById('drawer-item-restore');
    if (itemRestore) {
      itemRestore.addEventListener('click', () => {
        if (drawer) drawer.classList.add('hidden');
        this.triggerRestoreBackup();
      });
    }

    const itemReset = document.getElementById('drawer-item-reset');
    if (itemReset) {
      itemReset.addEventListener('click', () => {
        if (drawer) drawer.classList.add('hidden');
        this.handleTwoStageDataReset();
      });
    }

    const itemSignout = document.getElementById('drawer-item-signout');
    if (itemSignout) {
      itemSignout.addEventListener('click', async () => {
        if (drawer) drawer.classList.add('hidden');
        await signOut();
        setGuestMode(false);
        this.routeAuthView(null);
        this.ui.showToast('Sessão encerrada com sucesso.', 'info');
      });
    }
  }

  bindMonthNavigationEvents() {
    const btnPrev = document.getElementById('btn-prev-month');
    const btnNext = document.getElementById('btn-next-month');
    const regimePill = document.getElementById('current-regime-pill');

    if (btnPrev) {
      btnPrev.addEventListener('click', () => this.navigateMonth(-1));
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => this.navigateMonth(1));
    }

    if (regimePill) {
      regimePill.addEventListener('click', () => {
        const cur = this.store.data.preferences.regime || 'caixa';
        const next = cur === 'caixa' ? 'competencia' : 'caixa';
        this.store.data.preferences.regime = next;
        this.store.save();
        this.ui.showToast(`Modo alterado para ${next === 'caixa' ? 'Regime de Caixa' : 'Regime de Competência'}.`, 'info');
        this.ui.render();
      });
    }

    const btnQuickShift = document.getElementById('btn-quick-add-shift');
    if (btnQuickShift) {
      btnQuickShift.addEventListener('click', () => {
        this.ui.openModal('#modal-shift');
      });
    }

    const btnQuickExpense = document.getElementById('btn-quick-add-expense');
    if (btnQuickExpense) {
      btnQuickExpense.addEventListener('click', () => {
        this.ui.openModal('#modal-expense');
      });
    }

    const regimeButtons = document.querySelectorAll('.regime-btn[data-regime], [data-regime]');
    if (regimeButtons && regimeButtons.forEach) {
      regimeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetRegime = btn.getAttribute('data-regime');
          if (targetRegime && ['caixa', 'competencia'].includes(targetRegime)) {
            this.store.data.preferences.regime = targetRegime;
            this.store.save();
            this.ui.showToast(`Modo alterado para ${targetRegime === 'caixa' ? 'Regime de Caixa' : 'Regime de Competência'}.`, 'info');
            this.ui.render();
          }
        });
      });
    }
  }

  navigateMonth(delta) {
    const cur = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const parts = cur.split('-');
    let y = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10) - 1 + delta;
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    const newMonth = `${y}-${String(m + 1).padStart(2, '0')}`;
    this.store.data.preferences.activeMonth = newMonth;
    this.store.save();
    this.ui.render();
  }

  openCloudConfigModal() {
    const config = getConfig();
    const urlInput = document.getElementById('input-supabase-url');
    const anonInput = document.getElementById('input-supabase-anon');
    const feedback = document.getElementById('cloud-test-feedback');

    if (urlInput) urlInput.value = config.supabaseUrl || DEFAULT_SUPABASE_URL || '';
    if (anonInput) anonInput.value = config.supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY || '';
    if (feedback) feedback.classList.add('hidden');

    this.ui.openModal('#modal-cloud-config');
  }

  bindCloudConfigEvents() {
    const btnReveal = document.getElementById('btn-toggle-anon-visibility');
    const anonInput = document.getElementById('input-supabase-anon');
    const iconOpen = document.getElementById('eye-icon-open');
    const iconClosed = document.getElementById('eye-icon-closed');

    if (btnReveal && anonInput) {
      btnReveal.addEventListener('click', () => {
        const isPassword = anonInput.type === 'password';
        anonInput.type = isPassword ? 'text' : 'password';
        if (iconOpen) iconOpen.classList.toggle('hidden', !isPassword);
        if (iconClosed) iconClosed.classList.toggle('hidden', isPassword);
      });
    }

    const btnTest = document.getElementById('btn-test-connection');
    if (btnTest) {
      btnTest.addEventListener('click', async () => {
        const url = document.getElementById('input-supabase-url')?.value?.trim();
        const key = document.getElementById('input-supabase-anon')?.value?.trim();
        const feedback = document.getElementById('cloud-test-feedback');
        const textContent = document.getElementById('feedback-text-content');

        if (!isValidSupabaseUrl(url) || !isValidSupabaseAnonKey(key)) {
          if (feedback && textContent) {
            feedback.className = 'silk-feedback-box feedback-error';
            textContent.textContent = 'URL ou chave Anon com formato inválido.';
            feedback.classList.remove('hidden');
          }
          return;
        }

        if (isServiceRoleKey(key)) {
          if (feedback && textContent) {
            feedback.className = 'silk-feedback-box feedback-error';
            textContent.textContent = '❌ REJEITADO: Chave de serviço (service_role) detectada! Use apenas a chave anon.';
            feedback.classList.remove('hidden');
          }
          return;
        }

        if (feedback && textContent) {
          feedback.className = 'silk-feedback-box';
          textContent.textContent = 'Testando resposta do servidor Supabase...';
          feedback.classList.remove('hidden');
        }

        const res = await testSupabaseReachability(url, key);
        if (feedback && textContent) {
          if (res.reachable) {
            feedback.className = 'silk-feedback-box feedback-success';
            textContent.textContent = `✅ Servidor respondendo perfeitamente (${res.latencyMs}ms).`;
          } else {
            feedback.className = 'silk-feedback-box feedback-error';
            textContent.textContent = `⚠️ Não foi possível conectar: ${res.error || 'Verifique a URL e sua conexão de internet.'}`;
          }
        }
      });
    }

    const btnClear = document.getElementById('btn-clear-cloud-config');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        clearConfig();
        const urlInput = document.getElementById('input-supabase-url');
        const anonInput = document.getElementById('input-supabase-anon');
        if (urlInput) urlInput.value = '';
        if (anonInput) anonInput.value = '';
        this.ui.showToast('Credenciais removidas com sucesso.', 'info');
      });
    }

    const formConfig = document.getElementById('form-cloud-config');
    if (formConfig) {
      formConfig.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('input-supabase-url')?.value?.trim();
        const key = document.getElementById('input-supabase-anon')?.value?.trim();

        if (isServiceRoleKey(key)) {
          this.ui.showToast('Chave de serviço proibida no frontend. Use a chave anon.', 'error');
          return;
        }

        const success = saveConfig(url, key);
        if (success) {
          initSupabase(url, key);
          this.ui.closeModal('#modal-cloud-config');
          this.ui.showToast('Credenciais da nuvem gravadas com sucesso! ☁️✨', 'success');
          syncNow().catch(() => {});
        } else {
          this.ui.showToast('Não foi possível salvar as credenciais. Verifique os dados.', 'error');
        }
      });
    }
  }

  bindNetworkAndSyncEvents() {
    onSyncStatusChange((status, details) => {
      this.ui.updateSyncBadge(status, details);
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('online', async () => {
        this.ui.showToast('Conexão restabelecida! Sincronizando dados... 🌐', 'info');
        this.ui.updateSyncBadge('syncing');
        try {
          await syncNow();
          this.ui.updateSyncBadge('synced');
          this.ui.render();
        } catch {
          this.ui.updateSyncBadge('idle');
        }
      });

      window.addEventListener('offline', () => {
        this.ui.updateSyncBadge('offline');
        this.ui.showToast('Modo hospitalar offline ativado. Dados gravados localmente. 📡', 'warning');
      });
    }
  }

  bindWebKitLifecycleEvents() {
    const persistHandler = () => {
      this.store.save();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', persistHandler);
      window.addEventListener('beforeunload', persistHandler);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          persistHandler();
        }
      });
    }
  }

  async exportBackupToPhone() {
    const backupData = {
      creator: APP_CREATOR,
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      data: this.store.data
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const dateFormatted = getLocalDateString();
    const fileName = `financas_pediatria_backup_${dateFormatted}.json`;

    if (typeof navigator !== 'undefined' && navigator.canShare && typeof File !== 'undefined') {
      try {
        const file = new File([jsonString], fileName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Backup Finanças Pediatria',
            text: `Backup financeiro da Dra. Fernanda Ch. gerado em ${dateFormatted}.`,
            files: [file]
          });
          this.ui.showToast('Backup compartilhado com sucesso! 📱💾', 'success');
          return;
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[PediatricApp] Falha ao compartilhar via Web Share:', err);
        } else {
          return;
        }
      }
    }

    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.ui.showToast('Arquivo de backup salvo no aparelho! 💾✨', 'success');
    } catch (e) {
      this.ui.showToast('Erro ao exportar backup.', 'error');
    }
  }

  triggerRestoreBackup() {
    let fileInput = document.getElementById('backup-file-input');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'backup-file-input';
      fileInput.accept = '.json,application/json';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (!parsed || (parsed.creator && parsed.creator !== APP_CREATOR)) {
            this.ui.showToast('Arquivo de backup inválido ou incompatível.', 'error');
            return;
          }

          const restoredData = parsed.data || parsed;
          this.store.data = {
            ...this.store.data,
            ...restoredData,
            creator: APP_CREATOR
          };
          this.store.save();
          this.ui.showToast('Backup restaurado com sucesso! 🩺✨', 'success');
          this.ui.render();
        } catch {
          this.ui.showToast('Erro ao ler arquivo de backup JSON.', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    };

    fileInput.click();
  }

  handleTwoStageDataReset() {
    if (confirm('Atenção: Deseja realmente zerar todos os plantões e despesas cadastrados?')) {
      if (confirm('Confirmação final: Esta ação é irreversível. Deseja prosseguir com a limpeza?')) {
        this.store.data.shifts = [];
        this.store.data.expenses = [];
        this.store.save();
        this.ui.showToast('Dados de plantões e despesas reinicializados.', 'info');
        this.ui.render();
      }
    }
  }

  toggleTheme() {
    const htmlEl = document.documentElement;
    const curTheme = htmlEl.getAttribute('data-theme') || 'light';
    const nextTheme = curTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', nextTheme);
    this.store.data.preferences.theme = nextTheme;
    this.store.save();
    this.ui.showToast(nextTheme === 'dark' ? 'Modo Escuro ativado 🌙' : 'Modo Claro ativado ☀️', 'info');
  }

  registerServiceWorker() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.ui.showToast('Nova versão disponível. Atualize para ver novidades! 🌸', 'info', 5000);
                  }
                };
              }
            };
          })
          .catch((err) => console.warn('[PediatricApp] SW falha:', err));
      });
    }
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const app = new PediatricApp();
      app.init().catch(console.error);
    });
  } else {
    const app = new PediatricApp();
    app.init().catch(console.error);
  }
}
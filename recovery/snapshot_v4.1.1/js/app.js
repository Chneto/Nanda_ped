/**
 * Finanças Pediatria V4_Cloud - Aplicação Principal (SPA Bootstrap & Lifecycle)
 * Design System: "Silk & Rose Gold" para Médica
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
export const APP_VERSION = '4.1.1';

import {
  getConfig,
  loadRuntimeConfig,
  saveConfig,
  clearConfig,
  isOfflineMode,
  setOfflineMode,
  isGuestMode,
  setGuestMode,
  STORAGE_KEYS,
  testSupabaseReachability,
  isValidSupabaseUrl,
  isValidSupabaseAnonKey,
  isServiceRoleKey
} from './config.js';

import { PediatricStore, getLocalDateString } from './store.js';
import { PediatricUI } from './ui.js';
import { loadUserState, saveUserState } from './cloudState.js';

import {
  initSupabase,
  getSupabase,
  signInWithGoogle,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
  signOut,
  getSession,
  onAuthStateChange,
  processOAuthCallback
} from './supabaseClient.js';

// ============================================================================
// CLASSE PRINCIPAL: PediatricApp
// ============================================================================

export class PediatricApp {
  constructor() {
    this.store = new PediatricStore();
    this.ui = new PediatricUI(this.store);
    this.currentSession = null;
    this.isInitialized = false;
    this.cloudUserId = null;
    this.cloudRevision = null;
    this.cloudSaveTimer = null;
    this.isHydratingCloudState = false;
    this.store.subscribe(() => {
      if (!this.isHydratingCloudState && this.currentSession?.user?.id) this.scheduleCloudSave();
    });

    if (typeof window !== 'undefined') {
      window.v4App = this;
    }
  }

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Carrega configuração pública da Vercel antes de criar o cliente Supabase.
    await loadRuntimeConfig();
    const config = getConfig();
    if (config.isConfigured) {
      initSupabase(config.supabaseUrl, config.supabaseAnonKey);
    } else {
      initSupabase(); // Inicializa fallback degradado offline
    }

    // 2. Processa retorno de OAuth (PKCE code ou token) se presente na URL
    const hasOAuthInUrl = typeof window !== 'undefined' && (
      (window.location?.search && (window.location.search.includes('code=') || window.location.search.includes('error='))) ||
      (window.location?.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error=')))
    );

    if (hasOAuthInUrl) {
      const labelGoogle = document.getElementById('label-google-auth');
      if (labelGoogle) labelGoogle.textContent = 'Autenticando Médica... 🌸';
      try {
        const callbackResult = await processOAuthCallback();
        if (callbackResult?.session) {
          this.currentSession = callbackResult.session;
          this.ui.showToast('Login com Google realizado com sucesso! Bem-vinda, Médica! 🩺🌸', 'success');
        } else if (callbackResult?.error) {
          this.ui.showToast(`Aviso de autenticação: ${callbackResult.error.message}`, 'warning', 6000);
        }
      } catch (e) {
        console.warn('[App] Erro ao processar retorno OAuth:', e);
      } finally {
        if (labelGoogle) labelGoogle.textContent = 'Entrar com Google';
      }
    }

    // 3. Escuta mudanças no estado de autenticação do Supabase
    onAuthStateChange((event, session) => {
      return this.handleAuthSession(session);
    });

    // 4. Verifica sessão atual ou se usuário ativou Modo Convidada / Local
    try {
      const session = this.currentSession || await getSession();
      await this.handleAuthSession(session);
    } catch {
      await this.handleAuthSession(null);
    }

    // 4. Vincula eventos DOM de autenticação, navegação e modais
    this.bindSilkGateEvents();
    this.bindAppHeaderAndDrawerEvents();
    this.bindMonthNavigationEvents();
    this.bindCloudConfigEvents();
    this.bindNetworkAndSyncEvents();
    this.bindWebKitLifecycleEvents();

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

  async handleAuthSession(session) {
    const userId = session?.user?.id || null;
    this.currentSession = session || null;

    if (!userId) {
      if (this.cloudUserId) {
        this.isHydratingCloudState = true;
        await this.store.switchUserScope(null);
        this.isHydratingCloudState = false;
      }
      this.cloudUserId = null;
      this.cloudRevision = null;
      this.routeAuthView(null);
      this.ui.render();
      return;
    }

    this.routeAuthView(session);
    if (this.cloudUserId === userId) return;

    this.isHydratingCloudState = true;
    this.cloudUserId = userId;
    try {
      let previouslyLinkedUser = null;
      try { previouslyLinkedUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLOUD_USER); } catch {}
      await this.store.switchUserScope(userId, { adoptCurrent: !previouslyLinkedUser });
      try { localStorage.setItem(STORAGE_KEYS.ACTIVE_CLOUD_USER, userId); } catch {}

      this.cloudRevision = null;
      const remote = await loadUserState(userId);
      const meta = session.user.user_metadata || {};
      if (!remote.state) {
        if (meta.full_name || meta.name) this.store.data.doctorName = meta.full_name || meta.name;
        if (meta.avatar_url && !this.store.data.doctorPhoto) this.store.data.doctorPhoto = meta.avatar_url;
        this.store.save();
      }

      if (remote.error) {
        this.ui.updateSyncBadge('error', { message: remote.error.message });
        this.ui.showToast('A sessão entrou, mas a nuvem não respondeu. Os dados ficam salvos neste aparelho e tentaremos novamente.', 'warning', 6500);
      } else if (remote.state) {
        this.store.replaceData(remote.state);
        this.cloudRevision = remote.revision;
      } else {
        const firstSnapshot = await saveUserState(userId, this.store.data, null);
        if (firstSnapshot.saved) {
          this.cloudRevision = firstSnapshot.revision;
        } else if (firstSnapshot.conflict && firstSnapshot.state) {
          this.store.replaceData(firstSnapshot.state);
          this.cloudRevision = firstSnapshot.revision;
        } else if (firstSnapshot.error) {
          this.ui.updateSyncBadge('error', { message: firstSnapshot.error.message });
          this.ui.showToast('Não foi possível preparar o espaço seguro na nuvem. Confira se a migração 004 foi aplicada no Supabase.', 'error', 7000);
        }
      }
      this.ui.updateSyncBadge(this.cloudRevision ? 'synced' : 'error');
      this.ui.render();
    } catch (error) {
      this.ui.updateSyncBadge('error', { message: error.message });
      this.ui.showToast('Não foi possível carregar os dados desta conta. Os dados locais continuam preservados.', 'error', 6500);
    } finally {
      this.isHydratingCloudState = false;
    }
  }

  scheduleCloudSave() {
    if (this.cloudSaveTimer) clearTimeout(this.cloudSaveTimer);
    this.cloudSaveTimer = setTimeout(() => {
      this.cloudSaveTimer = null;
      this.syncCloudNow();
    }, 700);
  }

  async syncCloudNow() {
    const userId = this.currentSession?.user?.id;
    if (!userId) return { saved: false, skipped: true };
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.ui.updateSyncBadge('offline');
      return { saved: false, offline: true };
    }

    this.ui.updateSyncBadge('syncing');
    const result = await saveUserState(userId, this.store.data, this.cloudRevision);
    if (result.saved) {
      this.cloudRevision = result.revision;
      this.ui.updateSyncBadge('synced');
      return result;
    }

    if (result.conflict) {
      this.ui.updateSyncBadge('error', { message: 'cloud_revision_conflict' });
      this.ui.showToast('Há dados mais recentes na nuvem de outro aparelho. Faça um backup antes de continuar a edição.', 'warning', 7000);
      return result;
    }

    this.ui.updateSyncBadge('error', { message: result.error?.message || 'cloud_save_failed' });
    return result;
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
    // -------------------------------------------------------------
    // 1. Alternância de Abas: Entrar vs. Cadastrar
    // -------------------------------------------------------------
    const tabBtnSignIn = document.getElementById('tab-btn-signin');
    const tabBtnSignUp = document.getElementById('tab-btn-signup');
    const groupAuthName = document.getElementById('group-auth-name');
    const labelPasswordSubmit = document.getElementById('label-password-submit');
    const passwordFeedback = document.getElementById('password-auth-feedback');
    const inputAuthPassword = document.getElementById('input-auth-password');
    let isSignUpMode = false;

    if (tabBtnSignIn && tabBtnSignUp) {
      tabBtnSignIn.addEventListener('click', () => {
        isSignUpMode = false;
        tabBtnSignIn.classList.add('active');
        tabBtnSignUp.classList.remove('active');
        if (groupAuthName) groupAuthName.classList.add('hidden');
        if (labelPasswordSubmit) labelPasswordSubmit.textContent = 'Entrar no Santuário';
        if (inputAuthPassword) inputAuthPassword.setAttribute('autocomplete', 'current-password');
        if (passwordFeedback) {
          passwordFeedback.classList.add('hidden');
          passwordFeedback.textContent = '';
        }
      });

      tabBtnSignUp.addEventListener('click', () => {
        isSignUpMode = true;
        tabBtnSignUp.classList.add('active');
        tabBtnSignIn.classList.remove('active');
        if (groupAuthName) groupAuthName.classList.remove('hidden');
        if (labelPasswordSubmit) labelPasswordSubmit.textContent = 'Criar Conta e Acessar';
        if (inputAuthPassword) inputAuthPassword.setAttribute('autocomplete', 'new-password');
        if (passwordFeedback) {
          passwordFeedback.classList.add('hidden');
          passwordFeedback.textContent = '';
        }
      });
    }

    // -------------------------------------------------------------
    // 2. Mostrar / Ocultar Senha (Eye Toggle)
    // -------------------------------------------------------------
    const btnTogglePassword = document.getElementById('btn-toggle-password-visibility');
    if (btnTogglePassword && inputAuthPassword) {
      btnTogglePassword.addEventListener('click', () => {
        const isPassword = inputAuthPassword.getAttribute('type') === 'password';
        inputAuthPassword.setAttribute('type', isPassword ? 'text' : 'password');
        btnTogglePassword.innerHTML = isPassword
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      });
    }

    // -------------------------------------------------------------
    // 3. Submissão do Formulário Direto E-mail e Senha
    // -------------------------------------------------------------
    const formPasswordAuth = document.getElementById('form-password-auth');
    if (formPasswordAuth) {
      formPasswordAuth.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('input-auth-email');
        const nameInput = document.getElementById('input-auth-name');
        const email = emailInput?.value?.trim();
        const password = inputAuthPassword?.value;
        const doctorName = nameInput?.value?.trim() || 'Médica';

        if (!email || !email.includes('@')) {
          if (passwordFeedback) {
            passwordFeedback.textContent = 'Por favor, insira um e-mail válido.';
            passwordFeedback.className = 'silk-feedback-message error';
            passwordFeedback.classList.remove('hidden');
          }
          return;
        }

        if (!password || password.length < 6) {
          if (passwordFeedback) {
            passwordFeedback.textContent = 'A senha deve conter no mínimo 6 caracteres.';
            passwordFeedback.className = 'silk-feedback-message error';
            passwordFeedback.classList.remove('hidden');
          }
          return;
        }

        if (labelPasswordSubmit) {
          labelPasswordSubmit.textContent = isSignUpMode ? 'Criando conta...' : 'Entrando...';
        }

        try {
          if (isSignUpMode) {
            // Fluxo de Cadastro Direto
            const { data, error } = await signUpWithPassword(email, password, doctorName);
            if (error) {
              let errorMsg = error.message;
              if (errorMsg.includes('User already registered') || errorMsg.includes('already registered')) {
                errorMsg = 'Este e-mail já está cadastrado! Clique na aba "Entrar" para acessar.';
              }
              if (passwordFeedback) {
                passwordFeedback.textContent = `Erro no cadastro: ${errorMsg}`;
                passwordFeedback.className = 'silk-feedback-message error';
                passwordFeedback.classList.remove('hidden');
              }
              if (labelPasswordSubmit) labelPasswordSubmit.textContent = 'Criar Conta e Acessar';
              this.ui.showToast(errorMsg, 'warning', 6000);
            } else {
              // Se sessão retornada diretamente (email confirmation desligado)
              if (data?.session) {
                await this.handleAuthSession(data.session);
                this.ui.showToast(`Bem-vinda, ${doctorName}! Conta criada com sucesso. 🩺🌸`, 'success');
                this.ui.render();
                try {
                  this.syncCloudNow().catch(e => console.log('[Sync Background]', e.message));
                } catch (e) {}
              } else {
                // Tenta login direto automático
                const loginRes = await signInWithPassword(email, password);
                if (loginRes?.data?.session) {
                  await this.handleAuthSession(loginRes.data.session);
                  this.ui.showToast(`Bem-vinda, ${doctorName}! Santuário financeiro ativo. 🩺🌸`, 'success');
                  this.ui.render();
                  try {
                    this.syncCloudNow().catch(e => console.log('[Sync Background]', e.message));
                  } catch (e) {}
                } else {
                  const confirmationRequired = /email not confirmed|email_not_confirmed|confirm/i.test(loginRes?.error?.message || '');
                  const message = confirmationRequired
                    ? 'Conta criada. Confirme seu e-mail pelo link enviado e depois entre com sua senha.'
                    : loginRes?.error
                      ? `Conta criada, mas o primeiro acesso falhou: ${loginRes.error.message}`
                      : 'Conta criada. Você já pode entrar com seu e-mail e senha.';
                  if (passwordFeedback) {
                    passwordFeedback.textContent = message;
                    passwordFeedback.className = 'silk-feedback-message success';
                    passwordFeedback.classList.remove('hidden');
                  }
                  if (labelPasswordSubmit) labelPasswordSubmit.textContent = 'Criar Conta e Acessar';
                  this.ui.showToast(message, confirmationRequired ? 'info' : (loginRes?.error ? 'warning' : 'success'), 6000);
                }
              }
            }
          } else {
            // Fluxo de Login com Senha
            const { data, error } = await signInWithPassword(email, password);
            if (error) {
              let errorMsg = error.message;
              if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('invalid_credentials')) {
                errorMsg = 'E-mail ou senha incorretos. Verifique suas credenciais.';
              }
              if (passwordFeedback) {
                passwordFeedback.textContent = `Falha no acesso: ${errorMsg}`;
                passwordFeedback.className = 'silk-feedback-message error';
                passwordFeedback.classList.remove('hidden');
              }
              if (labelPasswordSubmit) labelPasswordSubmit.textContent = 'Entrar no Santuário';
              this.ui.showToast(errorMsg, 'error', 5000);
              if (error.isNotConfigured) {
                this.openCloudConfigModal();
              }
            } else if (data?.session) {
              await this.handleAuthSession(data.session);
              this.ui.showToast('Bem-vinda de volta, Médica! 🩺🌸', 'success');
              this.ui.render();
              try {
                this.syncCloudNow().catch(e => console.log('[Sync Background]', e.message));
              } catch (e) {}
            }
          }
        } catch (err) {
          if (passwordFeedback) {
            passwordFeedback.textContent = 'Erro inesperado ao processar credenciais.';
            passwordFeedback.className = 'silk-feedback-message error';
            passwordFeedback.classList.remove('hidden');
          }
          if (labelPasswordSubmit) {
            labelPasswordSubmit.textContent = isSignUpMode ? 'Criar Conta e Acessar' : 'Entrar no Santuário';
          }
        }
      });
    }

    // -------------------------------------------------------------
    // 4. Conexão Google OAuth
    // -------------------------------------------------------------
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
      btnEnterDirect.addEventListener('click', async () => {
        setGuestMode(true);
        await this.handleAuthSession(null);
        this.ui.showToast('Bem-vinda, Médica! Santuário financeiro ativo. 🩺🌸', 'success');
        this.ui.render();
        try {
          this.syncCloudNow().catch(e => console.log('[Sync Background]', e.message));
        } catch (e) {}
      });
    }

    const btnGuest = document.getElementById('btn-guest-mode');
    if (btnGuest) {
      btnGuest.addEventListener('click', async () => {
        setGuestMode(true);
        await this.handleAuthSession(null);
        this.ui.showToast('Bem-vinda, Médica! Modo Hospital ativo. 🩺🌸', 'success');
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
          const res = await this.syncCloudNow();
          if (res.saved) this.ui.showToast('Dados sincronizados com segurança. ✨', 'success');
          else if (res.offline) this.ui.showToast('Sem conexão. As alterações continuam salvas neste aparelho.', 'warning');
          else if (res.error) this.ui.showToast('Não foi possível sincronizar. Verifique a conexão e a configuração do Supabase.', 'error');
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
        await this.handleAuthSession(null);
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

    if (urlInput) urlInput.value = config.supabaseUrl || '';
    if (anonInput) anonInput.value = config.supabaseAnonKey || '';
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
          this.syncCloudNow().catch(() => {});
        } else {
          this.ui.showToast('Não foi possível salvar as credenciais. Verifique os dados.', 'error');
        }
      });
    }
  }

  bindNetworkAndSyncEvents() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', async () => {
        this.ui.showToast('Conexão restabelecida! Sincronizando dados... 🌐', 'info');
        this.ui.updateSyncBadge('syncing');
        try {
          await this.syncCloudNow();
          this.ui.render();
        } catch {
          this.ui.updateSyncBadge('error');
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
            text: `Backup financeiro da Médica gerado em ${dateFormatted}.`,
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

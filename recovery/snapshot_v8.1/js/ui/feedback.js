/**
 * Finanças Pediatria /v8/ - UI: Toasts, backup, utilitários de modal e acessibilidade (foco)
 * Métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { escapeHtml, FOCUSABLE_SELECTOR, nextFocusIndex } from './helpers.js';

export class FeedbackMethods {
  // =========================================================================
  // TOASTS COM DESFAZER (UNDO)
  // =========================================================================

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-silk ${type}`;
    // Erros são anunciados imediatamente por leitores de tela; demais avisos de forma educada
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }


  showToastWithUndo(message, onUndo, duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-silk toast-undo';
    toast.innerHTML = `
      <div class="toast-content">
        <span>${escapeHtml(message)}</span>
        <button type="button" class="btn-toast-undo">Desfazer</button>
      </div>
      <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
    `;

    const undoBtn = toast.querySelector('.btn-toast-undo');
    let timer = null;

    const dismiss = () => {
      if (timer) clearTimeout(timer);
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 250);
    };

    undoBtn.addEventListener('click', () => {
      dismiss();
      if (typeof onUndo === 'function') onUndo();
    }, { once: true });

    timer = setTimeout(dismiss, duration);
    container.appendChild(toast);
  }


  // =========================================================================
  // BACKUP EXPORT & MODAL UTILITIES
  // =========================================================================

  async exportBackup() {
    const res = await this.storage.exportBackup(this.store.data);
    if (res.success) {
      this.store.data.preferences.lastBackupAt = new Date().toISOString();
      this.store.save();
      this.showToast(`Backup salvo com sucesso (${res.method === 'share' ? 'iCloud/Arquivos' : 'Download'})!`);
    } else {
      this.showToast(`Falha ao exportar: ${res.error}`, 'error');
    }
  }


  openModal(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (el.classList.contains('hidden')) {
      this._modalOpener = document.activeElement;
    }
    el.classList.remove('hidden');
    // Acessibilidade: leva o foco para dentro do diálogo (teclado/VoiceOver)
    const first = this._getFocusable(el)[0];
    if (first && typeof first.focus === 'function') {
      try { first.focus({ preventScroll: true }); } catch (e) { /* ignora */ }
    }
  }


  closeModal(selector) {
    const el = document.querySelector(selector);
    if (el) el.classList.add('hidden');
    this._settleConfirm(false);
    this._restoreFocus();
  }


  closeAllModals() {
    const open = document.querySelectorAll('.modal-backdrop:not(.hidden)').length;
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    this._settleConfirm(false);
    if (open) this._restoreFocus();
  }

  /**
   * Diálogo de confirmação acessível (Promise<boolean>). Esc, X e toque fora cancelam.
   * O foco inicial fica em "Cancelar" (ação segura).
   */
  confirmDialog({ badge = 'Confirmação', title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false }) {
    const modal = document.getElementById('modal-confirm');
    if (!modal) return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    this._settleConfirm(false);

    modal.querySelector('#modal-confirm-badge').textContent = badge;
    modal.querySelector('#modal-confirm-title').textContent = title;
    const body = modal.querySelector('#modal-confirm-body');
    body.innerHTML = `
      <p class="confirm-message">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      <div class="modal-actions-row">
        <button type="button" class="btn-silk-secondary" data-confirm="cancel">${escapeHtml(cancelLabel)}</button>
        <button type="button" class="btn-silk-primary${danger ? ' btn-danger' : ''}" data-confirm="ok">${escapeHtml(confirmLabel)}</button>
      </div>`;

    return new Promise((resolve) => {
      this._confirmResolve = resolve;
      body.onclick = (e) => {
        const btn = e.target.closest('[data-confirm]');
        if (!btn) return;
        const ok = btn.getAttribute('data-confirm') === 'ok';
        this._settleConfirm(ok);
        this.closeAllModals();
      };
      this.openModal('#modal-confirm');
    });
  }

  _settleConfirm(result) {
    const resolve = this._confirmResolve;
    this._confirmResolve = null;
    if (typeof resolve === 'function') resolve(result);
  }


  _getFocusable(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
      .filter(n => !n.hasAttribute('disabled') && n.offsetParent !== null);
  }


  _restoreFocus() {
    const opener = this._modalOpener;
    this._modalOpener = null;
    if (opener && typeof opener.focus === 'function' && document.contains(opener)) {
      try { opener.focus({ preventScroll: true }); } catch (e) { /* ignora */ }
    }
  }

  _trapTab(e) {
    const modal = document.querySelector('.modal-backdrop:not(.hidden)');
    if (!modal) return;
    const items = this._getFocusable(modal);
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement);
    const next = nextFocusIndex(items.length, idx, e.shiftKey);
    if (next !== null) {
      e.preventDefault();
      items[next].focus();
    }
  }
}

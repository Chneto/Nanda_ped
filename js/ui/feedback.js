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
    this._restoreFocus();
  }


  closeAllModals() {
    const open = document.querySelectorAll('.modal-backdrop:not(.hidden)').length;
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    if (open) this._restoreFocus();
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

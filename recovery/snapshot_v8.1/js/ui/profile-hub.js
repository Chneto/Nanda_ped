/**
 * Finanças Pediatria /v8/ - UI: Perfil, Hub de gráficos, reset, gaveta e tema
 * Métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { formatCurrency, getLocalDateString } from '../store.js';
import { escapeHtml } from './helpers.js';

export class ProfileHubMethods {
  // =========================================================================
  // MODAL DE PERFIL MÉDICO
  // =========================================================================

  openProfileModal() {
    this.closeAllModals();
    const modal = document.getElementById('modal-profile');
    if (!modal) return;

    const form = document.getElementById('form-profile');
    if (!form) return;

    const p = this.store.getProfile();

    form.innerHTML = `
      <div class="form-group">
        <label for="prof-name">Nome da Médica</label>
        <input type="text" id="prof-name" name="doctorName" class="form-input silk-input" value="${escapeHtml(p.doctorName)}" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="prof-role">Especialidade / Ano</label>
          <input type="text" id="prof-role" name="doctorRole" class="form-input silk-input" value="${escapeHtml(p.doctorRole)}" />
        </div>
        <div class="form-group">
          <label for="prof-crm">CRM</label>
          <input type="text" id="prof-crm" name="doctorCrm" class="form-input silk-input" value="${escapeHtml(p.doctorCrm)}" placeholder="Ex: 12345/RN" />
        </div>
      </div>

      <div class="form-group">
        <label for="prof-salary">Bolsa Residência Fixa (R$ / mês)</label>
        <input type="number" inputmode="decimal" id="prof-salary" name="salaryValue" class="form-input silk-input" step="0.01" min="0" value="${p.residencySalary?.value || 0}" />
      </div>

      <div class="form-group">
        <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer;">
          <input type="checkbox" name="salaryActive" ${p.residencySalary?.active ? 'checked' : ''} />
          <span>Ativar recebimento mensal da Bolsa no dia 5</span>
        </label>
      </div>

      <div class="form-group">
        <label for="prof-photo-file">Foto de Perfil (Compactada no Aparelho)</label>
        <input type="file" id="prof-photo-file" accept="image/*" class="form-input silk-input" />
      </div>

      <div class="modal-actions-row">
        <button type="button" class="btn-silk-secondary" data-close-modal="#modal-profile">Cancelar</button>
        <button type="submit" class="btn-silk-primary">Salvar Perfil</button>
      </div>
    `;

    // Listener para foto com compressão Canvas < 25KB
    const photoInput = form.querySelector('#prof-photo-file');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 150;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            this.tempPhoto = compressed;
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    modal.classList.remove('hidden');
  }


  handleSaveProfile(form) {
    const doctorName = form.doctorName.value;
    const doctorRole = form.doctorRole.value;
    const doctorCrm = form.doctorCrm.value;
    const salaryVal = parseFloat(form.salaryValue.value) || 0;
    const salaryActive = form.salaryActive.checked;

    const changes = {
      doctorName,
      doctorRole,
      doctorCrm,
      residencySalary: {
        value: salaryVal,
        active: salaryActive
      }
    };

    if (this.tempPhoto) {
      changes.doctorPhoto = this.tempPhoto;
      this.tempPhoto = null;
    }

    this.store.updateProfile(changes);
    this.showToast('Perfil atualizado com sucesso!');
    this.closeModal('#modal-profile');
    this.render();
  }


  // =========================================================================
  // HUB DE FINANÇAS VISUAL (GRÁFICOS AMPLIADOS)
  // =========================================================================

  openHubModal() {
    this.closeAllModals();
    const modal = document.getElementById('modal-hub');
    if (!modal) return;

    const body = document.getElementById('hub-modal-body');
    if (!body) return;

    const activeMonth = this.store.data.preferences.activeMonth || getLocalDateString().slice(0, 7);
    const summary = this.store.getMonthSummary(activeMonth);
    const forecast = this.store.getForecast6Months(activeMonth);

    body.innerHTML = `
      <div class="card-section">
        <h3>Previsão Semestral</h3>
        ${this.renderForecastChart(forecast)}
      </div>

      <div class="card-section" style="margin-top: 14px;">
        <h3>Composição de Gastos por Categoria</h3>
        ${this.renderDonutChart(summary.categoryBreakdown, summary.totalExpenses)}
      </div>

      <div class="card-section" style="margin-top: 14px;">
        <h3>Detalhamento por Macro-Grupo</h3>
        <div class="macro-bars-list">
          ${summary.macroGroupBreakdown.map(mg => `
            <div class="macro-bar-item">
              <div class="macro-bar-label">
                <span>${escapeHtml(mg.name)}</span>
                <strong>${formatCurrency(mg.amount)} (${mg.percentage}%)</strong>
              </div>
              <div class="macro-bar-track">
                <div class="macro-bar-fill" style="width: ${Math.min(100, mg.percentage)}%; background: ${mg.color};"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }


  // =========================================================================
  // MODAL DE CONFIRMAÇÃO DE RESET COM BACKUP PRÉVIO
  // =========================================================================

  openResetConfirmModal() {
    this.closeAllModals();
    const modal = document.getElementById('modal-reset-confirm');
    if (!modal) return;

    const body = document.getElementById('reset-confirm-body');
    if (body) {
      body.innerHTML = `
        <div class="warning-box" style="padding: 16px; background: rgba(239, 83, 80, 0.1); border-radius: 16px; margin-bottom: 16px;">
          <p style="color: #D32F2F; font-size: 15px; margin: 0 0 8px 0; font-weight: 700;">
            Atenção: Ação Irreversível
          </p>
          <p style="font-size: 14px; color: var(--text-muted); margin: 0;">
            Isso limpará todos os plantões e despesas registrados neste aparelho. Um backup automático será baixado imediatamente para sua segurança.
          </p>
        </div>
        <div class="modal-actions-row">
          <button type="button" class="btn-silk-secondary" data-close-modal="#modal-reset-confirm">Cancelar</button>
          <button type="button" class="btn-silk-text-danger" id="btn-do-reset" style="background: #EF5350; color: #fff;">
            Confirmar e Zerar Dados
          </button>
        </div>
      `;

      const doResetBtn = body.querySelector('#btn-do-reset');
      if (doResetBtn) {
        doResetBtn.addEventListener('click', () => {
          this.exportBackup();
          this.store.resetAllData({ createBackup: true });
          this.showToast('Dados limpos com backup preventivo salvo.');
          this.closeModal('#modal-reset-confirm');
          this.render();
        });
      }
    }

    modal.classList.remove('hidden');
  }


  // =========================================================================
  // CONTROLE DE GAVETA HAMBÚRGUER & TEMA
  // =========================================================================

  openDrawer() {
    const drawer = document.getElementById('drawer-menu');
    if (drawer) drawer.classList.remove('hidden');
  }


  closeDrawer() {
    const drawer = document.getElementById('drawer-menu');
    if (drawer) drawer.classList.add('hidden');
  }


  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    this.store.data.preferences.theme = nextTheme;
    this.store.save();

    const label = document.getElementById('theme-toggle-label');
    if (label) label.textContent = nextTheme === 'dark' ? 'Modo Claro' : 'Modo UTI Neonatal';

    this.showToast(nextTheme === 'dark' ? 'Modo UTI Neonatal ativado 🌙' : 'Modo Claro ativado ☀️');
  }
}

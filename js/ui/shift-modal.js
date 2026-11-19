/**
 * Finanças Pediatria /v8/ - UI: Modal de plantão (novo e edição em 1 toque)
 * Métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { getLocalDateString, getCategoryKey, normalizeCategoryName } from '../store.js';
import { escapeHtml } from './helpers.js';

export class ShiftModalMethods {
  // =========================================================================
  // MODAIS: NOVO PLANTÃO E EDIÇÃO EM 1 TOQUE
  // =========================================================================

  openShiftModal(options = {}) {
    this.closeAllModals();
    const modal = document.getElementById('modal-shift');
    if (!modal) return;

    const titleEl = document.getElementById('modal-shift-title');
    const form = document.getElementById('form-new-shift');
    if (!form) return;

    this.editingShiftId = options.shiftId || null;
    const isEdit = Boolean(this.editingShiftId);

    if (titleEl) {
      titleEl.textContent = isEdit ? 'Editar Plantão Pediátrico' : 'Novo Plantão Pediátrico';
    }

    let defaultHosp = options.hospital || 'Maternidade Principal';
    let defaultNet = '';
    let defaultGross = '';
    let defaultDate = getLocalDateString();
    let defaultType = 'Sala de Parto';
    let defaultNotes = '';

    if (isEdit) {
      const shift = this.store.data.shifts.find(s => s.id === this.editingShiftId);
      if (shift) {
        defaultHosp = shift.source_name_snapshot;
        defaultNet = shift.net_value;
        defaultGross = shift.gross_value;
        defaultDate = shift.date;
        defaultType = shift.shiftType;
        defaultNotes = shift.notes || '';
      }
    } else if (options.hospital) {
      const matched = this.store.getActiveIncomeSources().find(s => getCategoryKey(s.name) === getCategoryKey(options.hospital));
      if (matched && matched.defaultAmount > 0) {
        defaultNet = matched.defaultAmount;
      }
    }

    // Renderiza o corpo do formulário com chips rápidos no topo
    const sources = this.store.getActiveIncomeSources();
    const quickChipsHtml = sources.map(s => `
      <button 
        type="button" 
        class="modal-hosp-pill ${s.name === defaultHosp ? 'selected' : ''}" 
        data-source-chip="${escapeHtml(s.name)}" 
        data-default-amount="${s.defaultAmount}"
        data-source-type="${escapeHtml(s.typeLabel || s.type)}"
      >
        ${escapeHtml(s.name)}
      </button>
    `).join('');

    form.innerHTML = `
      <div class="form-group">
        <label for="shift-hospital-input">Hospital / Maternidade</label>
        <input 
          type="text" 
          id="shift-hospital-input" 
          name="hospital" 
          class="form-input silk-input" 
          value="${escapeHtml(defaultHosp)}" 
          placeholder="Ex: Maternidade Principal" 
          required 
        />
        <div class="modal-hospital-pills" id="shift-source-chips-container">
          ${quickChipsHtml}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="shift-date-input">Data do Plantão</label>
          <input 
            type="date" 
            id="shift-date-input" 
            name="date" 
            class="form-input silk-input" 
            value="${escapeHtml(defaultDate)}" 
            required 
          />
        </div>
        <div class="form-group">
          <label for="shift-type-input">Tipo de Plantão</label>
          <input 
            type="text" 
            id="shift-type-input" 
            name="shiftType" 
            class="form-input silk-input" 
            value="${escapeHtml(defaultType)}" 
            placeholder="Ex: Sala de Parto, 12h UTI" 
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="shift-net-input">Valor Líquido (R$)</label>
          <input 
            type="number" 
            id="shift-net-input" 
            name="netValue" 
            class="form-input silk-input" 
            step="0.01" 
            min="0" 
            value="${defaultNet}" 
            placeholder="0,00" 
            required 
          />
        </div>
        <div class="form-group">
          <label for="shift-gross-input">Valor Bruto (Opcional)</label>
          <input 
            type="number" 
            id="shift-gross-input" 
            name="grossValue" 
            class="form-input silk-input" 
            step="0.01" 
            min="0" 
            value="${defaultGross}" 
            placeholder="0,00" 
          />
        </div>
      </div>

      <div class="form-group">
        <label for="shift-notes-input">Observações Clínicas / Maternidade</label>
        <textarea 
          id="shift-notes-input" 
          name="notes" 
          class="form-input silk-input" 
          rows="2" 
          placeholder="Anotações opcionais (sem dados nominais de pacientes)"
        >${escapeHtml(defaultNotes)}</textarea>
      </div>

      <div class="modal-actions-row">
        <button type="button" class="btn-silk-secondary" data-close-modal="#modal-shift">
          Cancelar
        </button>
        <button type="submit" class="btn-silk-primary">
          ${isEdit ? 'Atualizar Plantão' : 'Salvar Plantão'}
        </button>
      </div>
    `;

    // Chip click preenche em 1 toque
    const chipsContainer = form.querySelector('#shift-source-chips-container');
    if (chipsContainer) {
      chipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-source-chip]');
        if (!chip) return;
        chipsContainer.querySelectorAll('.modal-hosp-pill').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');

        const hospInput = form.querySelector('#shift-hospital-input');
        const netInput = form.querySelector('#shift-net-input');
        const typeInput = form.querySelector('#shift-type-input');

        if (hospInput) hospInput.value = chip.getAttribute('data-source-chip');
        const defAmt = parseFloat(chip.getAttribute('data-default-amount'));
        if (netInput && defAmt > 0) netInput.value = defAmt.toFixed(2);
        if (typeInput) typeInput.value = chip.getAttribute('data-source-type');
      });
    }

    modal.classList.remove('hidden');
  }


  handleSaveShift(form) {
    const hosp = normalizeCategoryName(form.hospital.value);
    const date = form.date.value || getLocalDateString();
    const net = parseFloat(form.netValue.value) || 0;
    const gross = parseFloat(form.grossValue.value) || net;
    const shiftType = form.shiftType.value || 'Sala de Parto';
    const notes = form.notes.value || '';

    if (!hosp || net <= 0) {
      this.showToast('Informe o hospital e o valor líquido do plantão', 'error');
      return;
    }

    if (this.editingShiftId) {
      this.store.updateShift(this.editingShiftId, {
        hospital: hosp,
        date,
        netValue: net,
        grossValue: gross,
        shiftType,
        notes
      });
      this.showToast('Plantão atualizado com sucesso!');
    } else {
      this.store.addShift({
        hospital: hosp,
        date,
        netValue: net,
        grossValue: gross,
        shiftType,
        notes
      });
      this.showToast('Plantão cadastrado com sucesso!');
    }

    this.closeModal('#modal-shift');
    this.render();
  }
}

/**
 * Finanças Pediatria /v8/ - UI: Modal de plantão (novo e edição em 1 toque)
 * Métodos instalados em PediatricUI.prototype por js/ui.js
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { getLocalDateString, getCategoryKey, normalizeCategoryName, formatCurrency, formatDateBR } from '../store.js';
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
            type="number" inputmode="decimal" 
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
            type="number" inputmode="decimal" 
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

  // =========================================================================
  // EDIÇÃO DE PARCELA (data prevista, valor, situação e data real do recebimento)
  // =========================================================================

  openInstallmentModal(shiftId, installmentNum) {
    const shift = this.store.data.shifts.find(s => s.id === shiftId);
    const inst = shift?.installments?.[installmentNum - 1];
    const form = document.getElementById('form-installment');
    if (!shift || !inst || !form) return;
    this.closeAllModals();

    const count = shift.installments.length;
    const total = shift.installments.reduce((sum, i) => sum + (parseFloat(i.value) || 0), 0);
    const received = inst.status === 'received';
    const titleEl = document.getElementById('modal-installment-title');
    if (titleEl) titleEl.textContent = `${installmentNum}ª parcela de ${count}`;

    form.setAttribute('data-shift-id', shiftId);
    form.setAttribute('data-installment-num', String(installmentNum));
    form.setAttribute('data-total', String(Math.round(total * 100) / 100));
    form.innerHTML = `
      <p class="inst-modal-context">
        <strong>${escapeHtml(shift.source_name_snapshot)}</strong> • plantão de ${formatDateBR(shift.date)}<br>
        Líquido do plantão: <strong>${formatCurrency(shift.net_value)}</strong>
      </p>

      <div class="form-row">
        <div class="form-group">
          <label for="inst-date-input">Data prevista</label>
          <input type="date" id="inst-date-input" name="date" class="form-input silk-input" value="${escapeHtml(inst.date)}" required />
        </div>
        <div class="form-group">
          <label for="inst-value-input">Valor (R$)</label>
          <input type="number" id="inst-value-input" name="value" class="form-input silk-input" step="0.01" min="0.01" inputmode="decimal" value="${inst.value}" required />
        </div>
      </div>

      <fieldset class="inst-status-group">
        <legend>Situação</legend>
        <label class="inst-status-option">
          <input type="radio" name="status" value="pending"${received ? '' : ' checked'} />
          <span class="inst-status-card pending">Pendente</span>
        </label>
        <label class="inst-status-option">
          <input type="radio" name="status" value="received"${received ? ' checked' : ''} />
          <span class="inst-status-card received">Recebido</span>
        </label>
      </fieldset>

      <div class="form-group" id="inst-paid-group"${received ? '' : ' hidden'}>
        <label for="inst-paid-input">Data em que caiu na conta</label>
        <input type="date" id="inst-paid-input" name="paidDate" class="form-input silk-input" value="${escapeHtml(inst.paidDate || getLocalDateString())}" />
      </div>

      ${count === 2 ? `
        <label class="inst-balance-option">
          <input type="checkbox" name="balance" checked />
          <span>Ajustar a outra parcela para o total continuar ${formatCurrency(total)}</span>
        </label>
      ` : ''}
      <p class="inst-sum-hint" id="inst-sum-hint" aria-live="polite"></p>

      <div class="modal-actions-row">
        <button type="button" class="btn-silk-secondary" data-close-modal="#modal-installment">Cancelar</button>
        <button type="submit" class="btn-silk-primary">Salvar parcela</button>
      </div>
    `;

    const paidGroup = form.querySelector('#inst-paid-group');
    const valueInput = form.querySelector('#inst-value-input');
    const balanceBox = form.querySelector('[name="balance"]');
    const hint = form.querySelector('#inst-sum-hint');

    // Mostra a data real só quando "Recebido"
    form.querySelectorAll('[name="status"]').forEach(r => r.addEventListener('change', () => {
      const isReceived = form.querySelector('[name="status"]:checked')?.value === 'received';
      if (isReceived) paidGroup.removeAttribute('hidden'); else paidGroup.setAttribute('hidden', '');
    }));

    // Resumo da soma das parcelas em tempo real (quando não há ajuste automático)
    const others = shift.installments.reduce((sum, i, idx) => sum + (idx === installmentNum - 1 ? 0 : (parseFloat(i.value) || 0)), 0);
    const updateHint = () => {
      if (balanceBox && balanceBox.checked) { hint.textContent = ''; hint.classList.remove('warn'); return; }
      const sum = others + (parseFloat(valueInput.value) || 0);
      const diff = Math.round((sum - total) * 100) / 100;
      if (Math.abs(diff) < 0.005) { hint.textContent = ''; hint.classList.remove('warn'); return; }
      hint.textContent = `Soma das parcelas: ${formatCurrency(sum)} (${diff > 0 ? '+' : '−'}${formatCurrency(Math.abs(diff))} em relação ao total de ${formatCurrency(total)}).`;
      hint.classList.add('warn');
    };
    valueInput.addEventListener('input', updateHint);
    if (balanceBox) balanceBox.addEventListener('change', updateHint);
    updateHint();

    this.openModal('#modal-installment');
  }

  handleSaveInstallment(form) {
    const shiftId = form.getAttribute('data-shift-id');
    const num = parseInt(form.getAttribute('data-installment-num'), 10);
    const status = form.querySelector('[name="status"]:checked')?.value || 'pending';

    const res = this.store.updateShiftInstallment(shiftId, num, {
      date: form.date.value,
      value: form.value.value,
      status,
      paidDate: status === 'received' ? form.paidDate.value : undefined,
      balance: Boolean(form.querySelector('[name="balance"]')?.checked)
    });

    if (!res.updated) {
      this.showToast(res.error || 'Não foi possível salvar a parcela', 'error');
      return;
    }

    this.closeModal('#modal-installment');
    this.render();
    this.showToastWithUndo('Parcela atualizada', () => {
      this.store.restoreShiftInstallments(shiftId, res.previous);
      this.render();
      this.showToast('Alteração da parcela desfeita');
    });
  }
}
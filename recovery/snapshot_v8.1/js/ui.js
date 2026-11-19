/**
 * Finanças Pediatria /v8/ - Camada de Apresentação e UI Ergonomicamente Blindada
 * Standalone Local-First • Anti-XSS Sanitization • Microinterações Acolhedoras
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 *
 * A classe é composta por módulos temáticos em js/ui/ (mixins instalados no prototype).
 */

import { escapeHtml, FOCUSABLE_SELECTOR, nextFocusIndex } from './ui/helpers.js';
import { EventsMethods } from './ui/events.js';
import { ViewMethods } from './ui/views.js';
import { ShiftModalMethods } from './ui/shift-modal.js';
import { ExpenseModalMethods } from './ui/expense-modal.js';
import { SourcesCategoriesMethods } from './ui/sources-categories.js';
import { ProfileHubMethods } from './ui/profile-hub.js';
import { FeedbackMethods } from './ui/feedback.js';
import { ChartMethods } from './ui/charts.js';
import { BudgetMethods } from './ui/budget.js';
import { ReportMethods } from './ui/report.js';
import { CashAccrualMethods } from './ui/cash-accrual.js';

// Reexporta utilitários puros (API pública usada pelos testes)
export { escapeHtml, FOCUSABLE_SELECTOR, nextFocusIndex };

export class PediatricUI {
  constructor(store, storage) {
    this.store = store;
    this.storage = storage;
    this.activeTab = 'home';
    this.selectedMacroFilter = 'all';
    this.selectedMicroFilter = 'all';
    this.editingShiftId = null;
    this.editingExpenseId = null;
    this.undoToastTimer = null;
  }

  init() {
    this.bindGlobalEvents();
    this.render();
  }
}

// Instala os métodos dos módulos no prototype, preservando semântica de `this`
for (const Mixin of [EventsMethods, ViewMethods, ShiftModalMethods, ExpenseModalMethods, SourcesCategoriesMethods, ProfileHubMethods, FeedbackMethods, ChartMethods, BudgetMethods, ReportMethods, CashAccrualMethods]) {
  for (const name of Object.getOwnPropertyNames(Mixin.prototype)) {
    if (name === 'constructor') continue;
    if (Object.prototype.hasOwnProperty.call(PediatricUI.prototype, name)) {
      throw new Error(`PediatricUI: método duplicado "${name}" em ${Mixin.name}`);
    }
    Object.defineProperty(PediatricUI.prototype, name, Object.getOwnPropertyDescriptor(Mixin.prototype, name));
  }
}

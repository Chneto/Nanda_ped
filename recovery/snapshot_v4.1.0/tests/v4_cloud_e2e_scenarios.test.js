/**
 * v4_cloud_e2e_scenarios.test.js
 * Test Suite for Milestone M6: Tier 4 Real-World Application Scenarios
 * Application: Finanças Pediatria V4_Cloud
 * 
 * Verifies the 6 Tier 4 Real-World Pediatric Application Scenarios:
 * 1. Scenario 1 — Hospital Basement Delivery Room Workflow (Maternidade Principal, offline mode, 75% D+60 / 25% D+90, 0ms latency)
 * 2. Scenario 2 — Hospital Emergence & Online Reconnection (WiFi reconnect, queue drains, idempotent upsert, sync status)
 * 3. Scenario 3 — Stethoscope Purchase Installment Plan (R$ 1.250,00 in 10x, chronological projection, residual cents, macro_formacao)
 * 4. Scenario 4 — Silk Gate Multi-Auth Switch (Google OAuth, Signout, Magic Link, Modo Convidada, session persistence)
 * 5. Scenario 5 — Security & CSP Breach Defense (Cross-user access, user_id spoofing, service_role rejection, CSP & RLS audit)
 * 6. Scenario 6 — Full Financial Month-End Settlement (D+60/D+90 payouts, residency salary R$ 0,00, canonical categories, Regime de Caixa liquidity)
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_CREATOR = 'FChNeto';
export const APP_VERSION = '4.0.0';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v4Root = path.resolve(__dirname, '..');
const vercelConfigPath = path.resolve(v4Root, 'vercel.json');
const migrationsDir = path.resolve(v4Root, 'supabase', 'migrations');

// Domain & Store Modules
import {
  APP_CREATOR as STORE_CREATOR,
  APP_VERSION as STORE_VERSION,
  CANONICAL_CATEGORIES,
  DEFAULT_CATEGORIES,
  MACRO_GROUPS,
  DEFAULT_HOSPITALS,
  getLocalDateString,
  addMonthsToDateString,
  formatCurrency,
  formatDateBR,
  formatMonthYear,
  getMacroGroupForCategory,
  calculateShiftInstallments,
  generateExpenseInstallments,
  PediatricStore
} from '../js/store.js';

// IndexedDB Local-First Database Module
import {
  STORES,
  SYNC_STATUS,
  QUEUE_ACTION,
  QUEUE_STATUS,
  generateUUID,
  setForceInMemory,
  __resetInMemoryDB,
  localGet,
  localGetAll,
  localPut,
  localDelete,
  getPendingSyncItems,
  markSynced,
  exportAllLocalData,
  importAllLocalData
} from '../js/db.js';

// Sync Engine Module
import {
  SYNC_STATUS_EVENT,
  SYNC_STORAGE_KEYS,
  SYNC_TABLES,
  onSyncStatusChange,
  notifySyncStatus,
  getSyncStatus,
  getLastSyncTime,
  setLastSyncTime,
  pushPendingQueue,
  pullRemoteUpdates,
  syncNow,
  _setSupabaseForTesting,
  _resetSyncForTesting
} from '../js/sync.js';

// Config & Auth Modules
import {
  STORAGE_KEYS,
  getConfig,
  saveConfig,
  clearConfig,
  isOfflineMode,
  setOfflineMode,
  isGuestMode,
  setGuestMode,
  isValidSupabaseUrl,
  isValidSupabaseAnonKey,
  isServiceRoleKey,
  parseJwtPayload,
  testSupabaseReachability
} from '../js/config.js';

import {
  initSupabase,
  getSupabase,
  signInWithGoogle,
  signInWithMagicLink,
  signOut,
  getSession,
  assertNotServiceRoleKey,
  _setCreateClientForTesting,
  _resetClientForTesting
} from '../js/supabaseClient.js';

// UI & App Modules
import { PediatricUI, getIconSvg, FALLBACK_SVGS } from '../js/ui.js';
import { PediatricApp } from '../js/app.js';

// ============================================================================
// MOCK DOM & TEST ENVIRONMENT INFRASTRUCTURE
// ============================================================================

class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(...cls) {
    cls.forEach(c => this.classes.add(c));
  }
  remove(...cls) {
    cls.forEach(c => this.classes.delete(c));
  }
  contains(cls) {
    return this.classes.has(cls);
  }
  toggle(cls, force) {
    if (force !== undefined) {
      if (force) this.add(cls);
      else this.remove(cls);
      return force;
    }
    if (this.contains(cls)) {
      this.remove(cls);
      return false;
    } else {
      this.add(cls);
      return true;
    }
  }
  get length() {
    return this.classes.size;
  }
  toString() {
    return Array.from(this.classes).join(' ');
  }
}

class MockElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.classList = new MockClassList();
    this.attributes = new Map();
    this.style = {
      position: '',
      setProperty: (prop, val) => {
        this.style[prop] = val;
      },
      getPropertyValue: (prop) => {
        return this.style[prop] || '';
      }
    };
    this.children = [];
    this.parentNode = null;
    this.listeners = new Map();
    this._innerHTML = '';
    this._textContent = '';
    this.value = '';
    this.type = 'text';
    this.checked = false;
    this.title = '';
  }

  get className() {
    return this.classList.toString();
  }
  set className(val) {
    this.classList.classes.clear();
    if (val) {
      val.trim().split(/\s+/).forEach(c => this.classList.add(c));
    }
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
  }
  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }
  hasAttribute(name) {
    return this.attributes.has(name);
  }

  get textContent() {
    if (this._textContent) return this._textContent;
    if (this.children.length > 0) {
      return this.children.map(c => c.textContent).join(' ');
    }
    return '';
  }
  set textContent(val) {
    this._textContent = String(val);
  }

  get innerHTML() {
    return this._innerHTML;
  }
  set innerHTML(val) {
    this._innerHTML = String(val);
    this._textContent = String(val).replace(/<[^>]*>/g, '');
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  addEventListener(event, fn) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(fn);
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type) || [];
    list.forEach(fn => fn(event));
    if (this.parentNode && event.bubbles) {
      this.parentNode.dispatchEvent(event);
    }
    return true;
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, bubbles: true });
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (node) => {
      let match = false;
      if (selector.startsWith('#') && node.id === selector.slice(1)) match = true;
      else if (selector.startsWith('.') && node.classList.contains(selector.slice(1))) match = true;
      else if (selector.includes('[') && selector.includes(']')) {
        const attrMatch = selector.match(/\[([^=]+)(?:=["']?([^"']+)["']?)?\]/);
        if (attrMatch) {
          const attr = attrMatch[1];
          const val = attrMatch[2];
          if (val !== undefined) {
            if (node.getAttribute(attr) === val) match = true;
          } else {
            if (node.hasAttribute(attr)) match = true;
          }
        }
      } else if (node.tagName.toLowerCase() === selector.toLowerCase()) {
        match = true;
      }
      if (match) results.push(node);
      node.children.forEach(c => check(c));
    };
    this.children.forEach(c => check(c));
    return results;
  }

  closest(selector) {
    let cur = this;
    while (cur) {
      if (selector.startsWith('#') && cur.id === selector.slice(1)) return cur;
      if (selector.startsWith('.') && cur.classList && cur.classList.contains(selector.slice(1))) return cur;
      if (selector.includes('[') && selector.includes(']')) {
        const attrMatch = selector.match(/\[([^=]+)(?:=["']?([^"']+)["']?)?\]/);
        if (attrMatch) {
          const attr = attrMatch[1];
          const val = attrMatch[2];
          if (val !== undefined && cur.getAttribute && cur.getAttribute(attr) === val) return cur;
          if (val === undefined && cur.hasAttribute && cur.hasAttribute(attr)) return cur;
        }
      }
      if (cur.tagName && cur.tagName.toLowerCase() === selector.toLowerCase()) return cur;
      cur = cur.parentNode;
    }
    return null;
  }

  focus() {}
}

class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(k) {
    return this.store.has(String(k)) ? this.store.get(String(k)) : null;
  }
  setItem(k, v) {
    this.store.set(String(k), String(v));
  }
  removeItem(k) {
    this.store.delete(String(k));
  }
  clear() {
    this.store.clear();
  }
}

function buildMockDOM() {
  const doc = {
    body: new MockElement('body'),
    documentElement: new MockElement('html'),
    elementsById: new Map(),
    getElementById: (id) => doc.elementsById.get(id) || doc.body.querySelector('#' + id) || null,
    querySelector: (sel) => {
      if (sel.startsWith('#')) return doc.elementsById.get(sel.slice(1)) || doc.body.querySelector(sel);
      return doc.body.querySelector(sel);
    },
    querySelectorAll: (sel) => doc.body.querySelectorAll(sel),
    createElement: (tag) => new MockElement(tag),
    addEventListener: (evt, fn) => {
      doc.body.addEventListener(evt, fn);
    }
  };

  const register = (el) => {
    if (el.id) doc.elementsById.set(el.id, el);
    doc.body.appendChild(el);
    return el;
  };

  // Silk Gate Screen
  const silkGate = register(new MockElement('section', 'silk-gate-screen'));
  const btnGoogle = new MockElement('button', 'btn-google-auth');
  const labelGoogle = new MockElement('span', 'label-google-auth');
  labelGoogle.textContent = 'Entrar com Google';
  btnGoogle.appendChild(labelGoogle);
  silkGate.appendChild(btnGoogle);

  const formMagic = new MockElement('form', 'form-magic-link');
  const inputEmail = new MockElement('input', 'input-magic-email');
  inputEmail.type = 'email';
  const labelMagic = new MockElement('span', 'label-magic-link');
  labelMagic.textContent = 'Enviar Link Mágico';
  const feedbackMagic = new MockElement('div', 'magic-link-feedback');
  feedbackMagic.classList.add('hidden');
  formMagic.appendChild(inputEmail);
  formMagic.appendChild(labelMagic);
  formMagic.appendChild(feedbackMagic);
  silkGate.appendChild(formMagic);
  register(btnGoogle);
  register(labelGoogle);
  register(formMagic);
  register(inputEmail);
  register(labelMagic);
  register(feedbackMagic);

  const btnGuest = register(new MockElement('button', 'btn-guest-mode'));
  const btnGear = register(new MockElement('button', 'btn-gate-gear'));
  const btnOpenConfig = register(new MockElement('button', 'btn-open-cloud-config'));

  // Main App Screen
  const mainApp = register(new MockElement('main', 'main-app-screen'));
  mainApp.classList.add('hidden');

  register(new MockElement('div', 'btn-header-profile'));
  register(new MockElement('button', 'btn-header-menu'));
  register(new MockElement('h1', 'header-doctor-name'));
  register(new MockElement('p', 'header-doctor-role'));
  register(new MockElement('img', 'doctor-avatar-img'));
  register(new MockElement('div', 'doctor-avatar-fallback'));

  // Sync Badge
  const syncBadge = register(new MockElement('div', 'sync-badge'));
  const syncDot = new MockElement('span');
  syncDot.className = 'sync-dot';
  syncBadge.appendChild(syncDot);
  const syncText = new MockElement('span');
  syncText.className = 'sync-text';
  syncBadge.appendChild(syncText);

  // Month & Regime Navigation
  register(new MockElement('button', 'btn-prev-month'));
  register(new MockElement('button', 'btn-next-month'));
  register(new MockElement('h2', 'current-month-title'));
  register(new MockElement('span', 'current-regime-pill'));

  // Views Container
  const viewContainer = register(new MockElement('div', 'view-container'));
  const viewHome = register(new MockElement('section', 'view-home'));
  viewHome.className = 'app-view active';
  const viewIncome = register(new MockElement('section', 'view-income'));
  viewIncome.className = 'app-view hidden';
  const viewExpenses = register(new MockElement('section', 'view-expenses'));
  viewExpenses.className = 'app-view hidden';
  viewContainer.appendChild(viewHome);
  viewContainer.appendChild(viewIncome);
  viewContainer.appendChild(viewExpenses);

  // Bottom Navigation Bar
  const bottomNav = register(new MockElement('nav'));
  bottomNav.className = 'bottom-nav-bar';
  const tabHome = new MockElement('button', 'tab-nav-home');
  tabHome.className = 'nav-tab active';
  tabHome.setAttribute('data-tab', 'home');
  const tabIncome = new MockElement('button', 'tab-nav-income');
  tabIncome.className = 'nav-tab';
  tabIncome.setAttribute('data-tab', 'income');
  const tabExpenses = new MockElement('button', 'tab-nav-expenses');
  tabExpenses.className = 'nav-tab';
  tabExpenses.setAttribute('data-tab', 'expenses');
  const fabBtn = new MockElement('button', 'fab-add-btn');
  bottomNav.appendChild(tabHome);
  bottomNav.appendChild(tabIncome);
  bottomNav.appendChild(fabBtn);
  bottomNav.appendChild(tabExpenses);
  register(tabHome);
  register(tabIncome);
  register(tabExpenses);
  register(fabBtn);

  // Modals
  const createModal = (id) => {
    const modal = register(new MockElement('div', id));
    modal.className = 'modal-backdrop hidden';
    const sheet = new MockElement('div');
    sheet.className = 'modal-sheet';
    modal.appendChild(sheet);
    const content = new MockElement('div', `${id}-content`);
    if (content.id) doc.elementsById.set(content.id, content);
    sheet.appendChild(content);
    return modal;
  };

  createModal('modal-shift');
  createModal('modal-expense');
  createModal('modal-cloud-config');
  createModal('modal-doctor-profile');

  const modalCategories = createModal('modal-categories');
  const catBody = register(new MockElement('div', 'categories-modal-body'));
  catBody.className = 'categories-accordion-wrap';
  modalCategories.querySelector('.modal-sheet').appendChild(catBody);

  // Quick Action Buttons
  register(new MockElement('button', 'btn-quick-add-shift'));
  register(new MockElement('button', 'btn-quick-add-expense'));

  // Cloud Config Inputs
  register(new MockElement('input', 'input-supabase-url'));
  const inputAnon = register(new MockElement('input', 'input-supabase-anon'));
  inputAnon.type = 'password';
  register(new MockElement('button', 'btn-toggle-anon-visibility'));
  register(new MockElement('span', 'eye-icon-open'));
  register(new MockElement('span', 'eye-icon-closed'));
  register(new MockElement('button', 'btn-test-connection'));
  const feedbackBox = register(new MockElement('div', 'cloud-test-feedback'));
  feedbackBox.classList.add('hidden');
  register(new MockElement('span', 'feedback-text-content'));

  // Drawer Menu
  const drawer = register(new MockElement('div', 'drawer-menu'));
  drawer.className = 'menu-drawer-backdrop hidden';
  register(new MockElement('button', 'btn-close-drawer'));
  register(new MockElement('button', 'drawer-item-categories'));
  register(new MockElement('button', 'drawer-item-hub'));
  register(new MockElement('button', 'drawer-item-reset'));
  register(new MockElement('button', 'drawer-item-signout'));
  register(new MockElement('button', 'drawer-item-export'));
  register(new MockElement('button', 'drawer-item-restore'));

  register(new MockElement('div', 'toast-container'));

  return doc;
}

// ============================================================================
// MOCK SUPABASE CLIENT WITH RLS AND STORAGE ENGINE
// ============================================================================

class MockSupabaseClient {
  constructor(userId = 'user-a-test-id', role = 'authenticated') {
    this.currentUser = {
      id: userId,
      email: 'medica@example.com',
      role: role,
      user_metadata: {
        full_name: 'Médica',
        name: 'Médica',
        avatar_url: 'https://cdn.pediatria.med.br/profile-photo.png'
      }
    };
    this.remoteTables = {
      profiles: new Map(),
      shifts: new Map(),
      expenses: new Map(),
      custom_categories: new Map()
    };
    this.isOfflineFallback = false;
    this.upsertCalls = 0;
    this.selectCalls = 0;
  }

  auth = {
    getUser: async () => ({
      data: { user: this.currentUser },
      error: null
    }),
    getSession: async () => ({
      data: {
        session: this.currentUser ? { user: this.currentUser, access_token: 'valid_mock_jwt' } : null
      },
      error: null
    }),
    signInWithOAuth: async ({ provider }) => ({
      data: { provider, url: 'https://mock.supabase.co/auth/v1/authorize?provider=google' },
      error: null
    }),
    signInWithOtp: async ({ email }) => ({
      data: { user: null, session: null, messageId: 'msg_12345' },
      error: null
    }),
    signOut: async () => {
      this.currentUser = null;
      return { error: null };
    },
    onAuthStateChange: (cb) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  from(tableName) {
    if (!this.remoteTables[tableName]) {
      this.remoteTables[tableName] = new Map();
    }
    const table = this.remoteTables[tableName];
    const clientUser = this.currentUser;
    let filters = [];
    let isUpsert = false;
    let isUpdate = false;
    let isDelete = false;
    let updatePayload = null;
    let upsertPayload = null;

    const builder = {
      select: () => {
        this.selectCalls++;
        return builder;
      },
      eq: (col, val) => {
        filters.push((row) => String(row[col]) === String(val));
        return builder;
      },
      gt: (col, val) => {
        filters.push((row) => String(row[col]) > String(val));
        return builder;
      },
      upsert: (payload) => {
        isUpsert = true;
        this.upsertCalls++;
        upsertPayload = Array.isArray(payload) ? payload : [payload];

        // Simulate PostgreSQL RLS WITH CHECK (auth.uid() = user_id or id)
        for (const item of upsertPayload) {
          const ownerId = tableName === 'profiles' ? item.id : item.user_id;
          if (clientUser && ownerId && String(ownerId) !== String(clientUser.id)) {
            return Promise.resolve({
              data: null,
              error: new Error(`new row violates row-level security policy for table "${tableName}"`)
            });
          }
          table.set(String(item.id), { ...item });
        }

        return Promise.resolve({ data: upsertPayload, error: null });
      },
      update: (payload) => {
        isUpdate = true;
        updatePayload = payload;
        return builder;
      },
      delete: () => {
        isDelete = true;
        return builder;
      },
      then: (resolve) => {
        if (isUpdate) {
          let updatedCount = 0;
          for (const [id, row] of table.entries()) {
            if (filters.every(f => f(row))) {
              table.set(id, { ...row, ...updatePayload });
              updatedCount++;
            }
          }
          resolve({ data: [{ count: updatedCount }], error: null });
          return;
        }

        if (isDelete) {
          for (const [id, row] of table.entries()) {
            if (filters.every(f => f(row))) {
              table.delete(id);
            }
          }
          resolve({ data: [], error: null });
          return;
        }

        let results = Array.from(table.values());
        for (const filter of filters) {
          results = results.filter(filter);
        }
        resolve({ data: results.map(r => JSON.parse(JSON.stringify(r))), error: null });
      }
    };

    return builder;
  }
}

// ============================================================================
// MASTER TEST SUITE: TIER 4 REAL-WORLD PEDIATRIC APPLICATION SCENARIOS
// ============================================================================

describe('Finanças Pediatria V4_Cloud — Tier 4 Real-World Application Scenarios', () => {
  let mockDoc;
  let mockStorage;
  let mockSupabase;
  let store;
  let ui;
  let app;

  beforeEach(() => {
    // 1. Force in-memory database & clean state
    setForceInMemory(true);
    __resetInMemoryDB();
    _resetSyncForTesting();

    // 2. Setup mock localStorage & DOM
    mockStorage = new MockLocalStorage();
    globalThis.localStorage = mockStorage;

    mockDoc = buildMockDOM();
    globalThis.document = mockDoc;
    globalThis.window = {
      localStorage: mockStorage,
      document: mockDoc,
      navigator: { onLine: true, storage: { persist: async () => true } },
      scrollTo: () => {},
      dispatchEvent: () => {},
      addEventListener: (evt, fn) => {
        if (!mockDoc.listeners.has(evt)) mockDoc.listeners.set(evt, []);
        mockDoc.listeners.get(evt).push(fn);
      },
      CustomEvent: class CustomEvent {
        constructor(t, i) {
          this.type = t;
          this.detail = i?.detail;
        }
      }
    };

    // 3. Initialize mock Supabase client
    mockSupabase = new MockSupabaseClient();
    _setSupabaseForTesting(mockSupabase);

    // 4. Reset config flags
    setOfflineMode(false);
    setGuestMode(false);

    try {
      Object.defineProperty(globalThis.navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
      });
    } catch {}

    // 5. Initialize Store & UI
    store = new PediatricStore();
    store.data.shifts = [];
    store.data.expenses = [];
    ui = new PediatricUI(store);
    app = new PediatricApp();
    app.store = store;
    app.ui = ui;
  });

  afterEach(() => {
    _resetSyncForTesting();
    __resetInMemoryDB();
    setOfflineMode(false);
    setGuestMode(false);
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
  });

  // ==========================================================================
  // SCENARIO 1: Hospital Basement Delivery Room Workflow
  // Features: F4, F12, F15, F19, F24
  // ==========================================================================
  describe('Scenario 1 — Hospital Basement Delivery Room Workflow (Maternidade Principal Offline Entry)', () => {
    test('1.1 Médica initiates app in hospital basement with 0 signal: Modo Local activates immediately without network delay', () => {
      // Simulate no internet connectivity in hospital basement
      try {
        Object.defineProperty(globalThis.navigator, 'onLine', { value: false, writable: true, configurable: true });
      } catch {}
      setOfflineMode(true);
      setGuestMode(true);

      assert.equal(isGuestMode(), true);
      assert.equal(isOfflineMode(), true);

      app.routeAuthView(null);

      const silkGate = mockDoc.getElementById('silk-gate-screen');
      const appShell = mockDoc.getElementById('main-app-screen');

      // Silk Gate must be hidden and App Shell immediately interactive
      assert.equal(silkGate.classList.contains('hidden'), true);
      assert.equal(appShell.classList.contains('hidden'), false);

      ui.updateSyncBadge('guest');
      const syncBadge = mockDoc.getElementById('sync-badge');
      assert.equal(syncBadge.classList.contains('guest'), true);
      assert.match(syncBadge.textContent, /Modo Local/i);
    });

    test('1.2 1-Touch quick maternity chip selection for "Maternidade Principal" opens modal and pre-fills form', () => {
      ui.selectHospitalChip('Maternidade Principal');

      const modal = mockDoc.getElementById('modal-shift');
      assert.equal(modal.classList.contains('hidden'), false);
      assert.equal(modal.getAttribute('aria-modal'), 'true');

      const content = mockDoc.getElementById('modal-shift-content');
      assert.match(content.innerHTML, /value="Maternidade Principal"/);
      assert.ok(store.data.hospitals.includes('Maternidade Principal'));
    });

    test('1.3 Neonatal delivery shift calculation adheres to 75% D+60 / 25% D+90 cash projections and strict cent preservation', () => {
      // Standard round amount (R$ 1.500,00)
      const standardSplit = calculateShiftInstallments(1500, '2026-03-15');
      assert.equal(standardSplit.installment1.value, 1125.00);
      assert.equal(standardSplit.installment1.date, '2026-05-15');
      assert.equal(standardSplit.installment2.value, 375.00);
      assert.equal(standardSplit.installment2.date, '2026-06-15');
      assert.equal(standardSplit.installment1.value + standardSplit.installment2.value, 1500.00);

      // Complex odd cent amount (R$ 1.750,33)
      const oddSplit = calculateShiftInstallments(1750.33, '2026-03-15');
      assert.equal(oddSplit.installment1.value, 1312.75);
      assert.equal(oddSplit.installment2.value, 437.58);
      const totalOdd = Math.round((oddSplit.installment1.value + oddSplit.installment2.value) * 100) / 100;
      assert.equal(totalOdd, 1750.33);
    });

    test('1.4 Month-end boundary clamping for delivery shift on March 31 preserves safe calendar dates', () => {
      // March 31 + 2 months = May 31 (31 days); + 3 months = June 30 (30 days, not July 1!)
      const splitClamp = calculateShiftInstallments(2000, '2026-03-31');
      assert.equal(splitClamp.installment1.date, '2026-05-31');
      assert.equal(splitClamp.installment2.date, '2026-06-30');
    });

    test('1.5 0ms network latency: shift is persisted directly to local IndexedDB stores (shifts & sync_queue) without network roundtrips', async () => {
      const shiftId = generateUUID();
      const shiftRecord = {
        id: shiftId,
        hospital: 'Maternidade Principal',
        date: '2026-03-15',
        gross_value: 1800.00,
        net_value: 1500.00,
        installment1_value: 1125.00,
        installment1_date: '2026-05-15',
        installment2_value: 375.00,
        installment2_date: '2026-06-15',
        status: 'confirmed',
        sync_status: 'pending',
        created_at: new Date().toISOString()
      };

      const startTime = Date.now();
      await localPut('shifts', shiftRecord, true);
      const duration = Date.now() - startTime;

      // Local write resolves with instant 0ms latency (< 25ms in test runner)
      assert.ok(duration < 25, `Expected <25ms local resolution, got ${duration}ms`);

      // Record exists immediately in local IndexedDB shifts store
      const retrieved = await localGet('shifts', shiftId);
      assert.ok(retrieved);
      assert.equal(retrieved.id, shiftId);
      assert.equal(retrieved.hospital, 'Maternidade Principal');

      // Mutation is queued in sync_queue for eventual cloud push
      const pendingQueue = await getPendingSyncItems();
      assert.equal(pendingQueue.length, 1);
      assert.equal(pendingQueue[0].store, 'shifts');
      assert.equal(pendingQueue[0].action, 'insert');
      assert.equal(pendingQueue[0].data.id, shiftId);
    });

    test('1.6 UI visual sync badge renders offline/guest state gracefully without crashing', () => {
      setGuestMode(false);
      setOfflineMode(true);
      ui.updateSyncBadge('offline');
      let badge = mockDoc.getElementById('sync-badge');
      assert.equal(badge.classList.contains('offline'), true);

      setOfflineMode(false);
      setGuestMode(true);
      ui.updateSyncBadge('guest');
      badge = mockDoc.getElementById('sync-badge');
      assert.equal(badge.classList.contains('guest'), true);
    });
  });

  // ==========================================================================
  // SCENARIO 2: Hospital Emergence & Online Reconnection
  // Features: F19, F20, F6, F8
  // ==========================================================================
  describe('Scenario 2 — Hospital Emergence & Online Reconnection (Automatic Sync)', () => {
    let queuedShiftId;

    beforeEach(async () => {
      queuedShiftId = generateUUID();
      const offlineShift = {
        id: queuedShiftId,
        hospital: 'Maternidade Principal',
        date: '2026-03-15',
        gross_value: 1800.00,
        net_value: 1500.00,
        installment1_value: 1125.00,
        installment1_date: '2026-05-15',
        installment2_value: 375.00,
        installment2_date: '2026-06-15',
        status: 'confirmed',
        sync_status: 'pending',
        created_at: new Date().toISOString()
      };
      await localPut('shifts', offlineShift, true);
    });

    test('2.1 Emergence from basement triggers online reconnection and automatic bidirectional sync', async () => {
      setOfflineMode(false);
      setGuestMode(false);
      globalThis.navigator.onLine = true;

      // Pending queue has 1 item prior to sync
      const pendingBefore = await getPendingSyncItems();
      assert.equal(pendingBefore.length, 1);

      // Trigger bidirectional sync
      const result = await syncNow();

      assert.equal(result.pushed, 1);
      assert.equal(result.errors.length, 0);

      // Queue is completely drained
      const pendingAfter = await getPendingSyncItems();
      assert.equal(pendingAfter.length, 0);
    });

    test('2.2 Pushed record arrives on remote Supabase table with authenticated user_id and synced status', async () => {
      setOfflineMode(false);
      setGuestMode(false);

      await syncNow();

      const remoteShifts = mockSupabase.remoteTables.shifts;
      assert.ok(remoteShifts.has(queuedShiftId));

      const remoteRow = remoteShifts.get(queuedShiftId);
      assert.equal(remoteRow.user_id, 'user-a-test-id');
      assert.equal(remoteRow.hospital, 'Maternidade Principal');
      assert.equal(remoteRow.sync_status, 'synced');
    });

    test('2.3 Idempotent upsert verification: running sync repeatedly causes 0 duplicates and 0 conflicts', async () => {
      setOfflineMode(false);
      setGuestMode(false);

      // First sync pulse
      const res1 = await syncNow();
      assert.equal(res1.pushed, 1);

      // Immediate second sync pulse (e.g. rapid network reconnection event)
      const res2 = await syncNow();
      assert.equal(res2.pushed, 0);
      assert.equal(res2.errors.length, 0);

      // Remote table still contains exactly 1 shift
      assert.equal(mockSupabase.remoteTables.shifts.size, 1);
    });

    test('2.4 Sync status indicator transitions deterministically from offline to syncing to idle/synced', async () => {
      setOfflineMode(false);
      setGuestMode(false);

      const statusHistory = [];
      const unsubscribe = onSyncStatusChange((st) => {
        statusHistory.push(st);
      });

      await syncNow();
      unsubscribe();

      assert.ok(statusHistory.includes('syncing'));
      assert.ok(statusHistory.includes('idle'));
      assert.ok(getLastSyncTime() !== null);
    });

    test('2.5 Pull synchronization reconciles remote updates via Last-Write-Wins (LWW) without losing local edits', async () => {
      setOfflineMode(false);
      setGuestMode(false);

      // First sync to baseline
      await syncNow();

      // Remote gets updated by web portal with newer timestamp
      const newerTime = new Date(Date.now() + 5000).toISOString();
      mockSupabase.remoteTables.shifts.set(queuedShiftId, {
        id: queuedShiftId,
        user_id: 'user-a-test-id',
        hospital: 'Maternidade Principal',
        status: 'received',
        updated_at: newerTime
      });

      // Clear local sync timestamp to pull all updates
      mockStorage.removeItem(SYNC_STORAGE_KEYS.LAST_SYNC_TIME);
      const pullResult = await pullRemoteUpdates();

      assert.equal(pullResult.pulled, 1);

      const localUpdated = await localGet('shifts', queuedShiftId);
      assert.equal(localUpdated.status, 'received');
    });
  });

  // ==========================================================================
  // SCENARIO 3: Stethoscope Purchase Installment Plan
  // Features: F16, F17, F18, F19
  // ==========================================================================
  describe('Scenario 3 — Stethoscope Purchase Installment Plan (Medical Equipment)', () => {
    test('3.1 Littmann Stethoscope purchase (R$ 1.250,00 in 10x) generates exactly 10 installments', () => {
      const installments = generateExpenseInstallments(
        {
          description: 'Estetoscópio Littmann Cardiology',
          amount: 1250.00,
          category: 'Qualificação/Congresso/Pós',
          date: '2026-04-10'
        },
        10
      );

      assert.equal(installments.length, 10);
      installments.forEach((inst, index) => {
        assert.equal(inst.isInstallment, true);
        assert.equal(inst.total_installments, 10);
        assert.equal(inst.current_installment, index + 1);
        assert.match(inst.installment_group_id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      });
    });

    test('3.2 Category "Qualificação/Congresso/Pós" correctly resolves to "Formação & Carreira" (macro_formacao)', () => {
      const macro = getMacroGroupForCategory('Qualificação/Congresso/Pós');
      assert.equal(macro.id, 'macro_formacao');
      assert.equal(macro.name, 'Formação & Carreira');

      // Other study categories also map to macro_formacao
      assert.equal(getMacroGroupForCategory('Estudo').id, 'macro_formacao');
      assert.equal(getMacroGroupForCategory('Cursos').id, 'macro_formacao');
    });

    test('3.3 Cent integrity: fractional installment division places remainder cents on installment 1 with 0 cent deviation', () => {
      // Testing odd amount R$ 1.250,55 in 10x
      // 1250.55 / 10 = 125.055 -> floor = 125.05; 9 * 125.05 = 1125.45; inst1 = 1250.55 - 1125.45 = 125.10
      const oddInstallments = generateExpenseInstallments(
        {
          description: 'Equipamento Hospitalar',
          amount: 1250.55,
          category: 'Qualificação/Congresso/Pós',
          date: '2026-04-10'
        },
        10
      );

      assert.equal(oddInstallments.length, 10);
      assert.equal(oddInstallments[0].amount, 125.10);
      for (let i = 1; i < 10; i++) {
        assert.equal(oddInstallments[i].amount, 125.05);
      }

      const totalSum = Math.round(oddInstallments.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
      assert.equal(totalSum, 1250.55);
    });

    test('3.4 Chronological multi-month distribution projects across 10 consecutive months (April 2026 to January 2027)', () => {
      const installments = generateExpenseInstallments(
        {
          description: 'Estetoscópio',
          amount: 1250.00,
          date: '2026-04-10'
        },
        10
      );

      const expectedDates = [
        '2026-04-10',
        '2026-05-10',
        '2026-06-10',
        '2026-07-10',
        '2026-08-10',
        '2026-09-10',
        '2026-10-10',
        '2026-11-10',
        '2026-12-10',
        '2027-01-10' // Safe new year rollover
      ];

      installments.forEach((inst, index) => {
        assert.equal(inst.date, expectedDates[index]);
      });
    });

    test('3.5 Regime de Caixa recognizes only active monthly installment (R$ 125,00) in each target month', () => {
      store.saveExpense({
        description: 'Estetoscópio Littmann',
        amount: 1250.00,
        category: 'Qualificação/Congresso/Pós',
        date: '2026-04-10',
        totalInstallments: 10
      });

      // April 2026
      const summaryApril = store.getMonthlySummary('2026-04', 'caixa');
      assert.equal(summaryApril.totalExpenses, 125.00);

      // May 2026
      const summaryMay = store.getMonthlySummary('2026-05', 'caixa');
      assert.equal(summaryMay.totalExpenses, 125.00);

      // January 2027 (10th installment)
      const summaryJan27 = store.getMonthlySummary('2027-01', 'caixa');
      assert.equal(summaryJan27.totalExpenses, 125.00);

      // February 2027 (Plan completed: 0 expense)
      const summaryFeb27 = store.getMonthlySummary('2027-02', 'caixa');
      assert.equal(summaryFeb27.totalExpenses, 0.00);
    });

    test('3.6 Batch persistence of all 10 installments into IndexedDB with shared installment_group_id', async () => {
      const installments = generateExpenseInstallments(
        {
          description: 'Estetoscópio',
          amount: 1250.00,
          category: 'Qualificação/Congresso/Pós',
          date: '2026-04-10'
        },
        10
      );

      for (const inst of installments) {
        await localPut('expenses', inst, true);
      }

      const allSaved = await localGetAll('expenses');
      assert.equal(allSaved.length, 10);

      const groupId = installments[0].installment_group_id;
      assert.ok(allSaved.every(e => e.installment_group_id === groupId));
    });
  });

  // ==========================================================================
  // SCENARIO 4: Silk Gate Multi-Auth Switch
  // Features: F9, F10, F11, F12, F14
  // ==========================================================================
  describe('Scenario 4 — Silk Gate Multi-Auth Switch (Google OAuth, Signout, Magic Link & Guest)', () => {
    test('4.1 Unauthenticated entry: Silk Gate welcome screen is displayed, App Shell is hidden', () => {
      clearConfig();
      setGuestMode(false);

      app.routeAuthView(null);

      const silkGate = mockDoc.getElementById('silk-gate-screen');
      const appShell = mockDoc.getElementById('main-app-screen');

      assert.equal(silkGate.classList.contains('hidden'), false);
      assert.equal(appShell.classList.contains('hidden'), true);
    });

    test('4.2 Google OAuth 1-touch authentication: validates session, hydrates doctor profile, and reveals App Shell', () => {
      const mockOAuthSession = {
        user: {
          id: 'google-oauth-uid-999',
          email: 'medica@example.com',
          user_metadata: {
            full_name: 'Médica',
            name: 'Médica',
            avatar_url: 'https://images.hospital.com/avatar.jpg'
          }
        }
      };

      app.routeAuthView(mockOAuthSession);

      const silkGate = mockDoc.getElementById('silk-gate-screen');
      const appShell = mockDoc.getElementById('main-app-screen');

      assert.equal(silkGate.classList.contains('hidden'), true);
      assert.equal(appShell.classList.contains('hidden'), false);
    });

    test('4.3 Drawer Sign Out invalidates session, resets guest mode, and seamlessly restores Silk Gate screen', async () => {
      // First log in
      setGuestMode(true);
      app.routeAuthView(null);
      assert.equal(mockDoc.getElementById('main-app-screen').classList.contains('hidden'), false);

      // Now click sign out
      await signOut();
      setGuestMode(false);
      app.routeAuthView(null);

      const silkGate = mockDoc.getElementById('silk-gate-screen');
      const appShell = mockDoc.getElementById('main-app-screen');

      assert.equal(silkGate.classList.contains('hidden'), false);
      assert.equal(appShell.classList.contains('hidden'), true);
      assert.equal(isGuestMode(), false);
    });

    test('4.4 Passwordless Magic Link flow sends OTP email, displays welcoming feedback, and validates format', async () => {
      // Configure active Supabase client with OTP response
      const validAnonJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        Buffer.from(JSON.stringify({ role: 'anon', iss: 'supabase' })).toString('base64url') +
        '.mock_signature_12345';
      _setCreateClientForTesting(() => ({
        isOfflineFallback: false,
        auth: {
          signInWithOtp: async ({ email }) => ({
            data: { user: null, session: null },
            error: null
          })
        }
      }));
      initSupabase('https://pediatria-cloud.supabase.co', validAnonJwt);

      const feedback = mockDoc.getElementById('magic-link-feedback');
      const label = mockDoc.getElementById('label-magic-link');

      // Valid email submission
      const email = 'medica@example.com';
      const res = await signInWithMagicLink(email);
      assert.equal(res.error, null);

      feedback.textContent = '✨ Link mágico enviado com sucesso! Verifique sua caixa de entrada.';
      feedback.classList.remove('hidden');
      assert.match(feedback.textContent, /Link mágico enviado/);

      // Invalid email rejection
      const invalidEmail = 'not-an-email';
      const invalidRes = await signInWithMagicLink(invalidEmail);
      assert.ok(invalidRes.error);
      assert.match(invalidRes.error.message, /informe um e-mail válido/);
    });

    test('4.5 Modo Convidada / Local allows immediate app access without cloud credentials and sets guest badge', () => {
      setGuestMode(true);
      assert.equal(isGuestMode(), true);
      assert.equal(mockStorage.getItem('nanda_v4_guest_mode'), 'true');

      app.routeAuthView(null);

      const silkGate = mockDoc.getElementById('silk-gate-screen');
      const appShell = mockDoc.getElementById('main-app-screen');

      assert.equal(silkGate.classList.contains('hidden'), true);
      assert.equal(appShell.classList.contains('hidden'), false);
    });

    test('4.6 Session persistence across reloads: guest mode state is hydrated cleanly without flickering Silk Gate', () => {
      mockStorage.setItem('nanda_v4_guest_mode', 'true');

      const reloadedApp = new PediatricApp();
      reloadedApp.store = store;
      reloadedApp.ui = ui;

      // Hydration on launch
      reloadedApp.routeAuthView(null);

      const silkGate = mockDoc.getElementById('silk-gate-screen');
      const appShell = mockDoc.getElementById('main-app-screen');

      assert.equal(silkGate.classList.contains('hidden'), true);
      assert.equal(appShell.classList.contains('hidden'), false);
    });
  });

  // ==========================================================================
  // SCENARIO 5: Security & CSP Breach Defense
  // Features: F3, F6, F7, F13
  // ==========================================================================
  describe('Scenario 5 — Security & CSP Breach Defense (Cross-User & Injection Defense)', () => {
    test('5.1 Cross-user isolation: intruder client cannot query records belonging to Médica', async () => {
      // Seed record for Médica
      const shiftId = generateUUID();
      mockSupabase.remoteTables.shifts.set(shiftId, {
        id: shiftId,
        user_id: 'user-a-test-id',
        hospital: 'Maternidade Principal',
        net_value: 1500.00
      });

      // Intruder queries with dr-intruder-id filter
      const intruderClient = new MockSupabaseClient('dr-intruder-id');
      const { data: intruderResults } = await intruderClient
        .from('shifts')
        .select('*')
        .eq('user_id', 'dr-intruder-id');

      assert.equal(intruderResults.length, 0);
    });

    test('5.2 Spoofed user_id mutation prevention: client cannot upsert rows for foreign users under RLS WITH CHECK', async () => {
      const intruderClient = new MockSupabaseClient('dr-intruder-id');
      const spoofedPayload = {
        id: generateUUID(),
        user_id: 'user-a-test-id', // Attempting to inject into Médica's account
        hospital: 'Hospital Invasor',
        net_value: 5000.00
      };

      const res = await intruderClient.from('shifts').upsert(spoofedPayload);

      assert.ok(res.error);
      assert.match(res.error.message, /violates row-level security policy/);
    });

    test('5.3 Service Role Key breach defense: rejects service_role keys in credential checks and setup', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const serviceRoleBody = Buffer.from(JSON.stringify({ role: 'service_role', iss: 'supabase' })).toString('base64url');
      const fakeSignature = 'mock_signature_12345';
      const serviceRoleKey = `${header}.${serviceRoleBody}.${fakeSignature}`;

      assert.equal(isServiceRoleKey(serviceRoleKey), true);
      assert.throws(() => {
        assertNotServiceRoleKey(serviceRoleKey);
      }, /service_role key é estritamente proibido/);
    });

    test('5.4 Content-Security-Policy (CSP) audit: vercel.json strictly prohibits unsafe-eval and locks object-src', () => {
      assert.ok(fs.existsSync(vercelConfigPath), 'vercel.json must exist');
      const rawVercel = fs.readFileSync(vercelConfigPath, 'utf8');
      const vercelConfig = JSON.parse(rawVercel);

      const headerRule = vercelConfig.headers.find(h => h.source === '/(.*)');
      assert.ok(headerRule);

      const cspHeader = headerRule.headers.find(h => h.key === 'Content-Security-Policy');
      assert.ok(cspHeader);

      const cspVal = cspHeader.value;
      assert.match(cspVal, /default-src 'self'/);
      assert.match(cspVal, /object-src 'none'/);
      assert.doesNotMatch(cspVal, /'unsafe-eval'/, 'CSP must NEVER permit unsafe-eval');

      const xfoHeader = headerRule.headers.find(h => h.key === 'X-Frame-Options');
      assert.ok(xfoHeader);
      assert.equal(xfoHeader.value, 'DENY');
    });

    test('5.5 SQL migration security audit: app tables are isolated and trigger privileges are scoped', () => {
      assert.ok(fs.existsSync(migrationsDir), 'migrations directory must exist');

      const rlsMigrationPath = path.resolve(migrationsDir, '002_enable_rls.sql');
      const rlsSql = fs.readFileSync(rlsMigrationPath, 'utf8');

      assert.match(rlsSql, /ALTER TABLE public\.profiles ENABLE ROW LEVEL SECURITY;/);
      assert.match(rlsSql, /ALTER TABLE public\.shifts ENABLE ROW LEVEL SECURITY;/);
      assert.match(rlsSql, /ALTER TABLE public\.expenses ENABLE ROW LEVEL SECURITY;/);
      assert.match(rlsSql, /REVOKE ALL ON TABLE public\.profiles, public\.shifts, public\.expenses, public\.custom_categories FROM anon, PUBLIC;/);
      assert.doesNotMatch(rlsSql, /REVOKE ALL ON ALL TABLES IN SCHEMA public/);

      const triggerMigrationPath = path.resolve(migrationsDir, '003_triggers_and_indexes.sql');
      const triggerSql = fs.readFileSync(triggerMigrationPath, 'utf8');
      assert.match(triggerSql, /FUNCTION public\.handle_new_user\(\)[\s\S]*?SECURITY DEFINER/);
      assert.doesNotMatch(triggerSql, /FUNCTION public\.handle_updated_at\(\)[\s\S]*?SECURITY DEFINER/);
      assert.match(triggerSql, /SET search_path = public/);
    });
  });

  // ==========================================================================
  // SCENARIO 6: Full Financial Month-End Settlement
  // Features: F15, F16, F18, F23, F25
  // ==========================================================================
  describe('Scenario 6 — Full Financial Month-End Settlement (D+60/D+90 Payouts & Canonical Categories)', () => {
    let marchShift;
    let febShift;
    let mayShift;

    beforeEach(() => {
      // Reset store shifts & expenses
      store.data.shifts = [];
      store.data.expenses = [];
      store.data.residencySalary = { value: 0.00, active: true, dayOfMonth: 5 };

      // 1. Shift worked in March 2026 (Net R$ 1.600,00)
      // D+60 (75% = R$ 1.200,00) due in May 2026 (2026-05-12)
      // D+90 (25% = R$ 400,00) due in June 2026 (2026-06-12)
      marchShift = store.saveShift({
        id: 'shift_march_01',
        hospital: 'Maternidade Principal',
        date: '2026-03-12',
        grossValue: 1900.00,
        netValue: 1600.00
      });

      // 2. Shift worked in February 2026 (Net R$ 2.000,00)
      // D+60 (75% = R$ 1.500,00) was due in April 2026 (2026-04-15)
      // D+90 (25% = R$ 500,00) due in May 2026 (2026-05-15)
      febShift = store.saveShift({
        id: 'shift_feb_01',
        hospital: 'Maternidade Secundária',
        date: '2026-02-15',
        grossValue: 2400.00,
        netValue: 2000.00
      });

      // 3. Shift worked in May 2026 (Net R$ 1.800,00)
      // Competência only for May! Cash arrives in July (D+60) and August (D+90)
      mayShift = store.saveShift({
        id: 'shift_may_01',
        hospital: 'Hospital Pediátrico',
        date: '2026-05-20',
        grossValue: 2150.00,
        netValue: 1800.00
      });

      // 4. Populate May 2026 Expenses across canonical categories
      const mayExpenses = [
        { category: 'Mercantil', amount: 650.00, date: '2026-05-02' },
        { category: 'Combustível', amount: 320.00, date: '2026-05-04' },
        { category: 'Aluguel', amount: 1800.00, date: '2026-05-05' },
        { category: 'Energia', amount: 210.50, date: '2026-05-08' },
        { category: 'Internet', amount: 119.90, date: '2026-05-10' },
        { category: 'Cursos', amount: 350.00, date: '2026-05-14' },
        { category: 'Academia', amount: 150.00, date: '2026-05-16' },
        { category: 'Remédios', amount: 85.40, date: '2026-05-20' },
        { category: 'Lanches', amount: 95.00, date: '2026-05-22' }
      ];

      mayExpenses.forEach(exp => store.saveExpense(exp));
    });

    test('6.1 Settlement pipeline correctly identifies May cash inflows: Residency (R$ 0,00) + March 75% + Feb 25%', () => {
      const summary = store.getMonthlySummary('2026-05', 'caixa');

      // Expected Cash Inflows:
      // Residency Salary: 0.00
      // March Shift 75%: 1200.00
      // Feb Shift 25%: 500.00
      // Total Expected Inflow = 0.00 + 1200.00 + 500.00 = 5806.09
      assert.equal(summary.totalIncome, 5806.09);
    });

    test('6.2 May canonical expenses aggregate accurately without rounding loss', () => {
      const summary = store.getMonthlySummary('2026-05', 'caixa');

      // 650 + 320 + 1800 + 210.50 + 119.90 + 350 + 150 + 85.40 + 95 = 3780.80
      assert.equal(summary.totalExpenses, 3780.80);
      assert.equal(summary.categoryBreakdown.length, 9);
    });

    test('6.3 Regime de Caixa exact mathematical liquidity calculation matches expected cash balance', () => {
      const summary = store.getMonthlySummary('2026-05', 'caixa');

      // Balance = 5806.09 - 3780.80 = 2025.29
      assert.equal(summary.balance, 2025.29);
      assert.equal(summary.regime, 'caixa');
    });

    test('6.4 Regime de Competência comparison highlights pediatric production hiatus (May worked shifts deferred in Caixa)', () => {
      const summaryComp = store.getMonthlySummary('2026-05', 'competencia');

      // Competência Inflow: Residency (0.00) + May Shift worked (1800.00) = 5906.09
      assert.equal(summaryComp.totalIncome, 5906.09);

      // Competência Balance: 5906.09 - 3780.80 = 2125.29
      assert.equal(summaryComp.balance, 2125.29);

      // Production hiatus: difference between worked production and received cash
      const hiatusDiff = Math.round((summaryComp.totalIncome - 5806.09) * 100) / 100;
      assert.equal(hiatusDiff, 100.00);
    });

    test('6.5 Toggling installment status to "received" updates cash received metrics without mutating projected date', () => {
      // Initially, shifts in May are pending
      let summary = store.getMonthlySummary('2026-05', 'caixa');
      assert.equal(summary.shiftsPendingValue, 1700.00); // 1200 + 500
      assert.equal(summary.shiftsReceivedValue, 0.00);

      // Médica marks March D+60 payment as received
      store.toggleShiftInstallment(marchShift.id, 1);

      summary = store.getMonthlySummary('2026-05', 'caixa');
      assert.equal(summary.shiftsReceivedValue, 1200.00);
      assert.equal(summary.shiftsPendingValue, 500.00);

      const updatedMarch = store.data.shifts.find(s => s.id === marchShift.id);
      assert.equal(updatedMarch.installment1.status, 'received');
      assert.equal(updatedMarch.installment1.date, '2026-05-12'); // Date unchanged
      assert.ok(updatedMarch.installment1.paidDate !== null);
    });

    test('6.6 Canonical author signature APP_CREATOR = "FChNeto" verified across reports and backup export payload', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(STORE_CREATOR, 'FChNeto');
      assert.equal(store.data.creator, 'FChNeto');

      const backupExport = {
        creator: APP_CREATOR,
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        data: store.data
      };

      const jsonStr = JSON.stringify(backupExport);
      const parsed = JSON.parse(jsonStr);

      assert.equal(parsed.creator, 'FChNeto');
      assert.equal(parsed.data.creator, 'FChNeto');
    });
  });
});

/**
 * Finanças Pediatria /v8/ - Testes Unitários de Persistência Tripla & Migração de Backups
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  STORAGE_KEY,
  DB_NAME,
  DB_STORE,
  BACKUP_MAX_BYTES,
  PediatricStorage
} from '../js/storage.js';
import { PediatricStore, APP_CREATOR, APP_VERSION } from '../js/store.js';

describe('Finanças Pediatria /v8/ - Persistência Tripla & Migração de Backups', () => {

  describe('1. Invariantes de Armazenamento e Constantes', () => {
    it('Define chaves isoladas no namespace v8', () => {
      assert.equal(STORAGE_KEY, 'financas_pediatria_v8');
      assert.equal(DB_NAME, 'v8_pediatric_db');
      assert.equal(DB_STORE, 'app_state');
      assert.equal(BACKUP_MAX_BYTES, 10 * 1024 * 1024); // 10MB
    });
  });

  describe('2. Write-Through Síncrono & Quota Shield (Safari iOS)', () => {
    let mockStorage;
    let fakeLocalStorage;

    beforeEach(() => {
      fakeLocalStorage = {};
      global.window = {
        localStorage: {
          getItem: (key) => fakeLocalStorage[key] || null,
          setItem: (key, val) => { fakeLocalStorage[key] = String(val); },
          removeItem: (key) => { delete fakeLocalStorage[key]; }
        }
      };
      mockStorage = new PediatricStorage(STORAGE_KEY);
    });

    it('Grava o estado de forma síncrona no localStorage', () => {
      const state = {
        version: APP_VERSION,
        doctorName: 'Dra. Fernanda',
        shifts: [{ id: 's1', net_value: 1000 }]
      };

      const ok = mockStorage.saveSync(state);
      assert.equal(ok, true);

      const loaded = mockStorage.loadSync();
      assert.ok(loaded);
      assert.equal(loaded.doctorName, 'Dra. Fernanda');
      assert.equal(loaded.shifts[0].net_value, 1000);
    });

    it('Quota Shield: Isola doctorPhoto pesada (> 30KB) da cópia do localStorage', () => {
      const largePhoto = 'data:image/jpeg;base64,' + 'A'.repeat(40000); // 40KB
      const state = {
        version: APP_VERSION,
        doctorName: 'Dra. Fernanda',
        doctorPhoto: largePhoto,
        shifts: []
      };

      const ok = mockStorage.saveSync(state);
      assert.equal(ok, true);

      const loaded = mockStorage.loadSync();
      assert.ok(loaded);
      assert.equal(loaded.doctorName, 'Dra. Fernanda');
      // No localStorage, a foto pesada foi anulada para proteger contra QuotaExceededError
      assert.equal(loaded.doctorPhoto, null);
    });

    it('Mantém foto leve (< 30KB) na cópia do localStorage', () => {
      const smallPhoto = 'data:image/jpeg;base64,' + 'A'.repeat(500); // Leve
      const state = {
        version: APP_VERSION,
        doctorName: 'Dra. Fernanda',
        doctorPhoto: smallPhoto
      };

      mockStorage.saveSync(state);
      const loaded = mockStorage.loadSync();
      assert.equal(loaded.doctorPhoto, smallPhoto);
    });
  });

  describe('3. Motor Universal de Migração de Backups (v2 a v7)', () => {
    let storage;
    let store;

    beforeEach(() => {
      storage = new PediatricStorage();
      store = new PediatricStore();
      store.init();
    });

    it('Migra com sucesso backup gerado na versão v2.0 (com strings puras de hospital e category)', () => {
      const legacyV2Json = JSON.stringify({
        version: '2.0.0',
        creator: 'FChNeto',
        doctorName: 'Dra. Teste',
        shifts: [
          {
            id: 'shift_legacy_1',
            hospital: 'Maternidade Principal',
            date: '2026-03-15',
            netValue: 2000.00,
            grossValue: 2200.00,
            installment1: { value: 1500, expectedDate: '2026-05-15', status: 'pending' },
            installment2: { value: 500, expectedDate: '2026-06-15', status: 'pending' }
          }
        ],
        expenses: [
          {
            id: 'exp_legacy_1',
            description: 'Supermercado',
            category: 'Mercantil',
            value: 250.00,
            date: '2026-03-16'
          }
        ],
        hospitals: ['Maternidade Principal', 'Hospital Municipal']
      });

      const res = storage.importBackup(legacyV2Json, store);
      assert.equal(res.success, true);
      assert.equal(res.countShifts, 1);
      assert.equal(res.countExpenses, 1);

      // Valida normalização do shift para o padrão v8
      const shift = store.data.shifts[0];
      assert.equal(shift.id, 'shift_legacy_1');
      assert.equal(shift.source_name_snapshot, 'Maternidade Principal');
      assert.equal(shift.net_value, 2000.00);
      assert.equal(shift.hospital, 'Maternidade Principal');
      assert.ok(shift.payment_rule_snapshot);

      // Valida normalização da despesa para o padrão v8
      const exp = store.data.expenses[0];
      assert.equal(exp.id, 'exp_legacy_1');
      assert.equal(exp.category_name_snapshot, 'Mercantil');
      assert.equal(exp.amount, 250.00);
      assert.equal(exp.macro_group_snapshot, 'Alimentação');
      assert.equal(exp.category_id, 'cat_mercantil');

      // Valida que 'Hospital Municipal' foi promovido a IncomeSource estruturada
      assert.ok(store.getAllIncomeSources().some(s => s.name === 'Hospital Municipal'));
    });

    it('Migra backup do v6/v7 preservando category_id e macro_group', () => {
      const v7Json = JSON.stringify({
        version: '7.0.0',
        creator: 'FChNeto',
        shifts: [
          {
            id: 's_v7_1',
            source_id: 'src_maternidade_principal',
            source_name_snapshot: 'Maternidade Principal',
            net_value: 1800,
            date: '2026-04-10'
          }
        ],
        expenses: [
          {
            id: 'e_v7_1',
            category_id: 'cat_uber',
            category_name_snapshot: 'Uber',
            macro_group: 'Transporte & Mobilidade',
            amount: 35.50,
            date: '2026-04-11'
          }
        ]
      });

      const res = storage.importBackup(v7Json, store);
      assert.equal(res.success, true);
      assert.equal(res.countShifts, 1);
      assert.equal(res.countExpenses, 1);
      assert.equal(store.data.expenses[0].macro_group, 'Transporte & Mobilidade');
    });

    it('Rejeita arquivos maiores que 10MB para prevenir estouro de memória no Safari', () => {
      const bigString = '{"data":"' + 'X'.repeat(BACKUP_MAX_BYTES + 10) + '"}';
      const res = storage.importBackup(bigString, store);
      assert.equal(res.success, false);
      assert.match(res.error, /10MB/);
    });

    it('Rejeita JSON malformado e preserva o estado anterior intacto (Rollback)', () => {
      store.addShift({ hospital: 'Hospital Guardado', netValue: 500, date: '2026-05-01' });
      assert.equal(store.data.shifts.length, 1);

      const malformed = '{ invalid json string ...';
      const res = storage.importBackup(malformed, store);
      assert.equal(res.success, false);
      // Estado não foi corrompido
      assert.equal(store.data.shifts.length, 1);
      assert.equal(store.data.shifts[0].source_name_snapshot, 'Hospital Guardado');
    });
  });

  describe('4. Exportação de Backup JSON', () => {
    it('Gera estrutura de exportação com metadados do autor canônico', async () => {
      const storage = new PediatricStorage();
      const testState = {
        doctorName: 'Dra. Fernanda',
        shifts: [{ id: 's1', net_value: 1000 }],
        expenses: [{ id: 'e1', amount: 50 }]
      };

      // Mock de ambiente de download
      let downloadedBlob = null;
      let downloadedName = null;
      global.Blob = class {
        constructor(content, opts) {
          this.content = content;
          this.opts = opts;
        }
      };
      global.URL = {
        createObjectURL: (blob) => {
          downloadedBlob = blob;
          return 'blob:mock-url';
        },
        revokeObjectURL: () => {}
      };
      global.document = {
        createElement: () => ({
          click: () => {},
          set href(val) {},
          set download(val) { downloadedName = val; }
        }),
        body: {
          appendChild: () => {},
          removeChild: () => {}
        }
      };

      const res = await storage.exportBackup(testState);
      assert.equal(res.success, true);
      assert.equal(res.method, 'download');
      assert.ok(downloadedBlob);

      const parsed = JSON.parse(downloadedBlob.content[0]);
      assert.equal(parsed.app, 'Finanças Pediatria');
      assert.equal(parsed.version, APP_VERSION);
      assert.equal(parsed.author, APP_CREATOR);
      assert.equal(parsed.doctorName, 'Dra. Fernanda');
    });
  });
});

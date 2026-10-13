/**
 * v7_sync_and_conflict_resolution.test.js
 * Test Suite: Sync Engine, Optimistic Locking & Conflict Resolution for Finanças Pediatria v7
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  APP_CREATOR,
  APP_VERSION
} from '../js/config.js';

import {
  loadUserState,
  saveUserState,
  syncRelationalTables,
  _setCloudStateClientForTesting,
  _resetCloudStateForTesting
} from '../js/cloudState.js';

import {
  PediatricStore,
  STORAGE_KEY,
  STORAGE_KEY_LEGACY,
  DB_NAME
} from '../js/store.js';

describe('Finanças Pediatria v7 - Sync & Conflict Resolution Suite', () => {

  let mockSupabaseRows = new Map();
  let mockRelationalTables = {
    custom_categories: [],
    shifts: [],
    expenses: []
  };

  function createMockSupabaseClient() {
    return {
      isOfflineFallback: false,
      from(tableName) {
        if (tableName === 'user_app_state') {
          return {
            select(columns) {
              return {
                eq(col1, val1) {
                  return {
                    maybeSingle: async () => {
                      const row = mockSupabaseRows.get(val1);
                      return { data: row || null, error: null };
                    }
                  };
                }
              };
            },
            insert(payload) {
              return {
                select(cols) {
                  return {
                    maybeSingle: async () => {
                      if (mockSupabaseRows.has(payload.user_id)) {
                        return { data: null, error: { code: '23505', message: 'duplicate key' } };
                      }
                      const newRow = { ...payload, created_at: new Date().toISOString() };
                      mockSupabaseRows.set(payload.user_id, newRow);
                      return { data: { revision: newRow.revision, updated_at: newRow.updated_at }, error: null };
                    }
                  };
                }
              };
            },
            update(updates) {
              return {
                eq(col1, userId) {
                  return {
                    eq(col2, expectedRev) {
                      return {
                        select(cols) {
                          return {
                            maybeSingle: async () => {
                              const existing = mockSupabaseRows.get(userId);
                              if (!existing || existing.revision !== expectedRev) {
                                return { data: null, error: null }; // optimistic lock mismatch
                              }
                              const updated = {
                                ...existing,
                                ...updates,
                                updated_at: updates.updated_at || new Date().toISOString()
                              };
                              mockSupabaseRows.set(userId, updated);
                              return { data: { revision: updated.revision, updated_at: updated.updated_at }, error: null };
                            }
                          };
                        }
                      };
                    }
                  };
                }
              };
            }
          };
        }

        // Relational tables mock
        if (['custom_categories', 'shifts', 'expenses'].includes(tableName)) {
          return {
            upsert: async (rows) => {
              mockRelationalTables[tableName].push(...rows);
              return { error: null };
            }
          };
        }

        throw new Error(`Unexpected table ${tableName}`);
      }
    };
  }

  beforeEach(() => {
    mockSupabaseRows.clear();
    mockRelationalTables = { custom_categories: [], shifts: [], expenses: [] };
    _setCloudStateClientForTesting(createMockSupabaseClient());
  });

  afterEach(() => {
    _resetCloudStateForTesting();
  });

  describe('1. Revision-based Optimistic Locking', () => {

    test('Initial save creates revision 1 when cloud state is empty', async () => {
      const userId = 'user-test-v7-1';
      const initialPayload = {
        doctorName: 'Dra. Médica v7',
        shifts: [],
        expenses: []
      };

      const result = await saveUserState(userId, initialPayload, null);
      assert.equal(result.saved, true);
      assert.equal(result.revision, 1);
      assert.ok(result.updatedAt);

      const saved = mockSupabaseRows.get(userId);
      assert.ok(saved);
      assert.equal(saved.revision, 1);
      assert.equal(saved.state.doctorName, 'Dra. Médica v7');
    });

    test('Concurrent conflict detected when client revision is stale', async () => {
      const userId = 'user-test-v7-2';
      // Seed remote row at revision 3
      mockSupabaseRows.set(userId, {
        user_id: userId,
        revision: 3,
        state: { doctorName: 'Dra. Remota' },
        updated_at: '2026-10-13T12:00:00Z'
      });

      // Local client attempts update believing it is at revision 2
      const stalePayload = { doctorName: 'Dra. Local Stale' };
      const result = await saveUserState(userId, stalePayload, 2);

      assert.equal(result.saved, false);
      assert.equal(result.conflict, true);
      assert.equal(result.revision, 3);
      assert.equal(result.state.doctorName, 'Dra. Remota');
    });
  });

  describe('2. Background Relational Persistence Bridge', () => {

    test('syncRelationalTables asynchronously populates normalized tables with category_id', async () => {
      const userId = 'user-relational-v7';
      const fullState = {
        customCategories: [
          { id: 'cat_custom1', name: 'Congresso Especial', macroGroup: 'macro_formacao', color: '#ff0000', icon: 'book' }
        ],
        shifts: [
          { id: 's1', hospital: 'Hospital A', date: '2026-03-01', netValue: 2000 }
        ],
        expenses: [
          {
            id: 'e1',
            description: 'Inscrição',
            amount: 500,
            date: '2026-03-02',
            category: 'Congresso Especial',
            category_id: 'cat_custom1'
          }
        ]
      };

      const syncResult = await syncRelationalTables(userId, fullState);
      assert.equal(syncResult.success, true);
      assert.equal(mockRelationalTables.custom_categories.length, 1);
      assert.equal(mockRelationalTables.shifts.length, 1);
      assert.equal(mockRelationalTables.expenses.length, 1);
      assert.equal(mockRelationalTables.expenses[0].category_id, 'cat_custom1');
    });
  });

  describe('3. Local Storage Isolation & Namespace Shielding', () => {

    test('v7 store uses dedicated v7 storage keys and DB name', () => {
      assert.equal(STORAGE_KEY, 'v7_pediatric_store');
      assert.equal(STORAGE_KEY_LEGACY, 'v6_pediatric_store');
      assert.equal(DB_NAME, 'v7_pediatric_db');
    });

    test('Canonical author FChNeto is preserved in cloudState and config', () => {
      assert.equal(APP_CREATOR, 'FChNeto');
      assert.equal(APP_VERSION, '7.0.0');
    });
  });
});

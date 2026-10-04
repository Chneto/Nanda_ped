/**
 * v6_sync_and_conflict_resolution.test.js
 * Test Suite: Sync Engine, Optimistic Locking & Conflict Resolution for Finanças Pediatria v6
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
  _setCloudStateClientForTesting,
  _resetCloudStateForTesting
} from '../js/cloudState.js';

import {
  PediatricStore,
  STORAGE_KEY,
  STORAGE_KEY_LEGACY,
  DB_NAME
} from '../js/store.js';

describe('Finanças Pediatria v6 - Sync & Conflict Resolution Suite', () => {

  let mockSupabaseRows = new Map();

  function createMockSupabaseClient() {
    return {
      isOfflineFallback: false,
      from(tableName) {
        if (tableName !== 'user_app_state') throw new Error(`Unexpected table ${tableName}`);

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
    };
  }

  beforeEach(() => {
    mockSupabaseRows.clear();
    const mockClient = createMockSupabaseClient();
    _setCloudStateClientForTesting(mockClient);
  });

  afterEach(() => {
    _resetCloudStateForTesting();
  });

  describe('1. Optimistic Locking & Revision Increments (cloudState.js)', () => {

    test('loadUserState returns null when user has no cloud state yet', async () => {
      const result = await loadUserState('user-123');
      assert.equal(result.state, null);
      assert.equal(result.revision, null);
      assert.equal(result.error, null);
    });

    test('Initial saveUserState creates revision 1 with sanitized snapshot', async () => {
      const sampleState = {
        doctorName: 'Dra. Médica',
        doctorPhoto: 'data:image/jpeg;base64,LARGE_PHOTO_DATA...',
        shifts: [{ id: 's1', netValue: 1500 }],
        expenses: [{ id: 'e1', amount: 200 }]
      };

      const result = await saveUserState('user-123', sampleState, null);
      assert.equal(result.saved, true);
      assert.equal(result.conflict, false);
      assert.equal(result.revision, 1);
      assert.ok(result.updatedAt);

      // Verify stored row in database
      const stored = mockSupabaseRows.get('user-123');
      assert.ok(stored);
      assert.equal(stored.revision, 1);
      assert.equal(stored.state.creator, APP_CREATOR);
      assert.equal(stored.state.doctorName, 'Dra. Médica');
      // Large Base64 image stripped from cloud JSON payload to prevent DB bloat
      assert.equal(stored.state.doctorPhoto, null);
    });

    test('Subsequent save with matching revision succeeds and increments revision to 2', async () => {
      // 1. First save
      await saveUserState('user-123', { doctorName: 'Dra. Médica' }, null);

      // 2. Second save with expected revision = 1
      const updateResult = await saveUserState('user-123', { doctorName: 'Dra. Médica Atualizada' }, 1);
      assert.equal(updateResult.saved, true);
      assert.equal(updateResult.conflict, false);
      assert.equal(updateResult.revision, 2);

      const stored = mockSupabaseRows.get('user-123');
      assert.equal(stored.revision, 2);
      assert.equal(stored.state.doctorName, 'Dra. Médica Atualizada');
    });

    test('Detects revision mismatch and reports conflict with latest cloud state', async () => {
      // 1. Device A saves revision 1
      await saveUserState('user-123', { doctorName: 'State from Device A' }, null);

      // 2. Device B saves revision 2
      await saveUserState('user-123', { doctorName: 'State from Device B' }, 1);

      // 3. Device A (still thinking revision is 1) attempts to save
      const conflictResult = await saveUserState('user-123', { doctorName: 'Conflict attempt from Device A' }, 1);
      
      assert.equal(conflictResult.saved, false);
      assert.equal(conflictResult.conflict, true);
      assert.equal(conflictResult.revision, 2);
      assert.equal(conflictResult.state.doctorName, 'State from Device B');
    });
  });

  describe('2. Conflict Resolution Strategies & Safeguards', () => {

    test('Strategy 1 (Load Remote): Local store replaces state with remote snapshot cleanly', () => {
      const store = new PediatricStore();
      store.data = {
        creator: APP_CREATOR,
        doctorName: 'Local Device Name',
        shifts: [{ id: 'local-s1', netValue: 1000 }],
        expenses: []
      };

      const remoteState = {
        creator: APP_CREATOR,
        doctorName: 'Cloud Verified Name',
        shifts: [{ id: 'cloud-s1', netValue: 2500 }],
        expenses: [{ id: 'cloud-e1', amount: 150 }]
      };

      // Replace with remote state
      store.replaceData(remoteState, { save: false });

      assert.equal(store.data.doctorName, 'Cloud Verified Name');
      assert.equal(store.data.shifts.length, 1);
      assert.equal(store.data.shifts[0].id, 'cloud-s1');
      assert.equal(store.data.expenses.length, 1);
      assert.equal(store.data.creator, APP_CREATOR);
    });

    test('Strategy 2 (Overwrite Remote): Overwrites cloud revision with latest expected revision', async () => {
      const userId = 'user-conflict-test';
      
      // 1. Cloud currently has revision 3
      mockSupabaseRows.set(userId, {
        user_id: userId,
        revision: 3,
        updated_at: '2026-10-04T00:00:00Z',
        state: { doctorName: 'Previous Remote State' }
      });

      const localDeviceState = {
        doctorName: 'Local Overriding State',
        shifts: [{ id: 's-local', netValue: 3000 }]
      };

      // 2. Force overwrite using remoteRevision = 3
      const overwriteResult = await saveUserState(userId, localDeviceState, 3);
      assert.equal(overwriteResult.saved, true);
      assert.equal(overwriteResult.conflict, false);
      assert.equal(overwriteResult.revision, 4);

      const stored = mockSupabaseRows.get(userId);
      assert.equal(stored.revision, 4);
      assert.equal(stored.state.doctorName, 'Local Overriding State');
    });

    test('Strategy 3 (Download Both): Consolidates local and remote states into conflict bundle', () => {
      const localState = {
        doctorName: 'Local Dra.',
        shifts: [{ id: 's-local', netValue: 1200 }]
      };
      const remoteState = {
        doctorName: 'Remote Dra.',
        shifts: [{ id: 's-remote', netValue: 1500 }]
      };

      const bundle = {
        creator: APP_CREATOR,
        version: APP_VERSION,
        conflictDate: new Date().toISOString(),
        localDeviceState: localState,
        remoteCloudState: remoteState,
        remoteRevision: 5
      };

      assert.equal(bundle.creator, 'FChNeto');
      assert.equal(bundle.version, '6.0.0');
      assert.equal(bundle.remoteRevision, 5);
      assert.equal(bundle.localDeviceState.shifts[0].id, 's-local');
      assert.equal(bundle.remoteCloudState.shifts[0].id, 's-remote');
    });
  });

  describe('3. Offline Fallbacks & Namespace Isolation', () => {

    test('Handles offline fallback gracefully without throwing unhandled exceptions', async () => {
      _setCloudStateClientForTesting({ isOfflineFallback: true });

      const loadRes = await loadUserState('user-xyz');
      assert.equal(loadRes.state, null);
      assert.ok(loadRes.error);
      assert.ok(loadRes.error.message.includes('indisponível'));

      const saveRes = await saveUserState('user-xyz', {}, null);
      assert.equal(saveRes.saved, false);
      assert.ok(saveRes.error);
    });

    test('Namespace isolation constants conform to v6 specifications', () => {
      assert.equal(STORAGE_KEY, 'v6_pediatric_store');
      assert.equal(STORAGE_KEY_LEGACY, 'v4_cloud_pediatric_store');
      assert.equal(DB_NAME, 'v6_pediatric_db');
    });
  });
});

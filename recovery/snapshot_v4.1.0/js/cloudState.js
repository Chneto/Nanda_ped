/**
 * Per-user cloud snapshot persistence for the V4_Cloud application.
 * Supabase Row Level Security remains the authority for ownership checks.
 */
import { APP_CREATOR } from './config.js';
import { getSupabase } from './supabaseClient.js';

let _testClient = null;

function getClient() {
  return _testClient || getSupabase();
}

function prepareSnapshot(value) {
  const snapshot = JSON.parse(JSON.stringify(value || {}));
  snapshot.creator = APP_CREATOR;
  // Large data URLs belong in local IndexedDB / object storage, never in a JSON snapshot.
  if (typeof snapshot.doctorPhoto === 'string' && snapshot.doctorPhoto.startsWith('data:')) {
    snapshot.doctorPhoto = null;
  }
  return snapshot;
}

export async function loadUserState(userId) {
  if (!userId) return { state: null, revision: null, updatedAt: null, error: new Error('Usuária não identificada.') };
  const client = getClient();
  if (!client || client.isOfflineFallback) {
    return { state: null, revision: null, updatedAt: null, error: new Error('Supabase indisponível neste momento.') };
  }

  try {
    const { data, error } = await client
      .from('user_app_state')
      .select('state, revision, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return { state: null, revision: null, updatedAt: null, error };
    return {
      state: data?.state || null,
      revision: Number.isInteger(data?.revision) ? data.revision : null,
      updatedAt: data?.updated_at || null,
      error: null
    };
  } catch (error) {
    return { state: null, revision: null, updatedAt: null, error };
  }
}

/**
 * Saves only when the stored revision still matches, so one device cannot
 * silently overwrite a newer snapshot from another device.
 */
export async function saveUserState(userId, state, expectedRevision = null) {
  if (!userId) return { saved: false, conflict: false, error: new Error('Usuária não identificada.') };
  const client = getClient();
  if (!client || client.isOfflineFallback) {
    return { saved: false, conflict: false, error: new Error('Supabase indisponível neste momento.') };
  }

  const updatedAt = new Date().toISOString();
  const nextRevision = expectedRevision === null ? 1 : expectedRevision + 1;
  const payload = {
    user_id: userId,
    state: prepareSnapshot(state),
    revision: nextRevision,
    updated_at: updatedAt
  };

  try {
    if (expectedRevision === null) {
      const { data, error } = await client
        .from('user_app_state')
        .insert(payload)
        .select('revision, updated_at')
        .maybeSingle();
      if (!error && data) {
        return { saved: true, conflict: false, revision: data.revision, updatedAt: data.updated_at, error: null };
      }
      if (!error || error.code === '23505') {
        const latest = await loadUserState(userId);
        return { saved: false, conflict: true, ...latest };
      }
      return { saved: false, conflict: false, error };
    }

    const { data, error } = await client
      .from('user_app_state')
      .update({ state: payload.state, revision: nextRevision, updated_at: updatedAt })
      .eq('user_id', userId)
      .eq('revision', expectedRevision)
      .select('revision, updated_at')
      .maybeSingle();
    if (error) return { saved: false, conflict: false, error };
    if (data) {
      return { saved: true, conflict: false, revision: data.revision, updatedAt: data.updated_at, error: null };
    }
    const latest = await loadUserState(userId);
    return { saved: false, conflict: true, ...latest };
  } catch (error) {
    return { saved: false, conflict: false, error };
  }
}

export function _setCloudStateClientForTesting(client) {
  _testClient = client;
}

export function _resetCloudStateForTesting() {
  _testClient = null;
}

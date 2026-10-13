/**
 * Finanças Pediatria v7 - Sincronização em Nuvem (CloudState Engine)
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 * Versão: 7.0.0
 * 
 * Invariantes & Responsabilidades:
 * 1. Persistência de snapshot JSONB com bloqueio otimista por 'revision' incremental.
 * 2. Detecção e resolução transparente de conflitos entre múltiplos dispositivos.
 * 3. Ponte relacional: sincroniza entidades em public.expenses, public.shifts e
 *    public.custom_categories, garantindo consistência relacional e preenchimento de category_id.
 * 4. Isolamento estrito por auth.uid() protegido por Row Level Security (RLS).
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
  snapshot.version = '7.0.0';
  // Fotos grandes pertencem exclusivamente ao IndexedDB local, nunca ao snapshot JSON da nuvem
  if (typeof snapshot.doctorPhoto === 'string' && snapshot.doctorPhoto.startsWith('data:')) {
    snapshot.doctorPhoto = null;
  }
  return snapshot;
}

/**
 * Carrega o estado em nuvem do usuário autenticado
 */
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
 * Sincroniza tabelas relacionais em background para manter integridade com migrations 001-006.
 */
export async function syncRelationalTables(userId, state) {
  const client = getClient();
  if (!client || client.isOfflineFallback || !userId || !state) return;

  try {
    // 1. Sincroniza categorias próprias em public.custom_categories
    if (Array.isArray(state.customCategories) && state.customCategories.length > 0) {
      const catRows = state.customCategories.map(c => ({
        id: c.id,
        user_id: userId,
        name: c.name,
        macro_group: c.macro_group || c.macroGroup || 'Pessoal, Lazer & Outros',
        color: c.color || '#EC407A',
        icon: c.icon || 'tag',
        updated_at: new Date().toISOString()
      }));
      await client.from('custom_categories').upsert(catRows, { onConflict: 'id' });
    }

    // 2. Sincroniza despesas em public.expenses populando category_id
    if (Array.isArray(state.expenses) && state.expenses.length > 0) {
      const expenseRows = state.expenses.slice(0, 500).map(e => ({
        id: e.id,
        user_id: userId,
        description: e.description || e.name || 'Despesa',
        amount: Number(e.amount || e.value || 0),
        date: e.date || new Date().toISOString().slice(0, 10),
        category: e.category || 'Geral',
        category_id: e.category_id || e.categoryId || null,
        total_installments: Number(e.total_installments || e.totalInstallments || 1),
        current_installment: Number(e.current_installment || e.installmentNumber || 1),
        updated_at: new Date().toISOString()
      }));
      await client.from('expenses').upsert(expenseRows, { onConflict: 'id' });
    }

    // 3. Sincroniza plantões em public.shifts
    if (Array.isArray(state.shifts) && state.shifts.length > 0) {
      const shiftRows = state.shifts.slice(0, 500).map(s => ({
        id: s.id,
        user_id: userId,
        hospital: s.hospital || 'Hospital',
        date: s.date || new Date().toISOString().slice(0, 10),
        gross_value: Number(s.gross_value || s.grossValue || s.amount || 0),
        net_value: Number(s.net_value || s.netValue || s.amount || 0),
        installment1_value: Number(s.installment1_value || s.installment1Value || 0),
        installment1_date: s.installment1_date || s.installment1Date || null,
        installment2_value: Number(s.installment2_value || s.installment2Value || 0),
        installment2_date: s.installment2_date || s.installment2Date || null,
        status: s.status || 'confirmed',
        updated_at: new Date().toISOString()
      }));
      await client.from('shifts').upsert(shiftRows, { onConflict: 'id' });
    }
    return { success: true };
  } catch (err) {
    // Falha relacional não bloqueia o snapshot autoritativo principal
    console.warn('[v7 CloudState] Relational sync non-blocking catch:', err);
    return { success: false, error: err };
  }
}

/**
 * Salva com bloqueio otimista por 'revision'.
 * Se houver conflito (outro dispositivo atualizou antes), reporta conflict: true sem sobrescrever.
 */
export async function saveUserState(userId, state, expectedRevision = null) {
  if (!userId) return { saved: false, conflict: false, error: new Error('Usuária não identificada.') };
  const client = getClient();
  if (!client || client.isOfflineFallback) {
    return { saved: false, conflict: false, error: new Error('Supabase indisponível neste momento.') };
  }

  const updatedAt = new Date().toISOString();
  const nextRevision = expectedRevision === null ? 1 : expectedRevision + 1;
  const sanitizedState = prepareSnapshot(state);
  const payload = {
    user_id: userId,
    state: sanitizedState,
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
        // Aciona sincronização relacional em background
        syncRelationalTables(userId, sanitizedState).catch(() => {});
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
      // Aciona sincronização relacional em background
      syncRelationalTables(userId, sanitizedState).catch(() => {});
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

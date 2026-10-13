/**
 * v7_supabase_rls_sql.test.js
 * Test Suite: Supabase Migrations, Schema & RLS Policy Integrity for v7
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v7Dir = path.resolve(__dirname, '..');
const migrationsDir = path.join(v7Dir, 'supabase', 'migrations');

describe('Finanças Pediatria v7 - Supabase SQL & RLS Verification Suite', () => {

  const migrationFiles = [
    '001_initial_schema.sql',
    '002_enable_rls.sql',
    '003_triggers_and_indexes.sql',
    '004_user_app_state.sql',
    '005_categories_and_expenses_category_id.sql',
    '006_v7_unaccent_and_relational_sync.sql'
  ];

  test('All required SQL migration files (001 to 006) exist and are readable', () => {
    for (const file of migrationFiles) {
      const fullPath = path.join(migrationsDir, file);
      assert.ok(fs.existsSync(fullPath), `Migration file ${file} must exist on disk`);
      const content = fs.readFileSync(fullPath, 'utf-8');
      assert.ok(content.length > 50, `Migration file ${file} must not be empty`);
    }
  });

  test('RLS is explicitly enabled on all application tables', () => {
    const combinedSql = migrationFiles
      .map(file => fs.readFileSync(path.join(migrationsDir, file), 'utf-8'))
      .join('\n');

    const expectedTables = [
      'profiles',
      'shifts',
      'expenses',
      'custom_categories',
      'user_app_state'
    ];

    for (const table of expectedTables) {
      const rlsRegex = new RegExp(`ALTER\\s+TABLE\\s+(?:public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
      assert.ok(
        rlsRegex.test(combinedSql),
        `Table public.${table} must have Row Level Security enabled`
      );
    }
  });

  test('Strict user isolation policies enforce auth.uid() = user_id', () => {
    const combinedSql = migrationFiles
      .map(file => fs.readFileSync(path.join(migrationsDir, file), 'utf-8'))
      .join('\n');

    assert.ok(
      combinedSql.includes('auth.uid()') || combinedSql.includes('(SELECT auth.uid())'),
      'RLS policies must enforce auth.uid() checks'
    );

    const appStatePolicyMatch = /CREATE\s+POLICY\s+user_app_state_isolation_policy[\s\S]*?USING\s*\(\(?\s*\(SELECT\s+auth\.uid\(\)\)\s*=\s*user_id\s*\)?\)/i;
    assert.ok(
      appStatePolicyMatch.test(combinedSql),
      'user_app_state must have strict isolation policy with auth.uid() = user_id'
    );
  });

  test('Public and anon access is strictly revoked on private tables', () => {
    const combinedSql = migrationFiles
      .map(file => fs.readFileSync(path.join(migrationsDir, file), 'utf-8'))
      .join('\n');

    const expectedTables = [
      'profiles',
      'shifts',
      'expenses',
      'custom_categories',
      'user_app_state'
    ];

    for (const table of expectedTables) {
      const revokeRegex = new RegExp(`REVOKE\\s+ALL\\s+ON\\s+TABLE\\s+(?:public\\.)?${table}\\s+FROM\\s+anon`, 'i');
      assert.ok(
        revokeRegex.test(combinedSql),
        `Permissions on table public.${table} must be revoked from anon`
      );
    }
  });

  test('Migration 005 and 006 provide category_id, unaccent indexing and relational persistence', () => {
    const m005 = fs.readFileSync(path.join(migrationsDir, '005_categories_and_expenses_category_id.sql'), 'utf-8');
    const m006 = fs.readFileSync(path.join(migrationsDir, '006_v7_unaccent_and_relational_sync.sql'), 'utf-8');

    // 1. Column category_id in expenses
    assert.ok(m005.includes('category_id'), 'Migration 005 must add category_id to expenses');
    assert.ok(m005.includes('idx_expenses_user_category_id'), 'Migration 005 must create index on (user_id, category_id)');

    // 2. Custom categories enhancement
    assert.ok(m005.includes('macro_group'), 'Migration 005 must add macro_group to custom_categories');
    assert.ok(m005.includes('color'), 'Migration 005 must add color to custom_categories');
    assert.ok(m005.includes('icon'), 'Migration 005 must add icon to custom_categories');

    // 3. Unaccent wrapper in migration 006
    assert.ok(m006.includes('immutable_unaccent'), 'Migration 006 must declare immutable_unaccent');
    assert.ok(m006.includes('idx_custom_categories_user_name_unaccent'), 'Migration 006 must create unaccent index');
  });

  test('PL/pgSQL functions strictly set search_path = public for defense in depth', () => {
    const combinedSql = migrationFiles
      .map(file => fs.readFileSync(path.join(migrationsDir, file), 'utf-8'))
      .join('\n');

    const fnRegex = /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.handle_updated_at[\s\S]*?SET\s+search_path\s*=\s*public/i;
    assert.ok(
      fnRegex.test(combinedSql),
      'handle_updated_at function must specify SET search_path = public'
    );
  });

  test('Canonical creator signature FChNeto is documented in migrations', () => {
    const m006 = fs.readFileSync(path.join(migrationsDir, '006_v7_unaccent_and_relational_sync.sql'), 'utf-8');
    assert.ok(m006.includes('FChNeto'), 'Migration 006 must preserve canonical creator FChNeto');
  });

  describe('Multi-Account & Anon RLS Isolation Logic Simulation', () => {
    // In-memory simulation of Supabase PostgreSQL RLS engine
    class SimulatedSupabaseDatabase {
      constructor() {
        this.tables = {
          user_app_state: [],
          shifts: [],
          expenses: [],
          custom_categories: []
        };
      }

      // Executes query under simulated auth context auth.uid()
      query(tableName, authUid, filter = {}) {
        if (!authUid) return []; // Anon has no access to private tables
        const rows = this.tables[tableName] || [];
        // RLS policy: USING (auth.uid() = user_id)
        return rows.filter(r => {
          if (r.user_id !== authUid) return false;
          for (const [k, v] of Object.entries(filter)) {
            if (r[k] !== v) return false;
          }
          return true;
        });
      }

      insert(tableName, authUid, row) {
        if (!authUid) {
          throw new Error('RLS Violation: anonymous user cannot insert rows into private tables');
        }
        // WITH CHECK (auth.uid() = user_id)
        if (row.user_id !== authUid) {
          throw new Error(`RLS Violation: user ${authUid} cannot insert row for user ${row.user_id}`);
        }
        this.tables[tableName].push({ ...row });
        return { success: true };
      }

      update(tableName, authUid, filter, updates) {
        if (!authUid) {
          throw new Error('RLS Violation: anonymous user cannot update rows');
        }
        // USING (auth.uid() = user_id) AND WITH CHECK (auth.uid() = user_id)
        if (updates.user_id && updates.user_id !== authUid) {
          throw new Error(`RLS Violation: user ${authUid} cannot reassign user_id to ${updates.user_id}`);
        }
        let updatedCount = 0;
        this.tables[tableName] = this.tables[tableName].map(r => {
          if (r.user_id === authUid && Object.entries(filter).every(([k, v]) => r[k] === v)) {
            updatedCount++;
            return { ...r, ...updates };
          }
          return r;
        });
        return updatedCount;
      }

      delete(tableName, authUid, filter) {
        if (!authUid) {
          throw new Error('RLS Violation: anonymous user cannot delete rows');
        }
        const initialLen = this.tables[tableName].length;
        this.tables[tableName] = this.tables[tableName].filter(r => {
          const isTarget = r.user_id === authUid && Object.entries(filter).every(([k, v]) => r[k] === v);
          return !isTarget;
        });
        return initialLen - this.tables[tableName].length;
      }
    }

    test('Anonymous (anon) user is strictly rejected across query, insert, update and delete', () => {
      const db = new SimulatedSupabaseDatabase();
      const anonUid = null;

      // 1. Query as anon returns empty
      const anonResults = db.query('shifts', anonUid);
      assert.equal(anonResults.length, 0);

      // 2. Insert as anon throws RLS violation
      assert.throws(() => {
        db.insert('shifts', anonUid, { id: 's1', user_id: 'any', net_value: 1000 });
      }, /anonymous user cannot insert/i);

      // 3. Update as anon throws RLS violation
      assert.throws(() => {
        db.update('shifts', anonUid, { id: 's1' }, { net_value: 2000 });
      }, /anonymous user cannot update/i);

      // 4. Delete as anon throws RLS violation
      assert.throws(() => {
        db.delete('shifts', anonUid, { id: 's1' });
      }, /anonymous user cannot delete/i);
    });

    test('Doctor A cannot read, insert, mutate or delete Doctor B data under simulated RLS', () => {
      const db = new SimulatedSupabaseDatabase();
      const doctorA = 'doctor-uuid-aaaa-1111';
      const doctorB = 'doctor-uuid-bbbb-2222';

      // 1. Doctor A inserts user_app_state and shift
      db.insert('user_app_state', doctorA, {
        user_id: doctorA,
        revision: 1,
        state: { doctorName: 'Dra. Ana' }
      });
      db.insert('shifts', doctorA, {
        id: 'shift-a1',
        user_id: doctorA,
        hospital: 'Maternidade Sta. Maria',
        net_value: 2000
      });

      // 2. Doctor B inserts user_app_state and shift
      db.insert('user_app_state', doctorB, {
        user_id: doctorB,
        revision: 1,
        state: { doctorName: 'Dra. Beatriz' }
      });
      db.insert('shifts', doctorB, {
        id: 'shift-b1',
        user_id: doctorB,
        hospital: 'Hospital Infantil',
        net_value: 3000
      });

      // 3. Verify Doctor A can ONLY read Doctor A data
      const docAStates = db.query('user_app_state', doctorA);
      assert.equal(docAStates.length, 1);
      assert.equal(docAStates[0].state.doctorName, 'Dra. Ana');

      const docAShifts = db.query('shifts', doctorA);
      assert.equal(docAShifts.length, 1);
      assert.equal(docAShifts[0].hospital, 'Maternidade Sta. Maria');

      // 4. Doctor A attempts to query Doctor B rows directly by filter
      const docATryingReadB = db.query('shifts', doctorA, { id: 'shift-b1' });
      assert.equal(docATryingReadB.length, 0, 'Doctor A must not read Doctor B shift even when querying by ID');

      // 5. Doctor A attempts to insert row with Doctor B user_id (Must throw RLS violation)
      assert.throws(() => {
        db.insert('expenses', doctorA, {
          id: 'exp-spoof',
          user_id: doctorB,
          description: 'Spoofed Expense',
          amount: 500
        });
      }, /RLS Violation/);

      // 6. Doctor A attempts to update Doctor B shift
      const updateResult = db.update('shifts', doctorA, { id: 'shift-b1' }, { hospital: 'Hacked Hosp' });
      assert.equal(updateResult, 0, 'Doctor A must not be able to update Doctor B rows');

      // 7. Doctor A attempts to delete Doctor B shift
      const deleteResult = db.delete('shifts', doctorA, { id: 'shift-b1' });
      assert.equal(deleteResult, 0, 'Doctor A must not be able to delete Doctor B rows');

      const docBShifts = db.query('shifts', doctorB, { id: 'shift-b1' });
      assert.equal(docBShifts[0].hospital, 'Hospital Infantil', 'Doctor B row remains completely intact');
    });
  });
});

/**
 * v6_supabase_rls_sql.test.js
 * Test Suite: Supabase Migrations, Schema & RLS Policy Integrity for v6
 * Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const v6Dir = path.resolve(__dirname, '..');
const migrationsDir = path.join(v6Dir, 'supabase', 'migrations');

describe('Finanças Pediatria v6 - Supabase SQL & RLS Verification Suite', () => {

  const migrationFiles = [
    '001_initial_schema.sql',
    '002_enable_rls.sql',
    '003_triggers_and_indexes.sql',
    '004_user_app_state.sql',
    '005_categories_and_expenses_category_id.sql'
  ];

  test('All required SQL migration files (001 to 005) exist and are readable', () => {
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

    // Check auth.uid() check presence
    assert.ok(
      combinedSql.includes('auth.uid()') || combinedSql.includes('(SELECT auth.uid())'),
      'RLS policies must enforce auth.uid() checks'
    );

    // Ensure user_app_state policy enforces authenticated and auth.uid()
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

  test('Migration 005 adds category_id to expenses and metadata to custom_categories', () => {
    const m005 = fs.readFileSync(path.join(migrationsDir, '005_categories_and_expenses_category_id.sql'), 'utf-8');

    // 1. Column category_id in expenses
    assert.ok(m005.includes('category_id'), 'Migration 005 must add category_id to expenses');
    assert.ok(m005.includes('idx_expenses_user_category_id'), 'Migration 005 must create index on (user_id, category_id)');

    // 2. Custom categories enhancement
    assert.ok(m005.includes('macro_group'), 'Migration 005 must add macro_group to custom_categories');
    assert.ok(m005.includes('color'), 'Migration 005 must add color to custom_categories');
    assert.ok(m005.includes('icon'), 'Migration 005 must add icon to custom_categories');
    assert.ok(m005.includes('idx_custom_categories_user_name_ci'), 'Migration 005 must create case-insensitive uniqueness index');
  });

  test('PL/pgSQL functions strictly set search_path = public for defense in depth', () => {
    const combinedSql = migrationFiles
      .map(file => fs.readFileSync(path.join(migrationsDir, file), 'utf-8'))
      .join('\n');

    // Search for function declarations and ensure SET search_path = public
    const fnRegex = /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.handle_updated_at[\s\S]*?SET\s+search_path\s*=\s*public/i;
    assert.ok(
      fnRegex.test(combinedSql),
      'handle_updated_at function must specify SET search_path = public'
    );
  });

  test('Canonical creator signature FChNeto is documented in migration 005', () => {
    const m005 = fs.readFileSync(path.join(migrationsDir, '005_categories_and_expenses_category_id.sql'), 'utf-8');
    assert.ok(m005.includes('FChNeto'), 'Migration 005 must preserve canonical creator FChNeto');
  });

  describe('Multi-Account RLS Isolation Logic Simulation', () => {
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
        // WITH CHECK (auth.uid() = user_id)
        if (row.user_id !== authUid) {
          throw new Error(`RLS Violation: user ${authUid} cannot insert row for user ${row.user_id}`);
        }
        this.tables[tableName].push({ ...row });
        return { success: true };
      }

      update(tableName, authUid, filter, updates) {
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
    }

    test('Doctor A cannot read, insert or mutate Doctor B data under simulated RLS', () => {
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

      const docBShifts = db.query('shifts', doctorB, { id: 'shift-b1' });
      assert.equal(docBShifts[0].hospital, 'Hospital Infantil', 'Doctor B row remains intact');
    });
  });
});

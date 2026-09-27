/**
 * v4_cloud_rls.test.js
 * Test Suite for Milestone M2: Supabase PostgreSQL Strict Row Level Security (RLS) & Isolation
 * 
 * Validates:
 * 1. 100% of public tables have Row Level Security enabled (default-deny posture)
 * 2. Strict isolation policies with TO authenticated and auth.uid() = user_id / id
 * 3. Both USING (read/update filter) and WITH CHECK (mutation validation) clauses enforced
 * 4. Negative permissions: REVOKE ALL from anon and PUBLIC (zero anonymous leakage)
 * 5. Privilege escalation defense: SECURITY DEFINER triggers with search_path = public
 * 6. Non-recursive policy verification
 * 7. Canonical author stamp: APP_CREATOR = 'FChNeto'
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const APP_CREATOR = 'FChNeto';

/**
 * Resolves migration file path across production (V4_Cloud/supabase/migrations)
 * and explorer staging directories.
 */
export function resolveMigrationPath(filename) {
  const candidates = [
    path.resolve(__dirname, '..', 'supabase', 'migrations', filename),
    path.resolve(__dirname, '..', '..', '..', 'V4_Cloud', 'supabase', 'migrations', filename),
    path.resolve(__dirname, '..', 'm2_explorer_1', `proposed_${filename}`),
    path.resolve(__dirname, '..', 'm2_explorer_2', `proposed_${filename}`),
    path.resolve(__dirname, '..', 'm2_explorer_3', `proposed_${filename}`),
    path.resolve(__dirname, `proposed_${filename}`),
    path.resolve(__dirname, filename)
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Robust SQL Statement Splitter that preserves dollar-quoted PL/pgSQL function bodies ($$ ... $$)
 * and ignores comments and quotes.
 */
export function splitSqlStatements(sqlText) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sqlText.length; i++) {
    const char = sqlText[i];
    const nextChar = sqlText[i + 1] || '';

    // Line comment handling (-- ...)
    if (inLineComment) {
      if (char === '\n') inLineComment = false;
      continue;
    }
    // Block comment handling (/* ... */)
    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (!inDollarQuote && !inSingleQuote && !inDoubleQuote) {
      if (char === '-' && nextChar === '-') {
        inLineComment = true;
        i++;
        continue;
      }
      if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        i++;
        continue;
      }
    }

    // Single quotes ('...')
    if (char === "'" && !inDollarQuote && !inDoubleQuote) {
      if (inSingleQuote && nextChar === "'") {
        current += "''";
        i++;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      current += char;
      continue;
    }

    // Double quotes ("...")
    if (char === '"' && !inDollarQuote && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
      continue;
    }

    // Dollar quotes ($$)
    if (char === '$' && nextChar === '$' && !inSingleQuote && !inDoubleQuote) {
      inDollarQuote = !inDollarQuote;
      current += '$$';
      i++;
      continue;
    }

    // Semicolon statement boundary
    if (char === ';' && !inDollarQuote && !inSingleQuote && !inDoubleQuote) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }
      current = '';
      continue;
    }

    current += char;
  }

  const lastTrimmed = current.trim();
  if (lastTrimmed.length > 0) {
    statements.push(lastTrimmed);
  }

  return statements;
}

// Pre-load SQL migration files
const path001 = resolveMigrationPath('001_initial_schema.sql');
const path002 = resolveMigrationPath('002_enable_rls.sql');
const path003 = resolveMigrationPath('003_triggers_and_indexes.sql');

const sql001 = path001 ? fs.readFileSync(path001, 'utf8') : '';
const sql002 = path002 ? fs.readFileSync(path002, 'utf8') : '';
const sql003 = path003 ? fs.readFileSync(path003, 'utf8') : '';

const statements002 = sql002 ? splitSqlStatements(sql002) : [];
const statements003 = sql003 ? splitSqlStatements(sql003) : [];

describe('V4_Cloud Supabase PostgreSQL Row Level Security (RLS) & Isolation Suite', () => {

  test('0. Author Stamp: Preserves APP_CREATOR = "FChNeto"', () => {
    assert.equal(APP_CREATOR, 'FChNeto', 'Canonical author constant must be FChNeto');
  });

  test('1. RLS Migration File Resolution and Load', () => {
    assert.ok(path002, '002_enable_rls.sql must be resolved');
    assert.ok(sql002.length > 50, '002_enable_rls.sql must not be empty');
    assert.ok(statements002.length >= 8, '002_enable_rls.sql must contain RLS enablements, policies, and permissions');
  });

  describe('2. Row Level Security Activation (100% Public Tables)', () => {
    const requiredTables = ['profiles', 'shifts', 'expenses', 'custom_categories'];

    requiredTables.forEach(tableName => {
      test(`Table "${tableName}" has Row Level Security strictly enabled`, () => {
        const regex = new RegExp(`ALTER\\s+TABLE\\s+(?:public\\.)?${tableName}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
        const found = statements002.some(s => regex.test(s));
        assert.ok(found, `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY statement must exist`);
      });
    });

    test('Zero public tables are left without Row Level Security', () => {
      // Find all CREATE TABLE statements in 001
      const createdTables = [];
      const createTableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?([a-zA-Z0-9_]+)/gi;
      let match;
      while ((match = createTableRegex.exec(sql001)) !== null) {
        createdTables.push(match[1]);
      }

      assert.ok(createdTables.length >= 4, 'Should identify all 4 tables from 001_initial_schema.sql');
      for (const table of createdTables) {
        const rlsRegex = new RegExp(`ALTER\\s+TABLE\\s+(?:public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
        const enabled = statements002.some(s => rlsRegex.test(s));
        assert.ok(enabled, `Security invariant violation: table "${table}" was created in 001 but lacks RLS activation in 002!`);
      }
    });
  });

  describe('3. Strict User Isolation Policies (TO authenticated)', () => {
    const policySpecs = [
      {
        policyName: 'profiles_isolation_policy',
        table: 'profiles',
        column: 'id'
      },
      {
        policyName: 'shifts_isolation_policy',
        table: 'shifts',
        column: 'user_id'
      },
      {
        policyName: 'expenses_isolation_policy',
        table: 'expenses',
        column: 'user_id'
      },
      {
        policyName: 'custom_categories_isolation_policy',
        table: 'custom_categories',
        column: 'user_id'
      }
    ];

    policySpecs.forEach(({ policyName, table, column }) => {
      describe(`Policy: ${policyName} on ${table}`, () => {
        let policyStmt = '';

        test(`Policy statement exists for ${table}`, () => {
          const regex = new RegExp(`CREATE\\s+POLICY\\s+${policyName}\\s+ON\\s+(?:public\\.)?${table}`, 'i');
          policyStmt = statements002.find(s => regex.test(s));
          assert.ok(policyStmt, `CREATE POLICY ${policyName} ON ${table} must be defined`);
        });

        test(`Covers all DML actions (FOR ALL)`, () => {
          assert.ok(/FOR\s+ALL/i.test(policyStmt), `Policy ${policyName} must specify FOR ALL to cover SELECT, INSERT, UPDATE, DELETE`);
        });

        test(`Restricts execution exclusively TO authenticated`, () => {
          assert.ok(/TO\s+authenticated/i.test(policyStmt), `Policy ${policyName} must explicitly declare TO authenticated`);
          assert.ok(!/TO\s+anon\b/i.test(policyStmt), `Policy ${policyName} must NEVER grant access TO anon`);
          assert.ok(!/TO\s+public\b/i.test(policyStmt), `Policy ${policyName} must NEVER grant access TO public`);
        });

        test(`Enforces USING (auth.uid() = ${column}) for read & filter isolation`, () => {
          const usingRegex = new RegExp(`USING\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*${column}\\s*\\)`, 'i');
          assert.ok(usingRegex.test(policyStmt), `Policy ${policyName} must enforce USING (auth.uid() = ${column})`);
        });

        test(`Enforces WITH CHECK (auth.uid() = ${column}) for write & mutation isolation`, () => {
          const withCheckRegex = new RegExp(`WITH\\s+CHECK\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*${column}\\s*\\)`, 'i');
          assert.ok(withCheckRegex.test(policyStmt), `Policy ${policyName} must enforce WITH CHECK (auth.uid() = ${column})`);
        });

        test(`Policy is non-recursive (no self-referential subqueries on ${table})`, () => {
          const subqueryRegex = new RegExp(`SELECT[\\s\\S]+FROM\\s+(?:public\\.)?${table}`, 'i');
          assert.ok(!subqueryRegex.test(policyStmt), `Policy ${policyName} must not perform subqueries on itself (prevents infinite recursion)`);
        });
      });
    });
  });

  describe('4. Negative Permissions & Defense-in-Depth (Revocations from anon)', () => {
    test('Explicitly revokes ALL permissions on public tables from anon role', () => {
      const hasRevokeTables = statements002.some(s =>
        /REVOKE\s+ALL(?:\s+PRIVILEGES)?\s+ON\s+ALL\s+TABLES\s+IN\s+SCHEMA\s+public\s+FROM\s+anon/i.test(s)
      );
      assert.ok(hasRevokeTables, 'Must execute REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon');
    });

    test('Explicitly revokes ALL permissions on sequences from anon role', () => {
      const hasRevokeSeqs = statements002.some(s =>
        /REVOKE\s+ALL(?:\s+PRIVILEGES)?\s+ON\s+ALL\s+SEQUENCES\s+IN\s+SCHEMA\s+public\s+FROM\s+anon/i.test(s)
      );
      assert.ok(hasRevokeSeqs, 'Must execute REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon');
    });

    test('Explicitly revokes ALL permissions on routines from anon role', () => {
      const hasRevokeRoutines = statements002.some(s =>
        /REVOKE\s+ALL(?:\s+PRIVILEGES)?\s+ON\s+ALL\s+ROUTINES\s+IN\s+SCHEMA\s+public\s+FROM\s+anon/i.test(s)
      );
      assert.ok(hasRevokeRoutines, 'Must execute REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon');
    });

    test('Revokes privileges from default PUBLIC pseudo-role', () => {
      const hasRevokePublic = statements002.some(s =>
        /REVOKE\s+ALL(?:\s+PRIVILEGES)?\s+ON\s+ALL\s+TABLES\s+IN\s+SCHEMA\s+public\s+FROM\s+PUBLIC/i.test(s)
      );
      assert.ok(hasRevokePublic, 'Must execute REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC for defense-in-depth');
    });

    test('Zero policies permit unauthenticated access across entire schema', () => {
      const allPolicies = statements002.filter(s => /CREATE\s+POLICY/i.test(s));
      for (const pol of allPolicies) {
        assert.ok(!/TO\s+anon\b/i.test(pol), 'No policy may grant access TO anon');
        assert.ok(!/TO\s+public\b/i.test(pol), 'No policy may grant access TO public');
      }
    });
  });

  describe('5. Positive Permissions for Authenticated Role', () => {
    test('Grants USAGE on public schema TO authenticated', () => {
      const hasUsage = statements002.some(s =>
        /GRANT\s+USAGE\s+ON\s+SCHEMA\s+public\s+TO\s+authenticated/i.test(s)
      );
      assert.ok(hasUsage, 'Must GRANT USAGE ON SCHEMA public TO authenticated');
    });

    test('Grants SELECT, INSERT, UPDATE, DELETE on all tables TO authenticated', () => {
      const hasDml = statements002.some(s =>
        /GRANT\s+SELECT\s*,\s*INSERT\s*,\s*UPDATE\s*,\s*DELETE\s+ON\s+ALL\s+TABLES\s+IN\s+SCHEMA\s+public\s+TO\s+authenticated/i.test(s) ||
        /GRANT\s+ALL(?:\s+PRIVILEGES)?\s+ON\s+ALL\s+TABLES\s+IN\s+SCHEMA\s+public\s+TO\s+authenticated/i.test(s)
      );
      assert.ok(hasDml, 'Must GRANT DML privileges ON ALL TABLES TO authenticated');
    });
  });

  describe('6. Privilege Escalation Defense: Trigger Functions Security', () => {
    test('Automatic profile provision trigger handle_new_user() uses SECURITY DEFINER with fixed search_path = public', () => {
      const funcStmt = statements003.find(s => /FUNCTION\s+(?:public\.)?handle_new_user\s*\(\)/i.test(s));
      assert.ok(funcStmt, 'handle_new_user() function must exist in 003');
      assert.ok(/SECURITY\s+DEFINER/i.test(funcStmt), 'Must be SECURITY DEFINER to bypass initial RLS insert deadlock');
      assert.ok(/SET\s+search_path\s*=\s*public/i.test(funcStmt), 'Must SET search_path = public to neutralize search_path injection');
    });

    test('Timestamp trigger handle_updated_at() uses SECURITY DEFINER with fixed search_path = public', () => {
      const funcStmt = statements003.find(s =>
        /FUNCTION\s+(?:public\.)?handle_updated_at\s*\(\)/i.test(s) ||
        /FUNCTION\s+(?:public\.)?update_updated_at_column\s*\(\)/i.test(s)
      );
      assert.ok(funcStmt, 'updated_at function must exist in 003');
      assert.ok(/SECURITY\s+DEFINER/i.test(funcStmt), 'Must be SECURITY DEFINER');
      assert.ok(/SET\s+search_path\s*=\s*public/i.test(funcStmt), 'Must SET search_path = public');
    });
  });
});

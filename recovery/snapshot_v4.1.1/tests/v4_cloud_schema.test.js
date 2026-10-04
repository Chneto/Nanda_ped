/**
 * v4_cloud_schema.test.js
 * Test Suite for Milestone M2: Supabase PostgreSQL Schema, Migrations & DDL Integrity
 * 
 * Validates:
 * 1. Existence and syntax integrity of SQL migration files (001, 002, 003)
 * 2. Table definitions: profiles, shifts, expenses, custom_categories
 * 3. Column types, nullability, defaults, and primary/foreign keys
 * 4. Auth trigger handle_new_user() and updated_at triggers with SECURITY DEFINER
 * 5. High-performance composite and partial indexes
 * 6. Canonical author stamp: APP_CREATOR = 'FChNeto'
 */

import { test, describe, before } from 'node:test';
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

/**
 * Extracts table column definitions from a CREATE TABLE statement
 */
export function extractTableColumns(createTableSql) {
  const match = createTableSql.match(/CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*)\)/i);
  if (!match) return { tableName: null, columns: [], rawBody: '' };

  const tableName = match[1];
  const body = match[2];

  // Split lines inside the parenthesis by comma, taking care of constraints
  const lines = body.split('\n')
    .map(l => l.trim().replace(/,$/, ''))
    .filter(l => l.length > 0 && !l.startsWith('--') && !l.startsWith('/*') && !l.startsWith('CONSTRAINT') && !l.startsWith('PRIMARY KEY ('));

  const columns = lines.map(line => {
    const parts = line.split(/\s+/);
    return {
      name: parts[0],
      raw: line,
      type: parts[1] || ''
    };
  });

  return { tableName, columns, rawBody: body };
}

// Pre-load SQL files synchronously to ensure availability across all test hooks
const path001 = resolveMigrationPath('001_initial_schema.sql');
const path002 = resolveMigrationPath('002_enable_rls.sql');
const path003 = resolveMigrationPath('003_triggers_and_indexes.sql');

const sql001 = path001 ? fs.readFileSync(path001, 'utf8') : '';
const sql002 = path002 ? fs.readFileSync(path002, 'utf8') : '';
const sql003 = path003 ? fs.readFileSync(path003, 'utf8') : '';

const statements001 = sql001 ? splitSqlStatements(sql001) : [];
const statements002 = sql002 ? splitSqlStatements(sql002) : [];
const statements003 = sql003 ? splitSqlStatements(sql003) : [];

describe('V4_Cloud Supabase PostgreSQL Schema & Migrations Suite', () => {

  test('0. Author Stamp: Preserves APP_CREATOR = "FChNeto"', () => {
    assert.equal(APP_CREATOR, 'FChNeto', 'Canonical author constant must be FChNeto');
  });

  test('1. Migration Files Resolution and Load', () => {
    assert.ok(path001, '001_initial_schema.sql must be resolved');
    assert.ok(sql001.length > 100, '001_initial_schema.sql must not be empty');

    assert.ok(path002, '002_enable_rls.sql must be resolved');
    assert.ok(sql002.length > 50, '002_enable_rls.sql must not be empty');

    assert.ok(path003, '003_triggers_and_indexes.sql must be resolved');
    assert.ok(sql003.length > 100, '003_triggers_and_indexes.sql must not be empty');
  });

  describe('2. Table Structure & Columns (001_initial_schema.sql)', () => {
    test('001_initial_schema.sql parses into clean SQL statements', () => {
      assert.ok(statements001.length >= 4, 'Must contain at least 4 CREATE TABLE statements');
    });

    test('Table "profiles" has all required fields, types, and defaults', () => {
      const stmt = statements001.find(s => /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?profiles\b/i.test(s));
      assert.ok(stmt, 'CREATE TABLE profiles must exist');
      const { rawBody } = extractTableColumns(stmt);

      // Primary Key & Foreign Key
      assert.ok(/id\s+UUID\s+PRIMARY\s+KEY\s+REFERENCES\s+auth\.users\s*\(\s*id\s*\)\s+ON\s+DELETE\s+CASCADE/i.test(rawBody),
        'profiles.id must be UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE');

      // doctor_name
      assert.ok(/doctor_name\s+TEXT\s+NOT\s+NULL\s+DEFAULT\s+'Médica'/i.test(rawBody),
        'profiles.doctor_name must be TEXT NOT NULL DEFAULT Médica');

      // crm, rqe, specialty
      assert.ok(/crm\s+TEXT/i.test(rawBody), 'profiles.crm must be TEXT');
      assert.ok(/rqe\s+TEXT/i.test(rawBody), 'profiles.rqe must be TEXT');
      assert.ok(/specialty\s+TEXT\s+DEFAULT\s+'Pediatria'/i.test(rawBody), 'profiles.specialty must be TEXT DEFAULT Pediatria');

      // residency_salary
      assert.ok(/residency_salary\s+NUMERIC\(10,\s*2\)\s+NOT\s+NULL\s+DEFAULT\s+0\.00/i.test(rawBody),
        'profiles.residency_salary must be NUMERIC(10,2) NOT NULL DEFAULT 0.00');

      // Timestamps
      assert.ok(/created_at\s+TIMESTAMPTZ\s+NOT\s+NULL\s+DEFAULT\s+NOW\(\)/i.test(rawBody), 'profiles.created_at must be TIMESTAMPTZ');
      assert.ok(/updated_at\s+TIMESTAMPTZ\s+NOT\s+NULL\s+DEFAULT\s+NOW\(\)/i.test(rawBody), 'profiles.updated_at must be TIMESTAMPTZ');
    });

    test('Table "shifts" has all required fields, D+60 / D+90 columns, and sync_status', () => {
      const stmt = statements001.find(s => /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?shifts\b/i.test(s));
      assert.ok(stmt, 'CREATE TABLE shifts must exist');
      const { rawBody } = extractTableColumns(stmt);

      assert.ok(/id\s+UUID\s+PRIMARY\s+KEY\s+DEFAULT\s+gen_random_uuid\(\)/i.test(rawBody),
        'shifts.id must be UUID PRIMARY KEY DEFAULT gen_random_uuid()');
      assert.ok(/user_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+auth\.users\s*\(\s*id\s*\)\s+ON\s+DELETE\s+CASCADE/i.test(rawBody),
        'shifts.user_id must reference auth.users(id) ON DELETE CASCADE');
      assert.ok(/hospital\s+TEXT\s+NOT\s+NULL/i.test(rawBody), 'shifts.hospital must be TEXT NOT NULL');
      assert.ok(/date\s+DATE\s+NOT\s+NULL/i.test(rawBody), 'shifts.date must be DATE NOT NULL');

      // Values & D+60 / D+90 Installments
      assert.ok(/gross_value\s+NUMERIC\(10,\s*2\)\s+NOT\s+NULL\s+DEFAULT\s+0\.00/i.test(rawBody), 'shifts.gross_value must be NUMERIC(10,2)');
      assert.ok(/net_value\s+NUMERIC\(10,\s*2\)\s+NOT\s+NULL\s+DEFAULT\s+0\.00/i.test(rawBody), 'shifts.net_value must be NUMERIC(10,2)');
      assert.ok(/installment1_date\s+DATE\s+NOT\s+NULL/i.test(rawBody), 'shifts.installment1_date must be DATE NOT NULL');
      assert.ok(/installment1_value\s+NUMERIC\(10,\s*2\)\s+NOT\s+NULL/i.test(rawBody), 'shifts.installment1_value must be NUMERIC(10,2)');
      assert.ok(/installment2_date\s+DATE\s+NOT\s+NULL/i.test(rawBody), 'shifts.installment2_date must be DATE NOT NULL');
      assert.ok(/installment2_value\s+NUMERIC\(10,\s*2\)\s+NOT\s+NULL/i.test(rawBody), 'shifts.installment2_value must be NUMERIC(10,2)');

      // Sync & soft delete
      assert.ok(/status\s+TEXT\s+NOT\s+NULL\s+DEFAULT\s+'confirmed'/i.test(rawBody), 'shifts.status must default to confirmed');
      assert.ok(/sync_status\s+TEXT\s+NOT\s+NULL\s+DEFAULT\s+'synced'/i.test(rawBody), 'shifts.sync_status must default to synced');
      assert.ok(/deleted_at\s+TIMESTAMPTZ/i.test(rawBody), 'shifts.deleted_at must be TIMESTAMPTZ');
    });

    test('Table "expenses" has all required fields, installments, macro_groups, and sync_status', () => {
      const stmt = statements001.find(s => /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?expenses\b/i.test(s));
      assert.ok(stmt, 'CREATE TABLE expenses must exist');
      const { rawBody } = extractTableColumns(stmt);

      assert.ok(/id\s+UUID\s+PRIMARY\s+KEY\s+DEFAULT\s+gen_random_uuid\(\)/i.test(rawBody),
        'expenses.id must be UUID PRIMARY KEY DEFAULT gen_random_uuid()');
      assert.ok(/user_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+auth\.users\s*\(\s*id\s*\)\s+ON\s+DELETE\s+CASCADE/i.test(rawBody),
        'expenses.user_id must reference auth.users(id) ON DELETE CASCADE');
      assert.ok(/description\s+TEXT\s+NOT\s+NULL/i.test(rawBody), 'expenses.description must be TEXT NOT NULL');
      assert.ok(/amount\s+NUMERIC\(10,\s*2\)\s+NOT\s+NULL/i.test(rawBody), 'expenses.amount must be NUMERIC(10,2) NOT NULL');
      assert.ok(/date\s+DATE\s+NOT\s+NULL/i.test(rawBody), 'expenses.date must be DATE NOT NULL');
      assert.ok(/category\s+TEXT\s+NOT\s+NULL/i.test(rawBody), 'expenses.category must be TEXT NOT NULL');
      assert.ok(/macro_group\s+TEXT\s+NOT\s+NULL/i.test(rawBody), 'expenses.macro_group must be TEXT NOT NULL');

      // Installments & Sync
      assert.ok(/total_installments\s+INT\s+NOT\s+NULL\s+DEFAULT\s+1/i.test(rawBody), 'expenses.total_installments must default to 1');
      assert.ok(/current_installment\s+INT\s+NOT\s+NULL\s+DEFAULT\s+1/i.test(rawBody), 'expenses.current_installment must default to 1');
      assert.ok(/installment_group_id\s+UUID/i.test(rawBody), 'expenses.installment_group_id must be UUID');
      assert.ok(/sync_status\s+TEXT\s+NOT\s+NULL\s+DEFAULT\s+'synced'/i.test(rawBody), 'expenses.sync_status must default to synced');
      assert.ok(/deleted_at\s+TIMESTAMPTZ/i.test(rawBody), 'expenses.deleted_at must be TIMESTAMPTZ');
    });

    test('Table "custom_categories" has all required fields, styling tokens, and user isolation constraint', () => {
      const stmt = statements001.find(s => /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?custom_categories\b/i.test(s));
      assert.ok(stmt, 'CREATE TABLE custom_categories must exist');
      const { rawBody } = extractTableColumns(stmt);

      assert.ok(/id\s+UUID\s+PRIMARY\s+KEY\s+DEFAULT\s+gen_random_uuid\(\)/i.test(rawBody),
        'custom_categories.id must be UUID PRIMARY KEY DEFAULT gen_random_uuid()');
      assert.ok(/user_id\s+UUID\s+NOT\s+NULL\s+REFERENCES\s+auth\.users\s*\(\s*id\s*\)\s+ON\s+DELETE\s+CASCADE/i.test(rawBody),
        'custom_categories.user_id must reference auth.users(id) ON DELETE CASCADE');
      assert.ok(/name\s+TEXT\s+NOT\s+NULL/i.test(rawBody), 'custom_categories.name must be TEXT NOT NULL');
      assert.ok(/macro_group\s+TEXT\s+NOT\s+NULL/i.test(rawBody), 'custom_categories.macro_group must be TEXT NOT NULL');
      assert.ok(/icon\s+TEXT\s+DEFAULT\s+'label'/i.test(rawBody), 'custom_categories.icon must default to label');
      assert.ok(/color\s+TEXT\s+DEFAULT\s+'#EC407A'/i.test(rawBody), 'custom_categories.color must default to #EC407A');
      assert.ok(/deleted_at\s+TIMESTAMPTZ/i.test(rawBody), 'custom_categories.deleted_at must be TIMESTAMPTZ');
    });
  });

  describe('3. Database Triggers & Provisioning (003_triggers_and_indexes.sql)', () => {
    test('003_triggers_and_indexes.sql parses into valid statements', () => {
      assert.ok(statements003.length >= 7, 'Must contain functions, triggers, and indexes');
    });

    test('Function handle_new_user() has SECURITY DEFINER and search_path = public', () => {
      const funcStmt = statements003.find(s => /FUNCTION\s+(?:public\.)?handle_new_user\s*\(\)/i.test(s));
      assert.ok(funcStmt, 'handle_new_user() function must be defined');
      assert.ok(/SECURITY\s+DEFINER/i.test(funcStmt), 'handle_new_user must have SECURITY DEFINER');
      assert.ok(/SET\s+search_path\s*=\s*public/i.test(funcStmt), 'handle_new_user must SET search_path = public to prevent hijacking');
      assert.ok(/INSERT\s+INTO\s+(?:public\.)?profiles/i.test(funcStmt), 'handle_new_user must insert into public.profiles');
      assert.ok(/raw_user_meta_data/i.test(funcStmt), 'handle_new_user must parse user metadata');
      assert.ok(/Médica/i.test(funcStmt), 'handle_new_user must use a generic profile name');
    });

    test('Trigger on_auth_user_created attaches to auth.users AFTER INSERT', () => {
      const trigStmt = statements003.find(s => /TRIGGER\s+on_auth_user_created\b/i.test(s));
      assert.ok(trigStmt, 'Trigger on_auth_user_created must exist');
      assert.ok(/AFTER\s+INSERT\s+ON\s+auth\.users/i.test(trigStmt), 'Must trigger AFTER INSERT ON auth.users');
      assert.ok(/EXECUTE\s+FUNCTION\s+(?:public\.)?handle_new_user\s*\(\)/i.test(trigStmt), 'Must execute handle_new_user()');
    });

    test('Updated_at trigger function runs as invoker and triggers on all 4 normalized tables exist', () => {
      const funcStmt = statements003.find(s => /FUNCTION\s+(?:public\.)?handle_updated_at\s*\(\)/i.test(s) || /FUNCTION\s+(?:public\.)?update_updated_at_column\s*\(\)/i.test(s));
      assert.ok(funcStmt, 'updated_at function must be defined');
      assert.ok(!/SECURITY\s+DEFINER/i.test(funcStmt), 'updated_at function must use invoker privileges');
      assert.ok(/SET\s+search_path\s*=\s*public/i.test(funcStmt), 'updated_at function must SET search_path = public');

      const expectedTriggers = [
        { table: 'profiles', regex: /TRIGGER\s+set_profiles_updated_at\b/i },
        { table: 'shifts', regex: /TRIGGER\s+set_shifts_updated_at\b/i },
        { table: 'expenses', regex: /TRIGGER\s+set_expenses_updated_at\b/i },
        { table: 'custom_categories', regex: /TRIGGER\s+set_custom_categories_updated_at\b/i }
      ];

      for (const t of expectedTriggers) {
        const found = statements003.some(s => t.regex.test(s) && /BEFORE\s+UPDATE/i.test(s));
        assert.ok(found, `BEFORE UPDATE trigger on table ${t.table} must exist`);
      }
    });
  });

  describe('4. High-Performance Composite & Partial Indexes (003_triggers_and_indexes.sql)', () => {
    test('Index idx_shifts_user_date exists on shifts (user_id, date)', () => {
      assert.ok(/CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+idx_shifts_user_date\s+ON\s+(?:public\.)?shifts\s*\(\s*user_id\s*,\s*date\s*\)/i.test(sql003),
        'idx_shifts_user_date index must exist on shifts (user_id, date)');
    });

    test('Index idx_shifts_user_sync exists on shifts (user_id, sync_status) WHERE deleted_at IS NULL', () => {
      assert.ok(/CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+idx_shifts_user_sync\s+ON\s+(?:public\.)?shifts\s*\(\s*user_id\s*,\s*sync_status\s*\)\s+WHERE\s+deleted_at\s+IS\s+NULL/i.test(sql003),
        'idx_shifts_user_sync partial index must exist on shifts (user_id, sync_status) WHERE deleted_at IS NULL');
    });

    test('Index idx_expenses_user_date exists on expenses (user_id, date)', () => {
      assert.ok(/CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+idx_expenses_user_date\s+ON\s+(?:public\.)?expenses\s*\(\s*user_id\s*,\s*date\s*\)/i.test(sql003),
        'idx_expenses_user_date index must exist on expenses (user_id, date)');
    });

    test('Index idx_expenses_user_category exists on expenses (user_id, category)', () => {
      assert.ok(/CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+idx_expenses_user_category\s+ON\s+(?:public\.)?expenses\s*\(\s*user_id\s*,\s*category\s*\)/i.test(sql003),
        'idx_expenses_user_category index must exist on expenses (user_id, category)');
    });

    test('Index idx_expenses_user_sync exists on expenses (user_id, sync_status) WHERE deleted_at IS NULL', () => {
      assert.ok(/CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+idx_expenses_user_sync\s+ON\s+(?:public\.)?expenses\s*\(\s*user_id\s*,\s*sync_status\s*\)\s+WHERE\s+deleted_at\s+IS\s+NULL/i.test(sql003),
        'idx_expenses_user_sync partial index must exist on expenses (user_id, sync_status) WHERE deleted_at IS NULL');
    });

    test('Complementary indexes for custom categories and installment grouping exist', () => {
      assert.ok(/CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+idx_custom_categories_user\s+ON\s+(?:public\.)?custom_categories/i.test(sql003),
        'idx_custom_categories_user must exist');
      assert.ok(/CREATE\s+INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+idx_expenses_installment_group\s+ON\s+(?:public\.)?expenses/i.test(sql003),
        'idx_expenses_installment_group must exist');
    });
  });
});

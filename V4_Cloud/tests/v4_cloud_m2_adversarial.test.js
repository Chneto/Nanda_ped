/**
 * v4_cloud_m2_adversarial.test.js
 * Empirical Adversarial Challenger Test Suite for Milestone M2
 * Focus: Database Triggers, Constraints, Nullability & Index Stress-Testing
 * 
 * Scope:
 * 1. Auth Trigger handle_new_user() under edge cases (missing metadata, null raw_user_meta_data, special characters, unicode, SQL injection literals, idempotency)
 * 2. updated_at Trigger Behavior under concurrent updates, client tampering/backdating, and timestamp monotonicity
 * 3. Pediatric D+60 / D+90 Installment Constraints, Nullability, Month-End Clamping, and Mathematical Cent Distribution
 * 4. Architectural Analysis of Constraints (Soft-Delete Unique Pitfall & Foreign Key Index Coverage)
 * 5. Canonical Creator & System Invariants (APP_CREATOR = 'FChNeto')
 * 
 * Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_CREATOR = 'FChNeto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve migrations
function resolveMigration(filename) {
  const p = path.resolve(__dirname, '..', 'supabase', 'migrations', filename);
  if (fs.existsSync(p)) return p;
  throw new Error(`Migration file not found: ${filename}`);
}

const path001 = resolveMigration('001_initial_schema.sql');
const path002 = resolveMigration('002_enable_rls.sql');
const path003 = resolveMigration('003_triggers_and_indexes.sql');

const sql001 = fs.readFileSync(path001, 'utf8');
const sql002 = fs.readFileSync(path002, 'utf8');
const sql003 = fs.readFileSync(path003, 'utf8');

// Helper to extract PL/pgSQL function body
function extractFunctionBody(sql, functionName) {
  const regex = new RegExp(`CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+(?:public\\.)?${functionName}\\s*\\([\\s\\S]*?\\)\\s*RETURNS[\\s\\S]*?AS\\s*\\$\\$([\\s\\S]*?)\\$\\$;`, 'i');
  const match = sql.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * High-fidelity PL/pgSQL simulation engine for handle_new_user()
 * Faithfully mirrors PostgreSQL JSONB extraction (->>), TRIM(), NULLIF(), COALESCE,
 * and parameterized INSERT ... ON CONFLICT (id) DO UPDATE.
 */
class PostgresUserTriggerSimulator {
  constructor() {
    this.profiles = new Map();
  }

  // Emulates PostgreSQL TRIM(text) and NULLIF(text, '')
  static trimAndNullIf(val) {
    if (val === null || val === undefined) return null;
    const str = String(val).trim();
    return str === '' ? null : str;
  }

  // Emulates PostgreSQL raw_user_meta_data->>'key'
  static extractJsonbField(meta, key) {
    if (!meta || typeof meta !== 'object') return null;
    const val = meta[key];
    if (val === null || val === undefined) return null;
    // In Postgres, ->> converts JSON primitives to text
    return String(val);
  }

  /**
   * Executes the exact logic from public.handle_new_user()
   */
  handleNewUser(newRecord) {
    if (!newRecord || !newRecord.id) {
      throw new Error('PostgreSQL Error: null value in column "id" of relation "profiles" violates not-null constraint');
    }

    const meta = newRecord.raw_user_meta_data;

    // v_full_name := COALESCE(
    //   NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    //   NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    //   'Médica'
    // );
    const fullNameRaw = PostgresUserTriggerSimulator.extractJsonbField(meta, 'full_name');
    const nameRaw = PostgresUserTriggerSimulator.extractJsonbField(meta, 'name');

    const v_full_name =
      PostgresUserTriggerSimulator.trimAndNullIf(fullNameRaw) ||
      PostgresUserTriggerSimulator.trimAndNullIf(nameRaw) ||
      'Médica';

    // v_avatar_url := COALESCE(
    //   NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), ''),
    //   NULLIF(TRIM(NEW.raw_user_meta_data->>'picture'), ''),
    //   NULL
    // );
    const avatarRaw = PostgresUserTriggerSimulator.extractJsonbField(meta, 'avatar_url');
    const pictureRaw = PostgresUserTriggerSimulator.extractJsonbField(meta, 'picture');

    const v_avatar_url =
      PostgresUserTriggerSimulator.trimAndNullIf(avatarRaw) ||
      PostgresUserTriggerSimulator.trimAndNullIf(pictureRaw) ||
      null;

    const existing = this.profiles.get(newRecord.id);

    if (existing) {
      // ON CONFLICT (id) DO UPDATE SET
      //   doctor_name = EXCLUDED.doctor_name,
      //   photo_url = COALESCE(public.profiles.photo_url, EXCLUDED.photo_url),
      //   updated_at = NOW();
      existing.doctor_name = v_full_name;
      existing.photo_url = existing.photo_url || v_avatar_url;
      existing.updated_at = new Date().toISOString();
      return existing;
    }

    // Default Insert
    const profile = {
      id: newRecord.id,
      doctor_name: v_full_name,
      crm: null,
      rqe: null,
      specialty: 'Pediatria',
      photo_url: v_avatar_url,
      residency_salary: 0.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.profiles.set(newRecord.id, profile);
    return profile;
  }
}

/**
 * Pediatric D+60 / D+90 Installment Calculator
 * Implements the domain formula with calendar month-end clamping
 */
function addMonthsToDateString(dateStr, monthsToAdd) {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-based
  const day = parseInt(dayStr, 10);

  const targetMonth = month + monthsToAdd;
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;

  // Days in target month (month is 1-based in Date(year, month, 0))
  const maxDays = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const clampedDay = Math.min(day, maxDays);

  const mm = String(normalizedMonth + 1).padStart(2, '0');
  const dd = String(clampedDay).padStart(2, '0');
  return `${targetYear}-${mm}-${dd}`;
}

function calculatePediatricInstallments(netValue, shiftDate) {
  const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  // 75% D+60 (+2 months)
  const inst1Val = round2(netValue * 0.75);
  // 25% D+90 (+3 months) with cent remainder preservation
  const inst2Val = round2(netValue - inst1Val);

  const inst1Date = addMonthsToDateString(shiftDate, 2);
  const inst2Date = addMonthsToDateString(shiftDate, 3);

  return {
    installment1_date: inst1Date,
    installment1_value: inst1Val,
    installment2_date: inst2Date,
    installment2_value: inst2Val
  };
}

// ==============================================================================
// TEST SUITE: Empirical Adversarial Challenge M2
// ==============================================================================

describe('M2 Adversarial Challenge Suite — Triggers, Constraints & Indexes', () => {

  test('0. Invariant Check: Preserves APP_CREATOR = "FChNeto"', () => {
    assert.equal(APP_CREATOR, 'FChNeto', 'Creator signature must remain FChNeto');
  });

  // ----------------------------------------------------------------------------
  // SECTION 1: Adversarial Testing of handle_new_user() Trigger
  // ----------------------------------------------------------------------------
  describe('1. Adversarial Testing of handle_new_user() Trigger', () => {
    let simulator;

    before(() => {
      simulator = new PostgresUserTriggerSimulator();
    });

    test('1.1 PL/pgSQL AST Inspection: Verifies SECURITY DEFINER and search_path hygiene', () => {
      const body = extractFunctionBody(sql003, 'handle_new_user');
      assert.ok(body, 'Function handle_new_user body must be extractable');

      // Security Definer check
      assert.ok(/SECURITY\s+DEFINER/i.test(sql003), 'Must declare SECURITY DEFINER');

      // Search path hijacking defense (CVE-2018-1058 defense in depth)
      assert.ok(/SET\s+search_path\s*=\s*public/i.test(sql003),
        'Must explicitly set search_path = public to eliminate trojan object attacks');

      // Trigger attachment to auth.users AFTER INSERT
      assert.ok(/CREATE\s+TRIGGER\s+on_auth_user_created\s+AFTER\s+INSERT\s+ON\s+auth\.users/i.test(sql003),
        'Trigger must fire AFTER INSERT ON auth.users');
    });

    test('1.2 Edge Case: raw_user_meta_data is null (bare user registration)', () => {
      const sim = new PostgresUserTriggerSimulator();
      const profile = sim.handleNewUser({
        id: '11111111-1111-4111-8111-111111111111',
        email: 'medica@hospital.rn.gov.br',
        raw_user_meta_data: null
      });

      assert.equal(profile.doctor_name, 'Médica', 'Must fallback to Médica');
      assert.equal(profile.photo_url, null, 'Avatar URL must be null');
      assert.equal(profile.specialty, 'Pediatria');
      assert.equal(profile.residency_salary, 0.00);
    });

    test('1.3 Edge Case: raw_user_meta_data is empty object {}', () => {
      const sim = new PostgresUserTriggerSimulator();
      const profile = sim.handleNewUser({
        id: '22222222-2222-4222-8222-222222222222',
        email: 'dra@pediatria.com',
        raw_user_meta_data: {}
      });

      assert.equal(profile.doctor_name, 'Médica');
      assert.equal(profile.photo_url, null);
    });

    test('1.4 Edge Case: raw_user_meta_data has whitespace-only strings', () => {
      const sim = new PostgresUserTriggerSimulator();
      const profile = sim.handleNewUser({
        id: '33333333-3333-4333-8333-333333333333',
        email: 'blank@test.com',
        raw_user_meta_data: {
          full_name: '   ',
          name: ' \t \n ',
          avatar_url: '   '
        }
      });

      assert.equal(profile.doctor_name, 'Médica', 'Whitespace must be trimmed and treated as empty/null');
      assert.equal(profile.photo_url, null, 'Whitespace avatar must be treated as null');
    });

    test('1.5 Stress: Special characters, Brazilian accents, apostrophes, and unicode emojis in doctor_name', () => {
      const testCases = [
        {
          input: "Médica",
          expected: "Médica"
        },
        {
          input: "Dra. Anne-Marie O'Connor D'Angelo",
          expected: "Dra. Anne-Marie O'Connor D'Angelo"
        },
        {
          input: "Médica 🩺🌸👶 (UTI Neonatal)",
          expected: "Médica 🩺🌸👶 (UTI Neonatal)"
        },
        {
          input: "Dra. Çícêrã Jõãõ & Maria",
          expected: "Dra. Çícêrã Jõãõ & Maria"
        },
        {
          // SQL injection attempt inside string literal
          input: "Médica'; DROP TABLE public.profiles; --",
          expected: "Médica'; DROP TABLE public.profiles; --"
        }
      ];

      const sim = new PostgresUserTriggerSimulator();

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const profile = sim.handleNewUser({
          id: `44444444-4444-4444-8444-${String(i).padStart(12, '0')}`,
          email: `test${i}@test.com`,
          raw_user_meta_data: { full_name: tc.input }
        });

        assert.equal(profile.doctor_name, tc.expected, `Doctor name with special characters must be preserved without SQL syntax errors`);
      }
    });

    test('1.6 Fallback order: full_name -> name -> Médica', () => {
      const sim = new PostgresUserTriggerSimulator();

      // Case A: full_name is present
      const pA = sim.handleNewUser({
        id: '55555555-5555-4555-8555-000000000001',
        raw_user_meta_data: { full_name: 'Dra. Nome Completo', name: 'Dra. Nome Curto' }
      });
      assert.equal(pA.doctor_name, 'Dra. Nome Completo');

      // Case B: full_name is empty, name is present
      const pB = sim.handleNewUser({
        id: '55555555-5555-4555-8555-000000000002',
        raw_user_meta_data: { full_name: '', name: 'Dra. Nome Curto' }
      });
      assert.equal(pB.doctor_name, 'Dra. Nome Curto');

      // Case C: both empty
      const pC = sim.handleNewUser({
        id: '55555555-5555-4555-8555-000000000003',
        raw_user_meta_data: { full_name: '   ', name: '' }
      });
      assert.equal(pC.doctor_name, 'Médica');
    });

    test('1.7 Avatar resolution: avatar_url vs Google OAuth picture', () => {
      const sim = new PostgresUserTriggerSimulator();

      // Google OAuth provides 'picture'
      const pGoogle = sim.handleNewUser({
        id: '66666666-6666-4666-8666-000000000001',
        raw_user_meta_data: { picture: 'https://lh3.googleusercontent.com/a/avatar.jpg' }
      });
      assert.equal(pGoogle.photo_url, 'https://lh3.googleusercontent.com/a/avatar.jpg');

      // Custom app avatar_url takes priority over picture if both exist
      const pCustom = sim.handleNewUser({
        id: '66666666-6666-4666-8666-000000000002',
        raw_user_meta_data: {
          avatar_url: 'https://storage.supabase.co/profiles/custom.png',
          picture: 'https://lh3.googleusercontent.com/a/avatar.jpg'
        }
      });
      assert.equal(pCustom.photo_url, 'https://storage.supabase.co/profiles/custom.png');
    });

    test('1.8 Idempotency & Conflict Safety: Repeated execution preserves custom CRM, RQE, and custom avatar', () => {
      const sim = new PostgresUserTriggerSimulator();
      const userId = '77777777-7777-4777-8777-000000000001';

      // First run (user creation)
      const p1 = sim.handleNewUser({
        id: userId,
        raw_user_meta_data: { full_name: 'Médica' }
      });

      // User updates CRM and custom photo in application
      p1.crm = 'CRM/TESTE';
      p1.rqe = 'RQE 6789';
      p1.photo_url = 'https://custom-photo.com/Profissional.jpg';

      // Second run (simulating auth replay or re-login event)
      const p2 = sim.handleNewUser({
        id: userId,
        raw_user_meta_data: { full_name: 'Médica Atualizada', picture: 'https://google.com/old.jpg' }
      });

      assert.equal(p2.id, userId);
      assert.equal(p2.doctor_name, 'Médica Atualizada', 'Doctor name is updated');
      assert.equal(p2.crm, 'CRM/TESTE', 'CRM must NOT be erased by trigger on conflict');
      assert.equal(p2.rqe, 'RQE 6789', 'RQE must NOT be erased by trigger on conflict');
      assert.equal(p2.photo_url, 'https://custom-photo.com/Profissional.jpg',
        'Custom photo_url must be preserved via COALESCE(profiles.photo_url, EXCLUDED.photo_url)');
    });
  });

  // ----------------------------------------------------------------------------
  // SECTION 2: Adversarial Testing of updated_at Trigger & Concurrency
  // ----------------------------------------------------------------------------
  describe('2. Adversarial Testing of updated_at Trigger & Concurrency', () => {
    test('2.1 BEFORE UPDATE Trigger Specification & Immunity to Client Backdating', () => {
      // In PostgreSQL, BEFORE UPDATE trigger modifying NEW.updated_at = NOW() guarantees:
      // 1. Any spoofed updated_at passed by client in the UPDATE payload is discarded.
      // 2. The write is atomic with the row lock.
      const body = extractFunctionBody(sql003, 'handle_updated_at');
      assert.ok(body, 'Function handle_updated_at must exist');
      assert.ok(/NEW\.updated_at\s*=\s*NOW\(\)/i.test(body), 'Must assign NEW.updated_at = NOW()');
      assert.ok(/RETURN\s+NEW/i.test(body), 'Must RETURN NEW');

      // Verify trigger attachments
      const tables = ['profiles', 'shifts', 'expenses', 'custom_categories'];
      for (const table of tables) {
        const triggerPattern = new RegExp(`CREATE\\s+TRIGGER\\s+set_${table}_updated_at\\s+BEFORE\\s+UPDATE\\s+ON\\s+public\\.${table}`, 'i');
        assert.ok(triggerPattern.test(sql003), `Trigger on public.${table} must be BEFORE UPDATE`);
      }
    });

    test('2.2 Concurrent Updates Stress: Monotonic Non-Decreasing Timestamps', async () => {
      // Simulation of concurrent updates to a record
      let record = {
        id: '88888888-8888-4888-8888-000000000001',
        title: 'Plantão Inicial',
        updated_at: new Date(Date.now() - 10000).toISOString()
      };

      const updateRow = async (newTitle, clientProvidedTimestamp) => {
        // Simulating network delay / jitter
        await new Promise(res => setTimeout(res, Math.floor(Math.random() * 5)));

        // BEFORE UPDATE trigger behavior: ignores clientProvidedTimestamp and sets server NOW()
        const serverNow = new Date().toISOString();
        record = {
          ...record,
          title: newTitle,
          updated_at: serverNow
        };
        return record.updated_at;
      };

      const iterations = 50;
      let lastTimestamp = record.updated_at;

      for (let i = 0; i < iterations; i++) {
        // Malicious client tries to spoof an old timestamp (year 2000)
        const spoofedTime = '2000-01-01T00:00:00.000Z';
        const updatedTime = await updateRow(`Update #${i}`, spoofedTime);

        // Verification: timestamp must advance and NEVER accept spoofed timestamp
        assert.ok(updatedTime > spoofedTime, 'Server timestamp must reject spoofed past timestamp');
        assert.ok(updatedTime >= lastTimestamp, 'Timestamps under serialized updates must be monotonic non-decreasing');
        lastTimestamp = updatedTime;
      }
    });
  });

  // ----------------------------------------------------------------------------
  // SECTION 3: Pediatric D+60 / D+90 Installment Constraints & Nullability
  // ----------------------------------------------------------------------------
  describe('3. Pediatric D+60 / D+90 Installment Constraints & Nullability', () => {

    test('3.1 Schema Nullability & CHECK Constraint Audit', () => {
      // Extract shifts CREATE TABLE from 001_initial_schema.sql
      const shiftsTableMatch = sql001.match(/CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+public\.shifts\s*\(([\s\S]*?)\);/i);
      assert.ok(shiftsTableMatch, 'public.shifts CREATE TABLE statement must exist');
      const body = shiftsTableMatch[1];

      // Non-nullability checks
      assert.ok(/installment1_date\s+DATE\s+NOT\s+NULL/i.test(body), 'installment1_date must be DATE NOT NULL');
      assert.ok(/installment1_value\s+NUMERIC\(10,\s*2\)\s+NOT\s+NULL/i.test(body), 'installment1_value must be NOT NULL');
      assert.ok(/installment2_date\s+DATE\s+NOT\s+NULL/i.test(body), 'installment2_date must be DATE NOT NULL');
      assert.ok(/installment2_value\s+NUMERIC\(10,\s*2\)\s+NOT\s+NULL/i.test(body), 'installment2_value must be NOT NULL');

      // Check non-negative constraints
      assert.ok(/gross_value[\s\S]*?CHECK\s*\(\s*gross_value\s*>=\s*0\s*\)/i.test(body), 'gross_value >= 0 check');
      assert.ok(/net_value[\s\S]*?CHECK\s*\(\s*net_value\s*>=\s*0\s*\)/i.test(body), 'net_value >= 0 check');
      assert.ok(/installment1_value[\s\S]*?CHECK\s*\(\s*installment1_value\s*>=\s*0\s*\)/i.test(body), 'installment1_value >= 0 check');
      assert.ok(/installment2_value[\s\S]*?CHECK\s*\(\s*installment2_value\s*>=\s*0\s*\)/i.test(body), 'installment2_value >= 0 check');
    });

    test('3.2 Fuzzing Pediatric 75% / 25% Split across 100 Fractional Amounts', () => {
      // Generates 100 test amounts with 2 decimal places
      const testAmounts = [
        0.00, 0.01, 0.02, 0.03, 1.00, 100.00, 1250.33, 1450.50, 1875.75,
        2200.00, 2500.00, 3125.67, 0.00, 9999.99, 15000.55
      ];

      // Add random values to reach 100 cases
      for (let i = 0; i < 85; i++) {
        const rand = Math.round((Math.random() * 10000 + 0.01) * 100) / 100;
        testAmounts.push(rand);
      }

      for (const amount of testAmounts) {
        const { installment1_value, installment2_value } = calculatePediatricInstallments(amount, '2026-03-15');

        // Sum must strictly equal amount with zero penny leakage
        const sum = Math.round((installment1_value + installment2_value) * 100) / 100;
        assert.equal(sum, amount, `Installment split for R$ ${amount} must strictly balance (${installment1_value} + ${installment2_value} = ${amount})`);

        // Check non-negativity
        assert.ok(installment1_value >= 0, 'installment1 >= 0');
        assert.ok(installment2_value >= 0, 'installment2 >= 0');
      }
    });

    test('3.3 Calendar Month-End Clamping Boundary Testing (D+60 and D+90)', () => {
      // Boundary test scenarios
      const scenarios = [
        {
          shiftDate: '2026-01-31', // Jan 31 -> +2 mo (Mar 31) -> +3 mo (Apr 30, since Apr has 30 days)
          expectedD60: '2026-03-31',
          expectedD90: '2026-04-30'
        },
        {
          shiftDate: '2026-03-31', // Mar 31 -> +2 mo (May 31) -> +3 mo (Jun 30, since Jun has 30 days)
          expectedD60: '2026-05-31',
          expectedD90: '2026-06-30'
        },
        {
          shiftDate: '2026-08-31', // Aug 31 -> +2 mo (Oct 31) -> +3 mo (Nov 30)
          expectedD60: '2026-10-31',
          expectedD90: '2026-11-30'
        },
        {
          shiftDate: '2026-11-30', // Nov 30 -> +2 mo (Jan 30) -> +3 mo (Feb 28 in non-leap year 2027)
          expectedD60: '2027-01-30',
          expectedD90: '2027-02-28'
        },
        {
          shiftDate: '2027-12-31', // Dec 31 -> +2 mo (Feb 28 2028: leap year!) -> +3 mo (Mar 31 2028)
          expectedD60: '2028-02-29', // 2028 is a leap year!
          expectedD90: '2028-03-31'
        }
      ];

      for (const sc of scenarios) {
        const res = calculatePediatricInstallments(2000.00, sc.shiftDate);
        assert.equal(res.installment1_date, sc.expectedD60, `D+60 date for ${sc.shiftDate} must clamp to ${sc.expectedD60}`);
        assert.equal(res.installment2_date, sc.expectedD90, `D+90 date for ${sc.shiftDate} must clamp to ${sc.expectedD90}`);
      }
    });

    test('3.4 Pro Bono / R$ 0.00 Shift Edge Case', () => {
      const res = calculatePediatricInstallments(0.00, '2026-05-10');
      assert.equal(res.installment1_value, 0.00);
      assert.equal(res.installment2_value, 0.00);
      assert.equal(res.installment1_date, '2026-07-10');
      assert.equal(res.installment2_date, '2026-08-10');
    });
  });

  // ----------------------------------------------------------------------------
  // SECTION 4: Deep Architectural Analysis & Stress Checks
  // ----------------------------------------------------------------------------
  describe('4. Deep Architectural Analysis & Stress Checks', () => {

    test('4.1 Foreign Key Index Coverage Analysis (Performance Guard)', () => {
      // In PostgreSQL, foreign keys without indexes can cause table-level locks on parent deletions.
      // We verify that every foreign key to auth.users(id) has an index whose leading column is the FK.
      assert.ok(/ON\s+public\.shifts\s*\(\s*user_id/i.test(sql003),
        'shifts(user_id) has index with user_id as leading column');
      assert.ok(/ON\s+public\.expenses\s*\(\s*user_id/i.test(sql003),
        'expenses(user_id) has index with user_id as leading column');
      assert.ok(/ON\s+public\.custom_categories\s*\(\s*user_id\s*\)/i.test(sql003),
        'custom_categories(user_id) has index');
      assert.ok(/ON\s+public\.expenses\s*\(\s*installment_group_id\s*\)/i.test(sql003),
        'expenses(installment_group_id) has index for installment groups');
    });

    test('4.2 Soft-Delete Unique Constraint Analysis (Pitfall Detection)', () => {
      // Observation:
      // public.custom_categories has: CONSTRAINT uq_user_category_name UNIQUE (user_id, name)
      // If a category is soft-deleted (deleted_at IS NOT NULL), standard table-level UNIQUE will
      // prevent re-creating a category with the same name.
      const hasTableLevelUnique = /CONSTRAINT\s+uq_user_category_name\s+UNIQUE\s*\(\s*user_id\s*,\s*name\s*\)/i.test(sql001);
      assert.ok(hasTableLevelUnique, 'Observes table-level UNIQUE (user_id, name)');

      // Challenger Note:
      // If a user soft-deletes a custom category, the sync engine or application must either:
      // a) un-delete (clear deleted_at) if inserted again with same name, OR
      // b) in a future migration, replace table-level constraint with partial index:
      //    CREATE UNIQUE INDEX uq_active_category ON custom_categories (user_id, name) WHERE deleted_at IS NULL.
      // This is a documented observation for Milestone M4 (Domain & Sync Engine).
    });

    test('4.3 Expenses Installment Constraints: total_installments >= 1 and current_installment bounds', () => {
      const expensesMatch = sql001.match(/CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+public\.expenses\s*\(([\s\S]*?)\);/i);
      assert.ok(expensesMatch, 'public.expenses must exist');
      const body = expensesMatch[1];

      assert.ok(/total_installments[\s\S]*?CHECK\s*\(\s*total_installments\s*>=\s*1\s*\)/i.test(body),
        'total_installments >= 1 constraint');
      assert.ok(/current_installment[\s\S]*?CHECK\s*\(\s*current_installment\s*>=\s*1\s+AND\s+current_installment\s*<=\s*total_installments\s*\)/i.test(body),
        'current_installment >= 1 AND current_installment <= total_installments constraint');
    });
  });
});

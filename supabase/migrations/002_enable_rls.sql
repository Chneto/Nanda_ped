-- ==============================================================================
-- Migration: 002_enable_rls.sql
-- Application: Finanças Pediatria V4_Cloud
-- Milestone: M2 - Supabase PostgreSQL Schema, Migrations & Strict RLS
-- Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
-- Description: Enables Row Level Security (RLS) on 100% of public tables,
--              establishes strict user isolation policies for authenticated users,
--              and revokes all privileges from unauthenticated (anon) roles
--              to guarantee zero cross-tenant leakage.
-- ==============================================================================

-- ==============================================================================
-- 1. ROW LEVEL SECURITY ACTIVATION (100% PUBLIC TABLES)
-- ==============================================================================
-- By default in PostgreSQL, enabling RLS activates a "default deny" posture.
-- Any role that is not a superuser or table owner cannot view or modify any row
-- unless an explicit policy permits the operation.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- 2. STRICT USER ISOLATION POLICIES (TO authenticated)
-- ==============================================================================
-- Each policy binds row operations to the cryptographic identity present in the
-- Supabase JWT: auth.uid().
--
-- Policy specifications:
--   - FOR ALL: Covers SELECT, INSERT, UPDATE, DELETE in a single unified policy.
--   - TO authenticated: Restricts execution to valid logged-in users.
--   - USING: Filters existing rows accessible for read, update, or deletion.
--   - WITH CHECK: Validates new rows inserted or updated values to prevent
--     tampering with the owner identifier.

-- ------------------------------------------------------------------------------
-- 2.1 Table: public.profiles
-- Row identity: profiles.id = auth.users.id
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_isolation_policy ON public.profiles;
CREATE POLICY profiles_isolation_policy ON public.profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

COMMENT ON POLICY profiles_isolation_policy ON public.profiles IS
    'Guarantees each physician can only read, insert, update, or delete their own medical profile.';


-- ------------------------------------------------------------------------------
-- 2.2 Table: public.shifts
-- Row identity: shifts.user_id = auth.users.id
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS shifts_isolation_policy ON public.shifts;
CREATE POLICY shifts_isolation_policy ON public.shifts
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY shifts_isolation_policy ON public.shifts IS
    'Guarantees each physician can only access and manage their own delivery room and hospital shifts.';


-- ------------------------------------------------------------------------------
-- 2.3 Table: public.expenses
-- Row identity: expenses.user_id = auth.users.id
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS expenses_isolation_policy ON public.expenses;
CREATE POLICY expenses_isolation_policy ON public.expenses
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY expenses_isolation_policy ON public.expenses IS
    'Guarantees each physician can only access and manage their own medical and personal expenses.';


-- ------------------------------------------------------------------------------
-- 2.4 Table: public.custom_categories
-- Row identity: custom_categories.user_id = auth.users.id
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS custom_categories_isolation_policy ON public.custom_categories;
CREATE POLICY custom_categories_isolation_policy ON public.custom_categories
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY custom_categories_isolation_policy ON public.custom_categories IS
    'Guarantees each physician can only access and manage their own custom expense categories.';


-- ==============================================================================
-- 3. NEGATIVE PERMISSIONS (DEFENSE IN DEPTH: REVOKE FROM anon)
-- ==============================================================================
-- Even though RLS denies access to tables without policies, explicitly revoking
-- table-level privileges from the anon role creates a multi-layered security
-- posture. Unauthenticated visitors are rejected at the privilege layer before
-- policy evaluation even occurs.

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;

-- Prevent future tables, sequences, or routines in public from granting permissions to anon
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon;

-- Revoke default PUBLIC pseudo-role access for defense in depth
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;


-- ==============================================================================
-- 4. POSITIVE PERMISSIONS (GRANT TO authenticated)
-- ==============================================================================
-- Grant necessary schema and table DML privileges to the authenticated role.
-- Actual row visibility and mutation rights remain 100% constrained by RLS policies above.

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure future tables automatically grant DML privileges to authenticated role
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

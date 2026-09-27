-- ==============================================================================
-- Migration: 003_triggers_and_indexes.sql
-- Application: Finanças Pediatria V4_Cloud (Dra. Fernanda Ch.)
-- Canonical Creator: FChNeto (APP_CREATOR = 'FChNeto')
-- Description: Automatic user provisioning trigger, updated_at timestamp triggers,
--              and high-performance composite indexes for local-first sync.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Automatic User Profile Provisioning Trigger (auth.users -> public.profiles)
-- ------------------------------------------------------------------------------
-- Automatically provisions a profile for Dra. Fernanda Ch. (or new physician users)
-- upon registration via Google OAuth or Magic Link.
-- SECURITY DEFINER allows executing with elevated privileges to insert into public.profiles.
-- SET search_path = public prevents search_path hijacking attacks (CVE security best practice).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
BEGIN
  -- Extract physician name from raw_user_meta_data (Google OAuth or Magic Link metadata)
  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    'Dra. Fernanda Ch.'
  );

  -- Extract avatar URL if provided by OAuth provider
  v_avatar_url := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'picture'), ''),
    NULL
  );

  -- Insert default medical profile for the newly registered user
  INSERT INTO public.profiles (
    id,
    doctor_name,
    crm,
    rqe,
    specialty,
    photo_url,
    residency_salary,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_full_name,
    NULL,
    NULL,
    'Pediatria',
    v_avatar_url,
    4106.09,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    doctor_name = EXCLUDED.doctor_name,
    photo_url = COALESCE(public.profiles.photo_url, EXCLUDED.photo_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. Timestamp (updated_at) Maintenance Triggers
-- ------------------------------------------------------------------------------
-- Automatically bumps updated_at = NOW() before any row update across all 4 tables.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Table 1: profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Table 2: shifts
DROP TRIGGER IF EXISTS set_shifts_updated_at ON public.shifts;
CREATE TRIGGER set_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Table 3: expenses
DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Table 4: custom_categories
DROP TRIGGER IF EXISTS set_custom_categories_updated_at ON public.custom_categories;
CREATE TRIGGER set_custom_categories_updated_at
  BEFORE UPDATE ON public.custom_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. High-Performance Composite & Partial Indexes
-- ------------------------------------------------------------------------------
-- Optimized for local-first bidirectional synchronization and pediatric queries:
-- (user_id, date) -> Fast monthly summary filtering
-- (user_id, sync_status) WHERE deleted_at IS NULL -> Fast delta sync polling
-- (user_id, category) -> Fast category expense aggregation (22 canonical categories)

-- Index 1: shifts by user and shift date (Monthly dashboard & calendar)
CREATE INDEX IF NOT EXISTS idx_shifts_user_date
  ON public.shifts (user_id, date);

-- Index 2: shifts delta sync queue (Fast sync polling for unsynced changes)
CREATE INDEX IF NOT EXISTS idx_shifts_user_sync
  ON public.shifts (user_id, sync_status)
  WHERE deleted_at IS NULL;

-- Index 3: expenses by user and expense date (Monthly summary & DRE)
CREATE INDEX IF NOT EXISTS idx_expenses_user_date
  ON public.expenses (user_id, date);

-- Index 4: expenses by user and category (Category breakdown & macro-groups)
CREATE INDEX IF NOT EXISTS idx_expenses_user_category
  ON public.expenses (user_id, category);

-- Index 5: expenses delta sync queue (Fast sync polling for unsynced changes)
CREATE INDEX IF NOT EXISTS idx_expenses_user_sync
  ON public.expenses (user_id, sync_status)
  WHERE deleted_at IS NULL;

-- Index 6: custom_categories active list per user
CREATE INDEX IF NOT EXISTS idx_custom_categories_user
  ON public.custom_categories (user_id)
  WHERE deleted_at IS NULL;

-- Index 7: installment groups for multi-month installment management (2x to 24x)
CREATE INDEX IF NOT EXISTS idx_expenses_installment_group
  ON public.expenses (installment_group_id)
  WHERE installment_group_id IS NOT NULL;

-- Index 8: shifts cash regime payout dates (75% D+60 and 25% D+90 cash flow lookups)
CREATE INDEX IF NOT EXISTS idx_shifts_cash_regime_dates
  ON public.shifts (user_id, installment1_date, installment2_date)
  WHERE deleted_at IS NULL;

-- ==============================================================================
-- Migration: 006_v7_unaccent_and_relational_sync.sql
-- Application: Finanças Pediatria v7.0.0
-- Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
-- Description: Unaccent-aware category uniqueness, relational schema integrity,
--              and defense-in-depth Row Level Security verification.
-- ==============================================================================

-- 1. Enable unaccent extension for linguistic normalization (if permitted by PostgreSQL)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Create immutable unaccent wrapper with isolated search_path
CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
SET search_path = public, pg_catalog
AS $$
  SELECT public.unaccent($1);
$$;

-- 3. Enhance case-insensitive & accent-insensitive unique index for custom categories
-- Drops old simple index and establishes unaccent normalization
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'unaccent' AND pronamespace = 'public'::regnamespace
  ) THEN
    DROP INDEX IF EXISTS public.idx_custom_categories_user_name_ci;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_categories_user_name_unaccent 
      ON public.custom_categories (user_id, public.immutable_unaccent(LOWER(TRIM(name))));
  ELSE
    -- Fallback to lowercase trim if unaccent is not available
    CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_categories_user_name_ci 
      ON public.custom_categories (user_id, LOWER(TRIM(name)));
  END IF;
END $$;

-- 4. Ensure public.expenses has all relational synchronization columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN category_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'total_installments'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN total_installments INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'current_installment'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN current_installment INTEGER DEFAULT 1;
  END IF;
END $$;

-- 5. Row Level Security & Defense-in-Depth Verification
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_app_state ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.profiles FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.shifts FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.expenses FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.custom_categories FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.user_app_state FROM anon, PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.shifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.custom_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_app_state TO authenticated;

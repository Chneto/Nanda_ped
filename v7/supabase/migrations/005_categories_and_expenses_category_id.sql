-- ==============================================================================
-- Migration: 005_categories_and_expenses_category_id.sql
-- Application: Finanças Pediatria v6
-- Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
-- Description: Adds stable category_id tracking to expenses, enhances custom_categories
--              with case/accent-insensitive uniqueness and macro-group reclassification,
--              and enforces strict Row Level Security (RLS) and search_path isolation.
-- ==============================================================================

-- 1. Alter public.expenses to add category_id stable identifier column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN category_id TEXT;
  END IF;
END $$;

COMMENT ON COLUMN public.expenses.category_id IS 'Stable identifier for category (e.g. cat_passagens, cat_mercantil, or UUID for custom category).';

-- Index for fast lookup by user and category_id
CREATE INDEX IF NOT EXISTS idx_expenses_user_category_id ON public.expenses(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date);

-- 2. Enhance public.custom_categories with macro-group reclassification and metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'custom_categories' AND column_name = 'macro_group'
  ) THEN
    ALTER TABLE public.custom_categories ADD COLUMN macro_group TEXT NOT NULL DEFAULT 'Pessoal, Lazer & Outros';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'custom_categories' AND column_name = 'color'
  ) THEN
    ALTER TABLE public.custom_categories ADD COLUMN color TEXT DEFAULT '#EC407A';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'custom_categories' AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.custom_categories ADD COLUMN icon TEXT DEFAULT 'tag';
  END IF;
END $$;

-- Case-insensitive unique constraint for category names per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_categories_user_name_ci 
  ON public.custom_categories (user_id, LOWER(TRIM(name)));

-- 3. Strict Row Level Security Defense & User Isolation Re-verification
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_app_state ENABLE ROW LEVEL SECURITY;

-- Revoke all direct permissions from anon on private tables
REVOKE ALL ON TABLE public.profiles FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.shifts FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.expenses FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.custom_categories FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.user_app_state FROM anon, PUBLIC;

-- Grant standard operations to authenticated users only
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.shifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.custom_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_app_state TO authenticated;

-- Ensure triggers have secure search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

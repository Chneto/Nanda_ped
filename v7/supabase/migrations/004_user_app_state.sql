-- V4_Cloud: persist the complete local-first application state per authenticated user.
-- Apply after migrations 001-003. No service key or anonymous access is required.

CREATE TABLE IF NOT EXISTS public.user_app_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(state) = 'object'),
  revision BIGINT NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_app_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_app_state_isolation_policy ON public.user_app_state;
CREATE POLICY user_app_state_isolation_policy ON public.user_app_state
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE public.user_app_state FROM anon, PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_app_state TO authenticated;

-- The timestamp trigger function only edits the current row and needs no elevated role.
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

DROP TRIGGER IF EXISTS set_user_app_state_updated_at ON public.user_app_state;
CREATE TRIGGER set_user_app_state_updated_at
  BEFORE UPDATE ON public.user_app_state
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

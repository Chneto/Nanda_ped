-- ==============================================================================
-- SCRIPT MESTRE DE ATUALIZAÇÃO SUPABASE (POSTGRESQL) - ACESSO DIRETO
-- Aplicação: Finanças Pediatria (Médica)
-- Autor Canônico: FChNeto (APP_CREATOR = 'FChNeto')
-- ==============================================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Abra o painel do Supabase: https://supabase.com/dashboard/project/rdqbhafebdfhsfdlqjdr
-- 2. No menu lateral esquerdo, clique em "SQL Editor"
-- 3. Cole todo este código e clique no botão verde "Run" (Executar).
-- 4. Em seguida, acesse "Authentication" > "Providers" > "Email" e desmarque 
--    a opção "Confirm email" (deixe OFF) para que o login seja 100% direto.
-- ==============================================================================

-- 0. Extensões Criptográficas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ESTRUTURA DAS TABELAS (SCHEMAS)
-- ==============================================================================

-- 1.1 Tabela de Perfis Médicos
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL DEFAULT 'Médica',
    crm TEXT,
    rqe TEXT,
    specialty TEXT DEFAULT 'Pediatria',
    photo_url TEXT,
    residency_salary NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (residency_salary >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 Tabela de Plantões Médicos (Regra D+60 / D+90)
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital TEXT NOT NULL,
    date DATE NOT NULL,
    gross_value NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (gross_value >= 0),
    net_value NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (net_value >= 0),
    installment1_date DATE NOT NULL,
    installment1_value NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (installment1_value >= 0),
    installment2_date DATE NOT NULL,
    installment2_value NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (installment2_value >= 0),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'received')),
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 1.3 Tabela de Despesas e Compras Parceladas
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,
    category TEXT NOT NULL,
    macro_group TEXT NOT NULL,
    total_installments INT NOT NULL DEFAULT 1 CHECK (total_installments >= 1),
    current_installment INT NOT NULL DEFAULT 1 CHECK (current_installment >= 1 AND current_installment <= total_installments),
    installment_group_id UUID,
    payment_method TEXT DEFAULT 'pix' CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'cash', 'transfer', 'boleto', 'other')),
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 1.4 Tabela de Categorias Customizadas Dinâmicas
CREATE TABLE IF NOT EXISTS public.custom_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    macro_group TEXT NOT NULL,
    icon TEXT DEFAULT 'label',
    color TEXT DEFAULT '#EC407A',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_user_category_name UNIQUE (user_id, name)
);

-- ==============================================================================
-- 2. ROW LEVEL SECURITY (RLS) & POLÍTICAS DE ISOLAMENTO
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- Políticas de isolamento por usuário autenticado
DROP POLICY IF EXISTS profiles_isolation_policy ON public.profiles;
CREATE POLICY profiles_isolation_policy ON public.profiles
    FOR ALL TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS shifts_isolation_policy ON public.shifts;
CREATE POLICY shifts_isolation_policy ON public.shifts
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS expenses_isolation_policy ON public.expenses;
CREATE POLICY expenses_isolation_policy ON public.expenses
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS custom_categories_isolation_policy ON public.custom_categories;
CREATE POLICY custom_categories_isolation_policy ON public.custom_categories
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Permissões de Segurança
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==============================================================================
-- 3. TRIGGERS AUTOMÁTICOS DE PERFIL E TIMESTAMP
-- ==============================================================================

-- 3.1 Criação Automática do Perfil Médico ao Cadastrar Usuário
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
  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    'Médica'
  );

  v_avatar_url := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'picture'), ''),
    NULL
  );

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
    0.00,
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3.2 Atualização Automática de updated_at
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

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_shifts_updated_at ON public.shifts;
CREATE TRIGGER set_shifts_updated_at BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_custom_categories_updated_at ON public.custom_categories;
CREATE TRIGGER set_custom_categories_updated_at BEFORE UPDATE ON public.custom_categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. ÍNDICES DE ALTA PERFORMANCE (CONSULTAS E SINCRONIZAÇÃO)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_shifts_user_date ON public.shifts (user_id, date);
CREATE INDEX IF NOT EXISTS idx_shifts_user_sync ON public.shifts (user_id, sync_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses (user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON public.expenses (user_id, category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_sync ON public.expenses (user_id, sync_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_custom_categories_user ON public.custom_categories (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_installment_group ON public.expenses (installment_group_id) WHERE installment_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shifts_cash_regime_dates ON public.shifts (user_id, installment1_date, installment2_date) WHERE deleted_at IS NULL;

-- ==============================================================================
-- 5. CONFIRMAÇÃO AUTOMÁTICA DE USUÁRIOS EXISTENTES (ACESSO DIRETO)
-- ==============================================================================
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

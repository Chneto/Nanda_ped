-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Application: Finanças Pediatria V4_Cloud
-- Milestone: M2 - Supabase PostgreSQL Schema, Migrations & Strict RLS
-- Canonical Author: FChNeto (APP_CREATOR = 'FChNeto')
-- Description: Initial relational schema definition for pediatric financial management.
--              Creates public.profiles, public.shifts, public.expenses,
--              and public.custom_categories with strict types, constraints, and defaults.
-- ==============================================================================

-- 0. Enable UUID generation extension if not already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLE: public.profiles
-- Description: Pediatric physician user profile linked 1:1 to auth.users.
-- ==============================================================================
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

COMMENT ON TABLE public.profiles IS 'Physician profile storing professional credentials, residency stipend, and personal preferences.';
COMMENT ON COLUMN public.profiles.id IS 'Primary key directly referencing auth.users(id).';
COMMENT ON COLUMN public.profiles.doctor_name IS 'Full doctor display name (default: Médica).';
COMMENT ON COLUMN public.profiles.crm IS 'Regional Medical Council registration number (e.g. CRM/TESTE).';
COMMENT ON COLUMN public.profiles.rqe IS 'Specialist Qualification Registry (Registro de Qualificação de Especialista).';
COMMENT ON COLUMN public.profiles.specialty IS 'Medical specialty area (default: Pediatria).';
COMMENT ON COLUMN public.profiles.photo_url IS 'Public or signed URL to physician avatar photo.';
COMMENT ON COLUMN public.profiles.residency_salary IS 'Net monthly pediatric residency fellowship stipend (default: 0.00).';
COMMENT ON COLUMN public.profiles.created_at IS 'Record creation timestamp with timezone.';
COMMENT ON COLUMN public.profiles.updated_at IS 'Record last update timestamp with timezone.';


-- ==============================================================================
-- 2. TABLE: public.shifts
-- Description: Pediatric delivery room and hospital shifts with canonical D+60 / D+90
--              split (75% at D+60 and 25% at D+90) and soft-deletion tracking.
-- ==============================================================================
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

COMMENT ON TABLE public.shifts IS 'Pediatric hospital shifts with D+60 (75%) and D+90 (25%) payment distribution.';
COMMENT ON COLUMN public.shifts.id IS 'Unique identifier for the shift record.';
COMMENT ON COLUMN public.shifts.user_id IS 'Owner physician referencing auth.users(id).';
COMMENT ON COLUMN public.shifts.hospital IS 'Hospital or maternity name (e.g. Maternidade Principal, Maternidade Secundária, Hospital Pediátrico).';
COMMENT ON COLUMN public.shifts.date IS 'Date the shift was worked (ISO 8601 YYYY-MM-DD).';
COMMENT ON COLUMN public.shifts.gross_value IS 'Gross contracted value of the shift before deductions.';
COMMENT ON COLUMN public.shifts.net_value IS 'Net liquid amount to be received for the shift.';
COMMENT ON COLUMN public.shifts.installment1_date IS 'Expected payment date for 75% installment (D+60, 2 months after shift date).';
COMMENT ON COLUMN public.shifts.installment1_value IS 'Amount for first installment (75% of net value rounded to cents).';
COMMENT ON COLUMN public.shifts.installment2_date IS 'Expected payment date for 25% installment (D+90, 3 months after shift date).';
COMMENT ON COLUMN public.shifts.installment2_value IS 'Amount for second installment (25% remaining of net value).';
COMMENT ON COLUMN public.shifts.status IS 'Clinical shift operational status: confirmed, pending, cancelled, received.';
COMMENT ON COLUMN public.shifts.sync_status IS 'Offline sync replication status: synced, pending, conflict.';
COMMENT ON COLUMN public.shifts.created_at IS 'Record creation timestamp with timezone.';
COMMENT ON COLUMN public.shifts.updated_at IS 'Record last update timestamp with timezone.';
COMMENT ON COLUMN public.shifts.deleted_at IS 'Soft-delete timestamp for offline sync tombstone propagation.';


-- ==============================================================================
-- 3. TABLE: public.expenses
-- Description: Financial expenses categorized across 6 intelligent macro-groups and
--              22/23 canonical categories, supporting multi-month installment purchases.
-- ==============================================================================
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

COMMENT ON TABLE public.expenses IS 'Categorized medical and personal expenses with installment tracking and macro-groups.';
COMMENT ON COLUMN public.expenses.id IS 'Unique identifier for the expense record.';
COMMENT ON COLUMN public.expenses.user_id IS 'Owner physician referencing auth.users(id).';
COMMENT ON COLUMN public.expenses.description IS 'Item or service description (e.g. Congresso Brasileiro de Pediatria).';
COMMENT ON COLUMN public.expenses.amount IS 'Monetary value of this specific installment or single expense.';
COMMENT ON COLUMN public.expenses.date IS 'Payment or due date (ISO 8601 YYYY-MM-DD).';
COMMENT ON COLUMN public.expenses.category IS 'Canonical category (e.g. Remédios, Aluguel, Mercantil, Qualificação/Congresso/Pós).';
COMMENT ON COLUMN public.expenses.macro_group IS 'Macro-group: Alimentação, Transporte, Moradia, Formação, Saúde & Autocuidado, Lazer/Outros.';
COMMENT ON COLUMN public.expenses.total_installments IS 'Total number of installments (1 for single payment, 2..24 for credit installments).';
COMMENT ON COLUMN public.expenses.current_installment IS 'Current installment number (1 <= current_installment <= total_installments).';
COMMENT ON COLUMN public.expenses.installment_group_id IS 'UUID linking all installments of the same original transaction together.';
COMMENT ON COLUMN public.expenses.payment_method IS 'Payment modality: pix, credit_card, debit_card, cash, transfer, boleto, other.';
COMMENT ON COLUMN public.expenses.sync_status IS 'Offline sync replication status: synced, pending, conflict.';
COMMENT ON COLUMN public.expenses.created_at IS 'Record creation timestamp with timezone.';
COMMENT ON COLUMN public.expenses.updated_at IS 'Record last update timestamp with timezone.';
COMMENT ON COLUMN public.expenses.deleted_at IS 'Soft-delete timestamp for offline sync tombstone propagation.';


-- ==============================================================================
-- 4. TABLE: public.custom_categories
-- Description: User-defined customized expense categories dynamically integrated
--              into the 6 macro-groups with custom icons and Silk & Rose Gold palette.
-- ==============================================================================
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

COMMENT ON TABLE public.custom_categories IS 'Custom expense categories created by the physician with custom color and icon.';
COMMENT ON COLUMN public.custom_categories.id IS 'Unique identifier for the custom category.';
COMMENT ON COLUMN public.custom_categories.user_id IS 'Owner physician referencing auth.users(id).';
COMMENT ON COLUMN public.custom_categories.name IS 'Custom category label (e.g. Equipamentos Pediátricos).';
COMMENT ON COLUMN public.custom_categories.macro_group IS 'Associated macro-group linking to analytics aggregation.';
COMMENT ON COLUMN public.custom_categories.icon IS 'Inline SVG icon identifier (default: label).';
COMMENT ON COLUMN public.custom_categories.color IS 'Hex color string for visual identity (default: #EC407A Rose Gold).';
COMMENT ON COLUMN public.custom_categories.created_at IS 'Record creation timestamp with timezone.';
COMMENT ON COLUMN public.custom_categories.updated_at IS 'Record last update timestamp with timezone.';
COMMENT ON COLUMN public.custom_categories.deleted_at IS 'Soft-delete timestamp for offline sync tombstone propagation.';

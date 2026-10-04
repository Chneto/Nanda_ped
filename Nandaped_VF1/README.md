# 🌸 Finanças Pediatria — Versão Final (Nandaped_VF1) ☁️✨

> **Autor Canônico e Imutável:** **FChNeto** (`APP_CREATOR = 'FChNeto'`)  
> **Aplicação:** Finanças Pediatria  
> **Público-Alvo:** Médica Pediatra (Médica)  
> **Status de Confiabilidade:** **606 Testes Automatizados Aprovados (0 Falhas)**

---

## 🧭 Visão Geral

A pasta **`Nandaped_VF1`** contém exclusivamente os arquivos necessários para o pleno funcionamento da versão final consolidada do **Finanças Pediatria**. Todos os arquivos de versões legadas anteriores foram removidos, resultando em uma aplicação 100% limpa, autônoma e de alta performance.

---

## 🌟 Principais Funcionalidades da Versão Final (VF1)

1. **Interface de Conexão "Silk Gate"**:
   - Autenticação em 1 toque via **Google OAuth**.
   - Conexão sem senha via **Magic Link por E-mail**.
   - **Modo Hospital / Convidada (Local-First Offline)**: Permite utilizar a aplicação imediatamente em áreas sem sinal de internet (UTI neonatal, sala de parto, enfermarias).

2. **Banco de Dados Supabase (PostgreSQL) com RLS Estrito**:
   - Migrations em `supabase/migrations/` (`001_initial_schema.sql`, `002_enable_rls.sql`, `003_triggers_and_indexes.sql`).
   - Row Level Security (RLS) habilitado com isolamento absoluto por `auth.uid() = user_id`. Zero vazamento de dados.

3. **Pronta para Publicação na Vercel**:
   - Roteamento SPA limpo via `vercel.json` com reescrita para `/index.html`.
   - Security Headers de nível bancário (Content-Security-Policy, HSTS 2 anos, X-Frame-Options DENY).

4. **Regras de Negócio Financeiras Pediátricas**:
   - Cálculo de plantões em sala de parto: **75% em D+60 (2 meses)** e **25% em D+90 (3 meses)**.
   - Categorização em **6 Macro-Grupos** (Alimentação, Transporte, Moradia, Formação, Saúde, Pessoal).
   - Presença de todas as **22 categorias canônicas de despesas**.
   - Pré-seleção de maternidades (Maternidade Principal, Maternidade Secundária, Hospital Pediátrico).
   - Compras parceladas (2x a 24x) com projeção mensal.
   - Regimes de Caixa x Competência.

5. **Ergonomia iPhone 16 Plus**:
   - Margens de segurança (`env(safe-area-inset-top)` e `env(safe-area-inset-top)`).
   - Anti-zoom em formulários (`font-size: 16px`).
   - 82 Ícones em SVG puro embutidos em `js/icons.js` (anti-blowout).
   - Modais com *In-Flow Expansion* anti-crop.

---

## 🚀 Como Executar Localmente e Testar

```bash
# Navegar até a pasta
cd Nandaped_VF1

# Executar toda a suíte de testes (606 testes)
node tests/run_all.js

# Iniciar servidor local
npm start
```

---

## ☁️ Como Publicar na Vercel

1. No painel da **Vercel**, conecte este repositório.
2. Defina o **Root Directory** para: `Nandaped_VF1`
3. Framework Preset: **Other** (Estático)
4. Clique em **Deploy**.

---

## 🗄️ Como Configurar o Supabase

No **SQL Editor** do seu projeto Supabase, execute em ordem os arquivos de `supabase/migrations/`:
1. `001_initial_schema.sql`
2. `002_enable_rls.sql`
3. `003_triggers_and_indexes.sql`

---

*Finanças Pediatria — Desenvolvido com amor, rigor técnico e foco na médica por FChNeto.* 🩺🌸✨

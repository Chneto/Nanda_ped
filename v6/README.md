# 🩺🌸 Finanças Pediatria v6 — Cloud & Sanctuary Edition (v6.0.0)

> **Santuário Financeiro Especializado para Médica Pediatra e Neonatologista.**  
> **Autor Canônico Imutável:** **FChNeto** (`APP_CREATOR = 'FChNeto'`)  
> **Arquitetura:** Vanilla ES6+ • Local-First • CSP Estrita • Supabase Auth & RLS • Offline Hospitalar  

---

## 🌟 1. Visão Geral da Versão v6

A versão **v6 (v6.0.0)** consolida a experiência de gestão financeira em nuvem com alta segurança, conformidade total com políticas CSP rigorosas (`script-src 'self'`, sem `unsafe-inline`), governança completa das 23 categorias canônicas e resolução inteligente de conflitos entre múltiplos dispositivos.

### 🛡️ Invariantes de Segurança & Conformidade
1. **Zero Segredos Hardcoded:** Nenhuma chave Supabase está fixada no código do cliente.
2. **CSP Estrita:** Todos os botões e disparadores de interface utilizam delegação limpa de eventos (`data-action`, `data-open-modal`, `data-tab`).
3. **Endpoint `/api/config` Seguro:** Apenas requisições `GET` são aceitas com `Cache-Control: no-store`; chaves `service_role` ou administrativas são detectadas e rejeitadas automaticamente.
4. **Proteção Contra Conflitos de Revisão:** Detecção de concorrência com bloqueio otimista (`revision` incremental) e diálogo de resolução que impede perda de dados gerando backups em JSON.
5. **Acessibilidade & Ergonomia iOS:** Viewport com zoom manual preservado (`viewport-fit=cover`), inputs com `font-size: 16px` contra auto-zoom do Safari, sem cortes visuais (*in-flow expansion*).

---

## 🗂️ 2. As 23 Categorias Canônicas & 6 Macro-Grupos

As despesas são organizadas nos **6 Macro-Grupos Inteligentes**, com mapeamento canônico para as 23 categorias:

1. **Moradia & Contas:** `Aluguel`, `Energia`, `Água`, `Internet`
2. **Transporte & Mobilidade:** `Passagens`, `Combustível`, `Uber`
3. **Alimentação:** `Mercantil`, `Lanches`, `Refeição`, `Delivery`
4. **Formação & Carreira:** `Estudo`, `Cursos`, `Qualificação/Congresso/Pós`
5. **Saúde & Autocuidado:** `Remédios`, `Academia`, `Fisioterapia`, `Beleza/Salão`, `Produtos de beleza`
6. **Pessoal, Lazer & Outros:** `Presentes`, `Doação`, `Compras Parceladas`, `Saídas`

*A médica tem total liberdade para criar novas categorias personalizadas, renomear ou reclassificar existentes, com propagação atômica para o histórico de lançamentos.*

---

## 🩺 3. Regras de Negócio & Cálculos Financeiros

- **Plantões em Sala de Parto:** 75% líquido creditado em D+60 (2 meses) e 25% restante em D+90 (3 meses), com preservação exata de centavos e fechamento de meses.
- **Compras Parceladas (2x a 24x):** Projeção mensal consecutiva com atribuição de centavos residuais na 1ª parcela.
- **Regime de Caixa vs. Competência:** Alternância instantânea no painel superior para controle do fluxo de caixa real vs. produção médica trabalhada.

---

## 🚀 4. Guia de Deploy & Configurações de Produção

### A) Configuração no Vercel:
- **Root Directory:** `v6` (ou raiz de projeto configurada para v6)
- **Environment Variables:**
  - `SUPABASE_URL`: `https://<seu-projeto>.supabase.co`
  - `SUPABASE_ANON_KEY`: `<sua-chave-anon-publica>` (⚠️ **Nunca** insira a `service_role` key no frontend ou variáveis públicas).
- **Proteção do Endpoint `/api/config`:** Se as variáveis não estiverem configuradas, o endpoint responde `{ configured: false }` e impede o frontend de utilizar fallbacks de outros projetos salvos em `localStorage`.

### B) Configuração no Supabase Dashboard:
1. **Autenticação > URL Configuration:**
   - **Site URL:** URL principal da aplicação (ex: `https://financas-pediatria.vercel.app` ou `https://<usuario>.github.io/Nanda_ped/v6/`).
   - **Redirect URLs:** Adicione todas as URLs válidas para callbacks de login:
     - `https://*.vercel.app/**`
     - `https://*.github.io/**`
     - `https://<usuario>.github.io/Nanda_ped/v6/**`
     - `http://localhost:3000/**`
     - `http://127.0.0.1:8080/**`
2. **Provedor Google OAuth:**
   - Acesse **Auth > Providers > Google** e insira o `Client ID` e `Client Secret` obtidos no Google Cloud Console.
   - Ative a opção *Enable Sign in with Google*.
3. **Google Cloud Console (Credenciais OAuth 2.0):**
   - **Origens JavaScript autorizadas:**
     - `https://<seu-projeto>.supabase.co`
     - `https://financas-pediatria.vercel.app`
     - `https://<usuario>.github.io`
     - `http://localhost:3000`
   - **URIs de redirecionamento autorizados:**
     - `https://<seu-projeto>.supabase.co/auth/v1/callback`
4. **Configurações de E-mail (Magic Link & Senha):**
   - Em **Auth > Email Templates / Settings**, configure se a confirmação de e-mail é obrigatória (*Confirm email* ativado ou desativado para testes rápidos).

### C) Deploy em Subdiretórios (GitHub Pages / Subpastas):
A aplicação v6 calcula dinamicamente o redirecionamento OAuth preservando o caminho da URL (`window.location.pathname`), garantindo que deploys sob subpastas como `/Nanda_ped/v6/` ou `/v6/` recebam o token de autenticação sem serem redirecionados para a raiz do domínio.

### D) Banco de Dados (Supabase SQL & RLS Multi-Tenant):
Execute as migrações na ordem para criar a estrutura e garantir isolamento estrito entre usuárias médicas:
1. `supabase/migrations/001_initial_schema.sql` (Tabelas canônicas: perfis, plantões, despesas, categorias)
2. `supabase/migrations/002_enable_rls.sql` (Row Level Security com `auth.uid() = user_id`)
3. `supabase/migrations/003_triggers_and_indexes.sql` (Timestamps UTC automáticos e índices de performance)
4. `supabase/migrations/004_user_app_state.sql` (Armazenamento de snapshot de estado por usuária com detecção de revisão)
5. `supabase/migrations/005_categories_and_expenses_category_id.sql` (Suporte a `category_id` estável nas despesas)

---

## 🧪 5. Execução de Testes Automatizados

```bash
# Executar todos os testes da versão v6
node --test v6/tests/*.test.js

# Executar todas as suítes do ecossistema
node --test tests/*.test.js
cd V4_Cloud && node --test tests/*.test.js && cd ..
cd v6 && node --test tests/*.test.js && cd ..
```

---

*Finanças Pediatria v6 — Cuidando das finanças de quem cuida com amor e dedicação.* 🩺🌸✨
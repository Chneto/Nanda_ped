# CONTEXT — Domínio do Produto e Arquitetura

> **Aplicação:** Finanças Pediatria  
> **Autoria:** **FChNeto** (`APP_CREATOR = 'FChNeto'`)  
> **Perfil de uso:** profissionais da saúde que desejam organizar receitas e despesas.

Este documento descreve regras e módulos do produto. Não contém dados de uma pessoa, local de trabalho, conta bancária ou perfil financeiro real. Os valores usados nos testes automatizados são sintéticos.

## 1. Problema atendido

O aplicativo organiza rendimentos fixos configuráveis, rendimentos variáveis e despesas. Como alguns pagamentos podem ocorrer após a prestação do serviço, o fluxo de caixa deve considerar a data prevista de recebimento, além do mês em que o trabalho foi realizado.

Para plantões configurados com a regra padrão, o sistema projeta 75% do valor líquido em D+60 e 25% em D+90. Esses percentuais são regras do produto; os valores e datas dos lançamentos são informados pela pessoa usuária.

## 2. Fontes de renda, categorias e lançamentos

A versão principal **`v8.0.0`** (na raiz `/` e em `/v8/`) mantém a carga inicial das 23 categorias canônicas documentadas em `agents.md` e permite, pelo menu hambúrguer, adicionar, editar e remover tanto **fontes de aferição de renda / locais de plantão** (nome, regra de recebimento `D+0`, `D+30`, `75% D+60 / 25% D+90` ou customizada, valor padrão sugerido, tipo e ícone/cor) quanto **categorias de despesas** nos 6 Macro-Grupos (com teto mensal opcional e botão seguro de restauração das categorias padrão). O aplicativo preserva integralmente os lançamentos históricos via *Soft-Archive* e *Double Snapshotting*, permite edição de qualquer lançamento em 1 toque diretamente na lista e exibe Toasts com botão *"Desfazer / Undo"* ao excluir itens. O aplicativo não pré-preenche transações ou valores financeiros pessoais de uma pessoa real.

Compras parceladas geram parcelas futuras a partir da data informada. A distribuição de centavos de arredondamento deve preservar a soma total da compra.

## 3. Regimes de cálculo

- **Regime de caixa:** soma rendimentos fixos ativos e parcelas previstas para recebimento no mês; depois subtrai as despesas do período.
- **Regime de competência:** soma rendimentos fixos ativos e produção atribuída ao mês em que o serviço foi realizado.

Valores de salário, impostos e despesas são campos configuráveis pela pessoa usuária. A instalação inicia sem valores financeiros pessoais preenchidos.

## 4. Módulos executivos

As versões históricas incluem relatórios de resultado, conciliação de arquivos OFX/CSV, simuladores e ferramentas de apoio. Estimativas fiscais são informativas e dependem dos parâmetros preenchidos e da legislação vigente.

O módulo SBAR deve evitar a inclusão de dados identificáveis de pacientes em demonstrações ou exemplos. Os exemplos dos testes usam identificadores sintéticos.

## 5. Arquitetura e implantação

- **`/` e `/v8/` (Versão Principal v8.0.0 Standalone & Pediatric Sanctuary):** 100% local-first e offline para iPhone/iOS, sem qualquer dependência de Vercel ou Supabase e sem telas de login, operando com CSP estrita (`script-src 'self'`), Service Worker offline (`sw.js`) e persistência tripla no Safari (`localStorage` + `IndexedDB` `v8_pediatric_db` + `Web Share API` com importação retrocompatível `v2`–`v7`). Sincronizada para a raiz `/` do GitHub Pages via `node scripts/build_bundle.js`.
- As versões históricas locais (`v2.0`, `v4`, `v5`) usam JavaScript padrão, armazenamento local e bundles gerados por `node scripts/build_bundle.js`.
- As variantes em nuvem (`v7`, `v6` e `V4_Cloud`) utilizam Vercel para servir o frontend com CSP estrita (sem `unsafe-inline`) e Supabase Auth/Postgres para autenticação e sincronização por conta com Row Level Security (RLS).
- Chaves secretas ou administrativas (`service_role`) nunca podem ser incluídas no frontend ou retornadas por `/api/config`. As tabelas expostas exigem RLS e isolamento estrito por `auth.uid() = user_id`.
- Conflitos de sincronização entre múltiplos dispositivos são detectados com bloqueio otimista (`revision` incremental) e resolvidos pelo usuário com backups de segurança gerados automaticamente.
- As variáveis do provedor OAuth e as URLs de retorno precisam ser configuradas nos painéis externos correspondentes.

## 6. Privacidade de exemplos

Use nomes como “Médica”, estabelecimentos genéricos e endereços reservados como `example.com` em testes e documentação. Não use nome, contato, identificador profissional, empregador ou valor de renda que possa parecer ligado a uma pessoa real.

# CONTEXT — Domínio do Produto e Arquitetura

> **Aplicação:** Finanças Pediatria  
> **Autoria:** **FChNeto** (`APP_CREATOR = 'FChNeto'`)  
> **Perfil de uso:** profissionais da saúde que desejam organizar receitas e despesas.

Este documento descreve regras e módulos do produto. Não contém dados de uma pessoa, local de trabalho, conta bancária ou perfil financeiro real. Os valores usados nos testes automatizados são sintéticos.

## 1. Problema atendido

O aplicativo organiza rendimentos fixos configuráveis, rendimentos variáveis e despesas. Como alguns pagamentos podem ocorrer após a prestação do serviço, o fluxo de caixa deve considerar a data prevista de recebimento, além do mês em que o trabalho foi realizado.

Para plantões configurados com a regra padrão, o sistema projeta 75% do valor líquido em D+60 e 25% em D+90. Esses percentuais são regras do produto; os valores e datas dos lançamentos são informados pela pessoa usuária.

## 2. Categorias e lançamentos

A versão v2 mantém a lista de categorias canônicas documentada em `agents.md`. As versões com categorias próprias permitem criar grupos e subgrupos, renomear categorias e editar despesas. O aplicativo não deve pré-preencher transações ou valores financeiros de uma pessoa.

Compras parceladas geram parcelas futuras a partir da data informada. A distribuição de centavos de arredondamento deve preservar a soma total da compra.

## 3. Regimes de cálculo

- **Regime de caixa:** soma rendimentos fixos ativos e parcelas previstas para recebimento no mês; depois subtrai as despesas do período.
- **Regime de competência:** soma rendimentos fixos ativos e produção atribuída ao mês em que o serviço foi realizado.

Valores de salário, impostos e despesas são campos configuráveis pela pessoa usuária. A instalação inicia sem valores financeiros pessoais preenchidos.

## 4. Módulos executivos

As versões históricas incluem relatórios de resultado, conciliação de arquivos OFX/CSV, simuladores e ferramentas de apoio. Estimativas fiscais são informativas e dependem dos parâmetros preenchidos e da legislação vigente.

O módulo SBAR deve evitar a inclusão de dados identificáveis de pacientes em demonstrações ou exemplos. Os exemplos dos testes usam identificadores sintéticos.

## 5. Arquitetura e implantação

- As versões locais usam JavaScript padrão, armazenamento local e bundles gerados por `node scripts/build_bundle.js`.
- `v6` (versão oficial Cloud & Sanctuary) e `V4_Cloud` utilizam Vercel para servir o frontend com CSP estrita (sem `unsafe-inline`) e Supabase Auth/Postgres para autenticação e sincronização por conta com Row Level Security (RLS).
- Chaves secretas ou administrativas (`service_role`) nunca podem ser incluídas no frontend ou retornadas por `/api/config`. As tabelas expostas exigem RLS e isolamento estrito por `auth.uid() = user_id`.
- Conflitos de sincronização entre múltiplos dispositivos são detectados com bloqueio otimista (`revision` incremental) e resolvidos pelo usuário com backups de segurança gerados automaticamente.
- As variáveis do provedor OAuth e as URLs de retorno precisam ser configuradas nos painéis externos correspondentes.

## 6. Privacidade de exemplos

Use nomes como “Médica”, estabelecimentos genéricos e endereços reservados como `example.com` em testes e documentação. Não use nome, contato, identificador profissional, empregador ou valor de renda que possa parecer ligado a uma pessoa real.

# 🩺🌸 Finanças Pediatria — Gestão Financeira 6.0.0

Aplicativo web responsivo de alta precisão para organização financeira individual de médicas e médicos pediatras e neonatologistas. O projeto mantém versões standalone e a variante oficial em nuvem com sincronização resiliente, CSP estrita e isolamento de contas.

## Versões no Repositório

- **/v6/:** Versão oficial Cloud & Sanctuary 6.0.0 (Supabase Auth/RLS, CSP estrita sem `unsafe-inline`, 23 categorias canônicas mapeadas nos 6 macro-grupos, resolução de conflitos de revisão com backups automáticos).
- **Raiz e /v5/:** Versão standalone 5.0.1 com painel executivo Silk & Rose Gold e persistência local.
- **/V4_Cloud/:** Versão Cloud 4.1.1 (Vercel/Supabase, RLS, snapshot por conta).
- **/v4/ e /v4.0/:** Versão standalone 4.0.0.
- **/v2.0/:** Versão minimalista Sanctuary 2.0.0 (3 abas essenciais, 23 categorias canônicas).

Perfis novos começam com estado limpo, sem nomes, registros profissionais ou dados reais de demonstração. É possível criar, editar e reclassificar categorias para os 6 Macro-Grupos com propagação automática no histórico de lançamentos.

## Validação & Cobertura de Testes

Validações executadas em 2026-10-04 (0 falhas em todas as suítes):

- **Suíte da raiz:** 120 testes aprovados.
- **Suíte V2:** 9 testes aprovados.
- **Suíte V4:** 13 testes aprovados.
- **Suíte V5:** 13 testes aprovados.
- **Suíte V4_Cloud:** 619 testes aprovados.
- **Suíte v6 (Cloud & Sanctuary):** 70 testes aprovados.

### Comandos de Teste:

```bash
# Testes da raiz
node --test tests/*.test.js

# Testes da versão Cloud v6
node --test v6/tests/*.test.js

# Testes da versão V4_Cloud
cd V4_Cloud && node --test tests/*.test.js
```

## Autoria

Aplicação criada por **FChNeto** (`APP_CREATOR = 'FChNeto'`).
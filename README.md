# 🩺🌸 Finanças Pediatria — Gestão Financeira v8.0.0 Standalone & Sanctuary Edition

Aplicativo web responsivo 100% standalone e local-first de alta precisão para organização financeira individual de médicas e médicos pediatras e neonatologistas no iPhone / Safari iOS.

## Versões no Repositório

- **Raiz `/` e `/v8/`:** **Versão Principal v8.0.0 Standalone & Pediatric Sanctuary Edition** — 100% local-first sem nuvem (zero Vercel/Supabase, zero login, abertura instantânea `< 50ms`), persistência tripla no Safari/iOS (`localStorage` + `IndexedDB` `v8_pediatric_db` + `Web Share API` com importação retrocompatível `v2` a `v7`), gestão 100% dinâmica de fontes de renda e categorias de despesas no menu hambúrguer com *Soft-Archive* e microinterações UX Delight (edição em 1 toque, Toasts com *Desfazer/Undo*, chips rápidos).
- **`/v7/`:** Versão Cloud & Sanctuary 7.0.0 (normalização linguística `unaccent`, diagnósticos em tempo real, modelo canônico `category_id` e sincronização relacional).
- **`/v6/`:** Versão Cloud & Sanctuary 6.0.0 (Supabase Auth/RLS, CSP estrita sem `unsafe-inline`, 23 categorias canônicas mapeadas nos 6 macro-grupos, resolução de conflitos de revisão com backups automáticos).
- **`/v5/`:** Versão standalone 5.0.1 com painel executivo Silk & Rose Gold e persistência local.
- **`/V4_Cloud/`:** Versão Cloud 4.1.1 (Vercel/Supabase, RLS, snapshot por conta).
- **`/v4/` e `/v4.0/`:** Versão standalone 4.0.0.
- **`/v2.0/`:** Versão minimalista Sanctuary 2.0.0 (3 abas essenciais, 23 categorias canônicas).

Perfis novos começam com estado limpo, sem nomes, registros profissionais ou dados reais de demonstração. É possível criar, editar, remover e reclassificar tanto fontes de aferição de renda (hospitais/maternidades, regras `D+0`, `D+30`, `75% D+60 / 25% D+90` ou customizadas e valores padrão) quanto categorias de despesas para os 6 Macro-Grupos, com preservação integral do histórico de lançamentos.

## Validação & Cobertura de Testes

Validações executadas em 2026-11-05 (**979 testes aprovados / 0 falhas** em todas as suítes):

- **Suíte da raiz (`v2`–`v5`):** 120 testes aprovados.
- **Suíte V4_Cloud:** 619 testes aprovados.
- **Suíte v6 (Cloud & Sanctuary):** 77 testes aprovados.
- **Suíte v7 (Cloud & Sanctuary):** 64 testes aprovados.
- **Suíte v8 (Standalone & Sanctuary — Domínio, Storage, Fuzzing 10k & Playwright E2E iPhone 16 Plus):** 99 testes aprovados.

### Comandos de Teste:

```bash
# Testes da raiz
node --test tests/*.test.js

# Testes da versão principal Standalone v8 (inclui E2E Playwright iPhone 16 Plus)
node --test v8/tests/*.test.js

# Testes das versões Cloud v7, v6 e V4_Cloud
cd v7 && node --test tests/*.test.js && cd ..
cd v6 && node --test tests/*.test.js && cd ..
cd V4_Cloud && node --test tests/*.test.js && cd ..
```

## Autoria

Aplicação criada por **FChNeto** (`APP_CREATOR = 'FChNeto'`).
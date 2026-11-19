# 🩺🌸 Finanças Pediatria — Gestão Financeira v8.0.0 Standalone & Sanctuary Edition

Aplicativo web responsivo 100% standalone e local-first de alta precisão para organização financeira individual de médicas e médicos pediatras e neonatologistas no iPhone / Safari iOS.

## Versões no Repositório

- **Raiz `/` e `/v8/`:** **Versão Principal v8.0.0 Standalone & Pediatric Sanctuary Edition** — 100% local-first sem nuvem (zero Vercel/Supabase, zero login, abertura instantânea `< 50ms`), persistência tripla no Safari/iOS (`localStorage` + `IndexedDB` `v8_pediatric_db` + `Web Share API` com importação retrocompatível `v2` a `v7`), gestão 100% dinâmica de fontes de renda e categorias de despesas no menu hambúrguer com *Soft-Archive* e microinterações UX Delight (edição em 1 toque, Toasts com *Desfazer/Undo*, chips rápidos).
- **`/v5/`:** Versão standalone 5.0.1 com painel executivo Silk & Rose Gold e persistência local.
- **`/v4/` e `/v4.0/`:** Versão standalone 4.0.0.
- **`/v2.0/`:** Versão minimalista Sanctuary 2.0.0 (3 abas essenciais, 23 categorias canônicas).

> **Publicação:** somente commit no GitHub e **GitHub Pages** (`https://chneto.github.io/Nanda_ped/`). A hospedagem na Vercel foi descontinuada; as versões Cloud (V4_Cloud, v6, v7) foram removidas do repositório e podem ser restauradas com `git checkout archive/cloud-before-removal -- V4_Cloud v6 v7`.

Perfis novos começam com estado limpo, sem nomes, registros profissionais ou dados reais de demonstração. É possível criar, editar, remover e reclassificar tanto fontes de aferição de renda (hospitais/maternidades, regras `D+0`, `D+30`, `75% D+60 / 25% D+90` ou customizadas e valores padrão) quanto categorias de despesas para os 6 Macro-Grupos, com preservação integral do histórico de lançamentos.

## Validação & Cobertura de Testes

Validações executadas em 2026-11-18 (**269 testes aprovados / 0 falhas**):

- **Suíte da raiz (`v2`–`v5`):** 120 testes aprovados.
- **Suíte v8 (Standalone & Sanctuary — domínio, storage, fuzzing, portabilidade GitHub Pages, acessibilidade):** 149 testes aprovados (135 de domínio/storage/UI + 14 E2E Playwright em Chrome emulando iPhone 16 Plus; exigem `npm install`, e no CI são obrigatórios via `REQUIRE_E2E=1`).

### Comandos de Teste:

```bash
# Testes da raiz
node --test tests/*.test.js

# Testes da versão principal Standalone v8 (inclui E2E Playwright iPhone 16 Plus)
node --test v8/tests/*.test.js

```

## Autoria

Aplicação criada por **FChNeto** (`APP_CREATOR = 'FChNeto'`).
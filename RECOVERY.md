# RECOVERY - Financas Pediatria

**Criado por:** FChNeto

## Pontos de restauracao

- **Snapshot atual: `recovery/snapshot_v8.1/`** - copia completa de `v8/` (v8.1.0: categorias em grupos, tetos, relatorio mensal, grafico Caixa x Competencia, edicao de parcelas, acessibilidade). Para restaurar: copie o conteudo para `v8/` e rode `node scripts/build_bundle.js`; depois revise o `index.html` da raiz com `git diff`.
- **Base dos testes da raiz: `recovery/snapshot_v3.1.1/` (mantido porque a suite legada da raiz o importa; nao apagar).
- **Historico (v2 a v8.0, V4_Cloud, v6, v7):** removido da arvore em 2026-11 para reduzir o repositorio. Tudo continua no Git pelas tags:
  - `archive/recovery-before-cleanup` - todos os snapshots antigos de `recovery/`.
  - `archive/cloud-before-removal` - V4_Cloud, v6 e v7 (Vercel/Supabase).
  Para consultar: `git checkout archive/recovery-before-cleanup -- recovery/snapshot_vX.X`.

## Dados do usuario

Os dados ficam no aparelho (localStorage + IndexedDB `v8_pediatric_db`). Restaure pelo menu: Importar backup (o app guarda um instantaneo de seguranca e oferece Desfazer).


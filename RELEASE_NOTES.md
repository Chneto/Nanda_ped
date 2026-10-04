# Notas de Versão — Finanças Pediatria

## Versão v6.0.0 — Cloud & Sanctuary Edition (Oficial)

- **Conformidade Estrita com CSP:** Remoção completa de `unsafe-inline` em `script-src` de `vercel.json` e erradicação de manipuladores `on*` inline no HTML/templates JS, migrados para delegação declarativa (`data-action`, `data-open-modal`).
- **Governança Total das 23 Categorias Canônicas:** Mapeamento integral nos 6 Macro-Grupos Inteligentes, com suporte à renomeação, reclassificação e propagação atômica em lançamentos históricos com integridade de `category_id`.
- **Prevenção de Perda de Dados em Conflitos de Nuvem:** Detecção de concorrência por bloqueio otimista (`revision` incremental) no Supabase, com diálogo acessível de resolução (`#modal-sync-conflict`) e exportação preventiva automática de backups `.json`.
- **Blindagem do Endpoint `/api/config`:** Suporte a cold starts serverless (timeout 4,5s), rejeição estrita de métodos não-GET e bloqueio de chaves `service_role` ou administrativas.
- **Acessibilidade & Ergonomia iOS Safari:** Viewport acessível sem restrição de zoom (`width=device-width, initial-scale=1.0, viewport-fit=cover`), inputs com `font-size: 16px`, modais com `role="dialog"` e gerenciamento de foco (`_lastFocusedElement`).
- **Cobertura Automatizada:** 70 testes passando com 0 falhas em `v6/tests/*.test.js`.

## Versão Standalone 5.0.1

- Perfis novos sem nome ou dados financeiros pré-preenchidos.
- Categorias podem ser criadas e renomeadas; lançamentos existentes podem ser editados.
- Versões, metadados e documentação alinhados.

## Versão V4_Cloud 4.1.1

- Padrões de perfil sem identificação pessoal ou valores preenchidos.
- Acesso por Google e e-mail, com persistência separada por conta.
- Edição de categorias e lançamentos.

## Verificação Automatizada

Na revisão de 2026-10-04, 100% dos testes foram aprovados com 0 falhas:
- Raiz: 120 testes aprovados.
- V4_Cloud: 619 testes aprovados.
- v6 (Cloud & Sanctuary): 70 testes aprovados.

Criado por **FChNeto** (`APP_CREATOR = 'FChNeto'`).
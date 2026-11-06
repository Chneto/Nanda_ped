# Notas de Versão — Finanças Pediatria

## Versão v8.0.0 — Standalone & Pediatric Sanctuary Edition (Principal em `/` e `/v8/`)

- **100% Standalone Local-First para iPhone (Zero Vercel / Zero Supabase):** Eliminação completa de chamadas de rede, SDKs de nuvem e telas de login (`Silk Gate`), garantindo abertura instantânea (`< 50ms`) diretamente no painel **Início** (`#view-home`). Promovida tanto na raiz `/` do GitHub Pages (`https://chneto.github.io/Nanda_ped/`) quanto em `/v8/`.
- **Persistência Tripla no Safari/iOS & Retrocompatibilidade (`v2`–`v7`):** Camada síncrona `localStorage` (`v8_pediatric_state`) + camada assíncrona durável `IndexedDB` (`v8_pediatric_db` com *Safari Quota Shield* para avatares/fotos) + exportação em 1 toque via **Web Share API** (*"Salvar no Meu iPhone"* / iCloud Drive) e motor de importação polimórfico compatível com backups de todas as versões anteriores (`v2` a `v7`).
- **Gestão 100% Dinâmica de Fontes de Renda e Categorias no Menu Hambúrguer:** Cadastro, edição e remoção completa de fontes de renda/plantões (nome, regra de recebimento `D+0`, `D+30`, `75% D+60 / 25% D+90` ou customizada, valor padrão sugerido, tipo e ícone/cor) e de categorias de despesas nos 6 Macro-Grupos (com teto mensal opcional, botão *"Restaurar Categorias Padrão"* e *Soft-Archive* para preservar lançamentos históricos).
- **Alta Agradabilidade (UX Delight) & Fidelidade Estética Intacta:** Edição rápida em 1 toque diretamente na lista de transações, Toasts suaves com botão **"Desfazer / Undo"** conectado à lixeira (`undo_trash`), chips rápidos dinâmicos no topo dos modais, preservação 100% das fontes (`Bricolage Grotesque` e `Manrope`), paleta *Silk & Rose Gold*, Modo Noturno UTI Neonatal (`[data-theme="dark"]`) e 37 ícones em SVG inline.
- **Cobertura Automatizada & E2E no Navegador:** 99 testes dedicados aprovados em `v8/tests/*.test.js` (incluindo 10.000 ensaios de fuzzing financeiro e suíte E2E Playwright simulando iPhone 16 Plus `430x932` sem erros de console).

## Versão v7.0.0 — Cloud & Sanctuary Edition (`/v7/`)

- **Normalização Linguística `unaccent` & Unicidade Canônica:** Migração SQL `006` com função `normalize_category_key()` insensível a caixa, espaços e acentos.
- **Painel de Diagnósticos em Tempo Real na UI:** Verificação visual de configuração de runtime, conectividade, estado de sessão e versão de migração.
- **Sincronização Relacional em Background:** Persistência dupla coerente entre `user_app_state` e tabelas relacionais (`expenses`, `custom_categories`, `shifts`) com `category_id`.
- **Cobertura Automatizada:** 64 testes aprovados em `v7/tests/*.test.js`.

## Versão v6.0.0 — Cloud & Sanctuary Edition (`/v6/`)

- **Conformidade Estrita com CSP:** Remoção completa de `unsafe-inline` em `script-src` de `vercel.json` e erradicação de manipuladores `on*` inline no HTML/templates JS, migrados para delegação declarativa (`data-action`, `data-open-modal`).
- **Governança Total das 23 Categorias Canônicas:** Mapeamento integral nos 6 Macro-Grupos Inteligentes, com suporte à renomeação, reclassificação e propagação atômica em lançamentos históricos com integridade de `category_id`.
- **Prevenção de Perda de Dados em Conflitos de Nuvem:** Detecção de concorrência por bloqueio otimista (`revision` incremental) no Supabase, com diálogo acessível de resolução (`#modal-sync-conflict`) e exportação preventiva automática de backups `.json`.
- **Blindagem do Endpoint `/api/config`:** Suporte a cold starts serverless (timeout 4,5s), rejeição estrita de métodos não-GET e bloqueio de chaves `service_role` ou administrativas.
- **Acessibilidade & Ergonomia iOS Safari:** Viewport acessível sem restrição de zoom (`width=device-width, initial-scale=1.0, viewport-fit=cover`), inputs com `font-size: 16px`, modais com `role="dialog"` e gerenciamento de foco (`_lastFocusedElement`).
- **Cobertura Automatizada:** 77 testes passando com 0 falhas em `v6/tests/*.test.js`.

## Versão Standalone 5.0.1 (`/v5/`)

- Perfis novos sem nome ou dados financeiros pré-preenchidos.
- Categorias podem ser criadas e renomeadas; lançamentos existentes podem ser editados.
- Versões, metadados e documentação alinhados.

## Versão V4_Cloud 4.1.1 (`/V4_Cloud/`)

- Padrões de perfil sem identificação pessoal ou valores preenchidos.
- Acesso por Google e e-mail, com persistência separada por conta.
- Edição de categorias e lançamentos.

## Verificação Automatizada

Na revisão de 2026-11-05, **979 testes automatizados** foram aprovados com **0 falhas**:
- Raiz (`v2`–`v5`): 120 testes aprovados.
- V4_Cloud: 619 testes aprovados.
- v6 (Cloud & Sanctuary): 77 testes aprovados.
- v7 (Cloud & Sanctuary): 64 testes aprovados.
- v8 (Standalone & Sanctuary — Domínio, Storage, Fuzzing 10k & Playwright E2E iPhone 16 Plus): 99 testes aprovados.

Criado por **FChNeto** (`APP_CREATOR = 'FChNeto'`).
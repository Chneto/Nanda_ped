# Plano de Execução — Finanças Pediatria (foco iOS / v8)

**Data:** 2026-11-18 · **Base:** análise estática + execução das suítes (nenhum código alterado).

## 1. Diagnóstico

**Estado de saúde:** todas as suítes executadas passam — raiz 120/120, V4_Cloud 619/619, v6 77/77, v7 64/64, v8 90/90. O código é sólido; os problemas são de **organização, entrega no iOS e cobertura**.

**Versão mais recente:** `v8/` (standalone, local-first). Mas a raiz (`index.html`, `sw.js`, `package.json`) ainda serve a **v5.0.1**. Ou seja: o que está publicado não é o que a documentação chama de versão atual.

**Decisão de publicação (2026-11-18):** o Vercel foi **descartado**. A publicação será somente **commit no GitHub + GitHub Pages**. Isso vale para todo o plano abaixo.

## 2. Problemas encontrados (priorizados)

| # | Prio | Problema | Evidência |
|---|---|---|---|
| 1 | **Alta** | Ícone da tela de início do iPhone quebrado na v8: `apple-touch-icon` e favicon apontam para `../assets/icons/...` (fora da pasta v8). Se v8 for publicada sozinha, o ícone some. | `v8/index.html:32-33` (v8 já tem `assets/icons/` próprio) |
| 2 | **Alta** | 9 testes E2E (Playwright/iPhone 16 Plus) **não executam** — `playwright` não está instalado, o teste se auto-ignora e a suíte aparece "verde" com 90 em vez de 99. Fluxos reais de UI no Safari/WebKit ficam sem prova. | `v8_browser_e2e.test.js` (`skip: !chromium`), sem `node_modules`; usa canal `chrome`, não WebKit |
| 3 | **Alta** | Deploy/raiz desalinhados: o Pages serve a raiz (v5); CI roda suítes mas o `build_bundle`/`ci_security_scan` miram a raiz, não a v8. Há também resíduos de Vercel (`vercel.json`, headers, referências em docs/testes) que não têm mais função. | `index.html` raiz = v5.0.1; `ci.yml`; `vercel.json` |
| 4 | Média | Service Worker v8 é *network-first* e **cacheia toda resposta** (inclui `?action=...`) sem limite; cache name fixo `…-v8-static-v1` (não muda a cada release). Atualização de versão no iPhone fica imprevisível; não há aviso "nova versão disponível". | `v8/sw.js` |
| 5 | Média | `ui.js` com 1.515 linhas e 18 usos de `innerHTML`; `store.js` 1.217 linhas. A sanitização é testada, mas o tamanho dificulta manutenção e o risco de XSS cresce a cada tela nova. | `v8/js/ui.js`, `store.js` |
| 6 | Média | CSP da v8 mantém `style-src 'unsafe-inline'` e referencia Google Fonts, mas o SW ignora origens externas → fontes não ficam offline (cai em fonte do sistema). | `v8/index.html` CSP, `sw.js` |
| 7 | Média | Manifest declara `"purpose": "any maskable"` juntos; ícone maskable precisa de área segura — pode cortar a arte no Android/PWA. iOS usa apple-touch-icon (ver #1). | `v8/manifest.json` |
| 8 | Média | Persistência: IndexedDB `open(DB_NAME, 1)` sem plano de migração de schema; reconciliação só ocorre se o `localStorage` estiver **vazio** — se o Safari purgar parcialmente / `localStorage` ficar mais antigo que o IndexedDB, não há comparação por `lastUpdated`. | `v8/js/storage.js:35`, `app.js` passo 5 |
| 9 | Baixa | Dívida de repositório: 8 pastas de versões (v2, v2.0, v4, v4.0, v5, V4_Cloud, v6, v7, v8), `recovery/` com 33 MB / 378 arquivos, protótipos (`Nandaped_VF1`, `stitch_*`). Cópias quase idênticas (v2≈v2.0, v4≈v4.0). | contagens do diretório |
| 10 | Baixa | Documentação desatualizada/contraditória: AGENTS diz 99 testes na v8 (rodam 90), `PLANO_MELHORIAS.md` (out/2026) foca na v6, `package.json` raiz = 5.0.1, `agents.md` e `AGENTS.md` coexistem. Não há `.gitignore` para `node_modules` mas `package-lock.json` está ignorado (reprodutibilidade). | `package.json`, `agents.md` |
| 11 | Baixa | Viewport raiz (v5) usa `user-scalable=no` (acessibilidade); v8 já corrigiu. | `index.html` raiz |

> Não verificado: comportamento real em iPhone/Safari (sem dispositivo/WebKit neste ambiente), conteúdo de `scripts/ci_security_scan.js` e do Supabase das versões Cloud.

## 2.1 Progresso (2026-11-18)

**Concluído e verificado (suítes: raiz 120, V4_Cloud 619, v6 77, v7 64, v8 96 — 0 falhas):**
- Etapa 1: ícones da v8 apontam para `./assets/icons/`; manifest sem `maskable`, sem BOM; novo teste `v8/tests/v8_pages_portability.test.js` (sem `../`, sem caminhos absolutos, todos os recursos existem).
- Etapa 4 (parcial): cache do SW agora `…-v8-static-v2`, ignora query string. Falta banner de "nova versão" e fontes locais.
- Etapa 3 (parcial): `app.js` adota o IndexedDB quando ele é mais novo que o `localStorage`. Falta migração versionada do IDB e lembrete de backup.

**Segunda rodada (suítes: raiz 120, V4_Cloud 619, v6 77, v7 64, v8 98 — 0 falhas):**
- Etapa 4 concluída: CSP da v8 sem Google Fonts (o app já usava fonte do sistema como fallback); aviso "Nova versão instalada" via `controllerchange`.
- Etapa 3 quase concluída: lembrete de backup após 14 dias (`isBackupStale`, `preferences.lastBackupAt` gravado ao exportar). Falta migração versionada do IndexedDB (schema ainda é v1, sem necessidade hoje).
- Etapa 6 (parcial): `scripts/ci_security_scan.js` agora valida a CSP e os caminhos da v8. Remoção do `vercel.json`/docs ainda pendente (exige sua confirmação).
- Git: o clone `../Nanda_ped` citado no AGENTS.md **não existe** (esse caminho resolve para a própria pasta de trabalho, sem `.git`). Antes do push é preciso informar o repositório/remote.

**Decisão sobre as versões Cloud:** mantidas como referência (nada apagado); decisão final fica para a Etapa 7.

**Pendente:** Etapa 2 (E2E real exige instalar Playwright/WebKit), 5, 6, 7. Nada foi commitado nem publicado.

## 2.2 Progresso final (2026-11-18)

**Concluídas:** Etapas 1, 2 (E2E em Chrome, obrigatório no CI), 3 (parte: IndexedDB × localStorage e lembrete de backup), 4, 5 (`ui.js` modular + a11y de diálogos), 6 (somente GitHub Pages; Vercel removido) e 7 (versões Cloud, `Nandaped_VF1`, resíduos da raiz e documentos). Extra: categorias em grupos e subgrupos; versão 8.1.0 com snapshot `recovery/snapshot_v8.1/`.

**Em aberto:** testes em WebKit/iPhone real; migração versionada do IndexedDB; limpeza do `recovery/` (33 MB, exigido pelo AGENTS.md); Etapa 8 (relatórios, gráfico caixa × competência).

## 3. Plano em etapas

Cada etapa termina com **as 5 suítes verdes** (regra do AGENTS.md) e é revisável isoladamente.

### Etapa 0 — Base segura (½ dia)
- Inicializar/confirmar Git (o diretório de trabalho **não é repo**; o clone é `../Nanda_ped`). Criar tag/snapshot `recovery/snapshot_v8.0.0` antes de mexer.
- Instalar `playwright` e registrar o baseline: 120/619/77/64/90 + 9 E2E.
- **Aceite:** baseline documentado.

### Etapa 1 — Correções iOS imediatas na v8 (½ dia)
1. `v8/index.html`: apontar favicon e apple-touch-icon para `./assets/icons/...`.
2. `manifest.json`: separar ícones `any` e `maskable` (gerar versão maskable com margem).
3. Adicionar teste de invariante: nenhum `../` em `index.html`/`css`/`js` da v8 e todos os assets referenciados existem.
- **Aceite:** teste novo verde; ícone aparece ao abrir `v8/` isolada.

### Etapa 2 — Testes reais no iPhone (1 dia)
1. Tornar o E2E obrigatório no CI (`npm i -D playwright`, `npx playwright install webkit`) e rodar em **WebKit** com device `iPhone 15 Pro Max`/viewport 430×932.
2. Falhar o CI se o E2E for ignorado (hoje passa silenciosamente).
3. Cobrir: lançar plantão D+60/D+90, parcelado 2x–24x, desfazer, exportar/importar backup, recarregar com `localStorage` limpo (recuperação do IndexedDB), modo offline.
- **Aceite:** 99 testes executando, 0 ignorados.

### Etapa 3 — Persistência robusta (1 dia)
- Reconciliar `localStorage` × IndexedDB por `lastUpdated` (vence o mais novo, não só "se vazio").
- Adicionar `onupgradeneeded` versionado e testes de migração (`v2`→`v8`).
- Aviso discreto "último backup há X dias" + lembrete de "Salvar no iPhone" (Web Share), já que Safari pode purgar dados.
- **Aceite:** testes adversariais para dados divergentes, cota cheia e IDB indisponível.

### Etapa 4 — Service Worker e atualização (½ dia)
- `CACHE_NAME` derivado de `APP_VERSION`; cachear só o shell (ignorar query strings); limpar caches antigos.
- Banner "Nova versão disponível — atualizar" (`updatefound`/`skipWaiting` controlado).
- Self-host das fontes (ou remover Google Fonts) para offline real e CSP mais estrita (`style-src 'self'`, mover estilos inline para CSS).
- **Aceite:** teste de SW (versão muda → cache antigo removido); sem requisições externas.

### Etapa 5 — Refatoração segura da UI (2 dias)
- Quebrar `ui.js` em módulos (`ui/home.js`, `ui/shifts.js`, `ui/expenses.js`, `ui/modals.js`, `ui/menu.js`) mantendo API pública e testes.
- Centralizar renderização em um helper `html\`\`` que escapa por padrão; reduzir os 18 `innerHTML`.
- Revisar acessibilidade: foco ao abrir/fechar modal, `Esc`, `aria-live` nos Toasts, contraste do tema escuro, alvos ≥44 px.
- **Aceite:** diff sem mudança de comportamento (testes inalterados), suíte de sanitização ampliada.

### Etapa 6 — Publicação somente GitHub + Pages (½ dia)
- Decidir **versão canônica**: recomendo que a raiz do Pages abra a `v8/` (página de redirecionamento relativa ou cópia do build); `/v8/` continua acessível diretamente.
- **Remover o Vercel:** apagar `vercel.json` (raiz e das pastas de versão que o tiverem, após confirmação), tirar menções a Vercel do `AGENTS.md`, `roadmap.md`, README e testes que validam headers Vercel (ajustar a asserção ao novo escopo, sem afrouxar o que protege CSP/segurança).
- **Adaptar ao Pages (subcaminho `/Nanda_ped/`):** todos os caminhos relativos (`./`), `scope`/`start_url` do manifest e `sw.js` relativos, sem `/` absoluto, sem `cleanUrls`/rewrites. Como o Pages não envia headers, a CSP fica na `<meta>` (já está na v8) e `X-Frame-Options` etc. deixam de existir — registrar essa limitação.
- Manter `.nojekyll`. Cache do Pages é ~10 min: o SW versionado (Etapa 4) é o que garante atualização.
- Ajustar `ci.yml`: `build_bundle` e `ci_security_scan` cobrindo v8; job de E2E; opcionalmente workflow que publica no Pages a cada push em `main` (hoje o fluxo é `git push origin NandapedV2:gh-pages`).
- Atualizar `package.json` raiz (versão e scripts `test:all`).
- Fluxo de publicação: o do AGENTS.md (robocopy → testes → commit → push `NandapedV2`/`main` → `gh-pages`), sem etapa de Vercel. Commits/pushes só quando você pedir.
- **Aceite:** `https://<usuário>.github.io/Nanda_ped/` abre a v8, instala na tela de início do iPhone com ícone correto, funciona offline, console sem violações de CSP.

### Etapa 7 — Higiene do repositório e documentação (1 dia)
- As versões **Cloud** (V4_Cloud, v6, v7) dependem de Vercel/Supabase; sem Vercel elas deixam de ser publicáveis. Perguntar se devem ser arquivadas (movidas para `recovery/` ou tag) e retiradas das suítes/CI, ou mantidas só como código de referência.
- Congelar v2/v2.0/v4/v4.0 como uma só (remover duplicata após confirmação do usuário); mover `recovery/` (33 MB) para release/tag ou compactar; decidir destino de `Nandaped_VF1` e `stitch_*`.
- Unificar `AGENTS.md`/`agents.md`, corrigir contagens de testes, substituir `PLANO_MELHORIAS.md` por este plano, atualizar `MEMORY.md`, `RECOVERY.md`, `roadmap.md`.
- **Aceite:** um documento canônico por assunto; tamanho do repositório reduzido.

### Etapa 8 — (Opcional) Evolução de produto
Notificação de lembrete de backup, relatório mensal em PDF/CSV, gráfico caixa × competência, modo de entrada rápida por voz (já existiu na v3).

## 4. Ordem recomendada e risco

`0 → 1 → 2 → 3 → 4 → 6 → 5 → 7`. Etapas 1–4 entregam o maior ganho no iPhone com baixo risco; a 5 (refatoração) vem depois que os testes E2E reais protegem o comportamento. Deleções da Etapa 7 só com sua confirmação explícita.

## 5. Critérios globais de aceite
- 120 + 619 + 77 + 64 + 99 testes, **0 falhas, 0 cancelados, 0 ignorados**.
- Nenhuma asserção removida ou afrouxada.
- Dados e nomes reais ausentes de padrões/demonstrações; `APP_CREATOR = 'FChNeto'` preservado.

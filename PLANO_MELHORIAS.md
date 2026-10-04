# Plano de melhoria — Finanças Pediatria

**Data da revisão:** 3 de outubro de 2026  
**Finalidade:** orientar um AI Code a corrigir e evoluir o projeto em etapas revisáveis, com foco na versão Cloud v6, sem perder as variantes locais ainda mantidas.

## 1. Resumo executivo

O repositório reúne várias gerações do aplicativo. A versão que combina Vercel, Supabase, login por Google/e-mail e categorias próprias está em `v6/`; ela reaproveita quase todo o código de `V4_Cloud/`. A raiz e `v5/` são versões standalone, enquanto `v2/`, `v2.0/`, `v4/` e `v4.0/` preservam outras interfaces e cópias.

Na inspeção estática da v6 foram encontrados quatro pontos de produto a tratar antes de considerar a experiência pronta para produção:

1. Dois botões de inclusão ainda dependem de atributos `onclick`, incompatíveis com a CSP configurada para bloquear JavaScript inline.
2. A tela de categorias permite editar apenas categorias próprias; as categorias padrão não podem ser renomeadas, embora isso tenha sido solicitado.
3. A sincronização detecta conflito entre dispositivos, mas não oferece uma ação para comparar, recuperar ou resolver os dados.
4. O service worker prioriza rede para HTML, CSS e JavaScript e não usa o cache desses arquivos quando a requisição falha; isso limita o uso offline anunciado.

Também faltam testes e pipeline próprios para `v6/`, e a documentação central ainda trata v5 e V4_Cloud como versões vigentes. A falha de login observada anteriormente não pode ser atribuída somente ao código: variáveis da Vercel, provedores, URLs permitidas e migrações do projeto Supabase são configurações externas e precisam ser verificadas em conjunto com o fluxo do app.

## 2. Escopo e mapa atual

| Área | Conteúdo observado | Direção proposta |
|---|---|---|
| `v6/` | Cloud, login, dados por conta, configurações Vercel/Supabase e edição de categorias próprias | Tratar como candidata a versão Cloud principal após confirmação |
| `V4_Cloud/` | Variante Cloud anterior; compartilha muitos módulos com v6 | Manter como referência/compatibilidade durante migração; depois congelar |
| Raiz e `v5/` | Aplicativo standalone | Manter como produto local separado ou arquivar após decisão explícita |
| `v2/` e `v2.0/` | Versão minimalista com persistência local | Congelar; alinhar a documentação e evitar cópia manual contínua |
| `v4/` e `v4.0/` | Variantes standalone muito semelhantes | Congelar ou manter um único caminho publicado |
| `recovery/`, `Nandaped_VF1/`, `stitch_pediatrician_shift_financial_manager/` | Snapshots, artefatos históricos e protótipos | Não usar como fonte de produção; inventariar privacidade e dependências antes de publicar |
| Documentação | `agents.md`, `roadmap.md`, `context.md`, `MEMORY.md`, `RECOVERY.md`, READMEs e notas de release | Definir um documento canônico e manter os demais como referências coerentes |

As variantes `v4/` e `v4.0/` têm nove arquivos de código/configuração comparados idênticos nesta revisão; `v2/` e `v2.0/` também são quase cópias. `V4_Cloud/` e `v6/` compartilham a maior parte dos módulos de autenticação, estado, banco local e interface. Essa duplicação aumenta o risco de corrigir uma versão e deixar outra com o mesmo defeito.

## 3. Achados priorizados

### P1 — CSP e ações de inclusão da v6

**Evidência:** `v6/vercel.json` define `script-src` sem `'unsafe-inline'`. Em `v6/js/ui.js`, os botões de inclusão de plantão e despesa nas abas Ganhos e Despesas usam `onclick` inline (por volta das linhas 1321 e 1388). A política impede a execução desses atributos. Outros botões também mantêm `onclick` redundante.

**Ação:** substituir todos os atributos `on*` por `data-action` e listeners delegados já usados pela interface. Manter a CSP sem liberar scripts inline.

**Aceite:** busca automatizada não encontra atributos de evento inline em HTML/templates; no preview Vercel, os quatro pontos de inclusão abrem o formulário certo; console sem violações CSP relacionadas a scripts.

### P1 — Diagnóstico do login e configuração de runtime

**Evidência:** `v6/js/config.js` aceita configuração salva em `localStorage`; `getConfig()` só trata a configuração de runtime como autoritativa quando `/api/config` entrega a configuração esperada. Em produção, uma resposta não configurada, ausente ou atrasada pode deixar valores antigos do navegador como fallback. `loadRuntimeConfig()` aborta a chamada após 1,8 s. A documentação atual da v6 não descreve o procedimento completo de confirmação de e-mail, URLs de retorno nem as diferenças entre Vercel e Pages.

**Ação:**

1. Em produção Vercel, tornar `/api/config` a única fonte de configuração; se faltar uma variável, mostrar diagnóstico explícito e não reutilizar silenciosamente uma URL de outro projeto salva no navegador.
2. Reservar entrada manual de URL/chave para desenvolvimento e rotulá-la como configuração local. A chave publicável/anon é pública por desenho; uma chave `service_role` ou secreta nunca pode ir ao navegador.
3. Medir o tempo real do endpoint no preview e ajustar o timeout para a inicialização do app não falhar durante cold start.
4. Exibir verificações sem revelar credenciais: endpoint configurado, URL válida, conectividade, sessão, provedor habilitado e versão da migração esperada.
5. Em Supabase, validar URL de Site, lista de Redirect URLs, Google Client ID/Secret, origem JavaScript e callback que o painel Supabase fornece ao Google. São campos distintos. Confirmar também provedor de e-mail, confirmação de endereço e envio/entrega de mensagens.
6. Para publicação em Pages sob subdiretório, decidir uma URL de callback que preserve o caminho da aplicação. O código usa a origem do domínio em `redirectTo`; isso deve ser exercitado no endereço publicado, não presumido a partir do preview Vercel.

**Aceite:** `/api/config` retorna somente URL e chave pública esperadas, sem cache; configuração ausente não ativa silenciosamente outro projeto; conta nova conclui Google OAuth e confirmação por e-mail; login, logout, renovação de sessão e senha incorreta produzem estados compreensíveis. Validar preview e produção com conta de teste e sem copiar dados reais.

**Limite da revisão:** não foram acessados os painéis ou logs atuais da Vercel/Supabase. Portanto, o motivo específico pelo qual o login de produção falha continua pendente dessa verificação.

### P1 — Renomear categorias padrão e preservar histórico

**Evidência:** `v6/js/store.js` só localiza categorias em `customCategories` ao chamar `updateCustomCategory()`. O modal oferece edição para categorias próprias, enquanto as 23 categorias padrão são exibidas sem ação de edição. Despesas guardam o nome da categoria como texto (`category`); a tabela também guarda `category TEXT`, sem chave estrangeira para uma categoria estável. A restrição SQL (`user_id, name`) é sensível a maiúsculas/minúsculas, enquanto o frontend impede duplicidade sem diferenciar maiúsculas/minúsculas.

**Ação:** permitir renomear e reclassificar categorias padrão e próprias conforme a preferência da conta. Separar identidade estável (`category_id`) de rótulo exibido; mapear valores históricos sem perder relatórios. Normalizar espaços/acentos/caixa para validar duplicidade no cliente e no banco. Definir a hierarquia explicitamente como macrogrupo → categoria/subcategoria e decidir se a subcategoria terá apenas um nível.

Antes da migração, elaborar um mapa de IDs e rótulos existentes. Não alterar categorias globais de todas as contas quando uma usuária renomear a sua.

**Aceite:** categoria padrão pode ser renomeada para uma conta; novo lançamento usa o rótulo atualizado; lançamentos históricos continuam associados e aparecem nos relatórios; mudança de macrogrupo atualiza a classificação; nomes duplicados são rejeitados sem depender de caixa/espaços; outra conta conserva seu próprio nome.

### P1 — Conflitos de sincronização sem fluxo de recuperação

**Evidência:** `v6/js/cloudState.js` faz atualização otimista por `revision` e detecta conflito; `v6/js/app.js` mostra um aviso em `syncCloudNow()`, mas não oferece comparar, recarregar ou mesclar a cópia remota. A edição local permanece na tela, sem uma ação clara para torná-la nuvem novamente.

**Ação:** criar fluxo de conflito explícito com cópia de segurança local e remota, data da última atualização e opções claras: carregar a cópia da nuvem ou manter a cópia deste aparelho após backup. Mesclagem automática só deve ser introduzida com IDs estáveis por entidade e regra definida para exclusões, edições simultâneas e parcelas. Nunca marcar como sincronizado sem confirmação do servidor.

**Aceite:** dois navegadores na mesma conta editam o mesmo estado; o conflito é detectado, nenhuma cópia desaparece silenciosamente e a usuária consegue recuperar os dois lados ou escolher um com confirmação.

### P1 — Um modelo de persistência e migrações rastreáveis

**Evidência:** as migrações `001`–`003` criam tabelas normalizadas (`profiles`, `shifts`, `expenses`, `custom_categories`) e a migração `004` adiciona `user_app_state`, que a aplicação ativa usa para salvar o estado completo em JSONB. `v6/js/sync.js` mantém um sincronizador por linha marcado no código como legado; `db.js` mantém fila local para esse caminho. Há, portanto, modelos concorrentes e possibilidade de divergência entre o estado JSONB e as tabelas relacionais. As chaves locais da v6 ainda usam nomes `v4_cloud_*` e compartilham o nome do IndexedDB de V4_Cloud; se as versões forem servidas sob a mesma origem, elas podem compartilhar configuração, modo convidada e banco local.

**Ação:** escolher a fonte de verdade. Para uso financeiro em crescimento, preferir dados relacionais com `category_id`, isolamento por `user_id` e alterações incrementais; manter JSONB como exportação/backup ou como transição temporária com `schemaVersion`. Se a decisão for manter snapshot JSONB, documentar limites de tamanho, migração, conflito e plano de restauração e remover o sincronizador legado que não for usado. Criar namespace v6 com migração explícita dos dados locais antigos; não apagar chaves antigas até confirmar cópia e importação.

**Aceite:** cada tipo de dado tem uma única rotina de leitura/escrita ativa; migrações são numeradas, aplicáveis do zero e atualizam projeto existente sem duplicar/apagar dados; teste de atualização de estado anterior e restauração de backup; nenhuma sessão de uma conta vê dados de outra.

### P1 — Testar segurança real do Supabase, não só a interface

**Pontos positivos observados:** as tabelas atuais ativam RLS; políticas relacionam a linha a `auth.uid()`; migrações revogam acesso de `anon` e concedem operações ao papel autenticado. A função `handle_new_user()` revoga execução direta aos papéis do cliente.

**Ação:** adicionar testes SQL com casos autorizados e negados para `SELECT`, `INSERT`, `UPDATE` e `DELETE`, testando duas contas e `anon`. Conferir grants e policies em todas as tabelas expostas, tabelas futuras, funções, views e Storage. Rever a função `SECURITY DEFINER` de criação de perfil e seu `search_path` com o menor privilégio necessário. Executar os advisors do Supabase antes de cada migração de segurança.

**Aceite:** conta A não lê nem altera dados da conta B por chamada direta à API; visitante anônimo não acessa dados privados; usuário autenticado não troca o `user_id` de uma linha; todos os testes SQL passam num projeto local/temporário antes da produção.

### P2 — Cache offline da aplicação

**Evidência:** `v6/sw.js` classifica HTML, CSS e JavaScript como recursos que devem sempre revalidar na rede. Em erro de rede, o fallback atual retorna o HTML em navegação, mas não devolve o CSS/JavaScript do cache.

**Ação:** implementar estratégia de atualização que use uma cópia estática válida quando a rede falhar, sem armazenar respostas privadas nem `/api/config`. Versionar e remover apenas caches pertencentes ao app; preservar uma estratégia de atualização que impeça servir código velho indefinidamente.

**Aceite:** instalar online, abrir ao menos uma vez e então reiniciar sem rede; shell, estilo e módulos estáticos abrem do cache; endpoint de configuração não é armazenado; alteração offline continua local e a interface explica claramente o que ainda não foi sincronizado.

### P2 — Validar entradas e operações financeiras

**Evidência:** cálculos D+60/D+90 e parcelas já tratam fechamento do mês e distribuem centavos; `generateExpenseInstallments()` limita a parcela a 24x. Entretanto, validações de valor, data, grupo e comprimento dependem em boa parte da interface, e o formato de backup é aceito como JSON amplo.

**Ação:** colocar validações também no domínio: valor finito e não negativo/positivo conforme a regra definida, data ISO válida, parcela entre 1 e 24, nome de categoria limitado e macrogrupo permitido. Tornar operações de parcelamento e renomeação atômicas. Adicionar versão de esquema, limite de tamanho, preview do que será importado, backup anterior e mensagem de rollback à importação.

**Aceite:** valores inválidos não são salvos nem sincronizados; totais das parcelas são exatamente iguais ao total informado; testes cobrem centavos, fim de mês, ano bissexto, fronteira de ano, fuso local e importação incompatível.

### P2 — Acessibilidade e ergonomia de uso

**Evidência:** `v6/index.html` configura `maximum-scale=1.0` e `user-scalable=no`, o que bloqueia zoom manual. Há uso de diálogos com `aria-modal` e foco inicial, mas a revisão completa de teclado/foco ainda precisa ser automatizada e feita em dispositivos reais.

**Ação:** permitir zoom do navegador; garantir tamanho legível dos campos, foco visível, foco preso e devolvido ao fechar modal, navegação por teclado, rótulos, mensagens anunciadas por leitor de tela, contraste em ambos os temas e alvos de toque confortáveis. Testar iPhone/Safari, Android e desktop responsivo. Manter o padrão visual leve sem esconder estados de erro/sincronização.

**Aceite:** auditoria automatizada sem violações críticas e roteiro manual de teclado/leitor de tela concluído; zoom de 200% não corta formulários nem encobre ações; fluxos de plantão, despesa, edição e login são concluídos sem toque.

### P2 — Privacidade, backup, sessão e retenção

**Ação:** auditar dados padrão, exemplos, testes, screenshots, protótipos, snapshots e instruções antigas antes de cada publicação. Confirmar ausência de credenciais privilegiadas e de dados financeiros ou identificadores reais no código e no histórico remoto. Criar um procedimento de exportação/restauração por conta, exclusão de conta/dados e política de retenção; deixar claro que `localStorage` e IndexedDB não são uma caixa-forte contra código executado na mesma origem. Não incluir dados de pacientes no produto financeiro.

**Aceite:** varredura automatizada aprovada; dados de demonstração começam vazios/sintéticos; backup de uma conta não pode ser importado para outra sem confirmação; exclusão cobre nuvem e cópias locais; nenhuma chave secreta aparece no frontend, artefatos ou histórico.

### P2 — Cobertura automatizada e integração contínua

**Evidência:** há suítes da raiz e de V4_Cloud, mas `v6/package.json` não define testes e não há workflow de CI em `.github/workflows/`. As contagens registradas nos documentos pertencem a execuções anteriores e não comprovam o comportamento da v6 hospedada.

**Ação:** estabelecer suítes próprias de domínio, interface, configuração, auth mockada, armazenamento/migração e sincronização da v6; acrescentar testes SQL de RLS e cenários E2E de navegador. Criar CI para build, testes da raiz/v2/v4/v5/V4_Cloud/v6, inspeção de CSP e diff dos arquivos gerados. Manter asserts; corrigir código quando um teste falhar.

**Aceite:** pull request não pode ser integrado se build ou testes falharem; contagens são descobertas pelo runner, não hard-coded na documentação; falhas têm artefatos reproduzíveis sem credenciais de produção.

### P3 — Organização de versões, branches e publicação

**Evidência:** `agents.md`, `MEMORY.md`, `roadmap.md`, `README.md`, `RECOVERY.md` e notas de release ainda descrevem v5 e V4_Cloud como versões vigentes, enquanto `v6/` já existe. O contador histórico das categorias também variou entre 22 e 23, embora a lista atual contenha 23 itens. A v6 tem README resumido e não está listada nos arquivos centrais de release/recuperação.

**Ação:**

1. Confirmar formalmente se v6 é a versão Cloud alvo; manter `APP_CREATOR = 'FChNeto'` e perfis sem dados pessoais/financeiros de exemplo.
2. Definir mapa simples: versão, pasta, host, branch de implantação, configuração externa, suites e responsável.
3. Atualizar os documentos centrais para a realidade; registrar 23 categorias se essa lista for a escolha aprovada.
4. Criar uma matriz de deploy: Vercel Cloud usando `v6/` como root e Pages para a experiência standalone. Pages estático não executa a função Vercel `/api/config`; não anunciar login Cloud no Pages sem resolver essa dependência.
5. Confirmar a branch `v6` antes de escrever nela; trabalhar em commits pequenos e revisar preview antes de mover `main` ou `gh-pages`. Não copiar snapshots ou arquivos de recuperação para uma publicação sem necessidade.
6. Eliminar duplicação apenas depois de identificar URLs existentes, consumidores, dados locais e plano de rollback. Não apagar variantes no mesmo commit de uma migração de produção.

**Aceite:** uma tabela única responde qual versão está no domínio de produção; cada release tem commit, preview, suíte executada, checklist de Vercel/Supabase e instrução de rollback; nenhuma atualização de `main`/`gh-pages` ocorre por cópia não revisada.

## 4. Ordem sugerida para o AI Code

### Marco A — Baseline e bloqueios de produção

- Confirmar versão Cloud oficial e origem/domínio de produção.
- Reproduzir o problema de login com logs sem credenciais e checklist de `/api/config`, Vercel, Google, e-mail e migrações.
- Corrigir configuração autoritativa e diagnóstico.
- Remover os `onclick` inline e confirmar todos os botões com a CSP existente.
- Abrir um preview Vercel da branch, sem trocar o domínio de produção.

### Marco B — Categorias e integridade financeira

- Especificar identidade, nomes, macrogrupos e regra de renomeação por conta.
- Preparar migração compatível e reversível de categorias textuais para IDs estáveis.
- Implementar edição de categoria padrão e própria, criação de subcategoria, reclassificação de lançamentos e proteção contra duplicatas.
- Completar validação de valores, datas, parcelas e backups.

### Marco C — Sincronização e uso offline

- Escolher e documentar um modelo único de persistência.
- Adicionar resolução de conflito com backups locais/remotos.
- Separar namespaces do V4_Cloud e v6 com migração local verificada.
- Corrigir o fallback de cache e testar reconexão, encerramento do PWA e mudança de conta.

### Marco D — Segurança, acessibilidade e qualidade

- Adicionar testes SQL de RLS e testes por conta/dispositivo.
- Adicionar testes de domínio e E2E da v6 e o workflow CI.
- Corrigir zoom, teclado, modais, mensagens e estados de sincronização.
- Fazer auditoria de privacidade em dados, snapshots, artefatos e histórico remoto.

### Marco E — Documentação e liberação

- Atualizar `agents.md`, `context.md`, `MEMORY.md`, `roadmap.md`, `README.md`, `RECOVERY.md`, `RELEASE_NOTES.md` e walkthrough.
- Registrar as variáveis necessárias sem seus valores, redirects exatos por ambiente, migrações e fluxo de rollback.
- Publicar somente o preview validado; solicitar revisão antes de atualizar os destinos de produção.

## 5. Critérios transversais de aceite

- `APP_CREATOR = 'FChNeto'` permanece inalterado em código e metadados.
- Não entram credenciais privilegiadas, nomes profissionais, renda, despesas ou transações de uma pessoa nos padrões, testes públicos ou capturas de tela.
- Nenhuma asserção é apagada ou enfraquecida para aprovar testes.
- Cada mudança de banco tem migração versionada, teste RLS e verificação de ida/rollback.
- Operações não sincronizadas ficam visíveis; o app nunca exibe sucesso antes da confirmação do servidor.
- A experiência de login diferencia configuração ausente, erro de provedor, e-mail por confirmar, credencial inválida, falta de rede e falha de persistência.
- A categoria e o histórico financeiro permanecem íntegros após renomear, reclassificar, exportar, importar ou trocar de aparelho.
- A documentação deixa claro o que é comportamento verificado por teste automatizado e o que depende de configuração externa.

## 6. Estado desta revisão e limites

Esta revisão foi estática e concentrou a análise detalhada em `v6/`, `V4_Cloud/`, migrações, documentação, estrutura de versões e suítes existentes. Não executei testes nesta tarefa, não acessei a conta Vercel/Supabase, não fiz autenticação no domínio publicado e não conferi o histórico Git remoto; o workspace atual não contém checkout Git local disponível para essa validação. Os registros de testes presentes em READMEs são históricos, não resultados desta revisão.

## 7. Referências oficiais

- [Supabase — Redirect URLs e configuração de retorno](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase — Row Level Security, grants e testes SQL](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase — Segurança da plataforma e dos produtos](https://supabase.com/docs/guides/security)

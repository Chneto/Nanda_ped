# Finanças Pediatria Cloud (V4_Cloud 4.1.0)

Aplicação estática para Vercel com autenticação e persistência no Supabase. Configure este diretório (`V4_Cloud`) como **Root Directory** do projeto Vercel. A raiz do repositório contém outras versões do produto.

## Configuração da Vercel

Defina estas variáveis nos ambientes usados (Production, Preview e Development conforme necessário):

- `SUPABASE_URL`: URL HTTPS do projeto Supabase.
- `SUPABASE_ANON_KEY`: chave pública `anon` ou `SUPABASE_PUBLISHABLE_KEY`: chave publicável `sb_publishable_...`.

O endpoint `/api/config` entrega somente a URL e a chave pública ao navegador. **Nunca** configure `service_role`, `secret`, `supabase_admin` ou senha do Postgres em variável acessível ao frontend. Após alterar variáveis, faça um novo deploy.

## Configuração do Supabase e autenticação

1. Em **Authentication → URL Configuration**, configure o Site URL para a origem de produção e inclua as origens de preview da Vercel e `http://localhost:...` na Redirect URL allowlist conforme o uso. Use origens reais, sem caminho inventado.
2. Em **Authentication → Providers → Google**, habilite Google e informe o OAuth Client ID e Client Secret criados no Google Cloud.
3. No Google Cloud, autorize a origem do app em **Authorized JavaScript origins**. Em **Authorized redirect URIs**, use o callback exato que o painel do Supabase mostra para o projeto, normalmente `https://<project-ref>.supabase.co/auth/v1/callback`.
4. Em **Authentication → Providers → Email**, mantenha o provedor habilitado. O app direciona a confirmação de cadastro para a origem em uso; com confirmação ativada, a usuária só poderá entrar após confirmar o e-mail. Configure SMTP confiável se o limite padrão de e-mails do projeto não atender ao uso.

O endereço do Google Cloud (callback do provedor) e os redirects de retorno do Supabase são dois campos diferentes. Cadastre cada URL no painel indicado.

## Banco de dados

Para projeto novo, execute as migrações numeradas em `supabase/migrations/` (`001` a `004`) na ordem. Para um projeto existente que já recebeu `001` a `003`, aplique as versões atualizadas `002_enable_rls.sql`, `003_triggers_and_indexes.sql` e `004_user_app_state.sql` em sequência; elas recriam políticas e gatilhos com segurança e criam a tabela de snapshot por usuário.

A migração `004_user_app_state.sql` é necessária para login com sincronização do estado completo. RLS limita cada linha ao usuário autenticado. Não há necessidade de instalar Docker ou conectar o app diretamente ao Postgres local.

Na primeira autenticação desta instalação, se ainda não houver uma conta Cloud vinculada, os dados locais existentes são usados como ponto de partida da conta inicial. Depois disso, cada conta mantém seu próprio espaço local. Exporte um backup antes de ativar uma conta diferente em um aparelho com dados locais que pertençam a outra pessoa.

## Edição e categorias

- Use **Categorias** no menu para criar uma nova categoria, escolher um dos seis grupos macro ou renomear uma categoria própria.
- Renomear uma categoria própria também reclassifica os lançamentos históricos que a usam.
- Categorias com lançamentos não podem ser excluídas; primeiro edite esses lançamentos ou escolha outro destino.
- Na lista de despesas, o botão de edição altera descrição, valor, data e categoria de um lançamento individual. Para compra parcelada, a edição não refaz o plano inteiro de parcelas.

## Atualização após deploy

O app revalida HTML, CSS e JavaScript e usa uma versão nova do Service Worker. Se um iPhone ainda exibir a tela antiga, feche o PWA e abra novamente; se persistir, remova e instale o atalho da tela inicial outra vez. Os dados financeiros não são apagados por esse procedimento.

## Verificação local

Na pasta `V4_Cloud`, execute `node --test tests/*.test.js`. As suítes do diretório raiz cobrem outras variantes e devem ser executadas a partir da raiz do repositório, seguindo `agents.md`.

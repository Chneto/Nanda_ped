# Walkthrough — V4_Cloud 4.1.0

## Revisão concluída

- **Configuração de autenticação:** retiradas as credenciais do HTML; a Vercel serve a configuração pública sob demanda. Corrigido o fallback quebrado de cadastro por referência a constantes inexistentes.
- **OAuth e cadastro:** um único fluxo cuida do callback PKCE; cadastro com senha inclui URL de retorno e exibe a orientação correta quando a confirmação de e-mail está pendente.
- **Persistência:** o estado da interface agora é salvo no Supabase por conta em `user_app_state`. A revisão impede sobrescrita silenciosa quando dois aparelhos alteram uma versão antiga. Dados locais ficam em escopos separados por conta.
- **Despesas e categorias:** pode-se editar um lançamento existente, criar categorias próprias e renomear categorias próprias; o rename atualiza os lançamentos que usam aquela categoria. Não é permitido excluir categoria ainda usada.
- **PWA e deploy:** novas respostas de HTML, CSS e JavaScript revalidam no navegador; configuração em `/api/config` fica fora do cache do Service Worker.
- **Banco:** migração `004_user_app_state.sql` registra snapshot JSONB, RLS e controle de revisão. Permissões SQL foram limitadas às tabelas do app; o trigger simples de data atualizada roda com privilégio de invocador.

## Plano de análise e gestão

1. Confirmar Vercel Root Directory e variáveis de ambiente.
2. Confirmar OAuth Google e allowlists de callback/retorno nos painéis Google Cloud e Supabase.
3. Aplicar migrações e verificar isolamento entre duas contas de teste.
4. Testar cadastro com confirmação por e-mail, login, recuperação local, edição de despesas e categorias em tela móvel.
5. Executar as suítes da raiz e `V4_Cloud`; publicar primeiro em Preview e fazer um teste funcional antes de produção.

## Dependências externas ainda necessárias

As chaves OAuth do Google, os redirects do projeto Supabase, a confirmação de e-mail e as variáveis do projeto Vercel pertencem aos respectivos painéis e não foram alterados nesta revisão. O roteiro passo a passo está em `README.md`.

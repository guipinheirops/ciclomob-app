# Configuração do Supabase, Auth e Web Push

## 1. Criar/configurar o projeto Supabase

No painel do Supabase, copie o **Project URL** e a **Publishable key**. Não use a `service_role` no frontend.

Preencha `config.js`:

```js
window.CICLO MOB_CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'SUA-PUBLISHABLE-KEY',
  VAPID_PUBLIC_KEY: 'SUA-CHAVE-PUBLICA-VAPID'
};
```

## 2. Auth

Ative o provider de e-mail/senha em **Authentication**. Configure a URL do PWA em Site URL/Redirect URLs para que confirmação de e-mail e recuperação de senha retornem ao app.

## 3. Banco de assinaturas push

Execute `supabase/schema.sql` no SQL Editor. A tabela usa RLS para garantir que cada usuário veja e altere somente suas próprias assinaturas.

## 4. Gerar VAPID

Exemplo usando Node:

```bash
npx web-push generate-vapid-keys
```

Coloque apenas a chave **pública** em `config.js`.

Cadastre os secrets da Edge Function:

```bash
supabase secrets set VAPID_PUBLIC_KEY="..."
supabase secrets set VAPID_PRIVATE_KEY="..."
supabase secrets set VAPID_SUBJECT="mailto:seu-email@dominio.com"
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` devem estar disponíveis no ambiente da função. A service role deve permanecer exclusivamente no backend.

## 5. Deploy da função

```bash
supabase functions deploy send-reminders --no-verify-jwt
```

A função usa a service role e não precisa ser chamada pelo cliente. Proteja o endpoint de execução conforme sua política de infraestrutura e use-o apenas no agendador.

## 6. Agendamento

Agende `send-reminders` para executar **uma vez por minuto**. A própria função compara o horário local de cada assinatura com `reminder_time` e só envia quando há correspondência.

Você pode usar Supabase Cron/pg_cron ou outro scheduler seguro para invocar a Edge Function.

## 7. Requisitos do Web Push

- Produção precisa de HTTPS.
- `localhost` funciona para desenvolvimento.
- O usuário precisa conceder permissão de notificações.
- Compatibilidade varia por navegador/sistema operacional.

## PDF

A geração de PDF é feita no navegador e não exige Supabase. O botão fica em **Perfil > Relatório em PDF**.

## Ciclo MOB v9 — múltiplos ciclos e convites reais

1. Execute novamente `supabase/schema.sql` no SQL Editor. Ele cria `cycles`, `cycle_records`, `cycle_memberships` e `cycle_invitations`, além das políticas RLS e da função `accept_cycle_invitation`.
2. Depois de entrar no app, os ciclos locais da titular são sincronizados com o Supabase. Cada registro passa a pertencer a um `cycle_id`.
3. Na tela **Apoio**, informe o e-mail e escolha **Parceiro(a)** ou **Instrutora**. O convite gera um token único válido por 7 dias e copia um link no formato `?invite=<token>`.
4. O destinatário abre esse link e entra/cria a conta com **o mesmo e-mail informado no convite**. A função SQL valida e-mail, validade e token antes de criar o vínculo somente leitura.
5. A titular pode cancelar convites pendentes ou revogar acessos já aceitos a qualquer momento.

### Envio do convite por e-mail (opcional)

O compartilhamento por link já funciona sem serviço adicional. Para também enviar o convite automaticamente por e-mail:

- Faça deploy de `supabase/functions/send-cycle-invite`.
- Configure os secrets `RESEND_API_KEY` e `INVITE_FROM_EMAIL` no Supabase.
- Em `config.js`, defina `INVITE_EMAIL_FUNCTION: 'send-cycle-invite'`.
- Verifique o domínio remetente no provedor de e-mail antes de produção.

A Edge Function valida a sessão do remetente e consulta o convite usando as mesmas políticas de acesso do app. A chave do provedor de e-mail permanece somente no backend.

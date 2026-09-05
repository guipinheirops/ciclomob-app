# Cakto → Ciclo MOB (v36)

1. Execute `supabase/subscriptions.sql` no SQL Editor.
2. Publique a função:
   `supabase functions deploy cakto-webhook --no-verify-jwt`
3. Configure Secrets:
   - `CAKTO_WEBHOOK_SECRET`: o secret do webhook criado na Cakto.
   - `APP_URL`: URL pública do Ciclo MOB (ou `http://localhost:4174` apenas para teste).
   - `SUPABASE_SERVICE_ROLE_KEY`: mantenha somente nos Secrets do Supabase.
4. Na Cakto, configure a URL:
   `https://SEU_PROJECT_REF.supabase.co/functions/v1/cakto-webhook`
5. Eventos recomendados:
   `purchase_approved`, `subscription_created`, `subscription_renewed`,
   `subscription_canceled`, `subscription_renewal_refused`, `refund`, `chargeback`.

O frontend nunca recebe a service_role. A conta é criada no backend após evento de pagamento aprovado e a usuária recebe recuperação de senha para definir sua senha.

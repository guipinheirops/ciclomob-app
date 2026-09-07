# Cakto → Ciclo MOB

1. Execute `supabase/subscriptions.sql` no SQL Editor.

2. Publique novamente a função:

```bash
npx supabase functions deploy cakto-webhook --project-ref heglcvgpverqfmqpdyok --no-verify-jwt
```

3. Confirme os Secrets:
- `CAKTO_WEBHOOK_SECRET` = secret REAL do webhook da Cakto
- `APP_URL` = `https://app.ciclomob.cuidadosdamulher.com.br`

4. URL do webhook:
`https://heglcvgpverqfmqpdyok.supabase.co/functions/v1/cakto-webhook`

5. A função agora usa diretamente:
- `secret`
- `event`
- `data.id` como ID único da compra
- `data.refId`
- `data.customer.email`
- `data.customer.name`
- `data.product.id`
- `data.product.name`
- `data.offer.id`
- `data.offer.name`
- `data.subscription`
- `data.status`

6. Reenvios do mesmo webhook atualizam o registro existente em vez de criar duplicidade.

# Web Push — Ciclo MOB

Secrets necessários:
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_SUBJECT=mailto:contato@cuidadosdamulher.com.br
- REMINDER_CRON_SECRET

A função `send-reminders` deve ser chamada 1 vez por minuto.
Ela respeita `reminder_time`, `timezone` e `last_notified_local_date` de cada assinatura.

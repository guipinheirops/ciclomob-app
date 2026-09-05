-- Ciclo MOB v36 — controle de acesso pago via Cakto
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'cakto',
  provider_subscription_id text,
  provider_order_id text,
  customer_email text not null,
  product_id text,
  offer_id text,
  status text not null default 'active'
    check (status in ('active','trialing','canceled','past_due','refunded','chargeback','inactive')),
  current_period_end timestamptz,
  raw_event jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_provider_subscription_uidx
on public.subscriptions(provider, provider_subscription_id)
where provider_subscription_id is not null;

create index if not exists subscriptions_user_status_idx on public.subscriptions(user_id,status);
create index if not exists subscriptions_email_idx on public.subscriptions(lower(customer_email));

alter table public.subscriptions enable row level security;

drop policy if exists "Users read own subscription" on public.subscriptions;
create policy "Users read own subscription"
on public.subscriptions for select
to authenticated
using (auth.uid() = user_id);

-- Escritas são feitas exclusivamente pela Edge Function usando service_role.

-- Ciclo MOB v8 - ciclos, compartilhamento real e Web Push
create extension if not exists pgcrypto;

create table if not exists public.cycles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Ciclo',
  start_date date not null,
  end_date date,
  cycle_length integer not null default 28 check (cycle_length between 15 and 60),
  period_length integer not null default 5 check (period_length between 1 and 15),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cycle_records (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  date date not null,
  sensation text not null,
  appearance text not null,
  bleeding text not null default 'Não',
  pbi boolean not null default false,
  chart_stamp text check (chart_stamp is null or chart_stamp in ('red','green','white','yellow')),
  peak_marker text check (peak_marker is null or peak_marker in ('peak','plus1','plus2','plus3')),
  notes text not null default '',
  recorded_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cycle_id, date)
);

alter table public.cycle_records add column if not exists chart_stamp text;
alter table public.cycle_records add column if not exists peak_marker text;

create table if not exists public.cycle_memberships (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_email text not null,
  role text not null check (role in ('partner','instructor')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(cycle_id, user_id)
);

create table if not exists public.cycle_invitations (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_email text not null,
  role text not null check (role in ('partner','instructor')),
  token uuid not null default gen_random_uuid() unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  reminder_time time not null default '20:30:00',
  timezone text not null default 'America/Sao_Paulo',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, endpoint)
);

create or replace function public.is_cycle_owner(p_cycle_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.cycles c where c.id=p_cycle_id and c.owner_id=auth.uid());
$$;

create or replace function public.has_cycle_access(p_cycle_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.cycles c where c.id=p_cycle_id and c.owner_id=auth.uid())
      or exists(select 1 from public.cycle_memberships m where m.cycle_id=p_cycle_id and m.user_id=auth.uid());
$$;

alter table public.cycles enable row level security;
alter table public.cycle_records enable row level security;
alter table public.cycle_memberships enable row level security;
alter table public.cycle_invitations enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "cycle members read cycles" on public.cycles;
create policy "cycle members read cycles" on public.cycles for select to authenticated using (public.has_cycle_access(id));
drop policy if exists "owners create cycles" on public.cycles;
create policy "owners create cycles" on public.cycles for insert to authenticated with check (auth.uid() is not null and owner_id=auth.uid());
drop policy if exists "owners update cycles" on public.cycles;
create policy "owners update cycles" on public.cycles for update to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
drop policy if exists "owners delete cycles" on public.cycles;
create policy "owners delete cycles" on public.cycles for delete to authenticated using (owner_id=auth.uid());

drop policy if exists "cycle members read records" on public.cycle_records;
create policy "cycle members read records" on public.cycle_records for select to authenticated using (public.has_cycle_access(cycle_id));
drop policy if exists "owners create records" on public.cycle_records;
create policy "owners create records" on public.cycle_records for insert to authenticated with check (public.is_cycle_owner(cycle_id) and recorded_by=auth.uid());
drop policy if exists "owners update records" on public.cycle_records;
create policy "owners update records" on public.cycle_records for update to authenticated using (public.is_cycle_owner(cycle_id)) with check (public.is_cycle_owner(cycle_id));
drop policy if exists "owners delete records" on public.cycle_records;
create policy "owners delete records" on public.cycle_records for delete to authenticated using (public.is_cycle_owner(cycle_id));

drop policy if exists "memberships visible to owner or member" on public.cycle_memberships;
create policy "memberships visible to owner or member" on public.cycle_memberships for select to authenticated using (public.is_cycle_owner(cycle_id) or user_id=auth.uid());
drop policy if exists "owners revoke memberships" on public.cycle_memberships;
create policy "owners revoke memberships" on public.cycle_memberships for delete to authenticated using (public.is_cycle_owner(cycle_id));

drop policy if exists "invites visible to inviter or invitee" on public.cycle_invitations;
create policy "invites visible to inviter or invitee" on public.cycle_invitations for select to authenticated using (inviter_id=auth.uid() or lower(invitee_email)=lower(coalesce(auth.jwt()->>'email','')));
drop policy if exists "owners create invites" on public.cycle_invitations;
create policy "owners create invites" on public.cycle_invitations for insert to authenticated with check (inviter_id=auth.uid() and public.is_cycle_owner(cycle_id));
drop policy if exists "owners cancel invites" on public.cycle_invitations;
create policy "owners cancel invites" on public.cycle_invitations for delete to authenticated using (inviter_id=auth.uid() and public.is_cycle_owner(cycle_id));

drop policy if exists "users read own push subscriptions" on public.push_subscriptions;
create policy "users read own push subscriptions" on public.push_subscriptions for select to authenticated using (auth.uid()=user_id);
drop policy if exists "users insert own push subscriptions" on public.push_subscriptions;
create policy "users insert own push subscriptions" on public.push_subscriptions for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists "users update own push subscriptions" on public.push_subscriptions;
create policy "users update own push subscriptions" on public.push_subscriptions for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "users delete own push subscriptions" on public.push_subscriptions;
create policy "users delete own push subscriptions" on public.push_subscriptions for delete to authenticated using (auth.uid()=user_id);

create or replace function public.accept_cycle_invitation(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_inv public.cycle_invitations%rowtype;
  v_email text;
begin
  if auth.uid() is null then raise exception 'Faça login para aceitar o convite'; end if;
  v_email := lower(coalesce(auth.jwt()->>'email',''));
  select * into v_inv from public.cycle_invitations where token=p_token for update;
  if not found then raise exception 'Convite não encontrado'; end if;
  if v_inv.accepted_at is not null then raise exception 'Este convite já foi utilizado'; end if;
  if v_inv.expires_at < now() then raise exception 'Este convite expirou'; end if;
  if lower(v_inv.invitee_email) <> v_email then raise exception 'Este convite foi enviado para outro e-mail'; end if;
  if v_inv.inviter_id = auth.uid() then raise exception 'A titular não precisa aceitar o próprio convite'; end if;

  insert into public.cycle_memberships(cycle_id,user_id,member_email,role,invited_by)
  values(v_inv.cycle_id,auth.uid(),v_email,v_inv.role,v_inv.inviter_id)
  on conflict(cycle_id,user_id) do update set role=excluded.role,member_email=excluded.member_email,accepted_at=now();
  update public.cycle_invitations set accepted_at=now() where id=v_inv.id;
  return v_inv.cycle_id;
end;
$$;

grant select,insert,update,delete on public.cycles to authenticated;
grant select,insert,update,delete on public.cycle_records to authenticated;
grant select,delete on public.cycle_memberships to authenticated;
grant select,insert,delete on public.cycle_invitations to authenticated;
grant select,insert,update,delete on public.push_subscriptions to authenticated;
grant execute on function public.accept_cycle_invitation(uuid) to authenticated;
grant execute on function public.is_cycle_owner(uuid) to authenticated;
grant execute on function public.has_cycle_access(uuid) to authenticated;

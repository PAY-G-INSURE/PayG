-- PAYG Health Insurance schema for Supabase PostgreSQL.
-- Run in Supabase Dashboard > SQL Editor before deploying the migrated API.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  phone text unique,
  email text unique,
  "firstName" text,
  "lastName" text,
  "dateOfBirth" timestamptz,
  gender text check (gender is null or gender in ('Male','Female','Other')),
  "kinName" text,
  "kinPhone" text,
  "kinRelation" text,
  otp text,
  "otpExpiresAt" timestamptz,
  "otpAttempts" integer not null default 0,
  "isVerified" boolean not null default false,
  "isOnboarded" boolean not null default false,
  "isActive" boolean not null default true,
  role text not null default 'user' check (role in ('user','admin')),
  "paystackCustomerCode" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  check (phone is not null or email is not null)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null unique references public.users(id) on delete cascade,
  plan text not null default 'Basic' check (plan in ('Basic','Standard','Premium')),
  status text not null default 'pending' check (status in ('active','pending','inactive','lapsed')),
  "walletBalance" numeric(12,2) not null default 0 check ("walletBalance" >= 0),
  "coverageStartDate" timestamptz,
  "coverageEndDate" timestamptz,
  "lapsedAt" timestamptz,
  "gracePeriodEnd" timestamptz,
  "policyNumber" text not null unique default ('PAYG-' || to_char(now(),'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  "cancelledAt" timestamptz,
  "cancellationNote" text,
  "airtimeDeduction" jsonb not null default '{"enabled":false,"percentage":10,"network":null}'::jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  type text not null default 'payment' check (type in ('payment','refund','adjustment')),
  status text not null default 'pending' check (status in ('pending','success','failed')),
  "paystackReference" text unique,
  "paystackStatus" text,
  channel text,
  description text,
  metadata jsonb,
  "verifiedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  ref text not null unique default ('CLM-' || to_char(now(),'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  type text not null check (type in ('Outpatient','Inpatient','Emergency','Pharmacy','Laboratory','Dental','Optical')),
  description text not null,
  hospital text not null,
  "treatmentDate" timestamptz not null,
  "amountClaimed" numeric(12,2) not null check ("amountClaimed" >= 100),
  "amountApproved" numeric(12,2) not null default 0,
  status text not null default 'submitted' check (status in ('submitted','under_review','approved','rejected','paid')),
  "reviewNote" text,
  "reviewedBy" text,
  "reviewedAt" timestamptz,
  documents text[] not null default '{}',
  "payoutReference" text,
  "paidAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  type text not null default 'info' check (type in ('payment','coverage','claim','alert','info')),
  title text not null,
  body text not null,
  read boolean not null default false,
  "readAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists transactions_user_created_idx on public.transactions ("userId", "createdAt" desc);
create index if not exists claims_user_created_idx on public.claims ("userId", "createdAt" desc);
create index if not exists notifications_user_created_idx on public.notifications ("userId", "createdAt" desc);
create index if not exists notifications_unread_idx on public.notifications ("userId") where read = false;

-- Atomic, idempotent Paystack settlement. A transaction and its wallet credit
-- are committed together, so concurrent verify + webhook requests cannot pay twice.
create or replace function public.finalize_paystack_payment(
  p_reference text,
  p_user_id uuid,
  p_amount numeric,
  p_channel text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.transactions%rowtype;
  s public.subscriptions%rowtype;
  plan_cost numeric(12,2);
  new_status text;
begin
  select * into t from public.transactions where "paystackReference" = p_reference for update;
  if not found then raise exception 'Payment reference not found'; end if;
  if t."userId" <> p_user_id then raise exception 'Payment reference does not belong to this user'; end if;
  if t.status = 'success' then
    select * into s from public.subscriptions where "userId" = p_user_id;
    return jsonb_build_object('processed', false, 'subscription', jsonb_build_object(
      'walletBalance', s."walletBalance", 'status', s.status, 'planPrice',
      case s.plan when 'Standard' then 1000 when 'Premium' then 2000 else 500 end,
      'coverageEndDate', s."coverageEndDate", 'plan', s.plan
    ));
  end if;
  if t.status <> 'pending' then raise exception 'Payment is not pending'; end if;
  if round(t.amount, 2) <> round(p_amount, 2) then raise exception 'Paid amount differs from initialized amount'; end if;

  select * into s from public.subscriptions where "userId" = p_user_id for update;
  if not found then raise exception 'Subscription not found'; end if;
  plan_cost := case s.plan when 'Standard' then 1000 when 'Premium' then 2000 else 500 end;
  s."walletBalance" := least(s."walletBalance" + p_amount, plan_cost);
  if s."walletBalance" >= plan_cost then
    new_status := 'active';
    s."coverageStartDate" := coalesce(s."coverageStartDate", now());
    s."coverageEndDate" := date_trunc('month', now()) + interval '1 month';
  elsif s."walletBalance" > 0 then new_status := 'pending';
  else new_status := 'inactive';
  end if;
  s.status := new_status;
  s."updatedAt" := now();

  update public.transactions set status = 'success', "paystackStatus" = 'success', channel = p_channel,
    "verifiedAt" = now(), amount = p_amount, "updatedAt" = now() where id = t.id;
  update public.subscriptions set "walletBalance" = s."walletBalance", status = s.status,
    "coverageStartDate" = s."coverageStartDate", "coverageEndDate" = s."coverageEndDate",
    "updatedAt" = s."updatedAt" where id = s.id;
  insert into public.notifications ("userId", type, title, body)
    values (p_user_id, 'payment', 'Payment received', 'A Paystack payment was added to your insurance wallet.');

  return jsonb_build_object('processed', true, 'subscription', jsonb_build_object(
    'walletBalance', s."walletBalance", 'status', s.status, 'planPrice', plan_cost,
    'coverageEndDate', s."coverageEndDate", 'plan', s.plan
  ));
end;
$$;

revoke all on function public.finalize_paystack_payment(text, uuid, numeric, text) from public, anon, authenticated;
grant execute on function public.finalize_paystack_payment(text, uuid, numeric, text) to service_role;

-- The API uses the service role key and performs authorization itself.
-- Do not expose the service role key to the browser.
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;
alter table public.claims enable row level security;
alter table public.notifications enable row level security;

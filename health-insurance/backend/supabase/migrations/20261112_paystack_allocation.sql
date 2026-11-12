-- Paystack allocation ledger and net wallet credit. Apply once to an existing database.
drop function if exists public.finalize_paystack_payment(text, uuid, numeric, text);
create or replace function public.finalize_paystack_payment(
  p_reference text,
  p_user_id uuid,
  p_amount numeric,
  p_fee numeric,
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
  net_amount numeric(12,2);
  payg_amount numeric(12,2);
  insurer_profit numeric(12,2);
  insurer_wallet numeric(12,2);
begin
  select * into t from public.transactions where "paystackReference" = p_reference for update;
  if not found then raise exception 'Payment reference not found'; end if;
  if t."userId" <> p_user_id then raise exception 'Payment reference does not belong to this user'; end if;
  if t.status = 'success' then
    select * into s from public.subscriptions where "userId" = p_user_id;
    return jsonb_build_object('processed', false, 'allocation', t.metadata->'allocation', 'subscription', jsonb_build_object(
      'walletBalance', s."walletBalance", 'status', s.status, 'planPrice',
      case s.plan when 'Standard' then 1000 when 'Premium' then 2000 else 500 end,
      'coverageEndDate', s."coverageEndDate", 'plan', s.plan
    ));
  end if;
  if t.status <> 'pending' then raise exception 'Payment is not pending'; end if;
  if round(t.amount, 2) <> round(p_amount, 2) then raise exception 'Paid amount differs from initialized amount'; end if;
  if p_fee < 0 or p_fee > p_amount then raise exception 'Invalid Paystack fee'; end if;

  -- Share the post-Paystack-fee amount: PAYG 10%, insurer profit 5%,
  -- and the remainder (85%) is credited to the insurer wallet shown in-app.
  net_amount := round(p_amount - p_fee, 2);
  payg_amount := round(net_amount * 0.10, 2);
  insurer_profit := round(net_amount * 0.05, 2);
  insurer_wallet := net_amount - payg_amount - insurer_profit;

  select * into s from public.subscriptions where "userId" = p_user_id for update;
  if not found then raise exception 'Subscription not found'; end if;
  plan_cost := case s.plan when 'Standard' then 1000 when 'Premium' then 2000 else 500 end;
  s."walletBalance" := s."walletBalance" + insurer_wallet;
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
    "verifiedAt" = now(), amount = p_amount,
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'allocation', jsonb_build_object(
        'currency', 'NGN', 'gross', p_amount, 'paystackFee', p_fee, 'net', net_amount,
        'paygBank', payg_amount, 'insurerProfit', insurer_profit,
        'insurerWallet', insurer_wallet, 'paygPercentOfNet', 10,
        'insurerProfitPercentOfNet', 5, 'insurerWalletPercentOfNet', 85
      )
    ), "updatedAt" = now() where id = t.id;
  update public.subscriptions set "walletBalance" = s."walletBalance", status = s.status,
    "coverageStartDate" = s."coverageStartDate", "coverageEndDate" = s."coverageEndDate",
    "updatedAt" = s."updatedAt" where id = s.id;
  insert into public.notifications ("userId", type, title, body)
    values (p_user_id, 'payment', 'Payment received', 'A Paystack payment was added to your insurance wallet.');

  return jsonb_build_object('processed', true, 'allocation', jsonb_build_object(
    'gross', p_amount, 'paystackFee', p_fee, 'net', net_amount,
    'paygBank', payg_amount, 'insurerProfit', insurer_profit, 'insurerWallet', insurer_wallet
  ), 'subscription', jsonb_build_object(
    'walletBalance', s."walletBalance", 'status', s.status, 'planPrice', plan_cost,
    'coverageEndDate', s."coverageEndDate", 'plan', s.plan
  ));
end;
$$;

revoke all on function public.finalize_paystack_payment(text, uuid, numeric, numeric, text) from public, anon, authenticated;
grant execute on function public.finalize_paystack_payment(text, uuid, numeric, numeric, text) to service_role;

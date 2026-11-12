# PAYG top-up methods and payment sharing

This is an internal guide to the two planned ways a customer may add value for insurance coverage. The two methods use different payment rails and must be accounted for separately.

## Method 1: Airtime deduction from the customer's SIM

The customer starts with airtime on their mobile phone. A carrier-approved airtime-billing provider would need to confirm a real deduction from that SIM before PAYG credits the customer's insurance wallet.

The intended business flow is:

1. The customer requests an airtime-funded top-up.
2. The carrier or approved billing provider confirms how much airtime was actually deducted and what fee it charged.
3. PAYG calculates the amounts for the insurer wallet, PAYG, and any other agreed recipient from the confirmed proceeds.
4. The app credits the customer's insurance wallet only after the deduction is confirmed.

**This flow is not available in the current app.** Its USSD route cannot prove that airtime was deducted, and the app correctly leaves airtime wallet credit disabled. Do not credit an account based only on a USSD session or a customer screenshot. First select a carrier-approved billing provider and confirm its API, fees, supported networks, settlement timing, and proof-of-charge callback.

Paystack is not part of a direct SIM airtime deduction, so there is no Paystack transaction fee on that route unless Paystack itself processes a separate payment. The airtime provider's actual fee would need to be used in the calculation. The split percentages and deduction rules for this method are still to be agreed; the website's 10% / 5% / 85% rule should not be assumed to apply to airtime unless PAYG and the insurer explicitly choose that.

## Method 2: Website payment through Paystack

This is the website top-up flow currently implemented:

1. The customer enters an amount and pays through Paystack.
2. PAYG waits for Paystack to confirm the payment and return the actual transaction fee.
3. The Paystack fee is deducted first.
4. From the amount left, the current proposed allocation is:
   - **10% to PAYG** as the company share
   - **5% to insurer profit**
   - **85% to the insurer wallet ledger shown in the app**
5. The app credits and displays only the insurer-wallet share. Wallet value above a plan's monthly price remains in the wallet for later coverage.

All three shares are calculated from the post-fee amount. The wallet receives any rounding remainder so that the amounts add up exactly to the post-fee total.

### Small local-card examples

These examples use Paystack's published local-card rate of 1.5%, with the ₦100 fixed fee waived for payments below ₦2,500. The app uses the actual fee Paystack reports for the transaction; fees for another payment channel or a negotiated merchant rate may differ.

| Customer pays | Example Paystack fee | Left after fee | PAYG 10% | Insurer profit 5% | Wallet credit (remainder) |
|---:|---:|---:|---:|---:|---:|
| ₦100 | ₦1.50 | ₦98.50 | ₦9.85 | ₦4.93 | **₦83.72** |
| ₦200 | ₦3.00 | ₦197.00 | ₦19.70 | ₦9.85 | **₦167.45** |
| ₦500 | ₦7.50 | ₦492.50 | ₦49.25 | ₦24.63 | **₦418.62** |

For a ₦100 payment, for example, Paystack reports a ₦1.50 fee. Of the remaining ₦98.50, ₦9.85 is allocated to PAYG, ₦4.93 to insurer profit, and ₦83.72 is credited to the insurance wallet shown in the website.

### PAYG settlement account

The nominated PAYG settlement account supplied for this setup is **Zenith Bank, 2275404792**, account name **Ebunoluwa Ayomide Adeyinka**. Confirm the account details and settlement configuration in the Paystack Dashboard before processing live payments; application code does not change the merchant's Paystack payout account.

The PAYG and insurer-profit allocations are currently recorded per confirmed transaction for reconciliation. The insurer-wallet allocation is credited to the app's internal wallet ledger. This does not, by itself, initiate a transfer to the insurer's bank account. Separate bank payouts require the relevant Paystack subaccounts/split configuration and agreement on who bears Paystack fees.

## Paystack Dashboard setup steps

These steps configure the **website Paystack flow** and the PAYG settlement account. They do not enable SIM airtime deductions.

### 1. Check the Paystack business account

1. Sign in to the PAYG Paystack Dashboard with an owner/admin account that can manage settlement details and API settings.
2. Confirm the business is activated and can accept live NGN payments. Paystack's live keys are available only after activation.
3. Check the business type and payout-account requirements. Paystack says a Nigeria Starter Business must use an eligible personal account matching its verified BVN/ID details; a Registered Business must use a corporate account matching its registration details. Confirm the nominated account is eligible for the PAYG business profile before saving it.

### 2. Set the PAYG payout bank account

1. In the Dashboard, open **Settings → Accounts**.
2. Under payout accounts, select **Change** (or the equivalent edit option).
3. Enter the nominated Zenith Bank details supplied above and allow Paystack to resolve the account name.
4. Confirm the resolved name and bank details are correct before saving. Only an authorized user should make this change.
5. Return to **Settings → Accounts** and verify Zenith is shown as the payout account. Application code does not set this destination; Paystack sends the merchant's net settlement there according to its payout schedule.

Paystack's current guide: [Add or update a payout bank account](https://support.paystack.com/en/articles/2125314).

### 3. Add environment-specific API keys

1. In the Dashboard, switch to **Test Mode** and open **Settings → API Keys & Webhooks** (the Dashboard may also show this under **Developers**).
2. Copy the test **Public Key** and **Secret Key**.
3. Set the frontend build variable `VITE_PAYSTACK_PUBLIC_KEY` to the test public key. Set the backend environment variable `PAYSTACK_SECRET_KEY` to the test secret key.
4. Keep the secret key only in the backend hosting provider's environment settings. Never paste it into frontend variables, source files, or this document.
5. Use test keys on staging. Test mode does not move real money or verify the live bank settlement.
6. After testing and live activation, switch to **Live Mode** and repeat the process with the live keys: `pk_live_...` for `VITE_PAYSTACK_PUBLIC_KEY` and `sk_live_...` for backend `PAYSTACK_SECRET_KEY`.
7. Redeploy/rebuild the frontend and restart/redeploy the backend after changing keys. Keep staging on test keys and production on live keys.

Paystack key guide: [API Keys](https://paystack.com/docs/developer-tools/api-keys/). The public key can be used in the browser; secret keys must remain on the server.

### 4. Configure the payment webhook

1. In the Dashboard, choose the right mode (Test for staging, Live for production), then open **Developers → Webhooks** or **Settings → API Keys & Webhooks**.
2. Set the webhook URL to `https://<production-domain>/api/payments/webhook`. For staging, use the staging domain and backend.
3. Save the URL in each mode/environment that will receive payments. The app uses the `charge.success` event and checks Paystack's signature before processing it.
4. After a test payment, inspect the webhook delivery history and confirm the endpoint returns success. A failed delivery can be retried from the Dashboard.

Paystack guide: [Webhooks](https://paystack.com/docs/payments/webhooks/).

### 5. Apply the database change and test before live use

1. Apply `health-insurance/backend/supabase/migrations/20261112_paystack_allocation.sql` to the existing Supabase project. For a new database, use the updated `health-insurance/backend/supabase/schema.sql` instead.
2. Confirm the backend has the matching Paystack secret key and the frontend is built with the matching public key for that environment.
3. Make a small test-mode payment and confirm the transaction is settled once, the actual Paystack fee and allocations are recorded, and only the insurer-wallet share appears as the wallet credit.
4. Before live launch, make a small real payment and confirm it appears in Paystack and is paid to the expected PAYG bank account. Reconcile the gross amount, fee, allocations, and payout in the Dashboard.

### 6. Do not create split payouts for the current ledger-only arrangement

The current plan is to keep the PAYG and insurer-profit shares in the internal transaction ledger and credit the insurer-wallet share in the app after Paystack confirms payment. Under that plan, set the PAYG payout bank account above; **do not create a split group or subaccounts yet**. If the business later decides to pay the insurer's shares directly to bank accounts, first obtain and verify the insurer's payout details, then set up Paystack subaccounts/splits and update the integration. Paystack split groups can also assign who bears transaction fees, so their fee behavior must match the agreed calculation before use. See [Paystack Transaction Splits](https://support.paystack.com/en/articles/2132802).

## What the app records for website payments

After Paystack confirmation, the server records the gross payment, actual Paystack fee, net amount, and the three allocations. The verification callback and Paystack webhook use the same idempotent settlement so the same payment cannot credit the wallet twice.

The current 10% / 5% / 85% split is an implementation default and must match the commercial agreement. Paystack fees can change, so examples are illustrations; actual settlement uses the fee returned by Paystack.

## Pending items before launch

### Website Paystack top-up

- Apply `health-insurance/backend/supabase/migrations/20261112_paystack_allocation.sql` to the existing Supabase database before deploying the updated backend. For a new database, use the updated `health-insurance/backend/supabase/schema.sql` instead.
- Confirm that the Paystack merchant account settles to the nominated PAYG Zenith Bank account above. The settlement destination is configured in Paystack, not in this app.
- Confirm with the insurer that the post-fee allocation is **10% PAYG / 5% insurer profit / 85% insurer wallet**, including the rule for retaining wallet value above the plan price.
- Verify the split examples against the Paystack merchant account's actual fees and the channels customers will use.
- The app records the PAYG and insurer-profit portions for reconciliation, but does not automatically transfer those portions to separate bank accounts. If separate automatic payouts are required, create/verify the Paystack subaccounts and agree on the split and fee-bearer settings, then implement and verify Paystack split settlement.
- Run a small Paystack test-mode payment and confirm the recorded fee, three allocation amounts, idempotent settlement, and displayed wallet credit before enabling live payments.

### Airtime deduction from a SIM

- Choose a carrier-approved airtime-billing or reverse-billing provider that supports the target Nigerian networks.
- Obtain the provider's integration/API details and confirm it can send a trusted callback proving that airtime was actually deducted. A USSD session or customer screenshot is not confirmation.
- Agree the airtime calculation separately: deduction amount/percentage, provider fee, PAYG share, insurer profit, insurer-wallet credit, rounding, and settlement timing. Paystack's fee and the website's 10% / 5% / 85% split do not automatically apply to this route.
- Implement and test the carrier callback, duplicate-callback protection, failed/reversed charge handling, transaction ledger entries, and wallet credit only after verified deduction.
- Keep airtime top-ups disabled in the app until the provider integration and calculation are tested end to end.

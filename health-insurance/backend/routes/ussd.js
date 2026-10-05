/**
 * USSD Route — Africa's Talking
 * Handles all USSD sessions for PAYG.
 *
 * Africa's Talking POSTs to this endpoint on every USSD interaction.
 * Respond with:
 *   CON <text>  → continue (show menu, wait for input)
 *   END <text>  → end session (show final message)
 *
 * Mount in server.js:
 *   app.use("/api/ussd", require("./routes/ussd"));
 *
 * Africa's Talking Dashboard → USSD → Callback URL:
 *   https://your-backend.onrender.com/api/ussd?token=AT_USSD_CALLBACK_TOKEN
 */

const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/User");
const Subscription = require("../models/Subscription");


// ─── SESSION STORE (in-memory, replace with Redis in production) ──────────────
// Stores pending airtime deduction confirmations keyed by sessionId

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function normalisePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0")) return digits;
  return digits;
}

function planLabel(plan) {
  const labels = { Basic: "Basic ₦500", Standard: "Standard ₦1,000", Premium: "Premium ₦2,000" };
  return labels[plan] || plan;
}

// ─── MAIN USSD HANDLER ────────────────────────────────────────────────────────

router.post("/", express.urlencoded({ extended: false }), async (req, res) => {
  const expectedToken = process.env.AT_USSD_CALLBACK_TOKEN || '';
  const providedToken = String(req.query.token || '');
  const expectedBytes = Buffer.from(expectedToken);
  const providedBytes = Buffer.from(providedToken);
  if (!expectedToken || expectedBytes.length !== providedBytes.length || !crypto.timingSafeEqual(expectedBytes, providedBytes)) {
    return res.status(401).type('text/plain').send('END Service unavailable.');
  }
  const { sessionId, phoneNumber, text, networkCode } = req.body;

  // Split the input chain so we can navigate multi-step menus
  // text is cumulative: "1", "1*2", "1*2*500" etc.
  const parts = text ? text.split("*") : [];
  const level = parts.length; // how deep we are
  const current = parts[level - 1] || ""; // most recent input

  let response = "";

  try {
    // Normalise phone for DB lookup
    const phone = normalisePhone(phoneNumber);
    const user = await User.findOne({ phone });
    const subscription = user
      ? await Subscription.findOne({ user: user._id })
      : null;

    // ── ROOT MENU ─────────────────────────────────────────────────────────────
    if (text === "") {
      if (!user || !user.isOnboarded) {
        response = `CON Welcome to PAYG Health Insurance
1. Register
2. Check coverage
3. About PAYG`;
      } else {
        const balance = subscription ? subscription.walletBalance : 0;
        const status = subscription ? subscription.status : "inactive";
        const statusLabel = status === "active" ? "✅ Active" : "⚠️ Inactive";
        response = `CON PAYG — ${user.firstName}
Status: ${statusLabel}
Wallet: ₦${balance.toLocaleString()}

1. Top up wallet
2. Check coverage
3. My plan
4. File a claim
0. Exit`;
      }
    }

    // ── LEVEL 1 CHOICES ───────────────────────────────────────────────────────
    else if (text === "1" && (!user || !user.isOnboarded)) {
      response = `CON To register, please visit:
payg.ng

Or download the PAYG app and sign up with this number (${phoneNumber}).

0. Back`;
    }

    else if (text === "2" || (text.startsWith("2") && !user)) {
      // Check coverage — works for unregistered too (shows info)
      if (!user || !subscription) {
        response = `END You do not have an active PAYG plan.

Visit payg.ng to sign up and get covered from ₦500/month.`;
      } else {
        const { status, walletBalance, coverageEndDate, plan, policyNumber } =
          subscription;
        const days =
          coverageEndDate
            ? Math.max(
                0,
                Math.ceil(
                  (new Date(coverageEndDate) - Date.now()) / 86400000
                )
              )
            : 0;
        response = `END PAYG Coverage
Policy: ${policyNumber}
Plan: ${planLabel(plan)}
Status: ${status.toUpperCase()}
Wallet: ₦${walletBalance.toLocaleString()}
Days left: ${days}`;
      }
    }

    else if (text === "3" && !user) {
      response = `END PAYG Health Insurance
Pay small daily amounts to build coverage.
Plans from ₦500/month.
Visit payg.ng to get started.`;
    }

    // ── REGISTERED USER FLOWS ─────────────────────────────────────────────────

    // Session confirmation does not verify a money debit. Keep this menu informational
    // until a carrier-approved billing product supplies a charge result.
    else if (text === "1" || text.startsWith("1*")) {
      response = `END USSD airtime wallet top-up is unavailable. This USSD session cannot confirm an airtime charge. Please use Paystack in the PAYG app.`;
    }
    // 3. MY PLAN
    else if (text === "3") {
      if (!subscription) {
        response = `END No plan found. Visit payg.ng to get started.`;
      } else {
        const planPrice = { Basic: 500, Standard: 1000, Premium: 2000 };
        const price = planPrice[subscription.plan] || 0;
        const remaining = Math.max(0, price - subscription.walletBalance);
        response = `END My Plan
Plan: ${planLabel(subscription.plan)}
Price: ₦${price.toLocaleString()}/month
Wallet: ₦${subscription.walletBalance.toLocaleString()}
Still needed: ₦${remaining.toLocaleString()}
Status: ${subscription.status.toUpperCase()}

To change plan, visit payg.ng`;
      }
    }

    // 4. FILE A CLAIM (redirect to app — USSD not ideal for claim details)
    else if (text === "4") {
      response = `END To file a claim, please use the PAYG app or website:

1. Visit payg.ng
2. Go to Claims
3. Upload hospital receipt

Claim ref will be sent by SMS. Questions? Email help@payg.ng`;
    }

    // 0. EXIT
    else if (text === "0") {
      response = `END Thank you for using PAYG. Stay covered! 💙`;
    }

    // ── FALLBACK ──────────────────────────────────────────────────────────────
    else {
      response = `CON Invalid option. Please try again.

0. Back to main menu`;
    }
  } catch (err) {
    console.error("USSD error:", err);
    response = `END Sorry, something went wrong. Please try again later or visit payg.ng.`;
  }

  // Africa's Talking expects plain text, Content-Type: text/plain
  res.set("Content-Type", "text/plain");
  res.send(response);
});

module.exports = router;

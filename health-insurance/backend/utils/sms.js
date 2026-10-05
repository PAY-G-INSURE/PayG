/**
 * SMS Utility — Africa's Talking
 * Replaces Termii. Sends SMS via Africa's Talking API.
 * In development without valid credentials, logs to console.
 */

const AfricasTalking = require("africastalking");

let client = null;
let smsService = null;

function getClient() {
  if (smsService) return smsService;

  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;

  if (!apiKey || !username || apiKey === "your_at_api_key") {
    return null; // dev fallback
  }

  client = AfricasTalking({ apiKey, username });
  smsService = client.SMS;
  return smsService;
}

/**
 * Normalise Nigerian numbers to international format.
 * 08012345678 → +2348012345678
 */
function normalisePhone(phone) {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  return `+${digits}`;
}

/**
 * Send an SMS.
 * @param {string} to   - Phone number (any Nigerian format)
 * @param {string} body - Message text (max 160 chars per segment)
 */
async function sendSMS(to, body) {
  const phone = normalisePhone(to);
  const sms = getClient();

  if (!sms) {
    if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
      return { success: false, error: "Africa's Talking SMS is not configured" };
    }
    // Development fallback — log to console
    console.log(`\n📱 [SMS DEV LOG]`);
    console.log(`   To: ${phone}`);
    console.log(`   Message: ${body}`);
    console.log(`   (Set AT_API_KEY + AT_USERNAME to send real SMS)\n`);
    return { success: true, dev: true };
  }

  try {
    const result = await sms.send({
      to: [phone],
      message: body,
      from: process.env.AT_SENDER_ID || "PAYG",
    });
    console.log("SMS sent:", JSON.stringify(result));
    return { success: true, result };
  } catch (err) {
    console.error("SMS send failed:", err.message);
    return { success: false, error: err.message };
  }
}

// ─── SMS TEMPLATES ───────────────────────────────────────────────────────────

async function sendOTP(phone, otp) {
  return sendSMS(
    phone,
    `Your PAYG verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`
  );
}

async function sendWelcome(phone, firstName) {
  return sendSMS(
    phone,
    `Welcome to PAYG, ${firstName}! 🎉 Your health coverage journey starts now. Top up your wallet to activate your plan. Need help? Reply HELP.`
  );
}

async function sendPaymentReceived(phone, amount, walletBalance) {
  return sendSMS(
    phone,
    `PAYG: We received ₦${amount.toLocaleString()} payment. Wallet balance: ₦${walletBalance.toLocaleString()}. Keep topping up to stay covered!`
  );
}

async function sendCoverageActive(phone, planName, expiryDate) {
  const date = new Date(expiryDate).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return sendSMS(
    phone,
    `PAYG: Your ${planName} plan is now ACTIVE ✅. Coverage runs until ${date}. Show your policy number at any partner hospital.`
  );
}

async function sendCoverageLow(phone, remaining, planName) {
  return sendSMS(
    phone,
    `PAYG: Your ${planName} wallet is low. Top up ₦${remaining.toLocaleString()} to maintain active coverage. Visit payg.ng to pay now.`
  );
}

async function sendCoverageExpiringSoon(phone, daysLeft) {
  return sendSMS(
    phone,
    `PAYG: Your coverage expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Top up your wallet now to stay protected. Visit payg.ng.`
  );
}

async function sendCoverageLapsed(phone) {
  return sendSMS(
    phone,
    `PAYG: Your coverage has lapsed. Top up your wallet to reactivate your plan and stay protected. Visit payg.ng or reply TOPUP.`
  );
}

async function sendClaimSubmitted(phone, claimRef) {
  return sendSMS(
    phone,
    `PAYG: Claim ${claimRef} received ✅. We will review within 3 working days and update you by SMS. Keep your receipts safe.`
  );
}

async function sendClaimApproved(phone, claimRef, amount) {
  return sendSMS(
    phone,
    `PAYG: Great news! Claim ${claimRef} approved ✅. ₦${amount.toLocaleString()} will be paid within 5–10 working days.`
  );
}

async function sendClaimRejected(phone, claimRef, reason) {
  return sendSMS(
    phone,
    `PAYG: Claim ${claimRef} could not be approved. Reason: ${reason}. Contact support at help@payg.ng for assistance.`
  );
}

async function sendSubscriptionCancelled(phone) {
  return sendSMS(
    phone,
    `PAYG: Your subscription has been cancelled. Your coverage remains active until the end of your current period. We hope to see you back!`
  );
}

// ─── AIRTIME DEDUCTION (USSD-triggered) ──────────────────────────────────────

async function sendAirtimeDeductionConfirmation(phone, amount, walletBalance) {
  return sendSMS(
    phone,
    `PAYG: ₦${amount} deducted from your airtime and added to your wallet. Balance: ₦${walletBalance.toLocaleString()}. Dial *384*PAYG# to manage your account.`
  );
}

module.exports = {
  sendSMS,
  sendOTP,
  sendWelcome,
  sendPaymentReceived,
  sendCoverageActive,
  sendCoverageLow,
  sendCoverageExpiringSoon,
  sendCoverageLapsed,
  sendClaimSubmitted,
  sendClaimApproved,
  sendClaimRejected,
  sendSubscriptionCancelled,
  sendAirtimeDeductionConfirmation,
};

import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By creating a PAYG account or using our services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access the service. These terms apply to all users of the platform, including individuals browsing without registration.`,
  },
  {
    title: '2. Description of Service',
    body: `PAYG is a pay-as-you-go health insurance platform operated by PayGo Technologies Ltd, a licensed insurance intermediary registered with the National Insurance Commission (NAICOM), License No. IA/2024/001. PAYG facilitates access to health insurance products underwritten by licensed insurance companies regulated by NAICOM and the Central Bank of Nigeria (CBN).`,
  },
  {
    title: '3. Eligibility',
    body: `You must be at least 18 years old and a resident of Nigeria to use PAYG. By registering, you confirm that all information you provide is accurate, current, and complete. You are responsible for maintaining the accuracy of your personal details, including your next of kin information.`,
  },
  {
    title: '4. Insurance Coverage',
    body: `Coverage is conditional on your insurance wallet maintaining sufficient funds to meet the applicable plan premium. Coverage is activated once your wallet balance equals or exceeds your selected plan's monthly premium. Coverage automatically lapses if your wallet falls below the required threshold for more than 7 consecutive days. PAYG will notify you via SMS before coverage lapses.`,
  },
  {
    title: '5. Payments & Wallet',
    body: `All payments are processed securely through licensed payment processors (Paystack or Flutterwave). Funds added to your insurance wallet are non-refundable once applied to a coverage period. Unused wallet funds may be refunded within 30 days of account closure, subject to a processing fee of ₦500. PAYG is not responsible for failed transactions resulting from insufficient bank funds or payment processor downtime.`,
  },
  {
    title: '6. Claims',
    body: `Claims must be submitted within 90 days of the date of treatment. Claims require supporting documentation including a hospital receipt, treatment report, and a valid prescription where applicable. PAYG reserves the right to investigate any claim and may request additional information. Fraudulent claims will result in immediate account termination and may be reported to relevant authorities. Approved claims are paid within 5–10 working days.`,
  },
  {
    title: '7. Plan Changes & Cancellation',
    body: `You may change your plan at any time from your dashboard. Plan changes take effect at the start of your next billing cycle. You may cancel your subscription at any time. Cancellation does not entitle you to a refund of any amounts already applied to coverage. Upon cancellation, your coverage remains active until the end of the current coverage period.`,
  },
  {
    title: '8. Limitation of Liability',
    body: `PAYG acts as an intermediary between you and the underwriting insurance company. PAYG is not liable for any failure by the underwriting insurer to pay valid claims. Our total liability to you for any claim arising from these terms shall not exceed the total premiums paid by you in the 12 months preceding the claim.`,
  },
  {
    title: '9. Privacy',
    body: `Your use of PAYG is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using PAYG, you consent to the collection, use, and sharing of your personal information as described in the Privacy Policy.`,
  },
  {
    title: '10. Changes to Terms',
    body: `PAYG reserves the right to modify these Terms at any time. We will provide at least 14 days' notice of material changes via SMS or email. Your continued use of the service after changes take effect constitutes acceptance of the new terms.`,
  },
  {
    title: '11. Contact Us',
    body: `If you have any questions about these Terms, please contact us:\n\nPayGo Technologies Ltd\nEmail: legal@payg.ng\nPhone: +234 (0) 800 PAYG NG\nAddress: 12 Broad Street, Lagos Island, Lagos, Nigeria.`,
  },
]

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0A1F12] text-[#F0F6FC]">
      <PageHeader title="Terms of Service" subtitle="Last updated: January 1, 2026"/>

      <div className="px-5 pt-4 pb-16 max-w-md mx-auto">
        
        {/* Intro Alert Box styled for dark UI */}
        <div className="bg-[#102A18] border border-[#65C37A]/10 rounded-2xl p-4 mb-6 flex gap-2 items-start">
          <span className="icon text-[#65C37A] text-xl flex-shrink-0 mt-0.5">description</span>
          <p className="text-xs text-[#8B949E] font-display leading-relaxed">
            Please read these terms carefully before using the PAYG platform. These terms constitute a legally binding agreement between you and PayGo Technologies Ltd.
          </p>
        </div>

        {/* Content Sections */}
        <div className="flex flex-col gap-6">
          {sections.map((s, i) => (
            <div key={i}>
              <h3 className="font-display font-bold text-[#65C37A] text-base mb-2">{s.title}</h3>
              <p className="text-sm text-[#8B949E] leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Footer Navigation Action Links */}
        <div className="mt-10 pt-6 border-t border-[#2D4D35]">
          <p className="text-xs text-[#8B949E] mb-3 font-display">Related documents:</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-xs text-[#65C37A] font-display font-bold hover:underline flex items-center gap-1">
              <span className="icon-o text-sm">privacy_tip</span> Privacy Policy
            </Link>
            <a href="mailto:legal@payg.ng" className="text-xs text-[#65C37A] font-display font-bold hover:underline flex items-center gap-1">
              <span className="icon-o text-sm">mail</span> Contact Legal
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
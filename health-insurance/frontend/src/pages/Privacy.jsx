import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'

const sections = [
  { title: '1. Information We Collect', body: `We collect the following categories of personal information:\n\n• Identity data: Full name, date of birth, gender, government-issued ID number (BVN/NIN where required by regulations)\n• Contact data: Phone number, email address\n• Health data: Information you provide when making claims, including hospital reports and receipts\n• Next of kin data: Name, relationship, and phone number of your designated beneficiary\n• Financial data: Payment transaction records (we do not store card numbers — these are handled by Paystack/Flutterwave)\n• Technical data: Device type, IP address, app usage logs` },
  { title: '2. How We Use Your Information', body: `We use your personal data to:\n\n• Create and manage your PAYG account and insurance subscription\n• Process payments and maintain your insurance wallet\n• Verify your identity and prevent fraud\n• Process insurance claims and communicate claim decisions\n• Send SMS/email notifications about your coverage and payments\n• Comply with legal and regulatory requirements, including reporting to NAICOM\n• Improve our products and services through anonymised analytics` },
  { title: '3. Legal Basis for Processing', body: `We process your personal data on the following lawful bases:\n\n• Contract: Processing necessary to fulfil your insurance subscription agreement\n• Legal obligation: Compliance with NAICOM regulations, CBN guidelines, and Nigerian data protection laws\n• Legitimate interests: Fraud prevention, service improvement, and security\n• Consent: Where you have explicitly consented, such as for marketing communications` },
  { title: '4. Sharing Your Information', body: `We share your personal data with:\n\n• Underwriting insurance partners — to provide and administer your coverage\n• Payment processors (Paystack, Flutterwave) — to process transactions securely\n• SMS/notification providers (Termii, Africa's Talking) — to send you alerts\n• Regulatory bodies (NAICOM, CBN) — as required by law\n• Professional advisers — lawyers, auditors, where legally required\n\nWe do not sell your personal data to third parties for marketing purposes.` },
  { title: '5. Data Security', body: `We implement industry-standard security measures including TLS 1.3 encryption in transit, AES-256 at rest, role-based access controls, regular third-party security audits, and PCI-DSS compliance via our payment processors.\n\nPlease notify us immediately at security@payg.ng if you suspect unauthorised access.` },
  { title: '6. Data Retention', body: `We retain your data while your account is active. After closure:\n\n• Transaction records: 7 years (CBN requirement)\n• Insurance claim records: 10 years (NAICOM requirement)\n• Identity verification data: 5 years after account closure` },
  { title: '7. Your Rights', body: `Under the NDPR and Data Protection Act 2023, you have the right to access, rectify, erase, port, and object to processing of your data. To exercise these rights, contact privacy@payg.ng. We will respond within 30 days.` },
  { title: '8. Cookies & Analytics', body: `Our web platform uses essential cookies to maintain your session. We use anonymised analytics. We do not use third-party advertising cookies.` },
  { title: "9. Children's Privacy", body: `PAYG is not intended for persons under 18. Contact privacy@payg.ng if you believe a minor has provided data and we will delete it promptly.` },
  { title: '10. Changes to This Policy', body: `We will notify you of significant changes via SMS or email at least 14 days before they take effect.` },
  { title: '11. Contact Our Data Protection Officer', body: `PayGo Technologies Ltd — Data Protection Officer\nEmail: privacy@payg.ng\nPhone: +234 (0) 800 PAYG NG\nAddress: 12 Broad Street, Lagos Island, Lagos, Nigeria\n\nComplaints can be lodged with the Nigeria Data Protection Commission at ndpc.gov.ng.` },
]

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0A1F12] text-[#F0F6FC]">
      <PageHeader title="Privacy Policy" subtitle="Last updated: January 1, 2026"/>

      <div className="px-5 lg:px-8 pt-6 pb-16 max-w-4xl mx-auto lg:mx-0">

        {/* Badges row with dark treatment styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#102A18] border border-[#65C37A]/10 rounded-2xl p-4 flex gap-2 items-start">
            <span className="icon text-[#65C37A] text-xl flex-shrink-0 mt-0.5">privacy_tip</span>
            <p className="text-xs text-[#8B949E] font-display leading-relaxed">
              Your privacy matters to us. This policy explains exactly what data we collect, why, and how you can control it.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[#102A18] border border-[#2D4D35] rounded-2xl p-4">
            <span className="icon text-[#65C37A] text-2xl">verified_user</span>
            <div>
              <p className="text-xs font-display font-bold text-[#F0F6FC]">NDPR Compliant</p>
              <p className="text-[10px] text-[#8B949E]">Nigeria Data Protection Regulation & Data Protection Act 2023</p>
            </div>
          </div>
        </div>

        {/* Sections — Adjusted contrasting headers and readable block copy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-7">
          {sections.map((s, i) => (
            <div key={i} className={s.title.startsWith('1.') || s.title.startsWith('2.') ? 'lg:col-span-2' : ''}>
              <h3 className="font-display font-bold text-[#65C37A] text-base mb-2">{s.title}</h3>
              <p className="text-sm text-[#8B949E] leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Footer Area Action Anchors */}
        <div className="mt-10 pt-6 border-t border-[#2D4D35] flex flex-wrap gap-5 items-center">
          <p className="text-xs text-[#8B949E] font-display">Related:</p>
          <Link to="/terms" className="text-xs text-[#65C37A] font-display font-bold hover:underline flex items-center gap-1">
            <span className="icon-o text-sm">description</span> Terms of Service
          </Link>
          <a href="mailto:privacy@payg.ng" className="text-xs text-[#65C37A] font-display font-bold hover:underline flex items-center gap-1">
            <span className="icon-o text-sm">mail</span> Contact DPO
          </a>
        </div>
      </div>
    </div>
  )
}
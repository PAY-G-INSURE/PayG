import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { usePaystack } from '../hooks/usePaystack.js'
import { api } from '../utils/api.js'
import AppLayout from '../components/AppLayout.jsx'
import PageHeader from '../components/PageHeader.jsx'

const QUICK_AMOUNTS = [200, 500, 1000, 2000]
export default function Payment() {
  const { subscription, addPayment, user } = useApp()
  const { openPaystack } = usePaystack()
  const navigate = useNavigate()

  // Payment tab: 'manual' | 'airtime'
  const [tab,     setTab]     = useState('manual')
  const [amount,  setAmount]  = useState('')
  const [method,  setMethod]  = useState('paystack')
  const [stage,   setStage]   = useState('form')
  const [error,   setError]   = useState('')
  const [paidRef, setPaidRef] = useState(null)

  const remaining = Math.max(0, subscription.planPrice - subscription.walletBalance)
  const progress  = Math.min((subscription.walletBalance / subscription.planPrice) * 100, 100)

  // ── Manual payment ────────────────────────────────────────────────────────
  const handlePay = async () => {
    const amt = parseInt(amount)
    if (!amt || amt < 100) { setError('Minimum payment is ₦100'); return }
    setError('')
    setStage('processing')
    try {
      if (method !== 'paystack') throw new Error('Flutterwave is not configured yet. Please use Paystack.')
      const initialized = await api.payments.initialize(amt)
      openPaystack({
      email: user?.email || 'user@payg.ng',
      amount: amt,
      reference: initialized.reference,
      onSuccess: async (response) => {
        try {
          await addPayment(response.reference)
        setPaidRef(response.reference)
        setStage('success')
        } catch (err) { setStage('form'); setError(err.message || 'Payment verification failed') }
      },
      onClose: () => { setStage('form'); setError('Payment was cancelled. Try again.') },
      })
    } catch (err) { setStage('form'); setError(err.message || 'Unable to start payment') }
  }

  // ── Processing screen ─────────────────────────────────────────────────────
  if (stage === 'processing') {
    return (
      <div className="min-h-screen bg-[#0A1F12] flex flex-col items-center justify-center px-5 text-[#F0F6FC]">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#102A18] border border-[#2D4D35] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(101,195,122,0.1)]">
            <span className="w-10 h-10 border-4 border-[#173A23] border-t-[#65C37A] rounded-full animate-spin block"/>
          </div>
          <h2 className="font-display font-extrabold text-2xl mb-2">Opening Paystack…</h2>
          <p className="text-[#8B949E] text-sm">Secure payment gateway is loading</p>
        </div>
      </div>
    )
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (stage === 'success') {
    const amt = parseInt(amount)
    return (
      <div className="min-h-screen bg-[#0A1F12] flex flex-col items-center justify-center px-5 text-[#F0F6FC]">
        <div className="text-center w-full max-w-md mx-auto">
          <div className="w-24 h-24 bg-[#102A18] border border-[#65C37A]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(101,195,122,0.15)]">
            <span className="icon text-[#65C37A] text-5xl">check_circle</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl mb-1">Payment Successful!</h2>
          <p className="text-[#8B949E] text-sm mb-6">₦{amt.toLocaleString()} added to your insurance wallet</p>
          
          <div className="bg-[#102A18] border border-[#2D4D35] rounded-3xl p-5 mb-5 text-left space-y-3">
            {[
              ['Amount',      `₦${amt.toLocaleString()}`],
              ['Reference',   paidRef],
              ['New Balance', `₦${subscription.walletBalance.toLocaleString()}`],
              ['Status',      'Confirmed'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-[#8B949E] font-display">{l}</span>
                <span className="font-display font-bold text-[#F0F6FC] text-xs md:text-sm">{v}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#102A18] border border-[#65C37A]/20 rounded-2xl p-4 mb-6 flex gap-3 items-start text-left">
            <span className="icon text-[#65C37A] text-xl flex-shrink-0">sms</span>
            <div>
              <p className="text-xs font-display font-bold text-[#65C37A] mb-1">SMS Sent ✓</p>
              <p className="text-xs text-[#8B949E] italic leading-relaxed">
                "₦{amt.toLocaleString()} received. Your PAYG coverage is active. Stay healthy! 🛡️"
              </p>
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')}
            className="w-full bg-[var(--t6)] text-[#0A1F12] font-display font-bold py-4 rounded-3xl shadow-[0_4px_20px_rgba(101,195,122,0.25)] hover:opacity-90 active:scale-95 transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <>
      <AppLayout>
        <div className="pb-28 md:pb-8 md:pt-20 text-[#F0F6FC] bg-[#0A1F12] min-h-screen">
          <PageHeader title="Top Up Wallet" subtitle="Fund your insurance wallet"/>

          <div className="px-4 md:px-6 pt-4 flex flex-col gap-4">

            {/* Wallet balance card */}
            <div className="bg-[var(--t6)] border border-[#2D4D35] rounded-4xl p-5 md:p-7 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#65C37A]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"/>
              <p className="text-[#8B949E] text-xs font-display font-semibold mb-1">Insurance Wallet</p>
              <p className="font-display font-black text-[#F0F6FC] text-3xl mb-3">
                ₦{subscription.walletBalance.toLocaleString()}
              </p>
              
              <div className="w-full h-1.5 bg-[#173A23] rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-[var(--t6)] rounded-full transition-all duration-700" style={{ width: `${progress}%` }}/>
              </div>

              <div className="flex items-center justify-between">
                {remaining > 0
                  ? <p className="text-[#8B949E] text-xs font-display">
                      ₦{remaining.toLocaleString()} more for full{' '}
                      <span className="text-[#65C37A] font-bold">{subscription.plan}</span> coverage
                    </p>
                  : <p className="text-[#65C37A] text-xs font-display font-bold">🎉 Fully funded this month!</p>}
                
                {subscription.airtimeDeduction?.enabled && (
                  <div className="flex items-center gap-1 bg-[#65C37A]/10 border border-[#65C37A]/20 px-2 py-1 rounded-full">
                    <span className="icon text-[#65C37A] text-sm">sim_card</span>
                    <p className="text-[#65C37A] text-[10px] font-display font-bold">
                      {subscription.airtimeDeduction.percentage}% airtime active
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-[#102A18] border border-[#2D4D35] rounded-2xl p-1">
              {[
                ['manual',  'payments',  'Pay Now'],
                ['airtime', 'sim_card',  'Airtime option'],
              ].map(([t, ic, lb]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display font-semibold text-sm transition-all ${
                    tab === t 
                      ? 'bg-[#173A23] text-[#65C37A] shadow-[0_0_15px_rgba(101,195,122,0.1)] border border-[#2D4D35]' 
                      : 'text-[#8B949E] hover:text-[#F0F6FC]'
                  }`}>
                  <span className={`text-lg ${tab === t ? 'icon text-[#65C37A]' : 'icon-o'}`}>{ic}</span>
                  {lb}
                </button>
              ))}
            </div>

            {/* ── TAB: Manual payment ──────────────────────────────────────── */}
            {tab === 'manual' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Amount selector */}
                  <div className="bg-[#102A18] border border-[#2D4D35] rounded-3xl p-5 shadow-card">
                    <p className="text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-3">
                      Quick Add
                    </p>
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {QUICK_AMOUNTS.map(a => (
                        <button key={a} onClick={() => { setAmount(String(a)); setError('') }}
                          className={`py-3 rounded-2xl font-display font-bold text-sm transition-all relative border ${
                            amount === String(a)
                              ? 'bg-[var(--t6)] text-[#0A1F12] border-transparent shadow-[0_0_15px_rgba(101,195,122,0.2)]'
                              : 'bg-[#173A23] border-[#2D4D35] text-[#F0F6FC] hover:border-[#65C37A] hover:text-[#65C37A]'
                          }`}>
                          {a === remaining && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] bg-[#27833D] text-[#F0F6FC] px-1.5 rounded-full font-display font-bold whitespace-nowrap">
                              Exact
                            </span>
                          )}
                          ₦{a >= 1000 ? `${a/1000}k` : a}
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-2">
                      Custom Amount
                    </p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display font-bold text-[#8B949E] text-lg">₦</span>
                      <input type="number" value={amount} min={100}
                        onChange={e => { setAmount(e.target.value); setError('') }}
                        placeholder="Enter amount (min ₦100)"
                        className={`w-full bg-[#173A23] border-2 rounded-2xl h-13 pl-9 pr-4 py-3.5 font-display font-bold text-lg text-[#F0F6FC] transition-all outline-none ${
                          error ? 'border-red-500/50 focus:border-red-500' : 'border-[#2D4D35] focus:border-[#65C37A]'
                        }`}/>
                    </div>
                    {error && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <span className="icon-o text-sm">error</span>{error}
                      </p>
                    )}
                  </div>

                  {/* Payment method */}
                  <div className="bg-[#102A18] border border-[#2D4D35] rounded-3xl p-5 shadow-card">
                    <p className="text-[10px] font-display font-bold text-[#8B949E] uppercase tracking-wider mb-3">
                      Payment Method
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { id:'paystack',    label:'Paystack',    sub:'Card, bank transfer, USSD',    emoji:'💳', badge:'Recommended' },
                        { id:'flutterwave', label:'Flutterwave', sub:'Card, mobile money, transfer', emoji:'🌍', badge: null },
                      ].map(m => (
                        <button key={m.id} onClick={() => setMethod(m.id)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                            method === m.id 
                              ? 'border-[#65C37A] bg-[#173A23] shadow-[0_0_15px_rgba(101,195,122,0.05)]' 
                              : 'border-[#2D4D35] bg-[#102A18] hover:border-[#65C37A]/50'
                          }`}>
                          <span className="text-2xl">{m.emoji}</span>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="font-display font-bold text-[#F0F6FC] text-sm">{m.label}</p>
                              {m.badge && (
                                <span className="text-[9px] bg-[#65C37A]/10 border border-[#65C37A]/20 text-[#65C37A] font-display font-bold px-1.5 py-0.5 rounded-full">
                                  {m.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#8B949E]">{m.sub}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            method === m.id ? 'border-[#65C37A]' : 'border-[#2D4D35]'
                          }`}>
                            {method === m.id && <div className="w-2.5 h-2.5 bg-[#65C37A] rounded-full"/>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-5 my-2">
                  {[["lock","SSL Secure"],["verified_user","PCI-DSS"],["support_agent","24/7 Support"]].map(([ic,lb]) => (
                    <div key={lb} className="flex items-center gap-1 text-[10px] text-[#8B949E] font-display">
                      <span className="icon-o text-sm text-[#65C37A]">{ic}</span> {lb}
                    </div>
                  ))}
                </div>

                <button onClick={handlePay}
                  className="w-full bg-[var(--t6)] text-[#0A1F12] font-display font-bold py-4 rounded-3xl shadow-[0_4px_20px_rgba(101,195,122,0.2)] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 text-base">
                  <span className="icon-o text-xl">payments</span>
                  Pay ₦{amount ? parseInt(amount).toLocaleString() : '---'} via {method === 'paystack' ? 'Paystack' : 'Flutterwave'}
                </button>
                <p className="text-center text-xs text-[#8B949E] pb-2">Secured by SSL. Your card details are never stored.</p>
              </>
            )}

            {/* ── TAB: Airtime deduction ───────────────────────────────────── */}
            {tab === 'airtime' && (
              <div className="bg-[#102A18] border border-[#2D4D35] rounded-3xl p-6 text-[#F0F6FC]">
                <h2 className="font-display font-bold text-lg mb-2">Airtime top-ups are not available yet</h2>
                <p className="text-sm text-[#8B949E] leading-relaxed">Africa’s Talking USSD sessions can bill a session fee, but this app does not have a carrier approved payment product that confirms a separate airtime charge. No wallet credit will be made through airtime. Use Paystack to fund your wallet.</p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  )
}

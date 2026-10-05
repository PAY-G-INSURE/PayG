import { useCallback } from 'react'

export function usePaystack() {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

  const openPaystack = useCallback(({ email, amount, reference, onSuccess, onClose }) => {
    if (!publicKey || !/^pk_(test|live)_/.test(publicKey)) {
      throw new Error('Paystack is not configured. Set VITE_PAYSTACK_PUBLIC_KEY.')
    }
    if (typeof window.PaystackPop === 'undefined') {
      throw new Error('Paystack checkout did not load. Check your connection and try again.')
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: email || 'user@payg.ng',
      amount: Math.round(Number(amount) * 100),
      currency: 'NGN',
      ref: reference,
      metadata: { custom_fields: [{ display_name: 'Platform', value: 'PAYG Insurance' }] },
      callback: response => onSuccess(response),
      onClose: () => onClose?.(),
    })
    handler.openIframe()
  }, [publicKey])

  return { openPaystack }
}

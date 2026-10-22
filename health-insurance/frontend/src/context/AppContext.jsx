import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../utils/api.js'

const Ctx = createContext(null)
const planIds = { Basic: 1, Standard: 2, Premium: 3 }
const emptySubscription = { plan: 'Basic', planId: 1, status: 'pending', walletBalance: 0, planPrice: 500 }

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(emptySubscription)
  const [transactions, setTransactions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [claims, setClaims] = useState([])
  const applySubscription = useCallback((sub) => {
    if (sub) setSubscription(prev => ({ ...prev, ...sub, planId: sub.planId || planIds[sub.plan] || prev.planId }))
  }, [])
  const refresh = useCallback(async () => {
    if (!localStorage.getItem('payg_token')) return
    const [me, sub, payments, userClaims, notes, airtime] = await Promise.all([
      api.auth.me(), api.subscription.get(), api.payments.list(), api.claims.list(), api.notifications.list(), api.airtime.getSettings(),
    ])
    setUser(me.user)
    applySubscription({ ...sub.subscription, airtimeDeduction: airtime.settings })
    setTransactions(payments.transactions || [])
    setClaims(userClaims.claims || [])
    setNotifications(notes.notifications || [])
  }, [applySubscription])
  // refresh awaits the API batch before setting state; this effect restores an existing login.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refresh().catch(() => {}) }, [refresh])
  const login = useCallback((userData) => {
    if (!userData || typeof userData !== 'object') return
    setUser(userData)
    setTimeout(() => refresh().catch(() => {}), 0)
  }, [refresh])
  const logout = useCallback(() => {
    localStorage.removeItem('payg_token')
    setUser(null); setSubscription(emptySubscription); setTransactions([]); setClaims([]); setNotifications([])
  }, [])
  const updateUser = useCallback(async (data) => {
    const current = user || {}
    const result = await api.auth.updateProfile({ ...current, ...data,
      dateOfBirth: data.dateOfBirth || data.dob || current.dateOfBirth || current.dob,
      kinRelation: data.kinRelation || data.kinRelationship || current.kinRelation || current.kinRelationship })
    setUser(result.user)
    return result.user
  }, [user])
  const changePlan = useCallback(async (planId) => {
    const result = await api.subscription.changePlan(Number(planId))
    applySubscription(result.subscription)
    return result.subscription
  }, [applySubscription])
  const cancelSubscription = useCallback(async () => { const result = await api.subscription.cancel(); await refresh(); return result }, [refresh])
  const addPayment = useCallback(async (reference) => {
    const result = await api.payments.verify(reference)
    applySubscription(result.subscription); await refresh(); return result
  }, [applySubscription, refresh])
  const submitClaim = useCallback(async (claimData) => {
    const result = await api.claims.submit({ ...claimData, type: claimData.type === 'Lab' ? 'Laboratory' : claimData.type,
      amountClaimed: claimData.amountClaimed || claimData.amount, hospital: claimData.hospital || 'Not specified',
      treatmentDate: claimData.treatmentDate || new Date().toISOString() })
    setClaims(prev => [result.claim, ...prev]); return result.claim
  }, [])
  const markRead = useCallback(async (id) => {
    const result = await api.notifications.markRead(id)
    setNotifications(prev => prev.map(n => n._id === id || n.id === id ? result.notification : n))
  }, [])
  const markAllRead = useCallback(async () => { await api.notifications.markAllRead(); setNotifications(prev => prev.map(n => ({ ...n, read: true }))) }, [])
  const updateAirtimeSettings = useCallback(async (settings) => {
    const result = await api.airtime.saveSettings(settings)
    setSubscription(prev => ({ ...prev, airtimeDeduction: result.settings })); return result.settings
  }, [])
  return <Ctx.Provider value={{ user, subscription, transactions, notifications, claims, login, logout, updateUser, refresh,
    setSubscription, changePlan, cancelSubscription, addPayment, submitClaim, markRead, markAllRead, updateAirtimeSettings,
    unreadCount: notifications.filter(n => !n.read).length }}>{children}</Ctx.Provider>
}
// Context hooks intentionally share this module; edits may trigger a full reload.
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(Ctx)

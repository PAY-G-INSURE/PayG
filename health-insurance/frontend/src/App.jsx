import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Plans from './pages/Plans.jsx'
import Payment from './pages/Payment.jsx'
import Claims from './pages/Claims.jsx'
import Profile from './pages/Profile.jsx'
import Notifications from './pages/Notifications.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import { AdminProvider, AdminGuard } from './admin/AdminContext'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminOverview from './admin/pages/AdminOverview'
import AdminClaims from './admin/pages/AdminClaims'
import {
  AdminUsers,
  AdminTransactions,
  AdminSubscriptions,
  AdminBroadcast,
} from './admin/pages/AdminPages'

export default function App() {
  return (
    <AdminProvider>
      <AppProvider>
        <BrowserRouter basename="/health-insurance">
          <Routes>

            {/* ── Public routes ── */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* ── App routes ── */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* ── Hidden admin routes — not linked anywhere in UI ── */}
            <Route path="/x/admin/login" element={<AdminLogin />} />
            <Route path="/x/admin" element={
              <AdminGuard><AdminLayout /></AdminGuard>
            }>
              <Route index            element={<AdminOverview />} />
              <Route path="users"     element={<AdminUsers />} />
              <Route path="claims"    element={<AdminClaims />} />
              <Route path="payments"  element={<AdminTransactions />} />
              <Route path="subs"      element={<AdminSubscriptions />} />
              <Route path="broadcast" element={<AdminBroadcast />} />
            </Route>

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AdminProvider>
  )
}

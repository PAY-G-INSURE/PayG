import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAdmin as apiLoginAdmin, verifyAdmin } from './adminApi'

const AdminContext = createContext(null)
const TOKEN_KEY = 'payg_admin_token'

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(sessionStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) return
    verifyAdmin().then(result => setAdmin(result.admin)).catch(() => sessionStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false))
  }, [])

  async function adminLogin(username, password) {
    const result = await apiLoginAdmin(username.trim(), password)
    sessionStorage.setItem(TOKEN_KEY, result.token)
    setAdmin(result.admin)
    return result.admin
  }

  function adminLogout() {
    sessionStorage.removeItem(TOKEN_KEY)
    setAdmin(null)
  }

  return <AdminContext.Provider value={{ admin, isAdmin: Boolean(admin), adminLogin, adminLogout, loading }}>{children}</AdminContext.Provider>
}

// Context hooks intentionally share this module; edits may trigger a full reload.
// eslint-disable-next-line react-refresh/only-export-components
export const useAdmin = () => useContext(AdminContext)

export function AdminGuard({ children }) {
  const { isAdmin, loading } = useAdmin()
  const navigate = useNavigate()
  useEffect(() => {
    if (!loading && !isAdmin) navigate('/x/admin/login', { replace: true })
  }, [isAdmin, loading, navigate])
  if (loading || !isAdmin) return null
  return children
}

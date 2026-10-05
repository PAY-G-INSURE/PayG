// src/admin/pages/AdminPages.jsx
// Contains: AdminUsers, AdminTransactions, AdminSubscriptions, AdminBroadcast
import { useState, useEffect, useCallback } from "react";
import { getUsers, updateUser, getTransactions, getSubscriptionSummary, sendBroadcast } from "../adminApi";

// ─── SHARED ───────────────────────────────────────────────────────────────────

function Skeleton({ h = "14px", w = "100%" }) {
  return <div style={{ height: h, width: w, background: "#1e1e2e", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite", marginBottom: "4px" }} />;
}

function planColor(p) { return p === "Premium" ? "#86A95E" : p === "Standard" ? "#27833D" : "#16A34A"; }
function statusColor(s) { return s === "active" ? "#16A34A" : s === "pending" ? "#86A95E" : "#6B7280"; }

// ─── USERS ────────────────────────────────────────────────────────────────────

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUsers({ search, status: filter === "All" ? "" : filter.toLowerCase(), page, limit: 20 })
      .then(data => {
        setUsers(data.users || []);
        setTotalPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, filter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleToggleActive(user) {
    setUpdating(true);
    try {
      await updateUser(user._id, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      setSelected(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 4px", color: "#fff", fontSize: "24px", fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Users</h1>
        <p style={{ margin: 0, color: "#6B7280", fontSize: "14px" }}>{total.toLocaleString()} registered users</p>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#f87171", fontSize: "13px" }}>⚠️ {error}</div>}

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["All", "Active", "Pending", "Inactive"].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{
            padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
            border: "1px solid", cursor: "pointer",
            borderColor: filter === f ? "#27833D" : "#1e1e2e",
            background: filter === f ? "rgba(39,131,61,0.15)" : "transparent",
            color: filter === f ? "#60a5fa" : "#6B7280",
          }}>{f}</button>
        ))}
        <input
          placeholder="Search name, phone, email..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: "200px", background: "#111118", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "8px 14px", color: "#fff", fontSize: "13px", outline: "none" }}
        />
        <button onClick={fetchUsers} style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(39,131,61,0.1)", border: "1px solid rgba(39,131,61,0.2)", color: "#60a5fa", cursor: "pointer", fontSize: "13px" }}>Refresh</button>
      </div>

      <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
              {["User", "Phone", "Plan", "Wallet", "Status", "Joined", ""].map(h => (
                <th key={h} style={{ padding: "12px 16px", color: "#6B7280", fontSize: "11px", fontWeight: 700, textAlign: "left", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(6).fill(0).map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1e1e2e" }}>
                {Array(7).fill(0).map((_, j) => (
                  <td key={j} style={{ padding: "14px 16px" }}><Skeleton /></td>
                ))}
              </tr>
            )) : users.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#374151" }}>No users found</td></tr>
            ) : users.map((u, i) => (
              <tr key={u._id || i}
                style={{ borderBottom: i < users.length - 1 ? "1px solid #1e1e2e" : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "#16161f"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(39,131,61,0.15)", color: "#27833D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>
                      {(u.name || "?")[0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, color: "#fff", fontSize: "13px", fontWeight: 600 }}>{u.name}</p>
                      <p style={{ margin: 0, color: "#6B7280", fontSize: "11px" }}>{u.policy}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#9CA3AF", fontSize: "13px" }}>{u.phone}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, background: `${planColor(u.plan)}18`, color: planColor(u.plan) }}>{u.plan}</span>
                </td>
                <td style={{ padding: "14px 16px", color: "#fff", fontSize: "13px", fontWeight: 700 }}>₦{(u.wallet || 0).toLocaleString()}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: statusColor(u.status), fontSize: "12px", fontWeight: 700 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor(u.status) }} />
                    {u.status?.charAt(0).toUpperCase() + u.status?.slice(1)}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", color: "#6B7280", fontSize: "12px" }}>
                  {u.joined ? new Date(u.joined).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => setSelected(u)} style={{ background: "rgba(39,131,61,0.1)", border: "1px solid rgba(39,131,61,0.2)", borderRadius: "8px", padding: "6px 12px", color: "#60a5fa", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 14px", borderRadius: "8px", background: "transparent", border: "1px solid #1e1e2e", color: page === 1 ? "#374151" : "#9CA3AF", cursor: page === 1 ? "not-allowed" : "pointer" }}>← Prev</button>
          <span style={{ padding: "6px 14px", color: "#6B7280", fontSize: "13px" }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 14px", borderRadius: "8px", background: "transparent", border: "1px solid #1e1e2e", color: page === totalPages ? "#374151" : "#9CA3AF", cursor: page === totalPages ? "not-allowed" : "pointer" }}>Next →</button>
        </div>
      )}

      {/* User detail modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "440px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: 800 }}>{selected.name}</h2>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            {[
              ["Phone",   selected.phone],
              ["Email",   selected.email || "—"],
              ["Plan",    selected.plan],
              ["Wallet",  `₦${(selected.wallet || 0).toLocaleString()}`],
              ["Status",  selected.status],
              ["Policy",  selected.policy],
              ["Active",  selected.isActive ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e1e2e" }}>
                <span style={{ color: "#6B7280", fontSize: "13px" }}>{k}</span>
                <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => handleToggleActive(selected)}
                disabled={updating}
                style={{ flex: 1, padding: "10px", borderRadius: "10px", border: `1px solid ${selected.isActive ? "#ef4444" : "#16A34A"}`, background: "transparent", color: selected.isActive ? "#ef4444" : "#16A34A", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                {updating ? "..." : selected.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

export function AdminTransactions() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTxns = useCallback(() => {
    setLoading(true);
    getTransactions({ search, page, limit: 20 })
      .then(data => { setTxns(data.transactions || []); setTotalPages(data.pages || 1); setTotal(data.total || 0); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchTxns(); }, [fetchTxns]);

  const totalRevenue = txns.filter(t => t.status === "success").reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 4px", color: "#fff", fontSize: "24px", fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Transactions</h1>
        <p style={{ margin: 0, color: "#6B7280", fontSize: "14px" }}>{total.toLocaleString()} total • Page revenue: <span style={{ color: "#16A34A", fontWeight: 700 }}>₦{totalRevenue.toLocaleString()}</span></p>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#f87171", fontSize: "13px" }}>⚠️ {error}</div>}

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <input
          placeholder="Search by user or reference..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, background: "#111118", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "13px", outline: "none" }}
        />
        <button onClick={fetchTxns} style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(39,131,61,0.1)", border: "1px solid rgba(39,131,61,0.2)", color: "#60a5fa", cursor: "pointer", fontSize: "13px" }}>Refresh</button>
      </div>

      <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
              {["Reference", "User", "Amount", "Channel", "Status", "Date"].map(h => (
                <th key={h} style={{ padding: "12px 16px", color: "#6B7280", fontSize: "11px", fontWeight: 700, textAlign: "left", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(6).fill(0).map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1e1e2e" }}>
                {Array(6).fill(0).map((_, j) => <td key={j} style={{ padding: "14px 16px" }}><Skeleton /></td>)}
              </tr>
            )) : txns.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#374151" }}>No transactions found</td></tr>
            ) : txns.map((t, i) => (
              <tr key={i}
                style={{ borderBottom: i < txns.length - 1 ? "1px solid #1e1e2e" : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "#16161f"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 16px", color: "#60a5fa", fontSize: "12px", fontFamily: "monospace" }}>{t.ref}</td>
                <td style={{ padding: "14px 16px", color: "#fff", fontSize: "13px", fontWeight: 600 }}>{t.user}</td>
                <td style={{ padding: "14px 16px", color: "#fff", fontSize: "13px", fontWeight: 700 }}>₦{(t.amount || 0).toLocaleString()}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, background: t.channel === "USSD" ? "rgba(134,169,94,0.1)" : "rgba(22,163,74,0.1)", color: t.channel === "USSD" ? "#86A95E" : "#16A34A" }}>
                    <span className="material-symbols-rounded" style={{ fontSize: "14px" }}>{t.channel === "USSD" ? "dialpad" : "credit_card"}</span>
                    {t.channel}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, background: t.status === "success" ? "rgba(22,163,74,0.1)" : "rgba(239,68,68,0.1)", color: t.status === "success" ? "#16A34A" : "#ef4444" }}>{t.status}</span>
                </td>
                <td style={{ padding: "14px 16px", color: "#6B7280", fontSize: "12px" }}>
                  {t.date ? new Date(t.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{ padding: "6px 14px", borderRadius: "8px", background: "transparent", border: "1px solid #1e1e2e", color: page===1 ? "#374151" : "#9CA3AF", cursor: page===1 ? "not-allowed" : "pointer" }}>← Prev</button>
          <span style={{ padding: "6px 14px", color: "#6B7280", fontSize: "13px" }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} style={{ padding: "6px 14px", borderRadius: "8px", background: "transparent", border: "1px solid #1e1e2e", color: page===totalPages ? "#374151" : "#9CA3AF", cursor: page===totalPages ? "not-allowed" : "pointer" }}>Next →</button>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

export function AdminSubscriptions() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSubscriptionSummary()
      .then(data => setSummary(data.summary))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const plans = [
    { plan: "Basic",    price: "₦500",   color: "#16A34A" },
    { plan: "Standard", price: "₦1,000", color: "#27833D" },
    { plan: "Premium",  price: "₦2,000", color: "#86A95E" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 4px", color: "#fff", fontSize: "24px", fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Subscriptions</h1>
        <p style={{ margin: 0, color: "#6B7280", fontSize: "14px" }}>Plan distribution across all users</p>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#f87171", fontSize: "13px" }}>⚠️ {error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {plans.map(p => (
          <div key={p.plan} style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, background: `${p.color}18`, color: p.color }}>{p.plan}</span>
              <span style={{ color: "#6B7280", fontSize: "12px" }}>{p.price}/mo</span>
            </div>
            {loading ? <Skeleton h="40px" w="60%" /> : (
              <>
                <p style={{ margin: 0, color: "#fff", fontSize: "36px", fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>
                  {(summary?.[p.plan] || 0).toLocaleString()}
                </p>
                <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "12px" }}>subscribers</p>
                <p style={{ margin: "8px 0 0", color: p.color, fontSize: "13px", fontWeight: 700 }}>
                  ₦{((summary?.[p.plan] || 0) * parseInt(p.price.replace(/[₦,]/g, ""))).toLocaleString()}/mo potential
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {!loading && summary && (
        <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px", padding: "24px" }}>
          <h2 style={{ margin: "0 0 16px", color: "#fff", fontSize: "15px", fontWeight: 700 }}>Plan Distribution</h2>
          {plans.map(p => {
            const total = (summary.Basic||0) + (summary.Standard||0) + (summary.Premium||0);
            const count = summary[p.plan] || 0;
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={p.plan} style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#9CA3AF", fontSize: "13px" }}>{p.plan}</span>
                  <span style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>{count.toLocaleString()} ({pct}%)</span>
                </div>
                <div style={{ height: "8px", background: "#1e1e2e", borderRadius: "4px" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: p.color, borderRadius: "4px", transition: "width 0.6s" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ─── BROADCAST ────────────────────────────────────────────────────────────────

export function AdminBroadcast() {
  const [audience, setAudience] = useState("all");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    setError("");
    try {
      const data = await sendBroadcast({ audience, message: message.trim() });
      setResult(data);
      setMessage("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  const audienceOptions = [
    { value: "all",      label: "All Users",          desc: "Every registered user" },
    { value: "active",   label: "Active Coverage",    desc: "Users with active plan" },
    { value: "pending",  label: "Pending Activation", desc: "Wallet funded, not active" },
    { value: "inactive", label: "Inactive / Lapsed",  desc: "Users who need to top up" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 4px", color: "#fff", fontSize: "24px", fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Broadcast SMS</h1>
        <p style={{ margin: 0, color: "#6B7280", fontSize: "14px" }}>Send messages to users via Africa's Talking</p>
      </div>

      {result && (
        <div style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#4ade80", display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="material-symbols-rounded">check_circle</span>
          SMS sent to {result.sent} users successfully!
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#f87171", fontSize: "13px" }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px", padding: "28px", maxWidth: "600px" }}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", color: "#9CA3AF", fontSize: "12px", fontWeight: 600, marginBottom: "10px", letterSpacing: "0.05em" }}>AUDIENCE</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {audienceOptions.map(a => (
              <button key={a.value} onClick={() => setAudience(a.value)} style={{
                padding: "12px 16px", borderRadius: "10px", textAlign: "left",
                border: `1px solid ${audience === a.value ? "#27833D" : "#1e1e2e"}`,
                background: audience === a.value ? "rgba(39,131,61,0.1)" : "transparent",
                cursor: "pointer",
              }}>
                <p style={{ margin: "0 0 2px", color: "#fff", fontSize: "13px", fontWeight: 600 }}>{a.label}</p>
                <p style={{ margin: 0, color: "#6B7280", fontSize: "11px" }}>{a.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", color: "#9CA3AF", fontSize: "12px", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.05em" }}>
            MESSAGE <span style={{ color: "#374151", fontWeight: 400, textTransform: "none" }}>({message.length}/160)</span>
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value.slice(0, 160))}
            placeholder="Type your message... (max 160 characters)"
            rows={4}
            style={{ width: "100%", boxSizing: "border-box", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "14px", outline: "none", resize: "vertical" }}
          />
        </div>

        <div style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" }}>
          <p style={{ margin: "0 0 4px", color: "#6B7280", fontSize: "12px" }}>Preview</p>
          <p style={{ margin: "0 0 6px", color: "#fff", fontSize: "13px" }}>{message || "Your message will appear here..."}</p>
          <p style={{ margin: 0, color: "#374151", fontSize: "11px" }}>
            Sending to <strong style={{ color: "#6B7280" }}>{audienceOptions.find(a => a.value === audience)?.label}</strong> via PAYG sender ID
          </p>
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          style={{
            width: "100%", padding: "13px", borderRadius: "10px", border: "none",
            background: message.trim() && !sending ? "#27833D" : "#1e1e2e",
            color: message.trim() && !sending ? "#fff" : "#374151",
            fontWeight: 700, fontSize: "15px",
            cursor: message.trim() && !sending ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {sending ? (
            <><span className="material-symbols-rounded" style={{ animation: "spin 1s linear infinite", fontSize: "18px" }}>progress_activity</span> Sending...</>
          ) : (
            <><span className="material-symbols-rounded">send</span> Send Broadcast</>
          )}
        </button>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

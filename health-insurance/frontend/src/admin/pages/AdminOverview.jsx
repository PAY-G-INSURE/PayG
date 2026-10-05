// src/admin/pages/AdminOverview.jsx
import { useState, useEffect } from "react";
import { getStats } from "../adminApi";

function StatCard({ label, value, sub, icon, color = "#27833D" }) {
  return (
    <div style={{
      background: "#111118", border: "1px solid #1e1e2e",
      borderRadius: "16px", padding: "20px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: `none` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 8px", color: "#6B7280", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</p>
          <p style={{ margin: "0 0 4px", color: "#fff", fontSize: "28px", fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>{value}</p>
          {sub && <p style={{ margin: 0, color: "#374151", fontSize: "12px" }}>{sub}</p>}
        </div>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="material-symbols-rounded" style={{ fontSize: "20px", color }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function Skeleton({ h = "20px", w = "100%" }) {
  return <div style={{ height: h, width: w, background: "#1e1e2e", borderRadius: "6px", animation: "pulse 1.5s ease-in-out infinite", marginBottom: "8px" }} />;
}

function planColor(plan) {
  return plan === "Premium" ? "#86A95E" : plan === "Standard" ? "#27833D" : "#16A34A";
}

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats().then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 4px", color: "#fff", fontSize: "24px", fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Overview</h1>
        <p style={{ margin: 0, color: "#6B7280", fontSize: "14px" }}>Live snapshot of PAYG platform</p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#f87171", fontSize: "13px" }}>
          ⚠️ {error} — check the API URL and server admin configuration.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {loading ? Array(6).fill(0).map((_, i) => (
          <div key={i} style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px", padding: "20px" }}>
            <Skeleton h="12px" w="60%" /><Skeleton h="32px" w="40%" />
          </div>
        )) : <>
          <StatCard label="Total Users"        value={(s.totalUsers || 0).toLocaleString()}                        icon="group"                 color="#27833D" />
          <StatCard label="Active Coverage"    value={(s.activeSubscriptions || 0).toLocaleString()}               icon="verified_user"          color="#16A34A" sub={`${s.pendingSubscriptions || 0} pending`} />
          <StatCard label="Claims Pending"     value={s.claimsPending || 0}                                        icon="medical_services"       color="#86A95E" sub={`${s.claimsUnderReview || 0} under review`} />
          <StatCard label="Revenue This Month" value={`₦${((s.revenueMonth || 0)/1000).toFixed(0)}k`}             icon="payments"               color="#8B5CF6" sub={`₦${((s.revenueToday || 0)/1000).toFixed(1)}k today`} />
          <StatCard label="Total Wallet Funds" value={`₦${((s.totalWalletBalance || 0)/1000000).toFixed(2)}M`}    icon="account_balance_wallet" color="#06B6D4" />
          <StatCard label="Revenue This Week"  value={`₦${((s.revenueWeek || 0)/1000).toFixed(0)}k`}             icon="trending_up"            color="#10B981" />
        </>}
      </div>

      <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px", padding: "20px", marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 16px", color: "#fff", fontSize: "15px", fontWeight: 700 }}>Subscription Breakdown</h2>
        {loading ? <Skeleton h="40px" /> : (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "Active",   value: s.activeSubscriptions || 0,   color: "#16A34A" },
              { label: "Pending",  value: s.pendingSubscriptions || 0,   color: "#86A95E" },
              { label: "Inactive", value: s.inactiveSubscriptions || 0,  color: "#6B7280" },
            ].map(item => {
              const total = (s.activeSubscriptions||0) + (s.pendingSubscriptions||0) + (s.inactiveSubscriptions||0);
              const pct = total ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.label} style={{ flex: 1, minWidth: "140px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#9CA3AF", fontSize: "12px" }}>{item.label}</span>
                    <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>{item.value.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div style={{ height: "6px", background: "#1e1e2e", borderRadius: "3px" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: item.color, borderRadius: "3px", transition: "width 0.6s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px", padding: "20px" }}>
          <h2 style={{ margin: "0 0 16px", color: "#fff", fontSize: "15px", fontWeight: 700 }}>Recent Signups</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} h="40px" />) :
              (data?.recentSignups || []).length === 0 ? <p style={{ color: "#374151", fontSize: "13px" }}>No signups yet</p> :
              (data?.recentSignups || []).map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(39,131,61,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#27833D", fontSize: "14px", fontWeight: 700 }}>{u.name[0]}</div>
                    <div>
                      <p style={{ margin: 0, color: "#fff", fontSize: "13px", fontWeight: 600 }}>{u.name}</p>
                      <p style={{ margin: 0, color: "#6B7280", fontSize: "11px" }}>{u.phone}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", background: `${planColor(u.plan)}18`, color: planColor(u.plan) }}>{u.plan}</span>
                    <p style={{ margin: "2px 0 0", color: "#374151", fontSize: "11px" }}>{u.time}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px", padding: "20px" }}>
          <h2 style={{ margin: "0 0 16px", color: "#fff", fontSize: "15px", fontWeight: 700 }}>Recent Payments</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} h="40px" />) :
              (data?.recentPayments || []).length === 0 ? <p style={{ color: "#374151", fontSize: "13px" }}>No payments yet</p> :
              (data?.recentPayments || []).map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: p.channel === "USSD" ? "rgba(134,169,94,0.15)" : "rgba(22,163,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="material-symbols-rounded" style={{ fontSize: "16px", color: p.channel === "USSD" ? "#86A95E" : "#16A34A" }}>{p.channel === "USSD" ? "dialpad" : "credit_card"}</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, color: "#fff", fontSize: "13px", fontWeight: 600 }}>{p.name}</p>
                      <p style={{ margin: 0, color: "#6B7280", fontSize: "11px" }}>{p.channel}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, color: "#16A34A", fontSize: "14px", fontWeight: 700 }}>+₦{p.amount?.toLocaleString()}</p>
                    <p style={{ margin: "2px 0 0", color: "#374151", fontSize: "11px" }}>{p.time}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

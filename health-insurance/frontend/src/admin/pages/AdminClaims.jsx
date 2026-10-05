// src/admin/pages/AdminClaims.jsx
import { useState, useEffect, useCallback } from "react";
import { getClaims, updateClaim } from "../adminApi";

const STATUS_COLORS = {
  Submitted:      { bg: "#1e3a5f", text: "#60a5fa" },
  "Under Review": { bg: "#3b2a00", text: "#fbbf24" },
  Approved:       { bg: "#14401f", text: "#4ade80" },
  Rejected:       { bg: "#3b1212", text: "#f87171" },
  Paid:           { bg: "#0f3020", text: "#34d399" },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: "#1e1e2e", text: "#9CA3AF" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

function Skeleton() {
  return (
    <tr>
      {Array(8).fill(0).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{ height: "14px", background: "#1e1e2e", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [amountApproved, setAmountApproved] = useState("");
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchClaims = useCallback(() => {
    setLoading(true);
    getClaims({ status: filter === "All" ? "" : filter, search, page })
      .then(data => {
        setClaims(data.claims || []);
        setTotalPages(data.pages || 1);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter, search, page]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  async function handleUpdateStatus(newStatus) {
    if (!selected) return;
    setUpdating(true);
    try {
      await updateClaim(selected._id, {
        status: newStatus,
        reviewNote,
        amountApproved: amountApproved ? Number(amountApproved) : undefined,
      });
      setSelected(prev => ({ ...prev, status: newStatus }));
      setClaims(prev => prev.map(c => c._id === selected._id ? { ...c, status: newStatus } : c));
      setReviewNote("");
      setAmountApproved("");
    } catch (e) {
      alert("Update failed: " + e.message);
    } finally {
      setUpdating(false);
    }
  }

  const statuses = ["All", "Submitted", "Under Review", "Approved", "Rejected", "Paid"];

  const counts = {
    Submitted:      claims.filter(c => c.status === "Submitted").length,
    "Under Review": claims.filter(c => c.status === "Under Review").length,
    Approved:       claims.filter(c => c.status === "Approved").length,
    Paid:           claims.filter(c => c.status === "Paid").length,
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 4px", color: "#fff", fontSize: "24px", fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>Claims</h1>
        <p style={{ margin: 0, color: "#6B7280", fontSize: "14px" }}>Review and process insurance claims</p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#f87171", fontSize: "13px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { label: "Pending Review", value: counts["Submitted"],      color: "#60a5fa" },
          { label: "Under Review",   value: counts["Under Review"],   color: "#fbbf24" },
          { label: "Approved",       value: counts["Approved"],       color: "#4ade80" },
          { label: "Paid",           value: counts["Paid"],           color: "#34d399" },
        ].map(s => (
          <div key={s.label} style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "12px", padding: "14px 18px", flex: 1, minWidth: "120px" }}>
            <p style={{ margin: "0 0 4px", color: "#6B7280", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
            <p style={{ margin: 0, color: s.color, fontSize: "24px", fontWeight: 800 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }} style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              border: "1px solid", cursor: "pointer",
              borderColor: filter === s ? "#27833D" : "#1e1e2e",
              background: filter === s ? "rgba(39,131,61,0.15)" : "transparent",
              color: filter === s ? "#60a5fa" : "#6B7280",
            }}>{s}</button>
          ))}
        </div>
        <input
          placeholder="Search user, claim ID, hospital..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: "200px", background: "#111118", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "8px 14px", color: "#fff", fontSize: "13px", outline: "none" }}
        />
        <button onClick={fetchClaims} style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(39,131,61,0.1)", border: "1px solid rgba(39,131,61,0.2)", color: "#60a5fa", cursor: "pointer", fontSize: "13px" }}>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
              {["Claim ID", "User", "Type", "Hospital", "Amount", "Date", "Status", ""].map(h => (
                <th key={h} style={{ padding: "12px 16px", color: "#6B7280", fontSize: "11px", fontWeight: 700, textAlign: "left", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} />) :
              claims.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#374151" }}>
                  <span className="material-symbols-rounded" style={{ fontSize: "40px", display: "block", marginBottom: "8px" }}>search_off</span>
                  No claims found
                </td></tr>
              ) : claims.map((claim, i) => (
                <tr key={claim._id || i}
                  style={{ borderBottom: i < claims.length - 1 ? "1px solid #1e1e2e" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#16161f"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", color: "#60a5fa", fontSize: "12px", fontFamily: "monospace", whiteSpace: "nowrap" }}>{claim.id}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ margin: 0, color: "#fff", fontSize: "13px", fontWeight: 600 }}>{claim.user}</p>
                    <p style={{ margin: 0, color: "#6B7280", fontSize: "11px" }}>{claim.phone}</p>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#9CA3AF", fontSize: "13px", whiteSpace: "nowrap" }}>{claim.type}</td>
                  <td style={{ padding: "14px 16px", color: "#9CA3AF", fontSize: "13px" }}>{claim.hospital}</td>
                  <td style={{ padding: "14px 16px", color: "#fff", fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap" }}>₦{claim.amount?.toLocaleString()}</td>
                  <td style={{ padding: "14px 16px", color: "#6B7280", fontSize: "12px", whiteSpace: "nowrap" }}>{claim.date}</td>
                  <td style={{ padding: "14px 16px" }}><StatusBadge status={claim.status} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <button onClick={() => { setSelected(claim); setReviewNote(claim.reviewNote || ""); setAmountApproved(""); }} style={{ background: "rgba(39,131,61,0.1)", border: "1px solid rgba(39,131,61,0.2)", borderRadius: "8px", padding: "6px 12px", color: "#60a5fa", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      Review
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 14px", borderRadius: "8px", background: "transparent", border: "1px solid #1e1e2e", color: page === 1 ? "#374151" : "#9CA3AF", cursor: page === 1 ? "not-allowed" : "pointer" }}>← Prev</button>
          <span style={{ padding: "6px 14px", color: "#6B7280", fontSize: "13px" }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 14px", borderRadius: "8px", background: "transparent", border: "1px solid #1e1e2e", color: page === totalPages ? "#374151" : "#9CA3AF", cursor: page === totalPages ? "not-allowed" : "pointer" }}>Next →</button>
        </div>
      )}

      {/* Review modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: "0 0 8px", color: "#fff", fontSize: "18px", fontWeight: 800 }}>{selected.id}</h2>
                <StatusBadge status={selected.status} />
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {[
              ["User",        selected.user],
              ["Phone",       selected.phone],
              ["Type",        selected.type],
              ["Hospital",    selected.hospital],
              ["Date",        selected.date],
              ["Claimed",     `₦${selected.amount?.toLocaleString()}`],
              ["Description", selected.description],
              ["Submitted",   selected.submitted],
            ].map(([k, v]) => v && (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e1e2e" }}>
                <span style={{ color: "#6B7280", fontSize: "13px", flexShrink: 0 }}>{k}</span>
                <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600, textAlign: "right", marginLeft: "12px" }}>{v}</span>
              </div>
            ))}

            {/* Amount approved input */}
            {(selected.status === "Submitted" || selected.status === "Under Review") && (
              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", color: "#9CA3AF", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>AMOUNT TO APPROVE (₦) — leave blank to use claimed amount</label>
                <input
                  type="number"
                  value={amountApproved}
                  onChange={e => setAmountApproved(e.target.value)}
                  placeholder={`Max: ₦${selected.amount?.toLocaleString()}`}
                  style={{ width: "100%", boxSizing: "border-box", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "13px", outline: "none" }}
                />
              </div>
            )}

            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", color: "#9CA3AF", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>REVIEW NOTE</label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="Add a note — sent to user via SMS and in-app notification"
                rows={3}
                style={{ width: "100%", boxSizing: "border-box", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "13px", outline: "none", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
              {selected.status !== "Approved" && selected.status !== "Paid" && (
                <button onClick={() => handleUpdateStatus("Approved")} disabled={updating} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: updating ? "#14401f" : "#16A34A", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: updating ? "not-allowed" : "pointer" }}>
                  {updating ? "..." : "✓ Approve"}
                </button>
              )}
              {selected.status === "Approved" && (
                <button onClick={() => handleUpdateStatus("Paid")} disabled={updating} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: "#27833D", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                  Mark as Paid
                </button>
              )}
              {selected.status !== "Under Review" && selected.status !== "Approved" && selected.status !== "Paid" && (
                <button onClick={() => handleUpdateStatus("Under Review")} disabled={updating} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid #fbbf24", background: "transparent", color: "#fbbf24", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                  Under Review
                </button>
              )}
              {selected.status !== "Rejected" && selected.status !== "Paid" && (
                <button onClick={() => handleUpdateStatus("Rejected")} disabled={updating} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid #ef4444", background: "transparent", color: "#ef4444", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                  ✕ Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

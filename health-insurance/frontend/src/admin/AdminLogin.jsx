// src/admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

export default function AdminLogin() {
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(username, password);
      navigate("/x/admin", { replace: true });
    } catch (e) {
      setError(e.message || "Invalid credentials.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A1F12",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      padding: "24px",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "400px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: "rgba(39,131,61,0.1)",
            border: "1px solid rgba(39,131,61,0.3)",
            borderRadius: "12px",
            padding: "10px 20px",
            marginBottom: "20px",
          }}>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#27833D", fontFamily: "'Inter', sans-serif" }}>PAYG</span>
            <span style={{
              fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em",
              color: "#6B7280", background: "rgba(107,114,128,0.1)",
              padding: "2px 8px", borderRadius: "4px",
            }}>ADMIN</span>
          </div>
          <p style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>
            Restricted access — authorised personnel only
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#111118",
          border: "1px solid #1e1e2e",
          borderRadius: "20px",
          padding: "36px",
        }}>
          <h1 style={{
            color: "#fff", fontSize: "22px", fontWeight: 700,
            margin: "0 0 28px", fontFamily: "'Inter', sans-serif",
          }}>Sign in</h1>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "#9CA3AF", fontSize: "12px", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.05em" }}>
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="off"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#0a0a0f",
                  border: `1px solid ${error ? "#ef4444" : "#1e1e2e"}`,
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#27833D"}
                onBlur={e => e.target.style.borderColor = error ? "#ef4444" : "#1e1e2e"}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#9CA3AF", fontSize: "12px", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.05em" }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "#0a0a0f",
                    border: `1px solid ${error ? "#ef4444" : "#1e1e2e"}`,
                    borderRadius: "10px",
                    padding: "12px 44px 12px 16px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={e => e.target.style.borderColor = "#27833D"}
                  onBlur={e => e.target.style.borderColor = error ? "#ef4444" : "#1e1e2e"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#6B7280", fontSize: "18px", padding: "4px",
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: "18px" }}>
                    {showPass ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "8px", padding: "10px 14px",
                color: "#f87171", fontSize: "13px", marginBottom: "16px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: "16px" }}>error</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              style={{
                width: "100%",
                background: loading ? "#1e3a8a" : "#27833D",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "13px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "background 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-rounded spin" style={{ fontSize: "18px" }}>progress_activity</span>
                  Signing in...
                </>
              ) : "Sign in to Admin"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "#374151", fontSize: "12px", marginTop: "24px" }}>
          This page is not publicly listed
        </p>
      </div>
    </div>
  );
}

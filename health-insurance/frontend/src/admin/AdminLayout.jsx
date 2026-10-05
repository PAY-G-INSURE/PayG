// src/admin/AdminLayout.jsx
import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAdmin } from "./AdminContext";

const NAV = [
  { to: "/x/admin",           label: "Overview",      icon: "dashboard",        end: true },
  { to: "/x/admin/users",     label: "Users",         icon: "group"             },
  { to: "/x/admin/claims",    label: "Claims",        icon: "medical_services", badge: true },
  { to: "/x/admin/payments",  label: "Transactions",  icon: "payments"          },
  { to: "/x/admin/subs",      label: "Subscriptions", icon: "verified_user"     },
  { to: "/x/admin/broadcast", label: "Broadcast SMS", icon: "campaign"          },
];

export default function AdminLayout() {
  const { adminLogout, admin } = useAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    adminLogout();
    navigate("/x/admin/login", { replace: true });
  }

  const sidebarContent = (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "#111118",
      borderRight: "1px solid #1e1e2e",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid #1e1e2e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px", fontWeight: 800, color: "#27833D", fontFamily: "'Inter', sans-serif" }}>PAYG</span>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            color: "#6B7280", background: "rgba(107,114,128,0.15)",
            padding: "2px 8px", borderRadius: "4px",
          }}>ADMIN</span>
        </div>
        <p style={{ margin: "4px 0 0", color: "#374151", fontSize: "11px" }}>Management Console</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 12px", borderRadius: "10px",
              marginBottom: "4px",
              color: isActive ? "#fff" : "#6B7280",
              background: isActive ? "rgba(39,131,61,0.15)" : "transparent",
              borderLeft: isActive ? "3px solid #27833D" : "3px solid transparent",
              textDecoration: "none",
              fontSize: "14px", fontWeight: isActive ? 600 : 400,
              transition: "all 0.15s",
            })}
          >
            <span className="material-symbols-rounded" style={{ fontSize: "20px" }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid #1e1e2e" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 12px", borderRadius: "10px",
          background: "rgba(39,131,61,0.05)",
          marginBottom: "8px",
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "#27833D", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: "16px", color: "#fff" }}>admin_panel_settings</span>
          </div>
          <div>
            <p style={{ margin: 0, color: "#fff", fontSize: "13px", fontWeight: 600 }}>{admin?.username || "Administrator"}</p>
            <p style={{ margin: 0, color: "#374151", fontSize: "11px" }}>Super Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px", borderRadius: "10px",
            background: "none", border: "none", cursor: "pointer",
            color: "#6B7280", fontSize: "13px",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
          onMouseLeave={e => e.currentTarget.style.color = "#6B7280"}
        >
          <span className="material-symbols-rounded" style={{ fontSize: "18px" }}>logout</span>
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Desktop sidebar */}
      <div style={{
        width: "220px", flexShrink: 0,
        display: "none",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40,
      }} className="admin-sidebar-desktop">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.7)",
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div style={{
        position: "fixed", top: 0, left: sidebarOpen ? 0 : "-220px",
        width: "220px", bottom: 0, zIndex: 51,
        transition: "left 0.25s",
      }}>
        {sidebarContent}
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: "0",
        display: "flex", flexDirection: "column",
        minHeight: "100vh",
      }} className="admin-main">

        {/* Top bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "rgba(10,10,15,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1e1e2e",
          padding: "0 24px",
          height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="admin-menu-btn"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#6B7280", padding: "6px",
              display: "none",
            }}
          >
            <span className="material-symbols-rounded">menu</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#16A34A", display: "inline-block",
              boxShadow: "0 0 6px #16A34A",
            }} />
            <span style={{ color: "#6B7280", fontSize: "13px" }}>Live</span>
          </div>
          <div style={{ color: "#374151", fontSize: "12px" }}>
            {new Date().toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "28px 24px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar-desktop { display: block !important; }
          .admin-main { margin-left: 220px !important; }
          .admin-menu-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .admin-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

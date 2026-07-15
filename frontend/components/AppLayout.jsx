"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "@/components/ProfileModal";

const primaryItems = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/patients/register", label: "Patient Registration", icon: "+" },
  { to: "/patients", label: "Patient List", icon: "☷" },
];

function active(pathname, href, exact = false) {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const displayName = useMemo(() => {
    const name = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || user?.username || "User";
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("scroll-locked", mobileOpen);

    return () => {
      document.documentElement.classList.remove("scroll-locked");
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const navLink = (href, label, icon, exact = false, sub = false) => (
    <Link
      href={href}
      className={`sidebar-link ${sub ? "sub-nav-link" : ""} ${
        active(pathname, href, exact) ? "active" : ""
      }`}
    >
      <span className="nav-icon">{icon}</span>
      {label}
    </Link>
  );

  return (
    <div className="app-shell">
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">H</div>
          <div>
            <strong>Vision HMS</strong>
            <span>Hospital Management</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-label">Clinical</span>

          {primaryItems.map((item) => (
            <span key={item.to}>
              {navLink(
                item.to,
                item.label,
                item.icon,
                item.to === "/patients",
              )}
            </span>
          ))}

          {isAdmin && (
            <>
              {navLink("/patients/update", "Patient Info Update", "✎")}
              <span className="nav-label">Administration</span>
              {navLink("/setup", "Setup", "⚙", true)}
              {navLink("/setup/charges", "Charge Setup", "", false, true)}
              {navLink("/users", "User Management", "♙")}
            </>
          )}

          <span className="nav-label">Account</span>
          <button
            type="button"
            className="sidebar-link sidebar-button-link"
            onClick={() => setProfileOpen(true)}
          >
            <span className="nav-icon">●</span>
            My profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="user-chip profile-trigger"
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
          >
            <span className="avatar">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <strong>{displayName}</strong>
              <small>{isAdmin ? "Administrator" : "User"}</small>
            </span>
          </button>

          <button
            type="button"
            className="button ghost full"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button
            type="button"
            className="hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="topbar-label">Secure clinical workspace</span>
          <div className="status-dot">
            <span /> API connected
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}

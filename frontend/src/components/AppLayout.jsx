import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { setPageScrollLocked } from '../utils/dom'

const primaryItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/patients/register', label: 'Patient Registration', icon: '+' },
  { to: '/patients', label: 'Patient List', icon: '☷' },
]

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => setMobileOpen(false), [location.pathname])
  useEffect(() => {
    setPageScrollLocked(mobileOpen)
    return () => setPageScrollLocked(false)
  }, [mobileOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const navClass = ({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`

  return (
    <div className="app-shell">
      {mobileOpen && <button className="sidebar-overlay" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">H</div>
          <div><strong>Vision HMS</strong><span>Hospital Management</span></div>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-label">Clinical</span>
          {primaryItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass} end={item.to === '/patients'}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <NavLink to="/patients/update" className={navClass}><span className="nav-icon">✎</span>Patient Info Update</NavLink>
              <span className="nav-label">Administration</span>
              <NavLink to="/setup" className={navClass}><span className="nav-icon">⚙</span>Setup</NavLink>
              <NavLink to="/users" className={navClass}><span className="nav-icon">♙</span>User Management</NavLink>
            </>
          )}
          <span className="nav-label">Account</span>
          <NavLink to="/change-password" className={navClass}><span className="nav-icon">●</span>Change Password</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{user?.username?.slice(0, 1).toUpperCase()}</span>
            <span><strong>{user?.username}</strong><small>{isAdmin ? 'Administrator' : 'User'}</small></span>
          </div>
          <button type="button" className="button ghost full" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button type="button" className="hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</button>
          <div>
            <span className="topbar-label">Secure clinical workspace</span>
          </div>
          <div className="status-dot"><span /> API connected</div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}

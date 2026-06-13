import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS } from '../../utils/constants'
import './Navbar.css'

export default function Navbar() {
  const [time, setTime]       = useState(new Date())
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const pad = n => String(n).padStart(2, '0')
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <motion.nav
      className={`traffic-navbar${scrolled ? ' scrolled' : ''}`}
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* ── Brand ── */}
      <NavLink to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
        <div className="nav-logo">
          <i className="bi bi-traffic-light-fill" />
          <span className="logo-ring" />
        </div>
        <div className="nav-title">
          <span className="brand-main">SmartRoad Command</span>
          <span className="brand-sub">AI Traffic MANAGEMENT SYSTEM</span>
        </div>
      </NavLink>

      {/* ── Links ── */}
      <div className={`nav-links${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(l => (
          <NavLink
            key={l.path}
            to={l.path}
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <i className={`bi ${l.icon} nav-link-icon`} />
            <span>{l.label}</span>
            <span className="link-underline" />
          </NavLink>
        ))}
      </div>

      {/* ── Right info ── */}
      <div className="nav-right">
        <div className="nav-clock">
          <div className="clock-time">{timeStr}</div>
          <div className="clock-date">{dateStr}</div>
        </div>

        <div className="nav-divider" />

        <div className="nav-pills">
          
          <span className="pill pill-status">
            <span className="pulse-dot" />
            ONLINE
          </span>
        </div>
      </div>

      {/* ── Hamburger ── */}
      <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="menu">
        <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} />
      </button>
    </motion.nav>
  )
}

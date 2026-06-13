import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import './CommandHeader.css'

export default function CommandHeader({ connected }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const pad = n => String(n).padStart(2, '0')
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <motion.header
      className="cmd-header"
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Brand */}
      <div className="ch-brand">
        <div className="ch-logo">
          <i className="bi bi-shield-fill-check" />
          <div className="ch-logo-ring" />
        </div>
        <div className="ch-titles">
          <div className="ch-main">SmartRoad Command</div>
          <div className="ch-sub">AI Traffic MANAGEMENT SYSTEM</div>
        </div>
      </div>

      {/* Center: clock + nav */}
      <div className="ch-center">
        <div className="ch-clock">
          <div className="ch-time">{timeStr}</div>
          <div className="ch-date">{dateStr}</div>
        </div>
        <nav className="ch-nav">
          <NavLink to="/"        end className={({isActive})=>`ch-link${isActive?' active':''}`}><i className="bi bi-speedometer2"/>Dashboard</NavLink>
          <NavLink to="/about"       className={({isActive})=>`ch-link${isActive?' active':''}`}><i className="bi bi-info-circle"/>About</NavLink>
          <NavLink to="/contact"     className={({isActive})=>`ch-link${isActive?' active':''}`}><i className="bi bi-envelope"/>Contact</NavLink>
        </nav>
      </div>

      {/* Right: status indicators */}
      <div className="ch-right">
        <div className="ch-status-pill city">
          <div className="ch-status-icon"><i className="bi bi-building-fill" /></div>
          <div className="ch-status-body">
            <div className="ch-status-label">CITY STATUS</div>
            <div className="ch-status-val green">NORMAL</div>
          </div>
        </div>

        <div className="ch-status-pill health">
          <div className="ch-status-icon"><i className="bi bi-heart-pulse-fill" /></div>
          <div className="ch-status-body">
            <div className="ch-status-label">SYSTEM HEALTH</div>
            <div className="ch-status-val green">
              <span className="ch-pulse" />
              98% Excellent
            </div>
          </div>
        </div>

        <div className="ch-status-pill ai">
          <div className="ch-status-icon"><i className="bi bi-cpu-fill" /></div>
          <div className="ch-status-body">
            <div className="ch-status-label">AI ENGINE</div>
            <div className={`ch-status-val ${connected ? 'green' : 'yellow'}`}>
              <span className="ch-pulse" />
              {connected ? 'ACTIVE' : 'LINKING'}
            </div>
          </div>
        </div>

        <div className="ch-status-pill emergency">
          <div className="ch-status-icon"><i className="bi bi-exclamation-triangle-fill" /></div>
          <div className="ch-status-body">
            <div className="ch-status-label">EMERGENCY</div>
            <div className="ch-status-val green">STANDBY</div>
          </div>
        </div>

      </div>
    </motion.header>
  )
}

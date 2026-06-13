import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AccidentPanel.css'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const SEV_META = {
  LOW:      { color: '#00E676', bg: 'rgba(0,230,118,0.12)',  icon: 'bi-shield-check',           label: 'All Clear'  },
  MEDIUM:   { color: '#FFB020', bg: 'rgba(255,176,32,0.12)', icon: 'bi-exclamation-circle-fill', label: 'Moderate'   },
  HIGH:     { color: '#FF4D6D', bg: 'rgba(255,77,109,0.15)', icon: 'bi-exclamation-triangle-fill', label: 'High Risk' },
  CRITICAL: { color: '#FF2020', bg: 'rgba(255,32,32,0.20)',  icon: 'bi-radioactive',              label: 'CRITICAL'  },
}

function fmtCountdown(secs) {
  if (secs == null) return '--:--'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function RiskBar({ value, color }) {
  return (
    <div className="acp-risk-bar-bg">
      <motion.div
        className="acp-risk-bar-fill"
        style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  )
}

function StatRow({ label, value, color }) {
  return (
    <div className="acp-stat-row">
      <span className="acp-stat-label">{label}</span>
      <span className="acp-stat-value" style={{ color }}>{value}</span>
    </div>
  )
}

function UnitCard({ icon, title, name, distance, eta, phone, status }) {
  return (
    <div className="acp-unit-card">
      <div className="acp-unit-hdr">
        <i className={`bi ${icon}`} />
        <span className="acp-unit-title">{title}</span>
        {status && (
          <span className={`acp-unit-badge acp-unit-badge--${status.toLowerCase()}`}>
            {status}
          </span>
        )}
      </div>
      <div className="acp-unit-name">{name}</div>
      <div className="acp-unit-meta">
        <span><i className="bi bi-geo-alt-fill" /> {distance}</span>
        <span><i className="bi bi-clock-fill" /> {eta}</span>
        <span><i className="bi bi-telephone-fill" /> {phone}</span>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function AccidentPanel({ accident = {}, emergency = {} }) {
  const {
    detected       = false,
    severity       = 'LOW',
    confidence     = 0,
    casualty_risk  = 0,
    accident_type  = null,
    vehicles_involved = 0,
    location       = 'NH-65 Junction 7, Hyderabad',
    golden_hour_remaining = null,
  } = accident

  const meta     = SEV_META[severity] || SEV_META.LOW
  const isCrit   = severity === 'CRITICAL'
  const isHigh   = severity === 'HIGH' || isCrit
  const dispatch = emergency

  /* ── Smooth golden-hour countdown (interpolate between WS ticks) ── */
  const [countdown, setCountdown] = useState(golden_hour_remaining)
  const intervalRef = useRef(null)

  useEffect(() => {
    setCountdown(golden_hour_remaining)
  }, [golden_hour_remaining])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (countdown == null || countdown <= 0) return
    intervalRef.current = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [golden_hour_remaining])  // reset timer when WS syncs

  return (
    <div className={`acp-wrapper glass-card ${isCrit ? 'acp--critical' : ''}`}>

      {/* ── Header ── */}
      <div className="acp-hdr">
        <div className="section-title" style={{ marginBottom: 0 }}>
          <i className="bi bi-shield-exclamation" /> ACCIDENT COMMAND CENTER
        </div>
        <motion.span
          className="acp-sev-badge"
          style={{ background: meta.bg, color: meta.color, borderColor: meta.color }}
          animate={isCrit ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
          transition={isCrit ? { repeat: Infinity, duration: 0.8 } : {}}
        >
          <i className={`bi ${meta.icon}`} /> {meta.label}
        </motion.span>
      </div>

      {/* ── Main body ── */}
      <div className="acp-body">

        {/* Left: Accident metrics */}
        <div className="acp-left">

          {/* Detected / All clear status */}
          <div className="acp-status-banner" style={{ background: meta.bg, borderColor: meta.color }}>
            <AnimatePresence mode="wait">
              <motion.div key={detected ? 'det' : 'clr'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="acp-status-inner"
              >
                {detected ? (
                  <>
                    <motion.i className={`bi ${meta.icon} acp-status-icon`} style={{ color: meta.color }}
                      animate={{ scale: isCrit ? [1, 1.2, 1] : 1 }}
                      transition={{ repeat: isCrit ? Infinity : 0, duration: 0.7 }}
                    />
                    <div>
                      <div className="acp-status-title" style={{ color: meta.color }}>
                        {accident_type || 'Incident Detected'}
                      </div>
                      <div className="acp-status-sub">{location}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check acp-status-icon" style={{ color: '#00E676' }} />
                    <div>
                      <div className="acp-status-title" style={{ color: '#00E676' }}>
                        No Active Incidents
                      </div>
                      <div className="acp-status-sub">All corridors clear — AI monitoring active</div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Metrics */}
          <div className="acp-metrics">
            <div className="acp-metric-col">
              <div className="acp-metric-card">
                <div className="acp-metric-label">AI Confidence</div>
                <div className="acp-metric-value" style={{ color: meta.color }}>{confidence}%</div>
                <RiskBar value={confidence} color={meta.color} />
              </div>
              <div className="acp-metric-card">
                <div className="acp-metric-label">Casualty Risk</div>
                <div className="acp-metric-value" style={{
                  color: casualty_risk > 70 ? '#FF2020' : casualty_risk > 40 ? '#FFB020' : '#00E676'
                }}>{casualty_risk}%</div>
                <RiskBar value={casualty_risk}
                  color={casualty_risk > 70 ? '#FF2020' : casualty_risk > 40 ? '#FFB020' : '#00E676'}
                />
              </div>
            </div>
            <div className="acp-metric-col">
              <div className="acp-metric-card">
                <div className="acp-metric-label">Vehicles Involved</div>
                <div className="acp-metric-value" style={{ color: '#4FC3F7' }}>
                  {detected ? vehicles_involved : 0}
                </div>
              </div>
              <div className="acp-metric-card">
                <div className="acp-metric-label">Emergency Required</div>
                <div className="acp-metric-value" style={{ color: isHigh ? '#FF4D6D' : '#00E676' }}>
                  {isHigh ? 'YES' : 'NO'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="acp-stats">
            <StatRow label="Incident Type"    value={accident_type || '—'}          color={meta.color} />
            <StatRow label="Location"         value={location}                       color="#94a3b8" />
            <StatRow label="Est. Response"    value={detected ? (accident?.estimated_response_time || '—') : 'N/A'} color="#4FC3F7" />
            <StatRow label="AI Detection"     value={detected ? 'ACTIVE' : 'STANDBY'} color={detected ? '#FF4D6D' : '#00E676'} />
          </div>
        </div>

        {/* Right: Golden Hour + Emergency Dispatch */}
        <div className="acp-right">

          {/* Golden Hour Countdown */}
          <div className={`acp-golden ${isHigh ? 'acp-golden--active' : ''}`}>
            <div className="acp-golden-hdr">
              <i className="bi bi-hourglass-split" />
              <span>GOLDEN HOUR</span>
              {isHigh && (
                <motion.span className="acp-golden-dot"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                />
              )}
            </div>
            <motion.div
              className="acp-golden-time"
              style={{ color: isHigh ? '#FF4D6D' : '#64748b' }}
              animate={isHigh && countdown !== null && countdown < 600
                ? { color: ['#FF4D6D', '#FF2020', '#FF4D6D'] }
                : {}
              }
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {isHigh && countdown !== null ? fmtCountdown(countdown) : '60:00'}
            </motion.div>
            <div className="acp-golden-sub">
              {isHigh
                ? countdown > 0 ? 'Minutes remaining — mobilise now' : 'GOLDEN HOUR EXPIRED'
                : 'Activates on HIGH / CRITICAL incident'}
            </div>
            {isHigh && countdown !== null && (
              <div className="acp-golden-bar-bg">
                <motion.div className="acp-golden-bar-fill"
                  style={{ background: countdown < 600 ? '#FF2020' : '#FF4D6D' }}
                  animate={{ width: `${Math.max(0, (countdown / 3600) * 100)}%` }}
                  transition={{ duration: 0.9 }}
                />
              </div>
            )}
          </div>

          {/* Emergency Units */}
          <div className="acp-dispatch">
            <div className="acp-dispatch-title">
              <i className="bi bi-broadcast" /> EMERGENCY DISPATCH
              {(dispatch.active) && (
                <motion.span className="acp-dispatched-tag"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >● DISPATCHED</motion.span>
              )}
            </div>

            <UnitCard
              icon="bi-hospital-fill"
              title="Nearest Hospital"
              name={dispatch.hospital?.name || '—'}
              distance={dispatch.hospital?.distance || '—'}
              eta={dispatch.hospital?.eta || '—'}
              phone={dispatch.hospital?.phone || '—'}
              status={dispatch.active ? 'ALERT' : 'STANDBY'}
            />

            <UnitCard
              icon="bi-shield-fill"
              title="Nearest Police"
              name={dispatch.police?.name || '—'}
              distance={dispatch.police?.distance || '—'}
              eta={dispatch.police?.eta || '—'}
              phone={dispatch.police?.phone || '—'}
              status={dispatch.active ? 'ALERT' : 'STANDBY'}
            />

            <UnitCard
              icon="bi-truck"
              title="Ambulance"
              name={dispatch.ambulance?.name || '—'}
              distance={dispatch.ambulance?.distance || '—'}
              eta={dispatch.ambulance?.eta || '—'}
              phone={dispatch.ambulance?.phone || '—'}
              status={dispatch.ambulance?.status || 'STANDBY'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

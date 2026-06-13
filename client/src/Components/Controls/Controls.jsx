import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { changeSignal } from '../../utils/api'
import './Controls.css'

/* ─── Realistic traffic-light SVG ─────────────────────────────────────── */
function TrafficLightSVG({ signal }) {
  const isRed    = signal === 'RED'    || signal === 'AUTO'
  const isYellow = signal === 'YELLOW'
  const isGreen  = signal === 'GREEN'

  const redColor    = isRed    ? '#FF2020' : '#2a0808'
  const yellowColor = isYellow ? '#FF9A00' : '#2a1c08'
  const greenColor  = isGreen  ? '#00CC44' : '#08250f'

  const redGlow    = isRed    ? '0 0 22px 8px rgba(255,32,32,0.75)'    : 'none'
  const yellowGlow = isYellow ? '0 0 22px 8px rgba(255,154,0,0.75)'    : 'none'
  const greenGlow  = isGreen  ? '0 0 22px 8px rgba(0,204,68,0.75)'     : 'none'

  return (
    <svg viewBox="0 0 90 190" className="tl-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Housing gradient – gives 3-D depth */}
        <linearGradient id="housingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#1a1a1a" />
          <stop offset="30%"  stopColor="#2d2d2d" />
          <stop offset="70%"  stopColor="#222222" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
        {/* Inner cell gradient */}
        <linearGradient id="cellGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#111111" />
          <stop offset="50%"  stopColor="#1c1c1c" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        {/* Visor gradient */}
        <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#333333" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
        {/* Radial glow for active lights */}
        <radialGradient id="redGrad">
          <stop offset="0%"   stopColor="#FF6060" />
          <stop offset="50%"  stopColor="#FF2020" />
          <stop offset="100%" stopColor="#990000" />
        </radialGradient>
        <radialGradient id="yellowGrad">
          <stop offset="0%"   stopColor="#FFD060" />
          <stop offset="50%"  stopColor="#FF9A00" />
          <stop offset="100%" stopColor="#995500" />
        </radialGradient>
        <radialGradient id="greenGrad">
          <stop offset="0%"   stopColor="#60FF90" />
          <stop offset="50%"  stopColor="#00CC44" />
          <stop offset="100%" stopColor="#005520" />
        </radialGradient>
      </defs>

      {/* ── Pole ── */}
      <rect x="38" y="160" width="14" height="30" rx="3"
        fill="url(#housingGrad)" />

      {/* ── Main housing body ── */}
      <rect x="10" y="8" width="70" height="152" rx="10"
        fill="url(#housingGrad)" />
      {/* inner highlight line (left edge) */}
      <rect x="11" y="9" width="2" height="149" rx="1"
        fill="rgba(255,255,255,0.08)" />

      {/* ── Top dome ── */}
      <ellipse cx="45" cy="10" rx="29" ry="10"
        fill="#1a1a1a" stroke="#111" strokeWidth="1" />
      <ellipse cx="45" cy="10" rx="18" ry="6"
        fill="#222" />

      {/* ══════════════ RED CELL ══════════════ */}
      {/* Visor shade above red */}
      <path d="M 14 20 Q 14 16 18 16 L 72 16 Q 76 16 76 20 L 76 23 Q 55 30 45 30 Q 35 30 14 23 Z"
        fill="url(#visorGrad)" />
      {/* Cell — height=52 closes the 4px gap to yellow visor */}
      <rect x="13" y="20" width="64" height="52" rx="4"
        fill="url(#cellGrad)" />
      {/* Outer glow halo when active */}
      {isRed && (
        <circle cx="45" cy="44" r="24"
          fill="rgba(255,32,32,0.22)" />
      )}
      {/* Light bulb */}
      <circle cx="45" cy="44" r="20"
        fill={isRed ? 'url(#redGrad)' : redColor}
        style={{ filter: isRed ? 'drop-shadow(0 0 14px rgba(255,32,32,1)) drop-shadow(0 0 28px rgba(255,0,0,0.7))' : 'none' }}
      />
      {isRed && (
        <ellipse cx="38" cy="37" rx="6" ry="4"
          fill="rgba(255,255,255,0.30)" transform="rotate(-30 38 37)" />
      )}

      {/* ══════════════ YELLOW CELL ══════════════ */}
      {/* Visor */}
      <path d="M 14 72 Q 14 68 18 68 L 72 68 Q 76 68 76 72 L 76 75 Q 55 82 45 82 Q 35 82 14 75 Z"
        fill="url(#visorGrad)" />
      {/* Cell — height=52 closes the 4px gap to green visor */}
      <rect x="13" y="72" width="64" height="52" rx="4"
        fill="url(#cellGrad)" />
      {isYellow && (
        <circle cx="45" cy="96" r="24"
          fill="rgba(255,154,0,0.22)" />
      )}
      <circle cx="45" cy="96" r="20"
        fill={isYellow ? 'url(#yellowGrad)' : yellowColor}
        style={{ filter: isYellow ? 'drop-shadow(0 0 14px rgba(255,154,0,1)) drop-shadow(0 0 28px rgba(255,120,0,0.7))' : 'none' }}
      />
      {isYellow && (
        <ellipse cx="38" cy="89" rx="6" ry="4"
          fill="rgba(255,255,255,0.30)" transform="rotate(-30 38 89)" />
      )}

      {/* ══════════════ GREEN CELL ══════════════ */}
      {/* Visor */}
      <path d="M 14 124 Q 14 120 18 120 L 72 120 Q 76 120 76 124 L 76 127 Q 55 134 45 134 Q 35 134 14 127 Z"
        fill="url(#visorGrad)" />
      {/* Cell */}
      <rect x="13" y="124" width="64" height="48" rx="4"
        fill="url(#cellGrad)" />
      {isGreen && (
        <circle cx="45" cy="148" r="24"
          fill="rgba(0,204,68,0.22)" />
      )}
      <circle cx="45" cy="148" r="20"
        fill={isGreen ? 'url(#greenGrad)' : greenColor}
        style={{ filter: isGreen ? 'drop-shadow(0 0 14px rgba(0,204,68,1)) drop-shadow(0 0 28px rgba(0,180,60,0.7))' : 'none' }}
      />
      {isGreen && (
        <ellipse cx="38" cy="141" rx="6" ry="4"
          fill="rgba(255,255,255,0.30)" transform="rotate(-30 38 141)" />
      )}

      {/* ── Housing bottom edge ── */}
      <rect x="10" y="155" width="70" height="8" rx="4"
        fill="#111" />

      {/* ── Side arms (visors stick out) ── */}
      {/* Left arm red */}
      <path d="M 10 28 L 0 32 L 0 26 Z" fill="#1a1a1a" />
      <path d="M 10 80 L 0 84 L 0 78 Z" fill="#1a1a1a" />
      <path d="M 10 132 L 0 136 L 0 130 Z" fill="#1a1a1a" />
      {/* Right arm */}
      <path d="M 80 28 L 90 32 L 90 26 Z" fill="#1a1a1a" />
      <path d="M 80 80 L 90 84 L 90 78 Z" fill="#1a1a1a" />
      <path d="M 80 132 L 90 136 L 90 130 Z" fill="#1a1a1a" />
    </svg>
  )
}

/* ─── Controls component ────────────────────────────────────────────────── */
const SIGNALS = [
  { val: 'RED',    label: 'Red',    color: '#FF4D6D' },
  { val: 'YELLOW', label: 'Yellow', color: '#FFB020' },
  { val: 'GREEN',  label: 'Green',  color: '#00E676' },
  { val: 'AUTO',   label: 'Auto AI',color: '#00E5FF' },
]

export default function Controls({ signal: externalSignal }) {
  const [activeSignal, setActiveSignal] = useState('AUTO')
  const [loading, setLoading]           = useState(false)

  /* Keep visual in sync if parent provides signal */
  const displaySignal = externalSignal || activeSignal

  const handleSignal = async (val) => {
    setLoading(true)
    try {
      await changeSignal(val)
      setActiveSignal(val)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const active = SIGNALS.find(s => s.val === activeSignal) || SIGNALS[3]

  return (
    <div className="ctrl-wrapper glass-card">
      <div className="section-title" style={{ marginBottom: '12px' }}>
        <i className="bi bi-traffic-light-fill" /> SIGNAL CONTROL
      </div>

      <div className="ctrl-body">
        {/* ── Realistic traffic light ── */}
        <div className="ctrl-tl-wrap">
          <motion.div
            className="ctrl-tl-inner"
            key={displaySignal}
            animate={{
              filter: displaySignal === 'RED'
                ? 'drop-shadow(0 0 16px rgba(255,32,32,0.55))'
                : displaySignal === 'YELLOW'
                ? 'drop-shadow(0 0 16px rgba(255,154,0,0.55))'
                : displaySignal === 'GREEN'
                ? 'drop-shadow(0 0 16px rgba(0,204,68,0.55))'
                : 'drop-shadow(0 0 12px rgba(255,32,32,0.4))',
            }}
            transition={{ duration: 0.4 }}
          >
            <TrafficLightSVG signal={displaySignal} />
          </motion.div>

          {/* Signal label below the light */}
          <AnimatePresence mode="wait">
            <motion.div
              key={displaySignal}
              className="ctrl-sig-label"
              style={{ color: active.color }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              {displaySignal === 'AUTO' ? '🤖 AUTO AI' : `● ${displaySignal}`}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Buttons + info ── */}
        <div className="ctrl-right">
          <div className="ctrl-btns">
            {SIGNALS.map(s => (
              <motion.button
                key={s.val}
                className={`ctrl-btn ${activeSignal === s.val ? 'active' : ''}`}
                style={{
                  '--btn-color': s.color,
                  borderColor: activeSignal === s.val ? s.color : 'rgba(255,255,255,0.08)',
                  color:       activeSignal === s.val ? s.color : 'var(--text-muted)',
                  background:  activeSignal === s.val ? `${s.color}18` : 'rgba(255,255,255,0.02)',
                  boxShadow:   activeSignal === s.val ? `0 0 14px ${s.color}44` : 'none',
                }}
                onClick={() => handleSignal(s.val)}
                disabled={loading}
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.04, y: -1 }}
              >
                {activeSignal === s.val && (
                  <motion.div className="ctrl-ripple" style={{ background: s.color }}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 0.55 }}
                  />
                )}
                <span
                  className="ctrl-btn-dot"
                  style={{
                    background: s.val === 'AUTO' ? 'transparent' : s.color,
                    border:     s.val === 'AUTO' ? `2px solid ${s.color}` : 'none',
                    boxShadow:  activeSignal === s.val ? `0 0 8px ${s.color}` : 'none',
                  }}
                >
                  {s.val === 'AUTO' && <i className="bi bi-cpu-fill" style={{ fontSize:'0.55rem', color:s.color }} />}
                </span>
                <span className="ctrl-btn-lbl">{s.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="ctrl-info">
            <div className="ctrl-info-row">
              <span>Mode</span>
              <span style={{ color: active.color, fontWeight: 700 }}>
                {activeSignal === 'AUTO' ? 'Automatic (AI)' : 'Manual Override'}
              </span>
            </div>
            <div className="ctrl-info-row">
              <span>Active Signal</span>
              <span style={{ color: active.color, fontWeight: 700 }}>{displaySignal}</span>
            </div>
            <div className="ctrl-info-row">
              <span>Cycle Time</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>140 s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

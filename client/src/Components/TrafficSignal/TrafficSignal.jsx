import { motion } from 'framer-motion'
import './TrafficSignal.css'

export default function TrafficSignal({ signal }) {
  const sig = (signal || '').toUpperCase()
  const isGreen  = sig.includes('GREEN')
  const isYellow = sig === 'YELLOW'
  const isRed    = sig === 'RED' || sig === 'UNKNOWN' || sig === ''

  return (
    <div className="signal-wrapper glass-card">
      <div className="section-title"><i className="bi bi-traffic-light-fill" /> SIGNAL STATUS</div>

      <div className="signal-display">
        <div className="signal-housing">
          {/* Red */}
          <div className={`signal-light red ${isRed ? 'active' : ''}`}>
            {isRed && <motion.div
              className="signal-ring"
              animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />}
          </div>
          {/* Yellow */}
          <div className={`signal-light yellow ${isYellow ? 'active' : ''}`}>
            {isYellow && <motion.div
              className="signal-ring"
              animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />}
          </div>
          {/* Green */}
          <div className={`signal-light green ${isGreen ? 'active' : ''}`}>
            {isGreen && <motion.div
              className="signal-ring"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />}
          </div>
        </div>

        <div className="signal-info">
          <div
            className="signal-status-text"
            style={{ color: isGreen ? 'var(--success)' : isYellow ? 'var(--warning)' : 'var(--danger)' }}
          >
            {sig || 'UNKNOWN'}
          </div>
          <div className="signal-hint">
            {isGreen && 'Traffic flowing — vehicles may proceed'}
            {isYellow && 'Caution — prepare to stop'}
            {isRed && 'Stop — junction is controlled'}
          </div>
        </div>
      </div>
    </div>
  )
}

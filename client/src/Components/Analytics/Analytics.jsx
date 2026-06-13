import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getAnalytics } from '../../utils/api'
import './Analytics.css'

const METRICS = [
  { key: 'vehicle_detection',   label: 'Vehicle Detection',      icon: 'bi-car-front-fill' },
  { key: 'lane_analysis',       label: 'Lane Analysis',          icon: 'bi-distribute-horizontal' },
  { key: 'traffic_flow',        label: 'Traffic Flow',           icon: 'bi-arrow-left-right' },
  { key: 'signal_efficiency',   label: 'Signal Efficiency',      icon: 'bi-traffic-light' },
  { key: 'pedestrian_detection',label: 'Pedestrian Detection',   icon: 'bi-person-walking' },
  { key: 'emergency_detection', label: 'Emergency Detection',    icon: 'bi-hospital-fill' },
  { key: 'violation_detection', label: 'Violation Detection',    icon: 'bi-exclamation-triangle-fill' },
]

function getBarColor(val) {
  if (val >= 80) return 'var(--success)'
  if (val >= 60) return 'var(--secondary)'
  if (val >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

export default function Analytics() {
  const [data, setData] = useState({})

  useEffect(() => {
    const fetch = () => getAnalytics().then(r => setData(r.data)).catch(() => {})
    fetch()
    const t = setInterval(fetch, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="analytics-wrapper glass-card">
      <div className="section-title"><i className="bi bi-activity" /> AI ANALYTICS</div>

      <div className="analytics-grid">
        {METRICS.map((m, i) => {
          const val = data[m.key] || 0
          return (
            <motion.div
              key={m.key}
              className="metric-row"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="metric-header">
                <span className="metric-icon"><i className={`bi ${m.icon}`} /></span>
                <span className="metric-label">{m.label}</span>
                <span className="metric-value" style={{ color: getBarColor(val) }}>
                  {val}%
                </span>
              </div>
              <div className="metric-bar-bg">
                <motion.div
                  className="metric-bar-fill"
                  style={{ background: getBarColor(val) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 1, delay: i * 0.06 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import AnimatedNumber from '../../hooks/useAnimatedNumber'
import { DENSITY_COLORS, SIGNAL_COLORS } from '../../utils/constants'
import './StatCards.css'

const buildCards = (d) => [
  {
    icon: 'bi-car-front-fill',
    label: 'Vehicles Counted',
    end: d.vehicle_count || 0,
    suffix: '',
    color: 'var(--primary)',
    trend: '+12%', up: true,
  },
  {
    icon: 'bi-bar-chart-fill',
    label: 'Traffic Density',
    text: d.density || 'LOW',
    color: DENSITY_COLORS[d.density] || 'var(--success)',
  },
  {
    icon: 'bi-traffic-light-fill',
    label: 'Signal Status',
    text: (d.signal || 'RED').split(' ')[0],
    color: SIGNAL_COLORS[d.signal] || 'var(--danger)',
  },
  {
    icon: 'bi-camera-video-fill',
    label: 'Active Cameras',
    end: d.active_cameras || 0,
    suffix: '',
    color: 'var(--secondary)',
    trend: 'LIVE', up: true,
  },
  {
    icon: 'bi-speedometer',
    label: 'Avg Speed',
    end: Math.round(d.speed || 0),
    suffix: ' km/h',
    color: 'var(--warning)',
    trend: 'NORMAL', up: true,
  },
  {
    icon: 'bi-layers-fill',
    label: 'Congestion',
    end: Math.round(d.congestion || 0),
    suffix: '%',
    color: (d.congestion||0) > 70 ? 'var(--danger)' : (d.congestion||0) > 40 ? 'var(--warning)' : 'var(--success)',
    trend: (d.congestion||0) > 70 ? 'HIGH' : (d.congestion||0) > 40 ? 'MED' : 'LOW',
  },
  {
    icon: 'bi-grid-fill',
    label: 'Road Occupancy',
    end: Math.round(d.occupancy || 0),
    suffix: '%',
    color: 'var(--secondary)',
  },
  {
    icon: 'bi-cpu-fill',
    label: 'AI Accuracy',
    end: d.ai_accuracy || 94.7,
    suffix: '%',
    decimals: 1,
    color: 'var(--success)',
    trend: 'OPTIMAL', up: true,
  },
]

export default function StatCards({ data }) {
  const cards = buildCards(data)

  return (
    <div className="stat-cards-grid">
      {cards.map((c, i) => (
        <motion.div
          key={i}
          className="stat-card glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -4 }}
        >
          <div className="sc-icon" style={{ color: c.color, borderColor: `${c.color}44` }}>
            <i className={`bi ${c.icon}`} />
          </div>
          <div className="sc-body">
            <div className="sc-label">{c.label}</div>
            <div className="sc-value" style={{ color: c.color }}>
              {c.text ? (
                c.text
              ) : (
                <AnimatedNumber end={c.end} suffix={c.suffix} decimals={c.decimals || 0} />
              )}
            </div>
            {c.trend && (
              <div className={`sc-trend ${c.up ? 'up' : 'down'}`}>
                <i className={`bi ${c.up ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`} />
                {c.trend}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

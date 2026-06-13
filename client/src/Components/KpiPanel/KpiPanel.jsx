import { motion } from 'framer-motion'
import AnimatedNumber from '../../hooks/useAnimatedNumber'
import './KpiPanel.css'

const buildCards = (d) => [
  {
    id: 'vehicles',
    icon: 'bi-car-front-fill',
    label: 'Vehicles',
    end: d.vehicle_count || 0,
    suffix: '',
    color: '#00E5FF',
    trend: '+12.5%', up: true,
  },
  {
    id: 'cameras',
    icon: 'bi-camera-video-fill',
    label: 'Cameras',
    end: d.active_cameras || 0,
    suffix: '',
    color: '#00FFA3',
    trend: 'LIVE', up: true,
  },
  {
    id: 'speed',
    icon: 'bi-speedometer',
    label: 'Avg Speed',
    end: Math.round(d.speed || 0),
    suffix: 'kph',
    color: '#FFB020',
    trend: '+8.3%', up: true,
  },
  {
    id: 'congestion',
    icon: 'bi-layers-fill',
    label: 'Load',
    end: Math.round(d.congestion || 0),
    suffix: '%',
    color: (d.congestion||0) > 70 ? '#FF4D6D' : (d.congestion||0) > 40 ? '#FFB020' : '#00E676',
    trend: (d.congestion||0) > 70 ? 'HIGH' : 'NRM',
    up: (d.congestion||0) < 50,
  },
  {
    id: 'occupancy',
    icon: 'bi-grid-fill',
    label: 'Road Use',
    end: Math.round(d.occupancy || 0),
    suffix: '%',
    color: '#4FC3F7',
    trend: '+6.2%', up: false,
  },
  {
    id: 'accuracy',
    icon: 'bi-cpu-fill',
    label: 'AI Score',
    end: d.ai_accuracy || 94.7,
    suffix: '%',
    decimals: 1,
    color: '#00E676',
    trend: 'OPT', up: true,
  },
]

export default function KpiPanel({ data }) {
  const cards = buildCards(data)

  return (
    <div className="kpi-panel glass-card">
      <div className="kpi-header">
        <span className="section-title" style={{ marginBottom: 0 }}>
          <i className="bi bi-grid-3x3-gap-fill" /> CONTROL CENTER
        </span>
        <span className="kpi-live-badge"><span className="kpi-live-dot" />LIVE</span>
      </div>
      <div className="kpi-grid">
        {cards.map((c, i) => (
          <motion.div
            key={c.id}
            className="kpi-card"
            style={{ '--kpi-color': c.color }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2, boxShadow: `0 0 20px ${c.color}33` }}
          >
            <div className="kpi-icon-wrap">
              <i className={`bi ${c.icon}`} style={{ color: c.color }} />
              <div className="kpi-icon-glow" style={{ background: c.color }} />
            </div>

            <div className="kpi-body">
              <div className="kpi-label-row">
                <span className="kpi-label">{c.label}</span>
                {c.trend && (
                  <span className={`kpi-trend-inline ${c.up ? 'up' : 'down'}`}>
                    <i className={`bi ${c.up ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`} />
                    {c.trend}
                  </span>
                )}
              </div>
              <div className="kpi-value" style={{ color: c.color }}>
                {c.text
                  ? c.text
                  : <AnimatedNumber end={c.end} suffix={c.suffix} decimals={c.decimals || 0} />
                }
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

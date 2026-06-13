import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { motion } from 'framer-motion'
import './Charts.css'

/* ─── Chart config ─────────────────────────────────────────────────────────── */
const CHART_DEFS = [
  {
    key:   'vehicle_count',
    label: 'Vehicle Count',
    unit:  'veh',
    color: '#00FFA3',
    icon:  'bi-car-front-fill',
    yMax:  50,
    fmt:   v => `${v}`,
  },
  {
    key:   'density_pct',
    label: 'Traffic Density',
    unit:  '%',
    color: '#00E5FF',
    icon:  'bi-speedometer2',
    yMax:  100,
    fmt:   v => `${v}%`,
  },
  {
    key:   'occupancy',
    label: 'Road Occupancy',
    unit:  '%',
    color: '#4FC3F7',
    icon:  'bi-road',
    yMax:  100,
    fmt:   v => `${v}%`,
  },
  {
    key:   'congestion_index',
    label: 'Congestion Index',
    unit:  '%',
    color: '#FFB020',
    icon:  'bi-diagram-3-fill',
    yMax:  100,
    fmt:   v => `${v}%`,
  },
  {
    key:   'avg_speed',
    label: 'Avg Speed',
    unit:  'km/h',
    color: '#00E676',
    icon:  'bi-speedometer',
    yMax:  130,
    fmt:   v => `${v} km/h`,
  },
  {
    key:   'signal_efficiency',
    label: 'Signal Efficiency',
    unit:  '%',
    color: '#7B68EE',
    icon:  'bi-traffic-light-fill',
    yMax:  100,
    fmt:   v => `${v}%`,
  },
  {
    key:   'accident_risk',
    label: 'Accident Risk',
    unit:  '%',
    color: '#FF4D6D',
    icon:  'bi-exclamation-triangle-fill',
    yMax:  100,
    fmt:   v => `${v}%`,
  },
  {
    key:   'emergency_vehicle',
    label: 'Emergency Events',
    unit:  '',
    color: '#FF6B35',
    icon:  'bi-hospital-fill',
    yMax:  1,
    fmt:   v => v > 0 ? 'YES' : 'NO',
  },
]

/* ─── Tooltip ──────────────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, unit, color }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rtc-tooltip">
      <div className="rtc-tooltip-label">{label}</div>
      <div className="rtc-tooltip-val" style={{ color }}>
        {payload[0].value}{unit ? ` ${unit}` : ''}
      </div>
    </div>
  )
}

/* ─── Single chart card ─────────────────────────────────────────────────────── */
function ChartCard({ def, history, currentVal }) {
  const gradId = `rtgrad-${def.key}`

  // Build Recharts data array
  const data = (history || []).map((v, i) => ({
    t: i === (history.length - 1) ? 'now' : `${i - history.length + 1}s`,
    value: typeof v === 'number' ? Math.round(v * 10) / 10 : 0,
  }))

  // Color-based ring around current value
  const riskColor = def.key === 'accident_risk'
    ? currentVal > 70 ? '#FF2020'
      : currentVal > 45 ? '#FFB020'
      : def.color
    : def.color

  return (
    <motion.div
      className="rtc-card glass-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="rtc-hdr">
        <div className="rtc-hdr-left">
          <i className={`bi ${def.icon}`} style={{ color: def.color }} />
          <span className="rtc-label">{def.label}</span>
        </div>
        <motion.span
          className="rtc-cur"
          style={{ color: riskColor }}
          key={currentVal}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {def.fmt(currentVal ?? 0)}
        </motion.span>
      </div>

      {/* Live badge */}
      <div className="rtc-live">
        <span className="rtc-live-dot" style={{ background: def.color }} />
        <span>LIVE</span>
      </div>

      {/* Recharts AreaChart */}
      <div className="rtc-chart">
        <ResponsiveContainer width="100%" height={108} debounce={60}>
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -28 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={def.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={def.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="t"
              tick={{ fill: '#1e293b', fontSize: 8 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, def.yMax]}
              tick={{ fill: '#1e293b', fontSize: 8 }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip
              content={<CustomTooltip unit={def.unit} color={def.color} />}
              cursor={{ stroke: `${def.color}40`, strokeWidth: 1 }}
            />
            <Area
              type="monotoneX"
              dataKey="value"
              stroke={def.color}
              strokeWidth={1.8}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 3, fill: def.color, stroke: '#050816', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

/* ─── Main export — 8-chart grid ────────────────────────────────────────────── */
export default function RealtimeChartsGrid({ rtHistory = {}, rtAnalytics = {} }) {
  return (
    <div className="rtc-section">
      <div className="rtc-section-hdr">
        <span className="section-title" style={{ marginBottom: 0 }}>
          <i className="bi bi-graph-up-arrow" /> REAL-TIME AI TRAFFIC ANALYTICS
        </span>
        <div className="rtc-section-meta">
          <span className="rtc-ws-badge">
            <i className="bi bi-wifi" /> WebSocket Live
          </span>
          <span className="rtc-ws-badge rtc-ws-badge--tick">
            30s rolling window
          </span>
        </div>
      </div>

      <div className="rtc-grid">
        {CHART_DEFS.map(def => (
          <ChartCard
            key={def.key}
            def={def}
            history={rtHistory[def.key] || []}
            currentVal={rtAnalytics[def.key] ?? 0}
          />
        ))}
      </div>
    </div>
  )
}

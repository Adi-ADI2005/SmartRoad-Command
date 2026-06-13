import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { getAlerts } from '../../utils/api'
import './Alerts.css'

const TYPE_CFG = {
  emergency: {
    label: 'EMERGENCY',
    color: '#FF2D55',
    bg: 'linear-gradient(90deg, rgba(255,45,85,0.18) 0%, rgba(255,45,85,0.06) 100%)',
    border: '#FF2D55',
    icon: 'bi-exclamation-octagon-fill',
    glow: '0 0 24px rgba(255,45,85,0.35)',
    pulse: true,
  },
  danger: {
    label: 'CRITICAL',
    color: '#FF4D6D',
    bg: 'linear-gradient(90deg, rgba(255,77,109,0.14) 0%, rgba(255,77,109,0.04) 100%)',
    border: '#FF4D6D',
    icon: 'bi-exclamation-circle-fill',
    glow: '0 0 14px rgba(255,77,109,0.2)',
    pulse: false,
  },
  warning: {
    label: 'WARNING',
    color: '#FFB020',
    bg: 'linear-gradient(90deg, rgba(255,176,32,0.13) 0%, rgba(255,176,32,0.03) 100%)',
    border: '#FFB020',
    icon: 'bi-exclamation-triangle-fill',
    glow: '0 0 10px rgba(255,176,32,0.18)',
    pulse: false,
  },
  info: {
    label: 'INFO',
    color: '#4FC3F7',
    bg: 'linear-gradient(90deg, rgba(79,195,247,0.10) 0%, rgba(79,195,247,0.02) 100%)',
    border: '#4FC3F7',
    icon: 'bi-info-circle-fill',
    glow: 'none',
    pulse: false,
  },
  success: {
    label: 'RESOLVED',
    color: '#00E676',
    bg: 'linear-gradient(90deg, rgba(0,230,118,0.10) 0%, rgba(0,230,118,0.02) 100%)',
    border: '#00E676',
    icon: 'bi-check-circle-fill',
    glow: 'none',
    pulse: false,
  },
}

const CAMERAS   = ['CAM-01','CAM-02','CAM-03','CAM-04','CAM-05','CAM-06','CAM-07']
const LOCATIONS = ['Main Street','Junction A','Route 27','Ring Road','Lake View Rd','Airport Road','Industrial Area','City Wide']

const ALERT_TEMPLATES = [
  { type:'emergency', title:'Emergency Vehicle Detected',  desc:'Ambulance on Route 27 — signal priority corridor activated.' },
  { type:'danger',    title:'Accident Detected',           desc:'Collision risk HIGH — multiple vehicles braking on Main St.' },
  { type:'danger',    title:'Over-Speeding Detected',      desc:'Vehicles exceeding 90 km/h in Industrial Area zone.' },
  { type:'warning',   title:'Heavy Traffic Congestion',    desc:'Road occupancy above 80% on Ring Road.' },
  { type:'warning',   title:'Sudden Traffic Slowdown',     desc:'Average speed dropped below 15 km/h — possible incident.' },
  { type:'warning',   title:'Road Occupancy Critical',     desc:'Occupancy above 90% on Airport Road.' },
  { type:'warning',   title:'Weather Alert',               desc:'Rain detected — road grip reduced, caution advised.' },
  { type:'info',      title:'Signal Optimisation Updated', desc:'Adaptive AI recalibrated cycle time to 140 s.' },
  { type:'info',      title:'AI Model Recalibrated',       desc:'YOLO model updated — accuracy improved to 94.7%.' },
  { type:'success',   title:'Emergency Route Cleared',     desc:'Green corridor opened — emergency vehicle passed.' },
]

let nextId = 300

function nowStr() {
  const d = new Date(), p = n => String(n).padStart(2,'0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function makeAlert(tmpl) {
  return {
    ...tmpl,
    id: nextId++,
    time: nowStr(),
    camera:     CAMERAS[Math.floor(Math.random() * CAMERAS.length)],
    location:   LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    confidence: (75 + Math.random() * 25).toFixed(1),
  }
}

const SEV_ORDER = { emergency:0, danger:1, warning:2, info:3, success:4 }

export default function AlertCenter() {
  const [alerts, setAlerts]   = useState([])
  const [filter, setFilter]   = useState('ALL')
  const [paused, setPaused]   = useState(false)
  const bodyRef               = useRef(null)
  const pausedRef             = useRef(false)

  pausedRef.current = paused

  const addAlert = useCallback((tmpl) => {
    if (pausedRef.current) return
    setAlerts(prev => [makeAlert(tmpl), ...prev].slice(0, 80))
  }, [])

  /* seed + live stream */
  useEffect(() => {
    getAlerts().then(r => {
      const seed = (r.data.alerts || []).map((a, i) => ({
        type: a.type || 'info', title: a.message || 'Traffic Alert',
        desc: 'System-generated alert.', id: i,
        time: nowStr(),
        camera:     CAMERAS[i % CAMERAS.length],
        location:   LOCATIONS[i % LOCATIONS.length],
        confidence: '91.2',
      }))
      setAlerts(seed)
    }).catch(() => {})

    const t = setInterval(() => {
      addAlert(ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)])
    }, 5000)
    return () => clearInterval(t)
  }, [addAlert])

  /* auto-scroll to top on new alert */
  useEffect(() => {
    if (!paused && bodyRef.current) {
      bodyRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [alerts.length, paused])

  const filtered = filter === 'ALL'
    ? alerts
    : alerts.filter(a => (TYPE_CFG[a.type]?.label || 'INFO') === filter)

  const counts = alerts.reduce((acc, a) => {
    const lvl = TYPE_CFG[a.type]?.label || 'INFO'
    acc[lvl] = (acc[lvl]||0) + 1
    return acc
  }, {})

  const TABS = [
    { key:'ALL',       color:'#94a3b8' },
    { key:'EMERGENCY', color:'#FF2D55' },
    { key:'CRITICAL',  color:'#FF4D6D' },
    { key:'WARNING',   color:'#FFB020' },
    { key:'INFO',      color:'#4FC3F7' },
    { key:'RESOLVED',  color:'#00E676' },
  ]

  return (
    <motion.div
      className="ac-outer"
      initial={{ opacity:0, y:30 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5, ease:'easeOut' }}
    >
      {/* ── Title bar ── */}
      <div className="ac-titlebar">
        <div className="ac-titlebar-left">
          <span className="ac-icon-wrap">
            <i className="bi bi-bell-fill" />
            {counts['EMERGENCY'] > 0 && <span className="ac-icon-badge" />}
          </span>
          <div>
            <div className="ac-main-title">ALERT CENTER</div>
            <div className="ac-sub-title">{alerts.length} total · auto-updating every 5 s</div>
          </div>
        </div>

        <div className="ac-titlebar-right">
          {/* count pills */}
          <div className="ac-count-pills">
            {[['EMERGENCY','#FF2D55'],['CRITICAL','#FF4D6D'],['WARNING','#FFB020']].map(([lbl,clr]) =>
              counts[lbl] ? (
                <motion.span key={lbl} className="ac-pill"
                  style={{ color:clr, borderColor:`${clr}44`, background:`${clr}12` }}
                  initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:400 }}>
                  {counts[lbl]} {lbl}
                </motion.span>
              ) : null
            )}
          </div>
          {/* pause / resume */}
          <button
            className={`ac-pause-btn ${paused ? 'paused' : ''}`}
            onClick={() => setPaused(p => !p)}
            title={paused ? 'Resume live feed' : 'Pause live feed'}
          >
            <i className={`bi ${paused ? 'bi-play-fill' : 'bi-pause-fill'}`} />
            {paused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="ac-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`ac-tab ${filter === t.key ? 'active' : ''}`}
            style={{ '--tab-color': t.color }}
            onClick={() => setFilter(t.key)}
          >
            {t.key}
            {t.key !== 'ALL' && counts[t.key] > 0 && (
              <span className="ac-tab-count" style={{ background: t.color }}>{counts[t.key]}</span>
            )}
          </button>
        ))}
        <div className="ac-tabs-spacer" />
        <span className="ac-live-badge">
          <span className="ac-live-dot" />
          LIVE
        </span>
      </div>

      {/* ── Column headers ── */}
      <div className="ac-col-headers">
        <div className="ach">TIME</div>
        <div className="ach ach-main">ALERT DETAILS</div>
        <div className="ach">LOCATION</div>
        <div className="ach">CAMERA</div>
        <div className="ach">SEVERITY</div>
        <div className="ach">CONFIDENCE</div>
        <div className="ach">STATUS</div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="ac-scroll-wrap">
        {/* top fade mask */}
        <div className="ac-fade-top" />

        <div className="ac-body" ref={bodyRef}>
          <AnimatePresence initial={false}>
            {filtered.length === 0 && (
              <motion.div className="ac-empty"
                initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <i className="bi bi-shield-check" />
                <span>No {filter !== 'ALL' ? filter.toLowerCase() : ''} alerts at this time</span>
              </motion.div>
            )}

            {filtered.map((a, idx) => {
              const cfg = TYPE_CFG[a.type] || TYPE_CFG.info
              return (
                <motion.div
                  key={a.id}
                  className={`ac-row ${cfg.pulse ? 'ac-row--pulse' : ''}`}
                  style={{
                    background:  cfg.bg,
                    borderLeft:  `3px solid ${cfg.border}`,
                    boxShadow:   cfg.glow,
                  }}
                  layout
                  initial={{ opacity:0, x:-24, height:0, marginBottom:0 }}
                  animate={{ opacity:1, x:0,   height:'auto', marginBottom:1 }}
                  exit={{    opacity:0, x:24,   height:0, marginBottom:0 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.4, 0, 0.2, 1],
                    layout: { duration:0.25 },
                  }}
                  whileHover={{ x: 4, transition:{ duration:0.15 } }}
                >
                  {/* TIME */}
                  <div className="ac-cell ac-cell--time">
                    <motion.i
                      className={`bi ${cfg.icon}`}
                      style={{ color: cfg.color }}
                      animate={cfg.pulse ? { opacity:[1,0.3,1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.2, ease:'easeInOut' }}
                    />
                    <span className="ac-time-val">{a.time}</span>
                  </div>

                  {/* ALERT DETAILS */}
                  <div className="ac-cell ac-cell--main">
                    <span className="ac-alert-title">{a.title}</span>
                    {a.desc && <span className="ac-alert-desc">{a.desc}</span>}
                  </div>

                  {/* LOCATION */}
                  <div className="ac-cell ac-cell--loc">
                    <i className="bi bi-geo-alt-fill" style={{ color: cfg.color, opacity:.7 }} />
                    <span>{a.location}</span>
                  </div>

                  {/* CAMERA */}
                  <div className="ac-cell ac-cell--cam">
                    <i className="bi bi-camera-video-fill" style={{ color:'#4FC3F7', opacity:.7 }} />
                    <span>{a.camera}</span>
                  </div>

                  {/* SEVERITY */}
                  <div className="ac-cell">
                    <span className="ac-badge"
                      style={{ color:cfg.color, background:`${cfg.border}1A`, border:`1px solid ${cfg.border}44` }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* CONFIDENCE */}
                  <div className="ac-cell ac-cell--conf">
                    <span className="ac-conf-num" style={{ color: cfg.color }}>{a.confidence}%</span>
                    <div className="ac-bar-bg">
                      <motion.div
                        className="ac-bar-fill"
                        style={{ background: cfg.color, boxShadow:`0 0 6px ${cfg.color}80` }}
                        initial={{ width:0 }}
                        animate={{ width:`${a.confidence}%` }}
                        transition={{ duration:0.8, ease:'easeOut', delay: idx < 10 ? idx*0.03 : 0 }}
                      />
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="ac-cell ac-cell--status">
                    <motion.span
                      className="ac-status-dot"
                      style={{ background: cfg.color }}
                      animate={{ scale:[1,1.5,1], opacity:[1,0.5,1] }}
                      transition={{ repeat: Infinity, duration: cfg.pulse?0.8:2, ease:'easeInOut' }}
                    />
                    <span className="ac-status-txt">
                      {a.type==='emergency' ? 'RESPONDING'
                        : a.type==='danger'  ? 'ACTIVE'
                        : a.type==='success' ? 'RESOLVED'
                        : 'MONITORING'}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* bottom fade mask */}
        <div className="ac-fade-bottom" />
      </div>

      {/* ── Footer bar ── */}
      <div className="ac-footer">
        <span className="ac-footer-left">
          <i className="bi bi-shield-fill-exclamation" style={{ color:'#FFB020' }} />
          Showing {filtered.length} of {alerts.length} alerts
        </span>
        <span className="ac-footer-right">
          {paused && <span className="ac-paused-tag"><i className="bi bi-pause-circle" /> PAUSED</span>}
          <span>Last update: {nowStr()}</span>
        </span>
      </div>
    </motion.div>
  )
}

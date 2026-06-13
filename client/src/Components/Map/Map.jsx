import { motion } from 'framer-motion'
import { DENSITY_COLORS, SIGNAL_COLORS } from '../../utils/constants'
import './Map.css'

const JUNCTIONS = [
  { id: 'A', x: 20, y: 25, label: 'Junction A', cam: 'CAM-01' },
  { id: 'B', x: 50, y: 20, label: 'Junction B', cam: 'CAM-02' },
  { id: 'C', x: 80, y: 25, label: 'Junction C', cam: 'CAM-03' },
  { id: 'D', x: 20, y: 75, label: 'Junction D', cam: 'CAM-04' },
  { id: 'E', x: 50, y: 70, label: 'Junction E', cam: 'CAM-05' },
  { id: 'F', x: 80, y: 75, label: 'Junction F', cam: 'CAM-06' },
  { id: 'G', x: 50, y: 47, label: 'City Center', cam: 'CAM-07' },
]

const ROADS = [
  { x1:20,y1:25, x2:50,y2:20 },
  { x1:50,y1:20, x2:80,y2:25 },
  { x1:20,y1:25, x2:20,y2:75 },
  { x1:80,y1:25, x2:80,y2:75 },
  { x1:20,y1:75, x2:50,y2:70 },
  { x1:50,y1:70, x2:80,y2:75 },
  { x1:50,y1:20, x2:50,y2:47 },
  { x1:50,y1:47, x2:50,y2:70 },
  { x1:20,y1:25, x2:50,y2:47 },
  { x1:80,y1:25, x2:50,y2:47 },
  { x1:20,y1:75, x2:50,y2:47 },
  { x1:80,y1:75, x2:50,y2:47 },
]

const HOTSPOTS = [
  { x:35,y:22,  r:8,  color:'#FF4D6D', label:'Congestion Zone' },
  { x:65,y:72,  r:6,  color:'#FFB020', label:'Moderate Load' },
  { x:50,y:47,  r:10, color:'#FFB020', label:'City Center' },
]

export default function Map({ density, signal, onJunctionClick }) {
  const jColor = DENSITY_COLORS[density] || DENSITY_COLORS.LOW
  const sColor = SIGNAL_COLORS[signal] || '#FF4D6D'

  return (
    <div className="map-wrapper glass-card">
      <div className="map-hdr">
        <span className="section-title" style={{ marginBottom: 0 }}>
          <i className="bi bi-map-fill" /> SMART CITY TRAFFIC MAP
        </span>
        <div className="map-legend">
          {Object.entries(DENSITY_COLORS).filter(([k])=>k!=='UNKNOWN').map(([k,v])=>(
            <div key={k} className="map-leg-item">
              <span className="map-leg-dot" style={{ background: v, boxShadow:`0 0 4px ${v}` }} />
              <span>{k}</span>
            </div>
          ))}
          <div className="map-leg-item">
            <span className="map-leg-dot" style={{ background: '#4FC3F7', boxShadow:'0 0 4px #4FC3F7' }} />
            <span>CAMERAS</span>
          </div>
        </div>
      </div>

      <div className="map-body">
        <svg viewBox="0 0 100 100" className="city-svg" preserveAspectRatio="xMidYMid meet">
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,229,255,0.04)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Heat zones */}
          {HOTSPOTS.map((h,i)=>(
            <circle key={i} cx={h.x} cy={h.y} r={h.r} fill={h.color} opacity="0.07" />
          ))}

          {/* Roads */}
          {ROADS.map((r,i)=>(
            <line
              key={i}
              x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
              stroke="rgba(0,229,255,0.35)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          ))}

          {/* Animated traffic dots */}
          {ROADS.slice(0,6).map((r,i)=>(
            <circle key={`dot-${i}`} r="1" fill={jColor} opacity="0.9">
              <animateMotion
                dur={`${2.5 + i * 0.4}s`}
                repeatCount="indefinite"
                path={`M${r.x1},${r.y1} L${r.x2},${r.y2}`}
              />
            </circle>
          ))}
          {ROADS.slice(0,6).map((r,i)=>(
            <circle key={`dot2-${i}`} r="0.8" fill={jColor} opacity="0.6">
              <animateMotion
                dur={`${3 + i * 0.3}s`}
                begin={`${i*0.5}s`}
                repeatCount="indefinite"
                path={`M${r.x2},${r.y2} L${r.x1},${r.y1}`}
              />
            </circle>
          ))}

          {/* Junction nodes */}
          {JUNCTIONS.map((j)=>(
            <g
              key={j.id}
              className="junction-node"
              onClick={() => onJunctionClick && onJunctionClick(j)}
              style={{ cursor: 'pointer' }}
            >
              {/* Clickable hit area */}
              <circle cx={j.x} cy={j.y} r="7" fill="transparent" />
              {/* Outer glow halo */}
              <circle cx={j.x} cy={j.y} r="5.5" fill={jColor} opacity="0.12" />
              {/* Inner dot */}
              <circle cx={j.x} cy={j.y} r="3.2" fill={jColor}
                style={{ filter:`drop-shadow(0 0 3px ${jColor})` }} />
              <text x={j.x} y={j.y-5.5} textAnchor="middle" fontSize="2.8" fill="#94a3b8" fontFamily="Inter,sans-serif">
                {j.label}
              </text>
              {/* Signal rect */}
              <rect
                x={j.x+3.5} y={j.y-2.5}
                width="2.5" height="5" rx="0.5"
                fill={sColor} opacity="0.85"
                style={{ filter:`drop-shadow(0 0 2px ${sColor})` }}
              />
              {/* Camera icon — clickable hint */}
              <circle cx={j.x-3.5} cy={j.y} r="1.8" fill="#4FC3F7" opacity="0.85"
                style={{ filter:'drop-shadow(0 0 2px #4FC3F7)' }} />
              <text x={j.x-3.5} y={j.y+0.8} textAnchor="middle" fontSize="1.8" fill="#050816" fontWeight="bold">▶</text>
            </g>
          ))}

          {/* Congestion zone labels */}
          <text x="35" y="18" textAnchor="middle" fontSize="2.5" fill="#FF4D6D" fontFamily="Inter,sans-serif" opacity="0.7">HIGH CONGESTION</text>
        </svg>

        {/* Right sidebar */}
        <div className="map-sidebar">
          <div className="map-stat-card">
            <div className="map-stat-label">Active Junctions</div>
            <div className="map-stat-val" style={{ color: 'var(--primary)' }}>7 / 12</div>
          </div>
          <div className="map-stat-card">
            <div className="map-stat-label">Emergency Routes</div>
            <div className="map-stat-val" style={{ color: 'var(--success)' }}>3 OPEN</div>
          </div>
          <div className="map-stat-card">
            <div className="map-stat-label">Congestion Zones</div>
            <div className="map-stat-val" style={{ color: 'var(--danger)' }}>2 ACTIVE</div>
          </div>
          <div className="map-stat-card">
            <div className="map-stat-label">Active Cameras</div>
            <div className="map-stat-val" style={{ color: 'var(--info)' }}>7 / 7</div>
          </div>
          <div className="map-stat-card">
            <div className="map-stat-label">Signal Mode</div>
            <div className="map-stat-val" style={{ color: 'var(--secondary)' }}>ADAPTIVE AI</div>
          </div>
          <div className="map-stat-card">
            <div className="map-stat-label">Avg Cycle Time</div>
            <div className="map-stat-val" style={{ color: 'var(--warning)' }}>140 sec</div>
          </div>
        </div>
      </div>
    </div>
  )
}

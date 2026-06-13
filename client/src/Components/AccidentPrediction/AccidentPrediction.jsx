import { Line } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import { SEVERITY_COLORS } from '../../utils/constants'
import './AccidentPrediction.css'

const RECOMMENDATIONS = {
  LOW:      ['Continue normal operations', 'Monitor traffic flow periodically'],
  MEDIUM:   ['Deploy additional surveillance', 'Alert nearby traffic officers', 'Reduce speed limits preventively'],
  HIGH:     ['Dispatch rapid response team', 'Activate incident management protocol', 'Issue public advisory'],
  CRITICAL: ['DISPATCH EMERGENCY RESPONSE NOW', 'Close affected lanes immediately', 'Alert hospitals & emergency services'],
}

export default function AccidentPrediction({ score, status, history }) {
  const sev   = status || 'LOW'
  const pct   = Math.min(100, score || 0)
  const color = SEVERITY_COLORS[sev] || SEVERITY_COLORS.LOW
  const recs  = RECOMMENDATIONS[sev] || RECOMMENDATIONS.LOW

  const circumference = 2 * Math.PI * 40
  const offset = circumference * (1 - pct / 100)

  return (
    <div className="ap-wrapper glass-card">
      <div className="section-title"><i className="bi bi-shield-exclamation" /> ACCIDENT PREDICTION</div>

      <div className="ap-body">
        {/* Gauge */}
        <div className="ap-gauge-wrap">
          <svg viewBox="0 0 100 100" className="ap-gauge-svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <motion.circle
              cx="50" cy="50" r="40"
              fill="none" stroke={color} strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ filter:`drop-shadow(0 0 5px ${color})`, transform:'rotate(-90deg)', transformOrigin:'50% 50%' }}
            />
            <text x="50" y="47" textAnchor="middle" fontSize="14" fontWeight="bold" fill={color} fontFamily="Poppins,sans-serif">
              {Math.round(pct)}%
            </text>
            <text x="50" y="59" textAnchor="middle" fontSize="5.5" fill="#94a3b8" fontFamily="Inter,sans-serif" letterSpacing="1">
              RISK SCORE
            </text>
          </svg>
          <div className="ap-sev-badge" style={{ background:`${color}18`, borderColor:color, color }}>
            {sev} RISK
          </div>
        </div>

        {/* Recommendations */}
        <ul className="ap-recs">
          {recs.map((r, i) => (
            <motion.li key={i}
              initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.1 }}
              style={{ color: sev==='CRITICAL' ? color : 'var(--text-primary)' }}>
              <i className="bi bi-chevron-right" style={{ color, fontSize:'0.65rem' }} />
              {r}
            </motion.li>
          ))}
        </ul>

        {/* History mini chart */}
        <div className="ap-chart">
          <div className="ap-chart-label">Prediction History</div>
          <div style={{ height: 80 }}>
            <Line
              data={{
                labels: Array.from({ length: history?.length||20 }, (_,i)=>`${i}s`),
                datasets: [{
                  label:'Risk',
                  data: history || Array(20).fill(0),
                  borderColor: color,
                  backgroundColor: `${color}18`,
                  fill: true,
                  tension: 0.4,
                  pointRadius: 0,
                  borderWidth: 2,
                }],
              }}
              options={{
                responsive:true, maintainAspectRatio:false, animation:{duration:400},
                plugins:{legend:{display:false}},
                scales:{
                  x:{ticks:{color:'#475569',font:{size:7}}, grid:{color:'#1e293b55'}},
                  y:{ticks:{color:'#475569',font:{size:7}}, grid:{color:'#1e293b55'}, min:0, max:100},
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

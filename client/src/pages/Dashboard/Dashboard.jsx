import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { connectWS, disconnectWS } from '../../utils/socket'

import CommandHeader   from '../../Components/CommandHeader/CommandHeader'
import CameraFeed      from '../../Components/CameraFeed/CameraFeed'
import KpiPanel        from '../../Components/KpiPanel/KpiPanel'
import CityMap         from '../../Components/Map/Map'
import RealtimeCharts  from '../../Components/Charts/Charts'
import AccidentPanel   from '../../Components/AccidentPanel/AccidentPanel'
import AlertCenter     from '../../Components/Alerts/Alerts'
import Controls        from '../../Components/Controls/Controls'
import './Dashboard.css'

const EMPTY_ACCIDENT = {
  detected: false, severity: 'LOW', confidence: 0, casualty_risk: 0,
  accident_type: null, vehicles_involved: 0, location: 'NH-65 Junction 7',
  golden_hour_remaining: null, emergency_required: false,
  estimated_response_time: 'Not required', composite_score: 0,
}

const EMPTY_DISPATCH = {
  active: false,
  hospital:  { name: '—', distance: '—', eta: '—', phone: '—', trauma: false },
  police:    { name: '—', distance: '—', eta: '—', phone: '—' },
  ambulance: { name: '—', distance: '—', eta: '—', phone: '—', status: 'STANDBY', units_dispatched: 0 },
}

const DEFAULT = {
  vehicle_count: 0, density: 'LOW', signal: 'RED',
  severity_score: 0, severity_status: 'LOW',
  speed: 0, congestion: 0, occupancy: 0,
  active_cameras: 0, ai_accuracy: 94.7, camera_on: false,
  vehicle_history: [], density_history: [], speed_history: [], accident_history: [],
  ai_metrics: {
    vehicle_detection: 0, lane_analysis: 0, traffic_flow: 0,
    signal_efficiency: 0, emergency_detection: 0, violation_detection: 0,
  },
  ai_history: {
    vehicle_detection: [], lane_analysis: [], traffic_flow: [],
    signal_efficiency: [], emergency_detection: [], violation_detection: [],
  },
  rt_analytics: {
    vehicle_count: 0, density_pct: 0, occupancy: 0, avg_speed: 0,
    congestion_index: 0, signal_efficiency: 0, accident_risk: 0, emergency_vehicle: 0,
  },
  rt_history: {
    vehicle_count: [], density_pct: [], occupancy: [], avg_speed: [],
    congestion_index: [], signal_efficiency: [], accident_risk: [], emergency_vehicle: [],
  },
  accident: EMPTY_ACCIDENT,
  emergency: EMPTY_DISPATCH,
}

export default function Dashboard() {
  const [liveData, setLiveData]   = useState(DEFAULT)
  const [cameraOn, setCameraOn]   = useState(false)
  const [connected, setConnected] = useState(false)
  const [activeCam, setActiveCam] = useState(null)
  const cameraRef = useRef(null)

  useEffect(() => {
    const handler = (data) => {
      setLiveData(prev => ({
        ...prev,
        ...data,
        ai_metrics:  data.ai_metrics  ?? prev.ai_metrics,
        ai_history:  data.ai_history  ?? prev.ai_history,
        rt_analytics:data.rt_analytics ?? prev.rt_analytics,
        rt_history:  data.rt_history  ?? prev.rt_history,
        accident:    data.accident    ?? prev.accident,
        emergency:   data.emergency   ?? prev.emergency,
      }))
      setConnected(true)
    }
    connectWS(handler)
    return () => disconnectWS(handler)
  }, [])

  const handleCameraToggle = (st) => {
    setCameraOn(st)
    setLiveData(prev => ({ ...prev, camera_on: st, active_cameras: st ? 1 : 0 }))
  }

  const handleJunctionClick = (j) => {
    setActiveCam(j)
    cameraRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleResetCam = () => setActiveCam(null)

  return (
    <motion.div
      className="cmd-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <CommandHeader connected={connected} />

      {/* ── Row 1: Camera (70%) + KPI + Controls (30%) ── */}
      <div className="cmd-row cmd-row-1" ref={cameraRef}>
        <div className="cmd-col-camera">
          <CameraFeed
            isOn={cameraOn}
            onToggle={handleCameraToggle}
            activeCam={activeCam}
            onResetCam={handleResetCam}
          />
        </div>
        <div className="cmd-col-kpi">
          <KpiPanel data={liveData} />
          <Controls signal={liveData.signal} />
        </div>
      </div>

      {/* ── Row 2: City Map ── */}
      <div className="cmd-row cmd-row-2">
        <CityMap
          density={liveData.density}
          signal={liveData.signal}
          onJunctionClick={handleJunctionClick}
        />
      </div>

      {/* ── Row 3: 8 Real-time Recharts ── */}
      <RealtimeCharts
        rtHistory={liveData.rt_history}
        rtAnalytics={liveData.rt_analytics}
      />

      {/* ── Row 4: Accident Command Center ── */}
      <AccidentPanel
        accident={liveData.accident}
        emergency={liveData.emergency}
      />

      {/* ── Row 5: Alert Center ── */}
      <AlertCenter />
    </motion.div>
  )
}

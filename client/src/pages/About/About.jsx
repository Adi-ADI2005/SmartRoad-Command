import { motion } from 'framer-motion'
import './StubPage.css'

export default function About() {
  return (
    <motion.div
      className="stub-page"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="stub-hero">
        <div className="stub-icon"><i className="bi bi-info-circle-fill" /></div>
        <h1>ABOUT THE SYSTEM</h1>
        <p>
          The Smart Traffic Management System is an AI-powered platform built to monitor,
          analyse, and control urban traffic in real-time. Powered by YOLOv8 object detection,
          FastAPI, and a futuristic React dashboard, it gives cities the intelligence they need
          to keep traffic flowing safely and efficiently.
        </p>
      </div>

      <div className="stub-cards">
        {[
          { icon: 'bi-cpu-fill',             title: 'YOLOv8 AI',         desc: 'State-of-the-art object detection for vehicles, pedestrians, and emergency units.' },
          { icon: 'bi-broadcast-pin',         title: 'FastAPI + WebSocket',desc: 'Sub-second real-time data push with async Python backend.' },
          { icon: 'bi-shield-exclamation',    title: 'Roboflow CLIP',     desc: 'Accident severity prediction using CLIP model via Roboflow inference.' },
          { icon: 'bi-graph-up-arrow',        title: 'Live Analytics',    desc: 'Chart.js powered dashboards with rolling history and trend analysis.' },
        ].map((c, i) => (
          <motion.div
            key={i} className="stub-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6 }}
          >
            <i className={`bi ${c.icon}`} />
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

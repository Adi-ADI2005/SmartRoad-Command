import './Footer.css'

export default function Footer() {
  return (
    <footer className="traffic-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            <i className="bi bi-traffic-light-fill" />
            <span>SMART TRAFFIC MANAGEMENT SYSTEM</span>
          </div>
          <p className="footer-desc">AI-powered urban traffic management for smarter cities.</p>
        </div>
        <div>
          <h4>System</h4>
          <ul>
            <li>YOLOv8 Detection</li>
            <li>Roboflow CLIP</li>
            <li>FastAPI Backend</li>
            <li>React Dashboard</li>
          </ul>
        </div>
        <div>
          <h4>Status</h4>
          <ul>
            <li><span className="dot green" /> Backend Online</li>
            <li><span className="dot green" /> AI Model Active</li>
            <li><span className="dot yellow" /> Camera Standby</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Smart Traffic AI — All rights reserved</span>
        <span className="footer-tag">POWERED BY YOLOV8 + FASTAPI</span>
      </div>
    </footer>
  )
}

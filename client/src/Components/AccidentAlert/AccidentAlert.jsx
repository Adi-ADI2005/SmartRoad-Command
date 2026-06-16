import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AccidentAlert.css'

const SEV_COLOR = {
  CRITICAL: '#FF1744',
  HIGH:     '#FF5722',
  MEDIUM:   '#FF9800',
  LOW:      '#4CAF50',
}

export default function AccidentAlert({ accident, lastAlert }) {
  const [visible, setVisible]       = useState(false)
  const [dismissed, setDismissed]   = useState(false)
  const [imgError, setImgError]     = useState(false)
  const prevDetected                = useRef(false)
  const audioRef                    = useRef(null)

  const sev   = accident?.severity || 'LOW'
  const color = SEV_COLOR[sev] || SEV_COLOR.LOW

  // Show modal whenever a NEW accident fires (detected flips false→true)
  useEffect(() => {
    if (accident?.detected && !prevDetected.current) {
      setDismissed(false)
      setImgError(false)
      setVisible(true)
    }
    if (!accident?.detected) {
      setVisible(false)
    }
    prevDetected.current = !!accident?.detected
  }, [accident?.detected])

  if (!visible || dismissed) return null

  const ts   = lastAlert?.timestamp || new Date().toLocaleString()
  const loc  = lastAlert?.location  || accident?.location || 'NH-65 Junction 7, Hyderabad'
  const imgUrl = lastAlert?.snapshot_url || null
  const police   = lastAlert?.police_phone   || '8280140085'
  const hospital = lastAlert?.hospital_phone || '8917559113'

  return (
    <AnimatePresence>
      <div className="aa-backdrop" onClick={() => setDismissed(true)}>
        <motion.div
          className="aa-modal"
          style={{ '--sev-color': color }}
          initial={{ scale: 0.7, opacity: 0, y: -60 }}
          animate={{ scale: 1,   opacity: 1, y: 0 }}
          exit={{    scale: 0.8, opacity: 0, y: -40 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="aa-header" style={{ background: color }}>
            <div className="aa-header-left">
              <span className="aa-pulse-dot" />
              <span className="aa-title">ACCIDENT DETECTED</span>
            </div>
            <span className="aa-badge">{sev}</span>
          </div>

          {/* ── Body ── */}
          <div className="aa-body">

            {/* Photo */}
            <div className="aa-photo-wrap">
              {imgUrl && !imgError ? (
                <img
                  src={imgUrl}
                  alt="Accident snapshot"
                  className="aa-photo"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="aa-photo-placeholder" style={{ borderColor: color }}>
                  <i className="bi bi-exclamation-triangle-fill" style={{ color }} />
                  <span>Snapshot captured</span>
                </div>
              )}
            </div>

            {/* Info rows */}
            <div className="aa-info">
              <div className="aa-info-row">
                <i className="bi bi-clock-fill" />
                <div>
                  <div className="aa-info-label">Date &amp; Time</div>
                  <div className="aa-info-value">{ts}</div>
                </div>
              </div>
              <div className="aa-info-row">
                <i className="bi bi-geo-alt-fill" />
                <div>
                  <div className="aa-info-label">Location</div>
                  <div className="aa-info-value">{loc}</div>
                </div>
              </div>
              <div className="aa-info-row">
                <i className="bi bi-shield-exclamation" />
                <div>
                  <div className="aa-info-label">Severity / Confidence</div>
                  <div className="aa-info-value" style={{ color }}>
                    {sev} — {accident?.confidence?.toFixed(1) || '—'}%
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency contacts */}
            <div className="aa-contacts">
              <div className="aa-contact police">
                <div className="aa-contact-icon"><i className="bi bi-shield-fill" /></div>
                <div>
                  <div className="aa-contact-label">POLICE ALERTED</div>
                  <div className="aa-contact-num">{police}</div>
                </div>
                <span className="aa-sent-badge">DISPATCHED</span>
              </div>
              <div className="aa-contact hospital">
                <div className="aa-contact-icon"><i className="bi bi-hospital-fill" /></div>
                <div>
                  <div className="aa-contact-label">HOSPITAL ALERTED</div>
                  <div className="aa-contact-num">{hospital}</div>
                </div>
                <span className="aa-sent-badge">DISPATCHED</span>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="aa-footer">
            <span className="aa-system-tag">
              <i className="bi bi-cpu-fill" /> SmartRoad AI — Auto Alert
            </span>
            <button className="aa-dismiss" onClick={() => setDismissed(true)}>
              Acknowledge &amp; Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

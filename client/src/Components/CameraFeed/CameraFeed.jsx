import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cameraOn, cameraOff } from '../../utils/api'
import './CameraFeed.css'

const MAIN_CAM = { cam: 'CAM-07', label: 'Main Street' }

export default function CameraFeed({ isOn, onToggle, activeCam, onResetCam }) {
  const [loading, setLoading]       = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [streamOn, setStreamOn]     = useState(false)

  const cam = activeCam || MAIN_CAM
  const isJunctionCam = !!activeCam

  const toggle = async (state) => {
    setLoading(true)
    try {
      if (state) await cameraOn(); else await cameraOff()
      onToggle(state)
      setStreamOn(state)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    setStreamOn(isOn)
  }, [isOn])

  useEffect(() => {
    if (isJunctionCam) setStreamOn(true)
    else setStreamOn(isOn)
  }, [isJunctionCam, activeCam])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const showStream = isJunctionCam ? true : streamOn

  const feedContent = (isFull) => (
    <>
      {/* Header */}
      <div className="cam-hdr">
        <div className="cam-hdr-left">
          <span className="section-title" style={{ marginBottom: 0 }}>
            <i className="bi bi-camera-video-fill" /> LIVE FEED — {cam.cam} ({cam.label.toUpperCase()})
          </span>
          {showStream && <span className="cam-live-tag"><span className="cam-live-dot" />LIVE</span>}
          {isJunctionCam && (
            <motion.span
              className="cam-junction-badge"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <i className="bi bi-geo-alt-fill" /> {cam.label}
            </motion.span>
          )}
        </div>
        <div className="cam-hdr-btns">
          {isJunctionCam ? (
            <button className="cam-btn-cmd cam-btn-reset" onClick={onResetCam} title="Back to main camera">
              <i className="bi bi-arrow-left-circle" /> MAIN CAM
            </button>
          ) : (
            <>
              <button className={`cam-btn-cmd on ${streamOn?'active':''}`} onClick={()=>toggle(true)} disabled={loading||streamOn}>
                <i className="bi bi-power" /> ON
              </button>
              <button className={`cam-btn-cmd off ${!streamOn?'active':''}`} onClick={()=>toggle(false)} disabled={loading||!streamOn}>
                <i className="bi bi-power" /> OFF
              </button>
            </>
          )}
          <button
            className="cam-btn-cmd cam-btn-fs"
            onClick={() => setFullscreen(!isFull)}
            title={isFull ? 'Minimize (Esc)' : 'Maximize'}
          >
            <i className={`bi ${isFull ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`} />
            {isFull ? 'MINIMIZE' : 'MAXIMIZE'}
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className={`cam-viewport ${isFull ? 'cam-viewport-fs' : ''}`}>
        <div className="cam-scanline" />
        <div className="cam-corner tl" /><div className="cam-corner tr" />
        <div className="cam-corner bl" /><div className="cam-corner br" />

        {showStream ? (
          <img className="cam-img" src="/api/camera/stream" alt="Live traffic feed" />
        ) : (
          <div className="cam-offline">
            <motion.div className="cam-offline-inner"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <i className="bi bi-camera-video-off-fill" />
              <p>CAMERA OFFLINE</p>
              <span>Click ON to activate stream</span>
            </motion.div>
          </div>
        )}

        {showStream && (
          <>
            <div className="cam-ov cam-ov-tl">
              <div className="cam-info-row">Camera: <b>{cam.cam}</b></div>
              <div className="cam-info-row">Location: <b>{cam.label}</b></div>
            </div>
            <div className="cam-ov cam-ov-tr cam-id-badge">{cam.cam}</div>
            <div className="cam-ov cam-ov-br">
              <span className="cam-ai-badge"><i className="bi bi-cpu-fill" /> AI DETECTION ACTIVE</span>
              <span className="cam-track-badge"><i className="bi bi-bounding-box" /> YOLO v8</span>
            </div>
          </>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Normal card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cam.cam}
          className="cam-wrapper glass-card"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {feedContent(false)}
        </motion.div>
      </AnimatePresence>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            className="cam-fs-overlay"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            {feedContent(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

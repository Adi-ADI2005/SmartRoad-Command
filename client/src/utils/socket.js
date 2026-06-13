/**
 * socket.js — Singleton WebSocket manager for the Traffic dashboard.
 *
 * Handles React StrictMode double-invocation gracefully: if close() is called
 * while the socket is still CONNECTING, we flag it and abort on open instead
 * of leaving a zombie connection.
 */

let ws              = null
let listeners       = []
let reconnectTimer  = null
let shouldClose     = false   // StrictMode guard

function _connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return
  }

  shouldClose = false
  clearTimeout(reconnectTimer)

  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host  = window.location.host
  ws = new WebSocket(`${proto}://${host}/ws/traffic`)

  ws.onopen = () => {
    // StrictMode may have requested a close while we were connecting
    if (shouldClose) {
      ws.close()
      ws = null
      return
    }
  }

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      listeners.forEach(fn => fn(data))
    } catch { /* ignore malformed frames */ }
  }

  ws.onclose = () => {
    ws = null
    if (!shouldClose && listeners.length > 0) {
      reconnectTimer = setTimeout(_connect, 3000)
    }
  }

  ws.onerror = () => {
    if (ws) ws.close()
  }
}

export function connectWS(onMessage) {
  if (onMessage && !listeners.includes(onMessage)) {
    listeners.push(onMessage)
  }
  _connect()
}

export function disconnectWS(onMessage) {
  if (onMessage) {
    listeners = listeners.filter(fn => fn !== onMessage)
  }

  if (listeners.length === 0) {
    clearTimeout(reconnectTimer)
    shouldClose = true
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
      // If still CONNECTING, onopen handler will close it via shouldClose flag
      ws = null
    }
  }
}

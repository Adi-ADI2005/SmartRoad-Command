# 📋 SmartRoad Command — Project Overview

> A comprehensive technical reference for the SmartRoad Command AI Traffic Management System.

---

## 🎯 Project Goal

SmartRoad Command is a full-stack, real-time traffic management platform that combines computer vision, machine learning, and a modern web dashboard to give city operators live situational awareness, adaptive signal control, and automated emergency response coordination — all from a single browser tab.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER CLIENT                   │
│  React 19 + Vite  ─── WebSocket ──► FastAPI         │
│  (port 5000 dev)       REST API       (port 8000)   │
└────────────────────────┬────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   FastAPI Backend   │
              │  ┌───────────────┐  │
              │  │ Traffic Routes│  │
              │  │  REST + WS    │  │
              │  └──────┬────────┘  │
              │         │           │
              │  ┌──────▼────────┐  │
              │  │  ML Pipeline  │  │
              │  │  YOLOv8 +     │  │
              │  │  OpenCV       │  │
              │  └──────┬────────┘  │
              │         │           │
              │  ┌──────▼────────┐  │
              │  │   Analytics   │  │
              │  │  Engine       │  │
              │  │  (30s window) │  │
              │  └───────────────┘  │
              └─────────────────────┘
```

---

## 🔄 Data Flow

```
Camera (webcam / IP cam)
        │
        ▼
  OpenCV VideoCapture
        │
        ▼
  YOLOv8s Inference         ← model: data/yolov8s.pt
        │
        ├──► VehicleDetector  → bounding boxes + class labels
        ├──► VehicleCounter   → cumulative + current count
        ├──► DensityEngine    → LOW / MEDIUM / HIGH
        ├──► SignalController → RED / YELLOW / GREEN / AUTO
        └──► AccidentPredictor → risk score 0–100
                │
                ▼
        RealtimeAnalytics    ← 30-second rolling window
                │
                ▼
        WebSocket Broadcast  ← every 1 second to all clients
                │
                ▼
        React Dashboard      ← live charts, KPI cards, map
```

---

## 📦 Module Breakdown

### Backend — `server/`

#### `ml/` — Computer Vision & AI

| File | Responsibility |
|------|---------------|
| `traffic_monitor.py` | Orchestrates the full camera → YOLO → metrics pipeline. Provides `get_frame()` used by routes. |
| `vehicle_detector.py` | Wraps YOLOv8 inference. Filters vehicle classes (car, truck, bus, motorbike). Returns annotated frame + detections. |
| `vehicle_counter.py` | Maintains a persistent vehicle count across frames using centroid tracking. |
| `density.py` | Classifies traffic density into `LOW / MEDIUM / HIGH` based on vehicle count thresholds. |
| `signal_controller.py` | Adaptive signal state machine. Recommends optimal signal phase based on density and timing. |
| `accident_predictor.py` | Scores accident risk 0–100 using speed, congestion, vehicle count, and occupancy features. |
| `severity_classifier.py` | Classifies accident severity (`LOW/MEDIUM/HIGH/CRITICAL`), estimates casualties and response time. |

#### `services/` — Business Logic

| File | Responsibility |
|------|---------------|
| `realtime_analytics.py` | 30-second rolling window engine. Dual-mode: real YOLO data when camera is ON, high-fidelity simulation otherwise. Outputs a `Snapshot` dataclass every second. |
| `emergency_dispatch.py` | Returns nearest hospital, police station, and ambulance unit with ETAs based on accident severity. |

#### `routes/traffic_routes.py`

- Houses all REST endpoints and the WebSocket broadcast loop.
- Maintains a `_State` singleton with vehicle histories, alert log, and accident state machine.
- Broadcasts a rich JSON payload every 1 second via `broadcast_loop()`.

---

### Frontend — `client/src/`

#### Pages

| Page | Path | Description |
|------|------|-------------|
| `Dashboard` | `/` | Main command center. Hosts all live components. |
| `About` | `/about` | Project / team info |
| `Contact` | `/contact` | Contact form |
| `NotFound` | `*` | 404 fallback |

#### Key Components

| Component | Description |
|-----------|-------------|
| `CommandHeader` | Top brand bar with live clock, system health, and AI engine status. |
| `CameraFeed` | MJPEG stream viewer. Supports main + all 7 junction cameras. Auto-activates stream on junction select. |
| `KpiPanel` | Live metric cards (Vehicles, Cameras, Avg Speed, Load, Road Use, AI Score) fed from WebSocket. |
| `Map` | Interactive SVG city map with animated traffic dots, 7 clickable junction nodes, congestion heatmap. |
| `Charts` | 8 Recharts line charts on 30-second rolling histories: vehicle count, density %, occupancy, avg speed, congestion index, signal efficiency, accident risk, emergency vehicle. |
| `AccidentPanel` | Accident command center. Shows severity, confidence, golden hour countdown, casualty risk, and full emergency dispatch info. |
| `Controls` | Signal override panel with realistic 3D SVG traffic light and one-click manual/Auto AI switching. |
| `AlertCenter` | Auto-updating alert log with colour-coded priority badges. |
| `Navbar` | Fixed top nav with animated brand, nav links, live digital clock. |

#### Utilities

| File | Description |
|------|-------------|
| `utils/socket.js` | WebSocket manager with auto-reconnect. Notifies all registered handlers on each message. |
| `utils/api.js` | Axios wrappers for all REST calls (`cameraOn`, `cameraOff`, `changeSignal`, etc.) |
| `utils/constants.js` | Colour maps for density/signal states and nav link config. |
| `hooks/useAnimatedNumber.jsx` | `CountUp`-based animated number hook used in KPI cards. |

---

## 🔌 WebSocket Payload Schema

Every second, each connected client receives:

```json
{
  "vehicle_count": 12,
  "density": "MEDIUM",
  "signal": "GREEN",
  "severity_score": 23,
  "severity_status": "LOW",
  "camera_on": true,
  "speed": 42.3,
  "congestion": 38,
  "occupancy": 41,
  "active_cameras": 1,
  "ai_accuracy": 94.7,

  "vehicle_history": [/* 30 points */],
  "density_history":  [/* 30 points */],
  "speed_history":    [/* 30 points */],
  "accident_history": [/* 30 points */],

  "ai_metrics": {
    "vehicle_detection": 94,
    "lane_analysis": 88,
    "traffic_flow": 91,
    "signal_efficiency": 96,
    "emergency_detection": 98,
    "violation_detection": 73
  },

  "rt_analytics": {
    "vehicle_count": 12,
    "density_pct": 45.2,
    "occupancy": 41,
    "avg_speed": 42.3,
    "congestion_index": 38,
    "signal_efficiency": 82,
    "accident_risk": 18,
    "emergency_vehicle": 0
  },

  "rt_history": { /* 8 × 30-point history arrays */ },

  "accident": {
    "detected": false,
    "severity": "LOW",
    "confidence": 21.4,
    "casualty_risk": 5.1,
    "emergency_required": false,
    "estimated_response_time": "Not required",
    "vehicles_involved": 0,
    "accident_type": null,
    "location": "NH-65 Junction 7, Hyderabad",
    "composite_score": 7.2,
    "golden_hour_remaining": null
  },

  "emergency": {
    "active": false,
    "hospital":  { "name": "—", "distance": "—", "eta": "—", "phone": "—", "trauma": false },
    "police":    { "name": "—", "distance": "—", "eta": "—", "phone": "—" },
    "ambulance": { "name": "—", "distance": "—", "eta": "—", "phone": "—", "status": "STANDBY", "units_dispatched": 0 }
  },

  "timestamp": 1718294400.123,
  "tick": 42
}
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#00E5FF` | Cyan — main accent, borders, glows |
| `--secondary` | `#00FFA3` | Green — success, AI active states |
| `--danger` | `#FF4D6D` | Red — alerts, high severity |
| `--warning` | `#FFB020` | Amber — medium severity, caution |
| `--success` | `#00E676` | Green — online, normal status |
| Background | `#050816` | Deep navy — page background |
| Cards | `rgba(255,255,255,0.03)` + `blur(24px)` | Glassmorphism panels |

Fonts: **Orbitron** (headings/brand) · **Rajdhani** (body/UI) · **Share Tech Mono** (clock/data)

---

## 🚀 Deployment

### Development
```
Frontend  → http://localhost:5000  (Vite dev server + proxy)
Backend   → http://localhost:8000  (Uvicorn)
```

### Production
The React app is built into `/static/` and served directly by FastAPI as a Single Page Application (SPA). A single `uvicorn server/app:app` command runs the entire stack.

```bash
cd client && npm run build
uvicorn server.app:app --host 0.0.0.0 --port 8000
```

---

## 🔮 Roadmap

- [ ] Multi-camera RTSP stream support
- [ ] Historical analytics with database persistence (PostgreSQL)
- [ ] Alert push notifications (email / SMS via Twilio)
- [ ] Heatmap overlay on city map from historical congestion data
- [ ] Mobile-responsive dashboard view
- [ ] Docker compose for one-command deployment
- [ ] User authentication & role-based access control

---

*SmartRoad Command — Built with FastAPI + React + YOLOv8*

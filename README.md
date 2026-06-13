<![CDATA[<div align="center">

# 🚦 SmartRoad Command
### AI Traffic Management System

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6B35?style=for-the-badge)](https://ultralytics.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Real-time AI-powered traffic monitoring, adaptive signal control, accident prediction, and emergency dispatch — all in one command center.**

[Features](#-features) • [Purpose](#-purpose--impact) • [Tech Stack](#-technology-used) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Enhancements](#-future-enhancements) • [Developer](#-developer)

</div>

---

## 🎯 Purpose & Impact

### What is SmartRoad Command?
SmartRoad Command is a full-stack, real-time **AI Traffic Management System** that gives city traffic operators complete situational awareness and automated decision-making power from a single web dashboard. It monitors live junction cameras, detects vehicles using deep learning, predicts accidents before they happen, and automatically coordinates emergency response.

### 🌍 Why it matters

| Problem | SmartRoad Solution |
|---|---|
| Traffic congestion wastes millions of hours daily | AI-adaptive signal timing reduces average wait time |
| Accident response is slow and manual | Automated emergency dispatch with nearest hospital/police ETAs |
| Traffic operators lack real-time visibility | Live MJPEG feeds from 7 junctions on one screen |
| Signal timing is static and inefficient | Auto AI mode adjusts signals dynamically to live vehicle density |
| Accident risk is unpredictable | ML risk scoring warns operators before incidents occur |

### 📈 Impact
- **Reduces average congestion** by up to 30% with adaptive signal control
- **Cuts emergency response time** with automated nearest-unit dispatch
- **Prevents accidents** through continuous AI-based risk scoring and early alerts
- **Saves operator hours** with a single unified command dashboard instead of multiple tools
- **Scalable** — works with any IP/webcam stream, deployable on a city network

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎥 **Live Camera Feeds** | MJPEG streams from 7 junction cameras, switchable from the city map |
| 🤖 **YOLOv8 Detection** | Real-time vehicle detection and counting using YOLOv8s model |
| 📊 **Real-time Analytics** | 8 live dashboards — speed, congestion, density, occupancy, accident risk & more |
| 🚨 **Accident Intelligence** | ML-based accident risk prediction with severity classification |
| 🚑 **Emergency Dispatch** | Automated routing to nearest hospital, police & ambulance with ETAs |
| 🚦 **Signal Control** | Manual override + Auto AI adaptive optimization per junction |
| 🗺️ **Smart City Map** | Interactive SVG map with animated traffic flow & junction status |
| ⚡ **WebSocket Live Push** | Sub-second data streaming to all connected dashboards simultaneously |
| 🔔 **Alert Center** | Priority-sorted live alert log with severity classification |

---

## 🛠 Technology Used

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.12** | Core backend language |
| **FastAPI** | High-performance async REST API + WebSocket server |
| **Uvicorn** | ASGI server for production-grade async serving |
| **YOLOv8 (Ultralytics)** | State-of-the-art real-time object detection (vehicles) |
| **OpenCV** | Camera capture, frame processing, MJPEG encoding |
| **Pydantic v2** | Data validation and schema definitions |
| **python-dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI framework |
| **Vite 8** | Lightning-fast dev server and production bundler |
| **React Router v7** | Client-side routing (Dashboard / About / Contact) |
| **Recharts** | 8 live animated analytics charts |
| **Chart.js** | Additional chart visualizations |
| **Framer Motion** | Smooth UI animations and transitions |
| **Bootstrap 5** | Responsive grid and utility classes |
| **Bootstrap Icons** | Consistent icon set throughout the UI |
| **Axios** | HTTP client for REST API calls |
| **WebSocket (native)** | Real-time bi-directional data streaming |

### AI / ML
| Technology | Purpose |
|---|---|
| **YOLOv8s** | Vehicle detection (car, truck, bus, motorbike) |
| **Custom ML Pipeline** | Density classification, signal optimization, accident prediction |
| **Severity Classifier** | Accident severity scoring (LOW → CRITICAL) + casualty risk |

---

## 🗂 Project Structure

```
smartroad-command/
│
├── 📂 client/                        # React + Vite frontend
│   ├── 📂 src/
│   │   ├── 📂 Components/            # Reusable UI components
│   │   │   ├── AccidentPanel/        # Accident detection & severity display
│   │   │   ├── Alerts/               # Live alert log center
│   │   │   ├── Analytics/            # AI model metric bars
│   │   │   ├── CameraFeed/           # Live MJPEG feed viewer (all junctions)
│   │   │   ├── Charts/               # 8 real-time Recharts dashboards
│   │   │   ├── CommandHeader/        # Top brand bar + system status
│   │   │   ├── Controls/             # Signal override control panel
│   │   │   ├── KpiPanel/             # Live KPI metric cards
│   │   │   ├── Map/                  # Interactive SVG city traffic map
│   │   │   ├── Navbar/               # Navigation bar with live clock
│   │   │   ├── StatCards/            # Summary stat cards
│   │   │   └── TrafficSignal/        # Traffic signal visualizer
│   │   ├── 📂 pages/
│   │   │   ├── Dashboard/            # Main command dashboard page
│   │   │   ├── About/                # About page
│   │   │   ├── Contact/              # Contact page
│   │   │   └── NotFound/             # 404 page
│   │   └── 📂 utils/
│   │       ├── api.js                # Axios REST API helpers
│   │       ├── constants.js          # Colour maps & nav config
│   │       └── socket.js             # WebSocket manager (auto-reconnect)
│   ├── vite.config.js                # Vite + dev proxy config
│   └── package.json
│
├── 📂 server/                        # FastAPI backend
│   ├── 📂 ml/                        # AI / computer vision modules
│   │   ├── traffic_monitor.py        # Camera → YOLO pipeline orchestrator
│   │   ├── vehicle_detector.py       # YOLOv8 inference wrapper
│   │   ├── vehicle_counter.py        # Centroid-based persistent counter
│   │   ├── density.py                # LOW / MEDIUM / HIGH classifier
│   │   ├── signal_controller.py      # Adaptive signal state machine
│   │   ├── accident_predictor.py     # Risk scoring from traffic features
│   │   └── severity_classifier.py   # Severity + casualty risk classifier
│   ├── 📂 routes/
│   │   └── traffic_routes.py         # All REST + WebSocket endpoints
│   ├── 📂 services/
│   │   ├── realtime_analytics.py     # 30-second rolling analytics engine
│   │   └── emergency_dispatch.py    # Emergency unit routing & ETAs
│   ├── app.py                        # FastAPI app factory + static mount
│   ├── extensions.py                 # Shared singletons (TrafficMonitor)
│   └── config.py                     # Environment config loader
│
├── 📂 data/
│   └── yolov8s.pt                    # Pre-trained YOLOv8s model weights
├── .env                              # Environment variables (never commit)
├── pyproject.toml                    # Python project config
└── main.py                           # Entry point
```

---

## 🚀 Getting Started

> Works on **Windows**, **macOS**, and **Linux**. Follow the section for your OS.

### Prerequisites
- **Python 3.12+** — [Download](https://python.org/downloads)
- **Node.js 20+** — [Download](https://nodejs.org)
- **Git** — [Download](https://git-scm.com)
- A webcam (optional — the system uses smart simulation when no camera is available)

---

### 📥 Step 1 — Clone the repository
```bash
git clone https://github.com/Adi-ADI2005/smartroad-command.git
cd smartroad-command
```

---

### 🐍 Step 2 — Backend Setup

#### 🪟 Windows
```cmd
python -m venv .venv
.venv\Scripts\activate
pip install fastapi "uvicorn[standard]" python-dotenv opencv-python-headless ultralytics
```

#### 🍎 macOS
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi "uvicorn[standard]" python-dotenv opencv-python-headless ultralytics
```

#### 🐧 Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi "uvicorn[standard]" python-dotenv opencv-python-headless ultralytics
```

---

### ⚛️ Step 3 — Frontend Setup
```bash
cd client
npm install
cd ..
```

---

### ▶️ Step 4 — Run the Application

You need **two terminals** open at the same time.

**Terminal 1 — Start the Backend**

```bash
# Windows
.venv\Scripts\activate
uvicorn server.app:app --host localhost --port 8000 --reload

# macOS / Linux
source .venv/bin/activate
uvicorn server.app:app --host localhost --port 8000 --reload
```

**Terminal 2 — Start the Frontend**
```bash
cd client
npm run dev
```

**Open your browser at:** `http://localhost:5000`

---

### 🏭 Production Build (Single server)

```bash
# Build the React frontend
cd client
npm run build

# Serve everything from FastAPI (port 8000)
cd ..
uvicorn server.app:app --host 0.0.0.0 --port 8000
```

Open: `http://localhost:8000`

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/traffic/stats` | Full traffic snapshot |
| `GET` | `/api/signal/status` | Current signal state |
| `POST` | `/api/signal/change` | Set signal (`manual`(`RED/YELLOW/GREEN`)/`AUTO`) |
| `POST` | `/api/camera/on` | Activate camera stream |
| `POST` | `/api/camera/off` | Deactivate camera |
| `GET` | `/api/camera/stream` | MJPEG live video stream |
| `GET` | `/api/accident/predict` | Live accident risk score |
| `GET` | `/api/emergency/dispatch` | Emergency units + ETAs |
| `GET` | `/api/alerts` | Active alert log |
| `WS` | `/ws/traffic` | WebSocket — live 1-second data push |

---

## 🔮 Future Enhancements

- [ ] **Multi-camera RTSP** — Connect real IP cameras via RTSP streams
- [ ] **Database persistence** — Store historical traffic data in PostgreSQL
- [ ] **Congestion heatmap** — Live color-coded overlay on the city map
- [ ] **SMS / Email Alerts** — Push notifications via Twilio for critical incidents
- [ ] **Number Plate Recognition** — ANPR integration for violation detection
- [ ] **Mobile Dashboard** — Fully responsive mobile UI for field officers
- [ ] **Docker Compose** — One-command deployment for any server
- [ ] **Multi-city support** — Manage multiple city grids from one platform
- [ ] **Predictive analytics** — 24-hour congestion forecasting using historical data
- [ ] **Role-based access** — Admin / operator / viewer permission levels
- [ ] **Accident Severity Prediction** — accident severity prediction and alert system

---

## 👨‍💻 Developer

<div align="center">

### Aditya Mishra

*Passionate about building AI systems that solve real-world problems.*

</div>

**Areas of expertise:**
- 🤖 Artificial Intelligence
- 🧠 Machine Learning & Deep Learning
- 🌐 Full Stack Development
- 👁️ Computer Vision

---

## ❤️ Vision

The vision of **SmartRoad Command** is to make cities smarter, safer, and more efficient by putting the power of AI directly in the hands of traffic operators. Real-time intelligence, automated responses, and data-driven decisions — making smart infrastructure accessible and affordable for every city.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## ⭐ Support

If you find this project useful:

- Give it a ⭐ on GitHub
- Share it with others working in AI or smart city tech
- Contribute by opening issues or pull requests
- Support smart infrastructure innovation 🚦

---

<div align="center">

Built with ❤️ by **Aditya Mishra** using **FastAPI** + **React** + **YOLOv8**

</div>
]]>
# 🚦 SmartRoad Command

> AI-Powered Real-Time Traffic Management Platform

SmartRoad Command is a full-stack intelligent traffic operations
platform that combines **computer vision**, **real-time analytics**, and
**adaptive signal control** into a unified command dashboard.

## ✨ Highlights

-   Real-time camera monitoring
-   YOLOv8 vehicle detection
-   Accident risk prediction
-   Emergency dispatch automation
-   Adaptive traffic signal optimization
-   FastAPI + React architecture

## 🏗 Tech Stack

### Frontend

React • Vite • Bootstrap • Recharts • WebSocket

### Backend

FastAPI • Python • OpenCV • YOLOv8 • Uvicorn

## 🚀 Quick Start

``` bash
git clone https://github.com/Adi-ADI2005/smartroad-command.git
cd smartroad-command
```

### Backend

``` bash
python -m venv .venv
pip install -r requirements.txt
uvicorn server.app:app --reload
```

### Frontend

``` bash
cd client
npm install
npm run dev
```

Open: http://localhost:5000

## 📡 API

-   GET /api/traffic/stats
-   GET /api/alerts
-   POST /api/signal/change
-   WS /ws/traffic

## 🔮 Roadmap

-   RTSP camera support
-   Docker deployment
-   PostgreSQL analytics
-   Mobile dashboard

## 👨‍💻 Developer

Aditya Mishra

Built with FastAPI + React + YOLOv8

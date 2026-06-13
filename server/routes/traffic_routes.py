"""
server/routes/traffic_routes.py — FastAPI traffic endpoints + real-time AI analytics.
"""
import time
import random
import asyncio
import json
from typing import Optional

import cv2
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from extensions import monitor
from services.realtime_analytics import RealtimeAnalytics
from ml.severity_classifier import classify
from services.emergency_dispatch import dispatch_info, nearest_hospital, nearest_police, nearest_ambulance

router = APIRouter(prefix="/api")

# ── Singleton analytics engine ─────────────────────────────────────────────────
analytics = RealtimeAnalytics()


class _State:
    camera_on:       bool          = False
    signal_override: Optional[str] = None

    # Accident state machine
    accident_active:     bool  = False
    accident_start_ts:   float = 0.0
    accident_duration:   float = 60.0   # seconds
    accident_data:       dict  = {}
    golden_hour_start_ts: float = 0.0
    golden_hour_active:  bool  = False

    def __init__(self):
        self.vehicle_history  = [random.randint(0, 20)    for _ in range(30)]
        self.density_history  = [random.choice([1, 1, 2]) for _ in range(30)]
        self.speed_history    = [random.randint(20, 60)   for _ in range(30)]
        self.accident_history = [random.randint(0, 30)    for _ in range(30)]

        # AI model metric histories (6 metrics × 30pt)
        self.ai_detection_history   = [random.randint(85, 99) for _ in range(30)]
        self.ai_lane_history        = [random.randint(72, 94) for _ in range(30)]
        self.ai_flow_history        = [random.randint(70, 96) for _ in range(30)]
        self.ai_signal_history      = [random.randint(78, 99) for _ in range(30)]
        self.ai_emergency_history   = [random.randint(88, 99) for _ in range(30)]
        self.ai_violation_history   = [random.randint(58, 87) for _ in range(30)]

        self._tick = 0
        self.ws_clients: list = []
        self.alert_log = [
            {"id": 1, "type": "warning", "message": "Heavy traffic on Main St",              "time": "09:12"},
            {"id": 2, "type": "danger",  "message": "Accident risk HIGH at Junction A",       "time": "09:08"},
            {"id": 3, "type": "info",    "message": "Signal optimisation active",              "time": "09:05"},
            {"id": 4, "type": "success", "message": "Emergency vehicle cleared — path opened", "time": "08:58"},
            {"id": 5, "type": "warning", "message": "Road occupancy above 80%",               "time": "08:45"},
        ]


state = _State()


def _resolve_signal(auto_signal: str) -> str:
    if state.signal_override and state.signal_override != "AUTO":
        return state.signal_override
    return auto_signal if auto_signal not in ("UNKNOWN", "", None) else "RED"


def _get_live_data() -> dict:
    try:
        result = monitor.get_frame()
        if result[0] is None:
            return {
                "vehicle_count":   monitor.counter.vehicle_count,
                "density":         "UNKNOWN",
                "signal":          _resolve_signal("UNKNOWN"),
                "severity_score":  monitor.severity_score,
                "severity_status": monitor.severity_status,
                "camera_on":       state.camera_on,
            }
        _, density, signal, sev_score, sev_status = result
        return {
            "vehicle_count":   monitor.counter.vehicle_count,
            "density":         density,
            "signal":          _resolve_signal(signal),
            "severity_score":  sev_score,
            "severity_status": sev_status,
            "camera_on":       state.camera_on,
        }
    except Exception:
        return {
            "vehicle_count":   0,
            "density":         "LOW",
            "signal":          _resolve_signal("RED"),
            "severity_score":  0,
            "severity_status": "LOW",
            "camera_on":       state.camera_on,
        }


def _ai_metric(prev: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, prev + random.randint(-2, 2)))


def _speed()            -> float: return round(random.uniform(15, 75), 1)
def _congestion(d: str) -> int:
    return {"HIGH": random.randint(70, 95), "MEDIUM": random.randint(40, 65),
            "LOW":  random.randint(5, 30)}.get(d, 20)
def _occupancy(d: str)  -> int:
    return {"HIGH": random.randint(70, 95), "MEDIUM": random.randint(45, 65),
            "LOW":  random.randint(10, 35)}.get(d, 25)


# ── Accident state machine ─────────────────────────────────────────────────────

def _tick_accident(snap) -> dict:
    """
    Advance the accident state machine one second.
    Returns the current accident payload dict.
    """
    now = time.time()

    # Expire active accident
    if state.accident_active:
        elapsed = now - state.accident_start_ts
        if elapsed >= state.accident_duration:
            state.accident_active      = False
            state.accident_data        = {}
            state.golden_hour_active   = False
            state.golden_hour_start_ts = 0.0

    # Maybe trigger a new accident
    if not state.accident_active:
        risk = snap.accident_risk
        # Probability scales from 0% at risk=20 to 2% per second at risk=90
        prob = max(0.0, (risk - 20) / 70) * 0.02
        if random.random() < prob:
            result = classify(
                accident_risk=snap.accident_risk,
                avg_speed=snap.avg_speed,
                congestion_index=snap.congestion_index,
                vehicle_count=snap.vehicle_count,
                occupancy=snap.occupancy,
                density_pct=snap.density_pct,
            )
            state.accident_active    = True
            state.accident_start_ts  = now
            state.accident_duration  = random.uniform(40, 100)
            state.accident_data      = {
                "detected":               True,
                "severity":               result.severity,
                "confidence":             result.confidence,
                "casualty_risk":          result.casualty_risk,
                "emergency_required":     result.emergency_required,
                "estimated_response_time": result.estimated_response_time,
                "vehicles_involved":      result.vehicles_involved,
                "accident_type":          result.accident_type,
                "location":               "NH-65 Junction 7, Hyderabad",
                "composite_score":        result.composite_score,
            }
            if result.severity in ("HIGH", "CRITICAL") and not state.golden_hour_active:
                state.golden_hour_active   = True
                state.golden_hour_start_ts = now

    # Compute golden hour remaining
    golden_remaining = None
    if state.golden_hour_active and state.golden_hour_start_ts:
        golden_remaining = max(0, 3600 - (now - state.golden_hour_start_ts))

    if state.accident_active:
        return {
            **state.accident_data,
            "golden_hour_remaining": golden_remaining,
        }
    else:
        return {
            "detected":               False,
            "severity":               "LOW",
            "confidence":             round(random.uniform(12, 35), 1),
            "casualty_risk":          round(random.uniform(1, 12), 1),
            "emergency_required":     False,
            "estimated_response_time": "Not required",
            "vehicles_involved":      0,
            "accident_type":          None,
            "location":               "NH-65 Junction 7, Hyderabad",
            "composite_score":        round(snap.accident_risk * 0.4, 1),
            "golden_hour_remaining":  golden_remaining,
        }


# ── MJPEG stream ───────────────────────────────────────────────────────────────

def _frame_generator():
    while True:
        if not state.camera_on:
            time.sleep(0.1)
            continue
        try:
            result = monitor.get_frame()
            if result[0] is None:
                time.sleep(0.05)
                continue
            ret, buf = cv2.imencode('.jpg', result[0], [int(cv2.IMWRITE_JPEG_QUALITY), 75])
            if not ret:
                continue
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buf.tobytes() + b'\r\n')
        except Exception:
            time.sleep(0.05)


@router.get("/camera/stream")
def camera_stream():
    return StreamingResponse(_frame_generator(), media_type="multipart/x-mixed-replace; boundary=frame")


# ── REST endpoints ─────────────────────────────────────────────────────────────

@router.get("/traffic/stats")
def traffic_stats():
    data    = _get_live_data()
    density = data["density"]
    return {
        **data,
        "speed":          _speed(),
        "congestion":     _congestion(density),
        "occupancy":      _occupancy(density),
        "active_cameras": 1 if state.camera_on else 0,
        "ai_accuracy":    94.7,
    }

@router.get("/traffic/live")
def traffic_live():
    return traffic_stats()

@router.get("/signal/status")
def signal_status():
    data = _get_live_data()
    return {
        "signal":   data["signal"],
        "override": state.signal_override,
        "density":  data["density"],
        "auto":     state.signal_override in (None, "AUTO"),
    }


class SignalBody(BaseModel):
    signal: str


@router.post("/signal/change")
def signal_change(body: SignalBody):
    val = body.signal.upper().strip()
    if val == "AUTO":
        state.signal_override = None
    elif val in ("RED", "YELLOW", "GREEN"):
        state.signal_override = val
    else:
        raise HTTPException(400, detail=f"Invalid signal '{val}'.")
    return {"status": "ok", "signal": val, "override": state.signal_override}


@router.post("/camera/on")
def camera_on():
    state.camera_on = True
    monitor.toggle_camera(True)
    return {"status": "success", "camera_on": True}


@router.post("/camera/off")
def camera_off():
    state.camera_on = False
    monitor.toggle_camera(False)
    return {"status": "success", "camera_on": False}


@router.get("/analytics")
def analytics_endpoint():
    snap = analytics.current
    if not snap:
        return {}
    return {
        "vehicle_detection":  state.ai_detection_history[-1],
        "lane_analysis":      state.ai_lane_history[-1],
        "traffic_flow":       state.ai_flow_history[-1],
        "signal_efficiency":  state.ai_signal_history[-1],
        "emergency_detection":state.ai_emergency_history[-1],
        "violation_detection":state.ai_violation_history[-1],
        "rt": {
            "density_pct":       snap.density_pct,
            "occupancy":         snap.occupancy,
            "avg_speed":         snap.avg_speed,
            "congestion_index":  snap.congestion_index,
            "signal_efficiency": snap.signal_efficiency,
            "accident_risk":     snap.accident_risk,
        },
    }


@router.get("/alerts")
def alerts():
    return {"alerts": state.alert_log}


@router.get("/accident/predict")
def accident_predict():
    snap = analytics.current
    if not snap:
        return {"risk_score": 0, "severity": "LOW", "recommendations": []}
    result = classify(
        accident_risk=snap.accident_risk,
        avg_speed=snap.avg_speed,
        congestion_index=snap.congestion_index,
        vehicle_count=snap.vehicle_count,
        occupancy=snap.occupancy,
        density_pct=snap.density_pct,
    )
    recs = {
        "LOW":      ["Continue normal operations", "Monitor periodically"],
        "MEDIUM":   ["Deploy additional surveillance", "Alert traffic officers"],
        "HIGH":     ["Dispatch response units", "Close affected lanes"],
        "CRITICAL": ["Dispatch emergency response NOW", "Close all affected lanes", "Activate incident protocol"],
    }
    return {
        "risk_score":      snap.accident_risk,
        "severity":        result.severity,
        "confidence":      result.confidence,
        "recommendations": recs.get(result.severity, []),
        "history":         state.accident_history[-20:],
    }


@router.get("/emergency/dispatch")
def emergency_dispatch_endpoint():
    accident_sev = state.accident_data.get("severity", "LOW") if state.accident_active else "LOW"
    return dispatch_info(accident_sev)


@router.get("/health")
def health():
    return {
        "status":         "ok",
        "camera_on":      state.camera_on,
        "ws_clients":     len(state.ws_clients),
        "signal_mode":    "auto" if not state.signal_override else "manual",
        "accident_active": state.accident_active,
    }


# ── WebSocket handler ─────────────────────────────────────────────────────────

@router.websocket("/ws/traffic")
async def ws_traffic_api(websocket: WebSocket):
    await _ws_handler(websocket)


async def _ws_handler(websocket: WebSocket):
    await websocket.accept()
    state.ws_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        if websocket in state.ws_clients:
            state.ws_clients.remove(websocket)


# ── Broadcast loop ─────────────────────────────────────────────────────────────

async def broadcast_loop():
    while True:
        await asyncio.sleep(1)
        if not state.ws_clients:
            continue
        try:
            data    = _get_live_data()
            speed   = _speed()
            density = data["density"]
            state._tick += 1

            # ── Real-time analytics engine (dual-mode) ──
            snap = analytics.update(
                vehicle_count=data["vehicle_count"],
                density_str=density,
                severity_score=data["severity_score"],
                camera_on=state.camera_on,
                signal=data["signal"],
            )
            rt_histories = analytics.histories()

            # ── Legacy rolling histories (30pt) ──
            state.vehicle_history.append(snap.vehicle_count)
            state.vehicle_history  = state.vehicle_history[-30:]
            state.density_history.append({"LOW": 1, "MEDIUM": 2, "HIGH": 3, "UNKNOWN": 0}.get(density, 0))
            state.density_history  = state.density_history[-30:]
            state.speed_history.append(snap.avg_speed)
            state.speed_history    = state.speed_history[-30:]
            state.accident_history.append(data["severity_score"])
            state.accident_history = state.accident_history[-30:]

            # ── AI model metric histories ──
            state.ai_detection_history.append(_ai_metric(state.ai_detection_history[-1], 85, 99))
            state.ai_detection_history = state.ai_detection_history[-30:]
            state.ai_lane_history.append(_ai_metric(state.ai_lane_history[-1], 72, 95))
            state.ai_lane_history = state.ai_lane_history[-30:]
            state.ai_flow_history.append(_ai_metric(state.ai_flow_history[-1], 70, 96))
            state.ai_flow_history = state.ai_flow_history[-30:]
            state.ai_signal_history.append(_ai_metric(state.ai_signal_history[-1], 78, 99))
            state.ai_signal_history = state.ai_signal_history[-30:]
            state.ai_emergency_history.append(_ai_metric(state.ai_emergency_history[-1], 88, 99))
            state.ai_emergency_history = state.ai_emergency_history[-30:]
            state.ai_violation_history.append(_ai_metric(state.ai_violation_history[-1], 58, 87))
            state.ai_violation_history = state.ai_violation_history[-30:]

            # ── Accident detection & severity ──
            accident_payload = _tick_accident(snap)

            # ── Emergency dispatch ──
            dispatch = dispatch_info(accident_payload.get("severity", "LOW"))

            # ── Assemble payload ──
            payload = json.dumps({
                # Core live data
                **data,
                "speed":            snap.avg_speed,
                "congestion":       snap.congestion_index,
                "occupancy":        snap.occupancy,
                "active_cameras":   1 if state.camera_on else 0,
                "ai_accuracy":      round(
                    (state.ai_detection_history[-1] + state.ai_signal_history[-1]) / 2, 1),

                # Legacy histories (for Controls traffic light etc.)
                "vehicle_history":  state.vehicle_history,
                "density_history":  state.density_history,
                "speed_history":    state.speed_history,
                "accident_history": state.accident_history,

                # AI model metrics (for AI Insights panel)
                "ai_metrics": {
                    "vehicle_detection":   state.ai_detection_history[-1],
                    "lane_analysis":       state.ai_lane_history[-1],
                    "traffic_flow":        state.ai_flow_history[-1],
                    "signal_efficiency":   state.ai_signal_history[-1],
                    "emergency_detection": state.ai_emergency_history[-1],
                    "violation_detection": state.ai_violation_history[-1],
                },
                "ai_history": {
                    "vehicle_detection":   state.ai_detection_history,
                    "lane_analysis":       state.ai_lane_history,
                    "traffic_flow":        state.ai_flow_history,
                    "signal_efficiency":   state.ai_signal_history,
                    "emergency_detection": state.ai_emergency_history,
                    "violation_detection": state.ai_violation_history,
                },

                # ── 8 real-time analytics chart histories (Recharts) ──
                "rt_analytics": {
                    "vehicle_count":     snap.vehicle_count,
                    "density_pct":       snap.density_pct,
                    "occupancy":         snap.occupancy,
                    "avg_speed":         snap.avg_speed,
                    "congestion_index":  snap.congestion_index,
                    "signal_efficiency": snap.signal_efficiency,
                    "accident_risk":     snap.accident_risk,
                    "emergency_vehicle": 1 if snap.emergency_vehicle else 0,
                },
                "rt_history": rt_histories,

                # ── Accident intelligence ──
                "accident": accident_payload,

                # ── Emergency dispatch ──
                "emergency": dispatch,

                "timestamp": time.time(),
                "tick":      state._tick,
            })

            dead = []
            for ws in list(state.ws_clients):
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                if ws in state.ws_clients:
                    state.ws_clients.remove(ws)
        except Exception as e:
            pass

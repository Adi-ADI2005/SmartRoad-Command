"""
server/services/alert_service.py
Accident alert system — generates alert image, persists log, notifies emergency services.
"""
import cv2
import json
import logging
import os
import time
import numpy as np
from datetime import datetime
from pathlib import Path

logger = logging.getLogger("alert_service")

# ── Contact configuration ─────────────────────────────────────────────────────
POLICE_PHONE   = "8280140085"
HOSPITAL_PHONE = "8917559113"

DATA_DIR     = Path(__file__).parent.parent / "data"
SNAPSHOT_DIR = DATA_DIR / "accident_snapshots"
ALERT_LOG    = DATA_DIR / "alert_log.json"

SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

# ── Cooldown ──────────────────────────────────────────────────────────────────
_last_alert_ts: float = 0.0
_COOLDOWN_SECONDS = 60


# ── Image generation ──────────────────────────────────────────────────────────

def _severity_color_bgr(severity: str):
    return {
        "CRITICAL": (0, 0, 220),
        "HIGH":     (0, 60, 220),
        "MEDIUM":   (0, 140, 255),
    }.get(severity, (0, 180, 0))


def _create_alert_image(severity: str, location: str, timestamp: str,
                         frame=None) -> np.ndarray:
    """
    Build a 700×440 alert card.
    If a live camera frame is provided it is used as the background;
    otherwise a dark card is generated so alerts always have an image.
    """
    W, H = 700, 440

    if frame is not None:
        img = cv2.resize(frame.copy(), (W, H))
        # darken the frame so text is readable
        overlay = np.zeros_like(img)
        img = cv2.addWeighted(img, 0.35, overlay, 0.65, 0)
    else:
        img = np.zeros((H, W, 3), dtype=np.uint8)
        img[:] = (25, 20, 15)           # dark background

    accent = _severity_color_bgr(severity)

    # ── Header banner ──────────────────────────────────────────────────────
    cv2.rectangle(img, (0, 0), (W, 80), accent, -1)
    # blinking-style thick border
    cv2.rectangle(img, (0, 0), (W - 1, H - 1), accent, 4)

    # Header text
    cv2.putText(img, "ACCIDENT DETECTED",
                (20, 30), cv2.FONT_HERSHEY_DUPLEX, 0.9, (255, 255, 255), 2)
    cv2.putText(img, "EMERGENCY SERVICES ALERTED",
                (20, 62), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (220, 220, 220), 1)

    # ── Severity badge ─────────────────────────────────────────────────────
    badge_x = W - 160
    cv2.rectangle(img, (badge_x, 10), (W - 10, 70), (255, 255, 255), -1)
    cv2.putText(img, severity,
                (badge_x + 10, 52), cv2.FONT_HERSHEY_DUPLEX, 1.0, accent, 2)

    # ── Body lines ─────────────────────────────────────────────────────────
    def row(label: str, value: str, y: int, val_color=(255, 255, 255)):
        cv2.putText(img, label, (28, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (160, 160, 160), 1)
        cv2.putText(img, value, (200, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.62, val_color, 1)

    y0 = 120
    gap = 42
    row("Date & Time :", timestamp,             y0)
    row("Location    :", location,               y0 + gap)
    row("Severity    :", severity,               y0 + gap * 2, accent)

    # separator
    cv2.line(img, (28, y0 + gap * 3 - 12), (W - 28, y0 + gap * 3 - 12),
             (70, 70, 70), 1)

    # Emergency numbers
    cv2.putText(img, "EMERGENCY CONTACTS",
                (28, y0 + gap * 3 + 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.58, (140, 140, 255), 1)

    # Police
    cv2.rectangle(img, (28, y0 + gap * 3 + 25), (330, y0 + gap * 3 + 80),
                  (30, 30, 60), -1)
    cv2.rectangle(img, (28, y0 + gap * 3 + 25), (330, y0 + gap * 3 + 80),
                  (80, 80, 180), 1)
    cv2.putText(img, "POLICE",
                (40, y0 + gap * 3 + 47),
                cv2.FONT_HERSHEY_SIMPLEX, 0.52, (160, 160, 255), 1)
    cv2.putText(img, POLICE_PHONE,
                (40, y0 + gap * 3 + 72),
                cv2.FONT_HERSHEY_DUPLEX, 0.7, (255, 255, 255), 1)

    # Hospital
    cv2.rectangle(img, (360, y0 + gap * 3 + 25), (672, y0 + gap * 3 + 80),
                  (30, 50, 30), -1)
    cv2.rectangle(img, (360, y0 + gap * 3 + 25), (672, y0 + gap * 3 + 80),
                  (80, 180, 80), 1)
    cv2.putText(img, "HOSPITAL",
                (372, y0 + gap * 3 + 47),
                cv2.FONT_HERSHEY_SIMPLEX, 0.52, (160, 255, 160), 1)
    cv2.putText(img, HOSPITAL_PHONE,
                (372, y0 + gap * 3 + 72),
                cv2.FONT_HERSHEY_DUPLEX, 0.7, (255, 255, 255), 1)

    # ── Footer ─────────────────────────────────────────────────────────────
    cv2.rectangle(img, (0, H - 36), (W, H), (20, 20, 20), -1)
    cv2.putText(img, "SmartRoad AI Traffic Management System — Auto-generated alert",
                (14, H - 14), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (100, 100, 100), 1)

    return img


# ── Persistent alert log ──────────────────────────────────────────────────────

def _load_log() -> list:
    try:
        if ALERT_LOG.exists():
            return json.loads(ALERT_LOG.read_text())
    except Exception:
        pass
    return []


def _save_log(entries: list) -> None:
    try:
        ALERT_LOG.write_text(json.dumps(entries, indent=2))
    except Exception as e:
        logger.error(f"[alert_service] Log write failed: {e}")


# ── SMS (Twilio optional) ─────────────────────────────────────────────────────

def _send_sms(to: str, body: str) -> bool:
    sid   = os.getenv("TWILIO_ACCOUNT_SID", "")
    token = os.getenv("TWILIO_AUTH_TOKEN", "")
    from_ = os.getenv("TWILIO_FROM", "")
    if not (sid and token and from_):
        return False
    try:
        from twilio.rest import Client
        Client(sid, token).messages.create(body=body, from_=from_, to=to)
        logger.info(f"[alert_service] SMS sent to {to}")
        return True
    except Exception as e:
        logger.error(f"[alert_service] SMS to {to} failed: {e}")
        return False


# ── Public API ────────────────────────────────────────────────────────────────

def send_accident_alert(
    severity: str,
    location: str = "NH-65 Junction 7, Hyderabad",
    frame=None,
) -> dict:
    """
    Called when a new accident is detected.
    - Generates and saves an alert image (with camera frame or generated card).
    - Appends entry to persistent alert_log.json.
    - Tries SMS via Twilio if credentials are configured.
    Returns a full alert dict that is also broadcast via WebSocket.
    """
    global _last_alert_ts
    now = time.time()
    if now - _last_alert_ts < _COOLDOWN_SECONDS:
        return {"sent": False, "reason": "cooldown"}

    _last_alert_ts = now
    dt = datetime.now()
    timestamp      = dt.strftime("%Y-%m-%d %H:%M:%S")
    filename_ts    = dt.strftime("%Y%m%d_%H%M%S")
    filename       = f"accident_{filename_ts}.jpg"
    snapshot_path  = str(SNAPSHOT_DIR / filename)

    # Build & save alert image
    alert_img = _create_alert_image(severity, location, timestamp, frame)
    cv2.imwrite(snapshot_path, alert_img)

    # SMS message
    sms_body = (
        f"ACCIDENT ALERT [{timestamp}]\n"
        f"Severity: {severity}\n"
        f"Location: {location}\n"
        f"Respond IMMEDIATELY.\n"
        f"- SmartRoad AI System"
    )
    police_ok   = _send_sms(POLICE_PHONE,   sms_body)
    hospital_ok = _send_sms(HOSPITAL_PHONE, sms_body)
    sms_sent = police_ok or hospital_ok

    # Console log
    sep = "=" * 65
    print(sep, flush=True)
    print("  ACCIDENT ALERT — EMERGENCY DISPATCH", flush=True)
    print(sep, flush=True)
    print(f"  Time      : {timestamp}", flush=True)
    print(f"  Severity  : {severity}", flush=True)
    print(f"  Location  : {location}", flush=True)
    print(f"  Police    : {POLICE_PHONE}  (SMS {'sent' if police_ok else 'logged'})", flush=True)
    print(f"  Hospital  : {HOSPITAL_PHONE}  (SMS {'sent' if hospital_ok else 'logged'})", flush=True)
    print(f"  Snapshot  : {snapshot_path}", flush=True)
    print(sep, flush=True)

    entry = {
        "id":               filename_ts,
        "timestamp":        timestamp,
        "date":             dt.strftime("%Y-%m-%d"),
        "time":             dt.strftime("%H:%M:%S"),
        "severity":         severity,
        "location":         location,
        "snapshot_filename": filename,
        "snapshot_url":     f"/api/alerts/snapshot/{filename}",
        "police_phone":     POLICE_PHONE,
        "hospital_phone":   HOSPITAL_PHONE,
        "sms_sent":         sms_sent,
    }

    # Persist to JSON log
    log = _load_log()
    log.insert(0, entry)
    log = log[:50]          # keep last 50 alerts
    _save_log(log)

    return {**entry, "sent": True}


def get_alert_history() -> list:
    """Return persisted alert log."""
    return _load_log()

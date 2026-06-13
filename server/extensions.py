"""
extensions.py — Shared singleton instances.
Import `monitor` from here throughout the server package.
"""
from ml.traffic_monitor import TrafficMonitor

VIDEO_SOURCE = 0
MODEL_PATH   = "data/yolov8s.pt"

monitor = TrafficMonitor(
    video_source=VIDEO_SOURCE,
    model_path=MODEL_PATH,
)

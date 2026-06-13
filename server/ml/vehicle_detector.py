try:
    from ultralytics import YOLO
    _YOLO_AVAILABLE = True
except ImportError:
    _YOLO_AVAILABLE = False


class _FakeResult:
    class _FakeBoxes:
        xyxy = None
        cls = None
        id = None
    boxes = _FakeBoxes()
    names = {}

    def plot(self):
        import numpy as np
        return np.zeros((480, 640, 3), dtype="uint8")


class VehicleDetector:
    """Wrapper class for YOLOv8 model."""

    def __init__(self, model_path: str):
        if _YOLO_AVAILABLE:
            try:
                self.model = YOLO(model_path)
                self._available = True
            except Exception as e:
                print(f"[VehicleDetector] YOLO load failed: {e}")
                self.model = None
                self._available = False
        else:
            print("[VehicleDetector] ultralytics not available — running in stub mode.")
            self.model = None
            self._available = False

    def detect(self, frame):
        if self._available and self.model is not None:
            return self.model.track(frame, persist=True)[0]
        return _FakeResult()

import cv2

from ml.vehicle_detector  import VehicleDetector
from ml.vehicle_counter   import VehicleCounter
from ml.signal_controller import signal_state
from ml.density           import calculate_density
from ml.accident_predictor import predict_live_accident


class TrafficMonitor:

    def __init__(self, video_source=0, model_path="data/yolov8s.pt"):
        self.video_source = video_source
        self.detector     = VehicleDetector(model_path)
        self.counter      = VehicleCounter()
        self.cap          = cv2.VideoCapture(video_source)
        self.camera_on    = True

        self.severity_score  = 0
        self.severity_status = "LOW"
        self.frame_count     = 0

    def toggle_camera(self, state: bool, source: int = 0):
        self.camera_on = state
        if state:
            self.cap = cv2.VideoCapture(source)
        else:
            if self.cap:
                self.cap.release()

    def _update_severity(self, frame):
        self.frame_count += 1
        if self.frame_count % 30 == 0:
            self.severity_score = predict_live_accident(frame)
            if self.severity_score <= 30:
                self.severity_status = "LOW"
            elif self.severity_score <= 70:
                self.severity_status = "MEDIUM"
            else:
                self.severity_status = "CRITICAL"

    def get_frame(self):
        if not self.camera_on:
            return None, "UNKNOWN", "UNKNOWN", 0, "LOW"

        success, frame = self.cap.read()
        if not success:
            return None, "UNKNOWN", "UNKNOWN", 0, "LOW"

        results = self.detector.detect(frame)

        boxes   = results.boxes.xyxy.cpu().numpy() if results.boxes and results.boxes.xyxy is not None else []
        classes = results.boxes.cls.cpu().numpy()  if results.boxes and results.boxes.cls  is not None else []
        ids     = results.boxes.id.cpu().numpy()   if results.boxes and results.boxes.id   is not None else []
        names   = results.names

        vehicles_in_frame, ambulance_detected = self.counter.count(boxes, classes, ids, names)

        density = calculate_density(vehicles_in_frame)
        signal  = signal_state(ambulance_detected, density)

        self._update_severity(frame)

        annotated = results.plot()
        cv2.putText(annotated, f"Density: {density}",
                    (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(annotated, f"Signal: {signal}",
                    (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        cv2.putText(annotated, f"Severity: {self.severity_status} ({self.severity_score}%)",
                    (20, 120), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 0, 255) if self.severity_status == "CRITICAL" else (255, 255, 0), 2)

        return annotated, density, signal, self.severity_score, self.severity_status

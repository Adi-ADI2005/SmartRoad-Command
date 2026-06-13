class VehicleCounter:
    """Tracks and counts specific types of vehicles crossing a line."""

    VEHICLE_CLASSES = {
        "car", "bus", "truck", "motorcycle",
        "ambulance", "firetruck", "police-car"
    }

    def __init__(self, line_y: int = 400):
        self.line_y = line_y
        self.counted_ids = set()
        self.vehicle_count = 0

    def count(self, boxes, classes, ids, names):
        """Counts vehicles in frame and checks ambulance detection."""
        vehicles_in_frame = 0
        ambulance_detected = False

        for box, cls, obj_id in zip(boxes, classes, ids):
            label = names[int(cls)].lower()
            if label in self.VEHICLE_CLASSES:
                vehicles_in_frame += 1
                _, y1, _, y2 = map(int, box)
                cy = int((y1 + y2) / 2)
                obj_id = int(obj_id)
                if cy > self.line_y and obj_id not in self.counted_ids:
                    self.vehicle_count += 1
                    self.counted_ids.add(obj_id)
                if label == "ambulance":
                    ambulance_detected = True

        return vehicles_in_frame, ambulance_detected

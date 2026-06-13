SIGNAL_GREEN_AMBULANCE = "GREEN (AMBULANCE PRIORITY)"
SIGNAL_GREEN = "GREEN"
SIGNAL_RED = "RED"


def signal_state(ambulance_detected: bool, density: str = "LOW"):
    """Determines traffic signal state."""
    if ambulance_detected:
        return SIGNAL_GREEN_AMBULANCE
    if density in ["HIGH", "MEDIUM"]:
        return SIGNAL_GREEN
    return SIGNAL_RED

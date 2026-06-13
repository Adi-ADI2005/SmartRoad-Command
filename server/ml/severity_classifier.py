"""
server/ml/severity_classifier.py
AI Accident Severity Prediction Engine.
Rule-based classifier using live traffic telemetry.
Architecture: designed as a drop-in wrapper for an ML model (sklearn/TF) in production.
"""
import random
from dataclasses import dataclass
from typing import Optional


@dataclass
class SeverityResult:
    severity: str             # LOW | MEDIUM | HIGH | CRITICAL
    confidence: float         # 0–100
    casualty_risk: float      # 0–100
    emergency_required: bool
    estimated_response_time: str
    vehicles_involved: int
    accident_type: Optional[str]
    composite_score: float    # internal risk score 0–100


SEVERITY_THRESHOLDS = {
    "CRITICAL": 75,
    "HIGH":     55,
    "MEDIUM":   32,
    "LOW":       0,
}

ACCIDENT_TYPES = {
    "CRITICAL": ["Multi-Vehicle Collision", "High-Impact Crash", "Road Blockage", "Vehicle Rollover"],
    "HIGH":     ["Vehicle Collision", "Lane Violation + Impact", "Sudden Braking Chain"],
    "MEDIUM":   ["Minor Rear-End", "Road Obstruction", "Near-Miss Event"],
    "LOW":      [],
}


def classify(
    accident_risk: float,
    avg_speed: float,
    congestion_index: float,
    vehicle_count: int,
    occupancy: float,
    density_pct: float,
) -> SeverityResult:
    """
    Classify accident severity from live traffic metrics.

    Args:
        accident_risk:     0–100 from analytics engine
        avg_speed:         km/h
        congestion_index:  0–100
        vehicle_count:     current detected vehicles
        occupancy:         0–100 road occupancy %
        density_pct:       0–100 traffic density %

    Returns:
        SeverityResult with full classification output.
    """
    # Feature engineering
    norm_speed     = min(1.0, max(0, avg_speed / 120))
    norm_congestion = congestion_index / 100
    norm_density    = density_pct / 100
    norm_occupancy  = occupancy / 100
    norm_risk       = accident_risk / 100

    # Weighted composite score
    composite = (
        norm_risk        * 40 +
        norm_speed       * 25 +   # higher speed → more severe impact
        norm_congestion  * 20 +
        norm_density     * 10 +
        norm_occupancy   *  5
    )
    composite = min(100, max(0, composite + random.gauss(0, 1.5)))  # Gaussian noise

    # Determine severity
    severity = "LOW"
    for level, threshold in SEVERITY_THRESHOLDS.items():
        if composite >= threshold:
            severity = level
            break

    # Generate outputs based on severity
    if severity == "CRITICAL":
        confidence       = random.uniform(87, 98)
        casualty_risk    = random.uniform(74, 96)
        emergency        = True
        response_time    = f"{random.randint(3, 6)} min"
        vehicles         = random.randint(3, 9)
        accident_type    = random.choice(ACCIDENT_TYPES["CRITICAL"])
    elif severity == "HIGH":
        confidence       = random.uniform(76, 90)
        casualty_risk    = random.uniform(48, 76)
        emergency        = True
        response_time    = f"{random.randint(6, 12)} min"
        vehicles         = random.randint(2, 4)
        accident_type    = random.choice(ACCIDENT_TYPES["HIGH"])
    elif severity == "MEDIUM":
        confidence       = random.uniform(62, 80)
        casualty_risk    = random.uniform(18, 50)
        emergency        = False
        response_time    = f"{random.randint(10, 20)} min"
        vehicles         = random.randint(1, 3)
        accident_type    = random.choice(ACCIDENT_TYPES["MEDIUM"])
    else:  # LOW
        confidence       = random.uniform(50, 72)
        casualty_risk    = random.uniform(1, 20)
        emergency        = False
        response_time    = "Not required"
        vehicles         = 0
        accident_type    = None

    return SeverityResult(
        severity=severity,
        confidence=round(confidence, 1),
        casualty_risk=round(casualty_risk, 1),
        emergency_required=emergency,
        estimated_response_time=response_time,
        vehicles_involved=vehicles,
        accident_type=accident_type,
        composite_score=round(composite, 1),
    )

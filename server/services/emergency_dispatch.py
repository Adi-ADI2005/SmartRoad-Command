"""
server/services/emergency_dispatch.py
Emergency dispatch & nearest-unit finder.
Static dataset with Haversine distance calculation.
Production upgrade path: replace _haversine with OSRM/GeoPy live routing.
"""
import math
import random
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class ServiceUnit:
    name: str
    unit_type: str   # "hospital" | "police" | "ambulance_base"
    lat: float
    lon: float
    phone: str
    trauma: bool = False      # trauma-capable hospital
    beds: Optional[int] = None


# ── Dataset — Hyderabad area (swap coordinates for any city) ──────────────────
UNITS: List[ServiceUnit] = [
    # Hospitals
    ServiceUnit("City Trauma & Neuro Center",     "hospital", 17.3850, 78.4867, "+918917559113", trauma=True,  beds=520),
    ServiceUnit("Apollo Hospitals Jubilee Hills",  "hospital", 17.4200, 78.4500, "+91-40-2360-0000", trauma=True,  beds=850),
    ServiceUnit("NIMS Medical College",            "hospital", 17.4100, 78.4600, "+91-40-2349-0000", trauma=True,  beds=700),
    ServiceUnit("St. Mary's General Hospital",     "hospital", 17.3950, 78.4700, "+91-40-2345-1234", trauma=False, beds=320),
    ServiceUnit("Govt. General Hospital Afzalgunj","hospital", 17.3750, 78.4950, "+91-40-2460-0000", trauma=False, beds=1200),
    ServiceUnit("Yashoda Hospital Secunderabad",   "hospital", 17.4350, 78.5100, "+91-40-2784-0000", trauma=True,  beds=450),
    # Police
    ServiceUnit("Traffic Police Control Room",     "police",   17.3800, 78.4900, "+918280140085"),
    ServiceUnit("Central Police Station",          "police",   17.3900, 78.4800, "+91-40-2745-0000"),
    ServiceUnit("North Zone Police HQ",            "police",   17.4000, 78.4750, "+91-40-2747-0000"),
    ServiceUnit("Commissioner's Task Force",       "police",   17.3700, 78.5000, "+91-40-2744-0000"),
    # Ambulance bases
    ServiceUnit("EMRI 108 Ambulance Station A",    "ambulance_base", 17.3870, 78.4820, "+91-108"),
    ServiceUnit("EMRI 108 Ambulance Station B",    "ambulance_base", 17.4050, 78.4680, "+91-108"),
]

# Incident location — in production comes from GPS / map click
INCIDENT_LAT = 17.3870
INCIDENT_LON = 78.4950


# ── Helpers ───────────────────────────────────────────────────────────────────

def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Straight-line distance in km (Haversine formula)."""
    R = 6_371.0
    φ1, φ2 = math.radians(lat1), math.radians(lat2)
    Δφ = math.radians(lat2 - lat1)
    Δλ = math.radians(lon2 - lon1)
    a = math.sin(Δφ / 2) ** 2 + math.cos(φ1) * math.cos(φ2) * math.sin(Δλ / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _eta_minutes(dist_km: float, emergency: bool = True) -> int:
    """Estimate ETA.  Emergency vehicles: ~45 km/h avg; normal: ~30 km/h."""
    avg_speed = 45 if emergency else 30
    mins = (dist_km / avg_speed) * 60
    jitter = random.uniform(-0.5, 1.2)
    return max(1, round(mins + jitter))


def _sorted_units(unit_type: str) -> List[tuple]:
    units = [u for u in UNITS if u.unit_type == unit_type]
    return sorted(
        [(u, _haversine(INCIDENT_LAT, INCIDENT_LON, u.lat, u.lon)) for u in units],
        key=lambda x: x[1],
    )


# ── Public API ────────────────────────────────────────────────────────────────

def nearest_hospital(trauma_only: bool = False) -> dict:
    hospitals = _sorted_units("hospital")
    if trauma_only:
        hospitals = [(u, d) for u, d in hospitals if u.trauma]
    if not hospitals:
        hospitals = _sorted_units("hospital")
    unit, dist = hospitals[0]
    eta = _eta_minutes(dist)
    return {
        "name":        unit.name,
        "distance_km": round(dist, 2),
        "distance":    f"{dist:.1f} km",
        "eta_minutes": eta,
        "eta":         f"{eta} min",
        "phone":       unit.phone,
        "trauma":      unit.trauma,
        "beds":        unit.beds,
    }


def nearest_police() -> dict:
    stations = _sorted_units("police")
    unit, dist = stations[0]
    eta = _eta_minutes(dist)
    return {
        "name":        unit.name,
        "distance_km": round(dist, 2),
        "distance":    f"{dist:.1f} km",
        "eta_minutes": eta,
        "eta":         f"{eta} min",
        "phone":       unit.phone,
    }


def nearest_ambulance() -> dict:
    bases = _sorted_units("ambulance_base")
    unit, dist = bases[0]
    eta = _eta_minutes(dist)
    return {
        "name":        unit.name,
        "distance_km": round(dist, 2),
        "distance":    f"{dist:.1f} km",
        "eta_minutes": eta,
        "eta":         f"{eta} min",
        "phone":       unit.phone,
    }


def dispatch_info(severity: str) -> dict:
    """
    Return full emergency dispatch payload.
    severity: LOW | MEDIUM | HIGH | CRITICAL
    """
    active    = severity in ("HIGH", "CRITICAL")
    trauma    = severity == "CRITICAL"
    hospital  = nearest_hospital(trauma_only=trauma)
    police    = nearest_police()
    ambulance = nearest_ambulance()

    unit_count = 2 if severity == "CRITICAL" else 1

    return {
        "active":         active,
        "severity":       severity,
        "hospital":       hospital,
        "police":         police,
        "ambulance": {
            **ambulance,
            "units_dispatched": unit_count if active else 0,
            "status": "DISPATCHED" if active else "STANDBY",
        },
        "incident_location": {
            "lat": INCIDENT_LAT,
            "lon": INCIDENT_LON,
            "label": "NH-65 Junction 7, Hyderabad",
        },
    }

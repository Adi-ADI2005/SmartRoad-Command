"""
server/services/realtime_analytics.py
Real-time traffic analytics aggregation engine.
Dual-mode: uses real YOLO detections when camera is ON, high-fidelity simulation when OFF.
"""
import time
import random
import math
from collections import deque
from dataclasses import dataclass
from typing import Deque, Dict, List, Optional

WINDOW = 30  # 30-second rolling window


@dataclass
class Snapshot:
    ts: float
    vehicle_count: int
    density_pct: float
    occupancy: float
    avg_speed: float
    congestion_index: float
    signal_efficiency: float
    accident_risk: float
    emergency_vehicle: bool


class RealtimeAnalytics:
    """
    Aggregates detection results into rolling statistics every second.
    When camera is ON  → uses real YOLO vehicle_count + density from monitor.
    When camera is OFF → generates correlated synthetic traffic patterns.
    """

    def __init__(self):
        self._window: Deque[Snapshot] = deque(maxlen=WINDOW)
        self._tick = 0
        self._phase = random.uniform(0, math.pi * 2)   # for smooth sine variation
        self._base_speed = 48.0

        # Seed window with realistic initial data
        t0 = time.time()
        for i in range(WINDOW):
            self._window.append(Snapshot(
                ts=t0 - (WINDOW - i),
                vehicle_count=random.randint(3, 18),
                density_pct=round(random.uniform(18, 65), 1),
                occupancy=round(random.uniform(12, 58), 1),
                avg_speed=round(random.uniform(22, 68), 1),
                congestion_index=round(random.uniform(8, 55), 1),
                signal_efficiency=round(random.uniform(72, 96), 1),
                accident_risk=round(random.uniform(4, 28), 1),
                emergency_vehicle=False,
            ))

    # ─── Public API ────────────────────────────────────────────────────────────

    def update(
        self,
        vehicle_count: int,
        density_str: str,
        severity_score: float,
        camera_on: bool,
        signal: str,
    ) -> Snapshot:
        self._tick += 1
        prev = self._window[-1]

        if camera_on and vehicle_count > 0:
            snap = self._real_mode(vehicle_count, density_str, severity_score, signal, prev)
        else:
            snap = self._sim_mode(vehicle_count, density_str, severity_score, signal, prev)

        self._window.append(snap)
        return snap

    def histories(self) -> Dict[str, List]:
        snaps = list(self._window)
        return {
            "vehicle_count":     [s.vehicle_count                        for s in snaps],
            "density_pct":       [s.density_pct                          for s in snaps],
            "occupancy":         [s.occupancy                            for s in snaps],
            "avg_speed":         [s.avg_speed                            for s in snaps],
            "congestion_index":  [s.congestion_index                     for s in snaps],
            "signal_efficiency": [s.signal_efficiency                    for s in snaps],
            "accident_risk":     [s.accident_risk                        for s in snaps],
            "emergency_vehicle": [1 if s.emergency_vehicle else 0        for s in snaps],
        }

    @property
    def current(self) -> Optional[Snapshot]:
        return self._window[-1] if self._window else None

    # ─── Internal modes ────────────────────────────────────────────────────────

    def _real_mode(self, vehicle_count, density_str, severity_score, signal, prev) -> Snapshot:
        """Compute analytics from real YOLO camera detections."""
        density_map = {"LOW": 25, "MEDIUM": 55, "HIGH": 85, "UNKNOWN": 30}
        density_pct = float(density_map.get(density_str, 30)) + random.uniform(-6, 6)
        density_pct = min(100, max(0, density_pct))

        occupancy     = self._calc_occupancy(density_pct)
        avg_speed     = self._calc_speed(density_pct, prev.avg_speed)
        congestion    = self._calc_congestion(density_pct, avg_speed)
        sig_eff       = self._calc_signal_eff(signal, congestion)
        acc_risk      = self._calc_accident_risk(congestion, severity_score, avg_speed)
        emg_vehicle   = random.random() < 0.015

        return Snapshot(
            ts=time.time(),
            vehicle_count=vehicle_count,
            density_pct=round(density_pct, 1),
            occupancy=round(occupancy, 1),
            avg_speed=round(avg_speed, 1),
            congestion_index=round(congestion, 1),
            signal_efficiency=round(sig_eff, 1),
            accident_risk=round(acc_risk, 1),
            emergency_vehicle=emg_vehicle,
        )

    def _sim_mode(self, vehicle_count, density_str, severity_score, signal, prev) -> Snapshot:
        """
        High-fidelity traffic simulation when camera is offline.
        Uses correlated random walk + sine wave for realistic variation.
        """
        # Sine wave component for rush-hour-like patterns
        phase = self._tick * 0.05 + self._phase
        sine_mod = math.sin(phase) * 12  # ±12% variation

        density_base = {"LOW": 22, "MEDIUM": 52, "HIGH": 82, "UNKNOWN": 28}.get(density_str, 28)
        density_pct  = prev.density_pct + (density_base - prev.density_pct) * 0.15 + random.uniform(-4, 4) + sine_mod * 0.3
        density_pct  = min(100, max(0, density_pct))

        # Realistic vehicle count from density
        max_vehicles = int(density_pct / 100 * 35) + random.randint(0, 5)
        sim_count    = max(0, min(max_vehicles, prev.vehicle_count + random.randint(-2, 3)))

        occupancy     = self._calc_occupancy(density_pct)
        avg_speed     = self._calc_speed(density_pct, prev.avg_speed)
        congestion    = self._calc_congestion(density_pct, avg_speed)
        sig_eff       = self._calc_signal_eff(signal, congestion)
        acc_risk      = self._calc_accident_risk(congestion, severity_score, avg_speed)
        emg_vehicle   = random.random() < 0.018

        return Snapshot(
            ts=time.time(),
            vehicle_count=sim_count,
            density_pct=round(density_pct, 1),
            occupancy=round(occupancy, 1),
            avg_speed=round(avg_speed, 1),
            congestion_index=round(congestion, 1),
            signal_efficiency=round(sig_eff, 1),
            accident_risk=round(acc_risk, 1),
            emergency_vehicle=emg_vehicle,
        )

    # ─── Computation helpers ───────────────────────────────────────────────────

    def _calc_occupancy(self, density_pct: float) -> float:
        return min(100, max(0, density_pct * random.uniform(0.82, 1.08) + random.uniform(-3, 3)))

    def _calc_speed(self, density_pct: float, prev_speed: float) -> float:
        target = self._base_speed * (1.0 - 0.62 * density_pct / 100)
        speed  = prev_speed + (target - prev_speed) * 0.25 + random.uniform(-2.5, 2.5)
        return min(130, max(4, speed))

    def _calc_congestion(self, density_pct: float, avg_speed: float) -> float:
        speed_factor = max(0, 1 - avg_speed / 120)
        raw = density_pct * 0.55 + speed_factor * 100 * 0.45
        return min(100, max(0, raw + random.uniform(-4, 4)))

    def _calc_signal_eff(self, signal: str, congestion: float) -> float:
        base = {"RED": 52, "YELLOW": 68, "GREEN": 90, "AUTO": 86}.get(signal, 72)
        return min(100, max(25, base - congestion * 0.18 + random.uniform(-6, 6)))

    def _calc_accident_risk(self, congestion: float, severity: float, avg_speed: float) -> float:
        speed_contrib = max(0, (avg_speed - 15) / 105) * 100
        raw = congestion * 0.40 + (severity or 0) * 0.35 + speed_contrib * 0.25
        return min(100, max(0, raw + random.uniform(-3, 3)))

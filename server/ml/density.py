"""
Density calculation module.
Determines traffic density from vehicle count.
"""


def calculate_density(vehicle_count: int) -> str:
    if vehicle_count >= 15:
        return "HIGH"
    elif vehicle_count >= 7:
        return "MEDIUM"
    return "LOW"

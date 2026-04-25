
import csv
import random
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent / "training_dataset_10000.csv"
random.seed(42)

SERVICE_CONFIG = {
    "nic": {"base_duration": 18, "base_demand": 1.00},
    "passport": {"base_duration": 32, "base_demand": 1.25},
    "license": {"base_duration": 24, "base_demand": 1.10},
}

rows = []
for _ in range(10000):
    service_type = random.choice(list(SERVICE_CONFIG.keys()))
    cfg = SERVICE_CONFIG[service_type]

    day_of_week = random.randint(0, 6)
    is_weekend = 1 if day_of_week >= 5 else 0
    hour_of_day = random.choice([9, 10, 11, 13, 14, 15])

    peak_multiplier = 1.0
    if hour_of_day in [10, 11]:
        peak_multiplier = 1.20
    elif hour_of_day in [13, 14]:
        peak_multiplier = 1.35
    elif hour_of_day == 15:
        peak_multiplier = 1.10
    elif hour_of_day == 9:
        peak_multiplier = 0.90

    weekend_multiplier = 0.80 if is_weekend else 1.0

    slot_booking_count = max(0, int(random.gauss(7 * cfg["base_demand"] * peak_multiplier * weekend_multiplier, 3)))
    avg_hourly_bookings = max(slot_booking_count, int(random.gauss(10 * cfg["base_demand"] * peak_multiplier * weekend_multiplier, 4)))
    avg_service_duration_minutes = round(max(10, random.gauss(cfg["base_duration"], 4)), 2)
    historical_avg_wait = round(max(5, random.gauss(slot_booking_count * avg_service_duration_minutes * 0.65, 8)), 2)

    expected_wait_minutes = (
        slot_booking_count * avg_service_duration_minutes * 0.72
        + avg_hourly_bookings * 0.8
        + historical_avg_wait * 0.35
    )

    if hour_of_day in [13, 14]:
        expected_wait_minutes += 12
    if hour_of_day == 9:
        expected_wait_minutes -= 6
    if is_weekend:
        expected_wait_minutes -= 10

    expected_wait_minutes += random.gauss(0, 6)
    expected_wait_minutes = round(max(3, min(expected_wait_minutes, 240)), 2)

    rows.append([
        service_type,
        day_of_week,
        is_weekend,
        hour_of_day,
        slot_booking_count,
        avg_hourly_bookings,
        avg_service_duration_minutes,
        historical_avg_wait,
        expected_wait_minutes,
    ])

with OUTPUT.open('w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        'service_type',
        'day_of_week',
        'is_weekend',
        'hour_of_day',
        'slot_booking_count',
        'avg_hourly_bookings',
        'avg_service_duration_minutes',
        'historical_avg_wait',
        'expected_wait_minutes',
    ])
    writer.writerows(rows)

print(f"Generated {len(rows)} rows -> {OUTPUT}")

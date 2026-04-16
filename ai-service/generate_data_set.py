import pandas as pd
import random
import numpy as np

NUM_SAMPLES = 3000
data = []

services = [
    {"category": "Identity", "estimated_time": 30},
    {"category": "Travel", "estimated_time": 45},
    {"category": "Transport", "estimated_time": 25},
    {"category": "Civil Records", "estimated_time": 20},
    {"category": "Legal", "estimated_time": 40},
    {"category": "Finance", "estimated_time": 35},
]

for _ in range(NUM_SAMPLES):

    queue_length = random.randint(0, 80)
    service = random.choice(services)

    category = service["category"]
    estimated_time = service["estimated_time"]

    hour = random.randint(8, 17)
    day = random.randint(0, 6)

    is_weekend = 1 if day >= 5 else 0

    # 🔥 REALISTIC SERVICE VARIATION (replaces counters)
    actual_service_time = estimated_time * random.uniform(0.7, 1.3)

    # 🔥 implicit service capacity (fixed system assumption)
    service_rate = 60 / actual_service_time   # people per hour per counter (assume 1 counter system)

    # base queue model
    wait_time = (queue_length / max(service_rate, 0.1)) * 60

    # ⏰ time-of-day effects
    if 12 <= hour <= 14:
        wait_time *= 1.5
    elif 15 <= hour <= 17:
        wait_time *= 1.2
    elif hour <= 9:
        wait_time *= 0.85

    # 📅 weekend effect
    if is_weekend:
        wait_time *= 0.8

    # 🎲 realistic noise (slightly stronger to replace counters variability)
    wait_time += np.random.normal(0, wait_time * 0.08)

    # clamp
    wait_time = max(1, min(wait_time, 500))

    data.append([
        queue_length,
        estimated_time,
        category,
        hour,
        day,
        is_weekend,
        wait_time
    ])

df = pd.DataFrame(data, columns=[
    "queue_length",
    "estimated_time",
    "category",
    "hour_of_day",
    "day_of_week",
    "is_weekend",
    "wait_time"
])

df.to_csv("data.csv", index=False)

print("✅ Dataset generated")
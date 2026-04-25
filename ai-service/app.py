
from pathlib import Path
from datetime import datetime
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / 'timeslot_model.pkl'
ENCODER_PATH = BASE_DIR / 'service_type_encoder.pkl'

app = FastAPI(title='Smart Queue AI Service')

model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

SERVICE_DURATION = {
    'nic': 18,
    'passport': 32,
    'license': 24,
}

class PredictWaitInput(BaseModel):
    service_type: str
    day_of_week: int
    is_weekend: int
    hour_of_day: int
    slot_booking_count: int
    avg_hourly_bookings: float
    avg_service_duration_minutes: float
    historical_avg_wait: float

class SlotInput(BaseModel):
    date: str
    time: str
    fullSlot: str

class ExistingBooking(BaseModel):
    fullSlot: Optional[str] = None
    serviceType: Optional[str] = None
    status: Optional[str] = None

class RecommendInput(BaseModel):
    service_type: str
    slots: List[SlotInput]
    existing_bookings: List[ExistingBooking] = []

def predict_wait(payload: PredictWaitInput) -> float:
    try:
        service_type_encoded = encoder.transform([payload.service_type])[0]
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f'Unknown service_type: {payload.service_type}') from exc

    frame = pd.DataFrame([{
        'service_type_encoded': service_type_encoded,
        'day_of_week': payload.day_of_week,
        'is_weekend': payload.is_weekend,
        'hour_of_day': payload.hour_of_day,
        'slot_booking_count': payload.slot_booking_count,
        'avg_hourly_bookings': payload.avg_hourly_bookings,
        'avg_service_duration_minutes': payload.avg_service_duration_minutes,
        'historical_avg_wait': payload.historical_avg_wait,
    }])

    return round(float(model.predict(frame)[0]), 2)

@app.get('/health')
def health():
    return {'success': True, 'message': 'AI service is running'}

@app.post('/predict-wait')
def predict_wait_endpoint(payload: PredictWaitInput):
    return {'success': True, 'predicted_wait_minutes': predict_wait(payload)}

@app.post('/recommend-timeslot')
def recommend_timeslot(payload: RecommendInput):
    if not payload.slots:
        raise HTTPException(status_code=400, detail='No slots supplied')

    active_statuses = {'confirmed', 'upcoming', 'pending', 'processing'}
    scores = []
    base_duration = SERVICE_DURATION.get(payload.service_type, 20)

    for slot in payload.slots:
        dt = datetime.strptime(f"{slot.date} {slot.time}", '%Y-%m-%d %I:%M %p')
        hour = dt.hour
        day = dt.weekday()
        is_weekend = 1 if day >= 5 else 0

        bookings_same_slot = [
            b for b in payload.existing_bookings
            if b.fullSlot == slot.fullSlot and (b.status or '').lower() in active_statuses
        ]
        bookings_same_hour = [
            b for b in payload.existing_bookings
            if b.fullSlot and b.fullSlot.startswith(slot.date)
            and (b.status or '').lower() in active_statuses
            and datetime.strptime(b.fullSlot, '%Y-%m-%d %I:%M %p').hour == hour
        ]
        service_bookings_same_hour = [
            b for b in bookings_same_hour
            if (b.serviceType or '').lower() == payload.service_type.lower()
        ]

        slot_booking_count = len(bookings_same_slot)
        avg_hourly_bookings = max(1, len(bookings_same_hour))
        historical_avg_wait = max(5, (slot_booking_count * base_duration * 0.7) + (len(service_bookings_same_hour) * 3))

        predicted_wait = predict_wait(PredictWaitInput(
            service_type=payload.service_type,
            day_of_week=day,
            is_weekend=is_weekend,
            hour_of_day=hour,
            slot_booking_count=slot_booking_count,
            avg_hourly_bookings=avg_hourly_bookings,
            avg_service_duration_minutes=base_duration,
            historical_avg_wait=historical_avg_wait,
        ))

        if predicted_wait <= 25:
            crowd_level = 'Best choice'
        elif predicted_wait <= 45:
            crowd_level = 'Moderate'
        else:
            crowd_level = 'Busy'

        reason = (
            f"Predicted wait: {predicted_wait} mins, "
            f"slot bookings: {slot_booking_count}, "
            f"hour traffic: {avg_hourly_bookings}"
        )

        scores.append({
            'date': slot.date,
            'time': slot.time,
            'fullSlot': slot.fullSlot,
            'predictedWaitMinutes': predicted_wait,
            'crowdLevel': crowd_level,
            'reason': reason,
            'slotBookingCount': slot_booking_count,
        })

    scores.sort(key=lambda item: (item['predictedWaitMinutes'], item['slotBookingCount'], item['time']))
    best = scores[0]
    best['message'] = f"AI recommends {best['time']} because it has the lowest predicted waiting time."

    return {
        'success': True,
        'recommended': best,
        'allSlots': scores,
    }

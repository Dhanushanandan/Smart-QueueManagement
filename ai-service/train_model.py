
from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import math

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / 'training_dataset_10000.csv'
MODEL_PATH = BASE_DIR / 'timeslot_model.pkl'
ENCODER_PATH = BASE_DIR / 'service_type_encoder.pkl'
METRICS_PATH = BASE_DIR / 'training_metrics.json'

df = pd.read_csv(DATASET_PATH)

encoder = LabelEncoder()
df['service_type_encoded'] = encoder.fit_transform(df['service_type'])

feature_columns = [
    'service_type_encoded',
    'day_of_week',
    'is_weekend',
    'hour_of_day',
    'slot_booking_count',
    'avg_hourly_bookings',
    'avg_service_duration_minutes',
    'historical_avg_wait',
]

X = df[feature_columns]
y = df['expected_wait_minutes']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(
    n_estimators=250,
    max_depth=12,
    min_samples_split=4,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train, y_train)

predictions = model.predict(X_test)

metrics = {
    'mae': round(float(mean_absolute_error(y_test, predictions)), 4),
    'rmse': round(float(math.sqrt(mean_squared_error(y_test, predictions))), 4),
    'r2': round(float(r2_score(y_test, predictions)), 4),
    'rows': int(len(df)),
}

joblib.dump(model, MODEL_PATH)
joblib.dump(encoder, ENCODER_PATH)
METRICS_PATH.write_text(pd.Series(metrics).to_json(indent=2))

print('Training complete')
print(metrics)

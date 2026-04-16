import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from xgboost import XGBRegressor


# LOAD DATA
df = pd.read_csv("data.csv")

# ----------------------------
# ENCODING CATEGORY
# ----------------------------
le = LabelEncoder()
df["category_encoded"] = le.fit_transform(df["category"])

# ----------------------------
# FEATURES (NO counters)
# ----------------------------
features = [
    "queue_length",
    "estimated_time",
    "category_encoded",
    "hour_of_day",
    "day_of_week",
    "is_weekend"
]

X = df[features]
y = df["wait_time"]

# ----------------------------
# TRAIN / TEST SPLIT
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

# ----------------------------
# MODEL (XGBOOST)
# ----------------------------
model = XGBRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

model.fit(X_train, y_train)

# ----------------------------
# PREDICTIONS
# ----------------------------
y_pred = model.predict(X_test)

# ----------------------------
# METRICS
# ----------------------------
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print("\n📊 XGBOOST MODEL EVALUATION")
print(f"MAE  : {mae:.2f}")
print(f"MSE  : {mse:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")

# ----------------------------
# SAVE MODEL + ENCODER
# ----------------------------
joblib.dump(model, "model.pkl")
joblib.dump(le, "encoder.pkl")

print("\n✅ XGBoost model saved")
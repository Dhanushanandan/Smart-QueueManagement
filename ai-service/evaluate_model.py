import pandas as pd
import os
import joblib
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    mean_absolute_percentage_error,
    max_error,
    explained_variance_score
)

# =========================
# LOAD DATA + MODEL + ENCODER
# =========================
df = pd.read_csv('test.csv')

model = joblib.load('model.pkl')
encoder = joblib.load('encoder.pkl')

# =========================
# ENCODE CATEGORY
# =========================
df['category_encoded'] = encoder.transform(df['category'])

# =========================
# FEATURES & TARGET
# =========================
features = [
    'queue_length',
    'estimated_time',
    'category_encoded',
    'hour_of_day',
    'day_of_week',
    'is_weekend'
]

X = df[features]
y = df['wait_time']

# =========================
# TRAIN / TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

# =========================
# PREDICT (XGBOOST)
# =========================
y_pred = model.predict(X_test)

# =========================
# METRICS
# =========================
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)
mape = mean_absolute_percentage_error(y_test, y_pred)
max_err = max_error(y_test, y_pred)
evs = explained_variance_score(y_test, y_pred)

print("\n📊 XGBOOST MODEL EVALUATION")
print(f"MAE  : {mae:.2f}")
print(f"MSE  : {mse:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")
print(f"MAPE : {mape:.4f}")
print(f"Max Error : {max_err:.2f}")
print(f"Explained Variance : {evs:.4f}")

# =========================
# GRAPHS
# =========================
generate_graphs = input("\nGenerate graphs? (yes/no): ").strip().lower()

if generate_graphs == "yes":
    os.makedirs("graphs", exist_ok=True)

    # -------------------------
    # Actual vs Predicted
    # -------------------------
    plt.figure()
    plt.scatter(y_test, y_pred, alpha=0.5)
    plt.xlabel("Actual Wait Time")
    plt.ylabel("Predicted Wait Time")
    plt.title("XGBoost: Actual vs Predicted")
    plt.savefig("graphs/actual_vs_predicted.png")

    # -------------------------
    # Residual Plot
    # -------------------------
    residuals = y_test - y_pred

    plt.figure()
    plt.scatter(y_pred, residuals, alpha=0.5)
    plt.axhline(0, linestyle='--')
    plt.xlabel("Predicted")
    plt.ylabel("Residuals")
    plt.title("Residual Plot")
    plt.savefig("graphs/residuals.png")

    # -------------------------
    # Error Distribution
    # -------------------------
    plt.figure()
    plt.hist(residuals, bins=30)
    plt.title("Error Distribution")
    plt.xlabel("Error")
    plt.ylabel("Frequency")
    plt.savefig("graphs/error_distribution.png")

    # -------------------------
    # Feature Importance (XGBoost style)
    # -------------------------
    importances = model.feature_importances_

    plt.figure()
    plt.barh(features, importances)
    plt.title("XGBoost Feature Importance")
    plt.xlabel("Importance")
    plt.savefig("graphs/feature_importance.png")

    print("\n📁 Graphs saved in 'graphs/' folder")

else:
    print("Graph generation skipped")
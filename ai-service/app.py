from flask import Flask, request, jsonify
import joblib
import numpy as np
from datetime import datetime

app = Flask(__name__)

# LOAD MODEL + ENCODER
model = joblib.load('model.pkl')
encoder = joblib.load('encoder.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        # INPUTS FROM FRONTEND
        queue_length = data.get('queueLength')
        estimated_time = data.get('estimatedTime')
        category = data.get('category')

        # VALIDATION
        if queue_length is None or estimated_time is None or category is None:
            return jsonify({"error": "Missing required fields"}), 400

        # ENCODE CATEGORY
        try:
            category_encoded = encoder.transform([category])[0]
        except:
            return jsonify({"error": f"Unknown category: {category}"}), 400

        # AUTO TIME FEATURES
        now = datetime.now()
        hour = now.hour
        day = now.weekday()
        is_weekend = 1 if day >= 5 else 0

        # BUILD INPUT (ORDER MUST MATCH TRAINING)
        input_data = np.array([[
            queue_length,
            estimated_time,
            category_encoded,
            hour,
            day,
            is_weekend
        ]])

        # PREDICT
        prediction = model.predict(input_data)[0]

        print(f"Received data: {data}")
        print(f"Encoded category: {category_encoded}")
        print(f"Input data for model: {input_data}")
        print(f"Predicted wait time: {prediction}")

        return jsonify({
            "estimatedWaitTime": round(float(prediction), 2),
            "meta": {
                "hour": hour,
                "day": day,
                "isWeekend": is_weekend
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5001, debug=True)
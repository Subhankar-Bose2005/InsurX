from flask import Flask, request, jsonify
import numpy as np
import joblib
import sys

print("APP STARTING...")

app = Flask(__name__)

# -------- Load XGBoost --------
xgb_model = joblib.load("xgb_model.pkl")
print("XGBoost LOADED OK")

# -------- Try to load TensorFlow (optional — fails gracefully on Windows) --------
lstm_model = None
lstm_max = None

def _try_load_lstm():
    global lstm_model, lstm_max
    # Guard: attempt tensorflow import early so any DLL failure is caught here
    try:
        import tensorflow as tf  # noqa: F401 — force DLL load now
    except Exception as e:
        print("TensorFlow unavailable (DLL/import error):", str(e)[:100])
        return
    except SystemError as e:
        print("TensorFlow unavailable (SystemError):", str(e)[:100])
        return

    try:
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dropout, Dense

        model = Sequential()
        model.add(LSTM(16, return_sequences=True, input_shape=(9, 4)))
        model.add(Dropout(0.3))
        model.add(LSTM(8))
        model.add(Dense(1, activation='sigmoid'))
        model.load_weights("lstm.weights.h5")

        lstm_model = model
        lstm_max = np.load("lstm_max.npy")
        print("LSTM LOADED OK")
    except Exception as e:
        print("LSTM DISABLED ❌:", str(e)[:120])

_try_load_lstm()

# -------- Prediction Function --------
def predict_final(data, sequence=None):
    xgb_features = [
        data["avg_speed"],
        data["total_distance"],
        data["location_variance"],
        data["update_frequency"],
        data["is_heavy_rain"],
        data["is_extreme_temp"],
        data["is_hazardous_aqi"],
        data["rain_intensity"]
    ]

    xgb_input = np.array(xgb_features).reshape(1, -1)
    xgb_score = float(xgb_model.predict_proba(xgb_input)[0][1])

    lstm_score = None
    if lstm_model is not None and sequence is not None:
        try:
            seq = np.array(sequence)
            seq = seq / (lstm_max + 1e-8)
            lstm_input = seq.reshape(1, 9, 4)
            lstm_score = float(lstm_model.predict(lstm_input)[0][0])
            lstm_score = min(lstm_score, 0.8)
        except Exception as e:
            print("LSTM ERROR:", e)

    if lstm_score is not None:
        final_score = xgb_score if xgb_score < 0.2 else 0.25 * lstm_score + 0.75 * xgb_score
    else:
        final_score = xgb_score

    if final_score < 0.5:
        label = "Genuine"
    elif final_score < 0.8:
        label = "Suspicious"
    else:
        label = "Fraud"

    return {
        "final_score": round(final_score, 4),
        "xgb_score": round(xgb_score, 4),
        "lstm_score": round(lstm_score, 4) if lstm_score is not None else None,
        "label": label
    }

# -------- Routes --------
@app.route("/predict", methods=["POST"])
def predict():
    req = request.get_json()
    result = predict_final(req["features"], req.get("sequence", None))
    return jsonify(result)

@app.route("/predict/fraud", methods=["POST"])
def predict_fraud():
    req = request.get_json()
    result = predict_final(req.get("features", {}), req.get("sequence", None))
    return jsonify(result)

@app.route("/predict/risk", methods=["POST"])
def predict_risk():
    req = request.get_json()
    temp = float(req.get("temp", 30))
    rainfall = float(req.get("rainfall", 0))
    aqi = float(req.get("aqi", 100))

    temp_risk = min(max((temp - 25) / 25, 0), 1)
    rain_risk = min(rainfall / 50, 1)
    activity_risk = (temp_risk + rain_risk) / 2
    ifi = 0.5

    risk_score = temp_risk * 0.3 + rain_risk * 0.3 + activity_risk * 0.2 + ifi * 0.2
    return jsonify({
        "risk_score": round(risk_score, 4),
        "temp_risk": round(temp_risk, 4),
        "rain_risk": round(rain_risk, 4),
        "activity_risk": round(activity_risk, 4),
        "ifi": round(ifi, 4),
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "xgboost": True,
        "lstm": lstm_model is not None,
    })

# -------- Run --------
if __name__ == "__main__":
    print("SERVER RUNNING on port 5001...")
    app.run(host="0.0.0.0", port=5001, debug=False)

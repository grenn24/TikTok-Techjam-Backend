import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import time
import random
from sklearn.preprocessing import StandardScaler


# Generate synthetic authentic logs
synthetic_logs = []
for i in range(1, 21):
    user_id = f"user{i}"
    
    # Make some logs anomalous based on action and amount
    if i % 7 == 0:
        action = "SUSPICIOUS_GIFTING"
        amount = random.randint(800, 1500)  # unusually high
    elif i % 5 == 0:
        action = "POTENTIAL_GAMING"
        amount = random.randint(400, 700)
    else:
        action = "SEND_GIFT"
        amount = random.randint(10, 100)
    
    synthetic_logs.append({
        "id": str(i),
        "userId": user_id,
        "action": action,
        "amount": amount,
        "createdAt": time.time() + random.randint(-3600, 3600)  # +- 1 hour jitter
    })


action_mapping = {"SEND_GIFT": 0, "SUSPICIOUS_GIFTING": 1, "POTENTIAL_GAMING": 2}

for log in synthetic_logs:
    log["action_code"] = action_mapping[log["action"]]
    # simple numeric encoding for userId
    log["user_numeric"] = int(log["userId"].replace("user", ""))  

df = pd.DataFrame(synthetic_logs)

# Scale features: amount, user_numeric, action_code, createdAt
features = df[['amount', 'user_numeric', 'action_code', 'createdAt']].values.astype(np.float32)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(features)

X = df[['amount', 'user_numeric', 'action_code', 'createdAt']].values.astype(np.float32)


model = IsolationForest(contamination=0.2, random_state=42)
model.fit(X)


preds = model.predict(X)  # 1 = normal, -1 = anomaly
df["anomaly"] = preds

print(df[["id", "userId", "amount", "action", "anomaly"]])


joblib.dump(model, "../model/anomaly_detector_model.pkl")

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import time


synthetic_logs = [
    {"id": "1", "userId": "user1", "action": "SEND_GIFT", "amount": 50, "createdAt": time.time()},
    {"id": "2", "userId": "user2", "action": "SEND_GIFT", "amount": 70, "createdAt": time.time()},
    {"id": "3", "userId": "user3", "action": "SUSPICIOUS_GIFTING", "amount": 1000, "createdAt": time.time()},  # anomaly
    {"id": "4", "userId": "user4", "action": "SEND_GIFT", "amount": 30, "createdAt": time.time()},
    {"id": "5", "userId": "user5", "action": "POTENTIAL_GAMING", "amount": 500, "createdAt": time.time()},  # anomaly
]


action_mapping = {"SEND_GIFT": 0, "SUSPICIOUS_GIFTING": 1, "POTENTIAL_GAMING": 2}

for log in synthetic_logs:
    log["action_code"] = action_mapping[log["action"]]
    # simple numeric encoding for userId
    log["user_numeric"] = int(log["userId"].replace("user", ""))  

df = pd.DataFrame(synthetic_logs)

X = df[['amount', 'action_code', 'user_numeric', 'createdAt']].values.astype(np.float32)


model = IsolationForest(contamination=0.2, random_state=42)
model.fit(X)


preds = model.predict(X)  # 1 = normal, -1 = anomaly
df["anomaly"] = preds
df["anomaly"] = df["anomaly"].map({1: 0, -1: 1})  # convert to 0 = normal, 1 = anomaly

print(df[["id", "userId", "amount", "action", "anomaly"]])


joblib.dump(model, "../model/anomaly_detector_model.pkl")

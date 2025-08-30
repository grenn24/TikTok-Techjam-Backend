import pandas as pd
import joblib
import lightgbm as lgb
from sklearn.preprocessing import MinMaxScaler



def fit_scaler(X):
    """
    Fit a MinMaxScaler to your training data and save it.
    """
    global scaler
    scaler = MinMaxScaler()
    scaler.fit(X)
    
    # Make sure model directory exists
    joblib.dump(scaler, "../model/scaler.pkl")
    print("Scaler fitted and saved!")

# Historical content data
data = pd.DataFrame({
    "likes": [10, 50, 200, 500],
    "shares": [1, 5, 20, 50],
    "comments": [0, 3, 10, 25],
    "watch_time": [30, 120, 600, 1800],
    "content_length": [60, 90, 300, 600],
    "creator_reputation": [0.2, 0.5, 0.7, 0.9],
    "views": [1000, 5000, 10000, 20000],
    "reward_multiplier": [1, 1.5, 2, 3]
})

X = data[["likes", "shares", "comments", "watch_time", "content_length", "creator_reputation", "views"]]
y = data["reward_multiplier"] / max(data["reward_multiplier"])

# Fit scaler
fit_scaler(X)

# Train LightGBM model
model = lgb.LGBMRegressor(n_estimators=100, learning_rate=0.1)
model.fit(X, y)

# Save model
joblib.dump(model, "../model/content_quality_model.pkl")
print("Model and scaler saved successfully!")




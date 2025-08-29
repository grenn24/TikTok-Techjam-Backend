# train_model.py
import tensorflow as tf
import numpy as np

# Example: create dummy data
X_train = np.random.rand(100, 3)  # 100 samples, 3 features each
y_train = np.random.rand(100, 1)  # 100 target values

# Define a simple neural network
model = tf.keras.Sequential([
    tf.keras.layers.Dense(16, activation='relu', input_shape=(3,)),
    tf.keras.layers.Dense(8, activation='relu'),
    tf.keras.layers.Dense(1, activation='linear')  # output: reward multiplier
])

model.compile(optimizer='adam', loss='mse')

# Train the model
model.fit(X_train, y_train, epochs=50, batch_size=8)

# Save the model
model.save("model/reward_model.h5")
print("Model saved to model/reward_model.h5")

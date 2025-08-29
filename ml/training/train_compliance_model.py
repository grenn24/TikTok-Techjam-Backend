from tensorflow.python.keras.models import Sequential
from tensorflow.python.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from keras_preprocessing.image import ImageDataGenerator



# Example input shape (resize frames to 128x128 RGB)
input_shape = (128, 128, 3)

model =Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=input_shape),
    MaxPooling2D(2,2),
    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    Flatten(),
    Dense(128, activation='relu'),
    Dense(1, activation='sigmoid')  # output 0-1 compliance score
])

model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])

# Use ImageDataGenerator for your labeled frames
train_datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)
train_generator = train_datagen.flow_from_directory(
    'labeled_frames/', target_size=(128,128),
    batch_size=32, class_mode='binary', subset='training'
)
val_generator = train_datagen.flow_from_directory(
    'labeled_frames/', target_size=(128,128),
    batch_size=32, class_mode='binary', subset='validation'
)

# Train
model.fit(train_generator, validation_data=val_generator, epochs=10)

# Save the trained model
model.save("../model/compliance_model.h5")
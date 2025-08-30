from tensorflow.python.keras.models import Sequential
from tensorflow.python.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from keras_preprocessing.image import ImageDataGenerator

# Categories
categories = ["CommunityGuidelines", "Education", "Delivery", "AudioVisual"]
num_categories = len(categories)

# Input shape (resize all frames to 128x128 RGB)
input_shape = (128, 128, 3)

# Build CNN
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=input_shape),
    MaxPooling2D(2,2),
    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    Conv2D(128, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    Flatten(),
    Dense(256, activation='relu'),
    Dropout(0.5),
    Dense(num_categories, activation='sigmoid')  # one score per category (0-1)
])

model.compile(
    optimizer='adam',
    loss='mean_squared_error',   # regression problem (scores 0-1)
    metrics=['mae']
)

# Data generators
train_datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

train_generator = train_datagen.flow_from_directory(
    'frames', 
    target_size=(128,128),
    batch_size=32,
    class_mode='categorical',  # multi-class
    subset='training'
)

val_generator = train_datagen.flow_from_directory(
    'frames',
    target_size=(128,128),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)

# Train
model.fit(train_generator, validation_data=val_generator, epochs=15)

# Save model
model.save("../models/content_quality_model.h5")
print("Model trained and saved as models/content_quality_model.h5")

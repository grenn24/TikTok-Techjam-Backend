import os
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator

categories = ["CommunityGuidelines", "Education", "Delivery", "AudioVisual"]
num_categories = len(categories)
input_shape = (128, 128, 3)
batch_size = 32
epochs = 15
frames_dir = "frames"  # folder containing all images

all_filenames = []
all_labels = []

for category in os.listdir(frames_dir):
    category_path = os.path.join(frames_dir, category)
    if os.path.isdir(category_path):
        for fname in os.listdir(category_path):
            if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                all_filenames.append(os.path.join(category, fname))
                # assign 0.9 for all categories
                all_labels.append([0.9]*num_categories)

df = pd.DataFrame(all_labels, columns=categories)
df['filename'] = all_filenames

# Shuffle DataFrame
df = df.sample(frac=1).reset_index(drop=True)

datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

train_gen = datagen.flow_from_dataframe(
    dataframe=df,
    directory=frames_dir,
    x_col='filename',
    y_col=categories,
    target_size=(128,128),
    batch_size=batch_size,
    class_mode='raw',   # numeric labels
    subset='training',
    shuffle=True
)

val_gen = datagen.flow_from_dataframe(
    dataframe=df,
    directory=frames_dir,
    x_col='filename',
    y_col=categories,
    target_size=(128,128),
    batch_size=batch_size,
    class_mode='raw',
    subset='validation',
    shuffle=False
)

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

    Dense(num_categories, activation='sigmoid')  # one score per category
])

model.compile(
    optimizer='adam',
    loss='mean_squared_error',  # regression loss
    metrics=['mae']
)

model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=epochs,
    steps_per_epoch=len(train_gen),
    validation_steps=len(val_gen)
)

os.makedirs("../models", exist_ok=True)
model.save("../models/content_quality_model.h5")
print("Model trained and saved as ../models/content_quality_model.h5")

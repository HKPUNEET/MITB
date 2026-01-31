# train.py - Trains/fine-tunes with CSV + image folder
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from models import build_model
import pandas as pd


def train_model(csv_path='labels.csv', images_dir='images/', epochs=10, batch_size=32):
    """
    Fine-tunes ResNet50 on CSV-labeled images.
    Args: csv_path (labels: Image_ID, Label), images_dir (JPEGs).
    Returns: Trained model.
    """
    df = pd.read_csv(csv_path)  # Columns: 'Image_ID', 'Label' (0/1/2)

    datagen = ImageDataGenerator(
        rescale=1. / 255, validation_split=0.2,
        rotation_range=10, zoom_range=0.1, horizontal_flip=True  # For noise robustness
    )

    train_gen = datagen.flow_from_dataframe(
        df, directory=images_dir, x_col='Image_ID', y_col='Label',
        target_size=(224, 224), batch_size=batch_size, class_mode='categorical',
        subset='training'
    )
    val_gen = datagen.flow_from_dataframe(
        df, directory=images_dir, x_col='Image_ID', y_col='Label',
        target_size=(224, 224), batch_size=batch_size, class_mode='categorical',
        subset='validation'
    )

    model = build_model()
    model.fit(train_gen, epochs=epochs, validation_data=val_gen)
    model.save('pneumonia_model.h5')  # Save for load_trained_model
    return model
# preprocess.py - Handles image preprocessing (modular for data handling)
import cv2
import numpy as np

def preprocess_image(img_path):
    """
    Preprocesses a single image for model input.
    Args: img_path (str) - Path to the image file.
    Returns: Numpy array of shape (1, 224, 224, 3) normalized.
    """
    try:
        img = cv2.imread(img_path)
        if img is None:
            raise ValueError(f"Invalid image path: {img_path}")
        img = cv2.resize(img, (224, 224))
        img = img / 255.0  # Normalize
        return np.expand_dims(img, axis=0)  # Add batch dimension
    except Exception as e:
        print(f"Preprocessing error: {e}")
        return None
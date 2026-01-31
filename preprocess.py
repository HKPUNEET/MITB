# preprocess.py
# Handles image preprocessing for inference (file path) and Hugging Face dataset (bytes)

import cv2
import numpy as np
import tensorflow as tf

# ────────────────────────────────────────────────────────────────
# Choose preprocessing function that matches your base model
# ResNet50 is the safest default for most medical imaging tasks
# ────────────────────────────────────────────────────────────────
from tensorflow.keras.applications.resnet50 import preprocess_input as resnet_preprocess
# If you switch to EfficientNetV2 as primary model later:
# from tensorflow.keras.applications.efficientnet_v2 import preprocess_input as effnet_preprocess

PREPROCESS_FUNC = resnet_preprocess  # ← change here if needed

def preprocess_image(
    input_data,
    is_bytes=False,
    target_size=(224, 224),
    interpolation=cv2.INTER_AREA
):
    """
    Preprocesses a single chest X-ray image for model input.

    Supports two input types:
      - str: file path (used in test_core.py, single image inference)
      - bytes: raw image bytes (used when loading from Hugging Face datasets)

    Returns:
        np.ndarray of shape (1, height, width, 3) ready for model.predict()
        or None if loading/preprocessing failed

    Key features:
    - Converts BGR → RGB
    - Uses INTER_AREA for high-quality downscaling of medical images
    - Applies correct ImageNet preprocessing (mean subtraction + scaling)
    - Clear error messages with context
    """
    try:
        # Step 1: Load image
        if is_bytes:
            # Hugging Face dataset → bytes
            nparr = np.frombuffer(input_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            source = "bytes input"
        else:
            # Local file path
            img = cv2.imread(input_data)
            source = f"file path '{input_data}'"

        if img is None:
            raise ValueError(f"Failed to load image from {source} (file missing or corrupted)")

        # Step 2: Convert BGR (OpenCV default) → RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Step 3: Resize with good interpolation for medical images
        img = cv2.resize(img, target_size, interpolation=interpolation)

        # Step 4: Apply model-specific ImageNet preprocessing
        # This is CRITICAL for transfer learning accuracy
        img = img.astype(np.float32)
        img = PREPROCESS_FUNC(img)

        # Step 5: Add batch dimension (model expects (1, H, W, 3))
        return np.expand_dims(img, axis=0)

    except Exception as e:
        print(f"Preprocessing failed for {source}: {str(e)}")
        return None


# Optional helper (useful for batch inference or debugging)
def preprocess_batch(items, is_bytes=False):
    """
    Preprocess multiple images at once.
    Returns list of preprocessed arrays (None for failed items).
    """
    return [preprocess_image(item, is_bytes=is_bytes) for item in items]

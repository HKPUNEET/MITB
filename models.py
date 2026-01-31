# models.py - Updated with Ensemble Support (ResNet50 + EfficientNetV2-S + ViT-Tiny)
import tensorflow as tf
import numpy as np
from tensorflow.keras.applications import ResNet50, EfficientNetV2S
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam

# Optional: pip install vit-keras timm (if you want ViT)
try:
    from vit_keras import vit
except ImportError:
    vit = None
    print("vit-keras not installed — ViT will be skipped. Install with: pip install vit-keras")

def build_resnet_model(learning_rate=0.001, seed=42,num_classes=2):
    """
    Builds ResNet50-based model (baseline).
    """
    tf.random.set_seed(seed)
    base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    x = GlobalAveragePooling2D()(base_model.output)
    x = Dense(128, activation='relu')(x)
    output = Dense(num_classes, activation='softmax')(x) # 0-Normal, 1-Bacterial, 2-Viral
    model = Model(inputs=base_model.input, outputs=output)

    for layer in base_model.layers:
        layer.trainable = False

    model.compile(optimizer=Adam(learning_rate=learning_rate),
                  loss='categorical_crossentropy',
                  metrics=['accuracy', 'Recall'])
    return model

def build_efficientnet_model(learning_rate=0.001, seed=43, num_classes=2):
    """
    Builds EfficientNetV2-S model (stronger & more efficient).
    """
    tf.random.set_seed(seed)
    base_model = EfficientNetV2S(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    x = GlobalAveragePooling2D()(base_model.output)
    x = Dense(128, activation='relu')(x)
    output = Dense(num_classes, activation='softmax')(x)   # ← changed from 3 to num_classes
    model = Model(inputs=base_model.input, outputs=output)

    for layer in base_model.layers:
        layer.trainable = False

    model.compile(optimizer=Adam(learning_rate=learning_rate),
                  loss='categorical_crossentropy',
                  metrics=['accuracy', 'Recall'])
    return model

def build_vit_tiny_model(learning_rate=0.0005, seed=44,num_classes=2):
    """
    Builds lightweight ViT-Tiny (if vit-keras installed).
    """
    if vit is None:
        print("ViT-Tiny skipped — install vit-keras")
        return None

    tf.random.set_seed(seed)
    model = vit.vit_tiny(
        image_size=224,
        patch_size=16,
        num_classes=num_classes,
        activation='softmax',
        pretrained=True,
        include_top=True,
        pretrained_top=False  # We add our own head
    )
    model.compile(optimizer=Adam(learning_rate=learning_rate),
                  loss='categorical_crossentropy',
                  metrics=['accuracy', 'Recall'])
    return model

class PneumoniaEnsemble:
    """
    Soft-voting ensemble of ResNet50 + EfficientNetV2-S + ViT-Tiny.
    """
    def __init__(self, weights=None):
        self.models = []
        self.weights = weights or [0.4, 0.4, 0.2]  # ResNet, EfficientNet, ViT

        # Load models (you can train them separately first)
        self.models.append(build_resnet_model())
        self.models.append(build_efficientnet_model())
        vit_model = build_vit_tiny_model()
        if vit_model is not None:
            self.models.append(vit_model)
        else:
            self.weights = self.weights[:2]  # Drop ViT weight if skipped

    def predict(self, img_array):
        """Ensemble prediction (soft voting)"""
        probs = []
        for model in self.models:
            pred = model.predict(img_array, verbose=0)[0]
            probs.append(pred)
        probs = np.array(probs)
        ensemble_prob = np.average(probs, axis=0, weights=self.weights)
        return ensemble_prob

    def __len__(self):
        return len(self.models)

# Example usage (for testing)
if __name__ == "__main__":
    ensemble = PneumoniaEnsemble()
    print(f"Ensemble has {len(ensemble)} models")

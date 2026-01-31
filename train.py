# train_models.py - Train ensemble on HF chest-xray-pneumonia dataset (2-class)
# Fixed: removed tf.image.rotate (not available), used safe augmentations

import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from datasets import load_dataset
from models import build_resnet_model, build_efficientnet_model, build_vit_tiny_model
import numpy as np
from sklearn.utils.class_weight import compute_class_weight

# ────────────────────────────────────────────────────────────────
# Config
# ────────────────────────────────────────────────────────────────
NUM_CLASSES = 2               # Normal (0) vs Pneumonia (1)
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15                   # monitor val_loss
LEARNING_RATE = 1e-4
AUTOTUNE = tf.data.AUTOTUNE

# ────────────────────────────────────────────────────────────────
# Load dataset
# ────────────────────────────────────────────────────────────────
print("Loading Hugging Face dataset 'hf-vision/chest-xray-pneumonia'...")
dataset = load_dataset("hf-vision/chest-xray-pneumonia")
print(f"Train: {len(dataset['train'])} | Val: {len(dataset['validation'])} | Test: {len(dataset['test'])}")

# ────────────────────────────────────────────────────────────────
# Preprocessing + Augmentation (safe & compatible)
# ────────────────────────────────────────────────────────────────
def preprocess_and_augment(example, augment=False):
    # 'image' is PIL JpegImageFile
    pil_img = example['image']

    # PIL → numpy → TF tensor
    img_np = np.array(pil_img.convert('RGB'))
    img = tf.convert_to_tensor(img_np, dtype=tf.float32)

    # Resize
    img = tf.image.resize(img, IMG_SIZE, method='area')

    # ImageNet preprocessing
    img = tf.keras.applications.resnet50.preprocess_input(img)

    # Label
    label = tf.one_hot(example['label'], depth=NUM_CLASSES)

    # Augmentation (only for training)
    if augment:
        img = tf.image.random_flip_left_right(img)
        img = tf.image.random_flip_up_down(img)  # safe vertical flip
        img = tf.image.random_brightness(img, max_delta=0.1)
        img = tf.image.random_contrast(img, lower=0.9, upper=1.1)
        img = tf.image.random_saturation(img, lower=0.9, upper=1.1)
        # Simple 90° rotation steps (safe & compatible)
        k = tf.random.uniform(shape=[], minval=0, maxval=4, dtype=tf.int32)
        img = tf.image.rot90(img, k=k)

    # Return a dictionary instead of a tuple
    return {'image': img, 'label': label}

# ────────────────────────────────────────────────────────────────
# Create tf.data pipelines
# ────────────────────────────────────────────────────────────────
def create_tf_dataset(hf_split, augment=False, shuffle=False, buffer_size=1000):
    # Streaming dataset → directly use in generator
    def generator():
        for example in hf_split:
            # Preprocess on-the-fly (one example at a time → no memory explosion)
            pil_img = example['image']
            img_np = np.array(pil_img.convert('RGB'))
            img = tf.convert_to_tensor(img_np, dtype=tf.float32)
            img = tf.image.resize(img, IMG_SIZE, method='area')
            img = tf.keras.applications.resnet50.preprocess_input(img)
            label = tf.one_hot(example['label'], depth=NUM_CLASSES)

            if augment:
                img = tf.image.random_flip_left_right(img)
                img = tf.image.random_brightness(img, max_delta=0.1)
                img = tf.image.random_contrast(img, lower=0.9, upper=1.1)
                img = tf.image.random_saturation(img, lower=0.9, upper=1.1)
                k = tf.random.uniform(shape=[], minval=0, maxval=4, dtype=tf.int32)
                img = tf.image.rot90(img, k=k)  # safe 90° rotations

            yield img, label

    ds = tf.data.Dataset.from_generator(
        generator,
        output_signature=(
            tf.TensorSpec(shape=(IMG_SIZE[0], IMG_SIZE[1], 3), dtype=tf.float32),
            tf.TensorSpec(shape=(NUM_CLASSES,), dtype=tf.float32)
        )
    )

    if shuffle:
        ds = ds.shuffle(buffer_size=buffer_size)

    ds = ds.batch(BATCH_SIZE).prefetch(AUTOTUNE)
    return ds

# Create datasets (no .map() on HF side anymore)
train_ds = create_tf_dataset(dataset['train'], augment=True, shuffle=True)
val_ds   = create_tf_dataset(dataset['validation'], augment=False, shuffle=False)
test_ds  = create_tf_dataset(dataset['test'], augment=False, shuffle=False)
train_ds = create_tf_dataset(dataset['train'], augment=True, shuffle=True)
val_ds   = create_tf_dataset(dataset['validation'], augment=False, shuffle=False)
test_ds  = create_tf_dataset(dataset['test'], augment=False, shuffle=False)

# ────────────────────────────────────────────────────────────────
# Class weights
# ────────────────────────────────────────────────────────────────
labels_train = np.array(dataset['train']['label'])
unique, counts = np.unique(labels_train, return_counts=True)
class_weights = compute_class_weight('balanced', classes=unique, y=labels_train)
class_weights_dict = dict(zip(unique, class_weights))
print(f"Class weights: {class_weights_dict}")

# ────────────────────────────────────────────────────────────────
# Callbacks
# ────────────────────────────────────────────────────────────────
callbacks = [
    EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6, verbose=1),
    ModelCheckpoint(
        'best_model_{epoch:02d}_{val_loss:.4f}.h5',
        monitor='val_loss',
        save_best_only=True,
        verbose=1
    )
]

# ────────────────────────────────────────────────────────────────
# Train ResNet50
# ────────────────────────────────────────────────────────────────
print("\n=== Training ResNet50 ===")
resnet_model = build_resnet_model(learning_rate=LEARNING_RATE, num_classes=NUM_CLASSES)

for layer in resnet_model.layers:
    if 'conv5_block' in layer.name:
        layer.trainable = True
    else:
        layer.trainable = False

# Recompile model after unfreezing layers for the changes to take effect
resnet_model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
                      loss='categorical_crossentropy',
                      metrics=['accuracy', 'Recall'])

resnet_model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    class_weight=class_weights_dict,
    callbacks=callbacks,
    verbose=1
)
resnet_model.save('resnet50_trained_final.h5')

# ────────────────────────────────────────────────────────────────
# Train EfficientNetV2-S
# ────────────────────────────────────────────────────────────────
print("\n=== Training EfficientNetV2-S ===")
effnet_model = build_efficientnet_model(learning_rate=LEARNING_RATE, num_classes=NUM_CLASSES)

for layer in effnet_model.layers[-int(len(effnet_model.layers) * 0.3):]:
    layer.trainable = True

# Recompile model after unfreezing layers for the changes to take effect
effnet_model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
                      loss='categorical_crossentropy',
                      metrics=['accuracy', 'Recall'])

effnet_model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    class_weight=class_weights_dict,
    callbacks=callbacks,
    verbose=1
)
effnet_model.save('efficientnetv2s_trained_final.h5')

# ────────────────────────────────────────────────────────────────
# ViT-Tiny (optional)
# ────────────────────────────────────────────────────────────────
vit_model = build_vit_tiny_model(learning_rate=LEARNING_RATE / 2, num_classes=NUM_CLASSES)
if vit_model is not None:
    print("\n=== Training ViT-Tiny ===")
    vit_model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        class_weight=class_weights_dict,
        callbacks=callbacks,
        verbose=1
    )
    vit_model.save('vit_tiny_trained_final.h5')
else:
    print("\nViT-Tiny skipped (vit-keras not available)")

# ────────────────────────────────────────────────────────────────
# Final evaluation
# ────────────────────────────────────────────────────────────────
print("\n=== Final Evaluation on Test Set ===")
print("ResNet50:")
resnet_model.evaluate(test_ds, verbose=1)

print("\nEfficientNetV2-S:")
effnet_model.evaluate(test_ds, verbose=1)

if vit_model is not None:
    print("\nViT-Tiny:")
    vit_model.evaluate(test_ds, verbose=1)

print("\nTraining complete! Models saved as .h5 files.")
print("Next step: run test_core.py with a sample image to verify predictions.")

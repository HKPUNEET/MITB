# test_core.py - Standalone test for trained ensemble + heatmap + scoring
# Updated Jan 2026: better debugging, trained loading, optional TTA, minor fixes

import cv2
import numpy as np
import os
import datetime
from models import PneumoniaEnsemble
from preprocess import preprocess_image
from explainability import get_ensemble_heatmap
from scoring import calculate_symptom_score, past_record_score, calculate_final_score, SYMPTOMS_DICT

# ────────────────────────────────────────────────────────────────
# CONFIG / OPTIONS
# ────────────────────────────────────────────────────────────────
USE_TTA = False               # Set True after training for slight accuracy boost
TTA_FLIPS = True              # Horizontal flip
TTA_ROTATIONS = [0, 5, -5]    # Small rotations in degrees

test_img_path = "virus.jpeg"  # CHANGE THIS to your actual test image
force_untrained = False       # Set True only for debug (untrained models)

# Timestamp for unique output files
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

print("=== Pneumonia Detection Test Run ===")
print(f"Timestamp:          {timestamp}")
print(f"Test image:         {test_img_path}")
print(f"TTA enabled:        {USE_TTA}")
print(f"Force untrained:    {force_untrained}\n")

# Step 1: Load ensemble (prefers trained .h5 if they exist)
print("Loading ensemble...")
if force_untrained:
    ensemble = PneumoniaEnsemble(
        resnet_path='does_not_exist.h5',
        effnet_path='does_not_exist.h5',
        vit_path='does_not_exist.h5'
    )
else:
    ensemble = PneumoniaEnsemble()  # Loads trained weights automatically if files present

print(f"Ensemble loaded with {len(ensemble)} models "
      f"(ResNet50 + EfficientNetV2-S + {'ViT-Tiny' if len(ensemble) == 3 else 'no ViT'})\n")

# Step 2: Preprocess image
img_array = preprocess_image(test_img_path, is_bytes=False)
if img_array is None:
    print("Error: Failed to load/preprocess image. Check path, file format, or preprocess.py.")
    exit(1)

print(f"Image preprocessed successfully (shape: {img_array.shape})")

# Step 3: Prediction (with optional TTA)
probs = ensemble.predict(img_array)  # base prediction

if USE_TTA:
    print("Applying Test-Time Augmentation...")
    tta_probs = [probs]

    # Horizontal flip
    if TTA_FLIPS:
        flipped = np.flip(img_array, axis=2)  # flip width axis
        tta_probs.append(ensemble.predict(flipped))

    # Small rotations
    for angle in TTA_ROTATIONS:
        if angle == 0:
            continue
        rows, cols = img_array.shape[1], img_array.shape[2]  # height, width
        M = cv2.getRotationMatrix2D((cols / 2, rows / 2), angle, 1.0)
        rotated = cv2.warpAffine(img_array[0], M, (cols, rows))  # apply to single image
        rotated = np.expand_dims(rotated, axis=0)  # re-add batch
        tta_probs.append(ensemble.predict(rotated))

    probs = np.mean(tta_probs, axis=0)
    print(f"TTA applied ({len(tta_probs)} variants)")

print(f"\nEnsemble raw probs [Normal, Bacterial, Viral]: {probs}")
pneumonia_prob = probs[1] + probs[2]
print(f"Ensemble Pneumonia probability: {pneumonia_prob * 100:.1f}%")

# Step 4: Generate Grad-CAM heatmap
print("\nGenerating Grad-CAM heatmap...")
heatmap_matrix, overlaid_img = get_ensemble_heatmap(
    img_array,
    ensemble,
    test_img_path,
    alpha=0.45,
    add_colorbar=True  # Set False if matplotlib still causes trouble
)

if overlaid_img is not None:
    out_overlay = f"ensemble_heatmap_overlay_{timestamp}.jpg"
    cv2.imwrite(out_overlay, cv2.cvtColor(overlaid_img, cv2.COLOR_RGB2BGR))
    print(f"Saved overlaid heatmap: {out_overlay}")
else:
    print("Heatmap overlay failed → try add_colorbar=False or check matplotlib setup")

if heatmap_matrix is not None:
    out_raw = f"raw_ensemble_heatmap_{timestamp}.jpg"
    cv2.imwrite(out_raw, np.uint8(255 * heatmap_matrix))
    print(f"Saved raw grayscale heatmap: {out_raw}")
else:
    print("Raw heatmap generation failed")

# Step 5: Symptom & Final Scoring Examples
print("\n=== Clinical Scoring Examples ===")
print(f"Available symptoms: {list(SYMPTOMS_DICT.keys())}")

# No symptoms
matched_symptoms_1 = []
symptom_score_1 = calculate_symptom_score(matched_symptoms_1)
print(f"Symptom Score (none): {symptom_score_1:.3f}")

# High-risk example
matched_symptoms_2 = [
    'Trouble breathing – breathing fast, hard, or making a wheezy sound.',
    'Blue lips or fingers – serious sign, go to the doctor quickly.',
    'Fever – feeling very hot, shivery, or sweating.'
]
symptom_score_2 = calculate_symptom_score(matched_symptoms_2)
print(f"Symptom Score (high-risk): {symptom_score_2:.3f}")

past_score_yes = past_record_score(True)
past_score_no  = past_record_score(False)

final_1, expl_1 = calculate_final_score(probs, symptom_score_1, past_score_no)
final_2, expl_2 = calculate_final_score(probs, symptom_score_2, past_score_yes)

print(f"\nFinal Risk (low symptoms, no history): {final_1:.1f}% → {expl_1}")
print(f"Final Risk (high symptoms, history):    {final_2:.1f}% → {expl_2}")

print("\nTest complete. Check output files above.")

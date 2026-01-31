# test_core.py - Standalone test for ensemble model + heatmap + scoring (no Gemini/UI needed)

import cv2
import numpy as np
from models import PneumoniaEnsemble  # ← Updated import for ensemble
from preprocess import preprocess_image
from explainability import get_ensemble_heatmap  # ← New ensemble-aware helper
from scoring import calculate_symptom_score, past_record_score, calculate_final_score, SYMPTOMS_DICT

# Step 1: Load the ensemble (ResNet50 + EfficientNetV2-S + optional ViT-Tiny)
print("Loading ensemble...")
ensemble = PneumoniaEnsemble()
print(f"Ensemble loaded with {len(ensemble)} models (ResNet50 + EfficientNetV2-S + {'ViT-Tiny' if len(ensemble) == 3 else 'no ViT'})")

# Step 2: Pick a test image path (download samples from Kaggle or use your own)
test_img_path = "virus.jpeg"  # ← CHANGE THIS TO YOUR ACTUAL IMAGE

# Step 3: Process image
img_array = preprocess_image(test_img_path)
if img_array is None:
    print("Error: Could not load image. Check path.")
else:
    print("Image loaded successfully!")

    # Step 4: Get ensemble prediction
    probs = ensemble.predict(img_array)
    print(f"\nEnsemble raw probs [Normal, Bacterial, Viral]: {probs}")
    pneumonia_prob = probs[1] + probs[2]
    print(f"Ensemble Pneumonia probability: {pneumonia_prob*100:.1f}%")

    # Step 5: Generate ensemble-aware heatmap + overlay (uses ResNet50 inside ensemble)
    heatmap_matrix, overlaid_img = get_ensemble_heatmap(
        img_array,
        ensemble,
        test_img_path,
        alpha=0.45,
        add_colorbar=True  # Shows nice legend in saved image
    )

    if overlaid_img is not None:
        # Save as BGR for cv2.imwrite
        cv2.imwrite("ensemble_heatmap_overlay.jpg", cv2.cvtColor(overlaid_img, cv2.COLOR_RGB2BGR))
        print("Saved overlaid ensemble heatmap: ensemble_heatmap_overlay.jpg")
    else:
        print("Heatmap generation failed")

    # Optional: Save raw heatmap matrix as grayscale
    if heatmap_matrix is not None:
        cv2.imwrite("raw_ensemble_heatmap.jpg", np.uint8(255 * heatmap_matrix))
        print("Saved raw ensemble heatmap: raw_ensemble_heatmap.jpg")

    # Step 6: Manual symptom testing (mock matched symptoms)
    # Example 1: No symptoms
    matched_symptoms_1 = []
    # Example 2: High-risk symptoms
    matched_symptoms_2 = [
        'Trouble breathing – breathing fast, hard, or making a wheezy sound.',
        'Blue lips or fingers – serious sign, go to the doctor quickly.',
        'Fever – feeling very hot, shivery, or sweating.'
    ]

    symptom_score_1 = calculate_symptom_score(matched_symptoms_1)
    symptom_score_2 = calculate_symptom_score(matched_symptoms_2)

    print(f"\nSymptom Score (none): {symptom_score_1:.3f}")
    print(f"Symptom Score (high-risk): {symptom_score_2:.3f}")

    # Past history test
    past_score_yes = past_record_score(True)   # Has history
    past_score_no  = past_record_score(False)  # No history

    # Final conditional score test (using ensemble probs)
    final_1, expl_1 = calculate_final_score(probs, symptom_score_1, past_score_no)
    final_2, expl_2 = calculate_final_score(probs, symptom_score_2, past_score_yes)

    print(f"\nFinal Risk (low symptoms, no history): {final_1:.1f}% → {expl_1}")
    print(f"Final Risk (high symptoms, history): {final_2:.1f}% → {expl_2}")
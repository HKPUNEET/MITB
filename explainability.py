# explainability.py - Generates raw heatmap + optional overlay (more modular/flexible)

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras import backend as K
from preprocess import preprocess_image  # Reuse from your preprocess.py
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt  # For optional colorbar
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

def compute_gradcam_heatmap(img_array, model, last_conv_layer_name='conv5_block3_out', pred_index=None):
    """
    Computes the raw Grad-CAM heatmap matrix (activation map).
    Returns: numpy array (shape e.g. (224,224) or original conv size, values 0-1)
             and predicted probabilities array.
    """
    try:
        # Build a sub-model that outputs last conv activations + final predictions
        grad_model = tf.keras.models.Model(
            [model.inputs],
            [model.get_layer(last_conv_layer_name).output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, preds = grad_model(img_array)
            if pred_index is None:
                pred_index = tf.argmax(preds[0])  # Use top predicted class
            class_channel = preds[:, pred_index]

        # Gradients of the class wrt conv outputs
        grads = tape.gradient(class_channel, conv_outputs)

        # Global average pooling of gradients per channel
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        # Weight each channel by its gradient importance
        conv_outputs = conv_outputs[0]  # Remove batch dim
        heatmap = tf.matmul(conv_outputs, pooled_grads[..., tf.newaxis])
        heatmap = tf.squeeze(heatmap)

        # ReLU + normalize to [0,1]
        heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
        return heatmap.numpy(), preds[0].numpy()  # Return matrix + probs

    except Exception as e:
        print(f"Heatmap computation error: {e}")
        return None, None


def overlay_heatmap_on_image(heatmap, img_path, alpha=0.4, colormap=cv2.COLORMAP_JET,
                             upsample_method=cv2.INTER_CUBIC, add_colorbar=False):
    """
    Improved overlay: preserves original image resolution, smooth upsampling, optional colorbar.
    """
    if heatmap is None or heatmap.size == 0:
        return None

    # Load original image (keep original size & quality)
    img = cv2.imread(img_path)
    if img is None:
        return None
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert to RGB for correct colors

    orig_h, orig_w = img.shape[:2]

    # Protect against zero-division
    if np.max(heatmap) == 0:
        heatmap_resized = np.zeros((orig_h, orig_w))
    else:
        heatmap = heatmap / np.max(heatmap)
        heatmap_resized = cv2.resize(heatmap, (orig_w, orig_h), interpolation=upsample_method)

    heatmap_8bit = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_8bit, colormap)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    # Overlay on original high-res image
    overlaid = cv2.addWeighted(img, 1 - alpha, heatmap_colored, alpha, 0)

    if add_colorbar:
        fig = plt.figure(figsize=(6, 4))
        canvas = FigureCanvas(fig)
        ax = fig.add_subplot(111)
        im = ax.imshow(overlaid)
        cbar = fig.colorbar(im, ax=ax, orientation='vertical')
        cbar.set_label('Model Attention (Red = High)')
        ax.axis('off')

        # Tight layout to minimize whitespace
        fig.tight_layout(pad=0)

        canvas.draw()

        buf = canvas.buffer_rgba()
        rgba_array = np.asarray(buf)

        # Optional: crop to non-transparent content if padding appears
        # alpha = rgba_array[..., 3]
        # non_zero = np.where(alpha > 0)
        # if non_zero[0].size > 0:
        #     min_y, max_y = non_zero[0].min(), non_zero[0].max()
        #     min_x, max_x = non_zero[1].min(), non_zero[1].max()
        #     rgba_array = rgba_array[min_y:max_y+1, min_x:max_x+1]

        rgb_array = rgba_array[..., :3]
        plt.close(fig)
        return rgb_array
    else:
        return overlaid


# ────────────────────────────────────────────────────────────────
# NEW FUNCTION: Connects ensemble from models.py to existing Grad-CAM
# ────────────────────────────────────────────────────────────────

def get_ensemble_heatmap(img_array, ensemble, img_path, alpha=0.45, colormap=cv2.COLORMAP_JET, add_colorbar=True):
    """
    Generates Grad-CAM heatmap using the ResNet50 model inside the ensemble
    (because ResNet50 gives the clearest, most interpretable heatmaps).

    Args:
        img_array: Preprocessed image array (from preprocess_image)
        ensemble: PneumoniaEnsemble instance from models.py
        img_path: Path to original X-ray image
        alpha, colormap, add_colorbar: Passed to overlay_heatmap_on_image

    Returns:
        (heatmap_matrix, overlaid_rgb_image)
    """
    if not hasattr(ensemble, 'models') or not ensemble.models:
        print("Error: Ensemble has no models loaded")
        return None, None

    # Use ResNet50 (usually the first model in ensemble) for heatmap
    resnet_model = ensemble.models[0]  # ResNet50 is index 0 in your current setup

    # Reuse the existing single-model Grad-CAM function
    heatmap_matrix, _ = compute_gradcam_heatmap(
        img_array,
        resnet_model,
        last_conv_layer_name='conv5_block3_out'  # ResNet50-specific layer
    )

    if heatmap_matrix is None:
        print("Grad-CAM computation failed on ResNet50")
        return None, None

    # Generate the improved overlay (with colorbar if enabled)
    overlaid = overlay_heatmap_on_image(
        heatmap_matrix,
        img_path,
        alpha=alpha,
        colormap=colormap,
        upsample_method=cv2.INTER_CUBIC,
        add_colorbar=add_colorbar
    )

    return heatmap_matrix, overlaid

# scoring.py - Handles all scoring logic (modular for easy tuning weights/thresholds)
SYMPTOMS_DICT = {
    'Coughing a lot – sometimes wet, with gunk, or just a funny sound.': 0.1,  # Medium
    'Trouble breathing – breathing fast, hard, or making a wheezy sound.': 0.15,  # High
    'Fever – feeling very hot, shivery, or sweating.': 0.1,  # Medium
    'Chest or tummy hurts – especially when breathing or coughing.': 0.15,  # High
    'Feeling very tired or sleepy – wants to rest more than usual.': 0.05,  # Low
    'Blue lips or fingers – serious sign, go to the doctor quickly.': 0.15,  # High
    'Not wanting to eat or drink – may refuse favorite snacks.': 0.05,  # Low
    'Feeling dizzy or confused – can’t think clearly or act normally.': 0.15,  # High
    'Runny nose or stuffy nose – often comes with cough and fever.': 0.05,  # Low
    'Shivering or shaking – even under blankets.': 0.1,  # Medium
    'Crying more than usual – especially if it hurts to breathe.': 0.1,  # Medium
    'Playing less or losing interest in toys – feels too tired or sick.': 0.05   # Low
}

CONFIG = {
    'xray_weight': 0.6,
    'symptom_weight': 0.3,
    'past_weight': 0.1,
    'high_conf_thresh': 0.9,
    'low_conf_thresh': 0.1
}

def calculate_symptom_score(matched_symptoms, symptoms_dict=SYMPTOMS_DICT):
    """
    Calculates normalized symptom score from matched symptoms.
    Args: matched_symptoms (list[str]) - From Gemini mapping.
    Returns: float (0-1).
    """
    score = sum(symptoms_dict.get(sym, 0) for sym in matched_symptoms)
    total_possible = sum(symptoms_dict.values())
    return score / total_possible if total_possible > 0 else 0

def past_record_score(has_history, max_boost=0.2):
    """
    Simple past record score.
    Args: has_history (bool or int) - True/False or count.
    Returns: float (0-max_boost).
    """
    if isinstance(has_history, int):
        return min(has_history * 0.05, max_boost)  # Scale with count
    return max_boost if has_history else 0

def calculate_final_score(xray_probs, symptom_score, past_score, config=CONFIG):
    """
    Conditional final pneumonia risk score.
    Args:
        xray_probs (numpy array): [Normal, Bacterial, Viral].
        symptom_score (float): From symptoms.
        past_score (float): From past.
        config (dict): Weights/thresholds.
    Returns: (float, str) - Score (0-100), explanation.
    """
    pneumonia_prob = xray_probs[1] + xray_probs[2]  # Positive classes
    if pneumonia_prob >= config['high_conf_thresh']:
        return pneumonia_prob * 100, "High confidence from X-ray alone."
    elif pneumonia_prob <= config['low_conf_thresh']:
        return pneumonia_prob * 100, "Low risk from X-ray; symptoms/past ignored unless critical."
    else:
        weighted = (pneumonia_prob * config['xray_weight']) + \
                   (symptom_score * config['symptom_weight']) + \
                   (past_score * config['past_weight'])
        return weighted * 100, "Adjusted based on symptoms and history due to unclear X-ray."
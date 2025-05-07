# models/predict.py
import sys
import pandas as pd
import joblib
import json
import numpy as np

def load_model():
    model_data = joblib.load('models/best_eeg_model.joblib')
    return (
        model_data['model'],
        model_data['scaler'],
        model_data['pca'],
        model_data['label_encoder']
    )

def predict_single_sample(file_path):
    # Завантаження моделі
    model, scaler, pca, label_encoder = load_model()

    # Читання CSV
    sample = pd.read_csv(file_path)

    # Передобробка (аналогічно до вашої функції)
    features = sample.select_dtypes(include=[np.number]).drop(columns=['main.disorder'], errors='ignore')
    X_scaled = scaler.transform(features)
    X_pca = pca.transform(X_scaled)

    # Передбачення
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(X_pca)[0]
        classes = label_encoder.classes_
        prob_dict = {cls: float(prob) for cls, prob in zip(classes, probabilities)}
    else:
        prob_dict = {}

    predicted_label = label_encoder.inverse_transform(model.predict(X_pca))[0]

    return {
        'prediction': predicted_label,
        'probabilities': prob_dict,
        'features': features.to_dict('records')[0]
    }

if __name__ == '__main__':
    result = predict_single_sample(sys.argv[1])
    print(json.dumps(result))
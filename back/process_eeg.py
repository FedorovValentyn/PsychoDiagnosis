#!/usr/bin/env python3
import sys
import os
import json
import numpy as np
import pandas as pd
import joblib
from collections import Counter

def process_csv(csv_file_path, model_path):
    """
    Обробляє CSV файл з даними EEG і повертає результати прогнозування

    Параметри:
    csv_file_path - шлях до CSV файлу
    model_path - шлях до моделі у форматі joblib
    """
    try:
        # Завантаження даних
        df = pd.read_csv(csv_file_path)

        # Завантаження SVM моделі з scikit-learn
        if not model_path.endswith('.joblib'):
            raise ValueError("Непідтримуваний формат моделі. Підтримується лише .joblib")

        model_data = joblib.load(model_path)
        model = model_data['model']
        scaler = model_data['scaler']
        pca = model_data['pca']
        label_encoder = model_data['label_encoder']

        # Виділення ознак (виключаємо цільову змінну та нечислові стовпці, якщо є)
        features = df.select_dtypes(include=[np.number])

        # У випадку, якщо в даних є стовпчик 'main.disorder', виключаємо його з ознак
        if 'main.disorder' in features.columns:
            features = features.drop(columns=['main.disorder'])

        # Передобробка даних - перетворюємо на масив NumPy щоб позбутися назв ознак
        features_array = features.values
        X_scaled = scaler.transform(features_array)
        X_pca = pca.transform(X_scaled)

        # Прогнозування за допомогою SVM
        predicted_labels = model.predict(X_pca)

        # Отримання значень функції рішення (для SVM - відстань до гіперплощини)
        # Це не є ймовірностями, але можна використовувати як міру впевненості
        decision_values = None
        probabilities = None

        try:
            if hasattr(model, 'decision_function'):
                # Для бінарної класифікації
                if len(label_encoder.classes_) == 2:
                    decision_values = model.decision_function(X_pca)
                    # Нормалізація для отримання значень між 0 і 1
                    decision_values = 1 / (1 + np.exp(-np.abs(decision_values)))
                # Для багатокласової класифікації
                else:
                    decision_values = model.decision_function(X_pca)
                    if decision_values.ndim > 1:
                        decision_values = np.max(np.abs(decision_values), axis=1)
                        decision_values = 1 / (1 + np.exp(-decision_values))
            # Якщо модель підтримує predict_proba
            elif hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba(X_pca)
                decision_values = np.max(probabilities, axis=1)
        except Exception as e:
            print(f"Помилка при обчисленні ймовірностей: {str(e)}")
            pass

        if decision_values is None:
            decision_values = [None] * len(predicted_labels)

        # Якщо probabilities не була встановлена, використовуємо decision_values або None
        if probabilities is None:
            if decision_values is not None:
                probabilities = decision_values
                if isinstance(probabilities, np.ndarray) and probabilities.ndim == 1:
                    probabilities = [[prob] if prob is not None else [None] for prob in probabilities]
            else:
                probabilities = [[None]] * len(predicted_labels)

        # Декодування міток
        predicted_labels_decoded = label_encoder.inverse_transform(predicted_labels)

        # Формування результатів
        predictions = []
        for i, (pred_label, prob_array) in enumerate(zip(predicted_labels_decoded, probabilities)):
            prob = max(prob_array) if hasattr(prob_array, '__iter__') else prob_array
            predictions.append({
                'index': i,
                'predicted_class': str(pred_label),
                'probability': float(prob) if prob is not None else None
            })

        # Підрахунок статистики
        class_counts = Counter(predicted_labels_decoded)
        class_distribution = {str(cls): int(count) for cls, count in class_counts.items()}

        # Підготовка результату
        result = {
            'predictions': predictions,
            'summary': {
                'total_records': len(df),
                'class_distribution': class_distribution
            }
        }

        return result

    except Exception as e:
        import traceback
        error_result = {
            'error': True,
            'message': str(e),
            'traceback': traceback.format_exc()
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({'error': True, 'message': 'Недостатньо аргументів. Потрібно: файл CSV та шлях до моделі.'}))
        sys.exit(1)

    csv_file_path = sys.argv[1]
    model_path = sys.argv[2]

    if not os.path.exists(csv_file_path):
        print(json.dumps({'error': True, 'message': f'Файл {csv_file_path} не існує.'}))
        sys.exit(1)

    if not os.path.exists(model_path):
        print(json.dumps({'error': True, 'message': f'Модель {model_path} не існує.'}))
        sys.exit(1)

    result = process_csv(csv_file_path, model_path)
    print(json.dumps(result))
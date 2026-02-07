
import sys
import json
import joblib
import pandas as pd
import numpy as np


# Load Model and Encoder
try:
    model = joblib.load('ml/crop_model.joblib')
    le = joblib.load('ml/label_encoder.joblib')
except Exception as e:
    print(json.dumps({'error': f"Model loading failed: {str(e)}"}))
    sys.exit(1)

# Read Input from Stdin
try:
    input_str = sys.stdin.read()
    if not input_str:
        print(json.dumps({'error': "No input provided"}))
        sys.exit(1)
        
    data = json.loads(input_str)
    
    # Expected keys: N, P, K, temperature, humidity, ph, rainfall
    # We need to ensure order matches training
    features = [
        data.get('N', 50),
        data.get('P', 50),
        data.get('K', 50),
        data.get('temperature', 25),
        data.get('humidity', 50),
        data.get('ph', 6.5),
        data.get('rainfall', 100)
    ]
    
    # Reshape for single prediction
    features_array = np.array(features).reshape(1, -1)
    
    # Predict
    # XGBoost returns class probabilities
    probabilities = model.predict_proba(features_array)[0]
    
    # Get top 3
    top3_indices = np.argsort(probabilities)[-3:][::-1]
    
    results = []
    class_names = le.inverse_transform(top3_indices) # Decode numerical labels to strings
    
    for i, idx in enumerate(top3_indices):
        results.append({
            'crop': class_names[i],
            'confidence': float(probabilities[idx])
        })
        
    print(json.dumps({'success': True, 'recommendations': results}))

except Exception as e:
    print(json.dumps({'error': str(e)}))
    sys.exit(1)


import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib
import os

print("Loading dataset...")
df = pd.read_csv('ml/crop_recommendation.csv')

features = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
target = df['label']

print("Encoding labels...")
le = LabelEncoder()
target_encoded = le.fit_transform(target)

# Save the encoder for inference
joblib.dump(le, 'ml/label_encoder.joblib')

print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(features, target_encoded, test_size=0.2, random_state=42)

print("Training XGBoost Classifier...")
# Enhanced XGBoost parameters for better accuracy
model = XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42,
    eval_metric='mlogloss'
)
model.fit(X_train, y_train)

predicted_values = model.predict(X_test)
x = accuracy_score(y_test, predicted_values)
print(f"Model Accuracy: {x*100:.2f}%")

# Save model
model_path = 'ml/crop_model.joblib'
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")
print(f"Label Encoder saved to ml/label_encoder.joblib")


import pandas as pd
import numpy as np
import random

# Define Extended Crop Requirements
# Based on agricultural standards (approximate optimal ranges)
CROPS = {
    'rice': {'N': 80, 'P': 40, 'K': 40, 'temp': 26, 'humid': 82, 'ph': 6.5, 'rain': 2000},
    'maize': {'N': 80, 'P': 40, 'K': 20, 'temp': 24, 'humid': 65, 'ph': 6.5, 'rain': 850},
    'chickpea': {'N': 40, 'P': 60, 'K': 80, 'temp': 18, 'humid': 16, 'ph': 7.0, 'rain': 80},
    'kidneybeans': {'N': 20, 'P': 60, 'K': 20, 'temp': 20, 'humid': 21, 'ph': 5.8, 'rain': 100},
    'pigeonpeas': {'N': 20, 'P': 60, 'K': 20, 'temp': 28, 'humid': 48, 'ph': 5.8, 'rain': 150},
    'mothbeans': {'N': 20, 'P': 40, 'K': 20, 'temp': 28, 'humid': 53, 'ph': 7.0, 'rain': 55},
    'mungbean': {'N': 20, 'P': 40, 'K': 20, 'temp': 28, 'humid': 85, 'ph': 6.8, 'rain': 48},
    'blackgram': {'N': 40, 'P': 60, 'K': 20, 'temp': 29, 'humid': 65, 'ph': 7.0, 'rain': 68},
    'lentil': {'N': 20, 'P': 60, 'K': 20, 'temp': 24, 'humid': 64, 'ph': 6.8, 'rain': 45},
    'pomegranate': {'N': 20, 'P': 20, 'K': 40, 'temp': 22, 'humid': 88, 'ph': 6.5, 'rain': 105},
    'banana': {'N': 100, 'P': 75, 'K': 50, 'temp': 27, 'humid': 80, 'ph': 6.0, 'rain': 1000},
    'mango': {'N': 20, 'P': 20, 'K': 30, 'temp': 31, 'humid': 50, 'ph': 6.0, 'rain': 950},
    'grapes': {'N': 20, 'P': 130, 'K': 200, 'temp': 24, 'humid': 81, 'ph': 6.0, 'rain': 700},
    'watermelon': {'N': 100, 'P': 10, 'K': 50, 'temp': 25, 'humid': 85, 'ph': 6.5, 'rain': 50},
    'muskmelon': {'N': 100, 'P': 10, 'K': 50, 'temp': 28, 'humid': 90, 'ph': 6.5, 'rain': 24},
    'apple': {'N': 20, 'P': 130, 'K': 200, 'temp': 22, 'humid': 90, 'ph': 6.0, 'rain': 110},
    'orange': {'N': 20, 'P': 10, 'K': 10, 'temp': 22, 'humid': 90, 'ph': 7.0, 'rain': 110},
    'papaya': {'N': 50, 'P': 50, 'K': 50, 'temp': 33, 'humid': 90, 'ph': 6.7, 'rain': 150},
    'coconut': {'N': 20, 'P': 30, 'K': 30, 'temp': 27, 'humid': 95, 'ph': 5.8, 'rain': 150},
    'cotton': {'N': 120, 'P': 60, 'K': 40, 'temp': 24, 'humid': 80, 'ph': 7.0, 'rain': 700},
    'jute': {'N': 80, 'P': 40, 'K': 40, 'temp': 25, 'humid': 80, 'ph': 6.7, 'rain': 170},
    'coffee': {'N': 100, 'P': 20, 'K': 30, 'temp': 25, 'humid': 58, 'ph': 6.8, 'rain': 160}
}


SAMPLES_PER_CROP = 2000 # Increased sample size
data = []

print(f"Generating synthetic data for {len(CROPS)} crops...")

for crop, req in CROPS.items():
    for _ in range(SAMPLES_PER_CROP):
        # Generate varied conditions using normal distribution around optimal values
        
        # NPK with some variance
        n = int(np.random.normal(req['N'], 15))
        n = max(0, min(140, n))
        
        p = int(np.random.normal(req['P'], 15))
        p = max(5, min(145, p))
        
        k = int(np.random.normal(req['K'], 15))
        k = max(5, min(205, k))
        
        # Environmental factors
        temp = np.random.normal(req['temp'], 3)
        temp = max(5, min(50, temp)) # Climate bounds
        
        humidity = np.random.normal(req['humid'], 5)
        humidity = max(10, min(100, humidity))
        
        ph = np.random.normal(req['ph'], 0.5)
        ph = max(3.5, min(9.9, ph))
        
        rain = np.random.normal(req['rain'], 50) # Variance in rain
        rain = max(20, min(2900, rain))
        
        data.append([n, p, k, temp, humidity, ph, rain, crop])

# Create DataFrame
columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label']
df = pd.DataFrame(data, columns=columns)

# Shuffle
df = df.sample(frac=1).reset_index(drop=True)

# Save
output_path = 'ml/crop_recommendation.csv'
df.to_csv(output_path, index=False)
print(f"Data generation complete: {output_path}")
print(f"Total samples: {len(df)}")

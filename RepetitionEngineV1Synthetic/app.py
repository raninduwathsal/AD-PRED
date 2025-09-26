from flask import Flask, request, jsonify
import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

# Initialize Flask app
app = Flask(__name__)

# Load the trained model and label encoders
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('le_user.pkl', 'rb') as f:
        le_user = pickle.load(f)
    with open('le_card.pkl', 'rb') as f:
        le_card = pickle.load(f)
    with open('le_chapter.pkl', 'rb') as f:
        le_chapter = pickle.load(f)
    print("All models and encoders loaded successfully!")
except FileNotFoundError as e:
    raise Exception(f"Missing pickle file: {str(e)}")
except Exception as e:
    raise Exception(f"Failed to load pickle files: {str(e)}")

# Define expected features for the model
FEATURES = ['user_id_enc', 'card_id_enc', 'time_since_last_review', 
            'times_reviewed', 'last_attempt_correct', 'card_difficulty']

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input data from request
        input_data = request.json.get('data', [])
        if not input_data:
            return jsonify({'error': 'No data provided'}), 400

        # Convert input to DataFrame
        df = pd.DataFrame(input_data)

        # Validate required columns
        required_cols = ['user_id', 'card_id', 'chapter', 'time_since_last_review', 
                        'times_reviewed', 'last_attempt_correct', 'card_difficulty']
        if not all(col in df.columns for col in required_cols):
            return jsonify({'error': 'Missing required columns'}), 400

        # Encode categorical features
        try:
            df['user_id_enc'] = le_user.transform(df['user_id'])
            df['card_id_enc'] = le_card.transform(df['card_id'])
            df['chapter_enc'] = le_chapter.transform(df['chapter'])
        except ValueError as e:
            return jsonify({'error': f'Invalid categorical value: {str(e)}'}), 400

        # Prepare features for prediction (exclude chapter_enc as it's not used in model)
        X = df[FEATURES]

        # Get probabilities (probability of class 1 = correct)
        probs = model.predict_proba(X)[:, 1]

        # Return predictions
        return jsonify({'predictions': probs.tolist()})

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, render_template, request
from flask_cors import CORS
import joblib
import numpy as np
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
model = joblib.load('diabetes_model.pkl')


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input values from form
        bmi = float(request.form['bmi'])
        s5 = float(request.form['s5'])
        bp = float(request.form['bp'])

        # Make prediction
        features = np.array([[bmi, s5, bp]])
        prediction = model.predict(features)[0]

        return render_template('index.html',
                               prediction_text=f'Predicted Diabetes Progression: {prediction:.2f}')
    except Exception as e:
        return render_template('index.html',
                               prediction_text=f'Error: {str(e)}')


@app.route('/api/predict', methods=['POST'])
def api_predict():
    try:
        # Get input values from JSON or form data
        if request.is_json:
            data = request.get_json()
            bmi = float(data['bmi'])
            s5 = float(data['s5'])
            bp = float(data['bp'])
        else:
            bmi = float(request.form['bmi'])
            s5 = float(request.form['s5'])
            bp = float(request.form['bp'])

        # Make prediction
        features = np.array([[bmi, s5, bp]])
        prediction = model.predict(features)[0]

        return {
            'success': True,
            'prediction': float(prediction),
            'inputs': {
                'bmi': bmi,
                's5': s5,
                'bp': bp
            }
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'prediction': 0
        }, 400


if __name__ == '__main__':
    app.run(debug=True)
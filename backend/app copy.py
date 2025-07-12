from flask import Flask, render_template, request
import joblib
import numpy as np

app = Flask(__name__)

# Load the trained model
model = joblib.load('diabetes_model.pkl')


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    # Get input values from form
    bmi = float(request.form['bmi'])
    s5 = float(request.form['s5'])
    bp = float(request.form['bp'])

    # Make prediction
    features = np.array([[bmi, s5, bp]])
    prediction = model.predict(features)[0]

    return render_template('index.html',
                           prediction_text=f'Predicted Diabetes Progression: {prediction:.2f}')


if __name__ == '__main__':
    app.run(debug=True)
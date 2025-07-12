import React, { useState } from 'react';
import { Heart, Calculator, TrendingUp, Brain, AlertTriangle } from 'lucide-react';
import DiabetesForm from './components/DiabetesForm';
import RiskResults from './components/RiskResults';
import { calculateDiabetesRisk } from './utils/riskCalculator';
import { makePrediction } from './utils/apiService';

interface FormData {
  bmi: number;
  s5: number;
  bp: number;
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRealtimeLoading, setIsRealtimeLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [formInputs, setFormInputs] = useState<FormData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [realtimePrediction, setRealtimePrediction] = useState<number | null>(null);

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true);
    setFormInputs(data);
    setApiError(null);
    
    try {
      // Make prediction using the backend model
      console.log('Submitting form data:', data);
      const predictionResult = await makePrediction(data);
      console.log('Prediction result:', predictionResult);
      
      let riskResult;
      if (predictionResult.success) {
        // Use model prediction in risk calculation
        console.log('Using model prediction:', predictionResult.prediction);
        riskResult = calculateDiabetesRisk(data, predictionResult.prediction);
      } else {
        // Fallback to deterministic calculation if API fails
        console.log('Using fallback calculation due to:', predictionResult.error);
        setApiError(predictionResult.error || 'Backend model unavailable');
        riskResult = calculateDiabetesRisk(data);
      }
      
      setResults(riskResult);
    } catch (error) {
      console.error('Error during prediction:', error);
      setApiError('Unable to connect to prediction service');
      // Fallback to deterministic calculation
      const riskResult = calculateDiabetesRisk(data);
      setResults(riskResult);
    }
    
    setIsLoading(false);
  };

  const handleRealtimeUpdate = async (data: FormData) => {
    setIsRealtimeLoading(true);
    
    try {
      const { makeRealtimePrediction } = await import('./utils/apiService');
      
      makeRealtimePrediction(data, (result) => {
        if (result.success) {
          setRealtimePrediction(result.prediction);
        } else {
          setRealtimePrediction(null);
        }
        setIsRealtimeLoading(false);
      });
    } catch (error) {
      setIsRealtimeLoading(false);
      setRealtimePrediction(null);
    }
  };

  const handleNewAssessment = () => {
    setResults(null);
    setFormInputs(null);
    setApiError(null);
    setRealtimePrediction(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Diabetes Risk Calculator</h1>
              <p className="text-gray-600">Stable, consistent health risk assessment</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!results ? (
          <div className="space-y-8">
            {/* API Status */}
            {apiError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">Backend Model Status</p>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  {apiError}. Using fallback risk calculation method.
                </p>
              </div>
            )}

            {/* Introduction */}
            <div className="text-center bg-white rounded-xl shadow-lg p-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Assess Your Diabetes Risk
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Our trained machine learning model provides accurate diabetes risk assessment based on 
                your Body Mass Index, blood serum measurements, and blood pressure. The model has been 
                trained on medical data to provide reliable predictions and personalized recommendations.
              </p>
              
              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">AI-Powered</h3>
                  <p className="text-sm text-gray-600">Trained machine learning model for accurate predictions</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Medical Grade</h3>
                  <p className="text-sm text-gray-600">Based on established health parameters</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Reliable Results</h3>
                  <p className="text-sm text-gray-600">Consistent predictions with fallback support</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <DiabetesForm 
              onSubmit={handleFormSubmit} 
              onRealtimeUpdate={handleRealtimeUpdate}
              isLoading={isLoading} 
              realtimePrediction={realtimePrediction}
              isRealtimeLoading={isRealtimeLoading}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* API Status for Results */}
            {apiError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">Note</p>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  Results calculated using fallback method due to backend unavailability.
                </p>
              </div>
            )}

            {/* Results */}
            <RiskResults result={results} inputs={formInputs!} />
            
            {/* New Assessment Button */}
            <div className="text-center">
              <button
                onClick={handleNewAssessment}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                New Assessment
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 text-sm">
            This tool provides educational estimates only. Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
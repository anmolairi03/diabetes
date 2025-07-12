import React, { useState } from 'react';
import { Calculator, User, Activity, Heart, Loader2, TrendingUp } from 'lucide-react';

interface FormData {
  bmi: number;
  s5: number;
  bp: number;
}

interface DiabetesFormProps {
  onSubmit: (data: FormData) => void;
  onRealtimeUpdate?: (data: FormData) => void;
  isLoading: boolean;
  realtimePrediction?: number | null;
  isRealtimeLoading?: boolean;
}

const DiabetesForm: React.FC<DiabetesFormProps> = ({ 
  onSubmit, 
  onRealtimeUpdate, 
  isLoading, 
  realtimePrediction,
  isRealtimeLoading 
}) => {
  const [formData, setFormData] = useState<FormData>({
    bmi: 0,
    s5: 0,
    bp: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (formData.bmi === 0 || formData.bmi < 10 || formData.bmi > 50) {
      newErrors.bmi = 'BMI must be between 10 and 50 kg/m²';
    }

    if (formData.s5 < -0.2 || formData.s5 > 0.2) {
      newErrors.s5 = 'S5 value must be between -0.2 and 0.2';
    }

    if (formData.bp === 0 || formData.bp < 60 || formData.bp > 200) {
      newErrors.bp = 'Blood pressure must be between 60 and 200 mmHg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
    
    // Trigger real-time update
    const newData = { ...formData, [field]: numValue };
    if (onRealtimeUpdate && isValidForPrediction(newData)) {
      onRealtimeUpdate(newData);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isValidForPrediction = (data: FormData): boolean => {
    return data.bmi > 0 && data.bmi >= 10 && data.bmi <= 50 &&
           data.s5 >= -0.2 && data.s5 <= 0.2 &&
           data.bp > 0 && data.bp >= 60 && data.bp <= 200;
  };

  const getInputClassName = (field: keyof FormData) => {
    const baseClass = "w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    return errors[field] 
      ? `${baseClass} border-red-500 bg-red-50` 
      : `${baseClass} border-gray-300 focus:border-blue-500`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Health Assessment</h2>
        <p className="text-gray-600">Enter your health metrics for diabetes risk analysis</p>
        
        {/* Real-time Prediction Display */}
        {(realtimePrediction !== null && realtimePrediction !== undefined) && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Live Prediction</span>
              {isRealtimeLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {realtimePrediction.toFixed(1)}
            </div>
            <div className="text-sm text-blue-600">
              Diabetes progression score from AI model
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BMI Input */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <User className="w-5 h-5 text-blue-600" />
            Body Mass Index (BMI)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="10"
              max="50"
              value={formData.bmi || ''}
              onChange={(e) => handleInputChange('bmi', e.target.value)}
              className={getInputClassName('bmi')}
              placeholder="Enter your BMI (e.g., 25.5)"
              disabled={isLoading}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
              kg/m²
            </div>
          </div>
          {errors.bmi && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
              {errors.bmi}
            </p>
          )}
          <p className="text-gray-500 text-sm">Normal range: 18.5 - 24.9 kg/m²</p>
        </div>

        {/* S5 Input */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Activity className="w-5 h-5 text-blue-600" />
            Blood Serum Measurement (S5)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.001"
              min="-0.2"
              max="0.2"
              value={formData.s5 || ''}
              onChange={(e) => handleInputChange('s5', e.target.value)}
              className={getInputClassName('s5')}
              placeholder="Enter S5 value (e.g., 0.045)"
              disabled={isLoading}
            />
          </div>
          {errors.s5 && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
              {errors.s5}
            </p>
          )}
          <p className="text-gray-500 text-sm">Normalized blood serum measurement</p>
        </div>

        {/* Blood Pressure Input */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Heart className="w-5 h-5 text-blue-600" />
            Blood Pressure (Systolic)
          </label>
          <div className="relative">
            <input
              type="number"
              min="60"
              max="200"
              value={formData.bp || ''}
              onChange={(e) => handleInputChange('bp', e.target.value)}
              className={getInputClassName('bp')}
              placeholder="Enter systolic BP (e.g., 120)"
              disabled={isLoading}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
              mmHg
            </div>
          </div>
          {errors.bp && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
              {errors.bp}
            </p>
          )}
          <p className="text-gray-500 text-sm">Normal range: 90 - 120 mmHg</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Analyze Risk
            </>
          )}
        </button>

        {/* Quick Fill Demo Button */}
        <button
          type="button"
          onClick={() => {
            const sampleData = {
              bmi: 25.5,
              s5: 0.045,
              bp: 120,
            };
            setFormData(sampleData);
            setErrors({});
            if (onRealtimeUpdate) {
              onRealtimeUpdate(sampleData);
            }
          }}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 border-2 border-gray-300 hover:border-gray-400"
          disabled={isLoading}
        >
          Use Sample Data
        </button>
      </form>
    </div>
  );
};

export default DiabetesForm;
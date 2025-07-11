import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Heart, Activity, User, Brain } from 'lucide-react';

interface RiskResult {
  score: number;
  riskLevel: 'low' | 'moderate' | 'high';
  percentage: number;
  modelPrediction?: number;
  recommendations: string[];
  factors: {
    bmi: { score: number; status: 'normal' | 'elevated' | 'high' };
    s5: { score: number; status: 'normal' | 'elevated' | 'high' };
    bp: { score: number; status: 'normal' | 'elevated' | 'high' };
  };
}

interface RiskResultsProps {
  result: RiskResult;
  inputs: {
    bmi: number;
    s5: number;
    bp: number;
  };
}

const RiskResults: React.FC<RiskResultsProps> = ({ result, inputs }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-6 h-6" />;
      case 'moderate': return <AlertTriangle className="w-6 h-6" />;
      case 'high': return <XCircle className="w-6 h-6" />;
      default: return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'bmi': return <User className="w-5 h-5" />;
      case 's5': return <Activity className="w-5 h-5" />;
      case 'bp': return <Heart className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getFactorName = (factor: string) => {
    switch (factor) {
      case 'bmi': return 'Body Mass Index';
      case 's5': return 'Blood Serum (S5)';
      case 'bp': return 'Blood Pressure';
      default: return factor;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-700 bg-green-100';
      case 'elevated': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Risk Level Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${getRiskColor(result.riskLevel)} mb-4`}>
          {getRiskIcon(result.riskLevel)}
          <span className="font-bold text-lg capitalize">{result.riskLevel} Risk</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{result.percentage}%</h2>
        <p className="text-gray-600">Estimated diabetes risk based on your health metrics</p>
      </div>

      {/* Risk Score */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Risk Score</span>
          <span className="text-2xl font-bold text-gray-800">{result.score.toFixed(1)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${
              result.riskLevel === 'low' ? 'bg-green-500' :
              result.riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(result.score * 10, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Model Prediction */}
      {result.modelPrediction !== undefined && (
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">AI Model Prediction</h3>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Diabetes Progression Score</span>
            <span className="text-2xl font-bold text-blue-800">{result.modelPrediction.toFixed(1)}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full bg-blue-600 transition-all duration-1000"
              style={{ width: `${Math.min((result.modelPrediction / 200) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-600 mt-2">
            <span>0</span>
            <span>100</span>
            <span>200+</span>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            This score is generated by a trained machine learning model using your health metrics.
          </p>
        </div>
      )}

      {/* Factor Analysis */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Factor Analysis</h3>
        <div className="space-y-4">
          {Object.entries(result.factors).map(([factor, data]) => (
            <div key={factor} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-blue-600">
                  {getFactorIcon(factor)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{getFactorName(factor)}</p>
                  <p className="text-sm text-gray-600">
                    Value: {
                      factor === 'bmi' ? `${inputs.bmi} kg/m²` :
                      factor === 's5' ? inputs.s5.toFixed(3) :
                      `${inputs.bp} mmHg`
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
                  {data.status}
                </div>
                <p className="text-sm text-gray-600 mt-1">Score: {data.score.toFixed(1)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {result.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          <strong>Disclaimer:</strong> This assessment is for informational purposes only and should not replace professional medical advice. 
          Please consult with a healthcare provider for proper diagnosis and treatment.
        </p>
      </div>
    </div>
  );
};

export default RiskResults;
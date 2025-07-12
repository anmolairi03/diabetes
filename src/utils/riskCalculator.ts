// Enhanced diabetes risk calculation using backend model predictions
// This function provides consistent results and integrates with the trained model

interface RiskInput {
  bmi: number;
  s5: number;
  bp: number;
}

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

export const calculateDiabetesRisk = (input: RiskInput, modelPrediction?: number): RiskResult => {
  // BMI risk scoring (0-4 points)
  const bmiScore = (() => {
    if (input.bmi < 18.5) return 1.0; // Underweight
    if (input.bmi <= 24.9) return 0.5; // Normal
    if (input.bmi <= 29.9) return 2.0; // Overweight
    if (input.bmi <= 34.9) return 3.0; // Obese Class I
    return 4.0; // Obese Class II+
  })();

  const bmiStatus = (() => {
    if (input.bmi <= 24.9) return 'normal';
    if (input.bmi <= 29.9) return 'elevated';
    return 'high';
  })();

  // S5 (blood serum) risk scoring (0-3 points)
  const s5Score = (() => {
    const normalizedS5 = Math.abs(input.s5);
    if (normalizedS5 <= 0.05) return 0.5;
    if (normalizedS5 <= 0.1) return 1.5;
    if (normalizedS5 <= 0.15) return 2.5;
    return 3.0;
  })();

  const s5Status = (() => {
    const normalizedS5 = Math.abs(input.s5);
    if (normalizedS5 <= 0.05) return 'normal';
    if (normalizedS5 <= 0.1) return 'elevated';
    return 'high';
  })();

  // Blood pressure risk scoring (0-3 points)
  const bpScore = (() => {
    if (input.bp < 90) return 1.0; // Low
    if (input.bp <= 120) return 0.5; // Normal
    if (input.bp <= 139) return 1.5; // Elevated
    if (input.bp <= 159) return 2.5; // High Stage 1
    return 3.0; // High Stage 2+
  })();

  const bpStatus = (() => {
    if (input.bp <= 120) return 'normal';
    if (input.bp <= 139) return 'elevated';
    return 'high';
  })();

  // Calculate total risk score (0-10 scale)
  let totalScore = bmiScore + s5Score + bpScore;

  // If we have a model prediction, incorporate it into the scoring
  if (modelPrediction !== undefined) {
    // Normalize model prediction to 0-4 scale and add to total score
    const normalizedModelScore = Math.max(0, Math.min(4, modelPrediction / 50)); // Assuming model outputs 0-200 range
    totalScore = (totalScore + normalizedModelScore) / 2; // Average with existing score
  }

  // Determine risk level and percentage
  const riskLevel: 'low' | 'moderate' | 'high' = (() => {
    if (totalScore <= 3) return 'low';
    if (totalScore <= 6) return 'moderate';
    return 'high';
  })();

  // Convert score to percentage (enhanced with model prediction)
  let percentage: number;
  if (modelPrediction !== undefined) {
    // Use model prediction to calculate more accurate percentage
    percentage = Math.round(Math.min(100, Math.max(5, (modelPrediction / 200) * 100)));
  } else {
    // Fallback to score-based calculation
    percentage = Math.round(Math.min(100, (totalScore / 10) * 85 + 5));
  }

  // Generate recommendations based on factors and model prediction
  const recommendations: string[] = [];
  
  if (bmiScore >= 2) {
    recommendations.push("Consider weight management through balanced diet and regular exercise to achieve a healthy BMI (18.5-24.9).");
  }
  
  if (s5Score >= 2) {
    recommendations.push("Monitor blood glucose levels regularly and discuss metabolic health with your healthcare provider.");
  }
  
  if (bpScore >= 2) {
    recommendations.push("Focus on blood pressure management through lifestyle changes and regular monitoring.");
  }
  
  if (modelPrediction !== undefined && modelPrediction > 100) {
    recommendations.push("Your risk assessment indicates elevated diabetes progression risk. Schedule a comprehensive health evaluation with your healthcare provider.");
  }
  
  if (totalScore >= 5 || (modelPrediction !== undefined && modelPrediction > 75)) {
    recommendations.push("Schedule regular check-ups with your healthcare provider for diabetes screening and prevention strategies.");
  }
  
  // Always include general recommendations
  recommendations.push("Maintain a balanced diet rich in vegetables, lean proteins, and whole grains while limiting processed foods and sugars.");
  recommendations.push("Engage in at least 150 minutes of moderate-intensity exercise per week.");
  
  if (riskLevel === 'low' && (modelPrediction === undefined || modelPrediction < 50)) {
    recommendations.push("Continue your current healthy lifestyle and have routine health screenings as recommended by your doctor.");
  }

  return {
    score: totalScore,
    riskLevel,
    percentage,
    modelPrediction,
    recommendations,
    factors: {
      bmi: { score: bmiScore, status: bmiStatus },
      s5: { score: s5Score, status: s5Status },
      bp: { score: bpScore, status: bpStatus }
    }
  };
};
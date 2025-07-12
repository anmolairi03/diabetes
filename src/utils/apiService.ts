interface PredictionRequest {
  bmi: number;
  s5: number;
  bp: number;
}

interface PredictionResponse {
  prediction: number;
  success: boolean;
  error?: string;
}

export const makePrediction = async (data: PredictionRequest): Promise<PredictionResponse> => {
  try {
    const formData = new FormData();
    formData.append('bmi', data.bmi.toString());
    formData.append('s5', data.s5.toString());
    formData.append('bp', data.bp.toString());

    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        prediction: result.prediction,
        success: true
      };
    } else {
      throw new Error(result.error || 'Prediction failed');
    }
  } catch (error) {
    return {
      prediction: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Debounced version for real-time predictions
let debounceTimer: NodeJS.Timeout;

export const makeRealtimePrediction = async (
  data: PredictionRequest, 
  callback: (result: PredictionResponse) => void,
  delay: number = 500
): Promise<void> => {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new timer
  debounceTimer = setTimeout(async () => {
    const result = await makePrediction(data);
    callback(result);
  }, delay);
};
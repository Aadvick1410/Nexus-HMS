import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

let genAI, model;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. Using mock AI service responses.");
}

export const analyzeSymptoms = async (symptoms, vitals) => {
  if (!apiKey) {
    return {
      triageLevel: "Urgent",
      possibleConditions: ["Viral Fever (Mock)", "Dehydration (Mock)"],
      recommendation: "Please consult a doctor immediately."
    };
  }

  const prompt = `Analyze the following patient symptoms and vitals.
  Symptoms: ${symptoms}
  Vitals: ${JSON.stringify(vitals)}
  
  Provide a JSON response with the following structure:
  {
    "triageLevel": "string (e.g., Routine, Urgent, Emergency)",
    "possibleConditions": ["array of strings"],
    "recommendation": "string"
  }`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};

export const summarizeHistory = async (patientHistoryData) => {
  if (!apiKey) {
    return {
      summary: "Patient has a history of mock ailments and recovered well.",
      keyPoints: ["Mock point 1", "Mock point 2"]
    };
  }

  const prompt = `Summarize the following patient medical history data.
  Data: ${JSON.stringify(patientHistoryData)}
  
  Provide a JSON response with the following structure:
  {
    "summary": "string (a concise paragraph)",
    "keyPoints": ["array of strings (key medical events or chronic conditions)"]
  }`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};

export const explainPrescription = async (medicineData) => {
  if (!apiKey) {
    return {
      explanation: "Take this mock medicine twice a day.",
      sideEffects: ["Drowsiness (Mock)"]
    };
  }

  const prompt = `Explain the following prescription to a patient in simple terms.
  Prescription Data: ${JSON.stringify(medicineData)}
  
  Provide a JSON response with the following structure:
  {
    "explanation": "string (simple explanation of how and when to take)",
    "sideEffects": ["array of strings (common side effects)"]
  }`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};

export const generateOperationsInsights = async (kpiData) => {
  if (!apiKey) {
    return {
      insights: ["Patient flow is smooth (Mock).", "ICU occupancy is at 80% (Mock)."],
      recommendations: ["Increase staff for night shift (Mock)."]
    };
  }

  const prompt = `Generate insights for hospital administration based on the following KPI data.
  KPI Data: ${JSON.stringify(kpiData)}
  
  Provide a JSON response with the following structure:
  {
    "insights": ["array of strings (observations about operations)"],
    "recommendations": ["array of strings (actionable recommendations)"]
  }`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};

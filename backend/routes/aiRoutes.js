import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { analyzeSymptoms, summarizeHistory, explainPrescription, generateOperationsInsights } from '../services/aiService.js';

const router = express.Router();

router.post('/symptom-triage', protect, async (req, res) => {
  try {
    const { symptoms, vitals } = req.body;
    const result = await analyzeSymptoms(symptoms, vitals);
    res.json(result);
  } catch (error) {
    console.error("AI Service Error:", error);
    res.status(500).json({ message: "Failed to analyze symptoms" });
  }
});

router.post('/summarize-history', protect, async (req, res) => {
  try {
    const { patientHistoryData } = req.body;
    const result = await summarizeHistory(patientHistoryData);
    res.json(result);
  } catch (error) {
    console.error("AI Service Error:", error);
    res.status(500).json({ message: "Failed to summarize history" });
  }
});

router.post('/explain-prescription', protect, async (req, res) => {
  try {
    const { medicineData } = req.body;
    const result = await explainPrescription(medicineData);
    res.json(result);
  } catch (error) {
    console.error("AI Service Error:", error);
    res.status(500).json({ message: "Failed to explain prescription" });
  }
});

router.post('/admin-insights', protect, async (req, res) => {
  try {
    const { kpiData } = req.body;
    const result = await generateOperationsInsights(kpiData);
    res.json(result);
  } catch (error) {
    console.error("AI Service Error:", error);
    res.status(500).json({ message: "Failed to generate admin insights" });
  }
});

export default router;

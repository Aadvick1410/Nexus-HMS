import asyncHandler from 'express-async-handler';
import axios from 'axios';
import Mood from '../models/Mood.js';
import Appointment from '../models/Appointment.js';

// @desc    Log a daily mood
// @route   POST /api/quirky/mood
// @access  Private (All Users)
const logMood = asyncHandler(async (req, res) => {
  const { emoji, note } = req.body;

  const mood = await Mood.create({
    userId: req.user._id,
    emoji,
    note,
  });

  res.status(201).json(mood);
});

// @desc    Get random health trivia
// @route   GET /api/quirky/trivia
// @access  Public
const getTrivia = asyncHandler(async (req, res) => {
  const triviaList = [
    "Your heart beats about 115,000 times a day.",
    "The human body contains enough fat to make seven bars of soap.",
    "Your bones are composed of 31% water.",
    "Laughing is good for the heart and can increase blood flow by 20 percent.",
    "An apple a day really does keep the doctor away—apples are packed with immune-boosting vitamin C."
  ];
  
  const randomTrivia = triviaList[Math.floor(Math.random() * triviaList.length)];
  res.json({ trivia: randomTrivia });
});

// @desc    Generate Doctor Superpower Title
// @route   GET /api/quirky/doctor/:id/superpower
// @access  Private
const getDoctorSuperpower = asyncHandler(async (req, res) => {
  // In a real app, this would aggregate actual appointment data.
  // For demo, we do a basic check and assign a fun title.
  const appointments = await Appointment.find({ doctorId: req.params.id, status: 'Completed' });
  
  let title = "The Rookie";
  let description = "Just getting started on their healing journey.";

  if (appointments.length > 50) {
    title = "The Speedrunner";
    description = "Known for lightning-fast, accurate consultations.";
  } else if (appointments.length > 20) {
    title = "The Oracle";
    description = "Has a high accuracy rate in AI symptom predictions.";
  } else if (appointments.length > 0) {
    title = "The Night Owl";
    description = "Takes on the toughest late-night cases.";
  }

  res.json({
    title,
    description,
    totalCompleted: appointments.length
  });
});

// @desc    Generate Discharge Haiku
// @route   POST /api/quirky/haiku
// @access  Private (Doctor, Admin)
const generateDischargeHaiku = asyncHandler(async (req, res) => {
  const { patientName, condition } = req.body;

  try {
    // Calling our Python AI Microservice
    const response = await axios.post('http://localhost:8000/api/ai/generate-haiku', {
      patient_name: patientName,
      condition: condition
    });

    res.json({ haiku: response.data.haiku });
  } catch (error) {
    // Fallback if AI service is down
    res.json({
      haiku: `Healing path is walked,\n${patientName} shines bright and renewed,\nHealth blooms like the spring.`
    });
  }
});

export { logMood, getTrivia, getDoctorSuperpower, generateDischargeHaiku };

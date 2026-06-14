from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import asyncio

# Setup FastAPI App
app = FastAPI(title="Nexus HMS AI Microservice", version="1.0.0")

# ---------------------------------------------------------
# Pydantic Models for Input Validation
# ---------------------------------------------------------
class SymptomInput(BaseModel):
    symptoms: List[str]

class RecordInput(BaseModel):
    patient_history: str

class PrescriptionInput(BaseModel):
    medicine_name: str
    dosage: str

class AppointmentInput(BaseModel):
    patient_query: str

class OperationsInput(BaseModel):
    query: str
    kpi_data: dict

class HaikuInput(BaseModel):
    patient_name: str
    condition: str

# ---------------------------------------------------------
# Simulated LLM Agent Functions (Mocked for Demo)
# In production, these use langchain + Gemini API
# ---------------------------------------------------------

async def analyze_symptoms(symptoms: List[str]) -> dict:
    await asyncio.sleep(1.5) # Simulate API latency
    
    symptoms_str = ", ".join(symptoms).lower()
    
    # Simple rule-based mock logic to simulate an LLM's classification
    if "chest pain" in symptoms_str or "breathing" in symptoms_str:
        return {
            "possible_conditions": ["Myocardial Infarction", "Severe Asthma", "Pulmonary Embolism"],
            "recommended_department": "Cardiology / Emergency",
            "urgency_level": "EMERGENCY"
        }
    elif "fever" in symptoms_str and "cough" in symptoms_str:
        return {
            "possible_conditions": ["Viral Infection", "Influenza", "COVID-19"],
            "recommended_department": "General Medicine",
            "urgency_level": "MEDIUM"
        }
    else:
        return {
            "possible_conditions": ["General Malaise", "Fatigue"],
            "recommended_department": "General Medicine",
            "urgency_level": "LOW"
        }

async def summarize_record(history: str) -> str:
    await asyncio.sleep(1.5)
    return "Patient has a history of chronic conditions requiring management. Prior surgeries noted without recent complications. Currently stable on prescribed medication regimen. No severe allergies reported."

async def explain_prescription(medicine: str, dosage: str) -> str:
    await asyncio.sleep(1)
    return f"You should take {medicine} exactly as prescribed ({dosage}). Please take it with food to avoid an upset stomach, and do not skip doses. If you feel dizzy, contact your doctor."

async def suggest_appointment(query: str) -> dict:
    await asyncio.sleep(1)
    return {
        "suggested_department": "Cardiology",
        "reasoning": "The patient mentioned heart palpitations.",
        "recommended_action": "Book an appointment with Dr. Smith (Cardiologist) this week."
    }

async def analyze_operations(query: str, data: dict) -> str:
    await asyncio.sleep(2)
    return "Based on the provided KPIs, revenue dropped by 12% this month due to a 20% decrease in outpatient visits in the Orthopedics department. Recommend launching a local health awareness campaign to boost bookings."

async def generate_haiku(name: str, condition: str) -> str:
    await asyncio.sleep(1)
    # Quirky feature!
    return f"Healing path is walked,\n{name} shines bright and renewed,\nHealth blooms like the spring."

# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------

@app.get("/")
def read_root():
    return {"message": "Nexus HMS AI Service is running."}

@app.post("/api/ai/symptoms")
async def api_analyze_symptoms(payload: SymptomInput):
    """AI Symptom Analyzer"""
    result = await analyze_symptoms(payload.symptoms)
    return result

@app.post("/api/ai/summarize-record")
async def api_summarize_record(payload: RecordInput):
    """AI Medical Record Summarizer"""
    result = await summarize_record(payload.patient_history)
    return {"summary": result}

@app.post("/api/ai/explain-prescription")
async def api_explain_prescription(payload: PrescriptionInput):
    """AI Prescription Explanation Bot"""
    result = await explain_prescription(payload.medicine_name, payload.dosage)
    return {"explanation": result}

@app.post("/api/ai/appointment-assistant")
async def api_appointment_assistant(payload: AppointmentInput):
    """AI Appointment Assistant"""
    result = await suggest_appointment(payload.patient_query)
    return result

@app.post("/api/ai/operations-dashboard")
async def api_operations_dashboard(payload: OperationsInput):
    """AI Operations Dashboard Analyzer"""
    result = await analyze_operations(payload.query, payload.kpi_data)
    return {"insight": result}

@app.post("/api/ai/generate-haiku")
async def api_generate_haiku(payload: HaikuInput):
    """AI Quirky Feature: Get Well Soon Haiku"""
    result = await generate_haiku(payload.patient_name, payload.condition)
    return {"haiku": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

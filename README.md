# 🏥 AI-Powered Hospital & Healthcare Management System (Enterprise Edition)

![Hospital AI](https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop)

An enterprise-grade, full-stack Hospital Management System designed specifically to handle complex role-based access, multi-department operations, real-time communications, and state-of-the-art Generative AI integration (Google Gemini).

Built using the **MERN** stack (MongoDB, Express, React, Node.js) with a modern **Glassmorphism** UI.

## 🚀 Features at a Glance

- **Complex Role-Based Access Control (RBAC):** 9 Distinct Roles (Patient, Doctor, Nurse, Receptionist, Lab Tech, Pharmacist, Billing, Hospital Admin, Super Admin).
- **Multi-Department Architecture:** Seamless data flow across Cardiology, Neurology, Orthopedics, etc.
- **Clinical Workflows:** EMR, Prescriptions, Lab Orders, Pharmacy dispensing, and automated Billing.
- **Real-Time Operations:** Live WebSockets (Socket.io) for push notifications (e.g., Doctor is notified instantly when an appointment is booked).
- **Analytics:** Admin dashboard equipped with `recharts` for Revenue, Department Load, and Doctor Utilization tracking.

---

## 🤖 4. AI Agent Design (Google Gemini API)

This system integrates the **Google Gemini-1.5-Flash** model to provide intelligent agents for both patients and medical staff.

### System Prompts
Each AI agent is governed by strict system prompts to prevent hallucinations and enforce safety. 
- **Symptom Analyzer:** *“You are a medical triage assistant. Analyze patient symptoms, suggest a hospital department, and determine urgency (Low/Medium/High/Emergency). NEVER provide a definitive diagnosis.”*
- **Prescription Explainer:** *“You are a friendly pharmacist. Explain these medications in simple, plain English. Highlight how to take them and common side effects.”*
- **Record Summarizer:** *“You are a clinical assistant. Summarize this patient's medical history into 3 concise, bulleted points for a doctor to review quickly before a consultation.”*

### Context Handling
Context is handled dynamically by the Node.js backend. When a doctor requests a summary, the backend aggregates the patient's past `Appointments`, `Lab Tests`, and `Prescriptions` from MongoDB, converts it into a structured JSON payload, and injects it into the prompt as the clinical context.

### Memory Strategy
Currently, the AI features operate in a **stateless** manner (Zero-Shot classification and summarization). However, we simulate "memory" by fetching the user's historical data directly from the MongoDB database immediately prior to the AI call, ensuring the AI's response is highly contextualized to the patient's entire lifecycle without needing an expensive vector database.

### Prompt Engineering Approach
We utilize a **Data-Augmented Generation** approach. We enforce strict JSON outputs (`responseMimeType: "application/json"`) from the Gemini API. By formatting our database query results cleanly into the prompt instructions, we force the LLM to act purely as an interpreter rather than an oracle, drastically minimizing the risk of medical hallucinations.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, TailwindCSS (Glassmorphism), Recharts, Socket.io-client, Axios.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT, bcrypt.
- **AI Integration:** `@google/generative-ai` (Gemini SDK).

## 🏃 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance (Local or Atlas)
- Gemini API Key

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-link>
   cd hms
   \`\`\`

2. **Setup Backend**
   \`\`\`bash
   cd backend
   npm install
   # Create a .env file with your MONGO_URI, JWT_SECRET, and GEMINI_API_KEY
   npm run dev
   \`\`\`

3. **Setup Frontend**
   \`\`\`bash
   cd frontend
   npm install
   npm run dev
   \`\`\`

4. **Access the application**
   Open `http://localhost:5173` in your browser.

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Placeholder components for the dashboards
const AdminDashboard = () => <div className="p-10 text-white"><h1 className="text-3xl font-bold mb-4 text-hms-primary">Super Admin Dashboard</h1><p className="text-hms-muted">Welcome to the enterprise control center.</p></div>;
const DoctorDashboard = () => <div className="p-10 text-white"><h1 className="text-3xl font-bold mb-4 text-hms-secondary">Doctor Dashboard</h1><p className="text-hms-muted">Your daily patient queue and consultations.</p></div>;
const PatientDashboard = () => <div className="p-10 text-white"><h1 className="text-3xl font-bold mb-4 text-hms-accent">Patient Portal</h1><p className="text-hms-muted">Manage your appointments and medical records.</p></div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-hms-dark text-hms-text font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

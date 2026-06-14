import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

import NurseDashboard from './pages/NurseDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import LabTechDashboard from './pages/LabTechDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import BillingDashboard from './pages/BillingDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-hms-dark text-hms-text font-sans">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['Super Admin', 'Hospital Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/doctor" element={<ProtectedRoute allowedRoles={['Doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/nurse" element={<ProtectedRoute allowedRoles={['Nurse']}><NurseDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/receptionist" element={<ProtectedRoute allowedRoles={['Receptionist']}><ReceptionistDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/lab" element={<ProtectedRoute allowedRoles={['Lab Technician']}><LabTechDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/pharmacy" element={<ProtectedRoute allowedRoles={['Pharmacist']}><PharmacistDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/billing" element={<ProtectedRoute allowedRoles={['Billing Executive']}><BillingDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/patient" element={<ProtectedRoute allowedRoles={['Patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

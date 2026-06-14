import React, { useState, useEffect } from 'react';
import { Calendar, UserPlus, ListTodo, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [toastMessage, setToastMessage] = useState('');

  // Schedule Appointment State
  const [departments] = useState(['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine']);
  const [selectedDept, setSelectedDept] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [patientId, setPatientId] = useState('');

  // Register Patient State
  const [regForm, setRegForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dob: '',
    contactNumber: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch doctors when department changes
  useEffect(() => {
    if (selectedDept) {
      const fetchDoctors = async () => {
        try {
          const res = await api.get(`/api/appointments/doctors/${selectedDept}`);
          setDoctors(res.data || []);
        } catch (error) {
          console.error('Error fetching doctors:', error);
          // Mock data in case of failure for demo purposes
          setDoctors([
            { id: 1, user: { firstName: 'Alice', lastName: 'Smith' } },
            { id: 2, user: { firstName: 'Bob', lastName: 'Jones' } }
          ]);
        }
      };
      fetchDoctors();
    } else {
      setDoctors([]);
    }
  }, [selectedDept]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/appointments', {
        patientId,
        doctorId: selectedDoctor,
        appointmentDate
      });
      showToast('Appointment booked successfully!');
      setPatientId('');
      setSelectedDoctor('');
      setAppointmentDate('');
    } catch (error) {
      console.error('Error booking appointment:', error);
      showToast('Error booking appointment. Please try again.');
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      // 1. Create User
      const userRes = await api.post('/api/auth/register', {
        username: regForm.username,
        email: regForm.email,
        password: regForm.password,
        role: 'PATIENT'
      });
      
      const newUserId = userRes.data?.id || userRes.data?.user?.id;

      // 2. Create Patient Profile
      await api.post('/api/patients', {
        userId: newUserId,
        firstName: regForm.firstName,
        lastName: regForm.lastName,
        dateOfBirth: regForm.dob,
        contactNumber: regForm.contactNumber
      });

      showToast('Patient registered successfully!');
      setRegForm({
        username: '', email: '', password: '', firstName: '', lastName: '', dob: '', contactNumber: ''
      });
    } catch (error) {
      console.error('Error registering patient:', error);
      showToast('Error registering patient. They might already exist.');
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center text-white flex" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')" }}>
      {/* Sidebar */}
      <div className="w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 text-hms-primary">Reception</h2>
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'schedule' ? 'bg-hms-primary/20 border border-hms-primary/50 text-white' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <Calendar size={20} />
            <span>Schedule Appt</span>
          </button>
          <button 
            onClick={() => setActiveTab('register')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'register' ? 'bg-hms-primary/20 border border-hms-primary/50 text-white' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <UserPlus size={20} />
            <span>Register Patient</span>
          </button>
          <button 
            onClick={() => setActiveTab('queue')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'queue' ? 'bg-hms-primary/20 border border-hms-primary/50 text-white' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <ListTodo size={20} />
            <span>Today's Queue</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {toastMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 flex items-center">
              <CheckCircle className="mr-2" size={20} /> {toastMessage}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Calendar className="mr-2" /> Schedule Appointment
              </h3>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                    <select 
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary"
                      required
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Doctor</label>
                    <select 
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary"
                      required
                      disabled={!selectedDept}
                    >
                      <option value="">-- Select Doctor --</option>
                      {doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>
                          Dr. {doc.user?.firstName} {doc.user?.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Patient ID</label>
                    <input 
                      type="text" 
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="Enter Patient ID" 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" 
                      required 
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full md:w-auto px-8 bg-hms-primary hover:bg-hms-primary/80 text-white font-medium py-3 rounded-xl transition-colors">
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <UserPlus className="mr-2" /> Register New Patient
              </h3>
              <form onSubmit={handleRegisterPatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* User Account Info */}
                  <div className="col-span-2 text-sm text-hms-primary uppercase font-semibold border-b border-white/10 pb-2">Account Details</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                    <input 
                      type="text" 
                      value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                    <input 
                      type="password" 
                      value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required />
                  </div>
                  
                  {/* Patient Profile Info */}
                  <div className="col-span-2 text-sm text-hms-primary uppercase font-semibold border-b border-white/10 pb-2 mt-4">Personal Details</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                    <input 
                      type="text" 
                      value={regForm.firstName} onChange={e => setRegForm({...regForm, firstName: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      value={regForm.lastName} onChange={e => setRegForm({...regForm, lastName: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={regForm.dob} onChange={e => setRegForm({...regForm, dob: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contact Number</label>
                    <input 
                      type="text" 
                      value={regForm.contactNumber} onChange={e => setRegForm({...regForm, contactNumber: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required />
                  </div>
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full md:w-auto px-8 bg-hms-primary hover:bg-hms-primary/80 text-white font-medium py-3 rounded-xl transition-colors">
                    Complete Registration
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <ListTodo className="mr-2" /> Today's Queue
              </h3>
              <p className="text-gray-400">Queue management interface coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;

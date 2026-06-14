import React, { useState, useEffect } from 'react';
import { Users, Activity, ClipboardPlus, PlusCircle } from 'lucide-react';
import api from '../api/axios';

const NurseDashboard = () => {
  const [activeTab, setActiveTab] = useState('assignedPatients');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [selectedAdmissionId, setSelectedAdmissionId] = useState('');
  const [vitals, setVitals] = useState({ bp: '', hr: '', temp: '', spo2: '' });
  
  const [selectedTreatmentAdmissionId, setSelectedTreatmentAdmissionId] = useState('');
  const [treatmentUpdate, setTreatmentUpdate] = useState('');
  const [notesUpdate, setNotesUpdate] = useState('');

  useEffect(() => {
    fetchAdmittedPatients();
  }, [activeTab]);

  const fetchAdmittedPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admissions');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    if (!selectedAdmissionId) return alert('Select a patient');
    try {
      await api.post(`/api/admissions/${selectedAdmissionId}/vitals`, {
        bloodPressure: vitals.bp,
        heartRate: vitals.hr,
        temperature: vitals.temp,
        oxygenSaturation: vitals.spo2
      });
      setToastMessage('Vitals recorded successfully!');
      setTimeout(() => setToastMessage(''), 3000);
      setVitals({ bp: '', hr: '', temp: '', spo2: '' });
      setSelectedAdmissionId('');
    } catch (error) {
      console.error('Failed to record vitals:', error);
      alert('Failed to record vitals');
    }
  };

  const handleUpdateTreatment = async (e) => {
    e.preventDefault();
    if (!selectedTreatmentAdmissionId) return alert('Select a patient');
    try {
      const admission = patients.find(p => p._id === selectedTreatmentAdmissionId);
      const newPlan = treatmentUpdate ? `${admission.treatmentPlan || ''}\n${new Date().toLocaleDateString()}: ${treatmentUpdate}`.trim() : admission.treatmentPlan;
      const newNotes = notesUpdate ? `${admission.notes || ''}\n${new Date().toLocaleDateString()}: ${notesUpdate}`.trim() : admission.notes;
      
      await api.put(`/api/admissions/${selectedTreatmentAdmissionId}/status`, {
        status: admission.status,
        treatmentPlan: newPlan,
        notes: newNotes
      });
      setToastMessage('Treatment updated successfully!');
      setTimeout(() => setToastMessage(''), 3000);
      setTreatmentUpdate('');
      setNotesUpdate('');
      fetchAdmittedPatients();
    } catch (error) {
      console.error('Failed to update treatment:', error);
      alert('Failed to update treatment');
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center text-white flex" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop')" }}>
      {/* Sidebar */}
      <div className="w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 text-hms-primary">Nurse Portal</h2>
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('assignedPatients')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'assignedPatients' ? 'bg-hms-primary/20 border border-hms-primary/50 text-white' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <Users size={20} />
            <span>Assigned Patients</span>
          </button>
          <button 
            onClick={() => setActiveTab('recordVitals')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'recordVitals' ? 'bg-hms-primary/20 border border-hms-primary/50 text-white' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <Activity size={20} />
            <span>Record Vitals</span>
          </button>
          <button 
            onClick={() => setActiveTab('treatments')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'treatments' ? 'bg-hms-primary/20 border border-hms-primary/50 text-white' : 'text-gray-300 hover:bg-white/5'}`}
          >
            <ClipboardPlus size={20} />
            <span>Treatments</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {toastMessage && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200">
              {toastMessage}
            </div>
          )}

          {activeTab === 'assignedPatients' && (
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Users className="mr-2" /> Admitted Patients
              </h3>
              {loading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded"></div>
                    <div className="h-4 bg-white/20 rounded w-5/6"></div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="py-3 px-4 font-medium">Patient Name</th>
                        <th className="py-3 px-4 font-medium">Room</th>
                        <th className="py-3 px-4 font-medium">Admission Date</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.length > 0 ? (
                        patients.map((patient) => (
                          <tr key={patient._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4">{patient.patientId?.userId?.name || patient.patientName || 'Unknown'}</td>
                            <td className="py-3 px-4">{patient.roomId?.roomNumber || 'N/A'}</td>
                            <td className="py-3 px-4">{new Date(patient.admissionDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded-full text-xs bg-hms-primary/20 text-hms-primary border border-hms-primary/30">
                                {patient.status || 'Admitted'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-gray-400">No admitted patients found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recordVitals' && (
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Activity className="mr-2" /> Record Patient Vitals
              </h3>
              <form onSubmit={handleRecordVitals} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Select Patient</label>
                  <select 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary"
                    value={selectedAdmissionId}
                    onChange={e => setSelectedAdmissionId(e.target.value)}
                    required
                  >
                    <option value="">-- Select --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.patientId?.userId?.name || p.patientName || 'Unknown'} (Room {p.roomId?.roomNumber || 'N/A'})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Blood Pressure (mmHg)</label>
                    <input type="text" placeholder="120/80" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Heart Rate (bpm)</label>
                    <input type="number" placeholder="72" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required value={vitals.hr} onChange={e => setVitals({...vitals, hr: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Temperature (°C)</label>
                    <input type="number" step="0.1" placeholder="36.5" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Oxygen Saturation (%)</label>
                    <input type="number" placeholder="98" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary" required value={vitals.spo2} onChange={e => setVitals({...vitals, spo2: e.target.value})} />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-hms-primary hover:bg-hms-primary/80 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center">
                    <PlusCircle size={18} className="mr-2" /> Save Vitals
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'treatments' && (
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <ClipboardPlus className="mr-2" /> Active Treatments
              </h3>
              <form onSubmit={handleUpdateTreatment} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Select Patient</label>
                  <select 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary"
                    value={selectedTreatmentAdmissionId}
                    onChange={e => setSelectedTreatmentAdmissionId(e.target.value)}
                    required
                  >
                    <option value="">-- Select --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.patientId?.userId?.name || p.patientName || 'Unknown'} (Room {p.roomId?.roomNumber || 'N/A'})</option>
                    ))}
                  </select>
                </div>

                {selectedTreatmentAdmissionId && (
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-sm text-gray-300 mb-4 whitespace-pre-wrap">
                    <strong className="text-white block mb-1">Current Treatment Plan:</strong>
                    {patients.find(p => p._id === selectedTreatmentAdmissionId)?.treatmentPlan || 'None'}
                    
                    <strong className="text-white block mt-3 mb-1">Current Notes:</strong>
                    {patients.find(p => p._id === selectedTreatmentAdmissionId)?.notes || 'None'}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Append to Treatment Plan</label>
                  <textarea 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary min-h-[80px]"
                    placeholder="New treatments, medications given..."
                    value={treatmentUpdate}
                    onChange={e => setTreatmentUpdate(e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Append to Notes</label>
                  <textarea 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-hms-primary min-h-[80px]"
                    placeholder="Patient condition updates, observations..."
                    value={notesUpdate}
                    onChange={e => setNotesUpdate(e.target.value)}
                  ></textarea>
                </div>
                <div className="pt-2">
                  <button type="submit" className="bg-hms-primary hover:bg-hms-primary/80 text-white font-medium px-6 py-2 rounded-xl transition-colors">
                    Update Record
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;

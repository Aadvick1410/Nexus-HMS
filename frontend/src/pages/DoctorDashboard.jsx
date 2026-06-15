import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Cross, LogOut, User, Bell, Stethoscope, ClipboardList, Users, Heart, Activity, CheckCircle, AlertTriangle, FileText, Pill, TestTube, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isPrescribing, setIsPrescribing] = useState(null); // stores appointment or patient
  const [isRequestingLab, setIsRequestingLab] = useState(null);
  const [summarizingPatient, setSummarizingPatient] = useState(null);
  const [patientSummary, setPatientSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('hms_user_name');
    setDoctorName(storedName || 'Doctor');
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const fetchData = async () => {
      try {
        const [apptRes, patRes] = await Promise.all([
          api.get('/api/doctors/my-appointments').catch(() => ({ data: [] })),
          api.get('/api/patients').catch(() => ({ data: [] }))
        ]);
        setAppointments(apptRes.data);
        setPatients(patRes.data);
      } catch (err) {
        console.error('Failed to fetch doctor data');
      }
    };
    fetchData();
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user_name');
    navigate('/login');
  };

  const todayAppts = appointments.filter(a => {
    const d = new Date(a.slot);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const upcomingAppts = appointments.filter(a => new Date(a.slot) > new Date() && a.status !== 'Completed' && a.status !== 'Cancelled');
  const completedAppts = appointments.filter(a => a.status === 'Completed');

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/api/appointments/${id}/status`, { status });
      setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) {
      alert('Failed to update appointment status');
    }
  };

  const submitPrescription = async (data) => {
    try {
      const formattedMedicines = data.medications.map(m => ({
        medicineName: m.name,
        dosage: m.dosage,
        duration: m.duration,
        instructions: m.frequency
      }));

      await api.post('/api/prescriptions', {
        appointmentId: isPrescribing._id,
        patientId: isPrescribing.patientId._id,
        diagnosis: data.diagnosis,
        medicines: formattedMedicines,
        notes: data.notes,
        validUntil: data.validUntil
      });
      alert('Prescription saved successfully!');
      setIsPrescribing(null);
    } catch (err) {
      alert('Failed to save prescription');
    }
  };

  const submitLabRequest = async (data) => {
    try {
      await api.post('/api/labs', {
        appointmentId: isRequestingLab._id,
        patientId: isRequestingLab.patientId._id,
        testType: data.testName,
        notes: data.notes
      });
      alert('Lab request created successfully!');
      setIsRequestingLab(null);
    } catch (err) {
      alert('Failed to create lab request');
    }
  };

  const handleSummarize = async (patient) => {
    setSummarizingPatient(patient);
    setIsSummarizing(true);
    setPatientSummary(null);
    try {
      const res = await api.post('/api/ai/summarize-history', { patientHistoryData: patient });
      setPatientSummary(res.data);
    } catch (err) {
      console.error(err);
    }
    setIsSummarizing(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DoctorHome todayAppts={todayAppts} upcomingAppts={upcomingAppts} completedAppts={completedAppts} patients={patients} setActiveView={setActiveView} handleStatusUpdate={handleStatusUpdate} setIsPrescribing={setIsPrescribing} setIsRequestingLab={setIsRequestingLab} />;
      case 'appointments':
        return <AllAppointmentsView appointments={appointments} handleStatusUpdate={handleStatusUpdate} setIsPrescribing={setIsPrescribing} setIsRequestingLab={setIsRequestingLab} />;
      case 'patients':
        return <PatientsListView patients={patients} handleSummarize={handleSummarize} />;
      default:
        return <DoctorHome todayAppts={todayAppts} upcomingAppts={upcomingAppts} completedAppts={completedAppts} patients={patients} setActiveView={setActiveView} handleStatusUpdate={handleStatusUpdate} setIsPrescribing={setIsPrescribing} setIsRequestingLab={setIsRequestingLab} />;
    }
  };

  return (
    <div
      className="flex h-screen text-white overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/dashboard-bg.png')" }}
    >
      <div className="fixed inset-0 bg-gradient-to-br from-hms-dark/95 via-hms-dark/92 to-hms-surface/95"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col hidden md:flex z-20 relative">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight text-white">Nexus HMS</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-medium">Physician Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          <NavItem icon={<Activity size={18} />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={<Calendar size={18} />} label="My Appointments" active={activeView === 'appointments'} onClick={() => setActiveView('appointments')} />
          <NavItem icon={<Users size={18} />} label="Patient Registry" active={activeView === 'patients'} onClick={() => setActiveView('patients')} />
        </nav>

        {/* Doctor Stats Card */}
        <div className="p-3 m-3 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2 font-semibold uppercase tracking-wider">
            <Activity size={12} /> Today's Schedule
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/30 p-2 rounded-lg text-center">
              <p className="text-white/40">Today</p>
              <p className="font-bold text-emerald-400">{todayAppts.length}</p>
            </div>
            <div className="bg-black/30 p-2 rounded-lg text-center">
              <p className="text-white/40">Pending</p>
              <p className="font-bold text-amber-400">{upcomingAppts.length}</p>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 text-white/40 hover:text-red-400 transition-colors w-full p-2.5 rounded-xl hover:bg-red-500/10">
            <LogOut size={18} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden z-10">
        <header className="h-16 flex items-center justify-between px-6 bg-black/30 backdrop-blur-xl sticky top-0 z-10 border-b border-white/10">
          <div className="flex items-center gap-4">
            {activeView !== 'dashboard' && (
              <button onClick={() => setActiveView('dashboard')} className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-white">
                {activeView === 'dashboard' ? `Good ${getGreeting()}, Dr. ${doctorName.replace('Dr. ', '')}` : activeView === 'appointments' ? 'My Appointments' : 'Patient Registry'}
              </h1>
              <p className="text-xs text-white/50">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock size={12} />
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors border border-white/10">
                <Bell size={18} />
                {upcomingAppts.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-hms-surface/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                  <div className="px-4 py-3 border-b border-white/10 font-semibold text-sm text-white flex items-center gap-2">
                    <Bell size={14} className="text-emerald-400" /> Notifications
                  </div>
                  {upcomingAppts.length > 0 ? (
                    <div className="p-3 text-sm text-white/60 border-b border-white/5">
                      <strong className="text-emerald-400 block mb-0.5 text-xs">Upcoming Consultations</strong>
                      You have {upcomingAppts.length} appointment{upcomingAppts.length > 1 ? 's' : ''} pending review.
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-white/40 text-center">No new notifications</div>
                  )}
                </div>
              )}
            </div>

            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
              <User size={16} />
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full" style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {renderView()}
        </div>

        {/* Modals */}
        {isPrescribing && (
          <WritePrescriptionModal 
            appt={isPrescribing} 
            onClose={() => setIsPrescribing(null)} 
            onSubmit={submitPrescription} 
          />
        )}
        {isRequestingLab && (
          <LabRequestModal 
            appt={isRequestingLab} 
            onClose={() => setIsRequestingLab(null)} 
            onSubmit={submitLabRequest} 
          />
        )}
        {summarizingPatient && (
          <PatientSummaryModal
            patient={summarizingPatient}
            summary={patientSummary}
            isLoading={isSummarizing}
            onClose={() => setSummarizingPatient(null)}
          />
        )}
      </main>
    </div>
  );
};

// ─── Helper ───────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
};

// ─── Dashboard Home ───────────────────────────────────────

const DoctorHome = ({ todayAppts, upcomingAppts, completedAppts, patients, setActiveView, handleStatusUpdate, setIsPrescribing, setIsRequestingLab }) => (
  <div className="space-y-6">
    {/* Stats Row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Today's Queue" value={todayAppts.length} icon={<Calendar size={22} />} color="text-emerald-400" gradient="from-emerald-500/20 to-emerald-500/5" border="border-emerald-500/25" onClick={() => setActiveView('appointments')} />
      <StatCard title="Upcoming" value={upcomingAppts.length} icon={<Clock size={22} />} color="text-blue-400" gradient="from-blue-500/20 to-blue-500/5" border="border-blue-500/25" onClick={() => setActiveView('appointments')} />
      <StatCard title="Completed" value={completedAppts.length} icon={<CheckCircle size={22} />} color="text-hms-primary" gradient="from-hms-primary/20 to-hms-primary/5" border="border-hms-primary/25" onClick={() => setActiveView('appointments')} />
      <StatCard title="Total Patients" value={patients.length} icon={<Users size={22} />} color="text-amber-400" gradient="from-amber-500/20 to-amber-500/5" border="border-amber-500/25" onClick={() => setActiveView('patients')} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Today's Appointments */}
      <div className="lg:col-span-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-white/50 uppercase tracking-wider">
            <Stethoscope size={14} className="text-emerald-400" /> Today's Consultations
          </h3>
          <button onClick={() => setActiveView('appointments')} className="text-xs text-emerald-400 hover:text-white transition-colors font-medium">View All →</button>
        </div>
        <div className="space-y-3">
          {todayAppts.length > 0 ? todayAppts.map(appt => (
            <AppointmentCard key={appt._id} appt={appt} showActions handleStatusUpdate={handleStatusUpdate} setIsPrescribing={setIsPrescribing} setIsRequestingLab={setIsRequestingLab} />
          )) : (
            <div className="text-center py-10 text-white/30">
              <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No consultations scheduled for today</p>
              <p className="text-xs text-white/20 mt-1">Enjoy your day off!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Patient Overview */}
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-white/50 uppercase tracking-wider mb-4">
          <Users size={14} className="text-amber-400" /> Recent Patients
        </h3>
        <div className="space-y-2">
          {patients.slice(0, 5).map(p => (
            <div key={p._id} className="flex items-center gap-3 p-3 bg-black/20 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-hms-primary/15 flex items-center justify-center text-hms-primary text-xs font-bold">
                {p.userId?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.userId?.name}</p>
                <p className="text-[10px] text-white/30 font-mono">{p.patientId}</p>
              </div>
              <span className="text-xs text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">{p.bloodGroup}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setActiveView('patients')} className="w-full mt-3 py-2.5 rounded-xl border border-white/10 text-white/40 hover:bg-white/5 hover:text-white transition-all text-xs font-medium">
          View All Patients →
        </button>
      </div>
    </div>

    {/* Upcoming Appointments */}
    {upcomingAppts.length > 0 && (
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-white/50 uppercase tracking-wider mb-4">
          <Calendar size={14} className="text-blue-400" /> Upcoming Appointments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingAppts.slice(0, 6).map(appt => (
            <AppointmentCard key={appt._id} appt={appt} compact handleStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      </div>
    )}
  </div>
);

// ─── All Appointments ─────────────────────────────────────

const AllAppointmentsView = ({ appointments, handleStatusUpdate, setIsPrescribing, setIsRequestingLab }) => (
  <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
      <ClipboardList className="text-emerald-400" size={20} /> All Appointments
    </h2>
    <div className="space-y-3">
      {appointments.length > 0 ? appointments.map(appt => (
        <AppointmentCard key={appt._id} appt={appt} showActions handleStatusUpdate={handleStatusUpdate} setIsPrescribing={setIsPrescribing} setIsRequestingLab={setIsRequestingLab} />
      )) : (
        <div className="text-center py-10 text-white/30">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No appointments assigned to you yet</p>
        </div>
      )}
    </div>
  </div>
);

// ─── Patient List ─────────────────────────────────────────

const PatientsListView = ({ patients, handleSummarize }) => (
  <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
      <Users className="text-hms-primary" size={20} /> Patient Registry
    </h2>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10">
          <th className="py-3 px-3">ID</th>
          <th className="py-3 px-3">Name</th>
          <th className="py-3 px-3">Blood</th>
          <th className="py-3 px-3">Phone</th>
          <th className="py-3 px-3">Allergies</th>
          <th className="py-3 px-3">Conditions</th>
          <th className="py-3 px-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {patients.map(p => (
          <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="py-3.5 px-3 font-mono text-xs text-hms-primary">{p.patientId}</td>
            <td className="py-3.5 px-3 text-sm font-medium text-white">{p.userId?.name}</td>
            <td className="py-3.5 px-3"><span className="text-sm text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">{p.bloodGroup}</span></td>
            <td className="py-3.5 px-3 text-sm text-white/50">{p.phone}</td>
            <td className="py-3.5 px-3">
              <div className="flex gap-1 flex-wrap">
                {p.allergies?.filter(a => a !== 'None').map((a, i) => (
                  <span key={i} className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">{a}</span>
                ))}
                {(!p.allergies || p.allergies.length === 0 || (p.allergies.length === 1 && p.allergies[0] === 'None')) && (
                  <span className="text-xs text-white/20">None</span>
                )}
              </div>
            </td>
            <td className="py-3.5 px-3 text-xs text-white/40">
              {p.medicalHistory?.map(h => h.condition).join(', ') || 'No records'}
            </td>
            <td className="py-3.5 px-3 text-right">
              <button onClick={() => handleSummarize(p)} className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1.5 rounded-lg flex items-center justify-end gap-1.5 hover:bg-purple-500/30 transition-colors ml-auto">
                <Sparkles size={12} /> Summarize (AI)
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Appointment Card ─────────────────────────────────────

const AppointmentCard = ({ appt, compact = false, showActions = false, handleStatusUpdate, setIsPrescribing, setIsRequestingLab }) => {
  const patientName = appt.patientId?.userId?.name || 'Unknown Patient';
  const slotDate = new Date(appt.slot);
  const isPast = slotDate < new Date();

  return (
    <div className={`bg-black/20 border border-white/10 rounded-xl ${compact ? 'p-4' : 'p-4'} hover:bg-white/5 hover:border-white/15 transition-all`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-emerald-400">
            <span className="text-[9px] font-bold uppercase">{slotDate.toLocaleString('default', { month: 'short' })}</span>
            <span className="text-sm font-bold leading-none">{slotDate.getDate()}</span>
          </div>
          <div>
            <h4 className="font-medium text-sm text-white">{patientName}</h4>
            <p className="text-[11px] text-white/40">{appt.department} • {slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <StatusBadge status={appt.status} />
      </div>
      {appt.reason && <p className="text-xs text-white/30 italic mt-1 mb-2">"{appt.reason}"</p>}
      
      {(showActions || !compact) && appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5 flex-wrap">
          {appt.status === 'Requested' && (
            <button onClick={() => handleStatusUpdate(appt._id, 'Confirmed')} className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-500/25 transition-colors">
              ✓ Confirm
            </button>
          )}
          {appt.status === 'Confirmed' && (
            <button onClick={() => handleStatusUpdate(appt._id, 'In Consultation')} className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-500/25 transition-colors">
              Begin Consultation
            </button>
          )}
          {appt.status === 'In Consultation' && (
            <>
              <button onClick={() => setIsPrescribing(appt)} className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-500/25 transition-colors flex items-center gap-1">
                <Pill size={12} /> Prescribe
              </button>
              <button onClick={() => setIsRequestingLab(appt)} className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-500/25 transition-colors flex items-center gap-1">
                <TestTube size={12} /> Lab Req
              </button>
              <button onClick={() => handleStatusUpdate(appt._id, 'Completed')} className="text-[10px] bg-hms-primary/15 text-hms-primary border border-hms-primary/30 px-3 py-1.5 rounded-lg font-bold hover:bg-hms-primary/25 transition-colors">
                ✓ Mark Completed
              </button>
            </>
          )}
          <button onClick={() => handleStatusUpdate(appt._id, 'Cancelled')} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg font-bold hover:bg-red-500/20 transition-colors">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Modals ───────────────────────────────────────────────

const WritePrescriptionModal = ({ appt, onClose, onSubmit }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [notes, setNotes] = useState('');

  const handleAddMed = () => setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  const handleMedChange = (index, field, value) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ diagnosis, validUntil, medications: medications.filter(m => m.name), notes });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-hms-surface border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Pill className="text-amber-400" /> Write Prescription</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white"><Cross size={20} className="rotate-45" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-white/60">Patient: <strong className="text-white">{appt.patientId?.userId?.name}</strong></p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Diagnosis</label>
              <input required placeholder="Diagnosis" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Valid Until</label>
              <input required type="date" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Medications</label>
            {medications.map((med, i) => (
              <div key={i} className="grid grid-cols-4 gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <input required placeholder="Medication Name" className="col-span-4 sm:col-span-1 bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white" value={med.name} onChange={e => handleMedChange(i, 'name', e.target.value)} />
                <input required placeholder="Dosage (e.g. 500mg)" className="bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white" value={med.dosage} onChange={e => handleMedChange(i, 'dosage', e.target.value)} />
                <input required placeholder="Freq (e.g. 1x daily)" className="bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white" value={med.frequency} onChange={e => handleMedChange(i, 'frequency', e.target.value)} />
                <input required placeholder="Duration (e.g. 5 days)" className="bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white" value={med.duration} onChange={e => handleMedChange(i, 'duration', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={handleAddMed} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">+ Add another medication</button>
          </div>

          <div>
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Additional Notes</label>
            <textarea className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white min-h-[100px]" placeholder="Special instructions..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-white/60 hover:text-white font-medium text-sm transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-emerald-500/20 transition-all">Save Prescription</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LabRequestModal = ({ appt, onClose, onSubmit }) => {
  const [testName, setTestName] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ testName, notes });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-hms-surface border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><TestTube className="text-purple-400" /> Request Lab Test</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white"><Cross size={20} className="rotate-45" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <p className="text-sm text-white/60">Patient: <strong className="text-white">{appt.patientId?.userId?.name}</strong></p>
          </div>
          
          <div>
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Test Name</label>
            <input required placeholder="e.g. Complete Blood Count (CBC)" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white" value={testName} onChange={e => setTestName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Clinical Notes for Lab Tech</label>
            <textarea className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white min-h-[100px]" placeholder="Any specific instructions or suspected condition..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-white/60 hover:text-white font-medium text-sm transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-purple-500/20 transition-all">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PatientSummaryModal = ({ patient, summary, isLoading, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-hms-dark border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="text-purple-400" size={20} /> AI Patient Summary
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <Cross size={20} className="rotate-45" />
          </button>
        </div>
        
        <div className="mb-4 bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-white/60 mb-1">Patient Name: <strong className="text-white">{patient.userId?.name}</strong></p>
          <p className="text-xs text-white/40 font-mono">ID: {patient.patientId}</p>
        </div>

        {isLoading ? (
          <div className="py-10 text-center flex flex-col items-center">
            <Sparkles size={32} className="text-purple-400 mb-3 animate-pulse" />
            <p className="text-sm text-white/70">Analyzing patient history...</p>
          </div>
        ) : summary ? (
          <div className="space-y-4" style={{animation: 'fadeIn 0.3s ease-out'}}>
            <div>
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Executive Summary</h3>
              <p className="text-sm text-white/80 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">{summary.summary}</p>
            </div>
            
            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Key Clinical Points</h3>
                <ul className="list-disc pl-5 text-sm text-white/80 space-y-1 bg-black/30 p-4 rounded-xl border border-white/5">
                  {summary.keyPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <button onClick={onClose} className="w-full mt-4 py-3 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl font-medium text-sm hover:bg-purple-500/30 transition-colors">
              Close Summary
            </button>
          </div>
        ) : (
          <div className="py-6 text-center text-red-400 text-sm">Failed to generate summary.</div>
        )}
      </div>
    </div>
  );
};

// ─── Shared Components ────────────────────────────────────

const StatusBadge = ({ status }) => {
  const styles = {
    Confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Completed: 'bg-hms-primary/15 text-hms-primary border-hms-primary/30',
    Requested: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
    'In Consultation': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.Requested}`}>
      {status}
    </span>
  );
};

const StatCard = ({ title, value, icon, color, gradient, border, onClick }) => (
  <div onClick={onClick} className={`p-5 rounded-2xl bg-gradient-to-br ${gradient} border ${border} backdrop-blur-md relative overflow-hidden group hover:scale-[1.02] transition-transform ${onClick ? 'cursor-pointer' : ''}`}>
    <div className={`absolute -right-3 -top-3 ${color} opacity-10 group-hover:opacity-20 transition-opacity`}>
      {React.cloneElement(icon, { size: 60 })}
    </div>
    <div className={`p-2 rounded-lg bg-white/5 ${color} w-fit mb-3`}>{icon}</div>
    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-0.5">{title}</p>
    <h3 className="text-2xl font-bold text-white">{value}</h3>
  </div>
);

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default DoctorDashboard;

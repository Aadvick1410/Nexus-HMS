import React, { useState, useEffect } from 'react';
import { Activity, Calendar, FileText, Heart, LogOut, Bell, Pill, ChevronRight, User, CreditCard, TestTube, ArrowLeft, UploadCloud, CheckCircle, Clock, Stethoscope, Thermometer, Syringe, Cross, ClipboardList, AlertTriangle, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMood, setActiveMood] = useState(null);
  const [isMoodLogged, setIsMoodLogged] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  
  // Triage Modal State
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [triageSymptoms, setTriageSymptoms] = useState('');
  const [triageResult, setTriageResult] = useState(null);
  const [isTriageLoading, setIsTriageLoading] = useState(false);
  
  // Med Explanation State
  const [explainingMedId, setExplainingMedId] = useState(null);
  const [medExplanation, setMedExplanation] = useState({});

  const fetchDashboardData = async () => {
    try {
      const [profileRes, apptRes] = await Promise.all([
        api.get('/api/patients/profile').catch(() => ({ data: null })),
        api.get('/api/appointments/myappointments').catch(() => ({ data: [] }))
      ]);
      
      setPatientProfile(profileRes.data);
      setAppointments(apptRes.data);

      if (profileRes.data && profileRes.data._id) {
        const [invRes, presRes] = await Promise.all([
          api.get(`/api/billing/patient/${profileRes.data._id}`).catch(() => ({ data: [] })),
          api.get(`/api/prescriptions/patient/${profileRes.data._id}`).catch(() => ({ data: [] }))
        ]);
        setInvoices(invRes.data);
        setPrescriptions(presRes.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem('hms_user_name');
    setUserName(storedName || 'Patient');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  const handleMoodSubmit = async (emoji) => {
    setActiveMood(emoji);
    setIsMoodLogged(true);
    try {
      await api.post('/api/quirky/mood', { emoji, note: 'Logged from dashboard' });
    } catch (error) {
      console.log('Mood saved locally');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user_name');
    navigate('/login');
  };

  const handleTriageSubmit = async () => {
    if (!triageSymptoms.trim()) return;
    setIsTriageLoading(true);
    setTriageResult(null);
    try {
      const res = await api.post('/api/ai/symptom-triage', { symptoms: triageSymptoms, vitals: patientProfile?.vitals || {} });
      setTriageResult(res.data);
    } catch (err) {
      console.error(err);
    }
    setIsTriageLoading(false);
  };

  const handleExplainMed = async (medicine, pId, mId) => {
    const key = `${pId}-${mId}`;
    if (medExplanation[key]) return;
    
    setExplainingMedId(key);
    try {
      const res = await api.post('/api/ai/explain-prescription', { medicineData: medicine });
      setMedExplanation(prev => ({ ...prev, [key]: res.data }));
    } catch (err) {
      console.error(err);
    }
    setExplainingMedId(null);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardHome 
                 activeMood={activeMood} 
                 isMoodLogged={isMoodLogged} 
                 handleMoodSubmit={handleMoodSubmit} 
                 setActiveView={setActiveView} 
                 appointments={appointments}
                 patientProfile={patientProfile}
                 openTriage={() => setIsTriageOpen(true)}
               />;
      case 'appointments':
        return <AppointmentsView appointments={appointments} fetchDashboardData={fetchDashboardData} />;
      case 'records':
        return <MedicalRecordsView patientProfile={patientProfile} />;
      case 'prescriptions':
        return <PrescriptionsView prescriptions={prescriptions} handleExplainMed={handleExplainMed} explainingMedId={explainingMedId} medExplanation={medExplanation} />;
      case 'billing':
        return <BillingView invoices={invoices} />;
      case 'labs':
        return <LabResultsView />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div 
      className="flex h-screen text-white overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/dashboard-bg.png')" }}
    >
      {/* Full-screen dark overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-hms-dark/95 via-hms-dark/92 to-hms-surface/95"></div>
      
      {/* Sidebar */}
      <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col hidden md:flex z-20 relative">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-hms-primary flex items-center justify-center shadow-lg shadow-hms-primary/30">
            <Cross size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight text-white">Nexus HMS</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-medium">Patient Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-4">
          <NavItem icon={<ClipboardList size={18} />} label="Overview" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={<Calendar size={18} />} label="Appointments" active={activeView === 'appointments'} onClick={() => setActiveView('appointments')} />
          <NavItem icon={<FileText size={18} />} label="Medical Records" active={activeView === 'records'} onClick={() => setActiveView('records')} />
          <NavItem icon={<Pill size={18} />} label="Prescriptions" active={activeView === 'prescriptions'} onClick={() => setActiveView('prescriptions')} />
          <NavItem icon={<CreditCard size={18} />} label="Billing" active={activeView === 'billing'} onClick={() => setActiveView('billing')} />
          <NavItem icon={<TestTube size={18} />} label="Lab Results" active={activeView === 'labs'} onClick={() => setActiveView('labs')} />
        </nav>

        {/* Sidebar footer — patient vitals card */}
        <div className="p-3 m-3 bg-gradient-to-br from-hms-primary/15 to-hms-primary/5 border border-hms-primary/20 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-hms-primary mb-2 font-semibold uppercase tracking-wider">
            <Heart size={12} /> Patient Vitals
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/30 p-2 rounded-lg text-center">
              <p className="text-white/40">Blood</p>
              <p className="font-bold text-red-400">{patientProfile?.bloodGroup || '—'}</p>
            </div>
            <div className="bg-black/30 p-2 rounded-lg text-center">
              <p className="text-white/40">ID</p>
              <p className="font-bold text-hms-primary">{patientProfile?.patientId?.split('-')[1] || '—'}</p>
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
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-black/30 backdrop-blur-xl sticky top-0 z-10 border-b border-white/10">
          <div className="flex items-center gap-4">
            {activeView !== 'dashboard' && (
              <button onClick={() => setActiveView('dashboard')} className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              {activeView === 'dashboard' ? (
                <>
                  <h1 className="text-lg font-bold text-white">Welcome, {userName}</h1>
                  <p className="text-xs text-white/50">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </>
              ) : (
                <h1 className="text-lg font-bold capitalize text-white">{activeView.replace('-', ' ')}</h1>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Live clock */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock size={12} />
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} className="relative p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors border border-white/10">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-hms-primary rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-hms-surface/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden" style={{animation: 'fadeIn 0.2s ease-out'}}>
                  <div className="px-4 py-3 border-b border-white/10 font-semibold text-sm text-white flex items-center gap-2">
                    <Bell size={14} className="text-hms-primary" /> Notifications
                  </div>
                  <div className="p-3 text-sm text-white/60 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                    <strong className="text-hms-primary block mb-0.5 text-xs">Appointment Reminder</strong>
                    Your next consultation is scheduled. Please arrive 15 minutes early.
                  </div>
                  <div className="p-3 text-sm text-white/60 hover:bg-white/5 cursor-pointer transition-colors">
                    <strong className="text-emerald-400 block mb-0.5 text-xs">Records Updated</strong>
                    Your medical records have been securely updated by your physician.
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} className="w-9 h-9 rounded-xl bg-hms-primary/20 flex items-center justify-center border border-hms-primary/30 text-hms-primary hover:bg-hms-primary/30 transition-colors">
                <User size={16} />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-hms-surface/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden" style={{animation: 'fadeIn 0.2s ease-out'}}>
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="font-bold text-white text-sm truncate">{userName}</p>
                    <p className="text-[10px] text-hms-primary uppercase tracking-wider">Patient</p>
                  </div>
                  <button onClick={() => { setActiveView('records'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors">My Records</button>
                  <button onClick={() => { setActiveView('billing'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors">Billing</button>
                  <div className="h-px bg-white/10"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic View Area */}
        <div className="p-6 max-w-7xl mx-auto w-full" style={{animation: 'fadeIn 0.3s ease-out'}}>
          {renderView()}
        </div>
      </main>

      {/* AI Triage Modal */}
      {isTriageOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-hms-dark border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-hms-primary/10">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Sparkles className="text-hms-primary" size={20} />
                AI Symptom Triage
              </h3>
              <button onClick={() => setIsTriageOpen(false)} className="text-white/50 hover:text-white">
                <Cross size={20} />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
              {!triageResult ? (
                <>
                  <p className="text-sm text-white/70 mb-4">Describe your symptoms in detail and our AI assistant will recommend the appropriate department and urgency level.</p>
                  <textarea
                    value={triageSymptoms}
                    onChange={(e) => setTriageSymptoms(e.target.value)}
                    placeholder="E.g., I have a sharp pain in my lower right abdomen since morning, feeling nauseous..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-hms-primary outline-none transition-colors mb-4"
                    rows={4}
                  />
                  <button 
                    onClick={handleTriageSubmit}
                    disabled={isTriageLoading || !triageSymptoms.trim()}
                    className="w-full py-3 bg-hms-primary text-white rounded-xl font-medium text-sm hover:bg-hms-primary/80 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isTriageLoading ? 'Analyzing...' : <><Sparkles size={16} /> Analyze Symptoms</>}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${triageResult.triageLevel === 'Emergency' ? 'bg-red-500/10 border-red-500/20 text-red-400' : triageResult.triageLevel === 'Urgent' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    <h4 className="font-bold text-lg mb-1">{triageResult.triageLevel} Triage</h4>
                    <p className="text-sm opacity-80">{triageResult.recommendation}</p>
                  </div>
                  
                  {triageResult.possibleConditions && (
                    <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                      <h4 className="font-semibold text-sm text-white/50 mb-2 uppercase tracking-wider">Possible Conditions</h4>
                      <ul className="list-disc pl-5 text-sm text-white/80 space-y-1">
                        {triageResult.possibleConditions.map((cond, i) => (
                          <li key={i}>{cond}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <button onClick={() => { setIsTriageOpen(false); setActiveView('appointments'); }} className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium text-sm hover:bg-white/20 transition-colors">
                    Book Appointment Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-Views ──────────────────────────────────────────

const DashboardHome = ({ activeMood, isMoodLogged, handleMoodSubmit, setActiveView, appointments, patientProfile, openTriage }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
    
    {/* Patient Quick Info */}
    <div className="lg:col-span-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 text-[140px] text-hms-primary/5 font-black select-none pointer-events-none leading-none">✚</div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-hms-primary/15 border border-hms-primary/25 flex items-center justify-center">
          <Stethoscope size={24} className="text-hms-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">Health Overview</h3>
          <p className="text-xs text-white/40">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setActiveView('records')} className="bg-black/30 p-4 rounded-xl text-center border border-white/10 hover:bg-white/5 hover:border-white/15 transition-all w-full group">
          <Heart size={20} className="mx-auto text-red-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs text-white/40">Blood Group</p>
          <p className="font-bold text-white text-lg">{patientProfile?.bloodGroup || '—'}</p>
        </button>
        <button onClick={() => setActiveView('records')} className="bg-black/30 p-4 rounded-xl text-center border border-white/10 hover:bg-white/5 hover:border-white/15 transition-all w-full group">
          <AlertTriangle size={20} className="mx-auto text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs text-white/40">Allergies</p>
          <p className="font-bold text-white text-lg">{patientProfile?.allergies?.length || 0}</p>
        </button>
        <button onClick={() => setActiveView('appointments')} className="bg-black/30 p-4 rounded-xl text-center border border-white/10 hover:bg-white/5 hover:border-white/15 transition-all w-full group">
          <Calendar size={20} className="mx-auto text-hms-primary mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs text-white/40">Appointments</p>
          <p className="font-bold text-white text-lg">{appointments?.length || 0}</p>
        </button>
      </div>
    </div>

    {/* Mood Tracker */}
    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
       <h3 className="font-semibold text-sm mb-4 text-center text-white/40 uppercase tracking-wider">Wellness Check-In</h3>
       {!isMoodLogged ? (
         <div className="flex justify-between items-center px-2">
           {['😫', '😕', '😐', '🙂', '🤩'].map((emoji) => (
             <button key={emoji} onClick={() => handleMoodSubmit(emoji)} className="text-3xl hover:scale-125 transform transition-transform duration-200 hover:drop-shadow-lg">
               {emoji}
             </button>
           ))}
         </div>
       ) : (
         <div className="text-center" style={{animation: 'fadeIn 0.3s ease-out'}}>
           <div className="text-5xl mb-2">{activeMood}</div>
           <p className="text-xs text-emerald-400 font-medium">✓ Logged successfully</p>
         </div>
       )}
    </div>

    {/* Upcoming Appointments */}
    <div className="lg:col-span-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-white/50 uppercase tracking-wider">
          <Calendar size={14} className="text-hms-primary" /> Upcoming Appointments
        </h3>
        <button onClick={() => setActiveView('appointments')} className="text-xs text-hms-primary hover:text-white transition-colors font-medium">View All →</button>
      </div>
      <div className="space-y-3">
        {appointments && appointments.length > 0 ? appointments.slice(0, 3).map(appt => (
          <div key={appt._id} className="bg-black/20 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 hover:border-white/15 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-hms-primary/10 border border-hms-primary/20 flex flex-col items-center justify-center text-hms-primary">
                <span className="text-[10px] font-bold uppercase">{new Date(appt.slot).toLocaleString('default', { month: 'short' })}</span>
                <span className="text-lg font-bold leading-none">{new Date(appt.slot).getDate()}</span>
              </div>
              <div>
                <h4 className="font-medium text-sm text-white">{appt.department}</h4>
                <p className="text-xs text-white/40">{appt.doctorId?.name || 'Assigned Doctor'} • {new Date(appt.slot).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${appt.status === 'Confirmed' ? 'bg-hms-primary/15 text-hms-primary border-hms-primary/30' : appt.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
              {appt.status}
            </span>
          </div>
        )) : (
          <div className="text-center py-8 text-white/30">
            <Calendar size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No upcoming appointments</p>
          </div>
        )}
      </div>
      <button onClick={() => setActiveView('appointments')} className="w-full mt-4 py-3 rounded-xl border border-hms-primary/30 text-hms-primary hover:bg-hms-primary/10 transition-all flex items-center justify-center gap-2 text-sm font-medium hover:border-hms-primary/50">
        <Calendar size={14} /> Book New Appointment
      </button>
    </div>

    {/* Quick Actions */}
    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
       <h3 className="font-semibold text-sm mb-2 text-white/40 uppercase tracking-wider">Quick Actions</h3>
       <button onClick={openTriage} className="bg-gradient-to-r from-hms-primary/20 to-purple-500/20 border border-hms-primary/30 text-left px-4 py-3.5 rounded-xl text-white text-sm font-medium hover:from-hms-primary/30 hover:to-purple-500/30 transition-all flex items-center justify-between group">
         <span className="flex items-center gap-3"><Sparkles size={16} className="text-purple-400 group-hover:scale-110 transition-transform" /> Symptom Triage (AI)</span>
         <ChevronRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
       </button>
       <button onClick={() => setActiveView('prescriptions')} className="bg-hms-primary/10 border border-hms-primary/20 text-left px-4 py-3.5 rounded-xl text-white text-sm font-medium hover:bg-hms-primary/20 hover:border-hms-primary/30 transition-all flex items-center gap-3 group">
         <Pill size={16} className="text-hms-primary group-hover:scale-110 transition-transform" /> Prescriptions
       </button>
       <button onClick={() => setActiveView('billing')} className="bg-white/5 border border-white/10 text-left px-4 py-3.5 rounded-xl text-white text-sm font-medium hover:bg-white/10 hover:border-white/15 transition-all flex items-center gap-3 group">
         <CreditCard size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" /> Pay Bills
       </button>
       <button onClick={() => setActiveView('labs')} className="bg-white/5 border border-white/10 text-left px-4 py-3.5 rounded-xl text-white text-sm font-medium hover:bg-white/10 hover:border-white/15 transition-all flex items-center gap-3 group">
         <TestTube size={16} className="text-amber-400 group-hover:scale-110 transition-transform" /> Lab Results
       </button>
       <button onClick={() => setActiveView('records')} className="bg-white/5 border border-white/10 text-left px-4 py-3.5 rounded-xl text-white text-sm font-medium hover:bg-white/10 hover:border-white/15 transition-all flex items-center gap-3 group">
         <FileText size={16} className="text-blue-400 group-hover:scale-110 transition-transform" /> Medical Records
       </button>
    </div>
  </div>
);

// ─── Appointments View with Date Validation ──────────────

const AppointmentsView = ({ appointments, fetchDashboardData }) => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({ department: 'General Practice', doctorId: '', date: '', time: '09:00 AM', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get(`/api/appointments/doctors/${formData.department}`);
        setDoctors(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, doctorId: res.data[0]._id }));
        } else {
          setFormData(prev => ({ ...prev, doctorId: '' }));
        }
      } catch (err) {
        console.error("Failed to fetch doctors");
        setDoctors([]);
        setFormData(prev => ({ ...prev, doctorId: '' }));
      }
    };
    fetchDoctors();
  }, [formData.department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.doctorId) {
      setError('Please select a doctor.');
      return;
    }

    const selectedDate = new Date(`${formData.date} ${formData.time}`);
    if (selectedDate < new Date()) {
      setError('Cannot book appointments in the past. Please select a future date and time.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/api/appointments', {
        doctorId: formData.doctorId,
        department: formData.department,
        slot: selectedDate,
        reason: formData.reason
      });
      setSuccess(true);
      if (fetchDashboardData) {
        fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
          <Calendar className="text-hms-primary" size={20} /> Book Appointment
        </h2>

      {success ? (
        <div className="text-center py-8" style={{animation: 'fadeIn 0.3s ease-out'}}>
          <CheckCircle size={44} className="mx-auto text-emerald-400 mb-3" />
          <h3 className="text-lg font-bold mb-1 text-white">Appointment Confirmed</h3>
          <p className="text-sm text-white/50">Your physician has been notified. Please arrive 15 minutes early.</p>
          <button onClick={() => setSuccess(false)} className="mt-4 text-sm text-hms-primary hover:text-white transition-colors font-medium">Book Another</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400 shrink-0" /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1 font-medium uppercase tracking-wider">Department</label>
              <select className="input-field w-full text-sm" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                <option>General Practice</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Pediatrics</option>
                <option>Orthopedics</option>
                <option>Dermatology</option>
                <option>ENT</option>
                <option>Ophthalmology</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1 font-medium uppercase tracking-wider">Doctor</label>
              <select className="input-field w-full text-sm" value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})} disabled={doctors.length === 0}>
                {doctors.length > 0 ? (
                  doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>{doc.name}</option>
                  ))
                ) : (
                  <option value="">No doctors available</option>
                )}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1 font-medium uppercase tracking-wider">Date</label>
              <input type="date" required min={today} className="input-field w-full text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1 font-medium uppercase tracking-wider">Time Slot</label>
              <select className="input-field w-full text-sm" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}>
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>02:00 PM</option>
                <option>03:00 PM</option>
                <option>04:30 PM</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1 font-medium uppercase tracking-wider">Reason / Symptoms</label>
            <textarea required rows="3" className="input-field w-full text-sm" placeholder="Describe your symptoms or reason for visit..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex justify-center items-center gap-2 text-sm">
            {isSubmitting ? 'Booking...' : '✚ Confirm Appointment'}
          </button>
        </form>
      )}
      </div>

      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
          <ClipboardList className="text-hms-primary" size={20} /> Appointment History
        </h2>
        <div className="space-y-3">
          {appointments && appointments.length > 0 ? appointments.map(appt => (
            <div key={appt._id} className="p-4 bg-black/20 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="font-semibold text-sm text-white">{appt.department}</h4>
                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase border ${appt.status === 'Confirmed' ? 'bg-hms-primary/15 text-hms-primary border-hms-primary/30' : appt.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>{appt.status}</span>
              </div>
              <p className="text-xs text-white/40 font-mono">{new Date(appt.slot).toLocaleString()}</p>
              {appt.reason && <p className="text-xs text-white/30 mt-1 italic">"{appt.reason}"</p>}
            </div>
          )) : (
            <div className="text-center py-8 text-white/30">
              <Calendar size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No appointment history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── File Upload ──────────────────────────────────────────

const FileUploadZone = ({ type, endpoint }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('record', file);

    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadUrl(res.data);

      if (type === 'Record') {
        await api.put('/api/patients/profile/history', {
          condition: `Uploaded Document: ${file.name}`,
          notes: `File accessible at: ${res.data}`
        });
      }
    } catch (err) {
      console.error(err);
    }
    setIsUploading(false);
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
        {type === 'Record' ? <FileText className="text-hms-primary" size={20} /> : <Pill className="text-hms-primary" size={20} />} 
        Upload {type}
      </h2>
      
      {!uploadUrl ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:bg-white/5 hover:border-hms-primary/30 transition-all group cursor-pointer relative">
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setFile(e.target.files[0])} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
            <UploadCloud size={40} className="mx-auto text-white/30 group-hover:text-hms-primary transition-colors mb-3" />
            <p className="font-medium text-sm text-white">{file ? file.name : "Drag & Drop or Click to Select"}</p>
            <p className="text-xs text-white/30 mt-1">PDF, JPG, PNG, DOC (Max 5MB)</p>
          </div>
          <button onClick={handleUpload} disabled={!file || isUploading} className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${file ? 'bg-hms-primary text-white hover:bg-hms-primary/80' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>
            {isUploading ? 'Uploading securely...' : 'Upload File'}
          </button>
        </div>
      ) : (
        <div className="text-center py-6" style={{animation: 'fadeIn 0.3s ease-out'}}>
          <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" />
          <h3 className="text-lg font-bold mb-1 text-white">Upload Successful</h3>
          <p className="text-sm text-white/50 mb-3">Your {type.toLowerCase()} has been securely stored in your medical profile.</p>
          <a href={`http://localhost:5000${uploadUrl}`} target="_blank" rel="noreferrer" className="text-sm text-hms-primary hover:underline">View Uploaded File →</a>
        </div>
      )}
    </div>
  );
};

// ─── Medical Records ──────────────────────────────────────

const MedicalRecordsView = ({ patientProfile }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 text-[100px] text-hms-primary/5 font-black select-none pointer-events-none leading-none">✚</div>
      <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
        <ClipboardList className="text-hms-primary" size={20} /> Medical History
      </h2>
      <div className="space-y-3">
        {patientProfile?.medicalHistory?.length > 0 ? patientProfile.medicalHistory.map((history, i) => (
          <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/10 hover:border-white/15 transition-colors">
            <div className="flex justify-between mb-1">
              <h4 className="font-bold text-sm text-white">{history.condition}</h4>
              <span className="text-[10px] text-hms-primary font-medium bg-hms-primary/10 px-2 py-0.5 rounded-lg">{new Date(history.diagnosedDate).getFullYear()}</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">{history.notes}</p>
          </div>
        )) : (
          <div className="text-center py-6 text-white/30">
            <FileText size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No medical history recorded</p>
          </div>
        )}
        
        {patientProfile?.allergies?.length > 0 && (
           <div className="mt-3 pt-3 border-t border-white/10">
             <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
               <AlertTriangle size={12} className="text-amber-400" /> Known Allergies
             </h4>
             <div className="flex gap-1.5 flex-wrap">
               {patientProfile.allergies.map((allergy, i) => (
                 <span key={i} className="bg-red-500/15 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">{allergy}</span>
               ))}
             </div>
           </div>
        )}
      </div>
    </div>
    
    <FileUploadZone type="Record" endpoint="/api/upload" />
  </div>
);

const PrescriptionsView = ({ prescriptions, handleExplainMed, explainingMedId, medExplanation }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
        <Pill className="text-hms-primary" size={20} /> Active Prescriptions
      </h2>
      <div className="space-y-4">
        {prescriptions && prescriptions.length > 0 ? prescriptions.map(pres => (
          <div key={pres._id} className="bg-black/20 border border-white/10 rounded-xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-white text-sm">{pres.diagnosis}</h4>
                <p className="text-xs text-white/40">Dr. {pres.doctorId?.name} • {new Date(pres.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${pres.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-white/40'}`}>
                {pres.status}
              </span>
            </div>
            
            <div className="space-y-3 mt-3">
              {pres.medicines?.map(med => {
                const key = `${pres._id}-${med._id}`;
                const exp = medExplanation[key];
                const isExplaining = explainingMedId === key;
                
                return (
                  <div key={med._id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-sm text-white">{med.medicineName}</p>
                      <button 
                        onClick={() => handleExplainMed(med, pres._id, med._id)}
                        disabled={isExplaining || exp}
                        className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                      >
                        <Sparkles size={10} /> {isExplaining ? 'Explaining...' : exp ? 'Explained' : 'Explain Meds (AI)'}
                      </button>
                    </div>
                    <div className="flex gap-4 text-xs text-white/50 mb-2">
                      <span><strong className="text-white/70">Dosage:</strong> {med.dosage}</span>
                      <span><strong className="text-white/70">Duration:</strong> {med.duration}</span>
                    </div>
                    
                    {exp && (
                      <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs" style={{animation: 'fadeIn 0.3s ease-out'}}>
                        <p className="text-white/90 mb-2"><strong>How to take:</strong> {exp.explanation}</p>
                        {exp.sideEffects && exp.sideEffects.length > 0 && (
                          <div className="text-white/60">
                            <strong>Possible side effects:</strong>
                            <ul className="list-disc pl-4 mt-1">
                              {exp.sideEffects.map((se, i) => <li key={i}>{se}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-white/30">
            <Pill size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No prescriptions found</p>
          </div>
        )}
      </div>
    </div>
    
    <FileUploadZone type="Prescription" endpoint="/api/upload" />
  </div>
);

const BillingView = ({ invoices }) => (
  <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
      <CreditCard className="text-emerald-400" size={20} /> Billing & Invoices
    </h2>
    <div className="space-y-3">
      {invoices && invoices.length > 0 ? invoices.map(invoice => (
        <div key={invoice._id} className="bg-black/20 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 hover:border-white/15 transition-all">
          <div className="mb-3 md:mb-0">
            <h4 className="font-semibold text-sm text-white mb-0.5">Invoice #{invoice._id.toString().substring(18).toUpperCase()}</h4>
            <p className="text-xs text-white/40 mb-2 font-mono">Generated {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <div className="flex flex-col gap-0.5">
              {invoice.lineItems.map((item, i) => (
                <div key={i} className="text-xs flex gap-2">
                  <span className="text-white/40">• {item.description}</span>
                  <span className="text-white/20">(${item.amount})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-xl font-bold text-white">${invoice.totalAmount.toFixed(2)}</div>
            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${invoice.paymentStatus === 'Paid' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
              {invoice.paymentStatus}
            </span>
            {invoice.paymentStatus !== 'Paid' && (
              <button className="text-xs bg-hms-primary hover:bg-hms-primary/80 text-white px-4 py-2 rounded-xl transition-colors font-medium">Pay Now</button>
            )}
          </div>
        </div>
      )) : (
        <div className="text-center py-8 text-white/30">
          <CreditCard size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No billing records found</p>
        </div>
      )}
    </div>
  </div>
);

const LabResultsView = () => (
  <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center">
    <TestTube size={44} className="mx-auto text-amber-400 mb-4 opacity-40" />
    <h2 className="text-lg font-bold mb-2 text-white">Lab & Pathology Results</h2>
    <p className="text-sm text-white/40 max-w-md mx-auto">Pending pathology and radiology reports will automatically sync here when released by the laboratory department.</p>
  </div>
);

// ─── Sidebar Nav Item ─────────────────────────────────────

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${active ? 'bg-hms-primary/15 text-hms-primary border border-hms-primary/25 shadow-lg shadow-hms-primary/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default PatientDashboard;

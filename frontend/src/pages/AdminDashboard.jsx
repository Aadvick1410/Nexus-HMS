import React, { useState, useEffect } from 'react';
import { Users, Calendar, CreditCard, Search, Edit2, X, Key, LogOut, Clock, Cross, ClipboardList, Stethoscope, Heart, TrendingUp, AlertTriangle, Activity, Shield, Building2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {

    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user_name');
        navigate('/login');
    };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [emergencyCases, setEmergencyCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState('All');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState(null);


  const [editPatient, setEditPatient] = useState(null);
  const [editAppt, setEditAppt] = useState(null);
  const [editInvoice, setEditInvoice] = useState(null);
  const [editRoom, setEditRoom] = useState(null);
  const [editEmergency, setEditEmergency] = useState(null);

  useEffect(() => {
    fetchAdminData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAdminData = async () => {
    try {
      const [patientsRes, apptRes, invRes, docRes, roomsRes, emergRes, analyticsRes] = await Promise.all([
        api.get('/api/patients'),
        api.get('/api/appointments'),
        api.get('/api/billing/all'),
        api.get('/api/doctors').catch(() => ({ data: [] })),
        api.get('/api/rooms').catch(() => ({ data: [] })),
        api.get('/api/emergency').catch(() => ({ data: [] })),
        api.get('/api/analytics/dashboard').catch(() => ({ data: null }))
      ]);
      setPatients(patientsRes.data);
      setAppointments(apptRes.data);
      setInvoices(invRes.data);
      setDoctors(docRes.data);
      setRooms(roomsRes.data);
      setEmergencyCases(emergRes.data);
      if (analyticsRes.data) {
        setAnalyticsData(analyticsRes.data);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const paidRevenue = invoices.filter(i => i.paymentStatus === 'Paid').reduce((a, b) => a + b.totalAmount, 0);
  const pendingRevenue = invoices.filter(i => i.paymentStatus !== 'Paid').reduce((a, b) => a + b.totalAmount, 0);
  const confirmedAppts = appointments.filter(a => a.status === 'Confirmed').length;
  const completedAppts = appointments.filter(a => a.status === 'Completed').length;

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const stats = {
        patients: patients.length,
        appointments: appointments.length,
        doctors: doctors.length,
        rooms: rooms.length,
        emergencyCases: emergencyCases.length,
        paidRevenue,
        pendingRevenue,
        confirmedAppts,
        completedAppts,
      };
      const res = await api.post('/api/ai/admin-insights', { stats });
      setAiInsights(res.data.insights);
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
      setAiInsights("Failed to load insights. Please try again later.");
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div 
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/admin-bg-real.png')" }}
    >
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-hms-dark/95 via-hms-dark/90 to-hms-surface/95 backdrop-blur-sm"></div>

      <div className="relative z-10">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hms-primary flex items-center justify-center shadow-lg shadow-hms-primary/30">
              <Cross size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">Nexus Hospital</h1>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Admin Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-white/70 font-mono bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <Clock size={13} />
              <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="text-white font-semibold">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/15 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              System Online
            </div>
            <button onClick={() => { localStorage.removeItem('hms_token'); navigate('/login'); }} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20 text-xs font-medium hover:scale-105">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="mb-6 bg-gradient-to-r from-hms-primary/20 via-hms-accent/10 to-transparent border border-hms-primary/20 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute -right-8 -top-8 text-[180px] text-hms-primary/5 font-black select-none pointer-events-none leading-none">✚</div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-1">Hospital Administration</h2>
              <p className="text-white/60 text-sm">Manage patients, appointments, billing, and medical records across all departments.</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Registered Patients" value={patients.length} subtitle="Active records" icon={<Users size={22} />} color="text-hms-primary" gradient="from-hms-primary/20 to-hms-primary/5" border="border-hms-primary/25" onClick={() => setActiveTab('patients')} />
            <StatCard title="Appointments" value={appointments.length} subtitle={`${confirmedAppts} confirmed · ${completedAppts} completed`} icon={<Calendar size={22} />} color="text-blue-400" gradient="from-blue-500/20 to-blue-500/5" border="border-blue-500/25" onClick={() => setActiveTab('appointments')} />
            <StatCard title="Revenue Collected" value={`$${paidRevenue.toLocaleString()}`} subtitle="Total payments received" icon={<TrendingUp size={22} />} color="text-emerald-400" gradient="from-emerald-500/20 to-emerald-500/5" border="border-emerald-500/25" onClick={() => { setActiveTab('invoices'); setInvoiceFilter('Paid'); }} />
            <StatCard title="Pending Dues" value={`$${pendingRevenue.toLocaleString()}`} subtitle="Awaiting settlement" icon={<AlertTriangle size={22} />} color="text-amber-400" gradient="from-amber-500/20 to-amber-500/5" border="border-amber-500/25" onClick={() => { setActiveTab('invoices'); setInvoiceFilter('Pending'); }} />
          </div>

          {/* Main Content */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[520px] shadow-2xl">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-60 border-r border-white/10 p-4 space-y-1 bg-black/20">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold px-3 py-2">Database Management</p>
              <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity size={16} />} label="Dashboard" />
              <TabButton active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} icon={<Users size={16} />} label="Patients" count={patients.length} />
              <TabButton active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} icon={<Stethoscope size={16} />} label="Doctors" count={doctors.length} />
              <TabButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} icon={<Calendar size={16} />} label="Appointments" count={appointments.length} />
              <TabButton active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} icon={<CreditCard size={16} />} label="Billing" count={invoices.length} />
              <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<ClipboardList size={16} />} label="Medical Records" />
              <TabButton active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} icon={<Building2 size={16} />} label="Room Management" count={rooms.length} />
              <TabButton active={activeTab === 'emergency'} onClick={() => setActiveTab('emergency')} icon={<AlertTriangle size={16} />} label="Emergency Ward" count={emergencyCases.length} />
              
              {/* Department Info */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold px-3 py-2">Hospital Info</p>
                <div className="px-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Building2 size={12} className="text-hms-primary" />
                    <span>{analyticsData?.departmentData?.length || 0} Departments</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Stethoscope size={12} className="text-emerald-400" />
                    <span>{doctors.length} Active Physicians</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Shield size={12} className="text-amber-400" />
                    <span>HIPAA Certified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Grid */}
            <div className="flex-1 p-5 overflow-x-auto">
              <div className="mb-4 flex items-center bg-black/30 border border-white/10 rounded-xl px-4 py-2.5">
                <Search className="text-white/40 mr-3" size={16} />
                <input 
                  type="text" 
                  placeholder="Search patients, records, invoices..." 
                  className="bg-transparent border-none outline-none text-white w-full placeholder-white/30 text-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                      <Activity size={14} className="text-hms-primary" /> Overview
                    </h3>
                  </div>
                  
                  <div className="bg-black/20 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity size={16} className="text-hms-primary" /> AI Operations Insights
                      </h4>
                      <button 
                        onClick={fetchInsights} 
                        disabled={loadingInsights}
                        className="bg-hms-primary/20 hover:bg-hms-primary/30 text-hms-primary border border-hms-primary/30 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                      >
                        {loadingInsights ? (
                          <><div className="w-3 h-3 border-2 border-hms-primary border-t-transparent rounded-full animate-spin"></div> Generating...</>
                        ) : (
                          <><Activity size={14} /> Generate Insights</>
                        )}
                      </button>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 min-h-[120px]">
                      {loadingInsights ? (
                        <p className="text-white/40 text-sm animate-pulse">Analyzing hospital operations and generating insights...</p>
                      ) : aiInsights ? (
                        <div className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{aiInsights}</div>
                      ) : (
                        <p className="text-white/40 text-sm italic">Click "Generate Insights" to get AI-powered analysis of your current hospital operations, bottlenecks, and staffing suggestions.</p>
                      )}
                    </div>
                  </div>

                  {analyticsData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      
                      {/* Revenue Trends */}
                      <div className="bg-black/20 border border-white/10 rounded-xl p-6 backdrop-blur-md">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <TrendingUp size={16} className="text-emerald-400" /> Revenue Trends
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={analyticsData.revenueData}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                            <XAxis dataKey="date" stroke="#ffffff66" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#ffffff66" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} itemStyle={{color: '#34d399'}} />
                            <Area type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Department Load */}
                      <div className="bg-black/20 border border-white/10 rounded-xl p-6 backdrop-blur-md">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <Users size={16} className="text-blue-400" /> Department Load
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analyticsData.departmentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                            <XAxis dataKey="name" stroke="#ffffff66" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#ffffff66" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} cursor={{fill: '#ffffff1a'}} />
                            <Bar dataKey="patients" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Bed Occupancy */}
                      <div className="bg-black/20 border border-white/10 rounded-xl p-6 backdrop-blur-md">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <Activity size={16} className="text-red-400" /> Bed Occupancy
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie 
                              data={analyticsData.bedOccupancy} 
                              innerRadius={60} 
                              outerRadius={80} 
                              paddingAngle={5} 
                              dataKey="value"
                            >
                              {analyticsData.bedOccupancy.map((entry, index) => {
                                const BED_COLORS = { Occupied: '#ef4444', Available: '#10b981', Maintenance: '#f59e0b' };
                                return <Cell key={`cell-${index}`} fill={BED_COLORS[entry.name] || '#ffffff'} />;
                              })}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Doctor Utilization */}
                      <div className="bg-black/20 border border-white/10 rounded-xl p-6 backdrop-blur-md">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <Stethoscope size={16} className="text-purple-400" /> Doctor Utilization
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart outerRadius={80} data={analyticsData.doctorUtilization}>
                            <PolarGrid stroke="#ffffff33" />
                            <PolarAngleAxis dataKey="subject" tick={{fill: '#ffffff99', fontSize: 10}} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{fill: '#ffffff66', fontSize: 10}} />
                            <Radar name="Utilization" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.3} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      
                    </div>
                  )}

                </div>
              )}

              {activeTab === 'patients' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2"><Users size={14} className="text-hms-primary" /> Patient Registry</h3>
                    <span className="text-xs text-white/40">{filteredPatients.length} records</span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10">
                        <th className="py-3 px-3">Patient ID</th>
                        <th className="py-3 px-3">Full Name</th>
                        <th className="py-3 px-3">Contact</th>
                        <th className="py-3 px-3">Blood Type</th>
                        <th className="py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map(p => (
                        <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 px-3 font-mono text-xs text-hms-primary">{p.patientId}</td>
                          <td className="py-3.5 px-3 font-medium text-sm text-white">{p.userId?.name}</td>
                          <td className="py-3.5 px-3 text-sm text-white/60">{p.phone}</td>
                          <td className="py-3.5 px-3"><span className="text-sm text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">{p.bloodGroup}</span></td>
                          <td className="py-3.5 px-3">
                            <button onClick={() => setEditPatient(p)} className="text-white/40 hover:text-hms-primary p-1.5 rounded-lg hover:bg-hms-primary/10 transition-all opacity-0 group-hover:opacity-100">
                              <Edit2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2"><Calendar size={14} className="text-blue-400" /> Appointment Schedule</h3>
                    <span className="text-xs text-white/40">{appointments.length} total</span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10">
                        <th className="py-3 px-3">Date & Time</th>
                        <th className="py-3 px-3">Patient</th>
                        <th className="py-3 px-3">Department</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(a => (
                        <tr key={a._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 px-3 text-sm text-white/80 whitespace-nowrap font-mono text-xs">{new Date(a.slot).toLocaleString()}</td>
                          <td className="py-3.5 px-3 text-sm font-medium text-white">{a.patientId?.userId?.name || 'Unknown'}</td>
                          <td className="py-3.5 px-3 text-sm text-hms-primary font-medium">{a.department}</td>
                          <td className="py-3.5 px-3">
                            <StatusBadge status={a.status} />
                          </td>
                          <td className="py-3.5 px-3">
                            <button onClick={() => setEditAppt(a)} className="text-white/40 hover:text-hms-primary p-1.5 rounded-lg hover:bg-hms-primary/10 transition-all opacity-0 group-hover:opacity-100">
                              <Edit2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2"><CreditCard size={14} className="text-emerald-400" /> Financial Ledger</h3>
                    <span className="text-xs text-white/40">{invoices.length} invoices</span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10">
                        <th className="py-3 px-3">Invoice #</th>
                        <th className="py-3 px-3">Patient</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">
                          <select 
                            className="bg-transparent border-none text-[10px] text-white/40 uppercase tracking-wider outline-none cursor-pointer hover:text-white"
                            value={invoiceFilter}
                            onChange={(e) => setInvoiceFilter(e.target.value)}
                          >
                            <option value="All">Status (All)</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </th>
                        <th className="py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.filter(i => {
                        if (invoiceFilter === 'All') return true;
                        if (invoiceFilter === 'Paid') return i.paymentStatus === 'Paid';
                        if (invoiceFilter === 'Pending') return i.paymentStatus !== 'Paid';
                        return true;
                      }).map(i => (
                        <tr key={i._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 px-3 font-mono text-xs text-white/50">INV-{i._id.toString().substring(18).toUpperCase()}</td>
                          <td className="py-3.5 px-3 text-sm font-medium text-white">{i.patientId?.userId?.name || 'Unknown'}</td>
                          <td className="py-3.5 px-3 text-sm text-emerald-400 font-bold">${i.totalAmount.toLocaleString()}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${i.paymentStatus === 'Paid' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                              {i.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <button onClick={() => setEditInvoice(i)} className="text-white/40 hover:text-hms-primary p-1.5 rounded-lg hover:bg-hms-primary/10 transition-all opacity-0 group-hover:opacity-100">
                              <Edit2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'doctors' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2"><Stethoscope size={14} className="text-emerald-400" /> Physician Roster</h3>
                    <span className="text-xs text-white/40">{doctors.length} physicians</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {doctors.map(doc => {
                      const docAppts = appointments.filter(a => a.doctorId?._id === doc._id || a.doctorId === doc._id);
                      const completedCount = docAppts.filter(a => a.status === 'Completed').length;
                      const pendingCount = docAppts.filter(a => a.status === 'Confirmed' || a.status === 'Requested').length;
                      return (
                        <div key={doc._id} className="bg-black/20 border border-white/10 rounded-xl p-5 hover:border-white/15 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                              <Stethoscope size={20} className="text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-white">{doc.name}</h4>
                              <p className="text-[11px] text-white/40">{doc.email}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${doc.isActive !== false ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                              {doc.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-black/30 p-2 rounded-lg text-center">
                              <p className="text-[9px] text-white/30 uppercase">Total</p>
                              <p className="font-bold text-white text-sm">{docAppts.length}</p>
                            </div>
                            <div className="bg-black/30 p-2 rounded-lg text-center">
                              <p className="text-[9px] text-white/30 uppercase">Done</p>
                              <p className="font-bold text-emerald-400 text-sm">{completedCount}</p>
                            </div>
                            <div className="bg-black/30 p-2 rounded-lg text-center">
                              <p className="text-[9px] text-white/30 uppercase">Pending</p>
                              <p className="font-bold text-amber-400 text-sm">{pendingCount}</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-white/20">
                            Joined {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2 mb-3"><FileText size={14} className="text-hms-primary" /> Patient Medical Records</h3>
                  {filteredPatients.map(p => (
                    <div key={p._id} className="bg-black/20 border border-white/10 rounded-xl p-5 hover:border-white/15 transition-colors">
                      <h3 className="text-sm font-bold text-white mb-3 pb-3 border-b border-white/10 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-hms-primary/15 flex items-center justify-center">
                          <Stethoscope size={14} className="text-hms-primary" />
                        </div>
                        {p.userId?.name}
                        <span className="text-[10px] text-white/30 font-mono ml-auto">{p.patientId}</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {p.medicalHistory?.length > 0 ? p.medicalHistory.map((h, i) => (
                          <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <div className="flex justify-between mb-1">
                              <span className="font-semibold text-xs text-hms-primary">{h.condition}</span>
                              <span className="text-[10px] text-white/30 font-mono">{new Date(h.diagnosedDate).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed">{h.notes}</p>
                          </div>
                        )) : <p className="text-white/30 text-xs italic col-span-2">No medical history on file</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'rooms' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2"><Building2 size={14} className="text-hms-primary" /> Room Management</h3>
                    <span className="text-xs text-white/40">{rooms.length} rooms</span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10">
                        <th className="py-3 px-3">Room</th>
                        <th className="py-3 px-3">Ward</th>
                        <th className="py-3 px-3">Beds (Occ/Tot)</th>
                        <th className="py-3 px-3">Price/Day</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(r => (
                        <tr key={r._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 px-3 font-mono text-xs text-white">{r.roomNumber}</td>
                          <td className="py-3.5 px-3 text-sm text-hms-primary">{r.ward}</td>
                          <td className="py-3.5 px-3 text-sm text-white/60">{r.occupiedBeds} / {r.bedCount}</td>
                          <td className="py-3.5 px-3 text-sm text-emerald-400 font-bold">${r.pricePerDay}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${r.status === 'Available' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : r.status === 'Full' ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <button onClick={() => setEditRoom(r)} className="text-white/40 hover:text-hms-primary p-1.5 rounded-lg hover:bg-hms-primary/10 transition-all opacity-0 group-hover:opacity-100">
                              <Edit2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'emergency' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2"><AlertTriangle size={14} className="text-red-400" /> Emergency Ward</h3>
                    <span className="text-xs text-white/40">{emergencyCases.length} cases</span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] text-white/40 uppercase tracking-wider border-b border-white/10">
                        <th className="py-3 px-3">Patient Name</th>
                        <th className="py-3 px-3">Severity</th>
                        <th className="py-3 px-3">Complaint</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Arrival Time</th>
                        <th className="py-3 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emergencyCases.map(e => (
                        <tr key={e._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 px-3 text-sm font-medium text-white">{e.patientName}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${e.severity === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' : e.severity === 'Urgent' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}`}>
                              {e.severity}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-sm text-white/80">{e.chiefComplaint}</td>
                          <td className="py-3.5 px-3 text-sm text-white/60">{e.status}</td>
                          <td className="py-3.5 px-3 text-xs text-white/40">{new Date(e.arrivalTime).toLocaleString()}</td>
                          <td className="py-3.5 px-3">
                            <button onClick={() => setEditEmergency(e)} className="text-white/40 hover:text-hms-primary p-1.5 rounded-lg hover:bg-hms-primary/10 transition-all opacity-0 group-hover:opacity-100">
                              <Edit2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editPatient && (
        <EditPatientModal 
          patient={editPatient} 
          onClose={() => setEditPatient(null)} 
          onUpdate={(d) => { setPatients(patients.map(p => p._id === d._id ? d : p)); setEditPatient(null); }} 
        />
      )}
      {editAppt && (
        <EditApptModal 
          appointment={editAppt} 
          onClose={() => setEditAppt(null)} 
          onUpdate={(d) => { setAppointments(appointments.map(a => a._id === d._id ? d : a)); setEditAppt(null); }} 
        />
      )}
      {editInvoice && (
        <EditInvoiceModal 
          invoice={editInvoice} 
          onClose={() => setEditInvoice(null)} 
          onUpdate={(d) => { setInvoices(invoices.map(i => i._id === d._id ? d : i)); setEditInvoice(null); }} 
        />
      )}
      {editRoom && (
        <EditRoomModal 
          room={editRoom} 
          onClose={() => setEditRoom(null)} 
          onUpdate={(d) => { setRooms(rooms.map(r => r._id === d._id ? d : r)); setEditRoom(null); }} 
        />
      )}
      {editEmergency && (
        <EditEmergencyModal 
          emergency={editEmergency} 
          onClose={() => setEditEmergency(null)} 
          onUpdate={(d) => { setEmergencyCases(emergencyCases.map(e => e._id === d._id ? d : e)); setEditEmergency(null); }} 
        />
      )}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const styles = {
    Confirmed: 'bg-hms-primary/15 text-hms-primary border-hms-primary/30',
    Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Requested: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.Requested}`}>
      {status}
    </span>
  );
};

// ─── Modals ───────────────────────────────────────────────

const EditPatientModal = ({ patient, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ name: patient.userId?.name, phone: patient.phone, bloodGroup: patient.bloodGroup });
  const [newPassword, setNewPassword] = useState('');
  
  const handleSave = async () => {
    try {
      const res = await api.put(`/api/patients/admin/${patient._id}`, formData);
      onUpdate(res.data);
    } catch (e) { alert("Failed to update patient"); }
  };

  const handleResetPassword = async () => {
    if(!newPassword) return alert("Enter a new password");
    try {
      await api.put(`/api/auth/admin/reset-password/${patient.userId._id}`, { password: newPassword });
      alert("Password reset successfully!");
      setNewPassword('');
    } catch (e) { alert("Failed to reset password"); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-hms-surface border border-white/15 p-6 rounded-2xl w-full max-w-md relative shadow-2xl" style={{animation: 'fadeIn 0.2s ease-out'}}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        <h2 className="text-sm font-bold mb-5 flex items-center gap-2 text-hms-primary uppercase tracking-wider"><Edit2 size={14} /> Edit Patient Record</h2>
        
        <div className="space-y-3">
          <ModalField label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
          <ModalField label="Phone Number" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
          <ModalField label="Blood Group" value={formData.bloodGroup} onChange={v => setFormData({...formData, bloodGroup: v})} />

          <button onClick={handleSave} className="w-full bg-hms-primary hover:bg-hms-primary/80 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Save Changes</button>
          
          <hr className="border-white/10 my-3" />
          
          <div className="bg-red-500/5 border border-red-500/15 p-4 rounded-xl">
             <h3 className="text-[10px] font-bold text-red-400 flex items-center gap-1.5 mb-2.5 uppercase tracking-wider"><Key size={12} /> Password Override</h3>
             <div className="flex gap-2">
               <input placeholder="New Password" type="password" className="flex-1 bg-hms-dark border border-white/10 rounded-lg p-2.5 text-sm outline-none focus:border-red-400 text-white transition-colors" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
               <button onClick={handleResetPassword} className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors">Reset</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditApptModal = ({ appointment, onClose, onUpdate }) => {
  const [status, setStatus] = useState(appointment.status);
  
  const handleSave = async () => {
    try {
      const res = await api.put(`/api/appointments/${appointment._id}`, { status });
      onUpdate(res.data);
    } catch (e) { alert("Failed to update appointment"); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-hms-surface border border-white/15 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl" style={{animation: 'fadeIn 0.2s ease-out'}}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={18} /></button>
        <h2 className="text-sm font-bold mb-5 text-hms-primary uppercase tracking-wider flex items-center gap-2"><Calendar size={14} /> Update Appointment</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Patient: <span className="text-white font-medium">{appointment.patientId?.userId?.name}</span></p>
            <p className="text-xs text-white/40">Department: <span className="text-hms-primary font-medium">{appointment.department}</span></p>
          </div>
          <div><label className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Status</label>
          <select className="w-full bg-hms-dark border border-white/10 rounded-xl p-2.5 mt-1 text-white outline-none text-sm focus:border-hms-primary transition-colors" value={status} onChange={e => setStatus(e.target.value)}>
            <option>Requested</option>
            <option>Confirmed</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select></div>
          <button onClick={handleSave} className="w-full bg-hms-primary hover:bg-hms-primary/80 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Save</button>
        </div>
      </div>
    </div>
  );
};

const EditInvoiceModal = ({ invoice, onClose, onUpdate }) => {
  const [totalAmount, setAmount] = useState(invoice.totalAmount);
  const [paymentStatus, setStatus] = useState(invoice.paymentStatus);
  
  const handleSave = async () => {
    try {
      const res = await api.put(`/api/billing/${invoice._id}`, { totalAmount: Number(totalAmount), paymentStatus });
      onUpdate(res.data);
    } catch (e) { alert("Failed to update invoice"); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-hms-surface border border-white/15 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl" style={{animation: 'fadeIn 0.2s ease-out'}}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={18} /></button>
        <h2 className="text-sm font-bold mb-5 text-hms-primary uppercase tracking-wider flex items-center gap-2"><CreditCard size={14} /> Update Invoice</h2>
        
        <div className="space-y-4">
          <ModalField label="Amount ($)" value={totalAmount} onChange={v => setAmount(v)} type="number" />
          
          <div><label className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Payment Status</label>
          <select className="w-full bg-hms-dark border border-white/10 rounded-xl p-2.5 mt-1 text-white outline-none text-sm focus:border-emerald-400 transition-colors" value={paymentStatus} onChange={e => setStatus(e.target.value)}>
            <option>Unpaid</option>
            <option>Paid</option>
          </select></div>
          <button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Save Invoice</button>
        </div>
      </div>
    </div>
  );
};

const EditRoomModal = ({ room, onClose, onUpdate }) => {
  const [pricePerDay, setPrice] = useState(room.pricePerDay);
  const [status, setStatus] = useState(room.status);
  
  const handleSave = async () => {
    try {
      const res = await api.put(`/api/rooms/${room._id}`, { pricePerDay: Number(pricePerDay), status });
      onUpdate(res.data);
    } catch (e) { alert("Failed to update room"); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-hms-surface border border-white/15 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl" style={{animation: 'fadeIn 0.2s ease-out'}}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={18} /></button>
        <h2 className="text-sm font-bold mb-5 text-hms-primary uppercase tracking-wider flex items-center gap-2"><Building2 size={14} /> Update Room</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Room: <span className="text-white font-medium">{room.roomNumber}</span></p>
            <p className="text-xs text-white/40">Ward: <span className="text-hms-primary font-medium">{room.ward}</span></p>
          </div>
          <ModalField label="Price Per Day ($)" value={pricePerDay} onChange={v => setPrice(v)} type="number" />
          <div><label className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Status</label>
          <select className="w-full bg-hms-dark border border-white/10 rounded-xl p-2.5 mt-1 text-white outline-none text-sm focus:border-hms-primary transition-colors" value={status} onChange={e => setStatus(e.target.value)}>
            <option>Available</option>
            <option>Full</option>
            <option>Maintenance</option>
          </select></div>
          <button onClick={handleSave} className="w-full bg-hms-primary hover:bg-hms-primary/80 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Save Room</button>
        </div>
      </div>
    </div>
  );
};

const EditEmergencyModal = ({ emergency, onClose, onUpdate }) => {
  const [status, setStatus] = useState(emergency.status);
  
  const handleSave = async () => {
    try {
      const res = await api.put(`/api/emergency/${emergency._id}`, { status });
      onUpdate(res.data);
    } catch (e) { alert("Failed to update emergency case"); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-hms-surface border border-white/15 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl" style={{animation: 'fadeIn 0.2s ease-out'}}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={18} /></button>
        <h2 className="text-sm font-bold mb-5 text-red-400 uppercase tracking-wider flex items-center gap-2"><AlertTriangle size={14} /> Update Emergency Case</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Patient: <span className="text-white font-medium">{emergency.patientName}</span></p>
            <p className="text-xs text-white/40">Complaint: <span className="text-white font-medium">{emergency.chiefComplaint}</span></p>
          </div>
          <div><label className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Status</label>
          <select className="w-full bg-hms-dark border border-white/10 rounded-xl p-2.5 mt-1 text-white outline-none text-sm focus:border-red-400 transition-colors" value={status} onChange={e => setStatus(e.target.value)}>
            <option>Incoming</option>
            <option>Triaged</option>
            <option>In Treatment</option>
            <option>Stabilized</option>
            <option>Transferred</option>
            <option>Discharged</option>
          </select></div>
          <button onClick={handleSave} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Save Case</button>
        </div>
      </div>
    </div>
  );
};

// ─── Reusable Components ──────────────────────────────────

const ModalField = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{label}</label>
    <input type={type} className="w-full bg-hms-dark border border-white/10 rounded-xl p-2.5 mt-1 outline-none focus:border-hms-primary text-sm text-white transition-colors" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const StatCard = ({ title, value, subtitle, icon, color, gradient, border, onClick }) => (
  <div onClick={onClick} className={`p-5 rounded-2xl bg-gradient-to-br ${gradient} border ${border} backdrop-blur-md relative overflow-hidden group hover:scale-[1.02] transition-transform ${onClick ? 'cursor-pointer' : ''}`}>
    <div className={`absolute -right-3 -top-3 ${color} opacity-10 group-hover:opacity-20 transition-opacity`}>
      {React.cloneElement(icon, { size: 60 })}
    </div>
    <div className={`p-2 rounded-lg bg-white/5 ${color} w-fit mb-3`}>{icon}</div>
    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-0.5">{title}</p>
    <h3 className="text-2xl font-bold text-white">{value}</h3>
    {subtitle && <p className="text-[10px] text-white/30 mt-1">{subtitle}</p>}
  </div>
);

const TabButton = ({ active, onClick, icon, label, count }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${active ? 'bg-hms-primary/15 text-hms-primary border border-hms-primary/25 shadow-lg shadow-hms-primary/10' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
    {count !== undefined && <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${active ? 'bg-hms-primary/20 text-hms-primary' : 'bg-white/5 text-white/30'}`}>{count}</span>}
  </button>
);

export default AdminDashboard;

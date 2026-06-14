import React, { useState, useEffect } from 'react';
import { Mail, Lock, ShieldCheck, Key, Heart, Stethoscope, Cross } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('hms_token', response.data.token);
      localStorage.setItem('hms_user_name', response.data.name);
      localStorage.setItem('hms_user_role', response.data.role);
      
      try {
        const payload = JSON.parse(atob(response.data.token.split('.')[1]));
        setUser({ _id: payload.id || payload._id || 'mock-user-id', role: response.data.role, name: response.data.name });
      } catch (e) {
        setUser({ _id: 'mock-user-id', role: response.data.role, name: response.data.name });
      }
      
      setIsLoading(false);
      
      if (response.data.role === 'Super Admin' || response.data.role === 'Hospital Admin') {
        navigate('/dashboard/admin');
      } else if (response.data.role === 'Doctor') {
        navigate('/dashboard/doctor');
      } else if (response.data.role === 'Nurse') {
        navigate('/dashboard/nurse');
      } else if (response.data.role === 'Receptionist') {
        navigate('/dashboard/receptionist');
      } else if (response.data.role === 'Lab Technician') {
        navigate('/dashboard/lab');
      } else if (response.data.role === 'Pharmacist') {
        navigate('/dashboard/pharmacy');
      } else if (response.data.role === 'Billing Executive') {
        navigate('/dashboard/billing');
      } else {
        navigate('/dashboard/patient');
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetEmailSent(true);
    }, 1500);
  };

  if (isForgotPassword) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(to bottom right, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.98)), url('/hospital-bg.png')" }}
      >
        {/* Medical background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(8,145,178,0.3) 60px, rgba(8,145,178,0.3) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(8,145,178,0.3) 60px, rgba(8,145,178,0.3) 61px)'}}></div>
        <div className="absolute top-1/4 left-1/4 text-[200px] text-hms-primary/[0.04] font-black select-none pointer-events-none">✚</div>
        
        <div className="w-full max-w-md relative z-10 glass-panel p-8 rounded-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-hms-primary/15 border border-hms-primary/30 mb-4">
              <Key className="text-hms-primary" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
            <p className="text-hms-muted text-sm">Enter your registered email to receive a reset link</p>
          </div>

          {resetEmailSent ? (
            <div className="text-center animate-fade-in">
               <div className="bg-hms-secondary/15 border border-hms-secondary/30 text-emerald-400 p-4 rounded-xl mb-6 text-sm">
                 If an account exists for <strong>{email}</strong>, a reset link has been sent.
               </div>
               <button onClick={() => { setIsForgotPassword(false); setResetEmailSent(false); }} className="text-hms-primary hover:text-white font-medium transition-colors">Return to Login</button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-hms-muted mb-2">Email Address</label>
                <input type="email" required className="input-field w-full" placeholder="doctor@nexushospital.org" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              
              <button type="submit" disabled={isLoading} className="btn-primary w-full flex justify-center py-3">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div className="text-center">
                <button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm text-hms-muted hover:text-white transition-colors">
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/hospital-bg.png')" }}
    >
      
      {/* Left Panel — Hospital Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-black/70 backdrop-blur-xl p-12 relative overflow-hidden border-r border-white/10">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(8,145,178,0.4) 60px, rgba(8,145,178,0.4) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(8,145,178,0.4) 60px, rgba(8,145,178,0.4) 61px)'}}></div>
        
        {/* Large medical cross watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[320px] text-hms-primary/[0.04] font-black select-none pointer-events-none leading-none">✚</div>
        
        {/* Floating ECG line */}
        <svg className="absolute bottom-32 left-0 right-0 w-full opacity-10" viewBox="0 0 800 100" preserveAspectRatio="none">
          <polyline fill="none" stroke="#0891b2" strokeWidth="2" points="0,50 100,50 120,50 140,20 160,80 180,30 200,70 220,50 320,50 340,50 360,20 380,80 400,30 420,70 440,50 540,50 560,50 580,20 600,80 620,30 640,70 660,50 800,50"/>
        </svg>

        {/* Branding Content */}
        <div className="relative z-10 drop-shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-hms-primary border border-hms-primary/40 flex items-center justify-center shadow-lg shadow-hms-primary/30">
              <Cross size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">Nexus Hospital</h1>
              <p className="text-xs text-white/80 font-bold uppercase tracking-widest drop-shadow-md">Management System</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 space-y-8 drop-shadow-2xl">
          <h2 className="text-4xl font-bold text-white leading-tight drop-shadow-xl">
            Comprehensive<br/>
            <span className="text-hms-primary drop-shadow-xl">Patient Care</span><br/>
            Management
          </h2>
          <p className="text-white leading-relaxed max-w-md drop-shadow-md font-medium">
            Streamlining hospital operations from patient registration to discharge. Manage appointments, medical records, prescriptions, billing, and lab results — all in one secure platform.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => alert('Nexus Hospital features over 15 specialized departments including Cardiology, Neurology, and Orthopedics.')} className="flex items-center gap-3 p-3 bg-black/50 border border-white/10 rounded-lg hover:bg-hms-primary/20 hover:-translate-y-1 transition-all cursor-pointer shadow-lg text-left">
              <Stethoscope size={18} className="text-hms-primary shrink-0" />
              <span className="text-sm text-white font-medium drop-shadow-md">15+ Departments</span>
            </button>
            <button onClick={() => alert('Our emergency response team is available 24/7 for immediate medical assistance.')} className="flex items-center gap-3 p-3 bg-black/50 border border-white/10 rounded-lg hover:bg-hms-danger/20 hover:-translate-y-1 transition-all cursor-pointer shadow-lg text-left">
              <Heart size={18} className="text-hms-danger shrink-0" />
              <span className="text-sm text-white font-medium drop-shadow-md">24/7 Emergency</span>
            </button>
            <button onClick={() => alert('All patient data is handled in strict compliance with HIPAA privacy and security regulations.')} className="flex items-center gap-3 p-3 bg-black/50 border border-white/10 rounded-lg hover:bg-hms-secondary/20 hover:-translate-y-1 transition-all cursor-pointer shadow-lg text-left">
              <ShieldCheck size={18} className="text-hms-secondary shrink-0" />
              <span className="text-sm text-white font-medium drop-shadow-md">HIPAA Compliant</span>
            </button>
            <button onClick={() => alert('Your medical records are secured with military-grade end-to-end encryption.')} className="flex items-center gap-3 p-3 bg-black/50 border border-white/10 rounded-lg hover:bg-hms-accent/20 hover:-translate-y-1 transition-all cursor-pointer shadow-lg text-left">
              <Lock size={18} className="text-hms-accent shrink-0" />
              <span className="text-sm text-white font-medium drop-shadow-md">Encrypted Records</span>
            </button>
          </div>
        </div>
        
        <div className="relative z-10 text-xs text-hms-muted/50">
          © {new Date().getFullYear()} Nexus Hospital Management System. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-black/60 backdrop-blur-xl">
        
        {/* Live clock */}
        <div className="absolute top-6 right-8 text-right">
          <p className="text-xs text-hms-muted font-mono">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-lg text-white font-mono font-bold tracking-wider">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-hms-primary/15 border border-hms-primary/30 mb-4">
            <Cross size={28} className="text-hms-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Nexus Hospital</h1>
          <p className="text-xs text-hms-muted uppercase tracking-widest">Management System</p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Staff & Patient Portal</h2>
            <p className="text-hms-muted text-sm">Sign in with your hospital credentials to continue</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl">
            {error && (
              <div className="mb-4 p-3 bg-hms-danger/15 border border-hms-danger/40 rounded-lg text-red-300 text-sm text-center flex items-center justify-center gap-2">
                <span className="text-hms-danger font-bold">⚠</span> {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm text-hms-muted font-medium ml-1">Email / Staff ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-hms-muted group-focus-within:text-hms-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    required
                    className="input-field !pl-11" 
                    placeholder="staff@nexushospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm text-hms-muted font-medium">Password</label>
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-hms-primary hover:text-white transition-colors">Forgot Password?</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-hms-muted group-focus-within:text-hms-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    className="input-field !pl-11 tracking-widest" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary flex justify-center items-center gap-2 relative overflow-hidden group">
                <span className={`transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                  Sign In to Portal
                </span>
                <ShieldCheck size={18} className={`transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} />
                
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
              
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-3">
              <p className="text-sm text-hms-muted">
                New patient? <span onClick={() => navigate('/signup')} className="text-hms-primary hover:text-white cursor-pointer font-medium transition-colors">Register here</span>
              </p>
              <p className="text-xs text-hms-muted/50 flex items-center justify-center gap-1.5">
                <ShieldCheck size={11} />
                HIPAA-Compliant Secure Connection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

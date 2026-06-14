import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, Cross, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Patient'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/auth/register', formData);
      if (response.data.token) {
        localStorage.setItem('hms_token', response.data.token);
        localStorage.setItem('hms_user_name', response.data.name);
        localStorage.setItem('hms_user_role', response.data.role);

        setIsLoading(false);
        if (response.data.role === 'Doctor') {
          navigate('/dashboard/doctor');
        } else {
          navigate('/dashboard/patient');
        }
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/signup-bg.png')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-hms-dark/90 via-hms-dark/95 to-hms-surface/90 backdrop-blur-sm"></div>
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-hms-primary border border-hms-primary/40 mb-4 shadow-lg shadow-hms-primary/30">
            <UserPlus size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg">Patient Registration</h1>
          <p className="text-white/50 text-sm mt-1 drop-shadow-md">Create your Nexus Hospital account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/15 p-8 rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
              ⚠ {error}
            </div>
          )}
          
          <form onSubmit={handleSignup} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-hms-primary transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  className="input-field !pl-11" 
                  placeholder="e.g., Aadvick Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-hms-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  className="input-field !pl-11" 
                  placeholder="patient@nexushospital.org"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-hms-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required
                  className="input-field !pl-11 tracking-widest" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/40 font-medium uppercase tracking-wider ml-1">Registering As</label>
              <select 
                className="input-field"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor / Physician</option>
              </select>
            </div>

            <button type="submit" className="btn-primary flex justify-center items-center gap-2 relative overflow-hidden">
              <span className={`transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                Complete Registration
              </span>
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
            
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2">
            <p className="text-sm text-white/50">
              Already registered? <span onClick={() => navigate('/login')} className="text-hms-primary hover:text-white cursor-pointer font-medium transition-colors">Sign in</span>
            </p>
            <p className="text-xs text-white/30 flex items-center justify-center gap-1.5">
              <ShieldCheck size={11} /> HIPAA-Compliant Registration
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Signup;

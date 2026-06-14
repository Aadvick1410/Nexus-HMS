import React, { useState } from 'react';
import { Mail, Lock, Activity, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Determine dashboard based on hardcoded demo logic for now
      // Later this will be real JWT auth logic
      if (email.includes('admin')) {
        navigate('/dashboard/admin');
      } else if (email.includes('dr')) {
        navigate('/dashboard/doctor');
      } else {
        navigate('/dashboard/patient');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-hms-primary/20 via-hms-dark to-hms-dark p-6 relative overflow-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-hms-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-hms-primary rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-hms-primary to-hms-secondary mb-6 shadow-2xl shadow-hms-primary/30 transform hover:rotate-12 transition-transform duration-500">
            <Activity size={40} color="white" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-hms-muted mb-2 tracking-tight">Nexus HMS</h1>
          <p className="text-hms-muted font-medium">Enterprise Hospital Management</p>
        </div>

        {/* Login Form */}
        <div className="glass-panel p-8 rounded-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="space-y-1">
              <label className="text-sm text-hms-muted font-medium ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-hms-muted group-focus-within:text-hms-primary transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  required
                  className="input-field pl-11" 
                  placeholder="admin@nexushms.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm text-hms-muted font-medium">Password</label>
                <a href="#" className="text-xs text-hms-primary hover:text-hms-accent transition-colors">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-hms-muted group-focus-within:text-hms-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  required
                  className="input-field pl-11 tracking-widest" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary flex justify-center items-center gap-2 relative overflow-hidden group">
              <span className={`transition-all duration-300 ${isLoading ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                Sign In Securely
              </span>
              <ShieldCheck size={20} className={`transition-all duration-300 ${isLoading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`} />
              
              {/* Loading Spinner inside button */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
            
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-hms-muted/70 flex items-center justify-center gap-2">
              <Lock size={12} />
              End-to-End Encrypted System
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;

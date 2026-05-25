import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

function Login() {
  const navigate = useNavigate();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Show/Hide password toggle
  const [showPassword, setShowPassword] = useState(false);
  
  // States for feedback
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate form fields
  const validateForm = () => {
    const tempErrors = {};
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }
      
      // Save details to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect
      if (data.user.role === 'manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/member-dashboard');
      }
      
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex items-center justify-center relative p-6 overflow-x-hidden">
      
      {/* Background Soft Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Card Wrapper */}
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 bg-[#131b2e]/40 border border-white/10">
        
        {/* App Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center space-x-2 mb-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FlowSync
            </span>
          </Link>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Welcome back</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to your workspace</p>
        </div>

        {/* Credentials Error Message */}
        {apiError && (
          <div className="mb-6 flex items-start space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.2" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="piyush@flowsync.com"
                className={`w-full bg-slate-900/50 hover:bg-slate-900/80 border ${
                  errors.email ? 'border-rose-500/80' : 'border-slate-800'
                } focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200`}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-500 font-medium mt-1.5 ml-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-slate-900/50 hover:bg-slate-900/80 border ${
                  errors.password ? 'border-rose-500/80' : 'border-slate-800'
                } focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/10 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-500 font-medium mt-1.5 ml-1">{errors.password}</p>}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden rounded-xl py-3.5 mt-2 font-bold text-white transition-all duration-300 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"></span>
            <span className="relative flex items-center justify-center gap-2">
              {loading ? 'Signing In...' : 'Sign In'}
            </span>
          </button>

        </form>

        {/* Redirect Link */}
        <div className="mt-8 text-center text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
            Sign up
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Login;

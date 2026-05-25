import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  User, 
  Users, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

function Signup() {
  const navigate = useNavigate();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('member'); // default to member
  
  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Errors & loading states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Validate form fields
  const validateForm = () => {
    const tempErrors = {};
    
    if (!name.trim()) {
      tempErrors.name = 'Full name is required';
    }
    
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
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
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong during signup');
      }
      
      // Save tokens
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Success toast
      setToastMessage('Account created successfully! Syncing...');
      setShowToast(true);
      
      // Delay redirect to allow toast animation
      setTimeout(() => {
        if (data.user.role === 'manager') {
          navigate('/manager-dashboard');
        } else {
          navigate('/member-dashboard');
        }
      }, 1800);
      
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
        <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 border border-white/20 text-white font-bold px-6 py-3.5 rounded-2xl shadow-2xl shadow-purple-500/25">
            <CheckCircle2 className="w-5 h-5 animate-pulse text-white" />
            <span className="text-sm">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Card Wrapper */}
      <div className="w-full max-w-xl glass-panel rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 bg-[#131b2e]/40 border border-white/10">
        
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
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Create your account</h2>
          <p className="text-sm text-slate-400 mt-1">Start syncing your team in minutes</p>
        </div>

        {/* Global Error Banner */}
        {apiError && (
          <div className="mb-6 flex items-start space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Piyush Patil"
                className={`w-full bg-slate-900/50 hover:bg-slate-900/80 border ${
                  errors.name ? 'border-rose-500/80' : 'border-slate-800'
                } focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200`}
              />
            </div>
            {errors.name && <p className="text-xs text-rose-500 font-medium mt-1.5 ml-1">{errors.name}</p>}
          </div>

          {/* Email */}
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

          {/* Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-slate-900/50 hover:bg-slate-900/80 border ${
                    errors.confirmPassword ? 'border-rose-500/80' : 'border-slate-800'
                  } focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/10 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 ml-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Workplace Role</label>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Card 1: Manager */}
              <div
                onClick={() => setRole('manager')}
                className={`cursor-pointer rounded-2xl p-4 border flex flex-col items-center text-center transition-all duration-300 ${
                  role === 'manager'
                    ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-purple-500 shadow-xl shadow-purple-500/15'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/60 hover:bg-slate-900/70'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  role === 'manager' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">I'm a Manager</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">I oversee my team</p>
              </div>

              {/* Card 2: Member */}
              <div
                onClick={() => setRole('member')}
                className={`cursor-pointer rounded-2xl p-4 border flex flex-col items-center text-center transition-all duration-300 ${
                  role === 'member'
                    ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500 shadow-xl shadow-blue-500/15'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/60 hover:bg-slate-900/70'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  role === 'member' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">I'm a Member</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">I submit daily updates</p>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden rounded-xl py-3.5 mt-2 font-bold text-white transition-all duration-300 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"></span>
            <span className="relative flex items-center justify-center gap-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </span>
          </button>
        </form>

        {/* Redirect Link */}
        <div className="mt-8 text-center text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
            Login
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Signup;

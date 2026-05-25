import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Activity, 
  LogOut, 
  User, 
  Mail, 
  Calendar, 
  Flame, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Loader2,
  Lock
} from 'lucide-react';
import { API_BASE_URL } from '../config';

function Profile() {
  const navigate = useNavigate();

  // State
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [stats, setStats] = useState({ totalUpdates: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // 1. Fetch latest profile
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();

        if (profileRes.ok && profileData.success) {
          setUser(profileData.user);
          setName(profileData.user.name);
          setReminderTime(profileData.user.reminderTime || '09:00');

          // 2. Fetch updates count and streak if member
          if (profileData.user.role === 'member') {
            const updatesRes = await fetch(`${API_BASE_URL}/api/updates/my`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const updatesData = await updatesRes.json();
            if (updatesRes.ok && updatesData.success) {
              setStats({
                totalUpdates: updatesData.data.updates.length,
                streak: updatesData.data.stats.currentStreak
              });
            }
          }
        } else {
          // Token expired or invalid, log out
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } catch (err) {
        console.error('Error fetching profile details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          reminderTime: user.role === 'member' ? reminderTime : undefined
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToastMsg('Profile updated successfully! ✅');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setToastMsg(data.message || 'Failed to update profile');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setToastMsg('Error saving changes');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getReadableDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center relative p-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px]"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            FlowSync
          </h2>
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading profile settings...</p>
        </div>
      </div>
    );
  }

  const dashboardUrl = user?.role === 'manager' ? '/manager-dashboard' : '/member-dashboard';

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Background Soft Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-600/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[100px]"></div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 border border-white/20 text-white font-bold px-6 py-3.5 rounded-2xl shadow-2xl">
            <span className="text-sm">{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="relative z-20 bg-[#0f172a]/70 backdrop-blur-md border-b border-slate-800/60 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to={dashboardUrl} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FlowSync
            </span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <Link 
              to={dashboardUrl} 
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.8 bg-slate-800/60 border border-slate-700/50 rounded-lg transition-all"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.8 bg-slate-800/60 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/35 text-xs font-bold rounded-lg text-slate-300 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Settings Card */}
      <main className="flex-1 relative z-10 max-w-2xl w-full mx-auto px-6 py-12">
        <div className="flex items-center space-x-2 mb-6">
          <Link to={dashboardUrl} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Profile Settings</h1>
        </div>

        <div className="glass-panel rounded-3xl bg-[#131b2e]/30 border border-white/5 shadow-2xl p-6 md:p-8 space-y-8">
          {/* Header Info Block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 pb-6 border-b border-slate-800/60">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-purple-500/30 flex items-center justify-center text-3xl font-bold text-purple-400">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
              <p className="text-slate-405 text-sm">{user?.email}</p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  user?.role === 'manager' 
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/25' 
                    : 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                }`}>
                  {user?.role}
                </span>
                <span className="text-[10px] font-bold bg-slate-850 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full">
                  Member since {getReadableDate(user?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Metrics (Members Only) */}
          {user?.role === 'member' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel rounded-2xl p-4 bg-[#0a0f1d]/40 border border-slate-850/60 flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Updates</p>
                  <p className="text-lg font-extrabold text-white mt-0.5">{stats.totalUpdates}</p>
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-4 bg-[#0a0f1d]/40 border border-slate-850/60 flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Streak</p>
                  <p className="text-lg font-extrabold text-white mt-0.5">{stats.streak} days</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 pl-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0f1d]/60 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 pl-1">
                Email Address (Not Editable)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email}
                  className="w-full bg-[#0a0f1d]/30 border border-slate-850/40 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Reminder Time preference (Members only) */}
            {user?.role === 'member' && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 pl-1">
                  Daily Reminder Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    type="time"
                    required
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-[#0a0f1d]/60 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-105 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all shadow-inner"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 pl-1">
                  💡 We'll remind you to submit your update daily at your configured time.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  LogOut, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Flame, 
  Calendar, 
  BarChart, 
  Sparkles, 
  Clock, 
  Heart, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  X,
  Bell,
  ArrowUp,
  Menu
} from 'lucide-react';
import { API_BASE_URL } from '../config';

function MemberDashboard() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  // User session state
  const [user, setUser] = useState({ name: 'Member' });
  
  // Team states
  const [teamDetails, setTeamDetails] = useState(null);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joiningTeam, setJoiningTeam] = useState(false);

  // Dashboard data states
  const [updates, setUpdates] = useState([]);
  const [stats, setStats] = useState({
    currentStreak: 0,
    thisWeekCount: 0,
    moodScore: 'Neutral',
    history7Days: []
  });
  
  // Manager direct feedback messages
  const [messages, setMessages] = useState([]);

  // UI States
  const [updateText, setUpdateText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [expandedUpdateId, setExpandedUpdateId] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  
  // Custom navigation & layout states
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Load User and data on start
  useEffect(() => {
    const fetchProfileAndData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Fetch current profile with latest teamId
          const profileRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const profileData = await profileRes.json();
          if (profileRes.ok && profileData.success) {
            setUser(profileData.user);
            localStorage.setItem('user', JSON.stringify(profileData.user));
            
            if (profileData.user.teamId) {
              // Fetch team details
              const teamRes = await fetch(`${API_BASE_URL}/api/teams/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const teamData = await teamRes.json();
              if (teamRes.ok && teamData.success) {
                setTeamDetails(teamData.data);
              }
              
              // Load updates and stats
              await fetchUserData();
            } else {
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading member profile:', error);
        setLoading(false);
      }
    };

    fetchProfileAndData();
  }, []);

  // Scroll to top button visibility check
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user updates
      const response = await fetch(`${API_BASE_URL}/api/updates/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setUpdates(data.data.updates || []);
        setStats(data.data.stats || {
          currentStreak: 0,
          thisWeekCount: 0,
          moodScore: 'Neutral',
          history7Days: []
        });
      }

      // Fetch direct feedback messages
      const msgResponse = await fetch(`${API_BASE_URL}/api/updates/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const msgData = await msgResponse.json();
      
      if (msgResponse.ok) {
        setMessages(msgData.data || []);
      }
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      // Small artificial delay to show off beautiful skeletons
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 6) {
      setInviteCodeInput(val);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim() || inviteCodeInput.length !== 6) return;
    
    setJoiningTeam(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode: inviteCodeInput.toUpperCase() })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setToastMsg(data.message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        
        // Update user state and local storage
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileRes.ok && profileData.success) {
          setUser(profileData.user);
          localStorage.setItem('user', JSON.stringify(profileData.user));
        }
        
        // Fetch team details
        const teamRes = await fetch(`${API_BASE_URL}/api/teams/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const teamData = await teamRes.json();
        if (teamRes.ok && teamData.success) {
          setTeamDetails(teamData.data);
        }
        
        // Fetch user data
        await fetchUserData();
      } else {
        setToastMsg(data.message || 'Failed to join team');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setToastMsg('Error connecting to backend services');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setJoiningTeam(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    // Stop mic if recording
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get Dynamic Greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Formatted Subheading Date (e.g. Sunday, 25 May 2026)
  const getFormattedDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Chip click handler
  const handleChipClick = (prefix) => {
    setUpdateText(prev => {
      const spacing = prev.trim() ? '\n' : '';
      return `${prev}${spacing}${prefix} `;
    });
  };

  // Web Speech API Microphone Handler
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Try using Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          const spokenText = event.results[event.results.length - 1][0].transcript;
          setUpdateText(prev => {
            const spacing = prev.trim() ? ' ' : '';
            return `${prev}${spacing}${spokenText}`;
          });
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Speech initiation failed', err);
        setIsListening(false);
      }
    }
  };

  // Submit Update
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!updateText.trim()) return;

    // Stop mic if recording
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setSubmitting(true);
    setAiInsight(null); // Clear previous insight
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ updateText })
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateText('');
        
        // Capture AI Insight fields
        setAiInsight({
          sentiment: data.data.sentiment,
          summary: data.data.summary,
          hasBlocker: data.data.hasBlocker,
          blockerText: data.data.blockerText,
          encouragement: data.encouragement
        });

        setToastMsg('Update analyzed successfully! ✨');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        // Refresh updates list & stats
        fetchUserData();
      } else {
        alert(data.message || 'Failed to submit update');
      }
    } catch (err) {
      console.error('Submit error', err);
      alert('Error connecting to backend services');
    } finally {
      setSubmitting(false);
    }
  };

  // Label Past Dates
  const formatDateLabel = (dateStr) => {
    const updateDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const targetDate = new Date(updateDate);
    targetDate.setHours(0,0,0,0);
    
    if (targetDate.getTime() === today.getTime()) return 'Today';
    if (targetDate.getTime() === yesterday.getTime()) return 'Yesterday';
    
    return updateDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  // Toggle update expansion
  const toggleExpandUpdate = (id) => {
    setExpandedUpdateId(prevId => prevId === id ? null : id);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if today has a blocker reported
  const todayHasBlocker = updates.length > 0 && 
    new Date(updates[0].date).toDateString() === new Date().toDateString() &&
    updates[0].hasBlocker;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Background Soft Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[110px] animate-blob"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-600/5 blur-[130px] animate-blob animation-delay-2000"></div>
      </div>

      {/* Full-screen Loading Overlay for AI Analysis */}
      {submitting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-sm">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-purple-500/20 blur-xl animate-pulse"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">🤖 AI is analyzing your update...</h3>
            <p className="text-xs text-slate-550 leading-relaxed">
              Evaluating blockers, mapping team sentiments, and compiling status summaries. Please wait.
            </p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 border border-white/20 text-white font-bold px-6 py-3.5 rounded-2xl shadow-2xl shadow-purple-500/20">
            <CheckCircle2 className="w-5 h-5 animate-pulse text-white" />
            <span className="text-sm">{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="relative z-20 bg-[#0f172a]/70 backdrop-blur-md border-b border-slate-800/60 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FlowSync
            </span>
          </div>

          {/* Centered Dynamic Greeting */}
          <div className="hidden md:flex items-center space-x-1 text-sm font-semibold text-slate-200 bg-slate-900/40 border border-slate-800 px-4 py-2 rounded-full">
            <span>{getGreeting()},</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user.name}</span>
            <span>👋</span>
          </div>

          {/* Right Section User Circle, Notification & Logout */}
          <div className="flex items-center space-x-3">
            
            {/* Blocker Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setBellDropdownOpen(!bellDropdownOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/45 transition-colors relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {todayHasBlocker && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/40"></span>
                )}
              </button>

              {/* Notification Bell Dropdown */}
              <AnimatePresence>
                {bellDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-850 rounded-2xl p-4 shadow-2xl z-50"
                  >
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notifications</span>
                      {todayHasBlocker && <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">1 Alert</span>}
                    </div>
                    <div className="space-y-3">
                      {todayHasBlocker ? (
                        <div className="flex items-start space-x-2.5 p-2 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs">
                          <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-rose-200">Active Blocker Flagged</p>
                            <p className="text-slate-400 mt-1 leading-normal line-clamp-3">{updates[0].blockerText}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-555 text-xs">
                          🎉 No active blockers reported today.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Team Name Badge in Navbar */}
            {teamDetails && (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-full mr-2 shadow-inner">
                <span>{teamDetails.name}</span>
              </div>
            )}

            {/* Desktop Logout & Avatar */}
            <div className="hidden sm:flex items-center space-x-2 border-l border-slate-800 pl-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-300">{user.name}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.8 bg-slate-800/60 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/35 text-xs font-bold rounded-lg text-slate-300 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800 bg-slate-900/40 md:hidden cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-slate-850 bg-[#0f172a] px-6 py-4 space-y-4 z-10 relative overflow-hidden"
          >
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200 bg-slate-900/40 border border-slate-800 px-4 py-2.5 rounded-xl">
              <span>{getGreeting()},</span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user.name}</span>
              <span>👋</span>
            </div>

            {teamDetails && (
              <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <span className="text-xs text-slate-400 font-semibold">Joined Team</span>
                <span className="text-blue-400 text-xs font-bold bg-blue-500/10 px-2.5 py-1 rounded-lg">
                  {teamDetails.name}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-305">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-850 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-800 text-xs font-bold rounded-lg text-slate-350 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Area */}
      {loading ? (
        /* Loading Skeleton Screen */
        <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-6 space-y-8">
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/10 border border-slate-850/60 h-80 space-y-6 animate-pulse">
              <div className="h-6 bg-slate-805/80 rounded-lg w-1/3"></div>
              <div className="h-4 bg-slate-805/50 rounded-lg w-1/4"></div>
              <div className="h-32 bg-slate-900/60 rounded-2xl border border-slate-850/40"></div>
              <div className="h-10 bg-slate-805/60 rounded-xl w-full"></div>
            </div>
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/10 border border-slate-850/60 h-80 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-805/80 rounded-lg w-1/4"></div>
              <div className="space-y-3">
                <div className="h-16 bg-slate-900/60 rounded-2xl"></div>
                <div className="h-16 bg-slate-900/60 rounded-2xl"></div>
              </div>
            </div>
          </div>
          {/* Right Column Skeleton */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/10 border border-slate-850/60 h-64 space-y-4 animate-pulse">
              <div className="h-5 bg-slate-805/80 rounded w-1/2"></div>
              <div className="h-16 bg-slate-805/60 rounded-2xl"></div>
              <div className="h-20 bg-slate-805/60 rounded-2xl"></div>
            </div>
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/10 border border-slate-850/60 h-80 space-y-4 animate-pulse">
              <div className="h-5 bg-slate-805/80 rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-12 bg-slate-805/60 rounded-xl"></div>
                <div className="h-12 bg-slate-805/60 rounded-xl"></div>
              </div>
            </div>
          </div>
        </main>
      ) : !teamDetails ? (
        /* Onboarding Screen */
        <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-6 py-12 md:py-24 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#131b2e]/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-8 text-center relative overflow-hidden"
          >
            <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-purple-600/10 blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-blue-600/10 blur-2xl"></div>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 shadow-lg shadow-purple-500/10 animate-bounce">
              <Activity className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-2">Join Your Team</h2>
            <p className="text-slate-400 text-xs mb-8">Enter the 6-digit invite code provided by your team manager to link your dashboard.</p>

            <form onSubmit={handleJoinTeam} className="space-y-5 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 pl-1">
                  Invite Code
                </label>
                <input
                  type="text"
                  required
                  value={inviteCodeInput}
                  onChange={handleCodeChange}
                  placeholder="e.g. FL4829"
                  className="w-full bg-[#0a0f1d]/60 border border-slate-800/80 rounded-xl px-4 py-3 text-center text-2xl font-extrabold font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all shadow-inner uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={joiningTeam || inviteCodeInput.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{joiningTeam ? 'Joining Team...' : 'Join Team'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </main>
      ) : (
        <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Left Column (60% Width) */}
          <div className="lg:col-span-6 space-y-8">

            {/* AI Insight Card (Animated Bottom Slide-in) */}
            <AnimatePresence>
              {aiInsight && (
                <motion.div 
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 60 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                  className="glass-panel rounded-3xl p-6 md:p-8 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-purple-500/30 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={() => setAiInsight(null)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-purple-400 mb-3 animate-pulse">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Update Insight</span>
                  </div>

                  <blockquote className="text-lg md:text-xl font-extrabold text-white leading-relaxed mb-4">
                    "{aiInsight.encouragement}"
                  </blockquote>

                  <div className="space-y-3.5 pl-1 border-l-2 border-purple-500/35">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="text-slate-505 font-bold uppercase text-[9px] mr-1.5">AI Summary:</span>
                      {aiInsight.summary}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-550 font-bold uppercase text-[9px]">Sentiment:</span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        aiInsight.sentiment === 'positive'
                          ? 'bg-green-500/15 text-green-400 border-green-500/25 shadow-sm shadow-green-500/10'
                          : aiInsight.sentiment === 'negative'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/25 shadow-sm shadow-rose-500/10'
                          : 'bg-yellow-500/15 text-yellow-405 border-yellow-500/25 shadow-sm shadow-yellow-500/10'
                      }`}>
                        {aiInsight.sentiment}
                      </span>
                    </div>

                    {/* Warning Card in Orange for Blockers */}
                    {aiInsight.hasBlocker && (
                      <div className="flex items-start space-x-2.5 text-amber-405 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mt-3 text-xs shadow-lg shadow-amber-500/5">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-450" />
                        <div>
                          <span className="font-extrabold text-amber-300">Warning: Blocker Flagged!</span>
                          <p className="text-slate-400 mt-1 leading-relaxed">{aiInsight.blockerText || 'Your manager has been notified of a pending blocker.'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Your manager has been updated.</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                      Powered by Groq AI ⚡
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Card 1: Today's Update Box */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/30 border border-white/5 shadow-xl relative">
              <div className="absolute top-[-1px] left-8 w-24 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500"></div>
              
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-white tracking-tight">What's your update today?</h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">{getFormattedDate()}</p>
              </div>

              <form onSubmit={handleSubmitUpdate} className="space-y-4">
                
                {/* Textarea container */}
                <div className="relative group">
                  <textarea
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    placeholder="Share what you worked on, what's next, and any blockers you're facing..."
                    className="w-full h-44 bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/10 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-500 outline-none resize-none transition-all duration-200 leading-relaxed"
                  />
                  
                  {/* Floating listening status */}
                  {isListening && (
                    <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-full text-[10px] font-bold text-rose-450 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      <span>Listening...</span>
                    </div>
                  )}
                </div>

                {/* Input Chips row */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Add:</span>
                  {[
                    { label: '✅ Completed a task', prefix: '✅ Completed a task:' },
                    { label: '🚧 Facing a blocker', prefix: '🚧 Facing a blocker:' },
                    { label: '📋 Planning for tomorrow', prefix: '📋 Planning for tomorrow:' }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChipClick(chip.prefix)}
                      className="text-xs px-3 py-1.5 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-full transition-all cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Buttons Row */}
                <div className="flex items-center space-x-3 pt-2">
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !updateText.trim()}
                    className="flex-1 relative group overflow-hidden rounded-xl py-3.5 font-bold text-white transition-all duration-300 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"></span>
                    <span className="relative flex items-center justify-center gap-2 text-sm">
                      {submitting ? 'Analyzing Update...' : 'Submit Update'}
                    </span>
                  </button>

                  {/* Mic Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center ${
                      isListening
                        ? 'bg-rose-600/20 text-rose-455 border-rose-505 animate-pulse shadow-lg shadow-rose-500/20'
                        : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                </div>

              </form>

            </div>

            {/* Card 2: Your Past Updates */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/30 border border-white/5 shadow-xl relative">
              <h2 className="text-lg font-extrabold text-white tracking-tight mb-6 font-sans">Your Update History</h2>
              
              {updates.length === 0 ? (
                /* Empty State */
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900/50 border border-slate-800/50 flex items-center justify-center text-slate-650 mb-4">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-300">No updates yet</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Submit your first daily 60-second update above to start tracking performance streaks and stats.
                  </p>
                </div>
              ) : (
                /* Updates List */
                <div className="space-y-4">
                  {updates.map((item) => {
                    const isExpanded = expandedUpdateId === item._id;
                    const textSnippet = item.updateText.length > 100 
                      ? `${item.updateText.substring(0, 100)}...`
                      : item.updateText;
                    
                    // Sentiment mapping styles
                    const sentimentBadge = {
                      positive: 'bg-green-500/10 text-green-455 border-green-500/25',
                      negative: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
                      neutral: 'bg-yellow-500/10 text-yellow-455 border-yellow-500/25'
                    }[item.sentiment] || 'bg-slate-500/10 text-slate-400 border-slate-700';

                    return (
                      <div 
                        key={item._id}
                        className="group border border-slate-850 bg-slate-950/20 hover:bg-slate-900/30 hover:border-slate-800/60 rounded-2xl p-4 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpandUpdate(item._id)}>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm">📋</span>
                            <span className="text-sm font-bold text-slate-200">{formatDateLabel(item.date)}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${sentimentBadge}`}>
                              {item.sentiment || 'neutral'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="mt-3 pl-7">
                          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                            {isExpanded ? item.updateText : textSnippet}
                          </p>
                          
                          {/* AI Summary Section */}
                          {item.summary && (
                            <div className="mt-2.5 pt-2 border-t border-slate-900/40 text-[11px] text-slate-400 italic flex items-center gap-1.5">
                              <span className="text-purple-400 not-italic font-bold">✨ AI Summary:</span>
                              <span>{item.summary}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

          {/* Right Column (40% Width) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Card 3: Your Streak */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/30 border border-white/5 shadow-xl relative">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Update Streak</h2>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/5">
                  <Flame className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-white tracking-tight">{stats.currentStreak}</span>
                    <span className="text-sm font-bold text-slate-400">days</span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase">Current Update Streak</p>
                </div>
              </div>

              {/* 7-Day Mini Calendar */}
              <div className="border-t border-slate-900/60 pt-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Activity - Last 7 Days</p>
                
                <div className="flex justify-between items-center bg-slate-950/40 border border-slate-900/80 rounded-2xl p-4">
                  {(stats.history7Days || []).map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-2">
                      <span className="text-[10px] font-bold text-slate-500">{day.dayName || day.day}</span>
                      
                      {day.submitted ? (
                        /* Filled check icon */
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        /* Empty circle */
                        <div className="w-7 h-7 rounded-full border border-dashed border-slate-800 bg-slate-950/50 flex items-center justify-center text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Card 4: Quick Stats */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/30 border border-white/5 shadow-xl relative">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Quick Stats</h2>
              
              <div className="space-y-4">
                
                {/* Stat 1: Weekly Total */}
                <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-405">Total Updates</h4>
                      <p className="text-[10px] text-slate-600 font-semibold mt-0.5">Submitted this week</p>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-white">{stats.thisWeekCount}</span>
                </div>

                {/* Stat 2: Current Streak (Mini copy) */}
                <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-405">Active Streak</h4>
                      <p className="text-[10px] text-slate-600 font-semibold mt-0.5">Consecutive updates</p>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-white">{stats.currentStreak} d</span>
                </div>

                {/* Stat 3: Morale Score */}
                <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-405">Team Morale</h4>
                      <p className="text-[10px] text-slate-655 font-semibold mt-0.5">Calculated sentiment</p>
                    </div>
                  </div>
                  
                  {/* Styled Mood pill */}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    stats.moodScore === 'Good' 
                      ? 'bg-green-500/10 text-green-455 border-green-500/25'
                      : stats.moodScore === 'Needs Attention'
                      ? 'bg-rose-500/10 text-rose-455 border-rose-500/25'
                      : 'bg-yellow-500/10 text-yellow-455 border-yellow-500/25'
                  }`}>
                    {stats.moodScore}
                  </span>
                </div>

              </div>

            </div>

            {/* Card 5: My Trend Section (Mood History) */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/30 border border-white/5 shadow-xl relative">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">My Trend</h2>
              
              {updates.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium">Submit updates to see your weekly trend analysis.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950/30 border border-slate-900 p-3 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-405">Your mood this week</span>
                    <div className="flex items-center space-x-1.5 bg-slate-950/50 px-2.5 py-1.5 rounded-xl border border-slate-850/50">
                      {updates.slice(0, 3).reverse().map((up, idx) => {
                        const colorClass = up.sentiment === 'positive' 
                          ? 'bg-green-500 shadow-green-500/30' 
                          : up.sentiment === 'negative' 
                          ? 'bg-rose-500 shadow-rose-500/30' 
                          : 'bg-yellow-500 shadow-yellow-500/30';
                        return (
                          <React.Fragment key={up._id}>
                            {idx > 0 && <span className="text-[10px] text-slate-600 font-bold">→</span>}
                            <span className={`w-3 h-3 rounded-full ${colorClass} shadow-md`}></span>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Mood text evaluation */}
                  <div className="bg-slate-950/40 border border-slate-850/60 rounded-2xl p-4 flex items-center space-x-3.5">
                    <div className="text-3xl shrink-0">
                      {updates.slice(0, 3).some(u => u.sentiment === 'negative') ? '💪' : '✨'}
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-slate-300">
                      {updates.slice(0, 3).some(u => u.sentiment === 'negative') 
                        ? "Looks like a tough week, hang in there! Reach out if you need support." 
                        : "You're doing great! Keep up the excellent momentum!"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Card 6: Manager Feedback Messages */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/30 border border-white/5 shadow-xl relative">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Manager Notes</h2>
              
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium">No feedback notes from your manager yet.</p>
                ) : (
                  messages.map(msg => (
                    <div 
                      key={msg._id}
                      className="bg-slate-950/30 border border-slate-900/60 p-4 rounded-2xl space-y-2.5 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Feedback
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold">
                          {new Date(msg.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {msg.messageText}
                      </p>
                      <p className="text-[9px] text-slate-500 font-semibold text-right">
                        — From {msg.senderId ? msg.senderId.name : 'Manager'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </main>
      )}

      {/* Smooth Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-gradient-to-tr from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

    </div>
  );
}

export default MemberDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  LogOut, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Heart, 
  ChevronDown, 
  ChevronUp, 
  X,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  User,
  Clock,
  Bell,
  ArrowUp,
  Menu,
  Award,
  ArrowRight,
  Search,
  StickyNote,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { API_BASE_URL } from '../config';

function ManagerDashboard() {
  const navigate = useNavigate();
  
  // Session details
  const [manager, setManager] = useState({ name: 'Manager' });
  
  // Team details and onboarding states
  const [teamDetails, setTeamDetails] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState('create'); // 'create', 'success'
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Dashboard lists and stats
  const [team, setTeam] = useState([]);
  const [weeklyCounts, setWeeklyCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Resolved blocker IDs (local UI-only state)
  const [resolvedBlockerIds, setResolvedBlockerIds] = useState(new Set());
  
  // AI Summary states
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  
  // Expand states for team card list items
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'submitted', 'pending', 'blocker'
  
  // Modal States
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  
  // Private Notes state
  const [managerNoteText, setManagerNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  
  // Custom navigation & layout states
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Messaging state
  const [feedbackText, setFeedbackText] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Load profile and data
  useEffect(() => {
    const fetchProfileAndData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Fetch current profile with latest teamId
          const profileRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (profileRes.status === 401) {
            handleLogout();
            return;
          }

          const profileData = await profileRes.json();
          if (profileRes.ok && profileData.success) {
            setManager(profileData.user);
            localStorage.setItem('user', JSON.stringify(profileData.user));
          } else {
            handleLogout();
            return;
          }
        } else {
          handleLogout();
          return;
        }
      } catch (err) {
        console.error('Error fetching manager profile:', err);
        handleLogout();
        return;
      }
      
      fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleLogout();
        return;
      }
      
      // 1. Fetch team details
      const detailsRes = await fetch(`${API_BASE_URL}/api/teams/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (detailsRes.status === 401) {
        handleLogout();
        return;
      }

      const detailsData = await detailsRes.json();

      if (detailsRes.ok && detailsData.success && detailsData.data) {
        setTeamDetails(detailsData.data);
        
        // 2. Fetch Team members
        const teamRes = await fetch(`${API_BASE_URL}/api/manager/team`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (teamRes.status === 401) {
          handleLogout();
          return;
        }

        const teamData = await teamRes.json();

        // 3. Fetch weekly counts
        const weeklyRes = await fetch(`${API_BASE_URL}/api/manager/updates/weekly`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (weeklyRes.status === 401) {
          handleLogout();
          return;
        }

        const weeklyData = await weeklyRes.json();

        if (teamRes.ok && weeklyRes.ok) {
          setTeam(teamData.data || []);
          setWeeklyCounts(weeklyData.data || []);
        }
      } else {
        setTeamDetails(null);
      }
    } catch (error) {
      console.error('Error loading manager dashboard:', error);
    } finally {
      // Short delay to show off beautiful skeleton loadings
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    setCreatingTeam(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/teams/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teamName: newTeamName })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTeamDetails(data.data);
        setOnboardingStep('success');
        
        // Update local state and storage
        const updatedManager = { ...manager, teamId: data.data._id };
        setManager(updatedManager);
        localStorage.setItem('user', JSON.stringify(updatedManager));
        
        // Fetch dashboard data
        fetchDashboardData();
      } else {
        setToastMsg(data.message || 'Failed to create team');
        setShowToast(true);
      }
    } catch (err) {
      console.error(err);
      setToastMsg('Error connecting to backend services');
      setShowToast(true);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Generate today's AI Summary
  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setAiSummary(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/manager/ai-summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAiSummary(data.data);
      } else {
        alert(data.message || 'Failed to generate AI summary');
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      alert('Error connecting to backend services');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Fetch Member Modal Data
  const openMemberModal = async (memberId) => {
    setSelectedMemberId(memberId);
    setLoadingModal(true);
    setModalData(null);
    setFeedbackText('');
    setManagerNoteText('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/manager/member/${memberId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setModalData(data.data);
        setManagerNoteText(data.data.member.managerNote || '');
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeMemberModal = () => {
    setSelectedMemberId(null);
    setModalData(null);
    setFeedbackText('');
    setManagerNoteText('');
  };

  // Save private manager note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSavingNote(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/manager/member/${selectedMemberId}/note`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note: managerNoteText })
      });
      const data = await response.json();
      if (response.ok) {
        setToastMsg('Private note saved successfully! 📝');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        
        // Update local modal data
        setModalData(prev => ({
          ...prev,
          member: {
            ...prev.member,
            managerNote: managerNoteText
          }
        }));
        
        // Refresh team list to show note indicator
        fetchDashboardData();
      } else {
        alert(data.message || 'Failed to save private note');
      }
    } catch (error) {
      console.error('Error saving private note:', error);
      alert('Error connecting to backend note services');
    } finally {
      setSavingNote(false);
    }
  };

  // Send feedback message helper
  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setSendingFeedback(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/manager/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedMemberId,
          messageText: feedbackText.trim()
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setFeedbackText('');
        setToastMsg(`Feedback message sent to ${modalData.member.name}! 💬`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(data.message || 'Failed to send feedback message');
      }
    } catch (error) {
      console.error('Error sending feedback message:', error);
      alert('Error connecting to backend messaging services');
    } finally {
      setSendingFeedback(false);
    }
  };

  // Send reminder helper
  const handleSendReminder = (memberName) => {
    setToastMsg(`Reminder sent to ${memberName}! 🔔`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Time-ago formatting helper
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `Submitted ${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `Submitted ${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `Submitted ${diffDays}d ago`;
  };

  // Formatted date label
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center relative p-6 overflow-hidden">
        {/* Background Soft Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px]"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center space-y-6 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            FlowSync
          </h2>
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Synchronizing your manager dashboard...</p>
        </div>
      </div>
    );
  }

  // --- Calculations for Top Stats Row ---
  const totalMembers = team.length;
  const submittedTodayCount = team.filter(m => m.todayUpdate).length;
  const pendingTodayCount = totalMembers - submittedTodayCount;

  // Sentiment calculation for mood score
  const getTeamMood = () => {
    if (submittedTodayCount === 0) return 'Mixed 🟡';
    
    let pos = 0;
    let neg = 0;
    team.forEach(m => {
      if (m.todayUpdate) {
        if (m.todayUpdate.sentiment === 'positive') pos++;
        if (m.todayUpdate.sentiment === 'negative') neg++;
      }
    });

    if (neg > 0 && neg >= pos) return 'Needs Attention 🔴';
    if (neg > 0 && pos > neg) return 'Mixed 🟡';
    return 'Healthy 🟢';
  };

  // --- Blocker Filter ---
  const activeBlockers = team.filter(m => {
    if (!m.todayUpdate) return false;
    if (resolvedBlockerIds.has(m.todayUpdate.id)) return false;
    return m.todayUpdate.hasBlocker;
  });

  const handleResolveBlocker = (updateId) => {
    setResolvedBlockerIds(prev => {
      const next = new Set(prev);
      next.add(updateId);
      return next;
    });
    setToastMsg('Blocker marked as resolved! ✅');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Filter team members based on search term & filter selection
  const filteredTeam = team.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasUpdate = !!member.todayUpdate;
    let matchesFilter = true;
    if (filterType === 'submitted') {
      matchesFilter = hasUpdate;
    } else if (filterType === 'pending') {
      matchesFilter = !hasUpdate;
    } else if (filterType === 'blocker') {
      matchesFilter = hasUpdate && member.todayUpdate.hasBlocker && !resolvedBlockerIds.has(member.todayUpdate.id);
    }
    
    return matchesSearch && matchesFilter;
  });

  // Sort team list: pending (no update today) shown FIRST
  const sortedTeam = [...filteredTeam].sort((a, b) => {
    const aHasUpdate = !!a.todayUpdate;
    const bHasUpdate = !!b.todayUpdate;
    if (!aHasUpdate && bHasUpdate) return -1;
    if (aHasUpdate && !bHasUpdate) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col relative overflow-x-hidden">
      
      {/* Background Soft Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-600/5 blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

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

          {/* Center Page Title */}
          <h1 className="text-sm font-bold text-slate-200 bg-slate-900/40 border border-slate-800 px-4 py-2 rounded-full hidden xs:block">
            Team Overview
          </h1>

          {/* Right Section User Circle, Notification Bell & Logout */}
          <div className="flex items-center space-x-3">
            
            {/* Team Invite Code Chip in Navbar */}
            {teamDetails && (
              <button
                onClick={() => handleCopyCode(teamDetails.inviteCode)}
                className="hidden xs:flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/25 text-purple-400 hover:text-purple-300 text-xs font-bold rounded-full transition-all cursor-pointer shadow-inner mr-2"
              >
                <span>Team Code: {teamDetails.inviteCode}</span>
                <span className="text-[10px] opacity-70 ml-1">
                  {copiedCode ? 'Copied! ✅' : '📋'}
                </span>
              </button>
            )}
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setBellDropdownOpen(!bellDropdownOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/45 transition-colors relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {activeBlockers.length > 0 && (
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
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blocker Alerts</span>
                      {activeBlockers.length > 0 && <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">{activeBlockers.length} Active</span>}
                    </div>
                    <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                      {activeBlockers.length > 0 ? (
                        activeBlockers.map(m => (
                          <div key={m.id} className="flex items-start space-x-2.5 p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs">
                            <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-rose-200">{m.name}</p>
                              <p className="text-slate-405 mt-1 leading-relaxed line-clamp-3">{m.todayUpdate.blockerText}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-550 text-xs">
                          🎉 No active team blockers today.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Profile Link */}
            <Link 
              to="/profile" 
              className="hidden sm:flex items-center space-x-2 border-l border-slate-800 pl-3 hover:text-white transition-all group"
            >
              <span className="text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Manager
              </span>
              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 group-hover:border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-405 group-hover:text-purple-400 transition-colors">
                {manager.name ? manager.name.split(' ').map(n => n[0]).join('') : 'M'}
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{manager.name}</span>
            </Link>

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
              <span>Team Overview</span>
            </div>
            
            {teamDetails && (
              <div className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                <span className="text-xs text-slate-405 font-semibold">Team Code</span>
                <button
                  onClick={() => handleCopyCode(teamDetails.inviteCode)}
                  className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/15 text-purple-400 border border-purple-500/20 text-xs font-bold rounded-lg transition-all"
                >
                  {teamDetails.inviteCode} {copiedCode ? 'Copied! ✅' : '📋'}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Link to="/profile" className="flex items-center space-x-2 text-slate-305 hover:text-white">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400">
                  {manager.name ? manager.name.split(' ').map(n => n[0]).join('') : 'M'}
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold">{manager.name}</span>
                  <span className="block text-[9px] text-slate-550 font-bold uppercase tracking-wider">Settings</span>
                </div>
              </Link>
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

      {loading ? (
        /* Loading Skeleton Screens */
        <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-6 py-8 md:py-12 space-y-8 animate-pulse">
          {/* Top Stats Row Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="glass-panel rounded-2xl p-5 bg-[#131b2e]/10 border border-slate-850/60 h-24 space-y-3">
                <div className="h-4 bg-slate-805/80 rounded w-1/2"></div>
                <div className="h-6 bg-slate-805 rounded w-1/4"></div>
              </div>
            ))}
          </div>

          {/* AI Team Summary Panel Skeleton */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 bg-[#131b2e]/10 border border-purple-500/10 h-64 space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-slate-800 rounded w-1/3"></div>
              <div className="h-10 bg-slate-805 rounded-xl w-32"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-805 rounded w-full"></div>
              <div className="h-4 bg-slate-805 rounded w-5/6"></div>
            </div>
          </div>

          {/* Middle Layout Block Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
            <div className="lg:col-span-6 space-y-4">
              {[1, 2, 3].map(idx => (
                <div key={idx} className="glass-panel rounded-2xl p-5 bg-[#131b2e]/10 border border-slate-850/60 h-32 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-slate-800 rounded-full w-8"></div>
                    <div className="h-5 bg-slate-800 rounded w-1/4"></div>
                    <div className="h-5 bg-slate-805 rounded-lg w-16"></div>
                  </div>
                  <div className="h-4 bg-slate-800/50 rounded w-2/3"></div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4 space-y-8">
              <div className="glass-panel rounded-3xl p-6 bg-[#131b2e]/10 border border-slate-850/60 h-48 space-y-4">
                <div className="h-5 bg-slate-805 rounded w-1/2"></div>
                <div className="h-12 bg-slate-805 rounded-xl"></div>
              </div>
              <div className="glass-panel rounded-3xl p-6 bg-[#131b2e]/10 border border-slate-850/60 h-64 space-y-4">
                <div className="h-5 bg-slate-805 rounded w-1/2"></div>
                <div className="h-32 bg-slate-805 rounded-xl"></div>
              </div>
            </div>
          </div>
        </main>
      ) : !teamDetails ? (
        /* Onboarding Screen */
        <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-6 py-12 md:py-24 flex items-center justify-center">
          {onboardingStep === 'create' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#131b2e]/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-8 text-center relative overflow-hidden"
            >
              <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-purple-600/10 blur-2xl"></div>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-blue-600/10 blur-2xl"></div>
              
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 shadow-lg shadow-purple-500/10 animate-bounce">
                <Users className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-2">Create Your Team</h2>
              <p className="text-slate-400 text-xs mb-8">Set up your workspace and invite team members to start tracking daily pulse updates.</p>

              <form onSubmit={handleCreateTeam} className="space-y-5 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 pl-1">
                    Enter your team name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Engineering Team, Design Squad"
                    className="w-full bg-[#0a0f1d]/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingTeam}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{creatingTeam ? 'Creating Team...' : 'Create Team'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-[#131b2e]/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-8 text-center relative overflow-hidden"
            >
              <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-purple-600/10 blur-2xl"></div>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-blue-600/10 blur-2xl"></div>

              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-green-500/20 to-teal-500/20 border border-green-500/30 flex items-center justify-center text-green-400 mb-6 shadow-lg shadow-green-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-1">{teamDetails?.name}</h2>
              <span className="text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-6 inline-block">
                Created Successfully!
              </span>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Your Invite Code:
              </p>

              <div className="bg-[#0a0f1d]/85 border-2 border-purple-500/40 rounded-2xl py-5 px-6 my-4 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex flex-col items-center justify-center relative group">
                <span className="text-4xl font-extrabold font-mono tracking-widest bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent drop-shadow">
                  {teamDetails?.inviteCode}
                </span>
              </div>

              <button
                onClick={() => handleCopyCode(teamDetails?.inviteCode)}
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold rounded-lg text-slate-200 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all flex items-center space-x-1.5 mx-auto mb-8 cursor-pointer active:scale-95"
              >
                <span>{copiedCode ? 'Copied! ✅' : 'Copy Code'}</span>
              </button>

              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Share this code with your team members so they can join your team and start syncing updates.
              </p>

              <button
                onClick={() => {
                  fetchDashboardData();
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </main>
      ) : (
        <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-6 py-8 md:py-12 space-y-8">
          
          {/* TOP STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Total Team */}
            <div className="glass-panel rounded-2xl p-5 bg-[#131b2e]/30 border border-white/5 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Team</span>
                <p className="text-2xl font-extrabold text-white mt-1">{totalMembers}</p>
                <span className="text-[10px] font-semibold text-slate-600">Registered members</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Submitted Today */}
            <div className="glass-panel rounded-2xl p-5 bg-[#131b2e]/30 border border-white/5 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Updates Today</span>
                <p className="text-2xl font-extrabold text-white mt-1">{submittedTodayCount}</p>
                <span className="text-[10px] font-semibold text-green-500">Syncs compiled</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Pending Today (Clickable Modal Trigger) */}
            <div 
              onClick={() => setShowPendingModal(true)}
              className="glass-panel rounded-2xl p-5 bg-[#131b2e]/30 border border-white/5 hover:border-amber-500/35 hover:bg-[#131b2e]/45 transition-all shadow-xl flex items-center justify-between cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-400 transition-colors">Pending updates</span>
                <p className={`text-2xl font-extrabold mt-1 ${pendingTodayCount > 0 ? 'text-amber-500' : 'text-slate-450'}`}>
                  {pendingTodayCount}
                </p>
                <span className="text-[10px] font-semibold text-slate-600 group-hover:text-amber-400/80 transition-colors">Click to notify</span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                pendingTodayCount > 0 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:bg-amber-500/20 shadow-lg shadow-amber-500/5' 
                  : 'bg-slate-900/50 text-slate-500 border-slate-800'
              }`}>
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Team Mood */}
            <div className="glass-panel rounded-2xl p-5 bg-[#131b2e]/30 border border-white/5 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Team Health</span>
                <p className="text-base font-extrabold text-white mt-2">{getTeamMood()}</p>
                <span className="text-[10px] font-semibold text-slate-600">Moral index today</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Heart className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* AI Team Summary Panel */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 bg-gradient-to-r from-indigo-950/15 via-[#131b2e]/35 to-purple-950/15 border border-purple-500/20 shadow-xl relative shadow-purple-500/5 hover:shadow-purple-500/10 transition-all duration-350">
            <div className="absolute top-[-1px] left-8 w-32 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>🤖 Today's AI Team Summary</span>
                </h2>
                <p className="text-xs text-slate-550 mt-0.5">Generate daily team overview analysis powered by Groq Llama 3</p>
              </div>
              
              <button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-purple-500/15 hover:shadow-purple-500/25 active:scale-95 disabled:opacity-60 disabled:pointer-events-none transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                {generatingSummary ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Analyzing updates...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>{aiSummary ? 'Regenerate Summary' : 'Generate Summary'}</span>
                  </>
                )}
              </button>
            </div>

            {generatingSummary && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-3 animate-pulse">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <p className="text-xs text-slate-405 font-semibold animate-pulse">Groq AI model compiling today's accomplishment summary...</p>
              </div>
            )}

            {!generatingSummary && !aiSummary && (
              <div className="bg-slate-950/20 border border-slate-900/60 p-5 rounded-2xl text-center">
                <p className="text-xs text-slate-405 leading-relaxed">
                  Click the button above to compile today's updates into an AI-powered summary card. It evaluates team mood, top achievements, and manager actions automatically.
                </p>
              </div>
            )}

            {!generatingSummary && aiSummary && (
              <div className="space-y-6">
                
                {/* Sentiment & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  
                  {/* Mood summary */}
                  <div className="bg-slate-950/30 border border-slate-900 p-4 rounded-2xl flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Overall Mood</span>
                    <span className={`text-xs font-extrabold mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border w-fit ${
                      aiSummary.overallMood === 'Healthy' 
                        ? 'bg-green-500/10 text-green-405 border-green-500/25'
                        : aiSummary.overallMood === 'Needs Attention'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                        : 'bg-yellow-500/10 text-yellow-405 border-yellow-500/25'
                    }`}>
                      {aiSummary.overallMood === 'Healthy' ? 'Healthy 🟢' : aiSummary.overallMood === 'Needs Attention' ? 'Needs Attention 🔴' : 'Mixed 🟡'}
                    </span>
                  </div>

                  {/* Summary Text */}
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accomplishment Summary</span>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">{aiSummary.summary}</p>
                  </div>

                </div>

                {/* Achievements & Blockers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-900/60">
                  
                  {/* Highlight Achievement */}
                  <div className="bg-green-500/5 border border-green-500/15 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Top Achievement
                    </span>
                    <p className="text-xs text-slate-350 mt-2 leading-relaxed font-semibold">
                      {aiSummary.topAchievement}
                    </p>
                  </div>

                  {/* Highlight Blocker */}
                  <div className={`p-4 rounded-2xl border ${
                    aiSummary.mainBlocker && aiSummary.mainBlocker.toLowerCase() !== 'none' && aiSummary.mainBlocker.toLowerCase() !== 'none reported'
                      ? 'bg-amber-500/5 border-amber-500/15'
                      : 'bg-slate-900/40 border-slate-800'
                  }`}>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Key Team Blocker
                    </span>
                    <p className="text-xs text-slate-355 mt-2 leading-relaxed font-semibold">
                      {aiSummary.mainBlocker}
                    </p>
                  </div>

                </div>

                {/* Manager Suggestion purple info box */}
                <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl flex items-start space-x-3 mt-2">
                  <TrendingUp className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">AI Coaching Recommendation</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{aiSummary.suggestion}</p>
                  </div>
                </div>

                {/* Powered citation */}
                <div className="text-right pt-2 border-t border-slate-800/40">
                  <span className="text-[9px] font-mono text-slate-500">Powered by Groq AI ⚡</span>
                </div>

              </div>
            )}
          </div>

          {/* MAIN SECTION HEADING */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-b border-slate-900/60 pb-3">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Today's Team Pulse</h2>
            <span className="text-xs font-semibold text-slate-550">{getFormattedDate()}</span>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-white/5 shadow-md">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-450" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0f1d]/60 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-105 placeholder-slate-550 focus:outline-none focus:border-purple-500/80 transition-all shadow-inner"
              />
            </div>
            <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-450 font-bold whitespace-nowrap uppercase tracking-wider text-[10px]">Filter updates:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full sm:w-auto bg-[#0a0f1d]/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-purple-500/80 transition-all shadow-inner cursor-pointer"
              >
                <option value="all">All Members</option>
                <option value="submitted">Submitted Today</option>
                <option value="pending">Pending Today</option>
                <option value="blocker">Has Blockers</option>
              </select>
            </div>
          </div>

          {/* Middle Layout Block */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            
            {/* Left 6 Columns: Team Members List */}
            <div className="lg:col-span-6 space-y-4">
              
              {sortedTeam.length === 0 ? (
                /* Empty state */
                <div className="glass-panel rounded-3xl p-10 bg-[#131b2e]/30 border border-white/5 text-center">
                  <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-slate-305">No members in team yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Once team members sign up with their workspace emails, they will appear here along with their daily pulse updates.
                  </p>
                </div>
              ) : (
                /* Member items */
                sortedTeam.map(member => {
                  const hasUpdate = !!member.todayUpdate;
                  const isExpanded = expandedMemberId === member.id;
                  
                  // Sort styling
                  const cardBorder = hasUpdate 
                    ? 'border-white/5' 
                    : 'border-l-4 border-l-amber-500 border-white/5';
                  
                  // Sentiment styling
                  const sentimentPill = hasUpdate
                    ? {
                        positive: 'bg-green-500/10 text-green-450 border-green-500/20',
                        negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                        neutral: 'bg-yellow-500/10 text-yellow-450 border-yellow-500/20'
                      }[member.todayUpdate.sentiment] || 'bg-slate-805 text-slate-400'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  // Sparkline formatting
                  const sparklineData = (member.weeklyHistory || []).map(day => ({
                    day: day.day,
                    submitted: day.submitted ? 1 : 0
                  }));

                  return (
                    <div 
                      key={member.id}
                      className={`glass-panel rounded-2xl p-5 bg-[#131b2e]/30 border ${cardBorder} shadow-lg transition-all duration-300 hover:bg-slate-900/10`}
                    >
                      {/* Header summary */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-sm font-bold text-purple-400 shrink-0">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-205 flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {member.managerNote && (
                                <StickyNote className="w-3.5 h-3.5 text-yellow-500 animate-pulse shrink-0" title="Has private manager note" />
                              )}
                            </h3>
                            {hasUpdate && member.todayUpdate.summary ? (
                              <p className="text-[11px] text-slate-405 mt-0.5 italic max-w-[180px] sm:max-w-xs md:max-w-md line-clamp-1">
                                <span className="text-purple-400 not-italic font-extrabold mr-1">✨ AI:</span>
                                {member.todayUpdate.summary}
                              </p>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Member</span>
                            )}
                          </div>
                        </div>

                        {/* Submission status text */}
                        <div className="text-left sm:text-right">
                          <p className={`text-xs font-semibold ${hasUpdate ? 'text-slate-400' : 'text-rose-500'}`}>
                            {hasUpdate ? getTimeAgo(member.todayUpdate.submittedAt) : 'No update today'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Joined {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          <span 
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${sentimentPill}`}
                            title={hasUpdate ? `Sentiment analyzed as ${member.todayUpdate.sentiment}` : 'No update submitted yet today'}
                          >
                            {hasUpdate ? member.todayUpdate.sentiment : 'Pending'}
                          </span>
                          
                          <button
                            onClick={() => openMemberModal(member.id)}
                            className="text-xs px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 rounded-lg font-bold transition-all cursor-pointer shrink-0"
                          >
                            View Details
                          </button>
                        </div>

                      </div>

                      {/* Sentiment History Dots & Sparkline Row */}
                      <div className="mt-4 pt-3 border-t border-slate-900/50 flex flex-wrap items-center justify-between gap-4">
                        {/* Sentiment dots timeline */}
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">7-Day Sentiment History</span>
                          <div className="flex items-center space-x-1.5 bg-slate-950/20 px-2 py-1.5 rounded-lg border border-slate-900">
                            {(member.weeklyHistory || []).map((day, idx) => {
                              if (!day.submitted) return <span key={idx} className="w-2.5 h-2.5 rounded-full border border-dashed border-slate-800 bg-slate-950" title={`${day.day}: Missed`}></span>;
                              const dotColor = {
                                positive: 'bg-green-500 shadow-green-500/20',
                                negative: 'bg-rose-500 shadow-rose-500/20',
                                neutral: 'bg-yellow-500 shadow-yellow-500/20'
                              }[day.sentiment] || 'bg-slate-500';
                              return <span key={idx} className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-md`} title={`${day.day}: ${day.sentiment}`}></span>;
                            })}
                          </div>
                        </div>

                        {/* Sparkline Line chart */}
                        <div className="flex items-center space-x-3 bg-slate-950/30 border border-slate-900 px-3 py-1.5 rounded-xl">
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Submissions</span>
                            <span className="text-[11px] font-bold text-slate-350 mt-0.5">{member.totalUpdatesThisWeek}/7 days</span>
                          </div>
                          <div className="w-16 h-8">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={sparklineData}>
                                <Line 
                                  type="monotone" 
                                  dataKey="submitted" 
                                  stroke="#a855f7" 
                                  strokeWidth={1.5} 
                                  dot={false} 
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Expandable text preview */}
                      {hasUpdate && (
                        <div className="mt-4 border-t border-slate-900/60 pt-4">
                          <div 
                            onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                            className="flex items-center justify-between text-xs text-slate-550 hover:text-slate-300 transition-colors cursor-pointer"
                          >
                            <span className="font-bold uppercase tracking-wider">View full status log</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>

                          <div className={`transition-all overflow-hidden duration-350 ${isExpanded ? 'max-h-96 mt-3' : 'max-h-0'}`}>
                            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
                              {member.todayUpdate.updateText}
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              )}

            </div>

            {/* Right 4 Columns: Blocker Alerts & Weekly Activity Chart & Leaderboard */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Leaderboard Card */}
              <div className="glass-panel rounded-3xl p-6 bg-[#131b2e]/30 border border-white/5 shadow-xl relative">
                <div className="mb-4">
                  <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                    <span>🏆 Most Consistent This Week</span>
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Top contributors ranked by updates submitted</p>
                </div>

                <div className="space-y-3">
                  {[...team]
                    .sort((a, b) => b.totalUpdatesThisWeek - a.totalUpdatesThisWeek)
                    .slice(0, 3)
                    .map((member, idx) => {
                      const medalColor = {
                        0: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-md shadow-amber-500/5', // Gold
                        1: 'bg-slate-300/15 text-slate-300 border-slate-300/30', // Silver
                        2: 'bg-orange-500/15 text-orange-405 border-orange-500/30' // Bronze
                      }[idx] || 'bg-slate-805 text-slate-450';
                      
                      const medalText = {
                        0: '🥇 1st',
                        1: '🥈 2nd',
                        2: '🥉 3rd'
                      }[idx];

                      return (
                        <div 
                          key={member.id}
                          className="bg-slate-950/20 border border-slate-900/60 p-3 rounded-2xl flex items-center justify-between hover:bg-slate-900/15 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{member.name}</p>
                              <span className="text-[9px] text-slate-500 font-semibold">{member.totalUpdatesThisWeek} updates submitted</span>
                            </div>
                          </div>

                          <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full border ${medalColor}`}>
                            {medalText}
                          </span>
                        </div>
                      );
                    })}
                  
                  {team.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-4">No team data to rank.</p>
                  )}
                </div>
              </div>

              {/* Blocker Alerts Section */}
              <div className="glass-panel rounded-3xl p-6 bg-[#131b2e]/30 border border-white/5 shadow-xl relative">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🚧 Active Blockers</span>
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Team members reporting blocks today</p>
                </div>

                {activeBlockers.length === 0 ? (
                  /* Happy state no blockers */
                  <div className="bg-green-500/10 border border-green-500/25 p-4 rounded-2xl text-center">
                    <p className="text-xs text-green-400 font-semibold">✅ No blockers today! Team is flowing.</p>
                  </div>
                ) : (
                  /* Blocker Cards List */
                  <div className="space-y-3">
                    {activeBlockers.map(member => (
                      <div 
                        key={member.id}
                        className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-2xl flex flex-col justify-between"
                      >
                        <div className="flex items-center space-x-2.5 mb-2.5">
                          <div className="w-7 h-7 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-xs font-bold text-rose-400 shrink-0">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs font-bold text-slate-200">{member.name}</span>
                        </div>
                        <p className="text-xs text-slate-404 leading-relaxed italic line-clamp-3 pl-1 border-l-2 border-rose-500/40 mb-3.5">
                          "{member.todayUpdate.blockerText || member.todayUpdate.updateText}"
                        </p>
                        <button
                          onClick={() => handleResolveBlocker(member.todayUpdate.id)}
                          className="w-full text-center py-2 bg-slate-900/60 hover:bg-green-500/10 hover:text-green-400 border border-slate-800 hover:border-green-500/30 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Weekly Activity Chart */}
              <div className="glass-panel rounded-3xl p-6 bg-[#131b2e]/30 border border-white/5 shadow-xl relative">
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-300">Weekly Team Activity</h3>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Total submissions per day</p>
                </div>

                <div className="h-56 w-full">
                  {weeklyCounts.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                      No chart data compiling...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyCounts} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="day" 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{ 
                            background: '#0f172a', 
                            borderColor: '#334155',
                            borderRadius: '12px',
                            fontSize: '11px',
                            color: '#cbd5e1'
                          }}
                          cursor={{ fill: '#1e293b', opacity: 0.2 }}
                        />
                        <Bar 
                          dataKey="updates" 
                          fill="url(#colorUpdates)" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 font-medium mt-4 text-center">
                  Tip: Consistent daily updates = better team alignment
                </p>

              </div>

            </div>

          </div>

        </main>
      )}

      {/* PENDING UPDATES MODAL - Moved outside main for correct viewport stacking context */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#131b2e]/95 border border-white/10 glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              
              <button
                onClick={() => setShowPendingModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-6">
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span>Pending Updates Today</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">These members have not submitted their status reports today.</p>
              </div>

              <div className="space-y-3 pr-1">
                {team.filter(m => !m.todayUpdate).map(member => (
                  <div 
                    key={member.id}
                    className="bg-slate-950/30 border border-slate-900 p-3.5 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs font-bold text-slate-205">{member.name}</span>
                    </div>

                    <button
                      onClick={() => handleSendReminder(member.name)}
                      className="text-[10px] font-bold px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg transition-colors cursor-pointer"
                    >
                      Send Reminder
                    </button>
                  </div>
                ))}

                {team.filter(m => !m.todayUpdate).length === 0 && (
                  <div className="text-center py-8 text-green-400 font-bold text-xs">
                    🎉 Excellent! Everyone has submitted today.
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-900/60 text-right">
                <button
                  onClick={() => setShowPendingModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-305 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TEAM MEMBER DETAILS MODAL - Moved outside main & limited viewport height overflow */}
      <AnimatePresence>
        {selectedMemberId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#131b2e]/95 glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative border border-white/10"
            >
              
              {/* Close Button */}
              <button
                onClick={closeMemberModal}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg focus:outline-none transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {loadingModal || !modalData ? (
                /* Loading modal contents */
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Activity className="w-8 h-8 text-purple-400 animate-spin mb-3" />
                  <p className="text-xs text-slate-405 font-medium">Syncing profile updates...</p>
                </div>
              ) : (
                /* Profile contents */
                <div className="space-y-6">
                  {/* Header info */}
                  <div className="flex items-center space-x-3.5 border-b border-slate-800/60 pb-5">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-base font-bold text-blue-400 shrink-0">
                      {modalData.member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-white">{modalData.member.name}</h2>
                      <p className="text-xs text-slate-400">{modalData.member.email}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Registered {new Date(modalData.member.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Stats summary row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submissions this week</span>
                      <p className="text-xl font-extrabold text-white mt-1">{modalData.totalUpdatesThisWeek}</p>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-900 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Morale Score</span>
                      <div className="flex items-center justify-center gap-1.5 mt-1.5">
                        {modalData.timeline.map((day, idx) => {
                          if (!day.submitted) return <span key={idx} className="w-2.5 h-2.5 rounded-full bg-slate-805" title={`${day.dayName}: Missed`}></span>;
                          const dotColor = {
                            positive: 'bg-green-500',
                            negative: 'bg-rose-500',
                            neutral: 'bg-yellow-500'
                          }[day.sentiment] || 'bg-slate-500';
                          return <span key={idx} className={`w-2.5 h-2.5 rounded-full ${dotColor}`} title={`${day.dayName}: ${day.sentiment}`}></span>;
                        })}
                      </div>
                    </div>
                  </div>

                  {/* AI Member Coaching Suggestion */}
                  {modalData.aiAnalysis && (
                    <div className="bg-gradient-to-r from-purple-900/10 via-[#131b2e]/45 to-indigo-900/10 border border-purple-500/25 p-5 rounded-2xl text-left">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1.5 text-purple-400">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">AI Member Coaching Insight</span>
                        </div>
                        
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          modalData.aiAnalysis.trend === 'improving'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : modalData.aiAnalysis.trend === 'declining'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-yellow-500/10 text-yellow-405 border-yellow-500/20'
                        }`}>
                          Trend: {modalData.aiAnalysis.trend}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-slate-300">
                          <span className="text-slate-500 font-semibold text-[10px] uppercase mr-1.5">Work Pattern:</span>
                          {modalData.aiAnalysis.pattern}
                        </p>
                        <p className="text-xs text-slate-205 font-semibold">
                          <span className="text-purple-400 font-bold text-[10px] uppercase mr-1.5">Coaching Tip:</span>
                          {modalData.aiAnalysis.suggestion}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/40 text-right">
                        <span className="text-[9px] font-mono text-slate-500">Powered by Groq AI ⚡</span>
                      </div>
                    </div>
                  )}

                  {/* Private Manager Note Section */}
                  <div className="bg-slate-950/25 border border-slate-900 p-5 rounded-2xl text-left relative">
                    <div className="absolute top-4 right-4 text-[9px] text-amber-500 font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Private Note (Manager Only)
                    </div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <StickyNote className="w-4 h-4 text-amber-500" />
                      <span>Private Note</span>
                    </h4>
                    <form onSubmit={handleSaveNote} className="space-y-3">
                      <textarea
                        value={managerNoteText}
                        onChange={(e) => setManagerNoteText(e.target.value)}
                        placeholder={`Write private notes about ${modalData.member.name} (only you can see this)...`}
                        className="w-full h-20 bg-slate-950/50 hover:bg-slate-950/75 border border-slate-850 focus:border-amber-500/50 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-550 outline-none resize-none transition-all leading-relaxed"
                      />
                      <button
                        type="submit"
                        disabled={savingNote}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-xs font-bold text-white rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center space-x-2"
                      >
                        {savingNote ? (
                          <>
                            <Activity className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Note...</span>
                          </>
                        ) : (
                          <span>Save Private Note</span>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Send Direct Feedback/Message Section */}
                  <div className="bg-slate-950/25 border border-slate-900 p-5 rounded-2xl text-left">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Send Message / Direct Feedback</h4>
                    <form onSubmit={handleSendFeedback} className="space-y-3">
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder={`Type a feedback note, suggestion or message to ${modalData.member.name}...`}
                        className="w-full h-20 bg-slate-950/50 hover:bg-slate-950/75 border border-slate-850 focus:border-purple-500/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-550 outline-none resize-none transition-all leading-relaxed"
                      />
                      <button
                        type="submit"
                        disabled={sendingFeedback || !feedbackText.trim()}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs font-bold text-white rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        {sendingFeedback ? 'Sending Feedback...' : 'Send Feedback Message'}
                      </button>
                    </form>
                  </div>

                  {/* Timeline Updates */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">7-Day Timeline History</h3>
                    <div className="max-h-60 overflow-y-auto space-y-3.5 pr-2">
                      {modalData.timeline.map((day, idx) => (
                        <div key={idx} className="flex space-x-3 items-start">
                          
                          {/* Left calendar dot indicator */}
                          <div className="flex flex-col items-center mt-1">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border ${
                              day.submitted 
                                ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 border-none text-white' 
                                : 'bg-slate-950 border-slate-800 text-slate-600'
                            }`}>
                              {day.dayName[0]}
                            </span>
                            {idx < modalData.timeline.length - 1 && <span className="w-0.5 h-10 bg-slate-800/40"></span>}
                          </div>

                          {/* Right text box */}
                          <div className="flex-1 bg-slate-950/20 border border-slate-900/60 p-3.5 rounded-2xl">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-slate-300">
                                {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                              </span>
                              
                              {day.submitted && (
                                <span 
                                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                    day.sentiment === 'positive'
                                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                      : day.sentiment === 'negative'
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                  }`}
                                  title={`AI analyzed sentiment: ${day.sentiment}`}
                                >
                                  {day.sentiment}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">
                              {day.submitted ? day.updateText : 'No update submitted on this day'}
                            </p>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

export default ManagerDashboard;

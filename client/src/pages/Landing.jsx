import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Brain, 
  Heart, 
  ArrowRight, 
  Menu, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Activity
} from 'lucide-react';

function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scrolling to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* Background Soft Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[550px] h-[550px] rounded-full bg-indigo-600/10 blur-[130px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Top Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800/50 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
              FlowSync
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">How It Works</a>
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">Pricing</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">Company</a>
          </div>

          {/* Desktop Call to Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200 px-4 py-2">
              Login
            </Link>
            <Link to="/signup" className="relative group overflow-hidden rounded-xl px-5 py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"></span>
              <span className="relative text-sm font-semibold text-white flex items-center gap-1.5">
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0f172a]/95 backdrop-blur-lg border-b border-slate-800/80 px-6 py-8 flex flex-col space-y-6 shadow-2xl">
            <a 
              href="#features" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
            >
              Company
            </a>
            <hr className="border-slate-800" />
            <div className="flex flex-col space-y-4">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center font-semibold text-slate-300 hover:text-white py-3 border border-slate-800 rounded-xl">
                Login
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-center font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl shadow-lg shadow-purple-500/25">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-24 md:pt-44 md:pb-36 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-8 text-xs font-semibold text-indigo-300 shadow-inner hover:bg-indigo-500/20 transition-all duration-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Announcing AI-Powered Team Summaries</span>
          <ArrowRight className="w-3 h-3" />
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Your Team. <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            One Pulse.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
          Stop wasting time in meetings. Let your team share daily updates in 60 seconds. Get clear AI insights, identify blockers, and track team health effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
          {/* Glowing CTA */}
          <Link to="/signup" className="relative group w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 shadow-xl shadow-purple-500/20 hover:shadow-purple-500/35 hover:scale-[1.03] active:scale-95 text-center">
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-300 group-hover:opacity-90"></span>
            <span className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-85 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <Link to="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 text-slate-200 hover:text-white transition-all duration-200 text-center">
            Book a Demo
          </Link>
        </div>

        {/* Interactive Mock Dashboard */}
        <div className="w-full max-w-4xl rounded-2xl glass-panel p-2 shadow-2xl relative">
          <div className="absolute inset-x-20 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          
          {/* Mock App Header */}
          <div className="bg-[#131b2e]/90 rounded-t-xl px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              <span className="text-xs text-slate-500 ml-4 font-mono">app.flowsync.com/dashboard</span>
            </div>
            <div className="flex space-x-1.5">
              <span className="h-1.5 w-6 rounded-full bg-slate-800"></span>
              <span className="h-1.5 w-4 rounded-full bg-slate-800"></span>
            </div>
          </div>

          {/* Mock App Content */}
          <div className="bg-[#0f172a]/95 rounded-b-xl p-4 md:p-6 text-left grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sidebar */}
            <div className="md:col-span-1 border-r border-slate-800/40 pr-0 md:pr-6 hidden md:block">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-4">Engineering Team</h3>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Connor', role: 'Product Design', status: 'completed' },
                  { name: 'Alex Mercer', role: 'Backend Developer', status: 'completed' },
                  { name: 'Elena Rostova', role: 'Frontend Engineer', status: 'pending' },
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/20">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-slate-200">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{member.name}</p>
                        <p className="text-[10px] text-slate-500">{member.role}</p>
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${member.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Area */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Today's Pulse</span>
                  <span className="text-xs text-slate-500">Updated 10m ago</span>
                </div>
                <span className="text-xs text-indigo-400 flex items-center gap-1 font-semibold cursor-pointer hover:underline">
                  <Brain className="w-3.5 h-3.5" /> AI Summary
                </span>
              </div>

              {/* Feed Card 1 */}
              <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-800/50 hover:border-slate-700/50 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                      SC
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Sarah Connor</h4>
                      <p className="text-[10px] text-slate-500">Product Design • 58s ago</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                    🟢 High Energy
                  </span>
                </div>
                <div className="space-y-1.5 pl-10">
                  <p className="text-xs text-slate-300"><span className="text-slate-500 font-medium">Done:</span> Finished the design spec for the async update builder. Handoff is complete.</p>
                  <p className="text-xs text-slate-300"><span className="text-slate-500 font-medium">Next:</span> Wireframing AI analytics dash and team health widgets.</p>
                  <p className="text-xs text-slate-400 italic"><span className="text-slate-500 font-medium not-italic">Blockers:</span> None. Waiting for copywriter review on Hero headers.</p>
                </div>
              </div>

              {/* Feed Card 2 */}
              <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-800/50 hover:border-slate-700/50 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                      AM
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Alex Mercer</h4>
                      <p className="text-[10px] text-slate-500">Backend Dev • 15m ago</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                    🟡 Focused
                  </span>
                </div>
                <div className="space-y-1.5 pl-10">
                  <p className="text-xs text-slate-300"><span className="text-slate-500 font-medium">Done:</span> Deployed authentication middleware and mapped MongoDB mongoose schemas.</p>
                  <p className="text-xs text-slate-300"><span className="text-slate-500 font-medium">Next:</span> Set up the server health metrics check and routes hookups.</p>
                  <p className="text-xs text-amber-400/90 font-medium"><span className="text-slate-500 font-medium">Blocker:</span> Need access credentials for AWS staging database configurations.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-slate-900/40 border-y border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-3">Core Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Designed for high-performing async teams.
            </h3>
            <p className="text-slate-400 mt-4">
              Stop coordinating meetings across timezones. FlowSync lets your team communicate status transparently, whenever they start their day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group rounded-2xl glass-panel p-8 hover:bg-slate-800/30 hover:border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors duration-300">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">60 Second Updates</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Fast, focused format designed for builders. Cut down meetings and standups by 90% while keeping everyone aligned on their own schedule.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800/50 flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300 gap-1 cursor-pointer">
                <span>Learn more about async loops</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl glass-panel p-8 hover:bg-slate-800/30 hover:border-slate-700/50 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors duration-300">
                  <Brain className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">AI Powered Insights</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Automatic summary compilation. Our model highlights key achievements, flags immediate blockers, and drafts weekly client status summaries automatically.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800/50 flex items-center text-xs font-semibold text-purple-400 group-hover:text-purple-300 gap-1 cursor-pointer">
                <span>Explore AI summaries</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl glass-panel p-8 hover:bg-slate-800/30 hover:border-slate-700/50 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-6 group-hover:bg-rose-500/20 group-hover:text-rose-300 transition-colors duration-300">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Team Health at a Glance</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Check morale trendlines, focus outputs, and alignment indexes. Discover burnout patterns early and empower leaders to intervene proactively.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-800/50 flex items-center text-xs font-semibold text-rose-400 group-hover:text-rose-300 gap-1 cursor-pointer">
                <span>View team health analytics</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Integration */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-3">Easy Integration</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Build context in public. Keep developers in their flow state.
            </h3>
            <p className="text-slate-400 mt-4 mb-8">
              Meeting rooms are expensive. FlowSync sits naturally in your flow, allowing developers to sync updates from Slack, Teams, or directly inside their workspace terminal.
            </p>
            <div className="space-y-4">
              {[
                'Reduce calendar clutter by up to 12 hours/developer per week.',
                'Never miss blockers again with real-time dependency tagging.',
                'Generate automated client-facing logs on demand.',
              ].map((text, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6 shadow-2xl relative bg-[#131b2e]/60">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800/50 pb-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">npm init -y server-check</span>
            </div>
            <pre className="font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto space-y-1">
              <code>
                <div><span className="text-slate-500">$</span> npm run flowsync:sync</div>
                <div className="text-slate-400">⚡ Connecting to FlowSync Hub...</div>
                <div className="text-green-400">✔ Successfully linked. Workspace active.</div>
                <div>&nbsp;</div>
                <div className="text-slate-400">Enter your daily updates:</div>
                <div className="text-white">? What did you do today? <span className="text-purple-400">Integrated DB schemas & CORS routes.</span></div>
                <div className="text-white">? What are you doing next? <span className="text-purple-400">Scaffolding dashboard landing page.</span></div>
                <div className="text-white">? Any blockers? <span className="text-purple-400">None.</span></div>
                <div>&nbsp;</div>
                <div className="text-slate-400">Morale rating (1-5): <span className="text-green-400">5/5</span></div>
                <div className="text-purple-400 font-bold">✔ Update Synced! AI analysis generated.</div>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600/35 via-indigo-600/35 to-purple-600/35 border border-white/10 p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px]"></div>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Get back to building.
            </h3>
            <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto mb-10">
              Join teams around the globe that are saving hours of meeting overhead every day. Set up your pulse in 2 minutes.
            </p>
            <Link to="/signup" className="inline-block px-8 py-4 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-lg hover:shadow-xl hover:shadow-white/10 active:scale-95 text-center">
              Start Free (No Credit Card)
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                FlowSync
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Stop meetings, sync async. Keep teams aligned, healthy, and focused on writing high-quality code.
            </p>
          </div>

          <div>
            <h4 className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="#features" className="hover:text-slate-300 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-slate-300 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">AI Summaries</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Enterprise</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="#" className="hover:text-slate-300 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">API Keys</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Status Check</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="#" className="hover:text-slate-300 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-slate-300 transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-900/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} FlowSync. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Built with ❤️ by <span className="text-slate-300 font-semibold">Piyush Patil</span>
          </p>
        </div>
      </footer>

    </div>
  );
}

export default Landing;

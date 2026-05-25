import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Home } from 'lucide-react';

function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex items-center justify-center relative p-6 overflow-hidden">
      {/* Background Soft Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 bg-[#131b2e]/40 border border-white/10 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6">
          <Activity className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-6xl font-extrabold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-200 mb-3">Oops! Page not found</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all cursor-pointer active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  );
}

export default PageNotFound;

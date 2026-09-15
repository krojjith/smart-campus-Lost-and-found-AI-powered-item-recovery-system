import React from 'react';
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  HelpCircle, 
  Compass, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'browse' | 'report-lost' | 'report-found' | 'ai-match';
  setActiveTab: (tab: 'browse' | 'report-lost' | 'report-found' | 'ai-match') => void;
  openLostCount: number;
  openFoundCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openLostCount,
  openFoundCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <button
            id="brand-logo-btn"
            onClick={() => setActiveTab('browse')}
            className="flex items-center space-x-3 text-left group transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition">
              <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight font-display">
                  Smart Campus
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden sm:inline-block">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium -mt-0.5">
                Lost &amp; Found Portal
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-browse-tab"
              onClick={() => setActiveTab('browse')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'browse'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              Directory
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                {openLostCount + openFoundCount}
              </span>
            </button>

            <button
              id="nav-ai-match-tab"
              onClick={() => setActiveTab('ai-match')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-2 relative ${
                activeTab === 'ai-match'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              AI Smart Matching
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              id="nav-report-lost-btn"
              onClick={() => setActiveTab('report-lost')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'report-lost'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/70'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span> Lost
            </button>

            <button
              id="nav-report-found-btn"
              onClick={() => setActiveTab('report-found')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'report-found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span> Found
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

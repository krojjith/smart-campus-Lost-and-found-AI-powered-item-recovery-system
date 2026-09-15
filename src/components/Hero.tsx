import React from 'react';
import { 
  Sparkles, 
  Search, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onReportLost: () => void;
  onReportFound: () => void;
  onExploreAI: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalItems: number;
  openLostCount: number;
  openFoundCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  onReportLost,
  onReportFound,
  onExploreAI,
  searchQuery,
  setSearchQuery,
  totalItems,
  openLostCount,
  openFoundCount,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60">
      {/* Decorative background grid subtle overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Campus Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-indigo-300 text-xs font-semibold mb-6 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Official University Campus Safety &amp; Recovery Hub</span>
        </motion.div>

        {/* Exact Requested Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display"
        >
          Smart Campus Lost &amp; Found
        </motion.h1>

        {/* Exact Requested Short Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-xl sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto"
        >
          “Find what you lost. Return what you found.”
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl mx-auto"
        >
          Powered by Gemini AI to automatically scan and match lost belongings with turned-in items across campus buildings, labs, and dorms.
        </motion.p>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          {/* Button: Report Lost Item */}
          <button
            id="hero-report-lost-btn"
            onClick={onReportLost}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-base shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
          >
            <HelpCircle className="w-5 h-5" />
            Report Lost Item
          </button>

          {/* Button: Report Found Item */}
          <button
            id="hero-report-found-btn"
            onClick={onReportFound}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
          >
            <CheckCircle2 className="w-5 h-5" />
            Report Found Item
          </button>
        </motion.div>

        {/* AI Match Feature Banner & Quick Search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 max-w-2xl mx-auto"
        >
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              id="hero-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lost or found items by name, brand, location, or stickers..."
              className="w-full pl-12 pr-28 py-3.5 bg-slate-800/90 text-white placeholder-slate-400 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner text-sm"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-700 rounded-md cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <button
                onClick={onExploreAI}
                className="absolute right-2 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Match
              </button>
            )}
          </div>
        </motion.div>

        {/* Live campus status pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="font-semibold text-slate-200">{openLostCount}</span> Active Lost Reports
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-200">{openFoundCount}</span> Items Waiting in Custody
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">Gemini 3.8 Flash</span> Semantic Matching
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Campus Security Verified</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

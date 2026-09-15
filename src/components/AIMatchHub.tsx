import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Mail, 
  Building,
  Info,
  ChevronRight
} from 'lucide-react';
import { CampusItem, AIMatchCandidate } from '../types.ts';

interface AIMatchHubProps {
  items: CampusItem[];
  selectedItemForMatch: CampusItem | null;
  onSelectItemForMatch: (item: CampusItem | null) => void;
  onViewItemDetails: (item: CampusItem) => void;
  onUpdateStatus: (id: string, newStatus: 'open' | 'claimed') => void;
}

export const AIMatchHub: React.FC<AIMatchHubProps> = ({
  items,
  selectedItemForMatch,
  onSelectItemForMatch,
  onViewItemDetails,
  onUpdateStatus,
}) => {
  const [activeItem, setActiveItem] = useState<CampusItem | null>(
    selectedItemForMatch || items.find((i) => i.status === 'open') || items[0] || null
  );

  const [matches, setMatches] = useState<AIMatchCandidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAiPowered, setIsAiPowered] = useState<boolean>(true);
  const [batchMode, setBatchMode] = useState<boolean>(false);

  // Synchronize when parent passes a new selectedItemForMatch
  useEffect(() => {
    if (selectedItemForMatch) {
      setActiveItem(selectedItemForMatch);
      setBatchMode(false);
      runItemMatch(selectedItemForMatch);
    }
  }, [selectedItemForMatch]);

  const runItemMatch = async (target: CampusItem) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetItemId: target.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to compute AI matches.');
      }

      setMatches(data.matches || []);
      setIsAiPowered(data.isAiPowered ?? true);
      if (data.matches.length === 0 && data.message) {
        setErrorMsg(data.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running AI Smart Match.');
    } finally {
      setIsLoading(false);
    }
  };

  const runBatchScan = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setBatchMode(true);

    try {
      const res = await fetch('/api/match-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to scan all campus items.');
      }

      setMatches(data.matches || []);
      setIsAiPowered(data.isAiPowered ?? true);
      if (data.matches.length === 0) {
        setErrorMsg('No high-confidence matches found between current open lost and found items.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error during campus batch scan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run on initial mount if activeItem exists
  useEffect(() => {
    if (activeItem && matches.length === 0 && !isLoading) {
      runItemMatch(activeItem);
    }
  }, [activeItem?.id]);

  const lostItems = items.filter((i) => i.type === 'lost' && i.status !== 'claimed');
  const foundItems = items.filter((i) => i.type === 'found' && i.status !== 'claimed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
            AI Semantic Similarity Engine
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            AI Smart Matching Hub
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Gemini 3.8 Flash reads descriptions, unique traits (stickers, colors, scratches), locations, and timestamps to cross-reference lost belongings against turned-in items.
          </p>

          {/* Mode Switcher Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="batch-scan-all-btn"
              onClick={runBatchScan}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                batchMode
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              Scan All Campus Open Items for Pairs
            </button>

            {activeItem && (
              <button
                id="rerun-active-match-btn"
                onClick={() => {
                  setBatchMode(false);
                  runItemMatch(activeItem);
                }}
                disabled={isLoading}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  !batchMode
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Match Single Item: {activeItem.title.slice(0, 24)}...
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Target Item Selection Bar (when in single-item mode) */}
      {!batchMode && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Item to Compare:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                id="select-item-for-matching"
                value={activeItem?.id || ''}
                onChange={(e) => {
                  const found = items.find((i) => i.id === e.target.value);
                  if (found) {
                    setActiveItem(found);
                    onSelectItemForMatch(found);
                    runItemMatch(found);
                  }
                }}
                className="w-full sm:max-w-md px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <optgroup label="Lost Items (Compare against Found Items)">
                  {lostItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [LOST] {item.title} ({item.category})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Found Items (Compare against Lost Items)">
                  {foundItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [FOUND] {item.title} ({item.category})
                    </option>
                  ))}
                </optgroup>
              </select>

              {activeItem && (
                <button
                  id="trigger-compare-now-btn"
                  onClick={() => runItemMatch(activeItem)}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isLoading ? 'Comparing...' : 'Run Match'}
                </button>
              )}
            </div>
          </div>

          {activeItem && (
            <div className="text-xs text-slate-500 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
              <span className="font-semibold text-slate-700">Currently comparing:</span>
              <p className="text-slate-900 font-medium truncate max-w-xs">{activeItem.title}</p>
              <p className="text-slate-500 truncate max-w-xs">{activeItem.location}</p>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-12 text-center shadow-xs">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            AI is Analyzing Descriptions &amp; Markers...
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Comparing specific attributes (stickers, serial numbers, brands, damage), building proximity, and chronological sequence across campus reports.
          </p>
          <div className="mt-6 w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-indigo-600 animate-pulse rounded-full"></div>
          </div>
        </div>
      )}

      {/* Error or Empty message */}
      {!isLoading && errorMsg && matches.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No Candidates Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{errorMsg}</p>
          <button
            onClick={runBatchScan}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold cursor-pointer"
          >
            Scan All Open Campus Items
          </button>
        </div>
      )}

      {/* Match Results List */}
      {!isLoading && matches.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <span>AI Matching Candidates</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                  {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sorted by AI match score based on semantic analysis of descriptors, brands, and campus locations.
              </p>
            </div>

            {isAiPowered ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Gemini 3.8 Flash Analyzed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                Smart Attribute Analyzed
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {matches.map((candidate, idx) => {
              const scoreColor =
                candidate.matchScore >= 80
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : candidate.matchScore >= 50
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-slate-700 bg-slate-50 border-slate-200';

              const progressColor =
                candidate.matchScore >= 80
                  ? 'bg-emerald-500'
                  : candidate.matchScore >= 50
                  ? 'bg-amber-500'
                  : 'bg-slate-400';

              return (
                <div
                  key={`${candidate.lostItem.id}-${candidate.foundItem.id}-${idx}`}
                  id={`match-card-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Card Match Header */}
                  <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Score Badge */}
                      <div className={`px-3 py-1.5 rounded-xl border font-bold text-sm flex items-center gap-1.5 ${scoreColor}`}>
                        <Sparkles className="w-4 h-4" />
                        <span>{candidate.matchScore}% Match Score</span>
                      </div>

                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                        {candidate.confidence} Confidence
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 italic">
                      Match Pair #{idx + 1}
                    </p>
                  </div>

                  {/* Side-by-Side Comparison Box */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lost Item Card */}
                    <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-600 text-white flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" /> Lost Item
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {candidate.lostItem.category}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        {candidate.lostItem.imageUrl && (
                          <img
                            src={candidate.lostItem.imageUrl}
                            alt={candidate.lostItem.title}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-lg object-cover border border-rose-200 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                            {candidate.lostItem.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-3">
                            {candidate.lostItem.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 pt-2 border-t border-rose-100/80 space-y-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{candidate.lostItem.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Reported by: {candidate.lostItem.contactName} ({candidate.lostItem.contactEmail})</span>
                        </div>
                      </div>
                    </div>

                    {/* Found Item Card */}
                    <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Found Item
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {candidate.foundItem.category}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        {candidate.foundItem.imageUrl && (
                          <img
                            src={candidate.foundItem.imageUrl}
                            alt={candidate.foundItem.title}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-lg object-cover border border-emerald-200 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                            {candidate.foundItem.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-3">
                            {candidate.foundItem.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 pt-2 border-t border-emerald-100/80 space-y-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{candidate.foundItem.location}</span>
                        </div>
                        {candidate.foundItem.storageLocation && (
                          <div className="flex items-center gap-1.5 truncate text-emerald-800 font-medium">
                            <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">Custody: {candidate.foundItem.storageLocation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Match Explanation */}
                  <div className="px-5 sm:px-6 pb-5 pt-1 space-y-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-indigo-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Analysis &amp; Comparison:
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                        {candidate.reasoning}
                      </p>

                      {/* Matching attributes tags */}
                      {candidate.matchedAttributes && candidate.matchedAttributes.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {candidate.matchedAttributes.map((attr, aIdx) => (
                            <span
                              key={aIdx}
                              className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                              ✓ {attr}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Caveats if any */}
                      {candidate.unmatchedOrCaveats && candidate.unmatchedOrCaveats.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {candidate.unmatchedOrCaveats.map((c, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                            >
                              • Notice: {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Next Steps Recommendation & Quick Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">Recommended Action: </span>
                        <span>{candidate.suggestedAction}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`view-lost-detail-btn-${idx}`}
                          onClick={() => onViewItemDetails(candidate.lostItem)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                        >
                          View Lost Details
                        </button>
                        <button
                          id={`view-found-detail-btn-${idx}`}
                          onClick={() => onViewItemDetails(candidate.foundItem)}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          View Found Details
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

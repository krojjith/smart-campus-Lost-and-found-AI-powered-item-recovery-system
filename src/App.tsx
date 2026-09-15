/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Clock, 
  Compass,
  Building,
  Check
} from 'lucide-react';
import { CampusItem, ItemCategory } from './types.ts';
import { INITIAL_CAMPUS_ITEMS } from './mockData.ts';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ItemCard } from './components/ItemCard.tsx';
import { ReportForm } from './components/ReportForm.tsx';
import { ItemDetailModal } from './components/ItemDetailModal.tsx';
import { AIMatchHub } from './components/AIMatchHub.tsx';

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'IDs & Cards',
  'Wallets & Bags',
  'Keys & Fobs',
  'Clothing & Accessories',
  'Books & Notes',
  'Water Bottles & Tumblers',
  'Jewelry & Watches',
  'Eyewear',
  'Other',
];

export default function App() {
  const [items, setItems] = useState<CampusItem[]>(INITIAL_CAMPUS_ITEMS);
  const [activeTab, setActiveTab] = useState<'browse' | 'report-lost' | 'report-found' | 'ai-match'>('browse');
  
  // Filtering & search states
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ItemCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'claimed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Selected Items
  const [selectedDetailItem, setSelectedDetailItem] = useState<CampusItem | null>(null);
  const [matchTargetItem, setMatchTargetItem] = useState<CampusItem | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch items from server
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load items from server, using local state:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Calculated Counters
  const openLostCount = useMemo(
    () => items.filter((i) => i.type === 'lost' && i.status !== 'claimed').length,
    [items]
  );
  const openFoundCount = useMemo(
    () => items.filter((i) => i.type === 'found' && i.status !== 'claimed').length,
    [items]
  );

  // Filtered items for display
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesCategory) return false;
      }
      return true;
    });
  }, [items, typeFilter, categoryFilter, statusFilter, searchQuery]);

  // Handle reporting submission
  const handleReportSuccess = (newItem: CampusItem, triggerAIMatch: boolean) => {
    setItems((prev) => [newItem, ...prev]);
    showToast(
      `${newItem.type === 'lost' ? 'Lost item report' : 'Found item'} published successfully!`,
      'success'
    );

    if (triggerAIMatch) {
      setMatchTargetItem(newItem);
      setActiveTab('ai-match');
    } else {
      setActiveTab('browse');
    }
  };

  // Update item status
  const handleUpdateStatus = async (id: string, newStatus: 'open' | 'claimed') => {
    try {
      const res = await fetch(`/api/items/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
        if (selectedDetailItem && selectedDetailItem.id === id) {
          setSelectedDetailItem((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        showToast(`Item status updated to ${newStatus}.`, 'info');
      }
    } catch (err) {
      console.error('Status update failed:', err);
      // Optimistic local update
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
    }
  };

  // Direct trigger AI match for an item
  const handleRunMatch = (item: CampusItem) => {
    setMatchTargetItem(item);
    setActiveTab('ai-match');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLostCount={openLostCount}
        openFoundCount={openFoundCount}
      />

      <main className="flex-1">
        {/* VIEW 1: HOME / BROWSE DIRECTORY */}
        {activeTab === 'browse' && (
          <div>
            {/* Attractive Hero Section */}
            <Hero
              onReportLost={() => setActiveTab('report-lost')}
              onReportFound={() => setActiveTab('report-found')}
              onExploreAI={() => setActiveTab('ai-match')}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalItems={items.length}
              openLostCount={openLostCount}
              openFoundCount={openFoundCount}
            />

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
              {/* Directory Filter & Header Bar */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                      <span>Recently Reported Items</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {filteredItems.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Explore active lost and found reports from across all campus facilities.
                    </p>
                  </div>

                  {/* Quick Action Button within Directory */}
                  <div className="flex items-center gap-2">
                    <button
                      id="browse-report-lost-quick-btn"
                      onClick={() => setActiveTab('report-lost')}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Report Lost
                    </button>
                    <button
                      id="browse-report-found-quick-btn"
                      onClick={() => setActiveTab('report-found')}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Report Found
                    </button>
                  </div>
                </div>

                {/* Filter Controls Row */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Type Filter Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      id="filter-type-all"
                      onClick={() => setTypeFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                        typeFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Items ({items.length})
                    </button>
                    <button
                      id="filter-type-lost"
                      onClick={() => setTypeFilter('lost')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                        typeFilter === 'lost'
                          ? 'bg-white text-rose-700 shadow-xs'
                          : 'text-slate-600 hover:text-rose-700'
                      }`}
                    >
                      <HelpCircle className="w-3 h-3 text-rose-600" />
                      Lost Only ({items.filter((i) => i.type === 'lost').length})
                    </button>
                    <button
                      id="filter-type-found"
                      onClick={() => setTypeFilter('found')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                        typeFilter === 'found'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Found Only ({items.filter((i) => i.type === 'found').length})
                    </button>
                  </div>

                  {/* Category & Status Selectors */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Category:</span>
                      <select
                        id="filter-category-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as any)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Status:</span>
                      <select
                        id="filter-status-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">Active &amp; Claimed</option>
                        <option value="open">Active Only</option>
                        <option value="claimed">Claimed Only</option>
                      </select>
                    </div>

                    {(typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                      <button
                        id="reset-all-filters-btn"
                        onClick={() => {
                          setTypeFilter('all');
                          setCategoryFilter('all');
                          setStatusFilter('all');
                          setSearchQuery('');
                        }}
                        className="text-xs font-semibold text-rose-600 hover:underline px-1.5 py-1 cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Grid Display */}
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onSelect={(i) => setSelectedDetailItem(i)}
                      onRunMatch={handleRunMatch}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
                  <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No Matching Items Found</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Try adjusting your category, keyword search, or report a new lost or found item.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setTypeFilter('all');
                        setCategoryFilter('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                    >
                      Clear Search Filters
                    </button>
                    <button
                      onClick={() => setActiveTab('report-lost')}
                      className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                    >
                      Report Lost Item
                    </button>
                  </div>
                </div>
              )}

              {/* How AI Matching Works Info Section */}
              <div className="mt-16 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    How Smart Campus AI Works
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 font-display">
                    Bridging the Gap Between Lost &amp; Found
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Misplaced belongings often get turned in to different building desks, dorms, or campus safety. Our automated AI model cross-references items in seconds:
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 font-bold flex items-center justify-center">
                      1
                    </div>
                    <h4 className="font-bold text-slate-900">1. Instant Reporting</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Students or faculty report lost or found items with photos, timestamps, and specific markers like stickers, case colors, or engravings.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                      2
                    </div>
                    <h4 className="font-bold text-slate-900">2. Gemini 3.8 Flash AI Match</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Our semantic matching engine evaluates physical descriptions, brand names, location proximity, and timeline sequence to assign a match probability score.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                      3
                    </div>
                    <h4 className="font-bold text-slate-900">3. Verified Campus Retrieval</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Owners connect with the finder or visit the verified custody location (Library Desk, Campus Safety HQ) with photo ID to claim their property.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: REPORT LOST ITEM */}
        {activeTab === 'report-lost' && (
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <ReportForm
              type="lost"
              onClose={() => setActiveTab('browse')}
              onSubmitSuccess={handleReportSuccess}
            />
          </div>
        )}

        {/* VIEW 3: REPORT FOUND ITEM */}
        {activeTab === 'report-found' && (
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <ReportForm
              type="found"
              onClose={() => setActiveTab('browse')}
              onSubmitSuccess={handleReportSuccess}
            />
          </div>
        )}

        {/* VIEW 4: AI SMART MATCHING HUB */}
        {activeTab === 'ai-match' && (
          <AIMatchHub
            items={items}
            selectedItemForMatch={matchTargetItem}
            onSelectItemForMatch={setMatchTargetItem}
            onViewItemDetails={(item) => setSelectedDetailItem(item)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onRunMatch={handleRunMatch}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Campus Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-base mb-2 font-display">
                <Compass className="w-4 h-4 text-indigo-400" />
                Smart Campus Lost &amp; Found
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                Official university community portal to report misplaced belongings and match found items using Google Gemini AI.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-200 mb-2">Campus Retrieval Locations</p>
              <ul className="space-y-1 text-slate-400 text-xs">
                <li>• Public Safety Office (Student Center Rm 101)</li>
                <li>• Main Library Circulation Desk</li>
                <li>• North Recreation Center Front Counter</li>
                <li>• Engineering Makerspace Reception</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-200 mb-2">Need Immediate Assistance?</p>
              <div className="space-y-1.5 text-xs">
                <p className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Campus Safety Hotline: (555) 019-9111
                </p>
                <p className="flex items-center gap-1.5 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  lostandfound@campus.edu
                </p>
                <p className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Mon – Fri: 8:00 AM – 9:00 PM | Sat – Sun: 10:00 AM – 6:00 PM
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <p>© 2026 Smart Campus Lost &amp; Found. All university property laws apply.</p>
            <p>Powered by Google AI Studio &amp; Gemini 3.8 Flash</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  Building, 
  Check, 
  RotateCcw
} from 'lucide-react';
import { CampusItem } from '../types.ts';

interface ItemDetailModalProps {
  item: CampusItem | null;
  onClose: () => void;
  onRunMatch: (item: CampusItem) => void;
  onUpdateStatus: (id: string, newStatus: 'open' | 'claimed') => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onRunMatch,
  onUpdateStatus,
}) => {
  if (!item) return null;

  const isLost = item.type === 'lost';
  const isClaimed = item.status === 'claimed';

  const formattedDate = (() => {
    try {
      const d = new Date(item.dateTime);
      return d.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
      });
    } catch {
      return item.dateTime;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isLost ? 'bg-rose-50/70 border-rose-100' : 'bg-emerald-50/70 border-emerald-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 text-white ${
                isLost ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {isLost ? <HelpCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {isLost ? 'Lost Item Report' : 'Found Item Record'}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700">
              {item.category}
            </span>
          </div>

          <button
            id="close-item-detail-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Image if available */}
          {item.imageUrl && (
            <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 max-h-72 flex items-center justify-center">
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain max-h-72"
              />
            </div>
          )}

          {/* Title & Status */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                {item.title}
              </h2>
              {isClaimed && (
                <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-white">
                  Resolved / Claimed
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {item.description}
            </p>
          </div>

          {/* Location & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                {isLost ? 'Last Seen Location' : 'Found Location'}
              </span>
              <p className="text-slate-900 font-medium pl-5.5">{item.location}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Date &amp; Time
              </span>
              <p className="text-slate-900 font-medium pl-5.5">{formattedDate}</p>
            </div>
          </div>

          {/* Custody / Holding Location for Found items */}
          {!isLost && item.storageLocation && (
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3 text-xs sm:text-sm">
              <Building className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-indigo-950">Current Physical Custody</p>
                <p className="text-indigo-800 mt-0.5">{item.storageLocation}</p>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {isLost ? 'Reporter / Owner Details' : 'Finder / Campus Staff Contact'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Name</span>
                <span className="font-semibold text-slate-800">{item.contactName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Campus Email</span>
                <a
                  href={`mailto:${item.contactEmail}`}
                  className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  {item.contactEmail}
                </a>
              </div>
              {item.contactPhone && (
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <a
                    href={`tel:${item.contactPhone}`}
                    className="font-medium text-slate-700 hover:text-indigo-600 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {item.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="toggle-claim-status-btn"
              onClick={() => onUpdateStatus(item.id, isClaimed ? 'open' : 'claimed')}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 hover:bg-white text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              {isClaimed ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  Re-open Report
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Mark as Claimed / Returned
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="modal-run-ai-match-btn"
              onClick={() => {
                onClose();
                onRunMatch(item);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Find Matches with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

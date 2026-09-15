import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  HelpCircle, 
  Laptop, 
  CreditCard, 
  Briefcase, 
  Key, 
  Shirt, 
  BookOpen, 
  Coffee, 
  Watch, 
  Glasses, 
  Package
} from 'lucide-react';
import { CampusItem, ItemCategory } from '../types.ts';

interface ItemCardProps {
  item: CampusItem;
  onSelect: (item: CampusItem) => void;
  onRunMatch: (item: CampusItem) => void;
  onUpdateStatus?: (id: string, newStatus: 'open' | 'claimed') => void;
}

const getCategoryIcon = (category: ItemCategory) => {
  switch (category) {
    case 'Electronics':
      return <Laptop className="w-4 h-4" />;
    case 'IDs & Cards':
      return <CreditCard className="w-4 h-4" />;
    case 'Wallets & Bags':
      return <Briefcase className="w-4 h-4" />;
    case 'Keys & Fobs':
      return <Key className="w-4 h-4" />;
    case 'Clothing & Accessories':
      return <Shirt className="w-4 h-4" />;
    case 'Books & Notes':
      return <BookOpen className="w-4 h-4" />;
    case 'Water Bottles & Tumblers':
      return <Coffee className="w-4 h-4" />;
    case 'Jewelry & Watches':
      return <Watch className="w-4 h-4" />;
    case 'Eyewear':
      return <Glasses className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onSelect,
  onRunMatch,
  onUpdateStatus,
}) => {
  const isLost = item.type === 'lost';
  const isClaimed = item.status === 'claimed';

  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(item.dateTime);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return item.dateTime;
    }
  }, [item.dateTime]);

  return (
    <div
      id={`item-card-${item.id}`}
      className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isClaimed
          ? 'border-slate-200 opacity-70 bg-slate-50/50'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-lg'
      }`}
    >
      <div>
        {/* Card Image or Media Header */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4">
              <div className="w-12 h-12 rounded-xl bg-slate-200/70 flex items-center justify-center mb-2 text-slate-500">
                {getCategoryIcon(item.category)}
              </div>
              <span className="text-xs font-medium text-slate-500">{item.category}</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {/* Type badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs flex items-center gap-1 ${
                isLost
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isLost ? <HelpCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
              {isLost ? 'Lost' : 'Found'}
            </span>

            {/* Claimed status */}
            {isClaimed && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-white shadow-xs">
                Claimed / Returned
              </span>
            )}
          </div>

          {/* Category Chip */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-white border border-slate-700/50">
              {getCategoryIcon(item.category)}
              <span>{item.category}</span>
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5">
          <h3 className="font-bold text-base text-slate-900 line-clamp-1 font-display group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>

          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Meta specs */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          id={`view-details-${item.id}`}
          onClick={() => onSelect(item)}
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-slate-200/60 transition cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </button>

        <div className="flex items-center gap-1.5">
          {!isClaimed && (
            <button
              id={`ai-match-item-${item.id}`}
              onClick={() => onRunMatch(item)}
              title="Run AI Match against counterpart items"
              className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              AI Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

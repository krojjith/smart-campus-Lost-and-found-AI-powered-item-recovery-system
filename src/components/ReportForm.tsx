import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  HelpCircle, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Tag, 
  FileText, 
  Sparkles, 
  AlertCircle,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import { ItemType, ItemCategory, CampusItem } from '../types.ts';

interface ReportFormProps {
  type: ItemType;
  onClose: () => void;
  onSubmitSuccess: (createdItem: CampusItem, triggerAIMatch: boolean) => void;
}

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

const CAMPUS_LOCATIONS = [
  'Main Library - 1st Floor Cafe',
  'Main Library - 2nd Floor Quiet Study',
  'Student Union / Dining Commons',
  'North Recreation Center & Gym',
  'Science Hall / Lab Wing',
  'Engineering Complex & Makerspace',
  'Campus Quad / Lawn',
  'Shuttle Bus Stop #3',
  'Dormitory Quadrangle',
  'Auditorium & Lecture Hall A',
];

const SAMPLE_IMAGES = [
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Earbuds', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
  { label: 'Keys', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80' },
  { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80' },
];

export const ReportForm: React.FC<ReportFormProps> = ({
  type,
  onClose,
  onSubmitSuccess,
}) => {
  const isLost = type === 'lost';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    return now.toISOString().slice(0, 16);
  });
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [storageLocation, setStorageLocation] = useState(
    isLost ? '' : 'Turned in to Campus Safety Front Desk'
  );

  // Image Upload State
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent, runMatch: boolean = false) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic client validation
    if (!title.trim()) {
      setErrorMsg('Item name is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a description with specific identifiers (color, markings, brand).');
      return;
    }
    if (!location.trim()) {
      setErrorMsg(isLost ? 'Please specify the last seen location.' : 'Please specify the found location.');
      return;
    }
    if (!dateTime) {
      setErrorMsg('Please specify the date and time.');
      return;
    }
    if (!contactName.trim() || !contactEmail.trim()) {
      setErrorMsg('Contact name and campus email are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          category,
          description: description.trim(),
          imageUrl: imageUrl || undefined,
          location: location.trim(),
          dateTime,
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          storageLocation: !isLost ? storageLocation.trim() : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit item report.');
      }

      onSubmitSuccess(data.item, runMatch);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-3xl mx-auto my-6">
      {/* Form Header */}
      <div
        className={`px-6 py-5 flex items-center justify-between border-b ${
          isLost ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
              isLost ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            {isLost ? <HelpCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              {isLost ? 'Report Lost Item' : 'Report Found Item'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {isLost
                ? 'Fill in details about what you misplaced so our AI can cross-reference found items.'
                : 'Help reunite an item with its owner. Enter details of the item you found.'}
            </p>
          </div>
        </div>

        <button
          id="close-report-form-btn"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mx-6 mt-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">
        {/* Section 1: Item Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            1. Item Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="item-name-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isLost ? 'e.g., Space Gray MacBook Pro 14", Red Water Flask' : 'e.g., Found Silver Laptop, Blue Keychain with Car Fob'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="item-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
              <span className="text-slate-400 font-normal ml-1">(Include brand, color, stickers, scratches, case, or contents)</span>
            </label>
            <textarea
              id="item-description-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide distinctive identifiers. E.g. 'Has a NASA sticker and slight scratch on top left lid. Inside a navy sleeve.' The AI uses this for high-precision matching."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Section 2: Image Upload */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              2. Upload Item Image
            </h3>
            <span className="text-xs text-slate-400">Optional but highly recommended</span>
          </div>

          {imageUrl ? (
            <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 flex items-center gap-4">
              <img
                src={imageUrl}
                alt="Item Preview"
                referrerPolicy="no-referrer"
                className="w-24 h-24 object-cover rounded-lg border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">Item Image Attached</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">Ready to submit with report</p>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="mt-2 text-xs font-medium text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  Remove Photo
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-7 h-7 mx-auto text-slate-400 mb-1.5" />
              <p className="text-sm font-semibold text-slate-700">
                Click to browse or drag and drop image here
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                PNG, JPG, or WebP up to 8MB
              </p>

              {/* Sample Preset helper for convenience */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Or pick sample:</span>
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageUrl(sample.url);
                    }}
                    className="px-2 py-0.5 text-xs rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Location & Time */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            3. {isLost ? 'Last Seen Location & Time' : 'Found Location & Time'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isLost ? 'Last Seen Location' : 'Found Location'} <span className="text-rose-500">*</span>
              </label>
              <input
                id="item-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isLost ? 'e.g., Library 2nd Floor Study Desk 14' : 'e.g., North Gym Bleachers, Student Union Rm 102'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />

              {/* Quick campus suggestions */}
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-[11px] text-slate-400 mr-1">Suggestions:</span>
                {CAMPUS_LOCATIONS.slice(0, 3).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition"
                  >
                    {loc.split(' - ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date and Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="item-datetime-input"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Approximate time helps AI verify chronological plausibility.
              </p>
            </div>
          </div>

          {!isLost && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Where is the item currently secured / stored?
              </label>
              <input
                id="item-storage-input"
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="e.g., Turned in to Campus Police HQ, or With Finder in Lab 304"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Section 4: Contact Details */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-500" />
            4. Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isLost ? 'Owner Name' : 'Finder / Staff Name'} <span className="text-rose-500">*</span>
              </label>
              <input
                id="contact-name-input"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g., Alex Morgan"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="contact-email-input"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g., alex.m@campus.edu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                id="contact-phone-input"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g., (555) 019-2834"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          {/* Option: Submit & Run AI Match Immediately */}
          <button
            id="submit-with-ai-btn"
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Submit &amp; Check AI Matches
          </button>

          {/* Primary Submit button */}
          <button
            id="submit-item-btn"
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              isLost
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200'
            }`}
          >
            {isSubmitting ? (
              <span>Submitting Report...</span>
            ) : (
              <>
                {isLost ? <HelpCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                Submit {isLost ? 'Lost Item' : 'Found Item'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

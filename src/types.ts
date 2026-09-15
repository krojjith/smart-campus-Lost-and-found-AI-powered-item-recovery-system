export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'Electronics'
  | 'IDs & Cards'
  | 'Wallets & Bags'
  | 'Keys & Fobs'
  | 'Clothing & Accessories'
  | 'Books & Notes'
  | 'Water Bottles & Tumblers'
  | 'Jewelry & Watches'
  | 'Eyewear'
  | 'Other';

export type ItemStatus = 'open' | 'matched' | 'claimed';

export interface CampusItem {
  id: string;
  type: ItemType;
  title: string;
  category: ItemCategory;
  description: string;
  imageUrl?: string;
  location: string;
  dateTime: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  storageLocation?: string; // where found item is safely kept e.g. Campus Police Desk
  status: ItemStatus;
  createdAt: string;
}

export interface AIMatchCandidate {
  lostItem: CampusItem;
  foundItem: CampusItem;
  matchScore: number; // 0 - 100
  confidence: 'High' | 'Medium' | 'Low';
  reasoning: string;
  matchedAttributes: string[];
  unmatchedOrCaveats?: string[];
  suggestedAction: string;
}

export interface SmartMatchResponse {
  success: boolean;
  matches: AIMatchCandidate[];
  analyzedCount: number;
  message?: string;
  isAiPowered: boolean;
}

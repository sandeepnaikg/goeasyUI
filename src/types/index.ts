export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
}

export interface WalletAccount {
  id: string;
  userId: string;
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'credit' | 'debit';
  category: 'travel' | 'food' | 'tickets' | 'shopping' | 'refund' | 'cashback' | 'topup' | 'transfer' | 'redeem';
  description: string;
  // UTR/reference number for the transaction
  referenceId?: string;
  // Payment method/channel used for the tx
  method?: 'upi' | 'bank' | 'card' | 'wallet' | 'gateway' | 'refund' | 'cashback' | 'other';
  // Counterparty account or payee/payer name
  toOrFrom?: string;
  // Status of the transaction
  status?: 'success' | 'pending' | 'failed';
  createdAt: Date;
}

export interface PaymentCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'rupay' | 'amex' | 'other';
  last4: string;
  holderName: string;
  expiry: string; // MM/YY
  createdAt: Date;
  isDefault?: boolean;
}

export interface RewardActivity {
  id: string;
  source: 'shopping' | 'food' | 'travel' | 'tickets' | 'referral' | 'cashback' | 'redeem' | 'other';
  description: string;
  points: number; // positive earn, negative redeem
  createdAt: Date;
  referenceId?: string;
}

export interface RewardsPoints {
  id: string;
  userId: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface TravelBooking {
  id: string;
  userId: string;
  type: 'flight' | 'hotel' | 'bus';
  fromLocation: string;
  toLocation: string;
  departureDate: Date;
  returnDate?: Date;
  // TODO: refine traveler typing
  travelers: Record<string, unknown>[];
  price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookingReference: string;
  details: Record<string, unknown>;
}

export interface FoodOrder {
  id: string;
  userId: string;
  restaurantName: string;
  items: Record<string, unknown>[];
  totalAmount: number;
  deliveryAddress: string;
  status: 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  deliveryTime?: Date;
  rating?: number;
}

export interface TicketBooking {
  id: string;
  userId: string;
  eventType: 'movie' | 'concert' | 'sports' | 'theater';
  eventName: string;
  venue: string;
  eventDate: Date;
  seats: Record<string, unknown>[];
  totalAmount: number;
  qrCode?: string;
  status: 'confirmed' | 'cancelled' | 'used';
}

export interface ShoppingOrder {
  id: string;
  userId: string;
  items: Record<string, unknown>[];
  totalAmount: number;
  shippingAddress: string;
  status: 'processing' | 'shipped' | 'delivered' | 'returned';
  trackingNumber?: string;
  deliveryDate?: Date;
}

export type ModuleType = 'travel' | 'food' | 'tickets' | 'shopping' | 'wallet';

// Address model used for Shopping/Travel delivers and billing
export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other' | string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface UpiHandle {
  id: string;
  handle: string; // e.g., name@bank
  verified: boolean;
  isDefault?: boolean;
  createdAt: Date;
}

// Privacy & Security
export interface PrivacySettings {
  marketingEmails: boolean;
  smsAlerts: boolean;
  personalizedOffers: boolean;
  crashAnalytics: boolean;
  twoFactorEnabled: boolean; // stub toggle
}

export interface SessionInfo {
  id: string;
  device: string; // e.g., "Chrome on macOS"
  location?: string; // city, country (stub)
  lastActive: Date;
  current?: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Payments' | 'Orders' | 'Technical' | 'Account' | 'Other';
  description: string;
  email: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: Date;
}

export interface AppNotification {
  id: string;
  // module categorization used to group notifications; allow 'system' and any custom strings
  module: 'travel' | 'food' | 'tickets' | 'shopping' | 'wallet' | 'system' | 'offers' | string;
  title: string;
  message: string;
  read?: boolean;
  createdAt: Date;
}

export interface ReferralState {
  myCode: string; // user’s referral code
  referredBy?: string; // code used when signing up
  credits: number; // bonus credits or points accrued via referrals
  firstOrderGranted?: boolean; // whether first-order referral credit given
}

export interface PayLaterState {
  enabled: boolean;
  limit: number; // total credit limit
  used: number; // used amount
  dueAmount: number; // current due
  dueDate?: Date; // next due date
}

// Unified refund request model used across modules
export interface RefundRequest {
  id: string; // REF- timestamp or uuid
  orderId: string; // original order id
  module: 'shopping' | 'food' | 'tickets' | 'travel'; // source vertical
  amount: number; // refund amount requested
  createdAt: string; // ISO timestamp (string for easy localStorage use)
  status: 'Requested' | 'Processing' | 'Approved' | 'Rejected' | string; // lifecycle status
}

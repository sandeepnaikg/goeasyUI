/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import AuthModal from '../components/AuthModal';
import { User, WalletAccount, RewardsPoints, ModuleType, WalletTransaction, RewardActivity, PaymentCard, Address, UpiHandle, PrivacySettings, SessionInfo, SupportTicket, AppNotification, ReferralState, PayLaterState } from '../types';
import { getSupabase } from '../lib/supabaseClient';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  // auth helpers (no-ops if Supabase not configured)
  signInWithOtp: (phone: string) => Promise<{ ok: boolean; message?: string }>;
  signInWithGoogle: () => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  wallet: WalletAccount | null;
  setWallet: (wallet: WalletAccount | null) => void;
  rewards: RewardsPoints | null;
  setRewards: (rewards: RewardsPoints | null) => void;
  walletTransactions: WalletTransaction[];
  setWalletTransactions: (tx: WalletTransaction[]) => void;
  rewardActivities: RewardActivity[];
  setRewardActivities: (a: RewardActivity[]) => void;
  paymentCards: PaymentCard[];
  setPaymentCards: (c: PaymentCard[]) => void;
  upiHandles: UpiHandle[];
  setUpiHandles: (u: UpiHandle[]) => void;
  defaultPaymentMethod: 'wallet' | 'upi' | 'card' | 'paylater';
  setDefaultPaymentMethod: (m: 'wallet' | 'upi' | 'card' | 'paylater') => void;
  defaultCardId: string | null;
  setDefaultCardId: (id: string | null) => void;
  defaultUpiId: string | null;
  setDefaultUpiId: (id: string | null) => void;
  // Addresses
  addresses: Address[];
  setAddresses: (a: Address[]) => void;
  defaultAddressId: string | null;
  setDefaultAddressId: (id: string | null) => void;
  selectedAddressId: string | null; // for checkout session
  setSelectedAddressId: (id: string | null) => void;
  favorites: Record<string, boolean>; // key: entity id
  setFavorite: (id: string, liked: boolean) => void;
  recentlyViewed: Array<{ id: string; type: string; title: string; image?: string; when: string }>;
  addRecentlyViewed: (v: { id: string; type: string; title: string; image?: string }) => void;
  currentModule: ModuleType | null;
  setCurrentModule: (module: ModuleType | null) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  prevPage: string | null;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  // Privacy & Security
  privacy: PrivacySettings;
  setPrivacy: (p: PrivacySettings) => void;
  sessions: SessionInfo[];
  setSessions: (s: SessionInfo[]) => void;
  logoutAllSessions: () => void;
  // Help / Support
  tickets: SupportTicket[];
  addTicket: (t: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => SupportTicket;
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void;
  // Session controls
  logoutSession: (id: string) => void;
  // Notifications
  notifications: AppNotification[];
  pushNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  // Auth modal controls (for gating flows)
  openAuthModal: () => void;
  closeAuthModal: () => void;
  // Referral
  referral: ReferralState;
  setReferral: (r: ReferralState) => void;
  // Pay Later
  payLater: PayLaterState;
  setPayLater: (p: PayLaterState) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [rewards, setRewards] = useState<RewardsPoints | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [rewardActivities, setRewardActivities] = useState<RewardActivity[]>([]);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [upiHandles, setUpiHandles] = useState<UpiHandle[]>(() => {
    try { return JSON.parse(localStorage.getItem('upiHandles') || '[]'); } catch { return []; }
  });
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<'wallet' | 'upi' | 'card' | 'paylater'>(() => {
    try { return (localStorage.getItem('defaultPaymentMethod') as 'wallet'|'upi'|'card'|'paylater') || 'wallet'; } catch { return 'wallet'; }
  });
  const [defaultCardId, setDefaultCardId] = useState<string | null>(() => {
    try { return localStorage.getItem('defaultCardId'); } catch { return null; }
  });
  const [defaultUpiId, setDefaultUpiId] = useState<string | null>(() => {
    try { return localStorage.getItem('defaultUpiId'); } catch { return null; }
  });
  const [addresses, setAddresses] = useState<Address[]>(() => {
    try { return JSON.parse(localStorage.getItem('addresses') || '[]'); } catch { return []; }
  });
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(() => {
    try { return localStorage.getItem('defaultAddressId'); } catch { return null; }
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    try { return localStorage.getItem('selectedAddressId'); } catch { return null; }
  });
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '{}'); } catch { return {}; }
  });
  const [recentlyViewed, setRecentlyViewed] = useState<Array<{ id: string; type: string; title: string; image?: string; when: string }>>(() => {
    try { return JSON.parse(localStorage.getItem('recentlyViewed') || '[]'); } catch { return []; }
  });

  const [currentModule, setCurrentModule] = useState<ModuleType | null>(null);
  const [currentPage, setCurrentPageState] = useState<string>('home');
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const isProtected = (target: string) => {
    const prefixes = [
      'profile', 'orders',
      'shopping-cart', 'shopping-payment', 'shopping-confirmation',
      'food-cart', 'food-payment', 'food-tracking',
      'tickets-payment', 'tickets-confirmation',
      'wallet-', 'manage-addresses', 'payment-methods', 'privacy-security'
    ];
    return prefixes.some(p => target.startsWith(p));
  };
  const setCurrentPage = (page: string) => {
    // Auth guard: redirect guests to signup for protected pages and remember intent
    if (!user && isProtected(page)) {
      try { localStorage.setItem('intendedPage', page); } catch { /* ignore */ }
      setCurrentPageState((prev) => { setPrevPage(prev); return 'signup'; });
      return;
    }
    setCurrentPageState((prev) => { setPrevPage(prev); return page; });
  };
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // Privacy & Security state
  const [privacy, setPrivacy] = useState<PrivacySettings>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('privacySettings') || 'null') || {
          marketingEmails: true,
          smsAlerts: true,
          personalizedOffers: true,
          crashAnalytics: false,
          twoFactorEnabled: false,
        }
      );
    } catch {
      return { marketingEmails: true, smsAlerts: true, personalizedOffers: true, crashAnalytics: false, twoFactorEnabled: false };
    }
  });
  const [sessions, setSessions] = useState<SessionInfo[]>(() => {
    try {
      const raw = localStorage.getItem('sessions');
      if (raw) return JSON.parse(raw);
      // seed a couple sessions
      return [
        { id: 'sess-current', device: 'Chrome on macOS', location: 'Pune, IN', lastActive: new Date(), current: true },
        { id: 'sess-2', device: 'Android App', location: 'Mumbai, IN', lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      ];
    } catch {
      return [
        { id: 'sess-current', device: 'Chrome on macOS', location: 'Pune, IN', lastActive: new Date(), current: true },
      ];
    }
  });
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try { return JSON.parse(localStorage.getItem('supportTickets') || '[]'); } catch { return []; }
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try { return JSON.parse(localStorage.getItem('notifications') || '[]'); } catch { return []; }
  });
  const [referral, setReferral] = useState<ReferralState>(() => {
    try {
      const raw = localStorage.getItem('referral');
      if (raw) return JSON.parse(raw);
      return { myCode: 'GOZY-' + Math.random().toString(36).slice(2, 7).toUpperCase(), credits: 0 };
    } catch { return { myCode: 'GOZY-' + Math.random().toString(36).slice(2, 7).toUpperCase(), credits: 0 }; }
  });
  const [payLater, setPayLater] = useState<PayLaterState>(() => {
    try {
      const raw = localStorage.getItem('payLater');
      return raw ? JSON.parse(raw) : { enabled: true, limit: 5000, used: 0, dueAmount: 0 };
    } catch { return { enabled: true, limit: 5000, used: 0, dueAmount: 0 }; }
  });

  const logout = () => {
    try {
      setUser(null);
      // optional: clear ephemeral selections and carts
      localStorage.removeItem('foodCart');
      localStorage.removeItem('shoppingCart');
      localStorage.removeItem('selectedMovie');
      localStorage.removeItem('selectedShow');
      setCurrentModule(null);
      setCurrentPage('home');
    } catch {
      setUser(null);
      setCurrentModule(null);
      setCurrentPage('home');
    }
  };

  const signInWithOtp = async (phone: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      // Mock: accept any number; create a guest user
      const u = { id: 'guest', email: 'guest@gozy.com', fullName: 'Guest User', phone } as User;
      setUser(u);
  try { localStorage.setItem('user', JSON.stringify(u)); } catch { /* ignore persist error */ }
      return { ok: true };
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed';
      return { ok: false, message: msg };
    }
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      const u = { id: 'google_local', email: 'google@gozy.com', fullName: 'Google User', phone: '' } as User;
      setUser(u);
  try { localStorage.setItem('user', JSON.stringify(u)); } catch { /* ignore persist error */ }
      return { ok: true };
    }
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) return { ok: false, message: error.message };
      if (data?.url) window.location.href = data.url;
      return { ok: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed';
      return { ok: false, message: msg };
    }
  };

  // initialize data from localStorage
  useEffect(() => {
    try {
  // Migrate legacy favorites keys (without namespace) to namespaced ones
  try {
    const rawFav = localStorage.getItem('favorites');
    if (rawFav) {
      const favObj = JSON.parse(rawFav) as Record<string, boolean>;
      let changed = false;
      const namespaced: Record<string, boolean> = { ...favObj };
      Object.keys(favObj).forEach((k) => {
        if (!k.includes(':')) {
          // Heuristic: move common ids into likely namespaces if we have selections stored
          const hasHotel = !!localStorage.getItem('selectedHotel');
          const hasProduct = !!localStorage.getItem('selectedProduct');
          const hasMovie = !!localStorage.getItem('selectedMovie');
          const targetKey = hasProduct ? `product:${k}` : hasMovie ? `movie:${k}` : hasHotel ? `hotel:${k}` : `item:${k}`;
          if (!(targetKey in namespaced)) {
            namespaced[targetKey] = favObj[k];
          }
          delete namespaced[k];
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('favorites', JSON.stringify(namespaced));
        setFavorites(namespaced);
      }
    }
  } catch { /* ignore */ }
  // Load user
  const u = localStorage.getItem('user');
  if (u) setUser(JSON.parse(u));
  else setUser({ id: '1', email: 'user@gozy.com', fullName: 'Guest User', phone: '+91 9876543210' });

  const w = localStorage.getItem('wallet');
      if (w) setWallet(JSON.parse(w));
      else {
        const defaultWallet: WalletAccount = { id: 'w1', userId: '1', balance: 0, currency: 'INR' };
        setWallet(defaultWallet);
        localStorage.setItem('wallet', JSON.stringify(defaultWallet));
      }

      const r = localStorage.getItem('rewards');
      if (r) setRewards(JSON.parse(r));
      else {
        const defaultRewards: RewardsPoints = { id: 'r1', userId: '1', points: 100, tier: 'bronze' };
        setRewards(defaultRewards);
        localStorage.setItem('rewards', JSON.stringify(defaultRewards));
      }

      const tx = localStorage.getItem('walletTransactions');
      if (tx) setWalletTransactions(JSON.parse(tx));
      else {
        const seed: WalletTransaction[] = [
          { id: 't1', walletId: 'w1', amount: 4500, type: 'debit', category: 'travel', description: 'Flight Booking', method: 'gateway', status: 'success', referenceId: 'UTRFL123456', toOrFrom: 'GOZY TRAVEL', createdAt: new Date('2025-10-03T10:35:00') },
          { id: 't2', walletId: 'w1', amount: 450, type: 'credit', category: 'cashback', description: 'Cashback Reward', method: 'cashback', status: 'success', referenceId: 'CBK987654', toOrFrom: 'GOZY REWARDS', createdAt: new Date('2025-10-03T10:36:00') },
          { id: 't3', walletId: 'w1', amount: 650, type: 'debit', category: 'food', description: 'Food Order', method: 'wallet', status: 'success', referenceId: 'UTRFD432198', toOrFrom: 'Pizza Hub', createdAt: new Date('2025-10-02T19:15:00') },
          { id: 't4', walletId: 'w1', amount: 2100, type: 'credit', category: 'refund', description: 'Booking Cancellation Refund', method: 'refund', status: 'success', referenceId: 'REF112233', toOrFrom: 'GOZY REFUND', createdAt: new Date('2025-10-01T08:20:00') },
        ];
        setWalletTransactions(seed);
        localStorage.setItem('walletTransactions', JSON.stringify(seed));
      }

      const ra = localStorage.getItem('rewardActivities');
      if (ra) setRewardActivities(JSON.parse(ra));
      else {
        const seedAct: RewardActivity[] = [
          { id: 'ra1', source: 'travel', description: 'Flight Booking', points: 450, createdAt: new Date('2025-10-03') },
          { id: 'ra2', source: 'cashback', description: 'Wallet Cashback', points: 200, createdAt: new Date('2025-10-02') },
          { id: 'ra3', source: 'shopping', description: 'Order #10023', points: 300, createdAt: new Date('2025-10-01') },
          { id: 'ra4', source: 'food', description: 'Food Order', points: 300, createdAt: new Date('2025-09-30') },
        ];
        setRewardActivities(seedAct);
        localStorage.setItem('rewardActivities', JSON.stringify(seedAct));
      }

      const pc = localStorage.getItem('paymentCards');
      if (pc) setPaymentCards(JSON.parse(pc));
      else {
        const seedCards: PaymentCard[] = [
          { id: 'c1', brand: 'visa', last4: '4242', holderName: 'GUEST USER', expiry: '12/27', createdAt: new Date(), isDefault: true },
          { id: 'c2', brand: 'mastercard', last4: '5587', holderName: 'GUEST USER', expiry: '05/26', createdAt: new Date() },
        ];
        setPaymentCards(seedCards);
        localStorage.setItem('paymentCards', JSON.stringify(seedCards));
        setDefaultCardId('c1');
        localStorage.setItem('defaultCardId', 'c1');
      }

      // Seed a demo UPI if none
      const uh = localStorage.getItem('upiHandles');
      if (!uh) {
        const seedUpi: UpiHandle[] = [
          { id: 'u1', handle: 'guest@upi', verified: true, isDefault: true, createdAt: new Date() },
        ];
        setUpiHandles(seedUpi);
        localStorage.setItem('upiHandles', JSON.stringify(seedUpi));
        setDefaultUpiId('u1');
        localStorage.setItem('defaultUpiId', 'u1');
      } else {
        const arr: UpiHandle[] = JSON.parse(uh);
        setUpiHandles(arr);
        const defU = localStorage.getItem('defaultUpiId');
        if (!defU && arr.length > 0) {
          const id = arr.find(x => x.isDefault)?.id || arr[0].id;
          setDefaultUpiId(id);
          localStorage.setItem('defaultUpiId', id);
        }
      }

      // Seed a sample address if none exists to keep flows smooth
      const addrRaw = localStorage.getItem('addresses');
      if (!addrRaw) {
        const seedAddr: Address[] = [
          { id: 'addr-1', label: 'Home', name: 'Guest User', phone: '9876543210', line1: '221B Baker Street', city: 'Mumbai', state: 'MH', pincode: '400001', isDefault: true },
        ];
        setAddresses(seedAddr);
        localStorage.setItem('addresses', JSON.stringify(seedAddr));
        setDefaultAddressId('addr-1');
        localStorage.setItem('defaultAddressId', 'addr-1');
      } else {
        const arr: Address[] = JSON.parse(addrRaw);
        setAddresses(arr);
        const def = localStorage.getItem('defaultAddressId');
        if (!def && arr.length > 0) {
          const firstId = arr.find(a => a.isDefault)?.id || arr[0].id;
          setDefaultAddressId(firstId);
          localStorage.setItem('defaultAddressId', firstId);
        }
      }

      // Force light theme by default for consistent white backgrounds
      setTheme('light');
    } catch {
      // ignore
    }
  }, []);

  // Notify when rewards increase (e.g., after a payment) so UI can show immediate feedback
  const prevRewardsRef = useRef<number | null>(null);
  useEffect(() => {
    try {
      if (!rewards) return;
      const prev = prevRewardsRef.current;
      if (prev === null) {
        // initialize without notifying
        prevRewardsRef.current = rewards.points || 0;
        return;
      }
      if ((rewards.points || 0) > prev) {
        const diff = (rewards.points || 0) - prev;
        // push an in-app notification about earned points
        const notif = { id: `nt-${Date.now()}`, createdAt: new Date(), read: false, module: 'system' as const, title: 'Points added', message: `You earned ${diff} pts!` };
  setNotifications((prevN) => [notif as unknown as import('../types').AppNotification, ...prevN].slice(0, 100));
      }
      prevRewardsRef.current = rewards.points || 0;
    } catch {
      // ignore
    }
  }, [rewards]);

  // Award a one-time join bonus when a user logs in for the first time (per user id)
  const prevUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    try {
      const prevId = prevUserIdRef.current;
      const currId = user?.id || null;
      // transition from no-user to a user indicates a fresh login in this session
      if (!prevId && currId) {
        const key = `joinBonusAwarded:${currId}`;
        const already = localStorage.getItem(key);
        if (!already) {
          const bonus = 500;
          // update rewards state
          const existing = rewards || { id: `r-${Date.now()}`, userId: currId, points: 0, tier: 'bronze' };
          const updatedRewards = { ...existing, points: (existing.points || 0) + bonus };
          setRewards(updatedRewards);
          try { localStorage.setItem('rewards', JSON.stringify(updatedRewards)); } catch { /* ignore */ }
          // add activity
          const act = { id: `ra-${Date.now()}`, source: 'other' as const, description: 'Welcome Bonus', points: bonus, createdAt: new Date() };
          setRewardActivities((prev) => {
            const next = [act, ...prev].slice(0, 100);
            try { localStorage.setItem('rewardActivities', JSON.stringify(next)); } catch { /* ignore */ }
            return next;
          });
          try { localStorage.setItem(key, 'true'); } catch { /* ignore */ }
          // show a welcome notification
          const notif = { id: `nt-${Date.now()}`, createdAt: new Date(), read: false, module: 'system' as const, title: 'Welcome bonus', message: `You received ${bonus} points for joining!` };
          setNotifications((prev) => [notif as unknown as import('../types').AppNotification, ...prev].slice(0, 100));
          // close auth modal if open so user sees the banner
          setAuthModalOpen(false);
        }
      }
      prevUserIdRef.current = currId;
    } catch {
      // ignore
    }
  }, [user, rewards]);

  // apply theme to document
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);
  // persist privacy, sessions, tickets
  useEffect(() => {
    try { localStorage.setItem('privacySettings', JSON.stringify(privacy)); } catch { /* ignore */ }
  }, [privacy]);
  useEffect(() => {
    try { localStorage.setItem('sessions', JSON.stringify(sessions)); } catch { /* ignore */ }
  }, [sessions]);
  useEffect(() => {
    try { localStorage.setItem('supportTickets', JSON.stringify(tickets)); } catch { /* ignore */ }
  }, [tickets]);
  useEffect(() => {
    try { localStorage.setItem('notifications', JSON.stringify(notifications)); } catch { /* ignore */ }
  }, [notifications]);
  useEffect(() => {
    try { localStorage.setItem('referral', JSON.stringify(referral)); } catch { /* ignore */ }
  }, [referral]);

  // Auth modal visibility
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);
  useEffect(() => {
    try { localStorage.setItem('payLater', JSON.stringify(payLater)); } catch { /* ignore */ }
  }, [payLater]);
  // persist payments defaults and UPI
  useEffect(() => {
    try { localStorage.setItem('upiHandles', JSON.stringify(upiHandles)); } catch { /* ignore */ }
  }, [upiHandles]);
  useEffect(() => {
    try { localStorage.setItem('defaultPaymentMethod', defaultPaymentMethod); } catch { /* ignore */ }
  }, [defaultPaymentMethod]);
  useEffect(() => {
    try {
      if (defaultCardId) localStorage.setItem('defaultCardId', defaultCardId); else localStorage.removeItem('defaultCardId');
    } catch { /* ignore */ }
  }, [defaultCardId]);
  useEffect(() => {
    try {
      if (defaultUpiId) localStorage.setItem('defaultUpiId', defaultUpiId); else localStorage.removeItem('defaultUpiId');
    } catch { /* ignore */ }
  }, [defaultUpiId]);

  // persist addresses/default/selected changes
  useEffect(() => {
    try { localStorage.setItem('addresses', JSON.stringify(addresses)); } catch { /* ignore */ }
  }, [addresses]);
  useEffect(() => {
    try {
      if (defaultAddressId) localStorage.setItem('defaultAddressId', defaultAddressId);
      else localStorage.removeItem('defaultAddressId');
    } catch { /* ignore */ }
  }, [defaultAddressId]);
  useEffect(() => {
    try {
      if (selectedAddressId) localStorage.setItem('selectedAddressId', selectedAddressId);
      else localStorage.removeItem('selectedAddressId');
    } catch { /* ignore */ }
  }, [selectedAddressId]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        signInWithOtp,
        signInWithGoogle,
        logout,
        wallet,
        setWallet,
        rewards,
        setRewards,
        walletTransactions,
        setWalletTransactions,
        rewardActivities,
        setRewardActivities,
        paymentCards,
        setPaymentCards,
  upiHandles,
  setUpiHandles,
  defaultPaymentMethod,
  setDefaultPaymentMethod,
  defaultCardId,
  setDefaultCardId,
  defaultUpiId,
  setDefaultUpiId,
  addresses,
  setAddresses,
  defaultAddressId,
  setDefaultAddressId,
  selectedAddressId,
  setSelectedAddressId,
        favorites,
        setFavorite: (id: string, liked: boolean) => {
          setFavorites((prev) => {
            const next = { ...prev, [id]: liked };
            try { localStorage.setItem('favorites', JSON.stringify(next)); } catch { /* ignore persist error */ }
            return next;
          });
        },
        recentlyViewed,
        addRecentlyViewed: (v) => {
          setRecentlyViewed((prev) => {
            const entry = { ...v, when: new Date().toISOString() };
            const deduped = [entry, ...prev.filter(p => !(p.id === v.id && p.type === v.type))].slice(0, 50);
            try { localStorage.setItem('recentlyViewed', JSON.stringify(deduped)); } catch { /* ignore persist error */ }
            return deduped;
          });
        },
        currentModule,
        setCurrentModule,
        currentPage,
        setCurrentPage,
        prevPage,
        theme,
        setTheme,
        privacy,
        setPrivacy,
        sessions,
        setSessions,
        logoutAllSessions: () => {
          setSessions((prev) => prev.map(s => ({ ...s, current: s.current, lastActive: s.current ? new Date() : s.lastActive })).slice(0, 1));
        },
        logoutSession: (id: string) => {
          setSessions((prev) => prev.filter(s => s.id !== id || s.current));
        },
        tickets,
        addTicket: (t) => {
          const ticket: SupportTicket = { id: `tick-${Date.now()}`, status: 'Open', createdAt: new Date(), ...t };
          setTickets((prev) => {
            const next = [ticket, ...prev].slice(0, 50);
            return next;
          });
          return ticket;
        },
        updateTicketStatus: (id, status) => {
          setTickets((prev) => prev.map(t => t.id === id ? { ...t, status } : t));
        },
        notifications,
        pushNotification: (n) => {
          const notif: AppNotification = { id: `nt-${Date.now()}`, createdAt: new Date(), read: false, ...n };
          setNotifications((prev) => [notif, ...prev].slice(0, 100));
        },
        markNotificationRead: (id) => {
          setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
        },
        openAuthModal,
        closeAuthModal,
        referral,
        setReferral,
        payLater,
        setPayLater,
      }}
    >
      {children}
      {/* Render Auth modal at root so any component can open it */}
      {authModalOpen ? <AuthModal /> : null}
    </AppContext.Provider>
  );
}

// end

import {
  Wallet,
  Gift,
  User,
  ArrowLeft,
  ShoppingCart as CartIcon,
  ListChecks,
  Search,
  Bell,
  Heart,
  Plane,
  UtensilsCrossed,
  Ticket,
  ShoppingBag,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useEffect, useState } from "react";
import GlobalSearch from "./GlobalSearch";

export default function Header() {
  const {
    user,
    wallet,
    rewards,
    currentModule,
    prevPage,
    setCurrentModule,
    setCurrentPage,
    notifications,
    favorites,
    currentPage,
  } = useApp();
  const [cartCount, setCartCount] = useState<number>(0);
  const [openSearch, setOpenSearch] = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const [topup, setTopup] = useState<string>("500");
  const unreadCount = (notifications || []).filter((n) => !n.read).length;
  const wishlistCount = favorites
    ? Object.values(favorites).filter(Boolean).length
    : 0;

  const computeCartCount = () => {
    try {
      let count = 0;
      const foodRaw = localStorage.getItem("foodCart");
      if (foodRaw) {
        const fc = JSON.parse(foodRaw) as unknown;
        if (
          fc &&
          typeof fc === "object" &&
          (fc as Record<string, unknown>).items
        ) {
          const itemsObj = (fc as Record<string, unknown>).items as Record<
            string,
            number
          >;
          count += Object.values(itemsObj).reduce(
            (s: number, v: number) => s + (Number(v) || 0),
            0
          );
        }
      }
      const shopRaw = localStorage.getItem("shoppingCart");
      if (shopRaw) {
        const sc = JSON.parse(shopRaw);
        if (sc && Array.isArray(sc.items)) {
          // items may be duplicated entries; count them
          count += sc.items.length;
        }
      }
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    computeCartCount();
    const handler = () => computeCartCount();
    window.addEventListener("cart-updated", handler as EventListener);
    return () =>
      window.removeEventListener("cart-updated", handler as EventListener);
  }, []);

  const handleBack = () => {
    if (prevPage) {
      // keep module intact when navigating back
      setCurrentPage(prevPage);
    } else {
      setCurrentModule(null);
      setCurrentPage("home");
    }
  };

  const handleWalletClick = () => {
    setCurrentModule("wallet");
    setCurrentPage("wallet-home");
  };

  return (
    <header className="bg-gradient-to-r from-[#0A1D5E] to-[#182B8F] shadow-lg sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: reduced height */}
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className={`p-2 rounded-full transition-colors ${
                prevPage ? "hover:bg-white/10" : "opacity-50 cursor-default"
              }`}
              disabled={!prevPage}
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => {
                setCurrentModule(null);
                setCurrentPage("home");
              }}
              className="flex items-center space-x-2 group"
            >
              <span className="w-8 h-8 rounded-full overflow-hidden shadow ring-1 ring-white/20 inline-flex items-center justify-center">
                <img
                  src="/gozy-logo.png"
                  alt="Gozy logo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    // Fallbacks to existing public assets if new logo not yet added
                    if (img.src.endsWith("/gozy-logo.png"))
                      img.src = "/logo-gozy copy.svg.png";
                    else if (img.src.includes("copy.svg.png"))
                      img.src = "/logo-gozy copy.svg";
                  }}
                />
              </span>
              <span className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors tracking-wide">
                Gozy
              </span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setOpenSearch(true)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleWalletClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-md hover:from-teal-600 hover:to-teal-700 transition-all shadow"
            >
              <Wallet className="w-4 h-4" />
              <span className="font-semibold text-sm">
                ₹{wallet?.balance.toLocaleString()}
              </span>
            </button>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-md shadow">
              <Gift className="w-4 h-4" />
              <span className="font-semibold text-sm">
                {rewards?.points} pts
              </span>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setCurrentPage("wishlist")}
              className="relative p-1.5 hover:bg-white/10 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 text-white" />
              {wishlistCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center badge-pop">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </div>
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={() => setCurrentPage("notifications")}
              className="relative p-1.5 hover:bg-white/10 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-white" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center badge-pop">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </button>

            <button
              onClick={() => {
                try {
                  const foodRaw = localStorage.getItem("foodCart");
                  const shopRaw = localStorage.getItem("shoppingCart");
                  const hasFood = (() => {
                    if (!foodRaw) return false;
                    const fc = JSON.parse(foodRaw);
                    return fc && fc.items && Object.keys(fc.items).length > 0;
                  })();
                  const hasShop = (() => {
                    if (!shopRaw) return false;
                    const sc = JSON.parse(shopRaw);
                    return sc && Array.isArray(sc.items) && sc.items.length > 0;
                  })();
                  if (hasFood) setCurrentPage("food-cart");
                  else if (hasShop) setCurrentPage("shopping-cart");
                  else if (currentModule === "food")
                    setCurrentPage("food-cart");
                  else setCurrentPage("shopping-cart");
                } catch {
                  setCurrentPage("shopping-cart");
                }
              }}
              className="relative p-1.5 hover:bg-white/10 rounded-full transition-colors"
              title="Cart"
            >
              <CartIcon className="w-4 h-4 text-white" />
              {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-amber-400 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </div>
              )}
            </button>

            <button
              onClick={() => setCurrentPage("orders")}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              title="Orders"
            >
              <ListChecks className="w-4 h-4 text-white" />
            </button>

            {user ? (
              <button
                onClick={() => setCurrentPage("profile")}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Profile"
              >
                <User className="w-4 h-4 text-white" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage("signup")}
                  className="px-3 py-1.5 rounded-md bg-white text-[#0A1D5E] font-semibold hover:bg-gray-100"
                >
                  Sign up
                </button>
                <button
                  onClick={() => {
                    try { localStorage.setItem('quickAuthProvider', 'google'); } catch { /* ignore */ }
                    setCurrentPage('signup');
                  }}
                  className="px-2.5 py-1.5 rounded-md bg-red-500 text-white text-xs font-semibold"
                  title="Continue with Google"
                >
                  G
                </button>
                <button
                  onClick={() => {
                    try { localStorage.setItem('quickAuthProvider', 'apple'); } catch { /* ignore */ }
                    setCurrentPage('signup');
                  }}
                  className="px-2.5 py-1.5 rounded-md bg-black text-white text-xs font-semibold"
                  title="Continue with Apple"
                >
                  
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Top modules bar like Airbnb categories */}
      <div className="bg-white/5 backdrop-blur border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="flex justify-start md:justify-center gap-2 sm:gap-3 py-1.5">
            {([
              { id: 'home', label: 'Home', icon: null },
              { id: 'travel', label: 'Travel', icon: Plane },
              { id: 'food', label: 'Food', icon: UtensilsCrossed },
              { id: 'tickets', label: 'Tickets', icon: Ticket },
              { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
            ] as const).map((m) => {
              const active = currentPage.startsWith(m.id);
              const Icon = m.icon as unknown as ((props: { className?: string }) => JSX.Element) | null;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    if (m.id === 'home') { setCurrentModule(null); setCurrentPage('home'); }
                    else { setCurrentModule(m.id as 'travel'|'food'|'tickets'|'shopping'); setCurrentPage(`${m.id}-home`); }
                  }}
                  className={`shrink-0 px-3 sm:px-3.5 py-1 rounded-full text-sm font-semibold transition-all border flex items-center gap-2 ${active ? 'bg-white text-gray-900 border-white shadow-sm' : 'text-white/90 hover:text-white hover:bg-white/10 border-white/20'}`}
                >
                  {Icon ? (
                    <span className={`inline-flex items-center justify-center w-4 h-4 ${active ? 'text-gray-900' : 'text-white/90'} transition-transform ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  ) : null}
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <GlobalSearch open={openSearch} onClose={() => setOpenSearch(false)} />
      {showTopup && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-5">
            <div className="text-lg font-bold mb-2">Add money to Wallet</div>
            <input
              value={topup}
              onChange={(e) => setTopup(e.target.value)}
              type="number"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl mb-3"
              placeholder="Amount (₹)"
            />
            <div className="flex gap-2 mb-4">
              {[200, 500, 1000].map((a) => (
                <button
                  key={a}
                  onClick={() => setTopup(String(a))}
                  className="px-3 py-1.5 text-sm border-2 border-gray-200 rounded-lg"
                >
                  ₹{a}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTopup(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const amt = Math.max(0, Number(topup) || 0);
                  // optimistic wallet credit
                  try {
                    const w = JSON.parse(
                      localStorage.getItem("wallet") || "null"
                    );
                    const updated = w
                      ? { ...w, balance: (w.balance || 0) + amt }
                      : {
                          id: "w1",
                          userId: "1",
                          balance: amt,
                          currency: "INR",
                        };
                    localStorage.setItem("wallet", JSON.stringify(updated));
                    window.location.reload();
                  } catch {
                    /* ignore */
                  }
                }}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white"
              >
                Add ₹{Number(topup || 0).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

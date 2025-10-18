import { useState, useEffect, useRef } from "react";
import {
  Plane,
  UtensilsCrossed,
  Ticket,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Users,
  ShieldCheck,
  Headset,
  ArrowRight,
  CreditCard,
  Gift,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ModuleType } from "../types";
import ImageWithFallback from "./ImageWithFallback";
import CardTile from "./CardTile";
import DealsCarousel from "./DealsCarousel";
import OffersStrip from "./OffersStrip";
import RecentActivity from "./RecentActivity";

const offers = [
  {
    id: 1,
    title: "Flat 20% OFF on Flights",
    subtitle: "Book now and save big on domestic flights",
    color: "from-teal-500 to-cyan-600",
    module: "travel" as const,
    image:
      "https://images.pexels.com/photos/723240/pexels-photo-723240.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 2,
    title: "Free Delivery on Orders Above ₹299",
    subtitle: "Get your favorite food delivered for free",
    color: "from-red-500 to-pink-600",
    module: "food" as const,
    image:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 3,
    title: "Movie Tickets at ₹99",
    subtitle: "Limited time offer on weekend shows",
    color: "from-purple-500 to-indigo-600",
    module: "tickets" as const,
    image:
      "https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 4,
    title: "Big Shopping Sale - Up to 70% OFF",
    subtitle: "Deals on electronics, fashion & more",
    color: "from-orange-500 to-red-600",
    module: "shopping" as const,
    image:
      "https://images.pexels.com/photos/298864/pexels-photo-298864.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
];

const modules = [
  {
    id: "travel",
    name: "Travel",
    icon: Plane,
    description: "Flights, Hotels & Buses",
    color: "from-teal-500 to-cyan-600",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    id: "food",
    name: "Food",
    icon: UtensilsCrossed,
    description: "Order from restaurants",
    color: "from-red-500 to-pink-600",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    id: "tickets",
    name: "Tickets",
    icon: Ticket,
    description: "Movies, Events & Shows",
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: ShoppingBag,
    description: "Shop everything online",
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [particlesReady, setParticlesReady] = useState(false);
  // Hero carousel is always visible on desktop web version
  const { user, setCurrentModule, setCurrentPage } = useApp();
  const [continueChips, setContinueChips] = useState<
    Array<{ id: string; label: string; onClick: () => void }>
  >([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Continue chips based on persisted state across modules
  useEffect(() => {
    const chips: Array<{ id: string; label: string; onClick: () => void }> = [];
    try {
      const travel = localStorage.getItem("travelSearch");
      if (travel) {
        const t = JSON.parse(travel) as Record<string, unknown>;
        const from =
          typeof t.fromLocation === "string" ? t.fromLocation : "From";
        const to = typeof t.toLocation === "string" ? t.toLocation : "To";
        chips.push({
          id: "continue-travel",
          label: `Resume: ${from} → ${to}`,
          onClick: () => {
            setCurrentModule("travel");
            setCurrentPage("travel-flights");
            setTimeout(() => {
              const el = document.getElementById("trend-top");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 0);
          },
        });
      }
      const food = localStorage.getItem("foodCart");
      if (food) {
        const f = JSON.parse(food) as { items?: Record<string, number> };
        const count = f?.items
          ? Object.values(f.items).reduce((a, b) => a + (b || 0), 0)
          : 0;
        if (count > 0) {
          chips.push({
            id: "continue-food",
            label: `Continue food order (${count})`,
            onClick: () => {
              setCurrentModule("food");
              setCurrentPage("food-cart");
            },
          });
        }
      }
      const shop = localStorage.getItem("shoppingCart");
      if (shop) {
        const s = JSON.parse(shop) as { items?: unknown[] };
        const count = Array.isArray(s?.items) ? s.items.length : 0;
        if (count > 0) {
          chips.push({
            id: "continue-shopping",
            label: `Continue shopping (${count})`,
            onClick: () => {
              setCurrentModule("shopping");
              setCurrentPage("shopping-cart");
            },
          });
        }
      }
    } catch {
      /* ignore */
    }
    setContinueChips(chips);
  }, [setCurrentModule, setCurrentPage]);

  // lightweight particles for hero
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return; // respect reduced motion
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    const density = Math.min(40, Math.floor((w * h) / (180 * 180))); // cap for FPS
    const parts = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2,
      vx: (-0.2 + Math.random() * 0.4) * window.devicePixelRatio,
      vy: (0.2 + Math.random() * 0.6) * window.devicePixelRatio,
      a: 0.2 + Math.random() * 0.5,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        ctx.globalAlpha = p.a;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > h) {
          p.y = -10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
      }
      raf = requestAnimationFrame(draw);
    };
    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener("resize", onResize);
    setParticlesReady(true);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % offers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
  };

  // Share current hero gradient with the header/explore via localStorage + event
  useEffect(() => {
    try {
      const grad = offers[currentSlide]?.color || "from-teal-500 to-cyan-600";
      localStorage.setItem("heroGradient", grad);
      window.dispatchEvent(new Event("hero-gradient-changed"));
    } catch {
      /* ignore */
    }
  }, [currentSlide]);
  useEffect(() => {
    // initialize on mount as well
    try {
      const grad = offers[0]?.color || "from-teal-500 to-cyan-600";
      localStorage.setItem("heroGradient", grad);
      window.dispatchEvent(new Event("hero-gradient-changed"));
    } catch {
      /* ignore */
    }
  }, []);

  const handleModuleClick = (moduleId: string) => {
    // If user is not signed in, require signup first
    if (!user) {
      setCurrentPage("signup");
      return;
    }
    setCurrentModule(moduleId as ModuleType);
    setCurrentPage(`${moduleId}-home`);
  };

  const applyOfferForModule = (moduleId: ModuleType) => {
    // Map slides to relevant offers so clicking the banner feels meaningful
    const codeMap: Record<string, string> = {
      travel: "GOFLY300",
      food: "GOZY50",
      tickets: "MOVIE20",
      shopping: "GOZY50",
    };
    const code = codeMap[moduleId as string];
    if (code) {
      try {
        localStorage.setItem("selectedOfferCode", code);
      } catch {
        /* ignore */
      }
    }
  };

  const handleSlideNavigate = (moduleId: ModuleType) => {
    applyOfferForModule(moduleId);
    handleModuleClick(moduleId);
  };

  // Trust stats click handler removed in this version; add back if the section is reintroduced

  // Unified recents across modules
  const [recents, setRecents] = useState<
    Array<{
      id: string;
      type: "travel" | "food" | "shopping" | "tickets";
      label: string;
      sub: string;
      total: number;
      image?: string;
      createdAt?: string;
    }>
  >([]);
  useEffect(() => {
    try {
      const safeParseArray = (key: string): Record<string, unknown>[] => {
        try {
          const raw = JSON.parse(localStorage.getItem(key) || "[]");
          return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
        } catch {
          return [];
        }
      };

      const readStr = (
        obj: Record<string, unknown> | undefined,
        key: string
      ): string | undefined => {
        if (!obj) return undefined;
        const v = obj[key];
        return typeof v === "string" ? v : undefined;
      };

      const readNum = (
        obj: Record<string, unknown> | undefined,
        key: string
      ): number | undefined => {
        if (!obj) return undefined;
        const v = obj[key];
        return typeof v === "number" ? v : undefined;
      };

      const travel = safeParseArray("travelOrderHistory")
        .slice(0, 3)
        .map((o) => {
          const id = readStr(o, "id") || Math.random().toString(36).slice(2);
          const typeStr = readStr(o, "type");
          const item =
            (o["item"] as Record<string, unknown> | undefined) || undefined;
          const sub =
            readStr(item, "airline") ||
            readStr(item, "operator") ||
            readStr(item, "name") ||
            readStr(item, "line") ||
            "Trip";
          const total = readNum(o, "total") || 0;
          // Prefer a sensible image for travel bookings: if flight/train/metro prefer a default
          const rawImage = readStr(item, "image");
          const defaultMap: Record<string, string> = {
            train: "/images/train.jpg",
            bus: "/images/bus.jpg",
            hotel: "/images/hotel.jpg",
          };
          // Flights and metro prefer icons; trains/buses/hotels may use images
          let image = rawImage;
          try {
            if (typeStr && typeStr.toLowerCase().includes("train")) {
              image = rawImage || defaultMap.train;
            } else if (typeStr && typeStr.toLowerCase().includes("bus")) {
              image = rawImage || defaultMap.bus;
            } else if (typeStr && typeStr.toLowerCase().includes("hotel")) {
              image = rawImage || defaultMap.hotel;
            } else {
              // flight or metro or unknown: prefer icon (so leave image undefined when not provided)
              image = rawImage || undefined;
            }
          } catch {
            image = rawImage || undefined;
          }
          const createdAt = readStr(o, "createdAt");
          return {
            id,
            type: "travel" as const,
            label: typeStr ? `${typeStr} booking` : "Travel booking",
            sub,
            total,
            image,
            createdAt,
          };
        });

      const food = safeParseArray("foodOrderHistory")
        .slice(0, 3)
        .map((o) => {
          const id = readStr(o, "id") || Math.random().toString(36).slice(2);
          const restaurant =
            (o["restaurant"] as Record<string, unknown> | undefined) ||
            undefined;
          const itemsObj =
            (o["items"] as Record<string, unknown> | undefined) || undefined;
          const itemsCount = itemsObj ? Object.keys(itemsObj).length : 0;
          const sub = readStr(restaurant, "name") || `${itemsCount} item(s)`;
          const total = readNum(o, "total") || 0;
          const image = readStr(restaurant, "image");
          const createdAt = readStr(o, "createdAt");
          return {
            id,
            type: "food" as const,
            label: "Food order",
            sub,
            total,
            image,
            createdAt,
          };
        });

      const shopping = safeParseArray("shoppingOrderHistory")
        .slice(0, 3)
        .map((o) => {
          const id = readStr(o, "id") || Math.random().toString(36).slice(2);
          const itemsArr = (o["items"] as unknown[] | undefined) || [];
          let thumb: string | undefined;
          if (Array.isArray(itemsArr) && itemsArr.length > 0) {
            const first = itemsArr[0] as Record<string, unknown>;
            const product =
              (first["product"] as Record<string, unknown> | undefined) ||
              undefined;
            thumb =
              product && typeof product["image"] === "string"
                ? (product["image"] as string)
                : undefined;
          }
          const sub = `${itemsArr.length} item(s)`;
          const total = readNum(o, "total") || 0;
          const createdAt = readStr(o, "createdAt");
          return {
            id,
            type: "shopping" as const,
            label: "Shopping order",
            sub,
            total,
            image: thumb,
            createdAt,
          };
        });

      const tickets = safeParseArray("ticketOrderHistory")
        .slice(0, 3)
        .map((o) => {
          const id = readStr(o, "id") || Math.random().toString(36).slice(2);
          const seatsArr = (o["seats"] as unknown[] | undefined) || [];
          const sub = `${seatsArr.length} seat(s)`;
          const total = readNum(o, "total") || 0;
          const showData =
            (o["show"] as Record<string, unknown> | undefined) || undefined;
          const movie =
            (showData?.["movie"] as Record<string, unknown> | undefined) ||
            undefined;
          const image =
            movie && typeof movie["image"] === "string"
              ? (movie["image"] as string)
              : undefined;
          const createdAt = readStr(o, "createdAt");
          return {
            id,
            type: "tickets" as const,
            label: "Tickets booking",
            sub,
            total,
            image,
            createdAt,
          };
        });

      setRecents([...travel, ...food, ...shopping, ...tickets].slice(0, 8));
    } catch {
      /* ignore */
    }
  }, []);
  const handleRepeat = (r: {
    type: "travel" | "food" | "shopping" | "tickets";
    id: string;
  }) => {
    if (r.type === "food") setCurrentModule("food");
    if (r.type === "shopping") setCurrentModule("shopping");
    if (r.type === "tickets") setCurrentModule("tickets");
    if (r.type === "travel") setCurrentModule("travel");
    setCurrentPage(`${r.type}-home`);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-[#F3F0FF] flex flex-col w-full">
      <div className="app-shell py-5 bg-white sm:rounded-2xl flex-1">
        {/* Signup prompt removed per request: logged-out users see Home without signup banner */}

  {/* Myntra-style foreground banner: flat image, crisp object-cover, rounded strip */}
  <div className="relative mb-5 rounded-2xl overflow-hidden shadow-lg h-52 md:h-72 hero-banner">
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
              particlesReady ? "opacity-40" : "opacity-0"
            }`}
          />
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => handleSlideNavigate(offer.module)}
            >
              {/* Foreground banner image only (no gradient overlay) */}
              <img
                src={offer.image}
                alt={offer.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
              {/* Optional centered CTA pill over image */}
              <div className="relative w-full h-full flex items-center justify-center p-4 cursor-pointer">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideNavigate(offer.module);
                  }}
                  className="px-5 py-2 rounded-full font-semibold text-sm bg-white/90 hover:bg-white transition-colors shadow-md text-gray-900 pressable"
                >
                  Shop Now
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? "bg-white w-8" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Top Deals by Module */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-900">Top Deals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Travel */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow hover:shadow-lg transition-all">
              <div className="p-4">
                <div className="text-xs font-bold uppercase text-teal-700 bg-teal-50 inline-block px-2 py-0.5 rounded">Travel</div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">Flat ₹300 OFF Flights</h3>
                <p className="text-sm text-gray-600">Use code GOFLY300 · Today only</p>
                <button onClick={()=> { applyOfferForModule('travel'); handleModuleClick('travel'); }} className="mt-3 px-4 py-2 rounded-full bg-teal-600 text-white hover:bg-teal-700 text-sm">Book Now</button>
              </div>
              <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop" alt="Travel deal" className="w-full h-32 object-cover"/>
            </div>
            {/* Food */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow hover:shadow-lg transition-all">
              <div className="p-4">
                <div className="text-xs font-bold uppercase text-rose-700 bg-rose-50 inline-block px-2 py-0.5 rounded">Food</div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">50% OFF on Meals</h3>
                <p className="text-sm text-gray-600">Use code GOZY50 · New users</p>
                <button onClick={()=> { applyOfferForModule('food'); handleModuleClick('food'); }} className="mt-3 px-4 py-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 text-sm">Order Now</button>
              </div>
              <img src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop" alt="Food deal" className="w-full h-32 object-cover"/>
            </div>
            {/* Tickets */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow hover:shadow-lg transition-all">
              <div className="p-4">
                <div className="text-xs font-bold uppercase text-purple-700 bg-purple-50 inline-block px-2 py-0.5 rounded">Tickets</div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">Movie Tickets at ₹99</h3>
                <p className="text-sm text-gray-600">Weekends · Limited seats</p>
                <button onClick={()=> { applyOfferForModule('tickets'); handleModuleClick('tickets'); }} className="mt-3 px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 text-sm">Book Now</button>
              </div>
              <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop" alt="Tickets deal" className="w-full h-32 object-cover"/>
            </div>
            {/* Shopping - Shoes */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow hover:shadow-lg transition-all">
              <div className="p-4">
                <div className="text-xs font-bold uppercase text-orange-700 bg-orange-50 inline-block px-2 py-0.5 rounded">Shopping</div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">Shoes: Up to 70% OFF</h3>
                <p className="text-sm text-gray-600">Top brands · Festive picks</p>
                <button onClick={()=> { applyOfferForModule('shopping'); handleModuleClick('shopping'); }} className="mt-3 px-4 py-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 text-sm">Shop Now</button>
              </div>
              <img src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop" alt="Shoes deal" className="w-full h-32 object-cover"/>
            </div>
          </div>
        </section>

        {/* Myntra-style deals carousels */}
        <DealsCarousel
          title="Shoes • Up to 70% OFF"
          items={[
            {
              id: 'shoe1',
              title: 'Nike Revolution',
              subtitle: 'Men Running Shoes',
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
              price: 2799,
              badge: '70% OFF',
              cta: 'Shop Now',
              onClick: () => { setCurrentModule('shopping'); setCurrentPage('shopping-category'); }
            },
            {
              id: 'shoe2',
              title: 'Adidas Lite Racer',
              subtitle: 'Casual Sneakers',
              image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
              price: 1999,
              badge: '60% OFF',
              cta: 'Shop Now',
              onClick: () => { setCurrentModule('shopping'); setCurrentPage('shopping-category'); }
            },
            {
              id: 'shoe3',
              title: 'Puma Smash v2',
              subtitle: 'Leather Sneakers',
              image: 'https://images.unsplash.com/photo-1603808033192-27f5b8b9e1c1?q=80&w=800&auto=format&fit=crop',
              price: 2499,
              badge: '50% OFF',
              cta: 'Shop Now',
              onClick: () => { setCurrentModule('shopping'); setCurrentPage('shopping-category'); }
            },
            {
              id: 'shoe4',
              title: 'Campus Street',
              subtitle: 'Everyday Sneakers',
              image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop',
              price: 1299,
              badge: '40% OFF',
              cta: 'Shop Now',
              onClick: () => { setCurrentModule('shopping'); setCurrentPage('shopping-category'); }
            },
          ]}
        />

        <DealsCarousel
          title="Food Deals Near You"
          items={[
            {
              id: 'fd1',
              title: 'Burger Bliss',
              subtitle: 'Buy 1 Get 1',
              image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=800&auto=format&fit=crop',
              price: 'from ₹149',
              badge: 'B1G1',
              cta: 'Order Now',
              onClick: () => { setCurrentModule('food'); setCurrentPage('food-home'); }
            },
            {
              id: 'fd2',
              title: 'Pizza Party',
              subtitle: '50% OFF',
              image: 'https://images.unsplash.com/photo-1548365328-9f547fb09530?q=80&w=800&auto=format&fit=crop',
              price: 'from ₹199',
              badge: '50% OFF',
              cta: 'Order Now',
              onClick: () => { setCurrentModule('food'); setCurrentPage('food-home'); }
            },
            {
              id: 'fd3',
              title: 'Biryani Bonanza',
              subtitle: 'Flat ₹120 OFF',
              image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
              price: 'from ₹179',
              badge: 'FLAT ₹120',
              cta: 'Order Now',
              onClick: () => { setCurrentModule('food'); setCurrentPage('food-home'); }
            },
          ]}
        />

        {/* Sponsor ribbon row (optional) */}
        <div className="mb-6 hidden sm:block">
          <div className="flex items-center justify-between border rounded-2xl px-4 py-2 bg-white/90 overflow-x-auto">
            <div className="flex items-center gap-2 pr-4 mr-4 border-r">
              <span className="text-xs text-gray-500">Associate Sponsor</span>
              <span className="text-sm font-semibold">U.S. POLO ASSN.</span>
            </div>
            <div className="flex items-center gap-2 pr-4 mr-4 border-r">
              <span className="text-xs text-gray-500">Title Sponsor</span>
              <span className="text-sm font-semibold">BIBA</span>
              <span className="text-gray-400">•</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Associate Sponsor</span>
              <span className="text-sm font-semibold">realme</span>
            </div>
          </div>
        </div>

        {/* Continue chips */}
        {continueChips.length > 0 && (
          <div className="mb-4 -mt-2 flex flex-wrap gap-2">
            {continueChips.map((c) => (
              <button
                key={c.id}
                onClick={c.onClick}
                className="px-3 py-1.5 rounded-full border-2 border-brand-200 bg-brand-50 text-brand-700 text-sm btn-sweep"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Pick up where you left off */}
        {recents.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                Pick up where you left off
              </h3>
              <button
                onClick={() => setCurrentPage("recently-viewed")}
                className="text-sm text-brand-600 hover:underline"
              >
                See all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recents.slice(0, 3).map((r) => (
                <button
                  key={`resume_${r.id}`}
                  onClick={() => handleRepeat(r)}
                  className="group p-3 rounded-2xl bg-white border border-gray-200 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={r.label}
                        className="w-14 h-14 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                        {r.type.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {r.label}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {r.sub}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{r.total.toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Explore Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 cards-grid">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module.id)}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300 p-3 text-left border border-gray-200 h-full"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />

                  <div className="relative z-10 flex flex-col h-full">
                    <div
                      className={`${module.bgColor} w-9 h-9 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`w-4 h-4 ${module.iconColor}`} />
                    </div>

                    <h4 className="text-base font-bold text-gray-900 mb-1">
                      {module.name}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {module.description}
                    </p>

                    <div
                      className={`mt-auto pt-1.5 text-sm font-semibold text-brand-600 group-hover:underline`}
                    >
                      Explore →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bank offers strip */}
        <div className="mt-4">
          <OffersStrip
            offers={[
              { code: "GOFLY300", label: "✈️ Flat ₹300 on Flights" },
              { code: "GOZY50", label: "🍔 50% OFF Food" },
              { code: "MOVIE20", label: "🎬 20% OFF Movies" },
              { code: "BANK10", label: "🏦 10% BANK Card Offer" },
            ]}
          />
        </div>

        {/* Recently viewed chips */}
        {recents.length > 0 && (
          <div className="mb-6 -mt-1">
            <div className="text-sm text-gray-500 mb-2 font-semibold">
              Recently Viewed
            </div>
            <div className="flex flex-wrap gap-2">
              {[...new Map(recents.map((r) => [r.label, r])).values()]
                .slice(0, 8)
                .map((r) => (
                  <button
                    key={`chip_${r.id}`}
                    onClick={() => handleRepeat(r)}
                    className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm border border-gray-200"
                    title={`${r.label} • ${r.type}`}
                  >
                    {r.label}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Deals you might like */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-900">
              Deals you might like
            </h2>
            <button
              onClick={() => setCurrentPage("offers")}
              className="text-cyan-500 hover:text-cyan-600 text-sm font-semibold"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 1,
                title: "Goa Getaway",
                subtitle: "Flight + 3N stay",
                image:
                  "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop",
                price: 12999,
                meta: "3 Nights",
              },
              {
                id: 2,
                title: "Biryani Bonanza",
                subtitle: "Up to 50% OFF",
                image:
                  "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
                price: 199,
                meta: "for two",
              },
              {
                id: 3,
                title: "Movie Weekend",
                subtitle: "₹99 Tickets",
                image:
                  "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
                price: 99,
                meta: "limited time",
              },
              {
                id: 4,
                title: "Smart Watch",
                subtitle: "Mega Sale",
                image:
                  "https://gourban.in/cdn/shop/files/Pulse.jpg?v=1749553994&width=1024",
                price: 2999,
                meta: "Best seller",
              },
              {
                id: 5,
                title: "Himalayan Escape",
                subtitle: "Flight + 4N stay",
                image:
                  "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=800&auto=format&fit=crop",
                price: 24999,
                meta: "4 Nights",
              },
              {
                id: 6,
                title: "Pizza Party",
                subtitle: "Buy 1 Get 1",
                image:
                  "https://images.unsplash.com/photo-1548365328-9f547fb09530?q=80&w=800&auto=format&fit=crop",
                price: 399,
                meta: "today only",
              },
              {
                id: 7,
                title: "Wireless Buds",
                subtitle: "Steal Deal",
                image:
                  "https://www.lapcare.com/cdn/shop/files/1_6122ca29-5373-4c4f-97c2-0728ea368fc1.webp?v=1757326029&width=1024",
                price: 1499,
                meta: "Limited stock",
              },
              {
                id: 8,
                title: "Comedy Night",
                subtitle: "20% OFF",
                image:
                  "https://media.indulgexpress.com/indulgexpress/2025-08-19/2t6keqzc/Zakir-Khan?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true",
                price: 299,
                meta: "This week",
              },
            ].map((d) => (
              <CardTile
                key={d.id}
                image={d.image}
                title={d.title}
                subtitle={d.subtitle}
                footerLeft={`₹${Number(d.price).toLocaleString()}`}
                footerRight={d.meta}
                onClick={() => {
                  // Navigate to relevant module by inspecting title heuristically
                  const t = d.title.toLowerCase();
                  if (t.includes("goa") || t.includes("escape"))
                    handleModuleClick("travel");
                  else if (t.includes("biryani") || t.includes("pizza"))
                    handleModuleClick("food");
                  else if (t.includes("movie") || t.includes("comedy"))
                    handleModuleClick("tickets");
                  else handleModuleClick("shopping");
                }}
                accentColor="blue"
              />
            ))}
          </div>
        </section>

        <RecentActivity max={8} showTitle={true} />
        {/* Recents across modules */}
        {recents.length > 0 && (
          <section className="mb-12 mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900 section-title">
                Recently Ordered & Booked
              </h2>
              <button
                onClick={() => setCurrentPage("orders")}
                className="text-cyan-500 hover:text-cyan-600 text-sm font-semibold"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recents.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow hover:shadow-xl transition-all group"
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      {r.type === "food" ? (
                        <div className="w-full h-full flex items-center justify-center bg-rose-50">
                          <UtensilsCrossed className="w-6 h-6 text-rose-600" />
                        </div>
                      ) : r.image ? (
                        <img
                          src={r.image}
                          alt={r.label}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            r.type === "travel"
                              ? "bg-teal-50"
                              : r.type === "tickets"
                              ? "bg-purple-50"
                              : "bg-orange-50"
                          }`}
                        >
                          {r.type === "travel" && (
                            <Plane className="w-6 h-6 text-teal-600" />
                          )}
                          {r.type === "tickets" && (
                            <Ticket className="w-6 h-6 text-purple-600" />
                          )}
                          {r.type === "shopping" && (
                            <ShoppingBag className="w-6 h-6 text-orange-600" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                            r.type === "travel"
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : r.type === "food"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : r.type === "tickets"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}
                        >
                          {r.type}
                        </span>
                        {r.createdAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-gray-900 truncate">
                        {r.label}
                      </div>
                      <div className="text-gray-600 text-sm truncate">
                        {r.sub}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 pb-4 gap-3 flex-wrap">
                    <div className="text-cyan-700 font-extrabold">
                      ₹{r.total.toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleRepeat(r)}
                      className="px-3 py-2 text-sm bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-full font-semibold shadow-sm hover:shadow-md hover:from-teal-600 hover:to-cyan-700 active:scale-[0.98] transition-all w-full md:w-auto"
                    >
                      {r.type === "food" || r.type === "shopping"
                        ? "Order again"
                        : "Book again"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* --- TRENDING DESTINATIONS --- */}
        <section className="mb-12 mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 section-title">
              Trending Destinations
            </h2>
            <button
              onClick={() => handleModuleClick("travel")}
              className="text-cyan-400 hover:text-cyan-500 font-semibold"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cards-grid">
            {[
              {
                id: 1,
                name: "Bali",
                image:
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBRQHY9wJRxI7fMTTydWRLXHmnNbNPanylcQ&s",
                rating: 4.9,
                location: "Indonesia",
                price: 29999,
                duration: "4 Nights",
              },
              {
                id: 2,
                name: "Paris",
                image:
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaNj1sfV1xkv05mg5aa3THujVeaQvOP6SMgg&s",
                rating: 4.8,
                location: "France",
                price: 79999,
                duration: "5 Nights",
              },
              {
                id: 3,
                name: "Maldives",
                image:
                  "https://media1.thrillophilia.com/filestore/x4hn9m7uhrm35dumwpzn5optp9zb_Maldives-Vertical-6.jpg?w=400&dpr=2",
                rating: 4.9,
                location: "South Asia",
                price: 99999,
                duration: "6 Nights",
              },
            ].map((dest) => (
              <CardTile
                key={dest.id}
                image={dest.image}
                title={dest.name}
                subtitle={dest.location}
                rating={dest.rating}
                footerLeft={`₹${dest.price.toLocaleString()}`}
                footerRight={dest.duration}
                onClick={() => handleModuleClick("travel")}
                accentColor="cyan"
              />
            ))}
          </div>
        </section>

        {/* --- TOP RESTAURANTS --- */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 section-title">
              Top Restaurants
            </h2>
            <button
              onClick={() => handleModuleClick("food")}
              className="text-green-400 hover:text-green-500 font-semibold"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cards-grid">
            {[
              {
                id: 1,
                name: "Spice Villa",
                image:
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgMcbvAycHdFQmDr39ACeLzJwuCFjITh1pkw&s",
                rating: 4.8,
                cuisine: "Indian, Biryani",
                price: "₹250 for two",
              },
              {
                id: 2,
                name: "Urban Bites",
                image:
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3x_4hfG_uZSxpG89KbEo1jwyzk5jfvTGo7w&s",
                rating: 4.6,
                cuisine: "Continental, Fast Food",
                price: "₹350 for two",
              },
              {
                id: 3,
                name: "Tandoor Flame",
                image:
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc5qEhbJ_X3WcNra3ySZNGeGvIpwXmBG0_7A&s",
                rating: 4.9,
                cuisine: "North Indian",
                price: "₹300 for two",
              },
            ].map((res) => (
              <CardTile
                key={res.id}
                image={res.image}
                title={res.name}
                subtitle={res.cuisine}
                rating={res.rating}
                footerLeft={res.price}
                onClick={() => handleModuleClick("food")}
                accentColor="emerald"
              />
            ))}
          </div>
        </section>

        {/* --- FEATURED PRODUCTS --- */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 section-title">
              Featured Products
            </h2>
            <button
              onClick={() => handleModuleClick("shopping")}
              className="text-pink-400 hover:text-pink-500 font-semibold"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cards-grid">
            {[
              {
                id: 1,
                name: "Wireless Headphones",
                image:
                  "https://www.lapcare.com/cdn/shop/files/1_6122ca29-5373-4c4f-97c2-0728ea368fc1.webp?v=1757326029&width=2048",
                price: 2499,
                rating: 4.7,
                info: "Wireless, 20h battery",
              },
              {
                id: 2,
                name: "Smart Watch",
                image:
                  "https://gourban.in/cdn/shop/files/Pulse.jpg?v=1749553994&width=2048",
                price: 4999,
                rating: 4.5,
                info: "AMOLED, SpO₂",
              },
              {
                id: 3,
                name: "Running Shoes",
                image:
                  "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/6b88cd96-20c5-43c1-8645-38d1aaac0946/PEGASUS+EASYON.png",
                price: 2999,
                rating: 4.6,
                info: "Lightweight, breathable",
              },
            ].map((prod) => (
              <CardTile
                key={prod.id}
                image={prod.image}
                title={prod.name}
                subtitle={`₹${prod.price.toLocaleString()} • ${prod.info}`}
                rating={prod.rating}
                onClick={() => handleModuleClick("shopping")}
                accentColor="pink"
              />
            ))}
          </div>
        </section>

        {/* --- UPCOMING EVENTS --- */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 section-title">
              Upcoming Events
            </h2>
            <button
              onClick={() => handleModuleClick("tickets")}
              className="text-purple-400 hover:text-purple-500 font-semibold"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cards-grid">
            {[
              {
                id: 1,
                name: "AR Rahman Live Concert",
                image:
                  "https://res.klook.com/images/fl_lossy.progressive,q_65/c_fill,w_1200,h_630/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/f3iiubkbbgub3dcgwzkc/AR%20Rahman%20Live%20in%20Kuala%20Lumpur%202024.jpg",
                date: "Nov 12, 2025",
                location: "Hyderabad",
              },
              {
                id: 2,
                name: "Comedy Night with Zakir Khan",
                image:
                  "https://media.indulgexpress.com/indulgexpress/2025-08-19/2t6keqzc/Zakir-Khan?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true",
                date: "Oct 28, 2025",
                location: "Bangalore",
              },
              {
                id: 3,
                name: "Tech Fest 2025",
                image: "https://pbs.twimg.com/media/GzV30D5XEAA2ADb.jpg",
                date: "Dec 5, 2025",
                location: "Mumbai",
              },
            ].map((evt) => (
              <div
                key={evt.id}
                onClick={() => handleModuleClick("tickets")}
                className="bg-white rounded-2xl shadow overflow-hidden cursor-pointer transform hover:scale-105 transition-all border border-gray-200"
              >
                <div className="relative h-48">
                  <ImageWithFallback
                    src={evt.image}
                    alt={evt.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2 text-gray-900">
                    {evt.name}
                  </h3>
                  <p className="text-gray-700">{evt.date}</p>
                  <p className="text-gray-500 text-sm">{evt.location}</p>
                </div>
              </div>
            ))}
          </div>
          {/* --- WHY CHOOSE GOZY (FEATURE CARDS) --- */}
          <section className="mb-16 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: "ops",
                  icon: Plane,
                  accent: "text-emerald-700",
                  accentBg: "bg-emerald-50",
                  headline: "500+",
                  title: "Airlines & Operators",
                  body: "Compare options across domestic and international networks.",
                  cta: "Browse flights",
                  onClick: () => handleModuleClick("travel"),
                },
                {
                  id: "happy",
                  icon: Users,
                  accent: "text-emerald-700",
                  accentBg: "bg-emerald-50",
                  headline: "10M+",
                  title: "Happy Travelers",
                  body: "Trusted by a growing community with 4.8★ average rating.",
                  cta: "Plan your trip",
                  onClick: () => handleModuleClick("travel"),
                },
                {
                  id: "price",
                  icon: ShieldCheck,
                  accent: "text-indigo-700",
                  accentBg: "bg-indigo-50",
                  headline: "Best Price",
                  title: "Guaranteed",
                  body: "Use in-app offers to unlock extra savings on checkout.",
                  cta: "View offers",
                  onClick: () => {
                    applyOfferForModule("travel");
                    handleModuleClick("travel");
                  },
                },
                {
                  id: "support",
                  icon: Headset,
                  accent: "text-rose-700",
                  accentBg: "bg-rose-50",
                  headline: "24x7",
                  title: "Customer Support",
                  body: "Get help anytime via chat for bookings, refunds, and more.",
                  cta: "Get support",
                  onClick: () => handleModuleClick("tickets"),
                },
                {
                  id: "secure",
                  icon: CreditCard,
                  accent: "text-cyan-700",
                  accentBg: "bg-cyan-50",
                  headline: "Secure",
                  title: "Payments",
                  body: "PCI-compliant processing with multiple payment options.",
                  cta: "Pay securely",
                  onClick: () => handleModuleClick("shopping"),
                },
                {
                  id: "rewards",
                  icon: Gift,
                  accent: "text-amber-700",
                  accentBg: "bg-amber-50",
                  headline: "Rewards",
                  title: "On Every Order",
                  body: "Earn points on each purchase and redeem for discounts.",
                  cta: "View rewards",
                  onClick: () =>
                    handleModuleClick("wallet" as unknown as string),
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-2xl shadow border border-gray-200 p-6 hover:shadow-lg transition-all h-full"
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-10 h-10 ${card.accentBg} rounded-xl flex items-center justify-center shrink-0`}
                        >
                          <Icon className={`w-6 h-6 ${card.accent}`} />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-2xl font-extrabold ${card.accent}`}
                          >
                            {card.headline}
                          </div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {card.title}
                          </div>
                          <div className="text-gray-600 mt-1 text-sm leading-relaxed">
                            {card.body}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={card.onClick}
                        className={`mt-3 inline-flex items-center gap-1 font-semibold ${card.accent} hover:opacity-90`}
                      >
                        {card.cta} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

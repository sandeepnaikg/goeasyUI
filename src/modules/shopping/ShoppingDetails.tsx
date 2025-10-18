import { useEffect, useMemo, useState } from "react";
import { Download, Share2, Heart, Bell } from "lucide-react";
import TrustBadges from "../../components/TrustBadges";
import { useApp } from "../../context/AppContext";
import ImageWithFallback from "../../components/ImageWithFallback";
import CompareModal from "../../components/CompareModal";
import { SkeletonLine } from "../../components/Skeleton";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
};

export default function ShoppingDetails() {
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<{ color?: string; size?: string }>({});
  const [showQA, setShowQA] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [showWarranty, setShowWarranty] = useState(false);
  const [, setCompare] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("compareList") || "[]");
    } catch {
      return [];
    }
  });
  const [showCompare, setShowCompare] = useState(false);
  const app = useApp();
  const { setCurrentPage, favorites, setFavorite } = app;
  const { pushNotification } = app as {
    pushNotification: (arg: {
      module:
        | "offers"
        | "system"
        | "wallet"
        | "travel"
        | "food"
        | "tickets"
        | "shopping";
      title: string;
      message: string;
    }) => void;
  };

  useEffect(() => {
    const data = localStorage.getItem("selectedProduct");
    if (data) setProduct(JSON.parse(data) as Product);
  }, []);

  const aboutBullets = useMemo(() => {
    if (!product) return [] as string[];
    // Provide rich, generic details tuned for electronics/fashion; can be extended per-category later
    const common: string[] = [
      "Brand warranty and GST invoice included",
      "7‑day easy replacement from delivery date",
      "Free standard shipping for GoZy Plus members",
      "Dedicated 24x7 chat support via Profile → Help",
    ];

    if (product.name.toLowerCase().includes("iphone")) {
      return [
        "A17 Pro chip with 6‑core GPU for console‑level gaming",
        "48MP main camera, 12MP ultra‑wide, 4K Dolby Vision video",
        "ProMotion 120Hz Super Retina XDR display with Dynamic Island",
        "USB‑C fast charging, up to 23 hours video playback",
        ...common,
      ];
    }
    if (product.category.toLowerCase().includes("audio")) {
      return [
        "Industry‑leading Active Noise Cancellation (ANC)",
        "Up to 30 hours battery life with quick charge",
        "Multipoint Bluetooth with low‑latency mode",
        "Carrying case and USB‑C cable included",
        ...common,
      ];
    }
    if (product.category.toLowerCase().includes("fashion")) {
      return [
        "Premium fabric with tailored modern fit",
        "Breathable, all‑season comfort wear",
        "Easy care: machine washable, color‑fast",
        "Size exchange available at no extra cost",
        ...common,
      ];
    }
    return [
      "Premium build quality and reliable performance",
      "Energy‑efficient with low maintenance",
      "Comprehensive user manual and quick start guide",
      "Secure packaging to prevent transit damage",
      ...common,
    ];
  }, [product]);

  if (!product)
    return (
      <div className="min-h-screen bg-white">
  <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="w-full h-72 bg-gray-200 rounded-2xl animate-pulse" />
              </div>
              <div className="md:col-span-2">
                <SkeletonLine width="60%" height={24} />
                <div className="mt-2">
                  <SkeletonLine width="30%" height={16} />
                </div>
                <div className="mt-4 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonLine
                      key={i}
                      width={`${90 - i * 10}%`}
                      height={12}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  const handleAddToCart = () => {
    const cartRaw = localStorage.getItem("shoppingCart");
    const cart = cartRaw ? JSON.parse(cartRaw) : { items: [], total: 0 };
    cart.items = cart.items || [];
    cart.items.push(product);
    cart.total = (cart.total || 0) + product.price;
    localStorage.setItem("shoppingCart", JSON.stringify(cart));
    setCurrentPage("shopping-cart");
  };

  const handleShare = async () => {
    if (!product) return;
    const text = `Check out ${
      product.name
    } on GoZy - ₹${product.price.toLocaleString()}\n${product.category}`;
    try {
      const nav = navigator as unknown as {
        share?: (data: {
          title?: string;
          text?: string;
          url?: string;
        }) => Promise<void>;
      };
      if (typeof nav.share === "function") {
        await nav.share({ title: product.name, text });
      } else {
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${product.id}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("share failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-28">
  <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-72 object-cover rounded-2xl"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold mb-2 text-gray-900">
                  {product.name}
                </h1>
                <button
                  onClick={() =>
                    setFavorite(
                      `product:${product.id}`,
                      !favorites[`product:${product.id}`]
                    )
                  }
                  className={`p-2 rounded-full bg-gradient-to-r ${
                    favorites[`product:${product.id}`]
                      ? "from-rose-500 to-pink-600 text-white"
                      : "from-gray-100 to-gray-200 text-gray-800"
                  }`}
                  aria-label="Favorite"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites[`product:${product.id}`] ? "fill-white" : ""
                    }`}
                  />
                </button>
              </div>
              <div className="text-sm text-gray-600 mb-1">
                {product.category}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString()}
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  Price dropped recently
                </span>
              </div>
              {/* Variants */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">
                    Color
                  </div>
                  <div className="flex gap-2">
                    {["Black", "Blue", "Red"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setVariant((v) => ({ ...v, color: c }))}
                        className={`px-3 py-1.5 rounded-full border text-xs ${
                          variant.color === c
                            ? "bg-gray-900 text-white border-gray-900"
                            : "border-gray-300"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">
                    Size
                  </div>
                  <div className="flex gap-2">
                    {["S", "M", "L", "XL"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setVariant((v) => ({ ...v, size: s }))}
                        className={`px-3 py-1.5 rounded-full border text-xs ${
                          variant.size === s
                            ? "bg-gray-900 text-white border-gray-900"
                            : "border-gray-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                {product.description || "Product details and features go here."}
              </p>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold pressable"
                >
                  Add to Cart
                </button>
                <div className="text-xs text-gray-700">
                  Delivery by{" "}
                  <span className="font-semibold">
                    {new Date(Date.now() + 3 * 86400000)
                      .toISOString()
                      .slice(0, 10)}
                  </span>
                </div>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-white border rounded-xl flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => {
                    if (!product) return;
                    // Save basic alert and push a confirm notification
                    const alertsRaw = localStorage.getItem("priceAlerts");
                    const alerts = alertsRaw ? JSON.parse(alertsRaw) : [];
                    alerts.unshift({
                      id: `pa-${Date.now()}`,
                      type: "product",
                      pid: product.id,
                      price: product.price,
                    });
                    localStorage.setItem(
                      "priceAlerts",
                      JSON.stringify(alerts.slice(0, 100))
                    );
                    pushNotification({
                      module: "offers",
                      title: "Price alert set",
                      message: `We will alert if ${product.name} drops in price`,
                    });
                  }}
                  className="px-4 py-2 bg-white border rounded-xl flex items-center space-x-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Set price alert</span>
                </button>
                <button
                  onClick={() => {
                    if (!product) return;
                    const txt = `Product: ${product.name}\nPrice: ₹${product.price}\nCategory: ${product.category}`;
                    const blob = new Blob([txt], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `product-${product.id}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-white border rounded-xl flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            About this item
          </h2>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            {aboutBullets.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
          {/* Ratings Histogram */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Ratings</h3>
            <div className="space-y-1 text-sm">
              {[5, 4, 3, 2, 1].map((st) => (
                <div key={st} className="flex items-center gap-2">
                  <span className="w-10">{st}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-emerald-500 rounded"
                      style={{ width: `${Math.max(5 - st, 1) * 15}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q&A */}
          <div className="mt-6">
            <button
              onClick={() => setShowQA((s) => !s)}
              className="text-sm underline text-teal-700"
            >
              {showQA ? "Hide" : "Show"} Q&A
            </button>
            {showQA && (
              <div className="mt-2 space-y-2 text-sm text-gray-700">
                <div>
                  <div className="font-medium">
                    Q: Does it come with warranty?
                  </div>
                  <div>A: Yes, one-year manufacturer warranty included.</div>
                </div>
                <div>
                  <div className="font-medium">
                    Q: Is this compatible with iOS and Android?
                  </div>
                  <div>A: Yes, fully compatible with recent versions.</div>
                </div>
              </div>
            )}
            <div className="mt-4">
              <TrustBadges context="detail" />
            </div>
          </div>

          {/* What's in the box */}
          <div className="mt-6">
            <button
              onClick={() => setShowBox((s) => !s)}
              className="text-sm underline text-teal-700"
            >
              {showBox ? "Hide" : "Show"} What’s in the box
            </button>
            {showBox && (
              <ul className="mt-2 list-disc ml-6 text-sm text-gray-700 space-y-1">
                <li>Main product unit</li>
                <li>Charging cable / power adapter</li>
                <li>User manual & warranty card</li>
                <li>Accessory pack (if applicable)</li>
              </ul>
            )}
          </div>

          {/* Warranty */}
          <div className="mt-4">
            <button
              onClick={() => setShowWarranty((s) => !s)}
              className="text-sm underline text-teal-700"
            >
              {showWarranty ? "Hide" : "Show"} Warranty
            </button>
            {showWarranty && (
              <div className="mt-2 text-sm text-gray-700">
                <div>
                  1-year manufacturer warranty against manufacturing defects.
                </div>
                <div>
                  Exchange/repair handled by authorized service centers.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Sticky ATC bar */}
      <div className="fixed bottom-16 left-0 right-0 md:hidden">
        <div className="mx-4 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </div>
          <button
            onClick={handleAddToCart}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold pressable"
          >
            Add to Cart
          </button>
        </div>
      </div>
      {/* Compare bar */}
      <div className="fixed bottom-16 inset-x-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white border rounded-2xl shadow p-3 flex items-center gap-3">
          <button
            onClick={() => {
              if (!product) return;
              setCompare((prev) => {
                const next = prev.includes(product.id)
                  ? prev
                  : [...prev, product.id].slice(-3);
                // persist ids for legacy key
                localStorage.setItem("compareList", JSON.stringify(next));
                // also persist full product payloads for modal
                try {
                  const raw = localStorage.getItem("compareItems");
                  const arr: Product[] = raw ? JSON.parse(raw) : [];
                  const exists = arr.find((a) => a.id === product.id);
                  const updated = exists ? arr : [...arr, product].slice(-3);
                  localStorage.setItem("compareItems", JSON.stringify(updated));
                } catch {
                  /* ignore */
                }
                return next;
              });
            }}
            className="px-3 py-1.5 text-sm rounded-lg border"
          >
            Add to Compare
          </button>
          <button
            onClick={() => setShowCompare(true)}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white"
          >
            View Compare
          </button>
          <button
            onClick={() => {
              setCompare([]);
              localStorage.setItem("compareList", "[]");
            }}
            className="px-3 py-1.5 text-sm rounded-lg border"
          >
            Clear
          </button>
        </div>
      </div>
      <CompareModal open={showCompare} onClose={() => setShowCompare(false)} />
    </div>
  );
}

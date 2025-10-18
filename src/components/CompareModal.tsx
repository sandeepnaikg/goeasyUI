import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { useApp } from "../context/AppContext";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CompareModal({ open, onClose }: Props) {
  const { setCurrentPage } = useApp();
  const [items, setItems] = useState<Product[]>([]);
  const [diffOnly, setDiffOnly] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem("compareItems");
      const arr = raw ? (JSON.parse(raw) as Product[]) : [];
      setItems(Array.isArray(arr) ? arr.slice(0, 3) : []);
    } catch {
      setItems([]);
    }
  }, [open]);

  const specs = (p: Product) => {
    const bullets: string[] = [];
    const name = p.name.toLowerCase();
    if (
      name.includes("iphone") ||
      p.category.toLowerCase().includes("electronics")
    ) {
      bullets.push("Warranty included");
      bullets.push("Free delivery");
      bullets.push("Easy returns");
    } else if (p.category.toLowerCase().includes("gaming")) {
      bullets.push("Latest launch");
      bullets.push("Top ratings");
      bullets.push("COD available");
    } else if (p.category.toLowerCase().includes("kids")) {
      bullets.push("Safe materials");
      bullets.push("Age 3+");
      bullets.push("Fast shipping");
    } else if (
      p.category.toLowerCase().includes("medical") ||
      p.category.toLowerCase().includes("daily")
    ) {
      bullets.push("FSSAI approved");
      bullets.push("Fresh stock");
      bullets.push("Expiry checked");
    } else {
      bullets.push("Popular pick");
      bullets.push("Best value");
      bullets.push("Fast shipping");
    }
    return bullets.slice(0, 3);
  };

  // compute comparable spec set (mock categories for UI-only)
  const specMap = (p: Product): Record<string, string> => ({
    Warranty: p.category.toLowerCase().includes("electronics")
      ? "1 year"
      : "6 months",
    Delivery: "Free",
    Returns: "7 days",
  });

  const removeItem = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    try {
      const raw = localStorage.getItem("compareItems");
      const arr: Product[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(
        "compareItems",
        JSON.stringify(arr.filter((i) => i.id !== id))
      );
      // also keep legacy key in sync
      const rawIds = localStorage.getItem("compareList");
      const ids: string[] = rawIds ? JSON.parse(rawIds) : [];
      localStorage.setItem(
        "compareList",
        JSON.stringify(ids.filter((x) => x !== id))
      );
    } catch {
      /* ignore */
    }
  };

  const goToItem = (p: Product) => {
    try {
      localStorage.setItem("selectedProduct", JSON.stringify(p));
    } catch {
      /* ignore */
    }
    setCurrentPage("shopping-details");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold">Compare products</div>
            {items.length > 1 && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={diffOnly}
                  onChange={(e) => setDiffOnly(e.target.checked)}
                />
                Differences only
              </label>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close compare"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="p-6 text-gray-600">
            No items in compare. Add up to 3 products to compare key specs.
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-xl overflow-hidden bg-white"
                >
                  <div className="relative h-36 bg-gray-50">
                    <ImageWithFallback
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeItem(p.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white"
                      aria-label="Remove from compare"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-0.5">
                      {p.category}
                    </div>
                    <div className="font-semibold line-clamp-2 mb-1">
                      {p.name}
                    </div>
                    <div className="text-lg font-bold">
                      ₹{p.price.toLocaleString()}
                    </div>
                    <ul className="mt-2 text-sm text-gray-700 list-disc ml-5 space-y-1">
                      {specs(p).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => goToItem(p)}
                      className="mt-3 w-full px-3 py-2 bg-gray-900 text-white rounded-lg text-sm"
                    >
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Spec comparison */}
            {items.length > 1 && (
              <div className="mt-4 overflow-auto">
                <table className="w-full text-sm border-t">
                  <thead className="sticky top-0 bg-white">
                    <tr>
                      <th className="text-left p-2 font-semibold text-gray-700">
                        Spec
                      </th>
                      {items.map((p) => (
                        <th
                          key={`h-${p.id}`}
                          className="text-left p-2 font-semibold text-gray-700"
                        >
                          {p.name.split(" ").slice(0, 3).join(" ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(["Warranty", "Delivery", "Returns"] as const).map((k) => {
                      const values = items.map((p) => specMap(p)[k]);
                      const allSame = values.every((v) => v === values[0]);
                      if (diffOnly && allSame) return null;
                      return (
                        <tr key={k} className={!allSame ? "bg-amber-50" : ""}>
                          <td className="p-2 text-gray-600 w-28">{k}</td>
                          {items.map((p, i) => (
                            <td key={`${k}-${p.id}`} className="p-2">
                              {values[i]}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

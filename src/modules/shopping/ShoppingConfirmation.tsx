import { useEffect, useState } from "react";
import { CheckCircle, Share2 } from "lucide-react";
import { useApp } from "../../context/AppContext";

type Order = {
  id: string;
  items: { id: string; name: string; price: number; image?: string }[];
  total: number;
  status: string;
  trackingNumber?: string;
};

export default function ShoppingConfirmation() {
  const [order, setOrder] = useState<Order | null>(null);
  const { setCurrentPage } = useApp();

  const handleShare = async () => {
    if (!order) return;
    const text = `Order ${order.id} - Total: ₹${
      order.total
    }\nItems: ${order.items.map((i) => i.name).join(", ")}`;
    try {
      const nav = navigator as unknown as {
        share?: (data: {
          title?: string;
          text?: string;
          url?: string;
        }) => Promise<void>;
      };
      if (typeof nav.share === "function") {
        await nav.share({ title: "My GoZy Order", text });
      } else {
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `order-${order.id}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  useEffect(() => {
    const data = localStorage.getItem("lastShoppingOrder");
    if (data) setOrder(JSON.parse(data) as Order);
  }, []);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Your order <span className="font-semibold">{order.id}</span> is
            confirmed.
          </p>
          <div className="mb-6">
            <div className="text-sm text-gray-500">Tracking Number</div>
            <div className="font-bold text-lg">{order.trackingNumber}</div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setCurrentPage("shopping-tracking")}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold"
            >
              Track Order
            </button>
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-white border rounded-xl flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import ImageWithFallback from "../../components/ImageWithFallback";
import ErrorBlock from "../../components/ErrorBlock";
import StepIndicator from "../../components/StepIndicator";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type Cart = {
  items: CartItem[];
  total: number;
};

export default function ShoppingCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const { setCurrentPage } = useApp();

  useEffect(() => {
    const data = localStorage.getItem("shoppingCart");
    if (data) setCart(JSON.parse(data) as Cart);
  }, []);

  if (!cart || cart.items.length === 0)
    return (
      <div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-4">
            <StepIndicator
              steps={["Browse", "Cart", "Payment", "Confirm"]}
              current={1}
            />
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <ErrorBlock
              title="Your cart is empty"
              message="Browse categories or search for products and add them to your cart."
              action={
                <button
                  onClick={() => setCurrentPage("shopping-home")}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl"
                >
                  Browse Products
                </button>
              }
            />
          </div>
        </div>
      </div>
    );

  const handleCheckout = () => {
    localStorage.setItem(
      "shoppingOrder",
      JSON.stringify({ items: cart.items, total: cart.total })
    );
    setCurrentPage("shopping-payment");
  };

  const updateLocalCart = (updated: Cart) => {
    setCart(updated);
    localStorage.setItem("shoppingCart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const increase = (index: number) => {
    const items = [...cart.items];
    const it = items[index];
    items[index] = { ...it };
    // convert to quantity by duplicating entries is not ideal; instead keep as list and allow duplicates
    items.push(it);
    const total = items.reduce((s, it) => s + it.price, 0);
    updateLocalCart({ items, total });
  };

  const removeAt = (index: number) => {
    const items = cart.items.filter((_, i) => i !== index);
    const total = items.reduce((s, it) => s + it.price, 0);
    updateLocalCart({ items, total });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
  <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-3">
          <StepIndicator
            steps={["Browse", "Cart", "Payment", "Confirm"]}
            current={1}
          />
        </div>
        <h1 className="text-2xl font-bold mb-6">Cart</h1>
        <div className="space-y-4 mb-6">
          {cart.items.map((it, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 shadow flex items-center space-x-4"
            >
              <ImageWithFallback
                src={it.image}
                alt={it.name}
                className="w-20 h-20 object-cover rounded-md"
              />
              <div className="flex-1">
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-gray-600">
                  ₹{it.price.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => increase(idx)}
                  className="px-3 py-1 bg-gray-100 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeAt(idx)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          {/* Savings summary and coupon */}
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
            You saved ₹{Math.min(200, Math.round(cart.total * 0.05))} today.{" "}
            <button
              onClick={() => setShowCoupons(true)}
              className="underline font-semibold"
            >
              View coupons
            </button>{" "}
            or apply at payment.
          </div>
          {/* Free delivery threshold */}
          <div className="mb-4">
            <div className="text-sm text-gray-700">Free delivery at ₹1499</div>
            {(() => {
              const cap = 1499;
              const pct = Math.min(100, Math.round((cart.total / cap) * 100));
              return (
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-2 bg-gradient-to-r from-orange-500 to-red-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              );
            })()}
            {cart.total < 1499 && (
              <div className="text-xs text-gray-600 mt-1">
                Add ₹{(1499 - cart.total).toLocaleString()} more for free
                delivery
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">Total</div>
            <div className="text-2xl font-bold">
              ₹{cart.total.toLocaleString()}
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl pressable"
          >
            Proceed to Pay
          </button>
        </div>
      </div>

      {/* Coupon Drawer */}
      {showCoupons && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 flex items-end"
          onClick={() => setShowCoupons(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-12 bg-gray-300 rounded mx-auto mb-3" />
            <div className="text-lg font-bold mb-2">Apply a coupon</div>
            <div className="space-y-2">
              {[
                { code: "GOZY50", desc: "Flat ₹50 off on any order" },
                { code: "FREESHIP", desc: "Free delivery above ₹999" },
                { code: "SAVE10", desc: "10% off up to ₹200" },
              ].map((c) => (
                <div
                  key={c.code}
                  className="border rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">{c.code}</div>
                    <div className="text-sm text-gray-600">{c.desc}</div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem("selectedOfferCode", c.code);
                      window.dispatchEvent(
                        new CustomEvent("toast", {
                          detail: {
                            type: "success",
                            message: `${c.code} applied`,
                          },
                        })
                      );
                      setShowCoupons(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm pressable"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

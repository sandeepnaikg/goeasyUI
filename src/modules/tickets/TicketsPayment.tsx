import { useState, useEffect } from "react";
import { Popcorn, CupSoda, Coffee } from "lucide-react";
import PaymentPage from "../../components/PaymentPage";
import { useApp } from "../../context/AppContext";

export default function TicketsPayment() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [showCombos, setShowCombos] = useState(false);
  const [snacks, setSnacks] = useState<
    {
      id: string;
      name: string;
      price: number;
      qty: number;
      icon: "popcorn" | "soda" | "coffee";
      cals?: number;
      tag?: string;
      img?: string;
    }[]
  >([]);
  const {
    setCurrentPage,
    wallet,
    setWallet,
    walletTransactions,
    setWalletTransactions,
    rewardActivities,
    setRewardActivities,
    rewards,
    setRewards,
    addRecentlyViewed,
    payLater,
    setPayLater,
    referral,
    setReferral,
    pushNotification,
  } = useApp();

  useEffect(() => {
    const seatsData = JSON.parse(localStorage.getItem("selectedSeats") || "{}");
    const base = seatsData.total || 0;
    setTotalAmount(base);
    // initialize snack combos (quantity 0 by default)
    const lastCombosRaw = localStorage.getItem("lastTicketCombos");
    const lastCombos: Record<string, number> | null = lastCombosRaw
      ? JSON.parse(lastCombosRaw)
      : null;
    const initial: {
      id: string;
      name: string;
      price: number;
      qty: number;
      icon: "popcorn" | "soda" | "coffee";
      cals?: number;
      tag?: string;
      img?: string;
    }[] = [
      {
        id: "combo-popcorn",
        name: "Popcorn Bucket",
        price: 180,
        qty: lastCombos?.["combo-popcorn"] || 0,
        icon: "popcorn",
        cals: 420,
        tag: "Best value",
        img: "https://images.unsplash.com/photo-1512003867696-6d0678b1f01e?q=80&w=400&auto=format&fit=crop",
      },
      {
        id: "combo-soda",
        name: "Soda (500ml)",
        price: 90,
        qty: lastCombos?.["combo-soda"] || 0,
        icon: "soda",
        cals: 210,
        tag: "Chill",
        img: "https://images.unsplash.com/photo-1563371206-5befe8a4f8c1?q=80&w=400&auto=format&fit=crop",
      },
      {
        id: "combo-coffee",
        name: "Hot Coffee",
        price: 120,
        qty: lastCombos?.["combo-coffee"] || 0,
        icon: "coffee",
        cals: 110,
        tag: "Warm",
        img: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=400&auto=format&fit=crop",
      },
    ];
    setSnacks(initial);
  }, []);

  const snacksTotal = snacks.reduce((s, it) => s + it.price * (it.qty || 0), 0);
  const payable = (totalAmount || 0) + snacksTotal;

  // inline summary label for selected snacks
  const selectedCount = snacks.reduce((n, s) => n + (s.qty > 0 ? 1 : 0), 0);
  const summaryLabel =
    selectedCount > 0
      ? `${selectedCount} item${selectedCount > 1 ? "s" : ""} · ₹${snacksTotal}`
      : "None selected";

  const handlePaymentSuccess = (details: {
    paymentMethod: string;
    discount: number;
    finalAmount: number;
    rewardsEarned: number;
  }) => {
    try {
      const seatsData = JSON.parse(
        localStorage.getItem("selectedSeats") || "{}"
      );
      const showData = seatsData.showData || null;
      const order = {
        id: `TORD-${Date.now()}`,
        total: details.finalAmount || payable || seatsData.total || 0,
        addons: snacks
          .filter((s) => s.qty > 0)
          .map((s) => ({ id: s.id, name: s.name, qty: s.qty, price: s.price })),
        seats: seatsData.seats || [],
        show: showData,
        createdAt: new Date().toISOString(),
        status: "confirmed",
      };
      localStorage.setItem("lastTicketOrder", JSON.stringify(order));
      const histRaw = localStorage.getItem("ticketOrderHistory");
      const hist = histRaw ? JSON.parse(histRaw) : [];
      hist.unshift(order);
      localStorage.setItem(
        "ticketOrderHistory",
        JSON.stringify(hist.slice(0, 50))
      );
      // recently viewed/booked movie
      try {
        if (showData?.movie?.title) {
          addRecentlyViewed({
            id: `movie-${Date.now()}`,
            type: "tickets",
            title: showData.movie.title,
            image: showData.movie.image,
          });
        }
      } catch {
        /* ignore */
      }
      // wallet & rewards
      if (details.paymentMethod === "wallet" && wallet) {
        const updated = {
          ...wallet,
          balance: wallet.balance - details.finalAmount,
        };
        setWallet(updated);
        localStorage.setItem("wallet", JSON.stringify(updated));
        const tx = {
          id: `tx-${Date.now()}`,
          walletId: wallet.id,
          amount: details.finalAmount,
          type: "debit" as const,
          category: "tickets" as const,
          description: `Tickets Order ${order.id}`,
          method: "wallet" as const,
          status: "success" as const,
          toOrFrom: "GOZY CINEMA",
          referenceId:
            "UTR" + Math.random().toString(36).slice(2, 10).toUpperCase(),
          createdAt: new Date(),
        };
        const list = [tx, ...walletTransactions];
        setWalletTransactions(list);
        localStorage.setItem("walletTransactions", JSON.stringify(list));
      } else if (details.paymentMethod === "paylater") {
        const nextDue = (() => {
          const d = new Date();
          d.setMonth(d.getMonth() + 1);
          return d;
        })();
        const updatedPL = {
          ...payLater,
          used: (payLater?.used || 0) + details.finalAmount,
          dueAmount: (payLater?.dueAmount || 0) + details.finalAmount,
          dueDate: nextDue,
        };
        setPayLater(updatedPL);
        localStorage.setItem("payLater", JSON.stringify(updatedPL));
        try {
          pushNotification({
            module: "wallet",
            title: "Pay Later used",
            message: `₹${details.finalAmount} added to your Pay Later bill`,
          });
        } catch {
          /* ignore */
        }
      }
      if (details.rewardsEarned && details.rewardsEarned > 0) {
        const act = {
          id: `ra-${Date.now()}`,
          source: "tickets" as const,
          description: `Order ${order.id}`,
          points: details.rewardsEarned,
          createdAt: new Date(),
        };
        const acts = [act, ...rewardActivities];
        setRewardActivities(acts);
        localStorage.setItem("rewardActivities", JSON.stringify(acts));
        if (rewards) {
          const updatedRewards = {
            ...rewards,
            points: rewards.points + details.rewardsEarned,
          };
          setRewards(updatedRewards);
          localStorage.setItem("rewards", JSON.stringify(updatedRewards));
        }
      }
    } catch {
      // ignore
    }
    // referral first order credit
    try {
      if (referral?.referredBy && !referral.firstOrderGranted) {
        const bonus = 100;
        const updatedRef = {
          ...referral,
          credits: (referral.credits || 0) + bonus,
          firstOrderGranted: true,
        };
        setReferral(updatedRef);
        localStorage.setItem("referral", JSON.stringify(updatedRef));
        try {
          pushNotification({
            module: "wallet",
            title: "Referral Bonus",
            message: `You received ₹${bonus} for your first order!`,
          });
        } catch {
          /* ignore */
        }
        if (wallet) {
          const updated = { ...wallet, balance: wallet.balance + bonus };
          setWallet(updated);
          localStorage.setItem("wallet", JSON.stringify(updated));
        }
      }
    } catch {
      /* ignore */
    }
    setCurrentPage("tickets-confirmation");
  };

  return (
    <div className="space-y-3">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-2 bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-800">
              Snacks & Combos
            </div>
            <div className="text-xs text-gray-600">
              Add popcorn, drinks and more
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-700 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
              {summaryLabel}
            </div>
            <button
              onClick={() => setShowCombos(true)}
              className="px-3 py-1.5 text-sm rounded-lg border-2 border-gray-300 hover:border-brand-500"
            >
              Add snacks
            </button>
          </div>
        </div>
      </div>

      {showCombos && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCombos(false)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-900">Snacks & Combos</div>
              <button
                onClick={() => setShowCombos(false)}
                className="px-3 py-1.5 rounded-lg border"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {snacks.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border ${
                    item.qty > 0
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                    ) : item.icon === "popcorn" ? (
                      <Popcorn className="w-6 h-6 text-amber-600" />
                    ) : item.icon === "soda" ? (
                      <CupSoda className="w-6 h-6 text-pink-600" />
                    ) : (
                      <Coffee className="w-6 h-6" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        {item.name}
                        {item.tag && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      {typeof item.cals === "number" && (
                        <div className="text-[11px] text-gray-500">
                          ~{item.cals} kcal
                        </div>
                      )}
                      <div className="text-sm text-gray-700 mt-1">
                        ₹{item.price}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setSnacks((prev) =>
                            prev.map((s) =>
                              s.id === item.id
                                ? { ...s, qty: Math.max(0, (s.qty || 0) - 1) }
                                : s
                            )
                          )
                        }
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-brand-500"
                      >
                        −
                      </button>
                      <span className="text-sm w-7 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() =>
                          setSnacks((prev) =>
                            prev.map((s) =>
                              s.id === item.id
                                ? { ...s, qty: (s.qty || 0) + 1 }
                                : s
                            )
                          )
                        }
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-brand-500"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 mt-4 bg-white pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">Add-ons total</div>
                <div className="text-base font-semibold">₹{snacksTotal}</div>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => {
                    // persist last used combos by id -> qty
                    try {
                      const map: Record<string, number> = snacks.reduce(
                        (acc, s) => {
                          if (s.qty > 0) acc[s.id] = s.qty;
                          return acc;
                        },
                        {} as Record<string, number>
                      );
                      localStorage.setItem(
                        "lastTicketCombos",
                        JSON.stringify(map)
                      );
                    } catch {
                      /* ignore */
                    }
                    setShowCombos(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-brand-600 text-white"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentPage amount={payable} onSuccess={handlePaymentSuccess} />
    </div>
  );
}

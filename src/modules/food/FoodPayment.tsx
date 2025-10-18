import { useState, useEffect } from "react";
import PaymentPage from "../../components/PaymentPage";
import { useApp } from "../../context/AppContext";

export default function FoodPayment() {
  const [totalAmount, setTotalAmount] = useState(0);
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
    const orderDetails = JSON.parse(
      localStorage.getItem("foodOrderDetails") || "{}"
    );
    setTotalAmount(orderDetails.total || 0);
  }, []);

  const handlePaymentSuccess = (details: {
    paymentMethod: string;
    discount: number;
    finalAmount: number;
    rewardsEarned: number;
  }) => {
    try {
      const cartRaw = localStorage.getItem("foodCart");
      const cart = cartRaw
        ? JSON.parse(cartRaw)
        : { items: {}, restaurant: null };
      const order = {
        id: `FORD-${Date.now()}`,
        items: cart.items,
        restaurant: cart.restaurant,
        total: details.finalAmount,
        createdAt: new Date().toISOString(),
        paymentMethod: details.paymentMethod,
        discount: details.discount,
        rewardsEarned: details.rewardsEarned,
        status: "preparing",
      };
      localStorage.setItem("lastFoodOrder", JSON.stringify(order));
      const histRaw = localStorage.getItem("foodOrderHistory");
      const hist = histRaw ? JSON.parse(histRaw) : [];
      hist.unshift(order);
      localStorage.setItem(
        "foodOrderHistory",
        JSON.stringify(hist.slice(0, 50))
      );
      // add to recently viewed/booked
      try {
        const rest = cart.restaurant || {
          name: "Restaurant",
          image: undefined,
          id: "rest",
        };
        addRecentlyViewed({
          id: rest.id || `rest-${Date.now()}`,
          type: "food",
          title: rest.name || "Restaurant",
          image: rest.image,
        });
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
          category: "food" as const,
          description: `Food Order ${order.id}`,
          method: "wallet" as const,
          status: "success" as const,
          toOrFrom: cart.restaurant?.name || "Restaurant",
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
          source: "food" as const,
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
    localStorage.removeItem("foodCart");
    window.dispatchEvent(new Event("cart-updated"));
    // Celebrate successful order
    setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent("confetti", { detail: { mode: "shoutout" } })
        ),
      150
    );
    setCurrentPage("food-tracking");
  };

  return <PaymentPage amount={totalAmount} onSuccess={handlePaymentSuccess} />;
}

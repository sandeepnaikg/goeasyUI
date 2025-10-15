import { useState, useEffect } from 'react';
import PaymentPage from '../../components/PaymentPage';
import { useApp } from '../../context/AppContext';
import { MapPin } from 'lucide-react';

export default function ShoppingPayment() {
  const [total, setTotal] = useState(0);
  const { setCurrentPage, wallet, setWallet, walletTransactions, setWalletTransactions, rewardActivities, setRewardActivities, rewards, setRewards, addresses, defaultAddressId, selectedAddressId, setSelectedAddressId, addRecentlyViewed, payLater, setPayLater, referral, setReferral, pushNotification } = useApp();

  useEffect(() => {
    const order = JSON.parse(localStorage.getItem('shoppingOrder') || '{}');
    setTotal(order.total || 0);
  }, []);

  const handleSuccess = (details: { paymentMethod: string; discount: number; finalAmount: number; rewardsEarned: number }) => {
    const orderData = JSON.parse(localStorage.getItem('shoppingOrder') || '{}');
    const newOrder = {
      id: `SORD-${Date.now()}`,
      items: orderData.items || [],
      total: details.finalAmount,
      status: 'processing',
      trackingNumber: `TRK${Math.floor(Math.random() * 900000) + 100000}`,
      createdAt: new Date().toISOString(),
      paymentMethod: details.paymentMethod,
      discount: details.discount,
      rewardsEarned: details.rewardsEarned,
    };
    // wallet debit if paid by wallet
    try {
      if (details.paymentMethod === 'wallet' && wallet) {
        const updated = { ...wallet, balance: wallet.balance - details.finalAmount };
        setWallet(updated);
        localStorage.setItem('wallet', JSON.stringify(updated));
  const tx = { id: `tx-${Date.now()}`, walletId: wallet.id, amount: details.finalAmount, type: 'debit' as const, category: 'shopping' as const, description: `Shopping Order ${newOrder.id}`, method: 'wallet' as const, status: 'success' as const, toOrFrom: 'GOZY SHOP', referenceId: 'UTR'+Math.random().toString(36).slice(2,10).toUpperCase(), createdAt: new Date() };
        const list = [tx, ...walletTransactions];
        setWalletTransactions(list);
        localStorage.setItem('walletTransactions', JSON.stringify(list));
      } else if (details.paymentMethod === 'paylater') {
        const nextDue = (() => { const d = new Date(); d.setMonth(d.getMonth()+1); return d; })();
        const updatedPL = { ...payLater, used: (payLater?.used||0) + details.finalAmount, dueAmount: (payLater?.dueAmount||0) + details.finalAmount, dueDate: nextDue };
        setPayLater(updatedPL);
        localStorage.setItem('payLater', JSON.stringify(updatedPL));
        // notification
        try { pushNotification({ module: 'wallet', title: 'Pay Later used', message: `₹${details.finalAmount} added to your Pay Later bill`, }); } catch { /* ignore */ }
      }
      // reward activity
      if (details.rewardsEarned && details.rewardsEarned > 0) {
        const act = { id: `ra-${Date.now()}`, source: 'shopping' as const, description: `Order ${newOrder.id}`, points: details.rewardsEarned, createdAt: new Date() };
        const acts = [act, ...rewardActivities];
        setRewardActivities(acts);
        localStorage.setItem('rewardActivities', JSON.stringify(acts));
        if (rewards) {
          const updatedRewards = { ...rewards, points: rewards.points + details.rewardsEarned };
          setRewards(updatedRewards);
          localStorage.setItem('rewards', JSON.stringify(updatedRewards));
        }
      }
    } catch {/* ignore */}
    // recent order
    localStorage.setItem('lastShoppingOrder', JSON.stringify(newOrder));
    // order history array
    try {
      const historyRaw = localStorage.getItem('shoppingOrderHistory');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(newOrder);
      localStorage.setItem('shoppingOrderHistory', JSON.stringify(history.slice(0, 50)));
    } catch {
      // ignore history persistence errors
    }
    // referral first order credit
    try {
      if (referral?.referredBy && !referral.firstOrderGranted) {
        const bonus = 100;
        const updatedRef = { ...referral, credits: (referral.credits||0) + bonus, firstOrderGranted: true };
        setReferral(updatedRef);
        localStorage.setItem('referral', JSON.stringify(updatedRef));
        try { pushNotification({ module: 'wallet', title: 'Referral Bonus', message: `You received ₹${bonus} for your first order!` }); } catch { /* ignore */ }
        // also add to wallet balance as instant credit
        if (wallet) {
          const updated = { ...wallet, balance: wallet.balance + bonus };
          setWallet(updated);
          localStorage.setItem('wallet', JSON.stringify(updated));
        }
      }
    } catch { /* ignore */ }
    // clear cart and order draft
    localStorage.removeItem('shoppingCart');
    localStorage.removeItem('shoppingOrder');
    // add recently viewed/booked first item
    try {
      const first = (orderData.items || [])[0];
      if (first) addRecentlyViewed({ id: first.id, type: 'shopping', title: first.name, image: first.image });
    } catch { /* ignore */ }
    window.dispatchEvent(new Event('cart-updated'));
    setCurrentPage('shopping-confirmation');
  };

  const deliveryAddress = (() => {
    const id = selectedAddressId || defaultAddressId;
    return addresses.find(a => a.id === id);
  })();

  return (
    <div className="space-y-3">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-2 bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-teal-600" />
              {deliveryAddress ? (
                <span>
                  Deliver to <span className="font-semibold">{deliveryAddress.name}</span>, {deliveryAddress.line1}, {deliveryAddress.city} - {deliveryAddress.pincode}
                </span>
              ) : (
                <span>No address selected</span>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedAddressId(deliveryAddress?.id || defaultAddressId);
                setCurrentPage('manage-addresses');
              }}
              className="text-sm underline text-teal-700 hover:text-teal-800"
            >
              Change
            </button>
          </div>
        </div>
      </div>
      <PaymentPage amount={total} onSuccess={handleSuccess} />
    </div>
  );
}

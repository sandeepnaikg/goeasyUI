import { useState, useEffect } from 'react';
import { Popcorn, CupSoda, Coffee } from 'lucide-react';
import PaymentPage from '../../components/PaymentPage';
import { useApp } from '../../context/AppContext';

export default function TicketsPayment() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [snacks, setSnacks] = useState<{ id: string; name: string; price: number; qty: number; icon: 'popcorn'|'soda'|'coffee' }[]>([]);
  const { setCurrentPage, wallet, setWallet, walletTransactions, setWalletTransactions, rewardActivities, setRewardActivities, rewards, setRewards, addRecentlyViewed, payLater, setPayLater, referral, setReferral, pushNotification } = useApp();

  useEffect(() => {
    const seatsData = JSON.parse(localStorage.getItem('selectedSeats') || '{}');
    const base = seatsData.total || 0;
    setTotalAmount(base);
    // initialize snack combos (quantity 0 by default)
    setSnacks([
      { id: 'combo-popcorn', name: 'Popcorn Combo', price: 199, qty: 0, icon: 'popcorn' },
      { id: 'combo-soda', name: 'Soda + Nachos', price: 149, qty: 0, icon: 'soda' },
      { id: 'combo-coffee', name: 'Coffee + Cookies', price: 129, qty: 0, icon: 'coffee' },
    ]);
  }, []);

  const snacksTotal = snacks.reduce((s, it) => s + it.price * (it.qty || 0), 0);
  const payable = (totalAmount || 0) + snacksTotal;

  const handlePaymentSuccess = (details: { paymentMethod: string; discount: number; finalAmount: number; rewardsEarned: number }) => {
    try {
      const seatsData = JSON.parse(localStorage.getItem('selectedSeats') || '{}');
      const showData = seatsData.showData || null;
      const order = {
        id: `TORD-${Date.now()}`,
        total: details.finalAmount || payable || seatsData.total || 0,
        addons: snacks.filter(s => s.qty>0).map(s => ({ id: s.id, name: s.name, qty: s.qty, price: s.price })),
        seats: seatsData.seats || [],
        show: showData,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      };
      localStorage.setItem('lastTicketOrder', JSON.stringify(order));
      const histRaw = localStorage.getItem('ticketOrderHistory');
      const hist = histRaw ? JSON.parse(histRaw) : [];
      hist.unshift(order);
      localStorage.setItem('ticketOrderHistory', JSON.stringify(hist.slice(0,50)));
      // recently viewed/booked movie
      try {
        if (showData?.movie?.title) {
          addRecentlyViewed({ id: `movie-${Date.now()}`, type: 'tickets', title: showData.movie.title, image: showData.movie.image });
        }
      } catch { /* ignore */ }
      // wallet & rewards
      if (details.paymentMethod === 'wallet' && wallet) {
        const updated = { ...wallet, balance: wallet.balance - details.finalAmount };
        setWallet(updated);
        localStorage.setItem('wallet', JSON.stringify(updated));
  const tx = { id: `tx-${Date.now()}`, walletId: wallet.id, amount: details.finalAmount, type: 'debit' as const, category: 'tickets' as const, description: `Tickets Order ${order.id}`, method: 'wallet' as const, status: 'success' as const, toOrFrom: 'GOZY CINEMA', referenceId: 'UTR'+Math.random().toString(36).slice(2,10).toUpperCase(), createdAt: new Date() };
        const list = [tx, ...walletTransactions];
        setWalletTransactions(list);
        localStorage.setItem('walletTransactions', JSON.stringify(list));
      } else if (details.paymentMethod === 'paylater') {
        const nextDue = (() => { const d = new Date(); d.setMonth(d.getMonth()+1); return d; })();
        const updatedPL = { ...payLater, used: (payLater?.used||0) + details.finalAmount, dueAmount: (payLater?.dueAmount||0) + details.finalAmount, dueDate: nextDue };
        setPayLater(updatedPL);
        localStorage.setItem('payLater', JSON.stringify(updatedPL));
        try { pushNotification({ module: 'wallet', title: 'Pay Later used', message: `₹${details.finalAmount} added to your Pay Later bill` }); } catch { /* ignore */ }
      }
      if (details.rewardsEarned && details.rewardsEarned > 0) {
        const act = { id: `ra-${Date.now()}`, source: 'tickets' as const, description: `Order ${order.id}`, points: details.rewardsEarned, createdAt: new Date() };
        const acts = [act, ...rewardActivities];
        setRewardActivities(acts);
        localStorage.setItem('rewardActivities', JSON.stringify(acts));
        if (rewards) {
          const updatedRewards = { ...rewards, points: rewards.points + details.rewardsEarned };
          setRewards(updatedRewards);
          localStorage.setItem('rewards', JSON.stringify(updatedRewards));
        }
      }
    } catch {
      // ignore
    }
    // referral first order credit
    try {
      if (referral?.referredBy && !referral.firstOrderGranted) {
        const bonus = 100;
        const updatedRef = { ...referral, credits: (referral.credits||0) + bonus, firstOrderGranted: true };
        setReferral(updatedRef);
        localStorage.setItem('referral', JSON.stringify(updatedRef));
        try { pushNotification({ module: 'wallet', title: 'Referral Bonus', message: `You received ₹${bonus} for your first order!` }); } catch { /* ignore */ }
        if (wallet) {
          const updated = { ...wallet, balance: wallet.balance + bonus };
          setWallet(updated);
          localStorage.setItem('wallet', JSON.stringify(updated));
        }
      }
    } catch { /* ignore */ }
    setCurrentPage('tickets-confirmation');
  };

  return (
    <div className="space-y-3">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-2 bg-white rounded-xl border border-gray-200 p-3">
          <div className="text-sm font-semibold text-gray-800 mb-2">Snacks & Combos</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {snacks.map(item => (
              <div key={item.id} className={`p-3 rounded-xl border ${item.qty>0? 'border-teal-500 bg-teal-50':'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {item.icon==='popcorn' ? <Popcorn className="w-4 h-4 text-amber-600"/> : item.icon==='soda' ? <CupSoda className="w-4 h-4 text-pink-600"/> : <Coffee className="w-4 h-4"/>}
                  <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">₹{item.price}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSnacks(prev=> prev.map(s=> s.id===item.id? { ...s, qty: Math.max(0, (s.qty||0)-1)}: s))} className="px-2 py-1 rounded-lg border text-xs">-</button>
                    <span className="text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => setSnacks(prev=> prev.map(s=> s.id===item.id? { ...s, qty: (s.qty||0)+1}: s))} className="px-2 py-1 rounded-lg border text-xs">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-700">Add-ons total: ₹{snacksTotal}</div>
        </div>
      </div>
      <PaymentPage
        amount={payable}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

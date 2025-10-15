import { useState, useEffect } from 'react';
import PaymentPage from '../../components/PaymentPage';
import { useApp } from '../../context/AppContext';
import { MapPin } from 'lucide-react';

export default function TravelPayment() {
  const [totalAmount, setTotalAmount] = useState(0);
  const { setCurrentPage, wallet, setWallet, walletTransactions, setWalletTransactions, rewardActivities, setRewardActivities, rewards, setRewards, addresses, defaultAddressId, selectedAddressId, setSelectedAddressId, addRecentlyViewed, payLater, setPayLater, referral, setReferral, pushNotification } = useApp();

  useEffect(() => {
    const type = localStorage.getItem('bookingType') || 'flight';
    const booking = JSON.parse(localStorage.getItem('bookingDetails') || '{}');
    const search = JSON.parse(localStorage.getItem('travelSearch') || '{}');
    let amount = 0;
    if (type === 'flight') {
      const flight = JSON.parse(localStorage.getItem('selectedFlight') || '{}');
      if (flight && flight.fares && flight.chosenFare) {
        const match = (flight.fares as Array<{ family: string; price: number }>).find(f => f.family === flight.chosenFare);
        amount = match?.price ?? (flight.price || 0);
      } else {
        amount = flight.price || 0;
      }
      if (booking.addInsurance) amount += 299;
      if (booking.addMeal) amount += 450;
    } else if (type === 'hotel') {
      const hotel = JSON.parse(localStorage.getItem('selectedHotel') || '{}');
      const nights = (search?.departureDate && search?.returnDate) ? Math.max(1, Math.round((new Date(search.returnDate).getTime() - new Date(search.departureDate).getTime()) / (1000*60*60*24))) : 1;
      amount = (hotel.pricePerNight || 0) * nights;
    } else if (type === 'bus') {
      const bus = JSON.parse(localStorage.getItem('selectedBus') || '{}');
      amount = bus.price || 0;
    } else if (type === 'train') {
      const train = JSON.parse(localStorage.getItem('selectedTrain') || '{}');
      amount = train.price || 0;
    } else if (type === 'metro') {
      const metro = JSON.parse(localStorage.getItem('selectedMetro') || '{}');
      amount = metro.price || 0;
    }
    setTotalAmount(amount);
  }, []);

  const handlePaymentSuccess = (details: { paymentMethod: string; discount: number; finalAmount: number; rewardsEarned: number }) => {
    try {
      const type = localStorage.getItem('bookingType') || 'flight';
      const booking = JSON.parse(localStorage.getItem('bookingDetails') || '{}');
      const base = type === 'flight' ? JSON.parse(localStorage.getItem('selectedFlight') || '{}')
                : type === 'bus' ? JSON.parse(localStorage.getItem('selectedBus') || '{}')
                : type === 'train' ? JSON.parse(localStorage.getItem('selectedTrain') || '{}')
                : type === 'metro' ? JSON.parse(localStorage.getItem('selectedMetro') || '{}')
                : JSON.parse(localStorage.getItem('selectedHotel') || '{}');
      const calcDefault = () => {
        if (type === 'flight') return (base.price || 0) + (booking.addInsurance ? 299 : 0) + (booking.addMeal ? 450 : 0);
        if (type === 'hotel') {
          const s = JSON.parse(localStorage.getItem('travelSearch') || '{}');
          const nights = (s?.departureDate && s?.returnDate) ? Math.max(1, Math.round((new Date(s.returnDate).getTime() - new Date(s.departureDate).getTime()) / (1000*60*60*24))) : 1;
          return (base.pricePerNight || 0) * nights;
        }
        return base.price || 0;
      };
      const order = {
        id: `TRVL-${Date.now()}`,
        type,
        item: base,
        booking,
        total: details.finalAmount || calcDefault(),
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      } as const;
      localStorage.setItem('lastTravelOrder', JSON.stringify(order));
      const histRaw = localStorage.getItem('travelOrderHistory');
      const hist = histRaw ? JSON.parse(histRaw) : [];
      hist.unshift(order);
      localStorage.setItem('travelOrderHistory', JSON.stringify(hist.slice(0,50)));
      // recently viewed/booked item
      try {
        if (type === 'hotel' && base?.name) addRecentlyViewed({ id: base.id || `hotel-${Date.now()}`, type: 'travel', title: base.name, image: base.image });
        else if (type === 'flight' && (base?.flightNumber || base?.airline)) addRecentlyViewed({ id: base.flightNumber || `flight-${Date.now()}`, type: 'travel', title: base.airline || 'Flight', image: base.image });
        else if (type === 'bus' && base?.operator) addRecentlyViewed({ id: base.id || `bus-${Date.now()}`, type: 'travel', title: base.operator, image: base.image });
        else if (type === 'train' && base?.operator) addRecentlyViewed({ id: base.id || `train-${Date.now()}`, type: 'travel', title: base.operator, image: base.image });
        else if (type === 'metro' && base?.line) addRecentlyViewed({ id: base.id || `metro-${Date.now()}`, type: 'travel', title: base.line, image: base.image });
      } catch { /* ignore */ }
      // wallet & rewards
  if (details.paymentMethod === 'wallet' && wallet) {
        const updated = { ...wallet, balance: wallet.balance - details.finalAmount };
        setWallet(updated);
        localStorage.setItem('wallet', JSON.stringify(updated));
  const toFrom = type === 'flight' ? (base?.airline || 'Airline') : type === 'bus' ? (base?.operator || 'Bus') : type === 'train' ? (base?.operator || 'Train') : type==='metro' ? (base?.line || 'Metro') : (base?.name || 'Hotel');
  const tx = { id: `tx-${Date.now()}`, walletId: wallet.id, amount: details.finalAmount, type: 'debit' as const, category: 'travel' as const, description: `Travel Booking ${order.id}`, method: 'wallet' as const, status: 'success' as const, toOrFrom: toFrom, referenceId: 'UTR'+Math.random().toString(36).slice(2,10).toUpperCase(), createdAt: new Date() };
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
        const act = { id: `ra-${Date.now()}`, source: 'travel' as const, description: `Booking ${order.id}`, points: details.rewardsEarned, createdAt: new Date() };
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
    setCurrentPage('travel-confirmation');
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
      <PaymentPage
        amount={totalAmount}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

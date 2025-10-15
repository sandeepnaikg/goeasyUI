import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Wallet, CreditCard, Smartphone, Tag, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TrustBadges from './TrustBadges';

interface PaymentPageProps {
  amount: number;
  onSuccess: (details: { paymentMethod: string; discount: number; finalAmount: number; rewardsEarned: number }) => void;
}

export default function PaymentPage({ amount, onSuccess }: PaymentPageProps) {
  const { wallet, defaultPaymentMethod, upiHandles, defaultUpiId, setDefaultPaymentMethod, privacy, payLater, rewards, setRewards } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'card' | 'paylater'>(defaultPaymentMethod || 'wallet');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [payLaterNote, setPayLaterNote] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [showCouponPaper, setShowCouponPaper] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [autoApplied, setAutoApplied] = useState(false);
  const [stackedWallet, setStackedWallet] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const promoSectionRef = useRef<HTMLDivElement | null>(null);
  // UPI quick select state
  const [selectedUpiId, setSelectedUpiId] = useState<string | null>(defaultUpiId || null);
  const selectedUpi = useMemo(() => upiHandles.find(u => u.id === selectedUpiId) || null, [upiHandles, selectedUpiId]);
  const [upiInput, setUpiInput] = useState<string>(selectedUpi?.handle || '');
  const [setCurrentUpiAsDefault, setSetCurrentUpiAsDefault] = useState<boolean>(false);
  useEffect(() => { setUpiInput(selectedUpi?.handle || ''); }, [selectedUpi?.handle]);
  // Configurable rules
  const offerConfig = {
    stackingCapPct: 0.4, // 40%
  } as const;
  const allCodes = useMemo(
    () => ['FIRST100', 'GOZY50', 'WALLET100', 'GOFLY300', 'BUS50', 'MOVIE20', 'STAY20', 'HDFC10'] as const,
    []
  );

  type Offer = {
    code: string;
    label: string;
    terms: string;
  eligibleMethods: Array<'wallet' | 'upi' | 'card' | 'paylater' | 'any'>;
    minAmount?: number;
    cap?: number; // max discount for percent offers
    stackWithWallet?: boolean; // whether can stack WALLET100 when paying with wallet
  };

  const offers: Offer[] = useMemo(() => [
    { code: 'FIRST100', label: 'Flat ₹100 off for first order', terms: 'Valid once per user. No minimum amount.', eligibleMethods: ['any'], stackWithWallet: true },
    { code: 'GOZY50', label: 'Flat ₹50 off', terms: 'No minimum amount.', eligibleMethods: ['any'], stackWithWallet: true },
    { code: 'WALLET100', label: '₹100 wallet cashback', terms: 'Min order ₹499. Pay using GOZY Wallet.', eligibleMethods: ['wallet'], minAmount: 499 },
    { code: 'GOFLY300', label: 'Flights: ₹300 off', terms: 'Min fare ₹2500.', eligibleMethods: ['any'], minAmount: 2500, stackWithWallet: true },
    { code: 'BUS50', label: 'Bus: ₹50 off', terms: 'Min fare ₹400.', eligibleMethods: ['any'], minAmount: 400, stackWithWallet: true },
    { code: 'MOVIE20', label: 'Movies: 20% off up to ₹150', terms: 'Cap ₹150.', eligibleMethods: ['any'], cap: 150, stackWithWallet: true },
    { code: 'STAY20', label: 'Hotels: 20% off up to ₹500', terms: 'Cap ₹500.', eligibleMethods: ['any'], cap: 500, stackWithWallet: true },
    { code: 'HDFC10', label: 'HDFC 10% on Card', terms: 'Min ₹2999. Applicable only on cards.', eligibleMethods: ['card'], stackWithWallet: false },
  ], []);

  // Centralized evaluator for all offer codes
  const getDiscountFor = (
    codeRaw: string,
    amt: number,
  method: 'wallet' | 'upi' | 'card' | 'paylater'
  ): { discount: number; message?: string } => {
    const code = codeRaw.trim().toUpperCase();
    let computed = 0;
    let message: string | undefined;
    if (!code) return { discount: 0 };
    // Flat codes
    if (code === 'GOZY50') computed = 50;
    else if (code === 'FIRST100') {
      const used = (() => { try { return localStorage.getItem('firstOrderUsed') === 'true'; } catch { return false; } })();
      if (used) {
        message = 'FIRST100 is for first order only';
      } else {
        computed = 100;
      }
    }
    else if (code === 'WALLET100') {
      if (amt >= 499) computed = 100; else message = 'Min order ₹499 required';
      if (method !== 'wallet') message = 'Pay with Wallet to avail this offer';
    }
    else if (code === 'GOFLY300') {
      if (amt >= 2500) computed = 300; else message = 'Min fare ₹2500 required';
    }
    else if (code === 'BUS50') {
      if (amt >= 400) computed = 50; else message = 'Min fare ₹400 required';
    }
    // Percentage with cap
    else if (code === 'MOVIE20') {
      computed = Math.min(Math.floor(amt * 0.2), 150);
    }
    else if (code === 'STAY20') {
      computed = Math.min(Math.floor(amt * 0.2), 500);
    }
    // Bank/card offer
    else if (code === 'HDFC10') {
      if (amt >= 2999 && method === 'card') {
        computed = Math.floor(amt * 0.1);
      } else {
        message = method !== 'card' ? 'Use Credit/Debit Card to avail this offer' : 'Min amount ₹2999 required';
      }
    }
    else {
      message = 'Invalid coupon code';
    }
    return { discount: computed, message };
  };

  // Subtle nudge: HDFC10 on card if it saves more than current discount
  const hdfcPotential = useMemo(() => {
    const hdfc = getDiscountFor('HDFC10', amount, 'card').discount;
    const extra = Math.max(0, hdfc - discount);
    return { hdfc, extra };
  }, [amount, discount]);

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    // Evaluate single and stacked (wallet + code) when paying by wallet
    const single = getDiscountFor(code, amount, paymentMethod);
  let computed = single.discount;
  const message = single.message;
    let codesApplied: string[] = [code];
    let walletPart = 0;

    if (!message && paymentMethod === 'wallet' && code !== 'WALLET100') {
      const walletOnly = getDiscountFor('WALLET100', amount, 'wallet').discount;
      if (walletOnly > 0) {
        // global stacking cap
        const stackingCap = Math.floor(amount * offerConfig.stackingCapPct);
        const stacked = Math.min(walletOnly + single.discount, stackingCap);
        if (stacked > computed) {
          computed = stacked;
          codesApplied = [code, 'WALLET100'];
          walletPart = walletOnly;
        }
      }
    }

    if (message) {
      setPromoMessage(message);
      setDiscount(0);
      setShowCouponPaper(false);
      setAppliedCode(null);
      setAutoApplied(false);
      setStackedWallet(false);
    } else if (computed > 0) {
      setDiscount(computed);
      setAppliedCode(codesApplied.join('+'));
      setShowCouponPaper(true);
      setPromoMessage(null);
      setAutoApplied(false);
      setStackedWallet(codesApplied.includes('WALLET100') && walletPart > 0);
      try { localStorage.setItem('lastAppliedCodes', codesApplied.join('+')); } catch { /* ignore */ }
    } else {
      setPromoMessage('Offer not applicable');
      setDiscount(0);
      setShowCouponPaper(false);
      setAppliedCode(null);
      setAutoApplied(false);
      setStackedWallet(false);
    }
    setTimeout(() => {
      setPromoMessage(null);
      setShowCouponPaper(false);
    }, 2500);
  };

  // Auto-apply preselected offer from Offers page
  useEffect(() => {
    const saved = localStorage.getItem('selectedOfferCode');
    if (saved) {
      setPromoCode(saved);
      const code = saved.trim().toUpperCase();
      const { discount: computed, message } = getDiscountFor(code, amount, paymentMethod);
      if (message) {
        setPromoMessage(message);
        setDiscount(0);
        setShowCouponPaper(false);
        setAppliedCode(null);
        setAutoApplied(false);
      } else if (computed > 0) {
        setDiscount(computed);
        setAppliedCode(code);
        setShowCouponPaper(true);
        setPromoMessage(null);
        setAutoApplied(false);
      }
      setTimeout(() => {
        setPromoMessage(null);
        setShowCouponPaper(false);
      }, 2500);
      localStorage.removeItem('selectedOfferCode');
    }
    // Restore last applied codes if present and valid
    const last = localStorage.getItem('lastAppliedCodes');
    if (last && !appliedCode) {
      const parts = last.split('+');
      let total = 0;
      let valid = true;
      for (const p of parts) {
        const { discount: d, message } = getDiscountFor(p, amount, paymentMethod);
        if (message || d <= 0) { valid = false; break; }
        total += d;
      }
      const cap = Math.floor(amount * 0.4);
      total = Math.min(total, cap);
      if (valid && total > 0) {
        setAppliedCode(last);
        setDiscount(total);
        setPromoCode(parts[0]);
        setAutoApplied(true);
        setStackedWallet(parts.includes('WALLET100') && parts.length > 1);
      }
    }
  }, [amount, paymentMethod, appliedCode, discount]);

  // Helper: choose best single or stacked (wallet+code) offer
  const getBestOffer = useCallback((
    amt: number,
    method: 'wallet' | 'upi' | 'card' | 'paylater'
  ): { codes: string[]; discount: number } => {
    let bestSingle = { code: null as string | null, discount: 0 };
    for (const c of allCodes) {
      const { discount: d } = getDiscountFor(c, amt, method);
      if (d > bestSingle.discount) bestSingle = { code: c as string, discount: d };
    }
    if (method !== 'wallet') {
      return { codes: bestSingle.code ? [bestSingle.code] : [], discount: bestSingle.discount };
    }
    // Consider stacking for wallet method: combine WALLET100 with the best non-wallet code (excluding card-only HDFC10)
    const walletOnly = getDiscountFor('WALLET100', amt, 'wallet').discount;
    let bestStack = { codes: [] as string[], discount: 0 };
    if (walletOnly > 0) {
      for (const c of allCodes) {
        if (c === 'WALLET100' || c === 'HDFC10') continue; // HDFC card-only; skip stacking
        const d = getDiscountFor(c, amt, 'wallet').discount;
        if (d > 0) {
          const stackingCap = Math.floor(amt * offerConfig.stackingCapPct);
          const sum = Math.min(walletOnly + d, stackingCap);
          if (sum > bestStack.discount) bestStack = { codes: [c as string, 'WALLET100'], discount: sum };
        }
      }
    }
    // Compare
    if (bestStack.discount > bestSingle.discount) return bestStack;
    return { codes: bestSingle.code ? [bestSingle.code] : [], discount: bestSingle.discount };
  }, [allCodes, offerConfig.stackingCapPct]);

  // Revalidate currently applied code when amount/method changes
  useEffect(() => {
    if (appliedCode) {
      const { discount: d, message } = getDiscountFor(appliedCode, amount, paymentMethod);
      if (d > 0) {
        if (d !== discount) setDiscount(d);
      } else {
        // Clear invalidated promo
        setDiscount(0);
        setAppliedCode(null);
        if (message) setPromoMessage(message);
        setAutoApplied(false);
        setTimeout(() => setPromoMessage(null), 2000);
      }
    }
  }, [amount, paymentMethod, appliedCode, autoApplied, discount]);

  // Best offer auto-apply (respects manual selection). Runs when no valid code is applied or when auto-applied previously.
  useEffect(() => {
    // If personalization is off, do not auto-apply offers.
    if (!privacy?.personalizedOffers) return;
    // If user manually applied a code, do not override
    if (appliedCode && !autoApplied) return;

    const best = getBestOffer(amount, paymentMethod);
    if (best.codes.length > 0 && best.discount > 0) {
      const codeStr = best.codes.join('+');
      if (!appliedCode || autoApplied || discount !== best.discount || appliedCode !== codeStr) {
        setPromoCode(best.codes[0]);
        setDiscount(best.discount);
        setAppliedCode(codeStr);
        setShowCouponPaper(true);
        setPromoMessage(`Best offer applied: ${codeStr} • You saved ₹${best.discount}`);
        setAutoApplied(true);
        setStackedWallet(best.codes.includes('WALLET100') && best.codes.length > 1);
        setTimeout(() => {
          setPromoMessage(null);
          setShowCouponPaper(false);
        }, 2000);
      }
    } else if (!appliedCode && discount !== 0) {
      // No applicable offers, ensure discount cleared if none chosen
      setDiscount(0);
      setAppliedCode(null);
      setAutoApplied(false);
      setStackedWallet(false);
    }
  }, [amount, paymentMethod, appliedCode, autoApplied, discount, allCodes, getBestOffer, privacy?.personalizedOffers]);

  // Alternative offers (exclude currently applied), sorted by savings
  const alternativeOffers = useMemo(() => {
    const appliedSet = new Set((appliedCode || '').split('+').filter(Boolean));
    return allCodes
      .map((c) => {
        // preview savings; include potential wallet stacking for wallet method when previewing non-wallet code
        if (paymentMethod === 'wallet' && c !== 'WALLET100' && c !== 'HDFC10') {
          const single = getDiscountFor(c, amount, 'wallet').discount;
          const wal = getDiscountFor('WALLET100', amount, 'wallet').discount;
          const stackingCap = Math.floor(amount * offerConfig.stackingCapPct);
          const d = Math.max(single, Math.min(single + wal, stackingCap));
          return { code: c as string, d };
        }
        return { code: c as string, d: getDiscountFor(c, amount, paymentMethod).discount };
      })
      .filter((x) => x.d > 0 && !appliedSet.has(x.code))
      .sort((a, b) => b.d - a.d)
      .slice(0, 4);
  }, [amount, paymentMethod, appliedCode, allCodes, offerConfig.stackingCapPct]);

  const finalAmount = amount - discount;
  const rewardsEarned = Math.floor(finalAmount * 0.1);
  const plAvail = payLater?.enabled ? Math.max(0, (payLater.limit || 0) - (payLater.used || 0)) : 0;
  const plBlocked = paymentMethod === 'paylater' && finalAmount > plAvail;

  // Breakdown for stacked codes
  const discountBreakdown = useMemo(() => {
    if (!appliedCode) return null;
    const parts = appliedCode.split('+').filter(Boolean);
    if (parts.length === 0) return null;
    const items = parts.map((c) => ({ code: c, value: getDiscountFor(c, amount, paymentMethod).discount }));
    const raw = items.reduce((s, x) => s + x.value, 0);
    const cap = Math.floor(amount * offerConfig.stackingCapPct);
    const capped = Math.min(raw, cap);
    return { items, raw, capped, cap, capApplied: raw > cap };
  }, [appliedCode, amount, paymentMethod, offerConfig.stackingCapPct]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm">
          Tip: Your welcome bonus has been credited to Wallet and Rewards. Try applying an offer code below for extra savings.
        </div>
        <div className="mb-4"><TrustBadges context="payment" /></div>
        {showCouponPaper && discount > 0 && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60]">
            <div className="relative bg-white shadow-2xl rounded-xl px-6 py-4 border-2 border-dashed border-emerald-300 paper-pop">
              {/* side notches for ticket/papercut look */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border border-emerald-200" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border border-emerald-200" />
              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-emerald-700 font-bold">Coupon Applied!</div>
                  <div className="text-sm text-gray-700">{appliedCode} • You saved ₹{discount}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div>
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

              {/* Promo message moved near the promo input below the Pay button to keep the layout compact */}

              <div className="space-y-3 mb-6">
                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Wallet className="w-6 h-6 text-teal-600" />
                    <div>
                      <div className="font-semibold text-gray-900">GOZY Wallet</div>
                      <div className="text-sm text-gray-600">
                        Balance: ₹{wallet?.balance.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                    className="w-5 h-5"
                  />
                </label>

                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'paylater'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Wallet className="w-6 h-6 text-teal-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Pay Later</div>
                      <div className="text-sm text-gray-600">Use GOZY Pay Later, clear dues next month</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'paylater'}
                    onChange={() => setPaymentMethod('paylater')}
                    className="w-5 h-5"
                  />
                </label>

                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Smartphone className="w-6 h-6 text-teal-600" />
                    <div>
                      <div className="font-semibold text-gray-900">UPI</div>
                      <div className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="w-5 h-5"
                  />
                </label>

                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <CreditCard className="w-6 h-6 text-teal-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Credit/Debit Card</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard, RuPay</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              {paymentMethod === 'upi' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID</label>
                  {upiHandles.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {upiHandles.map(u => (
                        <button key={u.id} onClick={()=>{ setSelectedUpiId(u.id); setUpiInput(u.handle); }} className={`text-xs px-2 py-1 rounded-full border ${selectedUpiId===u.id?'border-teal-500 text-teal-700':'border-gray-200 hover:border-teal-300'}`}>{u.handle}</button>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={upiInput}
                    onChange={(e)=>{ setSelectedUpiId(null); setUpiInput(e.target.value); }}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                  <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-700">
                    <input type="checkbox" checked={setCurrentUpiAsDefault} onChange={(e)=>setSetCurrentUpiAsDefault(e.target.checked)} />
                    <span>Set this UPI as default</span>
                  </label>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <Lock className="w-4 h-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
              {/* Burn points CTA */}
              {rewards && rewards.points >= 100 && (
                <div className="mb-4 flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm">
                  <div>Use your points to save now: {rewards.points} pts available (100 pts = ₹1)</div>
                  <button onClick={() => {
                    if (!rewards) return;
                    const redeemable = Math.min(finalAmount, Math.floor(rewards.points / 100));
                    if (redeemable <= 0) return;
                    // reduce rewards and amount by adding wallet credit then stacking discount
                    const newPts = rewards.points - redeemable * 100;
                    setRewards({ ...rewards, points: newPts });
                    localStorage.setItem('rewards', JSON.stringify({ ...rewards, points: newPts }));
                    // apply as additional discount immediately
                    setDiscount(prev => prev + redeemable);
                    setPromoMessage(`Redeemed ₹${redeemable} from points`);
                    setTimeout(()=> setPromoMessage(null), 1500);
                  }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg">Burn points</button>
                </div>
              )}
              {paymentMethod==='paylater' && (
                <div className="mb-4 text-xs text-gray-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
                  Note: Wallet cashback offers cannot stack with Pay Later.
                </div>
              )}

              <button
                disabled={isPaying || plBlocked}
                onClick={() => {
                  if (isPaying) return; // guard against double click
                  if (plBlocked) return;
                  setIsPaying(true);
                  // simulate quick processing; prevents duplicate points/repeats
                  setTimeout(() => {
                    // Track first-order usage
                    try {
                      if (appliedCode?.includes('FIRST100')) {
                        localStorage.setItem('firstOrderUsed', 'true');
                      }
                      if (appliedCode) {
                        localStorage.setItem('lastAppliedCodes', appliedCode);
                      }
                    } catch { /* ignore */ }
                    onSuccess({ paymentMethod, discount, finalAmount, rewardsEarned });
                    if (paymentMethod === 'paylater') {
                      const dueDate = (() => {
                        const now = new Date();
                        const next = new Date(now.getFullYear(), now.getMonth() + 1, 12);
                        return next.toISOString().slice(0,10);
                      })();
                      setPayLaterNote(`Added to Pay Later. Bill due by ${dueDate}.`);
                      setTimeout(() => setPayLaterNote(null), 2400);
                    }
                    // Silently set default method to the last used method (no confirm dialogs)
                    try {
                      const currentDefault = localStorage.getItem('defaultPaymentMethod') as 'wallet'|'upi'|'card'|'paylater'|null;
                      if (currentDefault !== paymentMethod) {
                        setDefaultPaymentMethod(paymentMethod);
                        localStorage.setItem('defaultPaymentMethod', paymentMethod);
                      }
                      // If paying via UPI and user typed a different handle with 'set default', persist as new default UPI
                      if (paymentMethod === 'upi' && setCurrentUpiAsDefault && upiInput && /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiInput)) {
                        // create or update existing list entry
                        const existing = upiHandles.find(u => u.handle === upiInput);
                        if (existing) {
                          localStorage.setItem('defaultUpiId', existing.id);
                        } else {
                          const newId = `u${Date.now()}`;
                          const newList = [{ id: newId, handle: upiInput, verified: true, isDefault: true, createdAt: new Date() }, ...upiHandles];
                          localStorage.setItem('upiHandles', JSON.stringify(newList));
                          localStorage.setItem('defaultUpiId', newId);
                        }
                        localStorage.setItem('defaultPaymentMethod', 'upi');
                      }
                    } catch { /* ignore */ }
                    setIsPaying(false);
                  }, 100);
                }}
                className={`w-full py-4 ${isPaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700'} text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-xl`}
              >
                {isPaying ? 'Processing…' : `Pay ₹${finalAmount.toLocaleString()}`}
              </button>
              {payLaterNote && (
                <div className="mt-2 text-xs bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded">{payLaterNote}</div>
              )}

              {/* Compact promo section directly under the Pay button */}
              <div ref={promoSectionRef} className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Have a promo code?</h3>
                  <button
                    onClick={() => setShowOffersModal(true)}
                    className="text-xs underline text-teal-700 hover:text-teal-800"
                  >
                    View all offers
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-5 py-2 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {alternativeOffers.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    Try:
                    <span className="ml-2 inline-flex flex-wrap gap-2">
                      {alternativeOffers.map((a) => (
                        <button
                          key={a.code}
                          onClick={() => {
                            setPromoCode(a.code);
                            setPromoMessage(`Ready to apply ${a.code} • Save up to ₹${a.d}`);
                            setTimeout(() => setPromoMessage(null), 1800);
                          }}
                          className="px-2 py-1 rounded-full border border-gray-200 hover:border-teal-400 hover:text-teal-700"
                        >
                          {a.code}
                        </button>
                      ))}
                    </span>
                  </div>
                )}
                {!privacy?.personalizedOffers && (
                  <div className="mt-2 text-[11px] text-gray-500">
                    Personalization is off — auto-apply is disabled. You can still apply any code manually.
                  </div>
                )}
                {promoMessage && (
                  <div className={`mt-2 p-2 rounded-lg text-xs font-semibold ${promoMessage.includes('Invalid') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {promoMessage}
                  </div>
                )}
                {discount > 0 && (
                  <div className="mt-2 flex items-center space-x-2 text-green-600 text-sm">
                    <Tag className="w-4 h-4" />
                    <span>₹{discount} discount applied{stackedWallet ? ' (stacked with WALLET100)' : ''}!</span>
                  </div>
                )}
              </div>
              {paymentMethod==='paylater' && (
                <div className={`${plBlocked ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-800'} mb-4 px-3 py-2 rounded border text-xs`}>
                  {plBlocked ? (
                    <>Available Pay Later limit is {plAvail.toLocaleString()}. Please reduce amount or choose another method.</>
                  ) : (
                    <>Available Pay Later limit: {plAvail.toLocaleString()}</>
                  )}
                </div>
              )}
          </div>

          {/* Price Summary below */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Price Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Base Price</span>
                <span>₹{amount.toLocaleString()}</span>
              </div>
              {paymentMethod !== 'card' && hdfcPotential.extra > 0 && (
                <div className="flex items-center justify-between text-xs bg-indigo-50 border border-indigo-200 text-indigo-800 px-2 py-1 rounded">
                  <span>Switch to Card for extra ₹{hdfcPotential.extra} off (HDFC10)</span>
                  <button className="underline" onClick={()=>{ setPaymentMethod('card'); setPromoCode('HDFC10'); setAppliedCode(null); setAutoApplied(false); setTimeout(()=>applyPromo(),0); }}>Apply & Switch</button>
                </div>
              )}
              {discount > 0 && (
                <div>
                  {/* Header row with info + change link */}
                  <div className="flex items-center justify-between text-green-700">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Discount{appliedCode ? ` (${appliedCode.replace(/\\+/g, ' + ')}${autoApplied ? ' • auto' : ''})` : ''}</span>
                      <span
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-800 text-[10px] font-bold cursor-help"
                        aria-label="Savings info"
                        title={`When paying with Wallet, GOZY may stack WALLET100 with one other offer. Total savings are capped at ${offerConfig.stackingCapPct*100}% of order value.`}
                      >
                        i
                      </span>
                      {discountBreakdown?.capApplied && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">cap applied</span>
                      )}
                    </div>
                    {(appliedCode || alternativeOffers.length > 0) && (
                      <button
                        onClick={() => promoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                        className="text-xs underline text-green-700 hover:text-green-800"
                      >
                        Change offer
                      </button>
                    )}
                  </div>
                  {/* Line items if stacked */}
                  {discountBreakdown && discountBreakdown.items.length > 1 ? (
                    <div className="mt-1 space-y-1 text-sm text-green-700">
                      {discountBreakdown.items.map((it) => (
                        <div key={it.code} className="flex justify-between">
                          <span>{it.code}</span>
                          <span>-₹{it.value}</span>
                        </div>
                      ))}
                      {discountBreakdown.capApplied && (
                        <div className="flex justify-between text-amber-700 text-xs">
                          <span>Total before cap</span>
                          <span>₹{discountBreakdown.raw}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold">
                        <span>Total discount</span>
                        <span>-₹{discount}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-green-700">
                      <span>Applied</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₹{finalAmount.toLocaleString()}</span>
              </div>
              {paymentMethod==='paylater' && (
                <div className="text-xs text-gray-600">Will be added to your Pay Later bill (due next month).</div>
              )}
            </div>
          </div>

          {/* Rewards below */}
          <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rewards</h3>
            <p className="text-gray-700">
              You will earn <span className="font-bold text-orange-600">{rewardsEarned} points</span> with this purchase!
            </p>
          </div>
        </div>
      </div>
      {/* Offers Modal */}
      {showOffersModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold">Available Offers</h4>
              <button onClick={() => setShowOffersModal(false)} className="text-sm text-gray-600 hover:text-gray-800">Close</button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
              {offers.map((o) => {
                const preview = (() => {
                  // preview with stacking if paying via wallet and stack allowed
                  const single = getDiscountFor(o.code, amount, paymentMethod).discount;
                  if (paymentMethod === 'wallet' && o.code !== 'WALLET100' && o.code !== 'HDFC10') {
                    const wal = getDiscountFor('WALLET100', amount, 'wallet').discount;
                    const stackingCap = Math.floor(amount * 0.4);
                    return Math.max(single, Math.min(single + wal, stackingCap));
                  }
                  return single;
                })();
                const disabled = o.eligibleMethods.indexOf('any') === -1 && o.eligibleMethods.indexOf(paymentMethod) === -1;
                return (
                  <div key={o.code} className={`border rounded-xl p-3 ${disabled ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{o.label} <span className="text-xs text-gray-500">[{o.code}]</span></div>
                        <div className="text-xs text-gray-600 mt-0.5">{o.terms}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-emerald-700">Save up to ₹{preview}</div>
                        <button
                          disabled={disabled}
                          onClick={() => {
                            setPromoCode(o.code);
                            setShowOffersModal(false);
                            setTimeout(() => applyPromo(), 0);
                          }}
                          className={`mt-1 px-3 py-1.5 rounded-lg text-sm ${disabled ? 'bg-gray-200 text-gray-500' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Note: Wallet cashback (WALLET100) can stack with one other offer when paying via GOZY Wallet. Total savings capped at 40% of the order value. See <a href="#promo-terms" onClick={(e)=>{e.preventDefault(); localStorage.setItem('navigateTo','terms#promo-terms'); window.dispatchEvent(new Event('nav-anchor'));}} className="underline text-teal-700">promo terms</a>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

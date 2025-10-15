import { ArrowLeft, CreditCard as CardIcon, Smartphone as UpiIcon, Trash2, CheckCircle2, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMemo, useState } from 'react';
import type { PaymentCard, UpiHandle } from '../types';

const brandBadge = (brand: PaymentCard['brand']) => {
  const map: Record<PaymentCard['brand'], string> = {
    visa: 'bg-blue-50 text-blue-700 border-blue-200',
    mastercard: 'bg-orange-50 text-orange-700 border-orange-200',
    rupay: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    amex: 'bg-teal-50 text-teal-700 border-teal-200',
    other: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return map[brand] || map.other;
};

function maskCard(last4: string) { return `•••• •••• •••• ${last4}`; }

export default function PaymentMethods() {
  const { setCurrentPage, prevPage, paymentCards, setPaymentCards, upiHandles, setUpiHandles, defaultCardId, setDefaultCardId, defaultUpiId, setDefaultUpiId, defaultPaymentMethod, setDefaultPaymentMethod } = useApp();
  const [cardDraft, setCardDraft] = useState<{ number: string; name: string; expiry: string; brand: PaymentCard['brand'] }>({ number: '', name: '', expiry: '', brand: 'visa' });
  const [upiDraft, setUpiDraft] = useState<string>('');
  const [upiDefaultOnAdd, setUpiDefaultOnAdd] = useState<boolean>(true);
  const [msg, setMsg] = useState<string | null>(null);
  const sortedCards = useMemo(() => {
    return [...paymentCards].sort((a, b) => (a.id === defaultCardId ? -1 : b.id === defaultCardId ? 1 : 0));
  }, [paymentCards, defaultCardId]);
  const sortedUpis = useMemo(() => {
    return [...upiHandles].sort((a, b) => (a.id === defaultUpiId ? -1 : b.id === defaultUpiId ? 1 : 0));
  }, [upiHandles, defaultUpiId]);

  const addCard = () => {
    // Demo validation: number length>=12, expiry MM/YY
    const digits = cardDraft.number.replace(/\D/g, '');
    if (digits.length < 12) return setMsg('Enter a valid card number (demo, min 12 digits).');
    if (!/^\d{2}\/\d{2}$/.test(cardDraft.expiry)) return setMsg('Enter expiry as MM/YY');
    const last4 = digits.slice(-4);
    const c: PaymentCard = { id: `c${Date.now()}`, brand: cardDraft.brand, last4, holderName: cardDraft.name || 'GUEST USER', expiry: cardDraft.expiry, createdAt: new Date() };
    const list = [c, ...paymentCards];
    setPaymentCards(list);
    localStorage.setItem('paymentCards', JSON.stringify(list));
    setMsg('Card added (demo). We never store full PAN/CVV.');
    setCardDraft({ number: '', name: '', expiry: '', brand: 'visa' });
  };

  const removeCard = (id: string) => {
    if (!confirm('Remove this card?')) return;
    const list = paymentCards.filter(c => c.id !== id);
    setPaymentCards(list);
    localStorage.setItem('paymentCards', JSON.stringify(list));
    if (defaultCardId === id) {
      const next = list[0]?.id || null;
      setDefaultCardId(next);
      if (next) localStorage.setItem('defaultCardId', next); else localStorage.removeItem('defaultCardId');
    }
  };

  const setCardDefault = (id: string) => {
    setDefaultCardId(id);
    localStorage.setItem('defaultCardId', id);
    setDefaultPaymentMethod('card');
  };

  const addUpi = () => {
    const handle = upiDraft.trim();
    if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(handle)) return setMsg('Enter a valid UPI ID (name@bank)');
    const u: UpiHandle = { id: `u${Date.now()}`, handle, verified: true, isDefault: false, createdAt: new Date() };
    const list = [u, ...upiHandles.filter(h => h.handle !== handle)];
    setUpiHandles(list);
    localStorage.setItem('upiHandles', JSON.stringify(list));
    if (upiDefaultOnAdd) {
      setDefaultUpiId(u.id);
      localStorage.setItem('defaultUpiId', u.id);
      setDefaultPaymentMethod('upi');
      setMsg('UPI ID added, verified and set as default (demo).');
    } else {
      setMsg('UPI ID added and verified (demo).');
    }
    setUpiDraft('');
  };

  const removeUpi = (id: string) => {
    if (!confirm('Remove this UPI ID?')) return;
    const list = upiHandles.filter(u => u.id !== id);
    setUpiHandles(list);
    localStorage.setItem('upiHandles', JSON.stringify(list));
    if (defaultUpiId === id) {
      const next = list[0]?.id || null;
      setDefaultUpiId(next);
      if (next) localStorage.setItem('defaultUpiId', next); else localStorage.removeItem('defaultUpiId');
    }
  };

  const setUpiDefault = (id: string) => {
    setDefaultUpiId(id);
    localStorage.setItem('defaultUpiId', id);
    setDefaultPaymentMethod('upi');
  };
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentPage(prevPage || 'profile')} className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <div className="w-24" />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow space-y-6">
          <div className="text-sm text-gray-500">This is demo data. We never store full card PAN/CVV.</div>

          {/* Cards */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg flex items-center gap-2"><CardIcon className="w-5 h-5"/> Cards</h2>
              <div className="text-xs text-gray-500">Default payment: <span className="font-semibold">{defaultPaymentMethod.toUpperCase()}</span></div>
            </div>
            <div className="space-y-2">
              {sortedCards.length === 0 ? (
                <div className="text-sm text-gray-500">No cards saved yet.</div>
              ) : (
                sortedCards.map(c => (
                  <div key={c.id} className={`border rounded-xl p-3 flex items-center justify-between ${c.id===defaultCardId?'border-teal-400 bg-teal-50':'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`text-xs px-2 py-0.5 rounded-full border ${brandBadge(c.brand)}`}>{c.brand.toUpperCase()}</div>
                      <div>
                        <div className="font-semibold">{maskCard(c.last4)}</div>
                        <div className="text-xs text-gray-600">{c.holderName} • Exp {c.expiry}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.id===defaultCardId && <span className="inline-flex items-center gap-1 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><Star className="w-3 h-3"/> Default</span>}
                      {c.id!==defaultCardId && <button onClick={()=>setCardDefault(c.id)} className="text-sm underline text-teal-700">Make default</button>}
                      <button onClick={()=>removeCard(c.id)} className="p-2 rounded-lg border hover:border-rose-400" aria-label="Remove"><Trash2 className="w-4 h-4 text-rose-600"/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input className="px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" placeholder="Card number" value={cardDraft.number} onChange={(e)=>setCardDraft(d=>({...d,number:e.target.value}))}/>
              <input className="px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" placeholder="Name on card" value={cardDraft.name} onChange={(e)=>setCardDraft(d=>({...d,name:e.target.value}))}/>
              <input className="px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" placeholder="MM/YY" value={cardDraft.expiry} onChange={(e)=>setCardDraft(d=>({...d,expiry:e.target.value}))}/>
              <select className="px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" value={cardDraft.brand} onChange={(e)=>setCardDraft(d=>({...d,brand:e.target.value as PaymentCard['brand']}))}>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="rupay">RuPay</option>
                <option value="amex">Amex</option>
                <option value="other">Other</option>
              </select>
              <div className="sm:col-span-4 flex justify-end">
                <button onClick={addCard} className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">Add Card</button>
              </div>
            </div>
          </section>

          {/* UPI */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg flex items-center gap-2"><UpiIcon className="w-5 h-5"/> UPI</h2>
            </div>
            <div className="space-y-2">
              {sortedUpis.length === 0 ? (
                <div className="text-sm text-gray-500">No UPI IDs saved yet.</div>
              ) : (
                sortedUpis.map(u => (
                  <div key={u.id} className={`border rounded-xl p-3 flex items-center justify-between ${u.id===defaultUpiId?'border-teal-400 bg-teal-50':'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-xs px-2 py-0.5 rounded-full border bg-violet-50 text-violet-700 border-violet-200">UPI</div>
                      <div>
                        <div className="font-semibold">{u.handle}</div>
                        <div className="text-xs text-gray-600 inline-flex items-center gap-1">{u.verified ? <><CheckCircle2 className="w-3 h-3 text-emerald-600"/> Verified</> : 'Unverified'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.id===defaultUpiId && <span className="inline-flex items-center gap-1 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><Star className="w-3 h-3"/> Default</span>}
                      {u.id!==defaultUpiId && <button onClick={()=>setUpiDefault(u.id)} className="text-sm underline text-teal-700">Make default</button>}
                      <button onClick={()=>removeUpi(u.id)} className="p-2 rounded-lg border hover:border-rose-400" aria-label="Remove"><Trash2 className="w-4 h-4 text-rose-600"/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
              <input className="px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500 sm:col-span-3" placeholder="yourname@upi" value={upiDraft} onChange={(e)=>setUpiDraft(e.target.value)}/>
              <label className="text-xs text-gray-700 inline-flex items-center gap-2 sm:col-span-1">
                <input type="checkbox" checked={upiDefaultOnAdd} onChange={(e)=>setUpiDefaultOnAdd(e.target.checked)} />
                <span>Set as default</span>
              </label>
              <div className="sm:col-span-1 flex justify-end">
                <button onClick={addUpi} className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">Add UPI</button>
              </div>
            </div>
          </section>

          {msg && <div className="p-2 rounded-lg text-xs mt-2 bg-amber-50 text-amber-800 border border-amber-200">{msg}</div>}
        </div>
      </div>
    </div>
  );
}

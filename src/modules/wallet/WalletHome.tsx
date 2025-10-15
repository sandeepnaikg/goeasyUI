import { useState, useMemo, useEffect } from 'react';
import { Wallet, CreditCard, Gift, Users, TrendingUp, ArrowUpRight, ArrowDownLeft, Plus, Send, Share2, X, Star, WalletCards, Building2, IndianRupee, Search, CalendarDays, ShieldCheck, Smartphone, TicketPercent, ClipboardCopy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TransactionDetailModal from './TransactionDetailModal';

function formatDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0,10);
}

export default function WalletHome() {
  const { wallet, rewards, setWallet, setRewards, walletTransactions, setWalletTransactions, rewardActivities, paymentCards, setPaymentCards, setCurrentPage, payLater, setPayLater } = useApp();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState(500);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [sendAmount, setSendAmount] = useState(100);
  const [sendMethod, setSendMethod] = useState<'upi'|'bank'>('upi');
  const [sendTo, setSendTo] = useState('friend@upi');
  const [bankIfsc, setBankIfsc] = useState('HDFC0001234');
  const [bankAccount, setBankAccount] = useState('XX1234');
  const [showIfscList, setShowIfscList] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', name: '', expiry: '' });
  const [showRewardDetail, setShowRewardDetail] = useState(false);
  const [selected, setSelected] = useState<typeof walletTransactions[number] | null>(null);
  const [showSettleOptions, setShowSettleOptions] = useState(false);
  const [settleError, setSettleError] = useState<string | null>(null);
  const [settleMethod, setSettleMethod] = useState<'upi'|'card'|'bank'|'wallet'>('upi');
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleUpi, setSettleUpi] = useState<string>('yourname@upi');
  const [settleCardId, setSettleCardId] = useState<string | null>(null);
  const [settleBankIfsc, setSettleBankIfsc] = useState<string>('HDFC0001234');
  const [settleBankAccount, setSettleBankAccount] = useState<string>('****1234');
  const [showVouchers, setShowVouchers] = useState(false);
  const [vouchers] = useState<Array<{ code: string; label: string; off: number; min: number; expiry: string }>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('walletVouchers') || '[]');
      if (Array.isArray(saved)) return saved;
    } catch { /* ignore */ }
    return [
      { code: 'WALLET50', label: '₹50 off', off: 50, min: 299, expiry: new Date(Date.now()+7*86400000).toISOString() },
      { code: 'MOVIE100', label: '₹100 off on Tickets', off: 100, min: 599, expiry: new Date(Date.now()+10*86400000).toISOString() },
      { code: 'SHOP75', label: '₹75 off on Shopping', off: 75, min: 499, expiry: new Date(Date.now()+5*86400000).toISOString() },
    ];
  });
  useEffect(() => {
    try { localStorage.setItem('walletVouchers', JSON.stringify(vouchers)); } catch { /* ignore */ }
  }, [vouchers]);

  const handleRedeem = () => {
    if (!rewards || !wallet) return;
    // conversion: 100 points = ₹1
    const availableRupees = Math.floor(rewards.points / 100);
    if (availableRupees <= 0) return;

    const newBalance = wallet.balance + availableRupees;
    const remainingPoints = rewards.points - availableRupees * 100;

    const updatedWallet = { ...wallet, balance: newBalance };
    const updatedRewards = { ...rewards, points: remainingPoints };

    setWallet(updatedWallet);
    setRewards(updatedRewards);

    // persist to localStorage
    localStorage.setItem('wallet', JSON.stringify(updatedWallet));
    localStorage.setItem('rewards', JSON.stringify(updatedRewards));
  };

  const sortedTransactions = [...walletTransactions].sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const addMoney = () => {
    if (!wallet || addAmount <= 0) return;
    const updated = { ...wallet, balance: wallet.balance + addAmount };
    setWallet(updated);
    localStorage.setItem('wallet', JSON.stringify(updated));
    const tx = { id: 'tx'+Date.now(), walletId: wallet.id, amount: addAmount, type: 'credit' as const, category: 'topup' as const, description: 'Wallet Top-up', method: 'card' as const, status: 'success' as const, referenceId: 'UTR'+Math.random().toString(36).slice(2,10).toUpperCase(), createdAt: new Date() };
    const list = [tx, ...walletTransactions];
    setWalletTransactions(list);
    localStorage.setItem('walletTransactions', JSON.stringify(list));
    setShowAddMoney(false);
  };

  const sendMoney = () => {
    if (!wallet || sendAmount <= 0 || sendAmount > wallet.balance) return;
    const updated = { ...wallet, balance: wallet.balance - sendAmount };
    setWallet(updated);
    localStorage.setItem('wallet', JSON.stringify(updated));
    const desc = sendMethod==='upi' ? `Sent to ${sendTo}` : `Bank transfer ${bankAccount} / ${bankIfsc}`;
    const tx = { id: 'tx'+Date.now(), walletId: wallet.id, amount: sendAmount, type: 'debit' as const, category: 'transfer' as const, description: desc, method: sendMethod, toOrFrom: sendMethod==='upi'? sendTo : `${bankAccount} / ${bankIfsc}`, status: 'success' as const, referenceId: 'UTR'+Math.random().toString(36).slice(2,10).toUpperCase(), createdAt: new Date() };
    const list = [tx, ...walletTransactions];
    setWalletTransactions(list);
    localStorage.setItem('walletTransactions', JSON.stringify(list));
    setShowSendMoney(false);
  };

  const addCard = () => {
    if (!newCard.number || !newCard.name || !newCard.expiry) return;
    const last4 = newCard.number.slice(-4);
    const card = { id: 'card'+Date.now(), brand: 'other' as const, last4, holderName: newCard.name.toUpperCase(), expiry: newCard.expiry, createdAt: new Date() };
    const list = [...paymentCards, card];
    setPaymentCards(list);
    localStorage.setItem('paymentCards', JSON.stringify(list));
    setNewCard({ number: '', name: '', expiry: '' });
  };

  const shareReferral = async () => {
    const text = 'Join me on GOZY and earn rewards! Use code GOZYFRIEND';
    try {
      const navShare = (navigator as unknown as { share?: (data: ShareData) => Promise<void> }).share;
      if (navShare) { await navShare({ text, title: 'GOZY Referral', url: window.location.href }); }
      else {
        await navigator.clipboard.writeText(text);
        alert('Referral text copied to clipboard!');
      }
    } catch {/* ignore */}
  };

  const totalEarned = rewardActivities.filter(r=> r.points>0).reduce((s,r)=> s+r.points,0);
  const totalRedeemed = rewardActivities.filter(r=> r.points<0).reduce((s,r)=> s+Math.abs(r.points),0);
  const daysLeft = (() => {
    if (!payLater?.dueDate) return null;
    const diff = Math.ceil((new Date(payLater.dueDate).getTime() - Date.now()) / (1000*60*60*24));
    return diff;
  })();
  const minDue = useMemo(() => {
    if (!payLater) return 0;
    return Math.max(500, Math.floor((payLater.dueAmount || 0) * 0.25));
  }, [payLater]);

  const settleWith = (method: 'wallet'|'upi'|'card'|'bank') => {
    if (!payLater) return;
    if (payLater.dueAmount <= 0) return;
    const amount = Math.max(0, Math.min(settleAmount || 0, payLater.dueAmount));
    if (amount <= 0) { setSettleError('Enter a valid amount'); return; }
    // wallet settlement reduces wallet balance, others are external (no wallet balance change)
    if (method === 'wallet') {
      if (!wallet) return;
      if (wallet.balance < amount) {
        setSettleError('Insufficient wallet balance for repayment. Choose UPI/Card/NetBanking.');
        return;
      }
      const updatedWallet = { ...wallet, balance: wallet.balance - amount };
      setWallet(updatedWallet);
      localStorage.setItem('wallet', JSON.stringify(updatedWallet));
      const tx = { id: 'tx'+Date.now(), walletId: wallet.id, amount, type: 'debit' as const, category: 'transfer' as const, description: 'Pay Later repayment', method: 'wallet' as const, status: 'success' as const, referenceId: 'PLR'+Math.random().toString(36).slice(2,10).toUpperCase(), createdAt: new Date() };
      const list = [tx, ...walletTransactions];
      setWalletTransactions(list);
      localStorage.setItem('walletTransactions', JSON.stringify(list));
    } else {
      // Simulate successful payment via external method and just log the repayment for history visibility
      const wid = wallet?.id || 'wallet';
      const tx = { id: 'tx'+Date.now(), walletId: wid, amount, type: 'debit' as const, category: 'transfer' as const, description: 'Pay Later repayment', method, status: 'success' as const, referenceId: 'PLR'+Math.random().toString(36).slice(2,10).toUpperCase(), createdAt: new Date() };
      const list = [tx, ...walletTransactions];
      setWalletTransactions(list);
      localStorage.setItem('walletTransactions', JSON.stringify(list));
    }
    const updated = { ...payLater, used: Math.max(0, payLater.used - amount), dueAmount: Math.max(0, payLater.dueAmount - amount) };
    setPayLater(updated);
    localStorage.setItem('payLater', JSON.stringify(updated));
    setShowSettleOptions(false);
    setSettleError(null);
  };
  const settlePayLater = () => {
    if (!payLater || payLater.dueAmount <= 0) return;
    setSettleAmount(payLater.dueAmount);
    setSettleMethod('upi');
    setShowSettleOptions(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#d1f5f9,#f0fdfa)] dark:bg-[radial-gradient(circle_at_20%_20%,#0d1f21,#062a2e)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">My Wallet</h1>
        {/* Strong Pay Later banner */}
        {payLater?.enabled && (
          <div className="mb-6 rounded-2xl p-4 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-800">
                <span className="font-semibold">Pay Later</span> • Limit ₹{payLater.limit.toLocaleString()} • Due ₹{payLater.dueAmount.toLocaleString()} • Due on {payLater.dueDate ? formatDate(payLater.dueDate) : '—'}
                {typeof daysLeft==='number' && <span className="ml-2 text-gray-600">({daysLeft} day(s) left)</span>}
              </div>
              {payLater.dueAmount>0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Min due ₹{minDue}</span>
                  <button onClick={settlePayLater} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">Pay Now</button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <Wallet className="w-12 h-12" />
              <div className="text-sm font-semibold">GOZY Wallet</div>
            </div>
            <div className="mb-2 text-teal-100">Available Balance</div>
            <div className="text-5xl font-bold mb-8">₹{wallet?.balance.toLocaleString()}</div>
            <div className="flex space-x-3 text-sm">
              <button onClick={()=> setShowAddMoney(true)} className="flex-1 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" /><span>Add Money</span>
              </button>
              <button onClick={()=> setShowSendMoney(true)} className="flex-1 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center justify-center space-x-2">
                <Send className="w-4 h-4" /><span>Send</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <Gift className="w-12 h-12" />
              <div className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                {rewards?.tier.toUpperCase()}
              </div>
            </div>
            <div className="mb-2 text-amber-100">Reward Points</div>
            <div onClick={()=> setShowRewardDetail(true)} className="text-5xl font-bold mb-4 cursor-pointer group">
              {rewards?.points} <span className="text-base align-top font-medium group-hover:text-white/80">pts</span>
            </div>
            <div className="flex items-center justify-between text-xs mb-4">
              <div className="bg-white/20 rounded-full px-3 py-1">Earned: {totalEarned}</div>
              <div className="bg-white/20 rounded-full px-3 py-1">Redeemed: {totalRedeemed}</div>
            </div>
            <button onClick={handleRedeem} className="w-full py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <Star className="w-4 h-4" /><span>Redeem Points</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button onClick={()=> setShowCards(true)} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all text-left relative overflow-hidden group">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Linked Cards</h3>
            <p className="text-sm text-gray-600">{paymentCards.length} saved • manage methods</p>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-teal-400 to-cyan-500 transition-opacity" />
          </button>

          <button onClick={shareReferral} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all text-left group relative overflow-hidden">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Referral Program</h3>
            <p className="text-sm text-gray-600 flex items-center space-x-1"><Share2 className="w-4 h-4" /><span>Tap to share</span></p>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-amber-400 to-orange-500 transition-opacity" />
          </button>

          <button onClick={()=> { localStorage.setItem('offersViewed','1'); window.dispatchEvent(new Event('offers-open')); }} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all text-left group relative overflow-hidden">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Offers</h3>
            <p className="text-sm text-gray-600">Exclusive deals for you</p>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-purple-500 to-pink-500 transition-opacity" />
          </button>
          <button onClick={()=> setShowVouchers(true)} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all text-left group relative overflow-hidden">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <TicketPercent className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Vouchers</h3>
            <p className="text-sm text-gray-600">Saved voucher codes</p>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-teal-400 to-cyan-500 transition-opacity" />
          </button>
        </div>

        {/* Pay Later summary */}
        {payLater?.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">Pay Later</h3>
                <div className="text-xs text-gray-600">Limit ₹{payLater.limit.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
                  <div className="text-xs text-gray-500">Used</div>
                  <div className="text-xl font-bold text-teal-700">₹{payLater.used.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="text-xs text-gray-500">Due</div>
                  <div className="text-xl font-bold text-amber-700">₹{payLater.dueAmount.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="text-xs text-gray-500">Due Date</div>
                  <div className="text-sm font-semibold text-indigo-700 flex items-center gap-1"><CalendarDays className="w-4 h-4" />{payLater.dueDate ? formatDate(payLater.dueDate) : '—'}</div>
                </div>
              </div>
              {payLater.dueAmount > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-600">{typeof daysLeft==='number' ? `${daysLeft} day(s) left` : 'No dues'}</div>
                  <button onClick={settlePayLater} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Pay Now</button>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2"><ShieldCheck className="w-5 h-5 text-teal-600" /><h4 className="font-semibold">How it works</h4></div>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Use Pay Later at checkout</li>
                <li>One bill per month</li>
                <li>No interest if paid on time</li>
              </ul>
            </div>
            {/* Repayment History */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-3">
              <h4 className="font-semibold mb-3">Repayment History</h4>
              <div className="space-y-2">
                {walletTransactions.filter(t=> t.description.includes('Pay Later repayment')).slice(0,6).map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm border-2 border-gray-100 rounded-xl p-3">
                    <div className="text-gray-700">{formatDate(t.createdAt)} • <span className="uppercase">{t.method}</span></div>
                    <div className="font-semibold text-gray-900">₹{t.amount.toLocaleString()}</div>
                  </div>
                ))}
                {walletTransactions.filter(t=> t.description.includes('Pay Later repayment')).length===0 && (
                  <div className="text-xs text-gray-500">No repayments yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
            <button onClick={()=> setCurrentPage('wallet-transactions')} className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
              View All →
            </button>
          </div>
          {/* Recent redemptions mini panel */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-800 mb-2">Recent Redemptions</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {rewardActivities.filter(r=> r.points<0).slice(0,4).map(act => (
                <span key={act.id} className="px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">{act.description} • {Math.abs(act.points)} pts</span>
              ))}
              {rewardActivities.filter(r=> r.points<0).length===0 && (
                <span className="text-xs text-gray-500">No recent redemptions.</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {sortedTransactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={()=> setSelected(transaction)}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-teal-200 transition-colors text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowDownLeft className={`w-6 h-6 text-green-600`} />
                    ) : (
                      <ArrowUpRight className={`w-6 h-6 text-red-600`} />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{transaction.description}</div>
                    <div className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</div>
                  </div>
                </div>
                <div className={`${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                } text-xl font-bold`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
              <button onClick={()=> setShowAddMoney(false)} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2"><Wallet className="w-5 h-5 text-teal-600" /><span>Add Money</span></h3>
              <div className="space-y-4">
                <input type="number" value={addAmount} onChange={e=> setAddAmount(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
                <div className="flex flex-wrap gap-2">
                  {[200,500,1000,2000,5000].map(v=> <button key={v} onClick={()=> setAddAmount(v)} className={`px-4 py-2 rounded-full border text-sm ${addAmount===v? 'bg-teal-600 text-white border-teal-600':'border-gray-300 hover:border-teal-400'}`}>₹{v}</button>)}
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-xl p-4 flex items-center space-x-3">
                  <WalletCards className="w-6 h-6 text-teal-600" />
                  <p className="text-sm text-teal-800">Money will be added instantly to your GOZY Wallet.</p>
                </div>
                <button onClick={addMoney} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:from-teal-600 hover:to-cyan-700">Add ₹{addAmount}</button>
              </div>
            </div>
          </div>
        )}

        {/* Vouchers Modal */}
        {showVouchers && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
              <button onClick={()=> setShowVouchers(false)} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><TicketPercent className="w-5 h-5 text-teal-600"/> Vouchers</h3>
              <div className="space-y-3">
                {vouchers.map(v => (
                  <div key={v.code} className="p-3 border-2 border-gray-100 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{v.code} • {v.label}</div>
                      <div className="text-xs text-gray-600">Min ₹{v.min} • Expires {formatDate(v.expiry)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=> { navigator.clipboard?.writeText(v.code); }} className="px-2 py-1 rounded-lg border text-xs flex items-center gap-1"><ClipboardCopy className="w-3 h-3"/> Copy</button>
                      <button onClick={()=> { localStorage.setItem('selectedOfferCode', v.code); setShowVouchers(false); }} className="px-2 py-1 rounded-lg bg-teal-600 text-white text-xs">Apply</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Send Money Modal */}
        {showSendMoney && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
              <button onClick={()=> setShowSendMoney(false)} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2"><Send className="w-5 h-5 text-teal-600" /><span>Send Money</span></h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button onClick={()=> setSendMethod('upi')} className={`flex-1 px-4 py-2 rounded-xl border ${sendMethod==='upi'?'bg-teal-600 text-white border-teal-600':'border-gray-300'}`}>UPI</button>
                  <button onClick={()=> setSendMethod('bank')} className={`flex-1 px-4 py-2 rounded-xl border ${sendMethod==='bank'?'bg-teal-600 text-white border-teal-600':'border-gray-300'}`}>Bank</button>
                </div>
                {sendMethod==='upi' ? (
                  <input type="text" value={sendTo} onChange={e=> setSendTo(e.target.value)} placeholder="upi@bank or phone/email" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input value={bankIfsc} onChange={e=> { setBankIfsc(e.target.value.toUpperCase()); setShowIfscList(true); }} placeholder="Bank IFSC" className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
                      {showIfscList && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow">
                          {['HDFC0001234','ICIC0002222','SBIN0003333','KKBK0004444','AXIS0005555'].filter(b=> b.includes(bankIfsc.toUpperCase().slice(0,4))).slice(0,5).map(code=> (
                            <button key={code} onClick={()=> { setBankIfsc(code); setShowIfscList(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-100">{code}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input value={bankAccount} onChange={e=> setBankAccount(e.target.value)} placeholder="Account (****1234)" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
                  </div>
                )}
                <input type="number" value={sendAmount} onChange={e=> setSendAmount(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
                <button disabled={!!wallet && sendAmount > wallet.balance} onClick={sendMoney} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 flex items-center justify-center space-x-2">
                  {sendMethod==='bank'? <Building2 className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
                  <span>Send ₹{sendAmount}</span>
                </button>
                {wallet && sendAmount > wallet.balance && <p className="text-sm text-red-600">Insufficient balance</p>}
              </div>
            </div>
          </div>
        )}

        {/* Cards Modal */}
        {showCards && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10">
            <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl relative">
              <button onClick={()=> setShowCards(false)} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold mb-6 flex items-center space-x-2"><CreditCard className="w-5 h-5 text-teal-600" /><span>Linked Cards</span></h3>
              <div className="grid gap-4 mb-8">
                {paymentCards.map(c=> (
                  <div key={c.id} className="p-5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg relative overflow-hidden">
                    <div className="text-sm uppercase tracking-wider mb-4">{c.brand.toUpperCase()}</div>
                    <div className="text-2xl font-mono mb-6">**** **** **** {c.last4}</div>
                    <div className="flex justify-between text-xs">
                      <span>{c.holderName}</span><span>EXP {c.expiry}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-3">Add New Card</h4>
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <input value={newCard.number} onChange={e=> setNewCard({...newCard, number: e.target.value})} placeholder="Card Number" className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none md:col-span-2" />
                  <input value={newCard.expiry} onChange={e=> setNewCard({...newCard, expiry: e.target.value})} placeholder="MM/YY" className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
                  <input value={newCard.name} onChange={e=> setNewCard({...newCard, name: e.target.value})} placeholder="Name" className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none md:col-span-3" />
                </div>
                <button onClick={addCard} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:from-teal-600 hover:to-cyan-700">Save Card</button>
              </div>
            </div>
          </div>
        )}

        {/* Reward Detail Modal */}
        {showRewardDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10">
            <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl relative">
              <button onClick={()=> setShowRewardDetail(false)} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold mb-2 flex items-center space-x-2"><Gift className="w-5 h-5 text-orange-500" /><span>Reward Activity</span></h3>
              <p className="text-sm text-gray-600 mb-4">Track how you earned and spent your points.</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-orange-50 rounded-xl text-center">
                  <div className="text-xs text-gray-500 mb-1">TOTAL</div>
                  <div className="text-xl font-bold text-orange-600">{rewards?.points}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <div className="text-xs text-gray-500 mb-1">EARNED</div>
                  <div className="text-xl font-bold text-green-600">{totalEarned}</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl text-center">
                  <div className="text-xs text-gray-500 mb-1">REDEEMED</div>
                  <div className="text-xl font-bold text-red-600">{totalRedeemed}</div>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {rewardActivities.map(act => (
                  <div key={act.id} className="flex items-center justify-between p-3 border-2 border-gray-100 rounded-xl hover:border-orange-200 transition-colors">
                    <div>
                      <div className="font-medium text-gray-800">{act.description}</div>
                      <div className="text-xs text-gray-500">{formatDate(act.createdAt)} • {act.source}</div>
                    </div>
                    <div className={`text-sm font-bold ${act.points>0? 'text-green-600':'text-red-600'}`}>{act.points>0? '+':''}{act.points}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settle Pay Later Options Modal */}
        {showSettleOptions && payLater && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative">
              <button onClick={()=> { setShowSettleOptions(false); setSettleError(null); }} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold mb-4">Pay Later repayment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                  <input type="number" value={settleAmount} onChange={e=> setSettleAmount(Number(e.target.value)||0)} min={1} max={payLater.dueAmount} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
                  <div className="flex gap-2 mt-2">
                    {(() => { const minDue = Math.max(500, Math.floor(payLater.dueAmount * 0.25)); return (
                      <>
                        <button onClick={()=> setSettleAmount(minDue)} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:border-teal-400">Min Due ₹{minDue}</button>
                        <button onClick={()=> setSettleAmount(payLater.dueAmount)} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:border-teal-400">Full Due ₹{payLater.dueAmount}</button>
                      </>
                    ); })()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={()=> setSettleMethod('upi')} className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl ${settleMethod==='upi'?'border-teal-600':'border-gray-200 hover:border-teal-400'}`}>
                      <Smartphone className="w-4 h-4 text-teal-600" /> UPI
                    </button>
                    <button onClick={()=> setSettleMethod('card')} className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl ${settleMethod==='card'?'border-teal-600':'border-gray-200 hover:border-teal-400'}`}>
                      <CreditCard className="w-4 h-4 text-teal-600" /> Card
                    </button>
                    <button onClick={()=> setSettleMethod('bank')} className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl ${settleMethod==='bank'?'border-teal-600':'border-gray-200 hover:border-teal-400'}`}>
                      <Building2 className="w-4 h-4 text-teal-600" /> NetBanking
                    </button>
                    <button onClick={()=> setSettleMethod('wallet')} disabled={!wallet} className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl ${settleMethod==='wallet'?'border-teal-600':'border-gray-200 hover:border-teal-400'} ${!wallet?'opacity-50':''}`}>
                      <Wallet className="w-4 h-4 text-teal-600" /> Wallet
                    </button>
                  </div>
                </div>
                {settleMethod==='upi' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID</label>
                    <input value={settleUpi} onChange={e=> setSettleUpi(e.target.value)} placeholder="yourname@upi" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
                    <div className="mt-2 text-xs text-gray-500">We’ll request a UPI collect for ₹{settleAmount || 0}.</div>
                  </div>
                )}
                {settleMethod==='card' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Card</label>
                    {paymentCards.length>0 ? (
                      <select value={settleCardId || ''} onChange={e=> setSettleCardId(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl">
                        <option value="">Choose saved card</option>
                        {paymentCards.map(c=> <option key={c.id} value={c.id}>{c.brand.toUpperCase()} •••• {c.last4} (EXP {c.expiry})</option>)}
                      </select>
                    ) : (
                      <div className="text-xs text-gray-500">No saved cards. Add one in Linked Cards.</div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">We’ll charge ₹{settleAmount || 0} to the selected card.</div>
                  </div>
                )}
                {settleMethod==='bank' && (
                  <div className="grid gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">IFSC</label>
                      <input value={settleBankIfsc} onChange={e=> setSettleBankIfsc(e.target.value.toUpperCase())} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Account</label>
                      <input value={settleBankAccount} onChange={e=> setSettleBankAccount(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
                    </div>
                    <div className="text-xs text-gray-500">You’ll be redirected to your bank to pay ₹{settleAmount || 0}.</div>
                  </div>
                )}
                {settleMethod==='wallet' && (
                  <div className="text-sm text-gray-700">Wallet balance: ₹{wallet?.balance.toLocaleString()} {wallet && settleAmount>wallet.balance && <span className="text-red-600">• insufficient for this amount</span>}</div>
                )}
                {settleError && <div className="text-sm text-red-600">{settleError}</div>}
                <button
                  onClick={()=> settleWith(settleMethod)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50"
                  disabled={settleAmount<=0 || (settleMethod==='wallet' && (!!wallet && settleAmount>wallet.balance))}
                >
                  Pay ₹{(settleAmount||0).toLocaleString()}
                </button>
                <div className="text-xs text-gray-500 text-center">No convenience fee. Payment simulated for demo.</div>
              </div>
            </div>
          </div>
        )}

        <TransactionDetailModal tx={selected} onClose={()=> setSelected(null)} />
      </div>
    </div>
  );
}

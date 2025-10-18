import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowDownLeft, ArrowUpRight, Copy, Filter, Search } from 'lucide-react';
import TransactionDetailModal from './TransactionDetailModal';

function formatDateTime(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString();
}

export default function WalletTransactions() {
  const { walletTransactions, setCurrentPage } = useApp();
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all'|'credit'|'debit'>('all');
  const [selected, setSelected] = useState<typeof walletTransactions[number] | null>(null);

  const list = useMemo(()=> {
    const sorted = [...walletTransactions].sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted.filter(t => {
      if (type !== 'all' && t.type !== type) return false;
      if (!q) return true;
      const hay = `${t.description} ${t.referenceId ?? ''} ${t.toOrFrom ?? ''} ${t.category}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [walletTransactions, q, type]);

  return (
    <div className="min-h-screen bg-white">
  <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
          <button onClick={()=> setCurrentPage('wallet-home')} className="text-teal-600 font-semibold">Back to Wallet</button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search by name, UTR, note..." className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex bg-gray-100 rounded-xl p-1">
              {(['all','credit','debit'] as const).map(v=> (
                <button key={v} onClick={()=> setType(v)} className={`px-3 py-1 rounded-lg text-sm font-medium ${type===v? 'bg-white shadow border':'text-gray-600'}`}>{v[0].toUpperCase()+v.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow divide-y">
          {list.map(t => (
            <div key={t.id} onClick={()=> setSelected(t)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.type==='credit'?'bg-green-100':'bg-red-100'}`}>
                  {t.type==='credit'? <ArrowDownLeft className="w-6 h-6 text-green-600" /> : <ArrowUpRight className="w-6 h-6 text-red-600" />}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t.description}</div>
                  <div className="text-xs text-gray-500">{formatDateTime(t.createdAt)} • {t.category}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {t.toOrFrom && (<span className="mr-2">To/From: <span className="font-medium text-gray-800">{t.toOrFrom}</span></span>)}
                    {t.method && (<span className="mr-2">Method: <span className="font-medium text-gray-800 uppercase">{t.method}</span></span>)}
                    {t.status && (<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status==='success'?'bg-green-100 text-green-700': t.status==='pending'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>{t.status}</span>)}
                  </div>
                  {t.referenceId && (
                    <button onClick={(e)=> { e.stopPropagation(); navigator.clipboard.writeText(t.referenceId!); }} className="mt-1 inline-flex items-center space-x-1 text-xs text-teal-700 hover:underline">
                      <Copy className="w-3 h-3" /><span>UTR: {t.referenceId}</span>
                    </button>
                  )}
                </div>
              </div>
              <div className={`text-xl font-bold ${t.type==='credit'?'text-green-600':'text-red-600'}`}>{t.type==='credit'?'+':'-'}₹{t.amount.toLocaleString()}</div>
            </div>
          ))}
          {list.length===0 && (
            <div className="p-10 text-center text-gray-500">No transactions found.</div>
          )}
        </div>

        <TransactionDetailModal tx={selected} onClose={()=> setSelected(null)} />
      </div>
    </div>
  );
}

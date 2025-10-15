import { WalletTransaction } from '../../types';
import { X, Copy, Share2, Download, IndianRupee, CheckCircle, Clock } from 'lucide-react';

function formatDateTime(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString();
}

export default function TransactionDetailModal({ tx, onClose }: { tx: WalletTransaction | null; onClose: () => void }) {
  if (!tx) return null;
  const isCredit = tx.type === 'credit';

  const copy = async (val?: string) => {
    if (!val) return;
    try { await navigator.clipboard.writeText(val); } catch {/* ignore */}
  };

  const downloadReceipt = () => {
    const lines = [
      `Transaction Receipt`,
      `-------------------`,
      `Description: ${tx.description}`,
      `Amount: ${isCredit? '+':'-'}₹${tx.amount.toLocaleString()}`,
      `Type: ${tx.type}`,
      `Category: ${tx.category}`,
      `Status: ${tx.status ?? 'success'}`,
      `Method: ${tx.method ?? 'wallet'}`,
      `To/From: ${tx.toOrFrom ?? '-'}`,
      `UTR: ${tx.referenceId ?? '-'}`,
      `Wallet: ${tx.walletId}`,
      `Created: ${formatDateTime(tx.createdAt)}`,
      `Transaction Id: ${tx.id}`,
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tx.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const text = `${tx.description} | ${isCredit? '+':'-'}₹${tx.amount.toLocaleString()} | ${tx.type}/${tx.category} | UTR: ${tx.referenceId ?? '-'} | ${formatDateTime(tx.createdAt)}`;
    try {
      const nav = navigator as unknown as { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> };
      if (nav.share) await nav.share({ title: 'Transaction', text }); else await navigator.clipboard.writeText(text);
    } catch {/* ignore */}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCredit? 'bg-green-100':'bg-red-100'}`}>
              <IndianRupee className={`w-6 h-6 ${isCredit? 'text-green-600':'text-red-600'}`} />
            </div>
            <div>
              <div className="text-sm text-gray-500">{tx.category.toUpperCase()} • {tx.method?.toUpperCase() ?? 'WALLET'}</div>
              <div className="text-xl font-bold text-gray-900">{tx.description}</div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-500 text-sm">Amount</div>
            <div className={`text-2xl font-bold ${isCredit? 'text-green-600':'text-red-600'}`}>{isCredit? '+':'-'}₹{tx.amount.toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Date & Time</div>
              <div className="font-semibold text-gray-800">{formatDateTime(tx.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="font-semibold text-gray-800 flex items-center space-x-2">
                {tx.status==='pending' ? <Clock className="w-4 h-4 text-amber-600"/> : <CheckCircle className="w-4 h-4 text-green-600"/>}
                <span className={`${tx.status==='pending'?'text-amber-700':'text-green-700'}`}>{tx.status ?? 'success'}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">To / From</div>
              <div className="font-semibold text-gray-800 break-all">{tx.toOrFrom ?? '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">UTR / Reference</div>
              <button onClick={()=> copy(tx.referenceId)} className="font-semibold text-gray-800 hover:underline flex items-center space-x-1">
                <span>{tx.referenceId ?? '-'}</span>
                {tx.referenceId && <Copy className="w-3 h-3 text-gray-500" />}
              </button>
            </div>
            <div>
              <div className="text-xs text-gray-500">Transaction ID</div>
              <button onClick={()=> copy(tx.id)} className="font-semibold text-gray-800 hover:underline flex items-center space-x-1">
                <span>{tx.id}</span>
                <Copy className="w-3 h-3 text-gray-500" />
              </button>
            </div>
            <div>
              <div className="text-xs text-gray-500">Wallet</div>
              <div className="font-semibold text-gray-800">{tx.walletId}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Notes</div>
            <div className="text-gray-800">{tx.description}</div>
          </div>
        </div>
        <div className="p-6 border-t flex items-center justify-end gap-3">
          <button onClick={share} className="px-4 py-2 rounded-xl border text-gray-700 flex items-center space-x-2"><Share2 className="w-4 h-4"/><span>Share</span></button>
          <button onClick={downloadReceipt} className="px-4 py-2 rounded-xl bg-teal-600 text-white flex items-center space-x-2"><Download className="w-4 h-4"/><span>Download</span></button>
        </div>
      </div>
    </div>
  );
}

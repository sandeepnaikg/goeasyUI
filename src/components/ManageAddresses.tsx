import { ArrowLeft, Home, Building2, MapPin, Pencil, Trash2, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMemo, useState } from 'react';
import type { Address } from '../types';

type Draft = Omit<Address, 'id'> & { id?: string };

const emptyDraft: Draft = {
  label: 'Home',
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

export default function ManageAddresses() {
  const { setCurrentPage, prevPage, addresses, setAddresses, defaultAddressId, setDefaultAddressId, setSelectedAddressId } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const list = [...addresses];
    // Default first
    return list.sort((a, b) => (a.id === defaultAddressId ? -1 : b.id === defaultAddressId ? 1 : 0));
  }, [addresses, defaultAddressId]);

  const validate = (d: Draft) => {
    if (!d.name.trim() || !d.line1.trim() || !d.city.trim() || !d.state.trim()) return 'Please fill all required fields';
    if (!/^\d{10}$/.test(d.phone)) return 'Enter a valid 10-digit phone number';
    if (!/^\d{6}$/.test(d.pincode)) return 'Enter a valid 6-digit pincode';
    return null;
  };

  const startAdd = () => {
    setDraft({ ...emptyDraft, label: 'Home' });
    setError(null);
    setShowForm(true);
  };
  const startEdit = (a: Address) => {
    setDraft({ ...a });
    setError(null);
    setShowForm(true);
  };
  const saveDraft = () => {
    const err = validate(draft);
    if (err) { setError(err); return; }
    const id = draft.id || `addr-${Date.now()}`;
    const next: Address = { ...draft, id } as Address;
    let list = addresses.filter(a => a.id !== id);
    list = [next, ...list];
    // Enforce one default: if first address or explicitly set, mark default
    const hasAny = list.length > 0;
    if (!defaultAddressId && hasAny) {
      next.isDefault = true;
      setDefaultAddressId(id);
    }
    if (next.isDefault) {
      list = list.map(a => a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false });
      setDefaultAddressId(id);
    }
    setAddresses(list);
    setSelectedAddressId(id);
    setShowForm(false);
  };
  const markDefault = (id: string) => {
    const list = addresses.map(a => a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false });
    setAddresses(list);
    setDefaultAddressId(id);
    setSelectedAddressId(id);
  };
  const remove = (id: string) => {
    if (!confirm('Delete this address?')) return;
    let list = addresses.filter(a => a.id !== id);
    // Ensure one default exists
    if (defaultAddressId === id) {
      const fallback = list[0]?.id || null;
      setDefaultAddressId(fallback);
      if (fallback) list = list.map(a => a.id === fallback ? { ...a, isDefault: true } : { ...a, isDefault: false });
    }
    setAddresses(list);
    if (list.length === 0) setSelectedAddressId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentPage(prevPage || 'profile')} className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Manage Addresses</h1>
          <div className="w-24" />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-700">Add, edit, and delete your saved addresses. One default is always kept.</p>
            <button onClick={startAdd} className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">Add New</button>
          </div>

          {sorted.length === 0 ? (
            <div className="text-gray-600 text-sm">No addresses yet. Click "Add New" to get started.</div>
          ) : (
            <div className="space-y-3">
              {sorted.map(a => (
                <div key={a.id} className={`border-2 rounded-xl p-4 flex items-start justify-between ${a.id===defaultAddressId ? 'border-teal-400 bg-teal-50' : 'border-gray-200'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                      {a.label === 'Home' ? <Home className="w-4 h-4"/> : a.label==='Work' ? <Building2 className="w-4 h-4"/> : <MapPin className="w-4 h-4"/>}
                      <span>{a.label}</span>
                      {a.id===defaultAddressId && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><Star className="w-3 h-3"/> Default</span>
                      )}
                    </div>
                    <div className="text-gray-900 font-semibold">{a.name} · +91 {a.phone}</div>
                    <div className="text-gray-700 text-sm">{a.line1}{a.line2?`, ${a.line2}`:''}, {a.city}, {a.state} - {a.pincode}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {a.id!==defaultAddressId && (
                      <button onClick={() => markDefault(a.id)} className="px-3 py-1.5 rounded-lg border text-sm hover:border-teal-400">Make default</button>
                    )}
                    <button onClick={() => startEdit(a)} className="p-2 rounded-lg border hover:border-teal-400" aria-label="Edit"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => remove(a.id)} className="p-2 rounded-lg border hover:border-rose-400" aria-label="Delete"><Trash2 className="w-4 h-4 text-rose-600"/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Sheet */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold">{draft.id ? 'Edit Address' : 'Add New Address'}</div>
              <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Label</label>
                <select value={draft.label} onChange={(e)=>setDraft(d=>({...d,label:e.target.value}))} className="w-full px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500">
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input value={draft.name} onChange={(e)=>setDraft(d=>({...d,name:e.target.value}))} className="w-full px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" placeholder="Name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                <input value={draft.phone} onChange={(e)=>setDraft(d=>({...d,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} className="w-full px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" placeholder="10-digit" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                <input value={draft.pincode} onChange={(e)=>setDraft(d=>({...d,pincode:e.target.value.replace(/\D/g,'').slice(0,6)}))} className="w-full px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" placeholder="6-digit" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 1</label>
                <input value={draft.line1} onChange={(e)=>setDraft(d=>({...d,line1:e.target.value}))} className="w-full px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" placeholder="House No, Street" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 2 (optional)</label>
                <input value={draft.line2||''} onChange={(e)=>setDraft(d=>({...d,line2:e.target.value}))} className="w-full px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" placeholder="Area, Landmark" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                <input value={draft.city} onChange={(e)=>setDraft(d=>({...d,city:e.target.value}))} className="w-full px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                <input value={draft.state} onChange={(e)=>setDraft(d=>({...d,state:e.target.value}))} className="w-full px-3 py-2 border-2 rounded-xl border-gray-200 focus:border-teal-500" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!draft.isDefault} onChange={(e)=>setDraft(d=>({...d,isDefault:e.target.checked}))} />
                <span>Set as default</span>
              </label>
              <div className="flex items-center gap-2">
                <button onClick={()=>setShowForm(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
                <button onClick={saveDraft} className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700">Save</button>
              </div>
            </div>
            {error && <div className="mt-2 p-2 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>}
            <div className="mt-3 text-xs text-gray-500">Note: This is demo data. Do not enter real personal information.</div>
          </div>
        </div>
      )}
    </div>
  );
}

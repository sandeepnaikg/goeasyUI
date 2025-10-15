import { ArrowLeft, Phone, Copy, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Address } from '../types';
import RecentActivity from './RecentActivity';

export default function Profile() {
  const { user, rewards, wallet, setCurrentPage, prevPage, logout, addresses, defaultAddressId, setAddresses, setDefaultAddressId, referral, setReferral } = useApp() as unknown as {
    user: ReturnType<typeof useApp>['user'];
    rewards: ReturnType<typeof useApp>['rewards'];
    wallet: ReturnType<typeof useApp>['wallet'];
    setCurrentPage: ReturnType<typeof useApp>['setCurrentPage'];
    prevPage: ReturnType<typeof useApp>['prevPage'];
    logout: ReturnType<typeof useApp>['logout'];
    addresses: Address[];
    defaultAddressId: string | null;
    setAddresses: (a: Address[]) => void;
    setDefaultAddressId: (id: string | null) => void;
    referral: ReturnType<typeof useApp>['referral'];
    setReferral: ReturnType<typeof useApp>['setReferral'];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 profile-page">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentPage(prevPage || 'home')}
            className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold">Profile</h1>
          <div className="w-24" />
        </div>
        <div className="bg-white rounded-3xl shadow p-6 mb-6 profile-card">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-2xl">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || 'Avatar'} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.fullName ? user.fullName[0] : 'G'}</span>
              )}
            </div>
            <div>
              <div className="text-xl font-bold">{user?.fullName}</div>
              <div className="text-sm text-gray-600">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 stat-grid">
          <div className="bg-white rounded-2xl p-4 shadow profile-card">
            <div className="text-sm text-gray-500">Wallet Balance</div>
            <div className="text-lg font-bold">₹{wallet?.balance?.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow profile-card">
            <div className="text-sm text-gray-500">Rewards</div>
            <div className="text-lg font-bold">{rewards?.points} pts</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow profile-card">
            <div className="text-sm text-gray-500">Orders</div>
            <div className="text-lg font-bold">View Orders</div>
            <button onClick={() => setCurrentPage('shopping-home')} className="mt-2 text-sm text-blue-600">Go to Shop</button>
          </div>
        </div>

        {/* Recently viewed with module tabs */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6 profile-card">
          <RecentActivity max={12} showTitle={true} />
        </div>

        {/* Referral card */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6 profile-card">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Gift className="w-5 h-5 text-amber-600" /> Referral</h3>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <div>Your code</div>
              <div className="font-mono text-lg font-bold">{referral?.myCode}</div>
            </div>
            <button onClick={async()=>{ try { await navigator.clipboard.writeText(referral?.myCode || ''); alert('Copied!'); } catch { /* ignore clipboard errors */ } }} className="px-3 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 inline-flex items-center gap-2 text-sm"><Copy className="w-4 h-4" /> Copy</button>
          </div>
          <div className="mt-3 text-xs text-gray-600">Credits: ₹{referral?.credits || 0}{referral?.referredBy ? ` • Referred by ${referral.referredBy}` : ''}</div>
          {!referral?.referredBy && (
            <div className="mt-3 flex gap-2">
              <input placeholder="Have a friend's code?" className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg" id="ref-input" />
              <button onClick={()=>{ const el = document.getElementById('ref-input') as HTMLInputElement | null; const val = el?.value?.trim().toUpperCase(); if (val) { const upd = { ...referral, referredBy: val }; setReferral(upd); localStorage.setItem('referral', JSON.stringify(upd)); } }} className="px-3 py-2 bg-teal-600 text-white rounded-lg">Apply</button>
            </div>
          )}
        </div>

        {/* Default address quick card */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6 profile-card">
          <h3 className="font-bold text-lg mb-3">Delivery Address</h3>
          {addresses && addresses.length > 0 ? (
            (() => {
              const addr = addresses.find((a: Address) => a.id === defaultAddressId) || addresses[0];
              return (
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold">{addr.name} • {addr.phone}</div>
                    <div>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</div>
                    <div>{addr.city}, {addr.state} - {addr.pincode}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage('manage-addresses')} className="px-3 py-2 text-sm bg-gray-100 rounded-lg">Manage</button>
                    <button onClick={() => {
                      // delete default; pick next
                      const rest = addresses.filter((a: Address) => a.id !== addr.id);
                      setAddresses(rest);
                      if (rest[0]) setDefaultAddressId(rest[0].id); else setDefaultAddressId(null);
                    }} className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg border border-red-200">Delete</button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-gray-600 text-sm">No address added</div>
              <button onClick={() => setCurrentPage('manage-addresses')} className="px-4 py-2 bg-teal-600 text-white rounded-lg">Add Address</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow mb-6 profile-card">
          <h3 className="font-bold text-lg mb-3">Account Settings</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <button onClick={() => setCurrentPage('edit-profile')} className="text-blue-600 hover:underline">Edit Profile</button>
            </li>
            
            <li>
              <button onClick={() => setCurrentPage('manage-addresses')} className="text-blue-600 hover:underline">Manage Addresses</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('payment-methods')} className="text-blue-600 hover:underline">Payment Methods</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('privacy-security')} className="text-blue-600 hover:underline">Privacy & Security</button>
            </li>
            <li>
              <button onClick={logout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100">
                Logout
              </button>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow profile-card">
          <h3 className="font-bold text-lg mb-3">Support & Privacy</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <button onClick={() => setCurrentPage('help-center')} className="text-blue-600 hover:underline">Help Center</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('terms')} className="text-blue-600 hover:underline">Terms & Conditions</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('privacy-policy')} className="text-blue-600 hover:underline">Privacy Policy</button>
            </li>
          </ul>
          {/* Contact Support */}
          <div className="mt-4 p-4 border-2 border-teal-200 rounded-xl bg-teal-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-teal-700" />
              <div>
                <div className="text-sm text-gray-600">Contact Support</div>
                <a href="tel:9652297686" className="text-lg font-bold text-teal-700 hover:underline">
                  9652297686
                </a>
              </div>
            </div>
            <a href="tel:9652297686" className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700">Call</a>
          </div>
          <div className="mt-4">
            <button onClick={() => setCurrentPage('open-on-phone')} className="px-4 py-2 bg-gray-900 text-white rounded-xl">Open on Phone (QR)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ArrowLeft, ShieldCheck, Smartphone, LogOut, Download, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PrivacySecurity() {
  const { setCurrentPage, prevPage, privacy, setPrivacy, sessions, logoutAllSessions, logoutSession, user, setUser } = useApp();

  const toggle = (key: keyof typeof privacy) => setPrivacy({ ...privacy, [key]: !privacy[key] });

  const downloadData = () => {
    try {
      const blob = new Blob([JSON.stringify({ user, privacy, sessions }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gozy-my-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const deleteAccount = () => {
    if (!confirm('This will delete your local demo data and log you out. Continue?')) return;
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
    try {
      localStorage.clear();
      setUser(null);
      setCurrentPage('login');
    } catch {
      setUser(null);
      setCurrentPage('login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentPage(prevPage || 'profile')} className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Privacy & Security</h1>
          <div className="w-24" />
        </div>

        {/* Privacy toggles */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h2 className="font-semibold text-lg">Privacy preferences</h2>
          </div>
          <div className="space-y-4">
            <ToggleRow label="Marketing emails" checked={privacy.marketingEmails} onChange={() => toggle('marketingEmails')} helper="Product updates and offers" />
            <ToggleRow label="SMS alerts" checked={privacy.smsAlerts} onChange={() => toggle('smsAlerts')} helper="Transactional and OTP messages" />
            <ToggleRow label="Personalized offers" checked={privacy.personalizedOffers} onChange={() => toggle('personalizedOffers')} helper="Use activity to improve deals" />
            <ToggleRow label="Crash analytics" checked={privacy.crashAnalytics} onChange={() => toggle('crashAnalytics')} helper="Allow anonymous diagnostics" />
            <ToggleRow label="Two‑factor authentication (stub)" checked={privacy.twoFactorEnabled} onChange={() => toggle('twoFactorEnabled')} helper="Demo toggle only" />
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-600" />
              <h2 className="font-semibold text-lg">Active sessions</h2>
            </div>
            <button onClick={logoutAllSessions} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
              <LogOut className="w-4 h-4" /> Logout all devices
            </button>
          </div>
          <ul className="divide-y">
            {sessions.map(s => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.device}{s.current ? ' • This device' : ''}</div>
                  <div className="text-xs text-gray-600">{s.location || 'Unknown'} • Last active {new Date(s.lastActive).toLocaleString()}</div>
                </div>
                {s.current ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Current</span>
                ) : (
                  <button onClick={() => logoutSession(s.id)} className="text-xs underline text-red-700 hover:text-red-800">Logout</button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Data controls */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="font-semibold text-lg mb-4">Your data</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={downloadData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50">
              <Download className="w-4 h-4" /> Download my data
            </button>
            <button onClick={deleteAccount} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> Delete account
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">This demo keeps data in your browser only.</p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, helper, checked, onChange }: { label: string; helper?: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-start justify-between gap-4">
      <div>
        <div className="font-medium">{label}</div>
        {helper && <div className="text-xs text-gray-600">{helper}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`w-12 h-7 rounded-full p-1 transition-colors ${checked ? 'bg-teal-600' : 'bg-gray-300'}`}
      >
        <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );
}

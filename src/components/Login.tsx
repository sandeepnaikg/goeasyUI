import { useState } from 'react';
import { Globe, AtSign, Apple, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { setUser, setCurrentPage, signInWithOtp, signInWithGoogle } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleLogin = () => {
    // Mock login - in a real app you'd call backend / OAuth flows
    setUser({ id: 'u123', email, fullName: 'Gozy User', phone: '' });
    setCurrentPage('home');
  };

  const oauthLogin = (provider: string) => {
    // Stubbed OAuth handlers — replace with real flows later
    setUser({ id: `oauth_${provider}`, email: `${provider}@gozy.com`, fullName: `${provider} User`, phone: '' });
    setCurrentPage('home');
  };

  const handleOtp = async () => {
    const p = phone.trim();
    if (!p) { setStatus('Enter phone number'); return; }
    setStatus('Sending OTP...');
    const res = await signInWithOtp(p);
    setStatus(res.ok ? 'OTP sent! Check your phone.' : res.message || 'Failed to send OTP');
    if (res.ok) setCurrentPage('home');
  };

  const handleGoogle = async () => {
    setStatus('Redirecting to Google...');
    const res = await signInWithGoogle();
    if (!res.ok && res.message) setStatus(res.message);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-16 md:py-24">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <h1 className="text-2xl font-bold mb-4">Sign in to GOZY</h1>

          <div className="space-y-3 mb-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 border-2 rounded-xl" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full px-4 py-3 border-2 rounded-xl" />
            <button onClick={handleLogin} className="w-full py-4 text-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold">Login</button>
          </div>

          <div className="text-center text-sm text-gray-500 mb-3">Or continue with</div>
          <div className="flex items-center justify-between gap-3">
            <button onClick={handleGoogle} className="flex-1 py-3 md:py-4 border rounded-xl flex items-center justify-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Google</span>
            </button>
            <button onClick={() => oauthLogin('microsoft')} className="flex-1 py-3 md:py-4 border rounded-xl flex items-center justify-center space-x-2">
              <AtSign className="w-5 h-5" />
              <span>Microsoft</span>
            </button>
            <button onClick={() => oauthLogin('apple')} className="flex-1 py-3 md:py-4 border rounded-xl flex items-center justify-center space-x-2">
              <Apple className="w-5 h-5" />
              <span>Apple</span>
            </button>
          </div>

          <div className="mt-6">
            <div className="text-center text-sm text-gray-500 mb-3">Or one-tap sign-in with OTP</div>
            <div className="flex gap-2">
              <input value={phone} onChange={(e)=> setPhone(e.target.value)} placeholder="Phone number" className="flex-1 px-4 py-3 border-2 rounded-xl" />
              <button onClick={handleOtp} className="px-4 py-3 bg-teal-600 text-white rounded-xl flex items-center gap-2"><Phone className="w-4 h-4"/> Send OTP</button>
            </div>
          </div>

          {status && <div className="mt-4 text-sm text-gray-600">{status}</div>}

          <div className="mt-6 text-sm text-gray-600">
            Don't have an account? <button onClick={() => setCurrentPage('signup')} className="text-teal-600 font-semibold">Create one</button>
          </div>
        </div>
      </div>
    </div>
  );
}

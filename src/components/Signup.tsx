import { useEffect, useState } from 'react';
import { Globe, AtSign, Apple } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Signup() {
  const { setUser, setCurrentPage } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prefProvider, setPrefProvider] = useState<string | null>(null);

  const handleSignup = () => {
    setUser({ id: 'u_new', email, fullName: name, phone: '' });
    const intended = localStorage.getItem('intendedPage');
    if (intended) {
      localStorage.removeItem('intendedPage');
      setCurrentPage(intended);
    } else {
      setCurrentPage('home');
    }
  };

  const oauthSignup = (provider: string) => {
    setUser({ id: `oauth_${provider}`, email: `${provider}@gozy.com`, fullName: `${provider} User`, phone: '' });
    const intended = localStorage.getItem('intendedPage');
    if (intended) {
      localStorage.removeItem('intendedPage');
      setCurrentPage(intended);
    } else {
      setCurrentPage('home');
    }
  };

  useEffect(() => {
    try {
      const hint = localStorage.getItem('quickAuthProvider');
      if (hint) {
        setPrefProvider(hint);
        // auto-trigger once, then clear
        localStorage.removeItem('quickAuthProvider');
        setTimeout(() => {
          // call without adding oauthSignup to deps to avoid reruns
          setUser({ id: `oauth_${hint}`, email: `${hint}@gozy.com`, fullName: `${hint} User`, phone: '' });
          const intended = localStorage.getItem('intendedPage');
          if (intended) {
            localStorage.removeItem('intendedPage');
            setCurrentPage(intended);
          } else {
            setCurrentPage('home');
          }
        }, 350); // small delay for UX
      }
    } catch { /* ignore */ }
  }, [setUser, setCurrentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-16 md:py-24">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <h1 className="text-2xl font-bold mb-4">Create your GOZY account</h1>

          <div className="space-y-3 mb-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-3 border-2 rounded-xl" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 border-2 rounded-xl" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full px-4 py-3 border-2 rounded-xl" />
            <button onClick={handleSignup} className="w-full py-4 text-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold">Create Account</button>
          </div>

          <div className="text-center text-sm text-gray-500 mb-3">Or continue with</div>
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => oauthSignup('google')} className={`flex-1 py-3 md:py-4 border rounded-xl flex items-center justify-center space-x-2 ${prefProvider==='google' ? 'ring-2 ring-teal-500' : ''}`}>
              <Globe className="w-5 h-5" />
              <span>Google</span>
            </button>
            <button onClick={() => oauthSignup('microsoft')} className={`flex-1 py-3 md:py-4 border rounded-xl flex items-center justify-center space-x-2 ${prefProvider==='microsoft' ? 'ring-2 ring-teal-500' : ''}`}>
              <AtSign className="w-5 h-5" />
              <span>Microsoft</span>
            </button>
            <button onClick={() => oauthSignup('apple')} className={`flex-1 py-3 md:py-4 border rounded-xl flex items-center justify-center space-x-2 ${prefProvider==='apple' ? 'ring-2 ring-teal-500' : ''}`}>
              <Apple className="w-5 h-5" />
              <span>Apple</span>
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            Already have an account? <button onClick={() => setCurrentPage('login')} className="text-teal-600 font-semibold">Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}

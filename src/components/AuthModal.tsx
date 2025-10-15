import { useState } from 'react';
import { X } from 'lucide-react';
import Login from './Login';
import Signup from './Signup';
import { useApp } from '../context/AppContext';

export default function AuthModal() {
  const { closeAuthModal } = useApp();
  const [tab, setTab] = useState<'login' | 'signup'>('signup');

  return (
    <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={closeAuthModal} className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100">
          <X className="w-4 h-4" />
        </button>
        <div className="flex gap-2 mb-4">
          <button className={`flex-1 py-2 rounded-xl ${tab==='signup'? 'bg-teal-600 text-white' : 'bg-gray-100'}`} onClick={()=>setTab('signup')}>Sign up</button>
          <button className={`flex-1 py-2 rounded-xl ${tab==='login'? 'bg-teal-600 text-white' : 'bg-gray-100'}`} onClick={()=>setTab('login')}>Login</button>
        </div>
        <div>
          {tab === 'signup' ? <Signup /> : <Login />}
        </div>
      </div>
    </div>
  );
}

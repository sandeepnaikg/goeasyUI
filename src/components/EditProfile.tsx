import { useEffect, useRef, useState } from 'react';
import { Camera, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function EditProfile() {
  const { user, setUser, setCurrentPage, prevPage } = useApp();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; avatar?: string }>({});

  useEffect(() => {
    setFullName(user?.fullName || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setAvatarUrl(user?.avatarUrl);
  }, [user]);

  const onPick = () => fileRef.current?.click();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Validate size (<= 2MB) and type (jpeg/png/webp)
    const allowed = ['image/jpeg','image/png','image/webp'];
    if (!allowed.includes(f.type)) {
      setErrors(prev => ({ ...prev, avatar: 'Only JPEG, PNG or WEBP images are allowed' }));
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Image must be 2 MB or smaller' }));
      return;
    }
    setErrors(prev => ({ ...prev, avatar: undefined }));
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!fullName.trim()) next.name = 'Name is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email.trim())) next.email = 'Enter a valid email address';
    // Indian phone pattern (basic): allows +91 or 0 prefix, and 10 digits starting with 6-9
    const phoneDigits = phone.trim().replace(/\D+/g, '');
    const isIN = /^(?:91)?[6-9]\d{9}$/.test(phoneDigits) || /^(?:0)?[6-9]\d{9}$/.test(phoneDigits);
    if (!isIN) next.phone = 'Enter a valid Indian mobile number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = () => {
    if (!validate()) return;
    const updated = {
      id: user?.id || '1',
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatarUrl,
    };
    setUser(updated);
    try { localStorage.setItem('user', JSON.stringify(updated)); } catch { /* ignore */ }
    setCurrentPage('profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentPage(prevPage || 'profile')} className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors"><ArrowLeft className="w-5 h-5"/><span>Back</span></button>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <div className="w-24" />
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gray-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">{fullName?.[0] || 'G'}</div>
              )}
              <button onClick={onPick} className="absolute bottom-1 right-1 p-1.5 rounded-full bg-white shadow border"><Camera className="w-4 h-4"/></button>
            </div>
            <input ref={fileRef} onChange={onFile} type="file" accept="image/*" className="hidden" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your name" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'}`}/>
              {errors.name && <div className="mt-1 text-xs text-red-600">{errors.name}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'}`}/>
              {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" placeholder="+91 98765 43210" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'}`}/>
              {errors.phone && <div className="mt-1 text-xs text-red-600">{errors.phone}</div>}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button onClick={() => setCurrentPage('profile')} className="px-5 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50">Cancel</button>
            <button onClick={onSave} className="px-6 py-3 rounded-xl text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!(errors.name || errors.email || errors.phone || errors.avatar)}>
              Save
            </button>
          </div>
          {errors.avatar && <div className="mt-2 text-xs text-red-600">{errors.avatar}</div>}
        </div>
      </div>
    </div>
  );
}

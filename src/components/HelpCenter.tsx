import { ArrowLeft, ChevronDown, Phone, Mail, Send } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { SupportTicket } from '../types';

const FAQ = [
  { q: 'How do I apply promo codes?', a: 'On the payment page, tap Offers to view and apply the best code. Wallet + code may stack up to the cap.' },
  { q: 'Where can I see my orders?', a: 'Go to Profile > Orders or open the module-specific tracking pages.' },
  { q: 'How do I change my address?', a: 'Profile > Manage Addresses lets you add, edit, delete, and set a default address.' },
  { q: 'How can I set a default payment method?', a: 'Profile > Payment Methods to manage cards and UPI. You can set defaults there or after a payment.' },
  { q: 'How do I contact support?', a: 'Use the form below, or call us directly at the number shown.' },
];

export default function HelpCenter() {
  const { setCurrentPage, prevPage, addTicket, tickets, updateTicketStatus } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  const [form, setForm] = useState<{ subject: string; category: SupportTicket['category']; description: string; email: string }>({ subject: '', category: 'Payments', description: '', email: '' });
  const latest = useMemo(() => tickets?.slice(0, 5) || [], [tickets]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.description || !form.email) return alert('Please fill subject, description and email.');
  const t = addTicket({ subject: form.subject, category: form.category, description: form.description, email: form.email });
    setForm({ subject: '', category: 'Payments', description: '', email: '' });
    alert(`Ticket submitted (#${t.id}). Our team will reach out soon.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentPage(prevPage || 'profile')} className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Help Center</h1>
          <div className="w-24" />
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <h2 className="font-semibold text-lg mb-3">FAQs</h2>
          <ul className="divide-y">
            {FAQ.map((item, idx) => (
              <li key={idx} className="py-3">
                <button onClick={() => setOpen(open === idx ? null : idx)} className="w-full flex items-center justify-between text-left">
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${open === idx ? 'rotate-180' : ''}`} />
                </button>
                {open === idx && <p className="mt-2 text-sm text-gray-700">{item.a}</p>}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <h2 className="font-semibold text-lg mb-3">Contact us</h2>
          <div className="flex items-center gap-6 text-sm text-gray-700">
            <a href="tel:9652297686" className="inline-flex items-center gap-2 text-teal-700"><Phone className="w-4 h-4" /> 9652297686</a>
            <a href="mailto:support@gozy.com" className="inline-flex items-center gap-2 text-teal-700"><Mail className="w-4 h-4" /> support@gozy.com</a>
          </div>
        </div>

        {/* Raise a ticket */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="font-semibold text-lg mb-3">Raise a ticket</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm">Subject</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Payment failed, order not received, etc." />
            </div>
            <div>
              <label className="text-sm">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as SupportTicket['category'] })} className="mt-1 w-full border rounded-lg px-3 py-2">
                <option>Payments</option>
                <option>Orders</option>
                <option>Technical</option>
                <option>Account</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" rows={4} />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="you@example.com" />
            </div>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Send className="w-4 h-4" /> Submit ticket
            </button>
          </form>

          {latest.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Recent tickets</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {latest.map(t => (
                  <li key={t.id} className="flex items-center justify-between gap-3">
                    <span className="truncate">#{t.id} • {t.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{t.status}</span>
                      {t.status === 'Open' && (
                        <>
                          <button className="text-xs underline text-emerald-700" onClick={()=>updateTicketStatus(t.id,'Resolved')}>Resolve</button>
                          <button className="text-xs underline text-red-700" onClick={()=>updateTicketStatus(t.id,'Closed')}>Close</button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

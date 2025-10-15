import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotificationsInbox() {
  const { notifications, markNotificationRead, setCurrentPage } = useApp();
  if (!notifications || notifications.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <div className="text-2xl font-bold mb-2">No notifications yet</div>
            <div className="text-gray-600">We’ll keep you posted on orders, offers and price alerts.</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="text-xl font-bold mb-3">Notifications</div>
          <ul className="divide-y">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 p-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${n.read ? 'bg-gray-300' : 'bg-teal-500'}`} />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{n.title}</div>
                  <div className="text-gray-700 text-sm">{n.message}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                {!n.read && (
                  <button onClick={() => markNotificationRead(n.id)} className="text-sm text-teal-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 text-center">
          <button onClick={() => setCurrentPage('home')} className="text-blue-600 hover:underline">Back to Home</button>
        </div>
      </div>
    </div>
  );
}

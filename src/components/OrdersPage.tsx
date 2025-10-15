import { useEffect, useState } from 'react';
import { Package, UtensilsCrossed, Film, Plane } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { RefundRequest } from '../types';

interface ShoppingOrder {
  id: string;
  total: number;
  createdAt: string;
  status: string;
  trackingNumber?: string;
}

interface FoodOrder {
  id: string;
  total: number;
  createdAt: string;
  status: string;
  restaurant?: { name?: string };
}

interface TicketOrder {
  id: string;
  total: number;
  seats: unknown[];
  createdAt: string;
  status?: string;
}

interface TravelOrder {
  id: string;
  total: number;
  flight?: { airline?: string };
  createdAt: string;
  status?: string;
}


export default function OrdersPage() {
  const [shoppingOrders, setShoppingOrders] = useState<ShoppingOrder[]>([]);
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([]);
  const [ticketOrders, setTicketOrders] = useState<TicketOrder[]>([]);
  const [travelOrders, setTravelOrders] = useState<TravelOrder[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const { setCurrentPage } = useApp();

  useEffect(() => {
    try {
      const sh = JSON.parse(localStorage.getItem('shoppingOrderHistory') || '[]');
      setShoppingOrders(sh);
    } catch {
      // Ignore JSON parse errors
    }
    try {
      const fo = JSON.parse(localStorage.getItem('foodOrderHistory') || '[]');
      setFoodOrders(fo);
    } catch {
      // Ignore JSON parse errors
    }
    try {
      const to = JSON.parse(localStorage.getItem('ticketOrderHistory') || '[]');
      setTicketOrders(to);
  } catch {/* ignore */}
    try {
      const tr = JSON.parse(localStorage.getItem('travelOrderHistory') || '[]');
      setTravelOrders(tr);
  } catch {/* ignore */}

    try {
      const rf = JSON.parse(localStorage.getItem('refundRequests') || '[]');
      setRefunds(rf);
    } catch { /* ignore */ }
  }, []);

  const formatDate = (iso: string) => new Date(iso).toLocaleString();
  const hasRefund = (module: RefundRequest['module'], orderId: string) =>
    refunds.some(r => r.module === module && r.orderId === orderId);

  const requestRefund = (
    module: RefundRequest['module'],
    order: { id: string; total: number }
  ) => {
    if (hasRefund(module, order.id)) return;
    const newReq: RefundRequest = {
      id: `REF-${Date.now()}`,
      orderId: order.id,
      module,
      amount: Number(order.total) || 0,
      createdAt: new Date().toISOString(),
      status: 'Requested',
    };
    const next = [newReq, ...refunds];
    setRefunds(next);
    localStorage.setItem('refundRequests', JSON.stringify(next));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Recent Orders</h1>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2"><Package className="w-5 h-5" /><span>Shopping</span></h2>
          {shoppingOrders.length === 0 && <div className="text-gray-600">No shopping orders yet.</div>}
          <div className="space-y-4">
            {shoppingOrders.map(o => (
              <div key={o.id} className="bg-white rounded-2xl p-4 shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold">{o.id}</div>
                  <div className="text-sm text-gray-600">{formatDate(o.createdAt)}</div>
                  <div className="text-sm text-gray-500">Status: {o.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">₹{o.total.toLocaleString()}</div>
                  {o.trackingNumber && <div className="text-xs text-gray-500">{o.trackingNumber}</div>}
                  <button onClick={() => setCurrentPage('shopping-tracking')} className="mt-2 text-sm text-blue-600 hover:underline">Track →</button>
                  <button
                    disabled={hasRefund('shopping', o.id)}
                    onClick={() => requestRefund('shopping', o)}
                    className="mt-2 text-xs px-3 py-1 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {hasRefund('shopping', o.id) ? 'Refund requested' : 'Request refund'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2"><UtensilsCrossed className="w-5 h-5" /><span>Food</span></h2>
          {foodOrders.length === 0 && <div className="text-gray-600">No food orders yet.</div>}
          <div className="space-y-4">
            {foodOrders.map(o => (
              <div key={o.id} className="bg-white rounded-2xl p-4 shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold">{o.id} {o.restaurant?.name ? `• ${o.restaurant.name}` : ''}</div>
                  <div className="text-sm text-gray-600">{formatDate(o.createdAt)}</div>
                  <div className="text-sm text-gray-500">Status: {o.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">₹{o.total.toLocaleString()}</div>
                  <button onClick={() => setCurrentPage('food-tracking')} className="mt-2 text-sm text-blue-600 hover:underline">Track →</button>
                  <button
                    disabled={hasRefund('food', o.id)}
                    onClick={() => requestRefund('food', o)}
                    className="mt-2 text-xs px-3 py-1 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {hasRefund('food', o.id) ? 'Refund requested' : 'Request refund'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2"><Film className="w-5 h-5" /><span>Tickets</span></h2>
          {ticketOrders.length === 0 && <div className="text-gray-600">No ticket bookings yet.</div>}
          <div className="space-y-4">
            {ticketOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl p-4 shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold">{o.id}</div>
                  <div className="text-sm text-gray-600">{formatDate(o.createdAt)}</div>
                  <div className="text-sm text-gray-500">Seats: {Array.isArray(o.seats) ? o.seats.length : 0}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">₹{o.total?.toLocaleString?.() || o.total}</div>
                  <button onClick={() => setCurrentPage('tickets-confirmation')} className="mt-2 text-sm text-blue-600 hover:underline">View QR →</button>
                  <button
                    disabled={hasRefund('tickets', o.id)}
                    onClick={() => requestRefund('tickets', { id: o.id, total: Number(o.total) || 0 })}
                    className="mt-2 text-xs px-3 py-1 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {hasRefund('tickets', o.id) ? 'Refund requested' : 'Request refund'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2"><Plane className="w-5 h-5" /><span>Travel</span></h2>
          {travelOrders.length === 0 && <div className="text-gray-600">No travel bookings yet.</div>}
          <div className="space-y-4">
            {travelOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl p-4 shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold">{o.id} {o.flight?.airline ? `• ${o.flight.airline}` : ''}</div>
                  <div className="text-sm text-gray-600">{formatDate(o.createdAt)}</div>
                  <div className="text-sm text-gray-500">Status: {o.status}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">₹{o.total?.toLocaleString?.() || o.total}</div>
                  <button onClick={() => setCurrentPage('travel-confirmation')} className="mt-2 text-sm text-blue-600 hover:underline">View Ticket →</button>
                  <button
                    disabled={hasRefund('travel', o.id)}
                    onClick={() => requestRefund('travel', { id: o.id, total: Number(o.total) || 0 })}
                    className="mt-2 text-xs px-3 py-1 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {hasRefund('travel', o.id) ? 'Refund requested' : 'Request refund'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refunds */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Refund requests</h2>
          {(!refunds || refunds.length === 0) && <div className="text-gray-600">No refunds requested yet.</div>}
          <div className="space-y-3">
            {refunds && refunds.map((r: RefundRequest) => (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow flex items-center justify-between">
                <div>
                  <div className="font-semibold">{r.id}</div>
                  <div className="text-sm text-gray-600">{formatDate(r.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{Number(r.amount||0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{r.status || 'Requested'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

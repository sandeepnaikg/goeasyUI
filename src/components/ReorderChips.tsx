import { useEffect, useState } from 'react';
import { UtensilsCrossed, ShoppingBag, Ticket, Plane } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Chip = { id: string; type: 'food' | 'shopping' | 'tickets' | 'travel'; label: string };

export default function ReorderChips() {
  const [chips, setChips] = useState<Chip[]>([]);
  const { setCurrentModule, setCurrentPage } = useApp();

  useEffect(() => {
    try {
      const picks: Chip[] = [];
      const take = (arr: unknown[] | null | undefined, map: (x: unknown) => Chip | null) => {
        if (!arr) return;
        for (const x of arr.slice(0, 1)) {
          const c = map(x);
          if (c) picks.push(c);
        }
      };
      const asObj = (x: unknown): Record<string, unknown> | null => (x && typeof x === 'object' ? (x as Record<string, unknown>) : null);
      const s = (o: Record<string, unknown> | null, k: string): string | undefined => (o && typeof o[k] === 'string' ? (o[k] as string) : undefined);
      const arrLen = (v: unknown): number => (Array.isArray(v) ? v.length : 0);

      take(JSON.parse(localStorage.getItem('foodOrderHistory') || '[]'), (o) => {
        const O = asObj(o); if (!O) return null; const rest = asObj(O['restaurant']); const name = s(rest, 'name'); const id = s(O, 'id') || `food-${Date.now()}`;
        if (!name) return null; return { id, type: 'food', label: `Order ${name}` };
      });
      take(JSON.parse(localStorage.getItem('shoppingOrderHistory') || '[]'), (o) => {
        const O = asObj(o); if (!O) return null; const count = arrLen(O['items']); const id = s(O, 'id') || `shop-${Date.now()}`; return { id, type: 'shopping', label: `Buy ${count} item(s)` };
      });
      take(JSON.parse(localStorage.getItem('ticketOrderHistory') || '[]'), (o) => {
        const O = asObj(o); if (!O) return null; const show = asObj(O['show']); const movie = asObj(show ? show['movie'] : undefined); const title = s(movie, 'title'); const id = s(O, 'id') || `tick-${Date.now()}`;
        return { id, type: 'tickets', label: `Book ${title || 'tickets'}` };
      });
      take(JSON.parse(localStorage.getItem('travelOrderHistory') || '[]'), (o) => {
        const O = asObj(o); if (!O) return null; const type = s(O, 'type'); const id = s(O, 'id') || `trvl-${Date.now()}`; return { id, type: 'travel', label: `Rebook ${type || 'trip'}` };
      });
      setChips(picks.slice(0, 3));
    } catch { /* ignore */ }
  }, []);

  if (chips.length === 0) return null;

  const go = (c: Chip) => {
    setCurrentModule(c.type);
    setCurrentPage(`${c.type}-home`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      {chips.map((c) => (
        <button key={c.id} onClick={() => go(c)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow text-sm whitespace-nowrap">
          {c.type === 'food' && <UtensilsCrossed className="w-4 h-4 text-rose-600" />}
          {c.type === 'shopping' && <ShoppingBag className="w-4 h-4 text-orange-600" />}
          {c.type === 'tickets' && <Ticket className="w-4 h-4 text-purple-600" />}
          {c.type === 'travel' && <Plane className="w-4 h-4 text-teal-600" />}
          <span className="font-semibold">{c.label}</span>
        </button>
      ))}
    </div>
  );
}

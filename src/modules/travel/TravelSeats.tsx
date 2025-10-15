import { useEffect, useMemo, useState } from 'react';
import { Armchair } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type Mode = 'flight' | 'bus' | 'train';

type SeatInfo = {
  id: string;
  label: string;
  type: 'window' | 'aisle' | 'middle';
  selected?: boolean;
  disabled?: boolean;
};

export default function TravelSeats() {
  const { setCurrentPage } = useApp();
  const [mode, setMode] = useState<Mode>('flight');
  const [seats, setSeats] = useState<SeatInfo[]>([]);
  const [requiredCount, setRequiredCount] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [trainClass, setTrainClass] = useState<'2S'|'CC'|'3A'>('2S');
  const [busSleeper, setBusSleeper] = useState<boolean>(false);

  useEffect(() => {
    // Prefer explicit booking type if available to avoid stale selections influencing the UI
    const bt = (localStorage.getItem('bookingType') || '').toLowerCase();
    if (bt === 'bus' || bt === 'flight' || bt === 'train') {
      setMode(bt as Mode);
    } else {
      const hasFlight = !!localStorage.getItem('selectedFlight');
      const hasBus = !!localStorage.getItem('selectedBus');
      const hasTrain = !!localStorage.getItem('selectedTrain');
      if (hasTrain && !hasFlight && !hasBus) setMode('train');
      else if (hasBus && !hasFlight) setMode('bus');
      else setMode('flight');
    }
    try {
      const t = JSON.parse(localStorage.getItem('selectedTrain') || '{}');
      if (t && (t.class === '2S' || t.class === 'CC' || t.class === '3A')) setTrainClass(t.class);
    } catch {/* ignore */}
    try {
      const b = JSON.parse(localStorage.getItem('selectedBus') || '{}');
      if (b && typeof b.busType === 'string') setBusSleeper(/sleeper/i.test(b.busType));
    } catch {/* ignore */}
    try {
      const search = JSON.parse(localStorage.getItem('travelSearch') || '{}');
      const trav = Number(search.travelers) || 1;
      setRequiredCount(trav);
    } catch {
      setRequiredCount(1);
    }
  }, []);

  useEffect(() => {
    if (mode === 'flight') {
      // Flight rows 1-15, A-F (3+3)
      const letters = ['A','B','C','D','E','F'];
      const list: SeatInfo[] = [];
      for (let r = 1; r <= 15; r++) {
        for (const l of letters) {
          const type: SeatInfo['type'] = (l==='A'||l==='F') ? 'window' : (l==='C'||l==='D') ? 'aisle' : 'middle';
          list.push({ id: `F-${r}${l}`, label: `${r}${l}`, type });
        }
      }
      setSeats(list);
    } else if (mode === 'bus') {
      // Bus seat maps: Seater (2x2) or Sleeper (upper/lower berths)
      const list: SeatInfo[] = [];
      if (!busSleeper) {
        for (let r = 1; r <= 12; r++) {
          list.push({ id: `B-L${r}W`, label: `L${r}`, type: 'window' });
          list.push({ id: `B-L${r}A`, label: `L${r}A`, type: 'aisle' });
          list.push({ id: `B-R${r}A`, label: `R${r}A`, type: 'aisle' });
          list.push({ id: `B-R${r}W`, label: `R${r}`, type: 'window' });
        }
      } else {
        // Sleeper: two levels, each 1+1 arrangement, 10 rows
        for (const level of ['L', 'U'] as const) { // Lower, Upper
          for (let r = 1; r <= 10; r++) {
            list.push({ id: `B-${level}-L${r}`, label: `${level}${r}L`, type: 'window' });
            list.push({ id: `B-${level}-R${r}`, label: `${level}${r}R`, type: 'window' });
          }
        }
      }
      setSeats(list);
    } else {
      // Train layout depends on class
      const list: SeatInfo[] = [];
      if (trainClass === '3A') {
        // 10 compartments; each with LB/MB/UB on both sides and Side Lower/Upper
        const berthLabels = ['LB','MB','UB'];
        for (let c = 1; c <= 10; c++) {
          for (const side of ['L','R'] as const) {
            for (const b of berthLabels) {
              const id = `T-${c}${side}-${b}`;
              // consider window berths as LB/UB, aisle as MB for simplicity
              const type: SeatInfo['type'] = b === 'MB' ? 'middle' : 'window';
              list.push({ id, label: `${c}${side}${b}`, type });
            }
          }
          // side berths
          list.push({ id: `T-${c}-SL`, label: `${c}SL`, type: 'window' });
          list.push({ id: `T-${c}-SU`, label: `${c}SU`, type: 'window' });
        }
      } else {
        // 2S or CC: 3+2 seating A B C | D E
        const letters = ['A','B','C','D','E'];
        for (let r = 1; r <= 20; r++) {
          for (const l of letters) {
            const type: SeatInfo['type'] = (l==='A'||l==='E') ? 'window' : (l==='C'||l==='D') ? 'aisle' : 'middle';
            list.push({ id: `T-${r}${l}`, label: `${r}${l}`, type });
          }
        }
      }
      setSeats(list);
    }
  }, [mode, trainClass, busSleeper]);

  const selectedCount = useMemo(() => seats.filter(s => s.selected).length, [seats]);
  const ready = selectedCount >= Math.min(requiredCount, seats.length) && selectedCount > 0;

  const toggleSeat = (id: string) => {
    setSeats(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const proceed = () => {
    if (selectedCount < requiredCount) {
      setError(`Select at least ${requiredCount} seat${requiredCount>1?'s':''} to continue`);
      return;
    }
    setError(null);
    let chosen = seats.filter(s => s.selected).map(s => ({ id: s.id, label: s.label, type: s.type }));
    if (chosen.length > requiredCount) chosen = chosen.slice(0, requiredCount);
    localStorage.setItem('selectedTravelSeats', JSON.stringify({ mode, seats: chosen }));
    setCurrentPage('travel-booking');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Choose your {mode === 'flight' ? 'Flight' : mode==='bus' ? 'Bus' : 'Train'} Seats</h1>
          <p className="text-gray-600 mb-4">Select exactly {requiredCount} seat{requiredCount>1?'s':''}. Window seats are marked as such.</p>

          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-700">
            <span className="inline-flex items-center"><Armchair className="w-4 h-4 mr-1 text-sky-600"/> Window</span>
            <span className="inline-flex items-center"><Armchair className="w-4 h-4 mr-1 text-emerald-600"/> Aisle</span>
            {mode==='flight' && <span className="inline-flex items-center"><Armchair className="w-4 h-4 mr-1 text-gray-500"/> Middle</span>}
          </div>

          {/* Mode-specific seat layouts */}
          {mode === 'flight' && (
            <div className="space-y-2 mb-6">
              {Array.from({ length: 15 }).map((_, rIdx) => {
                const r = rIdx + 1;
                const left = ['A','B','C'];
                const right = ['D','E','F'];
                return (
                  <div key={`row-F-${r}`} className="flex items-center justify-center space-x-6">
                    <div className="flex space-x-2">
                      {left.map(l => {
                        const id = `F-${r}${l}`;
                        const s = seats.find(x => x.id === id);
                        return s ? (
                          <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>
                            {s.label}
                          </button>
                        ) : null;
                      })}
                    </div>
                    <div className="w-10" />
                    <div className="flex space-x-2">
                      {right.map(l => {
                        const id = `F-${r}${l}`;
                        const s = seats.find(x => x.id === id);
                        return s ? (
                          <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>
                            {s.label}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {mode === 'bus' && !busSleeper && (
            <div className="space-y-2 mb-6">
              {Array.from({ length: 12 }).map((_, rIdx) => {
                const r = rIdx + 1;
                const left = [`B-L${r}W`, `B-L${r}A`];
                const right = [`B-R${r}A`, `B-R${r}W`];
                return (
                  <div key={`row-B-${r}`} className="flex items-center justify-center space-x-8">
                    <div className="flex space-x-2">
                      {left.map(id => {
                        const s = seats.find(x => x.id === id);
                        return s ? (
                          <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>
                            {s.label}
                          </button>
                        ) : null;
                      })}
                    </div>
                    <div className="w-12" />
                    <div className="flex space-x-2">
                      {right.map(id => {
                        const s = seats.find(x => x.id === id);
                        return s ? (
                          <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>
                            {s.label}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {mode === 'bus' && busSleeper && (
            <div className="space-y-6 mb-6">
              {(['Lower','Upper'] as const).map((lvl, idx) => (
                <div key={lvl}>
                  <div className="mb-2 text-sm font-semibold text-gray-700">{lvl} Berth</div>
                  <div className="space-y-2">
                    {Array.from({ length: 10 }).map((_, rIdx) => {
                      const r = rIdx + 1;
                      const left = [`B-${idx===0?'L':'U'}-L${r}`];
                      const right = [`B-${idx===0?'L':'U'}-R${r}`];
                      return (
                        <div key={`row-BS-${lvl}-${r}`} className="flex items-center justify-center space-x-24">
                          <div className="flex space-x-2">
                            {left.map(id => { const s = seats.find(x => x.id === id); return s ? (
                              <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>{s.label}</button>
                            ) : null; })}
                          </div>
                          <div className="flex space-x-2">
                            {right.map(id => { const s = seats.find(x => x.id === id); return s ? (
                              <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>{s.label}</button>
                            ) : null; })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {mode === 'train' && trainClass !== '3A' && (
            <div className="space-y-2 mb-6">
              {Array.from({ length: 20 }).map((_, rIdx) => {
                const r = rIdx + 1;
                const left = ['A','B','C'];
                const right = ['D','E'];
                return (
                  <div key={`row-T-${r}`} className="flex items-center justify-center space-x-8">
                    <div className="flex space-x-2">
                      {left.map(l => {
                        const id = `T-${r}${l}`;
                        const s = seats.find(x => x.id === id);
                        return s ? (
                          <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>
                            {s.label}
                          </button>
                        ) : null;
                      })}
                    </div>
                    <div className="w-12" />
                    <div className="flex space-x-2">
                      {right.map(l => {
                        const id = `T-${r}${l}`;
                        const s = seats.find(x => x.id === id);
                        return s ? (
                          <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>
                            {s.label}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {mode === 'train' && trainClass === '3A' && (
            <div className="space-y-4 mb-6">
              {Array.from({ length: 10 }).map((_, cIdx) => {
                const c = cIdx + 1;
                const left = [`T-${c}L-LB`,`T-${c}L-MB`,`T-${c}L-UB`];
                const right = [`T-${c}R-LB`,`T-${c}R-MB`,`T-${c}R-UB`];
                const side = [`T-${c}-SL`,`T-${c}-SU`];
                return (
                  <div key={`comp-${c}`} className="flex items-center justify-center space-x-8">
                    <div className="flex space-x-2">
                      {left.map(id => { const s = seats.find(x => x.id === id); return s ? (
                        <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>{s.label}</button>
                      ) : null; })}
                    </div>
                    <div className="w-8" />
                    <div className="flex space-x-2">
                      {right.map(id => { const s = seats.find(x => x.id === id); return s ? (
                        <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>{s.label}</button>
                      ) : null; })}
                    </div>
                    <div className="w-8" />
                    <div className="flex space-x-2">
                      {side.map(id => { const s = seats.find(x => x.id === id); return s ? (
                        <button key={id} onClick={() => toggleSeat(id)} className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold ${s.selected ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-400'}`}>{s.label}</button>
                      ) : null; })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Selected: {selectedCount}/{requiredCount}</div>
            <button
              disabled={!ready}
              onClick={proceed}
              className={`px-6 py-3 rounded-xl font-bold text-white ${ready ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

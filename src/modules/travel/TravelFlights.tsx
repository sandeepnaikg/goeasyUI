import { useEffect, useMemo, useState } from 'react';
import { Plane, Clock, Star, Filter, Luggage, Briefcase, Wifi, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import OffersStrip from '../../components/OffersStrip';

type FareFamily = 'Lite' | 'Value' | 'Flexi';

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string; // 2h 30m
  price: number;
  rating: number;
  stops: number;
  fares: Array<{ family: FareFamily; price: number; baggage: string; refund: string; change: string; perks?: string[] }>
}

function pad2(n: number) { return n.toString().padStart(2, '0'); }
function toTimeLabel(h: number, m: number) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = ((h + 11) % 12) + 1;
  return `${pad2(hr)}:${pad2(m)} ${ampm}`;
}

function generateFlights(from: string, to: string, dateStr: string): FlightResult[] {
  const seed = Math.abs((from + to + dateStr).split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const rng = (n: number) => Math.abs(Math.sin(seed + n));
  const airlines = ['IndiGo', 'Air India', 'Vistara', 'Akasa Air', 'SpiceJet', 'AirAsia'];
  const codes = ['6E', 'AI', 'UK', 'QP', 'SG', 'I5'];
  const res: FlightResult[] = [];
  for (let i = 0; i < 10; i++) {
    const idx = i % airlines.length;
    const depH = 5 + Math.floor(rng(i) * 17); // 5am - 9pm
    const depM = [0, 15, 30, 45][Math.floor(rng(i + 1) * 4)];
    const durH = 1 + Math.floor(rng(i + 2) * 3); // 1-3 hours
    const durM = [0, 15, 30, 45][Math.floor(rng(i + 3) * 4)];
    const arrH = (depH + durH) % 24;
    const arrM = durM;
    const base = 2999 + Math.floor(rng(i + 4) * 6000);
    const stops = rng(i + 5) > 0.75 ? 1 : 0;
    const rating = +(4.0 + rng(i + 6) * 0.8).toFixed(1);
    const price = base + (stops ? -300 : 500);
    const lite = { family: 'Lite' as const, price, baggage: '7kg cabin', refund: 'Non-refundable', change: '₹1500 + fare diff' };
    const value = { family: 'Value' as const, price: price + 600, baggage: '15kg check-in', refund: 'Partial refund', change: '₹1000 + fare diff', perks: ['Seat select'] };
    const flexi = { family: 'Flexi' as const, price: price + 1500, baggage: '20kg check-in', refund: 'Free cancellation window', change: 'Free date change (1x)', perks: ['Priority boarding'] };
    res.push({
      id: `f${i + 1}`,
      airline: airlines[idx],
      flightNumber: `${codes[idx]}-${100 + Math.floor(rng(i + 7) * 900)}`,
      departure: toTimeLabel(depH, depM),
      arrival: toTimeLabel(arrH, arrM),
      duration: `${durH}h ${durM}m`,
      price,
      rating,
      stops,
      fares: [lite, value, flexi],
    });
  }
  return res;
}

export default function TravelFlights() {
  const { setCurrentPage, prevPage } = useApp();
  const [searchData, setSearchData] = useState<{ fromLocation?: string; toLocation?: string; departureDate?: string; travelers?: number } | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'rating'>('price');
  const [showFilters, setShowFilters] = useState(false);
  const [nonStopOnly, setNonStopOnly] = useState(false);
  type Bucket = 'night' | 'morning' | 'afternoon' | 'evening';
  const [depBucket, setDepBucket] = useState<Record<Bucket, boolean>>({ night: false, morning: false, afternoon: false, evening: false });
  const [arrBucket, setArrBucket] = useState<Record<Bucket, boolean>>({ night: false, morning: false, afternoon: false, evening: false });
  const [airlinesSel, setAirlinesSel] = useState<Record<string, boolean>>({});
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [bounds, setBounds] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [priceAlert, setPriceAlert] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('travelSearch');
    if (data) setSearchData(JSON.parse(data));
  }, []);

  // helpers
  const parseTimeToMinutes = (label: string) => {
    // format: "HH:MM AM/PM"
    const [time, ap] = label.split(' ');
    const [hh, mm] = time.split(':').map(Number);
    let h = hh % 12;
    if (ap?.toUpperCase() === 'PM') h += 12;
    return h * 60 + (mm || 0);
  };
  // bucket helper kept inline in memo below to avoid hook deps noise

  // base list
  const baseList = useMemo(() => {
    if (!searchData?.fromLocation || !searchData?.toLocation || !searchData?.departureDate) return [] as FlightResult[];
    return generateFlights(searchData.fromLocation, searchData.toLocation, searchData.departureDate);
  }, [searchData?.fromLocation, searchData?.toLocation, searchData?.departureDate]);

  // setup airlines and price bounds when base list changes
  useEffect(() => {
    if (baseList.length === 0) return;
    const uniq = Array.from(new Set(baseList.map(f => f.airline)));
    const nextSel: Record<string, boolean> = {};
    uniq.forEach(a => { nextSel[a] = true; });
    setAirlinesSel(nextSel);
    const min = Math.min(...baseList.map(f => f.price));
    const max = Math.max(...baseList.map(f => f.price));
    setBounds({ min, max });
    setPriceMin(min);
    setPriceMax(max);
  }, [baseList]);

  const flights = useMemo(() => {
    const getBucket = (mins: number): Bucket => {
      const h = Math.floor(mins / 60);
      if (h < 5) return 'night';
      if (h < 12) return 'morning';
      if (h < 18) return 'afternoon';
      return 'evening';
    };
    let list = [...baseList];
    if (nonStopOnly) list = list.filter(f => f.stops === 0);
    // airline filter
    const selectedAirlines = Object.entries(airlinesSel).filter(([, v]) => v).map(([k]) => k);
    if (selectedAirlines.length > 0) list = list.filter(f => selectedAirlines.includes(f.airline));
    // departure buckets
    const hasDepBucket = Object.values(depBucket).some(Boolean);
    if (hasDepBucket) {
      list = list.filter(f => depBucket[getBucket(parseTimeToMinutes(f.departure))]);
    }
    // arrival buckets
    const hasArrBucket = Object.values(arrBucket).some(Boolean);
    if (hasArrBucket) {
      list = list.filter(f => arrBucket[getBucket(parseTimeToMinutes(f.arrival))]);
    }
    // price range
    list = list.filter(f => f.price >= priceMin && f.price <= priceMax);
    // sort
    list.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.duration.localeCompare(b.duration);
    });
    return list;
  }, [baseList, nonStopOnly, airlinesSel, depBucket, arrBucket, priceMin, priceMax, sortBy]);

  const handleSelectFlight = (flight: FlightResult, family: FareFamily) => {
    const chosen = { ...flight, chosenFare: family };
    localStorage.setItem('selectedFlight', JSON.stringify(chosen));
    localStorage.setItem('bookingType', 'flight');
    setCurrentPage('travel-seats');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <OffersStrip offers={[
          { code: 'GOFLY300', label: 'Flight: Flat ₹300 OFF' },
          { code: 'HDFC10', label: '10% OFF on Cards' }
        ]} />
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 sticky top-20 z-10">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentPage(prevPage || 'travel-home')} className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
                <span>←</span>
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{searchData?.fromLocation} → {searchData?.toLocation}</h1>
                <p className="text-gray-600">{searchData?.departureDate} • {searchData?.travelers} Traveler(s)</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-teal-500 transition-colors">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
              <select value={sortBy} onChange={(e)=> setSortBy(e.target.value as 'price'|'duration'|'rating')} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none">
                <option value="price">Sort by: Price</option>
                <option value="duration">Sort by: Duration</option>
                <option value="rating">Sort by: Rating</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=> setPriceAlert(!priceAlert)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${priceAlert ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-400'}`}>
                <Bell className="w-4 h-4" />
                <span className="text-sm">Price alert</span>
              </button>
            </div>
          </div>
          {/* 7-day sparkline */}
          <div className="mt-4">
            <div className="text-sm text-gray-700 mb-1">7‑day price trend</div>
            <Sparkline from={searchData?.fromLocation||''} to={searchData?.toLocation||''} date={searchData?.departureDate||''} />
          </div>
          {showFilters && (
            <div className="mt-4 p-4 border-2 border-gray-200 rounded-xl bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <input type="checkbox" checked={nonStopOnly} onChange={(e)=> setNonStopOnly(e.target.checked)} />
                  Non-stop only
                </label>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => { setNonStopOnly(false); setDepBucket({ night:false,morning:false,afternoon:false,evening:false }); setArrBucket({ night:false,morning:false,afternoon:false,evening:false }); setPriceMin(bounds.min); setPriceMax(bounds.max); const reset: Record<string, boolean> = {}; Object.keys(airlinesSel).forEach(a => reset[a]=true); setAirlinesSel(reset); }} className="px-3 py-1.5 text-xs rounded-lg border-2 border-gray-200 hover:border-teal-500">Reset</button>
                  <button onClick={() => setShowFilters(false)} className="px-3 py-1.5 text-xs rounded-lg bg-teal-600 text-white">Done</button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">Departure time</div>
                  <div className="flex flex-wrap gap-2">
                    {(['night','morning','afternoon','evening'] as Bucket[]).map(b => (
                      <button key={`dep-${b}`} onClick={()=> setDepBucket(prev => ({ ...prev, [b]: !prev[b] }))} className={`px-3 py-1.5 text-xs rounded-full border-2 ${depBucket[b] ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-gray-200 text-gray-700 hover:border-teal-400'}`}>{b[0].toUpperCase()+b.slice(1)}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">Arrival time</div>
                  <div className="flex flex-wrap gap-2">
                    {(['night','morning','afternoon','evening'] as Bucket[]).map(b => (
                      <button key={`arr-${b}`} onClick={()=> setArrBucket(prev => ({ ...prev, [b]: !prev[b] }))} className={`px-3 py-1.5 text-xs rounded-full border-2 ${arrBucket[b] ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-gray-200 text-gray-700 hover:border-teal-400'}`}>{b[0].toUpperCase()+b.slice(1)}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">Airlines</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                  {Object.keys(airlinesSel).map(a => (
                    <label key={a} className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={!!airlinesSel[a]} onChange={(e)=> setAirlinesSel(prev => ({ ...prev, [a]: e.target.checked }))} />
                      <span>{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">Price range</div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Min</span>
                    <input type="number" value={priceMin} min={bounds.min} max={priceMax} step={100} onChange={(e)=> setPriceMin(Math.min(Math.max(Number(e.target.value)||0, bounds.min), priceMax))} className="w-28 px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-teal-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Max</span>
                    <input type="number" value={priceMax} min={priceMin} max={bounds.max} step={100} onChange={(e)=> setPriceMax(Math.max(Math.min(Number(e.target.value)||0, bounds.max), priceMin))} className="w-28 px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-teal-500" />
                  </div>
                  <div className="text-xs text-gray-500">Bounds: ₹{bounds.min.toLocaleString()} – ₹{bounds.max.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {flights.map((flight) => (
            <div key={flight.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Plane className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{flight.airline}</h3>
                      <p className="text-sm text-gray-600">{flight.flightNumber}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                        <span className="inline-flex items-center gap-1"><Luggage className="w-3 h-3" /> 7kg cabin</span>
                        <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> Optional check-in</span>
                        <span className="inline-flex items-center gap-1"><Wifi className="w-3 h-3" /> {Math.random() > 0.5 ? 'Wi‑Fi' : '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{flight.departure}</div>
                      <div className="text-sm text-gray-600">{searchData?.fromLocation}</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{flight.duration}</span>
                      </div>
                      <div className="w-full h-0.5 bg-gray-300 my-2"></div>
                      <div className="text-sm text-teal-600 font-semibold">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{flight.arrival}</div>
                      <div className="text-sm text-gray-600">{searchData?.toLocation}</div>
                    </div>
                  </div>
                </div>

                <div className="min-w-[260px]">
                  <div className="flex items-center justify-end space-x-1 mb-2">
                    <Star className="w-4 h-4 fill-green-500 text-green-500" />
                    <span className="font-semibold">{flight.rating}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {flight.fares.map(f => (
                      <button
                        key={f.family}
                        onClick={() => handleSelectFlight(flight, f.family)}
                        className="p-3 rounded-lg border-2 border-gray-200 hover:border-teal-500 hover:shadow transition-all text-left"
                      >
                        <div className="font-bold text-gray-900">{f.family}</div>
                        <div className="text-teal-700 font-extrabold">₹{f.price.toLocaleString()}</div>
                        <div className="text-[11px] text-gray-600">{f.baggage}</div>
                        <div className="text-[11px] text-gray-600">{f.refund}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sparkline({ from, to, date }: { from: string; to: string; date: string }) {
  // derive deterministic small dataset
  const seed = Math.abs((from + to + date).split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const rng = (n: number) => Math.abs(Math.sin(seed + n));
  const values = Array.from({ length: 7 }, (_, i) => 2500 + Math.floor(rng(i) * 6000));
  const min = Math.min(...values), max = Math.max(...values);
  const points = values.map((v, i) => ({ x: (i / 6) * 100, y: 40 - ((v - min) / (max - min || 1)) * 40 }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const lowIdx = values.indexOf(min);
  return (
    <svg viewBox="0 0 100 40" className="w-full h-16 bg-gray-50 rounded-md border border-gray-200">
      <path d={path} fill="none" stroke="#0ea5e9" strokeWidth="2" />
      <circle cx={(lowIdx/6)*100} cy={40-((min-min)/(max-min||1))*40} r="1.8" fill="#eab308" />
    </svg>
  );
}

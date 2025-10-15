import { useEffect, useMemo, useState } from 'react';
import { Bus, Clock, Star, Filter, Wifi, Snowflake, Plug, BedDouble, BadgeCheck, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import OffersStrip from '../../components/OffersStrip';

type Amenity = 'AC' | 'Non-AC' | 'WiFi' | 'Charging' | 'Sleeper' | 'Seater';

interface BusResult {
  id: string;
  operator: string;
  busType: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  rating: number;
  seatsLeft: number;
  amenities: Amenity[];
  boardingPoint: string;
  droppingPoint: string;
  reviews: number;
}

const OPERATORS = ['VRL Travels', 'SRS Travels', 'Orange Tours', 'KPN Travels', 'Kesineni', 'National Travels', 'Praveen Travels'];
const TYPES: Array<{ label: string; amenities: Amenity[] }> = [
  { label: 'Sleeper AC', amenities: ['AC', 'Charging', 'Sleeper', 'WiFi'] },
  { label: 'Sleeper Non-AC', amenities: ['Non-AC', 'Sleeper', 'Charging'] },
  { label: 'Semi-Sleeper AC', amenities: ['AC', 'Seater', 'Charging'] },
  { label: 'Seater Non-AC', amenities: ['Non-AC', 'Seater'] },
];

function pad2(n: number) { return n.toString().padStart(2, '0'); }
function toTimeLabel(h: number, m: number) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = ((h + 11) % 12) + 1;
  return `${pad2(hr)}:${pad2(m)} ${ampm}`;
}

function generateBuses(from: string, to: string, dateStr: string): BusResult[] {
  const seed = Math.abs((from + to + dateStr).split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const rng = (n: number) => Math.abs(Math.sin(seed + n));
  const results: BusResult[] = [];
  for (let i = 0; i < 12; i++) {
    const op = OPERATORS[i % OPERATORS.length];
    const typ = TYPES[i % TYPES.length];
    const startH = 18 + Math.floor(rng(i) * 8); // 6pm to 1am departures
    const startM = [0, 15, 30, 45][Math.floor(rng(i + 1) * 4)];
    const durH = 6 + Math.floor(rng(i + 2) * 6); // 6h to 12h
    const durM = [0, 15, 30, 45][Math.floor(rng(i + 3) * 4)];
    const endH = (startH + durH) % 24;
    const endM = durM;
    const priceBase = 699 + Math.floor(rng(i + 4) * 1000);
    const comfort = typ.label.includes('AC') ? 1.15 : 1;
    const sleeper = typ.label.includes('Sleeper') ? 1.2 : 1;
    const price = Math.round(priceBase * comfort * sleeper);
    const rating = +(3.9 + rng(i + 5) * 1.1).toFixed(1);
    const seatsLeft = Math.max(4, Math.floor(rng(i + 6) * 28));
    const boardingPoint = `${from} Main Bus Stand`;
    const droppingPoint = `${to} Central`;
    const reviews = 50 + Math.floor(rng(i + 7) * 900);
    results.push({
      id: `b${i + 1}`,
      operator: op,
      busType: typ.label,
      departure: toTimeLabel(startH, startM),
      arrival: toTimeLabel(endH, endM),
      duration: `${durH}h ${durM}m`,
      price,
      rating,
      seatsLeft,
      amenities: typ.amenities,
      boardingPoint,
      droppingPoint,
      reviews,
    });
  }
  return results;
}

export default function TravelBuses() {
  const { setCurrentPage, prevPage } = useApp();
  const [searchData, setSearchData] = useState<{ fromLocation?: string; toLocation?: string; departureDate?: string; travelers?: number } | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'rating' | 'seats'>('price');
  const [filters, setFilters] = useState<{ ac: boolean; sleeper: boolean; wifi: boolean; seater: boolean }>({ ac: false, sleeper: false, wifi: false, seater: false });
  const [showFilters, setShowFilters] = useState(false);
  type Bucket = 'night' | 'morning' | 'afternoon' | 'evening';
  const [depBucket, setDepBucket] = useState<Record<Bucket, boolean>>({ night: false, morning: false, afternoon: false, evening: false });
  const [opsSel, setOpsSel] = useState<Record<string, boolean>>({});
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [bounds, setBounds] = useState<{ min: number; max: number }>({ min: 0, max: 0 });

  useEffect(() => {
    const data = localStorage.getItem('travelSearch');
    if (data) setSearchData(JSON.parse(data));
  }, []);

  const baseList = useMemo(() => {
    if (!searchData?.fromLocation || !searchData?.toLocation || !searchData?.departureDate) return [] as BusResult[];
    return generateBuses(searchData.fromLocation, searchData.toLocation, searchData.departureDate);
  }, [searchData?.fromLocation, searchData?.toLocation, searchData?.departureDate]);

  // set operator selection and bounds when list changes
  useEffect(() => {
    if (baseList.length === 0) return;
    const uniq = Array.from(new Set(baseList.map(b => b.operator)));
    const nextSel: Record<string, boolean> = {};
    uniq.forEach(o => { nextSel[o] = true; });
    setOpsSel(nextSel);
    const min = Math.min(...baseList.map(b => b.price));
    const max = Math.max(...baseList.map(b => b.price));
    setBounds({ min, max });
    setPriceMin(min);
    setPriceMax(max);
  }, [baseList]);

  const parseTimeToMinutes = (label: string) => {
    const [time, ap] = label.split(' ');
    const [hh, mm] = time.split(':').map(Number);
    let h = hh % 12;
    if (ap?.toUpperCase() === 'PM') h += 12;
    return h * 60 + (mm || 0);
  };

  const filtered = useMemo(() => {
    const getBucket = (mins: number): Bucket => {
      const h = Math.floor(mins / 60);
      if (h < 5) return 'night';
      if (h < 12) return 'morning';
      if (h < 18) return 'afternoon';
      return 'evening';
    };
    let list = [...baseList];
    if (filters.ac) list = list.filter(b => b.amenities.includes('AC'));
    if (filters.sleeper) list = list.filter(b => b.amenities.includes('Sleeper'));
    if (filters.wifi) list = list.filter(b => b.amenities.includes('WiFi'));
    if (filters.seater) list = list.filter(b => b.amenities.includes('Seater'));
    // operator multi-select
    const selectedOps = Object.entries(opsSel).filter(([, v]) => v).map(([k]) => k);
    if (selectedOps.length > 0) list = list.filter(b => selectedOps.includes(b.operator));
    // departure time buckets
    const hasBucket = Object.values(depBucket).some(Boolean);
    if (hasBucket) list = list.filter(b => depBucket[getBucket(parseTimeToMinutes(b.departure))]);
    // price range
    list = list.filter(b => b.price >= priceMin && b.price <= priceMax);
    list.sort((a, b) => {
      switch (sortBy) {
        case 'price': return a.price - b.price;
        case 'rating': return b.rating - a.rating;
        case 'duration': return parseInt(a.duration) - parseInt(b.duration);
        case 'seats': return b.seatsLeft - a.seatsLeft;
        default: return 0;
      }
    });
    return list;
  }, [baseList, filters, sortBy, opsSel, depBucket, priceMin, priceMax]);

  const toggle = (key: keyof typeof filters) => setFilters(s => ({ ...s, [key]: !s[key] }));

  const handleSelect = (bus: BusResult) => {
    localStorage.setItem('selectedBus', JSON.stringify(bus));
    localStorage.setItem('bookingType', 'bus');
    setCurrentPage('travel-seats');
  };

  const amenityIcon = (a: Amenity) => {
    switch (a) {
      case 'AC': return <Snowflake className="w-4 h-4" />;
      case 'Non-AC': return <Snowflake className="w-4 h-4 opacity-40" />;
      case 'WiFi': return <Wifi className="w-4 h-4" />;
      case 'Charging': return <Plug className="w-4 h-4" />;
      case 'Sleeper': return <BedDouble className="w-4 h-4" />;
      case 'Seater': return <Bus className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <OffersStrip offers={[
          { code: 'BUS50', label: 'Bus: Flat ₹50 OFF' },
          { code: 'GOZY50', label: 'Flat ₹50 for any' }
        ]} />
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentPage(prevPage || 'travel-home')} className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{searchData?.fromLocation} → {searchData?.toLocation}</h1>
                <p className="text-gray-600">{searchData?.departureDate} • {searchData?.travelers} Passenger(s)</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-teal-500 transition-colors">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
              <select value={sortBy} onChange={(e)=> setSortBy(e.target.value as 'price' | 'duration' | 'rating' | 'seats')} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none">
                <option value="price">Sort: Price</option>
                <option value="duration">Sort: Duration</option>
                <option value="rating">Sort: Rating</option>
                <option value="seats">Sort: Seats</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 border-2 border-gray-200 rounded-xl bg-white">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => toggle('ac')} className={`px-3 py-1.5 rounded-full border-2 ${filters.ac ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-gray-200 text-gray-700 hover:border-teal-400'}`}>AC</button>
                <button onClick={() => toggle('sleeper')} className={`px-3 py-1.5 rounded-full border-2 ${filters.sleeper ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-gray-200 text-gray-700 hover:border-teal-400'}`}>Sleeper</button>
                <button onClick={() => toggle('wifi')} className={`px-3 py-1.5 rounded-full border-2 ${filters.wifi ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-gray-200 text-gray-700 hover:border-teal-400'}`}>Wi‑Fi</button>
                <button onClick={() => toggle('seater')} className={`px-3 py-1.5 rounded-full border-2 ${filters.seater ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-gray-200 text-gray-700 hover:border-teal-400'}`}>Seater</button>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => { setFilters({ ac:false,sleeper:false,wifi:false,seater:false }); setDepBucket({ night:false,morning:false,afternoon:false,evening:false }); const all: Record<string, boolean> = {}; Object.keys(opsSel).forEach(o => all[o]=true); setOpsSel(all); setPriceMin(bounds.min); setPriceMax(bounds.max); }} className="px-3 py-1.5 text-xs rounded-lg border-2 border-gray-200 hover:border-teal-500">Reset</button>
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
                  <div className="text-sm font-semibold text-gray-900 mb-2">Operators</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                    {Object.keys(opsSel).map(o => (
                      <label key={o} className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={!!opsSel[o]} onChange={(e)=> setOpsSel(prev => ({ ...prev, [o]: e.target.checked }))} />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">Price range</div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Min</span>
                    <input type="number" value={priceMin} min={bounds.min} max={priceMax} step={50} onChange={(e)=> setPriceMin(Math.min(Math.max(Number(e.target.value)||0, bounds.min), priceMax))} className="w-28 px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-teal-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Max</span>
                    <input type="number" value={priceMax} min={priceMin} max={bounds.max} step={50} onChange={(e)=> setPriceMax(Math.max(Math.min(Number(e.target.value)||0, bounds.max), priceMin))} className="w-28 px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:border-teal-500" />
                  </div>
                  <div className="text-xs text-gray-500">Bounds: ₹{bounds.min.toLocaleString()} – ₹{bounds.max.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {filtered.map(bus => (
            <div key={bus.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <Bus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{bus.operator}</h3>
                        {bus.rating >= 4.5 && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <BadgeCheck className="w-3 h-3" /> Top Rated
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{bus.busType}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xl font-bold text-gray-900">{bus.departure}</div>
                      <div className="text-xs text-gray-600">{bus.boardingPoint}</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{bus.duration}</span>
                      </div>
                      <div className="my-2 h-0.5 bg-gray-200" />
                      <div className={`text-xs font-semibold ${bus.seatsLeft <= 6 ? 'text-rose-600' : 'text-teal-700'}`}>{bus.seatsLeft <= 6 ? `Hurry! ${bus.seatsLeft} seats left` : `Seats left: ${bus.seatsLeft}`}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{bus.arrival}</div>
                      <div className="text-xs text-gray-600">{bus.droppingPoint}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-gray-700">
                    {bus.amenities.map(a => (
                      <span key={a} className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
                        {amenityIcon(a)} <span>{a}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="min-w-[200px] text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <Star className="w-4 h-4 fill-green-500 text-green-500" />
                    <span className="font-semibold">{bus.rating}</span>
                    <span className="text-xs text-gray-500">({bus.reviews})</span>
                  </div>
                  <div className="text-2xl font-extrabold text-teal-600">₹{bus.price.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mb-2">Inclusive of taxes</div>
                  <button onClick={() => handleSelect(bus)} className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all">
                    Select Seats
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

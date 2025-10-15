import { useState, useEffect, useMemo } from 'react';
import { Filter, Clock, Star, ArrowLeft, MapPin, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import OffersStrip from '../../components/OffersStrip';

interface MetroResult {
  id: string;
  line: string; // e.g., Blue Line
  departure: string;
  arrival: string;
  duration: string; // 45m
  price: number; // fare
  rating: number;
  interchanges?: number;
  stations?: number;
}

const mockMetros: MetroResult[] = (() => {
  const lines = ['Blue Line','Green Line','Purple Line','Red Line','Yellow Line'];
  const list: MetroResult[] = [];
  for (let i = 0; i < 12; i++) {
    const line = lines[i % lines.length];
    const depH = 6 + (i % 12); // 6AM-6PM
    const depM = [0, 10, 20, 30, 40, 50][i % 6];
    const dur = 30 + (i % 5) * 5; // 30-50m
    const arrH = (depH + Math.floor((depM + dur) / 60)) % 24;
    const arrM = (depM + dur) % 60;
    const price = 30 + (i % 7) * 5; // ₹30 - ₹60
    const rating = +(4.0 + ((i % 5) * 0.15)).toFixed(1);
    const inter = i % 3;
    const stations = 12 + (i % 10);
    const pad = (n: number) => n.toString().padStart(2,'0');
    const toTime = (h: number, m: number) => `${pad(((h + 11) % 12) + 1)}:${pad(m)} ${h>=12?'PM':'AM'}`;
    list.push({ id: `m${i+1}`, line, departure: toTime(depH, depM), arrival: toTime(arrH, arrM), duration: `${dur}m`, price, rating, interchanges: inter, stations });
  }
  return list;
})();

// Map cities to available metro lines in our mock dataset
const CITY_LINES: Record<string, string[]> = {
  delhi: ['Yellow Line', 'Blue Line', 'Violet Line', 'Red Line', 'Green Line', 'Pink Line', 'Orange Line'],
  mumbai: ['Red Line', 'Yellow Line', 'Purple Line'],
  bangalore: ['Purple Line', 'Green Line'],
  bengaluru: ['Purple Line', 'Green Line'],
  default: ['Blue Line', 'Green Line', 'Purple Line', 'Red Line', 'Yellow Line']
};

export default function TravelMetro() {
  const [metros, setMetros] = useState<MetroResult[]>(mockMetros);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'rating'>('price');
  const [showFilters, setShowFilters] = useState(false);
  const { setCurrentPage, prevPage } = useApp();
  const [searchData, setSearchData] = useState<{ fromLocation?: string; toLocation?: string; departureDate?: string; travelers?: number } | null>(null);
  const [noInterchange, setNoInterchange] = useState(false);
  const [lineSel, setLineSel] = useState<Record<string, boolean>>({});
  const [priceMax, setPriceMax] = useState<number>(60);
  const [city, setCity] = useState<string>(() => {
    try { return localStorage.getItem('metroCity') || ''; } catch { return ''; }
  });
  const [ready, setReady] = useState<boolean>(() => {
    try { return localStorage.getItem('metroReady') === '1'; } catch { return false; }
  });
  const allowedLines = useMemo(() => {
    const key = city.trim().toLowerCase();
    return CITY_LINES[key] || CITY_LINES.default;
  }, [city]);
  const [fromStation, setFromStation] = useState<string>('');
  const [toStation, setToStation] = useState<string>('');
  const [doorToDoor, setDoorToDoor] = useState<boolean>(false);
  const stations = useMemo(() => {
    // Mock station names based on lines; in real app, stations would be mapped to lines + city
    const base: Record<string, string[]> = {
      'Yellow Line': ['AIIMS', 'INA', 'Green Park', 'Hauz Khas', 'Qutub Minar', 'Arjan Garh'],
      'Blue Line': ['Rajiv Chowk', 'RK Ashram', 'Karol Bagh', 'Rajouri Garden', 'Janakpuri West'],
      'Red Line': ['Dilshad Garden', 'Shahdara', 'Kashmere Gate'],
      'Green Line': ['Ashok Park Main', 'Punjabi Bagh', 'Kirti Nagar'],
      'Purple Line': ['MG Road', 'Trinity', 'Cubbon Park', 'Lalbagh', 'Jayanagar'],
      'Pink Line': ['Anand Vihar ISBT', 'IP Extension', 'Karkarduma'],
      'Orange Line': ['Airport (T-3)', 'Dhaula Kuan']
    };
    const all = allowedLines.flatMap(l => base[l] || []);
    return Array.from(new Set(all)).sort();
  }, [allowedLines]);

  useEffect(() => {
    const data = localStorage.getItem('travelSearch');
    if (data) setSearchData(JSON.parse(data));
  }, []);

  useEffect(() => {
    // initialize line selections and bounds on first render
    const lines = Array.from(new Set(mockMetros.map(m => m.line))).filter(l => allowedLines.includes(l));
    if (Object.keys(lineSel).length === 0) {
      const def: Record<string, boolean> = {};
      lines.forEach(l => def[l] = true);
      setLineSel(def);
    }
    const maxFare = Math.max(...mockMetros.filter(m => allowedLines.includes(m.line)).map(m => m.price));
    if (priceMax === 60 && maxFare !== 60) setPriceMax(maxFare);

    const sorted = [...mockMetros]
      .filter(m => allowedLines.includes(m.line))
      .filter(m => (noInterchange ? (m.interchanges || 0) === 0 : true))
      .filter(m => lineSel[m.line])
      .filter(m => m.price <= priceMax)
      .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.duration.localeCompare(b.duration);
    });
    setMetros(sorted);
  }, [sortBy, noInterchange, lineSel, priceMax, allowedLines]);

  const handleSelect = (metro: MetroResult) => {
    localStorage.setItem('selectedMetro', JSON.stringify(metro));
    localStorage.setItem('bookingType', 'metro');
    setCurrentPage('travel-metro-details');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <OffersStrip offers={[{ code: 'GOZY50', label: 'Flat ₹50 OFF' }]} />
        {!ready && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-bold">Book QR Ticket</h2>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-800">City</label>
              <input value={city} onChange={(e)=> setCity(e.target.value)} placeholder="Enter city (e.g., Mumbai)" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
              <div className="flex items-center gap-3">
                <button disabled={!city.trim()} onClick={() => { setReady(true); try { localStorage.setItem('metroCity', city.trim()); localStorage.setItem('metroReady', '1'); } catch { /* ignore */ } }} className={`px-4 py-2 rounded-lg text-white font-semibold ${city.trim() ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-300 cursor-not-allowed'}`}>Proceed</button>
                <span className="text-sm text-gray-500">Proceed to view routes and map</span>
              </div>
            </div>
          </div>
        )}
        {ready && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <button onClick={() => setCurrentPage(prevPage || 'travel-home')} className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div>
              <h1 className="text-2xl font-bold text-gray-900">{searchData?.fromLocation} → {searchData?.toLocation}</h1>
              <p className="text-gray-600">{searchData?.departureDate} • {searchData?.travelers} Passenger(s)</p>
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
          </div>

          {/* Station pickers and route CTA section */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-800">From Station</label>
              <input list="metro-stations" value={fromStation} onChange={(e)=> setFromStation(e.target.value)} placeholder="Select Station" className="w-full mt-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">To Station</label>
              <input list="metro-stations" value={toStation} onChange={(e)=> setToStation(e.target.value)} placeholder="Select Station" className="w-full mt-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
            </div>
            <datalist id="metro-stations">
              {stations.map(s => (<option key={s} value={s}></option>))}
            </datalist>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <input type="checkbox" checked={doorToDoor} onChange={(e)=> setDoorToDoor(e.target.checked)} />
              Travel With Door-to-Door Journey
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button disabled={!fromStation || !toStation} className={`px-4 py-2 rounded-lg text-white font-semibold ${fromStation && toStation ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}>View Route</button>
            <button disabled={!fromStation || !toStation} onClick={() => { const sample = metros[0]; if (sample) handleSelect(sample); }} className={`px-4 py-2 rounded-lg text-white font-semibold ${fromStation && toStation ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}>Book QR Ticket</button>
          </div>
        </div>
        )}
        {showFilters && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
                <input type="checkbox" checked={noInterchange} onChange={(e)=> setNoInterchange(e.target.checked)} />
                No interchange only
              </label>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-500">Max fare: ₹{priceMax}</span>
                <input type="range" min={30} max={Math.max(60, ...mockMetros.map(m=>m.price))} value={priceMax} onChange={(e)=> setPriceMax(Number(e.target.value))} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm font-semibold text-gray-900 mb-2">Lines</div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(lineSel).map(line => (
                  <button key={line} onClick={()=> setLineSel(prev => ({ ...prev, [line]: !prev[line] }))} className={`px-3 py-1.5 text-xs rounded-full border-2 ${lineSel[line] ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-gray-200 text-gray-700 hover:border-teal-400'}`}>{line}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {ready && (
        <div className="space-y-4">
          {metros.map(metro => (
            <div key={metro.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer border border-gray-100" onClick={() => handleSelect(metro)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                      metro.line.includes('Blue') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      metro.line.includes('Green') ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>{metro.line}</span>
                    {typeof metro.interchanges === 'number' && (
                      <span className="text-xs text-gray-600">{metro.interchanges} interchange{metro.interchanges === 1 ? '' : 's'}</span>
                    )}
                    {typeof metro.stations === 'number' && (
                      <span className="text-xs text-gray-600">• {metro.stations} stations</span>
                    )}
                    <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Next in {((Math.abs(Date.now()/60000) | 0) % 7) + 1} min</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xl font-bold text-gray-900">{metro.departure}</div>
                      <div className="text-xs text-gray-600 inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {searchData?.fromLocation}</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{metro.duration}</span>
                      </div>
                      <div className="w-full h-0.5 bg-gray-300 my-2"></div>
                      <div className="text-xs text-indigo-700 font-semibold">Every 3-5 mins</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{metro.arrival}</div>
                      <div className="text-xs text-gray-600 inline-flex items-center gap-1 justify-end"><MapPin className="w-3 h-3" /> {searchData?.toLocation}</div>
                    </div>
                  </div>
                </div>
                <div className="min-w-[160px] text-right">
                  <div className="flex items-center justify-end space-x-1 mb-1">
                    <Star className="w-4 h-4 fill-green-500 text-green-500" />
                    <span className="font-semibold">{metro.rating}</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 mb-1">₹{metro.price.toLocaleString()}</div>
                  {metro.price >= 50 && (
                    <div className="text-[11px] text-green-700 bg-green-50 border border-green-200 inline-block px-2 py-0.5 rounded-full mb-1">Save 10% with Smart Card</div>
                  )}
                  <div className="text-xs text-gray-500 mb-2">Smart card applicable</div>
                  <div className="flex items-center gap-2 justify-end">
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all">Select</button>
                    <button onClick={(e) => { e.stopPropagation(); }} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" aria-label="Share">
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

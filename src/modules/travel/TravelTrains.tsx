import { useMemo, useState, useEffect } from 'react';
import { Filter, Clock, Star, ArrowLeft, BadgeCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TrainResult {
  id: string;
  operator: string;
  name: string;
  trainNo: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  rating: number;
  class: string;
}
// Generate 12+ mock trains to ensure rich result set
const baseTrains: Omit<TrainResult, 'id'>[] = [
  { operator: 'Indian Railways', name: 'Karnataka Express', trainNo: '12627', departure: '06:00 AM', arrival: '10:30 AM', duration: '4h 30m', price: 650, rating: 4.4, class: '3A' },
  { operator: 'Indian Railways', name: 'Shatabdi Express', trainNo: '12008', departure: '07:10 AM', arrival: '10:40 AM', duration: '3h 30m', price: 980, rating: 4.6, class: 'CC' },
  { operator: 'Indian Railways', name: 'Jan Shatabdi', trainNo: '12009', departure: '08:20 AM', arrival: '12:00 PM', duration: '3h 40m', price: 560, rating: 4.1, class: '2S' },
  { operator: 'Indian Railways', name: 'Rajdhani Express', trainNo: '12431', departure: '09:00 AM', arrival: '12:45 PM', duration: '3h 45m', price: 1450, rating: 4.7, class: '3A' },
  { operator: 'Indian Railways', name: 'Duronto Express', trainNo: '12213', departure: '10:15 AM', arrival: '01:35 PM', duration: '3h 20m', price: 1320, rating: 4.5, class: '3A' },
  { operator: 'Indian Railways', name: 'Intercity Express', trainNo: '12628', departure: '11:30 AM', arrival: '04:15 PM', duration: '4h 45m', price: 720, rating: 4.2, class: '2S' },
  { operator: 'Indian Railways', name: 'Vande Bharat', trainNo: '22301', departure: '12:00 PM', arrival: '03:10 PM', duration: '3h 10m', price: 1550, rating: 4.8, class: 'CC' },
  { operator: 'Indian Railways', name: 'Garib Rath', trainNo: '12909', departure: '01:45 PM', arrival: '05:40 PM', duration: '3h 55m', price: 880, rating: 4.0, class: '3A' },
  { operator: 'Indian Railways', name: 'Udyan Express', trainNo: '11301', departure: '02:30 PM', arrival: '06:50 PM', duration: '4h 20m', price: 610, rating: 4.1, class: '2S' },
  { operator: 'Indian Railways', name: 'Satabdi Special', trainNo: '02027', departure: '03:20 PM', arrival: '06:50 PM', duration: '3h 30m', price: 990, rating: 4.3, class: 'CC' },
  { operator: 'Indian Railways', name: 'Chennai Mail', trainNo: '12839', departure: '04:00 PM', arrival: '08:20 PM', duration: '4h 20m', price: 700, rating: 4.2, class: '3A' },
  { operator: 'Indian Railways', name: 'Nanda Devi Exp', trainNo: '12205', departure: '05:10 PM', arrival: '08:45 PM', duration: '3h 35m', price: 1050, rating: 4.4, class: 'CC' },
];

const mockTrains: TrainResult[] = baseTrains.map((t, idx) => ({ id: `t${idx+1}`, ...t }));

export default function TravelTrains() {
  const [trains, setTrains] = useState<TrainResult[]>(mockTrains);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'rating' | 'earliest' | 'shortest'>('price');
  const [showFilters, setShowFilters] = useState(false);
  const [classFilter, setClassFilter] = useState<'all' | '2S' | 'CC' | '3A'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'AVAILABLE' | 'RAC' | 'WL'>('all');
  const { setCurrentPage, prevPage } = useApp();
  const [searchData, setSearchData] = useState<{ fromLocation?: string; toLocation?: string; departureDate?: string; travelers?: number } | null>(null);
  const [expandedTrain, setExpandedTrain] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<'2S'|'SL'|'CC'|'3A'|'2A'|'1A' | null>(null);

  // Class-wise availability and fares (mocked IRCTC-style)
  type AvStatus = 'AVAILABLE' | 'RAC' | 'WL';
  const classes: Array<'2S'|'SL'|'CC'|'3A'|'2A'|'1A'> = ['2S','SL','CC','3A','2A','1A'];
  const availability = useMemo(() => {
    const map: Record<string, Record<'2S'|'SL'|'CC'|'3A'|'2A'|'1A', { status: AvStatus; fare: number }>> = {};
    trains.forEach((t, i) => {
      const base = t.price;
      const seed = (i * 7) % 10; // deterministic pattern
      map[t.id] = {
        '2S': { status: seed < 7 ? 'AVAILABLE' : (seed === 7 ? 'RAC' : 'WL'), fare: Math.max(250, Math.round(base * 0.7)) },
        'SL': { status: seed < 6 ? 'AVAILABLE' : (seed < 8 ? 'RAC' : 'WL'), fare: Math.max(320, Math.round(base * 0.8)) },
        'CC': { status: seed < 6 ? 'AVAILABLE' : (seed < 8 ? 'RAC' : 'WL'), fare: Math.max(600, Math.round(base * 1.0)) },
        '3A': { status: seed < 5 ? 'AVAILABLE' : (seed < 7 ? 'RAC' : 'WL'), fare: Math.max(900, Math.round(base * 1.4)) },
        '2A': { status: seed < 5 ? 'AVAILABLE' : (seed < 7 ? 'RAC' : 'WL'), fare: Math.max(1200, Math.round(base * 2.0)) },
        '1A': { status: seed < 4 ? 'AVAILABLE' : (seed < 6 ? 'RAC' : 'WL'), fare: Math.max(1800, Math.round(base * 3.0)) },
      };
    });
    return map;
  }, [trains]);

  // Map internal status codes to user-facing labels
  const statusLabel = (s: AvStatus) => (s === 'AVAILABLE' ? 'AVL' : s);

  useEffect(() => {
    const data = localStorage.getItem('travelSearch');
    if (data) setSearchData(JSON.parse(data));
  }, []);

  useEffect(() => {
    let list = [...mockTrains];
    if (classFilter !== 'all') list = list.filter(t => t.class === classFilter);
    const sorted = list.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'duration' || sortBy === 'shortest') return a.duration.localeCompare(b.duration);
      if (sortBy === 'earliest') {
        const toMin = (t: string) => { const [hm, ap] = t.split(' '); const [hh, mm] = hm.split(':').map(Number); let h = hh % 12; if ((ap||'').toUpperCase()==='PM') h += 12; return h*60 + (mm||0); };
        return toMin(a.departure).valueOf() - toMin(b.departure).valueOf();
      }
      return 0;
    });
    setTrains(sorted);
  }, [sortBy, classFilter]);

  const handleBook = (train: TrainResult, cls: '2S'|'SL'|'CC'|'3A'|'2A'|'1A') => {
    const fare = availability[train.id]?.[cls]?.fare ?? train.price;
    const payload = { ...train, class: cls, price: fare };
    localStorage.setItem('selectedTrain', JSON.stringify(payload));
    localStorage.setItem('bookingType', 'train');
    // For trains, skip seat matrix. Go to traveler details directly.
    setCurrentPage('travel-booking');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
              <select value={sortBy} onChange={(e)=> setSortBy(e.target.value as 'price'|'duration'|'rating'|'earliest'|'shortest')} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none">
                <option value="price">Sort by: Price</option>
                <option value="duration">Sort by: Duration</option>
                <option value="rating">Sort by: Rating</option>
                <option value="earliest">Sort by: Earliest Departure</option>
                <option value="shortest">Sort by: Shortest Journey</option>
              </select>
              <select value={classFilter} onChange={(e)=> setClassFilter(e.target.value as 'all'|'2S'|'CC'|'3A')} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none">
                <option value="all">All Classes</option>
                <option value="2S">2S (Second Seating)</option>
                <option value="CC">CC (Chair Car)</option>
                <option value="3A">3A (AC 3 Tier)</option>
              </select>
              <select value={statusFilter} onChange={(e)=> setStatusFilter(e.target.value as 'all'|'AVAILABLE'|'RAC'|'WL')} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none">
                <option value="all">All Status</option>
                <option value="AVAILABLE">AVL</option>
                <option value="RAC">RAC</option>
                <option value="WL">Waitlist</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {trains.map(train => (
            <div key={train.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform hover:scale-[1.01] p-6">
              <div className="flex justify-between items-start gap-4">
                {/* Left: Train meta */}
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{train.name}</h3>
                    <p className="text-sm text-gray-600">{train.operator} • {train.trainNo}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(/Shatabdi|Vande Bharat/i.test(train.name) || train.class === 'CC') && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Meals included</span>
                      )}
                      {(train.class === '3A' || train.class === '2A' || train.class === '1A') && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">Bedding provided</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{train.departure}</div>
                      <div className="text-sm text-gray-600">{searchData?.fromLocation}</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{train.duration}</span>
                      </div>
                      <div className="w-full h-0.5 bg-gray-300 my-2"></div>
                      <div className="inline-flex items-center space-x-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-xs font-semibold"><BadgeCheck className="w-3 h-3"/><span>On time</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{train.arrival}</div>
                      <div className="text-sm text-gray-600">{searchData?.toLocation}</div>
                    </div>
                  </div>
                </div>

                {/* Right: Rating */}
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-1 mb-2">
                    <Star className="w-4 h-4 fill-green-500 text-green-500" />
                    <span className="font-semibold">{train.rating}</span>
                  </div>
                </div>
              </div>

              {/* IRCTC-like class availability row */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {classes.map(cls => {
                  const info = availability[train.id]?.[cls];
                  const badge = info?.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                               : info?.status === 'RAC' ? 'bg-amber-50 text-amber-700 border-amber-200'
                               : 'bg-red-50 text-red-700 border-red-200';
                  if (statusFilter !== 'all' && info?.status !== statusFilter) return null;
                  return (
                    <button
                      key={cls}
                      onClick={() => { setExpandedTrain(train.id === expandedTrain ? null : train.id); setSelectedClass(cls); }}
                      className={`flex items-center justify-between p-3 border-2 rounded-xl gap-2 min-h-[70px] ${badge} hover:scale-[1.02] transition-transform text-left`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold leading-tight">{cls}</div>
                        <div className="text-xs opacity-80 leading-tight">{info ? statusLabel(info.status) : ''}</div>
                      </div>
                      <div className="text-right shrink-0 min-w-[110px]">
                        <div className="text-lg font-bold leading-tight">₹{(info?.fare ?? train.price).toLocaleString()}</div>
                        <div className="text-[11px] opacity-80">View details</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Expanded availability details */}
              {expandedTrain === train.id && (
                <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="mb-2 text-sm text-gray-700">Availability details for all classes</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {classes.map((cls) => {
                      const info = availability[train.id]?.[cls];
                      if (!info) return null;
                      const capacity = cls === '1A' ? 24 : cls === '2A' ? 46 : cls === '3A' ? 64 : cls === 'CC' ? 72 : cls === 'SL' ? 80 : 120;
                      const seed = (train.id.charCodeAt(1) + cls.charCodeAt(0)) % capacity; // deterministic-ish
                      const booked = Math.min(capacity, Math.max(0, Math.round(capacity * 0.3) + seed));
                      const left = Math.max(0, capacity - booked);
                      const color = info.status === 'AVAILABLE' ? 'text-emerald-700' : info.status === 'RAC' ? 'text-amber-700' : 'text-red-700';
                      return (
                        <div key={`det-${cls}`} className={`p-3 bg-white rounded-lg border ${selectedClass===cls ? 'border-teal-400 shadow' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">{cls}</div>
                            <div className={`text-xs font-bold ${color}`}>{statusLabel(info.status)}</div>
                          </div>
                          <div className="mt-1 text-xs text-gray-600">Fare: ₹{(info.fare).toLocaleString()}</div>
                          {info.status === 'AVAILABLE' ? (
                            <div className="mt-1 text-xs"><span className="font-semibold">Seats left:</span> {left} • <span className="font-semibold">Booked:</span> {booked}</div>
                          ) : info.status === 'RAC' ? (
                            <div className="mt-1 text-xs">RAC queue approx: {Math.max(5, Math.round(left/2)+5)}</div>
                          ) : (
                            <div className="mt-1 text-xs">Waitlist position approx: {20 + (booked % 20)}</div>
                          )}
                          {info.status !== 'WL' && (
                            <button onClick={() => handleBook(train, cls)} className="mt-2 w-full px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg text-sm font-semibold hover:from-teal-600 hover:to-cyan-700">Continue</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

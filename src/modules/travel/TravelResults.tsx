import { useState, useEffect } from 'react';
import { Plane, Clock, Star, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  rating: number;
  stops: number;
}

const mockFlights: FlightResult[] = [
  {
    id: '1',
    airline: 'IndiGo',
    flightNumber: '6E-342',
    departure: '06:00 AM',
    arrival: '08:30 AM',
    duration: '2h 30m',
    price: 4500,
    rating: 4.5,
    stops: 0
  },
  {
    id: '2',
    airline: 'Air India',
    flightNumber: 'AI-890',
    departure: '08:15 AM',
    arrival: '11:00 AM',
    duration: '2h 45m',
    price: 5200,
    rating: 4.3,
    stops: 0
  },
  {
    id: '3',
    airline: 'SpiceJet',
    flightNumber: 'SG-567',
    departure: '10:30 AM',
    arrival: '01:15 PM',
    duration: '2h 45m',
    price: 3800,
    rating: 4.2,
    stops: 0
  },
  {
    id: '4',
    airline: 'Vistara',
    flightNumber: 'UK-723',
    departure: '02:00 PM',
    arrival: '04:45 PM',
    duration: '2h 45m',
    price: 6100,
    rating: 4.7,
    stops: 0
  },
  {
    id: '5',
    airline: 'AirAsia',
    flightNumber: 'I5-234',
    departure: '05:30 PM',
    arrival: '08:15 PM',
    duration: '2h 45m',
    price: 3500,
    rating: 4.0,
    stops: 0
  }
];

export default function TravelResults() {
  const [flights, setFlights] = useState<FlightResult[]>(mockFlights);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'rating' | 'early'>('price');
  const [showFilters, setShowFilters] = useState(false);
  const { setCurrentPage } = useApp();
  const [searchData, setSearchData] = useState<{ fromLocation?: string; toLocation?: string; departureDate?: string; travelers?: number } | null>(null);
  const [stops, setStops] = useState<'any' | 0 | 1>('any');
  const [refundable, setRefundable] = useState(false);
  const [timeSlot, setTimeSlot] = useState<'any'|'morning'|'afternoon'|'evening'|'night'>('any');
  const [carrier, setCarrier] = useState<string>('any');
  const carriers = ['any', ...Array.from(new Set(mockFlights.map(f => f.airline)))];

  useEffect(() => {
    const data = localStorage.getItem('travelSearch');
    if (data) {
      setSearchData(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    // filter
  const list = [...mockFlights].filter(f => {
      const stopOk = stops === 'any' ? true : f.stops === stops;
      const refOk = refundable ? f.price >= 4000 : true; // mock: assume higher fare refundable
      const timeOk = (() => {
        if (timeSlot==='any') return true;
        const hour = parseInt(f.departure.split(':')[0], 10);
        if (timeSlot==='morning') return hour >= 5 && hour < 12;
        if (timeSlot==='afternoon') return hour >= 12 && hour < 17;
        if (timeSlot==='evening') return hour >= 17 && hour < 21;
        return hour >= 21 || hour < 5;
      })();
      const carOk = (carrier==='any') || f.airline === carrier;
      return stopOk && refOk && timeOk && carOk;
    });
    const sorted = list.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
      // early: earliest departure time first
      const getHour = (t: string) => parseInt(t.split(':')[0], 10) + (t.toLowerCase().includes('pm') && !t.startsWith('12') ? 12 : 0);
      return getHour(a.departure) - getHour(b.departure);
    });
    setFlights(sorted);
  }, [sortBy, stops, refundable, timeSlot, carrier]);

  const handleSelectFlight = (flight: FlightResult) => {
    localStorage.setItem('selectedFlight', JSON.stringify(flight));
    setCurrentPage('travel-seats');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {searchData?.fromLocation} → {searchData?.toLocation}
              </h1>
              <p className="text-gray-600">
                {searchData?.departureDate} • {searchData?.travelers} Traveler(s)
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-teal-500 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
              >
                <option value="price">Sort by: Price</option>
                <option value="duration">Sort by: Duration</option>
                <option value="rating">Sort by: Rating</option>
                <option value="early">Sort by: Earliest</option>
              </select>
            </div>
          </div>
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold mb-1">Stops</div>
                <div className="flex gap-2 flex-wrap">
                  {(['any', 0, 1] as const).map(s => (
                    <button key={String(s)} onClick={()=> setStops(s)} className={`px-3 py-1.5 rounded-full border text-xs ${stops===s? 'border-teal-600 bg-teal-50':'border-gray-300 hover:border-teal-400'}`}>{s==='any'?'Any': s===0? 'Non-stop':'1 stop'}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Refundable</div>
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={refundable} onChange={(e)=> setRefundable(e.target.checked)} /> Show refundable fares</label>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Time</div>
                <select value={timeSlot} onChange={(e)=> setTimeSlot(e.target.value as typeof timeSlot)} className="w-full px-3 py-2 border-2 rounded-lg">
                  <option value="any">Any time</option>
                  <option value="morning">Morning (5-12)</option>
                  <option value="afternoon">Afternoon (12-17)</option>
                  <option value="evening">Evening (17-21)</option>
                  <option value="night">Night (21-5)</option>
                </select>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Carrier</div>
                <select value={carrier} onChange={(e)=> setCarrier(e.target.value)} className="w-full px-3 py-2 border-2 rounded-lg">
                  {carriers.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Fare calendar (±3 days) */}
        {searchData?.departureDate && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-4">
            <div className="text-sm font-semibold text-teal-800 mb-2">Fare Calendar (±3 days)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {(() => {
                const base = new Date(searchData.departureDate!);
                const items: { date: string; price: number; isSelected: boolean }[] = [];
                for (let d=-3; d<=3; d++) {
                  const dt = new Date(base);
                  dt.setDate(base.getDate()+d);
                  const price = 3000 + Math.abs(d)*400 + (d===0? 500: 0); // mock pricing
                  items.push({ date: dt.toISOString().slice(0,10), price, isSelected: d===0 });
                }
                return items.map(it => (
                  <button key={it.date} className={`px-3 py-2 rounded-xl text-left border ${it.isSelected? 'border-teal-600 bg-white':'border-teal-200 bg-white/70 hover:bg-white'}`}> 
                    <div className="text-xs text-gray-600">{it.date.slice(5)}</div>
                    <div className="text-sm font-bold text-teal-700">₹{it.price}</div>
                  </button>
                ));
              })()}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer"
              onClick={() => handleSelectFlight(flight)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Plane className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{flight.airline}</h3>
                      <p className="text-sm text-gray-600">{flight.flightNumber}</p>
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
                      <div className="text-sm text-teal-600 font-semibold">
                        {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}
                      </div>
                    </div>

                    <div>
                      <div className="text-2xl font-bold text-gray-900">{flight.arrival}</div>
                      <div className="text-sm text-gray-600">{searchData?.toLocation}</div>
                    </div>
                  </div>
                </div>

                <div className="ml-8 text-right">
                  <div className="flex items-center justify-end space-x-1 mb-2">
                    <Star className="w-4 h-4 fill-green-500 text-green-500" />
                    <span className="font-semibold">{flight.rating}</span>
                  </div>
                  <div className="text-3xl font-bold text-teal-600 mb-2">
                    ₹{flight.price.toLocaleString()}
                  </div>
                  <button className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all">
                    Select
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

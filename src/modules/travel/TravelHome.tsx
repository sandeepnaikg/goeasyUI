import { useState } from 'react';
import { Plane, Hotel, Bus, MapPin, Calendar, Users, CheckCircle, Tag, X, ShieldCheck, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ImageWithFallback from '../../components/ImageWithFallback';
import BookedRecentlyCard from '../../components/BookedRecentlyCard';
import ShareReferralButton from '../../components/ShareReferralButton';

export default function TravelHome() {
  const [travelType, setTravelType] = useState<'flight' | 'hotel' | 'bus' | 'train' | 'metro'>('flight');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [hotelCity, setHotelCity] = useState('');
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [showHotelList, setShowHotelList] = useState(false);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState('1');
  const app = useApp();
  const { setCurrentPage } = app;
  const { pushNotification } = app as { pushNotification: (arg: { module: 'offers' | 'system' | 'wallet' | 'travel' | 'food' | 'tickets' | 'shopping'; title: string; message: string }) => void };
  const [selectedDest, setSelectedDest] = useState<null | { id: number; name: string; image: string; rating: number; location: string; price: number; duration: string }>(null);
  const [justAppliedFromModal, setJustAppliedFromModal] = useState(false);
  const [queuedOfferCode, setQueuedOfferCode] = useState<string | null>(null);
  const [destMinimized, setDestMinimized] = useState<boolean>(() => {
    try { return localStorage.getItem('destModalMinimized') === '1'; } catch { return false; }
  });

  const getDestMeta = (d: { id: number; name: string }) => {
    switch (d.name) {
      case 'Bali':
        return {
          perks: ['Beachfront resort', 'Island hopping tour', 'Balinese massage', 'Breakfast buffet', 'Airport pickup'],
          highlights: ['Uluwatu Temple sunset', 'Nusa Penida day trip', 'Ubud rice terraces', 'Water sports at Nusa Dua'],
          offerHotelCode: 'STAY20',
          offerFlightCode: 'GOFLY300',
          offerHotelText: 'Get 20% OFF on Hotels up to ₹500',
          offerFlightText: 'Flat ₹300 OFF on Flights on min ₹2500'
        };
      case 'Paris':
        return {
          perks: ['Central 4★ stay', 'Daily breakfast', 'Airport transfers', 'Seine cruise tickets', 'Metro passes'],
          highlights: ['Eiffel Tower & Trocadéro', 'Louvre Museum', 'Montmartre walking tour', 'Seine River cruise'],
          offerHotelCode: 'STAY20',
          offerFlightCode: 'GOFLY300',
          offerHotelText: '20% OFF on Hotels up to ₹500',
          offerFlightText: '₹300 OFF on Flights over ₹2500'
        };
      case 'Maldives':
        return {
          perks: ['Overwater villa', 'Full-board meals', 'Snorkeling gear', 'Sunset cruise', 'Butler service'],
          highlights: ['House reef snorkeling', 'Sandbank picnic', 'Dolphin watching', 'Spa evening'],
          offerHotelCode: 'STAY20',
          offerFlightCode: 'GOFLY300',
          offerHotelText: 'Save 20% on stays (max ₹500)',
          offerFlightText: '₹300 OFF on eligible flights'
        };
      default:
        return {
          perks: ['Daily breakfast','Airport transfers','City tour & sightseeing','4★ hotel or equivalent','24x7 support'],
          highlights: ['Arrival & check-in','Guided sightseeing','Local experiences','Checkout & return'],
          offerHotelCode: 'STAY20',
          offerFlightCode: 'GOFLY300',
          offerHotelText: 'Hotel offer available',
          offerFlightText: 'Flight offer available'
        };
    }
  };

  // Read any queued offer (so we can show a small badge in headers)
  useState(() => {
    const saved = localStorage.getItem('selectedOfferCode');
    if (saved) setQueuedOfferCode(saved);
  });
  const hasFlightLocations = fromLocation.trim().length > 0 && toLocation.trim().length > 0;
  const hasHotelLocation = hotelCity.trim().length > 0;
  const hasBusLocations = fromLocation.trim().length > 0 && toLocation.trim().length > 0;
  const hasTrainLocations = fromLocation.trim().length > 0 && toLocation.trim().length > 0;
  const hasMetroLocations = fromLocation.trim().length > 0 && toLocation.trim().length > 0;
  const hasLocations = (
    travelType==='hotel' ? hasHotelLocation :
    travelType==='flight' ? hasFlightLocations :
    travelType==='bus' ? hasBusLocations :
    travelType==='train' ? hasTrainLocations :
    travelType==='metro' ? hasMetroLocations : false
  );
  const datesReady = travelType==='hotel' ? (departureDate && returnDate) : (departureDate !== '');
  const readyToSearch = hasLocations && datesReady;

  const airports = [
    { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International' },
    { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International' },
    { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj' },
    { code: 'MAA', city: 'Chennai', name: 'Chennai International' },
    { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International' },
    { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Chandra Bose' },
    { code: 'GOX', city: 'Goa', name: 'Manohar International (Mopa)' },
    { code: 'GOI', city: 'Goa', name: 'Dabolim Airport' },
  ];
  const filterAirports = (q: string) => {
    const s = q.trim().toLowerCase();
    if (!s) return airports.slice(0,5);
    return airports.filter(a => a.code.toLowerCase().startsWith(s) || a.city.toLowerCase().startsWith(s) || a.name.toLowerCase().includes(s)).slice(0,6);
  };
  const cities = Array.from(new Set([...airports.map(a=> a.city), 'Goa','Pune','Jaipur','Kochi','Ahmedabad','Chandigarh','Lucknow','Visakhapatnam']));
  const filterCities = (q: string) => {
    const s = q.trim().toLowerCase();
    if (!s) return cities.slice(0,6);
    return cities.filter(c => c.toLowerCase().includes(s)).slice(0,8);
  };

  const changeType = (t: 'flight'|'hotel'|'bus'|'train'|'metro') => {
    setTravelType(t);
  // reset state when switching tabs for clarity
    setFromLocation('');
    setToLocation('');
    setHotelCity('');
    setDepartureDate('');
    setReturnDate('');
    setTravelers('1');
    setShowFromList(false);
    setShowToList(false);
    setShowHotelList(false);
  };

  const handleSearch = () => {
    const searchData = {
      type: travelType,
      fromLocation: travelType==='hotel' ? hotelCity : fromLocation,
      toLocation: travelType==='hotel' ? '' : toLocation,
      departureDate,
      returnDate,
      travelers: parseInt(travelers)
    };
    localStorage.setItem('travelSearch', JSON.stringify(searchData));
    if (travelType === 'flight') {
      localStorage.setItem('bookingType', 'flight');
      setCurrentPage('travel-results');
    } else if (travelType === 'hotel') {
      localStorage.setItem('bookingType', 'hotel');
      setCurrentPage('travel-hotels');
    } else if (travelType === 'bus') {
      localStorage.setItem('bookingType', 'bus');
      setCurrentPage('travel-buses');
    } else if (travelType === 'train') {
      localStorage.setItem('bookingType', 'train');
      setCurrentPage('travel-trains');
    } else if (travelType === 'metro') {
      localStorage.setItem('bookingType', 'metro');
      setCurrentPage('travel-metro');
    }
  };

  return (
  <div className="min-h-screen bg-[#F3F0FF] pb-20">
    <div className="app-shell py-6">
        {/* Booked recently card */}
        <div className="mb-4">
          <BookedRecentlyCard module="travel" />
        </div>
        <div className="bg-white rounded-2xl shadow-xl">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-5 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-0.5">Plan Your Journey</h1>
                <p className="text-teal-50 text-sm">Find the best deals on flights, hotels, and buses</p>
              </div>
              <div className="flex items-center gap-2">
                <ShareReferralButton />
                <button onClick={() => {
                  // Save alert for current inputs
                  const alert = { id: `ta-${Date.now()}`, type: travelType, from: travelType==='hotel' ? hotelCity : fromLocation, to: travelType==='hotel' ? '' : toLocation, date: departureDate };
                  try {
                    const raw = localStorage.getItem('travelAlerts');
                    const arr = raw ? JSON.parse(raw) : [];
                    arr.unshift(alert);
                    localStorage.setItem('travelAlerts', JSON.stringify(arr.slice(0, 100)));
                  } catch { /* ignore */ }
                  pushNotification({ module: 'offers', title: 'Travel alert set', message: 'We will notify you when prices change for your route.' });
                }} className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/20">
                  <Bell className="w-4 h-4" /> Set alert
                </button>
              </div>
            </div>
            {queuedOfferCode && (
              <div className="mt-2 inline-flex items-center space-x-2 bg-white/15 border border-white/20 px-2.5 py-1 rounded-full text-xs">
                <Tag className="w-4 h-4" />
                <span>Offer Applied: <span className="font-semibold">{queuedOfferCode}</span></span>
                <button onClick={() => { localStorage.removeItem('selectedOfferCode'); setQueuedOfferCode(null); }} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="p-5">
            {/* Always show the travel type tabs at the top */}
            <div className="flex space-x-2 mb-8">
              <button
                onClick={() => changeType('flight')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  travelType === 'flight'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Plane className="w-5 h-5" />
                <span>Flights</span>
              </button>
              <button
                onClick={() => changeType('hotel')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  travelType === 'hotel'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Hotel className="w-5 h-5" />
                <span>Hotels</span>
              </button>
              <button
                onClick={() => changeType('bus')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  travelType === 'bus'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bus className="w-5 h-5" />
                <span>Buses</span>
              </button>
              <button
                onClick={() => changeType('train')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  travelType === 'train'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>Trains</span>
              </button>
              <button
                onClick={() => changeType('metro')}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  travelType === 'metro'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>Metro</span>
              </button>
            </div>

            {/* Helper text only when inputs are empty */}
            {!hasLocations && (
              <div className="mb-6 text-gray-600 text-sm">
                {travelType==='flight' && 'Enter source, destination and departure date'}
                {travelType==='hotel' && 'Enter city and both dates'}
                {(travelType==='bus' || travelType==='train' || travelType==='metro') && 'Enter source, destination and travel date'}
              </div>
            )}

            <div className="space-y-6">
              {/* Inputs change based on travel type */}
              {travelType==='flight' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">From<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={fromLocation}
                        onChange={(e) => { setFromLocation(e.target.value); setShowFromList(true); }}
                        onFocus={()=> setShowFromList(true)}
                        onBlur={()=> setTimeout(()=> setShowFromList(false), 120)}
                        placeholder="Enter city or airport"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                      />
                      {showFromList && (
                        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow max-h-60 overflow-y-auto">
                          {filterAirports(fromLocation).map(a => (
                            <button key={a.code} onClick={()=> { setFromLocation(`${a.city} (${a.code})`); setShowFromList(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                              <div className="font-semibold text-gray-800">{a.city} ({a.code})</div>
                              <div className="text-xs text-gray-500">{a.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={toLocation}
                        onChange={(e) => { setToLocation(e.target.value); setShowToList(true); }}
                        onFocus={()=> setShowToList(true)}
                        onBlur={()=> setTimeout(()=> setShowToList(false), 120)}
                        placeholder="Enter city or airport"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                      />
                      {showToList && (
                        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow max-h-60 overflow-y-auto">
                          {filterAirports(toLocation).map(a => (
                            <button key={a.code} onClick={()=> { setToLocation(`${a.city} (${a.code})`); setShowToList(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                              <div className="font-semibold text-gray-800">{a.city} ({a.code})</div>
                              <div className="text-xs text-gray-500">{a.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {travelType==='hotel' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City<span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={hotelCity}
                      onChange={(e)=> { setHotelCity(e.target.value); setShowHotelList(true); }}
                      onFocus={()=> setShowHotelList(true)}
                      onBlur={()=> setTimeout(()=> setShowHotelList(false), 120)}
                      placeholder="Enter city"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                    />
                    {showHotelList && (
                      <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow max-h-60 overflow-y-auto">
                        {filterCities(hotelCity).map(c => (
                          <button key={c} onClick={()=> { setHotelCity(c); setShowHotelList(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                            <div className="font-semibold text-gray-800">{c}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {travelType==='bus' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">From<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={fromLocation}
                        onChange={(e) => { setFromLocation(e.target.value); setShowFromList(true); }}
                        onFocus={()=> setShowFromList(true)}
                        onBlur={()=> setTimeout(()=> setShowFromList(false), 120)}
                        placeholder="Enter city"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                      />
                      {showFromList && (
                        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow max-h-60 overflow-y-auto">
                          {filterCities(fromLocation).map(c => (
                            <button key={c} onClick={()=> { setFromLocation(c); setShowFromList(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                              <div className="font-semibold text-gray-800">{c}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={toLocation}
                        onChange={(e) => { setToLocation(e.target.value); setShowToList(true); }}
                        onFocus={()=> setShowToList(true)}
                        onBlur={()=> setTimeout(()=> setShowToList(false), 120)}
                        placeholder="Enter city"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                      />
                      {showToList && (
                        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow max-h-60 overflow-y-auto">
                          {filterCities(toLocation).map(c => (
                            <button key={c} onClick={()=> { setToLocation(c); setShowToList(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                              <div className="font-semibold text-gray-800">{c}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(travelType==='train' || travelType==='metro') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">From<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={fromLocation}
                        onChange={(e) => { setFromLocation(e.target.value); setShowFromList(true); }}
                        onFocus={()=> setShowFromList(true)}
                        onBlur={()=> setTimeout(()=> setShowFromList(false), 120)}
                        placeholder={travelType==='metro' ? 'Enter station or area' : 'Enter city or station'}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                      />
                      {showFromList && (
                        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow max-h-60 overflow-y-auto">
                          {filterCities(fromLocation).map(c => (
                            <button key={c} onClick={()=> { setFromLocation(c); setShowFromList(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                              <div className="font-semibold text-gray-800">{c}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={toLocation}
                        onChange={(e) => { setToLocation(e.target.value); setShowToList(true); }}
                        onFocus={()=> setShowToList(true)}
                        onBlur={()=> setTimeout(()=> setShowToList(false), 120)}
                        placeholder={travelType==='metro' ? 'Enter station or area' : 'Enter city or station'}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                      />
                      {showToList && (
                        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow max-h-60 overflow-y-auto">
                          {filterCities(toLocation).map(c => (
                            <button key={c} onClick={()=> { setToLocation(c); setShowToList(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                              <div className="font-semibold text-gray-800">{c}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {hasLocations && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{travelType==='hotel' ? 'Check-in' : (travelType==='bus' || travelType==='train' || travelType==='metro') ? 'Travel Date' : 'Departure'}<span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={departureDate}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                        />
                      </div>
                    </div>

                    {!(travelType === 'bus' || travelType==='train' || travelType==='metro') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{travelType==='hotel' ? 'Check-out' : 'Return'}{travelType==='hotel' && <span className="text-red-500">*</span>}</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{travelType==='hotel' ? 'Guests' : (travelType==='bus' || travelType==='train' || travelType==='metro') ? 'Passengers' : 'Travelers'}<span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={travelers}
                          onChange={(e) => setTravelers(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg appearance-none bg-white"
                        >
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <option key={num} value={num}>
                              {num} {travelType==='hotel' ? (num === 1 ? 'Guest' : 'Guests') : travelType==='bus' ? (num === 1 ? 'Passenger' : 'Passengers') : (num === 1 ? 'Traveler' : 'Travelers')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!readyToSearch}
                    onClick={handleSearch}
                    className={`w-full py-5 ${readyToSearch ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700' : 'bg-gray-300 cursor-not-allowed'} text-white text-xl font-bold rounded-xl transition-all shadow-lg hover:shadow-xl`}
                  >
                    {travelType === 'flight' && 'Search Flights'}
                    {travelType === 'hotel' && 'Search Hotels'}
                    {travelType === 'bus' && 'Search Buses'}
                    {travelType === 'train' && 'Search Trains'}
                    {travelType === 'metro' && 'Search Metro'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Fare Deals band */}
        <section className="mt-6 mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="inline-flex w-2 h-2 rounded-full bg-cyan-500" />
              Recent Fare Deals
            </h2>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-cyan-700 hover:text-cyan-800 text-sm font-semibold"
            >
              Refresh ↻
            </button>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-3 pr-2">
              {[
                { from: 'Bengaluru', fromCode: 'BLR', to: 'Goa', toCode: 'GOX', date: '2025-10-21', price: 3299, stops: 0, off: 18 },
                { from: 'Mumbai', fromCode: 'BOM', to: 'Goa', toCode: 'GOI', date: '2025-10-26', price: 2899, stops: 0, off: 22 },
                { from: 'Delhi', fromCode: 'DEL', to: 'Bengaluru', toCode: 'BLR', date: '2025-11-03', price: 4499, stops: 1, off: 15 },
                { from: 'Hyderabad', fromCode: 'HYD', to: 'Goa', toCode: 'GOX', date: '2025-10-28', price: 3099, stops: 0, off: 12 },
                { from: 'Chennai', fromCode: 'MAA', to: 'Mumbai', toCode: 'BOM', date: '2025-11-10', price: 3999, stops: 1, off: 10 },
                { from: 'Kolkata', fromCode: 'CCU', to: 'Goa', toCode: 'GOI', date: '2025-11-14', price: 5599, stops: 1, off: 14 },
                { from: 'Bengaluru', fromCode: 'BLR', to: 'Delhi', toCode: 'DEL', date: '2025-11-07', price: 4599, stops: 0, off: 9 },
                { from: 'Mumbai', fromCode: 'BOM', to: 'Chennai', toCode: 'MAA', date: '2025-11-02', price: 3199, stops: 0, off: 13 },
                { from: 'Delhi', fromCode: 'DEL', to: 'Goa', toCode: 'GOX', date: '2025-11-19', price: 5299, stops: 1, off: 11 },
                { from: 'Bengaluru', fromCode: 'BLR', to: 'Goa', toCode: 'GOI', date: '2025-11-22', price: 3399, stops: 0, off: 16 },
              ].map((d) => (
                <div key={`${d.fromCode}-${d.toCode}-${d.date}`} className="bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all hover:-translate-y-0.5 min-w-[240px]">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-gray-900">
                        {d.fromCode} → {d.toCode}
                      </div>
                      {d.off > 0 && (
                        <div className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white">
                          {d.off}% OFF
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {d.from} → {d.to} • {new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {d.stops === 0 ? 'Nonstop' : `${d.stops} stop`}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs text-gray-500">from</div>
                        <div className="text-2xl font-bold text-cyan-700">₹{d.price.toLocaleString()}</div>
                      </div>
                      <button
                        onClick={() => {
                          // Directly perform a prefilled search to results
                          const searchData = {
                            type: 'flight' as const,
                            fromLocation: `${d.from} (${d.fromCode})`,
                            toLocation: `${d.to} (${d.toCode})`,
                            departureDate: d.date,
                            returnDate: '',
                            travelers: 1,
                          };
                          try { localStorage.setItem('travelSearch', JSON.stringify(searchData)); localStorage.setItem('bookingType','flight'); } catch { /* ignore */ }
                          setTravelType('flight');
                          setFromLocation(`${d.from} (${d.fromCode})`);
                          setToLocation(`${d.to} (${d.toCode})`);
                          setDepartureDate(d.date);
                          setReturnDate('');
                          setCurrentPage('travel-results');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-semibold hover:from-teal-600 hover:to-cyan-700"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
<section className="mb-12 mt-12">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-3xl font-bold text-gray-900 section-title">Trending Destinations</h2>
    <button
      onClick={() => setCurrentPage('travel-home')}
      className="text-cyan-600 hover:text-cyan-700 font-semibold"
    >
      View All →
    </button>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 cards-grid">
    {[
      { id: 1, name: 'Bali', code: 'DPS', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBRQHY9wJRxI7fMTTydWRLXHmnNbNPanylcQ&s', rating: 4.9, location: 'Indonesia', price: 29999, duration: '4 Nights' },
      { id: 2, name: 'Paris', code: 'CDG', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaNj1sfV1xkv05mg5aa3THujVeaQvOP6SMgg&s', rating: 4.8, location: 'France', price: 79999, duration: '5 Nights' },
      { id: 3, name: 'Maldives', code: 'MLE', image: 'https://media1.thrillophilia.com/filestore/x4hn9m7uhrm35dumwpzn5optp9zb_Maldives-Vertical-6.jpg?w=400&dpr=2', rating: 4.9, location: 'South Asia', price: 99999, duration: '6 Nights' },
      { id: 4, name: 'Swiss Alps', code: 'ZRH', image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=600', rating: 4.9, location: 'Switzerland', price: 129999, duration: '7 Nights' }
    ].map(dest => (
      <div
        key={dest.id}
        onClick={() => setSelectedDest(dest)}
        className="bg-white rounded-2xl shadow overflow-hidden cursor-pointer transform hover:scale-105 transition-all border border-gray-200"
      >
        <div className="relative h-48">
          <ImageWithFallback src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-800">
            ⭐ {dest.rating}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-xl mb-2 text-gray-900">{dest.name}</h3>
          <p className="text-gray-700 mb-2">{dest.location}</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-cyan-700">₹{dest.price.toLocaleString()}</span>
            <span className="text-sm text-gray-500">{dest.duration}</span>
          </div>
          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTravelType('flight');
                setToLocation(`${dest.name} (${dest.code})`);
                if (!fromLocation) setFromLocation('Bengaluru (BLR)');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:from-teal-600 hover:to-cyan-700"
            >
              Search flights to {dest.name}
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

        {/* Destination Details Modal */}
        {selectedDest && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setSelectedDest(null); setJustAppliedFromModal(false); }} />
            <div className="relative bg-white w-full max-w-3xl mx-4 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh]">
              {/* Close (minimize) button */}
              <button
                aria-label="Close"
                onClick={() => { setSelectedDest(null); setJustAppliedFromModal(false); setDestMinimized(true); try { localStorage.setItem('destModalMinimized','1'); } catch { /* ignore */ } }}
                className="absolute right-3 top-3 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-56 md:h-full">
                  <img src={selectedDest.image} alt={selectedDest.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 overflow-y-auto max-h-[85vh]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedDest.name}</h3>
                      <div className="text-sm text-gray-600">{selectedDest.location}</div>
                    </div>
                    <div className="text-sm font-semibold bg-teal-50 text-teal-700 px-3 py-1 rounded-full">⭐ {selectedDest.rating}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-2xl font-bold text-cyan-700">₹{selectedDest.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">
                      {(() => {
                        const match = selectedDest.duration.match(/(\d+)/);
                        const nights = match ? parseInt(match[1]) : 4;
                        const days = nights + 1;
                        return `${days} Days / ${nights} Nights`;
                      })()}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Perks & Inclusions</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {getDestMeta(selectedDest).perks.map(p => (
                        <li key={p} className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-emerald-600" /><span>{p}</span></li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Itinerary</h4>
                    <div className="text-sm text-gray-700 space-y-1 max-h-28 overflow-auto pr-1">
                      {(() => {
                        const match = selectedDest.duration.match(/(\d+)/);
                        const nights = match ? parseInt(match[1]) : 4;
                        const days = nights + 1;
                        const base: string[] = [];
                        for (let d = 1; d <= days; d++) {
                          if (d === 1) base.push(`Day ${d}: Arrival, hotel check-in and leisure time`);
                          else if (d === days) base.push(`Day ${d}: Checkout and return flight`);
                          else base.push(`Day ${d}: Guided sightseeing and local experiences`);
                        }
                        const highlights = getDestMeta(selectedDest).highlights.slice(0, Math.max(0, Math.min(2, days-2)));
                        const merged = base.map((line, idx) => idx>0 && idx<base.length-1 && highlights[idx-1] ? `${line} • ${highlights[idx-1]}` : line);
                        return merged.map(line => <div key={line}>• {line}</div>);
                      })()}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <div className="flex items-center text-amber-800 mb-2">
                      <Tag className="w-4 h-4 mr-2" />
                      <span className="font-semibold mr-1">Offers:</span>
                      <span className="text-sm">{getDestMeta(selectedDest).offerHotelText} • {getDestMeta(selectedDest).offerFlightText}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const code = getDestMeta(selectedDest).offerHotelCode;
                          localStorage.setItem('selectedOfferCode', code);
                          setQueuedOfferCode(code);
                          setJustAppliedFromModal(true);
                        }}
                        className="px-3 py-2 rounded-lg bg-white border-2 border-teal-500 text-teal-700 font-semibold hover:bg-teal-50"
                      >Apply Hotel Offer ({getDestMeta(selectedDest).offerHotelCode})</button>
                      <button
                        onClick={() => {
                          const code = getDestMeta(selectedDest).offerFlightCode;
                          localStorage.setItem('selectedOfferCode', code);
                          setQueuedOfferCode(code);
                          setJustAppliedFromModal(true);
                        }}
                        className="px-3 py-2 rounded-lg bg-white border-2 border-cyan-500 text-cyan-700 font-semibold hover:bg-cyan-50"
                      >Apply Flight Offer ({getDestMeta(selectedDest).offerFlightCode})</button>
                    </div>
                    {justAppliedFromModal && <div className="mt-2 text-emerald-700 font-semibold text-sm">Offer queued! It will auto-apply at checkout.</div>}
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 dest-actions">
                    
                    <button
                      onClick={() => {
                        localStorage.setItem('selectedTripPackage', JSON.stringify(selectedDest));
                        setSelectedDest(null);
                        setJustAppliedFromModal(false);
                        setCurrentPage('travel-booking');
                      }}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold hover:from-teal-600 hover:to-cyan-700 justify-self-center col-span-1 sm:col-span-2 primary"
                    >
                      Book Now
                    </button>
                    <button
                      onClick={() => {
                        const code = getDestMeta(selectedDest).offerHotelCode;
                        localStorage.setItem('selectedOfferCode', code);
                        setQueuedOfferCode(code);
                        setSelectedDest(null);
                        setCurrentPage('travel-hotels');
                      }}
                      className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 col-span-1 sm:col-span-2 secondary"
                    >
                      Apply & Browse Hotels
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restore button when minimized */}
        {destMinimized && !selectedDest && (
          <div className="fixed bottom-24 right-4 z-[60]">
            <button
              onClick={() => { setDestMinimized(false); try { localStorage.removeItem('destModalMinimized'); } catch { /* ignore */ } }}
              className="px-4 py-2 rounded-full shadow bg-white border border-gray-200 text-sm font-semibold hover:bg-gray-50"
            >
              Show Destination Card
            </button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setCurrentPage('travel-results')}
            className="text-left bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
          >
            <div className="flex items-center mb-2">
              <Plane className="w-6 h-6 text-teal-600 mr-2" />
              <div className="text-teal-700 font-extrabold text-2xl">500+</div>
            </div>
            <div className="text-gray-800 font-semibold">Airlines & Operators</div>
            <div className="text-gray-600 text-sm mt-1">Compare options across domestic and international networks.</div>
            <div className="mt-2 text-teal-700 font-semibold">Browse flights →</div>
          </button>

          <button
            onClick={() => setCurrentPage('travel-home')}
            className="text-left bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
          >
            <div className="flex items-center mb-2">
              <Users className="w-6 h-6 text-emerald-600 mr-2" />
              <div className="text-emerald-700 font-extrabold text-2xl">10M+</div>
            </div>
            <div className="text-gray-800 font-semibold">Happy Travelers</div>
            <div className="text-gray-600 text-sm mt-1">Trusted by a growing community with 4.8★ average rating.</div>
            <div className="mt-2 text-emerald-700 font-semibold">Plan your trip →</div>
          </button>

          <button
            onClick={() => setCurrentPage('wallet-offers')}
            className="text-left bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
          >
            <div className="flex items-center mb-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600 mr-2" />
              <div className="text-indigo-700 font-extrabold text-2xl">Best Price</div>
            </div>
            <div className="text-gray-800 font-semibold">Guaranteed</div>
            <div className="text-gray-600 text-sm mt-1">Use in-app offers to unlock extra savings on checkout.</div>
            <div className="mt-2 text-indigo-700 font-semibold">View offers →</div>
          </button>
        </div>
        
      </div>
      
    </div>
  );
}

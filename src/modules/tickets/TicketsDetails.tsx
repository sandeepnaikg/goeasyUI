import { useState, useEffect } from 'react';
import { Star, Clock, Calendar, Languages, Film, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ImageWithFallback from '../../components/ImageWithFallback';

type Show = { id: string; time: string; type: string; price: number; filling: string };
type Theater = { id: string; name: string; facilities: string[]; shows: Show[] };

const theaters: Theater[] = [
  {
    id: '1',
    name: 'PVR Cinemas - Phoenix Mall',
    facilities: ['2D', '3D', 'IMAX', 'Dolby Atmos'],
    shows: [
      { id: 's1', time: '10:00 AM', type: '2D', price: 200, filling: 'fast' },
      { id: 's2', time: '01:30 PM', type: '3D', price: 350, filling: 'fast' },
      { id: 's3', time: '05:00 PM', type: 'IMAX', price: 450, filling: 'available' },
      { id: 's4', time: '08:30 PM', type: '3D', price: 400, filling: 'fast' },
      { id: 's5', time: '11:00 PM', type: '2D', price: 250, filling: 'available' }
    ]
  },
  {
    id: '2',
    name: 'INOX Megaplex',
    facilities: ['2D', '3D', 'Dolby Atmos'],
    shows: [
      { id: 's6', time: '09:30 AM', type: '2D', price: 180, filling: 'available' },
      { id: 's7', time: '12:45 PM', type: '3D', price: 320, filling: 'fast' },
      { id: 's8', time: '04:15 PM', type: '2D', price: 220, filling: 'available' },
      { id: 's9', time: '07:45 PM', type: '3D', price: 380, filling: 'fast' },
      { id: 's10', time: '10:30 PM', type: '2D', price: 200, filling: 'available' }
    ]
  },
  {
    id: '3',
    name: 'Cinepolis DLF',
    facilities: ['2D', '3D', '4DX'],
    shows: [
      { id: 's11', time: '11:00 AM', type: '2D', price: 190, filling: 'available' },
      { id: 's12', time: '02:30 PM', type: '3D', price: 340, filling: 'available' },
      { id: 's13', time: '06:00 PM', type: '4DX', price: 500, filling: 'fast' },
      { id: 's14', time: '09:15 PM', type: '3D', price: 390, filling: 'fast' }
    ]
  }
];

export default function TicketsDetails() {
  type Movie = { id: string; title: string; genre: string; rating: number; votes: string; language: string; format: string; duration: string; image: string };
  const [movie, setMovie] = useState<Movie | null>(null);
  const [selectedDate, setSelectedDate] = useState('2025-10-07');
  const [formatFilter, setFormatFilter] = useState<'any'|'2D'|'3D'|'IMAX'|'4DX'>('any');
  const [languageFilter, setLanguageFilter] = useState<'any'|'English'|'Hindi'|'Tamil'|'Telugu'>('any');
  const [timeSlot, setTimeSlot] = useState<'any'|'morning'|'afternoon'|'evening'|'night'>('any');
  const { setCurrentPage, favorites, setFavorite } = useApp();

  useEffect(() => {
    const data = localStorage.getItem('selectedMovie');
    if (data) {
      setMovie(JSON.parse(data));
    }
  }, []);

  const handleShowSelect = (theater: Theater, show: Show) => {
    localStorage.setItem('selectedShow', JSON.stringify({ theater, show, movie }));
    setCurrentPage('tickets-seats');
  };

  const dates = [
    { date: '2025-10-07', day: 'Today' },
    { date: '2025-10-08', day: 'Tomorrow' },
    { date: '2025-10-09', day: 'Wed' },
    { date: '2025-10-10', day: 'Thu' },
    { date: '2025-10-11', day: 'Fri' }
  ];

  if (!movie) return null;

  return (
  <div className="min-h-screen bg-white pb-24 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl overflow-hidden mb-6 border border-gray-200 shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
            <div className="md:col-span-1">
              <ImageWithFallback
                src={movie.image}
                alt={movie.title}
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>

            <div className="md:col-span-2 text-gray-900">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold">{movie.title}</h1>
                <button onClick={() => setFavorite(`movie:${movie.id}`, !favorites[`movie:${movie.id}`])} className={`p-2 rounded-full bg-gradient-to-r ${favorites[`movie:${movie.id}`] ? 'from-rose-500 to-pink-600 text-white' : 'from-gray-100 to-gray-200 text-gray-800'}`} aria-label="Favorite">
                  <Heart className={`w-4 h-4 ${favorites[`movie:${movie.id}`] ? 'fill-white' : ''}`} />
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  <span className="font-bold">{movie.rating}/5</span>
                  <span className="text-gray-600">({movie.votes} votes)</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Film className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{movie.genre}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{movie.duration}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Languages className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{movie.language}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Available in: {movie.format}</span>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <h3 className="font-bold text-lg mb-2 text-green-800">Special Offer!</h3>
                <p className="text-sm text-green-700">Buy 2 or more tickets and get FREE Coca-Cola (worth ₹120)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Date</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {dates.map((d) => (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedDate === d.date
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm">{d.day}</div>
                <div className="text-xs opacity-70">{d.date.slice(8)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <div className="text-sm font-semibold mb-1">Format</div>
              <select value={formatFilter} onChange={e=> setFormatFilter(e.target.value as typeof formatFilter)} className="w-full px-3 py-2 border rounded-lg">
                {(['any','2D','3D','IMAX','4DX'] as const).map(f=> <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">Language</div>
              <select value={languageFilter} onChange={e=> setLanguageFilter(e.target.value as typeof languageFilter)} className="w-full px-3 py-2 border rounded-lg">
                {(['any','English','Hindi','Tamil','Telugu'] as const).map(l=> <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">Time</div>
              <select value={timeSlot} onChange={e=> setTimeSlot(e.target.value as typeof timeSlot)} className="w-full px-3 py-2 border rounded-lg">
                <option value="any">Any</option>
                <option value="morning">Morning (9-12)</option>
                <option value="afternoon">Afternoon (12-17)</option>
                <option value="evening">Evening (17-21)</option>
                <option value="night">Night (21-24)</option>
              </select>
            </div>
            <div className="flex items-end">
              <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="w-full text-center px-4 py-2 bg-gray-900 text-white rounded-lg">Open venue map</a>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Select Cinema & Show Time</h2>

          {theaters.map((theater) => (
            <div key={theater.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{theater.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {theater.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {theater.shows
                  .filter(show => formatFilter==='any' || show.type.toUpperCase()===formatFilter)
                  .filter(show => {
                    if (timeSlot==='any') return true;
                    const h = parseInt(show.time.split(':')[0], 10);
                    if (timeSlot==='morning') return h>=9 && h<12;
                    if (timeSlot==='afternoon') return h>=12 && h<17;
                    if (timeSlot==='evening') return h>=17 && h<21;
                    return h>=21 || h<1;
                  })
                  .map((show) => (
                  <button
                    key={show.id}
                    onClick={() => handleShowSelect(theater, show)}
                    className="relative bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl p-4 text-left transition-all group"
                  >
                    <div className="text-gray-900 font-bold mb-1">{show.time}</div>
                    <div className="text-gray-600 text-sm mb-2">{show.type}</div>
                    <div className="text-gray-900 font-semibold">₹{show.price}</div>
                    {show.filling === 'fast' && (
                      <div className="mt-2 text-xs text-orange-600 font-semibold">Filling Fast!</div>
                    )}
                    {/* hover seating preview */}
                    <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-white border rounded px-2 py-0.5 shadow">Seats: {show.filling==='fast'?'< 30% left':'60%+'}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, Star, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ImageWithFallback from '../../components/ImageWithFallback';
import OffersStrip from '../../components/OffersStrip';

type Hotel = {
  id: string;
  name: string;
  location: string;
  rating: number;
  pricePerNight: number;
  image: string;
  description: string;
};

const hotels: Hotel[] = [
  { id: 'h1', name: 'Ocean View Resort', location: 'Bali, Indonesia', rating: 4.8, pricePerNight: 8999, image: 'https://images.pexels.com/photos/164631/pexels-photo-164631.jpeg', description: 'Seaside resort with private beach and spa.' },
  { id: 'h2', name: 'Paris Central Hotel', location: 'Paris, France', rating: 4.7, pricePerNight: 12999, image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg', description: 'Boutique hotel near the city center and attractions.' },
  { id: 'h3', name: 'Tropical Escape Villas', location: 'Maldives', rating: 4.9, pricePerNight: 19999, image: 'https://images.pexels.com/photos/1450350/pexels-photo-1450350.jpeg', description: 'Overwater villas with all-inclusive package.' },
  { id: 'h4', name: 'Mountain Lodge', location: 'Manali, India', rating: 4.6, pricePerNight: 4999, image: 'https://images.pexels.com/photos/672358/pexels-photo-672358.jpeg', description: 'Cozy lodge with mountain views and fireplace.' },
  { id: 'h5', name: 'City Lights Hotel', location: 'New York, USA', rating: 4.5, pricePerNight: 10999, image: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg', description: 'Modern hotel in the heart of downtown.' },
  { id: 'h6', name: 'Sahara Desert Camp', location: 'Merzouga, Morocco', rating: 4.4, pricePerNight: 3999, image: 'https://images.pexels.com/photos/248771/pexels-photo-248771.jpeg', description: 'Luxury desert camps with evening shows.' },
  { id: 'h7', name: 'Lakeside Retreat', location: 'Srinagar, India', rating: 4.7, pricePerNight: 7599, image: 'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg', description: 'Peaceful stay by the lake with houseboats nearby.' },
  { id: 'h8', name: 'Historic Manor', location: 'Rajasthan, India', rating: 4.6, pricePerNight: 8999, image: 'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg', description: 'Heritage property with royal treatment.' },
  { id: 'h9', name: 'Eco Green Resort', location: 'Costa Rica', rating: 4.5, pricePerNight: 6999, image: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg', description: 'Sustainable resort with jungle excursions.' },
  { id: 'h10', name: 'Harborview Inn', location: 'Sydney, Australia', rating: 4.6, pricePerNight: 9999, image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg', description: 'Rooms overlooking the harbor and Opera House.' }
];

export default function TravelHotels() {
  const { setCurrentPage, prevPage, favorites, setFavorite, addRecentlyViewed } = useApp();
  const [selected, setSelected] = useState<Hotel | null>(null);
  const [nights] = useState<number>(() => {
    try {
      const s = JSON.parse(localStorage.getItem('travelSearch') || 'null');
      if (s?.departureDate && s?.returnDate) {
        const d1 = new Date(s.departureDate);
        const d2 = new Date(s.returnDate);
        const diff = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
        return diff;
      }
    } catch { /* ignore */ }
    return 1;
  });
  const [guests] = useState<number>(() => {
    try { const s = JSON.parse(localStorage.getItem('travelSearch') || 'null'); return s?.travelers || 1; } catch { return 1; }
  });

  const sortedHotels = useMemo(() => {
    return [...hotels].sort((a, b) => b.rating - a.rating);
  }, []);

  const handleSelect = (h: Hotel) => {
    setSelected(h);
    localStorage.setItem('selectedHotel', JSON.stringify(h));
  addRecentlyViewed({ id: h.id, type: 'travel', title: h.name, image: h.image });
  };

  const handleBook = () => {
    // keep booking flow in TravelBooking
    try { localStorage.setItem('bookingType','hotel'); } catch { /* ignore */ }
    setCurrentPage('travel-booking');
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <OffersStrip offers={[{ code: 'STAY20', label: 'Stay: 20% OFF up to ₹500' }]} />
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentPage(prevPage || 'travel-home')}
            className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold">Hotels</h1>
          <div className="w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedHotels.map(h => {
            const total = h.pricePerNight * nights;
            return (
              <div key={h.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-transform hover:scale-[1.02]">
                <div className="relative h-48">
                  <ImageWithFallback src={h.image} alt={h.name} className="w-full h-full object-cover" />
                  <button
                    aria-label="Wishlist"
                    onClick={() => setFavorite(`hotel:${h.id}`, !favorites[`hotel:${h.id}`])}
                    className={`absolute top-3 left-3 p-2 rounded-full ${favorites[`hotel:${h.id}`] ? 'bg-rose-500 text-white' : 'bg-white/90 hover:bg-white text-gray-700'}`}
                  >
                    <Heart className={`w-4 h-4 ${favorites[`hotel:${h.id}`] ? 'fill-white' : ''}`} />
                  </button>
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-800 inline-flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {h.rating}
                  </div>
                  {h.rating >= 4.7 && (
                    <div className="absolute bottom-3 left-3 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> Rare find
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{h.name}</h3>
                      <p className="text-sm text-gray-600">{h.location}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{h.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <div className="text-lg font-bold">₹{h.pricePerNight.toLocaleString()} <span className="text-sm font-medium text-gray-600">night</span></div>
                      <div className="text-xs text-gray-500">₹{total.toLocaleString()} total • {nights} night{nights>1?'s':''} • {guests} guest{guests>1?'s':''}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleSelect(h)} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Select</button>
                      <button onClick={() => { handleSelect(h); handleBook(); }} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded hover:from-teal-600 hover:to-cyan-700">Book</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="mt-8 bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold mb-2">Selected Hotel</h2>
            <div className="flex items-center space-x-6">
              <div className="w-36 h-24 overflow-hidden rounded">
                <ImageWithFallback src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{selected.name}</div>
                <div className="text-sm text-gray-600">{selected.location}</div>
                <div className="mt-2">{selected.description}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">₹{selected.pricePerNight.toLocaleString()} / night</div>
                <button onClick={handleBook} className="mt-4 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded">Continue</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

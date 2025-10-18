import { useEffect, useState } from 'react';
import { Star, Clock, ChevronLeft, ChevronRight, Flame, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ImageWithFallback from '../../components/ImageWithFallback';
import OffersStrip from '../../components/OffersStrip';
import ShareReferralButton from '../../components/ShareReferralButton';

const movies = [
  {
    id: '1',
    title: 'Avengers: Secret Wars',
    genre: 'Action, Sci-Fi',
    rating: 4.8,
    votes: '125K',
    language: 'English, Hindi',
    format: '2D, 3D, IMAX',
    duration: '2h 45m',
    image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=600',
    releaseDate: '2025-10-15',
    description: 'The multiverse collides as heroes unite for the ultimate showdown.'
  },
  {
    id: '2',
    title: 'The Dark Knight Returns',
    genre: 'Action, Thriller',
    rating: 4.7,
    votes: '98K',
    language: 'English, Hindi, Tamil',
    format: '2D, IMAX',
    duration: '2h 30m',
    image: 'https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg?auto=compress&cs=tinysrgb&w=600',
    releaseDate: '2025-10-12',
    description: 'A vigilante faces his greatest moral test against a cunning foe.'
  },
  {
    id: '3',
    title: 'Inception 2',
    genre: 'Sci-Fi, Thriller',
    rating: 4.9,
    votes: '156K',
    language: 'English, Hindi',
    format: '2D, 3D, IMAX',
    duration: '2h 55m',
    image: 'https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg?auto=compress&cs=tinysrgb&w=600',
    releaseDate: '2025-10-20',
    description: 'Dive deeper into dreams with mind-bending heists across realities.'
  },
  {
    id: '4',
    title: 'Spider-Man: New Era',
    genre: 'Action, Adventure',
    rating: 4.6,
    votes: '89K',
    language: 'English, Hindi, Tamil, Telugu',
    format: '2D, 3D',
    duration: '2h 20m',
    image: 'https://images.pexels.com/photos/19668967/pexels-photo-19668967.jpeg?auto=compress&cs=tinysrgb&w=600',
    releaseDate: 'Now Showing',
    description: 'New threats emerge as the friendly neighborhood hero swings into action.'
  }
  ,
  {
    id: '5',
    title: 'Dune: Part Three',
    genre: 'Sci-Fi, Adventure',
    rating: 4.7,
    votes: '76K',
    language: 'English, Hindi',
    format: '2D, IMAX',
    duration: '2h 40m',
    image: 'https://images.pexels.com/photos/7991221/pexels-photo-7991221.jpeg?auto=compress&cs=tinysrgb&w=600',
    releaseDate: '2025-10-22',
    description: 'The spice must flow as destinies collide on Arrakis.'
  },
  {
    id: '6',
    title: 'Interstellar: Beyond',
    genre: 'Sci-Fi, Drama',
    rating: 4.9,
    votes: '210K',
    language: 'English',
    format: '2D, IMAX 70mm',
    duration: '3h 05m',
    image: 'https://images.pexels.com/photos/7991156/pexels-photo-7991156.jpeg?auto=compress&cs=tinysrgb&w=600',
    releaseDate: '2025-10-30',
    description: 'A voyage through space-time to save humanity once more.'
  },
  {
    id: '7',
    title: 'Jawan 2',
    genre: 'Action, Thriller',
    rating: 4.5,
    votes: '134K',
    language: 'Hindi, Tamil, Telugu',
    format: '2D',
    duration: '2h 35m',
    image: 'https://images.pexels.com/photos/7991324/pexels-photo-7991324.jpeg?auto=compress&cs=tinysrgb&w=600',
    releaseDate: 'Now Showing',
    description: 'A vigilante returns in a high-octane mission of justice.'
  }
  ,
  {
    id: '8',
    title: 'RRR: Rise Again',
    genre: 'Action, Drama',
    rating: 4.4,
    votes: '88K',
    language: 'Hindi, Telugu, Tamil',
    format: '2D',
    duration: '2h 50m',
    image: 'https://images.pexels.com/photos/7991305/pexels-photo-7991305.jpeg?auto=compress&cs=tinysrgb&w=600',
    releaseDate: 'Now Showing',
    description: 'Epic saga continues with breathtaking action and emotion.'
  },
  {
    id: '9',
    title: 'Avatar: The Deep',
    genre: 'Sci-Fi, Adventure',
    rating: 4.6,
    votes: '190K',
    language: 'English, Hindi, Tamil',
    format: '3D, IMAX',
    duration: '3h 10m',
    image: 'https://images.pexels.com/photos/7991573/pexels-photo-7991573.jpeg?auto=compress&cs=tinysrgb&w=600',
    releaseDate: '2025-11-01',
    description: 'Return to Pandora with stunning visuals and new worlds.'
  },
  {
    id: '10',
    title: 'KGF Chapter 3',
    genre: 'Action, Thriller',
    rating: 4.5,
    votes: '145K',
    language: 'Kannada, Hindi, Tamil, Telugu',
    format: '2D',
    duration: '2h 45m',
    image: 'https://images.pexels.com/photos/7991449/pexels-photo-7991449.jpeg?auto=compress&cs=tinysrgb&w=600',
    releaseDate: 'Now Showing',
    description: 'The saga continues with power, politics, and gold.'
  }
];

const offers = [
  {
    id: '1',
    title: 'Buy 2 Get Free Coke',
    description: 'Book 2 or more tickets and get complimentary Coca-Cola',
    color: 'from-red-500 to-pink-600'
  },
  {
    id: '2',
    title: 'Weekend Special',
    description: 'Flat 20% off on all movie tickets this weekend',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: '3',
    title: 'IMAX Experience',
    description: 'Get ₹100 off on IMAX tickets for selected movies',
    color: 'from-blue-500 to-cyan-600'
  }
];

export default function TicketsHome() {
  const [currentOffer, setCurrentOffer] = useState(0);
  const { setCurrentPage, favorites, setFavorite, addRecentlyViewed } = useApp();
  const [paused, setPaused] = useState(false);

  // Auto-advance the hero carousel like Shopping/Dashboard
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setCurrentOffer((i) => (i + 1) % offers.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [paused]);

  const handleMovieClick = (movie: typeof movies[0]) => {
    localStorage.setItem('selectedMovie', JSON.stringify(movie));
  addRecentlyViewed({ id: movie.id, type: 'tickets', title: movie.title, image: movie.image });
    setCurrentPage('tickets-details');
  };

  return (
  <div className="min-h-screen bg-[#F3F0FF] pb-20">
    <div className="app-shell py-5">
        {/* Hero carousel up top (full-bleed billboard) */}
        <div className="full-bleed relative mb-8">
          <div className="mx-auto app-shell">
            <div
              className="relative rounded-2xl overflow-hidden shadow h-48 md:h-64 lg:h-72"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            >
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentOffer ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className={`w-full h-full bg-gradient-to-r ${offer.color} flex items-center justify-center text-white p-8`}>
                <div className="text-center">
                  <h2 className="text-4xl font-bold mb-2">{offer.title}</h2>
                  <p className="text-xl">{offer.description}</p>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => setCurrentOffer((currentOffer - 1 + offers.length) % offers.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => setCurrentOffer((currentOffer + 1) % offers.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentOffer(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentOffer ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
            </div>
          </div>
        </div>

        {/* Top utility row: offers + referral */}
        <div className="mb-1 flex items-center justify-between">
          <div />
          <ShareReferralButton />
        </div>
        <OffersStrip offers={[
          { code: 'MOVIE20', label: 'Movies: 20% OFF (cap ₹150)' },
          { code: 'GOZY50', label: 'Flat ₹50 OFF' }
        ]} />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Book Movie Tickets</h1>
          <p className="text-gray-600 text-sm">Experience cinema like never before</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Flame className="w-7 h-7 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">Now Showing</h2>
          </div>

          {/* Standardize to 4 cards per row on large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <button
                key={movie.id}
                onClick={() => handleMovieClick(movie)}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:scale-105 transform duration-300 border border-gray-200 shadow"
              >
                <div className="relative h-80 overflow-hidden">
                  <ImageWithFallback
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFavorite(`movie:${movie.id}`, !favorites[`movie:${movie.id}`]); }}
                    className={`absolute top-4 left-4 p-2 rounded-full ${favorites[`movie:${movie.id}`] ? 'bg-rose-500 text-white' : 'bg-white/90 hover:bg-white text-gray-700'}`}
                    aria-label="Toggle favorite"
                  >
                    <Heart className={`w-4 h-4 ${favorites[`movie:${movie.id}`] ? 'fill-white' : ''}`} />
                  </button>
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-white font-bold">{movie.rating}</span>
                    <span className="text-white/60 text-sm">({movie.votes})</span>
                  </div>
                  {movie.releaseDate === 'Now Showing' && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 rounded-full">
                      <span className="text-white font-bold text-sm">Now Showing</span>
                    </div>
                  )}
                </div>

                <div className="p-5 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{movie.title}</h3>
                  <p className="text-gray-700 text-sm mb-3">{movie.genre}</p>
                  <p className="text-gray-600 text-xs line-clamp-2">{movie.description}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{movie.duration}</span>
                    </div>
                    <span>•</span>
                    <span>{movie.format}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Removed duplicate section for Now Showing */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-purple-700 font-bold text-3xl mb-2">500+</div>
            <div className="text-gray-600">Movies Available</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-cyan-700 font-bold text-3xl mb-2">200+</div>
            <div className="text-gray-600">Cinemas Nationwide</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-pink-700 font-bold text-3xl mb-2">Best Price</div>
            <div className="text-gray-600">Guaranteed</div>
          </div>
        </div>
      </div>
    </div>
  );
}

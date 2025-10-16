import { Search, Star, Clock, TrendingUp, Heart, Timer, Filter } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ImageWithFallback from '../../components/ImageWithFallback';
import BookedRecentlyCard from '../../components/BookedRecentlyCard';
import OffersStrip from '../../components/OffersStrip';
import ShareReferralButton from '../../components/ShareReferralButton';
const restaurants = [
  { id: '1', name: 'Punjabi Dhaba', cuisine: 'North Indian', rating: 4.5, deliveryTime: '30-35 min', price: 300, image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg', offer: '50% OFF up to \u20b9100', description: 'Authentic Punjabi flavours, rich gravies, and tandoor specials.' },
  { id: '2', name: 'Pizza Hub', cuisine: 'Italian, Fast Food', rating: 4.3, deliveryTime: '25-30 min', price: 400, image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg', offer: 'Free Delivery', description: 'Hand-tossed pizzas with fresh toppings and gooey cheese.' },
  { id: '3', name: 'South Spice', cuisine: 'South Indian', rating: 4.6, deliveryTime: '20-25 min', price: 200, image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg', offer: '20% OFF', description: 'Crispy dosas, soft idlis, and aromatic sambar.' },
  { id: '4', name: 'Burger Junction', cuisine: 'American, Fast Food', rating: 4.2, deliveryTime: '30-35 min', price: 250, image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', offer: 'Buy 1 Get 1', description: 'Grilled patties, loaded fries, and thick shakes.' },
  { id: '5', name: 'Chinese Dragon', cuisine: 'Chinese, Asian', rating: 4.4, deliveryTime: '35-40 min', price: 350, image: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg', offer: '30% OFF', description: 'Wok-tossed noodles, fried rice, and spicy gravies.' },
  { id: '6', name: 'Biryani House', cuisine: 'Mughlai, Biryani', rating: 4.7, deliveryTime: '40-45 min', price: 280, image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg', offer: 'Free Dessert', description: 'Dum biryanis layered with fragrant spices.' },
  { id: '7', name: 'Green Bowl', cuisine: 'Healthy, Salads', rating: 4.4, deliveryTime: '20-25 min', price: 320, image: 'https://images.pexels.com/photos/1640766/pexels-photo-1640766.jpeg', offer: '10% OFF', description: 'Fresh salads, bowls, and smoothies for a clean meal.' },
  { id: '8', name: 'Sushi World', cuisine: 'Japanese, Sushi', rating: 4.5, deliveryTime: '30-40 min', price: 550, image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg', offer: 'Combo Meals', description: 'Nigiri, maki, and hot ramen bowls made to order.' },
  { id: '9', name: 'Mediterraneo', cuisine: 'Mediterranean', rating: 4.6, deliveryTime: '35-45 min', price: 450, image: 'https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg', offer: 'Free Drink', description: 'Falafel, hummus, kebabs, and pita wraps.' },
  { id: '10', name: 'Cafe Delight', cuisine: 'Cafe, Desserts', rating: 4.3, deliveryTime: '20-25 min', price: 220, image: 'https://images.pexels.com/photos/302680/pexels-photo-302680.jpeg', offer: 'Buy 2 Get 1', description: 'Artisanal coffees, pastries, and desserts.' }
  ,
  { id: '11', name: 'Tandoori Tales', cuisine: 'North Indian, Grill', rating: 4.4, deliveryTime: '35-40 min', price: 380, image: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg', offer: 'Free Starter', description: 'Smoky kebabs, rotis, and creamy curries.' },
  { id: '12', name: 'Pasta Palace', cuisine: 'Italian', rating: 4.2, deliveryTime: '25-30 min', price: 420, image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', offer: '25% OFF', description: 'Fresh pasta with rich sauces and herbs.' }
];

export default function FoodHome() {
  const { setCurrentPage, favorites, setFavorite, addRecentlyViewed } = useApp();
  const [query, setQuery] = useState('');
  const [pureVeg, setPureVeg] = useState(false);
  const [rating4Plus, setRating4Plus] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);
  const [priceMax, setPriceMax] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<'recommended'|'rating'|'price_low'|'price_high'|'fastest'>('recommended');
  const [activeCuisine, setActiveCuisine] = useState<string | null>(null);

  const handleRestaurantClick = (restaurant: typeof restaurants[0]) => {
    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
  addRecentlyViewed({ id: restaurant.id, type: 'food', title: restaurant.name, image: restaurant.image });
    // navigate to menu for selected restaurant
    setCurrentPage('food-menu');
  };

  const q = query.trim().toLowerCase();
  const cuisines = Array.from(new Set(restaurants.flatMap(r => r.cuisine.split(',').map(x=>x.trim()))));

  const filterByAll = (r: typeof restaurants[number]) => {
    const matchesQuery = !q || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q);
    const matchesVeg = !pureVeg || r.cuisine.toLowerCase().includes('veg');
    const matchesRating = !rating4Plus || r.rating >= 4;
    const deliveryMins = Number((r.deliveryTime.match(/\d+/)?.[0]) || 60);
    const matchesFast = !fastDelivery || deliveryMins <= 30;
    const matchesPrice = r.price <= priceMax;
    const matchesCuisine = !activeCuisine || r.cuisine.toLowerCase().includes(activeCuisine.toLowerCase());
    return matchesQuery && matchesVeg && matchesRating && matchesFast && matchesPrice && matchesCuisine;
  };

  const sortedRestaurants = [...restaurants].filter(filterByAll).sort((a,b) => {
    switch (sortBy) {
      case 'rating': return b.rating - a.rating;
      case 'price_low': return a.price - b.price;
      case 'price_high': return b.price - a.price;
      case 'fastest': {
        const ma = Number((a.deliveryTime.match(/\d+/)?.[0]) || 60);
        const mb = Number((b.deliveryTime.match(/\d+/)?.[0]) || 60);
        return ma - mb;
      }
      default: return 0; // recommended keeps original sequence
    }
  });

  return (
  <div className="min-h-screen bg-[#F3F0FF]">
      <div className="app-shell py-5">
        <div className="mb-4">
          <BookedRecentlyCard module="food" />
        </div>
        <div className="mb-1 flex items-center justify-between">
          <div />
          <ShareReferralButton />
        </div>
    <OffersStrip offers={[
          { code: 'GOZY50', label: 'Flat ₹50 OFF' },
          { code: 'FIRST100', label: 'New user: ₹100 OFF' },
          { code: 'WALLET100', label: '₹100 Wallet cashback' }
        ]} />
  <div className="bg-white rounded-2xl shadow p-5 mb-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Food Online</h1>
    <p className="text-gray-600 mb-3 text-sm">Delicious meals delivered to your doorstep</p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e)=> setQuery(e.target.value)}
              placeholder="Search for restaurants or cuisines"
              className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-lg"
            />
            {q && (
              <div className="absolute mt-2 w-full bg-white rounded-xl shadow max-h-60 overflow-y-auto z-10">
                {restaurants.filter(r=> r.name.toLowerCase().startsWith(q) || r.cuisine.toLowerCase().includes(q)).slice(0,6).map(r=> (
                  <button key={r.id} onClick={()=> handleRestaurantClick(r)} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                    <div className="font-semibold text-gray-800">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.cuisine}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <input type="checkbox" checked={pureVeg} onChange={(e)=> setPureVeg(e.target.checked)} />
              Pure Veg
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <input type="checkbox" checked={rating4Plus} onChange={(e)=> setRating4Plus(e.target.checked)} />
              Rating 4+
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <input type="checkbox" checked={fastDelivery} onChange={(e)=> setFastDelivery(e.target.checked)} />
              <Timer className="w-4 h-4" /> Fast delivery
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Price for two ≤</span>
              <input type="range" min={100} max={1000} step={50} value={priceMax} onChange={(e)=> setPriceMax(Number(e.target.value)||0)} />
              <span className="font-semibold">₹{priceMax}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select value={sortBy} onChange={(e)=> setSortBy(e.target.value as typeof sortBy)} className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm">
                <option value="recommended">Recommended</option>
                <option value="rating">Rating</option>
                <option value="fastest">Fastest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
          {cuisines.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {cuisines.map(c => (
                <button key={c} onClick={()=> setActiveCuisine(activeCuisine===c? null : c)} className={`px-3 py-1.5 rounded-full border text-xs ${activeCuisine===c? 'bg-rose-600 text-white border-rose-600' : 'border-gray-300 hover:border-rose-400'}`}>{c}</button>
              ))}
              {activeCuisine && (
                <button onClick={()=> setActiveCuisine(null)} className="text-xs underline text-gray-600">Clear</button>
              )}
            </div>
          )}
        </div>

  <div className="mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Popular Restaurants</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedRestaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => handleRestaurantClick(restaurant)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden text-left group"
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFavorite(`restaurant:${restaurant.id}`, !favorites[`restaurant:${restaurant.id}`]); }}
                    className={`absolute top-4 right-4 p-2 rounded-full ${favorites[`restaurant:${restaurant.id}`] ? 'bg-rose-500 text-white' : 'bg-white/90 hover:bg-white text-gray-700'}`}
                    aria-label="Toggle favorite"
                  >
                    <Heart className={`w-4 h-4 ${favorites[`restaurant:${restaurant.id}`] ? 'fill-white' : ''}`} />
                  </button>
                  {restaurant.offer && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                      {restaurant.offer}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
                  <p className="text-gray-600 mb-1">{restaurant.cuisine}</p>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-2">{restaurant.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{restaurant.deliveryTime}</span>
                      </div>
                    </div>
                    <div className="text-gray-700 font-semibold">₹{restaurant.price} for two</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Duplicate Popular Restaurants section removed to reduce vertical bloat */}

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-red-600 font-bold text-3xl mb-2">1000+</div>
            <div className="text-gray-600">Restaurants</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-pink-600 font-bold text-3xl mb-2">30 Min</div>
            <div className="text-gray-600">Average Delivery</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-red-600 font-bold text-3xl mb-2">5M+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
        </div>
      </div>
    </div>
  );
}

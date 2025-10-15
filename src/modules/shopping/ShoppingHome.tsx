import { Search, Heart, Star, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ImageWithFallback from '../../components/ImageWithFallback';
import BookedRecentlyCard from '../../components/BookedRecentlyCard';
import OffersStrip from '../../components/OffersStrip';
import ShareReferralButton from '../../components/ShareReferralButton';

const products = [
  {
    id: '1',
    name: 'Apple iPhone 15 Pro',
    category: 'Electronics',
    price: 129900,
    originalPrice: 139900,
    rating: 4.7,
    reviews: 2340,
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600',
    discount: 7,
    badge: 'Bestseller',
    description: 'Titanium design, A17 Pro chip, 48MP camera, ProMotion display.'
  },
  {
    id: '2',
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Audio',
    price: 29990,
    originalPrice: 34990,
    rating: 4.8,
    reviews: 1876,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600',
    discount: 14,
    badge: 'Trending',
    description: 'Industry-leading noise cancellation, 30-hr battery, multi-point Bluetooth.'
  },
  {
    id: '3',
    name: 'Nike Air Max Sneakers',
    category: 'Fashion',
    price: 8999,
    originalPrice: 12999,
    rating: 4.5,
    reviews: 987,
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600',
    discount: 31,
    badge: 'Hot Deal',
    description: 'Lightweight comfort with responsive cushioning and breathable mesh.'
  },
  {
    id: '4',
    name: 'Samsung 55" 4K Smart TV',
    category: 'Electronics',
    price: 54990,
    originalPrice: 74990,
    rating: 4.6,
    reviews: 1543,
    image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=600',
    discount: 27,
    badge: 'Great Savings',
    description: 'Crystal UHD, HDR10+, built-in apps, voice assistant support.'
  },
  {
    id: '5',
    name: 'Levi\'s Denim Jacket',
    category: 'Fashion',
    price: 3499,
    originalPrice: 4999,
    rating: 4.4,
    reviews: 654,
    image: 'https://images.pexels.com/photos/1058959/pexels-photo-1058959.jpeg?auto=compress&cs=tinysrgb&w=600',
    discount: 30,
    badge: 'Limited Stock',
    description: 'Classic fit denim with durable stitching and everyday style.'
  },
  {
    id: '6',
    name: 'Apple MacBook Air M2',
    category: 'Computers',
    price: 119900,
    originalPrice: 124900,
    rating: 4.9,
    reviews: 3210,
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
    discount: 4,
    badge: 'Bestseller',
    description: 'M2 performance, all‑day battery, Retina display, silent fanless design.'
  },
  {
    id: '7',
    name: 'Adidas Sports Backpack',
    category: 'Accessories',
    price: 1999,
    originalPrice: 2999,
    rating: 4.3,
    reviews: 432,
    image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600',
    discount: 33,
    badge: 'Deal of the Day',
    description: 'Water-resistant, padded straps, 25L capacity for daily use.'
  },
  {
    id: '8',
    name: 'Canon EOS R6 Camera',
    category: 'Cameras',
    price: 219900,
    originalPrice: 249900,
    rating: 4.8,
    reviews: 876,
    image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600',
    discount: 12,
    badge: 'Pro Choice',
    description: 'Full-frame mirrorless, 20MP sensor, 4K video, Dual Pixel AF II.'
  }
];

const categories = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Home', icon: '🏠' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Books', icon: '📚' }
];

export default function ShoppingHome() {
  const { setCurrentPage } = useApp();

  const handleProductClick = (product: typeof products[0]) => {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    setCurrentPage('shopping-details');
  };

  const handleCategoryClick = (categoryName: string) => {
    // store category and navigate to category listing
    localStorage.setItem('selectedCategory', categoryName);
    setCurrentPage('shopping-category');
  };

  return (
  <div className="min-h-screen bg-white pb-20 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="mb-4">
          <BookedRecentlyCard module="shopping" />
        </div>
        <div className="mb-1 flex items-center justify-between">
          <div />
          <ShareReferralButton />
        </div>
        <OffersStrip offers={[
          { code: 'GOZY50', label: 'Flat ₹50 OFF' },
          { code: 'HDFC10', label: '10% OFF with card' }
        ]} />
        <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-200 shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Everything Online</h1>
          <p className="text-gray-600 mb-3 text-sm">Discover amazing deals on millions of products</p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 rounded-xl focus:border-gray-400 focus:outline-none text-lg"
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Shop by Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className="bg-white hover:bg-gray-50 rounded-2xl p-6 text-center transition-all border border-gray-200 shadow"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <div className="text-gray-800 font-semibold text-sm">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal carousel */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-bold text-gray-900">New & Recommended</h2>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-3 pr-2">
              {products.map((p) => (
                <button key={p.id} onClick={() => handleProductClick(p)} className="group bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all hover:-translate-y-0.5 min-w-[260px] text-left">
                  <div className="w-[260px] h-[160px] overflow-hidden rounded-t-2xl">
                    <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">{p.category}</div>
                    <div className="font-semibold text-gray-900 line-clamp-1">{p.name}</div>
                    <div className="text-sm text-gray-700">₹{p.price.toLocaleString()}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

  <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-6 h-6" />
                <h2 className="text-3xl font-bold">Flash Sale!</h2>
              </div>
              <p className="text-orange-100">Up to 70% OFF on selected items. Limited time only!</p>
            </div>
            <div className="text-right">
              <div className="text-sm mb-1">Ends in</div>
              <div className="text-3xl font-bold">04:23:15</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">Trending Products</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:scale-105 transform duration-300 text-left border border-gray-200 shadow"
              >
                <div className="relative">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                    <Heart className="w-5 h-5 text-red-500" />
                  </button>
                  {product.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 rounded-full">
                      <span className="text-white font-bold text-sm">{product.discount}% OFF</span>
                    </div>
                  )}
                  {product.badge && (
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white font-semibold text-xs">{product.badge}</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="text-gray-600 text-sm mb-2">{product.category}</div>
                  <h3 className="text-gray-900 font-bold mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{product.description}</p>

                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1 bg-green-500 px-2 py-1 rounded">
                      <span className="text-white font-bold text-sm">{product.rating}</span>
                      <Star className="w-3 h-3 fill-white text-white" />
                    </div>
                    <span className="text-gray-600 text-sm">({product.reviews.toLocaleString()})</span>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</div>
                    {product.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-orange-600 font-bold text-3xl mb-2">10M+</div>
            <div className="text-gray-600">Products</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-cyan-700 font-bold text-3xl mb-2">Free Delivery</div>
            <div className="text-gray-600">On orders above ₹499</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-pink-700 font-bold text-3xl mb-2">Easy Returns</div>
            <div className="text-gray-600">7 days return policy</div>
          </div>
        </div>
      </div>
    </div>
  );
}

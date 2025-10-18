import { Search, Heart, Star, TrendingUp, Zap } from "lucide-react";
import {
  FaLaptop,
  FaTshirt,
  FaHome,
  FaSpa,
  FaFutbol,
  FaBook,
  FaBlenderPhone,
  FaGamepad,
  FaBaby,
  FaDumbbell,
  FaBriefcaseMedical,
  FaShoppingBasket,
} from "react-icons/fa";
import { useApp } from "../../context/AppContext";
import ImageWithFallback from "../../components/ImageWithFallback";
import BookedRecentlyCard from "../../components/BookedRecentlyCard";
import OffersStrip from "../../components/OffersStrip";
import Carousel from "../../components/Carousel";
import Reveal from "../../components/Reveal";
import ShareReferralButton from "../../components/ShareReferralButton";
import CountUp from "../../components/CountUp";

const products = [
  {
    id: "1",
    name: "Apple iPhone 15 Pro",
    category: "Electronics",
    price: 129900,
    originalPrice: 139900,
    rating: 4.7,
    reviews: 2340,
    image:
      "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 7,
    badge: "Bestseller",
    description:
      "Titanium design, A17 Pro chip, 48MP camera, ProMotion display.",
  },
  {
    id: "2",
    name: "Sony WH-1000XM5 Headphones",
    category: "Audio",
    price: 29990,
    originalPrice: 34990,
    rating: 4.8,
    reviews: 1876,
    image:
      "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 14,
    badge: "Trending",
    description:
      "Industry-leading noise cancellation, 30-hr battery, multi-point Bluetooth.",
  },
  {
    id: "3",
    name: "Nike Air Max Sneakers",
    category: "Fashion",
    price: 8999,
    originalPrice: 12999,
    rating: 4.5,
    reviews: 987,
    image:
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 31,
    badge: "Hot Deal",
    description:
      "Lightweight comfort with responsive cushioning and breathable mesh.",
  },
  {
    id: "4",
    name: 'Samsung 55" 4K Smart TV',
    category: "Electronics",
    price: 54990,
    originalPrice: 74990,
    rating: 4.6,
    reviews: 1543,
    image:
      "https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 27,
    badge: "Great Savings",
    description: "Crystal UHD, HDR10+, built-in apps, voice assistant support.",
  },
  {
    id: "5",
    name: "Levi's Denim Jacket",
    category: "Fashion",
    price: 3499,
    originalPrice: 4999,
    rating: 4.4,
    reviews: 654,
    image:
      "https://images.pexels.com/photos/1058959/pexels-photo-1058959.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 30,
    badge: "Limited Stock",
    description: "Classic fit denim with durable stitching and everyday style.",
  },
  {
    id: "6",
    name: "Apple MacBook Air M2",
    category: "Computers",
    price: 119900,
    originalPrice: 124900,
    rating: 4.9,
    reviews: 3210,
    image:
      "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
    discount: 4,
    badge: "Bestseller",
    description:
      "M2 performance, all‑day battery, Retina display, silent fanless design.",
  },
  {
    id: "7",
    name: "Adidas Sports Backpack",
    category: "Accessories",
    price: 1999,
    originalPrice: 2999,
    rating: 4.3,
    reviews: 432,
    image:
      "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 33,
    badge: "Deal of the Day",
    description: "Water-resistant, padded straps, 25L capacity for daily use.",
  },
  {
    id: "8",
    name: "Canon EOS R6 Camera",
    category: "Cameras",
    price: 219900,
    originalPrice: 249900,
    rating: 4.8,
    reviews: 876,
    image:
      "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 12,
    badge: "Pro Choice",
    description:
      "Full-frame mirrorless, 20MP sensor, 4K video, Dual Pixel AF II.",
  },
  {
    id: "9",
    name: "Samsung Front Load Washer",
    category: "Appliances",
    price: 35990,
    originalPrice: 42990,
    rating: 4.4,
    reviews: 654,
    image:
      "https://images.pexels.com/photos/3952035/pexels-photo-3952035.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 16,
    badge: "Appliances",
    description: "Hygiene steam, inverter motor, 5-star energy rating.",
  },
  {
    id: "10",
    name: "PlayStation 5 Console",
    category: "Gaming",
    price: 49990,
    originalPrice: 54990,
    rating: 4.9,
    reviews: 12043,
    image:
      "https://images.pexels.com/photos/1337247/pexels-photo-1337247.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 9,
    badge: "Hot",
    description: "Ultra-fast SSD, 4K gaming, DualSense controller.",
  },
  {
    id: "11",
    name: "Huggies Dry Diapers - XL (64)",
    category: "Kids",
    price: 899,
    originalPrice: 1099,
    rating: 4.5,
    reviews: 4567,
    image:
      "https://images.pexels.com/photos/3933279/pexels-photo-3933279.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 18,
    badge: "Essentials",
    description: "12-hr absorption, cottony soft, wetness indicator.",
  },
  {
    id: "12",
    name: "Protein Whey – 2kg Jar",
    category: "Fitness",
    price: 2999,
    originalPrice: 3499,
    rating: 4.2,
    reviews: 874,
    image:
      "https://images.pexels.com/photos/4046692/pexels-photo-4046692.jpeg?auto=compress&cs=tinysrgb&w=600",
    discount: 14,
    badge: "Trending",
    description: "24g protein per scoop, BCAAs, fast absorption.",
  },
];

const categories = [
  { name: "Electronics", icon: <FaLaptop className="w-8 h-8" /> },
  { name: "Fashion", icon: <FaTshirt className="w-8 h-8" /> },
  { name: "Home", icon: <FaHome className="w-8 h-8" /> },
  { name: "Beauty", icon: <FaSpa className="w-8 h-8" /> },
  { name: "Sports", icon: <FaFutbol className="w-8 h-8" /> },
  { name: "Books", icon: <FaBook className="w-8 h-8" /> },
  { name: "Appliances", icon: <FaBlenderPhone className="w-8 h-8" /> },
  { name: "Gaming", icon: <FaGamepad className="w-8 h-8" /> },
  { name: "Kids", icon: <FaBaby className="w-8 h-8" /> },
  { name: "Fitness", icon: <FaDumbbell className="w-8 h-8" /> },
  { name: "Medical", icon: <FaBriefcaseMedical className="w-8 h-8" /> },
  { name: "Daily Needs", icon: <FaShoppingBasket className="w-8 h-8" /> },
] as const;

// Seeded top picks for new categories
const topAppliances = [
  {
    id: "ap1",
    name: "Dyson V12 Detect Slim",
    category: "Appliances",
    price: 55990,
    image:
      "https://images.pexels.com/photos/4107287/pexels-photo-4107287.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ap2",
    name: "LG 260L Smart Fridge",
    category: "Appliances",
    price: 25990,
    image:
      "https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ap3",
    name: "IFB 20L Microwave",
    category: "Appliances",
    price: 8490,
    image:
      "https://images.pexels.com/photos/813475/pexels-photo-813475.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ap4",
    name: "Philips Air Fryer XL",
    category: "Appliances",
    price: 9990,
    image:
      "https://images.pexels.com/photos/3807339/pexels-photo-3807339.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ap5",
    name: "Bosch Dishwasher 12P",
    category: "Appliances",
    price: 39990,
    image:
      "https://images.pexels.com/photos/3944342/pexels-photo-3944342.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];
const topGaming = [
  {
    id: "ga1",
    name: "Xbox Series X",
    category: "Gaming",
    price: 48990,
    image:
      "https://images.pexels.com/photos/4792731/pexels-photo-4792731.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ga2",
    name: "Nintendo Switch OLED",
    category: "Gaming",
    price: 32990,
    image:
      "https://images.pexels.com/photos/1337247/pexels-photo-1337247.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ga3",
    name: "Logitech G Pro Wireless",
    category: "Gaming",
    price: 9990,
    image:
      "https://images.pexels.com/photos/452645/pexels-photo-452645.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ga4",
    name: "Razer Huntsman Mini",
    category: "Gaming",
    price: 8999,
    image:
      "https://images.pexels.com/photos/5699345/pexels-photo-5699345.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ga5",
    name: "Sony Pulse 3D Headset",
    category: "Gaming",
    price: 8490,
    image:
      "https://images.pexels.com/photos/3945656/pexels-photo-3945656.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];
const topKids = [
  {
    id: "kd1",
    name: "LEGO City Builder Set",
    category: "Kids",
    price: 2990,
    image:
      "https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "kd2",
    name: "Crayola Colors 64",
    category: "Kids",
    price: 699,
    image:
      "https://images.pexels.com/photos/159823/color-pencil-drawing-coloring-colored-pencils-159823.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "kd3",
    name: "Remote RC Car",
    category: "Kids",
    price: 1999,
    image:
      "https://images.pexels.com/photos/207924/pexels-photo-207924.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "kd4",
    name: "Story Books Pack",
    category: "Kids",
    price: 899,
    image:
      "https://images.pexels.com/photos/256369/pexels-photo-256369.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "kd5",
    name: "Soft Plush Bear",
    category: "Kids",
    price: 799,
    image:
      "https://images.pexels.com/photos/461230/pexels-photo-461230.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];
const topFitness = [
  {
    id: "ft1",
    name: "Yoga Mat (6mm)",
    category: "Fitness",
    price: 999,
    image:
      "https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ft2",
    name: "Dumbbell Set 10kg",
    category: "Fitness",
    price: 2499,
    image:
      "https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ft3",
    name: "Resistance Bands",
    category: "Fitness",
    price: 699,
    image:
      "https://images.pexels.com/photos/3845988/pexels-photo-3845988.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ft4",
    name: "Skipping Rope Pro",
    category: "Fitness",
    price: 499,
    image:
      "https://images.pexels.com/photos/3993154/pexels-photo-3993154.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "ft5",
    name: "Sports Bottle Steel",
    category: "Fitness",
    price: 799,
    image:
      "https://images.pexels.com/photos/279316/pexels-photo-279316.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];
const topMedical = [
  {
    id: "md1",
    name: "Paracetamol 650mg (15 tabs)",
    category: "Medical • Medicines",
    price: 49,
    image:
      "https://images.pexels.com/photos/208512/pexels-photo-208512.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "md2",
    name: "Vitamin C 1000mg",
    category: "Medical • Supplements",
    price: 299,
    image:
      "https://images.pexels.com/photos/3683077/pexels-photo-3683077.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "md3",
    name: "Digital Thermometer",
    category: "Medical • Devices",
    price: 349,
    image:
      "https://images.pexels.com/photos/7659570/pexels-photo-7659570.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "md4",
    name: "Oximeter Fingertip",
    category: "Medical • Devices",
    price: 1299,
    image:
      "https://images.pexels.com/photos/4269250/pexels-photo-4269250.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "md5",
    name: "Ayurvedic Chyawanprash",
    category: "Medical • Health",
    price: 199,
    image:
      "https://images.pexels.com/photos/7615461/pexels-photo-7615461.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];
const topDaily = [
  {
    id: "dn1",
    name: "Toothpaste 150g",
    category: "Daily Needs",
    price: 79,
    image:
      "https://images.pexels.com/photos/2568639/pexels-photo-2568639.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "dn2",
    name: "Handwash 500ml",
    category: "Daily Needs",
    price: 129,
    image:
      "https://images.pexels.com/photos/3987143/pexels-photo-3987143.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "dn3",
    name: "Detergent 1kg",
    category: "Daily Needs",
    price: 199,
    image:
      "https://images.pexels.com/photos/7311023/pexels-photo-7311023.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "dn4",
    name: "Cooking Oil 1L",
    category: "Daily Needs",
    price: 149,
    image:
      "https://images.pexels.com/photos/235788/pexels-photo-235788.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "dn5",
    name: "Rice 5kg Premium",
    category: "Daily Needs",
    price: 449,
    image:
      "https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

export default function ShoppingHome() {
  const { setCurrentPage, setCurrentModule } = useApp();
  const [miniCart, setMiniCart] = useState<{
    items: { image: string }[];
    total: number;
  } | null>(null);
  const [showMiniCart, setShowMiniCart] = useState(false);

  type BasicProduct = {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    description?: string;
  };
  const handleProductClick = (product: BasicProduct) => {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    setCurrentPage("shopping-details");
  };

  const handleCategoryClick = (categoryName: string) => {
    // store category and navigate to category listing
    localStorage.setItem("selectedCategory", categoryName);
    setCurrentPage("shopping-category");
  };

  // Load mini cart for sticky bar
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("shoppingCart");
        if (!raw) {
          setMiniCart(null);
          setShowMiniCart(false);
          return;
        }
        const parsed = JSON.parse(raw) as {
          items?: { image?: string }[];
          total?: number;
        };
        const items = (parsed.items || [])
          .slice(0, 3)
          .map((p) => ({ image: typeof p.image === "string" ? p.image : "" }));
        const total = Number(parsed.total || 0);
        setMiniCart({ items, total });
        setShowMiniCart((parsed.items || []).length > 0);
      } catch {
        setMiniCart(null);
        setShowMiniCart(false);
      }
    };
    read();
    const h = () => read();
    window.addEventListener("cart-updated", h as EventListener);
    return () => window.removeEventListener("cart-updated", h as EventListener);
  }, []);

  const renderCarousel = (
    title: string,
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      image: string;
    }>
  ) => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <TrendingUp className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-bold text-gray-900">Top picks • {title}</h2>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 pr-2">
          {items.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProductClick(p)}
              className="group bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all hover:-translate-y-0.5 min-w-[260px] text-left"
            >
              <div className="w-[260px] h-[160px] overflow-hidden rounded-t-2xl">
                <ImageWithFallback
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{p.category}</div>
                <div className="font-semibold text-gray-900 line-clamp-1">
                  {p.name}
                </div>
                <div className="text-sm text-gray-700">
                  ₹{p.price.toLocaleString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F0FF] pb-20 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Hero carousel */}
        <Reveal animation="zoom-in">
          <div className="mb-6">
            <Carousel
              slides={[
                {
                  id: "s1",
                  image:
                    "https://images.pexels.com/photos/108061/pexels-photo-108061.jpeg?auto=compress&cs=tinysrgb&w=1600",
                  title: "Big Billion Days",
                  subtitle: "Unbelievable prices on top brands",
                  ctaText: "Shop Now",
                  onClick: () => setCurrentPage("shopping-category"),
                },
                {
                  id: "s2",
                  image:
                    "https://images.pexels.com/photos/298864/pexels-photo-298864.jpeg?auto=compress&cs=tinysrgb&w=1600",
                  title: "Festive Specials",
                  subtitle: "Decor, lighting and gifts up to 70% OFF",
                  ctaText: "Explore",
                  onClick: () => setCurrentPage("shopping-search"),
                },
                {
                  id: "s3",
                  image:
                    "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1600",
                  title: "Bank Days",
                  subtitle: "10% instant discount on select cards",
                  ctaText: "View Offers",
                  onClick: () => {
                    localStorage.setItem("offersViewed", "1");
                    window.dispatchEvent(new Event("offers-open"));
                  },
                },
              ]}
            />
          </div>
        </Reveal>
        <div className="mb-4">
          <BookedRecentlyCard module="shopping" />
        </div>
        <div className="mb-1 flex items-center justify-between">
          <div />
          <ShareReferralButton />
        </div>
        <OffersStrip
          offers={[
            { code: "GOZY50", label: "Flat ₹50 OFF" },
            { code: "HDFC10", label: "10% OFF with card" },
          ]}
        />
        <Reveal>
          <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-200 shadow">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Shop Everything Online
            </h1>
            <p className="text-gray-600 mb-3 text-sm">
              Discover amazing deals on millions of products
            </p>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 rounded-xl focus:border-gray-400 focus:outline-none text-lg"
              />
            </div>
          </div>
        </Reveal>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className="bg-white hover:bg-gray-50 rounded-2xl p-6 text-center transition-all border border-gray-200 shadow shine"
              >
                <div className="text-4xl mb-2 flex items-center justify-center text-gray-800">
                  {category.icon}
                </div>
                <div className="text-gray-800 font-semibold text-sm">
                  {category.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal carousel */}
        <Reveal>
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-bold text-gray-900">
                New & Recommended
              </h2>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-3 pr-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProductClick(p)}
                    className="group bg-white rounded-2xl border border-gray-200 shadow hover:shadow-lg transition-all hover:-translate-y-0.5 min-w-[260px] text-left shine"
                  >
                    <div className="w-[260px] h-[160px] overflow-hidden rounded-t-2xl">
                      <ImageWithFallback
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-gray-500 mb-1">
                        {p.category}
                      </div>
                      <div className="font-semibold text-gray-900 line-clamp-1">
                        {p.name}
                      </div>
                      <div className="text-sm text-gray-700">
                        ₹{p.price.toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Top picks carousels for new categories */}
        <div>
          {renderCarousel("Appliances", topAppliances)}
          {renderCarousel("Gaming", topGaming)}
          {renderCarousel("Kids", topKids)}
          {renderCarousel("Fitness", topFitness)}
          {renderCarousel("Medical & Medicines", topMedical)}
          {renderCarousel("Daily Needs", topDaily)}
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-6 h-6" />
                <h2 className="text-3xl font-bold">Flash Sale!</h2>
              </div>
              <p className="text-orange-100">
                Up to 70% OFF on selected items. Limited time only!
              </p>
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
            <h2 className="text-lg font-bold text-gray-900">
              Trending Products
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <Reveal key={product.id}>
                <button
                  onClick={() => handleProductClick(product)}
                  className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:scale-105 transform duration-300 text-left border border-gray-200 shadow shine"
                >
                  <div className="relative h-[160px] overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Heart className="w-5 h-5 text-red-500" />
                    </button>
                    {product.discount > 0 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 rounded-full">
                        <span className="text-white font-bold text-sm">
                          {product.discount}% OFF
                        </span>
                      </div>
                    )}
                    {product.badge && (
                      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-white font-semibold text-xs">
                          {product.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="text-gray-600 text-sm mb-2">
                      {product.category}
                    </div>
                    <h3 className="text-gray-900 font-bold mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1 bg-green-500 px-2 py-1 rounded">
                        <span className="text-white font-bold text-sm">
                          {product.rating}
                        </span>
                        <Star className="w-3 h-3 fill-white text-white" />
                      </div>
                      <span className="text-gray-600 text-sm">
                        ({product.reviews.toLocaleString()})
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-2">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </div>
                      {product.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-orange-600 font-bold text-3xl mb-2">
              <CountUp
                end={10000000}
                formatter={(n) => `${Math.round(n / 1000000)}M+`}
              />
            </div>
            <div className="text-gray-600">Products</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-cyan-700 font-bold text-3xl mb-2">
              Free Delivery
            </div>
            <div className="text-gray-600">On orders above ₹499</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <div className="text-pink-700 font-bold text-3xl mb-2">
              Easy Returns
            </div>
            <div className="text-gray-600">7 days return policy</div>
          </div>
        </div>
      </div>

      {/* Sticky mini-cart */}
      {showMiniCart && miniCart && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <div className="glass-surface rounded-2xl shadow-xl border border-white/40 backdrop-blur-md px-3 py-2 flex items-center gap-2 slide-up">
            <div className="flex -space-x-2">
              {miniCart.items.map((it, i) => (
                <img
                  key={i}
                  src={it.image}
                  alt=""
                  className="w-8 h-8 rounded-md object-cover border border-white/60"
                />
              ))}
            </div>
            <div className="text-sm font-semibold">
              Bag • ₹{miniCart.total.toLocaleString()}
            </div>
            <button
              onClick={() => {
                setCurrentModule("shopping");
                setCurrentPage("shopping-cart");
              }}
              className="ml-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm btn-sweep"
            >
              View bag
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

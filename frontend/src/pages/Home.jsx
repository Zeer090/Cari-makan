import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  MapPin, 
  Star, 
  Store, 
  Heart, 
  UtensilsCrossed,
  Filter 
} from 'lucide-react';

// --- IMPORT GAMBAR BANNER LOKAL ---
import bannerFood from '../assets/banner-home.jpg'; 

const CATEGORIES = ['Semua', 'Nasi', 'Mie', 'Minuman', 'Snack', 'Kopi', 'Seafood', 'Bakery', 'Fast Food', 'Halal'];
const TEAL = '#0F5C50';

/* ─── 1. Komponen Skeleton Loading ────────────────── */
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse h-[280px]">
    <div className="h-40 bg-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

/* ─── 2. Komponen Kartu Restoran ──────────────────── */
const RestaurantCard = ({ restaurant, isFavorited, onToggleFavorite }) => {
  const [faved, setFaved] = useState(isFavorited);
  const [favLoading, setFavLoading] = useState(false);

  const handleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (favLoading) return;
    setFavLoading(true);
    try {
      await onToggleFavorite(restaurant.id);
      setFaved(!faved);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <Link to={`/restaurant/${restaurant.id}`} className="group block">
      <article className="rounded-2xl overflow-hidden bg-white border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <div className="h-40 relative overflow-hidden">
          {restaurant.image_url ? (
            <img 
              src={`http://localhost:5000${restaurant.image_url}`} 
              alt={restaurant.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <Store size={40} className="text-gray-300" />
            </div>
          )}
          <button 
            onClick={handleFav} 
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:bg-white"
          >
            <Heart size={16} className={faved ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 truncate">{restaurant.name}</h3>
            <div className="flex items-center text-xs font-semibold bg-orange-50 text-orange-600 px-2 py-1 rounded-lg">
              <Star size={12} className="mr-1 fill-orange-400 text-orange-400" />
              {Number(restaurant.rating || 0).toFixed(1)}
            </div>
          </div>
          <p className="text-xs text-gray-500 flex items-center">
            <MapPin size={12} className="mr-1" /> {restaurant.address}
          </p>
        </div>
      </article>
    </Link>
  );
};

/* ─── 3. Komponen Utama Home ──────────────────────── */
const Home = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState(new Set());

  // Diperbaiki: Memastikan fetch selalu mengirimkan request yang valid ke backend
  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sortBy) params.set('sort', sortBy);
      if (activeCategory !== 'Semua') params.set('category', activeCategory);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      
      const response = await api.get(`/restaurants?${params.toString()}`);
      setRestaurants(response.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRestaurants([]); // Reset ke array kosong agar tidak crash
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchTerm, sortBy]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  // Load User Favorites
  useEffect(() => {
    if (user) {
      api.get('/user/favorites').then(res => {
        setFavorites(new Set(res.data.data.map(f => f.restaurant_id)));
      }).catch(() => {});
    }
  }, [user]);

  const handleToggleFavorite = async (restaurantId) => {
    if (!user) return;
    try {
      await api.post(`/restaurants/${restaurantId}/favorite`);
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(restaurantId)) next.delete(restaurantId);
        else next.add(restaurantId);
        return next;
      });
    } catch (err) {
      console.error("Gagal update favorit");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] pb-20">
      {/* Hero Banner dengan banner-home.jpg */}
      <section className="relative mx-4 mt-4 rounded-[2rem] h-[400px] flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bannerFood})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}>
        <div className="text-center text-white px-6 w-full max-w-2xl">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Jelajahi Citarasa Lokal</h1>
          <p className="mb-8 text-lg font-medium opacity-90">Temukan ribuan kelezatan tersembunyi di sekitar Anda.</p>
          
          <div className="relative group">
            <Search className="absolute left-5 top-5 text-gray-400" size={22} />
            <input 
              type="text" 
              className="w-full p-5 pl-14 rounded-full text-black placeholder-gray-600 font-medium bg-white/95 outline-none shadow-2xl transition-all focus:ring-4 focus:ring-[#0F5C50]/20" 
              placeholder="Cari sate, nasi goreng, atau lokasi..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </section>

      {/* Filter Kategori & Sort */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat ? 'bg-[#0F5C50] text-white shadow-lg' : 'bg-white hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200">
            <Filter size={16} className="text-gray-400" />
            <select className="bg-transparent text-sm font-semibold outline-none cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="rating">Rating Tertinggi</option>
              <option value="newest">Terbaru</option>
            </select>
          </div>
        </div>

        {/* Display Area */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {restaurants.map(res => (
              <RestaurantCard 
                key={res.id} 
                restaurant={res} 
                isFavorited={favorites.has(res.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl mx-auto max-w-lg border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-[#FDECE8]">
               <UtensilsCrossed size={40} className="text-[#C8553D]" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">Belum ada restoran nih</h3>
            <p className="text-gray-500 mb-8 text-center px-10 leading-relaxed">
              Sepertinya kategori yang kamu pilih sedang dalam pendaftaran. Coba cek kategori lain ya!
            </p>
            <button 
              onClick={() => setActiveCategory('Semua')} 
              className="px-10 py-3 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg" 
              style={{ backgroundColor: TEAL }}
            >
              Lihat semua restoran
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
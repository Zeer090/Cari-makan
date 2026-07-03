import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Heart, Store, Star, ArrowRight } from 'lucide-react';

// Konsistensi tema visual baru
const TEAL = '#0F5C50';

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/user/favorites')
      .then(res => setFavorites(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleRemove = async (restaurantId) => {
    await api.post(`/restaurants/${restaurantId}/favorite`);
    setFavorites(prev => prev.filter(f => f.restaurant_id !== restaurantId));
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="skeleton h-10 rounded-xl mb-8" style={{ width: '200px' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)' }}>
              <div className="skeleton h-44" style={{ borderRadius: 0 }} />
              <div className="p-4 space-y-2">
                <div className="skeleton h-5 rounded-lg" style={{ width: '70%' }} />
                <div className="skeleton h-4 rounded-lg" style={{ width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(15, 92, 80, 0.08)' }}>
          <Heart size={22} style={{ color: TEAL }} className="fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: '#1A202C' }}>Favorit Saya</h1>
          <p className="text-sm font-medium" style={{ color: 'rgba(43,33,24,0.55)' }}>
            {favorites.length} restoran tersimpan
          </p>
        </div>
      </div>

      {/* Empty State */}
      {favorites.length === 0 && (
        <div
          className="text-center py-24 rounded-3xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1.5px dashed rgba(43,33,24,0.1)' }}
        >
          <div className="mb-6" style={{ color: 'rgba(15, 92, 80, 0.2)' }}>
            <Heart size={64} strokeWidth={1.5} className="mx-auto" />
          </div>
          <h3 className="text-xl font-display font-bold mb-2" style={{ color: '#1A202C' }}>
            Belum ada yang tersimpan
          </h3>
          <p className="text-sm mb-8 font-medium max-w-sm mx-auto" style={{ color: 'rgba(43,33,24,0.5)' }}>
            Tekan ikon ♥ di restoran mana saja untuk menyimpannya di halaman ini.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white font-bold px-6 py-3.5 rounded-full transition-all shadow-sm active:scale-[0.98]"
            style={{ backgroundColor: TEAL }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0B4A40'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = TEAL}
          >
            Jelajahi Restoran
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Grid */}
      {favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(({ restaurant, restaurant_id }) => (
            <div key={restaurant_id} className="group relative">
              <Link to={`/restaurant/${restaurant_id}`}>
                <article
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{ backgroundColor: '#fff', boxShadow: '0 2px 24px rgba(43,33,24,0.02)', border: '1.5px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(15,92,80,0.06)'; e.currentTarget.style.borderColor = `${TEAL}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 24px rgba(43,33,24,0.02)'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <div className="h-44 relative overflow-hidden" style={{ backgroundColor: '#F7F5F0' }}>
                    {restaurant.image_url ? (
                      <img src={`http://localhost:5000${restaurant.image_url}`} alt={restaurant.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ color: 'rgba(43,33,24,0.15)' }}>
                        <Store size={40} strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 50%)' }} />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', color: '#1A202C' }}>
                      <Star size={11} className="fill-current text-yellow-500" />
                      <span>{restaurant.rating ? Number(restaurant.rating).toFixed(1) : 'Baru'}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-display font-bold mb-1 leading-tight line-clamp-1" style={{ color: '#1A202C' }}>{restaurant.name}</h3>
                    {restaurant.category && (
                      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1" style={{ backgroundColor: '#F7F5F0', color: 'rgba(43,33,24,0.6)' }}>
                        {restaurant.category}
                      </span>
                    )}
                  </div>
                </article>
              </Link>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(restaurant_id)}
                className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 bg-white/90 hover:bg-white text-red-500"
                style={{ backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                aria-label="Hapus dari favorit"
              >
                <Heart size={14} className="fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
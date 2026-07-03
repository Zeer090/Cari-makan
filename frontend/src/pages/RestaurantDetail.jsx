import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Plus, Minus, Store, Utensils, ArrowLeft, ShoppingCart, Heart, Send, MessageSquare } from 'lucide-react';

/* ─── Loading Skeleton ───────────────────────────────────── */
const DetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Hero skeleton */}
    <div className="skeleton rounded-3xl mb-10" style={{ height: '320px' }} />
    {/* Section title */}
    <div className="skeleton rounded-xl mb-8" style={{ height: '36px', width: '200px' }} />
    {/* Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)' }}>
          <div className="p-4 flex gap-4">
            <div className="skeleton rounded-xl flex-shrink-0" style={{ width: '96px', height: '96px' }} />
            <div className="flex-grow space-y-2.5 py-1">
              <div className="skeleton rounded-lg" style={{ height: '18px', width: '75%' }} />
              <div className="skeleton rounded-lg" style={{ height: '14px', width: '90%' }} />
              <div className="skeleton rounded-lg" style={{ height: '14px', width: '60%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Menu Item Card ─────────────────────────────────────── */
const MenuCard = ({ menu, quantity, onAdd, onUpdate }) => {
  return (
    <div
      className="rounded-2xl overflow-hidden flex gap-0 transition-all duration-200"
      style={{
        backgroundColor: '#fff',
        boxShadow: 'var(--shadow-soft)',
        border: '1.5px solid transparent',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        e.currentTarget.style.borderColor = 'rgba(232,163,61,0.2)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Food image */}
      <div
        className="w-28 h-28 flex-shrink-0 overflow-hidden relative m-4 rounded-xl"
        style={{ backgroundColor: 'var(--color-cream-dark)' }}
      >
        {menu.image_url ? (
          <img
            src={`http://localhost:5000${menu.image_url}`}
            alt={menu.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'rgba(43,33,24,0.18)' }}>
            <Utensils size={32} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-grow py-4 pr-4 flex flex-col justify-between min-w-0">
        <div>
          <h3
            className="text-base font-display font-bold leading-snug"
            style={{ color: 'var(--color-ink)' }}
          >
            {menu.name}
          </h3>
          {menu.description && (
            <p className="text-sm mt-1 line-clamp-2" style={{ color: 'rgba(43,33,24,0.55)' }}>
              {menu.description}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-3">
          {/* Price */}
          <span className="font-bold text-base" style={{ color: 'var(--color-terracotta)' }}>
            Rp {Number(menu.price).toLocaleString('id-ID')}
          </span>

          {/* Quantity controls */}
          {quantity > 0 ? (
            <div
              className="flex items-center gap-2 rounded-full px-1.5 py-1"
              style={{ backgroundColor: 'var(--color-cream)', boxShadow: 'inset 0 1px 4px rgba(43,33,24,0.08)' }}
            >
              <button
                onClick={() => onUpdate(menu.id, quantity - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150"
                style={{ backgroundColor: '#fff', color: 'var(--color-terracotta)', boxShadow: '0 1px 4px rgba(43,33,24,0.1)' }}
                aria-label={`Kurangi ${menu.name}`}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-terracotta)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = 'var(--color-terracotta)'; }}
              >
                <Minus size={13} strokeWidth={3} />
              </button>
              <span className="text-sm font-bold w-5 text-center" style={{ color: 'var(--color-ink)' }}>{quantity}</span>
              <button
                onClick={() => onUpdate(menu.id, quantity + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150"
                style={{ backgroundColor: 'var(--color-saffron)', color: 'var(--color-ink)', boxShadow: '0 1px 6px rgba(232,163,61,0.4)' }}
                aria-label={`Tambah ${menu.name}`}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Plus size={13} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(menu)}
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-all duration-150"
              style={{ backgroundColor: 'rgba(232,163,61,0.12)', color: 'var(--color-saffron)' }}
              aria-label={`Tambah ${menu.name} ke keranjang`}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-saffron)';
                e.currentTarget.style.color = 'var(--color-ink)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(232,163,61,0.4)';
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(232,163,61,0.12)';
                e.currentTarget.style.color = 'var(--color-saffron)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              Tambah
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Restaurant Detail Page ─────────────────────────────── */
const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviews, setReviews] = useState([]);
  const { cart, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, reviewsRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/restaurants/${id}/reviews`),
        ]);
        setRestaurant(restRes.data.data);
        setReviews(reviewsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch restaurant details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (user) {
      api.get('/user/favorites').then(res => {
        const ids = new Set(res.data.data.map(f => f.restaurant_id));
        setIsFavorited(ids.has(id));
      }).catch(() => {});
    }
  }, [user, id]);

  const handleToggleFavorite = async () => {
    if (!user) { navigate('/login'); return; }
    await api.post(`/restaurants/${id}/favorite`);
    setIsFavorited(prev => !prev);
  };

  const getCartQuantity = menuId => {
    const item = cart.items.find(i => i.menu_id === menuId);
    return item ? item.quantity : 0;
  };

  const totalItems    = cart.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice    = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const availableMenu = restaurant?.menus?.filter(m => m.is_available) ?? [];

  if (loading) return <DetailSkeleton />;

  /* ── Not found ── */
  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto mt-24 text-center p-12 rounded-3xl" style={{ backgroundColor: '#fff', boxShadow: 'var(--shadow-card)' }}>
        <Store size={64} className="mx-auto mb-6" style={{ color: 'rgba(43,33,24,0.15)', strokeWidth: 1 }} />
        <h2 className="text-3xl font-display font-bold mb-3" style={{ color: 'var(--color-ink)' }}>
          Restoran Tidak Ditemukan
        </h2>
        <p className="mb-8" style={{ color: 'rgba(43,33,24,0.55)' }}>
          Maaf, restoran yang kamu cari mungkin sudah pindah atau tutup.
        </p>
        <button
          onClick={() => navigate('/')}
          className="font-bold px-8 py-3 rounded-full transition-all duration-150 hover:scale-[1.03]"
          style={{ backgroundColor: 'var(--color-saffron)', color: 'var(--color-ink)', boxShadow: '0 4px 14px rgba(232,163,61,0.35)' }}
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: cart.items.length > 0 ? '120px' : '64px' }}>

      {/* ── Hero Image ──────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ height: 'clamp(240px, 40vw, 420px)', backgroundColor: 'var(--color-cream-dark)' }}
      >
        {restaurant.image_url ? (
          <img
            src={`http://localhost:5000${restaurant.image_url}`}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'rgba(43,33,24,0.12)' }}>
            <Store size={96} strokeWidth={0.8} />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(43,33,24,0.85) 0%, rgba(43,33,24,0.35) 45%, rgba(43,33,24,0.05) 100%)' }}
        />

        {/* Favorite button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-5 right-5 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200"
            style={{
              backgroundColor: isFavorited ? 'rgba(200,85,61,0.9)' : 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.25)',
              transform: isFavorited ? 'scale(1.1)' : 'scale(1)',
              boxShadow: isFavorited ? '0 4px 16px rgba(200,85,61,0.4)' : 'none',
            }}
            aria-label={isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          >
            <Heart size={18} className={isFavorited ? 'fill-current' : ''} style={{ color: '#fff' }} />
          </button>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
          aria-label="Kembali"
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>

        {/* Restaurant info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1
                className="font-display font-bold text-white mb-2"
                style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
              >
                {restaurant.name}
              </h1>
              <p className="flex items-center gap-1.5 font-medium" style={{ color: 'rgba(255,248,240,0.85)' }}>
                <MapPin size={15} />
                {restaurant.address}
              </p>
            </div>

            {/* Rating pill */}
            <div
              className="flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-2xl flex-shrink-0"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
              }}
            >
              <Star size={20} className="fill-current" style={{ color: 'var(--color-saffron)' }} />
              <span className="font-bold text-xl">{restaurant.rating ? Number(restaurant.rating).toFixed(1) : 'Baru'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Description ─────────────────────────────── */}
      {restaurant.description && (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(43,33,24,0.06)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <p className="text-sm sm:text-base leading-relaxed max-w-3xl" style={{ color: 'rgba(43,33,24,0.75)' }}>
              {restaurant.description}
            </p>
          </div>
        </div>
      )}

      {/* ── Menu Section ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section header */}
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-2xl sm:text-3xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
            Menu Spesial
          </h2>
          <span
            className="text-sm font-bold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(107,143,113,0.1)', color: 'var(--color-sage)' }}
          >
            {availableMenu.length} Hidangan
          </span>
        </div>

        {/* No menu state */}
        {availableMenu.length === 0 ? (
          <div
            className="text-center py-20 rounded-3xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1.5px dashed rgba(43,33,24,0.1)',
            }}
          >
            <Utensils size={52} className="mx-auto mb-4" style={{ color: 'rgba(43,33,24,0.15)', strokeWidth: 1.2 }} />
            <p className="font-medium text-lg" style={{ color: 'rgba(43,33,24,0.5)' }}>
              Koki sedang menyiapkan menu baru.
            </p>
            <p className="text-sm mt-1" style={{ color: 'rgba(43,33,24,0.35)' }}>
              Mampir lagi nanti ya!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableMenu.map(menu => (
              <MenuCard
                key={menu.id}
                menu={menu}
                quantity={getCartQuantity(menu.id)}
                onAdd={m => addToCart(m, restaurant.id)}
                onUpdate={updateQuantity}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Reviews Section ────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" style={{ borderTop: '1px solid rgba(43,33,24,0.06)' }}>
        <div className="flex items-center gap-3 mb-7">
          <MessageSquare size={22} style={{ color: 'var(--color-terracotta)' }} />
          <h2 className="text-2xl sm:text-3xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>Ulasan Pembeli</h2>
          <span className="text-sm font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(107,143,113,0.1)', color: 'var(--color-sage)' }}>
            {reviews.length} ulasan
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-14 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '1.5px dashed rgba(43,33,24,0.08)' }}>
            <MessageSquare size={44} className="mx-auto mb-3" style={{ color: 'rgba(43,33,24,0.15)', strokeWidth: 1.2 }} />
            <p className="font-medium" style={{ color: 'rgba(43,33,24,0.45)' }}>Belum ada ulasan. Jadilah yang pertama!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="p-5 rounded-2xl" style={{ backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)' }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: 'rgba(232,163,61,0.15)', color: 'var(--color-saffron)' }}>
                      {review.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>{review.user?.name || 'Pengguna'}</p>
                      <p className="text-xs" style={{ color: 'rgba(43,33,24,0.45)' }}>
                        {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? 'fill-current' : ''} style={{ color: i < review.rating ? 'var(--color-saffron)' : 'rgba(43,33,24,0.15)' }} />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-sm leading-relaxed" style={{ color: 'rgba(43,33,24,0.7)' }}>{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating Cart Bar ────────────────────────── */}
      {cart.items.length > 0 && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-4 px-5 py-3 rounded-full"
          style={{
            width: 'calc(100% - 2rem)',
            maxWidth: '680px',
            backgroundColor: 'var(--color-ink)',
            boxShadow: 'var(--shadow-float)',
          }}
        >
          {/* Left: item count + total */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
            >
              {totalItems}
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,248,240,0.5)' }}>Total Pesanan</p>
              <p className="font-bold text-base text-white">
                Rp {totalPrice.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 font-bold text-sm px-6 py-2.5 rounded-full transition-all duration-150 hover:scale-[1.03] flex-shrink-0"
            style={{
              backgroundColor: 'var(--color-saffron)',
              color: 'var(--color-ink)',
              boxShadow: '0 4px 16px rgba(232,163,61,0.45)',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(232,163,61,0.6)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,163,61,0.45)'}
          >
            <ShoppingCart size={16} strokeWidth={2.5} />
            Lanjut Bayar
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;

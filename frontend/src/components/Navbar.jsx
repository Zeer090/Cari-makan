import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Store, ChevronDown, Heart, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Warna aksen Teal disesuaikan dengan tema visual baru
const TEAL = '#0F5C50';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 print:hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(43,33,24,0.06)', boxShadow: '0 2px 16px rgba(43,33,24,0.05)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18" style={{ height: '72px' }}>

          {/* Logo sesuai referensi gambar Screenshot 2026-07-02 213425.jpg */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group" aria-label="CariMakan Home">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: TEAL }}>
              <Store size={16} strokeWidth={2.2} />
            </div>
            <span className="text-xl font-display font-bold" style={{ color: TEAL, letterSpacing: '-0.02em' }}>
              Cari Makan
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-5">
            {user ? (
              <>
                {/* Restaurant owner link */}
                {user.role === 'restaurant_owner' && (
                  <Link
                    to="/owner"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
                    style={{ color: 'rgba(43,33,24,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.color = TEAL}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(43,33,24,0.7)'}
                  >
                    <Store size={18} />
                    <span>Dasbor Restoran</span>
                  </Link>
                )}

                {/* Admin link */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
                    style={{ color: 'rgba(43,33,24,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.color = TEAL}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(43,33,24,0.7)'}
                  >
                    <User size={18} />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Customer quick links */}
                <div className="hidden md:flex items-center gap-4 mr-2">
                  <Link
                    to="/"
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
                    style={{ color: 'rgba(43,33,24,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.color = TEAL}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(43,33,24,0.7)'}
                  >
                    <Home size={16} />
                    <span>Beranda</span>
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
                    style={{ color: 'rgba(43,33,24,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.color = TEAL}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(43,33,24,0.7)'}
                  >
                    <Heart size={16} />
                    <span>Favorit</span>
                  </Link>
                  <Link
                    to="/history"
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
                    style={{ color: 'rgba(43,33,24,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.color = TEAL}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(43,33,24,0.7)'}
                  >
                    <span>Riwayat Pesanan</span>
                  </Link>
                </div>

                {/* Cart icon */}
                <Link
                  to="/cart"
                  className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
                  style={{ color: 'rgba(43,33,24,0.75)' }}
                  aria-label={`Keranjang, ${cartItemCount} item`}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = TEAL;
                    e.currentTarget.style.backgroundColor = `${TEAL}14`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(43,33,24,0.75)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ShoppingCart size={22} strokeWidth={2} />
                  {cartItemCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 flex items-center justify-center text-xs font-bold rounded-full"
                      style={{
                        backgroundColor: TEAL,
                        color: '#fff',
                        boxShadow: `0 2px 6px ${TEAL}80`,
                        lineHeight: 1,
                      }}
                    >
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </Link>

                {/* User menu dropdown */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200"
                    style={{ color: '#1A202C' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(43,33,24,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                      style={{ backgroundColor: TEAL }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown size={14} className="hidden sm:block opacity-50 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* Dropdown content */}
                  <div className="absolute right-0 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div
                      className="w-52 rounded-2xl overflow-hidden translate-y-1 group-hover:translate-y-0 transition-transform duration-200"
                      style={{ backgroundColor: '#fff', boxShadow: '0 12px 40px rgba(43,33,24,0.15)', border: '1px solid rgba(43,33,24,0.07)' }}
                    >
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(43,33,24,0.06)', backgroundColor: '#F7F5F0' }}>
                        <p className="text-xs font-semibold" style={{ color: 'rgba(43,33,24,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Masuk sebagai</p>
                        <p className="text-sm font-bold truncate mt-0.5" style={{ color: '#1A202C' }}>{user.name}</p>
                      </div>

                      <div className="py-1.5">
                        <Link
                          to="/history"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors duration-150 md:hidden"
                          style={{ color: '#4A5568' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F5F0'; e.currentTarget.style.color = TEAL; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4A5568'; }}
                        >
                          Riwayat Pesanan
                        </Link>
                        <Link
                          to="/favorites"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors duration-150 md:hidden"
                          style={{ color: '#4A5568' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F5F0'; e.currentTarget.style.color = TEAL; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4A5568'; }}
                        >
                          <Heart size={14} /> Favorit Saya
                        </Link>
                        {user.role === 'customer' && (
                          <Link
                            to="/buka-toko"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors duration-150"
                            style={{ color: '#4A5568' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F7F5F0'; e.currentTarget.style.color = TEAL; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4A5568'; }}
                          >
                            Buka Toko
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors duration-150"
                          style={{ color: '#E53E3E' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(229,62,62,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <LogOut size={15} />
                          Keluar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Tampilan Tombol Masuk / Daftar Gratis Bulat Sempurna sesuai Screenshot 2026-07-02 213425.jpg */
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 border"
                  style={{ borderColor: TEAL, color: TEAL }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${TEAL}0D`; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-150"
                  style={{ backgroundColor: TEAL }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0B4A40'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = TEAL; }}
                >
                  Daftar Gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
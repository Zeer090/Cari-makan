import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LogOut, LayoutDashboard, Shield, Store, ChevronRight } from 'lucide-react';

// Warna aksen Teal — sama persis dengan Navbar utama agar identitas brand konsisten
const TEAL = '#0F5C50';

/**
 * DashboardNavbar — top bar shown on all dashboard pages.
 * Props:
 *   title   : string   — dashboard title shown in the center/left
 *   icon    : LucideIcon — icon shown next to title
 *   color   : string   — accent color (CSS var or hex)
 *   bgColor : string   — icon background color
 */
const DashboardNavbar = ({ title, icon: Icon, color, bgColor }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: 'rgba(255,248,240,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(43,33,24,0.07)',
        boxShadow: '0 2px 20px rgba(43,33,24,0.06)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Left — Logo + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-2 group"
            aria-label="CariMakan Home"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: TEAL }}
            >
              <Store size={16} strokeWidth={2.2} />
            </div>
            <span className="text-lg font-display font-bold hidden sm:block" style={{ color: TEAL, letterSpacing: '-0.02em' }}>
              Cari Makan
            </span>
          </Link>

          {/* Breadcrumb separator */}
          <ChevronRight size={14} className="text-ink/30 flex-shrink-0 hidden sm:block" />

          {/* Dashboard title */}
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: bgColor || 'rgba(200,85,61,0.1)' }}
              >
                <Icon size={15} style={{ color: color || 'var(--color-terracotta)' }} />
              </div>
            )}
            <span
              className="text-sm font-bold truncate"
              style={{ color: 'var(--color-ink)' }}
            >
              {title || 'Dashboard'}
            </span>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Greeting */}
          {user && (
            <span className="hidden md:block text-xs font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(43,33,24,0.06)', color: 'rgba(43,33,24,0.6)' }}>
              Hai, {user.name?.split(' ')[0]}
            </span>
          )}

          {/* Back to main site */}
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'rgba(232,163,61,0.12)', color: 'var(--color-ink)' }}
            title="Kembali ke Beranda"
          >
            <Home size={15} />
            <span className="hidden sm:block">Beranda</span>
          </Link>

          {/* Switch dashboard (admin can go to both) */}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'rgba(200,85,61,0.1)', color: 'var(--color-terracotta)' }}
              title="Admin Dashboard"
            >
              <Shield size={15} />
              <span className="hidden sm:block">Admin</span>
            </Link>
          )}
          {(user?.role === 'admin' || user?.role === 'restaurant_owner') && (
            <Link
              to="/owner"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'rgba(107,143,113,0.1)', color: 'var(--color-sage)' }}
              title="Dasbor Restoran"
            >
              <Store size={15} />
              <span className="hidden sm:block">Restoran</span>
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'rgba(200,85,61,0.1)', color: 'var(--color-terracotta)' }}
            title="Keluar"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;

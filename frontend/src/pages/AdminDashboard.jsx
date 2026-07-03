import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, Store, ShoppingBag, TrendingUp, CheckCircle,
  XCircle, Clock, AlertCircle, LayoutDashboard, Search, Shield
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="rounded-2xl p-6 flex items-center gap-5 transition-all duration-200 hover:-translate-y-1"
    style={{ backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)' }}>
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bgColor }}>
      <Icon size={26} style={{ color }} />
    </div>
    <div>
      <p className="text-sm font-semibold" style={{ color: 'rgba(43,33,24,0.55)' }}>{label}</p>
      <p className="text-3xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [searchUsers, setSearchUsers] = useState('');
  const [searchRestaurants, setSearchRestaurants] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, [user, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, restsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/restaurants'),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setRestaurants(restsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, isVerified) => {
    await api.patch(`/admin/restaurants/${id}/verify`, { is_verified: isVerified });
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_verified: isVerified } : r));
  };

  const TABS = [
    { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'users', label: 'Pengguna', icon: Users },
    { id: 'restaurants', label: 'Restoran', icon: Store },
  ];

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUsers.toLowerCase())
  );
  const filteredRestaurants = restaurants.filter(r =>
    r.name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  const roleBadge = (role) => {
    const map = {
      admin: { bg: 'rgba(200,85,61,0.1)', color: 'var(--color-terracotta)', label: 'Admin' },
      restaurant_owner: { bg: 'rgba(232,163,61,0.12)', color: '#b07c0a', label: 'Pemilik' },
      customer: { bg: 'rgba(107,143,113,0.1)', color: 'var(--color-sage)', label: 'Pelanggan' },
    };
    const s = map[role] || map.customer;
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="skeleton h-10 rounded-xl mb-6" style={{ width: '220px' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton rounded-2xl h-28" />)}
        </div>
        <div className="skeleton rounded-2xl h-64" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-cream)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(200,85,61,0.1)' }}>
          <LayoutDashboard size={24} style={{ color: 'var(--color-terracotta)' }} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>Admin Dashboard</h1>
          <p className="text-sm font-medium" style={{ color: 'rgba(43,33,24,0.55)' }}>Panel kontrol platform CariMakan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1.5 rounded-2xl" style={{ backgroundColor: 'rgba(43,33,24,0.06)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style={activeTab === id ? {
              backgroundColor: '#fff',
              color: 'var(--color-ink)',
              boxShadow: 'var(--shadow-soft)',
            } : {
              color: 'rgba(43,33,24,0.5)',
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <StatCard icon={Users} label="Total Pengguna" value={stats.totalUsers} color="var(--color-sage)" bgColor="rgba(107,143,113,0.1)" />
            <StatCard icon={Store} label="Total Restoran" value={stats.totalRestaurants} color="#b07c0a" bgColor="rgba(232,163,61,0.12)" />
            <StatCard icon={ShoppingBag} label="Total Pesanan" value={stats.totalOrders} color="var(--color-terracotta)" bgColor="rgba(200,85,61,0.1)" />
            <StatCard icon={TrendingUp} label="Total Pendapatan" value={formatPrice(stats.totalRevenue)} color="#6366f1" bgColor="rgba(99,102,241,0.1)" />
          </div>

          {/* Recent restaurants needing verification */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)' }}>
            <h2 className="text-xl font-display font-bold mb-5" style={{ color: 'var(--color-ink)' }}>
              Restoran Menunggu Verifikasi
            </h2>
            {restaurants.filter(r => !r.is_verified).length === 0 ? (
              <div className="text-center py-12" style={{ color: 'rgba(43,33,24,0.4)' }}>
                <CheckCircle size={48} className="mx-auto mb-3" strokeWidth={1.2} />
                <p className="font-medium">Semua restoran sudah terverifikasi!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {restaurants.filter(r => !r.is_verified).slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center justify-between gap-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(43,33,24,0.03)' }}>
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--color-ink)' }}>{r.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(43,33,24,0.5)' }}>{r.owner?.name} · {r.owner?.email}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleVerify(r.id, true)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.03]"
                        style={{ backgroundColor: 'rgba(107,143,113,0.15)', color: 'var(--color-sage)' }}
                      >
                        <CheckCircle size={13} /> Verifikasi
                      </button>
                      <button
                        onClick={() => handleVerify(r.id, false)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: 'rgba(200,85,61,0.1)', color: 'var(--color-terracotta)' }}
                      >
                        <XCircle size={13} /> Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)' }}>
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <h2 className="text-xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
              Semua Pengguna <span className="text-base font-normal" style={{ color: 'rgba(43,33,24,0.4)' }}>({filteredUsers.length})</span>
            </h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(43,33,24,0.4)' }} />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchUsers}
                onChange={e => setSearchUsers(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium border-none outline-none"
                style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-ink)', width: '240px' }}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(43,33,24,0.06)' }}>
                  {['Nama', 'Email', 'Role', 'Bergabung'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(43,33,24,0.45)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(43,33,24,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(43,33,24,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="py-3.5 px-3 font-semibold text-sm" style={{ color: 'var(--color-ink)' }}>{u.name || '—'}</td>
                    <td className="py-3.5 px-3 text-sm" style={{ color: 'rgba(43,33,24,0.65)' }}>{u.email}</td>
                    <td className="py-3.5 px-3">{roleBadge(u.role)}</td>
                    <td className="py-3.5 px-3 text-sm" style={{ color: 'rgba(43,33,24,0.45)' }}>
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restaurants Tab */}
      {activeTab === 'restaurants' && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff', boxShadow: 'var(--shadow-soft)' }}>
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <h2 className="text-xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
              Semua Restoran <span className="text-base font-normal" style={{ color: 'rgba(43,33,24,0.4)' }}>({filteredRestaurants.length})</span>
            </h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(43,33,24,0.4)' }} />
              <input
                type="text"
                placeholder="Cari restoran..."
                value={searchRestaurants}
                onChange={e => setSearchRestaurants(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium border-none outline-none"
                style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-ink)', width: '240px' }}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(43,33,24,0.06)' }}>
                  {['Restoran', 'Pemilik', 'Kategori', 'Rating', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(43,33,24,0.45)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.map(r => (
                  <tr key={r.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(43,33,24,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(43,33,24,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="py-3.5 px-3 font-bold text-sm" style={{ color: 'var(--color-ink)' }}>{r.name}</td>
                    <td className="py-3.5 px-3 text-sm" style={{ color: 'rgba(43,33,24,0.65)' }}>{r.owner?.name || '—'}</td>
                    <td className="py-3.5 px-3">
                      {r.category ? <span className="badge-category">{r.category}</span> : <span style={{ color: 'rgba(43,33,24,0.3)' }}>—</span>}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--color-ink)' }}>
                        ⭐ {r.rating ? Number(r.rating).toFixed(1) : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {r.is_verified ? (
                        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(107,143,113,0.12)', color: 'var(--color-sage)' }}>
                          <CheckCircle size={11} /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(232,163,61,0.12)', color: '#b07c0a' }}>
                          <Clock size={11} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex gap-2">
                        {!r.is_verified ? (
                          <button onClick={() => handleVerify(r.id, true)} className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.03]" style={{ backgroundColor: 'rgba(107,143,113,0.12)', color: 'var(--color-sage)' }}>
                            Verifikasi
                          </button>
                        ) : (
                          <button onClick={() => handleVerify(r.id, false)} className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(200,85,61,0.1)', color: 'var(--color-terracotta)' }}>
                            Cabut
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;

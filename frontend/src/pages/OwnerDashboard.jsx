import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Store, LayoutDashboard, ShoppingBag, UtensilsCrossed, 
  Settings, TrendingUp, CheckCircle, Clock, Plus, 
  Pencil, Trash2, X, Upload, Bell
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menus, setMenus] = useState([]);
  
  // Modal states
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  
  const socket = useSocket();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('newOrder', (data) => {
      console.log('New order received:', data);
      setNotification(data.message);
      setTimeout(() => setNotification(null), 5000);
      
      // Refresh data to show new order and update stats
      fetchData();
    });

    return () => {
      socket.off('newOrder');
    };
  }, [socket]);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }
    if (user.role !== 'restaurant_owner') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const [hasNoRestaurant, setHasNoRestaurant] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [restRes, statsRes, ordersRes] = await Promise.all([
        api.get('/owner/restaurant'),
        api.get('/owner/stats'),
        api.get('/owner/orders')
      ]);
      
      setRestaurant(restRes.data.data);
      setMenus(restRes.data.data.menus || []);
      setStats(statsRes.data.data);
      setOrders(ordersRes.data.data);
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        // User doesn't have a restaurant yet
        setHasNoRestaurant(true);
      } else {
        console.error('Failed to fetch dashboard data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/owner/orders/${orderId}/status`, { status: newStatus });
      fetchData(); // refresh data
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Gagal mengupdate status pesanan.');
    }
  };

  // --- Modal Menu Logic ---
  const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '', is_available: true });
  const [menuImage, setMenuImage] = useState(null);

  const openMenuModal = (menu = null) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({
        name: menu.name,
        description: menu.description || '',
        price: menu.price,
        is_available: menu.is_available
      });
    } else {
      setEditingMenu(null);
      setMenuForm({ name: '', description: '', price: '', is_available: true });
    }
    setMenuImage(null);
    setShowMenuModal(true);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('restaurant_id', restaurant.id);
    formData.append('name', menuForm.name);
    formData.append('description', menuForm.description);
    formData.append('price', menuForm.price);
    formData.append('is_available', menuForm.is_available);
    if (menuImage) formData.append('image', menuImage);

    try {
      if (editingMenu) {
        await api.put(`/restaurants/menus/${editingMenu.id}`, formData);
      } else {
        await api.post('/restaurants/menus/add', formData);
      }
      setShowMenuModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan menu');
    }
  };

  const handleDeleteMenu = async (id) => {
    if (window.confirm('Yakin ingin menghapus menu ini?')) {
      try {
        await api.delete(`/restaurants/menus/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus menu');
      }
    }
  };

  // --- Settings Logic ---
  const [settingsForm, setSettingsForm] = useState({});
  const [settingsImage, setSettingsImage] = useState(null);
  
  useEffect(() => {
    if (restaurant) {
      setSettingsForm({
        name: restaurant.name,
        category: restaurant.category || '',
        address: restaurant.address,
        description: restaurant.description || ''
      });
    }
  }, [restaurant]);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', settingsForm.name);
    formData.append('category', settingsForm.category);
    formData.append('address', settingsForm.address);
    formData.append('description', settingsForm.description);
    if (settingsImage) formData.append('image', settingsImage);

    try {
      await api.put('/owner/restaurant', formData);
      alert('Pengaturan restoran berhasil disimpan!');
      fetchData();
    } catch (error) {
      alert('Gagal menyimpan pengaturan');
    }
  };

  if (loading || (!restaurant && !hasNoRestaurant)) {
    return <div className="min-h-screen flex items-center justify-center text-ink-soft">Loading dashboard...</div>;
  }

  if (hasNoRestaurant) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-terracotta/10 rounded-full flex items-center justify-center mb-6">
          <Store size={32} className="text-terracotta" />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-3 font-display">Anda Belum Memiliki Restoran</h2>
        <p className="text-ink-soft mb-8 max-w-md">
          Untuk mengakses dasbor restoran, Anda perlu mendaftarkan restoran Anda terlebih dahulu. Mulai kelola pesanan dan menu Anda hari ini!
        </p>
        <button
          onClick={() => navigate('/buka-toko')}
          className="px-8 py-3.5 bg-[#0F5C50] text-white font-bold rounded-full transition-all duration-200 hover:scale-105 shadow-[0_4px_14px_rgba(15,92,80,0.35)] hover:bg-[#0B4A40]"
        >
          Buka Toko Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-ink/12 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#0F5C50] text-white flex items-center justify-center">
              <Store size={20} />
            </div>
            <div>
              <h2 className="font-bold text-ink truncate w-40">{restaurant.name}</h2>
              <p className="text-xs text-ink-soft">Owner Dashboard</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Dasbor' },
              { id: 'orders', icon: ShoppingBag, label: 'Pesanan Masuk' },
              { id: 'menus', icon: UtensilsCrossed, label: 'Kelola Menu' },
              { id: 'settings', icon: Settings, label: 'Pengaturan' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-[#0F5C50]/10 text-[#0F5C50]' 
                    : 'text-ink-soft hover:bg-cream hover:text-ink'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-ink">Ringkasan Dasbor</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-ink/8 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><TrendingUp size={24}/></div>
                  <div>
                    <p className="text-sm font-medium text-ink-soft">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-ink">{formatPrice(stats?.totalRevenue || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-ink/8 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><CheckCircle size={24}/></div>
                  <div>
                    <p className="text-sm font-medium text-ink-soft">Pesanan Selesai</p>
                    <p className="text-2xl font-bold text-ink">{stats?.completedOrders || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-ink/8 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Clock size={24}/></div>
                  <div>
                    <p className="text-sm font-medium text-ink-soft">Menunggu Diproses</p>
                    <p className="text-2xl font-bold text-ink">{stats?.pendingOrders || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-ink">Daftar Pesanan</h1>
            <div className="bg-white rounded-3xl shadow-sm border border-ink/8 overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-10 text-center text-ink-soft">Belum ada pesanan masuk.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-cream text-ink-soft">
                      <tr>
                        <th className="px-6 py-4 font-medium">Pelanggan</th>
                        <th className="px-6 py-4 font-medium">Item</th>
                        <th className="px-6 py-4 font-medium">Total</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/8">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-cream-dark/50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-ink">{order.user.name}</div>
                            <div className="text-xs text-ink-soft">{new Date(order.created_at).toLocaleString('id-ID')}</div>
                          </td>
                          <td className="px-6 py-4 text-ink-soft">
                            {order.items.map(i => `${i.quantity}x ${i.menu.name}`).join(', ')}
                          </td>
                          <td className="px-6 py-4 font-medium text-ink">{formatPrice(order.total_price)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                              order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {order.status === 'shipped' ? 'DIKIRIM' : order.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {order.status === 'pending' && (
                              <button onClick={() => handleUpdateOrderStatus(order.id, 'processing')} className="px-4 py-2 bg-saffron text-ink font-bold rounded-xl text-xs hover:bg-[#d69635]">
                                Terima
                              </button>
                            )}
                            {order.status === 'processing' && (
                              <button onClick={() => handleUpdateOrderStatus(order.id, 'shipped')} className="px-4 py-2 bg-purple-500 text-white font-bold rounded-xl text-xs hover:bg-purple-600">
                                Kirim
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MENUS TAB */}
        {activeTab === 'menus' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-ink">Kelola Menu</h1>
              <button onClick={() => openMenuModal()} className="flex items-center gap-2 px-5 py-2.5 bg-[#0F5C50] text-white font-bold rounded-2xl shadow-md shadow-[#0F5C50]/20 hover:-translate-y-0.5 transition-all hover:bg-[#0B4A40]">
                <Plus size={18} /> Tambah Menu
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus.map(menu => (
                <div key={menu.id} className="bg-white rounded-3xl overflow-hidden border border-ink/8 shadow-sm flex flex-col">
                  <img src={menu.image_url ? `http://localhost:5000${menu.image_url}` : 'https://via.placeholder.com/400x250?text=Menu'} alt={menu.name} className="w-full h-40 object-cover" />
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-ink">{menu.name}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${menu.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {menu.is_available ? 'Tersedia' : 'Habis'}
                      </span>
                    </div>
                    <p className="text-terracotta font-bold mb-4">{formatPrice(menu.price)}</p>
                    <div className="mt-auto flex gap-2">
                      <button onClick={() => openMenuModal(menu)} className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-cream-dark text-ink-soft rounded-xl text-sm font-medium hover:bg-cream-dark transition-colors"><Pencil size={14}/> Edit</button>
                      <button onClick={() => handleDeleteMenu(menu.id)} className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"><Trash2 size={14}/> Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-ink">Pengaturan Restoran</h1>
            <form onSubmit={handleSettingsSubmit} className="bg-white p-8 rounded-3xl border border-ink/8 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Nama Restoran</label>
                <input type="text" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} className="w-full px-4 py-3 bg-cream rounded-xl border border-ink/12" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Kategori</label>
                <input type="text" value={settingsForm.category} onChange={e => setSettingsForm({...settingsForm, category: e.target.value})} className="w-full px-4 py-3 bg-cream rounded-xl border border-ink/12" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Alamat Lengkap</label>
                <textarea value={settingsForm.address} onChange={e => setSettingsForm({...settingsForm, address: e.target.value})} rows="3" className="w-full px-4 py-3 bg-cream rounded-xl border border-ink/12" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Deskripsi Toko</label>
                <textarea value={settingsForm.description} onChange={e => setSettingsForm({...settingsForm, description: e.target.value})} rows="3" className="w-full px-4 py-3 bg-cream rounded-xl border border-ink/12" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Foto Restoran</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-ink/12 border-dashed rounded-xl relative hover:border-[#0F5C50] transition-colors">
                  <div className="space-y-2 text-center">
                    {settingsImage ? (
                      <div className="relative inline-block">
                        <img src={URL.createObjectURL(settingsImage)} alt="Preview" className="mx-auto h-32 w-auto rounded-lg object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setSettingsImage(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14}/>
                        </button>
                      </div>
                    ) : restaurant?.image_url ? (
                      <div className="relative inline-block">
                        <img src={`http://localhost:5000${restaurant.image_url}`} alt="Current" className="mx-auto h-32 w-auto rounded-lg object-cover opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <label className="cursor-pointer bg-white/90 px-3 py-1.5 rounded-lg font-medium text-[#0F5C50] text-sm hover:text-[#0B4A40] shadow-sm">
                            <span>Ganti Foto</span>
                            <input type="file" onChange={e => setSettingsImage(e.target.files[0])} className="sr-only" accept="image/*" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-ink/35" />
                        <div className="flex text-sm text-ink-soft justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F5C50] hover:text-[#0B4A40] focus-within:outline-none">
                            <span>Upload foto</span>
                            <input type="file" onChange={e => setSettingsImage(e.target.files[0])} className="sr-only" accept="image/*" />
                          </label>
                          <p className="pl-1">atau drag & drop</p>
                        </div>
                        <p className="text-xs text-ink/45">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button type="submit" className="px-6 py-3 bg-[#0F5C50] text-white font-bold rounded-xl shadow-md shadow-[#0F5C50]/20 hover:bg-[#0B4A40]">Simpan Perubahan</button>
            </form>
          </div>
        )}
      </div>

      {/* MENU MODAL (POPUP) */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-ink/8 flex justify-between items-center bg-cream">
              <h3 className="font-bold text-lg text-ink">{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
              <button onClick={() => setShowMenuModal(false)} className="p-2 text-ink-soft hover:bg-cream-dark rounded-full"><X size={18}/></button>
            </div>
            <form onSubmit={handleMenuSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Nama Menu</label>
                <input type="text" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className="w-full px-4 py-2.5 bg-cream rounded-xl border border-ink/12" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Harga (Rp)</label>
                <input type="number" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} className="w-full px-4 py-2.5 bg-cream rounded-xl border border-ink/12" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Deskripsi</label>
                <textarea value={menuForm.description} onChange={e => setMenuForm({...menuForm, description: e.target.value})} rows="2" className="w-full px-4 py-2.5 bg-cream rounded-xl border border-ink/12" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_available" checked={menuForm.is_available} onChange={e => setMenuForm({...menuForm, is_available: e.target.checked})} className="w-5 h-5 accent-[#0F5C50]" />
                <label htmlFor="is_available" className="text-sm font-medium text-ink">Menu tersedia (Bisa dipesan)</label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-soft mb-2">Foto Menu (Opsional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-ink/12 border-dashed rounded-xl relative hover:border-[#0F5C50] transition-colors bg-white">
                  <div className="space-y-2 text-center w-full">
                    {menuImage ? (
                      <div className="relative inline-block w-full">
                        <img src={URL.createObjectURL(menuImage)} alt="Preview" className="mx-auto h-32 w-auto rounded-lg object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setMenuImage(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14}/>
                        </button>
                      </div>
                    ) : editingMenu?.image_url ? (
                       <div className="relative inline-block w-full">
                        <img src={`http://localhost:5000${editingMenu.image_url}`} alt="Current" className="mx-auto h-32 w-auto rounded-lg object-cover opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <label className="cursor-pointer bg-white/90 px-3 py-1.5 rounded-lg font-medium text-[#0F5C50] text-sm hover:text-[#0B4A40] shadow-sm">
                            <span>Ganti Foto</span>
                            <input type="file" onChange={e => setMenuImage(e.target.files[0])} className="sr-only" accept="image/*" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-ink/35" />
                        <div className="flex text-sm text-ink-soft justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#0F5C50] hover:text-[#0B4A40] focus-within:outline-none">
                            <span>Upload foto</span>
                            <input type="file" onChange={e => setMenuImage(e.target.files[0])} className="sr-only" accept="image/*" />
                          </label>
                          <p className="pl-1">atau drag & drop</p>
                        </div>
                        <p className="text-xs text-ink/45">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-[#0F5C50] text-white font-bold rounded-xl shadow-md shadow-[#0F5C50]/20 hover:bg-[#0B4A40]">
                  {editingMenu ? 'Simpan Perubahan' : 'Tambah Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl animate-in slide-in-from-bottom-5 fade-in duration-300"
          style={{ backgroundColor: 'var(--color-ink)', color: '#fff', boxShadow: '0 8px 24px rgba(43,33,24,0.3)' }}
        >
          <Bell size={18} style={{ color: 'var(--color-saffron)' }} className="animate-bounce" />
          <p className="text-sm font-semibold">{notification}</p>
          <button onClick={() => setNotification(null)} className="ml-2 text-white/50 hover:text-white transition-colors">
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default OwnerDashboard;

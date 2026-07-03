import { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Clock, CheckCircle, XCircle, Receipt, Star, MessageSquare, X, Bell, UtensilsCrossed, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const socket = useSocket();
  const [notification, setNotification] = useState(null);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('orderStatusUpdated', (data) => {
      console.log('Order status updated:', data);
      
      // Show notification
      setNotification(`Pesanan dari ${data.restaurantName} kini: ${data.status}`);
      setTimeout(() => setNotification(null), 5000);

      // Update orders state directly
      setOrders(prev => prev.map(o => 
        o.id === data.orderId ? { ...o, status: data.status } : o
      ));
    });

    return () => {
      socket.off('orderStatusUpdated');
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/history');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (order) => {
    setReviewOrder(order);
    setRating(0);
    setHoverRating(0);
    setComment('');
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewOrder(null);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rating) return;
    
    setSubmitting(true);
    setReviewError('');
    try {
      await api.post(`/orders/${reviewOrder.id}/review`, {
        rating,
        comment
      });
      closeReviewModal();
      fetchOrders();
    } catch (error) {
      console.error('Failed to submit review', error);
      setReviewError(error.response?.data?.message || 'Gagal mengirim ulasan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold";
    switch(status) {
      case 'processing':
        return <span className={`${base} bg-saffron/10 text-saffron`}><Clock size={12} /> Diproses</span>;
      case 'shipped':
        return <span className={`${base} bg-ink/10 text-ink`}><Package size={12} /> Dikirim</span>;
      case 'completed':
        return <span className={`${base} bg-sage/10 text-sage`}><CheckCircle size={12} /> Selesai</span>;
      case 'failed':
      case 'cancelled':
        return <span className={`${base} bg-terracotta/10 text-terracotta`}><XCircle size={12} /> Dibatalkan</span>;
      default:
        return <span className={`${base} bg-ink/5 text-ink/60`}><Clock size={12} /> Menunggu Bayar</span>;
    }
  };

  const renderStepper = (currentStatus) => {
    const steps = [
      { id: 'pending', label: 'Menunggu', icon: <Clock size={16} /> },
      { id: 'processing', label: 'Diproses', icon: <UtensilsCrossed size={16} /> },
      { id: 'shipped', label: 'Dikirim', icon: <Package size={16} /> },
      { id: 'completed', label: 'Selesai', icon: <CheckCircle size={16} /> }
    ];

    if (currentStatus === 'cancelled' || currentStatus === 'failed') {
      return (
        <div className="flex items-center justify-center p-4 bg-terracotta/10 text-terracotta rounded-xl mx-6 mt-4">
          <XCircle size={20} className="mr-2" />
          <span className="font-bold text-sm">Pesanan Dibatalkan</span>
        </div>
      );
    }

    let currentIndex = steps.findIndex(s => s.id === currentStatus);
    if (currentIndex === -1) currentIndex = 0;
    
    return (
      <div className="px-8 py-8 border-b border-cream">
        <div className="relative flex justify-between">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 w-full h-1 -translate-y-1/2 bg-cream rounded-full z-0" />
          <div 
            className="absolute top-5 left-0 h-1 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out z-0" 
            style={{ 
              width: `${(currentIndex / (steps.length - 1)) * 100}%`,
              backgroundColor: 'var(--color-saffron)'
            }} 
          />

          {/* Steps */}
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isActive = index === currentIndex;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                    isActive ? 'bg-saffron text-ink border-white scale-110 shadow-soft' :
                    isCompleted ? 'bg-saffron text-ink border-saffron' :
                    'bg-cream text-ink/30 border-white'
                  }`}
                >
                  {step.icon}
                </div>
                <span className={`mt-2 text-xs font-bold ${isCompleted ? 'text-ink' : 'text-ink/40'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/complete`);
      fetchOrders(); // Refresh to show completed status
    } catch (error) {
      console.error('Failed to complete order:', error);
      alert('Gagal menyelesaikan pesanan.');
    }
  };

  const confirmDeleteOrder = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const executeDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/orders/${orderToDelete}`);
      fetchOrders(); // Refresh list after deletion
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Failed to delete order:', error.response?.data || error.message);
      alert(`Gagal menghapus pesanan: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-10 bg-cream rounded w-1/3 mb-8 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-white rounded-3xl shadow-soft animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-display font-bold text-ink mb-10">Riwayat Pesanan</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-soft">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cream rounded-full mb-6 text-ink/30">
            <Receipt size={36} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-display font-bold text-ink mb-2">Belum Ada Pesanan</h3>
          <p className="text-ink/60 font-medium mb-6">
            Riwayat pesanan kamu akan tampil di sini.
          </p>
          <Link
            to="/"
            className="inline-flex items-center font-bold px-6 py-3 rounded-full transition-all hover:scale-[1.03]"
            style={{ 
    backgroundColor: '#0F5C50', // Menggunakan warna TEAL
    color: '#ffffff',           // Teks putih agar kontras dengan latar hijau
    boxShadow: '0 4px 16px rgba(15,92,80,0.35)' // Bayangan disesuaikan dengan warna hijau
  }}
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => {
            const canReview = order.status === 'completed' && !order.review; 
            const isShipped = order.status === 'shipped';
            const isPending = order.status === 'pending';

            return (
              <div key={order.id} className="bg-white rounded-3xl shadow-soft overflow-hidden">
                {/* Order header */}
                <div className="px-6 py-5 border-b border-cream flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <Link to={`/restaurant/${order.restaurant_id}`} className="font-display font-bold text-lg text-ink hover:text-terracotta transition-colors">
                      {order.restaurant?.name || 'Restoran'}
                    </Link>
                    <p className="text-sm text-ink/50 font-medium mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(order.status)}
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Link
                        to={`/struk/${order.id}`}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:scale-[1.03]"
                        style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-ink)' }}
                      >
                        <Receipt size={13} /> Lihat Struk
                      </Link>
                      {isPending && (
                        <button 
                          onClick={() => confirmDeleteOrder(order.id)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:scale-[1.03]"
                          style={{ backgroundColor: 'rgba(216,63,49,0.1)', color: 'var(--color-terracotta)' }}
                        >
                          <Trash2 size={13} /> Hapus Pesanan
                        </button>
                      )}
                    {isShipped && (
                      <button 
                        onClick={() => handleCompleteOrder(order.id)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:scale-[1.03]"
                        style={{ backgroundColor: 'var(--color-sage)', color: 'white' }}
                      >
                        <CheckCircle size={13} /> Pesanan Diterima
                      </button>
                    )}
                      {canReview && (
                        <button 
                          onClick={() => openReviewModal(order)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:scale-[1.03]"
                          style={{ backgroundColor: 'rgba(232,163,61,0.15)', color: 'var(--color-saffron)' }}
                        >
                          <MessageSquare size={13} /> Beri Ulasan
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Tracking Stepper */}
                {renderStepper(order.status)}

                {/* Order items */}
                <div className="px-6 py-4">
                  <ul className="space-y-2">
                    {order.items.map(item => (
                      <li key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-ink font-medium">
                          <span className="text-terracotta font-bold">{item.quantity}x</span> {item.menu?.name || 'Menu dihapus'}
                        </span>
                        <span className="text-ink/60 font-medium">
                          Rp {Number(item.price_at_order * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Total */}
                <div className="px-6 py-4 bg-cream/50 flex justify-between items-center">
                  <span className="text-ink/60 font-semibold text-sm">Total Belanja</span>
                  <span className="font-display font-bold text-xl text-ink">
                    Rp {Number(order.total_price).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(43,33,24,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-[0_24px_48px_rgba(43,33,24,0.2)] animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeReviewModal}
              className="absolute top-5 right-5 text-ink/40 hover:text-terracotta transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-ink mb-1">Nilai Makananmu</h2>
              <p className="text-sm text-ink/60 font-medium">dari {reviewOrder.restaurant?.name}</p>
            </div>

            <form onSubmit={submitReview}>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-all hover:scale-110"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      size={36}
                      className="transition-colors duration-150"
                      style={{ 
                        fill: (hoverRating || rating) >= star ? 'var(--color-saffron)' : 'transparent',
                        color: (hoverRating || rating) >= star ? 'var(--color-saffron)' : 'rgba(43,33,24,0.15)' 
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-ink mb-2">Tulis Ulasan (Opsional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan pengalamanmu dengan makanan ini..."
                  className="w-full rounded-2xl p-4 text-sm font-medium border border-ink/10 focus:border-saffron focus:ring-4 focus:ring-saffron/10 outline-none transition-all resize-none h-28"
                  style={{ backgroundColor: 'var(--color-cream)' }}
                ></textarea>
              </div>

              {reviewError && (
                <div className="mb-4 p-3 bg-terracotta/10 border border-terracotta/20 rounded-xl flex flex-col items-center text-center text-terracotta font-medium text-sm">
                  <AlertTriangle size={18} className="mb-1" />
                  {reviewError}
                </div>
              )}

              <button
                type="submit"
                disabled={!rating || submitting}
                className="w-full py-3.5 rounded-full font-bold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-saffron)', color: 'var(--color-ink)' }}
              >
                {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 pt-8 pb-6 text-center">
              <div className="w-16 h-16 mx-auto bg-terracotta/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} style={{ color: 'var(--color-terracotta)' }} />
              </div>
              <h2 className="text-2xl font-display font-bold text-ink mb-2">Hapus Pesanan?</h2>
              <p className="text-ink/60 font-medium">
                Pesanan ini belum dibayar. Apakah Anda yakin ingin menghapusnya secara permanen?
              </p>
            </div>
            
            <div className="px-6 pb-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-full font-bold text-ink bg-cream hover:bg-[#D9D3C5] transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteOrder}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-full font-bold text-white transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                style={{ backgroundColor: 'var(--color-terracotta)' }}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

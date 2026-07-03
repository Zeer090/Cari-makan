import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, UtensilsCrossed } from 'lucide-react';

// Konsistensi tema visual baru
const TEAL = '#0F5C50';

const loadSnapScript = () => {
  if (!document.querySelector('script[src*="snap"]')) {
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
    const scriptUrl = isProduction 
      ? "https://app.midtrans.com/snap/snap.js" 
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    const scriptTag = document.createElement('script');
    scriptTag.src = scriptUrl;
    scriptTag.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-dummy');
    document.head.appendChild(scriptTag);
  }
};

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('midtrans');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSnapScript();
    const fetchRestaurant = async () => {
      if (cart.restaurant_id) {
        try {
          const response = await api.get(`/restaurants/${cart.restaurant_id}`);
          setRestaurant(response.data.data);
        } catch (e) {}
      }
    };
    fetchRestaurant();
  }, [cart.restaurant_id]);

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    setCheckoutLoading(true);
    setError('');
    try {
      const orderRes = await api.post('/orders/checkout', {
        restaurant_id: cart.restaurant_id,
        items: cart.items.map(item => ({ menu_id: item.menu_id, quantity: item.quantity })),
        payment_method: paymentMethod
      });
      const order = orderRes.data.data;

      if (paymentMethod === 'cash') {
        clearCart();
        navigate(`/struk/${order.id}`);
        return;
      }

      const paymentRes = await api.post('/payments/create-transaction', { order_id: order.id });
      const snapToken = paymentRes.data.data.snap_token;
      
      const checkStatusAndRedirect = async (targetUrl = '/history') => {
        try {
          await api.get(`/payments/check-status/${order.id}`);
        } catch (e) {
          console.error('Error checking status:', e);
        }
        clearCart();
        navigate(targetUrl);
      };

      window.snap.pay(snapToken, {
        onSuccess: () => checkStatusAndRedirect(`/struk/${order.id}`),
        onPending: () => checkStatusAndRedirect('/history'),
        onError: () => setError('Pembayaran gagal. Silakan coba lagi.'),
        onClose: () => checkStatusAndRedirect('/history')
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const shippingFee = 10000;

  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center px-4 py-16 bg-white rounded-3xl mx-4 sm:mx-auto" style={{ boxShadow: '0 2px 24px rgba(43,33,24,0.04)' }}>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 text-ink/30" style={{ backgroundColor: '#F7F5F0' }}>
          <UtensilsCrossed size={36} style={{ color: 'rgba(43,33,24,0.3)' }} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-display font-bold text-ink mb-2" style={{ color: '#1A202C' }}>Keranjang Masih Kosong</h2>
        <p className="text-sm font-medium mb-8" style={{ color: 'rgba(43,33,24,0.6)' }}>
          Yuk, tambahkan hidangan dari restoran pilihanmu!
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-full font-bold shadow-sm transition-all active:scale-[0.98]"
              style={{ backgroundColor: TEAL }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0B4A40'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = TEAL}>
          <ShoppingBag size={18} />
          Cari Makanan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-ink/80 transition-colors"
                style={{ border: '1px solid rgba(43,33,24,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.color = TEAL; e.currentTarget.style.borderColor = TEAL; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(43,33,24,0.8)'; e.currentTarget.style.borderColor = 'rgba(43,33,24,0.08)'; }}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-display font-bold" style={{ color: '#1A202C' }}>Detail Pesanan</h1>
      </div>

      {error && (
        <div className="border rounded-2xl p-4 mb-6 text-sm font-medium text-red-600 bg-red-50" style={{ borderColor: 'rgba(229,62,62,0.15)' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl p-6" style={{ boxShadow: '0 2px 24px rgba(43,33,24,0.04)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(43,33,24,0.4)' }}>Pesanan dari</p>
            <h2 className="text-xl font-display font-bold mb-6 pb-6 border-b" style={{ color: '#1A202C', borderColor: 'rgba(43,33,24,0.06)' }}>
              {restaurant?.name || '...'}
            </h2> 

            <ul className="space-y-1 divide-y" style={{  borderColor: 'rgba(43,33,24,0.06)' }}>
              {cart.items.map((item) => (
                <li key={item.menu_id} className="py-5 flex justify-between items-center" style={{ borderColor: 'rgba(43,33,24,0.06)' }}>
                  <div className="flex-grow">
                    <h3 className="font-display font-bold text-base" style={{ color: '#1A202C' }}>{item.name}</h3>
                    <p className="font-semibold text-sm mt-0.5" style={{ color: TEAL }}>
                      Rp {Number(item.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 rounded-full px-2 py-1" style={{ backgroundColor: '#F7F5F0' }}>
                      <button
                        onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm transition-colors"
                        style={{ color: TEAL }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = TEAL; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = TEAL; }}
                      >
                        <Minus size={12} strokeWidth={3} />
                      </button>
                      <span className="font-bold w-5 text-center text-sm" style={{ color: '#1A202C' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-white rounded-full shadow-sm transition-colors"
                        style={{ backgroundColor: TEAL }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0B4A40'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = TEAL}
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.menu_id)}
                      className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
                      style={{ backgroundColor: '#F7F5F0', color: 'rgba(43,33,24,0.4)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(229,62,62,0.08)'; e.currentTarget.style.color = '#E53E3E'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F7F5F0'; e.currentTarget.style.color = 'rgba(43,33,24,0.4)'; }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl p-6 sticky top-24" style={{ boxShadow: '0 2px 24px rgba(43,33,24,0.04)' }}>
            <h2 className="text-lg font-display font-bold mb-6 pb-5 border-b" style={{ color: '#1A202C', borderColor: 'rgba(43,33,24,0.06)' }}>
              Ringkasan
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm font-medium" style={{ color: 'rgba(43,33,24,0.7)' }}>
                <span>Subtotal</span>
                <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm font-medium" style={{ color: 'rgba(43,33,24,0.7)' }}>
                <span>Ongkos Kirim</span>
                <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-4 border-t" style={{ color: '#1A202C', borderColor: 'rgba(43,33,24,0.06)' }}>
                <span>Total</span>
                <span style={{ color: TEAL }}>Rp {(cartTotal + shippingFee).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1A202C' }}>Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border-none rounded-2xl py-3 px-4 font-medium focus:outline-none transition-all text-sm text-ink"
                style={{ backgroundColor: '#F7F5F0' }}
                onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${TEAL}20`; }}
                onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
              >
                <option value="midtrans">QRIS / Transfer (Midtrans)</option>
                <option value="cash">Bayar Langsung & Cetak Struk</option>
              </select>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className={`w-full text-white py-3.5 rounded-full font-bold text-base shadow-sm transition-all active:scale-[0.98] ${checkoutLoading ? 'opacity-70 cursor-wait' : ''}`}
              style={{ backgroundColor: TEAL }}
              onMouseEnter={e => { if(!checkoutLoading) e.currentTarget.style.backgroundColor = '#0B4A40'; }}
              onMouseLeave={e => { if(!checkoutLoading) e.currentTarget.style.backgroundColor = TEAL; }}
            >
              {checkoutLoading 
                ? 'Memproses...' 
                : paymentMethod === 'cash' 
                  ? 'Bayar & Lihat Struk' 
                  : 'Bayar Sekarang'}
            </button>

            {paymentMethod === 'midtrans' && (
              <p className="text-center text-xs mt-4 font-medium" style={{ color: 'rgba(43,33,24,0.4)' }}>Pembayaran aman via Midtrans</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
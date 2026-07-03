import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

const Receipt = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">Memuat struk...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-terracotta mb-4">Pesanan tidak ditemukan.</p>
        <Link to="/" className="font-bold underline" style={{ color: '#0F5C50' }}>Kembali ke Beranda</Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 flex flex-col items-center">
      {/* Action Buttons - Hidden when printing */}
      <div className="w-full max-w-md flex justify-between mb-6 print:hidden">
        <Link to="/history" className="flex items-center gap-2 text-ink/60 hover:text-ink transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Riwayat Pesanan
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-ink text-cream px-4 py-2 rounded-full font-bold text-sm shadow-soft hover:scale-105 transition-transform"
        >
          <Printer size={16} /> Cetak Struk
        </button>
      </div>

      {/* Receipt Paper */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl relative overflow-hidden print:shadow-none print:w-full print:max-w-none print:p-0">
        
        {/* Receipt Header */}
        <div className="text-center mb-8 border-b-2 border-dashed border-cream pb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sage/10 text-sage rounded-full mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-display font-black text-ink tracking-tight uppercase">LUNAS</h1>
          <p className="text-ink/60 text-sm mt-1 font-medium">{order.restaurant?.name}</p>
          <p className="text-ink/40 text-xs mt-1">{new Date(order.created_at).toLocaleString('id-ID')}</p>
        </div>

        {/* Receipt Details */}
        <div className="space-y-3 mb-8 text-sm font-medium">
          <div className="flex justify-between">
            <span className="text-ink/60">No. Pesanan</span>
            <span className="text-ink font-mono text-xs">{order.id.split('-')[0].toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Nama Pelanggan</span>
            <span className="text-ink">{order.user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Metode</span>
            <span className="text-ink uppercase">{order.payment_method}</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-b border-cream py-4 mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink/40 uppercase tracking-wider text-xs">
                <th className="pb-3 font-semibold">Item</th>
                <th className="pb-3 font-semibold text-center">Qty</th>
                <th className="pb-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-ink font-medium">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 pr-2">{item.menu?.name}</td>
                  <td className="py-2 text-center text-ink/60">{item.quantity}x</td>
                  <td className="py-2 text-right">Rp {(item.price_at_order * item.quantity).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm font-bold mb-10">
          <div className="flex justify-between text-ink/60">
            <span>Subtotal</span>
            <span>Rp {Number(order.total_price).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-ink/60">
            <span>Ongkos Kirim</span>
            <span>Rp 0</span> {/* Assuming 0 for cash pickup for now */}
          </div>
          <div className="flex justify-between text-lg text-terracotta mt-2 pt-4 border-t-2 border-dashed border-cream">
            <span>Total Bayar</span>
            <span>Rp {Number(order.total_price).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-ink/40 text-xs font-medium">
          <p>Terima kasih telah berbelanja di CariMakan!</p>
          <p className="mt-1 font-mono uppercase">#{order.id.split('-').slice(-1)}</p>
        </div>

      </div>
    </div>
  );
};

export default Receipt;

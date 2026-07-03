import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Upload, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Konsistensi tema visual baru
const TEAL = '#0F5C50';

const OpenStore = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [agreed, setAgreed] = useState(false);

  // If not customer, redirect
  if (user && user.role !== 'customer') {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('Anda harus menyetujui persyaratan khusus untuk membuka toko.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('address', formData.address);
      data.append('description', formData.description);
      if (image) data.append('image', image);

      const response = await api.post('/restaurants', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // Update user role in context
        updateUser(response.data.data.user);
        navigate('/owner'); // Go to owner dashboard
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat toko. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full px-4 py-3 border-none rounded-2xl text-ink transition-all text-sm focus:outline-none";
  const labelClass = "block text-sm font-semibold mb-2 text-ink";

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: 'rgba(15, 92, 80, 0.08)' }}>
            <Store size={32} style={{ color: TEAL }} />
          </div>
          <h1 className="text-3xl font-display font-bold" style={{ color: '#1A202C' }}>Buka Toko Anda</h1>
          <p className="text-sm mt-2 font-medium" style={{ color: 'rgba(43,33,24,0.6)' }}>Mulai perjalanan bisnis kuliner Anda bersama CariMakan</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-ink/8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium text-center border" style={{ borderColor: 'rgba(229,62,62,0.15)' }}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Nama Toko/Restoran</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ backgroundColor: '#F7F5F0' }}
                  onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${TEAL}20`; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                  placeholder="Contoh: Warung Nasi Mantap"
                />
              </div>

              <div>
                <label className={labelClass}>Kategori</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ backgroundColor: '#F7F5F0' }}
                  onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${TEAL}20`; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Indonesian">Indonesian</option>
                  <option value="Western">Western</option>
                  <option value="Asian">Asian</option>
                  <option value="Beverages">Minuman</option>
                  <option value="Snacks">Cemilan</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Alamat Lengkap</label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ backgroundColor: '#F7F5F0' }}
                  onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${TEAL}20`; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                  placeholder="Alamat lengkap toko Anda..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>Foto Toko (Opsional)</label>
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-ink/12 border-dashed rounded-2xl relative transition-colors group"
                  onMouseEnter={e => e.currentTarget.style.borderColor = TEAL}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E7E5E4'}
                >
                  <div className="space-y-2 text-center">
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="Preview" className="mx-auto h-32 w-auto rounded-xl object-cover" />
                        <button 
                          type="button" 
                          onClick={() => {setImage(null); setPreview(null);}}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-ink/35 group-hover:text-ink transition-colors" strokeWidth={1.5} />
                        <div className="flex text-sm font-medium text-ink/50 justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-bold focus-within:outline-none" style={{ color: TEAL }}>
                            <span>Upload foto</span>
                            <input type="file" name="image" className="sr-only" accept="image/*" onChange={handleImageChange} />
                          </label>
                          <p className="pl-1">atau drag & drop</p>
                        </div>
                        <p className="text-xs text-ink/35">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Deskripsi Singkat</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ backgroundColor: '#F7F5F0' }}
                  onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${TEAL}20`; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                  placeholder="Ceritakan sedikit tentang toko Anda..."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-ink/8 pt-8 mb-8">
            <h3 className="text-base font-bold text-ink mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} style={{ color: TEAL }} />
              Persyaratan Khusus
            </h3>
            <div className="bg-cream rounded-2xl p-5 text-sm text-ink/50 h-40 overflow-y-auto mb-5 border border-ink/8">
              <p className="font-semibold mb-2">Syarat dan Ketentuan Membuka Toko di CariMakan:</p>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Anda menjamin bahwa seluruh informasi dan data yang diberikan adalah benar dan sah.</li>
                <li>Makanan/minuman yang dijual harus aman untuk dikonsumsi, higienis, dan tidak melanggar hukum yang berlaku di Indonesia.</li>
                <li>Pihak CariMakan berhak memotong komisi sebesar 10% dari setiap transaksi yang berhasil melalui platform.</li>
                <li>Penjual wajib memperbarui ketersediaan stok makanan secara berkala agar tidak terjadi pesanan yang tidak dapat dipenuhi.</li>
                <li>CariMakan berhak membekukan atau menutup akun toko secara sepihak apabila ditemukan kecurangan atau pelanggaran terhadap syarat dan ketentuan ini.</li>
                <li>Segala bentuk keluhan terkait kualitas makanan sepenuhnya menjadi tanggung jawab pemilik restoran/toko.</li>
              </ol>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-0.5">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer w-5 h-5 appearance-none rounded-lg border-2 border-ink/15 transition-all cursor-pointer"
                  style={{ backgroundColor: agreed ? TEAL : 'transparent', borderColor: agreed ? TEAL : '#D6D3D1' }}
                />
                <CheckCircle2 size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm font-medium select-none text-ink/50">
                Saya telah membaca, memahami, dan menyetujui seluruh <span className="font-bold text-ink">Syarat dan Ketentuan</span> di atas.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreed}
            className={`w-full py-3.5 rounded-full font-bold text-white transition-all duration-200 shadow-sm active:scale-[0.98] ${
              loading || !agreed ? 'bg-ink/15 cursor-not-allowed shadow-none opacity-50' : 'hover:opacity-90'
            }`}
            style={{ backgroundColor: loading || !agreed ? '#D6D3D1' : TEAL }}
            onMouseEnter={e => { if(!loading && agreed) e.currentTarget.style.backgroundColor = '#0B4A40'; }}
            onMouseLeave={e => { if(!loading && agreed) e.currentTarget.style.backgroundColor = TEAL; }}
          >
            {loading ? 'Memproses...' : 'Buka Toko Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OpenStore;
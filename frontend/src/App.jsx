import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import OpenStore from './pages/OpenStore';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Favorites from './pages/Favorites';
import Receipt from './pages/Receipt';

function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-cream)' }}>
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/restaurant/:id"  element={<RestaurantDetail />} />
          <Route path="/cart"            element={<Cart />} />
          <Route path="/history"         element={<OrderHistory />} />
          <Route path="/buka-toko"       element={<OpenStore />} />
          <Route path="/owner"           element={<OwnerDashboard />} />
          <Route path="/admin"           element={<AdminDashboard />} />
          <Route path="/favorites"       element={<Favorites />} />
          <Route path="/struk/:id"       element={<Receipt />} />
        </Routes>
      </main>

      {/* Footer — simple, satu baris */}
      <footer className="print:hidden" style={{ backgroundColor: 'var(--color-ink)', color: 'rgba(255,248,240,0.55)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <span className="font-display font-bold text-lg" style={{ color: 'var(--color-saffron)' }}>
            CariMakan
          </span>
          <span className="hidden sm:block">Temukan cita rasa terbaik, satu suapan setiap hari.</span>
          <span style={{ color: 'rgba(255,248,240,0.3)', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} CariMakan
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;

# 🍽️ Cari Makan

Aplikasi pemesanan makanan online berbasis web yang menghubungkan pelanggan dengan restoran lokal. Dibangun dengan **React + Vite** di sisi frontend dan **Express.js + Prisma** di sisi backend.

---

## ✨ Fitur Utama

### 👤 Customer
- Register & Login (Email/Password atau Google OAuth)
- Jelajahi restoran dan menu makanan
- Tambah ke keranjang & buat pesanan
- Pembayaran online via **Midtrans** (GoPay, QRIS, Transfer Bank, dll)
- Lacak status pesanan secara **real-time** (Socket.IO)
- Riwayat pesanan & struk pembayaran
- Simpan restoran favorit
- Beri ulasan dan rating setelah makan

### 🏪 Restaurant Owner
- Daftar & kelola toko restoran
- Tambah, edit, hapus menu makanan
- Kelola pesanan masuk secara real-time
- Dashboard statistik penjualan

### 🛡️ Admin
- Verifikasi & kelola restoran
- Manajemen pengguna
- Dashboard admin lengkap

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **Backend** | Node.js, Express.js 5 |
| **Database** | SQLite (dev) via Prisma ORM |
| **Auth** | JWT, Google OAuth 2.0 |
| **Payment** | Midtrans |
| **Real-time** | Socket.IO |
| **Upload** | Multer |

---

## 📁 Struktur Project

```
Cari-makan/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Skema database
│   ├── src/
│   │   ├── config/             # Konfigurasi Prisma
│   │   ├── controllers/        # Logic bisnis
│   │   ├── middlewares/        # Auth middleware
│   │   ├── routes/             # Endpoint API
│   │   └── services/           # Midtrans service
│   ├── uploads/                # Foto restoran & menu
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/         # Navbar, DashboardNavbar
    │   ├── context/            # Auth, Cart, Socket context
    │   ├── pages/              # Halaman-halaman aplikasi
    │   └── services/           # Axios API calls
    └── package.json
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- **Node.js** >= 18
- **npm** >= 9
- Akun [Midtrans Sandbox](https://sandbox.midtrans.com) (untuk fitur pembayaran)

---

### 1. Clone Repository

```bash
git clone https://github.com/Zeer090/Cari-makan.git
cd Cari-makan
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` dari contoh:

```bash
cp .env.example .env
```

Isi file `.env`:

```env
PORT=5000
DATABASE_URL="file:./dev.db"

JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="7d"

MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxx"

FRONTEND_URL=http://localhost:5173
```

Jalankan migrasi database:

```bash
npx prisma migrate dev
```

Jalankan backend:

```bash
npm run dev
```

Backend berjalan di: `http://localhost:5000`

---

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Buat file `.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

---

## 🗄️ Database Schema

| Model | Deskripsi |
|---|---|
| `User` | Data pengguna (customer, owner, admin) |
| `Restaurant` | Data restoran |
| `Menu` | Item menu tiap restoran |
| `Order` | Pesanan pelanggan |
| `OrderItem` | Detail item dalam pesanan |
| `Payment` | Data transaksi Midtrans |
| `Review` | Ulasan & rating |
| `Favorite` | Restoran favorit pengguna |

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/register` | Daftar akun baru |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/google` | Login dengan Google |
| `GET` | `/api/restaurants` | Daftar restoran |
| `GET` | `/api/restaurants/:id` | Detail restoran |
| `POST` | `/api/orders` | Buat pesanan |
| `GET` | `/api/orders` | Riwayat pesanan |
| `POST` | `/api/payments/create` | Buat transaksi pembayaran |
| `POST` | `/api/payments/notification` | Webhook Midtrans |
| `GET` | `/api/health` | Health check |

---

## 👤 Akun Role

Untuk menaikkan role pengguna menjadi admin, jalankan script:

```bash
cd backend
node make-admin.js
```

---

## 📜 Lisensi

Project ini dibuat untuk keperluan belajar dan pengembangan. Feel free to fork & modify!

---

<p align="center">Made with ❤️ by <a href="https://github.com/Zeer090">Zeer090</a></p>

# Fund-BE (Backend API - Capstone Project)

Backend API untuk aplikasi pendanaan (FundRaise) berbasis Node.js, Express, dan PostgreSQL. Sistem ini dirancang untuk memfasilitasi pendanaan bagi Usaha Mikro, Kecil, dan Menengah (UMKM) melalui mekanisme investasi dari para investor, lengkap dengan fitur negosiasi bagi hasil, pembayaran otomatis, dan dompet digital (wallet).

> [!NOTE]
> Proyek ini merupakan Capstone Project untuk program Coding Camp 2026 yang diselenggarakan dan didukung penuh oleh DBS Foundation x Dicoding.

## Repositori Terkait

Proyek backend ini merupakan bagian dari ekosistem aplikasi FundRaise. Berikut adalah repositori terkait lainnya:
- **Frontend Application (fund-fe)**: [github.com/kelpstones/fund-fe](https://github.com/kelpstones/fund-fe)
- **AI Service (fund-ai)**: [github.com/kelpstones/fund-ai](https://github.com/kelpstones/fund-ai)
- **Model Machine Learning**: [google drive](https://drive.google.com/drive/folders/1ARBgCh-3UrBW-yZY1RJW0xTPc5kv0hnt?usp=sharing)
- **Data Science (fund-ds)**: [github.com/kelpstones/fund-ds](https://github.com/kelpstones/fund-ds)

---

## Fitur Utama

Aplikasi backend ini dilengkapi dengan fitur-fitur tingkat lanjut berikut:
- **Autentikasi dan Otorisasi Berbasis Peran (RBAC)**: Mendukung peran `investor`, `umkm`, `admin`, dan `superadmin`. Dilengkapi dengan verifikasi email, pengaturan ulang kata sandi (reset password), dan penyegaran token (refresh token) menggunakan JWT.
- **Manajemen Profil dan Bisnis**: Registrasi profil bisnis UMKM, dokumen legalitas, dan cover image yang terintegrasi dengan Cloudinary untuk penyimpanan aset.
- **Sistem Pengajuan dan Negosiasi**: UMKM dapat membuat pengajuan pendanaan. Investor dan UMKM dapat melakukan negosiasi bagi hasil secara langsung melalui sistem.
- **Integrasi Gerbang Pembayaran (Payment Gateway)**: Mendukung top-up wallet, pembayaran invoice, dan callback otomatis menggunakan Xendit.
- **Sistem Dompet Digital (Wallet)**: Investor dapat melakukan pengisian saldo (top-up), penarikan saldo (withdrawal), melihat riwayat transaksi, dan membayar invoice proyek investasi.
- **Distribusi Profit Otomatis**: Memfasilitasi distribusi keuntungan (profit-sharing) secara berkala kepada para investor berdasarkan porsi investasi masing-masing.
- **Sistem Keamanan**:
  - Validasi API Key (`x-api-key`) untuk membatasi akses klien.
  - Anti-Scanner Middleware untuk mendeteksi dan memblokir bot pemindai celah keamanan.
  - Rate Limiting dinamis (general limiter, auth limiter, dan email limiter) untuk mencegah serangan brute force dan DDoS.
  - Penggunaan Helmet dan CORS terkonfigurasi secara ketat.
- **Logging dan Monitoring**: Sistem logging terpusat menggunakan Winston (dilengkapi rotasi file log harian) untuk memantau aktivitas HTTP dan kesalahan server.
- **Dukungan Integrasi Machine Learning**: Menyediakan endpoint khusus (`/api/v1/businesses/ml`) untuk sinkronisasi profil bisnis dengan model ML eksternal guna memproses preferensi investasi investor.

---

## Teknologi dan Dependensi Utama

| Teknologi / Library | Deskripsi |
| :--- | :--- |
| **Node.js** | Runtime Environment |
| **Express.js (v5.x)** | Framework Web Utama |
| **PostgreSQL (v16)** | Database Relasional Utama |
| **Knex.js** | SQL Query Builder & Database Migrations/Seeds |
| **Redis (v7)** | Caching & Rate Limiting |
| **Xendit Node SDK** | Integrasi Payment Gateway |
| **Cloudinary** | Penyimpanan Media Cloud (Gambar/Dokumen) |
| **Joi** | Validasi Skema Input & Payload Request |
| **JWT (JsonWebToken)** | Manajemen Sesi & Token Keamanan |
| **Nodemailer** | Pengiriman Email (Verifikasi & Reset Password) |
| **Winston & Morgan** | Logger HTTP & Manajemen Log Server |
| **Jest & Supertest** | Framework Pengujian Otomatis (Unit & Integration) |

---

## Struktur Direktori Proyek

```
├── src/
│   ├── app.js                    # Entry point Express & konfigurasi middleware
│   ├── config/                   # Konfigurasi database PostgreSQL (Knex) & Redis
│   ├── controllers/              # Logika bisnis/endpoint API
│   ├── middlewares/              # Middleware (Auth, Role, Rate Limiter, Anti-Scanner, dll.)
│   ├── migrations/               # Skema migrasi database PostgreSQL
│   ├── models/                   # Definisi model & query database
│   ├── routes/                   # Routing endpoint API (/api/v1/...)
│   ├── seeds/                    # Seeder data awal database (Roles, Bank, Kelas, dll.)
│   ├── templates/                # Template email HTML (Verifikasi & Reset Password)
│   ├── utils/                    # Helper & Utility (JWT, Bcrypt, Response Helper, Logger)
│   └── validation/               # Skema validasi request body menggunakan Joi
├── tests/                        # Folder Pengujian
│   ├── integration/              # Test integration (Auth, Invoice, Negosiasi, Pengajuan, Wallet)
│   └── unit/                     # Test unit logika aplikasi
├── Dockerfile                    # Konfigurasi container Docker untuk Node.js
├── docker-compose.yml            # Orkestrasi Docker untuk development (API, Postgres, Redis)
├── docker-compose.prod.yml       # Orkestrasi Docker untuk production
├── docker-entrypoint.sh          # Script startup Docker (menunggu DB, migrasi, seeding, start dev)
├── knexfile.js                   # Konfigurasi lingkungan Knex (dev, test, prod)
└── package.json                  # Konfigurasi proyek, skrip, dan dependensi npm
```

---

## Petunjuk Setup Environment

Untuk menjalankan proyek backend ini, Anda perlu menyiapkan konfigurasi lingkungan kerja (environment setup) dengan langkah-langkah berikut:

1. Buat file `.env` di root direktori proyek dengan menyalin template `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Sesuaikan konfigurasi variabel lingkungan di bawah ini:


| Variabel | Deskripsi | Nilai Default / Contoh |
| :--- | :--- | :--- |
| `PORT` | Port server backend | `5000` |
| `DB_HOST` | Host database PostgreSQL | `127.0.0.1` (atau `db` di Docker) |
| `DB_NAME` | Nama database | `fund_db` |
| `DB_USER` & `DB_PASSWORD` | Kredensial database | `postgres` & `password` |
| `JWT_SECRET` | Secret key untuk token JWT User | *Kunci rahasia JWT Anda* |
| `JWT_SECRET_ADMIN` | Secret key untuk token JWT Admin | *Kunci rahasia JWT Admin Anda* |
| `API_KEY` | API Key wajib pada header `x-api-key` | *Kunci API Anda* |
| `REDIS_URL` | URL koneksi server Redis | `redis://localhost:6379` |
| `SMTP_HOST` & `SMTP_PORT` | Host mail server untuk pengiriman email | `smtp.hostinger.com` & `465` |
| `CLOUDINARY_CLOUD_NAME` | Nama akun Cloudinary Anda | `your_cloudinary_cloud_name` |
| `XENDIT_SECRET_KEY` | API Secret Key dari Xendit | `xnd_development_...` |
| `PPN_RATE` | Tarif PPN dalam persen | `12` |
| `ADMIN_FEE_RATE` | Tarif biaya admin dalam persen | `1` |

---

## Dokumentasi API Lengkap

Semua request yang dikirimkan ke server API wajib menyertakan header berikut:
1. `x-api-key`: Berisi nilai API Key dari `.env` untuk validasi akses aplikasi.
2. `Authorization`: Berisi JWT Token dengan format `Bearer <token>` (untuk endpoint yang dilindungi).

### 1. Modul Autentikasi dan Pengguna (`/api/v1/user`)

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/user/register` | `x-api-key` | - | `email`, `password`, `fullname`, `role` (umkm / investor) | Bebas (Tanpa Token) |
| **POST** | `/user/login` | `x-api-key` | - | `email`, `password` | Bebas (Tanpa Token) |
| **GET** | `/user/verify-email` | `x-api-key` | Query: `token` | - | Bebas (Tanpa Token) |
| **POST** | `/user/resend-verify` | `x-api-key` | - | `email` | Bebas (Tanpa Token) |
| **POST** | `/user/forgot-password` | `x-api-key` | - | `email` | Bebas (Tanpa Token) |
| **POST** | `/user/reset-password` | `x-api-key` | - | `token`, `password` | Bebas (Tanpa Token) |
| **POST** | `/user/refresh` | `x-api-key` | - | `refreshToken` | Bebas (Tanpa Token) |
| **POST** | `/user/logout` | `x-api-key` | - | `refreshToken` | Bebas (Tanpa Token) |
| **GET** | `/user/me` | `x-api-key`, `Authorization` | - | - | `umkm`, `investor` |
| **GET** | `/user/profile` | `x-api-key`, `Authorization` | - | - | `umkm`, `investor` |
| **PUT** | `/user/profile` | `x-api-key`, `Authorization` | - | `fullname`, `phone`, `address`, `avatar` (opsional) | `umkm`, `investor` |
| **GET** | `/user/profile/investor` | `x-api-key`, `Authorization` | - | - | `investor` |
| **POST** | `/user/profile/bank-accounts` | `x-api-key`, `Authorization` | - | `bank_name`, `account_number`, `account_holder_name` | `investor` |
| **GET** | `/user/profile/bank-accounts` | `x-api-key`, `Authorization` | - | - | `investor` |
| **DELETE** | `/user/profile/bank-accounts/:id`| `x-api-key`, `Authorization` | Path: `id` | - | `investor` |
| **PUT** | `/user/profile/bank-accounts/:id/primary` | `x-api-key`, `Authorization` | Path: `id` | - | `investor` |
| **GET** | `/user/users` | `x-api-key`, `Authorization` | - | - | `admin`, `superadmin` |
| **GET** | `/user/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `umkm`, `investor` |

### 2. Modul Bisnis UMKM (`/api/v1/businesses`)

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/businesses/preview` | `x-api-key` | - | - | Bebas (Tanpa Token) |
| **GET** | `/businesses/ml` | `x-api-key` | - | - | Bebas (Tanpa Token) |
| **GET** | `/businesses/` | `x-api-key`, `Authorization` | - | - | `umkm`, `investor`, `admin`, `superadmin` |
| **GET** | `/businesses/all` | `x-api-key`, `Authorization` | - | - | `admin`, `superadmin` |
| **GET** | `/businesses/user` | `x-api-key`, `Authorization` | - | - | `umkm` |
| **POST** | `/businesses/` | `x-api-key`, `Authorization` | - | `nama_bisnis`, `deskripsi`, `kategori`, `lokasi` | `umkm` |
| **GET** | `/businesses/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `umkm`, `admin`, `superadmin` |
| **PUT** | `/businesses/:id` | `x-api-key`, `Authorization` | Path: `id` | `nama_bisnis`, `deskripsi`, `kategori`, `lokasi` | `umkm` |
| **DELETE** | `/businesses/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `umkm`, `superadmin` |
| **POST** | `/businesses/:id/profile` | `x-api-key`, `Authorization` | Path: `id` | `omset_bulanan`, `karyawan`, `tahun_berdiri`, dll. | `umkm` |
| **GET** | `/businesses/:id/profile` | `x-api-key`, `Authorization` | Path: `id` | - | `umkm`, `admin`, `superadmin` |
| **GET** | `/businesses/covers` | `x-api-key`, `Authorization` | - | - | `umkm` |
| **POST** | `/businesses/covers` | `x-api-key`, `Authorization` | - | Form-Data: `image` (file) | `umkm` |
| **PATCH** | `/businesses/covers/reorder` | `x-api-key`, `Authorization` | - | `order` (array of cover IDs & sequence) | `umkm` |
| **DELETE** | `/businesses/covers/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `umkm` |
| **GET** | `/businesses/documents` | `x-api-key`, `Authorization` | - | - | `umkm` |
| **POST** | `/businesses/documents` | `x-api-key`, `Authorization` | - | Form-Data: `files` (array file dokumen) | `umkm` |
| **GET** | `/businesses/documents/pending` | `x-api-key`, `Authorization` | - | - | `admin`, `superadmin` |
| **PATCH**| `/businesses/documents/:id/review` | `x-api-key`, `Authorization` | Path: `id` | `status` (approved / rejected), `keterangan` | `admin`, `superadmin` |
| **PATCH**| `/businesses/documents/:bisnis_id/verify` | `x-api-key`, `Authorization` | Path: `bisnis_id` | `status_verifikasi` (true / false) | `admin`, `superadmin` |

### 3. Modul Pengajuan Pendanaan (`/api/v1/businesses/proposals`)

*Modul ini terdaftar pada sub-rute bisnis.*

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/businesses/proposals` | `x-api-key`, `Authorization` | - | - | `umkm`, `investor`, `admin`, `superadmin` |
| **POST** | `/businesses/proposals` | `x-api-key`, `Authorization` | - | `target_dana`, `tenor_bulan`, `bagi_hasil_persen` | `umkm` |
| **GET** | `/businesses/proposals/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `umkm`, `investor`, `admin`, `superadmin` |
| **PUT** | `/businesses/proposals/:id` | `x-api-key`, `Authorization` | Path: `id` | `target_dana`, `tenor_bulan`, `bagi_hasil_persen` | `umkm`, `admin`, `superadmin` |
| **PUT** | `/businesses/proposals/:id/status` | `x-api-key`, `Authorization` | Path: `id` | `status` (approved / rejected), `keterangan` | `admin`, `superadmin` |
| **DELETE** | `/businesses/proposals/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `admin`, `superadmin` |

### 4. Modul Negosiasi (`/api/v1/businesses/proposals/negotiations`)

*Modul ini terdaftar di bawah sub-rute pengajuan.*

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/businesses/proposals/negotiations` | `x-api-key`, `Authorization` | - | - | `umkm`, `investor`, `admin`, `superadmin` |
| **GET** | `/businesses/proposals/negotiations/user` | `x-api-key`, `Authorization` | - | - | `umkm`, `investor` |
| **GET** | `/businesses/proposals/negotiations/:id` | `x-api-key`, `Authorization` | Path: `id` (pengajuan ID) | - | `umkm`, `investor`, `admin`, `superadmin` |
| **POST** | `/businesses/proposals/negotiations/start` | `x-api-key`, `Authorization` | - | `pengajuan_id`, `penawaran_bagi_hasil`, `pesan` | `investor` |
| **POST** | `/businesses/proposals/negotiations/reply/:id` | `x-api-key`, `Authorization` | Path: `id` (negosiasi ID) | `penawaran_bagi_hasil`, `pesan` | `umkm`, `investor` |
| **POST** | `/businesses/proposals/negotiations/accept/:id` | `x-api-key`, `Authorization` | Path: `id` (negosiasi ID) | - | `umkm`, `investor` |
| **POST** | `/businesses/proposals/negotiations/reject/:id` | `x-api-key`, `Authorization` | Path: `id` (negosiasi ID) | - | `umkm`, `investor` |

### 5. Modul Penjualan Proyek (`/api/v1/businesses/proposals/sales`)

*Modul ini mencatat laporan penjualan bisnis pasca pendanaan.*

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/businesses/proposals/sales` | `x-api-key`, `Authorization` | - | - | `admin`, `superadmin` |
| **POST** | `/businesses/proposals/sales` | `x-api-key`, `Authorization` | - | `pengajuan_id`, `total_penjualan`, `tanggal_laporan`, `dokumen_laporan` | `umkm` |
| **GET** | `/businesses/proposals/sales/sales-by-pengajuan/:pengajuans_id` | `x-api-key`, `Authorization` | Path: `pengajuans_id` | - | `umkm`, `investor`, `admin`, `superadmin` |
| **GET** | `/businesses/proposals/sales/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `umkm`, `investor`, `admin`, `superadmin` |
| **PUT** | `/businesses/proposals/sales/:id` | `x-api-key`, `Authorization` | Path: `id` | `total_penjualan`, `tanggal_laporan`, `dokumen_laporan` | `umkm` |

### 6. Modul Investasi (`/api/v1/investasi`)

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/investasi/` | `x-api-key`, `Authorization` | - | - | `admin`, `superadmin` |
| **GET** | `/investasi/investor` | `x-api-key`, `Authorization` | - | - | `investor` |
| **GET** | `/investasi/proposals` | `x-api-key`, `Authorization` | Query: `pengajuan_id` | - | `umkm`, `admin`, `superadmin` |
| **GET** | `/investasi/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `admin`, `superadmin` |

### 7. Modul Dompet Digital (`/api/v1/wallet`)

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/wallet/xendit-callback` | `x-api-key`, `x-callback-token` | - | Payload Callback Xendit (otomatis) | Bebas (Webhook Xendit) |
| **GET** | `/wallet/dashboard` | `x-api-key`, `Authorization` | - | - | `investor` |
| **POST** | `/wallet/topup` | `x-api-key`, `Authorization` | - | `amount` | `investor` |
| **POST** | `/wallet/withdraw` | `x-api-key`, `Authorization` | - | `amount`, `bank_code`, `account_number`, `account_name` | `investor` |
| **POST** | `/wallet/pay-invoice/:invoice_id` | `x-api-key`, `Authorization` | Path: `invoice_id` | - | `investor` |
| **POST** | `/wallet/mock-topup` | `x-api-key`, `Authorization` | - | `amount`, `external_id` | `investor` |
| **GET** | `/wallet/withdrawals` | `x-api-key`, `Authorization` | - | - | `admin`, `superadmin` |
| **PUT** | `/wallet/withdrawals/:id/status` | `x-api-key`, `Authorization` | Path: `id` | `status` (approved / rejected), `keterangan` | `admin`, `superadmin` |

### 8. Modul Invoices (`/api/v1/invoices`)

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/invoices` | `x-api-key`, `Authorization` | - | - | `admin`, `superadmin` |
| **GET** | `/invoices/investor` | `x-api-key`, `Authorization` | - | - | `investor` |
| **GET** | `/invoices/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `umkm`, `investor`, `admin`, `superadmin` |
| **PUT** | `/invoices/:id/pay` | `x-api-key`, `Authorization` | Path: `id` | `payment_method` | `investor` |

### 9. Modul Kelas/Kategori Investasi (`/api/v1/businesses/classes`)

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/businesses/classes` | `x-api-key`, `Authorization` | - | - | `umkm`, `investor`, `admin`, `superadmin` |
| **POST** | `/businesses/classes` | `x-api-key`, `Authorization` | - | `nama_kelas`, `deskripsi`, `minimal_investasi` | `admin`, `superadmin` |
| **GET** | `/businesses/classes/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `umkm`, `investor`, `admin`, `superadmin` |
| **PUT** | `/businesses/classes/:id` | `x-api-key`, `Authorization` | Path: `id` | `nama_kelas`, `deskripsi`, `minimal_investasi` | `admin`, `superadmin` |
| **DELETE** | `/businesses/classes/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `admin`, `superadmin` |

### 10. Modul Distribusi Profit (`/api/v1/profit-distributions`)

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/profit-distributions/` | `x-api-key`, `Authorization` | - | - | `investor`, `admin`, `superadmin` |
| **GET** | `/profit-distributions/sales` | `x-api-key`, `Authorization` | Query: `penjualan_id` | - | `umkm`, `investor`, `admin`, `superadmin` |
| **GET** | `/profit-distributions/investor` | `x-api-key`, `Authorization` | - | - | `investor` |
| **GET** | `/profit-distributions/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `umkm`, `investor`, `admin`, `superadmin` |
| **PUT** | `/profit-distributions/:id/status` | `x-api-key`, `Authorization` | Path: `id` | `status` (distributed / pending) | `admin`, `superadmin` |

### 11. Modul Preferensi dan Rekomendasi Investor (`/api/v1/user/investor`)

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/user/investor/compare` | `x-api-key` | Query: `ids` (contoh: `?ids=1,2,3`) | - | Bebas (Tanpa Token) |
| **POST** | `/user/investor/preferences` | `x-api-key`, `Authorization` | - | `risk_tolerance`, `expected_return`, `investment_horizon`, `preferred_sectors` (array) | `investor` |
| **GET** | `/user/investor/preferences` | `x-api-key`, `Authorization` | - | - | `investor` |
| **GET** | `/user/investor/recommendations` | `x-api-key`, `Authorization` | - | - | `investor` |
| **POST** | `/user/investor/preferences/refresh` | `x-api-key`, `Authorization` | - | - | `investor` |
| **POST** | `/user/investor/bookmarks` | `x-api-key`, `Authorization` | - | `bisnis_id` | `investor` |
| **GET** | `/user/investor/bookmarks` | `x-api-key`, `Authorization` | - | - | `investor` |
| **GET** | `/user/investor/bookmarks/:bisnis_id` | `x-api-key`, `Authorization` | Path: `bisnis_id` | - | `investor` |
| **DELETE**| `/user/investor/bookmarks/:bisnis_id` | `x-api-key`, `Authorization` | Path: `bisnis_id` | - | `investor` |

### 12. Modul Konsol Admin (`/api/v1/admin`)

| Metode | Endpoint | Headers Wajib | Parameter (Query/Path) | Body Request | Otorisasi (Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/admin/login` | `x-api-key` | - | `email`, `password` | Bebas (Tanpa Token) |
| **POST** | `/admin/refresh` | `x-api-key` | - | `refreshToken` | Bebas (Tanpa Token) |
| **POST** | `/admin/logout` | `x-api-key` | - | `refreshToken` | Bebas (Tanpa Token) |
| **GET** | `/admin/me` | `x-api-key`, `Authorization` | - | - | `admin`, `superadmin` |
| **GET** | `/admin/` | `x-api-key`, `Authorization` | - | - | `admin`, `superadmin` |
| **POST** | `/admin/` | `x-api-key`, `Authorization` | - | `email`, `password`, `fullname`, `role` | `superadmin` |
| **GET** | `/admin/banks` | `x-api-key`, `Authorization` | - | - | `admin`, `superadmin` |
| **POST** | `/admin/banks` | `x-api-key`, `Authorization` | - | `bank_name`, `bank_code`, `is_active` | `admin`, `superadmin` |
| **PUT** | `/admin/banks/:id` | `x-api-key`, `Authorization` | Path: `id` | `bank_name`, `bank_code`, `is_active` | `admin`, `superadmin` |
| **DELETE**| `/admin/banks/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `admin`, `superadmin` |
| **GET** | `/admin/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `admin`, `superadmin` |
| **PUT** | `/admin/:id` | `x-api-key`, `Authorization` | Path: `id` | `fullname`, `email` | `superadmin` |
| **DELETE**| `/admin/:id` | `x-api-key`, `Authorization` | Path: `id` | - | `superadmin` |


---

## Tautan Model Machine Learning

Sistem rekomendasi pada platform FundRaise ditenagai oleh model Machine Learning yang memproses preferensi investasi investor untuk mencocokkan peluang investasi UMKM yang relevan.

- **Tautan Repositori Model ML**: Anda dapat mengakses repositori Data Science dan Machine Learning di [github.com/kelpstones/fund-ds](https://github.com/kelpstones/fund-ds).
- **Prosedur Mengunduh (Download) Model**:
  1. Kunjungi rilis repositori atau direktori penyimpanan model di [fund-ds](https://github.com/kelpstones/fund-ds).
  2. Unduh file model serialisasi (misalnya file biner model `.pkl`).
- **Prosedur Memuat (Load) dan Menjalankan Service Model**:
  1. Unduh proyek server API untuk AI di [github.com/kelpstones/fund-ai](https://github.com/kelpstones/fund-ai).
  2. Ikuti instruksi setup environment Python dan jalankan pemasangan dependensi melalui `pip install -r requirements.txt`.
  3. Letakkan file model yang telah diunduh pada folder penyimpanan model di server AI tersebut.
  4. Jalankan server FastAPI menggunakan Uvicorn (secara default berjalan pada `http://localhost:8000`).
  5. Konfigurasikan variabel `ML_MODEL_URL` di dalam file `.env` proyek backend ini ke alamat `http://localhost:8000` agar backend dapat terintegrasi untuk memuat rekomendasi secara realtime.

---

## Cara Menjalankan Aplikasi

Layanan ini dapat dijalankan menggunakan Docker atau secara manual pada mesin lokal.

### Persyaratan Sistem
- Node.js (versi 18 ke atas) atau Docker Desktop
- PostgreSQL (jika dijalankan tanpa Docker)
- Redis (jika dijalankan tanpa Docker)

---

### Metode 1: Menggunakan Docker Compose (Direkomendasikan)

Docker Compose akan secara otomatis mengonfigurasi dan menjalankan container Express API, PostgreSQL, dan Redis tanpa memerlukan instalasi database lokal.

1. Pastikan file `.env` sudah dikonfigurasi (silakan salin dari `.env.example`).
2. Jalankan perintah berikut pada direktori utama proyek:
   ```bash
   docker-compose up -d --build
   ```
3. Docker Compose akan memvalidasi kesiapan database PostgreSQL, menjalankan migrasi database, memuat data seeder secara otomatis, lalu memulai server Node.js pada port yang telah ditentukan (Default: `5000`).
4. Untuk menghentikan layanan container:
   ```bash
   docker-compose down
   ```

---

### Metode 2: Instalasi Manual

Jika Anda ingin menjalankan layanan secara lokal tanpa Docker:

1. Unduh repositori ini dan masuk ke direktori proyek.
2. Instal dependensi npm:
   ```bash
   npm install
   ```
3. Konfigurasi Environment:
   Salin `.env.example` menjadi `.env` dan sesuaikan nilainya dengan konfigurasi PostgreSQL, Redis, dan SMTP lokal Anda:
   ```bash
   cp .env.example .env
   ```
4. Jalankan Migrasi dan Seeding Database:
   ```bash
   # Menjalankan migrasi skema database
   npx knex migrate:latest

   # Memuat data awal (seed) ke database
   npx knex seed:run
   ```
5. Jalankan Aplikasi dalam Mode Pengembangan:
   ```bash
   npm run dev
   ```
   Server akan berjalan melalui Nodemon pada alamat: `http://localhost:5000`

---

## Pengujian (Testing)

Aplikasi ini menggunakan Jest sebagai test runner dan Supertest untuk pengujian endpoint HTTP secara end-to-end (E2E).

Untuk menjalankan pengujian:
```bash
# Menjalankan seluruh test suite (Unit & Integration) secara berurutan
npm run test

# Menjalankan test unit saja
npm run test:unit

# Menjalankan test integrasi saja
npm run test:integration

# Menjalankan test dengan laporan cakupan kode (Code Coverage)
npm run test:coverage
```

---

## Tim Pengembang

Berikut adalah daftar anggota tim pengembangan proyek ini:
- **CFCC009D6Y2535 - Muhamad Danendra Prawiraamijoyo** — *Full-Stack Web Developer*
- **CFCC009D6Y0777 - Azra Hudaya** — *Full-Stack Web Developer*
- **CACC009D6Y0708 - Aldi Kurnia Fadillah** — *AI Engineer*
- **CDCC676D6Y2392 - Andika Ardiansyah** — *Data Scientist*
- **CDCC009D6Y0748 - Adam Kevin** — *Data Scientist*
- **CACC009D6Y0718 - Yazid Hilmi Allamsyah** — *AI Engineer*

---

## Lisensi

Aplikasi ini dilisensikan di bawah lisensi **ISC**. Hak cipta dilindungi undang-undang.


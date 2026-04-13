# Fund-BE (Capstone Project)

Backend API untuk aplikasi pendanaan berbasis Node.js, Express, dan PostgreSQL. Mendukung autentikasi JWT, manajemen user, bisnis, dan pengajuan.

## Fitur Utama
- **Autentikasi & Registrasi User** (JWT)
- **Manajemen User** (CRUD, role-based)
- **Manajemen Bisnis** (CRUD, validasi token)
- **Pengajuan** (CRUD)
- **Middleware API Key & Auth**
- **Validasi Input (Joi)**
- **Migration & Seed Database (Knex)**

## Struktur Folder
```
├── src/
│   ├── app.js              # Entry point aplikasi
│   ├── config/             # Konfigurasi database
│   ├── controllers/        # Logic endpoint
│   ├── middlewares/        # Middleware (auth, key)
│   ├── migrations/         # File migrasi database
│   ├── models/             # Model database
│   ├── routes/             # Routing API
│   ├── seeds/              # Seeder database
│   ├── utils/              # Helper (JWT, bcrypt, response)
│   └── validation/         # Validasi input
├── knexfile.js             # Konfigurasi Knex
├── package.json            # Dependency & script
```

## Instalasi
1. Clone repo ini
2. Install dependency:
   ```bash
   npm install
   ```
3. Copy `.env.example` ke `.env` dan isi konfigurasi database & JWT
4. Jalankan migrasi & seeder:
   ```bash
   npx knex migrate:latest
   npx knex seed:run
   ```
5. Jalankan server:
   ```bash
   npm run dev
   ```

## Contoh Endpoint
- `POST /api/v1/user/register` — Register user
- `POST /api/v1/user/login` — Login user
- `GET /api/v1/user/bisnis` — List bisnis (dengan token)

## Kontribusi
Pull request & issue sangat terbuka!

## Lisensi
MIT

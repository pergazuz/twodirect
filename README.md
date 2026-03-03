# twodirect

**ค้นหาสินค้า → ตรงไปหยิบ | Search Product → Go Direct**

> หาของเจอ ตรงถึงร้าน ไม่เสียเวลา — The smartest way to find products at stores near you.

## 🎯 About

twodirect is a product location finder platform that helps users find specific products across retail chain branches (starting with 7-Eleven) in Thailand. Users can search for products by name or image and discover which nearby branches have them in stock.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Leaflet.js |
| **Backend** | Rust, Axum |
| **Database** | Supabase (PostgreSQL) |
| **Maps** | OpenStreetMap (MVP), Google Maps (Production) |

## 📁 Project Structure

```
twodirect/
├── web/                  # Next.js frontend
│   ├── src/
│   │   ├── app/         # App router pages
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities & API client
│   │   └── types/       # TypeScript types
│   └── package.json
├── backend/              # Rust API server
│   ├── src/
│   │   ├── handlers/    # API route handlers
│   │   ├── models/      # Data models
│   │   └── db/          # Supabase client
│   ├── Cargo.toml
│   └── supabase_*.sql   # Database schema & seed
└── note/                 # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Supabase account (or local PostgreSQL)

### 1. Setup Supabase

1. Create a new Supabase project
2. Run `backend/supabase_schema.sql` in SQL Editor
3. Run `backend/supabase_seed.sql` to add mock data

### 2. Start Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
cargo run
```

Backend runs at `http://localhost:8080`

### 3. Start Frontend

```bash
cd web
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

## 📱 Features (MVP)

- ✅ Product search by name (Thai & English)
- ✅ Branch-level inventory visibility
- ✅ Distance calculation from user location
- ✅ Interactive map with branch markers
- ✅ Navigation to selected branch
- ✅ Exclusive twodirect promotions display

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List all products |
| GET | `/api/products/search?query=...&lat=...&lng=...` | Search products |
| GET | `/api/branches` | List all branches |
| GET | `/api/branches/:id` | Get branch by ID |
| GET | `/api/promotions` | List all promotions |

## 🎨 Demo Mode

The frontend includes mock data for demonstration without backend connection. Simply run the frontend and search for products like:
- โค้ก ซีโร่
- มาม่า
- ออลคาเฟ่
- ข้าวมันไก่

## 📄 License

MIT © 2026 twodirect


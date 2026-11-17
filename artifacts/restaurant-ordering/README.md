# 🍝 Restaurant Ordering System

A clean, ready-to-deploy online ordering system for restaurants with **separate Customer and Admin interfaces**.

- **Customer side**: Browse menu, add to cart, place pickup orders
- **Admin side**: Manage menu items, view & update order status in real time

Built with Node.js, Express, SQLite (file-based – zero external services required).

---

## Features

### Customer
- Beautiful responsive menu with categories
- Cart with quantity controls (persisted in localStorage)
- Simple checkout (name + phone + optional notes)
- Instant order confirmation with order number

### Admin
- Secure login (JWT)
- Dashboard with order stats
- Filter orders by status
- One-click status progression: Pending → Preparing → Ready → Completed
- Full menu CRUD (add / edit / enable-disable / delete items)
- Auto-refresh of orders every 15 seconds

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/restaurant-ordering.git
cd restaurant-ordering
npm install
```

### 2. Run

```bash
npm start
```

Open:
- **Customer**: http://localhost:3000
- **Admin**:    http://localhost:3000/admin

**Default admin login**
- Username: `admin`
- Password: `admin123`

> Change these in production via environment variables (see below).

---

## Environment Variables (optional)

Create a `.env` file in the root:

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password
```

---

## Project Structure

```
restaurant-ordering/
├── server.js              # Express API + static file server
├── package.json
├── data/                  # SQLite database (auto-created)
│   └── restaurant.db
├── public/
│   ├── index.html         # Customer frontend
│   ├── admin.html         # Admin frontend
│   ├── css/style.css
│   └── js/
│       ├── customer.js
│       └── admin.js
└── README.md
```

---

## Deploy to GitHub + Free Hosting

### Option A – Render.com (recommended)

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → New → Web Service.
3. Connect your GitHub repo.
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables (`JWT_SECRET`, `ADMIN_PASSWORD`, etc.).
6. Deploy. Your site will be live at `https://your-app.onrender.com`.

> Note: Free tier disks are ephemeral. The SQLite file will reset on redeploy. For production persistence use a paid plan with disk or switch to PostgreSQL / Turso / Supabase.

### Option B – Railway.app

1. Push to GitHub.
2. New Project → Deploy from GitHub.
3. Railway detects Node automatically.
4. Add the same environment variables.
5. Done.

### Option C – Local / VPS

```bash
npm install
npm start
# or use PM2: pm2 start server.js --name restaurant
```

---

## API Overview

| Method | Endpoint                  | Auth   | Description                  |
|--------|---------------------------|--------|------------------------------|
| GET    | `/api/menu`               | No     | List available menu items    |
| POST   | `/api/orders`             | No     | Place a new order            |
| GET    | `/api/orders/:id`         | No     | Get order status             |
| POST   | `/api/admin/login`        | No     | Admin login → JWT            |
| GET    | `/api/admin/orders`       | Admin  | List / filter orders         |
| PATCH  | `/api/admin/orders/:id`   | Admin  | Update order status          |
| GET    | `/api/admin/menu`         | Admin  | Full menu (incl. disabled)   |
| POST   | `/api/admin/menu`         | Admin  | Create menu item             |
| PUT    | `/api/admin/menu/:id`     | Admin  | Update menu item             |
| DELETE | `/api/admin/menu/:id`     | Admin  | Delete menu item             |

---

## Customization Tips

- Change restaurant name/logo in `public/index.html` and `public/admin.html`.
- Edit seed menu items in `server.js` (the `seed` array).
- Add real images by putting files in `public/images/` and setting `image_url` on items.
- For production, replace SQLite with PostgreSQL (easy with `pg` + a few query changes) or use Turso/LibSQL for a hosted SQLite-compatible DB.

---

## License

MIT – free to use and modify for your restaurant or projects.

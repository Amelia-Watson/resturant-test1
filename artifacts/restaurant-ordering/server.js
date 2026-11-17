require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'restaurant-secret-change-me-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // change in production!

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Database setup
const dbPath = path.join(dataDir, 'restaurant.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    available INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_notes TEXT,
    items TEXT NOT NULL, -- JSON array
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, preparing, ready, completed, cancelled
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed menu if empty
const count = db.prepare('SELECT COUNT(*) as c FROM menu_items').get().c;
if (count === 0) {
  const seed = [
    { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella & basil', price: 12.99, category: 'Pizza', image_url: '' },
    { name: 'Pepperoni Pizza', description: 'Loaded with pepperoni and cheese', price: 14.99, category: 'Pizza', image_url: '' },
    { name: 'Caesar Salad', description: 'Romaine, croutons, parmesan, Caesar dressing', price: 8.50, category: 'Salads', image_url: '' },
    { name: 'Garlic Bread', description: 'Toasted with garlic butter & herbs', price: 4.99, category: 'Sides', image_url: '' },
    { name: 'Spaghetti Bolognese', description: 'Rich meat sauce over al dente pasta', price: 13.50, category: 'Pasta', image_url: '' },
    { name: 'Chicken Alfredo', description: 'Creamy Alfredo with grilled chicken', price: 15.99, category: 'Pasta', image_url: '' },
    { name: 'Chocolate Brownie', description: 'Warm brownie with vanilla ice cream', price: 6.50, category: 'Desserts', image_url: '' },
    { name: 'Soft Drink', description: 'Coke, Sprite or Fanta', price: 2.50, category: 'Drinks', image_url: '' },
    { name: 'Fresh Lemonade', description: 'House-made lemonade', price: 3.50, category: 'Drinks', image_url: '' },
    { name: 'Tiramisu', description: 'Classic Italian dessert', price: 7.00, category: 'Desserts', image_url: '' },
  ];
  const insert = db.prepare('INSERT INTO menu_items (id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)');
  for (const item of seed) {
    insert.run(uuidv4(), item.name, item.description, item.price, item.category, item.image_url);
  }
  console.log('Seeded sample menu items');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware for admin
function authAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error('Not admin');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ========== PUBLIC API ==========

// Get full menu (available items only for customers)
app.get('/api/menu', (req, res) => {
  const items = db.prepare('SELECT * FROM menu_items WHERE available = 1 ORDER BY category, name').all();
  res.json(items);
});

// Get all menu (admin can see unavailable too)
app.get('/api/admin/menu', authAdmin, (req, res) => {
  const items = db.prepare('SELECT * FROM menu_items ORDER BY category, name').all();
  res.json(items);
});

// Place order (customer)
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_phone, customer_notes, items } = req.body;
  if (!customer_name || !customer_phone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate items and calculate total
  let total = 0;
  const validatedItems = [];
  for (const cartItem of items) {
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND available = 1').get(cartItem.id);
    if (!menuItem) {
      return res.status(400).json({ error: `Item not available: ${cartItem.id}` });
    }
    const qty = Math.max(1, parseInt(cartItem.quantity) || 1);
    total += menuItem.price * qty;
    validatedItems.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: qty
    });
  }

  const orderId = uuidv4().slice(0, 8).toUpperCase();
  db.prepare(`
    INSERT INTO orders (id, customer_name, customer_phone, customer_notes, items, total, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(orderId, customer_name, customer_phone, customer_notes || '', JSON.stringify(validatedItems), total);

  res.status(201).json({
    id: orderId,
    total,
    status: 'pending',
    message: 'Order placed successfully!'
  });
});

// Get order status (customer can check by ID)
app.get('/api/orders/:id', (req, res) => {
  const order = db.prepare('SELECT id, customer_name, total, status, created_at, items FROM orders WHERE id = ?').get(req.params.id.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.items = JSON.parse(order.items);
  res.json(order);
});

// ========== ADMIN API ==========

// Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, username });
});

// Get all orders
app.get('/api/admin/orders', authAdmin, (req, res) => {
  const status = req.query.status;
  let orders;
  if (status) {
    orders = db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC').all(status);
  } else {
    orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  }
  orders = orders.map(o => ({ ...o, items: JSON.parse(o.items) }));
  res.json(orders);
});

// Update order status
app.patch('/api/admin/orders/:id', authAdmin, (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const result = db.prepare(`
    UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?
  `).run(status, req.params.id.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, status });
});

// Create menu item
app.post('/api/admin/menu', authAdmin, (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  if (!name || price == null || !category) {
    return res.status(400).json({ error: 'Name, price and category required' });
  }
  const id = uuidv4();
  db.prepare(`
    INSERT INTO menu_items (id, name, description, price, category, image_url, available)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(id, name, description || '', parseFloat(price), category, image_url || '');
  res.status(201).json({ id, name, description, price: parseFloat(price), category, available: 1 });
});

// Update menu item
app.put('/api/admin/menu/:id', authAdmin, (req, res) => {
  const { name, description, price, category, image_url, available } = req.body;
  const result = db.prepare(`
    UPDATE menu_items 
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category = COALESCE(?, category),
        image_url = COALESCE(?, image_url),
        available = COALESCE(?, available)
    WHERE id = ?
  `).run(name, description, price != null ? parseFloat(price) : null, category, image_url, available != null ? (available ? 1 : 0) : null, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  res.json(item);
});

// Delete menu item
app.delete('/api/admin/menu/:id', authAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true });
});

// Serve frontends
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start
app.listen(PORT, () => {
  console.log(`\n🍕 Restaurant Ordering System running at http://localhost:${PORT}`);
  console.log(`   Customer: http://localhost:${PORT}`);
  console.log(`   Admin:    http://localhost:${PORT}/admin`);
  console.log(`   Default login → username: ${ADMIN_USERNAME}  password: ${ADMIN_PASSWORD}\n`);
});

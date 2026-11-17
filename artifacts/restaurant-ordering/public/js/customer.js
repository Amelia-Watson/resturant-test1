const API = '';

let menu = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let currentCategory = 'All';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---------- UI helpers ----------
function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  $('#cartCount').textContent = count;

  const container = $('#cartItems');
  if (cart.length === 0) {
    container.innerHTML = '<div class="empty"><div class="icon">🛒</div>Your cart is empty</div>';
    $('#checkoutBtn').style.display = 'none';
    $('#checkoutSection').style.display = 'none';
    $('#cartTotal').textContent = '$0.00';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    total += item.price * item.quantity;
    return `
      <div class="cart-item">
        <div class="info">
          <div class="name">${item.name}</div>
          <div class="meta">$${item.price.toFixed(2)} × ${item.quantity}</div>
        </div>
        <div class="qty-control">
          <button onclick="changeQty('${item.id}', -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `;
  }).join('');

  $('#cartTotal').textContent = '$' + total.toFixed(2);
  $('#checkoutBtn').style.display = 'block';
  localStorage.setItem('cart', JSON.stringify(cart));
}

function openCart() {
  $('#overlay').classList.add('open');
  $('#cartDrawer').classList.add('open');
  $('#checkoutSection').style.display = 'none';
  $('#checkoutBtn').style.display = cart.length ? 'block' : 'none';
}

function closeCart() {
  $('#overlay').classList.remove('open');
  $('#cartDrawer').classList.remove('open');
}

// ---------- Cart logic ----------
function addToCart(id) {
  const item = menu.find(m => m.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(c => c.id !== id);
  updateCartUI();
}

// ---------- Menu rendering ----------
function renderCategories() {
  const cats = ['All', ...new Set(menu.map(m => m.category))];
  $('#categories').innerHTML = cats.map(c =>
    `<button class="cat-btn ${c === currentCategory ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');

  $$('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.cat;
      renderCategories();
      renderMenu();
    });
  });
}

function renderMenu() {
  const filtered = currentCategory === 'All'
    ? menu
    : menu.filter(m => m.category === currentCategory);

  if (filtered.length === 0) {
    $('#menuGrid').innerHTML = '<div class="empty">No items in this category</div>';
    return;
  }

  const emoji = {
    Pizza: '🍕', Pasta: '🍝', Salads: '🥗', Sides: '🥖',
    Desserts: '🍰', Drinks: '🥤'
  };

  $('#menuGrid').innerHTML = filtered.map(item => `
    <div class="menu-card">
      <div class="img-placeholder">${emoji[item.category] || '🍽️'}</div>
      <div class="body">
        <h3>${item.name}</h3>
        <p class="desc">${item.description || ''}</p>
        <div class="actions">
          <span class="price">$${item.price.toFixed(2)}</span>
          <button class="btn btn-primary btn-sm" onclick="addToCart('${item.id}')">Add</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ---------- Place order ----------
async function placeOrder() {
  const name = $('#customerName').value.trim();
  const phone = $('#customerPhone').value.trim();
  const notes = $('#customerNotes').value.trim();

  if (!name || !phone) {
    alert('Please enter your name and phone number');
    return;
  }
  if (cart.length === 0) return;

  const btn = $('#placeOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Placing…';

  try {
    const res = await fetch(API + '/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: name,
        customer_phone: phone,
        customer_notes: notes,
        items: cart.map(c => ({ id: c.id, quantity: c.quantity }))
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');

    // Success
    cart = [];
    localStorage.removeItem('cart');
    updateCartUI();
    closeCart();
    $('#orderIdDisplay').textContent = data.id;
    $('#successModal').classList.add('open');
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
}

// ---------- Init ----------
async function init() {
  try {
    const res = await fetch(API + '/api/menu');
    menu = await res.json();
    renderCategories();
    renderMenu();
    updateCartUI();
  } catch (err) {
    $('#menuGrid').innerHTML = '<div class="empty">Failed to load menu. Is the server running?</div>';
  }

  $('#openCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  $('#overlay').addEventListener('click', closeCart);

  $('#checkoutBtn').addEventListener('click', () => {
    $('#checkoutBtn').style.display = 'none';
    $('#checkoutSection').style.display = 'block';
  });

  $('#placeOrderBtn').addEventListener('click', placeOrder);
  $('#closeModal').addEventListener('click', () => {
    $('#successModal').classList.remove('open');
  });
}

init();

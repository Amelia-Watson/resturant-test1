const API = '';
let token = localStorage.getItem('adminToken') || '';
let currentFilter = '';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  };
}

// ---------- Auth ----------
async function login() {
  const username = $('#loginUser').value.trim();
  const password = $('#loginPass').value;
  const errEl = $('#loginError');
  errEl.style.display = 'none';

  try {
    const res = await fetch(API + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    token = data.token;
    localStorage.setItem('adminToken', token);
    showDashboard();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
}

function logout() {
  token = '';
  localStorage.removeItem('adminToken');
  $('#loginPage').style.display = 'flex';
  $('#dashboard').style.display = 'none';
}

function showDashboard() {
  $('#loginPage').style.display = 'none';
  $('#dashboard').style.display = 'flex';
  loadOrders();
  loadMenu();
}

// ---------- Orders ----------
async function loadOrders() {
  try {
    const url = currentFilter
      ? `${API}/api/admin/orders?status=${currentFilter}`
      : `${API}/api/admin/orders`;
    const res = await fetch(url, { headers: authHeaders() });
    if (res.status === 401) return logout();
    const orders = await res.json();

    // Stats (from all orders ideally, but for simplicity use filtered + fetch all for counts)
    updateStats(orders);

    const tbody = $('#ordersBody');
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty">No orders found</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const itemsStr = o.items.map(i => `${i.quantity}× ${i.name}`).join(', ');
      const time = new Date(o.created_at + 'Z').toLocaleString();
      const nextActions = getNextActions(o.status, o.id);
      return `
        <tr>
          <td><strong>${o.id}</strong></td>
          <td>
            ${o.customer_name}<br>
            <small style="color:var(--muted)">${o.customer_phone}</small>
            ${o.customer_notes ? `<br><small style="color:var(--muted)">📝 ${o.customer_notes}</small>` : ''}
          </td>
          <td style="max-width:220px;font-size:0.9rem;">${itemsStr}</td>
          <td><strong>$${o.total.toFixed(2)}</strong></td>
          <td><span class="badge badge-${o.status}">${o.status}</span></td>
          <td style="font-size:0.85rem;white-space:nowrap;">${time}</td>
          <td>${nextActions}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
  }
}

function updateStats(orders) {
  // Simple counts from current list (good enough for demo)
  const counts = { pending: 0, preparing: 0, ready: 0, completed: 0 };
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  $('#stats').innerHTML = `
    <div class="stat-card"><div class="num" style="color:#ca8a04">${counts.pending}</div><div class="label">Pending</div></div>
    <div class="stat-card"><div class="num" style="color:#2563eb">${counts.preparing}</div><div class="label">Preparing</div></div>
    <div class="stat-card"><div class="num" style="color:#16a34a">${counts.ready}</div><div class="label">Ready</div></div>
    <div class="stat-card"><div class="num">${counts.completed}</div><div class="label">Completed</div></div>
  `;
}

function getNextActions(status, id) {
  const map = {
    pending:   [['preparing', 'Start Preparing', 'btn-primary']],
    preparing: [['ready', 'Mark Ready', 'btn-success']],
    ready:     [['completed', 'Complete', 'btn-outline']],
    completed: [],
    cancelled: []
  };
  const actions = map[status] || [];
  let html = actions.map(([s, label, cls]) =>
    `<button class="btn ${cls} btn-sm" onclick="updateStatus('${id}','${s}')">${label}</button>`
  ).join(' ');
  if (status === 'pending' || status === 'preparing') {
    html += ` <button class="btn btn-danger btn-sm" onclick="updateStatus('${id}','cancelled')">Cancel</button>`;
  }
  return html || '—';
}

async function updateStatus(id, status) {
  try {
    const res = await fetch(`${API}/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    if (res.status === 401) return logout();
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed');
      return;
    }
    loadOrders();
  } catch (err) {
    alert('Error updating status');
  }
}

// ---------- Menu management ----------
async function loadMenu() {
  try {
    const res = await fetch(API + '/api/admin/menu', { headers: authHeaders() });
    if (res.status === 401) return logout();
    const items = await res.json();

    const tbody = $('#menuBody');
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty">No menu items</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td>
          <strong>${item.name}</strong>
          ${item.description ? `<br><small style="color:var(--muted)">${item.description}</small>` : ''}
        </td>
        <td>${item.category}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>
          <span class="badge ${item.available ? 'badge-ready' : 'badge-cancelled'}">
            ${item.available ? 'Yes' : 'No'}
          </span>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick='editItem(${JSON.stringify(item)})'>Edit</button>
          <button class="btn btn-outline btn-sm" onclick="toggleAvail('${item.id}', ${item.available ? 0 : 1})">
            ${item.available ? 'Disable' : 'Enable'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')">Del</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

function openMenuModal(item = null) {
  $('#menuModalTitle').textContent = item ? 'Edit Menu Item' : 'Add Menu Item';
  $('#editId').value = item ? item.id : '';
  $('#itemName').value = item ? item.name : '';
  $('#itemDesc').value = item ? (item.description || '') : '';
  $('#itemPrice').value = item ? item.price : '';
  $('#itemCategory').value = item ? item.category : '';
  $('#menuModal').classList.add('open');
}

function closeMenuModal() {
  $('#menuModal').classList.remove('open');
}

function editItem(item) {
  openMenuModal(item);
}

async function saveItem() {
  const id = $('#editId').value;
  const body = {
    name: $('#itemName').value.trim(),
    description: $('#itemDesc').value.trim(),
    price: parseFloat($('#itemPrice').value),
    category: $('#itemCategory').value.trim()
  };

  if (!body.name || isNaN(body.price) || !body.category) {
    alert('Name, price and category are required');
    return;
  }

  try {
    const url = id ? `${API}/api/admin/menu/${id}` : `${API}/api/admin/menu`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    if (res.status === 401) return logout();
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed');
      return;
    }
    closeMenuModal();
    loadMenu();
  } catch (err) {
    alert('Error saving item');
  }
}

async function toggleAvail(id, available) {
  try {
    const res = await fetch(`${API}/api/admin/menu/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ available })
    });
    if (res.status === 401) return logout();
    loadMenu();
  } catch (err) {
    alert('Error updating availability');
  }
}

async function deleteItem(id) {
  if (!confirm('Delete this menu item?')) return;
  try {
    const res = await fetch(`${API}/api/admin/menu/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (res.status === 401) return logout();
    loadMenu();
  } catch (err) {
    alert('Error deleting');
  }
}

// ---------- Navigation & Init ----------
function switchView(view) {
  $$('.sidebar nav a[data-view]').forEach(a => a.classList.remove('active'));
  $(`.sidebar nav a[data-view="${view}"]`).classList.add('active');
  $('#ordersView').style.display = view === 'orders' ? 'block' : 'none';
  $('#menuView').style.display = view === 'menu' ? 'block' : 'none';
  if (view === 'orders') loadOrders();
  if (view === 'menu') loadMenu();
}

function init() {
  if (token) {
    // Verify token still valid by trying to load
    showDashboard();
  }

  $('#loginBtn').addEventListener('click', login);
  $('#loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

  $('#logoutBtn').addEventListener('click', (e) => { e.preventDefault(); logout(); });

  $$('.sidebar nav a[data-view]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(a.dataset.view);
    });
  });

  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.status;
      loadOrders();
    });
  });

  $('#addItemBtn').addEventListener('click', () => openMenuModal());
  $('#saveItemBtn').addEventListener('click', saveItem);
  $('#cancelItemBtn').addEventListener('click', closeMenuModal);

  // Auto-refresh orders every 15s
  setInterval(() => {
    if (token && $('#ordersView').style.display !== 'none') loadOrders();
  }, 15000);
}

init();

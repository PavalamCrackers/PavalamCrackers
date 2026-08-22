// ====================
// Pavalam Crackers - Inventory Cart
// Cookie-backed cart + drawer UI + PDF checkout + WhatsApp handoff
// ====================

const CART_COOKIE = 'pc_cart';
const CUSTOMER_COOKIE = 'pc_customer_info';
const CART_COOKIE_DAYS = 30;
const WHATSAPP_NUMBER = '919025086159';

let drawerOpen = false;
let productsPromise = null;
let toastTimer = null;

// ====================
// COOKIE HELPERS
// ====================
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// ====================
// CUSTOMER INFO (name, phone, address) - cookie only, never sent to a server
// ====================
function loadCustomerInfo() {
  try {
    const raw = getCookie(CUSTOMER_COOKIE);
    return raw ? JSON.parse(raw) : { name: '', phone: '', address: '' };
  } catch (e) {
    return { name: '', phone: '', address: '' };
  }
}

function saveCustomerInfo(info) {
  setCookie(CUSTOMER_COOKIE, JSON.stringify(info), CART_COOKIE_DAYS);
}

function readCustomerFormFields() {
  return {
    name: document.getElementById('custName')?.value.trim() || '',
    phone: document.getElementById('custPhone')?.value.trim() || '',
    address: document.getElementById('custAddress')?.value.trim() || ''
  };
}

// ====================
// PRODUCT DATA (shared fetch, cached)
// ====================
function fetchProducts() {
  if (!productsPromise) {
    productsPromise = fetch('data/products.json').then(res => {
      if (!res.ok) throw new Error('Failed to load products');
      return res.json();
    });
  }
  return productsPromise;
}

// ====================
// CART STATE
// ====================
const Cart = {
  items: [], // [{ id, qty }]

  load() {
    try {
      const raw = getCookie(CART_COOKIE);
      this.items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.items = [];
    }
  },

  save() {
    setCookie(CART_COOKIE, JSON.stringify(this.items), CART_COOKIE_DAYS);
    renderBadge();
    if (drawerOpen) renderDrawer();
    if (typeof updateOfbCartStats === 'function') updateOfbCartStats();
  },

  add(id, qty) {
    qty = Math.min(99, Math.max(1, parseInt(qty, 10) || 1));
    const existing = this.items.find(i => i.id === id);
    if (existing) {
      existing.qty = Math.min(99, existing.qty + qty);
    } else {
      this.items.push({ id, qty });
    }
    this.save();
  },

  updateQty(id, qty) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.min(99, Math.max(1, parseInt(qty, 10) || 1));
    this.save();
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  clear() {
    this.items = [];
    this.save();
  },

  getRaw() {
    return this.items;
  },

  getCount() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  async getItemsWithDetails() {
    const products = await fetchProducts();
    return this.items
      .map(i => {
        const p = products.find(p => p.id === i.id);
        return p ? { ...p, qty: i.qty } : null;
      })
      .filter(Boolean);
  }
};

// ====================
// UI CONSTRUCTION
// ====================
function buildCartUI() {
  // Floating cart button (added into the existing floating-social stack)
  const fabBtn = document.createElement('button');
  fabBtn.type = 'button';
  fabBtn.id = 'cartFabBtn';
  fabBtn.className = 'cart-fab-btn';
  fabBtn.setAttribute('aria-label', 'View your inventory list');
  fabBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
    <span class="cart-badge" id="cartBadge" hidden>0</span>
  `;
  const socialContainer = document.querySelector('.floating-social');
  if (socialContainer) {
    socialContainer.prepend(fabBtn);
  } else {
    fabBtn.classList.add('cart-fab-standalone');
    document.body.appendChild(fabBtn);
  }

  // Overlay + drawer
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cartOverlay';

  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.id = 'cartDrawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `
    <div class="cart-drawer-header">
      <h3>🧨 Your Inventory List</h3>
      <button type="button" class="cart-drawer-close" id="cartDrawerClose" aria-label="Close">&times;</button>
    </div>
    <div class="cart-customer-form">
      <h4>Your Details</h4>
      <p class="cart-customer-note">Used only to prepare your order — kept as a cookie in this browser, never stored in any database.</p>
      <div class="cart-customer-field">
        <label for="custName">Name</label>
        <input type="text" id="custName" placeholder="Your full name" autocomplete="name">
      </div>
      <div class="cart-customer-field">
        <label for="custPhone">Phone</label>
        <input type="tel" id="custPhone" placeholder="Your phone number" autocomplete="tel">
      </div>
      <div class="cart-customer-field">
        <label for="custAddress">Address</label>
        <textarea id="custAddress" rows="2" placeholder="Delivery address" autocomplete="street-address"></textarea>
      </div>
    </div>
    <div class="cart-drawer-body" id="cartDrawerBody"></div>
    <div class="cart-drawer-footer">
      <div class="cart-drawer-total">
        <span>Estimated Total</span>
        <strong id="cartDrawerTotal">₹0.00</strong>
      </div>
      <p class="cart-drawer-note">Prices shown are estimates. Items marked "Price on request" aren't included in the total — final rate will be confirmed on WhatsApp.</p>
      <div class="cart-drawer-actions">
        <button type="button" class="cart-clear-btn" id="cartClearBtn">Clear All</button>
        <button type="button" class="cart-checkout-btn" id="cartCheckoutBtn">Checkout &amp; Download PDF</button>
      </div>
    </div>
  `;

  // Toast
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.id = 'cartToast';

  // WhatsApp handoff modal
  const waOverlay = document.createElement('div');
  waOverlay.className = 'whatsapp-order-overlay';
  waOverlay.id = 'waOverlay';

  const waModal = document.createElement('div');
  waModal.className = 'whatsapp-order-modal';
  waModal.id = 'waModal';
  waModal.setAttribute('role', 'dialog');
  waModal.setAttribute('aria-modal', 'true');
  waModal.innerHTML = `
    <button type="button" class="wa-modal-close" id="waModalClose" aria-label="Close">&times;</button>
    <div class="wa-modal-icon">✅</div>
    <h3>Order List Downloaded!</h3>
    <p>Your order list has been saved as a PDF to your device.</p>
    <p>To place your order, please send that PDF to <strong>Pavalam Crackers</strong> on WhatsApp.</p>
    <div class="wa-modal-number">📱 +91 90250 86159</div>
    <a href="#" target="_blank" rel="noopener" id="waOpenBtn" class="wa-modal-btn">Open WhatsApp Chat</a>
    <p class="wa-modal-hint">In WhatsApp, tap the 📎 attach icon and choose the PDF from your Downloads before sending.</p>
  `;

  document.body.append(overlay, drawer, toast, waOverlay, waModal);

  const savedInfo = loadCustomerInfo();
  document.getElementById('custName').value = savedInfo.name;
  document.getElementById('custPhone').value = savedInfo.phone;
  document.getElementById('custAddress').value = savedInfo.address;

  ['custName', 'custPhone', 'custAddress'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      saveCustomerInfo(readCustomerFormFields());
    });
  });
}

// ====================
// RENDERING
// ====================
function renderBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = Cart.getCount();
  badge.textContent = count;
  badge.hidden = count === 0;
}

async function renderDrawer() {
  const body = document.getElementById('cartDrawerBody');
  const totalEl = document.getElementById('cartDrawerTotal');
  if (!body || !totalEl) return;

  const items = await Cart.getItemsWithDetails();

  if (!items.length) {
    body.innerHTML = '<p class="cart-empty">Your inventory list is empty.<br>Browse products and add items you like!</p>';
    totalEl.textContent = '₹0.00';
    return;
  }

  let total = 0;
  body.innerHTML = items.map(p => {
    const lineTotal = p.price > 0 ? p.price * p.qty : 0;
    total += lineTotal;
    return `
      <div class="cart-drawer-item" data-id="${p.id}">
        <div class="cart-item-info">
          <h4>${p.name}</h4>
          <span class="cart-item-price">${p.price > 0 ? '₹' + p.price.toFixed(2) + ' / unit' : 'Price on request'}</span>
        </div>
        <div class="cart-item-controls">
          <div class="qty-stepper">
            <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">−</button>
            <input type="number" class="qty-input" value="${p.qty}" min="1" max="99" aria-label="Quantity">
            <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
          </div>
          <span class="cart-item-subtotal">${p.price > 0 ? '₹' + lineTotal.toFixed(2) : '—'}</span>
          <button type="button" class="cart-item-remove" aria-label="Remove ${p.name}">🗑</button>
        </div>
      </div>
    `;
  }).join('');

  totalEl.textContent = '₹' + total.toFixed(2);
}

// ====================
// DRAWER OPEN/CLOSE
// ====================
function openDrawer() {
  drawerOpen = true;
  document.getElementById('cartDrawer')?.classList.add('active');
  document.getElementById('cartOverlay')?.classList.add('active');
  document.getElementById('cartDrawer')?.setAttribute('aria-hidden', 'false');
  renderDrawer();
}

function closeDrawer() {
  drawerOpen = false;
  document.getElementById('cartDrawer')?.classList.remove('active');
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.getElementById('cartDrawer')?.setAttribute('aria-hidden', 'true');
}

// ====================
// TOAST
// ====================
function showToast(message) {
  const toast = document.getElementById('cartToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('active');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('active'), 2200);
}

// ====================
// WHATSAPP MODAL
// ====================
function openWhatsAppModal() {
  const waOpenBtn = document.getElementById('waOpenBtn');
  if (waOpenBtn) {
    waOpenBtn.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  }
  document.getElementById('waOverlay')?.classList.add('active');
  document.getElementById('waModal')?.classList.add('active');
}

function closeWhatsAppModal() {
  document.getElementById('waOverlay')?.classList.remove('active');
  document.getElementById('waModal')?.classList.remove('active');
}

// ====================
// CHECKOUT / PDF GENERATION
// ====================
async function handleCheckout() {
  const items = await Cart.getItemsWithDetails();
  if (!items.length) {
    showToast('Your list is empty — add some crackers first!');
    return;
  }

  const info = readCustomerFormFields();
  if (!info.name || !info.phone || !info.address) {
    showToast('Please fill in your name, phone and address first');
    const firstEmptyId = !info.name ? 'custName' : !info.phone ? 'custPhone' : 'custAddress';
    document.getElementById(firstEmptyId)?.focus();
    return;
  }
  saveCustomerInfo(info);

  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  const originalLabel = checkoutBtn ? checkoutBtn.textContent : '';
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Preparing PDF…';
  }

  try {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('PDF library not available');
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const orderDate = new Date();
    const orderRef = 'PC-' + orderDate.getTime().toString().slice(-8);

    doc.setFontSize(18);
    doc.setTextColor(230, 81, 0);
    doc.text('Pavalam Crackers & Traders', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Door no : 261, 3C6, Sengamalanatchiyapuram Road, Thiruthangal, Tamil Nadu 626130', 14, 25);
    doc.text('Phone: +91 98765 43210  |  WhatsApp: +91 90250 86159', 14, 30);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Order Reference: ${orderRef}`, 14, 40);
    doc.text(`Date: ${orderDate.toLocaleString('en-IN')}`, 14, 46);

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    let cursorY = 54;
    doc.text(`Customer: ${info.name}`, 14, cursorY);
    cursorY += 6;
    doc.text(`Contact: ${info.phone}`, 14, cursorY);
    cursorY += 6;
    const addressLines = doc.splitTextToSize(`Address: ${info.address}`, 180);
    doc.text(addressLines, 14, cursorY);
    cursorY += addressLines.length * 6;

    let grandTotal = 0;
    const rows = items.map(p => {
      const lineTotal = p.price > 0 ? p.price * p.qty : 0;
      grandTotal += lineTotal;
      return [
        p.name,
        String(p.qty),
        p.price > 0 ? `Rs. ${p.price.toFixed(2)}` : 'On Request',
        p.price > 0 ? `Rs. ${lineTotal.toFixed(2)}` : '-'
      ];
    });

    doc.autoTable({
      startY: cursorY + 6,
      head: [['Item', 'Qty', 'Unit Price', 'Line Total']],
      body: rows,
      headStyles: { fillColor: [230, 81, 0] },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setTextColor(230, 81, 0);
    doc.text(`Estimated Total: Rs. ${grandTotal.toFixed(2)}`, 14, finalY);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('* "On Request" items are not included in the total above; final rate will be confirmed via WhatsApp/phone.', 14, finalY + 8);
    doc.text('This is an order enquiry, not a payment receipt. Online sale of firecrackers is not permitted as per law.', 14, finalY + 14);
    doc.text('We will confirm availability, final pricing, and delivery after reviewing this list on WhatsApp.', 14, finalY + 20);

    const fileName = `Pavalam-Crackers-Order-${orderRef}.pdf`;

    doc.save(fileName);

    openWhatsAppModal();

    Cart.clear();
    closeDrawer();
  } catch (err) {
    console.error('Checkout failed:', err);
    showToast('Something went wrong generating the PDF. Please try again.');
  } finally {
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = originalLabel;
    }
  }
}

// ====================
// EVENT DELEGATION
// ====================
function setupCartEvents() {
  document.addEventListener('click', function(e) {
    // Quantity steppers (product card "add" controls AND drawer item controls)
    const plusBtn = e.target.closest('.qty-plus');
    const minusBtn = e.target.closest('.qty-minus');
    if (plusBtn || minusBtn) {
      const stepper = (plusBtn || minusBtn).closest('.qty-stepper');
      const input = stepper?.querySelector('.qty-input');
      if (!input) return;
      let val = parseInt(input.value, 10) || 1;
      val = plusBtn ? Math.min(99, val + 1) : Math.max(1, val - 1);
      input.value = val;

      const drawerItem = stepper.closest('.cart-drawer-item');
      if (drawerItem) {
        Cart.updateQty(Number(drawerItem.dataset.id), val);
      }
      return;
    }

    // Add to cart
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
      const wrapper = addBtn.closest('.cart-add-controls');
      const input = wrapper?.querySelector('.qty-input');
      const qty = input ? parseInt(input.value, 10) || 1 : 1;
      const id = Number(addBtn.dataset.id);
      Cart.add(id, qty);
      showToast('Added to your list ✓');

      addBtn.classList.add('added');
      const original = addBtn.textContent;
      addBtn.textContent = 'Added ✓';
      setTimeout(() => {
        addBtn.classList.remove('added');
        addBtn.textContent = original;
      }, 1200);

      if (input) input.value = 1;
      return;
    }

    // Remove item
    const removeBtn = e.target.closest('.cart-item-remove');
    if (removeBtn) {
      const item = removeBtn.closest('.cart-drawer-item');
      if (item) Cart.remove(Number(item.dataset.id));
      return;
    }

    // Open drawer
    if (e.target.closest('#cartFabBtn')) {
      openDrawer();
      return;
    }

    // Close drawer
    if (e.target.closest('#cartDrawerClose') || e.target.id === 'cartOverlay') {
      closeDrawer();
      return;
    }

    // Clear cart
    if (e.target.closest('#cartClearBtn')) {
      if (Cart.getRaw().length && confirm('Remove all items from your list?')) {
        Cart.clear();
      }
      return;
    }

    // Checkout
    if (e.target.closest('#cartCheckoutBtn')) {
      handleCheckout();
      return;
    }

    // Close WhatsApp modal
    if (e.target.closest('#waModalClose') || e.target.id === 'waOverlay') {
      closeWhatsAppModal();
      return;
    }
  });

  document.addEventListener('change', function(e) {
    if (!e.target.classList.contains('qty-input')) return;
    let val = Math.min(99, Math.max(1, parseInt(e.target.value, 10) || 1));
    e.target.value = val;

    const drawerItem = e.target.closest('.cart-drawer-item');
    if (drawerItem) {
      Cart.updateQty(Number(drawerItem.dataset.id), val);
    }
  });
}

// ====================
// INIT
// ====================
document.addEventListener('DOMContentLoaded', function() {
  Cart.load();
  buildCartUI();
  renderBadge();
  setupCartEvents();
  if (typeof updateOfbCartStats === 'function') updateOfbCartStats();
});

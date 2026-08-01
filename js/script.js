// ====================
// Pavalam Crackers JS
// ====================

// 1. HARDCODED FEATURED PRODUCTS (for index.html)
const featuredProducts = [
  {
    id: 1,
    name: "3 1/2 Lakshmi",
    category: "one-sound",
    image: "assets/one-sound-1.jpg",
    price: 15.00,
    discount: 0.00,
    description: "3 1/2 inch Lakshmi crackers, 1 packet"
  },
  {
    id: 8,
    name: "G. Chakkar Special (10 pcs)",
    category: "ground-chakkar",
    image: "assets/ground-chakkar-1.jpg",
    price: 100.00,
    discount: 0.00,
    description: "Ground Chakkar Special, 10 pieces per box"
  },
  {
    id: 14,
    name: "Flower Pots Big (10 pcs)",
    category: "flower-pots",
    image: "assets/flower-pots-1.jpg",
    price: 86.00,
    discount: 0.00,
    description: "Big Flower Pots, 10 pieces per box"
  },
  {
    id: 4,
    name: "Green Bomb (10 pcs)",
    category: "bomb",
    image: "assets/bomb-1.jpg",
    price: 120.00,
    discount: 0.00,
    description: "Green Bomb crackers, 10 pieces per box"
  }
];

// Category slug -> display label (used by the "All Products" toolbar)
const categoryLabels = {
  "one-sound": "One Sound Crackers & Bombs",
  "ground-chakkar": "Ground Chakkar / Spinners",
  "flower-pots": "Flower Pots / Color Pots",
  "bijili": "Bijili Vedi / Crackers",
  "twinkling-star": "Twinkling Star / Sattai",
  "holding-magics": "Holding Magics with Hands",
  "sky-shots": "Sky Shots",
  "mega-sky-shots": "Mega Sky Shots",
  "repeating-shots": "Repeating Multi Color Shots",
  "fancy-shots": "Mega SET OUT - Fancy Shots",
  "whistle-fountain": "Whistle Fountain Series",
  "kids-collection": "Kids Collection / Fountains",
  "colorful-night": "Eye Catching Colorful Night Crackers",
  "sparklers": "Sparklers Festival",
  "match-boxes": "Match Boxes",
  "gift-boxes": "Gift Boxes - Net Rate",
  "combo-packs": "Combo Festival Packs - Net Rate"
};

let cachedProducts = null;

// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initPromoCarousel();
  setupCommonUI();
  buildCookieConsentBanner();
  buildLegalNoticeModal();
  buildGoogleReviewPopup();

  // Check which page we're on
  if (document.getElementById('featuredProductsList')) {
    renderFeaturedProducts(featuredProducts);
  }

  if (document.getElementById('allProductsList')) {
    setupProductsToolbar();
    loadAndRenderAllProducts();
  }
});

// ====================
// CART CONTROLS MARKUP (used by cart.js's event delegation)
// ====================
function cartControlsHtml(productId) {
  return `
    <div class="cart-add-controls">
      <div class="qty-stepper">
        <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">−</button>
        <input type="number" class="qty-input" value="1" min="1" max="99" aria-label="Quantity">
        <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
      </div>
      <button type="button" class="add-to-cart-btn" data-id="${productId}">Add to Cart</button>
    </div>
  `;
}

// ====================
// PRODUCT DISPLAY FUNCTIONS
// ====================
async function loadAndRenderAllProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Failed to load products');
    const allProducts = await response.json();

    renderAllProductsList(allProducts);

    return allProducts;
  } catch (error) {
    console.error("Error loading products:", error);
    const allList = document.getElementById('allProductsList');
    if (allList) {
      allList.innerHTML = '<li class="empty-message">Unable to load products. Please try again later.</li>';
    }
    throw error;
  }
}

function renderFeaturedProducts(products) {
  const list = document.getElementById('featuredProductsList');
  if (!list) return;

  list.innerHTML = products.map(productListItemHtml).join('');
}

function productListItemHtml(product) {
  return `
    <li class="product-list-item" data-id="${product.id}">
      <div class="product-list-info">
        <h3>${product.name}</h3>
        <p class="product-list-desc">${product.description}</p>
      </div>
      <div class="product-list-price">${product.price > 0 ? `₹${product.price.toFixed(2)}` : 'Price on request'}</div>
      ${cartControlsHtml(product.id)}
    </li>
  `;
}

// ====================
// PRODUCTS PAGE - sort + category filter
// ====================
function populateCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  if (!select || select.dataset.populated) return;

  Object.entries(categoryLabels).forEach(([slug, label]) => {
    const option = document.createElement('option');
    option.value = slug;
    option.textContent = label;
    select.appendChild(option);
  });
  select.dataset.populated = '1';
}

// "Price on request" items (price 0) always sort last, regardless of direction
function comparePrice(a, b, direction) {
  if (a.price <= 0 && b.price <= 0) return 0;
  if (a.price <= 0) return 1;
  if (b.price <= 0) return -1;
  return direction === 'desc' ? b.price - a.price : a.price - b.price;
}

function renderAllProductsList(allProducts) {
  const allList = document.getElementById('allProductsList');
  const categorySelect = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortBySelect');
  if (!allList || !categorySelect || !sortSelect) return;

  cachedProducts = allProducts;

  const category = categorySelect.value;
  const sortMode = sortSelect.value;
  const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);

  if (sortMode === 'price-desc') {
    allList.innerHTML = [...filtered].sort((a, b) => comparePrice(a, b, 'desc')).map(productListItemHtml).join('');
  } else if (sortMode === 'price-asc') {
    allList.innerHTML = [...filtered].sort((a, b) => comparePrice(a, b, 'asc')).map(productListItemHtml).join('');
  } else if (sortMode === 'category') {
    const groups = {};
    filtered.forEach(p => {
      (groups[p.category] = groups[p.category] || []).push(p);
    });
    const orderedCats = Object.keys(groups).sort((a, b) =>
      (categoryLabels[a] || a).localeCompare(categoryLabels[b] || b)
    );
    allList.innerHTML = orderedCats.map(cat => `
      <li class="category-group-header">${categoryLabels[cat] || cat}</li>
      ${groups[cat].sort((a, b) => a.name.localeCompare(b.name)).map(productListItemHtml).join('')}
    `).join('');
  } else {
    allList.innerHTML = [...filtered].sort((a, b) => a.name.localeCompare(b.name)).map(productListItemHtml).join('');
  }
}

function setupProductsToolbar() {
  const categorySelect = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortBySelect');
  if (!categorySelect || !sortSelect) return;

  populateCategoryFilter();

  [categorySelect, sortSelect].forEach(select => {
    select.addEventListener('change', () => {
      if (cachedProducts) renderAllProductsList(cachedProducts);
    });
  });
}

// ====================
// LEGAL NOTICE POPUP (shown once per browser session)
// ====================
function buildLegalNoticeModal() {
  if (document.getElementById('legalNoticeModal')) return;

  const overlay = document.createElement('div');
  overlay.className = 'legal-notice-overlay';
  overlay.id = 'legalNoticeOverlay';

  const modal = document.createElement('div');
  modal.className = 'legal-notice-modal';
  modal.id = 'legalNoticeModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'legalNoticeTitle');
  modal.innerHTML = `
    <button type="button" class="legal-notice-x" id="legalNoticeClose" aria-label="Close">&times;</button>
    <div class="legal-notice-icon">⚖️</div>
    <h2 id="legalNoticeTitle">Supreme Court Guidelines (2018)</h2>
    <p>As per 2018 supreme court order, online sale of firecrackers are not permitted! We value our customers and at the same time, respect jurisdiction. We request you to add your products to the cart and submit the required crackers through the enquiry button. We will contact you within 24 hrs and confirm the order through WhatsApp or phone call.</p>
    <p>Please add and submit your enquiries and enjoy your Diwali with Pavalam Crackers &amp; Traders. Pavalam Crackers &amp; Traders as a company following 100% legal &amp; statutory compliances and all our shops, go-downs are maintained as per the explosive acts. We send the parcels through registered and legal transport service providers as like every other major companies in Sivakasi is doing so.</p>
    <div class="legal-notice-safety-banner">🛡️ Your safety is our priority</div>
    <button type="button" class="legal-notice-close-btn" id="legalNoticeAgree">I Understand</button>
  `;

  document.body.append(overlay, modal);

  function closeNotice() {
    overlay.classList.remove('active');
    modal.classList.remove('active');
    sessionStorage.setItem('pc_legal_notice_seen', '1');
    maybeShowCookieConsent();
  }

  overlay.addEventListener('click', closeNotice);
  document.getElementById('legalNoticeClose').addEventListener('click', closeNotice);
  document.getElementById('legalNoticeAgree').addEventListener('click', closeNotice);

  if (!sessionStorage.getItem('pc_legal_notice_seen')) {
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      modal.classList.add('active');
    });
  } else {
    maybeShowCookieConsent();
  }
}

// ====================
// COOKIE CONSENT BANNER (shown after the legal notice, once per device)
// ====================
function buildCookieConsentBanner() {
  if (document.getElementById('popupModal')) return;

  const banner = document.createElement('div');
  banner.className = 'popup-modal';
  banner.id = 'popupModal';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie notice');
  banner.innerHTML = `
    <div class="popup-content">
      <button type="button" class="popup-close" id="popupClose" aria-label="Close">&times;</button>
      <p>🍪 We use cookies to remember your cart and the name, phone and address you give us for an order — right here in your browser. This information is <strong>never stored in any database or sent to a server</strong>. See our <a href="terms.html" style="color:#fff; text-decoration:underline;">Terms &amp; Conditions</a> for details.</p>
      <button type="button" class="popup-btn" id="cookieAcceptBtn">Accept &amp; Continue</button>
    </div>
  `;

  document.body.appendChild(banner);

  function dismiss() {
    banner.classList.remove('active');
    localStorage.setItem('pc_cookie_consent', '1');
    positionGoogleReviewPopup();
  }

  document.getElementById('popupClose').addEventListener('click', dismiss);
  document.getElementById('cookieAcceptBtn').addEventListener('click', dismiss);

  window.addEventListener('resize', positionGoogleReviewPopup);
}

function maybeShowCookieConsent() {
  if (localStorage.getItem('pc_cookie_consent')) return;
  const banner = document.getElementById('popupModal');
  if (!banner) return;
  setTimeout(() => {
    banner.classList.add('active');
    positionGoogleReviewPopup();
  }, 300);
}

// Keep the review popup clear of the full-width cookie banner (both sit at the
// bottom of the screen; the banner has a much higher z-index).
function positionGoogleReviewPopup() {
  const popup = document.getElementById('googleReviewPopup');
  if (!popup) return;
  const banner = document.getElementById('popupModal');
  const bannerActive = banner && banner.classList.contains('active');
  const gap = window.innerWidth <= 768 ? 14 : 20;
  popup.style.bottom = (bannerActive ? banner.offsetHeight + gap : gap) + 'px';
}

// ====================
// GOOGLE REVIEW POPUP (bottom-left, small dismissible card)
// ====================
const GOOGLE_RATING = 5.0;
const GOOGLE_REVIEW_COUNT = '54';
const GOOGLE_REVIEW_URL = 'https://www.google.com/maps/place/Pavalam+Crackers+%26+Traders/@9.4874645,77.8017459,17z/data=!3m1!4b1!4m6!3m5!1s0x3b06cf1a8908bf1f:0xdbcc169e38a781e9!8m2!3d9.4874645!4d77.8017459!16s%2Fg%2F11lnw09k8w?entry=ttu&g_ep=EgoyMDI2MDcxNS4wIKXMDSoASAFQAw%3D%3D';
// Paste real quotes copied from the Pavalam Crackers Google Business listing here,
// e.g. { author: 'Name', text: 'Quote...' } — left empty until real reviews are supplied.
const GOOGLE_REVIEWS = [];

function buildGoogleReviewPopup() {
  if (document.getElementById('googleReviewPopup')) return;
  if (sessionStorage.getItem('pc_google_review_closed')) return;

  const fullStars = Math.round(GOOGLE_RATING);
  const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);

  const reviewsHtml = GOOGLE_REVIEWS.slice(0, 2).map(r => `
    <div class="google-review-snippet">
      <p>"${r.text}"</p>
      <span>— ${r.author}</span>
    </div>
  `).join('');

  const popup = document.createElement('div');
  popup.className = 'google-review-popup';
  popup.id = 'googleReviewPopup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-label', 'Google reviews');
  popup.innerHTML = `
    <button type="button" class="google-review-close" id="googleReviewClose" aria-label="Close">&times;</button>
    <svg class="google-logo" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
    <div class="google-review-rating">${GOOGLE_RATING.toFixed(1)}</div>
    <div class="google-review-stars">${stars}</div>
    <a href="${GOOGLE_REVIEW_URL}" target="_blank" rel="noopener">Read our ${GOOGLE_REVIEW_COUNT} reviews</a>
    ${reviewsHtml}
  `;

  document.body.appendChild(popup);

  requestAnimationFrame(() => {
    setTimeout(() => {
      positionGoogleReviewPopup();
      popup.classList.add('active');
    }, 800);
  });

  document.getElementById('googleReviewClose').addEventListener('click', () => {
    popup.classList.remove('active');
    sessionStorage.setItem('pc_google_review_closed', '1');
  });
}

// ====================
// UI COMPONENTS
// ====================
function setupCommonUI() {
  // Image Modal
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && e.target.closest('.product-card, .search-result-card')) {
      const modalImg = document.getElementById('modalImg');
      if (modalImg) {
        modalImg.src = e.target.src;
        document.getElementById('imageModal')?.classList.add('active');
      }
    }
  });

  // Modal Close
  document.querySelector('.modal-close')?.addEventListener('click', function() {
    document.getElementById('imageModal')?.classList.remove('active');
  });

  // Mobile menu toggle
  const hamburger = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
  }
}

// ====================
// PROMO CAROUSEL WITH SMOOTH SLIDE
// ====================
function initPromoCarousel() {
  const carousel = document.getElementById('promoCarousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.promo-slide');
  const prevBtn = carousel.querySelector('.promo-prev');
  const nextBtn = carousel.querySelector('.promo-next');
  let current = 0;
  let autoSlideInterval;

  if (!slides.length || !prevBtn || !nextBtn) return;

  function showSlide(nextIdx) {
    // Remove active class from all slides
    slides.forEach(slide => {
      slide.classList.remove('active');
    });
    
    // Add active class to the new slide
    slides[nextIdx].classList.add('active');
    current = nextIdx;
  }

  function nextSlide() {
    const nextIdx = (current + 1) % slides.length;
    showSlide(nextIdx);
  }

  function prevSlide() {
    const nextIdx = (current - 1 + slides.length) % slides.length;
    showSlide(nextIdx);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 5000);
  }

  // Event listeners for buttons
  nextBtn.addEventListener('click', function() {
    nextSlide();
    resetAutoSlide();
  });
  
  prevBtn.addEventListener('click', function() {
    prevSlide();
    resetAutoSlide();
  });

  // Start auto-sliding
  autoSlideInterval = setInterval(nextSlide, 5000);

  // Initialize first slide
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === 0) slide.classList.add('active');
  });
}

// ====================
// MOBILE MENU
// ====================
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
  }
}


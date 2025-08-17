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

// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initPromoCarousel();
  setupCommonUI();

  // Check which page we're on
  if (document.getElementById('productCarousel')) {
    renderFeaturedProducts(featuredProducts);
  }

  if (document.getElementById('oneSoundCarousel')) {
    loadAndRenderAllProducts();
  }
});

// ====================
// PRODUCT DISPLAY FUNCTIONS
// ====================
async function loadAndRenderAllProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Failed to load products');
    const allProducts = await response.json();

    renderAllCategoryProducts(allProducts);

    return allProducts;
  } catch (error) {
    console.error("Error loading products:", error);
    const carousels = document.querySelectorAll('.product-carousel');
    carousels.forEach(carousel => {
      carousel.innerHTML = '<p class="error-message">Unable to load products. Please try again later.</p>';
    });
    throw error;
  }
}

function renderFeaturedProducts(products) {
  const carousel = document.getElementById('productCarousel');
  if (!carousel) return;

  carousel.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy" 
           onerror="this.src='assets/placeholder.jpg'"/>
      <h3>${product.name}</h3>
      <div class="product-price">₹${product.price.toFixed(2)}</div>
      ${product.discount ? `<div class="product-discount">Save ₹${product.discount.toFixed(2)}</div>` : ''}
      <p>${product.description}</p>
    </div>
  `).join('');

  carousel.style.display = 'flex';
  carousel.style.opacity = '1';
}

function renderAllCategoryProducts(allProducts) {
  const categoryMap = {
    "one-sound": "oneSoundCarousel",
    "ground-chakkar": "groundChakkarCarousel",
    "flower-pots": "flowerPotsCarousel",
    "bijili": "bijiliPackCarousel",
    "twinkling-star": "twinklingStarCarousel", 
    "holding-magics": "holdingMagicsCarousel", 
    "sky-shots": "skyShotsCarousel", 
    "mega-sky-shots": "megaSkyShotCarousel",
    "repeating-shots": "repeatingShotsCarousel",
    "fancy-shots": "fancyShotsCarousel",
    "whistle-fountain": "whistleFountainCarousel",
    "kids-collection": "kidsCollectionCarousel",
    "colorful-night": "colorfulNightCarousel",
    "sparklers": "sparklersCarousel",
    "match-boxes": "matchBoxesCarousel",
    "gift-boxes": "giftBoxesCarousel",
    "combo-packs": "comboPacksCarousel"
  };

  for (const [category, carouselId] of Object.entries(categoryMap)) {
    const carousel = document.getElementById(carouselId);
    if (carousel) {
      const categoryProducts = allProducts.filter(p => p.category === category);

      if (categoryProducts.length === 0) {
        carousel.innerHTML = '<p class="empty-message">No products in this category yet.</p>';
        continue;
      }

      carousel.innerHTML = categoryProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
          <h3>${product.name}</h3>
          <div class="product-info">
            ${product.price > 0 ? `<div class="product-price">₹${product.price.toFixed(2)}</div>` : '<div class="product-price">Price on request</div>'}
          </div>
          <p class="product-description">${product.description}</p>
        </div>
      `).join('');
    }
  }
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

  // Popup Close
  document.getElementById('popupClose')?.addEventListener('click', function() {
    document.getElementById('popupModal')?.classList.remove('active');
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

  // Dropdown menus on mobile
  document.querySelectorAll('.dropdown > a').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        const dropdown = this.parentElement;
        dropdown.classList.toggle('active');

        document.querySelectorAll('.dropdown').forEach(otherDropdown => {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove('active');
          }
        });
      }
    });
  });
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


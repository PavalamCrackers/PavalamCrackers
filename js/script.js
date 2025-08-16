// ====================
// Pavalam Crackers JS
// ====================

// 1. HARDCODED FEATURED PRODUCTS (for index.html)
const featuredProducts = [
  {
    id: 1,
    name: "12 3/4\" Kurvi (10 Pkt)",
    category: "one-sound",
    image: "assets/iloveimg-converted/IMG_1206-Photoroom.png",
    price: 250.00,
    discount: 25.00,
    description: "Premium one sound crackers"
  },
  {
    id: 2,
    name: "G. Chakkar Special (10 pcs)",
    category: "ground-chakkar",
    image: "assets/ground-chakkar-1.jpg",
    price: 350.00,
    discount: 35.00,
    description: "Special ground chakkar crackers"
  },
  {
    id: 3,
    name: "Flower Pots Big (10 pcs)",
    category: "flower-pots",
    image: "assets/flower-pots-1.jpg",
    price: 450.00,
    discount: 45.00,
    description: "Beautiful flower pot fireworks"
  },
  {
    id: 4,
    name: "Green Bomb (10 pcs)",
    category: "bomb",
    image: "assets/bomb-1.jpg",
    price: 300.00,
    discount: 30.00,
    description: "Powerful green bomb crackers"
  }
];
// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initCarousel();
  
  // Check which page we're on
  if (document.getElementById('productCarousel')) {
    // On homepage (index.html) - use hardcoded featured products
    renderFeaturedProducts(featuredProducts);
  }
  
  if (document.getElementById('oneSoundCarousel')) {
    // On products page - load from JSON
    loadAndRenderAllProducts();
  }
  
  setupCommonUI();
});

// 3. PRODUCT DISPLAY FUNCTIONS
async function loadAndRenderAllProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Failed to load products');
    const allProducts = await response.json();
    
    console.log("Loaded products:", allProducts); // Debug log
    
    // Render all category products on products page
    renderAllCategoryProducts(allProducts);
    
    return allProducts;
  } catch (error) {
    console.error("Error loading products:", error);
    // Fallback: Show error message or empty state
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
    "bomb": "bombCarousel",
    "bijili-pack": "bijiliPackCarousel",
    "twinkling-star": "twirlingStarCarousel", // Note: Changed from "twirling-star" to match your JSON
    "kids-collection": "kidsZoneCarousel",    // Note: Changed from "kids-zone" to match your JSON
    "hold-on-hand": "holdOnHandCarousel",
    "colors-sky": "colorsSkyCarousel",
    "mega-sky-shot": "megaSkyShotCarousel",
    "repeating-shots": "repeatingShotsCarousel",
    "colorful-night": "colorfulNightCarousel",
    "whistle-fountain": "walaCarousel",       // Note: Changed from "wala" to match your JSON
    "sparklers": "sparklersCarousel",
    "match-boxes": "matchBoxesCarousel",
    "mega-set-out": "giftBoxesCarousel"      // Note: Changed from "gift-boxes" to match your JSON
  };

  for (const [category, carouselId] of Object.entries(categoryMap)) {
    const carousel = document.getElementById(carouselId);
    if (carousel) {
      const categoryProducts = allProducts.filter(p => p.category === category);
      console.log(`Rendering ${category} (${categoryProducts.length} products)`);
      
      if (categoryProducts.length === 0) {
        carousel.innerHTML = '<p class="empty-message">No products in this category yet.</p>';
        continue;
      }
      
      carousel.innerHTML = categoryProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
          <img src="assets/products/${product.id}.jpg" alt="${product.name}" loading="lazy" 
               onerror="this.src='assets/placeholder.jpg'"/>
          <h3>${product.name}</h3>
          <div class="product-info">
            ${product.price ? `<div class="product-price">₹${product.price.toFixed(2)}</div>` : '<div class="product-price">Price on request</div>'}
            ${product.unit ? `<div class="product-unit">${product.unit}</div>` : ''}
          </div>
          <button class="btn enquire-btn" data-id="${product.id}">Enquire Now</button>
        </div>
      `).join('');
    }
  }
}

// 4. UI COMPONENTS (rest of the code remains the same)
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

// 5. CAROUSEL FUNCTIONALITY (rest of the code remains the same)
function initCarousel() {
  const slider = document.getElementById('promoSlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.promo-slide');
  const dots = document.querySelectorAll('.scroll-indicator .dot');
  let currentIndex = 0;
  let interval;

  function updateSlider() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlider();
    resetInterval();
  }

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 5000);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateSlider();
      resetInterval();
    });
  });

  updateSlider();
  interval = setInterval(nextSlide, 5000);
}

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
function renderFeaturedProducts(products) {
  const carousel = document.getElementById('productCarousel');
  if (!carousel) {
    console.error('Product carousel element not found');
    return;
  }

  // Clear any loading state
  carousel.innerHTML = '';

  // Create product cards
  const productCards = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" loading="lazy" 
           onerror="this.src='assets/placeholder.jpg'"/>
      <h3>${product.name}</h3>
      <div class="product-price">₹${product.price.toFixed(2)}</div>
      ${product.discount ? `<div class="product-discount">Save ₹${product.discount.toFixed(2)}</div>` : ''}
      <p>${product.description}</p>
    </div>
  `).join('');

  // Insert into DOM
  carousel.innerHTML = productCards;
  
  // Make visible (if hidden by default)
  carousel.style.display = 'flex';
  carousel.style.opacity = '1';

  console.log('Featured products rendered:', products.length);
}
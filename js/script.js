// ====================
// Pavalam Crackers JS - Without Search Functionality
// ====================

// 1. HARDCODED FEATURED PRODUCTS (for home page)
const featuredProducts = [
  {
    id: 101,
    name: "12 3/4\" Kurvi (10 Pkt)",
    category: "one-sound",
    image: "assets/one-sound-1.jpg",
    price: 250.00,
    discount: 25.00,
    description: "Premium one sound crackers"
  },
  {
    id: 201,
    name: "G. Chakkar Special (10 pcs)",
    category: "ground-chakkar",
    image: "assets/ground-chakkar-1.jpg",
    price: 350.00,
    discount: 35.00,
    description: "Special ground chakkar crackers"
  },
  {
    id: 301,
    name: "Flower Pots Big (10 pcs)",
    category: "flower-pots",
    image: "assets/flower-pots-1.jpg",
    price: 450.00,
    discount: 45.00,
    description: "Beautiful flower pot fireworks"
  },
  {
    id: 401,
    name: "Green Bomb (10 pcs)",
    category: "bomb",
    image: "assets/bomb-1.jpg",
    price: 300.00,
    discount: 30.00,
    description: "Powerful green bomb crackers"
  }
];

// 2. MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
  // Always show featured products on home page
  renderFeaturedProducts();
  
  // Check if we're on products page
  if (document.getElementById('oneSoundCarousel')) {
    loadAndRenderAllProducts();
  }
  
  setupCommonUI();
});

// 3. HOME PAGE - FEATURED PRODUCTS
function renderFeaturedProducts() {
  const carousel = document.getElementById('productCarousel');
  if (!carousel) return;
  
  carousel.innerHTML = featuredProducts.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <div class="product-price">₹${product.price.toFixed(2)}</div>
      ${product.discount ? `<div class="product-discount">Discount: ₹${product.discount.toFixed(2)}</div>` : ''}
      <p>${product.description}</p>
      <button class="add-to-cart-btn">Add to Cart</button>
    </div>
  `).join('');
  
  carousel.style.display = 'flex';
  carousel.style.opacity = '1';
}

// 4. PRODUCTS PAGE - LOAD AND RENDER ALL PRODUCTS
async function loadAndRenderAllProducts() {
  try {
    const response = await fetch('data/products.json');
    const allProducts = await response.json();
    
    const categoryMap = {
      "one-sound": "oneSoundCarousel",
      "ground-chakkar": "groundChakkarCarousel",
      "flower-pots": "flowerPotsCarousel",
      "bomb": "bombCarousel",
      "bijili-pack": "bijiliPackCarousel",
      "twirling-star": "twirlingStarCarousel",
      "kids-zone": "kidsZoneCarousel",
      "kids-fountains": "kidsFountainsCarousel",
      "hold-on-hand": "holdOnHandCarousel",
      "colors-sky": "colorsSkyCarousel",
      "mega-sky-shot": "megaSkyShotCarousel",
      "repeating-shots": "repeatingShotsCarousel",
      "colorful-night": "colorfulNightCarousel",
      "wala": "walaCarousel",
      "sparklers": "sparklersCarousel",
      "match-boxes": "matchBoxesCarousel",
      "gift-boxes": "giftBoxesCarousel"
    };

    for (const [category, carouselId] of Object.entries(categoryMap)) {
      const carousel = document.getElementById(carouselId);
      if (carousel) {
        const categoryProducts = allProducts.filter(p => p.category === category);
        carousel.innerHTML = categoryProducts.map(product => `
          <div class="product-card">
            <img src="${product.image}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <div class="product-price">₹${product.price.toFixed(2)}</div>
            ${product.discount ? `<div class="product-discount">Discount: ₹${product.discount.toFixed(2)}</div>` : ''}
            <p>${product.description}</p>
            <button class="add-to-cart-btn">Add to Cart</button>
          </div>
        `).join('');
        
        carousel.style.display = 'flex';
        carousel.style.opacity = '1';
      }
    }
    
  } catch (error) {
    console.error("Failed to load products:", error);
    document.getElementById('oneSoundCarousel').innerHTML = 
      featuredProducts.map(createProductCard).join('');
  }
}

// 5. COMMON UI COMPONENTS
function setupCommonUI() {
  // Mobile menu toggle
  document.querySelector('.hamburger')?.addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
    this.classList.toggle('active');
  });
  
  // Image modal
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && e.target.closest('.product-card')) {
      const modalImg = document.getElementById('modalImg');
      modalImg.src = e.target.src;
      document.getElementById('imageModal').classList.add('active');
    }
  });
  
  document.querySelector('.modal-close')?.addEventListener('click', function() {
    document.getElementById('imageModal').classList.remove('active');
  });
  
  // Add to cart
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const product = e.target.closest('.product-card');
      alert(`Added ${product.querySelector('h3').textContent} to cart!`);
    }
  });
  
  // Update search form to use search page
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const term = document.getElementById('searchBar').value.trim();
      if (term) {
        window.location.href = `search.html?q=${encodeURIComponent(term)}`;
      }
    });
  }
}

function createProductCard(product) {
  return `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <div class="product-price">₹${product.price.toFixed(2)}</div>
      ${product.discount ? `<div class="product-discount">Discount: ₹${product.discount.toFixed(2)}</div>` : ''}
      <p>${product.description}</p>
      <button class="add-to-cart-btn">Add to Cart</button>
    </div>
  `;
}
function initCarousel() {
  const slider = document.getElementById('promoSlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.promo-slide');
  const dots = document.querySelectorAll('.scroll-indicator .dot');
  let currentIndex = 0;
  let interval;

  function updateSlider() {
    // Update slide positions
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update active dot
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlider();
    resetInterval();
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSlider();
    resetInterval();
  }

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  // Initialize
  updateSlider();
  interval = setInterval(nextSlide, 5000);
}

// Initialize the carousel when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  initCarousel();
});
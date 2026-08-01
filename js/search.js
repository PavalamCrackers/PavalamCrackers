document.addEventListener('DOMContentLoaded', function() {
  // Get search term from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q') || '';
  
  // Display search term
  const searchTermElement = document.getElementById('searchTerm');
  if (searchTermElement) {
    searchTermElement.textContent = searchTerm;
  }
  
  // Load products and perform search
  if (searchTerm) {
    loadAndSearchProducts(searchTerm);
  } else {
    showNoResultsMessage("Please enter a search term");
  }
  
  // Setup common UI elements
  setupCommonUI();
  
  // Update search form to use this page
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchInput = document.getElementById('searchBar');
      if (searchInput) {
        const term = searchInput.value.trim();
        if (term) {
          window.location.href = `search.html?q=${encodeURIComponent(term)}`;
        }
      }
    });
  }
});

async function loadAndSearchProducts(searchTerm) {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) {
      throw new Error('Failed to load products');
    }
    const allProducts = await response.json();
    
    // Filter products based on search term
    const results = allProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    displaySearchResults(results, searchTerm);
    
  } catch (error) {
    console.error("Failed to load products:", error);
    showNoResultsMessage("Error loading products. Please try again later.");
  }
}

function displaySearchResults(results, searchTerm) {
  const resultsContainer = document.getElementById('searchResults');
  const searchMeta = document.getElementById('searchMeta');
  
  if (!resultsContainer || !searchMeta) return;
  
  if (!results.length) {
    showNoResultsMessage(`No results found for: "${searchTerm}"`);
    return;
  }
  
  searchMeta.textContent = `Showing ${results.length} results for: "${searchTerm}"`;

  resultsContainer.innerHTML = results.map(product => `
    <li class="product-list-item" data-id="${product.id}">
      <div class="product-list-info">
        <h3>${product.name}</h3>
        <p class="product-list-desc">${product.description}</p>
      </div>
      <div class="product-list-price">${product.price > 0 ? '₹' + product.price.toFixed(2) : 'Price on request'}</div>
      <div class="cart-add-controls">
        <div class="qty-stepper">
          <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">−</button>
          <input type="number" class="qty-input" value="1" min="1" max="99" aria-label="Quantity">
          <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    </li>
  `).join('');
}

function showNoResultsMessage(message) {
  const resultsContainer = document.getElementById('searchResults');
  const searchMeta = document.getElementById('searchMeta');

  if (searchMeta) {
    searchMeta.textContent = message;
  }

  if (resultsContainer) {
    resultsContainer.innerHTML = `<li class="empty-message">${message}</li>`;
  }
}

function setupCommonUI() {
  // Mobile menu toggle
  const hamburger = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
  }
  
  // Image modal
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && e.target.closest('.product-card, .search-result-card')) {
      const modalImg = document.getElementById('modalImg');
      if (modalImg) {
        modalImg.src = e.target.src;
        document.getElementById('imageModal')?.classList.add('active');
      }
    }
  });
  
  const modalClose = document.querySelector('.modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', function() {
      document.getElementById('imageModal')?.classList.remove('active');
    });
  }
  
  // Pre-fill search bar with current term
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q') || '';
  const searchBar = document.getElementById('searchBar');
  if (searchBar) {
    searchBar.value = searchTerm;
  }
}
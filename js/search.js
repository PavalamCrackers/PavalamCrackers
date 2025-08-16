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
    <div class="search-result-card">
      <div class="search-result-img-container">
        <img src="${product.image}" class="search-result-img" alt="${product.name}">
      </div>
      <div class="search-result-content">
        <h3 class="search-result-title">${product.name}</h3>
        <div class="search-result-price">₹${product.price.toFixed(2)}</div>
        ${product.discount ? `<div class="product-discount">Save ₹${product.discount.toFixed(2)}</div>` : ''}
        <p class="search-result-description">${product.description}</p>
        <div class="search-result-footer">
          <span class="search-result-category">${product.category.replace(/-/g, ' ')}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function showNoResultsMessage(message) {
  const resultsContainer = document.getElementById('searchResults');
  const searchMeta = document.getElementById('searchMeta');
  
  if (searchMeta) {
    searchMeta.textContent = message;
  }
  
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        ${message}
      </div>
    `;
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
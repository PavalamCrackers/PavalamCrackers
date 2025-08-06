document.addEventListener('DOMContentLoaded', function() {
  // Get search term from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q') || '';
  
  // Display search term
  document.getElementById('searchTerm').textContent = searchTerm;
  
  // Load products and perform search
  loadAndSearchProducts(searchTerm);
  
  // Setup common UI elements
  setupCommonUI();
  
  // Update search form to use this page
  document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const term = document.getElementById('searchBar').value.trim();
    if (term) {
      window.location.href = `search.html?q=${encodeURIComponent(term)}`;
    }
  });
});

async function loadAndSearchProducts(searchTerm) {
  try {
    const response = await fetch('data/products.json');
    const allProducts = await response.json();
    
    // Filter products based on search term
    const results = searchTerm ? 
      allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ) : [];
    
    displaySearchResults(results, searchTerm);
    
  } catch (error) {
    console.error("Failed to load products:", error);
    document.getElementById('searchResults').innerHTML = `
      <div class="no-results">
        Error loading products. Please try again later.
      </div>
    `;
  }
}

function displaySearchResults(results, searchTerm) {
  const resultsContainer = document.getElementById('searchResults');
  const searchMeta = document.getElementById('searchMeta');
  
  if (!searchTerm) {
    searchMeta.textContent = "Please enter a search term";
    resultsContainer.innerHTML = '';
    return;
  }
  
  if (results.length === 0) {
    searchMeta.textContent = `No results found for: "${searchTerm}"`;
    resultsContainer.innerHTML = `
      <div class="no-results">
        No products matched your search. Try different keywords.
      </div>
    `;
    return;
  }
  
  searchMeta.textContent = `Showing ${results.length} results for: "${searchTerm}"`;
  
  resultsContainer.innerHTML = results.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <div class="product-price">₹${product.price.toFixed(2)}</div>
      ${product.discount ? `<div class="product-discount">Discount: ₹${product.discount.toFixed(2)}</div>` : ''}
      <p>${product.description}</p>
      <button class="add-to-cart-btn">Add to Cart</button>
    </div>
  `).join('');
}

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
  
  // Pre-fill search bar with current term
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q') || '';
  document.getElementById('searchBar').value = searchTerm;
}
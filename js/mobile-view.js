// Initialize mobile navigation
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');
  const headerSearch = document.querySelector('.header-search');
  
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      mainNav.classList.toggle('active');
      
      // Close search if open
      headerSearch.classList.remove('active');
    });
  }

  // Setup dropdown menus
  document.querySelectorAll('.dropdown > a').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        const dropdown = this.parentElement;
        dropdown.classList.toggle('active');
        
        // Close other dropdowns
        document.querySelectorAll('.dropdown').forEach(otherDropdown => {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove('active');
          }
        });
      }
    });
  });
}

// Update your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu(); // This should be first
  initCarousel();
  
  if (document.getElementById('productCarousel')) {
    renderFeaturedProducts(featuredProducts);
  }
  
  if (document.getElementById('oneSoundCarousel')) {
    loadAndRenderAllProducts();
  }
  
  setupCommonUI();
});
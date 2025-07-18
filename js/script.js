// ====================
// Pavalam Crackers JS
// ====================

// Product data (could be loaded from JSON)
const products = [
  {
    id: 1,
    name: "Flower Pot Deluxe",
    category: "Flower Pots",
    price: "₹120",
    desc: "Bright, colorful fountains for a sparkling Diwali night.",
    img: "images/flowerpot.jpg"
  },
  {
    id: 2,
    name: "Ground Chakkar Jumbo",
    category: "Ground Chakkars",
    price: "₹80",
    desc: "Spins with vibrant colors and long-lasting fun.",
    img: "images/chakkar.jpg"
  },
  {
    id: 3,
    name: "Rocket Thunder",
    category: "Rockets",
    price: "₹150",
    desc: "Soars high with a loud bang and a burst of color.",
    img: "images/rocket.jpg"
  },
  {
    id: 4,
    name: "Sparkler Gold",
    category: "Sparklers",
    price: "₹40",
    desc: "Safe, long-burning sparklers for all ages.",
    img: "images/sparkler.jpg"
  },
  {
    id: 5,
    name: "Atom Bomb Classic",
    category: "Atom Bombs",
    price: "₹200",
    desc: "The classic loud cracker for thrill seekers.",
    img: "images/atombomb.jpg"
  },
  {
    id: 6,
    name: "Kids Special Pack",
    category: "Kids Special",
    price: "₹180",
    desc: "A safe, fun combo for children.",
    img: "images/kidsspecial.jpg"
  },
  {
    id: 7,
    name: "Diwali Gift Box",
    category: "Gift Boxes",
    price: "₹500",
    desc: "A festive assortment for gifting and celebrations.",
    img: "images/giftbox.jpg"
  }
];

// ========== Dropdown Menu ==========

const navLinks = document.querySelector('.nav-links');
const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');
const hamburger = document.querySelector('.hamburger');

function handleDropdown(e) {
  if (window.innerWidth < 900) {
    e.preventDefault();
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
  }
}
if (dropdown) {
  dropdown.addEventListener('click', handleDropdown);
  dropdown.addEventListener('touchstart', handleDropdown);
}

// Hamburger menu for mobile
if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}

// ========== Hero Slider ==========

const slides = document.querySelectorAll('.hero-slide');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');
let currentSlide = 0;
let sliderInterval;

function showSlide(idx) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === idx);
  });
  currentSlide = idx;
}
function nextSlide() {
  showSlide((currentSlide + 1) % slides.length);
}
function prevSlide() {
  showSlide((currentSlide - 1 + slides.length) % slides.length);
}
function startSlider() {
  sliderInterval = setInterval(nextSlide, 4000);
}
function stopSlider() {
  clearInterval(sliderInterval);
}
if (slides.length) {
  showSlide(0);
  startSlider();
  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => { stopSlider(); nextSlide(); startSlider(); });
    prevBtn.addEventListener('click', () => { stopSlider(); prevSlide(); startSlider(); });
  }
  slides.forEach(slide => {
    slide.addEventListener('mouseenter', stopSlider);
    slide.addEventListener('mouseleave', startSlider);
  });
}

// ========== Product Grid & Search ==========

const productGrid = document.getElementById('productGrid');
const searchForm = document.getElementById('searchForm');
if (searchForm) {
  searchForm.addEventListener('submit', e => e.preventDefault());
}

function renderProducts(list) {
  if (!productGrid) return;
  productGrid.innerHTML = '';
  if (list.length === 0) {
    productGrid.innerHTML = '<p>No crackers found.</p>';
    return;
  }
  list.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}" data-img="${product.img}" />
      <h3>${product.name}</h3>
      <div class="product-price">${product.price}</div>
      <p>${product.desc}</p>
      <button class="add-to-cart-btn" data-name="${product.name}">Add to Cart</button>
    `;
    productGrid.appendChild(card);
  });
}
if (productGrid) renderProducts(products);

// Debounced search
let searchTimeout;
if (searchBar) {
  searchBar.addEventListener('input', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const val = searchBar.value.trim().toLowerCase();
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(val) ||
        p.category.toLowerCase().includes(val) ||
        p.desc.toLowerCase().includes(val)
      );
      renderProducts(filtered);
    }, 200);
  });
}

// ========== Add to Cart Alert ==========

if (productGrid) {
  productGrid.addEventListener('click', function (e) {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const name = e.target.getAttribute('data-name');
      alert(`"${name}" added to cart! (Demo only)`);
    }
  });
}

// ========== Modal/Lightbox for Product Images ==========

const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const modalClose = document.querySelector('.modal-close');

if (productGrid && modal && modalImg && modalClose) {
  productGrid.addEventListener('click', function (e) {
    if (e.target.tagName === 'IMG') {
      modalImg.src = e.target.getAttribute('data-img');
      modal.classList.add('active');
    }
  });
  modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
    modalImg.src = '';
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      modalImg.src = '';
    }
  });
}

// ========== Smooth Scroll for Nav Links ==========

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ========== Animate Product Cards on Entry ==========

function animateOnScroll() {
  const cards = document.querySelectorAll('.product-card');
  const trigger = window.innerHeight * 0.9;
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.top < trigger) {
      card.style.opacity = 1;
    }
  });
}
window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// ========== Newsletter Form (Demo) ==========

document.querySelectorAll('.footer-newsletter').forEach(form => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Thank you for subscribing!');
    form.reset();
  });
});

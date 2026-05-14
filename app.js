// ════════════════════════════════════════
// GLOBAL STATE
// ════════════════════════════════════════
let allProducts = [];
let activeFilter = 'All';
let activeTaste = 'All';

// ════════════════════════════════════════
// LOCALSTORAGE FAVORITES
// ════════════════════════════════════════

// Get favorites array from localStorage
function getFavorites() {
  const stored = localStorage.getItem('patisserie_favorites');
  return stored ? JSON.parse(stored) : [];
}

// Save favorites array to localStorage
function saveFavorites(arr) {
  localStorage.setItem('patisserie_favorites', JSON.stringify(arr));
}

// Check if a product ID is favorited
function isFavorited(id) {
  return getFavorites().includes(id);
}

// Toggle favorite status for a product ID
function toggleFavorite(id) {
  const favorites = getFavorites();
  const index = favorites.indexOf(id);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(id);
  }
  
  saveFavorites(favorites);
  updateFavoritesCounter();
  return !isFavorited(id);
}

// Update the favorites counter badge in navbar
function updateFavoritesCounter() {
  const count = getFavorites().length;
  document.getElementById('favoritesCount').textContent = count;
}

// ════════════════════════════════════════
// PRODUCT CARD CREATION
// ════════════════════════════════════════

// Create a single product card element
function createCard(product) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.setAttribute('data-id', product.id);
  article.setAttribute('data-category', product.category);

  const favorited = isFavorited(product.id);
  const heartIcon = favorited ? '♥' : '♡';
  const favoritedClass = favorited ? 'favorited' : '';
  
  article.innerHTML = `
    <img src="${product.image_url}" alt="${product.name}" class="card-image">
    <span class="card-badge">${product.category}</span>
    <span class="card-taste-badge">${product.taste}</span>
    <div class="card-content">
      <h3 class="card-title">${product.name}</h3>
      <p class="card-description">${product.description}</p>
      <div class="card-footer">
        <span class="card-price">${product.price.toFixed(2)} TND</span>
        <div class="card-actions">
          <button class="btn-favorite ${favoritedClass}" data-id="${product.id}">${heartIcon}</button>
          <button class="btn-order" data-id="${product.id}">Commander</button>
        </div>
      </div>
    </div>
  `;
  
  return article;
}

// ════════════════════════════════════════
// RENDER PRODUCTS
// ════════════════════════════════════════

// Render products array to the gallery grid
function renderProducts(productsArray) {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '';
  
  if (productsArray.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <div class="empty-state-icon">&#127856;</div>
      <p class="empty-state-text">Aucun produit trouvé dans cette catégorie</p>
    `;
    grid.appendChild(emptyState);
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  productsArray.forEach(product => {
    const card = createCard(product);
    fragment.appendChild(card);
  });
  
  grid.appendChild(fragment);
}

// ════════════════════════════════════════
// CATEGORY FILTERING
// ════════════════════════════════════════

// Get unique tastes for a category
function getTastesForCategory(category) {
  if (category === 'All') return [];
  
  const filtered = allProducts.filter(p => p.category === category);
  const tastes = [...new Set(filtered.map(p => p.taste))];
  return tastes.sort();
}

// Render taste filter buttons
function renderTasteFilters(category) {
  const tasteBar = document.getElementById('tasteFilterBar');
  
  if (category === 'All') {
    tasteBar.style.display = 'none';
    activeTaste = 'All';
    return;
  }
  
  const tastes = getTastesForCategory(category);
  
  if (tastes.length === 0) {
    tasteBar.style.display = 'none';
    return;
  }
  
  tasteBar.style.display = 'flex';
  tasteBar.innerHTML = '<button class="taste-btn active" data-taste="All">Tous les goûts</button>';
  
  tastes.forEach(taste => {
    const btn = document.createElement('button');
    btn.className = 'taste-btn';
    btn.setAttribute('data-taste', taste);
    btn.textContent = taste;
    tasteBar.appendChild(btn);
  });
  
  activeTaste = 'All';
}

// Apply category filter and re-render products
function applyFilter(category) {
  activeFilter = category;
  
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Render taste filters for this category
  renderTasteFilters(category);
  
  // Apply both filters
  applyBothFilters();
}

// Apply taste filter
function applyTasteFilter(taste) {
  activeTaste = taste;
  
  const buttons = document.querySelectorAll('.taste-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-taste') === taste) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  applyBothFilters();
}

// Apply both category and taste filters
function applyBothFilters() {
  let filtered = allProducts;
  
  // Filter by category
  if (activeFilter !== 'All') {
    filtered = filtered.filter(p => p.category === activeFilter);
  }
  
  // Filter by taste
  if (activeTaste !== 'All') {
    filtered = filtered.filter(p => p.taste === activeTaste);
  }
  
  renderProducts(filtered);
}

// ════════════════════════════════════════
// MODAL MANAGEMENT
// ════════════════════════════════════════

// Open the contact modal
function openModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('open');
}

// Close the contact modal
function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open');
}

// ════════════════════════════════════════
// FETCH PRODUCTS (Fetch API)
// ════════════════════════════════════════

// Fetch products from JSON file using modern Fetch API
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    allProducts = data;
    applyFilter('All');
    
  } catch (error) {
    console.error('Error fetching products:', error);
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = `
      <div class="error-message">
        <span style="font-size: 1.5rem; margin-right: 0.5rem;">&#9888;</span>
        Erreur lors du chargement des produits. Veuillez réessayer plus tard.
      </div>
    `;
  }
}

// ════════════════════════════════════════
// FETCH SPECIALS (Second Fetch API demonstration)
// ════════════════════════════════════════

// Fetch daily specials using Fetch API
async function loadSpecials() {
  const container = document.getElementById('specialsContent');
  
  try {
    const response = await fetch('specials.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const specials = await response.json();
    renderSpecials(specials);
    
  } catch (error) {
    console.error('Error fetching specials:', error);
    container.innerHTML = `
      <p style="color: rgba(255,255,255,0.9); font-weight: 600;">
        <span style="font-size: 1.2rem; margin-right: 0.3rem;">&#9888;</span>
        Impossible de charger les offres du jour
      </p>
    `;
  }
}

// Render specials cards
function renderSpecials(specials) {
  const container = document.getElementById('specialsContent');
  container.innerHTML = '';
  
  const fragment = document.createDocumentFragment();
  
  specials.forEach(special => {
    const card = document.createElement('div');
    card.className = 'special-card';
    card.innerHTML = `
      <div class="special-title">${special.title}</div>
      <div class="special-item">${special.item}</div>
      <div class="special-discount">-${special.discount}</div>
      <div class="special-valid">Jusqu'à ${special.validUntil}</div>
    `;
    fragment.appendChild(card);
  });
  
  container.appendChild(fragment);
}

// ════════════════════════════════════════
// AJAX (XMLHttpRequest) — demonstrates classic async HTTP
// alongside the Fetch API used in loadProducts()
// ════════════════════════════════════════

// Submit contact form using XMLHttpRequest (classic AJAX)
function submitFormAJAX(payload) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://httpbin.org/post', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`AJAX error: ${xhr.status}`));
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(JSON.stringify(payload));
  });
}

// ════════════════════════════════════════
// EVENT LISTENERS
// ════════════════════════════════════════

// Initialize all event listeners
function initEventListeners() {
  // Filter buttons - delegated event listener
  const filterBar = document.querySelector('.filter-bar');
  filterBar.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const category = e.target.getAttribute('data-category');
      applyFilter(category);
    }
  });
  
  // Taste filter buttons - delegated event listener
  const tasteFilterBar = document.getElementById('tasteFilterBar');
  tasteFilterBar.addEventListener('click', (e) => {
    if (e.target.classList.contains('taste-btn')) {
      const taste = e.target.getAttribute('data-taste');
      applyTasteFilter(taste);
    }
  });
  
  // Gallery grid - delegated event listeners for favorite and order buttons
  const grid = document.getElementById('galleryGrid');
  grid.addEventListener('click', (e) => {
    // Favorite button
    if (e.target.classList.contains('btn-favorite')) {
      const id = parseInt(e.target.getAttribute('data-id'));
      const nowFavorited = !isFavorited(id);
      toggleFavorite(id);
      
      if (nowFavorited) {
        e.target.classList.add('favorited');
        e.target.textContent = '♥';
      } else {
        e.target.classList.remove('favorited');
        e.target.textContent = '♡';
      }
    }
    
    // Order button
    if (e.target.classList.contains('btn-order')) {
      openModal();
    }
  });
  
  // Modal open buttons
  document.getElementById('navContactBtn').addEventListener('click', openModal);
  document.getElementById('heroContactBtn').addEventListener('click', openModal);
  document.getElementById('footerContactBtn').addEventListener('click', openModal);
  
  // Modal close button
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  
  // Close modal on overlay click
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
      closeModal();
    }
  });
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
  
  // Contact form submission using AJAX (XMLHttpRequest)
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('formName').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const message = document.getElementById('formMessage').value.trim();
    
    if (!name || !email || !message) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    
    // Show sending state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';
    errorMsg.classList.remove('show');
    
    const payload = {
      name,
      email,
      message,
      timestamp: new Date().toISOString()
    };
    
    try {
      const response = await submitFormAJAX(payload);
      console.log('AJAX response:', response);
      
      // Show success message
      successMsg.classList.add('show');
      form.reset();
      
      setTimeout(() => {
        successMsg.classList.remove('show');
        closeModal();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 2500);
      
    } catch (error) {
      console.error('AJAX error:', error);
      
      // Show error message
      errorMsg.innerHTML = `<span style="font-size: 1.2rem; margin-right: 0.3rem;">&#10060;</span> Erreur: ${error.message}`;
      errorMsg.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// ════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  updateFavoritesCounter();
  initEventListeners();
  loadProducts();
  loadSpecials();
});

// ════════════════════════════════════════
// GLOBAL STATE
// ════════════════════════════════════════
let allProducts = [];
let activeFilter = 'All';
let activeTaste = 'All';

// ════════════════════════════════════════
// INDEXEDDB - FAVORITES MANAGEMENT
// ════════════════════════════════════════

// Initialize IndexedDB
const dbName = 'PatisseriDB';
const storeName = 'favorites';

let db = null;

async function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    
    request.onerror = () => {
      reject(request.error);
    };
    
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName);
      }
    };
  });
}

// Get all favorites from IndexedDB
async function getFavorites() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get('favoritesList');
    
    request.onsuccess = () => {
      resolve(request.result?.value || []);
    };
    
    request.onerror = () => reject(request.error);
  });
}

// Save favorites to IndexedDB
async function saveFavorites(arr) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put({ value: arr }, 'favoritesList');
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Check if a product ID is favorited
async function isFavorited(id) {
  const favorites = await getFavorites();
  return favorites.includes(id);
}

// Toggle favorite status for a product ID (IndexedDB)
async function toggleFavorite(id) {
  const favorites = await getFavorites();
  const index = favorites.indexOf(id);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(id);
  }
  
  await saveFavorites(favorites);
  await updateFavoritesCounter();
}

// Update the favorites counter badge in navbar
async function updateFavoritesCounter() {
  const favorites = await getFavorites();
  document.getElementById('favoritesCount').textContent = favorites.length;
}

// ════════════════════════════════════════
// SESSIONSTORAGE - CART MANAGEMENT
// ════════════════════════════════════════

// Get cart items from sessionStorage
function getCartItems() {
  const stored = sessionStorage.getItem('patisserie_cart');
  return stored ? JSON.parse(stored) : [];
}

// Save cart items to sessionStorage
function saveCartItems(cart) {
  sessionStorage.setItem('patisserie_cart', JSON.stringify(cart));
}

// Add product to cart (sessionStorage)
function addToCart(productId, productName, productPrice) {
  const cart = getCartItems();
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId,
      productName,
      productPrice,
      quantity: 1
    });
  }
  
  saveCartItems(cart);
  updateCartCounter();
}

// Remove product from cart
function removeFromCart(productId) {
  let cart = getCartItems();
  cart = cart.filter(item => item.productId !== productId);
  saveCartItems(cart);
  updateCartCounter();
  renderCartItems();
}

// Update product quantity in cart
function updateCartQuantity(productId, quantity) {
  const cart = getCartItems();
  const item = cart.find(item => item.productId === productId);
  
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      saveCartItems(cart);
      updateCartCounter();
      renderCartItems();
    }
  }
}

// Clear cart
function clearCart() {
  sessionStorage.removeItem('patisserie_cart');
  updateCartCounter();
  renderCartItems();
}

// Update cart counter badge
function updateCartCounter() {
  const cart = getCartItems();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = totalItems;
}

// Calculate total cart price
function getCartTotal() {
  const cart = getCartItems();
  return cart.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
}

// ════════════════════════════════════════
// CART UI MANAGEMENT
// ════════════════════════════════════════

// Render cart items in modal
function renderCartItems() {
  const container = document.getElementById('cartItemsContainer');
  const cart = getCartItems();
  
  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart-message">Votre panier est vide</p>';
    document.getElementById('cartTotal').style.display = 'none';
    document.getElementById('proceedOrderBtn').style.display = 'none';
    return;
  }
  
  const cartHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.productName}</h4>
        <span class="cart-item-price">${item.productPrice.toFixed(2)} TND</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn-minus" data-id="${item.productId}">−</button>
        <input type="number" class="qty-input" value="${item.quantity}" min="1" data-id="${item.productId}" readonly>
        <button class="qty-btn-plus" data-id="${item.productId}">+</button>
        <button class="btn-remove-cart" data-id="${item.productId}">✕</button>
      </div>
      <div class="cart-item-total">
        ${(item.productPrice * item.quantity).toFixed(2)} TND
      </div>
    </div>
  `).join('');
  
  container.innerHTML = cartHTML;
  
  // Show total and proceed button
  const total = getCartTotal();
  document.getElementById('cartTotalPrice').textContent = total.toFixed(2);
  document.getElementById('cartTotal').style.display = 'block';
  document.getElementById('proceedOrderBtn').style.display = 'block';
  
  // Attach event listeners to cart controls
  attachCartControlListeners();
}

// Attach event listeners to cart item controls
function attachCartControlListeners() {
  // Remove buttons
  document.querySelectorAll('.btn-remove-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = parseInt(e.target.getAttribute('data-id'));
      removeFromCart(productId);
    });
  });
  
  // Plus/Minus buttons
  document.querySelectorAll('.qty-btn-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = parseInt(e.target.getAttribute('data-id'));
      const cart = getCartItems();
      const item = cart.find(it => it.productId === productId);
      if (item) updateCartQuantity(productId, item.quantity + 1);
    });
  });
  
  document.querySelectorAll('.qty-btn-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = parseInt(e.target.getAttribute('data-id'));
      const cart = getCartItems();
      const item = cart.find(it => it.productId === productId);
      if (item) updateCartQuantity(productId, item.quantity - 1);
    });
  });
}

// ════════════════════════════════════════
// MODAL MANAGEMENT
// ════════════════════════════════════════

// Contact modal
function openContactModal() {
  document.getElementById('modalOverlay').classList.add('open');
}

function closeContactModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// Cart modal
function openCartModal() {
  renderCartItems();
  document.getElementById('cartModalOverlay').classList.add('open');
}

function closeCartModal() {
  document.getElementById('cartModalOverlay').classList.remove('open');
}

// Order form modal
function openOrderFormModal() {
  closeCartModal();
  document.getElementById('orderFormModalOverlay').classList.add('open');
}

function closeOrderFormModal() {
  document.getElementById('orderFormModalOverlay').classList.remove('open');
}

// ════════════════════════════════════════
// PRODUCT CARD CREATION
// ════════════════════════════════════════

// Create a single product card element
async function createCard(product) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.setAttribute('data-id', product.id);
  article.setAttribute('data-category', product.category);

  const favorited = await isFavorited(product.id);
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
          <button class="btn-add-cart" data-id="${product.id}">Ajouter au panier</button>
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
async function renderProducts(productsArray) {
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
  
  for (const product of productsArray) {
    const card = await createCard(product);
    fragment.appendChild(card);
  }
  
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
async function applyFilter(category) {
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
  await applyBothFilters();
}

// Apply taste filter
async function applyTasteFilter(taste) {
  activeTaste = taste;
  
  const buttons = document.querySelectorAll('.taste-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-taste') === taste) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  await applyBothFilters();
}

// Apply both category and taste filters
async function applyBothFilters() {
  let filtered = allProducts;
  
  // Filter by category
  if (activeFilter !== 'All') {
    filtered = filtered.filter(p => p.category === activeFilter);
  }
  
  // Filter by taste
  if (activeTaste !== 'All') {
    filtered = filtered.filter(p => p.taste === activeTaste);
  }
  
  await renderProducts(filtered);
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
    await applyFilter('All');
    
  } catch (error) {
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
    const container = document.getElementById('specialsContent');
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
// AJAX (XMLHttpRequest)
// ════════════════════════════════════════

// Submit contact form using XMLHttpRequest
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
  
  // Gallery grid - delegated event listeners for favorite and add to cart buttons
  const grid = document.getElementById('galleryGrid');
  grid.addEventListener('click', async (e) => {
    // Favorite button
    if (e.target.classList.contains('btn-favorite')) {
      const id = parseInt(e.target.getAttribute('data-id'));
      await toggleFavorite(id);
      const isFav = await isFavorited(id);
      
      if (isFav) {
        e.target.classList.add('favorited');
        e.target.textContent = '♥';
      } else {
        e.target.classList.remove('favorited');
        e.target.textContent = '♡';
      }
    }
    
    // Add to cart button
    if (e.target.classList.contains('btn-add-cart')) {
      const productId = parseInt(e.target.getAttribute('data-id'));
      const product = allProducts.find(p => p.id === productId);
      if (product) {
        addToCart(productId, product.name, product.price);
        alert(`${product.name} ajouté au panier!`);
      }
    }
  });
  
  // Contact modal buttons
  const navContactBtn = document.getElementById('navContactBtn');
  if (navContactBtn) navContactBtn.addEventListener('click', openContactModal);
  
  const heroContactBtn = document.getElementById('heroContactBtn');
  if (heroContactBtn) heroContactBtn.addEventListener('click', openContactModal);
  
  const footerContactBtn = document.getElementById('footerContactBtn');
  if (footerContactBtn) footerContactBtn.addEventListener('click', openContactModal);
  
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeContactModal);
  
  // Cart badge - open cart modal
  document.getElementById('cartCount').parentElement.addEventListener('click', openCartModal);
  
  // Cart modal close button
  document.getElementById('cartModalCloseBtn').addEventListener('click', closeCartModal);
  
  // Proceed to order button
  document.getElementById('proceedOrderBtn').addEventListener('click', openOrderFormModal);
  
  // Order form modal close button
  document.getElementById('orderFormModalCloseBtn').addEventListener('click', closeOrderFormModal);
  
  // Close modals on overlay click
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeContactModal();
  });
  
  document.getElementById('cartModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'cartModalOverlay') closeCartModal();
  });
  
  document.getElementById('orderFormModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'orderFormModalOverlay') closeOrderFormModal();
  });
  
  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeContactModal();
      closeCartModal();
      closeOrderFormModal();
    }
  });
  
  // Contact form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('formName').value.trim();
      const email = document.getElementById('formEmail').value.trim();
      const message = document.getElementById('formMessage').value.trim();
      
      if (!name || !email || !message) {
        alert('Veuillez remplir tous les champs');
        return;
      }
      
      const submitBtn = contactForm.querySelector('.btn-submit');
      const originalText = submitBtn.textContent;
      const successMsg = document.getElementById('successMessage');
      const errorMsg = document.getElementById('errorMessage');
      
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
        await submitFormAJAX(payload);
        successMsg.classList.add('show');
        contactForm.reset();
        
        setTimeout(() => {
          successMsg.classList.remove('show');
          closeContactModal();
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }, 2500);
        
      } catch (error) {
        errorMsg.innerHTML = `<span style="font-size: 1.2rem; margin-right: 0.3rem;">&#10060;</span> Erreur: ${error.message}`;
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
  
  // Order form submission
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const firstname = document.getElementById('orderFirstname').value.trim();
      const lastname = document.getElementById('orderLastname').value.trim();
      const date = document.getElementById('orderDate').value;
      const phone = document.getElementById('orderPhone').value.trim();
      
      // Validation
      if (!firstname || !lastname || !date || !phone) {
        alert('Veuillez remplir tous les champs');
        return;
      }
      
      if (getCartItems().length === 0) {
        alert('Votre panier est vide');
        return;
      }
      
      const submitBtn = orderForm.querySelector('.btn-submit');
      const originalText = submitBtn.textContent;
      const successMsg = document.getElementById('orderSuccessMessage');
      const errorMsg = document.getElementById('orderErrorMessage');
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Confirmation en cours…';
      errorMsg.classList.remove('show');
      
      const orderData = {
        firstname,
        lastname,
        date,
        phone,
        items: getCartItems(),
        total: getCartTotal(),
        timestamp: new Date().toISOString()
      };
      
      try {
        await submitFormAJAX(orderData);
        successMsg.classList.add('show');
        orderForm.reset();
        clearCart();
        
        setTimeout(() => {
          successMsg.classList.remove('show');
          closeOrderFormModal();
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }, 3000);
        
      } catch (error) {
        errorMsg.innerHTML = `<span style="font-size: 1.2rem; margin-right: 0.3rem;">&#10060;</span> Erreur: ${error.message}`;
        errorMsg.classList.add('show');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
}

// ════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initIndexedDB();
    await updateFavoritesCounter();
    updateCartCounter();
    initEventListeners();
    await loadProducts();
    await loadSpecials();
  } catch (error) {
    // Initialization failed silently
  }
});

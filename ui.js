// ════════════════════════════════════════
// UI - UI RENDERING AND UPDATES
// ════════════════════════════════════════

// Update cart counter badge
function updateCartCounter() {
  const cart = getCartItems();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = totalItems;
}

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

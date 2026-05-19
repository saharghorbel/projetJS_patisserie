// ════════════════════════════════════════
// CART - SESSIONSTORAGE MANAGEMENT
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

// Calculate total cart price
function getCartTotal() {
  const cart = getCartItems();
  return cart.reduce((total, item) => total + (item.productPrice * item.quantity), 0);
}

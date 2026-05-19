// ════════════════════════════════════════
// EVENTS - EVENT LISTENERS
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
  
  // Cart badge - open cart modal
  document.getElementById('cartCount').parentElement.addEventListener('click', openCartModal);
  
  // Cart modal close button
  document.getElementById('cartModalCloseBtn').addEventListener('click', closeCartModal);
  
  // Proceed to order button
  document.getElementById('proceedOrderBtn').addEventListener('click', openOrderFormModal);
  
  // Order form modal close button
  document.getElementById('orderFormModalCloseBtn').addEventListener('click', closeOrderFormModal);
  
  // Close modals on overlay click
  document.getElementById('cartModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'cartModalOverlay') closeCartModal();
  });
  
  document.getElementById('orderFormModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'orderFormModalOverlay') closeOrderFormModal();
  });
  
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

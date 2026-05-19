// ════════════════════════════════════════
// GLOBAL STATE
// ════════════════════════════════════════
let allProducts = [];
let activeFilter = 'All';
let activeTaste = 'All';
let db = null;

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

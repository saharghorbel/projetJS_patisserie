// ════════════════════════════════════════
// MODALS - MODAL MANAGEMENT
// ════════════════════════════════════════

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

// ════════════════════════════════════════
// PRODUCTS - FETCHING, RENDERING, FILTERING
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

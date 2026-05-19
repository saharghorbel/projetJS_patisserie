// ════════════════════════════════════════
// FAVORITES - INDEXEDDB MANAGEMENT
// ════════════════════════════════════════

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

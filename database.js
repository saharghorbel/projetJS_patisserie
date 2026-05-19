// ════════════════════════════════════════
// DATABASE - INDEXEDDB INITIALIZATION
// ════════════════════════════════════════

const dbName = 'PatisseriDB';
const storeName = 'favorites';

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

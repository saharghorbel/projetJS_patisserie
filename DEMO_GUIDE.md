# 🎯 Guide de Démonstration au Tableau

## ⏱️ Démonstration 5-10 minutes

---

## 🎬 Script de Présentation

### 1️⃣ Introduction (30 secondes)

**À dire:**
> "Bonjour, je vais vous présenter mon projet 'Pâtisserie Vitrine', un site web de pâtisserie tunisienne qui démontre les compétences en JavaScript front-end : manipulation du DOM, AJAX/Fetch, et localStorage."

**À montrer:**
- Ouvrir le site: `http://localhost:8000`
- Vue d'ensemble rapide

---

### 2️⃣ Manipulation du DOM (1-2 minutes)

**À dire:**
> "Les 12 produits que vous voyez sont créés dynamiquement en JavaScript. Aucune carte n'est hardcodée dans le HTML."

**À montrer:**
1. **Ouvrir DevTools** (F12)
2. **Onglet Elements**
3. Montrer `<div id="galleryGrid">` avec les cartes générées
4. **Console:**
   ```javascript
   document.querySelectorAll('.product-card').length
   // Résultat: 12
   ```

**À dire:**
> "Chaque carte est créée avec `document.createElement()` et ajoutée au DOM avec `appendChild()`."

**Code à montrer (app.js ligne 52-75):**
```javascript
function createCard(product) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.innerHTML = `...`;
  return article;
}
```

---

### 3️⃣ Fetch API (1-2 minutes)

**À dire:**
> "Les données sont chargées depuis des fichiers JSON avec l'API Fetch moderne."

**À montrer:**
1. **DevTools → Network tab**
2. **Recharger la page** (F5)
3. Montrer les requêtes:
   - `products.json` (Status: 200)
   - `specials.json` (Status: 200)
4. Cliquer sur `products.json` → Preview → Montrer les données

**Code à montrer (app.js ligne 154-172):**
```javascript
async function loadProducts() {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();
    allProducts = data;
  } catch (error) {
    // Gestion d'erreur
  }
}
```

**À dire:**
> "J'utilise async/await pour gérer l'asynchrone et try/catch pour les erreurs."

---

### 4️⃣ Filtrage Dynamique (1 minute)

**À dire:**
> "Le filtrage se fait côté client en JavaScript, sans rechargement de page."

**À montrer:**
1. Cliquer sur **"Sucrés"** → 4 produits affichés
2. Cliquer sur **"Salés"** → 4 produits affichés
3. Cliquer sur **"Entremets"** → 4 produits affichés
4. Cliquer sur **"Tout"** → 12 produits affichés

**Code à montrer (app.js ligne 118-130):**
```javascript
function applyFilter(category) {
  const filtered = category === 'All' 
    ? allProducts 
    : allProducts.filter(p => p.category === category);
  renderProducts(filtered);
}
```

---

### 5️⃣ localStorage - Favoris (1-2 minutes)

**À dire:**
> "Les favoris sont stockés dans localStorage pour persister entre les sessions."

**À montrer:**
1. **Cliquer sur 3-4 cœurs** pour ajouter aux favoris
2. Observer le **badge compteur** qui s'incrémente
3. **DevTools → Application → Local Storage**
4. Montrer: `patisserie_favorites: [1,3,5,7]`
5. **Recharger la page** (F5)
6. Les favoris sont toujours là! ✅

**Code à montrer (app.js ligne 11-40):**
```javascript
function getFavorites() {
  const stored = localStorage.getItem('patisserie_favorites');
  return stored ? JSON.parse(stored) : [];
}

function saveFavorites(arr) {
  localStorage.setItem('patisserie_favorites', JSON.stringify(arr));
}

function toggleFavorite(id) {
  const favorites = getFavorites();
  // Ajout ou suppression
  saveFavorites(favorites);
}
```

---

### 6️⃣ AJAX - XMLHttpRequest (1-2 minutes)

**À dire:**
> "Le formulaire de contact utilise XMLHttpRequest classique pour démontrer l'AJAX traditionnel."

**À montrer:**
1. **Cliquer sur "Contact"** (bouton dans navbar)
2. **Remplir le formulaire:**
   - Nom: "Test Demo"
   - Email: "test@example.com"
   - Message: "Ceci est un test"
3. **DevTools → Network tab** (garder ouvert)
4. **Cliquer "Envoyer"**
5. Montrer la requête POST vers `httpbin.org/post`
6. Cliquer sur la requête → Response → Montrer les données envoyées
7. Observer le **message de succès**

**Code à montrer (app.js ligne 218-237):**
```javascript
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
    
    xhr.send(JSON.stringify(payload));
  });
}
```

---

### 7️⃣ Responsive Design (30 secondes)

**À dire:**
> "Le site est entièrement responsive avec CSS Grid et media queries."

**À montrer:**
1. **DevTools → Toggle device toolbar** (Ctrl+Shift+M)
2. Tester différentes tailles:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1200px)
3. Montrer l'adaptation du layout

---

### 8️⃣ Conclusion (30 secondes)

**À dire:**
> "En résumé, ce projet démontre:
> - ✅ Manipulation du DOM avec création dynamique d'éléments
> - ✅ Fetch API moderne pour charger les données
> - ✅ XMLHttpRequest classique pour l'AJAX
> - ✅ localStorage pour la persistance des favoris
> - ✅ JavaScript ES6+ avec async/await
> - ✅ Design responsive et accessible
> 
> Merci pour votre attention!"

---

## 🎯 Points Clés à Mentionner

### Manipulation DOM
- ✅ `document.createElement()`
- ✅ `appendChild()` avec DocumentFragment
- ✅ `classList.add/remove()`
- ✅ Event delegation

### AJAX/Fetch
- ✅ Fetch API moderne (2 sources)
- ✅ XMLHttpRequest classique (1 source)
- ✅ async/await
- ✅ Gestion d'erreurs

### localStorage
- ✅ `localStorage.getItem()`
- ✅ `localStorage.setItem()`
- ✅ `JSON.parse()` / `JSON.stringify()`
- ✅ Persistance vérifiée

---

## 🛠️ Préparation Avant la Démo

### Checklist
- [ ] Serveur lancé: `python -m http.server 8000`
- [ ] Navigateur ouvert: `http://localhost:8000`
- [ ] DevTools prêt (F12)
- [ ] Network tab vide (Clear)
- [ ] localStorage vide (Clear)
- [ ] Code source ouvert dans éditeur
- [ ] README.md ouvert pour référence

### Fichiers à Avoir Ouverts
1. `index.html` - Structure
2. `app.js` - Logique JavaScript
3. `style.css` - Styles
4. `products.json` - Données

---

## 🚨 Gestion des Problèmes

### Si le serveur ne démarre pas
```bash
# Alternative 1
python3 -m http.server 8000

# Alternative 2
npx http-server -p 8000
```

### Si les images ne chargent pas
> "Les images utilisent Lorem Picsum, un service de placeholder. En production, on utiliserait de vraies images."

### Si localStorage est bloqué
> "Certains navigateurs bloquent localStorage en mode privé. Voici le code qui gère ce cas."

---

## 💡 Questions Possibles et Réponses

**Q: Pourquoi utiliser à la fois Fetch et XMLHttpRequest?**
> R: Pour démontrer les deux approches : Fetch est moderne et recommandé, XMLHttpRequest est l'approche classique AJAX encore utilisée dans du code legacy.

**Q: Pourquoi localStorage et pas sessionStorage?**
> R: localStorage persiste même après fermeture du navigateur, ce qui est idéal pour les favoris. sessionStorage serait perdu à la fermeture.

**Q: Le site est-il accessible?**
> R: Oui, j'ai utilisé des labels sur les formulaires, des attributs alt sur les images, et la navigation au clavier fonctionne (Escape pour fermer le modal).

**Q: Comment gérez-vous les erreurs réseau?**
> R: Avec try/catch pour Fetch et xhr.onerror pour XMLHttpRequest. Un message d'erreur s'affiche à l'utilisateur.

**Q: Le code est-il optimisé?**
> R: Oui, j'utilise DocumentFragment pour les insertions multiples, event delegation pour réduire les listeners, et des variables CSS pour la maintenabilité.

---

## ⏱️ Timing Suggéré

| Section | Temps | Priorité |
|---------|-------|----------|
| Introduction | 30s | ⭐⭐⭐ |
| Manipulation DOM | 1-2min | ⭐⭐⭐ |
| Fetch API | 1-2min | ⭐⭐⭐ |
| Filtrage | 1min | ⭐⭐ |
| localStorage | 1-2min | ⭐⭐⭐ |
| AJAX/XHR | 1-2min | ⭐⭐⭐ |
| Responsive | 30s | ⭐ |
| Conclusion | 30s | ⭐⭐⭐ |

**Total: 7-10 minutes**

---

## 🎓 Bonne Chance! 🚀

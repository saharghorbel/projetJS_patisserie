// ════════════════════════════════════════
// API - AJAX REQUESTS
// ════════════════════════════════════════

// Submit order form using XMLHttpRequest
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

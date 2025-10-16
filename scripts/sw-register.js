// Service Worker Registration for Student Finance Tracker

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, notify user
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from SW:', event.data);
      
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        // Handle cache updates if needed
        console.log('Cache updated');
      }
    });

    // Handle offline/online status
    window.addEventListener('online', () => {
      console.log('App is online');
      // Notify user that they're back online
      showOnlineStatus('You are back online', 'success');
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      // Notify user that they're offline
      showOnlineStatus('You are offline - some features may be limited', 'warning');
    });
  } else {
    console.log('Service Worker not supported');
  }
}

function showOnlineStatus(message, type) {
  // Create a temporary status message
  const statusEl = document.createElement('div');
  statusEl.className = `form-status ${type}`;
  statusEl.textContent = message;
  statusEl.style.position = 'fixed';
  statusEl.style.top = '20px';
  statusEl.style.right = '20px';
  statusEl.style.zIndex = '1000';
  statusEl.style.maxWidth = '300px';
  
  document.body.appendChild(statusEl);
  
  setTimeout(() => {
    statusEl.remove();
  }, 3000);
}

// Initialize service worker registration
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", registerServiceWorker);
} else {
  registerServiceWorker();
}

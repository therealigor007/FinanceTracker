export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  if (confirm("New version available! Reload to update?")) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {});
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "CACHE_UPDATED") {
      }
    });

    window.addEventListener("online", () => {
      showOnlineStatus("You are back online", "success");
    });

    window.addEventListener("offline", () => {
      showOnlineStatus(
        "You are offline - some features may be limited",
        "warning"
      );
    });
  } else {
  }
}

function showOnlineStatus(message, type) {
  const statusEl = document.createElement("div");
  statusEl.className = `form-status ${type}`;
  statusEl.textContent = message;
  statusEl.style.position = "fixed";
  statusEl.style.top = "20px";
  statusEl.style.right = "20px";
  statusEl.style.zIndex = "1000";
  statusEl.style.maxWidth = "300px";

  document.body.appendChild(statusEl);

  setTimeout(() => {
    statusEl.remove();
  }, 3000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", registerServiceWorker);
} else {
  registerServiceWorker();
}

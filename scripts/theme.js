const THEME_KEY = "financeTracker_theme";

export function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  setTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  });

  updateToggleIcon(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  updateToggleIcon(theme);
}

function updateToggleIcon(theme) {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  const icon = themeToggle.querySelector(".theme-icon");
  if (!icon) return;

  if (theme === "dark") {
    icon.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    `;
    themeToggle.setAttribute("aria-label", "Switch to light mode");
    themeToggle.setAttribute("title", "Switch to light mode");
  } else {
    icon.innerHTML = `
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    `;
    themeToggle.setAttribute("aria-label", "Switch to dark mode");
    themeToggle.setAttribute("title", "Switch to dark mode");
  }
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

export function isDarkMode() {
  return getCurrentTheme() === "dark";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTheme);
} else {
  initTheme();
}

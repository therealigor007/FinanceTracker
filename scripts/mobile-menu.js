// Mobile menu functionality for Student Finance Tracker

function initMobileMenu() {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const nav = document.querySelector(".nav");

  if (!mobileMenuToggle || !nav) return;

  // Toggle mobile menu
  mobileMenuToggle.addEventListener("click", () => {
    const isExpanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
    
    mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);
    nav.classList.toggle("active");
    
    // Update hamburger animation
    const hamburger = mobileMenuToggle.querySelector(".hamburger");
    if (hamburger) {
      hamburger.classList.toggle("active");
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    const isMenuOpen = nav.classList.contains("active");
    const isClickInsideNav = nav.contains(e.target);
    const isClickOnToggle = mobileMenuToggle.contains(e.target);
    
    if (isMenuOpen && !isClickInsideNav && !isClickOnToggle) {
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("active");
      
      const hamburger = mobileMenuToggle.querySelector(".hamburger");
      if (hamburger) {
        hamburger.classList.remove("active");
      }
    }
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const isMenuOpen = nav.classList.contains("active");
      
      if (isMenuOpen) {
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("active");
        
        const hamburger = mobileMenuToggle.querySelector(".hamburger");
        if (hamburger) {
          hamburger.classList.remove("active");
        }
      }
    }
  });

  // Close menu when window is resized to desktop size
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("active");
      
      const hamburger = mobileMenuToggle.querySelector(".hamburger");
      if (hamburger) {
        hamburger.classList.remove("active");
      }
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMobileMenu);
} else {
  initMobileMenu();
}

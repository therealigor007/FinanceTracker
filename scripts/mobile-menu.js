function initMobileMenu() {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const nav = document.querySelector(".nav");

  if (!mobileMenuToggle || !nav) return;
  mobileMenuToggle.addEventListener("click", () => {
    const isExpanded =
      mobileMenuToggle.getAttribute("aria-expanded") === "true";

    mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);
    nav.classList.toggle("active");
    const hamburger = mobileMenuToggle.querySelector(".hamburger");
    if (hamburger) {
      hamburger.classList.toggle("active");
    }
  });
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMobileMenu);
} else {
  initMobileMenu();
}

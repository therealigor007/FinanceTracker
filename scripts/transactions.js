// Transactions page functionality for Student Finance Tracker

import { getTransactions, deleteTransaction } from "./storage.js";
import { sortTransactions } from "./state.js";
import { renderTransactionsTable, showModal, hideModal } from "./ui.js";
import { compileRegex, searchTransactions } from "./search.js";

let currentSort = { field: "date", direction: "desc" };
let currentSearchPattern = null;
let editingId = null;

function initTransactionsPage() {
  let transactions = getTransactions();
  let filteredTransactions = transactions;

  // Initialize table rendering
  renderTransactions();

  // Set up sorting
  document.querySelectorAll("[data-sort]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.sort;
      
      if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        currentSort.field = field;
        currentSort.direction = "asc";
      }

      // Update sort indicators
      document.querySelectorAll("[data-sort]").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");

      // Update sort icon
      const icon = btn.querySelector(".sort-icon");
      if (icon) {
        icon.textContent = currentSort.direction === "asc" ? "↑" : "↓";
      }

      renderTransactions();
    });
  });

  // Set up search functionality
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search-btn");
  const searchError = document.getElementById("search-error");
  const searchResultsCount = document.getElementById("search-results-count");

  if (searchInput) {
    searchInput.addEventListener("input", performSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
      }
      currentSearchPattern = null;
      filteredTransactions = transactions;
      clearSearchError();
      renderTransactions();
      updateSearchResultsCount();
    });
  }

  function performSearch() {
    if (!searchInput) return;
    
    const pattern = searchInput.value.trim();
    
    if (!pattern) {
      currentSearchPattern = null;
      filteredTransactions = transactions;
      clearSearchError();
      renderTransactions();
      updateSearchResultsCount();
      return;
    }

    try {
      currentSearchPattern = compileRegex(pattern, 'i');
      
      if (!currentSearchPattern) {
        showSearchError("Invalid regex pattern");
        return;
      }

      filteredTransactions = searchTransactions(transactions, currentSearchPattern);
      clearSearchError();
      renderTransactions();
      updateSearchResultsCount();
    } catch (error) {
      showSearchError(`Invalid regex pattern: ${error.message}`);
    }
  }

  function showSearchError(message) {
    if (searchError) {
      searchError.textContent = message;
      searchError.style.display = "block";
    }
  }

  function clearSearchError() {
    if (searchError) {
      searchError.textContent = "";
      searchError.style.display = "none";
    }
  }

  function updateSearchResultsCount() {
    if (searchResultsCount) {
      const total = transactions.length;
      const filtered = filteredTransactions.length;
      
      if (currentSearchPattern) {
        searchResultsCount.textContent = `Showing ${filtered} of ${total} transactions`;
      } else {
        searchResultsCount.textContent = `${total} transactions`;
      }
    }
  }

  function renderTransactions() {
    const sorted = sortTransactions(
      filteredTransactions,
      currentSort.field,
      currentSort.direction
    );
    
    renderTransactionsTable(sorted, { 
      highlightRe: currentSearchPattern 
    });
    
    updateSearchResultsCount();
  }

  // Set up delete functionality
  window.editTransaction = (id) => {
    window.location.href = `add.html?id=${id}`;
  };

  window.confirmDelete = (id) => {
    editingId = id;
    showModal("delete-modal");
  };

  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      if (editingId) {
        deleteTransaction(editingId);
        hideModal("delete-modal");
        
        // Refresh data
        transactions = getTransactions();
        filteredTransactions = transactions;
        renderTransactions();
        
        // Show success message
        const statusEl = document.createElement("div");
        statusEl.className = "form-status success";
        statusEl.textContent = "Transaction deleted successfully";
        statusEl.style.position = "fixed";
        statusEl.style.top = "20px";
        statusEl.style.right = "20px";
        statusEl.style.zIndex = "1000";
        document.body.appendChild(statusEl);
        
        setTimeout(() => {
          statusEl.remove();
        }, 3000);
      }
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      hideModal("delete-modal");
      editingId = null;
    });
  }

  // Handle escape key for modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideModal("delete-modal");
      editingId = null;
    }
  });

  // Initialize search results count
  updateSearchResultsCount();

  // Listen for data changes and refresh transactions
  window.addEventListener('dataCleared', () => {
    transactions = getTransactions();
    filteredTransactions = transactions;
    renderTransactions();
  });

  // Listen for currency changes and refresh transactions
  window.addEventListener('currencyChanged', () => {
    renderTransactions();
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTransactionsPage);
} else {
  initTransactionsPage();
}

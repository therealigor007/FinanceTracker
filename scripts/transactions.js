import { getTransactions, deleteTransaction } from "./storage.js";
import { sortTransactions } from "./state.js";
import { renderTransactionsTable, showModal, hideModal } from "./ui.js";
import { compileRegex, searchTransactions } from "./search.js";

let currentSort = { field: "date", direction: "desc" };
let currentSearchPattern = null;
let editingId = null;
let transactions = [];
let filteredTransactions = [];

const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const searchError = document.getElementById("search-error");
const searchResultsCount = document.getElementById("search-results-count");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
const tbody = document.getElementById("transactions-tbody");

function initTransactionsPage() {
  transactions = getTransactions();
  filteredTransactions = [...transactions];

  document.querySelectorAll("[data-sort]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.sort;
      if (currentSort.field === field) {
        currentSort.direction =
          currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        currentSort.field = field;
        currentSort.direction = "asc";
      }

      document.querySelectorAll("[data-sort]").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
        const icon = b.querySelector(".sort-icon");
        if (icon) icon.textContent = "↕";
      });

      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      const icon = btn.querySelector(".sort-icon");
      if (icon) icon.textContent = currentSort.direction === "asc" ? "↑" : "↓";

      renderTransactions();
    });
  });
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
      if (searchInput) searchInput.value = "";
      currentSearchPattern = null;
      filteredTransactions = [...transactions];
      clearSearchError();
      renderTransactions();
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      if (editingId == null) return;
      deleteTransaction(editingId);
      hideModal("delete-modal");
      editingId = null;

      transactions = getTransactions();
      filteredTransactions = [...transactions];
      renderTransactions();
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      hideModal("delete-modal");
      editingId = null;
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideModal("delete-modal");
      editingId = null;
    }
  });

  window.addEventListener("dataCleared", () => {
    transactions = getTransactions();
    filteredTransactions = [...transactions];
    renderTransactions();
  });

  window.addEventListener("currencyChanged", () => {
    renderTransactions();
  });

  renderTransactions();
}

function performSearch() {
  if (!searchInput) return;
  const patternStr = searchInput.value.trim();
  if (!patternStr) {
    currentSearchPattern = null;
    filteredTransactions = [...transactions];
    clearSearchError();
    renderTransactions();
    return;
  }
  try {
    currentSearchPattern = compileRegex(patternStr, "i");
    filteredTransactions = searchTransactions(
      transactions,
      currentSearchPattern
    );
    clearSearchError();
    renderTransactions();
  } catch (err) {
    showSearchError(`Invalid regex: ${err.message}`);
  }
}

function showSearchError(msg) {
  if (searchError) {
    searchError.textContent = msg;
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
  if (!searchResultsCount) return;
  const total = transactions.length;
  const filtered = filteredTransactions.length;
  if (currentSearchPattern) {
    searchResultsCount.textContent = `Showing ${filtered} of ${total} transactions`;
  } else {
    searchResultsCount.textContent = `${total} transactions`;
  }
}

function renderTransactions() {
  const sorted = sortTransactions(
    filteredTransactions,
    currentSort.field,
    currentSort.direction
  );

  renderTransactionsTable(sorted, {
    highlightRe: currentSearchPattern,
    onEdit: (id) => {
      window.location.href = `add.html?id=${id}`;
    },
    onDelete: (id) => {
      editingId = id;
      showModal("delete-modal");
    },
  });

  updateSearchResultsCount();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTransactionsPage);
} else {
  initTransactionsPage();
}

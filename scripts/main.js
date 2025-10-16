import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSettings,
  saveSettings,
  exportData,
  importData,
  getTransactionById,
} from "./storage.js";
import { sortTransactions, formatCurrency, formatDate } from "./state.js";
import {
  renderTransactionsTable,
  showModal,
  hideModal,
  showFormStatus,
  showDataStatus,
} from "./ui.js";
import {
  validateTransaction,
  validateDescription,
  validateAmount,
  validateDate,
  validateCategory,
  parseRegexPattern,
} from "./validators.js";

const currentSort = { field: "date", direction: "desc" };
let currentSearchPattern = null;
let editingId = null;

function init() {
  const currentPage = getCurrentPage();

  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const nav = document.querySelector(".nav");

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      const isExpanded =
        mobileMenuToggle.getAttribute("aria-expanded") === "true";
      mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);
      nav.classList.toggle("active");
    });
  }

  switch (currentPage) {
    case "transactions":
      initTransactionsList();
      break;
    case "add":
      initAddForm();
      break;
    case "about":
      break;
  }
}

function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split("/").pop().replace(".html", "") || "index";
  return page;
}

function initTransactionsList() {
  let transactions = getTransactions();
  let filteredTransactions = transactions;

  renderTransactions();

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
      document
        .querySelectorAll("[data-sort]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");

      renderTransactions();
    });
  });

  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const clearSearchBtn = document.getElementById("clear-search");
  const searchStatus = document.getElementById("search-status");

  if (searchBtn) {
    searchBtn.addEventListener("click", performSearch);
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentSearchPattern = null;
      filteredTransactions = transactions;
      renderTransactions();
      searchStatus.textContent = "";
      clearSearchBtn.style.display = "none";
    });
  }

  function performSearch() {
    const pattern = searchInput.value.trim();
    if (!pattern) {
      searchStatus.textContent = "Please enter a search pattern";
      searchStatus.className = "search-status error";
      return;
    }

    try {
      currentSearchPattern = parseRegexPattern(pattern);
      filteredTransactions = transactions.filter((t) => {
        return (
          currentSearchPattern.test(t.description) ||
          currentSearchPattern.test(t.category) ||
          currentSearchPattern.test(t.amount.toString()) ||
          currentSearchPattern.test(t.date)
        );
      });

      searchStatus.textContent = `Found ${filteredTransactions.length} match${
        filteredTransactions.length !== 1 ? "es" : ""
      }`;
      searchStatus.className = "search-status success";
      clearSearchBtn.style.display = "inline-block";
      renderTransactions();
    } catch (error) {
      searchStatus.textContent = `Invalid regex pattern: ${error.message}`;
      searchStatus.className = "search-status error";
    }
  }

  function renderTransactions() {
    const sorted = sortTransactions(
      filteredTransactions,
      currentSort.field,
      currentSort.direction
    );
    renderTransactionsTable(sorted);
  }

  window.editTransaction = (id) => {
    window.location.href = `add.html?id=${id}`;
  };

  window.confirmDelete = (id) => {
    editingId = id;
    showModal("delete-modal");
  };

  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const cancelDeleteBtn = document.getElementById("cancel-delete");

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      if (editingId) {
        deleteTransaction(editingId);
        hideModal("delete-modal");
        transactions = getTransactions();
        filteredTransactions = transactions;
        renderTransactions();
        showDataStatus("Transaction deleted successfully", "success");
      }
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
}

function initAddForm() {
  const form = document.getElementById("transaction-form");
  const descInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  const categoryInput = document.getElementById("category");
  const submitBtn = document.querySelector('button[type="submit"]');
  const cancelBtn = document.getElementById("cancel-btn");

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("id");

  if (editId) {
    const transaction = getTransactionById(Number.parseInt(editId));
    if (transaction) {
      const pageTitle = document.querySelector("h1");
      if (pageTitle) pageTitle.textContent = "Edit Transaction";
      if (submitBtn) submitBtn.textContent = "Update Transaction";
      if (descInput) descInput.value = transaction.description;
      if (amountInput) amountInput.value = transaction.amount;
      if (dateInput) dateInput.value = transaction.date;
      if (categoryInput) categoryInput.value = transaction.category;
      editingId = Number.parseInt(editId);
    }
  } else {
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
  }

  const fields = ["description", "amount", "date", "category"];
  fields.forEach((field) => {
    const input = document.getElementById(field);
    if (input) {
      input.addEventListener("blur", () => validateField(field));
    }
  });

  function validateField(field) {
    const input = document.getElementById(field);
    const errorEl = document.getElementById(`${field}-error`);
    if (!input || !errorEl) return true;

    const value = input.value != null ? input.value.toString().trim() : "";
    let result;

    switch (field) {
      case "description":
        result = validateDescription(value);
        break;
      case "amount":
        result = validateAmount(value);
        break;
      case "date":
        result = validateDate(value);
        break;
      case "category":
        result = validateCategory(value);
        break;
      default:
        return true;
    }

    if (result.valid) {
      input.classList.remove("error");
      errorEl.textContent = "";
      errorEl.style.display = "none";
    } else {
      input.classList.add("error");
      errorEl.textContent = result.message;
      errorEl.style.display = "block";
    }

    return result.valid;
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const transaction = {
        description: descInput?.value.toString().trim() || "",
        amount: amountInput?.value || "",
        date: dateInput?.value || "",
        category: categoryInput?.value || "",
      };

      const validation = validateTransaction(transaction);

      if (!validation.valid) {
        Object.keys(validation.errors).forEach((field) => {
          const errorEl = document.getElementById(`${field}-error`);
          const input = document.getElementById(field);
          if (errorEl && input) {
            input.classList.add("error");
            errorEl.textContent = validation.errors[field];
            errorEl.style.display = "block";
          }
        });
        showFormStatus("Please fix the errors above", "error");
        return;
      }

      const transactionToSave = {
        ...transaction,
        amount: parseFloat(transaction.amount),
      };

      if (editingId) {
        updateTransaction(editingId, transactionToSave);
        showFormStatus("Transaction updated successfully!", "success");
      } else {
        addTransaction(transactionToSave);
        showFormStatus("Transaction added successfully!", "success");
      }

      setTimeout(() => {
        window.location.href = "transactions.html";
      }, 800);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "transactions.html";
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

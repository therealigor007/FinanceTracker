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
import {
  calculateStats,
  calculateBudgetStatus,
  sortTransactions,
  formatCurrency,
  convertCurrency,
} from "./state.js";
import {
  renderBudgetStatus,
  renderStats,
  renderRecentTransactions,
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

// Global state
const currentSort = { field: "date", direction: "desc" };
let currentSearchPattern = null;
let editingId = null;

// Initialize the application
function init() {
  const currentPage = getCurrentPage();

  // Mobile menu toggle
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

  // Route to appropriate page handler
  switch (currentPage) {
    case "index":
      initDashboard();
      break;
    case "transactions":
      initTransactionsList();
      break;
    case "add":
      initAddForm();
      break;
    case "settings":
      initSettings();
      break;
    case "about":
      // About page is static, no JS needed
      break;
  }
}

// Get current page from URL
function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split("/").pop().replace(".html", "") || "index";
  return page;
}

// ===== DASHBOARD PAGE =====
function initDashboard() {
  const transactions = getTransactions();
  const stats = calculateStats(transactions);
  const budgetStatus = calculateBudgetStatus();

  renderStats(stats);
  renderBudgetStatus(budgetStatus);
  renderRecentTransactions(sortTransactions(transactions, "date", "desc"));
}

// ===== TRANSACTIONS PAGE =====
function initTransactionsList() {
  let transactions = getTransactions();
  let filteredTransactions = transactions;

  // Initial render
  renderTransactions();

  // Sort buttons
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

      // Update button states
      document
        .querySelectorAll("[data-sort]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");

      renderTransactions();
    });
  });

  // Search functionality
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

  // Make edit and delete functions global
  window.editTransaction = (id) => {
    window.location.href = `add.html?id=${id}`;
  };

  window.confirmDelete = (id) => {
    editingId = id;
    showModal("delete-modal");
  };

  // Delete modal handlers
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

  // Close modal on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideModal("delete-modal");
      editingId = null;
    }
  });
}

// ===== ADD/EDIT FORM PAGE =====
function initAddForm() {
  const form = document.getElementById("transaction-form");
  const descInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  const categoryInput = document.getElementById("category");
  const submitBtn = document.getElementById("submit-btn");
  const cancelBtn = document.getElementById("cancel-btn");

  // Check if editing
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("id");

  if (editId) {
    const transaction = getTransactionById(Number.parseInt(editId));
    if (transaction) {
      document.querySelector("h1").textContent = "Edit Transaction";
      submitBtn.textContent = "Update Transaction";
      descInput.value = transaction.description;
      amountInput.value = transaction.amount;
      dateInput.value = transaction.date;
      categoryInput.value = transaction.category;
      editingId = Number.parseInt(editId);
    }
  } else {
    // Set today's date as default
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  // Real-time validation
  descInput.addEventListener("blur", () => validateField("description"));
  amountInput.addEventListener("blur", () => validateField("amount"));
  dateInput.addEventListener("blur", () => validateField("date"));
  categoryInput.addEventListener("blur", () => validateField("category"));

  function validateField(field) {
    const input = document.getElementById(field);
    const errorEl = document.getElementById(`${field}-error`);
    let result;

    switch (field) {
      case "description":
        result = validateDescription(input.value);
        break;
      case "amount":
        result = validateAmount(input.value);
        break;
      case "date":
        result = validateDate(input.value);
        break;
      case "category":
        result = validateCategory(input.value);
        break;
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

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const transaction = {
      description: descInput.value.trim(),
      amount: amountInput.value.trim(),
      date: dateInput.value,
      category: categoryInput.value,
    };

    const validation = validateTransaction(transaction);

    if (!validation.valid) {
      // Show all errors
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

    // Save transaction
    if (editingId) {
      updateTransaction(editingId, transaction);
      showFormStatus("Transaction updated successfully!", "success");
    } else {
      addTransaction(transaction);
      showFormStatus("Transaction added successfully!", "success");
    }

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = "transactions.html";
    }, 1000);
  });

  // Cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "transactions.html";
    });
  }
}

// ===== SETTINGS PAGE =====
function initSettings() {
  const settings = getSettings();

  // Budget cap
  const budgetInput = document.getElementById("budget-cap");
  const saveBudgetBtn = document.getElementById("save-budget");

  if (budgetInput) {
    budgetInput.value = settings.budgetCap || "";
  }

  if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener("click", () => {
      const value = budgetInput.value.trim();
      if (value && Number.parseFloat(value) > 0) {
        settings.budgetCap = Number.parseFloat(value);
        saveSettings(settings);
        showDataStatus("Budget cap saved successfully", "success");
      } else {
        settings.budgetCap = null;
        saveSettings(settings);
        showDataStatus("Budget cap removed", "success");
      }
    });
  }

  // Exchange rates
  const usdRate = document.getElementById("usd-rate");
  const rwfRate = document.getElementById("rwf-rate");
  const eurRate = document.getElementById("eur-rate");
  const saveRatesBtn = document.getElementById("save-rates");

  if (usdRate) usdRate.value = settings.exchangeRates.USD;
  if (rwfRate) rwfRate.value = settings.exchangeRates.RWF;
  if (eurRate) eurRate.value = settings.exchangeRates.EUR;

  if (saveRatesBtn) {
    saveRatesBtn.addEventListener("click", () => {
      settings.exchangeRates = {
        USD: Number.parseFloat(usdRate.value),
        RWF: Number.parseFloat(rwfRate.value),
        EUR: Number.parseFloat(eurRate.value),
      };
      saveSettings(settings);
      showDataStatus("Exchange rates saved successfully", "success");
    });
  }

  // Currency converter
  const convertAmount = document.getElementById("convert-amount");
  const convertFrom = document.getElementById("convert-from");
  const convertTo = document.getElementById("convert-to");
  const convertBtn = document.getElementById("convert-btn");
  const convertResult = document.getElementById("convert-result");

  if (convertBtn) {
    convertBtn.addEventListener("click", () => {
      const amount = Number.parseFloat(convertAmount.value);
      const from = convertFrom.value;
      const to = convertTo.value;

      if (isNaN(amount) || amount <= 0) {
        convertResult.textContent = "Please enter a valid amount";
        convertResult.className = "convert-result error";
        return;
      }

      const result = convertCurrency(amount, from, to, settings.exchangeRates);
      convertResult.textContent = `${formatCurrency(
        amount,
        from
      )} = ${formatCurrency(result, to)}`;
      convertResult.className = "convert-result success";
    });
  }

  // Import/Export
  const exportBtn = document.getElementById("export-btn");
  const importBtn = document.getElementById("import-btn");
  const importFile = document.getElementById("import-file");

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const data = exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance-tracker-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
      showDataStatus("Data exported successfully", "success");
    });
  }

  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => {
      importFile.click();
    });

    importFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          importData(data);
          showDataStatus(
            "Data imported successfully! Refresh the page to see changes.",
            "success"
          );
        } catch (error) {
          showDataStatus(`Import failed: ${error.message}`, "error");
        }
      };
      reader.readAsText(file);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

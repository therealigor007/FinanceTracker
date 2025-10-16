// Form functionality for Add/Edit Transaction page

import { 
  getTransactionById, 
  addTransaction, 
  updateTransaction 
} from "./storage.js";
import { 
  validateTransaction,
  validateDescription,
  validateAmount,
  validateDate,
  validatePredefinedCategory
} from "./validators.js";
import { showFormStatus } from "./ui.js";

let editingId = null;

function initFormPage() {
  const form = document.getElementById("transaction-form");
  const descInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  const categoryInput = document.getElementById("category");
  const submitBtn = document.querySelector('button[type="submit"]');
  const cancelBtn = document.getElementById("cancel-btn");

  // Check if we're editing an existing transaction
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("id");

  if (editId) {
    const transaction = getTransactionById(Number.parseInt(editId, 10));
    if (transaction) {
      // Update page title and button text
      const pageTitle = document.querySelector("h1");
      if (pageTitle) {
        pageTitle.textContent = "Edit Transaction";
      }
      
      if (submitBtn) {
        submitBtn.textContent = "Update Transaction";
      }

      // Prefill form fields
      descInput.value = transaction.description;
      amountInput.value = transaction.amount;
      dateInput.value = transaction.date;
      categoryInput.value = transaction.category;
      
      editingId = Number.parseInt(editId, 10);
    }
  } else {
    // Set default date to today for new transactions
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }

  // Set up field validation on blur
  descInput.addEventListener("blur", () => validateField("description"));
  amountInput.addEventListener("blur", () => validateField("amount"));
  dateInput.addEventListener("blur", () => validateField("date"));
  categoryInput.addEventListener("blur", () => validateField("category"));

  function validateField(field) {
    const input = document.getElementById(field);
    const errorEl = document.getElementById(`${field}-error`);
    
    if (!input || !errorEl) return true;

    let result;
    const value = input.value.trim();

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
        result = validatePredefinedCategory(value);
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

  // Set up form submission
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get form values
      const description = descInput ? descInput.value.trim() : "";
      const amount = amountInput ? amountInput.value.trim() : "";
      const date = dateInput ? dateInput.value : "";
      const category = categoryInput ? categoryInput.value : "";

      // Validate all fields
      const descValid = validateField("description");
      const amountValid = validateField("amount");
      const dateValid = validateField("date");
      const categoryValid = validateField("category");

      if (!descValid || !amountValid || !dateValid || !categoryValid) {
        showFormStatus("Please fix the errors above", "error");
        return;
      }

      // Create transaction object
      const transaction = {
        description: description,
        amount: Number.parseFloat(amount),
        date: date,
        category: category,
      };

      // Validate the complete transaction
      const validation = validateTransaction(transaction);
      
      if (!validation.valid) {
        // Show field-specific errors
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

      try {
        if (editingId) {
          updateTransaction(editingId, transaction);
          showFormStatus("Transaction updated successfully!", "success");
        } else {
          addTransaction(transaction);
          showFormStatus("Transaction added successfully!", "success");
        }

        // Redirect to dashboard after a short delay to show recent transaction
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } catch (error) {
        console.error("Error saving transaction:", error);
        showFormStatus("Error saving transaction. Please try again.", "error");
      }
    });
  }

  // Set up cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "transactions.html";
    });
  }

  // Handle escape key to cancel
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.location.href = "transactions.html";
    }
  });

  // Focus first input
  if (descInput) {
    descInput.focus();
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFormPage);
} else {
  initFormPage();
}

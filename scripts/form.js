import {
  getTransactionById,
  addTransaction,
  updateTransaction,
} from "./storage.js";
import {
  validateTransaction,
  validateDescription,
  validateAmount,
  validateDate,
  validateCategory,
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

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("id");
  if (editId) {
    const transaction = getTransactionById(Number(editId));
    if (transaction) {
      editingId = Number(editId);

      if (descInput) descInput.value = transaction.description;
      if (amountInput) amountInput.value = transaction.amount.toString();
      if (dateInput) dateInput.value = transaction.date;
      if (categoryInput) categoryInput.value = transaction.category;

      const pageTitle = document.querySelector("h1");
      if (pageTitle) pageTitle.textContent = "Edit Transaction";

      if (submitBtn) submitBtn.textContent = "Update Transaction";
    }
  } else {
    const today = new Date().toISOString().split("T")[0];
    if (dateInput) dateInput.value = today;
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

      const transactionInput = {
        description: descInput?.value.toString().trim() || "",
        amount: amountInput?.value || "",
        date: dateInput?.value || "",
        category: categoryInput?.value || "",
      };

      let valid = true;
      fields.forEach((field) => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) {
        showFormStatus("Please fix the errors above", "error");
        return;
      }
      const validation = validateTransaction(transactionInput);
      if (!validation.valid) {
        Object.keys(validation.errors).forEach((field) => {
          const input = document.getElementById(field);
          const errorEl = document.getElementById(`${field}-error`);
          if (input && errorEl) {
            input.classList.add("error");
            errorEl.textContent = validation.errors[field];
            errorEl.style.display = "block";
          }
        });
        showFormStatus("Please fix the errors above", "error");
        return;
      }
      const transactionToSave = {
        ...transactionInput,
        amount: parseFloat(transactionInput.amount),
      };

      try {
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
      } catch (err) {
        console.error("Error saving transaction:", err);
        showFormStatus("Error saving transaction. Please try again.", "error");
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "transactions.html";
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.location.href = "transactions.html";
    }
  });

  if (descInput) descInput.focus();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFormPage);
} else {
  initFormPage();
}

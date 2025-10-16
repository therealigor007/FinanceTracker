import {
  getSettings,
  saveSettings,
  exportData,
  importData,
  clearAllData,
} from "./storage.js";
import { showDataStatus } from "./ui.js";

function initSettingsPage() {
  const settings = getSettings();

  initBudgetSettings(settings);

  initCurrencySettings(settings);

  initDataManagement();

  initConfirmationModal();
}

function initBudgetSettings(settings) {
  const budgetForm = document.getElementById("budget-form");
  const budgetInput = document.getElementById("budget-cap");
  const budgetError = document.getElementById("budget-error");

  if (budgetInput) {
    budgetInput.value = settings.budgetCap || "";
  }

  if (budgetForm) {
    budgetForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const value = budgetInput.value.trim();
      const currentSettings = getSettings();

      if (value === "") {
        currentSettings.budgetCap = null;
        saveSettings(currentSettings);
        showDataStatus("Budget cap removed", "success");
      } else {
        const amount = Number.parseFloat(value);

        if (isNaN(amount) || amount <= 0) {
          if (budgetError) {
            budgetError.textContent = "Please enter a valid positive number";
            budgetError.style.display = "block";
          }
          return;
        }

        if (amount > 999999.99) {
          if (budgetError) {
            budgetError.textContent = "Budget cap cannot exceed 999,999.99";
            budgetError.style.display = "block";
          }
          return;
        }

        currentSettings.budgetCap = amount;
        saveSettings(currentSettings);
        const verify = getSettings();
        showDataStatus("Budget cap saved successfully", "success");
      }

      if (budgetError) {
        budgetError.style.display = "none";
      }

      window.dispatchEvent(
        new CustomEvent("settingsUpdated", {
          detail: { settings: getSettings() },
        })
      );
    });
  }
}

function initCurrencySettings(settings) {
  const currencyForm = document.getElementById("currency-form");
  const baseCurrencySelect = document.getElementById("base-currency");

  if (baseCurrencySelect) {
    baseCurrencySelect.value = settings.baseCurrency || "USD";
  }

  if (currencyForm) {
    currencyForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const currentSettings = getSettings();
      const newCurrency = baseCurrencySelect.value;

      currentSettings.baseCurrency = newCurrency;
      saveSettings(currentSettings);

      const verify = getSettings();

      showDataStatus("Base currency saved successfully!", "success");

      window.dispatchEvent(
        new CustomEvent("currencyChanged", {
          detail: { baseCurrency: currentSettings.baseCurrency },
        })
      );
    });
  }
}

function initDataManagement() {
  const exportBtn = document.getElementById("export-btn");
  const importFile = document.getElementById("import-file");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const clearDataBtn = document.getElementById("clear-data-btn");

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      try {
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
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showDataStatus("Data exported successfully", "success");
      } catch (error) {
        console.error("Export error:", error);
        showDataStatus("Error exporting data", "error");
      }
    });
  }

  if (importFile) {
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
          console.error("Import error:", error);
          showDataStatus(`Import failed: ${error.message}`, "error");
        }
      };
      reader.readAsText(file);

      e.target.value = "";
    });
  }

  if (loadSampleBtn) {
    loadSampleBtn.addEventListener("click", async () => {
      try {
        const response = await fetch("./seed.json");
        const seedData = await response.json();
        importData(seedData);
        showDataStatus(
          "Sample data loaded successfully! Refresh the page to see changes.",
          "success"
        );
      } catch (error) {
        console.error("Load sample error:", error);
        showDataStatus("Error loading sample data", "error");
      }
    });
  }

  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      showConfirmationModal(
        "Clear All Data",
        "Are you sure you want to delete all transactions and settings? This action cannot be undone.",
        () => {
          try {
            clearAllData();
            showDataStatus(
              "All data cleared successfully. Refresh the page to see changes.",
              "success"
            );

            window.dispatchEvent(new CustomEvent("dataCleared"));
          } catch (error) {
            console.error("Clear data error:", error);
            showDataStatus("Error clearing data", "error");
          }
        }
      );
    });
  }
}

function initConfirmationModal() {
  const modal = document.getElementById("confirm-modal");
  const title = document.getElementById("confirm-modal-title");
  const message = document.getElementById("confirm-modal-message");
  const confirmBtn = document.getElementById("confirm-action-btn");
  const cancelBtn = document.getElementById("cancel-confirm-btn");

  if (!modal || !title || !message || !confirmBtn || !cancelBtn) return;

  let confirmCallback = null;

  window.showConfirmationModal = (modalTitle, modalMessage, callback) => {
    title.textContent = modalTitle;
    message.textContent = modalMessage;
    confirmCallback = callback;
    modal.removeAttribute("hidden");

    setTimeout(() => confirmBtn.focus(), 100);
  };

  function hideModal() {
    modal.setAttribute("hidden", "");
    confirmCallback = null;
  }

  confirmBtn.addEventListener("click", () => {
    if (confirmCallback) {
      confirmCallback();
    }
    hideModal();
  });

  cancelBtn.addEventListener("click", hideModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
      hideModal();
    }
  });

  const overlay = modal.querySelector(".modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", hideModal);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSettingsPage);
} else {
  initSettingsPage();
}

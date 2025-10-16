import { getTransactions, getSettings } from "./storage.js";

function initDashboard() {
  updateDashboard();

  window.addEventListener("currencyChanged", () => {
    updateDashboard();
  });

  window.addEventListener("dataCleared", () => {
    updateDashboard();
  });
}

function updateDashboard() {
  const transactions = getTransactions();
  const settings = getSettings();
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    RWF: "Fr",
  };
  const currencySymbol =
    currencySymbols[settings.baseCurrency] || settings.baseCurrency;

  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekSpending = transactions
    .filter((t) => new Date(t.date) >= sevenDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = {};
  transactions.forEach((t) => {
    categoryBreakdown[t.category] =
      (categoryBreakdown[t.category] || 0) + t.amount;
  });

  const topCategory =
    Object.keys(categoryBreakdown).length > 0
      ? Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0][0]
      : "None";

  updateBudgetStatus(totalSpending, settings.budgetCap, currencySymbol);
  updateStats(
    transactions.length,
    totalSpending,
    topCategory,
    weekSpending,
    currencySymbol
  );
  updateRecentTransactions(transactions.slice(-5).reverse(), currencySymbol);
}

function updateBudgetStatus(spent, budgetCap, currencySymbol) {
  const spentEl = document.getElementById("spent-amount");
  const budgetEl = document.getElementById("budget-amount");
  const progressEl = document.getElementById("budget-progress");
  const messageEl = document.getElementById("budget-status-message");
  const progressBarEl = document.querySelector('[role="progressbar"]');

  if (spentEl) {
    spentEl.textContent = `${currencySymbol}${spent.toFixed(2)}`;
  }

  if (budgetEl) {
    const budgetText = budgetCap
      ? `${currencySymbol}${budgetCap.toFixed(2)}`
      : "Not set";
    budgetEl.textContent = budgetText;
  }

  if (budgetCap && budgetCap > 0) {
    const percentage = Math.min((spent / budgetCap) * 100, 100);
    if (progressEl) {
      progressEl.style.width = `${percentage}%`;
      progressEl.className = "progress-fill";

      if (percentage >= 100) {
        progressEl.classList.add("budget-exceeded");
      } else if (percentage >= 80) {
        progressEl.classList.add("budget-warning");
      }
    }

    if (progressBarEl) {
      progressBarEl.setAttribute("aria-valuenow", Math.round(percentage));
      progressBarEl.setAttribute("aria-valuemax", 100);
    }

    if (messageEl) {
      if (spent > budgetCap) {
        messageEl.textContent = `⚠️ You've exceeded your budget by ${currencySymbol}${(
          spent - budgetCap
        ).toFixed(2)}`;
        messageEl.className = "budget-message warning";
      } else if (percentage >= 80) {
        messageEl.textContent = `⚡ You're using ${Math.round(
          percentage
        )}% of your budget`;
        messageEl.className = "budget-message warning";
      } else {
        messageEl.textContent = `✓ You're on track! ${currencySymbol}${(
          budgetCap - spent
        ).toFixed(2)} remaining`;
        messageEl.className = "budget-message success";
      }
    }
  } else {
    if (messageEl) {
      messageEl.textContent = "Set a budget in Settings to track your spending";
      messageEl.className = "budget-message info";
    }
    if (progressEl) {
      progressEl.style.width = "0%";
    }
  }
}

function updateStats(
  totalTxns,
  totalSpent,
  topCategory,
  weekSpent,
  currencySymbol
) {
  const totalTxnsEl = document.getElementById("total-transactions");
  const totalSpentEl = document.getElementById("total-spending");
  const topCategoryEl = document.getElementById("top-category");
  const weekSpentEl = document.getElementById("week-spending");

  if (totalTxnsEl) totalTxnsEl.textContent = totalTxns.toString();
  if (totalSpentEl)
    totalSpentEl.textContent = `${currencySymbol}${totalSpent.toFixed(2)}`;
  if (topCategoryEl) topCategoryEl.textContent = topCategory;
  if (weekSpentEl)
    weekSpentEl.textContent = `${currencySymbol}${weekSpent.toFixed(2)}`;
}

function updateRecentTransactions(transactions, currencySymbol) {
  const container = document.getElementById("recent-transactions");
  if (!container) return;

  if (transactions.length === 0) {
    container.innerHTML = `
      <p class="empty-state">
        No transactions yet.
        <a href="add.html">Add your first transaction</a>
      </p>
    `;
    return;
  }

  const categoryColors = {
    Food: "#FF6B6B",
    Transport: "#4ECDC4",
    Entertainment: "#FFE66D",
    Education: "#95E1D3",
    Shopping: "#F38181",
    Bills: "#AA96DA",
    Health: "#FCBAD3",
    Other: "#A8D8EA",
  };

  container.innerHTML = transactions
    .map(
      (t) => `
    <div class="transaction-item">
      <div class="transaction-left">
        <div
          class="transaction-category-badge"
          style="background-color: ${categoryColors[t.category] || "#999"}"
        >
          ${t.category.charAt(0)}
        </div>
        <div class="transaction-details">
          <p class="transaction-description">${t.description}</p>
          <p class="transaction-date">${new Date(
            t.date
          ).toLocaleDateString()}</p>
        </div>
      </div>
      <p class="transaction-amount">${currencySymbol}${t.amount.toFixed(2)}</p>
    </div>
  `
    )
    .join("");
}

window.addEventListener("storage", () => {
  updateDashboard();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    updateDashboard();
  }
});

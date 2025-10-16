import { formatCurrency, formatDate } from "./state.js";

export function renderBudgetStatus(budgetStatus) {
  const spentEl = document.getElementById("spent-amount");
  const budgetEl = document.getElementById("budget-amount");
  const progressEl = document.getElementById("budget-progress");
  const messageEl = document.getElementById("budget-status-message");

  if (!spentEl || !budgetEl || !progressEl || !messageEl) return;

  spentEl.textContent = formatCurrency(budgetStatus.spent);
  budgetEl.textContent = budgetStatus.budget
    ? formatCurrency(budgetStatus.budget)
    : "Not set";

  progressEl.style.width = `${budgetStatus.percentage}%`;
  progressEl.className = "progress-fill";
  if (budgetStatus.status === "warning") progressEl.classList.add("warning");
  if (budgetStatus.status === "danger") progressEl.classList.add("danger");

  messageEl.textContent = budgetStatus.message;
  messageEl.className = `budget-message ${budgetStatus.status}`;

  const progressBar = progressEl.parentElement;
  progressBar.setAttribute("aria-valuenow", budgetStatus.percentage.toFixed(0));

  if (budgetStatus.status === "danger") {
    messageEl.setAttribute("aria-live", "assertive");
  } else {
    messageEl.setAttribute("aria-live", "polite");
  }
}

export function renderStats(stats) {
  const totalEl = document.getElementById("total-transactions");
  const spendingEl = document.getElementById("total-spending");
  const categoryEl = document.getElementById("top-category");
  const weekEl = document.getElementById("week-spending");

  if (totalEl) totalEl.textContent = stats.totalTransactions;
  if (spendingEl) spendingEl.textContent = formatCurrency(stats.totalSpending);
  if (categoryEl) categoryEl.textContent = stats.topCategory;
  if (weekEl) weekEl.textContent = formatCurrency(stats.weekSpending);
}

export function renderRecentTransactions(transactions, limit = 5) {
  const container = document.getElementById("recent-transactions");
  if (!container) return;

  if (transactions.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No transactions yet. <a href="add.html">Add your first transaction</a></p>';
    return;
  }

  const recent = transactions.slice(0, limit);
  container.innerHTML = recent
    .map(
      (t) => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">${escapeHtml(
                  t.description
                )}</div>
                <div class="transaction-meta">${t.category} • ${formatDate(
        t.date
      )}</div>
            </div>
            <div class="transaction-amount">${formatCurrency(t.amount)}</div>
        </div>
    `
    )
    .join("");
}

export function renderTransactionsTable(transactions) {
  const tbody = document.getElementById("transactions-tbody");
  if (!tbody) return;

  if (transactions.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="empty-state">No transactions found. <a href="add.html">Add your first transaction</a></td></tr>';
    return;
  }

  tbody.innerHTML = transactions
    .map(
      (t) => `
        <tr>
            <td>${formatDate(t.date)}</td>
            <td>${escapeHtml(t.description)}</td>
            <td>${t.category}</td>
            <td>${formatCurrency(t.amount)}</td>
            <td>
                <button class="btn btn-secondary" onclick="window.editTransaction(${
                  t.id
                })" aria-label="Edit transaction: ${escapeHtml(
        t.description
      )}">Edit</button>
                <button class="btn btn-danger" onclick="window.confirmDelete(${
                  t.id
                })" aria-label="Delete transaction: ${escapeHtml(
        t.description
      )}">Delete</button>
            </td>
        </tr>
    `
    )
    .join("");
}

export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.removeAttribute("hidden");

  const firstButton = modal.querySelector("button");
  if (firstButton) {
    setTimeout(() => firstButton.focus(), 100);
  }

  trapFocus(modal);
}

export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.setAttribute("hidden", "");
}

function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  element.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  });
}

export function showFormStatus(message, type = "success") {
  const statusEl = document.getElementById("form-status");
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = `form-status ${type}`;
  statusEl.style.display = "block";

  setTimeout(() => {
    statusEl.style.display = "none";
  }, 5000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function showDataStatus(message, type = "success") {
  const statusEl = document.getElementById("data-status");
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = `form-status ${type}`;
  statusEl.style.display = "block";

  setTimeout(() => {
    statusEl.style.display = "none";
  }, 5000);
}

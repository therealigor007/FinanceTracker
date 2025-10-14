// State management module

import { getTransactions, getSettings } from "./storage.js";

// Calculate statistics from transactions
export function calculateStats(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      totalTransactions: 0,
      totalSpending: 0,
      topCategory: "None",
      weekSpending: 0,
      categoryTotals: {},
    };
  }

  const totalSpending = transactions.reduce(
    (sum, t) => sum + Number.parseFloat(t.amount),
    0
  );

  // Calculate category totals
  const categoryTotals = {};
  transactions.forEach((t) => {
    categoryTotals[t.category] =
      (categoryTotals[t.category] || 0) + Number.parseFloat(t.amount);
  });

  // Find top category
  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "None";

  // Calculate last 7 days spending
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekSpending = transactions
    .filter((t) => new Date(t.date) >= sevenDaysAgo)
    .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0);

  return {
    totalTransactions: transactions.length,
    totalSpending,
    topCategory,
    weekSpending,
    categoryTotals,
  };
}

// Calculate budget status
export function calculateBudgetStatus() {
  const transactions = getTransactions();
  const settings = getSettings();
  const stats = calculateStats(transactions);

  if (!settings.budgetCap) {
    return {
      spent: stats.totalSpending,
      budget: null,
      percentage: 0,
      status: "none",
      message: "No budget set",
    };
  }

  const percentage = (stats.totalSpending / settings.budgetCap) * 100;
  let status = "success";
  let message = `You're within budget`;

  if (percentage >= 100) {
    status = "danger";
    message = `You've exceeded your budget by $${(
      stats.totalSpending - settings.budgetCap
    ).toFixed(2)}`;
  } else if (percentage >= 80) {
    status = "warning";
    message = `You're approaching your budget limit (${percentage.toFixed(
      0
    )}% used)`;
  }

  return {
    spent: stats.totalSpending,
    budget: settings.budgetCap,
    percentage: Math.min(percentage, 100),
    status,
    message,
  };
}

// Sort transactions
export function sortTransactions(transactions, field, direction = "asc") {
  const sorted = [...transactions];

  sorted.sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle amount as number
    if (field === "amount") {
      aVal = Number.parseFloat(aVal);
      bVal = Number.parseFloat(bVal);
    }

    // Handle date
    if (field === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

// Format currency
export function formatCurrency(amount, currency = "USD") {
  const symbols = {
    USD: "$",
    EUR: "€",
    RWF: "FRw",
  };

  return `${symbols[currency] || "$"}${Number.parseFloat(amount).toFixed(2)}`;
}

// Format date for display
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Convert currency
export function convertCurrency(
  amount,
  fromCurrency,
  toCurrency,
  exchangeRates
) {
  const amountInUSD = amount / exchangeRates[fromCurrency];
  return amountInUSD * exchangeRates[toCurrency];
}

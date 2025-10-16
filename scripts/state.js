import { getSettings } from "./storage.js";

export function sortTransactions(transactions, field, direction = "asc") {
  const sorted = [...transactions];

  sorted.sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    if (field === "amount") {
      aVal = Number.parseFloat(aVal);
      bVal = Number.parseFloat(bVal);
    }

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

export function formatCurrency(amount, currency = null) {
  if (!currency) {
    const settings = getSettings();
    currency = settings.baseCurrency || "USD";
  }

  const symbols = {
    USD: "$",
    EUR: "€",
    RWF: "FRw",
  };

  const num = Number.parseFloat(amount) || 0;
  return `${symbols[currency] || "$"}${num.toFixed(2)}`;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

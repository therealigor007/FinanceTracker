// Storage module - handles localStorage operations

const STORAGE_KEYS = {
  TRANSACTIONS: "financeTracker_transactions",
  SETTINGS: "financeTracker_settings",
  NEXT_ID: "financeTracker_nextId",
};

// Get all transactions from localStorage
export function getTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading transactions:", error);
    return [];
  }
}

// Save transactions to localStorage
export function saveTransactions(transactions) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(transactions)
    );
    return true;
  } catch (error) {
    console.error("Error saving transactions:", error);
    return false;
  }
}

// Get a single transaction by ID
export function getTransactionById(id) {
  const transactions = getTransactions();
  return transactions.find((t) => t.id === id);
}

// Add a new transaction
export function addTransaction(transaction) {
  const transactions = getTransactions();
  const newTransaction = {
    ...transaction,
    id: getNextId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
}

// Update an existing transaction
export function updateTransaction(id, updates) {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  transactions[index] = {
    ...transactions[index],
    ...updates,
    id: transactions[index].id, // Preserve ID
    createdAt: transactions[index].createdAt, // Preserve creation date
    updatedAt: new Date().toISOString(),
  };

  saveTransactions(transactions);
  return transactions[index];
}

// Delete a transaction
export function deleteTransaction(id) {
  const transactions = getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);
  if (filtered.length === transactions.length) return false;
  saveTransactions(filtered);
  return true;
}

// Get and increment the next ID
function getNextId() {
  const nextId = Number.parseInt(
    localStorage.getItem(STORAGE_KEYS.NEXT_ID) || "1",
    10
  );
  localStorage.setItem(STORAGE_KEYS.NEXT_ID, (nextId + 1).toString());
  return nextId;
}

// Settings management
export function getSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          budgetCap: null,
          baseCurrency: "USD",
          exchangeRates: {
            USD: 1,
            RWF: 1250, // Rwandan Franc
            EUR: 0.92,
          },
        };
  } catch (error) {
    console.error("Error reading settings:", error);
    return {
      budgetCap: null,
      baseCurrency: "USD",
      exchangeRates: { USD: 1, RWF: 1250, EUR: 0.92 },
    };
  }
}

// Save settings
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error("Error saving settings:", error);
    return false;
  }
}

// Clear all data
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NEXT_ID);
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    return false;
  }
}

// Export data as JSON
export function exportData() {
  return {
    transactions: getTransactions(),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
    version: "1.0",
  };
}

// Import data from JSON
export function importData(data) {
  try {
    if (!data || !Array.isArray(data.transactions)) {
      throw new Error("Invalid data format");
    }

    // Validate each transaction
    for (const transaction of data.transactions) {
      if (
        !transaction.description ||
        !transaction.amount ||
        !transaction.category ||
        !transaction.date
      ) {
        throw new Error("Invalid transaction data");
      }
    }

    saveTransactions(data.transactions);
    if (data.settings) {
      saveSettings(data.settings);
    }

    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    throw error;
  }
}

const STORAGE_KEYS = {
  TRANSACTIONS: "expense_tracker_transactions",
  SETTINGS: "expense_tracker_settings",
  NEXT_ID: "expense_tracker_next_id",
};

let nextId = 1;

async function seedInitialData() {
  const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

  if (!storedTransactions || JSON.parse(storedTransactions).length === 0) {
    try {
      const response = await fetch("./seed.json");
      const seedData = await response.json();

      if (seedData.transactions && Array.isArray(seedData.transactions)) {
        const processedTransactions = seedData.transactions.map((t) => ({
          ...t,
          id: Number.parseInt(t.id, 10),
          amount: Number.parseFloat(t.amount),
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString(),
        }));

        localStorage.setItem(
          STORAGE_KEYS.TRANSACTIONS,
          JSON.stringify(processedTransactions)
        );

        const maxId = Math.max(...processedTransactions.map((t) => t.id));
        nextId = maxId + 1;
        localStorage.setItem(STORAGE_KEYS.NEXT_ID, nextId.toString());
      }

      if (seedData.settings) {
        const defaultSettings = {
          budgetCap: null,
          baseCurrency: "USD",
          exchangeRates: {
            USD: 1,
            EUR: 0.92,
            RWF: 1250,
          },
        };
        const mergedSettings = { ...defaultSettings, ...seedData.settings };
        localStorage.setItem(
          STORAGE_KEYS.SETTINGS,
          JSON.stringify(mergedSettings)
        );
      }
    } catch (error) {
      console.warn("Failed to load seed data:", error);
    }
  }

  const storedNextId = localStorage.getItem(STORAGE_KEYS.NEXT_ID);
  if (storedNextId) {
    nextId = Number.parseInt(storedNextId, 10);
  }
}

seedInitialData();

export function getTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting transactions:", error);
    return [];
  }
}

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

export function getTransactionById(id) {
  const transactions = getTransactions();
  return transactions.find((t) => t.id === id);
}

export function addTransaction(transaction) {
  try {
    const transactions = getTransactions();
    const newTransaction = {
      ...transaction,
      id: getNextId(),
      amount: Number.parseFloat(transaction.amount),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    saveTransactions(transactions);
    return newTransaction;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
}

export function updateTransaction(id, updates) {
  try {
    const transactions = getTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;

    transactions[index] = {
      ...transactions[index],
      ...updates,
      id: transactions[index].id,
      amount: Number.parseFloat(updates.amount ?? transactions[index].amount),
      createdAt: transactions[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    saveTransactions(transactions);
    return transactions[index];
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
}

export function deleteTransaction(id) {
  try {
    const transactions = getTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    const wasDeleted = filtered.length < transactions.length;
    if (wasDeleted) {
      saveTransactions(filtered);
    }
    return wasDeleted;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }
}

function getNextId() {
  const id = nextId;
  nextId++;
  localStorage.setItem(STORAGE_KEYS.NEXT_ID, nextId.toString());
  return id;
}

export function getSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaultSettings = {
      budgetCap: null,
      baseCurrency: "USD",
      exchangeRates: {
        USD: 1,
        EUR: 0.92,
        RWF: 1250,
      },
    };

    if (stored) {
      const parsed = JSON.parse(stored);
      const merged = { ...defaultSettings, ...parsed };
      return merged;
    }

    return defaultSettings;
  } catch (error) {
    console.error("Error getting settings:", error);
    return {
      budgetCap: null,
      baseCurrency: "USD",
      exchangeRates: { USD: 1, EUR: 0.92, RWF: 1250 },
    };
  }
}

export function saveSettings(settings) {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Error saving settings:", error);
    return false;
  }
}

export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NEXT_ID);
    nextId = 1;
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    return false;
  }
}

export function exportData() {
  return {
    transactions: getTransactions(),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
    version: "1.0",
  };
}

export function importData(data) {
  try {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data format - must be an object");
    }

    if (!Array.isArray(data.transactions)) {
      throw new Error("Invalid data format - transactions must be an array");
    }

    const processedTransactions = data.transactions.map(
      (transaction, index) => {
        if (
          !transaction.description ||
          transaction.amount === undefined ||
          transaction.amount === null ||
          !transaction.category ||
          !transaction.date
        ) {
          throw new Error(
            `Invalid transaction data at index ${index}: missing required fields`
          );
        }

        return {
          ...transaction,
          id: Number.parseInt(transaction.id, 10) || index + 1,
          amount: Number.parseFloat(transaction.amount),
          createdAt: transaction.createdAt || new Date().toISOString(),
          updatedAt: transaction.updatedAt || new Date().toISOString(),
        };
      }
    );

    const maxId = Math.max(...processedTransactions.map((t) => t.id));
    nextId = maxId + 1;
    localStorage.setItem(STORAGE_KEYS.NEXT_ID, nextId.toString());

    saveTransactions(processedTransactions);

    if (data.settings && typeof data.settings === "object") {
      saveSettings(data.settings);
    }

    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    throw error;
  }
}

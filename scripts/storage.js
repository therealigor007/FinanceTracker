const STORAGE_KEYS = {
  TRANSACTIONS: "financeTracker_transactions",
  SETTINGS: "financeTracker_settings",
  NEXT_ID: "financeTracker_nextId",
};

// First-run seeding
async function seedInitialData() {
  const transactions = getTransactions();
  if (transactions.length === 0) {
    try {
      const response = await fetch('./seed.json');
      const seedData = await response.json();
      
      if (seedData.transactions && Array.isArray(seedData.transactions)) {
        // Convert string IDs to numbers and ensure proper structure
        const processedTransactions = seedData.transactions.map(t => ({
          ...t,
          id: Number.parseInt(t.id, 10),
          amount: Number.parseFloat(t.amount),
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString()
        }));
        
        saveTransactions(processedTransactions);
        
        // Set NEXT_ID to max existing ID + 1
        const maxId = Math.max(...processedTransactions.map(t => t.id));
        localStorage.setItem(STORAGE_KEYS.NEXT_ID, (maxId + 1).toString());
      }
      
      if (seedData.settings) {
        saveSettings(seedData.settings);
      }
    } catch (error) {
      console.warn('Failed to load seed data:', error);
    }
  }
}

// Initialize seeding on module load
seedInitialData();

export function getTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading transactions:", error);
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

export function updateTransaction(id, updates) {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  transactions[index] = {
    ...transactions[index],
    ...updates,
    id: transactions[index].id,
    createdAt: transactions[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  saveTransactions(transactions);
  return transactions[index];
}

export function deleteTransaction(id) {
  const transactions = getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);
  if (filtered.length === transactions.length) return false;
  saveTransactions(filtered);
  return true;
}

function getNextId() {
  const nextId = Number.parseInt(
    localStorage.getItem(STORAGE_KEYS.NEXT_ID) || "1",
    10
  );
  localStorage.setItem(STORAGE_KEYS.NEXT_ID, (nextId + 1).toString());
  return nextId;
}

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
            EUR: 0.92,
            RWF: 1250,
          },
        };
  } catch (error) {
    console.error("Error reading settings:", error);
    return {
      budgetCap: null,
      baseCurrency: "USD",
      exchangeRates: { USD: 1, EUR: 0.92, RWF: 1250 },
    };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
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
    if (!data || typeof data !== 'object') {
      throw new Error("Invalid data format - must be an object");
    }

    if (!Array.isArray(data.transactions)) {
      throw new Error("Invalid data format - transactions must be an array");
    }

    // Validate and process transactions
    const processedTransactions = data.transactions.map((transaction, index) => {
      if (
        !transaction.description ||
        transaction.amount === undefined ||
        transaction.amount === null ||
        !transaction.category ||
        !transaction.date
      ) {
        throw new Error(`Invalid transaction data at index ${index}: missing required fields`);
      }

      // Coerce types and ensure proper structure
      return {
        ...transaction,
        id: Number.parseInt(transaction.id, 10) || (index + 1),
        amount: Number.parseFloat(transaction.amount),
        createdAt: transaction.createdAt || new Date().toISOString(),
        updatedAt: transaction.updatedAt || new Date().toISOString()
      };
    });

    // Set NEXT_ID to max existing ID + 1
    const maxId = Math.max(...processedTransactions.map(t => t.id));
    localStorage.setItem(STORAGE_KEYS.NEXT_ID, (maxId + 1).toString());

    saveTransactions(processedTransactions);
    
    // Merge settings if provided
    if (data.settings && typeof data.settings === 'object') {
      const currentSettings = getSettings();
      const mergedSettings = { ...currentSettings, ...data.settings };
      saveSettings(mergedSettings);
    }

    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    throw error;
  }
}

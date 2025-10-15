import transactionsData from "@/services/mockData/transactions.json";

// Simulate localStorage for data persistence
const STORAGE_KEY = "stockkeep_transactions";

const getStoredTransactions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : transactionsData;
  } catch (error) {
    console.error("Error parsing stored transactions:", error);
    return transactionsData;
  }
};

const saveTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error("Error saving transactions:", error);
  }
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const transactionService = {
  async getAll() {
    await delay(250);
    return [...getStoredTransactions()].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getById(id) {
    await delay(200);
    const transactions = getStoredTransactions();
    return transactions.find(transaction => transaction.Id === parseInt(id));
  },

  async getByProduct(productId) {
    await delay(200);
    const transactions = getStoredTransactions();
    return transactions
      .filter(transaction => transaction.productId === parseInt(productId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async create(transactionData) {
    await delay(300);
    const transactions = getStoredTransactions();
    const maxId = transactions.length > 0 ? Math.max(...transactions.map(t => t.Id)) : 0;
    
    const newTransaction = {
      ...transactionData,
      Id: maxId + 1,
      date: new Date().toISOString()
    };

    transactions.push(newTransaction);
    saveTransactions(transactions);
    return newTransaction;
  },

  async getRecent(limit = 10) {
    await delay(200);
    const transactions = getStoredTransactions();
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  },

  async getByDateRange(startDate, endDate) {
    await delay(250);
    const transactions = getStoredTransactions();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }
};
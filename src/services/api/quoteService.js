import quotesData from "@/services/mockData/quotes.json";

const STORAGE_KEY = "stockkeep_quotes";

const getStoredQuotes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : quotesData;
  } catch (error) {
    console.error("Error parsing stored quotes:", error);
    return quotesData;
  }
};

const saveQuotes = (quotes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (error) {
    console.error("Error saving quotes:", error);
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateQuoteNumber = () => {
  const prefix = "QT";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
};

export const quoteService = {
  async getAll() {
    await delay(300);
    return [...getStoredQuotes()];
  },

  async getById(id) {
    await delay(200);
    const quotes = getStoredQuotes();
    return quotes.find(quote => quote.Id === parseInt(id));
  },

  async create(quoteData) {
    await delay(400);
    const quotes = getStoredQuotes();
    const maxId = quotes.length > 0 ? Math.max(...quotes.map(q => q.Id)) : 0;
    
    const newQuote = {
      ...quoteData,
      Id: maxId + 1,
      quoteNumber: generateQuoteNumber(),
      status: quoteData.status || "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    quotes.push(newQuote);
    saveQuotes(quotes);
    return newQuote;
  },

  async update(id, quoteData) {
    await delay(400);
    const quotes = getStoredQuotes();
    const index = quotes.findIndex(quote => quote.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Quote not found");
    }

    quotes[index] = {
      ...quotes[index],
      ...quoteData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };

    saveQuotes(quotes);
    return quotes[index];
  },

  async delete(id) {
    await delay(300);
    const quotes = getStoredQuotes();
    const filteredQuotes = quotes.filter(quote => quote.Id !== parseInt(id));
    
    if (filteredQuotes.length === quotes.length) {
      throw new Error("Quote not found");
    }

    saveQuotes(filteredQuotes);
    return true;
  },

  async updateStatus(id, status) {
    await delay(300);
    const quotes = getStoredQuotes();
    const index = quotes.findIndex(quote => quote.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Quote not found");
    }

    quotes[index] = {
      ...quotes[index],
      status,
      updatedAt: new Date().toISOString()
    };

    saveQuotes(quotes);
    return quotes[index];
  },

  async getByStatus(status) {
    await delay(200);
    const quotes = getStoredQuotes();
    return quotes.filter(quote => quote.status === status);
  },

  async getByCustomer(customerName) {
    await delay(200);
    const quotes = getStoredQuotes();
    return quotes.filter(quote => 
      quote.customerName.toLowerCase().includes(customerName.toLowerCase())
    );
  }
};
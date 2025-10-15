import productsData from "@/services/mockData/products.json";

// Simulate localStorage for data persistence
const STORAGE_KEY = "stockkeep_products";

const getStoredProducts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : productsData;
  } catch (error) {
    console.error("Error parsing stored products:", error);
    return productsData;
  }
};

const saveProducts = (products) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Error saving products:", error);
  }
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  async getAll() {
    await delay(300);
    return [...getStoredProducts()];
  },

  async getById(id) {
    await delay(200);
    const products = getStoredProducts();
    return products.find(product => product.Id === parseInt(id));
  },

  async create(productData) {
    await delay(400);
    const products = getStoredProducts();
    const maxId = products.length > 0 ? Math.max(...products.map(p => p.Id)) : 0;
    
    const newProduct = {
      ...productData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.push(newProduct);
    saveProducts(products);
    return newProduct;
  },

  async update(id, productData) {
    await delay(400);
    const products = getStoredProducts();
    const index = products.findIndex(product => product.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Product not found");
    }

    products[index] = {
      ...products[index],
      ...productData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };

    saveProducts(products);
    return products[index];
  },

  async delete(id) {
    await delay(300);
    const products = getStoredProducts();
    const filteredProducts = products.filter(product => product.Id !== parseInt(id));
    
    if (filteredProducts.length === products.length) {
      throw new Error("Product not found");
    }

    saveProducts(filteredProducts);
    return true;
  },

  async getLowStockProducts(threshold = null) {
    await delay(250);
    const products = getStoredProducts();
    return products.filter(product => {
      const stockThreshold = threshold !== null ? threshold : product.minStockLevel;
      return product.quantity <= stockThreshold;
    });
  },

  async getByCategory(categoryId) {
    await delay(200);
    const products = getStoredProducts();
    return products.filter(product => product.category === parseInt(categoryId));
  },

  async getBySupplier(supplierId) {
    await delay(200);
    const products = getStoredProducts();
    return products.filter(product => product.supplier === parseInt(supplierId));
  },

  async updateStock(id, quantity, type = "adjustment", notes = "") {
    await delay(300);
    const products = getStoredProducts();
    const productIndex = products.findIndex(product => product.Id === parseInt(id));
    
    if (productIndex === -1) {
      throw new Error("Product not found");
    }

    const product = products[productIndex];
    const newQuantity = type === "add" ? product.quantity + quantity : quantity;

    products[productIndex] = {
      ...product,
      quantity: Math.max(0, newQuantity),
      updatedAt: new Date().toISOString()
    };

    saveProducts(products);
    return products[productIndex];
  }
};
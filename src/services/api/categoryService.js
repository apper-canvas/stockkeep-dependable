import categoriesData from "@/services/mockData/categories.json";
import { productService } from "./productService";

// Simulate localStorage for data persistence
const STORAGE_KEY = "stockkeep_categories";

const getStoredCategories = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : categoriesData;
  } catch (error) {
    console.error("Error parsing stored categories:", error);
    return categoriesData;
  }
};

const saveCategories = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error("Error saving categories:", error);
  }
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const categoryService = {
  async getAll() {
    await delay(250);
    const categories = [...getStoredCategories()];
    
    // Update product counts
    const products = await productService.getAll();
    const updatedCategories = categories.map(category => ({
      ...category,
      productCount: products.filter(p => p.category === category.Id).length
    }));

    return updatedCategories;
  },

  async getById(id) {
    await delay(200);
    const categories = getStoredCategories();
    return categories.find(category => category.Id === parseInt(id));
  },

  async create(categoryData) {
    await delay(300);
    const categories = getStoredCategories();
    const maxId = categories.length > 0 ? Math.max(...categories.map(c => c.Id)) : 0;
    
    const newCategory = {
      ...categoryData,
      Id: maxId + 1,
      productCount: 0
    };

    categories.push(newCategory);
    saveCategories(categories);
    return newCategory;
  },

  async update(id, categoryData) {
    await delay(300);
    const categories = getStoredCategories();
    const index = categories.findIndex(category => category.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Category not found");
    }

    categories[index] = {
      ...categories[index],
      ...categoryData,
      Id: parseInt(id)
    };

    saveCategories(categories);
    return categories[index];
  },

  async delete(id) {
    await delay(300);
    const categories = getStoredCategories();
    const products = await productService.getAll();
    
    // Check if category has products
    const hasProducts = products.some(p => p.category === parseInt(id));
    if (hasProducts) {
      throw new Error("Cannot delete category that contains products");
    }

    const filteredCategories = categories.filter(category => category.Id !== parseInt(id));
    
    if (filteredCategories.length === categories.length) {
      throw new Error("Category not found");
    }

    saveCategories(filteredCategories);
    return true;
  }
};
import suppliersData from "@/services/mockData/suppliers.json";
import { productService } from "./productService";

// Simulate localStorage for data persistence
const STORAGE_KEY = "stockkeep_suppliers";

const getStoredSuppliers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : suppliersData;
  } catch (error) {
    console.error("Error parsing stored suppliers:", error);
    return suppliersData;
  }
};

const saveSuppliers = (suppliers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
  } catch (error) {
    console.error("Error saving suppliers:", error);
  }
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const supplierService = {
  async getAll() {
    await delay(250);
    return [...getStoredSuppliers()];
  },

  async getById(id) {
    await delay(200);
    const suppliers = getStoredSuppliers();
    return suppliers.find(supplier => supplier.Id === parseInt(id));
  },

async create(supplierData) {
    await delay(350);
    const suppliers = getStoredSuppliers();
    const maxId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.Id)) : 0;
    
    const newSupplier = {
      ...supplierData,
      Id: maxId + 1,
      paymentTerms: supplierData.paymentTerms || 'Net 30',
      leadTimeDays: supplierData.leadTimeDays ? parseInt(supplierData.leadTimeDays) : 14,
      performanceRating: supplierData.performanceRating ? parseFloat(supplierData.performanceRating) : 0,
      minimumOrderQuantity: supplierData.minimumOrderQuantity ? parseInt(supplierData.minimumOrderQuantity) : 0,
      notes: supplierData.notes || '',
      contractStartDate: supplierData.contractStartDate || null,
      contractEndDate: supplierData.contractEndDate || null,
      renewalReminderDays: supplierData.renewalReminderDays ? parseInt(supplierData.renewalReminderDays) : 30,
      contractValue: supplierData.contractValue ? parseFloat(supplierData.contractValue) : 0,
      contractTerms: supplierData.contractTerms || ''
    };

    suppliers.push(newSupplier);
    saveSuppliers(suppliers);
    return newSupplier;
  },

async update(id, supplierData) {
    await delay(350);
    const suppliers = getStoredSuppliers();
    const index = suppliers.findIndex(supplier => supplier.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Supplier not found");
    }

    suppliers[index] = {
      ...suppliers[index],
      ...supplierData,
      Id: parseInt(id),
      paymentTerms: supplierData.paymentTerms || suppliers[index].paymentTerms || 'Net 30',
      leadTimeDays: supplierData.leadTimeDays ? parseInt(supplierData.leadTimeDays) : suppliers[index].leadTimeDays || 14,
      performanceRating: supplierData.performanceRating !== undefined ? parseFloat(supplierData.performanceRating) : suppliers[index].performanceRating || 0,
      minimumOrderQuantity: supplierData.minimumOrderQuantity !== undefined ? parseInt(supplierData.minimumOrderQuantity) : suppliers[index].minimumOrderQuantity || 0,
      notes: supplierData.notes !== undefined ? supplierData.notes : suppliers[index].notes || '',
      contractStartDate: supplierData.contractStartDate !== undefined ? supplierData.contractStartDate : suppliers[index].contractStartDate || null,
      contractEndDate: supplierData.contractEndDate !== undefined ? supplierData.contractEndDate : suppliers[index].contractEndDate || null,
      renewalReminderDays: supplierData.renewalReminderDays !== undefined ? parseInt(supplierData.renewalReminderDays) : suppliers[index].renewalReminderDays || 30,
      contractValue: supplierData.contractValue !== undefined ? parseFloat(supplierData.contractValue) : suppliers[index].contractValue || 0,
      contractTerms: supplierData.contractTerms !== undefined ? supplierData.contractTerms : suppliers[index].contractTerms || ''
    };

    saveSuppliers(suppliers);
    return suppliers[index];
  },

  async delete(id) {
    await delay(300);
    const suppliers = getStoredSuppliers();
    const products = await productService.getAll();
    
    // Check if supplier has products
    const hasProducts = products.some(p => p.supplier === parseInt(id));
    if (hasProducts) {
      throw new Error("Cannot delete supplier that has associated products");
    }

    const filteredSuppliers = suppliers.filter(supplier => supplier.Id !== parseInt(id));
    
    if (filteredSuppliers.length === suppliers.length) {
      throw new Error("Supplier not found");
    }

    saveSuppliers(filteredSuppliers);
    return true;
  },

  async getSupplierProducts(id) {
    await delay(200);
    return await productService.getBySupplier(parseInt(id));
  }
};
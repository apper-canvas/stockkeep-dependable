import purchaseOrdersData from '@/services/mockData/purchaseOrders.json';
import suppliersData from '@/services/mockData/suppliers.json';
const STORAGE_KEY = 'purchaseOrders';

function getStoredPurchaseOrders() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored purchase orders:', e);
    }
  }
  return purchaseOrdersData;
}

function savePurchaseOrders(purchaseOrders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(purchaseOrders));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generatePONumber() {
  const year = new Date().getFullYear();
  const purchaseOrders = getStoredPurchaseOrders();
  const maxId = purchaseOrders.reduce((max, po) => Math.max(max, po.Id), 0);
  const nextNumber = String(maxId + 1).padStart(4, '0');
  return `PO-${year}-${nextNumber}`;
}

export const purchaseOrderService = {
  async getAll() {
    await delay(300);
    const purchaseOrders = getStoredPurchaseOrders();
    return purchaseOrders.map(po => ({ ...po }));
  },

  async getById(id) {
    await delay(200);
    const purchaseOrders = getStoredPurchaseOrders();
    const purchaseOrder = purchaseOrders.find(po => po.Id === parseInt(id));
    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }
    return { ...purchaseOrder };
  },

  async create(purchaseOrderData) {
    await delay(400);
    const purchaseOrders = getStoredPurchaseOrders();
    
    const maxId = purchaseOrders.reduce((max, po) => Math.max(max, po.Id), 0);
    const newId = maxId + 1;
    
    const newPurchaseOrder = {
      ...purchaseOrderData,
      Id: newId,
      poNumber: generatePONumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    purchaseOrders.push(newPurchaseOrder);
    savePurchaseOrders(purchaseOrders);
    
    return { ...newPurchaseOrder };
  },

  async update(id, purchaseOrderData) {
    await delay(400);
    const purchaseOrders = getStoredPurchaseOrders();
    const index = purchaseOrders.findIndex(po => po.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Purchase order not found');
    }
    
    const updatedPurchaseOrder = {
      ...purchaseOrders[index],
      ...purchaseOrderData,
      Id: purchaseOrders[index].Id,
      poNumber: purchaseOrders[index].poNumber,
      createdAt: purchaseOrders[index].createdAt,
      updatedAt: new Date().toISOString()
    };
    
    purchaseOrders[index] = updatedPurchaseOrder;
    savePurchaseOrders(purchaseOrders);
    
    return { ...updatedPurchaseOrder };
  },

  async delete(id) {
    await delay(300);
    const purchaseOrders = getStoredPurchaseOrders();
    const index = purchaseOrders.findIndex(po => po.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Purchase order not found');
    }
    
    purchaseOrders.splice(index, 1);
    savePurchaseOrders(purchaseOrders);
    
    return { success: true };
  },

async updateStatus(id, newStatus) {
    await delay(300);
    const purchaseOrders = getStoredPurchaseOrders();
    const index = purchaseOrders.findIndex(po => po.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Purchase order not found');
    }
    
    const validStatuses = ['draft', 'submitted', 'approved', 'partially_received', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status');
    }
    
    purchaseOrders[index] = {
      ...purchaseOrders[index],
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    savePurchaseOrders(purchaseOrders);
    
    const updatedPO = { ...purchaseOrders[index] };
    
    const supplier = suppliersData.find(s => s.Id === updatedPO.supplierId);
    if (supplier && supplier.email) {
      try {
        if (typeof window !== 'undefined' && window.ApperSDK) {
          const { ApperClient } = window.ApperSDK;
          const apperClient = new ApperClient({
            apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
            apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
          });

          const emailResult = await apperClient.functions.invoke(
            import.meta.env.VITE_SEND_PO_NOTIFICATION,
            {
              body: JSON.stringify({
                purchaseOrderId: updatedPO.Id,
                status: newStatus,
                supplierEmail: supplier.email,
                supplierName: supplier.name,
                orderDate: updatedPO.orderDate,
                expectedDeliveryDate: updatedPO.expectedDeliveryDate
              }),
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (!emailResult.success) {
            console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_SEND_PO_NOTIFICATION}. The response body is: ${JSON.stringify(emailResult)}.`);
          }
        }
      } catch (error) {
        console.info(`apper_info: Got this error an this function: ${import.meta.env.VITE_SEND_PO_NOTIFICATION}. The error is: ${error.message}`);
      }
    }
    
    return updatedPO;
  },

  async getRecent(limit = 5) {
    await delay(200);
    const purchaseOrders = getStoredPurchaseOrders();
    return purchaseOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map(po => ({ ...po }));
  },

  async getByStatus(status) {
    await delay(300);
    const purchaseOrders = getStoredPurchaseOrders();
    return purchaseOrders
      .filter(po => po.status === status)
      .map(po => ({ ...po }));
  },

  async getBySupplier(supplierId) {
    await delay(300);
    const purchaseOrders = getStoredPurchaseOrders();
    return purchaseOrders
      .filter(po => po.supplierId === parseInt(supplierId))
      .map(po => ({ ...po }));
  }
};
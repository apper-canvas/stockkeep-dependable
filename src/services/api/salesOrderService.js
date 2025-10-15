import salesOrdersData from "@/services/mockData/salesOrders.json";
import { productService } from "./productService";

const STORAGE_KEY = "stockkeep_sales_orders";

const getStoredSalesOrders = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : salesOrdersData;
  } catch (error) {
    console.error("Error parsing stored sales orders:", error);
    return salesOrdersData;
  }
};

const saveSalesOrders = (salesOrders) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(salesOrders));
  } catch (error) {
    console.error("Error saving sales orders:", error);
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateOrderNumber = () => {
  const prefix = "SO";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
};

export const salesOrderService = {
  async getAll() {
    await delay(300);
    return [...getStoredSalesOrders()];
  },

  async getById(id) {
    await delay(200);
    const salesOrders = getStoredSalesOrders();
    return salesOrders.find(order => order.Id === parseInt(id));
  },

  async create(orderData) {
    await delay(400);
    const salesOrders = getStoredSalesOrders();
    const maxId = salesOrders.length > 0 ? Math.max(...salesOrders.map(o => o.Id)) : 0;
    
    // Reserve stock for each line item
    for (const item of orderData.lineItems) {
      try {
        await productService.reserveStock(item.productId, item.quantity);
      } catch (error) {
        // If reservation fails for any item, release already reserved items
        const processedItems = orderData.lineItems.slice(0, orderData.lineItems.indexOf(item));
        for (const processedItem of processedItems) {
          await productService.releaseStock(processedItem.productId, processedItem.quantity);
        }
        throw error;
      }
    }

    const newOrder = {
      ...orderData,
      Id: maxId + 1,
      orderNumber: generateOrderNumber(),
      status: orderData.status || "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    salesOrders.push(newOrder);
    saveSalesOrders(salesOrders);
    return newOrder;
  },

  async update(id, orderData) {
    await delay(400);
    const salesOrders = getStoredSalesOrders();
    const index = salesOrders.findIndex(order => order.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Sales order not found");
    }

    const oldOrder = salesOrders[index];

    // Handle inventory changes if line items changed
    if (orderData.lineItems && oldOrder.status !== "Fulfilled" && oldOrder.status !== "Cancelled") {
      // Release old reservations
      for (const item of oldOrder.lineItems) {
        await productService.releaseStock(item.productId, item.quantity);
      }

      // Reserve new quantities
      for (const item of orderData.lineItems) {
        try {
          await productService.reserveStock(item.productId, item.quantity);
        } catch (error) {
          // Rollback: restore old reservations
          for (const oldItem of oldOrder.lineItems) {
            await productService.reserveStock(oldItem.productId, oldItem.quantity);
          }
          throw error;
        }
      }
    }

    salesOrders[index] = {
      ...salesOrders[index],
      ...orderData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };

    saveSalesOrders(salesOrders);
    return salesOrders[index];
  },

  async delete(id) {
    await delay(300);
    const salesOrders = getStoredSalesOrders();
    const order = salesOrders.find(o => o.Id === parseInt(id));
    
    if (!order) {
      throw new Error("Sales order not found");
    }

    // Release reservations if order not fulfilled
    if (order.status !== "Fulfilled" && order.status !== "Cancelled") {
      for (const item of order.lineItems) {
        await productService.releaseStock(item.productId, item.quantity);
      }
    }

    const filteredOrders = salesOrders.filter(order => order.Id !== parseInt(id));
    saveSalesOrders(filteredOrders);
    return true;
  },

  async updateStatus(id, status) {
    await delay(300);
    const salesOrders = getStoredSalesOrders();
    const index = salesOrders.findIndex(order => order.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Sales order not found");
    }

    const order = salesOrders[index];

    // Handle inventory for status changes
    if (status === "Cancelled" && order.status !== "Fulfilled" && order.status !== "Cancelled") {
      // Release reservations on cancellation
      for (const item of order.lineItems) {
        await productService.releaseStock(item.productId, item.quantity);
      }
    }

    salesOrders[index] = {
      ...salesOrders[index],
      status,
      updatedAt: new Date().toISOString()
    };

    saveSalesOrders(salesOrders);
    return salesOrders[index];
  },

  async fulfillOrder(id) {
    await delay(400);
    const salesOrders = getStoredSalesOrders();
    const index = salesOrders.findIndex(order => order.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Sales order not found");
    }

    const order = salesOrders[index];

    if (order.status === "Fulfilled") {
      throw new Error("Order already fulfilled");
    }

    if (order.status === "Cancelled") {
      throw new Error("Cannot fulfill cancelled order");
    }

    // Fulfill order - reduces quantity and releases reservation
    for (const item of order.lineItems) {
      await productService.fulfillOrder(item.productId, item.quantity);
    }

    salesOrders[index] = {
      ...salesOrders[index],
      status: "Fulfilled",
      fulfilledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveSalesOrders(salesOrders);
    return salesOrders[index];
  },

  async getByStatus(status) {
    await delay(200);
    const salesOrders = getStoredSalesOrders();
    return salesOrders.filter(order => order.status === status);
  },

  async getByCustomer(customerName) {
    await delay(200);
    const salesOrders = getStoredSalesOrders();
    return salesOrders.filter(order => 
      order.customerName.toLowerCase().includes(customerName.toLowerCase())
    );
  },

  async createFromQuote(quoteId, quoteData) {
    await delay(400);
    
    const orderData = {
      customerName: quoteData.customerName,
      customerEmail: quoteData.customerEmail,
      customerPhone: quoteData.customerPhone,
      shippingAddress: quoteData.shippingAddress,
      billingAddress: quoteData.billingAddress,
      lineItems: quoteData.lineItems,
      subtotal: quoteData.subtotal,
      tax: quoteData.tax,
      total: quoteData.total,
      notes: quoteData.notes,
      quoteId: quoteId,
      status: "Pending"
    };

    return await this.create(orderData);
  }
};
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";

const QuoteModal = ({ isOpen, onClose, onSave, quote = null, products = [] }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    billingAddress: "",
    lineItems: [{ productId: "", quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: "Draft",
    validUntil: "",
    notes: ""
  });

  const [saving, setSaving] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (quote) {
        setFormData({
          ...quote,
          validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : ""
        });
      } else {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          shippingAddress: "",
          billingAddress: "",
          lineItems: [{ productId: "", quantity: 1, unitPrice: 0, total: 0 }],
          subtotal: 0,
          tax: 0,
          total: 0,
          status: "Draft",
          validUntil: nextMonth.toISOString().split('T')[0],
          notes: ""
        });
      }
      setSameAsBilling(false);
    }
  }, [isOpen, quote]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "billingAddress" && sameAsBilling) {
        updated.shippingAddress = value;
      }
      return updated;
    });
  };

  const handleSameAsBillingChange = (checked) => {
    setSameAsBilling(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: prev.billingAddress
      }));
    }
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { productId: "", quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length === 1) {
      toast.error("At least one line item is required");
      return;
    }
    setFormData(prev => {
      const newLineItems = prev.lineItems.filter((_, i) => i !== index);
      return calculateTotals({ ...prev, lineItems: newLineItems });
    });
  };

  const updateLineItem = (index, field, value) => {
    setFormData(prev => {
      const newLineItems = [...prev.lineItems];
      newLineItems[index] = { ...newLineItems[index], [field]: value };

      if (field === "productId") {
        const product = products.find(p => p.Id === parseInt(value));
        if (product) {
          newLineItems[index].unitPrice = product.price;
          newLineItems[index].total = product.price * newLineItems[index].quantity;
        }
      } else if (field === "quantity") {
        newLineItems[index].total = newLineItems[index].unitPrice * parseInt(value || 0);
      }

      return calculateTotals({ ...prev, lineItems: newLineItems });
    });
  };

  const calculateTotals = (data) => {
    const subtotal = data.lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = subtotal * 0.09;
    const total = subtotal + tax;
    return {
      ...data,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast.error("Customer name is required");
      return false;
    }
    if (!formData.customerEmail.trim()) {
      toast.error("Customer email is required");
      return false;
    }
    if (!formData.billingAddress.trim()) {
      toast.error("Billing address is required");
      return false;
    }
    if (!formData.shippingAddress.trim()) {
      toast.error("Shipping address is required");
      return false;
    }
    if (!formData.validUntil) {
      toast.error("Valid until date is required");
      return false;
    }
    
    const hasInvalidItems = formData.lineItems.some(item => 
      !item.productId || item.quantity <= 0
    );
    if (hasInvalidItems) {
      toast.error("All line items must have a product and valid quantity");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await onSave({
        ...formData,
        validUntil: new Date(formData.validUntil).toISOString()
      });
      onClose();
    } catch (error) {
      console.error("Error saving quote:", error);
    } finally {
      setSaving(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.Id === parseInt(productId));
    return product ? product.name : "";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {quote ? "Edit Quote" : "New Quote"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Customer Name"
              type="text"
              value={formData.customerName}
              onChange={(e) => handleChange("customerName", e.target.value)}
              required
            />
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={[
                { value: "Draft", label: "Draft" },
                { value: "Sent", label: "Sent" },
                { value: "Accepted", label: "Accepted" },
                { value: "Rejected", label: "Rejected" }
              ]}
              required
            />
            <FormField
              label="Email"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleChange("customerEmail", e.target.value)}
              required
            />
            <FormField
              label="Phone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => handleChange("customerPhone", e.target.value)}
            />
            <FormField
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) => handleChange("validUntil", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Billing Address"
              type="textarea"
              value={formData.billingAddress}
              onChange={(e) => handleChange("billingAddress", e.target.value)}
              required
            />
            <div>
              <FormField
                label="Shipping Address"
                type="textarea"
                value={formData.shippingAddress}
                onChange={(e) => handleChange("shippingAddress", e.target.value)}
                required
                disabled={sameAsBilling}
              />
              <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                Same as billing address
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <ApperIcon name="Plus" className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => updateLineItem(index, "productId", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map(product => (
                          <option key={product.Id} value={product.Id}>
                            {product.name} - {formatCurrency(product.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    className="mt-7"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">{formatCurrency(formData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (9%):</span>
              <span className="font-medium text-gray-900">{formatCurrency(formData.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total:</span>
              <span className="text-primary">{formatCurrency(formData.total)}</span>
            </div>
          </div>

          <FormField
            label="Notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Add any additional notes or terms..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : quote ? "Update Quote" : "Create Quote"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteModal;
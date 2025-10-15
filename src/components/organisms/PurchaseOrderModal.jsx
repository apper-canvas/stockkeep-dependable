import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';

const PurchaseOrderModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  purchaseOrder = null, 
  suppliers = [], 
  products = [] 
}) => {
  const [formData, setFormData] = useState({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    status: 'draft',
    notes: '',
    lineItems: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (purchaseOrder) {
        setFormData({
          supplierId: purchaseOrder.supplierId?.toString() || '',
          orderDate: purchaseOrder.orderDate?.split('T')[0] || new Date().toISOString().split('T')[0],
          expectedDeliveryDate: purchaseOrder.expectedDeliveryDate?.split('T')[0] || '',
          status: purchaseOrder.status || 'draft',
          notes: purchaseOrder.notes || '',
          lineItems: purchaseOrder.lineItems || []
        });
      } else {
        setFormData({
          supplierId: '',
          orderDate: new Date().toISOString().split('T')[0],
          expectedDeliveryDate: '',
          status: 'draft',
          notes: '',
          lineItems: []
        });
      }
    }
  }, [isOpen, purchaseOrder]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { productId: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeLineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData(prev => {
      const newLineItems = [...prev.lineItems];
      newLineItems[index] = {
        ...newLineItems[index],
        [field]: value
      };

      if (field === 'productId') {
        const product = products.find(p => p.Id === parseInt(value));
        if (product) {
          newLineItems[index].unitPrice = product.price;
          newLineItems[index].total = product.price * newLineItems[index].quantity;
        }
      } else if (field === 'quantity' || field === 'unitPrice') {
        newLineItems[index].total = newLineItems[index].quantity * newLineItems[index].unitPrice;
      }

      return { ...prev, lineItems: newLineItems };
    });
  };

  const calculateTotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const validateForm = () => {
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return false;
    }
    if (!formData.orderDate) {
      toast.error('Please enter order date');
      return false;
    }
    if (!formData.expectedDeliveryDate) {
      toast.error('Please enter expected delivery date');
      return false;
    }
    if (formData.lineItems.length === 0) {
      toast.error('Please add at least one line item');
      return false;
    }
    for (let i = 0; i < formData.lineItems.length; i++) {
      const item = formData.lineItems[i];
      if (!item.productId) {
        toast.error(`Please select product for line item ${i + 1}`);
        return false;
      }
      if (!item.quantity || item.quantity <= 0) {
        toast.error(`Please enter valid quantity for line item ${i + 1}`);
        return false;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        toast.error(`Please enter valid unit price for line item ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const purchaseOrderData = {
        ...formData,
        supplierId: parseInt(formData.supplierId),
        lineItems: formData.lineItems.map(item => ({
          ...item,
          productId: parseInt(item.productId),
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          total: parseFloat(item.total)
        })),
        total: calculateTotal(),
        orderDate: new Date(formData.orderDate).toISOString(),
        expectedDeliveryDate: new Date(formData.expectedDeliveryDate).toISOString()
      };

      await onSave(purchaseOrderData);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save purchase order');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const getProductName = (productId) => {
    const product = products.find(p => p.Id === parseInt(productId));
    return product ? product.name : '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {purchaseOrder ? 'Edit Purchase Order' : 'New Purchase Order'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <ApperIcon name="X" className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Supplier"
              type="select"
value={formData.supplierId}
              onChange={(value) => handleChange('supplierId', value)}
              options={[
                { value: '', label: 'Select supplier...' },
                ...suppliers.map(supplier => ({
                  value: supplier.Id.toString(),
                  label: supplier.name
                }))
              ]}
              required
            />

            <FormField
              label="Status"
              type="select"
              value={formData.status}
onChange={(value) => handleChange('status', value)}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'submitted', label: 'Submitted' },
                { value: 'approved', label: 'Approved' },
                { value: 'partially_received', label: 'Partially Received' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              required
            />

            <FormField
              label="Order Date"
              type="date"
value={formData.orderDate}
              onChange={(value) => handleChange('orderDate', value)}
              required
            />

            <FormField
              label="Expected Delivery Date"
              type="date"
value={formData.expectedDeliveryDate}
              onChange={(value) => handleChange('expectedDeliveryDate', value)}
              required
            />
          </div>

          <FormField
            label="Notes"
            type="textarea"
value={formData.notes}
            onChange={(value) => handleChange('notes', value)}
            placeholder="Add any additional notes..."
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
              >
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {formData.lineItems.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <ApperIcon name="ShoppingCart" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No items added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="mt-3"
                >
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.lineItems.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <FormField
                          label="Product"
                          type="select"
                          value={item.productId}
onChange={(value) => updateLineItem(index, 'productId', value)}
                          options={[
                            { value: '', label: 'Select product...' },
                            ...products.map(product => ({
                              value: product.Id.toString(),
                              label: `${product.name} - $${product.price.toFixed(2)}`
                            }))
                          ]}
                          required
                        />
                      </div>
                      <FormField
                        label="Quantity"
                        type="number"
value={item.quantity}
                        onChange={(value) => updateLineItem(index, 'quantity', value)}
                        min="1"
                        required
                      />
                      <FormField
                        label="Unit Price"
                        type="number"
value={item.unitPrice}
                        onChange={(value) => updateLineItem(index, 'unitPrice', value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Line Total</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${(item.total || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.lineItems.length > 0 && (
              <div className="bg-primary bg-opacity-5 rounded-lg p-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                  {purchaseOrder ? 'Update Purchase Order' : 'Create Purchase Order'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;
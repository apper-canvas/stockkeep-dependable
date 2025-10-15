import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";

const ProductModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  product = null, 
  categories = [], 
  suppliers = [] 
}) => {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    quantity: "",
    minStockLevel: "",
    price: "",
    cost: "",
    supplier: "",
    description: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || "",
        name: product.name || "",
        category: product.category || "",
        quantity: product.quantity?.toString() || "",
        minStockLevel: product.minStockLevel?.toString() || "",
        price: product.price?.toString() || "",
        cost: product.cost?.toString() || "",
        supplier: product.supplier || "",
        description: product.description || ""
      });
    } else {
      setFormData({
        sku: "",
        name: "",
        category: "",
        quantity: "",
        minStockLevel: "",
        price: "",
        cost: "",
        supplier: "",
        description: ""
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = "Valid quantity is required";
    }
    if (!formData.minStockLevel || parseInt(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = "Valid minimum stock level is required";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (formData.cost && parseFloat(formData.cost) < 0) {
      newErrors.cost = "Cost must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        minStockLevel: parseInt(formData.minStockLevel),
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        updatedAt: new Date().toISOString()
      };

      if (product) {
        productData.Id = product.Id;
        productData.createdAt = product.createdAt;
      } else {
        productData.createdAt = new Date().toISOString();
      }

      await onSave(productData);
      
      toast.success(product ? "Product updated successfully" : "Product created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save product");
      console.error("Save product error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categoryOptions = categories.map(cat => ({
    value: cat.Id,
    label: cat.name
  }));

  const supplierOptions = suppliers.map(sup => ({
    value: sup.Id,
    label: sup.name
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ApperIcon name="X" className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="SKU"
              value={formData.sku}
              onChange={(value) => handleChange("sku", value)}
              error={errors.sku}
              placeholder="Enter product SKU"
              required
            />

            <FormField
              label="Product Name"
              value={formData.name}
              onChange={(value) => handleChange("name", value)}
              error={errors.name}
              placeholder="Enter product name"
              required
            />

            <FormField
              label="Category"
              type="select"
              value={formData.category}
              onChange={(value) => handleChange("category", value)}
              error={errors.category}
              options={categoryOptions}
              required
            />

            <FormField
              label="Supplier"
              type="select"
              value={formData.supplier}
              onChange={(value) => handleChange("supplier", value)}
              error={errors.supplier}
              options={supplierOptions}
            />

            <FormField
              label="Current Stock"
              type="number"
              value={formData.quantity}
              onChange={(value) => handleChange("quantity", value)}
              error={errors.quantity}
              placeholder="0"
              required
            />

            <FormField
              label="Minimum Stock Level"
              type="number"
              value={formData.minStockLevel}
              onChange={(value) => handleChange("minStockLevel", value)}
              error={errors.minStockLevel}
              placeholder="0"
              required
            />

            <FormField
              label="Selling Price"
              type="number"
              value={formData.price}
              onChange={(value) => handleChange("price", value)}
              error={errors.price}
              placeholder="0.00"
              step="0.01"
              required
            />

            <FormField
              label="Cost Price"
              type="number"
              value={formData.cost}
              onChange={(value) => handleChange("cost", value)}
              error={errors.cost}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(value) => handleChange("description", value)}
            error={errors.description}
            placeholder="Product description (optional)"
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                  {product ? "Update Product" : "Create Product"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
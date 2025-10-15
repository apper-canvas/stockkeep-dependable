import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";

const SupplierModal = ({ isOpen, onClose, onSave, supplier = null }) => {
const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    paymentTerms: "Net 30",
    leadTimeDays: 14,
    performanceRating: 0
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
setFormData({
        name: supplier.name || "",
        contactPerson: supplier.contactPerson || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        paymentTerms: supplier.paymentTerms || "Net 30",
        leadTimeDays: supplier.leadTimeDays || 14,
        performanceRating: supplier.performanceRating || 0
      });
    } else {
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        paymentTerms: "Net 30",
        leadTimeDays: 14,
        performanceRating: 0
      });
    }
    setErrors({});
  }, [supplier, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Supplier name is required";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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
      const supplierData = { ...formData };

      if (supplier) {
        supplierData.Id = supplier.Id;
      }

      await onSave(supplierData);
      
      toast.success(supplier ? "Supplier updated successfully" : "Supplier created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save supplier");
      console.error("Save supplier error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {supplier ? "Edit Supplier" : "Add New Supplier"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ApperIcon name="X" className="h-5 w-5" />
          </Button>
        </div>

<form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Supplier Name"
            value={formData.name}
            onChange={(value) => handleChange("name", value)}
            error={errors.name}
            placeholder="Enter supplier name"
            required
          />

          <FormField
            label="Contact Person"
            value={formData.contactPerson}
            onChange={(value) => handleChange("contactPerson", value)}
            error={errors.contactPerson}
            placeholder="Enter contact person name"
          />

          <FormField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
            error={errors.email}
            placeholder="Enter email address"
          />

          <FormField
            label="Phone"
            value={formData.phone}
            onChange={(value) => handleChange("phone", value)}
            error={errors.phone}
            placeholder="Enter phone number"
          />

          <FormField
            label="Address"
            type="textarea"
            value={formData.address}
            onChange={(value) => handleChange("address", value)}
            error={errors.address}
            placeholder="Enter supplier address"
          />

<FormField
            label="Payment Terms"
            type="select"
            value={formData.paymentTerms}
            onChange={(value) => handleChange("paymentTerms", value)}
            error={errors.paymentTerms}
            options={[
              { value: 'Net 30', label: 'Net 30 Days' },
              { value: 'Net 60', label: 'Net 60 Days' },
              { value: 'Net 90', label: 'Net 90 Days' },
              { value: 'Net 45', label: 'Net 45 Days' },
              { value: 'COD', label: 'Cash on Delivery' }
            ]}
          />

          <FormField
            label="Lead Time (Days)"
            type="number"
            value={formData.leadTimeDays}
            onChange={(value) => handleChange("leadTimeDays", value)}
            error={errors.leadTimeDays}
            placeholder="Enter lead time in days"
            min="1"
          />

<FormField
            label="Performance Rating"
            type="select"
            value={formData.performanceRating}
            onChange={(value) => handleChange("performanceRating", value)}
            error={errors.performanceRating}
            options={[
              { value: '0', label: 'Not Rated' },
              { value: '1', label: '⭐ (1 Star)' },
              { value: '2', label: '⭐⭐ (2 Stars)' },
              { value: '3', label: '⭐⭐⭐ (3 Stars)' },
              { value: '4', label: '⭐⭐⭐⭐ (4 Stars)' },
              { value: '5', label: '⭐⭐⭐⭐⭐ (5 Stars)' }
            ]}
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
                  {supplier ? "Update Supplier" : "Create Supplier"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
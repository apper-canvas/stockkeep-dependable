import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";

const CategoryModal = ({ isOpen, onClose, onSave, category = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || ""
      });
    } else {
      setFormData({
        name: "",
        description: ""
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
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
      const categoryData = {
        ...formData,
        productCount: category ? category.productCount : 0
      };

      if (category) {
        categoryData.Id = category.Id;
      }

      await onSave(categoryData);
      
      toast.success(category ? "Category updated successfully" : "Category created successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save category");
      console.error("Save category error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {category ? "Edit Category" : "Add New Category"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ApperIcon name="X" className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Category Name"
            value={formData.name}
            onChange={(value) => handleChange("name", value)}
            error={errors.name}
            placeholder="Enter category name"
            required
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(value) => handleChange("description", value)}
            error={errors.description}
            placeholder="Category description (optional)"
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
                  {category ? "Update Category" : "Create Category"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
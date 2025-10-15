import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import CategoryModal from "@/components/organisms/CategoryModal";
import ConfirmDialog from "@/components/organisms/ConfirmDialog";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { categoryService } from "@/services/api/categoryService";
import { productService } from "@/services/api/productService";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await categoryService.getAll();
      setCategories(data);
      
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0]);
      }
    } catch (err) {
      setError("Failed to load categories");
      console.error("Categories loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryProducts = async (categoryId) => {
    if (!categoryId) {
      setCategoryProducts([]);
      return;
    }

    try {
      const products = await productService.getByCategory(categoryId);
      setCategoryProducts(products);
    } catch (err) {
      console.error("Failed to load category products:", err);
      setCategoryProducts([]);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryProducts(selectedCategory.Id);
    }
  }, [selectedCategory]);

  const handleRetry = () => {
    loadCategories();
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      let savedCategory;
      if (editingCategory) {
        savedCategory = await categoryService.update(editingCategory.Id, categoryData);
        setCategories(prev => prev.map(c => c.Id === editingCategory.Id ? savedCategory : c));
        
        if (selectedCategory && selectedCategory.Id === editingCategory.Id) {
          setSelectedCategory(savedCategory);
        }
      } else {
        savedCategory = await categoryService.create(categoryData);
        setCategories(prev => [...prev, savedCategory]);
        
        if (!selectedCategory) {
          setSelectedCategory(savedCategory);
        }
      }
      
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Save category error:", error);
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryService.delete(categoryToDelete.Id);
      setCategories(prev => prev.filter(c => c.Id !== categoryToDelete.Id));
      
      if (selectedCategory && selectedCategory.Id === categoryToDelete.Id) {
        const remaining = categories.filter(c => c.Id !== categoryToDelete.Id);
        setSelectedCategory(remaining.length > 0 ? remaining[0] : null);
      }
      
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete category");
      console.error("Delete category error:", error);
    } finally {
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  };

  if (loading) return <Loading rows={3} />;
  if (error) return <Error message={error} onRetry={handleRetry} />;

  if (categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Empty
          title="No categories found"
          description="Organize your products by creating categories first."
          icon="Tag"
          actionLabel="Add Category"
          onAction={handleAddCategory}
        />
        
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSave={handleSaveCategory}
          category={editingCategory}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Organize your products into categories</p>
        </div>
        <Button onClick={handleAddCategory} variant="primary">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Tag" className="h-5 w-5" />
              Categories ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {categories.map(category => (
                <div
                  key={category.Id}
                  className={`p-4 cursor-pointer border-l-4 transition-colors ${
                    selectedCategory?.Id === category.Id
                      ? "bg-blue-50 border-primary text-primary"
                      : "hover:bg-gray-50 border-transparent"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {category.productCount} products
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category);
                        }}
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category);
                        }}
                        disabled={category.productCount > 0}
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCategory ? (
            <>
              {/* Category Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ApperIcon name="Tag" className="h-5 w-5" />
                        {selectedCategory.name}
                      </CardTitle>
                      {selectedCategory.description && (
                        <p className="text-gray-600 mt-2">{selectedCategory.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(selectedCategory)}
                      >
                        <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(selectedCategory)}
                        disabled={selectedCategory.productCount > 0}
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4 mr-2 text-red-500" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{selectedCategory.productCount}</p>
                      <p className="text-sm text-gray-600">Products</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {categoryProducts.reduce((sum, p) => sum + p.quantity, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Stock</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(categoryProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0))}
                      </p>
                      <p className="text-sm text-gray-600">Value</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {categoryProducts.filter(p => p.quantity <= p.minStockLevel).length}
                      </p>
                      <p className="text-sm text-gray-600">Low Stock</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products in Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Products in {selectedCategory.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {categoryProducts.map((product, index) => (
                            <tr 
                              key={product.Id}
                              className={`hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  {product.description && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                      {product.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product.sku}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{product.quantity}</div>
                                <div className="text-xs text-gray-500">Min: {product.minStockLevel}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(product.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {product.quantity <= 0 ? (
                                  <Badge variant="error">Out of Stock</Badge>
                                ) : product.quantity <= product.minStockLevel ? (
                                  <Badge variant="warning">Low Stock</Badge>
                                ) : (
                                  <Badge variant="success">In Stock</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ApperIcon name="Package" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No products in this category</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <ApperIcon name="Tag" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Select a category to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={
          categoryToDelete?.productCount > 0
            ? `Cannot delete "${categoryToDelete?.name}" because it contains ${categoryToDelete?.productCount} products. Please move or delete the products first.`
            : `Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`
        }
        confirmText={categoryToDelete?.productCount > 0 ? "OK" : "Delete"}
        variant={categoryToDelete?.productCount > 0 ? "default" : "danger"}
      />
    </div>
  );
};

export default Categories;
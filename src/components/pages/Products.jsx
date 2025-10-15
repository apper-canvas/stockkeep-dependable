import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ProductTable from "@/components/organisms/ProductTable";
import ProductModal from "@/components/organisms/ProductModal";
import ConfirmDialog from "@/components/organisms/ConfirmDialog";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { productService } from "@/services/api/productService";
import { categoryService } from "@/services/api/categoryService";
import { supplierService } from "@/services/api/supplierService";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsData, categoriesData, suppliersData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        supplierService.getAll()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
    } catch (err) {
      setError("Failed to load products data");
      console.error("Products loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetry = () => {
    loadData();
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      let savedProduct;
      if (selectedProduct) {
        savedProduct = await productService.update(selectedProduct.Id, productData);
        setProducts(prev => prev.map(p => p.Id === selectedProduct.Id ? savedProduct : p));
      } else {
        savedProduct = await productService.create(productData);
        setProducts(prev => [...prev, savedProduct]);
      }
      
      setShowProductModal(false);
    } catch (error) {
      console.error("Save product error:", error);
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await productService.delete(productToDelete.Id);
      setProducts(prev => prev.filter(p => p.Id !== productToDelete.Id));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
      console.error("Delete product error:", error);
    } finally {
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  if (loading) return <Loading rows={8} />;
  if (error) return <Error message={error} onRetry={handleRetry} />;

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Empty
          title="No products found"
          description="Start managing your inventory by adding your first product."
          icon="Package"
          actionLabel="Add Product"
          onAction={handleAddProduct}
        />
        
        <ProductModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onSave={handleSaveProduct}
          product={selectedProduct}
          categories={categories}
          suppliers={suppliers}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
<h1 className="text-3xl font-bold text-gray-900">Products & Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory, stock levels, and reservations</p>
        </div>
      </div>

<ProductTable
        products={products.map(p => ({
          ...p,
          reservedQuantity: p.reservedQuantity || 0
        }))}
        categories={categories}
        suppliers={suppliers}
        onAdd={handleAddProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        loading={loading}
      />

      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        categories={categories}
        suppliers={suppliers}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Products;
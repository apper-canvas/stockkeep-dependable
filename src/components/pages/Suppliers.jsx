import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import { supplierService } from "@/services/api/supplierService";
import { productService } from "@/services/api/productService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import ConfirmDialog from "@/components/organisms/ConfirmDialog";
import SupplierModal from "@/components/organisms/SupplierModal";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [suppliersData, productsData] = await Promise.all([
        supplierService.getAll(),
        productService.getAll()
      ]);

      setSuppliers(suppliersData);
      setAllProducts(productsData);
    } catch (err) {
      setError("Failed to load suppliers data");
      console.error("Suppliers loading error:", err);
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

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setShowSupplierModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setShowSupplierModal(true);
  };

  const handleDeleteSupplier = (supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteDialog(true);
  };

  const handleSaveSupplier = async (supplierData) => {
    try {
      let savedSupplier;
      if (editingSupplier) {
        savedSupplier = await supplierService.update(editingSupplier.Id, supplierData);
        setSuppliers(prev => prev.map(s => s.Id === editingSupplier.Id ? savedSupplier : s));
      } else {
        savedSupplier = await supplierService.create(supplierData);
        setSuppliers(prev => [...prev, savedSupplier]);
      }
      
      setShowSupplierModal(false);
    } catch (error) {
      console.error("Save supplier error:", error);
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await supplierService.delete(supplierToDelete.Id);
      setSuppliers(prev => prev.filter(s => s.Id !== supplierToDelete.Id));
      toast.success("Supplier deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete supplier");
      console.error("Delete supplier error:", error);
    } finally {
      setShowDeleteDialog(false);
      setSupplierToDelete(null);
    }
  };

  const getSupplierProducts = (supplierId) => {
    return allProducts.filter(product => product.supplier === supplierId);
  };

  const getSupplierStats = (supplierId) => {
    const products = getSupplierProducts(supplierId);
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const lowStockCount = products.filter(product => product.quantity <= product.minStockLevel).length;
    
    return {
      productCount: products.length,
      totalValue,
      lowStockCount,
      totalStock: products.reduce((sum, product) => sum + product.quantity, 0)
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  };

  if (loading) return <Loading rows={4} />;
  if (error) return <Error message={error} onRetry={handleRetry} />;

  if (suppliers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Empty
          title="No suppliers found"
          description="Add suppliers to track where your products come from."
          icon="Building2"
          actionLabel="Add Supplier"
          onAction={handleAddSupplier}
        />
        
        <SupplierModal
          isOpen={showSupplierModal}
          onClose={() => setShowSupplierModal(false)}
          onSave={handleSaveSupplier}
          supplier={editingSupplier}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage your supplier relationships and contacts</p>
        </div>
        <Button onClick={handleAddSupplier} variant="primary">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(supplier => {
          const stats = getSupplierStats(supplier.Id);
          const supplierProducts = getSupplierProducts(supplier.Id);
          
          return (
            <Card key={supplier.Id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <div className="bg-primary/10 rounded-full p-2">
                        <ApperIcon name="Building2" className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{supplier.name}</h3>
                        {supplier.contactPerson && (
                          <p className="text-sm text-gray-500 font-normal">{supplier.contactPerson}</p>
                        )}
                      </div>
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <ApperIcon name="Edit" className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSupplier(supplier)}
                      disabled={stats.productCount > 0}
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
<CardContent>
                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ApperIcon name="Mail" className="h-4 w-4" />
                      <a href={`mailto:${supplier.email}`} className="hover:text-primary">
                        {supplier.email}
                      </a>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ApperIcon name="Phone" className="h-4 w-4" />
                      <a href={`tel:${supplier.phone}`} className="hover:text-primary">
                        {supplier.phone}
                      </a>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <ApperIcon name="MapPin" className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  )}
                </div>

                {/* Business Terms */}
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  {supplier.paymentTerms && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment Terms</span>
                      <Badge variant={supplier.paymentTerms === 'COD' ? 'warning' : 'default'} className="text-xs">
                        {supplier.paymentTerms}
                      </Badge>
                    </div>
                  )}
                  {supplier.leadTimeDays !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <ApperIcon name="Clock" className="h-3 w-3" />
                        Lead Time
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {supplier.leadTimeDays} days
                      </span>
                    </div>
                  )}
                  {supplier.performanceRating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Performance</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <ApperIcon
                            key={star}
                            name="Star"
                            className={`h-3 w-3 ${
                              star <= supplier.performanceRating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">
                          ({supplier.performanceRating.toFixed(1)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{stats.productCount}</p>
                    <p className="text-sm text-gray-600">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
                    <p className="text-sm text-gray-600">Value</p>
                  </div>
                </div>

                {stats.lowStockCount > 0 && (
                  <div className="mt-4 p-2 bg-yellow-50 rounded-lg flex items-center gap-2">
                    <ApperIcon name="AlertTriangle" className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">
                      {stats.lowStockCount} products need restocking
                    </span>
                  </div>
                )}

                {/* Recent Products */}
                {supplierProducts.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Products</h4>
                    <div className="space-y-1">
                      {supplierProducts.slice(0, 3).map(product => (
                        <div key={product.Id} className="flex justify-between text-sm">
                          <span className="text-gray-700 truncate">{product.name}</span>
                          <span className="text-gray-500 ml-2">{product.quantity} units</span>
                        </div>
                      ))}
                      {supplierProducts.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{supplierProducts.length - 3} more products
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SupplierModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        onSave={handleSaveSupplier}
        supplier={editingSupplier}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Supplier"
        message={
          supplierToDelete && getSupplierStats(supplierToDelete.Id).productCount > 0
            ? `Cannot delete "${supplierToDelete?.name}" because they have ${getSupplierStats(supplierToDelete.Id).productCount} associated products. Please reassign or delete the products first.`
            : `Are you sure you want to delete "${supplierToDelete?.name}"? This action cannot be undone.`
        }
        confirmText={
          supplierToDelete && getSupplierStats(supplierToDelete.Id).productCount > 0 ? "OK" : "Delete"
        }
        variant={
          supplierToDelete && getSupplierStats(supplierToDelete.Id).productCount > 0 ? "default" : "danger"
        }
      />
    </div>
  );
};

export default Suppliers;
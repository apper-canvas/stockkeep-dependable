import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import StatsCard from "@/components/molecules/StatsCard";
import StatusBadge from "@/components/molecules/StatusBadge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { productService } from "@/services/api/productService";
import { categoryService } from "@/services/api/categoryService";
import { supplierService } from "@/services/api/supplierService";
import { transactionService } from "@/services/api/transactionService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    products: [],
    categories: [],
    suppliers: [],
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [products, categories, suppliers, transactions] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        supplierService.getAll(),
        transactionService.getRecent(5)
      ]);

      setData({
        products,
        categories,
        suppliers,
        transactions
      });
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRetry = () => {
    loadDashboardData();
  };

  const dismissAlert = (productId) => {
    setDismissedAlerts(prev => new Set([...prev, productId]));
    toast.info("Alert dismissed");
  };

  if (loading) return <Loading rows={3} />;
  if (error) return <Error message={error} onRetry={handleRetry} />;

  // Calculate statistics
  const totalProducts = data.products.length;
  const totalValue = data.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const lowStockProducts = data.products.filter(product => 
    product.quantity <= product.minStockLevel && product.quantity > 0
  );
  const outOfStockProducts = data.products.filter(product => product.quantity === 0);
  const criticalStockProducts = [...lowStockProducts, ...outOfStockProducts];

  // Get recent products (last 5 updated)
  const recentProducts = [...data.products]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  };

  const getSupplierName = (supplierId) => {
    const supplier = data.suppliers.find(s => s.Id === parseInt(supplierId));
    return supplier ? supplier.name : "Unknown";
  };

  const getCategoryName = (categoryId) => {
    const category = data.categories.find(c => c.Id === parseInt(categoryId));
    return category ? category.name : "Uncategorized";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTransactionProduct = (productId) => {
    return data.products.find(p => p.Id === parseInt(productId));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your inventory and business performance</p>
        </div>
        <Button onClick={() => navigate("/products")} variant="primary">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Low Stock Alerts */}
      {criticalStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-warning rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex">
              <ApperIcon name="AlertTriangle" className="h-5 w-5 text-warning mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Inventory Alert ({criticalStockProducts.length} items need attention)
                </h3>
                <div className="mt-2 space-y-1">
                  {criticalStockProducts.slice(0, 3).map(product => {
                    if (dismissedAlerts.has(product.Id)) return null;
                    return (
                      <div key={product.Id} className="flex items-center justify-between text-sm text-yellow-700">
                        <span>
                          {product.name} - {product.quantity === 0 ? "Out of stock" : `Low stock (${product.quantity} left)`}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => dismissAlert(product.Id)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <ApperIcon name="X" className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                  {criticalStockProducts.length > 3 && (
                    <p className="text-sm text-yellow-700">
                      And {criticalStockProducts.length - 3} more items...
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/products")}
              className="border-warning text-warning hover:bg-warning hover:text-white"
            >
              View All
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={totalProducts.toLocaleString()}
          icon="Package"
          color="blue"
        />
        <StatsCard
          title="Inventory Value"
          value={formatCurrency(totalValue)}
          icon="DollarSign"
          color="green"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockProducts.length}
          icon="AlertTriangle"
          color="yellow"
        />
        <StatsCard
          title="Out of Stock"
          value={outOfStockProducts.length}
          icon="XCircle"
          color="red"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="Clock" className="h-5 w-5" />
                Recent Products
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/products")}>
                View All
                <ApperIcon name="ChevronRight" className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProducts.length > 0 ? (
              <div className="space-y-3">
                {recentProducts.map(product => (
                  <div key={product.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">
                        {getCategoryName(product.category)} • {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">Qty: {product.quantity}</p>
                        <p className="text-xs text-gray-500">
                          Updated {formatDate(product.updatedAt)}
                        </p>
                      </div>
                      <StatusBadge 
                        quantity={product.quantity} 
                        minStockLevel={product.minStockLevel} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="Package" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Activity" className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.transactions.length > 0 ? (
              <div className="space-y-3">
                {data.transactions.map(transaction => {
                  const product = getTransactionProduct(transaction.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={transaction.Id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`rounded-full p-2 ${
                        transaction.type === "stock_in" 
                          ? "bg-green-100 text-green-600" 
                          : "bg-red-100 text-red-600"
                      }`}>
                        <ApperIcon 
                          name={transaction.type === "stock_in" ? "ArrowUp" : "ArrowDown"} 
                          className="h-4 w-4" 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-500">
                          {transaction.type === "stock_in" ? "Stock In" : "Stock Out"} • 
                          {transaction.quantity} units
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                        {transaction.notes && (
                          <p className="text-xs text-gray-400 mt-1">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="Activity" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ApperIcon name="Tag" className="h-5 w-5" />
            Category Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {data.categories.map(category => (
                <div key={category.Id} className="bg-gray-50 rounded-lg p-4 text-center">
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-2xl font-bold text-primary mt-2">{category.productCount}</p>
                  <p className="text-sm text-gray-500">products</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ApperIcon name="Tag" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No categories found</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/categories")}
                className="mt-3"
              >
                Create Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
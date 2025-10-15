import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import StatusBadge from '@/components/molecules/StatusBadge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import PurchaseOrderModal from '@/components/organisms/PurchaseOrderModal';
import { purchaseOrderService } from '@/services/api/purchaseOrderService';
import { supplierService } from '@/services/api/supplierService';
import { productService } from '@/services/api/productService';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, poId: null });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [posData, suppliersData, productsData] = await Promise.all([
        purchaseOrderService.getAll(),
        supplierService.getAll(),
        productService.getAll()
      ]);
      setPurchaseOrders(posData);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load purchase orders');
      console.error('Purchase orders loading error:', err);
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

  const handleCreate = () => {
    setEditingPO(null);
    setIsModalOpen(true);
  };

  const handleEdit = (po) => {
    setEditingPO(po);
    setIsModalOpen(true);
  };

  const handleSave = async (poData) => {
    try {
      if (editingPO) {
        await purchaseOrderService.update(editingPO.Id, poData);
        toast.success('Purchase order updated successfully');
      } else {
        await purchaseOrderService.create(poData);
        toast.success('Purchase order created successfully');
      }
      await loadData();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteClick = (poId) => {
    setDeleteConfirm({ isOpen: true, poId });
  };

  const handleDeleteConfirm = async () => {
    try {
      await purchaseOrderService.delete(deleteConfirm.poId);
      toast.success('Purchase order deleted successfully');
      setDeleteConfirm({ isOpen: false, poId: null });
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete purchase order');
    }
  };

const handleStatusChange = async (poId, newStatus) => {
    try {
      await purchaseOrderService.updateStatus(poId, newStatus);
      toast.success('Status updated successfully. Notification email sent to supplier.');
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.Id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.Id === productId);
    return product ? product.name : 'Unknown';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { variant: 'secondary', label: 'Draft' },
      submitted: { variant: 'info', label: 'Submitted' },
      approved: { variant: 'success', label: 'Approved' },
      partially_received: { variant: 'warning', label: 'Partially Received' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'error', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSupplierName(po.supplierId).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusTabs = [
    { value: 'all', label: 'All', count: purchaseOrders.length },
    { value: 'draft', label: 'Draft', count: purchaseOrders.filter(po => po.status === 'draft').length },
    { value: 'submitted', label: 'Submitted', count: purchaseOrders.filter(po => po.status === 'submitted').length },
    { value: 'approved', label: 'Approved', count: purchaseOrders.filter(po => po.status === 'approved').length },
    { value: 'partially_received', label: 'Partially Received', count: purchaseOrders.filter(po => po.status === 'partially_received').length },
    { value: 'completed', label: 'Completed', count: purchaseOrders.filter(po => po.status === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: purchaseOrders.filter(po => po.status === 'cancelled').length }
  ];

  if (loading) return <Loading rows={5} />;
  if (error) return <Error message={error} onRetry={handleRetry} />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track your purchase orders</p>
        </div>
        <Button onClick={handleCreate} variant="primary">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by PO number or supplier..."
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filteredPOs.length === 0 ? (
        <Empty
          icon="ShoppingCart"
          title="No purchase orders found"
          description={searchQuery || statusFilter !== 'all' 
            ? "Try adjusting your search or filter criteria" 
            : "Create your first purchase order to get started"}
          action={!searchQuery && statusFilter === 'all' ? {
            label: "Create Purchase Order",
            onClick: handleCreate
          } : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PO Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPOs.map(po => (
                    <tr key={po.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{po.poNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{getSupplierName(po.supplierId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(po.orderDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(po.expectedDeliveryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{formatCurrency(po.total)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {po.lineItems.length} {po.lineItems.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(po.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(po)}
                            title="Edit"
                          >
                            <ApperIcon name="Edit" className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(po.Id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Delete"
                          >
                            <ApperIcon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <PurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        purchaseOrder={editingPO}
        suppliers={suppliers}
        products={products}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, poId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PurchaseOrders;
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import QuoteModal from "@/components/organisms/QuoteModal";
import SalesOrderModal from "@/components/organisms/SalesOrderModal";
import ConfirmDialog from "@/components/organisms/ConfirmDialog";
import { quoteService } from "@/services/api/quoteService";
import { salesOrderService } from "@/services/api/salesOrderService";
import { productService } from "@/services/api/productService";

const SalesOrders = () => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [quotes, setQuotes] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [salesOrderModalOpen, setSalesOrderModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [quotesData, ordersData, productsData] = await Promise.all([
        quoteService.getAll(),
        salesOrderService.getAll(),
        productService.getAll()
      ]);
      setQuotes(quotesData);
      setSalesOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = () => {
    setSelectedQuote(null);
    setQuoteModalOpen(true);
  };

  const handleEditQuote = (quote) => {
    setSelectedQuote(quote);
    setQuoteModalOpen(true);
  };

  const handleDeleteQuote = (quote) => {
    setItemToDelete({ type: "quote", item: quote });
    setConfirmDialogOpen(true);
  };

  const handleSaveQuote = async (quoteData) => {
    try {
      if (selectedQuote) {
        await quoteService.update(selectedQuote.Id, quoteData);
        toast.success("Quote updated successfully");
      } else {
        await quoteService.create(quoteData);
        toast.success("Quote created successfully");
      }
      await loadData();
      setQuoteModalOpen(false);
      setSelectedQuote(null);
    } catch (err) {
      toast.error(err.message || "Failed to save quote");
      throw err;
    }
  };

  const handleConvertToOrder = async (quote) => {
    try {
      await salesOrderService.createFromQuote(quote.Id, quote);
      await quoteService.updateStatus(quote.Id, "Converted");
      toast.success("Quote converted to sales order successfully");
      await loadData();
      setActiveTab("orders");
    } catch (err) {
      toast.error(err.message || "Failed to convert quote");
    }
  };

  const handleAddOrder = () => {
    setSelectedOrder(null);
    setSalesOrderModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setSalesOrderModalOpen(true);
  };

  const handleDeleteOrder = (order) => {
    setItemToDelete({ type: "order", item: order });
    setConfirmDialogOpen(true);
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (selectedOrder) {
        await salesOrderService.update(selectedOrder.Id, orderData);
        toast.success("Sales order updated successfully");
      } else {
        await salesOrderService.create(orderData);
        toast.success("Sales order created successfully");
      }
      await loadData();
      setSalesOrderModalOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      toast.error(err.message || "Failed to save order");
      throw err;
    }
  };

  const handleFulfillOrder = async (order) => {
    try {
      await salesOrderService.fulfillOrder(order.Id);
      toast.success("Order fulfilled successfully");
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to fulfill order");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (itemToDelete.type === "quote") {
        await quoteService.delete(itemToDelete.item.Id);
        toast.success("Quote deleted successfully");
      } else {
        await salesOrderService.delete(itemToDelete.item.Id);
        toast.success("Sales order deleted successfully");
      }
      await loadData();
      setConfirmDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      Draft: "secondary",
      Sent: "info",
      Accepted: "success",
      Rejected: "error",
      Converted: "primary",
      Pending: "warning",
      Processing: "info",
      Fulfilled: "success",
      Cancelled: "error"
    };
    return variants[status] || "secondary";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
            <p className="text-gray-600 mt-1">Manage quotes, orders, and fulfillment</p>
          </div>
          <Button onClick={activeTab === "quotes" ? handleAddQuote : handleAddOrder}>
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            {activeTab === "quotes" ? "New Quote" : "New Order"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "quotes"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("quotes");
                setStatusFilter("all");
                setSearchQuery("");
              }}
            >
              Quotes ({quotes.length})
            </button>
            <button
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("orders");
                setStatusFilter("all");
                setSearchQuery("");
              }}
            >
              Orders ({salesOrders.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={`Search ${activeTab}...`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              {activeTab === "quotes" ? (
                <>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Converted">Converted</option>
                </>
              ) : (
                <>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Fulfilled">Fulfilled</option>
                  <option value="Cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>

          {activeTab === "quotes" ? (
            filteredQuotes.length === 0 ? (
              <Empty
                message={searchQuery || statusFilter !== "all" 
                  ? "No quotes found matching your criteria" 
                  : "No quotes yet. Create your first quote to get started."}
              />
            ) : (
              <div className="grid gap-4">
                {filteredQuotes.map((quote) => (
                  <Card key={quote.Id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {quote.quoteNumber}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(quote.status)}>
                            {quote.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-1">{quote.customerName}</p>
                        <p className="text-sm text-gray-500">{quote.customerEmail}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <span>Created: {formatDate(quote.createdAt)}</span>
                          <span>•</span>
                          <span>Valid Until: {formatDate(quote.validUntil)}</span>
                          <span>•</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(quote.total)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {quote.status === "Accepted" && (
                          <Button
                            size="sm"
                            onClick={() => handleConvertToOrder(quote)}
                          >
                            <ApperIcon name="ArrowRight" className="h-4 w-4 mr-1" />
                            Convert to Order
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuote(quote)}
                        >
                          <ApperIcon name="Edit" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuote(quote)}
                        >
                          <ApperIcon name="Trash2" className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            filteredOrders.length === 0 ? (
              <Empty
                message={searchQuery || statusFilter !== "all" 
                  ? "No orders found matching your criteria" 
                  : "No orders yet. Create your first order to get started."}
              />
            ) : (
              <div className="grid gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.Id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-1">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.customerEmail}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <span>Created: {formatDate(order.createdAt)}</span>
                          {order.fulfilledAt && (
                            <>
                              <span>•</span>
                              <span>Fulfilled: {formatDate(order.fulfilledAt)}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(order.status === "Pending" || order.status === "Processing") && (
                          <Button
                            size="sm"
                            onClick={() => handleFulfillOrder(order)}
                          >
                            <ApperIcon name="Check" className="h-4 w-4 mr-1" />
                            Fulfill Order
                          </Button>
                        )}
                        {order.status !== "Fulfilled" && order.status !== "Cancelled" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                          >
                            <ApperIcon name="Edit" className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOrder(order)}
                        >
                          <ApperIcon name="Trash2" className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          setSelectedQuote(null);
        }}
        onSave={handleSaveQuote}
        quote={selectedQuote}
        products={products}
      />

      <SalesOrderModal
        isOpen={salesOrderModalOpen}
        onClose={() => {
          setSalesOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        onSave={handleSaveOrder}
        order={selectedOrder}
        products={products}
      />

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${itemToDelete?.type === "quote" ? "Quote" : "Order"}`}
        message={`Are you sure you want to delete ${
          itemToDelete?.type === "quote" 
            ? itemToDelete?.item?.quoteNumber 
            : itemToDelete?.item?.orderNumber
        }? This action cannot be undone.`}
      />
    </div>
  );
};

export default SalesOrders;
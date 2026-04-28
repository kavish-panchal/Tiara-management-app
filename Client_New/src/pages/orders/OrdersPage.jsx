import { Eye, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import api from "../../utils/api";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    fetchOrders(true); // Initial load with loading spinner

    // Auto-refresh every 30 seconds to prevent stale data
    // But only if user is not actively interacting with the page
    let lastInteraction = Date.now();

    const updateLastInteraction = () => {
      lastInteraction = Date.now();
    };

    // Track user interactions
    window.addEventListener("mousedown", updateLastInteraction);
    window.addEventListener("keydown", updateLastInteraction);
    window.addEventListener("scroll", updateLastInteraction);

    const refreshInterval = setInterval(() => {
      // Only refresh if user hasn't interacted in the last 10 seconds
      const timeSinceInteraction = Date.now() - lastInteraction;
      if (timeSinceInteraction > 10000) {
        fetchOrders(false); // Silent refresh (no loading spinner)
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("mousedown", updateLastInteraction);
      window.removeEventListener("keydown", updateLastInteraction);
      window.removeEventListener("scroll", updateLastInteraction);
    };
  }, []);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchOrders(false); // Manual refresh without full loading spinner
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.partyName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500",
      "in-production": "bg-blue-500/10 text-blue-500 border-blue-500",
      completed: "bg-green-500/10 text-green-500 border-green-500",
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      await api.delete(`/orders/${orderToDelete._id}`);
      fetchOrders(false); // Refresh the list (silent update)
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
          <p className="text-slate-400">Manage customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh orders"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <Link
            to="/orders/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>New Order</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by party name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-production">In Production</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Order ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Party Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Order Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Due Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Designs
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-750">
                  <td className="px-6 py-4 text-sm text-white font-mono">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {order.partyName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {formatDate(order.dueDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {order.designs?.length || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace("-", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                      >
                        <Eye size={16} />
                        <span className="text-sm">View</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(order)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete order"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setOrderToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        message={`Are you sure you want to delete order #${orderToDelete?.orderNumber} for ${orderToDelete?.partyName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default OrdersPage;

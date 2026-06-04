import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Edit2,
    Printer,
    RotateCcw,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SkuImage from "../../components/common/SkuImage";
import OrderImagePreviewModal from "../../components/orders/OrderImagePreviewModal";
import ProductionTracker from "../../components/production/ProductionTracker";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.role === "owner";
  const [order, setOrder] = useState(null);
  const [productionStages, setProductionStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsedDesigns, setCollapsedDesigns] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [markingPrinted, setMarkingPrinted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async (preserveCollapsedState = false) => {
    try {
      // Fetch both order and production stages
      const [orderResponse, stagesResponse] = await Promise.all([
        api.get(`/orders/${id}`),
        api.get("/settings/production-stages"),
      ]);

      const orderData = orderResponse.data;
      const stages = stagesResponse.data.filter((stage) => stage.active);

      // Initialize collapsed state for all designs (collapsed by default)
      // Only reset if not preserving state
      if (orderData.designs && !preserveCollapsedState) {
        const initialCollapsedState = {};
        orderData.designs.forEach((_, index) => {
          initialCollapsedState[index] = true; // true = collapsed
        });
        setCollapsedDesigns(initialCollapsedState);
      }

      // Initialize production progress for each design if not already present
      if (orderData.designs) {
        orderData.designs = orderData.designs.map((design) => {
          if (
            !design.productionProgress ||
            design.productionProgress.length === 0
          ) {
            // Initialize with all active production stages
            design.productionProgress = stages.map((stage) => ({
              stageName: stage.stageName,
              status: "not-started",
              labour: "",
              startDate: null,
              finishDate: null,
            }));
          } else {
            // Ensure all active stages are present
            const existingStageNames = design.productionProgress.map(
              (p) => p.stageName,
            );
            const missingStages = stages.filter(
              (stage) => !existingStageNames.includes(stage.stageName),
            );

            if (missingStages.length > 0) {
              design.productionProgress = [
                ...design.productionProgress,
                ...missingStages.map((stage) => ({
                  stageName: stage.stageName,
                  status: "not-started",
                  labour: "",
                  startDate: null,
                  finishDate: null,
                })),
              ];
            }

            // Sort production progress based on the order defined in settings
            const stageOrderMap = {};
            stages.forEach((stage, index) => {
              stageOrderMap[stage.stageName] =
                stage.order !== undefined ? stage.order : index;
            });

            design.productionProgress.sort((a, b) => {
              const orderA =
                stageOrderMap[a.stageName] !== undefined
                  ? stageOrderMap[a.stageName]
                  : 999;
              const orderB =
                stageOrderMap[b.stageName] !== undefined
                  ? stageOrderMap[b.stageName]
                  : 999;
              return orderA - orderB;
            });
          }
          return design;
        });
      }

      setOrder(orderData);
      setProductionStages(stages);
    } catch (err) {
      setError("Failed to fetch order details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDesignCollapse = (index) => {
    setCollapsedDesigns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getSKUStatus = (productionProgress) => {
    if (!productionProgress || productionProgress.length === 0) {
      return {
        status: "not-started",
        label: "Not Started",
        color: "bg-slate-500/10 text-slate-500 border-slate-500",
      };
    }

    // Filter stages that have been started
    const startedStages = productionProgress.filter(
      (stage) => stage.status !== "not-started",
    );

    // If no stages have been started
    if (startedStages.length === 0) {
      return {
        status: "not-started",
        label: "Not Started",
        color: "bg-slate-500/10 text-slate-500 border-slate-500",
      };
    }

    // Check if all started stages are completed
    const allStartedCompleted = startedStages.every(
      (stage) => stage.status === "completed",
    );

    const anyInProgress = startedStages.some(
      (stage) => stage.status === "in-progress",
    );

    if (allStartedCompleted) {
      return {
        status: "completed",
        label: "Completed",
        color: "bg-green-500/10 text-green-500 border-green-500",
      };
    } else if (anyInProgress) {
      return {
        status: "in-progress",
        label: "In Progress",
        color: "bg-blue-500/10 text-blue-500 border-blue-500",
      };
    } else {
      return {
        status: "in-progress",
        label: "In Progress",
        color: "bg-blue-500/10 text-blue-500 border-blue-500",
      };
    }
  };

  const getCurrentWorkingStage = (productionProgress) => {
    if (!productionProgress || productionProgress.length === 0) {
      return null;
    }

    // Check if all stages are completed first
    const allCompleted = productionProgress.every(
      (stage) => stage.status === "completed",
    );
    if (allCompleted) {
      return null; // All done, no current stage
    }

    // Check if there's any stage that's "in-progress"
    const inProgressStage = productionProgress.find(
      (stage) => stage.status === "in-progress",
    );
    if (inProgressStage) {
      return inProgressStage.stageName;
    }

    // If no in-progress stage, find the first not-started stage after completed ones
    let lastCompletedIndex = -1;
    for (let i = productionProgress.length - 1; i >= 0; i--) {
      if (productionProgress[i].status === "completed") {
        lastCompletedIndex = i;
        break;
      }
    }

    // If there's a completed stage and there's a next stage, return it
    if (
      lastCompletedIndex >= 0 &&
      lastCompletedIndex < productionProgress.length - 1
    ) {
      return productionProgress[lastCompletedIndex + 1].stageName;
    }

    // Otherwise, return the first stage (nothing has started yet)
    return productionProgress[0]?.stageName || null;
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/orders/${id}`);
      navigate("/orders");
    } catch (err) {
      alert("Failed to delete order");
      console.error(err);
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
    setCancellationReason("");
  };

  const handleCancelConfirm = async () => {
    try {
      await api.put(`/orders/${id}/cancel`, { cancellationReason });
      setShowCancelDialog(false);
      // Refresh order data
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
      console.error(err);
    }
  };

  const handleUncancelOrder = async () => {
    if (
      !confirm(
        "Are you sure you want to restore this cancelled order? The order will be reactivated.",
      )
    ) {
      return;
    }

    try {
      await api.put(`/orders/${id}/uncancel`);
      // Refresh order data
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore order");
      console.error(err);
    }
  };

  const handlePrintImages = async () => {
    setShowPrintModal(true);

    // Mark as printed in database
    if (!order.imagesPrinted) {
      try {
        setMarkingPrinted(true);
        await api.post(`/orders/${id}/mark-printed`);
        // Refresh order data to show updated print status
        await fetchData();
      } catch (err) {
        console.error("Failed to mark as printed:", err);
        // Don't show error to user, just log it
      } finally {
        setMarkingPrinted(false);
      }
    }
  };

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

  const calculateTotalSets = () => {
    if (!order?.designs) return 0;

    return order.designs.reduce((total, design) => {
      const designTotal = design.sizeBreakdown.reduce((sum, sb) => {
        return sum + (parseInt(sb.sets) || 0);
      }, 0);
      return total + designTotal;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg mb-4">
          {error || "Order not found"}
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="text-blue-400 hover:text-blue-300"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Orders</span>
        </button>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                Order #{order.orderNumber}
              </h1>
              {/* Status Badge */}
              {order.status !== "cancelled" && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}
                >
                  {order.status.replace("-", " ").toUpperCase()}
                </span>
              )}
              {order.status === "cancelled" && (
                <span className="px-3 py-1 bg-red-600/20 border border-red-600 text-red-400 text-sm font-bold rounded-full">
                  🚫 CANCELLED
                </span>
              )}
              {order.imagesPrinted && (
                <span className="px-3 py-1 bg-green-600/20 border border-green-600 text-green-400 text-sm font-bold rounded-full">
                  🖨️ PRINTED
                </span>
              )}
            </div>
            <p className="text-xl font-semibold text-slate-300">
              Party Name: {order.partyName}
            </p>
            {order.status === "cancelled" && order.cancelledAt && (
              <p className="text-sm text-slate-400 mt-1">
                Cancelled on {new Date(order.cancelledAt).toLocaleDateString()}
                {order.cancellationReason && ` - ${order.cancellationReason}`}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrintImages}
              disabled={markingPrinted}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Printer size={18} />
              <span>{markingPrinted ? "Loading..." : "Print Images"}</span>
            </button>
            {order.status !== "cancelled" && (
              <>
                <button
                  onClick={() => navigate(`/orders/${id}/edit`)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Edit2 size={18} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleCancelClick}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <X size={18} />
                  <span>Cancel Order</span>
                </button>
              </>
            )}
            {order.status === "cancelled" && isOwner && (
              <button
                onClick={handleUncancelOrder}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RotateCcw size={18} />
                <span>Restore Order</span>
              </button>
            )}
            <button
              onClick={handleDeleteClick}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-1">Order Date</p>
          <p className="text-white font-semibold">
            {formatDate(order.orderDate)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-1">Due Date</p>
          <p className="text-white font-semibold">
            {formatDate(order.dueDate)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Completion & Delivery</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Completed:</span>
              <span className="text-white text-sm font-medium">
                {order.orderCompleted ? formatDate(order.orderCompleted) : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Delivered:</span>
              <span className="text-white text-sm font-medium">
                {order.orderDelivered ? formatDate(order.orderDelivered) : "-"}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Designs & Sets</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Designs:</span>
              <span className="text-white text-xl font-bold">
                {order.designs?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Total Sets:</span>
              <span className="text-white text-xl font-bold">
                {calculateTotalSets()}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-1">Images Printed</p>
          {order.imagesPrinted ? (
            <div>
              <p className="text-green-400 font-semibold flex items-center space-x-1">
                <span>✅</span>
                <span>Yes</span>
              </p>
              {order.imagesPrintedAt && (
                <p className="text-slate-500 text-xs mt-1">
                  {new Date(order.imagesPrintedAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          ) : (
            <p className="text-slate-500 font-semibold">Not Printed</p>
          )}
        </div>
      </div>

      {/* Designs with Production Tracking */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Bangle Designs</h2>
        {order.designs?.map((design, index) => {
          const skuStatus = getSKUStatus(design.productionProgress);
          const currentStage = getCurrentWorkingStage(
            design.productionProgress,
          );
          const isCollapsed = collapsedDesigns[index];

          return (
            <div
              key={index}
              className="bg-slate-800 rounded-lg overflow-hidden"
            >
              {/* Design Header - Always Visible */}
              <div
                className="p-6 cursor-pointer hover:bg-slate-750 transition-colors"
                onClick={() => toggleDesignCollapse(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="shrink-0 pointer-events-none">
                      <SkuImage skuCode={design.skuCode} size="lg" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          Design {index + 1}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${skuStatus.color}`}
                        >
                          {skuStatus.label}
                        </span>
                        {currentStage && skuStatus.status === "in-progress" && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500">
                            Current: {currentStage}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300">
                        <span className="font-semibold">SKU Code:</span>{" "}
                        {design.skuCode}
                      </p>

                      {/* Size Breakdown - Compact View */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {design.sizeBreakdown?.map((size, sizeIndex) => (
                          <span
                            key={sizeIndex}
                            className="bg-slate-700 px-3 py-1 rounded-lg text-sm text-slate-300"
                          >
                            Size {size.size}: {size.sets} sets
                          </span>
                        ))}
                      </div>

                      {/* Special Remarks */}
                      {design.specialRemarks && (
                        <div className="mt-3 bg-slate-700/50 rounded-lg p-3 border-l-4 border-blue-500">
                          <p className="text-xs font-semibold text-blue-400 mb-1">
                            Special Remarks:
                          </p>
                          <p className="text-sm text-slate-300">
                            {design.specialRemarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Collapse Toggle */}
                  <button
                    className="ml-4 text-slate-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDesignCollapse(index);
                    }}
                  >
                    {isCollapsed ? (
                      <ChevronDown size={24} />
                    ) : (
                      <ChevronUp size={24} />
                    )}
                  </button>
                </div>
              </div>

              {/* Production Tracker - Collapsible */}
              {!isCollapsed && (
                <div className="px-6 pb-6 border-t border-slate-700">
                  <div className="pt-6">
                    {order.status === "cancelled" ? (
                      <div className="bg-slate-700 rounded-lg p-6 text-center">
                        <p className="text-slate-400">
                          Production updates are disabled for cancelled orders.
                        </p>
                      </div>
                    ) : (
                      <ProductionTracker
                        orderId={order._id}
                        designId={design._id}
                        productionProgress={design.productionProgress || []}
                        onUpdate={() => fetchData(true)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        message={`Are you sure you want to delete this order for ${order?.partyName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Cancel Order Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Cancel Order</h2>
            <p className="text-slate-400 mb-4">
              Are you sure you want to cancel order #{order?.orderNumber} for{" "}
              {order?.partyName}?
            </p>
            <p className="text-slate-400 mb-4 text-sm">
              The order will remain in the system for records but will be marked
              as cancelled.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Images Modal */}
      <OrderImagePreviewModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        designs={order?.designs || []}
        partyName={order?.partyName || ""}
        orderNumber={order?.orderNumber || ""}
        orderDate={order?.orderDate || null}
        orderSpecialNotes={order?.specialNotes || ""}
        onConfirm={() => setShowPrintModal(false)}
      />
    </div>
  );
};

export default OrderDetailsPage;

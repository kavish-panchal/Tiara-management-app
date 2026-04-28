import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SkuImage from "../../components/common/SkuImage";
import OrderImagePreviewModal from "../../components/orders/OrderImagePreviewModal";
import api from "../../utils/api";

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [formData, setFormData] = useState({
    partyName: "",
    orderDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    specialNotes: "",
    designs: [],
  });

  const addDesign = () => {
    setFormData({
      ...formData,
      designs: [
        ...formData.designs,
        {
          skuCode: "",
          sizeBreakdown: [{ size: "", sets: "" }],
        },
      ],
    });
  };

  const removeDesign = (index) => {
    setFormData({
      ...formData,
      designs: formData.designs.filter((_, i) => i !== index),
    });
  };

  const updateDesign = (index, field, value) => {
    const updatedDesigns = [...formData.designs];
    updatedDesigns[index][field] = value;
    setFormData({ ...formData, designs: updatedDesigns });
  };

  const addSizeBreakdown = (designIndex) => {
    const updatedDesigns = [...formData.designs];
    updatedDesigns[designIndex].sizeBreakdown.push({ size: "", sets: "" });
    setFormData({ ...formData, designs: updatedDesigns });
  };

  const removeSizeBreakdown = (designIndex, sizeIndex) => {
    const updatedDesigns = [...formData.designs];
    updatedDesigns[designIndex].sizeBreakdown = updatedDesigns[
      designIndex
    ].sizeBreakdown.filter((_, i) => i !== sizeIndex);
    setFormData({ ...formData, designs: updatedDesigns });
  };

  const updateSizeBreakdown = (designIndex, sizeIndex, field, value) => {
    const updatedDesigns = [...formData.designs];
    updatedDesigns[designIndex].sizeBreakdown[sizeIndex][field] = value;
    setFormData({ ...formData, designs: updatedDesigns });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check if there are designs with images
    const designsWithImages = formData.designs.filter((d) => d.skuCode);

    if (designsWithImages.length > 0) {
      // Show preview modal first
      setShowPreviewModal(true);
    } else {
      // No designs or no SKU codes, create order directly
      await createOrder();
    }
  };

  const createOrder = async () => {
    setLoading(true);
    setError("");

    try {
      await api.post("/orders", formData);
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    setShowPreviewModal(false);
    await createOrder();
  };

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
        <h1 className="text-3xl font-bold text-white mb-2">Create New Order</h1>
        <p className="text-slate-400">Add a new customer order</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Order Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Party Name *
              </label>
              <input
                type="text"
                value={formData.partyName}
                onChange={(e) =>
                  setFormData({ ...formData, partyName: e.target.value })
                }
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter party name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Order Date *
              </label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) =>
                  setFormData({ ...formData, orderDate: e.target.value })
                }
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Special Notes
              </label>
              <textarea
                value={formData.specialNotes}
                onChange={(e) =>
                  setFormData({ ...formData, specialNotes: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes for this order"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Designs */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Bangle Designs</h2>

          {formData.designs.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No designs added yet. Click "Add Design" to start.
            </p>
          ) : (
            <div className="space-y-4 mb-4">
              {formData.designs.map((design, designIndex) => (
                <div key={designIndex} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Design {designIndex + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeDesign(designIndex)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="shrink-0">
                        <SkuImage skuCode={design.skuCode} size="lg" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          SKU Code *
                        </label>
                        <input
                          type="text"
                          value={design.skuCode}
                          onChange={(e) =>
                            updateDesign(designIndex, "skuCode", e.target.value)
                          }
                          required
                          className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter SKU code"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Size Breakdown
                      </label>
                      <button
                        type="button"
                        onClick={() => addSizeBreakdown(designIndex)}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                      >
                        <Plus size={16} />
                        <span>Add Size</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {design.sizeBreakdown.map((size, sizeIndex) => (
                        <div
                          key={sizeIndex}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={size.size}
                            onChange={(e) =>
                              updateSizeBreakdown(
                                designIndex,
                                sizeIndex,
                                "size",
                                e.target.value,
                              )
                            }
                            placeholder="Size"
                            className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            value={size.sets}
                            onChange={(e) =>
                              updateSizeBreakdown(
                                designIndex,
                                sizeIndex,
                                "sets",
                                e.target.value,
                              )
                            }
                            placeholder="Sets"
                            min="1"
                            className="w-24 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeSizeBreakdown(designIndex, sizeIndex)
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Design Button - Moved to bottom */}
          <button
            type="button"
            onClick={addDesign}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add Design</span>
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || formData.designs.length === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>

      {/* Image Preview Modal */}
      <OrderImagePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        designs={formData.designs}
        partyName={formData.partyName}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
};

export default CreateOrderPage;

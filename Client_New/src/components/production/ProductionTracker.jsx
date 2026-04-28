import { CheckCircle, Circle, Clock, Edit2, Save, X } from "lucide-react";
import { useState } from "react";
import api from "../../utils/api";

const ProductionTracker = ({
  orderId,
  designId,
  productionProgress,
  onUpdate,
}) => {
  const [editingStage, setEditingStage] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={20} />;
      case "in-progress":
        return <Clock className="text-blue-500" size={20} />;
      default:
        return <Circle className="text-slate-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 border-green-500 text-green-500";
      case "in-progress":
        return "bg-blue-500/10 border-blue-500 text-blue-500";
      default:
        return "bg-slate-500/10 border-slate-500 text-slate-500";
    }
  };

  const handleEdit = (stage) => {
    setEditingStage(stage._id || stage.stageName);
    setFormData({
      status: stage.status,
      labour: stage.labour || "",
      startDate: stage.startDate
        ? new Date(stage.startDate).toISOString().split("T")[0]
        : "",
      finishDate: stage.finishDate
        ? new Date(stage.finishDate).toISOString().split("T")[0]
        : "",
    });
  };

  const handleCancel = () => {
    setEditingStage(null);
    setFormData({});
  };

  const handleSave = async (stageName) => {
    setLoading(true);
    try {
      await api.put(
        `/orders/${orderId}/designs/${designId}/production/${stageName}`,
        formData,
      );
      setEditingStage(null);
      setFormData({});
      onUpdate();
    } catch (error) {
      console.error("Failed to update production stage:", error);
      alert("Failed to update production stage");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!productionProgress || productionProgress.length === 0) {
    return (
      <div className="bg-slate-700 rounded-lg p-4">
        <p className="text-slate-400 text-center">
          No production stages configured
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-700 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-white mb-4">
        Production Progress
      </h4>
      <div className="space-y-3">
        {productionProgress.map((stage, index) => {
          const isEditing = editingStage === (stage._id || stage.stageName);

          return (
            <div key={index} className="bg-slate-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(stage.status)}
                  <div className="flex-1">
                    <h5 className="text-white font-semibold">
                      {stage.stageName}
                    </h5>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium border mt-1 ${getStatusColor(stage.status)}`}
                    >
                      {stage.status.replace("-", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => handleEdit(stage)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors ml-4 shrink-0"
                  >
                    <Edit2 size={18} />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 mt-4 pt-4 border-t border-slate-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Labour
                      </label>
                      <input
                        type="text"
                        value={formData.labour}
                        onChange={(e) =>
                          setFormData({ ...formData, labour: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Worker name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Finish Date
                      </label>
                      <input
                        type="date"
                        value={formData.finishDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            finishDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors flex items-center space-x-1"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={() => handleSave(stage.stageName)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded transition-colors flex items-center space-x-1"
                    >
                      <Save size={16} />
                      <span>{loading ? "Saving..." : "Save"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs">Labour</p>
                    <p className="text-white">{stage.labour || "-"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Start Date</p>
                    <p className="text-white">{formatDate(stage.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Finish Date</p>
                    <p className="text-white">{formatDate(stage.finishDate)}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionTracker;

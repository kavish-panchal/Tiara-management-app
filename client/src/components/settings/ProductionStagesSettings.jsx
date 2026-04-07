import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import api from '../../utils/api';

const ProductionStagesSettings = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ stageName: '', order: 0, active: true });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const response = await api.get('/settings/production-stages');
      setStages(response.data);
    } catch (error) {
      console.error('Failed to fetch stages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ stageName: '', order: stages.length + 1, active: true });
  };

  const handleEdit = (stage) => {
    setEditingId(stage._id);
    setFormData({ stageName: stage.stageName, order: stage.order, active: stage.active });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ stageName: '', order: 0, active: true });
  };

  const handleSave = async () => {
    try {
      if (isAdding) {
        await api.post('/settings/production-stages', formData);
      } else {
        await api.put(`/settings/production-stages/${editingId}`, formData);
      }
      fetchStages();
      handleCancel();
    } catch (error) {
      console.error('Failed to save stage:', error);
      alert('Failed to save stage');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this stage?')) return;

    try {
      await api.delete(`/settings/production-stages/${id}`);
      fetchStages();
    } catch (error) {
      console.error('Failed to delete stage:', error);
      alert('Failed to delete stage');
    }
  };

  const handleToggleActive = async (stage) => {
    try {
      await api.put(`/settings/production-stages/${stage._id}`, {
        ...stage,
        active: !stage.active,
      });
      fetchStages();
    } catch (error) {
      console.error('Failed to toggle stage:', error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Production Stages</h2>
        {!isAdding && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add Stage</span>
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-slate-700 rounded-lg p-4 mb-4">
          <h3 className="text-white font-semibold mb-3">New Stage</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Stage Name
              </label>
              <input
                type="text"
                value={formData.stageName}
                onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter stage name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.stageName}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Stages List */}
      <div className="space-y-2">
        {stages.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No production stages configured</p>
        ) : (
          stages.map((stage) => {
            const isEditing = editingId === stage._id;

            return (
              <div
                key={stage._id}
                className={`bg-slate-700 rounded-lg p-4 ${!stage.active ? 'opacity-50' : ''}`}
              >
                {isEditing ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={formData.stageName}
                          onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors flex items-center space-x-1"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center space-x-1"
                      >
                        <Save size={16} />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="text-slate-500" size={20} />
                      <div>
                        <p className="text-white font-medium">{stage.stageName}</p>
                        <p className="text-slate-400 text-xs">Order: {stage.order}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(stage)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          stage.active
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-slate-500/10 text-slate-500'
                        }`}
                      >
                        {stage.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleEdit(stage)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(stage._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductionStagesSettings;


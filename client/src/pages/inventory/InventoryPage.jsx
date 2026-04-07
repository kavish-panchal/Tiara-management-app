import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import api from '../../utils/api';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 0,
    notes: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/inventory');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ itemName: '', quantity: 0, notes: '' });
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({ itemName: item.itemName, quantity: item.quantity, notes: item.notes || '' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ itemName: '', quantity: 0, notes: '' });
  };

  const handleSave = async () => {
    try {
      if (isAdding) {
        await api.post('/inventory', formData);
      } else {
        await api.put(`/inventory/${editingId}`, formData);
      }
      fetchItems();
      handleCancel();
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/inventory/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inventory</h1>
          <p className="text-slate-400">Manage inventory items</p>
        </div>
        {!isAdding && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">New Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.itemName}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Item Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Quantity</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Notes</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {items.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                  No inventory items found
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isEditing = editingId === item._id;

                return (
                  <tr key={item._id} className="hover:bg-slate-750">
                    {isEditing ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={formData.itemName}
                            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleCancel}
                              className="text-slate-400 hover:text-white transition-colors"
                            >
                              <X size={18} />
                            </button>
                            <button
                              onClick={handleSave}
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              <Save size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm text-white font-medium">{item.itemName}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{item.notes || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;


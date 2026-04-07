import { Edit2, Eye, EyeOff, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../utils/api";

const UserManagementSettings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "manager",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ name: "", username: "", password: "", role: "manager" });
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setFormData({
      name: user.name,
      username: user.username,
      password: "",
      role: user.role,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", username: "", password: "", role: "manager" });
    setShowPassword(false);
  };

  const handleSave = async () => {
    try {
      if (isAdding) {
        await api.post("/users", formData);
      } else {
        // Only send password if it's been changed
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.put(`/users/${editingId}`, updateData);
      }
      fetchUsers();
      handleCancel();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert(error.response?.data?.message || "Failed to save user");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">User Management</h2>
        {!isAdding && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-slate-700 rounded-lg p-4 mb-4">
          <h3 className="text-white font-semibold mb-3">
            {isAdding ? "New User" : "Edit User"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password {!isAdding && "(leave blank to keep current)"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
              </select>
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
              disabled={
                !formData.name ||
                !formData.username ||
                (isAdding && !formData.password)
              }
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                Username
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-750">
                  <td className="px-4 py-3 text-sm text-white">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {user.username}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === "owner"
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementSettings;

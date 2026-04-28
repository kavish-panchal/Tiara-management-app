import {
    Activity,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Filter,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../utils/api";

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    resourceType: "",
    fromDate: "",
    toDate: "",
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 50,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== ""),
        ),
      });

      const response = await api.get(`/audit-logs?${params}`);
      setLogs(response.data.logs);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/audit-logs/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      userId: "",
      action: "",
      resourceType: "",
      fromDate: "",
      toDate: "",
    });
    setPage(1);
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: "bg-green-500/10 text-green-500 border-green-500",
      UPDATE: "bg-blue-500/10 text-blue-500 border-blue-500",
      DELETE: "bg-red-500/10 text-red-500 border-red-500",
      LOGIN: "bg-purple-500/10 text-purple-500 border-purple-500",
      LOGOUT: "bg-slate-500/10 text-slate-500 border-slate-500",
      STATUS_CHANGE: "bg-amber-500/10 text-amber-500 border-amber-500",
      PRODUCTION_UPDATE: "bg-cyan-500/10 text-cyan-500 border-cyan-500",
    };
    return colors[action] || "bg-slate-500/10 text-slate-500 border-slate-500";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
          <Activity size={32} />
          <span>Activity Log</span>
        </h1>
        <p className="text-slate-400">
          Track all changes made by users in the system
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-1">Total Activities</p>
            <p className="text-white font-semibold text-2xl">
              {stats.totalLogs}
            </p>
          </div>
          {stats.actionStats.slice(0, 3).map((stat) => (
            <div key={stat._id} className="bg-slate-800 rounded-lg p-6">
              <p className="text-slate-400 text-sm mb-1">{stat._id}</p>
              <p className="text-white font-semibold text-2xl">{stat.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Filter size={20} />
            <span>Filters</span>
          </h2>
          <button
            onClick={clearFilters}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              User
            </label>
            <select
              value={filters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="STATUS_CHANGE">Status Change</option>
              <option value="PRODUCTION_UPDATE">Production Update</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Resource Type
            </label>
            <select
              value={filters.resourceType}
              onChange={(e) =>
                handleFilterChange("resourceType", e.target.value)
              }
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Order">Order</option>
              <option value="User">User</option>
              <option value="ProductionStage">Production Stage</option>
              <option value="AppSettings">App Settings</option>
              <option value="Auth">Auth</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-slate-500" />
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-slate-500" />
                        <div>
                          <p className="text-white font-medium">
                            {log.userName}
                          </p>
                          <p className="text-slate-400 text-xs">
                            @{log.userUsername}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {log.resourceType}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-700 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;

import { AlertCircle, CheckCircle, Clock, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../utils/api";

const ReportsPage = () => {
  const [searchParams] = useSearchParams();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [dueToday, setDueToday] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "pending",
  );

  // Worker report state
  const [workerName, setWorkerName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [workerReport, setWorkerReport] = useState(null);
  const [loadingWorkerReport, setLoadingWorkerReport] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [pendingRes, activeRes, completedRes, dueTodayRes, overdueRes] =
        await Promise.all([
          api.get("/reports/pending-orders"),
          api.get("/reports/active-orders"),
          api.get("/reports/completed-orders"),
          api.get("/reports/due-today"),
          api.get("/reports/overdue"),
        ]);
      setPendingOrders(pendingRes.data);
      setActiveOrders(activeRes.data);
      setCompletedOrders(completedRes.data);
      setDueToday(dueTodayRes.data);
      setOverdue(overdueRes.data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500",
      "in-production": "bg-blue-500/10 text-blue-500 border-blue-500",
      completed: "bg-green-500/10 text-green-500 border-green-500",
    };
    return colors[status] || colors.pending;
  };

  const fetchWorkerReport = async () => {
    if (!workerName) {
      alert("Please enter a worker name");
      return;
    }

    setLoadingWorkerReport(true);
    try {
      const params = new URLSearchParams();
      params.append("workerName", workerName);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      const response = await api.get(`/reports/worker-report?${params}`);
      setWorkerReport(response.data);
    } catch (error) {
      console.error("Failed to fetch worker report:", error);
      alert("Failed to fetch worker report");
    } finally {
      setLoadingWorkerReport(false);
    }
  };

  const tabs = [
    {
      id: "pending",
      label: "Pending Orders",
      count: pendingOrders.length,
      icon: Clock,
    },
    {
      id: "active",
      label: "Active Orders",
      count: activeOrders.length,
      icon: Clock,
    },
    {
      id: "completed",
      label: "Completed Orders",
      count: completedOrders.length,
      icon: CheckCircle,
    },
    {
      id: "due-today",
      label: "Due Today",
      count: dueToday.length,
      icon: AlertCircle,
    },
    {
      id: "overdue",
      label: "Overdue",
      count: overdue.length,
      icon: AlertCircle,
    },
    {
      id: "worker-report",
      label: "Worker Report",
      count: null,
      icon: Users,
    },
  ];

  const getCurrentOrders = () => {
    switch (activeTab) {
      case "pending":
        return pendingOrders;
      case "active":
        return activeOrders;
      case "completed":
        return completedOrders;
      case "due-today":
        return dueToday;
      case "overdue":
        return overdue;
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading reports...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
        <p className="text-slate-400">View order reports and analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">
              Pending Orders
            </h3>
            <Clock className="text-slate-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">
            {pendingOrders.length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">
              Active Orders
            </h3>
            <Clock className="text-blue-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{activeOrders.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Due Today</h3>
            <AlertCircle className="text-yellow-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{dueToday.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Overdue</h3>
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{overdue.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 rounded-lg mb-6">
        <div className="flex border-b border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="bg-slate-700 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "worker-report" ? (
        /* Worker Report Section */
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Filter Worker Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Worker Name *
                </label>
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="Enter worker name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchWorkerReport}
                  disabled={loadingWorkerReport}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loadingWorkerReport ? "Loading..." : "Generate Report"}
                </button>
              </div>
            </div>
          </div>

          {/* Worker Report Results */}
          {workerReport && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-slate-400 text-sm font-medium mb-2">
                    Total Tasks
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {workerReport.totalTasks}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-slate-400 text-sm font-medium mb-2">
                    Completed
                  </h3>
                  <p className="text-3xl font-bold text-green-500">
                    {workerReport.completedTasks}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-slate-400 text-sm font-medium mb-2">
                    In Progress
                  </h3>
                  <p className="text-3xl font-bold text-blue-500">
                    {workerReport.inProgressTasks}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-slate-400 text-sm font-medium mb-2">
                    Not Started
                  </h3>
                  <p className="text-3xl font-bold text-slate-500">
                    {workerReport.notStartedTasks}
                  </p>
                </div>
              </div>

              {/* Tasks Table */}
              <div className="bg-slate-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-white">
                    Task Details
                  </h3>
                </div>
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
                        SKU Code
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Stage
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Worker
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Start Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Finish Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {workerReport.tasks.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-8 text-center text-slate-400"
                        >
                          No tasks found for this worker
                        </td>
                      </tr>
                    ) : (
                      workerReport.tasks.map((task, index) => (
                        <tr key={index} className="hover:bg-slate-750">
                          <td className="px-6 py-4 text-sm text-white font-mono">
                            #{task.orderNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-white font-medium">
                            {task.partyName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {task.skuCode}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {task.stageName}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                task.status === "completed"
                                  ? "bg-green-500/10 text-green-500 border-green-500"
                                  : task.status === "in-progress"
                                    ? "bg-blue-500/10 text-blue-500 border-blue-500"
                                    : "bg-slate-500/10 text-slate-500 border-slate-500"
                              }`}
                            >
                              {task.status.replace("-", " ").toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {task.labour || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {task.startDate ? formatDate(task.startDate) : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {task.finishDate
                              ? formatDate(task.finishDate)
                              : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Orders Table */
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
              {getCurrentOrders().length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                getCurrentOrders().map((order) => (
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
                      <span
                        className={
                          activeTab === "overdue"
                            ? "text-red-400 font-semibold"
                            : ""
                        }
                      >
                        {formatDate(order.dueDate)}
                      </span>
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
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

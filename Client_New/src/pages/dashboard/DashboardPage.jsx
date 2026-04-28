import {
    AlertCircle,
    CheckCircle,
    Clock,
    Factory,
    ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    pending: 0,
    activeOrders: 0,
    dueToday: 0,
    overdue: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Pending Orders",
      value: stats.pending,
      icon: Clock,
      color: "bg-slate-600",
      link: "/reports?tab=pending",
    },
    {
      title: "Active Orders",
      value: stats.activeOrders,
      icon: ShoppingCart,
      color: "bg-blue-600",
      link: "/reports?tab=active",
    },
    {
      title: "Due Today",
      value: stats.dueToday,
      icon: AlertCircle,
      color: "bg-yellow-600",
      link: "/reports?tab=due-today",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertCircle,
      color: "bg-red-600",
      link: "/reports?tab=overdue",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "bg-green-600",
      link: "/reports?tab=completed",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your inventory and orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">
              {stat.title}
            </h3>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/orders/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
          >
            Create New Order
          </Link>
          <Link
            to="/production"
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
          >
            View Production
          </Link>
          <Link
            to="/reports"
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
          >
            View Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

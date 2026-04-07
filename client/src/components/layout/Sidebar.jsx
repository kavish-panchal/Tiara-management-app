import {
    FileText,
    LayoutDashboard,
    LogOut,
    Package,
    Settings,
    ShoppingCart,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import useAuthStore from "../../stores/authStore";

const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/inventory", icon: Package, label: "Inventory" },
    { to: "/reports", icon: FileText, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" }, // Available to all users
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-slate-800 min-h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">Inventory App</h1>
        <p className="text-sm text-slate-400 mt-1">Bangle Manufacturing</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">{user?.name}</p>
            <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

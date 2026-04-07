import { Activity, Layers, Settings, Users } from "lucide-react";
import { useState } from "react";
import GeneralSettings from "../../components/settings/GeneralSettings";
import ProductionStagesSettings from "../../components/settings/ProductionStagesSettings";
import UserManagementSettings from "../../components/settings/UserManagementSettings";
import useAuthStore from "../../stores/authStore";
import ActivityLogPage from "./ActivityLogPage";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { user } = useAuthStore();
  const isOwner = user?.role === "owner";

  // Define all tabs
  const allTabs = [
    { id: "general", label: "General", icon: Settings, ownerOnly: false },
    { id: "stages", label: "Production Stages", icon: Layers, ownerOnly: true },
    { id: "users", label: "User Management", icon: Users, ownerOnly: true },
    { id: "activity", label: "Activity Log", icon: Activity, ownerOnly: true },
  ];

  // Filter tabs based on user role
  const tabs = allTabs.filter((tab) => !tab.ownerOnly || isOwner);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage system configuration</p>
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
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "stages" && <ProductionStagesSettings />}
        {activeTab === "users" && <UserManagementSettings />}
        {activeTab === "activity" && <ActivityLogPage />}
      </div>
    </div>
  );
};

export default SettingsPage;

import { FolderOpen, Save } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../utils/api";

const GeneralSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skuImageFolderPath, setSkuImageFolderPath] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings/app");
      setSettings(response.data);
      setSkuImageFolderPath(response.data.skuImageFolderPath || "");
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings/app", { skuImageFolderPath });
      alert("Settings saved successfully!");
      fetchSettings();
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          SKU Image Settings (Local)
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Configure the folder path where SKU images are stored on your local
          computer. Images should be named with the SKU code (e.g., BNG-001.jpg,
          BNG-002.png).
        </p>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6">
          <p className="text-blue-400 text-xs">
            💡 <strong>Note:</strong> This setting is stored locally for your
            computer. Each user can set their own image folder path on their
            machine.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <div className="flex items-center space-x-2">
                <FolderOpen size={16} />
                <span>SKU Image Folder Path</span>
              </div>
            </label>
            <input
              type="text"
              value={skuImageFolderPath}
              onChange={(e) => setSkuImageFolderPath(e.target.value)}
              placeholder="C:\Images\SKU or /home/user/images/sku"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-slate-500 text-xs mt-2">
              Enter the full path to the folder containing SKU images. Supported
              formats: JPG, JPEG, PNG, GIF, WEBP
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              <Save size={16} />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">How it works</h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            <span>
              Place all SKU images in a single folder on your computer
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            <span>
              Name each image file with the exact SKU code (e.g., BNG-001.jpg)
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            <span>Enter the full path to that folder in the field above</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            <span>
              Images will automatically appear when creating or viewing orders
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GeneralSettings;

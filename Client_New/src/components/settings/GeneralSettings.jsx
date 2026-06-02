import { Cloud, Image } from "lucide-react";

const GeneralSettings = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Cloud size={24} className="text-blue-400" />
          <span>SKU Image Storage</span>
        </h2>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-blue-400 text-sm">
            ✅ <strong>AWS S3 Cloud Storage Active</strong>
          </p>
          <p className="text-slate-300 text-sm mt-2">
            All SKU images are stored in AWS S3 cloud storage and automatically
            loaded when viewing orders. No local configuration needed.
          </p>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Image size={20} className="text-green-400" />
            <span>How It Works</span>
          </h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-start">
              <span className="text-green-400 mr-2 mt-0.5">✓</span>
              <span>
                Images are stored in <strong>AWS S3</strong> bucket:{" "}
                <code className="text-blue-300">tiara-sku-images</code>
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2 mt-0.5">✓</span>
              <span>
                Images are automatically loaded when you view orders or create
                new orders
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2 mt-0.5">✓</span>
              <span>
                Supported formats: <strong>JPG, JPEG, PNG, GIF, WEBP</strong>
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2 mt-0.5">✓</span>
              <span>
                Images should be named with the SKU code (e.g.,{" "}
                <code className="text-blue-300">TBC-001.jpg</code>)
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          📤 Uploading New Images
        </h3>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-300 text-sm mb-3">
            To upload new images to AWS S3, contact your system administrator.
            Images are uploaded via backend scripts.
          </p>
          <div className="text-xs text-slate-400 font-mono bg-slate-900 p-3 rounded">
            <p className="text-slate-500 mb-1"># For administrators:</p>
            <p>cd server</p>
            <p>node scripts/uploadImagesToS3.js</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;

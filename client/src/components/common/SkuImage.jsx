import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";

const SkuImage = ({ skuCode, className = "", size = "md" }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageKey, setImageKey] = useState(Date.now());

  // Get API base URL
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Reset error and loading states when skuCode changes
  useEffect(() => {
    setImageError(false);
    setLoading(true);
    setImageKey(Date.now()); // Force image reload by changing key
  }, [skuCode]);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  if (!skuCode) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} bg-slate-700 rounded-lg flex items-center justify-center`}
      >
        <ImageOff className="text-slate-500" size={iconSizes[size]} />
      </div>
    );
  }

  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} bg-slate-700 rounded-lg flex flex-col items-center justify-center p-2`}
      >
        <ImageOff className="text-slate-500 mb-1" size={iconSizes[size]} />
        <span className="text-slate-500 text-xs text-center">No image</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {loading && (
        <div className="absolute inset-0 bg-slate-700 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      <img
        key={imageKey}
        src={`${API_BASE_URL}/settings/app/sku-image/${skuCode}?t=${imageKey}`}
        alt={skuCode}
        className={`w-full h-full object-cover rounded-lg ${loading ? "opacity-0" : "opacity-100"} transition-opacity`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setImageError(true);
        }}
      />
    </div>
  );
};

export default SkuImage;

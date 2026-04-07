import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', variant = 'danger' }) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700',
      icon: 'text-red-500',
      iconBg: 'bg-red-500/10'
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700',
      icon: 'text-yellow-500',
      iconBg: 'bg-yellow-500/10'
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: 'text-blue-500',
      iconBg: 'bg-blue-500/10'
    }
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
            <AlertTriangle className={styles.icon} size={24} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-slate-300 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2 ${styles.button} text-white font-medium rounded-lg transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;


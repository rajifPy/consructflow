// ============================================
// packages/shared-ui/src/components/Alert.tsx
// ============================================

import React from 'react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
}

const alertStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, message, onClose }) => {
  return (
    <div className={`border-l-4 p-4 ${alertStyles[type]}`}>
      <div className="flex items-start">
        <div className="flex-1">
          {title && <p className="font-medium mb-1">{title}</p>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
            ×
          </button>
        )}
      </div>
    </div>
  );
};
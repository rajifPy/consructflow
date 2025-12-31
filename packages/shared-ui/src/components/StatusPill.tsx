import React from 'react';

interface StatusPillProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  // Projects
  planning: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  
  // Purchase Orders
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  ordered: 'bg-blue-100 text-blue-800',
  received: 'bg-purple-100 text-purple-800',
  
  // Equipment
  available: 'bg-green-100 text-green-800',
  deployed: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-orange-100 text-orange-800',
  retired: 'bg-gray-100 text-gray-800',
};

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-800';
  const label = status.replace(/_/g, ' ').toUpperCase();

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${style}`}>
      {label}
    </span>
  );
};

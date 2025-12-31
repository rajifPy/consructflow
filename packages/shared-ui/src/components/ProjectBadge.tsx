// ============================================
// packages/shared-ui/src/components/ProjectBadge.tsx
// ============================================

import React from 'react';
import { StatusPill } from './StatusPill';

interface ProjectBadgeProps {
  name: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  location?: string;
}

export const ProjectBadge: React.FC<ProjectBadgeProps> = ({ name, status, location }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        {location && <p className="text-xs text-gray-500 truncate">{location}</p>}
      </div>
      <StatusPill status={status} />
    </div>
  );
};
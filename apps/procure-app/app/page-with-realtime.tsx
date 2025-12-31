// ============================================
// Usage example in Dashboard
// apps/procure-app/app/page-with-realtime.tsx
// ============================================

'use client';

import { useRealtimeDailyLogs } from '@/hooks/useRealtimeLogs';
import { Card, Alert } from '@constructflow/shared-ui';

export default function DashboardWithRealtime() {
  const { logs, loading } = useRealtimeDailyLogs();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard (Live Updates)</h1>

      {logs.length > 0 && (
        <Alert 
          type="info" 
          message={`New daily log submitted! Materials inventory has been updated.`}
        />
      )}

      <Card title="Recent Activity (Real-time)">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium">
                  {new Date(log.log_date).toLocaleDateString('id-ID')}
                </p>
                <p className="text-xs text-gray-600">
                  {Array.isArray(log.materials_used) 
                    ? `${log.materials_used.length} materials used` 
                    : 'No materials recorded'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
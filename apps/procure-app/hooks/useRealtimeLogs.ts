// ============================================
// Real-time Subscription Hook (Client-side)
// apps/procure-app/hooks/useRealtimeLogs.ts
// ============================================

import { useEffect, useState } from 'react';
import { supabase } from '@constructflow/shared-db';

interface DailyLog {
  id: string;
  log_date: string;
  project_id: string;
  materials_used: any[];
  // ... other fields
}

export function useRealtimeDailyLogs(projectId?: string) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchLogs = async () => {
      let query = supabase
        .from('daily_logs')
        .select('*')
        .order('log_date', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data } = await query;
      setLogs(data || []);
      setLoading(false);
    };

    fetchLogs();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('daily_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'daily_logs',
          filter: projectId ? `project_id=eq.${projectId}` : undefined,
        },
        (payload) => {
          console.log('Real-time update:', payload);

          if (payload.eventType === 'INSERT') {
            setLogs((prev) => [payload.new as DailyLog, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLogs((prev) =>
              prev.map((log) =>
                log.id === payload.new.id ? (payload.new as DailyLog) : log
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setLogs((prev) => prev.filter((log) => log.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { logs, loading };
}
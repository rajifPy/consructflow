// apps/crew-app/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, StatusPill } from '@constructflow/shared-ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Crew {
  id: string;
  name: string;
  projects?: {
    name: string;
    location: string;
    status: string;
  };
}

interface DailyLog {
  id: string;
  log_date: string;
  weather: string | null;
  projects?: {
    name: string;
  };
  crews?: {
    name: string;
  };
}

export default function CrewDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [todayLogsCount, setTodayLogsCount] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Get foreman's crews
      const { data: crewsData, error: crewsError } = await supabase
        .from('crews')
        .select(`
          *,
          projects(name, location, status)
        `)
        .eq('foreman_id', user.id);

      if (crewsError) {
        console.error('Error loading crews:', crewsError);
      } else {
        setCrews(crewsData || []);
      }

      // Get recent logs
      const crewIds = crewsData?.map((c) => c.id) || [];
      
      if (crewIds.length > 0) {
        const { data: logsData, error: logsError } = await supabase
          .from('daily_logs')
          .select(`
            *,
            projects(name),
            crews(name)
          `)
          .in('crew_id', crewIds)
          .order('log_date', { ascending: false })
          .limit(10);

        if (logsError) {
          console.error('Error loading logs:', logsError);
        } else {
          setRecentLogs(logsData || []);
        }

        // Get today's logs count
        const today = new Date().toISOString().split('T')[0];
        const { count, error: countError } = await supabase
          .from('daily_logs')
          .select('*', { count: 'exact', head: true })
          .in('crew_id', crewIds)
          .eq('log_date', today);

        if (!countError) {
          setTodayLogsCount(count || 0);
        }
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Crew Dashboard</h1>
        <Link href="/daily-log/create">
          <Button>Create Daily Log</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">My Crews</p>
            <p className="text-3xl font-bold text-gray-900">{crews.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Today's Logs</p>
            <p className="text-3xl font-bold text-blue-600">{todayLogsCount}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Logs</p>
            <p className="text-3xl font-bold text-gray-900">{recentLogs.length}</p>
          </div>
        </Card>
      </div>

      {/* My Crews */}
      <Card title="My Crews">
        <div className="space-y-3">
          {crews.length > 0 ? (
            crews.map((crew) => (
              <div key={crew.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{crew.name}</p>
                  <p className="text-sm text-gray-500">{crew.projects?.name}</p>
                  <p className="text-xs text-gray-400">{crew.projects?.location}</p>
                </div>
                {crew.projects?.status && (
                  <StatusPill status={crew.projects.status} />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No crews assigned yet</p>
              <p className="text-sm text-gray-400 mt-2">Contact your administrator to get assigned to a crew</p>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Logs */}
      <Card title="Recent Daily Logs">
        <div className="space-y-3">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <Link 
                key={log.id} 
                href={`/daily-log/${log.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{log.projects?.name}</p>
                    <p className="text-sm text-gray-500">{log.crews?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(log.log_date).toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {log.weather || 'No weather recorded'}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No logs yet</p>
              <p className="text-sm text-gray-400 mt-2">Create your first daily log!</p>
              <Link href="/daily-log/create" className="mt-4 inline-block">
                <Button>Create Daily Log</Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

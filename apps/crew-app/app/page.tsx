// apps/crew-app/app/page.tsx
import { supabase } from '@constructflow/shared-db';
import { Card, Button, StatusPill } from '@constructflow/shared-ui';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getForemenDashboard() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get foreman's crew
  const { data: crews } = await supabase
    .from('crews')
    .select(`
      *,
      projects(name, location, status)
    `)
    .eq('foreman_id', user.id);

  // Type cast to avoid TypeScript errors
  const typedCrews = crews as any[] | null;

  // Get recent logs for foreman's crews
  const crewIds = typedCrews?.map((c: any) => c.id) || [];
  const { data: recentLogs } = await supabase
    .from('daily_logs')
    .select(`
      *,
      projects(name),
      crews(name)
    `)
    .in('crew_id', crewIds)
    .order('log_date', { ascending: false })
    .limit(10);

  // Get today's logs count
  const today = new Date().toISOString().split('T')[0];
  const { count: todayLogsCount } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .in('crew_id', crewIds)
    .eq('log_date', today);

  return { crews: typedCrews, recentLogs, todayLogsCount };
}

export default async function CrewDashboard() {
  const { crews, recentLogs, todayLogsCount } = await getForemenDashboard();

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
            <p className="text-3xl font-bold text-gray-900">{crews?.length || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Today's Logs</p>
            <p className="text-3xl font-bold text-blue-600">{todayLogsCount || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Logs</p>
            <p className="text-3xl font-bold text-gray-900">{recentLogs?.length || 0}</p>
          </div>
        </Card>
      </div>

      {/* My Crews */}
      <Card title="My Crews">
        <div className="space-y-3">
          {crews && crews.length > 0 ? (
            crews.map((crew: any) => (
              <div key={crew.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{crew.name}</p>
                  <p className="text-sm text-gray-500">{crew.projects?.name}</p>
                  <p className="text-xs text-gray-400">{crew.projects?.location}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  crew.projects?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {crew.projects?.status?.toUpperCase()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No crews assigned</p>
          )}
        </div>
      </Card>

      {/* Recent Logs */}
      <Card title="Recent Daily Logs">
        <div className="space-y-3">
          {recentLogs && recentLogs.length > 0 ? (
            recentLogs.map((log: any) => (
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
            <p className="text-sm text-gray-500 text-center py-4">No logs yet. Create your first daily log!</p>
          )}
        </div>
      </Card>
    </div>
  );
}

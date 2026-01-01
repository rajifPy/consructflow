// apps/crew-app/app/daily-log/[id]/page.tsx
import { supabase } from '@constructflow/shared-db';
import { Card, StatusPill, Button } from '@constructflow/shared-ui';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getDailyLog(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: log } = await supabase
    .from('daily_logs')
    .select(`
      *,
      projects(name, location, status),
      crews(name),
      user_profiles:submitted_by(full_name, role)
    `)
    .eq('id', id)
    .single();

  // Fetch material details
  let materialsWithDetails: any[] = [];
  if (log && log.materials_used && Array.isArray(log.materials_used)) {
    const materialIds = (log.materials_used as any[]).map((m: any) => m.material_id);
    if (materialIds.length > 0) {
      const { data: materials } = await supabase
        .from('materials')
        .select('id, name, unit')
        .in('id', materialIds);

      materialsWithDetails = (log.materials_used as any[]).map((mu: any) => {
        const material = materials?.find(m => m.id === mu.material_id);
        return {
          ...mu,
          name: material?.name,
          unit: material?.unit
        };
      });
    }
  }

  // Fetch equipment details
  let equipmentWithDetails: any[] = [];
  if (log && log.equipment_used && Array.isArray(log.equipment_used)) {
    const equipmentIds = (log.equipment_used as any[]).map((e: any) => e.equipment_id);
    if (equipmentIds.length > 0) {
      const { data: equipment } = await supabase
        .from('equipment')
        .select('id, name, type')
        .in('id', equipmentIds);

      equipmentWithDetails = (log.equipment_used as any[]).map((eu: any) => {
        const equip = equipment?.find(e => e.id === eu.equipment_id);
        return {
          ...eu,
          name: equip?.name,
          type: equip?.type
        };
      });
    }
  }

  return { log, materialsWithDetails, equipmentWithDetails };
}

export default async function DailyLogDetailPage({ params }: { params: { id: string } }) {
  const { log, materialsWithDetails, equipmentWithDetails } = await getDailyLog(params.id);

  if (!log) {
    return <div>Log not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Daily Log Details</h1>
        <Link href="/">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Header Info */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="text-lg font-medium text-gray-900">
              {new Date(log.log_date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Project</p>
            <p className="text-lg font-medium text-gray-900">{(log as any).projects?.name}</p>
            <p className="text-sm text-gray-500">{(log as any).projects?.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Crew</p>
            <p className="text-lg font-medium text-gray-900">{(log as any).crews?.name}</p>
            <p className="text-sm text-gray-500">by {(log as any).user_profiles?.full_name}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Weather</p>
            <p className="text-base font-medium text-gray-900">{log.weather || 'Not recorded'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Project Status</p>
            <StatusPill status={(log as any).projects?.status} />
          </div>
        </div>
      </Card>

      {/* Activities */}
      <Card title="Activities Performed">
        {log.activities && Array.isArray(log.activities) && (log.activities as any[]).length > 0 ? (
          <div className="space-y-3">
            {(log.activities as any[]).map((activity: any, index: number) => (
              <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-base font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Duration: {activity.hours_worked} hours
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No activities recorded</p>
        )}
      </Card>

      {/* Materials Used */}
      <Card title="Materials Used">
        {materialsWithDetails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materialsWithDetails.map((material: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {material.name || 'Unknown Material'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.quantity_used}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.unit || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No materials used</p>
        )}
      </Card>

      {/* Equipment Used */}
      <Card title="Equipment Used">
        {equipmentWithDetails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours Operated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipmentWithDetails.map((equipment: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {equipment.name || 'Unknown Equipment'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {equipment.type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {equipment.hours_operated} hours
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No equipment used</p>
        )}
      </Card>

      {/* Progress Photos */}
      {log.progress_photos && Array.isArray(log.progress_photos) && (log.progress_photos as string[]).length > 0 && (
        <Card title={`Progress Photos (${(log.progress_photos as string[]).length})`}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(log.progress_photos as string[]).map((photoUrl: string, index: number) => (
              <a
                key={index}
                href={photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition"
              >
                <img
                  src={photoUrl}
                  alt={`Progress photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Issues */}
      {log.issues && (
        <Card title="Issues" className="border-l-4 border-red-500">
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-900 whitespace-pre-wrap">{log.issues}</p>
          </div>
        </Card>
      )}

      {/* Notes */}
      {log.notes && (
        <Card title="Additional Notes">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.notes}</p>
          </div>
        </Card>
      )}

      {/* Metadata */}
      <Card title="Log Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Submitted By</p>
            <p className="font-medium text-gray-900">
              {(log as any).user_profiles?.full_name} ({(log as any).user_profiles?.role})
            </p>
          </div>
          <div>
            <p className="text-gray-500">Submitted At</p>
            <p className="font-medium text-gray-900">
              {new Date(log.created_at).toLocaleString('id-ID')}
            </p>
          </div>
          {log.updated_at !== log.created_at && (
            <div>
              <p className="text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900">
                {new Date(log.updated_at).toLocaleString('id-ID')}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

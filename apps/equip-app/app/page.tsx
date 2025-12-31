// ============================================
// apps/equip-app/app/page.tsx - Equipment Dashboard
// ============================================

import { supabase } from '@constructflow/shared-db';
import { Card, StatusPill } from '@constructflow/shared-ui';
import { redirect } from 'next/navigation';

async function getEquipmentDashboardData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get equipment by status
  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .order('name');

  const statusCounts = {
    available: equipment?.filter(e => e.status === 'available').length || 0,
    deployed: equipment?.filter(e => e.status === 'deployed').length || 0,
    maintenance: equipment?.filter(e => e.status === 'maintenance').length || 0,
    retired: equipment?.filter(e => e.status === 'retired').length || 0,
  };

  // Get upcoming maintenance (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const { data: upcomingMaintenance } = await supabase
    .from('equipment')
    .select('*')
    .lte('next_maintenance_date', thirtyDaysFromNow.toISOString())
    .gte('next_maintenance_date', new Date().toISOString())
    .order('next_maintenance_date', { ascending: true })
    .limit(5);

  // Get deployed equipment with project info
  const { data: deployedEquipment } = await supabase
    .from('equipment')
    .select(`
      *,
      projects:current_project_id(name, location)
    `)
    .eq('status', 'deployed')
    .limit(5);

  return { statusCounts, upcomingMaintenance, deployedEquipment };
}

export default async function EquipmentDashboard() {
  const { statusCounts, upcomingMaintenance, deployedEquipment } = await getEquipmentDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Equipment Dashboard</h1>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-3xl font-bold text-green-600">{statusCounts.available}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Deployed</p>
            <p className="text-3xl font-bold text-blue-600">{statusCounts.deployed}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Maintenance</p>
            <p className="text-3xl font-bold text-orange-600">{statusCounts.maintenance}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Retired</p>
            <p className="text-3xl font-bold text-gray-600">{statusCounts.retired}</p>
          </div>
        </Card>
      </div>

      {/* Upcoming Maintenance */}
      <Card title="Upcoming Maintenance (Next 30 Days)" className="border-l-4 border-orange-500">
        <div className="space-y-3">
          {upcomingMaintenance && upcomingMaintenance.length > 0 ? (
            upcomingMaintenance.map((equip: any) => (
              <div key={equip.id} className="flex items-center justify-between p-3 bg-orange-50 rounded">
                <div>
                  <p className="font-medium text-orange-900">{equip.name}</p>
                  <p className="text-sm text-orange-700">{equip.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-900">
                    {new Date(equip.next_maintenance_date).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-xs text-orange-700">
                    {Math.ceil((new Date(equip.next_maintenance_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No maintenance scheduled</p>
          )}
        </div>
      </Card>

      {/* Deployed Equipment */}
      <Card title="Currently Deployed Equipment">
        <div className="space-y-3">
          {deployedEquipment && deployedEquipment.length > 0 ? (
            deployedEquipment.map((equip: any) => (
              <div key={equip.id} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                <div>
                  <p className="font-medium text-blue-900">{equip.name}</p>
                  <p className="text-sm text-blue-700">{equip.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-900">{equip.projects?.name}</p>
                  <p className="text-xs text-blue-700">{equip.projects?.location}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No equipment deployed</p>
          )}
        </div>
      </Card>

      {/* Equipment Map Placeholder */}
      <Card title="Equipment Location Map">
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <p className="text-gray-500">Map integration coming soon</p>
        </div>
      </Card>
    </div>
  );
}
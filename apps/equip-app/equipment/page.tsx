// ============================================
// apps/equip-app/app/equipment/page.tsx - Equipment Fleet
// ============================================

import Link from 'next/link';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, DataTable, StatusPill } from '@constructflow/shared-ui';
import type { Column } from '@constructflow/shared-ui';
import { redirect } from 'next/navigation';

async function getEquipment(status?: string, projectId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let query = supabase
    .from('equipment')
    .select(`
      *,
      projects:current_project_id(name)
    `)
    .order('name');

  if (status) {
    query = query.eq('status', status);
  }

  if (projectId) {
    query = query.eq('current_project_id', projectId);
  }

  const { data } = await query;
  return data || [];
}

export default async function EquipmentFleetPage({
  searchParams,
}: {
  searchParams: { status?: string; project?: string };
}) {
  const equipment = await getEquipment(searchParams.status, searchParams.project);

  const columns: Column<any>[] = [
    { 
      header: 'Name', 
      accessor: 'name',
      className: 'font-medium'
    },
    { 
      header: 'Type', 
      accessor: 'type'
    },
    { 
      header: 'Serial Number', 
      accessor: (row) => row.serial_number || '-'
    },
    { 
      header: 'Status', 
      accessor: (row) => <StatusPill status={row.status} />
    },
    { 
      header: 'Current Project', 
      accessor: (row) => row.projects?.name || '-'
    },
    { 
      header: 'Next Maintenance', 
      accessor: (row) => row.next_maintenance_date 
        ? new Date(row.next_maintenance_date).toLocaleDateString('id-ID')
        : '-'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Equipment Fleet</h1>
        <Link href="/equipment/create">
          <Button>Add Equipment</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4">
          <Link href="/equipment">
            <Button variant={!searchParams.status ? 'primary' : 'ghost'} size="sm">
              All
            </Button>
          </Link>
          <Link href="/equipment?status=available">
            <Button variant={searchParams.status === 'available' ? 'primary' : 'ghost'} size="sm">
              Available
            </Button>
          </Link>
          <Link href="/equipment?status=deployed">
            <Button variant={searchParams.status === 'deployed' ? 'primary' : 'ghost'} size="sm">
              Deployed
            </Button>
          </Link>
          <Link href="/equipment?status=maintenance">
            <Button variant={searchParams.status === 'maintenance' ? 'primary' : 'ghost'} size="sm">
              Maintenance
            </Button>
          </Link>
        </div>
      </Card>

      <Card>
        <DataTable 
          columns={columns} 
          data={equipment}
          emptyMessage="No equipment found. Add your first equipment!"
        />
      </Card>
    </div>
  );
}
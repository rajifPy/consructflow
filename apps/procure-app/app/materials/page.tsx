// ============================================
// apps/procure-app/app/materials/page.tsx
// ============================================

import Link from 'next/link';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, DataTable, Alert } from '@constructflow/shared-ui';
import type { Column } from '@constructflow/shared-ui';
import { redirect } from 'next/navigation';

async function getMaterials() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: materials } = await supabase
    .from('materials')
    .select(`
      *,
      projects(name),
      suppliers(name)
    `)
    .order('name');

  return materials || [];
}

export default async function MaterialsPage() {
  const materials = await getMaterials();
  const lowStockMaterials = materials.filter(m => m.quantity_on_hand <= m.reorder_level);

  const columns: Column<any>[] = [
    { 
      header: 'Material Name', 
      accessor: 'name',
      className: 'font-medium'
    },
    { 
      header: 'Project', 
      accessor: (row) => row.projects?.name || '-'
    },
    { 
      header: 'Unit', 
      accessor: 'unit'
    },
    { 
      header: 'On Hand', 
      accessor: (row) => (
        <span className={row.quantity_on_hand <= row.reorder_level ? 'text-red-600 font-bold' : ''}>
          {row.quantity_on_hand}
        </span>
      )
    },
    { 
      header: 'Reorder Level', 
      accessor: 'reorder_level'
    },
    { 
      header: 'Unit Cost', 
      accessor: (row) => row.unit_cost ? `Rp ${row.unit_cost.toLocaleString('id-ID')}` : '-'
    },
    { 
      header: 'Supplier', 
      accessor: (row) => row.suppliers?.name || '-'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
        <Link href="/materials/create">
          <Button>Add Material</Button>
        </Link>
      </div>

      {lowStockMaterials.length > 0 && (
        <Alert 
          type="warning" 
          title="Low Stock Alert"
          message={`${lowStockMaterials.length} material(s) below reorder level. Consider creating purchase orders.`}
        />
      )}

      <Card>
        <DataTable 
          columns={columns} 
          data={materials}
          emptyMessage="No materials yet. Add your first material!"
        />
      </Card>
    </div>
  );
}
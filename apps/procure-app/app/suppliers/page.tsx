// ============================================
// apps/procure-app/app/suppliers/page.tsx
// ============================================

import Link from 'next/link';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, DataTable } from '@constructflow/shared-ui';
import type { Column } from '@constructflow/shared-ui';
import { redirect } from 'next/navigation';

async function getSuppliers() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');

  return suppliers || [];
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  const columns: Column<any>[] = [
    { 
      header: 'Name', 
      accessor: 'name',
      className: 'font-medium'
    },
    { 
      header: 'Contact Person', 
      accessor: (row) => row.contact_person || '-'
    },
    { 
      header: 'Phone', 
      accessor: (row) => row.phone || '-'
    },
    { 
      header: 'Email', 
      accessor: (row) => row.email || '-'
    },
    { 
      header: 'Rating', 
      accessor: (row) => row.rating ? (
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{row.rating.toFixed(1)}</span>
        </div>
      ) : '-'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
        <Link href="/suppliers/create">
          <Button>Add Supplier</Button>
        </Link>
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={suppliers}
          emptyMessage="No suppliers yet. Add your first supplier!"
        />
      </Card>
    </div>
  );
}
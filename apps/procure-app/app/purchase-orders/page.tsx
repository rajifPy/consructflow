// ============================================
// apps/procure-app/app/purchase-orders/page.tsx
// ============================================

import Link from 'next/link';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, DataTable, StatusPill } from '@constructflow/shared-ui';
import type { Column } from '@constructflow/shared-ui';
import { redirect } from 'next/navigation';

async function getPurchaseOrders() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: pos } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      projects(name),
      suppliers(name)
    `)
    .order('created_at', { ascending: false });

  return pos || [];
}

export default async function PurchaseOrdersPage() {
  const pos = await getPurchaseOrders();

  const columns: Column<any>[] = [
    { 
      header: 'PO Number', 
      accessor: 'po_number',
      className: 'font-medium text-blue-600'
    },
    { 
      header: 'Project', 
      accessor: (row) => row.projects?.name || '-'
    },
    { 
      header: 'Supplier', 
      accessor: (row) => row.suppliers?.name || '-'
    },
    { 
      header: 'Order Date', 
      accessor: (row) => new Date(row.order_date).toLocaleDateString('id-ID')
    },
    { 
      header: 'Total Amount', 
      accessor: (row) => `Rp ${row.total_amount.toLocaleString('id-ID')}`,
      className: 'font-medium'
    },
    { 
      header: 'Status', 
      accessor: (row) => <StatusPill status={row.status} />
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
        <Link href="/purchase-orders/create">
          <Button>Create New PO</Button>
        </Link>
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={pos}
          emptyMessage="No purchase orders yet. Create your first PO!"
        />
      </Card>
    </div>
  );
}
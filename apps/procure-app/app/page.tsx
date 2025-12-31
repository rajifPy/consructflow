// ============================================
// apps/procure-app/app/page.tsx - Dashboard
// ============================================

import { supabase } from '@constructflow/shared-db';
import { Card, StatusPill } from '@constructflow/shared-ui';
import { redirect } from 'next/navigation';

async function getDashboardData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get running POs
  const { data: runningPOs } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      projects(name),
      suppliers(name)
    `)
    .in('status', ['pending_approval', 'approved', 'ordered'])
    .order('created_at', { ascending: false })
    .limit(5);

  // Get low stock materials
  const { data: lowStock } = await supabase
    .from('materials')
    .select(`
      *,
      projects(name)
    `)
    .lte('quantity_on_hand', supabase.rpc('quantity_on_hand'))
    .order('quantity_on_hand', { ascending: true })
    .limit(5);

  // Get this month's spending
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  
  const { data: monthlySpending } = await supabase
    .from('purchase_orders')
    .select('total_amount')
    .gte('order_date', startOfMonth.toISOString())
    .eq('status', 'approved');

  const totalSpending = monthlySpending?.reduce((sum, po) => sum + (po.total_amount || 0), 0) || 0;

  return { runningPOs, lowStock, totalSpending };
}

export default async function Dashboard() {
  const { runningPOs, lowStock, totalSpending } = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Procurement Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Running POs</p>
            <p className="text-3xl font-bold text-gray-900">{runningPOs?.length || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Low Stock Items</p>
            <p className="text-3xl font-bold text-red-600">{lowStock?.length || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">This Month Spending</p>
            <p className="text-3xl font-bold text-gray-900">
              Rp {totalSpending.toLocaleString('id-ID')}
            </p>
          </div>
        </Card>
      </div>

      {/* Running POs */}
      <Card title="Running Purchase Orders">
        <div className="space-y-3">
          {runningPOs && runningPOs.length > 0 ? (
            runningPOs.map((po: any) => (
              <div key={po.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{po.po_number}</p>
                  <p className="text-sm text-gray-500">{po.suppliers?.name}</p>
                </div>
                <StatusPill status={po.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No running purchase orders</p>
          )}
        </div>
      </Card>

      {/* Low Stock Alert */}
      <Card title="Low Stock Alert" className="border-l-4 border-red-500">
        <div className="space-y-3">
          {lowStock && lowStock.length > 0 ? (
            lowStock.map((material: any) => (
              <div key={material.id} className="flex items-center justify-between p-3 bg-red-50 rounded">
                <div>
                  <p className="font-medium text-red-900">{material.name}</p>
                  <p className="text-sm text-red-700">
                    Stock: {material.quantity_on_hand} {material.unit} (Reorder: {material.reorder_level})
                  </p>
                </div>
                <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                  {material.projects?.name}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">All materials well stocked</p>
          )}
        </div>
      </Card>
    </div>
  );
}
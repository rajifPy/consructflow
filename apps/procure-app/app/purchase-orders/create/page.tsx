// ============================================
// apps/procure-app/app/purchase-orders/create/page.tsx
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, Input, Select, Alert } from '@constructflow/shared-ui';

export default function CreatePOPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([{ material_id: '', quantity: 0, unit_price: 0 }]);

  const [formData, setFormData] = useState({
    project_id: '',
    supplier_id: '',
    expected_delivery: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: projectsData }, { data: suppliersData }] = await Promise.all([
      supabase.from('projects').select('*').order('name'),
      supabase.from('suppliers').select('*').order('name'),
    ]);

    setProjects(projectsData || []);
    setSuppliers(suppliersData || []);
  }

  useEffect(() => {
    if (formData.project_id) {
      loadMaterials(formData.project_id);
    }
  }, [formData.project_id]);

  async function loadMaterials(projectId: string) {
    const { data } = await supabase
      .from('materials')
      .select('*')
      .eq('project_id', projectId)
      .order('name');

    setMaterials(data || []);
  }

  const addItem = () => {
    setItems([...items, { material_id: '', quantity: 0, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create PO
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          ...formData,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();

      if (poError) throw poError;

      // Create PO items
      const { error: itemsError } = await supabase
        .from('po_items')
        .insert(
          items.map((item) => ({
            po_id: po.id,
            ...item,
          }))
        );

      if (itemsError) throw itemsError;

      router.push('/purchase-orders');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create Purchase Order</h1>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="PO Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Project"
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              options={[
                { value: '', label: 'Select Project' },
                ...projects.map((p) => ({ value: p.id, label: p.name })),
              ]}
              required
            />

            <Select
              label="Supplier"
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              options={[
                { value: '', label: 'Select Supplier' },
                ...suppliers.map((s) => ({ value: s.id, label: s.name })),
              ]}
              required
            />

            <Input
              label="Expected Delivery"
              type="date"
              value={formData.expected_delivery}
              onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
            />

            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </Card>

        <Card 
          title="Items" 
          action={
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              Add Item
            </Button>
          }
        >
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <Select
                    label="Material"
                    value={item.material_id}
                    onChange={(e) => updateItem(index, 'material_id', e.target.value)}
                    options={[
                      { value: '', label: 'Select Material' },
                      ...materials.map((m) => ({ value: m.id, label: `${m.name} (${m.unit})` })),
                    ]}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    label="Quantity"
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    label="Unit Price"
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                  <p className="font-medium">
                    Rp {(item.quantity * item.unit_price).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="col-span-1">
                  {items.length > 1 && (
                    <Button 
                      type="button" 
                      variant="danger" 
                      size="sm" 
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t flex justify-between items-center">
            <span className="text-lg font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Purchase Order
          </Button>
        </div>
      </form>
    </div>
  );
}
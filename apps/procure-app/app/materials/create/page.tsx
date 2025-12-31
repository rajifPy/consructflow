// ============================================
// apps/procure-app/app/materials/create/page.tsx
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, Input, Select, Alert } from '@constructflow/shared-ui';

export default function CreateMaterialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    project_id: '',
    name: '',
    unit: '',
    quantity_on_hand: 0,
    reorder_level: 0,
    unit_cost: '',
    supplier_id: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('materials')
        .insert({
          ...formData,
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
        });

      if (insertError) throw insertError;

      router.push('/materials');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Add Material</h1>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Material Details">
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

            <Input
              label="Material Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Cement, Steel Bar, Sand"
              required
            />

            <Input
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., kg, m3, pcs"
              required
            />

            <Input
              label="Initial Quantity On Hand"
              type="number"
              step="0.01"
              value={formData.quantity_on_hand}
              onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseFloat(e.target.value) })}
            />

            <Input
              label="Reorder Level"
              type="number"
              step="0.01"
              value={formData.reorder_level}
              onChange={(e) => setFormData({ ...formData, reorder_level: parseFloat(e.target.value) })}
              helperText="Alert when stock falls below this level"
            />

            <Input
              label="Unit Cost (Rp)"
              type="number"
              step="0.01"
              value={formData.unit_cost}
              onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
            />

            <Select
              label="Default Supplier"
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              options={[
                { value: '', label: 'Select Supplier (Optional)' },
                ...suppliers.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Material
          </Button>
        </div>
      </form>
    </div>
  );
}
// ============================================
// apps/equip-app/app/equipment/create/page.tsx
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, Input, Select, Alert } from '@constructflow/shared-ui';

export default function CreateEquipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    serial_number: '',
    purchase_date: '',
    status: 'available',
    current_project_id: '',
    maintenance_interval_days: 90,
    location: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .in('status', ['planning', 'active'])
      .order('name');

    setProjects(data || []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('equipment')
        .insert({
          ...formData,
          current_project_id: formData.current_project_id || null,
        });

      if (insertError) throw insertError;

      router.push('/equipment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Add Equipment</h1>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Equipment Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Equipment Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="e.g., Excavator, Crane, Mixer"
              required
            />

            <Input
              label="Serial Number"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
            />

            <Input
              label="Purchase Date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'available', label: 'Available' },
                { value: 'deployed', label: 'Deployed' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'retired', label: 'Retired' },
              ]}
            />

            <Select
              label="Assigned Project (Optional)"
              value={formData.current_project_id}
              onChange={(e) => setFormData({ ...formData, current_project_id: e.target.value })}
              options={[
                { value: '', label: 'None' },
                ...projects.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />

            <Input
              label="Maintenance Interval (Days)"
              type="number"
              value={formData.maintenance_interval_days}
              onChange={(e) => setFormData({ ...formData, maintenance_interval_days: parseInt(e.target.value) })}
            />

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Warehouse A, Site Office"
            />
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Equipment
          </Button>
        </div>
      </form>
    </div>
  );
}
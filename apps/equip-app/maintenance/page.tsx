// ============================================
// apps/equip-app/app/maintenance/create/page.tsx
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, Input, Select, Alert } from '@constructflow/shared-ui';

export default function CreateMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [equipment, setEquipment] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    equipment_id: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    maintenance_type: 'routine',
    description: '',
    cost: '',
    next_maintenance_date: '',
  });

  useEffect(() => {
    loadEquipment();
  }, []);

  async function loadEquipment() {
    const { data } = await supabase
      .from('equipment')
      .select('*')
      .order('name');

    setEquipment(data || []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert maintenance log
      const { error: logError } = await supabase
        .from('maintenance_logs')
        .insert({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          performed_by: user.id,
        });

      if (logError) throw logError;

      // Update equipment next maintenance date
      if (formData.next_maintenance_date) {
        const { error: updateError } = await supabase
          .from('equipment')
          .update({ 
            next_maintenance_date: formData.next_maintenance_date,
            last_maintenance_date: formData.maintenance_date,
          })
          .eq('id', formData.equipment_id);

        if (updateError) throw updateError;
      }

      router.push('/maintenance');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Record Maintenance</h1>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Maintenance Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Equipment"
              value={formData.equipment_id}
              onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
              options={[
                { value: '', label: 'Select Equipment' },
                ...equipment.map((eq) => ({ value: eq.id, label: `${eq.name} (${eq.type})` })),
              ]}
              required
            />

            <Input
              label="Maintenance Date"
              type="date"
              value={formData.maintenance_date}
              onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
              required
            />

            <Select
              label="Maintenance Type"
              value={formData.maintenance_type}
              onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
              options={[
                { value: 'routine', label: 'Routine Maintenance' },
                { value: 'repair', label: 'Repair' },
                { value: 'inspection', label: 'Inspection' },
              ]}
            />

            <Input
              label="Cost (Rp)"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />

            <Input
              label="Next Maintenance Date"
              type="date"
              value={formData.next_maintenance_date}
              onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the maintenance work performed..."
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Record Maintenance
          </Button>
        </div>
      </form>
    </div>
  );
}
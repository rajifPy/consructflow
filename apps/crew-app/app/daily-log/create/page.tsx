// apps/crew-app/app/daily-log/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, Input, Select, Alert } from '@constructflow/shared-ui';

export default function CreateDailyLogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [crews, setCrews] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    crew_id: '',
    weather: '',
    notes: '',
    issues: '',
  });

  const [activities, setActivities] = useState([{ description: '', hours_worked: 0 }]);
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [
      { data: crewsData },
      { data: materialsData },
      { data: equipmentData }
    ] = await Promise.all([
      supabase.from('crews').select('*, projects(name)').eq('foreman_id', user.id),
      supabase.from('materials').select('*').order('name'),
      supabase.from('equipment').select('*').eq('status', 'deployed').order('name')
    ]);

    setCrews(crewsData || []);
    setMaterials(materialsData || []);
    setEquipment(equipmentData || []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const selectedCrew = crews.find(c => c.id === formData.crew_id);
      if (!selectedCrew) throw new Error('Please select a crew');

      // Prepare JSONB data
      const activitiesData = activities
        .filter(a => a.description)
        .map(a => ({
          description: a.description,
          hours_worked: a.hours_worked
        }));

      const materialsData = selectedMaterials
        .filter(m => m.material_id)
        .map(m => ({
          material_id: m.material_id,
          quantity_used: m.quantity_used
        }));

      const equipmentData = selectedEquipment
        .filter(e => e.equipment_id)
        .map(e => ({
          equipment_id: e.equipment_id,
          hours_operated: e.hours_operated
        }));

      // Build insert payload
      const insertData = {
        log_date: formData.log_date,
        crew_id: formData.crew_id,
        project_id: selectedCrew.project_id,
        weather: formData.weather || null,
        activities: activitiesData.length > 0 ? activitiesData : null,
        materials_used: materialsData.length > 0 ? materialsData : null,
        equipment_used: equipmentData.length > 0 ? equipmentData : null,
        issues: formData.issues || null,
        notes: formData.notes || null,
        submitted_by: user.id,
      };

      const { error: insertError } = await supabase
        .from('daily_logs')
        .insert(insertData as any);

      if (insertError) throw insertError;

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = () => {
    setActivities([...activities, { description: '', hours_worked: 0 }]);
  };

  const updateActivity = (index: number, field: string, value: any) => {
    const newActivities = [...activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setActivities(newActivities);
  };

  const addMaterial = () => {
    setSelectedMaterials([...selectedMaterials, { material_id: '', quantity_used: 0 }]);
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    const newMaterials = [...selectedMaterials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setSelectedMaterials(newMaterials);
  };

  const addEquipment = () => {
    setSelectedEquipment([...selectedEquipment, { equipment_id: '', hours_operated: 0 }]);
  };

  const updateEquipment = (index: number, field: string, value: any) => {
    const newEquipment = [...selectedEquipment];
    newEquipment[index] = { ...newEquipment[index], [field]: value };
    setSelectedEquipment(newEquipment);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create Daily Log</h1>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.log_date}
              onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
              required
            />

            <Select
              label="Crew"
              value={formData.crew_id}
              onChange={(e) => setFormData({ ...formData, crew_id: e.target.value })}
              options={[
                { value: '', label: 'Select Crew' },
                ...crews.map((c) => ({ value: c.id, label: `${c.name} - ${c.projects?.name}` }))
              ]}
              required
            />

            <Input
              label="Weather"
              value={formData.weather}
              onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
              placeholder="e.g., Sunny, Rainy, Cloudy"
            />
          </div>
        </Card>

        <Card 
          title="Activities"
          action={
            <Button type="button" variant="secondary" size="sm" onClick={addActivity}>
              Add Activity
            </Button>
          }
        >
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <Input
                    label="Description"
                    value={activity.description}
                    onChange={(e) => updateActivity(index, 'description', e.target.value)}
                    placeholder="e.g., Casting lantai 2"
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    label="Hours Worked"
                    type="number"
                    step="0.5"
                    value={activity.hours_worked}
                    onChange={(e) => updateActivity(index, 'hours_worked', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card 
          title="Materials Used (Optional)"
          action={
            <Button type="button" variant="secondary" size="sm" onClick={addMaterial}>
              Add Material
            </Button>
          }
        >
          <div className="space-y-4">
            {selectedMaterials.map((material, index) => (
              <div key={index} className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <Select
                    label="Material"
                    value={material.material_id}
                    onChange={(e) => updateMaterial(index, 'material_id', e.target.value)}
                    options={[
                      { value: '', label: 'Select Material' },
                      ...materials.map((m) => ({ value: m.id, label: `${m.name} (${m.unit})` }))
                    ]}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    label="Quantity"
                    type="number"
                    step="0.01"
                    value={material.quantity_used}
                    onChange={(e) => updateMaterial(index, 'quantity_used', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card 
          title="Equipment Used (Optional)"
          action={
            <Button type="button" variant="secondary" size="sm" onClick={addEquipment}>
              Add Equipment
            </Button>
          }
        >
          <div className="space-y-4">
            {selectedEquipment.map((equip, index) => (
              <div key={index} className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <Select
                    label="Equipment"
                    value={equip.equipment_id}
                    onChange={(e) => updateEquipment(index, 'equipment_id', e.target.value)}
                    options={[
                      { value: '', label: 'Select Equipment' },
                      ...equipment.map((e) => ({ value: e.id, label: `${e.name} (${e.type})` }))
                    ]}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    label="Hours Operated"
                    type="number"
                    step="0.5"
                    value={equip.hours_operated}
                    onChange={(e) => updateEquipment(index, 'hours_operated', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Additional Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issues
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.issues}
                onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                placeholder="Any issues or problems encountered..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Daily Log
          </Button>
        </div>
      </form>
    </div>
  );
}
// ============================================
// apps/equip-app/app/deployment/page.tsx
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@constructflow/shared-db';
import { Card, Button, Select, Alert, DataTable } from '@constructflow/shared-ui';
import type { Column } from '@constructflow/shared-ui';

export default function DeploymentPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: equipData }, { data: projData }] = await Promise.all([
      supabase
        .from('equipment')
        .select(`
          *,
          projects:current_project_id(name)
        `)
        .order('name'),
      supabase
        .from('projects')
        .select('*')
        .in('status', ['planning', 'active'])
        .order('name'),
    ]);

    setEquipment(equipData || []);
    setProjects(projData || []);
  }

  const handleDeploy = async () => {
    if (!selectedEquipment || !selectedProject) {
      setMessage({ type: 'error', text: 'Please select both equipment and project' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          status: 'deployed',
          current_project_id: selectedProject,
        })
        .eq('id', selectedEquipment);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Equipment deployed successfully!' });
      setSelectedEquipment('');
      setSelectedProject('');
      loadData(); // Refresh data
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (equipmentId: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          status: 'available',
          current_project_id: null,
        })
        .eq('id', equipmentId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Equipment returned successfully!' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const availableEquipment = equipment.filter(e => e.status === 'available');
  const deployedEquipment = equipment.filter(e => e.status === 'deployed');

  const columns: Column<any>[] = [
    { header: 'Equipment', accessor: 'name', className: 'font-medium' },
    { header: 'Type', accessor: 'type' },
    { header: 'Project', accessor: (row) => row.projects?.name || '-' },
    { 
      header: 'Action', 
      accessor: (row) => (
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => handleReturn(row.id)}
          disabled={loading}
        >
          Return
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Equipment Deployment</h1>

      {message && (
        <Alert 
          type={message.type} 
          message={message.text} 
          onClose={() => setMessage(null)}
        />
      )}

      <Card title="Deploy Equipment to Project">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Select Equipment"
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            options={[
              { value: '', label: 'Choose equipment...' },
              ...availableEquipment.map((eq) => ({ 
                value: eq.id, 
                label: `${eq.name} (${eq.type})` 
              })),
            ]}
          />

          <Select
            label="Select Project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            options={[
              { value: '', label: 'Choose project...' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />

          <div className="flex items-end">
            <Button onClick={handleDeploy} loading={loading} className="w-full">
              Deploy Equipment
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Currently Deployed Equipment">
        <DataTable 
          columns={columns} 
          data={deployedEquipment}
          emptyMessage="No equipment currently deployed"
        />
      </Card>
    </div>
  );
}
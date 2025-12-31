// ============================================
// Example: Approval Modal in Procurement App
// apps/procure-app/components/ApprovalModal.tsx
// ============================================

'use client';

import { useState } from 'react';
import { Modal, Button, Alert } from '@constructflow/shared-ui';
import { supabase } from '@constructflow/shared-db';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  poId: string;
  poNumber: string;
  totalAmount: number;
  onApproved: () => void;
}

export function ApprovalModal({ 
  isOpen, 
  onClose, 
  poId, 
  poNumber, 
  totalAmount,
  onApproved 
}: ApprovalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call API route
      const response = await fetch(`/api/po/${poId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Approval failed');
      }

      onApproved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Purchase Order"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleApprove} loading={loading}>
            Approve PO
          </Button>
        </>
      }
    >
      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">PO Number</p>
          <p className="text-lg font-medium text-gray-900">{poNumber}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            Rp {totalAmount.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-yellow-700">
            By approving this PO, you confirm that the budget has been verified and the items are necessary for the project.
          </p>
        </div>
      </div>
    </Modal>
  );
}
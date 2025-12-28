'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Verdict } from '@/lib/types/case';

interface VerdictControlsProps {
  currentVerdict: Verdict;
  onVerdictChange: (verdict: Verdict, reason?: string) => Promise<void>;
}

export function VerdictControls({ currentVerdict, onVerdictChange }: VerdictControlsProps) {
  const [selectedVerdict, setSelectedVerdict] = useState<Verdict>(currentVerdict);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (selectedVerdict === currentVerdict) {
      return;
    }
    setLoading(true);
    try {
      await onVerdictChange(selectedVerdict, reason);
      alert('Verdict updated successfully');
    } catch (error) {
      alert('Failed to update verdict');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Change Verdict</h3>
      <div className="space-y-2">
        <select
          value={selectedVerdict}
          onChange={(e) => setSelectedVerdict(e.target.value as Verdict)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value={Verdict.CLEAN}>CLEAN</option>
          <option value={Verdict.PENDING}>PENDING</option>
          <option value={Verdict.VERIFIED}>VERIFIED</option>
          <option value={Verdict.DISPUTED}>DISPUTED</option>
          <option value={Verdict.CLEARED}>CLEARED</option>
        </select>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for change (optional)"
          className="w-full p-2 border border-gray-300 rounded"
          rows={3}
        />
        <Button
          onClick={handleSubmit}
          disabled={loading || selectedVerdict === currentVerdict}
          variant="primary"
        >
          {loading ? 'Updating...' : 'Update Verdict'}
        </Button>
      </div>
    </div>
  );
}


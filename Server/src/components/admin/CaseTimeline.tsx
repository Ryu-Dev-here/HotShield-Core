import React from 'react';
import { StateTransition } from '@/lib/types/case';

interface CaseTimelineProps {
  timeline: StateTransition[];
}

export function CaseTimeline({ timeline }: CaseTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Timeline</h3>
      <div className="space-y-2">
        {timeline.map((transition, i) => (
          <div key={i} className="flex items-start space-x-4 p-3 bg-gray-50 rounded">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">{transition.from}</span>
                <span>→</span>
                <span className="text-sm font-medium text-blue-600">{transition.to}</span>
              </div>
              {transition.reason && (
                <p className="text-sm text-gray-500 mt-1">{transition.reason}</p>
              )}
              {transition.actor && (
                <p className="text-xs text-gray-400 mt-1">by {transition.actor}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(transition.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


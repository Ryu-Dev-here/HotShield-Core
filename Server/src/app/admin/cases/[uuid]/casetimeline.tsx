import React from 'react';
import { StateTransition } from '@/lib/types/case';

interface CaseTimelineProps {
  timeline: StateTransition[];
}

export function CaseTimeline({ timeline }: CaseTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-midnight-100">Timeline</h3>
      <div className="space-y-2">
        {timeline.map((transition, i) => (
          <div key={i} className="flex items-start space-x-4 p-3 bg-midnight-800 rounded border border-midnight-700">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-midnight-300">{transition.from}</span>
                <span className="text-midnight-400">→</span>
                <span className="text-sm font-medium text-midnight-100">{transition.to}</span>
              </div>
              {transition.reason && (
                <p className="text-sm text-midnight-300 mt-1">{transition.reason}</p>
              )}
              {transition.actor && (
                <p className="text-xs text-midnight-400 mt-1">by {transition.actor}</p>
              )}
              <p className="text-xs text-midnight-400 mt-1">
                {new Date(transition.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


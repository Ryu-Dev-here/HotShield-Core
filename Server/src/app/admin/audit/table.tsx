import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-midnight-900 border border-midnight-800">
        <thead className="bg-midnight-800">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-6 py-3 text-left text-xs font-medium text-midnight-300 uppercase tracking-wider border-b border-midnight-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-midnight-800">
          {children}
        </tbody>
      </table>
    </div>
  );
}


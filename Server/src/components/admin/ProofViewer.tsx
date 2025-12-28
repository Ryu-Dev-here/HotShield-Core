import React from 'react';

interface ProofViewerProps {
  proofLinks: string[];
  proofHashes: string[];
}

export function ProofViewer({ proofLinks, proofHashes }: ProofViewerProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Proof</h3>
      <div className="space-y-2">
        {proofLinks.map((link, i) => (
          <div key={i} className="p-3 bg-gray-50 rounded">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {link}
            </a>
            {proofHashes[i] && (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Hash: {proofHashes[i].substring(0, 16)}...
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


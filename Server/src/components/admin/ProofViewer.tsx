import React from 'react';

interface ProofViewerProps {
  proofLinks: string[];
  proofHashes: string[];
}

export function ProofViewer({ proofLinks, proofHashes }: ProofViewerProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-midnight-100">Proof</h3>
      <div className="space-y-2">
        {proofLinks.map((link, i) => (
          <div key={i} className="p-3 bg-midnight-800 rounded border border-midnight-700">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-midnight-300 hover:text-midnight-100 hover:underline break-all"
            >
              {link}
            </a>
            {proofHashes[i] && (
              <p className="text-xs text-midnight-400 mt-1 font-mono">
                Hash: {proofHashes[i].substring(0, 16)}...
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


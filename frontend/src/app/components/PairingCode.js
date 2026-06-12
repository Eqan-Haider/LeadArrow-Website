'use client';
import { useState } from 'react';

export default function PairingCode({ repId }) {
  const [pairingCode, setPairingCode] = useState(null);

  const generateCode = () => {
    // In real app, backend would generate and associate with repId
    const code = 'LA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setPairingCode(code);
  };

  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <p className="text-sm font-medium text-blue-800 mb-2">Chrome Extension Pairing</p>
      {pairingCode ? (
        <div className="flex items-center justify-between">
          <code className="text-lg font-bold text-blue-900">{pairingCode}</code>
          <button onClick={() => navigator.clipboard.writeText(pairingCode)} className="text-xs bg-white border border-blue-300 rounded px-2 py-1 text-blue-700">
            Copy
          </button>
        </div>
      ) : (
        <button onClick={generateCode} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition">
          Generate Pairing Code
        </button>
      )}
      {pairingCode && (
        <p className="text-xs text-blue-600 mt-2">
          Enter this code in the LeadArrow Chrome extension to link this rep.
        </p>
      )}
    </div>
  );
}
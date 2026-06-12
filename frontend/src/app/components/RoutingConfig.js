'use client';
import { useState } from 'react';

export default function RoutingConfig({ reps = [] }) {
  const [method, setMethod] = useState('round-robin');
  const [weights, setWeights] = useState({});

  const handleWeightChange = (repId, value) => {
    const newWeights = { ...weights, [repId]: Math.min(100, Math.max(0, Number(value))) };
    setWeights(newWeights);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Routing Rules</h3>
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="routing" checked={method === 'round-robin'} onChange={() => setMethod('round-robin')} />
          <span className="text-sm font-medium text-gray-700">Round Robin</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="routing" checked={method === 'percentage'} onChange={() => setMethod('percentage')} />
          <span className="text-sm font-medium text-gray-700">Percentage Based</span>
        </label>
      </div>

      {method === 'percentage' && (
        <div className="space-y-3">
          {reps.map((rep) => (
            <div key={rep.id} className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-700">{rep.name}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={weights[rep.id] || 0}
                onChange={(e) => handleWeightChange(rep.id, e.target.value)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-12 text-sm font-medium text-gray-900">{weights[rep.id] || 0}%</span>
            </div>
          ))}
          <p className={`text-xs ${totalWeight !== 100 ? 'text-red-500' : 'text-green-600'}`}>
            Total: {totalWeight}% {totalWeight !== 100 && '(must equal 100%)'}
          </p>
        </div>
      )}
    </div>
  );
}
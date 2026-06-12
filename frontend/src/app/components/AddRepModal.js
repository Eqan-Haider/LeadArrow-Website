'use client';
import { useState } from 'react';

export default function AddRepModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Team Lead');
  const [timezone, setTimezone] = useState('America/New_York');
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '17:00' });
  const [daysOff, setDaysOff] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // AuthContext ya localStorage se instant valid ID uthayega
    const savedCompanyId = localStorage.getItem('companyId') || 'default_company';

    const payload = {
      fullName: name || "None",
      email: email || "None",
      phoneNumber: phone || "None",
      role: role || "Team Lead",
      timezone: timezone,
      workingHours: workingHours,
      daysOff: daysOff,
      companyId: savedCompanyId 
    };

    try {
      const response = await fetch('http://localhost:5001/api/reps/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Representative Added Successfully!');
        if (onSave) onSave(data);
        // Fields clear out
        setName('');
        setPhone('');
        setEmail('');
        onClose();
      } else {
        alert(data.message || 'Error adding representative');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Network error - Please check if backend server is active.');
    }
  };

  const toggleDay = (day) => {
    setDaysOff(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 text-gray-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Add New Rep</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white" />
          
          <input required type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white" />

          <input required placeholder="Phone (+1 555-0100)" value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white" />
          
          <select value={role} onChange={e => setRole(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="Team Lead">Team Lead</option>
            <option value="Sales Representative">Sales Representative</option>
            <option value="Manager">Manager</option>
          </select>

          <select value={timezone} onChange={e => setTimezone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="America/New_York">Eastern Time (EST)</option>
            <option value="America/Chicago">Central Time (CST)</option>
            <option value="America/Denver">Mountain Time (MST)</option>
            <option value="America/Los_Angeles">Pacific Time (PST)</option>
          </select>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Start Time</label>
              <input type="time" value={workingHours.start} onChange={e => setWorkingHours(prev => ({...prev, start: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500">End Time</label>
              <input type="time" value={workingHours.end} onChange={e => setWorkingHours(prev => ({...prev, end: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Days Off</label>
            <div className="flex flex-wrap gap-2">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <button key={d} type="button" onClick={() => toggleDay(d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${daysOff.includes(d) ? 'bg-red-100 border-red-300 text-red-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition">
            Save Rep
          </button>
        </form>
      </div>
    </div>
  );
}
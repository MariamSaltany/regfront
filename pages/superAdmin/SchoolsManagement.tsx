
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { School } from '../../types';

const AdminSchools: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean, school: Partial<School> | null }>({ open: false, school: null });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/admin/schools');
      setSchools(res.data.data || res.data);
    } catch (e) {
      setSchools([
        { id: 1, name: 'Sunrise Academy', area: 'Downtown', category: 'General', level: 'K-12', slug: 'sunrise' } as any
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save logic
    alert('School data and admin assignment updated (Mock success)');
    setModal({ open: false, school: null });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary">Manage Schools</h1>
        <button 
          onClick={() => setModal({ open: true, school: {} })}
          className="bg-primary text-secondary px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 shadow-sm transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add New School
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-xs font-bold text-textLight uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">School Name</th>
              <th className="px-6 py-4">Area / Level</th>
              <th className="px-6 py-4">Current Admin</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            {schools.map(s => (
              <tr key={s.id} className="hover:bg-neutral-50 transition">
                <td className="px-6 py-4 font-bold text-secondary">{s.name}</td>
                <td className="px-6 py-4 text-textLight">{s.area} • {s.level}</td>
                <td className="px-6 py-4">
                  <span className="bg-success/10 text-success px-2 py-1 rounded text-[10px] font-bold">Admin Assigned</span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                   <button 
                    onClick={() => setModal({ open: true, school: s })}
                    className="text-secondary hover:text-secondary/80 font-bold"
                   >
                     Edit / Assign
                   </button>
                   <button className="text-warning hover:text-warning/80 font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
           <form onSubmit={handleSave} className="bg-white w-full max-w-lg p-8 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-secondary mb-6">{modal.school?.id ? 'Edit School' : 'Create School'}</h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-textLight uppercase mb-1">School Name</label>
                  <input type="text" defaultValue={modal.school?.name} className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-textLight uppercase mb-1">Area</label>
                    <input type="text" defaultValue={modal.school?.area} className="w-full border p-2 rounded outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-textLight uppercase mb-1">Level</label>
                    <input type="text" defaultValue={modal.school?.level} className="w-full border p-2 rounded outline-none" required />
                  </div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg border">
                  <label className="block text-xs font-bold text-secondary uppercase mb-2">Assign School Admin</label>
                  <select className="w-full border p-2 rounded bg-white outline-none">
                    <option>Select existing school admin...</option>
                    <option value="1">Admin Sarah (sarah@test.com)</option>
                    <option value="2">Admin Mark (mark@test.com)</option>
                    <option value="new">+ Create New Admin Account</option>
                  </select>
                  <p className="text-[10px] text-textLight mt-2 italic">* The assigned user will have exclusive access to manage this school's profile and verifications.</p>
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                 <button type="button" onClick={() => setModal({ open: false, school: null })} className="px-6 py-2 text-textLight hover:bg-neutral-100 rounded-lg">Cancel</button>
                 <button type="submit" className="px-8 py-2 bg-primary text-secondary font-bold rounded-lg hover:bg-yellow-500 shadow transition">Save School Data</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default AdminSchools;

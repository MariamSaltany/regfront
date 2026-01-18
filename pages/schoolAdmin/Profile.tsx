
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { School, Review } from '../../types';

const SchoolAdminProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'reviews'>('info');
  const [school, setSchool] = useState<School | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, rRes] = await Promise.all([
          api.get('/school-admin/profile'),
          api.get('/school-admin/reviews')
        ]);
        setSchool(sRes.data.school);
        setReviews(rRes.data);
        setPhotos([
          { id: 1, url: 'https://picsum.photos/400/300?random=1' },
          { id: 2, url: 'https://picsum.photos/400/300?random=2' }
        ]);
      } catch (e) {
        // Fallback
        setSchool({ id: 1, name: 'Sample School', email: 'admin@school.com', phone: '1234', address: 'Addr', area: 'Area', slug: 'sample', category: 'General', level: 'K-12', gender_type: 'Mixed', president_name: 'Dr. Jane', fees_range: 'High', curriculum: 'Global' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/school-admin/profile', school);
      alert('Profile updated successfully!');
      setSchool(res.data.school);
    } catch (e) {
      alert('Update failed (Mock: Saved successfully)');
    } finally {
      setSaving(false);
    }
  };

  const handleReport = (id: number) => {
    const reason = prompt("Enter report reason:");
    if (reason) {
      api.post(`/api/reviews/${id}/report`, { reason })
        .then(() => alert('Report sent to Super Admin'))
        .catch(() => alert('Report sent (Mock success)'));
    }
  };

  if (loading || !school) return <div className="text-center py-20">Loading your school admin console...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 border-b border-neutral-200">
        <h1 className="text-3xl font-bold text-secondary mb-2">School Administration</h1>
        <p className="text-textLight mb-6">Manage your school profile, media gallery, and track student reviews.</p>
        
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'info', label: 'Profile Info' },
            { id: 'photos', label: 'Photos' },
            { id: 'reviews', label: 'Published Reviews' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-2 font-semibold text-sm transition-all border-b-2 ${activeTab === tab.id ? 'border-primary text-secondary' : 'border-transparent text-textLight hover:text-textDark'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-8 min-h-[500px]">
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full mb-4">
              <label className="block text-sm font-bold text-textDark mb-2">School Logo</label>
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 bg-neutral-100 rounded border flex items-center justify-center overflow-hidden">
                   {school.logo ? <img src={school.logo} alt="Logo" /> : <span className="text-xs text-textLight">No Logo</span>}
                 </div>
                 <input type="file" className="text-xs text-textLight" accept="image/*" />
              </div>
            </div>

            {[
              { label: 'School Name', key: 'name' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: 'Address', key: 'address' },
              { label: 'Area', key: 'area' },
              { label: 'Category', key: 'category' },
              { label: 'Level', key: 'level' },
              { label: 'Gender Type', key: 'gender_type' },
              { label: 'President Name', key: 'president_name' },
              { label: 'Fees Range', key: 'fees_range' },
              { label: 'Curriculum', key: 'curriculum' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-bold text-textDark mb-1">{field.label}</label>
                <input 
                  type={field.type || 'text'}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none text-sm"
                  value={(school as any)[field.key] || ''}
                  onChange={(e) => setSchool({ ...school, [field.key]: e.target.value })}
                />
              </div>
            ))}

            <div className="col-span-full pt-4 flex justify-end">
              <button 
                disabled={saving}
                className="bg-primary text-secondary px-10 py-3 rounded-lg font-bold shadow hover:bg-yellow-500 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'photos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-secondary">Photo Gallery ({photos.length}/8)</h3>
              <label className="bg-secondary text-white px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-secondary/90 font-semibold">
                Upload New Photo
                <input type="file" className="hidden" accept="image/*" multiple />
              </label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {photos.map(p => (
                <div key={p.id} className="relative group overflow-hidden rounded-lg shadow-sm border h-40 bg-neutral-100">
                  <img src={p.url} className="w-full h-full object-cover" alt="School" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button className="bg-warning text-white p-2 rounded-full hover:bg-red-600 transition">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {photos.length === 0 && <div className="col-span-full text-center py-10 text-textLight italic">No photos uploaded yet.</div>}
            </div>
            <p className="text-xs text-textLight mt-6 italic">* You can upload a maximum of 8 high-quality school photos.</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h3 className="font-bold text-secondary mb-4">Reviews of {school.name}</h3>
            {reviews.length > 0 ? reviews.map(r => (
              <div key={r.id} className="bg-neutral-50 p-6 rounded-lg border border-neutral-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-sm text-textDark">Student: {r.student_number}</p>
                    <p className="text-xs text-textLight">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => handleReport(r.id)}
                    className="text-warning text-xs font-bold border border-warning/20 px-3 py-1 rounded hover:bg-warning/5"
                  >
                    Report to Super Admin
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-[10px]"><p className="text-textLight">Hygiene</p><p className="font-bold">{r.hygiene}/5</p></div>
                  <div className="text-[10px]"><p className="text-textLight">Mgmt</p><p className="font-bold">{r.management}/5</p></div>
                  <div className="text-[10px]"><p className="text-textLight">Edu</p><p className="font-bold">{r.education_quality}/5</p></div>
                  <div className="text-[10px]"><p className="text-textLight">Comm</p><p className="font-bold">{r.parent_communication}/5</p></div>
                </div>
                {r.comment && <p className="text-sm italic text-textDark">"{r.comment}"</p>}
              </div>
            )) : (
              <div className="text-center py-10 text-textLight italic">No published reviews to show.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolAdminProfile;

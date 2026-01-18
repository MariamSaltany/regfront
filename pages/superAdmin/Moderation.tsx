
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Review } from '../../types';

const AdminModeration: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/admin/moderation');
        setReviews(res.data);
      } catch (e) {
        setReviews([
          { 
            id: 200, 
            school: { name: 'Al Noor Intl' } as any, 
            parent_name: 'John Smith', 
            parent_email: 'john@smith.com', 
            student_number: 'NO-1234', 
            hygiene: 1, 
            management: 1, 
            education_quality: 1, 
            parent_communication: 1, 
            comment: 'Very bad school!', 
            created_at: '2023-11-25' 
          } as any
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/admin/reviews/${id}/approve`);
      setReviews(reviews.filter(r => r.id !== id));
      alert('Review approved and sent to School Admin');
    } catch (e) {
      alert('Approved (Mock success)');
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const handleReject = async () => {
    if (!reason) return;
    try {
      await api.post(`/admin/reviews/${rejectingId}/reject`, { reason });
      setReviews(reviews.filter(r => r.id !== rejectingId));
      setRejectingId(null);
      setReason('');
      alert('Review rejected');
    } catch (e) {
      alert('Rejected (Mock success)');
      setReviews(reviews.filter(r => r.id !== rejectingId));
      setRejectingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-secondary mb-8">Review Moderation Queue</h1>
      
      {loading ? (
        <div className="text-center py-20">Loading moderation queue...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
               <div className="bg-neutral-50 px-6 py-4 border-b flex justify-between items-center">
                  <div>
                    <span className="text-xs text-textLight font-bold uppercase tracking-wider">Reviewer</span>
                    <p className="text-sm font-bold text-secondary">{r.parent_name} ({r.parent_email})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-textLight font-bold uppercase tracking-wider">Target School</span>
                    <p className="text-sm font-bold text-textDark">{r.school?.name}</p>
                  </div>
               </div>
               
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                       <div className="bg-secondary/10 p-2 rounded text-secondary font-bold text-sm">ID: {r.student_number}</div>
                       <div className="text-xs text-textLight">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { label: 'Hygiene', val: r.hygiene },
                         { label: 'Mgmt', val: r.management },
                         { label: 'Quality', val: r.education_quality },
                         { label: 'Comm', val: r.parent_communication },
                       ].map(s => (
                         <div key={s.label} className="bg-neutral-50 p-2 rounded border border-neutral-100">
                           <p className="text-[10px] text-textLight uppercase font-bold">{s.label}</p>
                           <p className="font-bold text-textDark">{s.val}/5</p>
                         </div>
                       ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-textLight uppercase font-bold mb-1">Comment</p>
                      <p className="text-sm text-textDark italic">"{r.comment || 'No comment provided'}"</p>
                    </div>
                    
                    <div className="flex gap-3 mt-6 justify-end">
                      <button 
                        onClick={() => setRejectingId(r.id)}
                        className="bg-warning text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(r.id)}
                        className="bg-success text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 shadow transition"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 rounded-xl border border-dashed text-textLight">No reviews currently pending moderation.</div>
      )}

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold text-secondary mb-4">Rejection Reason</h3>
            <textarea 
              className="w-full border p-3 rounded-md min-h-[100px] outline-none focus:ring-2 focus:ring-warning mb-4"
              placeholder="Why are you rejecting this review?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectingId(null)} className="px-4 py-2 text-textLight hover:bg-neutral-100 rounded">Cancel</button>
              <button onClick={handleReject} className="px-6 py-2 bg-warning text-white rounded font-bold hover:bg-red-600">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModeration;

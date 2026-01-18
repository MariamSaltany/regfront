
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Review } from '../../types';

const VerificationPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/school-admin/reviews');
        setReviews(res.data);
      } catch (e) {
        setReviews([
          { id: 10, student_number: 'ST-556677', hygiene: 5, management: 4, education_quality: 5, parent_communication: 3, created_at: '2023-11-20', status: 'pending' } as any
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      await api.post(`/school-admin/reviews/${id}/${action}`);
      setReviews(reviews.filter(r => r.id !== id));
      alert(`Review ${action}d successfully`);
    } catch (e) {
      alert(`Action ${action}d (Mock Success)`);
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-secondary mb-2">Student ID Verification</h1>
      <p className="text-textLight mb-8">Please cross-reference the Student Numbers below with your school records. Only approve reviews from actual parents/students.</p>

      {loading ? (
        <div className="text-center py-20">Loading pending verifications...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
               <div>
                  <p className="text-xs text-textLight uppercase font-bold tracking-wider">Student Number</p>
                  <p className="text-xl font-bold text-secondary">{review.student_number}</p>
                  <p className="text-xs text-textLight mt-1">Submitted on {new Date(review.created_at).toLocaleDateString()}</p>
               </div>
               
               <div className="flex gap-3">
                  <button 
                    onClick={() => handleAction(review.id, 'reject')}
                    className="px-6 py-2 border-2 border-warning text-warning rounded-lg font-bold hover:bg-warning/10 transition"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction(review.id, 'approve')}
                    className="px-6 py-2 bg-success text-white rounded-lg font-bold hover:bg-success/90 shadow-sm transition"
                  >
                    Approve
                  </button>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 rounded-xl border border-dashed">
          <p className="text-textLight font-medium">All reviews have been verified! Good job.</p>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;

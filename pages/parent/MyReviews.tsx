
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Review } from '../../types';

const MyReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/my-reviews');
        setReviews(res.data.data || res.data);
      } catch (e) {
        // Mock
        setReviews([
          // Added parent_id to satisfy Review interface
          { id: 1, school_id: 1, parent_id: 1, student_number: 'ST-123', hygiene: 5, management: 4, education_quality: 3, parent_communication: 4, comment: 'Good school', status: 'approved', created_at: '2023-01-01', school: { name: 'Sunrise Academy', slug: 'sunrise-academy' } as any },
          // Added parent_id to satisfy Review interface
          { id: 2, school_id: 1, parent_id: 1, student_number: 'ST-123', hygiene: 2, management: 2, education_quality: 1, parent_communication: 1, comment: 'Bad experience', status: 'pending', created_at: '2023-01-05', school: { name: 'Sunrise Academy', slug: 'sunrise-academy' } as any }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="bg-success/10 text-success px-2 py-1 rounded text-xs font-bold uppercase">Approved</span>;
      case 'pending': return <span className="bg-primary/20 text-textDark px-2 py-1 rounded text-xs font-bold uppercase">Verification Pending</span>;
      case 'reported': return <span className="bg-warning/10 text-warning px-2 py-1 rounded text-xs font-bold uppercase">Under Investigation</span>;
      case 'rejected': return <span className="bg-warning text-white px-2 py-1 rounded text-xs font-bold uppercase">Rejected</span>;
      default: return <span className="bg-neutral-200 text-textLight px-2 py-1 rounded text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-secondary mb-8">My Submitted Reviews</h1>
      
      {loading ? (
        <div className="text-center py-20">Loading your reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link to={`/schools/${review.school?.slug}`} className="text-xl font-bold text-secondary hover:underline">
                    {review.school?.name}
                  </Link>
                  <p className="text-xs text-textLight mt-1">Submitted on {new Date(review.created_at).toLocaleDateString()} • ID: {review.student_number}</p>
                </div>
                {getStatusBadge(review.status)}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 border-y py-4 border-neutral-100">
                <div>
                  <p className="text-[10px] text-textLight uppercase font-bold mb-1">Hygiene</p>
                  <p className="font-bold text-textDark">{review.hygiene}/5</p>
                </div>
                <div>
                  <p className="text-[10px] text-textLight uppercase font-bold mb-1">Management</p>
                  <p className="font-bold text-textDark">{review.management}/5</p>
                </div>
                <div>
                  <p className="text-[10px] text-textLight uppercase font-bold mb-1">Quality</p>
                  <p className="font-bold text-textDark">{review.education_quality}/5</p>
                </div>
                <div>
                  <p className="text-[10px] text-textLight uppercase font-bold mb-1">Comm.</p>
                  <p className="font-bold text-textDark">{review.parent_communication}/5</p>
                </div>
              </div>

              {review.comment && (
                <div className="mb-4">
                   <p className="text-xs font-bold text-textLight uppercase mb-1">Your Comment</p>
                   <p className="text-sm text-textDark italic">"{review.comment}"</p>
                </div>
              )}

              {review.status === 'reported' && (
                <div className="bg-warning/5 p-3 rounded border border-warning/20 mt-4">
                  <p className="text-xs text-warning font-bold uppercase flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    Review Reported
                  </p>
                  <p className="text-xs text-textDark mt-1">This review is currently under investigation by our moderation team.</p>
                </div>
              )}

              {review.status === 'rejected' && review.rejection_reason && (
                <div className="bg-warning/5 p-3 rounded border border-warning/20 mt-4">
                   <p className="text-xs text-warning font-bold uppercase">Rejection Reason</p>
                   <p className="text-xs text-textDark mt-1">{review.rejection_reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-neutral-300">
           <p className="text-textLight mb-4">You haven't submitted any reviews yet.</p>
           <Link to="/schools" className="bg-secondary text-white px-6 py-2 rounded-lg font-bold hover:bg-secondary/90 transition">Find a School to Rate</Link>
        </div>
      )}
    </div>
  );
};

export default MyReviews;

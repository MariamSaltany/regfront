
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { School, Review, User, UserRole } from '../../types';

const SchoolProfile: React.FC<{ user: User | null }> = ({ user }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState<{ open: boolean, reviewId: number | null, reason: string }>({ open: false, reviewId: null, reason: '' });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const schoolRes = await api.get(`/schools/${slug}`);
        setSchool(schoolRes.data.school);
        setReviews(schoolRes.data.approvedReviews || []);
      } catch (e) {
        // Fallback mock
        setSchool({ id: 1, slug: 'sunrise-academy', name: 'Sunrise Academy', area: 'Downtown', category: 'International', level: 'K-12', gender_type: 'Mixed', email: 'info@sunrise.com', phone: '+1 234 567 890', address: '123 Educational Blvd, Downtown City', president_name: 'Dr. Sarah Wilson', fees_range: '$8,000 - $15,000', curriculum: 'British (IGCSE)' });
        setReviews([
          { id: 101, school_id: 1, parent_id: 5, parent_name: 'Ahmed K.', student_number: 'ST-9988', hygiene: 5, management: 4, education_quality: 5, parent_communication: 3, comment: 'Excellent teachers but communication could be better.', status: 'approved', created_at: '2023-10-15' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug]);

  const handleReport = async () => {
    if (!reportModal.reason.trim()) return;
    try {
      await api.post(`/reviews/${reportModal.reviewId}/report`, { report_reason: reportModal.reason });
      alert('Report submitted successfully. Our team will review it.');
      setReportModal({ open: false, reviewId: null, reason: '' });
    } catch (e) {
      alert('Report submitted (Mock: Backend integration pending)');
      setReportModal({ open: false, reviewId: null, reason: '' });
    }
  };

  if (loading || !school) return <div className="text-center py-20">Loading school details...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="w-48 h-48 bg-white shadow-md rounded-lg p-6 flex items-center justify-center mb-6">
            {school.logo ? <img src={school.logo} alt={school.name} /> : <div className="text-secondary text-5xl font-bold">{school.name[0]}</div>}
          </div>
          <div className="w-full bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-secondary mb-4 border-b pb-2">Quick Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-textLight font-medium">Category</span>
                <span className="text-textDark">{school.category}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-textLight font-medium">President</span>
                <span className="text-textDark">{school.president_name}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-textLight font-medium">Fees Range</span>
                <span className="text-textDark">{school.fees_range}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-textLight font-medium">Area</span>
                <span className="text-textDark">{school.area}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-textLight font-medium">Level</span>
                <span className="text-textDark">{school.level}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-textLight font-medium">Gender</span>
                <span className="text-textDark">{school.gender_type}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-textLight font-medium">Curriculum</span>
                <span className="text-textDark">{school.curriculum}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex-grow">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-secondary">{school.name}</h1>
            {user?.role === UserRole.PARENT && (
              <Link 
                to={`/schools/${slug}/reviews/create`}
                className="bg-primary text-secondary px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 shadow-sm"
              >
                Rate School
              </Link>
            )}
          </div>
          <p className="text-textLight mb-6 leading-relaxed flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {school.address}, {school.area}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white p-4 rounded shadow-sm border-l-4 border-secondary">
              <p className="text-xs text-textLight uppercase font-semibold">Email</p>
              <p className="text-sm font-medium">{school.email}</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border-l-4 border-secondary">
              <p className="text-xs text-textLight uppercase font-semibold">Phone</p>
              <p className="text-sm font-medium">{school.phone}</p>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-textDark">School Photos</h2>
              <Link to={`/schools/${slug}/photos`} className="text-secondary font-semibold text-sm hover:underline">View all photos &rarr;</Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(id => (
                <img 
                  key={id} 
                  src={`https://picsum.photos/seed/${school.slug}${id}/400/300`} 
                  className="w-full h-32 object-cover rounded-lg shadow-sm hover:scale-[1.02] transition"
                  alt="School"
                />
              ))}
            </div>
          </div>

          <h2 className="text-xl font-bold text-textDark mb-6">Verified Parent Reviews</h2>
          <div className="space-y-6">
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-textDark">{review.parent_name || 'Verified Parent'}</p>
                    <p className="text-xs text-textLight">Student ID: {review.student_number} • {new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => setReportModal({ open: true, reviewId: review.id, reason: '' })}
                    className="text-warning text-xs font-semibold px-3 py-1 rounded border border-warning/20 hover:bg-warning/5"
                  >
                    Report
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: 'Hygiene', val: review.hygiene },
                    { label: 'Management', val: review.management },
                    { label: 'Quality', val: review.education_quality },
                    { label: 'Communication', val: review.parent_communication },
                  ].map(stat => (
                    <div key={stat.label}>
                      <p className="text-[10px] text-textLight uppercase font-bold mb-1">{stat.label}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg key={star} className={`w-3 h-3 ${star <= stat.val ? 'text-primary' : 'text-neutral-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {review.comment && <p className="text-sm text-textDark italic bg-neutralBg p-3 rounded">"{review.comment}"</p>}
              </div>
            )) : (
              <div className="text-center py-10 bg-neutral-50 rounded-lg text-textLight text-sm italic">No verified reviews yet for this school.</div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold text-secondary mb-4">Report Review</h3>
            <p className="text-sm text-textLight mb-4">Please provide a reason for reporting this review. This helps us maintain a trustworthy community.</p>
            <textarea 
              className="w-full border p-3 rounded-md min-h-[100px] outline-none focus:ring-2 focus:ring-warning mb-4"
              placeholder="E.g. Inappropriate language, fake student number, etc."
              value={reportModal.reason}
              onChange={(e) => setReportModal({ ...reportModal, reason: e.target.value })}
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setReportModal({ open: false, reviewId: null, reason: '' })}
                className="px-4 py-2 text-textLight font-medium hover:bg-neutral-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleReport}
                className="px-6 py-2 bg-warning text-white rounded font-bold hover:bg-red-600 transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolProfile;

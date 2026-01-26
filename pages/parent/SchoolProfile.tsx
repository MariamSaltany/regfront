import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { School, PublicReview, User, UserRole } from '../../services/types';

const SchoolProfile: React.FC<{ user: User | null }> = ({ user }) => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [school, setSchool] = useState<School | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  const [reportModal, setReportModal] = useState<{
    open: boolean;
    reviewId: number | null;
    reason: string;
  }>({ open: false, reviewId: null, reason: '' });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const schoolRes = await api.get(`/schools/${slug}`);
        setSchool(schoolRes.data.school);
        setReviews(schoolRes.data.approvedReviews || []);
      } catch (e) {
        // Fallback mock
        setSchool({
          id: 1,
          slug: 'sunrise-academy',
          name: 'Sunrise Academy',
          area: 'Downtown',
          category: 'International',
          level: 'K-12',
          gender_type: 'Mixed',
          email: 'info@sunrise.com',
          phone: '+1 234 567 890',
          address: '123 Educational Blvd, Downtown City',
          president_name: 'Dr. Sarah Wilson',
          fees_range: '$8,000 - $15,000',
          curriculum: 'British (IGCSE)',
        });

        setReviews([
          {
            id: 101,
            school_id: 1,
            parent_name: 'Ahmed K.',
            hygiene: 5,
            management: 4,
            education_quality: 5,
            parent_communication: 3,
            overall_rating: 4.25,
            comment: 'Excellent teachers but communication could be better.',
            status: 'approved',
            created_at: '2023-10-15',
          } as PublicReview,
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
      await api.post(`/reviews/${reportModal.reviewId}/report`, {
        report_reason: reportModal.reason,
      });
      alert('Report submitted successfully.');
    } catch {
      alert('Report submitted (mock).');
    } finally {
      setReportModal({ open: false, reviewId: null, reason: '' });
    }
  };

  if (loading || !school) {
    return <div className="text-center py-20">Loading school details...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        {/* LEFT */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="w-48 h-48 bg-white shadow-md rounded-lg p-6 flex items-center justify-center mb-6">
            {school.logo ? (
              <img src={school.logo} alt={school.name} />
            ) : (
              <div className="text-secondary text-5xl font-bold">
                {school.name[0]}
              </div>
            )}
          </div>

          <div className="w-full bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-secondary mb-4 border-b pb-2">
              Quick Info
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                ['Category', school.details?.category],
                ['President', school.details?.president_name],
                ['Fees Range', school.details?.fees_range],
                ['Area', school.details?.area],
                ['Level', school.details?.level],
                ['Gender', school.details?.gender_type],
                ['Curriculum', school.details?.curriculum],
              ].map(([label, value]) => (
                <li key={label} className="flex justify-between">
                  <span className="text-textLight font-medium">{label}</span>
                  <span className="text-textDark">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-secondary">{school.name}</h1>

            {user?.role === UserRole.PARENT && (
              <Link
                to={`/schools/${slug}/reviews/create`}
                className="bg-primary text-secondary px-6 py-2 rounded-lg font-bold hover:bg-yellow-500"
              >
                Rate School
              </Link>
            )}
          </div>

          <p className="text-textLight mb-6">{school.details?.address}</p>

          {/* REVIEWS */}
          <h2 className="text-xl font-bold text-textDark mb-6">
            Verified Parent Reviews
          </h2>

          <div className="space-y-6">
            {reviews.length ? (
              reviews.map((review) => {
                const overall =
                  review.overall_rating ??
                  (
                    ((review.hygiene ?? 0) +
                      (review.management ?? 0) +
                      (review.education_quality ?? 0) +
                      (review.parent_communication ?? 0)) /
                    4
                  ).toFixed(1);

                return (
                  <div
                    key={review.id}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                  >
                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="font-bold text-textDark">
                          {review.user?.name || 'Verified Parent'}
                        </p>
                        <p className="text-xs text-textLight">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setReportModal({
                            open: true,
                            reviewId: review.id,
                            reason: '',
                          })
                        }
                        className="text-warning text-xs font-semibold"
                      >
                        Report
                      </button>
                    </div>

                    <p className="font-bold text-textDark mb-3">
                      Overall Rating: {overall}/5
                    </p>

                    {review.comment && (
                      <p className="text-sm italic bg-neutralBg p-3 rounded">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 italic text-textLight">
                No verified reviews yet.
              </div>
            )}
          </div>

          {/* PHOTO GALLERY */}
          {school.gallery && school.gallery.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-textDark mb-6">
                School Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {school.gallery.map((photo: any) => (
                  <div key={photo.id} className="aspect-square bg-neutral-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group">
                    <img
                      src={photo.url}
                      alt="School photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REPORT MODAL */}
      {reportModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg">
            <h3 className="font-bold mb-3">Report Review</h3>

            <textarea
              className="w-full border p-3 rounded mb-4"
              placeholder="Reason for report"
              value={reportModal.reason}
              onChange={(e) =>
                setReportModal({
                  ...reportModal,
                  reason: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setReportModal({
                    open: false,
                    reviewId: null,
                    reason: '',
                  })
                }
              >
                Cancel
              </button>

              <button
                onClick={handleReport}
                className="bg-warning text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolProfile;

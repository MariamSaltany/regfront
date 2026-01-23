import React, { useEffect, useState } from 'react';
import api from '../../services/api';

type Reporter = {
  id: number;
  name: string;
  email: string;
  role: 'parent' | 'school_admin' | 'super_admin' | string;
};

type School = {
  id: number;
  name: string;
  slug: string;
};

type ReportedReview = {
  id: number;
  school_id: number;

  overall_rating?: number | null;
  comment?: string | null;
  created_at: string;

  is_reported: boolean;
  report_reason?: string | null;
  reported_at?: string | null;
  report_status?: string | null;

  school?: School;
  reporter?: Reporter;
};

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<ReportedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data?.reports || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const dismissReport = async (reviewId: number) => {
    setActingId(reviewId);
    try {
      await api.post(`/admin/reports/${reviewId}/dismiss`);
      setReports((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to dismiss report');
    } finally {
      setActingId(null);
    }
  };

  const deleteReview = async (reviewId: number) => {
    const ok = confirm('Delete this review permanently?');
    if (!ok) return;

    setActingId(reviewId);
    try {
      await api.post(`/admin/reports/${reviewId}/delete`);
      setReports((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to delete review');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-secondary">Dispute Reports</h1>
        <button
          onClick={fetchReports}
          className="px-4 py-2 border rounded font-semibold hover:bg-neutral-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading reports...</div>
      ) : reports.length > 0 ? (
        <div className="space-y-6">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Reporter Info */}
                <div className="w-full md:w-1/3 bg-neutral-50 p-4 rounded-lg">
                  <h4 className="text-xs font-bold text-textLight uppercase mb-3">
                    Reporter Identity
                  </h4>

                  <p className="text-sm font-bold text-textDark">
                    {r.reporter?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-textLight mb-2">
                    {r.reporter?.email || '-'}
                  </p>

                  {r.reporter?.role && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-secondary text-white">
                      {String(r.reporter.role).replace('_', ' ')}
                    </span>
                  )}

                  <p className="text-[10px] mt-4 text-textLight italic">
                    Reported at:{' '}
                    {r.reported_at ? new Date(r.reported_at).toLocaleString() : '-'}
                  </p>

                  {r.report_status && (
                    <p className="text-[10px] mt-2 text-textLight italic">
                      Status: <span className="font-bold">{r.report_status}</span>
                    </p>
                  )}
                </div>

                {/* Report Content */}
                <div className="flex-grow">
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-warning uppercase mb-1">
                      Reason for Report
                    </h4>
                    <p className="text-sm font-medium text-textDark bg-warning/5 p-3 rounded border border-warning/10 italic">
                      "{r.report_reason || 'No reason provided'}"
                    </p>
                  </div>

                  <div className="bg-neutral-50/50 p-4 rounded border border-dashed">
                    <h4 className="text-xs font-bold text-textLight uppercase mb-2">
                      Review Being Reported
                    </h4>

                    <p className="text-sm font-bold text-secondary mb-1">
                      School: {r.school?.name || 'Unknown'}
                    </p>

                    <p className="text-xs text-textLight mb-3">
                      Overall rating:{' '}
                      <span className="font-bold text-textDark">
                        {r.overall_rating ?? '-'}
                      </span>
                    </p>

                    <p className="text-sm text-textDark bg-white p-2 rounded shadow-sm border">
                      "{r.comment || 'No comment'}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-56 flex flex-col gap-2">
                  <button
                    disabled={actingId === r.id}
                    onClick={() => dismissReport(r.id)}
                    className="w-full py-2 bg-success text-white rounded font-bold text-sm shadow hover:bg-green-600 transition disabled:opacity-60"
                  >
                    {actingId === r.id ? 'Working...' : 'Resolve / Dismiss'}
                  </button>

                  <button
                    disabled={actingId === r.id}
                    onClick={() => deleteReview(r.id)}
                    className="w-full py-2 border border-warning text-warning rounded font-bold text-sm hover:bg-warning/5 transition disabled:opacity-60"
                  >
                    {actingId === r.id ? 'Working...' : 'Delete Review'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 rounded-xl border border-dashed text-textLight">
          No pending reports.
        </div>
      )}
    </div>
  );
};

export default AdminReports;

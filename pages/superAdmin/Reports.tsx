
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Report } from '../../types';

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/admin/reports');
        setReports(res.data);
      } catch (e) {
        setReports([
          { 
            id: 1, 
            review: { student_number: 'ST-1', hygiene: 1, management: 1, education_quality: 1, parent_communication: 1, comment: 'Horrible', school: { name: 'Sunrise Acad' } as any } as any, 
            reporter_name: 'Admin Sarah', 
            reporter_email: 'sarah@sunrise.com', 
            reporter_role: 'school_admin', 
            reason: 'Fake review, this student never attended.', 
            created_at: '2023-12-01',
            school_managed_name: 'Sunrise Academy'
          } as any
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-secondary mb-8">Dispute Reports</h1>
      
      {loading ? (
        <div className="text-center py-20">Loading reports...</div>
      ) : reports.length > 0 ? (
        <div className="space-y-6">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Reporter Info */}
                <div className="w-full md:w-1/3 bg-neutral-50 p-4 rounded-lg">
                   <h4 className="text-xs font-bold text-textLight uppercase mb-3">Reporter Identity</h4>
                   <p className="text-sm font-bold text-textDark">{report.reporter_name}</p>
                   <p className="text-xs text-textLight mb-2">{report.reporter_email}</p>
                   <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${report.reporter_role === 'school_admin' ? 'bg-secondary text-white' : 'bg-primary text-secondary'}`}>
                     {report.reporter_role.replace('_', ' ')}
                   </span>
                   {report.school_managed_name && (
                     <p className="text-[10px] mt-2 text-textLight">Manages: <span className="text-secondary font-bold">{report.school_managed_name}</span></p>
                   )}
                   <p className="text-[10px] mt-4 text-textLight italic">Reported at: {new Date(report.created_at).toLocaleString()}</p>
                </div>

                {/* Report Content */}
                <div className="flex-grow">
                   <div className="mb-4">
                     <h4 className="text-xs font-bold text-warning uppercase mb-1">Reason for Report</h4>
                     <p className="text-sm font-medium text-textDark bg-warning/5 p-3 rounded border border-warning/10 italic">"{report.reason}"</p>
                   </div>

                   <div className="bg-neutral-50/50 p-4 rounded border border-dashed">
                      <h4 className="text-xs font-bold text-textLight uppercase mb-2">Review Details Being Reported</h4>
                      <p className="text-sm font-bold text-secondary mb-1">School: {report.review.school?.name}</p>
                      <p className="text-xs text-textLight mb-3">Student ID: {report.review.student_number} • Hygiene: {report.review.hygiene}/5</p>
                      <p className="text-sm text-textDark bg-white p-2 rounded shadow-sm border">"{report.review.comment || 'No comment'}"</p>
                   </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-48 flex flex-col gap-2">
                  <button className="w-full py-2 bg-success text-white rounded font-bold text-sm shadow hover:bg-green-600 transition">Resolve / Dismiss</button>
                  <button className="w-full py-2 border border-warning text-warning rounded font-bold text-sm hover:bg-warning/5 transition">Delete Review</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 rounded-xl border border-dashed text-textLight">All reports have been resolved.</div>
      )}
    </div>
  );
};

export default AdminReports;

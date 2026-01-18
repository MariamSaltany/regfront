
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateReview: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_number: '',
    hygiene: 0,
    management: 0,
    education_quality: 0,
    parent_communication: 0,
    comment: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_number) return alert('Student Number is required');
    if (formData.hygiene === 0 || formData.management === 0 || formData.education_quality === 0 || formData.parent_communication === 0) {
      return alert('Please rate all categories');
    }

    setLoading(true);
    try {
      await api.post(`/schools/${slug}/reviews`, formData);
      alert('Review submitted for moderation!');
      navigate(`/schools/${slug}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review. (Mock success)');
      navigate(`/schools/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const StarInput = ({ label, field }: { label: string, field: keyof typeof formData }) => (
    <div className="bg-neutral-50 p-4 rounded-lg flex flex-col items-center">
      <label className="text-xs font-bold text-textLight uppercase mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, [field]: star })}
            className={`transition transform hover:scale-110 ${star <= (formData[field] as number) ? 'text-primary' : 'text-neutral-300'}`}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="text-secondary mb-2 hover:underline flex items-center gap-1">&larr; Back to School</button>
        <h1 className="text-3xl font-bold text-secondary">Review this School</h1>
        <p className="text-textLight">Your honest feedback helps other parents make better choices.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-8">
        <div>
          <label className="block text-sm font-bold text-textDark mb-2">Student Number (Required) *</label>
          <input 
            type="text"
            required
            className="w-full border p-3 rounded focus:ring-2 focus:ring-primary outline-none"
            placeholder="Enter the official student ID used at this school"
            onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
          />
          <p className="text-[11px] text-textLight mt-1 italic">We use this to verify your relationship with the school. It will not be shown publicly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StarInput label="Hygiene & Safety" field="hygiene" />
          <StarInput label="School Management" field="management" />
          <StarInput label="Education Quality" field="education_quality" />
          <StarInput label="Parent Communication" field="parent_communication" />
        </div>

        <div>
          <label className="block text-sm font-bold text-textDark mb-2">Detailed Comments (Optional)</label>
          <textarea 
            className="w-full border p-4 rounded-lg min-h-[120px] outline-none focus:ring-2 focus:ring-primary"
            placeholder="What was your experience like? Share specific details..."
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-primary text-secondary py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 shadow transition-all disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Verified Review'}
        </button>
      </form>
    </div>
  );
};

export default CreateReview;

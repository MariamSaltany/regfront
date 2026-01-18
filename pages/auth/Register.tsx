import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/authService';
import { User } from '../../types';

interface RegisterProps {
  setUser: (u: User) => void;
}

const Register: React.FC<RegisterProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    password_confirmation: '',
    terms_accepted: false
  });
  
  // We'll use an object for errors to map them to specific inputs if needed
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setErrors({});
    setGeneralError('');

    // Client-side validation
    if (formData.password !== formData.password_confirmation) {
      setGeneralError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      console.log('Calling authApi.register...');
      // 1. Send registration data and get user info
      const registerRes = await authApi.register(formData);
      console.log('Registration response:', registerRes);
      
      // 2. Update global state with user data from registration response
      setUser(registerRes.data.user);
      console.log('User set, navigating to /schools');
      
      // 3. Redirect to schools page
      navigate('/schools');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.status === 422) {
        // Validation errors from Laravel (e.g., 'email already taken')
        setErrors(err.response.data.errors);
      } else {
        setGeneralError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-8 rounded-lg shadow-md mb-20">
      <div className="mb-6 flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="text-secondary text-sm hover:underline">&larr; Back</button>
         <h1 className="text-2xl font-bold text-secondary">Join Madrasati</h1>
      </div>

      {/* General Error Alert */}
      {generalError && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium border border-red-200">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-textDark mb-1">Full Name *</label>
          <input 
            type="text" required
            value={formData.name}
            className={`w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none ${errors.name ? 'border-red-500' : ''}`}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-textDark mb-1">Email Address *</label>
          <input 
            type="email" required
            value={formData.email}
            className={`w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none ${errors.email ? 'border-red-500' : ''}`}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-textDark mb-1">Phone Number *</label>
          <input 
            type="tel" required
            value={formData.phone}
            placeholder="091-XXXXXXX"
            className={`w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none ${errors.phone ? 'border-red-500' : ''}`}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-textDark mb-1">City (optional)</label>
          <input 
            type="text"
            value={formData.city}
            className={`w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none ${errors.city ? 'border-red-500' : ''}`}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city[0]}</p>}
        </div>

        {/* Password */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Password *</label>
            <input 
              type="password" required
              value={formData.password}
              className={`w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none ${errors.password ? 'border-red-500' : ''}`}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Confirm *</label>
            <input 
              type="password" required
              value={formData.password_confirmation}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
              onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
            />
          </div>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}

        <div className="flex items-start gap-2 pt-2">
          <input 
            type="checkbox" required
            checked={formData.terms_accepted}
            className="mt-1 h-4 w-4 text-primary border-gray-300 rounded"
            onChange={(e) => setFormData({...formData, terms_accepted: e.target.checked})}
          />
          <span className="text-xs text-textLight leading-tight">
            I agree to the Terms & Conditions and understand how my data is handled in accordance with Madrasati guidelines.
          </span>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-yellow-500 transition shadow-sm disabled:opacity-50 mt-4"
        >
          {loading ? 'Creating Account...' : 'Register Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-textLight">
        Already have an account? <Link to="/login" className="text-secondary font-semibold hover:underline">Log in</Link>
      </div>
    </div>
  );
};

export default Register;
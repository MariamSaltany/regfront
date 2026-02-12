import React, { useMemo, useState } from 'react';
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
    terms_accepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Libyan phone patterns:
  // - 09xxxxxxxx (10 digits)
  // - +2189xxxxxxxx (13 digits with +)
  const phonePattern = useMemo(() => /^(09\d{8}|\+2189\d{8})$/, []);

  const normalizeEmail = (v: string) => v.trim().toLowerCase();
  const normalizePhone = (v: string) => v.trim().replace(/\s+/g, '');

  const setField = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const clearFieldError = (key: string) => {
    if (!errors[key]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clientValidate = () => {
    const localErrors: Record<string, string[]> = {};

    const name = formData.name.trim();
    const email = normalizeEmail(formData.email);
    const phone = normalizePhone(formData.phone);
    const password = formData.password;
    const confirm = formData.password_confirmation;

    if (name.length < 3) localErrors.name = ['Name must be at least 3 characters.'];
    if (!email) localErrors.email = ['Email is required.'];
    if (!phonePattern.test(phone)) {
      localErrors.phone = ['Phone must be like 0912345678 or +218912345678.'];
    }
    if (password.length < 8) localErrors.password = ['Password must be at least 8 characters.'];
    if (password !== confirm) localErrors.password_confirmation = ["Passwords don't match."];
    if (!formData.terms_accepted) localErrors.terms_accepted = ['You must accept the terms.'];

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});

    if (!clientValidate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: normalizeEmail(formData.email),
        phone: normalizePhone(formData.phone),
        city: formData.city.trim(),
      };

      const registerRes = await authApi.register(payload);

      const user: User | undefined = registerRes.data?.user;
      if (!user) {
        throw new Error('Registration succeeded but user data was not returned.');
      }

      setUser(user);
      navigate('/schools');
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data?.errors || {});
        setGeneralError(err.response.data?.message || 'Please fix the highlighted fields.');
      } else {
        setGeneralError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (key: string) => errors[key]?.[0];

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded-xl shadow-md mb-20 border border-neutral-100">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-secondary text-sm hover:underline"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-extrabold text-secondary">Create Account</h1>
      </div>

      {generalError && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-5 text-sm border border-red-200">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ✅ Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-textDark mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setField('name', e.target.value);
                clearFieldError('name');
              }}
              placeholder="e.g., Raghad Boshiha"
              className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm ${
                fieldError('name') ? 'border-red-500' : 'border-neutral-200'
              }`}
            />
            {fieldError('name') && <p className="text-red-600 text-xs mt-1">{fieldError('name')}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-textDark mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => {
                setField('phone', e.target.value);
                clearFieldError('phone');
              }}
              placeholder="0912345678 or +218912345678"
              className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm ${
                fieldError('phone') ? 'border-red-500' : 'border-neutral-200'
              }`}
            />
            <p className="text-[11px] text-textLight mt-1">Format: 0912345678 or +218912345678</p>
            {fieldError('phone') && <p className="text-red-600 text-xs mt-1">{fieldError('phone')}</p>}
          </div>
        </div>

        {/* ✅ Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-textDark mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                setField('email', e.target.value);
                clearFieldError('email');
              }}
              placeholder="name@example.com"
              className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm ${
                fieldError('email') ? 'border-red-500' : 'border-neutral-200'
              }`}
            />
            {fieldError('email') && <p className="text-red-600 text-xs mt-1">{fieldError('email')}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-textDark mb-1">City (optional)</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => {
                setField('city', e.target.value);
                clearFieldError('city');
              }}
              placeholder="Benghazi"
              className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm ${
                fieldError('city') ? 'border-red-500' : 'border-neutral-200'
              }`}
            />
            {fieldError('city') && <p className="text-red-600 text-xs mt-1">{fieldError('city')}</p>}
          </div>
        </div>

        {/* ✅ Passwords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-textDark mb-1">Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => {
                setField('password', e.target.value);
                clearFieldError('password');
              }}
              placeholder="Minimum 8 characters"
              className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm ${
                fieldError('password') ? 'border-red-500' : 'border-neutral-200'
              }`}
            />
            <p className="text-[11px] text-textLight mt-1">Minimum 8 characters</p>
            {fieldError('password') && (
              <p className="text-red-600 text-xs mt-1">{fieldError('password')}</p>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-semibold text-textDark mb-1">Confirm Password *</label>
            <input
              type="password"
              required
              value={formData.password_confirmation}
              onChange={(e) => {
                setField('password_confirmation', e.target.value);
                clearFieldError('password_confirmation');
              }}
              placeholder="Repeat password"
              className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm ${
                fieldError('password_confirmation') ? 'border-red-500' : 'border-neutral-200'
              }`}
            />
            {fieldError('password_confirmation') && (
              <p className="text-red-600 text-xs mt-1">{fieldError('password_confirmation')}</p>
            )}
          </div>
        </div>

        {/* Terms */}
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${fieldError('terms_accepted') ? 'border-red-300 bg-red-50' : 'border-neutral-200 bg-neutral-50'}`}>
          <input
            type="checkbox"
            checked={formData.terms_accepted}
            onChange={(e) => {
              setField('terms_accepted', e.target.checked);
              clearFieldError('terms_accepted');
            }}
            className="mt-1 h-4 w-4 text-primary border-gray-300 rounded"
            required
          />
          <div>
            <p className="text-xs text-textDark leading-tight font-medium">
              I agree to the Terms & Conditions.
            </p>
            <p className="text-[11px] text-textLight leading-tight">
              Your data will be used only to provide the platform services.
            </p>
            {fieldError('terms_accepted') && (
              <p className="text-red-600 text-xs mt-1">{fieldError('terms_accepted')}</p>
            )}
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-primary text-secondary font-extrabold py-3 rounded-lg hover:bg-yellow-500 transition shadow-sm disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-textLight">
        Already have an account?{' '}
        <Link to="/login" className="text-secondary font-semibold hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
};

export default Register;

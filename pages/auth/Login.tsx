import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/authService';
import { User } from '../../types';

interface LoginProps {
  setUser: (u: User) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizeEmail = (v: string) => v.trim().toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginRes = await authApi.login({
        email: normalizeEmail(email),
        password,
      });

      const user: User | undefined = loginRes.data?.user;
      if (!user) throw new Error('Login succeeded but user data was not returned.');

      setUser(user);

      if (user.role === 'super_admin') navigate('/admin/reviews/moderation');
      else if (user.role === 'school_admin') navigate('/school-admin/profile');
      else navigate('/schools');

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.password?.[0] ||
        'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow-md border border-neutral-100">
      <h1 className="text-2xl font-extrabold text-secondary mb-2 text-center">Welcome Back</h1>
      <p className="text-sm text-textLight text-center mb-6">Log in to continue.</p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-textDark mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border border-neutral-200 p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-textDark mb-1">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              className="w-full border border-neutral-200 p-3 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary hover:underline"
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-primary text-secondary font-extrabold py-3 rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-textLight">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-secondary font-semibold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default Login;

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Call the login service (this now saves the token to localStorage)
      const loginRes = await authApi.login({ email, password });

      // 2. Update the global user state with user data from login response
      setUser(loginRes.data.user);

      // 3. Redirect based on role
      if (loginRes.data.user.role === 'super_admin') {
        navigate('/admin/reviews/moderation');
      } else if (loginRes.data.user.role === 'school_admin') {
        navigate('/school-admin/profile');
      } else {
        navigate('/schools');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-secondary mb-6 text-center">Login to Madrasati</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-textDark mb-1">Email</label>
          <input
            type="email" required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-textDark mb-1">Password</label>
          <input
            type="password" required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-textLight">
        Don't have an account? <Link to="/register" className="text-secondary font-semibold hover:underline">Register here</Link>
      </div>
    </div>
  );
};

export default Login;
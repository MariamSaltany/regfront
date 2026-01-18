
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageContext';
import Navbar from './components/Navbar';
import { User, UserRole } from './types';
import { authApi } from './services/authService';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Parent Pages
import SchoolsList from './pages/parent/SchoolsList';
import SchoolProfile from './pages/parent/SchoolProfile';
import CreateReview from './pages/parent/CreateReview';
import MyReviews from './pages/parent/MyReviews';
import SchoolPhotos from './pages/parent/SchoolPhotos';

// School Admin Pages
import SchoolAdminProfile from './pages/schoolAdmin/Profile';
import SchoolAdminVerification from './pages/schoolAdmin/Verification';

// Super Admin Pages
import AdminModeration from './pages/superAdmin/Moderation';
import AdminReports from './pages/superAdmin/Reports';
import AdminSchools from './pages/superAdmin/SchoolsManagement';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authApi.getUser();
        setUser(res.data);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutralBg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar user={user} setUser={setUser} />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Public/Guest Routes */}
              <Route path="/" element={<Navigate to="/schools" />} />
              <Route path="/schools" element={<SchoolsList />} />
              <Route path="/schools/:slug" element={<SchoolProfile user={user} />} />
              <Route path="/schools/:slug/photos" element={<SchoolPhotos />} />
              
              <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />

              {/* Parent Protected Routes */}
              <Route path="/my-reviews" element={user?.role === UserRole.PARENT ? <MyReviews /> : <Navigate to="/login" />} />
              <Route path="/schools/:slug/reviews/create" element={user?.role === UserRole.PARENT ? <CreateReview /> : <Navigate to="/login" />} />

              {/* School Admin Routes */}
              <Route path="/school-admin/profile" element={user?.role === UserRole.SCHOOL_ADMIN ? <SchoolAdminProfile /> : <Navigate to="/login" />} />
              <Route path="/school-admin/reviews" element={user?.role === UserRole.SCHOOL_ADMIN ? <SchoolAdminVerification /> : <Navigate to="/login" />} />

              {/* Super Admin Routes */}
              <Route path="/admin/reviews/moderation" element={user?.role === UserRole.SUPER_ADMIN ? <AdminModeration /> : <Navigate to="/login" />} />
              <Route path="/admin/reports" element={user?.role === UserRole.SUPER_ADMIN ? <AdminReports /> : <Navigate to="/login" />} />
              <Route path="/admin/schools" element={user?.role === UserRole.SUPER_ADMIN ? <AdminSchools /> : <Navigate to="/login" />} />

              <Route path="*" element={<div className="text-center py-20 text-textLight">404 - Not Found</div>} />
            </Routes>
          </main>
          <footer className="bg-white border-t py-6 text-center text-textLight text-sm">
            &copy; {new Date().getFullYear()} Madrasati. All rights reserved.
          </footer>
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;


import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from './LanguageContext';
import { UserRole, User } from '../types';
import { authApi } from '../services/authService';

interface NavbarProps {
  user: User | null;
  setUser: (u: User | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const { t, setLang, lang } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const NavLinks = () => {
    if (!user) {
      return (
        <>
          <Link to="/schools" className="hover:text-primary transition">{t('schools')}</Link>
          <Link to="/login" className="hover:text-primary transition">{t('login')}</Link>
          <Link to="/register" className="bg-primary text-secondary px-4 py-2 rounded-md font-bold hover:bg-yellow-500 transition">{t('register')}</Link>
        </>
      );
    }

    if (user.role === UserRole.PARENT) {
      return (
        <>
          <Link to="/schools" className="hover:text-primary transition">{t('schools')}</Link>
          <Link to="/my-reviews" className="hover:text-primary transition">{t('my_reviews')}</Link>
        </>
      );
    }

    if (user.role === UserRole.SCHOOL_ADMIN) {
      return (
        <>
          <Link to="/school-admin/profile" className="hover:text-primary transition">{t('profile')}</Link>
          <Link to="/school-admin/reviews" className="hover:text-primary transition">{t('verification')}</Link>
        </>
      );
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return (
        <>
          <Link to="/admin/reviews/moderation" className="hover:text-primary transition">{t('moderation')}</Link>
          <Link to="/admin/reports" className="hover:text-primary transition">{t('reports')}</Link>
          <Link to="/admin/schools" className="hover:text-primary transition">{t('schools')}</Link>
        </>
      );
    }
    return null;
  };

  return (
    <nav className="bg-secondary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
              {t('app_name')}
            </Link>
            <div className="hidden md:flex items-center space-x-6 gap-4">
              <NavLinks />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="text-sm border border-white/20 px-3 py-1 rounded hover:bg-white/10"
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            {user && (
              <button 
                onClick={handleLogout}
                className="text-sm font-medium hover:text-primary"
              >
                {t('logout')}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

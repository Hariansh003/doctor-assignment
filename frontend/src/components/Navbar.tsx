import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const navLinks = [
  { to: '/', label: 'Doctors' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/admin', label: 'Admin' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🩺</span>
              <span className="text-xl font-bold text-indigo-600">DocConsult</span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

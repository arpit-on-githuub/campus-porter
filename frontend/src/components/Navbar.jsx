import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const tabs = [
    { path: '/home', label: 'Browse', icon: '🔍' },
    { path: '/post-request', label: 'Post', icon: '➕' },
    { path: '/my-requests', label: 'My Requests', icon: '📦' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center px-4 py-1 rounded-lg transition ${
              isActive(tab.path)
                ? 'text-blue-600'
                : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium mt-0.5">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center px-4 py-1 text-red-400"
        >
          <span className="text-xl">🚪</span>
          <span className="text-xs font-medium mt-0.5">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
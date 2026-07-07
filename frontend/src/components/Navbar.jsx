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
    { path: '/my-requests', label: 'Mine', icon: '📦' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="sling-glass pointer-events-auto rounded-3xl shadow-xl shadow-slate-900/10 px-2 py-2 flex items-center gap-1 w-full max-w-md">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`sling-tap relative flex-1 flex flex-col items-center py-1.5 rounded-2xl ${active ? 'bg-white/70' : ''}`}
            >
              {active && (
                <span className="absolute -top-1 h-1 w-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
              )}
              <span className={`text-lg transition-transform duration-300 ${active ? 'scale-125' : 'opacity-50'}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-bold mt-0.5 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="sling-tap flex-1 flex flex-col items-center py-1.5 rounded-2xl"
        >
          <span className="text-lg opacity-50">🚪</span>
          <span className="text-[10px] font-bold mt-0.5 text-rose-400">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
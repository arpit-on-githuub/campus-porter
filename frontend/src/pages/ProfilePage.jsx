import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Navbar />

      <div className="px-4 py-4 pb-24">

        {/* Profile header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold mx-auto mb-3">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-gray-800">{user?.name}</h1>
          <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {user?.totalDeliveries || 0}
            </p>
            <p className="text-gray-400 text-sm mt-1">Deliveries</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-yellow-500">
              {user?.rating > 0 ? `⭐ ${user.rating}` : '—'}
            </p>
            <p className="text-gray-400 text-sm mt-1">Rating</p>
          </div>
        </div>

        {/* IIT-J badge */}
        <div className="bg-blue-50 rounded-xl p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <p className="text-blue-700 font-semibold text-sm">
              Verified IIT Jodhpur Student
            </p>
            <p className="text-blue-400 text-xs mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/my-requests')}
            className="w-full bg-white rounded-xl shadow-sm p-4 text-left flex justify-between items-center"
          >
            <span className="text-gray-700 font-medium">📦 My Requests</span>
            <span className="text-gray-400">→</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-500 py-3.5 rounded-xl font-semibold hover:bg-red-100 transition"
          >
            🚪 Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
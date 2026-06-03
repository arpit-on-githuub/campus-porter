import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user, logout } = useAuth();
const { isDark } = useTheme();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(user?.phone || '');
const [phoneLoading, setPhoneLoading] = useState(false);
const [phoneSuccess, setPhoneSuccess] = useState(''); 

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

        {/* Phone number section */}
<div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
  <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
    📞 Phone Number
  </p>
  <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
    Add your number so porters/requesters can call you directly
  </p>
  <div className="flex gap-2">
    <input
      type="tel"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      placeholder="Enter 10-digit number"
      maxLength={10}
      className={`flex-1 rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isDark
          ? 'bg-slate-700 border-slate-600 text-white'
          : 'bg-slate-50 border-slate-200'
      }`}
    />
    <button
      onClick={async () => {
        setPhoneLoading(true);
        try {
          await axios.patch(
            'http://localhost:3000/api/auth/update-phone',
            { phone, isPhoneShared: true },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setPhoneSuccess('Saved!');
          setTimeout(() => setPhoneSuccess(''), 2000);
        } catch (err) {
          console.error(err);
        } finally {
          setPhoneLoading(false);
        }
      }}
      disabled={phoneLoading}
      className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
    >
      {phoneLoading ? '...' : phoneSuccess || 'Save'}
    </button>
  </div>
</div>
{/* Email notifications toggle */}
<div className={`rounded-xl p-4 mb-4 flex justify-between items-center ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
  <div>
    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
      📧 Email Notifications
    </p>
    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
      Get notified about new requests
    </p>
  </div>
  <button
    onClick={async () => {
      try {
        await axios.patch(
          'http://localhost:3000/api/auth/update-phone',
          { emailNotifications: !user.emailNotifications },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      } catch (err) {
        console.error(err);
      }
    }}
    className={`w-12 h-6 rounded-full transition-colors ${
      user?.emailNotifications !== false ? 'bg-blue-600' : 'bg-slate-300'
    }`}
  >
    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
      user?.emailNotifications !== false ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
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
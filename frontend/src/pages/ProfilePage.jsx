import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL;

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-cyan-50 max-w-md mx-auto">
      <div className="sling-aurora sling-aurora-1" style={{ top: '-60px', right: '-50px', width: '210px', height: '210px', background: '#818cf8' }} />
      <div className="sling-aurora sling-aurora-2" style={{ top: '220px', left: '-60px', width: '190px', height: '190px', background: '#22d3ee' }} />

      <Navbar />

      <div className="relative z-10 px-4 pt-7 pb-28 page-enter">

        {/* Profile header */}
        <div className="relative rounded-3xl p-6 mb-4 text-center overflow-hidden shadow-xl shadow-blue-500/20 bg-gradient-to-br from-blue-600 to-cyan-400 animate-fade-in-up">
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-white text-4xl font-black mx-auto mb-3 border border-white/30">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-black text-white">{user?.name}</h1>
          <p className="text-blue-50 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in-up anim-delay-1">
          <div className="bg-white rounded-3xl shadow-sm p-5 text-center">
            <p className="text-3xl font-black sling-gradient-text">
              {user?.totalDeliveries || 0}
            </p>
            <p className="text-slate-400 text-xs font-semibold mt-1">Deliveries</p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm p-5 text-center">
            <p className="text-3xl font-black text-amber-500">
              {user?.rating > 0 ? `⭐ ${user.rating}` : '—'}
            </p>
            <p className="text-slate-400 text-xs font-semibold mt-1">Rating</p>
          </div>
        </div>

        {/* IIT-J badge */}
        <div className="sling-glass rounded-3xl p-4 mb-4 flex items-center gap-3 animate-fade-in-up anim-delay-2">
          <span className="text-2xl">🎓</span>
          <div>
            <p className="text-blue-700 font-bold text-sm">
              Verified IIT Jodhpur Student
            </p>
            <p className="text-blue-400 text-xs mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Phone number section */}
        <div className={`rounded-3xl p-4 mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
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
            `${API_URL}/api/auth/update-phone`,
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
<div className={`rounded-3xl p-4 mb-4 flex justify-between items-center ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
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
          `${API_URL}/api/auth/update-phone`,
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
        <div className="space-y-3 animate-fade-in-up anim-delay-3">
          <button
            onClick={() => navigate('/my-requests')}
            className="sling-tap w-full bg-white rounded-3xl shadow-sm p-4 text-left flex justify-between items-center"
          >
            <span className="text-slate-700 font-semibold">📦 My Requests</span>
            <span className="text-slate-400">→</span>
          </button>

          <button
            onClick={handleLogout}
            className="sling-tap w-full bg-rose-50 text-rose-500 py-3.5 rounded-3xl font-bold hover:bg-rose-100 transition"
          >
            🚪 Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
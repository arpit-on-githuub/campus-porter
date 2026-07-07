import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOTP } from '../api/auth';
import SlingLogo from '../components/SlingLogo';

const OTPPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;
  const email = location.state?.email;

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <p className="text-red-500 mb-4">Invalid access. Please register first.</p>
          <Link to="/register" className="text-blue-600 hover:underline">
            Go to Register
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOTP(userId, otp);
      setSuccess('Email verified successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="sling-aurora sling-aurora-1" style={{ top: '-40px', left: '-70px', width: '250px', height: '250px', background: '#60a5fa' }} />
      <div className="sling-aurora sling-aurora-2" style={{ bottom: '-50px', right: '-70px', width: '230px', height: '230px', background: '#22d3ee' }} />
      <div className="relative z-10 bg-white rounded-3xl shadow-xl p-8 w-full max-w-md animate-fade-in-up">

        <div className="text-center mb-8">
          <SlingLogo size={64} withWordmark />
          <p className="text-gray-500 mt-2 text-sm">IIT Jodhpur Delivery Network</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          We sent a 6-digit OTP to <strong>{email}</strong>. 
          Check your inbox and enter it below.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {success} Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="sling-cta sling-tap w-full text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            <span className="relative z-10">{loading ? 'Verifying...' : 'Verify OTP'}</span>
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Wrong email?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Register again
          </Link>
        </p>

      </div>
    </div>
  );
};

export default OTPPage;
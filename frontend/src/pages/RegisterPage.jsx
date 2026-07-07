import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import SlingLogo from '../components/SlingLogo';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.endsWith('@iitj.ac.in')) {
      setError('Only @iitj.ac.in email addresses are allowed');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(name, email, password);
      navigate('/verify-otp', { state: { userId: data.userId, email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <SlingLogo size={72} withWordmark tagline />
          <p className="text-gray-500 mt-2 text-sm">IIT Jodhpur Delivery Network</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Account</h2>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Arpit Bansal"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IIT Jodhpur Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="b24cs1015@iitj.ac.in"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sling-cta sling-tap w-full text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            <span className="relative z-10">{loading ? 'Creating account...' : 'Register'}</span>
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
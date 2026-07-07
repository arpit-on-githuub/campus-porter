import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequests } from '../api/requests';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SlingLogo from '../components/SlingLogo';

const HomePage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (location) filters.location = location;
      if (sortBy) filters.sortBy = sortBy;

      const data = await getRequests(filters);
      setRequests(data.requests);
    } catch (err) {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [location, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
       <Navbar />

      <div className="px-4 py-4 pb-24 page-enter">

        {/* Brand */}
        <div className="flex items-center gap-2 mb-4">
          <SlingLogo size={34} />
          <span
            className="font-black tracking-tight text-lg bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent sling-wordmark"
            style={{ backgroundSize: '200% auto' }}
          >
            SLING
          </span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Open Requests
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Hey {user?.name?.split(' ')[0]} 👋 Pick a request to fulfil
            </p>
          </div>
          <button
            onClick={() => navigate('/post-request')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Post Request
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-3">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Filter by location..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="tip">Highest Tip</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Request list */}
        {loading && (
          <div className="text-center py-12 text-gray-400">
            Loading requests...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No open requests right now</p>
            <p className="text-gray-400 text-sm mt-1">
              Be the first to post one!
            </p>
          </div>
        )}

        <div className="space-y-4">
          {requests.map((request, index) => (
            <div
              key={request._id}
              onClick={() => navigate(`/requests/${request._id}`)}
              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md active:scale-[0.99] transition border border-gray-100 animate-fade-in-up"
            >
              {/* Location row */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">
                  {request.fromLocation}
                </span>
                <span>→</span>
                <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md font-medium">
                  {request.toLocation}
                </span>
              </div>

              {/* Item description */}
              <p className="text-gray-800 font-medium mb-3">
                {request.itemDescription}
              </p>

              {/* Bottom row */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {request.requester?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-500">
                    {request.requester?.name}
                  </span>
                  {request.requester?.rating > 0 && (
                    <span className="text-yellow-500 text-xs">
                      ⭐ {request.requester?.rating}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {request.rewardType === 'party' ? (
                    <>
                      <span className="text-pink-600 font-bold text-lg">🎉</span>
                      <p className="text-gray-400 text-xs">party/treat</p>
                    </>
                  ) : (
                    <>
                      <span className="text-green-600 font-bold text-lg">
                        ₹{request.tipAmount / 100}
                      </span>
                      <p className="text-gray-400 text-xs">tip</p>
                    </>
                  )}
                </div>
              </div>

              {/* Time */}
              <p className="text-gray-400 text-xs mt-3">
                Posted {new Date(request.createdAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HomePage;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRequests, getAssignedRequests } from '../api/requests';
import Navbar from '../components/Navbar';

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-600',
  accepted: 'bg-yellow-100 text-yellow-600',
  picked_up: 'bg-orange-100 text-orange-600',
  delivered: 'bg-purple-100 text-purple-600',
  completed: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
};

const MyRequestsPage = () => {
  const [activeTab, setActiveTab] = useState('posted');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = activeTab === 'posted'
        ? await getMyRequests()
        : await getAssignedRequests();
      setRequests(data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Navbar />

      <div className="px-4 py-4 pb-24">

        <h1 className="text-xl font-bold text-gray-800 mb-4">My Activity</h1>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('posted')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'posted'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            📝 Posted
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'assigned'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            🚀 Delivering
          </button>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        )}

        {!loading && requests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {activeTab === 'posted'
                ? 'No requests posted yet'
                : 'No deliveries yet'}
            </p>
            <button
              onClick={() => navigate(
                activeTab === 'posted' ? '/post-request' : '/home'
              )}
              className="mt-4 text-blue-600 text-sm font-medium"
            >
              {activeTab === 'posted'
                ? 'Post your first request →'
                : 'Browse open requests →'}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request._id}
              onClick={() => navigate(`/requests/${request._id}`)}
              className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[request.status]}`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-green-600 font-bold">
                  ₹{request.tipAmount / 100}
                </span>
              </div>

              <p className="text-gray-800 text-sm font-medium mb-2">
                {request.itemDescription}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{request.fromLocation}</span>
                <span>→</span>
                <span>{request.toLocation}</span>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MyRequestsPage;
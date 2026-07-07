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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-cyan-50 max-w-md mx-auto">
      <div className="sling-aurora sling-aurora-1" style={{ top: '-60px', left: '-50px', width: '210px', height: '210px', background: '#60a5fa' }} />
      <div className="sling-aurora sling-aurora-2" style={{ top: '180px', right: '-60px', width: '190px', height: '190px', background: '#22d3ee' }} />

      <Navbar />

      <div className="relative z-10 px-4 pt-7 pb-28 page-enter">

        <h1 className="text-3xl font-black text-slate-800 mb-1 animate-fade-in-up">My Activity</h1>
        <p className="text-slate-500 text-sm mb-5 animate-fade-in-up">Everything you have slung and delivered.</p>

        {/* Tabs */}
        <div className="sling-glass rounded-2xl p-1 mb-6 flex animate-fade-in-up anim-delay-1">
          <button
            onClick={() => setActiveTab('posted')}
            className={`sling-tap flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'posted'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow'
                : 'text-slate-500'
            }`}
          >
            📝 Posted
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`sling-tap flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === 'assigned'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow'
                : 'text-slate-500'
            }`}
          >
            🚀 Delivered
          </button>
        </div>

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                <div className="skeleton h-4 w-24 mb-3"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-3 w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="text-center py-14 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-4 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-cyan-400 shadow-xl shadow-blue-500/30 flex items-center justify-center animate-wiggle text-4xl">
              {activeTab === 'posted' ? '📝' : '🚀'}
            </div>
            <p className="sling-gradient-text text-lg font-black">
              {activeTab === 'posted' ? 'No requests posted yet' : 'No deliveries yet'}
            </p>
            <button
              onClick={() => navigate(activeTab === 'posted' ? '/post-request' : '/home')}
              className="mt-4 text-blue-600 text-sm font-bold"
            >
              {activeTab === 'posted' ? 'Post your first request →' : 'Browse open requests →'}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {requests.map((request, index) => (
            <div
              key={request._id}
              onClick={() => navigate(`/requests/${request._id}`)}
              style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
              className="sling-tap animate-rise bg-white rounded-3xl shadow-sm p-4 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 border border-slate-100"
            >
              <div className="flex justify-between items-start mb-2.5">
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${STATUS_COLORS[request.status]}`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`font-bold text-sm ${request.rewardType === 'party' ? 'text-pink-600' : 'text-emerald-600'}`}>
                  {request.rewardType === 'party' ? '🎉 Party' : `₹${request.tipAmount / 100}`}
                </span>
              </div>

              <p className="text-slate-800 text-sm font-semibold mb-2.5">
                {request.itemDescription}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-500">{request.fromLocation}</span>
                <span>→</span>
                <span className="font-medium text-slate-500">{request.toLocation}</span>
                <span className="ml-auto">{new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MyRequestsPage;
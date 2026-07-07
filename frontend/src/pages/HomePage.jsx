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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-cyan-50 max-w-md mx-auto">
      {/* aurora background */}
      <div className="sling-aurora sling-aurora-1" style={{ top: '-70px', left: '-50px', width: '230px', height: '230px', background: '#60a5fa' }} />
      <div className="sling-aurora sling-aurora-2" style={{ top: '160px', right: '-70px', width: '210px', height: '210px', background: '#22d3ee' }} />

      <Navbar />

      <div className="relative z-10 px-4 pt-7 pb-28 page-enter">

        {/* Brand + avatar */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <div className="flex items-center gap-2.5">
            <SlingLogo size={40} />
            <div>
              <div className="sling-gradient-text text-xl font-black leading-none">SLING</div>
              <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-slate-400 mt-0.5">Move things, easily</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="sling-tap w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white font-black flex items-center justify-center shadow-lg shadow-blue-500/30"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </button>
        </div>

        {/* Greeting */}
        <div className="mb-5 animate-fade-in-up anim-delay-1">
          <h1 className="text-3xl font-black text-slate-800 leading-tight">
            Hey {user?.name?.split(' ')[0]} <span className="inline-block animate-wiggle">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">Grab a request, or sling one of your own.</p>
        </div>

        {/* Post CTA */}
        <button
          onClick={() => navigate('/post-request')}
          className="sling-cta sling-tap w-full text-white font-bold text-base py-4 rounded-2xl shadow-xl shadow-blue-500/30 mb-6 flex items-center justify-center gap-2 animate-fade-in-up anim-delay-2"
        >
          <span className="text-xl relative z-10">➕</span>
          <span className="relative z-10">Post a Request</span>
        </button>

        {/* Filters */}
        <div className="sling-glass rounded-2xl p-2.5 mb-6 flex gap-2 shadow-sm animate-fade-in-up anim-delay-3">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="🔍 Filter by location"
            className="flex-1 bg-white/70 border border-white/60 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/70 border border-white/60 rounded-xl px-2 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="tip">Top tip</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <div className="skeleton h-4 w-2/3 mb-3"></div>
                <div className="skeleton h-4 w-full mb-4"></div>
                <div className="flex justify-between">
                  <div className="skeleton h-8 w-24"></div>
                  <div className="skeleton h-8 w-16"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl text-sm border border-rose-100">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && requests.length === 0 && (
          <div className="text-center py-14 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-5 rounded-[1.7rem] bg-gradient-to-br from-blue-600 to-cyan-400 shadow-xl shadow-blue-500/30 flex items-center justify-center animate-wiggle">
              <svg viewBox="0 0 64 64" width="58%" height="58%" fill="none" aria-hidden="true">
                <g stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.9">
                  <line x1="6" y1="24" x2="22" y2="24" />
                  <line x1="2" y1="34" x2="18" y2="34" />
                  <line x1="8" y1="44" x2="20" y2="44" />
                </g>
                <rect x="26" y="20" width="26" height="24" rx="6" fill="#fff" />
                <path d="M52 26 L60 32 L52 38" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <p className="sling-gradient-text text-xl font-black">Nothing to sling yet</p>
            <p className="text-slate-400 text-sm mt-1.5 mb-5">Be the first to post a request today.</p>
            <button
              onClick={() => navigate('/post-request')}
              className="sling-cta sling-tap text-white font-bold px-6 py-3 rounded-2xl inline-flex items-center gap-2"
            >
              <span className="relative z-10">Post the first one</span>
            </button>
          </div>
        )}

        {/* Request list */}
        <div className="space-y-3.5">
          {requests.map((request, index) => (
            <div
              key={request._id}
              onClick={() => navigate(`/requests/${request._id}`)}
              style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
              className="sling-tap animate-rise bg-white rounded-3xl p-5 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 border border-slate-100 cursor-pointer"
            >
              {/* route */}
              <div className="flex items-center gap-2 text-xs mb-3">
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-semibold">{request.fromLocation}</span>
                <span className="text-slate-300">→</span>
                <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-semibold">{request.toLocation}</span>
              </div>

              <p className="text-slate-800 font-semibold mb-4 leading-snug">{request.itemDescription}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-xs font-bold flex items-center justify-center">
                    {request.requester?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-slate-600">{request.requester?.name}</div>
                    {request.requester?.rating > 0 && (
                      <div className="text-[11px] text-amber-500">⭐ {request.requester?.rating}</div>
                    )}
                  </div>
                </div>
                {request.rewardType === 'party' ? (
                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white text-sm font-bold shadow-sm shadow-pink-500/30">🎉 Party</div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-bold shadow-sm shadow-emerald-500/30">₹{request.tipAmount / 100}</div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HomePage;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getRequestById,
  acceptRequest,
  updateStatus,
  rateRequest,
} from '../api/requests';
import { createOrder, verifyPayment } from '../api/payments';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import { sendNotification } from '../utils/notify';

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-600',
  accepted: 'bg-yellow-100 text-yellow-600',
  picked_up: 'bg-orange-100 text-orange-600',
  delivered: 'bg-purple-100 text-purple-600',
  completed: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
};

const STATUS_LABELS = {
  open: 'Open',
  accepted: 'Accepted',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const RequestDetailPage = () => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  const { id } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const fetchRequest = async () => {
    try {
      const data = await getRequestById(id);
      setRequest(data.request);
    } catch (err) {
      setError('Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchRequest();

  // Listen for cancellation
  import('socket.io-client').then(({ io }) => {
    const socket = io('http://localhost:3000');
    socket.emit('join_room', id);
    socket.on('request_cancelled', (data) => {
      alert(`⚠️ ${data.message}`);
      fetchRequest();
    });
    return () => socket.disconnect();
  });
}, [id]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await acceptRequest(id);
      await fetchRequest();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setActionLoading(true);
    try {
      await updateStatus(id, newStatus);
      await fetchRequest();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async () => {
    setActionLoading(true);
    try {
      const orderData = await createOrder(id);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Campus Porter',
        description: 'Tip for delivery',
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert('Payment successful! Thank you.');
            await fetchRequest();
          } catch (err) {
            alert('Payment verification failed');
          }
        },
        prefill: { email: user?.email },
        theme: { color: '#2563eb' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRate = async (stars) => {
    setRating(stars);
    setActionLoading(true);
    try {
      await rateRequest(id, stars);
      setRatingSubmitted(true);
      await fetchRequest();
    } catch (err) {
      setError(err.response?.data?.message || 'Rating failed');
    } finally {
      setActionLoading(false);
    }
  };

  const CallButton = ({ phone, name }) => (
    <a
      href={`tel:${phone}`}
      className="w-full bg-gradient-to-r from-green-500 to-emerald-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
    >
      📞 Call {name} — {phone}
    </a>
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="space-y-3 w-64">
          <div className="skeleton h-6 w-full"></div>
          <div className="skeleton h-24 w-full"></div>
          <div className="skeleton h-12 w-full"></div>
        </div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const isRequester = request?.requester?._id === user?.id;
  const isPorter = request?.porter?._id === user?.id;

  return (
    <div className={`min-h-screen max-w-md mx-auto ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <Navbar />

      <div className="px-4 py-4 pb-24 page-enter">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-xl shadow-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-600'}`}
          >
            ←
          </button>
          <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Request Details
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[request.status]}`}>
            {STATUS_LABELS[request.status]}
          </span>
          <span className="text-green-500 font-bold text-xl">
            ₹{request.tipAmount / 100}
          </span>
        </div>

        <div className={`rounded-2xl shadow-sm p-4 mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-lg text-sm font-medium">
              📍 {request.fromLocation}
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-gray-400'}>→</span>
            <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-lg text-sm font-medium">
              🏠 {request.toLocation}
            </span>
          </div>

          <p className={`font-medium mb-4 ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
            {request.itemDescription}
          </p>

          <div className={`border-t pt-3 ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
            <p className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
              Requested by
            </p>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {request.requester?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
                  {request.requester?.name}
                </p>
                {request.requester?.rating > 0 && (
                  <p className="text-xs text-yellow-500">⭐ {request.requester?.rating}</p>
                )}
              </div>
            </div>
          </div>

          {request.porter && (
            <div className={`border-t pt-3 mt-3 ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <p className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                Porter
              </p>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {request.porter?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
                    {request.porter?.name}
                  </p>
                  {request.porter?.rating > 0 && (
                    <p className="text-xs text-yellow-500">⭐ {request.porter?.rating}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {!isRequester && request.status === 'open' && (
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              {actionLoading ? 'Accepting...' : '✋ Accept Request'}
            </button>
          )}

          {isPorter && request.status === 'accepted' && (
            <button
              onClick={() => handleStatusUpdate('picked_up')}
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50"
            >
              {actionLoading ? 'Updating...' : '📦 Mark as Picked Up'}
            </button>
          )}
          sendNotification('Campus Porter', `Your request status updated to ${newStatus}`);

          {isPorter && request.status === 'picked_up' && (
            <button
              onClick={() => handleStatusUpdate('delivered')}
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-400 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50"
            >
              {actionLoading ? 'Updating...' : '🚀 Mark as Delivered'}
            </button>
          )}
          sendNotification('Campus Porter', `Your request status updated to ${newStatus}`);

          {isRequester && request.status === 'delivered' && (
            <div className="space-y-3">
              <button
                onClick={() => handleStatusUpdate('completed')}
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-400 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50"
              >
                {actionLoading ? 'Confirming...' : '✅ Confirm Delivery'}
              </button>
              sendNotification('Campus Porter', `Your request status updated to ${newStatus}`);
              <button
                onClick={handlePayment}
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : `💳 Pay Tip ₹${request.tipAmount / 100}`}
              </button>
            </div>
          )}
sendNotification('Campus Porter', `Your request status updated to ${newStatus}`);
          {(isRequester || isPorter) &&
            ['accepted', 'picked_up', 'delivered', 'completed'].includes(request.status) && (
              <div className="space-y-3">
                <button
                  onClick={() => setChatOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  💬 Chat with {isRequester ? 'Porter' : 'Requester'}
                </button>

                {!phoneRevealed ? (
                  <button
                  onClick={() => setPhoneRevealed(true)}
                  className={`w-full border-2 border-blue-500 text-blue-500 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${isDark ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50'}`}
>
                📞 {isPorter ? 'Reveal Phone Number' : 'Ask for Phone Number'}
                  </button>
                ) : (
                  <div
                    className={`border rounded-xl p-4 ${
                      isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <p className="text-green-500 text-sm font-medium text-center mb-3">
                      📞 Phone Number
                    </p>
                    {isRequester && request.porter?.phone ? (
                      <CallButton phone={request.porter.phone} name={request.porter.name} />
                    ) : isPorter && request.requester?.phone ? (
                      <CallButton phone={request.requester.phone} name={request.requester.name} />
                    ) : (
                      <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        The other person has not added their phone number yet.
                        They can add it from their Profile page.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          {(isRequester || isPorter) &&
            ['open', 'accepted'].includes(request.status) && (
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={actionLoading}
                className="w-full border border-red-400 text-red-400 py-3 rounded-xl font-medium hover:bg-red-500/10 transition disabled:opacity-50"
              >
                Cancel Request
              </button>
            )}

          {request.status === 'completed' && (isRequester || isPorter) && !ratingSubmitted && (
            <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
              <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Rate this {isRequester ? 'porter' : 'requester'}
              </p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    disabled={actionLoading}
                    className={`text-3xl transition ${star <= rating ? 'opacity-100' : 'opacity-30'}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
          )}

          {ratingSubmitted && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm text-center">
              ✅ Rating submitted successfully!
            </div>
          )}
        </div>
      </div>

      <ChatBox
        requestId={id}
        otherUser={isRequester ? request?.porter : request?.requester}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
};

export default RequestDetailPage;
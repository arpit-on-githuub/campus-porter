import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestById, acceptRequest, updateStatus, rateRequest } from '../api/requests';
import { createOrder, verifyPayment } from '../api/payments';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

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

  const { id } = useParams();
  const { user } = useAuth();
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
        description: `Tip for delivery`,
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
        prefill: {
          email: user?.email,
        },
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
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
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Navbar />

      <div className="px-4 py-4 pb-24">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold text-gray-800">Request Details</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Status badge */}
        <div className="flex justify-between items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[request.status]}`}>
            {STATUS_LABELS[request.status]}
          </span>
          <span className="text-green-600 font-bold text-xl">
            ₹{request.tipAmount / 100}
          </span>
        </div>

        {/* Request details card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-sm font-medium">
              {request.fromLocation}
            </span>
            <span className="text-gray-400">→</span>
            <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md text-sm font-medium">
              {request.toLocation}
            </span>
          </div>

          <p className="text-gray-800 font-medium mb-4">
            {request.itemDescription}
          </p>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 mb-1">Requested by</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                {request.requester?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {request.requester?.name}
                </p>
                {request.requester?.rating > 0 && (
                  <p className="text-xs text-yellow-500">
                    ⭐ {request.requester?.rating}
                  </p>
                )}
              </div>
            </div>
          </div>

          {request.porter && (
            <div className="border-t border-gray-100 pt-3 mt-3">
              <p className="text-xs text-gray-400 mb-1">Porter</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                  {request.porter?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {request.porter?.name}
                  </p>
                  {request.porter?.rating > 0 && (
                    <p className="text-xs text-yellow-500">
                      ⭐ {request.porter?.rating}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">

          {/* Porter actions */}
          {!isRequester && request.status === 'open' && (
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {actionLoading ? 'Accepting...' : '✋ Accept Request'}
            </button>
          )}

          {isPorter && request.status === 'accepted' && (
            <button
              onClick={() => handleStatusUpdate('picked_up')}
              disabled={actionLoading}
              className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {actionLoading ? 'Updating...' : '📦 Mark as Picked Up'}
            </button>
          )}

          {isPorter && request.status === 'picked_up' && (
            <button
              onClick={() => handleStatusUpdate('delivered')}
              disabled={actionLoading}
              className="w-full bg-purple-500 text-white py-3.5 rounded-xl font-semibold hover:bg-purple-600 transition disabled:opacity-50"
            >
              {actionLoading ? 'Updating...' : '🚀 Mark as Delivered'}
            </button>
          )}

          {/* Requester actions */}
          {isRequester && request.status === 'delivered' && (
            <div className="space-y-3">
              <button
                onClick={() => handleStatusUpdate('completed')}
                disabled={actionLoading}
                className="w-full bg-green-500 text-white py-3.5 rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50"
              >
                {actionLoading ? 'Confirming...' : '✅ Confirm Delivery'}
              </button>
              <button
                onClick={handlePayment}
                disabled={actionLoading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : `💳 Pay Tip ₹${request.tipAmount / 100}`}
              </button>
            </div>
          )}

          {/* Cancel button */}
          {(isRequester || isPorter) &&
            ['open', 'accepted'].includes(request.status) && (
            <button
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={actionLoading}
              className="w-full border border-red-300 text-red-500 py-3 rounded-xl font-medium hover:bg-red-50 transition disabled:opacity-50"
            >
              Cancel Request
            </button>
          )}

          {/* Rating */}
          {request.status === 'completed' && (isRequester || isPorter) && !ratingSubmitted && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Rate this {isRequester ? 'porter' : 'requester'}
              </p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    disabled={actionLoading}
                    className={`text-3xl transition ${
                      star <= rating ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
          )}

          {ratingSubmitted && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm text-center">
              ✅ Rating submitted successfully!
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest } from '../api/requests';
import { useCelebration } from '../context/CelebrationContext';
import Navbar from '../components/Navbar';

const LOCATIONS = [
  'Fresh and Green',
  'Canteen',
  'Old Mess',
  'New Mess',
  'Library',
  'LHC 1',
  'LHC 2',
  'Sports Complex',
  'PHC',
  'Hostel B1',
  'Hostel B2',
  'Hostel B3',
  'Hostel B4',
  'Hostel B5',
  'Hostel I2',
  'Hostel I3',
  'Hostel G1',
  'Hostel G2',
  'Hostel G3',
  'Hostel G4',
  'Hostel G5',
  'Hostel G6',
  'Hostel 03',
  'Hostel O4',
  'Hostel Y3',
  'Hostel Y4',
  'Laundry Berms',
  'Shamiyana',
  'Neem Cafe',
  'Genie Cafe',
  'P-gate',
  'Basics Lab',
  'Electrical Dept.',
  'Main Gate',
  'SME',
  'Jodhpur Club ',
  'Admin block',
];

const PostRequestPage = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [rewardType, setRewardType] = useState('tip');
  const [partyNote, setPartyNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { celebrate } = useCelebration();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fromLocation || !toLocation) {
      setError('Please select both locations');
      return;
    }

    if (fromLocation === toLocation) {
      setError('Pick-up and delivery locations cannot be the same');
      return;
    }

    if (!itemDescription.trim()) {
      setError('Please describe what you need');
      return;
    }

    if (rewardType === 'tip' && (!tipAmount || Number(tipAmount) < 1)) {
      setError('Please enter a valid tip amount (minimum ₹1)');
      return;
    }

    if (rewardType === 'party' && !partyNote.trim()) {
      setError('Please describe the party or treat you are offering');
      return;
    }

    setLoading(true);
    try {
      await createRequest({
        fromLocation,
        toLocation,
        itemDescription,
        rewardType,
        partyNote: rewardType === 'party' ? partyNote.trim() : '',
        tipAmount: rewardType === 'tip' ? Number(tipAmount) * 100 : 0
      });
      celebrate({ title: 'Request slung! 🚀', subtitle: 'Runners can grab it now' });
      navigate('/my-requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-cyan-50 max-w-md mx-auto">
    <div className="sling-aurora sling-aurora-1" style={{ top: '-60px', left: '-50px', width: '210px', height: '210px', background: '#60a5fa' }} />
    <div className="sling-aurora sling-aurora-2" style={{ top: '260px', right: '-60px', width: '190px', height: '190px', background: '#22d3ee' }} />

    <Navbar />

    <div className="relative z-10 px-4 pt-7 pb-28 page-enter">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
        <button
          onClick={() => navigate('/home')}
          className="sling-tap w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-600 text-lg"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-none">Post a Request</h1>
          <p className="text-slate-400 text-xs mt-1">Sling it across campus</p>
        </div>
      </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* From location */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📍 Pick-up Location
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Where should the porter go to get your item?
            </p>
            <select
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select location</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* To location */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏠 Delivery Location
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Where should the porter deliver it?
            </p>
            <select
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select location</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Item description */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🛍️ What do you need?
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Be specific — mention quantity, size, brand if needed
            </p>
            <textarea
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g. 1 Maggi noodles, 1 Pepsi 250ml, and 1 packet of chips"
              required
              maxLength={500}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {itemDescription.length}/500
            </p>
          </div>

          {/* Reward */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎁 How will you thank them?
            </label>

            {/* Reward type toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setRewardType('tip')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  rewardType === 'tip'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 text-gray-600 hover:border-blue-400'
                }`}
              >
                💰 Tip (₹)
              </button>
              <button
                type="button"
                onClick={() => setRewardType('party')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                  rewardType === 'party'
                    ? 'bg-pink-600 text-white border-pink-600'
                    : 'border-gray-200 text-gray-600 hover:border-pink-400'
                }`}
              >
                🎉 Party / Treat
              </button>
            </div>

            {rewardType === 'tip' ? (
              <>
                <p className="text-xs text-gray-400 mb-3">
                  Higher tip means faster acceptance. Suggested: ₹10 to ₹50
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="20"
                    min="1"
                    max="500"
                    className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Quick tip buttons */}
                <div className="flex gap-2 mt-3">
                  {[10, 20, 30, 50].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setTipAmount(amount)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition ${
                        Number(tipAmount) === amount
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-200 text-gray-600 hover:border-blue-400'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-3">
                  Skip the cash and promise a treat instead. You settle it in person.
                </p>
                <input
                  type="text"
                  value={partyNote}
                  onChange={(e) => setPartyNote(e.target.value)}
                  placeholder="e.g. Samosa and chai at Neem Cafe 🎉"
                  maxLength={200}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="sling-cta sling-tap w-full text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-blue-500/30 disabled:opacity-50"
          >
            <span className="relative z-10">{loading ? 'Slinging...' : 'Post Request 🚀'}</span>
          </button>

        </form>
      </div>
    </div>
  );
};

export default PostRequestPage;
const Request = require('../models/Request');
const User = require('../models/User');

// Valid state transitions - the state machine rules
const validTransitions = {
  open: ['accepted', 'cancelled'],
  accepted: ['picked_up', 'cancelled'],
  picked_up: ['delivered'],
  delivered: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

// CREATE REQUEST
const createRequest = async (req, res) => {
  try {
    const { fromLocation, toLocation, itemDescription, tipAmount } = req.body;

    // Validate required fields
    if (!fromLocation || !toLocation || !itemDescription || tipAmount === undefined) {
      return res.status(400).json({ 
        message: 'Please provide fromLocation, toLocation, itemDescription and tipAmount' 
      });
    }

    // Create request with 15 minute expiry
    const request = await Request.create({
      requester: req.user._id,
      fromLocation,
      toLocation,
      itemDescription,
      tipAmount,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
      message: 'Request created successfully',
      request
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET ALL OPEN REQUESTS
const getRequests = async (req, res) => {
  try {
    const { location, minTip, maxTip, sortBy } = req.query;

    // Build filter object
    let filter = {
      status: 'open',
      expiresAt: { $gt: new Date() },
      requester: { $ne: req.user._id }
    };

    // Filter by location if provided
    if (location) {
      filter.toLocation = { $regex: location, $options: 'i' };
    }

    // Filter by tip range if provided
    if (minTip) filter.tipAmount = { ...filter.tipAmount, $gte: Number(minTip) };
    if (maxTip) filter.tipAmount = { ...filter.tipAmount, $lte: Number(maxTip) };

    // Build sort object
    let sort = {};
    if (sortBy === 'tip') {
      sort = { tipAmount: -1 };
    } else if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    } else {
      sort = { createdAt: -1 };
    }

    const requests = await Request.find(filter)
      .sort(sort)
      .populate('requester', 'name email rating totalDeliveries')
      .limit(50);

    res.json({
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE REQUEST
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requester', 'name email rating totalDeliveries')
      .populate('porter', 'name email rating totalDeliveries');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ request });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ACCEPT REQUEST
const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Cannot accept your own request
    if (request.requester.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        message: 'You cannot accept your own request' 
      });
    }

    // Check if request is still open
    if (request.status !== 'open') {
      return res.status(400).json({ 
        message: `Request is already ${request.status}` 
      });
    }

    // Check if request has expired
    if (new Date() > request.expiresAt) {
      request.status = 'cancelled';
      await request.save();
      return res.status(400).json({ 
        message: 'Request has expired' 
      });
    }

    // Accept the request
    request.porter = req.user._id;
    request.status = 'accepted';
    await request.save();

    await request.populate('requester', 'name email');
    await request.populate('porter', 'name email');

    res.json({
      message: 'Request accepted successfully',
      request
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE STATUS
const updateStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if transition is valid
    const allowed = validTransitions[request.status];
    if (!allowed.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot move from ${request.status} to ${status}` 
      });
    }

    // Authorization checks
    const isRequester = request.requester.toString() === req.user._id.toString();
    const isPorter = request.porter && 
                     request.porter.toString() === req.user._id.toString();

    if (status === 'picked_up' || status === 'delivered') {
      if (!isPorter) {
        return res.status(403).json({ 
          message: 'Only the assigned porter can update this status' 
        });
      }
    }

    if (status === 'completed') {
      if (!isRequester) {
        return res.status(403).json({ 
          message: 'Only the requester can confirm completion' 
        });
      }
      request.completedAt = new Date();

      // Update porter's total deliveries
      await User.findByIdAndUpdate(request.porter, {
        $inc: { totalDeliveries: 1 }
      });
    }

    if (status === 'cancelled') {
      if (!isRequester && !isPorter) {
        return res.status(403).json({ 
          message: 'Only the requester or porter can cancel' 
        });
      }
      if (cancellationReason) {
        request.cancellationReason = cancellationReason;
      }
    }

    request.status = status;
    await request.save();

    res.json({
      message: `Request status updated to ${status}`,
      request
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// RATE
const rateRequest = async (req, res) => {
  try {
    const ratingNum = Number(req.body.rating);
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Can only rate completed requests' 
      });
    }

    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    const isRequester = request.requester.toString() === req.user._id.toString();
    const isPorter = request.porter.toString() === req.user._id.toString();

    if (!isRequester && !isPorter) {
      return res.status(403).json({ 
        message: 'Only participants can rate this request' 
      });
    }

    if (isRequester) {
      if (request.porterRating !== null) {
        return res.status(400).json({ 
          message: 'You have already rated this delivery' 
        });
      }
      request.porterRating = ratingNum;
      await request.save();

      const porterRequests = await Request.find({
        porter: request.porter,
        status: 'completed',
        porterRating: { $ne: null }
      });

      const totalRating = porterRequests.reduce((sum, r) => sum + r.porterRating, 0);
      const avgRating = totalRating / porterRequests.length;

      await User.findByIdAndUpdate(request.porter, { 
        rating: Math.round(avgRating * 10) / 10 
      });
    }

    if (isPorter) {
      if (request.requesterRating !== null) {
        return res.status(400).json({ 
          message: 'You have already rated this requester' 
        });
      }
      request.requesterRating = ratingNum;
      await request.save();
    }

    res.json({
      message: 'Rating submitted successfully',
      request
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET MY REQUESTS (as requester)
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id })
      .sort({ createdAt: -1 })
      .populate('porter', 'name email rating');

    res.json({ count: requests.length, requests });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET ASSIGNED REQUESTS (as porter)
const getAssignedRequests = async (req, res) => {
  try {
    const requests = await Request.find({ porter: req.user._id })
      .sort({ createdAt: -1 })
      .populate('requester', 'name email rating');

    res.json({ count: requests.length, requests });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  acceptRequest,
  updateStatus,
  rateRequest,
  getMyRequests,
  getAssignedRequests
};
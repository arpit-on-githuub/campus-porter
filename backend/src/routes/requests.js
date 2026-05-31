const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createRequest,
  getRequests,
  getRequestById,
  acceptRequest,
  updateStatus,
  rateRequest,
  getMyRequests,
  getAssignedRequests
} = require('../controllers/requestController');

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.get('/my', protect, getMyRequests);
router.get('/assigned', protect, getAssignedRequests);
router.get('/:id', protect, getRequestById);
router.patch('/:id/accept', protect, acceptRequest);
router.patch('/:id/status', protect, updateStatus);
router.post('/:id/rate', protect, rateRequest);

module.exports = router;  
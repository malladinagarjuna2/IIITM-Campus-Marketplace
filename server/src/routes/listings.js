const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  markInterest,
  getMyListings,
  enableAuction,
} = require('../controllers/listingController');

// Public routes
router.get('/', getListings);
router.get('/my', auth, getMyListings);  // must be before /:id
router.get('/:id', getListing);

// Protected routes
router.post('/', auth, createListing);
router.put('/:id', auth, updateListing);
router.delete('/:id', auth, deleteListing);
router.post('/:id/interest', auth, markInterest);
router.put('/:id/auction', auth, enableAuction);

module.exports = router;

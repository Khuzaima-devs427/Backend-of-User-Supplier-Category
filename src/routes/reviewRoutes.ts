import express from 'express';
import {
  createReview,
  getReviewsByListing,
  getReviewsByCategory,
  getReviewById,
  updateReview,
  deleteReview,
  markHelpful,
  reportReview,
  getUserReviews,
  getListingReviewStats,
  getAllReviews,
  updateReviewStatus
} from '../controllers/reviewController';

const router = express.Router();

// ============ PUBLIC ROUTES ============

// Get ALL reviews with pagination and filtering (ADD THIS ROUTE)
router.get('/', getAllReviews);

// Get reviews for a specific listing (public)
router.get('/listing/:listingId', getReviewsByListing);

// Get reviews by category (public)
router.get('/category/:categoryId', getReviewsByCategory);

// Get a single review by ID (public)
router.get('/:id', getReviewById);

// Get listing review statistics (public)
router.get('/stats/:listingId', getListingReviewStats);

// ============ PROTECTED ROUTES ============
// Note: Add your authentication middleware here

// Create a new review (protected - user must be logged in)
router.post('/', createReview);

// Update a review (protected - owner or admin)
router.put('/:id', updateReview);

// Delete a review (protected - owner or admin)
router.delete('/:id', deleteReview);

// Mark review as helpful (protected - logged in user)
router.post('/:id/helpful', markHelpful);

// Report a review (protected - logged in user)
router.post('/:id/report', reportReview);

// Get user's reviews (protected - user can see their own)
router.get('/user/reviews', getUserReviews);

// Add this route - for admin status updates only
router.put('/:id/status', updateReviewStatus);

export default router;
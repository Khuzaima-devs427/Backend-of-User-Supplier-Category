// // routes/featureListing.routes.ts
// import { Router } from 'express';
// import FeatureListingController from '../controllers/featureListingsController';

// const router = Router();

// // Public routes (for client side)
// router.get('/featured', FeatureListingController.getFeaturedListings); // Get featured listings (max 6)
// router.get('/category/:categoryId', FeatureListingController.getListingsByCategory); // Get listings by category
// router.get('/:id', FeatureListingController.getFeatureListingById); // Get single listing by ID
// router.get('/', FeatureListingController.getAllFeatureListings); // Get all listings with filters

// // Admin/protected routes
// router.post('/', FeatureListingController.createFeatureListing); // Create new listing with image upload
// router.put('/:id', FeatureListingController.updateFeatureListing); // Update listing with optional image
// router.delete('/:id', FeatureListingController.deleteFeatureListing); // Delete listing
// router.patch('/:id/toggle-featured', FeatureListingController.toggleFeaturedStatus); // Toggle featured status
// router.put('/reorder/featured', FeatureListingController.updateFeaturedOrder); // Reorder featured listings
// router.post('/bulk/status', FeatureListingController.bulkUpdateStatus);

// // Stats route (similar to your announcement pattern)
// router.get('/stats', FeatureListingController.getFeatureListingStats); // Get feature listing statistics

// export default router;





// routes/featureListing.routes.ts - VERIFY THIS
import { Router } from 'express';
import FeatureListingController from '../controllers/featureListingsController';

const router = Router();

// Public routes (for client side)
router.get('/featured', FeatureListingController.getFeaturedListings);
router.get('/category/:categoryId', FeatureListingController.getListingsByCategory);
router.get('/:id', FeatureListingController.getFeatureListingById);
router.get('/', FeatureListingController.getAllFeatureListings);

// Admin/protected routes
router.post('/', FeatureListingController.createFeatureListing);
router.put('/:id', FeatureListingController.updateFeatureListing);
router.delete('/:id', FeatureListingController.deleteFeatureListing);

// ✅ MAKE SURE THIS LINE IS ADDED:
router.patch('/:id/status', FeatureListingController.updateListingStatus);

router.patch('/:id/toggle-featured', FeatureListingController.toggleFeaturedStatus);
router.put('/reorder/featured', FeatureListingController.updateFeaturedOrder);
router.post('/bulk/status', FeatureListingController.bulkUpdateStatus);
router.get('/stats', FeatureListingController.getFeatureListingStats);

export default router;
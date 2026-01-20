import { Router } from 'express';
import {
  getAllFeatureCategories,
  getFeaturedCategories,
  getFeatureCategoryById,
  createFeatureCategory,
  updateFeatureCategory,
  deleteFeatureCategory,
  toggleFeaturedStatus,
  markAsFeatured,
  removeFromFeatured,
  getFeaturedLimitInfo,
  updateFeaturedOrder
} from '../controllers/featureCategoriesController';

const router = Router();

// Public routes (Client side)
router.get('/featured', getFeaturedCategories); // Get only featured categories for client
router.get('/', getAllFeatureCategories); // Get all categories with optional pagination/search

// Admin/protected routes
router.post('/', createFeatureCategory); // Create new feature category
router.get('/:id', getFeatureCategoryById); // Get single feature category by ID
router.put('/:id', updateFeatureCategory); // Update feature category
router.delete('/:id', deleteFeatureCategory); // Delete feature category
router.patch('/:id/toggle-featured', toggleFeaturedStatus); // Toggle featured status
router.patch('/:id/mark-featured', markAsFeatured); // Mark as featured directly
router.patch('/:id/remove-featured', removeFromFeatured); // Remove from featured
router.get('/stats/featured-limit', getFeaturedLimitInfo); // Get featured limit info

// Featured order management
router.patch('/reorder-featured', updateFeaturedOrder); // Reorder featured categories

export default router;
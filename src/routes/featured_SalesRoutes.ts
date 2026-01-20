import express from 'express';
import {
  getFeaturedSales,
  getFeaturedSaleById,
  createFeaturedSale,
  updateFeaturedSale,
  deleteFeaturedSale,
  updateFeaturedSaleStatus,
  getActiveFeaturedSales
} from '../controllers/featuredSalesController';
import { uploadProductImage } from '../config/cloudinary';

const router = express.Router();

// Public routes
router.get('/public/active', getActiveFeaturedSales);

// Get all featured sales with pagination and filters
router.get('/', getFeaturedSales);

// Get single featured sale by ID
router.get('/:id', getFeaturedSaleById);

// Create new featured sale
router.post(
  '/',
  uploadProductImage,
  createFeaturedSale
);

// Update featured sale - PUT method
router.put(
  '/:id',
  uploadProductImage,
  updateFeaturedSale
);

// Update featured sale - PATCH method (for partial updates)
router.patch(
  '/:id',
  uploadProductImage,
  updateFeaturedSale
);

// Update status only
router.patch(
  '/:id/status',
  updateFeaturedSaleStatus
);

// Delete featured sale
router.delete(
  '/:id',
  deleteFeaturedSale
);

export default router;
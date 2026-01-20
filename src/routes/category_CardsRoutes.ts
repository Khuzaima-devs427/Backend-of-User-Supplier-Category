import express from 'express';
import {
  getCategoryCards,
  getCategoryCardById,
  createCategoryCard,
  updateCategoryCard,
  deleteCategoryCard,
  updateCategoryCardStatus,
  getActiveCategoryCards
} from '../controllers/categoryCardController';
import { uploadProductImage } from '../config/cloudinary';

const router = express.Router();

// Public routes
router.get('/public/active', getActiveCategoryCards);

// Get all category cards with pagination and filters
router.get('/', getCategoryCards);

// Get single category card by ID
router.get('/:id', getCategoryCardById);

// Create new category card
router.post(
  '/',
  uploadProductImage,
  createCategoryCard
);

// Update category card - PUT method
router.put(
  '/:id',
  uploadProductImage,
  updateCategoryCard
);

// Update category card - PATCH method (for partial updates)
router.patch(
  '/:id',
  uploadProductImage,
  updateCategoryCard
);

// Update status only
router.patch(
  '/:id/status',
  updateCategoryCardStatus
);

// Delete category card
router.delete(
  '/:id',
  deleteCategoryCard
);

export default router;
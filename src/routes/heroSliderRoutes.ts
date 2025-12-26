// routes/heroSliderRoutes.js
const express = require('express');
const router = express.Router();
const heroSliderController = require('../controllers/heroSliderController');
const { uploadProductImage } = require('../config/cloudinary');

// Public routes
router.get('/public/active', heroSliderController.getActiveHeroSliders);

// Get all hero sliders with pagination and filters
router.get('/', heroSliderController.getHeroSliders);

// Get single hero slider by ID
router.get('/:id', heroSliderController.getHeroSliderById);

// Create new hero slider
router.post(
  '/',
  uploadProductImage,
  heroSliderController.createHeroSlider
);

// Update hero slider - PUT method
router.put(
  '/:id',
  uploadProductImage,
  heroSliderController.updateHeroSlider
);

// ✅ ADD THIS: Update hero slider - PATCH method (for partial updates)
router.patch(
  '/:id',
  uploadProductImage,
  heroSliderController.updateHeroSlider // Use the same controller
);

// Update status only
router.patch(
  '/:id/status',
  heroSliderController.updateHeroSliderStatus
);

// Delete hero slider
router.delete(
  '/:id',
  heroSliderController.deleteHeroSlider
);

module.exports = router;
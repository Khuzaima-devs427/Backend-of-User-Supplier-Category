const expressValidator = require('express-validator');
const { body, param } = expressValidator;

// Validation for creating hero slider
export const createHeroSliderValidation = [
  body('image')
    .notEmpty().withMessage('Image is required')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_host: true
    }).withMessage('Image must be a valid URL')
    .custom((value) => {
      // Optional: Validate that it's a Cloudinary URL or image URL
      const cloudinaryRegex = /cloudinary\.com/;
      const imageExtensionRegex = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
      
      if (cloudinaryRegex.test(value) || imageExtensionRegex.test(value)) {
        return true;
      }
      
      // Allow any valid URL, but show warning
      console.warn('Image URL may not be an image:', value);
      return true; // Still accept it, but backend will handle errors
    })
    .trim(),
  
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot be more than 200 characters'),
  
  body('buttonText')
    .notEmpty().withMessage('Button text is required')
    .trim()
    .isLength({ max: 50 }).withMessage('Button text cannot be more than 50 characters'),
  
  body('buttonLink')
    .notEmpty().withMessage('Button link is required')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_host: true
    }).withMessage('Button link must be a valid URL')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),
  
  body('displayOrder')
    .notEmpty().withMessage('Display order is required')
    .isInt({ min: 1 }).withMessage('Display order must be a positive integer')
];

// Validation for updating hero slider
export const updateHeroSliderValidation = [
  param('id')
    .notEmpty().withMessage('Hero slider ID is required')
    .isMongoId().withMessage('Invalid hero slider ID'),
  
  body('image')
    .optional()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_host: true
    }).withMessage('Image must be a valid URL')
    .custom((value) => {
      if (!value) return true;
      
      // Optional: Validate that it's a Cloudinary URL or image URL
      const cloudinaryRegex = /cloudinary\.com/;
      const imageExtensionRegex = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
      
      if (cloudinaryRegex.test(value) || imageExtensionRegex.test(value)) {
        return true;
      }
      
      console.warn('Image URL may not be an image:', value);
      return true;
    })
    .trim(),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot be more than 200 characters'),
  
  body('buttonText')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Button text cannot be more than 50 characters'),
  
  body('buttonLink')
    .optional()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_host: true
    }).withMessage('Button link must be a valid URL')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 1 }).withMessage('Display order must be a positive integer')
];

// Validation for updating status only
export const updateStatusValidation = [
  param('id')
    .notEmpty().withMessage('Hero slider ID is required')
    .isMongoId().withMessage('Invalid hero slider ID'),
  
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive')
];

// Type definitions for validation results
export interface ValidationError {
  location: string;
  param: string;
  value?: string;
  msg: string;
}

export interface ValidationResult {
  errors: ValidationError[];
}
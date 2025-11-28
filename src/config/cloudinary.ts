// src/config/cloudinary.ts
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Load environment variables
require('dotenv').config();

// Check if environment variables are set
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('🔧 Cloudinary Configuration Check:');
console.log('Cloud Name:', cloudName || '❌ Missing');
console.log('API Key:', apiKey ? '✓ Set' : '❌ Missing');
console.log('API Secret:', apiSecret ? '✓ Set' : '❌ Missing');

// Check if we're in development/production
console.log('NODE_ENV:', process.env.NODE_ENV);

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration incomplete!');
  console.error('💡 Please check your .env file for CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
  throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
}

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

console.log('✅ Cloudinary configured successfully');

// Test Cloudinary connection
cloudinary.api.ping()
  .then((result: any) => {
    console.log('✅ Cloudinary connection test passed:', result);
  })
  .catch((error: any) => {
    console.error('❌ Cloudinary connection test failed:', error.message);
  });

// Configure Multer Storage for Cloudinary
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'auth-app/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto:best' },
    ],
  },
});

// File filter for images only
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer configuration for single image
const uploadProductImage = multer({
  storage: productStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
}).single('image');

// Export configurations
export { 
  cloudinary, 
  uploadProductImage 
};
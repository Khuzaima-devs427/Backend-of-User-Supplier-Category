// // controllers/featureListing.controller.ts
// import { Request, Response } from 'express';
// import multer from 'multer';
// import FeatureListing from '../models/feature_listings';
// import FeatureCategory from '../models/featured_categories';
// import { cloudinary } from '../config/cloudinary';

// // Configure multer for memory storage (file will be in req.file)
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     // Accept images only
//     if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
//       return cb(new Error('Only image files are allowed!'));
//     }
//     cb(null, true);
//   }
// }).single('image'); // 'image' is the field name in your form-data

// // Helper function to upload file buffer to Cloudinary
// const uploadFileToCloudinary = async (fileBuffer: Buffer, filename: string): Promise<string> => {
//   try {
//     return new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: 'feature-listings',
//           public_id: `listing_${Date.now()}`,
//           resource_type: 'auto',
//           transformation: [
//             { width: 800, height: 600, crop: 'fill' },
//             { quality: 'auto:good' }
//           ]
//         },
//         (error, result) => {
//           if (error) {
//             reject(new Error(`Cloudinary upload failed: ${error.message}`));
//           } else {
//             resolve(result.secure_url);
//           }
//         }
//       );
      
//       uploadStream.end(fileBuffer);
//     });
//   } catch (error) {
//     console.error('Upload to Cloudinary error:', error);
//     throw new Error('Failed to upload image to Cloudinary');
//   }
// };

// // Helper function to delete image from Cloudinary
// const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
//   try {
//     if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
//       console.log('Not a Cloudinary URL, skipping deletion:', imageUrl);
//       return;
//     }
    
//     // Extract public_id from Cloudinary URL
//     const urlParts = imageUrl.split('/');
//     const uploadIndex = urlParts.indexOf('upload');
//     const publicIdParts = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
//     const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension
    
//     console.log('Deleting image from Cloudinary with public_id:', publicId);
    
//     await cloudinary.uploader.destroy(publicId);
//     console.log('✅ Image deleted from Cloudinary');
//   } catch (error) {
//     console.warn('⚠️ Could not delete image from Cloudinary:', error);
//     // Don't throw error, continue with operation
//   }
// };

// class FeatureListingController {
  
//   /**
//    * Create a new feature listing with file upload
//    */
//   static createFeatureListing = async (req: Request, res: Response) => {
//     // First handle the file upload
//     upload(req, res, async (err) => {
//       if (err) {
//         return res.status(400).json({
//           success: false,
//           message: err.message || 'File upload error'
//         });
//       }

//       try {
//         const { name, description, price, featureCategory, status = 'active', isFeatured = false } = req.body;
        
//         // Validate required fields
//         if (!name || !description || !price || !featureCategory) {
//           return res.status(400).json({
//             success: false,
//             message: 'Name, description, price, and feature category are required'
//           });
//         }
        
//         // Check if file was uploaded
//         if (!req.file) {
//           return res.status(400).json({
//             success: false,
//             message: 'Image file is required'
//           });
//         }
        
//         // Validate price
//         const priceNum = parseFloat(price);
//         if (isNaN(priceNum) || priceNum < 0) {
//           return res.status(400).json({
//             success: false,
//             message: 'Price must be a valid positive number'
//           });
//         }
        
//         // Check if feature category exists
//         const category = await FeatureCategory.findById(featureCategory);
//         if (!category) {
//           return res.status(404).json({
//             success: false,
//             message: 'Feature category not found'
//           });
//         }
        
//         // Check if category is active
//         if (category.status !== 'active') {
//           return res.status(400).json({
//             success: false,
//             message: 'Cannot create listing for inactive feature category'
//           });
//         }
        
//         // Upload image to Cloudinary
//         const imageUrl = await uploadFileToCloudinary(req.file.buffer, req.file.originalname);
        
//         // Create new feature listing
//         const newListing = new FeatureListing({
//           name,
//           description,
//           image: imageUrl,
//           price: priceNum,
//           featureCategory,
//           status,
//           isFeatured: isFeatured === 'true' || isFeatured === true
//         });
        
//         await newListing.save();
        
//         // Populate category details
//         await newListing.populate('featureCategory', 'name description type');
        
//         return res.status(201).json({
//           success: true,
//           message: 'Feature listing created successfully',
//           data: newListing
//         });
        
//       } catch (error: any) {
//         console.error('Create feature listing error:', error);
//         return res.status(500).json({
//           success: false,
//           message: error.message || 'Failed to create feature listing',
//           error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//       }
//     });
//   };
  
//   /**
//    * Update feature listing with optional file upload
//    */
// /**
//  * Update feature listing with optional file upload - FIXED VERSION
//  */
// static updateFeatureListing = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { name, description, price, featureCategory, status, isFeatured } = req.body;
    
//     console.log('🔄 Update request received:', {
//       id,
//       body: req.body,
//       hasFile: !!req.file,
//       contentType: req.headers['content-type']
//     });
    
//     // Find existing listing
//     const existingListing = await FeatureListing.findById(id);
//     if (!existingListing) {
//       return res.status(404).json({
//         success: false,
//         message: 'Feature listing not found'
//       });
//     }
    
//     // Validate price if provided
//     if (price !== undefined) {
//       const priceNum = parseFloat(price);
//       if (isNaN(priceNum) || priceNum < 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Price must be a valid positive number'
//         });
//       }
//     }
    
//     // Validate category if provided
//     if (featureCategory) {
//       const category = await FeatureCategory.findById(featureCategory);
//       if (!category) {
//         return res.status(404).json({
//           success: false,
//           message: 'Feature category not found'
//         });
//       }
      
//       if (category.status !== 'active') {
//         return res.status(400).json({
//           success: false,
//           message: 'Cannot link to inactive feature category'
//         });
//       }
//     }
    
//     // Check if this is a multipart/form-data request (has file)
//     const contentType = req.headers['content-type'] || '';
//     const isMultipart = contentType.includes('multipart/form-data');
    
//     let imageUrl = existingListing.image;
    
//     // Only process file upload if it's a multipart request AND has a file
//     if (isMultipart && req.file) {
//       console.log('📁 Processing file upload in update');
      
//       // Delete old image from Cloudinary if it's a Cloudinary URL
//       if (existingListing.image && existingListing.image.includes('cloudinary.com')) {
//         await deleteFromCloudinary(existingListing.image);
//       }
      
//       // Upload new image
//       imageUrl = await uploadFileToCloudinary(req.file.buffer, req.file.originalname);
//     } else {
//       console.log('📝 Text-only update (no file)');
//     }
    
//     // Prepare update data
//     const updateData: any = {
//       ...(name && { name }),
//       ...(description !== undefined && { description }),
//       ...(price !== undefined && { price: parseFloat(price) }),
//       ...(featureCategory && { featureCategory }),
//       ...(status && { status }),
//       ...(isFeatured !== undefined && { 
//         isFeatured: isFeatured === 'true' || isFeatured === true 
//       })
//     };
    
//     // Add image if it was updated
//     if (isMultipart && req.file) {
//       updateData.image = imageUrl;
//     }
    
//     console.log('📦 Update data to apply:', updateData);
    
//     // Update the listing
//     const updatedListing = await FeatureListing.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate('featureCategory', 'name description type status');
    
//     console.log('✅ Listing updated successfully:', updatedListing._id);
    
//     return res.status(200).json({
//       success: true,
//       message: 'Feature listing updated successfully',
//       data: updatedListing
//     });
    
//   } catch (error: any) {
//     console.error('❌ Update feature listing error:', error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to update feature listing',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };
  
//   /**
//    * Get all feature listings with pagination and filters
//    */
//   static async getAllFeatureListings(req: Request, res: Response) {
//     try {
//       // Pagination
//       const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 10;
//       const skip = (page - 1) * limit;
      
//       // Filters
//       const filter: any = {};
      
//       // Status filter
//       if (req.query.status) {
//         filter.status = req.query.status;
//       }
      
//       // Featured filter
//       if (req.query.isFeatured !== undefined) {
//         filter.isFeatured = req.query.isFeatured === 'true';
//       }
      
//       // Category filter
//       if (req.query.category) {
//         filter.featureCategory = req.query.category;
//       }
      
//       // Price range filter
//       if (req.query.minPrice || req.query.maxPrice) {
//         filter.price = {};
//         if (req.query.minPrice) {
//           filter.price.$gte = parseFloat(req.query.minPrice as string);
//         }
//         if (req.query.maxPrice) {
//           filter.price.$lte = parseFloat(req.query.maxPrice as string);
//         }
//       }
      
//       // Search by name
//       if (req.query.search) {
//         filter.name = { $regex: req.query.search, $options: 'i' };
//       }
      
//       // Sorting
//       let sort: any = { createdAt: -1 }; // Default sort by latest
//       if (req.query.sortBy) {
//         const sortBy = req.query.sortBy as string;
//         const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        
//         if (['name', 'price', 'createdAt', 'featuredOrder'].includes(sortBy)) {
//           sort = { [sortBy]: sortOrder };
//         }
        
//         // Special case for featured order (only for featured items)
//         if (sortBy === 'featuredOrder') {
//           filter.isFeatured = true;
//         }
//       }
      
//       // Execute query with population
//       const [listings, total] = await Promise.all([
//         FeatureListing.find(filter)
//           .populate('featureCategory', 'name description type status')
//           .sort(sort)
//           .skip(skip)
//           .limit(limit),
//         FeatureListing.countDocuments(filter)
//       ]);
      
//       const totalPages = Math.ceil(total / limit);
      
//       return res.status(200).json({
//         success: true,
//         message: 'Feature listings retrieved successfully',
//         data: {
//           listings,
//           pagination: {
//             page,
//             limit,
//             total,
//             totalPages,
//             hasNextPage: page < totalPages,
//             hasPrevPage: page > 1
//           },
//           filters: {
//             ...filter,
//             search: req.query.search || null
//           }
//         }
//       });
      
//     } catch (error: any) {
//       console.error('Get all feature listings error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve feature listings',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }
  
//   /**
//    * Get single feature listing by ID
//    */
//   static async getFeatureListingById(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
      
//       const listing = await FeatureListing.findById(id)
//         .populate('featureCategory', 'name description type status');
      
//       if (!listing) {
//         return res.status(404).json({
//           success: false,
//           message: 'Feature listing not found'
//         });
//       }
      
//       return res.status(200).json({
//         success: true,
//         message: 'Feature listing retrieved successfully',
//         data: listing
//       });
      
//     } catch (error: any) {
//       console.error('Get feature listing by ID error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve feature listing',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }
  
//   /**
//    * Delete feature listing
//    */
//   static async deleteFeatureListing(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
      
//       const listing = await FeatureListing.findById(id);
//       if (!listing) {
//         return res.status(404).json({
//           success: false,
//           message: 'Feature listing not found'
//         });
//       }
      
//       // Delete image from Cloudinary if it's a Cloudinary URL
//       if (listing.image.includes('cloudinary.com')) {
//         await deleteFromCloudinary(listing.image);
//       }
      
//       await FeatureListing.findByIdAndDelete(id);
      
//       return res.status(200).json({
//         success: true,
//         message: 'Feature listing deleted successfully'
//       });
      
//     } catch (error: any) {
//       console.error('Delete feature listing error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to delete feature listing',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }
  
//   /**
//    * Toggle featured status
//    */
//   static async toggleFeaturedStatus(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
      
//       const updatedListing = await FeatureListing.toggleFeatured(id);
      
//       if (!updatedListing) {
//         return res.status(404).json({
//           success: false,
//           message: 'Feature listing not found'
//         });
//       }
      
//       // Populate category details
//       await updatedListing.populate('featureCategory', 'name description type');
      
//       return res.status(200).json({
//         success: true,
//         message: updatedListing.isFeatured 
//           ? 'Feature listing marked as featured' 
//           : 'Feature listing removed from featured',
//         data: updatedListing
//       });
      
//     } catch (error: any) {
//       console.error('Toggle featured status error:', error);
      
//       if (error.message.includes('Maximum 6 featured listings reached')) {
//         return res.status(400).json({
//           success: false,
//           message: error.message
//         });
//       }
      
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to toggle featured status',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }
  
//   /**
//    * Get listings by feature category
//    */
// /**
//  * Get listings by feature category - FIXED VERSION
//  */
// static async getListingsByCategory(req: Request, res: Response) {
//   try {
//     const { categoryId } = req.params;
    
//     // Pagination
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 100; // Increased to 100
//     const skip = (page - 1) * limit;
    
//     console.log('🔍 DEBUG: Getting listings for category:', categoryId);
//     console.log('🔍 DEBUG: Query params:', req.query);
    
//     // Check if category exists
//     const category = await FeatureCategory.findById(categoryId);
//     if (!category) {
//       console.log('❌ Category not found:', categoryId);
//       return res.status(404).json({
//         success: false,
//         message: 'Feature category not found'
//       });
//     }
    
//     console.log('✅ Category found:', category.name);
    
//     // Filters - FIXED: Don't hardcode status
//     const filter: any = {
//       featureCategory: categoryId
//       // REMOVED: status: 'active' ← Don't hardcode this
//     };
    
//     // Status filter - ADD THIS
//     if (req.query.status) {
//       filter.status = req.query.status;
//       console.log('🔍 Applying status filter:', req.query.status);
//     } else {
//       // If no status filter provided, get ALL listings regardless of status
//       console.log('🔍 No status filter - getting ALL listings (active + inactive)');
//     }
    
//     // Featured filter
//     if (req.query.isFeatured !== undefined) {
//       filter.isFeatured = req.query.isFeatured === 'true';
//     }
    
//     // Price range filter
//     if (req.query.minPrice || req.query.maxPrice) {
//       filter.price = {};
//       if (req.query.minPrice) {
//         filter.price.$gte = parseFloat(req.query.minPrice as string);
//       }
//       if (req.query.maxPrice) {
//         filter.price.$lte = parseFloat(req.query.maxPrice as string);
//       }
//     }
    
//     // Sorting
//     let sort: any = { createdAt: -1 };
//     if (req.query.sortBy === 'price') {
//       const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
//       sort = { price: sortOrder };
//     }
    
//     console.log('🔍 Final filter:', JSON.stringify(filter, null, 2));
    
//     const [listings, total] = await Promise.all([
//       FeatureListing.find(filter)
//         .populate('featureCategory', 'name description type')
//         .sort(sort)
//         .skip(skip)
//         .limit(limit),
//       FeatureListing.countDocuments(filter)
//     ]);
    
//     console.log(`✅ Found ${listings.length} listings out of ${total} total`);
    
//     const totalPages = Math.ceil(total / limit);
    
//     return res.status(200).json({
//       success: true,
//       message: 'Category listings retrieved successfully',
//       data: {
//         category: {
//           id: category._id,
//           name: category.name,
//           description: category.description,
//           type: category.type,
//           status: category.status
//         },
//         listings,
//         pagination: {
//           page,
//           limit,
//           total,
//           totalPages,
//           hasNextPage: page < totalPages,
//           hasPrevPage: page > 1
//         },
//         filtersApplied: filter
//       }
//     });
    
//   } catch (error: any) {
//     console.error('❌ Get listings by category error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve category listings',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// }
  
//   /**
//    * Get featured listings (max 6 for client side)
//    */
//   static async getFeaturedListings(req: Request, res: Response) {
//     try {
//       const featuredListings = await FeatureListing.getFeaturedListings();
      
//       return res.status(200).json({
//         success: true,
//         message: 'Featured listings retrieved successfully',
//         data: featuredListings,
//         count: featuredListings.length
//       });
      
//     } catch (error: any) {
//       console.error('Get featured listings error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve featured listings',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }
  
//   /**
//    * Update featured order (rearrange featured listings)
//    */
//   static async updateFeaturedOrder(req: Request, res: Response) {
//     try {
//       const { orders } = req.body; // Array of { id, featuredOrder }
      
//       if (!Array.isArray(orders)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Orders must be an array'
//         });
//       }
      
//       // Validate orders
//       const usedOrders = new Set<number>();
//       for (const order of orders) {
//         if (order.featuredOrder < 1 || order.featuredOrder > 6) {
//           return res.status(400).json({
//             success: false,
//             message: 'Featured order must be between 1 and 6'
//           });
//         }
        
//         if (usedOrders.has(order.featuredOrder)) {
//           return res.status(400).json({
//             success: false,
//             message: 'Duplicate featured order found'
//           });
//         }
//         usedOrders.add(order.featuredOrder);
//       }
      
//       // Update orders in transaction
//       const session = await FeatureListing.startSession();
//       session.startTransaction();
      
//       try {
//         for (const order of orders) {
//           await FeatureListing.findByIdAndUpdate(
//             order.id,
//             { featuredOrder: order.featuredOrder },
//             { session }
//           );
//         }
        
//         await session.commitTransaction();
        
//         // Get updated featured listings
//         const updatedListings = await FeatureListing.getFeaturedListings();
        
//         return res.status(200).json({
//           success: true,
//           message: 'Featured order updated successfully',
//           data: updatedListings
//         });
        
//       } catch (error) {
//         await session.abortTransaction();
//         throw error;
//       } finally {
//         session.endSession();
//       }
      
//     } catch (error: any) {
//       console.error('Update featured order error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to update featured order',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }
  
//   /**
//    * Bulk update status (activate/deactivate multiple listings)
//    */
//   static async bulkUpdateStatus(req: Request, res: Response) {
//     try {
//       const { ids, status } = req.body;
      
//       if (!Array.isArray(ids) || ids.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'IDs array is required'
//         });
//       }
      
//       if (!['active', 'inactive'].includes(status)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Status must be either "active" or "inactive"'
//         });
//       }
      
//       const result = await FeatureListing.updateMany(
//         { _id: { $in: ids } },
//         { status }
//       );
      
//       return res.status(200).json({
//         success: true,
//         message: `${result.modifiedCount} listings updated successfully`,
//         data: {
//           modifiedCount: result.modifiedCount
//         }
//       });
      
//     } catch (error: any) {
//       console.error('Bulk update status error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to bulk update status',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }
  
//   /**
//    * Get feature listing statistics
//    */
//   static async getFeatureListingStats(req: Request, res: Response) {
//     try {
//       const [
//         totalListings,
//         activeListings,
//         featuredListings,
//         inactiveListings,
//         listingsByCategory
//       ] = await Promise.all([
//         FeatureListing.countDocuments(),
//         FeatureListing.countDocuments({ status: 'active' }),
//         FeatureListing.countDocuments({ isFeatured: true, status: 'active' }),
//         FeatureListing.countDocuments({ status: 'inactive' }),
//         FeatureListing.aggregate([
//           {
//             $group: {
//               _id: '$featureCategory',
//               count: { $sum: 1 },
//               activeCount: {
//                 $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
//               },
//               featuredCount: {
//                 $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
//               }
//             }
//           },
//           {
//             $lookup: {
//               from: 'featuredcategories', // Your FeatureCategory collection name
//               localField: '_id',
//               foreignField: '_id',
//               as: 'category'
//             }
//           },
//           {
//             $unwind: '$category'
//           },
//           {
//             $project: {
//               categoryId: '$_id',
//               categoryName: '$category.name',
//               categoryType: '$category.type',
//               totalCount: '$count',
//               activeCount: 1,
//               featuredCount: 1
//             }
//           },
//           {
//             $sort: { totalCount: -1 }
//           }
//         ])
//       ]);

//       // Calculate percentages
//       const activePercentage = totalListings > 0 ? (activeListings / totalListings * 100).toFixed(2) : 0;
//       const featuredPercentage = activeListings > 0 ? (featuredListings / activeListings * 100).toFixed(2) : 0;

//       return res.status(200).json({
//         success: true,
//         message: 'Feature listing stats retrieved successfully',
//         data: {
//           totals: {
//             total: totalListings,
//             active: activeListings,
//             featured: featuredListings,
//             inactive: inactiveListings
//           },
//           percentages: {
//             active: `${activePercentage}%`,
//             featured: `${featuredPercentage}%`,
//             inactive: totalListings > 0 ? `${((inactiveListings / totalListings) * 100).toFixed(2)}%` : '0%'
//           },
//           byCategory: listingsByCategory,
//           featuredLimit: {
//             current: featuredListings,
//             max: 6,
//             available: 6 - featuredListings
//           }
//         }
//       });
//     } catch (error: any) {
//       console.error('Get feature listing stats error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve feature listing stats',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }
// }

// export default FeatureListingController;













// controllers/featureListing.controller.ts
import { Request, Response } from 'express';
import multer from 'multer';
import FeatureListing from '../models/feature_listings';
import FeatureCategory from '../models/featured_categories';
import { cloudinary } from '../config/cloudinary';

// Configure multer for memory storage (file will be in req.file)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
}).single('image'); // 'image' is the field name in your form-data

// Helper function to upload file buffer to Cloudinary
const uploadFileToCloudinary = async (fileBuffer: Buffer, filename: string): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'feature-listings',
          public_id: `listing_${Date.now()}`,
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve(result.secure_url);
          }
        }
      );
      
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Upload to Cloudinary error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      console.log('Not a Cloudinary URL, skipping deletion:', imageUrl);
      return;
    }
    
    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    const publicIdParts = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
    const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension
    
    console.log('Deleting image from Cloudinary with public_id:', publicId);
    
    await cloudinary.uploader.destroy(publicId);
    console.log('✅ Image deleted from Cloudinary');
  } catch (error) {
    console.warn('⚠️ Could not delete image from Cloudinary:', error);
    // Don't throw error, continue with operation
  }
};

class FeatureListingController {
  
  /**
   * Create a new feature listing with file upload
   */
  static createFeatureListing = async (req: Request, res: Response) => {
    // First handle the file upload
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }

      try {
        const { name, description, price, featureCategory, status = 'active', isFeatured = false } = req.body;
        
        // Validate required fields
        if (!name || !description || !price || !featureCategory) {
          return res.status(400).json({
            success: false,
            message: 'Name, description, price, and feature category are required'
          });
        }
        
        // Check if file was uploaded
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'Image file is required'
          });
        }
        
        // Validate price
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) {
          return res.status(400).json({
            success: false,
            message: 'Price must be a valid positive number'
          });
        }
        
        // Check if feature category exists
        const category = await FeatureCategory.findById(featureCategory);
        if (!category) {
          return res.status(404).json({
            success: false,
            message: 'Feature category not found'
          });
        }
        
        // Check if category is active
        if (category.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: 'Cannot create listing for inactive feature category'
          });
        }
        
        // Upload image to Cloudinary
        const imageUrl = await uploadFileToCloudinary(req.file.buffer, req.file.originalname);
        
        // Create new feature listing
        const newListing = new FeatureListing({
          name,
          description,
          image: imageUrl,
          price: priceNum,
          featureCategory,
          status,
          isFeatured: isFeatured === 'true' || isFeatured === true
        });
        
        await newListing.save();
        
        // Populate category details
        await newListing.populate('featureCategory', 'name description type');
        
        return res.status(201).json({
          success: true,
          message: 'Feature listing created successfully',
          data: newListing
        });
        
      } catch (error: any) {
        console.error('Create feature listing error:', error);
        return res.status(500).json({
          success: false,
          message: error.message || 'Failed to create feature listing',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    });
  };
  
  /**
   * Update feature listing with optional file upload
   */
/**
 * Update feature listing with optional file upload - FIXED VERSION
 */
static updateFeatureListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, featureCategory, status, isFeatured } = req.body;
    
    console.log('🔄 Update request received:', {
      id,
      body: req.body,
      hasFile: !!req.file,
      contentType: req.headers['content-type']
    });
    
    // Find existing listing
    const existingListing = await FeatureListing.findById(id);
    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: 'Feature listing not found'
      });
    }
    
    // Validate price if provided
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid positive number'
        });
      }
    }
    
    // Validate category if provided
    if (featureCategory) {
      const category = await FeatureCategory.findById(featureCategory);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Feature category not found'
        });
      }
      
      if (category.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot link to inactive feature category'
        });
      }
    }
    
    // Check if this is a multipart/form-data request (has file)
    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');
    
    let imageUrl = existingListing.image;
    
    // Only process file upload if it's a multipart request AND has a file
    if (isMultipart && req.file) {
      console.log('📁 Processing file upload in update');
      
      // Delete old image from Cloudinary if it's a Cloudinary URL
      if (existingListing.image && existingListing.image.includes('cloudinary.com')) {
        await deleteFromCloudinary(existingListing.image);
      }
      
      // Upload new image
      imageUrl = await uploadFileToCloudinary(req.file.buffer, req.file.originalname);
    } else {
      console.log('📝 Text-only update (no file)');
    }
    
    // Prepare update data
    const updateData: any = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(featureCategory && { featureCategory }),
      ...(status && { status }),
      ...(isFeatured !== undefined && { 
        isFeatured: isFeatured === 'true' || isFeatured === true 
      })
    };
    
    // Add image if it was updated
    if (isMultipart && req.file) {
      updateData.image = imageUrl;
    }
    
    console.log('📦 Update data to apply:', updateData);
    
    // Update the listing
    const updatedListing = await FeatureListing.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('featureCategory', 'name description type status');
    
    console.log('✅ Listing updated successfully:', updatedListing._id);
    
    return res.status(200).json({
      success: true,
      message: 'Feature listing updated successfully',
      data: updatedListing
    });
    
  } catch (error: any) {
    console.error('❌ Update feature listing error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update feature listing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
  
  /**
   * Update feature listing status only - NEW ENDPOINT ADDED
   */
  static async updateListingStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      console.log('🔄 updateListingStatus called:', { id, status });
      
      // Validate status
      if (!['active', 'inactive'].includes(status)) {
        console.log('❌ Invalid status:', status);
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be "active" or "inactive"'
        });
      }
      
      // Check if listing exists
      const existingListing = await FeatureListing.findById(id);
      if (!existingListing) {
        console.log('❌ Feature listing not found:', id);
        return res.status(404).json({
          success: false,
          message: 'Feature listing not found'
        });
      }
      
      console.log('📋 Existing listing found:', {
        id: existingListing._id,
        currentStatus: existingListing.status,
        title: existingListing.name,
        currentFeatured: existingListing.isFeatured
      });
      
      // If status is changing to inactive and item is featured, unfeature it
      let updateData: any = { 
        status, 
        updatedAt: Date.now() 
      };
      
      if (status === 'inactive' && existingListing.isFeatured) {
        console.log('⚠️ Item is featured, unfeaturing due to inactive status');
        updateData.isFeatured = false;
      }
      
      // Update status only
      const updatedListing = await FeatureListing.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, 
          runValidators: true 
        }
      ).populate('featureCategory', 'name description type status');
      
      console.log('✅ Status updated successfully:', {
        id: updatedListing!._id,
        newStatus: updatedListing!.status,
        newFeaturedStatus: updatedListing!.isFeatured
      });
      
      return res.status(200).json({
        success: true,
        message: `Feature listing status updated to ${status}`,
        data: updatedListing
      });
      
    } catch (error: any) {
      console.error('❌ Error updating listing status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update listing status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get all feature listings with pagination and filters
   */
  static async getAllFeatureListings(req: Request, res: Response) {
    try {
      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      // Filters
      const filter: any = {};
      
      // Status filter
      if (req.query.status) {
        filter.status = req.query.status;
      }
      
      // Featured filter
      if (req.query.isFeatured !== undefined) {
        filter.isFeatured = req.query.isFeatured === 'true';
      }
      
      // Category filter
      if (req.query.category) {
        filter.featureCategory = req.query.category;
      }
      
      // Price range filter
      if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) {
          filter.price.$gte = parseFloat(req.query.minPrice as string);
        }
        if (req.query.maxPrice) {
          filter.price.$lte = parseFloat(req.query.maxPrice as string);
        }
      }
      
      // Search by name
      if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: 'i' };
      }
      
      // Sorting
      let sort: any = { createdAt: -1 }; // Default sort by latest
      if (req.query.sortBy) {
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        
        if (['name', 'price', 'createdAt', 'featuredOrder'].includes(sortBy)) {
          sort = { [sortBy]: sortOrder };
        }
        
        // Special case for featured order (only for featured items)
        if (sortBy === 'featuredOrder') {
          filter.isFeatured = true;
        }
      }
      
      // Execute query with population
      const [listings, total] = await Promise.all([
        FeatureListing.find(filter)
          .populate('featureCategory', 'name description type status')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        FeatureListing.countDocuments(filter)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return res.status(200).json({
        success: true,
        message: 'Feature listings retrieved successfully',
        data: {
          listings,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          },
          filters: {
            ...filter,
            search: req.query.search || null
          }
        }
      });
      
    } catch (error: any) {
      console.error('Get all feature listings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve feature listings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get single feature listing by ID
   */
  static async getFeatureListingById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const listing = await FeatureListing.findById(id)
        .populate('featureCategory', 'name description type status');
      
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Feature listing not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Feature listing retrieved successfully',
        data: listing
      });
      
    } catch (error: any) {
      console.error('Get feature listing by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve feature listing',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Delete feature listing
   */
  static async deleteFeatureListing(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const listing = await FeatureListing.findById(id);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Feature listing not found'
        });
      }
      
      // Delete image from Cloudinary if it's a Cloudinary URL
      if (listing.image.includes('cloudinary.com')) {
        await deleteFromCloudinary(listing.image);
      }
      
      await FeatureListing.findByIdAndDelete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Feature listing deleted successfully'
      });
      
    } catch (error: any) {
      console.error('Delete feature listing error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete feature listing',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Toggle featured status
   */
  static async toggleFeaturedStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const updatedListing = await FeatureListing.toggleFeatured(id);
      
      if (!updatedListing) {
        return res.status(404).json({
          success: false,
          message: 'Feature listing not found'
        });
      }
      
      // Populate category details
      await updatedListing.populate('featureCategory', 'name description type');
      
      return res.status(200).json({
        success: true,
        message: updatedListing.isFeatured 
          ? 'Feature listing marked as featured' 
          : 'Feature listing removed from featured',
        data: updatedListing
      });
      
    } catch (error: any) {
      console.error('Toggle featured status error:', error);
      
      if (error.message.includes('Maximum 6 featured listings reached')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to toggle featured status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get listings by feature category
   */
/**
 * Get listings by feature category - FIXED VERSION
 */
static async getListingsByCategory(req: Request, res: Response) {
  try {
    const { categoryId } = req.params;
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100; // Increased to 100
    const skip = (page - 1) * limit;
    
    console.log('🔍 DEBUG: Getting listings for category:', categoryId);
    console.log('🔍 DEBUG: Query params:', req.query);
    
    // Check if category exists
    const category = await FeatureCategory.findById(categoryId);
    if (!category) {
      console.log('❌ Category not found:', categoryId);
      return res.status(404).json({
        success: false,
        message: 'Feature category not found'
      });
    }
    
    console.log('✅ Category found:', category.name);
    
    // Filters - FIXED: Don't hardcode status
    const filter: any = {
      featureCategory: categoryId
      // REMOVED: status: 'active' ← Don't hardcode this
    };
    
    // Status filter - ADD THIS
    if (req.query.status) {
      filter.status = req.query.status;
      console.log('🔍 Applying status filter:', req.query.status);
    } else {
      // If no status filter provided, get ALL listings regardless of status
      console.log('🔍 No status filter - getting ALL listings (active + inactive)');
    }
    
    // Featured filter
    if (req.query.isFeatured !== undefined) {
      filter.isFeatured = req.query.isFeatured === 'true';
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice as string);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice as string);
      }
    }
    
    // Sorting
    let sort: any = { createdAt: -1 };
    if (req.query.sortBy === 'price') {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { price: sortOrder };
    }
    
    console.log('🔍 Final filter:', JSON.stringify(filter, null, 2));
    
    const [listings, total] = await Promise.all([
      FeatureListing.find(filter)
        .populate('featureCategory', 'name description type')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      FeatureListing.countDocuments(filter)
    ]);
    
    console.log(`✅ Found ${listings.length} listings out of ${total} total`);
    
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      success: true,
      message: 'Category listings retrieved successfully',
      data: {
        category: {
          id: category._id,
          name: category.name,
          description: category.description,
          type: category.type,
          status: category.status
        },
        listings,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filtersApplied: filter
      }
    });
    
  } catch (error: any) {
    console.error('❌ Get listings by category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve category listings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
  
  /**
   * Get featured listings (max 6 for client side)
   */
  static async getFeaturedListings(req: Request, res: Response) {
    try {
      const featuredListings = await FeatureListing.getFeaturedListings();
      
      return res.status(200).json({
        success: true,
        message: 'Featured listings retrieved successfully',
        data: featuredListings,
        count: featuredListings.length
      });
      
    } catch (error: any) {
      console.error('Get featured listings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve featured listings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Update featured order (rearrange featured listings)
   */
  static async updateFeaturedOrder(req: Request, res: Response) {
    try {
      const { orders } = req.body; // Array of { id, featuredOrder }
      
      if (!Array.isArray(orders)) {
        return res.status(400).json({
          success: false,
          message: 'Orders must be an array'
        });
      }
      
      // Validate orders
      const usedOrders = new Set<number>();
      for (const order of orders) {
        if (order.featuredOrder < 1 || order.featuredOrder > 6) {
          return res.status(400).json({
            success: false,
            message: 'Featured order must be between 1 and 6'
          });
        }
        
        if (usedOrders.has(order.featuredOrder)) {
          return res.status(400).json({
            success: false,
            message: 'Duplicate featured order found'
          });
        }
        usedOrders.add(order.featuredOrder);
      }
      
      // Update orders in transaction
      const session = await FeatureListing.startSession();
      session.startTransaction();
      
      try {
        for (const order of orders) {
          await FeatureListing.findByIdAndUpdate(
            order.id,
            { featuredOrder: order.featuredOrder },
            { session }
          );
        }
        
        await session.commitTransaction();
        
        // Get updated featured listings
        const updatedListings = await FeatureListing.getFeaturedListings();
        
        return res.status(200).json({
          success: true,
          message: 'Featured order updated successfully',
          data: updatedListings
        });
        
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
      
    } catch (error: any) {
      console.error('Update featured order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update featured order',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Bulk update status (activate/deactivate multiple listings)
   */
  static async bulkUpdateStatus(req: Request, res: Response) {
    try {
      const { ids, status } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'IDs array is required'
        });
      }
      
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "active" or "inactive"'
        });
      }
      
      const result = await FeatureListing.updateMany(
        { _id: { $in: ids } },
        { status }
      );
      
      return res.status(200).json({
        success: true,
        message: `${result.modifiedCount} listings updated successfully`,
        data: {
          modifiedCount: result.modifiedCount
        }
      });
      
    } catch (error: any) {
      console.error('Bulk update status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to bulk update status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get feature listing statistics
   */
  static async getFeatureListingStats(req: Request, res: Response) {
    try {
      const [
        totalListings,
        activeListings,
        featuredListings,
        inactiveListings,
        listingsByCategory
      ] = await Promise.all([
        FeatureListing.countDocuments(),
        FeatureListing.countDocuments({ status: 'active' }),
        FeatureListing.countDocuments({ isFeatured: true, status: 'active' }),
        FeatureListing.countDocuments({ status: 'inactive' }),
        FeatureListing.aggregate([
          {
            $group: {
              _id: '$featureCategory',
              count: { $sum: 1 },
              activeCount: {
                $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
              },
              featuredCount: {
                $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
              }
            }
          },
          {
            $lookup: {
              from: 'featuredcategories', // Your FeatureCategory collection name
              localField: '_id',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $unwind: '$category'
          },
          {
            $project: {
              categoryId: '$_id',
              categoryName: '$category.name',
              categoryType: '$category.type',
              totalCount: '$count',
              activeCount: 1,
              featuredCount: 1
            }
          },
          {
            $sort: { totalCount: -1 }
          }
        ])
      ]);

      // Calculate percentages
      const activePercentage = totalListings > 0 ? (activeListings / totalListings * 100).toFixed(2) : 0;
      const featuredPercentage = activeListings > 0 ? (featuredListings / activeListings * 100).toFixed(2) : 0;

      return res.status(200).json({
        success: true,
        message: 'Feature listing stats retrieved successfully',
        data: {
          totals: {
            total: totalListings,
            active: activeListings,
            featured: featuredListings,
            inactive: inactiveListings
          },
          percentages: {
            active: `${activePercentage}%`,
            featured: `${featuredPercentage}%`,
            inactive: totalListings > 0 ? `${((inactiveListings / totalListings) * 100).toFixed(2)}%` : '0%'
          },
          byCategory: listingsByCategory,
          featuredLimit: {
            current: featuredListings,
            max: 6,
            available: 6 - featuredListings
          }
        }
      });
    } catch (error: any) {
      console.error('Get feature listing stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve feature listing stats',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default FeatureListingController;
import { Request, Response } from 'express';
import FeaturedSale from '../models/featured-sales'; // Updated import
import mongoose from 'mongoose';
import { cloudinary } from '../config/cloudinary';

// Interface for filter object
interface FilterObject {
  status?: string;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  $or?: Array<{
    title?: { $regex: string; $options: string };
    subtitle?: { $regex: string; $options: string };
    buttonText?: { $regex: string; $options: string };
    buttonLink?: { $regex: string; $options: string };
  }>;
}

// Interface for FeaturedSale document
interface FeaturedSaleDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdBy: mongoose.Types.ObjectId | any;
  createdAt: Date;
  updatedAt: Date;
}

// Add user to Request type
declare module 'express' {
  interface Request {
    user?: {
      id: string;
    };
  }
}

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (imageData: string): Promise<string> => {
  try {
    // If it's already a Cloudinary URL or external URL, return it
    if (imageData.startsWith('http')) {
      return imageData;
    }
    
    // If it's base64, upload to Cloudinary
    if (imageData.startsWith('data:image/')) {
      console.log('Uploading base64 image to Cloudinary...');
      
      const result = await cloudinary.uploader.upload(imageData, {
        folder: 'featured-sales', // Updated folder name
        resource_type: 'image',
        transformation: [
          { width: 400, height: 300, crop: 'fill' },
          { quality: 'auto:good' }
        ]
      });
      
      console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
      return result.secure_url;
    }
    
    throw new Error('Invalid image format');
  } catch (error) {
    console.error('Cloudinary upload error:', error);
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

// @desc    Get all featured sales with pagination and filters
// @route   GET /api/featured-sales
// @access  Private
export const getFeaturedSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: FilterObject = {};
    
    // Status filter
    if (req.query.status) {
      filter.status = req.query.status as string;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search as string, $options: 'i' } },
        { subtitle: { $regex: req.query.search as string, $options: 'i' } },
        { buttonText: { $regex: req.query.search as string, $options: 'i' } },
        { buttonLink: { $regex: req.query.search as string, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalItems = await FeaturedSale.countDocuments(filter);

    // Get featured sales with pagination
    const featuredSales = await FeaturedSale.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean();

    // Format the response
    const formattedFeaturedSales = featuredSales.map((sale: any) => ({
      _id: sale._id.toString(),
      image: sale.image,
      title: sale.title,
      subtitle: sale.subtitle,
      buttonText: sale.buttonText,
      buttonLink: sale.buttonLink,
      status: sale.status,
      displayOrder: sale.displayOrder,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      createdBy: sale.createdBy?.name || 'Unknown'
    }));

    res.status(200).json({
      success: true,
      message: 'Featured sales fetched successfully',
      data: formattedFeaturedSales,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit
      }
    });
  } catch (error: any) {
    console.error('Error fetching featured sales:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured sales',
      error: error.message
    });
  }
};

// @desc    Get single featured sale
// @route   GET /api/featured-sales/:id
// @access  Private
export const getFeaturedSaleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const featuredSale = await FeaturedSale.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!featuredSale) {
      res.status(404).json({
        success: false,
        message: 'Featured sale not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Featured sale fetched successfully',
      data: {
        _id: featuredSale._id.toString(),
        image: featuredSale.image,
        title: featuredSale.title,
        subtitle: featuredSale.subtitle,
        buttonText: featuredSale.buttonText,
        buttonLink: featuredSale.buttonLink,
        status: featuredSale.status,
        displayOrder: featuredSale.displayOrder,
        createdAt: featuredSale.createdAt,
        updatedAt: featuredSale.updatedAt,
        createdBy: (featuredSale.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('Error fetching featured sale:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured sale',
      error: error.message
    });
  }
};

// @desc    Create new featured sale with Cloudinary image upload
// @route   POST /api/featured-sales
// @access  Private (Admin only)
export const createFeaturedSale = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Creating featured sale with Cloudinary...');
    console.log('🔍 Request file:', req.file);
    console.log('🔍 Request body:', req.body);

    // Get form data fields
    const { title, subtitle, buttonText, buttonLink, status, displayOrder } = req.body;

    // Manual validation
    const validationErrors: any[] = [];
    
    // Title validation
    if (!title || title.trim() === '') {
      validationErrors.push({ param: 'title', msg: 'Title is required' });
    } else if (title.length > 100) {
      validationErrors.push({ param: 'title', msg: 'Title cannot exceed 100 characters' });
    }

    // Subtitle validation
    if (!subtitle || subtitle.trim() === '') {
      validationErrors.push({ param: 'subtitle', msg: 'Subtitle is required' });
    } else if (subtitle.length > 200) {
      validationErrors.push({ param: 'subtitle', msg: 'Subtitle cannot exceed 200 characters' });
    }

    // Button text validation
    if (!buttonText || buttonText.trim() === '') {
      validationErrors.push({ param: 'buttonText', msg: 'Button text is required' });
    } else if (buttonText.length > 50) {
      validationErrors.push({ param: 'buttonText', msg: 'Button text cannot exceed 50 characters' });
    }

    // Button link validation
    if (!buttonLink || buttonLink.trim() === '') {
      validationErrors.push({ param: 'buttonLink', msg: 'Button link is required' });
    } else if (!buttonLink.startsWith('http')) {
      validationErrors.push({ param: 'buttonLink', msg: 'Button link must be a valid URL starting with http:// or https://' });
    }

    // Display order validation
    if (!displayOrder || isNaN(Number(displayOrder)) || Number(displayOrder) < 1) {
      validationErrors.push({ param: 'displayOrder', msg: 'Display order must be a positive integer' });
    }

    // Image validation
    if (!req.file) {
      validationErrors.push({ param: 'image', msg: 'Image file is required' });
    }

    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }

    let imageUrl = '';
    
    // Handle image from file upload (Cloudinary)
    if (req.file) {
      imageUrl = (req.file as any).path;
      console.log('✅ Cloudinary image URL:', imageUrl);
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      // Handle base64 image from JSON request
      try {
        console.log('📤 Uploading base64 image to Cloudinary...');
        imageUrl = await uploadToCloudinary(req.body.image);
        console.log('✅ Uploaded base64 to Cloudinary:', imageUrl);
      } catch (uploadError: any) {
        console.error('❌ Cloudinary upload error:', uploadError);
        res.status(400).json({
          success: false,
          message: `Image upload failed: ${uploadError.message}`
        });
        return;
      }
    } else {
      console.log('❌ No image provided');
      res.status(400).json({
        success: false,
        message: 'Image is required. Please provide an image file or base64 string.'
      });
      return;
    }

    // Check if display order already exists
    const existingOrder = await FeaturedSale.findOne({ displayOrder: Number(displayOrder) });
    if (existingOrder) {
      console.log('❌ Display order conflict:', displayOrder);
      res.status(400).json({
        success: false,
        message: 'Display order already exists. Please choose a different order.'
      });
      return;
    }

    // Prepare featured sale data
    const featuredSaleData: any = {
      image: imageUrl,
      title: title.trim(),
      subtitle: subtitle.trim(),
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim(),
      status: status || 'active',
      displayOrder: Number(displayOrder)
    };

    // Only include createdBy if we have a valid user ID
    if (req.user?.id) {
      featuredSaleData.createdBy = req.user.id;
    }

    // Create new featured sale
    const newFeaturedSale = new FeaturedSale(featuredSaleData);
    await newFeaturedSale.save();

    // Populate createdBy info if it exists
    if (newFeaturedSale.createdBy) {
      await newFeaturedSale.populate('createdBy', 'name email');
    }

    console.log('✅ Featured sale created successfully:', newFeaturedSale._id);

    res.status(201).json({
      success: true,
      message: 'Featured sale created successfully',
      data: {
        _id: newFeaturedSale._id.toString(),
        image: newFeaturedSale.image,
        title: newFeaturedSale.title,
        subtitle: newFeaturedSale.subtitle,
        buttonText: newFeaturedSale.buttonText,
        buttonLink: newFeaturedSale.buttonLink,
        status: newFeaturedSale.status,
        displayOrder: newFeaturedSale.displayOrder,
        createdAt: newFeaturedSale.createdAt,
        updatedAt: newFeaturedSale.updatedAt,
        createdBy: (newFeaturedSale.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('❌ Error creating featured sale:', error);
    
    // Handle duplicate key error for displayOrder
    if (error.code === 11000 && error.keyPattern?.displayOrder) {
      res.status(400).json({
        success: false,
        message: 'Display order already exists. Please choose a different order.'
      });
      return;
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating featured sale',
      error: error.message
    });
  }
};

// @desc    Update featured sale with Cloudinary support
// @route   PATCH /api/featured-sales/:id
// @access  Private (Admin only)
export const updateFeaturedSale = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Updating featured sale with Cloudinary...');
    
    // Get form data
    const { title, subtitle, buttonText, buttonLink, status, displayOrder } = req.body;

    // Check if featured sale exists
    const existingSale = await FeaturedSale.findById(req.params.id);
    if (!existingSale) {
      res.status(404).json({
        success: false,
        message: 'Featured sale not found'
      });
      return;
    }

    console.log('📊 Existing featured sale image:', existingSale.image);

    let imageUrl = existingSale.image;

    // Handle new image if provided
    if (req.file) {
      // Get Cloudinary URL from uploaded file
      imageUrl = (req.file as any).path;
      console.log('✅ New Cloudinary image URL:', imageUrl);
      
      // Delete old image from Cloudinary if new image was uploaded
      if (existingSale.image && imageUrl && existingSale.image !== imageUrl) {
        await deleteFromCloudinary(existingSale.image);
      }
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      // Handle base64 image update
      try {
        console.log('📤 Uploading new base64 image to Cloudinary...');
        const newImageUrl = await uploadToCloudinary(req.body.image);
        console.log('✅ Uploaded new image to Cloudinary:', newImageUrl);
        
        // Delete old image
        if (existingSale.image && existingSale.image !== newImageUrl) {
          await deleteFromCloudinary(existingSale.image);
        }
        
        imageUrl = newImageUrl;
      } catch (uploadError: any) {
        console.error('❌ Cloudinary upload error:', uploadError);
        res.status(400).json({
          success: false,
          message: `Image upload failed: ${uploadError.message}`
        });
        return;
      }
    }

    // Check if display order is being changed and if it already exists
    if (displayOrder && Number(displayOrder) !== existingSale.displayOrder) {
      const existingOrder = await FeaturedSale.findOne({ 
        displayOrder: Number(displayOrder),
        _id: { $ne: req.params.id } // Exclude current item
      });
      
      if (existingOrder) {
        res.status(400).json({
          success: false,
          message: 'Display order already exists. Please choose a different order.'
        });
        return;
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: Date.now()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle.trim();
    if (buttonText !== undefined) updateData.buttonText = buttonText.trim();
    if (buttonLink !== undefined) updateData.buttonLink = buttonLink.trim();
    if (status !== undefined) updateData.status = status;
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
    if (imageUrl) updateData.image = imageUrl;

    // Update featured sale
    const updatedSale = await FeaturedSale.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSale) {
      res.status(404).json({
        success: false,
        message: 'Featured sale not found'
      });
      return;
    }

    // Populate createdBy info
    await updatedSale.populate('createdBy', 'name email');

    console.log('✅ Featured sale updated successfully');

    res.status(200).json({
      success: true,
      message: 'Featured sale updated successfully',
      data: {
        _id: updatedSale._id.toString(),
        image: updatedSale.image,
        title: updatedSale.title,
        subtitle: updatedSale.subtitle,
        buttonText: updatedSale.buttonText,
        buttonLink: updatedSale.buttonLink,
        status: updatedSale.status,
        displayOrder: updatedSale.displayOrder,
        createdAt: updatedSale.createdAt,
        updatedAt: updatedSale.updatedAt,
        createdBy: (updatedSale.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('❌ Error updating featured sale:', error);
    
    // Handle duplicate key error for displayOrder
    if (error.code === 11000 && error.keyPattern?.displayOrder) {
      res.status(400).json({
        success: false,
        message: 'Display order already exists. Please choose a different order.'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating featured sale',
      error: error.message
    });
  }
};

// @desc    Update featured sale status only
// @route   PATCH /api/featured-sales/:id/status
// @access  Private (Admin only)
export const updateFeaturedSaleStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "inactive"'
      });
      return;
    }

    // Check if featured sale exists
    const existingSale = await FeaturedSale.findById(req.params.id);
    if (!existingSale) {
      res.status(404).json({
        success: false,
        message: 'Featured sale not found'
      });
      return;
    }

    // Update status
    const updatedSale = await FeaturedSale.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Featured sale status updated to ${status}`,
      data: {
        _id: updatedSale!._id.toString(),
        image: updatedSale!.image,
        title: updatedSale!.title,
        subtitle: updatedSale!.subtitle,
        buttonText: updatedSale!.buttonText,
        buttonLink: updatedSale!.buttonLink,
        status: updatedSale!.status,
        displayOrder: updatedSale!.displayOrder,
        createdAt: updatedSale!.createdAt,
        updatedAt: updatedSale!.updatedAt,
        createdBy: (updatedSale!.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('Error updating featured sale status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating featured sale status',
      error: error.message
    });
  }
};

// @desc    Delete featured sale with Cloudinary cleanup
// @route   DELETE /api/featured-sales/:id
// @access  Private (Admin only)
export const deleteFeaturedSale = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Deleting featured sale...');

    // Check if featured sale exists
    const featuredSale = await FeaturedSale.findById(req.params.id);
    if (!featuredSale) {
      res.status(404).json({
        success: false,
        message: 'Featured sale not found'
      });
      return;
    }

    // Delete image from Cloudinary if it exists
    if (featuredSale.image) {
      await deleteFromCloudinary(featuredSale.image);
    }

    // Delete featured sale
    await FeaturedSale.findByIdAndDelete(req.params.id);

    console.log('✅ Featured sale deleted successfully:', featuredSale.title);

    res.status(200).json({
      success: true,
      message: 'Featured sale deleted successfully',
      data: {
        _id: featuredSale._id.toString(),
        title: featuredSale.title,
        subtitle: featuredSale.subtitle
      }
    });
  } catch (error: any) {
    console.error('❌ Error deleting featured sale:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting featured sale',
      error: error.message
    });
  }
};

// @desc    Get active featured sales for public display
// @route   GET /api/featured-sales/public/active
// @access  Public
export const getActiveFeaturedSales = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 Fetching active featured sales for public display');
    
    const activeSales = await FeaturedSale.find({ status: 'active' })
      .sort({ displayOrder: 1 })
      .select('image title subtitle buttonText buttonLink displayOrder')
      .lean();

    console.log(`✅ Found ${activeSales.length} active featured sales`);

    res.status(200).json({
      success: true,
      message: 'Active featured sales fetched successfully',
      data: activeSales
    });
  } catch (error: any) {
    console.error('❌ Error fetching active featured sales:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active featured sales',
      error: error.message
    });
  }
};
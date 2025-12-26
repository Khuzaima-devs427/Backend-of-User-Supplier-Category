// controllers/heroSliderController.ts
import { Request, Response } from 'express';
import HeroSlider from '../models/HeroSlider';
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
    buttonText?: { $regex: string; $options: string };
    buttonLink?: { $regex: string; $options: string };
  }>;
}

// Interface for HeroSlider document
interface HeroSliderDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  image: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdBy: mongoose.Types.ObjectId | any;
  createdAt: Date;
  updatedAt: Date;
}

// Remove the global declaration and use module augmentation instead
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
        folder: 'hero-sliders',
        resource_type: 'image',
        transformation: [
          { width: 1920, height: 1080, crop: 'fill' },
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

// @desc    Get all hero slider items with pagination and filters
// @route   GET /api/hero-slider
// @access  Private
export const getHeroSliders = async (req: Request, res: Response): Promise<void> => {
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
        { buttonText: { $regex: req.query.search as string, $options: 'i' } },
        { buttonLink: { $regex: req.query.search as string, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalItems = await HeroSlider.countDocuments(filter);

    // Get hero slider items with pagination
    const heroSliders = await HeroSlider.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email') // Populate user info
      .lean();

    // Format the response
    const formattedHeroSliders = heroSliders.map((slider: any) => ({
      _id: slider._id.toString(),
      image: slider.image,
      title: slider.title,
      buttonText: slider.buttonText,
      buttonLink: slider.buttonLink,
      status: slider.status,
      displayOrder: slider.displayOrder,
      createdAt: slider.createdAt,
      updatedAt: slider.updatedAt,
      createdBy: slider.createdBy?.name || 'Unknown'
    }));

    res.status(200).json({
      success: true,
      message: 'Hero sliders fetched successfully',
      data: formattedHeroSliders,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit
      }
    });
  } catch (error: any) {
    console.error('Error fetching hero sliders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hero sliders',
      error: error.message
    });
  }
};

// @desc    Get single hero slider item
// @route   GET /api/hero-slider/:id
// @access  Private
export const getHeroSliderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const heroSlider = await HeroSlider.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!heroSlider) {
      res.status(404).json({
        success: false,
        message: 'Hero slider item not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Hero slider fetched successfully',
      data: {
        _id: heroSlider._id.toString(),
        image: heroSlider.image,
        title: heroSlider.title,
        buttonText: heroSlider.buttonText,
        buttonLink: heroSlider.buttonLink,
        status: heroSlider.status,
        displayOrder: heroSlider.displayOrder,
        createdAt: heroSlider.createdAt,
        updatedAt: heroSlider.updatedAt,
        createdBy: (heroSlider.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('Error fetching hero slider:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hero slider',
      error: error.message
    });
  }
};

// @desc    Create new hero slider item with Cloudinary image upload
// @route   POST /api/hero-slider
// @access  Private (Admin only)
export const createHeroSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Creating hero slider with Cloudinary...');
    console.log('🔍 Request file:', req.file);
    console.log('🔍 Request body:', req.body);

    // Since we're using file upload middleware, req.body contains text fields
    const { title, buttonText, buttonLink, status, displayOrder } = req.body;

    // TEMPORARY: Disable validation for FormData
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   res.status(400).json({
    //     success: false,
    //     message: 'Validation failed',
    //     errors: errors.array()
    //   });
    //   return;
    // }

    // Manual validation
    const validationErrors: any[] = [];
    
    if (!title || title.trim() === '') {
      validationErrors.push({ param: 'title', msg: 'Title is required' });
    } else if (title.length > 200) {
      validationErrors.push({ param: 'title', msg: 'Title cannot exceed 200 characters' });
    }

    if (!buttonText || buttonText.trim() === '') {
      validationErrors.push({ param: 'buttonText', msg: 'Button text is required' });
    } else if (buttonText.length > 50) {
      validationErrors.push({ param: 'buttonText', msg: 'Button text cannot exceed 50 characters' });
    }

    if (!buttonLink || buttonLink.trim() === '') {
      validationErrors.push({ param: 'buttonLink', msg: 'Button link is required' });
    } else if (!buttonLink.startsWith('http')) {
      validationErrors.push({ param: 'buttonLink', msg: 'Button link must be a valid URL' });
    }

    if (!displayOrder || isNaN(Number(displayOrder)) || Number(displayOrder) < 1) {
      validationErrors.push({ param: 'displayOrder', msg: 'Display order must be a positive integer' });
    }

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
      // Cloudinary URL is in req.file.path when using CloudinaryStorage
      imageUrl = (req.file as any).path;
      console.log('✅ Cloudinary image URL:', imageUrl);
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      // Handle base64 image from JSON request (for testing)
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
    const existingOrder = await HeroSlider.findOne({ displayOrder: Number(displayOrder) });
    if (existingOrder) {
      console.log('❌ Display order conflict:', displayOrder);
      res.status(400).json({
        success: false,
        message: 'Display order already exists. Please choose a different order.'
      });
      return;
    }

    // FIX: Create hero slider WITHOUT createdBy field or use a dummy value
    // If your model requires createdBy, you need to either:
    // 1. Make it optional in the model
    // 2. Use a valid ObjectId
    // 3. Don't include it
    
    const heroSliderData: any = {
      image: imageUrl,
      title: title.trim(),
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim(),
      status: status || 'active',
      displayOrder: Number(displayOrder)
    };

    // Only include createdBy if we have a valid user ID
    if (req.user?.id) {
      heroSliderData.createdBy = req.user.id;
    }
    // If not, don't include it (model should be optional)

    const newHeroSlider = new HeroSlider(heroSliderData);

    await newHeroSlider.save();

    // Populate createdBy info if it exists
    if (newHeroSlider.createdBy) {
      await newHeroSlider.populate('createdBy', 'name email');
    }

    console.log('✅ Hero slider created successfully:', newHeroSlider._id);

    res.status(201).json({
      success: true,
      message: 'Hero slider created successfully',
      data: {
        _id: newHeroSlider._id.toString(),
        image: newHeroSlider.image,
        title: newHeroSlider.title,
        buttonText: newHeroSlider.buttonText,
        buttonLink: newHeroSlider.buttonLink,
        status: newHeroSlider.status,
        displayOrder: newHeroSlider.displayOrder,
        createdAt: newHeroSlider.createdAt,
        updatedAt: newHeroSlider.updatedAt,
        createdBy: (newHeroSlider.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('❌ Error creating hero slider:', error);
    
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
      message: 'Server error while creating hero slider',
      error: error.message
    });
  }
};

// @desc    Update hero slider item with Cloudinary support
// @route   PUT /api/hero-slider/:id
// @access  Private (Admin only)
export const updateHeroSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Updating hero slider with Cloudinary...');
    
    const { title, buttonText, buttonLink, status, displayOrder } = req.body;

    // Check if hero slider exists
    const existingSlider = await HeroSlider.findById(req.params.id);
    if (!existingSlider) {
      res.status(404).json({
        success: false,
        message: 'Hero slider item not found'
      });
      return;
    }

    console.log('📊 Existing hero slider image:', existingSlider.image);

    let imageUrl = existingSlider.image;

    // Handle new image if provided
    if (req.file) {
      // Get Cloudinary URL from uploaded file
      imageUrl = (req.file as any).path;
      console.log('✅ New Cloudinary image URL:', imageUrl);
      
      // Delete old image from Cloudinary if new image was uploaded
      if (existingSlider.image && imageUrl && existingSlider.image !== imageUrl) {
        await deleteFromCloudinary(existingSlider.image);
      }
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      // Handle base64 image update
      try {
        console.log('📤 Uploading new base64 image to Cloudinary...');
        const newImageUrl = await uploadToCloudinary(req.body.image);
        console.log('✅ Uploaded new image to Cloudinary:', newImageUrl);
        
        // Delete old image
        if (existingSlider.image && existingSlider.image !== newImageUrl) {
          await deleteFromCloudinary(existingSlider.image);
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
    if (displayOrder && Number(displayOrder) !== existingSlider.displayOrder) {
      const existingOrder = await HeroSlider.findOne({ 
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
    if (buttonText !== undefined) updateData.buttonText = buttonText.trim();
    if (buttonLink !== undefined) updateData.buttonLink = buttonLink.trim();
    if (status !== undefined) updateData.status = status;
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
    if (imageUrl) updateData.image = imageUrl;

    // Update hero slider
    const updatedSlider = await HeroSlider.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSlider) {
      res.status(404).json({
        success: false,
        message: 'Hero slider item not found'
      });
      return;
    }

    // Populate createdBy info
    await updatedSlider.populate('createdBy', 'name email');

    console.log('✅ Hero slider updated successfully');

    res.status(200).json({
      success: true,
      message: 'Hero slider updated successfully',
      data: {
        _id: updatedSlider._id.toString(),
        image: updatedSlider.image,
        title: updatedSlider.title,
        buttonText: updatedSlider.buttonText,
        buttonLink: updatedSlider.buttonLink,
        status: updatedSlider.status,
        displayOrder: updatedSlider.displayOrder,
        createdAt: updatedSlider.createdAt,
        updatedAt: updatedSlider.updatedAt,
        createdBy: (updatedSlider.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('❌ Error updating hero slider:', error);
    
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
      message: 'Server error while updating hero slider',
      error: error.message
    });
  }
};

// @desc    Update hero slider status only
// @route   PATCH /api/hero-slider/:id/status
// @access  Private (Admin only)
export const updateHeroSliderStatus = async (req: Request, res: Response): Promise<void> => {
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

    // Check if hero slider exists
    const existingSlider = await HeroSlider.findById(req.params.id);
    if (!existingSlider) {
      res.status(404).json({
        success: false,
        message: 'Hero slider item not found'
      });
      return;
    }

    // Update status
    const updatedSlider = await HeroSlider.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Hero slider status updated to ${status}`,
      data: {
        _id: updatedSlider!._id.toString(),
        image: updatedSlider!.image,
        title: updatedSlider!.title,
        buttonText: updatedSlider!.buttonText,
        buttonLink: updatedSlider!.buttonLink,
        status: updatedSlider!.status,
        displayOrder: updatedSlider!.displayOrder,
        createdAt: updatedSlider!.createdAt,
        updatedAt: updatedSlider!.updatedAt,
        createdBy: (updatedSlider!.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('Error updating hero slider status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating hero slider status',
      error: error.message
    });
  }
};

// @desc    Delete hero slider item with Cloudinary cleanup
// @route   DELETE /api/hero-slider/:id
// @access  Private (Admin only)
export const deleteHeroSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Deleting hero slider...');

    // Check if hero slider exists
    const heroSlider = await HeroSlider.findById(req.params.id);
    if (!heroSlider) {
      res.status(404).json({
        success: false,
        message: 'Hero slider item not found'
      });
      return;
    }

    // Delete image from Cloudinary if it exists
    if (heroSlider.image) {
      await deleteFromCloudinary(heroSlider.image);
    }

    // Delete hero slider
    await HeroSlider.findByIdAndDelete(req.params.id);

    console.log('✅ Hero slider deleted successfully:', heroSlider.title);

    res.status(200).json({
      success: true,
      message: 'Hero slider deleted successfully',
      data: {
        _id: heroSlider._id.toString(),
        title: heroSlider.title
      }
    });
  } catch (error: any) {
    console.error('❌ Error deleting hero slider:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting hero slider',
      error: error.message
    });
  }
};

// @desc    Get active hero slider items for public display
// @route   GET /api/hero-slider/public/active
// @access  Public
export const getActiveHeroSliders = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 Fetching active hero sliders for public display');
    
    const activeSliders = await HeroSlider.find({ status: 'active' })
      .sort({ displayOrder: 1 })
      .select('image title buttonText buttonLink displayOrder')
      .lean();

    console.log(`✅ Found ${activeSliders.length} active hero sliders`);

    res.status(200).json({
      success: true,
      message: 'Active hero sliders fetched successfully',
      data: activeSliders
    });
  } catch (error: any) {
    console.error('❌ Error fetching active hero sliders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active hero sliders',
      error: error.message
    });
  }
};
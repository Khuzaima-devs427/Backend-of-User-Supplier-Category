import { Request, Response } from 'express';
import CategoryCard from '../models/category_card';
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
    subtitle?: { $regex: string; $options: string }; // Added subtitle
    buttonText?: { $regex: string; $options: string };
    buttonLink?: { $regex: string; $options: string };
  }>;
}

// Interface for CategoryCard document
interface CategoryCardDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  image: string;
  title: string;
  subtitle: string; // Added subtitle
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
        folder: 'category-cards', // Changed folder
        resource_type: 'image',
        transformation: [
          { width: 400, height: 300, crop: 'fill' }, // Changed dimensions for category cards
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

// @desc    Get all category cards with pagination and filters
// @route   GET /api/category-cards
// @access  Private
export const getCategoryCards = async (req: Request, res: Response): Promise<void> => {
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

    // Search functionality (now includes subtitle)
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search as string, $options: 'i' } },
        { subtitle: { $regex: req.query.search as string, $options: 'i' } }, // Added subtitle
        { buttonText: { $regex: req.query.search as string, $options: 'i' } },
        { buttonLink: { $regex: req.query.search as string, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalItems = await CategoryCard.countDocuments(filter);

    // Get category cards with pagination
    const categoryCards = await CategoryCard.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email') // Populate user info
      .lean();

    // Format the response (includes subtitle)
    const formattedCategoryCards = categoryCards.map((card: any) => ({
      _id: card._id.toString(),
      image: card.image,
      title: card.title,
      subtitle: card.subtitle, // Added subtitle
      buttonText: card.buttonText,
      buttonLink: card.buttonLink,
      status: card.status,
      displayOrder: card.displayOrder,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      createdBy: card.createdBy?.name || 'Unknown'
    }));

    res.status(200).json({
      success: true,
      message: 'Category cards fetched successfully',
      data: formattedCategoryCards,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: limit
      }
    });
  } catch (error: any) {
    console.error('Error fetching category cards:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category cards',
      error: error.message
    });
  }
};

// @desc    Get single category card
// @route   GET /api/category-cards/:id
// @access  Private
export const getCategoryCardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryCard = await CategoryCard.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!categoryCard) {
      res.status(404).json({
        success: false,
        message: 'Category card not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category card fetched successfully',
      data: {
        _id: categoryCard._id.toString(),
        image: categoryCard.image,
        title: categoryCard.title,
        subtitle: categoryCard.subtitle, // Added subtitle
        buttonText: categoryCard.buttonText,
        buttonLink: categoryCard.buttonLink,
        status: categoryCard.status,
        displayOrder: categoryCard.displayOrder,
        createdAt: categoryCard.createdAt,
        updatedAt: categoryCard.updatedAt,
        createdBy: (categoryCard.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('Error fetching category card:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category card',
      error: error.message
    });
  }
};

// @desc    Create new category card with Cloudinary image upload
// @route   POST /api/category-cards
// @access  Private (Admin only)
export const createCategoryCard = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Creating category card with Cloudinary...');
    console.log('🔍 Request file:', req.file);
    console.log('🔍 Request body:', req.body);

    // Get form data fields (includes subtitle)
    const { title, subtitle, buttonText, buttonLink, status, displayOrder } = req.body;

    // Manual validation (includes subtitle validation)
    const validationErrors: any[] = [];
    
    // Title validation
    if (!title || title.trim() === '') {
      validationErrors.push({ param: 'title', msg: 'Title is required' });
    } else if (title.length > 100) { // Changed from 200 to 100
      validationErrors.push({ param: 'title', msg: 'Title cannot exceed 100 characters' });
    }

    // Subtitle validation (required)
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
    const existingOrder = await CategoryCard.findOne({ displayOrder: Number(displayOrder) });
    if (existingOrder) {
      console.log('❌ Display order conflict:', displayOrder);
      res.status(400).json({
        success: false,
        message: 'Display order already exists. Please choose a different order.'
      });
      return;
    }

    // Prepare category card data (includes subtitle)
    const categoryCardData: any = {
      image: imageUrl,
      title: title.trim(),
      subtitle: subtitle.trim(), // Added subtitle
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim(),
      status: status || 'active',
      displayOrder: Number(displayOrder)
    };

    // Only include createdBy if we have a valid user ID
    if (req.user?.id) {
      categoryCardData.createdBy = req.user.id;
    }

    // Create new category card
    const newCategoryCard = new CategoryCard(categoryCardData);
    await newCategoryCard.save();

    // Populate createdBy info if it exists
    if (newCategoryCard.createdBy) {
      await newCategoryCard.populate('createdBy', 'name email');
    }

    console.log('✅ Category card created successfully:', newCategoryCard._id);

    res.status(201).json({
      success: true,
      message: 'Category card created successfully',
      data: {
        _id: newCategoryCard._id.toString(),
        image: newCategoryCard.image,
        title: newCategoryCard.title,
        subtitle: newCategoryCard.subtitle, // Added subtitle
        buttonText: newCategoryCard.buttonText,
        buttonLink: newCategoryCard.buttonLink,
        status: newCategoryCard.status,
        displayOrder: newCategoryCard.displayOrder,
        createdAt: newCategoryCard.createdAt,
        updatedAt: newCategoryCard.updatedAt,
        createdBy: (newCategoryCard.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('❌ Error creating category card:', error);
    
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
      message: 'Server error while creating category card',
      error: error.message
    });
  }
};

// @desc    Update category card with Cloudinary support (includes subtitle)
// @route   PATCH /api/category-cards/:id
// @access  Private (Admin only)
export const updateCategoryCard = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Updating category card with Cloudinary...');
    
    // Get form data (includes subtitle)
    const { title, subtitle, buttonText, buttonLink, status, displayOrder } = req.body;

    // Check if category card exists
    const existingCard = await CategoryCard.findById(req.params.id);
    if (!existingCard) {
      res.status(404).json({
        success: false,
        message: 'Category card not found'
      });
      return;
    }

    console.log('📊 Existing category card image:', existingCard.image);

    let imageUrl = existingCard.image;

    // Handle new image if provided
    if (req.file) {
      // Get Cloudinary URL from uploaded file
      imageUrl = (req.file as any).path;
      console.log('✅ New Cloudinary image URL:', imageUrl);
      
      // Delete old image from Cloudinary if new image was uploaded
      if (existingCard.image && imageUrl && existingCard.image !== imageUrl) {
        await deleteFromCloudinary(existingCard.image);
      }
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      // Handle base64 image update
      try {
        console.log('📤 Uploading new base64 image to Cloudinary...');
        const newImageUrl = await uploadToCloudinary(req.body.image);
        console.log('✅ Uploaded new image to Cloudinary:', newImageUrl);
        
        // Delete old image
        if (existingCard.image && existingCard.image !== newImageUrl) {
          await deleteFromCloudinary(existingCard.image);
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
    if (displayOrder && Number(displayOrder) !== existingCard.displayOrder) {
      const existingOrder = await CategoryCard.findOne({ 
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

    // Prepare update data (includes subtitle)
    const updateData: any = {
      updatedAt: Date.now()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle.trim(); // Added subtitle
    if (buttonText !== undefined) updateData.buttonText = buttonText.trim();
    if (buttonLink !== undefined) updateData.buttonLink = buttonLink.trim();
    if (status !== undefined) updateData.status = status;
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
    if (imageUrl) updateData.image = imageUrl;

    // Update category card
    const updatedCard = await CategoryCard.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCard) {
      res.status(404).json({
        success: false,
        message: 'Category card not found'
      });
      return;
    }

    // Populate createdBy info
    await updatedCard.populate('createdBy', 'name email');

    console.log('✅ Category card updated successfully');

    res.status(200).json({
      success: true,
      message: 'Category card updated successfully',
      data: {
        _id: updatedCard._id.toString(),
        image: updatedCard.image,
        title: updatedCard.title,
        subtitle: updatedCard.subtitle, // Added subtitle
        buttonText: updatedCard.buttonText,
        buttonLink: updatedCard.buttonLink,
        status: updatedCard.status,
        displayOrder: updatedCard.displayOrder,
        createdAt: updatedCard.createdAt,
        updatedAt: updatedCard.updatedAt,
        createdBy: (updatedCard.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('❌ Error updating category card:', error);
    
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
      message: 'Server error while updating category card',
      error: error.message
    });
  }
};

// @desc    Update category card status only
// @route   PATCH /api/category-cards/:id/status
// @access  Private (Admin only)
export const updateCategoryCardStatus = async (req: Request, res: Response): Promise<void> => {
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

    // Check if category card exists
    const existingCard = await CategoryCard.findById(req.params.id);
    if (!existingCard) {
      res.status(404).json({
        success: false,
        message: 'Category card not found'
      });
      return;
    }

    // Update status
    const updatedCard = await CategoryCard.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Category card status updated to ${status}`,
      data: {
        _id: updatedCard!._id.toString(),
        image: updatedCard!.image,
        title: updatedCard!.title,
        subtitle: updatedCard!.subtitle, // Added subtitle
        buttonText: updatedCard!.buttonText,
        buttonLink: updatedCard!.buttonLink,
        status: updatedCard!.status,
        displayOrder: updatedCard!.displayOrder,
        createdAt: updatedCard!.createdAt,
        updatedAt: updatedCard!.updatedAt,
        createdBy: (updatedCard!.createdBy as any)?.name || 'Unknown'
      }
    });
  } catch (error: any) {
    console.error('Error updating category card status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category card status',
      error: error.message
    });
  }
};

// @desc    Delete category card with Cloudinary cleanup
// @route   DELETE /api/category-cards/:id
// @access  Private (Admin only)
export const deleteCategoryCard = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Deleting category card...');

    // Check if category card exists
    const categoryCard = await CategoryCard.findById(req.params.id);
    if (!categoryCard) {
      res.status(404).json({
        success: false,
        message: 'Category card not found'
      });
      return;
    }

    // Delete image from Cloudinary if it exists
    if (categoryCard.image) {
      await deleteFromCloudinary(categoryCard.image);
    }

    // Delete category card
    await CategoryCard.findByIdAndDelete(req.params.id);

    console.log('✅ Category card deleted successfully:', categoryCard.title);

    res.status(200).json({
      success: true,
      message: 'Category card deleted successfully',
      data: {
        _id: categoryCard._id.toString(),
        title: categoryCard.title,
        subtitle: categoryCard.subtitle // Added subtitle
      }
    });
  } catch (error: any) {
    console.error('❌ Error deleting category card:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category card',
      error: error.message
    });
  }
};

// @desc    Get active category cards for public display
// @route   GET /api/category-cards/public/active
// @access  Public
export const getActiveCategoryCards = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 Fetching active category cards for public display');
    
    const activeCards = await CategoryCard.find({ status: 'active' })
      .sort({ displayOrder: 1 })
      .select('image title subtitle buttonText buttonLink status displayOrder') // Added subtitle
      .lean();

    console.log(`✅ Found ${activeCards.length} active category cards`);

    res.status(200).json({
      success: true,
      message: 'Active category cards fetched successfully',
      data: activeCards
    });
  } catch (error: any) {
    console.error('❌ Error fetching active category cards:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active category cards',
      error: error.message
    });
  }
};
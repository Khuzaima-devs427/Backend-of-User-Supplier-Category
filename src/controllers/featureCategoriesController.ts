import { Request, Response } from 'express';
import FeatureCategory from '../models/featured_categories';

// Get all feature categories with pagination/search
export const getAllFeatureCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search as string;
    let query = {};
    
    if (searchQuery) {
      query = {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { type: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }

    const [featureCategories, total, featuredCount] = await Promise.all([
      FeatureCategory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FeatureCategory.countDocuments(query),
      FeatureCategory.getFeaturedCount()
    ]);

    res.status(200).json({
      success: true,
      data: featureCategories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      featuredInfo: {
        currentFeatured: featuredCount,
        maxFeatured: 4,
        canAddMore: featuredCount < 4
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feature categories',
      error: error.message
    });
  }
};

// Get only featured categories (Client side)
export const getFeaturedCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const featuredCategories = await FeatureCategory.find({ 
      isFeatured: true,
      status: 'active'
    })
    .sort({ featuredOrder: 1 })
    .limit(4);

    res.status(200).json({
      success: true,
      data: featuredCategories,
      count: featuredCategories.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured categories',
      error: error.message
    });
  }
};

// Create new feature category
export const createFeatureCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, type, status, isFeatured } = req.body;

    const existingCategory = await FeatureCategory.findOne({ name });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        message: 'A feature category with this name already exists'
      });
      return;
    }

    const featureCategoryData = {
      name,
      description: description || '',
      type: type || 'General',
      status: status || 'active',
      isFeatured: isFeatured || false
    };

    if (featureCategoryData.isFeatured) {
      const canBeFeatured = await FeatureCategory.canBeFeatured();
      if (!canBeFeatured) {
        res.status(400).json({
          success: false,
          message: 'Maximum 4 featured categories reached. Cannot create as featured.'
        });
        return;
      }
    }

    const newFeatureCategory = new FeatureCategory(featureCategoryData);
    await newFeatureCategory.save();

    res.status(201).json({
      success: true,
      message: 'Feature category created successfully',
      data: newFeatureCategory
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to create feature category',
      error: error.message
    });
  }
};

// Get single feature category by ID
export const getFeatureCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const featureCategory = await FeatureCategory.findById(id);
    
    if (!featureCategory) {
      res.status(404).json({
        success: false,
        message: 'Feature category not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: featureCategory
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feature category',
      error: error.message
    });
  }
};

// Update feature category
export const updateFeatureCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const featureCategory = await FeatureCategory.findById(id);
    if (!featureCategory) {
      res.status(404).json({
        success: false,
        message: 'Feature category not found'
      });
      return;
    }

    if (updateData.name && updateData.name !== featureCategory.name) {
      const existingCategory = await FeatureCategory.findOne({ 
        name: updateData.name,
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: 'A feature category with this name already exists'
        });
        return;
      }
    }

    if (updateData.isFeatured !== undefined && updateData.isFeatured !== featureCategory.isFeatured) {
      if (updateData.isFeatured) {
        const canBeFeatured = await FeatureCategory.canBeFeatured();
        if (!canBeFeatured) {
          res.status(400).json({
            success: false,
            message: 'Maximum 4 featured categories reached. Cannot mark as featured.'
          });
          return;
        }
      }
    }

    const updatedFeatureCategory = await FeatureCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Feature category updated successfully',
      data: updatedFeatureCategory
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to update feature category',
      error: error.message
    });
  }
};

// Delete feature category
export const deleteFeatureCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedFeatureCategory = await FeatureCategory.findByIdAndDelete(id);
    
    if (!deletedFeatureCategory) {
      res.status(404).json({
        success: false,
        message: 'Feature category not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Feature category deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete feature category',
      error: error.message
    });
  }
};

// Toggle featured status
export const toggleFeaturedStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedFeatureCategory = await FeatureCategory.toggleFeatured(id);

    res.status(200).json({
      success: true,
      message: updatedFeatureCategory?.isFeatured 
        ? 'Category marked as featured successfully' 
        : 'Category removed from featured successfully',
      data: updatedFeatureCategory,
      isFeatured: updatedFeatureCategory?.isFeatured
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mark as featured directly
export const markAsFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const featureCategory = await FeatureCategory.findById(id);
    if (!featureCategory) {
      res.status(404).json({
        success: false,
        message: 'Feature category not found'
      });
      return;
    }

    if (featureCategory.isFeatured) {
      res.status(400).json({
        success: false,
        message: 'Category is already featured'
      });
      return;
    }

    await featureCategory.markAsFeatured();

    res.status(200).json({
      success: true,
      message: 'Category marked as featured successfully',
      data: featureCategory
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Remove from featured
export const removeFromFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const featureCategory = await FeatureCategory.findById(id);
    if (!featureCategory) {
      res.status(404).json({
        success: false,
        message: 'Feature category not found'
      });
      return;
    }

    if (!featureCategory.isFeatured) {
      res.status(400).json({
        success: false,
        message: 'Category is not featured'
      });
      return;
    }

    await featureCategory.removeFromFeatured();

    res.status(200).json({
      success: true,
      message: 'Category removed from featured successfully',
      data: featureCategory
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured limit info
export const getFeaturedLimitInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const featuredCount = await FeatureCategory.getFeaturedCount();
    const canBeFeatured = await FeatureCategory.canBeFeatured();
    const featuredCategories = await FeatureCategory.find({ isFeatured: true })
      .sort({ featuredOrder: 1 })
      .select('name featuredOrder');

    res.status(200).json({
      success: true,
      data: {
        currentFeatured: featuredCount,
        maxFeatured: 4,
        canAddMore: canBeFeatured,
        availableSlots: 4 - featuredCount,
        featuredList: featuredCategories.map(cat => ({
          id: cat._id,
          name: cat.name,
          order: cat.featuredOrder
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get featured limit info',
      error: error.message
    });
  }
};

// Update featured order
export const updateFeaturedOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderUpdates } = req.body;

    if (!Array.isArray(orderUpdates)) {
      res.status(400).json({
        success: false,
        message: 'orderUpdates must be an array'
      });
      return;
    }

    const orders = orderUpdates.map(item => item.featuredOrder);
    const uniqueOrders = new Set(orders);
    
    if (uniqueOrders.size !== orders.length) {
      res.status(400).json({
        success: false,
        message: 'Featured orders must be unique'
      });
      return;
    }

    for (const order of orders) {
      if (order < 1 || order > 4) {
        res.status(400).json({
          success: false,
          message: 'Featured order must be between 1 and 4'
        });
        return;
      }
    }

    const session = await FeatureCategory.startSession();
    session.startTransaction();

    try {
      for (const update of orderUpdates) {
        await FeatureCategory.findByIdAndUpdate(
          update.id,
          { featuredOrder: update.featuredOrder },
          { session }
        );
      }

      await session.commitTransaction();
      
      const updatedCategories = await FeatureCategory.find({ 
        isFeatured: true 
      }).sort({ featuredOrder: 1 });

      res.status(200).json({
        success: true,
        message: 'Featured order updated successfully',
        data: updatedCategories
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to update featured order',
      error: error.message
    });
  }
};
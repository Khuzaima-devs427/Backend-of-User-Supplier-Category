// controllers/supplierCategoryController.ts
import { Request, Response } from 'express';
import { SupplierCategory } from '../models/SupplierCategory';
import { uploadProductImage, cloudinary } from '../config/cloudinary';

export const createSupplierCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, productCategories, productType } = req.body;

    console.log('🔄 Creating supplier category with data:', {
      name,
      description,
      productCategories,
      productType
    });
    console.log('📁 File received:', req.file);

    // Check if supplier category with same name already exists
    const existingCategory = await SupplierCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Supplier category with this name already exists'
      });
    }

    let imageUrl = '';

    // Handle image upload if file exists
    if (req.file) {
      try {
        // The file is already uploaded by multer middleware, get the Cloudinary URL
        imageUrl = (req.file as any).path;
        console.log('✅ Image uploaded to Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${(uploadError as Error).message}`
        });
      }
    }

    // Parse productCategories if it's a string
    let parsedProductCategories: string[] = [];
    if (Array.isArray(productCategories)) {
      parsedProductCategories = productCategories;
    } else if (typeof productCategories === 'string') {
      try {
        parsedProductCategories = JSON.parse(productCategories);
      } catch {
        // If it's a single string, wrap in array
        parsedProductCategories = productCategories ? [productCategories] : [];
      }
    }

    // Validate that at least one product category is selected
    if (parsedProductCategories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product category is required'
      });
    }

    const category = new SupplierCategory({
      name,
      description: description || '',
      productCategories: parsedProductCategories,
      productType,
      image: imageUrl,
      isBlocked: false
    });

    await category.save();

    console.log('✅ Supplier category created successfully:', category._id);

    res.status(201).json({
      success: true,
      message: 'Supplier category created successfully',
      data: category
    });
  } catch (error: any) {
    console.error('❌ Error creating supplier category:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSupplierCategories = async (req: Request, res: Response) => {
  try {
    const { productType, search, status, page = 1, limit = 10 } = req.query;
    
    console.log('🔍 Backend received query:', req.query);
    
    const filter: any = {};
    
    if (productType) filter.productType = productType;
    
    // Convert status filter to isBlocked
    if (status) {
      if (status === 'inactive') {
        filter.isBlocked = true;
      } else if (status === 'active') {
        filter.isBlocked = false;
      }
    }
    
    if (search) {
      const searchString = Array.isArray(search) ? search[0] : search;
      const searchRegex = new RegExp(String(searchString), 'i');
      
      filter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { productCategories: { $in: [searchRegex] } }
      ];
    }

    console.log('📊 MongoDB filter:', filter);

    const categories = await SupplierCategory.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await SupplierCategory.countDocuments(filter);

    console.log(`✅ Found ${categories.length} categories out of ${total} total`);

    res.json({
      success: true,
      data: categories,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error: any) {
    console.error('❌ Error in getSupplierCategories:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSupplierCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('🔍 Fetching supplier category by ID:', id);

    const category = await SupplierCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Supplier category not found'
      });
    }

    console.log('✅ Found category:', {
      id: category._id,
      name: category.name,
      hasImage: !!category.image,
      imageUrl: category.image
    });

    res.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    console.error('❌ Error fetching supplier category:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSupplierCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, productCategories, productType } = req.body;

    console.log('🔄 Updating supplier category:', {
      id,
      name,
      description,
      productCategories,
      productType
    });
    console.log('📁 File for update:', req.file);

    // Find existing category
    const existingCategory = await SupplierCategory.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Supplier category not found'
      });
    }

    console.log('📊 Existing category image:', existingCategory.image);

    let imageUrl = existingCategory.image;

    // Handle image upload if new file exists
    if (req.file) {
      try {
        // The file is already uploaded by multer middleware, get the Cloudinary URL
        imageUrl = (req.file as any).path;
        console.log('✅ New image uploaded to Cloudinary:', imageUrl);
        
        // Delete old image from Cloudinary if it exists and new image was uploaded successfully
        if (existingCategory.image && imageUrl && existingCategory.image !== imageUrl) {
          try {
            // Extract public_id from Cloudinary URL
            const urlParts = existingCategory.image.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const publicId = `auth-app/products/${fileName.split('.')[0]}`;
            
            await cloudinary.uploader.destroy(publicId);
            console.log('✅ Old image deleted from Cloudinary');
          } catch (deleteError) {
            console.warn('⚠️ Could not delete old image from Cloudinary:', deleteError);
            // Continue with update even if deletion fails
          }
        }
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${(uploadError as Error).message}`
        });
      }
    }

    // Parse productCategories if it's a string
    let parsedProductCategories: string[] = [];
    if (Array.isArray(productCategories)) {
      parsedProductCategories = productCategories;
    } else if (typeof productCategories === 'string') {
      try {
        parsedProductCategories = JSON.parse(productCategories);
      } catch {
        // If it's a single string, wrap in array
        parsedProductCategories = productCategories ? [productCategories] : [];
      }
    }

    // Validate that at least one product category is selected
    if (parsedProductCategories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product category is required'
      });
    }

    const category = await SupplierCategory.findByIdAndUpdate(
      id,
      {
        name,
        description,
        productCategories: parsedProductCategories,
        productType,
        image: imageUrl
      },
      { new: true, runValidators: true }
    );

    console.log('✅ Supplier category updated successfully');

    res.json({
      success: true,
      message: 'Supplier category updated successfully',
      data: category
    });
  } catch (error: any) {
    console.error('❌ Error updating supplier category:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSupplierCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('🔄 Updating supplier category status:', { id, status });

    // Validate status value
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "inactive"'
      });
    }

    // Convert status to isBlocked for database
    const isBlocked = status === 'inactive';

    const category = await SupplierCategory.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true, runValidators: true }
    );

    if (!category) {
      console.log('❌ Supplier category not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Supplier category not found'
      });
    }

    console.log('✅ Supplier category status updated successfully:', category.name, '->', status);

    res.json({
      success: true,
      message: `Supplier category ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: category
    });
  } catch (error: any) {
    console.error('❌ Error updating supplier category status:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteSupplierCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('🔄 Attempting to delete supplier category with ID:', id);

    // Find category first to get image URL
    const category = await SupplierCategory.findById(id);
    if (!category) {
      console.log('❌ Supplier category not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Supplier category not found'
      });
    }

    // Delete image from Cloudinary if it exists
    if (category.image) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = category.image.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `auth-app/products/${fileName.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
        console.log('✅ Image deleted from Cloudinary');
      } catch (deleteError) {
        console.warn('⚠️ Could not delete image from Cloudinary:', deleteError);
        // Continue with deletion even if image deletion fails
      }
    }

    // Delete category from database
    await SupplierCategory.findByIdAndDelete(id);

    console.log('✅ Supplier category deleted successfully:', category.name);
    
    res.json({
      success: true,
      message: 'Supplier category deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting supplier category:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
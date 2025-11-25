// controllers/supplierCategoryController.ts
import { Request, Response } from 'express';
import { SupplierCategory } from '../models/index';

export const createSupplierCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, productCategories, productType, image } = req.body;

    // Check if supplier category with same name already exists
    const existingCategory = await SupplierCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Supplier category with this name already exists'
      });
    }

    const category = new SupplierCategory({
      name,
      description: description || '',
      productCategories,
      productType,
      image: image || '',
      isBlocked: false // Explicitly set to false for new categories
    });

    await category.save();

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

    const category = await SupplierCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Supplier category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSupplierCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, productCategories, productType, image } = req.body;

    const category = await SupplierCategory.findByIdAndUpdate(
      id,
      {
        name,
        description,
        productCategories,
        productType,
        image
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Supplier category not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier category updated successfully',
      data: category
    });
  } catch (error: any) {
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
      { isBlocked }, // Use isBlocked field in database
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

    const category = await SupplierCategory.findByIdAndDelete(id);
    if (!category) {
      console.log('❌ Supplier category not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Supplier category not found'
      });
    }

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
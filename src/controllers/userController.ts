// controllers/userController.ts
import { Request, Response } from 'express';
import { User, UserCategory, SupplierCategory } from '../models/index';

// Create User (Regular User)
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      userType, // UserCategory ID
      address
    } = req.body;

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Verify user category exists
    const userCategory = await UserCategory.findById(userType);
    if (!userCategory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user category'
      });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || '',
      password,
      userType,
      address: address || {},
      signUpThrough: 'Web'
    });

    await user.save();

    // Remove password from response
    const { password: _, ...userResponse } = user.toObject();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Create Supplier - UPDATED VERSION
export const createSupplier = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      supplierCategory, // SupplierCategory ID
      address
    } = req.body;

    console.log('🔄 Creating supplier with data:', {
      firstName, lastName, email, supplierCategory
    });

    // 1. Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this email already exists'
      });
    }

    // 2. Verify supplier category exists and is NOT blocked
    const supplierCat = await SupplierCategory.findOne({
      _id: supplierCategory,
      isBlocked: false // Only allow active categories
    });
    
    if (!supplierCat) {
      console.log('❌ Invalid supplier category:', supplierCategory);
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive supplier category'
      });
    }

    console.log('✅ Found supplier category:', supplierCat.name);

    // 3. Find an ACTIVE user category of type "Supplier"
    const supplierUserCategory = await UserCategory.findOne({
      categoryType: 'Supplier',
      isBlocked: false // Only active categories
    });
    
    if (!supplierUserCategory) {
      console.log('❌ No active supplier user category found');
      return res.status(400).json({
        success: false,
        message: 'No active supplier role found. Please contact administrator.'
      });
    }

    console.log('✅ Using user category:', supplierUserCategory.role);

    // 4. Create the supplier
    const supplier = new User({
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || '',
      password,
      userType: supplierUserCategory._id, // Automatically assigned supplier role
      supplierCategory, // The product category (Mobile, PC, etc.)
      address: address || {},
      signUpThrough: 'Web',
      isBlocked: false // Ensure new suppliers are active
    });

    await supplier.save();
    console.log('✅ Supplier saved to database');

    // 5. Populate and return the created supplier
    const populatedSupplier = await User.findById(supplier._id)
      .populate('userType', 'role categoryType description')
      .populate('supplierCategory', 'name productCategories productType description image')
      .select('-password');

    if (!populatedSupplier) {
      throw new Error('Failed to retrieve created supplier');
    }

    console.log('🎉 Supplier created successfully:', populatedSupplier.firstName);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: populatedSupplier
    });
  } catch (error: any) {
    console.error('❌ Error creating supplier:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create supplier'
    });
  }
};

// Get All Users (Regular Users only)
// Get All Users (Regular Users only)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { userType, search, page = 1, limit = 10, isBlocked, isEmailVerified } = req.query;
    
    console.log('🔍 Backend received user filters:', {
      isBlocked,
      isEmailVerified,
      search,
      userType
    });
    
    const filter: any = { 
      supplierCategory: { $exists: false } // Only regular users
    };
    
    // FIXED: Handle boolean filters correctly
    if (isBlocked !== undefined && isBlocked !== '') {
      filter.isBlocked = isBlocked === 'true';
    }
    
    if (isEmailVerified !== undefined && isEmailVerified !== '') {
      filter.isEmailVerified = isEmailVerified === 'true';
    }
    
    if (userType) filter.userType = userType;
    
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { firstName: { $regex: searchRegex } },
        { lastName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } }
      ];
    }

    console.log('📊 Final MongoDB user filter:', JSON.stringify(filter, null, 2));

    const users = await User.find(filter)
      .populate('userType', 'role categoryType description')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(filter);

    console.log(`✅ Found ${users.length} users out of ${total} total`);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Suppliers - UPDATED VERSION
export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const { userType, supplierCategory, search, page = 1, limit = 10, isBlocked, isEmailVerified } = req.query;
    
    console.log('🔍 Backend received supplier filters:', {
      isBlocked,
      isEmailVerified,
      search,
      userType,
      supplierCategory
    });
    
    const filter: any = { 
      supplierCategory: { $exists: true } // Only suppliers
    };
    
    // FIXED: Handle boolean filters correctly
    if (isBlocked !== undefined && isBlocked !== '') {
      filter.isBlocked = isBlocked === 'true';
    }
    
    if (isEmailVerified !== undefined && isEmailVerified !== '') {
      filter.isEmailVerified = isEmailVerified === 'true';
    }
    
    if (userType) filter.userType = userType;
    if (supplierCategory) filter.supplierCategory = supplierCategory;
    
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { firstName: { $regex: searchRegex } },
        { lastName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } }
      ];
    }

    console.log('📊 Final MongoDB supplier filter:', JSON.stringify(filter, null, 2));

    const suppliers = await User.find(filter)
      .populate('userType', 'role categoryType description')
      .populate('supplierCategory', 'name productCategories productType description image')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(filter);

    console.log(`✅ Found ${suppliers.length} suppliers out of ${total} total`);

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get User/Supplier by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('userType', 'role categoryType description')
      .populate('supplierCategory', 'name productCategories productType description image')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update User/Supplier - FIXED VERSION (Allows email updates)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('🔄 Updating user/supplier:', id, updateData);

    // If updating email, check if it's already taken by another user
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
      console.log('✅ Email update validated - no conflicts');
    }

    // If updating supplier category, validate it exists and is active
    if (updateData.supplierCategory) {
      const supplierCat = await SupplierCategory.findOne({
        _id: updateData.supplierCategory,
        isBlocked: false
      });
      
      if (!supplierCat) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive supplier category'
        });
      }
      console.log('✅ Valid supplier category:', supplierCat.name);
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('userType', 'role categoryType description')
    .populate('supplierCategory', 'name productCategories productType description image')
    .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User/supplier updated successfully', {
      updatedFields: Object.keys(updateData),
      emailUpdated: !!updateData.email,
      newEmail: updateData.email || 'unchanged'
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error: any) {
    console.error('❌ Error updating user:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update user'
    });
  }
};

// Update User/Supplier Status
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    )
    .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'activated'} successfully`,
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete User/Supplier
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
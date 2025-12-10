// // controllers/userCategoryController.ts
// import { Request, Response } from 'express';
// import { UserCategory } from '../models/index';

// // Temporary interface extension
// interface UserCategoryWithIsBlocked {
//   _id: any;
//   role: string;
//   description: string;
//   categoryType: string;
//   permissions: string[];
//   status?: 'active' | 'inactive';
//   isBlocked?: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export const createUserCategory = async (req: Request, res: Response) => {
//   try {
//     const { role, description, categoryType, permissions } = req.body;

//     // Check if category with same role already exists
//     const existingCategory = await UserCategory.findOne({ role });
//     if (existingCategory) {
//       return res.status(400).json({
//         success: false,
//         message: 'User category with this role already exists'
//       });
//     }

//     const category = new UserCategory({
//       role,
//       description: description || '',
//       categoryType,
//       permissions: permissions || []
//       // Don't set status - model uses isBlocked with default false
//     });

//     await category.save();

//     // Transform response to include status field
//     const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
//     const transformedCategory = {
//       ...categoryObj,
//       status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
//     };

//     res.status(201).json({
//       success: true,
//       message: 'User category created successfully',
//       data: transformedCategory
//     });
//   } catch (error: any) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// export const getUserCategories = async (req: Request, res: Response) => {
//   try {
//     const { categoryType, search, status, page = 1, limit = 10 } = req.query;
    
//     const filter: any = {};
    
//     if (categoryType) filter.categoryType = categoryType;
    
//     // FIXED: Convert status filter to isBlocked
//     if (status) {
//       if (status === 'inactive') {
//         filter.isBlocked = true;
//       } else if (status === 'active') {
//         filter.isBlocked = false;
//       }
//     }
    
//     if (search) {
//       filter.$or = [
//         { role: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const categories = await UserCategory.find(filter)
//       .sort({ createdAt: -1 })
//       .limit(Number(limit))
//       .skip((Number(page) - 1) * Number(limit));

//     // FIXED: Transform response to include status field
//     const transformedCategories = categories.map(category => {
//       const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
//       return {
//         ...categoryObj,
//         status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
//       };
//     });

//     const total = await UserCategory.countDocuments(filter);

//     res.json({
//       success: true,
//       data: transformedCategories,
//       pagination: {
//         currentPage: Number(page),
//         totalPages: Math.ceil(total / Number(limit)),
//         totalItems: total,
//         itemsPerPage: Number(limit)
//       }
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// export const getUserCategoryById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const category = await UserCategory.findById(id);
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'User category not found'
//       });
//     }

//     // FIXED: Transform response to include status field
//     const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
//     const transformedCategory = {
//       ...categoryObj,
//       status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
//     };

//     res.json({
//       success: true,
//       data: transformedCategory
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// export const updateUserCategory = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { role, description, categoryType, permissions } = req.body;

//     const category = await UserCategory.findByIdAndUpdate(
//       id,
//       {
//         role,
//         description,
//         categoryType,
//         permissions
//       },
//       { new: true, runValidators: true }
//     );

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'User category not found'
//       });
//     }

//     // FIXED: Transform response to include status field
//     const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
//     const transformedCategory = {
//       ...categoryObj,
//       status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
//     };

//     res.json({
//       success: true,
//       message: 'User category updated successfully',
//       data: transformedCategory
//     });
//   } catch (error: any) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// export const updateUserCategoryStatus = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     console.log('🔄 Updating user category status:', { id, status });

//     // Validate status value
//     if (!status || !['active', 'inactive'].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status. Must be "active" or "inactive"'
//       });
//     }

//     // FIXED: Convert status to isBlocked for database
//     const isBlocked = status === 'inactive';

//     const category = await UserCategory.findByIdAndUpdate(
//       id,
//       { isBlocked }, // Use isBlocked field in database
//       { new: true, runValidators: true }
//     );

//     if (!category) {
//       console.log('❌ User category not found with ID:', id);
//       return res.status(404).json({
//         success: false,
//         message: 'User category not found'
//       });
//     }

//     console.log('✅ User category status updated successfully:', category.role, '->', status);

//     // FIXED: Transform response to include status field
//     const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
//     const transformedCategory = {
//       ...categoryObj,
//       status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
//     };

//     res.json({
//       success: true,
//       message: `User category ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
//       data: transformedCategory
//     });
//   } catch (error: any) {
//     console.error('❌ Error updating user category status:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// export const deleteUserCategory = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     console.log('🔄 Attempting to delete user category with ID:', id);

//     const category = await UserCategory.findByIdAndDelete(id);
//     if (!category) {
//       console.log('❌ User category not found with ID:', id);
//       return res.status(404).json({
//         success: false,
//         message: 'User category not found'
//       });
//     }

//     console.log('✅ User category deleted successfully:', category.role);
    
//     res.json({
//       success: true,
//       message: 'User category deleted successfully'
//     });
//   } catch (error: any) {
//     console.error('❌ Error deleting user category:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get only supplier type categories for supplier selection
// export const getSupplierUserCategories = async (req: Request, res: Response) => {
//   try {
//     const categories = await UserCategory.find({
//       categoryType: 'Supplier', // Fixed: Capital 'S'
//       isBlocked: false // Use isBlocked field
//     }).select('role description');

//     // Transform response to include status field
//     const transformedCategories = categories.map(category => {
//       const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
//       return {
//         ...categoryObj,
//         status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
//       };
//     });

//     res.json({
//       success: true,
//       data: transformedCategories
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


































// controllers/userCategoryController.ts
import { Request, Response } from 'express';
import { UserCategory } from '../models/index';

// Temporary interface extension
interface UserCategoryWithIsBlocked {
  _id: any;
  role: string;
  description: string;
  categoryType: string;
  permissions: string[];
  status?: 'active' | 'inactive';
  isBlocked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define system permissions (add this at the top)
export const SYSTEM_PERMISSIONS = {
  // Dashboard
  'dashboard.view': 'dashboard.view',
  
  // Users
  'users.view': 'users.view',
  'users.create': 'users.create', 
  'users.edit': 'users.edit',
  'users.delete': 'users.delete',
  
  // User Categories
  'user_categories.view': 'user_categories.view',
  'user_categories.create': 'user_categories.create',
  'user_categories.edit': 'user_categories.edit',
  'user_categories.delete': 'user_categories.delete',
  
  // Suppliers
  'suppliers.view': 'suppliers.view',
  'suppliers.create': 'suppliers.create',
  'suppliers.edit': 'suppliers.edit', 
  'suppliers.delete': 'suppliers.delete',
  
  // Supplier Categories
  'supplier_categories.view': 'supplier_categories.view',
  'supplier_categories.create': 'supplier_categories.create',
  'supplier_categories.edit': 'supplier_categories.edit',
  'supplier_categories.delete': 'supplier_categories.delete',
  
  // Projects
  'projects.view': 'projects.view',
  
  // Analytics
  'analytics.view': 'analytics.view',
  
  // Settings
  'settings.view': 'settings.view',
} as const;

// Create a type for the permission values
export type SystemPermission = typeof SYSTEM_PERMISSIONS[keyof typeof SYSTEM_PERMISSIONS];

// ========== EXISTING FUNCTIONS (UNCHANGED) ==========

export const createUserCategory = async (req: Request, res: Response) => {
  try {
    const { role, description, categoryType, permissions } = req.body;

    // Check if category with same role already exists
    const existingCategory = await UserCategory.findOne({ role });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'User category with this role already exists'
      });
    }

    const category = new UserCategory({
      role,
      description: description || '',
      categoryType,
      permissions: permissions || []
    });

    await category.save();

    // Transform response to include status field
    const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
    const transformedCategory = {
      ...categoryObj,
      status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
    };

    res.status(201).json({
      success: true,
      message: 'User category created successfully',
      data: transformedCategory
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserCategories = async (req: Request, res: Response) => {
  try {
    const { categoryType, search, status, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    
    if (categoryType) filter.categoryType = categoryType;
    
    if (status) {
      if (status === 'inactive') {
        filter.isBlocked = true;
      } else if (status === 'active') {
        filter.isBlocked = false;
      }
    }
    
    if (search) {
      filter.$or = [
        { role: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const categories = await UserCategory.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const transformedCategories = categories.map(category => {
      const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
      return {
        ...categoryObj,
        status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
      };
    });

    const total = await UserCategory.countDocuments(filter);

    res.json({
      success: true,
      data: transformedCategories,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await UserCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'User category not found'
      });
    }

    const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
    const transformedCategory = {
      ...categoryObj,
      status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
    };

    res.json({
      success: true,
      data: transformedCategory
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateUserCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, description, categoryType, permissions } = req.body;

    const category = await UserCategory.findByIdAndUpdate(
      id,
      {
        role,
        description,
        categoryType,
        permissions
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'User category not found'
      });
    }

    const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
    const transformedCategory = {
      ...categoryObj,
      status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
    };

    res.json({
      success: true,
      message: 'User category updated successfully',
      data: transformedCategory
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateUserCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('🔄 Updating user category status:', { id, status });

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "inactive"'
      });
    }

    const isBlocked = status === 'inactive';

    const category = await UserCategory.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true, runValidators: true }
    );

    if (!category) {
      console.log('❌ User category not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'User category not found'
      });
    }

    console.log('✅ User category status updated successfully:', category.role, '->', status);

    const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
    const transformedCategory = {
      ...categoryObj,
      status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
    };

    res.json({
      success: true,
      message: `User category ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: transformedCategory
    });
  } catch (error: any) {
    console.error('❌ Error updating user category status:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteUserCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('🔄 Attempting to delete user category with ID:', id);

    const category = await UserCategory.findByIdAndDelete(id);
    if (!category) {
      console.log('❌ User category not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'User category not found'
      });
    }

    console.log('✅ User category deleted successfully:', category.role);
    
    res.json({
      success: true,
      message: 'User category deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting user category:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get only supplier type categories for supplier selection
export const getSupplierUserCategories = async (req: Request, res: Response) => {
  try {
    const categories = await UserCategory.find({
      categoryType: 'Supplier',
      isBlocked: false
    }).select('role description');

    const transformedCategories = categories.map(category => {
      const categoryObj = category.toObject() as UserCategoryWithIsBlocked;
      return {
        ...categoryObj,
        status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
      };
    });

    res.json({
      success: true,
      data: transformedCategories
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== NEW PERMISSIONS FUNCTIONS ==========

/**
 * Get all available system permissions
 */
export const getSystemPermissions = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        permissions: SYSTEM_PERMISSIONS
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system permissions',
      error: error.message
    });
  }
};

/**
 * Get permissions for specific user category
 */
export const getCategoryPermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userCategory = await UserCategory.findById(id);
    if (!userCategory) {
      return res.status(404).json({
        success: false,
        message: 'User category not found'
      });
    }

    const categoryObj = userCategory.toObject() as UserCategoryWithIsBlocked;
    const transformedCategory = {
      ...categoryObj,
      status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
    };

    res.json({
      success: true,
      data: {
        category: {
          _id: transformedCategory._id,
          role: transformedCategory.role,
          categoryType: transformedCategory.categoryType,
          status: transformedCategory.status
        },
        permissions: transformedCategory.permissions
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category permissions',
      error: error.message
    });
  }
};

/**
 * Update permissions for user category
 */
export const updateCategoryPermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array'
      });
    }

    // FIXED: TypeScript error - convert to array of strings for validation
    const validPermissions = Object.values(SYSTEM_PERMISSIONS) as string[];
    const invalidPermissions = permissions.filter((p: string) => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`
      });
    }

    const userCategory = await UserCategory.findByIdAndUpdate(
      id,
      { permissions },
      { new: true }
    );

    if (!userCategory) {
      return res.status(404).json({
        success: false,
        message: 'User category not found'
      });
    }

    const categoryObj = userCategory.toObject() as UserCategoryWithIsBlocked;
    const transformedCategory = {
      ...categoryObj,
      status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
    };

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      data: {
        category: {
          _id: transformedCategory._id,
          role: transformedCategory.role,
          categoryType: transformedCategory.categoryType,
          status: transformedCategory.status
        },
        permissions: transformedCategory.permissions
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating permissions',
      error: error.message
    });
  }
};

/**
 * Assign permission group to user category
 */
export const assignPermissionGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { group } = req.body;

    // Define permission groups with string arrays (FIXED TypeScript issue)
    const PERMISSION_GROUPS: { [key: string]: string[] } = {
      full_access: Object.values(SYSTEM_PERMISSIONS) as string[],
      read_only: [
        'dashboard.view',
        'users.view',
        'user_categories.view', 
        'suppliers.view',
        'supplier_categories.view',
        'projects.view',
        'analytics.view',
        'settings.view'
      ],
      manager: [
        'dashboard.view',
        'users.view', 'users.edit',
        'user_categories.view', 'user_categories.edit', 
        'suppliers.view', 'suppliers.edit',
        'supplier_categories.view', 'supplier_categories.edit',
        'projects.view',
        'analytics.view',
        'settings.view'
      ],
      basic: ['dashboard.view', 'users.view', 'suppliers.view']
    };

    if (!PERMISSION_GROUPS[group]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid permission group'
      });
    }

    const permissions = PERMISSION_GROUPS[group];

    const userCategory = await UserCategory.findByIdAndUpdate(
      id,
      { permissions },
      { new: true }
    );

    if (!userCategory) {
      return res.status(404).json({
        success: false,
        message: 'User category not found'
      });
    }

    const categoryObj = userCategory.toObject() as UserCategoryWithIsBlocked;
    const transformedCategory = {
      ...categoryObj,
      status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
    };

    res.json({
      success: true,
      message: `Permission group '${group}' assigned successfully`,
      data: {
        category: {
          _id: transformedCategory._id,
          role: transformedCategory.role,
          categoryType: transformedCategory.categoryType,
          status: transformedCategory.status
        },
        permissions: transformedCategory.permissions
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error assigning permission group',
      error: error.message
    });
  }
};
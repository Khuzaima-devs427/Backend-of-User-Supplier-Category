// // controllers/userCategoryController.ts
// import { Request, Response } from 'express';
// import { UserCategory } from '../models/UserCategory';

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

// // Define system permissions (add this at the top)
// export const SYSTEM_PERMISSIONS = {
//   // Dashboard
//   'dashboard.view': 'dashboard.view',
  
//   // Users
//   'users.view': 'users.view',
//   'users.create': 'users.create', 
//   'users.edit': 'users.edit',
//   'users.delete': 'users.delete',
  
//   // User Categories
//   'user_categories.view': 'user_categories.view',
//   'user_categories.create': 'user_categories.create',
//   'user_categories.edit': 'user_categories.edit',
//   'user_categories.delete': 'user_categories.delete',
  
//   // Suppliers
//   'suppliers.view': 'suppliers.view',
//   'suppliers.create': 'suppliers.create',
//   'suppliers.edit': 'suppliers.edit', 
//   'suppliers.delete': 'suppliers.delete',
  
//   // Supplier Categories
//   'supplier_categories.view': 'supplier_categories.view',
//   'supplier_categories.create': 'supplier_categories.create',
//   'supplier_categories.edit': 'supplier_categories.edit',
//   'supplier_categories.delete': 'supplier_categories.delete',


//   'hero_slider.view': 'hero_slider.view',
//   'hero_slider.create': 'hero_slider.create',
//   'hero_slider.edit': 'hero_slider.edit', 
//   'hero_slider.delete': 'hero_slider.delete',
  

//   // Category Cards
//   'category_cards.view': 'category_cards.view',
//   'category_cards.create': 'category_cards.create',
//   'category_cards.edit': 'category_cards.edit',
//   'category_cards.delete': 'category_cards.delete',
  
//   // Featured Sales
//   'featured_sales.view': 'featured_sales.view',
//   'featured_sales.create': 'featured_sales.create',
//   'featured_sales.edit': 'featured_sales.edit',
//   'featured_sales.delete': 'featured_sales.delete',

//   // Announcement Bar
//   'announcement_bar.view': 'announcement_bar.view',
//   'announcement_bar.create': 'announcement_bar.create',
//   'announcement_bar.edit': 'announcement_bar.edit',
//   'announcement_bar.delete': 'announcement_bar.delete',
  
//   // Featured Categories
//   'feature_categories.view': 'feature_categories.view',
//   'feature_categories.create': 'feature_categories.create',
//   'feature_categories.edit': 'feature_categories.edit',
//   'feature_categories.delete': 'feature_categories.delete',
  
//   // Featured Listings
//   'featured_listings.view': 'featured_listings.view',
//   'featured_listings.create': 'featured_listings.create',
//   'featured_listings.edit': 'featured_listings.edit',
//   'featured_listings.delete': 'featured_listings.delete',
  
//   // Featured Reviews
//   'featured_reviews.view': 'featured_reviews.view',
//   'featured_reviews.create': 'featured_reviews.create',
//   'featured_reviews.edit': 'featured_reviews.edit',
//   'featured_reviews.delete': 'featured_reviews.delete',
  
//   // Deals
//   'deals.view': 'deals.view',
//   'deals.create': 'deals.create',
//   'deals.edit': 'deals.edit',
//   'deals.delete': 'deals.delete',

//   // About Us
//   'about_us.view': 'about_us.view',
//   'about_us.create': 'about_us.create',
//   'about_us.edit': 'about_us.edit',
//   'about_us.delete': 'about_us.delete',
  
//   // Security
//   'security.view': 'security.view',
//   'security.create': 'security.create',
//   'security.edit': 'security.edit',
//   'security.delete': 'security.delete',

//   // Projects
//   'projects.view': 'projects.view',
  
//   // Analytics
//   'analytics.view': 'analytics.view',
  
//   // Settings
//   'settings.view': 'settings.view',
// } as const;

// // Create a type for the permission values
// export type SystemPermission = typeof SYSTEM_PERMISSIONS[keyof typeof SYSTEM_PERMISSIONS];

// // ========== EXISTING FUNCTIONS (UNCHANGED) ==========

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

//     if (!status || !['active', 'inactive'].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status. Must be "active" or "inactive"'
//       });
//     }

//     const isBlocked = status === 'inactive';

//     const category = await UserCategory.findByIdAndUpdate(
//       id,
//       { isBlocked },
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
//       categoryType: 'Supplier',
//       isBlocked: false
//     }).select('role description');

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

// // ========== NEW PERMISSIONS FUNCTIONS ==========

// /**
//  * Get all available system permissions
//  */
// export const getSystemPermissions = async (req: Request, res: Response) => {
//   try {
//     res.json({
//       success: true,
//       data: {
//         permissions: SYSTEM_PERMISSIONS
//       }
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching system permissions',
//       error: error.message
//     });
//   }
// };

// /**
//  * Get permissions for specific user category
//  */
// export const getCategoryPermissions = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const userCategory = await UserCategory.findById(id);
//     if (!userCategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'User category not found'
//       });
//     }

//     const categoryObj = userCategory.toObject() as UserCategoryWithIsBlocked;
//     const transformedCategory = {
//       ...categoryObj,
//       status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
//     };

//     res.json({
//       success: true,
//       data: {
//         category: {
//           _id: transformedCategory._id,
//           role: transformedCategory.role,
//           categoryType: transformedCategory.categoryType,
//           status: transformedCategory.status
//         },
//         permissions: transformedCategory.permissions
//       }
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching category permissions',
//       error: error.message
//     });
//   }
// };

// /**
//  * Update permissions for user category
//  */
// export const updateCategoryPermissions = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { permissions } = req.body;

//     if (!Array.isArray(permissions)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Permissions must be an array'
//       });
//     }

//     // FIXED: TypeScript error - convert to array of strings for validation
//     const validPermissions = Object.values(SYSTEM_PERMISSIONS) as string[];
//     const invalidPermissions = permissions.filter((p: string) => !validPermissions.includes(p));
    
//     if (invalidPermissions.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid permissions: ${invalidPermissions.join(', ')}`
//       });
//     }

//     const userCategory = await UserCategory.findByIdAndUpdate(
//       id,
//       { permissions },
//       { new: true }
//     );

//     if (!userCategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'User category not found'
//       });
//     }

//     const categoryObj = userCategory.toObject() as UserCategoryWithIsBlocked;
//     const transformedCategory = {
//       ...categoryObj,
//       status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
//     };

//     res.json({
//       success: true,
//       message: 'Permissions updated successfully',
//       data: {
//         category: {
//           _id: transformedCategory._id,
//           role: transformedCategory.role,
//           categoryType: transformedCategory.categoryType,
//           status: transformedCategory.status
//         },
//         permissions: transformedCategory.permissions
//       }
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: 'Error updating permissions',
//       error: error.message
//     });
//   }
// };

// /**
//  * Assign permission group to user category
//  */
// export const assignPermissionGroup = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { group } = req.body;

//     // Define permission groups with string arrays (FIXED TypeScript issue)
//     const PERMISSION_GROUPS: { [key: string]: string[] } = {
//       full_access: Object.values(SYSTEM_PERMISSIONS) as string[],
//       read_only: [
//         'dashboard.view',
//         'users.view',
//         'user_categories.view', 
//         'suppliers.view',
//         'supplier_categories.view',
//         'hero_slider.view',
//         'category_cards.view',
//         'featured_sales.view',
//         'announcement_bar.view',
//         'feature_categories.view',
//         'featured_listings.view',
//         'featured_reviews.view',
//         'deals.view',
//         'about_us.view',
//         'security.view',
//         'projects.view',
//         'analytics.view',
//         'settings.view'
//       ],
//       manager: [
//         'dashboard.view',
//         'users.view', 'users.edit',
//         'user_categories.view', 'user_categories.edit', 
//         'suppliers.view', 'suppliers.edit',
//         'supplier_categories.view', 'supplier_categories.edit',
//         'content_management.view', 'content_management.edit',
//         'hero_slider.view', 'hero_slider.edit',
//         'category_cards.view', 'category_cards.edit',
//         'featured_sales.view', 'featured_sales.edit',
//         'announcement_bar.view', 'announcement_bar.edit',
//         'feature_categories.view', 'feature_categories.edit',
//         'featured_listings.view', 'featured_listings.edit',
//         'featured_reviews.view', 'featured_reviews.edit',
//         'deals.view', 'deals.edit',
//         'about_us.view', 'about_us.edit',
//         'security.view', 'security.edit',
//         'projects.view',
//         'analytics.view',
//         'settings.view'
//       ],
//       basic: ['dashboard.view', 'users.view', 'suppliers.view', 'content_management.view', 'hero_slider.view', 'category_cards.view', 'featured_sales.view', 'announcement_bar.view', 'feature_categories.view', 'featured_listings.view', 'featured_reviews.view', 'deals.view', 'about_us.view', 'security.view']
//     };

//     if (!PERMISSION_GROUPS[group]) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid permission group'
//       });
//     }

//     const permissions = PERMISSION_GROUPS[group];

//     const userCategory = await UserCategory.findByIdAndUpdate(
//       id,
//       { permissions },
//       { new: true }
//     );

//     if (!userCategory) {
//       return res.status(404).json({
//         success: false,
//         message: 'User category not found'
//       });
//     }

//     const categoryObj = userCategory.toObject() as UserCategoryWithIsBlocked;
//     const transformedCategory = {
//       ...categoryObj,
//       status: (categoryObj as any).isBlocked ? 'inactive' : 'active'
//     };

//     res.json({
//       success: true,
//       message: `Permission group '${group}' assigned successfully`,
//       data: {
//         category: {
//           _id: transformedCategory._id,
//           role: transformedCategory.role,
//           categoryType: transformedCategory.categoryType,
//           status: transformedCategory.status
//         },
//         permissions: transformedCategory.permissions
//       }
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: 'Error assigning permission group',
//       error: error.message
//     });
//   }
// };












import { Request, Response } from 'express';
import { UserCategory } from '../models/UserCategory';

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

// Define system permissions (UPDATED - added content_management.view)
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

  // ========== CONTENT MANAGEMENT SECTION ==========
  // Content Management (Parent - Only View)
  'content_management.view': 'content_management.view',
  
  // Hero Slider
  'hero_slider.view': 'hero_slider.view',
  'hero_slider.create': 'hero_slider.create',
  'hero_slider.edit': 'hero_slider.edit', 
  'hero_slider.delete': 'hero_slider.delete',
  
  // Category Cards
  'category_cards.view': 'category_cards.view',
  'category_cards.create': 'category_cards.create',
  'category_cards.edit': 'category_cards.edit',
  'category_cards.delete': 'category_cards.delete',
  
  // Featured Sales
  'featured_sales.view': 'featured_sales.view',
  'featured_sales.create': 'featured_sales.create',
  'featured_sales.edit': 'featured_sales.edit',
  'featured_sales.delete': 'featured_sales.delete',

  // Announcement Bar
  'announcement_bar.view': 'announcement_bar.view',
  'announcement_bar.create': 'announcement_bar.create',
  'announcement_bar.edit': 'announcement_bar.edit',
  'announcement_bar.delete': 'announcement_bar.delete',
  
  // Featured Categories
  'feature_categories.view': 'feature_categories.view',
  'feature_categories.create': 'feature_categories.create',
  'feature_categories.edit': 'feature_categories.edit',
  'feature_categories.delete': 'feature_categories.delete',
  
  // Featured Listings
  'featured_listings.view': 'featured_listings.view',
  'featured_listings.create': 'featured_listings.create',
  'featured_listings.edit': 'featured_listings.edit',
  'featured_listings.delete': 'featured_listings.delete',
  
  // Featured Reviews
  'featured_reviews.view': 'featured_reviews.view',
  'featured_reviews.create': 'featured_reviews.create',
  'featured_reviews.edit': 'featured_reviews.edit',
  'featured_reviews.delete': 'featured_reviews.delete',
  
  // Deals
  'deals.view': 'deals.view',
  'deals.create': 'deals.create',
  'deals.edit': 'deals.edit',
  'deals.delete': 'deals.delete',

  // About Us
  'about_us.view': 'about_us.view',
  'about_us.create': 'about_us.create',
  'about_us.edit': 'about_us.edit',
  'about_us.delete': 'about_us.delete',
  
  // Security
  'security.view': 'security.view',
  'security.create': 'security.create',
  'security.edit': 'security.edit',
  'security.delete': 'security.delete',

  // Projects
  'projects.view': 'projects.view',
  
  // Analytics
  'analytics.view': 'analytics.view',
  
  // Settings
  'settings.view': 'settings.view',
} as const;

// Create a type for the permission values
export type SystemPermission = typeof SYSTEM_PERMISSIONS[keyof typeof SYSTEM_PERMISSIONS];

// ========== PERMISSION HIERARCHY HELPER ==========

/**
 * Permission hierarchy helper functions
 * This defines parent-child relationships for permissions
 */
export const PERMISSION_HIERARCHY = {
  // Parent-child relationships
  parentChildMap: {
    'content_management': {
      parent: 'content_management.view',
      children: [
        'hero_slider',
        'category_cards',
        'featured_sales',
        'announcement_bar',
        'feature_categories',
        'featured_listings',
        'featured_reviews',
        'deals',
        'about_us'
      ]
    }
  },

  /**
   * Check if user has access to a content management component
   * User needs BOTH: content_management.view AND the specific component permission
   */
  checkContentPermission: (
    userPermissions: string[],
    component: string,
    action: 'view' | 'create' | 'edit' | 'delete'
  ): boolean => {
    const specificPermission = `${component}.${action}`;
    const hasParentPermission = userPermissions.includes('content_management.view');
    const hasComponentPermission = userPermissions.includes(specificPermission);
    
    return hasParentPermission && hasComponentPermission;
  },

  /**
   * Get all content management component permissions for a user
   * Returns an object with component permissions
   */
  getUserContentPermissions: (userPermissions: string[]) => {
    const components = PERMISSION_HIERARCHY.parentChildMap.content_management.children;
    const permissions: {[key: string]: boolean} = {};
    
    components.forEach(component => {
      permissions[`${component}.view`] = PERMISSION_HIERARCHY.checkContentPermission(userPermissions, component, 'view');
      permissions[`${component}.create`] = PERMISSION_HIERARCHY.checkContentPermission(userPermissions, component, 'create');
      permissions[`${component}.edit`] = PERMISSION_HIERARCHY.checkContentPermission(userPermissions, component, 'edit');
      permissions[`${component}.delete`] = PERMISSION_HIERARCHY.checkContentPermission(userPermissions, component, 'delete');
    });
    
    return permissions;
  },

  /**
   * Get flattened permissions for content management
   * Includes parent permission + all component permissions
   */
  getAllContentPermissions: (): string[] => {
    const components = PERMISSION_HIERARCHY.parentChildMap.content_management.children;
    const allPermissions: string[] = ['content_management.view'];
    
    components.forEach(component => {
      allPermissions.push(
        `${component}.view`,
        `${component}.create`,
        `${component}.edit`,
        `${component}.delete`
      );
    });
    
    return allPermissions;
  }
};

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
    // Get all content management permissions
    const allContentPermissions = PERMISSION_HIERARCHY.getAllContentPermissions();
    
    res.json({
      success: true,
      data: {
        permissions: SYSTEM_PERMISSIONS,
        // Optional: Include hierarchical info for frontend
        hierarchy: {
          content_management: PERMISSION_HIERARCHY.parentChildMap.content_management
        }
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
        permissions: transformedCategory.permissions,
        // Optional: Add content management specific info
        contentPermissions: PERMISSION_HIERARCHY.getUserContentPermissions(transformedCategory.permissions)
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
        permissions: transformedCategory.permissions,
        contentPermissions: PERMISSION_HIERARCHY.getUserContentPermissions(transformedCategory.permissions)
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

    // Define permission groups with string arrays (UPDATED - added content_management.view)
    const PERMISSION_GROUPS: { [key: string]: string[] } = {
      full_access: Object.values(SYSTEM_PERMISSIONS) as string[],
      read_only: [
        'dashboard.view',
        'users.view',
        'user_categories.view', 
        'suppliers.view',
        'supplier_categories.view',
        'content_management.view', // Added parent permission
        'hero_slider.view',
        'category_cards.view',
        'featured_sales.view',
        'announcement_bar.view',
        'feature_categories.view',
        'featured_listings.view',
        'featured_reviews.view',
        'deals.view',
        'about_us.view',
        'security.view',
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
        'content_management.view', // Added parent permission
        'hero_slider.view', 'hero_slider.edit',
        'category_cards.view', 'category_cards.edit',
        'featured_sales.view', 'featured_sales.edit',
        'announcement_bar.view', 'announcement_bar.edit',
        'feature_categories.view', 'feature_categories.edit',
        'featured_listings.view', 'featured_listings.edit',
        'featured_reviews.view', 'featured_reviews.edit',
        'deals.view', 'deals.edit',
        'about_us.view', 'about_us.edit',
        'security.view', 'security.edit',
        'projects.view',
        'analytics.view',
        'settings.view'
      ],
      content_manager: [
        'dashboard.view',
        'content_management.view', // Parent permission
        'hero_slider.view', 'hero_slider.create', 'hero_slider.edit', 'hero_slider.delete',
        'category_cards.view', 'category_cards.create', 'category_cards.edit', 'category_cards.delete',
        'featured_sales.view', 'featured_sales.create', 'featured_sales.edit', 'featured_sales.delete',
        'announcement_bar.view', 'announcement_bar.create', 'announcement_bar.edit', 'announcement_bar.delete',
        'feature_categories.view', 'feature_categories.create', 'feature_categories.edit', 'feature_categories.delete',
        'featured_listings.view', 'featured_listings.create', 'featured_listings.edit', 'featured_listings.delete',
        'featured_reviews.view', 'featured_reviews.create', 'featured_reviews.edit', 'featured_reviews.delete',
        'deals.view', 'deals.create', 'deals.edit', 'deals.delete',
        'about_us.view', 'about_us.create', 'about_us.edit', 'about_us.delete',
        'security.view' // Can view security but not edit
      ],
      basic: [
        'dashboard.view', 
        'users.view', 
        'suppliers.view', 
        'content_management.view', // Added parent permission
        'hero_slider.view',
        'category_cards.view',
        'featured_sales.view',
        'announcement_bar.view',
        'feature_categories.view',
        'featured_listings.view',
        'featured_reviews.view',
        'deals.view',
        'about_us.view',
        'security.view'
      ]
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
        permissions: transformedCategory.permissions,
        contentPermissions: PERMISSION_HIERARCHY.getUserContentPermissions(transformedCategory.permissions)
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

/**
 * Helper function to check if user has permission to access content management
 * Use this in your middleware or route handlers
 */
export const checkContentAccess = (userPermissions: string[], component: string, action: string): boolean => {
  return PERMISSION_HIERARCHY.checkContentPermission(userPermissions, component, action as any);
};
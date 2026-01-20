// // controllers/authController.ts
// import { Request, Response } from 'express';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// // import AuthUser from '../models/User';
// import { User } from '../models/User';
// import { UserCategory } from '../models/UserCategory';

// // Static Admin Credentials
// const STATIC_ADMIN = {
//   email: 'admin@example.com',
//   password: 'admin123',
//   // name: 'Super Admin',
//   role: 'admin'
// };

// // Generate JWT Token
// const generateToken = (userId: string, email: string, role: string, permissions: any) => {
//   return jwt.sign(
//     { userId, email, role, permissions },
//     process.env.JWT_SECRET || 'your-secret-key',
//     { expiresIn: '7d' }
//   );
// };

// // ==================== UPDATED: Permission Functions ====================

// /**
//  * Get permissions based on user's role from UnifiedModel.User
//  */
// const getUserPermissions = async (email: string) => {
//   try {
//     console.log('Getting permissions for email:', email);
    
//     // 1. Static Admin gets all permissions
//     if (email === STATIC_ADMIN.email) {
//       console.log('Static admin detected, giving full permissions');
//       return getAdminPermissions();
//     }

//     // 2. Check if user exists in UnifiedModel.User
//     console.log('Checking if user exists in UnifiedModel...');
//     const unifiedUser = await User.findOne({ email: email.toLowerCase() })
//       .populate('userType', 'permissions categoryType')
//       .select('userType isBlocked');

//     if (unifiedUser) {
//       console.log('User found in UnifiedModel:', {
//         email: unifiedUser.email,
//         userType: unifiedUser.userType,
//         isBlocked: unifiedUser.isBlocked
//       });

//       // Check if user is blocked
//       if (unifiedUser.isBlocked) {
//         console.log('User is blocked, giving minimal permissions');
//         return getBlockedUserPermissions();
//       }

//       // Check if user has a userType
//       if (unifiedUser.userType) {
//         const userCategory = unifiedUser.userType as any;
//         console.log('UserCategory found:', {
//           role: userCategory.role,
//           categoryType: userCategory.categoryType,
//           permissionsCount: userCategory.permissions?.length || 0
//         });

//         if (userCategory.permissions && userCategory.permissions.length > 0) {
//           // User has specific permissions in UserCategory
//           const permissions = convertPermissionsToObject(userCategory.permissions);
//           console.log('Converted permissions:', {
//             create: permissions.create,
//             edit: permissions.edit,
//             delete: permissions.delete,
//             totalPermissions: Object.keys(permissions).length
//           });
//           return permissions;
//         }
//       }
//     }

//     // 3. User not found in UnifiedModel or has no permissions set
//     console.log('User not in UnifiedModel or no permissions set, giving view-only');
//     return getDefaultViewPermissions();
    
//   } catch (error) {
//     console.error('Error getting user permissions:', error);
//     return getDefaultViewPermissions();
//   }
// };

// /**
//  * Convert array of permission strings to permission object
//  */
// const convertPermissionsToObject = (permissionArray: string[]) => {
//   const permissions: any = {
//     // Basic permissions everyone gets (except blocked users)
//     view: true,
//     editProfile: true,
//     changePassword: true,
    
//     // Initialize all permissions as false
//     create: false,
//     edit: false,
//     delete: false,
//     manageUsers: false,
//     manageSuppliers: false,
//     manageCategories: false,
//     viewAnalytics: false,
//     manageSettings: false,
//     blockUsers: false,
//     approveSuppliers: false,
    
//     // IMPORTANT: Add isStaticAdmin flag (false by default)
//     isStaticAdmin: false,
    
//     // System permissions from PERMISSIONS constant
//     // 'dashboard.view': false,
//     // 'users.view': false,
//     // 'users.create': false,
//     // 'users.edit': false,
//     // 'users.delete': false,
//     // 'user_categories.view': false,
//     // 'user_categories.create': false,
//     // 'user_categories.edit': false,
//     // 'user_categories.delete': false,
//     // 'suppliers.view': false,
//     // 'suppliers.create': false,
//     // 'suppliers.edit': false,
//     // 'suppliers.delete': false,
//     // 'supplier_categories.view': false,
//     // 'supplier_categories.create': false,
//     // 'supplier_categories.edit': false,
//     // 'supplier_categories.delete': false,
//     // 'hero_slider.view': false,
//     // 'hero_slider.create': false,
//     // 'hero_slider.edit': false,
//     // 'hero_slider.delete': false,
//     // 'projects.view': false,
//     // 'analytics.view': false,
//     // 'settings.view': false


// // Dashboard
//   'dashboard.view': false,
  
//   // Users Management
//   'users.view': false,
//   'users.create': false,
//   'users.edit': false,
//   'users.delete': false,
  
//   // User Categories
//   'user_categories.view': false,
//   'user_categories.create': false,
//   'user_categories.edit': false,
//   'user_categories.delete': false,
  
//   // Suppliers Management
//   'suppliers.view': false,
//   'suppliers.create': false,
//   'suppliers.edit': false,
//   'suppliers.delete': false,
  
//   // Supplier Categories
//   'supplier_categories.view': false,
//   'supplier_categories.create': false,
//   'supplier_categories.edit': false,
//   'supplier_categories.delete': false,
  
// // Content Management (Parent - Main Page Access)
// 'content_management.view': false,
// 'content_management.create': false,
// 'content_management.edit': false,
// 'content_management.delete': false,

//   // Hero Slider
//   'hero_slider.view': false,
//   'hero_slider.create': false,
//   'hero_slider.edit': false,
//   'hero_slider.delete': false,
  
//   // Category Cards
//   'category_cards.view': false,
//   'category_cards.create': false,
//   'category_cards.edit': false,
//   'category_cards.delete': false,
  
//   // Featured Sales
//   'featured_sales.view': false,
//   'featured_sales.create': false,
//   'featured_sales.edit': false,
//   'featured_sales.delete': false,
  
//   // Announcement Bar
//   'announcement_bar.view': false,
//   'announcement_bar.create': false,
//   'announcement_bar.edit': false,
//   'announcement_bar.delete': false,
  
//   // Featured Categories
//   'feature_categories.view': false,
//   'feature_categories.create': false,
//   'feature_categories.edit': false,
//   'feature_categories.delete': false,
  
//   // Featured Listings
//   'featured_listings.view': false,
//   'featured_listings.create': false,
//   'featured_listings.edit': false,
//   'featured_listings.delete': false,
  
//   // Featured Reviews
//   'featured_reviews.view': false,
//   'featured_reviews.create': false,
//   'featured_reviews.edit': false,
//   'featured_reviews.delete': false,
  
//   // Deals
//   'deals.view': false,
//   'deals.create': false,
//   'deals.edit': false,
//   'deals.delete': false,
  
//   // About Us
//   'about_us.view': false,
//   'about_us.create': false,
//   'about_us.edit': false,
//   'about_us.delete': false,
  
//   // Security
//   'security.view': false,
//   'security.create': false,
//   'security.edit': false,
//   'security.delete': false,
  
//   // Projects
//   'projects.view': false,
  
//   // Analytics
//   'analytics.view': false,
  
//   // Settings
//   'settings.view': false

//   };

//   // Set permissions based on array
//   permissionArray.forEach((permission: string) => {
//     permissions[permission] = true;
    
//     // Set derived permissions
//     if (permission.includes('.create')) {
//       permissions.create = true;
//     }
//     if (permission.includes('.edit')) {
//       permissions.edit = true;
//     }
//     if (permission.includes('.delete')) {
//       permissions.delete = true;
//     }
    
//     // Set management permissions
//     if (permission.includes('users.')) {
//       permissions.manageUsers = true;
//     }
//     if (permission.includes('suppliers.')) {
//       permissions.manageSuppliers = true;
//     }
//     if (permission.includes('categories.')) {
//       permissions.manageCategories = true;
//     }
//          if (permission.includes('hero_slider.')) {
//       permissions.manageSuppliers = true;
//     }
//     if (permission.includes('analytics.')) {
//       permissions.viewAnalytics = true;
//     }
//     if (permission.includes('settings.')) {
//       permissions.manageSettings = true;
//     }
//   });

//   return permissions;
// };

// /**
//  * Admin permissions (for static admin only)
//  */
// const getAdminPermissions = () => {
//   return {
//     // CRITICAL: Add isStaticAdmin flag
//     isStaticAdmin: true,
    
//     view: true,
//     editProfile: true,
//     changePassword: true,
//     create: true,
//     edit: true,
//     delete: true,
//     manageUsers: true,
//     manageSuppliers: true,
//     manageCategories: true,
//     viewAnalytics: true,
//     manageSettings: true,
//     blockUsers: true,
//     approveSuppliers: true,
    
//     // All system permissions
//     // 'dashboard.view': true,
//     // 'users.view': true,
//     // 'users.create': true,
//     // 'users.edit': true,
//     // 'users.delete': true,
//     // 'user_categories.view': true,
//     // 'user_categories.create': true,
//     // 'user_categories.edit': true,
//     // 'user_categories.delete': true,
//     // 'suppliers.view': true,
//     // 'suppliers.create': true,
//     // 'suppliers.edit': true,
//     // 'suppliers.delete': true,
//     // 'supplier_categories.view': true,
//     // 'supplier_categories.create': true,
//     // 'supplier_categories.edit': true,
//     // 'supplier_categories.delete': true,
//     // 'hero_slider.view': true,
//     // 'hero_slider.create': true,
//     // 'hero_slider.edit': true,
//     // 'hero_slider.delete': true,
//     // 'projects.view': true,
//     // 'analytics.view': true,
//     // 'settings.view': true



//  // Dashboard
//   'dashboard.view': false,
  
//   // Users Management
//   'users.view': false,
//   'users.create': false,
//   'users.edit': false,
//   'users.delete': false,
  
//   // User Categories
//   'user_categories.view': false,
//   'user_categories.create': false,
//   'user_categories.edit': false,
//   'user_categories.delete': false,
  
//   // Suppliers Management
//   'suppliers.view': false,
//   'suppliers.create': false,
//   'suppliers.edit': false,
//   'suppliers.delete': false,
  
//   // Supplier Categories
//   'supplier_categories.view': false,
//   'supplier_categories.create': false,
//   'supplier_categories.edit': false,
//   'supplier_categories.delete': false,
  
// // Content Management (Parent - Main Page Access)
// 'content_management.view': false,
// 'content_management.create': false,
// 'content_management.edit': false,
// 'content_management.delete': false,

//   // Hero Slider
//   'hero_slider.view': false,
//   'hero_slider.create': false,
//   'hero_slider.edit': false,
//   'hero_slider.delete': false,
  
//   // Category Cards
//   'category_cards.view': false,
//   'category_cards.create': false,
//   'category_cards.edit': false,
//   'category_cards.delete': false,
  
//   // Featured Sales
//   'featured_sales.view': false,
//   'featured_sales.create': false,
//   'featured_sales.edit': false,
//   'featured_sales.delete': false,
  
//   // Announcement Bar
//   'announcement_bar.view': false,
//   'announcement_bar.create': false,
//   'announcement_bar.edit': false,
//   'announcement_bar.delete': false,
  
//   // Featured Categories
//   'feature_categories.view': false,
//   'feature_categories.create': false,
//   'feature_categories.edit': false,
//   'feature_categories.delete': false,
  
//   // Featured Listings
//   'featured_listings.view': false,
//   'featured_listings.create': false,
//   'featured_listings.edit': false,
//   'featured_listings.delete': false,
  
//   // Featured Reviews
//   'featured_reviews.view': false,
//   'featured_reviews.create': false,
//   'featured_reviews.edit': false,
//   'featured_reviews.delete': false,
  
//   // Deals
//   'deals.view': false,
//   'deals.create': false,
//   'deals.edit': false,
//   'deals.delete': false,
  
//   // About Us
//   'about_us.view': false,
//   'about_us.create': false,
//   'about_us.edit': false,
//   'about_us.delete': false,
  
//   // Security
//   'security.view': false,
//   'security.create': false,
//   'security.edit': false,
//   'security.delete': false,
  
//   // Projects
//   'projects.view': false,
  
//   // Analytics
//   'analytics.view': false,
  
//   // Settings
//   'settings.view': false

//   };
// };

// /**
//  * Default view-only permissions (for users not in UnifiedModel)
//  */
// const getDefaultViewPermissions = () => {
//   return {
//     isStaticAdmin: false,
//     view: true,
//     editProfile: true,
//     changePassword: true,
//     create: false,
//     edit: false,
//     delete: false,
//     manageUsers: false,
//     manageSuppliers: false,
//     manageCategories: false,
//     viewAnalytics: false,
//     manageSettings: false,
//     blockUsers: false,
//     approveSuppliers: false,
    
//     // Only view permissions
//     // 'dashboard.view': true,
//     // 'users.view': true,
//     // 'users.create': false,
//     // 'users.edit': false,
//     // 'users.delete': false,
//     // 'user_categories.view': true,
//     // 'user_categories.create': false,
//     // 'user_categories.edit': false,
//     // 'user_categories.delete': false,
//     // 'suppliers.view': true,
//     // 'suppliers.create': false,
//     // 'suppliers.edit': false,
//     // 'suppliers.delete': false,
//     // 'supplier_categories.view': true,
//     // 'supplier_categories.create': false,
//     // 'supplier_categories.edit': false,
//     // 'supplier_categories.delete': false,
//     // 'hero_slider.view': true,
//     // 'hero_slider.create': false,
//     // 'hero_slider.edit': false,
//     // 'hero_slider.delete': false,
//     // 'projects.view': true,
//     // 'analytics.view': false,
//     // 'settings.view': false



// // Dashboard
//   'dashboard.view': true,
  
//   // Users Management
//   'users.view': true,
//   'users.create': false,
//   'users.edit': false,
//   'users.delete': false,
  
//   // User Categories
//   'user_categories.view': true,
//   'user_categories.create': false,
//   'user_categories.edit': false,
//   'user_categories.delete': false,
  
//   // Suppliers Management
//   'suppliers.view': true,
//   'suppliers.create': false,
//   'suppliers.edit': false,
//   'suppliers.delete': false,
  
//   // Supplier Categories
//   'supplier_categories.view': true,
//   'supplier_categories.create': false,
//   'supplier_categories.edit': false,
//   'supplier_categories.delete': false,
  
// // Content Management (Parent - Main Page Access)
// 'content_management.view': true,
// 'content_management.create': true,
// 'content_management.edit': true,
// 'content_management.delete': true,

//   // Hero Slider
//   'hero_slider.view': true,
//   'hero_slider.create': false,
//   'hero_slider.edit': false,
//   'hero_slider.delete': false,
  
//   // Category Cards
//   'category_cards.view': true,
//   'category_cards.create': false,
//   'category_cards.edit': false,
//   'category_cards.delete': false,
  
//   // Featured Sales
//   'featured_sales.view': true,
//   'featured_sales.create': false,
//   'featured_sales.edit': false,
//   'featured_sales.delete': false,
  
//   // Announcement Bar
//   'announcement_bar.view': true,
//   'announcement_bar.create': false,
//   'announcement_bar.edit': false,
//   'announcement_bar.delete': false,
  
//   // Featured Categories
//   'feature_categories.view': true,
//   'feature_categories.create': false,
//   'feature_categories.edit': false,
//   'feature_categories.delete': false,
  
//   // Featured Listings
//   'featured_listings.view': true,
//   'featured_listings.create': false,
//   'featured_listings.edit': false,
//   'featured_listings.delete': false,
  
//   // Featured Reviews
//   'featured_reviews.view': true,
//   'featured_reviews.create': false,
//   'featured_reviews.edit': false,
//   'featured_reviews.delete': false,
  
//   // Deals
//   'deals.view': true,
//   'deals.create': false,
//   'deals.edit': false,
//   'deals.delete': false,
  
//   // About Us
//   'about_us.view': true,
//   'about_us.create': false,
//   'about_us.edit': false,
//   'about_us.delete': false,
  
//   // Security
//   'security.view': true,
//   'security.create': false,
//   'security.edit': false,
//   'security.delete': false,
  
//   // Projects
//   'projects.view': true,
  
//   // Analytics
//   'analytics.view': true,
  
//   // Settings
//   'settings.view': true

//   };
// };

// /**
//  * Minimal permissions for blocked users
//  */
// const getBlockedUserPermissions = () => {
//   return {
//     isStaticAdmin: false,
//     view: false,
//     editProfile: false,
//     changePassword: false,
//     create: false,
//     edit: false,
//     delete: false,
//     manageUsers: false,
//     manageSuppliers: false,
//     manageCategories: false,
//     viewAnalytics: false,
//     manageSettings: false,
//     blockUsers: false,
//     approveSuppliers: false,
    
//     // All system permissions false
//     // 'dashboard.view': false,
//     // 'users.view': false,
//     // 'users.create': false,
//     // 'users.edit': false,
//     // 'users.delete': false,
//     // 'user_categories.view': false,
//     // 'user_categories.create': false,
//     // 'user_categories.edit': false,
//     // 'user_categories.delete': false,
//     // 'suppliers.view': false,
//     // 'suppliers.create': false,
//     // 'suppliers.edit': false,
//     // 'suppliers.delete': false,
//     // 'supplier_categories.view': false,
//     // 'supplier_categories.create': false,
//     // 'supplier_categories.edit': false,
//     // 'supplier_categories.delete': false,
//     // 'hero_slider.view': false,
//     // 'hero_slider.create': false,
//     // 'hero_slider.edit': false,
//     // 'hero_slider.delete': false,
//     // 'projects.view': false,
//     // 'analytics.view': false,
//     // 'settings.view': false

// // Dashboard
//   'dashboard.view': false,
  
//   // Users Management
//   'users.view': false,
//   'users.create': false,
//   'users.edit': false,
//   'users.delete': false,
  
//   // User Categories
//   'user_categories.view': false,
//   'user_categories.create': false,
//   'user_categories.edit': false,
//   'user_categories.delete': false,
  
//   // Suppliers Management
//   'suppliers.view': false,
//   'suppliers.create': false,
//   'suppliers.edit': false,
//   'suppliers.delete': false,
  
//   // Supplier Categories
//   'supplier_categories.view': false,
//   'supplier_categories.create': false,
//   'supplier_categories.edit': false,
//   'supplier_categories.delete': false,
  
// // Content Management (Parent - Main Page Access)
// 'content_management.view': false,
// 'content_management.create': false,
// 'content_management.edit': false,
// 'content_management.delete': false,

//   // Hero Slider
//   'hero_slider.view': false,
//   'hero_slider.create': false,
//   'hero_slider.edit': false,
//   'hero_slider.delete': false,
  
//   // Category Cards
//   'category_cards.view': false,
//   'category_cards.create': false,
//   'category_cards.edit': false,
//   'category_cards.delete': false,
  
//   // Featured Sales
//   'featured_sales.view': false,
//   'featured_sales.create': false,
//   'featured_sales.edit': false,
//   'featured_sales.delete': false,
  
//   // Announcement Bar
//   'announcement_bar.view': false,
//   'announcement_bar.create': false,
//   'announcement_bar.edit': false,
//   'announcement_bar.delete': false,
  
//   // Featured Categories
//   'feature_categories.view': false,
//   'feature_categories.create': false,
//   'feature_categories.edit': false,
//   'feature_categories.delete': false,
  
//   // Featured Listings
//   'featured_listings.view': false,
//   'featured_listings.create': false,
//   'featured_listings.edit': false,
//   'featured_listings.delete': false,
  
//   // Featured Reviews
//   'featured_reviews.view': false,
//   'featured_reviews.create': false,
//   'featured_reviews.edit': false,
//   'featured_reviews.delete': false,
  
//   // Deals
//   'deals.view': false,
//   'deals.create': false,
//   'deals.edit': false,
//   'deals.delete': false,
  
//   // About Us
//   'about_us.view': false,
//   'about_us.create': false,
//   'about_us.edit': false,
//   'about_us.delete': false,
  
//   // Security
//   'security.view': false,
//   'security.create': false,
//   'security.edit': false,
//   'security.delete': false,
  
//   // Projects
//   'projects.view': false,
  
//   // Analytics
//   'analytics.view': false,
  
//   // Settings
//   'settings.view': false


//   };
// };

// // ==================== VALIDATION FUNCTIONS ====================

// const validateRegistration = (name: string, email: string, password: string): { isValid: boolean; message?: string } => {
//   if (!name || name.trim().length === 0) {
//     return { isValid: false, message: 'Name is required' };
//   }
  
//   if (name.trim().length < 2) {
//     return { isValid: false, message: 'Name must be at least 2 characters long' };
//   }
  
//   if (name.trim().length > 50) {
//     return { isValid: false, message: 'Name cannot exceed 50 characters' };
//   }
  
//   if (!email || email.trim().length === 0) {
//     return { isValid: false, message: 'Email is required' };
//   }
  
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return { isValid: false, message: 'Please enter a valid email address' };
//   }
  
//   if (!password) {
//     return { isValid: false, message: 'Password is required' };
//   }
  
//   if (password.length < 8) {
//     return { isValid: false, message: 'Password must be at least 8 characters long' };
//   }
  
//   return { isValid: true };
// };

// const validateLogin = ( email: string, password: string): { isValid: boolean; message?: string } => {
//   // if (!name || name.trim().length === 0) {
//   //   return { isValid: false, message: 'Name is required' };
//   // }
  
//   // if (name.trim().length < 2) {
//   //   return { isValid: false, message: 'Name must be at least 2 characters long' };
//   // }
  
//   if (!email || email.trim().length === 0) {
//     return { isValid: false, message: 'Email is required' };
//   }
  
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return { isValid: false, message: 'Please enter a valid email address' };
//   }
  
//   if (!password) {
//     return { isValid: false, message: 'Password is required' };
//   }
  
//   return { isValid: true };
// };

// // ==================== CONTROLLER FUNCTIONS ====================

// // export const register = async (req: Request, res: Response) => {
// //   try {
// //     const { name, email, password } = req.body;

// //     const validation = validateRegistration(name, email, password);
// //     if (!validation.isValid) {
// //       return res.status(400).json({
// //         success: false,
// //         message: validation.message
// //       });
// //     }

// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'User with this email already exists'
// //       });
// //     }

// //     let defaultCategory = await UserCategory.findOne({ 
// //       categoryType: 'Customer', 
// //       isBlocked: false 
// //     });

// //  if (!defaultCategory) {
// //       console.error('❌ Customer category not found in database');
// //       // Try to create it automatically
// //       const newCustomerCategory = new UserCategory({
// //         categoryType: 'Customer',
// //         isBlocked: false,
// //         createdBy: 'system'
// //       });
      
// //       await newCustomerCategory.save();
// //       console.log('✅ Created default Customer category');
// //       defaultCategory = newCustomerCategory;
// //     }

// //     console.log('✅ Using category for registration:', {
// //       categoryType: defaultCategory.categoryType
// //     });


// //     const user = new User({
// //       name: name.trim(),
// //       email: email.trim().toLowerCase(),
// //       password,
// //       userType: defaultCategory._id,
// //     } as any);

// //     await user.save();

// //     const permissions = getDefaultViewPermissions();
    
// //     const token = generateToken(user._id.toString(), user.email, 'user', permissions);

// //     res.status(201).json({
// //       success: true,
// //       message: 'Registration successful',
// //       data: {
// //         user: {
// //           _id: user._id,
// //           name: user.name,
// //           email: user.email,
// //           role: 'user'
// //         },
// //         token,
// //         permissions
// //       }
// //     });

// //   } catch (error: any) {
// //     console.error('Registration error:', error);
    
// //     if (error.name === 'ValidationError') {
// //       const messages = Object.values(error.errors).map((err: any) => err.message);
// //       return res.status(400).json({
// //         success: false,
// //         message: messages[0] || 'Validation failed'
// //       });
// //     }

// //     res.status(500).json({
// //       success: false,
// //       message: 'Internal server error. Please try again later.'
// //     });
// //   }
// // };

// // export const register = async (req: Request, res: Response) => {
// //   try {
// //     const { name, email, password } = req.body;

// //     console.log('🔍 Registration attempt:', { name, email });

// //     const validation = validateRegistration(name, email, password);
// //     if (!validation.isValid) {
// //       console.log('❌ Validation failed:', validation.message);
// //       return res.status(400).json({
// //         success: false,
// //         message: validation.message
// //       });
// //     }

// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) {
// //       console.log('❌ User already exists:', email);
// //       return res.status(400).json({
// //         success: false,
// //         message: 'User with this email already exists'
// //       });
// //     }

// //     // Create user with categoryType
// //     const user = new User({
// //       name: name.trim(),
// //       email: email.trim().toLowerCase(),
// //       password,
// //       categoryType: 'Customer', // Direct assignment
// //     });

// //     console.log('📝 User object before save:', {
// //       name: user.name,
// //       email: user.email,
// //       categoryType: user.categoryType,
// //       _id: user._id
// //     });

// //     // Save the user
// //     await user.save();
    
// //     console.log('✅ User saved successfully:', {
// //       _id: user._id,
// //       categoryType: user.categoryType
// //     });

// //     // Fetch the user again to verify categoryType was saved
// //     const savedUser = await User.findById(user._id).select('name email categoryType');
// //     console.log('🔍 User from database after save:', {
// //       _id: savedUser?._id,
// //       name: savedUser?.name,
// //       email: savedUser?.email,
// //       categoryType: savedUser?.categoryType // Check if it's 'Customer'
// //     });

// //     const permissions = getDefaultViewPermissions();
    
// //     const token = generateToken(
// //       user._id.toString(), 
// //       user.email, 
// //       savedUser?.categoryType || 'Customer', // Use saved categoryType
// //       permissions
// //     );

// //     res.status(201).json({
// //       success: true,
// //       message: 'Registration successful',
// //       data: {
// //         user: {
// //           _id: user._id,
// //           name: user.name,
// //           email: user.email,
// //           categoryType: savedUser?.categoryType || 'Customer' // Confirm in response
// //         },
// //         token,
// //         permissions
// //       }
// //     });

// //   } catch (error: any) {
// //     console.error('❌ Registration error details:', {
// //       name: error.name,
// //       message: error.message,
// //       code: error.code,
// //       errors: error.errors
// //     });
    
// //     if (error.name === 'ValidationError') {
// //       const messages = Object.values(error.errors).map((err: any) => err.message);
// //       console.log('❌ Validation errors:', messages);
// //       return res.status(400).json({
// //         success: false,
// //         message: messages[0] || 'Validation failed'
// //       });
// //     }

// //     // Handle duplicate key errors
// //     if (error.code === 11000) {
// //       console.log('❌ Duplicate email error');
// //       return res.status(400).json({
// //         success: false,
// //         message: 'User with this email already exists'
// //       });
// //     }

// //     res.status(500).json({
// //       success: false,
// //       message: 'Internal server error. Please try again later.'
// //     });
// //   }
// // };



// export const register = async (req: Request, res: Response) => {
//   try {
//     const { name, email, password } = req.body;

//     // Input validation
//     const validation = validateRegistration(name, email, password);
//     if (!validation.isValid) {
//       return res.status(400).json({
//         success: false,
//         message: validation.message
//       });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User with this email already exists'
//       });
//     }

//     // Step 1: Check if ANY customer role exists in UserCategory
//     // Search for roles that have 'customer' in the role field
//     const customerRoles = await UserCategory.find({
//       role: { $regex: /customer/i }, // Search in 'role' field
//       isBlocked: false
//     });

//     let customerCategory;

//     if (customerRoles.length > 0) {
//       // Step 2: If customer role exists, use the first one
//       customerCategory = customerRoles[0];
//       console.log('✅ Using existing customer role:', {
//         categoryId: customerCategory._id,
//         role: customerCategory.role,
//         categoryType: customerCategory.categoryType
//       });
//     } else {
//       // Step 3: If NO customer role exists, create a new one with:
//       // - role: "bydefault customer" (or "Customer")
//       // - categoryType: "Other" (from your enum)
//       console.log('⚠️ No customer role found, creating new "Customer" role...');
      
//       // Create new customer role in UserCategory
//       const newCustomerCategory = new UserCategory({
//         role: 'Customer', // Role name
//         categoryType: 'Other', // Must be from enum: 'Supplier', 'User', 'Admin', 'Super Admin', 'Other'
//         description: 'Default customer role for registered users',
//         permissions: [], // Add default permissions if needed
//         isBlocked: false,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       });
      
//       await newCustomerCategory.save();
//       customerCategory = newCustomerCategory;
      
//       console.log('✅ Created new customer role in UserCategory:', {
//         categoryId: customerCategory._id,
//         role: customerCategory.role,
//         categoryType: customerCategory.categoryType
//       });
//     }

//     // Create the new user with the customer role
//     const user = new User({
//       name: name.trim(),
//       email: email.trim().toLowerCase(),
//       password,
//       userType: customerCategory._id, // Assign customer role
//     } as any);

//     await user.save();

//     // Generate permissions and token
//     const permissions = getDefaultViewPermissions();
//     const token = generateToken(user._id.toString(), user.email, 'user', permissions);

//     // Send success response
//     res.status(201).json({
//       success: true,
//       message: 'Registration successful',
//       data: {
//         user: {
//           _id: user._id,
//           name: user.name,
//           email: user.email,
//           role: 'user',
//           userType: customerCategory.role, // This will show "bydefault customer"
//           userTypeId: customerCategory._id,
//           categoryType: customerCategory.categoryType // This will show "Other"
//         },
//         token,
//         permissions
//       }
//     });

//   } catch (error: any) {
//     console.error('Registration error:', error);
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map((err: any) => err.message);
//       return res.status(400).json({
//         success: false,
//         message: messages[0] || 'Validation failed'
//       });
//     }

//     // Handle duplicate key errors
//     if (error.code === 11000 || error.code === 11001) {
//       return res.status(400).json({
//         success: false,
//         message: 'User with this email already exists'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Internal server error. Please try again later.'
//     });
//   }
// };


// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
    
//     console.log('Login attempt:', { email });

//     const validation = validateLogin(email, password);
//     if (!validation.isValid) {
//       return res.status(400).json({
//         success: false,
//         message: validation.message
//       });
//     }

//     // Check static admin credentials FIRST
//     if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
//       console.log('Static admin login successful');
//       const permissions = getAdminPermissions();
//       const token = generateToken('static-admin-id', STATIC_ADMIN.email, 'admin', permissions);
      
//       // DEBUG: Log the permissions being sent
//       console.log('🔐 Static admin permissions being sent:', {
//         isStaticAdmin: permissions.isStaticAdmin,
//         user_categories_edit: permissions['user_categories.edit'],
//         user_categories_delete: permissions['user_categories.delete'],
//         user_categories_create: permissions['user_categories.create']
//       });
      
//       return res.json({
//         success: true,
//         message: 'Login successful',
//         data: {
//           user: {
//             id: 'static-admin-id',
//             // name: STATIC_ADMIN.name,
//             email: STATIC_ADMIN.email,
//             role: 'admin',
//             isStaticAdmin: true
//           },
//           token,
//           permissions
//         }
//       });
//     }

//     // Regular user login
//     const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    
//     if (!user) {
//       console.log('User not found in User:', email);
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     console.log('User found in User:', { 
//       id: user._id, 
//       email: user.email,
//       name: user.name,
//       role: user.role 
//     });

//     // const providedName = name.trim().toLowerCase();
//     // const storedName = user.name.trim().toLowerCase();
    
//     // if (providedName !== storedName) {
//     //   console.log('Name mismatch:', { providedName, storedName });
//     //   return res.status(401).json({
//     //     success: false,
//     //     message: 'Name does not match our records'
//     //   });
//     // }

//     if (user.isActive === false) {
//       console.log('User inactive in User:', user.email);
//       return res.status(401).json({
//         success: false,
//         message: 'Your account has been deactivated. Please contact administrator.'
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
    
//     if (!isPasswordValid) {
//       console.log('Invalid password for:', user.email);
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     const permissions = await getUserPermissions(email);
    
//     console.log('Final permissions assigned:', {
//       email: user.email,
//       isStaticAdmin: permissions.isStaticAdmin,
//       hasCreate: permissions.create,
//       hasEdit: permissions.edit,
//       hasDelete: permissions.delete,
//       permissionsFromUnifiedModel: !permissions.create && !permissions.edit && !permissions.delete ? 'View-only (not in UnifiedModel)' : 'From UserCategory'
//     });

//     const token = generateToken(user._id.toString(), user.email, 'user', permissions);

//     res.json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         user: {
//           _id: user._id,
//           name: user.name,
//           email: user.email,
//           role: 'user'
//         },
//         token,
//         permissions
//       }
//     });

//   } catch (error: any) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error. Please try again later.'
//     });
//   }
// };

// export const getCurrentUser = async (req: Request, res: Response) => {
//   try {
//     const authReq = req as any;
    
//     if (authReq.user?.email === STATIC_ADMIN.email) {
//       console.log('Current user is static admin');
//       const permissions = getAdminPermissions();
//       return res.json({
//         success: true,
//         data: {
//           user: {
//             id: 'static-admin-id',
//             // name: STATIC_ADMIN.name,
//             email: STATIC_ADMIN.email,
//             role: 'admin',
//             isStaticAdmin: true
//           },
//           permissions
//         }
//       });
//     }

//     const user = await User.findById(authReq.user?.userId).select('-password');

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     const permissions = await getUserPermissions(user.email);
    
//     console.log('Get current user permissions:', {
//       email: user.email,
//       isStaticAdmin: permissions.isStaticAdmin,
//       hasCreate: permissions.create,
//       hasEdit: permissions.edit,
//       hasDelete: permissions.delete
//     });

//     res.json({
//       success: true,
//       data: {
//         user: {
//           _id: user._id,
//           name: user.name,
//           email: user.email,
//           role: 'user'
//         },
//         permissions
//       }
//     });

//   } catch (error: any) {
//     console.error('Get current user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// export const logout = (req: Request, res: Response) => {
//   res.json({
//     success: true,
//     message: 'Logged out successfully'
//   });
// };










// controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { UserCategory } from '../models/UserCategory';

// Static Admin Credentials
const STATIC_ADMIN = {
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

// Generate JWT Token
const generateToken = (userId: string, email: string, role: string, permissions: any) => {
  return jwt.sign(
    { userId, email, role, permissions },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// ==================== CONTENT MANAGEMENT HIERARCHY ====================

/**
 * Define content management components (children of content_management)
 */
const CONTENT_COMPONENTS = [
  'hero_slider',
  'category_cards',
  'featured_sales',
  'announcement_bar',
  'feature_categories',
  'featured_listings',
  'featured_reviews',
  'deals',
  'about_us',
  'security'  // security is also under content management based on your requirement
];

/**
 * Check if permission is a content management component permission
 */
const isContentComponentPermission = (permission: string): boolean => {
  return CONTENT_COMPONENTS.some(component => 
    permission.startsWith(`${component}.`)
  );
};

/**
 * Check if user has permission for content management component
 * User needs BOTH: content_management.view AND the specific component permission
 */
const hasContentComponentPermission = (
  userPermissions: string[],
  permissionToCheck: string
): boolean => {
  // If it's not a content component permission, just check normally
  if (!isContentComponentPermission(permissionToCheck)) {
    return userPermissions.includes(permissionToCheck);
  }
  
  // For content components, need BOTH permissions
  const hasParentPermission = userPermissions.includes('content_management.view');
  const hasComponentPermission = userPermissions.includes(permissionToCheck);
  
  return hasParentPermission && hasComponentPermission;
};

/**
 * Convert array of permission strings to permission object with hierarchy checking
 */
const convertPermissionsToObject = (permissionArray: string[]) => {
  const permissions: any = {
    // Basic permissions everyone gets (except blocked users)
    view: true,
    editProfile: true,
    changePassword: true,
    
    // Initialize all permissions as false
    create: false,
    edit: false,
    delete: false,
    manageUsers: false,
    manageSuppliers: false,
    manageCategories: false,
    viewAnalytics: false,
    manageSettings: false,
    blockUsers: false,
    approveSuppliers: false,
    
    // IMPORTANT: Add isStaticAdmin flag (false by default)
    isStaticAdmin: false,
    
    // ========== SYSTEM PERMISSIONS ==========
    
    // Dashboard
    'dashboard.view': false,
    
    // Users Management
    'users.view': false,
    'users.create': false,
    'users.edit': false,
    'users.delete': false,
    
    // User Categories
    'user_categories.view': false,
    'user_categories.create': false,
    'user_categories.edit': false,
    'user_categories.delete': false,
    
    // Suppliers Management
    'suppliers.view': false,
    'suppliers.create': false,
    'suppliers.edit': false,
    'suppliers.delete': false,
    
    // Supplier Categories
    'supplier_categories.view': false,
    'supplier_categories.create': false,
    'supplier_categories.edit': false,
    'supplier_categories.delete': false,
    
    // ========== CONTENT MANAGEMENT SECTION ==========
    
    // Content Management (Parent - ONLY VIEW)
    'content_management.view': false,
    
    // Content Components (Children - will be checked with hierarchy)
    'hero_slider.view': false,
    'hero_slider.create': false,
    'hero_slider.edit': false,
    'hero_slider.delete': false,
    
    'category_cards.view': false,
    'category_cards.create': false,
    'category_cards.edit': false,
    'category_cards.delete': false,
    
    'featured_sales.view': false,
    'featured_sales.create': false,
    'featured_sales.edit': false,
    'featured_sales.delete': false,
    
    'announcement_bar.view': false,
    'announcement_bar.create': false,
    'announcement_bar.edit': false,
    'announcement_bar.delete': false,
    
    'feature_categories.view': false,
    'feature_categories.create': false,
    'feature_categories.edit': false,
    'feature_categories.delete': false,
    
    'featured_listings.view': false,
    'featured_listings.create': false,
    'featured_listings.edit': false,
    'featured_listings.delete': false,
    
    'featured_reviews.view': false,
    'featured_reviews.create': false,
    'featured_reviews.edit': false,
    'featured_reviews.delete': false,
    
    'deals.view': false,
    'deals.create': false,
    'deals.edit': false,
    'deals.delete': false,
    
    'about_us.view': false,
    'about_us.create': false,
    'about_us.edit': false,
    'about_us.delete': false,
    
    'security.view': false,
    'security.create': false,
    'security.edit': false,
    'security.delete': false,
    
    // Projects
    'projects.view': false,
    
    // Analytics
    'analytics.view': false,
    
    // Settings
    'settings.view': false
  };

  // Process each permission from the array
  permissionArray.forEach((permission: string) => {
    // Set the permission directly
    permissions[permission] = true;
    
    // Set derived permissions
    if (permission.includes('.create')) {
      permissions.create = true;
    }
    if (permission.includes('.edit')) {
      permissions.edit = true;
    }
    if (permission.includes('.delete')) {
      permissions.delete = true;
    }
    
    // Set management permissions
    if (permission.includes('users.')) {
      permissions.manageUsers = true;
    }
    if (permission.includes('suppliers.')) {
      permissions.manageSuppliers = true;
    }
    if (permission.includes('categories.')) {
      permissions.manageCategories = true;
    }
    if (permission.includes('analytics.')) {
      permissions.viewAnalytics = true;
    }
    if (permission.includes('settings.')) {
      permissions.manageSettings = true;
    }
  });

  // IMPORTANT: Apply hierarchy rules for content management
  CONTENT_COMPONENTS.forEach(component => {
    const actions = ['view', 'create', 'edit', 'delete'];
    actions.forEach(action => {
      const permissionKey = `${component}.${action}`;
      // For content components, check if user has BOTH permissions
      if (permissions[permissionKey] && !permissions['content_management.view']) {
        console.log(`⚠️  Warning: User has ${permissionKey} but missing content_management.view. Disabling ${permissionKey}.`);
        permissions[permissionKey] = false;
      }
    });
  });

  return permissions;
};

/**
 * Admin permissions (for static admin only) - ALL TRUE
 */
const getAdminPermissions = () => {
  const allPermissions: any = {
    isStaticAdmin: true,
    view: true,
    editProfile: true,
    changePassword: true,
    create: true,
    edit: true,
    delete: true,
    manageUsers: true,
    manageSuppliers: true,
    manageCategories: true,
    viewAnalytics: true,
    manageSettings: true,
    blockUsers: true,
    approveSuppliers: true,
  };

  // Set ALL system permissions to true
  const allPermissionKeys = [
    // Dashboard
    'dashboard.view',
    
    // Users Management
    'users.view', 'users.create', 'users.edit', 'users.delete',
    
    // User Categories
    'user_categories.view', 'user_categories.create', 'user_categories.edit', 'user_categories.delete',
    
    // Suppliers Management
    'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
    
    // Supplier Categories
    'supplier_categories.view', 'supplier_categories.create', 'supplier_categories.edit', 'supplier_categories.delete',
    
    // Content Management (Parent)
    'content_management.view',
    
    // Content Components
    'hero_slider.view', 'hero_slider.create', 'hero_slider.edit', 'hero_slider.delete',
    'category_cards.view', 'category_cards.create', 'category_cards.edit', 'category_cards.delete',
    'featured_sales.view', 'featured_sales.create', 'featured_sales.edit', 'featured_sales.delete',
    'announcement_bar.view', 'announcement_bar.create', 'announcement_bar.edit', 'announcement_bar.delete',
    'feature_categories.view', 'feature_categories.create', 'feature_categories.edit', 'feature_categories.delete',
    'featured_listings.view', 'featured_listings.create', 'featured_listings.edit', 'featured_listings.delete',
    'featured_reviews.view', 'featured_reviews.create', 'featured_reviews.edit', 'featured_reviews.delete',
    'deals.view', 'deals.create', 'deals.edit', 'deals.delete',
    'about_us.view', 'about_us.create', 'about_us.edit', 'about_us.delete',
    'security.view', 'security.create', 'security.edit', 'security.delete',
    
    // Projects
    'projects.view',
    
    // Analytics
    'analytics.view',
    
    // Settings
    'settings.view'
  ];

  allPermissionKeys.forEach(key => {
    allPermissions[key] = true;
  });

  return allPermissions;
};

/**
 * Default view-only permissions (for users not in UnifiedModel)
 */
const getDefaultViewPermissions = () => {
  return {
    isStaticAdmin: false,
    view: true,
    editProfile: true,
    changePassword: true,
    create: false,
    edit: false,
    delete: false,
    manageUsers: false,
    manageSuppliers: false,
    manageCategories: false,
    viewAnalytics: false,
    manageSettings: false,
    blockUsers: false,
    approveSuppliers: false,
    
    // Only view permissions
    'dashboard.view': true,
    
    // Users Management (view only)
    'users.view': true,
    'users.create': false,
    'users.edit': false,
    'users.delete': false,
    
    // User Categories (view only)
    'user_categories.view': true,
    'user_categories.create': false,
    'user_categories.edit': false,
    'user_categories.delete': false,
    
    // Suppliers Management (view only)
    'suppliers.view': true,
    'suppliers.create': false,
    'suppliers.edit': false,
    'suppliers.delete': false,
    
    // Supplier Categories (view only)
    'supplier_categories.view': true,
    'supplier_categories.create': false,
    'supplier_categories.edit': false,
    'supplier_categories.delete': false,
    
    // ========== CONTENT MANAGEMENT SECTION ==========
    // Content Management (Parent - view only)
    'content_management.view': true,  // User can SEE content management page
    
    // Content Components (view only - but requires content_management.view too!)
    'hero_slider.view': true,
    'hero_slider.create': false,
    'hero_slider.edit': false,
    'hero_slider.delete': false,
    
    'category_cards.view': true,
    'category_cards.create': false,
    'category_cards.edit': false,
    'category_cards.delete': false,
    
    'featured_sales.view': true,
    'featured_sales.create': false,
    'featured_sales.edit': false,
    'featured_sales.delete': false,
    
    'announcement_bar.view': true,
    'announcement_bar.create': false,
    'announcement_bar.edit': false,
    'announcement_bar.delete': false,
    
    'feature_categories.view': true,
    'feature_categories.create': false,
    'feature_categories.edit': false,
    'feature_categories.delete': false,
    
    'featured_listings.view': true,
    'featured_listings.create': false,
    'featured_listings.edit': false,
    'featured_listings.delete': false,
    
    'featured_reviews.view': true,
    'featured_reviews.create': false,
    'featured_reviews.edit': false,
    'featured_reviews.delete': false,
    
    'deals.view': true,
    'deals.create': false,
    'deals.edit': false,
    'deals.delete': false,
    
    'about_us.view': true,
    'about_us.create': false,
    'about_us.edit': false,
    'about_us.delete': false,
    
    'security.view': true,
    'security.create': false,
    'security.edit': false,
    'security.delete': false,
    
    // Projects
    'projects.view': true,
    
    // Analytics
    'analytics.view': false,
    
    // Settings
    'settings.view': false
  };
};

/**
 * Minimal permissions for blocked users
 */
const getBlockedUserPermissions = () => {
  const blockedPermissions: any = {
    isStaticAdmin: false,
    view: false,
    editProfile: false,
    changePassword: false,
    create: false,
    edit: false,
    delete: false,
    manageUsers: false,
    manageSuppliers: false,
    manageCategories: false,
    viewAnalytics: false,
    manageSettings: false,
    blockUsers: false,
    approveSuppliers: false,
  };

  // Set ALL permissions to false
  const allPermissionKeys = [
    // Dashboard
    'dashboard.view',
    
    // Users Management
    'users.view', 'users.create', 'users.edit', 'users.delete',
    
    // User Categories
    'user_categories.view', 'user_categories.create', 'user_categories.edit', 'user_categories.delete',
    
    // Suppliers Management
    'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
    
    // Supplier Categories
    'supplier_categories.view', 'supplier_categories.create', 'supplier_categories.edit', 'supplier_categories.delete',
    
    // Content Management (Parent)
    'content_management.view',
    
    // Content Components
    'hero_slider.view', 'hero_slider.create', 'hero_slider.edit', 'hero_slider.delete',
    'category_cards.view', 'category_cards.create', 'category_cards.edit', 'category_cards.delete',
    'featured_sales.view', 'featured_sales.create', 'featured_sales.edit', 'featured_sales.delete',
    'announcement_bar.view', 'announcement_bar.create', 'announcement_bar.edit', 'announcement_bar.delete',
    'feature_categories.view', 'feature_categories.create', 'feature_categories.edit', 'feature_categories.delete',
    'featured_listings.view', 'featured_listings.create', 'featured_listings.edit', 'featured_listings.delete',
    'featured_reviews.view', 'featured_reviews.create', 'featured_reviews.edit', 'featured_reviews.delete',
    'deals.view', 'deals.create', 'deals.edit', 'deals.delete',
    'about_us.view', 'about_us.create', 'about_us.edit', 'about_us.delete',
    'security.view', 'security.create', 'security.edit', 'security.delete',
    
    // Projects
    'projects.view',
    
    // Analytics
    'analytics.view',
    
    // Settings
    'settings.view'
  ];

  allPermissionKeys.forEach(key => {
    blockedPermissions[key] = false;
  });

  return blockedPermissions;
};

// ==================== UPDATED: Permission Functions ====================

/**
 * Get permissions based on user's role from UnifiedModel.User
 */
const getUserPermissions = async (email: string) => {
  try {
    console.log('Getting permissions for email:', email);
    
    // 1. Static Admin gets all permissions
    if (email === STATIC_ADMIN.email) {
      console.log('Static admin detected, giving full permissions');
      return getAdminPermissions();
    }

    // 2. Check if user exists in UnifiedModel.User
    console.log('Checking if user exists in UnifiedModel...');
    const unifiedUser = await User.findOne({ email: email.toLowerCase() })
      .populate('userType', 'permissions categoryType')
      .select('userType isBlocked');

    if (unifiedUser) {
      console.log('User found in UnifiedModel:', {
        email: unifiedUser.email,
        userType: unifiedUser.userType,
        isBlocked: unifiedUser.isBlocked
      });

      // Check if user is blocked
      if (unifiedUser.isBlocked) {
        console.log('User is blocked, giving minimal permissions');
        return getBlockedUserPermissions();
      }

      // Check if user has a userType
      if (unifiedUser.userType) {
        const userCategory = unifiedUser.userType as any;
        console.log('UserCategory found:', {
          role: userCategory.role,
          categoryType: userCategory.categoryType,
          permissionsCount: userCategory.permissions?.length || 0
        });

        if (userCategory.permissions && userCategory.permissions.length > 0) {
          // User has specific permissions in UserCategory
          const permissions = convertPermissionsToObject(userCategory.permissions);
          console.log('Converted permissions with hierarchy:', {
            hasContentManagementView: permissions['content_management.view'],
            hasHeroSliderView: permissions['hero_slider.view'],
            effectiveHeroSliderView: permissions['hero_slider.view'] && permissions['content_management.view'],
            totalPermissions: Object.keys(permissions).length
          });
          return permissions;
        }
      }
    }

    // 3. User not found in UnifiedModel or has no permissions set
    console.log('User not in UnifiedModel or no permissions set, giving view-only');
    return getDefaultViewPermissions();
    
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return getDefaultViewPermissions();
  }
};

// ==================== VALIDATION FUNCTIONS ====================

const validateRegistration = (name: string, email: string, password: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, message: 'Name cannot exceed 50 characters' };
  }
  
  if (!email || email.trim().length === 0) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  return { isValid: true };
};

const validateLogin = ( email: string, password: string): { isValid: boolean; message?: string } => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  return { isValid: true };
};

// ==================== CONTROLLER FUNCTIONS ====================

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    const validation = validateRegistration(name, email, password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Step 1: Check if ANY customer role exists in UserCategory
    const customerRoles = await UserCategory.find({
      role: { $regex: /customer/i },
      isBlocked: false
    });

    let customerCategory;

    if (customerRoles.length > 0) {
      // Step 2: If customer role exists, use the first one
      customerCategory = customerRoles[0];
      console.log('✅ Using existing customer role:', {
        categoryId: customerCategory._id,
        role: customerCategory.role,
        categoryType: customerCategory.categoryType
      });
    } else {
      // Step 3: If NO customer role exists, create a new one
      console.log('⚠️ No customer role found, creating new "Customer" role...');
      
      const newCustomerCategory = new UserCategory({
        role: 'Customer',
        categoryType: 'Other',
        description: 'Default customer role for registered users',
        permissions: [], // No specific permissions - gets default view-only
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newCustomerCategory.save();
      customerCategory = newCustomerCategory;
      
      console.log('✅ Created new customer role in UserCategory:', {
        categoryId: customerCategory._id,
        role: customerCategory.role,
        categoryType: customerCategory.categoryType
      });
    }

    // Create the new user with the customer role
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      userType: customerCategory._id,
    } as any);

    await user.save();

    // Generate permissions and token
    const permissions = getDefaultViewPermissions();
    const token = generateToken(user._id.toString(), user.email, 'user', permissions);

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: 'user',
          userType: customerCategory.role,
          userTypeId: customerCategory._id,
          categoryType: customerCategory.categoryType
        },
        token,
        permissions
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation failed'
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000 || error.code === 11001) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email });

    const validation = validateLogin(email, password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Check static admin credentials FIRST
    if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
      console.log('Static admin login successful');
      const permissions = getAdminPermissions();
      const token = generateToken('static-admin-id', STATIC_ADMIN.email, 'admin', permissions);
      
      // DEBUG: Log the permissions being sent
      console.log('🔐 Static admin permissions being sent:', {
        isStaticAdmin: permissions.isStaticAdmin,
        hasContentManagementView: permissions['content_management.view'],
        hasHeroSliderView: permissions['hero_slider.view'],
        effectiveHeroSliderView: permissions['hero_slider.view'] && permissions['content_management.view']
      });
      
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'static-admin-id',
            email: STATIC_ADMIN.email,
            role: 'admin',
            isStaticAdmin: true
          },
          token,
          permissions
        }
      });
    }

    // Regular user login
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('User not found in User:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('User found in User:', { 
      id: user._id, 
      email: user.email,
      name: user.name,
      role: user.role 
    });

    if (user.isActive === false) {
      console.log('User inactive in User:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('Invalid password for:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const permissions = await getUserPermissions(email);
    
    // Log content management permissions
    console.log('🔐 Content Management Permissions:', {
      email: user.email,
      hasContentManagementView: permissions['content_management.view'],
      heroSliderView: permissions['hero_slider.view'],
      effectiveHeroSliderView: permissions['hero_slider.view'] && permissions['content_management.view'],
      categoryCardsView: permissions['category_cards.view'],
      effectiveCategoryCardsView: permissions['category_cards.view'] && permissions['content_management.view']
    });

    const token = generateToken(user._id.toString(), user.email, 'user', permissions);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: 'user'
        },
        token,
        permissions
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    
    if (authReq.user?.email === STATIC_ADMIN.email) {
      console.log('Current user is static admin');
      const permissions = getAdminPermissions();
      return res.json({
        success: true,
        data: {
          user: {
            id: 'static-admin-id',
            email: STATIC_ADMIN.email,
            role: 'admin',
            isStaticAdmin: true
          },
          permissions
        }
      });
    }

    const user = await User.findById(authReq.user?.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const permissions = await getUserPermissions(user.email);
    
    console.log('Get current user permissions (content management):', {
      email: user.email,
      hasContentManagementView: permissions['content_management.view'],
      effectiveHeroSliderView: permissions['hero_slider.view'] && permissions['content_management.view']
    });

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: 'user'
        },
        permissions
      }
    });

  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const logout = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// ==================== EXPORT HELPER FUNCTIONS ====================

/**
 * Helper function for frontend to check content management permissions
 * This can be imported and used in middleware or frontend utilities
 */
export const checkContentPermission = (
  userPermissions: any,
  component: string,
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean => {
  const permissionKey = `${component}.${action}`;
  
  // Check if component is in content management
  if (CONTENT_COMPONENTS.includes(component)) {
    // Need both permissions
    return userPermissions['content_management.view'] && userPermissions[permissionKey];
  }
  
  // For non-content permissions, just check the permission
  return userPermissions[permissionKey];
};

/**
 * Get all content management permissions for a user
 */
export const getUserContentPermissions = (userPermissions: any) => {
  const contentPermissions: any = {};
  
  CONTENT_COMPONENTS.forEach(component => {
    ['view', 'create', 'edit', 'delete'].forEach(action => {
      const permissionKey = `${component}.${action}`;
      contentPermissions[permissionKey] = checkContentPermission(userPermissions, component, action as any);
    });
  });
  
  return contentPermissions;
};
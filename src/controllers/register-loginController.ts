// // // controllers/authController.ts
// // import { Request, Response } from 'express';
// // import jwt from 'jsonwebtoken';
// // import bcrypt from 'bcryptjs';
// // import AuthUser from '../models/User'; // Updated import - should be AuthUser model
// // import { UserCategory } from '../models/index';

// // // Static Admin Credentials
// // const STATIC_ADMIN = {
// //   email: 'admin@example.com',
// //   password: 'admin123',
// //   name: 'Super Admin',
// //   role: 'admin'
// // };

// // // Generate JWT Token
// // const generateToken = (userId: string, email: string, role: string, permissions: any) => {
// //   return jwt.sign(
// //     { userId, email, role, permissions },
// //     process.env.JWT_SECRET || 'your-secret-key',
// //     { expiresIn: '7d' }
// //   );
// // };

// // // Helper function to get user permissions based on user category
// // const getUserPermissions = async (userTypeId: any) => {
// //   try {
// //     const userCategory = await UserCategory.findById(userTypeId);
    
// //     if (!userCategory) {
// //       return getDefaultPermissions('user');
// //     }

// //     const categoryType = userCategory.categoryType.toLowerCase();
    
// //     // Map category types to permission levels
// //     switch (categoryType) {
// //       case 'admin':
// //       case 'super admin':
// //         return getDefaultPermissions('admin');
      
// //       case 'supplier':
// //         return getDefaultPermissions('supplier');
      
// //       case 'manager':
// //         return getDefaultPermissions('manager');
      
// //       case 'user':
// //       default:
// //         return getDefaultPermissions('user');
// //     }
// //   } catch (error) {
// //     console.error('Error getting user permissions:', error);
// //     return getDefaultPermissions('user');
// //   }
// // };

// // // ==================== VALIDATION FUNCTIONS ====================

// // // Validate registration input
// // const validateRegistration = (name: string, email: string, password: string): { isValid: boolean; message?: string } => {
// //   // Validate name
// //   if (!name || name.trim().length === 0) {
// //     return { isValid: false, message: 'Name is required' };
// //   }
  
// //   if (name.trim().length < 2) {
// //     return { isValid: false, message: 'Name must be at least 2 characters long' };
// //   }
  
// //   if (name.trim().length > 50) {
// //     return { isValid: false, message: 'Name cannot exceed 50 characters' };
// //   }
  
// //   // Validate email
// //   if (!email || email.trim().length === 0) {
// //     return { isValid: false, message: 'Email is required' };
// //   }
  
// //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //   if (!emailRegex.test(email)) {
// //     return { isValid: false, message: 'Please enter a valid email address' };
// //   }
  
// //   // Validate password
// //   if (!password) {
// //     return { isValid: false, message: 'Password is required' };
// //   }
  
// //   if (password.length < 8) {
// //     return { isValid: false, message: 'Password must be at least 8 characters long' };
// //   }
  
// //   return { isValid: true };
// // };

// // // Validate login input
// // const validateLogin = (name: string, email: string, password: string): { isValid: boolean; message?: string } => {
// //   // Validate name
// //   if (!name || name.trim().length === 0) {
// //     return { isValid: false, message: 'Name is required' };
// //   }
  
// //   if (name.trim().length < 2) {
// //     return { isValid: false, message: 'Name must be at least 2 characters long' };
// //   }
  
// //   // Validate email
// //   if (!email || email.trim().length === 0) {
// //     return { isValid: false, message: 'Email is required' };
// //   }
  
// //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //   if (!emailRegex.test(email)) {
// //     return { isValid: false, message: 'Please enter a valid email address' };
// //   }
  
// //   // Validate password
// //   if (!password) {
// //     return { isValid: false, message: 'Password is required' };
// //   }
  
// //   return { isValid: true };
// // };

// // // ==================== CONTROLLER FUNCTIONS ====================

// // // Register Controller
// // export const register = async (req: Request, res: Response) => {
// //   try {
// //     const { name, email, password } = req.body;

// //     // Validate input
// //     const validation = validateRegistration(name, email, password);
// //     if (!validation.isValid) {
// //       return res.status(400).json({
// //         success: false,
// //         message: validation.message
// //       });
// //     }

// //     // Check if user already exists
// //     const existingUser = await AuthUser.findOne({ email });
// //     if (existingUser) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'User with this email already exists'
// //       });
// //     }

// //     // Find default user category (regular user)
// //     const defaultCategory = await UserCategory.findOne({ 
// //       categoryType: 'User', 
// //       isBlocked: false 
// //     });

// //     if (!defaultCategory) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Default user role not found. Please contact administrator.'
// //       });
// //     }

// //     // Create new user with name field
// //     const user = new AuthUser({
// //       name: name.trim(),
// //       email: email.trim().toLowerCase(),
// //       password,
// //     });

// //     await user.save();

// //     // Get user permissions
// //     const permissions = await getUserPermissions(defaultCategory._id);
    
// //     // Generate token with permissions
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

// // // Login Controller with Static Admin
// // export const login = async (req: Request, res: Response) => {
// //   try {
// //     const { name, email, password } = req.body;

// //     // Validate input
// //     const validation = validateLogin(name, email, password);
// //     if (!validation.isValid) {
// //       return res.status(400).json({
// //         success: false,
// //         message: validation.message
// //       });
// //     }

// //     // Check static admin credentials
// //     if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
// //       const permissions = getDefaultPermissions('admin');
// //       const token = generateToken('static-admin-id', STATIC_ADMIN.email, 'admin', permissions);
      
// //       return res.json({
// //         success: true,
// //         message: 'Login successful',
// //         data: {
// //           user: {
// //             id: 'static-admin-id',
// //             name: STATIC_ADMIN.name,
// //             email: STATIC_ADMIN.email,
// //             role: 'admin',
// //             isStaticAdmin: true
// //           },
// //           token,
// //           permissions
// //         }
// //       });
// //     }

// //     // Regular user login
// //     const user = await AuthUser.findOne({ email: email.trim().toLowerCase() }).select('+password');
    
// //     if (!user) {
// //       return res.status(401).json({
// //         success: false,
// //         message: 'Invalid email or password'
// //       });
// //     }

// //     // Validate that the provided name matches the stored name (case-insensitive)
// //     const providedName = name.trim().toLowerCase();
// //     const storedName = user.name.trim().toLowerCase();
    
// //     if (providedName !== storedName) {
// //       return res.status(401).json({
// //         success: false,
// //         message: 'Name does not match our records'
// //       });
// //     }

// //     // Check if user is active
// //     if (user.isActive === false) {
// //       return res.status(401).json({
// //         success: false,
// //         message: 'Your account has been deactivated. Please contact administrator.'
// //       });
// //     }

// //     // Verify password
// //     const isPasswordValid = await bcrypt.compare(password, user.password);
    
// //     if (!isPasswordValid) {
// //       return res.status(401).json({
// //         success: false,
// //         message: 'Invalid email or password'
// //       });
// //     }

// //     // Get user role
// //     const userRole = user.role || 'user';

// //     // Get permissions
// //     const permissions = getDefaultPermissions(userRole);

// //     // Generate token with permissions
// //     const token = generateToken(user._id.toString(), user.email, userRole, permissions);

// //     res.json({
// //       success: true,
// //       message: 'Login successful',
// //       data: {
// //         user: {
// //           _id: user._id,
// //           name: user.name,
// //           email: user.email,
// //           role: userRole
// //         },
// //         token,
// //         permissions
// //       }
// //     });

// //   } catch (error: any) {
// //     console.error('Login error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Internal server error. Please try again later.'
// //     });
// //   }
// // };

// // // Get Current User
// // export const getCurrentUser = async (req: Request, res: Response) => {
// //   try {
// //     // Type assertion for req.user
// //     const authReq = req as any;
    
// //     // Check if it's static admin
// //     if (authReq.user?.email === STATIC_ADMIN.email) {
// //       const permissions = getDefaultPermissions('admin');
// //       return res.json({
// //         success: true,
// //         data: {
// //           user: {
// //             id: 'static-admin-id',
// //             name: STATIC_ADMIN.name,
// //             email: STATIC_ADMIN.email,
// //             role: 'admin',
// //             isStaticAdmin: true
// //           },
// //           permissions
// //         }
// //       });
// //     }

// //     // Regular user
// //     const user = await AuthUser.findById(authReq.user?.userId).select('-password');

// //     if (!user) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'User not found'
// //       });
// //     }

// //     const userRole = user.role || 'user';
// //     const permissions = getDefaultPermissions(userRole);

// //     res.json({
// //       success: true,
// //       data: {
// //         user: {
// //           _id: user._id,
// //           name: user.name,
// //           email: user.email,
// //           role: userRole
// //         },
// //         permissions
// //       }
// //     });

// //   } catch (error: any) {
// //     console.error('Get current user error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Internal server error'
// //     });
// //   }
// // };

// // // Default permissions based on role
// // const getDefaultPermissions = (role: string) => {
// //   const basePermissions = {
// //     view: true,
// //     editProfile: true,
// //     changePassword: true
// //   };

// //   switch (role) {
// //     case 'admin':
// //     case 'super admin':
// //       return {
// //         ...basePermissions,
// //         create: true,
// //         edit: true,
// //         delete: true,
// //         manageUsers: true,
// //         manageSuppliers: true,
// //         manageCategories: true,
// //         viewAnalytics: true,
// //         manageSettings: true,
// //         blockUsers: true,
// //         approveSuppliers: true,
// //         'dashboard.view': true,
// //         'users.view': true,
// //         'users.create': true,
// //         'users.edit': true,
// //         'users.delete': true,
// //         'user_categories.view': true,
// //         'user_categories.create': true,
// //         'user_categories.edit': true,
// //         'user_categories.delete': true,
// //         'suppliers.view': true,
// //         'suppliers.create': true,
// //         'suppliers.edit': true,
// //         'suppliers.delete': true,
// //         'supplier_categories.view': true,
// //         'supplier_categories.create': true,
// //         'supplier_categories.edit': true,
// //         'supplier_categories.delete': true,
// //         'projects.view': true,
// //         'analytics.view': true,
// //         'settings.view': true
// //       };
    
// //     case 'supplier':
// //       return {
// //         ...basePermissions,
// //         create: true,
// //         edit: true,
// //         delete: false,
// //         manageProducts: true,
// //         viewOwnData: true,
// //         updateOwnProfile: true,
// //         'dashboard.view': true,
// //         'suppliers.view': true,
// //         'suppliers.edit': true,
// //         'projects.view': true,
// //         'analytics.view': true
// //       };
    
// //     case 'manager':
// //       return {
// //         ...basePermissions,
// //         create: true,
// //         edit: true,
// //         delete: false,
// //         viewAll: true,
// //         approveEntries: true,
// //         generateReports: true,
// //         'dashboard.view': true,
// //         'users.view': true,
// //         'users.edit': true,
// //         'suppliers.view': true,
// //         'suppliers.edit': true,
// //         'projects.view': true,
// //         'analytics.view': true
// //       };
    
// //     case 'user':
// //     default:
// //       return {
// //         ...basePermissions,
// //         create: false,
// //         edit: false,
// //         delete: false,
// //         view: true,
// //         viewOwnData: true,
// //         updateOwnProfile: true,
// //         'dashboard.view': true
// //       };
// //   }
// // };

// // // Logout
// // export const logout = (req: Request, res: Response) => {
// //   res.json({
// //     success: true,
// //     message: 'Logged out successfully'
// //   });
// // };




















// // controllers/authController.ts
// import { Request, Response } from 'express';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import AuthUser from '../models/User';
// import { UserCategory } from '../models/index';

// // Static Admin Credentials
// const STATIC_ADMIN = {
//   email: 'admin@example.com',
//   password: 'admin123',
//   name: 'Super Admin',
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

// // Helper function to get user permissions - UPDATED: Only static admin gets admin permissions
// const getUserPermissions = async (userTypeId: any, userEmail?: string) => {
//   try {
//     // ONLY static admin gets admin permissions
//     if (userEmail === STATIC_ADMIN.email) {
//       return getDefaultPermissions('admin');
//     }

//     // For ALL other users, regardless of userTypeId, return view-only permissions
//     return getDefaultPermissions('user');
    
//   } catch (error) {
//     console.error('Error getting user permissions:', error);
//     return getDefaultPermissions('user');
//   }
// };

// // ==================== VALIDATION FUNCTIONS ====================

// // Validate registration input
// const validateRegistration = (name: string, email: string, password: string): { isValid: boolean; message?: string } => {
//   // Validate name
//   if (!name || name.trim().length === 0) {
//     return { isValid: false, message: 'Name is required' };
//   }
  
//   if (name.trim().length < 2) {
//     return { isValid: false, message: 'Name must be at least 2 characters long' };
//   }
  
//   if (name.trim().length > 50) {
//     return { isValid: false, message: 'Name cannot exceed 50 characters' };
//   }
  
//   // Validate email
//   if (!email || email.trim().length === 0) {
//     return { isValid: false, message: 'Email is required' };
//   }
  
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return { isValid: false, message: 'Please enter a valid email address' };
//   }
  
//   // Validate password
//   if (!password) {
//     return { isValid: false, message: 'Password is required' };
//   }
  
//   if (password.length < 8) {
//     return { isValid: false, message: 'Password must be at least 8 characters long' };
//   }
  
//   return { isValid: true };
// };

// // Validate login input
// const validateLogin = (name: string, email: string, password: string): { isValid: boolean; message?: string } => {
//   // Validate name
//   if (!name || name.trim().length === 0) {
//     return { isValid: false, message: 'Name is required' };
//   }
  
//   if (name.trim().length < 2) {
//     return { isValid: false, message: 'Name must be at least 2 characters long' };
//   }
  
//   // Validate email
//   if (!email || email.trim().length === 0) {
//     return { isValid: false, message: 'Email is required' };
//   }
  
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return { isValid: false, message: 'Please enter a valid email address' };
//   }
  
//   // Validate password
//   if (!password) {
//     return { isValid: false, message: 'Password is required' };
//   }
  
//   return { isValid: true };
// };

// // ==================== CONTROLLER FUNCTIONS ====================

// // Register Controller
// export const register = async (req: Request, res: Response) => {
//   try {
//     const { name, email, password } = req.body;

//     // Validate input
//     const validation = validateRegistration(name, email, password);
//     if (!validation.isValid) {
//       return res.status(400).json({
//         success: false,
//         message: validation.message
//       });
//     }

//     // Check if user already exists
//     const existingUser = await AuthUser.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User with this email already exists'
//       });
//     }

//     // Find default user category (regular user)
//     const defaultCategory = await UserCategory.findOne({ 
//       categoryType: 'User', 
//       isBlocked: false 
//     });

//     if (!defaultCategory) {
//       return res.status(400).json({
//         success: false,
//         message: 'Default user role not found. Please contact administrator.'
//       });
//     }

//     // Create new user with name field
//     const user = new AuthUser({
//       name: name.trim(),
//       email: email.trim().toLowerCase(),
//       password,
//       userTypeId: defaultCategory._id, // Assign user category ID
//     } as any);

//     await user.save();

//     // Get user permissions - ALL new users get view-only permissions
//     const permissions = getDefaultPermissions('user');
    
//     // Generate token with permissions
//     const token = generateToken(user._id.toString(), user.email, 'user', permissions);

//     res.status(201).json({
//       success: true,
//       message: 'Registration successful',
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
//     console.error('Registration error:', error);
    
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map((err: any) => err.message);
//       return res.status(400).json({
//         success: false,
//         message: messages[0] || 'Validation failed'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Internal server error. Please try again later.'
//     });
//   }
// };

// // Login Controller with Static Admin
// export const login = async (req: Request, res: Response) => {
//   try {
//     const { name, email, password } = req.body;
    
//     console.log('Login attempt:', { email, name: name.substring(0, 3) + '...' });

//     // Validate input
//     const validation = validateLogin(name, email, password);
//     if (!validation.isValid) {
//       return res.status(400).json({
//         success: false,
//         message: validation.message
//       });
//     }

//     // Check static admin credentials FIRST
//     if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
//       console.log('Static admin login successful');
//       const permissions = getDefaultPermissions('admin');
//       const token = generateToken('static-admin-id', STATIC_ADMIN.email, 'admin', permissions);
      
//       return res.json({
//         success: true,
//         message: 'Login successful',
//         data: {
//           user: {
//             id: 'static-admin-id',
//             name: STATIC_ADMIN.name,
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
//     const user = await AuthUser.findOne({ email: email.trim().toLowerCase() }).select('+password');
    
//     if (!user) {
//       console.log('User not found:', email);
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     console.log('User found:', { 
//       id: user._id, 
//       email: user.email,
//       name: user.name,
//       role: user.role 
//     });

//     // Validate that the provided name matches the stored name (case-insensitive)
//     const providedName = name.trim().toLowerCase();
//     const storedName = user.name.trim().toLowerCase();
    
//     if (providedName !== storedName) {
//       console.log('Name mismatch:', { providedName, storedName });
//       return res.status(401).json({
//         success: false,
//         message: 'Name does not match our records'
//       });
//     }

//     // Check if user is active
//     if (user.isActive === false) {
//       console.log('User inactive:', user.email);
//       return res.status(401).json({
//         success: false,
//         message: 'Your account has been deactivated. Please contact administrator.'
//       });
//     }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
    
//     if (!isPasswordValid) {
//       console.log('Invalid password for:', user.email);
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password'
//       });
//     }

//     // IMPORTANT: For ALL regular users, give view-only permissions
//     // Only static admin gets admin permissions
//     const permissions = getDefaultPermissions('user');
    
//     console.log('Permissions assigned:', {
//       email: user.email,
//       isStaticAdmin: false,
//       createPermission: permissions.create,
//       editPermission: permissions.edit,
//       deletePermission: permissions.delete
//     });

//     // Generate token with permissions
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




// // Get Current User
// export const getCurrentUser = async (req: Request, res: Response) => {
//   try {
//     // Type assertion for req.user
//     const authReq = req as any;
    
//     // Check if it's static admin
//     if (authReq.user?.email === STATIC_ADMIN.email) {
//       console.log('Current user is static admin');
//       const permissions = getDefaultPermissions('admin');
//       return res.json({
//         success: true,
//         data: {
//           user: {
//             id: 'static-admin-id',
//             name: STATIC_ADMIN.name,
//             email: STATIC_ADMIN.email,
//             role: 'admin',
//             isStaticAdmin: true
//           },
//           permissions
//         }
//       });
//     }

//     // Regular user
//     const user = await AuthUser.findById(authReq.user?.userId).select('-password');

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // IMPORTANT: For ALL regular users, give view-only permissions
//     const permissions = getDefaultPermissions('user');
    
//     console.log('Get current user permissions:', {
//       email: user.email,
//       createPermission: permissions.create,
//       editPermission: permissions.edit,
//       deletePermission: permissions.delete
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

// // Default permissions based on role - SIMPLIFIED VERSION
// const getDefaultPermissions = (role: string) => {
//   console.log('Getting permissions for role:', role);
  
//   // Only return admin permissions for 'admin' role (static admin only)
//   if (role === 'admin') {
//     return {
//       view: true,
//       editProfile: true,
//       changePassword: true,
//       create: true,
//       edit: true,
//       delete: true,
//       manageUsers: true,
//       manageSuppliers: true,
//       manageCategories: true,
//       viewAnalytics: true,
//       manageSettings: true,
//       blockUsers: true,
//       approveSuppliers: true,
//       'dashboard.view': true,
//       'users.view': true,
//       'users.create': true,
//       'users.edit': true,
//       'users.delete': true,
//       'user_categories.view': true,
//       'user_categories.create': true,
//       'user_categories.edit': true,
//       'user_categories.delete': true,
//       'suppliers.view': true,
//       'suppliers.create': true,
//       'suppliers.edit': true,
//       'suppliers.delete': true,
//       'supplier_categories.view': true,
//       'supplier_categories.create': true,
//       'supplier_categories.edit': true,
//       'supplier_categories.delete': true,
//       'projects.view': true,
//       'analytics.view': true,
//       'settings.view': true
//     };
//   }
  
//   // For ALL other users (role === 'user'), return VIEW-ONLY permissions
//   return {
//     view: true,
//     editProfile: true, // Users can edit their own profile
//     changePassword: true, // Users can change their password
//     create: false, // NO create permissions
//     edit: false, // NO edit permissions
//     delete: false, // NO delete permissions
//     manageUsers: false,
//     manageSuppliers: false,
//     manageCategories: false,
//     viewAnalytics: false,
//     manageSettings: false,
//     blockUsers: false,
//     approveSuppliers: false,
//     'dashboard.view': true,
//     'users.view': true, // Can view users
//     'users.create': false, // Cannot create users
//     'users.edit': false, // Cannot edit users
//     'users.delete': false, // Cannot delete users
//     'user_categories.view': true,
//     'user_categories.create': false,
//     'user_categories.edit': false,
//     'user_categories.delete': false,
//     'suppliers.view': true,
//     'suppliers.create': false,
//     'suppliers.edit': false,
//     'suppliers.delete': false,
//     'supplier_categories.view': true,
//     'supplier_categories.create': false,
//     'supplier_categories.edit': false,
//     'supplier_categories.delete': false,
//     'projects.view': true,
//     'analytics.view': false,
//     'settings.view': false
//   };
// };

// // Logout
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
import AuthUser from '../models/User';
import { UserCategory, User } from '../models/index';

// Static Admin Credentials
const STATIC_ADMIN = {
  email: 'admin@example.com',
  password: 'admin123',
  name: 'Super Admin',
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
          console.log('Converted permissions:', {
            create: permissions.create,
            edit: permissions.edit,
            delete: permissions.delete,
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

/**
 * Convert array of permission strings to permission object
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
    
    // System permissions from PERMISSIONS constant
    'dashboard.view': false,
    'users.view': false,
    'users.create': false,
    'users.edit': false,
    'users.delete': false,
    'user_categories.view': false,
    'user_categories.create': false,
    'user_categories.edit': false,
    'user_categories.delete': false,
    'suppliers.view': false,
    'suppliers.create': false,
    'suppliers.edit': false,
    'suppliers.delete': false,
    'supplier_categories.view': false,
    'supplier_categories.create': false,
    'supplier_categories.edit': false,
    'supplier_categories.delete': false,
    'projects.view': false,
    'analytics.view': false,
    'settings.view': false
  };

  // Set permissions based on array
  permissionArray.forEach((permission: string) => {
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

  return permissions;
};

/**
 * Admin permissions (for static admin only)
 */
const getAdminPermissions = () => {
  return {
    // CRITICAL: Add isStaticAdmin flag
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
    
    // All system permissions
    'dashboard.view': true,
    'users.view': true,
    'users.create': true,
    'users.edit': true,
    'users.delete': true,
    'user_categories.view': true,
    'user_categories.create': true,
    'user_categories.edit': true,
    'user_categories.delete': true,
    'suppliers.view': true,
    'suppliers.create': true,
    'suppliers.edit': true,
    'suppliers.delete': true,
    'supplier_categories.view': true,
    'supplier_categories.create': true,
    'supplier_categories.edit': true,
    'supplier_categories.delete': true,
    'projects.view': true,
    'analytics.view': true,
    'settings.view': true
  };
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
    'users.view': true,
    'users.create': false,
    'users.edit': false,
    'users.delete': false,
    'user_categories.view': true,
    'user_categories.create': false,
    'user_categories.edit': false,
    'user_categories.delete': false,
    'suppliers.view': true,
    'suppliers.create': false,
    'suppliers.edit': false,
    'suppliers.delete': false,
    'supplier_categories.view': true,
    'supplier_categories.create': false,
    'supplier_categories.edit': false,
    'supplier_categories.delete': false,
    'projects.view': true,
    'analytics.view': false,
    'settings.view': false
  };
};

/**
 * Minimal permissions for blocked users
 */
const getBlockedUserPermissions = () => {
  return {
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
    
    // All system permissions false
    'dashboard.view': false,
    'users.view': false,
    'users.create': false,
    'users.edit': false,
    'users.delete': false,
    'user_categories.view': false,
    'user_categories.create': false,
    'user_categories.edit': false,
    'user_categories.delete': false,
    'suppliers.view': false,
    'suppliers.create': false,
    'suppliers.edit': false,
    'suppliers.delete': false,
    'supplier_categories.view': false,
    'supplier_categories.create': false,
    'supplier_categories.edit': false,
    'supplier_categories.delete': false,
    'projects.view': false,
    'analytics.view': false,
    'settings.view': false
  };
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

const validateLogin = (name: string, email: string, password: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
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
  
  return { isValid: true };
};

// ==================== CONTROLLER FUNCTIONS ====================

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const validation = validateRegistration(name, email, password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const defaultCategory = await UserCategory.findOne({ 
      categoryType: 'User', 
      isBlocked: false 
    });

    if (!defaultCategory) {
      return res.status(400).json({
        success: false,
        message: 'Default user role not found. Please contact administrator.'
      });
    }

    const user = new AuthUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      userTypeId: defaultCategory._id,
    } as any);

    await user.save();

    const permissions = getDefaultViewPermissions();
    
    const token = generateToken(user._id.toString(), user.email, 'user', permissions);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
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
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation failed'
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
    const { name, email, password } = req.body;
    
    console.log('Login attempt:', { email, name: name.substring(0, 3) + '...' });

    const validation = validateLogin(name, email, password);
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
        user_categories_edit: permissions['user_categories.edit'],
        user_categories_delete: permissions['user_categories.delete'],
        user_categories_create: permissions['user_categories.create']
      });
      
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'static-admin-id',
            name: STATIC_ADMIN.name,
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
    const user = await AuthUser.findOne({ email: email.trim().toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('User not found in AuthUser:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('User found in AuthUser:', { 
      id: user._id, 
      email: user.email,
      name: user.name,
      role: user.role 
    });

    const providedName = name.trim().toLowerCase();
    const storedName = user.name.trim().toLowerCase();
    
    if (providedName !== storedName) {
      console.log('Name mismatch:', { providedName, storedName });
      return res.status(401).json({
        success: false,
        message: 'Name does not match our records'
      });
    }

    if (user.isActive === false) {
      console.log('User inactive in AuthUser:', user.email);
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
    
    console.log('Final permissions assigned:', {
      email: user.email,
      isStaticAdmin: permissions.isStaticAdmin,
      hasCreate: permissions.create,
      hasEdit: permissions.edit,
      hasDelete: permissions.delete,
      permissionsFromUnifiedModel: !permissions.create && !permissions.edit && !permissions.delete ? 'View-only (not in UnifiedModel)' : 'From UserCategory'
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
            name: STATIC_ADMIN.name,
            email: STATIC_ADMIN.email,
            role: 'admin',
            isStaticAdmin: true
          },
          permissions
        }
      });
    }

    const user = await AuthUser.findById(authReq.user?.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const permissions = await getUserPermissions(user.email);
    
    console.log('Get current user permissions:', {
      email: user.email,
      isStaticAdmin: permissions.isStaticAdmin,
      hasCreate: permissions.create,
      hasEdit: permissions.edit,
      hasDelete: permissions.delete
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
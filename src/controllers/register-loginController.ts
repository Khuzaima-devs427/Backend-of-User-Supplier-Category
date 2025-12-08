// controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import AuthUser from '../models/User'; // Updated import - should be AuthUser model
import { UserCategory } from '../models/index';

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

// Helper function to get user permissions based on user category
const getUserPermissions = async (userTypeId: any) => {
  try {
    const userCategory = await UserCategory.findById(userTypeId);
    
    if (!userCategory) {
      return getDefaultPermissions('user');
    }

    const categoryType = userCategory.categoryType.toLowerCase();
    
    // Map category types to permission levels
    switch (categoryType) {
      case 'admin':
      case 'super admin':
        return getDefaultPermissions('admin');
      
      case 'supplier':
        return getDefaultPermissions('supplier');
      
      case 'manager':
        return getDefaultPermissions('manager');
      
      case 'user':
      default:
        return getDefaultPermissions('user');
    }
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return getDefaultPermissions('user');
  }
};

// Register Controller
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Find default user category (regular user)
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

    // Create new user with name field
    const user = new AuthUser({
      name,
      email,
      password,
    });

    await user.save();

    // Get user permissions
    const permissions = await getUserPermissions(defaultCategory._id);
    
    // Generate token with permissions
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

// Login Controller with Static Admin
export const login = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check static admin credentials
    if (email === STATIC_ADMIN.email && password === STATIC_ADMIN.password) {
      const permissions = getDefaultPermissions('admin');
      const token = generateToken('static-admin-id', STATIC_ADMIN.email, 'admin', permissions);
      
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

    // Validate that name is provided
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be at least 2 characters'
      });
    }

    // Regular user login
    const user = await AuthUser.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Validate that the provided name matches the stored name
    const providedName = name.trim().toLowerCase();
    const storedName = user.name.trim().toLowerCase();
    
    if (providedName !== storedName) {
      return res.status(401).json({
        success: false,
        message: 'Name does not match our records'
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get user role
    const userRole = user.role || 'user';

    // Get permissions
    const permissions = getDefaultPermissions(userRole);

    // Generate token with permissions
    const token = generateToken(user._id.toString(), user.email, userRole, permissions);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: userRole
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

// Get Current User
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Type assertion for req.user
    const authReq = req as any;
    
    // Check if it's static admin
    if (authReq.user?.email === STATIC_ADMIN.email) {
      const permissions = getDefaultPermissions('admin');
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

    // Regular user
    const user = await AuthUser.findById(authReq.user?.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userRole = user.role || 'user';
    const permissions = getDefaultPermissions(userRole);

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: userRole
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

// Default permissions based on role
const getDefaultPermissions = (role: string) => {
  const basePermissions = {
    view: true,
    editProfile: true,
    changePassword: true
  };

  switch (role) {
    case 'admin':
    case 'super admin':
      return {
        ...basePermissions,
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
    
    case 'supplier':
      return {
        ...basePermissions,
        create: true,
        edit: true,
        delete: false,
        manageProducts: true,
        viewOwnData: true,
        updateOwnProfile: true,
        'dashboard.view': true,
        'suppliers.view': true,
        'suppliers.edit': true,
        'projects.view': true,
        'analytics.view': true
      };
    
    case 'manager':
      return {
        ...basePermissions,
        create: true,
        edit: true,
        delete: false,
        viewAll: true,
        approveEntries: true,
        generateReports: true,
        'dashboard.view': true,
        'users.view': true,
        'users.edit': true,
        'suppliers.view': true,
        'suppliers.edit': true,
        'projects.view': true,
        'analytics.view': true
      };
    
    case 'user':
    default:
      return {
        ...basePermissions,
        create: false,
        edit: false,
        delete: false,
        view: true,
        viewOwnData: true,
        updateOwnProfile: true,
        'dashboard.view': true
      };
  }
};

// Logout
export const logout = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};
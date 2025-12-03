"use strict";
// // controllers/userCategoryController.ts
// import { Request, Response } from 'express';
// import { UserCategory } from '../models/index';
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPermissionGroup = exports.updateCategoryPermissions = exports.getCategoryPermissions = exports.getSystemPermissions = exports.getSupplierUserCategories = exports.deleteUserCategory = exports.updateUserCategoryStatus = exports.updateUserCategory = exports.getUserCategoryById = exports.getUserCategories = exports.createUserCategory = exports.SYSTEM_PERMISSIONS = void 0;
const index_1 = require("../models/index");
// Define system permissions (add this at the top)
exports.SYSTEM_PERMISSIONS = {
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
};
// ========== EXISTING FUNCTIONS (UNCHANGED) ==========
const createUserCategory = async (req, res) => {
    try {
        const { role, description, categoryType, permissions } = req.body;
        // Check if category with same role already exists
        const existingCategory = await index_1.UserCategory.findOne({ role });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'User category with this role already exists'
            });
        }
        const category = new index_1.UserCategory({
            role,
            description: description || '',
            categoryType,
            permissions: permissions || []
        });
        await category.save();
        // Transform response to include status field
        const categoryObj = category.toObject();
        const transformedCategory = {
            ...categoryObj,
            status: categoryObj.isBlocked ? 'inactive' : 'active'
        };
        res.status(201).json({
            success: true,
            message: 'User category created successfully',
            data: transformedCategory
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.createUserCategory = createUserCategory;
const getUserCategories = async (req, res) => {
    try {
        const { categoryType, search, status, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (categoryType)
            filter.categoryType = categoryType;
        if (status) {
            if (status === 'inactive') {
                filter.isBlocked = true;
            }
            else if (status === 'active') {
                filter.isBlocked = false;
            }
        }
        if (search) {
            filter.$or = [
                { role: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const categories = await index_1.UserCategory.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const transformedCategories = categories.map(category => {
            const categoryObj = category.toObject();
            return {
                ...categoryObj,
                status: categoryObj.isBlocked ? 'inactive' : 'active'
            };
        });
        const total = await index_1.UserCategory.countDocuments(filter);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getUserCategories = getUserCategories;
const getUserCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await index_1.UserCategory.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'User category not found'
            });
        }
        const categoryObj = category.toObject();
        const transformedCategory = {
            ...categoryObj,
            status: categoryObj.isBlocked ? 'inactive' : 'active'
        };
        res.json({
            success: true,
            data: transformedCategory
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getUserCategoryById = getUserCategoryById;
const updateUserCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, description, categoryType, permissions } = req.body;
        const category = await index_1.UserCategory.findByIdAndUpdate(id, {
            role,
            description,
            categoryType,
            permissions
        }, { new: true, runValidators: true });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'User category not found'
            });
        }
        const categoryObj = category.toObject();
        const transformedCategory = {
            ...categoryObj,
            status: categoryObj.isBlocked ? 'inactive' : 'active'
        };
        res.json({
            success: true,
            message: 'User category updated successfully',
            data: transformedCategory
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.updateUserCategory = updateUserCategory;
const updateUserCategoryStatus = async (req, res) => {
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
        const category = await index_1.UserCategory.findByIdAndUpdate(id, { isBlocked }, { new: true, runValidators: true });
        if (!category) {
            console.log('❌ User category not found with ID:', id);
            return res.status(404).json({
                success: false,
                message: 'User category not found'
            });
        }
        console.log('✅ User category status updated successfully:', category.role, '->', status);
        const categoryObj = category.toObject();
        const transformedCategory = {
            ...categoryObj,
            status: categoryObj.isBlocked ? 'inactive' : 'active'
        };
        res.json({
            success: true,
            message: `User category ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
            data: transformedCategory
        });
    }
    catch (error) {
        console.error('❌ Error updating user category status:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.updateUserCategoryStatus = updateUserCategoryStatus;
const deleteUserCategory = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔄 Attempting to delete user category with ID:', id);
        const category = await index_1.UserCategory.findByIdAndDelete(id);
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
    }
    catch (error) {
        console.error('❌ Error deleting user category:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.deleteUserCategory = deleteUserCategory;
// Get only supplier type categories for supplier selection
const getSupplierUserCategories = async (req, res) => {
    try {
        const categories = await index_1.UserCategory.find({
            categoryType: 'Supplier',
            isBlocked: false
        }).select('role description');
        const transformedCategories = categories.map(category => {
            const categoryObj = category.toObject();
            return {
                ...categoryObj,
                status: categoryObj.isBlocked ? 'inactive' : 'active'
            };
        });
        res.json({
            success: true,
            data: transformedCategories
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getSupplierUserCategories = getSupplierUserCategories;
// ========== NEW PERMISSIONS FUNCTIONS ==========
/**
 * Get all available system permissions
 */
const getSystemPermissions = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                permissions: exports.SYSTEM_PERMISSIONS
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching system permissions',
            error: error.message
        });
    }
};
exports.getSystemPermissions = getSystemPermissions;
/**
 * Get permissions for specific user category
 */
const getCategoryPermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const userCategory = await index_1.UserCategory.findById(id);
        if (!userCategory) {
            return res.status(404).json({
                success: false,
                message: 'User category not found'
            });
        }
        const categoryObj = userCategory.toObject();
        const transformedCategory = {
            ...categoryObj,
            status: categoryObj.isBlocked ? 'inactive' : 'active'
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching category permissions',
            error: error.message
        });
    }
};
exports.getCategoryPermissions = getCategoryPermissions;
/**
 * Update permissions for user category
 */
const updateCategoryPermissions = async (req, res) => {
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
        const validPermissions = Object.values(exports.SYSTEM_PERMISSIONS);
        const invalidPermissions = permissions.filter((p) => !validPermissions.includes(p));
        if (invalidPermissions.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid permissions: ${invalidPermissions.join(', ')}`
            });
        }
        const userCategory = await index_1.UserCategory.findByIdAndUpdate(id, { permissions }, { new: true });
        if (!userCategory) {
            return res.status(404).json({
                success: false,
                message: 'User category not found'
            });
        }
        const categoryObj = userCategory.toObject();
        const transformedCategory = {
            ...categoryObj,
            status: categoryObj.isBlocked ? 'inactive' : 'active'
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating permissions',
            error: error.message
        });
    }
};
exports.updateCategoryPermissions = updateCategoryPermissions;
/**
 * Assign permission group to user category
 */
const assignPermissionGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { group } = req.body;
        // Define permission groups with string arrays (FIXED TypeScript issue)
        const PERMISSION_GROUPS = {
            full_access: Object.values(exports.SYSTEM_PERMISSIONS),
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
                'users.view', 'users.create', 'users.edit',
                'suppliers.view', 'suppliers.create', 'suppliers.edit',
                'projects.view', 'projects.create', 'projects.edit',
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
        const userCategory = await index_1.UserCategory.findByIdAndUpdate(id, { permissions }, { new: true });
        if (!userCategory) {
            return res.status(404).json({
                success: false,
                message: 'User category not found'
            });
        }
        const categoryObj = userCategory.toObject();
        const transformedCategory = {
            ...categoryObj,
            status: categoryObj.isBlocked ? 'inactive' : 'active'
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error assigning permission group',
            error: error.message
        });
    }
};
exports.assignPermissionGroup = assignPermissionGroup;

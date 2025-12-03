"use strict";
// // routes/index.ts
// import express from 'express';
// import {
//   createUserCategory,
//   getUserCategories,
//   getUserCategoryById,
//   updateUserCategory,
//   updateUserCategoryStatus,
//   deleteUserCategory,
//   getSupplierUserCategories
// } from '../controllers/userCategoryController';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import {
//   createSupplierCategory,
//   getSupplierCategories,
//   getSupplierCategoryById,
//   updateSupplierCategory,
//   updateSupplierCategoryStatus,
//   deleteSupplierCategory
// } from '../controllers/supplierCategoryController';
// import {
//   createUser,
//   createSupplier,
//   getUsers,
//   getSuppliers,
//   getUserById,
//   updateUser,
//   updateUserStatus,
//   deleteUser
// } from '../controllers/userController';
// const router = express.Router();
// // User Category Routes
// router.post('/user-categories', createUserCategory);
// router.get('/user-categories', getUserCategories);
// router.get('/user-categories/supplier-types', getSupplierUserCategories);
// router.get('/user-categories/:id', getUserCategoryById);
// router.put('/user-categories/:id', updateUserCategory);
// router.patch('/user-categories/:id/status', updateUserCategoryStatus);
// router.delete('/user-categories/:id', deleteUserCategory);
// // Supplier Category Routes
// router.post('/supplier-categories', createSupplierCategory);
// router.get('/supplier-categories', getSupplierCategories);
// router.get('/supplier-categories/:id', getSupplierCategoryById);
// router.put('/supplier-categories/:id', updateSupplierCategory);
// router.patch('/supplier-categories/:id/status', updateSupplierCategoryStatus);
// router.delete('/supplier-categories/:id', deleteSupplierCategory);
// // User Routes (Regular Users)
// router.post('/users', createUser);
// router.get('/users', getUsers);
// // Supplier Routes (Collection operations only)
// router.post('/suppliers', createSupplier);
// router.get('/suppliers', getSuppliers);
// // Common User/Supplier Routes (For individual operations - use these for both users and suppliers)
// router.get('/users/:id', getUserById);           // Get single user/supplier by ID
// router.put('/users/:id', updateUser);            // Update user/supplier by ID
// router.patch('/users/:id/status', updateUserStatus); // Update status by ID
// router.delete('/users/:id', deleteUser);         // Delete user/supplier by ID
// export default router;
// routes/index.ts
const express_1 = __importDefault(require("express"));
const userCategoryController_1 = require("../controllers/userCategoryController");
const supplierCategoryController_1 = require("../controllers/supplierCategoryController");
const cloudinary_1 = require("../config/cloudinary");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// ========== USER CATEGORY ROUTES ==========
router.post('/user-categories', userCategoryController_1.createUserCategory);
router.get('/user-categories', userCategoryController_1.getUserCategories);
router.get('/user-categories/supplier-types', userCategoryController_1.getSupplierUserCategories);
router.get('/user-categories/:id', userCategoryController_1.getUserCategoryById);
router.put('/user-categories/:id', userCategoryController_1.updateUserCategory);
router.patch('/user-categories/:id/status', userCategoryController_1.updateUserCategoryStatus);
router.delete('/user-categories/:id', userCategoryController_1.deleteUserCategory);
// NEW PERMISSIONS ROUTES (Added to existing user category routes)
router.get('/user-categories/system/permissions', userCategoryController_1.getSystemPermissions);
router.get('/user-categories/:id/permissions', userCategoryController_1.getCategoryPermissions);
router.put('/user-categories/:id/permissions', userCategoryController_1.updateCategoryPermissions);
router.post('/user-categories/:id/permissions/group', userCategoryController_1.assignPermissionGroup);
// ========== SUPPLIER CATEGORY ROUTES ==========
router.post('/supplier-categories', cloudinary_1.uploadProductImage, supplierCategoryController_1.createSupplierCategory);
router.get('/supplier-categories', supplierCategoryController_1.getSupplierCategories);
router.get('/supplier-categories/:id', supplierCategoryController_1.getSupplierCategoryById);
router.put('/supplier-categories/:id', cloudinary_1.uploadProductImage, supplierCategoryController_1.updateSupplierCategory);
router.patch('/supplier-categories/:id/status', supplierCategoryController_1.updateSupplierCategoryStatus);
router.delete('/supplier-categories/:id', supplierCategoryController_1.deleteSupplierCategory);
// ========== USER ROUTES ==========
router.post('/users', userController_1.createUser);
router.get('/users', userController_1.getUsers);
// ========== SUPPLIER ROUTES ==========
router.post('/suppliers', userController_1.createSupplier);
router.get('/suppliers', userController_1.getSuppliers);
// ========== COMMON USER/SUPPLIER ROUTES ==========
router.get('/users/:id', userController_1.getUserById);
router.put('/users/:id', userController_1.updateUser);
router.patch('/users/:id/status', userController_1.updateUserStatus);
router.delete('/users/:id', userController_1.deleteUser);
exports.default = router;

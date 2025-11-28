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
import express from 'express';
import {
  createUserCategory,
  getUserCategories,
  getUserCategoryById,
  updateUserCategory,
  updateUserCategoryStatus,
  deleteUserCategory,
  getSupplierUserCategories,
  // NEW PERMISSIONS FUNCTIONS
  getSystemPermissions,
  getCategoryPermissions,
  updateCategoryPermissions,
  assignPermissionGroup
} from '../controllers/userCategoryController';

import {
  createSupplierCategory,
  getSupplierCategories,
  getSupplierCategoryById,
  updateSupplierCategory,
  updateSupplierCategoryStatus,
  deleteSupplierCategory
} from '../controllers/supplierCategoryController';
import { uploadProductImage } from '../config/cloudinary';

import {
  createUser,
  createSupplier,
  getUsers,
  getSuppliers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser
} from '../controllers/userController';

const router = express.Router();

// ========== USER CATEGORY ROUTES ==========
router.post('/user-categories', createUserCategory);
router.get('/user-categories', getUserCategories);
router.get('/user-categories/supplier-types', getSupplierUserCategories);
router.get('/user-categories/:id', getUserCategoryById);
router.put('/user-categories/:id', updateUserCategory);
router.patch('/user-categories/:id/status', updateUserCategoryStatus);
router.delete('/user-categories/:id', deleteUserCategory);

// NEW PERMISSIONS ROUTES (Added to existing user category routes)
router.get('/user-categories/system/permissions', getSystemPermissions);
router.get('/user-categories/:id/permissions', getCategoryPermissions);
router.put('/user-categories/:id/permissions', updateCategoryPermissions);
router.post('/user-categories/:id/permissions/group', assignPermissionGroup);

// ========== SUPPLIER CATEGORY ROUTES ==========
router.post('/supplier-categories', uploadProductImage, createSupplierCategory);
router.get('/supplier-categories', getSupplierCategories);
router.get('/supplier-categories/:id', getSupplierCategoryById);
router.put('/supplier-categories/:id', uploadProductImage, updateSupplierCategory);
router.patch('/supplier-categories/:id/status', updateSupplierCategoryStatus);
router.delete('/supplier-categories/:id', deleteSupplierCategory);

// ========== USER ROUTES ==========
router.post('/users', createUser);
router.get('/users', getUsers);

// ========== SUPPLIER ROUTES ==========
router.post('/suppliers', createSupplier);
router.get('/suppliers', getSuppliers);

// ========== COMMON USER/SUPPLIER ROUTES ==========
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

export default router;
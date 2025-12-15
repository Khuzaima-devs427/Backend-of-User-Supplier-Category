// // models/UnifiedModel.ts
// import mongoose, { Schema, Document, CallbackError } from 'mongoose';
// import bcrypt from 'bcryptjs';

// // ==================== INTERFACES ====================

// export interface IAddress {
//   country: string;
//   state: string;
//   city: string;
//   streetAddress: string;
//   houseNumber: string;
//   postalCode: string;
// }

// export interface IUserCategory extends Document {
//   role: string;
//   description: string;
//   permissions: string[];
//   isBlocked: boolean;
//   categoryType: 'Supplier' | 'User' | 'Admin' | 'Super Admin' | 'Other';
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface ISupplierCategory extends Document {
//   name: string;
//   description: string;
//   image?: string;
//   productCategories: string[];
//   productType: 'new' | 'scrap';
//   isBlocked: boolean; // FIXED: Changed from status to isBlocked
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface IUser extends Document {
//   name?: string; // ADD THIS for backward compatibility
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber?: string;
//   password: string;
//   signUpThrough: string;
//   isEmailVerified: boolean;
  
//   // User Type = Reference to UserCategory
//   userType: Schema.Types.ObjectId;
  
//   // Supplier Category = Only for suppliers
//   supplierCategory?: Schema.Types.ObjectId;
  
//   address?: IAddress;
//   isBlocked: boolean;

//   // ADD THESE AUTH FIELDS
//   role?: 'user' | 'admin'; // Optional for your existing users
//   isActive?: boolean; // Optional, can use isBlocked instead
  
//   createdAt: Date;
//   updatedAt: Date;
  
//   comparePassword(candidatePassword: string): Promise<boolean>;
// }

// // ==================== SCHEMAS ====================

// const UserCategorySchema: Schema = new Schema({
//   role: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   permissions: {
//     type: [String],
//     default: []
//   },
//   isBlocked: {
//     type: Boolean,
//     default: false
//   },
//   categoryType: {
//     type: String,
//     required: true,
//     enum: ['Supplier', 'User', 'Admin', 'Super Admin', 'Other']
//   }
// }, {
//   timestamps: true
// });

// // Define your permissions as simple strings
// export const PERMISSIONS = {
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
  
//   // Projects
//   'projects.view': 'projects.view',
 
  
//   // Analytics
//   'analytics.view': 'analytics.view',
  
//   // Settings
//   'settings.view': 'settings.view',
  
// } as const;

// export type Permission = keyof typeof PERMISSIONS;




// const SupplierCategorySchema: Schema = new Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   image: {
//     type: String,
//     default: ''
//   },
//   productCategories: {
//     type: [String],
//     required: true,
//     enum: [
//       'Electronics',
//       'Construction Materials',
//       'Industrial Equipment',
//       'Raw Materials',
//       'Consumer Goods'
//     ],
//     validate: {
//       validator: function(categories: string[]) {
//         return categories.length > 0;
//       },
//       message: 'At least one product category is required'
//     }
//   },
//   productType: {
//     type: String,
//     required: true,
//     enum: ['new', 'scrap']
//   },
//   isBlocked: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// const UserSchema: Schema = new Schema({
// name: { // ADD THIS FIELD
//     type: String,
//     trim: true,
//     default: function(this: IUser) {
//       return `${this.firstName} ${this.lastName}`;
//     }
//   },
//   firstName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   lastName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true
//   },
//   phoneNumber: {
//     type: String,
//     default: ''
//   },
//   password: {
//     type: String,
//     required: true

//   },
//   signUpThrough: {
//     type: String,
//     default: 'Web'
//   },
//   isEmailVerified: {
//     type: Boolean,
//     default: false
//   },
//   userType: {
//     type: Schema.Types.ObjectId,
//     ref: 'UserCategory',
//     required: true
//   },
//   supplierCategory: {
//     type: Schema.Types.ObjectId,
//     ref: 'SupplierCategory'
//   },
//   address: {
//     country: { type: String, default: '' },
//     state: { type: String, default: '' },
//     city: { type: String, default: '' },
//     streetAddress: { type: String, default: '' },
//     houseNumber: { type: String, default: '' },
//     postalCode: { type: String, default: '' }
//   },
//     // ADD THESE AUTH FIELDS
//   role: {
//     type: String,
//     enum: ['user', 'admin'],
//     default: 'user'
//   },
//    isActive: { // ⚠️ ADD THIS MISSING FIELD!
//     type: Boolean,
//     default: true
//   },
//   additionalAccessRights: {
//     type: [String],
//     default: []
//   },
//   restrictedAccessRights: {
//     type: [String],
//     default: []
//   },
//   additionalDocuments: {
//     type: [Schema.Types.Mixed],
//     default: []
//   },
//   isBlocked: {
//     type: Boolean,
//     default: false
//   },
//   supplierKey: {
//     type: String
//   },
//   isSupervisor: {
//     type: Boolean,
//     default: false
//   },
//   geofencingRadius: {
//     type: Number,
//     default: 500
//   },
//   geofencingAttendanceEnabled: {
//     type: Boolean,
//     default: false
//   },
//   annualLeaveEntitlement: {
//     type: Number,
//     default: 20
//   },
//   annualLeaveCarriedForward: {
//     type: Number,
//     default: 0
//   },
//   profileCompleted: {
//     type: Boolean,
//     default: false
//   },
//   profileCompletionPercentage: {
//     type: Number,
//     default: 0
//   },
//   isAffiliated: {
//     type: Boolean,
//     default: false
//   },
//   teamAssignments: {
//     type: [Schema.Types.Mixed],
//     default: []
//   },
//   supervisorTeams: {
//     type: [Schema.Types.Mixed],
//     default: []
//   },
//   annualLeaveYear: {
//     type: Number,
//     default: new Date().getFullYear()
//   }
// }, {
//   timestamps: true
// });

// // ==================== MIDDLEWARE ====================

// // Hash password before saving for User
// UserSchema.pre('save', async function(this: IUser, next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error: any) {
//     next(error as CallbackError);
//   }
// });

// // Validate that suppliers have userType of categoryType "supplier"
// UserSchema.pre('save', async function(this: IUser, next) {
//   if (this.supplierCategory) {
//     try {
//       const userCat = await mongoose.model('UserCategory').findById(this.userType);
//       if (!userCat || userCat.categoryType !== 'Supplier') {
//         return next(new Error('Suppliers must have a user category of type "supplier"') as CallbackError);
//       }
//     } catch (error) {
//       return next(error as CallbackError);
//     }
//   }
//   next();
// });

// // ==================== METHODS ====================

// // Compare password method for User
// UserSchema.methods.comparePassword = async function(
//   this: IUser, 
//   candidatePassword: string
// ): Promise<boolean> {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// // ==================== STATICS ====================

// // User Category statics
// interface UserCategoryModel extends mongoose.Model<IUserCategory> {
//   findActiveUserCategories(): mongoose.Query<IUserCategory[], IUserCategory>;
//   findSupplierCategories(): mongoose.Query<IUserCategory[], IUserCategory>;
// }

// UserCategorySchema.statics.findActiveUserCategories = function() {
//   return this.find({ isBlocked: false }).sort({ role: 1 });
// };

// UserCategorySchema.statics.findSupplierCategories = function() {
//   return this.find({ categoryType: 'Supplier', isBlocked: false }).sort({ role: 1 });
// };

// // Supplier Category statics
// interface SupplierCategoryModel extends mongoose.Model<ISupplierCategory> {
//   findActiveSupplierCategories(): mongoose.Query<ISupplierCategory[], ISupplierCategory>;
// }

// SupplierCategorySchema.statics.findActiveSupplierCategories = function() {
//   return this.find({ isBlocked: false }).sort({ name: 1 });
// };

// // User statics
// interface UserModel extends mongoose.Model<IUser> {
//   findByEmail(email: string): mongoose.Query<IUser | null, IUser>;
//   findUsers(): mongoose.Query<IUser[], IUser>;
//   findSuppliers(): mongoose.Query<IUser[], IUser>;
// }

// UserSchema.statics.findByEmail = function(email: string) {
//   return this.findOne({ email })
//     .populate('userType', 'role categoryType description')
//     .populate('supplierCategory', 'name productCategories productType');
// };

// UserSchema.statics.findUsers = function() {
//   return this.find({ supplierCategory: { $exists: false } })
//     .populate('userType', 'role categoryType description')
//     .select('-password')
//     .sort({ createdAt: -1 });
// };

// UserSchema.statics.findSuppliers = function() {
//   return this.find({ supplierCategory: { $exists: true } })
//     .populate('userType', 'role categoryType description')
//     .populate('supplierCategory', 'name productCategories productType description image')
//     .select('-password')
//     .sort({ createdAt: -1 });
// };

// // ==================== INDEXES ====================

// UserCategorySchema.index({ categoryType: 1, isBlocked: 1 });
// UserCategorySchema.index({ role: 'text', description: 'text' });

// SupplierCategorySchema.index({ productType: 1, isBlocked: 1 });
// SupplierCategorySchema.index({ name: 'text', description: 'text' });

// UserSchema.index({ email: 1 });
// UserSchema.index({ userType: 1 });
// UserSchema.index({ supplierCategory: 1 });
// UserSchema.index({ isBlocked: 1 });
// UserSchema.index({ 
//   firstName: 'text', 
//   lastName: 'text', 
//   email: 'text' 
// });

// // ==================== MODELS ====================

// export const UserCategory = mongoose.model<IUserCategory, UserCategoryModel>('UserCategory', UserCategorySchema);
// export const SupplierCategory = mongoose.model<ISupplierCategory, SupplierCategoryModel>('SupplierCategory', SupplierCategorySchema);
// export const User = mongoose.model<IUser, UserModel>('User', UserSchema, 'users');

// // ==================== EXPORT ALL ====================

// export default {
//   UserCategory,
//   SupplierCategory,
//   User
// };
















// models/UnifiedModel.ts
// import mongoose, { Schema, Document, CallbackError } from 'mongoose';
// import bcrypt from 'bcryptjs';

// // ==================== INTERFACES ====================

// export interface IAddress {
//   country: string;
//   state: string;
//   city: string;
//   streetAddress: string;
//   houseNumber: string;
//   postalCode: string;
// }

// export interface IUserCategory extends Document {
//   role: string;
//   description: string;
//   permissions: string[];
//   status: 'active' | 'inactive'; // CHANGED: from isBlocked to status
//   categoryType: 'Supplier' | 'User' | 'Admin' | 'Super Admin' | 'Other';
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface ISupplierCategory extends Document {
//   name: string;
//   description: string;
//   image?: string;
//   productCategories: string[];
//   productType: 'new' | 'scrap';
//   status: 'active' | 'inactive'; // CHANGED: from isBlocked to status
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface IUser extends Document {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber?: string;
//   password: string;
//   signUpThrough: string;
//   isEmailVerified: boolean;
  
//   // User Type = Reference to UserCategory
//   userType: Schema.Types.ObjectId;
  
//   // Supplier Category = Only for suppliers
//   supplierCategory?: Schema.Types.ObjectId;
  
//   address?: IAddress;
//   status: 'active' | 'inactive'; // CHANGED: from isBlocked to status
  
//   createdAt: Date;
//   updatedAt: Date;
  
//   comparePassword(candidatePassword: string): Promise<boolean>;
// }

// // ==================== SCHEMAS ====================

// const UserCategorySchema: Schema = new Schema({
//   role: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   permissions: {
//     type: [String],
//     default: []
//   },
//   status: { // CHANGED: from isBlocked to status
//     type: String,
//     enum: ['active', 'inactive'],
//     default: 'active'
//   },
//   categoryType: {
//     type: String,
//     required: true,
//     enum: ['Supplier', 'User', 'Admin', 'Super Admin', 'Other']
//   }
// }, {
//   timestamps: true
// });

// const SupplierCategorySchema: Schema = new Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   image: {
//     type: String,
//     default: ''
//   },
//   productCategories: {
//     type: [String],
//     required: true,
//     enum: [
//       'Electronics',
//       'Construction Materials',
//       'Industrial Equipment',
//       'Raw Materials',
//       'Consumer Goods'
//     ],
//     validate: {
//       validator: function(categories: string[]) {
//         return categories.length > 0;
//       },
//       message: 'At least one product category is required'
//     }
//   },
//   productType: {
//     type: String,
//     required: true,
//     enum: ['new', 'scrap']
//   },
//   status: { // CHANGED: from isBlocked to status
//     type: String,
//     enum: ['active', 'inactive'],
//     default: 'active'
//   }
// }, {
//   timestamps: true
// });

// const UserSchema: Schema = new Schema({
//   firstName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   lastName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true
//   },
//   phoneNumber: {
//     type: String,
//     default: ''
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   signUpThrough: {
//     type: String,
//     default: 'Web'
//   },
//   isEmailVerified: {
//     type: Boolean,
//     default: false
//   },
//   userType: {
//     type: Schema.Types.ObjectId,
//     ref: 'UserCategory',
//     required: true
//   },
//   supplierCategory: {
//     type: Schema.Types.ObjectId,
//     ref: 'SupplierCategory'
//   },
//   address: {
//     country: { type: String, default: '' },
//     state: { type: String, default: '' },
//     city: { type: String, default: '' },
//     streetAddress: { type: String, default: '' },
//     houseNumber: { type: String, default: '' },
//     postalCode: { type: String, default: '' }
//   },
//   additionalAccessRights: {
//     type: [String],
//     default: []
//   },
//   restrictedAccessRights: {
//     type: [String],
//     default: []
//   },
//   additionalDocuments: {
//     type: [Schema.Types.Mixed],
//     default: []
//   },
//   status: { // CHANGED: from isBlocked to status
//     type: String,
//     enum: ['active', 'inactive'],
//     default: 'active'
//   },
//   supplierKey: {
//     type: String
//   },
//   isSupervisor: {
//     type: Boolean,
//     default: false
//   },
//   geofencingRadius: {
//     type: Number,
//     default: 500
//   },
//   geofencingAttendanceEnabled: {
//     type: Boolean,
//     default: false
//   },
//   annualLeaveEntitlement: {
//     type: Number,
//     default: 20
//   },
//   annualLeaveCarriedForward: {
//     type: Number,
//     default: 0
//   },
//   profileCompleted: {
//     type: Boolean,
//     default: false
//   },
//   profileCompletionPercentage: {
//     type: Number,
//     default: 0
//   },
//   isAffiliated: {
//     type: Boolean,
//     default: false
//   },
//   teamAssignments: {
//     type: [Schema.Types.Mixed],
//     default: []
//   },
//   supervisorTeams: {
//     type: [Schema.Types.Mixed],
//     default: []
//   },
//   annualLeaveYear: {
//     type: Number,
//     default: new Date().getFullYear()
//   }
// }, {
//   timestamps: true
// });

// // ==================== MIDDLEWARE ====================

// // Hash password before saving for User
// UserSchema.pre('save', async function(this: IUser, next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error: any) {
//     next(error as CallbackError);
//   }
// });

// // Validate that suppliers have userType of categoryType "supplier"
// UserSchema.pre('save', async function(this: IUser, next) {
//   if (this.supplierCategory) {
//     try {
//       const userCat = await mongoose.model('UserCategory').findById(this.userType);
//       if (!userCat || userCat.categoryType !== 'Supplier') {
//         return next(new Error('Suppliers must have a user category of type "supplier"') as CallbackError);
//       }
//     } catch (error) {
//       return next(error as CallbackError);
//     }
//   }
//   next();
// });

// // ==================== METHODS ====================

// // Compare password method for User
// UserSchema.methods.comparePassword = async function(
//   this: IUser, 
//   candidatePassword: string
// ): Promise<boolean> {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// // ==================== STATICS ====================

// // User Category statics
// interface UserCategoryModel extends mongoose.Model<IUserCategory> {
//   findActiveUserCategories(): mongoose.Query<IUserCategory[], IUserCategory>;
//   findSupplierCategories(): mongoose.Query<IUserCategory[], IUserCategory>;
// }

// UserCategorySchema.statics.findActiveUserCategories = function() {
//   return this.find({ status: 'active' }).sort({ role: 1 }); // CHANGED: from isBlocked to status
// };

// UserCategorySchema.statics.findSupplierCategories = function() {
//   return this.find({ categoryType: 'Supplier', status: 'active' }).sort({ role: 1 }); // CHANGED: from isBlocked to status
// };

// // Supplier Category statics
// interface SupplierCategoryModel extends mongoose.Model<ISupplierCategory> {
//   findActiveSupplierCategories(): mongoose.Query<ISupplierCategory[], ISupplierCategory>;
// }

// SupplierCategorySchema.statics.findActiveSupplierCategories = function() {
//   return this.find({ status: 'active' }).sort({ name: 1 }); // CHANGED: from isBlocked to status
// };

// // User statics
// interface UserModel extends mongoose.Model<IUser> {
//   findByEmail(email: string): mongoose.Query<IUser | null, IUser>;
//   findUsers(): mongoose.Query<IUser[], IUser>;
//   findSuppliers(): mongoose.Query<IUser[], IUser>;
// }

// UserSchema.statics.findByEmail = function(email: string) {
//   return this.findOne({ email })
//     .populate('userType', 'role categoryType description')
//     .populate('supplierCategory', 'name productCategories productType');
// };

// UserSchema.statics.findUsers = function() {
//   return this.find({ supplierCategory: { $exists: false } })
//     .populate('userType', 'role categoryType description')
//     .select('-password')
//     .sort({ createdAt: -1 });
// };

// UserSchema.statics.findSuppliers = function() {
//   return this.find({ supplierCategory: { $exists: true } })
//     .populate('userType', 'role categoryType description')
//     .populate('supplierCategory', 'name productCategories productType description image')
//     .select('-password')
//     .sort({ createdAt: -1 });
// };

// // ==================== INDEXES ====================

// UserCategorySchema.index({ categoryType: 1, status: 1 }); // CHANGED: from isBlocked to status
// UserCategorySchema.index({ role: 'text', description: 'text' });

// SupplierCategorySchema.index({ productType: 1, status: 1 }); // CHANGED: from isBlocked to status
// SupplierCategorySchema.index({ name: 'text', description: 'text' });

// UserSchema.index({ email: 1 });
// UserSchema.index({ userType: 1 });
// UserSchema.index({ supplierCategory: 1 });
// UserSchema.index({ status: 1 }); // CHANGED: from isBlocked to status
// UserSchema.index({ 
//   firstName: 'text', 
//   lastName: 'text', 
//   email: 'text' 
// });

// // ==================== MODELS ====================

// export const UserCategory = mongoose.model<IUserCategory, UserCategoryModel>('UserCategory', UserCategorySchema);
// export const SupplierCategory = mongoose.model<ISupplierCategory, SupplierCategoryModel>('SupplierCategory', SupplierCategorySchema);
// export const User = mongoose.model<IUser, UserModel>('User', UserSchema);

// // ==================== EXPORT ALL ====================

// export default {
//   UserCategory,
//   SupplierCategory,
//   User
// };
// models/UserCategory.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserCategory extends Document {
  role: string;
  description: string;
  permissions: string[];
  isBlocked: boolean;
  categoryType: 'Supplier' | 'User' | 'Admin' | 'Super Admin' | 'Other';

  createdAt: Date;
  updatedAt: Date;
}

export const PERMISSIONS = {
  'dashboard.view': 'dashboard.view',
  'users.view': 'users.view',
  'users.create': 'users.create', 
  'users.edit': 'users.edit',
  'users.delete': 'users.delete',
  'user_categories.view': 'user_categories.view',
  'user_categories.create': 'user_categories.create',
  'user_categories.edit': 'user_categories.edit',
  'user_categories.delete': 'user_categories.delete',
  'suppliers.view': 'suppliers.view',
  'suppliers.create': 'suppliers.create',
  'suppliers.edit': 'suppliers.edit', 
  'suppliers.delete': 'suppliers.delete',
  'supplier_categories.view': 'supplier_categories.view',
  'supplier_categories.create': 'supplier_categories.create',
  'supplier_categories.edit': 'supplier_categories.edit',
  'supplier_categories.delete': 'supplier_categories.delete',
  'hero_slider.view': 'hero_slider.view',
  'hero_slider.create': 'hero_slider.create',
  'hero_slider.edit': 'hero_slider.edit', 
  'hero_slider.delete': 'hero_slider.delete',
  'projects.view': 'projects.view',
  'analytics.view': 'analytics.view',
  'settings.view': 'settings.view',
} as const;

export type Permission = keyof typeof PERMISSIONS;

const UserCategorySchema: Schema = new Schema({
  role: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  permissions: {
    type: [String],
    default: []
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  categoryType: {
    type: String,
    required: true,
    enum: ['Supplier', 'User', 'Admin', 'Super Admin', 'Other'],
  }
}, {
  timestamps: true
});

interface UserCategoryModel extends Model<IUserCategory> {
  findActiveUserCategories(): mongoose.Query<IUserCategory[], IUserCategory>;
  findSupplierCategories(): mongoose.Query<IUserCategory[], IUserCategory>;
}

UserCategorySchema.statics.findActiveUserCategories = function() {
  return this.find({ isBlocked: false }).sort({ role: 1 });
};

UserCategorySchema.statics.findSupplierCategories = function() {
  return this.find({ categoryType: 'Supplier', isBlocked: false }).sort({ role: 1 });
};

UserCategorySchema.index({ categoryType: 1, isBlocked: 1 });
UserCategorySchema.index({ role: 'text', description: 'text' });

export const UserCategory = mongoose.model<IUserCategory, UserCategoryModel>('UserCategory', UserCategorySchema);
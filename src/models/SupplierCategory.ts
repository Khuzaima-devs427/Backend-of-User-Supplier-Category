// models/SupplierCategory.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplierCategory extends Document {
  name: string;
  description: string;
  image?: string;
  productCategories: string[];
  productType: 'new' | 'scrap';
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierCategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  productCategories: {
    type: [String],
    required: true,
    enum: [
      'Electronics',
      'Construction Materials',
      'Industrial Equipment',
      'Raw Materials',
      'Consumer Goods'
    ],
    validate: {
      validator: function(categories: string[]) {
        return categories.length > 0;
      },
      message: 'At least one product category is required'
    }
  },
  productType: {
    type: String,
    required: true,
    enum: ['new', 'scrap']
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

interface SupplierCategoryModel extends Model<ISupplierCategory> {
  findActiveSupplierCategories(): mongoose.Query<ISupplierCategory[], ISupplierCategory>;
}

SupplierCategorySchema.statics.findActiveSupplierCategories = function() {
  return this.find({ isBlocked: false }).sort({ name: 1 });
};

SupplierCategorySchema.index({ productType: 1, isBlocked: 1 });
SupplierCategorySchema.index({ name: 'text', description: 'text' });

export const SupplierCategory = mongoose.model<ISupplierCategory, SupplierCategoryModel>('SupplierCategory', SupplierCategorySchema);
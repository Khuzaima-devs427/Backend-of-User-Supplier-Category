import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for FeatureCategory
export interface IFeatureCategory extends Document {
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  featuredOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  markAsFeatured(): Promise<void>;
  removeFromFeatured(): Promise<void>;
}

// Define static methods interface separately
interface FeatureCategoryStatics {
  getFeaturedCount(): Promise<number>;
  getNextFeaturedOrder(): Promise<number>;
  canBeFeatured(): Promise<boolean>;
  toggleFeatured(featureCategoryId: string): Promise<IFeatureCategory | null>;
}

// Combine both interfaces for the model
type FeatureCategoryModel = Model<IFeatureCategory> & FeatureCategoryStatics;

// FeatureCategory Schema
const FeatureCategorySchema = new Schema<IFeatureCategory, FeatureCategoryModel>(
  {
    name: {
      type: String,
      required: [true, 'Feature category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
      type: String,
      required: [true, 'Feature category type is required'],
      default: 'General'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    featuredOrder: {
      type: Number,
      min: 1,
      max: 4,
      default: null,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
FeatureCategorySchema.index({ isFeatured: 1, featuredOrder: 1 });
FeatureCategorySchema.index({ status: 1, isFeatured: 1 });

// Static Methods

/**
 * Get count of currently featured feature categories
 */
FeatureCategorySchema.statics.getFeaturedCount = async function(): Promise<number> {
  return await this.countDocuments({ isFeatured: true });
};

/**
 * Check if a new feature category can be marked as featured (max 4 limit)
 */
FeatureCategorySchema.statics.canBeFeatured = async function(): Promise<boolean> {
  const featuredCount = await this.getFeaturedCount();
  return featuredCount < 4;
};

/**
 * Get the next available featured order number (1-4)
 */
FeatureCategorySchema.statics.getNextFeaturedOrder = async function(): Promise<number> {
  const featuredFeatureCategories = await this.find({ 
    isFeatured: true,
    featuredOrder: { $ne: null }
  }).select('featuredOrder');
  
  const usedOrders = featuredFeatureCategories
    .map((featureCat: IFeatureCategory) => featureCat.featuredOrder)
    .filter((order: number | null): order is number => order !== null);
  
  // Find first available number from 1 to 4
  for (let i = 1; i <= 4; i++) {
    if (!usedOrders.includes(i)) {
      return i;
    }
  }
  
  // Fallback (shouldn't reach here due to limit)
  return 1;
};

/**
 * Toggle featured status of a feature category
 * Enforces maximum 4 featured feature categories limit
 */
FeatureCategorySchema.statics.toggleFeatured = async function(
  featureCategoryId: string
): Promise<IFeatureCategory | null> {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Find the feature category
    const featureCategory = await this.findById(featureCategoryId).session(session);
    if (!featureCategory) {
      throw new Error('Feature category not found');
    }
    
    const newFeaturedStatus = !featureCategory.isFeatured;
    
    // If trying to mark as featured
    if (newFeaturedStatus) {
      const canBeFeatured = await this.canBeFeatured();
      if (!canBeFeatured) {
        throw new Error('Maximum 4 featured feature categories reached. Please remove one first.');
      }
      
      // Get next available order
      const nextOrder = await this.getNextFeaturedOrder();
      featureCategory.featuredOrder = nextOrder;
    } else {
      // Removing from featured
      featureCategory.featuredOrder = null;
    }
    
    featureCategory.isFeatured = newFeaturedStatus;
    await featureCategory.save({ session });
    
    await session.commitTransaction();
    return featureCategory;
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Instance Methods

/**
 * Mark this feature category as featured
 */
FeatureCategorySchema.methods.markAsFeatured = async function(): Promise<void> {
  // Type assertion to access statics
  const Model = this.constructor as FeatureCategoryModel;
  
  // Check if already featured
  if (this.isFeatured) {
    throw new Error('Feature category is already featured');
  }
  
  // Check limit
  const canBeFeatured = await Model.canBeFeatured();
  if (!canBeFeatured) {
    throw new Error('Maximum 4 featured feature categories reached. Please remove one first.');
  }
  
  // Get next available order
  const nextOrder = await Model.getNextFeaturedOrder();
  
  this.isFeatured = true;
  this.featuredOrder = nextOrder;
  await this.save();
};

/**
 * Remove this feature category from featured
 */
FeatureCategorySchema.methods.removeFromFeatured = async function(): Promise<void> {
  if (!this.isFeatured) {
    throw new Error('Feature category is not featured');
  }
  
  this.isFeatured = false;
  this.featuredOrder = null;
  await this.save();
};

// Middleware
FeatureCategorySchema.pre('save', async function(next) {
  // Type assertion to access statics
  const Model = this.constructor as FeatureCategoryModel;
  
  // If marking as featured, validate limit
  if (this.isModified('isFeatured') && this.isFeatured) {
    const featuredCount = await Model.getFeaturedCount();
    
    // If this is a new document being created as featured, count includes it
    // If existing document being updated to featured, count doesn't include it yet
    const currentDocCount = this.isNew ? 1 : 0;
    
    if (featuredCount + currentDocCount > 4) {
      throw new Error('Maximum 4 featured feature categories allowed');
    }
  }
  
  // Validate featuredOrder when isFeatured is true
  if (this.isFeatured && this.featuredOrder === null) {
    this.featuredOrder = await Model.getNextFeaturedOrder();
  }
  
  // If not featured, featuredOrder should be null
  if (!this.isFeatured && this.featuredOrder !== null) {
    this.featuredOrder = null;
  }
  
  next();
});

// Create and export the model
const FeatureCategory = mongoose.model<IFeatureCategory, FeatureCategoryModel>(
  'FeatureCategory', 
  FeatureCategorySchema
);
export default FeatureCategory;
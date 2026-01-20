import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Interface for FeatureListing
export interface IFeatureListing extends Document {
  name: string;
  description: string;
  image: string;
  price: number; // Added price field
  status: 'active' | 'inactive';
  isFeatured: boolean;
  featureCategory: Types.ObjectId; // Reference to FeatureCategory
  featuredOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  markAsFeatured(): Promise<void>;
  removeFromFeatured(): Promise<void>;
}

// Define static methods interface separately
interface FeatureListingStatics {
  getFeaturedCount(): Promise<number>;
  getNextFeaturedOrder(): Promise<number>;
  canBeFeatured(): Promise<boolean>;
  toggleFeatured(featureListingId: string): Promise<IFeatureListing | null>;
  getByFeatureCategory(categoryId: string): Promise<IFeatureListing[]>;
  getFeaturedListings(): Promise<IFeatureListing[]>;
}

// Combine both interfaces for the model
type FeatureListingModel = Model<IFeatureListing> & FeatureListingStatics;

// FeatureListing Schema
const FeatureListingSchema = new Schema<IFeatureListing, FeatureListingModel>(
  {
    name: {
      type: String,
      required: [true, 'Feature listing name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image: {
      type: String,
      required: [true, 'Feature listing image is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0
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
    featureCategory: {
      type: Schema.Types.ObjectId,
      ref: 'FeatureCategory',
      required: [true, 'Feature category reference is required'],
      index: true
    },
    featuredOrder: {
      type: Number,
      default: null,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
FeatureListingSchema.index({ isFeatured: 1, featuredOrder: 1 });
FeatureListingSchema.index({ status: 1, isFeatured: 1 });
FeatureListingSchema.index({ featureCategory: 1, status: 1 });
FeatureListingSchema.index({ featureCategory: 1, isFeatured: 1 });
FeatureListingSchema.index({ price: 1 }); // Index for price-based queries
FeatureListingSchema.index({ featureCategory: 1, price: 1 }); // Compound index for category + price queries

// Static Methods

/**
 * Get count of currently featured listings
 */
FeatureListingSchema.statics.getFeaturedCount = async function(): Promise<number> {
  return await this.countDocuments({ isFeatured: true });
};

/**
 * Check if a new listing can be marked as featured (max 6 limit)
 */
FeatureListingSchema.statics.canBeFeatured = async function(): Promise<boolean> {
  const featuredCount = await this.getFeaturedCount();
  return featuredCount < 6;
};

/**
 * Get the next available featured order number (1-6)
 */
FeatureListingSchema.statics.getNextFeaturedOrder = async function(): Promise<number> {
  const featuredListings = await this.find({ 
    isFeatured: true,
    featuredOrder: { $ne: null }
  }).select('featuredOrder');
  
  const usedOrders = featuredListings
    .map((listing: IFeatureListing) => listing.featuredOrder)
    .filter((order: number | null): order is number => order !== null);
  
  // Find first available number from 1 to 6
  for (let i = 1; i <= 6; i++) {
    if (!usedOrders.includes(i)) {
      return i;
    }
  }
  
  // Fallback (shouldn't reach here due to limit)
  return 1;
};

/**
 * Toggle featured status of a feature listing
 * Enforces maximum 6 featured listings limit
 */
FeatureListingSchema.statics.toggleFeatured = async function(
  featureListingId: string
): Promise<IFeatureListing | null> {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Find the feature listing
    const featureListing = await this.findById(featureListingId).session(session);
    if (!featureListing) {
      throw new Error('Feature listing not found');
    }
    
    const newFeaturedStatus = !featureListing.isFeatured;
    
    // If trying to mark as featured
    if (newFeaturedStatus) {
      const canBeFeatured = await this.canBeFeatured();
      if (!canBeFeatured) {
        throw new Error('Maximum 6 featured listings reached. Please remove one first.');
      }
      
      // Get next available order
      const nextOrder = await this.getNextFeaturedOrder();
      featureListing.featuredOrder = nextOrder;
    } else {
      // Removing from featured
      featureListing.featuredOrder = null;
    }
    
    featureListing.isFeatured = newFeaturedStatus;
    await featureListing.save({ session });
    
    await session.commitTransaction();
    return featureListing;
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get all listings by feature category
 */
FeatureListingSchema.statics.getByFeatureCategory = async function(
  categoryId: string
): Promise<IFeatureListing[]> {
  return await this.find({ 
    featureCategory: categoryId,
    status: 'active' 
  })
  .populate('featureCategory', 'name description type')
  .sort({ createdAt: -1 });
};

/**
 * Get all featured listings (max 6)
 */
FeatureListingSchema.statics.getFeaturedListings = async function(): Promise<IFeatureListing[]> {
  return await this.find({ 
    isFeatured: true,
    status: 'active' 
  })
  .populate('featureCategory', 'name description type')
  .sort({ featuredOrder: 1, createdAt: -1 })
  .limit(6);
};

// Instance Methods

/**
 * Mark this feature listing as featured
 */
FeatureListingSchema.methods.markAsFeatured = async function(): Promise<void> {
  const Model = this.constructor as FeatureListingModel;
  
  // Check if already featured
  if (this.isFeatured) {
    throw new Error('Feature listing is already featured');
  }
  
  // Check limit
  const canBeFeatured = await Model.canBeFeatured();
  if (!canBeFeatured) {
    throw new Error('Maximum 6 featured listings reached. Please remove one first.');
  }
  
  // Get next available order
  const nextOrder = await Model.getNextFeaturedOrder();
  
  this.isFeatured = true;
  this.featuredOrder = nextOrder;
  await this.save();
};

/**
 * Remove this feature listing from featured
 */
FeatureListingSchema.methods.removeFromFeatured = async function(): Promise<void> {
  if (!this.isFeatured) {
    throw new Error('Feature listing is not featured');
  }
  
  this.isFeatured = false;
  this.featuredOrder = null;
  await this.save();
};

// Middleware
FeatureListingSchema.pre('save', async function(next) {
  const Model = this.constructor as FeatureListingModel;
  
  // Validate that referenced feature category exists and is active
  if (this.isModified('featureCategory') || this.isNew) {
    try {
      const FeatureCategory = mongoose.model('FeatureCategory');
      const category = await FeatureCategory.findById(this.featureCategory);
      
      if (!category) {
        throw new Error('Referenced feature category does not exist');
      }
      
      if (category.status !== 'active') {
        throw new Error('Cannot link to an inactive feature category');
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  
  // If marking as featured, validate limit (max 6)
  if (this.isModified('isFeatured') && this.isFeatured) {
    const featuredCount = await Model.getFeaturedCount();
    
    const currentDocCount = this.isNew ? 1 : 0;
    
    if (featuredCount + currentDocCount > 6) {
      throw new Error('Maximum 6 featured listings allowed');
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

// Middleware for image validation
FeatureListingSchema.pre('save', function(next) {
  if (this.image && !this.image.trim()) {
    return next(new Error('Image URL cannot be empty'));
  }
  next();
});

// Middleware for price formatting (optional)
FeatureListingSchema.pre('save', function(next) {
  // Round price to 2 decimal places if needed
  if (this.price && typeof this.price === 'number') {
    this.price = Math.round(this.price * 100) / 100;
  }
  next();
});

// Virtual for formatted data (includes price)
FeatureListingSchema.virtual('formatted').get(function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    image: this.image,
    price: this.price,
    status: this.status,
    isFeatured: this.isFeatured,
    featuredOrder: this.featuredOrder,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

// Virtual for formatted price (with currency symbol)
FeatureListingSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for category details
FeatureListingSchema.virtual('categoryDetails', {
  ref: 'FeatureCategory',
  localField: 'featureCategory',
  foreignField: '_id',
  justOne: true
});

// Create and export the model
const FeatureListing = mongoose.model<IFeatureListing, FeatureListingModel>(
  'FeatureListing', 
  FeatureListingSchema
);

export default FeatureListing;
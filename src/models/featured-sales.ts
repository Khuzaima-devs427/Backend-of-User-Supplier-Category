import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for FeaturedSale document
export interface IFeaturedSale extends Document {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for FeaturedSale model
export interface IFeaturedSaleModel extends Model<IFeaturedSale> {
  // You can add static methods here if needed
}

const featuredSaleSchema = new Schema<IFeaturedSale>({
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  subtitle: {
    type: String,
    required: [true, 'Subtitle is required'],
    trim: true,
    maxlength: [200, 'Subtitle cannot be more than 200 characters']
  },
  buttonText: {
    type: String,
    required: [true, 'Button text is required'],
    trim: true,
    maxlength: [50, 'Button text cannot be more than 50 characters']
  },
  buttonLink: {
    type: String,
    required: [true, 'Button link is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  displayOrder: {
    type: Number,
    required: [true, 'Display order is required'],
    min: [1, 'Display order must be at least 1'],
    default: 1
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // We're handling timestamps manually
});

// Update the updatedAt field on save
featuredSaleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field on update
featuredSaleSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Ensure displayOrder is unique
featuredSaleSchema.index({ displayOrder: 1 }, { unique: true });

// Create text index for search functionality
featuredSaleSchema.index({ 
  title: 'text', 
  subtitle: 'text',
  buttonText: 'text',
  buttonLink: 'text'
});

// Create and export the model
const FeaturedSale: IFeaturedSaleModel = mongoose.model<IFeaturedSale, IFeaturedSaleModel>('FeaturedSale', featuredSaleSchema);

export default FeaturedSale;
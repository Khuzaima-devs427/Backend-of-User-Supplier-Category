// models/HeroSlider.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for HeroSlider document
export interface IHeroSlider extends Document {
  image: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for HeroSlider model
export interface IHeroSliderModel extends Model<IHeroSlider> {
  // You can add static methods here if needed
}

const heroSliderSchema = new Schema<IHeroSlider>({
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
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
heroSliderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field on update
heroSliderSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Ensure displayOrder is unique
heroSliderSchema.index({ displayOrder: 1 }, { unique: true });

// Create text index for search functionality
heroSliderSchema.index({ 
  title: 'text', 
  buttonText: 'text',
  buttonLink: 'text'
});

// Create and export the model
const HeroSlider: IHeroSliderModel = mongoose.model<IHeroSlider, IHeroSliderModel>('HeroSlider', heroSliderSchema);

export default HeroSlider;
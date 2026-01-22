import mongoose, { Document, Schema, Model } from 'mongoose';

// Review Image Interface
export interface IReviewImage {
  url: string;
  publicId?: string;
  uploadedAt: Date;
}

// Main Review Interface
export interface IReview extends Document {
  listingId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  userEmail: string;
  rating: number;
  title: string;
  content: string;
  images?: IReviewImage[];
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  helpfulVoters: string[]; 
  reportCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual property
  formattedDate: string;
  
  // Methods
  markHelpful(userIdentifier: string): Promise<IReview>;
  report(): Promise<IReview>;
}

// Static Methods Interface
interface ReviewModel extends Model<IReview> {
  getAverageRating(listingId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: number[];
  }>;
  hasUserReviewed(listingId: string, userEmail: string): Promise<boolean>;
}

// Review Schema
const ReviewSchema = new Schema<IReview, ReviewModel>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'FeatureListing',
      required: [true, 'Listing ID is required'],
      index: true
    },
    
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'FeatureCategory',
      required: [true, 'Category ID is required'],
      index: true
    },
    
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
      index: true
    },
    
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer'
      }
    },
    
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    
    content: {
      type: String,
      required: [true, 'Review content is required'],
      trim: true,
      minlength: [10, 'Review content must be at least 10 characters'],
      maxlength: [1000, 'Review content cannot exceed 1000 characters']
    },
    
    images: [{
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    
    helpfulVotes: {
      type: Number,
      default: 0
    },
    
    helpfulVoters: [{
      type: String,
      index: true
    }],
    
    reportCount: {
      type: Number,
      default: 0
    },
    
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.helpfulVoters;
        delete ret.isDeleted;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes
ReviewSchema.index({ listingId: 1, status: 1 });
ReviewSchema.index({ listingId: 1, rating: 1 });
ReviewSchema.index({ listingId: 1, createdAt: -1 });
ReviewSchema.index({ userEmail: 1, listingId: 1 }, { unique: true });

// Virtual for formatted date
ReviewSchema.virtual('formattedDate').get(function(this: IReview) {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Static method: Calculate average rating for a listing
ReviewSchema.statics.getAverageRating = async function(listingId: string) {
  const result = await this.aggregate([
    {
      $match: {
        listingId: new mongoose.Types.ObjectId(listingId),
        status: 'approved',
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$listingId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  return result[0] || { 
    averageRating: 0, 
    totalReviews: 0, 
    ratingDistribution: [] 
  };
};

// Static method: Check if user has already reviewed
ReviewSchema.statics.hasUserReviewed = async function(
  listingId: string, 
  userEmail: string
): Promise<boolean> {
  const review = await this.findOne({
    listingId,
    userEmail,
    isDeleted: false
  });
  return !!review;
};

// Instance method: Mark review as helpful
ReviewSchema.methods.markHelpful = function(
  this: IReview, 
  userIdentifier: string
): Promise<IReview> {
  if (!this.helpfulVoters.includes(userIdentifier)) {
    this.helpfulVoters.push(userIdentifier);
    this.helpfulVotes += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method: Report a review
ReviewSchema.methods.report = function(this: IReview): Promise<IReview> {
  this.reportCount += 1;
  if (this.reportCount >= 5) {
    this.status = 'pending';
  }
  return this.save();
};

// Pre-save middleware to ensure data consistency
ReviewSchema.pre<IReview>('save', function(next) {
  // Ensure email is lowercase
  if (this.userEmail) {
    this.userEmail = this.userEmail.toLowerCase().trim();
  }
  
  // Ensure rating is integer
  if (this.rating) {
    this.rating = Math.round(this.rating);
  }
  
  next();
});

// Create and export the model
const Review: ReviewModel = mongoose.models.Review as ReviewModel || 
  mongoose.model<IReview, ReviewModel>('Review', ReviewSchema);

export default Review;
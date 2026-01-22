import { Request, Response } from 'express';
import Review, { IReview } from '../models/reviews';
import mongoose from 'mongoose';

// Type for express request with user info
interface AuthRequest extends Request {
  user?: {
    email: string;
    id: string;
  };
}

// ============ INLINE TYPE DEFINITIONS ============

// Review Image Interface
interface IReviewImage {
  url: string;
  uploadedAt: Date;
}

// Review Response Interface (what we send to frontend)
interface ReviewResponse {
  _id: string;
  listingId: string;
  categoryId: string;
  userEmail: string;
  rating: number;
  title: string;
  content: string;
  images?: IReviewImage[];
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  reportCount: number;
  formattedDate: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create Review DTO (Data Transfer Object for creating)
interface CreateReviewDto {
  listingId: string;
  categoryId: string;
  userEmail?: string; // Optional since we might get it from auth
  rating: number;
  title: string;
  content: string;
  images?: Array<{
    url: string;
    publicId?: string;
  }>;
  isVerifiedPurchase?: boolean;
}

// Update Review DTO
interface UpdateReviewDto {
  rating?: number;
  title?: string;
  content?: string;
  images?: Array<{
    url: string;
    publicId?: string;
  }>;
  status?: 'pending' | 'approved' | 'rejected';
}

// ============ HELPER FUNCTIONS ============

// Helper function to transform review to response format
const transformReviewToResponse = (review: IReview): ReviewResponse => {
  return {
    _id: review._id.toString(),
    listingId: review.listingId.toString(),
    categoryId: review.categoryId.toString(),
    userEmail: review.userEmail,
    rating: review.rating,
    title: review.title,
    content: review.content,
    images: review.images?.map(img => ({
      url: img.url,
      uploadedAt: img.uploadedAt
    })),
    status: review.status,
    isVerifiedPurchase: review.isVerifiedPurchase,
    helpfulVotes: review.helpfulVotes,
    reportCount: review.reportCount,
    formattedDate: review.formattedDate,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt
  };
};

// Helper function to cast lean documents
const castToIReview = (reviewDoc: any): IReview => {
  return reviewDoc as unknown as IReview;
};

// ============ CONTROLLER FUNCTIONS ============

// Create a new review
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const {
      listingId,
      categoryId,
      rating,
      title,
      content,
      images,
      isVerifiedPurchase = false
    }: CreateReviewDto = req.body;

    // Get user email from authenticated user or request body
    const userEmail = req.user?.email || req.body.userEmail;
    
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    // Validate required fields
    if (!listingId || !categoryId || !rating || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'All fields (listingId, categoryId, rating, title, content) are required'
      });
    }

    // Check if user has already reviewed this listing
    const hasReviewed = await Review.hasUserReviewed(listingId, userEmail);
    if (hasReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Create new review
    const review = new Review({
      listingId: new mongoose.Types.ObjectId(listingId),
      categoryId: new mongoose.Types.ObjectId(categoryId),
      userEmail,
      rating,
      title,
      content,
      images: images || [],
      isVerifiedPurchase,
      status: 'pending' // Default status, can be auto-approved based on rules
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be visible after approval.',
      data: transformReviewToResponse(review)
    });

  } catch (error: any) {
    console.error('Error creating review:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get reviews for a specific listing
export const getReviewsByListing = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { 
      status = 'approved', 
      page = 1, 
      limit = 10,
      sortBy = 'helpfulVotes',
      sortOrder = 'desc',
      minRating,
      maxRating
    } = req.query;

    // Validate listingId
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID'
      });
    }

    // Build query
    const query: any = {
      listingId: new mongoose.Types.ObjectId(listingId),
      isDeleted: false
    };

    // Filter by status
    if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
      query.status = status;
    }

    // Filter by rating range
    if (minRating) {
      query.rating = { $gte: parseInt(minRating as string) };
    }
    if (maxRating) {
      query.rating = { ...query.rating, $lte: parseInt(maxRating as string) };
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    sort.createdAt = -1; // Secondary sort by newest

    // Execute query
    const reviews = await Review.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / limitNum);

    // Get average rating and stats
    const stats = await Review.getAverageRating(listingId);

    res.status(200).json({
      success: true,
      data: {
        reviews: reviews.map(review => transformReviewToResponse(castToIReview(review))),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalReviews,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        stats: {
          averageRating: stats.averageRating.toFixed(1),
          totalReviews: stats.totalReviews,
          ratingDistribution: {
            1: stats.ratingDistribution.filter(r => r === 1).length,
            2: stats.ratingDistribution.filter(r => r === 2).length,
            3: stats.ratingDistribution.filter(r => r === 3).length,
            4: stats.ratingDistribution.filter(r => r === 4).length,
            5: stats.ratingDistribution.filter(r => r === 5).length
          }
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get reviews by category
export const getReviewsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({
      categoryId: new mongoose.Types.ObjectId(categoryId),
      status: 'approved',
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('listingId', 'name image price')
      .lean();

    const totalReviews = await Review.countDocuments({
      categoryId: new mongoose.Types.ObjectId(categoryId),
      status: 'approved',
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: {
        reviews: reviews.map(review => ({
          ...transformReviewToResponse(castToIReview(review)),
          listing: review.listingId
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalReviews / limitNum),
          totalReviews
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching category reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching category reviews'
    });
  }
};

// Get a single review by ID
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transformReviewToResponse(review)
    });

  } catch (error: any) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching review'
    });
  }
};

// Update a review
export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateReviewDto = req.body;
    const userEmail = req.user?.email;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    // Find review
    const review = await Review.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check permission (user can only update their own review unless admin)
    const isOwner = review.userEmail === userEmail;
    const isAdmin = req.user?.email === 'admin@example.com'; // Replace with your admin check

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this review'
      });
    }

    // Only allow status update for admins
    if (updateData.status && !isAdmin) {
      delete updateData.status;
    }

    // Update fields
    Object.assign(review, updateData);
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: transformReviewToResponse(review)
    });

  } catch (error: any) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating review'
    });
  }
};

// Delete a review (soft delete)
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check permission
    const isOwner = review.userEmail === userEmail;
    const isAdmin = req.user?.email === 'admin@example.com'; // Replace with your admin check

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review'
      });
    }

    // Soft delete
    review.isDeleted = true;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting review'
    });
  }
};

// Mark review as helpful
export const markHelpful = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userIdentifier = req.user?.email || req.ip; // Use email or IP as identifier

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findOne({
      _id: new mongoose.Types.ObjectId(id),
      status: 'approved',
      isDeleted: false
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.markHelpful(userIdentifier);

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulVotes: review.helpfulVotes
      }
    });

  } catch (error: any) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking review as helpful'
    });
  }
};

// Report a review
export const reportReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }

    const review = await Review.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.report();

    res.status(200).json({
      success: true,
      message: 'Review reported successfully',
      data: {
        reportCount: review.reportCount,
        status: review.status
      }
    });

  } catch (error: any) {
    console.error('Error reporting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reporting review'
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const { page = 1, limit = 10 } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({
      userEmail,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('listingId', 'name image')
      .lean();

    const totalReviews = await Review.countDocuments({
      userEmail,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: {
        reviews: reviews.map(review => ({
          ...transformReviewToResponse(castToIReview(review)),
          listing: review.listingId
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalReviews / limitNum),
          totalReviews
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user reviews'
    });
  }
};

// Get listing review statistics
export const getListingReviewStats = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID'
      });
    }

    const stats = await Review.getAverageRating(listingId);
    
    // Get review count by rating
    const ratingCounts = await Review.aggregate([
      {
        $match: {
          listingId: new mongoose.Types.ObjectId(listingId),
          status: 'approved',
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format rating distribution
    const ratingDistribution: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingCounts.forEach((item: any) => {
      ratingDistribution[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        listingId,
        averageRating: parseFloat(stats.averageRating.toFixed(1)),
        totalReviews: stats.totalReviews,
        ratingDistribution
      }
    });

  } catch (error: any) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching review statistics'
    });
  }
};
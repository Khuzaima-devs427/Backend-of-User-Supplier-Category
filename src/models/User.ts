// models/User.ts
import mongoose, { Schema, Document, CallbackError, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaces
export interface IAddress {
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  houseNumber: string;
  postalCode: string;
}

export interface IUser extends Document {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
  signUpThrough: string;
  isEmailVerified: boolean;
  userType?: Schema.Types.ObjectId;
  categoryType: string; 
  supplierCategory?: Schema.Types.ObjectId;
  address?: IAddress;
  isBlocked: boolean;
  role?: 'user' | 'admin';
  isActive?: boolean;
  additionalAccessRights: string[];
  restrictedAccessRights: string[];
  additionalDocuments: any[];
  supplierKey?: string;
  isSupervisor: boolean;
  geofencingRadius: number;
  geofencingAttendanceEnabled: boolean;
  annualLeaveEntitlement: number;
  annualLeaveCarriedForward: number;
  profileCompleted: boolean;
  profileCompletionPercentage: number;
  isAffiliated: boolean;
  teamAssignments: any[];
  supervisorTeams: any[];
  annualLeaveYear: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    trim: true,
    default: function(this: IUser) {
      return `${this.firstName} ${this.lastName}`;
    }
  },
  firstName: {
    type: String,
    required: false,
    trim: true
  },
  lastName: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: true
  },
  signUpThrough: {
    type: String,
    default: 'Web'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  userType: {
    type: Schema.Types.ObjectId,
    ref: 'UserCategory',
    required: false
  },
  categoryType: { // <-- ADD THIS FIELD
    type: String,
    enum: ['Supplier', 'User', 'Admin', 'Super Admin', 'Other', 'Customer'],
    default: 'Customer'
  },
  supplierCategory: {
    type: Schema.Types.ObjectId,
    ref: 'SupplierCategory'
  },
  address: {
    country: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    streetAddress: { type: String, default: '' },
    houseNumber: { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  additionalAccessRights: {
    type: [String],
    default: []
  },
  restrictedAccessRights: {
    type: [String],
    default: []
  },
  additionalDocuments: {
    type: [Schema.Types.Mixed],
    default: []
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  supplierKey: {
    type: String
  },
  isSupervisor: {
    type: Boolean,
    default: false
  },
  geofencingRadius: {
    type: Number,
    default: 500
  },
  geofencingAttendanceEnabled: {
    type: Boolean,
    default: false
  },
  annualLeaveEntitlement: {
    type: Number,
    default: 20
  },
  annualLeaveCarriedForward: {
    type: Number,
    default: 0
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profileCompletionPercentage: {
    type: Number,
    default: 0
  },
  isAffiliated: {
    type: Boolean,
    default: false
  },
  teamAssignments: {
    type: [Schema.Types.Mixed],
    default: []
  },
  supervisorTeams: {
    type: [Schema.Types.Mixed],
    default: []
  },
  annualLeaveYear: {
    type: Number,
    default: new Date().getFullYear()
  }
}, {
  timestamps: true
});

// ==================== MIDDLEWARE ====================

// Hash password before saving
UserSchema.pre('save', async function(this: IUser, next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error as CallbackError);
  }
});

// IMPORTANT: TEMPORARILY DISABLE SUPPLIER VALIDATION FOR TESTING
// Remove this middleware temporarily to see if supplier creation works
// UserSchema.pre('save', async function(this: IUser, next) {
//   if (this.supplierCategory) {
//     try {
//       const userCat = await mongoose.model('UserCategory').findById(this.userType);
//       if (!userCat || userCat.categoryType !== 'Supplier') {
//         return next(new Error('Suppliers must have a user category of type "Supplier"') as CallbackError);
//       }
//     } catch (error) {
//       return next(error as CallbackError);
//     }
//   }
//   next();
// });

// BETTER FIX: Validate supplier logic with better error handling
UserSchema.pre('save', async function(this: IUser, next) {
  // Only validate if supplierCategory is provided
  if (this.supplierCategory && this.supplierCategory.toString().trim() !== '') {
    console.log('🔍 Validating supplier creation...');
    console.log('UserType ID:', this.userType);
    console.log('SupplierCategory ID:', this.supplierCategory);
    
    try {
      const userCat = await mongoose.model('UserCategory').findById(this.userType);
      console.log('Found UserCategory:', userCat);
      
      if (!userCat) {
        console.error('❌ UserCategory not found for ID:', this.userType);
        return next(new Error('User category not found. Please select a valid user category.') as CallbackError);
      }
      
      // Check if the UserCategory has categoryType 'Supplier'
      if (userCat.categoryType !== 'Supplier') {
        console.error('❌ UserCategory type mismatch. Expected: Supplier, Got:', userCat.categoryType);
        return next(new Error(`Selected user category is "${userCat.categoryType}" but should be "Supplier" for suppliers.`) as CallbackError);
      }
      
      console.log('✅ Supplier validation passed');
      next();
    } catch (error: any) {
      console.error('❌ Error in supplier validation:', error.message);
      return next(new Error(`Validation error: ${error.message}`) as CallbackError);
    }
  } else {
    // If no supplierCategory, it's a regular user - just continue
    next();
  }
});

// ==================== METHODS ====================

UserSchema.methods.comparePassword = async function(
  this: IUser, 
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ==================== STATICS ====================

interface UserModel extends Model<IUser> {
  findByEmail(email: string): mongoose.Query<IUser | null, IUser>;
  findUsers(): mongoose.Query<IUser[], IUser>;
  findSuppliers(): mongoose.Query<IUser[], IUser>;
}

UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email })
    .populate('userType', 'role categoryType description')
    .populate('supplierCategory', 'name productCategories productType');
};

UserSchema.statics.findUsers = function() {
  return this.find({ supplierCategory: { $exists: false } })
    .populate('userType', 'role categoryType description')
    .select('-password')
    .sort({ createdAt: -1 });
};

UserSchema.statics.findSuppliers = function() {
  return this.find({ supplierCategory: { $exists: true } })
    .populate('userType', 'role categoryType description')
    .populate('supplierCategory', 'name productCategories productType description image')
    .select('-password')
    .sort({ createdAt: -1 });
};

// ==================== INDEXES ====================

UserSchema.index({ email: 1 });
UserSchema.index({ userType: 1 });
UserSchema.index({ supplierCategory: 1 });
UserSchema.index({ isBlocked: 1 });
UserSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text' 
});

export const User = mongoose.model<IUser, UserModel>('User', UserSchema, 'users');
import { Schema, model, Model, Document } from 'mongoose';

// Interface for Announcement document
export interface IAnnouncement extends Document {
  announcement: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const announcementSchema = new Schema<IAnnouncement>(
  {
    announcement: {
      type: String,
      required: [true, 'Announcement text is required'],
      trim: true,
      maxlength: [500, 'Announcement cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

// Index for faster queries on status
announcementSchema.index({ status: 1 });

// Pre-save hook to ensure only one active announcement at a time
announcementSchema.pre('save', async function (next) {
  if (this.status === 'active') {
    try {
      await AnnouncementModel.updateMany(
        { _id: { $ne: this._id } },
        { $set: { status: 'inactive' } }
      );
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});

// Model
const AnnouncementModel: Model<IAnnouncement> = model<IAnnouncement>(
  'Announcement',
  announcementSchema
);

export default AnnouncementModel;
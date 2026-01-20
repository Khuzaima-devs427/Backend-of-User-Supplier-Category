import { Request, Response } from 'express';
import AnnouncementModel, { IAnnouncement } from '../models/announcement_bar';

// Create announcement
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { announcement, status } = req.body;

    // Validate required fields
    if (!announcement) {
      return res.status(400).json({
        success: false,
        message: 'Announcement text is required'
      });
    }

    // Create new announcement
    const newAnnouncement: IAnnouncement = await AnnouncementModel.create({
      announcement,
      status: status || 'inactive'
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: newAnnouncement
    });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
};

// Get all announcements
export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await AnnouncementModel.find()
      .sort({ createdAt: -1 }) // Latest first
      .select('-__v'); // Exclude version key

    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

// Get active announcement
export const getActiveAnnouncement = async (req: Request, res: Response) => {
  try {
    const activeAnnouncement = await AnnouncementModel.findOne({ status: 'active' })
      .select('-__v');

    if (!activeAnnouncement) {
      return res.status(404).json({
        success: false,
        message: 'No active announcement found'
      });
    }

    return res.status(200).json({
      success: true,
      data: activeAnnouncement
    });
  } catch (error: any) {
    console.error('Error fetching active announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching active announcement',
      error: error.message
    });
  }
};

// Get announcement by ID
export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const announcement = await AnnouncementModel.findById(id)
      .select('-__v');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error: any) {
    console.error('Error fetching announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
};

// Update announcement
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { announcement, status } = req.body;

    // Check if announcement exists
    const existingAnnouncement = await AnnouncementModel.findById(id);
    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Update announcement
    const updatedAnnouncement = await AnnouncementModel.findByIdAndUpdate(
      id,
      { 
        ...(announcement && { announcement }),
        ...(status && { status })
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    ).select('-__v');

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    });
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if announcement exists
    const announcement = await AnnouncementModel.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Delete announcement
    await AnnouncementModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
};

// Toggle announcement status
export const toggleAnnouncementStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const announcement = await AnnouncementModel.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Toggle status
    const newStatus = announcement.status === 'active' ? 'inactive' : 'active';
    
    const updatedAnnouncement = await AnnouncementModel.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true, runValidators: true }
    ).select('-__v');

    return res.status(200).json({
      success: true,
      message: `Announcement ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: updatedAnnouncement
    });
  } catch (error: any) {
    console.error('Error toggling announcement status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error toggling announcement status',
      error: error.message
    });
  }
};

// Get announcement statistics
export const getAnnouncementStats = async (req: Request, res: Response) => {
  try {
    const total = await AnnouncementModel.countDocuments();
    const active = await AnnouncementModel.countDocuments({ status: 'active' });
    const inactive = await AnnouncementModel.countDocuments({ status: 'inactive' });

    return res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive
      }
    });
  } catch (error: any) {
    console.error('Error fetching announcement stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching announcement statistics',
      error: error.message
    });
  }
};
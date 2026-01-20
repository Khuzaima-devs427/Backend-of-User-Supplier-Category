import { Router } from 'express';
import {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  getAnnouncementStats
} from '../controllers/announcementBarController';

const router = Router();

// Public routes
router.get('/active', getActiveAnnouncement); // Get active announcement
router.get('/', getAllAnnouncements,); // Get all announcements (with optional filters)

// Admin/protected routes
router.post('/', createAnnouncement); // Create new announcement
router.get('/:id', getAnnouncementById); // Get single announcement by ID
router.put('/:id', updateAnnouncement); // Update announcement
router.delete('/:id', deleteAnnouncement); // Delete announcement
router.patch('/:id/toggle-status', toggleAnnouncementStatus); // Toggle status (active/inactive)

// Add stats route
router.get('/stats', getAnnouncementStats);  // Add this line

export default router;
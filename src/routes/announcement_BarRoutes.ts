import { Router } from 'express';
import {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  getAnnouncementStats,
  activateSingleAnnouncement // ADD THIS IMPORT
} from '../controllers/announcementBarController';

const router = Router();

// Public routes
router.get('/active', getActiveAnnouncement);
router.get('/', getAllAnnouncements);

// Admin/protected routes
router.post('/', createAnnouncement);
router.get('/:id', getAnnouncementById);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);
router.patch('/:id/toggle-status', toggleAnnouncementStatus);

// Add stats route
router.get('/stats', getAnnouncementStats);

// ADD THIS NEW ROUTE
router.patch('/activate-single', activateSingleAnnouncement);

export default router;
import { Router } from 'express';
import {
  getPublicAnnouncements, getAnnouncements, getAnnouncement,
  createAnnouncement, updateAnnouncement, deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Public — no auth required
router.get('/public', getPublicAnnouncements);

// Protected routes
router.use(protect);

router.route('/')
  .get(getAnnouncements)
  .post(authorize('admin', 'teacher'), createAnnouncement);

router.route('/:id')
  .get(getAnnouncement)
  .put(authorize('admin', 'teacher'), updateAnnouncement)
  .delete(authorize('admin'), deleteAnnouncement);

export default router;

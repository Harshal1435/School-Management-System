import { Router } from 'express';
import {
  getNotifications, markAsRead, markAllRead, sendNotification, deleteNotification,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/',                 getNotifications);
router.put('/mark-all-read',    markAllRead);
router.post('/',                authorize('admin', 'teacher'), sendNotification);
router.put('/:id/read',         markAsRead);
router.delete('/:id',           deleteNotification);

export default router;

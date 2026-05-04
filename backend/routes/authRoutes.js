import { Router } from 'express';
import { login, register, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { protect ,authorize} from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login',           login);
router.post('/register',        register);
router.get('/me',               protect, getMe);
router.put('/profile',          protect, updateProfile);
router.put('/change-password',  protect, changePassword);

// List all users — admin/accountant only (for salary employee picker)
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
router.get('/users', protect, authorize('admin', 'accountant'), asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true, role: { $in: ['teacher', 'admin', 'accountant', 'staff'] } })
    .select('name email role phone')
    .sort({ name: 1 });
  res.json({ success: true, users });
}));

export default router;

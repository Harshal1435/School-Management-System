import { Router } from 'express';
import {
  submitAdmission, getAdmissions, getAdmission, updateAdmission, checkAdmissionStatus,
} from '../controllers/admissionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

// Public routes
router.post('/',                              upload.array('documents', 5), submitAdmission);
router.get('/status/:applicationNumber',      checkAdmissionStatus);

// Protected admin routes
router.use(protect);
router.get('/',     authorize('admin'), getAdmissions);
router.get('/:id',  authorize('admin'), getAdmission);
router.put('/:id',  authorize('admin'), updateAdmission);

export default router;

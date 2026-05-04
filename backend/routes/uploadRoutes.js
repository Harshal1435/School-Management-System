import { Router } from 'express';
import { uploadProfileImage, uploadDocument, uploadDocuments } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(protect);

router.post('/profile-image', upload.single('profileImage'),    uploadProfileImage);
router.post('/document',      upload.single('document'),        uploadDocument);
router.post('/documents',     upload.array('documents', 10),    uploadDocuments);

export default router;

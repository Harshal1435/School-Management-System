import { Router } from 'express';
import {
  getTimetable, getClassTimetable, getTeacherTimetable,
  createTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
} from '../controllers/timetableController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/class/:classId',     getClassTimetable);
router.get('/teacher/:teacherId', getTeacherTimetable);

router.route('/')
  .get(authorize('admin'), getTimetable)
  .post(authorize('admin'), createTimetableEntry);

router.route('/:id')
  .put(authorize('admin'), updateTimetableEntry)
  .delete(authorize('admin'), deleteTimetableEntry);

export default router;

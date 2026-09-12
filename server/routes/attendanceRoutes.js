import { Router } from 'express';
import {
  markAttendance,
  getStudentAttendance,
  getSubjectAttendance,
} from '../controllers/attendanceController.js';
import { getSessionAttendance } from '../controllers/sessionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.post('/mark', authorize('student'), markAttendance);
router.get('/student/:studentId', authorize('admin', 'teacher', 'student'), getStudentAttendance);
router.get('/subject/:subjectId', authorize('admin', 'teacher'), getSubjectAttendance);
router.get('/session/:sessionId', authorize('admin', 'teacher'), getSessionAttendance);

export default router;

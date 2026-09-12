import { Router } from 'express';
import {
  studentReport,
  classReport,
  subjectReport,
  adminOverview,
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/overview', authorize('admin'), adminOverview);
router.get('/student/:id', authorize('admin', 'teacher', 'student'), studentReport);
router.get('/class/:classId', authorize('admin', 'teacher'), classReport);
router.get('/subject/:subjectId', authorize('admin', 'teacher'), subjectReport);

export default router;

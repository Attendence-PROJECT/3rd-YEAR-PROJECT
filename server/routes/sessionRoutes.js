import { Router } from 'express';
import {
  createSession,
  listSessions,
  getSession,
  closeSession,
  getSessionAttendance,
} from '../controllers/sessionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.post('/', authorize('teacher'), createSession);
router.get('/', authorize('admin', 'teacher'), listSessions);
router.get('/:id', authorize('admin', 'teacher'), getSession);
router.post('/:id/close', authorize('teacher'), closeSession);
router.get('/:id/attendance', authorize('admin', 'teacher'), getSessionAttendance);

export default router;

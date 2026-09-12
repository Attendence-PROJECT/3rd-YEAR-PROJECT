import { Router } from 'express';
import { register, login, me, seedAdmin } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/seed-admin', seedAdmin);

export default router;

// routes/authRoutes.ts
import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser
} from '../controllers/register-loginController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes - Remove validation middleware for now
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);

export default router;
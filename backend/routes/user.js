// routes/user.js
import express from 'express';
import passport from 'passport';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserPreferences, 
  updateUserPreferences 
} from '../controllers/userController.js';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = passport.authenticate('jwt', { session: false });

// Get user profile
router.get('/profile', isAuthenticated, getUserProfile);

// Update user profile
router.put('/profile', isAuthenticated, updateUserProfile);

// Get user preferences
router.get('/preferences', isAuthenticated, getUserPreferences);

// Update user preferences
router.put('/preferences', isAuthenticated, updateUserPreferences);

export default router;

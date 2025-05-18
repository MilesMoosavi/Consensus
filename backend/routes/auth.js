// routes/auth.js
import express from 'express';
import passport from 'passport';
import { 
  generateToken, 
  getAuthStatus, 
  logout, 
  verifyToken 
} from '../controllers/authController.js';

const router = express.Router();

// Google OAuth Login Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback Route
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user);
    
    // In production, redirect to the frontend with the token
    if (process.env.NODE_ENV === 'production') {
      res.redirect(`https://consensus-seven.vercel.app/auth/success?token=${token}`);
    } else {
      // In development
      res.redirect(`http://localhost:5173/auth/success?token=${token}`);
    }
  }
);

// Check Authentication Status
router.get('/status', getAuthStatus);

// Logout Route
router.get('/logout', logout);

// Verify JWT Token
router.get('/verify-token', passport.authenticate('jwt', { session: false }), verifyToken);

export default router;

// controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'consensus-jwt-secret',
    { expiresIn: '7d' }
  );
};

// Get authenticated user status
export const getAuthStatus = (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ 
      isAuthenticated: true, 
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
        profilePicture: req.user.profilePicture
      }
    });
  }
  
  return res.status(200).json({ isAuthenticated: false });
};

// Handle logout
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

// Verify JWT token
export const verifyToken = (req, res) => {
  res.status(200).json({ 
    isValid: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      displayName: req.user.displayName,
      profilePicture: req.user.profilePicture
    }
  });
};

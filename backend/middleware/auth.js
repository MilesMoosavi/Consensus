// middleware/auth.js
import passport from 'passport';

// Middleware to verify JWT token
export const authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware to check if user is authenticated via session
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ message: 'Unauthorized - Not authenticated' });
};

// Check if a valid JWT token exists
export const checkJWTAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
    
    req.user = user;
    return next();
  })(req, res, next);
};

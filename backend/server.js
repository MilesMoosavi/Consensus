import './loadEnv.js'; // Import and execute environment loader first

// server.js
// import dotenv from 'dotenv'; // Handled by loadEnv.js
// import path from 'path'; // path can still be imported if needed elsewhere, but not for dotenv here
// import { fileURLToPath } from 'url'; // fileURLToPath can still be imported if needed elsewhere

// Determine __dirname for ES modules (if still needed by server.js directly)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Explicitly configure dotenv path - THIS BLOCK IS NOW HANDLED BY loadEnv.js
// const envPath = path.resolve(__dirname, '.env');
// const result = dotenv.config({ path: envPath });

// if (result.error) {
//   console.error('[server.js] Error loading .env file:', result.error);
// }
// console.log(`[server.js] Attempting to load .env from: ${envPath}`); // loadEnv.js logs this
// console.log('[server.js] Parsed .env variables by dotenv:', result.parsed); // loadEnv.js can log this if uncommented
console.log('[server.js] GOOGLE_CLIENT_ID (as seen by server.js):', process.env.GOOGLE_CLIENT_ID);
console.log('[server.js] Current Working Directory (CWD):', process.cwd());


import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
// import mongoose from 'mongoose'; // Commented out
import passport from 'passport';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import conversationRoutes from './routes/conversation.js';
import modelsRoutes from './routes/models.js';
import promptRoutes from './routes/prompt.js';
import consensusRoutes from './routes/consensus.js';

// Import passport configuration
import './config/passport.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://consensus-seven.vercel.app' 
    : 'http://localhost:5173',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'consensus-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
/* Commented out MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
*/

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/prompt', promptRoutes);
app.use('/api/consensus', consensusRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: err.message || 'Something went wrong on the server'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

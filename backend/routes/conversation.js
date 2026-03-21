// routes/conversation.js
import express from 'express';
import { checkJWTAuth } from '../middleware/auth.js';
import { 
  getAllConversations,
  getConversation,
  createConversation,
  updateConversation,
  addMessage,
  deleteConversation
} from '../controllers/conversationController.js';

const router = express.Router();

// Get all user conversations
router.get('/', checkJWTAuth, getAllConversations);

// Get a specific conversation
router.get('/:id', checkJWTAuth, getConversation);

// Create a new conversation
router.post('/', checkJWTAuth, createConversation);

// Update a conversation
router.put('/:id', checkJWTAuth, updateConversation);

// Add a message to a conversation
router.post('/:id/messages', checkJWTAuth, addMessage);

// Delete a conversation
router.delete('/:id', checkJWTAuth, deleteConversation);

export default router;

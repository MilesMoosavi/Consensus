// controllers/conversationController.js
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// Get all user conversations
export const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt');
    
    res.status(200).json({ conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific conversation
export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    res.status(200).json({ conversation });
  } catch (err) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const { title, messages, activeModels, modelSettings } = req.body;
    
    const newConversation = new Conversation({
      user: req.user._id,
      title: title || 'New Conversation',
      messages: messages || [],
      activeModels: activeModels || [],
      modelSettings: modelSettings || {}
    });
    
    await newConversation.save();
    
    // Add conversation to user's conversations list
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { conversations: newConversation._id } }
    );
    
    res.status(201).json({ conversation: newConversation });
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a conversation
export const updateConversation = async (req, res) => {
  try {
    const { title, messages, activeModels, modelSettings } = req.body;
    
    // Find the conversation and verify ownership
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Update fields
    if (title) conversation.title = title;
    if (messages) conversation.messages = messages;
    if (activeModels) conversation.activeModels = activeModels;
    if (modelSettings) conversation.modelSettings = modelSettings;
    
    await conversation.save();
    
    res.status(200).json({ conversation });
  } catch (err) {
    console.error('Error updating conversation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a message to a conversation
export const addMessage = async (req, res) => {
  try {
    const { role, content, modelResponses, consensus } = req.body;
    
    if (!role || !content) {
      return res.status(400).json({ message: 'Role and content are required' });
    }
    
    // Find the conversation and verify ownership
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Add new message
    conversation.messages.push({
      role,
      content,
      modelResponses: modelResponses || {},
      consensus: consensus || {},
      timestamp: new Date()
    });
    
    await conversation.save();
    
    res.status(201).json({ 
      message: 'Message added successfully',
      conversation
    });
  } catch (err) {
    console.error('Error adding message to conversation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a conversation
export const deleteConversation = async (req, res) => {
  try {
    // Find and delete the conversation
    const deletedConversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!deletedConversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Remove from user's conversations list
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { conversations: req.params.id } }
    );
    
    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

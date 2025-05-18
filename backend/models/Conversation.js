// models/Conversation.js
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      modelResponses: {
        type: Map,
        of: {
          modelId: String,
          modelName: String,
          content: String,
          timestamp: Date
        }
      },
      consensus: {
        content: String,
        timestamp: Date
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  activeModels: [String],
  modelSettings: {
    type: Map,
    of: {
      useInternet: Boolean,
      temperature: Number,
      maxTokens: Number,
      visible: Boolean
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp when conversation is modified
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;

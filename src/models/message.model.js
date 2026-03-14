// back-end/src/models/messageModel.js
import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      default: null, // chỉ có ở role='assistant'
    },
    tokens: {
      type: Number,
      default: null,
    },
    latency: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export const MessageModel = mongoose.model('Message', messageSchema)

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
    deleted: { type: Boolean, default: false },
    intent: { type: String, default: null },
    risk_level: { type: String, default: null },
    confidence: { type: String, default: null },
    blocked: { type: Boolean, default: false },
    warnings: { type: [String], default: [] },
    sources: { type: [mongoose.Schema.Types.Mixed], default: [] }
  },
  {
    timestamps: true,
  }
)

export const MessageModel = mongoose.model('Message', messageSchema)

// back-end/src/models/conversationModel.js
import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Cuộc hội thoại mới',
    },
    // session_id trả về từ AI server — dùng để gọi tiếp các request sau
    aiSessionId: {
      type: String,
      default: null,
    },
    // model đang dùng trong conversation này
    model: {
      type: String,
      default: 'qwen-7b',
    },
  },
  {
    timestamps: true, // tự tạo createdAt, updatedAt
  }
)

export const ConversationModel = mongoose.model('Conversation', conversationSchema)

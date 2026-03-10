import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    // Liên kết với bảng User qua ObjectId
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Đoạn chat mới' }
  },
  { timestamps: true }
);

export const ConversationModel = mongoose.model('Conversation', conversationSchema);
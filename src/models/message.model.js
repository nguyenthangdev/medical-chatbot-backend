import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    tokens: { type: Number },
    model: { type: String }, // Lưu tên model AI đã dùng (vd: gpt-3.5, gemini-pro...)
    latency: { type: String } // Thời gian phản hồi của bot
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model('Message', messageSchema);
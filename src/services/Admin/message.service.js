import { MessageModel } from '../../models/message.model.js';
import { ConversationModel } from '../../models/conversation.model.js';

// 1. Tạo tin nhắn mới
const createMessage = async (data) => {
  // Kiểm tra xem conversationId có tồn tại trong DB không trước khi lưu tin nhắn
  const conversationExist = await ConversationModel.findById(data.conversationId);
  if (!conversationExist) {
    throw new Error('Đoạn chat không tồn tại!');
  }

  const newMessage = await MessageModel.create(data);
  return newMessage;
};

// 2. Lấy danh sách tin nhắn CỦA MỘT ĐOẠN CHAT (Sắp xếp cũ nhất -> mới nhất giống giao diện chat)
const getMessagesByConversation = async (conversationId) => {
  const messages = await MessageModel.find({ conversationId: conversationId })
    .sort({ createdAt: 1 }); // 1 là tăng dần (cũ đến mới)
    
  return messages;
};

// 3. Xóa một tin nhắn (Dành cho Admin nếu cần dọn dẹp)
const deleteMessage = async (messageId) => {
  const deletedMessage = await MessageModel.findByIdAndDelete(messageId);
  if (!deletedMessage) {
    throw new Error('Tin nhắn không tồn tại!');
  }
  return deletedMessage;
};

export const messageService = { createMessage, getMessagesByConversation, deleteMessage };
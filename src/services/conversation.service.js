import { ConversationModel } from '../models/conversation.model.js';

// 1. Lấy danh sách cuộc hội thoại
const getList = async () => {
  const conversations = await ConversationModel.find()
    .sort({ createdAt: -1 })
    // populate sẽ lấy thông tin từ bảng User đắp vào trường userId
    // select: 'fullName email' chỉ lấy đúng 2 trường này của User để data trả về không bị quá nặng
    .populate({ path: 'userId', select: 'fullName email' }); 
    
  return conversations;
};

// 2. Lấy chi tiết 1 cuộc hội thoại
const getDetail = async (id) => {
  const conversation = await ConversationModel.findById(id)
    .populate({ path: 'userId', select: 'fullName email avatar' });
    
  if (!conversation) {
    throw new Error('Cuộc hội thoại không tồn tại!');
  }
  return conversation;
};

// 3. Sửa tiêu đề cuộc hội thoại
const updateConversation = async (id, updateData) => {
  const updatedConversation = await ConversationModel.findByIdAndUpdate(
    id,
    { title: updateData.title },
    { new: true }
  ).populate({ path: 'userId', select: 'fullName email' });

  if (!updatedConversation) {
    throw new Error('Cập nhật thất bại, không tìm thấy cuộc hội thoại!');
  }
  return updatedConversation;
};

// 4. Xóa cuộc hội thoại (Xóa thật - Hard Delete vì bảng này bạn không thiết kế trường deleted)
const deleteConversation = async (id) => {
  const result = await ConversationModel.findByIdAndDelete(id);
  if (!result) {
    throw new Error('Xóa thất bại, không tìm thấy cuộc hội thoại!');
  }
  return result;
};

export const conversationService = { getList, getDetail, updateConversation, deleteConversation };
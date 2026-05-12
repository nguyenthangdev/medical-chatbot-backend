import mongoose from 'mongoose';
import { ConversationModel } from '../../models/conversation.model.js';
import { UserModel } from '../../models/user.model.js';
import searchHelpers from '../../helpers/search.helper.js';
import paginationHelpers from '../../helpers/pagination.helper.js';

const getList = async (query) => {
  const find = { deleted: false };
  const objectSearch = searchHelpers(query);

  if (objectSearch.regex) {
    const matchingUsers = await UserModel.find({
      fullName: objectSearch.regex
    }).select('_id');
    const userIds = matchingUsers.map(user => user._id);

    const orConditions = [
      { title: objectSearch.regex },       
      { userId: { $in: userIds } }        
    ];

    if (mongoose.Types.ObjectId.isValid(objectSearch.keyword)) {
      orConditions.push({ _id: objectSearch.keyword }); // Tìm theo ID
    }

    find.$or = orConditions;
  }

  // Phân trang
  const countConversations = await ConversationModel.countDocuments(find);
  const objectPagination = paginationHelpers(
    { currentPage: 1, limitItems: 10, skip: 0, totalPage: 0, totalItems: 0 },
    query,
    countConversations
  );

  const conversations = await ConversationModel.find(find)
    .sort({ createdAt: -1 })
    .skip(objectPagination.skip)
    .limit(objectPagination.limitItems)
    .populate({ path: 'userId', select: 'fullName email' })
    .lean();

  return {
    conversations,
    objectSearch,
    objectPagination
  };
};

const getDetail = async (id) => {
  const conversation = await ConversationModel.findOne({ _id: id, deleted: false })
    .populate({ path: 'userId', select: 'fullName email avatar' });
    
  if (!conversation) {
    throw new Error('Cuộc hội thoại không tồn tại hoặc đã bị xóa!');
  }
  return conversation;
};

const deleteConversation = async (id) => {
  const result = await ConversationModel.findByIdAndUpdate(
    id, 
    { deleted: true }, 
    { new: true }
  );
  
  if (!result) {
    throw new Error('Xóa thất bại, không tìm thấy cuộc hội thoại!');
  }
  return result;
};

export const conversationService = { getList, getDetail, deleteConversation };
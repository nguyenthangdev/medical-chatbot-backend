import mongoose from 'mongoose';
import { MessageModel } from '../../models/message.model.js';
import { ConversationModel } from '../../models/conversation.model.js';
import searchHelpers from '../../helpers/search.helper.js';
import paginationHelpers from '../../helpers/pagination.helper.js';

const createMessage = async (data) => {
  const conversationExist = await ConversationModel.findById(data.conversationId);
  if (!conversationExist) {
    throw new Error('Đoạn chat không tồn tại!');
  }
  return await MessageModel.create(data);
};

const getMessagesByConversation = async (conversationId) => {
  return await MessageModel.find({ conversationId: conversationId, deleted: false })
    .sort({ createdAt: 1 });
};

const getAllMessages = async (query) => {
  const find = { deleted: false };
  const objectSearch = searchHelpers(query);

  if (query.conversationId && mongoose.Types.ObjectId.isValid(query.conversationId)) {
    find.conversationId = query.conversationId;
  }

  if (objectSearch.keyword) {
    if (mongoose.Types.ObjectId.isValid(objectSearch.keyword)) {
      find.$or = [
        { _id: objectSearch.keyword },
        { conversationId: objectSearch.keyword }
      ];
    } else {
      find._id = null; 
    }
  }

  // Phân trang
  const countMessages = await MessageModel.countDocuments(find);
  const objectPagination = paginationHelpers(
    { currentPage: 1, limitItems: 10, skip: 0, totalPage: 0, totalItems: 0 },
    query,
    countMessages
  );

  const messages = await MessageModel.find(find)
    .sort({ createdAt: -1 }) 
    .skip(objectPagination.skip)
    .limit(objectPagination.limitItems)
    .lean();

  return { messages, objectSearch, objectPagination };
};

const getMessageDetail = async (messageId) => {
  const message = await MessageModel.findOne({ _id: messageId, deleted: false }).lean();
  if (!message) {
    throw new Error('Tin nhắn không tồn tại hoặc đã bị xóa!');
  }
  return message;
};

const deleteMessage = async (messageId) => {
  const deletedMessage = await MessageModel.findByIdAndUpdate(
    messageId,
    { deleted: true },
    { new: true }
  );
  if (!deletedMessage) {
    throw new Error('Tin nhắn không tồn tại!');
  }
  return deletedMessage;
};

const toggleMessageStatus = async (messageId) => {
  const msg = await MessageModel.findById(messageId);
  if (!msg) throw new Error("Không tìm thấy tin nhắn");
  
  msg.status = msg.status === 'active' ? 'inactive' : 'active';
  await msg.save();
  return msg;
};

export const messageService = { 
  createMessage, 
  getMessagesByConversation, 
  getAllMessages,
  getMessageDetail,
  deleteMessage,
  toggleMessageStatus
};
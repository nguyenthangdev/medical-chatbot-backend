import { StatusCodes } from 'http-status-codes';
import { messageService } from '../../services/Admin/message.service.js';

const createMessage = async (req, res) => {
  try {
    const newMessage = await messageService.createMessage(req.body);
    res.status(StatusCodes.CREATED).json({
      message: 'Tạo tin nhắn thành công',
      data: newMessage
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

const getByConversation = async (req, res) => {
  try {
    const messages = await messageService.getMessagesByConversation(req.params.conversationId);
    res.status(StatusCodes.OK).json({ data: messages });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const { messages, objectSearch, objectPagination } = await messageService.getAllMessages(req.query);
    res.status(StatusCodes.OK).json({ 
      data: messages,
      keyword: objectSearch.keyword,
      pagination: objectPagination
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getDetail = async (req, res) => {
  try {
    const message = await messageService.getMessageDetail(req.params.id);
    res.status(StatusCodes.OK).json({ data: message });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await messageService.deleteMessage(req.params.id);
    res.status(StatusCodes.OK).json({ message: 'Xóa tin nhắn thành công' });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const messageController = { createMessage, getByConversation, getAllMessages, getDetail, deleteMessage };
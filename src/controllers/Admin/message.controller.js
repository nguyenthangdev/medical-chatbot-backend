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
    const conversationId = req.params.conversationId;
    const messages = await messageService.getMessagesByConversation(conversationId);
    
    res.status(StatusCodes.OK).json({ data: messages });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
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

export const messageController = { createMessage, getByConversation, deleteMessage };
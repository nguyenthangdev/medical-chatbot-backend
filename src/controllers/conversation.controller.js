import { StatusCodes } from 'http-status-codes';
import { conversationService } from '../services/conversation.service.js';

const getList = async (req, res) => {
  try {
    const conversations = await conversationService.getList();
    res.status(StatusCodes.OK).json({ data: conversations });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getDetail = async (req, res) => {
  try {
    const conversation = await conversationService.getDetail(req.params.id);
    res.status(StatusCodes.OK).json({ data: conversation });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
  }
};

const updateConversation = async (req, res) => {
  try {
    const updated = await conversationService.updateConversation(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: 'Cập nhật tiêu đề thành công',
      data: updated
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

const deleteConversation = async (req, res) => {
  try {
    await conversationService.deleteConversation(req.params.id);
    res.status(StatusCodes.OK).json({ message: 'Xóa cuộc hội thoại thành công' });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const conversationController = { getList, getDetail, updateConversation, deleteConversation };
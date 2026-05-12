import { StatusCodes } from 'http-status-codes';
import { conversationService } from '../../services/Admin/conversation.service.js';

const getList = async (req, res) => {
  try {
    const { conversations, objectSearch, objectPagination } = await conversationService.getList(req.query);
    
    res.status(StatusCodes.OK).json({ 
      data: conversations,
      keyword: objectSearch.keyword,
      pagination: objectPagination
    });
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

const deleteConversation = async (req, res) => {
  try {
    await conversationService.deleteConversation(req.params.id);
    res.status(StatusCodes.OK).json({ message: 'Xóa cuộc hội thoại thành công' });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const conversationController = { getList, getDetail, deleteConversation };
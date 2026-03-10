import express from 'express';
import { messageController } from '../../controllers/message.controller.js';
import { messageValidation } from '../../validations/message.validation.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const Router = express.Router();

// Sử dụng middleware bảo mật
Router.use(verifyToken);

// POST /api/v1/messages -> Tạo tin nhắn mới
Router.route('/')
  .post(messageValidation.createMessage, messageController.createMessage);

// GET /api/v1/messages/conversation/:conversationId -> Lấy lịch sử chat của 1 conversation
Router.route('/conversation/:conversationId')
  .get(messageController.getByConversation);

// DELETE /api/v1/messages/:id -> Xóa tin nhắn theo ID
Router.route('/:id')
  .delete(messageController.deleteMessage);

export const messageRoute = Router;
import express from 'express';
import { messageController } from '../../../controllers/Admin/message.controller.js';
import { messageValidation } from '../../../validations/Admin/message.validation.js'

const Router = express.Router();

Router.route('/')
  .post(messageValidation.createMessage, messageController.createMessage);

// Lấy lịch sử chat của 1 conversation
Router.route('/conversation/:conversationId')
  .get(messageController.getByConversation);

// Xóa tin nhắn theo ID
Router.route('/:id')
  .delete(messageController.deleteMessage);

export const messageRoute = Router;
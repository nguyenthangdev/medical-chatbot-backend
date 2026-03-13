import express from 'express';
import { conversationController } from '../../../controllers/conversation.controller.js';
import { conversationValidation } from '../../../validations/conversation.validation.js';
// import { verifyToken } from '../../middlewares/auth.middleware.js';

const Router = express.Router();

// Yêu cầu token Admin cho tất cả thao tác
// Router.use(verifyToken);

Router.route('/')
  .get(conversationController.getList);

Router.route('/:id')
  .get(conversationController.getDetail)
  .patch(conversationValidation.updateConversation, conversationController.updateConversation)
  .delete(conversationController.deleteConversation);

export const conversationRoute = Router;
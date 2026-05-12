import express from 'express';
import { conversationController } from '../../../controllers/Admin/conversation.controller.js';
import { conversationValidation } from '../../../validations/Admin/conversation.validation.js';

const Router = express.Router();

Router.route('/')
  .get(conversationController.getList);

Router.route('/:id')
  .get(conversationController.getDetail)
  .delete(conversationController.deleteConversation);

export const conversationRoute = Router;
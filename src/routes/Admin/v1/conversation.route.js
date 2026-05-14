import express from 'express';
import { conversationController } from '../../../controllers/Admin/conversation.controller.js';

const Router = express.Router();

Router.route('/')
  .get(conversationController.getList);

Router.route('/:id')
  .get(conversationController.getDetail)
  .delete(conversationController.deleteConversation);

Router.route('/:id/toggle')
  .put(conversationController.toggleConversation)

export const conversationRoute = Router;
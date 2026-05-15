import express from 'express';
import { conversationController } from '../../../controllers/Admin/conversation.controller.js';
import { requirePermission } from '../../../middlewares/Admin/role.middleware.js'; 

const Router = express.Router();

Router.route('/')
  .get(conversationController.getList);

Router.route('/:id')
  .get(conversationController.getDetail)
  .delete(requirePermission('conversations_delete'), conversationController.deleteConversation);

Router.route('/:id/toggle')
  .put(requirePermission('conversations_edit'), conversationController.toggleConversation)

export const conversationRoute = Router;
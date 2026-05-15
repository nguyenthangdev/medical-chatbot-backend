import express from 'express';
import { userController } from '../../../controllers/Admin/user.controller.js';
import { requirePermission } from '../../../middlewares/Admin/role.middleware.js'; 

const Router = express.Router();

Router.route('/')
  .get(userController.getList);

Router.route('/:id')
  .get(userController.getDetail)
  .delete(requirePermission('users_delete'), userController.deleteUser)
  .patch(requirePermission('users_edit'), userController.updateUser);

export const userRoute = Router;
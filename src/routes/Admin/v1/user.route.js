import express from 'express';
import { userController } from '../../../controllers/Admin/user.controller.js';

const Router = express.Router();

Router.route('/')
  .get(userController.getList);

Router.route('/:id')
  .get(userController.getDetail)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

export const userRoute = Router;
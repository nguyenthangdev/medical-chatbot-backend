import express from 'express';
import { userController } from '../../../controllers/user.controller.js';
import { userValidation } from '../../../validations/user.validation.js';
// import { verifyToken } from '../../middlewares/auth.middleware.js';

const Router = express.Router();

// Tất cả API quản lý User đều cần Admin đăng nhập (phải có Token)
// Router.use(verifyToken);

// GET /api/v1/users -> Lấy danh sách
Router.route('/')
  .get(userController.getList);

// Truyền ID lên URL (VD: /api/v1/users/64f1a...)
Router.route('/:id')
  .get(userController.getDetail) // GET -> Lấy chi tiết
  .patch(userValidation.updateUser, userController.updateUser); // PATCH -> Sửa thông tin

export const userRoute = Router;
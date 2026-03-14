import express from 'express';
import { myAccountController } from '../../../controllers/myAccount.js';
import { myAccountValidation } from '../../../validations/myAccount.validation.js';
// import { verifyToken } from '../../middlewares/auth.middleware.js'; // Nhúng middleware

const Router = express.Router();

// Sử dụng middleware xác thực cho TẤT CẢ các API bên dưới
// Nếu không gửi Token, req sẽ bị chặn lại ở đây
// Router.use(verifyToken);

// Cả 2 API đều dùng chung endpoint là /api/v1/my-account
Router.route('/')
  .get(myAccountController.getMyProfile) // GET: Lấy thông tin
  .patch(myAccountValidation.updateMyProfile, myAccountController.updateMyProfile); // PATCH: Sửa thông tin

export const myAccountRoute = Router;
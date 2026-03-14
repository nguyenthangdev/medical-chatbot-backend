import express from 'express';
// Import từ thư mục Client thay vì Admin
import { authValidation } from '../../../validations/Client/auth.validation.js';
import { authController } from '../../../controllers/Client/auth.controller.js';

const Router = express.Router();

// POST /api/v1/register
Router.route('/register')
  .post(authValidation.registerClient, authController.registerClient);

// POST /api/v1/login
Router.route('/login')
  .post(authValidation.loginClient, authController.loginClient);

// POST /api/v1/refresh-token
Router.route('/refresh-token')
  .post(authController.refreshToken);

// DELETE /api/v1/logout
Router.route('/logout')
  .delete(authController.logout);

export const authRoute = Router;
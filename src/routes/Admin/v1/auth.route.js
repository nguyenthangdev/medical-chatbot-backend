import express from 'express';
import { authValidation } from '../../../validations/Admin/auth.validation.js';
import { authController } from '../../../controllers/Admin/auth.controller.js';

const Router = express.Router();

// POST /api/v1/auth/register
Router.route('/register')
  .post(authValidation.registerAdmin, authController.registerAdmin);

// POST /api/v1/auth/login
Router.route('/login')
  .post(authValidation.loginAdmin, authController.loginAdmin);

  // POST /api/v1/auth/refresh-token
Router.route('/refresh-token')
  .post(authController.refreshToken);

// DELETE /api/v1/auth/logout
Router.route('/logout')
  .delete(authController.logout);

export const authRoute = Router;
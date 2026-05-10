import express from 'express';
import { authValidation } from '../../../validations/Admin/auth.validation.js';
import { authController } from '../../../controllers/Admin/auth.controller.js';

const Router = express.Router();

Router.route('/register')
  .post(authValidation.registerAdmin, authController.registerAdmin);

Router.route('/login')
  .post(authValidation.loginAdmin, authController.loginAdmin);

Router.route('/refresh-token')
  .post(authController.refreshToken);

Router.route('/logout')
  .delete(authController.logout);

export const authRoute = Router;
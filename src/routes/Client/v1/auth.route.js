import express from 'express';
import { authValidation } from '../../../validations/Client/auth.validation.js';
import { authController } from '../../../controllers/Client/auth.controller.js';

const Router = express.Router();

Router.route('/register')
  .post(authValidation.registerClient, authController.registerClient);

Router.route('/verify-email')
  .get(authValidation.verifyEmail, authController.verifyEmail);

Router.route('/login')
  .post(authValidation.loginClient, authController.loginClient);

Router.route('/forgot-password')
  .post(authValidation.forgotPassword, authController.forgotPassword);

Router.route('/reset-password')
  .post(authValidation.resetPassword, authController.resetPassword);

Router.route('/refresh-token')
  .post(authController.refreshToken);

Router.route('/logout')
  .delete(authController.logout);

export const authRoute = Router;

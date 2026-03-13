import express from 'express';
import { authValidation } from '../../../validations/auth.validation.js';
import { authController } from '../../../controllers/auth.controller.js' 

const Router = express.Router();

// POST /api/v1/auth/admin/register
Router.route('/register')
  .post(authValidation.registerAdmin, authController.registerAdmin);

// POST /api/v1/auth/admin/login
Router.route('/login')
  .post(authValidation.loginAdmin, authController.loginAdmin);

export const authRoute = Router;